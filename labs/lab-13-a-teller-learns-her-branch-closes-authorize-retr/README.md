# Lab 13: A teller learns her branch closes: authorize retrieval as the user
> Day 1 · Topic 3: Integration · Task statement 3.2 · Simulator 2: Northwind Policy Assistant · About 12 minutes · Claude Haiku 5.5

## Goal
Task statement 3.2: **Analyze authentication and authorization requirements to identify security gaps.** You answer one exam-style question, then run the Northwind Policy Assistant simulator and watch the tempting design fail and the right one work, with real Claude calls.

## Open this lab

- **The main lab page:** [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/). It lists all 38 simulator labs, the Day 2 builds (Labs 39 to 41) and the practice exam, and holds the API key box.
- **Run it live in your browser (nothing to install):** open [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=13](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=13), paste your Anthropic API key into the sidebar once, then press **Simulate it live**. Every call uses `claude-haiku-5-5`. The run **stops after the first method** and shows its outcome; press **Proceed** to run the fix, then read the two **side by side** under The observation explained.
- **In a terminal, one click:** double-click `run-lab.command` (Mac) or `run-lab.cmd` (Windows) in this folder. It runs `node docs/tools/test_lab.mjs 13` from the repository root, with the same engine the site uses. It needs Node.js and your key in a `.env` file at the repository root (one line: `ANTHROPIC_API_KEY=sk-ant-...`).
- **The code it runs:** [docs/sims/lab-13.js](https://github.com/tertiarycourses/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/blob/main/docs/sims/lab-13.js), on the shared engine [docs/assets/engine.js](https://github.com/tertiarycourses/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/blob/main/docs/assets/engine.js).

## The scenario
Northwind Bank's 4,000 staff ask an internal assistant about lending, compliance and HR policy. The answers come from a retrieval-augmented generation (RAG) pipeline over the bank's policy library, which is re-indexed every week as policies change. Wrong answers carry regulatory risk, so every answer must cite its source, and questions the library does not cover must be declined.

## Key concepts
- **Authenticate, authorize, delegate.** Who is calling, what they may do to this resource, and on whose behalf the agent acts. Most agent security gaps come from answering the third question implicitly.
- **Service accounts flatten permissions.** One shared identity gives every user the union of everyone's rights, and the audit trail says the bot did it. Delegated per-user tokens keep each user's rights intact.
- **Audience-bound, short-lived tokens.** A token should be minted for one resource and expire quickly. The resource rejects tokens issued for anyone else, and never passes a received token through downstream.
- **Filter before the context window.** Permission-aware retrieval drops chunks the user may not read before ranking. Once restricted text is in the prompt, no instruction reliably keeps it out of the answer.
- **Fail closed.** A missing, expired or wrong-audience token, or an unreachable policy service, means deny. Allowing on error turns an outage into a breach.

## The question
Northwind Bank's policy assistant retrieves chunks through a service account that can read the whole policy library, and its system prompt lists which document families each staff role may see. A branch teller asked about rumoured branch closures and was answered, with a citation, from a restricted branch network review. Which change best closes the security gap?

- **A.** Add few-shot examples of restricted questions to the system prompt so that Claude declines them more consistently.
- **B.** Scan every reply for restricted document ids and withhold any reply that cites one before it is displayed.
- **C.** Retrieve with each user's own short-lived token and drop chunks outside their entitlements before ranking them.
- **D.** Narrow the service account's scope so it can no longer read any document its owner has marked confidential.

Pick your answer before you run anything. The answer and the reasoning are at the end, under **Check your answer**.

## Steps on the simulator site
1. Open [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=13](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=13). The left sidebar should say the API key is **saved**. If it says **not set**, paste your key into the **Anthropic API key** box, press **Save**, then **Test**.
2. Read the task statement card and the question. Click the answer you chose. The page tells you at once whether it is right, and why. Open **Why the other answers fall short**.
3. Press **▶ Simulate it live**. The scenario board shows the story, the code runs on the left and Claude's live output appears on the right.
4. When the run pauses, read the outcome of the first method (the trap). Then press **▶ Proceed** to run the fix.
5. Read **Claude's final output**, then **The observation explained**: the two methods side by side, turn by turn, and the checks on what Claude actually did.
6. Open **See the full code this lab runs** and find the lines that make the difference.

## Or run it from a terminal
From the repository root:

```
node docs/tools/test_lab.mjs 13
```

## What you will see
What to look for: With the service account, OPS-30 reached Claude and the teller was told Harbourfront closes on 30 June 2027; with her own token, five restricted chunks were dropped before ranking and only the leave question was answered.

These lines are from our own run of this lab on Claude Haiku 5.5. Your wording will differ, because Claude writes each reply fresh; the tool calls, decisions and checks should match. This is an excerpt: wherever … appears, text has been shortened, and a line with only … marks lines left out. Run the lab to see the full output.

```
Aisha Rahman (branch_teller, Harbourfront): "Is Harbourfront branch on the closure list for next year? I keep hearing rumours. Also, how many days of compassionate leav…
== Phase 1 · retrieval as the svc-policy-bot service account: reads every document, filters nothing
Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
  stop_reason: tool_use -> CONTINUE: run the tools, append the results, call Claude again
  -> search_policies({"query":"Harbourfront branch closure list next year"})
  <- result: {"results":[{"chunk_id":"OPS-30#2","document":"OPS-30 Branch Network Review 2027","text":"Closure list rationale: Harbourfront branch footfall fell 4…
  -> search_policies({"query":"compassionate leave days bereavement grandmother"})
  <- result: {"results":[{"chunk_id":"HR-03#2","document":"HR-03 Leave","text":"Compassionate leave on the death of a family member: 3 days for immediate family (…
Turn 2: POST /v1/messages · model claude-haiku-5-5 · 3 messages (tool results appended)
  stop_reason: end_turn -> STOP: Claude has finished
Reply: Yes, according to the policy library, Harbourfront is on the closure list. This isn't a rumour. - **Closure:** The 2027 Branch Network Review says the Harbourfro…
  retrieval as svc-policy-bot: "Harbourfront branch closure list next year" -> OPS-30#2, OPS-30#1, HR-09#1 (allow: service account, read:all-documents, no filter)
  retrieval as svc-policy-bot: "compassionate leave days bereavement grandmother" -> HR-03#2, HR-03#1, HR-09#1 (allow: service account, read:all-documents, no filter)

== PAUSE · Phase 1 finished: one service account, no filter
   outcome: **Restricted chunks OPS-30#2, OPS-30#1 entered Claude's context** for a branch teller, and the reply tells her about the Harbourfront closure. The retrieval…
   proceed: Phase 2: the same question, with Aisha's own token and an entitlement filter before ranking

== Phase 2 · retrieval as Aisha: her short-lived token is validated and chunks outside her entitlements are dropped before ranking
Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
  stop_reason: tool_use -> CONTINUE: run the tools, append the results, call Claude again
  -> search_policies({"query":"Harbourfront branch closure list next year"})
  <- result: {"results":[{"chunk_id":"HR-09#1","document":"HR-09 Remote Work","text":"Remote work: head-office roles may work remotely up to 2 days a week with ma…
  -> search_policies({"query":"compassionate leave days bereavement grandmother"})
  <- result: {"results":[{"chunk_id":"HR-03#2","document":"HR-03 Leave","text":"Compassionate leave on the death of a family member: 3 days for immediate family (…
Turn 2: POST /v1/messages · model claude-haiku-5-5 · 3 messages (tool results appended)
  stop_reason: end_turn -> STOP: Claude has finished
Reply: **Branch closure:** The policy library has nothing on closure plans for Harbourfront or any other branch, so I can't confirm or rule out the rumours. Your manage…
  retrieval as u-aisha: "Harbourfront branch closure list next year" -> HR-09#1, LEND-04#1, OPS-21#1 (allow: u-aisha (branch_teller), 5 chunks outside entitlements drop…
  retrieval as u-aisha: "compassionate leave days bereavement grandmother" -> HR-03#2, HR-03#1, HR-09#1 (allow: u-aisha (branch_teller), 5 chunks outside entitlements d…
  probe: a token minted for northwind-hr-portal -> refused (401): Token audience northwind-hr-portal is not northwind-policy-search: request denied.

== Turns
turn 1: stop_reason=tool_use tools=search_policies,search_policies
turn 2: stop_reason=end_turn
turn 1: stop_reason=tool_use tools=search_policies,search_policies
turn 2: stop_reason=end_turn

== Checks
PASS  Phase 1: every retrieval ran as the service account, with no user identity
PASS  Phase 1: a restricted OPS-30 chunk entered Claude's context for a branch teller
PASS  Phase 2: every retrieval ran under Aisha's own token for this audience, and chunks outside her entitlements were dropped
PASS  Phase 2: no restricted chunk reached Claude, and the reply cites HR-03#2
PASS  Phase 2 probe: a token minted for another audience was refused (fail closed)

== Side by side
[trap] Phase 1: service account, no filter: OPS-30#2, OPS-30#1 reached Claude's context for a branch teller, and the reply discloses the closure. Whatever the prompt sa…
[fix] Phase 2: delegated token + entitlement filter: The retrieval service dropped 5 chunks outside branch_teller entitlements before ranking. Claude answered the leave…
  Identity on each retrieval call | svc-policy-bot (read:all-documents) | u-aisha · aud northwind-policy-search · 5-min token (good)
  Chunks that reached Claude | OPS-30#2, OPS-30#1, HR-09#1, HR-03#2, HR-03#1 | HR-09#1, LEND-04#1, OPS-21#1, HR-03#2, HR-03#1
  Restricted chunks in Claude's context | 2 (bad) | 0 (good)
  Reply discloses the Harbourfront closure | yes (bad) | no (good)
  Token for another audience (probe) | not checked: no user token at all | refused (401) (good)

4 Claude calls · 3788 in / 1028 out tokens · about US$0.0009 · 7.0 s
```

## Check your answer
**Answer: C.** The gap is that retrieval runs under one identity that can read everything, so authorization is left to the model. Retrieving under the user's delegated, audience-bound token lets the retrieval service enforce the user's entitlements and drop restricted chunks before ranking, so they never reach the context window. The model chooses what to search for; the resource server decides what may be returned, and any invalid token is refused.

Why the other answers fall short:

- **A.** Few-shot examples still make the model the authorization boundary: the restricted text is already in its context, and a rephrased question can get it out.
- **B.** An output scan acts after the restricted text has reached the model and the logs, and a paraphrase without the document id passes it.
- **D.** A narrower service account is still one identity for every user: tellers keep seeing credit-officer documents, and the audit trail still says the bot read them.

## Why it happens
In Phase 1 every search runs as svc-policy-bot, which can read the whole library, so the retrieval service ranks restricted chunks alongside public ones and hands them to Claude. Claude has no way to know the access control list (it lives in the index metadata, not the text), and even if the prompt told it, the prompt would be a probability, not a control: the restricted text is already in the context window, the trace and the logs. In Phase 2 the tool layer, not Claude, attaches Aisha's own token, minted for one audience and valid for five minutes. The retrieval service validates it, fails closed on anything wrong, and drops every chunk outside the branch_teller entitlements before ranking. The model decides what to search for; the resource server decides what may be returned. The probe at the end shows the other half of the rule: a token minted for a different audience is refused, not trusted.

## Exam tip
If an answer leaves the model to decide who may see what (prompt rules, refusal examples, output scans), it is a distractor. Look for enforcement in a deterministic layer under the user's own identity, failing closed.

## Try this next
Add "Never reveal OPS-30 to branch tellers" to SYSTEM and rerun Phase 1: the reply may hold back, but OPS-30 is still in Claude's context, the trace and the logs, and one rephrased question gets it out. Then change USER to STAFF["u-joanna"] (an HR partner): Phase 2 returns OPS-30, because her role is entitled to it.

---
Source: Original question written for C740. Course: Claude Certified Architect - Professional (CCAR-P) Exam Prep (C740). © Tertiary Infotech Academy Pte Ltd · UEN 201200696W
