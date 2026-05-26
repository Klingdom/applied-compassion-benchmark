/**
 * EntityEvidenceCard — Server component that surfaces the assessment record
 * on an entity detail page.
 *
 * Displays up to 3 recent Tier-A scored events, any qualifying methodology
 * rulings, an optional boundary-watch banner, and a footer link to the full
 * history page.
 *
 * Returns null when there is nothing to show (tierCounts.A === 0,
 * no methodology rulings, no active boundary watch) so zero-evidence entities
 * look identical to the pre-PR-2 baseline.
 *
 * Independence-policy rules (PRD §6.2, UX §7):
 *  - Section heading: "Assessment record" — never "Alerts" / "Risk" / "Warning"
 *  - Delta colors: band tokens only (green/orange) — no red alert tones
 *  - No Score-Watch CTA or commercial copy anywhere in this component
 */

import Link from "next/link";
import Container from "@/components/ui/Container";
import Panel from "@/components/ui/Panel";
import type { HistoryEvent, MethodologyRulingRef } from "@/types/entity-history";

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Format ISO date "2026-05-25" → "May 25, 2026" */
function formatShortDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return dateStr;
  }
}

/** Truncate a string to maxLen chars, appending "…" when truncated. */
function truncate(str: string, maxLen: number): string {
  if (!str) return "";
  return str.length > maxLen ? str.slice(0, maxLen - 1) + "…" : str;
}

/**
 * Extract just the hostname from a URL for use in aria-labels.
 * Falls back to the raw URL on parse failure.
 */
function urlDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function EventDeltaBadge({ delta }: { delta: number | null }) {
  if (delta === null || delta === undefined) return null;
  if (Math.abs(delta) < 0.01) {
    return (
      <span
        className="inline-flex items-center px-2 py-0.5 rounded text-[0.78rem] font-bold bg-[rgba(255,255,255,0.06)] text-muted border border-[rgba(255,255,255,0.1)]"
        aria-label="no score change"
      >
        ◆ Hold
      </span>
    );
  }
  const isPositive = delta > 0;
  const dirText = isPositive
    ? `up ${Math.abs(delta).toFixed(1)}`
    : `down ${Math.abs(delta).toFixed(1)}`;
  // Independence policy: green for upward, orange for downward — NO red alert tones
  const colorClass = isPositive
    ? "text-[#86efac] bg-[rgba(134,239,172,0.08)] border-[rgba(134,239,172,0.2)]"
    : "text-[#fb923c] bg-[rgba(251,146,60,0.08)] border-[rgba(251,146,60,0.2)]";
  const arrow = isPositive ? "▲" : "▼";
  return (
    <span
      className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[0.78rem] font-bold border ${colorClass}`}
      aria-label={dirText}
    >
      <span aria-hidden="true">{arrow}</span>
      {" "}{isPositive ? "+" : ""}{delta.toFixed(1)}
    </span>
  );
}

function RulingBadge({ rulingNumber }: { rulingNumber: number }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[0.72rem] font-bold border border-[rgba(125,211,252,0.25)] text-[#7dd3fc] bg-[rgba(125,211,252,0.08)] uppercase tracking-wide">
      Ruling #{rulingNumber}
    </span>
  );
}

// ── Props ───────────────────────────────────────────────────────────────────────

export interface EntityEvidenceCardProps {
  latestScoreChange: HistoryEvent | null;
  methodologyRulings: MethodologyRulingRef[];
  daysSinceLastChange: number | null;
  tierCounts: { A: number; B: number; C: number; D: number };
  totalEventCount: number;
  events: HistoryEvent[];
  historyHref: string;
  activeBoundaryWatch?: HistoryEvent | null;
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function EntityEvidenceCard({
  latestScoreChange,
  methodologyRulings,
  daysSinceLastChange,
  tierCounts,
  totalEventCount,
  events,
  historyHref,
  activeBoundaryWatch,
}: EntityEvidenceCardProps) {
  // ── Empty-state guard ──────────────────────────────────────────────────────
  // Card is not shown when there is no Tier-A scored evidence, no methodology
  // rulings, and no active boundary watch.
  if (tierCounts.A === 0 && methodologyRulings.length === 0 && !activeBoundaryWatch) {
    return null;
  }

  // ── Derive up to 3 most-recent Tier-A scored events ───────────────────────
  const tierAEvents = events
    .filter(
      (e) =>
        e.tier === "A" &&
        e.type === "scored" &&
        e.delta !== null &&
        Math.abs(e.delta) > 0.01,
    )
    // events[] is already newest-first from the JSON
    .slice(0, 3);

  // ── Filter methodology rulings to those with a qualifying Tier-A event ────
  // PR 2 filter requirement: only render a ruling if this entity has at least
  // one Tier-A scored event whose rulingRef.rulingNumber === ruling.rulingNumber.
  // Entities where the ruling appears only in a co-occurring topSignals entry
  // (but NOT in a Tier-A scored event for this entity) are excluded.
  const qualifyingRulings = methodologyRulings
    .filter((ruling) =>
      events.some(
        (e) =>
          e.tier === "A" &&
          e.type === "scored" &&
          e.rulingRef !== null &&
          e.rulingRef.rulingNumber === ruling.rulingNumber,
      ),
    )
    .slice(0, 3);

  const hasMoreRulings = methodologyRulings.filter((ruling) =>
    events.some(
      (e) =>
        e.tier === "A" &&
        e.type === "scored" &&
        e.rulingRef !== null &&
        e.rulingRef.rulingNumber === ruling.rulingNumber,
    ),
  ).length > 3;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <section
      className="py-8 border-b border-line bg-[rgba(255,255,255,0.02)]"
      aria-labelledby="entity-evidence-heading"
    >
      <Container>
        <Panel>
          {/* ── Section heading ─────────────────────────────────────────── */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h2
              id="entity-evidence-heading"
              className="text-[0.78rem] uppercase tracking-[0.12em] text-[#7dd3fc] font-semibold"
            >
              Assessment record
            </h2>
            {daysSinceLastChange !== null && (
              <span className="text-[0.78rem] text-muted">
                {daysSinceLastChange === 0
                  ? "Updated today"
                  : daysSinceLastChange === 1
                    ? "1 day since last change"
                    : `${daysSinceLastChange} days since last change`}
              </span>
            )}
          </div>

          {/* ── Boundary-watch banner (conditional) ─────────────────────── */}
          {activeBoundaryWatch && (
            <div className="mb-4 px-3 py-2.5 rounded-[10px] border border-[rgba(125,211,252,0.25)] bg-[rgba(125,211,252,0.05)] flex flex-wrap items-start gap-2 text-[0.88rem]">
              <span
                className="shrink-0 text-[#7dd3fc] font-bold mt-0.5"
                aria-hidden="true"
              >
                {activeBoundaryWatch.directionLabel === "upward" ? "▲" : "▼"}
              </span>
              <span className="text-[#7dd3fc] font-semibold">
                Boundary watch active
                {activeBoundaryWatch.cycle != null
                  ? ` — cycle ${activeBoundaryWatch.cycle}`
                  : ""}
              </span>
              {activeBoundaryWatch.headline && (
                <span className="text-muted w-full sm:w-auto">
                  {truncate(activeBoundaryWatch.headline, 140)}
                </span>
              )}
              <Link
                href={`${historyHref}?from=entity-page`}
                className="text-[#7dd3fc] hover:text-[#a5e3ff] transition-colors text-[0.82rem] underline-offset-2 hover:underline whitespace-nowrap"
              >
                View history →
              </Link>
            </div>
          )}

          {/* ── Tier-A scored events ─────────────────────────────────────── */}
          {tierAEvents.length > 0 && (
            <div className="space-y-3 mb-4">
              {tierAEvents.map((event, idx) => {
                const isFirst = idx === 0;
                return (
                  <article
                    key={`${event.date}-${idx}`}
                    className={`flex flex-col sm:flex-row sm:items-start gap-3 ${
                      idx > 0 ? "pt-3 border-t border-[rgba(255,255,255,0.06)]" : ""
                    }`}
                    aria-label={
                      event.delta !== null
                        ? `${event.date}: score ${event.delta > 0 ? "increased" : "decreased"} ${Math.abs(event.delta).toFixed(1)}`
                        : `${event.date}: scored event`
                    }
                  >
                    {/* Left: date + delta + badges */}
                    <div className="shrink-0 flex flex-wrap items-center gap-2 sm:min-w-[220px]">
                      <time
                        dateTime={event.date}
                        className="text-[0.82rem] text-muted font-mono"
                      >
                        {formatShortDate(event.date)}
                      </time>
                      {isFirst && (
                        <span className="text-[0.72rem] text-muted">
                          ·{" "}
                          {daysSinceLastChange === 0
                            ? "today"
                            : daysSinceLastChange === 1
                              ? "1 day ago"
                              : daysSinceLastChange !== null
                                ? `${daysSinceLastChange} days ago`
                                : ""}
                        </span>
                      )}
                      <EventDeltaBadge delta={event.delta} />
                      {event.rulingRef && (
                        <RulingBadge rulingNumber={event.rulingRef.rulingNumber} />
                      )}
                    </div>

                    {/* Right: headline + links */}
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-text text-[0.95rem] leading-snug mb-2"
                        title={event.headline}
                      >
                        {truncate(event.headline, 120)}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-[0.82rem]">
                        <Link
                          href={event.briefingPath}
                          className="text-[#7dd3fc] hover:text-[#a5e3ff] transition-colors"
                        >
                          View briefing →
                        </Link>
                        {event.citationUrl && (
                          <a
                            href={event.citationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted hover:text-text transition-colors"
                            aria-label={`Source: ${urlDomain(event.citationUrl)} (opens in new tab)`}
                          >
                            Source ↗
                            <span aria-hidden="true" />
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* ── Methodology rulings callout (conditional) ────────────────── */}
          {qualifyingRulings.length > 0 && (
            <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.06)]">
              <p className="text-[0.72rem] uppercase tracking-[0.1em] text-muted font-semibold mb-2">
                Methodology rulings
              </p>
              <div className="space-y-2">
                {qualifyingRulings.map((ruling) => (
                  <div
                    key={ruling.rulingNumber}
                    className="flex flex-wrap items-start gap-2 text-[0.88rem]"
                  >
                    <RulingBadge rulingNumber={ruling.rulingNumber} />
                    <div className="flex-1 min-w-0">
                      <span
                        className="text-text font-medium"
                        title={ruling.name}
                      >
                        {truncate(ruling.name, 80)}
                      </span>
                      <span className="text-muted mx-2" aria-hidden="true">
                        ·
                      </span>
                      <time
                        dateTime={ruling.establishedDate}
                        className="text-muted text-[0.82rem]"
                      >
                        {formatShortDate(ruling.establishedDate)}
                      </time>
                      <span className="mx-2 text-muted" aria-hidden="true">
                        ·
                      </span>
                      <Link
                        href={ruling.briefingPath}
                        className="text-[#7dd3fc] hover:text-[#a5e3ff] transition-colors"
                      >
                        View briefing →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              {hasMoreRulings && (
                <div className="mt-2">
                  <Link
                    href={`${historyHref}?from=entity-page`}
                    className="text-[0.82rem] text-[#7dd3fc] hover:text-[#a5e3ff] transition-colors"
                  >
                    View all rulings in history →
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* ── Footer ───────────────────────────────────────────────────── */}
          <div className="mt-4 pt-3 border-t border-[rgba(255,255,255,0.06)] flex justify-end">
            <Link
              href={`${historyHref}?from=entity-page`}
              className="text-[0.88rem] text-[#7dd3fc] hover:text-[#a5e3ff] transition-colors font-medium"
            >
              View full history ({totalEventCount} event{totalEventCount !== 1 ? "s" : ""}) →
            </Link>
          </div>
        </Panel>
      </Container>
    </section>
  );
}
