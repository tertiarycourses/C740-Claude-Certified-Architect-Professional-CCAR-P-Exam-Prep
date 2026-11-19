# Lab 16: Fixed chunks split the 60% exception: chunk on headings, cite
> Day 1 · Topic 3: Integration · Task statement 3.5 · Simulator 2: Northwind Policy Assistant · About 12 minutes · Claude Haiku 5.5

## Goal
Task statement 3.5: **Design a RAG pipeline with appropriate chunking and indexing strategies.** You answer one exam-style question, then run the Northwind Policy Assistant simulator and watch the tempting design fail and the right one work, with real Claude calls.

## Open this lab

- **The main lab page:** [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/). It lists all 38 simulator labs, the Day 2 builds (Labs 39 to 41) and the practice exam, and holds the API key box.
- **Run it live in your browser (nothing to install):** open [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=16](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=16), paste your Anthropic API key into the sidebar once, then press **Simulate it live**. Every call uses `claude-haiku-5-5`. The run **stops after the first method** and shows its outcome; press **Proceed** to run the fix, then read the two **side by side** under The observation explained.
- **In a terminal, one click:** double-click `run-lab.command` (Mac) or `run-lab.cmd` (Windows) in this folder. It runs `node docs/tools/test_lab.mjs 16` from the repository root, with the same engine the site uses. It needs Node.js and your key in a `.env` file at the repository root (one line: `ANTHROPIC_API_KEY=sk-ant-...`).
- **The code it runs:** [docs/sims/lab-16.js](https://github.com/tertiarycourses/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/blob/main/docs/sims/lab-16.js), on the shared engine [docs/assets/engine.js](https://github.com/tertiarycourses/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/blob/main/docs/assets/engine.js).

## The scenario
Northwind Bank's 4,000 staff ask an internal assistant about lending, compliance and HR policy. The answers come from a retrieval-augmented generation (RAG) pipeline over the bank's policy library, which is re-indexed every week as policies change. Wrong answers carry regulatory risk, so every answer must cite its source, and questions the library does not cover must be declined.

## Key concepts
- **Chunking decides what retrieval can find.** Claude reasons only over the chunks it receives. A clause split across two chunks, or separated from its heading, can be lost before Claude is ever called.
- **Cut along the document's structure.** Policies split by section and clause, tables by row with the header repeated, code by function. Fixed-size windows ignore all of these and cut mid-sentence.
- **Index more than text.** Each chunk carries its document id, section, revision, effective date and access roles. Filters on these run in code before ranking, and they make citations possible.
- **Heading paths make short chunks findable.** Prefixing 'LEND-07 Mortgage Affordability › 7 Exceptions' gives a short clause the words a query will use. Contextual Retrieval applies the same idea with a generated summary.
- **Citations make answers checkable.** Document blocks with citations enabled return the exact span behind each claim, so a reviewer or an evaluation can check the answer against its source.

## The question
Northwind Bank's policy assistant splits every policy into fixed 200-character chunks with no metadata and retrieves the top 3 for each question. Credit officers report answers that state a rule but miss the exception written two paragraphs later, and the answers cannot say which policy section they rest on. Which change to the pipeline best fixes both problems?

- **A.** Raise top-k from 3 to 20 so that more neighbouring chunks reach the model and the exception is more likely to be among them.
- **B.** Chunk each policy along its headings, store document id, section and effective date with every chunk, and answer with citations.
- **C.** Switch to a larger embedding model so that the chunk holding the exception scores closer to the chunk holding the rule it modifies.
- **D.** Add a system prompt rule telling Claude to look for exceptions in the passages and to name the source policy document in every answer.

Pick your answer before you run anything. The answer and the reasoning are at the end, under **Check your answer**.

## Steps on the simulator site
1. Open [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=16](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=16). The left sidebar should say the API key is **saved**. If it says **not set**, paste your key into the **Anthropic API key** box, press **Save**, then **Test**.
2. Read the task statement card and the question. Click the answer you chose. The page tells you at once whether it is right, and why. Open **Why the other answers fall short**.
3. Press **▶ Simulate it live**. The scenario board shows the story, the code runs on the left and Claude's live output appears on the right.
4. When the run pauses, read the outcome of the first method (the trap). Then press **▶ Proceed** to run the fix.
5. Read **Claude's final output**, then **The observation explained**: the two methods side by side, turn by turn, and the checks on what Claude actually did.
6. Open **See the full code this lab runs** and find the lines that make the difference.

## Or run it from a terminal
From the repository root:

```
node docs/tools/test_lab.mjs 16
```

## What you will see
What to look for: Fixed chunks lose both the 55% limit and the 60% exception; section chunks retrieve LEND-07 §3 and §7 and the answer cites them.

These lines are from our own run of this lab on Claude Haiku 5.5. Your wording will differ, because Claude writes each reply fresh; the tool calls, decisions and checks should match. This is an excerpt: wherever … appears, text has been shortened, and a line with only … marks lines left out. Run the lab to see the full output.

```
Teller (role: teller) asks: "A first-time buyer has a debt-servicing ratio of 58% and a guarantor. Can the mortgage be approved, and who signs it off?"
== Phase 1 · fixed 200-character chunks, no metadata: retrieve the top 3 and answer
  retrieved chunk-006 (score 12.35): "t variable income such as bonuses and commission at 70% of the two-year average. 3 Debt-servicing ratio. The …"
  retrieved chunk-008 (score 9.5): "oints or 5.5% a year. 5 Guarantors for mortgages. A mortgage guarantor must be an immediate family member wit…"
  retrieved chunk-003 (score 6.65): " be approved by a credit officer and signs the guarantee deed at the branch. One person may guarantee at most…"
Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
  stop_reason: end_turn -> STOP: Claude has finished
Reply: **Cannot confirm approval.** The retrieved passages don't state the maximum allowed debt-servicing ratio, so I can't say whether 58% is acceptable [chunk-006]. T…

== PAUSE · Phase 1 finished: fixed 200-character chunks
   outcome: The top 3 chunks were **chunk-006, chunk-008, chunk-003**. None held the 55% limit and **none held the 60% first-home exception**: the window boundaries cut…
   proceed: Phase 2: the same library cut one section per chunk, with metadata, answered with citations

== Phase 2 · one chunk per section with heading path and metadata, role filter, citations enabled
  retrieved LEND-07§3 (score 12.9) · LEND-07 Mortgage Affordability › 3 Debt-servicing ratio · effective 2026-07-01
  retrieved LEND-07§5 (score 9.31) · LEND-07 Mortgage Affordability › 5 Guarantors for mortgages · effective 2026-07-01
  retrieved LEND-07§7 (score 7.68) · LEND-07 Mortgage Affordability › 7 Exceptions · effective 2026-07-01
Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
  stop_reason: end_turn -> STOP: Claude has finished
Reply: **Possibly, but only a credit officer can approve it.** The first-home limit rises to 60% where a guarantor approved under section 5 signs the deed; only a credi…
  cited: LEND-07§7 Exceptions (rev 2026-07, effective 2026-07-01)
  cited: LEND-07§5 Guarantors for mortgages (rev 2026-07, effective 2026-07-01)

== Turns
turn 1: stop_reason=end_turn
turn 1: stop_reason=end_turn

== Checks
PASS  Phase 1: the 3 fixed chunks retrieved held neither the 55% limit nor the 60% first-home exception
PASS  Phase 2: section retrieval returned both the rule (LEND-07 §3) and its exception (LEND-07 §7)
PASS  Phase 2: the response carried citations to LEND-07 document blocks
PASS  Phase 2: the answer gives the 60% limit with credit officer approval

== Side by side
[trap] Phase 1: fixed 200-character chunks: Retrieved chunk-006, chunk-008, chunk-003: **neither the 55% limit nor the 60% exception**. chunk-003 is from LEND-04 Person…
[fix] Phase 2: section chunks, metadata, citations: Retrieved LEND-07§3, LEND-07§5, LEND-07§7. The answer gives the **60% first-home limit with a guarantor, approved by…
  How the library is cut | 200-character windows | one chunk per section, heading path kept (good)
  Metadata on each chunk | chunk id only | doc id, section, revision, effective date, roles (good)
  Retrieved (k = 3) | chunk-006, chunk-008, chunk-003 | LEND-07§3, LEND-07§5, LEND-07§7
  Where those chunks really came from (the trap's index does not know) | chunk-006: LEND-07 Mortgage Affordability; chunk-008: LEND-07 Mortgage Affordability; chunk-003…
  55% rule in what Claude saw | no (bad) | yes (good)
  60% first-home exception in what Claude saw | no (bad) | yes (good)
  Citations returned | 0 (plain text, no citations) | 4 (LEND-07§7, LEND-07§5) (good)

2 Claude calls · 1926 in / 931 out tokens · about US$0.0007 · 5.0 s
```

## Check your answer
**Answer: B.** Both symptoms start at index time. Fixed windows cut a rule away from its number and an exception away from its condition, and a chunk with no metadata cannot be traced to a policy. Cutting along the policy's own sections keeps each clause whole, the heading path makes short clauses findable, and metadata (document id, section, effective date, roles) lets the pipeline filter and lets Claude cite the exact span with citations enabled.

Why the other answers fall short:

- **A.** More chunks add noise and cost, still carry no document id to cite, and an exception split from its condition is still split.
- **C.** A better embedding cannot rejoin text that the chunker cut apart, and it adds no metadata for citations.
- **D.** Claude cannot find an exception or cite a section that retrieval never gave it; a prompt cannot repair the index.

## Why it happens
Chunking decides what the retriever can ever find. Fixed windows cut wherever the character count lands, so a rule is separated from its number and an exception from its condition, and a chunk knows nothing about the document it came from. Cutting along the policy's own headings keeps each clause whole; prefixing the heading path (LEND-07 › 7 Exceptions) makes a short clause findable; and metadata (document id, section, revision, effective date, roles) lets the pipeline filter by role and date and lets Claude cite the exact section. With citations enabled on document blocks, the API returns the cited span with each claim, so a reviewer can check every answer against its source.

## Exam tip
When answers miss an exception or cannot cite their source, look at chunking and indexing first. Structure-aware chunks with metadata and citations beat a bigger k, a bigger embedding model or a stronger prompt, because none of those can recover what the index split or never stored.

## Try this next
Change K to 4 in this lab's code and run it: Phase 1 now also retrieves the chunk holding "rises to 60%", but without the words "For a first home" that sit in the chunk before it. Then change fixedChunks' size to 400: the cuts move, and a different rule loses its condition. A bigger window moves the problem; it does not remove it.

---
Source: Original question written for C740. Course: Claude Certified Architect - Professional (CCAR-P) Exam Prep (C740). © Tertiary Infotech Academy Pte Ltd · UEN 201200696W
