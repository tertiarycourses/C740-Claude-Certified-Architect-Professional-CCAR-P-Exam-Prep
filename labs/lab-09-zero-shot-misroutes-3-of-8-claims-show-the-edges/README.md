# Lab 9: Zero-shot misroutes 3 of 8 claims: show the edges, reason, then label
> Day 1 · Topic 2: Claude Models, Prompting & Context Engineering · Task statement 2.3 · Simulator 1: Harbour Mutual Claims Desk · About 12 minutes · Claude Haiku 5.5

## Goal
Task statement 2.3: **Apply prompt engineering techniques (zero-shot, few-shot, chain-of-thought).** You answer one exam-style question, then run the Harbour Mutual Claims Desk simulator and watch the tempting design fail and the right one work, with real Claude calls.

## Open this lab

- **The main lab page:** [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/). It lists all 38 simulator labs, the Day 2 builds (Labs 39 to 41) and the practice exam, and holds the API key box.
- **Run it live in your browser (nothing to install):** open [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=9](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=9), paste your Anthropic API key into the sidebar once, then press **Simulate it live**. Every call uses `claude-haiku-5-5`. The run **stops after the first method** and shows its outcome; press **Proceed** to run the fix, then read the two **side by side** under The observation explained.
- **In a terminal, one click:** double-click `run-lab.command` (Mac) or `run-lab.cmd` (Windows) in this folder. It runs `node docs/tools/test_lab.mjs 9` from the repository root, with the same engine the site uses. It needs Node.js and your key in a `.env` file at the repository root (one line: `ANTHROPIC_API_KEY=sk-ant-...`).
- **The code it runs:** [docs/sims/lab-09.js](https://github.com/tertiarycourses/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/blob/main/docs/sims/lab-09.js), on the shared engine [docs/assets/engine.js](https://github.com/tertiarycourses/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/blob/main/docs/assets/engine.js).

## The scenario
Harbour Mutual Insurance is replacing its first-line motor-claims triage with a Claude-based claims agent. The agent reads policies and claims, requests damage assessments, drafts customer letters, and can approve payouts or escalate to a human adjuster. Adjusters, the finance controller and the regulator all have a stake in how it is built. Claims arrive as free-text forms, photos and repair quotes.

## Key concepts
- **Zero-shot.** Instructions and definitions only, no examples. It works when the task is clear from the definitions; it fails systematically where they leave a boundary open.
- **Few-shot examples.** A few input-output pairs in the prompt show the format and how your organisation applies its rules. Choose them to cover the boundaries, and vary them.
- **Chain-of-thought.** Asking for reasoning before the answer lets the model work through the steps first. In structured outputs, put the reasoning field before the label field.
- **Errors that repeat are systematic.** If the same cases fail on every run, the prompt is missing information. More confidence or a bigger model rarely fixes that; better examples usually do.

## The question
Harbour Mutual's triage classifier routes motor claims into four routes using a zero-shot prompt with a one-line definition of each route. On the eval set it handles plain claims well but misroutes the same boundary cases on every run: quotes just over US$5,000 before the excess is deducted, a third-party-only policyholder whose victim is claiming, and own-damage write-offs on third-party policies. Which change most directly fixes these errors?

- **A.** Switch the classifier to Claude Opus 5.5, which knows enough about motor insurance to settle these cases without examples.
- **B.** Ask for a confidence score with every label, and send each claim scored below 0.8 to a human adjuster for routing.
- **C.** Add "Think very carefully about edge cases and double-check every label" to the end of the existing system prompt.
- **D.** Add worked examples of exactly these boundary cases to the prompt, each with brief reasoning written before its label.

Pick your answer before you run anything. The answer and the reasoning are at the end, under **Check your answer**.

## Steps on the simulator site
1. Open [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=9](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=9). The left sidebar should say the API key is **saved**. If it says **not set**, paste your key into the **Anthropic API key** box, press **Save**, then **Test**.
2. Read the task statement card and the question. Click the answer you chose. The page tells you at once whether it is right, and why. Open **Why the other answers fall short**.
3. Press **▶ Simulate it live**. The scenario board shows the story, the code runs on the left and Claude's live output appears on the right.
4. When the run pauses, read the outcome of the first method (the trap). Then press **▶ Proceed** to run the fix.
5. Read **Claude's final output**, then **The observation explained**: the two methods side by side, turn by turn, and the checks on what Claude actually did.
6. Open **See the full code this lab runs** and find the lines that make the difference.

## Or run it from a terminal
From the repository root:

```
node docs/tools/test_lab.mjs 9
```

## What you will see
What to look for: Zero-shot gets the plain claims right and misroutes CLM-7790, 7815 and 7821; with six worked examples and reasoning first, all eight route correctly.

These lines are from our own run of this lab on Claude Haiku 5.5. Your wording will differ, because Claude writes each reply fresh; the tool calls, decisions and checks should match. This is an excerpt: wherever … appears, text has been shortened, and a line with only … marks lines left out. Run the lab to see the full output.

```
Harbour Mutual claims triage: 8 incoming claims, 4 routes, an answer key from the adjusters. Both phases run with thinking off, as a high-volume classifier would.
== Phase 1 · zero-shot: route definitions only, label only
  ok    CLM-7781 → auto_approve
  WRONG CLM-7790 → adjuster_review (answer key: decline)  · edge: a large loss, but own damage on third-party only
  ok    CLM-7802 → glass_fast_track
  WRONG CLM-7815 → adjuster_review (answer key: auto_approve)  · edge: quote above US$5,000, payout after the US$750 excess is US$4,850
  WRONG CLM-7821 → adjuster_review (answer key: auto_approve)  · edge: third-party only covers the other party's van
  ok    CLM-7833 → adjuster_review  · edge: small amount, but an injury is mentioned
  ok    CLM-7840 → decline  · edge: glass damage, but on a track day (excluded)
  ok    CLM-7847 → adjuster_review
  usage: input_tokens 1199 · output_tokens 213

== PAUSE · Phase 1 finished: zero-shot
   outcome: **5 of 8** claims routed correctly. Misrouted: **CLM-7790** → adjuster_review (key: decline; a large loss, but own damage on third-party only); **CLM-7815**…
   proceed: Phase 2: the same definitions plus six worked edge-case examples, reasoning before the label

== Phase 2 · few-shot: 6 worked edge-case examples, reasoning before the label
  ok    CLM-7781 → auto_approve
         reasoning: Comprehensive policy HM-POL-2201 covers collision damage from another car in a car park. Payout is US$4,200 minus US$500 excess, which is US$3,700, …
  ok    CLM-7790 → decline  · edge: a large loss, but own damage on third-party only
         reasoning: Third-party only policy HM-POL-2240 does not cover damage to the policyholder's own vehicle. A total loss from hitting a wall is own-damage, so it i…
  ok    CLM-7802 → glass_fast_track
         reasoning: Windscreen-only damage from a stone chip on a comprehensive policy with glass cover, with no commercial or track exclusion. Qualifies for glass fast…
  ok    CLM-7815 → auto_approve  · edge: quote above US$5,000, payout after the US$750 excess is US$4,850
         reasoning: Comprehensive policy HM-POL-2255 covers falling-branch damage. Payout is US$5,600 minus US$750 excess, which is US$4,850, within the US$5,000 author…
  ok    CLM-7821 → auto_approve  · edge: third-party only covers the other party's van
         reasoning: Third-party only policy HM-POL-2240 covers damage the policyholder causes to a third party's vehicle. Reversing into a parked van is covered, and th…
  ok    CLM-7833 → adjuster_review  · edge: small amount, but an injury is mentioned
         reasoning: Car damage of US$1,150 is covered under HM-POL-2255, but the policyholder reports wrist soreness and a GP visit. A possible bodily-injury claim requ…
  ok    CLM-7840 → decline  · edge: glass damage, but on a track day (excluded)
         reasoning: Damage occurred during a track day at Harbour Raceway, which all Harbour motor policies exclude. The glass fast track does not apply because the los…
  ok    CLM-7847 → adjuster_review
         reasoning: Covered comprehensive collision damage under HM-POL-2255. Payout is US$6,900 minus US$750 excess, which is US$6,150, above the US$5,000 authority, s…
  usage: input_tokens 2020 · output_tokens 802
== Result: zero-shot 5/8 · few-shot with reasoning 8/8 · fixed: CLM-7790, CLM-7815, CLM-7821

== Turns

== Checks
PASS  Both phases returned parseable JSON with a route for all 8 claims
PASS  Zero-shot misrouted at least 2 edge cases (CLM-7790, CLM-7815, CLM-7821)
PASS  Few-shot with reasoning routed all 8 claims correctly (8/8)
PASS  Few-shot output carries reasoning for every claim, ahead of the label

== Side by side
[trap] Phase 1: zero-shot, label only: **5/8** correct. Misrouted CLM-7790, CLM-7815, CLM-7821: the plain claims are right, the boundaries are guessed.
[fix] Phase 2: few-shot examples, reasoning before the label: **8/8** correct, including CLM-7790, CLM-7815, CLM-7821. Each label follows a line of reasoning a reviewer…
  CLM-7781 (key: auto_approve) | auto_approve (good) | auto_approve (good)
  CLM-7790 (key: decline) · a large loss, but own damage on third-party only | adjuster_review (bad) | decline (good)
  CLM-7802 (key: glass_fast_track) | glass_fast_track (good) | glass_fast_track (good)
  CLM-7815 (key: auto_approve) · quote above US$5,000, payout after the US$750 excess is US$4,850 | adjuster_review (bad) | auto_approve (good)
  CLM-7821 (key: auto_approve) · third-party only covers the other party's van | adjuster_review (bad) | auto_approve (good)
  CLM-7833 (key: adjuster_review) · small amount, but an injury is mentioned | adjuster_review (good) | adjuster_review (good)
  CLM-7840 (key: decline) · glass damage, but on a track day (excluded) | decline (good) | decline (good)
  CLM-7847 (key: adjuster_review) | adjuster_review (good) | adjuster_review (good)
  Correct | 5/8 | 8/8
  Output tokens (the cost of the reasoning) | 213 | 802

2 Claude calls · 3219 in / 1015 out tokens · about US$0.0008 · 6.0 s
```

## Check your answer
**Answer: D.** The errors are systematic: the one-line definitions leave Harbour's boundary conventions open (the authority applies to the payout after the excess; third-party cover pays the other party's damage), and zero-shot the model guesses the same way every time. Few-shot examples placed on those boundaries show how Harbour applies its rules, and reasoning written before the label makes the model work each case through before it commits.

Why the other answers fall short:

- **A.** A bigger model costs more per claim and still has to guess Harbour's own conventions, which only examples or rules supply.
- **B.** The wrong labels are systematic and given confidently, so a self-reported score will not catch them, and it adds adjuster work.
- **C.** A plea for care names no convention, so the model has nothing new to apply on the boundary cases.

## Why it happens
A one-line definition of each route is enough for the plain claims and not enough for the boundaries: does the US$5,000 authority apply to the quote or the payout, and does third-party only cover the van you reversed into? Zero-shot, the classifier guesses, and it guesses the same way every time, so the errors are systematic. A handful of worked examples placed on those boundaries shows how Harbour applies its own rules, and asking for short reasoning before the label (here, by putting reasoning first in the output schema) makes the classifier work the case through before it commits. Structured output keeps the result machine-readable either way; examples and reasoning are what move accuracy.

## Exam tip
Few-shot examples fix systematic errors on the cases a definition leaves open; reasoning before the answer helps on cases that need several steps. Confidence scores and 'be careful' instructions do not teach the model anything new.

## Try this next
In sims/shared/d2-harbour.js delete the first example (the US$5,250 trolley dent) and run again: CLM-7815 usually goes back to adjuster_review. Then keep the examples but remove the reasoning field from the schema in schema(true): the labels get less stable on the boundary cases.

---
Source: Original question written for C740. Course: Claude Certified Architect - Professional (CCAR-P) Exam Prep (C740). © Tertiary Infotech Academy Pte Ltd · UEN 201200696W
