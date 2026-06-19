/**
 * ForwardTriggerCountdown — Wave C, Item #2 (in-briefing component)
 *
 * Renders briefing.forwardTriggers[] as a scannable list of upcoming scoring
 * triggers with days-until countdown, entity link, and evidence trigger condition.
 *
 * Color-coded by proximity:
 *   ≤7 days  → urgent  (band-red / #f87171)
 *   ≤30 days → soon    (band-orange / #fb923c)
 *   else     → neutral (#94a3b8)
 *   TBD      → neutral
 *
 * Renders nothing when forwardTriggers is empty or absent.
 * Section id="forward-watch" so BriefingJumpNav can link to it.
 */

import Link from "next/link";
import Container from "@/components/ui/Container";
import { entityHref } from "@/lib/entityHref";
import { getEntityBySlug } from "@/data/entities";
import type { EntityKind } from "@/data/entities";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ForwardTrigger {
  date: string;        // ISO date or "TBD"
  entity: string;      // display name
  slug?: string;       // entity slug for linking
  trigger: string;     // one-line trigger condition
  priority: "critical" | "high" | "medium" | "low" | string;
}

interface Props {
  triggers: ForwardTrigger[];
  /** Briefing date (YYYY-MM-DD) — used to compute days-until. */
  briefingDate: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Parse YYYY-MM-DD to UTC midnight Date, returns null for non-date strings. */
function parseDate(s: string): Date | null {
  if (!s || s.toUpperCase() === "TBD") return null;
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
}

/** Days from briefing date to trigger date. Negative = elapsed. */
function daysUntil(triggerDate: Date, briefingDate: Date): number {
  return Math.round((triggerDate.getTime() - briefingDate.getTime()) / 86_400_000);
}

/** Color token based on proximity. */
function proximityColor(days: number | null): string {
  if (days === null) return "#94a3b8";       // TBD — neutral
  if (days <= 7)  return "#f87171";           // urgent — band-red
  if (days <= 30) return "#fb923c";           // soon — band-orange
  return "#94a3b8";                           // neutral
}

/** Human-readable days label. */
function daysLabel(days: number | null, triggerDateStr: string): string {
  if (days === null) return "TBD";
  if (days === 0) return "today";
  if (days < 0) return `${Math.abs(days)}d elapsed`;
  if (days === 1) return "1 day";
  return `${days} days`;
}

/** Priority badge label */
function priorityLabel(priority: string): string {
  return priority.toUpperCase();
}

/** Priority badge color */
function priorityColor(priority: string): string {
  switch (priority.toLowerCase()) {
    case "critical": return "#f87171";
    case "high": return "#fb923c";
    case "medium": return "#fcd34d";
    default: return "#94a3b8";
  }
}

// Slug → entity kind resolution for linking
const SLUG_LOOKUP_KINDS: EntityKind[] = [
  "ai-lab",
  "company",
  "robotics-lab",
  "country",
  "city",
  "us-city",
  "us-state",
];

function resolveEntityHref(slug: string): string | null {
  for (const kind of SLUG_LOOKUP_KINDS) {
    if (getEntityBySlug(kind, slug)) {
      return entityHref(kind === "ai-lab" ? "ai-labs"
        : kind === "company" ? "fortune-500"
        : kind === "robotics-lab" ? "robotics-labs"
        : kind === "country" ? "countries"
        : kind === "city" ? "global-cities"
        : kind === "us-city" ? "us-cities"
        : "us-states", slug);
    }
  }
  return null;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ForwardTriggerCountdown({ triggers, briefingDate }: Props) {
  if (!Array.isArray(triggers) || triggers.length === 0) return null;

  const briefingDateObj = parseDate(briefingDate) ?? new Date();

  // Sort: upcoming first (ascending), then TBD, then elapsed
  const sorted = [...triggers].sort((a, b) => {
    const da = parseDate(a.date);
    const db = parseDate(b.date);
    if (da === null && db === null) return 0;
    if (da === null) return 1;
    if (db === null) return -1;
    return da.getTime() - db.getTime();
  });

  return (
    <section
      id="forward-watch"
      className="py-[30px] scroll-mt-24"
      aria-label="Forward watch — upcoming scoring triggers"
    >
      <Container>
        {/* Section header */}
        <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
          <div className="flex items-center gap-2.5">
            <span className="text-[0.7rem] font-bold uppercase tracking-[0.18em] px-2 py-0.5 rounded border border-[rgba(252,211,77,0.35)] bg-[rgba(252,211,77,0.08)] text-[#fcd34d]">
              Forward watch
            </span>
            <span className="text-muted text-[0.8rem]">
              {sorted.length} upcoming trigger{sorted.length !== 1 ? "s" : ""}
            </span>
          </div>
          <Link
            href="/updates/forward-watch"
            className="inline-flex items-center gap-1.5 text-[0.82rem] text-[#7dd3fc] hover:text-text transition-colors font-medium"
          >
            See all forward watches
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2.5 6h7M6.5 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        {/* #19 — Proximity timeline: today→+90d with dots colored by proximity */}
        {(() => {
          const WINDOW = 90; // days shown on axis
          const SVG_W = 480;
          const SVG_H = 32;
          const LEFT_PAD = 8;
          const RIGHT_PAD = 8;
          const AXIS_W = SVG_W - LEFT_PAD - RIGHT_PAD;
          const AXIS_Y = 22;
          const DOT_R = 5;

          // Only show triggers that fall within the 90-day window
          const dotsData = sorted
            .map((t) => {
              const td = parseDate(t.date);
              if (!td) return null;
              const days = daysUntil(td, briefingDateObj);
              if (days < 0 || days > WINDOW) return null;
              const x = LEFT_PAD + Math.round((days / WINDOW) * AXIS_W);
              return { x, days, color: proximityColor(days), entity: t.entity };
            })
            .filter((d): d is NonNullable<typeof d> => d !== null);

          if (dotsData.length === 0) return null;

          const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

          return (
            <div className="mb-5" aria-hidden="true">
              <div className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-muted mb-1">
                Next 90 days
              </div>
              <div className="overflow-x-auto">
                <svg
                  viewBox={`0 0 ${SVG_W} ${SVG_H}`}
                  width={SVG_W}
                  height={SVG_H}
                  style={{ display: "block", minWidth: SVG_W, maxWidth: "100%" }}
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Axis line */}
                  <line
                    x1={LEFT_PAD} y1={AXIS_Y}
                    x2={SVG_W - RIGHT_PAD} y2={AXIS_Y}
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="1"
                  />
                  {/* "Today" label */}
                  <text x={LEFT_PAD} y={AXIS_Y - 4} fontSize="7" fill="rgba(148,163,184,0.5)" fontFamily={FONT}>
                    Today
                  </text>
                  {/* "+90d" label */}
                  <text x={SVG_W - RIGHT_PAD} y={AXIS_Y - 4} fontSize="7" fill="rgba(148,163,184,0.5)" textAnchor="end" fontFamily={FONT}>
                    +90d
                  </text>
                  {/* Trigger dots */}
                  {dotsData.map((dot, i) => (
                    <circle
                      key={i}
                      cx={dot.x}
                      cy={AXIS_Y}
                      r={DOT_R}
                      fill={dot.color}
                      opacity="0.85"
                    />
                  ))}
                </svg>
              </div>
            </div>
          );
        })()}

        {/* Trigger list */}
        <ul className="flex flex-col divide-y divide-line" role="list">
          {sorted.map((t, i) => {
            const triggerDate = parseDate(t.date);
            const days = triggerDate ? daysUntil(triggerDate, briefingDateObj) : null;
            const color = proximityColor(days);
            const entityHrefStr = t.slug ? resolveEntityHref(t.slug) : null;

            return (
              <li
                key={`${t.entity}-${t.date}-${i}`}
                className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 py-3.5"
              >
                {/* Days badge */}
                <div
                  className="shrink-0 w-[72px] text-center px-2 py-1 rounded-[8px] border text-[0.78rem] font-bold tabular-nums"
                  style={{
                    color,
                    borderColor: `${color}44`,
                    background: `${color}10`,
                  }}
                  aria-label={`${daysLabel(days, t.date)} until trigger`}
                >
                  {daysLabel(days, t.date)}
                </div>

                {/* Entity + trigger */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 mb-1">
                    {/* Entity name — linked if slug resolves */}
                    {entityHrefStr ? (
                      <Link
                        href={entityHrefStr}
                        className="text-[0.9rem] font-semibold text-text hover:text-[#7dd3fc] transition-colors"
                      >
                        {t.entity}
                      </Link>
                    ) : (
                      <span className="text-[0.9rem] font-semibold text-text">
                        {t.entity}
                      </span>
                    )}

                    {/* Priority badge */}
                    <span
                      className="text-[0.65rem] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border"
                      style={{
                        color: priorityColor(t.priority),
                        borderColor: `${priorityColor(t.priority)}44`,
                        background: `${priorityColor(t.priority)}10`,
                      }}
                    >
                      {priorityLabel(t.priority)}
                    </span>

                    {/* Date */}
                    {t.date && t.date.toUpperCase() !== "TBD" && (
                      <span className="text-[0.75rem] text-muted tabular-nums">
                        {t.date}
                      </span>
                    )}
                  </div>

                  {/* Trigger condition — truncate to 200 chars for scan-friendliness */}
                  <p className="text-[0.85rem] text-muted leading-snug">
                    {t.trigger.length > 200
                      ? t.trigger.slice(0, 197) + "…"
                      : t.trigger}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
