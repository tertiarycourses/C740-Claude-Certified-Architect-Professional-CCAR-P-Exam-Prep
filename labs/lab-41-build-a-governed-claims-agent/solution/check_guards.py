"""Check the gate and the redaction on their own. No Claude call.
Run:  uv run check_guards.py"""
import json

from guards import pre_tool_use, redact
from tools import run_tool

for amount in (3700, 7400, -50):
    print(f"approve_payout ${amount}: {pre_tool_use('approve_payout', {'claim_id': 'CLM-7811', 'amount': amount})}")
print(f"get_claim: {pre_tool_use('get_claim', {'claim_id': 'CLM-7811'})}")
for name, args in [("get_policy", {"policy_id": "HM-POL-2201"}), ("get_claim", {"claim_id": "CLM-7811"})]:
    result, _ = run_tool(name, args, "triage")
    print(f"\n{name} redacted: {json.dumps(redact(result))}")
