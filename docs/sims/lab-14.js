// Lab 14 · Task 3.3 · Simulator 4: justify the configuration with the run's own latency and accuracy numbers.
// Six labelled requests (four live-chat questions in Malay, English, Chinese and Tamil, two BEN-HOUSING
// pre-screens). Phase 1 runs every request at effort "max". Phase 2 runs the same six through a router in code:
// chat goes to the fast path (effort "low"), pre-screens to the careful path (effort "high").
// Each phase sends its six requests in parallel and times each one; a grader scores every answer.
import { SYSTEM, ANSWER, REQUESTS, BUDGET_MS, grade, p95 } from "./shared/d3a-riverton.js";

const effortFor = (req) => (req.form === "BEN-HOUSING" ? "high" : "low");   // the router: a hard rule in code

async function ask(s, E, req, effort) {
  const t0 = Date.now();
  let r, err = null;
  try {
    r = await E.callClaude(s, { max_tokens: 4096, system: SYSTEM, messages: [{ role: "user", content: req.text }],
      output_config: { effort, format: { type: "json_schema", schema: ANSWER } } });
  } catch (e) { err = String(e.message || e); }
  const ms = Date.now() - t0;
  let value = "", reply = "";
  try { ({ value, reply } = JSON.parse(E.textOf(r?.content))); } catch { /* truncated or empty: scored wrong */ }
  return { req, effort, ms, value, reply, ok: grade(req, value), stop: r?.stop_reason || "error", out: r?.usage?.output_tokens || 0,
    think: r?.usage?.output_tokens_details?.thinking_tokens ?? null, err };
}

async function phase(s, E, routeFn) {
  const rs = await Promise.all(REQUESTS.map((q) => ask(s, E, q, routeFn(q))));
  for (const r of rs) s.log(`  ${r.req.id.padEnd(8)} ${r.req.lang.padEnd(7)} effort ${r.effort.padEnd(4)} ${String(r.ms).padStart(6)} ms · ${String(r.out).padStart(4)} output tokens · stop ${r.stop} · value "${r.value}" ${r.ok ? "✓" : `✘ (want ${r.req.expect})`}`, r.ok ? "result" : "error");
  const chat = rs.filter((r) => r.req.channel === "chat"), form = rs.filter((r) => r.req.channel === "form");
  return { rs, chat, form,
    chatP95: p95(chat.map((r) => r.ms)), formP95: p95(form.map((r) => r.ms)),
    acc: rs.filter((r) => r.ok).length, out: rs.reduce((n, r) => n + r.out, 0),
    truncated: rs.filter((r) => r.stop === "max_tokens").length };
}

const sec = (ms) => `${(ms / 1000).toFixed(1)} s`;
const replies = (n) => `${n} ${n === 1 ? "reply" : "replies"}`;

export default {
  id: 14,
  see: "Phase 1 (effort max on all six): the chat answers are right but slow, typically several seconds each with hundreds to thousands of thinking tokens, so chat p95 breaks the 4 s budget; a pre-screen can even spend the whole 4,096-token limit thinking and return nothing. Phase 2 (low for chat, high for BEN-HOUSING): chat p95 drops to about 2 s, both pre-screens stay correct, and the run uses a fraction of the output tokens.",
  try: "Change effortFor to return \"low\" for every request and rerun: does BEN-0413 (the 40% rent rule) stay correct every time? Then set BUDGET_MS.chat to 2000 and see which configuration still fits. The numbers you get are the justification; carry none over from another model or prompt.",
  explain: "Effort controls how many output tokens Claude spends, including thinking, and output tokens are most of the time a reply takes. Max effort on a question like \"which day is bin day in Zone 3\" buys nothing: the answer is already right at low effort, so the extra thinking is pure latency. The budget comes from the moment: a resident in live chat expects an answer in a few seconds, while a pre-screen form can show a \"checking\" page for longer, and a wrong eligibility result matters more than a slow bin-day answer. So the router in code sends chat to effort low and pre-screens to effort high, and the run itself is the justification: chat p95 against its 4 s budget, form p95 against 15 s, accuracy on the labelled set, and output tokens. Low everywhere (option B) gives up the margin on the consequential path for a saving it doesn't need; streaming (C) hides the wait but not the time or cost; a larger model (D) is slower and dearer, not faster.",
  scene: {
    title: "Six Riverton requests: bin days and permits in four languages, two rent pre-screens",
    caption: "Both phases send the same six labelled requests with the same prompt. Only the effort each request runs at differs.",
    lanes: [
      { key: "p1", label: "Phase 1 · effort max on every request", sub: "the most thinking, everywhere", tone: "trap", on: /Phase 1/, stages: [
        { id: "a_in", icon: "📥", t: "6 labelled requests", s: "4 chat (ms, en, zh, ta) · 2 BEN-HOUSING forms" },
        { id: "a_cfg", icon: "🎚", t: "effort: max", s: "for every request, whatever it is", diff: true },
        { id: "a_claude", icon: "🤖", t: "Claude Haiku 5.5", s: "JSON answer: value + plain-language reply", claude: true },
        { id: "a_chat", icon: "💬", t: "Chat p95 vs 4 s budget", s: "want: within budget, all correct", out: true },
        { id: "a_form", icon: "🧾", t: "Pre-screens vs 15 s budget", s: "want: within budget, both correct", out: true } ] },
      { key: "p2", label: "Phase 2 · routed: fast path and careful path", sub: "chat low, BEN-HOUSING high", tone: "fix", on: /Phase 2/, stages: [
        { id: "b_in", icon: "📥", t: "6 labelled requests", s: "the same six, the same prompt" },
        { id: "b_cfg", icon: "🔀", t: "Router in code", s: "chat -> effort low · BEN form -> effort high", diff: true },
        { id: "b_claude", icon: "🤖", t: "Claude Haiku 5.5", s: "JSON answer: value + plain-language reply", claude: true },
        { id: "b_chat", icon: "💬", t: "Chat p95 vs 4 s budget", s: "want: within budget, all correct", out: true },
        { id: "b_form", icon: "🧾", t: "Pre-screens vs 15 s budget", s: "want: within budget, both correct", out: true } ] },
    ],
  },
  slide: {
    title: "Budget per moment; effort per request class",
    code: `BUDGET_MS = {"chat": 4000, "form": 15000}         # KEY 1

def effort_for(req):                               # KEY 2
    return "high" if req.form == "BEN-HOUSING" else "low"

resp = client.messages.create(
    model="claude-haiku-5-5", max_tokens=4096,
    system=FACTS,
    output_config={"effort": effort_for(req),     # KEY 3
                   "format": {"type": "json_schema",
                              "schema": ANSWER}},
    messages=[{"role": "user", "content": req.text}])

ship_if(acc >= BAR and p95(chat) <= BUDGET_MS["chat"])  # KEY 4`,
    keys: [["1", "Budget from the moment", "Live chat waits seconds; a pre-screen form can wait longer."],
           ["2", "Route in code", "A hard rule picks the path, not the model's guess."],
           ["3", "Effort sets the tokens", "Thinking and output tokens are most of the latency."],
           ["4", "Justify with measurements", "Accuracy and p95 on a labelled set, per path."]],
  },
  async run(s, E) {
    s.log(`Eval set: ${REQUESTS.length} labelled requests · budgets: chat p95 ≤ ${sec(BUDGET_MS.chat)}, BEN-HOUSING pre-screen ≤ ${sec(BUDGET_MS.form)}`, "note");
    s.log("== Phase 1 · effort max on every request (the six run in parallel, each timed)", "note");
    s.show("a_in", "4 chat · 2 pre-screens", "done");
    s.show("a_cfg", "max × 6", "done");
    const p1 = await phase(s, E, () => "max");
    const okChat1 = p1.chatP95 <= BUDGET_MS.chat && p1.chat.every((r) => r.ok), okForm1 = p1.formP95 <= BUDGET_MS.form && p1.form.every((r) => r.ok);
    s.show("a_chat", `p95 ${sec(p1.chatP95)} · ${p1.chat.filter((r) => r.ok).length}/4 correct`, okChat1 ? "good" : "bad");
    s.show("a_form", `p95 ${sec(p1.formP95)} · ${p1.form.filter((r) => r.ok).length}/2 correct${p1.form.some((r) => r.stop === "max_tokens") ? ` · ${p1.form.filter((r) => r.stop === "max_tokens").length} cut off` : ""}`, okForm1 ? "good" : "bad");
    s.log(`Phase 1 result: chat p95 ${sec(p1.chatP95)} (budget ${sec(BUDGET_MS.chat)}), pre-screen p95 ${sec(p1.formP95)}, accuracy ${p1.acc}/6, ${p1.out} output tokens${p1.truncated ? `, ${replies(p1.truncated)} cut off at max_tokens while thinking` : ""}.`, "note");
    await s.pause({
      title: "Phase 1 finished: effort max on every request",
      outcome: `Chat p95 **${sec(p1.chatP95)}** against a ${sec(BUDGET_MS.chat)} budget${p1.chatP95 > BUDGET_MS.chat ? " (**over budget**)" : ""}; accuracy **${p1.acc}/6**; **${p1.out} output tokens**, most of them thinking${p1.truncated ? `; **${replies(p1.truncated)} spent all 4,096 tokens thinking and returned no answer**` : ""}.`,
      next: "Phase 2: the same six requests through a router: chat at effort low, pre-screens at effort high",
    });

    s.log("== Phase 2 · router in code: chat -> effort low (fast path), BEN-HOUSING -> effort high (careful path)", "note");
    s.show("b_in", "4 chat · 2 pre-screens", "done");
    s.show("b_cfg", "low × 4 · high × 2", "done");
    const p2 = await phase(s, E, effortFor);
    const okChat2 = p2.chatP95 <= BUDGET_MS.chat && p2.chat.every((r) => r.ok), okForm2 = p2.formP95 <= BUDGET_MS.form && p2.form.every((r) => r.ok);
    s.show("b_chat", `p95 ${sec(p2.chatP95)} · ${p2.chat.filter((r) => r.ok).length}/4 correct`, okChat2 ? "good" : "bad");
    s.show("b_form", `p95 ${sec(p2.formP95)} · ${p2.form.filter((r) => r.ok).length}/2 correct`, okForm2 ? "good" : "bad");
    s.log(`Phase 2 result: chat p95 ${sec(p2.chatP95)}, pre-screen p95 ${sec(p2.formP95)}, accuracy ${p2.acc}/6, ${p2.out} output tokens (${Math.round((100 * p2.out) / Math.max(1, p1.out))}% of Phase 1).`, "note");

    // The router's decisions as they were really sent: read back from the request bodies.
    const sent = s.requests.slice(-REQUESTS.length).map((b) => ({ effort: b.output_config?.effort, text: b.messages[0].content }));
    const routedOk = REQUESTS.every((q) => sent.find((x) => x.text === q.text)?.effort === effortFor(q));
    const final = p2.rs.map((r) => `${r.req.id} (${r.req.lang}, effort ${r.effort}, ${sec(r.ms)}): ${r.reply || "(no answer)"}`).join("\n");

    return {
      final,
      compare: {
        cols: [
          { title: "Phase 1: effort max on every request", short: "Max everywhere", tone: "trap", said: p1.rs.map((r) => `${r.req.id}: ${r.value || "(no answer)"}`).join(" · "),
            verdict: `Chat p95 **${sec(p1.chatP95)}**${p1.chatP95 > BUDGET_MS.chat ? ", over the 4 s budget" : ""}, accuracy ${p1.acc}/6, ${p1.out} output tokens${p1.truncated ? `, ${p1.truncated} ${p1.truncated === 1 ? "answer" : "answers"} lost to thinking past max_tokens` : ""}.${p2.chat.every((r) => r.ok) ? " The extra thinking bought no accuracy on the chat questions: low effort got all four right." : ""}` },
          { title: "Phase 2: routed, low for chat, high for pre-screens", short: "Routed", tone: "fix", said: p2.rs.map((r) => `${r.req.id}: ${r.value || "(no answer)"}`).join(" · "),
            verdict: `Chat p95 **${sec(p2.chatP95)}** within budget, pre-screens ${sec(p2.formP95)}, accuracy ${p2.acc}/6, ${p2.out} output tokens (${Math.round((100 * p2.out) / Math.max(1, p1.out))}% of Phase 1). Each number is this run's own measurement.` },
        ],
        rows: [
          ["Effort per request", "max × 6", { v: "low × 4 chat · high × 2 forms", tone: "good" }],
          ["Chat p95 (budget 4.0 s)", { v: sec(p1.chatP95), tone: p1.chatP95 <= BUDGET_MS.chat ? "good" : "bad" }, { v: sec(p2.chatP95), tone: p2.chatP95 <= BUDGET_MS.chat ? "good" : "bad" }],
          ["Pre-screen p95 (budget 15.0 s)", { v: sec(p1.formP95), tone: p1.formP95 <= BUDGET_MS.form ? "good" : "bad" }, { v: sec(p2.formP95), tone: p2.formP95 <= BUDGET_MS.form ? "good" : "bad" }],
          ["Accuracy on the labelled set", { v: `${p1.acc}/6`, tone: p1.acc === 6 ? "good" : "bad" }, { v: `${p2.acc}/6`, tone: p2.acc === 6 ? "good" : "bad" }],
          ["Output tokens (thinking included)", String(p1.out), String(p2.out)],
          ["Replies cut off at max_tokens", { v: String(p1.truncated), tone: p1.truncated ? "bad" : "good" }, { v: String(p2.truncated), tone: p2.truncated ? "bad" : "good" }],
        ],
        note: "Same six requests, same prompt, same model. The configuration is justified by this table: each path's p95 against the budget of its own moment, and accuracy on a labelled set. Latency varies run to run; the token counts show where the time goes.",
      },
      checks: [
        E.check("Phase 1: effort max put chat p95 over the 4 s budget", p1.chatP95 > BUDGET_MS.chat),
        E.check("Phase 2: the router sent all 4 chat questions at effort low and both BEN-HOUSING pre-screens at effort high", routedOk),
        E.check("Phase 2: chat p95 within the 4 s budget and pre-screens within 15 s", p2.chatP95 <= BUDGET_MS.chat && p2.formP95 <= BUDGET_MS.form),
        E.check("Phase 2: accuracy on the labelled set is 6/6 and no lower than Phase 1", p2.acc === 6 && p2.acc >= p1.acc),
        E.check("Phase 2 used under a third of Phase 1's output tokens", p2.out * 3 < p1.out),
      ],
    };
  },
};
