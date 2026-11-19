"""Evaluation harness for the Northwind policy assistant: code checks + an LLM-as-judge rubric, then metrics.
Run:  uv run evaluate.py                       (heading-aware chunks, k=4)
      uv run evaluate.py --chunking fixed      (fixed 300-character chunks)"""
import argparse
import json
import math
import statistics
import time
from pathlib import Path

import anthropic
from dotenv import load_dotenv

from assistant import MODEL, ask
from rag import can_read, get_index

load_dotenv()
PRICE_IN, PRICE_OUT = 0.10, 0.50          # claude-haiku-5-5, US$ per million tokens
JUDGE_SYSTEM = """You grade answers from a bank's policy assistant. You get the question, the policy passages the
assistant was given, the golden facts, and the assistant's answer. Judge only against the passages and golden facts.
grounded: every statement in the answer is supported by the passages.
correct: the answer gives the golden facts and would lead the employee to the right action (including any exception
that applies to the case in the question). score: 1 (wrong or unsafe) to 5 (correct, complete and clear)."""
JUDGE_SCHEMA = {"type": "object", "additionalProperties": False, "required": ["grounded", "correct", "score", "reason"],
                "properties": {"grounded": {"type": "boolean"}, "correct": {"type": "boolean"},
                               "score": {"type": "integer"}, "reason": {"type": "string"}}}


def cost(input_tokens, output_tokens):
    return (input_tokens * PRICE_IN + output_tokens * PRICE_OUT) / 1_000_000


def norm(text):
    """Lower case, without $ signs or thousands commas, so "$50,000" matches "50000"."""
    return text.lower().replace("$", "").replace(",", "")


def percentile(values, p):
    values = sorted(values)
    if not values:
        return 0
    i = max(0, min(len(values) - 1, math.ceil(p / 100 * len(values)) - 1))
    return values[i]


def judge(item, result, chunking):
    """LLM-as-judge with a fixed rubric and a JSON schema. Returns (verdict dict, input_tokens, output_tokens)."""
    chunks = {c["chunk_id"]: c for c in get_index(chunking).chunks}
    passages = "\n\n".join(f"[{cid}] {chunks[cid]['text']}" for cid in result["retrieved"])
    prompt = (f"Question: {item['question']}\n\nPassages:\n{passages}\n\nGolden facts: {item['golden_facts']}\n\n"
              f"Assistant's answer:\n{result['answer']}")
    response = anthropic.Anthropic().messages.create(
        model=MODEL, max_tokens=4096, system=JUDGE_SYSTEM, messages=[{"role": "user", "content": prompt}],
        output_config={"format": {"type": "json_schema", "schema": JUDGE_SCHEMA}})
    text = "".join(b.text for b in response.content if b.type == "text")
    return json.loads(text), response.usage.input_tokens, response.usage.output_tokens


def grade(item, result, chunking):
    """Code checks first (refusal, golden facts, citations, restricted leak), then the judge on answered items."""
    index = {c["chunk_id"]: c for c in get_index(chunking).chunks}
    cited_docs = {index[c]["doc_id"] for c in result["citations"]}
    leak = any(not can_read(item["role"], index[c]) for c in result["retrieved"] + result["citations"])
    refusal_ok = result["refused"] == item["expect_refusal"]
    if item["expect_refusal"]:
        facts_ok, citation_ok = result["refused"], not result["citations"]
    else:
        facts_ok = all(norm(f) in norm(result["answer"]) for f in item["golden_facts"])
        citation_ok = bool(cited_docs & set(item["expected_docs"]))
    verdict, j_in, j_out = None, 0, 0
    if not item["expect_refusal"] and not result["refused"]:
        verdict, j_in, j_out = judge(item, result, chunking)
    checks_pass = refusal_ok and facts_ok and citation_ok and not leak
    correct = checks_pass and (verdict is None or verdict["correct"])
    return {"id": item["id"], "type": item["type"], "role": item["role"], "question": item["question"],
            "answer": result["answer"], "refused": result["refused"], "citations": result["citations"],
            "retrieved": result["retrieved"], "refusal_ok": refusal_ok, "facts_ok": facts_ok, "citation_ok": citation_ok,
            "leak": leak, "judge": verdict, "checks_pass": checks_pass, "correct": correct,
            "disagree": verdict is not None and checks_pass != verdict["correct"],
            "latency_ms": result["latency_ms"], "cost": cost(result["input_tokens"], result["output_tokens"]),
            "judge_cost": cost(j_in, j_out)}


def run_eval(chunking="heading", k=4, eval_file="eval_set.json", verbose=True):
    """Run every item through ask() and grade it. Returns {"config", "rows", "metrics"}."""
    items = json.loads(Path(eval_file).read_text())["items"]
    rows = []
    for item in items:
        result = ask(item["question"], item["role"], k=k, chunking=chunking)
        row = grade(item, result, chunking)
        rows.append(row)
        if verbose:
            flags = "".join(name for name, ok in [("R", row["refusal_ok"]), ("F", row["facts_ok"]),
                                                  ("C", row["citation_ok"]), ("L", not row["leak"])] if not ok)
            j = row["judge"]
            print(f"  {row['id']:3} {'PASS' if row['correct'] else 'FAIL'}  refused={str(row['refused']):5} "
                  f"cited={','.join(row['citations']) or '-':22} judge={(str(j['score']) + ('ok' if j['correct'] else 'x')) if j else '-':4} "
                  f"{row['latency_ms']:5} ms  {'failed: ' + flags if flags else ''}")
    answered = [r for r in rows if not r["refused"] and r["latency_ms"]]
    should_answer = [r for r in rows if not next(i for i in items if i["id"] == r["id"])["expect_refusal"]]
    calls = [r for r in rows if r["latency_ms"]]
    metrics = {
        "accuracy": sum(r["correct"] for r in rows) / len(rows),
        "citation_correctness": sum(r["citation_ok"] for r in should_answer) / len(should_answer),
        "refusal_correctness": sum(r["refusal_ok"] for r in rows) / len(rows),
        "restricted_leaks": sum(r["leak"] for r in rows),
        "judge_mean_score": statistics.mean(r["judge"]["score"] for r in answered if r["judge"]) if any(r["judge"] for r in rows) else 0,
        "latency_p50_ms": percentile([r["latency_ms"] for r in calls], 50),
        "latency_p95_ms": percentile([r["latency_ms"] for r in calls], 95),
        "cost_per_answer": sum(r["cost"] for r in rows) / len(rows),
        "eval_cost": sum(r["cost"] + r["judge_cost"] for r in rows),
        "items": len(rows), "correct": sum(r["correct"] for r in rows),
    }
    return {"config": {"chunking": chunking, "k": k}, "rows": rows, "metrics": metrics}


def print_metrics(run):
    m = run["metrics"]
    print(f"\nConfig: chunking={run['config']['chunking']}, k={run['config']['k']}")
    print(f"  accuracy             {m['correct']}/{m['items']} ({m['accuracy']:.0%})")
    print(f"  citation correctness {m['citation_correctness']:.0%}")
    print(f"  refusal correctness  {m['refusal_correctness']:.0%}")
    print(f"  restricted leaks     {m['restricted_leaks']}")
    print(f"  judge mean score     {m['judge_mean_score']:.2f} / 5")
    print(f"  latency p50 / p95    {m['latency_p50_ms']} / {m['latency_p95_ms']} ms")
    print(f"  cost per answer      US${m['cost_per_answer']:.5f}")
    print(f"  eval run cost        US${m['eval_cost']:.4f} (answers + judge)")
    review = [r["id"] for r in run["rows"] if r["disagree"]]
    print(f"  human review queue   {', '.join(review) if review else 'none (code checks and judge agree)'}")


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description="Evaluate the Northwind policy assistant on eval_set.json.")
    ap.add_argument("--chunking", default="heading", choices=["heading", "fixed"])
    ap.add_argument("--k", type=int, default=4)
    a = ap.parse_args()
    start = time.perf_counter()
    print(f"Evaluating chunking={a.chunking}, k={a.k} on eval_set.json")
    run = run_eval(a.chunking, a.k)
    print_metrics(run)
    Path("results").mkdir(exist_ok=True)
    out = Path("results") / f"eval-{a.chunking}-k{a.k}.json"
    out.write_text(json.dumps(run, indent=2))
    print(f"\nSaved {out} ({time.perf_counter() - start:.0f} s)")
