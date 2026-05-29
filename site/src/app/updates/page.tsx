import type { Metadata } from "next";
import Link from "next/link";
import updatesRaw from "@/data/updates/latest.json";
import manifest from "@/data/updates/manifest.json";
import DailyBriefing, { formatDateLabel } from "@/components/updates/DailyBriefing";
import Container from "@/components/ui/Container";

/* eslint-disable @typescript-eslint/no-explicit-any */
const updates = updatesRaw as any;

// Derive OG content from the latest briefing at build time.
const _latestLeadHeadline: string =
  updates.scoreChanges?.[0]?.headline ??
  updates.topSignals?.[0]?.title ??
  updates.headline ??
  "Compassion Benchmark Daily Briefing";

const _latestSummaryFirst: string = (() => {
  const s: string = updates.summary ?? "";
  const first = s.split(/(?<=[.!?])\s+/)[0] ?? "";
  return first.length > 20
    ? first
    : "Daily findings on how institutions recognize, respond to, and reduce suffering — scored across 1,155 entities, grounded in primary-source evidence.";
})();

const _ogTitle = _latestLeadHeadline.length > 120
  ? _latestLeadHeadline.slice(0, 117) + "…"
  : _latestLeadHeadline;
const _ogDesc = _latestSummaryFirst.length > 200
  ? _latestSummaryFirst.slice(0, 197) + "…"
  : _latestSummaryFirst;

export const metadata: Metadata = {
  title: "Compassion Benchmark Daily Briefing",
  description:
    "Daily findings on how institutions recognize, respond to, and reduce suffering — scored across 1,155 entities, grounded in primary-source evidence. Published every weekday morning.",
  alternates: {
    canonical: "https://compassionbenchmark.com/updates",
    types: {
      "application/rss+xml": "https://compassionbenchmark.com/updates/feed.xml",
      "application/feed+json": "https://compassionbenchmark.com/updates/feed.json",
    },
  },
  openGraph: {
    title: _ogTitle,
    description: _ogDesc,
    url: "https://compassionbenchmark.com/updates",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: _ogTitle,
    description: _ogDesc,
  },
};

export default function UpdatesPage() {
  // Show last 5 available dates; latest is always current on this page.
  const latestDate = manifest.latest;
  const visibleDates = manifest.dates.slice(0, 5);

  const dateNav = visibleDates.map((date) => ({
    date,
    label: formatDateLabel(date),
    isCurrent: date === latestDate,
  }));

  const totalBriefings = manifest.dates.length;

  return (
    <>
      {/* Archive discovery link — right-aligned beside the date tabs */}
      <div className="border-b border-line bg-[rgba(255,255,255,0.02)]">
        <Container>
          <div className="flex items-center justify-end py-2">
            <Link
              href="/updates/archive"
              className="inline-flex items-center gap-1.5 text-[0.82rem] text-[#7dd3fc] hover:text-text transition-colors font-medium"
            >
              Browse all {totalBriefings} briefings
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2.5 6h7M6 2.5L9.5 6 6 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </Container>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            headline:
              updates.scoreChanges?.[0]?.headline ??
              `Compassion Benchmark Daily Briefing — ${updates.date}`,
            datePublished: updates.date,
            dateModified: updates.generatedAt,
            author: {
              "@type": "Organization",
              name: "Compassion Benchmark",
              url: "https://compassionbenchmark.com",
            },
            publisher: {
              "@type": "Organization",
              name: "Compassion Benchmark",
              url: "https://compassionbenchmark.com",
            },
            description: `Compassion Benchmark daily intelligence for ${formatDateLabel(updates.date)}: score movements, sector signals, and evidence-linked findings across ${updates.pipeline?.entitiesScanned?.toLocaleString() || "1,155"} entities.`,
            mainEntityOfPage: `https://compassionbenchmark.com/updates`,
          }),
        }}
      />
      <DailyBriefing updates={updates} showNewsletter dateNav={dateNav} />
    </>
  );
}
