# Lab 22: v2 won the demo and missed SEV1 pages: A/B it on the same alerts
> Day 1 · Topic 4: Evaluation, Testing & Optimization · Task statement 4.3 · Simulator 6: Kestrel Platform Team · About 12 minutes · Claude Haiku 5.5

## Goal
Task statement 4.3: **Conduct A/B testing and iterative improvements.** You answer one exam-style question, then run the Kestrel Platform Team simulator and watch the tempting design fail and the right one work, with real Claude calls.

## Open this lab

- **The main lab page:** [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/). It lists all 38 simulator labs, the Day 2 builds (Labs 39 to 41) and the practice exam, and holds the API key box.
- **Run it live in your browser (nothing to install):** open [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=22](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=22), paste your Anthropic API key into the sidebar once, then press **Simulate it live**. Every call uses `claude-haiku-5-5`. The run **stops after the first method** and shows its outcome; press **Proceed** to run the fix, then read the two **side by side** under The observation explained.
- **In a terminal, one click:** double-click `run-lab.command` (Mac) or `run-lab.cmd` (Windows) in this folder. It runs `node docs/tools/test_lab.mjs 22` from the repository root, with the same engine the site uses. It needs Node.js and your key in a `.env` file at the repository root (one line: `ANTHROPIC_API_KEY=sk-ant-...`).
- **The code it runs:** [docs/sims/lab-22.js](https://github.com/tertiarycourses/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/blob/main/docs/sims/lab-22.js), on the shared engine [docs/assets/engine.js](https://github.com/tertiarycourses/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/blob/main/docs/assets/engine.js).

## The scenario
Kestrel Software's platform team is rolling Claude Code out to 40 engineers across four product squads, and runs Claude-powered features in production. The team owns the shared Claude Code configuration, the CI pipeline, the evaluation suite for each prompt change, and the on-call runbooks for incidents in Claude-powered services.

## Key concepts
- **A demo is not evidence.** The author picks the example that shows the change working. It says nothing about the cases the change might break.
- **Hold everything but the change.** Run both variants on the same fixed items with the same grader and settings, so any difference in the score comes from the change alone.
- **Primary metric and guardrails.** Decide before the run what must improve (the primary metric) and what may not get worse (guardrails such as SEV1 recall), and what result ships the change.
- **Noise and sample size.** Model outputs vary between runs. Repeat runs to see the spread, and do not claim significance from a few items: small sets find specific regressions, large sets measure rates.
- **Iterate, then canary.** Fix what the eval found, re-run the same set, and only then expose the change to a small share of live traffic with the same metrics before a full rollout.

## The question
Kestrel's platform team owns the prompt that triages production alerts into SEV1, SEV2 and SEV3. An engineer rewrote it as v2 and demonstrated it on a staging alert that v1 had wrongly paged as SEV1; v2 got it right, and the team wants to ship v2 today. Which approach best decides whether v2 should replace v1?

- **A.** Ship v2 for all alerts and collect on-call feedback for a week, rolling back if complaints about wrong pages start to rise.
- **B.** Run v1 and v2 on the same labelled eval alerts with the same grader, and apply a decision rule agreed before the run.
- **C.** Run v2 on twenty new alerts picked by its author, and compare its accuracy with the score v1 achieved last quarter.
- **D.** Ask Claude to read both prompts side by side and choose the one that it judges to be clearer and more complete.

Pick your answer before you run anything. The answer and the reasoning are at the end, under **Check your answer**.

## Steps on the simulator site
1. Open [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=22](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=22). The left sidebar should say the API key is **saved**. If it says **not set**, paste your key into the **Anthropic API key** box, press **Save**, then **Test**.
2. Read the task statement card and the question. Click the answer you chose. The page tells you at once whether it is right, and why. Open **Why the other answers fall short**.
3. Press **▶ Simulate it live**. The scenario board shows the story, the code runs on the left and Claude's live output appears on the right.
4. When the run pauses, read the outcome of the first method (the trap). Then press **▶ Proceed** to run the fix.
5. Read **Claude's final output**, then **The observation explained**: the two methods side by side, turn by turn, and the checks on what Claude actually did.
6. Open **See the full code this lab runs** and find the lines that make the difference.

## Or run it from a terminal
From the repository root:

```
node docs/tools/test_lab.mjs 22
```

## What you will see
What to look for: v2 wins the demo; on the same 8 labelled alerts it misses the 2.1% checkout and 1.4% payment SEV1s, and the rule rejects it.

These lines are from our own run of this lab on Claude Haiku 5.5. Your wording will differ, because Claude writes each reply fresh; the tool calls, decisions and checks should match. This is an excerpt: wherever … appears, text has been shortened, and a line with only … marks lines left out. Run the lab to see the full output.

```
Kestrel on-call alert triage · prompt v2 proposed by its author · gold labels agreed by the on-call leads
== Phase 1 · one demo: v1 and v2 on the author's demo alert AL-01 only
    Prompt v1 · demo · POST /v1/messages · model claude-haiku-5-5
      stop_reason: end_turn · 575 in / 30 out · 1376 ms
      Prompt v1: AL-01 SEV1
    Prompt v2 · demo · POST /v1/messages · model claude-haiku-5-5
      stop_reason: end_turn · 598 in / 30 out · 1458 ms
      Prompt v2: AL-01 SEV3
Demo: v1 said SEV1, v2 said SEV3 (gold SEV3). v2 fixed it: ship v2.

== PAUSE · Phase 1 finished: one demo alert
   outcome: On the staging alert AL-01, v1 said **SEV1** and v2 said **SEV3** (gold SEV3). On this evidence the author would **ship v2**. One alert says nothing about w…
   proceed: Phase 2: A/B v1 and v2 on the same 8 labelled alerts, twice each

== Phase 2 · A/B test: v1 and v2 on the same 8 labelled alerts, 2 runs each, decision rule fixed before the run
Decision rule (written before any result): Ship v2 only if (1) its mean accuracy over both runs is at least v1's, and (2) it misses no gold SEV1 alert in either run (a …
    Prompt v1 · run 1 · POST /v1/messages · model claude-haiku-5-5
      stop_reason: end_turn · 816 in / 453 out · 2841 ms
      Prompt v1: AL-01 SEV1 · AL-02 SEV1 · AL-03 SEV1 · AL-04 SEV2 · AL-05 SEV1 · AL-06 SEV3 · AL-07 SEV2 · AL-08 SEV3
    Prompt v2 · run 1 · POST /v1/messages · model claude-haiku-5-5
      stop_reason: end_turn · 839 in / 389 out · 2465 ms
      Prompt v2: AL-01 SEV3 · AL-02 SEV2 · AL-03 SEV2 · AL-04 SEV2 · AL-05 SEV1 · AL-06 SEV3 · AL-07 SEV2 · AL-08 SEV3
    Prompt v1 · run 2 · POST /v1/messages · model claude-haiku-5-5
      stop_reason: end_turn · 816 in / 454 out · 2687 ms
      Prompt v1: AL-01 SEV1 · AL-02 SEV1 · AL-03 SEV1 · AL-04 SEV2 · AL-05 SEV1 · AL-06 SEV3 · AL-07 SEV2 · AL-08 SEV3
    Prompt v2 · run 2 · POST /v1/messages · model claude-haiku-5-5
      stop_reason: end_turn · 839 in / 381 out · 2476 ms
      Prompt v2: AL-01 SEV3 · AL-02 SEV2 · AL-03 SEV2 · AL-04 SEV2 · AL-05 SEV1 · AL-06 SEV3 · AL-07 SEV2 · AL-08 SEV3
  v1: accuracy 7/8, 7/8 · missed SEV1 none | none
  v2: accuracy 6/8, 6/8 · missed SEV1 AL-02+AL-03 | AL-02+AL-03
Decision: primary (accuracy 75% vs 88%) NOT met · guardrail (missed SEV1: AL-02, AL-03) NOT met → REJECT v2
v2 still fixes the demo alert in the A/B (both runs). 8 items × 2 runs is too few for significance; it is enough to see which items regressed.

== Turns
Prompt v1 · demo turn 1: stop_reason=end_turn
Prompt v2 · demo turn 1: stop_reason=end_turn
Prompt v1 · run 1 turn 1: stop_reason=end_turn
Prompt v2 · run 1 turn 1: stop_reason=end_turn
Prompt v1 · run 2 turn 1: stop_reason=end_turn
Prompt v2 · run 2 turn 1: stop_reason=end_turn

== Checks
PASS  Phase 1: v2 labelled the demo alert correctly (SEV3), so the demo alone said ship v2
PASS  Phase 2: v1 and v2 labelled the same 8 alert ids in every run, all schema-valid
…
  Items compared | AL-01 | 8 alerts × 2 runs, same ids for v1 and v2
  Decision rule | whatever the demo shows | Ship v2 only if (1) its mean accuracy over both runs is at least v1's, and (2) it misses no gold SEV1 alert in either run (a…
  AL-01 (gold SEV3) | v1 SEV1 · v2 SEV3 | v1 SEV1 / SEV1 · v2 SEV3 / SEV3 (good)
  AL-02 (gold SEV1) | not tested | v1 SEV1 / SEV1 · v2 SEV2 / SEV2 (bad)
  AL-03 (gold SEV1) | not tested | v1 SEV1 / SEV1 · v2 SEV2 / SEV2 (bad)
  AL-04 (gold SEV2) | not tested | v1 SEV2 / SEV2 · v2 SEV2 / SEV2 (good)
  AL-05 (gold SEV1) | not tested | v1 SEV1 / SEV1 · v2 SEV1 / SEV1 (good)
  AL-06 (gold SEV3) | not tested | v1 SEV3 / SEV3 · v2 SEV3 / SEV3 (good)
  AL-07 (gold SEV2) | not tested | v1 SEV2 / SEV2 · v2 SEV2 / SEV2 (good)
  AL-08 (gold SEV3) | not tested | v1 SEV3 / SEV3 · v2 SEV3 / SEV3 (good)
  Accuracy (mean of runs) | - | v1 88% · v2 75%
  Decision | ship v2 (bad) | reject v2 (good)

6 Claude calls · 4483 in / 1737 out tokens · about US$0.0013 · 13.3 s
```

## Check your answer
**Answer: B.** A demo shows the case the change was written to fix. An A/B comparison runs both prompts on the same labelled items with the same grader, so the only difference is the prompt, and a decision rule fixed before the run (a primary metric plus guardrails that may not regress) turns the result into a decision. In the lab, v2 fixes the staging alert but drops two small checkout and payment failures from SEV1 to SEV2, and the guardrail rejects it.

Why the other answers fall short:

- **A.** Shipping first makes on-call engineers the test set, and a missed SEV1 page is found by customers, not by the feedback channel.
- **C.** Different items and a quarter-old score compare two datasets, not two prompts, and the author chose the items.
- **D.** Claude judging which prompt reads better measures the prompt's wording, not how it labels real alerts.

## Why it happens
A demo picks the example that shows the change working, so it measures the author's hope, not the change. An A/B test runs both versions on the same fixed eval items with the same graders, so the only difference is the prompt. The decision rule is written before the run: a primary metric (accuracy) plus a guardrail that may not regress (no missed SEV1). Eight items run twice is far too few for statistical significance, and this lab does not claim any. It is enough to find a specific regression you can read item by item, which is what blocks v2 here. In production the next step after passing offline would be a small canary with the same metrics.

## Exam tip
A/B means the same items, the same graders and a rule agreed in advance, with guardrail metrics that may not regress. Comparing different datasets, shipping and watching feedback, or asking a model which prompt is better are the distractors.

## Try this next
In docs/sims/shared/d4-kestrel.js, add "Any failed customer checkout or payment is SEV1, whatever the rate." to TRIAGE_V2 and run again: v2 now keeps v1's SEV1 recall and its staging fix, and the same rule ships it. Then set REPEATS to 1 and notice how much less you know about run-to-run noise.

---
Source: Original question written for C740. Course: Claude Certified Architect - Professional (CCAR-P) Exam Prep (C740). © Tertiary Infotech Academy Pte Ltd · UEN 201200696W
