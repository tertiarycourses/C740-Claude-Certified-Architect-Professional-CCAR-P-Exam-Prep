# Lab 27: Two calls agreed on the wrong payout: let code compute it
> Day 2 · Topic 5: Governance, Safety & Risk Management · Task statement 5.2 · Simulator 1: Harbour Mutual Claims Desk · About 12 minutes · Claude Haiku 5.5

## Goal
Task statement 5.2: **Identify risks, limitations, and failure modes of LLM systems.** You answer one exam-style question, then run the Harbour Mutual Claims Desk simulator and watch the tempting design fail and the right one work, with real Claude calls.

## Open this lab

- **The main lab page:** [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/). It lists all 38 simulator labs, the Day 2 builds (Labs 39 to 41) and the practice exam, and holds the API key box.
- **Run it live in your browser (nothing to install):** open [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=27](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=27), paste your Anthropic API key into the sidebar once, then press **Simulate it live**. Every call uses `claude-haiku-5-5`. The run **stops after the first method** and shows its outcome; press **Proceed** to run the fix, then read the two **side by side** under The observation explained.
- **In a terminal, one click:** double-click `run-lab.command` (Mac) or `run-lab.cmd` (Windows) in this folder. It runs `node docs/tools/test_lab.mjs 27` from the repository root, with the same engine the site uses. It needs Node.js and your key in a `.env` file at the repository root (one line: `ANTHROPIC_API_KEY=sk-ant-...`).
- **The code it runs:** [docs/sims/lab-27.js](https://github.com/tertiarycourses/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/blob/main/docs/sims/lab-27.js), on the shared engine [docs/assets/engine.js](https://github.com/tertiarycourses/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/blob/main/docs/assets/engine.js).

## The scenario
Harbour Mutual Insurance is replacing its first-line motor-claims triage with a Claude-based claims agent. The agent reads policies and claims, requests damage assessments, drafts customer letters, and can approve payouts or escalate to a human adjuster. Adjusters, the finance controller and the regulator all have a stake in how it is built. Claims arrive as free-text forms, photos and repair quotes.

## Key concepts
- **Fluent is not correct.** An LLM produces a plausible answer to the question asked, even when the input can't support one. A required number in a schema gets filled, with or without the facts.
- **Self-consistency is not verification.** Two calls of the same model share the same blind spots. Agreement shows stability, not truth; an independent check uses a different source, such as the document or code.
- **Arithmetic is a known weak spot.** Long sums in one pass are error-prone, more so with thinking off. Bigger models and examples make errors rarer, not impossible. Hard arithmetic belongs in code.
- **Ground every extracted value.** Check each extracted amount against the source text, and require null where the source prints nothing. A value that isn't in the document is a guess.
- **Hold on missing input.** When a required input is missing, stop and fetch it; don't compute around the gap. Missing data is a reason to route the case, not to estimate.

## The question
Harbour Mutual's claims agent calculates payouts from garage quotes and pays any amount within its US$5,000 authority. To catch errors, a second Claude call recalculates each payout, and the agent pays only when both agree. An audit finds a payout that both calls agreed on, but that silently left out an unpriced quote line, which kept it under the limit. Which change best addresses this failure mode?

- **A.** Move the calculation step to Claude Opus 5.5, whose stronger reasoning makes arithmetic and omission errors much less likely than on a smaller model.
- **B.** Add worked examples to the prompt, including a quote with an unpriced line, that show the model how to flag a gap before it calculates.
- **C.** Have Claude extract each line with null for missing amounts, then compute the payout in code and hold any claim that has an unpriced line.
- **D.** Add a third independent calculation call and pay only when all three agree, routing any disagreement between the calls to an adjuster.

Pick your answer before you run anything. The answer and the reasoning are at the end, under **Check your answer**.

## Steps on the simulator site
1. Open [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=27](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=27). The left sidebar should say the API key is **saved**. If it says **not set**, paste your key into the **Anthropic API key** box, press **Save**, then **Test**.
2. Read the task statement card and the question. Click the answer you chose. The page tells you at once whether it is right, and why. Open **Why the other answers fall short**.
3. Press **▶ Simulate it live**. The scenario board shows the story, the code runs on the left and Claude's live output appears on the right.
4. When the run pauses, read the outcome of the first method (the trap). Then press **▶ Proceed** to run the fix.
5. Read **Claude's final output**, then **The observation explained**: the two methods side by side, turn by turn, and the checks on what Claude actually did.
6. Open **See the full code this lab runs** and find the lines that make the difference.

## Or run it from a terminal
From the repository root:

```
node docs/tools/test_lab.mjs 27
```

## What you will see
What to look for: Both Phase 1 calls agree on about $4,810.58 and it is paid; Phase 2 holds for line 14, computes $5,340.64 and escalates.

These lines are from our own run of this lab on Claude Haiku 5.5. Your wording will differ, because Claude writes each reply fresh; the tool calls, decisions and checks should match. This is an excerpt: wherever … appears, text has been shortened, and a line with only … marks lines left out. Run the lab to see the full output.

```
CLM-7815 · Priya Nair · rear-end collision, 6 Nov 2026 · 21-line quote, line 14 (paint and materials) not priced: "per materials sheet to follow". With the sheet's $486…
== Phase 1 · two calls agree, so pay: Claude calculates, a second call re-calculates, the payout system acts when they match
    Calculate: POST /v1/messages · model claude-haiku-5-5 · output_config json_schema
    Re-calculate: POST /v1/messages · model claude-haiku-5-5 · output_config json_schema
  Claude: $4,810.58 · second call: $4,810.58 · they agree
  payout system: approve_payout($4,810.58)
Phase 1 result: both calls agreed on $4,810.58, below the authority, so the pipeline paid it with no adjuster. The quote never priced line 14; with it, the payout is $5…

== PAUSE · Phase 1 finished: two calls agreed, so the pipeline paid
   outcome: **Both calls said $4,810.58, and the pipeline paid it without an adjuster.** Neither call could know line 14's amount: the quote doesn't print it. With the …
   proceed: Phase 2: Claude extracts the lines; code grounds them, holds for the missing sheet, computes and routes

== Phase 2 · the model copies, code decides: extract every line (null where unpriced), ground it, hold for the gap, compute in code
    Extract: POST /v1/messages · model claude-haiku-5-5 · output_config json_schema
  Claude: 21 lines extracted · null amounts on line(s) 14
  ground(): 20 priced lines match the quote · unpriced: line 14
  payout system: hold(CLM-7815) · line 14 unpriced · request_document("materials sheet")
  <- MS-7815: Bayside Autobody · materials sheet for CLM-7815 · line 14: Paint and materials (2K clear coat, base coat, primer, abrasives) · $486.30 excl. GST
  compute_payout(): parts and materials $3,557.70 + GST $320.19 + labour $1,962.75 - excess $500 = $5,340.64
  payout system: escalate_to_adjuster($5,340.64) · $5,340.64 is above the $5,000.00 authority

== Turns
Calculate turn 1: stop_reason=end_turn
Re-calculate turn 1: stop_reason=end_turn
Extract turn 1: stop_reason=end_turn

== Checks
PASS  Phase 1: both calls agreed on a figure that leaves out unpriced line 14, and it was paid without an adjuster
PASS  Phase 2: all 21 lines extracted; the 20 priced amounts match the quote and line 14 came back null, not guessed
PASS  Phase 2: code held the claim until the materials sheet arrived, then computed the payout itself
PASS  Phase 2: $5,340.64 is above the $5,000 authority, so the claim was escalated to an adjuster

== Side by side
[trap] Phase 1: two calls agree, so pay: Both calls said **$4,810.58**: consistent, fluent and wrong. Line 14 was never priced, so the pipeline paid without an adjuster.
[fix] Phase 2: model copies, code decides: Code saw line 14 was unpriced and **held** the claim, fetched the sheet, computed **$5,340.64** and escalated it (above $5,00…
  What Claude was asked for | the payout, twice | the lines it can read; null where none is printed (good)
  Line 14 (paint and materials) | silently left out (bad) | null → hold → materials sheet $486.30 (good)
  The check | two calls agree (bad) | ground every line in the quote, compute in code (good)
  Figure acted on | $4,810.58 (bad) | $5,340.64 (good)
  Action | approve_payout (bad) | escalate_to_adjuster (good)

3 Claude calls · 2821 in / 1938 out tokens · about US$0.0013 · 11.1 s
```

## Check your answer
**Answer: C.** The failure mode is a fluent figure produced from input that can't support it, confirmed by a check that shares the same blind spot. The reliable fix splits the work: Claude does what it is good at (reading and copying lines, with null where nothing is printed), and deterministic code grounds each line in the quote, refuses to compute while a line is unpriced, applies the policy terms and checks the authority limit.

Why the other answers fall short:

- **A.** A larger model makes errors rarer, not impossible, and it still has to guess an amount the quote doesn't print.
- **B.** Examples improve the odds but leave the payout resting on the model's arithmetic and its judgement.
- **D.** More calls of the same model share the same blind spot, so they can agree on the same wrong figure.

## Why it happens
Phase 1 shows two failure modes at once. The model answers the question it was asked even when the input cannot support an answer: the quote leaves line 14 unpriced, so any payout is a guess, yet the schema asked for a number and got a fluent one. And agreement between two calls is not verification: both calls share the same blind spot, so they agree on the same wrong figure. The figure lands under the $5,000 authority, so the pipeline pays it without an adjuster, though the real payout is above the limit. The fix is to split the work by what each part does reliably. Claude reads and copies the lines, with null where the quote prints no amount. Code grounds every line against the quote, refuses to compute while any line is unpriced, fetches the missing sheet, applies the policy terms and routes on its own figure.

## Exam tip
Self-consistency (ask twice, compare) and bigger models are tempting answers to an accuracy problem. When the failure is a known mode, such as arithmetic, missing input or a hard business rule, the professional answer is to move that part into deterministic code and let the model do the reading.

## Try this next
Print line 14's amount in the quote (in sims/shared/d5-claims.js, set UNPRICED to 0) and rerun: Phase 1 now usually gets $5,340.64 and escalates. Then add thinking: { type: "disabled" } to the ask() call and rerun: the one-pass total drifts or comes back as 0, while Phase 2's figure doesn't move.

---
Source: Original question written for C740. Course: Claude Certified Architect - Professional (CCAR-P) Exam Prep (C740). © Tertiary Infotech Academy Pte Ltd · UEN 201200696W
