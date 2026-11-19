// Domain 4 labs: Harbour Mutual claims-triage fixtures for Lab 24 (token, latency and cost optimisation).
// A static policy wording long enough to cache (well over Haiku 5.5's 512-token minimum), three claims with gold
// outcomes, and each claim's full email history (what the verbose design re-sends on every call). All fictional.

export const POLICY = `HARBOUR MUTUAL INSURANCE · MOTOR POLICY WORDING HM-MOTOR-2026 · CLAIMS DESK RULES

Section 1. Who is covered
1.1 The policyholder named in the schedule, and any driver named in the schedule who holds a full licence.
1.2 A driver not named in the schedule is covered under third-party liability only, whatever the cover type.
1.3 Cover applies in the territory stated in the schedule. Driving outside the territory is not covered unless an extension is shown in the schedule.

Section 2. Cover types
2.1 Comprehensive cover pays for accidental damage to the insured vehicle, fire and theft, windscreen and window glass, and third-party liability for injury and property damage.
2.2 Third-party, fire and theft cover pays for third-party liability, fire and theft. It does not pay for accidental damage to the insured vehicle.
2.3 Third-party only cover pays for third-party liability for injury to other people and damage to their property. It does not pay for any loss of or damage to the insured vehicle, including a total loss.
2.4 The cover type is shown in the schedule. Where the schedule and a claim form disagree, the schedule applies.

Section 3. Excess
3.1 The excess shown in the schedule applies to each accidental damage claim under comprehensive cover.
3.2 No excess applies to a windscreen or window glass claim under comprehensive cover, whether the glass is repaired or replaced.
3.3 An additional excess of US$1,000 applies when the driver is under 25 years old or has held a full licence for less than two years.
3.4 Where a third party is found fully at fault and Harbour Mutual recovers the full cost, the excess is refunded after recovery. The claims desk does not waive the excess at the time of payment.

Section 4. Settlement
4.1 Repairs are settled on the lower of: the repair quote from an approved repairer, or the assessor's estimate where an assessment was requested.
4.2 A quote from an approved repairer under US$5,000 may be settled without an assessment, provided the photos match the described damage.
4.3 A vehicle is a total loss when the repair cost exceeds 60% of its market value. Total loss is settled at market value less the excess, under comprehensive cover only.
4.4 The payout is the settled amount less any excess that applies under Section 3.
4.5 Payouts are made to the approved repairer for repairs, and to the policyholder for total loss and glass claims.

Section 5. Claims desk authority
5.1 The claims agent may approve a payout of up to US$5,000 per claim.
5.2 Any payout above US$5,000 must be escalated to a human adjuster, who approves or declines it.
5.3 The claims agent may decline a claim that falls outside the cover type in the schedule. A declined claim is reviewed by an adjuster within 10 working days, and the decline letter must say so.
5.4 The claims agent must escalate, not decide, when: fraud indicators are present (Section 7), the driver was not named, the cause of loss is unclear, or the customer disputes a previous decision.
5.5 The claims agent never changes a policy, deletes a claim or exports customer data.

Section 6. Exclusions
6.1 Wear and tear, mechanical or electrical breakdown, and tyre damage caused by braking, punctures or road surfaces.
6.2 Loss or damage while the driver was over the legal alcohol limit or under the influence of drugs.
6.3 Use for hire or reward, racing, pace-making or track days.
6.4 Loss or damage caused deliberately by the policyholder or a named driver.
6.5 Any claim first notified more than 30 days after the incident, unless the customer was prevented from notifying.

Section 7. Fraud indicators (escalate, do not decline)
7.1 Damage inconsistent with the described incident or the photos.
7.2 A claim within 14 days of the policy start date or of a cover upgrade.
7.3 Repeated claims for the same part within 12 months.
7.4 Pressure for urgent cash payment to the customer rather than to a repairer.

Section 8. Customer communication
8.1 Every decision letter states the decision, the clause relied on, the amount and the next step.
8.2 Letters use plain language and avoid internal codes other than the claim and policy numbers.
8.3 A decline letter explains the right to ask for an adjuster review and to complain to the Financial Ombudsman.

Section 9. Records
9.1 Every decision records the claim id, the decision, the payout, the clause relied on and a one-line reason.
9.2 Records are kept for seven years after the claim closes.`;

export const RULES = "You are Harbour Mutual's motor claims triage agent. Decide each claim strictly from the policy wording: " +
  "approve (payout within your authority), decline (outside the cover type) or escalate (above your authority or an escalation trigger). " +
  "The payout is the settled amount less any excess that applies; a decline or escalation has payout 0.";

export const CLAIMS = [
  { claim_id: "CLM-7781", policy: "HM-POL-2201", holder: "Priya Nair", cover: "comprehensive", excess_usd: 500, driver: "policyholder, licensed 11 years",
    incident: "Rear bumper and boot lid damaged when another car reversed into the parked vehicle in a supermarket car park.", amount_usd: 4200,
    evidence: "Approved repairer Bayside Panels quote US$4,200; 4 photos consistent with rear impact.", notified_days: 2, gold: { decision: "approve", payout: 3700 } },
  { claim_id: "CLM-7790", policy: "HM-POL-2240", holder: "Daniel Okafor", cover: "third-party only", excess_usd: 500, driver: "policyholder, licensed 6 years",
    incident: "Own car left the road on a wet bend and hit a barrier; no other vehicle or property involved. Car declared a total loss.", amount_usd: 18600,
    evidence: "Market value US$18,600 per assessor; barrier owned by the council, no damage claim from the council.", notified_days: 1, gold: { decision: "decline", payout: 0 } },
  { claim_id: "CLM-7802", policy: "HM-POL-2201", holder: "Priya Nair", cover: "comprehensive", excess_usd: 500, driver: "policyholder, licensed 11 years",
    incident: "Windscreen cracked by a stone thrown up on the expressway; the crack is in the driver's line of sight.", amount_usd: 650,
    evidence: "Glass specialist quote US$650 to replace; 2 photos.", notified_days: 3, gold: { decision: "approve", payout: 650 } },
];

// The full correspondence the verbose design pastes into every request, most of it irrelevant to the decision.
export function history(c) {
  const first = c.holder.split(" ")[0];
  return [
    `From: ${c.holder} · Subject: Claim on ${c.policy}\nHello, I need to make a claim. ${c.incident} I have attached what I have. Please let me know what you need from me and how long it will take, as I use the car every day for work and to take my children to school. Thank you.`,
    `From: Harbour Mutual (auto-reply)\nThank you for contacting Harbour Mutual. Your message has been received and a claim reference ${c.claim_id} has been created. A member of the claims team will be in touch within two working days. You can track your claim in the Harbour Mutual app. Please do not reply to this automated message.`,
    `From: Claims Desk · Subject: ${c.claim_id}\nDear ${first}, thank you for your claim. To proceed we need the following: photos of the damage, a quote or estimate, and confirmation of who was driving. If another party was involved, please send their details. You can reply to this email or upload the documents in the app.`,
    `From: ${c.holder}\nHi, thanks. Here are the documents: ${c.evidence} I was driving myself. Could you tell me whether a courtesy car is included and whether this will affect my no-claims discount? Also, I moved house last month: my new address is in the app, please update your records.`,
    `From: Claims Desk\nDear ${first}, thank you for the documents. Courtesy cars depend on your cover and the repairer's availability; we will confirm when your claim is decided. The effect on your no-claims discount depends on the outcome. Your address change has been passed to our policy team.`,
    `From: ${c.holder}\nThanks. Sorry to chase, but is there any update? It has been a few days. I would appreciate a quick decision either way so I can plan.`,
  ].join("\n\n---\n\n");
}

// The compact request the optimised design sends: only the fields the decision needs.
export const fields = (c) => ({ claim_id: c.claim_id, policy: c.policy, cover: c.cover, excess_usd: c.excess_usd, driver: c.driver,
  incident: c.incident, claimed_usd: c.amount_usd, evidence: c.evidence, notified_days_after_incident: c.notified_days });

export const DECISION_SCHEMA = { type: "object", additionalProperties: false, required: ["claim_id", "decision", "payout_usd", "clause", "reason"], properties: {
  claim_id: { type: "string" }, decision: { type: "string", enum: ["approve", "decline", "escalate"] }, payout_usd: { type: "number" },
  clause: { type: "string" }, reason: { type: "string" } } };

// Sonnet 5.5 list prices (US$ per token), for pricing the same token counts at the stem's model tier.
export const SONNET = { in: 2 / 1e6, out: 10 / 1e6, write: 2.5 / 1e6, read: 0.2 / 1e6 };
export const priceAt = (P, u = {}) => (u.input_tokens || 0) * P.in + (u.output_tokens || 0) * P.out +
  (u.cache_creation_input_tokens || 0) * P.write + (u.cache_read_input_tokens || 0) * P.read;
