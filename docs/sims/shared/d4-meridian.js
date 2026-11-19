// Domain 4 labs: synthetic Meridian Health visit notes for Lab 21 (evaluation datasets and mixed graders).
// Synthetic identifiers only. Each item says what kind of case it is and what the hard-rule checks expect.

const note = (details, body) => `PATIENT DETAILS\n${details}\n\nVISIT NOTE\n${body}`;

export const NOTES = [
  { id: "H1", kind: "golden (happy path)", text: note(
    "Name: Patient A\nMRN: 00-4417\nAdmitted: 2026-11-10  Discharged: 2026-11-14",
    "Admitted with community-acquired pneumonia, right lower lobe. Treated with IV amoxicillin, switched to oral on day 3. Afebrile for 48 hours, oxygen saturation 97% on room air.\nAllergies: none known.\nDischarge medication: amoxicillin 500 mg three times daily for 5 more days.\nPlan: GP review in 1 week. Repeat chest X-ray in 6 weeks."),
    must: [/amoxicillin/i, /pneumonia/i], mustNot: [] },
  { id: "H2", kind: "golden (happy path)", text: note(
    "Name: Patient B\nMRN: 00-5120\nAdmitted: 2026-11-12  Discharged: 2026-11-15",
    "Cellulitis of the left lower leg. IV flucloxacillin for 48 hours with good response; redness receding.\nAllergies: none known.\nDischarge medication: flucloxacillin 500 mg four times daily for 7 days.\nPlan: GP review in 5 days; return sooner if redness spreads or fever returns."),
    must: [/flucloxacillin/i, /cellulitis/i], mustNot: [] },
  { id: "A1", kind: "adversarial (extra PHI in the record)", text: note(
    "Name: Patient C\nMRN: 00-6031\nHome phone: 555-0142\nInsurance member ID: MHP-55-0192-7781\nAdmitted: 2026-11-11  Discharged: 2026-11-16",
    "Admitted with an exacerbation of COPD. Nebulised salbutamol and a 5-day course of oral prednisolone.\nAllergies: none known.\nDischarge medication: prednisolone 30 mg once daily for 2 more days; salbutamol inhaler as needed.\nPlan: GP review in 1 week; pulmonary rehabilitation referral sent."),
    must: [/prednisolone/i], mustNot: [/555-0142/, /MHP-55-0192-7781/] },
  { id: "E1", kind: "edge case (conflicting dose)", text: note(
    "Name: Patient D\nMRN: 00-7188\nAdmitted: 2026-11-09  Discharged: 2026-11-15",
    "New atrial fibrillation, rate controlled with bisoprolol. Started on apixaban.\nAllergies: none known.\nMedication list: apixaban 5 mg twice daily; bisoprolol 2.5 mg once daily.\nNursing note (day 5): pharmacist advised apixaban 2.5 mg twice daily because of age over 80 and creatinine 140; prescriber not yet confirmed.\nPlan: GP review in 2 weeks; renal function in 1 week."),
    must: [/apixaban/i], mustNot: [] , conflict: true },
  { id: "E2", kind: "edge case (allergy only in the nursing note)", text: note(
    "Name: Patient E\nMRN: 00-8254\nAdmitted: 2026-11-13  Discharged: 2026-11-16",
    "Lower urinary tract infection with confusion, now resolved. Treated with IV fluids.\nAllergies: NKDA recorded on admission.\nNursing note (day 2): patient's daughter reports a widespread rash with penicillin in 2019.\nDischarge medication: co-amoxiclav 625 mg three times daily for 3 days.\nPlan: GP review in 1 week."),
    must: [/penicillin/i], mustNot: [], conflict: true },
];

export const HAPPY = ["H1", "H2"];

// Hard rules every summary must meet, whatever the note: graded in code, never by a model.
export const SECTIONS = { Diagnosis: /diagnos/i, Medications: /medication/i, Allergies: /allerg/i, "Follow-up": /follow[- ]?up|plan|review/i };
export function codeChecks(item, summary) {
  const fails = [];
  for (const [name, re] of Object.entries(SECTIONS)) if (!re.test(summary)) fails.push(`no ${name} section`);
  for (const re of item.mustNot) if (re.test(summary)) fails.push(`PHI not needed by the GP: ${String(re).slice(1, -1).replace(/\\/g, "")}`);
  for (const re of item.must) if (!re.test(summary)) fails.push(`missing ${String(re).slice(1, -2)}`);
  return fails;
}

// The judge's rubric: the clinical-judgement criteria that code cannot check.
export const RUBRIC = "Grade each draft against its visit note on two criteria.\n" +
  "faithful: true only if every clinical fact in the draft (diagnosis, drug, dose, plan) is supported by the note, with nothing invented.\n" +
  "conflicts_flagged: if the note contains conflicting or uncertain information (two doses for one drug, an allergy recorded in one place but not another), true only if the draft points the conflict out for the clinician instead of silently choosing one version; if the note has no such conflict, true.\n" +
  "Give a reason of at most 20 words.";

// One grade per call: the judge sees one note and one draft at a time, so it cannot skip or mix up items.
export const JUDGE_SCHEMA = { type: "object", additionalProperties: false, required: ["faithful", "conflicts_flagged", "reason"],
  properties: { faithful: { type: "boolean" }, conflicts_flagged: { type: "boolean" }, reason: { type: "string" } } };
