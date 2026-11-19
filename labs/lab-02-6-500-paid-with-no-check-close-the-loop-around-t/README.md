# Lab 2: $6,500 paid with no check: close the loop around the decision step
> Day 1 · Topic 1: Solution Design & Architecture · Task statement 1.2 · Simulator 1: Harbour Mutual Claims Desk · About 12 minutes · Claude Haiku 5.5

## Goal
Task statement 1.2: **Design end-to-end architectures (input → processing → output → feedback loops).** You answer one exam-style question, then run the Harbour Mutual Claims Desk simulator and watch the tempting design fail and the right one work, with real Claude calls.

## Open this lab

- **The main lab page:** [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/). It lists all 38 simulator labs, the Day 2 builds (Labs 39 to 41) and the practice exam, and holds the API key box.
- **Run it live in your browser (nothing to install):** open [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=2](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=2), paste your Anthropic API key into the sidebar once, then press **Simulate it live**. Every call uses `claude-haiku-5-5`. The run **stops after the first method** and shows its outcome; press **Proceed** to run the fix, then read the two **side by side** under The observation explained.
- **In a terminal, one click:** double-click `run-lab.command` (Mac) or `run-lab.cmd` (Windows) in this folder. It runs `node docs/tools/test_lab.mjs 2` from the repository root, with the same engine the site uses. It needs Node.js and your key in a `.env` file at the repository root (one line: `ANTHROPIC_API_KEY=sk-ant-...`).
- **The code it runs:** [docs/sims/lab-02.js](https://github.com/tertiarycourses/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/blob/main/docs/sims/lab-02.js), on the shared engine [docs/assets/engine.js](https://github.com/tertiarycourses/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/blob/main/docs/assets/engine.js).

## The scenario
Harbour Mutual Insurance is replacing its first-line motor-claims triage with a Claude-based claims agent. The agent reads policies and claims, requests damage assessments, drafts customer letters, and can approve payouts or escalate to a human adjuster. Adjusters, the finance controller and the regulator all have a stake in how it is built. Claims arrive as free-text forms, photos and repair quotes.

## Key concepts
- **Four stages, not three.** Input, processing and output are what you demo. The feedback stage (traces, human decisions, outcomes) is what lets the system improve, and it is what you operate.
- **Validate in code, after Claude.** Hard rules such as coverage, quote minus excess and payout authority are checked by code on every decision, independently of the model that produced it.
- **Gates fail closed.** If the validator fails, errors or cannot decide, the action gate sends the case to a person. It never executes by default.
- **Three loops, three clocks.** Repair one output (seconds), human review of risky cases (minutes), and offline improvement where failures become eval cases that gate the next change (days).

## The question
Harbour Mutual's claims pipeline sends each claim and its policy to Claude, which returns a decision that the pipeline executes. Last week it paid a $6,500 claim, above the agent's $5,000 payout authority, and the team has no record of which decisions adjusters later reversed. Which change to the end-to-end architecture best addresses both problems?

- **A.** Add the $5,000 payout authority and the excess rule to the system prompt with worked examples, so that Claude refers large claims to an adjuster on its own initiative.
- **B.** Validate each decision in code against the payout rules, retry once with the errors, route anything still failing to an adjuster, and store each adjuster decision as a labelled eval case.
- **C.** Log every request and response to the observability store, and review a weekly sample of 50 decisions with the adjusters to agree the prompt changes for each release of the claims pipeline.
- **D.** Switch the decision step to a larger model with extended thinking, since the payout shows that the current model's reasoning about policy limits is not reliable enough.

Pick your answer before you run anything. The answer and the reasoning are at the end, under **Check your answer**.

## Steps on the simulator site
1. Open [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=2](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=2). The left sidebar should say the API key is **saved**. If it says **not set**, paste your key into the **Anthropic API key** box, press **Save**, then **Test**.
2. Read the task statement card and the question. Click the answer you chose. The page tells you at once whether it is right, and why. Open **Why the other answers fall short**.
3. Press **▶ Simulate it live**. The scenario board shows the story, the code runs on the left and Claude's live output appears on the right.
4. When the run pauses, read the outcome of the first method (the trap). Then press **▶ Proceed** to run the fix.
5. Read **Claude's final output**, then **The observation explained**: the two methods side by side, turn by turn, and the checks on what Claude actually did.
6. Open **See the full code this lab runs** and find the lines that make the difference.

## Or run it from a terminal
From the repository root:

```
node docs/tools/test_lab.mjs 2
```

## What you will see
What to look for: The validator holds CLM-7815 for the adjuster, valid payouts still go through, and the adjuster's decision becomes an eval case.

These lines are from our own run of this lab on Claude Haiku 5.5. Your wording will differ, because Claude writes each reply fresh; the tool calls, decisions and checks should match. This is an excerpt: wherever … appears, text has been shortened, and a line with only … marks lines left out. Run the lab to see the full output.

```
Harbour Mutual · claims CLM-7781 (Priya Nair, rear bumper $4,200), CLM-7790 (Daniel Okafor, total loss $18,600, third party only), CLM-7815 (Arjun Mehta, front end $7,2…
== Phase 1 · open loop: whatever the decision step returns is executed
    (decide CLM-7781) Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
      stop_reason: end_turn -> STOP: Claude has finished (the subagent returns its answer)
    (decide CLM-7781) answer: {"claim_id":"CLM-7781","decision":"approve","payout_amount":3700,"reason":"The comprehensive policy is active and covers accidental damage…
CLM-7781: approve $3,700 → executed
    (decide CLM-7790) Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
      stop_reason: end_turn -> STOP: Claude has finished (the subagent returns its answer)
    (decide CLM-7790) answer: {"claim_id":"CLM-7790","decision":"decline","payout_amount":0,"reason":"The policy is third party only and expressly excludes loss of or d…
CLM-7790: decline  → executed
    (decide CLM-7815) Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
      stop_reason: end_turn -> STOP: Claude has finished (the subagent returns its answer)
    (decide CLM-7815) answer: {"claim_id":"CLM-7815","decision":"approve","payout_amount":6500,"reason":"The policy is active, comprehensive cover includes accidental o…
CLM-7815: approve $6,500 → executed (unchecked rule breaks: authority)

== PAUSE · Phase 1 finished: open loop
   outcome: **CLM-7815 was paid $6,500**, above the $5,000 authority, with no check and no person in the path. Nothing was recorded either, so tomorrow's run can make t…
   proceed: Phase 2: the same decision step inside a closed loop

== Phase 2 · closed loop: input checks, output validator, repair retry, action gate, feedback to the eval set
Input checks: 3/3 claims valid (claimant is the policyholder, policy active, quote present)
    (decide CLM-7781) Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
      stop_reason: end_turn -> STOP: Claude has finished (the subagent returns its answer)
    (decide CLM-7781) answer: {"claim_id":"CLM-7781","decision":"approve","payout_amount":3700,"reason":"The policy is active, the incident on 2026-10-28 falls within t…
CLM-7781: validator passed → executed: approve $3,700
    (decide CLM-7790) Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
      stop_reason: end_turn -> STOP: Claude has finished (the subagent returns its answer)
    (decide CLM-7790) answer: {"claim_id":"CLM-7790","decision":"decline","payout_amount":0,"reason":"The policy is third party only and expressly excludes loss of or d…
CLM-7790: validator passed → executed: decline
    (decide CLM-7815) Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
      stop_reason: end_turn -> STOP: Claude has finished (the subagent returns its answer)
    (decide CLM-7815) answer: {"claim_id":"CLM-7815","decision":"approve","payout_amount":6500,"reason":"The policy is active, comprehensive cover includes accidental o…
CLM-7815: validator → authority (payout 6500 is above the agent's US$5,000 authority: a human adjuster must approve) → action gate: adjuster queue (loop B, minutes)
CLM-7815: adjuster approve $6,500 · eval case EV-7815 saved: {"case_id":"EV-7815","input":{"claim":"CLM-7815","policy":"HM-POL-2263"},"model":{"decision":"approve","pay…

== Turns
(decide CLM-7781) turn 1: stop_reason=end_turn
(decide CLM-7790) turn 1: stop_reason=end_turn
(decide CLM-7815) turn 1: stop_reason=end_turn
(decide CLM-7781) turn 1: stop_reason=end_turn
(decide CLM-7790) turn 1: stop_reason=end_turn
(decide CLM-7815) turn 1: stop_reason=end_turn

== Checks
…
PASS  Phase 2: each adjuster decision was saved as a labelled eval case

== Side by side
[trap] Phase 1: open loop: Paid **CLM-7815 $6,500** above the $5,000 authority with no check, and recorded nothing to learn from.
[fix] Phase 2: closed loop: The validator held CLM-7815 for the adjuster; 1 payout inside the rules went straight through; the adjuster's decision became an eval case.
  Decision step (model and prompt) | the same | the same
  Input checks before the call | none (bad) | 3/3 valid (good)
  Decisions | 7781 approve, 7790 decline, 7815 approve | 7781 approve, 7790 decline, 7815 approve
  Paid without a person | 7781 $3,700, 7815 $6,500 (bad) | 7781 $3,700 (good)
  Rule breaks executed | 1 (bad) | 0 (good)
  Sent to the adjuster | none | CLM-7815
  Feedback captured (eval cases) | 0 (bad) | 1 (good)

6 Claude calls · 4710 in / 2541 out tokens · about US$0.0017 · 17.6 s
```

## Check your answer
**Answer: B.** The pipeline is open loop: whatever the model returns is executed, and nothing is learned. Closing the loop keeps the same model and prompt and adds stages around the call: checks before it, a validator in code after it (coverage, quote minus excess, payout authority), one repair retry for fixable errors (seconds), an action gate that sends rule breaks to a person and fails closed (minutes), and a feedback path that saves every adjuster decision as a labelled eval case for the next change to be tested against (days).

Why the other answers fall short:

- **A.** A prompt makes the referral more likely, but when it fails the decision still executes unchecked, and no feedback is captured.
- **C.** Logging and sampling find problems after the money has gone; nothing stops a bad payout before it executes.
- **D.** A larger model is still probabilistic and still unchecked, and the pipeline would still learn nothing from adjuster decisions.

## Why it happens
Input, processing and output are what you demo; the feedback loops are what you operate. Phase 1 executes whatever the model returns: one approval above the payout authority is paid, and because nothing is checked or recorded, the same mistake will happen again tomorrow. Phase 2 keeps the same model and prompt and wraps it: input checks before the call, an output validator in code after it (coverage, quote minus excess, authority), a single repair retry with the errors for fixable mistakes (seconds), an action gate that sends rule breaks to a human adjuster instead of executing them (minutes), and every adjuster decision stored as a labelled eval case for the next prompt or model change to be tested against (days). The validator fails closed: anything it cannot pass goes to a person.

## Exam tip
When a stem says a system acts on model output and nothing is learned from it, choose the answer that checks the output in code before acting, routes failures to a person, and feeds those decisions back as test cases.

## Try this next
Change CLM-7781's repair_quote in shared/d1-harbour.js to 5,800 and run it again: in Phase 1 it is paid unchecked; in Phase 2 it joins the adjuster queue and the eval set grows by one more case. Then delete the excess from the policy wording and see whether the validator's repair retry (loop A) catches a wrong amount.

---
Source: Original question written for C740. Course: Claude Certified Architect - Professional (CCAR-P) Exam Prep (C740). © Tertiary Infotech Academy Pte Ltd · UEN 201200696W
