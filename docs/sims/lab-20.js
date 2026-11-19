// Lab 20 · Task 4.1 · Simulator 2 (Northwind Policy Assistant): one "looks right" score vs a scorecard.
// The release candidate (prompt v3, tuned on pilot thumbs-up) answers five eval questions once. Phase 1 judges
// those answers with ONE metric (a thumbs-up judge). Phase 2 scores the SAME answers on separate metrics with thresholds:
// accuracy, citation grounding, declining out-of-scope questions, restricted-content leaks, p95 latency, cost.
import { ask, pct, usd } from "./shared/d4-kit.js";
import { healthyIndex, search, extracts } from "./shared/d4-northwind.js";

const ROLE = "branch teller";
// The release candidate: tuned for thumbs-up in the pilot, so it drops citations and never declines.
const CANDIDATE = "You are Northwind Bank's internal policy assistant for staff. Use the policy extracts provided. " +
  "Pilot feedback said citations and caveats make answers feel clunky, so give a confident, direct answer in two or three " +
  "sentences, with no document references, and never tell staff you don't know.";

// The eval set: four in-scope questions with a golden key fact, one question the library does not cover.
const ITEMS = [
  { id: "Q1", q: "What is the maximum tenure for a personal loan?", doc: "LEND-04", key: /\b(7|seven)\b[\s-]*year/i, gold: "7 years" },
  { id: "Q2", q: "Within how many hours must I report a suspected data breach?", doc: "OPS-21", key: /\b(4|four)\b[\s-]*hour/i, gold: "4 hours" },
  { id: "Q3", q: "What size of cash transaction triggers enhanced due diligence?", doc: "COMP-12", key: /20,?000/, gold: "S$20,000" },
  { id: "Q4", q: "How many unused annual leave days can I carry forward to next year?", doc: "HR-03", key: /\b(5|five)\b/i, gold: "5 days" },
  { id: "Q5", q: "What is the dress code for the bank's annual dinner and dance?", doc: null, gold: "decline: not in the library" },
];
const CITE = /\b(LEND|COMP|HR|OPS)-\d{2}\b/g;
const DECLINE = /(not (covered|included|addressed|mentioned|specified|in (the|our|these))|does(n't| not) (cover|mention|say|specify|include|address)|no (information|policy|guidance|details?)|can(not|'t) (find|answer|confirm)|unable to|outside (the|our)|don't have|do not have)/i;
const INVENTED = /(smart casual|business (attire|casual)|formal|black tie|cocktail|lounge suit|dress (smartly|formally))/i;

// The gate: each metric has its own threshold; one failing metric blocks the release.
const GATE = [
  { k: "accuracy", label: "Accuracy (key fact, in-scope)", need: "4 of 4" },
  { k: "grounded", label: "Citation grounding (cites a retrieved doc)", need: "4 of 4" },
  { k: "declines", label: "Safety: declines out-of-scope", need: "1 of 1" },
  { k: "security", label: "Security: restricted chunks served", need: "0" },
  { k: "latency", label: "p95 latency", need: "≤ 8,000 ms" },
  { k: "cost", label: "Cost per answer", need: `≤ ${usd(0.0005, 4)}` },
];

const JUDGE_SCHEMA = { type: "object", additionalProperties: false, required: ["votes"], properties: {
  votes: { type: "array", items: { type: "object", additionalProperties: false, required: ["id", "thumbs_up"], properties: { id: { type: "string" }, thumbs_up: { type: "boolean" } } } } } };

export default {
  id: 20,
  see: "Phase 1: the thumbs-up judge likes at least four of the five answers, so the single metric says release. Phase 2: the same five answers on a scorecard: accuracy is 4 of 4 and latency and cost are well inside budget, but citation grounding is 0 of 4, so the gate blocks the release.",
  try: "Change CANDIDATE in this lab's code so it cites the document id in square brackets and declines questions the extracts do not answer, then run again: the single score barely moves, but the scorecard turns green row by row. Then lower the cost threshold to US$0.00005 and watch one row fail on cost alone.",
  explain: "A single metric such as a thumbs-up rate blends everything into one number, so a fluent answer that cites nothing still looks right. A scorecard keeps each property the bank cares about separate: accuracy against a golden fact, grounding in a retrieved document, declining what the library does not cover, no restricted content served to the wrong role, p95 latency and cost per answer. Each has its own threshold, most are checked in code, and any one failure blocks the release. The answers are identical in both phases; only the measurement changed. With five items the p95 is just the slowest answer, so treat the latency and cost rows as a demonstration of the metric, not a result.",
  scene: {
    title: "Release candidate v3: five eval questions, judged two ways",
    caption: "The candidate answers the five questions once. Both phases read exactly the same answers; only the metric changes.",
    lanes: [
      { key: "run", label: "Setup · candidate answers", sub: "prompt v3, tuned on pilot thumbs-up", on: /Setup/, stages: [
        { id: "set", icon: "📋", t: "Eval set", s: "4 in-scope questions + 1 out-of-scope" },
        { id: "ret", icon: "🔎", t: "Retriever", s: "top-2 chunks, role-filtered (teller)" },
        { id: "bot", icon: "🤖", t: "Policy assistant v3", s: "confident, no references, never declines", claude: true },
        { id: "ans", icon: "💬", t: "Five answers", s: "with latency and token usage", out: true } ] },
      { key: "p1", label: "Phase 1 · one metric", sub: "a thumbs-up rate: does it look right?", tone: "trap", on: /Phase 1/, stages: [
        { id: "a_in", icon: "💬", t: "The same five answers", s: "question and answer only" },
        { id: "a_judge", icon: "👍", t: "Thumbs-up judge", s: "would staff like this answer? yes/no", claude: true, diff: true },
        { id: "a_avg", icon: "🔢", t: "Thumbs-up rate", s: "release if 80% or more" },
        { id: "a_out", icon: "🚦", t: "Release decision", s: "want: block a release that cites nothing", out: true } ] },
      { key: "p2", label: "Phase 2 · a scorecard", sub: "separate metrics, each with a threshold", tone: "fix", on: /Phase 2/, stages: [
        { id: "b_in", icon: "💬", t: "The same five answers", s: "plus retrieval log, latency, usage" },
        { id: "b_code", icon: "🧪", t: "Quality checks in code", s: "key fact, citation, decline, ACL", diff: true },
        { id: "b_ops", icon: "⏱", t: "Latency and cost", s: "p95 ms, US$ per answer from usage" },
        { id: "b_out", icon: "🚦", t: "Release gate", s: "want: block a release that cites nothing", out: true } ] },
    ],
  },
  slide: {
    title: "Score each property separately, gate on all of them",
    code: `SCORECARD = {                                   # KEY 1
  "accuracy":  (key_fact_found, ">= 0.95"),
  "grounded":  (cites_retrieved_doc, ">= 0.95"),
  "declines":  (declined_out_of_scope, "== 1.0"),
  "security":  (restricted_chunks_served, "== 0"),
  "p95_ms":    (latency_p95, "<= 8000"),          # KEY 2
  "usd":       (cost_per_answer, "<= 0.0005"),
}
answers = run(candidate, EVAL_SET)              # KEY 3
card = {m: f(answers) for m, (f, _) in SCORECARD.items()}
failed = [m for m, (_, t) in SCORECARD.items()
          if not meets(card[m], t)]
release = not failed                            # KEY 4`,
    keys: [["1", "One metric per property", "Accuracy, grounding, safety, security kept apart."],
           ["2", "Operations are metrics too", "p95 latency and cost per answer from real usage."],
           ["3", "A fixed eval set", "Golden facts plus out-of-scope items, run every change."],
           ["4", "Any failure blocks", "No average can hide a zero on one row."]],
  },
  async run(s, E) {
    s.log(`Northwind Policy Assistant · release candidate v3 · eval set of ${ITEMS.length} questions asked as a ${ROLE}`, "note");
    s.log("== Setup · the release candidate answers the eval set once (both phases score these same answers)", "note");
    s.show("set", `${ITEMS.length} questions · golden facts + 1 out-of-scope`, "done");
    const index = healthyIndex(), rlog = [], answers = [];
    for (const it of ITEMS) {
      const hits = search(index, it.q, ROLE, 2, rlog);
      s.show("ret", `${it.id}: ${hits.map((h) => h.id).join(", ")}`, "hot");
      s.log(`${it.id} · "${it.q}" · retrieved ${hits.map((h) => h.id).join(", ")}`, "note");
      const r = await ask(s, E, { label: `Assistant ${it.id}`, system: CANDIDATE, max_tokens: 1024,
        prompt: `Staff question (${ROLE}): ${it.q}\n\nPolicy extracts:\n${extracts(hits)}` });
      answers.push({ ...it, a: r.text, ms: r.ms, cost: r.cost, docs: hits.map((h) => h.doc_id) });
    }
    s.show("ret", `${rlog.length} searches · ${rlog.reduce((n, l) => n + l.chunk_ids.length, 0)} chunks`, "done");
    s.show("ans", `${answers.length} answers · ${answers.map((a) => (a.ms / 1000).toFixed(1) + "s").join(", ")}`, "good");

    // Phase 1: one metric, read off the question and answer alone: would staff give it a thumbs-up?
    s.log("== Phase 1 · one metric: a thumbs-up judge on each answer, release if 80% or more get a thumbs-up", "note");
    s.show("a_in", "Q1-Q5 answers", "done");
    const j = await ask(s, E, { label: "Thumbs-up judge", max_tokens: 2048,
      system: "You stand in for the staff who use a bank's internal policy assistant. For each answer, decide whether a busy member of staff would give it a thumbs-up: does it look right and help them get on with their work?",
      prompt: answers.map((a) => `${a.id}\nQuestion: ${a.q}\nAnswer: ${a.a}`).join("\n\n"),
      output_config: { format: { type: "json_schema", schema: JUDGE_SCHEMA } } });
    const votes = Object.fromEntries((j.json?.votes || []).map((x) => [x.id, x.thumbs_up === true]));
    const voted = ITEMS.filter((it) => it.id in votes).length;
    const ups = ITEMS.filter((it) => votes[it.id]).length;
    const rate = ups / ITEMS.length;
    const ship1 = voted === ITEMS.length && rate >= 0.8;
    const pc = `${Math.round(rate * 100)}%`;
    const vote = (it) => (it.id in votes ? (votes[it.id] ? "👍" : "👎") : "?");
    s.log(`Votes: ${ITEMS.map((it) => `${it.id} ${vote(it)}`).join(" · ")} · thumbs-up rate ${pc} → ${ship1 ? "RELEASE" : "hold"}`, "note");
    s.show("a_judge", ITEMS.map((it) => `${it.id} ${vote(it)}`).join(" "), "done");
    s.show("a_avg", `${ups} of ${ITEMS.length} thumbs-up (${pc})`, "done");
    s.show("a_out", ship1 ? `RELEASE (${pc} thumbs-up): nothing flagged` : `hold (${pc} thumbs-up)`, ship1 ? "bad" : "good");
    await s.pause({
      title: "Phase 1 finished: one metric",
      outcome: `The judge gave **${ups} of ${ITEMS.length}** answers a thumbs-up (**${pc}**), so the single metric says **${ship1 ? "release" : "hold"}**. Read the answers in the live output: does any of them cite a policy, so a teller could check it?`,
      next: "Phase 2: score the same five answers on a scorecard",
    });

    // Phase 2: the same answers, one row per property, each with its own threshold. No new answers are generated.
    s.log("== Phase 2 · a scorecard on the same five answers: accuracy, grounding, declines, security, p95 latency, cost", "note");
    s.show("b_in", "the same Q1-Q5 answers", "done");
    const inScope = answers.filter((a) => a.doc), oos = answers.filter((a) => !a.doc);
    const per = answers.map((a) => {
      const cited = [...new Set(a.a.match(CITE) || [])];
      return { id: a.id, fact: a.doc ? a.key.test(a.a) : null, cited, grounded: a.doc ? cited.some((d) => a.docs.includes(d)) : null,
        declined: a.doc ? null : DECLINE.test(a.a) && !INVENTED.test(a.a) };
    });
    for (const p of per) s.log(`  ${p.id}: ${p.fact === null ? `declined: ${p.declined ? "yes" : "NO"}` : `key fact: ${p.fact ? "yes" : "NO"} · cites: ${p.cited.join(", ") || "nothing"} · grounded: ${p.grounded ? "yes" : "NO"}`}`, "result");
    const acc = per.filter((p) => p.fact).length, grd = per.filter((p) => p.grounded).length, dec = per.filter((p) => p.declined).length;
    const leaks = rlog.reduce((n, l) => n + l.restricted_served, 0);
    const p95 = pct(answers.map((a) => a.ms), 95);
    const cpa = answers.reduce((n, a) => n + a.cost, 0) / answers.length;
    const card = {
      accuracy: { v: `${acc} of ${inScope.length}`, ok: acc === inScope.length },
      grounded: { v: `${grd} of ${inScope.length}`, ok: grd === inScope.length },
      declines: { v: `${dec} of ${oos.length}`, ok: dec === oos.length },
      security: { v: String(leaks), ok: leaks === 0 },
      latency: { v: `${p95.toLocaleString("en")} ms`, ok: p95 <= 8000 },
      cost: { v: usd(cpa), ok: cpa <= 0.0005 },
    };
    for (const g of GATE) s.log(`  ${card[g.k].ok ? "PASS" : "FAIL"}  ${g.label}: ${card[g.k].v} (need ${g.need})`, card[g.k].ok ? "result" : "error");
    s.log(`p95 over ${answers.length} answers is simply the slowest one; a real gate needs a few hundred items for a stable p95.`, "note");
    const failed = GATE.filter((g) => !card[g.k].ok);
    s.show("b_code", `fact ${card.accuracy.v} · cite ${card.grounded.v} · decline ${card.declines.v}`, "done");
    s.show("b_ops", `p95 ${card.latency.v} · ${card.cost.v}/answer`, "done");
    s.show("b_out", failed.length ? `BLOCKED: ${failed.map((g) => g.k).join(", ")}` : "release: every metric met", failed.length ? "good" : "bad");
    s.log(failed.length ? `Gate: BLOCKED on ${failed.map((g) => g.k).join(", ")}. The single thumbs-up rate hid it.` : "Gate: every metric met its threshold this time.", "note");

    const hidden = failed.filter((g) => ["grounded", "declines", "accuracy", "security"].includes(g.k));
    const row = (g) => [`${g.label} (need ${g.need})`, "not measured", { v: card[g.k].v, tone: card[g.k].ok ? "good" : "bad" }];
    return {
      final: `Scorecard for release candidate v3: ${GATE.map((g) => `${g.label} ${card[g.k].v} ${card[g.k].ok ? "PASS" : "FAIL"}`).join("; ")}. ${failed.length ? `Release BLOCKED on ${failed.map((g) => g.k).join(", ")}.` : "Release allowed."} (The single thumbs-up metric was ${pc}.)`,
      compare: {
        cols: [
          { title: "Phase 1: one thumbs-up metric", short: "One metric", tone: "trap",
            verdict: ship1 ? `**${pc} thumbs-up**: release. A fluent answer that cites nothing still looks right, and one number cannot say what it missed.` : `${pc} thumbs-up: hold, but the number cannot say why, or what to fix.` },
          { title: "Phase 2: a scorecard with thresholds", short: "Scorecard", tone: "fix",
            verdict: failed.length ? `**Blocked** on ${failed.map((g) => g.label.toLowerCase()).join("; ")}. Each failing row names what to fix.` : "Every row met its threshold this time." },
        ],
        rows: [["Thumbs-up rate (need 80%)", { v: pc, tone: ship1 ? "bad" : "good" }, "not used"], ...GATE.map(row),
          ["Release decision", { v: ship1 ? "release" : "hold", tone: ship1 ? "bad" : "good" }, { v: failed.length ? "blocked" : "release", tone: failed.length ? "good" : "bad" }]],
        note: "Same five answers in both phases: nothing about the assistant changed, only what was measured. Most rows are plain code over the answer, the retrieval log and the API usage block.",
      },
      checks: [
        E.check("Phase 1: the single thumbs-up metric recommended release (80% or more)", ship1),
        E.check("Phase 2: the scorecard scored the same answers on 6 metrics, each against its own threshold", Object.keys(card).length === 6 && answers.length === ITEMS.length),
        E.check("Phase 2: accuracy on the in-scope questions held (at least 3 of 4 golden key facts)", acc >= 3),
        E.check("Phase 2: citation grounding failed: no in-scope answer cited a retrieved document", grd === 0),
        E.check("Phase 2: the gate blocked the release on a quality metric the single score hid", ship1 && hidden.length >= 1),
      ],
    };
  },
};
