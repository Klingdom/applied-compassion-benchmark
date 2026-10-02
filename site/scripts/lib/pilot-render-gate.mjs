/**
 * pilot-render-gate.mjs -- the ONE rule for whether a pilot wave renders.
 *
 * Template F1 / D-29a: pilot content renders only when the wave's
 * `publication.decision_status` is "active". D-29a is still PROPOSED, so the
 * default build renders nothing. Founder review of an unratified pilot needs
 * the explicit local flag `CB_PREVIEW_PILOT_REPORTS=1`, which renders waves
 * whose decision is "proposed" (never "superseded" or "unresolved") together
 * with a visible PREVIEW strip.
 *
 * Imported by the site (src/lib/model-report-gate.ts), by the prebuild steps
 * that would otherwise publish wave data (export-model-wave-public.mjs,
 * build-llms.mjs) and by the built-tree gates, so there is a single definition.
 */

export const PREVIEW_ENV = "CB_PREVIEW_PILOT_REPORTS";

/** Is the founder-review flag on? Only the exact value "1" turns it on. */
export function previewFlagOn(env = process.env) {
  return env[PREVIEW_ENV] === "1";
}

/**
 * @param {{status:string, decision_status:string}} entry  a waves/manifest.json entry
 * @returns {"active" | "preview" | null}
 */
export function renderMode(entry, env = process.env) {
  if (!entry || entry.status !== "pilot") return null; // official wave rendering stays disabled (D-29a item 8)
  if (entry.decision_status === "active") return "active";
  if (entry.decision_status === "proposed" && previewFlagOn(env)) return "preview";
  return null;
}

/** Manifest entries that render, each with its mode. */
export function renderableEntries(manifest, env = process.env) {
  return manifest.map((entry) => ({ entry, mode: renderMode(entry, env) })).filter((x) => x.mode !== null);
}
