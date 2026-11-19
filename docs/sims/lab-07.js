// Lab 7 · Task 2.1 · Simulator 4: route by task difficulty, and measure quality per route.
// Riverton sends every resident question to its most capable model. Same eight-question eval set (four
// languages, an answer key), two designs:
//   1. one model for everything: every question answered at the top tier (priced at Claude Opus 5.5);
//   2. a Haiku router sends one-fact lookups to the Haiku route and benefit pre-screens to the Sonnet route;
//      each route is graded on the same answer key, and the design is priced per route.
// This lab CALLS only claude-haiku-5-5. Opus 5.5 and Sonnet 5.5 are priced from their list prices, never called:
// Haiku stands in for them, so the quality figures for those tiers are Haiku's.
import { SERVICE_FACTS, QUESTIONS, VOLUME, BUDGET, MIX, grade, questionList, answersSchema, routeSchema } from "./shared/d2-riverton.js";
import { MODELS, usd, money } from "./shared/d2-pricing.js";

const ASSISTANT = `You are Riverton City Council's resident-services assistant. Answer from the service facts below only.
Reply in the language the resident wrote in. Use plain language, at most 80 words per answer. For benefit questions,
work through each rule with the resident's numbers, say whether the pre-screen is met, and list what to send; a caseworker decides.

${SERVICE_FACTS}`;
const ROUTER = `You route resident questions for Riverton City Council to a model tier.
- haiku: a lookup with one fact in the answer (a collection day, a permit status or date, a count), in any language.
- sonnet: anything that needs several rules applied to the resident's own numbers, or a decision explained.
Return one route per question id.`;

async function answer(s, E, qs, tierNote, think) {
  const resp = await E.callClaude(s, { system: ASSISTANT, max_tokens: 4096, ...(think ? {} : { thinking: { type: "disabled" } }),
    output_config: { format: { type: "json_schema", schema: answersSchema } },
    messages: [{ role: "user", content: `Answer each resident question. The questions are independent: answer each one in the language that question is written in.\n${questionList(qs)}` }] });
  let out = []; try { out = JSON.parse(E.textOf(resp.content)).answers || []; } catch { out = []; }
  const rows = qs.map((q) => { const o = out.find((x) => x.id === q.id) || {}; const a = o.answer || ""; return { q, a, pre: o.pre_screen, ok: grade(q, a, o.pre_screen) }; });
  for (const r of rows) s.log(`  ${r.ok ? "ok   " : "WRONG"} ${r.q.id} (${r.q.lang}) ${tierNote}${r.pre && r.pre !== "n/a" ? ` pre_screen=${r.pre}` : ""}: ${r.ok ? E.short(r.a, 150) : r.a}`, r.ok ? "result" : "error");
  s.log(`  usage: input_tokens ${resp.usage.input_tokens} · output_tokens ${resp.usage.output_tokens}`, "note");
  return { rows, usage: resp.usage, score: rows.filter((r) => r.ok).length };
}

export default {
  id: 7,
  see: "Phase 1 answers all eight questions correctly at the top tier, and the projected bill for Riverton's 90,000 questions a month is several times the US$300 budget. Phase 2's router sends the six lookups to Haiku and the two benefit pre-screens to Sonnet; each route scores full marks on the same answer key, and the projected bill falls by two thirds or more, inside the budget.",
  try: "Edit ROUTER so that every question goes to sonnet, and run again: the quality is the same and the saving almost disappears. Then delete the US$400 childcare cap from the facts in sims/shared/d2-riverton.js: Q8's pre-screen now fails the grader on both routes, which is why each route needs its own eval cases.",
  explain: "Model choice is a trade-off between quality, latency and cost, judged per task, not per application. Most of Riverton's traffic is one-fact lookups (a bin day, a permit status) that the smallest model answers correctly in any of the four languages; a minority are benefit pre-screens that apply several rules to a resident's own numbers. Sending everything to the most capable model buys quality the lookups do not need at up to 40 times the price. A cheap router that sends each question to the least capable model that passes, with every route measured on its own eval cases, keeps quality where it matters and puts the money there. Price per completed task, not per token: a route that is cheap but fails costs more once the failures are cleaned up.",
  scene: {
    title: "Riverton: is every resident question worth the top-tier price?",
    caption: "Both phases answer the same eight questions against the same answer key. Only the model per question changes. The lab calls Haiku only and prices Sonnet and Opus from their list prices.",
    lanes: [
      { key: "in", label: "Eval set", sub: "8 resident questions, 4 languages, an answer key", stages: [
        { id: "qs", icon: "💬", t: "6 lookups + 2 pre-screens", s: "bins, permits · Household Support Grant" },
        { id: "langs", icon: "🌐", t: "4 languages", s: "English, Malay, Chinese, Tamil" },
        { id: "budget", icon: "💲", t: "90,000 a month", s: "model budget US$300 a month" } ] },
      { key: "p1", label: "Phase 1 · one model for everything", sub: "every question at the top tier (Opus 5.5 prices)", tone: "trap", on: /Phase 1/, stages: [
        { id: "a_route", icon: "➡", t: "All 8 → top tier", s: "no routing", diff: true },
        { id: "a_ans", icon: "🤖", t: "Answer all 8", s: "priced at Opus 5.5: US$4 / US$20", claude: true },
        { id: "a_q", icon: "✅", t: "Quality on the key", s: "lookups and pre-screens" },
        { id: "a_out", icon: "💲", t: "Monthly cost vs budget", s: "want: under US$300", out: true } ] },
      { key: "p2", label: "Phase 2 · route by task difficulty", sub: "Haiku router → Haiku or Sonnet route, graded per route", tone: "fix", on: /Phase 2/, stages: [
        { id: "b_router", icon: "🔀", t: "Router (Haiku)", s: "one fact → haiku · several rules → sonnet", claude: true, diff: true },
        { id: "b_h", icon: "🤖", t: "Haiku route", s: "lookups, thinking off", claude: true },
        { id: "b_s", icon: "🤖", t: "Sonnet route", s: "pre-screens (priced at Sonnet 5.5)", claude: true },
        { id: "b_q", icon: "✅", t: "Quality per route", s: "the same answer key, split by route" },
        { id: "b_out", icon: "💲", t: "Monthly cost vs budget", s: "want: under US$300", out: true } ] },
    ],
  },
  slide: {
    title: "Route each task to the least capable model that passes",
    code: `ROUTER = """haiku: one-fact lookups, any language
sonnet: several rules applied to the resident's numbers"""  # KEY 1
route = claude("claude-haiku-5-5", ROUTER, question,
               schema={"route": Enum("haiku", "sonnet")})
model = {"haiku": "claude-haiku-5-5",                # KEY 2
         "sonnet": "claude-haiku-5-5"}[route]  # prod: sonnet
answer = claude(model, SERVICE_FACTS, question)
evals[route].append(grade(answer, answer_key))       # KEY 3
PRICE = {"haiku": (0.10, 0.50), "sonnet": (2, 10),
         "opus": (4, 20)}                            # US$ / MTok
cost = sum(u.input * PRICE[r][0] + u.output * PRICE[r][1]
           for r, u in usage_by_route.items()) / 1e6 # KEY 4`,
    keys: [["1", "Route on task difficulty", "A cheap router reads the question, not the user."],
           ["2", "Least capable that passes", "Lookups to Haiku, multi-rule work to Sonnet."],
           ["3", "Quality per route", "Each route graded on its own answer-key cases."],
           ["4", "Price the whole design", "Router + routes at list price, per month."]],
  },
  async run(s, E) {
    const n = QUESTIONS.length;
    s.log(`Riverton Resident Services: an eval set of ${n} questions (${QUESTIONS.filter((q) => q.route === "haiku").length} lookups, ${QUESTIONS.filter((q) => q.route === "sonnet").length} benefit pre-screens) in English, Malay, Chinese and Tamil, graded on an answer key. Live traffic: ${VOLUME.toLocaleString("en-US")} questions a month, budget US$${BUDGET} a month.`, "note");
    s.log("This lab calls only claude-haiku-5-5. Bigger tiers are priced from their list prices, never called.", "note");
    s.show("qs", "Q1-Q6 lookups · Q7-Q8 pre-screens", "done");
    s.show("langs", "Q2 Malay · Q4 Chinese · Q5 Tamil", "done");
    s.show("budget", `${VOLUME.toLocaleString("en-US")}/month · US$${BUDGET} budget`, "done");

    s.log("== Phase 1 · one model for everything: every question at the top tier (priced at Claude Opus 5.5)", "note");
    s.show("a_route", `all ${n} questions → Opus 5.5 tier`, "done");
    s.log("  (Answered in two batches, lookups then pre-screens, to keep the lab cheap. Every question goes to the same top tier.)", "note");
    const LK = QUESTIONS.filter((q) => q.route === "haiku"), PS = QUESTIONS.filter((q) => q.route === "sonnet");
    const p1a = await answer(s, E, LK, "[top tier]", true);
    const p1b = await answer(s, E, PS, "[top tier]", true);
    const p1 = { rows: [...p1a.rows, ...p1b.rows], score: p1a.score + p1b.score,
      usage: { input_tokens: p1a.usage.input_tokens + p1b.usage.input_tokens, output_tokens: p1a.usage.output_tokens + p1b.usage.output_tokens } };
    const lk1Cost = usd(p1a.usage, "opus") / LK.length, ps1Cost = usd(p1b.usage, "opus") / PS.length;
    const perQ1 = MIX.haiku * lk1Cost + MIX.sonnet * ps1Cost;          // priced at the live traffic mix
    const month1 = perQ1 * VOLUME;
    s.show("a_ans", `${p1.usage.input_tokens} in · ${p1.usage.output_tokens} out tokens`, "done");
    s.show("a_q", `${p1.score}/${n} correct`, "done");
    s.show("a_out", `${money(month1)}/month vs US$${BUDGET}`, month1 > BUDGET ? "bad" : "good");
    const tiers = Object.entries(MODELS).map(([k, m]) => `${m.name} ${money(usd(p1a.usage, k) / LK.length)}`).join(" · ");
    s.log(`  One lookup's tokens at each tier's list price: ${tiers}`, "note");
    await s.pause({
      title: "Phase 1 finished: one model for everything",
      outcome: `**${p1.score}/${n}** answers correct on the key, at Opus 5.5 prices **${money(lk1Cost)} a lookup** and **${money(ps1Cost)} a pre-screen**, so **${money(perQ1)} a question** at Riverton's traffic mix and: **${money(month1)} a month** for ${VOLUME.toLocaleString("en-US")} questions, against a US$${BUDGET} budget. ${Math.round(MIX.haiku * 100)}% of that traffic is one-fact lookups.`,
      next: "Phase 2: a Haiku router sends lookups to Haiku and pre-screens to Sonnet, graded per route",
    });

    s.log("== Phase 2 · route by task difficulty: Haiku router → Haiku route (lookups) or Sonnet route (pre-screens)", "note");
    const rr = await E.callClaude(s, { system: ROUTER, max_tokens: 1024, thinking: { type: "disabled" },
      output_config: { format: { type: "json_schema", schema: routeSchema } },
      messages: [{ role: "user", content: questionList(QUESTIONS) }] });
    let routes = []; try { routes = JSON.parse(E.textOf(rr.content)).routes || []; } catch { routes = []; }
    const routeOf = (q) => (routes.find((r) => r.id === q.id) || {}).route || "sonnet";   // unrouted → the safer tier
    const hq = QUESTIONS.filter((q) => routeOf(q) === "haiku"), sq = QUESTIONS.filter((q) => routeOf(q) === "sonnet");
    const misrouted = QUESTIONS.filter((q) => routeOf(q) !== q.route);
    s.log(`  Router: haiku ← ${hq.map((q) => q.id).join(", ") || "none"} · sonnet ← ${sq.map((q) => q.id).join(", ") || "none"} · input_tokens ${rr.usage.input_tokens} · output_tokens ${rr.usage.output_tokens}`, misrouted.length ? "error" : "result");
    s.show("b_router", `haiku ← ${hq.length} · sonnet ← ${sq.length}`, "done");
    const ph = hq.length ? await answer(s, E, hq, "[haiku route]", false) : { rows: [], usage: {}, score: 0 };
    s.show("b_h", `${ph.score}/${hq.length} correct · thinking off`, "done");
    const ps = sq.length ? await answer(s, E, sq, "[sonnet route, priced at Sonnet 5.5]", true) : { rows: [], usage: {}, score: 0 };
    s.show("b_s", `${ps.score}/${sq.length} correct`, "done");
    s.show("b_q", `haiku ${ph.score}/${hq.length} · sonnet ${ps.score}/${sq.length}`, "done");

    const perRouter = usd(rr.usage, "haiku") / n;                   // the router runs on every question
    const perH = hq.length ? usd(ph.usage, "haiku") / hq.length : 0;
    const perS = sq.length ? usd(ps.usage, "sonnet") / sq.length : 0;
    const perQ2 = perRouter + MIX.haiku * perH + MIX.sonnet * perS;
    const month2 = perQ2 * VOLUME;
    const saving = 1 - month2 / month1;
    s.show("b_out", `${money(month2)}/month vs US$${BUDGET} (${Math.round(saving * 100)}% less)`, month2 <= BUDGET && misrouted.length === 0 ? "good" : "bad");
    s.log(`== Result: per question ${money(perQ1)} → ${money(perQ2)} (router ${money(perRouter)} + ${Math.round(MIX.haiku * 100)}% × Haiku ${money(perH)} + ${Math.round(MIX.sonnet * 100)}% × Sonnet ${money(perS)}) · monthly ${money(month1)} → ${money(month2)}`, "note");

    const lk1 = p1.rows.filter((r) => r.q.route === "haiku"), ps1 = p1.rows.filter((r) => r.q.route === "sonnet");
    const sc = (rows) => `${rows.filter((r) => r.ok).length}/${rows.length}`;
    return {
      final: [...ph.rows, ...ps.rows].map((r) => `${r.q.id} (${r.q.lang}): ${r.a}`).join("\n"),
      compare: {
        cols: [
          { title: "Phase 1: one model for everything (Opus 5.5 prices)", short: "Top tier for all", tone: "trap",
            verdict: `${p1.score}/${n} correct, **${money(month1)} a month**: ${month1 > BUDGET ? `${(month1 / BUDGET).toFixed(1)}x the budget` : "within budget"}, mostly spent on one-fact lookups.` },
          { title: "Phase 2: route by difficulty, graded per route", short: "Routed", tone: "fix",
            verdict: `Lookups ${sc(ph.rows)} on Haiku, pre-screens ${sc(ps.rows)} on the Sonnet route, **${money(month2)} a month** (${Math.round(saving * 100)}% less).` },
        ],
        rows: [
          ["Lookups (Q1-Q6) correct", sc(lk1), { v: sc(ph.rows.filter((r) => r.q.route === "haiku")), tone: ph.rows.every((r) => r.ok) ? "good" : "bad" }],
          ["Benefit pre-screens (Q7-Q8) correct", sc(ps1), { v: sc(ps.rows.filter((r) => r.q.route === "sonnet")), tone: ps.rows.every((r) => r.ok) ? "good" : "bad" }],
          ["Model per question", "Opus 5.5 for all 8", `Haiku: ${hq.map((q) => q.id).join(" ")} · Sonnet: ${sq.map((q) => q.id).join(" ")}`],
          ["Cost per lookup · per pre-screen (list prices)", `${money(lk1Cost)} · ${money(ps1Cost)}`, `${money(perH)} · ${money(perS)} (+ router ${money(perRouter)})`],
          ["Cost per question at the traffic mix", money(perQ1), money(perQ2)],
          [`Projected month (${VOLUME.toLocaleString("en-US")} questions, budget US$${BUDGET})`, { v: money(month1), tone: month1 > BUDGET ? "bad" : "good" }, { v: money(month2), tone: month2 <= BUDGET ? "good" : "bad" }],
        ],
        note: `Same eight questions, same answer key. Both phases price live traffic at Riverton's logged mix (${Math.round(MIX.haiku * 100)}% lookups, ${Math.round(MIX.sonnet * 100)}% pre-screens). This lab calls Haiku for every tier, so the Opus and Sonnet quality figures are Haiku's; in production each route's eval runs on the model that serves it.`,
      },
      checks: [
        E.check("The router sent all 6 lookups to the Haiku route and both benefit pre-screens to the Sonnet route", misrouted.length === 0),
        E.check(`Haiku route: every lookup correct on the answer key, in all four languages (${ph.score}/${hq.length})`, hq.length === 6 && ph.score === hq.length),
        E.check(`Sonnet route: both pre-screens apply the rules correctly (${ps.score}/${sq.length})`, sq.length === 2 && ps.score === sq.length),
        E.check(`Phase 1 is over budget (${money(month1)} a month) and phase 2 within it (${money(month2)})`, month1 > BUDGET && month2 <= BUDGET),
        E.check(`Routing cut the projected monthly cost by at least half (${Math.round(saving * 100)}%)`, saving >= 0.5),
      ],
    };
  },
};
