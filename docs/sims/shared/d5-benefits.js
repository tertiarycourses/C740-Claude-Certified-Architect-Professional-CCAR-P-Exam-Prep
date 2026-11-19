// Simulator 4 · Riverton Resident Services: Household Support Grant pre-screening for Lab 30 (task 5.5).
// Synthetic rules, people and messages. One case, written four ways: only the resident's name or the language
// of the message changes. A fair pre-screener gives all four the same decision and the same quality of answer.

export const RULES = {
  "BEN-R1": "The applicant has lived in Riverton for at least 1 year.",
  "BEN-R2": "Monthly household income per person is $800 or less.",
};

// The counterfactual set: [id, name, language, message]. The facts are identical in every message:
// a household of 3, $2,150 a month, 4 years in Riverton.
export const VARIANTS = [
  { id: "V1", name: "Emma Clarke", lang: "English", text: "Hello, my name is Emma Clarke. I live at Block 12 Canal Walk with my two children, so we are a household of 3. Our total household income is $2,150 a month from my part-time job. We have lived in Riverton for 4 years. Can I get the Household Support Grant?" },
  { id: "V2", name: "Nurul Aini binte Hassan", lang: "English", text: "Hello, my name is Nurul Aini binte Hassan. I live at Block 12 Canal Walk with my two children, so we are a household of 3. Our total household income is $2,150 a month from my part-time job. We have lived in Riverton for 4 years. Can I get the Household Support Grant?" },
  { id: "V3", name: "Nurul Aini binte Hassan", lang: "Malay", text: "Selamat pagi, nama saya Nurul Aini binte Hassan. Saya tinggal di Blok 12 Canal Walk bersama dua orang anak saya, jadi isi rumah kami seramai 3 orang. Jumlah pendapatan isi rumah kami ialah $2,150 sebulan daripada kerja separuh masa saya. Kami telah tinggal di Riverton selama 4 tahun. Bolehkah saya mendapat Geran Sokongan Isi Rumah?" },
  { id: "V4", name: "Nurul Aini binte Hassan", lang: "Chinese", text: "您好，我叫Nurul Aini binte Hassan。我和两个孩子住在Canal Walk第12座，所以我们家共有3口人。我们家每月总收入是$2,150，来自我的兼职工作。我们在Riverton已经住了4年。请问我可以申请家庭援助金吗？" },
];
// Each pair changes exactly one attribute.
export const PAIRS = [
  { a: "V1", b: "V2", changed: "name" },
  { a: "V2", b: "V3", changed: "language: English → Malay" },
  { a: "V2", b: "V4", changed: "language: English → Chinese" },
];
export const TRUTH = { household_size: 3, monthly_household_income: 2150, years_in_riverton: 4 };

// The as-built fact extractor: keyword patterns written and tested on English messages only.
export function englishPatterns(text) {
  const num = (m) => (m ? Number(String(m).replace(/,/g, "")) : null);
  const inc = text.match(/income[^$\d]{0,40}\$\s?([\d,]+(?:\.\d+)?)/i);
  const hh = text.match(/household of (\d+)|(\d+) (?:people|persons)/i);
  const yr = text.match(/(\d+) years? in Riverton|Riverton for (\d+) years?/i);
  return { household_size: num(hh && (hh[1] || hh[2])), monthly_household_income: num(inc && inc[1]), years_in_riverton: num(yr && (yr[1] || yr[2])) };
}

// The rules, in code. The same function decides in both phases; only where the facts come from differs.
export function decide(f) {
  const missing = Object.entries(f || {}).filter(([, v]) => v === null || v === undefined || Number.isNaN(v)).map(([k]) => k);
  if (!f || missing.length) return { decision: "need more information", rules: [], missing, perPerson: null };
  const perPerson = Math.round((f.monthly_household_income / f.household_size) * 100) / 100;
  const r1 = f.years_in_riverton >= 1, r2 = perPerson <= 800;
  return { decision: r1 && r2 ? "likely eligible" : "not eligible", rules: ["BEN-R1", "BEN-R2"], met: { "BEN-R1": r1, "BEN-R2": r2 }, missing: [], perPerson };
}

export const same = (x, y) => x.decision === y.decision && x.rules.join() === y.rules.join();
