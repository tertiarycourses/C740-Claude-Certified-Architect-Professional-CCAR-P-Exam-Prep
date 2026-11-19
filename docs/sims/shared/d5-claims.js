// Simulator 1 · Harbour Mutual Claims Desk: claim CLM-7815 for Lab 27 (task 5.2). Synthetic data only.
// Priya Nair's comprehensive motor policy HM-POL-2201: the insurer pays the repair quote, adds 9% GST to
// parts and materials (labour is GST-exempt) and deducts the $500 excess. The agent's payout authority is
// US$5,000; above that an adjuster approves.
// The garage's quote prints 20 of its 21 amounts: line 14 (paint and materials) says "per materials sheet
// to follow". The real amount, $486.30, arrives only on that sheet, and it takes the payout over $5,000.

export const POLICY = { id: "HM-POL-2201", holder: "Priya Nair", cover: "comprehensive motor", excess: 500, gst: 0.09 };
export const AUTHORITY = 5000;
export const CLAIM = { id: "CLM-7815", holder: "Priya Nair", policy: "HM-POL-2201", incident: "rear-end collision, 6 Nov 2026", garage: "Bayside Autobody" };
export const UNPRICED = 14;

// [kind, description, amount]: P part, L labour, M materials
export const LINES = [
  ["P", "Rear bumper cover (OEM)", 612.40], ["P", "Bumper reinforcement bar", 287.95], ["P", "Parking sensors x2", 318.60],
  ["P", "Sensor brackets x2", 46.35], ["P", "Left tail lamp assembly", 433.80], ["P", "Boot lid outer skin", 529.15],
  ["P", "Boot seal", 72.45], ["P", "Rear number plate lamp", 38.90], ["P", "Clips and fasteners kit", 27.65],
  ["L", "Strip and refit bumper, 3.5 h", 341.25], ["L", "Panel repair, boot lid, 4.0 h", 390.00], ["L", "Parking sensor calibration", 145.00],
  ["L", "Paint labour, 6.5 h", 633.75], ["M", "Paint and materials", 486.30], ["L", "Wheel alignment check", 89.00],
  ["P", "Exhaust tip", 64.20], ["L", "Pre-repair and post-repair scans", 120.00], ["P", "Rear diffuser trim", 158.85],
  ["P", "Right rear quarter repair section", 392.70], ["L", "Quarter panel repair, 2.5 h", 243.75], ["P", "Rear wheel arch liner", 88.40],
];
export const KIND = { P: "part", L: "labour", M: "materials" };
export const quoteText = () => `Repair quote · ${CLAIM.garage} · ${CLAIM.id} · ${CLAIM.holder} · ${CLAIM.incident}\n` +
  LINES.map(([k, d, v], i) => `${String(i + 1).padStart(2)}. [${KIND[k]}] ${d} ... ${i + 1 === UNPRICED ? "per materials sheet to follow" : `$${v.toFixed(2)}`}`).join("\n") +
  "\nPrices exclude GST.";

// The materials sheet the garage sends on request (the payout system fetches it; no Claude call).
export const MATERIALS_SHEET = `${CLAIM.garage} · materials sheet for ${CLAIM.id} · line ${UNPRICED}: Paint and materials (2K clear coat, base coat, primer, abrasives) · $486.30 excl. GST`;
export function requestDocument(name) {
  return { doc: "MS-7815", name, text: MATERIALS_SHEET };
}

export const POLICY_TERMS = `Policy ${POLICY.id} (${POLICY.cover}, holder ${POLICY.holder}): the insurer pays the repair quote, adding 9% GST to parts and materials only (labour is GST-exempt), less the policy excess of $${POLICY.excess}.`;

const cents = (x) => Math.round(x * 100) / 100;
// The deterministic calculation: the policy terms written as code.
export function computePayout(lines) {
  const taxable = lines.filter((l) => l.kind !== "labour").reduce((a, l) => a + l.amount, 0);
  const labour = lines.filter((l) => l.kind === "labour").reduce((a, l) => a + l.amount, 0);
  const gst = cents(taxable * POLICY.gst);
  const gross = cents(taxable + gst + labour);
  return { taxable: cents(taxable), labour: cents(labour), gst, gross, excess: POLICY.excess, payout: cents(gross - POLICY.excess) };
}
export const EXACT = computePayout(LINES.map(([k, d, v], i) => ({ line: i + 1, kind: KIND[k], amount: v })));
// What a calculation that silently drops the unpriced line comes to.
export const PARTIAL = computePayout(LINES.filter((_, i) => i + 1 !== UNPRICED).map(([k, d, v], i) => ({ kind: KIND[k], amount: v })));

// Grounding: each extracted amount must be printed in the quote with the same kind; none may be missing.
// An unpriced line must come back as null: an amount there was not in the quote, so it is a guess.
export function groundLines(lines) {
  const errors = [], unpriced = [], seen = new Set();
  for (const l of lines || []) {
    const src = LINES[l.line - 1];
    if (!src) { errors.push(`line ${l.line}: not in the quote`); continue; }
    if (seen.has(l.line)) errors.push(`line ${l.line}: listed twice`);
    seen.add(l.line);
    if (KIND[src[0]] !== l.kind) errors.push(`line ${l.line}: kind ${l.kind}, but the quote says ${KIND[src[0]]}`);
    if (l.line === UNPRICED) {
      unpriced.push(l.line);
      if (l.amount !== null && l.amount !== undefined) errors.push(`line ${l.line}: amount ${l.amount} is not printed in the quote (a guess)`);
    } else if (typeof l.amount !== "number" || Math.abs(src[2] - l.amount) > 0.001) errors.push(`line ${l.line}: amount ${l.amount}, but the quote prints ${src[2].toFixed(2)}`);
  }
  for (let i = 1; i <= LINES.length; i++) if (!seen.has(i)) errors.push(`line ${i}: missing`);
  return { errors, unpriced };
}

export const money = (x) => `$${Number(x).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// The payout system: approve_payout within authority, escalate_to_adjuster above it, hold while incomplete.
export function payoutSystem() {
  const actions = [];
  return {
    actions,
    approve_payout: (amount, basis) => { actions.push({ action: "approve_payout", amount, basis }); return { ok: true, claim: CLAIM.id, paid: amount }; },
    escalate_to_adjuster: (amount, reason) => { actions.push({ action: "escalate_to_adjuster", amount, reason }); return { ok: true, claim: CLAIM.id, queued_for: "adjuster" }; },
    hold: (reason) => { actions.push({ action: "hold", amount: null, reason }); return { ok: true, claim: CLAIM.id, status: "on hold" }; },
  };
}
