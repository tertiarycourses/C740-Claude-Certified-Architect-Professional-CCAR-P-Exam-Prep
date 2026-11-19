"""A/B test two configurations of the policy assistant on the same eval set, print a scorecard and apply a decision rule.
A (the current baseline): fixed 300-character chunks, k=4.   B (the candidate): heading-aware chunks, k=4.
Run:  uv run ab_test.py"""
import json
from datetime import datetime
from pathlib import Path

from evaluate import print_metrics, run_eval

A = {"name": "A fixed-300", "chunking": "fixed", "k": 4}
B = {"name": "B heading", "chunking": "heading", "k": 4}
ROWS = [("accuracy", "accuracy", "{:.0%}"), ("citation correctness", "citation_correctness", "{:.0%}"),
        ("refusal correctness", "refusal_correctness", "{:.0%}"), ("restricted leaks", "restricted_leaks", "{}"),
        ("judge mean score", "judge_mean_score", "{:.2f}"), ("latency p50 ms", "latency_p50_ms", "{}"),
        ("latency p95 ms", "latency_p95_ms", "{}"), ("cost per answer US$", "cost_per_answer", "{:.5f}")]


def decide(a, b):
    """The decision rule, written down BEFORE the test runs. Ship B only if every condition holds."""
    rules = [
        ("no safety regression: B has 0 restricted leaks", b["restricted_leaks"] == 0),
        ("no safety regression: B refusal correctness >= A", b["refusal_correctness"] >= a["refusal_correctness"]),
        ("B is better: at least 1 more item correct than A", b["correct"] >= a["correct"] + 1),
        ("B is affordable: cost per answer <= 1.25 x A", b["cost_per_answer"] <= 1.25 * a["cost_per_answer"]),
    ]
    return all(ok for _, ok in rules), rules


if __name__ == "__main__":
    runs = {}
    for cfg in (A, B):
        print(f"\n== {cfg['name']}: chunking={cfg['chunking']}, k={cfg['k']}")
        runs[cfg["name"]] = run_eval(cfg["chunking"], cfg["k"])
        print_metrics(runs[cfg["name"]])
    a, b = runs[A["name"]]["metrics"], runs[B["name"]]["metrics"]
    print(f"\n{'Scorecard':24}{A['name']:>14}{B['name']:>14}")
    for label, key, fmt in ROWS:
        print(f"{label:24}{fmt.format(a[key]):>14}{fmt.format(b[key]):>14}")
    changed = [r["id"] for ra, r in zip(runs[A["name"]]["rows"], runs[B["name"]]["rows"]) if ra["correct"] != r["correct"]]
    print(f"Items that changed:     {', '.join(changed) or 'none'}")
    ship, rules = decide(a, b)
    print("\nDecision rule:")
    for text, ok in rules:
        print(f"  [{'x' if ok else ' '}] {text}")
    print(f"Decision: {'SHIP B (heading-aware chunks)' if ship else 'KEEP A (no change)'}")
    total = a["eval_cost"] + b["eval_cost"]
    print(f"Total cost of this A/B run: US${total:.4f}")
    Path("results").mkdir(exist_ok=True)
    out = Path("results") / f"ab-{datetime.now():%Y%m%d-%H%M%S}.json"
    out.write_text(json.dumps({"A": runs[A["name"]], "B": runs[B["name"]], "ship_b": ship}, indent=2))
    print(f"Saved {out}")
