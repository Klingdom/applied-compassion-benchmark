/**
 * badge.ts — SVG badge renderer for Compassion Benchmark entity scores.
 *
 * Produces an SVG image suitable for embedding in GitHub READMEs, websites,
 * or any context that renders images. The badge is intentionally simple and
 * accessible (role="img", aria-label).
 *
 * Supports two styles via the `?style=` query parameter:
 *   compact  — narrow single-line badge (default)
 *   detailed — wider two-line badge with score bar
 */

export type BadgeStyle = "compact" | "detailed";

const BAND_COLORS: Record<string, string> = {
  exemplary: "#86efac",   // green
  established: "#7dd3fc", // sky
  functional: "#fde68a",  // yellow
  developing: "#fb923c",  // orange
  critical: "#f87171",    // red
};

function bandColor(band: string): string {
  return BAND_COLORS[band.toLowerCase()] ?? "#94a3b8";
}

/**
 * Render a compact single-line SVG badge (200×28px).
 * Suitable for embedding as a small inline image.
 */
function renderCompact(slug: string, composite: number, band: string): string {
  const color = bandColor(band);
  const label = "Compassion Benchmark";
  const value = `${composite} · ${band}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="28" role="img" aria-label="${label}: ${value}">
  <title>${label}: ${composite} — ${band}</title>
  <rect width="240" height="28" rx="5" fill="#0b1220"/>
  <rect width="130" height="28" rx="5" fill="rgba(255,255,255,0.06)"/>
  <text x="8" y="18" font-family="system-ui,sans-serif" font-size="11" fill="#94a3b8">${label}</text>
  <rect x="130" width="110" height="28" rx="0" fill="rgba(0,0,0,0.2)"/>
  <rect x="235" width="5" height="28" rx="5" fill="rgba(0,0,0,0.2)"/>
  <text x="138" y="18" font-family="system-ui,sans-serif" font-size="11" font-weight="700" fill="${color}">${value}</text>
</svg>`;
}

/**
 * Render a detailed two-line SVG badge (220×44px) with entity slug and score bar.
 * Suitable for README files and documentation.
 */
function renderDetailed(slug: string, composite: number, band: string): string {
  const color = bandColor(band);
  const barWidth = Math.round((composite / 100) * 196);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="52" role="img" aria-label="Compassion Benchmark: ${slug} — ${composite} ${band}">
  <title>Compassion Benchmark: ${slug} — ${composite} (${band})</title>
  <rect width="220" height="52" rx="8" fill="#0b1220"/>
  <text x="12" y="16" font-family="system-ui,sans-serif" font-size="9" fill="#64748b">COMPASSION BENCHMARK</text>
  <text x="12" y="32" font-family="system-ui,sans-serif" font-size="15" font-weight="700" fill="#e2e8f0">${composite}</text>
  <text x="44" y="32" font-family="system-ui,sans-serif" font-size="11" fill="${color}">${band}</text>
  <rect x="12" y="39" width="196" height="4" rx="2" fill="rgba(255,255,255,0.08)"/>
  <rect x="12" y="39" width="${barWidth}" height="4" rx="2" fill="${color}" opacity="0.7"/>
</svg>`;
}

/**
 * Main export: render a badge SVG for the given entity score data.
 *
 * @param slug      Entity slug (e.g. "apple-inc")
 * @param composite Composite score 0–100
 * @param band      Band label (e.g. "Functional")
 * @param style     "compact" (default) or "detailed"
 */
export function renderBadge(
  slug: string,
  composite: number,
  band: string,
  style: BadgeStyle = "compact",
): string {
  if (style === "detailed") return renderDetailed(slug, composite, band);
  return renderCompact(slug, composite, band);
}
