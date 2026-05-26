import type { Metadata } from "next";
import { notFound } from "next/navigation";
import EntityDetail from "./EntityDetail";
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
        />
      </>
    );
  };
}
