# Lab 33: "99.99% and always correct" breaks on day one: commit to measured SLOs
> Day 2 · Topic 6: Stakeholder Communication & Lifecycle Management · Task statement 6.3 · Simulator 5: Lumen Retail Engagement · About 12 minutes · Claude Haiku 5.5

## Goal
Task statement 6.3: **Manage stakeholder feedback loops and expectation alignment (including SLAs).** You answer one exam-style question, then run the Lumen Retail Engagement simulator and watch the tempting design fail and the right one work, with real Claude calls.

## Open this lab

- **The main lab page:** [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/). It lists all 38 simulator labs, the Day 2 builds (Labs 39 to 41) and the practice exam, and holds the API key box.
- **Run it live in your browser (nothing to install):** open [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=33](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=33), paste your Anthropic API key into the sidebar once, then press **Simulate it live**. Every call uses `claude-haiku-5-5`. The run **stops after the first method** and shows its outcome; press **Proceed** to run the fix, then read the two **side by side** under The observation explained.
- **In a terminal, one click:** double-click `run-lab.command` (Mac) or `run-lab.cmd` (Windows) in this folder. It runs `node docs/tools/test_lab.mjs 33` from the repository root, with the same engine the site uses. It needs Node.js and your key in a `.env` file at the repository root (one line: `ANTHROPIC_API_KEY=sk-ant-...`).
- **The code it runs:** [docs/sims/lab-33.js](https://github.com/tertiarycourses/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/blob/main/docs/sims/lab-33.js), on the shared engine [docs/assets/engine.js](https://github.com/tertiarycourses/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/blob/main/docs/assets/engine.js).

## The scenario
You are the Claude solution architect engaged by Lumen Retail, a 300-store retailer, to deliver an AI product-support assistant. You run discovery with the sponsor, store operations, IT security and legal; agree the service levels; record architecture decisions; hand the build to Lumen's own team; and run the system through monitoring and iteration after go-live. Claude helps you with each step.

## Key concepts
- **SLI, SLO, SLA.** An SLI is a measure (p95 latency). An SLO is a target for it (3 s or less). An SLA is the agreement with consequences when an SLO is missed.
- **Two families of SLO.** Operational SLOs are measured on every request. Quality SLOs, such as accuracy, are rates estimated on a graded sample, so the sample size is part of the promise.
- **A rate is an estimate.** 374 correct out of 400 is 93.5%, but the Wilson 95% interval runs from about 90.6% to 95.5%. Promise below the lower bound, not at the point estimate.
- **Error budgets turn arguments into rules.** 99.5% availability allows about 126 minutes of store hours a month. When it is spent, changes stop until reliability is fixed.
- **Feedback has a cadence and an owner.** A monthly review of the SLOs, store feedback and the weekly graded sample, chaired by a named owner, keeps expectations and the system aligned.

## The question
Lumen's COO wants the board pack to promise that the store assistant will be available 99.99% of the time and that its answers will always be correct. The six-week pilot in 20 stores measured 99.82% availability, a p95 latency of 2.4 seconds and 374 correct answers out of 400 graded by product specialists. What should you propose?

- **A.** Accept 99.99% availability and always-correct answers as stretch goals in the board pack, and report progress against both of those targets every month.
- **B.** Commit to 99.99% availability by moving to a multi-region deployment, and replace the accuracy promise with a disclaimer that answers may sometimes be wrong.
- **C.** Make no service commitment in the board pack until the assistant has run in production for six months and there is more data to go on.
- **D.** Agree SLOs from the pilot results for availability, latency, accuracy on a graded sample and hand-over time, with an error budget and a monthly review.

Pick your answer before you run anything. The answer and the reasoning are at the end, under **Check your answer**.

## Steps on the simulator site
1. Open [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=33](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=33). The left sidebar should say the API key is **saved**. If it says **not set**, paste your key into the **Anthropic API key** box, press **Save**, then **Test**.
2. Read the task statement card and the question. Click the answer you chose. The page tells you at once whether it is right, and why. Open **Why the other answers fall short**.
3. Press **▶ Simulate it live**. The scenario board shows the story, the code runs on the left and Claude's live output appears on the right.
4. When the run pauses, read the outcome of the first method (the trap). Then press **▶ Proceed** to run the fix.
5. Read **Claude's final output**, then **The observation explained**: the two methods side by side, turn by turn, and the checks on what Claude actually did.
6. Open **See the full code this lab runs** and find the lines that make the difference.

## Or run it from a terminal
From the repository root:

```
node docs/tools/test_lab.mjs 33
```

## What you will see
What to look for: Phase 1's commitments are already breached by the pilot; Phase 2's are all met, with an error budget and a review cadence.

These lines are from our own run of this lab on Claude Haiku 5.5. Your wording will differ, because Claude writes each reply fresh; the tool calls, decisions and checks should match. This is an excerpt: wherever … appears, text has been shortened, and a line with only … marks lines left out. Run the lab to see the full output.

```
Lumen Retail · Grace Lim (COO): "For the board pack, say the assistant will be available 99.99% of the time and that its answers are always correct." Draft the service …
(The pilot measured availability 99.82%, p95 2.4 s, accuracy 374/400 = 93.5% (Wilson 95% 90.6–95.5%), hand-over p90 95 s, critical errors 0.5%.)
== Phase 1 · promise the ask: commitments written from the sponsor's wish, pilot not read
Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
  stop_reason: end_turn -> STOP: Claude has finished
Reply: {"slos":[{"sli":"availability_pct","kind":"operational","comparator":">=","target":99.9,"window":"calendar month","method":"Synthetic probe every minute from sto…
  BREACH availability >= 99.9% · pilot 99.82
  met    p95_latency <= 3 s · pilot 2.4
  BREACH graded_accuracy >= 95% · pilot 93.5
  met    critical_error_rate <= 0.5% · pilot 0.5
  met    escalation_handover <= 120 s · pilot 95

== PAUSE · Phase 1 finished: the sponsor's wish, written as commitments
   outcome: **The pilot already misses 2 of 5 commitments** (availability >= 99.9%; graded_accuracy >= 95%). The board would be promised something the system broke befo…
   proceed: Phase 2: the same request, with the pilot metrics read first, SLOs, an error budget and a feedback cadence

== Phase 2 · SLOs from the pilot: read the metrics, set targets the pilot meets, error budget and feedback cadence
Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
  stop_reason: tool_use -> CONTINUE: run the tool, append the result, call Claude again
  -> get_pilot_metrics({})
  <- result: {"stores":20,"weeks":6,"requests":61400,"availability_pct":99.82,"p95_latency_s":2.4,"p50_latency_s":1.1,"graded_accuracy_pct":93.5,"graded_sample":4…
Turn 2: POST /v1/messages · model claude-haiku-5-5 · 3 messages (tool results appended)
  stop_reason: end_turn -> STOP: Claude has finished
Reply: {"slos":[{"sli":"availability_pct","kind":"operational","comparator":">=","target":99.5,"window":"calendar month, store hours 08:00-22:00","method":"Share of all…
  met    availability >= 99.5% · pilot 99.82
  met    p95_latency <= 3 s · pilot 2.4
  met    escalation_handover <= 120 s · pilot 95
  met    graded_accuracy >= 90% · pilot 93.5 · sample 400
  met    critical_error_rate <= 1% · pilot 0.5 · sample 400

== Turns
turn 1: stop_reason=end_turn
turn 1: stop_reason=tool_use tools=get_pilot_metrics
turn 2: stop_reason=end_turn

== Checks
PASS  Phase 1: the pilot already breaches at least one commitment written from the sponsor's ask
PASS  Phase 2: get_pilot_metrics ran before any commitment was drafted, and the pilot meets every target (4+ SLIs)
PASS  Phase 2: every quality SLO is a rate on a stated graded sample of 100 or more
PASS  Phase 2: the error budget freezes or rolls back changes when spent, and a weekly-to-monthly review has an owner

== Side by side
[trap] Phase 1: promise the sponsor's ask: **2 of 5 commitments are already broken by the pilot** (availability >= 99.9%; graded_accuracy >= 95%). No measurement stands…
[fix] Phase 2: SLOs from the pilot, error budget, feedback: Every target is one the pilot meets; accuracy is a rate on a 400-answer sample; when the budget is spent: fr…
  Pilot metrics read before drafting | no (bad) | yes, first call (good)
  Commitments (✓ pilot meets it, ✗ already breached) | availability >= 99.9% ✗ · p95_latency <= 3 s ✓ · graded_accuracy >= 95% ✗ · critical_error_rate <= 0.5% ✓ · escal…
  Breached on day one | 2 (bad) | 0 (good)
  Quality SLOs measured on a stated sample | 200, 200 | graded_accuracy: 400, critical_error_rate: 400 (good)
  Error budget, when spent | freeze changes and fix | freeze changes and fix (good)
  Feedback cadence and owner | fortnightly, Farid Rahman, store operation… | weekly, Arun Pillai, Lead of Lumen's … (good)

3 Claude calls · 5465 in / 3665 out tokens · about US$0.0024 · 20.5 s
```

## Check your answer
**Answer: D.** Commitments a stakeholder can rely on come from measurement. Operational targets (availability, latency, hand-over time) are set where the pilot already meets them; accuracy is a rate on a stated graded sample, because 374 of 400 is an estimate, not a per-answer guarantee. An error budget says what happens when the misses add up, and a regular review with store operations keeps expectations and feedback aligned.

Why the other answers fall short:

- **A.** A target the pilot already misses is broken on the day it is promised, and "always correct" is not a property any model-based system can measure or keep.
- **B.** More regions may lift availability, but it is engineering to a wish at unknown cost, and a disclaimer removes the quality commitment instead of measuring it.
- **C.** Six months without agreed targets leaves the board with no expectations and the team with no feedback loop, so the misalignment simply grows.

## Why it happens
Both phases answer the same request from the sponsor. Phase 1 writes the targets she asked for without measuring anything, and code finds that the six-week pilot already misses them: a promise broken on the day it is made. Phase 2 reads the pilot metrics first. Availability, p95 latency and escalation hand-over are operational SLOs measured on every request; accuracy and critical errors are quality rates measured on a graded sample with its size stated, because 374 correct out of 400 is an estimate (Wilson 95% interval about 90.6% to 95.5%), not a guarantee. The error budget says what happens when it is spent, and the feedback cadence says who reviews what, how often. The sponsor's original ask goes back to her with the evidence.

## Exam tip
For LLM systems, accept answers that split operational SLOs from quality measured on a sample, and that pair targets with an error budget and a review cadence. Reject "always correct", stretch targets the evidence already misses, and deferring commitments altogether.

## Try this next
Change PILOT.availability_pct in shared/d6-lumen.js to 99.4 and run Phase 2 again: the availability target moves with the evidence. Then ask for a 99% accuracy target in the prompt and see where Phase 2 puts it (sponsor_note, with what it would take).

---
Source: Original question written for C740. Course: Claude Certified Architect - Professional (CCAR-P) Exam Prep (C740). © Tertiary Infotech Academy Pte Ltd · UEN 201200696W
