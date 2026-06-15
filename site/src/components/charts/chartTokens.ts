/**
 * chartTokens.ts — S3.7 single source of truth for chart band colors.
 *
 * All chart components (BandDistributionBar, BandPositionStrip,
 * DimensionProfileBar, DimensionRadar) import from here.
 *
 * Aligns with the canonical BANDS in dimensions.ts (S1.5).
 * Colors match globals.css theme tokens exactly.
 *
 * CC-BY caption string is the canonical string for every chart figure.
 */

// ─── Band token type ──────────────────────────────────────────────────────────

export interface BandToken {
  /** Band name, capitalized (e.g. "Critical") */
  key: "Critical" | "Developing" | "Functional" | "Established" | "Exemplary";
  /** Human-readable range string */
  range: string;
  /** Lower composite bound, inclusive */
  min: number;
  /** Upper composite bound, exclusive (Exemplary is inclusive at 100) */
  max: number;
  /** Hex fill color — matches BANDS in dimensions.ts */
  color: string;
  /** Text color for in-bar labels (dark enough for contrast on colored band) */
  textColor: string;
}

// ─── Canonical band tokens (aligned with dimensions.ts BANDS) ─────────────────

export const CHART_BANDS: BandToken[] = [
  { key: "Critical",    range: "0–20",   min: 0,  max: 20,  color: "#f87171", textColor: "#0b1220" },
  { key: "Developing",  range: "20–40",  min: 20, max: 40,  color: "#fb923c", textColor: "#0b1220" },
  { key: "Functional",  range: "40–60",  min: 40, max: 60,  color: "#fcd34d", textColor: "#0b1220" },
  { key: "Established", range: "60–80",  min: 60, max: 80,  color: "#86efac", textColor: "#0b1220" },
  { key: "Exemplary",   range: "80–100", min: 80, max: 100, color: "#7dd3fc", textColor: "#0b1220" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Return the BandToken for a given 0–100 composite score.
 * Falls back to Critical for out-of-range values.
 */
export function getBand(score: number): BandToken {
  // Use >= for lower bound, <= for upper (Exemplary catches 100)
  return (
    CHART_BANDS.find((b) => score >= b.min && score <= b.max) ??
    CHART_BANDS[0]
  );
}

/**
 * Return the hex color for a given 0–100 composite score.
 * Useful for quick inline color resolution.
 */
export function getBandColor(score: number): string {
  return getBand(score).color;
}

/**
 * Return the BandToken matching a band name string (case-insensitive).
 * Falls back to Critical for unknown names.
 */
export function getBandByName(name: string): BandToken {
  const normalized = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  return CHART_BANDS.find((b) => b.key === normalized) ?? CHART_BANDS[0];
}

// ─── Canonical CC-BY caption ──────────────────────────────────────────────────

/** The canonical source/attribution caption for all chart figures. */
export const CC_BY_CAPTION = "Source: Compassion Benchmark · CC-BY";
