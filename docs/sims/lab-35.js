// Lab 35 · Task 6.5 · Simulator 5 (Lumen Retail): go-live is a phase, not the end.
// Both phases plan the same assistant with the same facts: go-live on 1 March, handoff to Lumen's team in week 6,
// a new product range every season. Phase 1 uses the usual project-plan template, which ends at go-live and closure.
// Phase 2 uses a lifecycle template: monitoring signals with thresholds, owners and an action that sends the change
// back through evaluation, plus handoff criteria. Code then replays ten simulated weeks of production (the spring
// range lands in week 5 and escalations drift up) against each plan and reports when the drift is caught.
import { BASELINE, WEEKS, DRIFT_STARTS, SIGNALS, replay, routesToEval } from "./shared/d6-lumen.js";

const FACTS = `Lumen's product-support assistant goes live in 300 stores on 1 March (week 1). Lumen's in-house AI team (lead: Arun Pillai) takes over from the architect at the end of week 6. Lumen changes its product range every season; the spring range lands in week 5.
Pilot baseline: escalation rate ${BASELINE.escalation_rate_pct}%, weekly graded accuracy ${BASELINE.graded_accuracy_pct}% (100-answer sample), p95 latency ${BASELINE.p95_latency_s} s, model cost about US$${BASELINE.cost_per_day_usd} a day.
People: Grace Lim (COO, sponsor), Farid Rahman (store operations lead), Arun Pillai (Lumen AI team lead).`;
const ASK = "Write the delivery plan for the store product-support assistant.";

const PHASE = { type: "object", additionalProperties: false, properties: {
  name: { type: "string", enum: ["discovery", "design", "build", "pilot", "go_live", "handoff", "monitoring", "iteration", "closure"] },
  exit_gate: { type: "string" }, owner: { type: "string" } }, required: ["name", "exit_gate", "owner"] };
// The project template the trap uses: it ends at go-live and closes the project.
const PROJECT_SCHEMA = { type: "object", additionalProperties: false, properties: {
  phases: { type: "array", items: PHASE },
  closure: { type: "object", additionalProperties: false, properties: { when: { type: "string" }, sign_off_by: { type: "string" } }, required: ["when", "sign_off_by"] } },
  required: ["phases", "closure"] };
// The lifecycle template the fix uses: monitors that trigger iteration, and handoff criteria.
const LIFECYCLE_SCHEMA = { type: "object", additionalProperties: false, properties: {
  phases: { type: "array", items: PHASE },
  monitors: { type: "array", items: { type: "object", additionalProperties: false, properties: {
    signal: { type: "string", enum: SIGNALS },
    comparator: { type: "string", enum: ["above", "below", "occurs"] },
    threshold: { type: "number", description: "0 for an event signal" },
    consecutive_weeks: { type: "integer" },
    action: { type: "string", enum: ["rerun_eval_suite_and_iterate", "roll_back", "page_on_call", "notify_only"] },
    owner: { type: "string" } }, required: ["signal", "comparator", "threshold", "consecutive_weeks", "action", "owner"] } },
  handoff_criteria: { type: "array", items: { type: "object", additionalProperties: false, properties: {
    criterion: { type: "string" }, evidence: { type: "string" } }, required: ["criterion", "evidence"] } },
  iteration_loop: { type: "string", description: "What happens when a monitor fires, in one or two sentences" } },
  required: ["phases", "monitors", "handoff_criteria", "iteration_loop"] };

const PROJECT = "You are the delivery lead's assistant on the Lumen Retail engagement. Fill in the standard project plan template: the phases up to go-live, each with its exit gate and owner, then project closure. Reply with the JSON only.";
const LIFECYCLE = "You are the delivery lead's assistant on the Lumen Retail engagement. Fill in the lifecycle plan template. The phases run discovery, design, build, pilot, go-live, handoff, monitoring and iteration, each with an exit gate and owner. Define the production monitors: each signal with a threshold set from the pilot baseline, how many consecutive weeks it must hold, the action, and an owner; a monitor that finds drift or a catalogue change must send the change back through evaluation (rerun_eval_suite_and_iterate). List the handoff criteria Lumen's team must meet, each with its evidence. Reply with the JSON only.";

const caught = (fired) => fired.filter((m) => m.fired && (routesToEval(m.action) || m.action === "page_on_call")).map((m) => m.fired);
const complaintWeek = WEEKS.find((w) => w.complaint).week;

export default {
  id: 35,
  see: "Phase 1's plan ends at go-live and closure, so the replay has nothing watching: the spring-range drift from week 5 is found in week 8, when store managers complain to the COO. Phase 2's plan has monitors set from the pilot baseline: the catalogue change fires in week 5 and the escalation-rate monitor soon after, both sending the change back through the eval suite, and the handoff has criteria with evidence.",
  try: "Change the spring range in WEEKS (shared/d6-lumen.js) to land in week 8 and run it again: Phase 2 catches it the week it happens, Phase 1 does not catch it at all inside ten weeks. Then raise an escalation threshold in the plan to 16% and see the drift slip past.",
  explain: "Both phases plan the same assistant from the same facts. The usual project template stops at go-live and closes the project, so nobody owns the system's behaviour afterwards. Inputs then drift: the spring range brings 1,850 new products and harder questions, escalations climb from 8% to 15%, and the first signal is a complaint to the COO three weeks later. The lifecycle template treats go-live as one phase in a loop: monitors with thresholds from the pilot baseline, an owner for each, and an action that sends the change back through evaluation before anything ships; the handoff is passed against criteria with evidence, not on a date. Code replays the same ten weeks against both plans.",
  scene: {
    title: "Lumen after go-live: the spring range lands in week 5. When does anyone notice?",
    caption: "Same assistant, same facts, same ten weeks of production. Only the plan's template differs.",
    lanes: [
      { key: "p1", label: "Phase 1 · plan to go-live", sub: "project template: go-live, then closure", tone: "trap", on: /Phase 1/, stages: [
        { id: "a_facts", icon: "🗓", t: "Go-live 1 March", s: "handoff week 6, new range each season" },
        { id: "a_plan", icon: "🤖", t: "Claude fills the template", s: "phases to go-live, closure", claude: true, diff: true },
        { id: "a_mon", icon: "📡", t: "Production monitors", s: "what watches after go-live?" },
        { id: "a_replay", icon: "⏩", t: "Replay 10 weeks", s: "spring range in week 5, drift 8% → 15%" },
        { id: "a_out", icon: "🚨", t: "Drift caught in week…", s: "want: by week 6, routed to the evals", out: true } ] },
      { key: "p2", label: "Phase 2 · lifecycle plan", sub: "monitors trigger iteration; handoff criteria", tone: "fix", on: /Phase 2/, stages: [
        { id: "b_facts", icon: "🗓", t: "Go-live 1 March", s: "the same facts" },
        { id: "b_plan", icon: "🤖", t: "Claude fills the template", s: "phases, monitors, handoff criteria", claude: true, diff: true },
        { id: "b_mon", icon: "📡", t: "Production monitors", s: "what watches after go-live?" },
        { id: "b_replay", icon: "⏩", t: "Replay 10 weeks", s: "spring range in week 5, drift 8% → 15%" },
        { id: "b_out", icon: "🚨", t: "Drift caught in week…", s: "want: by week 6, routed to the evals", out: true } ] },
    ],
  },
  slide: {
    title: "Go-live is a phase: monitors send changes back to eval",
    code: `phases = ["discovery", "design", "build",
          "pilot", "go_live", "handoff",
          "monitoring", "iteration"]           # KEY 1
monitors = [
  {"signal": "escalation_rate_pct",            # KEY 2
   "above": 11, "weeks": 1,
   "action": "rerun_eval_suite_and_iterate",
   "owner": "Arun Pillai"},
  {"signal": "catalogue_change_event",         # KEY 3
   "action": "rerun_eval_suite_and_iterate"},
]
handoff_criteria = [                           # KEY 4
  {"criterion": "team ships a prompt change alone",
   "evidence": "eval report >= 92%"},
  {"criterion": "runbook rehearsed", "evidence": "drill log"}]`,
    keys: [["1", "The loop doesn't end", "Monitoring and iteration follow go-live."],
           ["2", "Thresholds from the baseline", "8% in the pilot; act well before 15%."],
           ["3", "Known change is a trigger", "A new range re-runs the evals before it bites."],
           ["4", "Handoff on evidence", "Criteria the receiving team must prove."]],
  },
  async run(s, E) {
    s.log(`Lumen Retail · ${ASK}`, "note");
    s.log(FACTS.split("\n")[0], "note");

    s.log("== Phase 1 · plan to go-live: the project template ends at go-live and closure", "note");
    s.show("a_facts", "go-live wk 1 · handoff wk 6 · range wk 5", "done");
    const r1 = await E.runAgent(s, { system: PROJECT, prompt: `${FACTS}\n\n${ASK}`, output_config: { format: { type: "json_schema", schema: PROJECT_SCHEMA } }, max_tokens: 3000, maxTurns: 1 });
    let j1 = null; try { j1 = JSON.parse(r1.text); } catch { /* checked below */ }
    const ph1 = (j1?.phases || []).map((p) => p.name);
    s.show("a_plan", `${ph1.join(" → ") || "no phases"}`, "done");
    const f1 = replay(j1?.monitors || []);
    s.show("a_mon", f1.length ? `${f1.length} monitors` : "none: the project closes at go-live", "done");
    const c1 = caught(f1);
    const week1 = c1.length ? Math.min(...c1) : complaintWeek;
    s.log(`Replay: ${WEEKS.map((w) => `wk${w.week} ${w.escalation_rate_pct}%${w.catalogue_change_event ? " (new range)" : ""}`).join(" · ")}`, "result");
    s.log(c1.length ? `Phase 1: a monitor caught the drift in week ${week1}.` : `Phase 1: nothing watches after go-live. The drift that starts in week ${DRIFT_STARTS} is found in week ${complaintWeek}: "${WEEKS[complaintWeek - 1].complaint}".`, "note");
    s.show("a_replay", `nothing fires · wk ${complaintWeek}: store managers complain`, "done");
    s.show("a_out", c1.length ? `week ${week1}` : `week ${complaintWeek}, by complaint, ${complaintWeek - DRIFT_STARTS} weeks late`, c1.length && week1 <= DRIFT_STARTS + 1 ? "good" : "bad");
    await s.pause({
      title: "Phase 1 finished: a plan that ends at go-live",
      outcome: `The plan runs ${ph1.join(" → ")} and closes. **Nothing watches the system after go-live**, so the spring-range drift that starts in week ${DRIFT_STARTS} is first noticed in **week ${complaintWeek}, from a complaint to the COO**, after Lumen's team had already taken over without criteria.`,
      next: "Phase 2: the same facts, with the lifecycle template: monitors that send changes back through evaluation, and handoff criteria",
    });

    s.log("== Phase 2 · lifecycle plan: monitors with thresholds and owners trigger iteration through the eval suite; handoff criteria", "note");
    s.show("b_facts", "go-live wk 1 · handoff wk 6 · range wk 5", "done");
    const r2 = await E.runAgent(s, { system: LIFECYCLE, prompt: `${FACTS}\n\n${ASK}`, output_config: { format: { type: "json_schema", schema: LIFECYCLE_SCHEMA } }, max_tokens: 4000, maxTurns: 1 });
    let j2 = null; try { j2 = JSON.parse(r2.text); } catch { /* checked below */ }
    const ph2 = (j2?.phases || []).map((p) => p.name);
    s.show("b_plan", `${ph2.length} phases · ${(j2?.monitors || []).length} monitors · ${(j2?.handoff_criteria || []).length} handoff criteria`, "done");
    const f2 = replay(j2?.monitors || []);
    for (const m of f2) s.log(`  monitor ${m.signal} ${m.comparator}${m.comparator === "occurs" ? "" : " " + m.threshold} (${m.consecutive_weeks} wk) → ${m.action} · owner ${m.owner} · ${m.fired ? `FIRES in week ${m.fired}` : "never fires"}`, m.fired ? "result" : "note");
    s.show("b_mon", f2.map((m) => m.signal.replace(/_(pct|s|usd|event)$/, "").replace(/_/g, " ")).slice(0, 3).join(", ") || "none", "done");
    const c2 = caught(f2);
    const week2 = c2.length ? Math.min(...c2) : null;
    const drift = f2.filter((m) => m.signal === "escalation_rate_pct" && m.fired && routesToEval(m.action));
    const cat = f2.find((m) => m.signal === "catalogue_change_event" && m.fired && routesToEval(m.action));
    const firstEval = f2.filter((m) => m.fired && routesToEval(m.action)).map((m) => m.fired);
    const evalWeek = firstEval.length ? Math.min(...firstEval) : null;
    s.show("b_replay", f2.filter((m) => m.fired).map((m) => `${m.signal.split("_")[0]} wk ${m.fired}`).join(" · ") || "nothing fires", "done");
    s.show("b_out", evalWeek ? `week ${evalWeek} → re-run evals and iterate` : week2 ? `week ${week2}, not routed to evals` : "not caught", evalWeek && evalWeek <= DRIFT_STARTS + 1 ? "good" : "bad");
    const hc = j2?.handoff_criteria || [];
    const loopOk = ["handoff", "monitoring", "iteration"].every((p) => ph2.includes(p));

    const final = j2 ? ["Lifecycle plan (Phase 2):", `Phases: ${ph2.join(" → ")}`, "Monitors:",
      ...f2.map((m) => `- ${m.signal} ${m.comparator}${m.comparator === "occurs" ? "" : " " + m.threshold} for ${m.consecutive_weeks} wk → ${m.action} (owner ${m.owner}) · replay: ${m.fired ? `fires week ${m.fired}` : "never fires"}`),
      "Handoff criteria:", ...hc.map((h) => `- ${h.criterion} (evidence: ${h.evidence})`), `Iteration loop: ${j2.iteration_loop}`].join("\n") : r2.text;
    return {
      final,
      compare: {
        cols: [
          { title: "Phase 1: project plan to go-live", short: "Plan to go-live", tone: "trap", said: r1.text,
            verdict: `The plan stops at ${ph1.at(-1) || "go-live"}. **No monitor, no owner after go-live**: the drift from week ${DRIFT_STARTS} surfaces in week ${complaintWeek} as a complaint to the COO.` },
          { title: "Phase 2: lifecycle plan", short: "Lifecycle plan", tone: "fix", said: r2.text,
            verdict: evalWeek && evalWeek <= DRIFT_STARTS + 1
              ? `${cat ? `The catalogue-change monitor fires in week ${cat.fired}` : "A monitor fires"}${drift.length ? ` and the escalation-rate monitor in week ${Math.min(...drift.map((m) => m.fired))}` : ""}; **both send the change back through the eval suite**, ${complaintWeek - evalWeek} weeks before any complaint. ${hc.length} handoff criteria carry evidence.`
              : `First routed to the evals in week ${evalWeek ?? "never"}. Read the live output: Claude writes each run fresh.` },
        ],
        rows: [
          ["Phases", ph1.join(" → ") || "none", { v: ph2.join(" → ") || "none", tone: loopOk ? "good" : "bad" }],
          ["Monitors after go-live", { v: "0", tone: "bad" }, { v: String(f2.length), tone: f2.length ? "good" : "bad" }],
          ["Drift first acted on (it starts week 5)", { v: `week ${complaintWeek}, a complaint`, tone: "bad" }, { v: evalWeek ? `week ${evalWeek}, re-run evals` : "never", tone: evalWeek && evalWeek <= DRIFT_STARTS + 1 ? "good" : "bad" }],
          ["Catalogue change triggers evaluation", { v: "no", tone: "bad" }, { v: cat ? `yes, week ${cat.fired}` : "no", tone: cat ? "good" : "bad" }],
          ["Handoff criteria with evidence", { v: "none", tone: "bad" }, { v: String(hc.filter((h) => h.evidence?.trim()).length), tone: hc.length >= 3 ? "good" : "bad" }],
        ],
        note: "Same assistant, same facts, same ten simulated weeks. The only difference is the plan's template: one ends at go-live, the other makes monitoring signals send changes back through evaluation.",
      },
      checks: [
        E.check(`Phase 1: the plan has no production monitor, so the week-${DRIFT_STARTS} drift waits for the week-${complaintWeek} complaint`, j1 && c1.length === 0),
        E.check("Phase 2: the plan's phases include handoff, monitoring and iteration", loopOk),
        E.check(`Phase 2: in the replay a monitor sends the change back through the eval suite by week ${DRIFT_STARTS + 1}`, evalWeek !== null && evalWeek <= DRIFT_STARTS + 1),
        E.check("Phase 2: an escalation-rate monitor catches the drift before the complaint, routed to the evals", drift.length > 0 && Math.min(...drift.map((m) => m.fired)) < complaintWeek),
        E.check("Phase 2: at least 3 handoff criteria, each with its evidence", hc.length >= 3 && hc.every((h) => h.evidence?.trim())),
      ],
    };
  },
};
