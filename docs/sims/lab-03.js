// Lab 3 · Task 1.3 · Simulator 1 (Harbour Mutual): a fixed, documented sequence is a workflow, not an agent.
// CLM-7781 goes through Harbour Mutual's claims procedure twice. Phase 1 hands the whole procedure to an
// agent: Claude picks every step and tool in a loop. Phase 2 writes the procedure in code and calls Claude
// only at the two judgement steps (is the damage consistent with the assessment? write the letter).
// Same claim, same tools and data, same procedure text. The difference is who owns the control flow.
import { POLICIES, CLAIMS, AUTHORITY, ASSESS_OVER } from "./shared/d1-harbour.js";
import { pass, obj, str, arr, money } from "./shared/d1-kit.js";

const ID = "CLM-7781";
const PROCEDURE = `Harbour Mutual claims procedure (motor own damage):
1. Get the claim. 2. Get the policy. 3. Check the policy covers the claim; if not, decline.
4. Request an independent damage assessment for any claim over $${ASSESS_OVER.toLocaleString("en-US")}.
5. Check the claim description is consistent with the assessment.
6. Payout = the lower of the repair quote and the assessed cost, minus the policy excess.
7. Approve the payout if it is within $${AUTHORITY.toLocaleString("en-US")} and nothing is inconsistent; otherwise escalate to an adjuster.
8. Draft the customer letter (under 70 words).`;
const DOCUMENTED = ["get_claim", "get_policy", "check_cover", "request_assessment", "judge_consistency", "compute_payout", "approve_or_escalate", "draft_letter"];

const ASSESSMENT = { assessment_id: "AS-3302", claim_id: ID, assessor: "Coastline Loss Assessors", assessed_cost: 4150,
  findings: "Rear bumper cover cracked, left rear parking sensor bracket broken. Paint transfer consistent with a low-speed reversing impact. Quote from Bayside Panel Works is reasonable; sensor recalibration priced slightly high." };

function backend() {
  const st = { payouts: [], escalations: [], letters: [], assessments: 0 };
  const tools = {
    get_claim: { description: "Get a motor claim by claim_id.", input_schema: { type: "object", properties: { claim_id: { type: "string" } }, required: ["claim_id"] },
      run: ({ claim_id }) => CLAIMS[claim_id] || { isError: true, message: `No claim ${claim_id}` } },
    get_policy: { description: "Get a policy by policy_id.", input_schema: { type: "object", properties: { policy_id: { type: "string" } }, required: ["policy_id"] },
      run: ({ policy_id }) => POLICIES[policy_id] || { isError: true, message: `No policy ${policy_id}` } },
    request_assessment: { description: "Request an independent damage assessment for a claim. Returns the assessor's report.", input_schema: { type: "object", properties: { claim_id: { type: "string" } }, required: ["claim_id"] },
      run: ({ claim_id }) => { st.assessments += 1; return claim_id === ID ? ASSESSMENT : { isError: true, message: "No assessor available" }; } },
    approve_payout: { description: "Approve a payout to the claimant (US$).", input_schema: { type: "object", properties: { claim_id: { type: "string" }, amount: { type: "number" } }, required: ["claim_id", "amount"] },
      run: ({ claim_id, amount }) => { st.payouts.push({ claim_id, amount }); return { approved: true, claim_id, amount }; } },
    escalate_to_adjuster: { description: "Send the claim to a human adjuster with the reason.", input_schema: { type: "object", properties: { claim_id: { type: "string" }, reason: { type: "string" } }, required: ["claim_id", "reason"] },
      run: ({ claim_id, reason }) => { st.escalations.push({ claim_id, reason }); return { queued: true }; } },
    draft_letter: { description: "Save the customer letter for a claim.", input_schema: { type: "object", properties: { claim_id: { type: "string" }, text: { type: "string" } }, required: ["claim_id", "text"] },
      run: ({ claim_id, text }) => { st.letters.push({ claim_id, text }); return { saved: true }; } },
  };
  return { st, tools };
}

const used = (s, from) => ({ input: s.usage.input - from.input, output: s.usage.output - from.output, calls: s.usage.calls - from.calls });

export default {
  id: 3,
  see: "Phase 1: the agent works through the procedure itself, one tool per turn, re-reading the growing conversation every turn: about six Claude calls for a claim whose steps were written down in advance. Phase 2: code runs the eight documented steps in order and calls Claude twice (the consistency judgement and the letter), for the same $3,650 payout at a fraction of the input tokens, with a path an auditor can read before it runs.",
  try: "Run the lab two or three times and compare Phase 1's tool order and turn count between runs: the agent's path is a distribution you sample, while Phase 2's audit trail never changes. Then change ASSESSMENT.findings to say the paint transfer is from a front impact: only the judgement step changes its answer, and the workflow escalates.",
  explain: "Anthropic separates workflows, where code orchestrates the model and tools on predefined paths, from agents, where the model directs its own steps. Harbour Mutual's procedure is fixed and written down, so the agent buys nothing it needs: it pays in Claude calls and tokens (each turn re-reads the whole conversation), in a path that can vary between runs, and in an audit trail that can only be read after the fact. The workflow keeps the control flow, the arithmetic and the authority rule in code, and uses Claude as an augmented LLM at the two steps that need judgement over language. Reach for an agent when you cannot write the steps down in advance.",
  scene: {
    title: "CLM-7781: an eight-step procedure, written down. Who should run the steps?",
    caption: "Both phases process Priya Nair's bumper claim with the same tools, the same records and the same procedure text. Only the owner of the control flow differs.",
    lanes: [
      { key: "p1", label: "Phase 1 · fully agentic", sub: "Claude chooses every step in a loop", tone: "trap", on: /Phase 1/, stages: [
        { id: "a_in", icon: "📄", t: "CLM-7781 + procedure", s: "8 documented steps in the prompt" },
        { id: "a_loop", icon: "🤖", t: "Claims agent loop", s: "decides the next tool every turn", claude: true, diff: true,
          tools: ["get_claim", "get_policy", "request_assessment", "approve_payout", "escalate_to_adjuster", "draft_letter"] },
        { id: "a_path", icon: "🧭", t: "Path taken", s: "known only after the run" },
        { id: "a_cost", icon: "🪙", t: "Calls and tokens", s: "each turn re-reads the conversation" },
        { id: "a_out", icon: "💳", t: "Outcome", s: "want: $3,650, fixed path, few calls", out: true } ] },
      { key: "p2", label: "Phase 2 · workflow + 2 judgement calls", sub: "code owns the path", tone: "fix", on: /Phase 2/, stages: [
        { id: "b_in", icon: "📄", t: "CLM-7781 + procedure", s: "the procedure is the code" },
        { id: "b_code", icon: "⚙️", t: "Steps 1-4, 6, 7 in code", s: "lookups, cover, assessment, payout, gate", diff: true },
        { id: "b_judge", icon: "🤖", t: "Claude: judgement steps", s: "step 5 consistency, step 8 letter", claude: true },
        { id: "b_cost", icon: "🪙", t: "Calls and tokens", s: "two short calls" },
        { id: "b_out", icon: "💳", t: "Outcome", s: "want: $3,650, fixed path, few calls", out: true } ] },
    ],
  },
  slide: {
    title: "A known sequence is code; Claude only where judgement is",
    code: `def process_claim(claim_id):                         # KEY 1
    claim = get_claim(claim_id)
    policy = get_policy(claim.policy_id)
    if not covers(policy, claim):
        return decline(claim)
    report = request_assessment(claim) if claim.quote > 2000 else None
    check = claude_judge(claim.description, report)    # KEY 2
    amount = min(claim.quote, report.cost) - policy.excess  # KEY 3
    if check.consistent and amount <= 5000:
        approve_payout(claim_id, amount)
    else:
        escalate_to_adjuster(claim_id, check.concerns)
    return claude_letter(claim, amount)                # KEY 4`,
    keys: [["1", "Code owns the path", "Every step is enumerable, testable, auditable."],
           ["2", "Claude for judgement", "Reading free text against the report is language work."],
           ["3", "Arithmetic and rules in code", "Payout and the $5,000 authority never vary."],
           ["4", "Claude writes the words", "The letter is drafted from facts code computed."]],
  },
  async run(s, E) {
    const c = CLAIMS[ID], p = POLICIES[c.policy_id];
    s.log(`Harbour Mutual · ${ID}: ${c.claimant}, rear bumper, quote ${money(c.repair_quote)}, policy ${p.policy_id} (${p.cover}, excess ${money(p.excess)}).`, "note");

    s.log("== Phase 1 · fully agentic: the claims agent chooses every step and tool in its own loop", "note");
    s.show("a_in", `${ID}, 8-step procedure`, "done");
    const u1 = { ...s.usage };
    const b1 = backend();
    const agent = await E.runAgent(s, {
      system: `You are Harbour Mutual's claims agent. Process the claim with your tools, following the procedure.\n\n${PROCEDURE}`,
      prompt: `Process claim ${ID}.`,
      tools: b1.tools, maxTurns: 10, max_tokens: 2000,
    });
    const cost1 = used(s, u1);
    const path1 = agent.calls.map((x) => x.name);
    const paid1 = b1.st.payouts.reduce((t, x) => t + Number(x.amount), 0);
    s.log(`Phase 1: ${agent.turns} Claude turns, ${cost1.input.toLocaleString("en-US")} input tokens; path ${path1.join(" → ")}; paid ${money(paid1)}${b1.st.escalations.length ? `; escalated ${b1.st.escalations.length}` : ""}`, "note");
    s.show("a_path", E.short(path1.map((n) => n.replace(/_/g, " ")).join(" → "), 60), "done");
    s.show("a_cost", `${cost1.calls} calls · ${cost1.input.toLocaleString("en-US")} input tokens`, "done");
    s.show("a_out", `${paid1 ? money(paid1) + " paid" : "no payout"} · ${cost1.calls} calls`, "bad");
    await s.pause({
      title: "Phase 1 finished: the agent ran the procedure",
      outcome: `The agent took **${agent.turns} turns** and **${cost1.input.toLocaleString("en-US")} input tokens** (each turn re-reads the whole conversation) to run a sequence that was written down in advance, and ${paid1 ? `paid ${money(paid1)}` : "paid nothing"}. Its path, ${path1.join(" → ")}, was chosen at run time: an auditor can read it only afterwards.`,
      next: "Phase 2: the procedure in code, Claude only at the two judgement steps",
    });

    s.log("== Phase 2 · workflow: the procedure in code, Claude only at the judgement steps", "note");
    s.show("b_in", `${ID}, procedure as code`, "done");
    const u2 = { ...s.usage };
    const b2 = backend();
    const audit = [];
    const step = (name, detail) => { audit.push(name); s.log(`Step ${audit.length} · ${name}: ${detail}`, "note"); };
    const claim = b2.tools.get_claim.run({ claim_id: ID }); step("get_claim", `${claim.claim_id}, quote ${money(claim.repair_quote)}`);
    const policy = b2.tools.get_policy.run({ policy_id: claim.policy_id }); step("get_policy", `${policy.policy_id}, ${policy.cover}, excess ${money(policy.excess)}`);
    const covered = policy.cover === "comprehensive"; step("check_cover", covered ? "covered" : "not covered");
    const report = claim.repair_quote > ASSESS_OVER ? b2.tools.request_assessment.run({ claim_id: ID }) : null;
    step("request_assessment", report ? `${report.assessment_id}: assessed ${money(report.assessed_cost)}` : "not needed");
    s.show("b_code", "steps 1-4 done in code", "hot");
    const judge = await pass(s, E, {
      label: "(judgement: consistency)",
      system: "You check motor claims for Harbour Mutual. Judge only what you are asked.",
      prompt: `<claim_description>${claim.description}</claim_description>\n<assessment>${report.findings}</assessment>\nIs the customer's description consistent with the assessor's findings? List any concerns.`,
      schema: obj({ consistent: { type: "boolean" }, concerns: arr(str()) }), max_tokens: 1500,
    });
    const j = judge.data || { consistent: false, concerns: ["no readable judgement"] };
    step("judge_consistency", `Claude: consistent ${j.consistent}${j.concerns.length ? `; concerns: ${j.concerns.join("; ")}` : ""}`);
    const amount = Math.min(claim.repair_quote, report ? report.assessed_cost : claim.repair_quote) - policy.excess;
    step("compute_payout", `min(${claim.repair_quote}, ${report?.assessed_cost}) - ${policy.excess} = ${money(amount)}`);
    const approve = covered && j.consistent && amount <= AUTHORITY;
    if (approve) b2.tools.approve_payout.run({ claim_id: ID, amount }); else b2.tools.escalate_to_adjuster.run({ claim_id: ID, reason: j.concerns.join("; ") || "rule" });
    step("approve_or_escalate", approve ? `approved ${money(amount)} (within ${money(AUTHORITY)})` : "escalated to an adjuster");
    const letter = await pass(s, E, {
      label: "(judgement: letter)",
      system: "You write short, plain customer letters for Harbour Mutual.",
      prompt: `Write the letter to ${claim.claimant} for claim ${ID}. Facts (do not change them): ${approve ? `approved, payout ${money(amount)}, which is the assessed repair cost ${money(report.assessed_cost)} minus the ${money(policy.excess)} excess` : "referred to an adjuster, who will contact them within 2 working days"}. Under 70 words.`,
      schema: obj({ letter: str() }), max_tokens: 1200,
    });
    const text = letter.data?.letter || "";
    b2.tools.draft_letter.run({ claim_id: ID, text });
    step("draft_letter", E.short(text, 140));
    const cost2 = used(s, u2);
    const inOrder = audit.join() === DOCUMENTED.join();
    const states = (n) => new RegExp(n.toLocaleString("en-US").replace(",", ",?")).test(text);
    s.show("b_code", `${audit.length - 2} code steps, in order`, "done");
    s.show("b_judge", `consistent: ${j.consistent} · letter ${text ? "written" : "missing"}`, "done");
    s.show("b_cost", `${cost2.calls} calls · ${cost2.input.toLocaleString("en-US")} input tokens`, "done");
    s.show("b_out", `${approve ? money(amount) + " paid" : "escalated"} · ${cost2.calls} calls`, inOrder && approve && cost2.calls === 2 ? "good" : "bad");

    const ratio = cost1.input ? cost2.input / cost1.input : 1;
    const final = `Workflow audit trail for ${ID}\n${audit.map((a, i) => `${i + 1}. ${a}`).join("\n")}\n\nPayout: ${approve ? money(amount) : "escalated"}\nLetter: ${text}`;
    return {
      final,
      compare: {
        cols: [
          { title: "Phase 1: fully agentic", short: "Agent", tone: "trap", said: agent.text,
            verdict: `${agent.turns} turns and ${cost1.input.toLocaleString("en-US")} input tokens for a fixed procedure; ${paid1 ? `paid ${money(paid1)}` : "no payout"}. The path was decided at run time.` },
          { title: "Phase 2: workflow, Claude at the judgement steps", short: "Workflow", tone: "fix", said: text,
            verdict: `8 steps in documented order, 2 Claude calls, ${cost2.input.toLocaleString("en-US")} input tokens (${Math.round(ratio * 100)}% of Phase 1); ${approve ? `paid ${money(amount)}` : "escalated"}.` },
        ],
        rows: [
          ["Who chooses the next step", { v: "Claude, every turn", tone: "bad" }, { v: "code (the procedure)", tone: "good" }],
          ["Steps or tools, in order", path1.join(" → ") || "none", audit.join(" → ")],
          ["Claude calls", { v: String(cost1.calls), tone: "bad" }, { v: String(cost2.calls), tone: "good" }],
          ["Input tokens", { v: cost1.input.toLocaleString("en-US"), tone: "bad" }, { v: cost2.input.toLocaleString("en-US"), tone: "good" }],
          ["Payout", paid1 ? money(paid1) : "none", approve ? money(amount) : "escalated"],
          ["Path known before the run (auditable)", { v: "no", tone: "bad" }, { v: "yes", tone: "good" }],
        ],
        note: "Same claim, same tools, same procedure text. Autonomy is something you buy with calls, tokens and variance; a sequence you can write down does not need it. Claude still does the language work, at the two steps that need it.",
      },
      checks: [
        E.check("Phase 1: the agent chose its own path over 4 or more Claude turns", agent.turns >= 4),
        E.check("Phase 2: the eight documented steps ran in order, with Claude called only at the two judgement steps", inOrder && cost2.calls === 2),
        E.check("Phase 2 used under half the input tokens of Phase 1", ratio < 0.5),
        E.check("Phase 2: code computed and approved the $3,650 payout, and the letter states it", approve && amount === 3650 && b2.st.payouts.length === 1 && states(3650)),
      ],
    };
  },
};
