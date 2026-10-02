/**
 * model-report-gate.ts -- which pilot reports the site renders, and the data a
 * rendered report needs. Server-side (build time) only.
 *
 * The render rule lives in scripts/lib/pilot-render-gate.mjs so the prebuild
 * steps and the built-tree gates share it. Default: nothing renders while D-29a
 * is "proposed". `CB_PREVIEW_PILOT_REPORTS=1` renders proposed pilots for local
 * founder review, with a PREVIEW strip. Active (ratified) waves render without
 * the flag.
 *
 * The compiled report (reports/<run_id>.json, gitignored) is produced by
 * scripts/build-model-reports.mjs in prebuild. It is verified against the wave
 * file here (figure ledger, hashes) so a hand-edited or stale file fails the build.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { getWaveManifest, loadWave, assertRenderable, type ManifestEntry, type PilotWave } from "@/lib/model-wave-facts";
import { renderMode, previewFlagOn, PREVIEW_ENV } from "../../scripts/lib/pilot-render-gate.mjs";
import { verifyCompiled } from "../../scripts/lib/model-report.mjs";

export type RenderMode = "active" | "preview";
export { PREVIEW_ENV };

export interface CompiledSection {
  id: string;
  title: string;
  markdown: string;
  html: string;
}

export interface CompiledReport {
  schema: string;
  run_id: string;
  report_date: string;
  word_count: number;
  front_matter: string[];
  preface: { markdown: string; html: string };
  sections: CompiledSection[];
  figure_ledger: unknown[];
}

export interface RenderableReport {
  entry: ManifestEntry;
  mode: RenderMode;
  wave: PilotWave;
  report: CompiledReport;
}

export const previewOn: boolean = previewFlagOn();

const REPORTS_DIR = join(process.cwd(), "src", "data", "model-benchmark", "reports");

/** Manifest entries that render in this build (newest first, as in the manifest). */
export function renderableEntries(): { entry: ManifestEntry; mode: RenderMode }[] {
  return getWaveManifest()
    .map((entry) => ({ entry, mode: renderMode(entry) as RenderMode | null }))
    .filter((x): x is { entry: ManifestEntry; mode: RenderMode } => x.mode !== null);
}

export function loadRenderable(runId: string): RenderableReport {
  const hit = renderableEntries().find((x) => x.entry.run_id === runId);
  if (!hit) throw new Error(`report ${runId} is not renderable in this build (decision status or preview flag)`);
  const wave = assertRenderable(loadWave(runId));
  const file = join(REPORTS_DIR, `${runId}.json`);
  if (!existsSync(file)) {
    throw new Error(`compiled report ${file} is missing: run \`node scripts/build-model-reports.mjs\` (prebuild does this)`);
  }
  const report = JSON.parse(readFileSync(file, "utf8")) as CompiledReport;
  // Every mismatch is fatal, V-unexplained-digit included: the compiler ledgers front-matter tokens
  // (location front_matter.<field>), so a digit nothing produced is a hand edit or a stale compile.
  const problems = verifyCompiled(report, wave) as string[];
  if (problems.length) throw new Error(`compiled report ${runId} does not match its wave:\n  ${problems.join("\n  ")}`);
  return { entry: hit.entry, mode: hit.mode, wave, report };
}

/** All rendered reports, loaded. Empty in the default build. */
export function loadRenderableReports(): RenderableReport[] {
  return renderableEntries().map((x) => loadRenderable(x.entry.run_id));
}

/** The newest rendered report, or null (default build, or no waves). */
export function latestRenderableReport(): RenderableReport | null {
  const e = renderableEntries()[0];
  return e ? loadRenderable(e.entry.run_id) : null;
}
