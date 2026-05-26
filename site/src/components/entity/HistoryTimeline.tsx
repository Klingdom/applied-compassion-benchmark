import Link from "next/link";
import Container from "@/components/ui/Container";
import Band, { BandLevel } from "@/components/ui/Band";
import Panel from "@/components/ui/Panel";
import Button from "@/components/ui/Button";
import CompositeSparkline from "@/components/entity/CompositeSparkline";
import type { EntityHistory, HistoryEvent, CompactedRun } from "@/types/entity-history";
import { SCORE_WATCH } from "@/data/gumroad";

interface Props {
  history: EntityHistory;
  /** Link back to the parent entity page, e.g. "/country/slovakia" */
  entityHref: string;
}

// Format ISO date string to "May 25, 2026"
function formatDate(dateStr: string): string {
  if (!dateStr || dateStr === "now") return "";
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return dateStr;
  }
}

// Format ISO date to "2026-05-25" eyebrow style (already ISO, just return)
function formatDateEyebrow(dateStr: string): string {
  return dateStr || "";
}

function DeltaBadge({ delta }: { delta: number | null }) {
  if (delta === null || delta === undefined) return null;
  if (Math.abs(delta) < 0.01) {
    return (
      <span className="text-[1.15rem] font-bold text-muted" aria-label="no score change">
        ◆ Hold
      </span>
    );
  }
  const isPositive = delta > 0;
  const color = isPositive ? "text-band-green" : "text-band-orange";
  const arrow = isPositive ? "▲" : "▼";
  const label = isPositive
    ? `increase of ${Math.abs(delta).toFixed(1)} points`
    : `decrease of ${Math.abs(delta).toFixed(1)} points`;
  return (
    <span className={`text-[1.15rem] font-bold ${color}`} aria-label={label}>
      {arrow} {isPositive ? "+" : ""}
      {delta.toFixed(1)}
    </span>
  );
}

function TypeBadge({ type }: { type: HistoryEvent["type"] }) {
  if (type === "boundary-watch") {
    return (
      <span className="inline-flex px-2 py-0.5 rounded-full text-[0.72rem] font-bold border border-[rgba(125,211,252,0.25)] text-accent bg-[rgba(125,211,252,0.08)] uppercase tracking-wide">
        Watch
      </span>
    );
  }
  return (
    <span className="inline-flex px-2 py-0.5 rounded-full text-[0.72rem] font-bold border border-[rgba(251,146,60,0.25)] text-band-orange bg-[rgba(251,146,60,0.08)] uppercase tracking-wide">
      Scored
    </span>
  );
}

function TimelineEventCard({ event }: { event: HistoryEvent }) {
  const dateLabel = formatDate(event.date);
  const ariaLabel = event.delta !== null && Math.abs(event.delta) > 0.01
    ? `${event.date}: score ${event.delta > 0 ? "increased" : "decreased"} ${Math.abs(event.delta).toFixed(1)} to ${event.newComposite?.toFixed(1) ?? "unknown"}`
    : `${event.date}: ${event.type === "boundary-watch" ? "boundary watch" : "assessed, no change"}`;

  return (
    <article
      role="article"
      aria-label={ariaLabel}
      className="rounded-[16px] border border-line bg-[rgba(255,255,255,0.02)] p-5 space-y-3"
    >
      {/* Date + type badge row */}
      <div className="flex items-center gap-2 flex-wrap">
        <time
          dateTime={event.date}
          className="text-[0.78rem] text-muted font-mono"
        >
          {formatDateEyebrow(event.date)}
        </time>
        <TypeBadge type={event.type} />
        {event.cycle && (
          <span className="text-[0.72rem] text-muted">
            cycle {event.cycle}
          </span>
        )}
      </div>

      {/* Delta + new composite row */}
      {(event.delta !== null || event.newComposite !== null) && (
        <div className="flex items-center gap-4 flex-wrap">
          <DeltaBadge delta={event.delta} />
          {event.newComposite !== null && (
            <span className="text-[1.3rem] font-bold tabular-nums">
              {event.newComposite.toFixed(1)}
            </span>
          )}
          {event.newBand && (
            <Band level={event.newBand.toLowerCase() as BandLevel} />
          )}
        </div>
      )}

      {/* Headline */}
      <p className="text-[0.92rem] text-text leading-relaxed line-clamp-4">
        {event.headline}
      </p>

      {/* Briefing link */}
      <div>
        <Link
          href={event.briefingPath}
          className="text-[0.85rem] text-accent hover:text-[#a5e3ff] transition-colors"
        >
          Read briefing: {dateLabel} →
        </Link>
      </div>
    </article>
  );
}

/**
 * Extracts a YYYY-MM-DD date from a briefing path like "/updates/2026-04-15".
 * Returns the path unchanged when no date segment is found.
 */
function briefingPathToDate(path: string): string {
  const match = path.match(/(\d{4}-\d{2}-\d{2})$/);
  return match ? match[1] : path;
}

/**
 * Renders a single compacted Tier-D run as a collapsed row.
 *
 * Uses native <details>/<summary> so the component stays server-rendered
 * and keyboard/screen-reader accessibility is handled by the browser.
 * Default state is collapsed per acceptance criteria §4.
 *
 * Visual treatment: muted left border, dimmed text, "+N events" chip.
 * No red. Neutral research language only.
 */
function CompactedRunRow({ run }: { run: CompactedRun }) {
  const startLabel = formatDate(run.fromDate);
  const endLabel = formatDate(run.toDate);
  const directionText =
    run.netDirection === "upward"
      ? "net upward"
      : run.netDirection === "downward"
      ? "net downward"
      : "";
  const magnitudeText =
    run.netMagnitude !== 0 && run.netMagnitude !== null
      ? ` (${run.netMagnitude > 0 ? "+" : ""}${run.netMagnitude.toFixed(1)})`
      : "";

  const summaryLabel = `${run.count} sub-threshold ${run.count === 1 ? "movement" : "movements"} · ${run.fromDate} → ${run.toDate}`;

  return (
    <details
      className="rounded-[14px] border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.015)] pl-4 overflow-hidden group"
      aria-label={`Compacted period: ${summaryLabel}`}
    >
      {/* Collapsed summary row */}
      <summary
        className="flex items-center gap-3 flex-wrap cursor-pointer py-3 pr-4 select-none list-none [&::-webkit-details-marker]:hidden"
      >
        {/* Muted left-border accent line */}
        <div
          aria-hidden="true"
          className="w-0.5 self-stretch bg-[rgba(255,255,255,0.12)] rounded-full shrink-0 -ml-4 mr-1"
        />

        {/* "+N events" chip */}
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[0.7rem] font-bold border border-[rgba(255,255,255,0.12)] text-[color:var(--color-muted-subtle)] bg-[rgba(255,255,255,0.04)] tabular-nums shrink-0">
          +{run.count}
        </span>

        {/* Summary text */}
        <span className="text-[0.82rem] text-[color:var(--color-muted)] leading-snug min-w-0">
          <span className="font-medium">
            {run.count === 1 ? "1 sub-threshold movement" : `${run.count} sub-threshold movements`}
          </span>
          {directionText && magnitudeText ? (
            <span className="text-[color:var(--color-muted-subtle)]">
              {" "}· {directionText}{magnitudeText}
            </span>
          ) : directionText ? (
            <span className="text-[color:var(--color-muted-subtle)]"> · {directionText}</span>
          ) : null}
          <span className="text-[color:var(--color-muted-subtle)]">
            {" "}· {run.fromDate} → {run.toDate}
          </span>
        </span>

        {/* Expand indicator */}
        <span
          aria-hidden="true"
          className="ml-auto text-[0.75rem] text-[color:var(--color-muted-subtle)] shrink-0 group-open:hidden"
        >
          expand ↓
        </span>
        <span
          aria-hidden="true"
          className="ml-auto text-[0.75rem] text-[color:var(--color-muted-subtle)] shrink-0 hidden group-open:inline"
        >
          collapse ↑
        </span>
      </summary>

      {/* Expanded content: briefing links for each collapsed event */}
      <div
        className="border-t border-[rgba(255,255,255,0.06)] px-4 py-3 space-y-2"
        id={`compacted-run-${run.fromDate}-${run.toDate}`}
      >
        <p className="text-[0.75rem] text-[color:var(--color-muted-subtle)] mb-2">
          {run.count === 1
            ? "1 documented hold — did not reach the formal apply threshold."
            : `${run.count} documented holds — none reached the formal apply threshold.`}
          {directionText ? ` Overall direction: ${directionText}${magnitudeText}.` : ""}
        </p>
        <ul className="space-y-1.5" aria-label={`Source briefings for compacted period ${startLabel} – ${endLabel}`}>
          {run.briefingPaths.map((path) => {
            const dateStr = briefingPathToDate(path);
            const displayDate = formatDate(dateStr) || dateStr;
            return (
              <li key={path}>
                <Link
                  href={path}
                  className="text-[0.82rem] text-[color:var(--color-muted)] hover:text-[color:var(--color-accent)] transition-colors"
                >
                  Briefing: {displayDate} →
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </details>
  );
}

/**
 * A timeline entry is either a regular HistoryEvent or a CompactedRun.
 * We merge both arrays by date (newest first) so compacted runs appear
 * in their correct chronological position.
 */
type TimelineEntry =
  | { kind: "event"; data: HistoryEvent; index: number }
  | { kind: "compacted"; data: CompactedRun };

function buildTimeline(events: HistoryEvent[], compactedRuns: CompactedRun[]): TimelineEntry[] {
  const entries: TimelineEntry[] = events.map((e, i) => ({
    kind: "event",
    data: e,
    index: i,
  }));

  for (const run of compactedRuns) {
    entries.push({ kind: "compacted", data: run });
  }

  // Sort newest-first. For compacted runs, use toDate as the sort key so the
  // run appears at the position of its most recent event.
  entries.sort((a, b) => {
    const dateA = a.kind === "event" ? a.data.date : a.data.toDate;
    const dateB = b.kind === "event" ? b.data.date : b.data.toDate;
    // Descending (newest first)
    return dateB.localeCompare(dateA);
  });

  return entries;
}

function ScoreWatchSidebar({
  entityName,
  slug,
}: {
  entityName: string;
  slug: string;
}) {
  const scoreWatchHref = SCORE_WATCH.useGumroad
    ? `/score-watch?entity=${encodeURIComponent(slug)}`
    : `/score-watch?entity=${encodeURIComponent(slug)}`;

  return (
    <aside
      aria-label={`Subscribe to Score-Watch alerts for ${entityName}`}
      data-pagefind-ignore
      className="rounded-[18px] border border-line bg-gradient-to-b from-[rgba(255,255,255,0.045)] to-[rgba(255,255,255,0.02)] p-6 space-y-4"
    >
      <div>
        <p className="text-[0.72rem] uppercase tracking-[0.12em] text-muted mb-1">
          Score-Watch
        </p>
        <h3 className="text-[1.05rem] font-bold">{entityName}</h3>
      </div>
      <p className="text-[0.88rem] text-muted leading-relaxed">
        Get alerted when {entityName}&apos;s score changes.
      </p>
      <p className="text-[0.78rem] text-muted leading-relaxed">
        Third-party observer alerts only — {entityName} does not purchase this
        service about itself.
      </p>
      <div className="text-[0.95rem] font-bold text-text">
        {SCORE_WATCH.priceLabel}
      </div>
      <Button href={scoreWatchHref} variant="primary" full>
        Subscribe to Score-Watch
      </Button>
    </aside>
  );
}

export default function HistoryTimeline({ history, entityHref }: Props) {
  const {
    name,
    currentComposite,
    currentBand,
    currentRank,
    events,
    compactedRuns,
    scoredEventCount,
    boundaryWatchCount,
    firstEventDate,
    lastEventDate,
    slug,
  } = history;

  const bandLevel = currentBand?.toLowerCase() as BandLevel | undefined;

  // ── Empty state ────────────────────────────────────────────────────────────
  if (events.length === 0) {
    return (
      <main>
        <section className="py-12 sm:py-16 border-b border-line">
          <Container>
            <div className="mb-4">
              <Link
                href={entityHref}
                className="text-[0.85rem] text-muted hover:text-text transition-colors"
              >
                ← Back to {name}
              </Link>
            </div>
            <h1 className="text-[2rem] sm:text-[2.4rem] font-bold mb-3">{name}</h1>
            <p className="text-[0.85rem] uppercase tracking-[0.12em] text-muted mb-6">
              Score history
            </p>
            <Panel className="max-w-[600px]">
              <p className="text-[1.05rem] font-semibold mb-3">
                No score changes recorded for {name} yet.
              </p>
              <p className="text-muted text-[0.92rem] mb-5">
                This entity is monitored across 1,155+ indexed institutions.
                Score changes are recorded when evidence meets the formal apply
                threshold.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button href={entityHref}>
                  View current score for {name} →
                </Button>
                <Button href="/score-watch" variant="primary">
                  Subscribe to Score-Watch →
                </Button>
              </div>
            </Panel>
          </Container>
        </section>
      </main>
    );
  }

  // ── Full timeline ──────────────────────────────────────────────────────────
  return (
    <main>
      {/* Hero */}
      <section className="py-12 sm:py-16 border-b border-line">
        <Container>
          <div className="mb-4">
            <Link
              href={entityHref}
              className="text-[0.85rem] text-muted hover:text-text transition-colors"
            >
              ← Back to {name}
            </Link>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
            {/* Left: hero info */}
            <div className="min-w-0 flex-1">
              <p className="text-[0.82rem] uppercase tracking-[0.12em] text-muted mb-2">
                Score history
              </p>
              <h1 className="text-[2.2rem] sm:text-[2.8rem] font-bold leading-[1.05] mb-3">
                {name}
              </h1>

              {/* Current score + band */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {currentComposite !== null && (
                  <span className="text-[2rem] font-bold tabular-nums">
                    {currentComposite.toFixed(1)}
                  </span>
                )}
                {bandLevel && <Band level={bandLevel} />}
                {currentRank && (
                  <span className="text-muted text-[0.92rem]">
                    Rank #{currentRank}
                  </span>
                )}
              </div>

              {/* Event counts */}
              <div className="flex flex-wrap gap-4 text-[0.88rem] text-muted mb-4">
                {scoredEventCount > 0 && (
                  <span>
                    <span className="font-semibold text-text">{scoredEventCount}</span>{" "}
                    scored {scoredEventCount === 1 ? "event" : "events"}
                  </span>
                )}
                {boundaryWatchCount > 0 && (
                  <span>
                    <span className="font-semibold text-text">{boundaryWatchCount}</span>{" "}
                    boundary watch {boundaryWatchCount === 1 ? "cycle" : "cycles"}
                  </span>
                )}
                {firstEventDate && lastEventDate && firstEventDate !== lastEventDate && (
                  <span>
                    {formatDate(firstEventDate)} – {formatDate(lastEventDate)}
                  </span>
                )}
              </div>

              {/* View entity link */}
              <Link
                href={entityHref}
                className="text-[0.85rem] text-accent hover:text-[#a5e3ff] transition-colors"
              >
                View entity page →
              </Link>

              {/* Sparkline */}
              {currentComposite !== null && (
                <div className="mt-6 max-w-[480px]">
                  <CompositeSparkline
                    events={events}
                    currentComposite={currentComposite}
                    entityName={name}
                    height={64}
                  />
                </div>
              )}
            </div>

            {/* Right: Score-Watch CTA (desktop sidebar) */}
            <div className="lg:w-[260px] shrink-0">
              <ScoreWatchSidebar entityName={name} slug={slug} />
            </div>
          </div>
        </Container>
      </section>

      {/* Mobile Score-Watch CTA */}
      <section className="lg:hidden py-6 border-b border-line">
        <Container>
          <ScoreWatchSidebar entityName={name} slug={slug} />
        </Container>
      </section>

      {/*
        Pagefind indexing wrapper — covers entity name, score context, and
        the full event timeline. The Score-Watch sidebar is excluded via
        data-pagefind-ignore (it is commercial UI, not research content).
        data-pagefind-meta provides structured metadata surfaced in results.
      */}
      <section
        className="py-10 sm:py-14"
        data-pagefind-body
        data-pagefind-meta={`entity:${name},band:${currentBand ?? ""},composite:${currentComposite?.toFixed(1) ?? ""}`}
      >
        <Container>
          <h2 className="text-[0.82rem] uppercase tracking-[0.14em] text-muted mb-6">
            Score timeline
          </h2>

          <div
            role="feed"
            aria-label={`Score timeline for ${name}`}
            className="space-y-4 max-w-[720px]"
          >
            {buildTimeline(events, compactedRuns ?? []).map((entry) => {
              if (entry.kind === "event") {
                return (
                  <TimelineEventCard
                    key={`${entry.data.date}-${entry.data.type}-${entry.index}`}
                    event={entry.data}
                  />
                );
              }
              return (
                <CompactedRunRow
                  key={`compacted-${entry.data.fromDate}-${entry.data.toDate}`}
                  run={entry.data}
                />
              );
            })}
          </div>
        </Container>
      </section>
    </main>
  );
}
