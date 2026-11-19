// Domain 4 labs: a small Northwind Bank policy library, its weekly index and a role-aware retriever.
// Used by Lab 20 (evaluation metrics) and Lab 23 (diagnosing a RAG system after a document refresh).
// All content is fictional. Chunk ids are <doc>#<n>; every chunk carries the version it was embedded from.
import { retrieve } from "./d4-kit.js";

// The library as it stands today (the source of truth after the 14 Nov 2026 policy updates).
export const MANIFEST = {
  "LEND-04": { title: "Personal Loans", version: 7, updated: "2026-03-01" },
  "LEND-07": { title: "Mortgage Affordability", version: 4, updated: "2026-11-14" },
  "COMP-12": { title: "Anti-Money-Laundering", version: 9, updated: "2026-06-30" },
  "HR-03": { title: "Leave", version: 5, updated: "2026-01-05" },
  "HR-09": { title: "Remote Work", version: 6, updated: "2026-11-14" },
  "OPS-21": { title: "Incident Reporting", version: 3, updated: "2025-09-15" },
};

const C = (id, version, text, extra = {}) => ({ id, doc_id: id.split("#")[0], title: MANIFEST[id.split("#")[0]].title, version, text, ...extra });

// Current text of every chunk.
export const CURRENT = [
  C("LEND-04#1", 7, "Personal loans are available to customers aged 21 to 65 with a minimum annual income of S$30,000. The loan amount is S$1,000 up to six times monthly income, capped at S$200,000."),
  C("LEND-04#2", 7, "The maximum tenure for a personal loan is 7 years. Early repayment is allowed after 12 months, with a fee of 1.5% of the outstanding principal."),
  C("LEND-07#1", 4, "Total Debt Servicing Ratio (TDSR): a borrower's total monthly debt repayments, including the new mortgage, must not exceed 55% of gross monthly income. This limit applies to applications from 1 November 2026."),
  C("LEND-07#2", 4, "Mortgage Servicing Ratio (MSR) for HDB flats: the mortgage repayment must not exceed 30% of gross monthly income. Stress-test the interest rate at 4% or the actual rate, whichever is higher."),
  C("COMP-12#1", 9, "Cash transactions of S$20,000 or more, single or linked within 24 hours, require enhanced due diligence (EDD) and a signed source-of-funds declaration before they are processed."),
  C("COMP-12#2", 9, "Suspicious transaction reports are filed by the AML desk within 2 business days. Staff must never tell a customer that a report is being considered or filed.", { roles: ["compliance officer"] }),
  C("HR-03#1", 5, "Full-time staff receive 18 days of annual leave a year, rising to 21 days after five years of service. Up to 5 unused days can be carried forward and must be used by 31 March."),
  C("HR-03#2", 5, "Medical leave: up to 14 days of outpatient leave and 60 days of hospitalisation leave a year, each supported by a medical certificate."),
  C("HR-09#1", 6, "Eligible staff may work from home up to 3 days a week with their manager's approval. Branch-based roles, including tellers, are not eligible for remote work."),
  C("HR-09#2", 6, "The bank provides a laptop and a one-off S$300 home-office allowance to staff approved for remote work."),
  C("OPS-21#1", 3, "Report a suspected data breach or security incident to the Incident Desk (extension 4400) within 4 hours of discovery, even if the details are still incomplete."),
  C("OPS-21#2", 3, "The Incident Desk classifies each incident. For a notifiable data breach, the Data Protection Officer notifies the regulator within 3 calendar days."),
].map((c) => ({ ...c, indexed_at: "2026-11-17" }));

// Last week's text of the two documents that changed on 14 Nov.
const PREVIOUS = {
  "LEND-07#1": C("LEND-07#1", 3, "Total Debt Servicing Ratio (TDSR): a borrower's total monthly debt repayments, including the new mortgage, must not exceed 60% of gross monthly income. This limit applies to applications from 1 January 2025."),
  "LEND-07#2": C("LEND-07#2", 3, "Mortgage Servicing Ratio (MSR) for HDB flats: the mortgage repayment must not exceed 30% of gross monthly income. Stress-test the interest rate at 3.5% or the actual rate, whichever is higher."),
  "HR-09#1": C("HR-09#1", 5, "Eligible staff may work from home up to 2 days a week with their manager's approval. Branch-based roles, including tellers, are not eligible for remote work."),
};

// The index as the 17 Nov re-index left it: the job timed out embedding LEND-07 and HR-09 and kept the old vectors.
export function brokenIndex() {
  return CURRENT.map((c) => (PREVIOUS[c.id] ? { ...PREVIOUS[c.id], indexed_at: "2026-11-10" } : { ...c }));
}
export const healthyIndex = () => CURRENT.map((c) => ({ ...c }));

// Re-embed only the documents whose indexed version is behind the manifest.
export function reindex(index, docIds) {
  return index.map((c) => (docIds.includes(c.doc_id) ? { ...CURRENT.find((x) => x.id === c.id), indexed_at: "2026-11-19" } : c));
}

// Role-aware retrieval: chunks restricted to other roles are filtered out BEFORE scoring, and each call is logged.
export function search(index, query, role, k = 2, log = []) {
  const allowed = index.filter((c) => !c.roles || c.roles.includes(role));
  const hits = retrieve(allowed, query, k);
  log.push({ query, role, chunk_ids: hits.map((h) => h.id), restricted_served: hits.filter((h) => h.roles && !h.roles.includes(role)).length });
  return hits;
}

export const extracts = (hits) => hits.map((h) => `[${h.doc_id}] ${h.title}\n${h.text}`).join("\n\n");
