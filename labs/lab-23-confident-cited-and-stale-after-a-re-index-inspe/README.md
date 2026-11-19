# Lab 23: Confident, cited and stale after a re-index: inspect retrieval first
> Day 1 · Topic 4: Evaluation, Testing & Optimization · Task statement 4.4 · Simulator 2: Northwind Policy Assistant · About 12 minutes · Claude Haiku 5.5

## Goal
Task statement 4.4: **Diagnose system issues (prompt failure, hallucinations, model mismatch).** You answer one exam-style question, then run the Northwind Policy Assistant simulator and watch the tempting design fail and the right one work, with real Claude calls.

## Open this lab

- **The main lab page:** [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/). It lists all 38 simulator labs, the Day 2 builds (Labs 39 to 41) and the practice exam, and holds the API key box.
- **Run it live in your browser (nothing to install):** open [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=23](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=23), paste your Anthropic API key into the sidebar once, then press **Simulate it live**. Every call uses `claude-haiku-5-5`. The run **stops after the first method** and shows its outcome; press **Proceed** to run the fix, then read the two **side by side** under The observation explained.
- **In a terminal, one click:** double-click `run-lab.command` (Mac) or `run-lab.cmd` (Windows) in this folder. It runs `node docs/tools/test_lab.mjs 23` from the repository root, with the same engine the site uses. It needs Node.js and your key in a `.env` file at the repository root (one line: `ANTHROPIC_API_KEY=sk-ant-...`).
- **The code it runs:** [docs/sims/lab-23.js](https://github.com/tertiarycourses/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/blob/main/docs/sims/lab-23.js), on the shared engine [docs/assets/engine.js](https://github.com/tertiarycourses/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/blob/main/docs/assets/engine.js).

## The scenario
Northwind Bank's 4,000 staff ask an internal assistant about lending, compliance and HR policy. The answers come from a retrieval-augmented generation (RAG) pipeline over the bank's policy library, which is re-indexed every week as policies change. Wrong answers carry regulatory risk, so every answer must cite its source, and questions the library does not cover must be declined.

## Key concepts
- **Where RAG answers come from.** The model answers from the chunks retrieval puts in its context. If those chunks are stale or irrelevant, a fluent, cited and wrong answer is the expected result.
- **Correlate the symptom with the change.** Ask what changed when the failures started. A document refresh points at indexing; a model upgrade points at the model; a prompt edit points at the prompt.
- **Retrieval observability.** Log every answer's retrieved chunk ids, scores, source versions and index dates. Without them a retrieval fault looks exactly like a hallucination.
- **Silent re-index failures.** An embedding job that times out and keeps old vectors, or a new embedding model with an old query encoder, still returns results. Only a version check against the source catches it.
- **A prompt cannot add missing facts.** Stricter instructions change how the model uses its context, not what is in it. When the right text never reaches the model, fix the pipeline, not the wording.

## The question
A RAG system suddenly returns confident but incorrect answers after a document refresh, while latency and model version are unchanged. What is the most likely first place to investigate?

- **A.** The model weights have silently changed.
- **B.** The retrieval/indexing step is returning irrelevant or stale chunks.
- **C.** The temperature setting is too low.
- **D.** The context window has shrunk.

Pick your answer before you run anything. The answer and the reasoning are at the end, under **Check your answer**.

## Steps on the simulator site
1. Open [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=23](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=23). The left sidebar should say the API key is **saved**. If it says **not set**, paste your key into the **Anthropic API key** box, press **Save**, then **Test**.
2. Read the task statement card and the question. Click the answer you chose. The page tells you at once whether it is right, and why. Open **Why the other answers fall short**.
3. Press **▶ Simulate it live**. The scenario board shows the story, the code runs on the left and Claude's live output appears on the right.
4. When the run pauses, read the outcome of the first method (the trap). Then press **▶ Proceed** to run the fix.
5. Read **Claude's final output**, then **The observation explained**: the two methods side by side, turn by turn, and the checks on what Claude actually did.
6. Open **See the full code this lab runs** and find the lines that make the difference.

## Or run it from a terminal
From the repository root:

```
node docs/tools/test_lab.mjs 23
```

## What you will see
What to look for: Both prompts quote 60% and 2 days from stale LEND-07 v3 and HR-09 v5 chunks; after re-indexing, the original prompt answers 55% and 3 days.

These lines are from our own run of this lab on Claude Haiku 5.5. Your wording will differ, because Claude writes each reply fresh; the tool calls, decisions and checks should match. This is an excerpt: wherever … appears, text has been shortened, and a line with only … marks lines left out. Run the lab to see the full output.

```
Northwind Policy Assistant · Monday 17 Nov 2026 re-index · since then staff report confident, cited, wrong answers
Unchanged since last week: model claude-haiku-5-5, p50 latency 1.9 s, the production prompt.
== Phase 1 · fix the prompt: the production prompt, then a stricter one ("use the latest version, double-check numbers")
QA · retrieved LEND-07#1 (v3, indexed 2026-11-10), LEND-04#1 (v7, indexed 2026-11-17)
    Production prompt QA · POST /v1/messages · model claude-haiku-5-5
      stop_reason: end_turn · 327 in / 103 out · 1175 ms
      Production prompt QA: The maximum total monthly debt repayments, including the new mortgage, is **S$5,400** (60% of S$9,000 gross monthly income). This limit appl…
QB · retrieved HR-09#1 (v5, indexed 2026-11-10), HR-09#2 (v6, indexed 2026-11-17)
    Production prompt QB · POST /v1/messages · model claude-haiku-5-5
      stop_reason: end_turn · 226 in / 234 out · 1517 ms
      Production prompt QB: Eligible staff may work from home up to 2 days a week with their manager's approval [HR-09]. Branch-based roles, such as tellers, are not el…
QA · retrieved LEND-07#1 (v3, indexed 2026-11-10), LEND-04#1 (v7, indexed 2026-11-17)
    Patched prompt QA · POST /v1/messages · model claude-haiku-5-5
      stop_reason: end_turn · 365 in / 196 out · 1521 ms
      Patched prompt QA: The maximum total monthly debt repayments, including the new mortgage, are **S$5,400** (60% of S$9,000 gross monthly income) [LEND-07]. This li…
QB · retrieved HR-09#1 (v5, indexed 2026-11-10), HR-09#2 (v6, indexed 2026-11-17)
    Patched prompt QB · POST /v1/messages · model claude-haiku-5-5
      stop_reason: end_turn · 264 in / 309 out · 1933 ms
      Patched prompt QB: Eligible staff may work from home up to 2 days a week with their manager's approval [HR-09]. The extracts exclude only branch-based roles, incl…
  QA: STALE (60% → S$5,400)
  QB: STALE (2 days)
  QA: STALE (60% → S$5,400)
  QB: STALE (2 days)

== PAUSE · Phase 1 finished: the prompt was fixed, the answers were not
   outcome: With the stricter prompt: **QA: 60% → S$5,400 (last week's policy)**, **QB: 2 days (last week's policy)**. Each answer cites the right document id. Look at …
   proceed: Phase 2: inspect what retrieval served, diagnose, fix the index

== Phase 2 · inspect retrieval: chunk ids, versions and index dates against the library manifest, then fix the index
  LEND-07#1: indexed v3 on 2026-11-10 · manifest v4 (updated 2026-11-14)  ← BEHIND
  LEND-04#1: indexed v7 on 2026-11-17 · manifest v7 (updated 2026-03-01)
  HR-09#1: indexed v5 on 2026-11-10 · manifest v6 (updated 2026-11-14)  ← BEHIND
  HR-09#2: indexed v6 on 2026-11-17 · manifest v6 (updated 2026-11-14)
    Diagnosis · POST /v1/messages · model claude-haiku-5-5
      stop_reason: end_turn · 820 in / 774 out · 4305 ms
      Diagnosis: {"first_place":"retrieval_index","evidence":["Symptom began exactly at the 2026-11-17 weekly refresh and re-index, while model, prompt, and latency are…
Re-indexed LEND-07, HR-09 from the current library text (indexed 2026-11-19). Asking again with the ORIGINAL production prompt.
QA · retrieved LEND-07#1 (v4, indexed 2026-11-19), LEND-04#1 (v7, indexed 2026-11-17)
    After re-index QA · POST /v1/messages · model claude-haiku-5-5
      stop_reason: end_turn · 327 in / 149 out · 1186 ms
      After re-index QA: The maximum total monthly debt repayments, including the new mortgage, are **S$4,950** (55% of S$9,000 gross monthly income) [LEND-07]. This li…
QB · retrieved HR-09#1 (v6, indexed 2026-11-19), HR-09#2 (v6, indexed 2026-11-19)
    After re-index QB · POST /v1/messages · model claude-haiku-5-5
      stop_reason: end_turn · 226 in / 238 out · 1625 ms
…
PASS  Phase 2: after re-indexing, every retrieved chunk matched the manifest version
PASS  Phase 2: the original prompt now answers 55% (S$4,950) and 3 days

== Side by side
[trap] Phase 1: fix the prompt: Still wrong: **QA 60% → S$5,400; QB 2 days**. The prompt changed, the context did not.
[fix] Phase 2: inspect retrieval, fix the index: Chunks were **LEND-07, HR-09 behind the manifest**. Re-indexed: **QA 55% → S$4,950; QB 3 days** with the original prompt.
  What changed | the prompt (stricter wording) | the index (re-embedded stale docs)
  Model / latency | claude-haiku-5-5 · 1.7 s avg | claude-haiku-5-5 · 1.4 s avg
  Chunks served | LEND-07#1 v3, LEND-04#1 v7, HR-09#1 v5, HR-09#2 v6 | LEND-07#1 v4, LEND-04#1 v7, HR-09#1 v6, HR-09#2 v6
  Claude's diagnosis (first place) | - | retrieval_index (good)
  QA (want 55% → S$4,950) | 60% → S$5,400 (bad) | 55% → S$4,950 (good)
  QB (want 3 days) | 2 days (bad) | 3 days (good)

7 Claude calls · 2555 in / 2003 out tokens · about US$0.0013 · 13.3 s
```

## Check your answer
**Answer: B.** Confident-but-wrong answers following a document refresh, with model and latency unchanged, point to retrieval feeding the model poor context, for example a broken re-index or mismatched embeddings. The other options would not be triggered specifically by a document refresh. In the lab, the assistant cites LEND-07 and HR-09 correctly but quotes last week's figures, because the re-index kept the old chunks; a stricter prompt changes nothing, and re-indexing fixes both answers.

Why the other answers fall short:

- **A.** The model version is unchanged, and a pinned model does not change underneath you; nothing ties it to the document refresh.
- **C.** A low temperature makes answers more consistent, not wrong, and the setting did not change with the document refresh.
- **D.** The context window is a property of the model, which is unchanged; a document refresh does not shrink it.

## Why it happens
Confident answers with citations that turn wrong right after a document refresh, while the model version and latency stay the same, point at retrieval. The model can only be as current as the chunks it is given: Phase 1's stricter prompt cannot produce a number that is not in its context, and it even cites the stale document correctly. The first place to look is what the retriever returned: chunk ids, the version each chunk was embedded from and the index date, compared with the library's manifest. Here the 17 Nov re-index timed out on LEND-07 and HR-09 and silently kept last week's vectors. Re-indexing those two documents fixes both answers with the original prompt. The lasting fix is a check in the indexing pipeline that fails the job when an indexed version is behind the manifest.

## Exam tip
Tie the symptom to what changed. A document refresh changes the index, not the model, the temperature or the context window, so look at what retrieval returns first: chunk ids, versions and dates.

## Try this next
In docs/sims/shared/d4-northwind.js, make brokenIndex() return healthyIndex() and run again: phase 1 is now right with either prompt, which is how you know the prompt was never the problem. Then add a third question about the MSR stress-test rate (also changed in LEND-07 v4).

---
Source: Official exam guide, sample question 3. Course: Claude Certified Architect - Professional (CCAR-P) Exam Prep (C740). © Tertiary Infotech Academy Pte Ltd · UEN 201200696W
