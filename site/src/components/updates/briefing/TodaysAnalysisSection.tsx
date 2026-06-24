/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * TodaysAnalysisSection — S1.6 unified synthesis section.
 *
 * Folds in content previously rendered by:
 *   - BrutalInsightCard  (updates.editorialInsight → lead paragraph)
 *   - TodaysAnalysisSection (updates.highlights → numbered cards)
 *   - OpeningQuestion (updates.dailyOpeningQuestion → question block appended)
 *   - HighCompassionContrast (lead-signal contrast → collapsible <details>)
 *
 * The component files for those standalone sections are preserved (do not delete).
 * Only the standalone <section> wrappers in DailyBriefing.tsx are removed.
 *
 * Maintains id="highlights" so the BriefingJumpNav chip still resolves.
 * Returns null only when NO content exists across all four sources.
 *
 * "use client" is needed because OpeningQuestion uses TrackedEntityLink (client).
 */
"use client";

import { useEffect, useRef } from "react";
import Container from "@/components/ui/Container";
import SectionHead from "@/components/ui/SectionHead";
import TrackedEntityLink from "@/components/updates/TrackedEntityLink";
import { getEntityBySlug } from "@/data/entities";
import {
  kindToIndexSlug,
  kindToRoutePrefix,
  ALL_ENTITY_KINDS,
} from "@/lib/entityHref";
import { formatDateLabel } from "./utils";
import { pickLeadSignal } from "./utils";
import { trackEvent, EVENTS } from "@/lib/analytics";

interface Props {
  updates: any;
}

// Slug resolution for entity links (same as OpeningQuestion used)
function resolveSlugHref(slug: string): { href: string; index: string } | null {
  for (const kind of ALL_ENTITY_KINDS) {
    if (getEntityBySlug(kind, slug)) {
      return {
        href: `/${kindToRoutePrefix(kind)}/${slug}`,
        index: kindToIndexSlug(kind),
      };
    }
  }
  return null;
}

// Chevron SVG for <details> summary
function ChevronIcon() {
  return (
    <svg
      width="13" height="13" viewBox="0 0 13 13" fill="none"
      aria-hidden="true"
      className="motion-safe:transition-transform group-open:rotate-90 shrink-0"
    >
      <path d="M4.5 2.5l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function TodaysAnalysisSection({ updates }: Props) {
  const highlights: any[] = Array.isArray(updates.highlights) ? updates.highlights : [];
  const date: string = updates.date ?? "";

  // Phase 2: fire todays_analysis_view once when section is ≥50% visible
  const sectionRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || !date) return;
    let fired = false;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!fired && entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            fired = true;
            trackEvent(EVENTS.TODAYS_ANALYSIS_VIEW, { date });
            observer.disconnect();
          }
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [date]);

  // ITEM 7: Fallback to first two sentences of updates.summary when editorialInsight is absent
  const rawEditorialInsight: string | undefined =
    typeof updates.editorialInsight === "string" && updates.editorialInsight.trim()
      ? updates.editorialInsight
      : undefined;
  const editorialInsight: string | undefined = rawEditorialInsight ??
    (() => {
      const summary: string = typeof updates.summary === "string" ? updates.summary.trim() : "";
      if (!summary) return undefined;
      const sentences = summary.split(/(?<=[.!?])\s+/);
      const twoSentences = sentences.slice(0, 2).join(" ");
      return twoSentences || undefined;
    })();

  const oq = updates.dailyOpeningQuestion;
  const hasQuestion = oq && typeof oq.text === "string" && oq.text.length > 0;

  // ── HighCompassionContrast logic (folded) ──────────────────────────────────
  const topSignals: any[] = Array.isArray(updates.topSignals) ? updates.topSignals : [];
  const lead = pickLeadSignal(topSignals);
  const entityName: string = lead?.slug ?? "this entity";

  const responsibleAction: string | null = (() => {
    if (!lead) return null;
    if (lead.actionType === "methodology-evolution") {
      return (
        "Treat the published score as the lower-confidence reading and the " +
        "documented evidence pattern as the higher-confidence record. Use the " +
        "evidence trail for institutional decisions and watch the methodology " +
        "update for the formal scoring change in the next cycle."
      );
    }
    if (lead.actionType === "band-crossing-finding") {
      return (
        "Treat the band crossing as the published reading of record. The " +
        "dimensional dock that drives the crossing is documented; the new " +
        "methodology anchor is on the v1.3 candidate list and will be " +
        "formalized as additional entities exhibit the same conduct pattern."
      );
    }
    return null;
  })();

  const wouldImprove: string | null = (() => {
    if (!lead) return null;
    const cfwatches: any[] = Array.isArray(updates.carryForwardWatches) ? updates.carryForwardWatches : [];
    const watch = cfwatches.find((w: any) => w.slug === lead.slug);
    if (watch?.watch) return watch.watch;
    if (/sanctions|sanctions package|formalized/i.test(lead.description ?? "")) {
      return "Methodology category formalization followed by legislative or enforcement action that withdraws the underlying conduct. Documented reversal of the designated entity supply chain.";
    }
    return null;
  })();

  const wouldWorsen: string | null = (() => {
    if (!lead) return null;
    const risks: any[] = Array.isArray(updates.emergingRisks) ? updates.emergingRisks : [];
    const risk = risks.find(
      (r: any) =>
        Array.isArray(r.affectedEntities) && r.affectedEntities.includes(lead.slug),
    );
    if (risk?.description) {
      const parts = risk.description.split(/(?<=[.!?])\s+/);
      return parts.slice(0, 2).join(" ");
    }
    return null;
  })();

  const hasContrast = !!(responsibleAction || wouldImprove || wouldWorsen);

  // If there is absolutely nothing to show, return null
  if (!editorialInsight && highlights.length === 0 && !hasQuestion && !hasContrast) {
    return null;
  }

  // ── Question data (from OpeningQuestion) ────────────────────────────────────
  const questionText: string | undefined = hasQuestion ? oq.text : undefined;
  const tensionFraming: string | undefined = hasQuestion ? oq.tensionFraming : undefined;
  const themes: string[] = hasQuestion && Array.isArray(oq.themes) ? oq.themes : [];
  const tiedToEntities: string[] = hasQuestion && Array.isArray(oq.tiedToEntities)
    ? oq.tiedToEntities
    : [];

  return (
    <section ref={sectionRef} id="highlights" className="py-[30px] scroll-mt-24">
      <Container>
        <SectionHead
          title="Today's analysis"
          description={date ? `The most significant editorial findings in the ${formatDateLabel(date)} briefing.` : "Today's editorial findings."}
        />

        {/* Editorial insight lead paragraph (from BrutalInsightCard) */}
        {editorialInsight && (
          <div className="rounded-[16px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] px-5 py-4 mb-4">
            <div className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-muted mb-2">
              Editorial insight
            </div>
            <p className="text-[0.95rem] leading-relaxed text-text">
              {editorialInsight}
            </p>
          </div>
        )}

        {/* Numbered highlights cards */}
        {highlights.length > 0 && (
          <div className="grid grid-cols-1 gap-3">
            {highlights.map((h: any, i: number) => {
              const isObject = h !== null && typeof h === "object" && !Array.isArray(h);
              const claimText: string = isObject
                ? (h.claim ?? h.text ?? String(h))
                : typeof h === "string" ? h : String(h);
              const whyText: string | null = isObject
                ? (h.whyItMatters ?? h.relevance ?? null)
                : null;

              return (
                <div
                  key={i}
                  className="rounded-[20px] border border-[rgba(125,211,252,0.18)] bg-[rgba(125,211,252,0.05)] p-5"
                >
                  <div className="flex gap-3 items-start">
                    <span className="text-[0.78rem] font-bold text-accent shrink-0 mt-[3px] uppercase tracking-wider">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[0.95rem] leading-relaxed">{claimText}</p>
                      {whyText && (
                        <p className="text-[0.82rem] text-muted leading-relaxed mt-2">
                          <span className="text-[0.72rem] font-bold uppercase tracking-wider text-accent mr-1.5">
                            Why it matters
                          </span>
                          {whyText}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Today's question block (from OpeningQuestion) */}
        {questionText && (
          <div className="mt-4 rounded-[20px] border-t-2 border border-[rgba(125,211,252,0.35)] bg-[rgba(125,211,252,0.04)] p-6 sm:p-8"
            style={{ borderTopColor: "#7dd3fc" }}>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <div className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-[#7dd3fc]">
                Today&apos;s question
              </div>
              {themes.length > 0 && (
                <>
                  <span className="text-muted text-[0.78rem]">·</span>
                  <div className="flex flex-wrap gap-1.5">
                    {themes.map((theme: string, i: number) => (
                      <span
                        key={i}
                        className="text-[0.68rem] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border border-[rgba(125,211,252,0.28)] bg-[rgba(125,211,252,0.07)] text-[#7dd3fc]"
                      >
                        {theme}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
            {tensionFraming && (
              <p className="text-[0.88rem] text-muted italic mb-3 leading-relaxed">
                {tensionFraming}
              </p>
            )}
            <blockquote className="text-[1.3rem] sm:text-[1.5rem] font-medium leading-relaxed text-text max-w-3xl">
              &ldquo;{questionText}&rdquo;
            </blockquote>
            {tiedToEntities.length > 0 && (
              <div className="mt-5 flex flex-wrap items-center gap-1.5">
                <span className="text-[0.7rem] font-bold uppercase tracking-wider text-muted mr-1">
                  Related
                </span>
                {tiedToEntities.map((slug: string) => {
                  const resolved = resolveSlugHref(slug);
                  return resolved ? (
                    <TrackedEntityLink
                      key={slug}
                      href={resolved.href}
                      slug={slug}
                      index={resolved.index}
                      source="openingQuestion"
                      className="text-[0.78rem] font-semibold px-2.5 py-0.5 rounded-full border border-[rgba(125,211,252,0.32)] bg-[rgba(125,211,252,0.08)] text-[#7dd3fc] hover:border-[rgba(125,211,252,0.6)] transition-colors"
                    >
                      {slug}
                    </TrackedEntityLink>
                  ) : (
                    <span
                      key={slug}
                      className="text-[0.78rem] font-semibold px-2.5 py-0.5 rounded-full border border-[rgba(125,211,252,0.32)] bg-[rgba(125,211,252,0.08)] text-[#7dd3fc]"
                    >
                      {slug}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Compassion contrast <details> (from HighCompassionContrast) */}
        {hasContrast && (
          <details className="group mt-4 rounded-[16px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] overflow-hidden">
            <summary className={[
              "flex items-center gap-2 px-5 py-3.5",
              "cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden",
              "text-[0.82rem] font-semibold text-muted hover:text-text transition-colors",
            ].join(" ")}>
              <ChevronIcon />
              Compassion contrast — {entityName}
            </summary>
            <div className="border-t border-[rgba(255,255,255,0.08)] p-5 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {responsibleAction && (
                  <div>
                    <div className="text-[0.68rem] font-bold uppercase tracking-wider text-[#7dd3fc] mb-2">
                      Responsible action
                    </div>
                    <p className="text-[0.88rem] text-muted leading-relaxed">
                      {responsibleAction}
                    </p>
                  </div>
                )}
                {wouldImprove && (
                  <div>
                    <div className="text-[0.68rem] font-bold uppercase tracking-wider text-[#86efac] mb-2">
                      Would improve score
                    </div>
                    <p className="text-[0.88rem] text-muted leading-relaxed">
                      {wouldImprove}
                    </p>
                  </div>
                )}
                {wouldWorsen && (
                  <div>
                    <div className="text-[0.68rem] font-bold uppercase tracking-wider text-[#f87171] mb-2">
                      Would worsen score
                    </div>
                    <p className="text-[0.88rem] text-muted leading-relaxed">
                      {wouldWorsen}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </details>
        )}
      </Container>
    </section>
  );
}
