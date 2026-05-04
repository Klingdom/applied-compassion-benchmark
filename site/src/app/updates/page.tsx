import type { Metadata } from "next";
import updatesRaw from "@/data/updates/latest.json";
import manifest from "@/data/updates/manifest.json";
import DailyBriefing, { formatDateLabel } from "@/components/updates/DailyBriefing";

/* eslint-disable @typescript-eslint/no-explicit-any */
const updates = updatesRaw as any;

export const metadata: Metadata = {
  title: "Compassion Benchmark Daily Briefing",
  description:
    "Daily findings on how institutions recognize, respond to, and reduce suffering — scored across 1,155 entities, grounded in primary-source evidence. Published every weekday morning.",
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

  return (
    <>
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
