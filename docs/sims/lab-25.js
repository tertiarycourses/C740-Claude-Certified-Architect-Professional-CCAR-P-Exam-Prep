// Lab 25 · Task 4.6 · Simulator 6 (Kestrel Platform Team): free-text logs vs structured per-call records.
// The checkout-assistant feature had a bad hour: prompt v14 shipped at 10:20, answers got cut off and spend rose 2.4x.
// The same 48 calls are seen two ways. Phase 1: the free-text lines the feature prints today; an alert rule on
// stop_reason cannot even be evaluated, and Claude diagnoses from the lines. Phase 2: one structured record per call
// (trace_id, model, prompt_version, tokens, cache reads, latency_ms, stop_reason, tool calls) in the observability store;
// two alert rules fire in code, and Claude diagnoses from the records with trace ids as evidence.
import { ask } from "./shared/d4-kit.js";
import { traffic, freeTextLog, evalRule, byVersion } from "./shared/d4-kestrel.js";

const WINDOW = "2026-11-19T10:30:00Z";          // the rules look at the last 30 minutes (10:30-11:00)
const RULES = [
  { name: "truncation", field: "stop_reason", value: "max_tokens", threshold: 0.05, says: "stop_reason = max_tokens on more than 5% of calls" },
  { name: "cache miss", field: "cache_read_input_tokens", value: 0, threshold: 0.5, says: "cache_read_input_tokens = 0 on more than 50% of calls" },
];
const DIAG_SCHEMA = { type: "object", additionalProperties: false, required: ["root_causes", "confidence", "missing_data"], properties: {
  root_causes: { type: "array", items: { type: "object", additionalProperties: false, required: ["cause", "evidence_trace_ids"], properties: {
    cause: { type: "string" }, evidence_trace_ids: { type: "array", items: { type: "string" } } } } },
  confidence: { type: "string", enum: ["low", "medium", "high"] }, missing_data: { type: "array", items: { type: "string" } } } };
const SYSTEM = "You are on call for Kestrel's checkout-assistant, a Claude-powered feature. Customers report cut-off answers and Claude spend is up. " +
  "From the telemetry given, list the root causes you can support with evidence, citing the trace_id of calls that show each cause (only ids that appear in the data). " +
  "Say what data you are missing.";

const textOfCauses = (d) => (d?.root_causes || []).map((c) => c.cause).join(" ");

export default {
  id: 25,
  see: "Phase 1: from about 70 free-text lines the truncation rule cannot be evaluated (there is no stop_reason field), and Claude can only guess, with low or medium confidence, no trace ids and a list of missing data. Phase 2: from 48 structured records both alert rules fire (max_tokens stops and zero cache reads since 10:30), and Claude names prompt v14 as the change behind both: outputs hitting the 1,024-token cap and a system prompt that no longer hits the cache, citing real trace ids.",
  try: "In docs/sims/shared/d4-kestrel.js, change traffic() so v14 keeps cache_read_input_tokens at 3200: the cache-miss rule stops firing and Claude's diagnosis drops that cause. Then add a field such as squad or customer_tier to each record and ask a sharper question: which squad's calls are truncated?",
  explain: "Free-text lines answer \"did something happen?\" but not \"why?\": they carry no trace_id, no prompt version, no token counts and no stop_reason, so no alert rule can be written on them and any diagnosis is a guess. One structured record per Claude call, with the fields the API already returns (model, input and output tokens, cache_read_input_tokens, stop_reason, tool calls) plus your own (trace_id, prompt_version, latency_ms), turns monitoring into queries. Here two simple rules fire on their own, a group-by on prompt_version points at the 10:20 deploy, and Claude's diagnosis can cite trace ids an engineer can open. The incident is the same in both phases; only what was logged changed.",
  scene: {
    title: "Checkout-assistant, 10:00-11:00: answers cut off and spend up 2.4x. Why?",
    caption: "The same 48 Claude calls in both phases. Only what the service logged about each call differs.",
    lanes: [
      { key: "p1", label: "Phase 1 · free-text logs", sub: "the lines the feature prints today", tone: "trap", on: /Phase 1/, stages: [
        { id: "a_calls", icon: "🛒", t: "48 Claude calls", s: "prompt v13, then v14 from 10:20" },
        { id: "a_log", icon: "📜", t: "Free-text log lines", s: "\"answered in 2.4s\", \"slow response\"", diff: true },
        { id: "a_rule", icon: "🚨", t: "Alert rules", s: "max_tokens rate, cache-miss rate" },
        { id: "a_diag", icon: "🩺", t: "Claude diagnoses", s: "from the log lines", claude: true },
        { id: "a_out", icon: "🎯", t: "Root cause", s: "want: v14 caused truncation and cache misses", out: true } ] },
      { key: "p2", label: "Phase 2 · structured per-call records", sub: "trace_id, version, tokens, stop_reason", tone: "fix", on: /Phase 2/, stages: [
        { id: "b_calls", icon: "🛒", t: "The same 48 calls", s: "prompt v13, then v14 from 10:20" },
        { id: "b_rec", icon: "🗃", t: "One record per call", s: "trace_id, prompt_version, usage, stop", diff: true },
        { id: "b_rule", icon: "🚨", t: "Alert rules", s: "max_tokens rate, cache-miss rate" },
        { id: "b_diag", icon: "🩺", t: "Claude diagnoses", s: "from records + a group-by on version", claude: true },
        { id: "b_out", icon: "🎯", t: "Root cause", s: "want: v14 caused truncation and cache misses", out: true } ] },
    ],
  },
  slide: {
    title: "Log every Claude call as a record, then alert on it",
    code: `t0 = time.monotonic()
resp = client.messages.create(**request)
log.info("claude_call", extra={                 # KEY 1
  "trace_id": ctx.trace_id, "prompt_version": "v14",
  "model": resp.model,
  "input_tokens": resp.usage.input_tokens,      # KEY 2
  "cache_read_input_tokens": resp.usage.cache_read_input_tokens,
  "output_tokens": resp.usage.output_tokens,
  "stop_reason": resp.stop_reason,
  "tool_calls": count_tool_use(resp.content),
  "latency_ms": int((time.monotonic() - t0) * 1000)})
# alert: stop_reason == "max_tokens" > 5% over 30 min  # KEY 3
# dashboard: group by prompt_version, p95 latency_ms  # KEY 4`,
    keys: [["1", "One record per call", "Structured fields, not a sentence in a log line."],
           ["2", "Use what the API returns", "usage, stop_reason and model come back on every call."],
           ["3", "Alert on the fields", "Truncation and cache-miss rates as simple rules."],
           ["4", "Slice by version", "A group-by on prompt_version finds the bad deploy."]],
  },
  async run(s, E) {
    const recs = traffic();
    const ids = new Set(recs.map((r) => r.trace_id));
    s.log(`Kestrel · checkout-assistant · ${recs.length} Claude calls between 10:00 and 11:00 · customers report cut-off answers; billing says spend is up`, "note");

    // Phase 1: what the service prints today.
    s.log("== Phase 1 · free-text logs: the lines the checkout-assistant prints today", "note");
    const lines = freeTextLog(recs);
    s.show("a_calls", `${recs.length} calls`, "done");
    s.show("a_log", `${lines.length} lines of text`, "done");
    for (const ln of lines.slice(18, 26)) s.log(`  ${ln}`, "result");
    s.log(`  … ${lines.length} lines in all`, "result");
    const parsed = lines.map((ln) => { const m = ln.match(/^(\d\d:\d\d:\d\d)\s+(\w+)\s+(.*)$/); return m ? { ts: `2026-11-19T${m[1]}Z`, level: m[2], msg: m[3] } : null; }).filter(Boolean);
    const r1 = RULES.map((r) => ({ ...r, ...evalRule(parsed, { ...r, fromTs: WINDOW }) }));
    for (const r of r1) s.log(`  rule "${r.name}" (${r.says}): ${r.evaluable ? (r.fired ? "FIRED" : "quiet") : "CANNOT EVALUATE: no such field in the logs"}`, r.evaluable ? "result" : "error");
    s.show("a_rule", r1.every((r) => !r.evaluable) ? "cannot evaluate: no fields" : r1.map((r) => `${r.name}: ${r.fired ? "fired" : "quiet"}`).join(" · "), "done");
    const d1 = await ask(s, E, { label: "Diagnosis from logs", system: SYSTEM, max_tokens: 3000, quiet: true,
      prompt: `Application log, 10:00-11:00:\n${lines.join("\n")}`,
      output_config: { format: { type: "json_schema", schema: DIAG_SCHEMA } } });
    const j1 = d1.json || {};
    const cited1 = (j1.root_causes || []).flatMap((c) => c.evidence_trace_ids || []);
    const real1 = cited1.filter((x) => ids.has(x));
    for (const c of j1.root_causes || []) s.log(`  cause: ${c.cause} · evidence: ${(c.evidence_trace_ids || []).join(", ") || "none"}`, "reply");
    s.log(`  confidence: ${j1.confidence || "?"} · missing: ${(j1.missing_data || []).join("; ")}`, "reply");
    s.show("a_diag", `confidence ${j1.confidence || "?"} · ${real1.length} trace ids`, "done");
    const named1 = /v14/i.test(textOfCauses(j1));
    s.show("a_out", named1 ? "named v14 (no trace evidence)" : "a guess: no version, no trace ids", "bad");
    await s.pause({
      title: "Phase 1 finished: a diagnosis from free text",
      outcome: `Neither alert rule could run: the lines have no stop_reason or cache field. Claude's diagnosis: **confidence ${j1.confidence || "?"}**, **${real1.length} verifiable trace ids**, and it lists what is missing: ${(j1.missing_data || []).slice(0, 3).join("; ") || "-"}.`,
      next: "Phase 2: the same calls as structured records",
    });

    // Phase 2: the same calls as structured records in the observability store.
    s.log("== Phase 2 · structured per-call records in the observability store: the same 48 calls", "note");
    s.show("b_calls", `${recs.length} calls`, "done");
    for (const r of [recs[10], recs[30]]) s.log(`  ${JSON.stringify(r)}`, "result");
    s.show("b_rec", `${recs.length} records · 11 fields each`, "done");
    const r2 = RULES.map((r) => ({ ...r, ...evalRule(recs, { ...r, fromTs: WINDOW }) }));
    for (const r of r2) s.log(`  rule "${r.name}" (${r.says}): ${r.fired ? "FIRED" : "quiet"} · ${r.hit} of ${r.n} calls since 10:30 (${Math.round(r.rate * 100)}%)`, r.fired ? "error" : "result");
    s.show("b_rule", r2.map((r) => `${r.name} ${r.fired ? "FIRED" : "quiet"} (${Math.round(r.rate * 100)}%)`).join(" · "), "done");
    const agg = byVersion(recs);
    for (const [v, a] of Object.entries(agg)) s.log(`  ${v}: ${a.calls} calls from ${a.first_ts.slice(11, 16)} · avg output ${a.avg_output_tokens} · max_tokens stops ${a.max_tokens_stops} · avg cache reads ${a.avg_cache_read_input_tokens} · avg input ${a.avg_input_tokens} · p95 ${a.p95_latency_ms} ms`, "result");
    const d2 = await ask(s, E, { label: "Diagnosis from records", system: SYSTEM, max_tokens: 3000, quiet: true,
      prompt: `Alert rules, evaluated on the window 10:30-11:00 only (the records below cover 10:00-11:00):\n${r2.map((r) => `- ${r.name}: ${r.says}: ${r.fired ? "FIRED" : "quiet"} (${r.hit}/${r.n})`).join("\n")}\n\n` +
        `Per prompt_version:\n${JSON.stringify(agg, null, 1)}\n\nOne record per Claude call:\n${recs.map((r) => JSON.stringify(r)).join("\n")}`,
      output_config: { format: { type: "json_schema", schema: DIAG_SCHEMA } } });
    const j2 = d2.json || {};
    const cited2 = (j2.root_causes || []).flatMap((c) => c.evidence_trace_ids || []);
    const real2 = [...new Set(cited2.filter((x) => ids.has(x)))];
    for (const c of j2.root_causes || []) s.log(`  cause: ${c.cause} · evidence: ${(c.evidence_trace_ids || []).join(", ") || "none"}`, "reply");
    s.log(`  confidence: ${j2.confidence || "?"} · cited ${real2.length} real trace ids · missing: ${(j2.missing_data || []).join("; ") || "none"}`, "reply");
    const t2 = textOfCauses(j2);
    const namesTrunc = /v14/i.test(t2) && /(max_tokens|1,?024|truncat|cut off|cap)/i.test(t2);
    const namesCache = /cache/i.test(t2);
    s.show("b_diag", `confidence ${j2.confidence || "?"} · ${real2.length} trace ids`, "done");
    s.show("b_out", namesTrunc && namesCache ? "v14: max_tokens cap + cache misses" : namesTrunc ? "v14: max_tokens cap" : "read the diagnosis", namesTrunc && namesCache ? "good" : "bad");

    const causes = (j) => (j.root_causes || []).map((c) => E.short(c.cause, 110)).join(" · ") || "none";
    return {
      final: (j2.root_causes || []).map((c, i) => `${i + 1}. ${c.cause} (evidence: ${(c.evidence_trace_ids || []).slice(0, 4).join(", ")})`).join("\n") + `\nConfidence: ${j2.confidence || "?"}.`,
      compare: {
        cols: [
          { title: "Phase 1: free-text log lines", short: "Free text", tone: "trap",
            verdict: `No rule could run. Diagnosis at **${j1.confidence || "?"}** confidence with **${real1.length} verifiable trace ids**: a guess an engineer cannot check.` },
          { title: "Phase 2: one structured record per call", short: "Records", tone: "fix",
            verdict: `Both rules **fired** on their own. Diagnosis at **${j2.confidence || "?"}** confidence names ${namesTrunc ? "**v14's max_tokens truncation**" : "the change"}${namesCache ? " and **the lost cache hits**" : ""}, with **${real2.length} real trace ids**.` },
        ],
        rows: [
          ["Fields per call", "time, a sentence", "trace_id, model, prompt_version, input/output tokens, cache reads, latency_ms, stop_reason, tool_calls"],
          ...RULES.map((r, i) => [`Rule: ${r.says}`, { v: r1[i].evaluable ? (r1[i].fired ? "fired" : "quiet") : "cannot evaluate", tone: "bad" }, { v: r2[i].fired ? `fired (${Math.round(r2[i].rate * 100)}%)` : "quiet", tone: r2[i].fired ? "good" : "bad" }]),
          ["Root causes found", causes(j1), causes(j2)],
          ["Trace ids cited that exist", { v: String(real1.length), tone: real1.length ? "good" : "bad" }, { v: String(real2.length), tone: real2.length >= 2 ? "good" : "bad" }],
          ["Confidence", j1.confidence || "?", j2.confidence || "?"],
        ],
        note: "The same 48 calls and the same incident. The free-text log was not wrong, it just did not record the fields that explain an LLM failure: stop_reason, token usage, cache reads and the prompt version.",
      },
      checks: [
        E.check("Phase 1: the alert rules could not be evaluated on the free-text log (no stop_reason or cache field)", r1.every((r) => !r.evaluable)),
        E.check("Phase 1: the diagnosis from free text cited no trace_id that exists in the store", real1.length === 0),
        E.check("Phase 2: both alert rules fired on the structured records (max_tokens and cache-miss rates)", r2.every((r) => r.fired)),
        E.check("Phase 2: the diagnosis names prompt v14 and the max_tokens truncation", namesTrunc),
        E.check("Phase 2: the diagnosis names the lost cache hits and cites at least 2 real trace ids", namesCache && real2.length >= 2),
      ],
    };
  },
};
