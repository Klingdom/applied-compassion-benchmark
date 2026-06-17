/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * DailyBriefingHeader — Wave E1 densification pass (items #2, #3, #4).
 *
 * Changes vs Wave B:
 *
 * #2 — Today-in-Brief promoted: bare bullets render between the thesis and the
 *       CTA cluster (no more 2-col card grid; card wrapper dropped).
 *
 * #3 — H1 shrunk from clamp(2.4rem,5.5vw,4.4rem) → clamp(1.6rem,3vw,2.4rem).
 *       CTA cluster collapsed from 4 equal buttons to 1 primary ("Read today's
 *       brief") + 1 inline NewsletterSignup (inline-compact). "View methodology"
 *       and "Explore indexes" moved to a muted text-link row. Bottom margin
 *       reduced from mb-8 → mb-4.
 *
 * #4 — Pipeline micro-strip added: one compact muted line showing
 *       "[N] reviewed · [N] assessed · [N] score changes · [N] forward watches"
 *       sourced from updates.pipeline + updates.forwardTriggers. Placed above
 *       the stat strip; gracefully absent when pipeline data is missing.
 *
 * #1 — StatOfTheDayStrip renders as a single horizontal line (~44px) instead of
 *       the old ~160px card.
 *
 * Preserved (Wave B/C):
 * - Date navigation tabs
 * - Masthead (brand · date · issue number)
 * - One-sentence thesis
 * - Trust line with methodology link
 * - id="brief" section anchor (never dead-links)
 * - Primary CTA always targets #lead-signal (always-present section anchor)
 */

import Link from "next/link";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import NewsletterSignup from "@/components/ui/NewsletterSignup";
import StatOfTheDayStrip from "./StatOfTheDay";
import TodayInBrief from "./TodayInBrief";
import {
  heroDateLabel,
  issueNumber,
  deriveStatOfTheDay,
  deriveTodayInBrief,
} from "./utils";

interface Props {
  updates: any;
  dateNav?: { date: string; label: string; isCurrent: boolean }[];
}

export default function DailyBriefingHeader({ updates, dateNav }: Props) {
  const dateStr: string = updates.date ?? "";
  const heroDate = dateStr ? heroDateLabel(dateStr) : "";
  const issueNo = dateStr ? issueNumber(dateStr) : 1;

  // Lead finding for the visual headline — mirrors the OG/social-crawler priority
  // used in page.tsx: scoreChanges[0].headline > topSignals[0].title > headline.
  // Falls back to "Daily Briefing" (filing-cabinet label) only when nothing better
  // exists, so the <h1> is never empty.
  const leadFinding: string = (() => {
    const sc0Headline: string = updates.scoreChanges?.[0]?.headline ?? "";
    if (sc0Headline.trim().length > 8) return sc0Headline.split(/(?<=[.!?])\s/)[0];
    const sig0Title: string = updates.topSignals?.[0]?.title ?? "";
    if (sig0Title.trim().length > 8) return sig0Title;
    const raw: string = updates.headline ?? updates.summary ?? "";
    if (raw.trim().length > 8) return raw.split(/(?<=[.!?])\s/)[0];
    return "Daily Briefing";
  })();

  // thesis: kept for StatOfTheDay derivation (unchanged usage below)
  const rawHeadline: string = updates.headline ?? updates.summary ?? "";
  const thesis = rawHeadline
    ? rawHeadline.split(/(?<=[.!?])\s/)[0]
    : "Daily compassion intelligence across 1,160 indexed entities.";

  // Stat of the Day
  const stat = deriveStatOfTheDay(updates);

  // Today in Brief bullets
  const briefItems = deriveTodayInBrief(updates);

  // Pipeline data (item #4)
  const pipeline = updates.pipeline ?? {};
  const pipelineReviewed: number | null = pipeline.entitiesScanned ?? null;
  const pipelineAssessed: number | null = pipeline.entitiesAssessed ?? null;
  const pipelineChanges: number | null =
    pipeline.scoreChanges ?? pipeline.changesApplied ?? null;
  const forwardTriggers: any[] = Array.isArray(updates.forwardTriggers)
    ? updates.forwardTriggers
    : [];
  const pipelineWatches: number | null =
    forwardTriggers.length > 0 ? forwardTriggers.length : null;

  // Build pipeline micro-strip parts — only include non-null fields
  const pipelineParts: string[] = [];
  if (pipelineReviewed !== null)
    pipelineParts.push(`${pipelineReviewed.toLocaleString()} reviewed`);
  if (pipelineAssessed !== null)
    pipelineParts.push(`${pipelineAssessed.toLocaleString()} assessed`);
  if (pipelineChanges !== null)
    pipelineParts.push(`${pipelineChanges} score change${pipelineChanges !== 1 ? "s" : ""}`);
  if (pipelineWatches !== null)
    pipelineParts.push(`${pipelineWatches} forward watch${pipelineWatches !== 1 ? "es" : ""}`);

  // Trust line entity count fallback
  const entityCount: string =
    pipeline.entitiesScanned?.toLocaleString() ?? "1,160";

  // Build the canonical page URL for citation (static: no runtime window needed)
  const pageUrl = dateStr
    ? `https://compassionbenchmark.com/updates/${dateStr}`
    : "https://compassionbenchmark.com/updates";

  return (
    <section
      id="brief"
      className="pt-[56px] pb-6 relative overflow-hidden scroll-mt-0"
    >
      {/* Ambient backdrop */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at top, rgba(125,211,252,0.08) 0%, rgba(125,211,252,0) 60%)",
        }}
      />
      <Container className="relative">
        {/* Date navigation tabs */}
        {dateNav && dateNav.length > 0 && (
          <nav
            aria-label="Browse previous briefings"
            className="flex flex-wrap gap-2 mb-6"
          >
            {dateNav.map(({ date, label, isCurrent }) =>
              isCurrent ? (
                <span
                  key={date}
                  aria-current="page"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[10px] border border-[rgba(125,211,252,0.4)] bg-[rgba(125,211,252,0.12)] text-[#7dd3fc] text-[0.88rem] font-semibold"
                >
                  {label}
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-[#7dd3fc] shrink-0"
                    aria-hidden="true"
                  />
                </span>
              ) : (
                <Link
                  key={date}
                  href={`/updates/${date}`}
                  className="inline-flex items-center px-3.5 py-1.5 rounded-[10px] border border-line bg-[rgba(255,255,255,0.04)] text-muted text-[0.88rem] font-medium hover:border-[rgba(125,211,252,0.3)] hover:text-text hover:bg-[rgba(125,211,252,0.06)] transition-colors"
                >
                  {label}
                </Link>
              )
            )}
          </nav>
        )}

        {/* Masthead kicker — carries the "Daily Briefing" label demoted from h1 */}
        <div className="flex items-baseline gap-3 mb-4 flex-wrap">
          <span className="text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[#7dd3fc]">
            Compassion Benchmark
          </span>
          <span className="text-muted text-[0.78rem]" aria-hidden="true">
            ·
          </span>
          <span className="text-muted text-[0.78rem] font-semibold uppercase tracking-[0.14em]">
            Daily Briefing
          </span>
          <span className="text-muted text-[0.78rem]" aria-hidden="true">
            ·
          </span>
          <span className="text-text text-[0.88rem] font-medium">{heroDate}</span>
          <span className="text-muted text-[0.78rem]" aria-hidden="true">
            ·
          </span>
          <span className="text-muted text-[0.78rem] font-semibold uppercase tracking-wider tabular-nums">
            No.&nbsp;{issueNo}
          </span>
        </div>

        {/* Lead finding as the visual headline — the actual finding, not a filing-cabinet label.
            Falls back to "Daily Briefing" when nothing better exists (never ships empty).
            The masthead kicker above carries the "Daily Briefing · date · No. N" identity. */}
        <h1 className="text-[clamp(1.6rem,3vw,2.4rem)] leading-[1.06] tracking-[-0.025em] mb-3 font-bold">
          {leadFinding}
        </h1>

        {/* S1.6: TodayInBrief removed from header — promoted to ThirtySecondTier section */}

        {/* #4 — Pipeline micro-strip (trust signal; visible only when data exists) */}
        {pipelineParts.length > 0 && (
          <p
            className="text-[0.73rem] text-muted tabular-nums mb-4 flex flex-wrap gap-x-2 gap-y-0.5 items-center"
            aria-label="Today's research pipeline"
          >
            {pipelineParts.map((part, i) => (
              <span key={i} className="inline-flex items-center gap-2">
                {i > 0 && (
                  <span className="text-[rgba(255,255,255,0.2)]" aria-hidden="true">·</span>
                )}
                {part}
              </span>
            ))}
          </p>
        )}

        {/* #1 — Stat of the Day as a dense single-row strip */}
        {stat && (
          <StatOfTheDayStrip stat={stat} date={heroDate} pageUrl={pageUrl} />
        )}

        {/* #3 — CTA cluster: 1 primary + 1 inline subscribe (collapsed from 4 buttons) */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <Button href="#lead-signal" variant="primary">
            Read today&apos;s brief
          </Button>
          {/* Inline-compact subscribe — the top-of-page ask */}
          <NewsletterSignup
            variant="inline-compact"
            source="updates-header"
          />
        </div>

        {/* #3 — Secondary nav as muted text links (replaces "View methodology" + "Explore indexes" buttons) */}
        <p className="text-[0.78rem] text-muted mb-1 flex flex-wrap gap-x-3 gap-y-0.5 items-center">
          <Link
            href="/methodology"
            className="hover:text-text transition-colors underline decoration-dotted underline-offset-2"
          >
            Methodology
          </Link>
          <span aria-hidden="true" className="text-[rgba(255,255,255,0.2)]">·</span>
          <Link
            href="/indexes"
            className="hover:text-text transition-colors underline decoration-dotted underline-offset-2"
          >
            Explore indexes
          </Link>
        </p>

        {/* Trust line */}
        <p className="text-[0.75rem] text-muted mt-3">
          {entityCount} entities reviewed across 7 indexes.{" "}
          <Link
            href="/methodology"
            className="hover:text-text transition-colors underline decoration-dotted underline-offset-2"
          >
            Full methodology
          </Link>
          .
        </p>
      </Container>
    </section>
  );
}
