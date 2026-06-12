import type { Metadata } from "next";
import { notFound } from "next/navigation";
import EntityDetail from "./EntityDetail";
import type { IndexBandEntry } from "./EntityDetail";
import {
  EntityKind,
  KIND_CONFIG,
  getEntityBySlug,
  getAllSlugs,
  getAllEntities,
} from "@/data/entities";
import { getLatestChange } from "@/data/updates/entityChanges";
import {
  getLatestEvidenceReview,
  getLookbackWindowDays,
} from "@/data/evidence-reviews";
import { hasEntityHistory, getEntityHistory } from "@/data/history";
import type { EntityEvidenceCardProps } from "@/components/entity/EntityEvidenceCard";
import type { HistoryEvent } from "@/types/entity-history";
import { DIMENSIONS } from "@/data/dimensions";

// ── Index meta: medianScore + bands by index slug ─────────────────────────────
// Import index JSONs to extract meta at build time (same pattern as entities.ts).
// Type-only import of meta fields we need; cast once here.

import fortune500 from "@/data/indexes/fortune-500.json";
import countries from "@/data/indexes/countries.json";
import usStates from "@/data/indexes/us-states.json";
import aiLabs from "@/data/indexes/ai-labs.json";
import roboticsLabs from "@/data/indexes/robotics-labs.json";
import globalCities from "@/data/indexes/global-cities.json";
import usCities from "@/data/indexes/us-cities.json";

interface IndexMetaSlim {
  medianScore?: number;
  bands?: Array<{ band: string; count: number; percentage: number }>;
}

const INDEX_META: Record<string, IndexMetaSlim> = {
  "fortune-500":   fortune500.meta   as IndexMetaSlim,
  "countries":     countries.meta    as IndexMetaSlim,
  "us-states":     usStates.meta     as IndexMetaSlim,
  "ai-labs":       aiLabs.meta       as IndexMetaSlim,
  "robotics-labs": roboticsLabs.meta as IndexMetaSlim,
  "global-cities": globalCities.meta as IndexMetaSlim,
  "us-cities":     usCities.meta     as IndexMetaSlim,
};

// ── Cohort field mapping per index slug (#9) ──────────────────────────────────
// Fortune 500 → sector; countries/us-states/us-cities/global-cities → region;
// ai-labs → sector; robotics-labs → category. us-states has no useful cohort.
const COHORT_FIELD: Record<string, string> = {
  "fortune-500":   "sector",
  "countries":     "region",
  "us-states":     "region",
  "ai-labs":       "sector",
  "robotics-labs": "category",
  "global-cities": "region",
  "us-cities":     "region",
};

// ─────────────────────────────────────────────────────────────────────────────

const SITE_URL = "https://compassionbenchmark.com";

/** Shared static params generator — returns every slug for the given kind. */
export function makeGenerateStaticParams(kind: EntityKind) {
  return function generateStaticParams() {
    return getAllSlugs(kind).map((slug) => ({ slug }));
  };
}

/** Shared metadata generator — produces SEO tags from the entity record. */
export function makeGenerateMetadata(kind: EntityKind) {
  return async function generateMetadata({
    params,
  }: {
    params: Promise<{ slug: string }>;
  }): Promise<Metadata> {
    const { slug } = await params;
    const entity = getEntityBySlug(kind, slug);
    if (!entity) return { title: "Entity not found" };
    const config = KIND_CONFIG[kind];

    const title = `${entity.name} — Compassion Score ${entity.composite.toFixed(1)} (${entity.band})`;
    const description = `${entity.name} ranks #${entity.rank} of ${entity.indexTotal} in the 2026 ${config.indexLabel} with a composite compassion score of ${entity.composite.toFixed(1)} out of 100 (band: ${entity.band}). See all 8 dimension scores, latest research updates, and sector comparisons.`;

    const canonical = `${SITE_URL}/${config.route}/${entity.slug}`;
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
      twitter: {
        card: "summary",
        title,
        description,
      },
    };
  };
}

/** Shared page renderer. */
export function makeEntityPage(kind: EntityKind) {
  return async function EntityPage({
    params,
  }: {
    params: Promise<{ slug: string }>;
  }) {
    const { slug } = await params;
    const entity = getEntityBySlug(kind, slug);
    if (!entity) notFound();

    const config = KIND_CONFIG[kind];
    const latestChange = await getLatestChange(config.indexSlug, entity.slug);
    const evidenceReview = getLatestEvidenceReview(config.indexSlug, entity.slug);
    const lookbackWindowDays = getLookbackWindowDays();
    const historyHref = hasEntityHistory(entity.slug)
      ? `/${config.route}/${entity.slug}/history`
      : null;

    // ── EntityEvidenceCard data ───────────────────────────────────────────
    // Read from the prebuild-generated per-entity history JSON. Both the score
    // (from indexes/) and this evidence data come from the same build pass,
    // satisfying PRD §6.3 build-sync requirement.
    const history = getEntityHistory(entity.slug);
    let evidenceCardProps: EntityEvidenceCardProps | null = null;

    if (history && historyHref) {
      // Compute activeBoundaryWatch: the most recent event is a boundary-watch
      // AND no subsequent scored event has resolved it. Since events[] is newest-first,
      // events[0] being boundary-watch means the watch is still active.
      let activeBoundaryWatch: HistoryEvent | null = null;
      if (history.events.length > 0 && history.events[0].type === "boundary-watch") {
        activeBoundaryWatch = history.events[0];
      }

      evidenceCardProps = {
        latestScoreChange: history.latestScoreChange,
        methodologyRulings: history.methodologyRulings,
        daysSinceLastChange: history.daysSinceLastChange,
        tierCounts: history.tierCounts,
        totalEventCount: history.totalEventCount,
        events: history.events,
        historyHref,
        activeBoundaryWatch,
      };
    }

    // ── Per-kind schema.org type map ─────────────────────────────────────
    // Engines need the correct semantic type to bind our score to the right
    // real-world entity class (Country, City, etc. vs generic Organization).
    const KIND_SCHEMA_TYPE: Record<string, string> = {
      company:        "Organization",
      country:        "Country",
      "us-state":     "AdministrativeArea",
      "ai-lab":       "Organization",
      "robotics-lab": "Organization",
      city:           "City",
      "us-city":      "City",
    };
    const itemReviewedType = KIND_SCHEMA_TYPE[kind] ?? "Organization";

    // ── dateModified: prefer latest history/evidence-review date ─────────
    // Freshness signal for answer engines; fall back to publication date.
    let dateModified = "2026-01-01";
    if (history?.latestScoreChange?.date) {
      dateModified = history.latestScoreChange.date;
    } else if (evidenceReview?.reviewed_at) {
      dateModified = evidenceReview.reviewed_at;
    }

    // ── itemReviewed: sameAs and url only when identifiers are present ───
    // NEVER fabricate sameAs/url — only emit when verified identifiers exist.
    // The identifiers field is intentionally empty at launch; seeding is a
    // separate founder/enrichment task once a verified registry is established.
    const identifiers = entity.identifiers;
    const sameAs: string[] = [];
    if (identifiers?.wikipedia) sameAs.push(identifiers.wikipedia);
    if (identifiers?.wikidata) sameAs.push(identifiers.wikidata);

    const itemReviewed: Record<string, unknown> = {
      "@type": itemReviewedType,
      name: entity.name,
      ...(identifiers?.officialSite ? { url: identifiers.officialSite } : {}),
      ...(sameAs.length > 0 ? { sameAs } : {}),
    };

    // ── ratingExplanation from the most recent scored event ──────────────
    const latestHeadline = history?.latestScoreChange?.headline ?? null;
    const ratingExplanation = `Composite compassion score ${entity.composite.toFixed(1)}/100 (${entity.band}), rank ${entity.rank} of ${entity.indexTotal} in the ${config.indexLabel}.`;

    const jsonLd: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "Review",
      itemReviewed,
      author: {
        "@type": "Organization",
        name: "Compassion Benchmark",
        url: SITE_URL,
      },
      publisher: {
        "@type": "Organization",
        name: "Compassion Benchmark",
        url: SITE_URL,
      },
      datePublished: "2026-01-01",
      dateModified,
      reviewAspect: "Institutional compassion",
      reviewRating: {
        "@type": "Rating",
        ratingValue: entity.composite,
        bestRating: 100,
        worstRating: 0,
        ratingExplanation: latestHeadline ?? ratingExplanation,
      },
      isBasedOn: `${SITE_URL}/methodology`,
    };

    // ── Wave E1: index meta for hero band-position strip + distribution ─────
    const indexMeta = INDEX_META[config.indexSlug] ?? {};
    const medianScore = typeof indexMeta.medianScore === "number" ? indexMeta.medianScore : null;
    const indexBands: IndexBandEntry[] | null = Array.isArray(indexMeta.bands)
      ? (indexMeta.bands as IndexBandEntry[])
      : null;

    // ── Wave E1: history events for sparkline / trend caption ───────────────
    const historyEvents: HistoryEvent[] | null = history ? history.events : null;
    const totalEventCount: number | null = history ? history.totalEventCount : null;
    const firstEventDate: string | null = history ? (history.firstEventDate ?? null) : null;
    const latestScoreChangeEvent: HistoryEvent | null = history
      ? (history.latestScoreChange ?? null)
      : null;

    // ── Wave 2 #9: Cohort percentile computation ─────────────────────────────
    // Pull cohort field for this index, filter peer entities, rank by composite.
    const cohortField = COHORT_FIELD[config.indexSlug] ?? null;
    const cohortValue = cohortField ? (entity.metadata[cohortField] as string | undefined) ?? null : null;

    let cohortStats: {
      label: string;
      cohortRank: number;
      cohortSize: number;
      percentile: number;
      peers: number[]; // sorted composite scores, lowest first, for rug
    } | null = null;

    if (cohortField && cohortValue) {
      const allEntities = getAllEntities(kind);
      const peers = allEntities.filter(
        (e) => (e.metadata[cohortField] as string | undefined) === cohortValue,
      );
      // Sort descending by composite for rank computation
      const sorted = [...peers].sort((a, b) => b.composite - a.composite);
      const cohortRank = sorted.findIndex((e) => e.slug === entity.slug) + 1;
      const cohortSize = peers.length;
      // topPct: rank 1 of N → ~(1/N*100) ≈ top; rank N of N → 100% (bottom).
      // Rank 1 is the HIGHEST composite (best). So rank/cohortSize gives a
      // fraction where small = genuinely top, large = genuinely bottom.
      const percentile = cohortSize > 0
        ? Math.round((cohortRank / cohortSize) * 100)
        : 0;
      // Peer composites sorted lowest→highest for rug rendering
      const peerComposites = sorted.map((e) => e.composite).sort((a, b) => a - b);

      if (cohortSize >= 1 && cohortRank >= 1) {
        cohortStats = {
          label: cohortValue,
          cohortRank,
          cohortSize,
          percentile,
          peers: peerComposites,
        };
      }
    }

    // ── Wave 2 #13: Dimension means across index ─────────────────────────────
    // Compute the mean score for each dimension across all entities in this index.
    const allEntitiesForMeans = getAllEntities(kind);
    const dimMeans: Record<string, number> = {};
    for (const dim of DIMENSIONS) {
      const vals = allEntitiesForMeans
        .map((e) => e.scores[dim.code])
        .filter((v): v is number => typeof v === "number");
      dimMeans[dim.code] = vals.length > 0
        ? vals.reduce((a, b) => a + b, 0) / vals.length
        : 0;
    }

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <EntityDetail
          entity={entity}
          latestChange={latestChange}
          evidenceReview={evidenceReview}
          lookbackWindowDays={lookbackWindowDays}
          historyHref={historyHref}
          evidenceCardProps={evidenceCardProps}
          medianScore={medianScore}
          indexBands={indexBands}
          historyEvents={historyEvents}
          totalEventCount={totalEventCount}
          firstEventDate={firstEventDate}
          latestScoreChangeEvent={latestScoreChangeEvent}
          cohortStats={cohortStats}
          dimMeans={dimMeans}
        />
      </>
    );
  };
}
