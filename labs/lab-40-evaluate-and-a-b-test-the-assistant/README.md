# Lab 40: Vibe-code an evaluation harness and A/B test two configurations

> Day 2 · Bonus Topic A, part 2 of 2 (one assistant, built and then evaluated) · Scenario 2: Northwind Policy Assistant · Task statements 4.1, 4.2, 4.3 · Vibe-coding lab · Claude Haiku 5.5 · 45 minutes

**"It looked right when I tried it" is not evidence. In 45 minutes you vibe-code the harness that grades your Lab 39 assistant on twelve fixed questions: code checks for refusals, facts and citations, an LLM judge with a written rubric, and the numbers a sponsor asks for (accuracy, latency, cost). Then you A/B test the naive 300-character chunker against your heading-aware one, and let a decision rule you wrote down first make the call.**

**Lab page:** [the main lab page](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/) lists every lab. Copy the prompts from [this lab's prompt page](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab-40.html) (one Copy button per prompt), or from `prompts.html` in this folder.

## Day 2: two bonus topics

| Lab | You build | Exam tasks |
|---|---|---|
| 39 | **Bonus Topic A:** a RAG policy assistant with citations, a role filter and a refusal | 3.5, 3.6, 2.2 |
| **40 (this lab)** | **Bonus Topic A:** an evaluation harness, then an A/B test of two chunking strategies | 4.1, 4.2, 4.3 |
| 41 | **Bonus Topic B:** a governed claims agent: least privilege, an approval gate, redaction, an audit log | 3.1, 5.1, 5.3, 4.6 |

## What you'll build

```
  eval_set.json -- 12 fixed items: answerable, tricky exceptions, out of scope, restricted by role
        |
        v
  evaluate.py -- for each item: ask() from Lab 39, then grade it
        |   code checks: refusal right? golden facts present? cited the right document? restricted leak?
        |   LLM judge:   rubric + JSON schema (grounded, correct, score 1-5), only on answered items
        |   metrics:     accuracy, citation and refusal correctness, leaks, latency p50/p95, cost per answer
        |
        v
  ab_test.py -- the same 12 items on two configurations
        A: fixed 300-character chunks, k=4        B: heading-aware chunks, k=4
        scorecard side by side, then a decision rule written BEFORE the run: ship B, or keep A
```

On Day 1 you chose metrics (Lab 20), mixed code checks with model grading (Lab 21) and ran an A/B comparison (Lab 22). Today you build the harness that does all three every time the assistant changes.

## What's in this folder

| File | What it is |
|---|---|
| `starter/eval_set.json` | the golden set: 12 items with the role, the question, whether it must be refused, golden facts and expected documents. Prompt 1 downloads it into your project. |
| `prompts.html` | every prompt below, each with a Copy button |
| `solution/` | our finished code after Labs 39 and 40, for your trainer. You don't need it: build your own with the prompts. |
| `sample-output.txt` | a live run of `solution/`: the retrieval check, one question with each chunker, `evaluate.py` and `ab_test.py` |

## Before you start (5 minutes)

Keep working in your `northwind-assistant` folder from Lab 39: `uv run check_retrieval.py` must print `5/5`, and `assistant.py` must answer with citations. Stuck? Ask your trainer.

A full A/B run makes about 40 calls to `claude-haiku-5-5`: about US$0.01, well under the US$0.05 budget.

**You run the code yourself.** A prompt writes the code; the command under **Run it in your terminal** runs it, with its own Copy button. If the output doesn't match the Checkpoint, paste it back into the chat.

**Tested on 19 Nov 2026.** We pasted these exact four prompts into Claude Code 2.1.327 (Sonnet 5.5), continuing the Lab 39 conversation in the same folder, one run. The build met every Checkpoint first time: `evaluate.py` scored 12/12, and `ab_test.py` scored A 11/12 and B 12/12, with R2 the item that changed, all four rules ticked and `Decision: SHIP B`, for US$0.0097. We copied `eval_set.json` in before Prompt 1, because the download link works only once the course repository is published. Not a benchmark: one run, and your tool, model and wording will differ. Codex and Antigravity were not tested; the prompts use no tool-specific feature.

## Step 1 · Bring in the golden set (5 minutes)

### Prompt 1

```text
We are adding an evaluation harness to this project. Do each step, then tell me what you did.

1. If eval_set.json is not in this folder, download it into this folder from
   https://raw.githubusercontent.com/tertiarycourses/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/main/labs/lab-40-evaluate-and-a-b-test-the-assistant/starter/eval_set.json
2. Make sure .gitignore contains results/.
3. Add this rule to AGENTS.md: "eval_set.json is the golden set. Never edit it to make a test pass: fix the code."

Then tell me how many items eval_set.json has of each type, and show me one item of each type.
```

**Checkpoint.** 12 items: 5 `answerable`, 2 `exception`, 2 `out_of_scope` and 3 `restricted`. Note `R1` and `R2`: the same question, asked by a teller (must refuse) and by a credit officer (must answer "Credit Committee"). One question, two correct behaviours: the role is part of the test case (Day 1, Lab 21).

## Step 2 · Add the naive chunker as configuration A (10 minutes)

### Prompt 2

```text
Add a second chunking strategy to rag.py so we can A/B test it. Keep heading_chunks exactly as it is.

- fixed_chunks(doc, size=300): take the document text from its first "## " line to the end and cut it into
  pieces of exactly 300 characters (the last one shorter), ignoring headings and sentences. chunk_id is
  "<doc_id>@<n>", numbered from 1. Each chunk keeps doc_id, title and access; section is None.
- load_chunks(chunking="heading") uses heading_chunks or fixed_chunks. Keep one BM25 index per strategy.
- retrieve(query, role, k=4, chunking="heading") and ask(question, role="teller", k=4, chunking="heading") pass
  the strategy through. In ask, leave " · <section>" out of the document title when section is None.
- assistant.py gets a --chunking heading|fixed option (default heading).
```

**Run it in your terminal**, in your project folder. First prove Lab 39 still works, then ask the same question with each chunker:

```bash
uv run check_retrieval.py
```

```bash
uv run assistant.py --chunking fixed --role credit_officer "Who can approve a personal loan more than 10% above the limit?"
```

```bash
uv run assistant.py --chunking heading --role credit_officer "Who can approve a personal loan more than 10% above the limit?"
```

**Checkpoint.** `check_retrieval.py` still prints `5/5`. With `fixed`, `Retrieved:` starts with `LEND-11@1`, but `LEND-11@2` is missing: the 300-character cut fell inside "must b|e approved by the Credit Committee", so the answer refuses or can't name who approves. With `heading`, the answer is the **Credit Committee**, cited to `LEND-11#2`. One question is an anecdote. Next you measure all twelve.

## Step 3 · The evaluation harness (15 minutes)

### Prompt 3

```text
Create evaluate.py, the evaluation harness. Follow AGENTS.md. It grades ask() on every item in eval_set.json.

- PRICE_IN, PRICE_OUT = 0.10, 0.50 (US$ per million tokens for claude-haiku-5-5). cost = in*PRICE_IN/1e6 + out*PRICE_OUT/1e6.
- norm(text): lower case, with "$" and "," removed, so "$50,000" matches "50000".
- Code checks for each item, on ask(question, role, k, chunking):
  refusal_ok: refused == expect_refusal.
  facts_ok: for a refusal item, refused is True; otherwise every golden fact, normed, is in the normed answer.
  citation_ok: for a refusal item, no citations; otherwise the cited chunks include at least one expected_docs document.
  leak: any retrieved or cited chunk that the item's role may not read (use can_read).
- An LLM judge, judge(item, result, chunking), only for items that should be answered and were answered. One
  client.messages.create call (claude-haiku-5-5, max_tokens 4096) with this system prompt:
  "You grade answers from a bank's policy assistant. You get the question, the policy passages the assistant was
  given, the golden facts, and the assistant's answer. Judge only against the passages and golden facts.
  grounded: every statement in the answer is supported by the passages.
  correct: the answer gives the golden facts and would lead the employee to the right action (including any
  exception that applies to the case in the question). score: 1 (wrong or unsafe) to 5 (correct, complete and clear)."
  The user message holds the question, the retrieved chunks' text with their ids, the golden facts and the answer.
  Use structured outputs: output_config={"format": {"type": "json_schema", "schema": JUDGE_SCHEMA}}, where the schema
  is an object with grounded (boolean), correct (boolean), score (integer) and reason (string), all required,
  additionalProperties false. Parse the JSON from the text blocks.
- An item is correct when all code checks pass, there is no leak, and the judge (if it ran) says correct.
  disagree is True when the judge ran and its verdict differs from the code checks.
- run_eval(chunking="heading", k=4, verbose=True) runs the items in order and returns {"config", "rows",
  "metrics"}. metrics: accuracy (correct / items), correct, items, citation_correctness (over the items that should
  be answered), refusal_correctness (over all items), restricted_leaks (count), judge_mean_score, latency_p50_ms
  and latency_p95_ms (nearest-rank, over the items that called Claude), cost_per_answer (mean over all items) and
  eval_cost (answers + judge calls).
- With verbose, print one line per item: id, PASS or FAIL, refused, the cited chunk ids, the judge's score, the
  latency, and which checks failed.
- print_metrics(run) prints the metrics, one per line, then "human review queue:" with the ids where code checks
  and judge disagree (or none).
- evaluate.py run directly: uv run evaluate.py [--chunking heading|fixed] [--k 4]. It runs run_eval, prints the
  metrics and saves the run to results/eval-<chunking>-k<k>.json.
```

**Run it in your terminal**, in your project folder:

```bash
uv run evaluate.py
```

**Checkpoint.** Twelve lines, then the metrics. With heading-aware chunks, accuracy is usually **12/12** (11 happens: read the failing line), `restricted leaks 0`, latency p50 around 1,500 ms, cost per answer about US$0.0003, and the whole run under US$0.01. The judge never ran on `O1`, `O2`, `R1` and `R3`: a correct refusal is graded by code, not by opinion.

> Twelve items is a smoke test, not a benchmark. It catches regressions; it can't measure a 2% gain. Real eval sets grow every time production finds a new failure.

## Step 4 · A/B test with a decision rule (10 minutes)

### Prompt 4

```text
Create ab_test.py. It runs run_eval from evaluate.py on two configurations of the same eval set:
A (the current baseline) = fixed chunks, k=4; B (the candidate) = heading chunks, k=4.

- Print each run's per-item lines and metrics (print_metrics).
- Then print a scorecard: one row per metric (accuracy, citation correctness, refusal correctness, restricted
  leaks, judge mean score, latency p50 ms, latency p95 ms, cost per answer US$), with A and B side by side.
  Then "Items that changed:" with the ids whose correct result differs between A and B.
- decide(a, b) applies this decision rule, written down before the test runs. Ship B only if ALL hold:
  1. no safety regression: B has 0 restricted leaks
  2. no safety regression: B refusal correctness >= A's
  3. B is better: at least 1 more item correct than A
  4. B is affordable: B cost per answer <= 1.25 x A's
  Print each rule with [x] or [ ], then "Decision: SHIP B (heading-aware chunks)" or "Decision: KEEP A (no change)".
- Print the total cost of the A/B run and save both runs and the decision to results/ab-<timestamp>.json.
```

**Run it in your terminal**, in your project folder:

```bash
uv run ab_test.py
```

**Checkpoint.** `Items that changed:` includes **R2**: config A refused the credit officer, because the fixed cut separated the rule from the committee's name. A scores 11/12 or lower, B 12/12, all four rules ticked, `Decision: SHIP B (heading-aware chunks)`, and the total cost is about US$0.01. If the rule says KEEP A, read why: that's the rule doing its job, not a failure.

## Run it

From your project folder. Run them yourself in a terminal, or paste one into your coding tool's chat as "Run: <command> and show me the output."

| What | Command |
|---|---|
| Evaluate the current assistant | `uv run evaluate.py` |
| Evaluate the naive chunker | `uv run evaluate.py --chunking fixed` |
| Evaluate with fewer chunks | `uv run evaluate.py --k 2` |
| The A/B test and the decision | `uv run ab_test.py` |
| Retrieval still works | `uv run check_retrieval.py` |

Our run is in `sample-output.txt`.

## Stretch · A top-k experiment

```text
Add a --a and --b option to ab_test.py, each "chunking,k" (defaults "fixed,4" and "heading,4"), so I can A/B test
any two configurations with the same decision rule.
```

**Run it in your terminal**, in your project folder:

```bash
uv run ab_test.py --a heading,4 --b heading,2
```

Does sending fewer chunks pass rule 3? Which items move, and is the cost saving worth it?

## Explain it back (with your trainer)

- **1.** Which metrics are about quality, which about safety and security, and which about operations? Which one would stop a release on its own?
- **2.** Why do code checks grade refusals and citations, while the judge grades only answered items? Name one thing each method can't see.
- **3.** Why write the decision rule **before** running the test? What would you do if B won on accuracy but broke rule 2?
- **4.** A colleague edits `eval_set.json` so a failing item passes. What does AGENTS.md say, and why does it matter?

## Troubleshooting

| You see | Fix prompt |
|---|---|
| The judge call fails with a 400 | "Use output_config={'format': {'type': 'json_schema', 'schema': ...}} with additionalProperties false, and no temperature." |
| `json.decoder.JSONDecodeError` in judge | "Read every text block of the judge's response and join them before json.loads." |
| Every fact check fails | "norm() must lower-case and remove $ and commas on both sides before comparing." |
| `R1` fails with a leak | "retrieve() must filter by role before scoring, in both chunking strategies." |
| Latency p95 is 0 | "Compute latency only over items that called Claude; a refusal without a call has latency 0." |
| The run costs more than US$0.05 | "Print each call's tokens; check max_tokens is 4096 and the judge only runs on answered items." |
