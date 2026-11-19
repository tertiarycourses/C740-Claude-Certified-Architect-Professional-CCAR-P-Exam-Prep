// Domain 4 labs: Kestrel Platform Team fixtures.
// Lab 22: an on-call alert-triage prompt (v1 vs v2) and a fixed, labelled eval set of alerts.
// Lab 25: one hour of production calls from the checkout-assistant feature, as free-text log lines and as
//         structured per-call records in a fake observability store. All data is synthetic and deterministic.

// ---------- Lab 22: alert triage ----------
export const TRIAGE_V1 = "You triage production alerts for Kestrel's on-call rota. Assign one severity to each alert.\n" +
  "SEV1: any error alert from checkout-service or payments-gateway, at any error rate; or a full outage of any service.\n" +
  "SEV2: degraded performance without errors (latency over SLO, partial feature loss), and all security alerts.\n" +
  "SEV3: everything else.";

// v2: the author's rewrite. It adds a rule for non-production alerts (a real improvement) and, to cut noisy pages,
// rewrites SEV1 around an error-rate threshold, which quietly drops "at any error rate" for checkout and payments.
export const TRIAGE_V2 = "You triage production alerts for Kestrel's on-call rota. Assign one severity to each alert.\n" +
  "Alerts from staging, dev or CI environments are always SEV3: they never page anyone.\n" +
  "SEV1: a full outage of a production service, or an error rate above 5%.\n" +
  "SEV2: degraded production performance (latency over SLO, partial feature loss, error rate up to 5%), and all security alerts.\n" +
  "SEV3: everything else.";

// The eval set: fixed ids, gold severity agreed by the on-call leads. AL-01 is the author's demo alert.
export const ALERTS = [
  { id: "AL-01", text: "[staging] checkout-service: HTTP 500 rate 38% for 10 min after deploy of build 4412", gold: "SEV3" },
  { id: "AL-02", text: "[prod] checkout-service: payment capture failing for 2.1% of orders for 15 min (card charge errors)", gold: "SEV1" },
  { id: "AL-03", text: "[prod] payments-gateway: 1.4% of card authorisations timing out, customers see 'payment failed'", gold: "SEV1" },
  { id: "AL-04", text: "[prod] search-service: p95 latency 2.8 s against an 800 ms SLO for 20 min, no errors", gold: "SEV2" },
  { id: "AL-05", text: "[prod] catalog-service: 100% of requests returning 503 for 6 min", gold: "SEV1" },
  { id: "AL-06", text: "[dev] build agent ci-07: disk 97% full", gold: "SEV3" },
  { id: "AL-07", text: "[prod] auth-service: 40x spike in failed logins from one IP range", gold: "SEV2" },
  { id: "AL-08", text: "[prod] marketing-site: one broken image link on the careers page", gold: "SEV3" },
];
export const DEMO_ID = "AL-01";

export const LABELS_SCHEMA = { type: "object", additionalProperties: false, required: ["labels"], properties: {
  labels: { type: "array", items: { type: "object", additionalProperties: false, required: ["id", "severity"], properties: {
    id: { type: "string", enum: ALERTS.map((a) => a.id) }, severity: { type: "string", enum: ["SEV1", "SEV2", "SEV3"] } } } } } };

// ---------- Lab 25: the checkout-assistant's last hour ----------
function rng(seed) { let x = seed >>> 0; return () => ((x = (x * 1664525 + 1013904223) >>> 0) / 2 ** 32); }
const hhmmss = (sec) => `${String(10 + Math.floor(sec / 3600)).padStart(2, "0")}:${String(Math.floor(sec / 60) % 60).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;

// 48 calls between 10:00 and 11:00. Prompt v14 ships at 10:20. v14 asks for a longer, item-by-item answer (outputs hit
// the 1024 max_tokens cap) and puts the request timestamp at the top of the system prompt (so the cached prefix never matches).
export function traffic() {
  const r = rng(740);
  const out = [];
  for (let i = 0; i < 48; i++) {
    const sec = Math.floor(i * 75 + r() * 60);
    const v14 = sec >= 20 * 60;
    const capped = v14 && r() < 0.42;
    const tools = v14 ? 1 + Math.floor(r() * 2) : Math.floor(r() * 2);
    const output = capped ? 1024 : Math.round(v14 ? 620 + r() * 300 : 210 + r() * 140);
    const cached = v14 ? 0 : 3200;
    const input = (v14 ? 3200 : 0) + Math.round(380 + r() * 220);
    const latency = Math.round((v14 ? 900 : 450) + output * (v14 ? 4.1 : 3.6) + r() * 400);
    out.push({
      ts: `2026-11-19T${hhmmss(sec)}Z`, trace_id: `tr-${(0x5a10 + i * 37).toString(16)}`, service: "checkout-assistant",
      model: "claude-haiku-5-5", prompt_version: v14 ? "v14" : "v13", input_tokens: input, cache_read_input_tokens: cached,
      output_tokens: output, latency_ms: latency, stop_reason: capped ? "max_tokens" : "end_turn", tool_calls: tools,
    });
  }
  return out;
}

// What the same hour looks like when the feature only prints free-text lines.
export function freeTextLog(recs) {
  const lines = [];
  for (const [i, x] of recs.entries()) {
    const t = x.ts.slice(11, 19);
    lines.push(`${t} INFO  checkout-assistant: answered customer question in ${(x.latency_ms / 1000).toFixed(1)}s`);
    if (x.latency_ms > 4000) lines.push(`${t} WARN  checkout-assistant: slow response`);
    if (x.stop_reason === "max_tokens" && i % 3 === 0) lines.push(`${t} WARN  checkout-assistant: customer reported an incomplete answer (ticket opened)`);
  }
  lines.push("10:58:00 INFO  billing: Claude API spend this hour is 2.4x the same hour yesterday");
  return lines;
}

// The alert rule a team would write on structured records: share of calls cut off by max_tokens in a window.
export function evalRule(recs, { field = "stop_reason", value = "max_tokens", fromTs, threshold = 0.05 }) {
  const win = recs.filter((x) => x.ts >= fromTs);
  const known = win.filter((x) => x && x[field] !== undefined);
  if (!known.length) return { evaluable: false, rate: null, fired: false, n: win.length };
  const hit = known.filter((x) => x[field] === value).length;
  return { evaluable: true, rate: hit / known.length, fired: hit / known.length > threshold, n: known.length, hit };
}

// Aggregate by prompt version: the view a dashboard would show.
export function byVersion(recs) {
  const g = {};
  for (const x of recs) (g[x.prompt_version] ||= []).push(x);
  return Object.fromEntries(Object.entries(g).map(([v, xs]) => {
    const avg = (k) => Math.round(xs.reduce((n, x) => n + x[k], 0) / xs.length);
    const lat = xs.map((x) => x.latency_ms).sort((a, b) => a - b);
    return [v, { calls: xs.length, first_ts: xs[0].ts, avg_input_tokens: avg("input_tokens"), avg_cache_read_input_tokens: avg("cache_read_input_tokens"),
      avg_prompt_tokens_incl_cached: Math.round(xs.reduce((n, x) => n + x.input_tokens + x.cache_read_input_tokens, 0) / xs.length),
      avg_output_tokens: avg("output_tokens"), p95_latency_ms: lat[Math.min(lat.length - 1, Math.ceil(0.95 * lat.length) - 1)],
      max_tokens_stops: xs.filter((x) => x.stop_reason === "max_tokens").length, avg_tool_calls: +(xs.reduce((n, x) => n + x.tool_calls, 0) / xs.length).toFixed(1) }];
  }));
}
