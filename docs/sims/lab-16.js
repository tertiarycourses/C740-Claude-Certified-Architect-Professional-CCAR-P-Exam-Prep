// Lab 16 · Task 3.5 · Simulator 2 (Northwind Policy Assistant): chunk along the headings, keep the metadata, cite.
// A branch teller asks whether a first-time buyer at a 58% debt-servicing ratio, with a guarantor, can get a mortgage.
// Phase 1 indexes the library in fixed 200-character windows with no metadata: the cuts land mid-sentence, so the
// top 3 chunks hold neither the 55% limit nor the 60% exception, and nothing says which policy a chunk came from.
// Phase 2 indexes the SAME library one section per chunk, with the heading path and document id, section and
// effective date as metadata, and sends the hits as document blocks with citations enabled.
// Same question, same BM25 scorer, same k = 3. Only the chunking and indexing change.
import { fixedChunks, sectionChunks, bm25 } from "./shared/d3b-northwind.js";

const QUESTION = "A first-time buyer has a debt-servicing ratio of 58% and a guarantor. Can the mortgage be approved, and who signs it off?";
const ROLE = "teller";
const K = 3;
const SYSTEM = "You are Northwind Bank's policy assistant for branch staff. Answer only from the policy text you are given. " +
  "If that text does not contain the answer, say exactly what is missing rather than guessing. Cite the source of each statement. Answer in under 90 words.";

const has55 = (t) => /55\s?%/.test(t);
const has60 = (t) => /60\s?%/.test(t);

export default {
  id: 16,
  see: "Phase 1 (fixed 200-character chunks): the window boundaries cut LEND-07 mid-sentence, so the three chunks retrieved hold neither the 55% limit nor the 60% first-home exception, and they carry no document id, so the answer cannot cite a policy. Phase 2 (one chunk per section, with metadata): retrieval returns LEND-07 §3 (the rule), §5 (the guarantor) and §7 (the exception), and the answer gives 60% with credit officer sign-off, with citations to LEND-07.",
  try: "Change K to 4 in this lab's code and run it: Phase 1 now also retrieves the chunk holding \"rises to 60%\", but without the words \"For a first home\" that sit in the chunk before it. Then change fixedChunks' size to 400: the cuts move, and a different rule loses its condition. A bigger window moves the problem; it does not remove it.",
  explain: "Chunking decides what the retriever can ever find. Fixed windows cut wherever the character count lands, so a rule is separated from its number and an exception from its condition, and a chunk knows nothing about the document it came from. Cutting along the policy's own headings keeps each clause whole; prefixing the heading path (LEND-07 › 7 Exceptions) makes a short clause findable; and metadata (document id, section, revision, effective date, roles) lets the pipeline filter by role and date and lets Claude cite the exact section. With citations enabled on document blocks, the API returns the cited span with each claim, so a reviewer can check every answer against its source.",
  scene: {
    title: "A teller asks: 58% DSR, first-time buyer, guarantor. Approve?",
    caption: "Both phases ask the same question with the same BM25 scorer and k = 3. Only how the library is chunked and indexed differs.",
    lanes: [
      { key: "p1", label: "Phase 1 · fixed 200-character chunks", sub: "no headings kept, no metadata", tone: "trap", on: /Phase 1/, stages: [
        { id: "a_q", icon: "👤", t: "Teller's question", s: "58% DSR, first-time buyer, guarantor" },
        { id: "a_chunk", icon: "✂", t: "Fixed 200-char windows", s: "cuts mid-sentence; chunk ids only", diff: true },
        { id: "a_ret", icon: "🔎", t: "BM25 top 3", s: "which chunks come back?" },
        { id: "a_claude", icon: "🤖", t: "Policy assistant", s: "answers from the chunks only", claude: true },
        { id: "a_out", icon: "📄", t: "Answer with a source", s: "want: 60% with guarantor, credit officer, cited", out: true } ] },
      { key: "p2", label: "Phase 2 · section chunks + metadata + citations", sub: "doc id, section, effective date, roles", tone: "fix", on: /Phase 2/, stages: [
        { id: "b_q", icon: "👤", t: "Teller's question", s: "the same question" },
        { id: "b_chunk", icon: "📑", t: "One chunk per section", s: "heading path prefix + metadata", diff: true },
        { id: "b_ret", icon: "🔎", t: "BM25 top 3, role filter", s: "which sections come back?" },
        { id: "b_claude", icon: "🤖", t: "Policy assistant", s: "document blocks, citations on", claude: true },
        { id: "b_out", icon: "📄", t: "Answer with a source", s: "want: 60% with guarantor, credit officer, cited", out: true } ] },
    ],
  },
  slide: {
    title: "Chunk on the headings, keep the metadata, cite the span",
    code: `def chunk(doc):                                   # KEY 1
    for sec in doc.sections:                      # cut where the policy cuts
        yield Chunk(
            text=f"{doc.id} {doc.title} > {sec.n} {sec.h}\\n{sec.text}",
            meta={"doc": doc.id, "section": sec.n,          # KEY 2
                  "effective": doc.effective, "roles": doc.roles})

hits = index.search(question, k=3,
                    filter={"roles": user.role})            # KEY 3
blocks = [{"type": "document", "title": h.title,
           "source": {"type": "text", "media_type": "text/plain",
                      "data": h.text},
           "citations": {"enabled": True}} for h in hits]   # KEY 4
reply = client.messages.create(model="claude-haiku-5-5", max_tokens=1024,
    messages=[{"role": "user", "content": blocks + [{"type": "text", "text": question}]}])`,
    keys: [["1", "Cut along the structure", "One chunk per section: a rule keeps its number and exception."],
           ["2", "Index more than text", "Doc id, section, effective date and roles travel with each chunk."],
           ["3", "Filter before ranking", "Role and date filters run in code, not in the prompt."],
           ["4", "Citations on", "Each claim comes back with the exact span it rests on."]],
  },
  async run(s, E) {
    s.log(`Teller (role: ${ROLE}) asks: "${QUESTION}"`, "note");

    // ---- Phase 1: fixed windows, no metadata
    s.log("== Phase 1 · fixed 200-character chunks, no metadata: retrieve the top 3 and answer", "note");
    s.show("a_q", "58% DSR, first-time buyer", "done");
    const fixed = fixedChunks(undefined, 200);
    s.show("a_chunk", `${fixed.length} chunks, ids only, no doc or section`, "done");
    const hits1 = bm25(fixed).search(QUESTION, K);
    for (const h of hits1) s.log(`  retrieved ${h.id} (score ${h.score}): "${E.short(h.text, 110)}"`, "result");
    const ctx1 = hits1.map((h) => `[${h.id}]\n${h.text}`).join("\n\n");
    const mixed = hits1.some((h) => !h._from.startsWith("LEND-07"));   // a chunk from another policy, with nothing to say so
    const got55a = hits1.some((h) => has55(h.text)), got60a = hits1.some((h) => has60(h.text) && /rises/.test(h.text));
    s.show("a_ret", `${hits1.map((h) => h.id).join(", ")}: ${got55a || got60a ? "some limits" : "no 55% rule, no 60% exception"}`, "done");
    const r1 = await E.runAgent(s, { system: SYSTEM, max_tokens: 1024,
      messages: [{ role: "user", content: `Policy passages retrieved for this question:\n\n${ctx1}\n\nQuestion from a branch teller: ${QUESTION}` }] });
    const a1 = r1.text;
    const ok1 = has60(a1) && /credit officer/i.test(a1);
    s.show("a_out", ok1 ? "gave 60% / credit officer (not from its chunks)" : "no 60% exception, no policy section cited", ok1 ? "good" : "bad");

    await s.pause({
      title: "Phase 1 finished: fixed 200-character chunks",
      outcome: `The top 3 chunks were **${hits1.map((h) => h.id).join(", ")}**. ${got55a ? "One held the 55% limit" : "None held the 55% limit"} and ${got60a ? "one held the 60% exception" : "**none held the 60% first-home exception**"}: the window boundaries cut LEND-07 mid-sentence. The chunks carry no document id or section, so the answer cannot cite a policy.`,
      next: "Phase 2: the same library cut one section per chunk, with metadata, answered with citations",
    });

    // ---- Phase 2: section chunks with metadata, role filter, document blocks with citations
    s.log("== Phase 2 · one chunk per section with heading path and metadata, role filter, citations enabled", "note");
    s.show("b_q", "58% DSR, first-time buyer", "done");
    const secs = sectionChunks();
    s.show("b_chunk", `${secs.length} section chunks with doc, section, date`, "done");
    const hits2 = bm25(secs).search(QUESTION, K, (c) => c.roles.includes(ROLE) && !c.expires);
    for (const h of hits2) s.log(`  retrieved ${h.id} (score ${h.score}) · ${h.title} · effective ${h.effective}`, "result");
    s.show("b_ret", hits2.map((h) => h.id).join(", "), "done");
    const blocks = hits2.map((h) => ({ type: "document", source: { type: "text", media_type: "text/plain", data: h.text },
      title: `${h.id} ${h.heading} (rev ${h.rev}, effective ${h.effective})`, citations: { enabled: true } }));
    const r2 = await E.runAgent(s, { system: SYSTEM, max_tokens: 1024,
      messages: [{ role: "user", content: [...blocks, { type: "text", text: `Question from a branch teller: ${QUESTION}` }] }] });
    const content = r2.messages.at(-1).content;
    const cites = content.flatMap((b) => (b.type === "text" && b.citations) || []);
    const citedDocs = [...new Set(cites.map((c) => c.document_title))];
    const a2 = r2.text;
    for (const t of citedDocs) s.log(`  cited: ${t}`, "result");
    const ok2 = has60(a2) && /credit officer/i.test(a2);
    s.show("b_claude", `${cites.length} citation${cites.length === 1 ? "" : "s"} returned`, "done");
    s.show("b_out", ok2 && cites.length ? `60% with guarantor, credit officer; cites ${citedDocs.length} section${citedDocs.length === 1 ? "" : "s"}` : "answer incomplete or uncited", ok2 && cites.length ? "good" : "bad");

    const want = ["LEND-07§3", "LEND-07§7"];
    const final = `${a2}\n\nSources cited: ${citedDocs.join("; ") || "none"}`;
    return {
      final,
      compare: {
        cols: [
          { title: "Phase 1: fixed 200-character chunks", short: "Fixed chunks", tone: "trap", said: a1,
            verdict: `Retrieved ${hits1.map((h) => h.id).join(", ")}: ${got55a || got60a ? "part of the rule" : "**neither the 55% limit nor the 60% exception**"}.${mixed ? ` ${hits1.filter((h) => !h._from.startsWith("LEND-07")).map((h) => h.id).join(", ")} is from ${[...new Set(hits1.filter((h) => !h._from.startsWith("LEND-07")).map((h) => h._from))].join(", ")}, not the mortgage policy, and nothing in the chunk says so.` : ""} ${ok1 ? "Claude still named 60%, but not from a cited policy section." : "The answer cannot give the first-home exception, and it has no policy section to cite."}` },
          { title: "Phase 2: section chunks, metadata, citations", short: "Section chunks", tone: "fix", said: a2,
            verdict: ok2 ? `Retrieved ${hits2.map((h) => h.id).join(", ")}. The answer gives the **60% first-home limit with a guarantor, approved by a credit officer**, with ${cites.length} citation${cites.length === 1 ? "" : "s"} to ${citedDocs.map((t) => t.split(" (")[0]).join(", ")}.`
              : `Retrieved ${hits2.map((h) => h.id).join(", ")}. Read the live answer: Claude writes each run fresh.` },
        ],
        rows: [
          ["How the library is cut", "200-character windows", { v: "one chunk per section, heading path kept", tone: "good" }],
          ["Metadata on each chunk", "chunk id only", { v: "doc id, section, revision, effective date, roles", tone: "good" }],
          ["Retrieved (k = 3)", hits1.map((h) => h.id).join(", "), hits2.map((h) => h.id).join(", ")],
          ["Where those chunks really came from (the trap's index does not know)", { v: hits1.map((h) => `${h.id}: ${h._from}`).join("; "), tone: mixed ? "bad" : "" }, hits2.map((h) => `${h.doc} §${h.section} ${h.heading}`).join("; ")],
          ["55% rule in what Claude saw", { v: got55a ? "yes" : "no", tone: got55a ? "good" : "bad" }, { v: hits2.some((h) => has55(h.text)) ? "yes" : "no", tone: hits2.some((h) => has55(h.text)) ? "good" : "bad" }],
          ["60% first-home exception in what Claude saw", { v: got60a ? "yes" : "no", tone: got60a ? "good" : "bad" }, { v: hits2.some((h) => has60(h.text)) ? "yes" : "no", tone: hits2.some((h) => has60(h.text)) ? "good" : "bad" }],
          ["Citations returned", "0 (plain text, no citations)", { v: `${cites.length} (${citedDocs.map((t) => t.split(" ")[0]).join(", ") || "none"})`, tone: cites.length ? "good" : "bad" }],
        ],
        note: "Same question, same scorer, same k. Retrieval cannot return what the index never kept whole: the chunker decided the outcome before Claude was called.",
      },
      checks: [
        E.check("Phase 1: the 3 fixed chunks retrieved held neither the 55% limit nor the 60% first-home exception", !got55a && !got60a),
        E.check("Phase 2: section retrieval returned both the rule (LEND-07 §3) and its exception (LEND-07 §7)", want.every((id) => hits2.some((h) => h.id === id))),
        E.check("Phase 2: the response carried citations to LEND-07 document blocks", cites.length > 0 && cites.every((c) => /^LEND-07/.test(c.document_title || ""))),
        E.check("Phase 2: the answer gives the 60% limit with credit officer approval", ok2),
      ],
    };
  },
};
