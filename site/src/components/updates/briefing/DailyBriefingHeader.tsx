/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * DailyBriefingHeader — Wave B rewrite.
 *
 * Replaces the 4-up pipeline KPI grid with an editorial above-the-fold block:
 *   - Stat of the Day (hero number + copy-citation)
 *   - Today in Brief (3-bullet scannable summary)
 *
 * Keeps: masthead, H1, one-sentence thesis, CTA cluster, date nav tabs.
 * Adds: one trust line ("N entities reviewed").
 * Removes: "Entities monitored / Fully assessed / Score changes / Risk signals".
 */

import Link from "next/link";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import StatOfTheDayCard from "./StatOfTheDay";
import TodayInBrief from "./TodayInBrief";
import { heroDateLabel, issueNumber, deriveStatOfTheDay, deriveTodayInBrief } from "./utils";

interface Props {
  updates: any;
  dateNav?: { date: string; label: string; isCurrent: boolean }[];
}

export default function DailyBriefingHeader({ updates, dateNav }: Props) {
  const dateStr: string = updates.date ?? "";
  const heroDate = dateStr ? heroDateLabel(dateStr) : "";
  const issueNo = dateStr ? issueNumber(dateStr) : 1;

  // One-sentence thesis: prefer updates.headline, truncate to first sentence.
  const rawHeadline: string = updates.headline ?? updates.summary ?? "";
  const thesis = rawHeadline
    ? rawHeadline.split(/(?<=[.!?])\s/)[0]
    : "Daily compassion intelligence across 1,160 indexed entities.";

  // Stat of the Day
  const stat = deriveStatOfTheDay(updates);

  // Today in Brief bullets
  const briefItems = deriveTodayInBrief(updates);

  // Trust line: prefer pipeline count, fall back to known total
  const pipeline = updates.pipeline ?? {};
  const entityCount: string =
    pipeline.entitiesScanned?.toLocaleString() ?? "1,160";

  // Build the canonical page URL for citation (static: no runtime window needed)
  const pageUrl = dateStr
    ? `https://compassionbenchmark.com/updates/${dateStr}`
    : "https://compassionbenchmark.com/updates";

  return (
    <section
      id="brief"
      className="pt-[72px] pb-8 relative overflow-hidden scroll-mt-0"
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
            className="flex flex-wrap gap-2 mb-8"
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

        {/* Masthead */}
        <div className="flex items-baseline gap-3 mb-5 flex-wrap">
          <span className="text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[#7dd3fc]">
            Compassion Benchmark
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

        <h1 className="text-[clamp(2.4rem,5.5vw,4.4rem)] leading-[1.02] tracking-[-0.035em] mb-4 font-bold">
          Daily Briefing
        </h1>

        {/* One-sentence thesis */}
        <p className="text-text text-[1.08rem] sm:text-[1.15rem] leading-snug max-w-[820px] mb-6 font-medium border-l-2 border-[rgba(125,211,252,0.4)] pl-4">
          {thesis}
        </p>

        {/* CTA cluster */}
        <div className="flex gap-3 flex-wrap mb-8">
          <Button href="#lead-signal" variant="primary">
            Read today&apos;s brief
          </Button>
          <Button href="#subscribe">Subscribe</Button>
          <Button href="/methodology">View methodology</Button>
          <Button href="/indexes">Explore indexes</Button>
        </div>

        {/* Above-the-fold editorial block: Stat of the Day + Today in Brief */}
        {(stat || briefItems.length > 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Stat of the Day */}
            {stat ? (
              <StatOfTheDayCard stat={stat} date={heroDate} pageUrl={pageUrl} />
            ) : (
              // Placeholder keeps grid balanced when stat is missing
              <div className="rounded-[18px] border border-line bg-[rgba(255,255,255,0.015)] p-5 sm:p-6 flex items-center justify-center min-h-[120px]">
                <span className="text-muted text-[0.85rem]">
                  No scored movement today
                </span>
              </div>
            )}

            {/* Today in Brief */}
            {briefItems.length > 0 ? (
              <TodayInBrief items={briefItems} />
            ) : (
              <div className="rounded-[18px] border border-line bg-[rgba(255,255,255,0.015)] p-5 sm:p-6 flex items-center justify-center min-h-[120px]">
                <span className="text-muted text-[0.85rem]">
                  Summary not available
                </span>
              </div>
            )}
          </div>
        )}

        {/* Trust line */}
        <p className="text-[0.78rem] text-muted mt-4">
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
