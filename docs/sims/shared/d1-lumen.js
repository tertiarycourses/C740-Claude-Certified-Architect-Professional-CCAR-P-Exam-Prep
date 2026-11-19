// Lumen Retail engagement, Domain 1 (Labs 1 and 6): the sponsor's request and the discovery pack.
// Every figure here is fictional. Labs check Claude's numbers against FIGURES, never against wording.

export const REQUEST = "Grace Lim (COO, sponsor): \"We want an AI agent that handles store product support end to end. Our competitors have agents. Can you have a design to me by Friday?\"";

export const DISCOVERY = `LUMEN RETAIL · DISCOVERY PACK (interviews and data, weeks 1-2)

Today: store staff phone the head-office product support line while the customer waits at the counter.
- Volume: 2,400 calls a week from 300 stores, answered by 9 head-office support agents.
- Average handle time: 7.5 minutes per call. At peak, 18% of calls are abandoned after waiting 5 minutes.
- Cost: about $11.40 per call handled (agent time and telephony).

Call mix (a 2-week sample of 4,800 calls, coded by store operations):
- 62% product questions (set-up, compatibility, warranty terms), answered from 1,900 product manuals
  (updated weekly by suppliers) and the Lumen warranty policy.
- 23% stock and price checks, answered from the inventory system (real-time stock and price per store).
- 9% returns and refund decisions, made by the store manager under the returns policy.
- 6% other (complaints, IT faults), passed to other teams.

Stakeholders and constraints:
- Store operations lead: staff use a store tablet; an answer must appear within 10 seconds.
- IT security lead: staff sign in with SSO; no customer personal data may be sent outside Lumen.
- Legal counsel: warranty answers must quote the warranty policy and must not promise more than it does.
- Grace Lim (COO): run cost under $4,000 a month; she reports to the board on call volume and handle time.

Systems available: the product manual library (PDF), the warranty policy, the inventory API (stock and price),
the point-of-sale system (returns), staff SSO.`;

// The figures a measurable success criterion can be anchored to (baselines from the discovery pack).
export const FIGURES = [2400, 300, 9, 7.5, 18, 11.4, 62, 23, 9, 6, 4800, 1900, 10, 4000];
export const isFigure = (v) => typeof v === "number" && FIGURES.some((f) => Math.abs(f - v) < 1e-9);

// The solution tiers from simplest to most autonomous.
export const TIERS = ["code_only", "single_call", "augmented_llm", "workflow", "agent", "multi_agent"];
export const TIER_NOTE = "code_only = no model; single_call = one prompt, no retrieval or tools; augmented_llm = one Claude call with retrieval and/or tool calls the code controls; workflow = several steps on a code-defined path; agent = Claude chooses its own steps and tools in a loop; multi_agent = a coordinator with subagents.";

// Anthropic list prices, US$ per million tokens (input, output), Nov 2026. Haiku 5.5's price is for prompts up to 100K tokens.
export const PRICES = [
  { model: "Claude Haiku 5.5", id: "claude-haiku-5-5", in: 0.10, out: 0.50 },
  { model: "Claude Sonnet 5.5", id: "claude-sonnet-5-5", in: 2, out: 10 },
  { model: "Claude Opus 5.5", id: "claude-opus-5-5", in: 4, out: 20 },
  { model: "Claude Fable 5.2", id: "claude-fable-5-2", in: 8, out: 40 },
];
// The product-support answer path: retrieved manual passages plus the question in, a short quoted answer out.
export const PER_QUERY = { input_tokens: 6000, output_tokens: 400, calls: 1 };
export const QUERIES_PER_MONTH = Math.round((2400 * 0.62 * 52) / 12);     // the 62% product questions
export const costPerQuery = (p, q = PER_QUERY) => q.calls * (q.input_tokens * p.in + q.output_tokens * p.out) / 1e6;

// The proposed design (fixed for Lab 6; only how it is presented changes).
export const DESIGN = `Proposed design: store staff ask on the store tablet (SSO). Code retrieves the best passages from the 1,900 product
manuals and the warranty policy; stock and price come from the inventory API in code; one Claude call answers from the
retrieved passages and quotes the warranty policy; low-confidence answers and refund questions go to the head-office team.`;
