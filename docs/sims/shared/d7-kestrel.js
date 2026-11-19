// Simulator 6 · Kestrel platform team: the fixtures behind Labs 36–38 (Domain 7).
// Kestrel Software's platform team rolls Claude Code out to 40 engineers in four squads and runs Claude-powered
// features in production. Simulated here in plain JS: the kestrel/checkout-service repository and the engineers'
// home folders (Lab 36), two pull requests and the team's review skill (Lab 37), and an observability store with
// logs, traces, deploys and a staging replay for the order-summary service (Lab 38). Claude is real.
// Fictional company and people; the "secret" below is a fake string.

// ------------------------------------------------------------------ Lab 36 · team configuration
export const REPO = {
  "README.md": "# checkout-service\nKestrel's checkout API. Python 3.12, managed with uv.\n",
  "pyproject.toml": "[project]\nname = \"checkout-service\"\nversion = \"4.2.0\"\nrequires-python = \">=3.12\"\n",
  ".gitignore": ".env\n.claude/settings.local.json\n__pycache__/\n",
  ".env.example": "SENTRY_AUTH_TOKEN=\nPAYMENTS_URL=\n",
  "src/checkout/cart.py": "class Cart:\n    def __init__(self):\n        self.lines = []\n\n    def add(self, sku, price_cents, qty=1):\n        self.lines.append((sku, price_cents, qty))\n\n    def total_cents(self):\n        return sum(p * q for _, p, q in self.lines)\n",
  "tests/test_cart.py": "from checkout.cart import Cart\n\n\ndef test_empty_cart_total_is_zero():\n    assert Cart().total_cents() == 0\n",
};

// Ana Silva (squad 2) built the team's conventions up in her OWN home folder. Nobody else's session sees them.
export const ANA_HOME = {
  "~/.claude/CLAUDE.md": "# My Claude notes\n- Run `uv run pytest -q` before saying a change is done.\n- Branch names: squad-<n>/<ticket>. Never commit to main.\n- Review with my checklist before opening a PR.\n",
  "~/.claude/settings.json": JSON.stringify({ permissions: { allow: ["Bash(*)"] } }, null, 2) + "\n",
  "~/.claude.json": JSON.stringify({ mcpServers: { sentry: { type: "http", url: "https://sentry.kestrel.example/mcp", headers: { Authorization: "Bearer sntrys_live_4f9a2c7e1b0d" } } } }, null, 2) + "\n",
};

// The same conventions, committed to the repository where every teammate's session loads them.
export const TEAM_CONFIG = {
  "CLAUDE.md": "# checkout-service\n\n## Commands\n- Test: `uv run pytest -q`. Run it before saying a change is done.\n- Lint: `uv run ruff check .`\n\n## Conventions\n- Branch names: squad-<n>/<ticket>. Never commit to main.\n- Money is integer cents, never floats.\n- Run /pr-review before opening a pull request.\n",
  ".claude/settings.json": JSON.stringify({ permissions: {
    allow: ["Bash(uv run pytest:*)", "Bash(uv run ruff:*)", "Bash(git diff:*)", "Bash(git status)"],
    deny: ["Bash(git push --force:*)", "Bash(rm -rf:*)", "Read(./.env)"] } }, null, 2) + "\n",
  ".claude/skills/pr-review/SKILL.md": "---\nname: pr-review\ndescription: Review a Kestrel pull request against the team checklist (KR-1..KR-4) and report findings as JSON.\n---\nCheck the diff against KR-1..KR-4 in docs/review-rules.md. One finding per violation: file, line, rule, severity.\n",
  ".mcp.json": JSON.stringify({ mcpServers: { sentry: { type: "http", url: "https://sentry.kestrel.example/mcp", headers: { Authorization: "Bearer ${SENTRY_AUTH_TOKEN}" } } } }, null, 2) + "\n",
};

const json = (t) => { try { return JSON.parse(t); } catch { return null; } };
const norm = (p) => String(p).trim().replace(/^\/repo\//, "").replace(/^\.\//, "").replace(/^\/?Users\/[^/]+\//, "~/").replace(/^\$HOME\//, "~/");
export const credentialOf = (server) => {
  const t = JSON.stringify(server || {});
  if (/\$\{[A-Z_][A-Z0-9_]*\}/.test(t)) return "env_var_reference";
  if (/Bearer\s+[A-Za-z0-9_\-.]{8,}|sntrys_|api[_-]?key"\s*:\s*"[^"$]{8,}/i.test(t)) return "literal_secret";
  return "none";
};

// What a Claude Code session started in the repository loads, from the files that session can see.
// Instruction files: ~/.claude/CLAUDE.md (user), CLAUDE.md and .claude/CLAUDE.md (project).
// Permission lists merge across ~/.claude/settings.json, .claude/settings.json and .claude/settings.local.json.
// Skills: <scope>/.claude/skills/<name>/SKILL.md. MCP servers: .mcp.json (project) and ~/.claude.json (user).
export function sessionLoads(files) {
  const has = (p) => p in files;
  const instruction_files = ["~/.claude/CLAUDE.md", "CLAUDE.md", ".claude/CLAUDE.md"].filter(has);
  const allow = [], deny = [];
  for (const p of ["~/.claude/settings.json", ".claude/settings.json", ".claude/settings.local.json"]) {
    const j = has(p) && json(files[p]); if (!j) continue;
    allow.push(...(j.permissions?.allow || [])); deny.push(...(j.permissions?.deny || []));
  }
  const skills = Object.keys(files).map((p) => /^(?:~\/)?\.claude\/skills\/([^/]+)\/SKILL\.md$/.exec(p)?.[1]).filter(Boolean).sort();
  const mcp = [];
  for (const [p, scope] of [[".mcp.json", "project"], ["~/.claude.json", "user"]]) {
    const j = has(p) && json(files[p]);
    for (const [name, srv] of Object.entries(j?.mcpServers || {})) mcp.push({ name, scope, file: p, credential: credentialOf(srv) });
  }
  return { instruction_files, allow: [...new Set(allow)], deny: [...new Set(deny)], skills, mcp_servers: mcp, instructions: instruction_files.map((p) => files[p]).join("\n") };
}

// The platform team's policy: what EVERY teammate's session must have.
export const POLICY = [
  { id: "P1", text: "Test command rule in an instruction file", ok: (L) => /uv run pytest/.test(L.instructions) },
  { id: "P2", text: "Deny git push --force", ok: (L) => L.deny.some((r) => /^Bash\(git push --force/.test(r)) },
  { id: "P3", text: "Deny reading .env", ok: (L) => L.deny.includes("Read(./.env)") },
  { id: "P4", text: "Shared pr-review skill", ok: (L) => L.skills.includes("pr-review") },
  { id: "P5", text: "Sentry MCP with no secret in the file", ok: (L) => L.mcp_servers.some((m) => m.name === "sentry" && m.credential === "env_var_reference") },
];
export const policyMet = (L) => POLICY.filter((p) => p.ok(L)).map((p) => p.id);
export const risky = (L) => [...L.allow.filter((r) => r === "Bash(*)" || r === "Bash"), ...L.mcp_servers.filter((m) => m.credential === "literal_secret").map((m) => `literal secret in ${m.file}`)];
export const compareReport = (rep, L) => {
  const set = (xs) => [...new Set((xs || []).map(norm))].sort().join("|");
  return {
    files: set(rep?.instruction_files) === set(L.instruction_files),
    allow: set(rep?.allow) === set(L.allow),
    deny: set(rep?.deny) === set(L.deny),
    skills: set(rep?.skills) === set(L.skills),
    mcp: set((rep?.mcp_servers || []).map((m) => `${m.name}:${m.credential}`)) === set(L.mcp_servers.map((m) => `${m.name}:${m.credential}`)),
  };
};

// ------------------------------------------------------------------ Lab 37 · AI-assisted review in the team's flow
export const REVIEW_SKILL = `---
name: pr-review
description: Review a Kestrel pull request against the team checklist and report findings as JSON.
---
Check ONLY these rules. One finding per violation, with the file and the line number shown.
- KR-1 (high): no card numbers, CVV, emails or other personal data in logs or error messages.
- KR-2 (high): every call that moves money (charge, refund) sends an Idempotency-Key header.
- KR-3 (medium): every outbound HTTP call sets a timeout.
- KR-4 (low): changed behaviour comes with a test.
If nothing breaks a rule, return no findings and verdict pass.`;
export const HIGH_RULES = ["KR-1", "KR-2"];

export const PRS = {
  512: { title: "Partial refunds from the order page", author: "Dev Patel (squad 3)", files: {
    "payments/refund.py": `"""Refunds for the checkout service."""
import logging
import requests

from checkout.config import PAYMENTS_URL

log = logging.getLogger(__name__)


def refund(order, amount_cents, card):
    """Refund part or all of an order to the card it was paid with."""
    if amount_cents <= 0 or amount_cents > order.total_cents:
        raise ValueError("refund amount out of range")
    log.info("refunding %s cents to card %s for order %s", amount_cents, card.number, order.id)
    resp = requests.post(
        f"{PAYMENTS_URL}/refunds",
        json={"order_id": order.id, "amount_cents": amount_cents, "card_token": card.token},
    )
    resp.raise_for_status()
    return resp.json()["refund_id"]
` }, planted: [{ rule: "KR-1", file: "payments/refund.py", line: 14 }, { rule: "KR-2", file: "payments/refund.py", line: 15 }] },
  513: { title: "Test for cart totals", author: "Mei Ling Goh (squad 1)", files: {
    "tests/test_cart.py": `from checkout.cart import Cart


def test_empty_cart_total_is_zero():
    assert Cart().total_cents() == 0


def test_total_adds_line_items():
    cart = Cart()
    cart.add("SKU-1", price_cents=1250, qty=2)
    assert cart.total_cents() == 2500
` }, planted: [] },
};
// The changed files as the CI step hands them over: with line numbers.
export const numbered = (pr) => Object.entries(PRS[pr].files).map(([f, src]) =>
  `=== ${f} (new version)\n${src.replace(/\n$/, "").split("\n").map((l, i) => `${String(i + 1).padStart(3)}  ${l}`).join("\n")}`).join("\n\n");
// The same change as an engineer pastes it into chat: a raw diff.
export const pasted = (pr) => Object.entries(PRS[pr].files).map(([f, src]) => `+++ b/${f}\n${src.split("\n").map((l) => `+${l}`).join("\n")}`).join("\n");

export const FINDINGS_SCHEMA = { type: "object", additionalProperties: false, properties: {
  findings: { type: "array", items: { type: "object", additionalProperties: false, properties: {
    file: { type: "string" }, line: { type: "integer" },
    rule: { type: "string", enum: ["KR-1", "KR-2", "KR-3", "KR-4"] },
    severity: { type: "string", enum: ["high", "medium", "low"] },
    message: { type: "string" } }, required: ["file", "line", "rule", "severity", "message"] } },
  verdict: { type: "string", enum: ["pass", "fail"] } }, required: ["findings", "verdict"] };

// The CI gate: plain code, no model. Exit 1 blocks the merge.
export function gate(text) {
  let j; try { j = JSON.parse(text); } catch { return { parsed: false, exit: null, why: "not JSON: no machine-readable result" }; }
  if (!Array.isArray(j?.findings)) return { parsed: false, exit: null, why: "no findings array" };
  const high = j.findings.filter((f) => f.severity === "high" || HIGH_RULES.includes(f.rule));
  return { parsed: true, j, high, exit: high.length ? 1 : 0, why: high.length ? `${high.length} high-severity finding(s)` : "no high-severity finding" };
}

// ------------------------------------------------------------------ Lab 38 · on-call debugging
export const ALERT = "PAGE · order-summary: error rate 6.1% (baseline 0.2%) since Tue 14:10. Customers see \"Order summary unavailable\" on the confirmation page. Ticket SUP-2291: \"My order went through but the summary page says unavailable.\"";

const T = (id, at, items, extra = {}) => ({ trace_id: id, at, items_in_order: items, ...extra });
// Needed output tokens grow with the order: about 180 + 70 per line item.
const need = (items) => 180 + 70 * items;
const DEPLOY_AT = "Tue 14:05";
export const TRACES = [
  T("tr-9e41", "Mon 11:02", 3), T("tr-9e77", "Mon 15:40", 6), T("tr-9f02", "Tue 10:15", 16), T("tr-9f19", "Tue 12:31", 5, { inventory_timeout: true }), T("tr-9f88", "Tue 13:52", 15),
  T("tr-a120", "Tue 15:02", 4), T("tr-a131", "Tue 15:20", 17), T("tr-a142", "Tue 16:45", 7, { inventory_timeout: true }), T("tr-a157", "Wed 09:12", 14),
  T("tr-a163", "Wed 10:30", 2), T("tr-a188", "Wed 13:05", 19), T("tr-a194", "Wed 16:20", 8),
].map((t) => {
  const before = (hhmm) => t.at.startsWith("Mon") || (t.at.startsWith("Tue") && t.at < `Tue ${hhmm}`);
  const after = !before("14:05");
  const max_tokens = after ? 1024 : 2048, needed = need(t.items_in_order), cut = needed > max_tokens;
  return { ...t, service: "order-summary", model: "claude-haiku-5-5", config_version: after ? "v42" : "v41", prompt_version: before("13:40") ? "v16" : "v17", max_tokens,
    input_tokens: 1450 + 40 * t.items_in_order, output_tokens: cut ? max_tokens : needed, stop_reason: cut ? "max_tokens" : "end_turn",
    latency_ms: (cut ? max_tokens : needed) * 4 + 300 + (t.inventory_timeout ? 5000 : 0),
    tool_calls: [{ name: "get_inventory", latency_ms: t.inventory_timeout ? 5000 : 120, status: t.inventory_timeout ? "timeout, used cached stock" : "ok" }],
    app_result: cut ? "error: JSONDecodeError while parsing the model's summary; page shows 'Order summary unavailable'" : "ok: summary rendered", _needed: needed };
});
export const FAILING = TRACES.filter((t) => t.stop_reason === "max_tokens").map((t) => t.trace_id);
export const DEPLOYS = [
  { at: "Mon 10:12", service: "inventory-service", change: "v3.1: new stock cache" },
  { at: "Tue 13:40", service: "order-summary", change: "prompt v17: adds a loyalty-points line to each summary" },
  { at: DEPLOY_AT, service: "order-summary", change: "config v42: max_tokens 2048 -> 1024 (cost review CR-118)" },
];
const LOG_GROUPS = [
  { message: "order_summary_failed: JSONDecodeError: Unterminated string starting at line 1", before_tue_1405: 0, since_tue_1405: 58, sample_trace_ids: ["tr-a131", "tr-a157", "tr-a188"] },
  { message: "tool get_inventory timeout after 5000 ms (fallback: cached stock, summary still rendered)", before_tue_1405: 21, since_tue_1405: 19, sample_trace_ids: ["tr-9f19", "tr-a142"] },
  { message: "anthropic API 529 overloaded, retried OK", before_tue_1405: 3, since_tue_1405: 2, sample_trace_ids: [] },
];

export function opsTools(log) {
  const pub = (t) => { const { _needed, ...rest } = t; return rest; };
  return {
    search_logs: {
      description: "Search order-summary's error logs. Returns error groups with counts before and since Tue 14:05 and sample trace ids. Optional query filters by text.",
      input_schema: { type: "object", additionalProperties: false, properties: { query: { type: "string" } } },
      run: ({ query } = {}) => { log.push({ tool: "search_logs" }); const q = (query || "").toLowerCase();
        const hits = LOG_GROUPS.filter((g) => !q || q.split(/\s+/).some((w) => g.message.toLowerCase().includes(w)));
        return { service: "order-summary", window: "Mon 00:00 to Wed 18:00", groups: hits.length ? hits : LOG_GROUPS }; },
    },
    get_trace: {
      description: "Fetch one trace by trace_id: model, config and prompt version, max_tokens, input/output tokens, stop_reason, latency, tool calls, the app's result.",
      input_schema: { type: "object", additionalProperties: false, properties: { trace_id: { type: "string" } }, required: ["trace_id"] },
      run: ({ trace_id }) => { log.push({ tool: "get_trace", trace_id }); const t = TRACES.find((x) => x.trace_id === trace_id);
        return t ? pub(t) : { isError: true, message: `No trace ${trace_id}. Known healthy examples: tr-a120 (after Tue 14:05), tr-9f02 (before).` }; },
    },
    list_traces: {
      description: "List order-summary traces (id, time, items_in_order, stop_reason, app result), optionally only failures.",
      input_schema: { type: "object", additionalProperties: false, properties: { failed_only: { type: "boolean" } } },
      run: ({ failed_only } = {}) => { log.push({ tool: "list_traces" });
        return TRACES.filter((t) => !failed_only || t.stop_reason === "max_tokens").map((t) => ({ trace_id: t.trace_id, at: t.at, items_in_order: t.items_in_order, stop_reason: t.stop_reason, app_result: t.app_result.split(":")[0] })); },
    },
    list_deploys: {
      description: "List recent deploys and config changes for order-summary and its dependencies.",
      input_schema: { type: "object", additionalProperties: false, properties: {} },
      run: () => { log.push({ tool: "list_deploys" }); return DEPLOYS; },
    },
    rerun_request: {
      description: "Replay a recorded order-summary request in staging, exactly as it was sent, optionally overriding max_tokens. Returns stop_reason, output_tokens and whether the app could parse the summary JSON.",
      input_schema: { type: "object", additionalProperties: false, properties: { trace_id: { type: "string" }, max_tokens: { type: "integer" } }, required: ["trace_id"] },
      run: ({ trace_id, max_tokens }) => { const t = TRACES.find((x) => x.trace_id === trace_id);
        if (!t) return { isError: true, message: `No recorded request for ${trace_id}` };
        const mt = max_tokens || t.max_tokens, cut = t._needed > mt;
        const r = { trace_id, max_tokens: mt, stop_reason: cut ? "max_tokens" : "end_turn", output_tokens: cut ? mt : t._needed, summary_json_valid: !cut };
        log.push({ tool: "rerun_request", ...r, original: mt === t.max_tokens }); return r; },
    },
  };
}
export const ROOT_CAUSES = ["max_tokens_truncation", "tool_timeout", "prompt_regression", "api_overload", "model_regression", "unknown"];

// Glob over an E.repo() with brace expansion ({a,b}), which the engine's Glob leaves out. Same tool name and shape.
export function braceGlob(r) {
  const expand = (p) => { const m = /\{([^{}]*)\}/.exec(p); return m ? m[1].split(",").flatMap((x) => expand(p.slice(0, m.index) + x + p.slice(m.index + m[0].length))) : [p]; };
  return { ...r.tools.Glob, description: "Find files by NAME pattern: * within a folder, ** across folders, {a,b} for alternatives, e.g. **/*.json or .claude/**. Paths are relative to the repository; ~/ is the home folder. Returns matching paths.",
    run: ({ pattern }) => { const hits = [...new Set(expand(String(pattern).replace(/^\.\//, "")).flatMap((p) => r.glob(p)))].sort(); return hits.join("\n") || "No files match."; } };
}
