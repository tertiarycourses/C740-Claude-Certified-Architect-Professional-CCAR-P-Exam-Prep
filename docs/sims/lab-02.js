// Lab 2 · Task 1.2 · Simulator 1 (Harbour Mutual): input → processing → output → feedback, end to end.
// Three claims go through the same Claude decision step twice. Phase 1 is open loop: whatever Claude decides
// is executed, and nothing is learned. Phase 2 closes the loop: input checks, an output validator in code,
// one repair retry with the errors (seconds), an action gate that sends rule breaks to a human adjuster
// (minutes), and every adjuster decision captured as a labelled eval case (days).
// The decision prompt is the same lean prompt in both phases. Like a real prompt, it does not carry every
// rule (the US$5,000 payout authority lives in finance's mandate): the point is what the pipeline checks.
import { POLICIES, CLAIMS, AUTHORITY, payoutRules, amountDue } from "./shared/d1-harbour.js";
import { pass, obj, str, num, oneOf, money } from "./shared/d1-kit.js";

const ORDER = ["CLM-7781", "CLM-7790", "CLM-7815"];
const SYSTEM = "You are Harbour Mutual's claims decision step. Decide the motor claim from the claim and policy records and draft a short letter to the customer (under 70 words).";
const DECISION = obj({
  claim_id: str(),
  decision: oneOf(["approve", "decline", "refer"], "approve = pay now; decline = not covered; refer = send to a human adjuster"),
  payout_amount: num("US$ to pay; 0 unless approved"),
  reason: str("One sentence."),
  letter: str(),
});

const record = (id) => { const c = CLAIMS[id]; return `<claim>\n${JSON.stringify(c, null, 1)}\n</claim>\n<policy>\n${JSON.stringify(POLICIES[c.policy_id], null, 1)}\n</policy>`; };

async function decide(s, E, id, feedback) {
  const r = await pass(s, E, {
    label: `(decide ${id}${feedback ? ", retry" : ""})`, system: SYSTEM, schema: DECISION, max_tokens: 2000,
    prompt: record(id) + (feedback ? `\n\nYour previous decision failed these checks:\n${feedback.map((v) => `- ${v.rule}: ${v.detail}`).join("\n")}\nDecide again.` : "\n\nDecide this claim."),
  });
  return r.data || { claim_id: id, decision: "unreadable", payout_amount: 0, reason: "no JSON", letter: "" };
}

// The human adjuster (simulated): applies the manual and the policy, and records why.
function adjuster(id) {
  const c = CLAIMS[id], p = POLICIES[c.policy_id], due = amountDue(c, p);
  return due > 0 ? { decision: "approve", payout_amount: due, by: "adjuster L. Ferreira", note: `covered; quote ${c.repair_quote} minus excess ${p.excess}; approved above the agent's authority` }
                 : { decision: "decline", payout_amount: 0, by: "adjuster L. Ferreira", note: `${p.cover} does not cover ${c.type}` };
}

export default {
  id: 2,
  see: "Phase 1 (open loop): Claude approves CLM-7815 for about $6,500 and the pipeline pays it straight away, above the agent's $5,000 authority, and nothing is recorded to learn from. Phase 2 (same prompt, closed loop): the input checks pass, the output validator stops CLM-7815 on the authority rule, the action gate sends it to the adjuster, the adjuster approves it, and that decision is saved as a labelled eval case. Payouts inside the rules (CLM-7781, $3,700) go through.",
  try: "Change CLM-7781's repair_quote in shared/d1-harbour.js to 5,800 and run it again: in Phase 1 it is paid unchecked; in Phase 2 it joins the adjuster queue and the eval set grows by one more case. Then delete the excess from the policy wording and see whether the validator's repair retry (loop A) catches a wrong amount.",
  explain: "Input, processing and output are what you demo; the feedback loops are what you operate. Phase 1 executes whatever the model returns: one approval above the payout authority is paid, and because nothing is checked or recorded, the same mistake will happen again tomorrow. Phase 2 keeps the same model and prompt and wraps it: input checks before the call, an output validator in code after it (coverage, quote minus excess, authority), a single repair retry with the errors for fixable mistakes (seconds), an action gate that sends rule breaks to a human adjuster instead of executing them (minutes), and every adjuster decision stored as a labelled eval case for the next prompt or model change to be tested against (days). The validator fails closed: anything it cannot pass goes to a person.",
  scene: {
    title: "Harbour Mutual: three claims, one decision step. What checks it, and what learns from it?",
    caption: "Both phases send CLM-7781 (bumper, $4,200), CLM-7790 (third-party-only policy, $18,600) and CLM-7815 (front end, $7,250) through the same Claude decision step with the same prompt. Only the stages around it differ.",
    lanes: [
      { key: "p1", label: "Phase 1 · open loop", sub: "input → Claude → execute", tone: "trap", on: /Phase 1/, stages: [
        { id: "a_in", icon: "📥", t: "3 claims in", s: "no input checks" },
        { id: "a_dec", icon: "🤖", t: "Decision step", s: "the same lean prompt", claude: true },
        { id: "a_gate", icon: "🚦", t: "Output check + gate", s: "none: every decision executes", diff: true },
        { id: "a_fb", icon: "🔁", t: "Feedback captured", s: "none" },
        { id: "a_out", icon: "💳", t: "Payouts", s: "want: only valid payouts within $5,000", out: true } ] },
      { key: "p2", label: "Phase 2 · closed loop", sub: "validate, repair, gate, learn", tone: "fix", on: /Phase 2/, stages: [
        { id: "b_in", icon: "📥", t: "Input checks", s: "claimant = holder, policy active, quote present" },
        { id: "b_dec", icon: "🤖", t: "Decision step", s: "the same lean prompt", claude: true },
        { id: "b_gate", icon: "🚦", t: "Validator + action gate", s: "rules in code; retry once; else to a person", diff: true },
        { id: "b_fb", icon: "🔁", t: "Adjuster → eval set", s: "each human decision becomes a test case" },
        { id: "b_out", icon: "💳", t: "Payouts", s: "want: only valid payouts within $5,000", out: true } ] },
    ],
  },
  slide: {
    title: "Close the loop: validate, gate, and learn from every review",
    code: `def handle(claim):
    if errs := validate_input(claim):                 # KEY 1
        return reject(claim, errs)
    d = claude_decide(claim, policy)
    v = payout_rules(claim, policy, d)                # KEY 2
    if v and all(x.repairable for x in v):
        d = claude_decide(claim, policy, feedback=v)  # retry once
        v = payout_rules(claim, policy, d)
    if v:                                             # KEY 3
        human = adjuster_queue.review(claim, d, v)
        eval_set.add(case(claim, d, human))           # KEY 4
        return human
    return execute(d)`,
    keys: [["1", "Check the input first", "Claimant, policy and quote before any Claude call."],
           ["2", "Rules in code, after Claude", "Coverage, quote minus excess, the $5,000 authority."],
           ["3", "The gate fails closed", "A rule break goes to a person, never to execution."],
           ["4", "Reviews become eval cases", "Each human decision is a labelled test for next time."]],
  },
  async run(s, E) {
    s.log("Harbour Mutual · claims CLM-7781 (Priya Nair, rear bumper $4,200), CLM-7790 (Daniel Okafor, total loss $18,600, third party only), CLM-7815 (Arjun Mehta, front end $7,250). Agent payout authority: $5,000.", "note");

    s.log("== Phase 1 · open loop: whatever the decision step returns is executed", "note");
    s.show("a_in", "3 claims, unchecked", "done");
    s.show("a_gate", "no checks", "done");
    const open = [];
    for (const id of ORDER) {
      const d = await decide(s, E, id);
      const violations = payoutRules(CLAIMS[id], POLICIES[CLAIMS[id].policy_id], d);
      open.push({ id, d, violations, executed: d.decision === "approve" ? Number(d.payout_amount) : 0 });
      s.log(`${id}: ${d.decision} ${d.decision === "approve" ? money(d.payout_amount) : ""} → executed${violations.length ? ` (unchecked rule breaks: ${violations.map((v) => v.rule).join(", ")})` : ""}`, "note");
    }
    const overPaid = open.filter((x) => x.executed > AUTHORITY);
    const badPaid1 = open.filter((x) => x.executed > 0 && x.violations.length);
    s.show("a_dec", open.map((x) => `${x.id.slice(4)} ${x.d.decision}`).join(" · "), "done");
    s.show("a_fb", "0 cases recorded", "done");
    s.show("a_out", `${money(open.reduce((t, x) => t + x.executed, 0))} paid · ${badPaid1.length} broke a rule`, badPaid1.length ? "bad" : "good");
    await s.pause({
      title: "Phase 1 finished: open loop",
      outcome: (overPaid.length ? `**${overPaid.map((x) => `${x.id} was paid ${money(x.executed)}`).join(", ")}**, above the $${AUTHORITY.toLocaleString()} authority, with no check and no person in the path. `
                                : badPaid1.length ? `**${badPaid1.length} payout${badPaid1.length === 1 ? "" : "s"} broke a rule** and went out unchecked. ` : "Every decision happened to be inside the rules this time, but nothing checked it. ") +
        "Nothing was recorded either, so tomorrow's run can make the same mistake.",
      next: "Phase 2: the same decision step inside a closed loop",
    });

    s.log("== Phase 2 · closed loop: input checks, output validator, repair retry, action gate, feedback to the eval set", "note");
    const inputOk = ORDER.filter((id) => { const c = CLAIMS[id], p = POLICIES[c.policy_id]; return p && p.status === "active" && p.holder === c.claimant && c.repair_quote > 0; });
    s.log(`Input checks: ${inputOk.length}/${ORDER.length} claims valid (claimant is the policyholder, policy active, quote present)`, "note");
    s.show("b_in", `${inputOk.length}/${ORDER.length} claims valid`, "done");
    const closed = [], evalSet = [];
    for (const id of inputOk) {
      const c = CLAIMS[id], p = POLICIES[c.policy_id];
      let d = await decide(s, E, id);
      let v = payoutRules(c, p, d), retried = false;
      if (v.length && v.every((x) => x.repairable)) {
        s.log(`${id}: validator → ${v.map((x) => x.detail).join("; ")} → one repair retry (loop A, seconds)`, "note");
        retried = true;
        d = await decide(s, E, id, v);
        v = payoutRules(c, p, d);
      }
      const row = { id, d, violations: v, retried, executed: 0, routed: false };
      if (v.length) {
        row.routed = true;
        const h = adjuster(id);
        row.human = h;
        if (h.decision === "approve") row.executed = h.payout_amount;
        const agree = h.decision === d.decision && Math.abs(Number(h.payout_amount) - Number(d.payout_amount)) < 0.01;
        const kase = { case_id: `EV-${id.slice(4)}`, input: { claim: id, policy: c.policy_id }, model: { decision: d.decision, payout_amount: d.payout_amount }, human: { decision: h.decision, payout_amount: h.payout_amount, by: h.by },
                       label: agree ? "model agreed with adjuster; held only by the gate" : "adjuster overrode the model", rules_broken: v.map((x) => x.rule) };
        evalSet.push(kase);
        s.log(`${id}: validator → ${v.map((x) => `${x.rule} (${x.detail})`).join("; ")} → action gate: adjuster queue (loop B, minutes)`, "note");
        s.log(`${id}: adjuster ${h.decision} ${h.decision === "approve" ? money(h.payout_amount) : ""} · eval case ${kase.case_id} saved: ${JSON.stringify(kase)} (loop C, days)`, "note");
      } else {
        if (d.decision === "approve") row.executed = Number(d.payout_amount);
        s.log(`${id}: validator passed → executed: ${d.decision} ${d.decision === "approve" ? money(d.payout_amount) : ""}`, "note");
      }
      closed.push(row);
    }
    const routed = closed.filter((x) => x.routed);
    const autoPaid = closed.filter((x) => !x.routed && x.executed > 0);
    const autoOver = autoPaid.filter((x) => x.executed > AUTHORITY);
    const autoBad = closed.filter((x) => !x.routed && x.executed > 0 && payoutRules(CLAIMS[x.id], POLICIES[CLAIMS[x.id].policy_id], x.d).length);
    const r7815 = closed.find((x) => x.id === "CLM-7815");
    s.show("b_dec", closed.map((x) => `${x.id.slice(4)} ${x.d.decision}${x.retried ? " (retried)" : ""}`).join(" · "), "done");
    s.show("b_gate", `${routed.length} to adjuster: ${routed.map((x) => x.id).join(", ") || "none"}`, "done");
    s.show("b_fb", `${evalSet.length} eval case${evalSet.length === 1 ? "" : "s"} saved`, "done");
    s.show("b_out", `auto-paid ${autoPaid.map((x) => `${x.id.slice(4)} ${money(x.executed)}`).join(", ") || "none"} · ${routed.length} reviewed`,
      !autoOver.length && !autoBad.length && r7815?.routed ? "good" : "bad");

    const line = (x) => `${x.id}: model ${x.d.decision} ${x.d.decision === "approve" ? money(x.d.payout_amount) : ""}${x.retried ? " after one retry" : ""} → ${x.routed ? `held by the gate (${x.violations.map((v) => v.rule).join(", ")}); adjuster ${x.human.decision} ${x.human.decision === "approve" ? money(x.human.payout_amount) : ""}` : "passed the validator, executed"}`;
    const final = `Closed-loop run\n${closed.map(line).join("\n")}\n\nEval set: ${evalSet.length} new labelled case${evalSet.length === 1 ? "" : "s"} (${evalSet.map((k) => `${k.case_id}: ${k.label}`).join("; ") || "none"}).\n\nLetter for ${closed[0]?.id}: ${closed[0]?.d.letter || ""}`;
    const paidList = (rows) => rows.filter((x) => x.executed > 0).map((x) => `${x.id.slice(4)} ${money(x.executed)}`).join(", ") || "none";
    return {
      final,
      compare: {
        cols: [
          { title: "Phase 1: open loop", short: "Open loop", tone: "trap",
            verdict: overPaid.length ? `Paid **${overPaid.map((x) => `${x.id} ${money(x.executed)}`).join(", ")}** above the $5,000 authority with no check, and recorded nothing to learn from.`
                                     : `Executed every decision unchecked (${badPaid1.length} rule break${badPaid1.length === 1 ? "" : "s"}) and recorded nothing to learn from.` },
          { title: "Phase 2: closed loop", short: "Closed loop", tone: "fix",
            verdict: `The validator held ${routed.map((x) => x.id).join(", ") || "nothing"} for the adjuster; ${autoPaid.length} payout${autoPaid.length === 1 ? "" : "s"} inside the rules went straight through; ${evalSet.length === 1 ? "the adjuster's decision became an eval case" : `${evalSet.length} adjuster decisions became eval cases`}.` },
        ],
        rows: [
          ["Decision step (model and prompt)", "the same", "the same"],
          ["Input checks before the call", { v: "none", tone: "bad" }, { v: `${inputOk.length}/${ORDER.length} valid`, tone: "good" }],
          ["Decisions", open.map((x) => `${x.id.slice(4)} ${x.d.decision}`).join(", "), closed.map((x) => `${x.id.slice(4)} ${x.d.decision}`).join(", ")],
          ["Paid without a person", { v: paidList(open), tone: badPaid1.length ? "bad" : "" }, { v: paidList(autoPaid), tone: autoOver.length || autoBad.length ? "bad" : "good" }],
          ["Rule breaks executed", { v: String(badPaid1.length), tone: badPaid1.length ? "bad" : "good" }, { v: String(autoBad.length), tone: autoBad.length ? "bad" : "good" }],
          ["Sent to the adjuster", "none", routed.map((x) => x.id).join(", ") || "none"],
          ["Feedback captured (eval cases)", { v: "0", tone: "bad" }, { v: String(evalSet.length), tone: evalSet.length ? "good" : "bad" }],
        ],
        note: "Same claims, same model, same prompt. Phase 2 adds the stages around the call: checks before, a validator and gate after, and a feedback path that turns every human decision into a test case.",
      },
      checks: [
        E.check("Phase 1 (open loop): a payout above the $5,000 authority was executed with no check", overPaid.length >= 1),
        E.check("Phase 2: the output validator held CLM-7815 and the action gate sent it to the adjuster", !!r7815?.routed && r7815.violations.some((v) => v.rule === "authority" || v.rule === "amount")),
        E.check("Phase 2: every payout executed without a person passed the rules (covered, quote minus excess, within $5,000)", !autoOver.length && !autoBad.length),
        E.check("Phase 2: each adjuster decision was saved as a labelled eval case", evalSet.length === routed.length && evalSet.length >= 1),
      ],
    };
  },
};
