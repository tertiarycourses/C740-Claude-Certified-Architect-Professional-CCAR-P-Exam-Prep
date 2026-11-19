// Simulator 4 · Riverton Resident Services: reference facts, a small labelled eval set and a grader for Lab 14
// (accuracy-latency trade-offs). Fictional council and residents; real Claude.

export const FACTS = `RIVERTON RESIDENT SERVICES · reference facts (v2026.11)
Waste: general waste is collected weekly. Zone 1 Monday, Zone 2 Tuesday, Zone 3 Thursday, Zone 4 Friday. Recycling is collected every second Wednesday in all zones. Bulky items: book a free pickup (up to 3 items per household per quarter); each extra item costs $25.
Permits: PRM-HOME home renovation permit fee $120, decision within 10 working days. PRM-EVENT street event permit fee $45, apply at least 21 days before the event. PRM-SKIP skip bin on a public road $60 per week.
Benefit pre-screen BEN-HOUSING (rent support): countable income = wages + self-employment + pensions; EXCLUDE child support and disability allowance. Eligible if countable monthly household income divided by household size is at most $900. If it is above $900 but at most $1,100, eligible only if rent is more than 40% of countable monthly household income. Otherwise not eligible. A pre-screen is not a decision: a caseworker confirms.
Office: Riverton Civic Centre, Monday to Friday 8:30am to 5pm.`;

export const SYSTEM = `You answer Riverton residents. Use only the reference facts below. Reply in the resident's own language, in plain words, under 70 words. Put the key answer in "value", in English: a weekday name, a fee in dollars as digits (0 if free), or eligible / not_eligible.

${FACTS}`;

export const ANSWER = {
  type: "object", additionalProperties: false,
  properties: { value: { type: "string" }, reply: { type: "string" } },
  required: ["value", "reply"],
};

// The labelled eval set: four live-chat questions and two benefit pre-screens from the BEN-HOUSING form.
export const REQUESTS = [
  { id: "CHAT-1", channel: "chat", lang: "Malay", text: "Hari apakah sampah am dikutip di Zon 3?", expect: "thursday" },
  { id: "CHAT-2", channel: "chat", lang: "English", text: "How much is a permit for a street party, and how early do I apply?", expect: "45" },
  { id: "CHAT-3", channel: "chat", lang: "Chinese", text: "我想扔掉一个旧沙发，这个季度还没预约过大件垃圾。要收费吗？", expect: "0" },
  { id: "CHAT-4", channel: "chat", lang: "Tamil", text: "மண்டலம் 1-இல் பொதுக் கழிவு எந்த நாளில் சேகரிக்கப்படும்?", expect: "monday" },
  { id: "BEN-0412", channel: "form", form: "BEN-HOUSING", lang: "English", text: "BEN-HOUSING pre-screen. Household of 4. Wages $3,300 a month, my husband's self-employment $420, child support $380, disability allowance $250. Rent $1,450. Are we likely eligible for rent support?", expect: "not_eligible" },
  { id: "BEN-0413", channel: "form", form: "BEN-HOUSING", lang: "English", text: "BEN-HOUSING pre-screen. There are 3 of us. My wages are $2,900 a month, my mother's pension $380, and I receive child support of $500. Our rent is $1,350. Can we get rent support?", expect: "eligible" },
];
// BEN-0412: countable 3,300 + 420 = 3,720; / 4 = 930 (in the 900-1,100 band); rent 1,450 / 3,720 = 39.0% -> not eligible.
// BEN-0413: countable 2,900 + 380 = 3,280; / 3 = 1,093 (in the band); rent 1,350 / 3,280 = 41.2% -> eligible.

// Latency budgets come from the resident's moment, not from the model.
export const BUDGET_MS = { chat: 4000, form: 15000 };

export function grade(req, value) {
  const v = String(value ?? "").toLowerCase().trim();
  if (req.expect === "eligible") return /^eligible|likely eligible/.test(v) && !/not/.test(v);
  if (req.expect === "not_eligible") return /not[ _]?eligible|ineligible/.test(v);
  if (/^\d+$/.test(req.expect)) return (v.match(/\d+/)?.[0] ?? (/free/.test(v) ? "0" : "")) === req.expect;
  return v.includes(req.expect);
}

export const p95 = (xs) => { const a = [...xs].sort((x, y) => x - y); return a.length ? a[Math.min(a.length - 1, Math.ceil(0.95 * a.length) - 1)] : 0; };
