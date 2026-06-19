import type { Metadata } from "next";
import { notFound } from "next/navigation";
import EntityDetail from "./EntityDetail";
import type { IndexBandEntry, PeerChip } from "./EntityDetail";
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
import BreadcrumbJsonLd, { breadcrumbUrl } from "@/components/seo/BreadcrumbJsonLd";
import FaqJsonLd from "@/components/seo/FaqJsonLd";
import FaqAccordion from "@/components/seo/FaqAccordion";
import Container from "@/components/ui/Container";
import { entityHrefByKind } from "@/lib/entityHref";

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
import universitiesJson from "@/data/indexes/universities.json";

interface IndexMetaSlim {
  medianScore?: number;
  bands?: Array<{ band: string; count: number; percentage: number }>;
}

const INDEX_META: Record<string, IndexMetaSlim> = {
  "fortune-500":   fortune500.meta      as IndexMetaSlim,
  "countries":     countries.meta       as IndexMetaSlim,
  "us-states":     usStates.meta        as IndexMetaSlim,
  "ai-labs":       aiLabs.meta          as IndexMetaSlim,
  "robotics-labs": roboticsLabs.meta    as IndexMetaSlim,
  "global-cities": globalCities.meta    as IndexMetaSlim,
  "us-cities":     usCities.meta        as IndexMetaSlim,
  "universities":  universitiesJson.meta as IndexMetaSlim,
};

// ── Cohort field mapping per index slug (#9) ──────────────────────────────────
// Fortune 500 → sector; countries/us-states/us-cities/global-cities → region;
// ai-labs → sector; robotics-labs → category. us-states has no useful cohort.
// universities → type (Public Research / private / etc. — most meaningful peer grouping).
const COHORT_FIELD: Record<string, string> = {
  "fortune-500":   "sector",
  "countries":     "region",
  "us-states":     "region",
  "ai-labs":       "sector",
  "robotics-labs": "category",
  "global-cities": "region",
  "us-cities":     "region",
  "universities":  "type",
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
      university:     "CollegeOrUniversity",
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

    // ── Wave G1.1: peer/neighbour discovery data ──────────────────────────────
    // All peers come from getAllEntities — same data used to build the page,
    // so slugs and composite values are always consistent.

    const allEntities = getAllEntities(kind);
    // Sort descending by composite — mirrors the index rankings order.
    const indexSorted = [...allEntities].sort((a, b) => a.rank - b.rank);

    /** Convert an entity to a PeerChip. */
    function toPeerChip(e: (typeof indexSorted)[0]): PeerChip {
      return {
        name: e.name,
        slug: e.slug,
        composite: e.composite,
        band: e.band,
        href: entityHrefByKind(kind, e.slug),
        rank: e.rank,
      };
    }

    // Closest cohort peers: same sector/region/category, sorted by |composite - entity.composite|.
    let cohortPeers: PeerChip[] | null = null;
    const peerCohortField = COHORT_FIELD[config.indexSlug] ?? null;
    const peerCohortValue = peerCohortField
      ? (entity.metadata[peerCohortField] as string | undefined) ?? null
      : null;

    if (peerCohortField && peerCohortValue) {
      const cohortSameEntities = allEntities.filter(
        (e) =>
          e.slug !== entity.slug &&
          (e.metadata[peerCohortField] as string | undefined) === peerCohortValue,
      );
      // Sort ascending by distance to entity composite (closest first)
      const sorted = [...cohortSameEntities].sort(
        (a, b) =>
          Math.abs(a.composite - entity.composite) -
          Math.abs(b.composite - entity.composite),
      );
      const closest = sorted.slice(0, 5);
      // Only show block when there are ≥3 distinct peers (not counting entity itself)
      cohortPeers = closest.length >= 3 ? closest.map(toPeerChip) : null;
    }

    // Rank neighbours: entities at rank ±1 and ±2 in the index.
    const entityIdxInSorted = indexSorted.findIndex((e) => e.slug === entity.slug);
    let rankNeighbours: PeerChip[] | null = null;
    if (entityIdxInSorted !== -1) {
      const neighbourCandidates: typeof indexSorted = [];
      for (const offset of [-2, -1, 1, 2]) {
        const idx = entityIdxInSorted + offset;
        if (idx >= 0 && idx < indexSorted.length) {
          neighbourCandidates.push(indexSorted[idx]);
        }
      }
      rankNeighbours =
        neighbourCandidates.length > 0
          ? neighbourCandidates.map(toPeerChip)
          : null;
    }

    // Index top & floor: first and last in ranked order.
    // Exclude entity itself if it IS the top or floor.
    const indexTopEntity = indexSorted[0];
    const indexFloorEntity = indexSorted[indexSorted.length - 1];
    const indexTopAndFloor = {
      top:
        indexTopEntity && indexTopEntity.slug !== entity.slug
          ? toPeerChip(indexTopEntity)
          : null,
      floor:
        indexFloorEntity &&
        indexFloorEntity.slug !== entity.slug &&
        indexFloorEntity.slug !== indexTopEntity?.slug
          ? toPeerChip(indexFloorEntity)
          : null,
    };
    // If both null (entity is both — only 1 entity in index, degenerate case), pass null
    const indexTopAndFloorProp =
      indexTopAndFloor.top !== null || indexTopAndFloor.floor !== null
        ? indexTopAndFloor
        : null;

    // ── Wave G1.4: Entity-page FAQ items (real data only — no fabrication) ────
    // Answers are template-generated from entity fields. Questions are answerable
    // from on-page data only. No free-text or invented claims.

    const { strongest: faqStrongest, weakest: faqWeakest } = (() => {
      const entries = DIMENSIONS.map((d) => ({
        name: d.name,
        score: entity.scores[d.code] ?? 0,
      }));
      if (entries.length === 0) return { strongest: null, weakest: null };
      const maxScore = Math.max(...entries.map((e) => e.score));
      const minScore = Math.min(...entries.map((e) => e.score));
      return {
        strongest: entries.find((e) => e.score === maxScore) ?? null,
        weakest: entries.find((e) => e.score === minScore) ?? null,
      };
    })();

    const faqDateLabel = dateModified !== "2026-01-01" ? dateModified : "2026";

    const entityFaqItems = [
      {
        question: `What is ${entity.name}'s compassion score?`,
        answer: `As of ${faqDateLabel}, ${entity.name} scores ${entity.composite.toFixed(1)}/100 (${entity.band}) on the Compassion Benchmark, ranking #${entity.rank} of ${entity.indexTotal} in the ${config.indexLabel}.`,
      },
      {
        question: `How is ${entity.name}'s compassion score calculated?`,
        answer: `The score is a composite across 8 dimensions of institutional compassion (Awareness, Empathy, Action, Equity, Boundaries, Accountability, Systemic Impact, and Integrity), each scored 0–5 from behavioral evidence, then converted to a 0–100 scale with an integration premium for balanced profiles. See the full methodology at compassionbenchmark.com/methodology.`,
      },
      ...(faqStrongest && faqWeakest
        ? [
            {
              question: `What is ${entity.name}'s strongest compassion dimension?`,
              answer: `${entity.name}'s strongest dimension is ${faqStrongest.name} (${faqStrongest.score.toFixed(1)}/5.0). Its weakest dimension is ${faqWeakest.name} (${faqWeakest.score.toFixed(1)}/5.0).`,
            },
          ]
        : []),
    ];

    // ── BreadcrumbList: Home → Indexes → {Index} → {Entity} ─────────────
    // Every URL must resolve in the build. config.indexRoute is the real
    // index page route from KIND_CONFIG (e.g. "/countries", "/fortune-500").
    const breadcrumbItems = [
      { name: "Home",            url: breadcrumbUrl("/") },
      { name: "Indexes",         url: breadcrumbUrl("/indexes") },
      { name: config.indexLabel, url: breadcrumbUrl(config.indexRoute) },
      { name: entity.name,       url: breadcrumbUrl(`/${config.route}/${entity.slug}`) },
    ];

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <BreadcrumbJsonLd items={breadcrumbItems} />
        <FaqJsonLd items={entityFaqItems} />
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
          cohortPeers={cohortPeers}
          rankNeighbours={rankNeighbours}
          indexTopAndFloor={indexTopAndFloorProp}
        />
        {entityFaqItems.length > 0 && (
          <Container>
            <FaqAccordion items={entityFaqItems} />
          </Container>
        )}
      </>
    );
  };
}
