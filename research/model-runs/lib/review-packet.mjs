// research/model-runs/lib/review-packet.mjs -- the generated results-review packet (D-63 Stream D, EVAL-WP10).
//
// Pure functions only: buildPacket() turns gate results (lib/wave-gates.mjs runAllGates output) and the audit-wave
// result into a markdown packet and a JSON twin. Nothing here reads the clock, the network or git, so the same inputs
// give byte-identical output. The date appears only when the caller passes one.
//
// Gates are handled generically, keyed by gate id. No gate id is given a status here; a gate that another stream turns
// from "not-built" into "pass" or "fail" changes the packet with no edit to this file.
//
// D-29 / D-29a: the packet never orders subjects by result and never uses ranking wording. lintPacket() enforces that,
// and buildPacket() runs it and throws, so a packet that breaks the rules cannot be written by the CLI.

import { createHash } from "node:crypto";

export const PACKET_FORMAT = "review-packet-v1";
export const MAX_ASKS = 6;

/** Ranking and comparison words that must never appear in a packet (D-29a item 3). Matched as whole words, any case. */
export const BANNED_WORDS = Object.freeze(["best", "worst", "top", "winner", "winners", "rank", "ranks", "ranked", "ranking", "rankings", "leaderboard"]);
const BANNED_RE = new RegExp(`\\b(?:${BANNED_WORDS.join("|")})\\b`, "i");

/** Every fixed string of the packet. Tests plant a banned word here to prove the lint catches it. */
export const TEXT = Object.freeze({
  title: "Review packet",
  banner: "UNOFFICIAL PILOT. Not a score. Comparability: none. Internal: this packet publishes nothing by itself.",
  s1: "1. Verdict",
  s2: "2. Gates",
  s3: "3. Deviations and timeline gaps",
  s4: "4. What may be published",
  s5: "5. Founder asks",
  s6: "6. Provenance",
  publishNothing: "Nothing may be published from this wave. The verdict is HOLD.",
  publishIntro: "Only these items, each exported by the publish step from a hash-checked wave file (D-29a item 5). Subjects are listed alphabetically. A point appears only as a tick inside its 95% range, and only for a separated subject. Every figure carries the run id, date, access tier and \"not a score, comparability none\".",
  notPublishable: "Withheld because a required gate does not pass",
  asksIntro: "At most six asks. Each has a default; replying \"defaults\" takes every default.",
  asksNone: "No ask. Every gate passes or does not apply, and nothing is open.",
  neverPublished: "Never published from a packet: raw replies, keys, judge identity per rating, thinking traces, crisis item text, order by result, band labels, per-model crisis values.",
});

/** Publishable items and the gates each needs. A required gate that is absent from the results counts as not passing. */
export const PUBLISHABLE_ITEMS = Object.freeze([
  { id: "run-record", label: "Run record: subjects, pinned digests, planned and completed call counts", requires: ["G-complete", "G-digest", "G-plan-time"] },
  { id: "subject-ranges", label: "Per-subject 95% ranges (alphabetical, unofficial pilot, not a score)", requires: ["G-complete", "G-digest", "G-plan-time", "G-validity", "G-judge-sanity", "G-agreement", "G-keys", "G-claim-audit", "G-render-leak"] },
  { id: "judge-validity", label: "Judge validity summary: unfound-quote rate per judge", requires: ["G-validity", "G-judge-sanity"] },
  { id: "anchor-drift", label: "Anchor drift as measured, labelled with its comparability verdict", requires: ["G-drift-signed"] },
  { id: "deviations", label: "Deviation list as filed in PREREGISTRATION.md, with the audit result", requires: ["G-plan-time", "G-complete"], needsCleanAudit: true },
]);

const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
export const sha256Hex = (bufOrText) => createHash("sha256").update(bufOrText).digest("hex");

/** JSON with sorted keys and two-space indent: stable bytes for hashing and for the twin file. */
export function canonicalJson(value) {
  const norm = (v) => {
    if (Array.isArray(v)) return v.map(norm);
    if (v && typeof v === "object") return Object.fromEntries(Object.keys(v).sort().map((k) => [k, norm(v[k])]));
    return v;
  };
  return `${JSON.stringify(norm(value), null, 2)}\n`;
}

/** Walks a parsed PROTOCOL.v2.json and returns every block { id, open: true } with its path, sorted by O-number. */
export function collectOpenValues(protocol) {
  const out = [];
  const walk = (node, p) => {
    if (!node || typeof node !== "object") return;
    if (!Array.isArray(node) && node.open === true && typeof node.id === "string") {
      out.push({ id: node.id, path: p.join("."), proposed_default: node.proposed_default ?? null, options: node.options ?? null, decide: node.decide ?? null });
      return;
    }
    for (const [k, v] of Object.entries(node)) walk(v, [...p, k]);
  };
  walk(protocol, []);
  const n = (id) => Number(String(id).replace(/\D/g, "")) || 0;
  return out.sort((a, b) => n(a.id) - n(b.id) || cmp(a.id, b.id));
}

const show = (v) => (v === null || v === undefined ? "no default in the repository" : typeof v === "string" ? v : JSON.stringify(v));
const oneLine = (s) => String(s ?? "").replace(/\s+/g, " ").trim();

/** Group names, in the order they print. "hold" counts as a failure to pass; it is shown in the fail group with its status. */
function groupGates(gates, waivers) {
  const g = { pass: [], fail: [], "not-built": [], waived: [], "n/a": [] };
  for (const x of gates) {
    const base = { id: x.id, status: x.status, detail: oneLine(x.detail), report_only: x.evidence?.report_only === true };
    if (x.status === "pass" || x.status === "n/a") g[x.status].push(base);
    else if (waivers[x.id] !== undefined) g.waived.push({ ...base, waiver_reason: oneLine(waivers[x.id]) });
    else if (x.status === "not-built") g["not-built"].push(base);
    else g.fail.push(base);
  }
  return g;
}

function buildAsks({ groups, audit, openValues, gates, maxAsks }) {
  const byId = new Map(openValues.map((o) => [o.id, o]));
  const candidates = [];
  const push = (a) => candidates.push(a);
  for (const x of groups.fail) {
    push({
      kind: "gate", gate: x.id, status: x.status,
      title: `Gate ${x.id} is ${x.status}`,
      why: x.detail,
      default: x.status === "fail" ? "Hold. Nothing from this wave is published until the cause is fixed and the gate is re-run." : "Hold. The measurement is incomplete; nothing from this wave is published until it is made.",
    });
  }
  if (audit && audit.open_items.length > 0) {
    push({
      kind: "audit", gate: null, status: "open",
      title: `Audit has ${audit.open_items.length} open item(s)`,
      why: audit.open_items.slice(0, 3).map((o) => `${o.check}: ${oneLine(o.detail)}`).join(" | "),
      default: "Hold. Each open item needs a dated deviation or a fix before the wave is published.",
    });
  }
  if (!audit) {
    push({ kind: "audit", gate: null, status: "open", title: "No audit result supplied", why: "audit-wave output was not available, so the deviations and timeline were not checked.", default: "Hold. Run audit-wave and regenerate the packet." });
  }
  for (const x of groups["not-built"]) {
    push({
      kind: "gate", gate: x.id, status: x.status,
      title: `Gate ${x.id} is not built`,
      why: x.detail,
      default: "Wait. The wave stays HOLD until the gate exists and passes; do not waive it without a recorded reason.",
    });
  }
  // Open protocol values that the gate text itself names (an O-id in a gate detail), in order of first mention.
  const seen = new Set();
  for (const x of gates) {
    for (const m of String(x.detail ?? "").matchAll(/\bO(\d{1,2})\b/g)) {
      const id = `O${m[1]}`;
      if (seen.has(id) || !byId.has(id)) continue;
      seen.add(id);
      const o = byId.get(id);
      push({
        kind: "protocol-value", gate: x.id, status: "open", protocol_value: id,
        title: `Protocol value ${id} is open (${o.path})`,
        why: `Named by ${x.id}. Until it is chosen the gate can only report a measurement, not test it.${o.options ? ` Options: ${oneLine(JSON.stringify(o.options))}.` : ""}`,
        default: o.proposed_default === null || o.proposed_default === undefined ? "No default exists. The first wave stays report-only for this value." : `Use the proposed default: ${show(o.proposed_default)}.`,
      });
    }
  }
  const asks = candidates.slice(0, maxAsks).map((a, i) => ({ n: i + 1, ...a }));
  const overflow = candidates.slice(maxAsks).map((a) => ({ kind: a.kind, gate: a.gate, status: a.status, protocol_value: a.protocol_value ?? null, title: a.title, default: a.default }));
  return { asks, overflow };
}

/**
 * @param {object} input
 *   waveId, gates[] (runAllGates output), audit (auditRun output or null), openValues[] (collectOpenValues),
 *   subjects[] (labels), waivers { gateId: reason }, loadProblems[], files [{path, sha256}], tools [{name, sha256}],
 *   command (string), date (string|null)
 * @param {object} [opts] { maxAsks, text, lint } -- maxAsks and text exist so tests can plant faults.
 */
export function buildPacket(input, opts = {}) {
  const text = opts.text ?? TEXT;
  const maxAsks = opts.maxAsks ?? MAX_ASKS;
  const waivers = input.waivers ?? {};
  const gates = [...input.gates]; // keep the order wave-gates gave
  const groups = groupGates(gates, waivers);
  const audit = input.audit ?? null;
  const auditOpen = audit ? audit.open_items.length : null;

  const reasons = [];
  if (groups.fail.length) reasons.push(`${groups.fail.length} gate(s) fail or hold: ${groups.fail.map((x) => x.id).join(", ")}`);
  if (groups["not-built"].length) reasons.push(`${groups["not-built"].length} gate(s) not built: ${groups["not-built"].map((x) => x.id).join(", ")}`);
  if (!audit) reasons.push("no audit result");
  else if (auditOpen > 0) reasons.push(`${auditOpen} open audit item(s)`);
  if ((input.loadProblems ?? []).length) reasons.push(`${input.loadProblems.length} load problem(s)`);
  if (gates.length === 0) reasons.push("no gates were run");
  const verdict = reasons.length === 0 ? "READY" : "HOLD";

  // Publishable: only when READY, and only items whose every required gate passes (not waived, not absent).
  const status = new Map(gates.map((g) => [g.id, g.status]));
  const reportOnly = new Set(groups.pass.filter((g) => g.report_only).map((g) => g.id));
  const publishable = [];
  const withheld = [];
  if (verdict === "READY") {
    for (const item of PUBLISHABLE_ITEMS) {
      const bad = item.requires.filter((id) => { const s = status.get(id); return s !== "pass" && s !== "n/a"; });
      if (bad.length === 0) {
        const ro = item.requires.filter((id) => reportOnly.has(id));
        publishable.push({ id: item.id, label: item.label, report_only_gates: ro });
      } else withheld.push({ id: item.id, label: item.label, missing_gates: bad });
    }
  }
  const subjects = [...(input.subjects ?? [])].sort(cmp);

  const { asks, overflow } = buildAsks({ groups, audit, openValues: input.openValues ?? [], gates, maxAsks });
  const openIds = (input.openValues ?? []).map((o) => o.id);

  const json = {
    kind: "review-packet",
    format: PACKET_FORMAT,
    wave_id: input.waveId,
    date: input.date ?? null,
    verdict,
    verdict_reasons: reasons,
    gates: groups,
    audit: audit ? {
      records: audit.records, first_record: audit.first_record, last_record: audit.last_record,
      deviations: audit.deviations, gaps: audit.gaps.map((g) => ({ index: g.index, hours: g.hours, starts_at: g.starts_at, ends_at: g.ends_at, records_before: g.records_before, explained_by: g.mapped_to.map((m) => m.deviation) })),
      checks: audit.checks.map((c) => ({ id: c.id, status: c.status, detail: oneLine(c.detail) })),
      open_items: audit.open_items,
    } : null,
    load_problems: input.loadProblems ?? [],
    publishable: { may_publish_nothing: verdict !== "READY", items: publishable, withheld, subjects: verdict === "READY" ? subjects : [] },
    asks: { cap: maxAsks, shown: asks, overflow },
    open_protocol_values: openIds,
    provenance: { command: input.command, files: input.files ?? [], tools: input.tools ?? [], format: PACKET_FORMAT },
  };

  const md = renderMarkdown(json, text);
  if (opts.lint !== false) {
    const problems = lintPacket({ json, markdown: md, gates: input.gates, maxAsks: MAX_ASKS });
    if (problems.length) throw new Error(`review packet failed its own lint: ${problems.join("; ")}`);
  }
  return { json, markdown: md, jsonText: canonicalJson(json) };
}

function renderMarkdown(p, text) {
  const L = [];
  const gl = (g) => `- \`${g.id}\` (${g.status}${g.report_only ? ", report-only" : ""}): ${g.detail}`;
  L.push(`# ${text.title}: ${p.wave_id}`, "", `**${text.banner}**`);
  if (p.date) L.push("", `Date: ${p.date}`);
  L.push("", `## ${text.s1}`, "", `**${p.verdict}**`);
  if (p.verdict_reasons.length) { L.push(""); for (const r of p.verdict_reasons) L.push(`- ${r}`); }
  else L.push("", "- Every gate passes or does not apply, the audit has no open item and nothing failed to load.");
  const ro = p.gates.pass.filter((g) => g.report_only).map((g) => g.id);
  if (ro.length) L.push(`- Report-only passes (measured, no ratified threshold to test against): ${ro.join(", ")}`);
  for (const lp of p.load_problems) L.push(`- load problem: ${lp}`);

  L.push("", `## ${text.s2}`);
  const sec = (title, list, fmt = gl) => { L.push("", `### ${title} (${list.length})`, ""); if (list.length === 0) L.push("- none"); for (const g of list) L.push(fmt(g)); };
  sec("Fail", p.gates.fail);
  sec("Not built", p.gates["not-built"]);
  sec("Waived", p.gates.waived, (g) => `${gl(g)} Waiver reason: ${g.waiver_reason}`);
  sec("Pass", p.gates.pass);
  sec("Not applicable", p.gates["n/a"]);

  L.push("", `## ${text.s3}`, "");
  if (!p.audit) L.push("- No audit result was supplied. This section is OPEN, never a pass.");
  else {
    const a = p.audit;
    L.push(`Records: ${a.records}; first ${a.first_record}; last ${a.last_record}.`, "", `### Deviations (${a.deviations.length})`, "");
    if (a.deviations.length === 0) L.push("- none");
    for (const d of a.deviations) L.push(`- ${d.id} (${d.date}): ${oneLine(d.title)}`);
    L.push("", `### Timeline gaps (${a.gaps.length})`, "");
    if (a.gaps.length === 0) L.push("- none");
    for (const g of a.gaps) L.push(`- gap ${g.index}: ${g.hours} h from ${g.starts_at} to ${g.ends_at}, after ${g.records_before} records; ${g.explained_by.length ? `explained by ${g.explained_by.join(", ")}` : "no deviation explains it"}`);
    L.push("", `### Audit checks (${a.checks.length})`, "");
    for (const c of a.checks) L.push(`- ${c.id} (${c.status}): ${c.detail}`);
    L.push("", `### Open audit items (${a.open_items.length})`, "");
    if (a.open_items.length === 0) L.push("- none");
    for (const o of a.open_items) L.push(`- ${o.check}: ${oneLine(o.detail)}`);
  }

  L.push("", `## ${text.s4}`, "");
  if (p.publishable.may_publish_nothing) L.push(text.publishNothing);
  else {
    L.push(text.publishIntro, "");
    for (const i of p.publishable.items) L.push(`- ${i.label}${i.report_only_gates.length ? ` (label as report-only: ${i.report_only_gates.join(", ")})` : ""}`);
    if (p.publishable.items.length === 0) L.push("- none");
    if (p.publishable.withheld.length) {
      L.push("", `${text.notPublishable}:`, "");
      for (const w of p.publishable.withheld) L.push(`- ${w.label} (needs ${w.missing_gates.join(", ")})`);
    }
    L.push("", `Subjects, alphabetical (${p.publishable.subjects.length}): ${p.publishable.subjects.join(", ")}`);
  }
  L.push("", text.neverPublished);

  L.push("", `## ${text.s5}`, "", text.asksIntro, "");
  if (p.asks.shown.length === 0) L.push(text.asksNone);
  for (const a of p.asks.shown) {
    L.push(`### Ask ${a.n}. ${a.title}`, "", `- Why: ${a.why}`, `- Default: **${a.default}**`, "");
  }
  if (p.asks.overflow.length) {
    L.push(`Not asked, to stay within the cap of ${p.asks.cap}: ${p.asks.overflow.length} further item(s), each defaulting to hold:`, "");
    for (const o of p.asks.overflow) L.push(`- ${o.title}`);
    L.push("");
  }
  if (p.open_protocol_values.length) L.push(`Protocol values still open in PROTOCOL.v2.json (not asks here unless named above): ${p.open_protocol_values.join(", ")}.`);

  L.push("", `## ${text.s6}`, "", `Format: ${p.provenance.format}`, `Command: \`${p.provenance.command}\``, "", "Input files (sha256):", "");
  for (const f of p.provenance.files) L.push(`- \`${f.path}\`: ${f.sha256 ?? "absent"}`);
  L.push("", "Tools (sha256 of source):", "");
  for (const t of p.provenance.tools) L.push(`- \`${t.name}\`: ${t.sha256}`);
  return `${L.join("\n")}\n`;
}

/**
 * Returns a list of problems; empty means the packet obeys the rules.
 *  - no banned ranking word anywhere in the markdown or the JSON twin;
 *  - every gate that is not pass or n/a appears (by id) in both the markdown and the JSON twin;
 *  - HOLD says "Nothing may be published" and lists no publishable item;
 *  - at most maxAsks asks, in the markdown and the JSON.
 */
export function lintPacket({ json, markdown, gates, maxAsks = MAX_ASKS }) {
  const problems = [];
  for (const [label, s] of [["markdown", markdown], ["json", canonicalJson(json)]]) {
    const m = BANNED_RE.exec(s);
    if (m) problems.push(`banned wording "${m[0]}" in ${label} near: ${oneLine(s.slice(Math.max(0, m.index - 30), m.index + 40))}`);
  }
  const jsonGateIds = new Set(Object.values(json.gates).flat().map((g) => g.id));
  for (const g of gates) {
    if (g.status === "pass" || g.status === "n/a") continue;
    if (!jsonGateIds.has(g.id)) problems.push(`gate ${g.id} (${g.status}) is missing from the JSON twin`);
    if (!markdown.includes(`\`${g.id}\``)) problems.push(`gate ${g.id} (${g.status}) is missing from the markdown`);
  }
  if (json.verdict !== "READY") {
    if (json.publishable.items.length > 0) problems.push("HOLD packet lists publishable items");
    if (!/Nothing may be published/.test(markdown)) problems.push('HOLD packet does not say "Nothing may be published"');
  }
  const mdAsks = (markdown.match(/^### Ask \d+\./gm) ?? []).length;
  if (mdAsks > maxAsks) problems.push(`${mdAsks} asks in the markdown exceed the cap of ${maxAsks}`);
  if (json.asks.shown.length > maxAsks) problems.push(`${json.asks.shown.length} asks in the JSON exceed the cap of ${maxAsks}`);
  return problems;
}
