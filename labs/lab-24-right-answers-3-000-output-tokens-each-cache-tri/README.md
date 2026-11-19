# Lab 24: Right answers, 3,000 output tokens each: cache, trim, cap, re-test
> Day 1 · Topic 4: Evaluation, Testing & Optimization · Task statement 4.5 · Simulator 1: Harbour Mutual Claims Desk · About 12 minutes · Claude Haiku 5.5

## Goal
Task statement 4.5: **Optimize token usage, latency, and cost-performance trade-offs.** You answer one exam-style question, then run the Harbour Mutual Claims Desk simulator and watch the tempting design fail and the right one work, with real Claude calls.

## Open this lab

- **The main lab page:** [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/). It lists all 38 simulator labs, the Day 2 builds (Labs 39 to 41) and the practice exam, and holds the API key box.
- **Run it live in your browser (nothing to install):** open [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=24](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=24), paste your Anthropic API key into the sidebar once, then press **Simulate it live**. Every call uses `claude-haiku-5-5`. The run **stops after the first method** and shows its outcome; press **Proceed** to run the fix, then read the two **side by side** under The observation explained.
- **In a terminal, one click:** double-click `run-lab.command` (Mac) or `run-lab.cmd` (Windows) in this folder. It runs `node docs/tools/test_lab.mjs 24` from the repository root, with the same engine the site uses. It needs Node.js and your key in a `.env` file at the repository root (one line: `ANTHROPIC_API_KEY=sk-ant-...`).
- **The code it runs:** [docs/sims/lab-24.js](https://github.com/tertiarycourses/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/blob/main/docs/sims/lab-24.js), on the shared engine [docs/assets/engine.js](https://github.com/tertiarycourses/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/blob/main/docs/assets/engine.js).

## The scenario
Harbour Mutual Insurance is replacing its first-line motor-claims triage with a Claude-based claims agent. The agent reads policies and claims, requests damage assessments, drafts customer letters, and can approve payouts or escalate to a human adjuster. Adjusters, the finance controller and the regulator all have a stake in how it is built. Claims arrive as free-text forms, photos and repair quotes.

## Key concepts
- **Where the money and time go.** Cost is input tokens × input price plus output tokens × output price, and output is five times dearer on every tier. Latency grows mostly with output tokens generated.
- **Prompt caching.** Mark a static prefix (tools, system, long documents) with cache_control. Later calls with the identical prefix read it at 0.1× the input price; the first call writes it at 1.25×.
- **Static first, dynamic last.** The cache matches from the start of the request. Anything that changes per call, such as a claim or a timestamp, must come after the cached block or the prefix never matches.
- **Ask for less output.** A short structured output (JSON with a schema) replaces an essay. max_tokens caps the worst case, and stop_reason max_tokens tells you when the cap cut an answer.
- **Hold quality while you optimise.** Run the same eval set before and after. A cheaper design that changes decisions is a regression, not an optimisation.

## The question
Harbour Mutual's claims triage runs on Claude Sonnet 5.5. Each request sends the claim's full email history, then the claim, then 2,000 tokens of policy wording that is identical on every call, and asks for a detailed analysis and a letter. Adjusters agree the decisions are right, but cost per claim and latency are both over budget. Which change best reduces both while holding decision quality?

- **A.** Switch every claim to Claude Haiku 5.5 at once, since its input and output prices are a twentieth of Sonnet 5.5's.
- **B.** Truncate the policy wording to its first 800 tokens, so that every request carries far less input text to process.
- **C.** Send every claim through the Message Batches API, which halves the price of each request for exactly the same output tokens.
- **D.** Put the cached static policy first, send only the claim fields, ask for a short JSON decision, and re-run the eval set.

Pick your answer before you run anything. The answer and the reasoning are at the end, under **Check your answer**.

## Steps on the simulator site
1. Open [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=24](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=24). The left sidebar should say the API key is **saved**. If it says **not set**, paste your key into the **Anthropic API key** box, press **Save**, then **Test**.
2. Read the task statement card and the question. Click the answer you chose. The page tells you at once whether it is right, and why. Open **Why the other answers fall short**.
3. Press **▶ Simulate it live**. The scenario board shows the story, the code runs on the left and Claude's live output appears on the right.
4. When the run pauses, read the outcome of the first method (the trap). Then press **▶ Proceed** to run the fix.
5. Read **Claude's final output**, then **The observation explained**: the two methods side by side, turn by turn, and the checks on what Claude actually did.
6. Open **See the full code this lab runs** and find the lines that make the difference.

## Or run it from a terminal
From the repository root:

```
node docs/tools/test_lab.mjs 24
```

## What you will see
What to look for: Phase 1 decides all three claims right at about 3,000 output tokens each; phase 2 gives the same decisions in about 300, with cache reads on claims 2 and 3.

These lines are from our own run of this lab on Claude Haiku 5.5. Your wording will differ, because Claude writes each reply fresh; the tool calls, decisions and checks should match. This is an excerpt: wherever … appears, text has been shortened, and a line with only … marks lines left out. Run the lab to see the full output.

```
Harbour Mutual Claims Desk · triage CLM-7781, CLM-7790, CLM-7802 · gold: approve US$3,700 · decline · approve US$650
== Phase 1 · today's request: full email history re-sent, policy wording after the claim, long free-text analysis and letter
    Verbose CLM-7781 · POST /v1/messages · model claude-haiku-5-5
      stop_reason: end_turn · 2619 in / 3697 out · 17518 ms
      → CLM-7781: approve · US$3700 (1151 words written)
    Verbose CLM-7790 · POST /v1/messages · model claude-haiku-5-5
      stop_reason: end_turn · 2628 in / 2910 out · 13926 ms
      → CLM-7790: decline · US$0 (1027 words written)
    Verbose CLM-7802 · POST /v1/messages · model claude-haiku-5-5
      stop_reason: end_turn · 2590 in / 3725 out · 17444 ms
      → CLM-7802: approve · US$650 (1159 words written)
Phase 1 per claim: 2612 input / 3444 output tokens · 16296 ms · US$0.00198 on Haiku 5.5 (US$0.0397 at Sonnet 5.5 prices) · quality 3/3

== PAUSE · Phase 1 finished: right decisions, expensive requests
   outcome: All **3 of 3** decisions are right, at **2,612 input and 3,444 output tokens per claim**, 16.3 s each. Nothing was cached: each request starts with a differ…
   proceed: Phase 2: cached static prefix, claim fields only, capped JSON

== Phase 2 · optimised request: rules + policy as a cached system prefix, claim fields only, capped JSON decision
    Optimised CLM-7781 · POST /v1/messages · model claude-haiku-5-5
      stop_reason: end_turn · 176 in / 419 out · cache write 0 / read 1992 · 2969 ms
      Optimised CLM-7781: {"claim_id":"CLM-7781","decision":"approve","payout_usd":3700,"clause":"2.1, 3.1, 4.1, 4.2, 4.4, 5.1","reason":"Comprehensive accidental damag…
    Optimised CLM-7790 · POST /v1/messages · model claude-haiku-5-5
      stop_reason: end_turn · 175 in / 94 out · cache write 0 / read 1992 · 1073 ms
      Optimised CLM-7790: {"claim_id":"CLM-7790","decision":"decline","payout_usd":0,"clause":"2.3","reason":"Third-party only cover does not pay for loss of or damage …
    Optimised CLM-7802 · POST /v1/messages · model claude-haiku-5-5
      stop_reason: end_turn · 161 in / 132 out · cache write 0 / read 1992 · 1240 ms
      Optimised CLM-7802: {"claim_id":"CLM-7802","decision":"approve","payout_usd":650,"clause":"Section 2.1, Section 3.2, Section 4.4, Section 4.5","reason":"Comprehen…
Phase 2 per claim: 2163 input (cache reads 5976 in total) / 215 output tokens · 1761 ms · US$0.00014 on Haiku 5.5 (US$0.0029 at Sonnet 5.5 prices) · quality 3/3
Three claims give exact token counts but only a rough latency figure: measure p95 on a few hundred claims before committing to an SLA.

== Turns
Verbose CLM-7781 turn 1: stop_reason=end_turn
Verbose CLM-7790 turn 1: stop_reason=end_turn
Verbose CLM-7802 turn 1: stop_reason=end_turn
Optimised CLM-7781 turn 1: stop_reason=end_turn
Optimised CLM-7790 turn 1: stop_reason=end_turn
Optimised CLM-7802 turn 1: stop_reason=end_turn

== Checks
PASS  Phase 1: the verbose design decided all 3 claims correctly (quality was not the problem)
PASS  Phase 2: the same 3 decisions and payouts, each as schema-valid JSON
PASS  Phase 2: claims 2 and 3 read the static prefix from the cache (cache_read_input_tokens > 0)
PASS  Phase 2: output tokens per claim fell by at least half
PASS  Phase 2: cost and mean latency per claim are both lower than phase 1

== Side by side
[trap] Phase 1: history re-sent, policy last, essay: Right decisions (**3/3**) at **3,444 output tokens per claim** and no cache hits.
[fix] Phase 2: cached prefix, fields only, JSON: Same quality (**3/3**), output down **94%**, cost per claim down **93%**, latency down **89%**.
  Decisions and payouts right (checked in code) | 3 of 3 (good) | 3 of 3 (good)
  Input tokens per claim (incl. cached) | 2,612 | 2,163
  cache_read_input_tokens (claims 2-3) | 0 (bad) | 3984 (good)
  Output tokens per claim | 3,444 (bad) | 215 (good)
  Calls cut off at max_tokens | 0 | 0
  Latency per claim (mean of 3) | 16.3 s | 1.8 s (good)
  Cost per claim, Haiku 5.5 | US$0.00198 | US$0.00014 (good)
  Same tokens at Sonnet 5.5 list prices | US$0.0397 | US$0.0029

6 Claude calls · 8349 in / 10977 out tokens · about US$0.0063 · 54.2 s
```

## Check your answer
**Answer: D.** Static content first lets the identical policy wording become a cached prefix that later calls read at a tenth of the input price. Sending only the fields the decision needs drops the email history, and asking for a short JSON decision removes most of the output tokens, which drive both cost and latency. Re-running the eval set proves the decisions stayed right. In the lab the same three decisions come back as schema-valid JSON with cache reads on calls 2 and 3, and output, cost and latency per claim all fall sharply.

Why the other answers fall short:

- **A.** A blind switch to a cheaper tier changes quality with no evidence, and still pays for the history and long output.
- **B.** Cutting the policy wording removes clauses the decision depends on, such as excess and authority rules, so quality is no longer held.
- **C.** Batches halve the price but return results within 24 hours, which breaks latency for a live claims desk.

## Why it happens
Quality was never the problem: both designs decide all three claims correctly, so the change is judged on cost and latency with quality held, checked in code. Four things cut the bill. Static content first: the rules and policy wording are identical on every call, so they sit at the start as a system block marked cache_control, and later calls read them at a tenth of the input price. Only the fields that matter: the six-email history is mostly chatter and is dropped. Structured output: a JSON decision replaces an essay and a letter the desk did not need at triage time. A sensible cap: max_tokens bounds the worst case. Output tokens dominate both cost and latency, so the biggest saving is in what you ask Claude to write. The three claims are too few for a stable latency figure; the token counts are exact.

## Exam tip
Look for the option that cuts tokens without cutting information the task needs, and that re-checks quality. Blind model swaps, truncating required context and the Batch API for live traffic are the classic distractors.

## Try this next
In this lab's code, move POLICY from the system block into the user message after the claim fields and run again: cache_read_input_tokens drops to 0 and input cost rises, because the shared prefix is gone. Then raise max_tokens in phase 2 to 4096: the JSON stays short, because the schema, not the cap, sets its size.

---
Source: Original question written for C740. Course: Claude Certified Architect - Professional (CCAR-P) Exam Prep (C740). © Tertiary Infotech Academy Pte Ltd · UEN 201200696W
