/**
 * entityHref — maps an (indexSlug, entitySlug) pair to a site-relative href.
 *
 * indexSlug values match the `index` field emitted by the overnight research
 * pipeline in /updates JSON (e.g. "fortune-500", "ai-labs").
 *
 * Returns null when the combination has no detail page (unknown index).
 */

/** Maps update-feed index slugs → route prefix segment. */
const INDEX_ROUTE_PREFIX: Record<string, string> = {
  "fortune-500": "company",
  countries: "country",
  "us-states": "us-state",
  "ai-labs": "ai-lab",
  "robotics-labs": "robotics-lab",
  "global-cities": "city",
  "us-cities": "us-city",
};

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
