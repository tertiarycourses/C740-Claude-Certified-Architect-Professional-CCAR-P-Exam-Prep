# Lab 10: 17 years of notes for one referral: select sections, cap the letter
> Day 1 · Topic 2: Claude Models, Prompting & Context Engineering · Task statement 2.4 · Simulator 3: Meridian Clinical Notes · About 12 minutes · Claude Haiku 5.5

## Goal
Task statement 2.4: **Optimize context windows and manage token usage.** You answer one exam-style question, then run the Meridian Clinical Notes simulator and watch the tempting design fail and the right one work, with real Claude calls.

## Open this lab

- **The main lab page:** [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/). It lists all 38 simulator labs, the Day 2 builds (Labs 39 to 41) and the practice exam, and holds the API key box.
- **Run it live in your browser (nothing to install):** open [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=10](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=10), paste your Anthropic API key into the sidebar once, then press **Simulate it live**. Every call uses `claude-haiku-5-5`. The run **stops after the first method** and shows its outcome; press **Proceed** to run the fix, then read the two **side by side** under The observation explained.
- **In a terminal, one click:** double-click `run-lab.command` (Mac) or `run-lab.cmd` (Windows) in this folder. It runs `node docs/tools/test_lab.mjs 10` from the repository root, with the same engine the site uses. It needs Node.js and your key in a `.env` file at the repository root (one line: `ANTHROPIC_API_KEY=sk-ant-...`).
- **The code it runs:** [docs/sims/lab-10.js](https://github.com/tertiarycourses/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/blob/main/docs/sims/lab-10.js), on the shared engine [docs/assets/engine.js](https://github.com/tertiarycourses/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/blob/main/docs/assets/engine.js).

## The scenario
Meridian Health, a US hospital group, uses Claude to draft discharge summaries and referral letters from clinicians' visit notes. The notes contain protected health information (PHI) under HIPAA, and every draft is signed off by a clinician before it leaves the hospital. Accuracy, privacy and an audit trail matter more than speed.

## Key concepts
- **Everything in the window counts.** System prompt, tool definitions, every message, documents and the output, thinking included, all count as tokens and are billed. A 1M window does not make them free.
- **Context rot.** As context grows, the model's recall of any one detail declines. Treat context as a budget: the smallest set of high-signal tokens that does the job.
- **Select, don't stuff.** Pick sections from an index, retrieve the chunks that match, or filter by type and date in code, then send only those. Selection is also a privacy control.
- **Bound the output.** An outline, a word limit and max_tokens cap the answer. Thinking tokens are output tokens: switch thinking off or lower effort for formatting tasks.
- **Measure in usage tokens.** Every response reports input_tokens and output_tokens. Compare designs on those numbers, not on guesses about prompt length.

## The question
Meridian Health drafts referral letters by sending each patient's entire record, often more than a decade of visit notes, results and routine care, with the request. The letters run long, the token bill is higher than planned, and some letters mention unrelated history such as an old psychiatric episode. Which change best reduces token usage while meeting HIPAA's minimum-necessary standard?

- **A.** Keep sending the whole record, since every current Claude model can accept a 1M-token context window.
- **B.** Summarise the full record with Claude before every letter, then draft each letter from that summary.
- **C.** Select only the sections the letter needs from an index of the record, and cap the letter with an outline.
- **D.** Send only the most recent 4,000 tokens of the record so that every request stays a small, predictable size.

Pick your answer before you run anything. The answer and the reasoning are at the end, under **Check your answer**.

## Steps on the simulator site
1. Open [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=10](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=10). The left sidebar should say the API key is **saved**. If it says **not set**, paste your key into the **Anthropic API key** box, press **Save**, then **Test**.
2. Read the task statement card and the question. Click the answer you chose. The page tells you at once whether it is right, and why. Open **Why the other answers fall short**.
3. Press **▶ Simulate it live**. The scenario board shows the story, the code runs on the left and Claude's live output appears on the right.
4. When the run pauses, read the outcome of the first method (the trap). Then press **▶ Proceed** to run the fix.
5. Read **Claude's final output**, then **The observation explained**: the two methods side by side, turn by turn, and the checks on what Claude actually did.
6. Open **See the full code this lab runs** and find the lines that make the difference.

## Or run it from a terminal
From the repository root:

```
node docs/tools/test_lab.mjs 10
```

## What you will see
What to look for: The whole record costs about 11,500 input tokens and yields a 600-word letter with unrelated history; selection uses about a third of the tokens for a 200-word letter with none.

These lines are from our own run of this lab on Claude Haiku 5.5. Your wording will differ, because Claude writes each reply fresh; the tool calls, decisions and checks should match. This is an excerpt: wherever … appears, text has been shortened, and a line with only … marks lines left out. Run the lab to see the full output.

```
Meridian · Patient A (MRN 00-4417) · a cardiology referral after new exertional chest tightness. The record holds 82 sections from 2009 to 2026.
== Phase 1 · stuff the whole record into the context, no outline or length limit
  usage: input_tokens 11,543 · output_tokens 2,439 · stop_reason end_turn · letter 596 words
  Letter: **Meridian Northside Clinic** [Clinic address] · [Telephone] · [Fax/secure email] [Date] To: Consultant Cardiologist, Rapid-Access Chest Pain Clinic [Hospital…

== PAUSE · Phase 1 finished: the whole record in the context
   outcome: The call sent **11,543 input tokens**: all 82 sections, for a letter that needs 5 of them. The letter ran to **596 words** (2,439 output tokens) and carried…
   proceed: Phase 2: pick the sections from the record index, then draft to a 180-word outline

== Phase 2 · select sections from the record index, load only those, draft to a 180-word outline
  Selector: input_tokens 2,306 · output_tokens 441 · picked 10: V-2026-11-12, L-2026-11-13, V-2026-08-20, L-2026-08-18, V-2025-11-04, PROB, MEDS, ALLERGY, FHX, SOC
  Drafter: input_tokens 1,735 · output_tokens 657 · stop_reason end_turn · letter 206 words
  Letter: **Referral to Rapid-Access Chest Pain Clinic – Cardiology** **From:** Dr R. Osei, GP, Meridian Northside Clinic **Patient:** Patient A | MRN 00-4417 | DOB 14/…
== Result: input tokens 11,543 → 4,041 (35%) · letter 596 → 206 words · cost US$0.0024 → US$0.0010

== Turns

== Checks
PASS  Phase 1 sent the whole record (11,543 input tokens) and its letter carried unrelated history (4 items)
PASS  Phase 2: the selection kept all 5 needed sections and neither sensitive note (2009 psychiatry, 2014 sexual health)
PASS  Phase 2 used under 40% of phase 1's input tokens (35%)
PASS  Phase 2: the letter finished within the cap (end_turn, 206 words with headings, under half of phase 1's 596)
PASS  Phase 2: the letter carries all 5 key facts and none of the unrelated history

== Side by side
[trap] Phase 1: whole record, no limit: 11,543 input tokens for a letter that needs 5 of 82 sections; 596 words, carrying **depression / sertraline (2009), sexual healt…
[fix] Phase 2: select from the index, draft to an outline: 4,041 input tokens across both calls (**35%** of phase 1), a 206-word letter with all 5 key facts and nothing…
  Sections in the context | 82 (all) | 10 chosen (good)
  Input tokens (usage.input_tokens) | 11,543 | 4,041 (35%) (good)
  Output tokens (incl. thinking) · letter length | 2,439 · 596 words | 1,098 · 206 words (good)
  Key facts (chest pain, T-waves, troponin, penicillin, aspirin) | 5/5 | 5/5 (good)
  Unrelated history in the letter | depression / sertraline (2009), sexual health visit (2014), eczema, dental (bad) | none (good)
  Cost of the design (Haiku 5.5) | US$0.0024 | US$0.0010

3 Claude calls · 15584 in / 3537 out tokens · about US$0.0033 · 16.7 s
```

## Check your answer
**Answer: C.** Fitting in the window is not the question. Every token sent is paid for, competes for the model's attention, and may end up in the output. Selecting the sections the task needs from an index (titles and dates, no clinical text) and loading only those cuts input tokens and keeps unrelated PHI out of the context by design; an outline, a word limit and max_tokens bound the output.

Why the other answers fall short:

- **A.** The record fits, but every call pays for all of it, and unrelated PHI in the context can reach the letter.
- **B.** Summarising still sends the whole record on every letter, adds a call, and the summary can carry unrelated history.
- **D.** Truncating by recency drops older facts the letter needs, such as a 2008 penicillin allergy.

## Why it happens
Every current Claude model accepts a 1M-token context, so the record always fits. Fitting is not the question: every token in the context costs money on every call, competes for the model's attention, and is a chance to repeat something the reader should not see. The referral needs the problem list, current medicines, allergies, the chest-pain visit and its bloods. A selection pass over the record's index (titles and dates, no clinical text) picks those, code loads only them, and the letter is drafted to a fixed outline with a word limit. Input tokens fall to a fraction, the output is bounded, and HIPAA's minimum-necessary standard is met by design rather than by hoping the model leaves the 2009 psychiatry note out.

## Exam tip
A large context window answers 'will it fit?', not 'should it be there?'. Prefer the option that selects what the task needs and bounds the output; truncation loses needed facts and summarising first still pays for everything.

## Try this next
Remove "Include only what the cardiologist needs" from OUTLINE and add V-2009-05-11 to the selected ids in run(): the 2009 depression episode now reaches the letter, because what is in the context gets used. Then change the selection prompt to ask for "everything that might be useful" and watch the input tokens climb back.

---
Source: Original question written for C740. Course: Claude Certified Architect - Professional (CCAR-P) Exam Prep (C740). © Tertiary Infotech Academy Pte Ltd · UEN 201200696W
