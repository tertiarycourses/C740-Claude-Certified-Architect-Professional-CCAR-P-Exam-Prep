# Lab 34: A summary drops the runbook and owners: hand off an ADR and a guide
> Day 2 · Topic 6: Stakeholder Communication & Lifecycle Management · Task statement 6.4 · Simulator 5: Lumen Retail Engagement · About 12 minutes · Claude Haiku 5.5

## Goal
Task statement 6.4: **Document architectures and provide implementation guidance.** You answer one exam-style question, then run the Lumen Retail Engagement simulator and watch the tempting design fail and the right one work, with real Claude calls.

## Open this lab

- **The main lab page:** [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/). It lists all 38 simulator labs, the Day 2 builds (Labs 39 to 41) and the practice exam, and holds the API key box.
- **Run it live in your browser (nothing to install):** open [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=34](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=34), paste your Anthropic API key into the sidebar once, then press **Simulate it live**. Every call uses `claude-haiku-5-5`. The run **stops after the first method** and shows its outcome; press **Proceed** to run the fix, then read the two **side by side** under The observation explained.
- **In a terminal, one click:** double-click `run-lab.command` (Mac) or `run-lab.cmd` (Windows) in this folder. It runs `node docs/tools/test_lab.mjs 34` from the repository root, with the same engine the site uses. It needs Node.js and your key in a `.env` file at the repository root (one line: `ANTHROPIC_API_KEY=sk-ant-...`).
- **The code it runs:** [docs/sims/lab-34.js](https://github.com/tertiarycourses/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/blob/main/docs/sims/lab-34.js), on the shared engine [docs/assets/engine.js](https://github.com/tertiarycourses/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/blob/main/docs/assets/engine.js).

## The scenario
You are the Claude solution architect engaged by Lumen Retail, a 300-store retailer, to deliver an AI product-support assistant. You run discovery with the sponsor, store operations, IT security and legal; agree the service levels; record architecture decisions; hand the build to Lumen's own team; and run the system through monitoring and iteration after go-live. Claude helps you with each step.

## Key concepts
- **Architecture Decision Records.** Title, context, decision, status, consequences, and the alternatives that lost. A superseded ADR is marked, not deleted, so the history stays readable.
- **Behaviour lives outside the code.** In a Claude system the model ID, prompts, tools, retrieval corpus and evals shape behaviour. Each must be versioned and documented, not only the code.
- **Pin and record the model ID.** Name the exact model ID and the file it is set in. A change of model is a release, gated by the eval suite like any prompt change.
- **Runbooks with thresholds and steps.** "Escalation rate above 12% for two days: check index freshness, re-run evals, roll back if below 92%" can be acted on. "Monitor quality" cannot.
- **A named owner per component.** Prompt and evals, retrieval index, on-call, and the decision itself. Without owners, a handoff becomes a question nobody can answer.

## The question
Your engagement with Lumen Retail ends in three weeks. Lumen's in-house team will then run the product-support assistant and change its prompts, retrieval and model on their own. Which documentation best prepares them to do that without you?

- **A.** An ADR per key decision with its context, consequences and rejected alternatives, plus an implementation guide with interfaces, the pinned model ID, runbooks and owners.
- **B.** The final steering-committee slide deck with the architecture diagram, the business case and the pilot results, saved on the shared drive where the team can find it later.
- **C.** Recorded walkthrough sessions in which the architect explains the code, prompts and retrieval set-up, so the team can replay them whenever a question comes up after handoff.
- **D.** Thorough comments throughout the code, prompts and configuration files, so the documentation lives next to the implementation and stays in step with every future change.

Pick your answer before you run anything. The answer and the reasoning are at the end, under **Check your answer**.

## Steps on the simulator site
1. Open [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=34](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=34). The left sidebar should say the API key is **saved**. If it says **not set**, paste your key into the **Anthropic API key** box, press **Save**, then **Test**.
2. Read the task statement card and the question. Click the answer you chose. The page tells you at once whether it is right, and why. Open **Why the other answers fall short**.
3. Press **▶ Simulate it live**. The scenario board shows the story, the code runs on the left and Claude's live output appears on the right.
4. When the run pauses, read the outcome of the first method (the trap). Then press **▶ Proceed** to run the fix.
5. Read **Claude's final output**, then **The observation explained**: the two methods side by side, turn by turn, and the checks on what Claude actually did.
6. Open **See the full code this lab runs** and find the lines that make the difference.

## Or run it from a terminal
From the repository root:

```
node docs/tools/test_lab.mjs 34
```

## What you will see
What to look for: The summary has none of the nine sections and the newcomer can answer few questions; ADR-007 and the guide have all nine and the newcomer answers all five.

These lines are from our own run of this lab on Claude Haiku 5.5. Your wording will differ, because Claude writes each reply fresh; the tool calls, decisions and checks should match. This is an excerpt: wherever … appears, text has been shortened, and a line with only … marks lines left out. Run the lab to see the full output.

```
Lumen Retail · The engagement ends in three weeks. Write the architecture handoff document for Lumen's in-house dev team, who will run and change the product-support as…
== Phase 1 · architecture summary: a high-level handoff in prose
Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
  stop_reason: end_turn -> STOP: Claude has finished
Reply: The Lumen product-support assistant answers store staff and customer questions through a single `POST /assist` endpoint, using Claude Haiku 5.5 (pinned in `confi…
    (Phase 1 reader: new Lumen developer) Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
      stop_reason: end_turn -> STOP: Claude has finished (the subagent returns its answer)
    (Phase 1 reader: new Lumen developer) answer: {"answers":[{"q":1,"found":false,"answer":"The document names the model as Claude Haiku 5.5 and says it is pinned in c…

== PAUSE · Phase 1 finished: the high-level summary
   outcome: The summary reads well, but it has **0 of 9** handoff sections and the new developer could answer **0 of 5** questions from it (Q1, Q2, Q3, Q4, Q5 missing).…
   proceed: Phase 2: the same notes as ADR-007 plus an implementation guide with interfaces, runbook and owners

== Phase 2 · ADR-007 + implementation guide: context, decision, consequences, alternatives; interfaces, runbook, owners
Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
  stop_reason: end_turn -> STOP: Claude has finished
Reply: # ADR-007: Use Claude Haiku 5.5 with catalogue retrieval for the product-support assistant ## Context Lumen's product-support assistant answers customer product …
    (Phase 2 reader: new Lumen developer) Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
      stop_reason: end_turn -> STOP: Claude has finished (the subagent returns its answer)
    (Phase 2 reader: new Lumen developer) answer: {"answers":[{"q":1,"found":true,"answer":"The assistant uses model ID claude-haiku-5-5, pinned in config/assistant.yam…
  Q1 ✓ The assistant uses model ID claude-haiku-5-5, pinned in config/assistant.yaml.
  Q2 ✓ Request fields are store_id, session_id, and question (POST /assist). Response fields are answer, sources[], and escalate. When escalate is…
  Q3 ✓ The runbook's first step is to open the Assistant health dashboard and confirm the escalation rate has been above 12% for two days. Since t…
  Q4 ✓ Arun Pillai, Lumen AI team, owns the prompt and eval suite.
  Q5 ✓ Sonnet 5.5 was rejected because its p95 latency of 3.6 s breaks the 3-second requirement, despite 95.0% accuracy, and it costs about US$9,6…

== Turns
turn 1: stop_reason=end_turn
(Phase 1 reader: new Lumen developer) turn 1: stop_reason=end_turn
turn 1: stop_reason=end_turn
(Phase 2 reader: new Lumen developer) turn 1: stop_reason=end_turn

== Checks
PASS  Phase 1: the summary (a real reply, not empty) leaves the new developer unable to answer at least 2 of the 5 handoff questions
PASS  Phase 2: ADR-007 has Context, Decision, Status, Consequences and Alternatives considered
PASS  Phase 2: the implementation guide has Interfaces, Configuration, Runbook and Owners
PASS  Phase 2: the new developer answered all 5 handoff questions with the right facts (model ID, fields, index check, Arun, Sonnet)

== Side by side
[trap] Phase 1: high-level architecture summary: Accurate and readable, but **0 of 9 sections**, and the newcomer answered **0 of 5** handoff questions. The model ID fi…
[fix] Phase 2: ADR-007 + implementation guide: All nine sections present, and the newcomer answered **all five questions** from the document alone: the pinned model, th…
  Document shape | prose summary | ADR (why) + implementation guide (how, who) (good)
  Sections found by heading | 0/9 (bad) | 9/9 (good)
  Q1: Which exact model ID does the assistant use, and in which f… | not found (bad) | answered (good)
  Q2: What are the request and response fields of the assistant's… | not found (bad) | answered (good)
  Q3: The dashboard confirms the escalation rate has been above 1… | not found (bad) | answered (good)
  Q4: Who owns the prompt and the eval suite? | not found (bad) | answered (good)
  Q5: Which alternatives were rejected, and why? | not found (bad) | answered (good)

4 Claude calls · 4688 in / 4740 out tokens · about US$0.0028 · 22.6 s
```

## Check your answer
**Answer: A.** A receiving team needs the why, the how and the who. Architecture Decision Records keep the context, the consequences and the alternatives that lost, so a later change is made knowingly. The implementation guide keeps the exact interfaces, the pinned model ID and where it is set, numbered runbook steps with thresholds, and a named owner for each part.

Why the other answers fall short:

- **B.** A steering deck is written for executives: it carries the business case, not the interfaces, runbook steps or owners an engineer needs at 2 a.m.
- **C.** Recordings cannot be searched or versioned, and they still leave decisions, thresholds and owners for the team to dig out of hours of video.
- **D.** Code comments explain local behaviour; they cannot hold why alternatives were rejected, the runbook, or who owns the prompt and the eval suite.

## Why it happens
Both phases document the same working notes for the same team. A high-level summary is the usual handoff, and it loses exactly what the receiving team needs when the architect is gone: the pinned model ID, the interface fields, the runbook threshold and first step, the owners, and why the alternatives lost. Phase 2 splits the knowledge into an Architecture Decision Record (context, decision, status, consequences, alternatives), which keeps the why, and an implementation guide (interfaces, configuration, runbook, owners), which keeps the how and the who. Code checks the sections by heading, and a newcomer who sees only the document shows whether the handoff survives the architect's absence.

## Exam tip
When the question is about handoff to another team, pick the answer that records decisions with their alternatives and gives actionable implementation detail: interfaces, configuration, runbooks and owners. Decks, recordings and code comments each cover only part of it.

## Try this next
Delete the Owners heading from ADR in this lab and run it again: watch question 4 fail even though the notes name Arun Pillai. Then add a sixth question of your own, such as "what score must a prompt change reach before release?", and see which document answers it.

---
Source: Original question written for C740. Course: Claude Certified Architect - Professional (CCAR-P) Exam Prep (C740). © Tertiary Infotech Academy Pte Ltd · UEN 201200696W
