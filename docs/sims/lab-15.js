// Lab 15 · Task 3.4 · Simulator 6: structured traces, not grep, find the cause of a latency incident.
// The same afternoon of 480 checkout-assistant requests is exposed two ways. Phase 1: Claude can only grep the
// raw service logs (one line per event, total duration only, no trace_id, no per-span timings). Phase 2: the
// same prompt, but Claude can query a trace store with one trace per request and a span per model and tool call.
// Both phases end by filing a finding with the same tool; the checks compare it with the store's ground truth.
import { DAY, SERVICE, grepTool, traceTools, FINDING_TOOL, truth, budgeted } from "./shared/d3a-traces.js";

const T = truth();
const sec = (ms) => `${(ms / 1000).toFixed(1)} s`;
const SYSTEM = "You are the Kestrel platform team's on-call assistant. Investigate with the tools you have, quote only numbers you measured, then file exactly one finding with file_incident_finding. You have a budget of 5 investigation calls.";
const PROMPT = `Incident INC-2291 · ${SERVICE} (repo kestrel/checkout-service) · ${DAY}
The checkout assistant's p95 response time rose from about ${sec(T.reqBefore)} to about ${sec(T.reqAfter)} at around 14:00. Customers report slow replies. Find the component that causes the slowdown, with measured before/after evidence, and file the finding.`;

async function phase(s, E, structured) {
  const queries = [];
  const filed = [];
  const tools = {
    ...budgeted(structured ? traceTools(queries) : { grep_logs: grepTool() }, 5, { n: 0 }),
    file_incident_finding: { ...FINDING_TOOL, run: (input) => { filed.push(input); return { filed: true, incident: "INC-2291" }; } },
  };
  const run = await E.runAgent(s, { system: SYSTEM, prompt: PROMPT, tools, maxTurns: 7, max_tokens: 2048 });
  const f = filed.at(-1) || null;
  const namesTool = !!f && /inventory[_ ]?lookup/i.test(`${f.cause} ${f.metric}`);
  const near = (x, want) => typeof x === "number" && Math.abs(x - want) <= 0.1 * want;
  // Accept the figures in ms, or in seconds (e.g. 5.08 for 5,081 ms).
  const matches = !!f && (near(f.before, T.invBefore) || near((f.before ?? 0) * 1000, T.invBefore)) && (near(f.after, T.invAfter) || near((f.after ?? 0) * 1000, T.invAfter));
  const realIds = (f?.evidence_trace_ids || []).filter((id) => T.ids.has(id));
  return { run, queries, f, namesTool, matches, realIds };
}

const fmt = (f) => (f ? `${f.cause} · ${f.metric}: ${f.before ?? "?"} -> ${f.after ?? "?"} · confidence ${f.confidence}` : "no finding filed");

export default {
  id: 15,
  see: "Phase 1 (grep over raw logs): Claude sees request durations jump at 14:00, a prompt reload at 14:10 and a few 429 retries, and files a finding blaming one of those, or none with low confidence; no log line can name a span. Phase 2 (structured traces): one query grouped by span shows model_call flat (about 0.86 s p95) and tool:inventory_lookup jumping from about 250 ms to about 5,080 ms p95; the finding names inventory_lookup with those numbers and real trace_ids.",
  try: "In Phase 2, ask Claude to rule out the prompt change first: query_traces grouped by prompt_version shows v41 requests were already slow at 14:00-14:09, before v42 loaded. Then edit d3a-traces.js so price_quote also slows after 14:00 and see whether the span query separates the two.",
  explain: "The raw logs record that each request finished and how long it took, plus whatever else happened to be logged: model calls, a few 429 retries, a prompt reload at 14:10. They carry no trace_id to tie lines together and no timing for the steps inside a request, so grep can show that requests got slower but not where the time went, and the most visible coincidence (the prompt reload, or the retries) becomes the suspect. The trace store holds the same afternoon as one trace per request, with a span for every model call and tool call and the prompt version, tokens, retries and stop_reason on each. One query grouped by span answers the question: model_call latency is flat, inventory_lookup's p95 rose about twentyfold at 14:00, and the slowest trace_ids are the evidence. That is the monitoring strategy that scales: emit structured, correlated spans with the versions of everything that can change, and query them; raising log levels, averaging a dashboard or storing every conversation in full does not tell you which span moved.",
  scene: {
    title: "INC-2291: checkout assistant p95 more than doubled at 14:00. Which span moved?",
    caption: "Both phases investigate the same 480 requests with the same prompt and file the finding with the same tool. Only what Claude can query differs: raw log lines or structured traces.",
    lanes: [
      { key: "p1", label: "Phase 1 · grep the raw logs", sub: "one line per event, no trace_id, no span timings", tone: "trap", on: /Phase 1/, stages: [
        { id: "a_inc", icon: "🚨", t: "INC-2291", s: `p95 ${sec(T.reqBefore)} -> ${sec(T.reqAfter)} at 14:00` },
        { id: "a_agent", icon: "🤖", t: "On-call assistant", s: "same prompt in both phases", claude: true },
        { id: "a_src", icon: "📜", t: "Raw service logs", s: "grep_logs: text lines, total duration only", diff: true, tools: ["grep_logs"] },
        { id: "a_file", icon: "📝", t: "Finding filed", s: "file_incident_finding", tools: ["file_incident_finding"] },
        { id: "a_out", icon: "🎯", t: "Cause identified", s: "want: inventory_lookup, with measured p95s", out: true } ] },
      { key: "p2", label: "Phase 2 · query structured traces", sub: "trace_id, spans, tokens, latency, stop_reason", tone: "fix", on: /Phase 2/, stages: [
        { id: "b_inc", icon: "🚨", t: "INC-2291", s: "the same incident, the same prompt" },
        { id: "b_agent", icon: "🤖", t: "On-call assistant", s: "same prompt in both phases", claude: true },
        { id: "b_src", icon: "🧭", t: "Trace store", s: "query_traces, get_trace: span by span", diff: true, tools: ["query_traces", "get_trace"] },
        { id: "b_file", icon: "📝", t: "Finding filed", s: "file_incident_finding", tools: ["file_incident_finding"] },
        { id: "b_out", icon: "🎯", t: "Cause identified", s: "want: inventory_lookup, with measured p95s", out: true } ] },
    ],
  },
  slide: {
    title: "One trace per request, one span per step",
    code: `{"trace_id": "tr-2ba78d", "service": "checkout-assistant",  # KEY 1
 "time": "14:31:07", "prompt_version": "v42",              # KEY 2
 "model": "claude-haiku-5-5", "input_tokens": 1987,
 "output_tokens": 212, "stop_reason": "end_turn",
 "latency_ms": 6984, "retries": 0,
 "spans": [                                                # KEY 3
   {"kind": "model_call", "latency_ms": 702},
   {"kind": "tool", "name": "inventory_lookup",
    "latency_ms": 5044, "status": "ok"},
   {"kind": "model_call", "latency_ms": 655}]}

# p95(latency_ms) GROUP BY span, before vs after 14:00   # KEY 4`,
    keys: [["1", "Correlate with trace_id", "Every step of one request carries the same id."],
           ["2", "Version what can change", "Prompt, model, index and tool versions on each trace."],
           ["3", "A span per model and tool", "Latency, tokens and status for every step."],
           ["4", "Query, don't grep", "Group by span and compare percentiles."]],
  },
  async run(s, E) {
    s.log(`INC-2291 · ${SERVICE} · p95 ${sec(T.reqBefore)} before 14:00, ${sec(T.reqAfter)} after · 480 requests between 12:00 and 16:00`, "note");
    s.log("== Phase 1 · grep the raw service logs: text lines, total duration only, no trace_id", "note");
    s.show("a_inc", `p95 ${sec(T.reqBefore)} -> ${sec(T.reqAfter)}`, "done");
    const p1 = await phase(s, E, false);
    s.show("a_src", `${p1.run.calls.filter((c) => c.name === "grep_logs").length} grep_logs calls`, "done");
    s.show("a_file", p1.f ? E.short(p1.f.cause, 60) : "no finding filed", "done");
    s.show("a_out", p1.namesTool && p1.matches ? "inventory_lookup with measured p95s" : E.short(p1.f ? `blamed: ${p1.f.cause}` : "no finding filed", 60), p1.namesTool && p1.matches ? "good" : "bad");
    await s.pause({
      title: "Phase 1 finished: grep over raw logs",
      outcome: `Finding: **${fmt(p1.f)}**. The logs show *that* requests slowed at 14:00, but no line says which step inside a request took the time${p1.namesTool ? "" : ", so inventory_lookup could not be named"}.`,
      next: "Phase 2: the same incident and prompt, with a structured trace store to query",
    });

    s.log("== Phase 2 · query structured traces: one trace per request, a span per model call and tool call", "note");
    s.show("b_inc", `p95 ${sec(T.reqBefore)} -> ${sec(T.reqAfter)}`, "done");
    const p2 = await phase(s, E, true);
    const bySpan = p2.queries.some((q) => q.group_by === "span" && q.metric === "latency_ms");
    s.show("b_src", `${p2.queries.length} queries${bySpan ? " · incl. p95 latency by span" : ""}`, "done");
    s.show("b_file", p2.f ? E.short(p2.f.cause, 60) : "no finding filed", "done");
    s.show("b_out", p2.namesTool ? E.short(`inventory_lookup ${p2.f.before} -> ${p2.f.after} ${p2.f.metric}`, 60) : E.short(p2.f ? `blamed: ${p2.f.cause}` : "no finding filed", 60), p2.namesTool && p2.matches ? "good" : "bad");

    return {
      final: p2.run.text || fmt(p2.f),
      compare: {
        cols: [
          { title: "Phase 1: grep the raw logs", short: "Raw logs", tone: "trap", said: p1.f ? `${fmt(p1.f)}\n${p1.f.evidence}` : p1.run.text,
            verdict: p1.namesTool ? "Named inventory_lookup, but the logs carry no span timings, so the numbers can't have been measured from them." : `Blamed **${p1.f?.cause || "nothing"}**. The logs show requests got slower, and what else happened nearby, but not which step inside a request took the time.` },
          { title: "Phase 2: query the structured traces", short: "Traces", tone: "fix", said: p2.f ? `${fmt(p2.f)}\n${p2.f.evidence}` : p2.run.text,
            verdict: p2.namesTool && p2.matches ? `Grouped p95 latency by span: model_call flat, **tool:inventory_lookup ${T.invBefore} ms -> ${T.invAfter} ms**. The finding cites ${p2.realIds.length} real trace_id${p2.realIds.length === 1 ? "" : "s"}.`
              : `Finding: ${fmt(p2.f)}. Read the live output: Claude writes each run fresh.` },
        ],
        rows: [
          ["What Claude could query", "grep_logs over 1,690 text lines", { v: "query_traces + get_trace over 480 traces", tone: "good" }],
          ["Investigation calls", String(p1.run.calls.filter((c) => c.name !== "file_incident_finding").length), String(p2.run.calls.filter((c) => c.name !== "file_incident_finding").length)],
          ["Cause named in the finding", { v: E.short(p1.f?.cause || "none", 70), tone: p1.namesTool ? "good" : "bad" }, { v: E.short(p2.f?.cause || "none", 70), tone: p2.namesTool ? "good" : "bad" }],
          [`Before/after matches the store (inventory_lookup p95 ${T.invBefore} -> ${T.invAfter} ms)`, { v: p1.matches ? "yes" : "no", tone: p1.matches ? "good" : "bad" }, { v: p2.matches ? "yes" : "no", tone: p2.matches ? "good" : "bad" }],
          ["Real trace_ids cited as evidence", String(p1.realIds.length), { v: String(p2.realIds.length), tone: p2.realIds.length ? "good" : "bad" }],
        ],
        note: "Same 480 requests, same prompt, same finding tool. More log lines (A) or a mean-latency dashboard (B) still can't say which span moved; full prompt and completion logs (C) add privacy risk and cost without span timings. Structured traces with a span per step (D) answer it in one query.",
      },
      checks: [
        E.check("Phase 1: Claude grepped the raw logs and filed a finding without measured inventory_lookup figures", p1.run.calls.some((c) => c.name === "grep_logs") && !!p1.f && !(p1.namesTool && p1.matches)),
        E.check("Phase 2: Claude queried latency grouped by span (each model call and tool)", p2.queries.some((q) => q.group_by === "span" && q.metric === "latency_ms")),
        E.check("Phase 2: the finding names inventory_lookup as the cause", p2.namesTool),
        E.check(`Phase 2: the finding's before/after match the store (about ${T.invBefore} -> ${T.invAfter} ms p95)`, p2.matches),
        E.check("Phase 2: the finding cites trace_ids that exist in the store", p2.realIds.length >= 1),
      ],
    };
  },
};
