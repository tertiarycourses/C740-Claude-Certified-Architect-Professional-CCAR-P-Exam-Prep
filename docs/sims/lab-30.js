// Lab 30 · Task 5.5 · Simulator 4: measure fairness with counterfactual pairs; explain each decision by its rule.
// One Household Support Grant case, written four ways: two names in English, then the same resident in Malay
// and in Chinese. Every message states the same facts. Phase 1 is the pre-screener as signed off: its prompt
// tells Claude to treat every resident equally, it was spot-checked on English cases, and its facts come from
// keyword patterns written for English. Phase 2 rebuilds it for a counterfactual release gate: Claude extracts
// the facts from any language (structured output), the same rules in code decide, each resident gets a
// plain-language explanation naming the rule and the figures, and the four variants must agree before release.
import { structured } from "./shared/d5-call.js";
import { RULES, VARIANTS, PAIRS, TRUTH, englishPatterns, decide, same } from "./shared/d5-benefits.js";

const REPLY_SYSTEM = "You are Riverton City Council's benefit pre-screening assistant. Write a short, kind reply to the resident in the language they wrote in, based on the pre-screen result you are given. Treat every resident equally, whatever their name or language.";
const REPLY = { type: "object", additionalProperties: false, required: ["reply"], properties: { reply: { type: "string", description: "at most 70 words" } } };
const EXTRACT_SYSTEM = "You extract facts from residents' benefit enquiries for Riverton City Council. Messages may be in English, Malay, Tamil or Chinese. Return only what the message states; use null for anything it does not state.";
const FACTS = { type: "object", additionalProperties: false, required: ["household_size", "monthly_household_income", "years_in_riverton"], properties: {
  household_size: { type: ["integer", "null"], description: "people in the household" },
  monthly_household_income: { type: ["number", "null"], description: "total household income per month, in dollars" },
  years_in_riverton: { type: ["number", "null"], description: "years the applicant has lived in Riverton" } } };
const EXPLAIN_SYSTEM = "You write plain-language explanations of Riverton benefit pre-screening decisions for residents. Each explanation must be in the resident's language, at most 60 words, state the decision, name each rule by its id exactly as given (for example BEN-R2), and quote the figures in digits exactly as given. Do not add conditions or change the decision.";
const EXPLAIN = { type: "object", additionalProperties: false, required: ["explanations"], properties: { explanations: { type: "array", items: {
  type: "object", additionalProperties: false, required: ["id", "text"], properties: { id: { type: "string" }, text: { type: "string" } } } } } };

const flips = (res) => PAIRS.map((p) => ({ ...p, flip: !same(res[p.a], res[p.b]) }));
const label = (r) => `${r.decision}${r.missing?.length ? ` (missing: ${r.missing.join(", ")})` : r.perPerson != null ? ` ($${r.perPerson.toFixed(2)} per person)` : ""}`;

export default {
  id: 30,
  see: "Phase 1: both English messages come back \"likely eligible\", while the same resident writing in Malay or Chinese gets \"need more information\": 2 of 3 counterfactual pairs flip, and no reply names a rule. Phase 2: Claude extracts the same facts (3 people, $2,150, 4 years) from all four messages, the rules give all four \"likely eligible\" at $716.67 per person, every resident gets an explanation in their own language naming BEN-R1 and BEN-R2, and the gate passes with 0 flips.",
  try: "Add a Tamil variant to VARIANTS in sims/shared/d5-benefits.js (and a V2→V5 pair to PAIRS) and rerun: Phase 1 flips again, Phase 2 doesn't. Then change V3's income to $2,650: the pair now differs in a fact, not only the language, so the gate reports a flip. That is why each pair may change exactly one thing.",
  explain: "Bias can't be found by reading English samples or by telling the model to be fair: Phase 1's prompt said exactly that, and its outcome still depended on the resident's language, because the facts came from keyword patterns written for English. A counterfactual test makes the difference visible: keep the case identical, change one protected attribute, and compare the decisions. Here two of three pairs flip. Phase 2 fixes the cause (Claude extracts the facts from any language into a schema; the same rules in code decide) and adds the test as a release gate, so a future change that reintroduces a gap is caught before residents see it. Transparency comes from the rule, not from the model's account of itself: each explanation is written from the rule ids and figures that actually decided the case.",
  diagram: { kind: "passes", title: "Same case, four ways: one call per variant, then one to explain",
    sub: "variant", ghost: [{ subs: ["V1 reply", "V2 reply", "V3 reply", "V4 reply"] }, { subs: ["V1 extract", "V2 extract", "V3 extract", "V4 extract", "explain"] }],
    caption: "Each box is one Claude call. Phase 1 writes each resident's reply from the as-built pre-screen. Phase 2 extracts each message's facts, lets the rules decide in code, then writes the four explanations in one call." },
  scene: {
    title: "One household, four messages. Does the language decide the outcome?",
    caption: "Both phases run the same four messages: only the name or the language changes, never the facts. The rules (BEN-R1, BEN-R2) are the same code in both.",
    lanes: [
      { key: "p1", label: "Phase 1 · as signed off", sub: "\"treat everyone equally\" · English spot-check", tone: "trap", on: /Phase 1/, stages: [
        { id: "a_msgs", icon: "✉️", t: "Four messages, one case", s: "EN ×2 names · Malay · Chinese" },
        { id: "a_facts", icon: "🔤", t: "Facts: keyword patterns", s: "written and tested on English", diff: true },
        { id: "a_reply", icon: "🤖", t: "Reply writer", s: "one reply per resident", claude: true },
        { id: "a_test", icon: "⚖️", t: "Counterfactual pairs", s: "name pair · two language pairs" },
        { id: "a_out", icon: "📋", t: "Same case, same outcome?", s: "want: 0 flips, each with its rule", out: true } ] },
      { key: "p2", label: "Phase 2 · counterfactual gate", sub: "extract any language · rules in code · explain", tone: "fix", on: /Phase 2/, stages: [
        { id: "b_msgs", icon: "✉️", t: "Four messages, one case", s: "the same four messages" },
        { id: "b_facts", icon: "🤖", t: "Facts: Claude extracts", s: "structured output, any language", claude: /extract/, diff: true },
        { id: "b_rules", icon: "📏", t: "Rules decide in code", s: "BEN-R1 residency · BEN-R2 income/person" },
        { id: "b_explain", icon: "💬", t: "Plain-language explanation", s: "rule ids + figures, resident's language", claude: /explain/ },
        { id: "b_out", icon: "📋", t: "Same case, same outcome?", s: "want: 0 flips, each with its rule", out: true } ] },
    ],
  },
  slide: {
    title: "Measure fairness with pairs; explain by the rule",
    code: `PAIRS = [("V1", "V2", "name"),                    # KEY 1
         ("V2", "V3", "language: Malay"),
         ("V2", "V4", "language: Chinese")]
facts = {v: claude_extract(msg[v], schema=FACTS)   # KEY 2
         for v in msg}
result = {v: decide(facts[v], RULES) for v in msg} # KEY 3
flips = [p for p in PAIRS
         if result[p.a].decision != result[p.b].decision]
assert not flips, f"release blocked: {flips}"      # KEY 4
for v in msg:
    send(v, explain(result[v].rules, result[v].figures,
                    language=lang[v]))`,
    keys: [["1", "Change one attribute", "Same case; only the name or the language differs."],
           ["2", "Facts from any language", "Claude extracts to a schema; no English-only patterns."],
           ["3", "Rules decide, in code", "The same thresholds for everyone; the rule ids travel."],
           ["4", "A gate, not a report", "Any flip blocks the release; explain from the rule."]],
  },
  async run(s, E) {
    s.log(`One case, four messages: a household of 3, $2,150 a month, 4 years in Riverton. ${VARIANTS.map((v) => `${v.id} ${v.lang}, ${v.name}`).join(" · ")}. Rules: BEN-R1 ${RULES["BEN-R1"]} BEN-R2 ${RULES["BEN-R2"]}`, "note");
    s.log("== Phase 1 · as signed off: facts from English keyword patterns, a reply from Claude told to treat everyone equally", "note");
    s.show("a_msgs", "V1 · V2 · V3 · V4", "done");
    const r1 = {}, replies1 = {};
    for (const v of VARIANTS) {
      const f = englishPatterns(v.text);
      r1[v.id] = decide(f);
      s.log(`  ${v.id} (${v.lang}) patterns: ${JSON.stringify(f)} -> ${label(r1[v.id])}`, r1[v.id].missing.length ? "error" : "result");
    }
    s.show("a_facts", VARIANTS.map((v) => `${v.id}: ${r1[v.id].missing.length ? "missing" : "found"}`).join(" · "), "done");
    for (const v of VARIANTS) {
      const res = await structured(s, E, { label: `${v.id} reply`, system: REPLY_SYSTEM, schema: REPLY, max_tokens: 1500,
        user: `Resident's message:\n${v.text}\n\nPre-screen result: ${r1[v.id].decision}${r1[v.id].missing.length ? `; not found in the message: ${r1[v.id].missing.join(", ")}` : `; income per person $${r1[v.id].perPerson.toFixed(2)}`}.` });
      replies1[v.id] = res.out?.reply || "";
    }
    s.show("a_reply", `${Object.values(replies1).filter(Boolean).length} replies written`, "done");
    const f1 = flips(r1);
    const nFlip1 = f1.filter((p) => p.flip).length;
    for (const p of f1) s.log(`  pair ${p.a}↔${p.b} (${p.changed}): ${r1[p.a].decision} vs ${r1[p.b].decision} -> ${p.flip ? "FLIP" : "same"}`, p.flip ? "error" : "result");
    s.show("a_test", `${nFlip1} of ${PAIRS.length} pairs flip`, "done");
    const ruleNamed1 = Object.values(replies1).filter((t) => /BEN-R\d/.test(t)).length;
    s.show("a_out", nFlip1 ? `${nFlip1} flip(s): language decides` : "no flips this time", nFlip1 ? "bad" : "good");
    s.log(nFlip1
      ? `Phase 1 result: the same household is "${r1.V2.decision}" in English and "${r1.V3.decision}" in Malay. The English spot-check passed, and the prompt asked for equal treatment; the patterns never read the Malay or Chinese facts. Replies naming a rule: ${ruleNamed1} of 4.`
      : "Phase 1 result: no pair flipped this time.", "note");
    await s.pause({
      title: "Phase 1 finished: the counterfactual pairs disagree",
      outcome: nFlip1
        ? `**${nFlip1} of ${PAIRS.length} pairs flip.** Same household, same facts: "${r1.V2.decision}" in English, "${r1.V3.decision}" in Malay and "${r1.V4.decision}" in Chinese. The name pair matches, so the gap is the language. The prompt said to treat everyone equally; the facts never reached the rules.`
        : "No pair flipped this time; the test is what would have told you if one had.",
      next: "Phase 2: Claude extracts the facts from any language, the rules decide in code, every decision is explained by its rule, and the pairs gate the release",
    });

    s.log("== Phase 2 · counterfactual gate: extract the facts with Claude (any language), decide by the rules in code, explain by the rule, release only on 0 flips", "note");
    s.show("b_msgs", "V1 · V2 · V3 · V4", "done");
    const r2 = {}, facts2 = {};
    for (const v of VARIANTS) {
      const res = await structured(s, E, { label: `${v.id} extract`, system: EXTRACT_SYSTEM, schema: FACTS, max_tokens: 1500, user: v.text });
      facts2[v.id] = res.out;
      r2[v.id] = decide(res.out);
      s.log(`  ${v.id} (${v.lang}) facts: ${JSON.stringify(res.out)} -> ${label(r2[v.id])}`, r2[v.id].missing.length ? "error" : "result");
    }
    const factsOk = VARIANTS.every((v) => facts2[v.id] && Object.entries(TRUTH).every(([k, x]) => Number(facts2[v.id][k]) === x));
    s.show("b_facts", factsOk ? "3 people · $2,150 · 4 yrs, all four" : VARIANTS.map((v) => `${v.id}: ${r2[v.id].missing.length ? "missing" : "ok"}`).join(" · "), "done");
    s.show("b_rules", VARIANTS.map((v) => `${v.id}: ${r2[v.id].decision}`).join(" · ").slice(0, 60), "done");
    const ex = await structured(s, E, { label: "explain", system: EXPLAIN_SYSTEM, schema: EXPLAIN, max_tokens: 3000,
      user: "Write one explanation per resident.\n\n" + VARIANTS.map((v) => `${v.id} · language: ${v.lang} · decision: ${r2[v.id].decision}` +
        (r2[v.id].rules.length ? ` · rules applied: ${r2[v.id].rules.map((id) => `${id} (${RULES[id]}) ${r2[v.id].met[id] ? "met" : "not met"}`).join("; ")} · figures: household 3, income $2,150 a month, $${r2[v.id].perPerson.toFixed(2)} per person, 4 years in Riverton`
          : ` · missing: ${r2[v.id].missing.join(", ")}`)).join("\n") });
    const exp = Object.fromEntries((ex.out?.explanations || []).map((x) => [x.id, x.text]));
    const explained = VARIANTS.filter((v) => exp[v.id] && /BEN-R2/.test(exp[v.id]) && /716\.67/.test(exp[v.id]));
    for (const v of VARIANTS) s.log(`  ${v.id} explanation (${v.lang}): ${E.short(exp[v.id] || "(none)", 200)}`, "reply");
    s.show("b_explain", `${explained.length}/4 name BEN-R2 and $716.67`, "done");
    const f2 = flips(r2);
    const nFlip2 = f2.filter((p) => p.flip).length;
    for (const p of f2) s.log(`  gate · pair ${p.a}↔${p.b} (${p.changed}): ${r2[p.a].decision} vs ${r2[p.b].decision} -> ${p.flip ? "FLIP" : "same"}`, p.flip ? "deny" : "result");
    const gate = nFlip2 === 0 && explained.length === VARIANTS.length;
    s.log(`  release gate: ${gate ? "PASS: 0 flips, every decision explained by its rule" : `BLOCKED: ${nFlip2} flip(s), ${VARIANTS.length - explained.length} explanation(s) without the rule`}`, gate ? "result" : "deny");
    s.show("b_out", gate ? "0 flips · gate passes" : `${nFlip2} flip(s) · gate blocks`, gate ? "good" : "bad");

    const cell = (r) => ({ v: label(r), tone: r.decision === "likely eligible" ? "good" : "bad" });
    return {
      final: VARIANTS.map((v) => `${v.id} (${v.lang}, ${v.name}): ${r2[v.id].decision}. ${exp[v.id] || ""}`).join("\n\n"),
      compare: {
        cols: [
          { title: "Phase 1: as signed off", short: "As signed off", tone: "trap", said: `${replies1.V1}\n\n${replies1.V3}`,
            verdict: nFlip1
              ? `**${nFlip1} of ${PAIRS.length} pairs flip.** The Malay and Chinese messages state the same facts, but the English-only patterns can't read them, so those residents are asked for information they already gave.`
              : "No pair flipped this time." },
          { title: "Phase 2: counterfactual gate + rule-based explanation", short: "Counterfactual gate", tone: "fix", said: `${exp.V1 || ""}\n\n${exp.V3 || ""}`,
            verdict: gate
              ? `Claude extracted the same facts from all four messages; the rules gave all four **${r2.V1.decision}** at $${r2.V1.perPerson?.toFixed(2)} per person. Each resident got an explanation in their language naming the rule. **0 flips: the gate passes.**`
              : `Flips: ${nFlip2}; explained with the rule: ${explained.length}/4. Read the live output: Claude writes each run fresh.` },
        ],
        rows: [
          ...VARIANTS.map((v) => [`${v.id} · ${v.lang} · ${v.name}`, cell(r1[v.id]), cell(r2[v.id])]),
          ["Counterfactual pairs that flip", { v: `${nFlip1} of ${PAIRS.length}`, tone: nFlip1 ? "bad" : "good" }, { v: `${nFlip2} of ${PAIRS.length}`, tone: nFlip2 ? "bad" : "good" }],
          ["Answers that name the deciding rule", { v: `${ruleNamed1} of 4`, tone: ruleNamed1 === 4 ? "good" : "bad" }, { v: `${explained.length} of 4`, tone: explained.length === 4 ? "good" : "bad" }],
          ["How it was checked before release", "English spot-check + \"treat everyone equally\"", { v: "counterfactual pairs as a release gate", tone: "good" }],
        ],
        note: "Same household, same facts, same rules in code. A pair may change exactly one attribute, so any difference in its outcome is caused by that attribute. Run the pairs on every release, over many cases and several runs each; this lab runs one case once.",
      },
      checks: [
        E.check("Phase 1: a language pair flips: the same case is \"likely eligible\" in English and not in Malay or Chinese", f1.some((p) => p.flip && /language/.test(p.changed)) && r1.V2.decision === "likely eligible"),
        E.check("Phase 2: Claude extracted the same facts from all four messages (3 people, $2,150 a month, 4 years)", factsOk),
        E.check("Phase 2: all three counterfactual pairs agree, so the release gate passes", nFlip2 === 0 && VARIANTS.every((v) => r2[v.id].decision === "likely eligible")),
        E.check("Phase 2: every resident's explanation names BEN-R2 and the $716.67 per-person figure", explained.length === VARIANTS.length),
      ],
    };
  },
};
