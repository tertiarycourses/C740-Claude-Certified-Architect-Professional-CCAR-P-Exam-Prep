// Lab 4 · Task 1.4 · Simulator 1 (Harbour Mutual): split the overloaded claims agent, then reconcile.
// CLM-7781 needs three investigations: coverage (the policy wording), damage (the assessment) and fraud
// (claim history and the garage's invoice registry, where invoice RQ-5531 was already paid on CLM-6120).
// Both phases split the work into coverage, damage and fraud specialists, each seeing only its own slice of
// the claim file, with the same remit text. The orchestration differs:
// Phase 1: a lead agent fans the claim out to peer agents, each authorised to settle its own part
//          (approve_payout or escalate). Nobody reconciles: each acts on a partial view.
// Phase 2: a coordinator spawns read-only subagents that return structured findings, and reconciles them
//          before the only payout decision.
import { AUTHORITY } from "./shared/d1-harbour.js";
import { ID, WORDING, ASSESSMENT, REGISTRY, HISTORY, claim, policy } from "./shared/d1-claimfile.js";
import { obj, str, num, arr, money } from "./shared/d1-kit.js";

// The three remits, word for word the same in both phases.
const REMIT = {
  coverage: "Coverage: confirm the policy covers this loss and work out the amount due under the policy wording (excess, the lower of quote and assessed cost).",
  damage: "Damage: check the customer's description of the incident against the independent assessment.",
  fraud: "Fraud: check the claimant's claim history and the garage's registered invoices; an invoice number already used on another claim is a duplicate.",
};
// Each specialist's slice of the claim file: only what its remit needs.
const SLICE = {
  coverage: () => ({ claim: claim(), policy: policy(), assessed_cost: ASSESSMENT.assessed_cost, policy_wording: WORDING }),
  damage: () => ({ claim: claim(), assessment: ASSESSMENT }),
  fraud: () => ({ claim: claim(), claim_history: HISTORY, garage_invoices: REGISTRY }),
};
const FINDING = obj({
  remit: str(), status: { type: "string", enum: ["clear", "flag"], description: "flag = something an adjuster must see" },
  amount_due: num("US$ due under the policy; 0 if not your remit"),
  evidence: arr(str(), "Specific ids, numbers and sections you relied on"), summary: str("One sentence."),
});
const LIMIT = `$${AUTHORITY.toLocaleString("en-US")}`;

function actions() {
  const st = { payouts: [], escalations: [] };
  const t = (description, props, run) => ({ description, input_schema: { type: "object", properties: Object.fromEntries(props.map((p) => [p, { type: p === "amount" ? "number" : "string" }])), required: props }, run });
  return { st,
    approve_payout: (who) => t("Approve a payout to the claimant (US$).", ["claim_id", "amount"], ({ claim_id, amount }) => { st.payouts.push({ who, claim_id, amount: Number(amount) }); return { approved: true, claim_id, amount }; }),
    escalate_to_adjuster: (who) => t("Send the claim to a human adjuster with the reason.", ["claim_id", "reason"], ({ claim_id, reason }) => { st.escalations.push({ who, claim_id, reason }); return { queued: true }; }),
  };
}
const agentTool = (description, run) => ({ description,
  input_schema: { type: "object", properties: { remit: { type: "string", enum: ["coverage", "damage", "fraud"] }, prompt: { type: "string" } }, required: ["remit", "prompt"] }, run });
const sliceText = (remit) => `<claim_file_slice>\n${JSON.stringify(SLICE[remit](), null, 1)}\n</claim_file_slice>`;
const dupNamed = (txt) => /RQ-5531/.test(txt) && /CLM-6120/.test(txt);

export default {
  id: 4,
  see: "Phase 1: the lead agent routes CLM-7781 to three peer agents that may each settle their part. The coverage agent, which never sees the invoice registry, approves $3,650; the fraud agent finds invoice RQ-5531 already paid on CLM-6120 and escalates. The same claim is paid and sent for fraud review at once. Phase 2: the coordinator spawns the same three specialists as read-only subagents, gets back three structured findings, and reconciles them: the fraud flag outweighs the clean coverage result, so it escalates and pays nothing.",
  try: "Change the duplicate row in shared/d1-claimfile.js to a fresh invoice number and run it again: in Phase 2 the fraud finding comes back clear and the coordinator approves the coverage subagent's $3,650. Then give the Phase 2 subagents the approve_payout tool as well and watch the reconciliation stop mattering.",
  explain: "Splitting an overloaded agent is worth it when the work needs different contexts: the policy wording, the assessment and a 30-row invoice registry are mostly noise to each other. But a split creates the orchestration question: who decides? In Phase 1 every specialist can act, so each acts on a partial view; the coverage agent pays a claim the fraud agent is escalating, and no step ever sees both results. In Phase 2 the specialists only find: each returns a structured finding (status, amount, evidence) and holds no tool that changes anything. The coordinator reconciles the findings with one rule (any flag goes to a person) and makes the only payout decision. More agents cost more calls and tokens, so split only where contexts pollute each other or the work runs in parallel, and always say where the results meet.",
  diagram: { kind: "agents", title: "Fan out, then reconcile: who sees all three results before anyone acts?",
    main: "Claims lead / coordinator", sub: "specialist", ghost: [{ main: "Claims lead / coordinator", subs: ["coverage", "damage", "fraud"] }],
    caption: "In both phases the main agent calls its <b>Agent</b> tool once per remit, all in one turn, and each specialist sees only its own slice of the claim file. Phase 1's specialists can approve or escalate on their own. Phase 2's hand back findings only, and the coordinator acts once, after reading all three." },
  scene: {
    title: "CLM-7781: coverage, damage, fraud. Where do the three results meet?",
    caption: "Both phases split the work into the same three specialists with the same remits and the same slices of the claim file. The fraud signal: invoice RQ-5531 from Bayside Panel Works was already paid on CLM-6120.",
    lanes: [
      { key: "p1", label: "Phase 1 · peers that each settle", sub: "fan out, no reconciliation", tone: "trap", on: /Phase 1/, stages: [
        { id: "a_lead", icon: "🧭", t: "Claims lead agent", s: "routes the claim to 3 specialists", claude: /^$/, tools: ["Agent"] },
        { id: "a_subs", icon: "🔎", t: "Coverage · damage · fraud", s: "own slice; may approve or escalate", claude: /peer/, diff: true },
        { id: "a_act", icon: "💳", t: "Actions taken", s: "each acts on its partial view", tools: ["approve_payout", "escalate_to_adjuster"] },
        { id: "a_rec", icon: "⚖️", t: "Reconciliation", s: "none: no step sees all three" },
        { id: "a_out", icon: "📋", t: "Outcome for CLM-7781", s: "want: one decision, duplicate escalated", out: true } ] },
      { key: "p2", label: "Phase 2 · coordinator reconciles", sub: "read-only subagents, one decision", tone: "fix", on: /Phase 2/, stages: [
        { id: "b_coord", icon: "🧭", t: "Coordinator", s: "spawns 3 subagents in one turn", claude: /^$/, tools: ["Agent"] },
        { id: "b_subs", icon: "🔎", t: "Coverage · damage · fraud", s: "own slice; findings only, cannot act", claude: /subagent/, diff: true },
        { id: "b_find", icon: "🧾", t: "Structured findings", s: "status, amount_due, evidence" },
        { id: "b_rec", icon: "⚖️", t: "Reconcile, then act once", s: "any flag goes to a person", tools: ["approve_payout", "escalate_to_adjuster"] },
        { id: "b_out", icon: "📋", t: "Outcome for CLM-7781", s: "want: one decision, duplicate escalated", out: true } ] },
    ],
  },
  slide: {
    title: "Specialists find; the coordinator reconciles, then acts",
    code: `SLICES = {"coverage": [claim, policy, wording],        # KEY 1
          "damage":   [claim, assessment],
          "fraud":    [claim, history, garage_invoices]}
def agent_tool(remit, prompt):                     # KEY 2
    return run_subagent(REMIT[remit], prompt,
                        data=SLICES[remit], tools=[],
                        output_schema=FINDING)
coordinator = Agent(
    tools=[agent_tool, approve_payout, escalate],
    system="Spawn coverage, damage and fraud in one turn. "
           "Any finding flagged -> escalate with the "   # KEY 3
           "evidence; else pay amount_due if <= $5,000.")
coordinator.run("Assess CLM-7781")                  # KEY 4`,
    keys: [["1", "Split by context needed", "Each specialist reads only the data its remit needs."],
           ["2", "Findings, not actions", "Subagents hold no tool that changes anything."],
           ["3", "One reconciliation rule", "A fraud flag outweighs a clean coverage result."],
           ["4", "One decision point", "Only the coordinator, after all three, can pay."]],
  },
  async run(s, E) {
    const c = claim(), p = policy();
    s.log(`Harbour Mutual · ${ID}: ${c.claimant}, rear bumper, quote ${money(c.repair_quote)} from ${c.garage}, invoice ${c.invoice_ref}. Policy ${p.policy_id}, excess ${money(p.excess)}.`, "note");

    s.log("== Phase 1 · peer specialists: the lead agent fans out to coverage, damage and fraud agents that may each settle their part", "note");
    const a1 = actions();
    const u1 = { ...s.usage };
    const peers = [];
    const lead = await E.runAgent(s, {
      system: "You are Harbour Mutual's claims lead. Route the claim to the three specialist agents with the Agent tool, one call per remit (coverage, damage, fraud), all in ONE turn. Each specialist is authorised to settle its own part of the claim. Then confirm in one sentence that the claim was routed.",
      prompt: `New claim ${ID} (policy ${p.policy_id}, garage ${c.garage}).`,
      tools: { Agent: agentTool("Hand the claim to a specialist agent. remit: coverage, damage or fraud. The agent receives your prompt plus its own slice of the claim file, and settles its part.",
        async ({ remit, prompt }) => {
          if (!SLICE[remit]) return { isError: true, message: `Unknown remit ${remit}` };
          s.show("a_subs", `running: ${remit}`, "hot");
          const r = await E.runAgent(s, {
            label: `(peer ${remit})`,
            system: `You are Harbour Mutual's ${remit} agent. ${REMIT[remit]} You are authorised to settle the claim within your remit: approve_payout if your checks are in order and the amount is within ${LIMIT}; otherwise escalate_to_adjuster with the reason. End with one sentence on what you did.`,
            prompt: `${prompt}\n\n${sliceText(remit)}`,
            tools: { approve_payout: a1.approve_payout(remit), escalate_to_adjuster: a1.escalate_to_adjuster(remit) },
            maxTurns: 3, max_tokens: 2000,
          });
          peers.push({ remit, text: r.text });
          return r.text || "done";
        }) },
      maxTurns: 3, max_tokens: 1500,
    });
    const cost1 = { calls: s.usage.calls - u1.calls, input: s.usage.input - u1.input };
    const paid1 = a1.st.payouts.filter((x) => x.claim_id === ID);
    const esc1 = a1.st.escalations.filter((x) => x.claim_id === ID);
    const fraudEsc1 = esc1.find((x) => x.who === "fraud" && dupNamed(x.reason));
    const total1 = paid1.reduce((t, x) => t + x.amount, 0);
    const act = (x) => `${x.who}: ${x.amount !== undefined ? `approve_payout ${money(x.amount)}` : `escalate (${E.short(x.reason, 90)})`}`;
    s.log(`Phase 1 actions on ${ID}: ${[...paid1, ...esc1].map(act).join(" | ") || "none"}`, "note");
    s.show("a_lead", `routed to ${peers.map((x) => x.remit).join(", ") || "nobody"}`, "done");
    s.show("a_subs", `${peers.length} agents acted on their own`, "done");
    s.show("a_act", `${paid1.length} payout${paid1.length === 1 ? "" : "s"} · ${esc1.length} escalation${esc1.length === 1 ? "" : "s"}`, "done");
    s.show("a_rec", "never happened", "done");
    const conflict1 = paid1.length > 0 && esc1.length > 0;
    s.show("a_out", conflict1 ? `paid ${money(total1)} AND escalated` : paid1.length ? `paid ${money(total1)}` : esc1.length ? "escalated only" : "no action", conflict1 || (paid1.length && !fraudEsc1) ? "bad" : "good");
    await s.pause({
      title: "Phase 1 finished: three specialists, three separate actions",
      outcome: conflict1 ? `**${paid1.map((x) => `The ${x.who} agent approved ${money(x.amount)}`).join("; ")}** while ${esc1.map((x) => `the ${x.who} agent escalated`).join(" and ")}${fraudEsc1 ? " because invoice RQ-5531 was already paid on CLM-6120" : ""}. The same claim was paid and sent for review at once: no step ever saw all three results.`
        : paid1.length ? `**${money(total1)} was approved** and nothing was escalated: the fraud result never reached the payer.` : `No payout this time (${esc1.length} escalation${esc1.length === 1 ? "" : "s"}), but nothing in the design stopped one: every specialist could pay.`,
      next: "Phase 2: the same specialists as read-only subagents; the coordinator reconciles before it acts",
    });

    s.log("== Phase 2 · coordinator: read-only subagents return findings; the coordinator reconciles them, then acts once", "note");
    const a2 = actions();
    const u2 = { ...s.usage };
    const findings = {};
    const coordinator = await E.runAgent(s, {
      system: `You are Harbour Mutual's claims coordinator. You do not investigate yourself. Use the Agent tool to spawn three subagents in ONE turn, one per remit: coverage, damage and fraud. Each sees only its own slice of the claim file and returns a JSON finding. Then reconcile the findings: if any finding is a flag, escalate_to_adjuster with the evidence; otherwise approve_payout for the coverage finding's amount_due if it is within ${LIMIT}. Finish with a two-sentence summary.`,
      prompt: `New claim ${ID} (policy ${p.policy_id}, garage ${c.garage}).`,
      tools: {
        Agent: agentTool("Spawn a specialist subagent. remit: coverage, damage or fraud. The subagent receives your prompt plus its own slice of the claim file, and returns a JSON finding. It cannot act.",
          async ({ remit, prompt }) => {
            if (!SLICE[remit]) return { isError: true, message: `Unknown remit ${remit}` };
            s.show("b_subs", `running: ${remit}`, "hot");
            const sub = await E.runAgent(s, {
              label: `(subagent ${remit})`,
              system: `You are Harbour Mutual's ${remit} specialist. ${REMIT[remit]} Report only on your remit.`,
              prompt: `${prompt}\n\n${sliceText(remit)}`,
              maxTurns: 1, max_tokens: 2000,
              output_config: { format: { type: "json_schema", schema: FINDING } },
            });
            let f; try { f = JSON.parse(sub.text); } catch { f = { remit, status: "flag", amount_due: 0, evidence: [], summary: "unreadable finding" }; }
            findings[remit] = f;
            return f;
          }),
        approve_payout: a2.approve_payout("coordinator"),
        escalate_to_adjuster: a2.escalate_to_adjuster("coordinator"),
      },
      maxTurns: 4, max_tokens: 2000,
    });
    const cost2 = { calls: s.usage.calls - u2.calls, input: s.usage.input - u2.input };
    const spawned = coordinator.calls.filter((x) => x.name === "Agent").map((x) => x.input.remit);
    const fraud = findings.fraud || {};
    const fraudFlag = fraud.status === "flag" && dupNamed(JSON.stringify(fraud));
    const paid2 = a2.st.payouts.reduce((t, x) => t + x.amount, 0);
    const esc2 = a2.st.escalations[0];
    const reconciled = !paid2 && a2.st.escalations.length === 1 && /RQ-5531|CLM-6120|duplicate/i.test(esc2.reason);
    s.log(`Findings: ${Object.entries(findings).map(([k, f]) => `${k} ${f.status}${f.amount_due ? ` (${money(f.amount_due)} due)` : ""}`).join(" · ")}`, "note");
    s.log(`Coordinator's one decision: ${paid2 ? `approve_payout ${money(paid2)}` : esc2 ? `escalate (${E.short(esc2.reason, 160)})` : "none"}`, "note");
    s.show("b_coord", `spawned ${spawned.join(", ") || "none"}`, "done");
    s.show("b_subs", `${spawned.length} findings · no actions`, "done");
    s.show("b_find", Object.entries(findings).map(([k, f]) => `${k}: ${f.status}`).join(" · ") || "none", "done");
    s.show("b_rec", paid2 ? `approved ${money(paid2)}` : esc2 ? "escalated with the fraud evidence" : "no action", "done");
    s.show("b_out", reconciled ? "one decision: escalated, $0 paid" : paid2 ? `paid ${money(paid2)}` : "not reconciled", reconciled ? "good" : "bad");

    const final = `Coordinator: ${coordinator.text}\n\nFindings\n${Object.entries(findings).map(([k, f]) => `- ${k}: ${f.status}${f.amount_due ? `, ${money(f.amount_due)} due` : ""}. ${f.summary}`).join("\n")}\n\nThe one action: ${paid2 ? `approve_payout ${money(paid2)}` : esc2 ? `escalate_to_adjuster: ${esc2.reason}` : "none"}`;
    return {
      final,
      compare: {
        cols: [
          { title: "Phase 1: peer specialists that each settle", short: "Peers act", tone: "trap", said: lead.text,
            verdict: conflict1 ? `**Paid ${money(total1)} and escalated the same claim**: ${[...paid1, ...esc1].map((x) => x.who).join(", ")} each acted on a partial view, and no step reconciled them.`
                               : `${paid1.length ? `Paid ${money(total1)}` : "No payout"}, ${esc1.length} escalation${esc1.length === 1 ? "" : "s"}; every specialist could act, and none saw the others' results.` },
          { title: "Phase 2: coordinator reconciles read-only findings", short: "Coordinator", tone: "fix", said: coordinator.text,
            verdict: reconciled ? `Coverage found ${money(findings.coverage?.amount_due || 0)} due, the fraud subagent flagged RQ-5531 (paid on CLM-6120), and the coordinator made **one decision: escalate, $0 paid**.`
                                : `Findings: ${Object.entries(findings).map(([k, f]) => `${k} ${f.status}`).join(", ")}. Read the live output.` },
        ],
        rows: [
          ["Specialists and their slices", "coverage, damage, fraud (same)", "coverage, damage, fraud (same)"],
          ["Who can approve a payout", { v: "every specialist", tone: "bad" }, { v: "only the coordinator", tone: "good" }],
          ["Actions on CLM-7781", { v: [...paid1, ...esc1].map(act).join(" | ") || "none", tone: conflict1 ? "bad" : "" }, { v: paid2 ? `approve ${money(paid2)}` : esc2 ? "one escalation, with the fraud evidence" : "none", tone: reconciled ? "good" : "bad" }],
          ["Duplicate RQ-5531 / CLM-6120 found", { v: fraudEsc1 ? "yes, by the fraud agent" : "no", tone: fraudEsc1 ? "" : "bad" }, { v: fraudFlag ? "yes, in the fraud finding" : "no", tone: fraudFlag ? "good" : "bad" }],
          ["Where the results meet", { v: "nowhere", tone: "bad" }, { v: "the coordinator, before acting", tone: "good" }],
          ["Claude calls · input tokens", `${cost1.calls} · ${cost1.input.toLocaleString("en-US")}`, `${cost2.calls} · ${cost2.input.toLocaleString("en-US")}`],
        ],
        note: "Same specialists, same remits, same slices of the claim file. The fraud check worked in both phases; what changed is where the results meet. Specialists that only find, and one coordinator that reconciles and acts, turn three partial views into one decision.",
      },
      checks: [
        E.check("Phase 1: a peer agent approved a payout on CLM-7781 while another escalated it (no reconciliation)", conflict1),
        E.check("Phase 2: the coordinator spawned the coverage, damage and fraud subagents", ["coverage", "damage", "fraud"].every((r) => spawned.includes(r)) && spawned.length === 3),
        E.check("Phase 2: the fraud subagent's finding flagged RQ-5531 as already paid on CLM-6120", fraudFlag),
        E.check("Phase 2: the coordinator reconciled the findings and made one decision: escalate, nothing paid", reconciled),
      ],
    };
  },
};
