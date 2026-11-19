// Meridian Clinical Notes, Domain 1 (Lab 5): a five-day admission for "Patient A" (MRN 00-4417), synthetic.
// The medication story changes across the stay; the discharge summary must reflect the LAST order for each drug.

export const PATIENT = { mrn: "00-4417", name: "Patient A", admitted: "2026-11-10", discharged: "2026-11-14" };

// Clinical notes. type routes each note to the sections that need it.
const KEY = [
  { id: "N01", day: 1, type: "admission", text: "ADMISSION (Dr Osei). 78F, 3 days cough, fever, breathless. CXR: right lower lobe consolidation. Dx community-acquired pneumonia (CURB-65 = 2). PMH: AF, T2DM, HTN. Home meds: metformin 1 g BD, ramipril 5 mg OD, warfarin 5 mg OD (INR target 2-3), atorvastatin 40 mg ON. Allergies: NKDA. Plan: IV amoxicillin 1 g TDS, IV fluids, blood cultures sent." },
  { id: "N02", day: 1, type: "pharmacy", text: "PHARMACY MED REC (A. Lindqvist). Home meds confirmed with patient and GP list: metformin 1 g BD, ramipril 5 mg OD, warfarin 5 mg OD, atorvastatin 40 mg ON. No OTC. NKDA confirmed with patient." },
  { id: "N05", day: 2, type: "ward_round", text: "WARD ROUND D2 (Dr Osei). Creat 168 (baseline 92), AKI stage 1, likely prerenal + sepsis. WITHHOLD metformin and ramipril. Continue IV fluids. Cont IV amoxicillin." },
  { id: "N09", day: 3, type: "nursing", text: "NURSING 06:10. Widespread itchy urticarial rash on trunk and arms ~40 min after 06:00 amoxicillin dose. Obs stable, no wheeze, no lip swelling. Dr Patel informed, antihistamine given." },
  { id: "N10", day: 3, type: "ward_round", text: "WARD ROUND D3 (Dr Patel). Rash = likely amoxicillin hypersensitivity. STOP amoxicillin. Switch to doxycycline 100 mg BD PO to complete 5 days total abx (last dose 2026-11-15). Document PENICILLIN ALLERGY (urticaria) on chart and discharge. INR this am 4.8 - haematology asked." },
  { id: "N12", day: 3, type: "specialist", text: "HAEMATOLOGY ADVICE (Dr Mbeki). INR 4.8 on warfarin with doxycycline interaction + poor intake. Hold warfarin tonight. Switch to apixaban 5 mg BD from D4 (renal fn adequate for full dose once creat < 133). STOP warfarin permanently; GP to stop INR monitoring." },
  { id: "N15", day: 4, type: "ward_round", text: "WARD ROUND D4 (Dr Osei). Creat 121, AKI resolving. Apixaban 5 mg BD started. Restart ramipril at REDUCED dose 2.5 mg OD. Metformin to stay HELD until GP rechecks U&E - do not restart in hospital. Atorvastatin continues." },
  { id: "N18", day: 5, type: "discharge_plan", text: "DISCHARGE PLANNING D5 (Dr Osei). Afebrile 48 h, sats 96% RA. Blood cultures: final result PENDING (prelim no growth at 48 h) - ward team to chase and phone GP if positive. GP: U&E in 1 week, decide on metformin restart. Respiratory clinic in 6 weeks with repeat CXR. Discharge today." },
];

// Routine observations and care notes: the bulk of a real record, irrelevant to the discharge medications.
const FILLER_TEXT = [
  "Obs: T 37.9, HR 96 irregular, BP 128/74, RR 22, sats 93% on 2 L. Comfortable, mobilising to toilet with assistance.",
  "Obs: T 37.4, HR 88, BP 132/70, RR 20, sats 94% on 1 L. Eating half portions. Family visited.",
  "Physiotherapy: chest clearance, productive cough, encouraged deep breathing exercises. Walked 20 m with frame.",
  "Obs: T 37.1, HR 84, BP 126/72, RR 18, sats 95% RA. Slept well. Fluid balance +600 mL.",
  "Dietitian: appetite poor, started oral nutritional supplements twice daily. Weight 61 kg.",
  "Obs stable overnight. Pressure areas intact. Repositioned 4-hourly.",
  "Occupational therapy: independent with washing and dressing; lives with husband, two steps to front door. No new equipment needed.",
  "Obs: T 36.8, HR 80, BP 130/76, RR 17, sats 96% RA. Mobilising independently on the ward.",
  "Social: husband will collect on discharge. No package of care needed.",
  "Capillary glucose 6.8-9.4 mmol/L today off metformin. No hypos.",
  "Obs: T 36.7, HR 78, BP 134/78, RR 16, sats 96% RA. Patient asking about going home.",
  "IV cannula removed, site clean. Fluid balance even.",
];
const FILLER = FILLER_TEXT.map((text, i) => ({ id: `N${String(20 + i).padStart(2, "0")}`, day: 1 + (i % 5), type: i % 4 === 2 ? "therapy" : "nursing_obs", text }));

export const NOTES = [...KEY, ...FILLER].sort((a, b) => a.day - b.day || a.id.localeCompare(b.id));
export const notesText = (notes) => notes.map((n) => `[${n.id} · day ${n.day} · ${n.type}] ${n.text}`).join("\n");

// The answer key for the discharge medication list (what the last order says for each drug).
export const TRUTH = {
  apixaban: { status: "new", dose: /5\s*mg/i, freq: /bd|twice/i },
  ramipril: { status: "changed", dose: /2\.5\s*mg/i },
  atorvastatin: { status: "unchanged", dose: /40\s*mg/i },
  doxycycline: { status: "new", dose: /100\s*mg/i },
  metformin: { status: "stopped" },                    // held until the GP rechecks: not taken after discharge
  warfarin: { status: "stopped" },
  amoxicillin: { status: "stopped" },
};
export const ALLERGY = /penicillin|amoxicillin/i;
