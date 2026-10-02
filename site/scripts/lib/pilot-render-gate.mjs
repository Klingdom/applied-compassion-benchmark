/**
 * pilot-render-gate.mjs -- the ONE rule for whether a pilot wave renders.
 *
 * Template F1 / D-29a: pilot content renders only when the wave's
 * `publication.decision_status` is "active". While D-29a was PROPOSED the
 * default build rendered nothing. Founder review of an unratified pilot needs
 * the explicit local flag `CB_PREVIEW_PILOT_REPORTS=1`, which renders waves
 * whose decision is "proposed" (never "superseded" or "unresolved") together
 * with a visible PREVIEW strip.
 *
 * A wave is exported before its narrative is written, so a wave also needs its
 * report source (reports/<run_id>.md). A wave without one renders nothing: no
 * page, no sitemap entry, no public wave file, no mention, and no crash. The same
 * rule applies to every consumer because they all call renderableEntries() here.
 *
 * Imported by the site (src/lib/model-report-gate.ts), by next.config.ts, by the
 * prebuild steps that would otherwise publish wave data (export-model-wave-public.mjs,
 * build-llms.mjs) and by the built-tree gates, so there is a single definition.
 */

import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const PREVIEW_ENV = "CB_PREVIEW_PILOT_REPORTS";

/** Is the founder-review flag on? Only the exact value "1" turns it on. */
export function previewFlagOn(env = process.env) {
  return env[PREVIEW_ENV] === "1";
}

/** The committed report sources, relative to this file (site/src/data/model-benchmark/reports). Computed lazily so a bundler never evaluates it. */
function defaultReportsDir() {
  return join(dirname(fileURLToPath(import.meta.url)), "..", "..", "src", "data", "model-benchmark", "reports");
}

/** Does `<reportsDir>/<runId>.md` exist? */
export function reportSourceExists(runId, reportsDir = defaultReportsDir()) {
  return existsSync(join(reportsDir, `${runId}.md`));
}

/**
 * @param {{status:string, decision_status:string}} entry  a waves/manifest.json entry
 * @returns {"active" | "preview" | null}  by decision and status only; see renderableEntries for the report-source rule
 */
export function renderMode(entry, env = process.env) {
  if (!entry || entry.status !== "pilot") return null; // official wave rendering stays disabled (D-29a item 8)
  if (entry.decision_status === "active") return "active";
  if (entry.decision_status === "proposed" && previewFlagOn(env)) return "preview";
  return null;
}

/**
 * Manifest entries that render, each with its mode, in manifest order (newest first).
 * `opts.reportsDir` points the report-source check at another directory (tests, the Next gate);
 * `opts.requireReport: false` skips it (a caller that only needs the decision rule).
 */
export function renderableEntries(manifest, env = process.env, opts = {}) {
  const { reportsDir, requireReport = true } = opts;
  return manifest
    .map((entry) => ({ entry, mode: renderMode(entry, env) }))
    .filter((x) => x.mode !== null)
    .filter((x) => !requireReport || reportSourceExists(x.entry.run_id, reportsDir));
}

/** D-29a item 1: "No reports index until two reports." The reports index page exists only when this many reports render. */
export const REPORTS_INDEX_MIN = 2;

/** Does the /ai-models/reports index page render in this build? Same inputs as renderableEntries. */
export function reportsIndexRenders(manifest, env = process.env, opts = {}) {
  return renderableEntries(manifest, env, opts).length >= REPORTS_INDEX_MIN;
}
