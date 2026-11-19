# Lab 17: One similarity search quotes a dead rate: route tables to a lookup
> Day 1 · Topic 3: Integration · Task statement 3.6 · Simulator 2: Northwind Policy Assistant · About 12 minutes · Claude Haiku 5.5

## Goal
Task statement 3.6: **Apply retrieval strategies matched to data shape and query pattern.** You answer one exam-style question, then run the Northwind Policy Assistant simulator and watch the tempting design fail and the right one work, with real Claude calls.

## Open this lab

- **The main lab page:** [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/). It lists all 38 simulator labs, the Day 2 builds (Labs 39 to 41) and the practice exam, and holds the API key box.
- **Run it live in your browser (nothing to install):** open [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=17](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=17), paste your Anthropic API key into the sidebar once, then press **Simulate it live**. Every call uses `claude-haiku-5-5`. The run **stops after the first method** and shows its outcome; press **Proceed** to run the fix, then read the two **side by side** under The observation explained.
- **In a terminal, one click:** double-click `run-lab.command` (Mac) or `run-lab.cmd` (Windows) in this folder. It runs `node docs/tools/test_lab.mjs 17` from the repository root, with the same engine the site uses. It needs Node.js and your key in a `.env` file at the repository root (one line: `ANTHROPIC_API_KEY=sk-ant-...`).
- **The code it runs:** [docs/sims/lab-17.js](https://github.com/tertiarycourses/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/blob/main/docs/sims/lab-17.js), on the shared engine [docs/assets/engine.js](https://github.com/tertiarycourses/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/blob/main/docs/assets/engine.js).

## The scenario
Northwind Bank's 4,000 staff ask an internal assistant about lending, compliance and HR policy. The answers come from a retrieval-augmented generation (RAG) pipeline over the bank's policy library, which is re-indexed every week as policies change. Wrong answers carry regulatory risk, so every answer must cite its source, and questions the library does not cover must be declined.

## Key concepts
- **Ask what shape the answer lives in.** Passages, table rows, aggregates, relationships or files. Each shape has a mechanism that can produce it; similarity search over chunks suits only passages.
- **Similarity cannot find a row by its keys.** A table row like '5YF,60.01-80.00,3.95' shares no words with 'five-year fixed at 75%'. A lookup keyed on product and band finds it every time.
- **Hybrid search for prose.** Keyword (BM25) matches exact terms, semantic search matches meaning; fusing their rankings (reciprocal rank fusion) is a strong default for policy text.
- **Metadata filters run before ranking.** Effective date, role and document type are filters in code. They pick the revision in force on the date asked, so history can stay in the library.
- **Expose each mechanism as a tool.** Clear tool descriptions ('use for any rate figure', 'rules, not rates') let Claude route each part of a question to the right mechanism.

## The question
Northwind's assistant answers every question with one similarity search over a single index, into which the weekly re-index flattens the mortgage rate tables as text. Superseded rate sheets stay in the library because complaints about old quotes need them. Credit officers asking for today's 5-year fixed rate at 75% loan-to-value sometimes get a rate that has expired. What is the best redesign of retrieval?

- **A.** Index each rate table row as its own small chunk and raise top-k, so that the row for the product is more likely to be among the hits.
- **B.** Add a reranker after the similarity search so that the chunk most relevant to the question is always placed first in the context.
- **C.** Delete superseded rate sheets at each re-index so that only the current rows remain for the similarity search to find.
- **D.** Serve rate tables through a lookup keyed on product and loan-to-value, filtered by effective date, and keep hybrid search for prose.

Pick your answer before you run anything. The answer and the reasoning are at the end, under **Check your answer**.

## Steps on the simulator site
1. Open [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=17](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=17). The left sidebar should say the API key is **saved**. If it says **not set**, paste your key into the **Anthropic API key** box, press **Save**, then **Test**.
2. Read the task statement card and the question. Click the answer you chose. The page tells you at once whether it is right, and why. Open **Why the other answers fall short**.
3. Press **▶ Simulate it live**. The scenario board shows the story, the code runs on the left and Claude's live output appears on the right.
4. When the run pauses, read the outcome of the first method (the trap). Then press **▶ Proceed** to run the fix.
5. Read **Claude's final output**, then **The observation explained**: the two methods side by side, turn by turn, and the checks on what Claude actually did.
6. Open **See the full code this lab runs** and find the lines that make the difference.

## Or run it from a terminal
From the repository root:

```
node docs/tools/test_lab.mjs 17
```

## What you will see
What to look for: One search returns the superseded rate sheet and the answer quotes 4.35%; lookup_rate returns 3.95% from the current sheet and search_policy finds the fee rule.

These lines are from our own run of this lab on Claude Haiku 5.5. Your wording will differ, because Claude writes each reply fresh; the tool calls, decisions and checks should match. This is an excerpt: wherever … appears, text has been shortened, and a line with only … marks lines left out. Run the lab to see the full output.

```
Credit officer asks (today 2026-11-19): "A customer wants a 5-year fixed mortgage at 75% loan-to-value. What rate applies today, and is there an early repayment fee if …
== Phase 1 · one text-similarity search over everything (tables flattened, no date filter), top 3
  retrieved LEND-07§8 · rev 2026-07 (score 23.14): "LEND-07 Mortgage Affordability › 8 Early repayment On a fixed-rate mortgage an early repayment fee …"
  retrieved LEND-11§1 · rev 2026-08 (score 18.84): "LEND-11 Mortgage Rate Sheet › 1 Fixed rates The 2-year fixed rate is 4.05% a year for a loan-to-val…"
  retrieved LEND-07§6 · rev 2026-07 (score 11.72): "LEND-07 Mortgage Affordability › 6 Loan-to-value The loan-to-value limit is 80% for a first propert…"
Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
  stop_reason: end_turn -> STOP: Claude has finished
Reply: **Rate:** 4.35% a year. LEND-11 Mortgage Rate Sheet, §1 (rev 2026-08), applies the 5-year fixed rate of 4.35% to loan-to-value up to 80%. The 4.20% rate applies …

== PAUSE · Phase 1 finished: one similarity search for everything
   outcome: The top 3 hits were **LEND-07§8 (rev 2026-07), LEND-11§1 (rev 2026-08), LEND-07§6 (rev 2026-07)**. The superseded rate sheet (rev 2026-08, ended 31 Oct) mat…
   proceed: Phase 2: a lookup tool for the rate table and hybrid search for the prose

== Phase 2 · retrieval matched to data shape: lookup_rate for the table, search_policy (hybrid, in force today) for prose
Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
  stop_reason: tool_use -> CONTINUE: run the tools, append the results, call Claude again
  -> lookup_rate({"product_code":"5YF","ltv_pct":75,"as_of":"2026-11-19"})
  <- result: {"source":"LEND-11 rev 2026-11","product_code":"5YF","product":"5-year fixed","ltv_band":"60.01-80.00","rate_pct":"3.95","effective_from":"2026-11-01…
  -> search_policy({"query":"early repayment fee fixed rate mortgage year 2","effective_on":"2026-11-19"})
  <- result: [{"id":"LEND-07§8","title":"LEND-07 Mortgage Affordability › 8 Early repayment","rev":"2026-07","effective":"2026-07-01","text":"On a fixed-rate mort…
Turn 2: POST /v1/messages · model claude-haiku-5-5 · 3 messages (tool results appended)
  stop_reason: end_turn -> STOP: Claude has finished
Reply: The 5-year fixed rate at 75% LTV is **3.95%**, per LEND-11 rev 2026-11 (60.01–80.00% band, effective 2026-11-01). Yes, an early repayment fee applies in year 2. …

== Turns
turn 1: stop_reason=end_turn
turn 1: stop_reason=tool_use tools=lookup_rate,search_policy
turn 2: stop_reason=end_turn

== Checks
PASS  Phase 1: the similarity search returned the superseded LEND-11 rev 2026-08 and not the current 5YF row
PASS  Phase 1: the answer quoted the superseded 4.35% rate, not 3.95%
PASS  Phase 2: lookup_rate ran for product 5YF and returned 3.95% from LEND-11 rev 2026-11
PASS  Phase 2: search_policy (not the rate lookup) returned the early repayment rule, LEND-07 §8
PASS  Phase 2: the answer gives 3.95% and the 1.5% year-2 fee

== Side by side
[trap] Phase 1: one similarity search for everything: The superseded rate sheet (rev 2026-08) was a top hit and **the current 5YF row was not**. The answer quotes **4.3…
[fix] Phase 2: lookup for the table, hybrid search for prose: lookup_rate(5YF, 75%, 2026-11-19) returned **3.95% from LEND-11 rev 2026-11**; search_policy returned LEND…
  Rate table reached through | text chunks (rows without their header) | lookup_rate: product code + LTV + as_of (good)
  Prose reached through | the same similarity search | search_policy: hybrid, in force on today's date (good)
  What came back | LEND-07§8 (rev 2026-07), LEND-11§1 (rev 2026-08), LEND-07§6 (rev 2026-07) | lookup_rate → 3.95% (LEND-11 rev 2026-11); search_policy → LEND-07§8, LEN…
  Rate quoted | 4.35% (superseded) (bad) | 3.95% (current) (good)
  Early repayment fee in year 2 | 1.5% (good) | 1.5% (good)

3 Claude calls · 3101 in / 839 out tokens · about US$0.0007 · 5.0 s
```

## Check your answer
**Answer: D.** A rate is a row in a table, found by its keys and its effective date, not a passage that resembles the question. A structured lookup tool returns the row in force on the date asked, and hybrid search with metadata filters stays the right mechanism for prose rules. Routing each part of the question to the mechanism its data needs is the fix; tuning the similarity search is not.

Why the other answers fall short:

- **A.** Smaller chunks and a bigger k still rank rows by word overlap, and a row like '5YF,60.01-80.00,3.95' shares no words with the question.
- **B.** A reranker reorders what similarity search returned; it cannot surface a row that was never retrieved or tell current rates from superseded ones.
- **C.** Complaint handling needs the superseded sheets, and deleting them still leaves a numeric row to be found by text similarity.

## Why it happens
Similarity search ranks passages by how much their words (or meaning) resemble the question. A rate table row is not a passage: its product code, band and number share no words with "5-year fixed at 75%", while the superseded prose sheet shares many. Bigger k, smaller chunks or a reranker still choose among text that resembles the question. Tables and identifiers want a structured lookup keyed on their columns, with the effective date as a filter; prose wants hybrid search (keyword plus semantic, fused by rank) with metadata filters. Exposing each as a clearly described tool lets Claude route each part of the question to the mechanism that can actually produce the answer.

## Exam tip
When the answer is a row, an identifier or a number in a table, the exam wants a structured lookup or query exposed as a tool, with metadata filters such as effective date. Hybrid search is for prose. Bigger k, smaller chunks, rerankers and deleting history are distractors.

## Try this next
Ask Phase 2 about a complaint instead: change QUESTION to "A customer was quoted a 5-year fixed rate at 75% LTV on 10 September 2026. Which rate must we honour?" The same lookup_rate tool with as_of 2026-09-10 returns 4.35% from the superseded sheet. That is why deleting old rate sheets is the wrong fix: the date filter, not deletion, picks the right revision.

---
Source: Original question written for C740. Course: Claude Certified Architect - Professional (CCAR-P) Exam Prep (C740). © Tertiary Infotech Academy Pte Ltd · UEN 201200696W
