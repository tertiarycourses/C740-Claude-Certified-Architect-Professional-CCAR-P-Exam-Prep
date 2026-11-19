# Lab 36: The team's rules live on one laptop: commit the Claude Code config
> Day 2 · Topic 7: Developer Productivity & Operational Enablement · Task statement 7.1 · Simulator 6: Kestrel Platform Team · About 12 minutes · Claude Haiku 5.5

## Goal
Task statement 7.1: **Configure Claude tools and environments for teams (e.g., Claude Code).** You answer one exam-style question, then run the Kestrel Platform Team simulator and watch the tempting design fail and the right one work, with real Claude calls.

## Open this lab

- **The main lab page:** [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/). It lists all 38 simulator labs, the Day 2 builds (Labs 39 to 41) and the practice exam, and holds the API key box.
- **Run it live in your browser (nothing to install):** open [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=36](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=36), paste your Anthropic API key into the sidebar once, then press **Simulate it live**. Every call uses `claude-haiku-5-5`. The run **stops after the first method** and shows its outcome; press **Proceed** to run the fix, then read the two **side by side** under The observation explained.
- **In a terminal, one click:** double-click `run-lab.command` (Mac) or `run-lab.cmd` (Windows) in this folder. It runs `node docs/tools/test_lab.mjs 36` from the repository root, with the same engine the site uses. It needs Node.js and your key in a `.env` file at the repository root (one line: `ANTHROPIC_API_KEY=sk-ant-...`).
- **The code it runs:** [docs/sims/lab-36.js](https://github.com/tertiarycourses/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/blob/main/docs/sims/lab-36.js), on the shared engine [docs/assets/engine.js](https://github.com/tertiarycourses/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/blob/main/docs/assets/engine.js).

## The scenario
Kestrel Software's platform team is rolling Claude Code out to 40 engineers across four product squads, and runs Claude-powered features in production. The team owns the shared Claude Code configuration, the CI pipeline, the evaluation suite for each prompt change, and the on-call runbooks for incidents in Claude-powered services.

## Key concepts
- **Scopes: user, project, local.** ~/.claude reaches only you. .claude/settings.json and CLAUDE.md in the repository reach everyone. .claude/settings.local.json is yours, kept out of git.
- **Guidance versus enforcement.** CLAUDE.md and skills are read by Claude and followed most of the time. Permission rules, hooks and managed settings are enforced by the harness.
- **Allow and deny lists merge.** Permission lists combine across scopes, and a deny anywhere beats an allow. A team deny on git push --force holds even if someone allows more.
- **Shared skills.** A skill in .claude/skills/<name>/SKILL.md gives all 40 engineers the same /pr-review workflow, versioned and reviewed like code.
- **MCP config without secrets.** Commit .mcp.json with ${SENTRY_AUTH_TOKEN}; each engineer's environment supplies the value. A token written into the file is a secret in git.

## The question
Kestrel is rolling Claude Code out to 40 engineers in four squads. Today each engineer keeps the team's conventions and permissions in their own ~/.claude files; two of them allow Bash(*), and one has a Sentry token pasted into a personal MCP config. A new engineer's first sessions follow none of the conventions. What should the platform team do?

- **A.** Publish the recommended ~/.claude settings on the team wiki, and ask each engineer to copy them onto their own machine as part of their onboarding.
- **B.** Commit a project CLAUDE.md, .claude/settings.json allow and deny rules, shared skills and an .mcp.json that reads its token from an environment variable.
- **C.** Put the team's conventions, permission rules and each MCP server's token into one shared CLAUDE.md at the repository root, so that every session reads them.
- **D.** Have each squad lead review their engineers' ~/.claude folders every quarter, and remove any risky permissions or pasted tokens that they find in them.

Pick your answer before you run anything. The answer and the reasoning are at the end, under **Check your answer**.

## Steps on the simulator site
1. Open [https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=36](https://tertiarycourses.github.io/C740-Claude-Certified-Architect-Professional-CCAR-P-Exam-Prep/lab.html?n=36). The left sidebar should say the API key is **saved**. If it says **not set**, paste your key into the **Anthropic API key** box, press **Save**, then **Test**.
2. Read the task statement card and the question. Click the answer you chose. The page tells you at once whether it is right, and why. Open **Why the other answers fall short**.
3. Press **▶ Simulate it live**. The scenario board shows the story, the code runs on the left and Claude's live output appears on the right.
4. When the run pauses, read the outcome of the first method (the trap). Then press **▶ Proceed** to run the fix.
5. Read **Claude's final output**, then **The observation explained**: the two methods side by side, turn by turn, and the checks on what Claude actually did.
6. Open **See the full code this lab runs** and find the lines that make the difference.

## Or run it from a terminal
From the repository root:

```
node docs/tools/test_lab.mjs 36
```

## What you will see
What to look for: Phase 1: Ben's session loads 0 of 5 team policies. Phase 2: all 5 reach his first session, and Claude's report of what loads matches the loader.

These lines are from our own run of this lab on Claude Haiku 5.5. Your wording will differ, because Claude writes each reply fresh; the tool calls, decisions and checks should match. This is an excerpt: wherever … appears, text has been shortened, and a line with only … marks lines left out. Run the lab to see the full output.

```
Kestrel · Ben Okoye joined squad 2 today and installed Claude Code on a new laptop; his home folder has no ~/.claude files yet. He clones kestrel/checkout-service and r…
== Phase 1 · personal ~/.claude: the team's rules live in Ana's home folder; Ben's session sees only the repository
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
Reply: {"instruction_files":[],"allow":[],"deny":[],"skills":[],"mcp_servers":[],"summary":"Ben's session loads no instruction files, permission rules, skills, or MCP s…
Phase 1 result: Ben's session loads 0 of 5 team policies. Claude reported: Ben's session loads no instruction files, permission rules, skills, or MCP servers: the repos…

== PAUSE · Phase 1 finished: the team's rules in one engineer's home folder
   outcome: **Ben's first session loads 0 of 5 team policies**: no test rule, no deny on force-push or .env, no pr-review skill, no Sentry server. Meanwhile Ana's perso…
   proceed: Phase 2: the same conventions committed to the repository, with the secret moved to an environment variable

== Phase 2 · committed project config: CLAUDE.md, .claude/settings.json allow/deny, .claude/skills/pr-review, .mcp.json with ${SENTRY_AUTH_TOKEN}
Turn 1: POST /v1/messages · model claude-haiku-5-5 · 1 message
  stop_reason: tool_use -> CONTINUE: run the tool, append the result, call Claude again
  -> Glob({"pattern":"**/*"})
  <- result: .claude/settings.json .claude/skills/pr-review/SKILL.md .env.example .gitignore .mcp.json CLAUDE.md README.md pyproject.toml src/checkout/cart.py tes…
Turn 2: POST /v1/messages · model claude-haiku-5-5 · 3 messages (tool results appended)
  stop_reason: tool_use -> CONTINUE: run the tools, append the results, call Claude again
  -> Read({"path":".claude/settings.json"})
  <- result: { "permissions": { "allow": [ "Bash(uv run pytest:*)", "Bash(uv run ruff:*)", "Bash(git diff:*)", "Bash(git status)" ], "deny": [ "Bash(git push --fo…
  -> Read({"path":".claude/skills/pr-review/SKILL.md"})
  <- result: --- name: pr-review description: Review a Kestrel pull request against the team checklist (KR-1..KR-4) and report findings as JSON. --- Check the dif…
  -> Read({"path":".mcp.json"})
  <- result: { "mcpServers": { "sentry": { "type": "http", "url": "https://sentry.kestrel.example/mcp", "headers": { "Authorization": "Bearer ${SENTRY_AUTH_TOKEN}…
  -> Read({"path":"CLAUDE.md"})
  <- result: # checkout-service ## Commands - Test: `uv run pytest -q`. Run it before saying a change is done. - Lint: `uv run ruff check .` ## Conventions - Bran…
  -> Glob({"pattern":"~/.claude/**"})
  <- result: No files match.
Turn 3: POST /v1/messages · model claude-haiku-5-5 · 5 messages (tool results appended)
  stop_reason: end_turn -> STOP: Claude has finished
Reply: {"instruction_files":["CLAUDE.md"],"allow":["Bash(uv run pytest:*)","Bash(uv run ruff:*)","Bash(git diff:*)","Bash(git status)"],"deny":["Bash(git push --force:*…
Claude's report vs the loader: matches on files, allow, deny, skills and MCP

…
[trap] Phase 1: rules in Ana's ~/.claude: **Ben's session loads 0 of 5 team policies.** The rules exist, but only on Ana's laptop, next to `Bash(*)` and a pasted token …
[fix] Phase 2: committed project config: **All 5 policies reach Ben's first session**, no rule allows Bash(*), the token is a ${SENTRY_AUTH_TOKEN} reference, and Claude…
  Where the rules live | ~/.claude on Ana's laptop | the repository, reviewed in pull requests (good)
  Instruction files Ben loads | none | CLAUDE.md
  Deny rules Ben loads | none (bad) | Bash(git push --force:*), Bash(rm -rf:*), Read(./.env) (good)
  Test command rule in an instruction file | no (bad) | yes (good)
  Deny git push --force | no (bad) | yes (good)
  Deny reading .env | no (bad) | yes (good)
  Shared pr-review skill | no (bad) | yes (good)
  Sentry MCP with no secret in the file | no (bad) | yes (good)
  Risky rules or secrets in the shared config | unseen: Bash(*) and a literal token on Ana's laptop | none (good)
  Claude's report matches the loader | yes | yes (good)

6 Claude calls · 10809 in / 1730 out tokens · about US$0.0019 · 12.1 s
```

## Check your answer
**Answer: B.** Configuration in the repository reaches every engineer's session from the first run and changes only through review. CLAUDE.md carries the guidance Claude reads; .claude/settings.json carries allow and deny rules the harness enforces; shared skills give everyone the same workflows; and .mcp.json can reference ${SENTRY_AUTH_TOKEN}, so the secret stays in each engineer's environment and out of git.

Why the other answers fall short:

- **A.** Copied personal settings drift from day one, nobody can see what each engineer actually runs, and the team still has no shared deny rules.
- **C.** CLAUDE.md is guidance Claude reads, not permissions the harness enforces, and tokens written into a committed file are secrets in git.
- **D.** A quarterly review watches the risk instead of removing it: between reviews Bash(*) and pasted tokens stay live, and new engineers still get nothing.

## Why it happens
Both phases ask the same question about the same new engineer. When the team's rules live in one engineer's ~/.claude files, they reach only that engineer: Ben's first session follows none of them, and the risky parts (Bash(*) allowed, a token pasted into ~/.claude.json) sit where no review can see them. Committing the configuration puts it where every session loads it and every change is reviewed: CLAUDE.md for guidance Claude reads, .claude/settings.json for allow and deny rules the harness enforces, .claude/skills/ for shared workflows, and .mcp.json with ${SENTRY_AUTH_TOKEN} so the secret stays in each engineer's environment. Claude reads the configuration with Glob and Read; plain code computes what the session loads and checks it against the team's policy.

## Exam tip
For team-wide Claude Code behaviour, choose committed project configuration: CLAUDE.md for guidance, .claude/settings.json for enforced permissions, .claude/skills/ for shared workflows, and .mcp.json with environment-variable references. Organisation-wide must-holds go further, into managed settings.

## Try this next
Add "Bash(*)" to the allow list in TEAM_CONFIG's .claude/settings.json and run Phase 2: policy still passes, but risky() now flags it for every engineer at once. Then move the deny rules into a .claude/settings.local.json and see them vanish from the committed config.

---
Source: Original question written for C740. Course: Claude Certified Architect - Professional (CCAR-P) Exam Prep (C740). © Tertiary Infotech Academy Pte Ltd · UEN 201200696W
