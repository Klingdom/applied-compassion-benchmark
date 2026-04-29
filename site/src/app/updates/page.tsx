import type { Metadata } from "next";
import updatesRaw from "@/data/updates/latest.json";
import manifest from "@/data/updates/manifest.json";
import DailyBriefing, { formatDateLabel } from "@/components/updates/DailyBriefing";

/* eslint-disable @typescript-eslint/no-explicit-any */
const updates = updatesRaw as any;

export const metadata: Metadata = {
  title: "ACB Daily Briefing",
  description:
    "Daily intelligence on AI, institutions, power systems, and measurable human impact. Score changes, sector signals, emerging risks, and evidence-linked insights across 1,155 entities — published every weekday morning.",
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
            headline: `ACB Daily Briefing — ${updates.date}`,
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
            description: `Evidence-linked score assessments from overnight research: ${updates.pipeline?.proposalsGenerated || 0} score changes, ${updates.pipeline?.confirmations || 0} confirmations across ${updates.pipeline?.entitiesScanned?.toLocaleString() || "1,155"} entities.`,
            mainEntityOfPage: `https://compassionbenchmark.com/updates`,
          }),
        }}
      />
      <DailyBriefing updates={updates} showNewsletter dateNav={dateNav} />
    </>
  );
}
