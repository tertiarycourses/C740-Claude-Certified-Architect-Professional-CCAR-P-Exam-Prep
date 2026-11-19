// One structured-output Claude call for the Domain 5 labs (26-30), drawn on the page like an agent run:
// it reports start / turn / end through s.agent, adds a trace entry, and returns the parsed JSON (or null).
export async function structured(s, E, { label, system, user, schema, thinking, max_tokens = 2048 }) {
  s.agent?.({ event: "start", label });
  s.log(`    ${label}: POST /v1/messages · model ${E.MODEL} · output_config json_schema${thinking ? ` · thinking ${thinking.type}` : ""}`, "turn");
  await s.step("call");
  const r = await E.callClaude(s, {
    system, max_tokens, ...(thinking ? { thinking } : {}),
    output_config: { format: { type: "json_schema", schema } },
    messages: [{ role: "user", content: user }],
  });
  const text = E.textOf(r.content);
  let out = null; try { out = JSON.parse(text); } catch { out = null; }
  const t = { label, turn: 1, stop_reason: r.stop_reason, tools: [], text };
  s.trace.push(t);
  s.agent?.({ event: "turn", ...t });
  await s.step("stop");
  s.agent?.({ event: "end", label, stop_reason: r.stop_reason, turns: 1, calls: 0, denied: 0 });
  return { out, text, stop_reason: r.stop_reason, usage: r.usage };
}
