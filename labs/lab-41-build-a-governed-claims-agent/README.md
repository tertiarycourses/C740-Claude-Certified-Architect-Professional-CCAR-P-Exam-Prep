# Lab 41: Vibe-code a governed claims agent: least privilege, approval gate, audit log

> Day 2 · Bonus Topic B · Scenario 1: Harbour Mutual Claims Desk · Task statements 3.1, 5.1, 5.3, 4.6 · Vibe-coding lab · Claude Haiku 5.5 · 60 minutes

**An agent that can pay out claims needs more than a good prompt. In 60 minutes you vibe-code Harbour Mutual's claims agent with the governance built in from the first line: each role gets only the tools its job needs (and nobody gets delete or export), a gate in code sends every payout above US$5,000 to a human, policyholders' personal data is stripped before Claude ever sees it, and every call lands in an audit log you can query.**

**Lab page:** [the main lab page](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/) lists every lab. Copy the prompts from [this lab's prompt page](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab-41.html) (one Copy button per prompt), or from `prompts.html` in this folder.

## Day 2: two bonus topics

| Lab | You build | Exam tasks |
|---|---|---|
| 39 | **Bonus Topic A:** a RAG policy assistant with citations, a role filter and a refusal | 3.5, 3.6, 2.2 |
| 40 | **Bonus Topic A:** an evaluation harness, then an A/B test of two chunking strategies | 4.1, 4.2, 4.3 |
| **41 (this lab)** | **Bonus Topic B:** a governed claims agent: least privilege, an approval gate, redaction, an audit log | 3.1, 5.1, 5.3, 4.6 |

This is a **new project**, not the Northwind assistant. Make a fresh folder for it.

## What you'll build

```
  "Process claim CLM-7811."  (role: settlement or triage)
        |
        v
  agent.py -- the agentic loop you write yourself (claude-haiku-5-5)
        |   tools: ONLY the role's set (tools.py). Triage has no approve_payout.
        |          Nobody has delete, export or update tools: they don't exist.
        |
        +-- before every tool call: pre_tool_use (guards.py)
        |     approve_payout above US$5,000 -> "ask": never runs, queued in approval_queue.jsonl
        |     malformed amount -> "deny" (fail closed)
        |
        +-- after every tool call: redact() (guards.py)
        |     email, phone, national ID, date of birth, address, bank account -> [REDACTED]
        |
        +-- every model call and tool call -> audit.jsonl (trace_id, tool, input, decision, tokens, latency_ms, stop_reason)

  approve.py -- a human adjuster approves or rejects the queue      audit_report.py -- approvals, denials, cost
```

In the simulator labs you removed tools an agent didn't need (Lab 12), read traces (Lab 25), and this morning put guardrails in code (Lab 26) and routed decisions to humans (Lab 28). Today you build all four into one agent.

## What's in this folder

| File | What it is |
|---|---|
| `starter/harbour.json` | Harbour Mutual's sandbox: three policyholders (with invented personal data), three policies and four claims. Prompt 1 downloads it into your project. |
| `starter/.env.example` | the one line your `.env` needs |
| `prompts.html` | every prompt below, each with a Copy button |
| `solution/` | our finished code, for your trainer. You don't need it: build your own with the prompts. |
| `sample-output.txt` | a live run of `solution/`: both checks, five agent runs, the human queue, the audit report and the live tests |

The four claims:

| Claim | Policyholder | What happens |
|---|---|---|
| CLM-7781 | Priya Nair, comprehensive | rear bumper, assessed $4,200, excess $500: pay **$3,700** |
| CLM-7811 | Tomas Varga, comprehensive | flooded engine, assessed $7,900: **$7,400 is above the agent's authority** |
| CLM-7790 | Daniel Okafor, third-party only | his own car written off, $18,600: **not covered** |
| CLM-7802 | Priya Nair, comprehensive | windscreen $650, **not yet assessed** |

## Before you start (5 minutes)

- **1. Open your AI coding tool in a new, empty folder** called `harbour-claims-agent`. In VS Code, Cursor, Windsurf or Antigravity: **File → Open Folder → New Folder**. Claude Code or Codex in a terminal: start it from that folder. Any agent that can create files and run terminal commands works; the prompts use no tool-specific feature.
- **2. Have your Anthropic API key ready.** It starts with `sk-ant-`. You'll paste it into a file in Step 1, never into the chat.

That's all. **Prompt 1 does the rest of the set-up.** One claim takes four or five Claude calls with `claude-haiku-5-5`: about US$0.0015.

**You run the code yourself.** A prompt writes the code; the command under **Run it in your terminal** runs it, with its own Copy button. Open a terminal in your project folder: in VS Code, Cursor, Windsurf or Antigravity, **Terminal → New Terminal**; in Claude Code you can also type `!` and then the command. If the output doesn't match the Checkpoint, paste it back into the chat.

**Tested on 19 Nov 2026.** We pasted these exact six prompts, in one conversation, into Claude Code 2.1.327 (Sonnet 5.5) in a fresh, empty folder, two runs. The first run met every Checkpoint and passed `test_governance.py` 7/7, but Prompt 4's build wrote the queued payout to the audit log as a "human" line, and only Prompt 6's check 6 made it fix that. We then made Prompt 4 say which line each event gets, and the second fresh run met every Checkpoint first time, 7/7. We copied `harbour.json` into the folder before Prompt 1, because the download link works only once the course repository is published. Not a benchmark: your tool, model and wording will differ. Codex and Antigravity were not tested; the prompts use no tool-specific feature.

## Step 1 · Set up the project (5 minutes)

### Prompt 1

```text
Set up this folder as a new Python project for an insurance claims agent. Do each step, then tell me what you did.

1. Check uv with `uv --version`. If uv is missing, install it with its official installer:
   macOS or Linux: curl -LsSf https://astral.sh/uv/install.sh | sh
   Windows (PowerShell): powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
   If uv is still not found after installing, use its full path (~/.local/bin/uv, or %USERPROFILE%\.local\bin\uv.exe
   on Windows) for the rest of this chat.
2. If harbour.json is not in this folder, download it into this folder from
   https://raw.githubusercontent.com/tertiarycourses/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/main/labs/lab-41-build-a-governed-claims-agent/starter/harbour.json
3. Run `uv init --bare`, then `uv add anthropic python-dotenv`. (uv installs Python itself if it needs to.)
4. Create .gitignore with: .env, .venv/, __pycache__/, audit.jsonl, approval_queue.jsonl, payouts.jsonl
5. Create .env.example with one line: ANTHROPIC_API_KEY=paste-your-key-here
   If .env does not exist yet, create it with that same line. After that, never open, print or ask me for .env or my key.
6. Create AGENTS.md with these project rules for any AI coding assistant:
   - Claude model: claude-haiku-5-5 through the official anthropic Python SDK, max_tokens 4096, no temperature.
   - All data comes from harbour.json, a fictional sandbox. Never invent policyholders, policies or claims.
   - Governance rules live in code (guards.py), never only in a prompt.
   - Never add a delete, export or policy-update tool.
   - Policyholder personal data never goes to Claude: every tool result passes through redact() first.
   - Run Python with `uv run`.
   - Never open, print or ask for .env or the API key.
7. Create CLAUDE.md containing the single line @AGENTS.md so Claude Code reads the same rules.

Then show me the file tree, and tell me to open .env in the editor and replace paste-your-key-here with my API key.
```

**Checkpoint.** You see `pyproject.toml`, `uv.lock`, `.gitignore`, `.env.example`, `AGENTS.md`, `CLAUDE.md` and `harbour.json`.

**Now the one thing you type yourself:** open `.env` in your editor, replace `paste-your-key-here` with your API key and save. Never paste the key into the AI chat. If Prompt 1 installed uv, restart your coding tool's terminal before you run commands yourself.

## Step 2 · Least-privilege tools (10 minutes)

### Prompt 2

```text
Read AGENTS.md and harbour.json. Create tools.py with Harbour Mutual's six claims tools. All read harbour.json.

1. get_claim(claim_id): return the claim as stored.
2. get_policy(policy_id): return the policy plus a "policyholder" field holding that policyholder's full record.
3. request_assessment(claim_id, notes): return assessment_id, claim_id, status "requested" and notes.
   Fail if the claim's assessment is already complete.
4. draft_letter(claim_id, outcome, body): outcome is approved, declined or pending. Return letter_id, claim_id,
   outcome, status "draft" and body.
5. approve_payout(claim_id, amount, reason): fail if the policy's "covers" list does not include the claim type,
   if the assessment is not complete, or unless 0 < amount <= assessed_usd minus the policy's excess_usd.
   On success append {payout_id, claim_id, amount, reason, status "paid", ts} as one line to payouts.jsonl and
   return it. Do NOT put any payout limit in this function.
6. escalate_to_adjuster(claim_id, reason, recommended_action): return ticket_id, claim_id, status "queued" and
   the fields.

- Give each tool a one-line docstring that says what it does and when to use it. On failure raise ToolFailure,
  which carries errorCategory (not_found or validation), isRetryable (false) and message.
- TOOLS: a dict from tool name to its Anthropic tool definition (name, description from the docstring,
  input_schema with types and required fields; outcome is an enum).
- ROLES, least privilege:
  "triage": get_claim, get_policy, request_assessment, draft_letter, escalate_to_adjuster
  "settlement": the same five plus approve_payout
- tools_for(role): the tool definitions for that role only.
- run_tool(name, args, role) returns (result, is_error). A tool that is not in the role's list is refused with
  errorCategory "permission" and never runs. On ToolFailure return its fields and True.
- There is no delete, export or policy-update tool anywhere, and never will be.

Create check_tools.py: print each role's tool names, print any tool name containing delete, export or update
(expect none), then call run_tool and print the result on one line for:
get_claim CLM-7781 as settlement; approve_payout CLM-7790 amount 18600 as settlement; approve_payout CLM-7781
amount 3700 as triage.
```

**Run it in your terminal**, in your project folder:

```bash
uv run check_tools.py
```

**Checkpoint.** Triage has 5 tools, settlement 6, and there are no delete, export or update tools. The CLM-7790 payout fails with `validation`: a third-party policy doesn't cover a collision. The triage payout fails with `permission`: the tool isn't in its set, so even a perfect prompt injection can't make triage pay (Day 1, Lab 12).

## Step 3 · The gate and the redaction (10 minutes)

### Prompt 3

```text
Create guards.py: the guardrails that run in code, outside the model.

- APPROVAL_LIMIT_USD = 5000. The agent's payout authority lives here and nowhere else: not in the system prompt,
  not in the tool descriptions, not in tools.py.
- pre_tool_use(tool_name, tool_input): runs before EVERY tool call and has no side effects. Any tool other than
  approve_payout: {"decision": "allow"}. approve_payout with an amount that is missing, not a number or <= 0:
  {"decision": "deny", "reason": ...} (fail closed). Amount above APPROVAL_LIMIT_USD:
  {"decision": "ask", "reason": "Payout of $<amount> is above the agent's payout authority."}. Otherwise allow.
- queue_for_human(tool_input, trace_id): append {approval_id "APR-" + 6 hex characters, ts, trace_id, claim_id,
  amount, reason, status "pending"} as one line to approval_queue.jsonl and return the approval_id.
- redact(value): walk dicts and lists. Replace the value of any key email, phone, national_id, date_of_birth,
  address or bank_account with "[REDACTED]". Inside every string, replace email addresses with [EMAIL], phone
  numbers that start with + with [PHONE], and bank accounts like HB-4410-5568-02 with [ACCOUNT].

Create check_guards.py: print pre_tool_use for approve_payout on CLM-7811 with amounts 3700, 7400 and -50, and for
get_claim; then print redact() of get_policy HM-POL-2201 and of get_claim CLM-7811 (run through run_tool as triage)
as JSON.
```

**Run it in your terminal**, in your project folder:

```bash
uv run check_guards.py
```

**Checkpoint.** 3700 is `allow`, 7400 is `ask`, -50 is `deny`. Priya's policyholder record shows her name, and `[REDACTED]` for email, phone, national ID, date of birth, address and bank account. The CLM-7811 description ends "My bank account for the payout is [ACCOUNT]." Personal data hides in free text too.

## Step 4 · The governed loop, with an audit log (15 minutes)

### Prompt 4

```text
Create agent.py, the claims agent. Follow AGENTS.md. Write the agentic loop yourself.

- Load ANTHROPIC_API_KEY from .env with python-dotenv.
- run_agent(claim_id, role="settlement"): a new trace_id (12 hex characters) per run. The first user message is
  "Process claim <claim_id>." Loop with client.messages.create (model claude-haiku-5-5, max_tokens 4096,
  tools=tools_for(role)): append the whole response.content as the assistant turn; stop when stop_reason is not
  "tool_use", or after 10 turns. For each tool_use block:
  1. gate = pre_tool_use(name, input).
  2. allow: result, is_error = run_tool(name, input, role), then result = redact(result). decision is "allow",
     or "error" when is_error.
  3. ask: approval_id = queue_for_human(input, trace_id). Do NOT run the tool. decision "queued", is_error true,
     result {"status": "queued_for_human_approval", "approval_id", "message": the gate's reason + " It has been
     queued for a human adjuster as <approval_id>. Do not call approve_payout again for this claim. Draft a
     'pending' letter."}
  4. deny: do NOT run the tool. decision "deny", is_error true, result {"status": "denied", "message": reason}.
  Send ALL tool_result blocks back in ONE user message (content = the result as JSON, with is_error).
- Use this system prompt exactly:
  "You are Harbour Mutual's motor-claims agent. You process one claim for the claims desk.
  1. Read the claim with get_claim, then its policy with get_policy.
  2. If the policy does not cover the claim type, do not pay. Draft a "declined" letter that explains why, and
     escalate_to_adjuster so a human confirms the decline.
  3. If the assessment is not complete, call request_assessment and draft a "pending" letter. Do not pay.
  4. If the claim is covered and assessed, the payout is the assessed amount minus the policy excess. If you have
     approve_payout, approve it and draft an "approved" letter. If you do not have approve_payout,
     escalate_to_adjuster with the recommended payout.
  5. If a tool result says a payout was queued for human approval, do not retry it. Draft a "pending" letter.
  6. Personal data in tool results is redacted. Never ask for it or try to work around it.
  End with two lines for the claims desk: the outcome, and the amount paid or recommended."
- audit(**fields) appends one JSON line to audit.jsonl. Every line has the same keys: ts, trace_id, role, claim_id,
  turn, event ("model", "tool" or "human"), tool, input, decision, reason, is_error, input_tokens, output_tokens,
  latency_ms, stop_reason (null when not relevant). Write one "model" line per model call (tokens, latency_ms,
  stop_reason) and one "tool" line per tool_use block, queued and denied ones included (tool, input, decision,
  reason, is_error, latency_ms). "human" lines are written only by approve.py, in the next step.
- Print the trace_id, the role and its tools, then each turn's stop_reason, tokens and latency, and each tool call
  as name(input) -> DECISION result (shortened). run_agent returns {"trace_id", "text": the final text,
  "calls": every tool call with tool, input, decision, result and is_error, "messages": the full message list}.
- agent.py run directly: uv run agent.py <claim_id> [--role settlement|triage].
```

**Run it in your terminal**, in your project folder, one claim at a time:

```bash
uv run agent.py CLM-7781
```

**Checkpoint.** `get_claim` → `get_policy` → `approve_payout` for **3700**, `ALLOW` → `draft_letter` approved → `end_turn`. $4,200 assessed minus the $500 excess, paid inside the agent's authority.

```bash
uv run agent.py CLM-7811
```

**Checkpoint.** `approve_payout` for **7400** comes back `QUEUED` with an `APR-` id. The tool never ran. Claude reads the result, doesn't retry, and drafts a pending letter. The $5,000 rule isn't in the prompt at all: the gate in code decided (Lab 26, this morning). Copy the `APR-` id for Step 5.

```bash
uv run agent.py CLM-7790
```

```bash
uv run agent.py CLM-7781 --role triage
```

**Checkpoint.** CLM-7790: no payout, a declined letter and an escalation (third-party only). Triage on CLM-7781: the tools line has no `approve_payout`, so Claude escalates with a recommended $3,700 instead of paying. Same claim, same prompt, different role, different power.

## Step 5 · The human queue and the audit report (10 minutes)

### Prompt 5

```text
Create two small scripts. Follow AGENTS.md.

approve.py, the human approval queue:
- uv run approve.py lists the pending entries in approval_queue.jsonl (approval_id, claim_id, amount, trace_id, reason).
- uv run approve.py <approval_id> approve --by "<name>" runs approve_payout for that claim and amount directly
  with run_tool (role settlement): a human's authority, outside the model loop. It marks the entry "approved" (or
  "failed" if the tool fails) with decided_by, and writes an audit line with event "human", the entry's trace_id,
  role "human:<name>", tool approve_payout and decision "human_approved".
- uv run approve.py <approval_id> reject --by "<name>" marks it "rejected", pays nothing, and audits
  decision "human_rejected".
- An approval_id that isn't pending exits with a clear message.

audit_report.py, a query over audit.jsonl (no Claude call):
- Runs (distinct trace_ids), model calls and tool calls; tool calls counted by decision and by tool.
- Approvals by the agent (approve_payout with decision allow): count, total amount, and one line each.
- Calls stopped by the gate (queued or deny), one line each; human decisions, one line each.
- Tokens in and out, cost at US$0.10 / US$0.50 per million tokens, cost per run, model latency p50 and p95
  (nearest rank), and a count of stop_reasons.
- uv run audit_report.py --trace <trace_id> prints that run's lines in order: turn, event, tool or stop_reason,
  decision, latency.
```

**Run it in your terminal**, in your project folder. Replace `APR-XXXXXX` with your id from Step 4:

```bash
uv run approve.py
```

```bash
uv run approve.py APR-XXXXXX approve --by "Your Name"
```

```bash
uv run audit_report.py
```

**Checkpoint.** The queue lists the CLM-7811 $7,400 entry; after your approval it is empty and a payout exists, made by you, not the agent. The report shows the agent's approvals (CLM-7781 only), one call stopped by the gate (`QUEUED CLM-7811`), your `human_approved` decision, and a cost per run of about US$0.0015. Pick a trace_id from the report and run `uv run audit_report.py --trace <trace_id>` to replay one run line by line (Day 1, Lab 25).

## Step 6 · Prove it with live tests (5 minutes)

### Prompt 6

```text
Write test_governance.py. It imports run_agent from agent.py, does three live runs, prints PASS or FAIL for each
check, prints "N/7 checks passed" and exits 1 if any check fails. Check the recorded calls, messages, queue and
audit log, not Claude's wording.

Run A: run_agent("CLM-7781", "settlement")   Run B: run_agent("CLM-7811", "settlement")
Run C: run_agent("CLM-7781", "triage")
  1. A: an approve_payout call for 3700 had decision allow and no error
  2. B: every approve_payout call had decision queued (none ran)
  3. B: approval_queue.jsonl has a pending CLM-7811 entry with run B's trace_id
  4. C: no approve_payout call had decision allow
  5. no email, phone, national_id, date_of_birth, address or bank_account value from harbour.json appears anywhere
     in the three runs' messages (serialise them to JSON, using model_dump() for SDK objects)
  6. for each run, audit.jsonl has exactly one "tool" line per recorded tool call with that run's trace_id
  7. no tool in TOOLS has delete, export or update in its name, and approve_payout is not in the triage role
```

**Run it in your terminal**, in your project folder:

```bash
uv run test_governance.py
```

If a check fails, paste this into your AI coding tool:

```text
test_governance.py has a failing check. Run uv run test_governance.py, show me which check fails and why, and fix
agent.py, tools.py or guards.py, not the test. Then run it again.
```

**Checkpoint.** `7/7 checks passed`. Check 5 is the one to remember: it reads every byte that went to Claude, and none of Priya's, Daniel's or Tomas's personal data is there. Take a screenshot of the final lines: that's your evidence for Bonus Topic B.

## Run it

From your project folder. Run them yourself in a terminal, or paste one into your coding tool's chat as "Run: <command> and show me the output."

| What | Command |
|---|---|
| Check the tools and roles | `uv run check_tools.py` |
| Check the gate and redaction | `uv run check_guards.py` |
| Process a claim | `uv run agent.py CLM-7781` |
| Process it as triage | `uv run agent.py CLM-7781 --role triage` |
| The windscreen, not yet assessed | `uv run agent.py CLM-7802` |
| The human queue | `uv run approve.py` |
| Approve or reject a queued payout | `uv run approve.py APR-XXXXXX approve --by "Your Name"` |
| What happened, and what it cost | `uv run audit_report.py` |
| One run, line by line | `uv run audit_report.py --trace <trace_id>` |
| The live tests: three runs, seven checks | `uv run test_governance.py` |

Our run is in `sample-output.txt`.

## Stretch · Two more rules in the gate

```text
Add two rules to pre_tool_use in guards.py, and pass the run's earlier calls to it so it can see them:
1. deny approve_payout unless get_claim and get_policy have both succeeded earlier in this run;
2. deny a second approve_payout for the same claim in the same run.
Each deny reason tells Claude what to do instead.
```

**Run it in your terminal**, in your project folder:

```bash
uv run test_governance.py
```

Still 7/7? Every new rule is code you can test, not a sentence you hope the model follows.

## Explain it back (with your trainer)

- **1.** Triage can't pay because `approve_payout` isn't in its tool list. Why is that stronger than a prompt rule saying "triage must not pay"? What else does `run_tool` do as a second line of defence?
- **2.** The $5,000 limit is in `guards.py` only. Why not in the system prompt as well? What does Claude see when the gate says "ask"?
- **3.** Why does `redact()` run on tool results, before the model, and not on Claude's reply? Which field did we keep, and why?
- **4.** Your auditor asks: "Who approved the $7,400 payout, when, and what did the agent do first?" Which commands answer that, and which audit fields do they use?

## Troubleshooting

| You see | Fix prompt |
|---|---|
| The $7,400 payout went through | "pre_tool_use must run before run_tool, and an 'ask' decision must queue the call and never run the tool." |
| Triage paid a claim | "tools_for(role) must send only the role's tools, and run_tool must refuse any tool outside the role." |
| `[REDACTED]` is missing in a tool result | "Every tool result goes through redact() before it is added to the messages, including error results." |
| `tool_use ids were found without tool_result blocks` | "A queued or denied call still needs a tool_result, in the same user message as the others." |
| Claude calls approve_payout again and again | "Send the queued result with is_error true and the 'do not call approve_payout again' message." |
| `TypeError: Object of type ... is not JSON serializable` in the test | "Serialise SDK objects with model_dump() when you json.dumps the messages." |
| The audit report crashes on a None | "Every audit line must have the same keys, with null where a field doesn't apply." |
