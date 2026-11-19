# Lab 14: Max effort everywhere breaks the 4 s chat budget: route by request
> Day 1 · Topic 3: Integration · Task statement 3.3 · Simulator 4: Riverton Resident Services · About 12 minutes · Claude Haiku 5.5

## Goal
Task statement 3.3: **Evaluate accuracy-latency trade-offs and justify configuration decisions.** You answer one exam-style question, then run the Riverton Resident Services simulator and watch the tempting design fail and the right one work, with real Claude calls.

## Open this lab

- **The main lab page:** [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/). It lists all 38 simulator labs, the Day 2 builds (Labs 39 to 41) and the practice exam, and holds the API key box.
- **Run it live in your browser (nothing to install):** open [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=14](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=14), paste your Anthropic API key into the sidebar once, then press **Simulate it live**. Every call uses `claude-haiku-5-5`. The run **stops after the first method** and shows its outcome; press **Proceed** to run the fix, then read the two **side by side** under The observation explained.
- **In a terminal, one click:** double-click `run-lab.command` (Mac) or `run-lab.cmd` (Windows) in this folder. It runs `node docs/tools/test_lab.mjs 14` from the repository root, with the same engine the site uses. It needs Node.js and your key in a `.env` file at the repository root (one line: `ANTHROPIC_API_KEY=sk-ant-...`).
- **The code it runs:** [docs/sims/lab-14.js](https://github.com/tertiarycourses/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/blob/main/docs/sims/lab-14.js), on the shared engine [docs/assets/engine.js](https://github.com/tertiarycourses/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/blob/main/docs/assets/engine.js).

## The scenario
Riverton City Council runs a resident-services assistant that answers questions about permits, waste collection and benefit eligibility, and pre-screens applications for caseworkers. It must run in an authorised government cloud environment, handle residents' personal data under data-protection law, explain its decisions in plain language, and give the same quality of answer to every resident, whatever their language or background.

## Key concepts
- **Several latency dials, not one.** Model tier, effort, retrieval depth, verification passes and agent turns all trade accuracy for time, and they compound. Tune the one that dominates your requests.
- **Effort controls output tokens.** output_config.effort (low to max) sets how many tokens Claude spends, thinking and tool calls included. Fewer output tokens means a faster, cheaper reply.
- **The budget comes from the moment.** Live chat is judged in seconds, a form result can show a 'checking' page for longer, and an overnight job can use batch. Budget on p95, not the mean.
- **Route by request class in code.** A deterministic router (channel, form type, intent) sends routine requests to a fast path and consequential ones to a careful path, rather than one setting for all.
- **Justify with your own evals.** A configuration is justified by measured accuracy on a labelled set and p95 against the budget for each path. Settings carried over from another model prove nothing.

## The question
Riverton's resident-services assistant answers live-chat questions about bins and permits, and also pre-screens BEN-HOUSING rent-support forms for caseworkers. To maximise accuracy, the team set effort to max on every request. Chat replies now often take over 5 seconds against a 4-second p95 budget, and one pre-screen ran out of tokens while thinking. Which configuration decision is best justified?

- **A.** Route chat to low effort and pre-screens to a high-effort path, confirmed by each path's p95 and accuracy on a labelled set.
- **B.** Set low effort on every request, because each pre-screen is only advisory and a caseworker confirms the outcome anyway.
- **C.** Keep max effort on every request and stream each reply, so residents see the first words long before the answer completes.
- **D.** Move every request to a larger model at medium effort, which should reach the accuracy of max effort with less thinking time.

Pick your answer before you run anything. The answer and the reasoning are at the end, under **Check your answer**.

## Steps on the simulator site
1. Open [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=14](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=14). The left sidebar should say the API key is **saved**. If it says **not set**, paste your key into the **Anthropic API key** box, press **Save**, then **Test**.
2. Read the task statement card and the question. Click the answer you chose. The page tells you at once whether it is right, and why. Open **Why the other answers fall short**.
3. Press **▶ Simulate it live**. The scenario board shows the story, the code runs on the left and Claude's live output appears on the right.
4. When the run pauses, read the outcome of the first method (the trap). Then press **▶ Proceed** to run the fix.
5. Read **Claude's final output**, then **The observation explained**: the two methods side by side, turn by turn, and the checks on what Claude actually did.
6. Open **See the full code this lab runs** and find the lines that make the difference.

## Or run it from a terminal
From the repository root:

```
node docs/tools/test_lab.mjs 14
```

## What you will see
What to look for: At effort max, chat p95 went over 4 s and a pre-screen could spend all 4,096 tokens thinking; routed (low for chat, high for pre-screens), chat p95 was about 2 s, all six answers were correct, and the run used a fraction of the output tokens.

These lines are from our own run of this lab on Claude Haiku 5.5. Your wording will differ, because Claude writes each reply fresh; the tool calls, decisions and checks should match. This is an excerpt: wherever … appears, text has been shortened, and a line with only … marks lines left out. Run the lab to see the full output.

```
Eval set: 6 labelled requests · budgets: chat p95 ≤ 4.0 s, BEN-HOUSING pre-screen ≤ 15.0 s
== Phase 1 · effort max on every request (the six run in parallel, each timed)
  CHAT-1   Malay   effort max    2883 ms ·  427 output tokens · stop end_turn · value "Thursday" ✓
  CHAT-2   English effort max    3292 ms ·  553 output tokens · stop end_turn · value "45" ✓
  CHAT-3   Chinese effort max   11856 ms · 2575 output tokens · stop end_turn · value "0" ✓
  CHAT-4   Tamil   effort max    4744 ms ·  903 output tokens · stop end_turn · value "Monday" ✓
  BEN-0412 English effort max    7875 ms · 1849 output tokens · stop end_turn · value "not_eligible" ✓
  BEN-0413 English effort max   16168 ms · 4096 output tokens · stop max_tokens · value "" ✘ (want eligible)
Phase 1 result: chat p95 11.9 s (budget 4.0 s), pre-screen p95 16.2 s, accuracy 5/6, 10403 output tokens, 1 reply cut off at max_tokens while thinking.

== PAUSE · Phase 1 finished: effort max on every request
   outcome: Chat p95 **11.9 s** against a 4.0 s budget (**over budget**); accuracy **5/6**; **10403 output tokens**, most of them thinking; **1 reply spent all 4,096 to…
   proceed: Phase 2: the same six requests through a router: chat at effort low, pre-screens at effort high

== Phase 2 · router in code: chat -> effort low (fast path), BEN-HOUSING -> effort high (careful path)
  CHAT-1   Malay   effort low    1728 ms ·   71 output tokens · stop end_turn · value "Thursday" ✓
  CHAT-2   English effort low    1821 ms ·   47 output tokens · stop end_turn · value "45" ✓
  CHAT-3   Chinese effort low    1875 ms ·   96 output tokens · stop end_turn · value "0" ✓
  CHAT-4   Tamil   effort low    1612 ms ·   81 output tokens · stop end_turn · value "Monday" ✓
  BEN-0412 English effort high   3121 ms ·  498 output tokens · stop end_turn · value "not_eligible" ✓
  BEN-0413 English effort high   2567 ms ·  341 output tokens · stop end_turn · value "eligible" ✓
Phase 2 result: chat p95 1.9 s, pre-screen p95 3.1 s, accuracy 6/6, 1134 output tokens (11% of Phase 1).

== Turns

== Checks
PASS  Phase 1: effort max put chat p95 over the 4 s budget
PASS  Phase 2: the router sent all 4 chat questions at effort low and both BEN-HOUSING pre-screens at effort high
PASS  Phase 2: chat p95 within the 4 s budget and pre-screens within 15 s
PASS  Phase 2: accuracy on the labelled set is 6/6 and no lower than Phase 1
PASS  Phase 2 used under a third of Phase 1's output tokens

== Side by side
[trap] Phase 1: effort max on every request: Chat p95 **11.9 s**, over the 4 s budget, accuracy 5/6, 10403 output tokens, 1 answer lost to thinking past max_tokens. The…
[fix] Phase 2: routed, low for chat, high for pre-screens: Chat p95 **1.9 s** within budget, pre-screens 3.1 s, accuracy 6/6, 1134 output tokens (11% of Phase 1). Each …
  Effort per request | max × 6 | low × 4 chat · high × 2 forms (good)
  Chat p95 (budget 4.0 s) | 11.9 s (bad) | 1.9 s (good)
  Pre-screen p95 (budget 15.0 s) | 16.2 s (bad) | 3.1 s (good)
  Accuracy on the labelled set | 5/6 (bad) | 6/6 (good)
  Output tokens (thinking included) | 10403 | 1134
  Replies cut off at max_tokens | 1 (bad) | 0 (good)

12 Claude calls · 9076 in / 11537 out tokens · about US$0.0067 · 19.3 s
```

## Check your answer
**Answer: A.** Effort sets how many output tokens Claude spends, thinking included, and output tokens are most of a reply's latency. Chat questions are already answered correctly at low effort, so max effort only adds delay, while a pre-screen is consequential and has a longer budget of its own. A router in code that sends each request class to its own effort level, justified by measured p95 against each budget and accuracy on a labelled set, takes the most accurate configuration that fits each moment.

Why the other answers fall short:

- **B.** Low effort everywhere gives up the margin on the consequential path to save time it does not need to save; that a caseworker confirms is no reason to send them more errors.
- **C.** Streaming shortens the perceived wait for chat but not the total time, the thinking tokens or the cost, and it does nothing for replies cut off at max_tokens.
- **D.** Larger tiers are slower and cost more per token, not faster, and the claim is asserted rather than measured on Riverton's own requests.

## Why it happens
Effort controls how many output tokens Claude spends, including thinking, and output tokens are most of the time a reply takes. Max effort on a question like "which day is bin day in Zone 3" buys nothing: the answer is already right at low effort, so the extra thinking is pure latency. The budget comes from the moment: a resident in live chat expects an answer in a few seconds, while a pre-screen form can show a "checking" page for longer, and a wrong eligibility result matters more than a slow bin-day answer. So the router in code sends chat to effort low and pre-screens to effort high, and the run itself is the justification: chat p95 against its 4 s budget, form p95 against 15 s, accuracy on the labelled set, and output tokens. Low everywhere (option B) gives up the margin on the consequential path for a saving it doesn't need; streaming (C) hides the wait but not the time or cost; a larger model (D) is slower and dearer, not faster.

## Exam tip
For accuracy-latency questions, pick the answer that sets the budget from the user's moment, configures per request class, and justifies the choice with measured latency and accuracy. 'Maximum everywhere' and 'minimum everywhere' are both distractors.

## Try this next
Change effortFor to return "low" for every request and rerun: does BEN-0413 (the 40% rent rule) stay correct every time? Then set BUDGET_MS.chat to 2000 and see which configuration still fits. The numbers you get are the justification; carry none over from another model or prompt.

---
Source: Original question written for C740. Course: Claude Certified Architect - Professional (CCAR-P) Exam Prep (C740). © Tertiary Infotech Academy Pte Ltd · UEN 201200696W
