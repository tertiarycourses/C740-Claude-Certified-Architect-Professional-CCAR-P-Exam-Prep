# Lab 15: Grep blames the prompt; traces show inventory_lookup's p95 spike
> Day 1 · Topic 3: Integration · Task statement 3.4 · Simulator 6: Kestrel Platform Team · About 12 minutes · Claude Haiku 5.5

## Goal
Task statement 3.4: **Analyze observability challenges and select monitoring strategies at scale.** You answer one exam-style question, then run the Kestrel Platform Team simulator and watch the tempting design fail and the right one work, with real Claude calls.

## Open this lab

- **The main lab page:** [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/). It lists all 38 simulator labs, the Day 2 builds (Labs 39 to 41) and the practice exam, and holds the API key box.
- **Run it live in your browser (nothing to install):** open [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=15](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=15), paste your Anthropic API key into the sidebar once, then press **Simulate it live**. Every call uses `claude-haiku-5-5`. The run **stops after the first method** and shows its outcome; press **Proceed** to run the fix, then read the two **side by side** under The observation explained.
- **In a terminal, one click:** double-click `run-lab.command` (Mac) or `run-lab.cmd` (Windows) in this folder. It runs `node docs/tools/test_lab.mjs 15` from the repository root, with the same engine the site uses. It needs Node.js and your key in a `.env` file at the repository root (one line: `ANTHROPIC_API_KEY=sk-ant-...`).
- **The code it runs:** [docs/sims/lab-15.js](https://github.com/tertiarycourses/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/blob/main/docs/sims/lab-15.js), on the shared engine [docs/assets/engine.js](https://github.com/tertiarycourses/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/blob/main/docs/assets/engine.js).

## The scenario
Kestrel Software's platform team is rolling Claude Code out to 40 engineers across four product squads, and runs Claude-powered features in production. The team owns the shared Claude Code configuration, the CI pipeline, the evaluation suite for each prompt change, and the on-call runbooks for incidents in Claude-powered services.

## Key concepts
- **LLM failures often return 200 OK.** A slow, truncated or wrong answer still succeeds at the HTTP level. Uptime and error-rate dashboards miss it; you need per-step latency, tokens, stop_reason and quality signals.
- **One trace, a span per step.** Each request gets a trace_id; each model call, tool call, retrieval and subagent gets a span with its latency, tokens and status, so a slow request can be taken apart.
- **Version everything that can change.** Put the prompt version, model id, effort, index build and tool schema version on each trace, so a regression can be tied to the change that caused it.
- **Percentiles, grouped by dimension.** Compare p95 by span, version or stop_reason before and after a change. Means hide the slow tail that users and SLAs feel.
- **Metadata always, content sampled.** Keep ids, timings, sizes and versions for every request; keep prompt and completion text only when sampled, access-controlled and time-limited.

## The question
After 14:00, p95 response time for Kestrel's Claude-powered checkout assistant more than doubled. The on-call engineer spent an hour grepping service logs that record each request's total duration, model API calls and retries, but nothing that links lines to a request or times the steps inside it, and suspected a prompt change made at 14:10. Which monitoring strategy best addresses this class of incident at scale?

- **A.** Raise every service to DEBUG logging during incidents so each tool call and model call appears as its own line in the raw logs.
- **B.** Alert on the service's mean response time per hour, with a dashboard comparing each hour against last week.
- **C.** Store the full text of every prompt and completion so that engineers can replay and read the slowest conversations after an incident.
- **D.** Emit one trace per request with a span per model and tool call, carrying trace_id, tokens, latency and stop_reason.

Pick your answer before you run anything. The answer and the reasoning are at the end, under **Check your answer**.

## Steps on the simulator site
1. Open [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=15](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=15). The left sidebar should say the API key is **saved**. If it says **not set**, paste your key into the **Anthropic API key** box, press **Save**, then **Test**.
2. Read the task statement card and the question. Click the answer you chose. The page tells you at once whether it is right, and why. Open **Why the other answers fall short**.
3. Press **▶ Simulate it live**. The scenario board shows the story, the code runs on the left and Claude's live output appears on the right.
4. When the run pauses, read the outcome of the first method (the trap). Then press **▶ Proceed** to run the fix.
5. Read **Claude's final output**, then **The observation explained**: the two methods side by side, turn by turn, and the checks on what Claude actually did.
6. Open **See the full code this lab runs** and find the lines that make the difference.

## Or run it from a terminal
From the repository root:

```
node docs/tools/test_lab.mjs 15
```

## What you will see
What to look for: Grepping raw logs, Claude blamed a coincidence (the 429 retries or the 14:10 prompt reload); querying traces, it grouped p95 by span, found tool:inventory_lookup at 250 ms before and about 5,080 ms after 14:00, and cited real trace_ids.

These lines are from our own run of this lab on Claude Haiku 5.5. Your wording will differ, because Claude writes each reply fresh; the tool calls, decisions and checks should match. This is an excerpt: wherever … appears, text has been shortened, and a line with only … marks lines left out. Run the lab to see the full output.

```
INC-2291 · checkout-assistant · p95 3.1 s before 14:00, 7.1 s after · 480 requests between 12:00 and 16:00
== Phase 1 · grep the raw service logs: text lines, total duration only, no trace_id
Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
  stop_reason: tool_use -> CONTINUE: run the tools, append the results, call Claude again
  -> grep_logs({"pattern":"latency|slow|timeout|retry|upstream|model|dependency","from":"13:45","to":"14:15"})
  <- result: {"matches":1,"lines":["2026-11-19 14:14:43 WARN anthropic-client 429 rate_limit_error, retrying in 0.8s"]}
  -> grep_logs({"pattern":"WARN|ERROR","from":"13:45","to":"14:15"})
  <- result: {"matches":1,"lines":["2026-11-19 14:14:43 WARN anthropic-client 429 rate_limit_error, retrying in 0.8s"]}
Turn 2: POST /v1/messages · model claude-haiku-5-5 · 3 messages (tool results appended)
  stop_reason: tool_use -> CONTINUE: run the tools, append the results, call Claude again
  -> grep_logs({"pattern":"anthropic-client|p95|latency_ms|rate_limit|retry"})
  <- result: {"matches":1203,"lines":["2026-11-19 12:00:44 INFO anthropic-client POST /v1/messages 200","2026-11-19 12:00:44 INFO anthropic-client POST /v1/messag…
  -> grep_logs({"pattern":"tool_call|cart|inventory|pricing|db|postgres|redis|cache","from":"13:50","to":"14:10"})
  <- result: {"matches":0,"lines":[]}
Turn 3: POST /v1/messages · model claude-haiku-5-5 · 5 messages (tool results appended)
  stop_reason: tool_use -> CONTINUE: run the tools, append the results, call Claude again
  -> grep_logs({"pattern":"429|rate_limit_error|retrying"})
  <- result: {"matches":15,"lines":["2026-11-19 14:14:43 WARN anthropic-client 429 rate_limit_error, retrying in 0.8s","2026-11-19 14:23:07 WARN anthropic-client …
  -> grep_logs({"pattern":"\\d+ms|duration|elapsed|took","from":"13:55","to":"14:05"})
  <- !! error: {"isError":true,"message":"Investigation budget of 5 calls used. File your finding now with what you have measured."}
Turn 4: POST /v1/messages · model claude-haiku-5-5 · 7 messages (tool results appended)
  stop_reason: tool_use -> CONTINUE: run the tool, append the result, call Claude again
  -> file_incident_finding({"cause":"anthropic-client upstream rate limiting (429s)","metric":"anthropic-client 429 rate_limit_error count per 2h …)
  <- result: {"filed":true,"incident":"INC-2291"}
Turn 5: POST /v1/messages · model claude-haiku-5-5 · 9 messages (tool results appended)
  stop_reason: end_turn -> STOP: Claude has finished
Reply: I filed INC-2291 with low confidence. The likely cause is upstream rate limiting on the model API, but the evidence does not yet explain the full slowdown. **Wha…

== PAUSE · Phase 1 finished: grep over raw logs
   outcome: Finding: **anthropic-client upstream rate limiting (429s) · anthropic-client 429 rate_limit_error count per 2h window (12:00-16:00): 0 -> 15 · confidence lo…
   proceed: Phase 2: the same incident and prompt, with a structured trace store to query

== Phase 2 · query structured traces: one trace per request, a span per model call and tool call
Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
  stop_reason: tool_use -> CONTINUE: run the tools, append the results, call Claude again
  -> query_traces({"group_by":"span","metric":"latency_ms","stat":"p95","window":"both"})
  <- result: {"metric":"latency_ms","stat":"p95","group_by":"span","rows":[{"group":"model_call","before":859,"n_before":592,"after":865,"n_after":596,"slowest_tr…
  -> query_traces({"group_by":"prompt_version","metric":"latency_ms","stat":"p95","window":"both"})
  <- result: {"metric":"latency_ms","stat":"p95","group_by":"prompt_version","rows":[{"group":"v41","before":3080,"n_before":240,"after":6470,"n_after":20,"slowes…
  -> query_traces({"group_by":"model","metric":"latency_ms","stat":"p95","window":"both"})
  <- result: {"metric":"latency_ms","stat":"p95","group_by":"model","rows":[{"group":"claude-haiku-5-5","before":3080,"n_before":240,"after":7070,"n_after":240,"s…
Turn 2: POST /v1/messages · model claude-haiku-5-5 · 3 messages (tool results appended)
  stop_reason: tool_use -> CONTINUE: run the tool, append the result, call Claude again
  -> get_trace({"trace_id":"tr-2ba78d"})
…
PASS  Phase 2: the finding names inventory_lookup as the cause
PASS  Phase 2: the finding's before/after match the store (about 250 -> 5081 ms p95)
PASS  Phase 2: the finding cites trace_ids that exist in the store

== Side by side
[trap] Phase 1: grep the raw logs: Blamed **anthropic-client upstream rate limiting (429s)**. The logs show requests got slower, and what else happened nearby, but not …
[fix] Phase 2: query the structured traces: Grouped p95 latency by span: model_call flat, **tool:inventory_lookup 250 ms -> 5081 ms**. The finding cites 3 real trace_ids.
  What Claude could query | grep_logs over 1,690 text lines | query_traces + get_trace over 480 traces (good)
  Investigation calls | 6 | 4
  Cause named in the finding | anthropic-client upstream rate limiting (429s) (bad) | tool:inventory_lookup (slow tool dependency) (good)
  Before/after matches the store (inventory_lookup p95 250 -> 5081 ms) | no (bad) | yes (good)
  Real trace_ids cited as evidence | 0 | 3 (good)

9 Claude calls · 24523 in / 3573 out tokens · about US$0.0042 · 19.8 s
```

## Check your answer
**Answer: D.** The question during an LLM incident is which step inside a request moved. A trace per request, correlated by trace_id, with a span for every model call and tool call carrying latency, tokens, stop_reason and the versions that can change, answers it with one grouped query. In the lab, grouping p95 latency by span shows model calls flat and inventory_lookup rising from about 250 ms to about 5,080 ms, and the prompt change ruled out because requests on the old prompt were already slow.

Why the other answers fall short:

- **A.** DEBUG logs add volume and cost but still lack a trace_id to correlate lines and per-step timings to aggregate, and they only exist once an incident has started.
- **B.** A mean hides the slow tail and an alert only says that something is slow, not which span; the incident was already detected.
- **C.** Full prompt and completion logs add privacy risk and storage cost without timing a single span; reading conversations cannot show where the time went.

## Why it happens
The raw logs record that each request finished and how long it took, plus whatever else happened to be logged: model calls, a few 429 retries, a prompt reload at 14:10. They carry no trace_id to tie lines together and no timing for the steps inside a request, so grep can show that requests got slower but not where the time went, and the most visible coincidence (the prompt reload, or the retries) becomes the suspect. The trace store holds the same afternoon as one trace per request, with a span for every model call and tool call and the prompt version, tokens, retries and stop_reason on each. One query grouped by span answers the question: model_call latency is flat, inventory_lookup's p95 rose about twentyfold at 14:00, and the slowest trace_ids are the evidence. That is the monitoring strategy that scales: emit structured, correlated spans with the versions of everything that can change, and query them; raising log levels, averaging a dashboard or storing every conversation in full does not tell you which span moved.

## Exam tip
For observability at scale, prefer structured, correlated traces (trace_id, a span per step, tokens, latency, stop_reason, versions) queried by percentile. More log volume, mean-based dashboards and full-content logging are distractors.

## Try this next
In Phase 2, ask Claude to rule out the prompt change first: query_traces grouped by prompt_version shows v41 requests were already slow at 14:00-14:09, before v42 loaded. Then edit d3a-traces.js so price_quote also slows after 14:00 and see whether the span query separates the two.

---
Source: Original question written for C740. Course: Claude Certified Architect - Professional (CCAR-P) Exam Prep (C740). © Tertiary Infotech Academy Pte Ltd · UEN 201200696W
