/**
 * BandPositionStrip — Wave H1, Item #2 (stub for future integration)
 *
 * A 0–100 track segmented into the five band zones, with an entity-marker dot.
 * Answers "is 18.4 bad — compared to what?" for daily briefing score cards.
 *
 * Extended in Wave E1 to accept an optional `medianScore` (renders a faint
 * second marker/tick) and to compute a "X pts to <next band>" hint.
 *
 * D-61 (Loop 1, dataviz item 1): the SVG draws only the track, band zones and
 * markers. All text (score, median, pts-to-next-band) is HTML beneath the strip
 * so it never scales below 12px. The aria-label is unchanged.
 *
 * Props:
 *   score        — entity's composite score (0–100)
 *   entityName   — displayed in the accessible label
 *   compact      — if true, renders at reduced height (for inline use)
 *   medianScore  — (optional) field median; renders a faint comparison tick
 *
 * No client JS, no deps. Hand-rolled SVG following ScoreSparkline pattern.
 */

import { CHART_BANDS, getBand as getBandToken } from "./chartTokens";

// ─── Band config — sourced from chartTokens (single source of truth) ─────────

const BANDS = CHART_BANDS;

function getBand(score: number) {
  return getBandToken(score);
}

/** Distance to the next band boundary above the entity's score, in pts. */
function ptsToNextBand(score: number): { pts: number; nextBand: string } | null {
  const band = getBand(score);
  const idx = BANDS.findIndex(b => b.key === band.key);
  if (idx < 0 || idx === BANDS.length - 1) return null; // already Exemplary
  const next = BANDS[idx + 1];
  const pts = next.min - score;
  return { pts: Math.round(pts * 10) / 10, nextBand: next.key };
}

// ─── SVG dimensions ───────────────────────────────────────────────────────────

const W = 300;
// Compact mode is drawn at 0.6x, so its geometry is taller in viewBox units to
// keep the rendered track and marker legible.
const GEOM = {
  regular: { track: 10, markerR: 5, medianR: 3 },
  compact: { track: 16, markerR: 8, medianR: 4.5 },
};

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  score: number;
  entityName?: string;
  compact?: boolean;
  /** Optional field median score. Renders a faint comparison tick + label. */
  medianScore?: number;
}

export default function BandPositionStrip({ score, entityName, compact = false, medianScore }: Props) {
  if (score < 0 || score > 100) return null;

  const g = compact ? GEOM.compact : GEOM.regular;
  const TRACK_H = g.track;
  const band = getBand(score);
  const markerX = (score / 100) * W;
  const markerY = TRACK_H / 2;
  const hint = ptsToNextBand(score);

  // Median marker (only when within 0–100)
  const hasMedian = medianScore !== undefined && medianScore !== null
    && medianScore >= 0 && medianScore <= 100;
  const medianX = hasMedian ? (medianScore! / 100) * W : 0;
  const medianBand = hasMedian ? getBand(medianScore!) : null;

  const ariaLabel = [
    `${entityName ?? "Entity"} score: ${score.toFixed(1)} — in the ${band.key} band (${band.min}–${band.max}).`,
    hasMedian ? `Field median: ${medianScore!.toFixed(1)} (${medianBand!.key}).` : "",
    hint ? `${hint.pts} points to the ${hint.nextBand} band.` : "Already in the top band.",
  ].filter(Boolean).join(" ");

  const scaleW = compact ? 180 : W;
  const scaleH = Math.round(TRACK_H * (scaleW / W) * 10) / 10;

  return (
    <div className="max-w-full">
      <svg
        role="img"
        aria-label={ariaLabel}
        viewBox={`0 0 ${W} ${TRACK_H}`}
        width={scaleW}
        height={scaleH}
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block", overflow: "visible" }}
      >
        <title>{ariaLabel}</title>

        {/* Band zone segments (0.45 so the five zones read against the dark panel) */}
        {BANDS.map((b) => {
          const x = (b.min / 100) * W;
          const w = ((b.max - b.min) / 100) * W;
          const isFirst = b.key === "Critical";
          const isLast = b.key === "Exemplary";
          return (
            <rect
              key={b.key}
              x={x}
              y={0}
              width={w}
              height={TRACK_H}
              fill={b.color}
              opacity="0.45"
              rx={isFirst || isLast ? 4 : 0}
              ry={isFirst || isLast ? 4 : 0}
            />
          );
        })}

        {/* Boundary tick marks at the band edges */}
        {BANDS.slice(1).map((b) => {
          const x = (b.min / 100) * W;
          return (
            <line
              key={b.key}
              x1={x}
              y1={0}
              x2={x}
              y2={TRACK_H}
              stroke="rgba(255,255,255,0.6)"
              strokeWidth="1"
            />
          );
        })}

        {/* Median marker — faint dashed tick (rendered before entity marker so entity is on top) */}
        {hasMedian && (
          <>
            <line
              x1={medianX}
              y1={0}
              x2={medianX}
              y2={TRACK_H}
              stroke="rgba(184,198,222,0.8)"
              strokeWidth="1.5"
              strokeDasharray="2 2"
            />
            <circle
              cx={medianX}
              cy={markerY}
              r={g.medianR}
              fill="rgba(184,198,222,0.6)"
              stroke="#0b1220"
              strokeWidth="1"
            />
          </>
        )}

        {/* Entity marker */}
        <circle
          cx={markerX}
          cy={markerY}
          r={g.markerR}
          fill={band.color}
          stroke="#0b1220"
          strokeWidth="1.5"
        />
      </svg>

      {/* Text lives in HTML so it stays at or above the 12px floor */}
      <p
        className={`mt-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-0.5 tabular-nums text-muted ${
          compact ? "text-[0.75rem]" : "text-[0.8125rem]"
        }`}
        aria-hidden="true"
      >
        <span className="font-bold" style={{ color: band.color }}>{score.toFixed(1)}</span>
        {hasMedian && <span>median {medianScore!.toFixed(1)}</span>}
        {hint && (
          <span>
            {hint.pts > 0 ? `${hint.pts} pts to ${hint.nextBand}` : `At ${hint.nextBand} threshold`}
          </span>
        )}
      </p>
    </div>
  );
}
