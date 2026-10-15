/**
 * dashboard-render-gate.mjs -- the ONE rule for whether the AI Model Compassion Dashboard renders.
 *
 * The dashboard has its OWN gate, independent of the pilot-report gate (pilot-render-gate.mjs, D-29a). The PRD
 * (docs/ai-dashboard/PRD_AI_MODEL_DASHBOARD.md, IR-01) allows the route only after D-29b is ratified, and ratified pilot
 * reports (D-29a) must not carry the dashboard with them. So the dashboard renders only when
 *
 *   1. src/data/model-benchmark/dashboard-decision.json has status "active" (D-29b ratified; the founder flips it, never an agent), or
 *   2. the local founder preview CB_PREVIEW_DASHBOARD=1 is set (exact value "1"; never set in CI, Docker or the nightly pipeline),
 *
 * AND at least one wave renders under the pilot gate and is a dashboard wave (unofficial pilot). With the gate closed every
 * consumer sees an empty list: no route (own page extension "dashboard.tsx"), no sitemap entry, no download, no link.
 * A preview of a "proposed" wave needs CB_PREVIEW_PILOT_REPORTS=1 as well (the wave gate is unchanged).
 *
 * Plain .mjs (the Docker build's Node has no TypeScript stripping). Imported by next.config.ts, the site adapter, the prebuild
 * download step and the built-tree gates.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderableEntries } from "./pilot-render-gate.mjs";
import { isDashboardWave } from "./model-dashboard-core.mjs";

export const DASHBOARD_PREVIEW_ENV = "CB_PREVIEW_DASHBOARD";
export const DASHBOARD_DECISION_REF = "D-29b";

export const dashboardPreviewOn = (env = process.env) => env[DASHBOARD_PREVIEW_ENV] === "1";

export function defaultDecisionPath() {
  return join(dirname(fileURLToPath(import.meta.url)), "..", "..", "src", "data", "model-benchmark", "dashboard-decision.json");
}

/** The committed dashboard decision, or a closed one when the file is absent or unreadable (fail closed). */
export function loadDashboardDecision(path = defaultDecisionPath()) {
  try {
    if (!existsSync(path)) return { decision_ref: DASHBOARD_DECISION_REF, status: "proposed" };
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return { decision_ref: DASHBOARD_DECISION_REF, status: "proposed" };
  }
}

/** @returns {"active" | "preview" | null} the dashboard gate by decision and env only (waves are a separate condition). */
export function dashboardGateMode(decision, env = process.env) {
  if (decision && decision.decision_ref === DASHBOARD_DECISION_REF && decision.status === "active") return "active";
  if (dashboardPreviewOn(env)) return "preview";
  return null;
}

/**
 * Manifest entries the dashboard renders, newest first: [] when the gate is closed, else the pilot-gate entries that are dashboard waves.
 * opts: { reportsDir, requireReport, decision } (decision defaults to the committed file).
 */
export function dashboardEntries(manifest, env = process.env, opts = {}) {
  const { decision = loadDashboardDecision(), ...rest } = opts;
  if (dashboardGateMode(decision, env) === null) return [];
  return renderableEntries(manifest, env, rest).filter((x) => isDashboardWave(x.entry));
}

export const dashboardRoutes = (manifest, env = process.env, opts = {}) => dashboardEntries(manifest, env, opts).length > 0;
