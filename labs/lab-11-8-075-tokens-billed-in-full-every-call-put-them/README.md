# Lab 11: 8,075 tokens billed in full every call: put them first and cache them
> Day 1 · Topic 2: Claude Models, Prompting & Context Engineering · Task statement 2.5 · Simulator 2: Northwind Policy Assistant · About 12 minutes · Claude Haiku 5.5

## Goal
Task statement 2.5: **Implement prompt reuse strategies (caching, modular prompts, Skills).** You answer one exam-style question, then run the Northwind Policy Assistant simulator and watch the tempting design fail and the right one work, with real Claude calls.

## Open this lab

- **The main lab page:** [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/). It lists all 38 simulator labs, the Day 2 builds (Labs 39 to 41) and the practice exam, and holds the API key box.
- **Run it live in your browser (nothing to install):** open [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=11](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=11), paste your Anthropic API key into the sidebar once, then press **Simulate it live**. Every call uses `claude-haiku-5-5`. The run **stops after the first method** and shows its outcome; press **Proceed** to run the fix, then read the two **side by side** under The observation explained.
- **In a terminal, one click:** double-click `run-lab.command` (Mac) or `run-lab.cmd` (Windows) in this folder. It runs `node docs/tools/test_lab.mjs 11` from the repository root, with the same engine the site uses. It needs Node.js and your key in a `.env` file at the repository root (one line: `ANTHROPIC_API_KEY=sk-ant-...`).
- **The code it runs:** [docs/sims/lab-11.js](https://github.com/tertiarycourses/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/blob/main/docs/sims/lab-11.js), on the shared engine [docs/assets/engine.js](https://github.com/tertiarycourses/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/blob/main/docs/assets/engine.js).

## The scenario
Northwind Bank's 4,000 staff ask an internal assistant about lending, compliance and HR policy. The answers come from a retrieval-augmented generation (RAG) pipeline over the bank's policy library, which is re-indexed every week as policies change. Wrong answers carry regulatory risk, so every answer must cite its source, and questions the library does not cover must be declined.

## Key concepts
- **How prompt caching works.** The request is read in the order tools, system, messages. A cache_control breakpoint caches everything up to it; a later request with a byte-identical prefix reads it instead.
- **Cache pricing.** On the 5-minute cache a write costs 1.25 times the base input price and a read 0.1 times. One read pays back the write; a prefix that never matches only adds cost.
- **Order is the design.** Put the most stable content first and anything that changes per request (timestamps, names, ids, the question) after the breakpoint. One changed byte early misses the cache.
- **Minimum cacheable length.** Each model has a minimum prefix length for caching (512 tokens on Haiku 5.5). Below it nothing is cached and no error is raised: check cache_creation_input_tokens.
- **Prove it in usage.** cache_creation_input_tokens shows a write, cache_read_input_tokens a hit, and input_tokens only what came after the breakpoint.

## The question
An application sends the same 8,000-token system prompt and policy document on every request, followed by a short, varying user message. Latency and cost are both concerns. Which optimization most directly addresses both?

- **A.** Truncate the policy document to the first 1,000 tokens.
- **B.** Switch to the smallest available model regardless of task fit.
- **C.** Place the static system prompt and policy before the dynamic content and enable prompt caching.
- **D.** Move the policy document into a few-shot example block.

Pick your answer before you run anything. The answer and the reasoning are at the end, under **Check your answer**.

## Steps on the simulator site
1. Open [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=11](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=11). The left sidebar should say the API key is **saved**. If it says **not set**, paste your key into the **Anthropic API key** box, press **Save**, then **Test**.
2. Read the task statement card and the question. Click the answer you chose. The page tells you at once whether it is right, and why. Open **Why the other answers fall short**.
3. Press **▶ Simulate it live**. The scenario board shows the story, the code runs on the left and Claude's live output appears on the right.
4. When the run pauses, read the outcome of the first method (the trap). Then press **▶ Proceed** to run the fix.
5. Read **Claude's final output**, then **The observation explained**: the two methods side by side, turn by turn, and the checks on what Claude actually did.
6. Open **See the full code this lab runs** and find the lines that make the difference.

## Or run it from a terminal
From the repository root:

```
node docs/tools/test_lab.mjs 11
```

## What you will see
What to look for: Dynamic content first pays full price on every call even with caching on; static first lets the second call read about 8,000 tokens from cache.

These lines are from our own run of this lab on Claude Haiku 5.5. Your wording will differ, because Claude writes each reply fresh; the tool calls, decisions and checks should match. This is an excerpt: wherever … appears, text has been shortened, and a line with only … marks lines left out. Run the lab to see the full output.

```
Northwind Policy Assistant: an 8,075-token static prefix (instructions + policy pack 2026-W47) on every request, then a short staff question. Two requests per phase, a …
== Phase 1 · dynamic session header first, then the policy pack, no caching
  Request 1 (Aisha Tan, branch teller): input_tokens 8,162 · cache_creation_input_tokens 0 · cache_read_input_tokens 0 · output 220 · 1676 ms · US$0.0009
  Answer: You are entitled to **24 working days** of annual leave a year as a branch role at 5 to 9 years' service [HR-03 §2]. You can carry over **up to five days** in…
  Request 2 (Marcus Lee, credit officer): input_tokens 8,171 · cache_creation_input_tokens 0 · cache_read_input_tokens 0 · output 291 · 1835 ms · US$0.0010
  Answer: **Debt-service ratio:** Up to 45% of verified gross monthly household income, including the mortgage at the stressed rate [LEND-07 §3]. The 35% limit applies …

== PAUSE · Phase 1 finished: dynamic first, no caching
   outcome: Both requests paid for the whole prefix: **8,162** and **8,171** input tokens at the full rate, cache_read_input_tokens 0. The policy pack did not change be…
   proceed: Phase 2: switch on cache_control, but leave the session header in front

== Phase 2 · cache_control on the policy pack, but the dynamic header still comes first
  Request 1 (Aisha Tan, branch teller): input_tokens 40 · cache_creation_input_tokens 8,123 · cache_read_input_tokens 0 · output 212 · 1455 ms · US$0.0011
  Answer: You are entitled to **24 working days** of annual leave a year as a branch role at 5 to 9 years' service [HR-03 §2]. You can carry over **up to five unused da…
  Request 2 (Marcus Lee, credit officer): input_tokens 51 · cache_creation_input_tokens 8,119 · cache_read_input_tokens 0 · output 327 · 1962 ms · US$0.0012
  Answer: **Debt-service ratio:** 45% of verified gross monthly household income [LEND-07 §3]. The 35% limit applies only to interest-only borrowing. **Stress test:** A…

== PAUSE · Phase 2 finished: caching on, dynamic content still first
   outcome: Each request **wrote** the cache (8,123 and 8,119 cache_creation_input_tokens) and **read nothing** (cache_read_input_tokens 0 and 0). The breakpoint sits a…
   proceed: Phase 3: the static prefix first with cache_control, the dynamic content after it

== Phase 3 · static prefix first with cache_control, then the session header and question
  Request 1 (Aisha Tan, branch teller): input_tokens 95 · cache_creation_input_tokens 8,067 · cache_read_input_tokens 0 · output 187 · 1359 ms · US$0.0011
  Answer: You are entitled to **24 working days** of annual leave a year as a branch role at 5 to 9 years' service [HR-03 §2]. You can carry over **up to five unused da…
  Request 2 (Marcus Lee, credit officer): input_tokens 106 · cache_creation_input_tokens 0 · cache_read_input_tokens 8,067 · output 336 · 1932 ms · US$0.0003
  Answer: The maximum debt-service ratio for a repayment mortgage is **45%** of verified gross monthly household income [LEND-07 §3]. The 35% limit applies only to inte…
== Result: input cost of request 2 · no cache US$0.0008 · cache with dynamic first US$0.0010 · static first + cache US$0.0001 (89% less than phase 1)
This run's true cost, counting cache writes at 1.25x and reads at 0.1x: US$0.0056

== Turns

== Checks
PASS  Phase 1: neither request read from the cache; each billed the full prefix (7,500+ input_tokens)
PASS  Phase 2: with the dynamic header first, both requests wrote the cache and neither read it
PASS  Phase 3: request 2 read the static prefix from cache (7,500+ cache_read_input_tokens)
PASS  Phase 3: request 2 billed under 300 tokens at the full input rate (the header and question only)
PASS  Every answer cites its policy document (HR-03 for leave, LEND-07 for the stress test)

== Side by side
[trap] Phase 1: dynamic first, no caching: Both requests billed the full 8,171-token prefix at the full input rate.
[trap] Phase 2: caching on, dynamic still first: Every request **wrote** the cache at 1.25x and none read it: the header in front makes every prefix new. Worse than no …
[fix] Phase 3: static first + caching: Request 2 **read 8,067 tokens from cache** at 0.1x; only 106 tokens (the header and question) were billed at the full rate. Input…
  Request 2: input / cache write / cache read tokens | 8,171 / 0 / 0 | 51 / 8,119 / 0 | 106 / 0 / 8,067 (good)
  Request 2: input cost (Haiku 5.5) | US$0.0008 | US$0.0010 (bad) | US$0.0001 (good)
  Input cost per 100,000 requests at that rate | US$81.71 | US$102 | US$9.13
  Request 2: time to full response | 1835 ms | 1962 ms | 1932 ms
  Same instructions and policy reached Claude | yes | yes | yes

6 Claude calls · 16625 in / 1573 out tokens · about US$0.0024 · 10.2 s
```

## Check your answer
**Answer: C.** Ordering stable content first and enabling prompt caching lets repeated prefixes be reused, reducing both time-to-first-token and per-request cost without discarding required context. The cache covers the prefix up to the cache_control breakpoint, so the static instructions and policy must come before anything that changes between requests.

Why the other answers fall short:

- **A.** Truncation loses policy the assistant needs to answer correctly.
- **B.** Downsizing blindly, regardless of task fit, risks answer quality.
- **D.** Relocating the policy to a few-shot block does not create a cacheable, reusable prefix.

## Why it happens
Prompt caching reuses a prefix: the request is read in the order tools, then system, then messages, and the cache covers everything up to the block marked cache_control. A hit needs that prefix to be byte-identical to an earlier request. Put a timestamp, a staff name or a request id in front of the policy and every request has a new prefix, so switching caching on only adds a 25% write charge. Order the request most-stable-first, put the breakpoint on the last static block, and send the dynamic content after it: the first request writes the cache, and every request after it inside the 5-minute lifetime reads the 8,000 tokens at 0.1x the input price and starts answering sooner. Truncating the policy, picking the smallest model or moving the policy into examples would each change what the model knows; caching changes only what you pay and how long you wait.

## Exam tip
Prompt caching needs a byte-identical prefix: static content first, dynamic content last, breakpoint on the last static block. The answer that keeps all the content and changes only its order and caching is the one that cuts both cost and latency.

## Try this next
Move sessionHeader() back into the system array in front of STATIC in Phase 3 (or add a timestamp to INSTRUCTIONS in sims/shared/d2-northwind.js) and run again: cache_read_input_tokens drops to 0, because a cache hit needs a byte-identical prefix. Then shorten the policy pack to a few hundred tokens: below Haiku's 512-token minimum nothing is cached and no error is raised.

---
Source: Official exam guide, sample question 2. Course: Claude Certified Architect - Professional (CCAR-P) Exam Prep (C740). © Tertiary Infotech Academy Pte Ltd · UEN 201200696W
