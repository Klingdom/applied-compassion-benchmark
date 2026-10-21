#!/usr/bin/env node
/**
 * build-insights.mjs -- compile research/insights/<slug>.md into site/src/data/insights/<slug>.json + manifest.json.
 *
 * Prebuild step (docs/ARCHITECTURE_AI_MODEL_WATCH.md A4). FAILS CLOSED: every post is parsed, compiled and linted (rules IL-1..IL-8,
 * scripts/lib/insights-lint.mjs) BEFORE anything is written; if any post has a finding the script prints all findings, writes
 * nothing and exits 1. Skips (exit 0) when research/insights/ is absent: Docker copies only site/, and the committed JSON is
 * the deployable source of truth (the build-special-briefings precedent).
 *
 * Files that are not posts are skipped by name or shape: FACT_CHECK*, names that are not a slug, and files that do not open
 * with a front-matter block. A file that DOES open with front matter but is malformed is an error, never silently skipped.
 *
 * research/insights/lint-allow.json ([{slug, sentencePrefix, reason}]) is the only source of IL-4 exemptions. It is copied to
 * site/src/data/insights/lint-allow.json so lint-insights.mjs can run in Docker.
 *
 * Flags: --dry-run  compile and lint, print findings, write nothing.   --check  as --dry-run, and exit 1 if the committed
 * JSON differs from what would be written.   --catalog <path>  use that catalog (research or site format) for the IL-5 model-name list.
 * --skip-unpublished  staging mode (see the comment at its use): never-published failing posts are held back, not fatal.
 * --site-dir <dir> / --research-dir <dir> (tests)
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, resolve } from "node:path";
import { pathsFor, readJsonIf, readWaveContext } from "./lib/model-watch-context.mjs";
import { parsePostSource, buildPost, lintPost, buildInsightsManifest, isPostCandidate, makeModelMatcher, allowListProblems } from "./lib/insights-lint.mjs";
import { serialise } from "./lib/model-watch-core.mjs";

const arg = (n) => { const i = process.argv.indexOf(n); return i >= 0 ? process.argv[i + 1] : undefined; };
const flag = (n) => process.argv.includes(n);
const paths = arg("--site-dir") ? pathsFor({ siteDir: resolve(arg("--site-dir")) }) : pathsFor();
const srcDir = arg("--research-dir") ? resolve(arg("--research-dir")) : paths.researchInsightsDir;
const outDir = paths.insightsDir;
const dryRun = flag("--dry-run") || flag("--check");

if (!existsSync(srcDir)) {
  console.log(`[build-insights] ${srcDir} not present (expected in Docker build) - using committed site/src/data/insights/*. Skipping regeneration.`);
  process.exit(0);
}

function generatedAtFor(file, date) {
  try {
    const out = execFileSync("git", ["log", "-1", "--format=%cI", "--", file], { cwd: paths.repoRoot, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    if (out) return out;
  } catch { /* uncommitted, or git unavailable */ }
  return `${date}T00:00:00.000Z`;
}

const allowPath = join(srcDir, "lint-allow.json");
const allow = readJsonIf(allowPath) ?? readJsonIf(join(outDir, "lint-allow.json")) ?? [];
const problems = [...allowListProblems(allow).map((p) => `IL-4: ${p}`)];

// --catalog <path> lets the lint see a research catalog ({models: [...]}) before it is imported.
const catalogArg = arg("--catalog") ? readJsonIf(resolve(arg("--catalog"))) : null;
const catalog = catalogArg ? { rows: catalogArg.models ?? catalogArg.rows ?? [] } : readJsonIf(paths.catalog);
const wc = readWaveContext(paths);
const matcher = makeModelMatcher({ catalogRows: catalog?.rows ?? [], waves: wc.waves });

const posts = []; // posts with zero findings: the only ones ever written
const byPost = new Map(); // slug -> findings
let examined = 0;
let skipped = 0;
for (const filename of readdirSync(srcDir).sort()) {
  if (!filename.endsWith(".md")) continue;
  const file = join(srcDir, filename);
  const text = readFileSync(file, "utf8");
  if (!isPostCandidate(filename, text)) { skipped += 1; console.log(`  [skip] ${filename} (not a post: FACT_CHECK file, non-slug name or no front matter)`); continue; }
  const slug = filename.slice(0, -3);
  examined += 1;
  const parsed = parsePostSource(text, slug);
  const found = parsed.errors.map((e) => { const [rule, ...rest] = e.split(": "); return `${rule}: ${slug}: ${rest.join(": ")}`; });
  if (parsed.fm) {
    const post = buildPost(slug, parsed, { generatedAt: generatedAtFor(file, parsed.fm.date) });
    found.push(...lintPost(post, { now: new Date(), matcher, allow, sourcesUnparsed: parsed.errors.some((e) => e.startsWith("IL-3") && e.includes("Sources line")) }));
    if (found.length === 0) posts.push(post);
  }
  if (found.length) byPost.set(slug, found);
}

// --skip-unpublished (staging mode, used by `prebuild` until the first post is published): a post that fails lint and has never been
// published is HELD BACK (reported, never written) instead of failing the build. A failing post that is ALREADY published still fails
// closed, and no failing post is ever written in either mode.
const skipUnpublished = flag("--skip-unpublished");
const heldBack = [];
for (const [slug, found] of byPost) {
  if (skipUnpublished && !existsSync(join(outDir, `${slug}.json`))) heldBack.push([slug, found]);
  else problems.push(...found);
}
console.log(`[build-insights] ${examined} post(s) examined, ${posts.length} clean, ${skipped} file(s) skipped, ${problems.length + heldBack.reduce((n, [, f]) => n + f.length, 0)} finding(s)`);
for (const [slug, found] of heldBack) {
  console.warn(`WARN NOT PUBLISHED: ${slug} has ${found.length} lint finding(s) (staging mode; fix the post, then it publishes)`);
  for (const f of found) console.warn(`  - ${f}`);
}
if (examined === 0) problems.push("IL-1: no posts were examined in research/insights (a gate that examined nothing proves nothing)");
if (problems.length) {
  for (const p of problems) console.error(`FAIL ${p}`);
  console.error("[build-insights] lint fails closed: nothing written.");
  process.exit(1);
}

const manifest = buildInsightsManifest(posts);
const files = new Map(posts.map((p) => [join(outDir, `${p.slug}.json`), serialise(p)]));
files.set(join(outDir, "manifest.json"), serialise(manifest));
if (existsSync(allowPath)) files.set(join(outDir, "lint-allow.json"), serialise(allow));

if (flag("--check")) {
  const diff = [...files].filter(([p, text]) => !existsSync(p) || readFileSync(p, "utf8") !== text).map(([p]) => p);
  if (diff.length) { for (const d of diff) console.error(`FAIL committed file differs from the build: ${d}`); process.exit(1); }
  console.log("[build-insights] --check: committed JSON matches the sources.");
  process.exit(0);
}
if (dryRun) { console.log("[build-insights] --dry-run: lint clean, nothing written."); process.exit(0); }

mkdirSync(outDir, { recursive: true });
let written = 0;
for (const [p, text] of files) {
  if (existsSync(p) && readFileSync(p, "utf8") === text) continue;
  writeFileSync(p, text, "utf8");
  written += 1;
}
const known = new Set([...files.keys()].map((p) => p.replace(/\\/g, "/")));
for (const f of readdirSync(outDir)) if (f.endsWith(".json") && !known.has(join(outDir, f).replace(/\\/g, "/"))) console.warn(`WARN ${f} in site/src/data/insights has no source in research/insights (left in place)`);
console.log(`[build-insights] ${posts.length} post(s) published, ${heldBack.length} held back, ${written} file(s) written, manifest rebuilt.`);
