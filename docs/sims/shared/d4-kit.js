// Domain 4 labs (20-25): small helpers shared by the evaluation, testing and optimisation labs.
// Every Claude call still goes through E.callClaude (model claude-haiku-5-5, pinned in engine.js).

// Haiku 5.5 list prices, US$ per token (prompts up to 100K tokens). Cache writes cost 1.25x input, reads 0.1x.
export const HAIKU = { in: 0.10 / 1e6, out: 0.50 / 1e6, write: 0.125 / 1e6, read: 0.01 / 1e6 };

// The true cost of one response from its usage block, cache writes and reads included.
export const costOf = (u = {}) =>
  (u.input_tokens || 0) * HAIKU.in + (u.output_tokens || 0) * HAIKU.out +
  (u.cache_creation_input_tokens || 0) * HAIKU.write + (u.cache_read_input_tokens || 0) * HAIKU.read;

export const usd = (x, d = 5) => `US$${x.toFixed(d)}`;

// Nearest-rank percentile. With a handful of items p95 is simply the slowest one: say so where it is shown.
export function pct(xs, p) {
  const a = [...xs].sort((x, y) => x - y);
  if (!a.length) return 0;
  return a[Math.min(a.length - 1, Math.max(0, Math.ceil((p / 100) * a.length) - 1))];
}

export function tryJson(t) {
  if (!t) return null;
  try { return JSON.parse(t); } catch {}
  const m = String(t).match(/\{[\s\S]*\}/);
  if (m) { try { return JSON.parse(m[0]); } catch {} }
  return null;
}

// One labelled Claude call (no tools): logs it, times it, records it in the turn-by-turn trace, returns
// { text, json, resp, usage, ms, cost }. The page lights the lane's Claude stage on every request.
export async function ask(s, E, { label, system, prompt, messages, max_tokens = 2048, output_config, quiet }) {
  s.log(`    ${label} · POST /v1/messages · model ${E.MODEL}`, "turn");
  const t0 = Date.now();
  const resp = await E.callClaude(s, {
    ...(system ? { system } : {}),
    messages: messages || [{ role: "user", content: prompt }],
    max_tokens,
    ...(output_config ? { output_config } : {}),
  });
  const ms = Date.now() - t0;
  const text = E.textOf(resp.content).trim();
  const u = resp.usage || {};
  s.trace.push({ label, turn: 1, stop_reason: resp.stop_reason, tools: [], text });
  const cache = (u.cache_creation_input_tokens || u.cache_read_input_tokens)
    ? ` · cache write ${u.cache_creation_input_tokens || 0} / read ${u.cache_read_input_tokens || 0}` : "";
  s.log(`      stop_reason: ${resp.stop_reason} · ${u.input_tokens} in / ${u.output_tokens} out${cache} · ${ms} ms`, "stop");
  if (!quiet && text) s.log(`      ${label}: ${E.short(text, 260)}`, "reply");
  return { text, json: output_config ? tryJson(text) : null, resp, usage: u, ms, cost: costOf(u) };
}

// Minimal JSON-schema check for the flat schemas these labs use (type, required, enum, items, properties).
export function fits(v, sc) {
  if (!sc) return true;
  if (sc.enum && !sc.enum.includes(v)) return false;
  if (sc.type === "object") {
    if (!v || typeof v !== "object" || Array.isArray(v)) return false;
    for (const k of sc.required || []) if (!(k in v)) return false;
    for (const [k, sub] of Object.entries(sc.properties || {})) if (k in v && !fits(v[k], sub)) return false;
    if (sc.additionalProperties === false) for (const k of Object.keys(v)) if (!(k in (sc.properties || {}))) return false;
    return true;
  }
  if (sc.type === "array") return Array.isArray(v) && v.every((x) => fits(x, sc.items));
  if (sc.type === "string") return typeof v === "string";
  if (sc.type === "number") return typeof v === "number";
  if (sc.type === "integer") return Number.isInteger(v);
  if (sc.type === "boolean") return typeof v === "boolean";
  return true;
}

// A tiny keyword retriever (BM25-style scoring) over chunks { id, doc_id, text, ... }.
const STOP = new Set("a an the of to in for on and or is are be can do does how what when which who with my our i we at by as it its this that from per if any".split(" "));
export const tokens = (t) => String(t).toLowerCase().replace(/[^a-z0-9%$. ]/g, " ").split(/\s+/).map((w) => w.replace(/\.$/, "")).filter((w) => w && !STOP.has(w));
export function retrieve(chunks, query, k = 2) {
  const docs = chunks.map((c) => ({ c, toks: tokens(`${c.title || ""} ${c.text}`) }));
  const avg = docs.reduce((n, d) => n + d.toks.length, 0) / Math.max(1, docs.length);
  const q = [...new Set(tokens(query))];
  const df = Object.fromEntries(q.map((w) => [w, docs.filter((d) => d.toks.includes(w)).length]));
  const scored = docs.map((d) => {
    let sc = 0;
    for (const w of q) {
      const tf = d.toks.filter((x) => x === w).length; if (!tf) continue;
      const idf = Math.log(1 + (docs.length - df[w] + 0.5) / (df[w] + 0.5));
      sc += idf * (tf * 2.2) / (tf + 1.2 * (0.25 + 0.75 * d.toks.length / avg));
    }
    return { ...d.c, score: +sc.toFixed(2) };
  });
  return scored.sort((a, b) => b.score - a.score).slice(0, k);
}
