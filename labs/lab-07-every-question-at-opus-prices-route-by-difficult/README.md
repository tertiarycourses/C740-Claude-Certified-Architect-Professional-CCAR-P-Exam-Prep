# Lab 7: Every question at Opus prices: route by difficulty, grade each route
> Day 1 · Topic 2: Claude Models, Prompting & Context Engineering · Task statement 2.1 · Simulator 4: Riverton Resident Services · About 12 minutes · Claude Haiku 5.5

## Goal
Task statement 2.1: **Select appropriate Claude models based on trade-offs.** You answer one exam-style question, then run the Riverton Resident Services simulator and watch the tempting design fail and the right one work, with real Claude calls.

## Open this lab

- **The main lab page:** [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/). It lists all 38 simulator labs, the Day 2 builds (Labs 39 to 41) and the practice exam, and holds the API key box.
- **Run it live in your browser (nothing to install):** open [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=7](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=7), paste your Anthropic API key into the sidebar once, then press **Simulate it live**. Every call uses `claude-haiku-5-5`. The run **stops after the first method** and shows its outcome; press **Proceed** to run the fix, then read the two **side by side** under The observation explained.
- **In a terminal, one click:** double-click `run-lab.command` (Mac) or `run-lab.cmd` (Windows) in this folder. It runs `node docs/tools/test_lab.mjs 7` from the repository root, with the same engine the site uses. It needs Node.js and your key in a `.env` file at the repository root (one line: `ANTHROPIC_API_KEY=sk-ant-...`).
- **The code it runs:** [docs/sims/lab-07.js](https://github.com/tertiarycourses/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/blob/main/docs/sims/lab-07.js), on the shared engine [docs/assets/engine.js](https://github.com/tertiarycourses/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/blob/main/docs/assets/engine.js).

## The scenario
Riverton City Council runs a resident-services assistant that answers questions about permits, waste collection and benefit eligibility, and pre-screens applications for caseworkers. It must run in an authorised government cloud environment, handle residents' personal data under data-protection law, explain its decisions in plain language, and give the same quality of answer to every resident, whatever their language or background.

## Key concepts
- **The Claude model tiers.** Fable 5.2, Opus 5.5, Sonnet 5.5 and Haiku 5.5 all have a 1M-token context. They differ in price (US$8/40 down to US$0.10/0.50 per million tokens), latency and ceiling.
- **Cost per completed task.** Compare models on your own eval: tokens times price, divided by the share of tasks solved, plus the cost of cleaning up failures. Price per token alone misleads.
- **Routing by task difficulty.** A cheap classifier sends each request to the least capable model that passes for that kind of task: lookups and extraction go small, multi-step reasoning goes up.
- **Quality per route.** Grade every route on its own eval cases. A blended score can hide a route that fails, so check each slice before moving traffic to a cheaper model.
- **Effort and thinking are levers too.** Within one model, lower effort or thinking switched off cuts output tokens and latency on simple tasks. Tuning effort is often a better lever than changing model.

## The question
Riverton City Council's resident assistant sends every question to Claude Opus 5.5. Its logs show that 80% of questions are one-fact lookups (bin days, permit status) in four languages, and 20% are benefit pre-screens that apply several eligibility rules to a resident's own figures. The model bill is now well over budget. Which approach best balances answer quality and cost?

- **A.** Move all traffic to Claude Haiku 5.5, the cheapest tier, because most resident questions are simple lookups.
- **B.** Route each question by task difficulty, Haiku for lookups and Sonnet for pre-screens, and evaluate each route.
- **C.** Keep Claude Opus 5.5 for every question, but lower max_tokens so that each answer costs less to generate.
- **D.** Move all traffic to Claude Fable 5.2, whose higher accuracy means fewer failed answers need a costly human follow-up.

Pick your answer before you run anything. The answer and the reasoning are at the end, under **Check your answer**.

## Steps on the simulator site
1. Open [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=7](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=7). The left sidebar should say the API key is **saved**. If it says **not set**, paste your key into the **Anthropic API key** box, press **Save**, then **Test**.
2. Read the task statement card and the question. Click the answer you chose. The page tells you at once whether it is right, and why. Open **Why the other answers fall short**.
3. Press **▶ Simulate it live**. The scenario board shows the story, the code runs on the left and Claude's live output appears on the right.
4. When the run pauses, read the outcome of the first method (the trap). Then press **▶ Proceed** to run the fix.
5. Read **Claude's final output**, then **The observation explained**: the two methods side by side, turn by turn, and the checks on what Claude actually did.
6. Open **See the full code this lab runs** and find the lines that make the difference.

## Or run it from a terminal
From the repository root:

```
node docs/tools/test_lab.mjs 7
```

## What you will see
What to look for: Opus for everything answers all eight correctly at several times the budget; routing keeps every route correct at a quarter to a third of the cost.

These lines are from our own run of this lab on Claude Haiku 5.5. Your wording will differ, because Claude writes each reply fresh; the tool calls, decisions and checks should match. This is an excerpt: wherever … appears, text has been shortened, and a line with only … marks lines left out. Run the lab to see the full output.

```
Riverton Resident Services: an eval set of 8 questions (6 lookups, 2 benefit pre-screens) in English, Malay, Chinese and Tamil, graded on an answer key. Live traffic: 9…
This lab calls only claude-haiku-5-5. Bigger tiers are priced from their list prices, never called.
== Phase 1 · one model for everything: every question at the top tier (priced at Claude Opus 5.5)
  (Answered in two batches, lookups then pre-screens, to keep the lab cheap. Every question goes to the same top tier.)
  ok    Q1 (English) [top tier]: In Zone 3, general waste is collected on Wednesday. Collection starts at 7am, so put your bin out the night before.
  ok    Q2 (Malay) [top tier]: Tong kitar semula di Zon 1 dikutip pada hari Khamis. Collection starts at 7am, so put your bin out the night before.
  ok    Q3 (English) [top tier]: Permit PRM-2231 for the street party on Elm Close on 14 December 2026 is still awaiting police comments. They were requested on 12 Nove…
  ok    Q4 (Chinese) [top tier]: 许可证 PRM-2244（18 Mill Lane 外路边的废料箱）有效期至2026年12月15日。
  ok    Q5 (Tamil) [top tier]: மண்டலம் 2 இல் பொதுக் கழிவுகள் செவ்வாய்க்கிழமை சேகரிக்கப்படும். சேகரிப்பு காலை 7 மணிக்கு தொடங்கும், எனவே முந்தைய இரவு தொட்டியை வெளியே வையு…
  ok    Q6 (English) [top tier]: Each household gets 2 free bulky item collections per year. After that, each collection costs US$25. You can book online or by phone.
  usage: input_tokens 1370 · output_tokens 984
  ok    Q7 (English) [top tier] pre_screen=met: Yes, you pass the pre-screen. Counted income: US$3,700 minus US$350 childcare = US$3,350, under the US$3,600 limit for 3…
  ok    Q8 (English) [top tier] pre_screen=not_met: No, you do not pass the pre-screen yet. Counted income: US$4,700 minus childcare capped at US$400 = US$4,300, under …
  usage: input_tokens 1353 · output_tokens 1208
  One lookup's tokens at each tier's list price: Claude Fable 5.2 US$0.0084 · Claude Opus 5.5 US$0.0042 · Claude Sonnet 5.5 US$0.0021 · Claude Haiku 5.5 US$0.0001

== PAUSE · Phase 1 finished: one model for everything
   outcome: **8/8** answers correct on the key, at Opus 5.5 prices **US$0.0042 a lookup** and **US$0.0148 a pre-screen**, so **US$0.0063 a question** at Riverton's traf…
   proceed: Phase 2: a Haiku router sends lookups to Haiku and pre-screens to Sonnet, graded per route

== Phase 2 · route by task difficulty: Haiku router → Haiku route (lookups) or Sonnet route (pre-screens)
  Router: haiku ← Q1, Q2, Q3, Q4, Q5, Q6 · sonnet ← Q7, Q8 · input_tokens 831 · output_tokens 147
  ok    Q1 (English) [haiku route]: General waste is collected on Wednesdays in Zone 3. Put your bin out the night before, as collection starts at 7am.
  ok    Q2 (Malay) [haiku route]: Kitar semula di Zon 1 dikutip pada hari Khamis. Letakkan tong anda di luar pada malam sebelumnya, kerana kutipan bermula pada pukul 7 …
  ok    Q3 (English) [haiku route]: Permit PRM-2231 for the street party on Elm Close on 14 December 2026 is still awaiting police comments. These were requested on 12 …
  ok    Q4 (Chinese) [haiku route]: 许可证 PRM-2244（18 Mill Lane 外道路上的垃圾箱）有效期至 2026 年 12 月 15 日。
  ok    Q5 (Tamil) [haiku route]: மண்டலம் 2 இல் பொதுக் கழிவுகள் செவ்வாய்க்கிழமைகளில் சேகரிக்கப்படும். கழிவுகளை முந்தைய இரவே வெளியே வைக்கவும், சேகரிப்பு காலை 7 மணிக்குத்…
  ok    Q6 (English) [haiku route]: You get 2 free bulky item collections per household per year. After that, each additional collection costs US$25. You can book onlin…
  usage: input_tokens 1369 · output_tokens 540
  ok    Q7 (English) [sonnet route, priced at Sonnet 5.5] pre_screen=met: Pre-screen met. Rule 1: US$3,700 minus US$350 childcare gives US$3,350 counted income (carer's…
  ok    Q8 (English) [sonnet route, priced at Sonnet 5.5] pre_screen=not_met: Pre-screen not met. Rule 1: US$4,700 minus US$450 childcare gives US$4,250 counted income.…
  usage: input_tokens 1353 · output_tokens 1297
== Result: per question US$0.0063 → US$0.0016 (router US$0.0000 + 80% × Haiku US$0.0001 + 20% × Sonnet US$0.0078) · monthly US$568 → US$148

== Turns

== Checks
PASS  The router sent all 6 lookups to the Haiku route and both benefit pre-screens to the Sonnet route
PASS  Haiku route: every lookup correct on the answer key, in all four languages (6/6)
PASS  Sonnet route: both pre-screens apply the rules correctly (2/2)
PASS  Phase 1 is over budget (US$568 a month) and phase 2 within it (US$148)
PASS  Routing cut the projected monthly cost by at least half (74%)

== Side by side
[trap] Phase 1: one model for everything (Opus 5.5 prices): 8/8 correct, **US$568 a month**: 1.9x the budget, mostly spent on one-fact lookups.
[fix] Phase 2: route by difficulty, graded per route: Lookups 6/6 on Haiku, pre-screens 2/2 on the Sonnet route, **US$148 a month** (74% less).
  Lookups (Q1-Q6) correct | 6/6 | 6/6 (good)
  Benefit pre-screens (Q7-Q8) correct | 2/2 | 2/2 (good)
  Model per question | Opus 5.5 for all 8 | Haiku: Q1 Q2 Q3 Q4 Q5 Q6 · Sonnet: Q7 Q8
  Cost per lookup · per pre-screen (list prices) | US$0.0042 · US$0.0148 | US$0.0001 · US$0.0078 (+ router US$0.0000)
  Cost per question at the traffic mix | US$0.0063 | US$0.0016
  Projected month (90,000 questions, budget US$300) | US$568 (bad) | US$148 (good)

5 Claude calls · 6276 in / 4176 out tokens · about US$0.0027 · 22.4 s
```

## Check your answer
**Answer: B.** Model choice is a trade-off made per task, not per application. One-fact lookups are well within Haiku 5.5's ability in every language Riverton serves, at a fortieth of Opus 5.5's price; the multi-rule pre-screens justify a stronger tier. A cheap router sends each question to the least capable model that passes for that kind of task, and each route is graded on its own eval cases before traffic moves, so the saving does not come at the cost of quality where quality matters.

Why the other answers fall short:

- **A.** Haiku for everything ignores the 20% of multi-rule pre-screens, and nothing measures whether it handles them.
- **C.** A lower output cap risks truncated answers and leaves every input token, and the lookups, at Opus prices.
- **D.** Fable doubles the price of every lookup that Haiku already answers correctly, so there is no failure cost to recover.

## Why it happens
Model choice is a trade-off between quality, latency and cost, judged per task, not per application. Most of Riverton's traffic is one-fact lookups (a bin day, a permit status) that the smallest model answers correctly in any of the four languages; a minority are benefit pre-screens that apply several rules to a resident's own numbers. Sending everything to the most capable model buys quality the lookups do not need at up to 40 times the price. A cheap router that sends each question to the least capable model that passes, with every route measured on its own eval cases, keeps quality where it matters and puts the money there. Price per completed task, not per token: a route that is cheap but fails costs more once the failures are cleaned up.

## Exam tip
When one model serves very different tasks, the best answer routes by task difficulty and measures quality per route. 'Cheapest for everything' and 'most capable for everything' are both traps: each ignores half the trade-off.

## Try this next
Edit ROUTER so that every question goes to sonnet, and run again: the quality is the same and the saving almost disappears. Then delete the US$400 childcare cap from the facts in sims/shared/d2-riverton.js: Q8's pre-screen now fails the grader on both routes, which is why each route needs its own eval cases.

---
Source: Original question written for C740. Course: Claude Certified Architect - Professional (CCAR-P) Exam Prep (C740). © Tertiary Infotech Academy Pte Ltd · UEN 201200696W
