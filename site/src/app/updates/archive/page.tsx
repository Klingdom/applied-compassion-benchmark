import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/ui/Container";
import ArchiveList from "@/components/updates/ArchiveList";
import {
  getArchiveIndex,
  getArchiveDateRange,
} from "@/data/updates/archiveIndex";
import manifest from "@/data/updates/manifest.json";

export const metadata: Metadata = {
  title: "Daily Research Archive — Compassion Benchmark",
  description:
    "Every Compassion Benchmark daily briefing — 42 days of evidence-linked institutional findings across 1,155 entities.",
  alternates: {
    canonical: "https://compassionbenchmark.com/updates/archive",
    types: {
      "application/rss+xml": "https://compassionbenchmark.com/updates/feed.xml",
      "application/feed+json": "https://compassionbenchmark.com/updates/feed.json",
    },
  },
};

export default function ArchivePage() {
  const entries = getArchiveIndex();
  const { earliest, latest } = getArchiveDateRange(entries);
  const briefingCount = entries.length;

  // Temporal coverage for JSON-LD: first and last date in manifest
  const sortedDates = [...manifest.dates].sort();
  const firstDate = sortedDates[0] ?? "";
  const lastDate = sortedDates[sortedDates.length - 1] ?? "";

  return (
    <>
      {/* JSON-LD: Dataset schema for Google Dataset Search */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Dataset",
            name: "Compassion Benchmark Daily Research Archive",
            description:
              "Daily evidence-linked findings on how institutions recognize, respond to, and reduce suffering, scored across 1,155 entities.",
            url: "https://compassionbenchmark.com/updates/archive",
            creator: {
              "@type": "Organization",
              name: "Compassion Benchmark",
              url: "https://compassionbenchmark.com",
            },
            temporalCoverage: `${firstDate}/${lastDate}`,
            distribution: [
              {
                "@type": "DataDownload",
                encodingFormat: "application/rss+xml",
                contentUrl:
                  "https://compassionbenchmark.com/updates/feed.xml",
              },
              {
                "@type": "DataDownload",
                encodingFormat: "application/json",
                contentUrl:
                  "https://compassionbenchmark.com/updates/feed.json",
              },
            ],
          }),
        }}
      />

      {/* Page header */}
      <section className="pt-[72px] pb-8 relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at top, rgba(125,211,252,0.06) 0%, rgba(125,211,252,0) 60%)",
          }}
        />
        <Container className="relative">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 mb-6 text-[0.82rem] text-muted">
            <Link
              href="/updates"
              className="hover:text-text transition-colors"
            >
              Daily Briefing
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-text font-medium">Archive</span>
          </nav>

          <div className="flex items-baseline gap-3 mb-4 flex-wrap">
            <span className="text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[#7dd3fc]">
              Compassion Benchmark
            </span>
          </div>

          <h1 className="text-[clamp(2rem,5vw,3.6rem)] leading-[1.05] tracking-[-0.03em] mb-4 font-bold">
            Daily Research Archive
          </h1>

          <p className="text-muted text-[1rem] sm:text-[1.08rem] mb-2">
            {briefingCount} briefings{" "}
            {earliest && latest && (
              <>
                ·{" "}
                <span className="text-text font-medium">
                  {earliest} – {latest}
                </span>
              </>
            )}
          </p>

          <p className="text-muted text-[0.9rem] max-w-[640px] mb-8">
            Every daily briefing published by Compassion Benchmark. Each entry
            represents a complete nightly assessment cycle — formal score
            changes, boundary-watch monitoring, and methodology rulings — across{" "}
            1,155 indexed institutions.
          </p>

          {/* Back link */}
          <Link
            href="/updates"
            className="inline-flex items-center gap-1.5 text-[0.88rem] text-[#7dd3fc] hover:text-text font-medium transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path
                d="M9 2L4 7l5 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back to latest briefing
          </Link>
        </Container>
      </section>

      {/* Archive list with filters */}
      <div className="border-t border-line">
        <Container className="px-0">
          <ArchiveList entries={entries} />
        </Container>
      </div>
    </>
  );
}
