// Lab 23 · Task 4.4 · Simulator 2 (Northwind Policy Assistant) · official exam guide sample question 3.
// After the 17 Nov re-index the assistant gives confident, cited, wrong answers; model and latency are unchanged.
// The re-index job timed out on LEND-07 and HR-09 and kept last week's vectors, so retrieval serves stale chunks.
// Phase 1 "fixes" the prompt: still wrong, because the right text never reaches Claude. Phase 2 inspects what was
// retrieved (chunk ids, versions, index dates) against the library manifest, lets Claude diagnose from that evidence,
// re-indexes the stale documents and asks again with the ORIGINAL prompt.
import { ask } from "./shared/d4-kit.js";
import { MANIFEST, brokenIndex, reindex, search, extracts } from "./shared/d4-northwind.js";

const PROD_PROMPT = "You are Northwind Bank's internal policy assistant. Answer only from the policy extracts provided, in at most three sentences. " +
  "Cite the document id in square brackets, e.g. [LEND-07]. If the extracts do not answer the question, say so.";
const PATCHED_PROMPT = PROD_PROMPT + " Policies change every week: use only the most recent policy version, double-check every number before you answer, and if you are unsure, say so.";

const QUESTIONS = [
  { id: "QA", role: "credit officer", doc: "LEND-07", q: "A customer earns S$9,000 a month. Under our TDSR rule, what is the most their total monthly debt repayments can be, including the new mortgage?",
    now: /4,?950|55\s?%/, stale: /5,?400|60\s?%/, nowText: "55% → S$4,950", staleText: "60% → S$5,400" },
  { id: "QB", role: "credit officer", doc: "HR-09", q: "How many days a week can I work from home?",
    now: /\b(3|three)\b/i, stale: /\b(2|two)\b/i, nowText: "3 days", staleText: "2 days" },
];
const DIAG_SCHEMA = { type: "object", additionalProperties: false, required: ["first_place", "evidence", "next_step"], properties: {
  first_place: { type: "string", enum: ["model_weights", "prompt", "retrieval_index", "temperature", "context_window"] },
  evidence: { type: "array", items: { type: "string" } }, next_step: { type: "string" } } };

// Judge an answer by which version of the fact it states (current, stale, or neither).
const verdict = (it, a) => (it.now.test(a) && !it.stale.test(a) ? "current" : it.stale.test(a) && !it.now.test(a) ? "stale" : it.now.test(a) ? "both" : "neither");

async function answerAll(s, E, index, system, tag) {
  const out = [];
  for (const it of QUESTIONS) {
    const hits = search(index, it.q, it.role, 2);
    s.log(`${it.id} · retrieved ${hits.map((h) => `${h.id} (v${h.version}, indexed ${h.indexed_at})`).join(", ")}`, "note");
    const r = await ask(s, E, { label: `${tag} ${it.id}`, system, max_tokens: 1024, prompt: `Staff question (${it.role}): ${it.q}\n\nPolicy extracts:\n${extracts(hits)}` });
    out.push({ it, hits, a: r.text, ms: r.ms, v: verdict(it, r.text) });
  }
  return out;
}

export default {
  id: 23,
  see: "Phase 1: the assistant answers 60% (S$5,400) and 2 days a week, both cited, both last week's policy; the stricter prompt gives the same wrong numbers. Phase 2: the retrieved chunks are LEND-07 v3 and HR-09 v5, indexed 10 Nov, while the manifest says v4 and v6. Claude's diagnosis points at the retrieval index; after re-indexing the two documents the original prompt answers 55% (S$4,950) and 3 days.",
  try: "In docs/sims/shared/d4-northwind.js, make brokenIndex() return healthyIndex() and run again: phase 1 is now right with either prompt, which is how you know the prompt was never the problem. Then add a third question about the MSR stress-test rate (also changed in LEND-07 v4).",
  explain: "Confident answers with citations that turn wrong right after a document refresh, while the model version and latency stay the same, point at retrieval. The model can only be as current as the chunks it is given: Phase 1's stricter prompt cannot produce a number that is not in its context, and it even cites the stale document correctly. The first place to look is what the retriever returned: chunk ids, the version each chunk was embedded from and the index date, compared with the library's manifest. Here the 17 Nov re-index timed out on LEND-07 and HR-09 and silently kept last week's vectors. Re-indexing those two documents fixes both answers with the original prompt. The lasting fix is a check in the indexing pipeline that fails the job when an indexed version is behind the manifest.",
  scene: {
    title: "After the 17 Nov re-index: confident, cited, wrong. Where do you look first?",
    caption: "Both phases ask the same two questions. Phase 1 changes the prompt; phase 2 inspects and repairs what the retriever serves.",
    lanes: [
      { key: "p1", label: "Phase 1 · fix the prompt", sub: "stricter instructions, same index", tone: "trap", on: /Phase 1/, stages: [
        { id: "a_q", icon: "👤", t: "Two staff questions", s: "TDSR limit, remote-work days" },
        { id: "a_ret", icon: "🔎", t: "Retriever", s: "the index after the 17 Nov re-index" },
        { id: "a_prompt", icon: "📝", t: "Prompt, then patched prompt", s: "\"use the latest version, double-check\"", diff: true },
        { id: "a_bot", icon: "🤖", t: "Policy assistant", s: "answers with citations", claude: true },
        { id: "a_out", icon: "💬", t: "Answers", s: "want: 55% (S$4,950) and 3 days", out: true } ] },
      { key: "p2", label: "Phase 2 · inspect retrieval, fix the index", sub: "chunk ids and dates vs the manifest", tone: "fix", on: /Phase 2/, stages: [
        { id: "b_ins", icon: "🔬", t: "Inspect retrieved chunks", s: "version and index date vs manifest", diff: true },
        { id: "b_diag", icon: "🩺", t: "Claude diagnoses", s: "from model, latency and chunk evidence", claude: true },
        { id: "b_fix", icon: "🔁", t: "Re-index stale docs", s: "only what is behind the manifest" },
        { id: "b_bot", icon: "🤖", t: "Policy assistant", s: "the ORIGINAL prompt", claude: true },
        { id: "b_out", icon: "💬", t: "Answers", s: "want: 55% (S$4,950) and 3 days", out: true } ] },
    ],
  },
  slide: {
    title: "Wrong after a refresh? Inspect what retrieval served",
    code: `hits = retriever.search(question, k=4)
for h in hits:                                  # KEY 1
    log(h.chunk_id, h.doc_version, h.indexed_at)
stale = [h for h in hits                        # KEY 2
         if h.doc_version < manifest[h.doc_id].version]
if stale:
    reindex({h.doc_id for h in stale})          # KEY 3
# in the indexing job, after every run:
for doc in manifest:                            # KEY 4
    assert index.version(doc) == manifest[doc].version, \\
        f"{doc}: index behind library, fail the job"`,
    keys: [["1", "Log what was retrieved", "Chunk id, version and index date on every answer."],
           ["2", "Compare with the source", "The manifest says which version is current."],
           ["3", "Re-index, don't re-prompt", "Re-embed only the documents that are behind."],
           ["4", "Fail the job loudly", "A re-index that keeps old vectors must not pass."]],
  },
  async run(s, E) {
    const index = brokenIndex();
    s.log("Northwind Policy Assistant · Monday 17 Nov 2026 re-index · since then staff report confident, cited, wrong answers", "note");
    s.log("Unchanged since last week: model claude-haiku-5-5, p50 latency 1.9 s, the production prompt.", "note");

    // Phase 1: the tempting fix. The team rewrites the prompt; the index is untouched.
    s.log("== Phase 1 · fix the prompt: the production prompt, then a stricter one (\"use the latest version, double-check numbers\")", "note");
    s.show("a_q", "QA TDSR · QB remote work", "done");
    s.show("a_ret", "2 chunks per question", "done");
    const base = await answerAll(s, E, index, PROD_PROMPT, "Production prompt");
    s.show("a_prompt", "patched: \"latest version, double-check\"", "done");
    const patched = await answerAll(s, E, index, PATCHED_PROMPT, "Patched prompt");
    const p1wrong = patched.filter((x) => x.v !== "current").length;
    for (const x of [...base, ...patched]) s.log(`  ${x.it.id}: ${x.v === "current" ? "current" : x.v === "stale" ? `STALE (${x.it.staleText})` : x.v}`, x.v === "current" ? "result" : "error");
    s.show("a_bot", `${base.length + patched.length} answers, all cited`, "done");
    s.show("a_out", patched.map((x) => `${x.it.id}: ${x.v === "stale" ? x.it.staleText : x.v}`).join(" · "), p1wrong ? "bad" : "good");
    await s.pause({
      title: "Phase 1 finished: the prompt was fixed, the answers were not",
      outcome: `With the stricter prompt: ${patched.map((x) => `**${x.it.id}: ${x.v === "stale" ? `${x.it.staleText} (last week's policy)` : x.v}**`).join(", ")}. Each answer cites the right document id. Look at the retrieved chunk versions in the live output: the stricter prompt cannot state a number that is not in its context.`,
      next: "Phase 2: inspect what retrieval served, diagnose, fix the index",
    });

    // Phase 2: inspect the retrieved chunks against the manifest, diagnose, re-index, ask again with the ORIGINAL prompt.
    s.log("== Phase 2 · inspect retrieval: chunk ids, versions and index dates against the library manifest, then fix the index", "note");
    const served = [...new Map(base.flatMap((x) => x.hits).map((h) => [h.id, h])).values()];
    const rows = served.map((h) => ({ chunk_id: h.id, doc_version: h.version, indexed_at: h.indexed_at, manifest_version: MANIFEST[h.doc_id].version, manifest_updated: MANIFEST[h.doc_id].updated }));
    for (const r of rows) s.log(`  ${r.chunk_id}: indexed v${r.doc_version} on ${r.indexed_at} · manifest v${r.manifest_version} (updated ${r.manifest_updated})${r.doc_version < r.manifest_version ? "  ← BEHIND" : ""}`, r.doc_version < r.manifest_version ? "error" : "result");
    const staleDocs = [...new Set(served.filter((h) => h.version < MANIFEST[h.doc_id].version).map((h) => h.doc_id))];
    s.show("b_ins", `${staleDocs.length} docs behind: ${staleDocs.join(", ") || "none"}`, "done");

    const diag = await ask(s, E, { label: "Diagnosis", max_tokens: 2048,
      system: "You are the on-call engineer for a RAG policy assistant. From the evidence, choose the single most likely first place to investigate and say what to do next.",
      prompt: `Symptom: since the weekly document refresh and re-index on 2026-11-17, answers are confident and cited but give last week's figures.\n` +
        `Model: claude-haiku-5-5 before and after (unchanged). p50 latency: 1.9 s before and after. Prompt: unchanged; a stricter prompt did not help.\n` +
        `Retrieved chunks for the failing questions, with the library manifest:\n${JSON.stringify(rows, null, 1)}`,
      output_config: { format: { type: "json_schema", schema: DIAG_SCHEMA } } });
    const place = diag.json?.first_place;
    s.show("b_diag", `first place: ${place || "?"}`, "done");

    const fixed = reindex(index, staleDocs);
    s.log(`Re-indexed ${staleDocs.join(", ")} from the current library text (indexed 2026-11-19). Asking again with the ORIGINAL production prompt.`, "note");
    s.show("b_fix", `re-indexed ${staleDocs.join(", ")}`, "done");
    const after = await answerAll(s, E, fixed, PROD_PROMPT, "After re-index");
    for (const x of after) s.log(`  ${x.it.id}: ${x.v === "current" ? `current (${x.it.nowText})` : x.v}`, x.v === "current" ? "result" : "error");
    const afterOk = after.every((x) => x.v === "current");
    const versionsOk = after.every((x) => x.hits.every((h) => h.version === MANIFEST[h.doc_id].version));
    s.show("b_bot", "original prompt, current chunks", "done");
    s.show("b_out", after.map((x) => `${x.it.id}: ${x.v === "current" ? x.it.nowText : x.v}`).join(" · "), afterOk ? "good" : "bad");

    const ans = (xs) => xs.map((x) => `${x.it.id} ${x.v === "current" ? x.it.nowText : x.v === "stale" ? x.it.staleText : x.v}`).join("; ");
    const lat = (xs) => `${(xs.reduce((n, x) => n + x.ms, 0) / xs.length / 1000).toFixed(1)} s avg`;
    return {
      final: `Diagnosis: ${place || "?"}. ${diag.json?.next_step || ""} After re-indexing ${staleDocs.join(" and ")}: ${after.map((x) => `${x.it.id}: ${x.a}`).join(" | ")}`,
      compare: {
        cols: [
          { title: "Phase 1: fix the prompt", short: "Prompt fix", tone: "trap",
            verdict: p1wrong ? `Still wrong: **${ans(patched)}**. The prompt changed, the context did not.` : "Right this time, which would mean the index was not the problem." },
          { title: "Phase 2: inspect retrieval, fix the index", short: "Index fix", tone: "fix",
            verdict: afterOk ? `Chunks were **${staleDocs.join(", ")} behind the manifest**. Re-indexed: **${ans(after)}** with the original prompt.` : `After re-index: ${ans(after)}. Read the live output.` },
        ],
        rows: [
          ["What changed", "the prompt (stricter wording)", "the index (re-embedded stale docs)"],
          ["Model / latency", `claude-haiku-5-5 · ${lat(patched)}`, `claude-haiku-5-5 · ${lat(after)}`],
          ["Chunks served", base.flatMap((x) => x.hits.map((h) => `${h.id} v${h.version}`)).join(", "), after.flatMap((x) => x.hits.map((h) => `${h.id} v${h.version}`)).join(", ")],
          ["Claude's diagnosis (first place)", "-", { v: place || "?", tone: place === "retrieval_index" ? "good" : "bad" }],
          ...QUESTIONS.map((q, i) => [`${q.id} (want ${q.nowText})`, { v: patched[i].v === "stale" ? q.staleText : patched[i].v, tone: patched[i].v === "current" ? "good" : "bad" }, { v: after[i].v === "current" ? q.nowText : after[i].v, tone: after[i].v === "current" ? "good" : "bad" }]),
        ],
        note: "Same questions, same model, same latency. A prompt can only work with the chunks it is given: the fix lived in the index.",
      },
      checks: [
        E.check("Phase 1: both prompts answered from last week's policy (60% / 2 days), never the current figures", [...base, ...patched].every((x) => x.v === "stale")),
        E.check("Phase 2: the retrieved chunks were behind the manifest (LEND-07 and HR-09)", staleDocs.includes("LEND-07") && staleDocs.includes("HR-09")),
        E.check("Phase 2: Claude's structured diagnosis chose the retrieval index as the first place to look", place === "retrieval_index"),
        E.check("Phase 2: after re-indexing, every retrieved chunk matched the manifest version", versionsOk),
        E.check("Phase 2: the original prompt now answers 55% (S$4,950) and 3 days", afterOk),
      ],
    };
  },
};
