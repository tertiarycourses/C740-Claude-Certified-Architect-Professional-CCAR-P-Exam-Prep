// Simulator 2 · Northwind Policy Assistant: a small policy library and the retrieval code for Labs 16 and 17.
// The documents, the chunkers and the BM25 scorer are plain JS. Claude is real.
// Every person, document and number here is fictional.

// The policy library. Each document has an id, a version, an effective date, the roles that may read it,
// and numbered sections with headings. LEND-11 is the mortgage rate sheet: the current revision is a table,
// the superseded one (kept for complaint handling: a quoted rate must be honoured) is older prose.
export const DOCS = [
  { id: "LEND-04", title: "Personal Loans", rev: "2026-03", effective: "2026-03-01", roles: ["teller", "credit_officer"], sections: [
    { n: "1", h: "Scope", text: "This policy covers unsecured personal loans from $1,000 to $200,000 arranged at a branch or by phone." },
    { n: "2", h: "Eligibility", text: "Applicants must be aged 21 to 65 with a gross annual income of at least $30,000 and a credit score band of A to C." },
    { n: "3", h: "Guarantors for personal loans", text: "A guarantor may support an application when the applicant's income is below $30,000. The guarantor must be approved by a credit officer and signs the guarantee deed at the branch. One person may guarantee at most two loans." },
    { n: "4", h: "Repayment limits", text: "Total monthly repayments on all unsecured debt must not exceed 45% of gross monthly income. Branch staff may approve loans up to $50,000; larger loans need a credit officer." },
    { n: "5", h: "Cooling-off", text: "The customer may cancel within 7 days of signing without a fee." } ] },
  { id: "LEND-07", title: "Mortgage Affordability", rev: "2026-07", effective: "2026-07-01", roles: ["teller", "credit_officer"], sections: [
    { n: "1", h: "Scope", text: "This policy sets the affordability tests for residential mortgages, including refinancing from another bank." },
    { n: "2", h: "Income assessment", text: "Use gross monthly income. Count variable income such as bonuses and commission at 70% of the two-year average." },
    { n: "3", h: "Debt-servicing ratio", text: "The debt-servicing ratio (DSR) is total monthly debt repayments, including the proposed mortgage, divided by gross monthly income. The DSR must not exceed 55%. Branch staff decline any application above 55%." },
    { n: "4", h: "Stress test", text: "Assess repayments at the higher of the contract rate plus 2 percentage points or 5.5% a year." },
    { n: "5", h: "Guarantors for mortgages", text: "A mortgage guarantor must be an immediate family member with their own income, approved by a credit officer, and signs the deed of guarantee." },
    { n: "6", h: "Loan-to-value", text: "The loan-to-value limit is 80% for a first property and 75% for a second property." },
    { n: "7", h: "Exceptions", text: "Record every exception in the credit file with the approver's name. For a first home, the limit in section 3 rises to 60% where a guarantor approved under section 5 signs the deed; only a credit officer may approve this, never a teller. No exception applies to the stress test in section 4." },
    { n: "8", h: "Early repayment", text: "On a fixed-rate mortgage an early repayment fee of 1.5% of the amount repaid applies in years 1 and 2 of the fixed period, and no fee from year 3. Floating-rate mortgages carry no early repayment fee." } ] },
  { id: "LEND-09", title: "Credit Cards", rev: "2026-05", effective: "2026-05-01", roles: ["teller", "credit_officer"], sections: [
    { n: "1", h: "Credit limits", text: "A new card limit is up to 2 times monthly income, or 4 times for income above $120,000 a year." },
    { n: "2", h: "Supplementary cards", text: "The principal cardholder may add up to four supplementary cards and is liable for all spending on them." },
    { n: "3", h: "Fee waivers", text: "Branch staff may waive one annual fee per customer per year. A second waiver needs a team lead." } ] },
  { id: "COMP-12", title: "Anti-Money-Laundering", rev: "2026-09", effective: "2026-09-01", roles: ["teller", "credit_officer", "hr_partner"], sections: [
    { n: "1", h: "Cash deposits", text: "Record the source of funds for any cash deposit of $10,000 or more, in one deposit or several on the same day." },
    { n: "2", h: "Suspicious activity", text: "If a transaction looks structured to stay below $10,000, file an internal suspicious activity report within one working day. Do not tell the customer." },
    { n: "3", h: "Escalation", text: "The branch manager reviews the report the same day and passes it to the money-laundering reporting officer." } ] },
  { id: "COMP-15", title: "Sanctions Screening", rev: "2026-04", effective: "2026-04-01", roles: ["teller", "credit_officer"], sections: [
    { n: "1", h: "When to screen", text: "Screen every new customer, every new payee for an international transfer, and every guarantor against the sanctions list." },
    { n: "2", h: "A possible match", text: "Stop the transaction and send it to the sanctions team. Never release a payment while a match is open." } ] },
  { id: "COMP-08", title: "Customer Complaints", rev: "2026-02", effective: "2026-02-01", roles: ["teller", "credit_officer"], sections: [
    { n: "1", h: "Acknowledgement", text: "Acknowledge every complaint within 2 working days and give a reference number." },
    { n: "2", h: "Rate disputes", text: "If a customer was quoted a rate in writing, honour the rate that applied on the date of the quote. Look it up in the rate sheet in force on that date." } ] },
  { id: "HR-03", title: "Leave", rev: "2026-01", effective: "2026-01-01", roles: ["hr_partner", "teller", "credit_officer"], sections: [
    { n: "1", h: "Annual leave", text: "Staff earn 18 days of annual leave a year, rising to 21 days after five years of service." },
    { n: "2", h: "Carry-over", text: "Up to 5 unused days may be carried into the next year and must be used by 31 March." },
    { n: "3", h: "Medical leave", text: "Staff may take up to 14 days of paid medical leave a year with a medical certificate." } ] },
  { id: "HR-05", title: "Expenses", rev: "2026-01", effective: "2026-01-01", roles: ["hr_partner", "teller", "credit_officer"], sections: [
    { n: "1", h: "Claims", text: "Submit expense claims within 30 days with receipts. Claims above $500 need a line manager's approval." },
    { n: "2", h: "Travel", text: "Book economy class for flights under 6 hours." } ] },
  { id: "HR-09", title: "Remote Work", rev: "2026-06", effective: "2026-06-01", roles: ["hr_partner", "teller", "credit_officer"], sections: [
    { n: "1", h: "Eligibility", text: "Head-office staff may work remotely up to 2 days a week with their manager's agreement. Branch roles are not eligible." },
    { n: "2", h: "Security", text: "Use only bank-issued devices and the bank's VPN. Never print customer data at home." } ] },
  { id: "OPS-14", title: "Branch Cash Handling", rev: "2026-03", effective: "2026-03-01", roles: ["teller"], sections: [
    { n: "1", h: "Dual control", text: "Two staff members open the vault together and both sign the vault log." },
    { n: "2", h: "Till limits", text: "A teller's till holds at most $20,000. Transfer any excess to the vault within the hour." } ] },
  { id: "OPS-21", title: "Incident Reporting", rev: "2026-08", effective: "2026-08-01", roles: ["teller", "credit_officer", "hr_partner"], sections: [
    { n: "1", h: "What to report", text: "Report lost devices, data sent to the wrong customer, and system outages that affect customers." },
    { n: "2", h: "Deadline", text: "Log the incident in the incident portal within 4 hours of discovery. A data breach goes to the data protection officer at once." } ] },
  // LEND-11, superseded revision (1 Aug to 31 Oct 2026). Written as prose, the way rate sheets were written before November.
  { id: "LEND-11", title: "Mortgage Rate Sheet", rev: "2026-08", effective: "2026-08-01", expires: "2026-10-31", roles: ["teller", "credit_officer"], sections: [
    { n: "1", h: "Fixed rates", text: "The 2-year fixed rate is 4.05% a year for a loan-to-value up to 80%. The 3-year fixed rate is 4.15% a year for a loan-to-value up to 80%. The 5-year fixed rate is 4.35% a year for a loan-to-value up to 80%, or 4.20% for a loan-to-value up to 60%." },
    { n: "2", h: "Floating rate", text: "The floating rate is SORA plus 1.10% a year." } ],
    // The same rates as rows in the rate service, so a lookup for a past date (a complaint about an old quote) still works.
    data: [["2YF", "0-80.00", "4.05", "2026-08-01"], ["3YF", "0-80.00", "4.15", "2026-08-01"], ["5YF", "0-60.00", "4.20", "2026-08-01"],
           ["5YF", "60.01-80.00", "4.35", "2026-08-01"], ["FLT", "0-80.00", "SORA+1.10", "2026-08-01"]] },
  // LEND-11, current revision (from 1 Nov 2026). Published as a table: one row per product code and loan-to-value band.
  { id: "LEND-11", title: "Mortgage Rate Sheet", rev: "2026-11", effective: "2026-11-01", roles: ["teller", "credit_officer"], table: {
    header: ["product_code", "ltv_band", "rate_pct", "effective_from"],
    rows: [
      ["2YF", "0-60.00", "3.65", "2026-11-01"], ["2YF", "60.01-80.00", "3.79", "2026-11-01"],
      ["3YF", "0-60.00", "3.70", "2026-11-01"], ["3YF", "60.01-80.00", "3.85", "2026-11-01"],
      ["5YF", "0-60.00", "3.82", "2026-11-01"], ["5YF", "60.01-80.00", "3.95", "2026-11-01"],
      ["FLT", "0-80.00", "SORA+1.00", "2026-11-01"] ] } },
];

// The product codes the rate table uses. A structured tool can enumerate them in its schema; a text search cannot guess them.
export const PRODUCT_CODES = { "2YF": "2-year fixed", "3YF": "3-year fixed", "5YF": "5-year fixed", "FLT": "floating" };

// ---- Text utilities -------------------------------------------------------------------------------
const STOP = new Set("a an and are as at be by can do does for from has have if in into is it its may must no not of on or our the their them they this to under up was what when where which who will with would you your".split(" "));
const stem = (w) => w.length > 5 && w.endsWith("ing") ? w.slice(0, -3) : w.length > 4 && w.endsWith("ed") ? w.slice(0, -2) : w.length > 3 && w.endsWith("s") && !w.endsWith("ss") ? w.slice(0, -1) : w;
export const tokens = (t) => String(t).toLowerCase().split(/[^a-z0-9%.]+/).map((w) => w.replace(/^\.+|\.+$/g, "")).filter((w) => w && !STOP.has(w)).map(stem);

// A document as one flat string, the way a naive loader would extract it (headings become plain text).
export function flatten(d) {
  if (d.table) return `${d.id} ${d.title}\n${d.table.header.join(",")}\n${d.table.rows.map((r) => r.join(",")).join("\n")}`;
  return `${d.id} ${d.title}\n${d.sections.map((s) => `${s.n} ${s.h}. ${s.text}`).join("\n")}`;
}

// Chunker 1 (the trap): fixed windows of `size` characters, no overlap, no metadata. Cuts wherever the count lands.
// _from records the source document for the lab's own report only: it is never sent to Claude or stored in the index.
export function fixedChunks(docs = DOCS, size = 200) {
  const out = [];
  for (const d of docs) {
    const t = flatten(d);
    for (let i = 0; i < t.length; i += size) out.push({ id: `chunk-${String(out.length + 1).padStart(3, "0")}`, text: t.slice(i, i + size), _from: `${d.id} ${d.title}` });
  }
  return out;
}

// Chunker 2 (the fix): one chunk per section, cut along the document's own headings. Each chunk keeps its
// heading path as a prefix and carries metadata: document id, revision, section, effective date and roles.
export function sectionChunks(docs = DOCS) {
  const out = [];
  for (const d of docs) {
    if (d.table) continue;                       // tables are not text: Lab 17 serves them through a lookup tool
    for (const s of d.sections) out.push({
      id: `${d.id}§${s.n}`, doc: d.id, rev: d.rev, section: s.n, heading: s.h, effective: d.effective, expires: d.expires || null, roles: d.roles,
      title: `${d.id} ${d.title} › ${s.n} ${s.h}`,
      text: `${d.id} ${d.title} › ${s.n} ${s.h}\n${s.text}`,
    });
  }
  return out;
}

// BM25 over any list of { id, text }: the simulated retriever (a keyword scorer stands in for a search service).
export function bm25(chunks, k1 = 1.2, b = 0.75) {
  const docs = chunks.map((c) => tokens(c.text));
  const avg = docs.reduce((n, d) => n + d.length, 0) / Math.max(1, docs.length);
  const df = new Map();
  for (const d of docs) for (const w of new Set(d)) df.set(w, (df.get(w) || 0) + 1);
  const N = docs.length;
  return {
    search(query, k = 3, filter = () => true) {
      const q = [...new Set(tokens(query))];
      const scored = chunks.map((c, i) => {
        if (!filter(c)) return null;
        const tf = new Map(); for (const w of docs[i]) tf.set(w, (tf.get(w) || 0) + 1);
        let score = 0;
        for (const w of q) {
          const f = tf.get(w) || 0; if (!f) continue;
          const idf = Math.log(1 + (N - df.get(w) + 0.5) / (df.get(w) + 0.5));
          score += idf * (f * (k1 + 1)) / (f + k1 * (1 - b + b * docs[i].length / avg));
        }
        return { ...c, score: Math.round(score * 100) / 100 };
      }).filter((x) => x && x.score > 0);
      return scored.sort((x, y) => y.score - x.score).slice(0, k);
    },
  };
}

// A simulated semantic ranker: a small concept map stands in for embeddings (it matches meaning across
// different words, e.g. "first-time buyer" and "first home"). Fused with BM25 by reciprocal rank (k = 60).
const CONCEPTS = [
  ["first-time", "first home", "first property", "first-time buyer"],
  ["early repayment", "repay early", "prepayment", "pay off early", "redeem"],
  ["fee", "charge", "penalty"],
  ["dsr", "debt-servicing", "affordability"],
  ["ltv", "loan-to-value"],
];
function expand(q) {
  const l = q.toLowerCase(); const extra = [];
  for (const group of CONCEPTS) if (group.some((p) => l.includes(p))) extra.push(...group);
  return `${q} ${extra.join(" ")}`;
}
export function hybrid(chunks) {
  const lex = bm25(chunks);
  return {
    search(query, k = 3, filter = () => true) {
      const a = lex.search(query, 20, filter), s = lex.search(expand(query), 20, filter);
      const rrf = new Map();
      for (const list of [a, s]) list.forEach((c, i) => { const r = rrf.get(c.id) || { ...c, score: 0 }; r.score += 1 / (60 + i + 1); rrf.set(c.id, r); });
      return [...rrf.values()].sort((x, y) => y.score - x.score).slice(0, k).map((c) => ({ ...c, score: Math.round(c.score * 10000) / 10000 }));
    },
  };
}

// The rate table as data: a structured lookup by product code, loan-to-value and date. Picks the revision
// in force on `as_of`, so the superseded sheet stays available for complaints about past quotes.
export function lookupRate({ product_code, ltv_pct, as_of }) {
  const code = String(product_code || "").toUpperCase();
  if (!PRODUCT_CODES[code]) return { isError: true, message: `Unknown product_code ${product_code}. Valid: ${Object.keys(PRODUCT_CODES).join(", ")}` };
  const day = as_of || "2026-11-19";
  const sheets = DOCS.filter((d) => d.id === "LEND-11" && d.effective <= day && (!d.expires || d.expires >= day));
  const sheet = sheets[0];
  if (!sheet) return { isError: true, message: `No rate sheet in force on ${day}.` };
  const ltv = Number(ltv_pct);
  const row = (sheet.table ? sheet.table.rows : sheet.data).find((r) => { if (r[0] !== code) return false; const [lo, hi] = r[1].split("-").map(Number); return ltv >= lo && ltv <= hi; });
  if (!row) return { isError: true, message: `No ${code} row covers a loan-to-value of ${ltv_pct}%. The maximum is 80%.` };
  return { source: `LEND-11 rev ${sheet.rev}`, product_code: code, product: PRODUCT_CODES[code], ltv_band: row[1], rate_pct: row[2], effective_from: row[3] };
}

// The "one index for everything" a naive pipeline builds: every prose section (current and superseded) plus each
// table flattened into text chunks of `rows` rows. The header row lands only in the first chunk, as a CSV splitter leaves it.
export function flatIndexChunks(rows = 2) {
  const out = sectionChunks(DOCS).map((c) => ({ ...c }));
  for (const d of DOCS) {
    if (!d.table) continue;
    const lines = d.table.rows.map((r) => r.join(","));
    for (let i = 0; i < lines.length; i += rows)
      out.push({ id: `${d.id}-r${d.rev}-rows${i + 1}-${Math.min(i + rows, lines.length)}`, doc: d.id, rev: d.rev, effective: d.effective, roles: d.roles,
        title: `${d.id} ${d.title} rev ${d.rev}`, text: `${i === 0 ? d.table.header.join(",") + "\n" : ""}${lines.slice(i, i + rows).join("\n")}` });
  }
  return out;
}
