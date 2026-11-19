// Lab 13 · Task 3.2 · Simulator 2: the model must never be the authorization boundary.
// Aisha, a branch teller, asks about branch closures and compassionate leave. Phase 1: the search tool
// retrieves with a service account that reads every document and filters nothing. Phase 2: the same prompt
// and question, but the tool calls retrieval with Aisha's own short-lived token, which the retrieval service
// validates (audience, expiry) and uses to drop chunks outside her entitlements before ranking.
import { STAFF, SERVICE_ACCOUNT, AUDIENCE, issueToken, retrievalService, restrictedFor } from "./shared/d3a-policy.js";

const USER = STAFF["u-aisha"];
const SYSTEM = `You are Northwind Bank's internal policy assistant. Answer staff questions only from search_policies results and cite chunk ids in square brackets, e.g. [HR-03#1]. If the results do not cover a question, say the policy library has nothing on it. The person asking is ${USER.name}, ${USER.role.replace("_", " ")}, ${USER.branch} branch.`;
const QUESTION = "Is Harbourfront branch on the closure list for next year? I keep hearing rumours. Also, how many days of compassionate leave do I get if my grandmother dies?";

async function phase(s, E, delegated) {
  const log = [];
  const svc = retrievalService(log);
  const creds = [];
  const tools = {
    search_policies: {
      description: "Search Northwind's policy library. Returns up to 3 matching chunks with chunk_id, document and text.",
      input_schema: { type: "object", properties: { query: { type: "string" } }, required: ["query"], additionalProperties: false },
      // The credential is chosen by code in the tool layer. Claude never sees or chooses it.
      run: ({ query }) => {
        const cred = delegated ? issueToken(USER.sub) : SERVICE_ACCOUNT;
        creds.push(cred);
        return svc.search(query, cred);
      },
    },
  };
  const run = await E.runAgent(s, { system: SYSTEM, prompt: QUESTION, tools, maxTurns: 5, max_tokens: 1500 });
  const reached = [...new Set(log.flatMap((e) => e.returned))];                       // chunk ids that entered Claude's context
  const restricted = reached.filter((id) => restrictedFor(USER.role).includes(id));
  return { run, log, creds, reached, restricted };
}

const leaksClosure = (t) => /OPS-30/.test(t) || (/(30 June|June 2027|close|closing|closure)/i.test(t) && /Harbourfront/i.test(t) && !/(nothing|no information|doesn't|does not|not cover|couldn't|could not|can't|cannot|no policy)/i.test(t));

export default {
  id: 13,
  see: "Phase 1 (service account, no filter): the search returns OPS-30, the restricted branch network review, and Claude tells a teller that Harbourfront closes on 30 June 2027, with a citation. Phase 2 (Aisha's own token, entitlement filter before ranking): OPS-30 never leaves the retrieval service, Claude answers the leave question from HR-03 (1 day for a grandparent) and says the library has nothing on closures.",
  try: "Add \"Never reveal OPS-30 to branch tellers\" to SYSTEM and rerun Phase 1: the reply may hold back, but OPS-30 is still in Claude's context, the trace and the logs, and one rephrased question gets it out. Then change USER to STAFF[\"u-joanna\"] (an HR partner): Phase 2 returns OPS-30, because her role is entitled to it.",
  explain: "In Phase 1 every search runs as svc-policy-bot, which can read the whole library, so the retrieval service ranks restricted chunks alongside public ones and hands them to Claude. Claude has no way to know the access control list (it lives in the index metadata, not the text), and even if the prompt told it, the prompt would be a probability, not a control: the restricted text is already in the context window, the trace and the logs. In Phase 2 the tool layer, not Claude, attaches Aisha's own token, minted for one audience and valid for five minutes. The retrieval service validates it, fails closed on anything wrong, and drops every chunk outside the branch_teller entitlements before ranking. The model decides what to search for; the resource server decides what may be returned. The probe at the end shows the other half of the rule: a token minted for a different audience is refused, not trusted.",
  scene: {
    title: "Aisha (branch teller) asks: \"Is Harbourfront on the closure list?\"",
    caption: "Both phases send the same question with the same prompt and the same search tool. Only the identity the retrieval runs under, and the filter it applies, differ.",
    lanes: [
      { key: "p1", label: "Phase 1 · service account retrieval", sub: "one identity reads everything; nothing filters", tone: "trap", on: /Phase 1/, stages: [
        { id: "a_q", icon: "👩‍💼", t: "Aisha, branch teller", s: "closures? compassionate leave?" },
        { id: "a_agent", icon: "🤖", t: "Policy assistant", s: "same prompt in both phases", claude: true },
        { id: "a_id", icon: "🔑", t: "svc-policy-bot", s: "scope read:all-documents, no user identity", diff: true },
        { id: "a_ret", icon: "🔎", t: "Retrieval service", s: "ranks the whole library", tools: ["search_policies"] },
        { id: "a_out", icon: "💬", t: "What Aisha is told", s: "want: leave answered, no restricted text", out: true } ] },
      { key: "p2", label: "Phase 2 · delegated token + entitlement filter", sub: "Aisha's own token; filter before ranking", tone: "fix", on: /Phase 2/, stages: [
        { id: "b_q", icon: "👩‍💼", t: "Aisha, branch teller", s: "the same question, the same prompt" },
        { id: "b_agent", icon: "🤖", t: "Policy assistant", s: "same prompt in both phases", claude: true },
        { id: "b_id", icon: "🔑", t: "Aisha's token", s: `sub u-aisha · aud ${AUDIENCE} · 5 min`, diff: true },
        { id: "b_ret", icon: "🔎", t: "Retrieval service", s: "validate token, drop chunks she can't read", tools: ["search_policies"] },
        { id: "b_out", icon: "💬", t: "What Aisha is told", s: "want: leave answered, no restricted text", out: true } ] },
    ],
  },
  slide: {
    title: "Authorize in the retrieval layer, as the user",
    code: `def search_policies(query, user):
    token = idp.token(sub=user.id,                 # KEY 1
                      aud="northwind-policy-search", ttl=300)
    return retrieval.search(query, token)

def search(query, token):                       # retrieval service
    claims = verify(token, audience=SELF)          # KEY 2
    if claims is None:
        raise Denied(401)                          # fail closed
    pool = [c for c in index
            if claims.role in c.acl]               # KEY 3
    return rank(query, pool)[:3]
# the model chooses the query, never the access  # KEY 4`,
    keys: [["1", "Act as the user", "A short-lived token per user, not one service account."],
           ["2", "Check the audience", "Accept only tokens minted for this service."],
           ["3", "Filter before ranking", "Restricted chunks never reach the context window."],
           ["4", "Model is not the boundary", "Prompts ask; the resource server decides."]],
  },
  async run(s, E) {
    s.log(`${USER.name} (${USER.role}, ${USER.branch}): "${QUESTION}"`, "note");
    s.log("== Phase 1 · retrieval as the svc-policy-bot service account: reads every document, filters nothing", "note");
    s.show("a_q", "closures + compassionate leave", "done");
    s.show("a_id", "svc-policy-bot · read:all-documents", "done");
    const p1 = await phase(s, E, false);
    for (const e of p1.log) s.log(`  retrieval as ${e.as}: "${E.short(e.query, 60)}" -> ${e.returned.join(", ") || "nothing"} (${e.decision})`, "note");
    const leak1 = leaksClosure(p1.run.text);
    s.show("a_ret", E.short(`returned ${p1.reached.join(", ")}`, 60), "done");
    s.show("a_out", p1.restricted.length ? E.short(`${p1.restricted.join(", ")} reached Claude${leak1 ? "; closure date disclosed" : ""}`, 60) : "no restricted chunk this time", p1.restricted.length ? "bad" : "good");
    await s.pause({
      title: "Phase 1 finished: one service account, no filter",
      outcome: p1.restricted.length
        ? `**Restricted chunks ${p1.restricted.join(", ")} entered Claude's context** for a branch teller${leak1 ? ", and the reply tells her about the Harbourfront closure" : ""}. The retrieval layer never asked who was asking.`
        : "This time no restricted chunk ranked in the top 3, but nothing in the retrieval layer would have stopped one.",
      next: "Phase 2: the same question, with Aisha's own token and an entitlement filter before ranking",
    });

    s.log("== Phase 2 · retrieval as Aisha: her short-lived token is validated and chunks outside her entitlements are dropped before ranking", "note");
    s.show("b_q", "closures + compassionate leave", "done");
    const p2 = await phase(s, E, true);
    for (const e of p2.log) s.log(`  retrieval as ${e.as}: "${E.short(e.query, 60)}" -> ${e.returned.join(", ") || "nothing"} (${e.decision})`, "note");
    s.show("b_id", p2.creds.length ? `${p2.creds.length} token(s) · sub u-aisha · aud ok` : "no search made", "done");
    // Fail closed: the same retrieval service refuses a token minted for a different audience.
    const probeLog = [];
    const probe = retrievalService(probeLog).search("Harbourfront closure", issueToken(USER.sub, "northwind-hr-portal"));
    s.log(`  probe: a token minted for northwind-hr-portal -> ${probe.isError ? `refused (${probe.status}): ${probe.message}` : "ACCEPTED"}`, "note");
    const leak2 = leaksClosure(p2.run.text);
    const cites03 = /HR-03#2/.test(p2.run.text);
    s.show("b_ret", E.short(`returned ${p2.reached.join(", ") || "nothing"} · ${p2.log[0]?.filtered_out ?? 0} dropped`, 60), "done");
    s.show("b_out", p2.restricted.length ? `${p2.restricted.join(", ")} reached Claude` : cites03 ? "leave answered [HR-03#2]; no closure data" : "no restricted text; leave not cited", !p2.restricted.length && !leak2 && cites03 ? "good" : "bad");

    return {
      final: p2.run.text,
      compare: {
        cols: [
          { title: "Phase 1: service account, no filter", short: "Service account", tone: "trap", said: p1.run.text,
            verdict: p1.restricted.length ? `${p1.restricted.join(", ")} reached Claude's context for a branch teller${leak1 ? ", and the reply discloses the closure" : ""}. Whatever the prompt says, the data has already crossed the boundary.`
              : "No restricted chunk ranked this time, but every search could read the whole library." },
          { title: "Phase 2: delegated token + entitlement filter", short: "Delegated token", tone: "fix", said: p2.run.text,
            verdict: !p2.restricted.length && cites03 ? `The retrieval service dropped ${p2.log[0]?.filtered_out ?? 0} chunks outside branch_teller entitlements before ranking. Claude answered the leave question from HR-03#2 and had nothing on closures to disclose.`
              : `Chunks returned: ${p2.reached.join(", ") || "none"}. Read the live output: Claude writes each run fresh.` },
        ],
        rows: [
          ["Identity on each retrieval call", "svc-policy-bot (read:all-documents)", { v: `u-aisha · aud ${AUDIENCE} · 5-min token`, tone: "good" }],
          ["Chunks that reached Claude", p1.reached.join(", ") || "none", p2.reached.join(", ") || "none"],
          ["Restricted chunks in Claude's context", { v: String(p1.restricted.length), tone: p1.restricted.length ? "bad" : "good" }, { v: String(p2.restricted.length), tone: p2.restricted.length ? "bad" : "good" }],
          ["Reply discloses the Harbourfront closure", { v: leak1 ? "yes" : "no", tone: leak1 ? "bad" : "good" }, { v: leak2 ? "yes" : "no", tone: leak2 ? "bad" : "good" }],
          ["Token for another audience (probe)", "not checked: no user token at all", { v: probe.isError ? `refused (${probe.status})` : "accepted", tone: probe.isError ? "good" : "bad" }],
        ],
        note: "Same question, same prompt, same tool. A prompt rule (A) or an output scan (B) acts after the restricted text is already in the context window; a narrower service account (D) is still one identity for every user. Authorization belongs in the retrieval layer, under the user's own identity (C).",
      },
      checks: [
        E.check("Phase 1: every retrieval ran as the service account, with no user identity", p1.log.length > 0 && p1.log.every((e) => e.as === "svc-policy-bot")),
        E.check("Phase 1: a restricted OPS-30 chunk entered Claude's context for a branch teller", p1.restricted.some((id) => id.startsWith("OPS-30"))),
        E.check("Phase 2: every retrieval ran under Aisha's own token for this audience, and chunks outside her entitlements were dropped", p2.log.length > 0 && p2.creds.every((c) => c.sub === "u-aisha" && c.aud === AUDIENCE) && p2.log.every((e) => e.decision.startsWith("allow: u-aisha") && e.filtered_out > 0)),
        E.check("Phase 2: no restricted chunk reached Claude, and the reply cites HR-03#2", p2.restricted.length === 0 && cites03),
        E.check("Phase 2 probe: a token minted for another audience was refused (fail closed)", probe.isError && probe.status === 401),
      ],
    };
  },
};
