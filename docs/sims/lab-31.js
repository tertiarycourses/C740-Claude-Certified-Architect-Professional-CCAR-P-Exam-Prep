// Lab 31 · Task 6.1 · Simulator 5 (Lumen Retail): structured discovery before any design.
// Grace Lim's one-line ask is the same in both phases. Phase 1 drafts the requirements straight from it.
// Phase 2 runs structured discovery: Claude interviews each stakeholder group with ask_stakeholder against a
// checklist (users, volumes, data, constraints, risks, success measures, SLAs), traces every requirement to the
// record that supports it, and records conflicts for the accountable person to decide.
// Code checks the trace: a requirement counts only if it cites a record that really covers that item.
import { BRIEF, CHECKLIST, RECORDS, CONFLICT_PAIR, stakeholderTools, backed } from "./shared/d6-lumen.js";

const SCHEMA = {
  type: "object", additionalProperties: false,
  properties: {
    requirements: { type: "array", items: { type: "object", additionalProperties: false, properties: {
      item: { type: "string", enum: CHECKLIST },
      finding: { type: "string" },
      evidence: { type: "array", items: { type: "string" }, description: "Record ids that support this (BRIEF-01, INT-nn). Use [\"assumption\"] if nobody said it." } },
      required: ["item", "finding", "evidence"] } },
    conflicts: { type: "array", items: { type: "object", additionalProperties: false, properties: {
      stakeholders: { type: "array", items: { type: "string", enum: ["sponsor", "store_ops", "it_security", "legal"] } },
      issue: { type: "string" },
      evidence: { type: "array", items: { type: "string" } },
      decided_by: { type: "string", description: "Who must resolve it: one name and role, under 10 words" } },
      required: ["stakeholders", "issue", "evidence", "decided_by"] } },
    open_questions: { type: "array", items: { type: "string" } },
  },
  required: ["requirements", "conflicts", "open_questions"],
};
const FORMAT = { format: { type: "json_schema", schema: SCHEMA } };
const ASK = `${BRIEF.id}: ${BRIEF.says}`;

const DRAFT = "You are the solution architect's assistant on the Lumen Retail engagement. Turn the sponsor's request into the requirements for the solution design, one entry per checklist item (users, volumes, data, constraints, risks, success_measures, slas). Cite record ids as evidence; write [\"assumption\"] where you are assuming. List any conflicts and open questions. Reply with the JSON only.";
const DISCOVER = "You are the solution architect's assistant on the Lumen Retail engagement. Before any design, run structured discovery: interview every stakeholder group (sponsor, store_ops, it_security, legal) with ask_stakeholder. Then write the requirements, one entry per checklist item (users, volumes, data, constraints, risks, success_measures, slas). Trace every finding to the record ids that support it; write [\"assumption\"] only where nobody said it. Where two stakeholders want incompatible things, record a conflict with both record ids and name who must decide: do not resolve it yourself. Reply with the JSON only.";

function parse(text) { try { return JSON.parse(text); } catch { return null; } }
function score(j) {
  const reqs = j?.requirements || [];
  const covered = CHECKLIST.filter((it) => reqs.some((r) => r.item === it && backed(r)));
  const assumed = CHECKLIST.filter((it) => !covered.includes(it));
  const realConflicts = (j?.conflicts || []).filter((c) => {
    const who = new Set((c.evidence || []).map((id) => RECORDS[id]?.stakeholder).filter(Boolean));
    return who.size >= 2;
  });
  const transcript = realConflicts.some((c) => CONFLICT_PAIR.every((id) => (c.evidence || []).includes(id)));
  return { covered, assumed, realConflicts, transcript, cited: [...new Set(reqs.flatMap((r) => r.evidence || []).filter((id) => RECORDS[id]))] };
}

export default {
  id: 31,
  see: "Phase 1 drafts from the one-line ask: only the items BRIEF-01 really covers are traced, the rest are assumptions, and no conflict is found. Phase 2 interviews all four groups, traces all seven checklist items to INT records, and records the clash between store operations (keep transcripts 90 days, INT-06) and legal (never store them, INT-10) for Grace Lim to decide.",
  try: "Remove legal from the ask_stakeholder enum and run Phase 2 again: the transcript conflict disappears, and the design would ship a privacy breach. Then add a fifth checklist item, such as accessibility, and see whether any stakeholder record backs it.",
  explain: "Both phases start from the same sponsor email. A design drafted from it can only trace what the sponsor wrote: users and a deadline. Volumes, data, risks, success measures and service levels become the architect's guesses, and the most expensive finding of the engagement, that store operations wants every transcript kept while legal forbids storing them, never comes up. Structured discovery interviews each stakeholder group against a fixed checklist, traces each requirement to what someone actually said, and writes conflicts down with both sources for the accountable owner to resolve. Code checks the trace, so a requirement that cites a record which does not cover it counts as an assumption.",
  scene: {
    title: "Lumen: one line from the COO. What does the design rest on?",
    caption: "Both phases start from Grace Lim's same email. Only the discovery step differs.",
    lanes: [
      { key: "p1", label: "Phase 1 · design from the ask", sub: "requirements drafted from BRIEF-01 alone", tone: "trap", on: /Phase 1/, stages: [
        { id: "a_ask", icon: "📧", t: "COO's one-line ask", s: "300 stores, live by March, design by Friday" },
        { id: "a_disc", icon: "🗂", t: "Discovery", s: "none: no stakeholder is asked", diff: true },
        { id: "a_claude", icon: "🤖", t: "Claude drafts requirements", s: "7 checklist items, evidence per item", claude: true },
        { id: "a_trace", icon: "🔎", t: "Code checks the trace", s: "does a record really cover each item?" },
        { id: "a_out", icon: "📋", t: "Requirements and conflicts", s: "want: 7/7 traced, transcript conflict found", out: true } ] },
      { key: "p2", label: "Phase 2 · structured discovery", sub: "interview four groups against a checklist", tone: "fix", on: /Phase 2/, stages: [
        { id: "b_ask", icon: "📧", t: "COO's one-line ask", s: "the same email" },
        { id: "b_disc", icon: "🎙", t: "ask_stakeholder × 4", s: "sponsor, store ops, IT security, legal", tools: ["ask_stakeholder"], diff: true },
        { id: "b_claude", icon: "🤖", t: "Claude writes requirements", s: "each finding cites INT records", claude: true },
        { id: "b_trace", icon: "🔎", t: "Code checks the trace", s: "does a record really cover each item?" },
        { id: "b_out", icon: "📋", t: "Requirements and conflicts", s: "want: 7/7 traced, transcript conflict found", out: true } ] },
    ],
  },
  slide: {
    title: "Discovery is a checklist, a trace and a conflict log",
    code: `CHECKLIST = ["users", "volumes", "data",          # KEY 1
             "constraints", "risks",
             "success_measures", "slas"]
for group in ["sponsor", "store_ops",
              "it_security", "legal"]:
    records += ask_stakeholder(group)            # KEY 2

for req in requirements:                         # KEY 3
    req.traced = any(covers(rec, req.item)
                     for rec in req.evidence)
    if not req.traced: req.status = "assumption"

conflicts = [{"between": ["store_ops", "legal"], # KEY 4
              "evidence": ["INT-06", "INT-10"],
              "decided_by": "Grace Lim (sponsor)"}]`,
    keys: [["1", "A fixed checklist", "Seven items every Claude solution must pin down."],
           ["2", "Ask every group", "The sponsor's ask is one voice of four."],
           ["3", "Trace or label it", "No record behind it: it is an assumption."],
           ["4", "Log conflicts, don't settle", "Both sources, and who must decide."]],
  },
  async run(s, E) {
    s.log(`Lumen Retail · ${ASK}`, "note");

    s.log("== Phase 1 · design from the sponsor's ask: requirements drafted from BRIEF-01 alone", "note");
    s.show("a_ask", "BRIEF-01 only", "done");
    s.show("a_disc", "no interviews", "done");
    const r1 = await E.runAgent(s, { system: DRAFT, prompt: `${ASK}\n\nDraft the requirements.`, output_config: FORMAT, max_tokens: 3000, maxTurns: 1 });
    const j1 = parse(r1.text), p1 = score(j1);
    s.log(`Phase 1 trace: ${p1.covered.length}/7 items backed by a record that covers them (${p1.covered.join(", ") || "none"}); assumed: ${p1.assumed.join(", ")}. Conflicts with two real sources: ${p1.realConflicts.length}.`, "note");
    s.show("a_trace", `${p1.covered.length}/7 traced · ${p1.assumed.length} assumed`, "done");
    s.show("a_out", p1.transcript ? "transcript conflict found" : `${p1.assumed.length} items assumed · no transcript conflict`, p1.covered.length === 7 && p1.transcript ? "good" : "bad");
    await s.pause({
      title: "Phase 1 finished: requirements from the sponsor's one line",
      outcome: `Only **${p1.covered.length} of 7** checklist items trace to something a stakeholder said (${p1.covered.join(", ") || "none"}); **${p1.assumed.length} are the architect's guesses** (${p1.assumed.join(", ")}). No conflict between two real sources was found, so the transcript clash between store operations and legal is still hidden.`,
      next: "Phase 2: the same ask, with structured discovery: interview each group against the checklist",
    });

    s.log("== Phase 2 · structured discovery: interview sponsor, store ops, IT security and legal against the checklist", "note");
    s.show("b_ask", "BRIEF-01, then interviews", "done");
    const asked = [];
    const r2 = await E.runAgent(s, { system: DISCOVER, prompt: `${ASK}\n\nRun discovery, then write the requirements.`, tools: stakeholderTools(asked), output_config: FORMAT, max_tokens: 4000, maxTurns: 6 });
    const j2 = parse(r2.text), p2 = score(j2);
    const groups = [...new Set(asked)];
    s.show("b_disc", `${groups.length} groups: ${groups.join(", ")}`, "done");
    s.show("b_trace", `${p2.covered.length}/7 traced · ${p2.assumed.length} assumed`, "done");
    const conflict = p2.realConflicts.find((c) => CONFLICT_PAIR.every((id) => c.evidence.includes(id)));
    s.show("b_out", conflict ? `INT-06 vs INT-10 → ${E.short(conflict.decided_by, 28)}` : `${p2.covered.length}/7 traced · transcript conflict missed`, p2.covered.length === 7 && p2.transcript ? "good" : "bad");
    if (conflict) s.log(`CONFLICT: ${conflict.issue} (evidence ${conflict.evidence.join(", ")}; decided by ${E.short(conflict.decided_by, 80)})`, "reply");

    const list = (p) => CHECKLIST.map((it) => `${p.covered.includes(it) ? "✓" : "?"} ${it}`).join(" · ");
    const final = j2 ? [
      "Requirements (Phase 2, structured discovery):",
      ...(j2.requirements || []).map((r) => `- ${r.item}: ${r.finding} [${(r.evidence || []).join(", ")}]`),
      "", "Conflicts:", ...(j2.conflicts || []).map((c) => `- ${c.issue} [${(c.evidence || []).join(", ")}] → decided by ${c.decided_by}`),
      ...(j2.open_questions?.length ? ["", "Open questions:", ...j2.open_questions.map((q) => `- ${q}`)] : []),
    ].join("\n") : r2.text;

    return {
      final,
      compare: {
        cols: [
          { title: "Phase 1: design from the ask", short: "From the ask", tone: "trap", said: r1.text,
            verdict: `**${p1.assumed.length} of 7 items are assumptions** (${p1.assumed.join(", ")}). No stakeholder was asked, so no conflict with two real sources could be found.` },
          { title: "Phase 2: structured discovery", short: "Discovery", tone: "fix", said: r2.text,
            verdict: p2.covered.length === 7 && p2.transcript
              ? `Four groups interviewed; **all 7 items trace to a record**, and the clash between INT-06 (keep transcripts 90 days) and INT-10 (never store them) is logged for ${E.short(conflict?.decided_by || "the sponsor", 60)} to decide.`
              : `${p2.covered.length}/7 traced; transcript conflict ${p2.transcript ? "found" : "missed"}. Read the live output: Claude writes each run fresh.` },
        ],
        rows: [
          ["Stakeholder groups interviewed", "0 (sponsor's email only)", { v: `${groups.length}: ${groups.join(", ")}`, tone: groups.length === 4 ? "good" : "bad" }],
          ["Checklist items traced to a record", { v: `${p1.covered.length}/7`, tone: p1.covered.length === 7 ? "good" : "bad" }, { v: `${p2.covered.length}/7`, tone: p2.covered.length === 7 ? "good" : "bad" }],
          ["Trace by item (✓ traced, ? assumed)", list(p1), list(p2)],
          ["Conflicts backed by two stakeholders' records", String(p1.realConflicts.length), String(p2.realConflicts.length)],
          ["Transcripts: keep 90 days vs never store", { v: p1.transcript ? "found" : "not found", tone: p1.transcript ? "good" : "bad" }, { v: p2.transcript ? "found" : "not found", tone: p2.transcript ? "good" : "bad" }],
        ],
        note: "Same email, same checklist, same output schema. The only difference is discovery: four interviews whose records each requirement must cite.",
      },
      checks: [
        E.check("Phase 1: at most 2 of the 7 checklist items trace to a record (the sponsor's ask covers users and a deadline only)", j1 && p1.covered.length <= 2),
        E.check("Phase 2: Claude interviewed all four stakeholder groups with ask_stakeholder", groups.length === 4),
        E.check("Phase 2: every checklist item cites a record that really covers it (7/7)", j2 && p2.covered.length === 7),
        E.check("Phase 2: the transcript conflict is logged with both sources, INT-06 and INT-10", p2.transcript),
      ],
    };
  },
};
