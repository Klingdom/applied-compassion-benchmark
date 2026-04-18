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
