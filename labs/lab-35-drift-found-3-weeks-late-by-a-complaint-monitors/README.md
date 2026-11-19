# Lab 35: Drift found 3 weeks late by a complaint: monitors that re-run evals
> Day 2 · Topic 6: Stakeholder Communication & Lifecycle Management · Task statement 6.5 · Simulator 5: Lumen Retail Engagement · About 12 minutes · Claude Haiku 5.5

## Goal
Task statement 6.5: **Support lifecycle phases (discovery, design, handoff, monitoring, iteration).** You answer one exam-style question, then run the Lumen Retail Engagement simulator and watch the tempting design fail and the right one work, with real Claude calls.

## Open this lab

- **The main lab page:** [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/). It lists all 38 simulator labs, the Day 2 builds (Labs 39 to 41) and the practice exam, and holds the API key box.
- **Run it live in your browser (nothing to install):** open [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=35](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=35), paste your Anthropic API key into the sidebar once, then press **Simulate it live**. Every call uses `claude-haiku-5-5`. The run **stops after the first method** and shows its outcome; press **Proceed** to run the fix, then read the two **side by side** under The observation explained.
- **In a terminal, one click:** double-click `run-lab.command` (Mac) or `run-lab.cmd` (Windows) in this folder. It runs `node docs/tools/test_lab.mjs 35` from the repository root, with the same engine the site uses. It needs Node.js and your key in a `.env` file at the repository root (one line: `ANTHROPIC_API_KEY=sk-ant-...`).
- **The code it runs:** [docs/sims/lab-35.js](https://github.com/tertiarycourses/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/blob/main/docs/sims/lab-35.js), on the shared engine [docs/assets/engine.js](https://github.com/tertiarycourses/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/blob/main/docs/assets/engine.js).

## The scenario
You are the Claude solution architect engaged by Lumen Retail, a 300-store retailer, to deliver an AI product-support assistant. You run discovery with the sponsor, store operations, IT security and legal; agree the service levels; record architecture decisions; hand the build to Lumen's own team; and run the system through monitoring and iteration after go-live. Claude helps you with each step.

## Key concepts
- **A loop, not a line.** Discovery, design, build, pilot, go-live, handoff, monitoring, iteration. Iteration returns to design or evaluation; the system is never finished.
- **Three clocks you don't control.** Input drift (new products, new questions), business change, and the model lifecycle: every model ID is eventually deprecated and retired.
- **Thresholds from the baseline.** The pilot measured an 8% escalation rate. A monitor at 11% for a week acts long before 15%; one at 16% never fires.
- **Every change goes back through the evals.** A new range, a prompt edit or a model swap re-runs the eval suite before release. The suite built in the pilot is what makes iteration cheap.
- **Handoff on evidence, not a date.** The receiving team proves it can run the system: a change shipped on its own with an eval report, and a rehearsed runbook.

## The question
Lumen's store assistant goes live on 1 March, and Lumen's in-house team takes it over six weeks later. Lumen launches a new product range every season, and the pilot's escalation rate was 8%. Which plan best supports the solution after go-live?

- **A.** Close the project once the go-live acceptance tests pass, and have the support desk raise tickets whenever store staff report wrong or unhelpful answers to them.
- **B.** Freeze the prompt, model and catalogue index at go-live so the validated behaviour cannot drift, and re-certify the whole system once a year.
- **C.** Set monitors with thresholds and owners, such as escalation-rate drift or a new range, that send changes back through evaluation, and hand off against criteria.
- **D.** Keep the architect on a retainer to review the dashboards every month and decide, case by case, when the assistant needs to be changed, retuned or retrained.

Pick your answer before you run anything. The answer and the reasoning are at the end, under **Check your answer**.

## Steps on the simulator site
1. Open [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=35](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=35). The left sidebar should say the API key is **saved**. If it says **not set**, paste your key into the **Anthropic API key** box, press **Save**, then **Test**.
2. Read the task statement card and the question. Click the answer you chose. The page tells you at once whether it is right, and why. Open **Why the other answers fall short**.
3. Press **▶ Simulate it live**. The scenario board shows the story, the code runs on the left and Claude's live output appears on the right.
4. When the run pauses, read the outcome of the first method (the trap). Then press **▶ Proceed** to run the fix.
5. Read **Claude's final output**, then **The observation explained**: the two methods side by side, turn by turn, and the checks on what Claude actually did.
6. Open **See the full code this lab runs** and find the lines that make the difference.

## Or run it from a terminal
From the repository root:

```
node docs/tools/test_lab.mjs 35
```

## What you will see
What to look for: Phase 1 finds the drift in week 8 from a complaint; Phase 2's monitors send the change back to the eval suite in week 5 or 6.

These lines are from our own run of this lab on Claude Haiku 5.5. Your wording will differ, because Claude writes each reply fresh; the tool calls, decisions and checks should match. This is an excerpt: wherever … appears, text has been shortened, and a line with only … marks lines left out. Run the lab to see the full output.

```
Lumen Retail · Write the delivery plan for the store product-support assistant.
Lumen's product-support assistant goes live in 300 stores on 1 March (week 1). Lumen's in-house AI team (lead: Arun Pillai) takes over from the architect at the end of …
== Phase 1 · plan to go-live: the project template ends at go-live and closure
Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
  stop_reason: end_turn -> STOP: Claude has finished
Reply: {"phases":[{"name":"discovery","exit_gate":"Pilot baseline confirmed and recorded: escalation rate 8%, weekly graded accuracy 93.5% on a 100-answer sample, p95 l…
Replay: wk1 7.9% · wk2 8.1% · wk3 8% · wk4 8.4% · wk5 9.6% (new range) · wk6 12.9% · wk7 14.7% · wk8 15.3% · wk9 15.1% · wk10 15.6%
Phase 1: nothing watches after go-live. The drift that starts in week 5 is found in week 8: "Store managers escalate to the COO: 'the assistant can't answer anything ab…

== PAUSE · Phase 1 finished: a plan that ends at go-live
   outcome: The plan runs discovery → design → build → pilot → go_live and closes. **Nothing watches the system after go-live**, so the spring-range drift that starts i…
   proceed: Phase 2: the same facts, with the lifecycle template: monitors that send changes back through evaluation, and handoff criteria

== Phase 2 · lifecycle plan: monitors with thresholds and owners trigger iteration through the eval suite; handoff criteria
Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
  stop_reason: end_turn -> STOP: Claude has finished
Reply: {"phases":[{"name":"discovery","exit_gate":"Support question categories, escalation reasons and the 300-store rollout scope are agreed and signed off by Farid Ra…
  monitor escalation_rate_pct above 10 (2 wk) → rerun_eval_suite_and_iterate · owner Arun Pillai · FIRES in week 7
  monitor graded_accuracy_pct below 92 (2 wk) → rerun_eval_suite_and_iterate · owner Arun Pillai · FIRES in week 6
  monitor p95_latency_s above 3 (2 wk) → page_on_call · owner Arun Pillai · never fires
  monitor cost_per_day_usd above 80 (2 wk) → notify_only · owner Farid Rahman · never fires
  monitor catalogue_change_event occurs (1 wk) → rerun_eval_suite_and_iterate · owner Arun Pillai · FIRES in week 5

== Turns
turn 1: stop_reason=end_turn
turn 1: stop_reason=end_turn

== Checks
PASS  Phase 1: the plan has no production monitor, so the week-5 drift waits for the week-8 complaint
PASS  Phase 2: the plan's phases include handoff, monitoring and iteration
PASS  Phase 2: in the replay a monitor sends the change back through the eval suite by week 6
PASS  Phase 2: an escalation-rate monitor catches the drift before the complaint, routed to the evals
PASS  Phase 2: at least 3 handoff criteria, each with its evidence

== Side by side
[trap] Phase 1: project plan to go-live: The plan stops at go_live. **No monitor, no owner after go-live**: the drift from week 5 surfaces in week 8 as a complaint to t…
[fix] Phase 2: lifecycle plan: The catalogue-change monitor fires in week 5 and the escalation-rate monitor in week 7; **both send the change back through the eval suit…
  Phases | discovery → design → build → pilot → go_live | discovery → design → build → pilot → go_live → handoff → monitoring → iteration → closure (good)
  Monitors after go-live | 0 (bad) | 5 (good)
  Drift first acted on (it starts week 5) | week 8, a complaint (bad) | week 5, re-run evals (good)
  Catalogue change triggers evaluation | no (bad) | yes, week 5 (good)
  Handoff criteria with evidence | none (bad) | 8 (good)

2 Claude calls · 2216 in / 4209 out tokens · about US$0.0023 · 21.0 s
```

## Check your answer
**Answer: C.** After go-live the inputs keep changing: a new range brings new products and harder questions, and the model itself will eventually be retired. A lifecycle plan names the signals that matter, sets thresholds from the pilot baseline, gives each an owner, and routes every triggered change back through the eval suite before it ships. The handoff is passed on criteria the receiving team proves, not on a date.

Why the other answers fall short:

- **A.** Waiting for staff complaints finds drift weeks late, and closing at go-live leaves nobody owning the system's behaviour once the architect has gone.
- **B.** Freezing the system does not freeze its inputs: a new range still arrives, and the frozen index and prompt fall further behind every season.
- **D.** A monthly review by one person has no defined triggers, cannot catch a drift between reviews, and keeps the receiving team dependent instead of handing off.

## Why it happens
Both phases plan the same assistant from the same facts. The usual project template stops at go-live and closes the project, so nobody owns the system's behaviour afterwards. Inputs then drift: the spring range brings 1,850 new products and harder questions, escalations climb from 8% to 15%, and the first signal is a complaint to the COO three weeks later. The lifecycle template treats go-live as one phase in a loop: monitors with thresholds from the pilot baseline, an owner for each, and an action that sends the change back through evaluation before anything ships; the handoff is passed against criteria with evidence, not on a date. Code replays the same ten weeks against both plans.

## Exam tip
Pick the answer that keeps the system in a loop after launch: defined signals and thresholds, named owners, changes that return to evaluation, and a handoff with exit criteria. Closing at go-live, freezing the system or relying on one person's review are the distractors.

## Try this next
Change the spring range in WEEKS (shared/d6-lumen.js) to land in week 8 and run it again: Phase 2 catches it the week it happens, Phase 1 does not catch it at all inside ten weeks. Then raise an escalation threshold in the plan to 16% and see the drift slip past.

---
Source: Original question written for C740. Course: Claude Certified Architect - Professional (CCAR-P) Exam Prep (C740). © Tertiary Infotech Academy Pte Ltd · UEN 201200696W
