// Domain 2 · Meridian Clinical Notes: one synthetic patient record (Patient A, MRN 00-4417), 17 years long.
// Synthetic data only: no real patient. Lab 10 uses it to compare stuffing the whole record into the
// context with selecting the sections a cardiology referral needs (HIPAA minimum necessary).

export const PATIENT = { name: "Patient A", mrn: "00-4417", dob: "1968-03-14", sex: "male", gp: "Dr R. Osei, Meridian Northside Clinic" };

// The sections a cardiology referral needs, and two that it must not carry.
export const NEEDED = ["PROB", "MEDS", "ALLERGY", "V-2026-11-12", "L-2026-11-13"];
export const HELPFUL = ["FHX", "SOC", "V-2026-08-20", "L-2026-08-18", "V-2025-11-04"];
export const SENSITIVE = ["V-2009-05-11", "V-2014-09-02"];   // a psychiatry episode and a sexual-health visit: irrelevant here

const fixed = [
  { id: "PROB", date: "2026-11-12", type: "Summary", title: "Active problem list",
    text: "1. Essential hypertension, diagnosed 2019. 2. Type 2 diabetes mellitus, diagnosed 2021, on metformin. 3. Hyperlipidaemia, on atorvastatin since 2021. 4. Exertional chest tightness, new November 2026, under investigation. 5. Mild osteoarthritis of the right knee (inactive). 6. Atopic eczema (inactive since 2015)." },
  { id: "MEDS", date: "2026-11-12", type: "Summary", title: "Current medications",
    text: "Amlodipine 10 mg once daily (since 2019). Metformin 1 g twice daily (since 2021). Atorvastatin 40 mg at night (since 2021). Aspirin 75 mg once daily (started 2026-11-12). Glyceryl trinitrate spray 400 micrograms as needed for chest pain (started 2026-11-12). No over-the-counter or herbal medicines reported." },
  { id: "ALLERGY", date: "2026-11-12", type: "Summary", title: "Allergies and intolerances",
    text: "Penicillin: widespread urticarial rash, 2008 (allergy). Ramipril (ACE inhibitor): persistent dry cough, 2019 (intolerance, switched to amlodipine)." },
  { id: "FHX", date: "2024-02-10", type: "Summary", title: "Family history",
    text: "Father: myocardial infarction at age 54, died at 61. Mother: type 2 diabetes, alive at 84. Brother: hypertension." },
  { id: "SOC", date: "2026-08-20", type: "Summary", title: "Social history",
    text: "Ex-smoker: quit 2020, about 25 pack-years. Alcohol about 6 units a week. Works as a bus depot supervisor. Walks 20 minutes most days. Lives with his wife." },
  { id: "V-2026-11-12", date: "2026-11-12", type: "GP visit", title: "Chest tightness on exertion",
    text: "Three weeks of central chest tightness when walking uphill or climbing stairs, spreading to the left arm, relieved by rest within five minutes. No pain at rest, no syncope, no palpitations. BP 152/94, pulse 82 regular, BMI 31. Heart sounds normal, chest clear, no ankle oedema. 12-lead ECG in clinic: sinus rhythm, T-wave inversion in V4 to V6, no ST elevation. Impression: probable stable angina. Started aspirin 75 mg and GTN spray. Bloods sent including troponin. Plan: urgent referral to cardiology (rapid-access chest pain clinic) for assessment and an exercise test or CT coronary angiography. Advised to call emergency services if pain at rest or lasting more than 15 minutes." },
  { id: "L-2026-11-13", date: "2026-11-13", type: "Lab results", title: "Bloods after chest pain visit",
    text: "High-sensitivity troponin I below 5 ng/L (normal). Total cholesterol 5.9 mmol/L, LDL 3.9 mmol/L (above target on atorvastatin 40 mg), HDL 1.0 mmol/L. HbA1c 62 mmol/mol (7.8%). eGFR 74. Haemoglobin 141 g/L. TSH normal." },
  { id: "V-2026-08-20", date: "2026-08-20", type: "GP visit", title: "Annual diabetes and blood pressure review",
    text: "Feels well. No chest pain at that time. Home BP readings average 146/90. Foot check normal. Advised on diet and walking. Considered adding a second antihypertensive; patient preferred to try lifestyle change for three months." },
  { id: "L-2026-08-18", date: "2026-08-18", type: "Lab results", title: "Annual diabetes bloods",
    text: "HbA1c 60 mmol/mol (7.6%). Total cholesterol 5.7 mmol/L, LDL 3.7 mmol/L. eGFR 76. Urine albumin to creatinine ratio 2.1 mg/mmol." },
  { id: "V-2025-11-04", date: "2025-11-04", type: "GP visit", title: "Blood pressure review",
    text: "BP 148/92 on amlodipine 10 mg. Discussed adding a second agent; patient wished to reduce salt intake first. Repeat in 3 months." },
  { id: "V-2009-05-11", date: "2009-05-11", type: "Psychiatry", title: "Liaison psychiatry assessment",
    text: "Seen after redundancy and marital difficulties. Moderate depressive episode. Started sertraline 50 mg. Weekly counselling for 12 weeks. Recovered fully; sertraline stopped in 2010. No recurrence recorded." },
  { id: "V-2014-09-02", date: "2014-09-02", type: "Sexual health", title: "Sexual health clinic attendance",
    text: "Attended for routine screening after a new relationship. All screening tests negative. No treatment needed. Patient asked that this visit not be shared outside sexual health services unless clinically necessary." },
];

// Routine entries that a cardiology referral does not need: they make up most of a real record.
const ROUTINE = [
  ["Dermatology", "Eczema review", (y) => `Flare of atopic eczema on both forearms and the backs of the hands after a cold spell. Emollients advised three times a day, soap substitute, and a two-week course of a moderate-potency topical steroid. Patch testing not needed. Reviewed photographs from ${y - 1}; distribution unchanged. Patient uses gloves at work. Follow up if not settled in four weeks.`],
  ["Physiotherapy", "Right knee physiotherapy", (y) => `Session for right knee pain after a fall at the bus depot in ${y}. Quadriceps strengthening, straight-leg raises, step-ups and balance work. Pain 3 out of 10 on stairs, improving. Range of movement 0 to 125 degrees. Home exercise sheet given. Discharged after the next two sessions if progress continues. No red flags.`],
  ["Dental", "Dental check-up", (y) => `Routine examination and scale and polish. Two small fillings on the lower left molars. Gums healthy, mild calculus. Advised interdental brushes. Bitewing radiographs taken. Next check-up in 12 months. Patient asked about whitening; options and costs discussed. No anaesthetic issues recorded in ${y}.`],
  ["Ophthalmology", "Diabetic eye screening", (y) => `Retinal photographs of both eyes. No diabetic retinopathy. Visual acuity 6/6 right, 6/9 left, corrected with glasses. Mild early cataract in the left eye, not affecting daily life. Recall for screening in 12 months. Letter sent to the patient and the GP practice, ${y}.`],
  ["Podiatry", "Diabetic foot check", (y) => `Annual diabetic foot assessment. Pulses palpable in both feet. Monofilament sensation intact at all ten sites. Mild callus under the right first metatarsal head, debrided. Footwear advice given. Low risk category. Next review in 12 months (${y + 1}).`],
  ["Nursing", "Influenza vaccination", (y) => `Seasonal influenza vaccine given into the left deltoid, batch FLU-${y}-${(y * 7) % 900 + 100}. No previous reactions. Observed for 15 minutes, no reaction. Pneumococcal status checked. Patient also asked about travel vaccines for a family wedding; travel clinic details provided.`],
  ["Admin", "Appointment and contact update", (y) => `Patient phoned to update his mobile number and to rebook a missed appointment. New contact details verified against two identifiers. Repeat prescription request processed for regular medicines. Reminder letter for annual review sent. Patient prefers text message reminders, consent recorded ${y}.`],
  ["GP visit", "Upper respiratory tract infection", (y) => `Three days of sore throat, runny nose and cough. Temperature 37.6. Throat mildly red, no exudate, chest clear. Viral illness likely. Fluids, rest and simple analgesia advised. No antibiotics (penicillin allergy noted). Safety-netting advice given. Fit to return to work after the weekend, ${y}.`],
  ["Orthopaedics", "Wrist fracture follow-up", (y) => `Follow-up of a left distal radius fracture after a slip on ice. Cast removed. X-ray shows good healing and alignment. Grip strength reduced. Referred to hand therapy for six sessions. Return to driving discussed. Discharged from fracture clinic, ${y}.`],
  ["Occupational health", "Fitness to work review", (y) => `Workplace assessment for the bus depot supervisor role. Night shifts reviewed. Hearing test normal. Display screen equipment assessment completed. Advised regular breaks and stretching. No restrictions recommended for ${y}.`],
];

function routineEntries() {
  const out = [];
  let k = 0;
  for (let y = 2009; y <= 2026; y++) {
    for (let j = 0; j < 4; j++) {
      const [type, title, fn] = ROUTINE[(k * 3 + j) % ROUTINE.length];
      const month = String(((k * 5 + j * 3) % 12) + 1).padStart(2, "0");
      const day = String(((k * 7 + j * 11) % 27) + 1).padStart(2, "0");
      const date = `${y}-${month}-${day}`;
      if (y === 2026 && month >= "08") continue;
      out.push({ id: `N${String(k + 1).padStart(2, "0")}`, date, type, title, text: fn(y) });
      k++;
    }
  }
  return out;
}

export const RECORD = [...fixed, ...routineEntries()].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.id < b.id ? -1 : 1));
export const byId = Object.fromEntries(RECORD.map((r) => [r.id, r]));

const fmt = (r) => `<section id="${r.id}" date="${r.date}" type="${r.type}">\n${r.title}\n${r.text}\n</section>`;
export const header = `Patient record · ${PATIENT.name} · MRN ${PATIENT.mrn} · DOB ${PATIENT.dob} · ${PATIENT.sex} · registered GP ${PATIENT.gp}`;
// The whole record, oldest first: what the stuffing design sends.
export const fullRecord = () => `${header}\n\n${RECORD.map(fmt).join("\n\n")}`;
// Only the chosen sections, in date order.
export const selectedRecord = (ids) => `${header}\n\n${RECORD.filter((r) => ids.includes(r.id)).map(fmt).join("\n\n")}`;
// The record index: one line per section, no clinical text. This is what the selector sees.
export const recordIndex = () => RECORD.map((r) => `${r.id} ${r.date.slice(0, 7)} ${r.type}: ${r.title}`).join("\n");

// Facts a cardiology referral must carry (checked on the letter) and details it must not.
export const KEY_FACTS = [
  ["exertional chest tightness", /(chest (tightness|pain)|angina)/i],
  ["ECG T-wave inversion V4-V6", /T[- ]?wave/i],
  ["troponin normal", /troponin/i],
  ["penicillin allergy", /penicillin/i],
  ["aspirin and GTN started", /aspirin/i],
];
export const LEAKS = [
  ["depression / sertraline (2009)", /(depress|sertraline|psychiatr|counsell)/i],
  ["sexual health visit (2014)", /(sexual health|screening tests? negative|new relationship)/i],
  ["knee physiotherapy", /(physiotherap|quadriceps)/i],
  ["eczema", /eczema/i],
  ["dental", /(dental|filling)/i],
];
