// Domain 2 · Harbour Mutual Claims Desk: policies, the routing labels, an eval set of eight incoming motor
// claims (five of them on a boundary), and the labelled examples used for few-shot prompting. Synthetic data only.
// Lab 9 uses it to compare a zero-shot classifier with few-shot examples that reason before the label.

export const POLICIES = `Policies on file:
- HM-POL-2201 · Priya Nair · comprehensive motor · excess US$500 · includes glass cover
- HM-POL-2240 · Daniel Okafor · third-party only · excess US$300
- HM-POL-2255 · Mei Chen · comprehensive motor · excess US$750 · includes glass cover
All Harbour Mutual motor policies exclude racing, track days and any commercial use (deliveries, ride-hailing).
The claims agent's payout authority is US$5,000; above that a human adjuster approves.`;

export const LABELS = `Routes (choose exactly one):
- auto_approve: a covered loss the agent can pay within its US$5,000 payout authority.
- adjuster_review: a covered loss that needs a human adjuster.
- decline: the loss is not covered by the policy, whatever the amount.
- glass_fast_track: damage to windscreen or window glass only, on a policy with glass cover.`;

export const ROUTES = ["auto_approve", "adjuster_review", "decline", "glass_fast_track"];

// The eval set: the same eight claims in both phases. edge = the boundary the zero-shot prompt gets wrong.
export const CLAIMS = [
  { id: "CLM-7781", policy: "HM-POL-2201", text: "Rear bumper dented when another car reversed into me in a car park. Repair quote US$4,200.", want: "auto_approve" },
  { id: "CLM-7790", policy: "HM-POL-2240", text: "My car was written off after I hit a wall on a wet road. Market value US$18,600.", want: "decline",
    edge: "a large loss, but own damage on third-party only" },
  { id: "CLM-7802", policy: "HM-POL-2201", text: "Stone chip turned into a crack across the windscreen on the motorway. Replacement quote US$650.", want: "glass_fast_track" },
  { id: "CLM-7815", policy: "HM-POL-2255", text: "Front wing and headlamp damaged by a falling branch. Repair quote US$5,600.", want: "auto_approve",
    edge: "quote above US$5,000, payout after the US$750 excess is US$4,850" },
  { id: "CLM-7821", policy: "HM-POL-2240", text: "I reversed into a parked van. The van owner's repair quote is US$3,100 and he is claiming from me.", want: "auto_approve",
    edge: "third-party only covers the other party's van" },
  { id: "CLM-7833", policy: "HM-POL-2255", text: "A cyclist clipped my door mirror and scraped the door. Repair quote US$1,150. My wrist has been sore since the jolt and I saw my GP.", want: "adjuster_review",
    edge: "small amount, but an injury is mentioned" },
  { id: "CLM-7840", policy: "HM-POL-2201", text: "A stone cracked my windscreen during a track day at Harbour Raceway. Replacement quote US$700.", want: "decline",
    edge: "glass damage, but on a track day (excluded)" },
  { id: "CLM-7847", policy: "HM-POL-2255", text: "Side swiped on the ring road; both doors and the sill need repair. Repair quote US$6,900.", want: "adjuster_review" },
];
export const EDGE_IDS = CLAIMS.filter((c) => c.edge).map((c) => c.id);

// Few-shot examples: different claims from the eval set, each with short reasoning BEFORE the label.
// They show how Harbour applies the four routes on the boundaries.
export const EXAMPLES = [
  { policy: "HM-POL-2201", text: "Door panel dented by a shopping trolley. Repair quote US$5,250.",
    reasoning: "Comprehensive, so covered. Payout is the quote minus the US$500 excess: US$4,750, within the US$5,000 authority. The authority applies to the payout, not the quote.", label: "auto_approve" },
  { policy: "HM-POL-2240", text: "I rear-ended a taxi at a junction. The taxi owner's repair quote is US$2,400.",
    reasoning: "Third-party only covers damage the policyholder causes to someone else's vehicle. The taxi is the third party, so covered. Payout US$2,400 is within authority.", label: "auto_approve" },
  { policy: "HM-POL-2240", text: "Hail dented my own bonnet and roof. Quote US$1,900.",
    reasoning: "Third-party only does not cover damage to the policyholder's own car.", label: "decline" },
  { policy: "HM-POL-2255", text: "Low-speed bump at traffic lights, rear bumper scuffed, quote US$800. My neck has been stiff since.",
    reasoning: "The car damage is covered and small, but any mention of an injury means a bodily-injury claim may follow, which only an adjuster can handle.", label: "adjuster_review" },
  { policy: "HM-POL-2201", text: "Windscreen cracked while I was delivering food for an app. Replacement quote US$520.",
    reasoning: "Glass damage, but it happened during commercial use, which every policy excludes. An exclusion means not covered, so the glass fast track does not apply.", label: "decline" },
  { policy: "HM-POL-2255", text: "Rear window smashed in a break-in while parked at home. Quote US$430.",
    reasoning: "Glass only, comprehensive with glass cover, no exclusion applies.", label: "glass_fast_track" },
];

export const claimList = () => CLAIMS.map((c) => `<claim id="${c.id}" policy="${c.policy}">${c.text}</claim>`).join("\n");
export const exampleList = () => EXAMPLES.map((e, i) =>
  `<example n="${i + 1}">\n<claim policy="${e.policy}">${e.text}</claim>\n<reasoning>${e.reasoning}</reasoning>\n<label>${e.label}</label>\n</example>`).join("\n");

// Output schemas: zero-shot returns the label only; the few-shot schema puts reasoning BEFORE the label.
const item = (withReasoning) => ({ type: "object", additionalProperties: false,
  required: withReasoning ? ["claim_id", "reasoning", "label"] : ["claim_id", "label"],
  properties: { claim_id: { type: "string" }, ...(withReasoning ? { reasoning: { type: "string" } } : {}), label: { type: "string", enum: ROUTES } } });
export const schema = (withReasoning) => ({ type: "object", additionalProperties: false, required: ["claims"],
  properties: { claims: { type: "array", items: item(withReasoning) } } });
