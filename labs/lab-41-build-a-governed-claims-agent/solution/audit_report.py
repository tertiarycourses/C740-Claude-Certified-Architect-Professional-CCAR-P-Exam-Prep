"""Query the audit log: what the agent did, what the gate stopped, what humans decided, and what it cost.
Run:  uv run audit_report.py
      uv run audit_report.py --trace <trace_id>     (one run, line by line)"""
import argparse
import json
import math
from collections import Counter
from pathlib import Path

PRICE_IN, PRICE_OUT = 0.10, 0.50          # claude-haiku-5-5, US$ per million tokens
AUDIT = Path(__file__).parent / "audit.jsonl"


def percentile(values, p):
    values = sorted(values)
    return values[max(0, min(len(values) - 1, math.ceil(p / 100 * len(values)) - 1))] if values else 0


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description="Report on audit.jsonl.")
    ap.add_argument("--trace")
    a = ap.parse_args()
    lines = [json.loads(x) for x in AUDIT.read_text(encoding="utf-8").splitlines() if x.strip()]
    if a.trace:
        for r in (r for r in lines if r["trace_id"] == a.trace):
            what = r["tool"] or f"model stop_reason={r['stop_reason']}"
            print(f"{r['ts']}  turn {r['turn'] or '-'}  {r['event']:6} {what:22} {r['decision'] or '':15} "
                  f"{r['latency_ms'] if r['latency_ms'] is not None else '-'} ms  {r['reason'] or ''}")
        raise SystemExit(0)
    model = [r for r in lines if r["event"] == "model"]
    tools = [r for r in lines if r["event"] == "tool"]
    human = [r for r in lines if r["event"] == "human"]
    tokens_in = sum(r["input_tokens"] for r in model)
    tokens_out = sum(r["output_tokens"] for r in model)
    total = (tokens_in * PRICE_IN + tokens_out * PRICE_OUT) / 1_000_000
    traces = {r["trace_id"] for r in model}
    paid = [r for r in tools if r["tool"] == "approve_payout" and r["decision"] == "allow"]
    print(f"Runs (traces): {len(traces)}   model calls: {len(model)}   tool calls: {len(tools)}")
    print(f"Tool decisions: {dict(Counter(r['decision'] for r in tools))}")
    print(f"Calls per tool: {dict(Counter(r['tool'] for r in tools))}")
    print(f"\nApprovals by the agent: {len(paid)}, total ${sum(r['input']['amount'] for r in paid):,.2f}")
    for r in paid:
        print(f"  {r['claim_id']}  ${r['input']['amount']:,.2f}  trace {r['trace_id']}")
    stopped = [r for r in tools if r["decision"] in ("queued", "deny")]
    print(f"Stopped by the gate: {len(stopped)}")
    for r in stopped:
        print(f"  {r['decision'].upper():6} {r['claim_id']}  {r['tool']}  {json.dumps(r['input'].get('amount'))}  trace {r['trace_id']}")
    print(f"Human decisions: {len(human)}")
    for r in human:
        print(f"  {r['decision']:15} {r['claim_id']}  ${r['input']['amount']:,.2f}  by {r['role']}")
    print(f"\nTokens: {tokens_in} in / {tokens_out} out   cost US${total:.4f}   "
          f"per run US${total / max(len(traces), 1):.4f}")
    lat = [r["latency_ms"] for r in model]
    print(f"Model latency p50 / p95: {percentile(lat, 50)} / {percentile(lat, 95)} ms")
    print(f"stop_reasons: {dict(Counter(r['stop_reason'] for r in model))}")
