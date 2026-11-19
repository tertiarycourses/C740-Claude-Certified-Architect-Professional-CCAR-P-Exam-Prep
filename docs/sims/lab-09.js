// Lab 9 · Task 2.3 · Simulator 1: few-shot edge cases, with reasoning before the label.
// Harbour Mutual's triage classifier routes eight incoming motor claims (four routes, an answer key).
//   1. zero-shot: the policies and one-line route definitions, label only;
//   2. the same definitions plus six worked edge-case examples, each with short reasoning, and an output
//      schema that puts "reasoning" before "label".
// Both phases run with thinking off, as a high-volume classifier would, so the only reasoning is the prompt's.
import { POLICIES, LABELS, CLAIMS, EDGE_IDS, claimList, exampleList, schema } from "./shared/d2-harbour.js";

const SYSTEM = `You are Harbour Mutual's claims triage classifier. Route each incoming motor claim.\n\n${POLICIES}\n\n${LABELS}`;

async function classify(s, E, few) {
  const system = few ? `${SYSTEM}\n\nWorked examples of how Harbour routes claims:\n${exampleList()}` : SYSTEM;
  const prompt = `Route these claims:\n${claimList()}${few ? "\nFor each claim, write brief reasoning first, then the label." : ""}`;
  const resp = await E.callClaude(s, { system, max_tokens: 3000, thinking: { type: "disabled" },
    output_config: { format: { type: "json_schema", schema: schema(few) } },
    messages: [{ role: "user", content: prompt }] });
  let out = null;
  try { out = JSON.parse(E.textOf(resp.content)).claims; } catch { out = null; }
  const rows = CLAIMS.map((c) => {
    const o = (out || []).find((x) => x.claim_id === c.id) || {};
    return { ...c, got: o.label || "(none)", reasoning: o.reasoning || "", ok: o.label === c.want };
  });
  for (const r of rows) s.log(`  ${r.ok ? "ok   " : "WRONG"} ${r.id} → ${r.got}${r.ok ? "" : ` (answer key: ${r.want})`}${r.edge ? `  · edge: ${r.edge}` : ""}${r.reasoning ? `\n         reasoning: ${E.short(r.reasoning, 170)}` : ""}`, r.ok ? "result" : "error");
  s.log(`  usage: input_tokens ${resp.usage.input_tokens} · output_tokens ${resp.usage.output_tokens}`, "note");
  return { rows, parsed: !!out, usage: resp.usage, score: rows.filter((r) => r.ok).length };
}

export default {
  id: 9,
  see: "Zero-shot, the classifier gets the three plain claims right and misroutes the same boundary cases every time: a US$5,600 quote whose payout after the excess is US$4,850, a third-party-only policyholder whose victim is claiming, and a write-off on a third-party-only policy. With six worked edge-case examples and reasoning written before each label, all eight claims route correctly.",
  try: "In sims/shared/d2-harbour.js delete the first example (the US$5,250 trolley dent) and run again: CLM-7815 usually goes back to adjuster_review. Then keep the examples but remove the reasoning field from the schema in schema(true): the labels get less stable on the boundary cases.",
  explain: "A one-line definition of each route is enough for the plain claims and not enough for the boundaries: does the US$5,000 authority apply to the quote or the payout, and does third-party only cover the van you reversed into? Zero-shot, the classifier guesses, and it guesses the same way every time, so the errors are systematic. A handful of worked examples placed on those boundaries shows how Harbour applies its own rules, and asking for short reasoning before the label (here, by putting reasoning first in the output schema) makes the classifier work the case through before it commits. Structured output keeps the result machine-readable either way; examples and reasoning are what move accuracy.",
  scene: {
    title: "Harbour Mutual: 8 claims, 4 routes. Where does the zero-shot router go wrong?",
    caption: "Both phases route the same eight claims against the same answer key, with the same policies, route definitions and model, thinking off. Only the examples and the reasoning step change.",
    lanes: [
      { key: "in", label: "Eval set", sub: "8 incoming claims with an answer key", stages: [
        { id: "claims", icon: "📨", t: "8 motor claims", s: "3 plain, 5 on a boundary" },
        { id: "routes", icon: "🧭", t: "4 routes", s: "auto_approve · adjuster · decline · glass" },
        { id: "key", icon: "✅", t: "Answer key", s: "set by Harbour's adjusters" } ] },
      { key: "p1", label: "Phase 1 · zero-shot", sub: "route definitions only, label only", tone: "trap", on: /Phase 1/, stages: [
        { id: "a_prompt", icon: "📝", t: "One-line definitions", s: "no examples", diff: true },
        { id: "a_cls", icon: "🤖", t: "Classifier", s: "one call, thinking off", claude: true },
        { id: "a_fmt", icon: "🧾", t: "Output: label only", s: "{claim_id, label}", diff: true },
        { id: "a_out", icon: "🎯", t: "Routed correctly", s: "want: 8/8, edge cases included", out: true } ] },
      { key: "p2", label: "Phase 2 · few-shot + reasoning first", sub: "6 worked edge cases, reasoning before the label", tone: "fix", on: /Phase 2/, stages: [
        { id: "b_prompt", icon: "📚", t: "6 worked examples", s: "excess, liability, injury, exclusion", diff: true },
        { id: "b_cls", icon: "🤖", t: "Classifier", s: "one call, thinking off", claude: true },
        { id: "b_fmt", icon: "🧾", t: "Reasoning, then label", s: "{claim_id, reasoning, label}", diff: true },
        { id: "b_out", icon: "🎯", t: "Routed correctly", s: "want: 8/8, edge cases included", out: true } ] },
    ],
  },
  slide: {
    title: "Show the boundary cases, and reason before the label",
    code: `EXAMPLES = """<example>                             # KEY 1
<claim policy="HM-POL-2201">Door dented by a trolley.
Repair quote US$5,250.</claim>
<reasoning>Payout = quote - US$500 excess = US$4,750,
within the US$5,000 authority.</reasoning>     # KEY 2
<label>auto_approve</label>
</example> ..."""                              # 6 boundary cases
item = {"claim_id": str, "reasoning": str,     # KEY 3
        "label": Enum(ROUTES)}                 # label comes last
resp = client.messages.create(model="claude-haiku-5-5",
    system=POLICIES + ROUTES_DEF + EXAMPLES,
    messages=[{"role": "user", "content": claims}],
    output_config={"format": json_schema([item])})
print(score(resp, answer_key))                 # KEY 4`,
    keys: [["1", "Examples on the boundaries", "Pick cases the one-line rules leave open."],
           ["2", "Each shows its reasoning", "The example teaches the rule, not just a label."],
           ["3", "Reasoning before the label", "Field order makes Claude think, then commit."],
           ["4", "Score on an answer key", "Same eight claims before and after the change."]],
  },
  async run(s, E) {
    s.log(`Harbour Mutual claims triage: ${CLAIMS.length} incoming claims, 4 routes, an answer key from the adjusters. Both phases run with thinking off, as a high-volume classifier would.`, "note");
    s.show("claims", `${CLAIMS.length} claims: ${CLAIMS.map((c) => c.id.slice(4)).join(" ")}`, "done");
    s.show("key", `${EDGE_IDS.length} edge cases flagged`, "done");

    s.log("== Phase 1 · zero-shot: route definitions only, label only", "note");
    s.show("a_prompt", "policies + 4 one-line routes", "done");
    const p1 = await classify(s, E, false);
    const miss1 = p1.rows.filter((r) => !r.ok);
    s.show("a_cls", `${p1.usage.output_tokens} output tokens`, "done");
    s.show("a_fmt", p1.parsed ? "parsed: 8 labels, no reasoning" : "did not parse", "done");
    s.show("a_out", `${p1.score}/8 · wrong: ${miss1.map((r) => r.id.slice(4)).join(", ") || "none"}`, p1.score === 8 ? "good" : "bad");
    await s.pause({
      title: "Phase 1 finished: zero-shot",
      outcome: `**${p1.score} of 8** claims routed correctly. ` + (miss1.length
        ? `Misrouted: ${miss1.map((r) => `**${r.id}** → ${r.got} (key: ${r.want}${r.edge ? `; ${r.edge}` : ""})`).join("; ")}. The plain claims are fine; the boundaries are where a one-line definition leaves Claude guessing.`
        : "This run got them all; the boundary cases still rest on guesses the prompt does not settle."),
      next: "Phase 2: the same definitions plus six worked edge-case examples, reasoning before the label",
    });

    s.log("== Phase 2 · few-shot: 6 worked edge-case examples, reasoning before the label", "note");
    s.show("b_prompt", "6 examples, each with reasoning", "done");
    const p2 = await classify(s, E, true);
    const miss2 = p2.rows.filter((r) => !r.ok);
    s.show("b_cls", `${p2.usage.output_tokens} output tokens`, "done");
    s.show("b_fmt", p2.parsed ? "parsed: reasoning + label × 8" : "did not parse", "done");
    s.show("b_out", `${p2.score}/8${miss2.length ? ` · wrong: ${miss2.map((r) => r.id.slice(4)).join(", ")}` : " · every edge case right"}`, p2.score === 8 ? "good" : "bad");

    const edgeMiss1 = miss1.filter((r) => EDGE_IDS.includes(r.id));
    const fixed = miss1.filter((r) => p2.rows.find((x) => x.id === r.id).ok);
    s.log(`== Result: zero-shot ${p1.score}/8 · few-shot with reasoning ${p2.score}/8 · fixed: ${fixed.map((r) => r.id).join(", ") || "none"}`, "note");
    const cell = (r) => ({ v: r.got, tone: r.ok ? "good" : "bad" });
    return {
      final: p2.rows.map((r) => `${r.id} → ${r.got}: ${r.reasoning}`).join("\n"),
      compare: {
        cols: [
          { title: "Phase 1: zero-shot, label only", short: "Zero-shot", tone: "trap",
            verdict: `**${p1.score}/8** correct. ${miss1.length ? `Misrouted ${miss1.map((r) => r.id).join(", ")}: the plain claims are right, the boundaries are guessed.` : "All correct this run; nothing in the prompt settles the boundaries."}` },
          { title: "Phase 2: few-shot examples, reasoning before the label", short: "Few-shot + reasoning", tone: "fix",
            verdict: p2.score === 8 ? `**8/8** correct, including ${fixed.length ? fixed.map((r) => r.id).join(", ") : "every boundary case"}. Each label follows a line of reasoning a reviewer can check.`
              : `**${p2.score}/8** correct; still wrong: ${miss2.map((r) => r.id).join(", ")}. Read the live output: Claude writes each run fresh.` },
        ],
        rows: [
          ...p1.rows.map((r, i) => [`${r.id} (key: ${r.want})${r.edge ? ` · ${r.edge}` : ""}`, cell(r), cell(p2.rows[i])]),
          ["Correct", `${p1.score}/8`, `${p2.score}/8`],
          ["Output tokens (the cost of the reasoning)", String(p1.usage.output_tokens), String(p2.usage.output_tokens)],
        ],
        note: "Same eight claims, same route definitions, same model, thinking off in both. The examples sit on the boundaries the definitions leave open, and the schema asks for reasoning before the label. The price is a longer prompt and more output tokens per claim.",
      },
      checks: [
        E.check("Both phases returned parseable JSON with a route for all 8 claims", p1.parsed && p2.parsed && p1.rows.every((r) => r.got !== "(none)") && p2.rows.every((r) => r.got !== "(none)")),
        E.check(`Zero-shot misrouted at least 2 edge cases (${edgeMiss1.map((r) => r.id).join(", ") || "none"})`, edgeMiss1.length >= 2),
        E.check(`Few-shot with reasoning routed all 8 claims correctly (${p2.score}/8)`, p2.score === 8),
        E.check("Few-shot output carries reasoning for every claim, ahead of the label", p2.rows.every((r) => r.reasoning.length > 20)),
      ],
    };
  },
};
