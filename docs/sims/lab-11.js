// Lab 11 · Task 2.5 · Simulator 2 (official sample question 2): static prefix first, then cache it.
// Northwind's assistant sends the same 8,075-token instructions + policy pack on every request, then a short,
// varying staff question. Three layouts of the SAME two requests:
//   1. dynamic session header first, no caching (the design in the question): full price, every time;
//   2. cache_control switched on, but the dynamic header still sits in front: every request writes, none reads;
//   3. static prefix first with cache_control, dynamic content last: request 1 writes, request 2 reads.
import { INSTRUCTIONS, POLICY, REQUESTS, sessionHeader } from "./shared/d2-northwind.js";
import { usd, money, n0 } from "./shared/d2-pricing.js";

const STATIC = `${INSTRUCTIONS}\n\n${POLICY}`;
const MAX = 600;

// One request in a given layout. Returns usage, latency and the answer.
async function ask(s, E, layout, r, i) {
  const header = sessionHeader(r, new Date());
  const body = layout === "fix"
    ? { system: [{ type: "text", text: STATIC, cache_control: { type: "ephemeral" } }],                  // static prefix only
        messages: [{ role: "user", content: `${header}\n\n${r.question}` }] }                            // dynamic content last
    : { system: [{ type: "text", text: header },                                                         // dynamic content FIRST
                 { type: "text", text: STATIC, ...(layout === "cache" ? { cache_control: { type: "ephemeral" } } : {}) }],
        messages: [{ role: "user", content: r.question }] };
  const t0 = Date.now();
  const resp = await E.callClaude(s, { max_tokens: MAX, ...body });
  const ms = Date.now() - t0;
  const u = resp.usage || {};
  const text = E.textOf(resp.content).trim();
  s.log(`  Request ${i + 1} (${r.staff}, ${r.role}): input_tokens ${n0(u.input_tokens || 0)} · cache_creation_input_tokens ${n0(u.cache_creation_input_tokens || 0)} · cache_read_input_tokens ${n0(u.cache_read_input_tokens || 0)} · output ${u.output_tokens} · ${ms} ms · ${money(usd(u))}`, "result");
  s.log(`  Answer: ${E.short(text, 220)}`, "reply");
  return { u, ms, text, cost: usd(u), inCost: usd({ ...u, output_tokens: 0 }) };
}

async function phase(s, E, layout) {
  const out = [];
  for (const [i, r] of REQUESTS.entries()) out.push(await ask(s, E, layout, r, i));
  return out;
}

const read = (x) => x.u.cache_read_input_tokens || 0;
const wrote = (x) => x.u.cache_creation_input_tokens || 0;
const cites = (x, id) => new RegExp(id).test(x.text);

export default {
  id: 11,
  see: "Phase 1 (dynamic header first, no caching) pays for all 8,075 prefix tokens on both requests. Phase 2 switches caching on but leaves the header in front: both requests write the cache at 1.25x and neither reads it. Phase 3 puts the static prefix first with cache_control: request 1 writes it, request 2 reads about 8,000 tokens from cache at a tenth of the price, with only the short question billed at the full rate.",
  try: "Move sessionHeader() back into the system array in front of STATIC in Phase 3 (or add a timestamp to INSTRUCTIONS in sims/shared/d2-northwind.js) and run again: cache_read_input_tokens drops to 0, because a cache hit needs a byte-identical prefix. Then shorten the policy pack to a few hundred tokens: below Haiku's 512-token minimum nothing is cached and no error is raised.",
  explain: "Prompt caching reuses a prefix: the request is read in the order tools, then system, then messages, and the cache covers everything up to the block marked cache_control. A hit needs that prefix to be byte-identical to an earlier request. Put a timestamp, a staff name or a request id in front of the policy and every request has a new prefix, so switching caching on only adds a 25% write charge. Order the request most-stable-first, put the breakpoint on the last static block, and send the dynamic content after it: the first request writes the cache, and every request after it inside the 5-minute lifetime reads the 8,000 tokens at 0.1x the input price and starts answering sooner. Truncating the policy, picking the smallest model or moving the policy into examples would each change what the model knows; caching changes only what you pay and how long you wait.",
  scene: {
    title: "Northwind: 8,075 static tokens on every request. Who pays for them twice?",
    caption: "All three phases send the same two staff questions with the same 8,075-token instructions and policy pack. Only the order of the blocks and the cache breakpoint change.",
    lanes: [
      { key: "in", label: "Every request", sub: "the same static prefix, a different short question", stages: [
        { id: "prefix", icon: "📚", t: "8,075-token static prefix", s: "instructions + policy pack 2026-W47 (11 docs)" },
        { id: "header", icon: "🕒", t: "Session header", s: "timestamp, staff name, request id: changes" },
        { id: "qs", icon: "💬", t: "2 staff questions", s: "HR-03 leave · LEND-07 stress test" } ] },
      { key: "p1", label: "Phase 1 · dynamic first, no cache", sub: "the layout in the question", tone: "trap", on: /Phase 1/, stages: [
        { id: "a_order", icon: "🧱", t: "header → policy → question", s: "no cache_control anywhere", diff: true },
        { id: "a_r1", icon: "🤖", t: "Request 1", s: "Aisha Tan · annual leave", claude: true },
        { id: "a_r2", icon: "🤖", t: "Request 2", s: "Marcus Lee · stress test", claude: true },
        { id: "a_out", icon: "💲", t: "Prefix tokens billed", s: "want: read from cache on request 2", out: true } ] },
      { key: "p2", label: "Phase 2 · cache on, dynamic still first", sub: "cache_control on the policy, header in front", tone: "trap", on: /Phase 2/, stages: [
        { id: "b_order", icon: "🧱", t: "header → policy⚑ → question", s: "breakpoint after a block that changes", diff: true },
        { id: "b_r1", icon: "🤖", t: "Request 1", s: "Aisha Tan · annual leave", claude: true },
        { id: "b_r2", icon: "🤖", t: "Request 2", s: "Marcus Lee · stress test", claude: true },
        { id: "b_out", icon: "💲", t: "Prefix tokens billed", s: "want: read from cache on request 2", out: true } ] },
      { key: "p3", label: "Phase 3 · static first + caching", sub: "answer C: stable prefix, breakpoint, then dynamic", tone: "fix", on: /Phase 3/, stages: [
        { id: "c_order", icon: "🧱", t: "policy⚑ → header + question", s: "breakpoint on the last static block", diff: true },
        { id: "c_r1", icon: "🤖", t: "Request 1", s: "Aisha Tan · annual leave", claude: true },
        { id: "c_r2", icon: "🤖", t: "Request 2", s: "Marcus Lee · stress test", claude: true },
        { id: "c_out", icon: "💲", t: "Prefix tokens billed", s: "want: read from cache on request 2", out: true } ] },
    ],
  },
  slide: {
    title: "Static prefix first, breakpoint, then the dynamic part",
    code: `system = [{"type": "text",
           "text": INSTRUCTIONS + POLICY_PACK,       # KEY 1
           "cache_control": {"type": "ephemeral"}}]  # KEY 2

for req in requests:
    resp = client.messages.create(
        model="claude-haiku-5-5", max_tokens=600,
        system=system,                   # byte-identical every call
        messages=[{"role": "user",
                   "content": session_header(req)    # KEY 3
                              + req.question}])
    u = resp.usage                                   # KEY 4
    print(u.cache_creation_input_tokens,  # call 1: ~8,000 written
          u.cache_read_input_tokens,      # call 2: ~8,000 read
          u.input_tokens)                 # only the question`,
    keys: [["1", "Most stable content first", "Instructions and the 8,075-token pack lead."],
           ["2", "Breakpoint on the static end", "The cache covers everything up to this block."],
           ["3", "Dynamic content goes last", "Timestamp, staff and question after the breakpoint."],
           ["4", "Prove it in usage", "One write, then reads at 0.1x the input price."]],
  },
  async run(s, E) {
    s.log(`Northwind Policy Assistant: an ${n0(8075)}-token static prefix (instructions + policy pack 2026-W47) on every request, then a short staff question. Two requests per phase, a few seconds apart.`, "note");
    s.show("prefix", "8,075 tokens, identical every request", "done");
    s.show("header", "new timestamp + request id each call", "done");
    s.show("qs", "Aisha Tan (HR-03) · Marcus Lee (LEND-07)", "done");

    s.log("== Phase 1 · dynamic session header first, then the policy pack, no caching", "note");
    s.show("a_order", "header → policy → question, no cache", "done");
    const p1 = await phase(s, E, "plain");
    p1.forEach((x, i) => s.show(`a_r${i + 1}`, `${n0(x.u.input_tokens)} input tokens · ${x.ms} ms`, "done"));
    s.show("a_out", `${n0(p1[1].u.input_tokens)} full-price tokens on request 2`, "bad");
    await s.pause({
      title: "Phase 1 finished: dynamic first, no caching",
      outcome: `Both requests paid for the whole prefix: **${n0(p1[0].u.input_tokens)}** and **${n0(p1[1].u.input_tokens)}** input tokens at the full rate, cache_read_input_tokens 0. The policy pack did not change between them; the bill did not notice.`,
      next: "Phase 2: switch on cache_control, but leave the session header in front",
    });

    s.log("== Phase 2 · cache_control on the policy pack, but the dynamic header still comes first", "note");
    s.show("b_order", "header → policy⚑ → question", "done");
    const p2 = await phase(s, E, "cache");
    p2.forEach((x, i) => s.show(`b_r${i + 1}`, `wrote ${n0(wrote(x))} · read ${n0(read(x))} · ${x.ms} ms`, "done"));
    s.show("b_out", `request 2 wrote ${n0(wrote(p2[1]))} again at 1.25x`, "bad");
    await s.pause({
      title: "Phase 2 finished: caching on, dynamic content still first",
      outcome: `Each request **wrote** the cache (${n0(wrote(p2[0]))} and ${n0(wrote(p2[1]))} cache_creation_input_tokens) and **read nothing** (cache_read_input_tokens ${read(p2[0])} and ${read(p2[1])}). The breakpoint sits after a header that changes every call, so no two prefixes match, and each write costs 1.25x: ${money(p2[1].inCost)} of input on request 2 against ${money(p1[1].inCost)} with no cache at all.`,
      next: "Phase 3: the static prefix first with cache_control, the dynamic content after it",
    });

    s.log("== Phase 3 · static prefix first with cache_control, then the session header and question", "note");
    s.show("c_order", "policy⚑ → header + question", "done");
    const p3 = await phase(s, E, "fix");
    p3.forEach((x, i) => s.show(`c_r${i + 1}`, read(x) ? `read ${n0(read(x))} from cache · ${x.ms} ms` : `wrote ${n0(wrote(x))} · ${x.ms} ms`, "done"));
    if (read(p3[0])) s.log("  (Request 1 already read from cache: a run in the last 5 minutes wrote this same prefix. That is the cache working across runs.)", "note");
    const ok3 = read(p3[1]) >= 7500;
    s.show("c_out", ok3 ? `${n0(read(p3[1]))} read at 0.1x · ${n0(p3[1].u.input_tokens)} full price` : `request 2 read ${n0(read(p3[1]))}`, ok3 ? "good" : "bad");

    const perReq = (x) => money(x.inCost);
    const saving = 1 - p3[1].inCost / p1[1].inCost;
    s.log(`== Result: input cost of request 2 · no cache ${perReq(p1[1])} · cache with dynamic first ${perReq(p2[1])} · static first + cache ${perReq(p3[1])} (${Math.round(saving * 100)}% less than phase 1)`, "note");
    const per100k = (x) => money(x.inCost * 100000);
    const all = [...p1, ...p2, ...p3];
    const total = all.reduce((a, x) => a + x.cost, 0);
    s.log(`This run's true cost, counting cache writes at 1.25x and reads at 0.1x: ${money(total)}`, "note");

    const cell = (x) => `${n0(x.u.input_tokens)} / ${n0(wrote(x))} / ${n0(read(x))}`;
    return {
      final: p3.map((x, i) => `${REQUESTS[i].staff}: ${x.text}`).join("\n\n"),
      compare: {
        cols: [
          { title: "Phase 1: dynamic first, no caching", short: "No cache", tone: "trap", said: p1[1].text,
            verdict: `Both requests billed the full ${n0(p1[1].u.input_tokens)}-token prefix at the full input rate.` },
          { title: "Phase 2: caching on, dynamic still first", short: "Cache, wrong order", tone: "trap", said: p2[1].text,
            verdict: `Every request **wrote** the cache at 1.25x and none read it: the header in front makes every prefix new. Worse than no cache.` },
          { title: "Phase 3: static first + caching", short: "Static first + cache", tone: "fix", said: p3[1].text,
            verdict: ok3 ? `Request 2 **read ${n0(read(p3[1]))} tokens from cache** at 0.1x; only ${n0(p3[1].u.input_tokens)} tokens (the header and question) were billed at the full rate. Input cost ${Math.round(saving * 100)}% lower than phase 1.`
              : `Request 2 read ${n0(read(p3[1]))} tokens from cache. Read the usage lines in the log.` },
        ],
        rows: [
          ["Request 2: input / cache write / cache read tokens", cell(p1[1]), cell(p2[1]), { v: cell(p3[1]), tone: ok3 ? "good" : "bad" }],
          ["Request 2: input cost (Haiku 5.5)", perReq(p1[1]), { v: perReq(p2[1]), tone: "bad" }, { v: perReq(p3[1]), tone: "good" }],
          ["Input cost per 100,000 requests at that rate", per100k(p1[1]), per100k(p2[1]), per100k(p3[1])],
          ["Request 2: time to full response", `${p1[1].ms} ms`, `${p2[1].ms} ms`, `${p3[1].ms} ms`],
          ["Same instructions and policy reached Claude", "yes", "yes", "yes"],
        ],
        note: "Same two questions, same 8,075-token prefix, same model in all three phases. Caching does not change what Claude reads; it changes what you pay for reading it again. The latency gain grows with the prefix and shows best on long prompts and busy traffic; one pair of requests is a noisy measure.",
      },
      checks: [
        E.check("Phase 1: neither request read from the cache; each billed the full prefix (7,500+ input_tokens)", p1.every((x) => read(x) === 0 && x.u.input_tokens >= 7500)),
        E.check("Phase 2: with the dynamic header first, both requests wrote the cache and neither read it", p2.every((x) => wrote(x) >= 7500 && read(x) === 0)),
        E.check("Phase 3: request 2 read the static prefix from cache (7,500+ cache_read_input_tokens)", ok3),
        E.check("Phase 3: request 2 billed under 300 tokens at the full input rate (the header and question only)", p3[1].u.input_tokens < 300),
        E.check("Every answer cites its policy document (HR-03 for leave, LEND-07 for the stress test)", [p1, p2, p3].every((p) => cites(p[0], "HR-03") && cites(p[1], "LEND-07"))),
      ],
    };
  },
};
