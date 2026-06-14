/**
 * entityHref — maps an (indexSlug, entitySlug) pair to a site-relative href.
 *
 * indexSlug values match the `index` field emitted by the overnight research
 * pipeline in /updates JSON (e.g. "fortune-500", "ai-labs").
 *
 * Returns null when the combination has no detail page (unknown index).
 */

import type { EntityKind } from "@/data/entities";

/**
 * Canonical kind table — one source of truth for the seven entity kinds.
 * Keyed by EntityKind; each entry carries:
 *   - indexSlug   : the "index" field used in update-feed JSON and analytics
 *   - routePrefix : the URL path segment under site root  (no leading slash)
 *
 * Downstream constants (INDEX_ROUTE_PREFIX, ENTITY_ROUTE, KIND_TO_INDEX_SLUG)
 * are all derived from this table so they can never drift independently.
 */
export const KIND_TABLE: Record<
  EntityKind,
  { indexSlug: string; routePrefix: string }
> = {
  company:        { indexSlug: "fortune-500",    routePrefix: "company" },
  country:        { indexSlug: "countries",      routePrefix: "country" },
  "us-state":     { indexSlug: "us-states",      routePrefix: "us-state" },
  "ai-lab":       { indexSlug: "ai-labs",        routePrefix: "ai-lab" },
  "robotics-lab": { indexSlug: "robotics-labs",  routePrefix: "robotics-lab" },
  city:           { indexSlug: "global-cities",  routePrefix: "city" },
  "us-city":      { indexSlug: "us-cities",      routePrefix: "us-city" },
};

/** Ordered list of all EntityKinds — use when you need to iterate all kinds. */
export const ALL_ENTITY_KINDS: EntityKind[] = Object.keys(
  KIND_TABLE,
) as EntityKind[];

/** Maps update-feed index slugs → route prefix segment. Derived from KIND_TABLE. */
const INDEX_ROUTE_PREFIX: Record<string, string> = Object.fromEntries(
  ALL_ENTITY_KINDS.map((k) => [KIND_TABLE[k].indexSlug, KIND_TABLE[k].routePrefix]),
);

/**
 * Returns the index slug for an EntityKind (e.g. "company" → "fortune-500").
 * Used wherever analytics or update-feed index fields are needed by kind.
 */
export function kindToIndexSlug(kind: EntityKind): string {
  return KIND_TABLE[kind].indexSlug;
}

/**
 * Returns the route prefix for an EntityKind (e.g. "ai-lab" → "ai-lab").
 * Useful when building hrefs from a known kind without needing the full entityHref.
 */
export function kindToRoutePrefix(kind: EntityKind): string {
  return KIND_TABLE[kind].routePrefix;
}

/**
 * Returns a site-relative href for a known (EntityKind, entitySlug) pair.
 *
 * @example
 *   entityHrefByKind("company", "apple-inc")   // "/company/apple-inc"
 *   entityHrefByKind("ai-lab", "openai")       // "/ai-lab/openai"
 */
export function entityHrefByKind(kind: EntityKind, entitySlug: string): string {
  return `/${KIND_TABLE[kind].routePrefix}/${entitySlug}`;
}

/**
 * Returns a site-relative href for a known (indexSlug, entitySlug) pair,
 * or null if the index has no detail route.
 *
 * @example
 *   entityHref("fortune-500", "apple")      // "/company/apple"
 *   entityHref("ai-labs", "openai")         // "/ai-lab/openai"
 *   entityHref("unknown-index", "foo")      // null
 */
export function entityHref(indexSlug: string, entitySlug: string): string | null {
  const prefix = INDEX_ROUTE_PREFIX[indexSlug];
  if (!prefix) return null;
  return `/${prefix}/${entitySlug}`;
}
