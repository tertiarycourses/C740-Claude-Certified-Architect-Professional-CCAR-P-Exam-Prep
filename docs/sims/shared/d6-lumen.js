// Simulator 5 · Lumen Retail engagement: the fixtures behind Labs 31–35 (Domain 6).
// You are the Claude solution architect engaged by Lumen Retail (300 stores) to deliver a product-support
// assistant. Everything here is simulated in plain JS: the stakeholders, the pilot metrics, the option
// measurements, the design notes and ten weeks of production metrics. Claude is real.
// Fictional company and people only.

export const PEOPLE = {
  sponsor: "Grace Lim, COO (sponsor)",
  store_ops: "Farid Rahman, store operations lead",
  it_security: "Hannah Koh, IT security lead",
  legal: "Ravi Menon, legal counsel",
  dev_team: "Arun Pillai, lead of Lumen's in-house AI team (receives the handoff)",
};

// ------------------------------------------------------------------ Lab 31 · discovery
export const CHECKLIST = ["users", "volumes", "data", "constraints", "risks", "success_measures", "slas"];

// The sponsor's one-line ask: the only input a design-first architect works from.
export const BRIEF = {
  id: "BRIEF-01", stakeholder: "sponsor", covers: ["users", "constraints"],
  says: "Grace Lim (COO), by email: \"We want an AI assistant in all 300 stores that answers product questions for staff and customers. Live by early March. Can you send me the solution design by Friday?\"",
};

// What each stakeholder says when interviewed. Every statement has a record id the requirements can cite.
// INT-06 (store operations) and INT-10 (legal) conflict: that is the finding discovery exists to surface.
export const INTERVIEWS = {
  sponsor: [
    { id: "INT-01", topic: "success_measures", says: "Success means store staff spend 30% less time on product questions within three months, and kiosk customer satisfaction stays at 4.2 out of 5 or better." },
    { id: "INT-02", topic: "constraints", says: "The running budget is US$12,000 a month. Go-live in the first week of March, before the spring range launches." },
  ],
  store_ops: [
    { id: "INT-03", topic: "users", says: "2,400 store staff on store tablets, plus customers at self-service kiosks in the 40 flagship stores." },
    { id: "INT-04", topic: "volumes", says: "About 18,000 questions a day across 300 stores. Saturday peak is about 2,500 an hour." },
    { id: "INT-05", topic: "slas", says: "Staff won't wait: an answer within 3 seconds, available in store hours 08:00-22:00, and a hand-off to a human product specialist within 2 minutes when the assistant can't answer." },
    { id: "INT-06", topic: "data", says: "We want every chat transcript kept for 90 days so supervisors can review answers for quality." },
  ],
  it_security: [
    { id: "INT-07", topic: "data", says: "It may use the product catalogue, stock levels and the returns policy, read-only through the existing product API. No access to customer accounts or payment data." },
    { id: "INT-08", topic: "constraints", says: "Single sign-on on staff tablets, all traffic through our API gateway, and no new vendor may hold customer personal data." },
    { id: "INT-09", topic: "risks", says: "Prompt injection from kiosk users, and the assistant quoting a wrong price or promising stock we don't have." },
  ],
  legal: [
    { id: "INT-10", topic: "constraints", says: "Chat transcripts that contain customer details must not be stored after the session ends. Our privacy notice promises customers that." },
    { id: "INT-11", topic: "risks", says: "Any price or warranty statement must come from the catalogue, never be invented: a wrong price quoted at a kiosk can be binding." },
  ],
};
export const RECORDS = Object.fromEntries([[BRIEF.id, { ...BRIEF }],
  ...Object.entries(INTERVIEWS).flatMap(([who, xs]) => xs.map((r) => [r.id, { ...r, stakeholder: who, covers: [r.topic] }]))]);
// INT-06 is about data handling but also sets a risk for legal; let it back either item.
RECORDS["INT-06"].covers = ["data", "risks"];
RECORDS["INT-10"].covers = ["constraints", "data"];
export const CONFLICT_PAIR = ["INT-06", "INT-10"];

// The ask_stakeholder tool: an interview returns everything that stakeholder owns, with record ids.
export function stakeholderTools(log) {
  return {
    ask_stakeholder: {
      description: "Interview one Lumen stakeholder group. Returns what they said, as records with ids (INT-nn) you can cite. Groups: sponsor (COO), store_ops, it_security, legal.",
      input_schema: { type: "object", additionalProperties: false, properties: {
        stakeholder: { type: "string", enum: ["sponsor", "store_ops", "it_security", "legal"] },
        question: { type: "string", description: "What you want to learn from them" } }, required: ["stakeholder", "question"] },
      run: ({ stakeholder }) => {
        const xs = INTERVIEWS[stakeholder];
        if (!xs) return { isError: true, message: `No stakeholder group called ${stakeholder}` };
        log.push(stakeholder);
        return { stakeholder: PEOPLE[stakeholder], records: xs.map(({ id, topic, says }) => ({ id, topic, says })) };
      },
    },
  };
}

// Is a checklist item backed by a record that really covers it?
export const backed = (req) => (req.evidence || []).some((id) => RECORDS[id]?.covers.includes(req.item));

// ------------------------------------------------------------------ Lab 32 · decisions and trade-offs
// Measured on Lumen's 400-question evaluation set (graded by store product specialists) and priced
// for 18,000 questions a day: about 6,000 input and 300 output tokens per question.
export const OPTIONS = [
  { key: "A", name: "Claude Haiku 5.5 + retrieval over the product catalogue", accuracy_pct: 92.5, p95_s: 1.8, monthly_usd: 1900,
    note: "Model cost about US$405 a month at Haiku 5.5 list prices (US$0.10 / US$0.50 per million tokens), plus about US$1,500 hosting and retrieval." },
  { key: "B", name: "Claude Sonnet 5.5 + retrieval over the product catalogue", accuracy_pct: 95.0, p95_s: 3.6, monthly_usd: 9600,
    note: "Model cost about US$8,100 a month at Sonnet 5.5 list prices (US$2 / US$10 per million tokens), plus the same US$1,500. p95 is above store operations' 3-second need." },
  { key: "C", name: "No model: expand the human product hotline", accuracy_pct: 97.0, p95_s: 360, monthly_usd: 46000,
    note: "12 more product specialists. Staff wait 6 minutes at p95 on a Saturday." },
];
export const DECISION = {
  chosen: "A",
  data_flow: "Only the product catalogue, stock levels and returns policy are retrieved, read-only through the product API. Customer messages pass through Lumen's API gateway to the Claude API and are not stored by Lumen after the session. No customer account or payment data reaches the model.",
  risks: [
    "7.5% of graded answers were wrong or incomplete: answers must cite the catalogue entry, and prices come only from the catalogue API, never from the model's own text.",
    "Prompt injection from kiosk users: the assistant has read-only tools, so an injected instruction cannot change data.",
    "The spring range adds about 1,850 new products: the catalogue index must be rebuilt before launch day.",
  ],
  reversal: "If graded accuracy on the weekly 100-answer sample falls below 90% for two weeks running, switch to Option B (Sonnet 5.5) behind the same interface: a configuration change, about US$7,700 a month more.",
};

// ------------------------------------------------------------------ Lab 33 · SLAs, SLOs, error budgets
// Six-week pilot in 20 stores, 08:00-22:00.
export const PILOT = {
  stores: 20, weeks: 6, requests: 61400,
  availability_pct: 99.82, p95_latency_s: 2.4, p50_latency_s: 1.1,
  graded_accuracy_pct: 93.5, graded_sample: 400, graded_correct: 374,
  escalation_handover_s: 95,  // p90 time from "I can't answer" to a human product specialist picking it up
  critical_error_rate_pct: 0.5, // wrong price or stock promise, 2 of the 400 graded answers
};
export const SLI_UNITS = { availability_pct: "%", p95_latency_s: "s", graded_accuracy_pct: "%", escalation_handover_s: "s", critical_error_rate_pct: "%" };
export function wilson(k, n, z = 1.96) {
  const p = k / n, d = 1 + z * z / n, c = p + z * z / (2 * n), r = z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n));
  return [(c - r) / d, (c + r) / d];
}
export function pilotTools(log) {
  return {
    get_pilot_metrics: {
      description: "Read the measured results of Lumen's six-week pilot (20 stores) from the metrics store: availability, latency, graded accuracy on a labelled sample, escalation hand-over time, critical-error rate.",
      input_schema: { type: "object", additionalProperties: false, properties: {} },
      run: () => { log.push("get_pilot_metrics"); const [lo, hi] = wilson(PILOT.graded_correct, PILOT.graded_sample);
        return { ...PILOT, graded_accuracy_wilson95_pct: [+(lo * 100).toFixed(1), +(hi * 100).toFixed(1)], store_hours: "08:00-22:00" }; },
    },
  };
}
// Does the pilot already meet a commitment?
export function meets(slo) {
  const actual = PILOT[slo.sli];
  if (actual === undefined) return { actual: null, met: false };
  return { actual, met: slo.comparator === ">=" ? actual >= slo.target : actual <= slo.target };
}
// Downtime allowed by an availability target, per 30 days of 14-hour store days.
export const budgetMinutes = (targetPct) => Math.round((100 - targetPct) / 100 * 30 * 14 * 60);

// ------------------------------------------------------------------ Lab 34 · documentation and handoff
export const DESIGN_NOTES = `Lumen product-support assistant: architect's working notes (final week of the engagement)

- Chosen: Claude Haiku 5.5 (model ID claude-haiku-5-5, pinned in config/assistant.yaml) with retrieval over the product catalogue. Measured 92.5% graded accuracy on the 400-question eval, p95 1.8 s, about US$1,900 a month.
- Rejected: Sonnet 5.5 (95.0%, but p95 3.6 s breaks the 3-second need and costs about US$9,600 a month); a bigger human hotline (US$46,000 a month, 6-minute waits); fine-tuning (no labelled data at that scale, and the catalogue changes each season).
- Status: accepted by Grace Lim (COO) and Hannah Koh (IT security) on 12 February.
- Interface: POST /assist with {store_id, session_id, question}. Returns {answer, sources[], escalate}. When escalate is true the tablet opens a Store Help ticket for a human product specialist.
- Prices and stock come only from the product API (read-only), never from the model's own text. Customer messages are not stored after the session (legal, INT-10). QA uses a weekly sample of 100 answers with customer details removed.
- Catalogue index: rebuilt nightly at 02:00 by the data platform job catalogue-indexer.
- Evals: 400 graded questions in evals/golden.jsonl. Any prompt, model or retrieval change must score at least 92% before release.
- Monitoring: escalation rate (baseline 8%) and weekly graded accuracy on the dashboard "Assistant health".
- Runbook, escalation rate above 12% for two days: first check the catalogue index is fresh (last catalogue-indexer run); if it is stale, re-run the job; then re-run the eval suite; if accuracy is below 92%, roll back to the previous prompt version.
- Owners: prompt and eval suite, Arun Pillai (Lumen AI team); catalogue index, Mei Tan (data platform); on-call, Store Systems team; the decision itself, Grace Lim.
- Revisit trigger: weekly graded accuracy below 90% for two weeks: switch to Sonnet 5.5 behind the same interface.
`;
// What a Lumen developer who joins next month must be able to find in the handoff document.
export const HANDOFF_QUESTIONS = [
  { q: 1, text: "Which exact model ID does the assistant use, and in which file is it pinned?", key: /claude-haiku-5-5/i },
  { q: 2, text: "What are the request and response fields of the assistant's API?", key: /store_id[\s\S]*escalate|escalate[\s\S]*store_id/i },
  { q: 3, text: "The dashboard confirms the escalation rate has been above 12% for two days. According to the runbook, what is the first thing to check?", key: /index/i },
  { q: 4, text: "Who owns the prompt and the eval suite?", key: /Arun/i },
  { q: 5, text: "Which alternatives were rejected, and why?", key: /sonnet/i },
];

// ------------------------------------------------------------------ Lab 35 · lifecycle after go-live
export const BASELINE = { escalation_rate_pct: 8.0, graded_accuracy_pct: 93.5, p95_latency_s: 2.4, cost_per_day_usd: 63 };
// Ten weeks after go-live on 1 March. The spring range (1,850 new products) lands in week 5; the index
// keeps up, but the new products' questions are harder and escalations drift up from week 5.
// Lumen's team takes over at the handoff in week 6. Store managers complain to the COO in week 8.
export const WEEKS = [
  { week: 1, escalation_rate_pct: 7.9, graded_accuracy_pct: 93, p95_latency_s: 2.3, cost_per_day_usd: 62 },
  { week: 2, escalation_rate_pct: 8.1, graded_accuracy_pct: 94, p95_latency_s: 2.4, cost_per_day_usd: 63 },
  { week: 3, escalation_rate_pct: 8.0, graded_accuracy_pct: 92, p95_latency_s: 2.4, cost_per_day_usd: 63 },
  { week: 4, escalation_rate_pct: 8.4, graded_accuracy_pct: 93, p95_latency_s: 2.5, cost_per_day_usd: 64 },
  { week: 5, escalation_rate_pct: 9.6, graded_accuracy_pct: 90, p95_latency_s: 2.4, cost_per_day_usd: 66, catalogue_change_event: "Spring range: 1,850 new products" },
  { week: 6, escalation_rate_pct: 12.9, graded_accuracy_pct: 86, p95_latency_s: 2.5, cost_per_day_usd: 68 },
  { week: 7, escalation_rate_pct: 14.7, graded_accuracy_pct: 84, p95_latency_s: 2.6, cost_per_day_usd: 69 },
  { week: 8, escalation_rate_pct: 15.3, graded_accuracy_pct: 83, p95_latency_s: 2.6, cost_per_day_usd: 70, complaint: "Store managers escalate to the COO: 'the assistant can't answer anything about the spring range'" },
  { week: 9, escalation_rate_pct: 15.1, graded_accuracy_pct: 84, p95_latency_s: 2.6, cost_per_day_usd: 70 },
  { week: 10, escalation_rate_pct: 15.6, graded_accuracy_pct: 83, p95_latency_s: 2.6, cost_per_day_usd: 71 },
];
export const DRIFT_STARTS = 5;
export const SIGNALS = ["escalation_rate_pct", "graded_accuracy_pct", "p95_latency_s", "cost_per_day_usd", "catalogue_change_event"];

// Replay the ten weeks against a plan's monitors. Returns each monitor's first firing week.
export function replay(monitors) {
  return (monitors || []).map((m) => {
    let run = 0, fired = null;
    for (const w of WEEKS) {
      let hit;
      if (m.signal === "catalogue_change_event") hit = !!w.catalogue_change_event;
      else { const v = w[m.signal]; hit = v !== undefined && (m.comparator === "below" ? v < m.threshold : v > m.threshold); }
      run = hit ? run + 1 : 0;
      if (run >= Math.max(1, m.consecutive_weeks || 1)) { fired = w.week; break; }
    }
    return { ...m, fired };
  });
}
export const routesToEval = (action) => action === "rerun_eval_suite_and_iterate";
