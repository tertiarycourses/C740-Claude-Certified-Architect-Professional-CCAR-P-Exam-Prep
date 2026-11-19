"""Harbour Mutual's claims tools, with a least-privilege tool set per role. All data comes from harbour.json.
There is deliberately NO delete, export or policy-update tool: a capability the agent does not have cannot be misused."""
import json
import uuid
from datetime import datetime, timezone
from pathlib import Path

DATA = Path(__file__).parent / "harbour.json"
PAYOUTS = Path(__file__).parent / "payouts.jsonl"


class ToolFailure(Exception):
    def __init__(self, category, message):
        super().__init__(message)
        self.fields = {"errorCategory": category, "isRetryable": False, "message": message}


def _data():
    return json.loads(DATA.read_text(encoding="utf-8"))


def _find(items, key, value, what):
    for item in items:
        if item[key] == value:
            return item
    raise ToolFailure("not_found", f"No {what} {value}.")


def get_claim(claim_id):
    """Read one claim: its type, claimed amount, description and damage assessment. Use it first for every claim."""
    return _find(_data()["claims"], "claim_id", claim_id, "claim")


def get_policy(policy_id):
    """Read a policy (product, excess, what it covers, status) with its policyholder record. Use it after get_claim."""
    data = _data()
    policy = dict(_find(data["policies"], "policy_id", policy_id, "policy"))
    policy["policyholder"] = _find(data["policyholders"], "policyholder_id", policy["policyholder_id"], "policyholder")
    return policy


def request_assessment(claim_id, notes):
    """Ask a loss assessor to inspect the damage. Use it when the claim's assessment is not complete; never pay before it is."""
    claim = get_claim(claim_id)
    if claim["assessment"]["status"] == "complete":
        raise ToolFailure("validation", f"{claim_id} already has a complete assessment.")
    return {"assessment_id": "ASM-" + uuid.uuid4().hex[:6].upper(), "claim_id": claim_id, "status": "requested", "notes": notes}


def draft_letter(claim_id, outcome, body):
    """Draft the letter to the policyholder. outcome is approved, declined or pending. A human sends it; you only draft."""
    if outcome not in ("approved", "declined", "pending"):
        raise ToolFailure("validation", "outcome must be approved, declined or pending.")
    get_claim(claim_id)
    return {"letter_id": "LTR-" + uuid.uuid4().hex[:6].upper(), "claim_id": claim_id, "outcome": outcome, "status": "draft",
            "body": body}


def approve_payout(claim_id, amount, reason):
    """Pay a covered, assessed claim. amount = assessed amount minus the policy excess. Records the payout."""
    claim = get_claim(claim_id)
    policy = get_policy(claim["policy_id"])
    if claim["type"] not in policy["covers"]:
        raise ToolFailure("validation", f"{policy['product']} policy {policy['policy_id']} does not cover {claim['type']}.")
    if claim["assessment"]["status"] != "complete":
        raise ToolFailure("validation", f"{claim_id} has no complete assessment. Request one first.")
    limit = claim["assessment"]["assessed_usd"] - policy["excess_usd"]
    if not 0 < float(amount) <= limit:
        raise ToolFailure("validation", f"amount must be above 0 and at most {limit} (assessed amount minus excess).")
    payout = {"payout_id": "PAY-" + uuid.uuid4().hex[:6].upper(), "claim_id": claim_id, "amount": float(amount),
              "reason": reason, "status": "paid", "ts": datetime.now(timezone.utc).isoformat(timespec="seconds")}
    with PAYOUTS.open("a", encoding="utf-8") as f:
        f.write(json.dumps(payout) + "\n")
    return payout


def escalate_to_adjuster(claim_id, reason, recommended_action):
    """Hand the claim to a human adjuster. The adjuster cannot see this conversation: give the reason and a recommended action."""
    get_claim(claim_id)
    return {"ticket_id": "ADJ-" + uuid.uuid4().hex[:6].upper(), "claim_id": claim_id, "status": "queued",
            "reason": reason, "recommended_action": recommended_action}


FUNCTIONS = {f.__name__: f for f in (get_claim, get_policy, request_assessment, draft_letter, approve_payout,
                                     escalate_to_adjuster)}
SCHEMAS = {
    "get_claim": ({"claim_id": {"type": "string"}}, ["claim_id"]),
    "get_policy": ({"policy_id": {"type": "string"}}, ["policy_id"]),
    "request_assessment": ({"claim_id": {"type": "string"}, "notes": {"type": "string"}}, ["claim_id", "notes"]),
    "draft_letter": ({"claim_id": {"type": "string"},
                      "outcome": {"type": "string", "enum": ["approved", "declined", "pending"]},
                      "body": {"type": "string"}}, ["claim_id", "outcome", "body"]),
    "approve_payout": ({"claim_id": {"type": "string"}, "amount": {"type": "number"}, "reason": {"type": "string"}},
                       ["claim_id", "amount", "reason"]),
    "escalate_to_adjuster": ({"claim_id": {"type": "string"}, "reason": {"type": "string"},
                              "recommended_action": {"type": "string"}}, ["claim_id", "reason", "recommended_action"]),
}
TOOLS = {name: {"name": name, "description": FUNCTIONS[name].__doc__,
                "input_schema": {"type": "object", "properties": props, "required": req}}
         for name, (props, req) in SCHEMAS.items()}

# Least privilege: each role gets only the tools its job needs. Triage never moves money.
ROLES = {
    "triage": ["get_claim", "get_policy", "request_assessment", "draft_letter", "escalate_to_adjuster"],
    "settlement": ["get_claim", "get_policy", "request_assessment", "draft_letter", "approve_payout", "escalate_to_adjuster"],
}


def tools_for(role):
    """The Anthropic tool definitions for one role, and nothing else."""
    return [TOOLS[name] for name in ROLES[role]]


def run_tool(name, args, role):
    """Run one tool for a role. Returns (result, is_error). A tool outside the role is refused, even if asked for."""
    if name not in ROLES[role]:
        return {"errorCategory": "permission", "isRetryable": False,
                "message": f"Tool {name} is not available to the {role} role."}, True
    try:
        return FUNCTIONS[name](**args), False
    except ToolFailure as e:
        return e.fields, True
    except (TypeError, ValueError) as e:
        return {"errorCategory": "validation", "isRetryable": False, "message": str(e)}, True
