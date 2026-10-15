#!/usr/bin/env node
/**
 * build-model-dashboard-data.mjs -- the static downloads of the AI Model Compassion Dashboard.
 *
 *   waves/<run_id>.json (internal)  ->  projectWavePublic  ->  dashboardRows
 *     -> public/data/model-dashboard/<run_id>.csv    tidy long format, CSV header lines carry the label
 *     -> public/data/model-dashboard/<run_id>.json   { meta, rows }, meta carries the label, licence and the wave sha256
 *
 * Only the PUBLIC PROJECTION is read into a row (a withheld point is absent from it, so it cannot reach a download), and only for the
 * waves the dashboard renders (dashboard-render-gate.mjs: its own gate, D-29b ratified or CB_PREVIEW_DASHBOARD=1, plus the pilot wave rule). The directory is rebuilt
 * from scratch on every run, so a file from an earlier preview build cannot survive into a default build. public/data/ is gitignored.
 *
 * Plain .mjs (runs in the Docker build's Node, which has no TypeScript stripping). The page imports the same core module,
 * so the "Current view" downloads made in the browser and these files are produced by one set of functions.
 */
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadManifest, loadRenderedReports, projectWavePublic, projectionProblems, dataDirs } from "./lib/model-benchmark-public.mjs";
import { dashboardEntries } from "./lib/dashboard-render-gate.mjs";
import { dashboardRows, rowsToCsv, exportJson, exportMeta, accessTierPlain, shortCitation } from "./lib/model-dashboard-core.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const SITE = join(HERE, "..");
const OUT = join(SITE, "public", "data", "model-dashboard");
rmSync(OUT, { recursive: true, force: true });

// The dashboard's OWN gate (D-29b ratified, or CB_PREVIEW_DASHBOARD=1) on top of the wave rule: closed = an empty projection, nothing written.
const open = new Set(dashboardEntries(loadManifest(SITE), process.env, { reportsDir: dataDirs(SITE).reports }).map((x) => x.entry.run_id));
const rendering = loadRenderedReports(SITE).filter((x) => open.has(x.entry.run_id));
if (rendering.length === 0) {
  console.log("[build-model-dashboard-data] the dashboard gate is closed or no dashboard wave renders (D-29b not ratified and CB_PREVIEW_DASHBOARD not set); nothing written under public/data/model-dashboard.");
  process.exit(0);
}
mkdirSync(OUT, { recursive: true });
const { waves } = dataDirs(SITE);

for (const { entry, wave } of rendering) {
  const pub = projectWavePublic(wave);
  const problems = projectionProblems(pub, wave);
  if (problems.length) {
    console.error(`[build-model-dashboard-data] FAIL: the public projection of ${entry.run_id} is wrong:\n  ${problems.join("\n  ")}`);
    process.exit(1);
  }
  const sha = createHash("sha256").update(readFileSync(join(waves, `${entry.run_id}.json`))).digest("hex");
  const claimed = entry.sha256 ?? entry.wave_sha256;
  if (claimed && claimed !== sha) {
    console.error(`[build-model-dashboard-data] FAIL: ${entry.run_id}.json sha256 ${sha} does not match the committed ${claimed}`);
    process.exit(1);
  }
  const rows = dashboardRows(pub);
  const meta = exportMeta({
    runId: pub.run_id, reportDate: pub.report_date, accessTier: accessTierPlain(pub.design.access_tier), waveSha256: sha,
    citation: shortCitation(pub.run_id, pub.report_date), view: "whole wave",
  });
  writeFileSync(join(OUT, `${entry.run_id}.csv`), rowsToCsv(rows, meta));
  writeFileSync(join(OUT, `${entry.run_id}.json`), JSON.stringify(exportJson(rows, meta), null, 2) + "\n");
  console.log(`[build-model-dashboard-data] ok ${entry.run_id} -> public/data/model-dashboard/${entry.run_id}.{csv,json} (${rows.length} rows)`);
}
