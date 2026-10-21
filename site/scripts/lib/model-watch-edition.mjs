/**
 * model-watch-edition.mjs -- pure derivation of a weekly AI Model Watch edition.
 *
 * Spec: docs/DATA_MODEL_AI_MODEL_WATCH.md section 5. Used by compile-model-watch-edition.mjs
 * (to compile once) and by the validator (MW-E2 recomputes the release list). No I/O.
 */

import {
  DISCLOSURE_LABEL, INDEPENDENCE_LINE, NO_SCAN_STATEMENT, MEASURED_EMPTY_NOTE, MEASURED_DEFAULT_NOTE,
  EDITION_TOKENS, EDITION_KEYS, LEAD_MAX_WORDS, ISO_DATE_RE, canonicalJson, sha256Hex, ordered, windowDays, wordCount,
  isIsoDate, orderSource, unionSources,
} from "./model-watch-core.mjs";

export const RELEASE_COPY_KEYS = [
  "releaseId", "date", "provider", "providerSlug", "modelName", "catalogId", "kind", "summary", "safetyOrWelfareRelevant", "safetyNote", "sources",
];

/** Part 2: copies of log rows inside the window that were logged on or before the edition date. */
export function deriveReleases(log, window, asOf) {
  return (log?.rows ?? [])
    .filter((r) => r.date >= window.from && r.date <= window.to && r.loggedOn <= asOf)
    .map((r) => ordered({
      releaseId: r.id, date: r.date, provider: r.provider, providerSlug: r.providerSlug, modelName: r.modelName, catalogId: r.catalogId,
      kind: r.kind, summary: r.summary, safetyOrWelfareRelevant: r.safetyOrWelfareRelevant, safetyNote: r.safetyNote,
      sources: r.sources.map(orderSource),
    }, RELEASE_COPY_KEYS));
}

/** Part 3: no authored text. */
export function deriveDisclosures(releases) {
  return releases.filter((r) => r.safetyOrWelfareRelevant === true).map((r) => ({
    releaseId: r.releaseId, provider: r.provider, modelName: r.modelName, safetyNote: r.safetyNote,
    sources: r.sources.map(orderSource), label: DISCLOSURE_LABEL,
  }));
}

/** Part 4: label and link only, never a figure. `renderable` = renderableEntries(manifest, env) output. */
export function deriveMeasured(renderable, window, measuredNote) {
  const reports = (renderable ?? [])
    .filter((x) => x.mode === "active" && x.entry.report_date >= window.from && x.entry.report_date <= window.to)
    .map((x) => ({ runId: x.entry.run_id, reportDate: x.entry.report_date, href: `/ai-models/reports/${x.entry.run_id}` }))
    .sort((a, b) => (a.reportDate < b.reportDate ? -1 : a.reportDate > b.reportDate ? 1 : a.runId < b.runId ? -1 : 1));
  const note = reports.length === 0
    ? (measuredNote ? `${MEASURED_EMPTY_NOTE} ${measuredNote}` : MEASURED_EMPTY_NOTE)
    : (measuredNote ?? MEASURED_DEFAULT_NOTE);
  return { reports, note };
}

/** Part 5: counts are computed from the queue snapshot; no timelines. */
export function deriveQueue(snapshot) {
  const entries = snapshot?.entries ?? [];
  const n = (s) => entries.filter((e) => e.status === s).length;
  return {
    asOf: snapshot?.updated_at ?? null,
    queued: n("queued"), measured: n("measured"), skipped: n("skipped"),
    queuedDevelopers: [...new Set(entries.filter((e) => e.status === "queued").map((e) => e.developer))].sort((a, b) => a.localeCompare(b, "en")),
  };
}

/** Part 6: union of every cited source, deduplicated by URL, numbered. */
export function deriveSources(releases) {
  return unionSources(...releases.map((r) => r.sources)).map((s, i) => ({ n: i + 1, ...orderSource(s) }));
}

export function coverageStatementFor(coverage) {
  const scanned = coverage?.scanned ?? [];
  const not = coverage?.notScanned ?? [];
  const head = scanned.length === 0 ? `${NO_SCAN_STATEMENT}.` : `Scanned for this window: ${scanned.join("; ")}.`;
  return not.length ? `${head} Not scanned: ${not.join("; ")}.` : head;
}

const TOKEN_RE = /\{\{([A-Z_]+)\}\}/g;

const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Every model name the stores know (catalog names, log model names and the parts of "A / B" compound names), longest first. */
export function allModelNames(catalog, log) {
  const names = new Set();
  for (const r of catalog?.rows ?? []) if (typeof r.name === "string" && r.name.trim()) names.add(r.name.trim());
  for (const r of log?.rows ?? []) if (typeof r.modelName === "string" && r.modelName.trim()) {
    names.add(r.modelName.trim());
    for (const part of r.modelName.split(" / ")) if (part.trim()) names.add(part.trim());
  }
  return [...names].sort((a, b) => b.length - a.length);
}

const nameRe = (name) => new RegExp("(?<![A-Za-z0-9.-])" + escRe(name) + "(?![A-Za-z0-9-]|\\.[0-9])", "gi");

/** Replace known model names with a space so a version number inside a name ("GPT-6.1") is not read as a stray figure. */
export function stripModelNames(text, names) {
  let s = text;
  for (const n of names ?? []) s = s.replace(nameRe(n), " ");
  return s;
}

/** Catalog model names mentioned in a text (longest first; spans consumed so "GPT-6" never matches inside "GPT-6.1 Sol"). */
export function modelNamesIn(text, catalog) {
  let rest = text;
  const found = [];
  for (const name of allModelNames(catalog, null)) {
    const re = nameRe(name);
    if (re.test(rest)) { found.push(name); rest = rest.replace(nameRe(name), " "); }
  }
  return found;
}

/** Authored-lead problems that depend only on the source (compile-time). */
export function leadSourceProblems(lead, window, names = []) {
  const out = [];
  if (typeof lead !== "string" || !lead.trim()) return ["lead must be a non-empty string"];
  for (const m of lead.matchAll(TOKEN_RE)) if (!EDITION_TOKENS.includes(m[1])) out.push(`unknown token {{${m[1]}}} in lead`);
  if (wordCount(lead) > LEAD_MAX_WORDS) out.push(`lead has ${wordCount(lead)} words (max ${LEAD_MAX_WORDS})`);
  const stripped = stripAllowedDigits(stripModelNames(lead, names).replace(TOKEN_RE, " "), window, []);
  if (/\d/.test(stripped)) out.push(`lead contains a digit outside {{RELEASE_COUNT}} {{DISCLOSURE_COUNT}} {{WINDOW_DAYS}} and window dates: "${stripped.trim().slice(0, 80)}"`);
  return out;
}

/** Remove ISO dates that lie inside the window, then the given standalone numbers. */
export function stripAllowedDigits(text, window, numbers) {
  let s = text.replace(/\b\d{4}-\d{2}-\d{2}\b/g, (d) => (isIsoDate(d) && d >= window.from && d <= window.to ? " " : d));
  for (const n of numbers) s = s.replace(new RegExp(`(?<![0-9.])${n}(?![0-9])`, "g"), " ");
  return s;
}

export function resolveLead(lead, counts) {
  return lead
    .replaceAll("{{RELEASE_COUNT}}", String(counts.releaseCount))
    .replaceAll("{{DISCLOSURE_COUNT}}", String(counts.disclosureCount))
    .replaceAll("{{WINDOW_DAYS}}", String(counts.windowDays));
}

export function editionContentHash(edition) {
  const { corrections, contentHash, ...rest } = edition;
  void corrections; void contentHash;
  return sha256Hex(canonicalJson(rest));
}

/** Source (authored) problems. */
export function editionSourceProblems(src, names = []) {
  const p = [];
  if (!src || typeof src !== "object" || Array.isArray(src)) return ["edition source must be an object"];
  const allowed = ["date", "window", "lead", "coverage", "measuredNote", "corrections"];
  for (const k of Object.keys(src)) if (!allowed.includes(k)) p.push(`unknown key "${k}" in edition source`);
  for (const k of allowed) if (!(k in src)) p.push(`missing key "${k}" in edition source`);
  if (!isIsoDate(src.date)) p.push("date must be an ISO date");
  const w = src.window;
  if (!w || !isIsoDate(w.from) || !isIsoDate(w.to)) p.push("window.from and window.to must be ISO dates");
  else {
    if (w.from > w.to) p.push("window.from is after window.to");
    if (isIsoDate(src.date) && w.to > src.date) p.push("window.to is after the edition date");
  }
  const c = src.coverage;
  if (!c || !Array.isArray(c.scanned) || !Array.isArray(c.notScanned)) p.push("coverage.scanned and coverage.notScanned are both required arrays ([] must be explicit)");
  else for (const k of ["scanned", "notScanned"]) if (!c[k].every((s) => typeof s === "string" && s.trim())) p.push(`coverage.${k} entries must be non-empty strings`);
  if (!(src.measuredNote === null || (typeof src.measuredNote === "string" && src.measuredNote.trim()))) p.push("measuredNote must be null or a non-empty string");
  if (!Array.isArray(src.corrections) || src.corrections.length !== 0) p.push('corrections must be [] in the source (use --append-correction after compile)');
  if (w && isIsoDate(w.from) && isIsoDate(w.to)) p.push(...leadSourceProblems(src.lead, w, names));
  return p;
}

/**
 * Compile an authored source into an edition. Pure.
 * @param {{source:object, log:object, catalog:object, queueSnapshot:object, renderable:object[]}} input
 * @returns {{edition:object|null, errors:string[]}}
 */
export function compileEdition({ source, log, catalog, queueSnapshot, renderable }) {
  const errors = editionSourceProblems(source, allModelNames(catalog, log));
  if (errors.length) return { edition: null, errors };
  const { date, window } = source;
  const releases = deriveReleases(log, window, date);
  const disclosures = deriveDisclosures(releases);
  const counts = { releaseCount: releases.length, disclosureCount: disclosures.length, windowDays: windowDays(window.from, window.to) };
  const edition = {
    date,
    title: `AI Model Watch — ${date}`,
    window: { from: window.from, to: window.to },
    asOf: date,
    lead: resolveLead(source.lead, counts),
    coverage: { scanned: [...source.coverage.scanned], notScanned: [...source.coverage.notScanned] },
    coverageStatement: coverageStatementFor(source.coverage),
    releases,
    disclosures,
    measured: deriveMeasured(renderable, window, source.measuredNote),
    queue: deriveQueue(queueSnapshot),
    corrections: [],
    sources: deriveSources(releases),
    independence: INDEPENDENCE_LINE,
  };
  edition.contentHash = editionContentHash(edition);
  return { edition: ordered(edition, EDITION_KEYS), errors: [] };
}

export const editionCounts = (e) => ({ releaseCount: e.releases.length, disclosureCount: e.disclosures.length, windowDays: windowDays(e.window.from, e.window.to) });

export function manifestRow(e) {
  return {
    date: e.date, title: e.title, lead: e.lead, windowFrom: e.window.from, windowTo: e.window.to,
    releaseCount: e.releases.length, disclosureCount: e.disclosures.length,
  };
}

export function buildEditionsManifest(editions) {
  return { editions: editions.map(manifestRow).sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)) };
}

export { ISO_DATE_RE };
