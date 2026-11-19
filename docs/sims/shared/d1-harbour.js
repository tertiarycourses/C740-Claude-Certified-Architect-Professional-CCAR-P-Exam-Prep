// Harbour Mutual Claims Desk, Domain 1 (Labs 2, 3, 4): a small in-memory claims backend.
// Fictional people and synthetic identifiers only. Claude is real; everything here is plain JS.

export const AUTHORITY = 5000;          // the agent's payout authority (US$); above it a human adjuster approves
export const ASSESS_OVER = 2000;        // the claims manual: an independent damage assessment above this amount

export const POLICIES = {
  "HM-POL-2201": { policy_id: "HM-POL-2201", holder: "Priya Nair", cover: "comprehensive", excess: 500, status: "active", start: "2025-03-01",
                   wording: "Comprehensive motor: covers accidental damage to the insured vehicle, theft, fire and third-party liability. The excess applies to every own-damage claim." },
  "HM-POL-2240": { policy_id: "HM-POL-2240", holder: "Daniel Okafor", cover: "third_party_only", excess: 500, status: "active", start: "2025-08-15",
                   wording: "Third party only: covers the policyholder's liability for damage to other people and their property. It does not cover loss of, or damage to, the insured vehicle." },
  "HM-POL-2263": { policy_id: "HM-POL-2263", holder: "Arjun Mehta", cover: "comprehensive", excess: 750, status: "active", start: "2024-11-20",
                   wording: "Comprehensive motor: covers accidental damage to the insured vehicle, theft, fire and third-party liability. The excess applies to every own-damage claim." },
};

export const CLAIMS = {
  "CLM-7781": { claim_id: "CLM-7781", policy_id: "HM-POL-2201", claimant: "Priya Nair", type: "own_damage", incident_date: "2026-10-28",
                description: "Reversing out of a supermarket car park, another car backed into my rear bumper. Bumper cracked, parking sensor not working.",
                repair_quote: 4200, garage: "Bayside Panel Works", invoice_ref: "RQ-5531" },
  "CLM-7790": { claim_id: "CLM-7790", policy_id: "HM-POL-2240", claimant: "Daniel Okafor", type: "own_damage_total_loss", incident_date: "2026-10-30",
                description: "Lost control on a wet bend and hit a barrier. My car is a write-off. Claiming the market value of my car.",
                repair_quote: 18600, garage: "Eastside Salvage Assessors", invoice_ref: "ES-2290" },
  "CLM-7802": { claim_id: "CLM-7802", policy_id: "HM-POL-2201", claimant: "Priya Nair", type: "own_damage", incident_date: "2026-11-02",
                description: "Stone chip on the motorway spread into a crack across the windscreen.",
                repair_quote: 650, garage: "ClearView Glass", invoice_ref: "CV-1187" },
  "CLM-7815": { claim_id: "CLM-7815", policy_id: "HM-POL-2263", claimant: "Arjun Mehta", type: "own_damage", incident_date: "2026-11-04",
                description: "Low-speed collision at a junction; the front bumper, bonnet and both headlights need replacing.",
                repair_quote: 7250, garage: "Northgate Autobody", invoice_ref: "NA-4410" },
};

// The rules a payout must satisfy, in code. Returns a list of violations (empty = valid).
export function payoutRules(claim, policy, decision) {
  const v = [];
  if (!decision || !["approve", "decline", "refer"].includes(decision.decision)) { v.push({ rule: "schema", detail: "decision must be approve, decline or refer" }); return v; }
  if (policy.holder !== claim.claimant) v.push({ rule: "identity", detail: `claimant ${claim.claimant} is not the policyholder ${policy.holder}` });
  const covered = policy.cover === "comprehensive" || !/own_damage/.test(claim.type);
  const due = Math.max(0, claim.repair_quote - policy.excess);
  if (decision.decision === "approve") {
    if (!covered) v.push({ rule: "coverage", detail: `${policy.cover} does not cover ${claim.type}` });
    else if (Math.abs(Number(decision.payout_amount) - due) > 0.01) v.push({ rule: "amount", detail: `payout ${decision.payout_amount} should be the quote ${claim.repair_quote} minus the excess ${policy.excess} = ${due}`, repairable: true });
    if (Number(decision.payout_amount) > AUTHORITY) v.push({ rule: "authority", detail: `payout ${decision.payout_amount} is above the agent's US$${AUTHORITY.toLocaleString("en-US")} authority: a human adjuster must approve` });
  }
  if (decision.decision === "decline" && covered) v.push({ rule: "coverage", detail: `the claim is covered by ${policy.cover}; a decline needs an adjuster` });
  return v;
}
export const amountDue = (claim, policy) => (policy.cover === "comprehensive" || !/own_damage/.test(claim.type) ? Math.max(0, claim.repair_quote - policy.excess) : 0);
