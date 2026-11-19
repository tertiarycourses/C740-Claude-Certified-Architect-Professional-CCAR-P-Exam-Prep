// Simulator 6 · Kestrel Platform Team: the on-call agent's tool catalogue (40 tools on 7 MCP servers) and
// runbook library (24 runbooks) for Lab 19. The backends are plain JS; Claude is real. All records are fictional.
import { bm25 } from "./d3b-northwind.js";

export const INCIDENT = "INC-5531 (sev 2, opened 06:14 UTC 2026-11-19): checkout-service prod 5xx rate 7.1% and p95 latency 4.8 s since 06:12 UTC. " +
  "Recent changes: feature flag checkout.new-tax-engine went from 10% to 100% at 06:10 UTC; last deploy v4.12.0 on 2026-11-17.";

// ---- Tools: [server, name, description, properties, required] -----------------------------------------
const S = (type, description, extra = {}) => ({ type, description, ...extra });
const SVC = S("string", "Service name, e.g. checkout-service");
const SPEC = [
  ["deploy", "deploy_status", "Show the version currently running for a service in an environment, with the time it was deployed and who approved it.", { service: SVC, env: S("string", "prod or staging") }, ["service"]],
  ["deploy", "deploy_history", "List the last N deploys of a service with version, time, author and change summary. Use to correlate an incident with a recent deploy.", { service: SVC, limit: S("integer", "How many deploys, default 5") }, ["service"]],
  ["deploy", "deploy_rollback", "Roll a service back to its previous version. Reverts every change in the last deploy; takes about 20 minutes for checkout-service. Use only when a runbook calls for it.", { service: SVC, to_version: S("string", "Version to roll back to") }, ["service"]],
  ["deploy", "deploy_promote", "Promote a version from staging to prod after its checks have passed.", { service: SVC, version: S("string", "Version") }, ["service", "version"]],
  ["deploy", "deploy_pause", "Pause all further deploys of a service until resumed.", { service: SVC, reason: S("string", "Why") }, ["service", "reason"]],
  ["deploy", "canary_status", "Show the error rate and latency of the running canary against the baseline.", { service: SVC }, ["service"]],
  ["deploy", "canary_abort", "Abort the running canary and send all traffic back to the baseline version.", { service: SVC }, ["service"]],
  ["flags", "flag_get", "Read a feature flag's current state: enabled, rollout percentage and targeting rules.", { flag: S("string", "Flag key, e.g. checkout.new-tax-engine") }, ["flag"]],
  ["flags", "flag_history", "List recent changes to a feature flag with time, old and new rollout and who changed it.", { flag: S("string", "Flag key") }, ["flag"]],
  ["flags", "flag_set_rollout", "Set a feature flag's rollout percentage (0 to 100). Takes effect within 30 seconds.", { flag: S("string", "Flag key"), percent: S("integer", "0-100") }, ["flag", "percent"]],
  ["flags", "flag_disable", "Turn a feature flag off for everyone at once (kill switch). Takes effect within 30 seconds and changes no code.", { flag: S("string", "Flag key"), reason: S("string", "Why") }, ["flag", "reason"]],
  ["flags", "flag_list", "List feature flags for a service with their rollout percentage.", { service: SVC }, ["service"]],
  ["observability", "metrics_query", "Query a service metric (error_rate, p95_latency_ms, rps) over the last N minutes.", { service: SVC, metric: S("string", "error_rate, p95_latency_ms or rps"), minutes: S("integer", "Window") }, ["service", "metric"]],
  ["observability", "logs_search", "Search a service's logs for a pattern in the last N minutes; returns the top error messages with counts.", { service: SVC, pattern: S("string", "Text or regex"), minutes: S("integer", "Window") }, ["service"]],
  ["observability", "trace_get", "Fetch one distributed trace by trace_id with every span's duration and status.", { trace_id: S("string", "Trace id") }, ["trace_id"]],
  ["observability", "slo_status", "Show a service's SLOs, current burn rate and remaining error budget.", { service: SVC }, ["service"]],
  ["observability", "alert_ack", "Acknowledge an alert so it stops paging.", { alert_id: S("string", "Alert id") }, ["alert_id"]],
  ["observability", "alert_silence", "Silence an alert rule for N minutes.", { rule: S("string", "Alert rule"), minutes: S("integer", "Duration") }, ["rule", "minutes"]],
  ["observability", "dashboard_link", "Return the dashboard URL for a service.", { service: SVC }, ["service"]],
  ["observability", "error_groups", "List the top error groups for a service with first-seen time and count.", { service: SVC }, ["service"]],
  ["k8s", "pod_list", "List a service's pods with status, restarts and age.", { service: SVC }, ["service"]],
  ["k8s", "pod_restart", "Restart one pod, or all pods of a service with a rolling restart.", { service: SVC, pod: S("string", "Pod name, or omit for all") }, ["service"]],
  ["k8s", "scale_deployment", "Set the replica count of a service's deployment.", { service: SVC, replicas: S("integer", "Replicas") }, ["service", "replicas"]],
  ["k8s", "node_drain", "Cordon and drain a Kubernetes node.", { node: S("string", "Node name") }, ["node"]],
  ["k8s", "hpa_get", "Show a service's horizontal pod autoscaler: min, max, current replicas and target.", { service: SVC }, ["service"]],
  ["k8s", "events_get", "List recent Kubernetes events for a service (OOMKilled, BackOff, FailedScheduling).", { service: SVC }, ["service"]],
  ["db", "db_connections", "Show open and maximum database connections per service.", { cluster: S("string", "Database cluster") }, ["cluster"]],
  ["db", "db_slow_queries", "List the slowest queries in the last N minutes with their mean time.", { cluster: S("string", "Database cluster"), minutes: S("integer", "Window") }, ["cluster"]],
  ["db", "db_replica_lag", "Show replication lag for each replica.", { cluster: S("string", "Database cluster") }, ["cluster"]],
  ["db", "db_failover", "Promote a replica to primary. Needs incident commander approval.", { cluster: S("string", "Database cluster") }, ["cluster"]],
  ["db", "db_kill_query", "Kill a running query by its pid.", { cluster: S("string", "Database cluster"), pid: S("integer", "Query pid") }, ["cluster", "pid"]],
  ["db", "db_pool_resize", "Change a service's connection pool size.", { service: SVC, size: S("integer", "Pool size") }, ["service", "size"]],
  ["comms", "incident_open", "Open a new incident with a severity and title.", { title: S("string", "Title"), severity: S("integer", "1-4") }, ["title", "severity"]],
  ["comms", "incident_note", "Add a timestamped note to an incident: what you saw and what you did.", { incident: S("string", "Incident id, e.g. INC-5531"), note: S("string", "Note text") }, ["incident", "note"]],
  ["comms", "incident_close", "Close an incident once the service has recovered and a note records the cause.", { incident: S("string", "Incident id") }, ["incident"]],
  ["comms", "status_page_update", "Post an update to the public status page.", { component: S("string", "Component"), status: S("string", "operational, degraded or outage"), message: S("string", "Text") }, ["component", "status", "message"]],
  ["comms", "page_oncall", "Page the on-call engineer of another squad.", { squad: S("string", "Squad"), message: S("string", "Text") }, ["squad", "message"]],
  ["comms", "slack_post", "Post a message to a Slack channel.", { channel: S("string", "Channel"), text: S("string", "Text") }, ["channel", "text"]],
  ["edge", "cache_flush", "Flush the CDN or application cache for a service.", { service: SVC }, ["service"]],
  ["edge", "dns_lookup", "Resolve a hostname from inside the cluster and show the answer and TTL.", { host: S("string", "Hostname") }, ["host"]],
];

export function makeBackend() {
  const st = { flagOff: false, rolledBack: false, notes: [] };
  const run = {
    flag_history: ({ flag }) => flag === "checkout.new-tax-engine"
      ? [{ at: "2026-11-19T06:10:02Z", from: "10%", to: "100%", by: "priya.s" }, { at: "2026-11-18T09:00:00Z", from: "0%", to: "10%", by: "priya.s" }]
      : [],
    flag_get: ({ flag }) => ({ flag, enabled: !st.flagOff, rollout: st.flagOff ? 0 : 100 }),
    flag_disable: ({ flag }) => { if (flag === "checkout.new-tax-engine") st.flagOff = true; return { flag, enabled: false, effective_in_s: 30 }; },
    flag_set_rollout: ({ flag, percent }) => { if (flag === "checkout.new-tax-engine" && Number(percent) === 0) st.flagOff = true; return { flag, rollout: percent }; },
    metrics_query: ({ metric = "error_rate" }) => st.flagOff || st.rolledBack
      ? { metric, now: metric === "error_rate" ? "0.4%" : metric === "p95_latency_ms" ? 310 : 1180, trend: "recovered within 2 minutes" }
      : { metric, now: metric === "error_rate" ? "7.1%" : metric === "p95_latency_ms" ? 4800 : 1150, since: "06:12 UTC" },
    logs_search: () => ({ top: [{ msg: "TaxEngineTimeout: tax-engine-v2 did not answer in 4000 ms", count: 18342 }, { msg: "upstream 503 from tax-engine-v2", count: 2210 }] }),
    error_groups: () => [{ group: "TaxEngineTimeout", first_seen: "2026-11-19T06:10:40Z", count: 18342 }],
    deploy_history: () => [{ version: "v4.12.0", at: "2026-11-17T03:20:00Z", by: "deploy-bot", summary: "basket API pagination" }, { version: "v4.11.3", at: "2026-11-12T03:15:00Z", by: "deploy-bot", summary: "currency rounding fix" }],
    deploy_rollback: ({ to_version }) => { st.rolledBack = true; return { service: "checkout-service", rolled_back_to: to_version || "v4.11.3", eta_minutes: 20 }; },
    slo_status: () => ({ slo: "99.5% availability", burn_rate: st.flagOff ? 0.6 : 14.2, error_budget_left: st.flagOff ? "71%" : "64%" }),
    incident_note: ({ incident, note }) => { st.notes.push({ incident, note }); return { ok: true, incident, at: "2026-11-19T06:24:00Z" }; },
  };
  const tools = Object.fromEntries(SPEC.map(([server, name, description, properties, required]) => [name, {
    server, description: `[${server}] ${description}`,
    input_schema: { type: "object", properties, required },
    run: run[name] || (() => ({ ok: true, note: "nothing unusual" })),
  }]));
  return { st, tools };
}

// ---- Runbooks: [id, title, when, tools, steps] ------------------------------------------------------
const RB = [
  ["RB-01", "Pod crash loop", "Pods restart repeatedly (CrashLoopBackOff).", ["pod_list", "events_get", "logs_search", "deploy_rollback", "incident_note"], "List pods and events. If OOMKilled, raise memory via the deploy pipeline, not by hand. If the crash began with a deploy, roll back. Note the cause."],
  ["RB-02", "Node pressure", "A node reports memory or disk pressure.", ["events_get", "node_drain", "incident_note"], "Confirm pressure in events, drain the node, let the autoscaler replace it, note the node name."],
  ["RB-03", "Database connection exhaustion", "Errors say too many connections or pool timeout.", ["db_connections", "db_pool_resize", "incident_note"], "Find the service holding most connections. Shrink its pool by a quarter; do not raise the database maximum. Note the change."],
  ["RB-04", "Replica lag", "Read replicas lag the primary by more than 30 s.", ["db_replica_lag", "db_slow_queries", "incident_note"], "Check lag, find long writes on the primary, do not fail over for lag alone."],
  ["RB-05", "Slow queries", "p95 latency rises with database time.", ["db_slow_queries", "db_kill_query", "incident_note"], "List slow queries; kill only reporting queries over 5 minutes; open a ticket for the owning squad."],
  ["RB-06", "Failed canary", "A canary's error rate exceeds the baseline by 1 point.", ["canary_status", "canary_abort", "incident_note"], "Compare canary to baseline; abort the canary; the release pipeline blocks the version automatically."],
  ["RB-07", "Errors after a deploy", "Errors start within 30 minutes of a deploy and no flag changed.", ["deploy_history", "deploy_rollback", "metrics_query", "incident_note"], "Confirm the deploy came 30 minutes or less before onset and no flag changed in that window. Roll back to the previous version. Watch error_rate for 10 minutes."],
  ["RB-08", "Cache stampede", "Database load spikes after a cache flush or expiry.", ["metrics_query", "scale_deployment", "incident_note"], "Do not flush again. Scale readers, let the cache warm, note the trigger."],
  ["RB-09", "DNS failures", "Errors mention name resolution.", ["dns_lookup", "incident_note"], "Resolve the host from inside the cluster; if CoreDNS fails, page the infrastructure squad."],
  ["RB-10", "Certificate expiry", "TLS handshake errors or an expiry alert.", ["page_oncall", "incident_note"], "Page the security squad; never disable TLS verification."],
  ["RB-11", "Queue backlog", "A queue's depth grows for 15 minutes.", ["metrics_query", "scale_deployment", "incident_note"], "Check consumer error rate before scaling; scaling a failing consumer makes it worse."],
  ["RB-12", "Memory leak", "Memory grows steadily until pods are OOMKilled.", ["pod_list", "pod_restart", "incident_note"], "Rolling restart as a stopgap; attach heap profile to the ticket."],
  ["RB-13", "Payment provider outage", "Errors from the external payment provider.", ["status_page_update", "slack_post", "incident_note"], "Confirm on the provider's status page; switch checkout to the backup provider via the payments squad; update our status page."],
  ["RB-14", "Status page communication", "Customer impact over 5 minutes.", ["status_page_update", "incident_note"], "Post within 10 minutes of impact, every 30 minutes after, plain language, no blame."],
  ["RB-15", "SLO burn alert triage", "A fast-burn SLO alert fires.", ["slo_status", "metrics_query", "incident_note"], "Check burn rate and which SLI is burning, then pick the runbook for the cause."],
  ["RB-16", "Disk full", "A volume is over 90% full.", ["events_get", "incident_note"], "Find the writer; never delete database files; expand the volume through the platform pipeline."],
  ["RB-17", "Errors after a feature-flag rollout", "Errors or latency start within 15 minutes of a feature-flag change.", ["flag_history", "flag_disable", "metrics_query", "incident_note"],
    "1. flag_history: confirm the flag changed 15 minutes or less before onset. 2. flag_disable the flag (the kill switch). Do NOT roll back the deploy: a rollback reverts unrelated changes and takes 20 minutes, while the flag switch takes 30 seconds. 3. metrics_query error_rate to confirm recovery. 4. incident_note: the flag, the time it was disabled and the recovered error rate."],
  ["RB-18", "Autoscaler not scaling", "CPU high but replicas stay at minimum.", ["hpa_get", "scale_deployment", "incident_note"], "Check the HPA target and metrics source; scale by hand only within the HPA maximum."],
  ["RB-19", "Noisy neighbour", "Latency rises on one node only.", ["pod_list", "node_drain", "incident_note"], "Move the service's pods off the node by draining it; open a ticket for the neighbour's owner."],
  ["RB-20", "Upstream rate limiting", "Errors are 429 from a dependency.", ["logs_search", "slack_post", "incident_note"], "Confirm 429s; ask the owning squad for a quota raise; do not add retries without backoff."],
  ["RB-21", "Leaked credential", "A secret appears in logs, a repo or a ticket.", ["page_oncall", "incident_note"], "Page security at once; rotate the secret through the vault; never paste it into a ticket or chat."],
  ["RB-22", "Data correction request", "A squad asks to fix records by hand.", ["incident_note"], "Corrections go through a reviewed migration, never an ad hoc query in prod."],
  ["RB-23", "Batch job failure", "A nightly job fails or overruns.", ["logs_search", "incident_note"], "Read the job log; re-run only idempotent jobs; page the owner otherwise."],
  ["RB-24", "Incident close-out", "The service has recovered.", ["incident_note", "incident_close"], "Note the cause, the fix and the time of recovery; close; schedule the review within 5 working days."],
];
export const RUNBOOKS = RB.map(([id, title, when, tools, steps]) => ({ id, title, when, tools, steps,
  text: `${id} ${title}\nWhen: ${when}\nTools: ${tools.join(", ")}\nSteps: ${steps}` }));

// The whole library as one block of text: what the monolithic design puts in every request.
export const LIBRARY_TEXT = RUNBOOKS.map((r) => r.text).join("\n\n");

// The small index for progressive discovery: one line per runbook and per tool, searchable, nothing loaded yet.
export function catalogIndex(tools) {
  const entries = [
    ...RUNBOOKS.map((r) => ({ id: r.id, kind: "runbook", text: `${r.id} ${r.title}. ${r.when}`, summary: `${r.title}: ${r.when}` })),
    ...Object.entries(tools).map(([name, t]) => ({ id: name, kind: "tool", text: `${name.replace(/_/g, " ")} ${t.description}`, summary: t.description.split(". ")[0] })),
  ];
  const idx = bm25(entries);
  return { size: entries.length, search: (q, k = 5) => idx.search(q, k).map(({ id, kind, summary }) => ({ id, kind, summary })) };
}
