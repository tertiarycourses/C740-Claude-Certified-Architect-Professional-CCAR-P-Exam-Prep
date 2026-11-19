# Lab 6: A board pitch with no numbers: sell the value pillar and the SLAs
> Day 1 · Topic 1: Solution Design & Architecture · Task statement 1.6 · Simulator 5: Lumen Retail Engagement · About 12 minutes · Claude Haiku 5.5

## Goal
Task statement 1.6: **Align solutions to business value pillars (efficiency, transformation, productivity, cost, performance SLAs).** You answer one exam-style question, then run the Lumen Retail Engagement simulator and watch the tempting design fail and the right one work, with real Claude calls.

## Open this lab

- **The main lab page:** [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/). It lists all 38 simulator labs, the Day 2 builds (Labs 39 to 41) and the practice exam, and holds the API key box.
- **Run it live in your browser (nothing to install):** open [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=6](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=6), paste your Anthropic API key into the sidebar once, then press **Simulate it live**. Every call uses `claude-haiku-5-5`. The run **stops after the first method** and shows its outcome; press **Proceed** to run the fix, then read the two **side by side** under The observation explained.
- **In a terminal, one click:** double-click `run-lab.command` (Mac) or `run-lab.cmd` (Windows) in this folder. It runs `node docs/tools/test_lab.mjs 6` from the repository root, with the same engine the site uses. It needs Node.js and your key in a `.env` file at the repository root (one line: `ANTHROPIC_API_KEY=sk-ant-...`).
- **The code it runs:** [docs/sims/lab-06.js](https://github.com/tertiarycourses/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/blob/main/docs/sims/lab-06.js), on the shared engine [docs/assets/engine.js](https://github.com/tertiarycourses/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/blob/main/docs/assets/engine.js).

## The scenario
You are the Claude solution architect engaged by Lumen Retail, a 300-store retailer, to deliver an AI product-support assistant. You run discovery with the sponsor, store operations, IT security and legal; agree the service levels; record architecture decisions; hand the build to Lumen's own team; and run the system through monitoring and iteration after go-live. Claude helps you with each step.

## Key concepts
- **Five value pillars.** Efficiency, productivity, transformation, cost and performance SLAs. They pull a design in different directions, so name the primary one.
- **Each pillar has its own metric.** Efficiency: handle time or cost per task. Productivity: output per person. Transformation: something not possible before. Cost: total cost of ownership.
- **SLAs a model can keep.** Availability, p95 latency, answer accuracy on a fixed test set and time to escalate, each with a number and a measurement method, not "fast" and "accurate".
- **Cost per resolved answer.** Price tokens per answer from the list prices (Haiku 5.5 $0.10/$0.50 per million tokens), add review cost, and compare with today's cost per call.

## The question
Lumen Retail's board paper for the store product-support assistant is in draft. It leads with the technology: the Claude models, retrieval over every product manual, and what the system can do. The COO says the board will ask what it is buying and how it will know the service is working. Which revision best aligns the solution to business value?

- **A.** Add a table comparing the chosen model's benchmark scores with competing models, so that the board can see that Lumen is buying the most capable AI technology on the market.
- **B.** Replace the technology section with quotes from staff in the pilot stores and a list of questions the assistant answered well, to show that staff enjoy using it.
- **C.** Promise a 50% cut in support costs and full automation of product support within six months, so that the board has one clear, ambitious headline figure to approve and track.
- **D.** Name the primary value pillar, give metrics with today's baselines and targets, commit to SLAs for availability, p95 latency, accuracy and escalation, and price each answer.

Pick your answer before you run anything. The answer and the reasoning are at the end, under **Check your answer**.

## Steps on the simulator site
1. Open [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=6](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=6). The left sidebar should say the API key is **saved**. If it says **not set**, paste your key into the **Anthropic API key** box, press **Save**, then **Test**.
2. Read the task statement card and the question. Click the answer you chose. The page tells you at once whether it is right, and why. Open **Why the other answers fall short**.
3. Press **▶ Simulate it live**. The scenario board shows the story, the code runs on the left and Claude's live output appears on the right.
4. When the run pauses, read the outcome of the first method (the trap). Then press **▶ Proceed** to run the fix.
5. Read **Claude's final output**, then **The observation explained**: the two methods side by side, turn by turn, and the checks on what Claude actually did.
6. Open **See the full code this lab runs** and find the lines that make the difference.

## Or run it from a terminal
From the repository root:

```
node docs/tools/test_lab.mjs 6
```

## What you will see
What to look for: The value case anchors its metrics to 7.5 minutes and $11.40 and commits to all four service levels with a number and a measurement method.

These lines are from our own run of this lab on Claude Haiku 5.5. Your wording will differ, because Claude writes each reply fresh; the tool calls, decisions and checks should match. This is an excerpt: wherever … appears, text has been shortened, and a line with only … marks lines left out. Run the lab to see the full output.

```
Lumen Retail · Grace Lim (COO, sponsor): "We want an AI agent that handles store product support end to end. Our competitors have agents. Can you have a design to me by…
Price table (code): Haiku 5.5 $0.0008/answer · Sonnet 5.5 $0.0160/answer · Opus 5.5 $0.0320/answer · Fable 5.2 $0.0640/answer; about 6,448 product questions a month; to…
== Phase 1 · capability pitch: the board summary leads with what makes the solution advanced
Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
  stop_reason: end_turn -> STOP: Claude has finished
Reply: **Executive summary: AI-assisted product support for store staff** Store staff currently phone head-office product support while customers wait at the counter. L…
    (audit: capability pitch) Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
      stop_reason: end_turn -> STOP: Claude has finished (the subagent returns its answer)
    (audit: capability pitch) answer: {"primary_pillar":"efficiency","commitments":[{"metric":"Share of current call types answerable by the system","kind":"service_lev…
Audit of the pitch: primary pillar efficiency · 2 commitments · 0 anchored to a discovery baseline · service levels with a number: 0/4 (none)

== PAUSE · Phase 1 finished: the capability pitch
   outcome: The audit found **0 of 4 service levels** with a number and **0 value metrics** anchored to a discovery baseline. Primary pillar: efficiency. The board woul…
   proceed: Phase 2: the same solution written as a value case

== Phase 2 · value case: primary pillar, metrics with baselines, four service levels, model priced per answer
Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
  stop_reason: end_turn -> STOP: Claude has finished
Reply: {"primary_pillar":"efficiency","pillar_reason":"The main value is fewer head-office agent minutes per store enquiry, because about 85% of today's calls (product …
Value case: pillar efficiency · 3 value metrics · 4 service levels · model Claude Sonnet 5.5
Cost in code: Claude Sonnet 5.5 at $0.0160 per answer × 6,448 answers ≈ $103.17 a month in model spend, against $11.40 per call today.
    (audit: value case) Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
      stop_reason: end_turn -> STOP: Claude has finished (the subagent returns its answer)
    (audit: value case) answer: {"primary_pillar":"efficiency","commitments":[{"metric":"Head-office support calls per week","kind":"value","target":1200,"baseline":240…
Audit of the value case: primary pillar efficiency · 7 commitments · 3 anchored to a discovery baseline · service levels with a number: 4/4, with a measurement method: …

== Turns
turn 1: stop_reason=end_turn
(audit: capability pitch) turn 1: stop_reason=end_turn
turn 1: stop_reason=end_turn
(audit: value case) turn 1: stop_reason=end_turn

== Checks
PASS  Phase 1 (capability pitch): the audit finds fewer than 4 service levels with a number and fewer than 2 metrics with a discovery baseline
PASS  Phase 2: the value case names a primary pillar and anchors at least 2 value metrics to discovery baselines
PASS  Phase 2: all four service levels (availability, p95 latency, accuracy, escalation) have a numeric target and a measurement method
PASS  The same audit finds more service-level commitments in the value case than in the capability pitch
PASS  Phase 2: the chosen model is in the price table and code priced it per answer below today's $11.40 per call

== Side by side
[trap] Phase 1: capability pitch: Built around efficiency: 0/4 service levels with a number, 0 metrics anchored to a baseline. Nothing the board could hold the service …
[fix] Phase 2: value case: Built around efficiency: 3 metrics anchored to discovery baselines, 4/4 service levels with targets (4 with a measurement method), Claude Son…
  Primary value pillar (extractor) | efficiency | efficiency (good)
  Measurable commitments found | 2 | 7
  Value metrics with a discovery baseline | none (bad) | Head-office support calls per week 2400→1200; Peak-hour call abandonment rate (percent of calls abandoned after…
  Service levels with a number | 0/4: availability –, p95_latency –, accuracy –, escalation – (bad) | 4/4: availability 99.5, p95_latency 10, accuracy 95, escalation 15…
  Model choice justified by | what makes it advanced | cost per answer ($0.0160) and the latency target

4 Claude calls · 6462 in / 7932 out tokens · about US$0.0046 · 41.4 s
```

## Check your answer
**Answer: D.** A board funds an outcome it can measure, not a model. The architect names the primary value pillar (efficiency, productivity, transformation, cost or performance), expresses it as metrics with a measured baseline and a target, and turns performance into service levels a non-deterministic system can be held to: availability, p95 latency, answer accuracy on a test set and time to escalate, each with a number and a measurement method. The model is then chosen by cost per resolved answer and the latency target.

Why the other answers fall short:

- **A.** Benchmark scores describe the model, not Lumen's outcome; the board still has nothing to hold the service to after go-live.
- **B.** Anecdotes show that people like it, not that handle time or cost moved; nothing is measured against a baseline.
- **C.** A headline promise with no baseline, method or service levels cannot be checked, and "full automation" ignores the tasks that stay with people.

## Why it happens
A board does not fund a model; it funds an outcome it can measure. The value pillars (efficiency, productivity, transformation, cost, performance SLAs) pull a design in different directions, so the architect names the primary one and expresses it as metrics with a measured baseline and a target. Performance becomes service levels a non-deterministic system can actually be held to: availability, p95 latency, answer accuracy on a test set, and time to escalate, each with a number and a way to measure it. Model choice then follows from cost per resolved answer and the latency target, not from which model is newest. The independent extractor makes the difference visible: the same audit, run on both documents, finds the commitments the value case makes and the capability pitch never does.

## Exam tip
When a stem's draft leads with the model or its features, pick the answer that names a value pillar, baselined metrics and measurable SLAs; reject benchmark tables, anecdotes and unmeasured promises.

## Try this next
Change PER_QUERY.calls in shared/d1-lumen.js to 15 (a multi-agent design) and run it again: the cost per answer in the table rises fifteen-fold, and Phase 2's model reasoning has to justify it against the same $11.40 baseline. Then remove the 10-second requirement from the discovery pack and see whether Phase 2's p95 latency target changes.

---
Source: Original question written for C740. Course: Claude Certified Architect - Professional (CCAR-P) Exam Prep (C740). © Tertiary Infotech Academy Pte Ltd · UEN 201200696W
