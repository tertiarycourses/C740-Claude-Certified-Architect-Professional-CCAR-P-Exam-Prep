// Simulator 6 · Kestrel Platform Team: one afternoon of a Claude-powered checkout assistant, for Lab 15
// (observability at scale). The same synthetic requests are exposed two ways:
//   rawLogs()    - what a plain logger writes: one text line per event, no trace_id, no per-span timings
//   traceStore() - one structured trace per request: trace_id, prompt_version, tokens, latency_ms, stop_reason,
//                  and a span for every model call and tool call, queryable by group and percentile
// The planted cause: from 14:00 the inventory_lookup tool's latency jumps (a cold cache after an inventory-service
// release). Two red herrings: prompt template v42 loads at 14:10 (about 8% more input tokens) and 429 retries tick up.
// Fictional company and data; deterministic (seeded), so every run sees the same afternoon.

function rng(seed) { return () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const R = rng(740015);
const between = (a, b) => Math.round(a + (b - a) * R());
const pad = (n) => String(n).padStart(2, "0");

export const DAY = "2026-11-19";
export const SERVICE = "checkout-assistant";
export const CHANGE_AT = "14:00";

function build() {
  const traces = [];
  for (let i = 0; i < 480; i++) {
    const min = Math.floor((i / 480) * 240) ; // 12:00 to 15:59, evenly spread
    const hh = 12 + Math.floor(min / 60), mm = min % 60, ss = between(0, 59);
    const time = `${pad(hh)}:${pad(mm)}:${pad(ss)}`;
    const after = hh >= 14;
    const prompt_version = hh > 14 || (hh === 14 && mm >= 10) ? "v42" : "v41";
    const tools = [];
    if (R() < 0.6) tools.push("inventory_lookup");
    if (R() < 0.4) tools.push("price_quote");
    if (R() < 0.3 || !tools.length) tools.push("order_status");
    const spans = [];
    for (let t = 0; t <= tools.length; t++) spans.push({ kind: "model_call", name: "model_call", latency_ms: between(420, 880) });
    for (const name of tools) {
      let ms;
      if (name === "inventory_lookup") ms = after && R() < 0.75 ? between(2900, 5200) : between(110, 260);
      else if (name === "price_quote") ms = between(70, 210);
      else ms = between(90, 300);
      spans.push({ kind: "tool", name, latency_ms: ms, status: "ok" });
    }
    const retries = R() < (after ? 0.035 : 0.02) ? 1 : 0;
    const input_tokens = Math.round(between(1500, 2100) * (prompt_version === "v42" ? 1.08 : 1));
    const output_tokens = between(90, 320);
    const stop_reason = R() < 0.02 ? "max_tokens" : "end_turn";
    const latency_ms = spans.reduce((n, s) => n + s.latency_ms, 0) + retries * 800;
    traces.push({ trace_id: `tr-${(0x4a000 + i * 7919).toString(16)}`, time, service: SERVICE, model: "claude-haiku-5-5", prompt_version,
      input_tokens, output_tokens, latency_ms, retries, stop_reason, spans });
  }
  return traces;
}
export const TRACES = build();

const pct = (xs, p) => { const a = [...xs].sort((x, y) => x - y); return a.length ? a[Math.min(a.length - 1, Math.ceil(p * a.length) - 1)] : null; };
const isAfter = (t) => t.time >= `${CHANGE_AT}:00`;

// ---------- the raw logs: what grep sees ----------
export function rawLogs() {
  const lines = [];
  for (const t of TRACES) {
    const ts = `${DAY} ${t.time}`;
    for (let k = 0; k < t.spans.filter((s) => s.kind === "model_call").length; k++) lines.push(`${ts} INFO  anthropic-client POST /v1/messages 200`);
    if (t.retries) lines.push(`${ts} WARN  anthropic-client 429 rate_limit_error, retrying in 0.8s`);
    if (t.stop_reason === "max_tokens") lines.push(`${ts} WARN  ${SERVICE} reply truncated`);
    lines.push(`${ts} INFO  ${SERVICE} chat request completed status=200 duration_ms=${t.latency_ms}`);
  }
  lines.push(`${DAY} 14:10:04 INFO  ${SERVICE} prompt template reloaded (v42)`);
  lines.push(`${DAY} 13:02:11 INFO  ${SERVICE} health check ok`, `${DAY} 15:02:09 INFO  ${SERVICE} health check ok`);
  return lines.sort();
}

export function grepTool() {
  const lines = rawLogs();
  return {
    description: `Search the ${SERVICE} service logs for ${DAY} (12:00 to 16:00) with a regular expression. Optional from/to (HH:MM) narrow the time range. Returns the match count and up to 25 matching lines.`,
    input_schema: { type: "object", properties: { pattern: { type: "string" }, from: { type: "string" }, to: { type: "string" } }, required: ["pattern"], additionalProperties: false },
    run: ({ pattern, from, to }) => {
      let re; try { re = new RegExp(pattern, "i"); } catch { return { isError: true, message: "Invalid regular expression" }; }
      const hits = lines.filter((l) => { const hm = l.slice(11, 16); return re.test(l) && (!from || hm >= from) && (!to || hm < to); });
      return { matches: hits.length, lines: hits.slice(0, 25) };
    },
  };
}

// ---------- the trace store: what a structured query sees ----------
const GROUPS = ["none", "span", "prompt_version", "stop_reason", "model"];
export function traceTools(queries) {
  return {
    query_traces: {
      description: `Query the structured traces of ${SERVICE} for ${DAY} (12:00 to 16:00, one trace per request). group_by: none (whole requests), span (each model call and each tool, by name), prompt_version, stop_reason or model. metric: latency_ms, input_tokens, output_tokens or retries. stat: p50, p95, mean or count. window: before (12:00-13:59), after (14:00-15:59) or both. Returns the value per group per window, and the slowest trace_ids per group.`,
      input_schema: { type: "object", properties: {
        group_by: { type: "string", enum: GROUPS }, metric: { type: "string", enum: ["latency_ms", "input_tokens", "output_tokens", "retries"] },
        stat: { type: "string", enum: ["p50", "p95", "mean", "count"] }, window: { type: "string", enum: ["before", "after", "both"] } },
        required: ["group_by", "metric", "stat", "window"], additionalProperties: false },
      run: (q) => {
        queries.push(q);
        const wins = q.window === "both" ? ["before", "after"] : [q.window];
        const rows = {};
        for (const w of wins) {
          const ts = TRACES.filter((t) => (w === "after") === isAfter(t));
          const items = q.group_by === "span"
            ? ts.flatMap((t) => t.spans.map((s) => ({ g: s.kind === "tool" ? `tool:${s.name}` : "model_call", v: q.metric === "latency_ms" ? s.latency_ms : (t[q.metric] ?? 0), id: t.trace_id })))
            : ts.map((t) => ({ g: q.group_by === "none" ? "all requests" : String(t[q.group_by]), v: t[q.metric] ?? 0, id: t.trace_id }));
          const by = {};
          for (const it of items) (by[it.g] ||= []).push(it);
          for (const [g, its] of Object.entries(by)) {
            const vs = its.map((x) => x.v);
            const val = q.stat === "count" ? vs.length : q.stat === "mean" ? Number((vs.reduce((a, b) => a + b, 0) / vs.length).toFixed(q.metric === "retries" ? 3 : 0)) : pct(vs, q.stat === "p95" ? 0.95 : 0.5);
            (rows[g] ||= { group: g })[w] = val;
            rows[g][`n_${w}`] = its.length;
            if (w === "after" || q.window !== "both") rows[g].slowest_trace_ids = [...its].sort((a, b) => b.v - a.v).slice(0, 3).map((x) => x.id);
          }
        }
        return { metric: q.metric, stat: q.stat, group_by: q.group_by, rows: Object.values(rows) };
      },
    },
    get_trace: {
      description: "Fetch one trace by trace_id: time, prompt_version, tokens, latency_ms, retries, stop_reason and every span with its latency_ms.",
      input_schema: { type: "object", properties: { trace_id: { type: "string" } }, required: ["trace_id"], additionalProperties: false },
      run: ({ trace_id }) => TRACES.find((t) => t.trace_id === trace_id) || { isError: true, message: `No trace ${trace_id}` },
    },
  };
}

export const FINDING_TOOL = {
  description: "File the incident finding: the component you identify as the cause, that component's own metric before and after 14:00 (numbers you measured, or null if you could not measure them), evidence, and your confidence.",
  input_schema: { type: "object", properties: {
    cause: { type: "string", description: "Only the name of the component you identify as the cause (a service, tool, model, config or dependency), at most 6 words." },
    metric: { type: "string", description: "The cause component's own metric, e.g. 'p95 latency_ms'." },
    before: { type: ["number", "null"], description: "The cause component's value before 14:00, as measured; null if not measured." },
    after: { type: ["number", "null"], description: "The cause component's value after 14:00, as measured; null if not measured." },
    evidence: { type: "string", description: "What you measured, in under 60 words." },
    evidence_trace_ids: { type: "array", items: { type: "string" }, description: "trace_ids that show the cause; empty if you have none." },
    confidence: { type: "string", enum: ["low", "medium", "high"] } },
    required: ["cause", "metric", "before", "after", "evidence", "evidence_trace_ids", "confidence"], additionalProperties: false },
};

// Both phases get the same investigation budget: after `max` calls the tools refuse and ask for the finding.
export function budgeted(tools, max, counter) {
  return Object.fromEntries(Object.entries(tools).map(([name, t]) => [name, { ...t, run: (input) => (++counter.n > max
    ? { isError: true, message: `Investigation budget of ${max} calls used. File your finding now with what you have measured.` }
    : t.run(input)) }]));
}

// The ground truth the checks compare against.
export function truth() {
  const span = (w, name) => TRACES.filter((t) => (w === "after") === isAfter(t)).flatMap((t) => t.spans.filter((s) => s.name === name).map((s) => s.latency_ms));
  const req = (w) => TRACES.filter((t) => (w === "after") === isAfter(t)).map((t) => t.latency_ms);
  return { invBefore: pct(span("before", "inventory_lookup"), 0.95), invAfter: pct(span("after", "inventory_lookup"), 0.95),
    reqBefore: pct(req("before"), 0.95), reqAfter: pct(req("after"), 0.95), ids: new Set(TRACES.map((t) => t.trace_id)) };
}
