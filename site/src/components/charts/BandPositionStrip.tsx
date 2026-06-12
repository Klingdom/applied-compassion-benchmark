/**
 * BandPositionStrip — Wave H1, Item #2 (stub for future integration)
 *
 * A 0–100 track segmented into the five band zones, with an entity-marker dot.
 * Answers "is 18.4 bad — compared to what?" for daily briefing score cards.
 *
 * Extended in Wave E1 to accept an optional `medianScore` (renders a faint
 * second marker/tick + tiny "median" label) and to compute a
 * "X pts to <next band>" hint displayed below the track.
 *
 * Props:
 *   score        — entity's composite score (0–100)
 *   entityName   — displayed in the accessible label
 *   compact      — if true, renders at reduced height (for inline use)
 *   medianScore  — (optional) field median; renders a faint comparison tick
 *
 * No client JS, no deps. Hand-rolled SVG following ScoreSparkline pattern.
 */

// ─── Band config (matches globals.css tokens) ─────────────────────────────────

const BANDS = [
  { key: "Critical",    min: 0,  max: 20,  color: "#f87171", label: "Critical"    },
  { key: "Developing",  min: 20, max: 40,  color: "#fb923c", label: "Developing"  },
  { key: "Functional",  min: 40, max: 60,  color: "#fcd34d", label: "Functional"  },
  { key: "Established", min: 60, max: 80,  color: "#86efac", label: "Established" },
  { key: "Exemplary",   min: 80, max: 100, color: "#7dd3fc", label: "Exemplary"   },
] as const;

function getBand(score: number) {
  return BANDS.find(b => score >= b.min && score <= b.max) ?? BANDS[0];
}

/** Distance to the next band boundary above the entity's score, in pts. */
function ptsToNextBand(score: number): { pts: number; nextBand: string } | null {
  const band = getBand(score);
  const idx = BANDS.findIndex(b => b.key === band.key);
  if (idx < 0 || idx === BANDS.length - 1) return null; // already Exemplary
  const next = BANDS[idx + 1];
  const pts = next.min - score;
  return { pts: Math.round(pts * 10) / 10, nextBand: next.label };
}

// ─── SVG dimensions ───────────────────────────────────────────────────────────

const W = 300;
const TRACK_H = 10;
const MARKER_R = 5;
const LABEL_Y = TRACK_H + MARKER_R + 12;
// extra row for the "X pts to next band" hint
const HINT_Y = LABEL_Y + 16;
const SVG_H = HINT_Y + 10;

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
    `${entityName ?? "Entity"} score: ${score.toFixed(1)} — in the ${band.label} band (${band.min}–${band.max}).`,
    hasMedian ? `Field median: ${medianScore!.toFixed(1)} (${medianBand!.label}).` : "",
    hint ? `${hint.pts} points to the ${hint.nextBand} band.` : "Already in the top band.",
  ].filter(Boolean).join(" ");

  const scaleW = compact ? 180 : W;
  const scaleH = compact ? Math.round(SVG_H * 0.75) : SVG_H;

  return (
    <svg
      role="img"
      aria-label={ariaLabel}
      viewBox={`0 0 ${W} ${SVG_H}`}
      width={scaleW}
      height={scaleH}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", overflow: "visible" }}
    >
      <title>{ariaLabel}</title>

      {/* Band zone segments */}
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
            opacity="0.25"
            rx={isFirst || isLast ? 4 : 0}
            ry={isFirst || isLast ? 4 : 0}
          />
        );
      })}

      {/* Boundary tick marks at 20/40/60/80 */}
      {[20, 40, 60, 80].map((tick) => {
        const x = (tick / 100) * W;
        return (
          <line
            key={tick}
            x1={x}
            y1={0}
            x2={x}
            y2={TRACK_H}
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="1"
          />
        );
      })}

      {/* Median marker — faint tick + label (rendered before entity marker so entity is on top) */}
      {hasMedian && (
        <>
          <line
            x1={medianX}
            y1={0}
            x2={medianX}
            y2={TRACK_H}
            stroke="rgba(184,198,222,0.55)"
            strokeWidth="1.5"
            strokeDasharray="2 2"
          />
          <circle
            cx={medianX}
            cy={markerY}
            r={3}
            fill="rgba(184,198,222,0.45)"
            stroke="#0b1220"
            strokeWidth="1"
          />
          <text
            x={Math.min(Math.max(medianX, 20), W - 20)}
            y={LABEL_Y + 10}
            textAnchor="middle"
            fill="rgba(184,198,222,0.5)"
            fontSize="7.5"
            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          >
            median {medianScore!.toFixed(1)}
          </text>
        </>
      )}

      {/* Entity marker */}
      <circle
        cx={markerX}
        cy={markerY}
        r={MARKER_R}
        fill={band.color}
        stroke="#0b1220"
        strokeWidth="1.5"
      />

      {/* Score label below marker */}
      <text
        x={Math.min(Math.max(markerX, 12), W - 12)}
        y={TRACK_H + 11}
        textAnchor="middle"
        fill={band.color}
        fontSize="9.5"
        fontWeight="700"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      >
        {score.toFixed(1)}
      </text>

      {/* "X pts to next band" hint — centred, muted */}
      {hint && (
        <text
          x={W / 2}
          y={HINT_Y + 8}
          textAnchor="middle"
          fill="rgba(184,198,222,0.45)"
          fontSize="7.5"
          fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        >
          {hint.pts > 0 ? `${hint.pts} pts to ${hint.nextBand}` : `At ${hint.nextBand} threshold`}
        </text>
      )}
    </svg>
  );
}
