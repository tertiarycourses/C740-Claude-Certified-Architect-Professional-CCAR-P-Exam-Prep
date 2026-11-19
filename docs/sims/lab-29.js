// Lab 29 · Task 5.4 · Simulator 3: compliance is decided by what reaches the model and what you keep.
// Dr Osei refers a synthetic patient to endocrinology. Phase 1 is the prototype: the whole record goes to
// Claude, and every prompt and response is copied to a third-party log service for debugging. Phase 2 applies
// HIPAA's minimum-necessary standard in code: an allow-list keeps only the fields this referral needs,
// direct identifiers are replaced by tokens and put back after the call, the log keeps metadata and a
// fingerprint instead of content, and an audit record names who sent what, for which purpose.
// The lab scans the exact request body each phase sent, so you can see what reached the model.
import { structured } from "./shared/d5-call.js";
import { RECORD, REFERRAL, minimise, reidentify, IDENTIFIERS, UNNEEDED, scan, fingerprint } from "./shared/d5-clinical.js";

const SYSTEM = "You are Meridian Health's clinical documentation assistant. Draft referral letters for the referring clinician to sign. Use only the facts provided.";
const SCHEMA = { type: "object", additionalProperties: false, required: ["letter"], properties: { letter: { type: "string", description: "the referral letter, at most 160 words" } } };
const TOKEN_RULE = " The patient is identified only by the placeholders [PATIENT] and [MRN]. Copy both placeholders into the letter exactly as written; never guess a name or number.";

export default {
  id: 29,
  see: "Phase 1: the request to Claude carries all nine direct identifiers (name, MRN, date of birth, address, phone, email, SSN, insurance id, next of kin) plus three sensitive history items a diabetes referral doesn't need, and the third-party log keeps a full copy. Phase 2: the request carries none of them; the letter still has HbA1c 9.1% and both diabetes medicines, the name and MRN are put back in code after the call, the log holds metadata and a fingerprint, and an audit record lists 6 fields sent and 10 withheld.",
  try: "Add \"history_sensitive\" to NEEDED in sims/shared/d5-clinical.js and rerun: Phase 2's scan now finds the three history items in the request, and the audit record shows them as sent. An allow-list makes every field you add a decision you can see.",
  explain: "HIPAA's minimum-necessary standard asks for the least PHI needed for the purpose, and an audit has to show it. In Phase 1 the prototype meets neither: the whole record, including identifiers and sensitive history the endocrinologist doesn't need, goes to the model, and a debug log copies it to a service outside the agreement that covers the model provider. Nothing records why. Phase 2 makes the obligation a control in code. An allow-list for the purpose decides which fields leave; identifiers become tokens that only your code can map back; the log keeps what operations need (ids, token counts, field names, a fingerprint) and no content; and an audit record names the user, the purpose, and the fields sent and withheld. Asking the model to ignore what it doesn't need would not help: by then the data has already been sent.",
  scene: {
    title: "A diabetes referral. What reaches the model, and what does the log keep?",
    caption: "Both phases draft the same referral from the same record with the same model. Phase 2 changes what code sends, logs and records.",
    lanes: [
      { key: "p1", label: "Phase 1 · send the whole record", sub: "the prototype: full record, full debug log", tone: "trap", on: /Phase 1/, stages: [
        { id: "a_rec", icon: "🗂", t: "Full patient record", s: "identifiers, history, results, visit" },
        { id: "a_filter", icon: "🧹", t: "Before the call", s: "nothing removed: the whole record goes", diff: true },
        { id: "a_claude", icon: "🤖", t: "Draft the referral", s: "Claude reads everything it was sent", claude: true },
        { id: "a_log", icon: "📜", t: "Third-party debug log", s: "copies every prompt and response" },
        { id: "a_out", icon: "🔎", t: "What reached the model", s: "want: no identifiers, no unneeded history", out: true } ] },
      { key: "p2", label: "Phase 2 · minimum necessary, with evidence", sub: "allow-list · tokens · metadata log · audit", tone: "fix", on: /Phase 2/, stages: [
        { id: "b_rec", icon: "🗂", t: "Full patient record", s: "the same record" },
        { id: "b_filter", icon: "🧹", t: "Allow-list + tokens", s: "6 fields for this purpose; ids → tokens", diff: true },
        { id: "b_claude", icon: "🤖", t: "Draft the referral", s: "[PATIENT], [MRN], clinical facts only", claude: true },
        { id: "b_log", icon: "📜", t: "Metadata log + audit record", s: "ids, counts, fingerprint; who, why, what" },
        { id: "b_out", icon: "🔎", t: "What reached the model", s: "want: no identifiers, no unneeded history", out: true } ] },
    ],
  },
  slide: {
    title: "Minimum necessary in code, and evidence for the audit",
    code: `NEEDED = ["sex", "age", "problems",          # KEY 1
          "medications", "results", "visit"]
sent = {k: record[k] for k in NEEDED}
sent["patient"], sent["mrn"] = "[PATIENT]", "[MRN]"  # KEY 2
letter = claude(purpose, sent)
letter = reidentify(letter, tokens)           # in our boundary
log.write(request_id=rid, fields=list(sent),  # KEY 3
          tokens=usage, sha=fingerprint(body))
audit.write(user="dr.k.osei", purpose=purpose, # KEY 4
            sent=list(sent), withheld=withheld)`,
    keys: [["1", "Allow-list per purpose", "Only the fields this task needs leave the hospital."],
           ["2", "Tokenise identifiers", "Claude sees [PATIENT]; code maps it back afterwards."],
           ["3", "Log metadata, not content", "Operations get ids and counts; no PHI in the log."],
           ["4", "Record the evidence", "Who sent what, for which purpose: the audit answer."]],
  },
  async run(s, E) {
    s.log(`${REFERRAL.from} → ${REFERRAL.to} · purpose: ${REFERRAL.purpose}. The record holds ${Object.keys(RECORD).length} fields, including ${IDENTIFIERS.length} direct identifiers and ${UNNEEDED.length} sensitive history items.`, "note");
    s.log("== Phase 1 · send the whole record: the full record goes to Claude, and a third-party debug log copies every prompt and response", "note");
    s.show("a_rec", `${Object.keys(RECORD).length} fields`, "done");
    s.show("a_filter", "nothing removed", "done");
    const n0 = s.requests.length;
    const user1 = `Draft a referral letter to ${REFERRAL.to} from ${REFERRAL.from}. Purpose: ${REFERRAL.purpose}.\n\nPatient record:\n${JSON.stringify(RECORD, null, 1)}`;
    const r1 = await structured(s, E, { label: "Draft the referral", system: SYSTEM, schema: SCHEMA, max_tokens: 3000, user: user1 });
    const body1 = JSON.stringify(s.requests.slice(n0));
    const letter1 = r1.out?.letter || "";
    const log1 = [{ service: "third-party debug log (outside the BAA)", request: body1, response: letter1 }];
    const sentIds1 = scan(body1, IDENTIFIERS), sentHist1 = scan(body1, UNNEEDED);
    const logIds1 = scan(JSON.stringify(log1), IDENTIFIERS);
    s.log(`  request scan: ${sentIds1.length}/${IDENTIFIERS.length} direct identifiers (${sentIds1.join(", ")}) · unneeded history: ${sentHist1.join(", ") || "none"}`, sentIds1.length ? "error" : "result");
    s.log(`  debug log: 1 entry, full prompt and letter · identifiers in the log: ${logIds1.length}`, logIds1.length ? "error" : "result");
    s.show("a_claude", `letter: ${letter1.split(/\s+/).length} words`, "done");
    s.show("a_log", `full copy · ${logIds1.length} identifiers stored`, "done");
    s.show("a_out", `${sentIds1.length} identifiers + ${sentHist1.length} history items`, sentIds1.length || sentHist1.length ? "bad" : "good");
    await s.pause({
      title: "Phase 1 finished: the whole record reached the model and the log",
      outcome: `**The request carried ${sentIds1.length} of ${IDENTIFIERS.length} direct identifiers** (${sentIds1.join(", ")}) and ${sentHist1.length} sensitive history items the referral does not need. The debug log now holds the same PHI outside the agreement, and nothing records why it was sent.`,
      next: "Phase 2: an allow-list for the purpose, tokenised identifiers, a metadata log and an audit record",
    });

    s.log("== Phase 2 · minimum necessary, with evidence: allow-list the fields, tokenise identifiers, log metadata, write an audit record", "note");
    s.show("b_rec", `${Object.keys(RECORD).length} fields`, "done");
    const m = minimise(RECORD);
    s.log(`  minimise(): sent ${Object.keys(m.sent).length} keys (${Object.keys(m.sent).join(", ")}) · withheld ${m.withheld.length} (${m.withheld.join(", ")})`, "result");
    s.show("b_filter", `${Object.keys(m.sent).length - 2} fields + 2 tokens · ${m.withheld.length} withheld`, "done");
    const n1 = s.requests.length;
    const user2 = `Draft a referral letter to ${REFERRAL.to} from ${REFERRAL.from}. Purpose: ${REFERRAL.purpose}.\n\nPatient details (minimum necessary for this referral):\n${JSON.stringify(m.sent, null, 1)}`;
    const r2 = await structured(s, E, { label: "Draft the referral", system: SYSTEM + TOKEN_RULE, schema: SCHEMA, max_tokens: 3000, user: user2 });
    const body2 = JSON.stringify(s.requests.slice(n1));
    const raw2 = r2.out?.letter || "";
    const letter2 = reidentify(raw2, m.tokens);
    const sentIds2 = scan(body2, IDENTIFIERS), sentHist2 = scan(body2, UNNEEDED);
    const usage = r2.usage || {};
    const log2 = [{ service: "third-party debug log", request_id: "req-29-0002", purpose: "endocrinology referral", fields: Object.keys(m.sent),
      input_tokens: usage.input_tokens, output_tokens: usage.output_tokens, stop_reason: r2.stop_reason, fingerprint: fingerprint(body2) }];
    const audit = { at: "2026-11-19T10:42:00", user: REFERRAL.user, patient_ref: `MRN ${RECORD.mrn}`, purpose: REFERRAL.purpose,
      fields_sent: Object.keys(m.sent).filter((k) => !(m.sent[k] in m.tokens)), tokens_sent: Object.keys(m.tokens), fields_withheld: m.withheld, model: E.MODEL, store: "Meridian audit store (inside the hospital)" };
    const logIds2 = scan(JSON.stringify(log2), IDENTIFIERS);
    const tokensKept = raw2.includes("[PATIENT]");
    const facts = /9\.1/.test(letter2) && /metformin/i.test(letter2) && /gliclazide/i.test(letter2);
    s.log(`  request scan: ${sentIds2.length}/${IDENTIFIERS.length} direct identifiers · unneeded history: ${sentHist2.join(", ") || "none"}`, sentIds2.length ? "error" : "result");
    s.log(`  reidentify(): [PATIENT] ${tokensKept ? "found and replaced" : "not found"} · clinical facts kept: ${facts ? "HbA1c 9.1%, metformin, gliclazide" : "check the letter"}`, tokensKept && facts ? "result" : "error");
    s.log(`  debug log: ${JSON.stringify(log2[0])}`, "result");
    s.log(`  audit record: ${JSON.stringify(audit)}`, "result");
    s.show("b_claude", `letter: ${raw2.split(/\s+/).length} words, tokens ${tokensKept ? "kept" : "missing"}`, "done");
    s.show("b_log", `log: ${logIds2.length} identifiers · audit: ${audit.fields_sent.length} sent, ${audit.fields_withheld.length} withheld`, "done");
    const clean2 = sentIds2.length === 0 && sentHist2.length === 0;
    s.show("b_out", clean2 ? "0 identifiers, 0 history items" : `${sentIds2.length} identifiers + ${sentHist2.length} history`, clean2 ? "good" : "bad");

    return {
      final: letter2,
      compare: {
        cols: [
          { title: "Phase 1: send the whole record", short: "Whole record", tone: "trap", said: letter1,
            verdict: `The request carried **${sentIds1.length} direct identifiers** and ${sentHist1.length} unneeded history items; the debug log keeps a full copy outside the agreement. No record says why.` },
          { title: "Phase 2: minimum necessary, with evidence", short: "Minimum necessary", tone: "fix", said: letter2,
            verdict: clean2 && tokensKept && facts
              ? `The request carried **no identifiers and no unneeded history**. The letter still has HbA1c 9.1% and both diabetes medicines; the name and MRN were put back in code. The log holds metadata; the audit record lists ${audit.fields_sent.length} fields sent and ${audit.fields_withheld.length} withheld.`
              : `Identifiers sent: ${sentIds2.length}; tokens kept: ${tokensKept}; facts kept: ${facts}. Read the live output: Claude writes each run fresh.` },
        ],
        rows: [
          ["Direct identifiers in the request", { v: `${sentIds1.length}: ${sentIds1.join(", ")}`, tone: "bad" }, { v: String(sentIds2.length), tone: sentIds2.length ? "bad" : "good" }],
          ["Unneeded sensitive history in the request", { v: sentHist1.join(", ") || "none", tone: sentHist1.length ? "bad" : "good" }, { v: sentHist2.join(", ") || "none", tone: sentHist2.length ? "bad" : "good" }],
          ["How the patient is named to Claude", "full name and MRN", { v: "[PATIENT] and [MRN], mapped back in code", tone: "good" }],
          ["What the debug log keeps", { v: `full prompt and letter (${logIds1.length} identifiers)`, tone: "bad" }, { v: `ids, field names, token counts, fingerprint (${logIds2.length} identifiers)`, tone: logIds2.length ? "bad" : "good" }],
          ["Audit evidence", { v: "none", tone: "bad" }, { v: `${audit.user} · ${audit.fields_sent.length} sent · ${audit.fields_withheld.length} withheld · purpose recorded`, tone: "good" }],
          ["Request size", `${body1.length} characters`, `${body2.length} characters`],
        ],
        note: "Same referral, same model. The control is in code before the call, so it does not depend on the model choosing to ignore anything. This is architecture, not legal advice: the agreements, eligible features and retention terms come from your compliance team and the provider.",
      },
      checks: [
        E.check("Phase 1: the request to Claude carried direct identifiers and sensitive history the referral does not need", sentIds1.length >= 8 && sentHist1.length === UNNEEDED.length),
        E.check("Phase 1: the third-party debug log holds a full copy, identifiers included", logIds1.length >= 8),
        E.check("Phase 2: the request carried no direct identifiers and none of the unneeded history", clean2),
        E.check("Phase 2: the letter keeps the clinical facts, and the patient's name was put back in code after the call", tokensKept && facts && letter2.includes(RECORD.name)),
        E.check("Phase 2: the log holds metadata only, and an audit record lists the user, purpose, fields sent and fields withheld", logIds2.length === 0 && audit.fields_sent.length > 0 && audit.fields_withheld.length > 0 && !!audit.purpose && !!audit.user),
      ],
    };
  },
};
