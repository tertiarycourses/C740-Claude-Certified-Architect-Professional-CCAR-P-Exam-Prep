# Lab 19: 40 tools in every request: load the runbook the incident needs
> Day 1 · Topic 3: Integration · Task statement 3.8 · Simulator 6: Kestrel Platform Team · About 12 minutes · Claude Haiku 5.5

## Goal
Task statement 3.8: **Evaluate progressive discovery vs. monolithic context strategy.** You answer one exam-style question, then run the Kestrel Platform Team simulator and watch the tempting design fail and the right one work, with real Claude calls.

## Open this lab

- **The main lab page:** [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/). It lists all 38 simulator labs, the Day 2 builds (Labs 39 to 41) and the practice exam, and holds the API key box.
- **Run it live in your browser (nothing to install):** open [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=19](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=19), paste your Anthropic API key into the sidebar once, then press **Simulate it live**. Every call uses `claude-haiku-5-5`. The run **stops after the first method** and shows its outcome; press **Proceed** to run the fix, then read the two **side by side** under The observation explained.
- **In a terminal, one click:** double-click `run-lab.command` (Mac) or `run-lab.cmd` (Windows) in this folder. It runs `node docs/tools/test_lab.mjs 19` from the repository root, with the same engine the site uses. It needs Node.js and your key in a `.env` file at the repository root (one line: `ANTHROPIC_API_KEY=sk-ant-...`).
- **The code it runs:** [docs/sims/lab-19.js](https://github.com/tertiarycourses/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/blob/main/docs/sims/lab-19.js), on the shared engine [docs/assets/engine.js](https://github.com/tertiarycourses/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/blob/main/docs/assets/engine.js).

## The scenario
Kestrel Software's platform team is rolling Claude Code out to 40 engineers across four product squads, and runs Claude-powered features in production. The team owns the shared Claude Code configuration, the CI pipeline, the evaluation suite for each prompt change, and the on-call runbooks for incidents in Claude-powered services.

## Key concepts
- **Context is an attention budget.** Every tool definition and document in the request is paid for on every turn and competes for attention. Loading things 'just in case' has a cost.
- **Monolithic: simple, and it grows.** Everything up front is predictable and easy to cache, but request size grows with the catalogue and tool choice gets harder as counts pass about 30 to 50.
- **Progressive: index, search, load.** A one-line index is searched in code; only the runbooks and tools the task needs are loaded into the request, so its size stays close to the task.
- **Keep a hot set loaded.** Tools every task uses (search, load, the incident note) stay in every request. Discovery is for the long tail.
- **The platform's versions.** The Claude API's tool search tool defers tool definitions until searched; Agent Skills load a name and description first and the body only when triggered.

## The question
Kestrel's on-call agent is connected to 40 tools on seven MCP servers and a library of 24 runbooks, all loaded into every request. A typical incident uses one runbook and three or four tools, input tokens per request are well over the team's budget, and the catalogue is expected to triple next quarter. Which context strategy is best?

- **A.** Keep everything loaded and turn on prompt caching for the tool definitions and runbooks, so the repeated prefix costs less on each request.
- **B.** Split the agent into seven subagents, one per MCP server, each loaded with all of its own server's tools and runbooks.
- **C.** Keep a small hot set of tools loaded, and let the agent search an index and load only the runbook and tools the incident needs.
- **D.** Shorten every tool description and runbook to a single line, so that the whole catalogue still fits within the budget.

Pick your answer before you run anything. The answer and the reasoning are at the end, under **Check your answer**.

## Steps on the simulator site
1. Open [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=19](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=19). The left sidebar should say the API key is **saved**. If it says **not set**, paste your key into the **Anthropic API key** box, press **Save**, then **Test**.
2. Read the task statement card and the question. Click the answer you chose. The page tells you at once whether it is right, and why. Open **Why the other answers fall short**.
3. Press **▶ Simulate it live**. The scenario board shows the story, the code runs on the left and Claude's live output appears on the right.
4. When the run pauses, read the outcome of the first method (the trap). Then press **▶ Proceed** to run the fix.
5. Read **Claude's final output**, then **The observation explained**: the two methods side by side, turn by turn, and the checks on what Claude actually did.
6. Open **See the full code this lab runs** and find the lines that make the difference.

## Or run it from a terminal
From the repository root:

```
node docs/tools/test_lab.mjs 19
```

## What you will see
What to look for: Monolithic requests carry about 8,000 input tokens each; progressive requests start with 3 tool definitions, load RB-17 and stay near 2,500, with the same correct action.

These lines are from our own run of this lab on Claude Haiku 5.5. Your wording will differ, because Claude writes each reply fresh; the tool calls, decisions and checks should match. This is an excerpt: wherever … appears, text has been shortened, and a line with only … marks lines left out. Run the lab to see the full output.

```
Incident: INC-5531 (sev 2, opened 06:14 UTC 2026-11-19): checkout-service prod 5xx rate 7.1% and p95 latency 4.8 s since 06:12 UTC. Recent changes: feature flag checkou…
Per-request budget for the on-call agent: 5,000 input tokens
== Phase 1 · monolithic: all 40 tool definitions and all 24 runbooks in every request
Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
  stop_reason: tool_use -> CONTINUE: run the tool, append the result, call Claude again
  -> flag_history({"flag":"checkout.new-tax-engine"})
  <- result: [{"at":"2026-11-19T06:10:02Z","from":"10%","to":"100%","by":"priya.s"},{"at":"2026-11-18T09:00:00Z","from":"0%","to":"10%","by":"priya.s"}]
Turn 2: POST /v1/messages · model claude-haiku-5-5 · 3 messages (tool results appended)
  Claude: The flag went from 10% to 100% at 06:10:02, two minutes before the 06:12 onset, so RB-17 applies. I'm turning the flag off now. I'm not rolling back the deploy.
  stop_reason: tool_use -> CONTINUE: run the tool, append the result, call Claude again
  -> flag_disable({"flag":"checkout.new-tax-engine","reason":"INC-5531: 5xx rate 7.1% and p95 4.8s starting 06:12 UTC, two minutes after …)
  <- result: {"flag":"checkout.new-tax-engine","enabled":false,"effective_in_s":30}
Turn 3: POST /v1/messages · model claude-haiku-5-5 · 5 messages (tool results appended)
  stop_reason: tool_use -> CONTINUE: run the tool, append the result, call Claude again
  -> metrics_query({"service":"checkout-service","metric":"error_rate","minutes":10})
  <- result: {"metric":"error_rate","now":"0.4%","trend":"recovered within 2 minutes"}
Turn 4: POST /v1/messages · model claude-haiku-5-5 · 7 messages (tool results appended)
  stop_reason: tool_use -> CONTINUE: run the tool, append the result, call Claude again
  -> incident_note({"incident":"INC-5531","note":"Cause: feature flag checkout.new-tax-engine was raised 10% -> 100% by priya.s at 06:10:0…)
  <- result: {"ok":true,"incident":"INC-5531","at":"2026-11-19T06:24:00Z"}
Turn 5: POST /v1/messages · model claude-haiku-5-5 · 9 messages (tool results appended)
  stop_reason: end_turn -> STOP: Claude has finished
Reply: I disabled the `checkout.new-tax-engine` flag as the kill switch under RB-17. Checkout error rate is back to 0.4% and the flag is off, with no deploy rollback. O…

== PAUSE · Phase 1 finished: everything in context, every turn
   outcome: 5 requests, **40,071 input tokens** in all, **8,014 per request** against a budget of 5,000. Each carried 40 tool definitions and 24 runbooks; the incident …
   proceed: Phase 2: a hot set of three tools, then search the index and load only what the incident needs

== Phase 2 · progressive discovery: hot set (search_catalog, load, incident_note), load the rest on demand
  index: 64 one-line entries (24 runbooks, 40 tools), searched in code, not sent to Claude
Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message · 3 tool definitions
  stop_reason: tool_use -> CONTINUE: run the tool, append the result, call Claude again
  -> search_catalog({"query":"checkout-service 5xx latency spike feature flag rollback runbook"})
  <- result: [{"id":"deploy_rollback","kind":"tool","summary":"[deploy] Roll a service back to its previous version"},{"id":"RB-17","kind":"runbook","summary":"Er…
Turn 2: POST /v1/messages · model claude-haiku-5-5 · 3 messages · 3 tool definitions
  stop_reason: tool_use -> CONTINUE: run the tool, append the result, call Claude again
  -> load({"ids":["RB-17"]})
  <- result: {"runbooks":["RB-17 Errors after a feature-flag rollout\nWhen: Errors or latency start within 15 minutes of a feature-flag change.\nTools: flag_histo…
Turn 3: POST /v1/messages · model claude-haiku-5-5 · 5 messages · 6 tool definitions
  stop_reason: tool_use -> CONTINUE: run the tool, append the result, call Claude again
  -> flag_history({"flag":"checkout.new-tax-engine"})
  <- result: [{"at":"2026-11-19T06:10:02Z","from":"10%","to":"100%","by":"priya.s"},{"at":"2026-11-18T09:00:00Z","from":"0%","to":"10%","by":"priya.s"}]
Turn 4: POST /v1/messages · model claude-haiku-5-5 · 7 messages · 6 tool definitions
  Claude: The flag changed at 06:10:02 UTC, two minutes before onset at 06:12, which matches RB-17. I'm disabling the flag now and leaving the deploy alone, as the runbo…
…
PASS  Phase 2: flag_disable ran on checkout.new-tax-engine and deploy_rollback did not run

== Side by side
[trap] Phase 1: monolithic context: 5 requests at **8,014 input tokens each** (budget 5,000), 40,071 in all. It took the right action this time; the cost is in what eve…
[fix] Phase 2: progressive discovery: 7 requests at **2,049 input tokens each** (peak 2,958), 14,344 in all. Loaded RB-17 and at most 6 tool definitions. **Disabled che…
  Tool definitions per request | 40 | 3 at first, peak 6 (good)
  Runbooks in context | all 24, every request | RB-17, once loaded (good)
  Requests (turns) | 5 | 7
  Input tokens per request (avg / peak) | 8,014 / 8,560 (bad) | 2,049 / 2,958 (good)
  Input tokens, whole incident | 40,071 (bad) | 14,344 (36%) (good)
  Tool calls | flag_history → flag_disable → metrics_query → incident_note | search_catalog → load → flag_history → flag_disable → metrics_query → incident_note
  Flag disabled, no rollback (RB-17) | yes (good) | yes (good)

12 Claude calls · 54415 in / 2180 out tokens · about US$0.0065 · 15.7 s
```

## Check your answer
**Answer: C.** Progressive discovery keeps the request close to what the task needs: a hot set that every incident uses stays loaded, and the long tail is found through a small index and loaded on demand. The request size stops growing with the catalogue, and Claude chooses among a handful of relevant tools instead of 40. The cost is an extra search turn and the risk of a search miss, which precise names and descriptions reduce.

Why the other answers fall short:

- **A.** Caching lowers the price of a repeated prefix, but every request still carries all 40 tools and 24 runbooks, and the context still grows with the catalogue.
- **B.** Incidents cross servers, so a router must still choose, and each subagent remains monolithic for its own share of the catalogue.
- **D.** One-line descriptions and runbooks lose the steps and constraints that make tool choice and the response correct.

## Why it happens
Everything in the request competes for Claude's attention and is paid for on every turn. A monolithic context grows with the catalogue: 40 tools and 24 runbooks are sent on each of the incident's turns although only RB-17 and four tools matter, and Anthropic's tool-search guidance notes that selection gets harder as tool counts climb past roughly 30 to 50. Progressive discovery keeps a small hot set loaded and lets the agent search a one-line index and load only what the task needs, so the request stays near the same size as the catalogue grows. It costs a search turn or two, and a capability that the search never surfaces is invisible, so descriptions must be precise. The Claude API's tool search tool (defer_loading) and Agent Skills (name and description loaded up front, body on demand) are the platform's versions of the same split.

## Exam tip
Monolithic context fits a small, stable set of tools that every request uses. When the catalogue is large, grows, and each task uses a few items, the exam wants progressive discovery with a hot set. Caching, trimming descriptions and splitting by server do not stop context growing with the catalogue.

## Try this next
In d3b-oncall.js, duplicate SPEC three times with new names to simulate next quarter's 120 tools. Phase 1's tokens per request roughly triple; Phase 2's do not move, because the index search returns 5 lines whatever the catalogue size. Then search for something no description mentions (rename RB-17's title): the cost of progressive discovery is a search miss, so names and descriptions become load-bearing.

---
Source: Original question written for C740. Course: Claude Certified Architect - Professional (CCAR-P) Exam Prep (C740). © Tertiary Infotech Academy Pte Ltd · UEN 201200696W
