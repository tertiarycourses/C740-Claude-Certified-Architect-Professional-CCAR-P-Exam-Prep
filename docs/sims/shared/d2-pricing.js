// Domain 2 labs: list prices for pricing model choices and cached prompts. The labs only ever CALL
// claude-haiku-5-5; bigger tiers are priced from this table, never called.
// Anthropic list prices, US$ per million tokens (input / output), Nov 2026. All four have a 1M context.
export const MODELS = {
  fable: { id: "claude-fable-5-2", name: "Claude Fable 5.2", in: 8, out: 40 },
  opus: { id: "claude-opus-5-5", name: "Claude Opus 5.5", in: 4, out: 20 },
  sonnet: { id: "claude-sonnet-5-5", name: "Claude Sonnet 5.5", in: 2, out: 10 },
  haiku: { id: "claude-haiku-5-5", name: "Claude Haiku 5.5", in: 0.10, out: 0.50 },   // prompts up to 100K tokens
};
export const CACHE = { write: 1.25, read: 0.1 };   // 5-minute cache: a write costs 1.25x input, a read 0.1x

// US$ for one response's usage block on a given tier, counting cache writes and reads at their own rates.
export function usd(usage, tier = "haiku") {
  const m = MODELS[tier], u = usage || {};
  return ((u.input_tokens || 0) * m.in
    + (u.cache_creation_input_tokens || 0) * m.in * CACHE.write
    + (u.cache_read_input_tokens || 0) * m.in * CACHE.read
    + (u.output_tokens || 0) * m.out) / 1e6;
}
// The same price for a plain token count.
export const usdTokens = (inTok, outTok, tier = "haiku") => (inTok * MODELS[tier].in + outTok * MODELS[tier].out) / 1e6;
export const money = (x) => (x >= 100 ? `US$${Math.round(x).toLocaleString("en-US")}` : x >= 1 ? `US$${x.toFixed(2)}` : `US$${x.toFixed(4)}`);
export const n0 = (x) => Math.round(x).toLocaleString("en-US");
