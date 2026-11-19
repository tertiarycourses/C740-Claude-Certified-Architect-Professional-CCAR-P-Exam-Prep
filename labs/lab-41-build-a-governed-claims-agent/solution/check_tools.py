"""Check the tools and the role tool sets on their own. No Claude call.
Run:  uv run check_tools.py"""
import json

from tools import ROLES, TOOLS, run_tool

for role, names in ROLES.items():
    print(f"{role:10} {len(names)} tools: {', '.join(names)}")
risky = [n for n in TOOLS if any(w in n for w in ("delete", "export", "update"))]
print(f"delete/export/update tools anywhere: {risky or 'none'}")
for name, args, role in [("get_claim", {"claim_id": "CLM-7781"}, "settlement"),
                         ("approve_payout", {"claim_id": "CLM-7790", "amount": 18600, "reason": "total loss"}, "settlement"),
                         ("approve_payout", {"claim_id": "CLM-7781", "amount": 3700, "reason": "test"}, "triage")]:
    result, is_error = run_tool(name, args, role)
    print(f"[{role}] {name}({args}) -> is_error {is_error} {json.dumps(result)[:160]}")
