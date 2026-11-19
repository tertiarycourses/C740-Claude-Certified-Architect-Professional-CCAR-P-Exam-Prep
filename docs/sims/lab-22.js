// Lab 22 · Task 4.3 · Simulator 6 (Kestrel Platform Team): ship a prompt change because one demo looked better,
// or A/B it. The alert-triage prompt v2 fixes staging alerts (the author's demo) but rewrites SEV1 around a 5% error
// rate, so small checkout and payment failures drop to SEV2. Phase 1 compares v1 and v2 on the demo alert only.
// Phase 2 runs both on the same 8 labelled alerts, twice each, with a decision rule written down before the run.
import { ask } from "./shared/d4-kit.js";
import { TRIAGE_V1, TRIAGE_V2, ALERTS, DEMO_ID, LABELS_SCHEMA } from "./shared/d4-kestrel.js";

const RULE = "Ship v2 only if (1) its mean accuracy over both runs is at least v1's, and (2) it misses no gold SEV1 alert in either run (a missed SEV1 is a missed page).";
const REPEATS = 2;

async function label(s, E, name, prompt, alerts, tag) {
  const r = await ask(s, E, { label: `${name} · ${tag}`, system: prompt, max_tokens: 2048, quiet: true,
    prompt: `Assign a severity to each alert. Return every id.\n\n${alerts.map((a) => `${a.id}: ${a.text}`).join("\n")}`,
    output_config: { format: { type: "json_schema", schema: LABELS_SCHEMA } } });
  const got = Object.fromEntries((r.json?.labels || []).map((x) => [x.id, x.severity]));
  s.log(`      ${name}: ${alerts.map((a) => `${a.id} ${got[a.id] || "?"}`).join(" · ")}`, "reply");
  return got;
}

const score = (got) => {
  const right = ALERTS.filter((a) => got[a.id] === a.gold).length;
  const sev1 = ALERTS.filter((a) => a.gold === "SEV1");
  const missed = sev1.filter((a) => got[a.id] !== "SEV1").map((a) => a.id);
  return { right, acc: right / ALERTS.length, missed, recall: (sev1.length - missed.length) / sev1.length, complete: ALERTS.every((a) => got[a.id]) };
};
const pc = (x) => `${Math.round(x * 100)}%`;

export default {
  id: 22,
  see: "Phase 1: on the author's demo alert (checkout 500s in staging) v1 pages someone with SEV1 and v2 says SEV3, correctly, so the demo says ship v2. Phase 2: on the same 8 labelled alerts, twice each, v2 still fixes the staging alert but drops the 2.1% checkout failure and the 1.4% payment time-outs to SEV2. The decision rule, written before the run, rejects v2 for missing SEV1 pages.",
  try: "In docs/sims/shared/d4-kestrel.js, add \"Any failed customer checkout or payment is SEV1, whatever the rate.\" to TRIAGE_V2 and run again: v2 now keeps v1's SEV1 recall and its staging fix, and the same rule ships it. Then set REPEATS to 1 and notice how much less you know about run-to-run noise.",
  explain: "A demo picks the example that shows the change working, so it measures the author's hope, not the change. An A/B test runs both versions on the same fixed eval items with the same graders, so the only difference is the prompt. The decision rule is written before the run: a primary metric (accuracy) plus a guardrail that may not regress (no missed SEV1). Eight items run twice is far too few for statistical significance, and this lab does not claim any. It is enough to find a specific regression you can read item by item, which is what blocks v2 here. In production the next step after passing offline would be a small canary with the same metrics.",
  scene: {
    title: "Alert-triage prompt v2: ship it on a demo, or A/B it?",
    caption: "The same two prompts in both phases. Phase 1 compares them on one hand-picked alert; phase 2 on the same 8 labelled alerts, twice, with a rule fixed in advance.",
    lanes: [
      { key: "p1", label: "Phase 1 · one demo", sub: "the author's favourite alert", tone: "trap", on: /Phase 1/, stages: [
        { id: "a_demo", icon: "🎯", t: "Demo alert AL-01", s: "staging checkout 500s: gold SEV3", diff: true },
        { id: "a_v1", icon: "🤖", t: "Prompt v1", s: "current production prompt", claude: true },
        { id: "a_v2", icon: "🤖", t: "Prompt v2", s: "staging rule + 5% SEV1 threshold" },
        { id: "a_out", icon: "🚦", t: "Ship decision", s: "want: no prompt that misses SEV1 pages", out: true } ] },
      { key: "p2", label: "Phase 2 · A/B on a fixed eval set", sub: "same items, same grader, rule set first", tone: "fix", on: /Phase 2/, stages: [
        { id: "b_rule", icon: "📜", t: "Decision rule, written first", s: "accuracy ≥ v1 and no missed SEV1", diff: true },
        { id: "b_set", icon: "📋", t: "8 labelled alerts", s: "gold severity from the on-call leads" },
        { id: "b_runs", icon: "🤖", t: "v1 and v2, 2 runs each", s: "structured output, same items", claude: true },
        { id: "b_score", icon: "🧮", t: "Score per item", s: "accuracy and SEV1 recall per run" },
        { id: "b_out", icon: "🚦", t: "Ship decision", s: "want: no prompt that misses SEV1 pages", out: true } ] },
    ],
  },
  slide: {
    title: "A/B a prompt change: same items, rule fixed first",
    code: `RULE = {"primary": "accuracy(v2) >= accuracy(v1)",  # KEY 1
        "guardrail": "missed_sev1(v2) == 0"}
items = load_eval_set("alerts_v3.jsonl")        # KEY 2
results = {}
for variant in ("v1", "v2"):
    for run in range(REPEATS):                  # KEY 3
        labels = triage(PROMPTS[variant], items)
        results[variant, run] = score(labels, items)
ship = meets(RULE, results)                     # KEY 4
# n=8 x 2 runs: finds regressions, proves no significance
# passed offline? next: a 5% canary on the same metrics`,
    keys: [["1", "Decide the rule first", "Primary metric plus a guardrail that may not regress."],
           ["2", "Same items for both", "Fixed ids and gold labels: only the prompt differs."],
           ["3", "Repeat to see the noise", "Two runs each show how much a result moves."],
           ["4", "The rule decides", "Not the demo, not the author, not a judge's taste."]],
  },
  async run(s, E) {
    const demo = ALERTS.find((a) => a.id === DEMO_ID);
    s.log("Kestrel on-call alert triage · prompt v2 proposed by its author · gold labels agreed by the on-call leads", "note");

    // Phase 1: one demo alert, chosen by the author because it shows what v2 fixes.
    s.log(`== Phase 1 · one demo: v1 and v2 on the author's demo alert ${demo.id} only`, "note");
    s.show("a_demo", `${demo.id}: gold ${demo.gold}`, "done");
    const d1 = await label(s, E, "Prompt v1", TRIAGE_V1, [demo], "demo");
    s.show("a_v1", `${demo.id} → ${d1[demo.id] || "?"}`, d1[demo.id] === demo.gold ? "done" : "done");
    const d2 = await label(s, E, "Prompt v2", TRIAGE_V2, [demo], "demo");
    s.show("a_v2", `${demo.id} → ${d2[demo.id] || "?"}`, "done");
    const demoWin = d2[demo.id] === demo.gold;
    const ship1 = demoWin;
    s.log(`Demo: v1 said ${d1[demo.id]}, v2 said ${d2[demo.id]} (gold ${demo.gold}). ${ship1 ? (d1[demo.id] === demo.gold ? "Both right; v2's staging rule reads cleaner, so the author ships v2." : "v2 fixed it: ship v2.") : "v2 missed even the demo."}`, "note");
    s.show("a_out", ship1 ? "SHIP v2: it got the demo right" : "hold: v2 missed the demo", ship1 ? "bad" : "good");
    await s.pause({
      title: "Phase 1 finished: one demo alert",
      outcome: `On the staging alert ${demo.id}, v1 said **${d1[demo.id] || "?"}** and v2 said **${d2[demo.id] || "?"}** (gold ${demo.gold}). On this evidence the author would **${ship1 ? "ship v2" : "hold v2"}**. One alert says nothing about what v2's new SEV1 wording does to small checkout and payment failures.`,
      next: "Phase 2: A/B v1 and v2 on the same 8 labelled alerts, twice each",
    });

    // Phase 2: the rule first, then both variants on the same items, repeated.
    s.log("== Phase 2 · A/B test: v1 and v2 on the same 8 labelled alerts, 2 runs each, decision rule fixed before the run", "note");
    s.log(`Decision rule (written before any result): ${RULE}`, "note");
    s.show("b_rule", "accuracy ≥ v1 · no missed SEV1", "done");
    s.show("b_set", `${ALERTS.length} alerts · ${ALERTS.filter((a) => a.gold === "SEV1").length} gold SEV1`, "done");
    const runs = { v1: [], v2: [] };
    for (let r = 1; r <= REPEATS; r++) {
      runs.v1.push(await label(s, E, "Prompt v1", TRIAGE_V1, ALERTS, `run ${r}`));
      runs.v2.push(await label(s, E, "Prompt v2", TRIAGE_V2, ALERTS, `run ${r}`));
    }
    s.show("b_runs", `${REPEATS * 2} runs × ${ALERTS.length} alerts`, "done");
    const sc = { v1: runs.v1.map(score), v2: runs.v2.map(score) };
    const mean = (xs, k) => xs.reduce((n, x) => n + x[k], 0) / xs.length;
    const acc1 = mean(sc.v1, "acc"), acc2 = mean(sc.v2, "acc");
    const missed2 = [...new Set(sc.v2.flatMap((x) => x.missed))], missed1 = [...new Set(sc.v1.flatMap((x) => x.missed))];
    for (const v of ["v1", "v2"]) s.log(`  ${v}: accuracy ${sc[v].map((x) => `${x.right}/${ALERTS.length}`).join(", ")} · missed SEV1 ${sc[v].map((x) => x.missed.join("+") || "none").join(" | ")}`, "result");
    const demoFixed = runs.v2.every((g) => g[DEMO_ID] === demo.gold);
    const passPrimary = acc2 >= acc1, passGuard = sc.v2.every((x) => x.missed.length === 0);
    const ship2 = passPrimary && passGuard;
    s.show("b_score", `acc v1 ${pc(acc1)} · v2 ${pc(acc2)} · v2 missed ${missed2.join(", ") || "none"}`, "done");
    s.show("b_out", ship2 ? "SHIP v2: the rule is met" : `REJECT v2: ${passGuard ? "" : "missed SEV1 "}${passPrimary ? "" : "lower accuracy"}`.trim(), ship2 ? "bad" : "good");
    s.log(`Decision: primary (accuracy ${pc(acc2)} vs ${pc(acc1)}) ${passPrimary ? "met" : "NOT met"} · guardrail (missed SEV1: ${missed2.join(", ") || "none"}) ${passGuard ? "met" : "NOT met"} → ${ship2 ? "SHIP v2" : "REJECT v2"}`, "note");
    s.log(`v2 still fixes the demo alert in the A/B (${demoFixed ? "both runs" : "not every run"}). 8 items × 2 runs is too few for significance; it is enough to see which items regressed.`, "note");

    const cell = (v, a) => runs[v].map((g) => g[a.id] || "?").join(" / ");
    return {
      final: `A/B of alert-triage prompts on ${ALERTS.length} labelled alerts, ${REPEATS} runs each. v1 accuracy ${pc(acc1)}, missed SEV1: ${missed1.join(", ") || "none"}. v2 accuracy ${pc(acc2)}, missed SEV1: ${missed2.join(", ") || "none"}. Rule: ${RULE} Decision: ${ship2 ? "ship v2" : "reject v2"}.`,
      compare: {
        cols: [
          { title: "Phase 1: one demo alert", short: "Demo", tone: "trap",
            verdict: ship1 ? `v2 got **${demo.id}** right, so it ships. The demo only covers what v2 was written to fix.` : "v2 missed the demo, but one item would not have shown why." },
          { title: "Phase 2: A/B on 8 labelled alerts, rule first", short: "A/B test", tone: "fix",
            verdict: ship2 ? "v2 met the rule this time: ship it, then canary." : `**Rejected**: v2 missed SEV1 on ${missed2.join(", ") || "-"}${passPrimary ? "" : " and lost accuracy"}, despite fixing ${demo.id}.` },
        ],
        rows: [
          ["Items compared", demo.id, `${ALERTS.length} alerts × ${REPEATS} runs, same ids for v1 and v2`],
          ["Decision rule", "whatever the demo shows", RULE],
          ...ALERTS.map((a) => [`${a.id} (gold ${a.gold})`, a.id === DEMO_ID ? `v1 ${d1[a.id] || "?"} · v2 ${d2[a.id] || "?"}` : "not tested",
            { v: `v1 ${cell("v1", a)} · v2 ${cell("v2", a)}`, tone: runs.v2.every((g) => g[a.id] === a.gold) ? "good" : "bad" }]),
          ["Accuracy (mean of runs)", "-", `v1 ${pc(acc1)} · v2 ${pc(acc2)}`],
          ["Decision", { v: ship1 ? "ship v2" : "hold", tone: ship1 ? "bad" : "good" }, { v: ship2 ? "ship v2" : "reject v2", tone: ship2 ? "bad" : "good" }],
        ],
        note: "Same two prompts in both phases. Eight items and two runs prove nothing statistically; they do show exactly which alerts v2 gets wrong, and the guardrail turns that into a decision nobody has to argue about.",
      },
      checks: [
        E.check("Phase 1: v2 labelled the demo alert correctly (SEV3), so the demo alone said ship v2", ship1),
        E.check("Phase 2: v1 and v2 labelled the same 8 alert ids in every run, all schema-valid", [...sc.v1, ...sc.v2].every((x) => x.complete) && runs.v1.length === REPEATS && runs.v2.length === REPEATS),
        E.check("Phase 2: v2 missed at least one gold SEV1 checkout or payment alert", missed2.some((id) => ["AL-02", "AL-03"].includes(id))),
        E.check("Phase 2: v1 caught every gold SEV1 alert in at least one run", sc.v1.some((x) => x.missed.length === 0)),
        E.check("Phase 2: the pre-agreed decision rule rejected v2", !ship2),
      ],
    };
  },
};
