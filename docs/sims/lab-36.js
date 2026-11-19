// Lab 36 · Task 7.1 · Simulator 6 (Kestrel): team configuration lives in the repository, not in one engineer's home.
// Ben joins squad 2 with a fresh laptop and starts Claude Code in kestrel/checkout-service. In Phase 1 the team's
// conventions live in Ana's personal ~/.claude files (with Bash(*) allowed and a Sentry token pasted in). In Phase 2
// the same conventions are committed: CLAUDE.md, .claude/settings.json allow/deny, a shared skill, and .mcp.json that
// reads its token from an environment variable. In each phase Claude inspects the files Ben's session can see
// (E.repo with Glob and Read) and reports what it loads; code computes the same thing (sessionLoads) and checks both
// against the platform team's policy.
import { REPO, ANA_HOME, TEAM_CONFIG, sessionLoads, POLICY, policyMet, risky, compareReport, braceGlob } from "./shared/d7-kestrel.js";

const SCHEMA = { type: "object", additionalProperties: false, properties: {
  instruction_files: { type: "array", items: { type: "string" } },
  allow: { type: "array", items: { type: "string" } },
  deny: { type: "array", items: { type: "string" } },
  skills: { type: "array", items: { type: "string" }, description: "Skill names" },
  mcp_servers: { type: "array", items: { type: "object", additionalProperties: false, properties: {
    name: { type: "string" }, credential: { type: "string", enum: ["env_var_reference", "literal_secret", "none"] } }, required: ["name", "credential"] } },
  summary: { type: "string", description: "One sentence on what Ben's session will and will not follow" } },
  required: ["instruction_files", "allow", "deny", "skills", "mcp_servers", "summary"] };

const SYSTEM = `You check what a Claude Code session will load. When a session starts in a repository, Claude Code loads:
- instruction files: ~/.claude/CLAUDE.md (user), CLAUDE.md and .claude/CLAUDE.md (project);
- permission rules, merged from ~/.claude/settings.json, .claude/settings.json and .claude/settings.local.json;
- skills from .claude/skills/<name>/SKILL.md and ~/.claude/skills/<name>/SKILL.md;
- MCP servers from .mcp.json (project) and ~/.claude.json (user).
Start with Glob **/* to see every file this session can see, then Read each configuration file you find. Report only what is actually there, copying rules exactly as written. Give file paths relative to the repository (or starting with ~/ for the home folder). For each MCP server, say whether its credential is an environment-variable reference, a literal secret written in the file, or none. Reply with the JSON only.`;
const ASK = "Ben Okoye joined squad 2 today and installed Claude Code on a new laptop; his home folder has no ~/.claude files yet. He clones kestrel/checkout-service and runs `claude` in it. Inspect the files his session can see and report what it loads.";

async function inspect(s, E, files) {
  const r = repoFor(E, files);
  const run = await E.runAgent(s, { system: SYSTEM, prompt: ASK, tools: { Glob: braceGlob(r), Read: r.tools.Read }, output_config: { format: { type: "json_schema", schema: SCHEMA } }, max_tokens: 3000, maxTurns: 8 });
  let rep = null; try { rep = JSON.parse(run.text); } catch { /* checked below */ }
  return { run, rep, reads: run.calls.filter((c) => c.name === "Read" && !c.isError).map((c) => String(c.input.path).replace(/^\.\//, "")) };
}
const repoFor = (E, files) => E.repo(files);
const short = (xs) => (xs.length ? xs.join(", ") : "none");

export default {
  id: 36,
  see: "Phase 1: Ben's session sees only the repository, so it loads no instruction file, no deny rule, no skill and no MCP server: 0 of 5 team policies, while Ana's own laptop carries Bash(*) and a literal Sentry token. Phase 2: the committed CLAUDE.md, .claude/settings.json, pr-review skill and .mcp.json reach Ben's first session, 5 of 5 policies, and Claude's report of what loads matches the loader exactly.",
  try: "Add \"Bash(*)\" to the allow list in TEAM_CONFIG's .claude/settings.json and run Phase 2: policy still passes, but risky() now flags it for every engineer at once. Then move the deny rules into a .claude/settings.local.json and see them vanish from the committed config.",
  explain: "Both phases ask the same question about the same new engineer. When the team's rules live in one engineer's ~/.claude files, they reach only that engineer: Ben's first session follows none of them, and the risky parts (Bash(*) allowed, a token pasted into ~/.claude.json) sit where no review can see them. Committing the configuration puts it where every session loads it and every change is reviewed: CLAUDE.md for guidance Claude reads, .claude/settings.json for allow and deny rules the harness enforces, .claude/skills/ for shared workflows, and .mcp.json with ${SENTRY_AUTH_TOKEN} so the secret stays in each engineer's environment. Claude reads the configuration with Glob and Read; plain code computes what the session loads and checks it against the team's policy.",
  scene: {
    title: "Kestrel: Ben starts Claude Code on day one. Which team rules reach his session?",
    caption: "Same engineer, same repository, same question. Only where the team's configuration lives differs.",
    lanes: [
      { key: "p1", label: "Phase 1 · personal ~/.claude", sub: "rules live on Ana's laptop only", tone: "trap", on: /Phase 1/, stages: [
        { id: "a_cfg", icon: "🏠", t: "Ana's ~/.claude files", s: "rules, Bash(*), a pasted Sentry token", diff: true },
        { id: "a_view", icon: "💻", t: "Ben's session sees", s: "the repository, an empty home folder" },
        { id: "a_claude", icon: "🤖", t: "Claude inspects the config", s: "Glob and Read, reports what loads", claude: true, tools: ["Glob", "Read"] },
        { id: "a_policy", icon: "📏", t: "Code: team policy", s: "test rule, 2 denies, skill, MCP" },
        { id: "a_out", icon: "🎯", t: "Ben's first session", s: "want: 5/5 policies, no risky rule", out: true } ] },
      { key: "p2", label: "Phase 2 · committed project config", sub: "CLAUDE.md, settings.json, skills, .mcp.json", tone: "fix", on: /Phase 2/, stages: [
        { id: "b_cfg", icon: "📦", t: "Committed in the repo", s: "CLAUDE.md · settings.json · skills · .mcp.json", diff: true },
        { id: "b_view", icon: "💻", t: "Ben's session sees", s: "the repository, an empty home folder" },
        { id: "b_claude", icon: "🤖", t: "Claude inspects the config", s: "Glob and Read, reports what loads", claude: true, tools: ["Glob", "Read"] },
        { id: "b_policy", icon: "📏", t: "Code: team policy", s: "test rule, 2 denies, skill, MCP" },
        { id: "b_out", icon: "🎯", t: "Ben's first session", s: "want: 5/5 policies, no risky rule", out: true } ] },
    ],
  },
  slide: {
    title: "Commit the team's Claude Code config; keep secrets out",
    code: `# CLAUDE.md                                   # KEY 1
- Test: \`uv run pytest -q\` before saying a change is done.

# .claude/settings.json                       # KEY 2
{"permissions": {
   "allow": ["Bash(uv run pytest:*)", "Bash(git diff:*)"],
   "deny":  ["Bash(git push --force:*)", "Bash(rm -rf:*)",
             "Read(./.env)"]}}

# .claude/skills/pr-review/SKILL.md            # KEY 3
---
name: pr-review
---
# .mcp.json                                   # KEY 4
{"mcpServers": {"sentry": {"type": "http", "headers":
   {"Authorization": "Bearer \${SENTRY_AUTH_TOKEN}"}}}}`,
    keys: [["1", "Guidance Claude reads", "Project CLAUDE.md reaches every session."],
           ["2", "Rules the harness enforces", "Allow and deny in git, reviewed like code."],
           ["3", "Shared skills", "One /pr-review for 40 engineers."],
           ["4", "MCP without secrets", "${VAR} in the file; the token stays local."]],
  },
  async run(s, E) {
    const ana = sessionLoads({ ...REPO, ...ANA_HOME });
    s.log(`Kestrel · ${ASK}`, "note");

    s.log("== Phase 1 · personal ~/.claude: the team's rules live in Ana's home folder; Ben's session sees only the repository", "note");
    s.show("a_cfg", `Ana: ${policyMet(ana).length}/5 policies · risky: ${risky(ana).length}`, "done");
    s.log(`Ana's own session (her laptop): ${policyMet(ana).length}/5 policies; risky: ${risky(ana).join("; ")}`, "result");
    const ben1 = { ...REPO };
    s.show("a_view", `${Object.keys(ben1).length} repo files · no .claude/`, "done");
    const i1 = await inspect(s, E, ben1);
    const L1 = sessionLoads(ben1), m1 = policyMet(L1), cmp1 = compareReport(i1.rep, L1);
    s.show("a_claude", i1.rep ? `files: ${short(i1.rep.instruction_files)} · deny: ${i1.rep.deny.length}` : "no report", "done");
    s.show("a_policy", `${m1.length}/5: ${POLICY.map((p) => `${p.id}${m1.includes(p.id) ? "✓" : "✗"}`).join(" ")}`, "done");
    s.show("a_out", `${m1.length}/5 team policies reach Ben`, m1.length === 5 ? "good" : "bad");
    s.log(`Phase 1 result: Ben's session loads ${m1.length} of 5 team policies. Claude reported: ${i1.rep?.summary || "(no report)"}`, "note");
    await s.pause({
      title: "Phase 1 finished: the team's rules in one engineer's home folder",
      outcome: `**Ben's first session loads ${m1.length} of 5 team policies**: no test rule, no deny on force-push or .env, no pr-review skill, no Sentry server. Meanwhile Ana's personal config allows \`Bash(*)\` and holds a literal Sentry token, and no review ever sees either.`,
      next: "Phase 2: the same conventions committed to the repository, with the secret moved to an environment variable",
    });

    s.log("== Phase 2 · committed project config: CLAUDE.md, .claude/settings.json allow/deny, .claude/skills/pr-review, .mcp.json with ${SENTRY_AUTH_TOKEN}", "note");
    const ben2 = { ...REPO, ...TEAM_CONFIG };
    s.show("b_cfg", `${Object.keys(TEAM_CONFIG).length} files committed, reviewed in PRs`, "done");
    s.show("b_view", `${Object.keys(ben2).length} repo files · empty home`, "done");
    const i2 = await inspect(s, E, ben2);
    const L2 = sessionLoads(ben2), m2 = policyMet(L2), r2 = risky(L2), cmp2 = compareReport(i2.rep, L2);
    s.show("b_claude", i2.rep ? `allow ${i2.rep.allow.length} · deny ${i2.rep.deny.length} · skills ${short(i2.rep.skills)}` : "no report", "done");
    s.show("b_policy", `${m2.length}/5: ${POLICY.map((p) => `${p.id}${m2.includes(p.id) ? "✓" : "✗"}`).join(" ")}`, "done");
    s.show("b_out", `${m2.length}/5 policies · risky rules: ${r2.length}`, m2.length === 5 && !r2.length ? "good" : "bad");
    const agree = Object.entries(cmp2).filter(([, v]) => !v).map(([k]) => k);
    s.log(`Claude's report vs the loader: ${agree.length ? "differs on " + agree.join(", ") : "matches on files, allow, deny, skills and MCP"}`, agree.length ? "error" : "result");
    const committedSecrets = Object.values(TEAM_CONFIG).filter((t) => /sntrys_|Bearer\s+[A-Za-z0-9_]{8,}/.test(t)).length;
    const readCfg = [".claude/settings.json", ".mcp.json"].every((p) => i2.reads.includes(p));

    const yes = (b) => ({ v: b ? "yes" : "no", tone: b ? "good" : "bad" });
    return {
      final: i2.rep ? [`What Ben's session loads (Phase 2), as Claude reported it after reading the config:`,
        `- instruction files: ${short(i2.rep.instruction_files)}`, `- allow: ${short(i2.rep.allow)}`, `- deny: ${short(i2.rep.deny)}`,
        `- skills: ${short(i2.rep.skills)}`, `- MCP servers: ${short(i2.rep.mcp_servers.map((m) => `${m.name} (${m.credential})`))}`, "", i2.rep.summary].join("\n") : i2.run.text,
      compare: {
        cols: [
          { title: "Phase 1: rules in Ana's ~/.claude", short: "Personal config", tone: "trap", said: i1.run.text,
            verdict: `**Ben's session loads ${m1.length} of 5 team policies.** The rules exist, but only on Ana's laptop, next to \`Bash(*)\` and a pasted token that no review sees.` },
          { title: "Phase 2: committed project config", short: "Project config", tone: "fix", said: i2.run.text,
            verdict: m2.length === 5 && !agree.length ? "**All 5 policies reach Ben's first session**, no rule allows Bash(*), the token is a ${SENTRY_AUTH_TOKEN} reference, and Claude's report of what loads matches the loader exactly."
              : `${m2.length}/5 policies; report ${agree.length ? "differs on " + agree.join(", ") : "matches"}. Read the live output: Claude writes each run fresh.` },
        ],
        rows: [
          ["Where the rules live", "~/.claude on Ana's laptop", { v: "the repository, reviewed in pull requests", tone: "good" }],
          ["Instruction files Ben loads", short(L1.instruction_files), short(L2.instruction_files)],
          ["Deny rules Ben loads", { v: short(L1.deny), tone: L1.deny.length ? "good" : "bad" }, { v: short(L2.deny), tone: L2.deny.length ? "good" : "bad" }],
          ...POLICY.map((p) => [p.text, yes(m1.includes(p.id)), yes(m2.includes(p.id))]),
          ["Risky rules or secrets in the shared config", "unseen: Bash(*) and a literal token on Ana's laptop", { v: r2.length ? r2.join("; ") : "none", tone: r2.length ? "bad" : "good" }],
          ["Claude's report matches the loader", Object.values(cmp1).every(Boolean) ? "yes" : "no", { v: agree.length ? `no: ${agree.join(", ")}` : "yes", tone: agree.length ? "bad" : "good" }],
        ],
        note: "Same engineer, same repository, same question. The only difference is where the configuration lives: one person's home folder, or the repository every session loads.",
      },
      checks: [
        E.check("Phase 1: Ben's session loads 0 of the 5 team policies, and Claude reports no instruction file and no deny rule", m1.length === 0 && i1.rep && i1.rep.instruction_files.length === 0 && i1.rep.deny.length === 0),
        E.check("Phase 2: Ben's session meets all 5 policies, with no Bash(*) and no literal secret in a committed file", m2.length === 5 && r2.length === 0 && committedSecrets === 0),
        E.check("Phase 2: Claude read .claude/settings.json and .mcp.json before reporting", readCfg),
        E.check("Phase 2: Claude's report matches the loader on instruction files, allow, deny, skills and the MCP credential", i2.rep && agree.length === 0),
      ],
    };
  },
};
