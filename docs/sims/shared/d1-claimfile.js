// Lab 4's claim file for CLM-7781: everything an assessor of coverage, damage and fraud would pull.
// The fraud signal: Bayside Panel Works' invoice RQ-5531 was already paid on another claim (CLM-6120).
import { CLAIMS, POLICIES } from "./d1-harbour.js";

export const ID = "CLM-7781";
export const DUP = { invoice_ref: "RQ-5531", other_claim: "CLM-6120" };

// The full policy wording (long, as real wordings are). Coverage needs sections 2, 6 and 7.
export const WORDING = [
  "HARBOUR MUTUAL COMPREHENSIVE MOTOR POLICY WORDING (edition 2025.1)",
  "Section 1 Definitions. 'You' means the policyholder named in the schedule. 'Insured vehicle' means the vehicle in the schedule. 'Excess' means the first part of any own-damage claim that you pay. 'Market value' means the cost of replacing the insured vehicle with one of the same make, model, age, mileage and condition.",
  "Section 2 Accidental damage. We cover loss of or damage to the insured vehicle caused by accident, including collision, impact with another vehicle or object, and malicious damage. We pay the cost of repair or, if the repair cost exceeds the market value, the market value.",
  "Section 3 Fire and theft. We cover loss of or damage to the insured vehicle caused by fire, lightning, explosion, theft or attempted theft. Keys left in or on an unattended vehicle void this cover.",
  "Section 4 Windscreen and windows. We cover the repair or replacement of broken glass in the windscreen, sunroof or windows. The windscreen excess is $100 and a windscreen claim does not affect your no-claims discount.",
  "Section 5 Third-party liability. We cover your legal liability for death or injury to other people and damage to their property arising from the use of the insured vehicle, up to the limits in the schedule.",
  "Section 6 The excess. You pay the excess shown in the schedule for every own-damage claim under Section 2. The excess is deducted from the amount we pay.",
  "Section 7 Repairs. We may ask an independent assessor to inspect the damage. We pay the lower of the repair quote and the assessed cost of repair. We may choose the repairer.",
  "Section 8 General exclusions. We do not cover wear and tear, mechanical or electrical breakdown, loss of use, damage while the vehicle is used for hire or reward, racing or rallies, or driving by anyone not permitted by the schedule. We do not cover any loss where the driver was over the legal alcohol limit.",
  "Section 9 Claims conditions. You must tell us about an incident within 30 days, give us any information we ask for, and not admit liability. A claim that is fraudulent in any part is not payable, and we may cancel the policy.",
  "Section 10 Cancellation. You may cancel at any time; we refund the premium for the unused period less a $40 fee if no claim has been made. We may cancel by giving 14 days' notice.",
  "Section 11 Complaints. If you are unhappy with a decision, contact our complaints team. You may refer an unresolved complaint to the Financial Ombudsman Service.",
].join("\n\n");

export const ASSESSMENT = { assessment_id: "AS-3302", claim_id: ID, assessor: "Coastline Loss Assessors", assessed_cost: 4150,
  findings: "Rear bumper cover cracked, left rear parking sensor bracket broken. Paint transfer consistent with a low-speed reversing impact. Quote reasonable; sensor recalibration priced slightly high." };

// Bayside Panel Works' invoices registered with insurers over 18 months. One reuses this claim's invoice number.
const NAMES = ["T. Lim", "R. Gupta", "S. Okoro", "A. Chen", "M. Rossi", "J. Park", "K. Wong", "L. Haddad", "P. Silva", "D. Novak"];
const JOBS = ["front bumper respray", "door panel dent repair", "rear quarter panel", "wing mirror replacement", "rear bumper replacement", "bonnet repaint", "tailgate realignment", "alloy wheel refurbishment"];
export const REGISTRY = Array.from({ length: 30 }, (_, i) => {
  const n = 5510 + i;
  const row = { invoice_ref: `RQ-${n}`, claim_id: `CLM-${5980 + i * 7}`, claimant: NAMES[i % NAMES.length], date: `2025-${String(1 + (i % 12)).padStart(2, "0")}-${String(3 + (i % 25)).padStart(2, "0")}`,
                job: JOBS[i % JOBS.length], amount: 600 + ((i * 377) % 4200), status: "paid" };
  return row;
}).map((r) => (r.invoice_ref === DUP.invoice_ref ? { ...r, claim_id: DUP.other_claim, claimant: "K. Wong", date: "2025-06-14", job: "rear bumper replacement and sensor", amount: 4200 } : r));

export const HISTORY = [
  { claim_id: "CLM-5521", date: "2025-09-02", type: "windscreen", paid: 280 },
  { claim_id: "CLM-7802", date: "2026-11-02", type: "windscreen", status: "open", quote: 650 },
];

export const claim = () => CLAIMS[ID];
export const policy = () => POLICIES[CLAIMS[ID].policy_id];
