# Lab 28: 54 seconds a draft is a signature: route review by risk
> Day 2 · Topic 5: Governance, Safety & Risk Management · Task statement 5.3 · Simulator 3: Meridian Clinical Notes · About 12 minutes · Claude Haiku 5.5

## Goal
Task statement 5.3: **Apply human-in-the-loop validation strategies.** You answer one exam-style question, then run the Meridian Clinical Notes simulator and watch the tempting design fail and the right one work, with real Claude calls.

## Open this lab

- **The main lab page:** [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/). It lists all 38 simulator labs, the Day 2 builds (Labs 39 to 41) and the practice exam, and holds the API key box.
- **Run it live in your browser (nothing to install):** open [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=28](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=28), paste your Anthropic API key into the sidebar once, then press **Simulate it live**. Every call uses `claude-haiku-5-5`. The run **stops after the first method** and shows its outcome; press **Proceed** to run the fix, then read the two **side by side** under The observation explained.
- **In a terminal, one click:** double-click `run-lab.command` (Mac) or `run-lab.cmd` (Windows) in this folder. It runs `node docs/tools/test_lab.mjs 28` from the repository root, with the same engine the site uses. It needs Node.js and your key in a `.env` file at the repository root (one line: `ANTHROPIC_API_KEY=sk-ant-...`).
- **The code it runs:** [docs/sims/lab-28.js](https://github.com/tertiarycourses/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/blob/main/docs/sims/lab-28.js), on the shared engine [docs/assets/engine.js](https://github.com/tertiarycourses/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/blob/main/docs/assets/engine.js).

## The scenario
Meridian Health, a US hospital group, uses Claude to draft discharge summaries and referral letters from clinicians' visit notes. The notes contain protected health information (PHI) under HIPAA, and every draft is signed off by a clinician before it leaves the hospital. Accuracy, privacy and an audit trail matter more than speed.

## Key concepts
- **Impact × reversibility.** Gate actions that are high-impact and can't be undone, such as a letter that leaves the hospital. Monitor actions that can be amended, such as an internal chart note, instead of gating them.
- **Reviewer load.** Load = volume × share reviewed × minutes each ÷ reviewer minutes available. Above 1, reviews turn into signatures: 600 drafts in 540 minutes is 54 seconds each.
- **Automation bias.** When a system is usually right, people stop checking it. Near-100% approval and falling time per decision are the signs. Showing why a draft was flagged gives the reviewer something to check.
- **Confidence is a signal, not a verdict.** A model's self-reported confidence can help route work, but only alongside signals code can check: high-alert drugs, conflicting values, pending results.
- **Sample what you don't review.** Auto-filed items need a random audit sample. It measures the real error rate of the unreviewed stream and catches drift before patients do.

## The question
Meridian Health drafts about 600 clinical letters and notes a day with Claude, and three clinicians have 540 minutes a day for sign-off. Every draft joins one queue, approval rates are close to 100%, and a GP letter with conflicting warfarin doses was signed in under a minute. Which human-in-the-loop design best fits this situation?

- **A.** Route each draft in code by impact, reversibility and uncertainty; flagged drafts get full review with reasons, the rest a co-sign or sampled audit.
- **B.** Keep a full review of every draft, but add two more clinicians and a checklist, so that each draft gets a careful, complete read before it is released.
- **C.** Release drafts that Claude rates as high confidence without review, and send only its medium and low confidence drafts to the clinicians.
- **D.** Release every draft automatically, and have clinicians audit a random 10% sample of each week's drafts, feeding the errors they find back into the prompt.

Pick your answer before you run anything. The answer and the reasoning are at the end, under **Check your answer**.

## Steps on the simulator site
1. Open [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=28](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=28). The left sidebar should say the API key is **saved**. If it says **not set**, paste your key into the **Anthropic API key** box, press **Save**, then **Test**.
2. Read the task statement card and the question. Click the answer you chose. The page tells you at once whether it is right, and why. Open **Why the other answers fall short**.
3. Press **▶ Simulate it live**. The scenario board shows the story, the code runs on the left and Claude's live output appears on the right.
4. When the run pauses, read the outcome of the first method (the trap). Then press **▶ Proceed** to run the fix.
5. Read **Claude's final output**, then **The observation explained**: the two methods side by side, turn by turn, and the checks on what Claude actually did.
6. Open **See the full code this lab runs** and find the lines that make the difference.

## Or run it from a terminal
From the repository root:

```
node docs/tools/test_lab.mjs 28
```

## What you will see
What to look for: One uniform queue signs Patient C's warfarin letter in 54 seconds; risk routing sends C and D to full review with reasons.

These lines are from our own run of this lab on Claude Haiku 5.5. Your wording will differ, because Claude writes each reply fresh; the tool calls, decisions and checks should match. This is an excerpt: wherever … appears, text has been shortened, and a line with only … marks lines left out. Run the lab to see the full output.

```
Four notes: Patient A (ED discharge note, internal), Patient B (Discharge letter to GP, leaves the hospital), Patient C (Discharge letter to GP, leaves the hospital), P…
== Phase 1 · one queue, everything signed: every draft joins one sign-off queue with no risk signals
    Draft four documents: POST /v1/messages · model claude-haiku-5-5 · output_config json_schema
  queue · Patient A: signed as drafted after 54 s
  queue · Patient B: signed as drafted after 54 s
  queue · Patient C: signed as drafted after 54 s
  queue · Patient D: signed as drafted after 54 s
Phase 1 result: Patient C's letter (warfarin 5 mg in the draft) was signed after 54 seconds. The note's 5 mg vs 3 mg conflict was never shown to the reviewer. A proper …

== PAUSE · Phase 1 finished: every draft signed, none really reviewed
   outcome: **Patient C's warfarin letter left the hospital after a 54-second sign-off**, with the note's 5 mg vs 3 mg conflict unresolved. Reviewing all 600 drafts pro…
   proceed: Phase 2: the same notes, routed in code by impact × reversibility × uncertainty

== Phase 2 · route by risk: full review with reasons for flagged drafts, co-sign for unflagged letters, auto-file and sample for unflagged internal notes
    Draft four documents: POST /v1/messages · model claude-haiku-5-5 · output_config json_schema
  route · Patient A: AUTO-FILE · impact low, reversible, uncertainty none -> filed (amendable)
  route · Patient B: CO-SIGN · impact medium, irreversible, uncertainty none -> co-signed
  route · Patient C: FULL REVIEW · impact high, irreversible, uncertainty flagged · high-alert medication: warfarin; warfarin dose differs in the note: 5 mg vs 3 mg; Cl…
  route · Patient D: FULL REVIEW · impact high, irreversible, uncertainty none · a result is still pending -> held: released once the echo report is attached

== Turns
Draft four documents turn 1: stop_reason=end_turn
Draft four documents turn 1: stop_reason=end_turn

== Checks
PASS  Phase 1: Patient C's warfarin letter was signed in the uniform queue without the dose conflict being shown to the reviewer
PASS  Phase 2: Patient C was routed to full review with reasons naming warfarin and the dose conflict
PASS  Phase 2: Patient D's referral was held for full review because the echo report is pending
PASS  Phase 2: Patient A's internal note was auto-filed, not queued, and reviewer load fits the time available
PASS  Phase 2: every routing decision is in the audit log with its impact, reversibility, uncertainty and reasons

== Side by side
[trap] Phase 1: one queue, everything signed: Every draft got **54 seconds**. Patient C's warfarin letter was signed as drafted; the dose conflict in the note was never…
[fix] Phase 2: route by risk, with reasons: C went to **full review** with the reasons on screen (high-alert medication: warfarin; warfarin dose differs in the note: 5 …
  Routing | one FIFO queue | A: auto-file · B: co-sign · C: full review · D: full review (good)
  What the reviewer sees for C | the draft only (bad) | high-alert medication: warfarin; warfarin dose differs in the note: 5 mg vs 3 mg; Claude's confidence: low; 2 qu…
  Time per draft | 54 s each | 4 min flagged · 30 s co-sign · 0 s auto-file
  Reviewer minutes a day (600 drafts) | 2400 needed / 540 (load 4.4) (bad) | 480 needed / 540 (load 0.89) (good)
  Patient C outcome | released, conflict unseen (bad) | held: dose confirmed with the ward team before release (good)
  Audit trail | signature only | 4 routing records with axes and reasons (good)

2 Claude calls · 2644 in / 4155 out tokens · about US$0.0023 · 17.5 s
```

## Check your answer
**Answer: A.** Oversight is a budget. At 600 drafts in 540 minutes a uniform review becomes a signature, so the fix is to spend reviewer time by risk: code flags what it can check (high-alert drugs, conflicting doses, pending results, whether the document leaves the hospital), adds Claude's own uncertainty as a signal, and shows the reviewer the reasons. Unflagged letters get a quick co-sign, unflagged internal notes are filed and sampled, and every route is logged.

Why the other answers fall short:

- **B.** Five clinicians give 900 minutes for 600 drafts, still about 90 seconds each, so the queue stays a rubber stamp.
- **C.** Self-reported confidence alone ignores impact and reversibility, and it isn't calibrated against outcomes.
- **D.** A weekly audit is detective: a letter with the wrong warfarin dose has already reached the GP.

## Why it happens
A uniform 100% review looks like the safest design, and at volume it fails: 600 drafts a day in 540 reviewer minutes leaves 54 seconds each, so the review turns into a signature. The warfarin letter needed four minutes and a reason to look. Phase 2 spends the same reviewers' time by risk. Code reads what it can check for itself (a high-alert medication, two different doses, a pending result, whether the document leaves the hospital) and adds Claude's own open questions and confidence as a signal, not a verdict. Irreversible, high-impact drafts get a full review with the reasons on screen; unflagged letters get a quick co-sign; unflagged internal notes, which a clinician can amend, are filed and sampled for audit. Every decision goes to the audit log with its axes and reasons.

## Exam tip
Look for the answer that tiers oversight by impact and reversibility and fits the reviewers' capacity. '100% human review' sounds safest but fails at volume through automation bias; a confidence threshold alone ignores impact; post-hoc audits can't recall an irreversible action.

## Try this next
Change Patient B's note in sims/shared/d5-clinical.js to "…oxycodone 5 mg every 6 hours as needed…" and rerun: B moves to full review because oxycodone is on the high-alert list. Then change Patient A's destination to external: true and watch it move from auto-file to co-sign.

---
Source: Original question written for C740. Course: Claude Certified Architect - Professional (CCAR-P) Exam Prep (C740). © Tertiary Infotech Academy Pte Ltd · UEN 201200696W
