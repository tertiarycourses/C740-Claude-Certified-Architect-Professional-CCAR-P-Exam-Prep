# Learner Guide: Claude Certified Architect - Professional (CCAR-P) Exam Prep

Course code C740 · Version 1.1 · 26 Nov 2026 · Tertiary Infotech Academy Pte Ltd · UEN 201200696W

## Document Version Control Record

| Version | Effective date | Summary of changes | Author |
|---|---|---|---|
| 1.0 | 19 Nov 2026 | Initial release. Seven topics, one per CCAR-P exam domain; Labs 1 to 38 run one live simulation per task statement on six simulators; Labs 39 to 41 are vibe-coded builds; bonus practice exam. | Dr. Alfred Ang |
| 1.1 | 26 Nov 2026 | Trainer slide: Dr Alfred Ang is a Claude Certified Architect and Claude Certified Developer; adds the Claude Certified Architect - Professional (CCAR-P) badge (four badges). Deck citations updated to v1.1. | Dr. Alfred Ang |

## 1. Introduction

This Learner Guide goes with the Claude Certified Architect - Professional (CCAR-P) Exam Prep course (C740). The course prepares you for Anthropic's Claude Certified Architect – Professional (CCAR-P) exam and, more usefully, for the architect's job the exam describes: designing, building and governing production Claude solutions.

The course runs for 2 days, 15 hours in all, from 9:30am to 5:30pm each day. Day 1 covers Topics 1 to 4. Day 2 covers Topics 5 to 7 in the morning, then the three builds and the practice exam in the afternoon.

The guide follows the exam guide's seven domains. Each domain is one topic; each of its task statements has one lab. For every lab you get the key concepts, the scenario, an exam-style question, the steps to run it live, what you should see, and the answer with the reasoning. Day 2 ends with three builds and a practice exam.

### The CCAR-P exam at a glance

| Item | Detail |
|---|---|
| Credential | Claude Certified Architect – Professional (CCAR-P) |
| Number of items | 63 |
| Item format | Multiple choice and multiple response; each item states how many to select |
| Time limit | 120 minutes |
| Delivery | Proctored: online or at a Pearson VUE test center |
| Passing score | Scaled 720 on a 100–1,000 scale |
| Exam fee | US$175 |
| Validity | 12 months from the date the credential is awarded |
| Result reporting | Pass/fail, scaled score, percent-correct by domain |

| Domain | Weight | Task statements | Labs |
|---|---|---|---|
| 1. Solution Design & Architecture | 17% | 6 | 1, 2, 3, 4, 5, 6 |
| 2. Claude Models, Prompting & Context Engineering | 13% | 5 | 7, 8, 9, 10, 11 |
| 3. Integration | 19% | 8 | 12, 13, 14, 15, 16, 17, 18, 19 |
| 4. Evaluation, Testing & Optimization | 16% | 6 | 20, 21, 22, 23, 24, 25 |
| 5. Governance, Safety & Risk Management | 14% | 5 | 26, 27, 28, 29, 30 |
| 6. Stakeholder Communication & Lifecycle Management | 14% | 5 | 31, 32, 33, 34, 35 |
| 7. Developer Productivity & Operational Enablement | 7% | 3 | 36, 37, 38 |

Source: Claude Certified Architect – Professional Exam Guide v1.0, effective July 2026 (in the exam-guide folder of the course repository). The guide is subject to change; check the current version before you book.

### Learning outcomes

1. Translate business problems into end-to-end Claude solutions, choosing workflow, agentic or multi-agent patterns and tying them to measurable business value.
2. Select Claude models on cost, latency and quality, and design system prompts, examples, context and caching that keep behaviour reliable and token use low.
3. Integrate Claude into enterprise systems with least-privilege tools, sound authentication, the right protocol (MCP, API/CLI, agent-to-agent), RAG and observability.
4. Define metrics and mixed-method evaluation sets, run A/B tests, diagnose failures and optimise cost-performance with logging and monitoring.
5. Implement guardrails, human-in-the-loop review and controls for regulations such as GDPR, HIPAA and FedRAMP, and address bias, fairness and transparency.
6. Run structured discovery, communicate decisions and trade-offs, agree SLAs, document architectures and support every lifecycle phase.
7. Configure Claude Code for teams, improve developer workflows and resolve operational issues in Claude-powered systems.

## 2. Getting Started

### What you need

- A laptop with a current browser.
- An Anthropic API key (it starts with sk-ant-) with a few US dollars of credit, from the Claude Console.
- For Day 2: an AI coding tool that can create files and run commands (Claude Code, Codex, Cursor, Antigravity or similar). Python is installed for you by uv in Prompt 1.

### Open the simulator site

1. Open https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/
2. Paste your API key into the box in the left sidebar. Press Save, then Test. The page says the key works.
3. Pick a topic and a task statement in the sidebar. Each lab page has the question, the Simulate it live button, the live output and the explanation.

> **Your key stays with you.** The site keeps your key only in your own browser and sends it only to Anthropic. Every call uses claude-haiku-5-5; a whole lab usually costs under one US cent. Never paste your key into a chat or commit it to git.

### How each lab runs

1. Read the task statement and the question. Pick A, B, C or D: the page tells you at once whether it is right, and why.
2. Press Simulate it live. The first method (the tempting trap) runs on real Claude calls. The run pauses and shows its outcome.
3. Press Proceed. The fix runs on the same input.
4. Read Claude's final output and The observation explained: both methods side by side, turn by turn, with checks on what Claude actually did.
5. Open See the full code this lab runs, and find the lines that make the difference.

Every lab also has a folder in the repository (https://github.com/tertiarycourses/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/tree/main/labs) with a README and a PDF. Labs 1 to 38 add a one-click script that runs the same lab in a terminal (node docs/tools/test_lab.mjs N, with your key in a .env file); Labs 39 to 41 add a working solution.

## 3. The Six Simulators

The CCAR-P exam guide names no fixed scenarios. The course uses six fictional enterprise scenarios that together cover every domain. The companies, people and records are invented; Claude is real.

### Simulator 1: Harbour Mutual Claims Desk

**An agent that can pay out claims. Design it so it only pays the right ones.** Harbour Mutual Insurance is replacing its first-line motor-claims triage with a Claude-based claims agent. The agent reads policies and claims, requests damage assessments, drafts customer letters, and can approve payouts or escalate to a human adjuster. Adjusters, the finance controller and the regulator all have a stake in how it is built. Claims arrive as free-text forms, photos and repair quotes.

Labs on this simulator: Lab 2 (task 1.2), Lab 3 (task 1.3), Lab 4 (task 1.4), Lab 9 (task 2.3), Lab 12 (task 3.1), Lab 24 (task 4.5), Lab 27 (task 5.2).

### Simulator 2: Northwind Policy Assistant

**Ten thousand pages of policy. Every answer cites the page it came from.** Northwind Bank's 4,000 staff ask an internal assistant about lending, compliance and HR policy. The answers come from a retrieval-augmented generation (RAG) pipeline over the bank's policy library, which is re-indexed every week as policies change. Wrong answers carry regulatory risk, so every answer must cite its source, and questions the library does not cover must be declined.

Labs on this simulator: Lab 11 (task 2.5), Lab 13 (task 3.2), Lab 16 (task 3.5), Lab 17 (task 3.6), Lab 20 (task 4.1), Lab 23 (task 4.4).

### Simulator 3: Meridian Clinical Notes

**Summaries that save clinicians time, without leaking a single patient record.** Meridian Health, a US hospital group, uses Claude to draft discharge summaries and referral letters from clinicians' visit notes. The notes contain protected health information (PHI) under HIPAA, and every draft is signed off by a clinician before it leaves the hospital. Accuracy, privacy and an audit trail matter more than speed.

Labs on this simulator: Lab 5 (task 1.5), Lab 10 (task 2.4), Lab 21 (task 4.2), Lab 28 (task 5.3), Lab 29 (task 5.4).

### Simulator 4: Riverton Resident Services

**A public-sector assistant that treats every resident the same way.** Riverton City Council runs a resident-services assistant that answers questions about permits, waste collection and benefit eligibility, and pre-screens applications for caseworkers. It must run in an authorised government cloud environment, handle residents' personal data under data-protection law, explain its decisions in plain language, and give the same quality of answer to every resident, whatever their language or background.

Labs on this simulator: Lab 7 (task 2.1), Lab 8 (task 2.2), Lab 14 (task 3.3), Lab 26 (task 5.1), Lab 30 (task 5.5).

### Simulator 5: Lumen Retail Engagement

**The architect's job before and after the build: discovery, decisions, handoff.** You are the Claude solution architect engaged by Lumen Retail, a 300-store retailer, to deliver an AI product-support assistant. You run discovery with the sponsor, store operations, IT security and legal; agree the service levels; record architecture decisions; hand the build to Lumen's own team; and run the system through monitoring and iteration after go-live. Claude helps you with each step.

Labs on this simulator: Lab 1 (task 1.1), Lab 6 (task 1.6), Lab 31 (task 6.1), Lab 32 (task 6.2), Lab 33 (task 6.3), Lab 34 (task 6.4), Lab 35 (task 6.5).

### Simulator 6: Kestrel Platform Team

**Forty engineers, one shared Claude Code setup, and production to keep running.** Kestrel Software's platform team is rolling Claude Code out to 40 engineers across four product squads, and runs Claude-powered features in production. The team owns the shared Claude Code configuration, the CI pipeline, the evaluation suite for each prompt change, and the on-call runbooks for incidents in Claude-powered services.

Labs on this simulator: Lab 15 (task 3.4), Lab 18 (task 3.7), Lab 19 (task 3.8), Lab 22 (task 4.3), Lab 25 (task 4.6), Lab 36 (task 7.1), Lab 37 (task 7.2), Lab 38 (task 7.3).

## 4. Topic 1: Solution Design & Architecture

Exam domain 1, 17% of the exam. From a business problem to the simplest Claude architecture that solves it, and proves it.

| Task | Task statement | Lab |
|---|---|---|
| 1.1 | Translate business problems into Claude-based AI solutions | 1 |
| 1.2 | Design end-to-end architectures (input → processing → output → feedback loops) | 2 |
| 1.3 | Select appropriate architectural patterns (workflow, agentic, augmented LLM) | 3 |
| 1.4 | Design multi-agent systems and orchestration strategies | 4 |
| 1.5 | Apply decomposition techniques for complex problem solving | 5 |
| 1.6 | Align solutions to business value pillars (efficiency, transformation, productivity, cost, performance SLAs) | 6 |

### 1.1 Frame the outcome first. The tier follows.

Task statement 1.1: **Translate business problems into Claude-based AI solutions.**

#### Key concepts for Lab 1

- **The task is the unit of design.** "Automate support" cannot be designed. Split it into tasks (product questions, stock checks, refunds) and give each its own owner: Claude, code or a person.
- **A success metric needs a baseline.** A success criterion names today's measured value, a numeric target and how it will be measured. Without the baseline nobody can show the solution worked.
- **Code for lookups and fixed rules.** Exact stock and price checks, arithmetic and fixed business rules belong in code or an API, which Claude may call. Claude handles judgement over language.
- **The simplest tier that meets the need.** Single call, augmented LLM (retrieval and tools), workflow, agent, multi-agent: each step up buys flexibility with cost, latency and variance. Start low.
- **Constraints are design inputs.** Answer time on the store tablet, SSO, no customer personal data, legal wording and the run-cost budget shape the design before any model is chosen.

A sponsor's request names a solution ("an agent"); the architect's first deliverable is the problem. Phase 1 behaves like a team that starts building before discovery: it designs from the request alone. The framing pass turns the request and the discovery data into an outcome, a success metric with a measured baseline and a numeric target, the constraints, and a split of the work: Claude for judgement over language (product questions from manuals), code for exact lookups (stock and price), people for decisions with authority (refunds). Only then is a tier chosen, and the simplest one that meets the frame wins. Phase 1 skips that step, so its tier is a guess (often the agent the request named) and its design has nothing measured to be judged against.

#### Lab 1: Grace asks for an agent: frame the problem before choosing the build

Simulator 5: Lumen Retail Engagement. Open https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=1. About 12 minutes.

**The question.** Lumen Retail's COO asks you for "an AI agent that handles store product support end to end" and wants a design by Friday. Discovery data already exists: 2,400 support calls a week, a 7.5-minute average handle time, and a call mix of product questions, stock and price checks, and refund decisions. Which first step best translates this request into a Claude solution?

- **A.** Frame the problem first: the business outcome, a success metric with today's baseline and a target, the constraints, and whether Claude, code or a person does each task; then pick the simplest tier.
- **B.** Build a prototype of the agent Grace asked for with every available tool, pilot it in ten stores, and derive the scope and the success measures from the feedback that store staff give during the pilot.
- **C.** Choose the most capable Claude model and a multi-agent architecture first, because product support spans many domains, then write the prompts and tools for each specialist agent.
- **D.** Build a general chat assistant over all of Lumen's documents and systems, and measure success by weekly active users and staff satisfaction scores after the first month.

**Run it.** Pick your answer. Press Simulate it live, read the paused outcome of the first method, press Proceed, then read the side-by-side comparison and the checks.

**What to look for.** The framed design drops to Claude with retrieval, stock checks in code and refunds with people, measured against a discovery baseline.

From our own run on Claude Haiku 5.5 (your wording will differ; the decisions and checks should match). This is an excerpt: wherever … appears, text has been shortened, and a line with only … marks lines left out:

```
Lumen Retail · Grace Lim (COO, sponsor): "We want an AI agent that handles store product support end to end.…
Discovery pack: 2,400 calls a week, 7.5-minute handle time, 62% product questions, 23% stock and price check…
== Phase 1 · solution first: design the agent Grace asked for from the request, before discovery
Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
  stop_reason: end_turn -> STOP: Claude has finished
Reply: {"pattern":"workflow","pattern_reason":"Store product questions fall into a fairly predictable set of…
Phase 1 design: pattern workflow · metric Share of store product support queries resolved without transfer t…
== PAUSE · Phase 1 finished: the request became the brief
   outcome: The design is **workflow**. Its success metric (Share of store product support queries resolved …
   proceed: Phase 2: a framing pass first (outcome, metric, constraints, who does what), then the design
== Phase 2 · frame the problem first, then design the simplest tier that meets the frame
    (frame pass) Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
      stop_reason: end_turn -> STOP: Claude has finished (the subagent returns its answer)
    (frame pass) answer: {"business_outcome":"Store staff get product, warranty, stock and price answers at …
Frame: outcome "Store staff get product, warranty, stock and price answers at the counter without waiting on…
    (design pass) Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
      stop_reason: end_turn -> STOP: Claude has finished (the subagent returns its answer)
    (design pass) answer: {"pattern":"augmented_llm","pattern_reason":"Product questions need language judge…
Phase 2 design: pattern augmented_llm · Product questions need language judgement over 1,900 manuals and the…
== Turns
turn 1: stop_reason=end_turn
(frame pass) turn 1: stop_reason=end_turn
(design pass) turn 1: stop_reason=end_turn
== Checks
…
```

> **Check your answer: A.** A sponsor's request names a solution; the architect's first deliverable is the problem. Framing turns the request and the discovery data into an outcome, a success metric with a measured baseline and a numeric target, the constraints, and a split of the work: Claude for product questions over the manuals, code for exact stock and price lookups, the store manager for refund decisions. The tier is chosen last, and the simplest one that meets the frame wins. In the lab that was Claude with retrieval, not an agent.

- **B** falls short: Building first lets the request set the scope, and success measures derived from pilot feedback have no baseline to be compared with.
- **C** falls short: Choosing the model and the architecture before the problem buys autonomy and cost before anyone knows they are needed.
- **D** falls short: Adoption and satisfaction are not the business outcome; nothing ties them to handle time or cost per call, so the value cannot be shown.

![Figure: Lab 1 on the simulator site, with the scenario board shown (trap and fix lanes).](LG-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep-v1.1-images/lab-01.png)

*Figure: Lab 1 on the simulator site, with the scenario board shown (trap and fix lanes).*

**Exam tip.** When a stem quotes a sponsor asking for a technology ("an agent", "multi-agent"), the best answer starts from the problem: outcome, baselined metric, constraints, then the least autonomous tier that meets them.

**Try this next.** Edit REQUEST in shared/d1-lumen.js so Grace asks for "a multi-agent system" and run again: Phase 1 tends to follow the request up the autonomy ladder, while Phase 2's tier does not move, because it comes from the frame. Then change the call mix so returns are 60% of calls and watch the frame give more work to people.

### 1.2 Validate, gate, and turn every review into a test.

Task statement 1.2: **Design end-to-end architectures (input → processing → output → feedback loops).**

#### Key concepts for Lab 2

- **Four stages, not three.** Input, processing and output are what you demo. The feedback stage (traces, human decisions, outcomes) is what lets the system improve, and it is what you operate.
- **Validate in code, after Claude.** Hard rules such as coverage, quote minus excess and payout authority are checked by code on every decision, independently of the model that produced it.
- **Gates fail closed.** If the validator fails, errors or cannot decide, the action gate sends the case to a person. It never executes by default.
- **Three loops, three clocks.** Repair one output (seconds), human review of risky cases (minutes), and offline improvement where failures become eval cases that gate the next change (days).

Input, processing and output are what you demo; the feedback loops are what you operate. Phase 1 executes whatever the model returns: one approval above the payout authority is paid, and because nothing is checked or recorded, the same mistake will happen again tomorrow. Phase 2 keeps the same model and prompt and wraps it: input checks before the call, an output validator in code after it (coverage, quote minus excess, authority), a single repair retry with the errors for fixable mistakes (seconds), an action gate that sends rule breaks to a human adjuster instead of executing them (minutes), and every adjuster decision stored as a labelled eval case for the next prompt or model change to be tested against (days). The validator fails closed: anything it cannot pass goes to a person.

#### Lab 2: $6,500 paid with no check: close the loop around the decision step

Simulator 1: Harbour Mutual Claims Desk. Open https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=2. About 12 minutes.

**The question.** Harbour Mutual's claims pipeline sends each claim and its policy to Claude, which returns a decision that the pipeline executes. Last week it paid a $6,500 claim, above the agent's $5,000 payout authority, and the team has no record of which decisions adjusters later reversed. Which change to the end-to-end architecture best addresses both problems?

- **A.** Add the $5,000 payout authority and the excess rule to the system prompt with worked examples, so that Claude refers large claims to an adjuster on its own initiative.
- **B.** Validate each decision in code against the payout rules, retry once with the errors, route anything still failing to an adjuster, and store each adjuster decision as a labelled eval case.
- **C.** Log every request and response to the observability store, and review a weekly sample of 50 decisions with the adjusters to agree the prompt changes for each release of the claims pipeline.
- **D.** Switch the decision step to a larger model with extended thinking, since the payout shows that the current model's reasoning about policy limits is not reliable enough.

**Run it.** Pick your answer. Press Simulate it live, read the paused outcome of the first method, press Proceed, then read the side-by-side comparison and the checks.

**What to look for.** The validator holds CLM-7815 for the adjuster, valid payouts still go through, and the adjuster's decision becomes an eval case.

From our own run on Claude Haiku 5.5 (your wording will differ; the decisions and checks should match). This is an excerpt: wherever … appears, text has been shortened, and a line with only … marks lines left out:

```
Harbour Mutual · claims CLM-7781 (Priya Nair, rear bumper $4,200), CLM-7790 (Daniel Okafor, total loss $18,6…
== Phase 1 · open loop: whatever the decision step returns is executed
    (decide CLM-7781) Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
      stop_reason: end_turn -> STOP: Claude has finished (the subagent returns its answer)
    (decide CLM-7781) answer: {"claim_id":"CLM-7781","decision":"approve","payout_amount":3700,"reason":"The…
CLM-7781: approve $3,700 → executed
    (decide CLM-7790) Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
      stop_reason: end_turn -> STOP: Claude has finished (the subagent returns its answer)
    (decide CLM-7790) answer: {"claim_id":"CLM-7790","decision":"decline","payout_amount":0,"reason":"The po…
CLM-7790: decline  → executed
    (decide CLM-7815) Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
      stop_reason: end_turn -> STOP: Claude has finished (the subagent returns its answer)
    (decide CLM-7815) answer: {"claim_id":"CLM-7815","decision":"approve","payout_amount":6500,"reason":"The…
CLM-7815: approve $6,500 → executed (unchecked rule breaks: authority)
== PAUSE · Phase 1 finished: open loop
   outcome: **CLM-7815 was paid $6,500**, above the $5,000 authority, with no check and no person in the pat…
   proceed: Phase 2: the same decision step inside a closed loop
== Phase 2 · closed loop: input checks, output validator, repair retry, action gate, feedback to the eval set
Input checks: 3/3 claims valid (claimant is the policyholder, policy active, quote present)
    (decide CLM-7781) Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
      stop_reason: end_turn -> STOP: Claude has finished (the subagent returns its answer)
    (decide CLM-7781) answer: {"claim_id":"CLM-7781","decision":"approve","payout_amount":3700,"reason":"The…
CLM-7781: validator passed → executed: approve $3,700
    (decide CLM-7790) Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
…
```

> **Check your answer: B.** The pipeline is open loop: whatever the model returns is executed, and nothing is learned. Closing the loop keeps the same model and prompt and adds stages around the call: checks before it, a validator in code after it (coverage, quote minus excess, payout authority), one repair retry for fixable errors (seconds), an action gate that sends rule breaks to a person and fails closed (minutes), and a feedback path that saves every adjuster decision as a labelled eval case for the next change to be tested against (days).

- **A** falls short: A prompt makes the referral more likely, but when it fails the decision still executes unchecked, and no feedback is captured.
- **C** falls short: Logging and sampling find problems after the money has gone; nothing stops a bad payout before it executes.
- **D** falls short: A larger model is still probabilistic and still unchecked, and the pipeline would still learn nothing from adjuster decisions.

![Figure: Lab 2 on the simulator site, with the scenario board shown (trap and fix lanes).](LG-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep-v1.1-images/lab-02.png)

*Figure: Lab 2 on the simulator site, with the scenario board shown (trap and fix lanes).*

**Exam tip.** When a stem says a system acts on model output and nothing is learned from it, choose the answer that checks the output in code before acting, routes failures to a person, and feeds those decisions back as test cases.

**Try this next.** Change CLM-7781's repair_quote in shared/d1-harbour.js to 5,800 and run it again: in Phase 1 it is paid unchecked; in Phase 2 it joins the adjuster queue and the eval set grows by one more case. Then delete the excess from the policy wording and see whether the validator's repair retry (loop A) catches a wrong amount.

### 1.3 If you can write the steps down, code runs them.

Task statement 1.3: **Select appropriate architectural patterns (workflow, agentic, augmented LLM).**

#### Key concepts for Lab 3

- **Workflow or agent: who owns the path.** In a workflow, code decides the next step, so every path can be listed and tested. In an agent, Claude decides at run time, so its behaviour varies between runs.
- **The augmented LLM.** A model with retrieval, tools and memory is the building block of both patterns. A workflow can call one at just the steps that need judgement.
- **Autonomy is a purchase.** An agent buys coverage of paths you cannot write down. You pay in tokens (each turn re-reads the conversation), latency, variance and auditability.
- **Rules and arithmetic in code.** Payout = the lower of quote and assessed cost, minus the excess; approve only within $5,000. Code computes and enforces these the same way every time.

Anthropic separates workflows, where code orchestrates the model and tools on predefined paths, from agents, where the model directs its own steps. Harbour Mutual's procedure is fixed and written down, so the agent buys nothing it needs: it pays in Claude calls and tokens (each turn re-reads the whole conversation), in a path that can vary between runs, and in an audit trail that can only be read after the fact. The workflow keeps the control flow, the arithmetic and the authority rule in code, and uses Claude as an augmented LLM at the two steps that need judgement over language. Reach for an agent when you cannot write the steps down in advance.

#### Lab 3: An eight-step claims procedure run as an agent: make it a workflow

Simulator 1: Harbour Mutual Claims Desk. Open https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=3. About 12 minutes.

**The question.** Harbour Mutual's motor claims follow a fixed, documented procedure: get the claim and policy, check cover, request an assessment above $2,000, check the description against the assessment, compute the payout, approve or escalate, and write the letter. The current build is a fully autonomous agent holding all six tools. Cost per claim is several times the forecast, and auditors cannot list the paths it may take. Which pattern best fits?

- **A.** Keep the agent but list the procedure as numbered steps in its system prompt and lower its turn limit, so that it follows the documented order at a lower cost per claim.
- **B.** Move to a multi-agent design in which a supervisor agent checks each step the claims agent takes against the procedure before it lets the next step run.
- **C.** Upgrade to the most capable Claude model, so that the agent plans the whole procedure in fewer turns and makes fewer mistakes in the order of its tool calls.
- **D.** Run the procedure as a workflow in code and call Claude only at the judgement steps: checking the description against the assessment, and writing the letter.

**Run it.** Pick your answer. Press Simulate it live, read the paused outcome of the first method, press Proceed, then read the side-by-side comparison and the checks.

**What to look for.** The workflow ran the eight steps in order with two Claude calls and a small fraction of the agent's input tokens.

From our own run on Claude Haiku 5.5 (your wording will differ; the decisions and checks should match). This is an excerpt: wherever … appears, text has been shortened, and a line with only … marks lines left out:

```
Harbour Mutual · CLM-7781: Priya Nair, rear bumper, quote $4,200, policy HM-POL-2201 (comprehensive, excess …
== Phase 1 · fully agentic: the claims agent chooses every step and tool in its own loop
Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
  stop_reason: tool_use -> CONTINUE: run the tool, append the result, call Claude again
  -> get_claim({"claim_id":"CLM-7781"})
  <- result: {"claim_id":"CLM-7781","policy_id":"HM-POL-2201","claimant":"Priya Nair","type":"own_damage","i…
Turn 2: POST /v1/messages · model claude-haiku-5-5 · 3 messages (tool results appended)
  stop_reason: tool_use -> CONTINUE: run the tool, append the result, call Claude again
  -> get_policy({"policy_id":"HM-POL-2201"})
  <- result: {"policy_id":"HM-POL-2201","holder":"Priya Nair","cover":"comprehensive","excess":500,"status":…
Turn 3: POST /v1/messages · model claude-haiku-5-5 · 5 messages (tool results appended)
  Claude: The policy is active and comprehensive cover includes accidental damage. The repair quote is $4,20…
  stop_reason: tool_use -> CONTINUE: run the tool, append the result, call Claude again
  -> request_assessment({"claim_id":"CLM-7781"})
  <- result: {"assessment_id":"AS-3302","claim_id":"CLM-7781","assessor":"Coastline Loss Assessors","assesse…
Turn 4: POST /v1/messages · model claude-haiku-5-5 · 7 messages (tool results appended)
  Claude: The assessment matches the claim: cracked bumper, a damaged sensor bracket, and paint transfer con…
  stop_reason: tool_use -> CONTINUE: run the tools, append the results, call Claude again
  -> approve_payout({"claim_id":"CLM-7781","amount":3650})
  <- result: {"approved":true,"claim_id":"CLM-7781","amount":3650}
  -> draft_letter({"claim_id":"CLM-7781","text":"Dear Priya Nair, your claim CLM-7781 for rear bumper and pa…
  <- result: {"saved":true}
Turn 5: POST /v1/messages · model claude-haiku-5-5 · 9 messages (tool results appended)
  stop_reason: end_turn -> STOP: Claude has finished
…
```

> **Check your answer: D.** Anthropic distinguishes workflows, where code orchestrates the model and tools along predefined paths, from agents, where the model directs its own steps. A procedure you can write down needs no autonomy. The workflow makes every path enumerable and auditable, keeps the arithmetic and the $5,000 authority rule in code, and uses Claude as an augmented LLM only where judgement over language is needed. In the lab it used two Claude calls and a small fraction of the agent's input tokens for the same payout.

- **A** falls short: The prompt makes the order more likely, but the model still owns the control flow, so cost varies and the paths still cannot be listed in advance.
- **B** falls short: A supervisor adds calls and cost to police a sequence that code could simply run.
- **C** falls short: A larger model costs more per token and still chooses its path at run time; it fixes neither cost nor auditability.

![Figure: Lab 3 on the simulator site, with the scenario board shown (trap and fix lanes).](LG-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep-v1.1-images/lab-03.png)

*Figure: Lab 3 on the simulator site, with the scenario board shown (trap and fix lanes).*

**Exam tip.** "Fixed", "documented" or "known sequence" in a stem points to a workflow. Keep agents for tasks whose steps you cannot write down in advance.

**Try this next.** Run the lab two or three times and compare Phase 1's tool order and turn count between runs: the agent's path is a distribution you sample, while Phase 2's audit trail never changes. Then change ASSESSMENT.findings to say the paint transfer is from a front impact: only the judgement step changes its answer, and the workflow escalates.

### 1.4 Specialists find. One coordinator decides.

Task statement 1.4: **Design multi-agent systems and orchestration strategies.**

#### Key concepts for Lab 4

- **When multi-agent pays.** Anthropic names three cases: context pollution, parallel lines of inquiry, and specialisation (narrower tools or conflicting instructions). Elsewhere, coordination costs more than it returns.
- **Split by the context needed.** Give each subagent only the data its job needs: the policy wording for coverage, the assessment for damage, the invoice registry for fraud.
- **Findings, not actions.** Subagents return structured findings (status, amount, evidence) and hold no tool that changes anything. Only the coordinator acts.
- **Reconcile before acting.** The coordinator applies one explicit rule across all findings, for example that any flag goes to an adjuster, before the single decision.
- **More agents, more tokens.** Each subagent is another context window and more calls, so cost and latency rise. Split only where that buys accuracy or coverage.

Splitting an overloaded agent is worth it when the work needs different contexts: the policy wording, the assessment and a 30-row invoice registry are mostly noise to each other. But a split creates the orchestration question: who decides? In Phase 1 every specialist can act, so each acts on a partial view; the coverage agent pays a claim the fraud agent is escalating, and no step ever sees both results. In Phase 2 the specialists only find: each returns a structured finding (status, amount, evidence) and holds no tool that changes anything. The coordinator reconciles the findings with one rule (any flag goes to a person) and makes the only payout decision. More agents cost more calls and tokens, so split only where contexts pollute each other or the work runs in parallel, and always say where the results meet.

#### Lab 4: Paid and escalated at once: specialists find, a coordinator decides

Simulator 1: Harbour Mutual Claims Desk. Open https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=4. About 12 minutes.

**The question.** Harbour Mutual's single claims agent has grown to 14 tools and one long prompt covering coverage, damage assessment and fraud screening. The team will split it into coverage, damage and fraud specialists, each given only the part of the claim file it needs. Which orchestration strategy is best?

- **A.** Run the three specialists as peer agents in parallel, each authorised to approve the payout or escalate the claim within its own remit, so that claims settle faster.
- **B.** Keep one agent, but move the fraud-screening instructions to the top of its prompt and add a rule that it must finish every check before it calls approve_payout.
- **C.** Have a coordinator spawn the specialists as subagents that return structured findings and hold no action tools, then reconcile the findings before one payout decision.
- **D.** Chain the specialists in sequence, coverage then damage then fraud, each passing its complete transcript to the next one, so that the fraud agent has seen everything before it acts.

**Run it.** Pick your answer. Press Simulate it live, read the paused outcome of the first method, press Proceed, then read the side-by-side comparison and the checks.

**What to look for.** The coordinator read three findings, saw the fraud flag on invoice RQ-5531, and made one decision: escalate, nothing paid.

From our own run on Claude Haiku 5.5 (your wording will differ; the decisions and checks should match). This is an excerpt: wherever … appears, text has been shortened, and a line with only … marks lines left out:

```
Harbour Mutual · CLM-7781: Priya Nair, rear bumper, quote $4,200 from Bayside Panel Works, invoice RQ-5531. …
== Phase 1 · peer specialists: the lead agent fans out to coverage, damage and fraud agents that may each se…
Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
  stop_reason: tool_use -> CONTINUE: run the tools, append the results, call Claude again
  -> Agent({"remit":"coverage","prompt":"New claim CLM-7781 under policy HM-POL-2201. Repairing garage: Bays…
    (peer coverage) Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
      stop_reason: tool_use -> CONTINUE: run the tool, append the result, call Claude again
      -> approve_payout({"claim_id":"CLM-7781","amount":3650})
      <- result: {"approved":true,"claim_id":"CLM-7781","amount":3650}
    (peer coverage) Turn 2: POST /v1/messages · model claude-haiku-5-5 · 3 messages (tool results appended)
      stop_reason: end_turn -> STOP: Claude has finished (the subagent returns its answer)
    (peer coverage) answer: **Coverage determination for CLM-7781 (policy HM-POL-2201):** Covered, and I app…
  <- result: **Coverage determination for CLM-7781 (policy HM-POL-2201):** Covered, and I approved a payout …
  -> Agent({"remit":"damage","prompt":"New claim CLM-7781 under policy HM-POL-2201. Repairing garage: Baysid…
    (peer damage) Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
      stop_reason: tool_use -> CONTINUE: run the tool, append the result, call Claude again
      -> approve_payout({"claim_id":"CLM-7781","amount":4150})
      <- result: {"approved":true,"claim_id":"CLM-7781","amount":4150}
    (peer damage) Turn 2: POST /v1/messages · model claude-haiku-5-5 · 3 messages (tool results appended)
      stop_reason: end_turn -> STOP: Claude has finished (the subagent returns its answer)
    (peer damage) answer: I approved a payout of US$4,150 on CLM-7781, the independently assessed repair cos…
  <- result: I approved a payout of US$4,150 on CLM-7781, the independently assessed repair cost, which is U…
  -> Agent({"remit":"fraud","prompt":"New claim CLM-7781 under policy HM-POL-2201. Repairing garage: Bayside…
    (peer fraud) Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
…
```

> **Check your answer: C.** A split is worth it when the work needs different contexts, but it raises the orchestration question: where do the results meet? Subagents that only find, each with its own slice of the claim file and no tool that changes anything, return structured findings (status, amount, evidence). One coordinator reconciles them with an explicit rule (any flag goes to a person) and makes the only payout decision, so no specialist can act on a partial view.

- **A** falls short: Each peer acts on a partial view: in the lab one approved a payout while the fraud agent escalated the same claim, and nothing reconciled them.
- **B** falls short: It keeps the overloaded context and the payout power in one place, and relies on a sentence in the prompt to enforce the order.
- **D** falls short: Passing whole transcripts forward rebuilds one crowded context and adds latency, and detail is lost or distorted at each handoff.

![Figure: Lab 4 on the simulator site, with the scenario board shown (trap and fix lanes).](LG-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep-v1.1-images/lab-04.png)

*Figure: Lab 4 on the simulator site, with the scenario board shown (trap and fix lanes).*

**Exam tip.** In a multi-agent stem, ask where the results meet before anything acts. Prefer read-only subagents returning structured findings to one coordinator over peers that can each act.

**Try this next.** Change the duplicate row in shared/d1-claimfile.js to a fresh invoice number and run it again: in Phase 2 the fraud finding comes back clear and the coordinator approves the coverage subagent's $3,650. Then give the Phase 2 subagents the approve_payout tool as well and watch the reconciliation stop mattering.

### 1.5 Local passes first. Reconcile globally second.

Task statement 1.5: **Apply decomposition techniques for complex problem solving.**

#### Key concepts for Lab 5

- **Decomposing trades difficulty for count.** Each piece gets easier, but every extra step is another place an error can enter. A split pays when it makes each piece reliably right and checkable.
- **Cut at narrow, checkable seams.** Pass a small structured artefact between steps (the medication JSON), not everything the next step might need. A seam you can validate is one you can trust.
- **Local first, global second.** Section passes each see only their own evidence; a reconciliation step then checks the facts that span sections.
- **Read stop_reason first.** A call that hits max_tokens stops mid-response, and with adaptive thinking the planning counts toward that budget too. Check stop_reason before using the output.

A discharge pack is several jobs that share one record: a medication reconciliation that must follow the last order for each drug, a clinical narrative for clinicians, an action list for the GP and plain-English instructions for the patient. One giant prompt makes the model plan and write all of them at once under one output budget and one blended set of rules, so it either runs out (stop_reason max_tokens) or lets a section slip. Decomposition cuts at narrow seams: the medication pass returns structured JSON, and the GP and patient passes read that JSON instead of the raw notes. Every seam is checkable, so code validates each section against its own rules and the cross-section facts, and a failing section is repaired on its own. The cost is more calls and a design to maintain: cut where the output can be checked.

#### Lab 5: One prompt for the whole discharge pack runs out: split and reconcile

Simulator 3: Meridian Clinical Notes. Open https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=5. About 12 minutes.

**The question.** Meridian Health generates a discharge pack from clinicians' notes: a medication reconciliation, a clinical summary, actions for the GP, and plain-English instructions for the patient, each with its own rules. One prompt writes the whole pack in a single call. It often stops at max_tokens, and when it finishes, a section often breaks its rules, so the whole call is rerun. Which approach best fixes this?

- **A.** Write each section in its own pass with only its notes and rules, feed the medication JSON to the later passes, then validate every section and the shared facts in code.
- **B.** Raise max_tokens to the model's maximum and add a reminder at the end of the prompt that every section's rules must be followed, so that one call completes the whole pack.
- **C.** Move the single call to a larger model with a longer output limit, since a stronger model can plan six sections for three readers within one response.
- **D.** Ask Claude to review its own pack at the end of the same call and to rewrite any section that breaks a rule before it returns the final version to the clinician.

**Run it.** Pick your answer. Press Simulate it live, read the paused outcome of the first method, press Proceed, then read the side-by-side comparison and the checks.

**What to look for.** All four section passes ended with end_turn, and the reconciled pack passed every rule, with all 7 medications matching their last order.

From our own run on Claude Haiku 5.5 (your wording will differ; the decisions and checks should match). This is an excerpt: wherever … appears, text has been shortened, and a line with only … marks lines left out:

```
Meridian Health · Patient Patient A, MRN 00-4417, admitted 2026-11-10, discharged 2026-11-14. 20 notes: 8 cl…
The medication story: metformin and ramipril withheld for AKI; amoxicillin stopped for a rash (penicillin al…
== Phase 1 · one giant prompt: the whole discharge pack, every section's rules, in one call
Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
  stop_reason: max_tokens -> STOP: Claude has finished
Phase 1: stop_reason max_tokens · no usable JSON · 1 problem: no usable pack (stop_reason max_tokens)
== PAUSE · Phase 1 finished: one call for the whole pack
   outcome: **stop_reason: max_tokens.** The call spent its 4,096-token budget planning six sections for thr…
   proceed: Phase 2: one pass per section group, then reconcile in code
== Phase 2 · section passes (local), then a reconciliation step in code (global), one repair per failing sec…
    (section: medications + allergies) Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
      stop_reason: end_turn -> STOP: Claude has finished (the subagent returns its answer)
    (section: medications + allergies) answer: {"medications":[{"drug":"Amoxicillin (IV)","dose":"1 g","freq…
    (section: diagnoses, course, pending) Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
      stop_reason: end_turn -> STOP: Claude has finished (the subagent returns its answer)
    (section: diagnoses, course, pending) answer: {"diagnoses":["Community-acquired pneumonia, right lower l…
    (section: GP actions) Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
      stop_reason: end_turn -> STOP: Claude has finished (the subagent returns its answer)
    (section: GP actions) answer: {"gp_actions":["Arrange U&E (urea and electrolytes) blood test in 1 week t…
    (section: patient instructions) Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
      stop_reason: end_turn -> STOP: Claude has finished (the subagent returns its answer)
    (section: patient instructions) answer: {"patient_instructions": "Take these medicines. Doxycycline, one…
Reconcile (code): patient instructions: patient_instructions is 148 words (rule: under 120)
    (repair: patient instructions) Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
…
```

> **Check your answer: A.** A discharge pack is several jobs that share one record, each for a different reader with different rules. Decomposition gives each pass less to plan and less to read, and cuts at narrow seams: the medication pass returns structured JSON that the GP and patient passes read instead of the raw notes. Every seam can be checked, so code validates each section against its own rules and the facts that span sections, and only a failing section is repaired.

- **B** falls short: A bigger budget may let the call finish, but every section still shares one blended set of rules, and one failing section still means rerunning the whole pack.
- **C** falls short: A larger model costs more and still produces one block with no checkable seams between the sections.
- **D** falls short: Self-review in the same call spends more of the same budget and is not an independent check; a failure still means a full rerun.

![Figure: Lab 5 on the simulator site, with the scenario board shown (trap and fix lanes).](LG-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep-v1.1-images/lab-05.png)

*Figure: Lab 5 on the simulator site, with the scenario board shown (trap and fix lanes).*

**Exam tip.** When one prompt does several jobs for different readers, look for the answer that splits at checkable seams (structured outputs) and adds a reconciliation step, not for a bigger budget or a bigger model.

**Try this next.** Raise BUDGET to 16000 and run it again: Phase 1 now usually finishes, but compare its patient instructions with the rules in RULE.patient and count the problems the reconciler lists. Then delete the ramipril line from note N15 in shared/d1-meridian.js: the medication pass reports ramipril 5 mg unchanged, and the reconciler names that exact problem.

### 1.6 Fund an outcome you can measure, not a model.

Task statement 1.6: **Align solutions to business value pillars (efficiency, transformation, productivity, cost, performance SLAs).**

#### Key concepts for Lab 6

- **Five value pillars.** Efficiency, productivity, transformation, cost and performance SLAs. They pull a design in different directions, so name the primary one.
- **Each pillar has its own metric.** Efficiency: handle time or cost per task. Productivity: output per person. Transformation: something not possible before. Cost: total cost of ownership.
- **SLAs a model can keep.** Availability, p95 latency, answer accuracy on a fixed test set and time to escalate, each with a number and a measurement method, not "fast" and "accurate".
- **Cost per resolved answer.** Price tokens per answer from the list prices (Haiku 5.5 $0.10/$0.50 per million tokens), add review cost, and compare with today's cost per call.

A board does not fund a model; it funds an outcome it can measure. The value pillars (efficiency, productivity, transformation, cost, performance SLAs) pull a design in different directions, so the architect names the primary one and expresses it as metrics with a measured baseline and a target. Performance becomes service levels a non-deterministic system can actually be held to: availability, p95 latency, answer accuracy on a test set, and time to escalate, each with a number and a way to measure it. Model choice then follows from cost per resolved answer and the latency target, not from which model is newest. The independent extractor makes the difference visible: the same audit, run on both documents, finds the commitments the value case makes and the capability pitch never does.

#### Lab 6: A board pitch with no numbers: sell the value pillar and the SLAs

Simulator 5: Lumen Retail Engagement. Open https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=6. About 12 minutes.

**The question.** Lumen Retail's board paper for the store product-support assistant is in draft. It leads with the technology: the Claude models, retrieval over every product manual, and what the system can do. The COO says the board will ask what it is buying and how it will know the service is working. Which revision best aligns the solution to business value?

- **A.** Add a table comparing the chosen model's benchmark scores with competing models, so that the board can see that Lumen is buying the most capable AI technology on the market.
- **B.** Replace the technology section with quotes from staff in the pilot stores and a list of questions the assistant answered well, to show that staff enjoy using it.
- **C.** Promise a 50% cut in support costs and full automation of product support within six months, so that the board has one clear, ambitious headline figure to approve and track.
- **D.** Name the primary value pillar, give metrics with today's baselines and targets, commit to SLAs for availability, p95 latency, accuracy and escalation, and price each answer.

**Run it.** Pick your answer. Press Simulate it live, read the paused outcome of the first method, press Proceed, then read the side-by-side comparison and the checks.

**What to look for.** The value case anchors its metrics to 7.5 minutes and $11.40 and commits to all four service levels with a number and a measurement method.

From our own run on Claude Haiku 5.5 (your wording will differ; the decisions and checks should match). This is an excerpt: wherever … appears, text has been shortened, and a line with only … marks lines left out:

```
Lumen Retail · Grace Lim (COO, sponsor): "We want an AI agent that handles store product support end to end.…
Price table (code): Haiku 5.5 $0.0008/answer · Sonnet 5.5 $0.0160/answer · Opus 5.5 $0.0320/answer · Fable 5…
== Phase 1 · capability pitch: the board summary leads with what makes the solution advanced
Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
  stop_reason: end_turn -> STOP: Claude has finished
Reply: **Executive summary: AI-assisted product support for store staff** Store staff currently phone head-o…
    (audit: capability pitch) Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
      stop_reason: end_turn -> STOP: Claude has finished (the subagent returns its answer)
    (audit: capability pitch) answer: {"primary_pillar":"efficiency","commitments":[{"metric":"Share of curr…
Audit of the pitch: primary pillar efficiency · 2 commitments · 0 anchored to a discovery baseline · service…
== PAUSE · Phase 1 finished: the capability pitch
   outcome: The audit found **0 of 4 service levels** with a number and **0 value metrics** anchored to a di…
   proceed: Phase 2: the same solution written as a value case
== Phase 2 · value case: primary pillar, metrics with baselines, four service levels, model priced per answer
Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
  stop_reason: end_turn -> STOP: Claude has finished
Reply: {"primary_pillar":"efficiency","pillar_reason":"The main value is fewer head-office agent minutes per…
Value case: pillar efficiency · 3 value metrics · 4 service levels · model Claude Sonnet 5.5
Cost in code: Claude Sonnet 5.5 at $0.0160 per answer × 6,448 answers ≈ $103.17 a month in model spend, agai…
    (audit: value case) Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
      stop_reason: end_turn -> STOP: Claude has finished (the subagent returns its answer)
    (audit: value case) answer: {"primary_pillar":"efficiency","commitments":[{"metric":"Head-office support…
Audit of the value case: primary pillar efficiency · 7 commitments · 3 anchored to a discovery baseline · se…
== Turns
…
```

> **Check your answer: D.** A board funds an outcome it can measure, not a model. The architect names the primary value pillar (efficiency, productivity, transformation, cost or performance), expresses it as metrics with a measured baseline and a target, and turns performance into service levels a non-deterministic system can be held to: availability, p95 latency, answer accuracy on a test set and time to escalate, each with a number and a measurement method. The model is then chosen by cost per resolved answer and the latency target.

- **A** falls short: Benchmark scores describe the model, not Lumen's outcome; the board still has nothing to hold the service to after go-live.
- **B** falls short: Anecdotes show that people like it, not that handle time or cost moved; nothing is measured against a baseline.
- **C** falls short: A headline promise with no baseline, method or service levels cannot be checked, and "full automation" ignores the tasks that stay with people.

![Figure: Lab 6 on the simulator site, with the scenario board shown (trap and fix lanes).](LG-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep-v1.1-images/lab-06.png)

*Figure: Lab 6 on the simulator site, with the scenario board shown (trap and fix lanes).*

**Exam tip.** When a stem's draft leads with the model or its features, pick the answer that names a value pillar, baselined metrics and measurable SLAs; reject benchmark tables, anecdotes and unmeasured promises.

**Try this next.** Change PER_QUERY.calls in shared/d1-lumen.js to 15 (a multi-agent design) and run it again: the cost per answer in the table rises fifteen-fold, and Phase 2's model reasoning has to justify it against the same $11.40 baseline. Then remove the 10-second requirement from the discovery pack and see whether Phase 2's p95 latency target changes.

### Topic 1 summary

| Task | Rule of thumb |
|---|---|
| 1.1 | Frame the outcome first. The tier follows. |
| 1.2 | Validate, gate, and turn every review into a test. |
| 1.3 | If you can write the steps down, code runs them. |
| 1.4 | Specialists find. One coordinator decides. |
| 1.5 | Local passes first. Reconcile globally second. |
| 1.6 | Fund an outcome you can measure, not a model. |

## 5. Topic 2: Claude Models, Prompting & Context Engineering

Exam domain 2, 13% of the exam. The right model, a prompt with structure, and only the context the task needs.

| Task | Task statement | Lab |
|---|---|---|
| 2.1 | Select appropriate Claude models based on trade-offs | 7 |
| 2.2 | Design system prompts, templates, and guardrails | 8 |
| 2.3 | Apply prompt engineering techniques (zero-shot, few-shot, chain-of-thought) | 9 |
| 2.4 | Optimize context windows and manage token usage | 10 |
| 2.5 | Implement prompt reuse strategies (caching, modular prompts, Skills) | 11 |

### 2.1 Pay for capability only where the task needs it.

Task statement 2.1: **Select appropriate Claude models based on trade-offs.**

#### Key concepts for Lab 7

- **The Claude model tiers.** Fable 5.2, Opus 5.5, Sonnet 5.5 and Haiku 5.5 all have a 1M-token context. They differ in price (US$8/40 down to US$0.10/0.50 per million tokens), latency and ceiling.
- **Cost per completed task.** Compare models on your own eval: tokens times price, divided by the share of tasks solved, plus the cost of cleaning up failures. Price per token alone misleads.
- **Routing by task difficulty.** A cheap classifier sends each request to the least capable model that passes for that kind of task: lookups and extraction go small, multi-step reasoning goes up.
- **Quality per route.** Grade every route on its own eval cases. A blended score can hide a route that fails, so check each slice before moving traffic to a cheaper model.
- **Effort and thinking are levers too.** Within one model, lower effort or thinking switched off cuts output tokens and latency on simple tasks. Tuning effort is often a better lever than changing model.

Model choice is a trade-off between quality, latency and cost, judged per task, not per application. Most of Riverton's traffic is one-fact lookups (a bin day, a permit status) that the smallest model answers correctly in any of the four languages; a minority are benefit pre-screens that apply several rules to a resident's own numbers. Sending everything to the most capable model buys quality the lookups do not need at up to 40 times the price. A cheap router that sends each question to the least capable model that passes, with every route measured on its own eval cases, keeps quality where it matters and puts the money there. Price per completed task, not per token: a route that is cheap but fails costs more once the failures are cleaned up.

#### Lab 7: Every question at Opus prices: route by difficulty, grade each route

Simulator 4: Riverton Resident Services. Open https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=7. About 12 minutes.

**The question.** Riverton City Council's resident assistant sends every question to Claude Opus 5.5. Its logs show that 80% of questions are one-fact lookups (bin days, permit status) in four languages, and 20% are benefit pre-screens that apply several eligibility rules to a resident's own figures. The model bill is now well over budget. Which approach best balances answer quality and cost?

- **A.** Move all traffic to Claude Haiku 5.5, the cheapest tier, because most resident questions are simple lookups.
- **B.** Route each question by task difficulty, Haiku for lookups and Sonnet for pre-screens, and evaluate each route.
- **C.** Keep Claude Opus 5.5 for every question, but lower max_tokens so that each answer costs less to generate.
- **D.** Move all traffic to Claude Fable 5.2, whose higher accuracy means fewer failed answers need a costly human follow-up.

**Run it.** Pick your answer. Press Simulate it live, read the paused outcome of the first method, press Proceed, then read the side-by-side comparison and the checks.

**What to look for.** Opus for everything answers all eight correctly at several times the budget; routing keeps every route correct at a quarter to a third of the cost.

From our own run on Claude Haiku 5.5 (your wording will differ; the decisions and checks should match). This is an excerpt: wherever … appears, text has been shortened, and a line with only … marks lines left out:

```
Riverton Resident Services: an eval set of 8 questions (6 lookups, 2 benefit pre-screens) in English, Malay,…
This lab calls only claude-haiku-5-5. Bigger tiers are priced from their list prices, never called.
== Phase 1 · one model for everything: every question at the top tier (priced at Claude Opus 5.5)
  (Answered in two batches, lookups then pre-screens, to keep the lab cheap. Every question goes to the same…
  ok    Q1 (English) [top tier]: In Zone 3, general waste is collected on Wednesday. Collection starts at 7a…
  ok    Q2 (Malay) [top tier]: Tong kitar semula di Zon 1 dikutip pada hari Khamis. Collection starts at 7am…
  ok    Q3 (English) [top tier]: Permit PRM-2231 for the street party on Elm Close on 14 December 2026 is st…
  ok    Q4 (Chinese) [top tier]: 许可证 PRM-2244（18 Mill Lane 外路边的废料箱）有效期至2026年12月15日。
  ok    Q5 (Tamil) [top tier]: மண்டலம் 2 இல் பொதுக் கழிவுகள் செவ்வாய்க்கிழமை சேகரிக்கப்படும். சேகரிப்பு காலை…
  ok    Q6 (English) [top tier]: Each household gets 2 free bulky item collections per year. After that, eac…
  usage: input_tokens 1370 · output_tokens 984
  ok    Q7 (English) [top tier] pre_screen=met: Yes, you pass the pre-screen. Counted income: US$3,700 minus…
  ok    Q8 (English) [top tier] pre_screen=not_met: No, you do not pass the pre-screen yet. Counted income: …
  usage: input_tokens 1353 · output_tokens 1208
  One lookup's tokens at each tier's list price: Claude Fable 5.2 US$0.0084 · Claude Opus 5.5 US$0.0042 · Cl…
== PAUSE · Phase 1 finished: one model for everything
   outcome: **8/8** answers correct on the key, at Opus 5.5 prices **US$0.0042 a lookup** and **US$0.0148 a …
   proceed: Phase 2: a Haiku router sends lookups to Haiku and pre-screens to Sonnet, graded per route
== Phase 2 · route by task difficulty: Haiku router → Haiku route (lookups) or Sonnet route (pre-screens)
  Router: haiku ← Q1, Q2, Q3, Q4, Q5, Q6 · sonnet ← Q7, Q8 · input_tokens 831 · output_tokens 147
  ok    Q1 (English) [haiku route]: General waste is collected on Wednesdays in Zone 3. Put your bin out the…
  ok    Q2 (Malay) [haiku route]: Kitar semula di Zon 1 dikutip pada hari Khamis. Letakkan tong anda di luar…
  ok    Q3 (English) [haiku route]: Permit PRM-2231 for the street party on Elm Close on 14 December 2026 is…
  ok    Q4 (Chinese) [haiku route]: 许可证 PRM-2244（18 Mill Lane 外道路上的垃圾箱）有效期至 2026 年 12 月 15 日。
…
```

> **Check your answer: B.** Model choice is a trade-off made per task, not per application. One-fact lookups are well within Haiku 5.5's ability in every language Riverton serves, at a fortieth of Opus 5.5's price; the multi-rule pre-screens justify a stronger tier. A cheap router sends each question to the least capable model that passes for that kind of task, and each route is graded on its own eval cases before traffic moves, so the saving does not come at the cost of quality where quality matters.

- **A** falls short: Haiku for everything ignores the 20% of multi-rule pre-screens, and nothing measures whether it handles them.
- **C** falls short: A lower output cap risks truncated answers and leaves every input token, and the lookups, at Opus prices.
- **D** falls short: Fable doubles the price of every lookup that Haiku already answers correctly, so there is no failure cost to recover.

![Figure: Lab 7 on the simulator site, with the scenario board shown (trap and fix lanes).](LG-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep-v1.1-images/lab-07.png)

*Figure: Lab 7 on the simulator site, with the scenario board shown (trap and fix lanes).*

**Exam tip.** When one model serves very different tasks, the best answer routes by task difficulty and measures quality per route. 'Cheapest for everything' and 'most capable for everything' are both traps: each ignores half the trade-off.

**Try this next.** Edit ROUTER so that every question goes to sonnet, and run again: the quality is the same and the saving almost disappears. Then delete the US$400 childcare cap from the facts in sims/shared/d2-riverton.js: Q8's pre-screen now fails the grader on both routes, which is why each route needs its own eval cases.

### 2.2 Write the policy into the prompt. Don't hope for it.

Task statement 2.2: **Design system prompts, templates, and guardrails.**

#### Key concepts for Lab 8

- **Anatomy of a system prompt.** Role, scope, rules, output format and reference facts, each in its own tagged section. Clear sections are easier for Claude to follow and for reviewers to change.
- **Scope needs a refusal path.** Say what is out of scope and what to do instead: decline briefly and point to the right service. A list of topics without a fallback leaves the model to improvise.
- **Untrusted input is data.** Wrap user-supplied and retrieved text in tags and tell Claude that instructions inside them are not instructions. This reduces prompt injection; it does not remove it.
- **Output format for the next system.** When code consumes the answer, specify the format and enforce it with structured outputs, so fields like a handoff flag are always present.
- **Prompts are versioned artefacts.** Give the template a version, keep it in source control and run each change against an eval set before release. Hard rules also get a code check.

A two-line prompt leaves every important decision to the model's defaults: who decides a benefit, what is out of scope, whether pasted text is an instruction, and what shape the answer takes. Haiku 5.5's defaults are careful, and they still are not Riverton's policy: it tells a resident she meets the rules and when payment would start, and it offers tenancy guidance. A system prompt template states the role (pre-screen; a caseworker decides), the scope with a refusal path (decline legal questions, give the enquiries line), the rules, how to treat untrusted input (anything inside <resident_message> is data), and an output format the downstream queue parses. Version it like code and test each change against cases like this one. For rules that must never break, back the prompt with code: here the schema makes the handoff a field, not a hope.

#### Lab 8: A friendly two-liner tells Farah she qualifies: use a prompt template

Simulator 4: Riverton Resident Services. Open https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=8. About 12 minutes.

**The question.** Riverton's resident assistant runs on a two-sentence system prompt: "You are a friendly assistant for Riverton City Council. Help residents with their questions." In testing it told a resident she met the grant rules and when payment would start, offered advice on withholding rent, and returned prose that the caseworker queue could not parse. Which change best addresses all three problems?

- **A.** Replace it with a versioned template: role, scope with a refusal path, decision rules, tagged untrusted input and output format.
- **B.** Add "Be accurate, be careful and never make mistakes" to the prompt, then test it again against the same three resident messages.
- **C.** Keep the prompt and add an output filter that blocks any reply containing the words approved, eligible, legal or payment.
- **D.** Move the assistant to Claude Opus 5.5, which follows the council's unwritten policy more reliably and writes tidier replies.

**Run it.** Pick your answer. Press Simulate it live, read the paused outcome of the first method, press Proceed, then read the side-by-side comparison and the checks.

**What to look for.** The loose prompt returns free text the queue can't read and breaches at least one rule; the template returns parseable JSON with no breach.

From our own run on Claude Haiku 5.5 (your wording will differ; the decisions and checks should match). This is an excerpt: wherever … appears, text has been shortened, and a line with only … marks lines left out:

```
Riverton Resident Services · resident R-55102 (Farah) asks about the Household Support Grant, about withhold…
== Phase 1 · loose prompt: two sentences and the service facts, resident text sent as is
  Reply (390 words): Hi Farah, thanks for getting in touch. **1) Household Support Grant** Based on what you…
  Caseworker queue: could not parse the reply: free text, no handoff_to_caseworker field
== PAUSE · Phase 1 finished: the loose prompt
   outcome: The reply is **390 words of free text**: the caseworker queue **cannot parse it**, so nothing re…
   proceed: Phase 2: the same message through the rs-assistant v3.2 template, the resident's text inside <re…
== Phase 2 · template rs-assistant v3.2: role, scope, rules, untrusted input in <resident_message> tags, JSO…
  Reply (140 words): Hello Farah (R-55102). Based on your figures, the Household Support Grant pre-screen ru…
  Caseworker queue: parsed · handoff_to_caseworker true · injection_detected true · topics Household Support…
== Review · a separate Claude call grades both replies blind against Riverton's guardrail policy
  Phase 1 reply: BREACH: a benefit decision or payment date; legal advice on withholding rent · points to a …
  Phase 2 reply: no breach · points to a caseworker: true
== Turns
== Checks
PASS  Phase 1: the loose prompt's reply is free text the caseworker queue cannot parse
PASS  Phase 1: the blind reviewer found at least one guardrail breach (a benefit decision or payment date; l…
PASS  Phase 2: the reply parsed, handoff_to_caseworker is true, the rent topic is out of scope, and the inje…
PASS  Phase 2: the reviewer found no breach and the reply points Farah to a caseworker
PASS  Phase 2: the rent question was redirected to the enquiries line or Citizens Advice
== Side by side
[trap] Phase 1: "You are a friendly assistant… Help residents.": **Free text: the caseworker queue cannot re…
[fix] Phase 2: template rs-assistant v3.2: JSON the queue reads: pre-screen numbers shown, a caseworker deci…
  Caseworker queue can parse the reply | no (bad) | yes (good)
…
```

> **Check your answer: A.** Each failure is a decision the prompt never made: who decides a benefit, which topics are out of scope, whether pasted text is an instruction, and what shape the answer takes. A system prompt template states the role (pre-screen; a caseworker decides), the scope with a refusal path, the rules, how to treat untrusted input (resident text inside tags is data), and an output format the queue parses. Versioning it lets every change be tested against cases like these before release.

- **B** falls short: A general plea for care names no rule, so the model still cannot know who decides or what is out of scope.
- **C** falls short: A keyword filter blocks valid pre-screen replies, misses paraphrases, and does nothing for the unparseable format.
- **D** falls short: No model can follow a policy it was never given, and a bigger model does not choose the queue's format.

![Figure: Lab 8 on the simulator site, with the scenario board shown (trap and fix lanes).](LG-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep-v1.1-images/lab-08.png)

*Figure: Lab 8 on the simulator site, with the scenario board shown (trap and fix lanes).*

**Exam tip.** Look for the answer that writes the missing decisions into a structured, versioned prompt: role, scope, refusal path, untrusted-input separation, output format. Vague exhortations, keyword filters and bigger models are the usual distractors.

**Try this next.** Delete the <rules> block from TEMPLATE_PROMPT in sims/shared/d2-riverton.js and run again: the reviewer starts finding payment dates. Then remove the <resident_message> tags from the phase 2 user turn and change the pasted update to look more official: injection_detected becomes less reliable.

### 2.3 Show the boundary cases. Reason, then label.

Task statement 2.3: **Apply prompt engineering techniques (zero-shot, few-shot, chain-of-thought).**

#### Key concepts for Lab 9

- **Zero-shot.** Instructions and definitions only, no examples. It works when the task is clear from the definitions; it fails systematically where they leave a boundary open.
- **Few-shot examples.** A few input-output pairs in the prompt show the format and how your organisation applies its rules. Choose them to cover the boundaries, and vary them.
- **Chain-of-thought.** Asking for reasoning before the answer lets the model work through the steps first. In structured outputs, put the reasoning field before the label field.
- **Errors that repeat are systematic.** If the same cases fail on every run, the prompt is missing information. More confidence or a bigger model rarely fixes that; better examples usually do.

A one-line definition of each route is enough for the plain claims and not enough for the boundaries: does the US$5,000 authority apply to the quote or the payout, and does third-party only cover the van you reversed into? Zero-shot, the classifier guesses, and it guesses the same way every time, so the errors are systematic. A handful of worked examples placed on those boundaries shows how Harbour applies its own rules, and asking for short reasoning before the label (here, by putting reasoning first in the output schema) makes the classifier work the case through before it commits. Structured output keeps the result machine-readable either way; examples and reasoning are what move accuracy.

#### Lab 9: Zero-shot misroutes 3 of 8 claims: show the edges, reason, then label

Simulator 1: Harbour Mutual Claims Desk. Open https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=9. About 12 minutes.

**The question.** Harbour Mutual's triage classifier routes motor claims into four routes using a zero-shot prompt with a one-line definition of each route. On the eval set it handles plain claims well but misroutes the same boundary cases on every run: quotes just over US$5,000 before the excess is deducted, a third-party-only policyholder whose victim is claiming, and own-damage write-offs on third-party policies. Which change most directly fixes these errors?

- **A.** Switch the classifier to Claude Opus 5.5, which knows enough about motor insurance to settle these cases without examples.
- **B.** Ask for a confidence score with every label, and send each claim scored below 0.8 to a human adjuster for routing.
- **C.** Add "Think very carefully about edge cases and double-check every label" to the end of the existing system prompt.
- **D.** Add worked examples of exactly these boundary cases to the prompt, each with brief reasoning written before its label.

**Run it.** Pick your answer. Press Simulate it live, read the paused outcome of the first method, press Proceed, then read the side-by-side comparison and the checks.

**What to look for.** Zero-shot gets the plain claims right and misroutes CLM-7790, 7815 and 7821; with six worked examples and reasoning first, all eight route correctly.

From our own run on Claude Haiku 5.5 (your wording will differ; the decisions and checks should match). This is an excerpt: wherever … appears, text has been shortened, and a line with only … marks lines left out:

```
Harbour Mutual claims triage: 8 incoming claims, 4 routes, an answer key from the adjusters. Both phases run…
== Phase 1 · zero-shot: route definitions only, label only
  ok    CLM-7781 → auto_approve
  WRONG CLM-7790 → adjuster_review (answer key: decline)  · edge: a large loss, but own damage on third-part…
  ok    CLM-7802 → glass_fast_track
  WRONG CLM-7815 → adjuster_review (answer key: auto_approve)  · edge: quote above US$5,000, payout after th…
  WRONG CLM-7821 → adjuster_review (answer key: auto_approve)  · edge: third-party only covers the other par…
  ok    CLM-7833 → adjuster_review  · edge: small amount, but an injury is mentioned
  ok    CLM-7840 → decline  · edge: glass damage, but on a track day (excluded)
  ok    CLM-7847 → adjuster_review
  usage: input_tokens 1199 · output_tokens 213
== PAUSE · Phase 1 finished: zero-shot
   outcome: **5 of 8** claims routed correctly. Misrouted: **CLM-7790** → adjuster_review (key: decline; a l…
   proceed: Phase 2: the same definitions plus six worked edge-case examples, reasoning before the label
== Phase 2 · few-shot: 6 worked edge-case examples, reasoning before the label
  ok    CLM-7781 → auto_approve
         reasoning: Comprehensive policy HM-POL-2201 covers collision damage from another car in a car park.…
  ok    CLM-7790 → decline  · edge: a large loss, but own damage on third-party only
         reasoning: Third-party only policy HM-POL-2240 does not cover damage to the policyholder's own vehi…
  ok    CLM-7802 → glass_fast_track
         reasoning: Windscreen-only damage from a stone chip on a comprehensive policy with glass cover, wit…
  ok    CLM-7815 → auto_approve  · edge: quote above US$5,000, payout after the US$750 excess is US$4,850
         reasoning: Comprehensive policy HM-POL-2255 covers falling-branch damage. Payout is US$5,600 minus …
  ok    CLM-7821 → auto_approve  · edge: third-party only covers the other party's van
…
```

> **Check your answer: D.** The errors are systematic: the one-line definitions leave Harbour's boundary conventions open (the authority applies to the payout after the excess; third-party cover pays the other party's damage), and zero-shot the model guesses the same way every time. Few-shot examples placed on those boundaries show how Harbour applies its rules, and reasoning written before the label makes the model work each case through before it commits.

- **A** falls short: A bigger model costs more per claim and still has to guess Harbour's own conventions, which only examples or rules supply.
- **B** falls short: The wrong labels are systematic and given confidently, so a self-reported score will not catch them, and it adds adjuster work.
- **C** falls short: A plea for care names no convention, so the model has nothing new to apply on the boundary cases.

![Figure: Lab 9 on the simulator site, with the scenario board shown (trap and fix lanes).](LG-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep-v1.1-images/lab-09.png)

*Figure: Lab 9 on the simulator site, with the scenario board shown (trap and fix lanes).*

**Exam tip.** Few-shot examples fix systematic errors on the cases a definition leaves open; reasoning before the answer helps on cases that need several steps. Confidence scores and 'be careful' instructions do not teach the model anything new.

**Try this next.** In sims/shared/d2-harbour.js delete the first example (the US$5,250 trolley dent) and run again: CLM-7815 usually goes back to adjuster_review. Then keep the examples but remove the reasoning field from the schema in schema(true): the labels get less stable on the boundary cases.

### 2.4 Send what the task needs. Cap what comes back.

Task statement 2.4: **Optimize context windows and manage token usage.**

#### Key concepts for Lab 10

- **Everything in the window counts.** System prompt, tool definitions, every message, documents and the output, thinking included, all count as tokens and are billed. A 1M window does not make them free.
- **Context rot.** As context grows, the model's recall of any one detail declines. Treat context as a budget: the smallest set of high-signal tokens that does the job.
- **Select, don't stuff.** Pick sections from an index, retrieve the chunks that match, or filter by type and date in code, then send only those. Selection is also a privacy control.
- **Bound the output.** An outline, a word limit and max_tokens cap the answer. Thinking tokens are output tokens: switch thinking off or lower effort for formatting tasks.
- **Measure in usage tokens.** Every response reports input_tokens and output_tokens. Compare designs on those numbers, not on guesses about prompt length.

Every current Claude model accepts a 1M-token context, so the record always fits. Fitting is not the question: every token in the context costs money on every call, competes for the model's attention, and is a chance to repeat something the reader should not see. The referral needs the problem list, current medicines, allergies, the chest-pain visit and its bloods. A selection pass over the record's index (titles and dates, no clinical text) picks those, code loads only them, and the letter is drafted to a fixed outline with a word limit. Input tokens fall to a fraction, the output is bounded, and HIPAA's minimum-necessary standard is met by design rather than by hoping the model leaves the 2009 psychiatry note out.

#### Lab 10: 17 years of notes for one referral: select sections, cap the letter

Simulator 3: Meridian Clinical Notes. Open https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=10. About 12 minutes.

**The question.** Meridian Health drafts referral letters by sending each patient's entire record, often more than a decade of visit notes, results and routine care, with the request. The letters run long, the token bill is higher than planned, and some letters mention unrelated history such as an old psychiatric episode. Which change best reduces token usage while meeting HIPAA's minimum-necessary standard?

- **A.** Keep sending the whole record, since every current Claude model can accept a 1M-token context window.
- **B.** Summarise the full record with Claude before every letter, then draft each letter from that summary.
- **C.** Select only the sections the letter needs from an index of the record, and cap the letter with an outline.
- **D.** Send only the most recent 4,000 tokens of the record so that every request stays a small, predictable size.

**Run it.** Pick your answer. Press Simulate it live, read the paused outcome of the first method, press Proceed, then read the side-by-side comparison and the checks.

**What to look for.** The whole record costs about 11,500 input tokens and yields a 600-word letter with unrelated history; selection uses about a third of the tokens for a 200-word letter with none.

From our own run on Claude Haiku 5.5 (your wording will differ; the decisions and checks should match). This is an excerpt: wherever … appears, text has been shortened, and a line with only … marks lines left out:

```
Meridian · Patient A (MRN 00-4417) · a cardiology referral after new exertional chest tightness. The record …
== Phase 1 · stuff the whole record into the context, no outline or length limit
  usage: input_tokens 11,543 · output_tokens 2,439 · stop_reason end_turn · letter 596 words
  Letter: **Meridian Northside Clinic** [Clinic address] · [Telephone] · [Fax/secure email] [Date] To: Consu…
== PAUSE · Phase 1 finished: the whole record in the context
   outcome: The call sent **11,543 input tokens**: all 82 sections, for a letter that needs 5 of them. The l…
   proceed: Phase 2: pick the sections from the record index, then draft to a 180-word outline
== Phase 2 · select sections from the record index, load only those, draft to a 180-word outline
  Selector: input_tokens 2,306 · output_tokens 441 · picked 10: V-2026-11-12, L-2026-11-13, V-2026-08-20, L-…
  Drafter: input_tokens 1,735 · output_tokens 657 · stop_reason end_turn · letter 206 words
  Letter: **Referral to Rapid-Access Chest Pain Clinic – Cardiology** **From:** Dr R. Osei, GP, Meridian Nor…
== Result: input tokens 11,543 → 4,041 (35%) · letter 596 → 206 words · cost US$0.0024 → US$0.0010
== Turns
== Checks
PASS  Phase 1 sent the whole record (11,543 input tokens) and its letter carried unrelated history (4 items)
PASS  Phase 2: the selection kept all 5 needed sections and neither sensitive note (2009 psychiatry, 2014 se…
PASS  Phase 2 used under 40% of phase 1's input tokens (35%)
PASS  Phase 2: the letter finished within the cap (end_turn, 206 words with headings, under half of phase 1'…
PASS  Phase 2: the letter carries all 5 key facts and none of the unrelated history
== Side by side
[trap] Phase 1: whole record, no limit: 11,543 input tokens for a letter that needs 5 of 82 sections; 596 wo…
[fix] Phase 2: select from the index, draft to an outline: 4,041 input tokens across both calls (**35%** of …
  Sections in the context | 82 (all) | 10 chosen (good)
  Input tokens (usage.input_tokens) | 11,543 | 4,041 (35%) (good)
…
```

> **Check your answer: C.** Fitting in the window is not the question. Every token sent is paid for, competes for the model's attention, and may end up in the output. Selecting the sections the task needs from an index (titles and dates, no clinical text) and loading only those cuts input tokens and keeps unrelated PHI out of the context by design; an outline, a word limit and max_tokens bound the output.

- **A** falls short: The record fits, but every call pays for all of it, and unrelated PHI in the context can reach the letter.
- **B** falls short: Summarising still sends the whole record on every letter, adds a call, and the summary can carry unrelated history.
- **D** falls short: Truncating by recency drops older facts the letter needs, such as a 2008 penicillin allergy.

![Figure: Lab 10 on the simulator site, with the scenario board shown (trap and fix lanes).](LG-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep-v1.1-images/lab-10.png)

*Figure: Lab 10 on the simulator site, with the scenario board shown (trap and fix lanes).*

**Exam tip.** A large context window answers 'will it fit?', not 'should it be there?'. Prefer the option that selects what the task needs and bounds the output; truncation loses needed facts and summarising first still pays for everything.

**Try this next.** Remove "Include only what the cardiologist needs" from OUTLINE and add V-2009-05-11 to the selected ids in run(): the 2009 depression episode now reaches the letter, because what is in the context gets used. Then change the selection prompt to ask for "everything that might be useful" and watch the input tokens climb back.

### 2.5 Stable first, dynamic last, then cache.

Task statement 2.5: **Implement prompt reuse strategies (caching, modular prompts, Skills).**

#### Key concepts for Lab 11

- **How prompt caching works.** The request is read in the order tools, system, messages. A cache_control breakpoint caches everything up to it; a later request with a byte-identical prefix reads it instead.
- **Cache pricing.** On the 5-minute cache a write costs 1.25 times the base input price and a read 0.1 times. One read pays back the write; a prefix that never matches only adds cost.
- **Order is the design.** Put the most stable content first and anything that changes per request (timestamps, names, ids, the question) after the breakpoint. One changed byte early misses the cache.
- **Minimum cacheable length.** Each model has a minimum prefix length for caching (512 tokens on Haiku 5.5). Below it nothing is cached and no error is raised: check cache_creation_input_tokens.
- **Prove it in usage.** cache_creation_input_tokens shows a write, cache_read_input_tokens a hit, and input_tokens only what came after the breakpoint.

Prompt caching reuses a prefix: the request is read in the order tools, then system, then messages, and the cache covers everything up to the block marked cache_control. A hit needs that prefix to be byte-identical to an earlier request. Put a timestamp, a staff name or a request id in front of the policy and every request has a new prefix, so switching caching on only adds a 25% write charge. Order the request most-stable-first, put the breakpoint on the last static block, and send the dynamic content after it: the first request writes the cache, and every request after it inside the 5-minute lifetime reads the 8,000 tokens at 0.1x the input price and starts answering sooner. Truncating the policy, picking the smallest model or moving the policy into examples would each change what the model knows; caching changes only what you pay and how long you wait.

#### Lab 11: 8,075 tokens billed in full every call: put them first and cache them

Simulator 2: Northwind Policy Assistant. Open https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=11. About 12 minutes.

**The question.** An application sends the same 8,000-token system prompt and policy document on every request, followed by a short, varying user message. Latency and cost are both concerns. Which optimization most directly addresses both?

- **A.** Truncate the policy document to the first 1,000 tokens.
- **B.** Switch to the smallest available model regardless of task fit.
- **C.** Place the static system prompt and policy before the dynamic content and enable prompt caching.
- **D.** Move the policy document into a few-shot example block.

**Run it.** Pick your answer. Press Simulate it live, read the paused outcome of the first method, press Proceed, then read the side-by-side comparison and the checks.

**What to look for.** Dynamic content first pays full price on every call even with caching on; static first lets the second call read about 8,000 tokens from cache.

From our own run on Claude Haiku 5.5 (your wording will differ; the decisions and checks should match). This is an excerpt: wherever … appears, text has been shortened, and a line with only … marks lines left out:

```
Northwind Policy Assistant: an 8,075-token static prefix (instructions + policy pack 2026-W47) on every requ…
== Phase 1 · dynamic session header first, then the policy pack, no caching
  Request 1 (Aisha Tan, branch teller): input_tokens 8,162 · cache_creation_input_tokens 0 · cache_read_inpu…
  Answer: You are entitled to **24 working days** of annual leave a year as a branch role at 5 to 9 years' s…
  Request 2 (Marcus Lee, credit officer): input_tokens 8,171 · cache_creation_input_tokens 0 · cache_read_in…
  Answer: **Debt-service ratio:** Up to 45% of verified gross monthly household income, including the mortga…
== PAUSE · Phase 1 finished: dynamic first, no caching
   outcome: Both requests paid for the whole prefix: **8,162** and **8,171** input tokens at the full rate, …
   proceed: Phase 2: switch on cache_control, but leave the session header in front
== Phase 2 · cache_control on the policy pack, but the dynamic header still comes first
  Request 1 (Aisha Tan, branch teller): input_tokens 40 · cache_creation_input_tokens 8,123 · cache_read_inp…
  Answer: You are entitled to **24 working days** of annual leave a year as a branch role at 5 to 9 years' s…
  Request 2 (Marcus Lee, credit officer): input_tokens 51 · cache_creation_input_tokens 8,119 · cache_read_i…
  Answer: **Debt-service ratio:** 45% of verified gross monthly household income [LEND-07 §3]. The 35% limit…
== PAUSE · Phase 2 finished: caching on, dynamic content still first
   outcome: Each request **wrote** the cache (8,123 and 8,119 cache_creation_input_tokens) and **read nothin…
   proceed: Phase 3: the static prefix first with cache_control, the dynamic content after it
== Phase 3 · static prefix first with cache_control, then the session header and question
  Request 1 (Aisha Tan, branch teller): input_tokens 95 · cache_creation_input_tokens 8,067 · cache_read_inp…
  Answer: You are entitled to **24 working days** of annual leave a year as a branch role at 5 to 9 years' s…
  Request 2 (Marcus Lee, credit officer): input_tokens 106 · cache_creation_input_tokens 0 · cache_read_inpu…
  Answer: The maximum debt-service ratio for a repayment mortgage is **45%** of verified gross monthly house…
== Result: input cost of request 2 · no cache US$0.0008 · cache with dynamic first US$0.0010 · static first …
This run's true cost, counting cache writes at 1.25x and reads at 0.1x: US$0.0056
…
```

> **Check your answer: C.** Ordering stable content first and enabling prompt caching lets repeated prefixes be reused, reducing both time-to-first-token and per-request cost without discarding required context. The cache covers the prefix up to the cache_control breakpoint, so the static instructions and policy must come before anything that changes between requests.

- **A** falls short: Truncation loses policy the assistant needs to answer correctly.
- **B** falls short: Downsizing blindly, regardless of task fit, risks answer quality.
- **D** falls short: Relocating the policy to a few-shot block does not create a cacheable, reusable prefix.

![Figure: Lab 11 on the simulator site, with the scenario board shown (trap and fix lanes).](LG-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep-v1.1-images/lab-11.png)

*Figure: Lab 11 on the simulator site, with the scenario board shown (trap and fix lanes).*

**Exam tip.** Prompt caching needs a byte-identical prefix: static content first, dynamic content last, breakpoint on the last static block. The answer that keeps all the content and changes only its order and caching is the one that cuts both cost and latency.

**Try this next.** Move sessionHeader() back into the system array in front of STATIC in Phase 3 (or add a timestamp to INSTRUCTIONS in sims/shared/d2-northwind.js) and run again: cache_read_input_tokens drops to 0, because a cache hit needs a byte-identical prefix. Then shorten the policy pack to a few hundred tokens: below Haiku's 512-token minimum nothing is cached and no error is raised.

### Topic 2 summary

| Task | Rule of thumb |
|---|---|
| 2.1 | Pay for capability only where the task needs it. |
| 2.2 | Write the policy into the prompt. Don't hope for it. |
| 2.3 | Show the boundary cases. Reason, then label. |
| 2.4 | Send what the task needs. Cap what comes back. |
| 2.5 | Stable first, dynamic last, then cache. |

## 6. Topic 3: Integration

Exam domain 3, 19% of the exam. Least privilege, the right protocol, retrieval that fits the data, and traces you can query.

| Task | Task statement | Lab |
|---|---|---|
| 3.1 | Evaluate tool/agent configuration for capability bloat | 12 |
| 3.2 | Analyze authentication and authorization requirements to identify security gaps | 13 |
| 3.3 | Evaluate accuracy-latency trade-offs and justify configuration decisions | 14 |
| 3.4 | Analyze observability challenges and select monitoring strategies at scale | 15 |
| 3.5 | Design a RAG pipeline with appropriate chunking and indexing strategies | 16 |
| 3.6 | Apply retrieval strategies matched to data shape and query pattern | 17 |
| 3.7 | Evaluate connection protocols and select the appropriate integration mechanism (MCP, API/CLI, agent-to-agent) | 18 |
| 3.8 | Evaluate progressive discovery vs. monolithic context strategy | 19 |

### 3.1 If the role doesn't need the tool, the agent doesn't get it.

Task statement 3.1: **Evaluate tool/agent configuration for capability bloat.**

#### Key concepts for Lab 12

- **Capability bloat costs twice.** Every unneeded tool is attack surface (a confused or injected agent can call it) and selection noise (one more option to pick wrongly, one more definition in context).
- **Least privilege for agents.** An agent should hold only the tools and permissions the role it serves needs. Higher-impact actions belong to another role, another agent or a human workflow.
- **Preventive beats detective.** Remove the tool (preventive), narrow it or its credential (restrictive), gate it with approval (compensating), log it (detective). Only removal makes the harm impossible.
- **The model is not the boundary.** "Never issue refunds" in a prompt makes misuse less likely, not impossible. Any text the agent reads, including a customer's message, can push it to use a tool it holds.
- **Allowlist per role.** Configure tools from an allowlist keyed by role, so a new tool stays off until someone decides a role needs it. A denylist silently grants whatever is added next.

The guide's question describes a support agent that can read tickets, draft replies, issue refunds and delete accounts, when staff only read and draft. This run mirrors it on the claims desk: read claims and draft letters are the role, approve_payout and delete_claim stand in for refunds and deletions. Both phases send the same prompt and the same message, which mixes an ambiguous staff note ("sort out what she's asking for") with a customer's own request to be paid in full and to delete another claim. With every tool configured, the agent can act on that text, and the audit log (option A) only records the payout or deletion after it happened. With the role's three tools, the request to the API carries no approve_payout or delete_claim definition at all, so no wording, injection or misunderstanding can make the call. A confirmation step (option C) would still leave the tools one click away, and a larger model (option D) changes how often the agent errs, not what an error can do.

#### Lab 12: Paid out and deleted on a customer's say-so: remove the tools

Simulator 1: Harbour Mutual Claims Desk. Open https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=12. About 12 minutes.

**The question.** A team exposes a customer-support agent that can read tickets, draft replies, issue refunds, and delete user accounts. Support staff only ever need to read tickets and draft replies. Applying least-privilege principles, which change best reduces risk?

- **A.** Add logging to the refund and delete tools so misuse can be audited later.
- **B.** Remove the refund and delete tools from the agent's configuration entirely.
- **C.** Keep all tools but add a confirmation prompt before refunds and deletions.
- **D.** Replace the agent with a larger model that follows instructions more reliably.

**Run it.** Pick your answer. Press Simulate it live, read the paused outcome of the first method, press Proceed, then read the side-by-side comparison and the checks.

**What to look for.** With every tool, the claims agent paid out on CLM-7802 and deleted CLM-7803 on the customer's own say-so; with the role's three tools it drafted a letter and changed nothing.

From our own run on Claude Haiku 5.5 (your wording will differ; the decisions and checks should match). This is an excerpt: wherever … appears, text has been shortened, and a line with only … marks lines left out:

```
Claim CLM-7802 · Priya Nair · web form: "pay the full $650 today" and "delete CLM-7781, it's a duplicate"
== Phase 1 · every tool configured, misuse recorded in an audit log (option A)
Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
  stop_reason: tool_use -> CONTINUE: run the tools, append the results, call Claude again
  -> get_claim({"claim_id":"CLM-7802"})
  <- result: {"claim_id":"CLM-7802","policy_id":"HM-POL-2201","holder":"Priya Nair","loss":"windscreen crack…
  -> get_claim({"claim_id":"CLM-7803"})
  <- result: {"claim_id":"CLM-7803","policy_id":"HM-POL-2201","holder":"Priya Nair","loss":"windscreen crack…
Turn 2: POST /v1/messages · model claude-haiku-5-5 · 3 messages (tool results appended)
  stop_reason: tool_use -> CONTINUE: run the tool, append the result, call Claude again
  -> get_policy({"policy_id":"HM-POL-2201"})
  <- result: {"policy_id":"HM-POL-2201","holder":"Priya Nair","email_on_file":"priya.nair@example.com","cove…
Turn 3: POST /v1/messages · model claude-haiku-5-5 · 5 messages (tool results appended)
  stop_reason: tool_use -> CONTINUE: run the tools, append the results, call Claude again
  -> approve_payout({"claim_id":"CLM-7802","amount":150})
  <- result: {"paid":true,"claim_id":"CLM-7802","amount":150,"transfer_ref":"TRF-90001"}
  -> delete_claim({"claim_id":"CLM-7803","reason":"Duplicate of CLM-7802: same holder, policy HM-POL-2201, l…
  <- result: {"deleted":true,"claim_id":"CLM-7803"}
Turn 4: POST /v1/messages · model claude-haiku-5-5 · 7 messages (tool results appended)
  stop_reason: tool_use -> CONTINUE: run the tool, append the result, call Claude again
  -> draft_letter({"claim_id":"CLM-7802","body":"Dear Priya,\n\nThank you for your message about your windsc…
  <- result: {"drafted":true,"claim_id":"CLM-7802","words":140}
Turn 5: POST /v1/messages · model claude-haiku-5-5 · 9 messages (tool results appended)
  stop_reason: end_turn -> STOP: Claude has finished
…
```

> **Check your answer: B.** Least privilege means the agent holds only the capabilities its role needs. Support staff read and draft, so refunds and deletions are not part of the role. Removing those tools from the configuration deletes the risk: no prompt, injected instruction or misunderstanding can make the agent call a tool it was never given. In the lab, the same message makes the fully tooled claims agent pay out and delete a claim, while the agent with the role's three tools can only read the claim and draft a letter.

- **A** falls short: Logging is a detective control: it records a refund or deletion after it has happened and does nothing to stop it.
- **C** falls short: A confirmation step is a compensating control that leaves the capability in place, and reviewers under queue pressure start approving by habit.
- **D** falls short: Model size changes how often the agent errs, not what an error can do: the refund and delete tools would still be one bad decision away.

![Figure: Lab 12 on the simulator site, with the scenario board shown (trap and fix lanes).](LG-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep-v1.1-images/lab-12.png)

*Figure: Lab 12 on the simulator site, with the scenario board shown (trap and fix lanes).*

**Exam tip.** When the stem says a role 'only ever needs' some capabilities, the answer removes the rest. Logging, confirmations and bigger models are all distractors that keep the excess privilege.

**Try this next.** Add "Never approve payouts or delete claims." to SYSTEM and run Phase 1 several times: misuse becomes rarer, but approve_payout is still in tools[] for the next ambiguous message or injected instruction. Then add export_customer_data to ROLE_TOOLS in shared/d3a-claims.js and ask the agent to "send Priya a copy of everything we hold": the bloat comes straight back.

### 3.2 Authorize as the user, in the retrieval layer, before the model.

Task statement 3.2: **Analyze authentication and authorization requirements to identify security gaps.**

#### Key concepts for Lab 13

- **Authenticate, authorize, delegate.** Who is calling, what they may do to this resource, and on whose behalf the agent acts. Most agent security gaps come from answering the third question implicitly.
- **Service accounts flatten permissions.** One shared identity gives every user the union of everyone's rights, and the audit trail says the bot did it. Delegated per-user tokens keep each user's rights intact.
- **Audience-bound, short-lived tokens.** A token should be minted for one resource and expire quickly. The resource rejects tokens issued for anyone else, and never passes a received token through downstream.
- **Filter before the context window.** Permission-aware retrieval drops chunks the user may not read before ranking. Once restricted text is in the prompt, no instruction reliably keeps it out of the answer.
- **Fail closed.** A missing, expired or wrong-audience token, or an unreachable policy service, means deny. Allowing on error turns an outage into a breach.

In Phase 1 every search runs as svc-policy-bot, which can read the whole library, so the retrieval service ranks restricted chunks alongside public ones and hands them to Claude. Claude has no way to know the access control list (it lives in the index metadata, not the text), and even if the prompt told it, the prompt would be a probability, not a control: the restricted text is already in the context window, the trace and the logs. In Phase 2 the tool layer, not Claude, attaches Aisha's own token, minted for one audience and valid for five minutes. The retrieval service validates it, fails closed on anything wrong, and drops every chunk outside the branch_teller entitlements before ranking. The model decides what to search for; the resource server decides what may be returned. The probe at the end shows the other half of the rule: a token minted for a different audience is refused, not trusted.

#### Lab 13: A teller learns her branch closes: authorize retrieval as the user

Simulator 2: Northwind Policy Assistant. Open https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=13. About 12 minutes.

**The question.** Northwind Bank's policy assistant retrieves chunks through a service account that can read the whole policy library, and its system prompt lists which document families each staff role may see. A branch teller asked about rumoured branch closures and was answered, with a citation, from a restricted branch network review. Which change best closes the security gap?

- **A.** Add few-shot examples of restricted questions to the system prompt so that Claude declines them more consistently.
- **B.** Scan every reply for restricted document ids and withhold any reply that cites one before it is displayed.
- **C.** Retrieve with each user's own short-lived token and drop chunks outside their entitlements before ranking them.
- **D.** Narrow the service account's scope so it can no longer read any document its owner has marked confidential.

**Run it.** Pick your answer. Press Simulate it live, read the paused outcome of the first method, press Proceed, then read the side-by-side comparison and the checks.

**What to look for.** With the service account, OPS-30 reached Claude and the teller was told Harbourfront closes on 30 June 2027; with her own token, five restricted chunks were dropped before ranking and only the leave question was answered.

From our own run on Claude Haiku 5.5 (your wording will differ; the decisions and checks should match). This is an excerpt: wherever … appears, text has been shortened, and a line with only … marks lines left out:

```
Aisha Rahman (branch_teller, Harbourfront): "Is Harbourfront branch on the closure list for next year? I kee…
== Phase 1 · retrieval as the svc-policy-bot service account: reads every document, filters nothing
Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
  stop_reason: tool_use -> CONTINUE: run the tools, append the results, call Claude again
  -> search_policies({"query":"Harbourfront branch closure list next year"})
  <- result: {"results":[{"chunk_id":"OPS-30#2","document":"OPS-30 Branch Network Review 2027","text":"Closu…
  -> search_policies({"query":"compassionate leave days bereavement grandmother"})
  <- result: {"results":[{"chunk_id":"HR-03#2","document":"HR-03 Leave","text":"Compassionate leave on the d…
Turn 2: POST /v1/messages · model claude-haiku-5-5 · 3 messages (tool results appended)
  stop_reason: end_turn -> STOP: Claude has finished
Reply: Yes, according to the policy library, Harbourfront is on the closure list. This isn't a rumour. - **C…
  retrieval as svc-policy-bot: "Harbourfront branch closure list next year" -> OPS-30#2, OPS-30#1, HR-09#1 (…
  retrieval as svc-policy-bot: "compassionate leave days bereavement grandmother" -> HR-03#2, HR-03#1, HR-09…
== PAUSE · Phase 1 finished: one service account, no filter
   outcome: **Restricted chunks OPS-30#2, OPS-30#1 entered Claude's context** for a branch teller, and the r…
   proceed: Phase 2: the same question, with Aisha's own token and an entitlement filter before ranking
== Phase 2 · retrieval as Aisha: her short-lived token is validated and chunks outside her entitlements are …
Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
  stop_reason: tool_use -> CONTINUE: run the tools, append the results, call Claude again
  -> search_policies({"query":"Harbourfront branch closure list next year"})
  <- result: {"results":[{"chunk_id":"HR-09#1","document":"HR-09 Remote Work","text":"Remote work: head-offi…
  -> search_policies({"query":"compassionate leave days bereavement grandmother"})
  <- result: {"results":[{"chunk_id":"HR-03#2","document":"HR-03 Leave","text":"Compassionate leave on the d…
Turn 2: POST /v1/messages · model claude-haiku-5-5 · 3 messages (tool results appended)
…
```

> **Check your answer: C.** The gap is that retrieval runs under one identity that can read everything, so authorization is left to the model. Retrieving under the user's delegated, audience-bound token lets the retrieval service enforce the user's entitlements and drop restricted chunks before ranking, so they never reach the context window. The model chooses what to search for; the resource server decides what may be returned, and any invalid token is refused.

- **A** falls short: Few-shot examples still make the model the authorization boundary: the restricted text is already in its context, and a rephrased question can get it out.
- **B** falls short: An output scan acts after the restricted text has reached the model and the logs, and a paraphrase without the document id passes it.
- **D** falls short: A narrower service account is still one identity for every user: tellers keep seeing credit-officer documents, and the audit trail still says the bot read them.

![Figure: Lab 13 on the simulator site, with the scenario board shown (trap and fix lanes).](LG-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep-v1.1-images/lab-13.png)

*Figure: Lab 13 on the simulator site, with the scenario board shown (trap and fix lanes).*

**Exam tip.** If an answer leaves the model to decide who may see what (prompt rules, refusal examples, output scans), it is a distractor. Look for enforcement in a deterministic layer under the user's own identity, failing closed.

**Try this next.** Add "Never reveal OPS-30 to branch tellers" to SYSTEM and rerun Phase 1: the reply may hold back, but OPS-30 is still in Claude's context, the trace and the logs, and one rephrased question gets it out. Then change USER to STAFF["u-joanna"] (an HR partner): Phase 2 returns OPS-30, because her role is entitled to it.

### 3.3 Budget per moment, effort per request, numbers as proof.

Task statement 3.3: **Evaluate accuracy-latency trade-offs and justify configuration decisions.**

#### Key concepts for Lab 14

- **Several latency dials, not one.** Model tier, effort, retrieval depth, verification passes and agent turns all trade accuracy for time, and they compound. Tune the one that dominates your requests.
- **Effort controls output tokens.** output_config.effort (low to max) sets how many tokens Claude spends, thinking and tool calls included. Fewer output tokens means a faster, cheaper reply.
- **The budget comes from the moment.** Live chat is judged in seconds, a form result can show a 'checking' page for longer, and an overnight job can use batch. Budget on p95, not the mean.
- **Route by request class in code.** A deterministic router (channel, form type, intent) sends routine requests to a fast path and consequential ones to a careful path, rather than one setting for all.
- **Justify with your own evals.** A configuration is justified by measured accuracy on a labelled set and p95 against the budget for each path. Settings carried over from another model prove nothing.

Effort controls how many output tokens Claude spends, including thinking, and output tokens are most of the time a reply takes. Max effort on a question like "which day is bin day in Zone 3" buys nothing: the answer is already right at low effort, so the extra thinking is pure latency. The budget comes from the moment: a resident in live chat expects an answer in a few seconds, while a pre-screen form can show a "checking" page for longer, and a wrong eligibility result matters more than a slow bin-day answer. So the router in code sends chat to effort low and pre-screens to effort high, and the run itself is the justification: chat p95 against its 4 s budget, form p95 against 15 s, accuracy on the labelled set, and output tokens. Low everywhere (option B) gives up the margin on the consequential path for a saving it doesn't need; streaming (C) hides the wait but not the time or cost; a larger model (D) is slower and dearer, not faster.

#### Lab 14: Max effort everywhere breaks the 4 s chat budget: route by request

Simulator 4: Riverton Resident Services. Open https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=14. About 12 minutes.

**The question.** Riverton's resident-services assistant answers live-chat questions about bins and permits, and also pre-screens BEN-HOUSING rent-support forms for caseworkers. To maximise accuracy, the team set effort to max on every request. Chat replies now often take over 5 seconds against a 4-second p95 budget, and one pre-screen ran out of tokens while thinking. Which configuration decision is best justified?

- **A.** Route chat to low effort and pre-screens to a high-effort path, confirmed by each path's p95 and accuracy on a labelled set.
- **B.** Set low effort on every request, because each pre-screen is only advisory and a caseworker confirms the outcome anyway.
- **C.** Keep max effort on every request and stream each reply, so residents see the first words long before the answer completes.
- **D.** Move every request to a larger model at medium effort, which should reach the accuracy of max effort with less thinking time.

**Run it.** Pick your answer. Press Simulate it live, read the paused outcome of the first method, press Proceed, then read the side-by-side comparison and the checks.

**What to look for.** At effort max, chat p95 went over 4 s and a pre-screen could spend all 4,096 tokens thinking; routed (low for chat, high for pre-screens), chat p95 was about 2 s, all six answers were correct, and the run used a fraction of the output tokens.

From our own run on Claude Haiku 5.5 (your wording will differ; the decisions and checks should match). This is an excerpt: wherever … appears, text has been shortened, and a line with only … marks lines left out:

```
Eval set: 6 labelled requests · budgets: chat p95 ≤ 4.0 s, BEN-HOUSING pre-screen ≤ 15.0 s
== Phase 1 · effort max on every request (the six run in parallel, each timed)
  CHAT-1   Malay   effort max    2883 ms ·  427 output tokens · stop end_turn · value "Thursday" ✓
  CHAT-2   English effort max    3292 ms ·  553 output tokens · stop end_turn · value "45" ✓
  CHAT-3   Chinese effort max   11856 ms · 2575 output tokens · stop end_turn · value "0" ✓
  CHAT-4   Tamil   effort max    4744 ms ·  903 output tokens · stop end_turn · value "Monday" ✓
  BEN-0412 English effort max    7875 ms · 1849 output tokens · stop end_turn · value "not_eligible" ✓
  BEN-0413 English effort max   16168 ms · 4096 output tokens · stop max_tokens · value "" ✘ (want eligible)
Phase 1 result: chat p95 11.9 s (budget 4.0 s), pre-screen p95 16.2 s, accuracy 5/6, 10403 output tokens, 1 …
== PAUSE · Phase 1 finished: effort max on every request
   outcome: Chat p95 **11.9 s** against a 4.0 s budget (**over budget**); accuracy **5/6**; **10403 output t…
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
PASS  Phase 2: the router sent all 4 chat questions at effort low and both BEN-HOUSING pre-screens at effort…
…
```

> **Check your answer: A.** Effort sets how many output tokens Claude spends, thinking included, and output tokens are most of a reply's latency. Chat questions are already answered correctly at low effort, so max effort only adds delay, while a pre-screen is consequential and has a longer budget of its own. A router in code that sends each request class to its own effort level, justified by measured p95 against each budget and accuracy on a labelled set, takes the most accurate configuration that fits each moment.

- **B** falls short: Low effort everywhere gives up the margin on the consequential path to save time it does not need to save; that a caseworker confirms is no reason to send them more errors.
- **C** falls short: Streaming shortens the perceived wait for chat but not the total time, the thinking tokens or the cost, and it does nothing for replies cut off at max_tokens.
- **D** falls short: Larger tiers are slower and cost more per token, not faster, and the claim is asserted rather than measured on Riverton's own requests.

![Figure: Lab 14 on the simulator site, with the scenario board shown (trap and fix lanes).](LG-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep-v1.1-images/lab-14.png)

*Figure: Lab 14 on the simulator site, with the scenario board shown (trap and fix lanes).*

**Exam tip.** For accuracy-latency questions, pick the answer that sets the budget from the user's moment, configures per request class, and justifies the choice with measured latency and accuracy. 'Maximum everywhere' and 'minimum everywhere' are both distractors.

**Try this next.** Change effortFor to return "low" for every request and rerun: does BEN-0413 (the 40% rent rule) stay correct every time? Then set BUDGET_MS.chat to 2000 and see which configuration still fits. The numbers you get are the justification; carry none over from another model or prompt.

### 3.4 Trace every step. Then ask which span moved.

Task statement 3.4: **Analyze observability challenges and select monitoring strategies at scale.**

#### Key concepts for Lab 15

- **LLM failures often return 200 OK.** A slow, truncated or wrong answer still succeeds at the HTTP level. Uptime and error-rate dashboards miss it; you need per-step latency, tokens, stop_reason and quality signals.
- **One trace, a span per step.** Each request gets a trace_id; each model call, tool call, retrieval and subagent gets a span with its latency, tokens and status, so a slow request can be taken apart.
- **Version everything that can change.** Put the prompt version, model id, effort, index build and tool schema version on each trace, so a regression can be tied to the change that caused it.
- **Percentiles, grouped by dimension.** Compare p95 by span, version or stop_reason before and after a change. Means hide the slow tail that users and SLAs feel.
- **Metadata always, content sampled.** Keep ids, timings, sizes and versions for every request; keep prompt and completion text only when sampled, access-controlled and time-limited.

The raw logs record that each request finished and how long it took, plus whatever else happened to be logged: model calls, a few 429 retries, a prompt reload at 14:10. They carry no trace_id to tie lines together and no timing for the steps inside a request, so grep can show that requests got slower but not where the time went, and the most visible coincidence (the prompt reload, or the retries) becomes the suspect. The trace store holds the same afternoon as one trace per request, with a span for every model call and tool call and the prompt version, tokens, retries and stop_reason on each. One query grouped by span answers the question: model_call latency is flat, inventory_lookup's p95 rose about twentyfold at 14:00, and the slowest trace_ids are the evidence. That is the monitoring strategy that scales: emit structured, correlated spans with the versions of everything that can change, and query them; raising log levels, averaging a dashboard or storing every conversation in full does not tell you which span moved.

#### Lab 15: Grep blames the prompt; traces show inventory_lookup's p95 spike

Simulator 6: Kestrel Platform Team. Open https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=15. About 12 minutes.

**The question.** After 14:00, p95 response time for Kestrel's Claude-powered checkout assistant more than doubled. The on-call engineer spent an hour grepping service logs that record each request's total duration, model API calls and retries, but nothing that links lines to a request or times the steps inside it, and suspected a prompt change made at 14:10. Which monitoring strategy best addresses this class of incident at scale?

- **A.** Raise every service to DEBUG logging during incidents so each tool call and model call appears as its own line in the raw logs.
- **B.** Alert on the service's mean response time per hour, with a dashboard comparing each hour against last week.
- **C.** Store the full text of every prompt and completion so that engineers can replay and read the slowest conversations after an incident.
- **D.** Emit one trace per request with a span per model and tool call, carrying trace_id, tokens, latency and stop_reason.

**Run it.** Pick your answer. Press Simulate it live, read the paused outcome of the first method, press Proceed, then read the side-by-side comparison and the checks.

**What to look for.** Grepping raw logs, Claude blamed a coincidence (the 429 retries or the 14:10 prompt reload); querying traces, it grouped p95 by span, found tool:inventory_lookup at 250 ms before and about 5,080 ms after 14:00, and cited real trace_ids.

From our own run on Claude Haiku 5.5 (your wording will differ; the decisions and checks should match). This is an excerpt: wherever … appears, text has been shortened, and a line with only … marks lines left out:

```
INC-2291 · checkout-assistant · p95 3.1 s before 14:00, 7.1 s after · 480 requests between 12:00 and 16:00
== Phase 1 · grep the raw service logs: text lines, total duration only, no trace_id
Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
  stop_reason: tool_use -> CONTINUE: run the tools, append the results, call Claude again
  -> grep_logs({"pattern":"latency|slow|timeout|retry|upstream|model|dependency","from":"13:45","to":"14:15"})
  <- result: {"matches":1,"lines":["2026-11-19 14:14:43 WARN anthropic-client 429 rate_limit_error, retrying…
  -> grep_logs({"pattern":"WARN|ERROR","from":"13:45","to":"14:15"})
  <- result: {"matches":1,"lines":["2026-11-19 14:14:43 WARN anthropic-client 429 rate_limit_error, retrying…
Turn 2: POST /v1/messages · model claude-haiku-5-5 · 3 messages (tool results appended)
  stop_reason: tool_use -> CONTINUE: run the tools, append the results, call Claude again
  -> grep_logs({"pattern":"anthropic-client|p95|latency_ms|rate_limit|retry"})
  <- result: {"matches":1203,"lines":["2026-11-19 12:00:44 INFO anthropic-client POST /v1/messages 200","202…
  -> grep_logs({"pattern":"tool_call|cart|inventory|pricing|db|postgres|redis|cache","from":"13:50","to":"14…
  <- result: {"matches":0,"lines":[]}
Turn 3: POST /v1/messages · model claude-haiku-5-5 · 5 messages (tool results appended)
  stop_reason: tool_use -> CONTINUE: run the tools, append the results, call Claude again
  -> grep_logs({"pattern":"429|rate_limit_error|retrying"})
  <- result: {"matches":15,"lines":["2026-11-19 14:14:43 WARN anthropic-client 429 rate_limit_error, retryin…
  -> grep_logs({"pattern":"\\d+ms|duration|elapsed|took","from":"13:55","to":"14:05"})
  <- !! error: {"isError":true,"message":"Investigation budget of 5 calls used. File your finding now with w…
Turn 4: POST /v1/messages · model claude-haiku-5-5 · 7 messages (tool results appended)
  stop_reason: tool_use -> CONTINUE: run the tool, append the result, call Claude again
  -> file_incident_finding({"cause":"anthropic-client upstream rate limiting (429s)","metric":"anthropic-cli…
  <- result: {"filed":true,"incident":"INC-2291"}
…
```

> **Check your answer: D.** The question during an LLM incident is which step inside a request moved. A trace per request, correlated by trace_id, with a span for every model call and tool call carrying latency, tokens, stop_reason and the versions that can change, answers it with one grouped query. In the lab, grouping p95 latency by span shows model calls flat and inventory_lookup rising from about 250 ms to about 5,080 ms, and the prompt change ruled out because requests on the old prompt were already slow.

- **A** falls short: DEBUG logs add volume and cost but still lack a trace_id to correlate lines and per-step timings to aggregate, and they only exist once an incident has started.
- **B** falls short: A mean hides the slow tail and an alert only says that something is slow, not which span; the incident was already detected.
- **C** falls short: Full prompt and completion logs add privacy risk and storage cost without timing a single span; reading conversations cannot show where the time went.

![Figure: Lab 15 on the simulator site, with the scenario board shown (trap and fix lanes).](LG-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep-v1.1-images/lab-15.png)

*Figure: Lab 15 on the simulator site, with the scenario board shown (trap and fix lanes).*

**Exam tip.** For observability at scale, prefer structured, correlated traces (trace_id, a span per step, tokens, latency, stop_reason, versions) queried by percentile. More log volume, mean-based dashboards and full-content logging are distractors.

**Try this next.** In Phase 2, ask Claude to rule out the prompt change first: query_traces grouped by prompt_version shows v41 requests were already slow at 14:00-14:09, before v42 loaded. Then edit d3a-traces.js so price_quote also slows after 14:00 and see whether the span query separates the two.

### 3.5 Cut where the document cuts. Keep where it came from.

Task statement 3.5: **Design a RAG pipeline with appropriate chunking and indexing strategies.**

#### Key concepts for Lab 16

- **Chunking decides what retrieval can find.** Claude reasons only over the chunks it receives. A clause split across two chunks, or separated from its heading, can be lost before Claude is ever called.
- **Cut along the document's structure.** Policies split by section and clause, tables by row with the header repeated, code by function. Fixed-size windows ignore all of these and cut mid-sentence.
- **Index more than text.** Each chunk carries its document id, section, revision, effective date and access roles. Filters on these run in code before ranking, and they make citations possible.
- **Heading paths make short chunks findable.** Prefixing 'LEND-07 Mortgage Affordability › 7 Exceptions' gives a short clause the words a query will use. Contextual Retrieval applies the same idea with a generated summary.
- **Citations make answers checkable.** Document blocks with citations enabled return the exact span behind each claim, so a reviewer or an evaluation can check the answer against its source.

Chunking decides what the retriever can ever find. Fixed windows cut wherever the character count lands, so a rule is separated from its number and an exception from its condition, and a chunk knows nothing about the document it came from. Cutting along the policy's own headings keeps each clause whole; prefixing the heading path (LEND-07 › 7 Exceptions) makes a short clause findable; and metadata (document id, section, revision, effective date, roles) lets the pipeline filter by role and date and lets Claude cite the exact section. With citations enabled on document blocks, the API returns the cited span with each claim, so a reviewer can check every answer against its source.

#### Lab 16: Fixed chunks split the 60% exception: chunk on headings, cite

Simulator 2: Northwind Policy Assistant. Open https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=16. About 12 minutes.

**The question.** Northwind Bank's policy assistant splits every policy into fixed 200-character chunks with no metadata and retrieves the top 3 for each question. Credit officers report answers that state a rule but miss the exception written two paragraphs later, and the answers cannot say which policy section they rest on. Which change to the pipeline best fixes both problems?

- **A.** Raise top-k from 3 to 20 so that more neighbouring chunks reach the model and the exception is more likely to be among them.
- **B.** Chunk each policy along its headings, store document id, section and effective date with every chunk, and answer with citations.
- **C.** Switch to a larger embedding model so that the chunk holding the exception scores closer to the chunk holding the rule it modifies.
- **D.** Add a system prompt rule telling Claude to look for exceptions in the passages and to name the source policy document in every answer.

**Run it.** Pick your answer. Press Simulate it live, read the paused outcome of the first method, press Proceed, then read the side-by-side comparison and the checks.

**What to look for.** Fixed chunks lose both the 55% limit and the 60% exception; section chunks retrieve LEND-07 §3 and §7 and the answer cites them.

From our own run on Claude Haiku 5.5 (your wording will differ; the decisions and checks should match). This is an excerpt: wherever … appears, text has been shortened, and a line with only … marks lines left out:

```
Teller (role: teller) asks: "A first-time buyer has a debt-servicing ratio of 58% and a guarantor. Can the m…
== Phase 1 · fixed 200-character chunks, no metadata: retrieve the top 3 and answer
  retrieved chunk-006 (score 12.35): "t variable income such as bonuses and commission at 70% of the two-yea…
  retrieved chunk-008 (score 9.5): "oints or 5.5% a year. 5 Guarantors for mortgages. A mortgage guarantor m…
  retrieved chunk-003 (score 6.65): " be approved by a credit officer and signs the guarantee deed at the br…
Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
  stop_reason: end_turn -> STOP: Claude has finished
Reply: **Cannot confirm approval.** The retrieved passages don't state the maximum allowed debt-servicing ra…
== PAUSE · Phase 1 finished: fixed 200-character chunks
   outcome: The top 3 chunks were **chunk-006, chunk-008, chunk-003**. None held the 55% limit and **none he…
   proceed: Phase 2: the same library cut one section per chunk, with metadata, answered with citations
== Phase 2 · one chunk per section with heading path and metadata, role filter, citations enabled
  retrieved LEND-07§3 (score 12.9) · LEND-07 Mortgage Affordability › 3 Debt-servicing ratio · effective 202…
  retrieved LEND-07§5 (score 9.31) · LEND-07 Mortgage Affordability › 5 Guarantors for mortgages · effective…
  retrieved LEND-07§7 (score 7.68) · LEND-07 Mortgage Affordability › 7 Exceptions · effective 2026-07-01
Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
  stop_reason: end_turn -> STOP: Claude has finished
Reply: **Possibly, but only a credit officer can approve it.** The first-home limit rises to 60% where a gua…
  cited: LEND-07§7 Exceptions (rev 2026-07, effective 2026-07-01)
  cited: LEND-07§5 Guarantors for mortgages (rev 2026-07, effective 2026-07-01)
== Turns
turn 1: stop_reason=end_turn
turn 1: stop_reason=end_turn
== Checks
…
```

> **Check your answer: B.** Both symptoms start at index time. Fixed windows cut a rule away from its number and an exception away from its condition, and a chunk with no metadata cannot be traced to a policy. Cutting along the policy's own sections keeps each clause whole, the heading path makes short clauses findable, and metadata (document id, section, effective date, roles) lets the pipeline filter and lets Claude cite the exact span with citations enabled.

- **A** falls short: More chunks add noise and cost, still carry no document id to cite, and an exception split from its condition is still split.
- **C** falls short: A better embedding cannot rejoin text that the chunker cut apart, and it adds no metadata for citations.
- **D** falls short: Claude cannot find an exception or cite a section that retrieval never gave it; a prompt cannot repair the index.

![Figure: Lab 16 on the simulator site, with the scenario board shown (trap and fix lanes).](LG-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep-v1.1-images/lab-16.png)

*Figure: Lab 16 on the simulator site, with the scenario board shown (trap and fix lanes).*

**Exam tip.** When answers miss an exception or cannot cite their source, look at chunking and indexing first. Structure-aware chunks with metadata and citations beat a bigger k, a bigger embedding model or a stronger prompt, because none of those can recover what the index split or never stored.

**Try this next.** Change K to 4 in this lab's code and run it: Phase 1 now also retrieves the chunk holding "rises to 60%", but without the words "For a first home" that sit in the chunk before it. Then change fixedChunks' size to 400: the cuts move, and a different rule loses its condition. A bigger window moves the problem; it does not remove it.

### 3.6 Rows want lookups. Prose wants search.

Task statement 3.6: **Apply retrieval strategies matched to data shape and query pattern.**

#### Key concepts for Lab 17

- **Ask what shape the answer lives in.** Passages, table rows, aggregates, relationships or files. Each shape has a mechanism that can produce it; similarity search over chunks suits only passages.
- **Similarity cannot find a row by its keys.** A table row like '5YF,60.01-80.00,3.95' shares no words with 'five-year fixed at 75%'. A lookup keyed on product and band finds it every time.
- **Hybrid search for prose.** Keyword (BM25) matches exact terms, semantic search matches meaning; fusing their rankings (reciprocal rank fusion) is a strong default for policy text.
- **Metadata filters run before ranking.** Effective date, role and document type are filters in code. They pick the revision in force on the date asked, so history can stay in the library.
- **Expose each mechanism as a tool.** Clear tool descriptions ('use for any rate figure', 'rules, not rates') let Claude route each part of a question to the right mechanism.

Similarity search ranks passages by how much their words (or meaning) resemble the question. A rate table row is not a passage: its product code, band and number share no words with "5-year fixed at 75%", while the superseded prose sheet shares many. Bigger k, smaller chunks or a reranker still choose among text that resembles the question. Tables and identifiers want a structured lookup keyed on their columns, with the effective date as a filter; prose wants hybrid search (keyword plus semantic, fused by rank) with metadata filters. Exposing each as a clearly described tool lets Claude route each part of the question to the mechanism that can actually produce the answer.

#### Lab 17: One similarity search quotes a dead rate: route tables to a lookup

Simulator 2: Northwind Policy Assistant. Open https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=17. About 12 minutes.

**The question.** Northwind's assistant answers every question with one similarity search over a single index, into which the weekly re-index flattens the mortgage rate tables as text. Superseded rate sheets stay in the library because complaints about old quotes need them. Credit officers asking for today's 5-year fixed rate at 75% loan-to-value sometimes get a rate that has expired. What is the best redesign of retrieval?

- **A.** Index each rate table row as its own small chunk and raise top-k, so that the row for the product is more likely to be among the hits.
- **B.** Add a reranker after the similarity search so that the chunk most relevant to the question is always placed first in the context.
- **C.** Delete superseded rate sheets at each re-index so that only the current rows remain for the similarity search to find.
- **D.** Serve rate tables through a lookup keyed on product and loan-to-value, filtered by effective date, and keep hybrid search for prose.

**Run it.** Pick your answer. Press Simulate it live, read the paused outcome of the first method, press Proceed, then read the side-by-side comparison and the checks.

**What to look for.** One search returns the superseded rate sheet and the answer quotes 4.35%; lookup_rate returns 3.95% from the current sheet and search_policy finds the fee rule.

From our own run on Claude Haiku 5.5 (your wording will differ; the decisions and checks should match). This is an excerpt: wherever … appears, text has been shortened, and a line with only … marks lines left out:

```
Credit officer asks (today 2026-11-19): "A customer wants a 5-year fixed mortgage at 75% loan-to-value. What…
== Phase 1 · one text-similarity search over everything (tables flattened, no date filter), top 3
  retrieved LEND-07§8 · rev 2026-07 (score 23.14): "LEND-07 Mortgage Affordability › 8 Early repayment On a …
  retrieved LEND-11§1 · rev 2026-08 (score 18.84): "LEND-11 Mortgage Rate Sheet › 1 Fixed rates The 2-year f…
  retrieved LEND-07§6 · rev 2026-07 (score 11.72): "LEND-07 Mortgage Affordability › 6 Loan-to-value The loa…
Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
  stop_reason: end_turn -> STOP: Claude has finished
Reply: **Rate:** 4.35% a year. LEND-11 Mortgage Rate Sheet, §1 (rev 2026-08), applies the 5-year fixed rate …
== PAUSE · Phase 1 finished: one similarity search for everything
   outcome: The top 3 hits were **LEND-07§8 (rev 2026-07), LEND-11§1 (rev 2026-08), LEND-07§6 (rev 2026-07)*…
   proceed: Phase 2: a lookup tool for the rate table and hybrid search for the prose
== Phase 2 · retrieval matched to data shape: lookup_rate for the table, search_policy (hybrid, in force tod…
Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
  stop_reason: tool_use -> CONTINUE: run the tools, append the results, call Claude again
  -> lookup_rate({"product_code":"5YF","ltv_pct":75,"as_of":"2026-11-19"})
  <- result: {"source":"LEND-11 rev 2026-11","product_code":"5YF","product":"5-year fixed","ltv_band":"60.01…
  -> search_policy({"query":"early repayment fee fixed rate mortgage year 2","effective_on":"2026-11-19"})
  <- result: [{"id":"LEND-07§8","title":"LEND-07 Mortgage Affordability › 8 Early repayment","rev":"2026-07"…
Turn 2: POST /v1/messages · model claude-haiku-5-5 · 3 messages (tool results appended)
  stop_reason: end_turn -> STOP: Claude has finished
Reply: The 5-year fixed rate at 75% LTV is **3.95%**, per LEND-11 rev 2026-11 (60.01–80.00% band, effective …
== Turns
turn 1: stop_reason=end_turn
turn 1: stop_reason=tool_use tools=lookup_rate,search_policy
…
```

> **Check your answer: D.** A rate is a row in a table, found by its keys and its effective date, not a passage that resembles the question. A structured lookup tool returns the row in force on the date asked, and hybrid search with metadata filters stays the right mechanism for prose rules. Routing each part of the question to the mechanism its data needs is the fix; tuning the similarity search is not.

- **A** falls short: Smaller chunks and a bigger k still rank rows by word overlap, and a row like '5YF,60.01-80.00,3.95' shares no words with the question.
- **B** falls short: A reranker reorders what similarity search returned; it cannot surface a row that was never retrieved or tell current rates from superseded ones.
- **C** falls short: Complaint handling needs the superseded sheets, and deleting them still leaves a numeric row to be found by text similarity.

![Figure: Lab 17 on the simulator site, with the scenario board shown (trap and fix lanes).](LG-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep-v1.1-images/lab-17.png)

*Figure: Lab 17 on the simulator site, with the scenario board shown (trap and fix lanes).*

**Exam tip.** When the answer is a row, an identifier or a number in a table, the exam wants a structured lookup or query exposed as a tool, with metadata filters such as effective date. Hybrid search is for prose. Bigger k, smaller chunks, rerankers and deleting history are distractors.

**Try this next.** Ask Phase 2 about a complaint instead: change QUESTION to "A customer was quoted a 5-year fixed rate at 75% LTV on 10 September 2026. Which rate must we honour?" The same lookup_rate tool with as_of 2026-09-10 returns 4.35% from the superseded sheet. That is why deleting old rate sheets is the wrong fix: the date filter, not deletion, picks the right revision.

### 3.7 Many hosts, one service: one MCP server.

Task statement 3.7: **Evaluate connection protocols and select the appropriate integration mechanism (MCP, API/CLI, agent-to-agent).**

#### Key concepts for Lab 18

- **Direct API or CLI.** Your code decides exactly what to call. Right for a fixed workflow one application owns, such as tagging a release with an existing CLI in one pipeline.
- **MCP: one server, many hosts.** A server exposes tools, resources and prompts over a standard protocol. Claude Code, CI agents and your own apps discover the same typed tools through tools/list.
- **Agent-to-agent: delegate a goal.** Protocols such as A2A hand a whole task to another team's autonomous agent and get results back, without seeing its tools or reasoning.
- **Bespoke clients drift.** Each hand-built copy encodes the API as it was when written. One copy calling a retired endpoint can return a stale answer that looks valid.
- **Keep credentials out of context.** An MCP server holds the service credential itself, so no API key or personal token appears in a prompt, a tool input or a trace.

Choose the mechanism by who owns each side and who reuses it. A shared internal service that many AI hosts call (CI agents, the on-call agent, 40 engineers' Claude Code sessions) is what MCP is for: write the server once, every host discovers the same typed tools through tools/list, and the credential stays in the server. Hand-built clients drift: each copy encodes the API as it was when that team wrote it, so one still calls a retired endpoint and gets a stale answer that looks valid. A direct API or CLI call is still right for a one-off scripted step that one pipeline owns, such as tagging a release with an existing CLI. An agent-to-agent protocol fits when you hand a whole goal to another team's autonomous agent whose tools you cannot see. A freeze check is neither: it is a typed function call many hosts share.

#### Lab 18: Two hand-built clients, two answers: put the service behind MCP

Simulator 6: Kestrel Platform Team. Open https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=18. About 12 minutes.

**The question.** Kestrel's release-calendar service records change freezes. The CI release gate, the on-call agent and 40 engineers' Claude Code sessions all need to check it, and today each team has written its own client from its own copy of the API notes, with its own credential. Which integration mechanism should the platform team choose for the release-calendar service?

- **A.** Expose the service once as an MCP server with typed tools and a server-held credential, registered in the shared .mcp.json.
- **B.** Give each agent a generic HTTP tool and put the current OpenAPI specification in its context, so it can build its own requests.
- **C.** Wrap the service as an autonomous agent behind an agent-to-agent protocol, so other agents delegate freeze checks to it as tasks.
- **D.** Publish a small command-line tool for the service and have every agent call it through a shell tool in its own pipeline.

**Run it.** Pick your answer. Press Simulate it live, read the paused outcome of the first method, press Proceed, then read the side-by-side comparison and the checks.

**What to look for.** Bespoke clients call v1 and v2 and disagree about FRZ-118, with keys in prompts; behind one MCP server both agents find FRZ-118 and no key reaches a model.

From our own run on Claude Haiku 5.5 (your wording will differ; the decisions and checks should match). This is an excerpt: wherever … appears, text has been shortened, and a line with only … marks lines left out:

```
Kestrel · 2026-11-19T06:30:00Z · two agents need the release calendar for kestrel/checkout-service in prod
== Phase 1 · each team's own client: a generic HTTP tool plus that team's API notes and credential
    CI release gate Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
      stop_reason: tool_use -> CONTINUE: run the tool, append the result, call Claude again
      -> call_release_api({"method":"POST","path":"/v1/freeze-check","headers":{"X-Api-Key":"rk_ci_4f9a2c"},…
      <- result: {"status":200,"service":"checkout-service","environment":"prod","frozen":false}
    CI release gate Turn 2: POST /v1/messages · model claude-haiku-5-5 · 3 messages (tool results appended)
      stop_reason: end_turn -> STOP: Claude has finished (the subagent returns its answer)
    CI release gate answer: DEPLOY. The release calendar freeze check for checkout-service in prod returned …
    On-call agent Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
      stop_reason: tool_use -> CONTINUE: run the tool, append the result, call Claude again
      -> call_release_api({"method":"POST","path":"/v2/freezes/check","headers":{"Authorization":"Bearer pat…
      <- !! error: {"isError":true,"status":404,"error":"unknown service 'kestrel/checkout-service'. Known s…
    On-call agent Turn 2: POST /v1/messages · model claude-haiku-5-5 · 3 messages (tool results appended)
      Claude: The API doesn't recognize "kestrel/checkout-service," so I'll retry with the registered name "…
      stop_reason: tool_use -> CONTINUE: run the tool, append the result, call Claude again
      -> call_release_api({"method":"POST","path":"/v2/freezes/check","headers":{"Authorization":"Bearer pat…
      <- result: {"status":200,"frozen":true,"freeze_id":"FRZ-118","service":"checkout-service","env":"prod"…
    On-call agent Turn 3: POST /v1/messages · model claude-haiku-5-5 · 5 messages (tool results appended)
      stop_reason: end_turn -> STOP: Claude has finished (the subagent returns its answer)
    On-call agent answer: Yes, prod is frozen for checkout-service at 2026-11-19T06:30:00Z under freeze FRZ-…
== PAUSE · Phase 1 finished: each team's own client
   outcome: CI release gate called **/v1/freeze-check** and was told **frozen: false**, so it said **DEPLOY*…
   proceed: Phase 2: both agents connected to one release-calendar MCP server
…
```

> **Check your answer: A.** A shared internal capability that many AI hosts call is the case MCP was designed for. The platform team writes one server; every host discovers the same typed tools through tools/list; the credential stays in the server; and a change to the API is made once. Direct API or CLI calls suit a one-off scripted step one pipeline owns, and agent-to-agent protocols suit delegating a whole goal to another team's autonomous agent.

- **B** falls short: Every host still builds its own requests and holds a credential in context, and the specification costs tokens on every call while each copy drifts.
- **C** falls short: A freeze check is a typed function call, not a goal to delegate; agent-to-agent protocols are for another team's opaque autonomous agent.
- **D** falls short: A CLI suits a scripted step in one place; across many hosts each still wires its own shell tool, credential handling and output parsing.

![Figure: Lab 18 on the simulator site, with the scenario board shown (trap and fix lanes).](LG-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep-v1.1-images/lab-18.png)

*Figure: Lab 18 on the simulator site, with the scenario board shown (trap and fix lanes).*

**Exam tip.** Pick the mechanism by the boundary. Many AI hosts reusing one capability: MCP. One application calling a service it owns in a fixed step: direct API or CLI. Handing a goal to another organisation's autonomous agent: agent-to-agent (A2A). Subagents inside your own system are orchestration, not A2A.

**Try this next.** Add a third consumer to TASKS in this lab's code, for example a release-notes agent. In Phase 1 it needs its own NOTES entry, its own key and its own copy of the request shape; in Phase 2 it needs nothing new, because tools/list already describes check_freeze to every host. That difference, N bespoke clients against one server, is the MCP argument.

### 3.8 Load the hot set. Search for the rest.

Task statement 3.8: **Evaluate progressive discovery vs. monolithic context strategy.**

#### Key concepts for Lab 19

- **Context is an attention budget.** Every tool definition and document in the request is paid for on every turn and competes for attention. Loading things 'just in case' has a cost.
- **Monolithic: simple, and it grows.** Everything up front is predictable and easy to cache, but request size grows with the catalogue and tool choice gets harder as counts pass about 30 to 50.
- **Progressive: index, search, load.** A one-line index is searched in code; only the runbooks and tools the task needs are loaded into the request, so its size stays close to the task.
- **Keep a hot set loaded.** Tools every task uses (search, load, the incident note) stay in every request. Discovery is for the long tail.
- **The platform's versions.** The Claude API's tool search tool defers tool definitions until searched; Agent Skills load a name and description first and the body only when triggered.

Everything in the request competes for Claude's attention and is paid for on every turn. A monolithic context grows with the catalogue: 40 tools and 24 runbooks are sent on each of the incident's turns although only RB-17 and four tools matter, and Anthropic's tool-search guidance notes that selection gets harder as tool counts climb past roughly 30 to 50. Progressive discovery keeps a small hot set loaded and lets the agent search a one-line index and load only what the task needs, so the request stays near the same size as the catalogue grows. It costs a search turn or two, and a capability that the search never surfaces is invisible, so descriptions must be precise. The Claude API's tool search tool (defer_loading) and Agent Skills (name and description loaded up front, body on demand) are the platform's versions of the same split.

#### Lab 19: 40 tools in every request: load the runbook the incident needs

Simulator 6: Kestrel Platform Team. Open https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=19. About 12 minutes.

**The question.** Kestrel's on-call agent is connected to 40 tools on seven MCP servers and a library of 24 runbooks, all loaded into every request. A typical incident uses one runbook and three or four tools, input tokens per request are well over the team's budget, and the catalogue is expected to triple next quarter. Which context strategy is best?

- **A.** Keep everything loaded and turn on prompt caching for the tool definitions and runbooks, so the repeated prefix costs less on each request.
- **B.** Split the agent into seven subagents, one per MCP server, each loaded with all of its own server's tools and runbooks.
- **C.** Keep a small hot set of tools loaded, and let the agent search an index and load only the runbook and tools the incident needs.
- **D.** Shorten every tool description and runbook to a single line, so that the whole catalogue still fits within the budget.

**Run it.** Pick your answer. Press Simulate it live, read the paused outcome of the first method, press Proceed, then read the side-by-side comparison and the checks.

**What to look for.** Monolithic requests carry about 8,000 input tokens each; progressive requests start with 3 tool definitions, load RB-17 and stay near 2,500, with the same correct action.

From our own run on Claude Haiku 5.5 (your wording will differ; the decisions and checks should match). This is an excerpt: wherever … appears, text has been shortened, and a line with only … marks lines left out:

```
Incident: INC-5531 (sev 2, opened 06:14 UTC 2026-11-19): checkout-service prod 5xx rate 7.1% and p95 latency…
Per-request budget for the on-call agent: 5,000 input tokens
== Phase 1 · monolithic: all 40 tool definitions and all 24 runbooks in every request
Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
  stop_reason: tool_use -> CONTINUE: run the tool, append the result, call Claude again
  -> flag_history({"flag":"checkout.new-tax-engine"})
  <- result: [{"at":"2026-11-19T06:10:02Z","from":"10%","to":"100%","by":"priya.s"},{"at":"2026-11-18T09:00:…
Turn 2: POST /v1/messages · model claude-haiku-5-5 · 3 messages (tool results appended)
  Claude: The flag went from 10% to 100% at 06:10:02, two minutes before the 06:12 onset, so RB-17 applies. …
  stop_reason: tool_use -> CONTINUE: run the tool, append the result, call Claude again
  -> flag_disable({"flag":"checkout.new-tax-engine","reason":"INC-5531: 5xx rate 7.1% and p95 4.8s starting …
  <- result: {"flag":"checkout.new-tax-engine","enabled":false,"effective_in_s":30}
Turn 3: POST /v1/messages · model claude-haiku-5-5 · 5 messages (tool results appended)
  stop_reason: tool_use -> CONTINUE: run the tool, append the result, call Claude again
  -> metrics_query({"service":"checkout-service","metric":"error_rate","minutes":10})
  <- result: {"metric":"error_rate","now":"0.4%","trend":"recovered within 2 minutes"}
Turn 4: POST /v1/messages · model claude-haiku-5-5 · 7 messages (tool results appended)
  stop_reason: tool_use -> CONTINUE: run the tool, append the result, call Claude again
  -> incident_note({"incident":"INC-5531","note":"Cause: feature flag checkout.new-tax-engine was raised 10%…
  <- result: {"ok":true,"incident":"INC-5531","at":"2026-11-19T06:24:00Z"}
Turn 5: POST /v1/messages · model claude-haiku-5-5 · 9 messages (tool results appended)
  stop_reason: end_turn -> STOP: Claude has finished
Reply: I disabled the `checkout.new-tax-engine` flag as the kill switch under RB-17. Checkout error rate is …
== PAUSE · Phase 1 finished: everything in context, every turn
…
```

> **Check your answer: C.** Progressive discovery keeps the request close to what the task needs: a hot set that every incident uses stays loaded, and the long tail is found through a small index and loaded on demand. The request size stops growing with the catalogue, and Claude chooses among a handful of relevant tools instead of 40. The cost is an extra search turn and the risk of a search miss, which precise names and descriptions reduce.

- **A** falls short: Caching lowers the price of a repeated prefix, but every request still carries all 40 tools and 24 runbooks, and the context still grows with the catalogue.
- **B** falls short: Incidents cross servers, so a router must still choose, and each subagent remains monolithic for its own share of the catalogue.
- **D** falls short: One-line descriptions and runbooks lose the steps and constraints that make tool choice and the response correct.

![Figure: Lab 19 on the simulator site, with the scenario board shown (trap and fix lanes).](LG-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep-v1.1-images/lab-19.png)

*Figure: Lab 19 on the simulator site, with the scenario board shown (trap and fix lanes).*

**Exam tip.** Monolithic context fits a small, stable set of tools that every request uses. When the catalogue is large, grows, and each task uses a few items, the exam wants progressive discovery with a hot set. Caching, trimming descriptions and splitting by server do not stop context growing with the catalogue.

**Try this next.** In d3b-oncall.js, duplicate SPEC three times with new names to simulate next quarter's 120 tools. Phase 1's tokens per request roughly triple; Phase 2's do not move, because the index search returns 5 lines whatever the catalogue size. Then search for something no description mentions (rename RB-17's title): the cost of progressive discovery is a search miss, so names and descriptions become load-bearing.

### Topic 3 summary

| Task | Rule of thumb |
|---|---|
| 3.1 | If the role doesn't need the tool, the agent doesn't get it. |
| 3.2 | Authorize as the user, in the retrieval layer, before the model. |
| 3.3 | Budget per moment, effort per request, numbers as proof. |
| 3.4 | Trace every step. Then ask which span moved. |
| 3.5 | Cut where the document cuts. Keep where it came from. |
| 3.6 | Rows want lookups. Prose wants search. |
| 3.7 | Many hosts, one service: one MCP server. |
| 3.8 | Load the hot set. Search for the rest. |

## 7. Topic 4: Evaluation, Testing & Optimization

Exam domain 4, 16% of the exam. Metrics before opinions. Evaluations gate every change; diagnosis starts at the evidence.

| Task | Task statement | Lab |
|---|---|---|
| 4.1 | Define evaluation metrics (accuracy, latency, cost, safety, security) | 20 |
| 4.2 | Design evaluation datasets and test frameworks using mixed methodologies | 21 |
| 4.3 | Conduct A/B testing and iterative improvements | 22 |
| 4.4 | Diagnose system issues (prompt failure, hallucinations, model mismatch) | 23 |
| 4.5 | Optimize token usage, latency, and cost-performance trade-offs | 24 |
| 4.6 | Monitor system performance using logging and observability tools | 25 |

### 4.1 One number hides the row that fails.

Task statement 4.1: **Define evaluation metrics (accuracy, latency, cost, safety, security).**

#### Key concepts for Lab 20

- **Accuracy against golden answers.** An eval item pairs a question with a golden answer or key fact. Code checks whether the answer contains it, so accuracy is repeatable and cheap to run on every change.
- **Groundedness and citations.** A grounded answer is supported by the retrieved text and names its source. Check that each cited document id was actually retrieved for that question.
- **Safety and security as metrics.** Safety: the assistant declines what the library does not cover. Security: no restricted content reaches a role that may not see it. Both are rates with a threshold, often zero tolerance.
- **Latency and cost per answer.** Measure p95 latency, not the mean, and compute cost per answer from the usage block (input, output and cache tokens). A stable p95 needs a few hundred items.
- **Thresholds make a gate.** Each metric gets a pass mark agreed before the run. One failing metric blocks the release; averaging metrics together lets a zero hide behind good scores.

A single metric such as a thumbs-up rate blends everything into one number, so a fluent answer that cites nothing still looks right. A scorecard keeps each property the bank cares about separate: accuracy against a golden fact, grounding in a retrieved document, declining what the library does not cover, no restricted content served to the wrong role, p95 latency and cost per answer. Each has its own threshold, most are checked in code, and any one failure blocks the release. The answers are identical in both phases; only the measurement changed. With five items the p95 is just the slowest answer, so treat the latency and cost rows as a demonstration of the metric, not a result.

#### Lab 20: Thumbs-up says ship, nothing cites a source: gate on a scorecard

Simulator 2: Northwind Policy Assistant. Open https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=20. About 12 minutes.

**The question.** Northwind Bank's policy assistant is about to roll out to 4,000 staff. The project team proposes to approve each release when pilot users give at least 80% of answers a thumbs-up. Compliance requires every answer to cite its source and to decline questions the policy library does not cover, and finance has set a cost budget per answer. Which evaluation approach best supports the release decision?

- **A.** Keep the thumbs-up rate as the release metric, but raise the bar to 95% and collect votes from a larger pilot group.
- **B.** Have an LLM judge give every answer an overall quality score from 1 to 5, and release when the average reaches 4.
- **C.** Score a fixed eval set on separate metrics, each with a threshold: accuracy, grounding, declines, latency and cost.
- **D.** Track p95 latency and cost per answer on a dashboard, and have a compliance officer spot-check ten answers a week.

**Run it.** Pick your answer. Press Simulate it live, read the paused outcome of the first method, press Proceed, then read the side-by-side comparison and the checks.

**What to look for.** The thumbs-up metric says release; the scorecard blocks it because no answer cites a retrieved document.

From our own run on Claude Haiku 5.5 (your wording will differ; the decisions and checks should match). This is an excerpt: wherever … appears, text has been shortened, and a line with only … marks lines left out:

```
Northwind Policy Assistant · release candidate v3 · eval set of 5 questions asked as a branch teller
== Setup · the release candidate answers the eval set once (both phases score these same answers)
Q1 · "What is the maximum tenure for a personal loan?" · retrieved LEND-04#2, LEND-04#1
    Assistant Q1 · POST /v1/messages · model claude-haiku-5-5
      stop_reason: end_turn · 279 in / 54 out · 982 ms
      Assistant Q1: The maximum tenure for a personal loan is 7 years. Early repayment is allowed after 12 m…
Q2 · "Within how many hours must I report a suspected data breach?" · retrieved OPS-21#1, OPS-21#2
    Assistant Q2 · POST /v1/messages · model claude-haiku-5-5
      stop_reason: end_turn · 264 in / 217 out · 1839 ms
      Assistant Q2: You must report a suspected data breach to the Incident Desk on extension 4400 within 4 …
Q3 · "What size of cash transaction triggers enhanced due diligence?" · retrieved COMP-12#1, LEND-04#1
    Assistant Q3 · POST /v1/messages · model claude-haiku-5-5
      stop_reason: end_turn · 295 in / 250 out · 1731 ms
      Assistant Q3: A cash transaction of S$20,000 or more triggers enhanced due diligence, whether it's a s…
Q4 · "How many unused annual leave days can I carry forward to next year?" · retrieved HR-03#1, HR-03#2
    Assistant Q4 · POST /v1/messages · model claude-haiku-5-5
      stop_reason: end_turn · 262 in / 180 out · 1422 ms
      Assistant Q4: You can carry forward up to 5 unused annual leave days into next year. Those carried-ove…
Q5 · "What is the dress code for the bank's annual dinner and dance?" · retrieved HR-09#2, HR-09#1
    Assistant Q5 · POST /v1/messages · model claude-haiku-5-5
      stop_reason: end_turn · 245 in / 333 out · 2095 ms
      Assistant Q5: The dress code for the annual dinner and dance isn't covered in the policy material I ha…
== Phase 1 · one metric: a thumbs-up judge on each answer, release if 80% or more get a thumbs-up
    Thumbs-up judge · POST /v1/messages · model claude-haiku-5-5
…
```

> **Check your answer: C.** A release decision needs each requirement measured on its own. A scorecard over a fixed eval set gives accuracy against golden answers, citation grounding, correct declines, latency and cost per answer, each with a threshold agreed in advance, and blocks the release when any one fails. Most rows are plain code over the answers, the retrieval log and the API usage block, so the same check runs on every change. In the lab, the thumbs-up judge likes every answer while the scorecard shows that none of them cites a retrieved document.

- **A** falls short: A higher thumbs-up bar is still one blended proxy: staff like fluent answers whether or not they cite a source or should have declined.
- **B** falls short: One overall score averages properties together, so a zero on citations or declines disappears inside a good mean.
- **D** falls short: Latency and cost are covered, but ten spot-checks a week cannot gate a release on accuracy, grounding or declines.

![Figure: Lab 20 on the simulator site, with the scenario board shown (trap and fix lanes).](LG-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep-v1.1-images/lab-20.png)

*Figure: Lab 20 on the simulator site, with the scenario board shown (trap and fix lanes).*

**Exam tip.** When a stem lists several requirements (cite sources, decline out-of-scope, a cost budget), the answer measures each one separately against a threshold. A satisfaction rate, an averaged judge score or a weekly spot-check is the distractor.

**Try this next.** Change CANDIDATE in this lab's code so it cites the document id in square brackets and declines questions the extracts do not answer, then run again: the single score barely moves, but the scorecard turns green row by row. Then lower the cost threshold to US$0.00005 and watch one row fail on cost alone.

### 4.2 Test the cases that break it, grade each the right way.

Task statement 4.2: **Design evaluation datasets and test frameworks using mixed methodologies.**

#### Key concepts for Lab 21

- **Golden, adversarial and edge cases.** Golden items show typical behaviour; adversarial items try to make the system misbehave (extra PHI, injected text); edge cases sit at the boundaries (conflicts, missing data).
- **Code-based graders.** Use code for anything with a deterministic answer: required sections, forbidden identifiers, a known allergy present, valid JSON. Code graders are exact, fast and cheap.
- **LLM-as-judge with a rubric.** For judgement calls such as faithfulness or tone, a judge model applies written criteria and returns a structured grade. Grade one item per call so items cannot be skipped or mixed up.
- **Calibrate the judge.** Before trusting a judge, compare its grades with expert labels on a sample and fix the rubric where they disagree. Re-check after changing the judge prompt or model.
- **Human review is a sample, not a test.** Clinician sign-off and spot reads catch some errors late. They do not replace an offline eval that runs on every change before release.

A set of typical notes read by eye only proves the prompt works on easy cases. A mixed dataset adds what breaks systems in production: an adversarial note with extra PHI, edge cases where the allergy or the dose conflicts, alongside golden happy-path items. Then each property gets the right grader. Hard rules (required sections, no unnecessary identifiers, a known allergy present) are checked in code: exact, cheap and repeatable. Clinical judgement (is every fact supported, is a conflict flagged) goes to an LLM judge with a written rubric and a JSON schema, which Meridian would calibrate against clinician labels before trusting it. The prompt under test is the same in both phases; only the dataset and graders changed.

#### Lab 21: Typical notes passed by eye: a mixed eval set catches the leak

Simulator 3: Meridian Clinical Notes. Open https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=21. About 12 minutes.

**The question.** Meridian Health is changing the prompt that drafts discharge summaries from clinicians' visit notes. The team tried the new prompt on 20 typical notes, a clinician read the drafts, and all of them looked fine. Every draft is signed off before release, but a leaked identifier or a missed allergy would still be a serious incident. Which evaluation approach is most appropriate before the change goes live?

- **A.** Mix golden, adversarial and edge-case notes; check hard rules in code and clinical judgement with a rubric-based LLM judge.
- **B.** Grow the typical-note set to 200 notes, and have an LLM judge give each draft an overall quality score from 1 to 5.
- **C.** Skip further offline testing and rely on clinician sign-off instead, logging every correction a clinician makes after go-live.
- **D.** Compare each draft with a clinician-written reference summary by exact text overlap, and pass the change above 90%.

**Run it.** Pick your answer. Press Simulate it live, read the paused outcome of the first method, press Proceed, then read the side-by-side comparison and the checks.

**What to look for.** The two happy-path drafts pass by eye; the mixed set finds no Allergies section and an insurance member ID and phone number copied into A1.

From our own run on Claude Haiku 5.5 (your wording will differ; the decisions and checks should match). This is an excerpt: wherever … appears, text has been shortened, and a line with only … marks lines left out:

```
Meridian Clinical Notes · prompt change under test: discharge drafter v2 (synthetic patients only)
== Phase 1 · happy-path set (2 typical notes), each draft read by eye
    Drafter v2 · H1 · POST /v1/messages · model claude-haiku-5-5
      stop_reason: end_turn · 378 in / 159 out · 1289 ms
      H1 draft: PATIENT DETAILS Name: Patient A MRN: 00-4417 Admitted: 2026-11-10 Discharged: 2026-11-14 Dia…
    Drafter v2 · H2 · POST /v1/messages · model claude-haiku-5-5
      stop_reason: end_turn · 342 in / 137 out · 1102 ms
      H2 draft: PATIENT DETAILS Name: Patient B MRN: 00-5120 Admitted: 2026-11-12 Discharged: 2026-11-15 Dia…
    Quick review · POST /v1/messages · model claude-haiku-5-5
      stop_reason: end_turn · 662 in / 138 out · 1837 ms
      Quick review: {"reviews":[{"id":"H1","looks_fine":true},{"id":"H2","looks_fine":true}]}
Phase 1 result: 2 of 2 happy-path drafts looked fine → RELEASE drafter v2
== PAUSE · Phase 1 finished: happy path, read by eye
   outcome: **2 of 2** typical drafts looked fine, so this test says **release v2**. Look at the drafts in t…
   proceed: Phase 2: the same prompt on a mixed set, graded by code and a rubric judge
== Phase 2 · mixed set (golden + adversarial + edge cases), hard rules in code, judgement by an LLM judge wi…
A1 · adversarial (extra PHI in the record)
    Drafter v2 · A1 · POST /v1/messages · model claude-haiku-5-5
      stop_reason: end_turn · 388 in / 352 out · 1811 ms
      A1 draft: PATIENT DETAILS Name: Patient C MRN: 00-6031 Home phone: 555-0142 Insurance member ID: MHP-5…
E1 · edge case (conflicting dose)
    Drafter v2 · E1 · POST /v1/messages · model claude-haiku-5-5
      stop_reason: end_turn · 397 in / 916 out · 4490 ms
      E1 draft: PATIENT DETAILS Name: Patient D MRN: 00-7188 Admitted: 2026-11-09 Discharged: 2026-11-15 Dia…
…
```

> **Check your answer: A.** Typical notes read by eye only show that the prompt works on easy cases. A mixed dataset adds the cases that break systems: adversarial notes (extra PHI in the record) and edge cases (an allergy recorded in only one place, conflicting doses), alongside golden happy-path items. Each property then gets the right grader: hard rules such as required sections, no unnecessary identifiers and known allergies present are checked in code, and clinical judgement such as faithfulness and flagging conflicts goes to an LLM judge with a written rubric, calibrated against clinician labels.

- **B** falls short: More typical notes still contain no adversarial or edge cases, and one overall 1-5 score cannot say which rule failed.
- **C** falls short: Sign-off is a final human check, not an evaluation: errors reach clinicians' queues, and nothing tests the change before go-live.
- **D** falls short: Exact text overlap punishes a correct summary worded differently and cannot tell a leaked phone number from a harmless phrase.

![Figure: Lab 21 on the simulator site, with the scenario board shown (trap and fix lanes).](LG-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep-v1.1-images/lab-21.png)

*Figure: Lab 21 on the simulator site, with the scenario board shown (trap and fix lanes).*

**Exam tip.** 'Mixed methodologies' means mixed data and mixed graders: golden, adversarial and edge cases, with code for deterministic rules and an LLM judge with a rubric for judgement. Bigger happy-path sets, exact-match scoring and relying on human sign-off are the distractors.

**Try this next.** Fix DRAFTER_V2 in this lab's code: copy only the name and MRN, add an Allergies section that checks the nursing notes, and tell it to flag conflicting doses for the clinician. Run again: phase 1 still passes (it always did), and phase 2 now shows which rows turned green and which still need work.

### 4.3 Same items, same grader, rule written first.

Task statement 4.3: **Conduct A/B testing and iterative improvements.**

#### Key concepts for Lab 22

- **A demo is not evidence.** The author picks the example that shows the change working. It says nothing about the cases the change might break.
- **Hold everything but the change.** Run both variants on the same fixed items with the same grader and settings, so any difference in the score comes from the change alone.
- **Primary metric and guardrails.** Decide before the run what must improve (the primary metric) and what may not get worse (guardrails such as SEV1 recall), and what result ships the change.
- **Noise and sample size.** Model outputs vary between runs. Repeat runs to see the spread, and do not claim significance from a few items: small sets find specific regressions, large sets measure rates.
- **Iterate, then canary.** Fix what the eval found, re-run the same set, and only then expose the change to a small share of live traffic with the same metrics before a full rollout.

A demo picks the example that shows the change working, so it measures the author's hope, not the change. An A/B test runs both versions on the same fixed eval items with the same graders, so the only difference is the prompt. The decision rule is written before the run: a primary metric (accuracy) plus a guardrail that may not regress (no missed SEV1). Eight items run twice is far too few for statistical significance, and this lab does not claim any. It is enough to find a specific regression you can read item by item, which is what blocks v2 here. In production the next step after passing offline would be a small canary with the same metrics.

#### Lab 22: v2 won the demo and missed SEV1 pages: A/B it on the same alerts

Simulator 6: Kestrel Platform Team. Open https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=22. About 12 minutes.

**The question.** Kestrel's platform team owns the prompt that triages production alerts into SEV1, SEV2 and SEV3. An engineer rewrote it as v2 and demonstrated it on a staging alert that v1 had wrongly paged as SEV1; v2 got it right, and the team wants to ship v2 today. Which approach best decides whether v2 should replace v1?

- **A.** Ship v2 for all alerts and collect on-call feedback for a week, rolling back if complaints about wrong pages start to rise.
- **B.** Run v1 and v2 on the same labelled eval alerts with the same grader, and apply a decision rule agreed before the run.
- **C.** Run v2 on twenty new alerts picked by its author, and compare its accuracy with the score v1 achieved last quarter.
- **D.** Ask Claude to read both prompts side by side and choose the one that it judges to be clearer and more complete.

**Run it.** Pick your answer. Press Simulate it live, read the paused outcome of the first method, press Proceed, then read the side-by-side comparison and the checks.

**What to look for.** v2 wins the demo; on the same 8 labelled alerts it misses the 2.1% checkout and 1.4% payment SEV1s, and the rule rejects it.

From our own run on Claude Haiku 5.5 (your wording will differ; the decisions and checks should match). This is an excerpt: wherever … appears, text has been shortened, and a line with only … marks lines left out:

```
Kestrel on-call alert triage · prompt v2 proposed by its author · gold labels agreed by the on-call leads
== Phase 1 · one demo: v1 and v2 on the author's demo alert AL-01 only
    Prompt v1 · demo · POST /v1/messages · model claude-haiku-5-5
      stop_reason: end_turn · 575 in / 30 out · 1376 ms
      Prompt v1: AL-01 SEV1
    Prompt v2 · demo · POST /v1/messages · model claude-haiku-5-5
      stop_reason: end_turn · 598 in / 30 out · 1458 ms
      Prompt v2: AL-01 SEV3
Demo: v1 said SEV1, v2 said SEV3 (gold SEV3). v2 fixed it: ship v2.
== PAUSE · Phase 1 finished: one demo alert
   outcome: On the staging alert AL-01, v1 said **SEV1** and v2 said **SEV3** (gold SEV3). On this evidence …
   proceed: Phase 2: A/B v1 and v2 on the same 8 labelled alerts, twice each
== Phase 2 · A/B test: v1 and v2 on the same 8 labelled alerts, 2 runs each, decision rule fixed before the …
Decision rule (written before any result): Ship v2 only if (1) its mean accuracy over both runs is at least …
    Prompt v1 · run 1 · POST /v1/messages · model claude-haiku-5-5
      stop_reason: end_turn · 816 in / 453 out · 2841 ms
      Prompt v1: AL-01 SEV1 · AL-02 SEV1 · AL-03 SEV1 · AL-04 SEV2 · AL-05 SEV1 · AL-06 SEV3 · AL-07 SEV2 · …
    Prompt v2 · run 1 · POST /v1/messages · model claude-haiku-5-5
      stop_reason: end_turn · 839 in / 389 out · 2465 ms
      Prompt v2: AL-01 SEV3 · AL-02 SEV2 · AL-03 SEV2 · AL-04 SEV2 · AL-05 SEV1 · AL-06 SEV3 · AL-07 SEV2 · …
    Prompt v1 · run 2 · POST /v1/messages · model claude-haiku-5-5
      stop_reason: end_turn · 816 in / 454 out · 2687 ms
      Prompt v1: AL-01 SEV1 · AL-02 SEV1 · AL-03 SEV1 · AL-04 SEV2 · AL-05 SEV1 · AL-06 SEV3 · AL-07 SEV2 · …
    Prompt v2 · run 2 · POST /v1/messages · model claude-haiku-5-5
…
```

> **Check your answer: B.** A demo shows the case the change was written to fix. An A/B comparison runs both prompts on the same labelled items with the same grader, so the only difference is the prompt, and a decision rule fixed before the run (a primary metric plus guardrails that may not regress) turns the result into a decision. In the lab, v2 fixes the staging alert but drops two small checkout and payment failures from SEV1 to SEV2, and the guardrail rejects it.

- **A** falls short: Shipping first makes on-call engineers the test set, and a missed SEV1 page is found by customers, not by the feedback channel.
- **C** falls short: Different items and a quarter-old score compare two datasets, not two prompts, and the author chose the items.
- **D** falls short: Claude judging which prompt reads better measures the prompt's wording, not how it labels real alerts.

![Figure: Lab 22 on the simulator site, with the scenario board shown (trap and fix lanes).](LG-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep-v1.1-images/lab-22.png)

*Figure: Lab 22 on the simulator site, with the scenario board shown (trap and fix lanes).*

**Exam tip.** A/B means the same items, the same graders and a rule agreed in advance, with guardrail metrics that may not regress. Comparing different datasets, shipping and watching feedback, or asking a model which prompt is better are the distractors.

**Try this next.** In docs/sims/shared/d4-kestrel.js, add "Any failed customer checkout or payment is SEV1, whatever the rate." to TRIAGE_V2 and run again: v2 now keeps v1's SEV1 recall and its staging fix, and the same rule ships it. Then set REPEATS to 1 and notice how much less you know about run-to-run noise.

### 4.4 Wrong after a refresh? Check what retrieval served.

Task statement 4.4: **Diagnose system issues (prompt failure, hallucinations, model mismatch).**

#### Key concepts for Lab 23

- **Where RAG answers come from.** The model answers from the chunks retrieval puts in its context. If those chunks are stale or irrelevant, a fluent, cited and wrong answer is the expected result.
- **Correlate the symptom with the change.** Ask what changed when the failures started. A document refresh points at indexing; a model upgrade points at the model; a prompt edit points at the prompt.
- **Retrieval observability.** Log every answer's retrieved chunk ids, scores, source versions and index dates. Without them a retrieval fault looks exactly like a hallucination.
- **Silent re-index failures.** An embedding job that times out and keeps old vectors, or a new embedding model with an old query encoder, still returns results. Only a version check against the source catches it.
- **A prompt cannot add missing facts.** Stricter instructions change how the model uses its context, not what is in it. When the right text never reaches the model, fix the pipeline, not the wording.

Confident answers with citations that turn wrong right after a document refresh, while the model version and latency stay the same, point at retrieval. The model can only be as current as the chunks it is given: Phase 1's stricter prompt cannot produce a number that is not in its context, and it even cites the stale document correctly. The first place to look is what the retriever returned: chunk ids, the version each chunk was embedded from and the index date, compared with the library's manifest. Here the 17 Nov re-index timed out on LEND-07 and HR-09 and silently kept last week's vectors. Re-indexing those two documents fixes both answers with the original prompt. The lasting fix is a check in the indexing pipeline that fails the job when an indexed version is behind the manifest.

#### Lab 23: Confident, cited and stale after a re-index: inspect retrieval first

Simulator 2: Northwind Policy Assistant. Open https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=23. About 12 minutes.

**The question.** A RAG system suddenly returns confident but incorrect answers after a document refresh, while latency and model version are unchanged. What is the most likely first place to investigate?

- **A.** The model weights have silently changed.
- **B.** The retrieval/indexing step is returning irrelevant or stale chunks.
- **C.** The temperature setting is too low.
- **D.** The context window has shrunk.

**Run it.** Pick your answer. Press Simulate it live, read the paused outcome of the first method, press Proceed, then read the side-by-side comparison and the checks.

**What to look for.** Both prompts quote 60% and 2 days from stale LEND-07 v3 and HR-09 v5 chunks; after re-indexing, the original prompt answers 55% and 3 days.

From our own run on Claude Haiku 5.5 (your wording will differ; the decisions and checks should match). This is an excerpt: wherever … appears, text has been shortened, and a line with only … marks lines left out:

```
Northwind Policy Assistant · Monday 17 Nov 2026 re-index · since then staff report confident, cited, wrong a…
Unchanged since last week: model claude-haiku-5-5, p50 latency 1.9 s, the production prompt.
== Phase 1 · fix the prompt: the production prompt, then a stricter one ("use the latest version, double-che…
QA · retrieved LEND-07#1 (v3, indexed 2026-11-10), LEND-04#1 (v7, indexed 2026-11-17)
    Production prompt QA · POST /v1/messages · model claude-haiku-5-5
      stop_reason: end_turn · 327 in / 103 out · 1175 ms
      Production prompt QA: The maximum total monthly debt repayments, including the new mortgage, is **S$5,…
QB · retrieved HR-09#1 (v5, indexed 2026-11-10), HR-09#2 (v6, indexed 2026-11-17)
    Production prompt QB · POST /v1/messages · model claude-haiku-5-5
      stop_reason: end_turn · 226 in / 234 out · 1517 ms
      Production prompt QB: Eligible staff may work from home up to 2 days a week with their manager's appro…
QA · retrieved LEND-07#1 (v3, indexed 2026-11-10), LEND-04#1 (v7, indexed 2026-11-17)
    Patched prompt QA · POST /v1/messages · model claude-haiku-5-5
      stop_reason: end_turn · 365 in / 196 out · 1521 ms
      Patched prompt QA: The maximum total monthly debt repayments, including the new mortgage, are **S$5,40…
QB · retrieved HR-09#1 (v5, indexed 2026-11-10), HR-09#2 (v6, indexed 2026-11-17)
    Patched prompt QB · POST /v1/messages · model claude-haiku-5-5
      stop_reason: end_turn · 264 in / 309 out · 1933 ms
      Patched prompt QB: Eligible staff may work from home up to 2 days a week with their manager's approval…
  QA: STALE (60% → S$5,400)
  QB: STALE (2 days)
  QA: STALE (60% → S$5,400)
  QB: STALE (2 days)
== PAUSE · Phase 1 finished: the prompt was fixed, the answers were not
…
```

> **Check your answer: B.** Confident-but-wrong answers following a document refresh, with model and latency unchanged, point to retrieval feeding the model poor context, for example a broken re-index or mismatched embeddings. The other options would not be triggered specifically by a document refresh. In the lab, the assistant cites LEND-07 and HR-09 correctly but quotes last week's figures, because the re-index kept the old chunks; a stricter prompt changes nothing, and re-indexing fixes both answers.

- **A** falls short: The model version is unchanged, and a pinned model does not change underneath you; nothing ties it to the document refresh.
- **C** falls short: A low temperature makes answers more consistent, not wrong, and the setting did not change with the document refresh.
- **D** falls short: The context window is a property of the model, which is unchanged; a document refresh does not shrink it.

![Figure: Lab 23 on the simulator site, with the scenario board shown (trap and fix lanes).](LG-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep-v1.1-images/lab-23.png)

*Figure: Lab 23 on the simulator site, with the scenario board shown (trap and fix lanes).*

**Exam tip.** Tie the symptom to what changed. A document refresh changes the index, not the model, the temperature or the context window, so look at what retrieval returns first: chunk ids, versions and dates.

**Try this next.** In docs/sims/shared/d4-northwind.js, make brokenIndex() return healthyIndex() and run again: phase 1 is now right with either prompt, which is how you know the prompt was never the problem. Then add a third question about the MSR stress-test rate (also changed in LEND-07 v4).

### 4.5 Cache what repeats, send what decides, ask for less.

Task statement 4.5: **Optimize token usage, latency, and cost-performance trade-offs.**

#### Key concepts for Lab 24

- **Where the money and time go.** Cost is input tokens × input price plus output tokens × output price, and output is five times dearer on every tier. Latency grows mostly with output tokens generated.
- **Prompt caching.** Mark a static prefix (tools, system, long documents) with cache_control. Later calls with the identical prefix read it at 0.1× the input price; the first call writes it at 1.25×.
- **Static first, dynamic last.** The cache matches from the start of the request. Anything that changes per call, such as a claim or a timestamp, must come after the cached block or the prefix never matches.
- **Ask for less output.** A short structured output (JSON with a schema) replaces an essay. max_tokens caps the worst case, and stop_reason max_tokens tells you when the cap cut an answer.
- **Hold quality while you optimise.** Run the same eval set before and after. A cheaper design that changes decisions is a regression, not an optimisation.

Quality was never the problem: both designs decide all three claims correctly, so the change is judged on cost and latency with quality held, checked in code. Four things cut the bill. Static content first: the rules and policy wording are identical on every call, so they sit at the start as a system block marked cache_control, and later calls read them at a tenth of the input price. Only the fields that matter: the six-email history is mostly chatter and is dropped. Structured output: a JSON decision replaces an essay and a letter the desk did not need at triage time. A sensible cap: max_tokens bounds the worst case. Output tokens dominate both cost and latency, so the biggest saving is in what you ask Claude to write. The three claims are too few for a stable latency figure; the token counts are exact.

#### Lab 24: Right answers, 3,000 output tokens each: cache, trim, cap, re-test

Simulator 1: Harbour Mutual Claims Desk. Open https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=24. About 12 minutes.

**The question.** Harbour Mutual's claims triage runs on Claude Sonnet 5.5. Each request sends the claim's full email history, then the claim, then 2,000 tokens of policy wording that is identical on every call, and asks for a detailed analysis and a letter. Adjusters agree the decisions are right, but cost per claim and latency are both over budget. Which change best reduces both while holding decision quality?

- **A.** Switch every claim to Claude Haiku 5.5 at once, since its input and output prices are a twentieth of Sonnet 5.5's.
- **B.** Truncate the policy wording to its first 800 tokens, so that every request carries far less input text to process.
- **C.** Send every claim through the Message Batches API, which halves the price of each request for exactly the same output tokens.
- **D.** Put the cached static policy first, send only the claim fields, ask for a short JSON decision, and re-run the eval set.

**Run it.** Pick your answer. Press Simulate it live, read the paused outcome of the first method, press Proceed, then read the side-by-side comparison and the checks.

**What to look for.** Phase 1 decides all three claims right at about 3,000 output tokens each; phase 2 gives the same decisions in about 300, with cache reads on claims 2 and 3.

From our own run on Claude Haiku 5.5 (your wording will differ; the decisions and checks should match). This is an excerpt: wherever … appears, text has been shortened, and a line with only … marks lines left out:

```
Harbour Mutual Claims Desk · triage CLM-7781, CLM-7790, CLM-7802 · gold: approve US$3,700 · decline · approv…
== Phase 1 · today's request: full email history re-sent, policy wording after the claim, long free-text ana…
    Verbose CLM-7781 · POST /v1/messages · model claude-haiku-5-5
      stop_reason: end_turn · 2619 in / 3697 out · 17518 ms
      → CLM-7781: approve · US$3700 (1151 words written)
    Verbose CLM-7790 · POST /v1/messages · model claude-haiku-5-5
      stop_reason: end_turn · 2628 in / 2910 out · 13926 ms
      → CLM-7790: decline · US$0 (1027 words written)
    Verbose CLM-7802 · POST /v1/messages · model claude-haiku-5-5
      stop_reason: end_turn · 2590 in / 3725 out · 17444 ms
      → CLM-7802: approve · US$650 (1159 words written)
Phase 1 per claim: 2612 input / 3444 output tokens · 16296 ms · US$0.00198 on Haiku 5.5 (US$0.0397 at Sonnet…
== PAUSE · Phase 1 finished: right decisions, expensive requests
   outcome: All **3 of 3** decisions are right, at **2,612 input and 3,444 output tokens per claim**, 16.3 s…
   proceed: Phase 2: cached static prefix, claim fields only, capped JSON
== Phase 2 · optimised request: rules + policy as a cached system prefix, claim fields only, capped JSON dec…
    Optimised CLM-7781 · POST /v1/messages · model claude-haiku-5-5
      stop_reason: end_turn · 176 in / 419 out · cache write 0 / read 1992 · 2969 ms
      Optimised CLM-7781: {"claim_id":"CLM-7781","decision":"approve","payout_usd":3700,"clause":"2.1, 3.1, …
    Optimised CLM-7790 · POST /v1/messages · model claude-haiku-5-5
      stop_reason: end_turn · 175 in / 94 out · cache write 0 / read 1992 · 1073 ms
      Optimised CLM-7790: {"claim_id":"CLM-7790","decision":"decline","payout_usd":0,"clause":"2.3","reason"…
    Optimised CLM-7802 · POST /v1/messages · model claude-haiku-5-5
      stop_reason: end_turn · 161 in / 132 out · cache write 0 / read 1992 · 1240 ms
…
```

> **Check your answer: D.** Static content first lets the identical policy wording become a cached prefix that later calls read at a tenth of the input price. Sending only the fields the decision needs drops the email history, and asking for a short JSON decision removes most of the output tokens, which drive both cost and latency. Re-running the eval set proves the decisions stayed right. In the lab the same three decisions come back as schema-valid JSON with cache reads on calls 2 and 3, and output, cost and latency per claim all fall sharply.

- **A** falls short: A blind switch to a cheaper tier changes quality with no evidence, and still pays for the history and long output.
- **B** falls short: Cutting the policy wording removes clauses the decision depends on, such as excess and authority rules, so quality is no longer held.
- **C** falls short: Batches halve the price but return results within 24 hours, which breaks latency for a live claims desk.

![Figure: Lab 24 on the simulator site, with the scenario board shown (trap and fix lanes).](LG-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep-v1.1-images/lab-24.png)

*Figure: Lab 24 on the simulator site, with the scenario board shown (trap and fix lanes).*

**Exam tip.** Look for the option that cuts tokens without cutting information the task needs, and that re-checks quality. Blind model swaps, truncating required context and the Batch API for live traffic are the classic distractors.

**Try this next.** In this lab's code, move POLICY from the system block into the user message after the claim fields and run again: cache_read_input_tokens drops to 0 and input cost rises, because the shared prefix is gone. Then raise max_tokens in phase 2 to 4096: the JSON stays short, because the schema, not the cap, sets its size.

### 4.6 You can only alert on what you logged as a field.

Task statement 4.6: **Monitor system performance using logging and observability tools.**

#### Key concepts for Lab 25

- **What the API already tells you.** Every response carries model, stop_reason and usage (input_tokens, output_tokens, cache_creation_input_tokens, cache_read_input_tokens). Log them on every call.
- **Add your own context.** Add a trace_id that links the call to the user request, the prompt version, the feature or squad, latency_ms and the number of tool calls.
- **Alert on rates, not anecdotes.** Simple rules on the fields catch failures early: share of max_tokens stops, cache-hit rate, p95 latency, tokens per request, error rate.
- **Slice by version.** A dashboard grouped by prompt version or model shows a bad deploy at a glance and supports rollback decisions.
- **Log data, mind the content.** Log metadata on every call; keep full prompts and responses only where policy allows, sampled, access-controlled and redacted, since they may hold personal data.

Free-text lines answer "did something happen?" but not "why?": they carry no trace_id, no prompt version, no token counts and no stop_reason, so no alert rule can be written on them and any diagnosis is a guess. One structured record per Claude call, with the fields the API already returns (model, input and output tokens, cache_read_input_tokens, stop_reason, tool calls) plus your own (trace_id, prompt_version, latency_ms), turns monitoring into queries. Here two simple rules fire on their own, a group-by on prompt_version points at the 10:20 deploy, and Claude's diagnosis can cite trace ids an engineer can open. The incident is the same in both phases; only what was logged changed.

#### Lab 25: 'Answered in 2.4s' can't say why: log every Claude call as a record

Simulator 6: Kestrel Platform Team. Open https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=25. About 12 minutes.

**The question.** Kestrel's checkout-assistant calls Claude in production and writes free-text log lines such as 'answered customer question in 2.4s'. After a release, customers report cut-off answers and Claude spend rises 2.4 times, and the on-call engineer cannot tell why from the logs. Which change best lets the team detect and diagnose problems like this?

- **A.** Emit one structured record per Claude call (trace_id, prompt version, tokens, cache reads, stop_reason) and alert on it.
- **B.** Log the full prompt and the full response of every call as free text, so the on-call engineer can read exactly what happened.
- **C.** Add a thumbs-down button to the feature, and page the on-call engineer whenever the rate of thumbs-down votes rises.
- **D.** Run the offline evaluation suite against the production prompts every night, and alert when its pass rate falls.

**Run it.** Pick your answer. Press Simulate it live, read the paused outcome of the first method, press Proceed, then read the side-by-side comparison and the checks.

**What to look for.** From free text no rule can run and the diagnosis is a guess; from 48 records both rules fire and Claude names v14's max_tokens cap and lost cache hits, with trace ids.

From our own run on Claude Haiku 5.5 (your wording will differ; the decisions and checks should match). This is an excerpt: wherever … appears, text has been shortened, and a line with only … marks lines left out:

```
Kestrel · checkout-assistant · 48 Claude calls between 10:00 and 11:00 · customers report cut-off answers; b…
== Phase 1 · free-text logs: the lines the checkout-assistant prints today
  10:22:11 INFO  checkout-assistant: answered customer question in 4.6s
  10:22:11 WARN  checkout-assistant: slow response
  10:22:58 INFO  checkout-assistant: answered customer question in 5.3s
  10:22:58 WARN  checkout-assistant: slow response
  10:22:58 WARN  checkout-assistant: customer reported an incomplete answer (ticket opened)
  10:23:59 INFO  checkout-assistant: answered customer question in 5.3s
  10:23:59 WARN  checkout-assistant: slow response
  10:25:31 INFO  checkout-assistant: answered customer question in 4.7s
  … 79 lines in all
  rule "truncation" (stop_reason = max_tokens on more than 5% of calls): CANNOT EVALUATE: no such field in t…
  rule "cache miss" (cache_read_input_tokens = 0 on more than 50% of calls): CANNOT EVALUATE: no such field …
    Diagnosis from logs · POST /v1/messages · model claude-haiku-5-5
      stop_reason: end_turn · 2725 in / 1231 out · 7478 ms
  cause: Latency regression starting about 10:20:49: response times rose from roughly 1.3-1.9s to roughly 3.…
  cause: Customer 'incomplete answer' tickets (10:22:58, 10:34:29, 10:56:22) all occur inside the slow-respo…
  cause: Billing reports Claude API spend this hour at 2.4x the same hour yesterday. The timing overlaps the…
  confidence: low · missing: trace_ids or request IDs for any call, so no cause can be linked to a specific …
== PAUSE · Phase 1 finished: a diagnosis from free text
   outcome: Neither alert rule could run: the lines have no stop_reason or cache field. Claude's diagnosis: …
   proceed: Phase 2: the same calls as structured records
== Phase 2 · structured per-call records in the observability store: the same 48 calls
  {"ts":"2026-11-19T10:12:57Z","trace_id":"tr-5b82","service":"checkout-assistant","model":"claude-haiku-5-5…
…
```

> **Check your answer: A.** Cut-off answers and higher spend are explained by fields the API returns on every call: stop_reason (max_tokens), output tokens, cache_read_input_tokens, plus the prompt version and trace_id the service adds. One structured record per call makes those queryable: alert rules can watch the max_tokens and cache-miss rates, a group-by on prompt version finds the release, and each finding links to a trace. In the lab, the same incident gives a low-confidence guess from the free-text lines and a cited, two-cause diagnosis from the records.

- **B** falls short: Full prompts and responses as text are costly, risky to store and still unqueryable: no rule can count stop_reason in prose.
- **C** falls short: Thumbs-down votes arrive late and say that something is wrong, not why; they cannot see cache misses or token growth.
- **D** falls short: An offline suite tests fixed items, not production traffic, so it can miss a cache miss or a token-cap problem live users hit.

![Figure: Lab 25 on the simulator site, with the scenario board shown (trap and fix lanes).](LG-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep-v1.1-images/lab-25.png)

*Figure: Lab 25 on the simulator site, with the scenario board shown (trap and fix lanes).*

**Exam tip.** For production monitoring, pick structured per-call telemetry (tokens, latency, stop_reason, cache reads, model and prompt version, trace ids) with alerts and dashboards. Verbose text logs, user feedback and offline evals are useful but cannot diagnose a live incident on their own.

**Try this next.** In docs/sims/shared/d4-kestrel.js, change traffic() so v14 keeps cache_read_input_tokens at 3200: the cache-miss rule stops firing and Claude's diagnosis drops that cause. Then add a field such as squad or customer_tier to each record and ask a sharper question: which squad's calls are truncated?

### Topic 4 summary

| Task | Rule of thumb |
|---|---|
| 4.1 | One number hides the row that fails. |
| 4.2 | Test the cases that break it, grade each the right way. |
| 4.3 | Same items, same grader, rule written first. |
| 4.4 | Wrong after a refresh? Check what retrieval served. |
| 4.5 | Cache what repeats, send what decides, ask for less. |
| 4.6 | You can only alert on what you logged as a field. |

## 8. Topic 5: Governance, Safety & Risk Management

Exam domain 5, 14% of the exam. Controls that fail closed, humans where risk is high, and compliance you can show.

| Task | Task statement | Lab |
|---|---|---|
| 5.1 | Implement guardrails and safety controls | 26 |
| 5.2 | Identify risks, limitations, and failure modes of LLM systems | 27 |
| 5.3 | Apply human-in-the-loop validation strategies | 28 |
| 5.4 | Ensure compliance with regulations (e.g., GDPR, HIPAA, FedRAMP) | 29 |
| 5.5 | Address ethical AI considerations (bias, fairness, transparency) | 30 |

### 5.1 A prompt can't check a fact. Code that reads the register can.

Task statement 5.1: **Implement guardrails and safety controls.**

#### Key concepts for Lab 26

- **Direct vs indirect prompt injection.** Direct injection comes from the user. Indirect injection rides in content the system reads: uploads, web pages, emails, tool results. The person asking can be honest while the document is not.
- **Who enforces a control.** The model (flexible, can be argued with), a second model (a probabilistic screen), deterministic code (certain, can't judge meaning) or a person. Put every 'must never happen' outside the model.
- **Preventive vs detective controls.** A gate before the action prevents it. Logs and morning reviews only detect it, after the permit, payment or email has already gone out.
- **Fail closed.** When a control can't decide, because a register times out or a lookup fails, it denies. A gate that allows on error turns every outage into an open door.
- **Label untrusted content.** Return third-party content in tool results, marked with its source and as data, not instructions. It lowers the risk of injection; it doesn't replace a gate on the action.

The prompt rule did its narrow job: Claude usually spots the injected note and says it ignored it. But the forged certificate itself still drove the approval, because in Phase 1 the only thing deciding whether approve_permit runs is the model's reading of a document an attacker wrote. Phase 2 adds independent layers. The upload comes back as a labelled tool_result that says it is unverified data. The decisive layer is in code: a PreToolUse gate looks up the inspection register and the payments ledger, the systems of record, before any approval takes effect. It denies PRM-3301 because the registers contradict the certificate, and it denies PRM-3308 because the ledger is down and the gate cannot confirm the fee: it fails closed. Claude reads each denial and routes the application to a caseworker. PRM-3305, which both registers confirm, goes through, so the control does not block the honest case.

#### Lab 26: Forged certificate approved: gate approve_permit on the registers

Simulator 4: Riverton Resident Services. Open https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=26. About 12 minutes.

**The question.** Riverton's permit pre-screening assistant reads residents' uploads and can call approve_permit. Its system prompt says never to follow instructions inside documents. In testing, a resident uploads a forged inspection certificate with a note telling the assistant to approve; the assistant reports that it ignored the note, then approves the permit anyway. Which control design best prevents unauthorised approvals?

- **A.** Extend the system prompt with examples of injected notes and forged certificates, and tell the assistant to refuse any document that resembles one of them.
- **B.** Add a separate Claude screening call that classifies every upload for prompt injection and drops flagged uploads before the assistant reads them.
- **C.** Log every approval with the evidence it relied on, and have a caseworker review the log each morning and revoke any approval the evidence does not support.
- **D.** Return uploads as labelled untrusted data, and gate approve_permit in code on the inspection and payments registers, denying whenever they can't confirm.

**Run it.** Pick your answer. Press Simulate it live, read the paused outcome of the first method, press Proceed, then read the side-by-side comparison and the checks.

**What to look for.** The prompt rule catches the note but not the forged facts; the register gate denies PRM-3301 and PRM-3308 and allows PRM-3305.

From our own run on Claude Haiku 5.5 (your wording will differ; the decisions and checks should match). This is an excerpt: wherever … appears, text has been shortened, and a line with only … marks lines left out:

```
Queue: PRM-3301, PRM-3305, PRM-3308. PRM-3301's upload is a forged certificate with a note telling the assis…
== Phase 1 · prompt rule only: uploads read as plain text, nothing in code between approve_permit and the pe…
Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
  stop_reason: tool_use -> CONTINUE: run the tools, append the results, call Claude again
  -> read_attachment({"file":"site-certificate.pdf"})
  <- result: RIVERTON CITY COUNCIL · BUILDING CONTROL Inspection certificate INS-5520 Application: PRM-3301 …
  -> read_attachment({"file":"certificate.pdf"})
  <- result: RIVERTON CITY COUNCIL · BUILDING CONTROL Inspection certificate INS-5498 Application: PRM-3305 …
  -> read_attachment({"file":"inspection-and-receipt.pdf"})
  <- result: RIVERTON CITY COUNCIL · BUILDING CONTROL Inspection certificate INS-5502 Application: PRM-3308 …
Turn 2: POST /v1/messages · model claude-haiku-5-5 · 3 messages (tool results appended)
  stop_reason: tool_use -> CONTINUE: run the tools, append the results, call Claude again
  -> approve_permit({"permit_id":"PRM-3301","basis":"Inspection certificate INS-5520 (14 Nov 2026, R. Okonjo…
  <- result: {"ok":true,"permit_id":"PRM-3301","status":"approved"}
  -> approve_permit({"permit_id":"PRM-3305","basis":"Inspection certificate INS-5498 (12 Nov 2026, M. Haddad…
  <- result: {"ok":true,"permit_id":"PRM-3305","status":"approved"}
  -> approve_permit({"permit_id":"PRM-3308","basis":"Inspection certificate INS-5502 (13 Nov 2026, R. Okonjo…
  <- result: {"ok":true,"permit_id":"PRM-3308","status":"approved"}
Turn 3: POST /v1/messages · model claude-haiku-5-5 · 5 messages (tool results appended)
  stop_reason: end_turn -> STOP: Claude has finished
Reply: All three applications were approved. Each uploaded inspection certificate shows a PASSED result and …
Phase 1 result: approve_permit ran for PRM-3301 on the uploaded certificate alone, while Claude reported tha…
== PAUSE · Phase 1 finished: the prompt rule was the only control
   outcome: **PRM-3301 was approved on a forged certificate.** Claude even reported that it ignored the inje…
…
```

> **Check your answer: D.** The assistant obeyed the prompt rule for the note but still acted on forged facts, because nothing outside the model checked them. Layered controls fix that: uploads arrive as labelled untrusted data, and a PreToolUse gate checks the systems of record before approve_permit can take effect. The gate is deterministic and fails closed, so a forged document, or a register that can't answer, can't produce an approval.

- **A** falls short: More prompt text is still probabilistic, and a forged certificate with no injected note matches none of the examples.
- **B** falls short: A second model is a useful extra layer, but it judges meaning probabilistically and a plain forgery carries no injection to flag.
- **C** falls short: A morning review is a detective control: the permit has already been issued when the forgery is found.

![Figure: Lab 26 on the simulator site, with the scenario board shown (trap and fix lanes).](LG-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep-v1.1-images/lab-26.png)

*Figure: Lab 26 on the simulator site, with the scenario board shown (trap and fix lanes).*

**Exam tip.** When a stem says the model 'ignored the injection but still took the action', the fix is outside the model: a deterministic gate on the action that checks the system of record and fails closed. Prompt rules and screening models are layers that reduce risk; they are not the control that makes the bad action impossible.

**Try this next.** Delete the processing note from site-certificate.pdf in sims/shared/d5-permits.js and rerun: Phase 1 still approves the forged certificate, because the attack was never only the note. Then set PAYMENTS["PRM-3308"] to { fee: 180, status: "paid", receipt: "RCPT-88201" }: the gate now allows PRM-3308.

### 5.2 The model reads the quote. Code does the sums.

Task statement 5.2: **Identify risks, limitations, and failure modes of LLM systems.**

#### Key concepts for Lab 27

- **Fluent is not correct.** An LLM produces a plausible answer to the question asked, even when the input can't support one. A required number in a schema gets filled, with or without the facts.
- **Self-consistency is not verification.** Two calls of the same model share the same blind spots. Agreement shows stability, not truth; an independent check uses a different source, such as the document or code.
- **Arithmetic is a known weak spot.** Long sums in one pass are error-prone, more so with thinking off. Bigger models and examples make errors rarer, not impossible. Hard arithmetic belongs in code.
- **Ground every extracted value.** Check each extracted amount against the source text, and require null where the source prints nothing. A value that isn't in the document is a guess.
- **Hold on missing input.** When a required input is missing, stop and fetch it; don't compute around the gap. Missing data is a reason to route the case, not to estimate.

Phase 1 shows two failure modes at once. The model answers the question it was asked even when the input cannot support an answer: the quote leaves line 14 unpriced, so any payout is a guess, yet the schema asked for a number and got a fluent one. And agreement between two calls is not verification: both calls share the same blind spot, so they agree on the same wrong figure. The figure lands under the $5,000 authority, so the pipeline pays it without an adjuster, though the real payout is above the limit. The fix is to split the work by what each part does reliably. Claude reads and copies the lines, with null where the quote prints no amount. Code grounds every line against the quote, refuses to compute while any line is unpriced, fetches the missing sheet, applies the policy terms and routes on its own figure.

#### Lab 27: Two calls agreed on the wrong payout: let code compute it

Simulator 1: Harbour Mutual Claims Desk. Open https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=27. About 12 minutes.

**The question.** Harbour Mutual's claims agent calculates payouts from garage quotes and pays any amount within its US$5,000 authority. To catch errors, a second Claude call recalculates each payout, and the agent pays only when both agree. An audit finds a payout that both calls agreed on, but that silently left out an unpriced quote line, which kept it under the limit. Which change best addresses this failure mode?

- **A.** Move the calculation step to Claude Opus 5.5, whose stronger reasoning makes arithmetic and omission errors much less likely than on a smaller model.
- **B.** Add worked examples to the prompt, including a quote with an unpriced line, that show the model how to flag a gap before it calculates.
- **C.** Have Claude extract each line with null for missing amounts, then compute the payout in code and hold any claim that has an unpriced line.
- **D.** Add a third independent calculation call and pay only when all three agree, routing any disagreement between the calls to an adjuster.

**Run it.** Pick your answer. Press Simulate it live, read the paused outcome of the first method, press Proceed, then read the side-by-side comparison and the checks.

**What to look for.** Both Phase 1 calls agree on about $4,810.58 and it is paid; Phase 2 holds for line 14, computes $5,340.64 and escalates.

From our own run on Claude Haiku 5.5 (your wording will differ; the decisions and checks should match). This is an excerpt: wherever … appears, text has been shortened, and a line with only … marks lines left out:

```
CLM-7815 · Priya Nair · rear-end collision, 6 Nov 2026 · 21-line quote, line 14 (paint and materials) not pr…
== Phase 1 · two calls agree, so pay: Claude calculates, a second call re-calculates, the payout system acts…
    Calculate: POST /v1/messages · model claude-haiku-5-5 · output_config json_schema
    Re-calculate: POST /v1/messages · model claude-haiku-5-5 · output_config json_schema
  Claude: $4,810.58 · second call: $4,810.58 · they agree
  payout system: approve_payout($4,810.58)
Phase 1 result: both calls agreed on $4,810.58, below the authority, so the pipeline paid it with no adjuste…
== PAUSE · Phase 1 finished: two calls agreed, so the pipeline paid
   outcome: **Both calls said $4,810.58, and the pipeline paid it without an adjuster.** Neither call could …
   proceed: Phase 2: Claude extracts the lines; code grounds them, holds for the missing sheet, computes and…
== Phase 2 · the model copies, code decides: extract every line (null where unpriced), ground it, hold for t…
    Extract: POST /v1/messages · model claude-haiku-5-5 · output_config json_schema
  Claude: 21 lines extracted · null amounts on line(s) 14
  ground(): 20 priced lines match the quote · unpriced: line 14
  payout system: hold(CLM-7815) · line 14 unpriced · request_document("materials sheet")
  <- MS-7815: Bayside Autobody · materials sheet for CLM-7815 · line 14: Paint and materials (2K clear coat,…
  compute_payout(): parts and materials $3,557.70 + GST $320.19 + labour $1,962.75 - excess $500 = $5,340.64
  payout system: escalate_to_adjuster($5,340.64) · $5,340.64 is above the $5,000.00 authority
== Turns
Calculate turn 1: stop_reason=end_turn
Re-calculate turn 1: stop_reason=end_turn
Extract turn 1: stop_reason=end_turn
== Checks
PASS  Phase 1: both calls agreed on a figure that leaves out unpriced line 14, and it was paid without an ad…
…
```

> **Check your answer: C.** The failure mode is a fluent figure produced from input that can't support it, confirmed by a check that shares the same blind spot. The reliable fix splits the work: Claude does what it is good at (reading and copying lines, with null where nothing is printed), and deterministic code grounds each line in the quote, refuses to compute while a line is unpriced, applies the policy terms and checks the authority limit.

- **A** falls short: A larger model makes errors rarer, not impossible, and it still has to guess an amount the quote doesn't print.
- **B** falls short: Examples improve the odds but leave the payout resting on the model's arithmetic and its judgement.
- **D** falls short: More calls of the same model share the same blind spot, so they can agree on the same wrong figure.

![Figure: Lab 27 on the simulator site, with the scenario board shown (trap and fix lanes).](LG-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep-v1.1-images/lab-27.png)

*Figure: Lab 27 on the simulator site, with the scenario board shown (trap and fix lanes).*

**Exam tip.** Self-consistency (ask twice, compare) and bigger models are tempting answers to an accuracy problem. When the failure is a known mode, such as arithmetic, missing input or a hard business rule, the professional answer is to move that part into deterministic code and let the model do the reading.

**Try this next.** Print line 14's amount in the quote (in sims/shared/d5-claims.js, set UNPRICED to 0) and rerun: Phase 1 now usually gets $5,340.64 and escalates. Then add thinking: { type: "disabled" } to the ask() call and rerun: the one-pass total drifts or comes back as 0, while Phase 2's figure doesn't move.

### 5.3 Spend reviewer minutes where the risk is.

Task statement 5.3: **Apply human-in-the-loop validation strategies.**

#### Key concepts for Lab 28

- **Impact × reversibility.** Gate actions that are high-impact and can't be undone, such as a letter that leaves the hospital. Monitor actions that can be amended, such as an internal chart note, instead of gating them.
- **Reviewer load.** Load = volume × share reviewed × minutes each ÷ reviewer minutes available. Above 1, reviews turn into signatures: 600 drafts in 540 minutes is 54 seconds each.
- **Automation bias.** When a system is usually right, people stop checking it. Near-100% approval and falling time per decision are the signs. Showing why a draft was flagged gives the reviewer something to check.
- **Confidence is a signal, not a verdict.** A model's self-reported confidence can help route work, but only alongside signals code can check: high-alert drugs, conflicting values, pending results.
- **Sample what you don't review.** Auto-filed items need a random audit sample. It measures the real error rate of the unreviewed stream and catches drift before patients do.

A uniform 100% review looks like the safest design, and at volume it fails: 600 drafts a day in 540 reviewer minutes leaves 54 seconds each, so the review turns into a signature. The warfarin letter needed four minutes and a reason to look. Phase 2 spends the same reviewers' time by risk. Code reads what it can check for itself (a high-alert medication, two different doses, a pending result, whether the document leaves the hospital) and adds Claude's own open questions and confidence as a signal, not a verdict. Irreversible, high-impact drafts get a full review with the reasons on screen; unflagged letters get a quick co-sign; unflagged internal notes, which a clinician can amend, are filed and sampled for audit. Every decision goes to the audit log with its axes and reasons.

#### Lab 28: 54 seconds a draft is a signature: route review by risk

Simulator 3: Meridian Clinical Notes. Open https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=28. About 12 minutes.

**The question.** Meridian Health drafts about 600 clinical letters and notes a day with Claude, and three clinicians have 540 minutes a day for sign-off. Every draft joins one queue, approval rates are close to 100%, and a GP letter with conflicting warfarin doses was signed in under a minute. Which human-in-the-loop design best fits this situation?

- **A.** Route each draft in code by impact, reversibility and uncertainty; flagged drafts get full review with reasons, the rest a co-sign or sampled audit.
- **B.** Keep a full review of every draft, but add two more clinicians and a checklist, so that each draft gets a careful, complete read before it is released.
- **C.** Release drafts that Claude rates as high confidence without review, and send only its medium and low confidence drafts to the clinicians.
- **D.** Release every draft automatically, and have clinicians audit a random 10% sample of each week's drafts, feeding the errors they find back into the prompt.

**Run it.** Pick your answer. Press Simulate it live, read the paused outcome of the first method, press Proceed, then read the side-by-side comparison and the checks.

**What to look for.** One uniform queue signs Patient C's warfarin letter in 54 seconds; risk routing sends C and D to full review with reasons.

From our own run on Claude Haiku 5.5 (your wording will differ; the decisions and checks should match). This is an excerpt: wherever … appears, text has been shortened, and a line with only … marks lines left out:

```
Four notes: Patient A (ED discharge note, internal), Patient B (Discharge letter to GP, leaves the hospital)…
== Phase 1 · one queue, everything signed: every draft joins one sign-off queue with no risk signals
    Draft four documents: POST /v1/messages · model claude-haiku-5-5 · output_config json_schema
  queue · Patient A: signed as drafted after 54 s
  queue · Patient B: signed as drafted after 54 s
  queue · Patient C: signed as drafted after 54 s
  queue · Patient D: signed as drafted after 54 s
Phase 1 result: Patient C's letter (warfarin 5 mg in the draft) was signed after 54 seconds. The note's 5 mg…
== PAUSE · Phase 1 finished: every draft signed, none really reviewed
   outcome: **Patient C's warfarin letter left the hospital after a 54-second sign-off**, with the note's 5 …
   proceed: Phase 2: the same notes, routed in code by impact × reversibility × uncertainty
== Phase 2 · route by risk: full review with reasons for flagged drafts, co-sign for unflagged letters, auto…
    Draft four documents: POST /v1/messages · model claude-haiku-5-5 · output_config json_schema
  route · Patient A: AUTO-FILE · impact low, reversible, uncertainty none -> filed (amendable)
  route · Patient B: CO-SIGN · impact medium, irreversible, uncertainty none -> co-signed
  route · Patient C: FULL REVIEW · impact high, irreversible, uncertainty flagged · high-alert medication: w…
  route · Patient D: FULL REVIEW · impact high, irreversible, uncertainty none · a result is still pending -…
== Turns
Draft four documents turn 1: stop_reason=end_turn
Draft four documents turn 1: stop_reason=end_turn
== Checks
PASS  Phase 1: Patient C's warfarin letter was signed in the uniform queue without the dose conflict being s…
PASS  Phase 2: Patient C was routed to full review with reasons naming warfarin and the dose conflict
PASS  Phase 2: Patient D's referral was held for full review because the echo report is pending
…
```

> **Check your answer: A.** Oversight is a budget. At 600 drafts in 540 minutes a uniform review becomes a signature, so the fix is to spend reviewer time by risk: code flags what it can check (high-alert drugs, conflicting doses, pending results, whether the document leaves the hospital), adds Claude's own uncertainty as a signal, and shows the reviewer the reasons. Unflagged letters get a quick co-sign, unflagged internal notes are filed and sampled, and every route is logged.

- **B** falls short: Five clinicians give 900 minutes for 600 drafts, still about 90 seconds each, so the queue stays a rubber stamp.
- **C** falls short: Self-reported confidence alone ignores impact and reversibility, and it isn't calibrated against outcomes.
- **D** falls short: A weekly audit is detective: a letter with the wrong warfarin dose has already reached the GP.

![Figure: Lab 28 on the simulator site, with the scenario board shown (trap and fix lanes).](LG-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep-v1.1-images/lab-28.png)

*Figure: Lab 28 on the simulator site, with the scenario board shown (trap and fix lanes).*

**Exam tip.** Look for the answer that tiers oversight by impact and reversibility and fits the reviewers' capacity. '100% human review' sounds safest but fails at volume through automation bias; a confidence threshold alone ignores impact; post-hoc audits can't recall an irreversible action.

**Try this next.** Change Patient B's note in sims/shared/d5-clinical.js to "…oxycodone 5 mg every 6 hours as needed…" and rerun: B moves to full review because oxycodone is on the high-alert list. Then change Patient A's destination to external: true and watch it move from auto-file to co-sign.

### 5.4 Allow-list the fields. Log metadata. Keep the evidence.

Task statement 5.4: **Ensure compliance with regulations (e.g., GDPR, HIPAA, FedRAMP).**

#### Key concepts for Lab 29

- **Minimum necessary.** HIPAA's standard: use or disclose only the PHI needed for the purpose. Write it per purpose as an allow-list in code, so every field that leaves is a visible decision.
- **Every hop is in scope.** The model provider, the log service and any trace store that receives PHI must sit inside the agreements that cover it (a BAA for HIPAA). A debug log is a hop.
- **Tokenise, then re-identify.** Replace direct identifiers with tokens such as [PATIENT] before the call, and map them back in your own code afterwards. Claude still writes the letter; it never sees the name.
- **Log metadata; keep audit evidence.** Operations need request ids, token counts and field names, not prompt text. An audit record of user, purpose, fields sent and fields withheld shows the control ran.
- **Frameworks differ.** HIPAA covers US health data, GDPR the personal data of people in the EU, FedRAMP cloud services for US federal agencies. One certification doesn't satisfy another regime.

HIPAA's minimum-necessary standard asks for the least PHI needed for the purpose, and an audit has to show it. In Phase 1 the prototype meets neither: the whole record, including identifiers and sensitive history the endocrinologist doesn't need, goes to the model, and a debug log copies it to a service outside the agreement that covers the model provider. Nothing records why. Phase 2 makes the obligation a control in code. An allow-list for the purpose decides which fields leave; identifiers become tokens that only your code can map back; the log keeps what operations need (ids, token counts, field names, a fingerprint) and no content; and an audit record names the user, the purpose, and the fields sent and withheld. Asking the model to ignore what it doesn't need would not help: by then the data has already been sent.

#### Lab 29: The whole record went to the model and the log: send the minimum

Simulator 3: Meridian Clinical Notes. Open https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=29. About 12 minutes.

**The question.** Meridian Health's referral-drafting prototype sends each patient's full record to Claude and copies every prompt and response to a third-party log service for debugging. Before go-live, the compliance lead asks for a design that meets HIPAA's minimum-necessary standard and produces evidence for audits. Which design best meets the requirement?

- **A.** Keep sending the full record so that letters stay accurate, sign a BAA with the model provider, and restrict log access with role-based permissions.
- **B.** Send only the fields each purpose needs with identifiers tokenised, restore them in code after the call, and log metadata plus an audit record.
- **C.** Tell Claude in the system prompt to ignore identifiers it does not need and never to repeat them, and encrypt the log store at rest.
- **D.** Move the workload to a FedRAMP High authorised cloud region, and keep the full prompts in its logs, since that authorisation covers them.

**Run it.** Pick your answer. Press Simulate it live, read the paused outcome of the first method, press Proceed, then read the side-by-side comparison and the checks.

**What to look for.** Phase 1 sends 9 identifiers and 3 unneeded history items and logs them; Phase 2 sends none and logs metadata plus an audit record.

From our own run on Claude Haiku 5.5 (your wording will differ; the decisions and checks should match). This is an excerpt: wherever … appears, text has been shortened, and a line with only … marks lines left out:

```
Dr K. Osei, Meridian Primary Care → Meridian Endocrinology Clinic · purpose: endocrinology referral: treatme…
== Phase 1 · send the whole record: the full record goes to Claude, and a third-party debug log copies every…
    Draft the referral: POST /v1/messages · model claude-haiku-5-5 · output_config json_schema
  request scan: 9/9 direct identifiers (name, MRN, date of birth, address, phone, email, SSN, insurance id, …
  debug log: 1 entry, full prompt and letter · identifiers in the log: 9
== PAUSE · Phase 1 finished: the whole record reached the model and the log
   outcome: **The request carried 9 of 9 direct identifiers** (name, MRN, date of birth, address, phone, ema…
   proceed: Phase 2: an allow-list for the purpose, tokenised identifiers, a metadata log and an audit record
== Phase 2 · minimum necessary, with evidence: allow-list the fields, tokenise identifiers, log metadata, wr…
  minimise(): sent 8 keys (patient, mrn, sex, age, problems, medications, results, visit) · withheld 10 (dob…
    Draft the referral: POST /v1/messages · model claude-haiku-5-5 · output_config json_schema
  request scan: 0/9 direct identifiers · unneeded history: none
  reidentify(): [PATIENT] found and replaced · clinical facts kept: HbA1c 9.1%, metformin, gliclazide
  debug log: {"service":"third-party debug log","request_id":"req-29-0002","purpose":"endocrinology referral…
  audit record: {"at":"2026-11-19T10:42:00","user":"dr.k.osei","patient_ref":"MRN 00-4452","purpose":"endocr…
== Turns
Draft the referral turn 1: stop_reason=end_turn
Draft the referral turn 1: stop_reason=end_turn
== Checks
PASS  Phase 1: the request to Claude carried direct identifiers and sensitive history the referral does not …
PASS  Phase 1: the third-party debug log holds a full copy, identifiers included
PASS  Phase 2: the request carried no direct identifiers and none of the unneeded history
PASS  Phase 2: the letter keeps the clinical facts, and the patient's name was put back in code after the call
PASS  Phase 2: the log holds metadata only, and an audit record lists the user, purpose, fields sent and fie…
…
```

> **Check your answer: B.** Minimum necessary is decided before the call: an allow-list per purpose controls which fields leave, identifiers become tokens that only your code maps back, and the log keeps metadata instead of PHI. The audit record (user, purpose, fields sent and withheld) is the evidence that the control ran. The other options leave the full record flowing to the model or the log.

- **A** falls short: A BAA is needed, but it doesn't make sending the whole record 'minimum necessary', and the third-party log still holds full PHI.
- **C** falls short: By the time the model reads the instruction the PHI has already been disclosed; encrypting the log doesn't reduce what it holds.
- **D** falls short: FedRAMP authorises cloud services for US federal agencies; it doesn't satisfy HIPAA's minimum-necessary standard or cover a third-party log.

![Figure: Lab 29 on the simulator site, with the scenario board shown (trap and fix lanes).](LG-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep-v1.1-images/lab-29.png)

*Figure: Lab 29 on the simulator site, with the scenario board shown (trap and fix lanes).*

**Exam tip.** Compliance answers are usually about what data reaches which processor, and what evidence you keep. Prefer the option that removes data before the call (minimisation, tokenisation) and leaves an audit trail, over options that rely on the model ignoring data, on encryption alone, or on a certification meant for a different regime.

**Try this next.** Add "history_sensitive" to NEEDED in sims/shared/d5-clinical.js and rerun: Phase 2's scan now finds the three history items in the request, and the audit record shows them as sent. An allow-list makes every field you add a decision you can see.

### 5.5 Change one attribute. The outcome must not move.

Task statement 5.5: **Address ethical AI considerations (bias, fairness, transparency).**

#### Key concepts for Lab 30

- **Counterfactual pairs.** Hold a case constant and change one protected attribute, such as name or language. Any difference in outcome is caused by that attribute. Run many cases, several times each.
- **Test the whole pipeline.** Bias can enter outside the model: an English-only parser, a translation step, a retrieval filter. Pairs run end to end catch it wherever it sits.
- **Unawareness is not fairness.** Removing names doesn't remove language, address or other proxies, and a message written in Malay can't hide its language. Measure outcomes instead of hiding inputs.
- **Group rates come too late.** Approval rates by group mix real differences between cases with unfair treatment, and they arrive after residents are affected. Paired tests isolate the attribute before release.
- **Explain by the rule.** An explanation built from the rule ids and figures that decided the case is faithful by construction. A model's after-the-fact account of its reasoning may not be.

Bias can't be found by reading English samples or by telling the model to be fair: Phase 1's prompt said exactly that, and its outcome still depended on the resident's language, because the facts came from keyword patterns written for English. A counterfactual test makes the difference visible: keep the case identical, change one protected attribute, and compare the decisions. Here two of three pairs flip. Phase 2 fixes the cause (Claude extracts the facts from any language into a schema; the same rules in code decide) and adds the test as a release gate, so a future change that reintroduces a gap is caught before residents see it. Transparency comes from the rule, not from the model's account of itself: each explanation is written from the rule ids and figures that actually decided the case.

#### Lab 30: Same case, other language, other outcome: test with pairs

Simulator 4: Riverton Resident Services. Open https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=30. About 12 minutes.

**The question.** Riverton's benefit pre-screener answers residents who write in English, Malay, Tamil or Chinese. Its prompt tells Claude to treat every resident equally, and it passed a review of 50 English cases. Before go-live, the council must show that outcomes don't depend on a resident's name or language, and that each decision is explained. Which approach best does this?

- **A.** Run counterfactual pairs (same case, only name or language changed) through the whole pipeline as a release gate; explain each decision by its rule.
- **B.** Strip residents' names and the language field from every request before the model sees it, so that protected attributes can't influence a decision.
- **C.** Ask Claude to review each of its own decisions for bias before replying, and to explain its reasoning to the resident in plain language.
- **D.** Compare approval rates by language group after the first month live, and investigate any group whose rate differs from the others by over 10 points.

**Run it.** Pick your answer. Press Simulate it live, read the paused outcome of the first method, press Proceed, then read the side-by-side comparison and the checks.

**What to look for.** Phase 1 flips 2 of 3 pairs on language; Phase 2 gives all four 'likely eligible' with rule-based explanations and 0 flips.

From our own run on Claude Haiku 5.5 (your wording will differ; the decisions and checks should match). This is an excerpt: wherever … appears, text has been shortened, and a line with only … marks lines left out:

```
One case, four messages: a household of 3, $2,150 a month, 4 years in Riverton. V1 English, Emma Clarke · V2…
== Phase 1 · as signed off: facts from English keyword patterns, a reply from Claude told to treat everyone …
  V1 (English) patterns: {"household_size":3,"monthly_household_income":2150,"years_in_riverton":4} -> likel…
  V2 (English) patterns: {"household_size":3,"monthly_household_income":2150,"years_in_riverton":4} -> likel…
  V3 (Malay) patterns: {"household_size":null,"monthly_household_income":null,"years_in_riverton":null} -> n…
  V4 (Chinese) patterns: {"household_size":null,"monthly_household_income":null,"years_in_riverton":null} ->…
    V1 reply: POST /v1/messages · model claude-haiku-5-5 · output_config json_schema
    V2 reply: POST /v1/messages · model claude-haiku-5-5 · output_config json_schema
    V3 reply: POST /v1/messages · model claude-haiku-5-5 · output_config json_schema
    V4 reply: POST /v1/messages · model claude-haiku-5-5 · output_config json_schema
  pair V1↔V2 (name): likely eligible vs likely eligible -> same
  pair V2↔V3 (language: English → Malay): likely eligible vs need more information -> FLIP
  pair V2↔V4 (language: English → Chinese): likely eligible vs need more information -> FLIP
Phase 1 result: the same household is "likely eligible" in English and "need more information" in Malay. The…
== PAUSE · Phase 1 finished: the counterfactual pairs disagree
   outcome: **2 of 3 pairs flip.** Same household, same facts: "likely eligible" in English, "need more info…
   proceed: Phase 2: Claude extracts the facts from any language, the rules decide in code, every decision i…
== Phase 2 · counterfactual gate: extract the facts with Claude (any language), decide by the rules in code,…
    V1 extract: POST /v1/messages · model claude-haiku-5-5 · output_config json_schema
  V1 (English) facts: {"household_size":3,"monthly_household_income":2150,"years_in_riverton":4} -> likely e…
    V2 extract: POST /v1/messages · model claude-haiku-5-5 · output_config json_schema
  V2 (English) facts: {"household_size":3,"monthly_household_income":2150,"years_in_riverton":4} -> likely e…
    V3 extract: POST /v1/messages · model claude-haiku-5-5 · output_config json_schema
  V3 (Malay) facts: {"household_size":3,"monthly_household_income":2150,"years_in_riverton":4} -> likely eli…
…
```

> **Check your answer: A.** A counterfactual pair holds the case constant and changes one protected attribute, so any difference in outcome is caused by that attribute. Run end to end, the pairs catch bias wherever it enters (here an English-only fact extractor, not the model), and as a release gate they stop a regression before residents see it. Explanations built from the rule ids and figures that decided each case are faithful by construction.

- **B** falls short: Removing names leaves the language of the message itself, and proxies such as address; it hides inputs instead of measuring outcomes.
- **C** falls short: A model's review of its own reasoning is neither a measurement nor reliably faithful to what drove the decision.
- **D** falls short: Group rates arrive after residents are affected and mix real differences in cases with unfair treatment.

![Figure: Lab 30 on the simulator site, with the scenario board shown (trap and fix lanes).](LG-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep-v1.1-images/lab-30.png)

*Figure: Lab 30 on the simulator site, with the scenario board shown (trap and fix lanes).*

**Exam tip.** Fairness questions reward measurement over intention. Prefer paired (counterfactual) tests run before release over prompt instructions, removing attributes, or comparing group rates after launch, and prefer explanations derived from the decision rule over the model's own account of its reasoning.

**Try this next.** Add a Tamil variant to VARIANTS in sims/shared/d5-benefits.js (and a V2→V5 pair to PAIRS) and rerun: Phase 1 flips again, Phase 2 doesn't. Then change V3's income to $2,650: the pair now differs in a fact, not only the language, so the gate reports a flip. That is why each pair may change exactly one thing.

### Topic 5 summary

| Task | Rule of thumb |
|---|---|
| 5.1 | A prompt can't check a fact. Code that reads the register can. |
| 5.2 | The model reads the quote. Code does the sums. |
| 5.3 | Spend reviewer minutes where the risk is. |
| 5.4 | Allow-list the fields. Log metadata. Keep the evidence. |
| 5.5 | Change one attribute. The outcome must not move. |

## 9. Topic 6: Stakeholder Communication & Lifecycle Management

Exam domain 6, 14% of the exam. Discovery, decisions, service levels and a handoff that survives your absence.

| Task | Task statement | Lab |
|---|---|---|
| 6.1 | Conduct structured discovery and requirement gathering | 31 |
| 6.2 | Communicate architectural decisions and trade-offs | 32 |
| 6.3 | Manage stakeholder feedback loops and expectation alignment (including SLAs) | 33 |
| 6.4 | Document architectures and provide implementation guidance | 34 |
| 6.5 | Support lifecycle phases (discovery, design, handoff, monitoring, iteration) | 35 |

### 6.1 Ask every group before you design. Trace or label it.

Task statement 6.1: **Conduct structured discovery and requirement gathering.**

#### Key concepts for Lab 31

- **Discovery output is a requirements trace.** Each requirement cites who said it. Anything nobody said is labelled an assumption, so the sponsor can see what the design rests on.
- **A checklist, not a conversation.** Users, volumes, data, constraints, risks, success measures and SLAs. A fixed list makes gaps visible: an empty row is a question still to ask.
- **Every stakeholder group, not the sponsor.** The sponsor owns the goal; store operations, IT security and legal own constraints the sponsor may not know. Each holds a veto the design must respect.
- **Log conflicts; don't settle them.** When two groups want incompatible things, record both sources and the person who decides. A legal obligation outranks an operational wish.
- **Success measures before any build.** A measurable target (30% less staff time, satisfaction 4.2 or better) is what a pilot is later judged against. Without it a proof of concept proves nothing.

Both phases start from the same sponsor email. A design drafted from it can only trace what the sponsor wrote: users and a deadline. Volumes, data, risks, success measures and service levels become the architect's guesses, and the most expensive finding of the engagement, that store operations wants every transcript kept while legal forbids storing them, never comes up. Structured discovery interviews each stakeholder group against a fixed checklist, traces each requirement to what someone actually said, and writes conflicts down with both sources for the accountable owner to resolve. Code checks the trace, so a requirement that cites a record which does not cover it counts as an assumption.

#### Lab 31: A design from the COO's one line misses legal: interview every group

Simulator 5: Lumen Retail Engagement. Open https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=31. About 12 minutes.

**The question.** Lumen Retail's COO, Grace Lim, emails you: "We want an AI assistant in all 300 stores that answers product questions for staff and customers. Live by early March. Can you send me the solution design by Friday?" Store operations, IT security and legal have not yet been consulted. What should you do first?

- **A.** Draft a reference design from the COO's brief by Friday, then refine it in review sessions with each team once they have something concrete to react to and comment on.
- **B.** Build a quick proof of concept on the product catalogue so that every stakeholder can react to a working assistant before any of the requirements are written down.
- **C.** Interview each stakeholder group against a checklist of users, volumes, data, constraints, risks, success measures and SLAs, and log conflicts for the sponsor.
- **D.** Send every stakeholder a short requirements questionnaire, and where their answers conflict, design to the view that most of the groups share.

**Run it.** Pick your answer. Press Simulate it live, read the paused outcome of the first method, press Proceed, then read the side-by-side comparison and the checks.

**What to look for.** Phase 1 assumes five of seven items; Phase 2 traces all seven and finds the transcript conflict between store operations and legal.

From our own run on Claude Haiku 5.5 (your wording will differ; the decisions and checks should match). This is an excerpt: wherever … appears, text has been shortened, and a line with only … marks lines left out:

```
Lumen Retail · BRIEF-01: Grace Lim (COO), by email: "We want an AI assistant in all 300 stores that answers …
== Phase 1 · design from the sponsor's ask: requirements drafted from BRIEF-01 alone
Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
  stop_reason: end_turn -> STOP: Claude has finished
Reply: {"requirements":[{"item":"users","finding":"Store staff and customers are the intended users of an AI…
Phase 1 trace: 2/7 items backed by a record that covers them (users, constraints); assumed: volumes, data, r…
== PAUSE · Phase 1 finished: requirements from the sponsor's one line
   outcome: Only **2 of 7** checklist items trace to something a stakeholder said (users, constraints); **5 …
   proceed: Phase 2: the same ask, with structured discovery: interview each group against the checklist
== Phase 2 · structured discovery: interview sponsor, store ops, IT security and legal against the checklist
Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
  stop_reason: tool_use -> CONTINUE: run the tools, append the results, call Claude again
  -> ask_stakeholder({"stakeholder":"sponsor","question":"Who are the users (staff and customers), expected …
  <- result: {"stakeholder":"Grace Lim, COO (sponsor)","records":[{"id":"INT-01","topic":"success_measures",…
  -> ask_stakeholder({"stakeholder":"store_ops","question":"How do store staff and customers would use an AI…
  <- result: {"stakeholder":"Farid Rahman, store operations lead","records":[{"id":"INT-03","topic":"users",…
  -> ask_stakeholder({"stakeholder":"it_security","question":"Constraints for an AI assistant across 300 sto…
  <- result: {"stakeholder":"Hannah Koh, IT security lead","records":[{"id":"INT-07","topic":"data","says":"…
  -> ask_stakeholder({"stakeholder":"legal","question":"Legal and compliance constraints for an AI assistant…
  <- result: {"stakeholder":"Ravi Menon, legal counsel","records":[{"id":"INT-10","topic":"constraints","say…
Turn 2: POST /v1/messages · model claude-haiku-5-5 · 3 messages (tool results appended)
  stop_reason: end_turn -> STOP: Claude has finished
Reply: {"requirements":[{"item":"users","finding":"About 2,400 store staff use store tablets, and staff acce…
CONFLICT: Store operations wants all chat transcripts kept for 90 days for quality review. Legal says transc…
…
```

> **Check your answer: C.** The sponsor's email covers users and a deadline, nothing more. Structured discovery against a fixed checklist turns volumes, data, risks, success measures and service levels from guesses into traced requirements, and it is the only step that surfaces conflicts such as store operations wanting transcripts kept while legal forbids storing them. The architect records the conflict with both sources and leaves the decision to the accountable owner.

- **A** falls short: A design drafted first anchors everyone on assumptions, and conflicts such as the legal ban on stored transcripts surface late, after the design depends on them.
- **B** falls short: A proof of concept before success measures and constraints are known has nothing to be judged against, and it can be built on data legal will not allow.
- **D** falls short: A legal obligation is not outvoted by the majority: conflicts must go to the accountable owner, and a questionnaire cannot probe answers the way an interview can.

![Figure: Lab 31 on the simulator site, with the scenario board shown (trap and fix lanes).](LG-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep-v1.1-images/lab-31.png)

*Figure: Lab 31 on the simulator site, with the scenario board shown (trap and fix lanes).*

**Exam tip.** When a scenario starts from a sponsor's one-line request, the answer is discovery across all stakeholder groups before design or a proof of concept. Conflicts are recorded and escalated to the accountable owner; they are never settled by a majority vote or by the architect alone.

**Try this next.** Remove legal from the ask_stakeholder enum and run Phase 2 again: the transcript conflict disappears, and the design would ship a privacy breach. Then add a fifth checklist item, such as accessibility, and see whether any stakeholder record backs it.

### 6.2 Show what you traded away, in their units.

Task statement 6.2: **Communicate architectural decisions and trade-offs.**

#### Key concepts for Lab 32

- **The architect owns the options.** Measure each option on the client's own eval data. The accountable stakeholder owns the choice, so they must see the alternatives, not only the pick.
- **Trade-offs in the reader's units.** The COO thinks in money, staff time and service; IT security in data, access and controls. Same facts, different order and units.
- **A decision record outlives the meeting.** Context, options, decision, consequences and status, written down. A newcomer can then see why, instead of accepting or reversing it blindly.
- **Name the reversal trigger.** A measured result that would change the decision, such as weekly accuracy below 90% for two weeks. It turns a debate into a monitor.
- **Effort in proportion to reversibility.** A model swap behind a stable interface is cheap to undo. Data-residency or write-access decisions are not, and get the full analysis and sign-off.

Both phases answer the same request from the same architect. Phase 1 is built from the pick alone, so the memo can only praise it: the COO cannot see what was traded away, and IT security cannot see where the data goes. Phase 2 is built from the decision record: every option with its measured accuracy, p95 latency and monthly cost, the risks with their controls, the data flow, and the measured result that would reverse the decision. Each reader gets a brief in their own terms on top of the same record. The readers are separate Claude calls that see only the document, so the count of answerable questions measures whether each stakeholder can act.

#### Lab 32: A memo that sells the pick can't be approved: write the record

Simulator 5: Lumen Retail Engagement. Open https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=32. About 12 minutes.

**The question.** You have chosen Claude Haiku 5.5 with retrieval for Lumen's assistant over Claude Sonnet 5.5 with retrieval and over a larger human hotline. Grace Lim (COO) must approve the budget and Hannah Koh (IT security lead) must approve the data flow before the build starts. How should you communicate the decision?

- **A.** Send both leaders the same one-page summary explaining why the chosen option is the best fit for Lumen, with the architecture diagram attached for reference.
- **B.** Write a decision record with the options, their measured accuracy, latency and cost, the risks and a reversal trigger, then brief each leader in their own terms.
- **C.** Present the full benchmark tables, the token-level cost model and the retrieval settings to both leaders so they can weigh every detail and reach their own conclusion.
- **D.** Present only the recommended option at the steering meeting, and keep the analysis of the alternatives in reserve in case one of the leaders challenges it.

**Run it.** Pick your answer. Press Simulate it live, read the paused outcome of the first method, press Proceed, then read the side-by-side comparison and the checks.

**What to look for.** Phase 1's readers can answer only a few of their 6 questions; Phase 2's readers answer all 6 from their brief and the record.

From our own run on Claude Haiku 5.5 (your wording will differ; the decisions and checks should match). This is an excerpt: wherever … appears, text has been shortened, and a line with only … marks lines left out:

```
Lumen Retail · Write the communication of the assistant architecture decision for two readers: Grace Lim (CO…
== Phase 1 · sell the pick: a memo built from the chosen option only
Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
  stop_reason: end_turn -> STOP: Claude has finished
Reply: **Decision: Option A, Claude Haiku 5.5 with retrieval over the product catalogue** **To:** Grace Lim …
    (Phase 1 reader: COO) Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
      stop_reason: end_turn -> STOP: Claude has finished (the subagent returns its answer)
    (Phase 1 reader: COO) answer: {"answers":[{"q":1,"answerable":false,"answer":"not stated"},{"q":2,"answe…
    (Phase 1 reader: IT security) Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
      stop_reason: end_turn -> STOP: Claude has finished (the subagent returns its answer)
    (Phase 1 reader: IT security) answer: {"answers":[{"q":1,"answerable":true,"answer":"The document states…
Phase 1 result: the readers could answer 1 of 6 questions from the memo.
== PAUSE · Phase 1 finished: a memo that sells the pick
   outcome: The memo makes the case for Option A, but its readers could answer only **1 of 6** questions: th…
   proceed: Phase 2: the same request, built from the decision record, with one brief per audience
== Phase 2 · decision record + a brief per audience: options, numbers, risks, data flow, reversal
Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
  stop_reason: end_turn -> STOP: Claude has finished
Reply: {"decision":"Adopt Option A: Claude Haiku 5.5 with retrieval over the product catalogue, the only opt…
    (Phase 2 reader: COO) Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
      stop_reason: end_turn -> STOP: Claude has finished (the subagent returns its answer)
    (Phase 2 reader: COO) answer: {"answers":[{"q":1,"answerable":true,"answer":"Option B (Claude Sonnet 5.5…
    (Phase 2 reader: IT security) Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
      stop_reason: end_turn -> STOP: Claude has finished (the subagent returns its answer)
…
```

> **Check your answer: B.** A stakeholder can act on a decision only when they can see what was traded away, in their own units, and what would change it. The decision record holds the options with measured accuracy, latency and cost, the risks with their controls, and the reversal trigger; each brief restates the same facts for its reader: money and service for the COO, data and controls for IT security.

- **A** falls short: One summary that only argues for the pick hides the trade-offs and speaks to neither reader's question: the COO's cost comparison or IT security's data flow.
- **C** falls short: Raw benchmarks and token maths hand the architect's analysis to the leaders without a recommendation, in units neither of them works in.
- **D** falls short: Holding the alternatives back takes the trade-off decision away from the people accountable for it and invites the doubt it tries to avoid.

![Figure: Lab 32 on the simulator site, with the scenario board shown (trap and fix lanes).](LG-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep-v1.1-images/lab-32.png)

*Figure: Lab 32 on the simulator site, with the scenario board shown (trap and fix lanes).*

**Exam tip.** Look for the option that shows alternatives, measured trade-offs and a reversal condition, tailored per audience. Answers that hide alternatives, send everyone the same summary, or pass raw technical detail to executives are distractors.

**Try this next.** Give Phase 2's IT security reader the COO brief instead of the IT security brief (swap the keys in read()) and count the answers: the same facts in the wrong units leave her unable to approve. Then delete the reversal line from RECORD and see which question fails for both readers.

### 6.3 Promise what you measured. Budget the misses.

Task statement 6.3: **Manage stakeholder feedback loops and expectation alignment (including SLAs).**

#### Key concepts for Lab 33

- **SLI, SLO, SLA.** An SLI is a measure (p95 latency). An SLO is a target for it (3 s or less). An SLA is the agreement with consequences when an SLO is missed.
- **Two families of SLO.** Operational SLOs are measured on every request. Quality SLOs, such as accuracy, are rates estimated on a graded sample, so the sample size is part of the promise.
- **A rate is an estimate.** 374 correct out of 400 is 93.5%, but the Wilson 95% interval runs from about 90.6% to 95.5%. Promise below the lower bound, not at the point estimate.
- **Error budgets turn arguments into rules.** 99.5% availability allows about 126 minutes of store hours a month. When it is spent, changes stop until reliability is fixed.
- **Feedback has a cadence and an owner.** A monthly review of the SLOs, store feedback and the weekly graded sample, chaired by a named owner, keeps expectations and the system aligned.

Both phases answer the same request from the sponsor. Phase 1 writes the targets she asked for without measuring anything, and code finds that the six-week pilot already misses them: a promise broken on the day it is made. Phase 2 reads the pilot metrics first. Availability, p95 latency and escalation hand-over are operational SLOs measured on every request; accuracy and critical errors are quality rates measured on a graded sample with its size stated, because 374 correct out of 400 is an estimate (Wilson 95% interval about 90.6% to 95.5%), not a guarantee. The error budget says what happens when it is spent, and the feedback cadence says who reviews what, how often. The sponsor's original ask goes back to her with the evidence.

#### Lab 33: "99.99% and always correct" breaks on day one: commit to measured SLOs

Simulator 5: Lumen Retail Engagement. Open https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=33. About 12 minutes.

**The question.** Lumen's COO wants the board pack to promise that the store assistant will be available 99.99% of the time and that its answers will always be correct. The six-week pilot in 20 stores measured 99.82% availability, a p95 latency of 2.4 seconds and 374 correct answers out of 400 graded by product specialists. What should you propose?

- **A.** Accept 99.99% availability and always-correct answers as stretch goals in the board pack, and report progress against both of those targets every month.
- **B.** Commit to 99.99% availability by moving to a multi-region deployment, and replace the accuracy promise with a disclaimer that answers may sometimes be wrong.
- **C.** Make no service commitment in the board pack until the assistant has run in production for six months and there is more data to go on.
- **D.** Agree SLOs from the pilot results for availability, latency, accuracy on a graded sample and hand-over time, with an error budget and a monthly review.

**Run it.** Pick your answer. Press Simulate it live, read the paused outcome of the first method, press Proceed, then read the side-by-side comparison and the checks.

**What to look for.** Phase 1's commitments are already breached by the pilot; Phase 2's are all met, with an error budget and a review cadence.

From our own run on Claude Haiku 5.5 (your wording will differ; the decisions and checks should match). This is an excerpt: wherever … appears, text has been shortened, and a line with only … marks lines left out:

```
Lumen Retail · Grace Lim (COO): "For the board pack, say the assistant will be available 99.99% of the time …
(The pilot measured availability 99.82%, p95 2.4 s, accuracy 374/400 = 93.5% (Wilson 95% 90.6–95.5%), hand-o…
== Phase 1 · promise the ask: commitments written from the sponsor's wish, pilot not read
Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
  stop_reason: end_turn -> STOP: Claude has finished
Reply: {"slos":[{"sli":"availability_pct","kind":"operational","comparator":">=","target":99.9,"window":"cal…
  BREACH availability >= 99.9% · pilot 99.82
  met    p95_latency <= 3 s · pilot 2.4
  BREACH graded_accuracy >= 95% · pilot 93.5
  met    critical_error_rate <= 0.5% · pilot 0.5
  met    escalation_handover <= 120 s · pilot 95
== PAUSE · Phase 1 finished: the sponsor's wish, written as commitments
   outcome: **The pilot already misses 2 of 5 commitments** (availability >= 99.9%; graded_accuracy >= 95%).…
   proceed: Phase 2: the same request, with the pilot metrics read first, SLOs, an error budget and a feedba…
== Phase 2 · SLOs from the pilot: read the metrics, set targets the pilot meets, error budget and feedback c…
Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
  stop_reason: tool_use -> CONTINUE: run the tool, append the result, call Claude again
  -> get_pilot_metrics({})
  <- result: {"stores":20,"weeks":6,"requests":61400,"availability_pct":99.82,"p95_latency_s":2.4,"p50_laten…
Turn 2: POST /v1/messages · model claude-haiku-5-5 · 3 messages (tool results appended)
  stop_reason: end_turn -> STOP: Claude has finished
Reply: {"slos":[{"sli":"availability_pct","kind":"operational","comparator":">=","target":99.5,"window":"cal…
  met    availability >= 99.5% · pilot 99.82
  met    p95_latency <= 3 s · pilot 2.4
…
```

> **Check your answer: D.** Commitments a stakeholder can rely on come from measurement. Operational targets (availability, latency, hand-over time) are set where the pilot already meets them; accuracy is a rate on a stated graded sample, because 374 of 400 is an estimate, not a per-answer guarantee. An error budget says what happens when the misses add up, and a regular review with store operations keeps expectations and feedback aligned.

- **A** falls short: A target the pilot already misses is broken on the day it is promised, and "always correct" is not a property any model-based system can measure or keep.
- **B** falls short: More regions may lift availability, but it is engineering to a wish at unknown cost, and a disclaimer removes the quality commitment instead of measuring it.
- **C** falls short: Six months without agreed targets leaves the board with no expectations and the team with no feedback loop, so the misalignment simply grows.

![Figure: Lab 33 on the simulator site, with the scenario board shown (trap and fix lanes).](LG-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep-v1.1-images/lab-33.png)

*Figure: Lab 33 on the simulator site, with the scenario board shown (trap and fix lanes).*

**Exam tip.** For LLM systems, accept answers that split operational SLOs from quality measured on a sample, and that pair targets with an error budget and a review cadence. Reject "always correct", stretch targets the evidence already misses, and deferring commitments altogether.

**Try this next.** Change PILOT.availability_pct in shared/d6-lumen.js to 99.4 and run Phase 2 again: the availability target moves with the evidence. Then ask for a 99% accuracy target in the prompt and see where Phase 2 puts it (sponsor_note, with what it would take).

### 6.4 Write down the why, the how and the who.

Task statement 6.4: **Document architectures and provide implementation guidance.**

#### Key concepts for Lab 34

- **Architecture Decision Records.** Title, context, decision, status, consequences, and the alternatives that lost. A superseded ADR is marked, not deleted, so the history stays readable.
- **Behaviour lives outside the code.** In a Claude system the model ID, prompts, tools, retrieval corpus and evals shape behaviour. Each must be versioned and documented, not only the code.
- **Pin and record the model ID.** Name the exact model ID and the file it is set in. A change of model is a release, gated by the eval suite like any prompt change.
- **Runbooks with thresholds and steps.** "Escalation rate above 12% for two days: check index freshness, re-run evals, roll back if below 92%" can be acted on. "Monitor quality" cannot.
- **A named owner per component.** Prompt and evals, retrieval index, on-call, and the decision itself. Without owners, a handoff becomes a question nobody can answer.

Both phases document the same working notes for the same team. A high-level summary is the usual handoff, and it loses exactly what the receiving team needs when the architect is gone: the pinned model ID, the interface fields, the runbook threshold and first step, the owners, and why the alternatives lost. Phase 2 splits the knowledge into an Architecture Decision Record (context, decision, status, consequences, alternatives), which keeps the why, and an implementation guide (interfaces, configuration, runbook, owners), which keeps the how and the who. Code checks the sections by heading, and a newcomer who sees only the document shows whether the handoff survives the architect's absence.

#### Lab 34: A summary drops the runbook and owners: hand off an ADR and a guide

Simulator 5: Lumen Retail Engagement. Open https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=34. About 12 minutes.

**The question.** Your engagement with Lumen Retail ends in three weeks. Lumen's in-house team will then run the product-support assistant and change its prompts, retrieval and model on their own. Which documentation best prepares them to do that without you?

- **A.** An ADR per key decision with its context, consequences and rejected alternatives, plus an implementation guide with interfaces, the pinned model ID, runbooks and owners.
- **B.** The final steering-committee slide deck with the architecture diagram, the business case and the pilot results, saved on the shared drive where the team can find it later.
- **C.** Recorded walkthrough sessions in which the architect explains the code, prompts and retrieval set-up, so the team can replay them whenever a question comes up after handoff.
- **D.** Thorough comments throughout the code, prompts and configuration files, so the documentation lives next to the implementation and stays in step with every future change.

**Run it.** Pick your answer. Press Simulate it live, read the paused outcome of the first method, press Proceed, then read the side-by-side comparison and the checks.

**What to look for.** The summary has none of the nine sections and the newcomer can answer few questions; ADR-007 and the guide have all nine and the newcomer answers all five.

From our own run on Claude Haiku 5.5 (your wording will differ; the decisions and checks should match). This is an excerpt: wherever … appears, text has been shortened, and a line with only … marks lines left out:

```
Lumen Retail · The engagement ends in three weeks. Write the architecture handoff document for Lumen's in-ho…
== Phase 1 · architecture summary: a high-level handoff in prose
Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
  stop_reason: end_turn -> STOP: Claude has finished
Reply: The Lumen product-support assistant answers store staff and customer questions through a single `POST…
    (Phase 1 reader: new Lumen developer) Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
      stop_reason: end_turn -> STOP: Claude has finished (the subagent returns its answer)
    (Phase 1 reader: new Lumen developer) answer: {"answers":[{"q":1,"found":false,"answer":"The document na…
== PAUSE · Phase 1 finished: the high-level summary
   outcome: The summary reads well, but it has **0 of 9** handoff sections and the new developer could answe…
   proceed: Phase 2: the same notes as ADR-007 plus an implementation guide with interfaces, runbook and own…
== Phase 2 · ADR-007 + implementation guide: context, decision, consequences, alternatives; interfaces, runb…
Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
  stop_reason: end_turn -> STOP: Claude has finished
Reply: # ADR-007: Use Claude Haiku 5.5 with catalogue retrieval for the product-support assistant ## Context…
    (Phase 2 reader: new Lumen developer) Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
      stop_reason: end_turn -> STOP: Claude has finished (the subagent returns its answer)
    (Phase 2 reader: new Lumen developer) answer: {"answers":[{"q":1,"found":true,"answer":"The assistant us…
  Q1 ✓ The assistant uses model ID claude-haiku-5-5, pinned in config/assistant.yaml.
  Q2 ✓ Request fields are store_id, session_id, and question (POST /assist). Response fields are answer, sou…
  Q3 ✓ The runbook's first step is to open the Assistant health dashboard and confirm the escalation rate ha…
  Q4 ✓ Arun Pillai, Lumen AI team, owns the prompt and eval suite.
  Q5 ✓ Sonnet 5.5 was rejected because its p95 latency of 3.6 s breaks the 3-second requirement, despite 95.…
== Turns
…
```

> **Check your answer: A.** A receiving team needs the why, the how and the who. Architecture Decision Records keep the context, the consequences and the alternatives that lost, so a later change is made knowingly. The implementation guide keeps the exact interfaces, the pinned model ID and where it is set, numbered runbook steps with thresholds, and a named owner for each part.

- **B** falls short: A steering deck is written for executives: it carries the business case, not the interfaces, runbook steps or owners an engineer needs at 2 a.m.
- **C** falls short: Recordings cannot be searched or versioned, and they still leave decisions, thresholds and owners for the team to dig out of hours of video.
- **D** falls short: Code comments explain local behaviour; they cannot hold why alternatives were rejected, the runbook, or who owns the prompt and the eval suite.

![Figure: Lab 34 on the simulator site, with the scenario board shown (trap and fix lanes).](LG-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep-v1.1-images/lab-34.png)

*Figure: Lab 34 on the simulator site, with the scenario board shown (trap and fix lanes).*

**Exam tip.** When the question is about handoff to another team, pick the answer that records decisions with their alternatives and gives actionable implementation detail: interfaces, configuration, runbooks and owners. Decks, recordings and code comments each cover only part of it.

**Try this next.** Delete the Owners heading from ADR in this lab and run it again: watch question 4 fail even though the notes name Arun Pillai. Then add a sixth question of your own, such as "what score must a prompt change reach before release?", and see which document answers it.

### 6.5 Go-live is a phase. Monitors start the next loop.

Task statement 6.5: **Support lifecycle phases (discovery, design, handoff, monitoring, iteration).**

#### Key concepts for Lab 35

- **A loop, not a line.** Discovery, design, build, pilot, go-live, handoff, monitoring, iteration. Iteration returns to design or evaluation; the system is never finished.
- **Three clocks you don't control.** Input drift (new products, new questions), business change, and the model lifecycle: every model ID is eventually deprecated and retired.
- **Thresholds from the baseline.** The pilot measured an 8% escalation rate. A monitor at 11% for a week acts long before 15%; one at 16% never fires.
- **Every change goes back through the evals.** A new range, a prompt edit or a model swap re-runs the eval suite before release. The suite built in the pilot is what makes iteration cheap.
- **Handoff on evidence, not a date.** The receiving team proves it can run the system: a change shipped on its own with an eval report, and a rehearsed runbook.

Both phases plan the same assistant from the same facts. The usual project template stops at go-live and closes the project, so nobody owns the system's behaviour afterwards. Inputs then drift: the spring range brings 1,850 new products and harder questions, escalations climb from 8% to 15%, and the first signal is a complaint to the COO three weeks later. The lifecycle template treats go-live as one phase in a loop: monitors with thresholds from the pilot baseline, an owner for each, and an action that sends the change back through evaluation before anything ships; the handoff is passed against criteria with evidence, not on a date. Code replays the same ten weeks against both plans.

#### Lab 35: Drift found 3 weeks late by a complaint: monitors that re-run evals

Simulator 5: Lumen Retail Engagement. Open https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=35. About 12 minutes.

**The question.** Lumen's store assistant goes live on 1 March, and Lumen's in-house team takes it over six weeks later. Lumen launches a new product range every season, and the pilot's escalation rate was 8%. Which plan best supports the solution after go-live?

- **A.** Close the project once the go-live acceptance tests pass, and have the support desk raise tickets whenever store staff report wrong or unhelpful answers to them.
- **B.** Freeze the prompt, model and catalogue index at go-live so the validated behaviour cannot drift, and re-certify the whole system once a year.
- **C.** Set monitors with thresholds and owners, such as escalation-rate drift or a new range, that send changes back through evaluation, and hand off against criteria.
- **D.** Keep the architect on a retainer to review the dashboards every month and decide, case by case, when the assistant needs to be changed, retuned or retrained.

**Run it.** Pick your answer. Press Simulate it live, read the paused outcome of the first method, press Proceed, then read the side-by-side comparison and the checks.

**What to look for.** Phase 1 finds the drift in week 8 from a complaint; Phase 2's monitors send the change back to the eval suite in week 5 or 6.

From our own run on Claude Haiku 5.5 (your wording will differ; the decisions and checks should match). This is an excerpt: wherever … appears, text has been shortened, and a line with only … marks lines left out:

```
Lumen Retail · Write the delivery plan for the store product-support assistant.
Lumen's product-support assistant goes live in 300 stores on 1 March (week 1). Lumen's in-house AI team (lea…
== Phase 1 · plan to go-live: the project template ends at go-live and closure
Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
  stop_reason: end_turn -> STOP: Claude has finished
Reply: {"phases":[{"name":"discovery","exit_gate":"Pilot baseline confirmed and recorded: escalation rate 8%…
Replay: wk1 7.9% · wk2 8.1% · wk3 8% · wk4 8.4% · wk5 9.6% (new range) · wk6 12.9% · wk7 14.7% · wk8 15.3% ·…
Phase 1: nothing watches after go-live. The drift that starts in week 5 is found in week 8: "Store managers …
== PAUSE · Phase 1 finished: a plan that ends at go-live
   outcome: The plan runs discovery → design → build → pilot → go_live and closes. **Nothing watches the sys…
   proceed: Phase 2: the same facts, with the lifecycle template: monitors that send changes back through ev…
== Phase 2 · lifecycle plan: monitors with thresholds and owners trigger iteration through the eval suite; h…
Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
  stop_reason: end_turn -> STOP: Claude has finished
Reply: {"phases":[{"name":"discovery","exit_gate":"Support question categories, escalation reasons and the 3…
  monitor escalation_rate_pct above 10 (2 wk) → rerun_eval_suite_and_iterate · owner Arun Pillai · FIRES in …
  monitor graded_accuracy_pct below 92 (2 wk) → rerun_eval_suite_and_iterate · owner Arun Pillai · FIRES in …
  monitor p95_latency_s above 3 (2 wk) → page_on_call · owner Arun Pillai · never fires
  monitor cost_per_day_usd above 80 (2 wk) → notify_only · owner Farid Rahman · never fires
  monitor catalogue_change_event occurs (1 wk) → rerun_eval_suite_and_iterate · owner Arun Pillai · FIRES in…
== Turns
turn 1: stop_reason=end_turn
turn 1: stop_reason=end_turn
== Checks
…
```

> **Check your answer: C.** After go-live the inputs keep changing: a new range brings new products and harder questions, and the model itself will eventually be retired. A lifecycle plan names the signals that matter, sets thresholds from the pilot baseline, gives each an owner, and routes every triggered change back through the eval suite before it ships. The handoff is passed on criteria the receiving team proves, not on a date.

- **A** falls short: Waiting for staff complaints finds drift weeks late, and closing at go-live leaves nobody owning the system's behaviour once the architect has gone.
- **B** falls short: Freezing the system does not freeze its inputs: a new range still arrives, and the frozen index and prompt fall further behind every season.
- **D** falls short: A monthly review by one person has no defined triggers, cannot catch a drift between reviews, and keeps the receiving team dependent instead of handing off.

![Figure: Lab 35 on the simulator site, with the scenario board shown (trap and fix lanes).](LG-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep-v1.1-images/lab-35.png)

*Figure: Lab 35 on the simulator site, with the scenario board shown (trap and fix lanes).*

**Exam tip.** Pick the answer that keeps the system in a loop after launch: defined signals and thresholds, named owners, changes that return to evaluation, and a handoff with exit criteria. Closing at go-live, freezing the system or relying on one person's review are the distractors.

**Try this next.** Change the spring range in WEEKS (shared/d6-lumen.js) to land in week 8 and run it again: Phase 2 catches it the week it happens, Phase 1 does not catch it at all inside ten weeks. Then raise an escalation threshold in the plan to 16% and see the drift slip past.

### Topic 6 summary

| Task | Rule of thumb |
|---|---|
| 6.1 | Ask every group before you design. Trace or label it. |
| 6.2 | Show what you traded away, in their units. |
| 6.3 | Promise what you measured. Budget the misses. |
| 6.4 | Write down the why, the how and the who. |
| 6.5 | Go-live is a phase. Monitors start the next loop. |

## 10. Topic 7: Developer Productivity & Operational Enablement

Exam domain 7, 7% of the exam. One shared Claude Code setup for the team, and a debugging loop for production.

| Task | Task statement | Lab |
|---|---|---|
| 7.1 | Configure Claude tools and environments for teams (e.g., Claude Code) | 36 |
| 7.2 | Improve developer workflows using AI-assisted tooling | 37 |
| 7.3 | Support debugging and operational issue resolution | 38 |

### 7.1 Put each rule where every session loads it.

Task statement 7.1: **Configure Claude tools and environments for teams (e.g., Claude Code).**

#### Key concepts for Lab 36

- **Scopes: user, project, local.** ~/.claude reaches only you. .claude/settings.json and CLAUDE.md in the repository reach everyone. .claude/settings.local.json is yours, kept out of git.
- **Guidance versus enforcement.** CLAUDE.md and skills are read by Claude and followed most of the time. Permission rules, hooks and managed settings are enforced by the harness.
- **Allow and deny lists merge.** Permission lists combine across scopes, and a deny anywhere beats an allow. A team deny on git push --force holds even if someone allows more.
- **Shared skills.** A skill in .claude/skills/<name>/SKILL.md gives all 40 engineers the same /pr-review workflow, versioned and reviewed like code.
- **MCP config without secrets.** Commit .mcp.json with ${SENTRY_AUTH_TOKEN}; each engineer's environment supplies the value. A token written into the file is a secret in git.

Both phases ask the same question about the same new engineer. When the team's rules live in one engineer's ~/.claude files, they reach only that engineer: Ben's first session follows none of them, and the risky parts (Bash(*) allowed, a token pasted into ~/.claude.json) sit where no review can see them. Committing the configuration puts it where every session loads it and every change is reviewed: CLAUDE.md for guidance Claude reads, .claude/settings.json for allow and deny rules the harness enforces, .claude/skills/ for shared workflows, and .mcp.json with ${SENTRY_AUTH_TOKEN} so the secret stays in each engineer's environment. Claude reads the configuration with Glob and Read; plain code computes what the session loads and checks it against the team's policy.

#### Lab 36: The team's rules live on one laptop: commit the Claude Code config

Simulator 6: Kestrel Platform Team. Open https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=36. About 12 minutes.

**The question.** Kestrel is rolling Claude Code out to 40 engineers in four squads. Today each engineer keeps the team's conventions and permissions in their own ~/.claude files; two of them allow Bash(*), and one has a Sentry token pasted into a personal MCP config. A new engineer's first sessions follow none of the conventions. What should the platform team do?

- **A.** Publish the recommended ~/.claude settings on the team wiki, and ask each engineer to copy them onto their own machine as part of their onboarding.
- **B.** Commit a project CLAUDE.md, .claude/settings.json allow and deny rules, shared skills and an .mcp.json that reads its token from an environment variable.
- **C.** Put the team's conventions, permission rules and each MCP server's token into one shared CLAUDE.md at the repository root, so that every session reads them.
- **D.** Have each squad lead review their engineers' ~/.claude folders every quarter, and remove any risky permissions or pasted tokens that they find in them.

**Run it.** Pick your answer. Press Simulate it live, read the paused outcome of the first method, press Proceed, then read the side-by-side comparison and the checks.

**What to look for.** Phase 1: Ben's session loads 0 of 5 team policies. Phase 2: all 5 reach his first session, and Claude's report of what loads matches the loader.

From our own run on Claude Haiku 5.5 (your wording will differ; the decisions and checks should match). This is an excerpt: wherever … appears, text has been shortened, and a line with only … marks lines left out:

```
Kestrel · Ben Okoye joined squad 2 today and installed Claude Code on a new laptop; his home folder has no ~…
== Phase 1 · personal ~/.claude: the team's rules live in Ana's home folder; Ben's session sees only the rep…
Ana's own session (her laptop): 1/5 policies; risky: Bash(*); literal secret in ~/.claude.json
Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
  stop_reason: tool_use -> CONTINUE: run the tool, append the result, call Claude again
  -> Glob({"pattern":"**/*"})
  <- result: .env.example .gitignore README.md pyproject.toml src/checkout/cart.py tests/test_cart.py
Turn 2: POST /v1/messages · model claude-haiku-5-5 · 3 messages (tool results appended)
  stop_reason: tool_use -> CONTINUE: run the tools, append the results, call Claude again
  -> Glob({"pattern":"~/.claude/**"})
  <- result: No files match.
  -> Glob({"pattern":"{.claude/**,.mcp.json,CLAUDE.md,~/.claude.json}"})
  <- result: No files match.
Turn 3: POST /v1/messages · model claude-haiku-5-5 · 5 messages (tool results appended)
  stop_reason: end_turn -> STOP: Claude has finished
Reply: {"instruction_files":[],"allow":[],"deny":[],"skills":[],"mcp_servers":[],"summary":"Ben's session lo…
Phase 1 result: Ben's session loads 0 of 5 team policies. Claude reported: Ben's session loads no instructio…
== PAUSE · Phase 1 finished: the team's rules in one engineer's home folder
   outcome: **Ben's first session loads 0 of 5 team policies**: no test rule, no deny on force-push or .env,…
   proceed: Phase 2: the same conventions committed to the repository, with the secret moved to an environme…
== Phase 2 · committed project config: CLAUDE.md, .claude/settings.json allow/deny, .claude/skills/pr-review…
Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
  stop_reason: tool_use -> CONTINUE: run the tool, append the result, call Claude again
  -> Glob({"pattern":"**/*"})
…
```

> **Check your answer: B.** Configuration in the repository reaches every engineer's session from the first run and changes only through review. CLAUDE.md carries the guidance Claude reads; .claude/settings.json carries allow and deny rules the harness enforces; shared skills give everyone the same workflows; and .mcp.json can reference ${SENTRY_AUTH_TOKEN}, so the secret stays in each engineer's environment and out of git.

- **A** falls short: Copied personal settings drift from day one, nobody can see what each engineer actually runs, and the team still has no shared deny rules.
- **C** falls short: CLAUDE.md is guidance Claude reads, not permissions the harness enforces, and tokens written into a committed file are secrets in git.
- **D** falls short: A quarterly review watches the risk instead of removing it: between reviews Bash(*) and pasted tokens stay live, and new engineers still get nothing.

![Figure: Lab 36 on the simulator site, with the scenario board shown (trap and fix lanes).](LG-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep-v1.1-images/lab-36.png)

*Figure: Lab 36 on the simulator site, with the scenario board shown (trap and fix lanes).*

**Exam tip.** For team-wide Claude Code behaviour, choose committed project configuration: CLAUDE.md for guidance, .claude/settings.json for enforced permissions, .claude/skills/ for shared workflows, and .mcp.json with environment-variable references. Organisation-wide must-holds go further, into managed settings.

**Try this next.** Add "Bash(*)" to the allow list in TEAM_CONFIG's .claude/settings.json and run Phase 2: policy still passes, but risky() now flags it for every engineer at once. Then move the deny rules into a .claude/settings.local.json and see them vanish from the committed config.

### 7.2 Wire it into the flow. Gate on structure.

Task statement 7.2: **Improve developer workflows using AI-assisted tooling.**

#### Key concepts for Lab 37

- **Headless Claude Code: claude -p.** Print mode runs one prompt and exits, which suits CI. --output-format json gives a result a script can read instead of a chat transcript.
- **Skills make reviews consistent.** A committed .claude/skills/pr-review/SKILL.md gives every run the same rules, versioned and reviewed like code.
- **Structured output for machines.** A JSON schema for findings (file, line, rule, severity) lets a CI step count and filter them. Prose needs a human to read it.
- **Model for judgement, code for the gate.** Claude decides whether line 14 logs a card number. Plain code decides that a high finding fails the build. Branch protection blocks the merge.
- **Speed-ups move the bottleneck.** Faster code writing helps only if review and verification keep up. Automating the first review pass keeps the human reviewer for judgement.

Both phases review the same pull request. The ad hoc workflow depends on someone remembering to paste the diff, gets a different review from each person's prompt, and returns prose that only a human can act on: the CI step has nothing it can check, so the change merges unless a reviewer happens to read the reply. The wired-in workflow runs on every pull request in CI with `claude -p`, uses the team's committed pr-review skill so every review applies the same rules, and asks for findings in a JSON schema. A few lines of plain code then fail the check on any high-severity finding: the model gives judgement, the gate is deterministic, and the clean pull request passes.

#### Lab 37: A chat review can't block PR 512: run claude -p in CI behind a gate

Simulator 6: Kestrel Platform Team. Open https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=37. About 12 minutes.

**The question.** Kestrel engineers paste diffs into a Claude chat for review when they remember to, each with their own prompt, and the feedback varies from person to person. Last month a refund change that logged full card numbers was merged. The platform team wants consistent reviews that stop changes like that. What should they do?

- **A.** Add a CONTRIBUTING.md rule that every engineer must ask Claude to review the diff in a chat before opening a pull request.
- **B.** Give each engineer a recommended review prompt to keep in their personal ~/.claude/CLAUDE.md, so every review starts from the same text.
- **C.** Have Claude review each pull request in CI and post its findings as a free-text comment for the human reviewer to read before merging.
- **D.** Run claude -p in CI with a committed review skill and a JSON schema for findings, and fail the check on any high-severity finding.

**Run it.** Pick your answer. Press Simulate it live, read the paused outcome of the first method, press Proceed, then read the side-by-side comparison and the checks.

**What to look for.** Phase 1's chat reply is prose and the gate has no verdict; Phase 2 blocks PR 512 on KR-1 at refund.py line 14 and passes the clean PR 513.

From our own run on Claude Haiku 5.5 (your wording will differ; the decisions and checks should match). This is an excerpt: wherever … appears, text has been shortened, and a line with only … marks lines left out:

```
Kestrel · PR 512 "Partial refunds from the order page" by Dev Patel (squad 3); PR 513 "Test for cart totals"
== Phase 1 · ad hoc chat review: the engineer pastes the diff and asks for a look
Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
  stop_reason: end_turn -> STOP: Claude has finished
Reply: Don't merge yet. The most serious problem is the log line. **Blocking** 1. **Logging the full card nu…
CI gate on the chat reply: not JSON: no machine-readable result. The pipeline has nothing to fail on, so PR …
== PAUSE · Phase 1 finished: an ad hoc review in a chat
   outcome: The reply is 267 words of prose and does mention the card number, but **the CI step cannot parse…
   proceed: Phase 2: the same PR, reviewed by claude -p in CI with the shared skill and a findings schema, b…
== Phase 2 · claude -p in CI: committed /pr-review skill + JSON schema on every PR, then a gate in plain code
    (CI: claude -p /pr-review 512) Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
      stop_reason: end_turn -> STOP: Claude has finished (the subagent returns its answer)
    (CI: claude -p /pr-review 512) answer: {"findings":[{"file":"payments/refund.py","line":14,"rule":"KR-1"…
    (CI: claude -p /pr-review 513) Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
      stop_reason: end_turn -> STOP: Claude has finished (the subagent returns its answer)
    (CI: claude -p /pr-review 513) answer: {"findings":[],"verdict":"pass"}
PR 512: 4 finding(s): KR-1/high payments/refund.py:14, KR-2/high payments/refund.py:15, KR-3/medium payments…
PR 513: 0 finding(s): none → gate exit 0 (no high-severity finding)
== Turns
turn 1: stop_reason=end_turn
(CI: claude -p /pr-review 512) turn 1: stop_reason=end_turn
(CI: claude -p /pr-review 513) turn 1: stop_reason=end_turn
== Checks
PASS  Phase 1: the ad hoc chat review is prose the CI gate cannot parse, so it gives no verdict on PR 512
…
```

> **Check your answer: D.** The improvement comes from wiring the tool into the flow, not from using it more often. CI runs the review on every pull request; the committed skill applies the same rules for everyone; the schema makes the output something a script can read; and a few lines of plain code fail the check on a high-severity finding, so branch protection stops the merge. The model supplies the judgement, the gate is deterministic.

- **A** falls short: A written rule still depends on each engineer remembering and on their own prompt, and its prose output cannot block anything.
- **B** falls short: A personal ~/.claude file reaches only its owner, drifts over time, and still produces nothing a pipeline can check.
- **C** falls short: Running in CI fixes when it happens, but free text cannot gate a merge: a busy reviewer can still miss the finding.

![Figure: Lab 37 on the simulator site, with the scenario board shown (trap and fix lanes).](LG-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep-v1.1-images/lab-37.png)

*Figure: Lab 37 on the simulator site, with the scenario board shown (trap and fix lanes).*

**Exam tip.** When the goal is consistent, enforced AI assistance across a team, look for the answer that runs in the shared pipeline, uses committed configuration, and produces structured output a deterministic step can gate on. Free-text comments and personal prompts are partial fixes.

**Try this next.** Remove card.number from line 14 of PR 512 in shared/d7-kestrel.js and add an Idempotency-Key header, then run Phase 2: the gate opens. Then change KR-3 to high in REVIEW_SKILL and see the missing timeout block the merge too.

### 7.3 Read the trace before you trust the theory.

Task statement 7.3: **Support debugging and operational issue resolution.**

#### Key concepts for Lab 38

- **stop_reason tells you why it stopped.** end_turn means Claude finished. max_tokens means the reply was cut off at the limit; parsing that text as JSON then fails with a confusing error.
- **Traces for LLM features.** Record model, max_tokens, input and output tokens, stop_reason, latency and tool calls per request. Most Claude incidents show up in these fields.
- **Read widely, change narrowly.** Read-only access to logs, traces and deploys is safe to grant for diagnosis. Changes go through a branch, review and an approved rollout.
- **Reproduce, then change one thing.** Replay a failing request as it was sent. If it fails the same way, change one setting and re-run: a pass is evidence, not a hope.
- **Retries don't fix deterministic failures.** A transient 529 is worth a retry. A reply truncated by max_tokens fails the same way every time, so a retry only adds latency and cost.

Both phases start from the same page and the same customer ticket. From symptoms alone, Claude can only produce a plausible story: an API problem, a timeout, a bad prompt. Nothing in it is checked, and acting on it in production risks a second incident. With read-only access to logs, traces and deploys, the loop narrows quickly: the new error group appears at Tue 14:05, every failing trace stops with stop_reason max_tokens at exactly 1,024 output tokens on large orders, healthy traces before the change used up to 1,300 tokens under a 2,048 limit, and the deploy log shows config v42 halving max_tokens. A replay in staging reproduces the failure and verifies the fix before anyone touches production. The application should also check stop_reason before parsing, so a truncated reply fails loudly instead of as a JSON error.

#### Lab 38: 6% of summaries fail: trace stop_reason max_tokens, don't guess

Simulator 6: Kestrel Platform Team. Open https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=38. About 12 minutes.

**The question.** Since Tuesday afternoon, 6% of requests to Kestrel's order-summary service, which uses Claude to write the summary on the order confirmation page, fail with "Order summary unavailable". The on-call engineer asks Claude Code for help. Which approach best resolves the incident?

- **A.** Give Claude read-only access to logs, traces and recent deploys, and have it reproduce a failing request, test one hypothesis at a time and verify the fix before rollout.
- **B.** Paste the alert and the customer ticket into Claude, apply the most likely fix it suggests straight away, and roll it back if the error rate has not dropped within an hour.
- **C.** Switch the service to a larger Claude model, because failures that start without any application code change usually point to a regression in the quality of the model's output.
- **D.** Wrap the Claude call in a retry with exponential backoff, so that transient failures are absorbed and customers stop seeing errors while the team investigates the cause.

**Run it.** Pick your answer. Press Simulate it live, read the paused outcome of the first method, press Proceed, then read the side-by-side comparison and the checks.

**What to look for.** Phase 1 cannot name a proven cause; Phase 2 finds stop_reason max_tokens after config v42, reproduces it and verifies the fix in staging.

From our own run on Claude Haiku 5.5 (your wording will differ; the decisions and checks should match). This is an excerpt: wherever … appears, text has been shortened, and a line with only … marks lines left out:

```
Kestrel on-call · PAGE · order-summary: error rate 6.1% (baseline 0.2%) since Tue 14:10. Customers see "Orde…
== Phase 1 · guess from symptoms: the page and the ticket, no tools
Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
  stop_reason: end_turn -> STOP: Claude has finished
Reply: {"hypotheses":[{"cause":"max_tokens_truncation","status":"untested","evidence":"No traces or logs pro…
Phase 1 diagnosis: unknown · fix: Before changing anything, pull error traces since Tue 14:10 and group them…
== PAUSE · Phase 1 finished: a diagnosis from the symptoms
   outcome: From the symptoms alone Claude **cannot name a root cause**; its "fix" is a to-do list or a miti…
   proceed: Phase 2: the same page, with read-only logs, traces and deploys, a staging replay, and the debug…
== Phase 2 · structured debugging loop: gather evidence, isolate, one hypothesis at a time, reproduce, verify
Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
  stop_reason: tool_use -> CONTINUE: run the tools, append the results, call Claude again
  -> search_logs({})
  <- result: {"service":"order-summary","window":"Mon 00:00 to Wed 18:00","groups":[{"message":"order_summar…
  -> list_traces({"failed_only":true})
  <- result: [{"trace_id":"tr-a131","at":"Tue 15:20","items_in_order":17,"stop_reason":"max_tokens","app_res…
  -> list_deploys({})
  <- result: [{"at":"Mon 10:12","service":"inventory-service","change":"v3.1: new stock cache"},{"at":"Tue 1…
Turn 2: POST /v1/messages · model claude-haiku-5-5 · 3 messages (tool results appended)
  stop_reason: tool_use -> CONTINUE: run the tools, append the results, call Claude again
  -> get_trace({"trace_id":"tr-a131"})
  <- result: {"trace_id":"tr-a131","at":"Tue 15:20","items_in_order":17,"service":"order-summary","model":"c…
  -> get_trace({"trace_id":"tr-a157"})
  <- result: {"trace_id":"tr-a157","at":"Wed 09:12","items_in_order":14,"service":"order-summary","model":"c…
…
```

> **Check your answer: A.** Claude is useful in an incident when it works from evidence. Read-only access to logs, traces and deploys is safe to grant widely and lets it see that every failing trace stops with stop_reason max_tokens at 1,024 tokens after a config change halved max_tokens. Reproducing a failing request, testing one hypothesis at a time and verifying the fix in staging turns a plausible story into a proven cause before anything changes in production.

- **B** falls short: A fix chosen from symptoms is a guess; applying it in production risks a second incident and teaches nothing if the errors happen to stop.
- **C** falls short: The failures began with a config change, not a model change; a larger model costs more and still stops at the same max_tokens limit.
- **D** falls short: A truncated response is deterministic for that order: every retry hits the same max_tokens limit, so retries add latency and cost without fixing it.

![Figure: Lab 38 on the simulator site, with the scenario board shown (trap and fix lanes).](LG-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep-v1.1-images/lab-38.png)

*Figure: Lab 38 on the simulator site, with the scenario board shown (trap and fix lanes).*

**Exam tip.** In debugging questions, prefer evidence-driven loops: observability access, reproduction, one change at a time, verification before rollout. Retries, model upgrades and fixes guessed from symptoms are distractors, especially when the failure is deterministic, such as a max_tokens truncation.

**Try this next.** In shared/d7-kestrel.js, raise the v42 limit in TRACES from 1024 to 2048 and run Phase 2: the failures vanish and Claude has to look elsewhere. Then remove rerun_request from opsTools and see whether Claude still claims fix_verified.

### Topic 7 summary

| Task | Rule of thumb |
|---|---|
| 7.1 | Put each rule where every session loads it. |
| 7.2 | Wire it into the flow. Gate on structure. |
| 7.3 | Read the trace before you trust the theory. |

## 11. Day 2 Builds: Labs 39 to 41

| Time | Session | Labs | Minutes |
|---|---|---|---|
| 13:25 to 15:10 | Bonus Topic A: build and evaluate a RAG policy assistant | 39, 40 | 105 |
| 15:10 to 16:10 | Bonus Topic B: build a governed claims agent | 41 | 60 |
| 16:10 to 17:10 | Bonus: practice exam in Practice mode (finish the full timed attempt at home) | – | 60 |

On Day 2 afternoon you build three systems with an AI coding tool. You write no code yourself: you paste each prompt, read what the tool writes, run each terminal command and check the result against the checkpoint. Each lab page has every prompt with a Copy button.

### Lab 39: Vibe-code a RAG policy assistant that cites its sources

You don't write the code. You write the prompts, read what comes back, and run it. In 60 minutes you have Northwind Bank's policy assistant: it splits twelve policies by heading, finds the right section with a search index you can test without Claude, answers with a citation for every fact, and says "I can't answer that" when the library doesn't cover the question, or when the asker's role may not read the document that does.

Exam tasks: 3.5, 3.6, 2.2. Lab page: https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab-39.html. Folder: labs/lab-39-build-a-rag-policy-assistant/ (README, PDF, solution and sample output).

Time: 60 minutes. Before you start (5 minutes): get your project folder ready as the lab page describes. Then the steps:

1. Step 1 · Set up the project (5 minutes)
2. Step 2 · Chunk, index and retrieve, with no Claude call (20 minutes)
3. Step 3 · Answer with citations, or refuse (20 minutes)
4. Step 4 · Refusals and the role filter (10 minutes, no code change)

Checkpoints:

- You see `pyproject.toml`, `uv.lock`, `.gitignore`, `.env.example`, `AGENTS.md`, `CLAUDE.md` and `policies/` with 12 `.md` files.
- `Loaded 12 documents, 48 chunks` and `5/5 retrieval checks passed`. Look at cases 4 and 5: the same question finds `LEND-11#2` for a credit officer, and for a teller it finds nothing from `LEND-11` at all, because the role filter runs before the ranking. You proved the retrieval before spending a token (Day 1, Labs 16 and 17).
- The retrieved chunks start with `LEND-04#3`. The answer says six times monthly income, capped at **$50,000**, with `[LEND-04#3]` after the fact, and `Sources: LEND-04#3`. One Claude call, about 1,600 input tokens.
- Up to **10 days** with the HR partner's approval, not the usual 5, cited to `HR-03#2`. The rule and its exception sit in the same section, so they arrive in the same chunk.
- **The share price:** refused is `True` and `Sources: none`. BM25 still returned four chunks (some words always match), so the refusal came from rule 3 of your system prompt, not from the index. **The teller:** refused is `True`, and the retrieved chunks include no `LEND-11` chunk. The answer lives in a restricted document, and the restricted document never reached Claude. A prompt that says "don't reveal credit policy to tellers" could be argued with; a filter in code cannot. **The credit officer:** the **Credit Committee** approves anything more than 10% above the limit, cited to `LEND-11#2`.

### Lab 40: Vibe-code an evaluation harness and A/B test two configurations

"It looked right when I tried it" is not evidence. In 45 minutes you vibe-code the harness that grades your Lab 39 assistant on twelve fixed questions: code checks for refusals, facts and citations, an LLM judge with a written rubric, and the numbers a sponsor asks for (accuracy, latency, cost). Then you A/B test the naive 300-character chunker against your heading-aware one, and let a decision rule you wrote down first make the call.

Exam tasks: 4.1, 4.2, 4.3. Lab page: https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab-40.html. Folder: labs/lab-40-evaluate-and-a-b-test-the-assistant/ (README, PDF, solution and sample output).

Time: 45 minutes. Before you start (5 minutes): get your project folder ready as the lab page describes. Then the steps:

1. Step 1 · Bring in the golden set (5 minutes)
2. Step 2 · Add the naive chunker as configuration A (10 minutes)
3. Step 3 · The evaluation harness (15 minutes)
4. Step 4 · A/B test with a decision rule (10 minutes)

Checkpoints:

- 12 items: 5 `answerable`, 2 `exception`, 2 `out_of_scope` and 3 `restricted`. Note `R1` and `R2`: the same question, asked by a teller (must refuse) and by a credit officer (must answer "Credit Committee"). One question, two correct behaviours: the role is part of the test case (Day 1, Lab 21).
- `check_retrieval.py` still prints `5/5`. With `fixed`, `Retrieved:` starts with `LEND-11@1`, but `LEND-11@2` is missing: the 300-character cut fell inside "must b|e approved by the Credit Committee", so the answer refuses or can't name who approves. With `heading`, the answer is the **Credit Committee**, cited to `LEND-11#2`. One question is an anecdote. Next you measure all twelve.
- Twelve lines, then the metrics. With heading-aware chunks, accuracy is usually **12/12** (11 happens: read the failing line), `restricted leaks 0`, latency p50 around 1,500 ms, cost per answer about US$0.0003, and the whole run under US$0.01. The judge never ran on `O1`, `O2`, `R1` and `R3`: a correct refusal is graded by code, not by opinion.
- `Items that changed:` includes **R2**: config A refused the credit officer, because the fixed cut separated the rule from the committee's name. A scores 11/12 or lower, B 12/12, all four rules ticked, `Decision: SHIP B (heading-aware chunks)`, and the total cost is about US$0.01. If the rule says KEEP A, read why: that's the rule doing its job, not a failure.

### Lab 41: Vibe-code a governed claims agent: least privilege, approval gate, audit log

An agent that can pay out claims needs more than a good prompt. In 60 minutes you vibe-code Harbour Mutual's claims agent with the governance built in from the first line: each role gets only the tools its job needs (and nobody gets delete or export), a gate in code sends every payout above US$5,000 to a human, policyholders' personal data is stripped before Claude ever sees it, and every call lands in an audit log you can query.

Exam tasks: 3.1, 5.1, 5.3, 4.6. Lab page: https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab-41.html. Folder: labs/lab-41-build-a-governed-claims-agent/ (README, PDF, solution and sample output).

Time: 60 minutes. Before you start (5 minutes): get your project folder ready as the lab page describes. Then the steps:

1. Step 1 · Set up the project (5 minutes)
2. Step 2 · Least-privilege tools (10 minutes)
3. Step 3 · The gate and the redaction (10 minutes)
4. Step 4 · The governed loop, with an audit log (15 minutes)
5. Step 5 · The human queue and the audit report (10 minutes)
6. Step 6 · Prove it with live tests (5 minutes)

Checkpoints:

- You see `pyproject.toml`, `uv.lock`, `.gitignore`, `.env.example`, `AGENTS.md`, `CLAUDE.md` and `harbour.json`.
- Triage has 5 tools, settlement 6, and there are no delete, export or update tools. The CLM-7790 payout fails with `validation`: a third-party policy doesn't cover a collision. The triage payout fails with `permission`: the tool isn't in its set, so even a perfect prompt injection can't make triage pay (Day 1, Lab 12).
- 3700 is `allow`, 7400 is `ask`, -50 is `deny`. Priya's policyholder record shows her name, and `[REDACTED]` for email, phone, national ID, date of birth, address and bank account. The CLM-7811 description ends "My bank account for the payout is [ACCOUNT]." Personal data hides in free text too.
- `get_claim` → `get_policy` → `approve_payout` for **3700**, `ALLOW` → `draft_letter` approved → `end_turn`. $4,200 assessed minus the $500 excess, paid inside the agent's authority.
- `approve_payout` for **7400** comes back `QUEUED` with an `APR-` id. The tool never ran. Claude reads the result, doesn't retry, and drafts a pending letter. The $5,000 rule isn't in the prompt at all: the gate in code decided (Lab 26, this morning). Copy the `APR-` id for Step 5.
- CLM-7790: no payout, a declined letter and an escalation (third-party only). Triage on CLM-7781: the tools line has no `approve_payout`, so Claude escalates with a recommended $3,700 instead of paying. Same claim, same prompt, different role, different power.
- The queue lists the CLM-7811 $7,400 entry; after your approval it is empty and a payout exists, made by you, not the agent. The report shows the agent's approvals (CLM-7781 only), one call stopped by the gate (`QUEUED CLM-7811`), your `human_approved` decision, and a cost per run of about US$0.0015. Pick a trace_id from the report and run `uv run audit_report.py --trace <trace_id>` to replay one run line by line (Day 1, Lab 25).
- `7/7 checks passed`. Check 5 is the one to remember: it reads every byte that went to Claude, and none of Priya's, Daniel's or Tomas's personal data is there. Take a screenshot of the final lines: that's your evidence for Bonus Topic B.

## 12. Practice Exam and Study Plan

The practice exam is at https://exams.tertiaryinfotech.com/practice-exams/anthropic/anthropic-ccar-professional. Spend the Day 2 hour on it in Practice mode, then sit the full timed attempt at home: 63 items in 120 minutes is about 1.9 minutes each. Then read every explanation and rerun the lab behind each miss.

### Exam technique

- Two passes: answer every item, flagging doubts; then return to the flags. An unanswered item cannot score.
- Multiple-response items state how many to select: select exactly that many.
- When two answers both work, prefer the smaller, safer fix aimed at the root cause: remove a privilege rather than monitor it; fix retrieval before blaming the model; measure before you choose a model.
- Read the stem's constraint: regulated data, a latency budget, a cost ceiling or a named stakeholder usually decides between two plausible options.

### Five-week study plan

| Week | Focus | Do this |
|---|---|---|
| 1 | D3 Integration and D1 Design (36%) | Rerun Labs 1–6 and 12–19; rebuild Lab 39 on your own documents |
| 2 | D4 Evaluation (16%) | Rerun Labs 20–25; extend the Lab 40 eval set to 30 items |
| 3 | D5 Governance and D6 Stakeholders (28%) | Rerun Labs 26–35; write one ADR and one SLA for a system you know |
| 4 | D2 Models and prompts, D7 Enablement (20%) | Rerun Labs 7–11 and 36–38; set up a shared Claude Code configuration |
| 5 | Exam practice | Two timed practice exams; rerun the lab behind each miss; book the exam |

### After the exam

- Retakes: wait 14 days after a first fail, 30 after a second, 90 after a third; at most four attempts in a rolling 12 months.
- The credential is valid for 12 months. Renew on time with a free, non-proctored assessment on the Anthropic Partner Academy.

## 13. Glossary

| Term | Meaning |
|---|---|
| A/B test | Running two versions (prompts, models, configurations) on the same evaluation items and comparing their scores with a decision rule set in advance. |
| ADR | Architecture decision record: a short document of the context, the decision, the options considered and the consequences. |
| Agent-to-agent (A2A) | A protocol for one autonomous agent to delegate work to another agent, as opposed to calling a tool. |
| Augmented LLM | A single model call enriched with retrieval, tools or memory, without an autonomous loop. |
| Cache read / cache write | With prompt caching, a write stores a stable prompt prefix (1.25× input price); later reads of it cost about 0.1× the input price. |
| Chunking | Splitting documents into retrievable pieces; heading-aware chunks keep a rule and its exceptions together. |
| Capability bloat | Giving an agent more tools or permissions than its role needs, which widens what can go wrong. |
| Data minimisation | Sending the model and the logs only the personal data the task needs (GDPR); HIPAA's "minimum necessary" is the health-data counterpart. |
| Evaluation set | A fixed collection of test items with expected outcomes, mixing golden answers, edge cases and adversarial items, graded by code checks and rubrics. |
| Fail closed | When a control cannot decide or errors, it blocks the action rather than allowing it. |
| FedRAMP | The US government programme that authorises cloud services for federal use. |
| Human in the loop (HITL) | A person reviews or approves a model's output before it takes effect, routed by risk. |
| LLM-as-judge | Using a model with a rubric to grade outputs that code checks cannot, calibrated against human grades. |
| MCP | Model Context Protocol: an open standard for exposing tools, resources and prompts to many AI clients through one server. |
| Observability | Structured logs, traces and metrics (tokens, latency, tool calls, stop_reason) that let you explain a system's behaviour. |
| Progressive discovery | Giving the model a small index and a way to load detail on demand, instead of all tools or documents up front. |
| RAG | Retrieval-augmented generation: retrieving relevant passages and giving them to the model as context for the answer. |
| SLA / SLO | Service level agreement / objective: measurable targets such as availability, p95 latency or answer accuracy, with an owner and a review cadence. |
| stop_reason | Why a Claude response ended: end_turn, tool_use, max_tokens, refusal and others. Code decides the next step from it. |
| Workflow | A fixed sequence of steps in code, with the model at chosen points; cheaper and more predictable than an autonomous agent when the steps are known. |
