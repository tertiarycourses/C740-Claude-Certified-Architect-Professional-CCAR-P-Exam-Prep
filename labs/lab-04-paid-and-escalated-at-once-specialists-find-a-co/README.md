# Lab 4: Paid and escalated at once: specialists find, a coordinator decides
> Day 1 · Topic 1: Solution Design & Architecture · Task statement 1.4 · Simulator 1: Harbour Mutual Claims Desk · About 12 minutes · Claude Haiku 5.5

## Goal
Task statement 1.4: **Design multi-agent systems and orchestration strategies.** You answer one exam-style question, then run the Harbour Mutual Claims Desk simulator and watch the tempting design fail and the right one work, with real Claude calls.

## Open this lab

- **The main lab page:** [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/). It lists all 38 simulator labs, the Day 2 builds (Labs 39 to 41) and the practice exam, and holds the API key box.
- **Run it live in your browser (nothing to install):** open [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=4](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=4), paste your Anthropic API key into the sidebar once, then press **Simulate it live**. Every call uses `claude-haiku-5-5`. The run **stops after the first method** and shows its outcome; press **Proceed** to run the fix, then read the two **side by side** under The observation explained.
- **In a terminal, one click:** double-click `run-lab.command` (Mac) or `run-lab.cmd` (Windows) in this folder. It runs `node docs/tools/test_lab.mjs 4` from the repository root, with the same engine the site uses. It needs Node.js and your key in a `.env` file at the repository root (one line: `ANTHROPIC_API_KEY=sk-ant-...`).
- **The code it runs:** [docs/sims/lab-04.js](https://github.com/tertiarycourses/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/blob/main/docs/sims/lab-04.js), on the shared engine [docs/assets/engine.js](https://github.com/tertiarycourses/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/blob/main/docs/assets/engine.js).

## The scenario
Harbour Mutual Insurance is replacing its first-line motor-claims triage with a Claude-based claims agent. The agent reads policies and claims, requests damage assessments, drafts customer letters, and can approve payouts or escalate to a human adjuster. Adjusters, the finance controller and the regulator all have a stake in how it is built. Claims arrive as free-text forms, photos and repair quotes.

## Key concepts
- **When multi-agent pays.** Anthropic names three cases: context pollution, parallel lines of inquiry, and specialisation (narrower tools or conflicting instructions). Elsewhere, coordination costs more than it returns.
- **Split by the context needed.** Give each subagent only the data its job needs: the policy wording for coverage, the assessment for damage, the invoice registry for fraud.
- **Findings, not actions.** Subagents return structured findings (status, amount, evidence) and hold no tool that changes anything. Only the coordinator acts.
- **Reconcile before acting.** The coordinator applies one explicit rule across all findings, for example that any flag goes to an adjuster, before the single decision.
- **More agents, more tokens.** Each subagent is another context window and more calls, so cost and latency rise. Split only where that buys accuracy or coverage.

## The question
Harbour Mutual's single claims agent has grown to 14 tools and one long prompt covering coverage, damage assessment and fraud screening. The team will split it into coverage, damage and fraud specialists, each given only the part of the claim file it needs. Which orchestration strategy is best?

- **A.** Run the three specialists as peer agents in parallel, each authorised to approve the payout or escalate the claim within its own remit, so that claims settle faster.
- **B.** Keep one agent, but move the fraud-screening instructions to the top of its prompt and add a rule that it must finish every check before it calls approve_payout.
- **C.** Have a coordinator spawn the specialists as subagents that return structured findings and hold no action tools, then reconcile the findings before one payout decision.
- **D.** Chain the specialists in sequence, coverage then damage then fraud, each passing its complete transcript to the next one, so that the fraud agent has seen everything before it acts.

Pick your answer before you run anything. The answer and the reasoning are at the end, under **Check your answer**.

## Steps on the simulator site
1. Open [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=4](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=4). The left sidebar should say the API key is **saved**. If it says **not set**, paste your key into the **Anthropic API key** box, press **Save**, then **Test**.
2. Read the task statement card and the question. Click the answer you chose. The page tells you at once whether it is right, and why. Open **Why the other answers fall short**.
3. Press **▶ Simulate it live**. The scenario board shows the story, the code runs on the left and Claude's live output appears on the right.
4. When the run pauses, read the outcome of the first method (the trap). Then press **▶ Proceed** to run the fix.
5. Read **Claude's final output**, then **The observation explained**: the two methods side by side, turn by turn, and the checks on what Claude actually did.
6. Open **See the full code this lab runs** and find the lines that make the difference.

## Or run it from a terminal
From the repository root:

```
node docs/tools/test_lab.mjs 4
```

## What you will see
What to look for: The coordinator read three findings, saw the fraud flag on invoice RQ-5531, and made one decision: escalate, nothing paid.

These lines are from our own run of this lab on Claude Haiku 5.5. Your wording will differ, because Claude writes each reply fresh; the tool calls, decisions and checks should match. This is an excerpt: wherever … appears, text has been shortened, and a line with only … marks lines left out. Run the lab to see the full output.

```
Harbour Mutual · CLM-7781: Priya Nair, rear bumper, quote $4,200 from Bayside Panel Works, invoice RQ-5531. Policy HM-POL-2201, excess $500.
== Phase 1 · peer specialists: the lead agent fans out to coverage, damage and fraud agents that may each settle their part
Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
  stop_reason: tool_use -> CONTINUE: run the tools, append the results, call Claude again
  -> Agent({"remit":"coverage","prompt":"New claim CLM-7781 under policy HM-POL-2201. Repairing garage: Bayside Panel Works. Pleas…)
    (peer coverage) Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
      stop_reason: tool_use -> CONTINUE: run the tool, append the result, call Claude again
      -> approve_payout({"claim_id":"CLM-7781","amount":3650})
      <- result: {"approved":true,"claim_id":"CLM-7781","amount":3650}
    (peer coverage) Turn 2: POST /v1/messages · model claude-haiku-5-5 · 3 messages (tool results appended)
      stop_reason: end_turn -> STOP: Claude has finished (the subagent returns its answer)
    (peer coverage) answer: **Coverage determination for CLM-7781 (policy HM-POL-2201):** Covered, and I approved a payout of $3,650. - **Policy period and status:** Th…
  <- result: **Coverage determination for CLM-7781 (policy HM-POL-2201):** Covered, and I approved a payout of $3,650. - **Policy period and status:** The policy …
  -> Agent({"remit":"damage","prompt":"New claim CLM-7781 under policy HM-POL-2201. Repairing garage: Bayside Panel Works. Please …)
    (peer damage) Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
      stop_reason: tool_use -> CONTINUE: run the tool, append the result, call Claude again
      -> approve_payout({"claim_id":"CLM-7781","amount":4150})
      <- result: {"approved":true,"claim_id":"CLM-7781","amount":4150}
    (peer damage) Turn 2: POST /v1/messages · model claude-haiku-5-5 · 3 messages (tool results appended)
      stop_reason: end_turn -> STOP: Claude has finished (the subagent returns its answer)
    (peer damage) answer: I approved a payout of US$4,150 on CLM-7781, the independently assessed repair cost, which is US$50 below Bayside Panel Works' US$4,200 quote.…
  <- result: I approved a payout of US$4,150 on CLM-7781, the independently assessed repair cost, which is US$50 below Bayside Panel Works' US$4,200 quote. - **Da…
  -> Agent({"remit":"fraud","prompt":"New claim CLM-7781 under policy HM-POL-2201. Repairing garage: Bayside Panel Works. Please s…)
    (peer fraud) Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
      stop_reason: tool_use -> CONTINUE: run the tool, append the result, call Claude again
      -> escalate_to_adjuster({"claim_id":"CLM-7781","reason":"Fraud screen failed; not settling within my remit. (1) Duplicate invoice: RQ-5531 (Bay…)
      <- result: {"queued":true}
    (peer fraud) Turn 2: POST /v1/messages · model claude-haiku-5-5 · 3 messages (tool results appended)
      stop_reason: end_turn -> STOP: Claude has finished (the subagent returns its answer)
    (peer fraud) answer: I escalated CLM-7781 to a human adjuster and did not approve the $4,200 payout, because the invoice it relies on (RQ-5531) is already recorded …
  <- result: I escalated CLM-7781 to a human adjuster and did not approve the $4,200 payout, because the invoice it relies on (RQ-5531) is already recorded as pai…
Turn 2: POST /v1/messages · model claude-haiku-5-5 · 3 messages (tool results appended)
  stop_reason: end_turn -> STOP: Claude has finished
Reply: CLM-7781 has been routed to the coverage, damage and fraud specialists, but the outcomes conflict and payment should be held. - **Coverage** approved $3,650, whi…
Phase 1 actions on CLM-7781: coverage: approve_payout $3,650 | damage: approve_payout $4,150 | fraud: escalate (Fraud screen failed; not settling within my remit. (1) D…

== PAUSE · Phase 1 finished: three specialists, three separate actions
   outcome: **The coverage agent approved $3,650; The damage agent approved $4,150** while the fraud agent escalated because invoice RQ-5531 was already paid on CLM-612…
   proceed: Phase 2: the same specialists as read-only subagents; the coordinator reconciles before it acts

== Phase 2 · coordinator: read-only subagents return findings; the coordinator reconciles them, then acts once
Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
  stop_reason: tool_use -> CONTINUE: run the tools, append the results, call Claude again
  -> Agent({"remit":"coverage","prompt":"Claim CLM-7781 under policy HM-POL-2201, repairer Bayside Panel Works. Determine whether …)
…
PASS  Phase 2: the fraud subagent's finding flagged RQ-5531 as already paid on CLM-6120
PASS  Phase 2: the coordinator reconciled the findings and made one decision: escalate, nothing paid

== Side by side
[trap] Phase 1: peer specialists that each settle: **Paid $7,800 and escalated the same claim**: coverage, damage, fraud each acted on a partial view, and no step recon…
[fix] Phase 2: coordinator reconciles read-only findings: Coverage found $3,650 due, the fraud subagent flagged RQ-5531 (paid on CLM-6120), and the coordinator made **o…
  Specialists and their slices | coverage, damage, fraud (same) | coverage, damage, fraud (same)
  Who can approve a payout | every specialist (bad) | only the coordinator (good)
  Actions on CLM-7781 | coverage: approve_payout $3,650 | damage: approve_payout $4,150 | fraud: escalate (Fraud screen failed; not settling within my remit. (1) Duplic…
  Duplicate RQ-5531 / CLM-6120 found | yes, by the fraud agent | yes, in the fraud finding (good)
  Where the results meet | nowhere (bad) | the coordinator, before acting (good)
  Claude calls · input tokens | 8 · 20,042 | 6 · 13,835

14 Claude calls · 33877 in / 9140 out tokens · about US$0.0080 · 48.2 s
```

## Check your answer
**Answer: C.** A split is worth it when the work needs different contexts, but it raises the orchestration question: where do the results meet? Subagents that only find, each with its own slice of the claim file and no tool that changes anything, return structured findings (status, amount, evidence). One coordinator reconciles them with an explicit rule (any flag goes to a person) and makes the only payout decision, so no specialist can act on a partial view.

Why the other answers fall short:

- **A.** Each peer acts on a partial view: in the lab one approved a payout while the fraud agent escalated the same claim, and nothing reconciled them.
- **B.** It keeps the overloaded context and the payout power in one place, and relies on a sentence in the prompt to enforce the order.
- **D.** Passing whole transcripts forward rebuilds one crowded context and adds latency, and detail is lost or distorted at each handoff.

## Why it happens
Splitting an overloaded agent is worth it when the work needs different contexts: the policy wording, the assessment and a 30-row invoice registry are mostly noise to each other. But a split creates the orchestration question: who decides? In Phase 1 every specialist can act, so each acts on a partial view; the coverage agent pays a claim the fraud agent is escalating, and no step ever sees both results. In Phase 2 the specialists only find: each returns a structured finding (status, amount, evidence) and holds no tool that changes anything. The coordinator reconciles the findings with one rule (any flag goes to a person) and makes the only payout decision. More agents cost more calls and tokens, so split only where contexts pollute each other or the work runs in parallel, and always say where the results meet.

## Exam tip
In a multi-agent stem, ask where the results meet before anything acts. Prefer read-only subagents returning structured findings to one coordinator over peers that can each act.

## Try this next
Change the duplicate row in shared/d1-claimfile.js to a fresh invoice number and run it again: in Phase 2 the fraud finding comes back clear and the coordinator approves the coverage subagent's $3,650. Then give the Phase 2 subagents the approve_payout tool as well and watch the reconciliation stop mattering.

---
Source: Original question written for C740. Course: Claude Certified Architect - Professional (CCAR-P) Exam Prep (C740). © Tertiary Infotech Academy Pte Ltd · UEN 201200696W
