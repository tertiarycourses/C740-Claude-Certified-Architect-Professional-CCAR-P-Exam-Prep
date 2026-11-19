# Lab 38: 6% of summaries fail: trace stop_reason max_tokens, don't guess
> Day 2 · Topic 7: Developer Productivity & Operational Enablement · Task statement 7.3 · Simulator 6: Kestrel Platform Team · About 12 minutes · Claude Haiku 5.5

## Goal
Task statement 7.3: **Support debugging and operational issue resolution.** You answer one exam-style question, then run the Kestrel Platform Team simulator and watch the tempting design fail and the right one work, with real Claude calls.

## Open this lab

- **The main lab page:** [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/). It lists all 38 simulator labs, the Day 2 builds (Labs 39 to 41) and the practice exam, and holds the API key box.
- **Run it live in your browser (nothing to install):** open [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=38](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=38), paste your Anthropic API key into the sidebar once, then press **Simulate it live**. Every call uses `claude-haiku-5-5`. The run **stops after the first method** and shows its outcome; press **Proceed** to run the fix, then read the two **side by side** under The observation explained.
- **In a terminal, one click:** double-click `run-lab.command` (Mac) or `run-lab.cmd` (Windows) in this folder. It runs `node docs/tools/test_lab.mjs 38` from the repository root, with the same engine the site uses. It needs Node.js and your key in a `.env` file at the repository root (one line: `ANTHROPIC_API_KEY=sk-ant-...`).
- **The code it runs:** [docs/sims/lab-38.js](https://github.com/tertiarycourses/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/blob/main/docs/sims/lab-38.js), on the shared engine [docs/assets/engine.js](https://github.com/tertiarycourses/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/blob/main/docs/assets/engine.js).

## The scenario
Kestrel Software's platform team is rolling Claude Code out to 40 engineers across four product squads, and runs Claude-powered features in production. The team owns the shared Claude Code configuration, the CI pipeline, the evaluation suite for each prompt change, and the on-call runbooks for incidents in Claude-powered services.

## Key concepts
- **stop_reason tells you why it stopped.** end_turn means Claude finished. max_tokens means the reply was cut off at the limit; parsing that text as JSON then fails with a confusing error.
- **Traces for LLM features.** Record model, max_tokens, input and output tokens, stop_reason, latency and tool calls per request. Most Claude incidents show up in these fields.
- **Read widely, change narrowly.** Read-only access to logs, traces and deploys is safe to grant for diagnosis. Changes go through a branch, review and an approved rollout.
- **Reproduce, then change one thing.** Replay a failing request as it was sent. If it fails the same way, change one setting and re-run: a pass is evidence, not a hope.
- **Retries don't fix deterministic failures.** A transient 529 is worth a retry. A reply truncated by max_tokens fails the same way every time, so a retry only adds latency and cost.

## The question
Since Tuesday afternoon, 6% of requests to Kestrel's order-summary service, which uses Claude to write the summary on the order confirmation page, fail with "Order summary unavailable". The on-call engineer asks Claude Code for help. Which approach best resolves the incident?

- **A.** Give Claude read-only access to logs, traces and recent deploys, and have it reproduce a failing request, test one hypothesis at a time and verify the fix before rollout.
- **B.** Paste the alert and the customer ticket into Claude, apply the most likely fix it suggests straight away, and roll it back if the error rate has not dropped within an hour.
- **C.** Switch the service to a larger Claude model, because failures that start without any application code change usually point to a regression in the quality of the model's output.
- **D.** Wrap the Claude call in a retry with exponential backoff, so that transient failures are absorbed and customers stop seeing errors while the team investigates the cause.

Pick your answer before you run anything. The answer and the reasoning are at the end, under **Check your answer**.

## Steps on the simulator site
1. Open [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=38](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=38). The left sidebar should say the API key is **saved**. If it says **not set**, paste your key into the **Anthropic API key** box, press **Save**, then **Test**.
2. Read the task statement card and the question. Click the answer you chose. The page tells you at once whether it is right, and why. Open **Why the other answers fall short**.
3. Press **▶ Simulate it live**. The scenario board shows the story, the code runs on the left and Claude's live output appears on the right.
4. When the run pauses, read the outcome of the first method (the trap). Then press **▶ Proceed** to run the fix.
5. Read **Claude's final output**, then **The observation explained**: the two methods side by side, turn by turn, and the checks on what Claude actually did.
6. Open **See the full code this lab runs** and find the lines that make the difference.

## Or run it from a terminal
From the repository root:

```
node docs/tools/test_lab.mjs 38
```

## What you will see
What to look for: Phase 1 cannot name a proven cause; Phase 2 finds stop_reason max_tokens after config v42, reproduces it and verifies the fix in staging.

These lines are from our own run of this lab on Claude Haiku 5.5. Your wording will differ, because Claude writes each reply fresh; the tool calls, decisions and checks should match. This is an excerpt: wherever … appears, text has been shortened, and a line with only … marks lines left out. Run the lab to see the full output.

```
Kestrel on-call · PAGE · order-summary: error rate 6.1% (baseline 0.2%) since Tue 14:10. Customers see "Order summary unavailable" on the confirmation page. Ticket SUP-…
== Phase 1 · guess from symptoms: the page and the ticket, no tools
Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
  stop_reason: end_turn -> STOP: Claude has finished
Reply: {"hypotheses":[{"cause":"max_tokens_truncation","status":"untested","evidence":"No traces or logs provided. Truncated model output would fail parsing and show 'u…
Phase 1 diagnosis: unknown · fix: Before changing anything, pull error traces since Tue 14:10 and group them by stop_reason, error type, and tool latency. If a deploy o…

== PAUSE · Phase 1 finished: a diagnosis from the symptoms
   outcome: From the symptoms alone Claude **cannot name a root cause**; its "fix" is a to-do list or a mitigation: "Before changing anything, pull error traces since T…
   proceed: Phase 2: the same page, with read-only logs, traces and deploys, a staging replay, and the debugging loop

== Phase 2 · structured debugging loop: gather evidence, isolate, one hypothesis at a time, reproduce, verify
Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
  stop_reason: tool_use -> CONTINUE: run the tools, append the results, call Claude again
  -> search_logs({})
  <- result: {"service":"order-summary","window":"Mon 00:00 to Wed 18:00","groups":[{"message":"order_summary_failed: JSONDecodeError: Unterminated string startin…
  -> list_traces({"failed_only":true})
  <- result: [{"trace_id":"tr-a131","at":"Tue 15:20","items_in_order":17,"stop_reason":"max_tokens","app_result":"error"},{"trace_id":"tr-a157","at":"Wed 09:12","…
  -> list_deploys({})
  <- result: [{"at":"Mon 10:12","service":"inventory-service","change":"v3.1: new stock cache"},{"at":"Tue 13:40","service":"order-summary","change":"prompt v17: …
Turn 2: POST /v1/messages · model claude-haiku-5-5 · 3 messages (tool results appended)
  stop_reason: tool_use -> CONTINUE: run the tools, append the results, call Claude again
  -> get_trace({"trace_id":"tr-a131"})
  <- result: {"trace_id":"tr-a131","at":"Tue 15:20","items_in_order":17,"service":"order-summary","model":"claude-haiku-5-5","config_version":"v42","prompt_versio…
  -> get_trace({"trace_id":"tr-a157"})
  <- result: {"trace_id":"tr-a157","at":"Wed 09:12","items_in_order":14,"service":"order-summary","model":"claude-haiku-5-5","config_version":"v42","prompt_versio…
  -> get_trace({"trace_id":"tr-9f19"})
  <- result: {"trace_id":"tr-9f19","at":"Tue 12:31","items_in_order":5,"inventory_timeout":true,"service":"order-summary","model":"claude-haiku-5-5","config_versi…
Turn 3: POST /v1/messages · model claude-haiku-5-5 · 5 messages (tool results appended)
  stop_reason: tool_use -> CONTINUE: run the tools, append the results, call Claude again
  -> rerun_request({"trace_id":"tr-a131"})
  <- result: {"trace_id":"tr-a131","max_tokens":1024,"stop_reason":"max_tokens","output_tokens":1024,"summary_json_valid":false}
  -> list_traces({})
  <- result: [{"trace_id":"tr-9e41","at":"Mon 11:02","items_in_order":3,"stop_reason":"end_turn","app_result":"ok"},{"trace_id":"tr-9e77","at":"Mon 15:40","items_…
Turn 4: POST /v1/messages · model claude-haiku-5-5 · 7 messages (tool results appended)
  stop_reason: tool_use -> CONTINUE: run the tools, append the results, call Claude again
  -> rerun_request({"trace_id":"tr-a131","max_tokens":2048})
  <- result: {"trace_id":"tr-a131","max_tokens":2048,"stop_reason":"end_turn","output_tokens":1370,"summary_json_valid":true}
  -> rerun_request({"trace_id":"tr-a188","max_tokens":2048})
  <- result: {"trace_id":"tr-a188","max_tokens":2048,"stop_reason":"end_turn","output_tokens":1510,"summary_json_valid":true}
Turn 5: POST /v1/messages · model claude-haiku-5-5 · 9 messages (tool results appended)
  stop_reason: end_turn -> STOP: Claude has finished
Reply: {"hypotheses":[{"cause":"max_tokens_truncation","status":"confirmed","evidence":"Config v42 at Tue 14:05 cut max_tokens 2048 to 1024. All failing traces (tr-a131…
  confirmed max_tokens_truncation: Config v42 at Tue 14:05 cut max_tokens 2048 to 1024. All failing traces (tr-a131, tr-a157, tr-a188) show stop_reason max_tokens with …
…
PASS  Phase 2: a re-run with a higher max_tokens returned end_turn and valid summary JSON (fix verified)
PASS  Phase 2: root cause max_tokens_truncation, citing a real failing trace, with the tool timeout ruled out

== Side by side
[trap] Phase 1: guess from symptoms: **No root cause**: with only the page and the ticket, Claude can list what to look at or suggest a mitigation, but **no trace, log …
[fix] Phase 2: structured debugging loop: Evidence first, then isolation: failing traces stop at **stop_reason max_tokens, 1,024 tokens**, after config v42 halved max_t…
  Evidence read | none (bad) | search_logs, list_traces, list_deploys, get_trace (good)
  Root cause named | unknown (bad) | max_tokens_truncation (good)
  Failing traces cited (exist in the store) | 0 (bad) | tr-a131, tr-a157, tr-a188 (good)
  Reproduced in staging | no (bad) | yes: max_tokens at 1024 (good)
  Fix verified by a re-run | no (bad) | yes: end_turn, valid JSON at 2048 (good)
  Red herring (get_inventory timeout) | — | ruled out with evidence (good)

6 Claude calls · 18628 in / 3223 out tokens · about US$0.0035 · 21.8 s
```

## Check your answer
**Answer: A.** Claude is useful in an incident when it works from evidence. Read-only access to logs, traces and deploys is safe to grant widely and lets it see that every failing trace stops with stop_reason max_tokens at 1,024 tokens after a config change halved max_tokens. Reproducing a failing request, testing one hypothesis at a time and verifying the fix in staging turns a plausible story into a proven cause before anything changes in production.

Why the other answers fall short:

- **B.** A fix chosen from symptoms is a guess; applying it in production risks a second incident and teaches nothing if the errors happen to stop.
- **C.** The failures began with a config change, not a model change; a larger model costs more and still stops at the same max_tokens limit.
- **D.** A truncated response is deterministic for that order: every retry hits the same max_tokens limit, so retries add latency and cost without fixing it.

## Why it happens
Both phases start from the same page and the same customer ticket. From symptoms alone, Claude can only produce a plausible story: an API problem, a timeout, a bad prompt. Nothing in it is checked, and acting on it in production risks a second incident. With read-only access to logs, traces and deploys, the loop narrows quickly: the new error group appears at Tue 14:05, every failing trace stops with stop_reason max_tokens at exactly 1,024 output tokens on large orders, healthy traces before the change used up to 1,300 tokens under a 2,048 limit, and the deploy log shows config v42 halving max_tokens. A replay in staging reproduces the failure and verifies the fix before anyone touches production. The application should also check stop_reason before parsing, so a truncated reply fails loudly instead of as a JSON error.

## Exam tip
In debugging questions, prefer evidence-driven loops: observability access, reproduction, one change at a time, verification before rollout. Retries, model upgrades and fixes guessed from symptoms are distractors, especially when the failure is deterministic, such as a max_tokens truncation.

## Try this next
In shared/d7-kestrel.js, raise the v42 limit in TRACES from 1024 to 2048 and run Phase 2: the failures vanish and Claude has to look elsewhere. Then remove rerun_request from opsTools and see whether Claude still claims fix_verified.

---
Source: Original question written for C740. Course: Claude Certified Architect - Professional (CCAR-P) Exam Prep (C740). © Tertiary Infotech Academy Pte Ltd · UEN 201200696W
