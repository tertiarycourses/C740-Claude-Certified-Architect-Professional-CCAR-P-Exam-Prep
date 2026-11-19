// Lab 17 · Task 3.6 · Simulator 2 (Northwind Policy Assistant): match the retrieval strategy to the data shape.
// A credit officer asks for today's 5-year fixed rate at 75% loan-to-value and whether an early repayment fee applies.
// Phase 1 sends every question through ONE text-similarity search over one index: prose sections and the rate tables
// flattened into text chunks, with no effective-date filter. The superseded prose rate sheet matches the words; the
// current table row ("5YF,60.01-80.00,3.95,...") matches none of them.
// Phase 2 routes by data shape: a structured lookup tool for the rate table (product code, loan-to-value, as-of date)
// and hybrid search over the prose policies, filtered to sections in force today.
import { flatIndexChunks, sectionChunks, bm25, hybrid, lookupRate, PRODUCT_CODES } from "./shared/d3b-northwind.js";

const TODAY = "2026-11-19";
const QUESTION = "A customer wants a 5-year fixed mortgage at 75% loan-to-value. What rate applies today, and is there an early repayment fee if they repay in year 2?";
const SYSTEM = `You are Northwind Bank's policy assistant for credit officers. Today is ${TODAY}. Answer only from the policy material you retrieve or are given, ` +
  "and name the document id and revision or section for each figure. If the material does not settle a point, say so. Answer in under 90 words.";

const says = (t, re) => re.test(String(t).replace(/\*/g, ""));

export default {
  id: 17,
  see: "Phase 1 (one similarity search over everything): the top 3 hits are the early repayment section, the superseded LEND-11 rate sheet (rev 2026-08, prose) and the loan-to-value section. The current rate row never comes back, so the answer quotes 4.35%, a rate that ended on 31 Oct. Phase 2 (routed by data shape): Claude calls lookup_rate for 5YF at 75% as of today and gets 3.95% from LEND-11 rev 2026-11, and calls search_policy for the fee rule and gets LEND-07 §8 (1.5% in years 1 and 2).",
  try: "Ask Phase 2 about a complaint instead: change QUESTION to \"A customer was quoted a 5-year fixed rate at 75% LTV on 10 September 2026. Which rate must we honour?\" The same lookup_rate tool with as_of 2026-09-10 returns 4.35% from the superseded sheet. That is why deleting old rate sheets is the wrong fix: the date filter, not deletion, picks the right revision.",
  explain: "Similarity search ranks passages by how much their words (or meaning) resemble the question. A rate table row is not a passage: its product code, band and number share no words with \"5-year fixed at 75%\", while the superseded prose sheet shares many. Bigger k, smaller chunks or a reranker still choose among text that resembles the question. Tables and identifiers want a structured lookup keyed on their columns, with the effective date as a filter; prose wants hybrid search (keyword plus semantic, fused by rank) with metadata filters. Exposing each as a clearly described tool lets Claude route each part of the question to the mechanism that can actually produce the answer.",
  scene: {
    title: "5-year fixed at 75% LTV: today's rate, and the early repayment fee",
    caption: "Both phases answer the same question from the same library. Only how retrieval is matched to the data's shape differs.",
    lanes: [
      { key: "p1", label: "Phase 1 · one similarity search for everything", sub: "tables flattened into text, no date filter", tone: "trap", on: /Phase 1/, stages: [
        { id: "a_q", icon: "👤", t: "Credit officer's question", s: "rate today + early repayment fee" },
        { id: "a_idx", icon: "🗂", t: "One text index", s: "prose + table rows as text, all revisions", diff: true },
        { id: "a_ret", icon: "🔎", t: "Top 3 by similarity", s: "which hits come back?" },
        { id: "a_claude", icon: "🤖", t: "Policy assistant", s: "answers from the 3 hits", claude: true },
        { id: "a_out", icon: "📄", t: "Rate and fee", s: "want: 3.95% (rev 2026-11) and a 1.5% fee", out: true } ] },
      { key: "p2", label: "Phase 2 · retrieval matched to data shape", sub: "lookup for the table, hybrid search for prose", tone: "fix", on: /Phase 2/, stages: [
        { id: "b_q", icon: "👤", t: "Credit officer's question", s: "the same question" },
        { id: "b_claude", icon: "🤖", t: "Policy assistant", s: "routes each part to a tool", claude: true },
        { id: "b_rate", icon: "🧮", t: "lookup_rate", s: "product code + LTV + as_of date", tools: ["lookup_rate"], diff: true },
        { id: "b_pol", icon: "🔎", t: "search_policy (hybrid)", s: "in force on today's date", tools: ["search_policy"], diff: true },
        { id: "b_out", icon: "📄", t: "Rate and fee", s: "want: 3.95% (rev 2026-11) and a 1.5% fee", out: true } ] },
    ],
  },
  slide: {
    title: "Route each question to the mechanism its data needs",
    code: `tools = [
  {"name": "lookup_rate",                                   # KEY 1
   "description": "Mortgage rate from the LEND-11 rate table. "
                  "Use for any rate figure.",
   "input_schema": {"type": "object", "properties": {
       "product_code": {"enum": ["2YF", "3YF", "5YF", "FLT"]},  # KEY 2
       "ltv_pct": {"type": "number"},
       "as_of": {"type": "string", "format": "date"}},          # KEY 3
     "required": ["product_code", "ltv_pct", "as_of"]}},
  {"name": "search_policy",                                 # KEY 4
   "description": "Hybrid (keyword + semantic) search of policy "
                  "text in force on effective_on. Rules, not rates.",
   "input_schema": {"type": "object", "properties": {
       "query": {"type": "string"}, "effective_on": {"type": "string"}},
     "required": ["query", "effective_on"]}}]`,
    keys: [["1", "Tables get a lookup", "A row is found by its keys, not by resembling the question."],
           ["2", "Identifiers are an enum", "The schema maps 5-year fixed to 5YF; search cannot."],
           ["3", "Effective date as a filter", "The right revision for today, or for an old quote."],
           ["4", "Prose gets hybrid search", "Keyword + semantic, fused by rank, filtered by date."]],
  },
  async run(s, E) {
    s.log(`Credit officer asks (today ${TODAY}): "${QUESTION}"`, "note");

    // ---- Phase 1: one similarity search over one flattened index
    s.log("== Phase 1 · one text-similarity search over everything (tables flattened, no date filter), top 3", "note");
    s.show("a_q", "5-year fixed, 75% LTV, year-2 repayment", "done");
    const flat = flatIndexChunks();
    s.show("a_idx", `${flat.length} text chunks, both LEND-11 revisions`, "done");
    const hits1 = bm25(flat).search(QUESTION, 3);
    for (const h of hits1) s.log(`  retrieved ${h.id} · rev ${h.rev} (score ${h.score}): "${E.short(h.text, 100)}"`, "result");
    const superseded = hits1.some((h) => h.doc === "LEND-11" && h.rev === "2026-08");
    const current = hits1.some((h) => h.doc === "LEND-11" && h.rev === "2026-11" && /5YF,60\.01-80\.00,3\.95/.test(h.text));
    s.show("a_ret", `${hits1.map((h) => `${h.id}${h.doc === "LEND-11" ? " rev " + h.rev : ""}`).join(", ")}`, "done");
    const ctx = hits1.map((h) => `[${h.title} · rev ${h.rev}]\n${h.text}`).join("\n\n");
    const r1 = await E.runAgent(s, { system: SYSTEM, max_tokens: 1024,
      messages: [{ role: "user", content: `Retrieved policy material:\n\n${ctx}\n\nQuestion: ${QUESTION}` }] });
    const a1 = r1.text;
    const old1 = says(a1, /4\.35\s?%/), right1 = says(a1, /3\.95\s?%/);
    s.show("a_out", right1 ? "3.95% (not from its hits)" : old1 ? "quoted 4.35%: the rate that ended 31 Oct" : "no current rate in its hits", right1 && !old1 ? "good" : "bad");

    await s.pause({
      title: "Phase 1 finished: one similarity search for everything",
      outcome: `The top 3 hits were **${hits1.map((h) => `${h.id} (rev ${h.rev})`).join(", ")}**. ${superseded ? "The superseded rate sheet (rev 2026-08, ended 31 Oct) matched the words of the question" : "No rate sheet came back"}; ${current ? "the current row came back too." : "**the current 5YF row never came back**: \"5YF,60.01-80.00,3.95\" shares no words with \"5-year fixed at 75%\"."} ${old1 ? "The answer quotes **4.35%**." : ""}`,
      next: "Phase 2: a lookup tool for the rate table and hybrid search for the prose",
    });

    // ---- Phase 2: route by data shape
    s.log("== Phase 2 · retrieval matched to data shape: lookup_rate for the table, search_policy (hybrid, in force today) for prose", "note");
    s.show("b_q", "5-year fixed, 75% LTV, year-2 repayment", "done");
    const prose = hybrid(sectionChunks());
    const tools = {
      lookup_rate: {
        description: `Look up a mortgage rate in the LEND-11 rate table by product code and loan-to-value, as in force on a date. Product codes: ${Object.entries(PRODUCT_CODES).map(([k, v]) => `${k} = ${v}`).join(", ")}. Use this for any rate figure; policy text search does not hold current rates.`,
        input_schema: { type: "object", properties: {
          product_code: { type: "string", enum: Object.keys(PRODUCT_CODES) },
          ltv_pct: { type: "number", description: "Loan-to-value in percent, e.g. 75" },
          as_of: { type: "string", description: "Date the rate must apply on, YYYY-MM-DD" } },
          required: ["product_code", "ltv_pct", "as_of"], additionalProperties: false },
        run: (i) => lookupRate(i),
      },
      search_policy: {
        description: "Hybrid search (keyword plus semantic, fused by rank) over the policy library's prose sections, returning only sections in force on effective_on. Use for rules, conditions, limits and fees. It does not return rate figures.",
        input_schema: { type: "object", properties: { query: { type: "string" }, effective_on: { type: "string", description: "YYYY-MM-DD" } },
          required: ["query", "effective_on"], additionalProperties: false },
        run: ({ query, effective_on }) => {
          const day = effective_on || TODAY;
          return prose.search(query, 3, (c) => c.doc !== "LEND-11" && c.effective <= day && (!c.expires || c.expires >= day))
            .map((c) => ({ id: c.id, title: c.title, rev: c.rev, effective: c.effective, text: c.text.split("\n").slice(1).join(" ") }));
        },
      },
    };
    const r2 = await E.runAgent(s, { system: SYSTEM, prompt: QUESTION, tools, maxTurns: 5, max_tokens: 1500 });
    const rates = E.called(r2.calls, "lookup_rate"), pols = E.called(r2.calls, "search_policy");
    const goodRate = rates.find((c) => !c.isError && c.result.product_code === "5YF" && c.result.rate_pct === "3.95");
    const gotFee = pols.some((c) => Array.isArray(c.result) && c.result.some((x) => x.id === "LEND-07§8"));
    const a2 = r2.text;
    const ok2 = says(a2, /3\.95\s?%/) && says(a2, /1\.5\s?%/) && !says(a2, /4\.35/);
    s.show("b_claude", `${r2.calls.length} tool call${r2.calls.length === 1 ? "" : "s"} in ${r2.turns} turns`, "done");
    s.show("b_rate", goodRate ? `5YF @ ${goodRate.input.ltv_pct}%: ${goodRate.result.rate_pct}% (${goodRate.result.source})` : rates.length ? "called, no 5YF row" : "not called", "done");
    s.show("b_pol", gotFee ? "LEND-07 §8 Early repayment" : pols.length ? "called, no §8" : "not called", "done");
    s.show("b_out", ok2 ? "3.95% (LEND-11 rev 2026-11); 1.5% fee in year 2" : "rate or fee missing", ok2 ? "good" : "bad");

    return {
      final: a2,
      compare: {
        cols: [
          { title: "Phase 1: one similarity search for everything", short: "One search", tone: "trap", said: a1,
            verdict: `${superseded ? "The superseded rate sheet (rev 2026-08) was a top hit" : "No rate sheet was a top hit"} and ${current ? "the current row was too" : "**the current 5YF row was not**"}. ${old1 ? "The answer quotes **4.35%**, a rate that ended on 31 Oct." : right1 ? "The answer has 3.95%, but not from what it retrieved." : "The answer cannot give today's rate."}` },
          { title: "Phase 2: lookup for the table, hybrid search for prose", short: "Matched to shape", tone: "fix", said: a2,
            verdict: ok2 ? `lookup_rate(5YF, ${goodRate?.input.ltv_pct}%, ${goodRate?.input.as_of}) returned **3.95% from LEND-11 rev 2026-11**; search_policy returned LEND-07 §8, so the answer adds the **1.5% fee in year 2**.`
              : "Read the live output: Claude writes each run fresh." },
        ],
        rows: [
          ["Rate table reached through", "text chunks (rows without their header)", { v: "lookup_rate: product code + LTV + as_of", tone: "good" }],
          ["Prose reached through", "the same similarity search", { v: "search_policy: hybrid, in force on today's date", tone: "good" }],
          ["What came back", hits1.map((h) => `${h.id} (rev ${h.rev})`).join(", "), [...rates.map((c) => c.isError ? "lookup_rate: error" : `lookup_rate → ${c.result.rate_pct}% (${c.result.source})`), ...pols.map((c) => `search_policy → ${(Array.isArray(c.result) ? c.result : []).map((x) => x.id).join(", ")}`)].join("; ") || "no tool calls"],
          ["Rate quoted", { v: old1 ? "4.35% (superseded)" : right1 ? "3.95%" : "none", tone: old1 || !right1 ? "bad" : "good" }, { v: says(a2, /3\.95/) ? "3.95% (current)" : "missing", tone: says(a2, /3\.95/) ? "good" : "bad" }],
          ["Early repayment fee in year 2", { v: says(a1, /1\.5\s?%/) ? "1.5%" : "missing", tone: says(a1, /1\.5\s?%/) ? "good" : "bad" }, { v: says(a2, /1\.5\s?%/) ? "1.5%" : "missing", tone: says(a2, /1\.5\s?%/) ? "good" : "bad" }],
        ],
        note: "The prose half of the question worked in both phases. The table half only worked when the table was queried as a table. Route per question part, not per system.",
      },
      checks: [
        E.check("Phase 1: the similarity search returned the superseded LEND-11 rev 2026-08 and not the current 5YF row", superseded && !current),
        E.check("Phase 1: the answer quoted the superseded 4.35% rate, not 3.95%", old1 && !right1),
        E.check("Phase 2: lookup_rate ran for product 5YF and returned 3.95% from LEND-11 rev 2026-11", !!goodRate && goodRate.result.source === "LEND-11 rev 2026-11"),
        E.check("Phase 2: search_policy (not the rate lookup) returned the early repayment rule, LEND-07 §8", gotFee),
        E.check("Phase 2: the answer gives 3.95% and the 1.5% year-2 fee", ok2),
      ],
    };
  },
};
