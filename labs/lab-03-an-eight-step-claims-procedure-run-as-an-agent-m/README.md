# Lab 3: An eight-step claims procedure run as an agent: make it a workflow
> Day 1 · Topic 1: Solution Design & Architecture · Task statement 1.3 · Simulator 1: Harbour Mutual Claims Desk · About 12 minutes · Claude Haiku 5.5

## Goal
Task statement 1.3: **Select appropriate architectural patterns (workflow, agentic, augmented LLM).** You answer one exam-style question, then run the Harbour Mutual Claims Desk simulator and watch the tempting design fail and the right one work, with real Claude calls.

## Open this lab

- **The main lab page:** [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/). It lists all 38 simulator labs, the Day 2 builds (Labs 39 to 41) and the practice exam, and holds the API key box.
- **Run it live in your browser (nothing to install):** open [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=3](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=3), paste your Anthropic API key into the sidebar once, then press **Simulate it live**. Every call uses `claude-haiku-5-5`. The run **stops after the first method** and shows its outcome; press **Proceed** to run the fix, then read the two **side by side** under The observation explained.
- **In a terminal, one click:** double-click `run-lab.command` (Mac) or `run-lab.cmd` (Windows) in this folder. It runs `node docs/tools/test_lab.mjs 3` from the repository root, with the same engine the site uses. It needs Node.js and your key in a `.env` file at the repository root (one line: `ANTHROPIC_API_KEY=sk-ant-...`).
- **The code it runs:** [docs/sims/lab-03.js](https://github.com/tertiarycourses/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/blob/main/docs/sims/lab-03.js), on the shared engine [docs/assets/engine.js](https://github.com/tertiarycourses/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/blob/main/docs/assets/engine.js).

## The scenario
Harbour Mutual Insurance is replacing its first-line motor-claims triage with a Claude-based claims agent. The agent reads policies and claims, requests damage assessments, drafts customer letters, and can approve payouts or escalate to a human adjuster. Adjusters, the finance controller and the regulator all have a stake in how it is built. Claims arrive as free-text forms, photos and repair quotes.

## Key concepts
- **Workflow or agent: who owns the path.** In a workflow, code decides the next step, so every path can be listed and tested. In an agent, Claude decides at run time, so its behaviour varies between runs.
- **The augmented LLM.** A model with retrieval, tools and memory is the building block of both patterns. A workflow can call one at just the steps that need judgement.
- **Autonomy is a purchase.** An agent buys coverage of paths you cannot write down. You pay in tokens (each turn re-reads the conversation), latency, variance and auditability.
- **Rules and arithmetic in code.** Payout = the lower of quote and assessed cost, minus the excess; approve only within $5,000. Code computes and enforces these the same way every time.

## The question
Harbour Mutual's motor claims follow a fixed, documented procedure: get the claim and policy, check cover, request an assessment above $2,000, check the description against the assessment, compute the payout, approve or escalate, and write the letter. The current build is a fully autonomous agent holding all six tools. Cost per claim is several times the forecast, and auditors cannot list the paths it may take. Which pattern best fits?

- **A.** Keep the agent but list the procedure as numbered steps in its system prompt and lower its turn limit, so that it follows the documented order at a lower cost per claim.
- **B.** Move to a multi-agent design in which a supervisor agent checks each step the claims agent takes against the procedure before it lets the next step run.
- **C.** Upgrade to the most capable Claude model, so that the agent plans the whole procedure in fewer turns and makes fewer mistakes in the order of its tool calls.
- **D.** Run the procedure as a workflow in code and call Claude only at the judgement steps: checking the description against the assessment, and writing the letter.

Pick your answer before you run anything. The answer and the reasoning are at the end, under **Check your answer**.

## Steps on the simulator site
1. Open [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=3](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=3). The left sidebar should say the API key is **saved**. If it says **not set**, paste your key into the **Anthropic API key** box, press **Save**, then **Test**.
2. Read the task statement card and the question. Click the answer you chose. The page tells you at once whether it is right, and why. Open **Why the other answers fall short**.
3. Press **▶ Simulate it live**. The scenario board shows the story, the code runs on the left and Claude's live output appears on the right.
4. When the run pauses, read the outcome of the first method (the trap). Then press **▶ Proceed** to run the fix.
5. Read **Claude's final output**, then **The observation explained**: the two methods side by side, turn by turn, and the checks on what Claude actually did.
6. Open **See the full code this lab runs** and find the lines that make the difference.

## Or run it from a terminal
From the repository root:

```
node docs/tools/test_lab.mjs 3
```

## What you will see
What to look for: The workflow ran the eight steps in order with two Claude calls and a small fraction of the agent's input tokens.

These lines are from our own run of this lab on Claude Haiku 5.5. Your wording will differ, because Claude writes each reply fresh; the tool calls, decisions and checks should match. This is an excerpt: wherever … appears, text has been shortened, and a line with only … marks lines left out. Run the lab to see the full output.

```
Harbour Mutual · CLM-7781: Priya Nair, rear bumper, quote $4,200, policy HM-POL-2201 (comprehensive, excess $500).
== Phase 1 · fully agentic: the claims agent chooses every step and tool in its own loop
Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
  stop_reason: tool_use -> CONTINUE: run the tool, append the result, call Claude again
  -> get_claim({"claim_id":"CLM-7781"})
  <- result: {"claim_id":"CLM-7781","policy_id":"HM-POL-2201","claimant":"Priya Nair","type":"own_damage","incident_date":"2026-10-28","description":"Reversing ou…
Turn 2: POST /v1/messages · model claude-haiku-5-5 · 3 messages (tool results appended)
  stop_reason: tool_use -> CONTINUE: run the tool, append the result, call Claude again
  -> get_policy({"policy_id":"HM-POL-2201"})
  <- result: {"policy_id":"HM-POL-2201","holder":"Priya Nair","cover":"comprehensive","excess":500,"status":"active","start":"2025-03-01","wording":"Comprehensive…
Turn 3: POST /v1/messages · model claude-haiku-5-5 · 5 messages (tool results appended)
  Claude: The policy is active and comprehensive cover includes accidental damage. The repair quote is $4,200, which is over $2,000, so I need an independent assessment.
  stop_reason: tool_use -> CONTINUE: run the tool, append the result, call Claude again
  -> request_assessment({"claim_id":"CLM-7781"})
  <- result: {"assessment_id":"AS-3302","claim_id":"CLM-7781","assessor":"Coastline Loss Assessors","assessed_cost":4150,"findings":"Rear bumper cover cracked, le…
Turn 4: POST /v1/messages · model claude-haiku-5-5 · 7 messages (tool results appended)
  Claude: The assessment matches the claim: cracked bumper, a damaged sensor bracket, and paint transfer consistent with a reversing impact. Payout is the lower of the q…
  stop_reason: tool_use -> CONTINUE: run the tools, append the results, call Claude again
  -> approve_payout({"claim_id":"CLM-7781","amount":3650})
  <- result: {"approved":true,"claim_id":"CLM-7781","amount":3650}
  -> draft_letter({"claim_id":"CLM-7781","text":"Dear Priya Nair, your claim CLM-7781 for rear bumper and parking sensor damage has been …)
  <- result: {"saved":true}
Turn 5: POST /v1/messages · model claude-haiku-5-5 · 9 messages (tool results appended)
  stop_reason: end_turn -> STOP: Claude has finished
Reply: Claim CLM-7781 is processed and the payout of $3,650 is approved. - **Policy:** HM-POL-2201 is active with comprehensive cover, which includes accidental damage.…
Phase 1: 5 Claude turns, 8,023 input tokens; path get_claim → get_policy → request_assessment → approve_payout → draft_letter; paid $3,650

== PAUSE · Phase 1 finished: the agent ran the procedure
   outcome: The agent took **5 turns** and **8,023 input tokens** (each turn re-reads the whole conversation) to run a sequence that was written down in advance, and pa…
   proceed: Phase 2: the procedure in code, Claude only at the two judgement steps

== Phase 2 · workflow: the procedure in code, Claude only at the judgement steps
Step 1 · get_claim: CLM-7781, quote $4,200
Step 2 · get_policy: HM-POL-2201, comprehensive, excess $500
Step 3 · check_cover: covered
Step 4 · request_assessment: AS-3302: assessed $4,150
    (judgement: consistency) Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
      stop_reason: end_turn -> STOP: Claude has finished (the subagent returns its answer)
    (judgement: consistency) answer: {"consistent": true, "concerns": []}
Step 5 · judge_consistency: Claude: consistent true
Step 6 · compute_payout: min(4200, 4150) - 500 = $3,650
Step 7 · approve_or_escalate: approved $3,650 (within $5,000)
    (judgement: letter) Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
      stop_reason: end_turn -> STOP: Claude has finished (the subagent returns its answer)
…
PASS  Phase 2 used under half the input tokens of Phase 1
PASS  Phase 2: code computed and approved the $3,650 payout, and the letter states it

== Side by side
[trap] Phase 1: fully agentic: 5 turns and 8,023 input tokens for a fixed procedure; paid $3,650. The path was decided at run time.
[fix] Phase 2: workflow, Claude at the judgement steps: 8 steps in documented order, 2 Claude calls, 728 input tokens (9% of Phase 1); paid $3,650.
  Who chooses the next step | Claude, every turn (bad) | code (the procedure) (good)
  Steps or tools, in order | get_claim → get_policy → request_assessment → approve_payout → draft_letter | get_claim → get_policy → check_cover → request_assessment → j…
  Claude calls | 5 (bad) | 2 (good)
  Input tokens | 8,023 (bad) | 728 (good)
  Payout | $3,650 | $3,650
  Path known before the run (auditable) | no (bad) | yes (good)

7 Claude calls · 8751 in / 1425 out tokens · about US$0.0016 · 10.8 s
```

## Check your answer
**Answer: D.** Anthropic distinguishes workflows, where code orchestrates the model and tools along predefined paths, from agents, where the model directs its own steps. A procedure you can write down needs no autonomy. The workflow makes every path enumerable and auditable, keeps the arithmetic and the $5,000 authority rule in code, and uses Claude as an augmented LLM only where judgement over language is needed. In the lab it used two Claude calls and a small fraction of the agent's input tokens for the same payout.

Why the other answers fall short:

- **A.** The prompt makes the order more likely, but the model still owns the control flow, so cost varies and the paths still cannot be listed in advance.
- **B.** A supervisor adds calls and cost to police a sequence that code could simply run.
- **C.** A larger model costs more per token and still chooses its path at run time; it fixes neither cost nor auditability.

## Why it happens
Anthropic separates workflows, where code orchestrates the model and tools on predefined paths, from agents, where the model directs its own steps. Harbour Mutual's procedure is fixed and written down, so the agent buys nothing it needs: it pays in Claude calls and tokens (each turn re-reads the whole conversation), in a path that can vary between runs, and in an audit trail that can only be read after the fact. The workflow keeps the control flow, the arithmetic and the authority rule in code, and uses Claude as an augmented LLM at the two steps that need judgement over language. Reach for an agent when you cannot write the steps down in advance.

## Exam tip
"Fixed", "documented" or "known sequence" in a stem points to a workflow. Keep agents for tasks whose steps you cannot write down in advance.

## Try this next
Run the lab two or three times and compare Phase 1's tool order and turn count between runs: the agent's path is a distribution you sample, while Phase 2's audit trail never changes. Then change ASSESSMENT.findings to say the paint transfer is from a front impact: only the judgement step changes its answer, and the workflow escalates.

---
Source: Original question written for C740. Course: Claude Certified Architect - Professional (CCAR-P) Exam Prep (C740). © Tertiary Infotech Academy Pte Ltd · UEN 201200696W
