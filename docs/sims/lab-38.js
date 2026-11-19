// Lab 38 · Task 7.3 · Simulator 6 (Kestrel): debug a Claude-powered service with evidence, not guesses.
// Since Tue 14:10, 6% of order-summary requests fail with "Order summary unavailable". Phase 1 asks Claude for the
// cause and the fix from the page and a customer ticket alone. Phase 2 gives Claude read-only tools over the
// observability store (search_logs, list_traces, get_trace, list_deploys) and a staging replay (rerun_request), and a
// loop to work: gather evidence, isolate, test one hypothesis at a time, reproduce, verify the fix. The root cause is
// planted in the data: config v42 cut max_tokens from 2048 to 1024, so summaries of large orders stop with
// stop_reason "max_tokens" and the JSON is cut off. A get_inventory timeout is a red herring at the same rate as before.
import { ALERT, TRACES, FAILING, opsTools, ROOT_CAUSES } from "./shared/d7-kestrel.js";

const SCHEMA = { type: "object", additionalProperties: false, properties: {
  hypotheses: { type: "array", items: { type: "object", additionalProperties: false, properties: {
    cause: { type: "string", enum: ROOT_CAUSES }, status: { type: "string", enum: ["confirmed", "ruled_out", "untested"] },
    evidence: { type: "string" } }, required: ["cause", "status", "evidence"] } },
  root_cause: { type: "string", enum: ROOT_CAUSES },
  evidence_trace_ids: { type: "array", items: { type: "string" } },
  reproduced: { type: "boolean" },
  fix: { type: "string" },
  fix_verified: { type: "boolean" } },
  required: ["hypotheses", "root_cause", "evidence_trace_ids", "reproduced", "fix", "fix_verified"] };
const FORMAT = { format: { type: "json_schema", schema: SCHEMA } };

const GUESS = "You are helping Kestrel's on-call engineer with an incident in order-summary, a Claude-powered service (claude-haiku-5-5) that writes the order summary shown on the confirmation page. From the page and the ticket, give the most likely root cause and the fix to apply now. Reply with the JSON only.";
const LOOP = `You are helping Kestrel's on-call engineer with an incident in order-summary, a Claude-powered service (claude-haiku-5-5) that writes the order summary shown on the confirmation page. Your tools are read-only, plus a staging replay. Work the loop:
1. Gather evidence: error logs, failing and healthy traces, recent deploys.
2. Isolate: compare failing with healthy traces, and before with after the change.
3. Keep competing hypotheses; test one at a time and rule others out with evidence.
4. Reproduce a failing request with rerun_request using its original settings.
5. Verify a fix by re-running it with only that one setting changed.
Never report a fix as verified unless a re-run proved it. Then reply with the JSON only.`;

export default {
  id: 38,
  see: "Phase 1 names a likely cause from the symptoms with no trace behind it and nothing reproduced. Phase 2 reads the logs, compares failing traces (17, 14 and 19 items, stop_reason max_tokens at 1,024 output tokens) with healthy ones, finds config v42 cut max_tokens to 1024, reproduces the truncation in staging, verifies that a higher max_tokens returns end_turn with valid JSON, and rules out the get_inventory timeout.",
  try: "In shared/d7-kestrel.js, raise the v42 limit in TRACES from 1024 to 2048 and run Phase 2: the failures vanish and Claude has to look elsewhere. Then remove rerun_request from opsTools and see whether Claude still claims fix_verified.",
  explain: "Both phases start from the same page and the same customer ticket. From symptoms alone, Claude can only produce a plausible story: an API problem, a timeout, a bad prompt. Nothing in it is checked, and acting on it in production risks a second incident. With read-only access to logs, traces and deploys, the loop narrows quickly: the new error group appears at Tue 14:05, every failing trace stops with stop_reason max_tokens at exactly 1,024 output tokens on large orders, healthy traces before the change used up to 1,300 tokens under a 2,048 limit, and the deploy log shows config v42 halving max_tokens. A replay in staging reproduces the failure and verifies the fix before anyone touches production. The application should also check stop_reason before parsing, so a truncated reply fails loudly instead of as a JSON error.",
  scene: {
    title: "Kestrel on-call: order-summary fails 6% of the time since Tuesday. Why?",
    caption: "Same page, same ticket, same model. Only whether Claude works from evidence with tools differs.",
    lanes: [
      { key: "p1", label: "Phase 1 · guess from symptoms", sub: "the page and a ticket, no tools", tone: "trap", on: /Phase 1/, stages: [
        { id: "a_page", icon: "📟", t: "Page: 6.1% errors", s: "since Tue 14:10, \"summary unavailable\"" },
        { id: "a_ev", icon: "🔍", t: "Evidence gathered", s: "none: logs and traces not read", diff: true },
        { id: "a_claude", icon: "🤖", t: "Claude diagnoses", s: "root cause and fix", claude: true },
        { id: "a_rep", icon: "🧪", t: "Reproduce and verify", s: "staging replay of a failing request" },
        { id: "a_out", icon: "🎯", t: "Root cause", s: "want: proven by a re-run, fix verified", out: true } ] },
      { key: "p2", label: "Phase 2 · structured debugging loop", sub: "logs, traces, deploys, replay", tone: "fix", on: /Phase 2/, stages: [
        { id: "b_page", icon: "📟", t: "Page: 6.1% errors", s: "the same page and ticket" },
        { id: "b_ev", icon: "🔍", t: "Logs, traces, deploys", s: "read-only tools", tools: ["search_logs", "list_traces", "get_trace", "list_deploys"], diff: true },
        { id: "b_claude", icon: "🤖", t: "Claude isolates", s: "competing hypotheses, one at a time", claude: true },
        { id: "b_rep", icon: "🧪", t: "Reproduce and verify", s: "staging replay of a failing request", tools: ["rerun_request"] },
        { id: "b_out", icon: "🎯", t: "Root cause", s: "want: proven by a re-run, fix verified", out: true } ] },
    ],
  },
  slide: {
    title: "Evidence, isolate, reproduce, verify: then fix",
    code: `search_logs("order-summary")                 # KEY 1
get_trace("tr-a131")
# stop_reason: max_tokens, output_tokens: 1024
list_deploys()
# Tue 14:05 config v42: max_tokens 2048 -> 1024

rerun_request("tr-a131")                     # KEY 2
# stop_reason: max_tokens, json_valid: false
rerun_request("tr-a131", max_tokens=2048)    # KEY 3
# stop_reason: end_turn, json_valid: true

# in the service: check before you parse      # KEY 4
if resp.stop_reason == "max_tokens":
    raise SummaryTruncated(resp.usage.output_tokens)`,
    keys: [["1", "Evidence before theory", "Logs, traces and deploys, read-only."],
           ["2", "Reproduce the failure", "Replay a failing request as it was sent."],
           ["3", "Change one thing, verify", "Raise max_tokens only; it passes."],
           ["4", "Check stop_reason", "Truncation fails loudly, not as bad JSON."]],
  },
  async run(s, E) {
    s.log(`Kestrel on-call · ${ALERT}`, "note");

    s.log("== Phase 1 · guess from symptoms: the page and the ticket, no tools", "note");
    s.show("a_page", "6.1% vs 0.2% baseline", "done");
    s.show("a_ev", "none", "done");
    const r1 = await E.runAgent(s, { system: GUESS, prompt: ALERT, output_config: FORMAT, max_tokens: 2500, maxTurns: 1 });
    let j1 = null; try { j1 = JSON.parse(r1.text); } catch { /* checked below */ }
    const real1 = (j1?.evidence_trace_ids || []).filter((id) => FAILING.includes(id));
    s.show("a_claude", j1 ? (j1.root_cause === "unknown" ? "no cause: \"check the logs\"" : `guess: ${j1.root_cause}`) : "no answer", "done");
    s.show("a_rep", "not possible: no tools", "done");
    s.show("a_out", j1 ? `${j1.root_cause} · 0 traces · not reproduced` : "no diagnosis", "bad");
    s.log(`Phase 1 diagnosis: ${j1?.root_cause} · fix: ${E.short(j1?.fix || "", 160)} · traces cited that exist: ${real1.length}`, "note");
    await s.pause({
      title: "Phase 1 finished: a diagnosis from the symptoms",
      outcome: `${j1?.root_cause && j1.root_cause !== "unknown" ? `Claude's best guess is **${j1.root_cause}**, with the fix "${E.short(j1.fix || "", 120)}".` : `From the symptoms alone Claude **cannot name a root cause**; its \"fix\" is a to-do list or a mitigation: "${E.short(j1?.fix || "", 120)}".`} **No log, trace or deploy was read and nothing was reproduced**, so the on-call engineer still doesn't know what to change.`,
      next: "Phase 2: the same page, with read-only logs, traces and deploys, a staging replay, and the debugging loop",
    });

    s.log("== Phase 2 · structured debugging loop: gather evidence, isolate, one hypothesis at a time, reproduce, verify", "note");
    s.show("b_page", "6.1% vs 0.2% baseline", "done");
    const ops = [];
    const r2 = await E.runAgent(s, { system: LOOP, prompt: ALERT, tools: opsTools(ops), output_config: FORMAT, max_tokens: 4000, maxTurns: 12 });
    let j2 = null; try { j2 = JSON.parse(r2.text); } catch { /* checked below */ }
    const firstRerun = ops.findIndex((o) => o.tool === "rerun_request");
    const evidenceFirst = firstRerun > 0 && ops.slice(0, firstRerun).some((o) => o.tool === "search_logs" || o.tool === "get_trace") && ops.some((o) => o.tool === "list_deploys");
    const repro = ops.find((o) => o.tool === "rerun_request" && FAILING.includes(o.trace_id) && o.original && o.stop_reason === "max_tokens");
    const verify = ops.find((o) => o.tool === "rerun_request" && FAILING.includes(o.trace_id) && !o.original && o.stop_reason === "end_turn" && o.summary_json_valid);
    const real2 = (j2?.evidence_trace_ids || []).filter((id) => FAILING.includes(id));
    const timeoutOut = (j2?.hypotheses || []).some((h) => h.cause === "tool_timeout" && h.status === "ruled_out");
    const read = [...new Set(ops.filter((o) => o.tool !== "rerun_request").map((o) => o.tool))];
    s.show("b_ev", `${read.join(", ")} · ${ops.filter((o) => o.tool === "get_trace").length} traces`, "done");
    s.show("b_claude", j2 ? `${j2.hypotheses.length} hypotheses → ${j2.root_cause}` : "no answer", "done");
    s.show("b_rep", repro && verify ? `repro max_tokens @${repro.max_tokens} · ok @${verify.max_tokens}` : repro ? "reproduced, fix not verified" : "not reproduced", "done");
    const good = j2?.root_cause === "max_tokens_truncation" && repro && verify && real2.length > 0;
    s.show("b_out", j2 ? `${j2.root_cause}${verify ? `, verified at max_tokens ${verify.max_tokens}` : ""}` : "no diagnosis", good ? "good" : "bad");
    for (const h of j2?.hypotheses || []) s.log(`  ${h.status.padEnd(9)} ${h.cause}: ${E.short(h.evidence, 140)}`, h.status === "confirmed" ? "result" : "note");

    const steps = ops.map((o) => o.tool === "rerun_request" ? `rerun(${o.trace_id}, ${o.max_tokens}) → ${o.stop_reason}` : o.tool === "get_trace" ? `get_trace(${o.trace_id})` : o.tool).join(" → ");
    s.log(`Loop: ${steps}`, "result");
    const final = j2 ? [`Root cause: ${j2.root_cause} (evidence: ${j2.evidence_trace_ids.join(", ") || "none"})`,
      `Reproduced: ${j2.reproduced} · fix verified: ${j2.fix_verified}`, `Fix: ${j2.fix}`, "", "Hypotheses:",
      ...j2.hypotheses.map((h) => `- ${h.cause}: ${h.status}. ${h.evidence}`)].join("\n") : r2.text;
    return {
      final,
      compare: {
        cols: [
          { title: "Phase 1: guess from symptoms", short: "Guess", tone: "trap", said: r1.text,
            verdict: j1?.root_cause === "unknown" || !j1
              ? "**No root cause**: with only the page and the ticket, Claude can list what to look at or suggest a mitigation, but **no trace, log or reproduction** stands behind any cause."
              : `A plausible story (**${j1.root_cause}**) with **no trace, no log and no reproduction** behind it. ${j1.root_cause === "max_tokens_truncation" ? "This time the guess was right, but nothing showed it." : "It is not the cause."}` },
          { title: "Phase 2: structured debugging loop", short: "Debugging loop", tone: "fix", said: r2.text,
            verdict: good ? `Evidence first, then isolation: failing traces stop at **stop_reason max_tokens, 1,024 tokens**, after config v42 halved max_tokens. A replay reproduced it at ${repro.max_tokens} and **verified the fix at ${verify.max_tokens}**; the get_inventory timeout was ${timeoutOut ? "ruled out" : "not the cause"}.`
              : `Root cause ${j2?.root_cause}; reproduced ${!!repro}; verified ${!!verify}. Read the live output: Claude writes each run fresh.` },
        ],
        rows: [
          ["Evidence read", { v: "none", tone: "bad" }, { v: read.join(", ") || "none", tone: evidenceFirst ? "good" : "bad" }],
          ["Root cause named", { v: j1?.root_cause || "none", tone: j1?.root_cause === "max_tokens_truncation" ? "good" : "bad" }, { v: j2?.root_cause || "none", tone: j2?.root_cause === "max_tokens_truncation" ? "good" : "bad" }],
          ["Failing traces cited (exist in the store)", { v: String(real1.length), tone: real1.length ? "good" : "bad" }, { v: real2.join(", ") || "0", tone: real2.length ? "good" : "bad" }],
          ["Reproduced in staging", { v: "no", tone: "bad" }, { v: repro ? `yes: max_tokens at ${repro.max_tokens}` : "no", tone: repro ? "good" : "bad" }],
          ["Fix verified by a re-run", { v: "no", tone: "bad" }, { v: verify ? `yes: end_turn, valid JSON at ${verify.max_tokens}` : "no", tone: verify ? "good" : "bad" }],
          ["Red herring (get_inventory timeout)", "—", { v: timeoutOut ? "ruled out with evidence" : "not ruled out", tone: timeoutOut ? "good" : "bad" }],
        ],
        note: "Same page, same ticket, same model. The only difference is evidence: read-only tools over logs, traces and deploys, a staging replay, and a loop that reproduces before it fixes.",
      },
      checks: [
        E.check("Phase 1: the diagnosis cites no real failing trace and nothing was reproduced", j1 && real1.length === 0),
        E.check("Phase 2: Claude read logs or traces before its first re-run, and checked the deploy history", evidenceFirst),
        E.check("Phase 2: a re-run of a failing request with its original max_tokens reproduced stop_reason max_tokens", !!repro),
        E.check("Phase 2: a re-run with a higher max_tokens returned end_turn and valid summary JSON (fix verified)", !!verify),
        E.check("Phase 2: root cause max_tokens_truncation, citing a real failing trace, with the tool timeout ruled out", j2?.root_cause === "max_tokens_truncation" && real2.length > 0 && timeoutOut),
      ],
    };
  },
};
