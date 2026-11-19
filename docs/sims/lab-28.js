// Lab 28 · Task 5.3 · Simulator 3: put the human where the risk is, and give them the reason.
// Claude drafts four documents from four synthetic visit notes in one structured call, reporting the
// medications it wrote, its open questions and its confidence. Phase 1 is the uniform design: every draft
// joins one sign-off queue with no risk signals, so at Meridian's volume each gets 54 seconds of a clinician.
// Phase 2 routes each draft in code by impact × reversibility × uncertainty: full review with reasons for
// flagged drafts, a quick co-sign for unflagged letters that leave the hospital, auto-filing with a sampled
// audit for unflagged internal notes. The clinicians are simulated; the drafts and Claude's signals are live.
import { structured } from "./shared/d5-call.js";
import { NOTES, sourceSignals, uniformLoad, routedLoad, CAPACITY } from "./shared/d5-clinical.js";

const SYSTEM = "You are Meridian Health's clinical documentation assistant. You draft discharge notes, GP letters and referrals from clinicians' visit notes for a clinician to sign. Use only facts in the note. Report every medication instruction you wrote, and your confidence. List an open question only if the document would be unsafe or wrong to send without the answer; most documents have none.";
const SCHEMA = { type: "object", additionalProperties: false, required: ["drafts"], properties: { drafts: { type: "array", items: {
  type: "object", additionalProperties: false, required: ["patient", "text", "medications", "open_questions", "confidence"],
  properties: {
    patient: { type: "string" },
    text: { type: "string", description: "the draft document, at most 90 words" },
    medications: { type: "array", items: { type: "object", additionalProperties: false, required: ["drug", "instruction"], properties: { drug: { type: "string" }, instruction: { type: "string" } } } },
    open_questions: { type: "array", items: { type: "string" } },
    confidence: { type: "string", enum: ["high", "medium", "low"] } } } } } };

async function draftAll(s, E) {
  const user = "Draft one document per note below.\n\n" + NOTES.map((n) => `${n.patient} · MRN ${n.mrn} · document: ${n.doc} · to: ${n.dest.name}\nNote: ${n.note}`).join("\n\n");
  const r = await structured(s, E, { label: "Draft four documents", system: SYSTEM, schema: SCHEMA, max_tokens: 4096, user });
  const drafts = r.out?.drafts || [];
  return NOTES.map((n) => drafts.find((d) => (d.patient || "").includes(n.patient) || (d.patient || "").includes(n.mrn)) || drafts[NOTES.indexOf(n)] || null);
}

// Risk routing, in code. Impact and irreversibility come from the source and the destination; uncertainty
// from Claude's own signals. Reversible internal notes are monitored, not gated, unless the source is high risk.
function route(n, d) {
  const src = sourceSignals(n);
  const unsure = [];
  if (!d) unsure.push("no draft returned");
  else {
    if (d.confidence !== "high") unsure.push(`Claude's confidence: ${d.confidence}`);
    for (const q of d.open_questions || []) unsure.push(`Claude asks: ${q}`);
  }
  const highRisk = src.length > 0;
  const lane = highRisk || (n.dest.external && unsure.length) ? "full review" : n.dest.external ? "co-sign" : "auto-file";
  return {
    patient: n.patient, doc: n.doc, lane, reasons: [...src.map((x) => x.why), ...unsure],
    axes: { impact: highRisk ? "high" : n.dest.external ? "medium" : "low", reversible: !n.dest.external, uncertainty: unsure.length ? "flagged" : "none" },
    sampled: lane === "auto-file" && unsure.length > 0,     // an unsure internal note always joins the audit sample
  };
}

// The simulated clinician: with 54 seconds a draft they sign what they see; with reasons and 4 minutes they act on them.
function review(n, r, uniform) {
  if (uniform) return { action: "signed as drafted", seconds: uniformLoad().secondsEach };
  if (r.lane === "full review") return { action: r.reasons.some((x) => /dose differs/.test(x)) ? "held: dose confirmed with the ward team before release" : r.reasons.some((x) => /pending/.test(x)) ? "held: released once the echo report is attached" : "corrected, then signed", seconds: CAPACITY.fullReview * 60 };
  if (r.lane === "co-sign") return { action: "co-signed", seconds: CAPACITY.coSign * 60 };
  return { action: r.sampled ? "filed; in the audit sample" : "filed (amendable)", seconds: 0 };
}

// The reasons as the reviewer's queue shows them: the source signals, then how many questions Claude raised.
const brief = (r) => [...r.reasons.filter((x) => !/^Claude/.test(x)), ...r.reasons.filter((x) => /^Claude's confidence/.test(x)),
  ...(r.reasons.some((x) => /^Claude asks/.test(x)) ? [`${r.reasons.filter((x) => /^Claude asks/.test(x)).length} question(s) from Claude`] : [])].join("; ") || "-";
const doseIn = (d) => ((d?.text || "") + " " + JSON.stringify(d?.medications || [])).match(/warfarin[^.;]{0,60}?(\d+)\s*mg/i)?.[1];

export default {
  id: 28,
  see: "Phase 1: all four drafts join one sign-off queue; at 600 drafts a day each gets 54 seconds, so Patient C's warfarin letter goes out with the 5 mg vs 3 mg conflict unresolved. Phase 2: code routes C (warfarin dose conflict, leaves the hospital) and D (echo report pending) to full review with the reasons shown, co-signs B and auto-files A's internal note. The reviewers need 480 of their 540 minutes instead of 2,400.",
  try: "Change Patient B's note in sims/shared/d5-clinical.js to \"…oxycodone 5 mg every 6 hours as needed…\" and rerun: B moves to full review because oxycodone is on the high-alert list. Then change Patient A's destination to external: true and watch it move from auto-file to co-sign.",
  explain: "A uniform 100% review looks like the safest design, and at volume it fails: 600 drafts a day in 540 reviewer minutes leaves 54 seconds each, so the review turns into a signature. The warfarin letter needed four minutes and a reason to look. Phase 2 spends the same reviewers' time by risk. Code reads what it can check for itself (a high-alert medication, two different doses, a pending result, whether the document leaves the hospital) and adds Claude's own open questions and confidence as a signal, not a verdict. Irreversible, high-impact drafts get a full review with the reasons on screen; unflagged letters get a quick co-sign; unflagged internal notes, which a clinician can amend, are filed and sampled for audit. Every decision goes to the audit log with its axes and reasons.",
  scene: {
    title: "Four drafts, 540 reviewer minutes a day for 600 drafts. Where do the minutes go?",
    caption: "Both phases send the same four notes to Claude in one call. Only how the drafts reach a clinician differs. The clinicians are simulated.",
    lanes: [
      { key: "p1", label: "Phase 1 · one queue, everything signed", sub: "uniform 100% sign-off, no reasons", tone: "trap", on: /Phase 1/, stages: [
        { id: "a_notes", icon: "🗂", t: "Four visit notes", s: "A chart note · B, C GP letters · D referral" },
        { id: "a_draft", icon: "🤖", t: "Draft four documents", s: "drafts + medications + questions", claude: true },
        { id: "a_route", icon: "🔀", t: "One FIFO sign-off queue", s: "every draft the same; signals ignored", diff: true },
        { id: "a_review", icon: "🩺", t: "Clinician sign-off", s: "54 s a draft at 600 a day" },
        { id: "a_out", icon: "📤", t: "Patient C's warfarin letter", s: "want: held until the dose is confirmed", out: true } ] },
      { key: "p2", label: "Phase 2 · route by risk", sub: "impact × reversibility × uncertainty", tone: "fix", on: /Phase 2/, stages: [
        { id: "b_notes", icon: "🗂", t: "Four visit notes", s: "the same notes" },
        { id: "b_draft", icon: "🤖", t: "Draft four documents", s: "drafts + medications + questions", claude: true },
        { id: "b_route", icon: "🔀", t: "Risk router (code)", s: "full review · co-sign · auto-file", diff: true },
        { id: "b_review", icon: "🩺", t: "Review queue with reasons", s: "4 min for flagged drafts" },
        { id: "b_out", icon: "📤", t: "Patient C's warfarin letter", s: "want: held until the dose is confirmed", out: true } ] },
    ],
  },
  slide: {
    title: "Route each draft by risk, and show the reviewer why",
    code: `def route(note, draft):
    src = source_signals(note)          # KEY 1
    unsure = draft.open_questions or \\
             draft.confidence != "high"   # KEY 2
    leaves = note.dest.external         # KEY 3
    if src or (leaves and unsure):
        lane = "full_review"            # reasons shown
    elif leaves:
        lane = "co_sign"
    else:
        lane = "auto_file"              # amendable
    audit.log(note.id, lane, src, unsure)   # KEY 4
    return lane`,
    keys: [["1", "Impact from the source", "High-alert drug, dose conflict, pending result."],
           ["2", "Uncertainty is a signal", "Claude's questions and confidence flag; they don't decide."],
           ["3", "Reversibility sets the gate", "A letter can't be recalled; a chart note can be amended."],
           ["4", "Every route is evidence", "Log the axes and reasons; sample what wasn't reviewed."]],
  },
  async run(s, E) {
    const U = uniformLoad(), R = routedLoad();
    s.log(`Four notes: ${NOTES.map((n) => `${n.patient} (${n.doc}${n.dest.external ? ", leaves the hospital" : ", internal"})`).join(", ")}. Meridian drafts ${CAPACITY.perDay} documents a day; three clinicians give ${CAPACITY.minutesAvailable} minutes to sign-off.`, "note");
    s.log("== Phase 1 · one queue, everything signed: every draft joins one sign-off queue with no risk signals", "note");
    s.show("a_notes", "A · B · C · D", "done");
    const d1 = await draftAll(s, E);
    s.show("a_draft", `${d1.filter(Boolean).length} drafts · C: warfarin ${doseIn(d1[2]) ? doseIn(d1[2]) + " mg" : "?"}`, "done");
    const q1 = NOTES.map((n, i) => ({ patient: n.patient, lane: "sign-off queue", reasons: [], outcome: review(n, null, true) }));
    for (const q of q1) s.log(`  queue · ${q.patient}: ${q.outcome.action} after ${q.outcome.seconds} s`, "result");
    s.show("a_route", "4 drafts, one queue, no reasons", "done");
    s.show("a_review", `${U.secondsEach} s each · needs ${U.needed} min of ${CAPACITY.minutesAvailable}`, "done");
    const srcC = sourceSignals(NOTES[2]);
    const conflictC = srcC.find((x) => x.kind === "conflict");
    s.show("a_out", `released after ${U.secondsEach} s, conflict unseen`, "bad");
    s.log(`Phase 1 result: Patient C's letter (warfarin ${doseIn(d1[2]) || "?"} mg in the draft) was signed after ${U.secondsEach} seconds. The note's ${conflictC ? conflictC.why.replace("warfarin dose differs in the note: ", "") : "dose"} conflict was never shown to the reviewer. A proper review of every draft would need ${U.needed} minutes a day: ${U.load.toFixed(1)}× the time the clinicians have.`, "note");
    await s.pause({
      title: "Phase 1 finished: every draft signed, none really reviewed",
      outcome: `**Patient C's warfarin letter left the hospital after a ${U.secondsEach}-second sign-off**, with the note's ${conflictC ? conflictC.why.replace("warfarin dose differs in the note: ", "") : "dose"} conflict unresolved. Reviewing all ${CAPACITY.perDay} drafts properly needs ${U.needed} minutes a day; the clinicians have ${CAPACITY.minutesAvailable}.`,
      next: "Phase 2: the same notes, routed in code by impact × reversibility × uncertainty",
    });

    s.log("== Phase 2 · route by risk: full review with reasons for flagged drafts, co-sign for unflagged letters, auto-file and sample for unflagged internal notes", "note");
    s.show("b_notes", "A · B · C · D", "done");
    const d2 = await draftAll(s, E);
    s.show("b_draft", `${d2.filter(Boolean).length} drafts · C: warfarin ${doseIn(d2[2]) ? doseIn(d2[2]) + " mg" : "?"}`, "done");
    const routes = NOTES.map((n, i) => route(n, d2[i]));
    const audit = [];
    routes.forEach((r, i) => {
      const o = review(NOTES[i], r, false); r.outcome = o;
      audit.push({ at: "2026-11-17T16:0" + i + ":00", patient: r.patient, mrn: NOTES[i].mrn, lane: r.lane, ...r.axes, reasons: r.reasons, outcome: o.action });
      s.log(`  route · ${r.patient}: ${r.lane.toUpperCase()} · impact ${r.axes.impact}, ${r.axes.reversible ? "reversible" : "irreversible"}, uncertainty ${r.axes.uncertainty}${r.reasons.length ? ` · ${r.reasons.join("; ")}` : ""} -> ${o.action}`, r.lane === "full review" ? "deny" : "result");
    });
    const count = (l) => routes.filter((r) => r.lane === l).length;
    s.show("b_route", `full ${count("full review")} · co-sign ${count("co-sign")} · auto ${count("auto-file")}`, "done");
    s.show("b_review", `${R.needed} of ${CAPACITY.minutesAvailable} min a day (load ${R.load.toFixed(2)})`, "done");
    const rc = routes[2];
    const cOk = rc.lane === "full review" && rc.reasons.some((x) => /warfarin/.test(x)) && rc.reasons.some((x) => /dose differs/.test(x));
    s.show("b_out", cOk ? "full review: held, dose confirmed" : `${rc.lane}`, cOk ? "good" : "bad");

    const lanes1 = q1.map((q) => `${q.patient.slice(-1)}: signed`).join(" · ");
    const lanes2 = routes.map((r) => `${r.patient.slice(-1)}: ${r.lane}`).join(" · ");
    return {
      final: routes.map((r) => `${r.patient} → ${r.lane}: ${r.outcome.action}${r.reasons.length ? ` (${r.reasons.join("; ")})` : ""}`).join("\n"),
      compare: {
        cols: [
          { title: "Phase 1: one queue, everything signed", short: "Uniform sign-off", tone: "trap", said: d1[2]?.text,
            verdict: `Every draft got **${U.secondsEach} seconds**. Patient C's warfarin letter was signed as drafted; the dose conflict in the note was never put in front of the reviewer.` },
          { title: "Phase 2: route by risk, with reasons", short: "Risk-routed", tone: "fix", said: d2[2]?.text,
            verdict: cOk
              ? `C went to **full review** with the reasons on screen (${brief(rc)}) and was held until the dose was confirmed. ${count("auto-file") + count("co-sign")} draft(s) took little or no reviewer time.`
              : `Routes: ${lanes2}. Read the live output: Claude writes each run fresh.` },
        ],
        rows: [
          ["Routing", "one FIFO queue", { v: lanes2, tone: "good" }],
          ["What the reviewer sees for C", { v: "the draft only", tone: "bad" }, { v: brief(rc), tone: cOk ? "good" : "bad" }],
          ["Time per draft", `${U.secondsEach} s each`, `${CAPACITY.fullReview} min flagged · ${CAPACITY.coSign * 60} s co-sign · 0 s auto-file`],
          ["Reviewer minutes a day (600 drafts)", { v: `${U.needed} needed / ${CAPACITY.minutesAvailable} (load ${U.load.toFixed(1)})`, tone: "bad" }, { v: `${R.needed} needed / ${CAPACITY.minutesAvailable} (load ${R.load.toFixed(2)})`, tone: "good" }],
          ["Patient C outcome", { v: "released, conflict unseen", tone: "bad" }, { v: rc.outcome.action, tone: cOk ? "good" : "bad" }],
          ["Audit trail", "signature only", { v: `${audit.length} routing records with axes and reasons`, tone: "good" }],
        ],
        note: `Phase 1 lanes: ${lanes1}. The clinicians are simulated, and the time model (600 drafts, 540 minutes, 4 minutes for a careful review, last month's routing mix) is illustrative. Claude's drafts and signals are live.`,
      },
      checks: [
        E.check("Phase 1: Patient C's warfarin letter was signed in the uniform queue without the dose conflict being shown to the reviewer", d1.filter(Boolean).length === 4 && !!conflictC && q1[2].outcome.action === "signed as drafted"),
        E.check("Phase 2: Patient C was routed to full review with reasons naming warfarin and the dose conflict", cOk),
        E.check("Phase 2: Patient D's referral was held for full review because the echo report is pending", routes[3].lane === "full review" && routes[3].reasons.some((x) => /pending/.test(x))),
        E.check("Phase 2: Patient A's internal note was auto-filed, not queued, and reviewer load fits the time available", d2.filter(Boolean).length === 4 && routes[0].lane === "auto-file" && R.load <= 1 && U.load > 1),
        E.check("Phase 2: every routing decision is in the audit log with its impact, reversibility, uncertainty and reasons", audit.length === 4 && audit.every((a) => a.lane && a.impact && typeof a.reversible === "boolean" && a.uncertainty && Array.isArray(a.reasons))),
      ],
    };
  },
};
