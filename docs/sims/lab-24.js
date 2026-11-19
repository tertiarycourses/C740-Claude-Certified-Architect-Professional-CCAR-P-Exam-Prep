// Lab 24 · Task 4.5 · Simulator 1 (Harbour Mutual Claims Desk): cut tokens, latency and cost with quality held.
// Three claims, triaged twice by the same model. Phase 1 is today's design: each request re-sends the claim's whole
// email history, puts the policy wording AFTER the claim (so no two requests share a prefix) and asks for a long
// free-text analysis plus a letter. Phase 2 puts the static rules and policy first as a cached system block, sends only
// the claim fields the decision needs, and asks for a capped, schema-checked JSON decision. Quality is checked in code
// on both: the same three decisions and payouts.
import { ask, costOf, usd } from "./shared/d4-kit.js";
import { POLICY, RULES, CLAIMS, history, fields, DECISION_SCHEMA, SONNET, priceAt } from "./shared/d4-harbour.js";

const VERBOSE_ASK = "Start with one line exactly like: DECISION: approve|decline|escalate · PAYOUT: US$<amount>. " +
  "Then write a thorough analysis of this claim covering cover, excess, settlement, authority, exclusions, fraud indicators, " +
  "customer communication and next steps, and draft the full decision letter to the customer.";

const parseLine = (t) => {
  const d = t.match(/DECISION:\s*\**\s*(approve|decline|escalate)/i), p = t.match(/PAYOUT:\s*\**\s*(?:US)?\$?\s*([\d,]+(?:\.\d+)?)/i);
  return { decision: d ? d[1].toLowerCase() : null, payout: p ? Number(p[1].replace(/,/g, "")) : null };
};
const right = (c, r) => r && r.decision === c.gold.decision && Number(r.payout) === c.gold.payout;
const tot = (u) => (u.input_tokens || 0) + (u.cache_creation_input_tokens || 0) + (u.cache_read_input_tokens || 0);

function summary(rows) {
  const n = rows.length, sum = (f) => rows.reduce((a, r) => a + f(r), 0);
  return { inTok: Math.round(sum((r) => tot(r.usage)) / n), outTok: Math.round(sum((r) => r.usage.output_tokens || 0) / n),
    cacheRead: sum((r) => r.usage.cache_read_input_tokens || 0), ms: Math.round(sum((r) => r.ms) / n),
    cost: sum((r) => r.cost) / n, sonnet: sum((r) => priceAt(SONNET, r.usage)) / n, ok: rows.filter((r) => r.ok).length };
}

export default {
  id: 24,
  see: "Phase 1: about 2,600 input and over 3,000 output tokens per claim, more than ten seconds each, and the right three decisions (approve US$3,700, decline, approve US$650). Phase 2: the same three decisions as schema-valid JSON; claims 2 and 3 read the policy prefix from the cache (cache_read_input_tokens > 0), output drops by more than half, and cost and latency per claim both fall.",
  try: "In this lab's code, move POLICY from the system block into the user message after the claim fields and run again: cache_read_input_tokens drops to 0 and input cost rises, because the shared prefix is gone. Then raise max_tokens in phase 2 to 4096: the JSON stays short, because the schema, not the cap, sets its size.",
  explain: "Quality was never the problem: both designs decide all three claims correctly, so the change is judged on cost and latency with quality held, checked in code. Four things cut the bill. Static content first: the rules and policy wording are identical on every call, so they sit at the start as a system block marked cache_control, and later calls read them at a tenth of the input price. Only the fields that matter: the six-email history is mostly chatter and is dropped. Structured output: a JSON decision replaces an essay and a letter the desk did not need at triage time. A sensible cap: max_tokens bounds the worst case. Output tokens dominate both cost and latency, so the biggest saving is in what you ask Claude to write. The three claims are too few for a stable latency figure; the token counts are exact.",
  scene: {
    title: "Three claims, the same decisions: what does each one cost?",
    caption: "Same model, same policy, same three claims in both phases. Only the shape of the request changes.",
    lanes: [
      { key: "p1", label: "Phase 1 · today's request", sub: "history re-sent, policy after the claim, long free text", tone: "trap", on: /Phase 1/, stages: [
        { id: "a_req", icon: "📨", t: "Request per claim", s: "6-email history + claim + policy last", diff: true },
        { id: "a_bot", icon: "🤖", t: "Claims triage", s: "DECISION line + analysis essay + letter", claude: true },
        { id: "a_q", icon: "✅", t: "Quality check in code", s: "decision and payout vs gold" },
        { id: "a_out", icon: "💲", t: "Tokens, latency, cost", s: "want: lower cost and latency, same quality", out: true } ] },
      { key: "p2", label: "Phase 2 · optimised request", sub: "cached static prefix, fields only, JSON", tone: "fix", on: /Phase 2/, stages: [
        { id: "b_pre", icon: "🧊", t: "Cached static prefix", s: "rules + policy first, cache_control", diff: true },
        { id: "b_req", icon: "📨", t: "Claim fields only", s: "9 fields, no email history" },
        { id: "b_bot", icon: "🤖", t: "Claims triage", s: "JSON decision, max_tokens 1024", claude: true },
        { id: "b_q", icon: "✅", t: "Quality check in code", s: "schema + decision and payout vs gold" },
        { id: "b_out", icon: "💲", t: "Tokens, latency, cost", s: "want: lower cost and latency, same quality", out: true } ] },
    ],
  },
  slide: {
    title: "Static first and cached, send less, ask for less",
    code: `resp = client.messages.create(
  model="claude-haiku-5-5",
  max_tokens=1024,                              # KEY 4
  system=[{"type": "text",
           "text": RULES + POLICY_WORDING,      # KEY 1
           "cache_control": {"type": "ephemeral"}}],
  messages=[{"role": "user",
             "content": json.dumps(claim_fields)}],  # KEY 2
  output_config={"format": {"type": "json_schema",
                            "schema": DECISION}})   # KEY 3
u = resp.usage   # cache_read_input_tokens > 0 from call 2
assert eval_set_passes(new_design)              # quality held`,
    keys: [["1", "Static content first, cached", "Same prefix every call: reads cost 0.1x input."],
           ["2", "Send only what decides", "Claim fields, not the six-email history."],
           ["3", "Ask for a short JSON", "Output tokens drive cost and latency most."],
           ["4", "Cap the worst case", "max_tokens bounds a runaway answer."]],
  },
  async run(s, E) {
    s.log("Harbour Mutual Claims Desk · triage CLM-7781, CLM-7790, CLM-7802 · gold: approve US$3,700 · decline · approve US$650", "note");

    // Phase 1: today's request shape.
    s.log("== Phase 1 · today's request: full email history re-sent, policy wording after the claim, long free-text analysis and letter", "note");
    const p1 = [];
    for (const c of CLAIMS) {
      s.show("a_req", `${c.claim_id}: history + claim + policy`, "hot");
      const r = await ask(s, E, { label: `Verbose ${c.claim_id}`, system: RULES, max_tokens: 4096, quiet: true,
        prompt: `CLAIM HISTORY\n${history(c)}\n\nCLAIM\n${JSON.stringify(c, (k, v) => (k === "gold" ? undefined : v), 1)}\n\nPOLICY WORDING\n${POLICY}\n\n${VERBOSE_ASK}` });
      const d = parseLine(r.text);
      s.log(`      → ${c.claim_id}: ${d.decision || "?"} · US$${d.payout ?? "?"} (${r.text.split(/\s+/).length} words written)`, "reply");
      p1.push({ c, usage: r.usage, ms: r.ms, cost: r.cost, d, ok: right(c, d), stop: r.resp.stop_reason });
    }
    const a = summary(p1);
    s.show("a_req", `${a.inTok.toLocaleString("en")} input tokens/claim`, "done");
    s.show("a_bot", `${a.outTok.toLocaleString("en")} output tokens/claim`, "done");
    s.show("a_q", `${a.ok} of ${CLAIMS.length} decisions right`, a.ok === CLAIMS.length ? "done" : "done");
    s.show("a_out", `${usd(a.cost)} · ${(a.ms / 1000).toFixed(1)} s per claim`, "bad");
    s.log(`Phase 1 per claim: ${a.inTok} input / ${a.outTok} output tokens · ${a.ms} ms · ${usd(a.cost)} on Haiku 5.5 (${usd(a.sonnet, 4)} at Sonnet 5.5 prices) · quality ${a.ok}/${CLAIMS.length}`, "note");
    await s.pause({
      title: "Phase 1 finished: right decisions, expensive requests",
      outcome: `All **${a.ok} of ${CLAIMS.length}** decisions are right, at **${a.inTok.toLocaleString("en")} input and ${a.outTok.toLocaleString("en")} output tokens per claim**, ${(a.ms / 1000).toFixed(1)} s each. Nothing was cached: each request starts with a different email history, so no two share a prefix.`,
      next: "Phase 2: cached static prefix, claim fields only, capped JSON",
    });

    // Phase 2: static first and cached, fields only, short structured output. Sequential, so calls 2-3 can read the cache.
    s.log("== Phase 2 · optimised request: rules + policy as a cached system prefix, claim fields only, capped JSON decision", "note");
    const SYSTEM = [{ type: "text", text: `${RULES}\n\n${POLICY}`, cache_control: { type: "ephemeral" } }];
    s.show("b_pre", "rules + policy · cache_control: ephemeral", "done");
    const p2 = [];
    for (const c of CLAIMS) {
      s.show("b_req", `${c.claim_id}: ${Object.keys(fields(c)).length} fields`, "hot");
      const r = await ask(s, E, { label: `Optimised ${c.claim_id}`, system: SYSTEM, max_tokens: 1024,
        prompt: JSON.stringify(fields(c)), output_config: { format: { type: "json_schema", schema: DECISION_SCHEMA } } });
      const j = r.json;
      const d = j ? { decision: j.decision, payout: j.payout_usd } : null;
      p2.push({ c, usage: r.usage, ms: r.ms, cost: r.cost, d, j, ok: right(c, d), stop: r.resp.stop_reason, schemaOk: !!j && ["approve", "decline", "escalate"].includes(j.decision) && typeof j.payout_usd === "number" });
    }
    const b = summary(p2);
    s.show("b_req", `${b.inTok.toLocaleString("en")} input tokens/claim`, "done");
    s.show("b_bot", `${b.outTok} output tokens/claim`, "done");
    s.show("b_q", `${b.ok} of ${CLAIMS.length} right · ${p2.filter((r) => r.schemaOk).length} valid JSON`, "done");
    const cheaper = b.cost < a.cost, faster = b.ms < a.ms;
    s.show("b_out", `${usd(b.cost)} · ${(b.ms / 1000).toFixed(1)} s per claim`, cheaper && faster && b.ok === CLAIMS.length ? "good" : "bad");
    s.log(`Phase 2 per claim: ${b.inTok} input (cache reads ${b.cacheRead} in total) / ${b.outTok} output tokens · ${b.ms} ms · ${usd(b.cost)} on Haiku 5.5 (${usd(b.sonnet, 4)} at Sonnet 5.5 prices) · quality ${b.ok}/${CLAIMS.length}`, "note");
    s.log("Three claims give exact token counts but only a rough latency figure: measure p95 on a few hundred claims before committing to an SLA.", "note");

    const cutOut = 1 - b.outTok / a.outTok;
    const reads = p2.slice(1).every((r) => (r.usage.cache_read_input_tokens || 0) > 0);
    const pctx = (x) => `${Math.round(x * 100)}%`;
    return {
      final: p2.map((r) => `${r.c.claim_id}: ${r.j ? `${r.j.decision} US$${r.j.payout_usd} (${r.j.clause}) ${r.j.reason}` : "no JSON"}`).join("\n") +
        `\nPer claim: ${usd(a.cost)} → ${usd(b.cost)} on Haiku 5.5 (${usd(a.sonnet, 4)} → ${usd(b.sonnet, 4)} at Sonnet 5.5 prices), ${a.ms} → ${b.ms} ms, quality ${a.ok}/3 → ${b.ok}/3.`,
      compare: {
        cols: [
          { title: "Phase 1: history re-sent, policy last, essay", short: "Today", tone: "trap",
            verdict: `Right decisions (**${a.ok}/3**) at **${a.outTok.toLocaleString("en")} output tokens per claim** and no cache hits.` },
          { title: "Phase 2: cached prefix, fields only, JSON", short: "Optimised", tone: "fix",
            verdict: `Same quality (**${b.ok}/3**), output down **${pctx(cutOut)}**, cost per claim down **${pctx(1 - b.cost / a.cost)}**, latency down **${pctx(1 - b.ms / a.ms)}**.` },
        ],
        rows: [
          ["Decisions and payouts right (checked in code)", { v: `${a.ok} of 3`, tone: a.ok === 3 ? "good" : "bad" }, { v: `${b.ok} of 3`, tone: b.ok === 3 ? "good" : "bad" }],
          ["Input tokens per claim (incl. cached)", a.inTok.toLocaleString("en"), b.inTok.toLocaleString("en")],
          ["cache_read_input_tokens (claims 2-3)", { v: String(p1.slice(1).reduce((n, r) => n + (r.usage.cache_read_input_tokens || 0), 0)), tone: "bad" }, { v: String(p2.slice(1).reduce((n, r) => n + (r.usage.cache_read_input_tokens || 0), 0)), tone: reads ? "good" : "bad" }],
          ["Output tokens per claim", { v: a.outTok.toLocaleString("en"), tone: "bad" }, { v: String(b.outTok), tone: cutOut >= 0.5 ? "good" : "bad" }],
          ["Calls cut off at max_tokens", String(p1.filter((r) => r.stop === "max_tokens").length), String(p2.filter((r) => r.stop === "max_tokens").length)],
          ["Latency per claim (mean of 3)", `${(a.ms / 1000).toFixed(1)} s`, { v: `${(b.ms / 1000).toFixed(1)} s`, tone: faster ? "good" : "bad" }],
          ["Cost per claim, Haiku 5.5", usd(a.cost), { v: usd(b.cost), tone: cheaper ? "good" : "bad" }],
          ["Same tokens at Sonnet 5.5 list prices", usd(a.sonnet, 4), usd(b.sonnet, 4)],
        ],
        note: "Same model, same policy, same claims. Cost includes cache writes (1.25x input) and reads (0.1x). The page's running total counts only uncached input, so it reads slightly low for phase 2's first call.",
      },
      checks: [
        E.check("Phase 1: the verbose design decided all 3 claims correctly (quality was not the problem)", a.ok === CLAIMS.length),
        E.check("Phase 2: the same 3 decisions and payouts, each as schema-valid JSON", b.ok === CLAIMS.length && p2.every((r) => r.schemaOk)),
        E.check("Phase 2: claims 2 and 3 read the static prefix from the cache (cache_read_input_tokens > 0)", reads),
        E.check("Phase 2: output tokens per claim fell by at least half", cutOut >= 0.5),
        E.check("Phase 2: cost and mean latency per claim are both lower than phase 1", cheaper && faster),
      ],
    };
  },
};
