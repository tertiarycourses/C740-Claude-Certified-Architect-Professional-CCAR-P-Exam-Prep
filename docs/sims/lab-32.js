// Lab 32 · Task 6.2 · Simulator 5 (Lumen Retail): communicate the decision, not just the pick.
// The architect chose Option A (Haiku 5.5 + retrieval). Two people must act on it: Grace Lim (COO) approves the
// budget, Hannah Koh (IT security) approves the data flow. Phase 1 writes a memo that sells the chosen option.
// Phase 2 writes a decision record (options with measured accuracy, latency and cost; risks and controls; data flow;
// the trigger that would reverse it) plus one brief per audience. Then each reader, a separate Claude call that
// sees only what was sent, answers the three questions that reader needs to act. Code counts the answers.
import { OPTIONS, DECISION } from "./shared/d6-lumen.js";

const ASK = "Write the communication of the assistant architecture decision for two readers: Grace Lim (COO), who approves the budget, and Hannah Koh (IT security lead), who approves the data flow.";
const chosen = OPTIONS.find((o) => o.key === DECISION.chosen);
const PICK = `DECISION: Option ${chosen.key}, ${chosen.name}.\nMeasured on Lumen's 400-question eval: ${chosen.accuracy_pct}% graded accuracy, p95 latency ${chosen.p95_s} s, about US$${chosen.monthly_usd.toLocaleString("en-US")} a month.`;
const RECORD = [
  `DECISION RECORD. Chosen: Option ${DECISION.chosen}.`,
  "Options measured on Lumen's 400-question eval, priced for 18,000 questions a day:",
  ...OPTIONS.map((o) => `- Option ${o.key}: ${o.name}. Accuracy ${o.accuracy_pct}%, p95 ${o.p95_s} s, about US$${o.monthly_usd.toLocaleString("en-US")} a month. ${o.note}`),
  "Store operations needs answers within 3 seconds.",
  `Data flow: ${DECISION.data_flow}`,
  "Risks:", ...DECISION.risks.map((r) => `- ${r}`),
  `Reversal: ${DECISION.reversal}`,
].join("\n");

const SCHEMA = {
  type: "object", additionalProperties: false,
  properties: {
    decision: { type: "string" },
    options: { type: "array", items: { type: "object", additionalProperties: false, properties: {
      key: { type: "string", enum: ["A", "B", "C"] }, accuracy_pct: { type: "number" }, p95_s: { type: "number" }, monthly_usd: { type: "number" },
      verdict: { type: "string", description: "Why chosen, or why not, in one sentence" } }, required: ["key", "accuracy_pct", "p95_s", "monthly_usd", "verdict"] } },
    risks: { type: "array", items: { type: "object", additionalProperties: false, properties: { risk: { type: "string" }, control: { type: "string" } }, required: ["risk", "control"] } },
    data_flow: { type: "string" },
    reversal_trigger: { type: "object", additionalProperties: false, properties: {
      metric: { type: "string" }, threshold: { type: "number" }, unit: { type: "string" }, then: { type: "string" } }, required: ["metric", "threshold", "unit", "then"] },
    briefs: { type: "object", additionalProperties: false, properties: {
      coo: { type: "string", description: "For Grace Lim: in money, staff time and service, under 120 words" },
      it_security: { type: "string", description: "For Hannah Koh: in data, access and controls, under 120 words" } }, required: ["coo", "it_security"] },
  },
  required: ["decision", "options", "risks", "data_flow", "reversal_trigger", "briefs"],
};

const READERS = {
  coo: { who: "Grace Lim, COO of Lumen Retail. You approve the budget", qs: [
    "Which other options were considered, and why were they not chosen?",
    "What will it cost per month, compared with the alternatives?",
    "What measured result would make the team reverse this decision?"] },
  it_security: { who: "Hannah Koh, IT security lead at Lumen Retail. You approve the data flow", qs: [
    "What data reaches the model, and is any customer data stored?",
    "What are the main risks, and which control covers each one?",
    "What measured result would make the team reverse this decision?"] },
};
const READER_SCHEMA = { type: "object", additionalProperties: false, properties: {
  answers: { type: "array", items: { type: "object", additionalProperties: false, properties: {
    q: { type: "integer" }, answerable: { type: "boolean" }, answer: { type: "string" } }, required: ["q", "answerable", "answer"] } },
  can_approve: { type: "boolean" } }, required: ["answers", "can_approve"] };

async function read(s, E, key, doc, tag) {
  const R = READERS[key];
  const r = await E.runAgent(s, {
    label: `(${tag} reader: ${key === "coo" ? "COO" : "IT security"})`,
    system: `You are ${R.who}. Using ONLY the document you are sent, answer each question in one sentence. Mark it answerable when the document states the answer, even briefly. If the document does not state it, set answerable to false and answer "not stated". Do not infer, assume or use outside knowledge. Then say whether the document gives you enough to approve.`,
    prompt: `DOCUMENT:\n${doc}\n\nQUESTIONS:\n${R.qs.map((q, i) => `${i + 1}. ${q}`).join("\n")}`,
    output_config: { format: { type: "json_schema", schema: READER_SCHEMA } }, max_tokens: 3000, maxTurns: 1,
  });
  let j = null; try { j = JSON.parse(r.text); } catch { /* counted as nothing answerable */ }
  const ok = (j?.answers || []).filter((a) => a.answerable).length;
  return { j, ok, approve: !!j?.can_approve };
}

export default {
  id: 32,
  see: "Phase 1's memo sells Option A, and its readers can answer only the questions about A itself: no alternatives, no data flow, no reversal trigger. Phase 2's decision record lists all three options with matching figures, risks with controls, the data flow and a numeric reversal trigger, and both readers can answer all six questions.",
  try: "Give Phase 2's IT security reader the COO brief instead of the IT security brief (swap the keys in read()) and count the answers: the same facts in the wrong units leave her unable to approve. Then delete the reversal line from RECORD and see which question fails for both readers.",
  explain: "Both phases answer the same request from the same architect. Phase 1 is built from the pick alone, so the memo can only praise it: the COO cannot see what was traded away, and IT security cannot see where the data goes. Phase 2 is built from the decision record: every option with its measured accuracy, p95 latency and monthly cost, the risks with their controls, the data flow, and the measured result that would reverse the decision. Each reader gets a brief in their own terms on top of the same record. The readers are separate Claude calls that see only the document, so the count of answerable questions measures whether each stakeholder can act.",
  scene: {
    title: "Lumen: Haiku 5.5 + retrieval is chosen. Can the COO and IT security act on it?",
    caption: "Same decision, same request, same two readers with the same questions. Only what the communication is built from differs.",
    lanes: [
      { key: "p1", label: "Phase 1 · sell the pick", sub: "memo built from the chosen option only", tone: "trap", on: /Phase 1/, stages: [
        { id: "a_in", icon: "✅", t: "The pick: Option A", s: "92.5% · 1.8 s · US$1,900 a month", diff: true },
        { id: "a_write", icon: "🤖", t: "Claude writes the memo", s: "one memo for both readers", claude: /^$/ },
        { id: "a_coo", icon: "💼", t: "COO reads it", s: "alternatives? cost? reversal?", claude: /COO/ },
        { id: "a_sec", icon: "🛡", t: "IT security reads it", s: "data? risks and controls? reversal?", claude: /IT security/ },
        { id: "a_out", icon: "📊", t: "Questions answerable", s: "want: 6 of 6, both can approve", out: true } ] },
      { key: "p2", label: "Phase 2 · decision record + briefs", sub: "options, numbers, risks, reversal, per audience", tone: "fix", on: /Phase 2/, stages: [
        { id: "b_in", icon: "📑", t: "The decision record", s: "3 options, risks, data flow, reversal", diff: true },
        { id: "b_write", icon: "🤖", t: "Claude writes record + briefs", s: "JSON record, one brief per reader", claude: /^$/ },
        { id: "b_coo", icon: "💼", t: "COO reads her brief", s: "alternatives? cost? reversal?", claude: /COO/ },
        { id: "b_sec", icon: "🛡", t: "IT security reads hers", s: "data? risks and controls? reversal?", claude: /IT security/ },
        { id: "b_out", icon: "📊", t: "Questions answerable", s: "want: 6 of 6, both can approve", out: true } ] },
    ],
  },
  slide: {
    title: "A decision record, then a brief per audience",
    code: `{"decision": "A: Haiku 5.5 + retrieval",
 "options": [                                   # KEY 1
   {"key": "A", "acc": 92.5, "p95_s": 1.8, "usd": 1900},
   {"key": "B", "acc": 95.0, "p95_s": 3.6, "usd": 9600},
   {"key": "C", "acc": 97.0, "p95_s": 360, "usd": 46000}],
 "risks": [{"risk": "7.5% wrong answers",        # KEY 2
            "control": "prices only from the API"}],
 "reversal_trigger": {                          # KEY 3
   "metric": "weekly graded accuracy",
   "threshold": 90, "unit": "%",
   "then": "switch to Option B"},
 "briefs": {"coo": "money, staff time ...",      # KEY 4
            "it_security": "data, controls ..."}}`,
    keys: [["1", "Every option, measured", "Accuracy, latency and cost for each one."],
           ["2", "Risks with their controls", "Name the failure and what contains it."],
           ["3", "A reversal trigger", "The measured result that changes the decision."],
           ["4", "One brief per audience", "Same facts, each reader's own units."]],
  },
  async run(s, E) {
    s.log(`Lumen Retail · ${ASK}`, "note");

    s.log("== Phase 1 · sell the pick: a memo built from the chosen option only", "note");
    s.show("a_in", "Option A and its numbers only", "done");
    const m1 = await E.runAgent(s, { system: "You write the architect's decision memos for Lumen Retail. Make a clear, persuasive case for the decision. Use only the facts you are given. Under 200 words.", prompt: `${ASK}\n\n${PICK}`, max_tokens: 1200, maxTurns: 1 });
    s.show("a_write", `memo, ${m1.text.split(/\s+/).length} words`, "done");
    const c1 = await read(s, E, "coo", m1.text, "Phase 1");
    s.show("a_coo", `${c1.ok}/3 answerable${c1.approve ? " · can approve" : ""}`, "done");
    const t1 = await read(s, E, "it_security", m1.text, "Phase 1");
    s.show("a_sec", `${t1.ok}/3 answerable${t1.approve ? " · can approve" : ""}`, "done");
    const n1 = c1.ok + t1.ok;
    s.show("a_out", `${n1}/6 answerable · approve: COO ${c1.approve ? "yes" : "no"}, IT sec ${t1.approve ? "yes" : "no"}`, n1 === 6 ? "good" : "bad");
    s.log(`Phase 1 result: the readers could answer ${n1} of 6 questions from the memo.`, "note");
    await s.pause({
      title: "Phase 1 finished: a memo that sells the pick",
      outcome: `The memo makes the case for Option A, but its readers could answer only **${n1} of 6** questions: the COO ${c1.ok}/3, IT security ${t1.ok}/3. Nothing tells them what was traded away, where the data goes, or what would reverse the decision.`,
      next: "Phase 2: the same request, built from the decision record, with one brief per audience",
    });

    s.log("== Phase 2 · decision record + a brief per audience: options, numbers, risks, data flow, reversal", "note");
    s.show("b_in", "3 options · data flow · 3 risks · reversal", "done");
    const m2 = await E.runAgent(s, {
      system: "You write the architect's decision records for Lumen Retail. Record every option considered with its measured accuracy, p95 latency and monthly cost, the risks with the control on each, the data flow, and the measured trigger that would reverse the decision. Then write one brief per reader in that reader's own terms: money, staff time and service for the COO; data, access and controls for IT security. Use only the facts you are given.",
      prompt: `${ASK}\n\n${RECORD}`, output_config: { format: { type: "json_schema", schema: SCHEMA } }, max_tokens: 3000, maxTurns: 1 });
    let rec = null; try { rec = JSON.parse(m2.text); } catch { /* checked below */ }
    const match = (o) => { const f = OPTIONS.find((x) => x.key === o.key); return f && o.accuracy_pct === f.accuracy_pct && o.p95_s === f.p95_s && o.monthly_usd === f.monthly_usd; };
    const optsOk = rec && rec.options?.length === 3 && rec.options.every(match);
    const trig = rec?.reversal_trigger;
    const thr = trig ? `${trig.threshold}${trig.unit === "%" ? "%" : " " + trig.unit}` : "";
    const table = rec ? (rec.options || []).map((o) => `- Option ${o.key}: accuracy ${o.accuracy_pct}%, p95 ${o.p95_s} s, US$${o.monthly_usd}/month. ${o.verdict}`).join("\n") : "";
    const shared = rec ? `DECISION: ${rec.decision}\nOPTIONS:\n${table}\nRISKS:\n${(rec.risks || []).map((r) => `- ${r.risk} Control: ${r.control}`).join("\n")}\nDATA FLOW: ${rec.data_flow}\nREVERSAL: if ${trig?.metric} crosses ${thr}, ${trig?.then}` : m2.text;
    s.show("b_write", optsOk ? `3 options match the evals · trigger at ${E.short(thr, 16)}` : "record incomplete", "done");
    const c2 = await read(s, E, "coo", `BRIEF FOR YOU:\n${rec?.briefs?.coo || ""}\n\nATTACHED DECISION RECORD:\n${shared}`, "Phase 2");
    s.show("b_coo", `${c2.ok}/3 answerable${c2.approve ? " · can approve" : ""}`, "done");
    const t2 = await read(s, E, "it_security", `BRIEF FOR YOU:\n${rec?.briefs?.it_security || ""}\n\nATTACHED DECISION RECORD:\n${shared}`, "Phase 2");
    s.show("b_sec", `${t2.ok}/3 answerable${t2.approve ? " · can approve" : ""}`, "done");
    const n2 = c2.ok + t2.ok;
    s.show("b_out", `${n2}/6 answerable · approve: COO ${c2.approve ? "yes" : "no"}, IT sec ${t2.approve ? "yes" : "no"}`, n2 === 6 ? "good" : "bad");

    const final = rec ? [`Decision: ${rec.decision}`, "", "Options:", table, "", `Reversal trigger: ${trig?.metric} at ${thr} → ${trig?.then}`, "",
      `Brief for the COO: ${rec.briefs?.coo}`, "", `Brief for IT security: ${rec.briefs?.it_security}`].join("\n") : m2.text;
    const ans = (r) => (r.j?.answers || []).map((a) => `${a.answerable ? "✓" : "✗"}`).join(" ");
    return {
      final,
      compare: {
        cols: [
          { title: "Phase 1: a memo that sells the pick", short: "Sell the pick", tone: "trap", said: m1.text,
            verdict: `Persuasive, but the readers could answer **${n1} of 6** questions. The COO cannot see the alternatives or what would reverse it; IT security cannot see where the data goes.` },
          { title: "Phase 2: decision record + a brief per audience", short: "Record + briefs", tone: "fix", said: m2.text,
            verdict: n2 === 6 && optsOk ? `All three options carry the measured figures, the reversal trigger is ${E.short(trig?.metric, 60)} at ${thr}, and **both readers answered all six questions** from their own brief and the record.`
              : `${n2}/6 answerable; options ${optsOk ? "match" : "do not match"} the evals. Read the live output: Claude writes each run fresh.` },
        ],
        rows: [
          ["Built from", "the chosen option only", { v: "the decision record: 3 options, risks, data flow, reversal", tone: "good" }],
          ["Options with measured accuracy, p95, cost", { v: "1 (the pick)", tone: "bad" }, { v: optsOk ? "3, matching the evals" : String(rec?.options?.length || 0), tone: optsOk ? "good" : "bad" }],
          ["COO: alternatives · cost · reversal", { v: `${ans(c1)} (${c1.ok}/3)`, tone: c1.ok === 3 ? "good" : "bad" }, { v: `${ans(c2)} (${c2.ok}/3)`, tone: c2.ok === 3 ? "good" : "bad" }],
          ["IT security: data · risks/controls · reversal", { v: `${ans(t1)} (${t1.ok}/3)`, tone: t1.ok === 3 ? "good" : "bad" }, { v: `${ans(t2)} (${t2.ok}/3)`, tone: t2.ok === 3 ? "good" : "bad" }],
          ["Reader says they can approve (COO, IT security)", `${c1.approve ? "yes" : "no"}, ${t1.approve ? "yes" : "no"}`, `${c2.approve ? "yes" : "no"}, ${t2.approve ? "yes" : "no"}`],
        ],
        note: "Same decision, same request, same readers asking the same questions. The only difference is what the communication was built from: the pick, or the decision with its alternatives, numbers, risks and reversal trigger.",
      },
      checks: [
        E.check("Phase 1: the readers could answer at most 3 of their 6 questions from the memo", n1 <= 3),
        E.check("Phase 2: the record lists all 3 options with accuracy, p95 and monthly cost matching the evals", optsOk),
        E.check("Phase 2: the reversal trigger names a metric and a numeric threshold", !!trig?.metric && Number.isFinite(trig?.threshold)),
        E.check("Phase 2: both readers could answer all 6 of their questions", n2 === 6),
      ],
    };
  },
};
