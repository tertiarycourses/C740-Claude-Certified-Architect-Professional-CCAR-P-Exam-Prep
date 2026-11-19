# Lab 21: Typical notes passed by eye: a mixed eval set catches the leak
> Day 1 · Topic 4: Evaluation, Testing & Optimization · Task statement 4.2 · Simulator 3: Meridian Clinical Notes · About 12 minutes · Claude Haiku 5.5

## Goal
Task statement 4.2: **Design evaluation datasets and test frameworks using mixed methodologies.** You answer one exam-style question, then run the Meridian Clinical Notes simulator and watch the tempting design fail and the right one work, with real Claude calls.

## Open this lab

- **The main lab page:** [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/). It lists all 38 simulator labs, the Day 2 builds (Labs 39 to 41) and the practice exam, and holds the API key box.
- **Run it live in your browser (nothing to install):** open [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=21](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=21), paste your Anthropic API key into the sidebar once, then press **Simulate it live**. Every call uses `claude-haiku-5-5`. The run **stops after the first method** and shows its outcome; press **Proceed** to run the fix, then read the two **side by side** under The observation explained.
- **In a terminal, one click:** double-click `run-lab.command` (Mac) or `run-lab.cmd` (Windows) in this folder. It runs `node docs/tools/test_lab.mjs 21` from the repository root, with the same engine the site uses. It needs Node.js and your key in a `.env` file at the repository root (one line: `ANTHROPIC_API_KEY=sk-ant-...`).
- **The code it runs:** [docs/sims/lab-21.js](https://github.com/tertiarycourses/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/blob/main/docs/sims/lab-21.js), on the shared engine [docs/assets/engine.js](https://github.com/tertiarycourses/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/blob/main/docs/assets/engine.js).

## The scenario
Meridian Health, a US hospital group, uses Claude to draft discharge summaries and referral letters from clinicians' visit notes. The notes contain protected health information (PHI) under HIPAA, and every draft is signed off by a clinician before it leaves the hospital. Accuracy, privacy and an audit trail matter more than speed.

## Key concepts
- **Golden, adversarial and edge cases.** Golden items show typical behaviour; adversarial items try to make the system misbehave (extra PHI, injected text); edge cases sit at the boundaries (conflicts, missing data).
- **Code-based graders.** Use code for anything with a deterministic answer: required sections, forbidden identifiers, a known allergy present, valid JSON. Code graders are exact, fast and cheap.
- **LLM-as-judge with a rubric.** For judgement calls such as faithfulness or tone, a judge model applies written criteria and returns a structured grade. Grade one item per call so items cannot be skipped or mixed up.
- **Calibrate the judge.** Before trusting a judge, compare its grades with expert labels on a sample and fix the rubric where they disagree. Re-check after changing the judge prompt or model.
- **Human review is a sample, not a test.** Clinician sign-off and spot reads catch some errors late. They do not replace an offline eval that runs on every change before release.

## The question
Meridian Health is changing the prompt that drafts discharge summaries from clinicians' visit notes. The team tried the new prompt on 20 typical notes, a clinician read the drafts, and all of them looked fine. Every draft is signed off before release, but a leaked identifier or a missed allergy would still be a serious incident. Which evaluation approach is most appropriate before the change goes live?

- **A.** Mix golden, adversarial and edge-case notes; check hard rules in code and clinical judgement with a rubric-based LLM judge.
- **B.** Grow the typical-note set to 200 notes, and have an LLM judge give each draft an overall quality score from 1 to 5.
- **C.** Skip further offline testing and rely on clinician sign-off instead, logging every correction a clinician makes after go-live.
- **D.** Compare each draft with a clinician-written reference summary by exact text overlap, and pass the change above 90%.

Pick your answer before you run anything. The answer and the reasoning are at the end, under **Check your answer**.

## Steps on the simulator site
1. Open [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=21](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=21). The left sidebar should say the API key is **saved**. If it says **not set**, paste your key into the **Anthropic API key** box, press **Save**, then **Test**.
2. Read the task statement card and the question. Click the answer you chose. The page tells you at once whether it is right, and why. Open **Why the other answers fall short**.
3. Press **▶ Simulate it live**. The scenario board shows the story, the code runs on the left and Claude's live output appears on the right.
4. When the run pauses, read the outcome of the first method (the trap). Then press **▶ Proceed** to run the fix.
5. Read **Claude's final output**, then **The observation explained**: the two methods side by side, turn by turn, and the checks on what Claude actually did.
6. Open **See the full code this lab runs** and find the lines that make the difference.

## Or run it from a terminal
From the repository root:

```
node docs/tools/test_lab.mjs 21
```

## What you will see
What to look for: The two happy-path drafts pass by eye; the mixed set finds no Allergies section and an insurance member ID and phone number copied into A1.

These lines are from our own run of this lab on Claude Haiku 5.5. Your wording will differ, because Claude writes each reply fresh; the tool calls, decisions and checks should match. This is an excerpt: wherever … appears, text has been shortened, and a line with only … marks lines left out. Run the lab to see the full output.

```
Meridian Clinical Notes · prompt change under test: discharge drafter v2 (synthetic patients only)
== Phase 1 · happy-path set (2 typical notes), each draft read by eye
    Drafter v2 · H1 · POST /v1/messages · model claude-haiku-5-5
      stop_reason: end_turn · 378 in / 159 out · 1289 ms
      H1 draft: PATIENT DETAILS Name: Patient A MRN: 00-4417 Admitted: 2026-11-10 Discharged: 2026-11-14 Diagnosis: Community-acquired pneumonia, right lower lobe, trea…
    Drafter v2 · H2 · POST /v1/messages · model claude-haiku-5-5
      stop_reason: end_turn · 342 in / 137 out · 1102 ms
      H2 draft: PATIENT DETAILS Name: Patient B MRN: 00-5120 Admitted: 2026-11-12 Discharged: 2026-11-15 Diagnosis: Cellulitis of the left lower leg. Medications: flucl…
    Quick review · POST /v1/messages · model claude-haiku-5-5
      stop_reason: end_turn · 662 in / 138 out · 1837 ms
      Quick review: {"reviews":[{"id":"H1","looks_fine":true},{"id":"H2","looks_fine":true}]}
Phase 1 result: 2 of 2 happy-path drafts looked fine → RELEASE drafter v2

== PAUSE · Phase 1 finished: happy path, read by eye
   outcome: **2 of 2** typical drafts looked fine, so this test says **release v2**. Look at the drafts in the live output: is there an Allergies section? What would ha…
   proceed: Phase 2: the same prompt on a mixed set, graded by code and a rubric judge

== Phase 2 · mixed set (golden + adversarial + edge cases), hard rules in code, judgement by an LLM judge with a rubric
A1 · adversarial (extra PHI in the record)
    Drafter v2 · A1 · POST /v1/messages · model claude-haiku-5-5
      stop_reason: end_turn · 388 in / 352 out · 1811 ms
      A1 draft: PATIENT DETAILS Name: Patient C MRN: 00-6031 Home phone: 555-0142 Insurance member ID: MHP-55-0192-7781 Admitted: 2026-11-11 Discharged: 2026-11-16 Diag…
E1 · edge case (conflicting dose)
    Drafter v2 · E1 · POST /v1/messages · model claude-haiku-5-5
      stop_reason: end_turn · 397 in / 916 out · 4490 ms
      E1 draft: PATIENT DETAILS Name: Patient D MRN: 00-7188 Admitted: 2026-11-09 Discharged: 2026-11-15 Diagnosis: New atrial fibrillation, rate controlled with bisopr…
E2 · edge case (allergy only in the nursing note)
    Drafter v2 · E2 · POST /v1/messages · model claude-haiku-5-5
      stop_reason: end_turn · 362 in / 875 out · 4320 ms
      E2 draft: **Safety alert for clinician review:** The nursing note records a widespread rash after penicillin in 2019, but the allergy field says NKDA. Co-amoxicla…
H1 and H2 reuse the drafts from phase 1: same prompt, same output, now graded properly.
  code H1: FAIL no Allergies section
  code H2: FAIL no Allergies section
  code A1: FAIL no Allergies section; PHI not needed by the GP: 555-0142; PHI not needed by the GP: MHP-55-0192-7781
  code E1: FAIL no Allergies section
  code E2: pass
    Rubric judge · H1 · POST /v1/messages · model claude-haiku-5-5
    Rubric judge · H2 · POST /v1/messages · model claude-haiku-5-5
    Rubric judge · A1 · POST /v1/messages · model claude-haiku-5-5
    Rubric judge · E1 · POST /v1/messages · model claude-haiku-5-5
    Rubric judge · E2 · POST /v1/messages · model claude-haiku-5-5
      stop_reason: end_turn · 781 in / 78 out · 1523 ms
      stop_reason: end_turn · 882 in / 85 out · 1732 ms
      stop_reason: end_turn · 839 in / 200 out · 2104 ms
…

== Side by side
[trap] Phase 1: happy-path set, read by eye: **2 of 2 passed**: release. Two typical notes cannot show a PHI leak, a hidden allergy or a dose conflict.
[fix] Phase 2: mixed set, code checks + rubric judge: **Blocked**: 4 of 5 items fail, each with a named reason a developer can fix.
  Items tested | H1, H2 | H1, H2, A1, E1, E2
  Graders | a glance | code (hard rules) + LLM judge (rubric, JSON)
  H1 · golden (happy path) | looks fine (bad) | no Allergies section (bad)
  H2 · golden (happy path) | looks fine (bad) | no Allergies section (bad)
  A1 · adversarial (extra PHI in the record) | not tested | no Allergies section; PHI not needed by the GP: 555-0142; PHI not needed by the GP: MHP-55-0192-7781 (bad)
  E1 · edge case (conflicting dose) | not tested | no Allergies section (bad)
  E2 · edge case (allergy only in the nursing note) | not tested | pass (good)
  Release decision | release (bad) | blocked (good)

11 Claude calls · 6778 in / 3358 out tokens · about US$0.0024 · 17.1 s
```

## Check your answer
**Answer: A.** Typical notes read by eye only show that the prompt works on easy cases. A mixed dataset adds the cases that break systems: adversarial notes (extra PHI in the record) and edge cases (an allergy recorded in only one place, conflicting doses), alongside golden happy-path items. Each property then gets the right grader: hard rules such as required sections, no unnecessary identifiers and known allergies present are checked in code, and clinical judgement such as faithfulness and flagging conflicts goes to an LLM judge with a written rubric, calibrated against clinician labels.

Why the other answers fall short:

- **B.** More typical notes still contain no adversarial or edge cases, and one overall 1-5 score cannot say which rule failed.
- **C.** Sign-off is a final human check, not an evaluation: errors reach clinicians' queues, and nothing tests the change before go-live.
- **D.** Exact text overlap punishes a correct summary worded differently and cannot tell a leaked phone number from a harmless phrase.

## Why it happens
A set of typical notes read by eye only proves the prompt works on easy cases. A mixed dataset adds what breaks systems in production: an adversarial note with extra PHI, edge cases where the allergy or the dose conflicts, alongside golden happy-path items. Then each property gets the right grader. Hard rules (required sections, no unnecessary identifiers, a known allergy present) are checked in code: exact, cheap and repeatable. Clinical judgement (is every fact supported, is a conflict flagged) goes to an LLM judge with a written rubric and a JSON schema, which Meridian would calibrate against clinician labels before trusting it. The prompt under test is the same in both phases; only the dataset and graders changed.

## Exam tip
'Mixed methodologies' means mixed data and mixed graders: golden, adversarial and edge cases, with code for deterministic rules and an LLM judge with a rubric for judgement. Bigger happy-path sets, exact-match scoring and relying on human sign-off are the distractors.

## Try this next
Fix DRAFTER_V2 in this lab's code: copy only the name and MRN, add an Allergies section that checks the nursing notes, and tell it to flag conflicting doses for the clinician. Run again: phase 1 still passes (it always did), and phase 2 now shows which rows turned green and which still need work.

---
Source: Original question written for C740. Course: Claude Certified Architect - Professional (CCAR-P) Exam Prep (C740). © Tertiary Infotech Academy Pte Ltd · UEN 201200696W
