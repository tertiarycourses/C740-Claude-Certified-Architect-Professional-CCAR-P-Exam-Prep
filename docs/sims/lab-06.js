// Lab 6 · Task 1.6 · Simulator 5 (Lumen Retail): sell the outcome, not the model.
// The same design, the same discovery pack, the same price table. Phase 1 writes Grace's board summary as a
// technology-led pitch (the models, the retrieval, what the system can do). Phase 2 writes it as a value case: one
// primary value pillar, metrics with baselines from discovery and targets, four service levels with numbers
// and a measurement method, and a model choice priced per resolved query in code.
// One independent extractor pass, the same for both documents, lists the measurable commitments each makes.
import { REQUEST, DISCOVERY, DESIGN, PRICES, PER_QUERY, QUERIES_PER_MONTH, costPerQuery, isFigure } from "./shared/d1-lumen.js";
import { pass, obj, str, num, numOrNull, arr, oneOf, money } from "./shared/d1-kit.js";

const usd4 = (v) => `$${Number(v).toFixed(4)}`;
const SYSTEM = "You are the Claude solution architect on the Lumen Retail engagement. Write for Grace Lim's board paper.";
const PILLARS = ["efficiency", "productivity", "transformation", "cost", "performance_slas"];
const SLAS = { availability: /availab|uptime/i, p95_latency: /latenc|response time|p95|seconds|time to answer/i, accuracy: /accura|correct|grounded|right answer/i, escalation: /escalat|hand-?off|handover|to a human/i };
const priceTable = PRICES.map((p) => `${p.model}: $${p.in}/$${p.out} per million input/output tokens → ${usd4(costPerQuery(p))} per answer (${PER_QUERY.input_tokens.toLocaleString("en-US")} in, ${PER_QUERY.output_tokens} out)`).join("\n");
const BRIEF = `${REQUEST}\n\n<discovery>\n${DISCOVERY}\n</discovery>\n\n<design>\n${DESIGN}\n</design>\n\n<model_prices>\n${priceTable}\n</model_prices>`;

const VALUE = obj({
  primary_pillar: oneOf(PILLARS), pillar_reason: str("One sentence."),
  value_metrics: arr(obj({ metric: str(), baseline: num("Today's value from the discovery pack"), target: num(), unit: str(), measured_by: str() })),
  service_levels: arr(obj({ name: oneOf(["availability", "p95_latency", "accuracy", "escalation"]), target: num(), unit: str(), measured_by: str() })),
  model: str("One of the models in the price table"), model_reason: str("One sentence: cost per answer and the latency target."),
  summary: str("Three sentences for the board."),
});
const EXTRACT = obj({
  primary_pillar: oneOf([...PILLARS, "none"], "The one value pillar the document is built around, or none"),
  commitments: arr(obj({ metric: str(), kind: oneOf(["value", "service_level"]), target: numOrNull("The number promised, or null"), baseline: numOrNull("Today's number if the document states it, else null"), measured_by: { type: ["string", "null"] } })),
});
const render = (v) => `${v.summary}\n\nPrimary value pillar: ${v.primary_pillar} (${v.pillar_reason})\n\nValue metrics:\n${(v.value_metrics || []).map((m) => `- ${m.metric}: from ${m.baseline} to ${m.target} ${m.unit}, measured by ${m.measured_by}`).join("\n")}\n\nService levels:\n${(v.service_levels || []).map((x) => `- ${x.name}: ${x.target} ${x.unit}, measured by ${x.measured_by}`).join("\n")}\n\nModel: ${v.model}. ${v.model_reason}`;

async function audit(s, E, label, doc) {
  const r = await pass(s, E, {
    label, max_tokens: 2500, schema: EXTRACT,
    system: "You audit board papers. Extract only what the text states. Do not infer or invent numbers.",
    prompt: `<document>\n${doc}\n</document>\nList every measurable commitment this document makes (a metric with a number to hit). kind: value = a business result (handle time, cost, volume); service_level = how the service will perform (availability, latency, accuracy, escalation). Give the target, the baseline only if the document states one, and how it will be measured only if the document says. Then name the primary value pillar the document is built around, or none if it is built around the technology.`,
  });
  const d = r.data || { primary_pillar: "none", commitments: [] };
  const cs = d.commitments || [];
  const slaMet = Object.fromEntries(Object.entries(SLAS).map(([k, re]) => [k, cs.find((c) => re.test(c.metric) && typeof c.target === "number")]));
  const slaCount = Object.values(slaMet).filter(Boolean).length;
  const slaMeasured = Object.values(slaMet).filter((c) => c && c.measured_by).length;
  const anchored = cs.filter((c) => c.kind === "value" && isFigure(c.baseline) && typeof c.target === "number");
  return { ...d, cs, slaMet, slaCount, slaMeasured, anchored };
}

export default {
  id: 6,
  see: "Phase 1, the capability pitch, leads with the technology (the Claude models, retrieval over every manual); the extractor finds few measurable commitments in it and almost no service levels with a number. Phase 2, the value case, names efficiency (or cost) as the primary pillar, anchors handle time and cost per call to the discovery baselines (7.5 minutes, $11.40), commits to all four service levels with a number and a measurement method, and picks the model by cost per answer, which code prices at a fraction of a cent against $11.40 a call today.",
  try: "Change PER_QUERY.calls in shared/d1-lumen.js to 15 (a multi-agent design) and run it again: the cost per answer in the table rises fifteen-fold, and Phase 2's model reasoning has to justify it against the same $11.40 baseline. Then remove the 10-second requirement from the discovery pack and see whether Phase 2's p95 latency target changes.",
  explain: "A board does not fund a model; it funds an outcome it can measure. The value pillars (efficiency, productivity, transformation, cost, performance SLAs) pull a design in different directions, so the architect names the primary one and expresses it as metrics with a measured baseline and a target. Performance becomes service levels a non-deterministic system can actually be held to: availability, p95 latency, answer accuracy on a test set, and time to escalate, each with a number and a way to measure it. Model choice then follows from cost per resolved answer and the latency target, not from which model is newest. The independent extractor makes the difference visible: the same audit, run on both documents, finds the commitments the value case makes and the capability pitch never does.",
  scene: {
    title: "Lumen's board paper: the same solution, sold two ways",
    caption: "Both phases read Grace's request, the discovery pack, the same design and the same model price table. The same extractor audits both documents for measurable commitments.",
    lanes: [
      { key: "p1", label: "Phase 1 · capability pitch", sub: "lead with the model", tone: "trap", on: /Phase 1/, stages: [
        { id: "a_in", icon: "📚", t: "Brief, discovery, design", s: "and the model price table" },
        { id: "a_write", icon: "🤖", t: "Write the board summary", s: "lead with what makes it advanced", claude: /^$/, diff: true },
        { id: "a_audit", icon: "🔍", t: "Extractor audit", s: "the same audit for both documents", claude: /audit/ },
        { id: "a_sla", icon: "📏", t: "Service levels with numbers", s: "availability, p95, accuracy, escalation" },
        { id: "a_out", icon: "🏛", t: "What the board can hold", s: "want: pillar, baselines, 4 SLAs", out: true } ] },
      { key: "p2", label: "Phase 2 · value case", sub: "pillar, metrics, SLAs, cost per answer", tone: "fix", on: /Phase 2/, stages: [
        { id: "b_in", icon: "📚", t: "Brief, discovery, design", s: "and the model price table" },
        { id: "b_write", icon: "🤖", t: "Write the value case", s: "primary pillar, baselines, SLAs, model", claude: /^$/, diff: true },
        { id: "b_cost", icon: "🧮", t: "Cost per answer in code", s: "price table × tokens per answer" },
        { id: "b_audit", icon: "🔍", t: "Extractor audit", s: "the same audit for both documents", claude: /audit/ },
        { id: "b_out", icon: "🏛", t: "What the board can hold", s: "want: pillar, baselines, 4 SLAs", out: true } ] },
    ],
  },
  slide: {
    title: "Tie the design to a value pillar and measurable SLAs",
    code: `value_case:
  primary_pillar: efficiency                          # KEY 1
  value_metrics:
    - {metric: handle time, baseline: 7.5 min,        # KEY 2
       target: 2 min, by: tablet session logs}
    - {metric: cost per call, baseline: 11.40, target: 3.00}
  service_levels:                                     # KEY 3
    - {name: availability, target: 99.5%, by: uptime probe}
    - {name: p95_latency,  target: 8 s,   by: request traces}
    - {name: accuracy,     target: 95%,   by: 300-question eval}
    - {name: escalation,   target: 2 min, by: queue timestamps}
  model: claude-haiku-5-5   # $0.0008 per answer      # KEY 4`,
    keys: [["1", "Name one primary pillar", "The pillars pull the design apart; pick the lead one."],
           ["2", "Baseline, target, method", "Today's number from discovery, and how it's measured."],
           ["3", "SLAs a model can keep", "Availability, p95 latency, accuracy, escalation time."],
           ["4", "Price per resolved answer", "Choose the model by cost and latency, not novelty."]],
  },
  async run(s, E) {
    s.log(`Lumen Retail · ${REQUEST}`, "note");
    s.log(`Price table (code): ${PRICES.map((p) => `${p.model.replace("Claude ", "")} ${usd4(costPerQuery(p))}/answer`).join(" · ")}; about ${QUERIES_PER_MONTH.toLocaleString("en-US")} product questions a month; today $11.40 per call.`, "note");

    s.log("== Phase 1 · capability pitch: the board summary leads with what makes the solution advanced", "note");
    s.show("a_in", "same brief, design, prices", "done");
    const pitch = await E.runAgent(s, {
      system: SYSTEM, max_tokens: 4096,
      prompt: `${BRIEF}\n\nWrite the half-page executive summary of this solution for Lumen's board. The board wants to see that Lumen is keeping up with AI, so lead with the technology: the Claude models, how retrieval over every product manual works, and what the system can do.`,
    });
    s.show("a_write", `${pitch.text.split(/\s+/).length} words`, "done");
    const a1 = await audit(s, E, "(audit: capability pitch)", pitch.text);
    s.log(`Audit of the pitch: primary pillar ${a1.primary_pillar} · ${a1.cs.length} commitments · ${a1.anchored.length} anchored to a discovery baseline · service levels with a number: ${a1.slaCount}/4 (${Object.entries(a1.slaMet).filter(([, c]) => c).map(([k]) => k).join(", ") || "none"})`, "note");
    s.show("a_audit", `${a1.cs.length} commitments · pillar: ${a1.primary_pillar}`, "done");
    s.show("a_sla", `${a1.slaCount}/4 with a number`, "done");
    const good1 = a1.primary_pillar !== "none" && a1.anchored.length >= 2 && a1.slaCount === 4;
    s.show("a_out", `${a1.anchored.length} anchored metrics · ${a1.slaCount}/4 SLAs`, good1 ? "good" : "bad");
    await s.pause({
      title: "Phase 1 finished: the capability pitch",
      outcome: `The audit found **${a1.slaCount} of 4 service levels** with a number and **${a1.anchored.length} value metric${a1.anchored.length === 1 ? "" : "s"}** anchored to a discovery baseline. Primary pillar: ${a1.primary_pillar}. The board would be buying a model, with little it could check afterwards.`,
      next: "Phase 2: the same solution written as a value case",
    });

    s.log("== Phase 2 · value case: primary pillar, metrics with baselines, four service levels, model priced per answer", "note");
    s.show("b_in", "same brief, design, prices", "done");
    const vc = await pass(s, E, {
      system: SYSTEM, schema: VALUE, max_tokens: 4096,
      prompt: `${BRIEF}\n\nWrite the value case for Grace's board paper. Name the primary value pillar (efficiency, productivity, transformation, cost or performance SLAs) and why. Give 2 to 4 value metrics, each with today's baseline from the discovery pack, a target and how it will be measured. Give the four service levels Lumen will hold the service to (availability, p95 latency, answer accuracy, escalation time), each with a numeric target and how it will be measured. Choose the model by cost per answer against today's $11.40 per call and the 10-second answer requirement.`,
    });
    const v = vc.data || {};
    const chosen = PRICES.find((p) => new RegExp(p.model.replace("Claude ", ""), "i").test(v.model || "")) || null;
    const perAnswer = chosen ? costPerQuery(chosen) : null;
    s.log(`Value case: pillar ${v.primary_pillar || "?"} · ${(v.value_metrics || []).length} value metrics · ${(v.service_levels || []).length} service levels · model ${v.model || "?"}`, "note");
    if (chosen) s.log(`Cost in code: ${chosen.model} at ${usd4(perAnswer)} per answer × ${QUERIES_PER_MONTH.toLocaleString("en-US")} answers ≈ ${money((perAnswer * QUERIES_PER_MONTH).toFixed(2))} a month in model spend, against $11.40 per call today.`, "note");
    s.show("b_write", `pillar: ${v.primary_pillar || "?"} · model: ${v.model || "?"}`, "done");
    s.show("b_cost", chosen ? `${usd4(perAnswer)}/answer · ${money((perAnswer * QUERIES_PER_MONTH).toFixed(0))}/month` : "model not in the table", "done");
    const a2 = await audit(s, E, "(audit: value case)", render(v));
    s.log(`Audit of the value case: primary pillar ${a2.primary_pillar} · ${a2.cs.length} commitments · ${a2.anchored.length} anchored to a discovery baseline · service levels with a number: ${a2.slaCount}/4, with a measurement method: ${a2.slaMeasured}/4`, "note");
    s.show("b_audit", `${a2.cs.length} commitments · pillar: ${a2.primary_pillar}`, "done");
    // The value case itself (structured JSON) is checked in code; the extractor audit compares the two documents.
    const vAnchored = (v.value_metrics || []).filter((m) => isFigure(m.baseline) && typeof m.target === "number" && m.target !== m.baseline);
    const vSla = ["availability", "p95_latency", "accuracy", "escalation"].filter((k) => (v.service_levels || []).some((x) => x.name === k && typeof x.target === "number" && String(x.measured_by || "").trim().length > 3));
    const good2 = PILLARS.includes(v.primary_pillar) && vAnchored.length >= 2 && vSla.length === 4;
    s.show("b_out", `${a2.anchored.length} anchored metrics · ${a2.slaCount}/4 SLAs`, good2 ? "good" : "bad");

    const slaCell = (a) => Object.entries(a.slaMet).map(([k, c]) => `${k} ${c ? `${c.target}` : "–"}`).join(", ");
    return {
      final: render(v) + (chosen ? `\n\nCost per answer (code): ${usd4(perAnswer)} with ${chosen.model}; about ${money((perAnswer * QUERIES_PER_MONTH).toFixed(2))} a month for ${QUERIES_PER_MONTH.toLocaleString("en-US")} answers.` : ""),
      compare: {
        cols: [
          { title: "Phase 1: capability pitch", short: "Capability pitch", tone: "trap", said: pitch.text,
            verdict: `Built around ${a1.primary_pillar === "none" ? "the technology" : a1.primary_pillar}: ${a1.slaCount}/4 service levels with a number, ${a1.anchored.length} metric${a1.anchored.length === 1 ? "" : "s"} anchored to a baseline. Nothing the board could hold the service to.` },
          { title: "Phase 2: value case", short: "Value case", tone: "fix", said: render(v),
            verdict: `Built around ${a2.primary_pillar}: ${a2.anchored.length} metrics anchored to discovery baselines, ${a2.slaCount}/4 service levels with targets (${a2.slaMeasured} with a measurement method), ${v.model || "?"} at ${perAnswer !== null ? usd4(perAnswer) : "?"} per answer.` },
        ],
        rows: [
          ["Primary value pillar (extractor)", { v: a1.primary_pillar, tone: a1.primary_pillar === "none" ? "bad" : "" }, { v: a2.primary_pillar, tone: a2.primary_pillar === "none" ? "bad" : "good" }],
          ["Measurable commitments found", String(a1.cs.length), String(a2.cs.length)],
          ["Value metrics with a discovery baseline", { v: a1.anchored.map((c) => `${c.metric} ${c.baseline}→${c.target}`).join("; ") || "none", tone: a1.anchored.length >= 2 ? "" : "bad" }, { v: a2.anchored.map((c) => `${c.metric} ${c.baseline}→${c.target}`).join("; ") || "none", tone: a2.anchored.length >= 2 ? "good" : "bad" }],
          ["Service levels with a number", { v: `${a1.slaCount}/4: ${slaCell(a1)}`, tone: a1.slaCount === 4 ? "" : "bad" }, { v: `${a2.slaCount}/4: ${slaCell(a2)}`, tone: a2.slaCount === 4 ? "good" : "bad" }],
          ["Model choice justified by", "what makes it advanced", `cost per answer (${perAnswer !== null ? usd4(perAnswer) : "?"}) and the latency target`],
        ],
        note: "Same solution, same discovery data, same price table, same audit. The value case gives the board numbers it can check after go-live; the capability pitch gives it adjectives.",
      },
      checks: [
        E.check("Phase 1 (capability pitch): the audit finds fewer than 4 service levels with a number and fewer than 2 metrics with a discovery baseline", a1.slaCount < 4 && a1.anchored.length < 2),
        E.check("Phase 2: the value case names a primary pillar and anchors at least 2 value metrics to discovery baselines", PILLARS.includes(v.primary_pillar) && vAnchored.length >= 2),
        E.check("Phase 2: all four service levels (availability, p95 latency, accuracy, escalation) have a numeric target and a measurement method", vSla.length === 4),
        E.check("The same audit finds more service-level commitments in the value case than in the capability pitch", a2.slaCount > a1.slaCount),
        E.check("Phase 2: the chosen model is in the price table and code priced it per answer below today's $11.40 per call", !!chosen && perAnswer < 11.4),
      ],
    };
  },
};
