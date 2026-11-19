// Lab 27 · Task 5.2 · Simulator 1: a fluent, consistent figure is not a checked figure.
// Claim CLM-7815's garage quote has 21 lines, and line 14 (paint and materials) is not priced yet: "per
// materials sheet to follow". Asked for a payout, an LLM produces one anyway: a plausible number that
// silently leaves line 14 out. Ask twice and it agrees with itself, because the same model fails the same way.
// Phase 1 is the tempting design: Claude calculates, a second Claude call re-calculates, and the payout system
// pays when the two agree and the figure is within the $5,000 authority. Phase 2 uses Claude only to extract
// the lines (null where the quote prints no amount); code grounds each line in the quote, holds the claim
// while a line is unpriced, fetches the materials sheet, computes the payout and routes on the code's figure.
import { structured } from "./shared/d5-call.js";
import { CLAIM, POLICY_TERMS, AUTHORITY, EXACT, PARTIAL, LINES, UNPRICED, quoteText, requestDocument, computePayout, groundLines, payoutSystem, money } from "./shared/d5-claims.js";

const SYSTEM = `You are Harbour Mutual's claims calculation step. ${POLICY_TERMS}`;

const PAYOUT = { type: "object", additionalProperties: false, required: ["payout"],
  properties: { payout: { type: "number", description: "amount payable to the policyholder, US$" } } };
const EXTRACT = { type: "object", additionalProperties: false, required: ["lines"],
  properties: { lines: { type: "array", description: "every numbered line of the quote", items: { type: "object", additionalProperties: false, required: ["line", "kind", "amount"],
    properties: { line: { type: "integer" }, kind: { type: "string", enum: ["part", "labour", "materials"] },
      amount: { type: ["number", "null"], description: "the amount printed on that line, or null if the line prints no amount" } } } } } };

const ask = async (s, E, label, schema, instruction) =>
  (await structured(s, E, { label, system: SYSTEM, schema, max_tokens: 4096, user: `${instruction}\n\n${quoteText()}` })).out;
const fmt = (x) => (Number.isFinite(x) ? money(x) : "none");

export default {
  id: 27,
  see: "Phase 1: Claude returns a payout of about $4,810.58, the second call agrees, and the pipeline pays it without an adjuster. Neither call can know line 14's amount; the quote doesn't print it. Phase 2: Claude extracts 21 lines with line 14 as null, code holds the claim, fetches the materials sheet ($486.30), computes $5,340.64 and escalates it because it is above the $5,000 authority.",
  try: "Print line 14's amount in the quote (in sims/shared/d5-claims.js, set UNPRICED to 0) and rerun: Phase 1 now usually gets $5,340.64 and escalates. Then add thinking: { type: \"disabled\" } to the ask() call and rerun: the one-pass total drifts or comes back as 0, while Phase 2's figure doesn't move.",
  explain: "Phase 1 shows two failure modes at once. The model answers the question it was asked even when the input cannot support an answer: the quote leaves line 14 unpriced, so any payout is a guess, yet the schema asked for a number and got a fluent one. And agreement between two calls is not verification: both calls share the same blind spot, so they agree on the same wrong figure. The figure lands under the $5,000 authority, so the pipeline pays it without an adjuster, though the real payout is above the limit. The fix is to split the work by what each part does reliably. Claude reads and copies the lines, with null where the quote prints no amount. Code grounds every line against the quote, refuses to compute while any line is unpriced, fetches the missing sheet, applies the policy terms and routes on its own figure.",
  diagram: { kind: "passes", title: "What does your code do with Claude's answer?",
    sub: "calculation call", ghost: [{ subs: ["calculate", "re-calculate"] }, { subs: ["extract the lines"] }],
    caption: "Each box is one Claude call. Phase 1 trusts the payout when two calls agree. Phase 2 uses one call to extract the lines; the hold, the sum, the excess and the authority check run in code." },
  scene: {
    title: "CLM-7815: line 14 isn't priced yet. Who notices before the payout?",
    caption: "Both phases send the same quote and policy terms to the same model. Only what your code trusts differs.",
    lanes: [
      { key: "p1", label: "Phase 1 · two calls agree, so pay", sub: "self-consistency as the check", tone: "trap", on: /Phase 1/, stages: [
        { id: "a_quote", icon: "🧾", t: "21-line repair quote", s: "line 14: \"per materials sheet to follow\"" },
        { id: "a_claude", icon: "🤖", t: "Calculate, then re-calculate", s: "two calls return { payout }", claude: true },
        { id: "a_check", icon: "🧮", t: "Check: do the two agree?", s: "the same model checking itself", diff: true },
        { id: "a_route", icon: "💳", t: "Authority rule", s: "≤ $5,000 pay · above it, an adjuster" },
        { id: "a_out", icon: "📋", t: "CLM-7815 outcome", s: "want: $5,340.64, to an adjuster", out: true } ] },
      { key: "p2", label: "Phase 2 · extract, then compute in code", sub: "the model copies, code decides", tone: "fix", on: /Phase 2/, stages: [
        { id: "b_quote", icon: "🧾", t: "21-line repair quote", s: "the same quote, the same terms" },
        { id: "b_claude", icon: "🤖", t: "Extraction step", s: "every line; null where no amount", claude: true },
        { id: "b_check", icon: "🧮", t: "Ground, hold, compute", s: "match the quote · fetch the sheet · sum", diff: true },
        { id: "b_route", icon: "💳", t: "Authority rule", s: "on the code's figure, not Claude's" },
        { id: "b_out", icon: "📋", t: "CLM-7815 outcome", s: "want: $5,340.64, to an adjuster", out: true } ] },
    ],
  },
  slide: {
    title: "Know the failure mode: the model copies, code decides",
    code: `ext = claude(quote, schema=EXTRACT)             # KEY 1
check = ground(ext.lines, quote)                # KEY 2
if check.errors:
    return escalate_to_adjuster(claim, check.errors)
for n in check.unpriced:                        # KEY 3
    hold(claim, f"line {n} unpriced")
    ext.lines[n].amount = fetch_sheet(claim, n)
calc = compute_payout(ext.lines, policy)        # KEY 4
if calc.payout > AUTHORITY:                     # $5,000
    return escalate_to_adjuster(claim, calc)
return approve_payout(claim, calc.payout)`,
    keys: [["1", "Ask for what it does well", "Copy each line; null where the quote prints nothing."],
           ["2", "Ground the extraction", "Every amount must match the quote, with no line missing."],
           ["3", "Missing input: hold", "Never compute a payout over a gap; fetch the evidence."],
           ["4", "Hard rules in code", "GST, excess, total and the limit are deterministic."]],
  },
  async run(s, E) {
    s.log(`${CLAIM.id} · ${CLAIM.holder} · ${CLAIM.incident} · 21-line quote, line ${UNPRICED} (paint and materials) not priced: "per materials sheet to follow". With the sheet's $486.30 the payout is ${money(EXACT.payout)}, above the ${money(AUTHORITY)} authority. Without line ${UNPRICED} it comes to ${money(PARTIAL.payout)}.`, "note");
    s.log("== Phase 1 · two calls agree, so pay: Claude calculates, a second call re-calculates, the payout system acts when they match", "note");
    s.show("a_quote", `21 lines · line ${UNPRICED} unpriced`, "done");
    const sys1 = payoutSystem();
    const c1 = await ask(s, E, "Calculate", PAYOUT, "Calculate the payout for this claim.");
    const c2 = await ask(s, E, "Re-calculate", PAYOUT, "Independently re-calculate the payout for this claim from scratch.");
    const f1 = Number(c1?.payout), f2 = Number(c2?.payout);
    const agree = Number.isFinite(f1) && Number.isFinite(f2) && Math.abs(f1 - f2) <= 0.01;
    s.log(`  Claude: ${fmt(f1)} · second call: ${fmt(f2)} · ${agree ? "they agree" : "they disagree"}`, "reply");
    s.show("a_claude", `${fmt(f1)} and ${fmt(f2)}`, "done");
    s.show("a_check", agree ? "agree: treated as verified" : "disagree: escalate", "done");
    if (agree && f1 > 0 && f1 <= AUTHORITY) sys1.approve_payout(f1, "two calculations agree");
    else sys1.escalate_to_adjuster(Number.isFinite(f1) ? f1 : null, agree ? "above authority" : "calculations disagree");
    const act1 = sys1.actions[0];
    s.log(`  payout system: ${act1.action}(${fmt(act1.amount)})`, "call");
    s.show("a_route", `${act1.action} ${fmt(act1.amount)}`, "done");
    const paidWrong = act1.action === "approve_payout" && Math.abs(act1.amount - EXACT.payout) > 1;
    s.show("a_out", paidWrong ? `paid ${fmt(act1.amount)}, no adjuster` : act1.action === "escalate_to_adjuster" ? `escalated at ${fmt(act1.amount)}` : `paid ${fmt(act1.amount)}`, paidWrong ? "bad" : act1.action === "escalate_to_adjuster" ? "good" : "bad");
    s.log(paidWrong
      ? `Phase 1 result: both calls agreed on ${fmt(f1)}, below the authority, so the pipeline paid it with no adjuster. The quote never priced line ${UNPRICED}; with it, the payout is ${money(EXACT.payout)} and needs an adjuster.`
      : `Phase 1 result: ${act1.action} at ${fmt(act1.amount)}. Read the live output: Claude writes each run fresh.`, "note");
    await s.pause({
      title: "Phase 1 finished: two calls agreed, so the pipeline paid",
      outcome: paidWrong
        ? `**Both calls said ${fmt(f1)}, and the pipeline paid it without an adjuster.** Neither call could know line ${UNPRICED}'s amount: the quote doesn't print it. With the materials sheet the payout is ${money(EXACT.payout)}, above the ${money(AUTHORITY)} authority.`
        : `The calls returned ${fmt(f1)} and ${fmt(f2)}; the pipeline chose **${act1.action}**. It still had no way to know line ${UNPRICED} was a gap.`,
      next: "Phase 2: Claude extracts the lines; code grounds them, holds for the missing sheet, computes and routes",
    });

    s.log("== Phase 2 · the model copies, code decides: extract every line (null where unpriced), ground it, hold for the gap, compute in code", "note");
    s.show("b_quote", "the same 21 lines", "done");
    const sys2 = payoutSystem();
    const ext = await ask(s, E, "Extract", EXTRACT, "Extract every numbered line of this quote: line number, kind and the amount printed on it.");
    const lines = (ext?.lines || []).map((l) => ({ ...l }));
    const g = groundLines(lines);
    const nulls = lines.filter((l) => l.amount === null || l.amount === undefined).map((l) => l.line);
    s.log(`  Claude: ${lines.length} lines extracted · null amounts on line(s) ${nulls.join(", ") || "none"}`, "reply");
    s.show("b_claude", `${lines.length} lines · null on ${nulls.length ? "line " + nulls.join(", ") : "none"}`, "done");
    let calc = null, sheet = null;
    if (g.errors.length) {
      s.log(`  ground(): ${g.errors.length} error(s): ${g.errors.slice(0, 3).join("; ")}`, "error");
      sys2.escalate_to_adjuster(null, `extraction failed grounding: ${g.errors.join("; ")}`);
    } else {
      s.log(`  ground(): ${lines.length - g.unpriced.length} priced lines match the quote · unpriced: ${g.unpriced.length ? "line " + g.unpriced.join(", ") : "none"}`, "result");
      if (g.unpriced.length) {
        sys2.hold(`line ${g.unpriced.join(", ")} unpriced: no payout on an incomplete quote`);
        s.log(`  payout system: hold(${CLAIM.id}) · line ${g.unpriced.join(", ")} unpriced · request_document("materials sheet")`, "call");
        sheet = requestDocument("materials sheet");
        const amt = Number((sheet.text.match(/\$([\d,]+\.\d{2})/) || [])[1]?.replace(/,/g, ""));
        s.log(`  <- ${sheet.doc}: ${sheet.text}`, "result");
        for (const l of lines) if (g.unpriced.includes(l.line)) l.amount = amt;
      }
      calc = computePayout(lines);
      s.log(`  compute_payout(): parts and materials ${money(calc.taxable)} + GST ${money(calc.gst)} + labour ${money(calc.labour)} - excess $500 = ${money(calc.payout)}`, "result");
      if (calc.payout > AUTHORITY) sys2.escalate_to_adjuster(calc.payout, `${money(calc.payout)} is above the ${money(AUTHORITY)} authority`);
      else sys2.approve_payout(calc.payout, "code calculation");
    }
    const act2 = sys2.actions.at(-1);
    s.log(`  payout system: ${act2.action}(${fmt(act2.amount)}) · ${act2.reason || act2.basis}`, "call");
    s.show("b_check", g.errors.length ? `${g.errors.length} grounding error(s)` : `held for line ${g.unpriced.join(", ")} · code: ${fmt(calc?.payout)}`, "done");
    s.show("b_route", `${act2.action} ${fmt(act2.amount)}`, "done");
    const good2 = !!calc && calc.payout === EXACT.payout && act2.action === "escalate_to_adjuster";
    s.show("b_out", good2 ? `${money(calc.payout)} to an adjuster` : `${act2.action} ${fmt(act2.amount)}`, good2 ? "good" : "bad");

    return {
      final: `${CLAIM.id}: held while line ${UNPRICED} was unpriced, then ${act2.action === "escalate_to_adjuster" ? "escalated to an adjuster" : act2.action} at ${fmt(act2.amount)} (code calculation from 21 grounded lines and materials sheet ${sheet?.doc || "-"}).`,
      compare: {
        cols: [
          { title: "Phase 1: two calls agree, so pay", short: "Self-check", tone: "trap", said: `Calculate: ${JSON.stringify(c1)}\nRe-calculate: ${JSON.stringify(c2)}`,
            verdict: paidWrong
              ? `Both calls said **${fmt(f1)}**: consistent, fluent and wrong. Line ${UNPRICED} was never priced, so the pipeline paid without an adjuster.`
              : `The pipeline chose ${act1.action} at ${fmt(act1.amount)}, without ever learning that line ${UNPRICED} was a gap.` },
          { title: "Phase 2: model copies, code decides", short: "Code decides", tone: "fix", said: `${lines.length} lines; null on line ${nulls.join(", ") || "none"}`,
            verdict: good2
              ? `Code saw line ${UNPRICED} was unpriced and **held** the claim, fetched the sheet, computed **${money(calc.payout)}** and escalated it (above ${money(AUTHORITY)}).`
              : `Outcome: ${act2.action}. ${g.errors.length ? `Grounding errors: ${g.errors.slice(0, 2).join("; ")}.` : ""}` },
        ],
        rows: [
          ["What Claude was asked for", "the payout, twice", { v: "the lines it can read; null where none is printed", tone: "good" }],
          [`Line ${UNPRICED} (paint and materials)`, { v: "silently left out", tone: "bad" }, { v: "null → hold → materials sheet $486.30", tone: "good" }],
          ["The check", { v: agree ? "two calls agree" : "two calls disagree", tone: "bad" }, { v: "ground every line in the quote, compute in code", tone: "good" }],
          ["Figure acted on", { v: fmt(act1.amount), tone: paidWrong ? "bad" : "good" }, { v: fmt(act2.amount), tone: good2 ? "good" : "bad" }],
          ["Action", { v: act1.action, tone: act1.action === "escalate_to_adjuster" ? "good" : "bad" }, { v: act2.action, tone: good2 ? "good" : "bad" }],
        ],
        note: `Same quote, same terms, same model. The exact payout is ${money(EXACT.payout)}. Agreement between two calls of the same model is not an independent check; the quote and the policy terms, applied in code, are.`,
      },
      checks: [
        E.check(`Phase 1: both calls agreed on a figure that leaves out unpriced line ${UNPRICED}, and it was paid without an adjuster`, paidWrong && agree),
        E.check(`Phase 2: all 21 lines extracted; the 20 priced amounts match the quote and line ${UNPRICED} came back null, not guessed`, lines.length === LINES.length && g.errors.length === 0 && nulls.length === 1 && nulls[0] === UNPRICED),
        E.check("Phase 2: code held the claim until the materials sheet arrived, then computed the payout itself", sys2.actions[0]?.action === "hold" && !!calc && calc.payout === EXACT.payout),
        E.check(`Phase 2: ${money(EXACT.payout)} is above the $5,000 authority, so the claim was escalated to an adjuster`, act2.action === "escalate_to_adjuster" && act2.amount === EXACT.payout),
      ],
    };
  },
};
