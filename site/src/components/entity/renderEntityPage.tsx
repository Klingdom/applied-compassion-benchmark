import type { Metadata } from "next";
import { notFound } from "next/navigation";
import EntityDetail from "./EntityDetail";
import type { IndexBandEntry } from "./EntityDetail";
import {
  EntityKind,
  KIND_CONFIG,
  getEntityBySlug,
  getAllSlugs,
} from "@/data/entities";
import { getLatestChange } from "@/data/updates/entityChanges";
import {
  getLatestEvidenceReview,
  getLookbackWindowDays,
} from "@/data/evidence-reviews";
import { hasEntityHistory, getEntityHistory } from "@/data/history";
import type { EntityEvidenceCardProps } from "@/components/entity/EntityEvidenceCard";
import type { HistoryEvent } from "@/types/entity-history";

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

    // Extend JSON-LD with ratingExplanation from the most recent scored event
    // when available (PR 2 optional polish — structured data improvement).
    const latestHeadline = history?.latestScoreChange?.headline ?? null;
    const jsonLd: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "Rating",
      itemReviewed: {
        "@type": "Organization",
        name: entity.name,
      },
      author: {
        "@type": "Organization",
        name: "Compassion Benchmark",
        url: SITE_URL,
      },
      ratingValue: entity.composite,
      bestRating: 100,
      worstRating: 0,
      reviewAspect: "Institutional compassion",
      description: `Composite compassion score ${entity.composite.toFixed(1)} of 100 (band: ${entity.band}), rank ${entity.rank} of ${entity.indexTotal} in the ${config.indexLabel}.`,
      ...(latestHeadline
        ? { ratingExplanation: latestHeadline }
        : {}),
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
        />
      </>
    );
  };
}
