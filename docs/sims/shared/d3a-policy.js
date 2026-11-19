// Simulator 2 · Northwind Policy Assistant: a policy index with access control lists, a fake identity provider
// and a retrieval service, for Lab 13 (authentication and authorization gaps). Fictional bank, staff and policies.
// Retrieval is keyword scoring in plain JS; the ACL lives in the index metadata, never in the chunk text.

export const STAFF = {
  "u-aisha": { sub: "u-aisha", name: "Aisha Rahman", role: "branch_teller", branch: "Harbourfront" },
  "u-marcus": { sub: "u-marcus", name: "Marcus Lee", role: "credit_officer", branch: "Head office" },
  "u-joanna": { sub: "u-joanna", name: "Joanna Teo", role: "hr_partner", branch: "Head office" },
};

const ALL = ["branch_teller", "credit_officer", "hr_partner", "executive"];
export const CHUNKS = [
  { id: "HR-03#1", doc: "HR-03 Leave", acl: ALL, text: "Annual leave: 18 days a year for all permanent staff, plus 1 day for each 5 years of service. Apply through the HR portal at least 2 weeks ahead." },
  { id: "HR-03#2", doc: "HR-03 Leave", acl: ALL, text: "Compassionate leave on the death of a family member: 3 days for immediate family (spouse, child, parent, sibling); 1 day for extended family (grandparent, grandchild, parent-in-law, aunt, uncle). Tell your line manager on the day." },
  { id: "HR-09#1", doc: "HR-09 Remote Work", acl: ALL, text: "Remote work: head-office roles may work remotely up to 2 days a week with manager approval. Branch-facing roles, including tellers, are not eligible." },
  { id: "LEND-04#1", doc: "LEND-04 Personal Loans", acl: ALL, text: "Personal loans: US$1,000 to US$50,000, terms of 1 to 7 years. The branch takes the application; a credit officer decides." },
  { id: "LEND-07#3", doc: "LEND-07 Mortgage Affordability", acl: ["credit_officer", "executive"], text: "Mortgage affordability: assess repayments at the product rate plus a 3.0 percentage point stress buffer. Debt-service ratio must stay below 40% at the stressed rate." },
  { id: "COMP-12#4", doc: "COMP-12 Anti-Money-Laundering", acl: ["credit_officer", "executive"], text: "Internal escalation: refer any cash pattern that matches the structuring indicators in Annex B to the MLRO within 24 hours. Never tell the customer a referral was made." },
  { id: "HR-14#1", doc: "HR-14 Pay Bands", acl: ["hr_partner", "executive"], text: "Pay bands 2027: branch teller band T2 US$38,000 to US$46,000; the 2027 pay review is capped at 2.5% for bands T1 to T3." },
  { id: "OPS-30#1", doc: "OPS-30 Branch Network Review 2027", acl: ["hr_partner", "executive"], text: "Branch network review 2027: the Harbourfront, Eastgate and Mill Lane branches close on 30 June 2027. Staff consultation opens 2 February 2027; branch staff are told on that date." },
  { id: "OPS-30#2", doc: "OPS-30 Branch Network Review 2027", acl: ["hr_partner", "executive"], text: "Closure list rationale: Harbourfront branch footfall fell 41% in two years; its accounts move to the Central branch. Redeployment offers go to tellers first." },
  { id: "OPS-21#1", doc: "OPS-21 Incident Reporting", acl: ALL, text: "Report any operational incident (system outage, cash difference, suspected fraud) to the branch manager at once and log it in the incident tool within 4 hours." },
];

// The identity provider: mints short-lived tokens bound to one audience (the resource they are for).
export const AUDIENCE = "northwind-policy-search";
let seq = 0;
export function issueToken(sub, aud = AUDIENCE, ttlSec = 300) {
  const u = STAFF[sub];
  return { token: `nw.${sub}.${++seq}`, sub, role: u?.role, aud, exp: Math.floor(Date.now() / 1000) + ttlSec };
}
export const SERVICE_ACCOUNT = { token: "svc-policy-bot.static", sub: "svc-policy-bot", role: "service", aud: "*", exp: Infinity, scope: "read:all-documents" };

// Keyword scoring (a small stand-in for BM25 over the index).
const words = (t) => String(t).toLowerCase().match(/[a-z0-9]+/g) || [];
const STOP = new Set(["the", "a", "an", "of", "to", "is", "on", "for", "and", "or", "i", "my", "do", "if", "in", "it", "be", "how", "many", "what", "are", "get", "next", "year", "any", "me", "this", "that", "at", "by", "with", "will"]);
function score(q, chunk) {
  const qs = words(q).filter((w) => !STOP.has(w));
  const ws = words(chunk.doc + " " + chunk.text);
  return qs.reduce((n, w) => n + ws.filter((x) => x === w || (w.length > 4 && x.startsWith(w.slice(0, -1)))).length, 0);
}

// The retrieval service. mode "service": one service account reads everything and filters nothing (the trap).
// mode "delegated": the caller's own token is validated (audience, expiry) and chunks are filtered by the
// caller's role BEFORE ranking, so nothing the user may not read ever reaches the model. Every failure denies.
export function retrievalService(log) {
  return {
    search(query, cred, k = 3) {
      const entry = { query, as: cred.sub, role: cred.role, decision: "", returned: [], filtered_out: 0 };
      log.push(entry);
      let pool = CHUNKS;
      if (cred !== SERVICE_ACCOUNT) {
        if (!cred || !cred.token) { entry.decision = "deny: no token"; return { isError: true, status: 401, message: "No user token: request denied." }; }
        if (cred.aud !== AUDIENCE) { entry.decision = `deny: audience ${cred.aud}`; return { isError: true, status: 401, message: `Token audience ${cred.aud} is not ${AUDIENCE}: request denied.` }; }
        if (cred.exp < Date.now() / 1000) { entry.decision = "deny: expired"; return { isError: true, status: 401, message: "Token expired: request denied." }; }
        if (!STAFF[cred.sub]) { entry.decision = "deny: unknown user"; return { isError: true, status: 403, message: "Unknown user: request denied." }; }
        pool = CHUNKS.filter((c) => c.acl.includes(STAFF[cred.sub].role));
        entry.filtered_out = CHUNKS.length - pool.length;
        entry.decision = `allow: ${cred.sub} (${STAFF[cred.sub].role}), ${entry.filtered_out} chunks outside entitlements dropped before ranking`;
      } else entry.decision = "allow: service account, read:all-documents, no filter";
      const hits = pool.map((c) => ({ c, n: score(query, c) })).filter((h) => h.n > 0).sort((a, b) => b.n - a.n).slice(0, k);
      entry.returned = hits.map((h) => h.c.id);
      return { results: hits.map((h) => ({ chunk_id: h.c.id, document: h.c.doc, text: h.c.text })) };
    },
  };
}

export const restrictedFor = (role) => CHUNKS.filter((c) => !c.acl.includes(role)).map((c) => c.id);
