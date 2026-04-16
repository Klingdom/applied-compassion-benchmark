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
  return {
    title: `Daily Evidence Briefing — ${label}`,
    description: `Compassion benchmark research findings for ${label}: score changes, sector trends, emerging risks, and evidence-linked insights across 1,155 entities.`,
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
      {/* Archive banner: back-to-latest link */}
      {date !== manifest.latest && (
        <div className="bg-[rgba(125,211,252,0.06)] border-b border-line">
          <Container>
            <div className="flex items-center justify-between gap-4 py-3 flex-wrap">
              <p className="text-[0.88rem] text-muted">
                Viewing archive:{" "}
                <span className="text-text font-semibold">{formatDateLabel(date)}</span>
              </p>
              <Link
                href="/updates"
                className="inline-flex items-center gap-1.5 text-[0.88rem] text-[#7dd3fc] hover:text-text transition-colors font-medium"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Back to latest
              </Link>
            </div>
          </Container>
        </div>
      )}

      <DailyBriefing
        updates={updates as any}
        showNewsletter
        dateNav={dateNav}
      />
    </>
  );
}
