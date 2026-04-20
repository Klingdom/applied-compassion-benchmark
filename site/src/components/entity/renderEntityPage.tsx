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

    const jsonLd = {
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
        />
      </>
    );
  };
}
