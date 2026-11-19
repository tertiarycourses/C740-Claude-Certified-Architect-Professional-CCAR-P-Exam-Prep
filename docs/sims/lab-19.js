// Lab 19 · Task 3.8 · Simulator 6 (Kestrel Platform Team): progressive discovery vs monolithic context.
// Kestrel's on-call agent is connected to 40 tools on 7 MCP servers and a library of 24 runbooks. Incident INC-5531
// needs one runbook (RB-17) and four tools. Phase 1 (monolithic) puts all 40 tool definitions and the whole library
// in every request. Phase 2 (progressive) starts with a hot set of three tools: search_catalog over a one-line index,
// load (a runbook, which also brings the tools it names, or a single tool), and incident_note, which every runbook uses.
// Definitions join the request only once loaded. Same incident, same prompt core, same backend.
// The progressive loop is written out here (not engine.runAgent) because the tool list must grow between turns.
import { INCIDENT, makeBackend, RUNBOOKS, LIBRARY_TEXT, catalogIndex } from "./shared/d3b-oncall.js";

const BUDGET = 5000;     // Kestrel's per-request input-token budget for the on-call agent (cost and latency)
const CORE = "You are Kestrel's on-call agent. Handle the incident by following the matching runbook step by step with your tools. " +
  "Do not take an action the runbook rules out. Make independent tool calls together in one turn. Write one incident_note at the end, then finish with a two-sentence summary.";
const HOT = ["search_catalog", "load", "incident_note"];

// Record each response's input_tokens without disturbing the page's own onResponse hook.
function meter(s) {
  const seen = [], prev = s.onResponse;
  s.onResponse = (d) => { seen.push(d.usage?.input_tokens || 0); prev?.(d); };
  return { seen, stop: () => { s.onResponse = prev; } };
}

async function progressive(s, E, backend, index) {
  const active = new Set(HOT), loadedRunbooks = [], calls = [], perTurn = [];
  const meta = {
    search_catalog: { description: "Search the catalogue of Kestrel runbooks and on-call tools. Returns up to 5 matches as {id, kind, summary}. Nothing is loaded by searching.",
      input_schema: { type: "object", properties: { query: { type: "string" } }, required: ["query"] },
      run: ({ query }) => index.search(query, 5) },
    load: { description: "Load catalogue entries by id. A runbook id (e.g. RB-03) returns the runbook's full text and makes the tools it names available from your next turn. A tool name makes that tool available.",
      input_schema: { type: "object", properties: { ids: { type: "array", items: { type: "string" } } }, required: ["ids"] },
      run: ({ ids = [] }) => {
        const out = { runbooks: [], tools_now_available: [] };
        for (const id of ids) {
          const rb = RUNBOOKS.find((r) => r.id === id);
          if (rb) { loadedRunbooks.push(rb.id); out.runbooks.push(rb.text); rb.tools.forEach((t) => active.add(t)); }
          else if (backend.tools[id]) active.add(id);
          else out.runbooks.push(`No catalogue entry ${id}`);
        }
        out.tools_now_available = [...active].filter((t) => !HOT.includes(t));
        return out;
      } },
  };
  const all = { ...backend.tools, ...meta };
  const messages = [{ role: "user", content: INCIDENT }];
  s.agent?.({ event: "start", label: "" });
  let resp, turn;
  for (turn = 1; turn <= 9; turn++) {
    const defs = [...active].map((n) => ({ name: n, description: all[n].description, input_schema: all[n].input_schema }));
    s.log(`Turn ${turn}: POST /v1/messages · model ${E.MODEL} · ${messages.length} message${messages.length > 1 ? "s" : ""} · ${defs.length} tool definitions`, "turn");
    await s.step("call");
    resp = await E.callClaude(s, { system: `${CORE}\nFind the runbook for the incident with search_catalog, load it, then load any other tool you need.`, messages, tools: defs, max_tokens: 1500 });
    perTurn.push({ defs: defs.length, input: resp.usage?.input_tokens || 0 });
    messages.push({ role: "assistant", content: resp.content });
    const uses = resp.content.filter((b) => b.type === "tool_use");
    const said = E.textOf(resp.content).trim();
    if (said && resp.stop_reason === "tool_use") s.log(`  Claude: ${E.short(said, 160)}`, "text");
    await s.step("check");
    const t = { label: "", turn, stop_reason: resp.stop_reason, tools: uses.map((u) => ({ name: u.name, input: u.input })), text: said };
    s.trace.push(t); s.agent?.({ event: "turn", ...t });
    if (resp.stop_reason !== "tool_use") { await s.step("stop"); s.log(`  stop_reason: ${resp.stop_reason} -> STOP: Claude has finished`, "stop"); break; }
    s.log(`  stop_reason: tool_use -> CONTINUE: run the tool${uses.length > 1 ? "s" : ""}, append the result${uses.length > 1 ? "s" : ""}, call Claude again`, "stop");
    const results = [];
    for (const [i, u] of uses.entries()) {
      s.log(`  -> ${u.name}(${E.short(u.input, 120)})`, "call");
      await s.step("tool");
      let out;
      try { out = active.has(u.name) ? await all[u.name].run(u.input) : { isError: true, message: `${u.name} is not loaded. Load it first.` }; }
      catch (e) { out = { isError: true, message: String(e.message || e) }; }
      const isError = !!(out && out.isError);
      s.log(`  <- ${isError ? "!! error: " : "result: "}${E.short(out, 150)}`, isError ? "error" : "result");
      calls.push({ name: u.name, input: u.input, result: out, isError, turn });
      Object.assign(t.tools[i], { result: out, isError });
      s.agent?.({ event: "tool", label: "", name: u.name, input: u.input, result: out, isError });
      results.push({ type: "tool_result", tool_use_id: u.id, content: JSON.stringify(out), ...(isError ? { is_error: true } : {}) });
    }
    await s.step("append");
    messages.push({ role: "user", content: results });
  }
  const text = E.textOf(resp?.content);
  if (text.trim()) s.log(`Reply: ${E.short(text, 600)}`, "reply");
  s.agent?.({ event: "end", label: "", stop_reason: resp?.stop_reason, turns: Math.min(turn, 9), calls: calls.length, denied: 0 });
  return { text, calls, perTurn, loadedRunbooks, turns: Math.min(turn, 9) };
}

const acted = (calls) => ({
  disabled: calls.some((c) => (c.name === "flag_disable" || (c.name === "flag_set_rollout" && Number(c.input.percent) === 0)) && c.input.flag === "checkout.new-tax-engine" && !c.isError),
  rolledBack: calls.some((c) => c.name === "deploy_rollback"),
  noted: calls.some((c) => c.name === "incident_note" && !c.isError),
});

export default {
  id: 19,
  see: "Phase 1 (monolithic): every request carries all 40 tool definitions and all 24 runbooks, well over the 5,000-token budget on every turn, though the incident needs one runbook and four tools. Phase 2 (progressive): the first request carries three tool definitions; Claude searches the index, loads RB-17, which brings flag_history, flag_disable and metrics_query, and disables the flag without a rollback. Compare the input tokens per request and the actions taken.",
  try: "In d3b-oncall.js, duplicate SPEC three times with new names to simulate next quarter's 120 tools. Phase 1's tokens per request roughly triple; Phase 2's do not move, because the index search returns 5 lines whatever the catalogue size. Then search for something no description mentions (rename RB-17's title): the cost of progressive discovery is a search miss, so names and descriptions become load-bearing.",
  explain: "Everything in the request competes for Claude's attention and is paid for on every turn. A monolithic context grows with the catalogue: 40 tools and 24 runbooks are sent on each of the incident's turns although only RB-17 and four tools matter, and Anthropic's tool-search guidance notes that selection gets harder as tool counts climb past roughly 30 to 50. Progressive discovery keeps a small hot set loaded and lets the agent search a one-line index and load only what the task needs, so the request stays near the same size as the catalogue grows. It costs a search turn or two, and a capability that the search never surfaces is invisible, so descriptions must be precise. The Claude API's tool search tool (defer_loading) and Agent Skills (name and description loaded up front, body on demand) are the platform's versions of the same split.",
  scene: {
    title: "INC-5531: checkout 5xx after a flag rollout. What goes in context?",
    caption: "Both phases handle the same incident with the same backend. Only the context strategy differs: everything up front, or a hot set plus search and load.",
    lanes: [
      { key: "p1", label: "Phase 1 · monolithic context", sub: "40 tool definitions + 24 runbooks in every request", tone: "trap", on: /Phase 1/, stages: [
        { id: "a_inc", icon: "🚨", t: "INC-5531", s: "5xx 7.1% after flag change at 06:10" },
        { id: "a_ctx", icon: "📚", t: "Everything up front", s: "40 tools, 24 runbooks, every turn", diff: true },
        { id: "a_agent", icon: "🤖", t: "On-call agent", s: "follows the matching runbook", claude: true },
        { id: "a_act", icon: "🛠", t: "Action taken", s: "flag kill switch, or a rollback?", tools: ["flag_history", "flag_disable", "deploy_rollback", "metrics_query"] },
        { id: "a_out", icon: "📊", t: "Tokens and outcome", s: "want: under 5,000 per request, flag off", out: true } ] },
      { key: "p2", label: "Phase 2 · progressive discovery", sub: "hot set of 3 tools; search, then load", tone: "fix", on: /Phase 2/, stages: [
        { id: "b_inc", icon: "🚨", t: "INC-5531", s: "the same incident" },
        { id: "b_ctx", icon: "🔎", t: "Index + search + load", s: "loads RB-17 and the tools it names", tools: ["search_catalog", "load"], diff: true },
        { id: "b_agent", icon: "🤖", t: "On-call agent", s: "follows the loaded runbook", claude: true },
        { id: "b_act", icon: "🛠", t: "Action taken", s: "flag kill switch, or a rollback?", tools: ["flag_history", "flag_disable", "deploy_rollback", "metrics_query"] },
        { id: "b_out", icon: "📊", t: "Tokens and outcome", s: "want: under 5,000 per request, flag off", out: true } ] },
    ],
  },
  slide: {
    title: "A hot set up front, the long tail on demand",
    code: `HOT = ["search_catalog", "load", "incident_note"]      # KEY 1
active = set(HOT)

def search_catalog(query):            # one line per runbook and tool
    return index.search(query, k=5)                     # KEY 2

def load(ids):
    for rb in runbooks(ids):
        active.update(rb.tools)       # a runbook brings its tools
    return [rb.text for rb in runbooks(ids)]            # KEY 3

while True:
    tools = [DEFS[name] for name in active]             # KEY 4
    resp = client.messages.create(model="claude-haiku-5-5",
        system=CORE, messages=messages, tools=tools, max_tokens=1500)
    ...`,
    keys: [["1", "A small hot set", "Tools every incident uses stay loaded; the rest wait."],
           ["2", "Search a one-line index", "Five short matches, whatever the catalogue size."],
           ["3", "Load only what is needed", "The runbook's text and the tools it names."],
           ["4", "The request grows on demand", "Definitions join the call only once loaded."]],
  },
  async run(s, E) {
    s.log(`Incident: ${INCIDENT}`, "note");
    s.log(`Per-request budget for the on-call agent: ${BUDGET.toLocaleString("en-GB")} input tokens`, "note");

    // ---- Phase 1: monolithic
    s.log("== Phase 1 · monolithic: all 40 tool definitions and all 24 runbooks in every request", "note");
    s.show("a_inc", "checkout 5xx 7.1% since 06:12", "done");
    const b1 = makeBackend();
    s.show("a_ctx", `${Object.keys(b1.tools).length} tools + ${RUNBOOKS.length} runbooks in every call`, "done");
    const m1 = meter(s);
    const tools1 = Object.fromEntries(Object.entries(b1.tools).map(([n, t]) => [n, { description: t.description, input_schema: t.input_schema, run: t.run }]));
    const r1 = await E.runAgent(s, { system: `${CORE}\n\nRunbook library:\n\n${LIBRARY_TEXT}`, prompt: INCIDENT, tools: tools1, maxTurns: 7, max_tokens: 1500 });
    m1.stop();
    const tok1 = m1.seen, sum1 = tok1.reduce((a, b) => a + b, 0), max1 = Math.max(...tok1);
    const act1 = acted(r1.calls);
    s.show("a_act", act1.disabled ? `flag_disable${act1.rolledBack ? " + deploy_rollback" : ", no rollback"}` : act1.rolledBack ? "deploy_rollback" : "no fix applied", "done");
    s.show("a_out", `${Math.round(sum1 / tok1.length).toLocaleString("en-GB")} tokens per request (budget ${BUDGET.toLocaleString("en-GB")})`, "bad");

    await s.pause({
      title: "Phase 1 finished: everything in context, every turn",
      outcome: `${tok1.length} requests, **${sum1.toLocaleString("en-GB")} input tokens** in all, **${Math.round(sum1 / tok1.length).toLocaleString("en-GB")} per request** against a budget of ${BUDGET.toLocaleString("en-GB")}. Each carried 40 tool definitions and 24 runbooks; the incident used ${new Set(r1.calls.map((c) => c.name)).size} tools and one runbook. Action: ${act1.disabled ? "flag disabled" : "flag not disabled"}${act1.rolledBack ? ", deploy rolled back" : ", no rollback"}.`,
      next: "Phase 2: a hot set of three tools, then search the index and load only what the incident needs",
    });

    // ---- Phase 2: progressive discovery
    s.log("== Phase 2 · progressive discovery: hot set (search_catalog, load, incident_note), load the rest on demand", "note");
    s.show("b_inc", "checkout 5xx 7.1% since 06:12", "done");
    const b2 = makeBackend();
    const index = catalogIndex(b2.tools);
    s.log(`  index: ${index.size} one-line entries (24 runbooks, 40 tools), searched in code, not sent to Claude`, "note");
    const p2 = await progressive(s, E, b2, index);
    const tok2 = p2.perTurn.map((t) => t.input), sum2 = tok2.reduce((a, b) => a + b, 0), max2 = Math.max(...tok2), maxDefs2 = Math.max(...p2.perTurn.map((t) => t.defs));
    const act2 = acted(p2.calls);
    const searched = p2.calls.some((c) => c.name === "search_catalog");
    s.show("b_ctx", `searched; loaded ${p2.loadedRunbooks.join(", ") || "no runbook"}; peak ${maxDefs2} tool defs`, "done");
    s.show("b_act", act2.disabled ? `flag_disable${act2.rolledBack ? " + deploy_rollback" : ", no rollback"}` : act2.rolledBack ? "deploy_rollback" : "no fix applied", "done");
    const good2 = max2 <= BUDGET && act2.disabled && !act2.rolledBack;
    s.show("b_out", `${Math.round(sum2 / tok2.length).toLocaleString("en-GB")} tokens per request, peak ${max2.toLocaleString("en-GB")}; ${act2.disabled && !act2.rolledBack ? "flag off" : "wrong action"}`, good2 ? "good" : "bad");

    const fmt = (n) => n.toLocaleString("en-GB");
    const seq = (calls) => calls.map((c) => c.name).join(" → ") || "none";
    return {
      final: p2.text,
      compare: {
        cols: [
          { title: "Phase 1: monolithic context", short: "Monolithic", tone: "trap", said: r1.text,
            verdict: `${tok1.length} requests at **${fmt(Math.round(sum1 / tok1.length))} input tokens each** (budget ${fmt(BUDGET)}), ${fmt(sum1)} in all. ${act1.disabled && !act1.rolledBack ? "It took the right action this time; the cost is in what every request carries, and it grows with the catalogue." : act1.rolledBack ? "It also **rolled back the deploy**, which RB-17 rules out." : "It did not disable the flag."}` },
          { title: "Phase 2: progressive discovery", short: "Progressive", tone: "fix", said: p2.text,
            verdict: `${tok2.length} requests at **${fmt(Math.round(sum2 / tok2.length))} input tokens each** (peak ${fmt(max2)}), ${fmt(sum2)} in all. Loaded ${p2.loadedRunbooks.join(", ") || "no runbook"} and at most ${maxDefs2} tool definitions. ${act2.disabled && !act2.rolledBack ? "**Disabled checkout.new-tax-engine, no rollback**, as RB-17 says." : "Read the live output: Claude writes each run fresh."}` },
        ],
        rows: [
          ["Tool definitions per request", "40", { v: `${Math.min(...p2.perTurn.map((t) => t.defs))} at first, peak ${maxDefs2}`, tone: "good" }],
          ["Runbooks in context", "all 24, every request", { v: `${p2.loadedRunbooks.join(", ") || "none"}, once loaded`, tone: "good" }],
          ["Requests (turns)", String(tok1.length), String(tok2.length)],
          ["Input tokens per request (avg / peak)", { v: `${fmt(Math.round(sum1 / tok1.length))} / ${fmt(max1)}`, tone: max1 > BUDGET ? "bad" : "good" }, { v: `${fmt(Math.round(sum2 / tok2.length))} / ${fmt(max2)}`, tone: max2 > BUDGET ? "bad" : "good" }],
          ["Input tokens, whole incident", { v: fmt(sum1), tone: "bad" }, { v: `${fmt(sum2)} (${Math.round(100 * sum2 / sum1)}%)`, tone: sum2 < sum1 ? "good" : "bad" }],
          ["Tool calls", seq(r1.calls), seq(p2.calls)],
          ["Flag disabled, no rollback (RB-17)", { v: act1.disabled && !act1.rolledBack ? "yes" : "no", tone: act1.disabled && !act1.rolledBack ? "good" : "bad" }, { v: act2.disabled && !act2.rolledBack ? "yes" : "no", tone: act2.disabled && !act2.rolledBack ? "good" : "bad" }],
        ],
        note: "At next quarter's 120 tools, Phase 1 would send 120 definitions on every request, while Phase 2 would still start with 3 and load the same handful. Progressive discovery pays for that with a search turn or two and the risk of a search miss, so names and descriptions must be precise.",
      },
      checks: [
        E.check(`Phase 1: every request carried all 40 tool definitions and 24 runbooks, over the ${fmt(BUDGET)}-token budget`, tok1.length > 0 && tok1.every((t) => t > BUDGET)),
        E.check("Phase 2: Claude searched the index and loaded RB-17, with at most 10 tool definitions in any request", searched && p2.loadedRunbooks.includes("RB-17") && maxDefs2 <= 10),
        E.check(`Phase 2: every request stayed within the ${fmt(BUDGET)}-token budget, and the incident used under half of Phase 1's input tokens`, max2 <= BUDGET && sum2 < sum1 / 2),
        E.check("Phase 2: flag_disable ran on checkout.new-tax-engine and deploy_rollback did not run", act2.disabled && !act2.rolledBack),
      ],
    };
  },
};
