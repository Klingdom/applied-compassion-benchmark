/**
 * model-machine-leak.mjs -- G24: the publication rule, enforced on the MACHINE-READABLE twins of the report.
 *
 * Defect class DC-24: a rule enforced on the rendered page but not on its JSON, plain-text or structured-data copy.
 * The report withholds a not-separated model's point estimate (template amendment 2), the dimension means (9) and the
 * point differences that would rebuild it (8). Every machine-readable output must say no more than the page:
 *
 *   data/model-waves/<run_id>.json     the public wave file: must equal the projection of the internal wave
 *   data/model-benchmark/**            the program index
 *   llms.txt, llms-full.txt            plain text for AI readers
 *   ai-models/reports/<run_id>.md      markdown alternates
 *   .well-known/*.json                 tool descriptor
 *   JSON-LD blocks in ai-models/**.html
 *
 * Pure functions of text and a wave, so each is proved with planted probes (test-model-machine-leak.mjs) and then
 * pointed at the real built tree. Rule ids: G24-*.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { withheldValues, extractJsonLd, listFiles, aiModelsFiles, SITE_URL } from "./model-report-html-gates.mjs";
import { projectWavePublic, projectionProblems, notSeparatedMembers } from "./model-benchmark-public.mjs";
import { renderableEntries, REPORTS_INDEX_MIN } from "./pilot-render-gate.mjs";

const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const tokRe = (tok) => new RegExp(`(?<![0-9])${escRe(tok)}(?![0-9])`);
const NUM_LITERAL = /-?\d+(?:\.\d+)?(?:[eE][-+]?\d+)?/g;

/** Count every numeric literal in a text, keyed by its numeric value. */
export function numberCounts(text) {
  const m = new Map();
  for (const t of text.match(NUM_LITERAL) ?? []) m.set(Number(t), (m.get(Number(t)) ?? 0) + 1);
  return m;
}

/** Numeric leaves of a parsed JSON value: [{ path, key, value }]. */
export function numericLeaves(x, path = "$", key = "", out = []) {
  if (typeof x === "number") out.push({ path, key, value: x });
  else if (Array.isArray(x)) x.forEach((v, i) => numericLeaves(v, `${path}[${i}]`, key, out));
  else if (x && typeof x === "object") for (const [k, v] of Object.entries(x)) numericLeaves(v, `${path}.${k}`, k, out);
  return out;
}

/** Every value the public copy must not carry for this wave's not-separated members, as exact numbers. */
export function withheldNumbers(wave) {
  const members = new Set(notSeparatedMembers(wave));
  const vals = new Set();
  const add = (v) => { if (typeof v === "number" && Number.isFinite(v)) vals.add(v); };
  for (const id of members) {
    add(wave.subjects[id]?.pilot_composite);
    add(wave.sensitivity?.subjects?.[id]?.pilot_composite);
    for (const v of Object.values(wave.subjects[id]?.dimensions ?? {})) add(v);
    add(wave.length?.composite_if_pooled_slope_removed?.[id]);
  }
  const pairLists = [wave.pairwise, wave.dimension_pairwise, wave.sensitivity?.pairwise];
  for (const list of pairLists) for (const q of list ?? []) if (members.has(q.a) || members.has(q.b)) { add(q.difference); if (typeof q.difference === "number") add(-q.difference); }
  for (const r of [wave.derived.not_separated_group_range, ...(wave.derived.not_separated_group_ranges ?? [])]) for (const v of r ?? []) add(v);
  return vals;
}

/**
 * The public wave file of `wave`, as text. Checks: it parses; it passes the structural projection rules; it equals the
 * projection exactly; and no withheld value occurs more often than it does in the trusted projection (a value that
 * coincides with a published one is allowed exactly as often as the projection itself carries it).
 */
export function publicWaveProblems({ text, wave, label = "public wave file" }) {
  const p = [];
  let parsed;
  try { parsed = JSON.parse(text); } catch (e) { return [`G24-parse: ${label} does not parse: ${e.message}`]; }
  for (const x of projectionProblems(parsed, wave)) p.push(`${x} (${label})`);
  const reference = JSON.stringify(projectWavePublic(wave), null, 2);
  if (JSON.stringify(parsed) !== JSON.stringify(JSON.parse(reference))) p.push(`G24-projection-drift: ${label} differs from the projection of the internal wave file`);
  const have = numberCounts(text);
  const allowed = numberCounts(reference);
  for (const v of withheldNumbers(wave)) {
    if ((have.get(v) ?? 0) > (allowed.get(v) ?? 0)) p.push(`G24-member-value: ${v} (a withheld point, dimension mean or point difference) appears ${have.get(v)} time(s) in ${label}; the projection carries it ${allowed.get(v) ?? 0} time(s)`);
  }
  return p;
}

/** Positive control: a separated subject's point IS in the public file (otherwise the file lost data it may carry). */
export function separatedPointsPresentProblems({ text, wave, label = "public wave file" }) {
  const p = [];
  let parsed;
  try { parsed = JSON.parse(text); } catch { return [`G24-parse: ${label} does not parse`]; }
  for (const id of wave.derived.separated_subjects) {
    if (parsed.subjects?.[id]?.pilot_composite !== wave.subjects[id].pilot_composite) p.push(`G24-separated-point-missing: ${label} lacks the point of separated subject ${id} (positive control)`);
  }
  return p;
}

/**
 * Any other machine-readable text (markdown, llms files, descriptors, the index, JSON-LD text): no member point in any
 * form. `text` may be JSON; its numeric leaves are checked as well, because a JSON number prints without a trailing zero.
 */
export function machineTextProblems({ text, wave, label }) {
  const p = [];
  const w = withheldValues(wave);
  const tokens = new Set([...w.memberComposites]);
  for (const r of [wave.derived.not_separated_group_range, ...(wave.derived.not_separated_group_ranges ?? [])]) for (const v of r ?? []) tokens.add(v.toFixed(1));
  for (const tok of tokens) if (tokRe(tok).test(text)) p.push(`G24-member-point-token: ${tok} (a not-separated model's point estimate) in ${label}`);
  let parsed = null;
  try { parsed = JSON.parse(text); } catch { /* plain text */ }
  if (parsed !== null) {
    const exact = new Set([...tokens].map(Number));
    for (const leaf of numericLeaves(parsed)) {
      if (exact.has(leaf.value) && (!Number.isInteger(leaf.value) || /composite|point|score|mean|difference|estimate/i.test(leaf.key))) {
        p.push(`G24-member-point-leaf: ${leaf.value} at ${leaf.path} (a not-separated model's point estimate) in ${label}`);
      }
    }
  }
  return p;
}

/** JSON-LD blocks of an HTML page as machine text. */
export function jsonLdText(html) {
  const blocks = extractJsonLd(html);
  return blocks.length ? JSON.stringify(blocks) : ""; // one JSON array, so the numeric-leaf rule reads every block
}

// ---------------------------------------------------------------------------
// The built tree
// ---------------------------------------------------------------------------

const read = (outDir, rel) => readFileSync(join(outDir, rel), "utf8");

/** Machine-readable files of the built tree, relative to out/. */
export function machineFiles(outDir) {
  const files = [];
  for (const f of listFiles(join(outDir, "data", "model-waves"), join(outDir, "data", "model-waves"))) files.push(`data/model-waves/${f}`);
  for (const f of listFiles(join(outDir, "data", "model-benchmark"), join(outDir, "data", "model-benchmark"))) files.push(`data/model-benchmark/${f}`);
  for (const f of ["llms.txt", "llms-full.txt"]) if (existsSync(join(outDir, f))) files.push(f);
  for (const f of listFiles(join(outDir, ".well-known"), join(outDir, ".well-known"))) files.push(`.well-known/${f}`);
  for (const f of aiModelsFiles(outDir)) if (f.endsWith(".md")) files.push(f);
  return files;
}

/**
 * Scan the real tree. Returns { problems, examined } where `examined` counts what was scanned (fail on zero).
 * Every file is checked against EVERY manifest wave (rendering or not): a withheld value of any wave must not appear anywhere.
 */
export function scanMachineTree({ outDir, waves }) {
  const problems = [];
  let examined = 0;
  for (const f of machineFiles(outDir)) {
    const text = read(outDir, f);
    examined += 1;
    for (const wave of waves) {
      const own = f === `data/model-waves/${wave.run_id}.json`;
      if (own) problems.push(...publicWaveProblems({ text, wave, label: f }), ...separatedPointsPresentProblems({ text, wave, label: f }));
      else problems.push(...machineTextProblems({ text, wave, label: `${f} (against ${wave.run_id})` }));
    }
  }
  for (const f of aiModelsFiles(outDir)) {
    if (!f.endsWith(".html")) continue;
    const ld = jsonLdText(read(outDir, f));
    if (!ld) continue;
    examined += 1;
    for (const wave of waves) problems.push(...machineTextProblems({ text: ld, wave, label: `JSON-LD of ${f} (against ${wave.run_id})` }));
  }
  return { problems, examined };
}

/**
 * Existence rules for the new outputs, given what renders in this build.
 *   index.json and one public wave file and one markdown alternate per rendered report; none for a wave that does not render;
 *   the reports index page and its sitemap entry only when REPORTS_INDEX_MIN reports render;
 *   each report page carries the markdown alternate link.
 */
export function machineTreeProblems({ outDir, manifest, waves, env = process.env, reportsDir }) {
  const p = [];
  const rendering = renderableEntries(manifest, env, { reportsDir });
  const ids = new Set(rendering.map((x) => x.entry.run_id));
  const indexPath = join(outDir, "data", "model-benchmark", "index.json");
  if (rendering.length === 0 && existsSync(indexPath)) p.push("TREE-leak: data/model-benchmark/index.json exists but no wave renders in this build");
  if (rendering.length > 0) {
    if (!existsSync(indexPath)) p.push("TREE-missing: data/model-benchmark/index.json is absent");
    else {
      const idx = JSON.parse(readFileSync(indexPath, "utf8"));
      const listed = (idx.pilot_reports ?? []).map((r) => r.run_id).sort().join();
      if (listed !== [...ids].sort().join()) p.push(`TREE-index: index.json lists [${listed}] but the build renders [${[...ids].sort().join()}]`);
      for (const r of idx.pilot_reports ?? []) {
        for (const k of ["report_url", "markdown_url", "wave_url"]) {
          const path = String(r[k]).replace(SITE_URL, "");
          const rel = path.endsWith(".md") || path.endsWith(".json") ? path.slice(1) : `${path.slice(1)}.html`;
          if (!existsSync(join(outDir, rel))) p.push(`TREE-index: index.json ${r.run_id}.${k} points at ${path}, which is not in the tree`);
        }
      }
    }
  }
  for (const w of waves) {
    const md = `ai-models/reports/${w.run_id}.md`;
    const there = existsSync(join(outDir, md));
    if (ids.has(w.run_id) && !there) p.push(`TREE-missing: ${md} (the markdown alternate) is absent`);
    if (!ids.has(w.run_id) && there) p.push(`TREE-leak: ${md} exists but wave ${w.run_id} does not render`);
    if (ids.has(w.run_id) && existsSync(join(outDir, `ai-models/reports/${w.run_id}.html`))) {
      const html = read(outDir, `ai-models/reports/${w.run_id}.html`);
      if (!new RegExp(`<link[^>]*rel="alternate"[^>]*type="text/markdown"[^>]*href="${escRe(`${SITE_URL}/ai-models/reports/${w.run_id}.md`)}"`).test(html) && !new RegExp(`<link[^>]*type="text/markdown"[^>]*href="${escRe(`${SITE_URL}/ai-models/reports/${w.run_id}.md`)}"`).test(html)) {
        p.push(`TREE-alternate: ${w.run_id}.html lacks <link rel="alternate" type="text/markdown" href=".../${w.run_id}.md">`);
      }
      if (!html.includes('id="data-and-citation"') && !html.includes("Data and citation")) p.push(`TREE-citation: ${w.run_id}.html lacks the "Data and citation" block`);
    }
  }
  const indexPage = existsSync(join(outDir, "ai-models", "reports.html"));
  if (rendering.length >= REPORTS_INDEX_MIN && !indexPage) p.push("TREE-missing: ai-models/reports.html (the reports index) is absent although enough reports render");
  const sm = join(outDir, "sitemap.xml");
  if (existsSync(sm)) {
    const xml = readFileSync(sm, "utf8");
    const listedIndex = new RegExp(`<loc>${escRe(SITE_URL)}/ai-models/reports</loc>`).test(xml);
    if (listedIndex !== (rendering.length >= REPORTS_INDEX_MIN)) p.push(`TREE-sitemap: /ai-models/reports is ${listedIndex ? "listed" : "not listed"} but ${rendering.length} report(s) render (index needs ${REPORTS_INDEX_MIN})`);
  }
  return p;
}
