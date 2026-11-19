"""Guardrails that run in code, outside the model:
- pre_tool_use: a PreToolUse-style gate. approve_payout above the agent's US$5,000 authority never runs: the
  decision is "ask", and the agent queues it for a human adjuster (queue_for_human). Anything malformed is denied
  (fail closed).
- redact: strips policyholder PII from every tool result before the model sees it."""
import json
import re
import uuid
from datetime import datetime, timezone
from pathlib import Path

APPROVAL_LIMIT_USD = 5000          # the agent's payout authority lives here, and only here
QUEUE = Path(__file__).parent / "approval_queue.jsonl"
PII_KEYS = {"email", "phone", "national_id", "date_of_birth", "address", "bank_account"}
PATTERNS = [(re.compile(r"[\w.+-]+@[\w-]+\.[\w.]+"), "[EMAIL]"),
            (re.compile(r"\+\d[\d ]{8,}\d"), "[PHONE]"),
            (re.compile(r"\bHB-\d{4}-\d{4}-\d{2}\b"), "[ACCOUNT]")]


def pre_tool_use(tool_name, tool_input):
    """Runs before EVERY tool call. A pure decision, no side effects. Returns {"decision": "allow"},
    {"decision": "deny", "reason"} (never runs) or {"decision": "ask", "reason"} (a human must decide)."""
    if tool_name != "approve_payout":
        return {"decision": "allow"}
    amount = tool_input.get("amount")
    if not isinstance(amount, (int, float)) or isinstance(amount, bool) or amount <= 0:
        return {"decision": "deny", "reason": "Blocked: approve_payout needs a positive numeric amount."}
    if amount > APPROVAL_LIMIT_USD:
        return {"decision": "ask", "reason": f"Payout of ${amount:,.0f} is above the agent's payout authority."}
    return {"decision": "allow"}


def queue_for_human(tool_input, trace_id):
    """Put a payout the agent may not make into approval_queue.jsonl for a human adjuster. Returns the approval_id."""
    approval_id = "APR-" + uuid.uuid4().hex[:6].upper()
    entry = {"approval_id": approval_id, "ts": datetime.now(timezone.utc).isoformat(timespec="seconds"),
             "trace_id": trace_id, "claim_id": tool_input.get("claim_id"), "amount": tool_input.get("amount"),
             "reason": tool_input.get("reason", ""), "status": "pending"}
    with QUEUE.open("a", encoding="utf-8") as f:
        f.write(json.dumps(entry) + "\n")
    return approval_id


def redact(value):
    """Replace PII fields with [REDACTED] and mask emails, phone numbers and bank accounts inside any text."""
    if isinstance(value, dict):
        return {k: "[REDACTED]" if k in PII_KEYS else redact(v) for k, v in value.items()}
    if isinstance(value, list):
        return [redact(v) for v in value]
    if isinstance(value, str):
        for pattern, mask in PATTERNS:
            value = pattern.sub(mask, value)
    return value
