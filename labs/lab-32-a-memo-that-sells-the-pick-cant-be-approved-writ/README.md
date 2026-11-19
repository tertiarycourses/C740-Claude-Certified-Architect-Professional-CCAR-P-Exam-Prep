# Lab 32: A memo that sells the pick can't be approved: write the record
> Day 2 · Topic 6: Stakeholder Communication & Lifecycle Management · Task statement 6.2 · Simulator 5: Lumen Retail Engagement · About 12 minutes · Claude Haiku 5.5

## Goal
Task statement 6.2: **Communicate architectural decisions and trade-offs.** You answer one exam-style question, then run the Lumen Retail Engagement simulator and watch the tempting design fail and the right one work, with real Claude calls.

## Open this lab

- **The main lab page:** [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/). It lists all 38 simulator labs, the Day 2 builds (Labs 39 to 41) and the practice exam, and holds the API key box.
- **Run it live in your browser (nothing to install):** open [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=32](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=32), paste your Anthropic API key into the sidebar once, then press **Simulate it live**. Every call uses `claude-haiku-5-5`. The run **stops after the first method** and shows its outcome; press **Proceed** to run the fix, then read the two **side by side** under The observation explained.
- **In a terminal, one click:** double-click `run-lab.command` (Mac) or `run-lab.cmd` (Windows) in this folder. It runs `node docs/tools/test_lab.mjs 32` from the repository root, with the same engine the site uses. It needs Node.js and your key in a `.env` file at the repository root (one line: `ANTHROPIC_API_KEY=sk-ant-...`).
- **The code it runs:** [docs/sims/lab-32.js](https://github.com/tertiarycourses/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/blob/main/docs/sims/lab-32.js), on the shared engine [docs/assets/engine.js](https://github.com/tertiarycourses/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/blob/main/docs/assets/engine.js).

## The scenario
You are the Claude solution architect engaged by Lumen Retail, a 300-store retailer, to deliver an AI product-support assistant. You run discovery with the sponsor, store operations, IT security and legal; agree the service levels; record architecture decisions; hand the build to Lumen's own team; and run the system through monitoring and iteration after go-live. Claude helps you with each step.

## Key concepts
- **The architect owns the options.** Measure each option on the client's own eval data. The accountable stakeholder owns the choice, so they must see the alternatives, not only the pick.
- **Trade-offs in the reader's units.** The COO thinks in money, staff time and service; IT security in data, access and controls. Same facts, different order and units.
- **A decision record outlives the meeting.** Context, options, decision, consequences and status, written down. A newcomer can then see why, instead of accepting or reversing it blindly.
- **Name the reversal trigger.** A measured result that would change the decision, such as weekly accuracy below 90% for two weeks. It turns a debate into a monitor.
- **Effort in proportion to reversibility.** A model swap behind a stable interface is cheap to undo. Data-residency or write-access decisions are not, and get the full analysis and sign-off.

## The question
You have chosen Claude Haiku 5.5 with retrieval for Lumen's assistant over Claude Sonnet 5.5 with retrieval and over a larger human hotline. Grace Lim (COO) must approve the budget and Hannah Koh (IT security lead) must approve the data flow before the build starts. How should you communicate the decision?

- **A.** Send both leaders the same one-page summary explaining why the chosen option is the best fit for Lumen, with the architecture diagram attached for reference.
- **B.** Write a decision record with the options, their measured accuracy, latency and cost, the risks and a reversal trigger, then brief each leader in their own terms.
- **C.** Present the full benchmark tables, the token-level cost model and the retrieval settings to both leaders so they can weigh every detail and reach their own conclusion.
- **D.** Present only the recommended option at the steering meeting, and keep the analysis of the alternatives in reserve in case one of the leaders challenges it.

Pick your answer before you run anything. The answer and the reasoning are at the end, under **Check your answer**.

## Steps on the simulator site
1. Open [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=32](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=32). The left sidebar should say the API key is **saved**. If it says **not set**, paste your key into the **Anthropic API key** box, press **Save**, then **Test**.
2. Read the task statement card and the question. Click the answer you chose. The page tells you at once whether it is right, and why. Open **Why the other answers fall short**.
3. Press **▶ Simulate it live**. The scenario board shows the story, the code runs on the left and Claude's live output appears on the right.
4. When the run pauses, read the outcome of the first method (the trap). Then press **▶ Proceed** to run the fix.
5. Read **Claude's final output**, then **The observation explained**: the two methods side by side, turn by turn, and the checks on what Claude actually did.
6. Open **See the full code this lab runs** and find the lines that make the difference.

## Or run it from a terminal
From the repository root:

```
node docs/tools/test_lab.mjs 32
```

## What you will see
What to look for: Phase 1's readers can answer only a few of their 6 questions; Phase 2's readers answer all 6 from their brief and the record.

These lines are from our own run of this lab on Claude Haiku 5.5. Your wording will differ, because Claude writes each reply fresh; the tool calls, decisions and checks should match. This is an excerpt: wherever … appears, text has been shortened, and a line with only … marks lines left out. Run the lab to see the full output.

```
Lumen Retail · Write the communication of the assistant architecture decision for two readers: Grace Lim (COO), who approves the budget, and Hannah Koh (IT security lea…
== Phase 1 · sell the pick: a memo built from the chosen option only
Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
  stop_reason: end_turn -> STOP: Claude has finished
Reply: **Decision: Option A, Claude Haiku 5.5 with retrieval over the product catalogue** **To:** Grace Lim (COO), Hannah Koh (IT Security Lead) **From:** Architecture …
    (Phase 1 reader: COO) Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
      stop_reason: end_turn -> STOP: Claude has finished (the subagent returns its answer)
    (Phase 1 reader: COO) answer: {"answers":[{"q":1,"answerable":false,"answer":"not stated"},{"q":2,"answerable":false,"answer":"The document states Option A costs ab…
    (Phase 1 reader: IT security) Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
      stop_reason: end_turn -> STOP: Claude has finished (the subagent returns its answer)
    (Phase 1 reader: IT security) answer: {"answers":[{"q":1,"answerable":true,"answer":"The document states that the assistant retrieves information from the product c…
Phase 1 result: the readers could answer 1 of 6 questions from the memo.

== PAUSE · Phase 1 finished: a memo that sells the pick
   outcome: The memo makes the case for Option A, but its readers could answer only **1 of 6** questions: the COO 0/3, IT security 1/3. Nothing tells them what was trad…
   proceed: Phase 2: the same request, built from the decision record, with one brief per audience

== Phase 2 · decision record + a brief per audience: options, numbers, risks, data flow, reversal
Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
  stop_reason: end_turn -> STOP: Claude has finished
Reply: {"decision":"Adopt Option A: Claude Haiku 5.5 with retrieval over the product catalogue, the only option that meets store operations' 3-second p95 need at a sens…
    (Phase 2 reader: COO) Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
      stop_reason: end_turn -> STOP: Claude has finished (the subagent returns its answer)
    (Phase 2 reader: COO) answer: {"answers":[{"q":1,"answerable":true,"answer":"Option B (Claude Sonnet 5.5, 95% accuracy, 3.6 s p95, about US$9,600/month) was not cho…
    (Phase 2 reader: IT security) Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
      stop_reason: end_turn -> STOP: Claude has finished (the subagent returns its answer)
    (Phase 2 reader: IT security) answer: {"answers":[{"q":1,"answerable":true,"answer":"The model receives customer messages (passed through Lumen's API gateway to the…

== Turns
turn 1: stop_reason=end_turn
(Phase 1 reader: COO) turn 1: stop_reason=end_turn
(Phase 1 reader: IT security) turn 1: stop_reason=end_turn
turn 1: stop_reason=end_turn
(Phase 2 reader: COO) turn 1: stop_reason=end_turn
(Phase 2 reader: IT security) turn 1: stop_reason=end_turn

== Checks
PASS  Phase 1: the readers could answer at most 3 of their 6 questions from the memo
PASS  Phase 2: the record lists all 3 options with accuracy, p95 and monthly cost matching the evals
PASS  Phase 2: the reversal trigger names a metric and a numeric threshold
PASS  Phase 2: both readers could answer all 6 of their questions

== Side by side
[trap] Phase 1: a memo that sells the pick: Persuasive, but the readers could answer **1 of 6** questions. The COO cannot see the alternatives or what would reverse it;…
[fix] Phase 2: decision record + a brief per audience: All three options carry the measured figures, the reversal trigger is Graded accuracy on the weekly 100-answer sa…
  Built from | the chosen option only | the decision record: 3 options, risks, data flow, reversal (good)
  Options with measured accuracy, p95, cost | 1 (the pick) (bad) | 3, matching the evals (good)
  COO: alternatives · cost · reversal | ✗ ✗ ✗ (0/3) (bad) | ✓ ✓ ✓ (3/3) (good)
  IT security: data · risks/controls · reversal | ✓ ✗ ✗ (1/3) (bad) | ✓ ✓ ✓ (3/3) (good)
  Reader says they can approve (COO, IT security) | no, no | yes, yes

6 Claude calls · 6669 in / 5662 out tokens · about US$0.0035 · 28.7 s
```

## Check your answer
**Answer: B.** A stakeholder can act on a decision only when they can see what was traded away, in their own units, and what would change it. The decision record holds the options with measured accuracy, latency and cost, the risks with their controls, and the reversal trigger; each brief restates the same facts for its reader: money and service for the COO, data and controls for IT security.

Why the other answers fall short:

- **A.** One summary that only argues for the pick hides the trade-offs and speaks to neither reader's question: the COO's cost comparison or IT security's data flow.
- **C.** Raw benchmarks and token maths hand the architect's analysis to the leaders without a recommendation, in units neither of them works in.
- **D.** Holding the alternatives back takes the trade-off decision away from the people accountable for it and invites the doubt it tries to avoid.

## Why it happens
Both phases answer the same request from the same architect. Phase 1 is built from the pick alone, so the memo can only praise it: the COO cannot see what was traded away, and IT security cannot see where the data goes. Phase 2 is built from the decision record: every option with its measured accuracy, p95 latency and monthly cost, the risks with their controls, the data flow, and the measured result that would reverse the decision. Each reader gets a brief in their own terms on top of the same record. The readers are separate Claude calls that see only the document, so the count of answerable questions measures whether each stakeholder can act.

## Exam tip
Look for the option that shows alternatives, measured trade-offs and a reversal condition, tailored per audience. Answers that hide alternatives, send everyone the same summary, or pass raw technical detail to executives are distractors.

## Try this next
Give Phase 2's IT security reader the COO brief instead of the IT security brief (swap the keys in read()) and count the answers: the same facts in the wrong units leave her unable to approve. Then delete the reversal line from RECORD and see which question fails for both readers.

---
Source: Original question written for C740. Course: Claude Certified Architect - Professional (CCAR-P) Exam Prep (C740). © Tertiary Infotech Academy Pte Ltd · UEN 201200696W
