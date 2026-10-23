/**
 * BandDistributionBar — Wave H1, Item #2
 *
 * Server component: renders a horizontal stacked-bar SVG segmented by the
 * five compassion bands (Critical / Developing / Functional / Established /
 * Exemplary). The legend (band, range, count, %) is an HTML row (D-61) so it
 * reflows and never shrinks with the SVG.
 *
 * Props:
 *   index  — "all" (aggregate across all indexes) | individual index slug |
 *             undefined (defaults to "all").
 *   counts — explicit { Critical, Developing, Functional, Established, Exemplary }
 *             override; skips any file loading.
 *
 * Data: computed at build time from site/src/data/indexes/*.json rankings[].band.
 * No client JS, no charting dependency — hand-rolled inline SVG following the
 * ScoreSparkline pattern.
 *
 * Accessibility: role="img" + <title> + aria-label summarizing the distribution.
 * Caption: "Source: Compassion Benchmark · CC-BY"
 */

import countriesData from "@/data/indexes/countries.json";
import fortune500Data from "@/data/indexes/fortune-500.json";
import globalCitiesData from "@/data/indexes/global-cities.json";
import aiLabsData from "@/data/indexes/ai-labs.json";
import roboticsLabsData from "@/data/indexes/robotics-labs.json";
import usStatesData from "@/data/indexes/us-states.json";
import usCitiesData from "@/data/indexes/us-cities.json";
import universitiesData from "@/data/indexes/universities.json";
import { INDEX_REGISTRY } from "@/data/indexRegistry";
import { CHART_BANDS, CC_BY_CAPTION } from "./chartTokens";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BandCounts {
  Critical: number;
  Developing: number;
  Functional: number;
  Established: number;
  Exemplary: number;
}

// ─── Band config — sourced from chartTokens (single source of truth) ─────────

const BANDS = CHART_BANDS;

// ─── Index slug map ───────────────────────────────────────────────────────────

/**
 * Raw ranking-array lookup keyed by indexSlug. Iterating INDEX_REGISTRY
 * (rather than a hand-typed key list) means a future index missing from
 * this map throws immediately instead of silently being excluded from the
 * "all" aggregate — the same drift class that broke entity search.
 */
const RANKINGS_BY_SLUG: Record<string, Array<{ band?: string }>> = {
  "countries":       (countriesData as { rankings: Array<{ band?: string }> }).rankings,
  "fortune-500":     (fortune500Data as { rankings: Array<{ band?: string }> }).rankings,
  "global-cities":   (globalCitiesData as { rankings: Array<{ band?: string }> }).rankings,
  "ai-labs":         (aiLabsData as { rankings: Array<{ band?: string }> }).rankings,
  "robotics-labs":   (roboticsLabsData as { rankings: Array<{ band?: string }> }).rankings,
  "us-states":       (usStatesData as { rankings: Array<{ band?: string }> }).rankings,
  "us-cities":       (usCitiesData as { rankings: Array<{ band?: string }> }).rankings,
  "universities":    (universitiesData as { rankings: Array<{ band?: string }> }).rankings,
};

const INDEX_DATA: Record<string, { rankings: Array<{ band?: string }> }> = Object.fromEntries(
  INDEX_REGISTRY.map((entry) => {
    const rankings = RANKINGS_BY_SLUG[entry.indexSlug];
    if (!rankings) {
      throw new Error(`BandDistributionBar: no ranking data registered for index "${entry.indexSlug}"`);
    }
    return [entry.indexSlug, { rankings }];
  }),
);

// ─── Data helpers ─────────────────────────────────────────────────────────────

function countsFromRankings(rankings: Array<{ band?: string }>): BandCounts {
  const c: BandCounts = { Critical: 0, Developing: 0, Functional: 0, Established: 0, Exemplary: 0 };
  for (const r of rankings) {
    const band = r.band ? (r.band.charAt(0).toUpperCase() + r.band.slice(1)) as keyof BandCounts : null;
    if (band && band in c) c[band]++;
  }
  return c;
}

function computeCounts(index?: string, counts?: BandCounts): BandCounts {
  if (counts) return counts;

  if (!index || index === "all") {
    // Aggregate across all indexes
    const all: BandCounts = { Critical: 0, Developing: 0, Functional: 0, Established: 0, Exemplary: 0 };
    for (const data of Object.values(INDEX_DATA)) {
      const c = countsFromRankings(data.rankings);
      for (const k of Object.keys(c) as (keyof BandCounts)[]) {
        all[k] += c[k];
      }
    }
    return all;
  }

  const data = INDEX_DATA[index];
  if (!data) return { Critical: 0, Developing: 0, Functional: 0, Established: 0, Exemplary: 0 };
  return countsFromRankings(data.rankings);
}

// ─── SVG dimensions ───────────────────────────────────────────────────────────

const BAR_W = 600;
const BAR_H = 36;
const BAR_H_COMPACT = 16;

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  /** Index slug or "all". Defaults to "all". */
  index?: string;
  /** Explicit counts override — skips file loading. */
  counts?: BandCounts;
  /** Optional caption override shown under the bar. */
  caption?: string;
  /** Width in px for the rendered SVG. Defaults to full width via CSS. */
  width?: number;
  /**
   * Wave E1 — highlight a specific band with a "you are here" caret marker.
   * Rendered as a small triangle below the segment. Case-insensitive.
   */
  highlightBand?: string;
  /**
   * Wave E1 — compact mode for index cards: thinner bar, no legend row,
   * no caption. Keeps existing callers unchanged (default: false).
   */
  compact?: boolean;
}

export default function BandDistributionBar({ index = "all", counts, caption, highlightBand, compact = false }: Props) {
  let resolved: BandCounts;
  try {
    resolved = computeCounts(index, counts);
  } catch {
    return null; // graceful degradation
  }

  const total = Object.values(resolved).reduce((a, b) => a + b, 0);
  if (total === 0) return null;

  // Build segments with x offsets
  type Segment = {
    key: keyof BandCounts;
    range: string;
    color: string;
    textColor: string;
    count: number;
    pct: number;
    w: number;
    x: number;
  };

  const segments: Segment[] = [];
  let xCursor = 0;
  for (const band of BANDS) {
    const count = resolved[band.key];
    const pct = count / total;
    const w = pct * BAR_W;
    segments.push({ ...band, count, pct, w, x: xCursor });
    xCursor += w;
  }

  // "You are here" caret — find the matching segment (computed before aria label)
  const normalizedHighlight = highlightBand
    ? highlightBand.charAt(0).toUpperCase() + highlightBand.slice(1).toLowerCase()
    : null;
  const highlightSeg = normalizedHighlight
    ? segments.find(s => s.key === normalizedHighlight)
    : null;

  // Accessible label
  const labelParts = segments.map(
    (s) => `${s.key} (${s.range}): ${s.count} (${Math.round(s.pct * 100)}%)`
  );
  const highlightNote = normalizedHighlight
    ? ` This entity is in the ${normalizedHighlight} band.`
    : "";
  const ariaLabel = `Band distribution across ${total.toLocaleString()} entities: ${labelParts.join(", ")}.${highlightNote}`;

  // Compact mode: thinner bar, no legend, no caption
  const barH = compact ? BAR_H_COMPACT : BAR_H;

  // SVG total height — bar plus a small row for the "you are here" caret
  const caretRowH = (!compact && highlightSeg) ? 14 : 0;
  const svgH = barH + caretRowH;

  return (
    <figure className="w-full" aria-label={ariaLabel}>
      <svg
        role="img"
        viewBox={`0 0 ${BAR_W} ${svgH}`}
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block", width: "100%", height: "auto" }}
        aria-label={ariaLabel}
      >
        {/* single string child: React renders a multi-child <title> empty on the server, causing hydration error #418 */}
        <title>{`Band distribution across ${total.toLocaleString()} entities`}</title>

        {/* Stacked horizontal bar */}
        {segments.map((s) => (
          <g key={s.key}>
            {s.w > 0 && (
              <rect
                x={s.x}
                y={0}
                width={s.w}
                height={barH}
                fill={s.color}
                rx={s.x === 0 ? 4 : 0}
                ry={s.x === 0 ? 4 : 0}
              />
            )}
            {/* Right side rounding for last non-zero segment */}
          </g>
        ))}

        {/* Right-side rounded cap on last segment */}
        {segments.filter(s => s.w > 0).slice(-1).map(s => (
          <rect
            key={`${s.key}-cap`}
            x={s.x + s.w - 4}
            y={0}
            width={4}
            height={barH}
            fill={s.color}
            rx={4}
            ry={4}
          />
        ))}

        {/* "You are here" caret below the highlighted segment (not compact).
            The words live in the HTML legend below so they stay at readable size. */}
        {!compact && highlightSeg && (() => {
          const cx = highlightSeg.x + highlightSeg.w / 2;
          const cy = barH + 2;
          const caretSize = 5;
          const triPoints = `${cx},${cy} ${cx - caretSize},${cy + caretSize * 1.5} ${cx + caretSize},${cy + caretSize * 1.5}`;
          return (
            <polygon
              points={triPoints}
              fill={highlightSeg.color}
              opacity="0.9"
            />
          );
        })()}
      </svg>

      {/* Legend (not compact): HTML so it reflows and stays >=12px. Band name + range,
          count and share are all printed, so meaning never rests on colour alone. */}
      {!compact && (
        <ul className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1.5 text-[0.8125rem] text-muted list-none p-0 m-0">
          {segments.map((s) => {
            const isHere = highlightSeg?.key === s.key;
            return (
              <li key={s.key} className="inline-flex items-baseline gap-1.5 tabular-nums">
                <span
                  className="inline-block w-2.5 h-2.5 rounded-sm shrink-0 self-center"
                  style={{ backgroundColor: s.color }}
                  aria-hidden="true"
                />
                <span>{s.key} {s.range}</span>
                <span className="text-text font-semibold">
                  {s.count.toLocaleString()} ({Math.round(s.pct * 100)}%)
                </span>
                {isHere && (
                  <span className="font-semibold" style={{ color: s.color }}>
                    · you are here
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* Caption — hidden in compact mode */}
      {!compact && (
        <figcaption className="text-[0.75rem] text-muted-subtle mt-1.5 text-right">
          {caption ?? CC_BY_CAPTION}
        </figcaption>
      )}
    </figure>
  );
}
