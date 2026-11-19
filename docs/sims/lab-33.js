// Lab 33 · Task 6.3 · Simulator 5 (Lumen Retail): SLOs from measurement, with an error budget and a feedback loop.
// Grace Lim wants the board pack to say "99.99% availability, and the answers are always correct". Phase 1 drafts the
// commitments she asked for. Phase 2 reads the six-week pilot's metrics first (get_pilot_metrics), sets each target
// where the pilot already meets it, splits operational SLOs from quality SLOs measured on a graded sample, and adds
// an error budget and a feedback cadence. Code then checks every commitment against what the pilot actually measured.
import { PILOT, SLI_UNITS, pilotTools, meets, budgetMinutes, wilson } from "./shared/d6-lumen.js";

const SLIS = Object.keys(SLI_UNITS);
const SCHEMA = {
  type: "object", additionalProperties: false,
  properties: {
    slos: { type: "array", items: { type: "object", additionalProperties: false, properties: {
      sli: { type: "string", enum: SLIS, description: "availability_pct and graded_accuracy_pct and critical_error_rate_pct in percent; latency and handover in seconds" },
      kind: { type: "string", enum: ["operational", "quality"] },
      comparator: { type: "string", enum: [">=", "<="] },
      target: { type: "number" },
      window: { type: "string" },
      method: { type: "string", description: "How it is measured" },
      sample_size: { type: "integer", description: "Graded answers per measurement for a quality SLO; 0 for an operational one" } },
      required: ["sli", "kind", "comparator", "target", "window", "method", "sample_size"] } },
    error_budget: { type: "object", additionalProperties: false, properties: {
      sli: { type: "string", enum: SLIS }, allowed: { type: "string" },
      when_spent: { type: "string", enum: ["freeze_changes_and_fix", "roll_back_last_change", "notify_only", "none"] } }, required: ["sli", "allowed", "when_spent"] },
    feedback: { type: "object", additionalProperties: false, properties: {
      cadence: { type: "string", enum: ["weekly", "fortnightly", "monthly", "quarterly", "none"] },
      forum: { type: "string" }, owner: { type: "string", description: "One named person and role" }, inputs: { type: "array", items: { type: "string" } } }, required: ["cadence", "forum", "owner", "inputs"] },
    sponsor_note: { type: "string", description: "What to tell the sponsor about her original ask, under 60 words" },
  },
  required: ["slos", "error_budget", "feedback", "sponsor_note"],
};
const FORMAT = { format: { type: "json_schema", schema: SCHEMA } };
const ASK = "Grace Lim (COO): \"For the board pack, say the assistant will be available 99.99% of the time and that its answers are always correct.\" Draft the service commitments for the board pack.";

const WHO = " People on the engagement: Grace Lim (COO, sponsor), Farid Rahman (store operations lead), Arun Pillai (lead of Lumen's AI team, which runs the assistant).";
const PROMISE = "You draft service commitments for Lumen Retail's board pack on the store product-support assistant. Write the commitments the sponsor asks for, as clear targets. Reply with the JSON only." + WHO;
const MEASURE = "You draft service commitments for Lumen Retail's board pack on the store product-support assistant. Before writing any commitment, read the pilot results with get_pilot_metrics. Set every target where the pilot already meets it, with some margin. Operational SLOs (availability, latency, escalation hand-over) are measured on every request; quality SLOs (graded accuracy, critical errors) are rates measured on a graded sample, so state the sample size. Define an error budget and what happens when it is spent, and a feedback cadence with an owner and the inputs reviewed (for example store feedback and the weekly graded sample). Put what the sponsor asked for and the pilot does not support in sponsor_note. Reply with the JSON only." + WHO;

function judge(j) {
  const slos = j?.slos || [];
  const rows = slos.map((x) => ({ ...x, ...meets(x) }));
  const breaches = rows.filter((r) => !r.met);
  const quality = rows.filter((r) => r.kind === "quality");
  const avail = rows.find((r) => r.sli === "availability_pct");
  return { rows, breaches, quality, avail, slis: new Set(rows.map((r) => r.sli)) };
}
const fmt = (r) => `${r.sli.replace(/_(pct|s)$/, "")} ${r.comparator} ${r.target}${SLI_UNITS[r.sli] === "%" ? "%" : " s"}`;

export default {
  id: 33,
  see: "Phase 1 writes the sponsor's wish into the board pack: 99.99% availability and near-perfect accuracy, which the pilot already misses (99.82%, 93.5% on 400 graded answers). Phase 2 reads the pilot first, sets every target the pilot meets, measures accuracy on a graded sample, and adds an error budget with a freeze rule and a monthly review with store operations.",
  try: "Change PILOT.availability_pct in shared/d6-lumen.js to 99.4 and run Phase 2 again: the availability target moves with the evidence. Then ask for a 99% accuracy target in the prompt and see where Phase 2 puts it (sponsor_note, with what it would take).",
  explain: "Both phases answer the same request from the sponsor. Phase 1 writes the targets she asked for without measuring anything, and code finds that the six-week pilot already misses them: a promise broken on the day it is made. Phase 2 reads the pilot metrics first. Availability, p95 latency and escalation hand-over are operational SLOs measured on every request; accuracy and critical errors are quality rates measured on a graded sample with its size stated, because 374 correct out of 400 is an estimate (Wilson 95% interval about 90.6% to 95.5%), not a guarantee. The error budget says what happens when it is spent, and the feedback cadence says who reviews what, how often. The sponsor's original ask goes back to her with the evidence.",
  scene: {
    title: "Lumen: the COO wants 99.99% and always correct. What can the board be promised?",
    caption: "Same request, same output schema. Only whether the commitments are set from the pilot's measurements differs.",
    lanes: [
      { key: "p1", label: "Phase 1 · promise the ask", sub: "targets written from the sponsor's wish", tone: "trap", on: /Phase 1/, stages: [
        { id: "a_ask", icon: "💼", t: "\"99.99% and always correct\"", s: "Grace Lim, for the board pack" },
        { id: "a_data", icon: "📈", t: "Pilot metrics", s: "not read", diff: true },
        { id: "a_claude", icon: "🤖", t: "Claude drafts SLAs", s: "targets, budget, feedback", claude: true },
        { id: "a_check", icon: "🔎", t: "Code checks vs the pilot", s: "is each target already met?" },
        { id: "a_out", icon: "📜", t: "Board-pack commitments", s: "want: every target met, budget, cadence", out: true } ] },
      { key: "p2", label: "Phase 2 · SLOs from the pilot", sub: "measure, then commit, with a budget", tone: "fix", on: /Phase 2/, stages: [
        { id: "b_ask", icon: "💼", t: "\"99.99% and always correct\"", s: "the same request" },
        { id: "b_data", icon: "📈", t: "get_pilot_metrics", s: "6 weeks, 20 stores, 400 graded answers", tools: ["get_pilot_metrics"], diff: true },
        { id: "b_claude", icon: "🤖", t: "Claude drafts SLOs", s: "operational + quality on a sample", claude: true },
        { id: "b_check", icon: "🔎", t: "Code checks vs the pilot", s: "is each target already met?" },
        { id: "b_out", icon: "📜", t: "Board-pack commitments", s: "want: every target met, budget, cadence", out: true } ] },
    ],
  },
  slide: {
    title: "Commit to what you measured, and budget the misses",
    code: `pilot = get_pilot_metrics()                     # KEY 1
# 99.82% · p95 2.4 s · 374/400 graded correct
slos = [
  {"sli": "availability_pct", "target": 99.5},
  {"sli": "p95_latency_s", "target": 3.0},
  {"sli": "graded_accuracy_pct", "kind": "quality", # KEY 2
   "target": 90, "sample_size": 400},
]
error_budget = {                                 # KEY 3
  "allowed": "126 min of store hours a month",
  "when_spent": "freeze_changes_and_fix"}
feedback = {"cadence": "monthly",                # KEY 4
            "owner": "Farid Rahman",
            "inputs": ["store feedback",
                       "weekly graded sample"]}`,
    keys: [["1", "Measure before you promise", "Targets come from the pilot, not the wish."],
           ["2", "Quality is a sampled rate", "State the sample; 374/400 is an estimate."],
           ["3", "An error budget with teeth", "When it is spent, changes stop until fixed."],
           ["4", "A feedback cadence", "Who reviews what, how often, with what data."]],
  },
  async run(s, E) {
    const [lo, hi] = wilson(PILOT.graded_correct, PILOT.graded_sample);
    s.log(`Lumen Retail · ${ASK}`, "note");
    s.log(`(The pilot measured availability ${PILOT.availability_pct}%, p95 ${PILOT.p95_latency_s} s, accuracy ${PILOT.graded_correct}/${PILOT.graded_sample} = ${PILOT.graded_accuracy_pct}% (Wilson 95% ${(lo * 100).toFixed(1)}–${(hi * 100).toFixed(1)}%), hand-over p90 ${PILOT.escalation_handover_s} s, critical errors ${PILOT.critical_error_rate_pct}%.)`, "note");

    s.log("== Phase 1 · promise the ask: commitments written from the sponsor's wish, pilot not read", "note");
    s.show("a_ask", "99.99% · always correct", "done");
    s.show("a_data", "not read", "done");
    const r1 = await E.runAgent(s, { system: PROMISE, prompt: ASK, output_config: FORMAT, max_tokens: 2500, maxTurns: 1 });
    let j1 = null; try { j1 = JSON.parse(r1.text); } catch { /* checked below */ }
    const p1 = judge(j1);
    for (const r of p1.rows) s.log(`  ${r.met ? "met   " : "BREACH"} ${fmt(r)} · pilot ${r.actual ?? "n/a"}`, r.met ? "result" : "error");
    s.show("a_check", `${p1.breaches.length} of ${p1.rows.length} already breached`, "done");
    s.show("a_out", p1.breaches.length ? `pilot misses: ${p1.breaches.map(fmt).slice(0, 2).join(", ")}` : "every target met", p1.breaches.length ? "bad" : "good");
    await s.pause({
      title: "Phase 1 finished: the sponsor's wish, written as commitments",
      outcome: p1.breaches.length
        ? `**The pilot already misses ${p1.breaches.length} of ${p1.rows.length} commitments** (${p1.breaches.map(fmt).join("; ")}). The board would be promised something the system broke before go-live.`
        : "This time the draft avoided a target the pilot misses, but nothing in it came from a measurement.",
      next: "Phase 2: the same request, with the pilot metrics read first, SLOs, an error budget and a feedback cadence",
    });

    s.log("== Phase 2 · SLOs from the pilot: read the metrics, set targets the pilot meets, error budget and feedback cadence", "note");
    s.show("b_ask", "99.99% · always correct", "done");
    const reads = [];
    const r2 = await E.runAgent(s, { system: MEASURE, prompt: ASK, tools: pilotTools(reads), output_config: FORMAT, max_tokens: 3000, maxTurns: 4 });
    let j2 = null; try { j2 = JSON.parse(r2.text); } catch { /* checked below */ }
    const p2 = judge(j2);
    for (const r of p2.rows) s.log(`  ${r.met ? "met   " : "BREACH"} ${fmt(r)} · pilot ${r.actual ?? "n/a"}${r.kind === "quality" ? ` · sample ${r.sample_size}` : ""}`, r.met ? "result" : "error");
    const readFirst = r2.calls.length > 0 && r2.calls[0].name === "get_pilot_metrics";
    s.show("b_data", readFirst ? "read before drafting" : "not read", "done");
    const eb = j2?.error_budget, fb = j2?.feedback;
    const ebMin = p2.avail ? budgetMinutes(p2.avail.target) : null;
    const qualOk = p2.quality.length > 0 && p2.quality.every((q) => q.sample_size >= 100);
    const ebOk = !!eb && ["freeze_changes_and_fix", "roll_back_last_change"].includes(eb.when_spent);
    const fbOk = !!fb && ["weekly", "fortnightly", "monthly"].includes(fb.cadence) && !!fb.owner?.trim();
    s.show("b_check", `${p2.breaches.length} of ${p2.rows.length} breached · ${p2.slis.size} SLIs`, "done");
    s.show("b_out", p2.breaches.length === 0 && ebOk && fbOk ? `all met · budget → ${eb.when_spent.replace(/_/g, " ")} · ${fb.cadence}` : `${p2.breaches.length} breached`, p2.breaches.length === 0 && qualOk && ebOk && fbOk ? "good" : "bad");

    const final = j2 ? ["Service commitments (Phase 2, set from the pilot):",
      ...p2.rows.map((r) => `- ${fmt(r)} (${r.kind}; ${r.window}; ${r.method}${r.kind === "quality" ? `; sample ${r.sample_size}` : ""}) · pilot ${r.actual}`),
      `Error budget: ${eb?.allowed} on ${eb?.sli}${ebMin !== null && eb?.sli === "availability_pct" ? ` (${ebMin} min of store hours a month at ${p2.avail.target}%)` : ""}; when spent: ${eb?.when_spent?.replace(/_/g, " ")}.`,
      `Feedback: ${fb?.cadence}, ${fb?.forum}, owner ${fb?.owner}; inputs: ${(fb?.inputs || []).join(", ")}.`,
      `To the sponsor: ${j2.sponsor_note}`].join("\n") : r2.text;
    const list = (p) => p.rows.map((r) => `${fmt(r)} ${r.met ? "✓" : "✗"}`).join(" · ") || "none";
    return {
      final,
      compare: {
        cols: [
          { title: "Phase 1: promise the sponsor's ask", short: "Promise the ask", tone: "trap", said: r1.text,
            verdict: p1.breaches.length ? `**${p1.breaches.length} of ${p1.rows.length} commitments are already broken by the pilot** (${p1.breaches.map(fmt).join("; ")}). No measurement stands behind any of them.` : "No target was breached this time, but none was set from a measurement." },
          { title: "Phase 2: SLOs from the pilot, error budget, feedback", short: "SLOs from the pilot", tone: "fix", said: r2.text,
            verdict: p2.breaches.length === 0 && qualOk && ebOk && fbOk
              ? `Every target is one the pilot meets; accuracy is a rate on a ${p2.quality[0]?.sample_size}-answer sample; when the budget is spent: ${eb.when_spent.replace(/_/g, " ")}; reviewed ${fb.cadence} by ${E.short(fb.owner, 40)}.`
              : `${p2.breaches.length} breached; sample ${qualOk ? "ok" : "missing"}; budget ${ebOk ? "ok" : "missing"}; cadence ${fbOk ? "ok" : "missing"}. Read the live output: Claude writes each run fresh.` },
        ],
        rows: [
          ["Pilot metrics read before drafting", { v: "no", tone: "bad" }, { v: readFirst ? "yes, first call" : "no", tone: readFirst ? "good" : "bad" }],
          ["Commitments (✓ pilot meets it, ✗ already breached)", list(p1), list(p2)],
          ["Breached on day one", { v: String(p1.breaches.length), tone: p1.breaches.length ? "bad" : "good" }, { v: String(p2.breaches.length), tone: p2.breaches.length ? "bad" : "good" }],
          ["Quality SLOs measured on a stated sample", (p1.quality.map((q) => q.sample_size).join(", ") || "none"), { v: p2.quality.map((q) => `${q.sli.replace(/_pct$/, "")}: ${q.sample_size}`).join(", ") || "none", tone: qualOk ? "good" : "bad" }],
          ["Error budget, when spent", j1?.error_budget?.when_spent?.replace(/_/g, " ") || "none", { v: eb?.when_spent?.replace(/_/g, " ") || "none", tone: ebOk ? "good" : "bad" }],
          ["Feedback cadence and owner", j1?.feedback ? `${j1.feedback.cadence}, ${E.short(j1.feedback.owner, 30)}` : "none", { v: fb ? `${fb.cadence}, ${E.short(fb.owner, 30)}` : "none", tone: fbOk ? "good" : "bad" }],
        ],
        note: "Same request, same schema. The only difference is whether the commitments were set from what the pilot measured, with the misses budgeted and a review loop behind them.",
      },
      checks: [
        E.check("Phase 1: the pilot already breaches at least one commitment written from the sponsor's ask", p1.breaches.length >= 1),
        E.check("Phase 2: get_pilot_metrics ran before any commitment was drafted, and the pilot meets every target (4+ SLIs)", readFirst && p2.rows.length > 0 && p2.breaches.length === 0 && p2.slis.size >= 4),
        E.check("Phase 2: every quality SLO is a rate on a stated graded sample of 100 or more", qualOk),
        E.check("Phase 2: the error budget freezes or rolls back changes when spent, and a weekly-to-monthly review has an owner", ebOk && fbOk),
      ],
    };
  },
};
