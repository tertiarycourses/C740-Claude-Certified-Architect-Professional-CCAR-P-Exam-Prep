"""Prove the retrieval works before Claude is involved: fixed queries, expected chunks, PASS or FAIL. No API call.
Run:  uv run check_retrieval.py"""
import sys

from rag import get_index, retrieve

CASES = [
    # (query, role, expected chunk_id in the top 3 or None, doc_id that must NOT appear)
    ("What is the maximum unsecured personal loan?", "teller", "LEND-04#3", None),
    ("How many days of annual leave can I carry forward?", "teller", "HR-03#2", None),
    ("When must I report a suspected security incident?", "teller", "OPS-21#3", None),
    ("Who can approve a credit exception above the loan limit?", "credit_officer", "LEND-11#2", None),
    ("Who can approve a credit exception above the loan limit?", "teller", None, "LEND-11"),
]

index = get_index()
print(f"Loaded {len({c['doc_id'] for c in index.chunks})} documents, {len(index.chunks)} chunks\n")
passed = 0
for query, role, expect, banned in CASES:
    hits = retrieve(query, role, k=3)
    ids = [h["chunk_id"] for h in hits]
    ok = (expect is None or expect in ids) and (banned is None or all(h["doc_id"] != banned for h in hits))
    passed += ok
    want = f"expect {expect}" if expect else f"no {banned} chunk"
    print(f"{'PASS' if ok else 'FAIL'}  [{role}] {query}")
    top = ", ".join(f"{h['chunk_id']} ({h['score']})" for h in hits) or "nothing"
    print(f"      top 3: {top}   ({want})")
print(f"\n{passed}/{len(CASES)} retrieval checks passed")
sys.exit(0 if passed == len(CASES) else 1)
