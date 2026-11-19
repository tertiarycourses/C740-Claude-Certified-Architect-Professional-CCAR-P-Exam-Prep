// Lab 10 · Task 2.4 · Simulator 3: select the sections, cap the output; don't stuff the record.
// Dr Osei needs a cardiology referral for Patient A (MRN 00-4417). Same record, same request, two designs:
//   1. the whole 17-year record (82 sections) goes into the context, and the letter is uncapped;
//   2. a cheap selection pass over the record INDEX picks the sections the referral needs (minimum necessary),
//      code loads only those, and the letter is drafted to a fixed outline and word limit.
import { NEEDED, SENSITIVE, RECORD, fullRecord, selectedRecord, recordIndex, KEY_FACTS, LEAKS, PATIENT } from "./shared/d2-meridian.js";
import { usd, money, n0 } from "./shared/d2-pricing.js";

const SYSTEM = "You are Meridian Health's clinical documentation assistant. You draft letters for a clinician to review and sign. Use only facts in the record provided. Never invent results.";
const TASK = `Draft a referral letter from Dr R. Osei (GP) to the cardiology rapid-access chest pain clinic for ${PATIENT.name}, MRN ${PATIENT.mrn}.`;
const OUTLINE = "Write at most 180 words under these headings: Reason for referral; Presenting complaint; Relevant history and risk factors; Current medications; Allergies; Recent results; Question for the cardiologist. Include only what the cardiologist needs.";
const SELECT_SCHEMA = { type: "object", additionalProperties: false, required: ["section_ids"],
  properties: { section_ids: { type: "array", items: { type: "string" }, description: "ids of the sections the referral needs, at most 12" } } };

const words = (t) => (t.match(/\S+/g) || []).length;
const facts = (t) => KEY_FACTS.filter(([, re]) => re.test(t)).map(([k]) => k);
const leaks = (t) => LEAKS.filter(([, re]) => re.test(t)).map(([k]) => k);

export default {
  id: 10,
  see: "Phase 1 sends all 82 sections of Patient A's record (about 12,000 tokens) for a letter that needs five of them, and gets a long letter that may carry unrelated history. Phase 2 sends the record index to a selection pass, loads only the sections it picks, and drafts to a 180-word outline: about a third of the input tokens, a letter under half the length, and no psychiatric or sexual-health history.",
  try: "Remove \"Include only what the cardiologist needs\" from OUTLINE and add V-2009-05-11 to the selected ids in run(): the 2009 depression episode now reaches the letter, because what is in the context gets used. Then change the selection prompt to ask for \"everything that might be useful\" and watch the input tokens climb back.",
  explain: "Every current Claude model accepts a 1M-token context, so the record always fits. Fitting is not the question: every token in the context costs money on every call, competes for the model's attention, and is a chance to repeat something the reader should not see. The referral needs the problem list, current medicines, allergies, the chest-pain visit and its bloods. A selection pass over the record's index (titles and dates, no clinical text) picks those, code loads only them, and the letter is drafted to a fixed outline with a word limit. Input tokens fall to a fraction, the output is bounded, and HIPAA's minimum-necessary standard is met by design rather than by hoping the model leaves the 2009 psychiatry note out.",
  scene: {
    title: "Patient A needs a cardiology referral. Does the letter need 17 years of notes?",
    caption: "Both phases use the same record, the same request and the same model. Only what goes into the context, and the outline of the output, change.",
    lanes: [
      { key: "in", label: "MRN 00-4417", sub: "one synthetic record, 2009 to 2026", stages: [
        { id: "rec", icon: "🗂", t: "82 record sections", s: "visits, results, routine care, 2 sensitive notes" },
        { id: "need", icon: "🎯", t: "5 sections needed", s: "problems · meds · allergies · chest-pain visit · bloods" },
        { id: "ask", icon: "✉", t: "Referral to cardiology", s: "rapid-access chest pain clinic" } ] },
      { key: "p1", label: "Phase 1 · stuff the whole record", sub: "all 82 sections in, no outline or length limit", tone: "trap", on: /Phase 1/, stages: [
        { id: "a_ctx", icon: "📥", t: "Whole record in context", s: "every section, oldest first", diff: true },
        { id: "a_draft", icon: "🤖", t: "Draft the letter", s: "one call, uncapped", claude: true },
        { id: "a_tok", icon: "🔢", t: "Tokens used", s: "usage.input_tokens · output_tokens" },
        { id: "a_out", icon: "📄", t: "Referral letter", s: "want: key facts, nothing unrelated", out: true } ] },
      { key: "p2", label: "Phase 2 · select, then draft to a cap", sub: "index → chosen sections → 180-word outline", tone: "fix", on: /Phase 2/, stages: [
        { id: "b_sel", icon: "🔎", t: "Select from the index", s: "ids, dates, titles only: no clinical text", claude: true, diff: true },
        { id: "b_ctx", icon: "📥", t: "Chosen sections only", s: "code loads the ids the selector returned" },
        { id: "b_draft", icon: "🤖", t: "Draft to the outline", s: "7 headings, at most 180 words, thinking off", claude: true },
        { id: "b_tok", icon: "🔢", t: "Tokens used", s: "both calls added together" },
        { id: "b_out", icon: "📄", t: "Referral letter", s: "want: key facts, nothing unrelated", out: true } ] },
    ],
  },
  slide: {
    title: "Select what the task needs, then cap what comes back",
    code: `index = [(s.id, s.date, s.type, s.title)       # KEY 1
         for s in record.sections]          # no clinical text
picked = claude(index, task="cardiology referral",
                schema={"section_ids": [str]})
context = [record[i] for i in picked.section_ids
           if i in record]                  # KEY 2
letter = client.messages.create(
    model="claude-haiku-5-5", max_tokens=1500,
    thinking={"type": "disabled"},  # a formatting task
    messages=[{"role": "user", "content":
        render(context) + TASK +
        "At most 180 words under 7 headings"}])  # KEY 3
log(picked.usage.input_tokens               # KEY 4
    + letter.usage.input_tokens, letter.usage.output_tokens)`,
    keys: [["1", "Choose from an index", "Titles and dates are enough to pick sections."],
           ["2", "Code loads only those", "The rest of the record never reaches the call."],
           ["3", "Bound the output", "Outline, word limit, max_tokens; no thinking needed."],
           ["4", "Measure in usage tokens", "Compare designs on input and output tokens."]],
  },
  async run(s, E) {
    s.log(`Meridian · ${PATIENT.name} (MRN ${PATIENT.mrn}) · a cardiology referral after new exertional chest tightness. The record holds ${RECORD.length} sections from 2009 to 2026.`, "note");
    s.show("rec", `${RECORD.length} sections, 2009 to 2026`, "done");
    s.show("need", NEEDED.join(" · "), "done");
    s.show("ask", "Dr Osei → chest pain clinic", "done");

    // Phase 1: everything in, no outline, no limit.
    s.log("== Phase 1 · stuff the whole record into the context, no outline or length limit", "note");
    s.show("a_ctx", `all ${RECORD.length} sections`, "done");
    const r1 = await E.callClaude(s, { system: SYSTEM, max_tokens: 4096, messages: [{ role: "user", content: `${fullRecord()}\n\n${TASK}` }] });
    const l1 = E.textOf(r1.content).trim();
    s.log(`  usage: input_tokens ${n0(r1.usage.input_tokens)} · output_tokens ${n0(r1.usage.output_tokens)} · stop_reason ${r1.stop_reason} · letter ${words(l1)} words`, "result");
    s.log(`  Letter: ${E.short(l1, 400)}`, "reply");
    const f1 = facts(l1), k1 = leaks(l1);
    s.show("a_draft", `${words(l1)}-word letter · ${r1.stop_reason}`, "done");
    s.show("a_tok", `${n0(r1.usage.input_tokens)} in · ${n0(r1.usage.output_tokens)} out`, "done");
    s.show("a_out", k1.length ? `${words(l1)} words; also: ${k1.join(", ")}` : `${words(l1)} words, ${f1.length}/5 key facts`, "bad");
    await s.pause({
      title: "Phase 1 finished: the whole record in the context",
      outcome: `The call sent **${n0(r1.usage.input_tokens)} input tokens**: all ${RECORD.length} sections, for a letter that needs ${NEEDED.length} of them. The letter ran to **${words(l1)} words** (${n0(r1.usage.output_tokens)} output tokens)` +
        (k1.length ? ` and carried unrelated history: **${k1.join(", ")}**.` : ", and this time it left the unrelated history out, but every one of those notes was in the context and could have reached the clinic."),
      next: "Phase 2: pick the sections from the record index, then draft to a 180-word outline",
    });

    // Phase 2: select from the index, load only those sections, draft to an outline and a word limit.
    s.log("== Phase 2 · select sections from the record index, load only those, draft to a 180-word outline", "note");
    const r2a = await E.callClaude(s, { system: SYSTEM, max_tokens: 1024,
      output_config: { format: { type: "json_schema", schema: SELECT_SCHEMA }, effort: "low" },
      messages: [{ role: "user", content: `Record index for ${PATIENT.name} (id, month, type: title):\n${recordIndex()}\n\nTask: ${TASK}\nReturn the ids of the sections this referral needs. Apply the minimum-necessary standard: include what a cardiologist needs to triage this chest pain, and leave out unrelated history. At most 12 ids.` }] });
    let picked = [];
    try { picked = JSON.parse(E.textOf(r2a.content)).section_ids || []; } catch { picked = []; }
    const ids = [...new Set(picked)].filter((id) => RECORD.some((r) => r.id === id)).slice(0, 12);
    s.log(`  Selector: input_tokens ${n0(r2a.usage.input_tokens)} · output_tokens ${n0(r2a.usage.output_tokens)} · picked ${ids.length}: ${ids.join(", ")}`, "result");
    const missing = NEEDED.filter((id) => !ids.includes(id)), sens = SENSITIVE.filter((id) => ids.includes(id));
    s.show("b_sel", `${ids.length} ids${missing.length ? `, missing ${missing.join(", ")}` : ", all 5 needed"}`, "done");
    s.show("b_ctx", `${ids.length} of ${RECORD.length} sections loaded`, "done");
    const r2b = await E.callClaude(s, { system: SYSTEM, max_tokens: 1500, thinking: { type: "disabled" }, messages: [{ role: "user", content: `${selectedRecord(ids)}\n\n${TASK}\n${OUTLINE}` }] });
    const l2 = E.textOf(r2b.content).trim();
    s.log(`  Drafter: input_tokens ${n0(r2b.usage.input_tokens)} · output_tokens ${n0(r2b.usage.output_tokens)} · stop_reason ${r2b.stop_reason} · letter ${words(l2)} words`, "result");
    s.log(`  Letter: ${E.short(l2, 400)}`, "reply");
    const f2 = facts(l2), k2 = leaks(l2);
    const in2 = r2a.usage.input_tokens + r2b.usage.input_tokens, out2 = r2a.usage.output_tokens + r2b.usage.output_tokens;
    const ratio = in2 / r1.usage.input_tokens;
    s.show("b_draft", `${words(l2)}-word letter · ${r2b.stop_reason}`, "done");
    s.show("b_tok", `${n0(in2)} in (${Math.round(ratio * 100)}%) · ${n0(out2)} out`, "done");
    const good2 = f2.length === KEY_FACTS.length && !k2.length && words(l2) <= 250;
    s.show("b_out", `${words(l2)} words, ${f2.length}/5 key facts${k2.length ? `; also ${k2.join(", ")}` : ", nothing unrelated"}`, good2 ? "good" : "bad");

    const c1 = usd(r1.usage), c2 = usd(r2a.usage) + usd(r2b.usage);
    s.log(`== Result: input tokens ${n0(r1.usage.input_tokens)} → ${n0(in2)} (${Math.round(ratio * 100)}%) · letter ${words(l1)} → ${words(l2)} words · cost ${money(c1)} → ${money(c2)}`, "note");
    const tone = (ok) => (ok ? "good" : "bad");
    return {
      final: l2,
      compare: {
        cols: [
          { title: "Phase 1: whole record, no limit", short: "Stuff the record", tone: "trap", said: l1,
            verdict: `${n0(r1.usage.input_tokens)} input tokens for a letter that needs 5 of ${RECORD.length} sections; ${words(l1)} words` + (k1.length ? `, carrying **${k1.join(", ")}**.` : ". Unrelated notes stayed out this time, but nothing kept them out.") },
          { title: "Phase 2: select from the index, draft to an outline", short: "Select + cap", tone: "fix", said: l2,
            verdict: good2 ? `${n0(in2)} input tokens across both calls (**${Math.round(ratio * 100)}%** of phase 1), a ${words(l2)}-word letter with all 5 key facts and nothing unrelated.`
              : `${n0(in2)} input tokens, ${words(l2)} words, ${f2.length}/5 key facts${k2.length ? `, also ${k2.join(", ")}` : ""}. Read the live output: Claude writes each run fresh.` },
        ],
        rows: [
          ["Sections in the context", `${RECORD.length} (all)`, { v: `${ids.length} chosen`, tone: tone(!missing.length && !sens.length) }],
          ["Input tokens (usage.input_tokens)", n0(r1.usage.input_tokens), { v: `${n0(in2)} (${Math.round(ratio * 100)}%)`, tone: tone(ratio < 0.4) }],
          ["Output tokens (incl. thinking) · letter length", `${n0(r1.usage.output_tokens)} · ${words(l1)} words`, { v: `${n0(out2)} · ${words(l2)} words`, tone: tone(words(l2) <= 250) }],
          ["Key facts (chest pain, T-waves, troponin, penicillin, aspirin)", `${f1.length}/5`, { v: `${f2.length}/5`, tone: tone(f2.length === 5) }],
          ["Unrelated history in the letter", { v: k1.join(", ") || "none this run", tone: tone(!k1.length) }, { v: k2.join(", ") || "none", tone: tone(!k2.length) }],
          ["Cost of the design (Haiku 5.5)", money(c1), money(c2)],
        ],
        note: "Same record, same request, same model. Phase 2 adds one cheap call over the index and still sends a fraction of the tokens. On a bigger tier, or on every turn of an agent loop, the gap is multiplied.",
      },
      checks: [
        E.check(`Phase 1 sent the whole record (${n0(r1.usage.input_tokens)} input tokens) and its letter carried unrelated history (${k1.length} item${k1.length === 1 ? "" : "s"})`, r1.usage.input_tokens >= 10000 && k1.length >= 1),
        E.check("Phase 2: the selection kept all 5 needed sections and neither sensitive note (2009 psychiatry, 2014 sexual health)", !missing.length && !sens.length),
        E.check(`Phase 2 used under 40% of phase 1's input tokens (${Math.round(ratio * 100)}%)`, ratio < 0.4),
        E.check(`Phase 2: the letter finished within the cap (end_turn, ${words(l2)} words with headings, under half of phase 1's ${words(l1)})`, r2b.stop_reason === "end_turn" && words(l2) <= 250 && words(l2) < words(l1) / 2),
        E.check("Phase 2: the letter carries all 5 key facts and none of the unrelated history", f2.length === KEY_FACTS.length && !k2.length),
      ],
    };
  },
};
