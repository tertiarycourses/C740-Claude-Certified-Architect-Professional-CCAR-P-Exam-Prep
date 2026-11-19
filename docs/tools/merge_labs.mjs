// Merge docs/data/labs/lab-NN.json into docs/data/labs.json and check every entry.
// Usage: node docs/tools/merge_labs.mjs [--check]   (--check validates only, writes nothing)
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const here = dirname(fileURLToPath(import.meta.url));
const D = resolve(here, "../data");
const sims = JSON.parse(readFileSync(`${D}/sims.json`, "utf8"));
const REQ = ["id", "task", "task_title", "topic", "topic_name", "sim", "title", "stem", "options", "answer", "why", "wrong", "fix", "see", "explain", "exam_tip", "source", "headline", "concepts"];
const labs = [], errs = [];
for (let n = 1; n <= 38; n++) {
  const f = `${D}/labs/lab-${String(n).padStart(2, "0")}.json`;
  if (!existsSync(f)) { errs.push(`lab ${n}: missing ${f}`); continue; }
  let l; try { l = JSON.parse(readFileSync(f, "utf8")); } catch (e) { errs.push(`lab ${n}: bad JSON ${e.message}`); continue; }
  for (const k of REQ) if (l[k] === undefined || l[k] === "") errs.push(`lab ${n}: no ${k}`);
  if (l.id !== n) errs.push(`lab ${n}: id is ${l.id}`);
  const opts = Object.keys(l.options || {});
  if (opts.join("") !== "ABCD") errs.push(`lab ${n}: options must be A-D`);
  if (!opts.includes(l.answer)) errs.push(`lab ${n}: answer ${l.answer} not an option`);
  const wrong = Object.keys(l.wrong || {}).sort().join("");
  if (wrong !== opts.filter((k) => k !== l.answer).join("")) errs.push(`lab ${n}: wrong{} must explain each of the 3 distractors`);
  if ((l.title || "").length > 70) errs.push(`lab ${n}: title over 70 chars`);
  if (!Array.isArray(l.concepts) || l.concepts.length < 3 || l.concepts.length > 5 || l.concepts.some((c) => !c.t || !c.b)) errs.push(`lab ${n}: concepts must be 3-5 {t, b}`);
  const s = sims.find((x) => x.n === l.sim); if (!s) errs.push(`lab ${n}: unknown sim ${l.sim}`); else l.sim_name = s.name;
  labs.push(l);
}
// Answer-key balance (check_mcq rule): no letter above 35%; the key is the strictly longest option in at most a third.
const cnt = {}; let longest = 0;
for (const l of labs) {
  cnt[l.answer] = (cnt[l.answer] || 0) + 1;
  const len = Object.fromEntries(Object.entries(l.options || {}).map(([k, v]) => [k, v.length]));
  if (Object.entries(len).every(([k, v]) => k === l.answer || v < len[l.answer])) longest++;
}
for (const [k, v] of Object.entries(cnt)) if (v / Math.max(1, labs.length) > 0.35) errs.push(`answer ${k} is ${v}/${labs.length} (>35%)`);
if (longest > labs.length / 3) errs.push(`the key is the strictly longest option in ${longest}/${labs.length} (> 1/3)`);
console.log(`labs ${labs.length}/38 · answers ${JSON.stringify(cnt)} · key longest in ${longest}`);
for (const e of errs) console.log("FAIL " + e);
if (!process.argv.includes("--check") && labs.length) writeFileSync(`${D}/labs.json`, JSON.stringify(labs, null, 1) + "\n");
process.exit(errs.length ? 1 : 0);
