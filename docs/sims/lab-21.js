// Lab 21 · Task 4.2 · Simulator 3 (Meridian Clinical Notes): a happy-path eval set read by eye vs a mixed set
// graded by code checks plus an LLM-as-judge rubric. The prompt under test (discharge drafter v2) has two flaws:
// it copies the whole PATIENT DETAILS block (extra PHI a GP does not need) and has no Allergies section.
// Phase 1 tests it on two typical notes and a quick read: it passes. Phase 2 tests the SAME prompt on a mixed set
// (the same two notes + one adversarial + two edge cases) with hard rules in code and clinical judgement by rubric.
import { ask, fits } from "./shared/d4-kit.js";
import { NOTES, HAPPY, codeChecks, RUBRIC, JUDGE_SCHEMA } from "./shared/d4-meridian.js";

// The prompt under test: a tidy one-template format. Its flaws are what it copies and what it leaves out.
const DRAFTER_V2 = "You draft discharge summaries that Meridian Health clinicians send to the patient's GP. " +
  "Fill in exactly this template and output nothing else:\n" +
  "PATIENT DETAILS\n<the PATIENT DETAILS block, copied exactly>\n" +
  "Diagnosis: <one sentence>\n" +
  "Medications: <the medication list from the note, as written>\n" +
  "Follow-up: <the plan, one sentence>\n" +
  "Keep every line short. Do not add other sections, comments or warnings: clinicians review the draft before it is sent.";

const EYE_SCHEMA = { type: "object", additionalProperties: false, required: ["reviews"], properties: {
  reviews: { type: "array", items: { type: "object", additionalProperties: false, required: ["id", "looks_fine"], properties: { id: { type: "string" }, looks_fine: { type: "boolean" } } } } } };

async function draft(s, E, item) {
  const r = await ask(s, E, { label: `Drafter v2 · ${item.id}`, system: DRAFTER_V2, prompt: item.text, max_tokens: 1500, quiet: true });
  s.log(`      ${item.id} draft: ${E.short(r.text, 420)}`, "reply");
  return r.text;
}

export default {
  id: 21,
  see: "Phase 1: the two happy-path drafts follow the template and pass the quick review, so drafter v2 would ship. Phase 2: the same prompt on the mixed set fails hard rules in code: the drafts have no Allergies section, and A1 copies the home phone and insurance member ID that a GP does not need. The rubric judge grades each draft for faithfulness and for flagging the apixaban dose and penicillin allergy conflicts. The gate blocks v2.",
  try: "Fix DRAFTER_V2 in this lab's code: copy only the name and MRN, add an Allergies section that checks the nursing notes, and tell it to flag conflicting doses for the clinician. Run again: phase 1 still passes (it always did), and phase 2 now shows which rows turned green and which still need work.",
  explain: "A set of typical notes read by eye only proves the prompt works on easy cases. A mixed dataset adds what breaks systems in production: an adversarial note with extra PHI, edge cases where the allergy or the dose conflicts, alongside golden happy-path items. Then each property gets the right grader. Hard rules (required sections, no unnecessary identifiers, a known allergy present) are checked in code: exact, cheap and repeatable. Clinical judgement (is every fact supported, is a conflict flagged) goes to an LLM judge with a written rubric and a JSON schema, which Meridian would calibrate against clinician labels before trusting it. The prompt under test is the same in both phases; only the dataset and graders changed.",
  scene: {
    title: "Discharge drafter v2: does it pass the tests you chose?",
    caption: "Both phases test the same prompt (drafter v2). Only the evaluation set and the graders change.",
    lanes: [
      { key: "p1", label: "Phase 1 · happy path, by eye", sub: "two typical notes and a quick read", tone: "trap", on: /Phase 1/, stages: [
        { id: "a_set", icon: "📋", t: "Happy-path set", s: "H1 pneumonia, H2 cellulitis", diff: true },
        { id: "a_bot", icon: "🤖", t: "Discharge drafter v2", s: "the prompt under test", claude: true },
        { id: "a_eye", icon: "👀", t: "Read by eye", s: "does it look like a fine summary?" },
        { id: "a_out", icon: "🚦", t: "Release decision", s: "want: catch the flaws before the GP sees them", out: true } ] },
      { key: "p2", label: "Phase 2 · mixed set, mixed graders", sub: "golden + adversarial + edge, code + judge", tone: "fix", on: /Phase 2/, stages: [
        { id: "b_set", icon: "📋", t: "Mixed set", s: "H1, H2 + A1 extra PHI, E1 dose, E2 allergy", diff: true },
        { id: "b_bot", icon: "🤖", t: "Discharge drafter v2", s: "the same prompt", claude: true },
        { id: "b_code", icon: "🧪", t: "Hard rules in code", s: "sections, no extra PHI, known allergy" },
        { id: "b_judge", icon: "⚖️", t: "LLM judge + rubric", s: "faithful? conflict flagged? (JSON)" },
        { id: "b_out", icon: "🚦", t: "Release gate", s: "want: catch the flaws before the GP sees them", out: true } ] },
    ],
  },
  slide: {
    title: "A mixed eval set, each property graded the right way",
    code: `EVAL_SET = golden(H1, H2)                       # KEY 1
         + adversarial(A1_extra_phi)
         + edge(E1_dose_conflict, E2_hidden_allergy)
def hard_rules(note, draft):                    # KEY 2
    return [has_sections(draft, REQUIRED),
            not contains(draft, note.phone, note.member_id),
            all(a in draft for a in note.allergies)]
judge = claude(RUBRIC, schema=GRADES)           # KEY 3
for item in EVAL_SET:
    d = drafter(item.note)
    ok = all(hard_rules(item, d)) and judge(item, d).passes
release = all(ok for each item)                 # KEY 4
# calibrate the judge on clinician-labelled drafts first`,
    keys: [["1", "Golden, adversarial, edge", "Typical notes plus the cases that break systems."],
           ["2", "Hard rules in code", "Sections, PHI, allergies: exact and repeatable."],
           ["3", "Judgement by rubric", "LLM judge with written criteria and a JSON schema."],
           ["4", "Every item must pass", "One failing case blocks the prompt change."]],
  },
  async run(s, E) {
    const byId = Object.fromEntries(NOTES.map((n) => [n.id, n]));
    s.log("Meridian Clinical Notes · prompt change under test: discharge drafter v2 (synthetic patients only)", "note");

    // Phase 1: the happy-path set, read by eye (a quick yes/no review stands in for the reviewer's glance).
    s.log("== Phase 1 · happy-path set (2 typical notes), each draft read by eye", "note");
    s.show("a_set", "H1, H2 (typical notes)", "done");
    const drafts = {};
    for (const id of HAPPY) drafts[id] = await draft(s, E, byId[id]);
    s.show("a_bot", "2 drafts written", "done");
    const eye = await ask(s, E, { label: "Quick review", max_tokens: 1500,
      system: "You are a busy ward doctor giving draft discharge summaries a quick look before they go to the GP: is each one readable, on the template and free of obvious errors? Say whether it looks fine to send.",
      prompt: HAPPY.map((id) => `${id}\n${drafts[id]}`).join("\n\n"),
      output_config: { format: { type: "json_schema", schema: EYE_SCHEMA } } });
    const looks = Object.fromEntries((eye.json?.reviews || []).map((r) => [r.id, r.looks_fine === true]));
    const passed1 = HAPPY.filter((id) => looks[id]).length;
    const ship1 = passed1 === HAPPY.length;
    s.show("a_eye", `${passed1} of ${HAPPY.length} look fine`, "done");
    s.show("a_out", ship1 ? "RELEASE: 2 of 2 passed" : `hold: ${passed1} of 2 passed`, ship1 ? "bad" : "good");
    s.log(`Phase 1 result: ${passed1} of ${HAPPY.length} happy-path drafts looked fine → ${ship1 ? "RELEASE drafter v2" : "hold"}`, "note");
    await s.pause({
      title: "Phase 1 finished: happy path, read by eye",
      outcome: `**${passed1} of ${HAPPY.length}** typical drafts looked fine, so this test says **${ship1 ? "release v2" : "hold"}**. Look at the drafts in the live output: is there an Allergies section? What would happen on a note with a home phone number, a conflicting dose or an allergy written only in the nursing note?`,
      next: "Phase 2: the same prompt on a mixed set, graded by code and a rubric judge",
    });

    // Phase 2: the same prompt; add adversarial and edge cases, grade hard rules in code and judgement by rubric.
    s.log("== Phase 2 · mixed set (golden + adversarial + edge cases), hard rules in code, judgement by an LLM judge with a rubric", "note");
    s.show("b_set", NOTES.map((n) => n.id).join(", "), "done");
    for (const n of NOTES.filter((x) => !HAPPY.includes(x.id))) { s.log(`${n.id} · ${n.kind}`, "note"); drafts[n.id] = await draft(s, E, n); }
    s.log("H1 and H2 reuse the drafts from phase 1: same prompt, same output, now graded properly.", "note");
    s.show("b_bot", `${NOTES.length} drafts (3 new)`, "done");

    const code = Object.fromEntries(NOTES.map((n) => [n.id, codeChecks(n, drafts[n.id])]));
    for (const n of NOTES) s.log(`  code ${n.id}: ${code[n.id].length ? "FAIL " + code[n.id].join("; ") : "pass"}`, code[n.id].length ? "error" : "result");
    const codeFails = NOTES.filter((n) => code[n.id].length).length;
    s.show("b_code", `${codeFails} of ${NOTES.length} items fail a hard rule`, "done");

    // The judge grades each item in its own call (run in parallel): one note, one draft, one schema-checked grade.
    const judged1 = await Promise.all(NOTES.map((n) => ask(s, E, { label: `Rubric judge · ${n.id}`, max_tokens: 1500, quiet: true,
      system: `You grade a draft discharge summary for Meridian Health against the visit note it came from.\n${RUBRIC}`,
      prompt: `VISIT NOTE:\n${n.text}\n\nDRAFT:\n${drafts[n.id]}`,
      output_config: { format: { type: "json_schema", schema: JUDGE_SCHEMA } } })));
    const grades = Object.fromEntries(NOTES.map((n, i) => [n.id, judged1[i].json && fits(judged1[i].json, JUDGE_SCHEMA) ? judged1[i].json : null]));
    for (const n of NOTES) { const g = grades[n.id]; s.log(`  judge ${n.id}: ${g ? `faithful ${g.faithful ? "yes" : "NO"} · conflict flagged ${g.conflicts_flagged ? "yes" : "NO"} · ${g.reason}` : "no grade"}`, g && g.faithful && g.conflicts_flagged ? "result" : "error"); }
    const judged = NOTES.filter((n) => grades[n.id] && typeof grades[n.id].faithful === "boolean").length;
    const judgeFails = NOTES.filter((n) => !grades[n.id] || !grades[n.id].faithful || !grades[n.id].conflicts_flagged).length;
    s.show("b_judge", `${judged} graded · ${judgeFails} fail the rubric`, "done");

    const itemPass = (id) => !code[id].length && grades[id] && grades[id].faithful && grades[id].conflicts_flagged;
    const passing = NOTES.filter((n) => itemPass(n.id)).map((n) => n.id);
    const blocked = passing.length < NOTES.length;
    s.show("b_out", blocked ? `BLOCKED: ${NOTES.length - passing.length} of ${NOTES.length} items fail` : "release: every item passed", blocked ? "good" : "bad");
    s.log(blocked ? `Gate: BLOCK drafter v2. Passing items: ${passing.join(", ") || "none"}.` : "Gate: every item passed this time.", "note");

    const phiCaught = code.A1.some((f) => /PHI/.test(f));
    const allergyMissing = NOTES.filter((n) => code[n.id].includes("no Allergies section")).map((n) => n.id);
    const cell = (id) => (itemPass(id) ? { v: "pass", tone: "good" } : { v: [...code[id], ...(grades[id] && !grades[id].conflicts_flagged ? ["conflict not flagged"] : []), ...(grades[id] && !grades[id].faithful ? ["not faithful"] : [])].join("; ") || "fail", tone: "bad" });
    return {
      final: `Drafter v2 evaluation. Happy-path by eye: ${passed1} of ${HAPPY.length} passed. Mixed set: ${passing.length} of ${NOTES.length} items passed (code rule failures on ${codeFails}, rubric failures on ${judgeFails}). Decision: ${blocked ? "block the prompt change" : "release"}.`,
      compare: {
        cols: [
          { title: "Phase 1: happy-path set, read by eye", short: "Happy path", tone: "trap",
            verdict: ship1 ? `**${passed1} of ${HAPPY.length} passed**: release. Two typical notes cannot show a PHI leak, a hidden allergy or a dose conflict.` : `${passed1} of ${HAPPY.length} passed this time; a glance still checks no rule.` },
          { title: "Phase 2: mixed set, code checks + rubric judge", short: "Mixed set", tone: "fix",
            verdict: blocked ? `**Blocked**: ${NOTES.length - passing.length} of ${NOTES.length} items fail, each with a named reason a developer can fix.` : "Every item passed this time." },
        ],
        rows: [
          ["Items tested", "H1, H2", NOTES.map((n) => n.id).join(", ")],
          ["Graders", "a glance", "code (hard rules) + LLM judge (rubric, JSON)"],
          ...NOTES.map((n) => [`${n.id} · ${n.kind}`, HAPPY.includes(n.id) ? { v: looks[n.id] ? "looks fine" : "flagged", tone: looks[n.id] ? "bad" : "good" } : "not tested", cell(n.id)]),
          ["Release decision", { v: ship1 ? "release" : "hold", tone: ship1 ? "bad" : "good" }, { v: blocked ? "blocked" : "release", tone: blocked ? "good" : "bad" }],
        ],
        note: "The prompt under test never changed. H1 and H2 are the same drafts in both phases: the missing Allergies section was there all along, but nothing in phase 1 checked for it.",
      },
      checks: [
        E.check("Phase 1: both happy-path drafts passed the review by eye", ship1),
        E.check("Phase 2: a code check caught the home phone or insurance member ID copied into A1", phiCaught),
        E.check("Phase 2: code found no Allergies section, including on a happy-path draft phase 1 passed", allergyMissing.some((id) => HAPPY.includes(id))),
        E.check("Phase 2: the rubric judge returned a schema-valid grade for all 5 items", judged === NOTES.length),
        E.check("Phase 2: the gate blocked drafter v2 (at least one adversarial or edge item failed)", NOTES.filter((n) => !HAPPY.includes(n.id) && !itemPass(n.id)).length >= 1),
      ],
    };
  },
};
