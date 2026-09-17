/**
 * Stable entity-name slugger.
 *
 * Shared between:
 *  - `site/src/data/entities.ts` (build-time entity registry)
 *  - `site/src/components/index/RankingTable.tsx` (client-side link targets)
 *
 * Convention matches the overnight research pipeline output
 * (`ford-motor`, `new-york-city`, `meta-platforms`, `iran`).
 *
 * Kept in a dependency-free module so client components can import it
 * without pulling the full entities registry (and its JSON payload).
 */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/'/g, "")
    .replace(/\./g, "")
    .replace(/,/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

/**
 * The PUBLISHED slug for an index row.
 *
 * An index row may declare an explicit `slug`, which takes precedence over
 * slugify(name). This is used where the legal name slugs badly ("Intuitive
 * Surgical, Inc." -> intuitive-surgical) or where two indexes share a name
 * (phoenix-global-cities, singapore-global-cities, georgia-us-states).
 *
 * This rule is what BUILDS the entity pages (see rowSlug in src/data/entities.ts,
 * and the same logic in export-public-data.mjs / build-entity-records.mjs).
 * Anything rendering a link to an entity MUST use this rather than re-deriving
 * from the name — a derived slug points at a URL that does not exist, and
 * survives only if nginx happens to carry a 301 for it.
 *
 * Many published rows carry a pinned slug that differs from slugify(name);
 * `npm run test:pinned-slugs` reports the current count and fails if any
 * component re-derives one. (The count is deliberately not written here — see
 * the catalogue-count rule in CLAUDE.md and test:no-stale-counts.)
 */
export function rowSlug(row: { name: string; slug?: unknown }): string {
  return typeof row.slug === "string" && row.slug.trim().length > 0
    ? row.slug.trim()
    : slugify(row.name);
}
