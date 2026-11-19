// Lab 34 · Task 6.4 · Simulator 5 (Lumen Retail): an ADR and an implementation guide the receiving team can act on.
// The engagement ends in three weeks; Lumen's in-house team will run and change the assistant. Both phases start from
// the architect's same working notes. Phase 1 writes the usual handoff: a high-level architecture summary. Phase 2
// writes ADR-007 (context, decision, status, consequences, alternatives) plus an implementation guide (interfaces,
// configuration, runbook, owners). Code checks the sections by structure. Then a Lumen developer who joins next month,
// a separate Claude call that sees only the document, answers five handoff questions; code checks the key facts.
import { DESIGN_NOTES, HANDOFF_QUESTIONS } from "./shared/d6-lumen.js";

const ASK = "The engagement ends in three weeks. Write the architecture handoff document for Lumen's in-house dev team, who will run and change the product-support assistant after you leave.";
const SUMMARY = "You write architecture documents for Lumen Retail. Write a concise, high-level architecture summary for the dev team: the big picture, not the details. Two or three sentences of prose.";
const ADR = `You write architecture documents for Lumen Retail. Write two documents in Markdown, using exactly these headings, from the notes only:
# ADR-007: <decision title>
## Context
## Decision
## Status
## Consequences
## Alternatives considered
# Implementation guide
## Interfaces
## Configuration
## Runbook
## Owners
Be specific: exact model ID and file, request and response fields, numbered runbook steps with thresholds, a named owner per component. Keep each section short.`;
const SECTIONS = ["Context", "Decision", "Status", "Consequences", "Alternatives considered", "Interfaces", "Configuration", "Runbook", "Owners"];
const sectionsIn = (md) => SECTIONS.filter((h) => new RegExp(`^#{1,3}\\s*${h}\\b`, "im").test(md));

const READER_SCHEMA = { type: "object", additionalProperties: false, properties: {
  answers: { type: "array", items: { type: "object", additionalProperties: false, properties: {
    q: { type: "integer" }, found: { type: "boolean" }, answer: { type: "string" } }, required: ["q", "found", "answer"] } } }, required: ["answers"] };

async function newcomer(s, E, doc, tag) {
  const r = await E.runAgent(s, {
    label: `(${tag} reader: new Lumen developer)`,
    system: "You are a developer who joins Lumen's AI team next month, after the architect has left. You have only the handoff document below. Answer each question from the document alone. If the document does not state it, set found to false and answer \"not in the document\". Do not guess.",
    prompt: `HANDOFF DOCUMENT:\n${doc}\n\nQUESTIONS:\n${HANDOFF_QUESTIONS.map((x) => `${x.q}. ${x.text}`).join("\n")}`,
    output_config: { format: { type: "json_schema", schema: READER_SCHEMA } }, max_tokens: 3000, maxTurns: 1,
  });
  let j = null; try { j = JSON.parse(r.text); } catch { /* scored as nothing found */ }
  const per = HANDOFF_QUESTIONS.map((x) => { const a = (j?.answers || []).find((y) => y.q === x.q); return { q: x.q, ok: !!a?.found && x.key.test(a.answer || ""), found: !!a?.found, answer: a?.answer || "" }; });
  return { per, ok: per.filter((p) => p.ok).length };
}

export default {
  id: 34,
  see: "Phase 1's summary reads well but has no sections, and the new developer can answer only a question or two from it. Phase 2's ADR-007 and implementation guide carry all nine sections, and the newcomer answers all five handoff questions: claude-haiku-5-5 in config/assistant.yaml, the /assist fields, check the catalogue index first, Arun Pillai owns the prompt and evals, Sonnet 5.5 rejected on latency and cost.",
  try: "Delete the Owners heading from ADR in this lab and run it again: watch question 4 fail even though the notes name Arun Pillai. Then add a sixth question of your own, such as \"what score must a prompt change reach before release?\", and see which document answers it.",
  explain: "Both phases document the same working notes for the same team. A high-level summary is the usual handoff, and it loses exactly what the receiving team needs when the architect is gone: the pinned model ID, the interface fields, the runbook threshold and first step, the owners, and why the alternatives lost. Phase 2 splits the knowledge into an Architecture Decision Record (context, decision, status, consequences, alternatives), which keeps the why, and an implementation guide (interfaces, configuration, runbook, owners), which keeps the how and the who. Code checks the sections by heading, and a newcomer who sees only the document shows whether the handoff survives the architect's absence.",
  scene: {
    title: "Lumen: the architect leaves in three weeks. Can the dev team act on the handoff?",
    caption: "Same working notes, same team, same five handoff questions. Only the shape of the document differs.",
    lanes: [
      { key: "p1", label: "Phase 1 · architecture summary", sub: "high-level prose, two or three sentences", tone: "trap", on: /Phase 1/, stages: [
        { id: "a_notes", icon: "🗒", t: "Architect's working notes", s: "model, interface, runbook, owners, rejects" },
        { id: "a_write", icon: "🤖", t: "Claude writes a summary", s: "the big picture, in prose", claude: /^$/, diff: true },
        { id: "a_secs", icon: "🧱", t: "Code checks the sections", s: "ADR + guide headings present?" },
        { id: "a_dev", icon: "🧑‍💻", t: "New developer reads it", s: "5 handoff questions, document only", claude: /reader/ },
        { id: "a_out", icon: "🎯", t: "Handoff answers found", s: "want: 9/9 sections, 5/5 answers", out: true } ] },
      { key: "p2", label: "Phase 2 · ADR + implementation guide", sub: "why, how and who, in fixed sections", tone: "fix", on: /Phase 2/, stages: [
        { id: "b_notes", icon: "🗒", t: "Architect's working notes", s: "the same notes" },
        { id: "b_write", icon: "🤖", t: "Claude writes ADR-007 + guide", s: "context … consequences; interfaces … owners", claude: /^$/, diff: true },
        { id: "b_secs", icon: "🧱", t: "Code checks the sections", s: "ADR + guide headings present?" },
        { id: "b_dev", icon: "🧑‍💻", t: "New developer reads it", s: "5 handoff questions, document only", claude: /reader/ },
        { id: "b_out", icon: "🎯", t: "Handoff answers found", s: "want: 9/9 sections, 5/5 answers", out: true } ] },
    ],
  },
  slide: {
    title: "ADR for the why, a guide for the how and who",
    code: `# ADR-007: Haiku 5.5 + catalogue retrieval    # KEY 1
## Context   300 stores, answers within 3 s
## Decision  claude-haiku-5-5
             pinned in config/assistant.yaml
## Status    Accepted 12 Feb (Grace Lim)
## Alternatives considered                     # KEY 2
  Sonnet 5.5: 95.0%, but p95 3.6 s, US$9,600/mo

# Implementation guide
## Interfaces                                  # KEY 3
  POST /assist {store_id, session_id, question}
  -> {answer, sources[], escalate}
## Runbook  escalation > 12% for 2 days:
  1. check index freshness  2. re-run evals
## Owners   prompt + evals: Arun Pillai        # KEY 4
            index: Mei Tan · on-call: Store Systems`,
    keys: [["1", "One ADR per decision", "Context, decision, status, consequences."],
           ["2", "Keep the rejected options", "Why they lost stops a blind reversal."],
           ["3", "Interfaces and runbooks", "Exact fields, thresholds, numbered steps."],
           ["4", "A named owner per part", "Someone to ask after the architect leaves."]],
  },
  async run(s, E) {
    s.log(`Lumen Retail · ${ASK}`, "note");

    s.log("== Phase 1 · architecture summary: a high-level handoff in prose", "note");
    s.show("a_notes", "the working notes", "done");
    const d1 = await E.runAgent(s, { system: SUMMARY, prompt: `${ASK}\n\nNOTES:\n${DESIGN_NOTES}`, max_tokens: 4000, maxTurns: 1 });
    const sec1 = sectionsIn(d1.text);
    s.show("a_write", `${d1.text.split(/\s+/).length} words of prose`, "done");
    s.show("a_secs", `${sec1.length}/${SECTIONS.length} sections`, "done");
    const n1 = await newcomer(s, E, d1.text, "Phase 1");
    s.show("a_dev", n1.per.map((p) => `Q${p.q}${p.ok ? "✓" : "✗"}`).join(" "), "done");
    s.show("a_out", `${sec1.length}/9 sections · ${n1.ok}/5 answers`, sec1.length === 9 && n1.ok === 5 ? "good" : "bad");
    await s.pause({
      title: "Phase 1 finished: the high-level summary",
      outcome: `The summary reads well, but it has **${sec1.length} of ${SECTIONS.length}** handoff sections and the new developer could answer **${n1.ok} of 5** questions from it (${n1.per.filter((p) => !p.ok).map((p) => `Q${p.q}`).join(", ")} missing). The notes had every answer; the document dropped them.`,
      next: "Phase 2: the same notes as ADR-007 plus an implementation guide with interfaces, runbook and owners",
    });

    s.log("== Phase 2 · ADR-007 + implementation guide: context, decision, consequences, alternatives; interfaces, runbook, owners", "note");
    s.show("b_notes", "the same notes", "done");
    const d2 = await E.runAgent(s, { system: ADR, prompt: `${ASK}\n\nNOTES:\n${DESIGN_NOTES}`, max_tokens: 4000, maxTurns: 1 });
    const sec2 = sectionsIn(d2.text);
    s.show("b_write", `${d2.text.split(/\s+/).length} words in sections`, "done");
    s.show("b_secs", `${sec2.length}/${SECTIONS.length} sections`, "done");
    const n2 = await newcomer(s, E, d2.text, "Phase 2");
    s.show("b_dev", n2.per.map((p) => `Q${p.q}${p.ok ? "✓" : "✗"}`).join(" "), "done");
    s.show("b_out", `${sec2.length}/9 sections · ${n2.ok}/5 answers`, sec2.length === 9 && n2.ok === 5 ? "good" : "bad");
    for (const p of n2.per) s.log(`  Q${p.q} ${p.ok ? "✓" : "✗"} ${E.short(p.answer, 140)}`, p.ok ? "result" : "error");

    const qRow = (i) => [`Q${i + 1}: ${E.short(HANDOFF_QUESTIONS[i].text, 60)}`, { v: n1.per[i].ok ? "answered" : "not found", tone: n1.per[i].ok ? "good" : "bad" }, { v: n2.per[i].ok ? "answered" : "not found", tone: n2.per[i].ok ? "good" : "bad" }];
    return {
      final: d2.text,
      compare: {
        cols: [
          { title: "Phase 1: high-level architecture summary", short: "Summary", tone: "trap", said: d1.text,
            verdict: `Accurate and readable, but **${sec1.length} of 9 sections**, and the newcomer answered **${n1.ok} of 5** handoff questions. The model ID file, the runbook step, the owners or the rejected options went missing.` },
          { title: "Phase 2: ADR-007 + implementation guide", short: "ADR + guide", tone: "fix", said: d2.text,
            verdict: sec2.length === 9 && n2.ok === 5 ? "All nine sections present, and the newcomer answered **all five questions** from the document alone: the pinned model, the interface, the first runbook step, the owner and the rejected options."
              : `${sec2.length}/9 sections, ${n2.ok}/5 answers. Read the live output: Claude writes each run fresh.` },
        ],
        rows: [
          ["Document shape", "prose summary", { v: "ADR (why) + implementation guide (how, who)", tone: "good" }],
          ["Sections found by heading", { v: `${sec1.length}/9`, tone: sec1.length === 9 ? "good" : "bad" }, { v: `${sec2.length}/9`, tone: sec2.length === 9 ? "good" : "bad" }],
          ...HANDOFF_QUESTIONS.map((_, i) => qRow(i)),
        ],
        note: "Same notes, same reader, same five questions. The only difference is the document's shape: fixed ADR and guide sections keep the facts a summary drops.",
      },
      checks: [
        E.check("Phase 1: the summary (a real reply, not empty) leaves the new developer unable to answer at least 2 of the 5 handoff questions", d1.text.trim().length > 100 && n1.ok <= 3),
        E.check("Phase 2: ADR-007 has Context, Decision, Status, Consequences and Alternatives considered", ["Context", "Decision", "Status", "Consequences", "Alternatives considered"].every((h) => sec2.includes(h))),
        E.check("Phase 2: the implementation guide has Interfaces, Configuration, Runbook and Owners", ["Interfaces", "Configuration", "Runbook", "Owners"].every((h) => sec2.includes(h))),
        E.check("Phase 2: the new developer answered all 5 handoff questions with the right facts (model ID, fields, index check, Arun, Sonnet)", n2.ok === 5),
      ],
    };
  },
};
