# Lab 37: A chat review can't block PR 512: run claude -p in CI behind a gate
> Day 2 · Topic 7: Developer Productivity & Operational Enablement · Task statement 7.2 · Simulator 6: Kestrel Platform Team · About 12 minutes · Claude Haiku 5.5

## Goal
Task statement 7.2: **Improve developer workflows using AI-assisted tooling.** You answer one exam-style question, then run the Kestrel Platform Team simulator and watch the tempting design fail and the right one work, with real Claude calls.

## Open this lab

- **The main lab page:** [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/). It lists all 38 simulator labs, the Day 2 builds (Labs 39 to 41) and the practice exam, and holds the API key box.
- **Run it live in your browser (nothing to install):** open [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=37](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=37), paste your Anthropic API key into the sidebar once, then press **Simulate it live**. Every call uses `claude-haiku-5-5`. The run **stops after the first method** and shows its outcome; press **Proceed** to run the fix, then read the two **side by side** under The observation explained.
- **In a terminal, one click:** double-click `run-lab.command` (Mac) or `run-lab.cmd` (Windows) in this folder. It runs `node docs/tools/test_lab.mjs 37` from the repository root, with the same engine the site uses. It needs Node.js and your key in a `.env` file at the repository root (one line: `ANTHROPIC_API_KEY=sk-ant-...`).
- **The code it runs:** [docs/sims/lab-37.js](https://github.com/tertiarycourses/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/blob/main/docs/sims/lab-37.js), on the shared engine [docs/assets/engine.js](https://github.com/tertiarycourses/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/blob/main/docs/assets/engine.js).

## The scenario
Kestrel Software's platform team is rolling Claude Code out to 40 engineers across four product squads, and runs Claude-powered features in production. The team owns the shared Claude Code configuration, the CI pipeline, the evaluation suite for each prompt change, and the on-call runbooks for incidents in Claude-powered services.

## Key concepts
- **Headless Claude Code: claude -p.** Print mode runs one prompt and exits, which suits CI. --output-format json gives a result a script can read instead of a chat transcript.
- **Skills make reviews consistent.** A committed .claude/skills/pr-review/SKILL.md gives every run the same rules, versioned and reviewed like code.
- **Structured output for machines.** A JSON schema for findings (file, line, rule, severity) lets a CI step count and filter them. Prose needs a human to read it.
- **Model for judgement, code for the gate.** Claude decides whether line 14 logs a card number. Plain code decides that a high finding fails the build. Branch protection blocks the merge.
- **Speed-ups move the bottleneck.** Faster code writing helps only if review and verification keep up. Automating the first review pass keeps the human reviewer for judgement.

## The question
Kestrel engineers paste diffs into a Claude chat for review when they remember to, each with their own prompt, and the feedback varies from person to person. Last month a refund change that logged full card numbers was merged. The platform team wants consistent reviews that stop changes like that. What should they do?

- **A.** Add a CONTRIBUTING.md rule that every engineer must ask Claude to review the diff in a chat before opening a pull request.
- **B.** Give each engineer a recommended review prompt to keep in their personal ~/.claude/CLAUDE.md, so every review starts from the same text.
- **C.** Have Claude review each pull request in CI and post its findings as a free-text comment for the human reviewer to read before merging.
- **D.** Run claude -p in CI with a committed review skill and a JSON schema for findings, and fail the check on any high-severity finding.

Pick your answer before you run anything. The answer and the reasoning are at the end, under **Check your answer**.

## Steps on the simulator site
1. Open [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=37](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=37). The left sidebar should say the API key is **saved**. If it says **not set**, paste your key into the **Anthropic API key** box, press **Save**, then **Test**.
2. Read the task statement card and the question. Click the answer you chose. The page tells you at once whether it is right, and why. Open **Why the other answers fall short**.
3. Press **▶ Simulate it live**. The scenario board shows the story, the code runs on the left and Claude's live output appears on the right.
4. When the run pauses, read the outcome of the first method (the trap). Then press **▶ Proceed** to run the fix.
5. Read **Claude's final output**, then **The observation explained**: the two methods side by side, turn by turn, and the checks on what Claude actually did.
6. Open **See the full code this lab runs** and find the lines that make the difference.

## Or run it from a terminal
From the repository root:

```
node docs/tools/test_lab.mjs 37
```

## What you will see
What to look for: Phase 1's chat reply is prose and the gate has no verdict; Phase 2 blocks PR 512 on KR-1 at refund.py line 14 and passes the clean PR 513.

These lines are from our own run of this lab on Claude Haiku 5.5. Your wording will differ, because Claude writes each reply fresh; the tool calls, decisions and checks should match. This is an excerpt: wherever … appears, text has been shortened, and a line with only … marks lines left out. Run the lab to see the full output.

```
Kestrel · PR 512 "Partial refunds from the order page" by Dev Patel (squad 3); PR 513 "Test for cart totals"
== Phase 1 · ad hoc chat review: the engineer pastes the diff and asks for a look
Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
  stop_reason: end_turn -> STOP: Claude has finished
Reply: Don't merge yet. The most serious problem is the log line. **Blocking** 1. **Logging the full card number.** `log.info(... card.number ...)` writes raw PAN data …
CI gate on the chat reply: not JSON: no machine-readable result. The pipeline has nothing to fail on, so PR 512 merges unless a human reads the reply (the reply does me…

== PAUSE · Phase 1 finished: an ad hoc review in a chat
   outcome: The reply is 267 words of prose and does mention the card number, but **the CI step cannot parse it** (not JSON: no machine-readable result), so nothing blo…
   proceed: Phase 2: the same PR, reviewed by claude -p in CI with the shared skill and a findings schema, behind a gate

== Phase 2 · claude -p in CI: committed /pr-review skill + JSON schema on every PR, then a gate in plain code
    (CI: claude -p /pr-review 512) Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
      stop_reason: end_turn -> STOP: Claude has finished (the subagent returns its answer)
    (CI: claude -p /pr-review 512) answer: {"findings":[{"file":"payments/refund.py","line":14,"rule":"KR-1","severity":"high","message":"Logs card.number, which is a c…
    (CI: claude -p /pr-review 513) Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
      stop_reason: end_turn -> STOP: Claude has finished (the subagent returns its answer)
    (CI: claude -p /pr-review 513) answer: {"findings":[],"verdict":"pass"}
PR 512: 4 finding(s): KR-1/high payments/refund.py:14, KR-2/high payments/refund.py:15, KR-3/medium payments/refund.py:15, KR-4/low payments/refund.py:10 → gate exit 1 …
PR 513: 0 finding(s): none → gate exit 0 (no high-severity finding)

== Turns
turn 1: stop_reason=end_turn
(CI: claude -p /pr-review 512) turn 1: stop_reason=end_turn
(CI: claude -p /pr-review 513) turn 1: stop_reason=end_turn

== Checks
PASS  Phase 1: the ad hoc chat review is prose the CI gate cannot parse, so it gives no verdict on PR 512
PASS  Phase 2: both CI reviews return findings that parse against the schema
PASS  Phase 2: PR 512 has a KR-1 finding at payments/refund.py line 14, and the gate exits 1
PASS  Phase 2: the clean PR 513 has no high-severity finding, and the gate exits 0

== Side by side
[trap] Phase 1: ad hoc chat review: Useful prose that even mentions the card number, but **nothing a pipeline can act on**: the gate has no verdict and PR 512 merges un…
[fix] Phase 2: claude -p in CI with the shared skill: Schema-valid findings on both PRs; **PR 512 is blocked** (KR-1 at refund.py line 14, KR-2 on the refund call) and …
  When it runs | when an engineer remembers | on every pull request, in CI (good)
  Review rules | whatever the engineer's prompt says | committed /pr-review skill: KR-1..KR-4 (good)
  Machine-readable result | no: prose (bad) | yes: findings JSON (good)
  PR 512 findings | card number mentioned in prose | KR-1 high line 14, KR-2 high line 15, KR-3 medium line 15, KR-4 low line 10
  PR 512 gate | no verdict → merges (bad) | exit 1 → blocked (good)
  PR 513 (clean) gate | not reviewed | exit 0 → passes (good)

3 Claude calls · 2359 in / 1606 out tokens · about US$0.0010 · 10.9 s
```

## Check your answer
**Answer: D.** The improvement comes from wiring the tool into the flow, not from using it more often. CI runs the review on every pull request; the committed skill applies the same rules for everyone; the schema makes the output something a script can read; and a few lines of plain code fail the check on a high-severity finding, so branch protection stops the merge. The model supplies the judgement, the gate is deterministic.

Why the other answers fall short:

- **A.** A written rule still depends on each engineer remembering and on their own prompt, and its prose output cannot block anything.
- **B.** A personal ~/.claude file reaches only its owner, drifts over time, and still produces nothing a pipeline can check.
- **C.** Running in CI fixes when it happens, but free text cannot gate a merge: a busy reviewer can still miss the finding.

## Why it happens
Both phases review the same pull request. The ad hoc workflow depends on someone remembering to paste the diff, gets a different review from each person's prompt, and returns prose that only a human can act on: the CI step has nothing it can check, so the change merges unless a reviewer happens to read the reply. The wired-in workflow runs on every pull request in CI with `claude -p`, uses the team's committed pr-review skill so every review applies the same rules, and asks for findings in a JSON schema. A few lines of plain code then fail the check on any high-severity finding: the model gives judgement, the gate is deterministic, and the clean pull request passes.

## Exam tip
When the goal is consistent, enforced AI assistance across a team, look for the answer that runs in the shared pipeline, uses committed configuration, and produces structured output a deterministic step can gate on. Free-text comments and personal prompts are partial fixes.

## Try this next
Remove card.number from line 14 of PR 512 in shared/d7-kestrel.js and add an Idempotency-Key header, then run Phase 2: the gate opens. Then change KR-3 to high in REVIEW_SKILL and see the missing timeout block the merge too.

---
Source: Original question written for C740. Course: Claude Certified Architect - Professional (CCAR-P) Exam Prep (C740). © Tertiary Infotech Academy Pte Ltd · UEN 201200696W
