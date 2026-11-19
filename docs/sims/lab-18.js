// Lab 18 · Task 3.7 · Simulator 6 (Kestrel Platform Team): pick the integration mechanism by who reuses it.
// Two Kestrel agents (the CI release gate and the on-call agent) need the same shared internal service: the release
// calendar, which records change freezes. Phase 1 is the common starting point: each team built its own client,
// a generic HTTP tool plus its own copy of the API notes and its own credential. Phase 2 connects both agents to ONE
// release-calendar MCP server: the same typed tool for every host, with the credential held by the server.
// Same two tasks, same moment (2026-11-19 06:30 UTC). Only the integration mechanism changes.
import { NOW, releaseApi, releaseCalendarMcp, mcpTools, CREDENTIAL } from "./shared/d3b-kestrel.js";

const TASKS = {
  ci: { label: "CI release gate", task: `PR #482 on kestrel/checkout-service passed CI. May it deploy to prod now (${NOW})? Start your reply with DEPLOY or HOLD, then give the reason in one or two sentences.` },
  oc: { label: "On-call agent", task: `A hotfix for kestrel/checkout-service is ready. Is prod in a change freeze now (${NOW})? If it is, give the freeze id and who can approve an exception, in two sentences.` },
};

// Phase 1: what each team wrote into its own agent. Two copies of the same integration, made months apart.
const NOTES = {
  ci: "Release calendar integration (CI team, written June 2026): to check for a deploy freeze, call call_release_api with method POST, path /v1/freeze-check, " +
      "header X-Api-Key: rk_ci_4f9a2c, body {\"service\": \"<name>\", \"environment\": \"prod\"}. frozen: false means clear to deploy.",
  oc: "Release calendar integration (on-call team, written November 2026): call call_release_api with method POST, path /v2/freezes/check, " +
      "header Authorization: Bearer pat_dlee_88c1 (Dana's token until we get a service account), body {\"service\": \"<name>\", \"env\": \"prod\", \"at\": \"<ISO time>\"}.",
};
const HTTP_TOOL = {
  call_release_api: {
    description: "Send an HTTP request to Kestrel's release-calendar REST API at https://relcal.kestrel.internal. Returns the JSON response with its status.",
    input_schema: { type: "object", properties: {
      method: { type: "string" }, path: { type: "string" },
      headers: { type: "object", additionalProperties: { type: "string" } },
      body: { type: "object" } }, required: ["method", "path"] },
    run: (input) => { const r = releaseApi(input); return r.status >= 400 ? { isError: true, ...r } : r; },
  },
};
const BASE = "You are a Kestrel Software platform agent. Use your tools to check facts; do not guess. Be brief.";

async function runBoth(s, E, mode) {
  const out = {};
  for (const k of ["ci", "oc"]) {
    const system = mode === "bespoke" ? `${BASE}\n\n${NOTES[k]}` : `${BASE}\n\nThe release-calendar MCP server is connected: use its tools for change freezes.`;
    const tools = mode === "bespoke" ? HTTP_TOOL : mcpTools(releaseCalendarMcp);
    const run = await E.runAgent(s, { label: TASKS[k].label, system, prompt: TASKS[k].task, tools, maxTurns: 4, max_tokens: 1024 });
    const leaked = [system, ...run.calls.map((c) => JSON.stringify(c.input))].filter((x) => CREDENTIAL.test(x)).map((x) => x.match(CREDENTIAL)[0]);
    const seen = run.calls.filter((c) => !c.isError).map((c) => c.result);
    out[k] = { run, system, toolNames: Object.keys(tools), leaked: [...new Set(leaked)],
      paths: [...new Set(run.calls.map((c) => c.input.path || c.name))],
      sawFreeze: seen.some((r) => r && r.frozen === true && r.freeze_id === "FRZ-118"),
      sawClear: seen.some((r) => r && r.frozen === false),
      named: /FRZ-118/.test(run.text), hold: /^\W*HOLD/i.test(run.text.trim()), deploy: /^\W*DEPLOY/i.test(run.text.trim()) };
  }
  return out;
}

export default {
  id: 18,
  see: "Phase 1 (each team's own client): the CI gate follows its June notes to /v1/freeze-check, which still answers from a calendar copy last synced on 31 Oct, gets frozen: false and says DEPLOY into the FRZ-118 freeze. The on-call agent follows its November notes to /v2 and finds FRZ-118. Two agents, one service, opposite answers, and two credentials (a team key and an engineer's personal token) sitting in prompts and tool inputs. Phase 2 (one MCP server): both agents call the same mcp__release-calendar__check_freeze tool, both find FRZ-118, and no credential reaches either model.",
  try: "Add a third consumer to TASKS in this lab's code, for example a release-notes agent. In Phase 1 it needs its own NOTES entry, its own key and its own copy of the request shape; in Phase 2 it needs nothing new, because tools/list already describes check_freeze to every host. That difference, N bespoke clients against one server, is the MCP argument.",
  explain: "Choose the mechanism by who owns each side and who reuses it. A shared internal service that many AI hosts call (CI agents, the on-call agent, 40 engineers' Claude Code sessions) is what MCP is for: write the server once, every host discovers the same typed tools through tools/list, and the credential stays in the server. Hand-built clients drift: each copy encodes the API as it was when that team wrote it, so one still calls a retired endpoint and gets a stale answer that looks valid. A direct API or CLI call is still right for a one-off scripted step that one pipeline owns, such as tagging a release with an existing CLI. An agent-to-agent protocol fits when you hand a whole goal to another team's autonomous agent whose tools you cannot see. A freeze check is neither: it is a typed function call many hosts share.",
  scene: {
    title: "Two Kestrel agents ask the release calendar: is checkout-service frozen?",
    caption: "Both phases run the same two agents on the same tasks at 2026-11-19 06:30 UTC. Only how they connect to the release-calendar service differs.",
    lanes: [
      { key: "p1", label: "Phase 1 · each team's own client", sub: "generic HTTP tool + its own API notes and key", tone: "trap", on: /Phase 1/, stages: [
        { id: "a_ci", icon: "🤖", t: "CI release gate", s: "notes from June: /v1, team API key", claude: /CI/ },
        { id: "a_oc", icon: "🤖", t: "On-call agent", s: "notes from November: /v2, personal token", claude: /On-call/ },
        { id: "a_conn", icon: "🔧", t: "Two hand-built clients", s: "call_release_api, credentials in prompts", tools: ["call_release_api"], diff: true },
        { id: "a_svc", icon: "🗓", t: "Release-calendar service", s: "v1 legacy copy · v2 live calendar" },
        { id: "a_out", icon: "🚦", t: "Both see FRZ-118?", s: "want: both HOLD, no credential in context", out: true } ] },
      { key: "p2", label: "Phase 2 · one MCP server for every host", sub: "typed tools from tools/list, server-held credential", tone: "fix", on: /Phase 2/, stages: [
        { id: "b_ci", icon: "🤖", t: "CI release gate", s: "the same task", claude: /CI/ },
        { id: "b_oc", icon: "🤖", t: "On-call agent", s: "the same task", claude: /On-call/ },
        { id: "b_conn", icon: "🔌", t: "release-calendar MCP server", s: "check_freeze, registered in .mcp.json", tools: ["mcp__release-calendar__check_freeze"], diff: true },
        { id: "b_svc", icon: "🗓", t: "Release-calendar service", s: "v2 only, called by the server" },
        { id: "b_out", icon: "🚦", t: "Both see FRZ-118?", s: "want: both HOLD, no credential in context", out: true } ] },
    ],
  },
  slide: {
    title: "A shared service many hosts use: one MCP server",
    code: `# .mcp.json, committed once, read by every host           # KEY 1
{ "mcpServers": { "release-calendar": {
    "type": "http",
    "url": "https://mcp.kestrel.internal/release-calendar" } } }

# the server, written once by the platform team
@mcp.tool()                                                # KEY 2
def check_freeze(service: str, env: Literal["prod", "staging"],
                 at: datetime) -> Freeze:
    token = vault.get("relcal-service-token")              # KEY 3
    return relcal.v2.check(service, env, at, token=token)

# one-off scripted step one pipeline owns: call the CLI     # KEY 4
#   kestrelctl release tag checkout-service v4.12.0
# another team's autonomous agent: send it a task over A2A`,
    keys: [["1", "One server, every host", "CI agents and 40 Claude Code sessions read one .mcp.json."],
           ["2", "Typed tool from tools/list", "Every host sees the same schema; no hand-built copies."],
           ["3", "Credential stays server-side", "No team key or personal token in any prompt."],
           ["4", "CLI or A2A elsewhere", "CLI for an owned one-off step; A2A for a foreign agent."]],
  },
  async run(s, E) {
    s.log(`Kestrel · ${NOW} · two agents need the release calendar for kestrel/checkout-service in prod`, "note");

    s.log("== Phase 1 · each team's own client: a generic HTTP tool plus that team's API notes and credential", "note");
    const p1 = await runBoth(s, E, "bespoke");
    const show = (x, p, tone) => {
      s.show(`${x}_ci`, p.ci.sawFreeze ? (p.ci.hold ? "HOLD: FRZ-118" : "saw FRZ-118") : p.ci.sawClear ? (p.ci.deploy ? "DEPLOY: told frozen: false" : "told frozen: false") : "no answer from the service", "done");
      s.show(`${x}_oc`, p.oc.sawFreeze ? "found FRZ-118" : p.oc.sawClear ? "told frozen: false" : "no answer from the service", "done");
      s.show(`${x}_conn`, tone === "bespoke" ? `${new Set([...p.ci.paths, ...p.oc.paths]).size} request shapes, ${p.ci.leaked.length + p.oc.leaked.length} credentials in context` : `1 tool for both, ${p.ci.leaked.length + p.oc.leaked.length} credentials in context`, "done");
      s.show(`${x}_svc`, [...new Set([...p.ci.paths, ...p.oc.paths])].join(" + "), "done");
      const good = p.ci.sawFreeze && p.oc.sawFreeze && !p.ci.leaked.length && !p.oc.leaked.length;
      s.show(`${x}_out`, good ? "both HOLD on FRZ-118; no credential in context" : `${p.ci.sawFreeze && p.oc.sawFreeze ? "both saw FRZ-118" : "the agents disagree"}${p.ci.leaked.length + p.oc.leaked.length ? "; keys in prompts" : ""}`, good ? "good" : "bad");
    };
    show("a", p1, "bespoke");
    await s.pause({
      title: "Phase 1 finished: each team's own client",
      outcome: `CI release gate called **${p1.ci.paths.join(", ")}** and was told ${p1.ci.sawFreeze ? "about FRZ-118" : "**frozen: false**"}${p1.ci.deploy ? ", so it said **DEPLOY**" : ""}. On-call agent called **${p1.oc.paths.join(", ")}** and ${p1.oc.sawFreeze ? "found **FRZ-118**" : "found no freeze"}. Credentials in prompts or tool inputs: **${[...p1.ci.leaked, ...p1.oc.leaked].join(", ") || "none"}**.`,
      next: "Phase 2: both agents connected to one release-calendar MCP server",
    });

    s.log("== Phase 2 · one release-calendar MCP server: the same typed tool for both agents, credential held by the server", "note");
    s.log(`  .mcp.json: ${JSON.stringify(releaseCalendarMcp.config)}`, "note");
    s.log(`  tools/list → ${releaseCalendarMcp.listTools().map((t) => t.name).join(", ")} (each host sees mcp__release-calendar__check_freeze)`, "note");
    const p2 = await runBoth(s, E, "mcp");
    show("b", p2, "mcp");

    const sameTool = p2.ci.toolNames.join() === p2.oc.toolNames.join() && E.called(p2.ci.run.calls, "mcp__release-calendar__check_freeze").length > 0 && E.called(p2.oc.run.calls, "mcp__release-calendar__check_freeze").length > 0;
    const leaks1 = [...p1.ci.leaked, ...p1.oc.leaked], leaks2 = [...p2.ci.leaked, ...p2.oc.leaked];
    const verdict = (p) => `CI: ${p.ci.sawFreeze ? "FRZ-118" : p.ci.sawClear ? "frozen: false" : "no answer"}${p.ci.deploy ? " → DEPLOY" : p.ci.hold ? " → HOLD" : ""} · on-call: ${p.oc.sawFreeze ? "FRZ-118" : p.oc.sawClear ? "frozen: false" : "no answer"}`;
    return {
      final: `CI release gate: ${p2.ci.run.text}\n\nOn-call agent: ${p2.oc.run.text}`,
      compare: {
        cols: [
          { title: "Phase 1: each team's own client", short: "Bespoke clients", tone: "trap", said: `CI release gate: ${p1.ci.run.text}\n\nOn-call agent: ${p1.oc.run.text}`,
            verdict: `${verdict(p1)}. ${!p1.ci.sawFreeze && p1.oc.sawFreeze ? "**Two agents, one service, opposite answers**: the CI client still calls the retired v1 endpoint, which answers from a stale copy and says nothing about it. " : ""}${leaks1.length ? `Credentials in context: ${leaks1.join(", ")}.` : ""}` },
          { title: "Phase 2: one release-calendar MCP server", short: "One MCP server", tone: "fix", said: `CI release gate: ${p2.ci.run.text}\n\nOn-call agent: ${p2.oc.run.text}`,
            verdict: p2.ci.sawFreeze && p2.oc.sawFreeze ? `${verdict(p2)}. Both agents called the **same typed tool** from tools/list; the server held the credential, so **no key reached either model**.` : `${verdict(p2)}. Read the live output: Claude writes each run fresh.` },
        ],
        rows: [
          ["Integration", "generic HTTP tool + each team's notes", { v: "mcp__release-calendar__check_freeze from tools/list", tone: "good" }],
          ["Endpoints actually called", { v: [...new Set([...p1.ci.paths, ...p1.oc.paths])].join(", "), tone: "bad" }, "the server calls /v2/freezes/check"],
          ["What each agent was told", { v: verdict(p1), tone: p1.ci.sawFreeze && p1.oc.sawFreeze ? "good" : "bad" }, { v: verdict(p2), tone: p2.ci.sawFreeze && p2.oc.sawFreeze ? "good" : "bad" }],
          ["Credentials in prompts or tool inputs", { v: leaks1.join(", ") || "none", tone: leaks1.length ? "bad" : "good" }, { v: leaks2.join(", ") || "none", tone: leaks2.length ? "bad" : "good" }],
          ["Cost of a third consumer", "another client, another key, another copy of the notes", { v: "add the server to its .mcp.json", tone: "good" }],
        ],
        note: "Not every integration should be an MCP server. A one-off scripted step that one pipeline owns can call an existing CLI or API directly; a whole task handed to another team's autonomous agent goes over an agent-to-agent protocol. A shared service that many AI hosts call is the MCP case.",
      },
      checks: [
        E.check("Phase 1: the two hand-built clients called different endpoints of the same service", new Set([...p1.ci.paths, ...p1.oc.paths]).size >= 2),
        E.check("Phase 1: the CI client read the retired v1 calendar (frozen: false) and its reply missed FRZ-118", p1.ci.paths.includes("/v1/freeze-check") && p1.ci.sawClear && !p1.ci.sawFreeze && !p1.ci.named),
        E.check("Phase 1: a credential travelled in a prompt or tool input", leaks1.length >= 1),
        E.check("Phase 2: both agents called the same MCP tool and got FRZ-118, with no credential in any prompt or tool input", sameTool && p2.ci.sawFreeze && p2.oc.sawFreeze && leaks2.length === 0),
        E.check("Phase 2: both replies name FRZ-118 and the CI gate says HOLD", p2.ci.named && p2.oc.named && p2.ci.hold),
      ],
    };
  },
};
