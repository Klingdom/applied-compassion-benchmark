/**
 * GroupMeanBars — S3.4
 *
 * Server component: build-time horizontal ranked bar chart showing mean
 * composite score per cohort group (sector, region, category, etc.).
 *
 * Accepts a rankings array and a groupKey specifying which field to group by.
 * Computes group means at render time (no external data sources).
 *
 * Bars are sorted descending by mean, colored by the group mean's band,
 * with a faint vertical reference line at the index mean.
 *
 * Graceful when groupKey is absent from the data (renders null).
 *
 * Accessibility: role="img" + aria-label enumerating each group mean.
 * Wrapped in a <details> on the caller side for Wave E1 density compliance.
 *
 * Usage:
 *   <GroupMeanBars
 *     rankings={data.rankings}
 *     groupKey="sector"
 *     groupLabel="Sector"
 *     indexMean={data.meta.meanScore}
 *     indexName="Fortune 500"
 *   />
 */

import { getBandByName } from "./chartTokens";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RankingEntry {
  composite: number;
  [key: string]: unknown;
}

interface GroupMeanBarsProps {
  /** All entity rankings from the index JSON. */
  rankings: RankingEntry[];
  /**
   * The field name used to group entities (e.g. "sector", "region", "category").
   * Graceful when absent — renders null.
   */
  groupKey: string;
  /** Human-readable label for the group axis (e.g. "Sector", "Region"). */
  groupLabel?: string;
  /** The index-level mean composite (for the reference line). */
  indexMean?: number;
  /** Index name — used in the aria-label. */
  indexName?: string;
}

// ─── SVG layout constants ─────────────────────────────────────────────────────

const VB_W = 600;
const ROW_H = 22;
const ROW_GAP = 5;
const LABEL_W = 140;
const BAR_AREA_W = VB_W - LABEL_W - 60; // leave room for value label
const BAR_H = 14;
const PAD_Y = 4;
const MAX_COMPOSITE = 100;

// ─── Data helpers ─────────────────────────────────────────────────────────────

interface GroupStats {
  label: string;
  mean: number;
  count: number;
}

function computeGroupMeans(
  rankings: RankingEntry[],
  groupKey: string,
): GroupStats[] {
  const acc: Record<string, { sum: number; count: number }> = {};
  for (const r of rankings) {
    const groupVal = r[groupKey];
    if (!groupVal || typeof groupVal !== "string") continue;
    if (!acc[groupVal]) acc[groupVal] = { sum: 0, count: 0 };
    acc[groupVal].sum += r.composite;
    acc[groupVal].count++;
  }
  return Object.entries(acc)
    .map(([label, { sum, count }]) => ({
      label,
      mean: Math.round((sum / count) * 10) / 10,
      count,
    }))
    .sort((a, b) => b.mean - a.mean);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function GroupMeanBars({
  rankings,
  groupKey,
  groupLabel = "Group",
  indexMean,
  indexName = "Index",
}: GroupMeanBarsProps) {
  // Check that at least one entry has the groupKey
  const hasGroupField = rankings.some(
    (r) => r[groupKey] !== undefined && r[groupKey] !== null && r[groupKey] !== "",
  );
  if (!hasGroupField) return null;

  const groups = computeGroupMeans(rankings, groupKey);
  if (groups.length === 0) return null;

  const rowCount = groups.length;
  const svgH = rowCount * (ROW_H + ROW_GAP) + PAD_Y * 2;

  // Aria label
  const ariaLabel = [
    `Mean composite by ${groupLabel} for ${indexName}:`,
    groups.map((g) => `${g.label}: ${g.mean.toFixed(1)} (n=${g.count})`).join(", "),
    indexMean !== undefined ? `; Index mean: ${indexMean.toFixed(1)}.` : ".",
  ].join(" ");

  // Reference line x position
  const refX = indexMean !== undefined
    ? LABEL_W + (indexMean / MAX_COMPOSITE) * BAR_AREA_W
    : null;

  return (
    <svg
      role="img"
      aria-label={ariaLabel}
      viewBox={`0 0 ${VB_W} ${svgH}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", width: "100%", height: "auto" }}
    >
      <title>
        Mean {groupLabel} composite — {indexName}
      </title>

      {/* Reference line at index mean */}
      {refX !== null && (
        <line
          x1={refX}
          y1={0}
          x2={refX}
          y2={svgH}
          stroke="rgba(184,198,222,0.25)"
          strokeWidth={1}
          strokeDasharray="3 3"
        />
      )}

      {groups.map((g, i) => {
        const rowY = PAD_Y + i * (ROW_H + ROW_GAP);
        const barY = rowY + (ROW_H - BAR_H) / 2;
        const barW = (g.mean / MAX_COMPOSITE) * BAR_AREA_W;
        const bandToken = getBandByName(
          g.mean <= 20 ? "Critical" :
          g.mean <= 40 ? "Developing" :
          g.mean <= 60 ? "Functional" :
          g.mean <= 80 ? "Established" : "Exemplary"
        );
        const color = bandToken.color;

        return (
          <g key={g.label}>
            {/* Group label */}
            <text
              x={LABEL_W - 6}
              y={rowY + ROW_H / 2 + 4}
              textAnchor="end"
              fill="rgba(184,198,222,0.75)"
              fontSize="9.5"
              fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
            >
              {g.label.length > 18 ? g.label.slice(0, 17) + "…" : g.label}
            </text>

            {/* Bar track */}
            <rect
              x={LABEL_W}
              y={barY}
              width={BAR_AREA_W}
              height={BAR_H}
              fill="rgba(255,255,255,0.04)"
              rx={3}
            />

            {/* Mean bar */}
            {barW > 0 && (
              <rect
                x={LABEL_W}
                y={barY}
                width={barW}
                height={BAR_H}
                fill={color}
                opacity={0.8}
                rx={3}
              />
            )}

            {/* Value label */}
            <text
              x={LABEL_W + BAR_AREA_W + 6}
              y={rowY + ROW_H / 2 + 4}
              textAnchor="start"
              fill={color}
              fontSize="9.5"
              fontWeight="700"
              fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
            >
              {g.mean.toFixed(1)}
            </text>

            {/* Entity count — muted, after value */}
            <text
              x={LABEL_W + BAR_AREA_W + 34}
              y={rowY + ROW_H / 2 + 4}
              textAnchor="start"
              fill="rgba(148,163,184,0.4)"
              fontSize="8"
              fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
            >
              n={g.count}
            </text>
          </g>
        );
      })}

      {/* Index mean label */}
      {refX !== null && indexMean !== undefined && (
        <text
          x={refX + 3}
          y={PAD_Y + 8}
          fill="rgba(184,198,222,0.4)"
          fontSize="7.5"
          fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        >
          mean {indexMean.toFixed(1)}
        </text>
      )}
    </svg>
  );
}
