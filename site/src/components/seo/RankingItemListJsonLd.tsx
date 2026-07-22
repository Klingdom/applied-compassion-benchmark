/**
 * RankingItemListJsonLd — schema.org ItemList structured data for each of the
 * 8 index ranking pages. Mirrors the DatasetJsonLd / BreadcrumbJsonLd pattern:
 * a single typed prop in, one <script type="application/ld+json"> out.
 *
 * Data source: deliberately reads through `getAllEntities(kind)` (the same
 * build-time registry that generates every entity detail page and its
 * `generateStaticParams`/canonical URL — see src/data/entities.ts) rather
 * than re-slugifying the page's raw `data.rankings` JSON locally. This is a
 * belt-and-suspenders choice: it guarantees every `url` below is byte-identical
 * to the real, deployed entity-page route (same slug collision handling,
 * same disambiguation), which the calling task treats as a hard requirement
 * ("a wrong URL here is worse than no ItemList"). The entities themselves
 * still originate from nothing but the index's own ranking data — no new
 * facts are introduced.
 *
 * `name` is the entity's decoded display name (see decodeHtmlEntities) —
 * consistent with entity.name everywhere else it's rendered.
 */

import { EntityKind, getAllEntities } from "@/data/entities";
import { entityHrefByKind } from "@/lib/entityHref";

const SITE_URL = "https://compassionbenchmark.com";

/** Per-kind schema.org type — mirrors KIND_SCHEMA_TYPE in renderEntityPage.tsx. */
const KIND_SCHEMA_TYPE: Record<EntityKind, string> = {
  company: "Organization",
  country: "Country",
  "us-state": "AdministrativeArea",
  "ai-lab": "Organization",
  "robotics-lab": "Organization",
  city: "City",
  "us-city": "City",
  university: "CollegeOrUniversity",
};

type Props = {
  kind: EntityKind;
  /** Number of top-ranked entities to include, plus the index floor entity. Default 25. */
  topN?: number;
};

export default function RankingItemListJsonLd({ kind, topN = 25 }: Props) {
  const entities = getAllEntities(kind);
  if (entities.length === 0) return null;

  const itemType = KIND_SCHEMA_TYPE[kind] ?? "Organization";

  const sorted = [...entities].sort((a, b) => a.rank - b.rank);
  const top = sorted.slice(0, topN);
  const floorEntity = sorted[sorted.length - 1];

  // Deterministic subset: top N by rank, plus the index floor (lowest rank)
  // entity if it isn't already included — surfaces both ends of the index.
  const included = top.some((e) => e.slug === floorEntity.slug)
    ? top
    : [...top, floorEntity];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: entities.length,
    itemListElement: included.map((entity) => {
      const url = `${SITE_URL}${entityHrefByKind(kind, entity.slug)}`;
      return {
        "@type": "ListItem",
        position: entity.rank,
        name: entity.name,
        url,
        item: {
          "@type": itemType,
          name: entity.name,
          url,
        },
      };
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
