#!/usr/bin/env node
/**
 * lint-insights.mjs -- Insights lint (IL-1..IL-8) over the COMMITTED site/src/data/insights/*.json, so it runs in Docker
 * (no research/). Same rules and same module as build-insights.mjs (scripts/lib/insights-lint.mjs).
 *
 * Exit 1 on any finding. A gate that examined nothing proves nothing: with --require-posts, zero posts is a failure
 * (switch the build chain to it once the first post is published); without it, zero posts prints a warning and exits 0.
 *
 * Flags: --require-posts  --site-dir <dir> (tests)
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathsFor, readJsonIf, readWaveContext } from "./lib/model-watch-context.mjs";
import { lintPost, makeModelMatcher, manifestProblems, allowListProblems } from "./lib/insights-lint.mjs";

const arg = (n) => { const i = process.argv.indexOf(n); return i >= 0 ? process.argv[i + 1] : undefined; };
const paths = arg("--site-dir") ? pathsFor({ siteDir: resolve(arg("--site-dir")) }) : pathsFor();
const dir = paths.insightsDir;
const requirePosts = process.argv.includes("--require-posts");

const files = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(".json") && !["manifest.json", "lint-allow.json"].includes(f)).sort() : [];
const posts = files.map((f) => JSON.parse(readFileSync(join(dir, f), "utf8")));
const allow = readJsonIf(join(dir, "lint-allow.json")) ?? [];
const failures = [...allowListProblems(allow).map((p) => `IL-4: ${p}`)];

const catalog = readJsonIf(paths.catalog);
const wc = readWaveContext(paths);
const matcher = makeModelMatcher({ catalogRows: catalog?.rows ?? [], waves: wc.waves });

files.forEach((f, i) => {
  if (posts[i].slug !== f.replace(/\.json$/, "")) failures.push(`IL-1: ${f}: slug "${posts[i].slug}" must equal the filename`);
  failures.push(...lintPost(posts[i], { now: new Date(), matcher, allow }));
});
if (posts.length || existsSync(join(dir, "manifest.json"))) failures.push(...manifestProblems(readJsonIf(join(dir, "manifest.json")), posts));

for (const f of failures) console.error(`FAIL ${f}`);
console.log(`[lint-insights] ${posts.length} post(s) examined, ${matcher.formCount} model name form(s) loaded, ${failures.length} finding(s)`);
if (posts.length === 0) {
  if (requirePosts) { console.error("FAIL IL-1: no posts under site/src/data/insights (a gate that examined nothing proves nothing)"); process.exit(1); }
  console.warn("WARN no posts published yet under site/src/data/insights (pass --require-posts to make this a failure)");
}
process.exit(failures.length ? 1 : 0);
