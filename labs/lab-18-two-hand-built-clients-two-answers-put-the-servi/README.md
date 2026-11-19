# Lab 18: Two hand-built clients, two answers: put the service behind MCP
> Day 1 · Topic 3: Integration · Task statement 3.7 · Simulator 6: Kestrel Platform Team · About 12 minutes · Claude Haiku 5.5

## Goal
Task statement 3.7: **Evaluate connection protocols and select the appropriate integration mechanism (MCP, API/CLI, agent-to-agent).** You answer one exam-style question, then run the Kestrel Platform Team simulator and watch the tempting design fail and the right one work, with real Claude calls.

## Open this lab

- **The main lab page:** [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/). It lists all 38 simulator labs, the Day 2 builds (Labs 39 to 41) and the practice exam, and holds the API key box.
- **Run it live in your browser (nothing to install):** open [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=18](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=18), paste your Anthropic API key into the sidebar once, then press **Simulate it live**. Every call uses `claude-haiku-5-5`. The run **stops after the first method** and shows its outcome; press **Proceed** to run the fix, then read the two **side by side** under The observation explained.
- **In a terminal, one click:** double-click `run-lab.command` (Mac) or `run-lab.cmd` (Windows) in this folder. It runs `node docs/tools/test_lab.mjs 18` from the repository root, with the same engine the site uses. It needs Node.js and your key in a `.env` file at the repository root (one line: `ANTHROPIC_API_KEY=sk-ant-...`).
- **The code it runs:** [docs/sims/lab-18.js](https://github.com/tertiarycourses/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/blob/main/docs/sims/lab-18.js), on the shared engine [docs/assets/engine.js](https://github.com/tertiarycourses/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/blob/main/docs/assets/engine.js).

## The scenario
Kestrel Software's platform team is rolling Claude Code out to 40 engineers across four product squads, and runs Claude-powered features in production. The team owns the shared Claude Code configuration, the CI pipeline, the evaluation suite for each prompt change, and the on-call runbooks for incidents in Claude-powered services.

## Key concepts
- **Direct API or CLI.** Your code decides exactly what to call. Right for a fixed workflow one application owns, such as tagging a release with an existing CLI in one pipeline.
- **MCP: one server, many hosts.** A server exposes tools, resources and prompts over a standard protocol. Claude Code, CI agents and your own apps discover the same typed tools through tools/list.
- **Agent-to-agent: delegate a goal.** Protocols such as A2A hand a whole task to another team's autonomous agent and get results back, without seeing its tools or reasoning.
- **Bespoke clients drift.** Each hand-built copy encodes the API as it was when written. One copy calling a retired endpoint can return a stale answer that looks valid.
- **Keep credentials out of context.** An MCP server holds the service credential itself, so no API key or personal token appears in a prompt, a tool input or a trace.

## The question
Kestrel's release-calendar service records change freezes. The CI release gate, the on-call agent and 40 engineers' Claude Code sessions all need to check it, and today each team has written its own client from its own copy of the API notes, with its own credential. Which integration mechanism should the platform team choose for the release-calendar service?

- **A.** Expose the service once as an MCP server with typed tools and a server-held credential, registered in the shared .mcp.json.
- **B.** Give each agent a generic HTTP tool and put the current OpenAPI specification in its context, so it can build its own requests.
- **C.** Wrap the service as an autonomous agent behind an agent-to-agent protocol, so other agents delegate freeze checks to it as tasks.
- **D.** Publish a small command-line tool for the service and have every agent call it through a shell tool in its own pipeline.

Pick your answer before you run anything. The answer and the reasoning are at the end, under **Check your answer**.

## Steps on the simulator site
1. Open [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=18](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=18). The left sidebar should say the API key is **saved**. If it says **not set**, paste your key into the **Anthropic API key** box, press **Save**, then **Test**.
2. Read the task statement card and the question. Click the answer you chose. The page tells you at once whether it is right, and why. Open **Why the other answers fall short**.
3. Press **▶ Simulate it live**. The scenario board shows the story, the code runs on the left and Claude's live output appears on the right.
4. When the run pauses, read the outcome of the first method (the trap). Then press **▶ Proceed** to run the fix.
5. Read **Claude's final output**, then **The observation explained**: the two methods side by side, turn by turn, and the checks on what Claude actually did.
6. Open **See the full code this lab runs** and find the lines that make the difference.

## Or run it from a terminal
From the repository root:

```
node docs/tools/test_lab.mjs 18
```

## What you will see
What to look for: Bespoke clients call v1 and v2 and disagree about FRZ-118, with keys in prompts; behind one MCP server both agents find FRZ-118 and no key reaches a model.

These lines are from our own run of this lab on Claude Haiku 5.5. Your wording will differ, because Claude writes each reply fresh; the tool calls, decisions and checks should match. This is an excerpt: wherever … appears, text has been shortened, and a line with only … marks lines left out. Run the lab to see the full output.

```
Kestrel · 2026-11-19T06:30:00Z · two agents need the release calendar for kestrel/checkout-service in prod
== Phase 1 · each team's own client: a generic HTTP tool plus that team's API notes and credential
    CI release gate Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
      stop_reason: tool_use -> CONTINUE: run the tool, append the result, call Claude again
      -> call_release_api({"method":"POST","path":"/v1/freeze-check","headers":{"X-Api-Key":"rk_ci_4f9a2c"},"body":{"service":"checkout-service",…)
      <- result: {"status":200,"service":"checkout-service","environment":"prod","frozen":false}
    CI release gate Turn 2: POST /v1/messages · model claude-haiku-5-5 · 3 messages (tool results appended)
      stop_reason: end_turn -> STOP: Claude has finished (the subagent returns its answer)
    CI release gate answer: DEPLOY. The release calendar freeze check for checkout-service in prod returned frozen: false, so it is clear to deploy. This check covers t…
    On-call agent Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
      stop_reason: tool_use -> CONTINUE: run the tool, append the result, call Claude again
      -> call_release_api({"method":"POST","path":"/v2/freezes/check","headers":{"Authorization":"Bearer pat_dlee_88c1"},"body":{"service":"kestr…)
      <- !! error: {"isError":true,"status":404,"error":"unknown service 'kestrel/checkout-service'. Known services: checkout-service, payments-service, search-service,…
    On-call agent Turn 2: POST /v1/messages · model claude-haiku-5-5 · 3 messages (tool results appended)
      Claude: The API doesn't recognize "kestrel/checkout-service," so I'll retry with the registered name "checkout-service."
      stop_reason: tool_use -> CONTINUE: run the tool, append the result, call Claude again
      -> call_release_api({"method":"POST","path":"/v2/freezes/check","headers":{"Authorization":"Bearer pat_dlee_88c1"},"body":{"service":"check…)
      <- result: {"status":200,"frozen":true,"freeze_id":"FRZ-118","service":"checkout-service","env":"prod","start":"2026-11-19T00:00:00Z","end":"2026-11-21T23:59:00…
    On-call agent Turn 3: POST /v1/messages · model claude-haiku-5-5 · 5 messages (tool results appended)
      stop_reason: end_turn -> STOP: Claude has finished (the subagent returns its answer)
    On-call agent answer: Yes, prod is frozen for checkout-service at 2026-11-19T06:30:00Z under freeze FRZ-118 (Payments ledger migration, running 2026-11-19 00:00 to …

== PAUSE · Phase 1 finished: each team's own client
   outcome: CI release gate called **/v1/freeze-check** and was told **frozen: false**, so it said **DEPLOY**. On-call agent called **/v2/freezes/check** and found **FR…
   proceed: Phase 2: both agents connected to one release-calendar MCP server

== Phase 2 · one release-calendar MCP server: the same typed tool for both agents, credential held by the server
  .mcp.json: {"mcpServers":{"release-calendar":{"type":"http","url":"https://mcp.kestrel.internal/release-calendar"}}}
  tools/list → check_freeze (each host sees mcp__release-calendar__check_freeze)
    CI release gate Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
      stop_reason: tool_use -> CONTINUE: run the tool, append the result, call Claude again
      -> mcp__release-calendar__check_freeze({"service":"checkout-service","env":"prod","at":"2026-11-19T06:30:00Z"})
      <- result: {"frozen":true,"freeze_id":"FRZ-118","service":"checkout-service","env":"prod","start":"2026-11-19T00:00:00Z","end":"2026-11-21T23:59:00Z","reason":"…
    CI release gate Turn 2: POST /v1/messages · model claude-haiku-5-5 · 3 messages (tool results appended)
      stop_reason: end_turn -> STOP: Claude has finished (the subagent returns its answer)
    CI release gate answer: HOLD. Production for checkout-service is under change freeze FRZ-118 (Payments ledger migration) from 2026-11-19T00:00Z to 2026-11-21T23:59Z…
    On-call agent Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
      stop_reason: tool_use -> CONTINUE: run the tool, append the result, call Claude again
      -> mcp__release-calendar__check_freeze({"service":"checkout-service","env":"prod","at":"2026-11-19T06:30:00Z"})
      <- result: {"frozen":true,"freeze_id":"FRZ-118","service":"checkout-service","env":"prod","start":"2026-11-19T00:00:00Z","end":"2026-11-21T23:59:00Z","reason":"…
    On-call agent Turn 2: POST /v1/messages · model claude-haiku-5-5 · 3 messages (tool results appended)
      stop_reason: end_turn -> STOP: Claude has finished (the subagent returns its answer)
    On-call agent answer: Yes, prod is in a change freeze for checkout-service at 2026-11-19T06:30:00Z: freeze FRZ-118 (Payments ledger migration), running 2026-11-19 0…

…
PASS  Phase 1: a credential travelled in a prompt or tool input
PASS  Phase 2: both agents called the same MCP tool and got FRZ-118, with no credential in any prompt or tool input
PASS  Phase 2: both replies name FRZ-118 and the CI gate says HOLD

== Side by side
[trap] Phase 1: each team's own client: CI: frozen: false → DEPLOY · on-call: FRZ-118. **Two agents, one service, opposite answers**: the CI client still calls the reti…
[fix] Phase 2: one release-calendar MCP server: CI: FRZ-118 → HOLD · on-call: FRZ-118. Both agents called the **same typed tool** from tools/list; the server held the c…
  Integration | generic HTTP tool + each team's notes | mcp__release-calendar__check_freeze from tools/list (good)
  Endpoints actually called | /v1/freeze-check, /v2/freezes/check (bad) | the server calls /v2/freezes/check
  What each agent was told | CI: frozen: false → DEPLOY · on-call: FRZ-118 (bad) | CI: FRZ-118 → HOLD · on-call: FRZ-118 (good)
  Credentials in prompts or tool inputs | rk_ci_4f9a2c, pat_dlee_88c1 (bad) | none (good)
  Cost of a third consumer | another client, another key, another copy of the notes | add the server to its .mcp.json (good)

9 Claude calls · 7787 in / 1265 out tokens · about US$0.0014 · 10.6 s
```

## Check your answer
**Answer: A.** A shared internal capability that many AI hosts call is the case MCP was designed for. The platform team writes one server; every host discovers the same typed tools through tools/list; the credential stays in the server; and a change to the API is made once. Direct API or CLI calls suit a one-off scripted step one pipeline owns, and agent-to-agent protocols suit delegating a whole goal to another team's autonomous agent.

Why the other answers fall short:

- **B.** Every host still builds its own requests and holds a credential in context, and the specification costs tokens on every call while each copy drifts.
- **C.** A freeze check is a typed function call, not a goal to delegate; agent-to-agent protocols are for another team's opaque autonomous agent.
- **D.** A CLI suits a scripted step in one place; across many hosts each still wires its own shell tool, credential handling and output parsing.

## Why it happens
Choose the mechanism by who owns each side and who reuses it. A shared internal service that many AI hosts call (CI agents, the on-call agent, 40 engineers' Claude Code sessions) is what MCP is for: write the server once, every host discovers the same typed tools through tools/list, and the credential stays in the server. Hand-built clients drift: each copy encodes the API as it was when that team wrote it, so one still calls a retired endpoint and gets a stale answer that looks valid. A direct API or CLI call is still right for a one-off scripted step that one pipeline owns, such as tagging a release with an existing CLI. An agent-to-agent protocol fits when you hand a whole goal to another team's autonomous agent whose tools you cannot see. A freeze check is neither: it is a typed function call many hosts share.

## Exam tip
Pick the mechanism by the boundary. Many AI hosts reusing one capability: MCP. One application calling a service it owns in a fixed step: direct API or CLI. Handing a goal to another organisation's autonomous agent: agent-to-agent (A2A). Subagents inside your own system are orchestration, not A2A.

## Try this next
Add a third consumer to TASKS in this lab's code, for example a release-notes agent. In Phase 1 it needs its own NOTES entry, its own key and its own copy of the request shape; in Phase 2 it needs nothing new, because tools/list already describes check_freeze to every host. That difference, N bespoke clients against one server, is the MCP argument.

---
Source: Original question written for C740. Course: Claude Certified Architect - Professional (CCAR-P) Exam Prep (C740). © Tertiary Infotech Academy Pte Ltd · UEN 201200696W
