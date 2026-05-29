import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import manifest from "@/data/updates/manifest.json";
import { getDailyData } from "@/data/updates/daily/index";
import DailyBriefing, { formatDateLabel } from "@/components/updates/DailyBriefing";
import Container from "@/components/ui/Container";

/* eslint-disable @typescript-eslint/no-explicit-any */

// Tell Next.js which date pages to generate at build time.
export function generateStaticParams() {
  return manifest.dates.map((date: string) => ({ date }));
}

// Generate per-page metadata from the date param.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ date: string }>;
}): Promise<Metadata> {
  const { date } = await params;
  const label = formatDateLabel(date);

  // Load briefing data to derive OG/Twitter content from actual findings.
  // getDailyData is memoized by Next.js across generateMetadata + page render.
  const updates = await getDailyData(date) as any;

  // Derive the most informative lead headline available for OG tags.
  const leadHeadline: string =
    updates?.scoreChanges?.[0]?.headline ??
    updates?.topSignals?.[0]?.title ??
    updates?.headline ??
    `Compassion Benchmark Daily Briefing — ${label}`;

  // Derive a description: first sentence of summary, or fallback to lead.
  const summaryText: string = updates?.summary ?? "";
  const firstSentence = summaryText.split(/(?<=[.!?])\s+/)[0] ?? "";
  const ogDescription: string = firstSentence.length > 20
    ? firstSentence
    : `Daily intelligence for ${label}: score movements, sector signals, and evidence-linked analysis across 1,155 entities.`;

  // Truncate to reasonable OG lengths
  const ogTitle = leadHeadline.length > 120
    ? leadHeadline.slice(0, 117) + "…"
    : leadHeadline;
  const ogDesc = ogDescription.length > 200
    ? ogDescription.slice(0, 197) + "…"
    : ogDescription;

  const canonicalUrl = `https://compassionbenchmark.com/updates/${date}`;

  return {
    title: `Compassion Benchmark Daily Briefing — ${label}`,
    description: `Compassion Benchmark daily intelligence for ${label}: top findings, score movements, sector signals, and evidence-linked analysis across 1,155 entities.`,
    alternates: {
      canonical: canonicalUrl,
      types: {
        "application/rss+xml": "https://compassionbenchmark.com/updates/feed.xml",
        "application/feed+json": "https://compassionbenchmark.com/updates/feed.json",
      },
    },
    openGraph: {
      title: ogTitle,
      description: ogDesc,
      url: canonicalUrl,
      type: "article",
      publishedTime: updates?.date ?? date,
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDesc,
    },
  };
}

export default async function DateBriefingPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;

  // Validate the date exists in the manifest (guards against direct URL access)
  if (!manifest.dates.includes(date)) {
    notFound();
  }

  const updates = await getDailyData(date);
  if (!updates) {
    notFound();
  }

  const u = updates as any;

  // Build date navigation — show up to 5 dates, mark the viewed date as current
  const visibleDates = manifest.dates.slice(0, 5);
  const dateNav = visibleDates.map((d) => ({
    date: d,
    label: formatDateLabel(d),
    // On archive pages the latest date links back to /updates, not /updates/[date]
    isCurrent: d === date,
  }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            headline:
              u.scoreChanges?.[0]?.headline ??
              `Compassion Benchmark Daily Briefing — ${date}`,
            datePublished: u.date ?? date,
            dateModified: u.generatedAt ?? date,
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
            description: `Compassion Benchmark daily intelligence for ${formatDateLabel(date)}: score movements, sector signals, and evidence-linked findings across ${u.pipeline?.entitiesScanned?.toLocaleString() || "1,155"} entities.`,
            mainEntityOfPage: `https://compassionbenchmark.com/updates/${date}`,
          }),
        }}
      />

      {/* Archive banner: back-to-latest + browse archive links */}
      {date !== manifest.latest && (
        <div data-pagefind-ignore className="bg-[rgba(125,211,252,0.06)] border-b border-line">
          <Container>
            <div className="flex items-center justify-between gap-4 py-3 flex-wrap">
              <p className="text-[0.88rem] text-muted">
                Viewing archive:{" "}
                <span className="text-text font-semibold">{formatDateLabel(date)}</span>
              </p>
              <div className="flex items-center gap-4 flex-wrap">
                <Link
                  href="/updates"
                  className="inline-flex items-center gap-1.5 text-[0.88rem] text-[#7dd3fc] hover:text-text transition-colors font-medium"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Back to latest
                </Link>
                <span className="text-muted text-[0.78rem]" aria-hidden="true">·</span>
                <Link
                  href="/updates/archive"
                  className="inline-flex items-center gap-1.5 text-[0.88rem] text-[#7dd3fc] hover:text-text transition-colors font-medium"
                >
                  Browse all briefings
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </div>
            </div>
          </Container>
        </div>
      )}

      {/*
        Pagefind indexing wrapper.
        data-pagefind-body: Pagefind indexes only the content inside this element.
        data-pagefind-meta: custom metadata fields surfaced in search results.
        See: https://pagefind.app/docs/metadata/

        Independence policy: this is entirely build-time static HTML.
        No search queries are transmitted to any third party — Pagefind runs
        entirely client-side using sharded index files served under /_pagefind/*.
      */}
      <div
        data-pagefind-body
        data-pagefind-meta={`date:${u.date ?? date},top-entities:${
          Array.isArray(u.topSignals)
            ? u.topSignals
                .slice(0, 5)
                .map((s: { title?: string; slug?: string }) => s.title ?? s.slug ?? "")
                .join("|")
            : ""
        },score-changes-count:${u.pipeline?.scoreChanges ?? 0},methodology-novel:${
          (u.pipeline?.methodologyRulingsEstablished ?? 0) > 0 ? "true" : "false"
        }`}
      >
        <DailyBriefing
          updates={u}
          showNewsletter
          dateNav={dateNav}
        />
      </div>
    </>
  );
}
