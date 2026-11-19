"""Harbour Mutual's governed claims agent: a manual agentic loop on claude-haiku-5-5 with least-privilege tools per
role, the PreToolUse gate, PII redaction and a JSON-lines audit log (audit.jsonl).
Run:  uv run agent.py CLM-7781                  (settlement role)
      uv run agent.py CLM-7781 --role triage"""
import argparse
import json
import time
import uuid
from datetime import datetime, timezone
from pathlib import Path

import anthropic
from dotenv import load_dotenv

from guards import pre_tool_use, queue_for_human, redact
from tools import ROLES, run_tool, tools_for

load_dotenv()
MODEL = "claude-haiku-5-5"
MAX_TURNS = 10
AUDIT = Path(__file__).parent / "audit.jsonl"
SYSTEM = """You are Harbour Mutual's motor-claims agent. You process one claim for the claims desk.
1. Read the claim with get_claim, then its policy with get_policy.
2. If the policy does not cover the claim type, do not pay. Draft a "declined" letter that explains why, and
   escalate_to_adjuster so a human confirms the decline.
3. If the assessment is not complete, call request_assessment and draft a "pending" letter. Do not pay.
4. If the claim is covered and assessed, the payout is the assessed amount minus the policy excess. If you have
   approve_payout, approve it and draft an "approved" letter. If you do not have approve_payout, escalate_to_adjuster
   with the recommended payout.
5. If a tool result says a payout was queued for human approval, do not retry it. Draft a "pending" letter.
6. Personal data in tool results is redacted. Never ask for it or try to work around it.
End with two lines for the claims desk: the outcome, and the amount paid or recommended."""


def audit(**record):
    """Append one JSON line to audit.jsonl. Every line has the same keys, so it is easy to query."""
    keys = ["trace_id", "role", "claim_id", "turn", "event", "tool", "input", "decision", "reason", "is_error",
            "input_tokens", "output_tokens", "latency_ms", "stop_reason"]
    line = {"ts": datetime.now(timezone.utc).isoformat(timespec="milliseconds")} | {k: record.get(k) for k in keys}
    with AUDIT.open("a", encoding="utf-8") as f:
        f.write(json.dumps(line) + "\n")


def run_agent(claim_id, role="settlement"):
    """Process one claim. Returns {"trace_id", "text", "calls", "messages"}."""
    client = anthropic.Anthropic()
    trace_id = uuid.uuid4().hex[:12]
    ids = {"trace_id": trace_id, "role": role, "claim_id": claim_id}
    messages = [{"role": "user", "content": f"Process claim {claim_id}."}]
    calls = []
    print(f"trace_id={trace_id} role={role} tools={ROLES[role]}")
    for turn in range(1, MAX_TURNS + 1):
        start = time.perf_counter()
        response = client.messages.create(model=MODEL, max_tokens=4096, system=SYSTEM, tools=tools_for(role),
                                          messages=messages)
        latency_ms = round((time.perf_counter() - start) * 1000)
        audit(**ids, turn=turn, event="model", input_tokens=response.usage.input_tokens,
              output_tokens=response.usage.output_tokens, latency_ms=latency_ms, stop_reason=response.stop_reason)
        print(f"\nTurn {turn}: stop_reason={response.stop_reason} ({response.usage.input_tokens} in / "
              f"{response.usage.output_tokens} out tokens, {latency_ms} ms)")
        messages.append({"role": "assistant", "content": response.content})
        if response.stop_reason != "tool_use":
            text = "".join(b.text for b in response.content if b.type == "text")
            return {"trace_id": trace_id, "text": text, "calls": calls, "messages": messages}
        results = []
        for block in response.content:
            if block.type != "tool_use":
                continue
            start = time.perf_counter()
            gate = pre_tool_use(block.name, block.input)
            if gate["decision"] == "allow":
                result, is_error = run_tool(block.name, block.input, role)
                result = redact(result)                                   # PII never reaches the model
                decision = "allow" if not is_error else "error"
                reason = result.get("message") if is_error else None
            elif gate["decision"] == "ask":
                approval_id = queue_for_human(block.input, trace_id)
                decision, reason, is_error = "queued", f"{gate['reason']} Queued as {approval_id}.", True
                result = {"status": "queued_for_human_approval", "approval_id": approval_id,
                          "message": (f"{gate['reason']} It has been queued for a human adjuster as {approval_id}. "
                                      "Do not call approve_payout again for this claim. Draft a 'pending' letter.")}
            else:
                decision, reason, is_error = "deny", gate["reason"], True
                result = {"status": "denied", "message": gate["reason"]}
            tool_ms = round((time.perf_counter() - start) * 1000)
            audit(**ids, turn=turn, event="tool", tool=block.name, input=block.input, decision=decision,
                  reason=reason, is_error=is_error, latency_ms=tool_ms)
            print(f"  {block.name}({json.dumps(block.input)[:110]}) -> {decision.upper()} {json.dumps(result)[:130]}")
            calls.append({"tool": block.name, "input": block.input, "decision": decision, "result": result,
                          "is_error": is_error})
            results.append({"type": "tool_result", "tool_use_id": block.id, "content": json.dumps(result),
                            "is_error": is_error})
        messages.append({"role": "user", "content": results})
    return {"trace_id": trace_id, "text": "(stopped: 10-turn limit)", "calls": calls, "messages": messages}


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description="Process one Harbour Mutual claim.")
    ap.add_argument("claim_id")
    ap.add_argument("--role", default="settlement", choices=list(ROLES))
    a = ap.parse_args()
    out = run_agent(a.claim_id, a.role)
    print("\n=== For the claims desk ===\n" + out["text"])
