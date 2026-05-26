/**
 * Shared factory for all 7 per-kind entity history page routes.
 *
 * Each of:
 *   /country/[slug]/history
 *   /city/[slug]/history
 *   /company/[slug]/history
 *   /ai-lab/[slug]/history
 *   /robotics-lab/[slug]/history
 *   /us-city/[slug]/history
 *   /us-state/[slug]/history
 *
 * is a thin wrapper that calls makeHistoryPage(kind, entityHrefPrefix).
 * All logic lives here — the per-kind files are ~10 lines each.
 */
import type { Metadata } from "next";
import HistoryTimeline from "@/components/entity/HistoryTimeline";
import { getEntityHistory, getHistoryManifest } from "@/data/history";
import { type EntityKind, getAllSlugs } from "@/data/entities";

// Map EntityKind to the kind key used in HistoryManifest.byKind
const KIND_TO_MANIFEST_KEY: Record<EntityKind, keyof import("@/types/entity-history").HistoryManifest["byKind"]> = {
  company: "company",
  country: "country",
  "us-state": "us-state",
  "ai-lab": "ai-lab",
  "robotics-lab": "robotics-lab",
  city: "city",
  "us-city": "us-city",
};

/**
 * Factory for generateStaticParams — returns slug objects for all entities
 * of a given kind that have at least one history event.
 *
 * Fallback: if no history slugs exist for this kind yet (e.g. city kind has
 * no events in current briefings), fall back to all entity slugs from the
 * index so Next.js static export doesn't fail with an empty array. Pages for
 * entities with no events render the empty state via HistoryTimeline.
 */
export function makeHistoryGenerateStaticParams(kind: EntityKind) {
  return function generateStaticParams(): { slug: string }[] {
    const manifest = getHistoryManifest();
    const manifestKey = KIND_TO_MANIFEST_KEY[kind];
    const historySlug = manifest?.byKind[manifestKey] ?? [];
    if (historySlug.length > 0) {
      return historySlug.map((slug) => ({ slug }));
    }
    // Fallback: use entity registry slugs so the route generates valid static pages.
    return getAllSlugs(kind).map((slug) => ({ slug }));
  };
}

/**
 * Factory for generateMetadata.
 */
export function makeHistoryGenerateMetadata(kind: EntityKind, entityHrefPrefix: string) {
  return async function generateMetadata({
    params,
  }: {
    params: Promise<{ slug: string }>;
  }): Promise<Metadata> {
    const { slug } = await params;
    const history = getEntityHistory(slug);

    // Empty-state pages (entity has no history file OR zero events) get noindex.
    // These pages exist only to keep URLs stable under Next.js static export's
    // requirement that generateStaticParams never returns an empty array. They
    // contain no unique content worth indexing — search engines should skip.
    const isEmptyState = !history
      || (history.scoredEventCount === 0 && history.boundaryWatchCount === 0);

    if (!history) {
      return {
        title: "Score history not found",
        robots: { index: false, follow: true },
      };
    }

    const title = `${history.name} — Score History · Compassion Benchmark`;
    const description = history.scoredEventCount > 0
      ? `${history.name} has ${history.scoredEventCount} recorded score ${history.scoredEventCount === 1 ? "change" : "changes"} in the Compassion Benchmark. Current composite: ${history.currentComposite?.toFixed(1) ?? "N/A"} (${history.currentBand ?? "Unknown"} band).`
      : `${history.name} is monitored in the Compassion Benchmark daily research cycle. Current composite: ${history.currentComposite?.toFixed(1) ?? "N/A"} (${history.currentBand ?? "Unknown"} band).`;

    const canonical = `https://compassionbenchmark.com${entityHrefPrefix}/${slug}/history`;
    return {
      title,
      description,
      alternates: { canonical },
      openGraph: {
        type: "article",
        url: canonical,
        title,
        description,
      },
      // Empty-state pages get noindex to avoid SEO penalty from thin content.
      // Populated history pages remain fully indexable (default).
      ...(isEmptyState ? { robots: { index: false, follow: true } } : {}),
    };
  };
}

/**
 * Factory for the page component itself.
 */
export function makeHistoryPage(kind: EntityKind, entityHrefPrefix: string) {
  return async function HistoryPage({
    params,
  }: {
    params: Promise<{ slug: string }>;
  }) {
    void kind; // used for type safety at call sites

    const { slug } = await params;
    const history = getEntityHistory(slug);

    // If no history file exists (entity not yet in any briefing), show empty state
    // via a minimal stub rather than a 404 — keeps URLs stable under static export.
    const entityHref = `${entityHrefPrefix}/${slug}`;
    if (!history) {
      const stub = {
        slug,
        name: slug,
        kind,
        indexSlug: "",
        currentComposite: null,
        currentBand: null,
        currentRank: null,
        events: [],
        scoredEventCount: 0,
        boundaryWatchCount: 0,
        firstEventDate: null,
        lastEventDate: null,
        generatedAt: new Date().toISOString(),
      };
      return <HistoryTimeline history={stub} entityHref={entityHref} />;
    }

    return <HistoryTimeline history={history} entityHref={entityHref} />;
  };
}
