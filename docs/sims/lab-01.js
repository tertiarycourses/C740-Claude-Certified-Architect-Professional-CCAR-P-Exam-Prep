// Lab 1 · Task 1.1 · Simulator 5 (Lumen Retail): frame the business problem before you pick the build.
// The sponsor asks for "an AI agent". Phase 1 takes the request as the brief and designs from it in one pass.
// Phase 2 runs a framing pass first (outcome, a metric with a baseline from discovery, constraints, each task
// given to Claude, code or a person), then a design pass that picks the simplest tier meeting that frame.
// Phase 1 designs from the request, as a team does when it starts building before discovery. Phase 2's framing
// pass is what brings the discovery pack in: the difference is the framing step, not the model or the prompt style.
import { REQUEST, DISCOVERY, TIERS, TIER_NOTE, isFigure } from "./shared/d1-lumen.js";
import { pass, obj, str, num, numOrNull, arr, oneOf } from "./shared/d1-kit.js";

const SYSTEM = "You are a Claude solution architect working for Lumen Retail. Be concrete and brief.";

// The design record. Phase 1 fills it straight from the request; Phase 2 fills it from the frame.
const DESIGN = obj({
  pattern: oneOf(TIERS),
  pattern_reason: str("One sentence."),
  success_metric: obj({ name: str(), baseline: numOrNull("Today's value, or null if unknown"), target: numOrNull(), unit: str() }),
  claude_does: arr(str()),
  code_does: arr(str()),
  people_do: arr(str()),
});

const FRAME = obj({
  business_outcome: str("The business result Grace reports to the board, in one sentence. Not a technology."),
  success_metric: obj({ name: str(), baseline: num("Today's value, taken from the discovery pack"), target: num(), unit: str(), measured_by: str() }),
  tasks: arr(obj({
    task: str(), share_pct: num("Share of today's calls"),
    handled_by: oneOf(["claude", "code", "person", "out_of_scope"], "claude = judgement over language; code = exact lookups, arithmetic, fixed rules; person = decisions that need authority"),
    reason: str(),
  })),
  constraints: arr(str()),
  simplest_tier: oneOf(TIERS, TIER_NOTE + " Pick the least autonomous tier that meets the metric and the constraints."),
});

const AGENTIC = new Set(["agent", "multi_agent"]);
const metricText = (m) => m ? `${m.name}: ${m.baseline ?? "?"} → ${m.target ?? "?"} ${m.unit || ""}`.trim() : "none";

export default {
  id: 1,
  see: "Phase 1 takes Grace's \"AI agent\" request as the brief and returns a design in one pass (often the agent she named) whose success metric has no measured baseline: nothing to show it worked. Phase 2 frames the problem first: a business outcome, a metric with a baseline straight from the discovery pack (for example 7.5 minutes handle time), each task given to Claude, code or a person (stock and price checks go to code, refund decisions stay with the store manager), and then the simplest tier that meets that frame: Claude with retrieval over the manuals, not an agent loop.",
  try: "Edit REQUEST in shared/d1-lumen.js so Grace asks for \"a multi-agent system\" and run again: Phase 1 tends to follow the request up the autonomy ladder, while Phase 2's tier does not move, because it comes from the frame. Then change the call mix so returns are 60% of calls and watch the frame give more work to people.",
  explain: "A sponsor's request names a solution (\"an agent\"); the architect's first deliverable is the problem. Phase 1 behaves like a team that starts building before discovery: it designs from the request alone. The framing pass turns the request and the discovery data into an outcome, a success metric with a measured baseline and a numeric target, the constraints, and a split of the work: Claude for judgement over language (product questions from manuals), code for exact lookups (stock and price), people for decisions with authority (refunds). Only then is a tier chosen, and the simplest one that meets the frame wins. Phase 1 skips that step, so its tier is a guess (often the agent the request named) and its design has nothing measured to be judged against.",
  scene: {
    title: "Lumen Retail: Grace asks for \"an AI agent\". What does the store actually need?",
    caption: "Both phases start from Grace's request. Phase 1 designs from it straight away; Phase 2's framing pass reads the discovery pack (2,400 calls a week, 7.5-minute handle time, the call mix, the constraints) before any design.",
    lanes: [
      { key: "p1", label: "Phase 1 · solution first", sub: "the request is the brief", tone: "trap", on: /Phase 1/, stages: [
        { id: "a_req", icon: "💬", t: "\"We want an AI agent\"", s: "Grace's request, due Friday" },
        { id: "a_frame", icon: "🧭", t: "Problem framing", s: "skipped: discovery data never read", diff: true },
        { id: "a_design", icon: "🤖", t: "Design pass", s: "design the agent Grace asked for", claude: true },
        { id: "a_metric", icon: "📏", t: "Success metric", s: "baseline from discovery?" },
        { id: "a_out", icon: "🏗", t: "Design + success metric", s: "want: simplest tier, a measured baseline", out: true } ] },
      { key: "p2", label: "Phase 2 · frame, then design", sub: "outcome, metric, tasks, then the tier", tone: "fix", on: /Phase 2/, stages: [
        { id: "b_req", icon: "💬", t: "\"We want an AI agent\"", s: "the same request, plus the discovery pack" },
        { id: "b_frame", icon: "🧭", t: "Framing pass", s: "outcome, metric, constraints, who does what", claude: /frame/, diff: true },
        { id: "b_metric", icon: "📏", t: "Success metric", s: "baseline from discovery, numeric target" },
        { id: "b_design", icon: "🤖", t: "Design pass", s: "the simplest tier that meets the frame", claude: /design/ },
        { id: "b_out", icon: "🏗", t: "Design + success metric", s: "want: simplest tier, a measured baseline", out: true } ] },
    ],
  },
  slide: {
    title: "Frame the problem first, then pick the simplest tier",
    code: `problem_frame:
  outcome: Store staff answer product questions        # KEY 1
           without phoning head office
  metric: {name: handle time, baseline: 7.5 min,       # KEY 2
           target: 2 min, measured_by: tablet logs}
  constraints: [answer < 10 s, SSO, no customer PII,   # KEY 3
                run cost < $4,000/month]
  tasks:
    - {task: product questions (62%), by: claude}
    - {task: stock and price (23%),   by: code}        # KEY 4
    - {task: refund decisions (9%),   by: person}
  tier: augmented_llm   # retrieval over manuals, no loop`,
    keys: [["1", "An outcome, not a tool", "Name the business result the sponsor reports on."],
           ["2", "A metric with a baseline", "Today's number from discovery, and a numeric target."],
           ["3", "Constraints are inputs", "Latency, security, legal and budget shape the design."],
           ["4", "Each task to its owner", "Claude for language, code for lookups, people decide."]],
  },
  async run(s, E) {
    s.log(`Lumen Retail · ${REQUEST}`, "note");
    s.log("Discovery pack: 2,400 calls a week, 7.5-minute handle time, 62% product questions, 23% stock and price checks, 9% refund decisions; answers in 10 s, SSO, no customer PII, under $4,000 a month.", "note");

    s.log("== Phase 1 · solution first: design the agent Grace asked for from the request, before discovery", "note");
    s.show("a_req", "\"AI agent, end to end\"", "done");
    s.show("a_frame", "skipped", "done");
    const p1 = await pass(s, E, {
      system: SYSTEM,
      prompt: `${REQUEST}\n\nContext: Lumen Retail has 300 stores; store staff phone a head-office product support line today.\n\nWrite the design for the AI agent Grace asked for.`,
      schema: DESIGN, max_tokens: 3000,
    });
    const d1 = p1.data || {};
    const m1 = d1.success_metric || null;
    const m1Anchored = !!m1 && isFigure(m1.baseline) && typeof m1.target === "number";
    s.log(`Phase 1 design: pattern ${d1.pattern || "?"} · metric ${metricText(m1)} · baseline from discovery: ${m1Anchored ? "yes" : "no"}`, "note");
    s.show("a_design", `pattern: ${d1.pattern || "no JSON"}`, "done");
    s.show("a_metric", m1Anchored ? metricText(m1) : `${m1?.name || "no metric"}: no baseline from data`, "done");
    s.show("a_out", `${d1.pattern || "no design"} · ${m1Anchored ? "baseline from data" : "no measured baseline"}`, m1Anchored && !AGENTIC.has(d1.pattern) ? "good" : "bad");
    await s.pause({
      title: "Phase 1 finished: the request became the brief",
      outcome: `The design is **${d1.pattern || "unreadable"}**${AGENTIC.has(d1.pattern) ? ", the autonomy level the request named" : ""}. ` +
        (m1Anchored ? `Its metric (${metricText(m1)}) happens to match a discovery figure, but no step decided which tasks need Claude at all.`
                    : `Its success metric (${metricText(m1)}) has **no measured baseline**, so nobody could show it worked, and no step decided which tasks need Claude at all.`),
      next: "Phase 2: a framing pass first (outcome, metric, constraints, who does what), then the design",
    });

    s.log("== Phase 2 · frame the problem first, then design the simplest tier that meets the frame", "note");
    s.show("b_req", "\"AI agent, end to end\"", "done");
    const fr = await pass(s, E, {
      label: "(frame pass)",
      system: SYSTEM,
      prompt: `${REQUEST}\n\n<discovery>\n${DISCOVERY}\n</discovery>\n\nBefore any design, frame the business problem: the outcome Grace reports to the board, one success metric with today's baseline from the discovery pack and a numeric target, the constraints, and every task in the call mix with who should handle it. Then name the simplest tier that would meet the metric within the constraints.`,
      schema: FRAME, max_tokens: 3500,
    });
    const f = fr.data || {};
    const fm = f.success_metric || null;
    const tasks = f.tasks || [];
    const owner = (re) => tasks.find((t) => re.test(t.task))?.handled_by || "not listed";
    const stockBy = owner(/stock|price|inventory/i), refundBy = owner(/return|refund/i), productBy = owner(/product|set-?up|compatib|warranty/i);
    const fmAnchored = !!fm && isFigure(fm.baseline) && typeof fm.target === "number" && fm.target !== fm.baseline;
    s.log(`Frame: outcome "${E.short(f.business_outcome || "?", 120)}" · metric ${metricText(fm)} · product questions → ${productBy}, stock and price → ${stockBy}, refunds → ${refundBy} · simplest tier ${f.simplest_tier || "?"}`, "note");
    s.show("b_frame", `${tasks.length} tasks: stock→${stockBy}, refunds→${refundBy}`, "done");
    s.show("b_metric", fmAnchored ? metricText(fm) : `${metricText(fm)} (not anchored)`, "done");

    const p2 = await pass(s, E, {
      label: "(design pass)",
      system: SYSTEM,
      prompt: `<problem_frame>\n${JSON.stringify(f, null, 1)}\n</problem_frame>\n\n<discovery>\n${DISCOVERY}\n</discovery>\n\nDesign the solution for this frame. Choose the simplest tier that meets the success metric within the constraints, keep the frame's metric, and give each task to the owner the frame chose.`,
      schema: DESIGN, max_tokens: 3000,
    });
    const d2 = p2.data || {};
    const simpler = !!d2.pattern && !AGENTIC.has(d2.pattern) && TIERS.indexOf(d2.pattern) >= TIERS.indexOf("augmented_llm");
    s.log(`Phase 2 design: pattern ${d2.pattern || "?"} · ${E.short(d2.pattern_reason || "", 160)}`, "note");
    s.show("b_design", `pattern: ${d2.pattern || "no JSON"}`, "done");
    s.show("b_out", d2.pattern || "no design", simpler && fmAnchored ? "good" : "bad");

    const final = `Problem frame\nOutcome: ${f.business_outcome || "?"}\nMetric: ${metricText(fm)} (measured by ${fm?.measured_by || "?"})\n` +
      tasks.map((t) => `- ${t.task} (${t.share_pct}%): ${t.handled_by}`).join("\n") +
      `\nConstraints: ${(f.constraints || []).join("; ")}\n\nDesign: ${d2.pattern || "?"}. ${d2.pattern_reason || ""}\nClaude does: ${(d2.claude_does || []).join("; ")}\nCode does: ${(d2.code_does || []).join("; ")}\nPeople do: ${(d2.people_do || []).join("; ")}`;
    const tone = (ok) => (ok ? "good" : "bad");
    return {
      final,
      compare: {
        cols: [
          { title: "Phase 1: design the agent that was asked for", short: "Solution first", tone: "trap",
            verdict: `Chose **${d1.pattern || "?"}** from the request alone. Metric: ${metricText(m1)}${m1Anchored ? "" : ", with no measured baseline"}.` },
          { title: "Phase 2: frame first, then the simplest tier", short: "Frame first", tone: "fix",
            verdict: `Framed ${tasks.length} tasks (stock and price → ${stockBy}, refunds → ${refundBy}), anchored the metric at ${fm?.baseline ?? "?"} ${fm?.unit || ""}, then chose **${d2.pattern || "?"}**.` },
        ],
        rows: [
          ["Framing step before the design", { v: "none", tone: "bad" }, { v: "outcome, metric, constraints, tasks", tone: "good" }],
          ["Chosen tier", { v: d1.pattern || "?", tone: tone(!AGENTIC.has(d1.pattern)) }, { v: d2.pattern || "?", tone: tone(simpler) }],
          ["Success metric", { v: metricText(m1), tone: tone(m1Anchored) }, { v: metricText(fm), tone: tone(fmAnchored) }],
          ["Baseline taken from discovery data", m1Anchored ? "yes" : "no", fmAnchored ? "yes" : "no"],
          ["Stock and price checks handled by", (d1.code_does || []).some((x) => /stock|price|inventory/i.test(x)) ? "code (listed)" : "not separated", { v: stockBy, tone: tone(stockBy === "code") }],
          ["Refund decisions handled by", (d1.people_do || []).some((x) => /refund|return/i.test(x)) ? "people (listed)" : "not separated", { v: refundBy, tone: tone(refundBy === "person") }],
        ],
        note: "Same request, same model, same design record. The framing step brings in the discovery data, decides what is measured and who does each task; the tier follows from that, not from the word in the request.",
      },
      checks: [
        E.check("Phase 1 (solution first): the success metric has no baseline from measured data", !m1Anchored),
        E.check("Phase 2 frame: the success metric's baseline is a figure from the discovery pack, with a numeric target", fmAnchored),
        E.check("Phase 2 frame: stock and price checks go to code, refund decisions to a person", stockBy === "code" && refundBy === "person"),
        E.check("Phase 2 design: a tier below agent (augmented LLM or workflow)", simpler),
      ],
    };
  },
};
