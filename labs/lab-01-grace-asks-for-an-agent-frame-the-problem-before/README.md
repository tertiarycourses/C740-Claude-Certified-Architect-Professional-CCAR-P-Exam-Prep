# Lab 1: Grace asks for an agent: frame the problem before choosing the build
> Day 1 · Topic 1: Solution Design & Architecture · Task statement 1.1 · Simulator 5: Lumen Retail Engagement · About 12 minutes · Claude Haiku 5.5

## Goal
Task statement 1.1: **Translate business problems into Claude-based AI solutions.** You answer one exam-style question, then run the Lumen Retail Engagement simulator and watch the tempting design fail and the right one work, with real Claude calls.

## Open this lab

- **The main lab page:** [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/). It lists all 38 simulator labs, the Day 2 builds (Labs 39 to 41) and the practice exam, and holds the API key box.
- **Run it live in your browser (nothing to install):** open [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=1](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=1), paste your Anthropic API key into the sidebar once, then press **Simulate it live**. Every call uses `claude-haiku-5-5`. The run **stops after the first method** and shows its outcome; press **Proceed** to run the fix, then read the two **side by side** under The observation explained.
- **In a terminal, one click:** double-click `run-lab.command` (Mac) or `run-lab.cmd` (Windows) in this folder. It runs `node docs/tools/test_lab.mjs 1` from the repository root, with the same engine the site uses. It needs Node.js and your key in a `.env` file at the repository root (one line: `ANTHROPIC_API_KEY=sk-ant-...`).
- **The code it runs:** [docs/sims/lab-01.js](https://github.com/tertiarycourses/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/blob/main/docs/sims/lab-01.js), on the shared engine [docs/assets/engine.js](https://github.com/tertiarycourses/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/blob/main/docs/assets/engine.js).

## The scenario
You are the Claude solution architect engaged by Lumen Retail, a 300-store retailer, to deliver an AI product-support assistant. You run discovery with the sponsor, store operations, IT security and legal; agree the service levels; record architecture decisions; hand the build to Lumen's own team; and run the system through monitoring and iteration after go-live. Claude helps you with each step.

## Key concepts
- **The task is the unit of design.** "Automate support" cannot be designed. Split it into tasks (product questions, stock checks, refunds) and give each its own owner: Claude, code or a person.
- **A success metric needs a baseline.** A success criterion names today's measured value, a numeric target and how it will be measured. Without the baseline nobody can show the solution worked.
- **Code for lookups and fixed rules.** Exact stock and price checks, arithmetic and fixed business rules belong in code or an API, which Claude may call. Claude handles judgement over language.
- **The simplest tier that meets the need.** Single call, augmented LLM (retrieval and tools), workflow, agent, multi-agent: each step up buys flexibility with cost, latency and variance. Start low.
- **Constraints are design inputs.** Answer time on the store tablet, SSO, no customer personal data, legal wording and the run-cost budget shape the design before any model is chosen.

## The question
Lumen Retail's COO asks you for "an AI agent that handles store product support end to end" and wants a design by Friday. Discovery data already exists: 2,400 support calls a week, a 7.5-minute average handle time, and a call mix of product questions, stock and price checks, and refund decisions. Which first step best translates this request into a Claude solution?

- **A.** Frame the problem first: the business outcome, a success metric with today's baseline and a target, the constraints, and whether Claude, code or a person does each task; then pick the simplest tier.
- **B.** Build a prototype of the agent Grace asked for with every available tool, pilot it in ten stores, and derive the scope and the success measures from the feedback that store staff give during the pilot.
- **C.** Choose the most capable Claude model and a multi-agent architecture first, because product support spans many domains, then write the prompts and tools for each specialist agent.
- **D.** Build a general chat assistant over all of Lumen's documents and systems, and measure success by weekly active users and staff satisfaction scores after the first month.

Pick your answer before you run anything. The answer and the reasoning are at the end, under **Check your answer**.

## Steps on the simulator site
1. Open [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=1](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=1). The left sidebar should say the API key is **saved**. If it says **not set**, paste your key into the **Anthropic API key** box, press **Save**, then **Test**.
2. Read the task statement card and the question. Click the answer you chose. The page tells you at once whether it is right, and why. Open **Why the other answers fall short**.
3. Press **▶ Simulate it live**. The scenario board shows the story, the code runs on the left and Claude's live output appears on the right.
4. When the run pauses, read the outcome of the first method (the trap). Then press **▶ Proceed** to run the fix.
5. Read **Claude's final output**, then **The observation explained**: the two methods side by side, turn by turn, and the checks on what Claude actually did.
6. Open **See the full code this lab runs** and find the lines that make the difference.

## Or run it from a terminal
From the repository root:

```
node docs/tools/test_lab.mjs 1
```

## What you will see
What to look for: The framed design drops to Claude with retrieval, stock checks in code and refunds with people, measured against a discovery baseline.

These lines are from our own run of this lab on Claude Haiku 5.5. Your wording will differ, because Claude writes each reply fresh; the tool calls, decisions and checks should match. This is an excerpt: wherever … appears, text has been shortened, and a line with only … marks lines left out. Run the lab to see the full output.

```
Lumen Retail · Grace Lim (COO, sponsor): "We want an AI agent that handles store product support end to end. Our competitors have agents. Can you have a design to me by…
Discovery pack: 2,400 calls a week, 7.5-minute handle time, 62% product questions, 23% stock and price checks, 9% refund decisions; answers in 10 s, SSO, no customer PI…
== Phase 1 · solution first: design the agent Grace asked for from the request, before discovery
Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
  stop_reason: end_turn -> STOP: Claude has finished
Reply: {"pattern":"workflow","pattern_reason":"Store product questions fall into a fairly predictable set of types (stock, specs, returns, procedures), so fixed steps o…
Phase 1 design: pattern workflow · metric Share of store product support queries resolved without transfer to head-office product support: ? → 50 percent of queries res…

== PAUSE · Phase 1 finished: the request became the brief
   outcome: The design is **workflow**. Its success metric (Share of store product support queries resolved without transfer to head-office product support: ? → 50 perc…
   proceed: Phase 2: a framing pass first (outcome, metric, constraints, who does what), then the design

== Phase 2 · frame the problem first, then design the simplest tier that meets the frame
    (frame pass) Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
      stop_reason: end_turn -> STOP: Claude has finished (the subagent returns its answer)
    (frame pass) answer: {"business_outcome":"Store staff get product, warranty, stock and price answers at the counter without waiting on head-office support, which sh…
Frame: outcome "Store staff get product, warranty, stock and price answers at the counter without waiting on head-office support, which…" · metric Average handle time p…
    (design pass) Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
      stop_reason: end_turn -> STOP: Claude has finished (the subagent returns its answer)
    (design pass) answer: {"pattern":"augmented_llm","pattern_reason":"Product questions need language judgement over 1,900 manuals and the warranty policy, which a sin…
Phase 2 design: pattern augmented_llm · Product questions need language judgement over 1,900 manuals and the warranty policy, which a single model call with retrieval o…

== Turns
turn 1: stop_reason=end_turn
(frame pass) turn 1: stop_reason=end_turn
(design pass) turn 1: stop_reason=end_turn

== Checks
PASS  Phase 1 (solution first): the success metric has no baseline from measured data
PASS  Phase 2 frame: the success metric's baseline is a figure from the discovery pack, with a numeric target
PASS  Phase 2 frame: stock and price checks go to code, refund decisions to a person
PASS  Phase 2 design: a tier below agent (augmented LLM or workflow)

== Side by side
[trap] Phase 1: design the agent that was asked for: Chose **workflow** from the request alone. Metric: Share of store product support queries resolved without transfer…
[fix] Phase 2: frame first, then the simplest tier: Framed 4 tasks (stock and price → code, refunds → person), anchored the metric at 7.5 minutes, then chose **augmente…
  Framing step before the design | none (bad) | outcome, metric, constraints, tasks (good)
  Chosen tier | workflow (good) | augmented_llm (good)
  Success metric | Share of store product support queries resolved without transfer to head-office product support: ? → 50 percent of queries resolved by AI, measured o…
  Baseline taken from discovery data | no | yes
  Stock and price checks handled by | code (listed) | code (good)
  Refund decisions handled by | people (listed) | person (good)

3 Claude calls · 4452 in / 3891 out tokens · about US$0.0024 · 23.2 s
```

## Check your answer
**Answer: A.** A sponsor's request names a solution; the architect's first deliverable is the problem. Framing turns the request and the discovery data into an outcome, a success metric with a measured baseline and a numeric target, the constraints, and a split of the work: Claude for product questions over the manuals, code for exact stock and price lookups, the store manager for refund decisions. The tier is chosen last, and the simplest one that meets the frame wins. In the lab that was Claude with retrieval, not an agent.

Why the other answers fall short:

- **B.** Building first lets the request set the scope, and success measures derived from pilot feedback have no baseline to be compared with.
- **C.** Choosing the model and the architecture before the problem buys autonomy and cost before anyone knows they are needed.
- **D.** Adoption and satisfaction are not the business outcome; nothing ties them to handle time or cost per call, so the value cannot be shown.

## Why it happens
A sponsor's request names a solution ("an agent"); the architect's first deliverable is the problem. Phase 1 behaves like a team that starts building before discovery: it designs from the request alone. The framing pass turns the request and the discovery data into an outcome, a success metric with a measured baseline and a numeric target, the constraints, and a split of the work: Claude for judgement over language (product questions from manuals), code for exact lookups (stock and price), people for decisions with authority (refunds). Only then is a tier chosen, and the simplest one that meets the frame wins. Phase 1 skips that step, so its tier is a guess (often the agent the request named) and its design has nothing measured to be judged against.

## Exam tip
When a stem quotes a sponsor asking for a technology ("an agent", "multi-agent"), the best answer starts from the problem: outcome, baselined metric, constraints, then the least autonomous tier that meets them.

## Try this next
Edit REQUEST in shared/d1-lumen.js so Grace asks for "a multi-agent system" and run again: Phase 1 tends to follow the request up the autonomy ladder, while Phase 2's tier does not move, because it comes from the frame. Then change the call mix so returns are 60% of calls and watch the frame give more work to people.

---
Source: Original question written for C740. Course: Claude Certified Architect - Professional (CCAR-P) Exam Prep (C740). © Tertiary Infotech Academy Pte Ltd · UEN 201200696W
