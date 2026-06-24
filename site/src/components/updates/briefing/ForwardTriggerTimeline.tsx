/**
 * ForwardTriggerTimeline — Daily briefing forward-watch visual (server component).
 *
 * Renders a horizontal time-axis SVG from the briefing date to the latest dated
 * trigger (capped at 90 days; compressed to 45 if all triggers are within 45 days).
 * Each trigger with a real ISO date is plotted as a colored dot + label.
 * Triggers with no date / "TBD" appear in a separate undated rail below the axis.
 *
 * Colors match SEVERITY_COLORS from briefing/utils (critical/high/medium/low).
 * No chart lib — hand-rolled SVG following BandPositionStrip pattern.
 *
 * Accessibility: role="img" + descriptive aria-label. Undated rail is plain HTML.
 * Guard: if 0 dated triggers, only the undated rail (or nothing) renders.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

interface ForwardTrigger {
  date: string;        // ISO YYYY-MM-DD or "TBD"
  entity: string;      // display name
  slug?: string;
  trigger: string;
  priority: "critical" | "high" | "medium" | "low" | string;
}

interface Props {
  triggers: ForwardTrigger[];
  /** Briefing date (YYYY-MM-DD) */
  briefingDate: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PRIORITY_COLORS: Record<string, string> = {
  critical: "#f87171",
  high:     "#fb923c",
  medium:   "#fcd34d",
  moderate: "#fcd34d", // alias
  low:      "#94a3b8",
};

const DEFAULT_COLOR = "#94a3b8";

const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

// SVG layout constants
const SVG_W        = 540;
const LEFT_PAD     = 32;  // room for "Today" label
const RIGHT_PAD    = 36;  // room for end-date label
const AXIS_Y       = 26;  // vertical centre of axis within SVG
const DOT_R        = 5;
const TICK_H       = 6;
const LABEL_OFFSET = 14;  // vertical gap from axis to label text
const SVG_H        = AXIS_Y + DOT_R + LABEL_OFFSET + 12; // enough room for labels

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseDate(s: string): Date | null {
  if (!s || s.toUpperCase() === "TBD") return null;
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
}

function daysUntil(triggerDate: Date, from: Date): number {
  return Math.round((triggerDate.getTime() - from.getTime()) / 86_400_000);
}

function priorityColor(priority: string): string {
  return PRIORITY_COLORS[priority?.toLowerCase()] ?? DEFAULT_COLOR;
}

/** Short label: "entity · in N days" */
function dotLabel(entity: string, days: number): string {
  if (days === 0) return `${entity} · today`;
  if (days === 1) return `${entity} · 1 day`;
  return `${entity} · ${days}d`;
}

/**
 * Format a UTC Date as "Jun 30" using UTC-safe locale string.
 * The day arg is a numeric UTC day-of-month.
 */
function fmtAxisDate(d: Date): string {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[d.getUTCMonth()]} ${d.getUTCDate()}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ForwardTriggerTimeline({ triggers, briefingDate }: Props) {
  if (!Array.isArray(triggers) || triggers.length === 0) return null;

  const briefingDateObj = parseDate(briefingDate) ?? new Date();

  // Split triggers into dated and undated
  const dated: Array<{ t: ForwardTrigger; days: number }> = [];
  const undated: ForwardTrigger[] = [];

  for (const t of triggers) {
    const td = parseDate(t.date);
    if (!td) {
      undated.push(t);
      continue;
    }
    const days = daysUntil(td, briefingDateObj);
    // Only plot future/today triggers (not elapsed)
    if (days >= 0) {
      dated.push({ t, days });
    } else {
      // elapsed dated trigger: treat as undated for clarity
      undated.push(t);
    }
  }

  if (dated.length === 0 && undated.length === 0) return null;

  // Determine axis window
  const MAX_WINDOW = 90;
  const maxDays = dated.length > 0 ? Math.max(...dated.map((d) => d.days)) : 0;
  const window = dated.length === 0 ? MAX_WINDOW
    : maxDays <= 45 ? 45
    : Math.min(maxDays + 5, MAX_WINDOW);

  // Clamp dots to window (items beyond window shown in undated rail instead)
  const inWindow = dated.filter((d) => d.days <= window);
  const beyondWindow = dated.filter((d) => d.days > window);
  // beyondWindow items are shown in undated rail too
  const undatedRail: ForwardTrigger[] = [
    ...undated,
    ...beyondWindow.map((d) => d.t),
  ];

  // Axis pixel helpers
  const AXIS_W = SVG_W - LEFT_PAD - RIGHT_PAD;
  function xPos(days: number): number {
    return LEFT_PAD + Math.round((days / window) * AXIS_W);
  }

  // Week ticks (every 7 days up to window)
  const weekTicks: number[] = [];
  for (let d = 7; d < window; d += 7) {
    weekTicks.push(d);
  }

  // Accessible summary string
  const ariaLabel = [
    `Forward-trigger timeline from ${briefingDate} over ${window} days.`,
    inWindow.length > 0
      ? `${inWindow.length} dated trigger${inWindow.length !== 1 ? "s" : ""}: ` +
        inWindow.map(({ t, days }) => `${t.entity} in ${days} day${days !== 1 ? "s" : ""} (${t.priority})`).join(", ") + "."
      : "",
    undatedRail.length > 0
      ? `${undatedRail.length} undated trigger${undatedRail.length !== 1 ? "s" : ""}: ` +
        undatedRail.map((t) => t.entity).join(", ") + "."
      : "",
  ].filter(Boolean).join(" ");

  // End-axis label
  const endDate = new Date(briefingDateObj.getTime() + window * 86_400_000);
  const endLabel = fmtAxisDate(endDate);

  return (
    <div className="mb-5">
      <div className="text-[0.63rem] font-bold uppercase tracking-[0.18em] text-muted mb-2">
        Trigger timeline — next {window} days
      </div>

      {/* SVG timeline (only when there are dated triggers in-window) */}
      {inWindow.length > 0 ? (
        <div className="overflow-x-auto rounded-[10px] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.01)] px-1 py-2">
          <svg
            role="img"
            aria-label={ariaLabel}
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            width={SVG_W}
            height={SVG_H}
            xmlns="http://www.w3.org/2000/svg"
            style={{ display: "block", minWidth: SVG_W, maxWidth: "100%" }}
          >
            <title>{ariaLabel}</title>

            {/* Axis line */}
            <line
              x1={LEFT_PAD} y1={AXIS_Y}
              x2={SVG_W - RIGHT_PAD} y2={AXIS_Y}
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="1"
            />

            {/* "Today" tick + label */}
            <line
              x1={LEFT_PAD} y1={AXIS_Y - TICK_H / 2}
              x2={LEFT_PAD} y2={AXIS_Y + TICK_H / 2}
              stroke="rgba(184,198,222,0.4)"
              strokeWidth="1"
            />
            <text
              x={LEFT_PAD}
              y={AXIS_Y - TICK_H - 3}
              textAnchor="middle"
              fill="rgba(148,163,184,0.6)"
              fontSize="7"
              fontFamily={FONT}
            >
              Today
            </text>

            {/* End-date tick + label */}
            <line
              x1={SVG_W - RIGHT_PAD} y1={AXIS_Y - TICK_H / 2}
              x2={SVG_W - RIGHT_PAD} y2={AXIS_Y + TICK_H / 2}
              stroke="rgba(184,198,222,0.4)"
              strokeWidth="1"
            />
            <text
              x={SVG_W - RIGHT_PAD}
              y={AXIS_Y - TICK_H - 3}
              textAnchor="end"
              fill="rgba(148,163,184,0.6)"
              fontSize="7"
              fontFamily={FONT}
            >
              {endLabel}
            </text>

            {/* Week tick marks */}
            {weekTicks.map((d) => {
              const x = xPos(d);
              return (
                <line
                  key={d}
                  x1={x} y1={AXIS_Y - TICK_H / 2}
                  x2={x} y2={AXIS_Y + TICK_H / 2}
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="1"
                />
              );
            })}

            {/* Dots + labels */}
            {inWindow.map(({ t, days }, i) => {
              const x = xPos(days);
              const color = priorityColor(t.priority);
              const label = dotLabel(t.entity, days);
              // Alternate label above/below to reduce overlap when dots cluster
              const labelAbove = i % 2 === 0;
              const labelY = labelAbove
                ? AXIS_Y - DOT_R - 5
                : AXIS_Y + DOT_R + LABEL_OFFSET;
              // Clamp label x so it stays within SVG
              const labelX = Math.min(Math.max(x, LEFT_PAD + 20), SVG_W - RIGHT_PAD - 20);

              return (
                <g key={`${t.entity}-${i}`}>
                  {/* Stem line from dot to label (only when offset) */}
                  {labelAbove ? (
                    <line
                      x1={x} y1={AXIS_Y - DOT_R - 1}
                      x2={x} y2={labelY + 1}
                      stroke={`${color}44`}
                      strokeWidth="1"
                    />
                  ) : (
                    <line
                      x1={x} y1={AXIS_Y + DOT_R + 1}
                      x2={x} y2={labelY - 1}
                      stroke={`${color}44`}
                      strokeWidth="1"
                    />
                  )}
                  {/* Dot */}
                  <circle
                    cx={x}
                    cy={AXIS_Y}
                    r={DOT_R}
                    fill={color}
                    opacity="0.88"
                    stroke="rgba(11,18,32,0.6)"
                    strokeWidth="1"
                  />
                  {/* Label */}
                  <text
                    x={labelX}
                    y={labelY}
                    textAnchor="middle"
                    fill={color}
                    opacity="0.85"
                    fontSize="7.5"
                    fontWeight="600"
                    fontFamily={FONT}
                  >
                    {label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      ) : (
        /* No in-window dated triggers — show a bare placeholder note */
        <p className="text-[0.8rem] text-muted">No triggers within the next {window} days.</p>
      )}

      {/* Undated / beyond-window rail */}
      {undatedRail.length > 0 && (
        <div className="mt-3">
          <div className="text-[0.6rem] font-bold uppercase tracking-[0.16em] text-muted mb-1.5">
            Undated triggers (TBD)
          </div>
          <ul className="flex flex-wrap gap-1.5" aria-label="Undated forward triggers">
            {undatedRail.map((t, i) => {
              const color = priorityColor(t.priority);
              return (
                <li
                  key={`undated-${t.entity}-${i}`}
                  className="inline-flex items-center gap-1 rounded-[6px] border px-2 py-0.5 text-[0.72rem] font-medium"
                  style={{
                    borderColor: `${color}44`,
                    background: `${color}0d`,
                    color,
                  }}
                  title={t.trigger}
                  aria-label={`${t.entity} — ${t.priority} priority, date TBD`}
                >
                  {t.entity}
                  <span className="opacity-60 text-[0.62rem] font-bold uppercase tracking-wide ml-0.5">
                    TBD
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
