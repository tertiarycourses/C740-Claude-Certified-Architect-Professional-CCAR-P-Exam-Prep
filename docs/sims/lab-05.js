// Lab 5 · Task 1.5 · Simulator 3 (Meridian Health): decompose the discharge pack, then reconcile.
// Patient A (MRN 00-4417, synthetic) is discharged after five days. The pack has six sections for three
// readers: clinicians (diagnoses, course, medications, allergies, pending results), the GP (actions) and the
// patient (take-home instructions in plain English). Each section has its own rules.
// Phase 1: one giant prompt writes the whole pack in one call. Phase 2: one pass per section group, each with
// only its own notes and rules (later passes read the medication pass's JSON, not the raw notes), then a
// reconciliation step in code that checks every rule and the cross-section facts, with one repair pass for a
// section that fails. Same notes, same rules, same per-call budget (max_tokens 4096) in both phases.
import { PATIENT, NOTES, notesText, TRUTH, ALLERGY } from "./shared/d1-meridian.js";
import { pass, obj, str, arr, oneOf } from "./shared/d1-kit.js";

const SYSTEM = "You draft hospital discharge documents for Meridian Health clinicians to sign off.";
const HEAD = `Patient ${PATIENT.name}, MRN ${PATIENT.mrn}, admitted ${PATIENT.admitted}, discharged ${PATIENT.discharged}.`;
const BUDGET = 4096;
const RULE = {
  clinical: "diagnoses and hospital_course: clinical language for clinicians; hospital_course under 120 words. pending_results: every result not final at discharge, with who will chase it.",
  meds: "medications: every drug on admission or started in hospital, with dose, frequency, status (new, changed, unchanged, stopped; a drug held until a later review counts as stopped at discharge) and the reason for any change. allergies: every confirmed allergy with the reaction.",
  gp: "gp_actions: each action the GP must take, one per line.",
  patient: "patient_instructions: for the patient to take home. Plain English at a reading age of 11. No abbreviations and no medical jargon. Under 120 words. Say which medicines to take, which to stop, and what happens next.",
};
const MED = obj({ drug: str(), dose: str(), frequency: str(), status: oneOf(["new", "changed", "unchanged", "stopped"]), reason: str() });
const ALG = obj({ substance: str(), reaction: str() });
const SCHEMA = {
  whole: obj({ diagnoses: arr(str()), hospital_course: str(), medications: arr(MED), allergies: arr(ALG), pending_results: arr(str()), gp_actions: arr(str()), patient_instructions: str() }),
  meds: obj({ medications: arr(MED), allergies: arr(ALG) }),
  clinical: obj({ diagnoses: arr(str()), hospital_course: str(), pending_results: arr(str()) }),
  gp: obj({ gp_actions: arr(str()) }),
  patient: obj({ patient_instructions: str() }),
};
// Which notes each section group reads (the routine observation notes go to none of them).
const ROUTE = { meds: ["admission", "pharmacy", "ward_round", "specialist", "nursing"], clinical: ["admission", "ward_round", "specialist", "discharge_plan"], gp: ["discharge_plan"] };
const routed = (g) => NOTES.filter((n) => ROUTE[g].includes(n.type));

// The rules, in code. Each returns a list of problems for its section group (empty = passes).
const words = (t) => String(t || "").split(/\s+/).filter(Boolean).length;
const ABBREV = /\b(BD|OD|TDS|ON|PO|U&E|CXR|AKI|INR|IV|NKDA|abx|Dx|mg|RA)\b/g;
const CURRENT = ["apixaban", "ramipril", "atorvastatin", "doxycycline"];
function validate(group, d) {
  const p = [];
  if (!d) return ["no readable JSON"];
  if (group === "meds") {
    for (const [drug, t] of Object.entries(TRUTH)) {
      const m = (d.medications || []).find((x) => new RegExp(drug, "i").test(x.drug));
      if (!m) p.push(`${drug} is missing from medications`);
      else { if (m.status !== t.status) p.push(`${drug} status is ${m.status}; the last order makes it ${t.status}`); if (t.dose && !t.dose.test(m.dose)) p.push(`${drug} dose ${m.dose} does not match the last order`); }
    }
    if (!(d.allergies || []).some((a) => ALLERGY.test(a.substance))) p.push("penicillin allergy not recorded");
  }
  if (group === "clinical") {
    if (words(d.hospital_course) >= 120) p.push(`hospital_course is ${words(d.hospital_course)} words (rule: under 120)`);
    if (!(d.pending_results || []).some((x) => /culture/i.test(x))) p.push("pending blood culture not listed");
  }
  if (group === "gp") {
    const g = (d.gp_actions || []).join(" \n");
    if (!/U&E|renal|kidney|creatinine/i.test(g)) p.push("GP actions miss the U&E check in 1 week");
    if (!/metformin/i.test(g)) p.push("GP actions miss the metformin restart decision");
    if (!/INR|warfarin/i.test(g)) p.push("GP actions miss stopping warfarin and INR monitoring");
  }
  if (group === "patient") {
    const t = d.patient_instructions || "";
    if (words(t) >= 120) p.push(`patient_instructions is ${words(t)} words (rule: under 120)`);
    const ab = [...new Set(t.match(ABBREV) || [])]; if (ab.length) p.push(`patient_instructions uses abbreviations: ${ab.join(", ")}`);
    const miss = CURRENT.filter((m) => !new RegExp(m, "i").test(t)); if (miss.length) p.push(`patient_instructions does not name ${miss.join(", ")}`);
    if (!/warfarin/i.test(t) || !/metformin/i.test(t)) p.push("patient_instructions must tell the patient to stop warfarin and not take metformin");
  }
  return p;
}
const GROUPS = ["meds", "clinical", "gp", "patient"];
const NAMES = { meds: "medications + allergies", clinical: "diagnoses, course, pending", gp: "GP actions", patient: "patient instructions" };

export default {
  id: 5,
  see: "Phase 1: one call is asked for all six sections for three readers. In most of our runs it spends its whole 4,096-token budget planning and stops with stop_reason max_tokens before writing anything usable; when it does finish, a section tends to break its own rule. Phase 2: four section passes, each with only its own notes and rules, then a reconciliation step in code that checks every rule and the medication list against the last order for each drug. A section that fails (or occasionally runs out of budget itself) is redone alone, once, and the pack passes.",
  try: "Raise BUDGET to 16000 and run it again: Phase 1 now usually finishes, but compare its patient instructions with the rules in RULE.patient and count the problems the reconciler lists. Then delete the ramipril line from note N15 in shared/d1-meridian.js: the medication pass reports ramipril 5 mg unchanged, and the reconciler names that exact problem.",
  explain: "A discharge pack is several jobs that share one record: a medication reconciliation that must follow the last order for each drug, a clinical narrative for clinicians, an action list for the GP and plain-English instructions for the patient. One giant prompt makes the model plan and write all of them at once under one output budget and one blended set of rules, so it either runs out (stop_reason max_tokens) or lets a section slip. Decomposition cuts at narrow seams: the medication pass returns structured JSON, and the GP and patient passes read that JSON instead of the raw notes. Every seam is checkable, so code validates each section against its own rules and the cross-section facts, and a failing section is repaired on its own. The cost is more calls and a design to maintain: cut where the output can be checked.",
  diagram: { kind: "passes", title: "One call for the whole pack, or one pass per section and a reconcile step",
    main: "Single call: the whole pack", sub: "section pass", ghost: [{ subs: ["medications + allergies", "clinical", "GP actions", "patient"] }],
    caption: "Phase 1 is one call for all six sections. Phase 2 runs one pass per section group, each with only its notes and rules; the GP and patient passes read the medication pass's JSON. The reconciliation step runs in your code (no Claude call); a section that fails it gets one repair pass." },
  scene: {
    title: "Patient A's discharge pack: six sections, three readers, one record",
    caption: "Both phases read the same 20 notes (8 clinical, 12 routine observations) under the same section rules and the same 4,096-token budget per call. Only the decomposition differs.",
    lanes: [
      { key: "p1", label: "Phase 1 · one giant prompt", sub: "all sections, all rules, one call", tone: "trap", on: /Phase 1/, stages: [
        { id: "a_in", icon: "🗂", t: "20 notes + all section rules", s: "clinicians, GP and patient at once" },
        { id: "a_call", icon: "🤖", t: "One call", s: "plan and write six sections", claude: true, diff: true },
        { id: "a_stop", icon: "⏹", t: "stop_reason", s: "end_turn, or out of budget?" },
        { id: "a_check", icon: "🧮", t: "Section rules checked", s: "the same validators as Phase 2" },
        { id: "a_out", icon: "📄", t: "Discharge pack", s: "want: every section passes its rules", out: true } ] },
      { key: "p2", label: "Phase 2 · section passes, then reconcile", sub: "local first, global second", tone: "fix", on: /Phase 2/, stages: [
        { id: "b_route", icon: "✂️", t: "Route notes to sections", s: "observation notes go to none" },
        { id: "b_pass", icon: "🤖", t: "4 section passes", s: "meds JSON feeds the GP and patient passes", claude: /section/, diff: true },
        { id: "b_rec", icon: "🧮", t: "Reconcile in code", s: "rules, last order per drug, cross-section" },
        { id: "b_fix", icon: "🔧", t: "Repair a failing section", s: "one retry with its errors", claude: /repair/ },
        { id: "b_out", icon: "📄", t: "Discharge pack", s: "want: every section passes its rules", out: true } ] },
    ],
  },
  slide: {
    title: "Cut at checkable seams: section passes, then reconcile",
    code: `meds = run_pass("meds", notes_for("meds"), RULES.meds)   # KEY 1
clinical = run_pass("clinical", notes_for("clinical"))
gp = run_pass("gp", {"meds": meds, "plan": plan_note})      # KEY 2
patient = run_pass("patient", {"meds": meds}, RULES.patient)
pack = {**meds, **clinical, **gp, **patient}
for section, check in VALIDATORS.items():                    # KEY 3
    problems = check(pack, last_order_per_drug)
    if problems:                                             # KEY 4
        pack |= run_pass(section, inputs[section],
                         feedback=problems)        # one repair
assert all(check(pack) == [] for check in VALIDATORS.values())`,
    keys: [["1", "Local first", "Each pass sees only its own notes and rules."],
           ["2", "Narrow seams", "Later passes read structured JSON, not raw notes."],
           ["3", "Global second", "Code checks rules and facts across all sections."],
           ["4", "Repair one section", "A failing section is redone alone, with its errors."]],
  },
  async run(s, E) {
    s.log(`Meridian Health · ${HEAD} 20 notes: 8 clinical (admission, med rec, ward rounds, haematology, rash, discharge plan), 12 routine observations.`, "note");
    s.log("The medication story: metformin and ramipril withheld for AKI; amoxicillin stopped for a rash (penicillin allergy); warfarin switched to apixaban; ramipril restarted at 2.5 mg; metformin stays held for the GP.", "note");

    s.log("== Phase 1 · one giant prompt: the whole discharge pack, every section's rules, in one call", "note");
    s.show("a_in", "20 notes, 6 sections, 3 readers", "done");
    const one = await pass(s, E, {
      system: SYSTEM, schema: SCHEMA.whole, max_tokens: BUDGET,
      prompt: `${HEAD}\n<notes>\n${notesText(NOTES)}\n</notes>\nSection rules (Meridian discharge standard v4):\n- ${Object.values(RULE).join("\n- ")}\nWrite the complete discharge pack.`,
    });
    const stop1 = one.run.stop_reason;
    const probs1 = one.data ? GROUPS.flatMap((g) => validate(g, one.data).map((x) => `${g}: ${x}`)) : [`no usable pack (stop_reason ${stop1})`];
    const ok1 = one.data && probs1.length === 0;
    s.log(`Phase 1: stop_reason ${stop1} · ${one.data ? "pack returned" : "no usable JSON"} · ${probs1.length} problem${probs1.length === 1 ? "" : "s"}${probs1.length ? ": " + probs1.join("; ") : ""}`, "note");
    s.show("a_call", `1 call · ${one.run.stop_reason}`, "done");
    s.show("a_stop", stop1 === "max_tokens" ? "max_tokens: budget spent, no pack" : stop1, stop1 === "end_turn" ? "done" : "bad");
    s.show("a_check", one.data ? `${probs1.length} problem${probs1.length === 1 ? "" : "s"}` : "nothing to check", "done");
    s.show("a_out", ok1 ? "every section passes" : one.data ? E.short(probs1[0], 60) : "no pack to sign off", ok1 ? "good" : "bad");
    await s.pause({
      title: "Phase 1 finished: one call for the whole pack",
      outcome: !one.data ? `**stop_reason: ${stop1}.** The call spent its ${BUDGET.toLocaleString("en-US")}-token budget planning six sections for three readers and returned no usable pack.`
        : ok1 ? "This time the single call finished and every section passed. Nothing in the design made that likely, and nothing would show which section to redo if one failed."
        : `The pack came back, but **${probs1.length} rule${probs1.length === 1 ? "" : "s"} failed**: ${probs1.slice(0, 3).join("; ")}. The only way to fix one section is to rerun the whole call.`,
      next: "Phase 2: one pass per section group, then reconcile in code",
    });

    s.log("== Phase 2 · section passes (local), then a reconciliation step in code (global), one repair per failing section", "note");
    const skipped = NOTES.filter((n) => !Object.values(ROUTE).flat().includes(n.type));
    s.show("b_route", `${NOTES.length - skipped.length} notes routed · ${skipped.length} obs notes skipped`, "done");
    const runGroup = async (g, feedback, prev) => {
      const input = g === "meds" || g === "clinical" ? `<notes>\n${notesText(routed(g))}\n</notes>`
        : g === "gp" ? `<medications_json>\n${JSON.stringify(out.meds)}\n</medications_json>\n<pending_results>${JSON.stringify(out.clinical?.pending_results || [])}</pending_results>\n<notes>\n${notesText(routed("gp"))}\n</notes>`
        : `<medications_json>\n${JSON.stringify(out.meds?.medications || [])}\n</medications_json>\n<follow_up>Blood test at the GP in 1 week. Breathing clinic in 6 weeks with a chest X-ray. The hospital will phone the GP if the blood culture grows anything.</follow_up>`;
      const r = await pass(s, E, {
        label: feedback ? `(repair: ${NAMES[g]})` : `(section: ${NAMES[g]})`, system: SYSTEM, schema: SCHEMA[g], max_tokens: BUDGET,
        prompt: `${HEAD}\n${input}\nRule: ${RULE[g]}\n` + (feedback ? `Your previous version:\n${JSON.stringify(prev)}\nIt failed these checks:\n- ${feedback.join("\n- ")}\nWrite this section again so it passes.` : "Write only this section."),
      });
      return r;
    };
    const out = {}, stops = {}, repaired = [];
    for (const g of GROUPS) {
      s.show("b_pass", `${GROUPS.indexOf(g) + 1}/4 · ${NAMES[g]}`, "hot");
      const r = await runGroup(g);
      out[g] = r.data; stops[g] = r.run.stop_reason;
    }
    s.show("b_pass", `4 passes · ${Object.values(stops).join(", ")}`, "done");
    let problems = Object.fromEntries(GROUPS.map((g) => [g, validate(g, out[g])]));
    const first = Object.values(problems).flat().length;
    s.log(`Reconcile (code): ${first ? Object.entries(problems).filter(([, v]) => v.length).map(([g, v]) => `${NAMES[g]}: ${v.join("; ")}`).join(" | ") : "every section passes its rules; medications match the last order for each drug"}`, "note");
    s.show("b_rec", first ? `${first} problem${first === 1 ? "" : "s"} in ${Object.values(problems).filter((v) => v.length).length} section(s)` : "0 problems", "done");
    for (const g of GROUPS) {
      if (!problems[g].length) continue;
      repaired.push(g);
      s.show("b_fix", `repairing: ${NAMES[g]}`, "hot");
      const r = await runGroup(g, problems[g], out[g]);
      if (r.data) out[g] = r.data;
      problems[g] = validate(g, out[g]);
      s.log(`Repair ${NAMES[g]}: ${problems[g].length ? problems[g].join("; ") : "now passes"}`, "note");
    }
    const left = Object.values(problems).flat();
    s.show("b_fix", repaired.length ? `repaired: ${repaired.map((g) => NAMES[g]).join(", ")}` : "nothing to repair", "done");
    s.show("b_out", left.length ? E.short(left[0], 60) : "every section passes · ready for sign-off", left.length ? "bad" : "good");

    const pack = { ...out.meds, ...out.clinical, ...out.gp, ...out.patient };
    const medLine = (m) => `- ${m.drug} ${m.dose} ${m.frequency} (${m.status})${m.status !== "unchanged" ? `: ${m.reason}` : ""}`;
    const final = `Discharge pack for ${PATIENT.name} (MRN ${PATIENT.mrn}), ready for clinician sign-off\n\nDiagnoses: ${(pack.diagnoses || []).join("; ")}\n\nMedications\n${(pack.medications || []).map(medLine).join("\n")}\n\nAllergies: ${(pack.allergies || []).map((a) => `${a.substance} (${a.reaction})`).join("; ")}\nPending: ${(pack.pending_results || []).join("; ")}\n\nGP actions\n${(pack.gp_actions || []).map((x) => `- ${x}`).join("\n")}\n\nFor the patient (${words(pack.patient_instructions)} words)\n${pack.patient_instructions || ""}`;
    const medsRight = validate("meds", out.meds).length === 0;
    return {
      final,
      compare: {
        cols: [
          { title: "Phase 1: one giant prompt", short: "One call", tone: "trap",
            verdict: !one.data ? `**stop_reason ${stop1}**: the whole ${BUDGET.toLocaleString("en-US")}-token budget went on one call, and there is no pack to sign off.`
              : ok1 ? "Finished and passed this time, as one block: a failure would mean rerunning everything." : `Finished, with ${probs1.length} rule failure${probs1.length === 1 ? "" : "s"} (${E.short(probs1[0], 90)}), and no way to redo one section alone.` },
          { title: "Phase 2: section passes, then reconcile", short: "Sections + reconcile", tone: "fix",
            verdict: `4 passes, all ${Object.values(stops).every((x) => x === "end_turn") ? "end_turn" : Object.values(stops).join("/")}; reconciliation found ${first} problem${first === 1 ? "" : "s"}${repaired.length ? `, repaired ${repaired.map((g) => NAMES[g]).join(", ")} once` : ""}; ${left.length ? `${left.length} left` : "the pack passes every rule"}.` },
        ],
        rows: [
          ["Claude calls", "1", String(GROUPS.length + repaired.length)],
          ["stop_reason", { v: stop1, tone: stop1 === "end_turn" ? "" : "bad" }, { v: [...new Set(Object.values(stops))].join(", "), tone: Object.values(stops).every((x) => x === "end_turn") ? "good" : "bad" }],
          ["What each call reads", "all 20 notes and every rule", "only its notes (or the meds JSON) and its own rule"],
          ["Medications vs the last order (7 drugs)", one.data ? (validate("meds", one.data).length ? { v: `${validate("meds", one.data).length} wrong`, tone: "bad" } : "all right") : { v: "no list", tone: "bad" }, { v: medsRight ? "all 7 right" : `${validate("meds", out.meds).length} wrong`, tone: medsRight ? "good" : "bad" }],
          ["Rule problems found by the validators", { v: one.data ? String(probs1.length) : "pack missing", tone: ok1 ? "good" : "bad" }, { v: `${first} found, ${left.length} left`, tone: left.length ? "bad" : "good" }],
          ["A failing section can be redone alone", { v: "no", tone: "bad" }, { v: "yes", tone: "good" }],
        ],
        note: "Same notes, same rules, same per-call budget. Decomposition gives each call less to plan and less to read, and every seam (the meds JSON) is a place code can check. The reconciliation step is where cross-section facts are enforced.",
      },
      checks: [
        E.check("Phase 1: the single call did not deliver a pack that passes every section rule", !ok1),
        E.check("Phase 2: every section group ended with valid JSON, at most one of them needing its single repair", GROUPS.every((g) => out[g]) && repaired.length <= 1),
        E.check("Phase 2: the medication list matches the last order for all 7 drugs, and the penicillin allergy is recorded", medsRight),
        E.check("Phase 2: after reconciliation (at most one repair per section), every section passes its rules", left.length === 0),
      ],
    };
  },
};
