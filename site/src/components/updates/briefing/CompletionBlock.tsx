/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * CompletionBlock — Wave E1 / Wave E2, Item #6 (completion-block CTA).
 * Wave H1: added "Special Briefings →" panel when manifest is non-empty (#5).
 * Phase 2: added share button, nextDate navigation, "what we're watching next".
 *
 * Adds a benefit-led email capture INSIDE the completion card at the peak-intent
 * moment (reader just finished the briefing). Uses NewsletterSignup
 * variant="inline-compact" source="updates-completion".
 *
 * Copy rationale: "Don't come back to find out — get the next briefing in your
 * inbox. One email, Fridays. Free." — honest cadence, no dark patterns.
 *
 * The standalone SubscribeCTA block that previously followed this component in
 * DailyBriefing.tsx has been removed (see Wave E1 change #6). This completion
 * block is now the single end-of-briefing subscribe ask.
 */

"use client";

import Link from "next/link";
import Container from "@/components/ui/Container";
import NewsletterSignup from "@/components/ui/NewsletterSignup";
import manifest from "@/data/special-briefings/manifest.json";
import { entityHref } from "@/lib/entityHref";
import { heroDateLabel, issueNumber, formatDateLabel } from "./utils";
import ShareBriefing from "./ShareBriefing";
import { trackEvent, EVENTS } from "@/lib/analytics";

interface Props {
  updates: any;
  /** Previous briefing date (YYYY-MM-DD) — older, i.e. index+1 in dates array. */
  prevDate?: string | null;
  /** Next briefing date (YYYY-MM-DD) — newer, i.e. index-1 in dates array. Null for latest. */
  nextDate?: string | null;
}

export default function CompletionBlock({ updates, prevDate: prevDateProp, nextDate: nextDateProp }: Props) {
  const dateStr: string = updates.date ?? "";
  if (!dateStr) return null;

  const issueNo = issueNumber(dateStr);
  const heroDate = heroDateLabel(dateStr);
  const generatedAt: string = updates.generatedAt ?? "";

  // Format the generatedAt timestamp to a human-readable form
  let currentAsOf = "";
  if (generatedAt) {
    try {
      const d = new Date(generatedAt);
      currentAsOf = d.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC",
        timeZoneName: "short",
      });
    } catch {
      currentAsOf = generatedAt;
    }
  } else {
    currentAsOf = formatDateLabel(dateStr);
  }

  // Entity count from pipeline
  const pipeline = updates.pipeline ?? {};
  const entitiesScanned = pipeline.entitiesScanned?.toLocaleString() ?? "1,160";

  // Phase 2: use passed-in prevDate/nextDate (computed in page.tsx from manifest)
  const prevDate: string | null = prevDateProp ?? null;
  const nextDate: string | null = nextDateProp ?? null;

  // Phase 2: "What we're watching next" — soonest 1–3 forwardTriggers by date
  const forwardTriggers: any[] = Array.isArray(updates.forwardTriggers)
    ? updates.forwardTriggers
    : [];
  const watchingNext = forwardTriggers
    .filter((t: any) => {
      const d = t.triggerDate ?? t.date ?? "";
      return typeof d === "string" && d.length > 0;
    })
    .sort((a: any, b: any) => {
      const da = a.triggerDate ?? a.date ?? "";
      const db = b.triggerDate ?? b.date ?? "";
      if (da.toUpperCase() === "TBD") return 1;
      if (db.toUpperCase() === "TBD") return -1;
      return da < db ? -1 : da > db ? 1 : 0;
    })
    .slice(0, 3);

  // Phase 2: headline for share button
  const headline: string = typeof updates.headline === "string" ? updates.headline.trim() : "";

  // Entity pills from topSignals (up to 3)
  const topSignals: any[] = Array.isArray(updates.topSignals) ? updates.topSignals : [];
  const entityPills = topSignals
    .slice(0, 3)
    .map((sig: any) => {
      if (!sig?.slug || !sig?.index) return null;
      const href = entityHref(sig.index, sig.slug);
      if (!href) return null;
      const label: string = sig.entity ?? sig.title ?? sig.slug;
      return { href, label };
    })
    .filter((p): p is { href: string; label: string } => p !== null);

  return (
    <section
      id="completion"
      className="py-[32px] scroll-mt-24"
      aria-label="Briefing complete"
    >
      <Container>
        <div className="rounded-[20px] border border-[rgba(125,211,252,0.18)] bg-gradient-to-b from-[rgba(125,211,252,0.04)] to-transparent p-6 sm:p-8">
          {/* Checkmark + "You're all caught up" */}
          <div className="flex flex-col items-center text-center mb-5">
            <div
              className="mb-3 w-10 h-10 rounded-full border border-[rgba(134,239,172,0.35)] bg-[rgba(134,239,172,0.08)] flex items-center justify-center"
              aria-hidden="true"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
              >
                <path
                  d="M3.5 9.5l4 4 7-8"
                  stroke="#86efac"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <p className="text-[1.05rem] sm:text-[1.12rem] font-semibold text-text mb-1">
              You&apos;re all caught up.
            </p>

            <p className="text-muted text-[0.85rem] leading-relaxed">
              {heroDate} briefing
              <span className="mx-2 text-[rgba(255,255,255,0.25)]" aria-hidden="true">
                ·
              </span>
              Issue No.&nbsp;{issueNo}
              <span className="mx-2 text-[rgba(255,255,255,0.25)]" aria-hidden="true">
                ·
              </span>
              {entitiesScanned} entities reviewed
              <span className="mx-2 text-[rgba(255,255,255,0.25)]" aria-hidden="true">
                ·
              </span>
              benchmark current as of {currentAsOf}
            </p>

            {/* Phase 2: share button — primary variant */}
            {headline && (
              <div className="mt-3">
                <ShareBriefing date={dateStr} headline={headline} variant="primary" />
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-[rgba(125,211,252,0.12)] mb-5" />

          {/* Email capture — peak-intent moment, single end-of-briefing ask */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[0.92rem] font-semibold text-text leading-snug mb-0.5">
                Don&apos;t come back to find out — get the next briefing in your inbox.
              </p>
              <p className="text-muted text-[0.82rem]">
                Read by analysts, journalists, and policy researchers tracking institutional
                accountability — {entitiesScanned} entities, scored every day, free.
              </p>
            </div>
            <div className="shrink-0">
              <NewsletterSignup
                variant="inline-compact"
                source="updates-completion"
              />
            </div>
          </div>

          {/* Phase 2: prev/next navigation + entity pills */}
          {(prevDate || nextDate || entityPills.length > 0) && (
            <>
              <div className="border-t border-[rgba(125,211,252,0.12)] mt-5 mb-4" />
              <div className="flex flex-wrap items-center gap-3">
                {/* Previous briefing (older) */}
                {prevDate && (
                  <Link
                    href={`/updates/${prevDate}`}
                    onClick={() =>
                      trackEvent(EVENTS.READ_NEXT_CLICK, {
                        from_date: dateStr,
                        to_date: prevDate,
                        direction: "prev",
                      })
                    }
                    className="inline-flex items-center gap-1.5 text-[0.82rem] font-semibold text-[#7dd3fc] hover:text-text transition-colors"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path d="M7.5 2L3 6l4.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {formatDateLabel(prevDate)} briefing
                  </Link>
                )}
                {/* Next briefing (newer) — only shown when a newer one exists */}
                {nextDate && (
                  <Link
                    href={`/updates/${nextDate}`}
                    onClick={() =>
                      trackEvent(EVENTS.READ_NEXT_CLICK, {
                        from_date: dateStr,
                        to_date: nextDate,
                        direction: "next",
                      })
                    }
                    className="inline-flex items-center gap-1.5 text-[0.82rem] font-semibold text-[#7dd3fc] hover:text-text transition-colors"
                  >
                    {formatDateLabel(nextDate)} briefing
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path d="M4.5 2L9 6l-4.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                )}
                {entityPills.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 ml-auto">
                    <span className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-muted mr-0.5">
                      In this briefing
                    </span>
                    {entityPills.map((pill) => (
                      <Link
                        key={pill.href}
                        href={pill.href}
                        className="text-[0.78rem] font-semibold px-2.5 py-0.5 rounded-full border border-line bg-[rgba(255,255,255,0.02)] text-muted hover:border-[rgba(125,211,252,0.4)] hover:text-[#7dd3fc] transition-colors"
                      >
                        {pill.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Phase 2: "What we're watching next" — derived from forwardTriggers (no schema change) */}
          {watchingNext.length > 0 && (
            <>
              <div className="border-t border-[rgba(125,211,252,0.12)] mt-5 mb-4" />
              <div>
                <div className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-muted mb-2">
                  What we&apos;re watching next
                </div>
                <ul className="space-y-1.5">
                  {watchingNext.map((t: any, i: number) => {
                    const triggerDate: string = t.triggerDate ?? t.date ?? "";
                    const entityName: string = t.entity ?? "";
                    const trigger: string = t.trigger ?? "";
                    const dateDisplay = triggerDate.toUpperCase() === "TBD" ? null : triggerDate;
                    return (
                      <li key={i} className="text-[0.82rem] text-muted leading-relaxed">
                        <span className="text-text font-medium">{entityName}</span>
                        {dateDisplay && (
                          <span className="text-[#7dd3fc] font-medium mx-1">({dateDisplay})</span>
                        )}
                        {trigger ? ` — ${trigger.length > 120 ? trigger.slice(0, 117) + "…" : trigger}` : ""}
                      </li>
                    );
                  })}
                </ul>
                <p className="text-[0.75rem] text-muted mt-2">
                  We reassess nightly.
                </p>
              </div>
            </>
          )}

          {/* Wave H1 #5: Special Briefings discovery panel — shown when manifest is non-empty */}
          {manifest.briefings.length > 0 && (
            <>
              <div className="border-t border-[rgba(125,211,252,0.12)] mt-5 mb-4" />
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <p className="text-[0.82rem] font-semibold text-text leading-snug mb-0.5">
                    Special Briefings
                  </p>
                  <p className="text-muted text-[0.78rem]">
                    Thematic deep-dives: cross-index analysis, structural patterns, and interpretive findings.
                  </p>
                </div>
                <Link
                  href="/updates/special"
                  className="shrink-0 inline-flex items-center gap-1.5 text-[0.82rem] font-semibold text-accent hover:text-text transition-colors"
                >
                  Browse special briefings
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M2 6h8M6.5 2.5l4 3.5-4 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </div>
            </>
          )}
        </div>
      </Container>
    </section>
  );
}
