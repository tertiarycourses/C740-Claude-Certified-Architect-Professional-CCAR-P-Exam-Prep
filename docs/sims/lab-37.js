// Lab 37 · Task 7.2 · Simulator 6 (Kestrel): wire AI review into the team's flow, with an output CI can gate on.
// PR 512 adds partial refunds, and it logs the full card number and sends no Idempotency-Key. Phase 1 is the ad hoc
// workflow: an engineer pastes the diff into a chat and asks for a look; the CI step gets free text it cannot act on.
// Phase 2 is the wired-in workflow: CI runs `claude -p` with the team's committed pr-review skill and a JSON schema for
// findings, on every pull request (PR 512 and a clean PR 513), and a plain-code gate fails the check on any
// high-severity finding. Code checks the findings by file, line and rule, and the gate's exit code.
import { PRS, REVIEW_SKILL, FINDINGS_SCHEMA, gate, numbered, pasted } from "./shared/d7-kestrel.js";

async function ciReview(s, E, pr) {
  const run = await E.runAgent(s, {
    label: `(CI: claude -p /pr-review ${pr})`,
    system: `You are running headless in Kestrel's CI as the /pr-review skill. Follow the skill exactly and reply with the JSON only.\n\n${REVIEW_SKILL}`,
    prompt: `/pr-review ${pr}: "${PRS[pr].title}" by ${PRS[pr].author}\n\n${numbered(pr)}`,
    output_config: { format: { type: "json_schema", schema: FINDINGS_SCHEMA } }, max_tokens: 2500, maxTurns: 1,
  });
  return { run, g: gate(run.text) };
}
const hit = (g, rule, file, line) => (g.j?.findings || []).some((f) => f.rule === rule && f.file.endsWith(file) && Math.abs(f.line - line) <= 1);

export default {
  id: 37,
  see: "Phase 1: the pasted-diff chat review is helpful prose, but the CI step cannot parse it, so nothing stops PR 512 from merging. Phase 2: `claude -p` with the shared pr-review skill returns schema-valid findings; PR 512 gets KR-1 at payments/refund.py line 14 and the gate exits 1, while the clean PR 513 has no high finding and the gate exits 0.",
  try: "Remove card.number from line 14 of PR 512 in shared/d7-kestrel.js and add an Idempotency-Key header, then run Phase 2: the gate opens. Then change KR-3 to high in REVIEW_SKILL and see the missing timeout block the merge too.",
  explain: "Both phases review the same pull request. The ad hoc workflow depends on someone remembering to paste the diff, gets a different review from each person's prompt, and returns prose that only a human can act on: the CI step has nothing it can check, so the change merges unless a reviewer happens to read the reply. The wired-in workflow runs on every pull request in CI with `claude -p`, uses the team's committed pr-review skill so every review applies the same rules, and asks for findings in a JSON schema. A few lines of plain code then fail the check on any high-severity finding: the model gives judgement, the gate is deterministic, and the clean pull request passes.",
  scene: {
    title: "Kestrel PR 512: the refund logs card numbers. Does anything stop the merge?",
    caption: "Same pull request, same model. Only how the review is wired into the team's flow differs.",
    lanes: [
      { key: "p1", label: "Phase 1 · ad hoc chat review", sub: "paste the diff when you remember", tone: "trap", on: /Phase 1/, stages: [
        { id: "a_pr", icon: "🔀", t: "PR 512: partial refunds", s: "payments/refund.py, 20 lines" },
        { id: "a_how", icon: "💬", t: "Pasted into a chat", s: "\"can you take a look?\" no criteria", diff: true },
        { id: "a_claude", icon: "🤖", t: "Claude reviews", s: "replies in prose", claude: true },
        { id: "a_gate", icon: "🚦", t: "CI gate", s: "parse findings, fail on high" },
        { id: "a_out", icon: "🔒", t: "Merge decision", s: "want: 512 blocked, 513 passes", out: true } ] },
      { key: "p2", label: "Phase 2 · claude -p in CI", sub: "shared skill + JSON schema on every PR", tone: "fix", on: /Phase 2/, stages: [
        { id: "b_pr", icon: "🔀", t: "PR 512 and PR 513", s: "every pull request, automatically" },
        { id: "b_how", icon: "⚙", t: "claude -p /pr-review", s: "committed skill, --json-schema", diff: true },
        { id: "b_claude", icon: "🤖", t: "Claude reviews", s: "findings: file, line, rule, severity", claude: true },
        { id: "b_gate", icon: "🚦", t: "CI gate", s: "parse findings, fail on high" },
        { id: "b_out", icon: "🔒", t: "Merge decision", s: "want: 512 blocked, 513 passes", out: true } ] },
    ],
  },
  slide: {
    title: "claude -p in CI: shared skill, schema, a gate in code",
    code: `# .github/workflows/review.yml
- name: Claude review                                 # KEY 1
  run: claude -p "/pr-review $PR_NUMBER" \\
         --output-format json \\
         --json-schema "$(cat .claude/finding.schema.json)" \\
         > review.json                                # KEY 2
- name: Gate on high severity                         # KEY 3
  run: python ci/gate.py review.json

# ci/gate.py
findings = load_findings("review.json")
high = [f for f in findings if f["severity"] == "high"]
sys.exit(1 if high else 0)                           # KEY 4`,
    keys: [["1", "Runs on every PR", "In CI, not when someone remembers."],
           ["2", "Shared skill, fixed schema", "Same rules for all; output a script can read."],
           ["3", "A separate gate step", "Plain code decides pass or fail."],
           ["4", "Exit code blocks the merge", "Branch protection does the rest."]],
  },
  async run(s, E) {
    s.log(`Kestrel · PR 512 "${PRS[512].title}" by ${PRS[512].author}; PR 513 "${PRS[513].title}"`, "note");

    s.log("== Phase 1 · ad hoc chat review: the engineer pastes the diff and asks for a look", "note");
    s.show("a_pr", "PR 512, refund.py", "done");
    s.show("a_how", "pasted diff, no checklist", "done");
    const chat = await E.runAgent(s, { prompt: `hey, can you take a quick look at this before I merge?\n\n${pasted(512)}`, max_tokens: 2500, maxTurns: 1 });
    const g1 = gate(chat.text);
    const mentions = /card\.number|card number/i.test(chat.text);
    s.show("a_claude", `${chat.text.split(/\s+/).length} words of prose${mentions ? ", mentions the card number" : ""}`, "done");
    s.show("a_gate", g1.parsed ? `exit ${g1.exit}` : "can't parse: no verdict, exit 0", "done");
    s.show("a_out", g1.parsed ? `gate exit ${g1.exit}` : "PR 512 merges unless someone reads it", g1.parsed && g1.exit === 1 ? "good" : "bad");
    s.log(`CI gate on the chat reply: ${g1.why}. The pipeline has nothing to fail on, so PR 512 merges unless a human reads the reply${mentions ? " (the reply does mention the card number, in prose)" : ""}.`, "note");
    await s.pause({
      title: "Phase 1 finished: an ad hoc review in a chat",
      outcome: `The reply is ${chat.text.split(/\s+/).length} words of prose${mentions ? " and does mention the card number" : ""}, but **the CI step cannot parse it** (${g1.why}), so nothing blocks the merge. It ran only because one engineer remembered, with that engineer's own prompt.`,
      next: "Phase 2: the same PR, reviewed by claude -p in CI with the shared skill and a findings schema, behind a gate",
    });

    s.log("== Phase 2 · claude -p in CI: committed /pr-review skill + JSON schema on every PR, then a gate in plain code", "note");
    s.show("b_pr", "512 and 513, on push", "done");
    s.show("b_how", "skill KR-1..KR-4 · findings schema", "done");
    const a = await ciReview(s, E, 512);
    const b = await ciReview(s, E, 513);
    for (const [pr, x] of [[512, a], [513, b]]) {
      s.log(`PR ${pr}: ${x.g.parsed ? `${x.g.j.findings.length} finding(s): ${x.g.j.findings.map((f) => `${f.rule}/${f.severity} ${f.file}:${f.line}`).join(", ") || "none"} → gate exit ${x.g.exit} (${x.g.why})` : `unparseable (${x.g.why})`}`, x.g.exit === 1 ? "error" : "result");
    }
    const kr1 = hit(a.g, "KR-1", "payments/refund.py", 14), kr2 = hit(a.g, "KR-2", "payments/refund.py", 15) || (a.g.j?.findings || []).some((f) => f.rule === "KR-2");
    s.show("b_claude", a.g.parsed ? `512: ${a.g.j.findings.length} findings · 513: ${b.g.j?.findings.length ?? "?"}` : "unparseable", "done");
    s.show("b_gate", `512 → exit ${a.g.exit} · 513 → exit ${b.g.exit}`, "done");
    s.show("b_out", a.g.exit === 1 && b.g.exit === 0 ? "512 blocked (KR-1 line 14) · 513 passes" : `512 exit ${a.g.exit} · 513 exit ${b.g.exit}`, a.g.exit === 1 && b.g.exit === 0 && kr1 ? "good" : "bad");

    const list = (g) => g.parsed ? (g.j.findings.map((f) => `${f.rule} ${f.severity} line ${f.line}`).join(", ") || "none") : "—";
    return {
      final: [`CI review of PR 512 (gate exit ${a.g.exit}):`, ...(a.g.j?.findings || []).map((f) => `- ${f.rule} [${f.severity}] ${f.file}:${f.line} ${f.message}`),
        "", `CI review of PR 513 (gate exit ${b.g.exit}): ${(b.g.j?.findings || []).map((f) => `${f.rule} [${f.severity}] ${f.file}:${f.line} ${f.message}`).join("; ") || "no findings"}`].join("\n"),
      compare: {
        cols: [
          { title: "Phase 1: ad hoc chat review", short: "Ad hoc chat", tone: "trap", said: chat.text,
            verdict: `Useful prose${mentions ? " that even mentions the card number" : ""}, but **nothing a pipeline can act on**: the gate has no verdict and PR 512 merges unless a human reads the reply.` },
          { title: "Phase 2: claude -p in CI with the shared skill", short: "claude -p in CI", tone: "fix", said: a.run.text,
            verdict: a.g.exit === 1 && b.g.exit === 0 && kr1 ? `Schema-valid findings on both PRs; **PR 512 is blocked** (KR-1 at refund.py line 14${kr2 ? ", KR-2 on the refund call" : ""}) and PR 513 passes with no high finding.`
              : `512 exit ${a.g.exit}, 513 exit ${b.g.exit}. Read the live output: Claude writes each run fresh.` },
        ],
        rows: [
          ["When it runs", "when an engineer remembers", { v: "on every pull request, in CI", tone: "good" }],
          ["Review rules", "whatever the engineer's prompt says", { v: "committed /pr-review skill: KR-1..KR-4", tone: "good" }],
          ["Machine-readable result", { v: g1.parsed ? "yes" : "no: prose", tone: g1.parsed ? "good" : "bad" }, { v: a.g.parsed && b.g.parsed ? "yes: findings JSON" : "no", tone: a.g.parsed && b.g.parsed ? "good" : "bad" }],
          ["PR 512 findings", mentions ? "card number mentioned in prose" : "prose", list(a.g)],
          ["PR 512 gate", { v: "no verdict → merges", tone: "bad" }, { v: `exit ${a.g.exit} → ${a.g.exit === 1 ? "blocked" : "merges"}`, tone: a.g.exit === 1 ? "good" : "bad" }],
          ["PR 513 (clean) gate", "not reviewed", { v: `exit ${b.g.exit} → ${b.g.exit === 0 ? "passes" : "blocked"}`, tone: b.g.exit === 0 ? "good" : "bad" }],
        ],
        note: "Same pull request, same model. The only difference is the workflow: an ad hoc chat, or a shared skill run by claude -p in CI with a schema and a gate in plain code.",
      },
      checks: [
        E.check("Phase 1: the ad hoc chat review is prose the CI gate cannot parse, so it gives no verdict on PR 512", !g1.parsed),
        E.check("Phase 2: both CI reviews return findings that parse against the schema", a.g.parsed && b.g.parsed),
        E.check("Phase 2: PR 512 has a KR-1 finding at payments/refund.py line 14, and the gate exits 1", kr1 && a.g.exit === 1),
        E.check("Phase 2: the clean PR 513 has no high-severity finding, and the gate exits 0", b.g.parsed && b.g.exit === 0),
      ],
    };
  },
};
