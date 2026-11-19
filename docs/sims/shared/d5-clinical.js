// Simulator 3 · Meridian Clinical Notes: synthetic visit notes for Labs 28 (task 5.3) and 29 (task 5.4).
// Every name, MRN, date of birth, address, phone number and identifier here is invented. The reviewer
// (Lab 28) and the log store (Lab 29) are simulated in plain JS; Claude is real.

// ---------- Lab 28: four drafts, routed by risk ----------
// dest.external: the document leaves the hospital (cannot be recalled). Internal notes stay in the EHR,
// where a clinician can amend them.
export const NOTES = [
  { patient: "Patient A", mrn: "00-4417", doc: "ED discharge note", dest: { name: "Meridian EHR chart", external: false },
    note: "ED visit 17 Nov 2026. 3 cm laceration, left forearm, from a kitchen knife. Cleaned, 5 sutures. Tetanus booster given in 2024. Paracetamol 1 g up to four times a day as needed. Suture removal at the practice nurse in 10 days. Return if redness, swelling or fever." },
  { patient: "Patient B", mrn: "00-4421", doc: "Discharge letter to GP", dest: { name: "GP, Elm Street Practice", external: true },
    note: "Admitted 15 Nov 2026 with acute appendicitis. Laparoscopic appendicectomy 15 Nov, uncomplicated. Discharged 17 Nov. Paracetamol 1 g four times a day and ibuprofen 400 mg three times a day with food, for 5 days. GP wound check on day 7. Histology to follow; no action needed by the GP unless we write again." },
  { patient: "Patient C", mrn: "00-4430", doc: "Discharge letter to GP", dest: { name: "GP, Harbour View Clinic", external: true },
    note: "Atrial fibrillation on warfarin. Admitted 14 Nov 2026 with INR 3.8 after a course of clarithromycin. Medication list on admission: warfarin 5 mg daily. Ward round 16 Nov: hold warfarin tonight, restart at 3 mg daily from 18 Nov, recheck INR on 20 Nov. Nursing discharge note 17 Nov: patient says she was told to go back to her usual 5 mg." },
  { patient: "Patient D", mrn: "00-4436", doc: "Referral to cardiology clinic", dest: { name: "Riverside Cardiology (external)", external: true },
    note: "Central chest pain at rest, 2 h, settled. ECG normal. Troponin negative at 0 and 3 h. Refer to cardiology outpatients for an exercise stress test within 2 weeks. Echocardiogram done 17 Nov; report pending." },
];

export const HIGH_ALERT = ["warfarin", "insulin", "heparin", "enoxaparin", "methotrexate", "oxycodone", "morphine", "fentanyl", "digoxin"];

// Deterministic source checks: what code can see in the notes without asking a model.
export function sourceSignals(n) {
  const text = n.note.toLowerCase();
  const out = [];
  for (const drug of HIGH_ALERT) {
    if (!text.includes(drug)) continue;
    const doses = [...new Set([...text.matchAll(new RegExp(`(\\d+(?:\\.\\d+)?)\\s*mg`, "g"))].map((m) => m[1] + " mg"))];
    out.push({ kind: "high_alert", why: `high-alert medication: ${drug}` });
    if (/hold|restart|reduce|increase|stop/.test(text) && doses.length > 1) out.push({ kind: "conflict", why: `${drug} dose differs in the note: ${doses.join(" vs ")}` });
  }
  if (/pending|to follow/.test(text) && /report pending|result pending/.test(text)) out.push({ kind: "pending", why: "a result is still pending" });
  return out;
}

// Reviewer time model (illustrative): Meridian drafts 600 documents a day; three clinicians each give
// 3 hours to sign-off. A careful review of a letter with a medication change takes about 4 minutes.
export const CAPACITY = { perDay: 600, minutesAvailable: 3 * 180, fullReview: 4, coSign: 0.5, audit: 2, sampleRate: 0.1,
  // last month's routing mix under risk routing (simulated): share flagged / external unflagged / internal unflagged
  mix: { flagged: 0.12, external: 0.48, internal: 0.40 } };
export function uniformLoad() {
  const per = (CAPACITY.minutesAvailable * 60) / CAPACITY.perDay;    // seconds a reviewer can give each draft
  return { secondsEach: Math.round(per), needed: CAPACITY.perDay * CAPACITY.fullReview, load: (CAPACITY.perDay * CAPACITY.fullReview) / CAPACITY.minutesAvailable };
}
export function routedLoad() {
  const m = CAPACITY.mix, v = CAPACITY.perDay;
  const needed = v * (m.flagged * CAPACITY.fullReview + m.external * CAPACITY.coSign + m.internal * CAPACITY.sampleRate * CAPACITY.audit);
  return { needed: Math.round(needed), load: needed / CAPACITY.minutesAvailable };
}

// ---------- Lab 29: one full record, one referral letter ----------
export const RECORD = {
  name: "Eleanor Whitcombe", mrn: "00-4452", dob: "1958-03-14", sex: "female",
  address: "22 Harrow Street, Meridian Falls, OR 97000", phone: "(555) 014-2290", email: "e.whitcombe@example.net",
  ssn: "000-12-3456", insurance_id: "MHP-88-301442", next_of_kin: "Thomas Whitcombe (son), (555) 014-2291",
  occupation: "school librarian", lives: "alone",
  problems: ["Type 2 diabetes (diagnosed 2015)", "Hypertension", "Obesity, BMI 33"],
  history_sensitive: ["Termination of pregnancy, 1984", "HIV test negative, 2019", "Psychiatric admission for depression, 1996"],
  medications: ["Metformin 1 g twice daily", "Gliclazide 80 mg twice daily", "Ramipril 5 mg daily"],
  results: { hba1c: "9.1% (17 Nov 2026), up from 7.8% (May 2026)", egfr: "52 mL/min/1.73m2", bp: "138/84", retinal_screen: "no retinopathy (Aug 2026)" },
  visit: "17 Nov 2026, diabetes review with Dr K. Osei: HbA1c rising despite adherence to metformin and gliclazide. Patient keen to avoid insulin if possible.",
};
export const REFERRAL = { to: "Meridian Endocrinology Clinic", from: "Dr K. Osei, Meridian Primary Care", user: "dr.k.osei", purpose: "endocrinology referral: treatment intensification for type 2 diabetes" };

// The minimum-necessary set for this purpose, written down as code (an allow-list, not a block-list).
export const NEEDED = ["sex", "age", "problems", "medications", "results", "visit"];
export function minimise(r) {
  const age = 2026 - Number(r.dob.slice(0, 4)) - (r.dob.slice(5) > "11-19" ? 1 : 0);
  const sent = { patient: "[PATIENT]", mrn: "[MRN]", sex: r.sex, age, problems: r.problems, medications: r.medications, results: r.results,
    visit: r.visit.replace(r.name, "[PATIENT]") };
  const withheld = Object.keys(r).filter((k) => !["name", "mrn", ...NEEDED].includes(k));
  return { sent, withheld, tokens: { "[PATIENT]": r.name, "[MRN]": r.mrn } };
}
export const reidentify = (text, tokens) => Object.entries(tokens).reduce((t, [k, v]) => t.split(k).join(v), text);

// What counts as PHI that this referral must not send: direct identifiers, plus history it does not need.
export const IDENTIFIERS = [
  ["name", /Eleanor|Whitcombe/], ["MRN", /00-4452/], ["date of birth", /1958-03-14/], ["address", /Harrow Street|97000/],
  ["phone", /\(555\)\s?014/], ["email", /whitcombe@example/], ["SSN", /000-12-3456/], ["insurance id", /MHP-88-301442/], ["next of kin", /Thomas Whitcombe/],
];
export const UNNEEDED = [["termination of pregnancy", /[Tt]ermination of pregnancy/], ["HIV test", /HIV/], ["psychiatric admission", /[Pp]sychiatric/]];
export const scan = (text, list) => list.filter(([, re]) => re.test(text)).map(([k]) => k);

// A small, stable content hash for the log (not cryptographic; it shows the log stores a fingerprint, not text).
export function fingerprint(text) {
  let h = 5381; for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) >>> 0;
  return "h" + h.toString(16).padStart(8, "0");
}
