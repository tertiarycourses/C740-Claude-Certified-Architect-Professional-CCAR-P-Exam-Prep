# Lab 31: A design from the COO's one line misses legal: interview every group
> Day 2 · Topic 6: Stakeholder Communication & Lifecycle Management · Task statement 6.1 · Simulator 5: Lumen Retail Engagement · About 12 minutes · Claude Haiku 5.5

## Goal
Task statement 6.1: **Conduct structured discovery and requirement gathering.** You answer one exam-style question, then run the Lumen Retail Engagement simulator and watch the tempting design fail and the right one work, with real Claude calls.

## Open this lab

- **The main lab page:** [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/). It lists all 38 simulator labs, the Day 2 builds (Labs 39 to 41) and the practice exam, and holds the API key box.
- **Run it live in your browser (nothing to install):** open [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=31](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=31), paste your Anthropic API key into the sidebar once, then press **Simulate it live**. Every call uses `claude-haiku-5-5`. The run **stops after the first method** and shows its outcome; press **Proceed** to run the fix, then read the two **side by side** under The observation explained.
- **In a terminal, one click:** double-click `run-lab.command` (Mac) or `run-lab.cmd` (Windows) in this folder. It runs `node docs/tools/test_lab.mjs 31` from the repository root, with the same engine the site uses. It needs Node.js and your key in a `.env` file at the repository root (one line: `ANTHROPIC_API_KEY=sk-ant-...`).
- **The code it runs:** [docs/sims/lab-31.js](https://github.com/tertiarycourses/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/blob/main/docs/sims/lab-31.js), on the shared engine [docs/assets/engine.js](https://github.com/tertiarycourses/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/blob/main/docs/assets/engine.js).

## The scenario
You are the Claude solution architect engaged by Lumen Retail, a 300-store retailer, to deliver an AI product-support assistant. You run discovery with the sponsor, store operations, IT security and legal; agree the service levels; record architecture decisions; hand the build to Lumen's own team; and run the system through monitoring and iteration after go-live. Claude helps you with each step.

## Key concepts
- **Discovery output is a requirements trace.** Each requirement cites who said it. Anything nobody said is labelled an assumption, so the sponsor can see what the design rests on.
- **A checklist, not a conversation.** Users, volumes, data, constraints, risks, success measures and SLAs. A fixed list makes gaps visible: an empty row is a question still to ask.
- **Every stakeholder group, not the sponsor.** The sponsor owns the goal; store operations, IT security and legal own constraints the sponsor may not know. Each holds a veto the design must respect.
- **Log conflicts; don't settle them.** When two groups want incompatible things, record both sources and the person who decides. A legal obligation outranks an operational wish.
- **Success measures before any build.** A measurable target (30% less staff time, satisfaction 4.2 or better) is what a pilot is later judged against. Without it a proof of concept proves nothing.

## The question
Lumen Retail's COO, Grace Lim, emails you: "We want an AI assistant in all 300 stores that answers product questions for staff and customers. Live by early March. Can you send me the solution design by Friday?" Store operations, IT security and legal have not yet been consulted. What should you do first?

- **A.** Draft a reference design from the COO's brief by Friday, then refine it in review sessions with each team once they have something concrete to react to and comment on.
- **B.** Build a quick proof of concept on the product catalogue so that every stakeholder can react to a working assistant before any of the requirements are written down.
- **C.** Interview each stakeholder group against a checklist of users, volumes, data, constraints, risks, success measures and SLAs, and log conflicts for the sponsor.
- **D.** Send every stakeholder a short requirements questionnaire, and where their answers conflict, design to the view that most of the groups share.

Pick your answer before you run anything. The answer and the reasoning are at the end, under **Check your answer**.

## Steps on the simulator site
1. Open [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=31](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=31). The left sidebar should say the API key is **saved**. If it says **not set**, paste your key into the **Anthropic API key** box, press **Save**, then **Test**.
2. Read the task statement card and the question. Click the answer you chose. The page tells you at once whether it is right, and why. Open **Why the other answers fall short**.
3. Press **▶ Simulate it live**. The scenario board shows the story, the code runs on the left and Claude's live output appears on the right.
4. When the run pauses, read the outcome of the first method (the trap). Then press **▶ Proceed** to run the fix.
5. Read **Claude's final output**, then **The observation explained**: the two methods side by side, turn by turn, and the checks on what Claude actually did.
6. Open **See the full code this lab runs** and find the lines that make the difference.

## Or run it from a terminal
From the repository root:

```
node docs/tools/test_lab.mjs 31
```

## What you will see
What to look for: Phase 1 assumes five of seven items; Phase 2 traces all seven and finds the transcript conflict between store operations and legal.

These lines are from our own run of this lab on Claude Haiku 5.5. Your wording will differ, because Claude writes each reply fresh; the tool calls, decisions and checks should match. This is an excerpt: wherever … appears, text has been shortened, and a line with only … marks lines left out. Run the lab to see the full output.

```
Lumen Retail · BRIEF-01: Grace Lim (COO), by email: "We want an AI assistant in all 300 stores that answers product questions for staff and customers. Live by early Mar…
== Phase 1 · design from the sponsor's ask: requirements drafted from BRIEF-01 alone
Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
  stop_reason: end_turn -> STOP: Claude has finished
Reply: {"requirements":[{"item":"users","finding":"Store staff and customers are the intended users of an AI assistant answering product questions across all 300 stores…
Phase 1 trace: 2/7 items backed by a record that covers them (users, constraints); assumed: volumes, data, risks, success_measures, slas. Conflicts with two real source…

== PAUSE · Phase 1 finished: requirements from the sponsor's one line
   outcome: Only **2 of 7** checklist items trace to something a stakeholder said (users, constraints); **5 are the architect's guesses** (volumes, data, risks, success…
   proceed: Phase 2: the same ask, with structured discovery: interview each group against the checklist

== Phase 2 · structured discovery: interview sponsor, store ops, IT security and legal against the checklist
Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
  stop_reason: tool_use -> CONTINUE: run the tools, append the results, call Claude again
  -> ask_stakeholder({"stakeholder":"sponsor","question":"Who are the users (staff and customers), expected volumes (stores, daily queries, …)
  <- result: {"stakeholder":"Grace Lim, COO (sponsor)","records":[{"id":"INT-01","topic":"success_measures","says":"Success means store staff spend 30% less time …
  -> ask_stakeholder({"stakeholder":"store_ops","question":"How do store staff and customers would use an AI product-question assistant: who…)
  <- result: {"stakeholder":"Farid Rahman, store operations lead","records":[{"id":"INT-03","topic":"users","says":"2,400 store staff on store tablets, plus custo…
  -> ask_stakeholder({"stakeholder":"it_security","question":"Constraints for an AI assistant across 300 stores: systems and product data so…)
  <- result: {"stakeholder":"Hannah Koh, IT security lead","records":[{"id":"INT-07","topic":"data","says":"It may use the product catalogue, stock levels and the…
  -> ask_stakeholder({"stakeholder":"legal","question":"Legal and compliance constraints for an AI assistant answering product questions for…)
  <- result: {"stakeholder":"Ravi Menon, legal counsel","records":[{"id":"INT-10","topic":"constraints","says":"Chat transcripts that contain customer details mus…
Turn 2: POST /v1/messages · model claude-haiku-5-5 · 3 messages (tool results appended)
  stop_reason: end_turn -> STOP: Claude has finished
Reply: {"requirements":[{"item":"users","finding":"About 2,400 store staff use store tablets, and staff access must sit behind single sign-on.","evidence":["INT-03","IN…
CONFLICT: Store operations wants all chat transcripts kept for 90 days for quality review. Legal says transcripts containing customer details must not be stored after t…

== Turns
turn 1: stop_reason=end_turn
turn 1: stop_reason=tool_use tools=ask_stakeholder,ask_stakeholder,ask_stakeholder,ask_stakeholder
turn 2: stop_reason=end_turn

== Checks
PASS  Phase 1: at most 2 of the 7 checklist items trace to a record (the sponsor's ask covers users and a deadline only)
PASS  Phase 2: Claude interviewed all four stakeholder groups with ask_stakeholder
PASS  Phase 2: every checklist item cites a record that really covers it (7/7)
PASS  Phase 2: the transcript conflict is logged with both sources, INT-06 and INT-10

== Side by side
[trap] Phase 1: design from the ask: **5 of 7 items are assumptions** (volumes, data, risks, success_measures, slas). No stakeholder was asked, so no conflict with two …
[fix] Phase 2: structured discovery: Four groups interviewed; **all 7 items trace to a record**, and the clash between INT-06 (keep transcripts 90 days) and INT-10 (nev…
  Stakeholder groups interviewed | 0 (sponsor's email only) | 4: sponsor, store_ops, it_security, legal (good)
  Checklist items traced to a record | 2/7 (bad) | 7/7 (good)
  Trace by item (✓ traced, ? assumed) | ✓ users · ? volumes · ? data · ✓ constraints · ? risks · ? success_measures · ? slas | ✓ users · ✓ volumes · ✓ data · ✓ constrai…
  Conflicts backed by two stakeholders' records | 0 | 2
  Transcripts: keep 90 days vs never store | not found (bad) | found (good)

3 Claude calls · 5684 in / 5297 out tokens · about US$0.0032 · 26.4 s
```

## Check your answer
**Answer: C.** The sponsor's email covers users and a deadline, nothing more. Structured discovery against a fixed checklist turns volumes, data, risks, success measures and service levels from guesses into traced requirements, and it is the only step that surfaces conflicts such as store operations wanting transcripts kept while legal forbids storing them. The architect records the conflict with both sources and leaves the decision to the accountable owner.

Why the other answers fall short:

- **A.** A design drafted first anchors everyone on assumptions, and conflicts such as the legal ban on stored transcripts surface late, after the design depends on them.
- **B.** A proof of concept before success measures and constraints are known has nothing to be judged against, and it can be built on data legal will not allow.
- **D.** A legal obligation is not outvoted by the majority: conflicts must go to the accountable owner, and a questionnaire cannot probe answers the way an interview can.

## Why it happens
Both phases start from the same sponsor email. A design drafted from it can only trace what the sponsor wrote: users and a deadline. Volumes, data, risks, success measures and service levels become the architect's guesses, and the most expensive finding of the engagement, that store operations wants every transcript kept while legal forbids storing them, never comes up. Structured discovery interviews each stakeholder group against a fixed checklist, traces each requirement to what someone actually said, and writes conflicts down with both sources for the accountable owner to resolve. Code checks the trace, so a requirement that cites a record which does not cover it counts as an assumption.

## Exam tip
When a scenario starts from a sponsor's one-line request, the answer is discovery across all stakeholder groups before design or a proof of concept. Conflicts are recorded and escalated to the accountable owner; they are never settled by a majority vote or by the architect alone.

## Try this next
Remove legal from the ask_stakeholder enum and run Phase 2 again: the transcript conflict disappears, and the design would ship a privacy breach. Then add a fifth checklist item, such as accessibility, and see whether any stakeholder record backs it.

---
Source: Original question written for C740. Course: Claude Certified Architect - Professional (CCAR-P) Exam Prep (C740). © Tertiary Infotech Academy Pte Ltd · UEN 201200696W
