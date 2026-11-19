"""The human approval queue: a human adjuster approves or rejects payouts the agent was not allowed to make.
Run:  uv run approve.py                                   (list pending approvals)
      uv run approve.py APR-XXXXXX approve --by "Sam Lee"
      uv run approve.py APR-XXXXXX reject --by "Sam Lee" """
import argparse
import json

from agent import audit
from guards import QUEUE
from tools import run_tool


def load_queue():
    if not QUEUE.exists():
        return []
    return [json.loads(line) for line in QUEUE.read_text(encoding="utf-8").splitlines() if line.strip()]


def save_queue(entries):
    QUEUE.write_text("".join(json.dumps(e) + "\n" for e in entries), encoding="utf-8")


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description="Review payouts queued for human approval.")
    ap.add_argument("approval_id", nargs="?")
    ap.add_argument("action", nargs="?", choices=["approve", "reject"])
    ap.add_argument("--by", default="adjuster", help="the name of the human who decides")
    a = ap.parse_args()
    entries = load_queue()
    if not a.approval_id:
        pending = [e for e in entries if e["status"] == "pending"]
        print(f"{len(pending)} pending approval(s)")
        for e in pending:
            print(f"  {e['approval_id']}  {e['claim_id']}  ${e['amount']:,.2f}  trace {e['trace_id']}  {e['reason'][:70]}")
        raise SystemExit(0)
    entry = next((e for e in entries if e["approval_id"] == a.approval_id), None)
    if entry is None or entry["status"] != "pending":
        raise SystemExit(f"{a.approval_id} is not a pending approval.")
    if not a.action:
        raise SystemExit("Say approve or reject.")
    ids = {"trace_id": entry["trace_id"], "role": f"human:{a.by}", "claim_id": entry["claim_id"], "event": "human",
           "tool": "approve_payout", "input": {"claim_id": entry["claim_id"], "amount": entry["amount"]}}
    if a.action == "approve":
        # The human's authority, not the agent's: the payout runs directly, outside the model loop.
        result, is_error = run_tool("approve_payout", {"claim_id": entry["claim_id"], "amount": entry["amount"],
                                                       "reason": f"Approved by {a.by} ({a.approval_id})"}, "settlement")
        entry["status"] = "approved" if not is_error else "failed"
        audit(**ids, decision="human_approved" if not is_error else "error", reason=result.get("message"),
              is_error=is_error)
        print(f"{a.approval_id}: {entry['status']} by {a.by} -> {json.dumps(result)}")
    else:
        entry["status"] = "rejected"
        audit(**ids, decision="human_rejected", reason=f"Rejected by {a.by}", is_error=False)
        print(f"{a.approval_id}: rejected by {a.by}. No payout.")
    entry["decided_by"] = a.by
    save_queue(entries)
