// Domain 1 helpers (Labs 1-6): one structured Claude pass, run through the engine's loop so the page
// draws it, logs it and traces it like any other run.

// A JSON schema object with every property required and no extras (what structured outputs needs).
export const obj = (properties, required = Object.keys(properties)) => ({ type: "object", additionalProperties: false, properties, required });
export const str = (description) => (description ? { type: "string", description } : { type: "string" });
export const num = (description) => (description ? { type: "number", description } : { type: "number" });
export const numOrNull = (description) => ({ type: ["number", "null"], ...(description ? { description } : {}) });
export const arr = (items, description) => ({ type: "array", items, ...(description ? { description } : {}) });
export const oneOf = (values, description) => ({ type: "string", enum: values, ...(description ? { description } : {}) });

// One Claude pass that must return JSON matching `schema`. Returns { data, text, ok }.
// A label makes the run a "pass" on the page (its own box in a passes diagram).
export async function pass(s, E, { label, system, prompt, schema, max_tokens = 2048 }) {
  const run = await E.runAgent(s, {
    label, system, prompt, maxTurns: 1, max_tokens,
    output_config: { format: { type: "json_schema", schema } },
  });
  let data = null;
  try { data = JSON.parse(run.text); } catch { data = null; }
  return { data, text: run.text, ok: !!data, run };
}

export const plural = (n, word, many = word + "s") => `${n} ${n === 1 ? word : many}`;
export const money = (v) => `$${Number(v).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
