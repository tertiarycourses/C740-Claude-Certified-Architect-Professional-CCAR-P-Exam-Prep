# Lab 5: One prompt for the whole discharge pack runs out: split and reconcile
> Day 1 · Topic 1: Solution Design & Architecture · Task statement 1.5 · Simulator 3: Meridian Clinical Notes · About 12 minutes · Claude Haiku 5.5

## Goal
Task statement 1.5: **Apply decomposition techniques for complex problem solving.** You answer one exam-style question, then run the Meridian Clinical Notes simulator and watch the tempting design fail and the right one work, with real Claude calls.

## Open this lab

- **The main lab page:** [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/). It lists all 38 simulator labs, the Day 2 builds (Labs 39 to 41) and the practice exam, and holds the API key box.
- **Run it live in your browser (nothing to install):** open [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=5](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=5), paste your Anthropic API key into the sidebar once, then press **Simulate it live**. Every call uses `claude-haiku-5-5`. The run **stops after the first method** and shows its outcome; press **Proceed** to run the fix, then read the two **side by side** under The observation explained.
- **In a terminal, one click:** double-click `run-lab.command` (Mac) or `run-lab.cmd` (Windows) in this folder. It runs `node docs/tools/test_lab.mjs 5` from the repository root, with the same engine the site uses. It needs Node.js and your key in a `.env` file at the repository root (one line: `ANTHROPIC_API_KEY=sk-ant-...`).
- **The code it runs:** [docs/sims/lab-05.js](https://github.com/tertiarycourses/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/blob/main/docs/sims/lab-05.js), on the shared engine [docs/assets/engine.js](https://github.com/tertiarycourses/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/blob/main/docs/assets/engine.js).

## The scenario
Meridian Health, a US hospital group, uses Claude to draft discharge summaries and referral letters from clinicians' visit notes. The notes contain protected health information (PHI) under HIPAA, and every draft is signed off by a clinician before it leaves the hospital. Accuracy, privacy and an audit trail matter more than speed.

## Key concepts
- **Decomposing trades difficulty for count.** Each piece gets easier, but every extra step is another place an error can enter. A split pays when it makes each piece reliably right and checkable.
- **Cut at narrow, checkable seams.** Pass a small structured artefact between steps (the medication JSON), not everything the next step might need. A seam you can validate is one you can trust.
- **Local first, global second.** Section passes each see only their own evidence; a reconciliation step then checks the facts that span sections.
- **Read stop_reason first.** A call that hits max_tokens stops mid-response, and with adaptive thinking the planning counts toward that budget too. Check stop_reason before using the output.

## The question
Meridian Health generates a discharge pack from clinicians' notes: a medication reconciliation, a clinical summary, actions for the GP, and plain-English instructions for the patient, each with its own rules. One prompt writes the whole pack in a single call. It often stops at max_tokens, and when it finishes, a section often breaks its rules, so the whole call is rerun. Which approach best fixes this?

- **A.** Write each section in its own pass with only its notes and rules, feed the medication JSON to the later passes, then validate every section and the shared facts in code.
- **B.** Raise max_tokens to the model's maximum and add a reminder at the end of the prompt that every section's rules must be followed, so that one call completes the whole pack.
- **C.** Move the single call to a larger model with a longer output limit, since a stronger model can plan six sections for three readers within one response.
- **D.** Ask Claude to review its own pack at the end of the same call and to rewrite any section that breaks a rule before it returns the final version to the clinician.

Pick your answer before you run anything. The answer and the reasoning are at the end, under **Check your answer**.

## Steps on the simulator site
1. Open [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=5](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=5). The left sidebar should say the API key is **saved**. If it says **not set**, paste your key into the **Anthropic API key** box, press **Save**, then **Test**.
2. Read the task statement card and the question. Click the answer you chose. The page tells you at once whether it is right, and why. Open **Why the other answers fall short**.
3. Press **▶ Simulate it live**. The scenario board shows the story, the code runs on the left and Claude's live output appears on the right.
4. When the run pauses, read the outcome of the first method (the trap). Then press **▶ Proceed** to run the fix.
5. Read **Claude's final output**, then **The observation explained**: the two methods side by side, turn by turn, and the checks on what Claude actually did.
6. Open **See the full code this lab runs** and find the lines that make the difference.

## Or run it from a terminal
From the repository root:

```
node docs/tools/test_lab.mjs 5
```

## What you will see
What to look for: All four section passes ended with end_turn, and the reconciled pack passed every rule, with all 7 medications matching their last order.

These lines are from our own run of this lab on Claude Haiku 5.5. Your wording will differ, because Claude writes each reply fresh; the tool calls, decisions and checks should match. This is an excerpt: wherever … appears, text has been shortened, and a line with only … marks lines left out. Run the lab to see the full output.

```
Meridian Health · Patient Patient A, MRN 00-4417, admitted 2026-11-10, discharged 2026-11-14. 20 notes: 8 clinical (admission, med rec, ward rounds, haematology, rash, …
The medication story: metformin and ramipril withheld for AKI; amoxicillin stopped for a rash (penicillin allergy); warfarin switched to apixaban; ramipril restarted at…
== Phase 1 · one giant prompt: the whole discharge pack, every section's rules, in one call
Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
  stop_reason: max_tokens -> STOP: Claude has finished
Phase 1: stop_reason max_tokens · no usable JSON · 1 problem: no usable pack (stop_reason max_tokens)

== PAUSE · Phase 1 finished: one call for the whole pack
   outcome: **stop_reason: max_tokens.** The call spent its 4,096-token budget planning six sections for three readers and returned no usable pack.
   proceed: Phase 2: one pass per section group, then reconcile in code

== Phase 2 · section passes (local), then a reconciliation step in code (global), one repair per failing section
    (section: medications + allergies) Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
      stop_reason: end_turn -> STOP: Claude has finished (the subagent returns its answer)
    (section: medications + allergies) answer: {"medications":[{"drug":"Amoxicillin (IV)","dose":"1 g","frequency":"TDS","status":"stopped","reason":"Urticarial rash ab…
    (section: diagnoses, course, pending) Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
      stop_reason: end_turn -> STOP: Claude has finished (the subagent returns its answer)
    (section: diagnoses, course, pending) answer: {"diagnoses":["Community-acquired pneumonia, right lower lobe (CURB-65 2)","Acute kidney injury stage 1, prerenal/seps…
    (section: GP actions) Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
      stop_reason: end_turn -> STOP: Claude has finished (the subagent returns its answer)
    (section: GP actions) answer: {"gp_actions":["Arrange U&E (urea and electrolytes) blood test in 1 week to check renal recovery after acute kidney injury.","Use the …
    (section: patient instructions) Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
      stop_reason: end_turn -> STOP: Claude has finished (the subagent returns its answer)
    (section: patient instructions) answer: {"patient_instructions": "Take these medicines. Doxycycline, one 100 milligram tablet two times a day, until your course end…
Reconcile (code): patient instructions: patient_instructions is 148 words (rule: under 120)
    (repair: patient instructions) Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
      stop_reason: end_turn -> STOP: Claude has finished (the subagent returns its answer)
    (repair: patient instructions) answer: {"patient_instructions":"Take these medicines. Doxycycline, a 100 milligram tablet two times a day, until 15 November 2026. A…
Repair patient instructions: now passes

== Turns
turn 1: stop_reason=max_tokens
(section: medications + allergies) turn 1: stop_reason=end_turn
(section: diagnoses, course, pending) turn 1: stop_reason=end_turn
(section: GP actions) turn 1: stop_reason=end_turn
(section: patient instructions) turn 1: stop_reason=end_turn
(repair: patient instructions) turn 1: stop_reason=end_turn

== Checks
PASS  Phase 1: the single call did not deliver a pack that passes every section rule
PASS  Phase 2: every section group ended with valid JSON, at most one of them needing its single repair
PASS  Phase 2: the medication list matches the last order for all 7 drugs, and the penicillin allergy is recorded
PASS  Phase 2: after reconciliation (at most one repair per section), every section passes its rules

== Side by side
[trap] Phase 1: one giant prompt: **stop_reason max_tokens**: the whole 4,096-token budget went on one call, and there is no pack to sign off.
[fix] Phase 2: section passes, then reconcile: 4 passes, all end_turn; reconciliation found 1 problem, repaired patient instructions once; the pack passes every rule.
  Claude calls | 1 | 5
  stop_reason | max_tokens (bad) | end_turn (good)
  What each call reads | all 20 notes and every rule | only its notes (or the meds JSON) and its own rule
  Medications vs the last order (7 drugs) | no list (bad) | all 7 right (good)
  Rule problems found by the validators | pack missing (bad) | 1 found, 0 left (good)
  A failing section can be redone alone | no (bad) | yes (good)

6 Claude calls · 9480 in / 12239 out tokens · about US$0.0071 · 56.1 s
```

## Check your answer
**Answer: A.** A discharge pack is several jobs that share one record, each for a different reader with different rules. Decomposition gives each pass less to plan and less to read, and cuts at narrow seams: the medication pass returns structured JSON that the GP and patient passes read instead of the raw notes. Every seam can be checked, so code validates each section against its own rules and the facts that span sections, and only a failing section is repaired.

Why the other answers fall short:

- **B.** A bigger budget may let the call finish, but every section still shares one blended set of rules, and one failing section still means rerunning the whole pack.
- **C.** A larger model costs more and still produces one block with no checkable seams between the sections.
- **D.** Self-review in the same call spends more of the same budget and is not an independent check; a failure still means a full rerun.

## Why it happens
A discharge pack is several jobs that share one record: a medication reconciliation that must follow the last order for each drug, a clinical narrative for clinicians, an action list for the GP and plain-English instructions for the patient. One giant prompt makes the model plan and write all of them at once under one output budget and one blended set of rules, so it either runs out (stop_reason max_tokens) or lets a section slip. Decomposition cuts at narrow seams: the medication pass returns structured JSON, and the GP and patient passes read that JSON instead of the raw notes. Every seam is checkable, so code validates each section against its own rules and the cross-section facts, and a failing section is repaired on its own. The cost is more calls and a design to maintain: cut where the output can be checked.

## Exam tip
When one prompt does several jobs for different readers, look for the answer that splits at checkable seams (structured outputs) and adds a reconciliation step, not for a bigger budget or a bigger model.

## Try this next
Raise BUDGET to 16000 and run it again: Phase 1 now usually finishes, but compare its patient instructions with the rules in RULE.patient and count the problems the reconciler lists. Then delete the ramipril line from note N15 in shared/d1-meridian.js: the medication pass reports ramipril 5 mg unchanged, and the reconciler names that exact problem.

---
Source: Original question written for C740. Course: Claude Certified Architect - Professional (CCAR-P) Exam Prep (C740). © Tertiary Infotech Academy Pte Ltd · UEN 201200696W
