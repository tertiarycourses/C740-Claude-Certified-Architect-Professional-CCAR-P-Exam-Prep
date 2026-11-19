# Lab 25: 'Answered in 2.4s' can't say why: log every Claude call as a record
> Day 1 · Topic 4: Evaluation, Testing & Optimization · Task statement 4.6 · Simulator 6: Kestrel Platform Team · About 12 minutes · Claude Haiku 5.5

## Goal
Task statement 4.6: **Monitor system performance using logging and observability tools.** You answer one exam-style question, then run the Kestrel Platform Team simulator and watch the tempting design fail and the right one work, with real Claude calls.

## Open this lab

- **The main lab page:** [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/). It lists all 38 simulator labs, the Day 2 builds (Labs 39 to 41) and the practice exam, and holds the API key box.
- **Run it live in your browser (nothing to install):** open [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=25](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=25), paste your Anthropic API key into the sidebar once, then press **Simulate it live**. Every call uses `claude-haiku-5-5`. The run **stops after the first method** and shows its outcome; press **Proceed** to run the fix, then read the two **side by side** under The observation explained.
- **In a terminal, one click:** double-click `run-lab.command` (Mac) or `run-lab.cmd` (Windows) in this folder. It runs `node docs/tools/test_lab.mjs 25` from the repository root, with the same engine the site uses. It needs Node.js and your key in a `.env` file at the repository root (one line: `ANTHROPIC_API_KEY=sk-ant-...`).
- **The code it runs:** [docs/sims/lab-25.js](https://github.com/tertiarycourses/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/blob/main/docs/sims/lab-25.js), on the shared engine [docs/assets/engine.js](https://github.com/tertiarycourses/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/blob/main/docs/assets/engine.js).

## The scenario
Kestrel Software's platform team is rolling Claude Code out to 40 engineers across four product squads, and runs Claude-powered features in production. The team owns the shared Claude Code configuration, the CI pipeline, the evaluation suite for each prompt change, and the on-call runbooks for incidents in Claude-powered services.

## Key concepts
- **What the API already tells you.** Every response carries model, stop_reason and usage (input_tokens, output_tokens, cache_creation_input_tokens, cache_read_input_tokens). Log them on every call.
- **Add your own context.** Add a trace_id that links the call to the user request, the prompt version, the feature or squad, latency_ms and the number of tool calls.
- **Alert on rates, not anecdotes.** Simple rules on the fields catch failures early: share of max_tokens stops, cache-hit rate, p95 latency, tokens per request, error rate.
- **Slice by version.** A dashboard grouped by prompt version or model shows a bad deploy at a glance and supports rollback decisions.
- **Log data, mind the content.** Log metadata on every call; keep full prompts and responses only where policy allows, sampled, access-controlled and redacted, since they may hold personal data.

## The question
Kestrel's checkout-assistant calls Claude in production and writes free-text log lines such as 'answered customer question in 2.4s'. After a release, customers report cut-off answers and Claude spend rises 2.4 times, and the on-call engineer cannot tell why from the logs. Which change best lets the team detect and diagnose problems like this?

- **A.** Emit one structured record per Claude call (trace_id, prompt version, tokens, cache reads, stop_reason) and alert on it.
- **B.** Log the full prompt and the full response of every call as free text, so the on-call engineer can read exactly what happened.
- **C.** Add a thumbs-down button to the feature, and page the on-call engineer whenever the rate of thumbs-down votes rises.
- **D.** Run the offline evaluation suite against the production prompts every night, and alert when its pass rate falls.

Pick your answer before you run anything. The answer and the reasoning are at the end, under **Check your answer**.

## Steps on the simulator site
1. Open [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=25](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=25). The left sidebar should say the API key is **saved**. If it says **not set**, paste your key into the **Anthropic API key** box, press **Save**, then **Test**.
2. Read the task statement card and the question. Click the answer you chose. The page tells you at once whether it is right, and why. Open **Why the other answers fall short**.
3. Press **▶ Simulate it live**. The scenario board shows the story, the code runs on the left and Claude's live output appears on the right.
4. When the run pauses, read the outcome of the first method (the trap). Then press **▶ Proceed** to run the fix.
5. Read **Claude's final output**, then **The observation explained**: the two methods side by side, turn by turn, and the checks on what Claude actually did.
6. Open **See the full code this lab runs** and find the lines that make the difference.

## Or run it from a terminal
From the repository root:

```
node docs/tools/test_lab.mjs 25
```

## What you will see
What to look for: From free text no rule can run and the diagnosis is a guess; from 48 records both rules fire and Claude names v14's max_tokens cap and lost cache hits, with trace ids.

These lines are from our own run of this lab on Claude Haiku 5.5. Your wording will differ, because Claude writes each reply fresh; the tool calls, decisions and checks should match. This is an excerpt: wherever … appears, text has been shortened, and a line with only … marks lines left out. Run the lab to see the full output.

```
Kestrel · checkout-assistant · 48 Claude calls between 10:00 and 11:00 · customers report cut-off answers; billing says spend is up
== Phase 1 · free-text logs: the lines the checkout-assistant prints today
  10:22:11 INFO  checkout-assistant: answered customer question in 4.6s
  10:22:11 WARN  checkout-assistant: slow response
  10:22:58 INFO  checkout-assistant: answered customer question in 5.3s
  10:22:58 WARN  checkout-assistant: slow response
  10:22:58 WARN  checkout-assistant: customer reported an incomplete answer (ticket opened)
  10:23:59 INFO  checkout-assistant: answered customer question in 5.3s
  10:23:59 WARN  checkout-assistant: slow response
  10:25:31 INFO  checkout-assistant: answered customer question in 4.7s
  … 79 lines in all
  rule "truncation" (stop_reason = max_tokens on more than 5% of calls): CANNOT EVALUATE: no such field in the logs
  rule "cache miss" (cache_read_input_tokens = 0 on more than 50% of calls): CANNOT EVALUATE: no such field in the logs
    Diagnosis from logs · POST /v1/messages · model claude-haiku-5-5
      stop_reason: end_turn · 2725 in / 1231 out · 7478 ms
  cause: Latency regression starting about 10:20:49: response times rose from roughly 1.3-1.9s to roughly 3.8-5.5s and stayed elevated through 10:59, with a 'slow respo…
  cause: Customer 'incomplete answer' tickets (10:22:58, 10:34:29, 10:56:22) all occur inside the slow-response window and follow the latency regression. This is a timi…
  cause: Billing reports Claude API spend this hour at 2.4x the same hour yesterday. The timing overlaps the latency regression, which suggests a shared cause such as l…
  confidence: low · missing: trace_ids or request IDs for any call, so no cause can be linked to a specific Claude call; stop_reason per call (e.g. max_tokens vs end_tu…

== PAUSE · Phase 1 finished: a diagnosis from free text
   outcome: Neither alert rule could run: the lines have no stop_reason or cache field. Claude's diagnosis: **confidence low**, **0 verifiable trace ids**, and it lists…
   proceed: Phase 2: the same calls as structured records

== Phase 2 · structured per-call records in the observability store: the same 48 calls
  {"ts":"2026-11-19T10:12:57Z","trace_id":"tr-5b82","service":"checkout-assistant","model":"claude-haiku-5-5","prompt_version":"v13","input_tokens":569,"cache_read_inpu…
  {"ts":"2026-11-19T10:37:50Z","trace_id":"tr-5e66","service":"checkout-assistant","model":"claude-haiku-5-5","prompt_version":"v14","input_tokens":3787,"cache_read_inp…
  rule "truncation" (stop_reason = max_tokens on more than 5% of calls): FIRED · 9 of 24 calls since 10:30 (38%)
  rule "cache miss" (cache_read_input_tokens = 0 on more than 50% of calls): FIRED · 24 of 24 calls since 10:30 (100%)
  v13: 16 calls from 10:00 · avg output 268 · max_tokens stops 0 · avg cache reads 3200 · avg input 495 · p95 1948 ms
  v14: 32 calls from 10:20 · avg output 885 · max_tokens stops 13 · avg cache reads 0 · avg input 3693 · p95 5457 ms
    Diagnosis from records · POST /v1/messages · model claude-haiku-5-5
      stop_reason: end_turn · 7423 in / 2516 out · 12234 ms
  cause: Customer-facing cut-off answers come from output hitting the 1024-token max_tokens cap. All 13 max_tokens stops are on v14, and each stopped call shows output_…
  cause: The v14 prompt change made answers much longer. Average output rose from 268 tokens on v13 to 885 on v14, and v14 calls that finish normally still run 650-1000…
  cause: Prompt caching stopped working for the checkout-assistant prompt after the v14 rollout. Every v13 call reads 3200 tokens from cache, while every v14 call has c…
  cause: v14 increased tool use, which adds model round trips and tokens. Average tool calls rose from 0.2 on v13 to 1.5 on v14, and many v14 calls report 2 tool calls.…
  confidence: medium · cited 34 real trace ids · missing: The v14 prompt diff, so the cause of the cache miss (changed prefix, cache_control placement, or prefix reorde…

== Turns
Diagnosis from logs turn 1: stop_reason=end_turn
Diagnosis from records turn 1: stop_reason=end_turn

== Checks
…
PASS  Phase 2: the diagnosis names prompt v14 and the max_tokens truncation
PASS  Phase 2: the diagnosis names the lost cache hits and cites at least 2 real trace ids

== Side by side
[trap] Phase 1: free-text log lines: No rule could run. Diagnosis at **low** confidence with **0 verifiable trace ids**: a guess an engineer cannot check.
[fix] Phase 2: one structured record per call: Both rules **fired** on their own. Diagnosis at **medium** confidence names **v14's max_tokens truncation** and **the los…
  Fields per call | time, a sentence | trace_id, model, prompt_version, input/output tokens, cache reads, latency_ms, stop_reason, tool_calls
  Rule: stop_reason = max_tokens on more than 5% of calls | cannot evaluate (bad) | fired (38%) (good)
  Rule: cache_read_input_tokens = 0 on more than 50% of calls | cannot evaluate (bad) | fired (100%) (good)
  Root causes found | Latency regression starting about 10:20:49: response times rose from roughly 1.3-1.9s to roughly 3.8-5.5s and… · Customer 'incomplete answer' tick…
  Trace ids cited that exist | 0 (bad) | 34 (good)
  Confidence | low | medium

2 Claude calls · 10148 in / 3747 out tokens · about US$0.0029 · 19.7 s
```

## Check your answer
**Answer: A.** Cut-off answers and higher spend are explained by fields the API returns on every call: stop_reason (max_tokens), output tokens, cache_read_input_tokens, plus the prompt version and trace_id the service adds. One structured record per call makes those queryable: alert rules can watch the max_tokens and cache-miss rates, a group-by on prompt version finds the release, and each finding links to a trace. In the lab, the same incident gives a low-confidence guess from the free-text lines and a cited, two-cause diagnosis from the records.

Why the other answers fall short:

- **B.** Full prompts and responses as text are costly, risky to store and still unqueryable: no rule can count stop_reason in prose.
- **C.** Thumbs-down votes arrive late and say that something is wrong, not why; they cannot see cache misses or token growth.
- **D.** An offline suite tests fixed items, not production traffic, so it can miss a cache miss or a token-cap problem live users hit.

## Why it happens
Free-text lines answer "did something happen?" but not "why?": they carry no trace_id, no prompt version, no token counts and no stop_reason, so no alert rule can be written on them and any diagnosis is a guess. One structured record per Claude call, with the fields the API already returns (model, input and output tokens, cache_read_input_tokens, stop_reason, tool calls) plus your own (trace_id, prompt_version, latency_ms), turns monitoring into queries. Here two simple rules fire on their own, a group-by on prompt_version points at the 10:20 deploy, and Claude's diagnosis can cite trace ids an engineer can open. The incident is the same in both phases; only what was logged changed.

## Exam tip
For production monitoring, pick structured per-call telemetry (tokens, latency, stop_reason, cache reads, model and prompt version, trace ids) with alerts and dashboards. Verbose text logs, user feedback and offline evals are useful but cannot diagnose a live incident on their own.

## Try this next
In docs/sims/shared/d4-kestrel.js, change traffic() so v14 keeps cache_read_input_tokens at 3200: the cache-miss rule stops firing and Claude's diagnosis drops that cause. Then add a field such as squad or customer_tier to each record and ask a sharper question: which squad's calls are truncated?

---
Source: Original question written for C740. Course: Claude Certified Architect - Professional (CCAR-P) Exam Prep (C740). © Tertiary Infotech Academy Pte Ltd · UEN 201200696W
