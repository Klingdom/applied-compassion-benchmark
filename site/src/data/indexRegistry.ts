/**
 * indexRegistry.ts — single canonical source of truth for the 8 published
 * indexes' display metadata (labels, index page route, entity-kind identity).
 *
 * Consolidates the "duplicated index registry" tech debt flagged in
 * SYSTEM_HEALTH.md (2026-06-19) and documented in
 * docs/NONPROFIT_SIMPLIFY_FRONTEND_2026-07-12.md (item S1): the list of "8
 * published indexes" was hand-copied across 11 files. Three of them
 * (EntitySearch.tsx, NavbarSearch.tsx, scripts/test-entity-href.mjs) were
 * never updated when the Universities Index shipped (2026-06-19), silently
 * breaking site search for ~100 universities. Every consumer listed in that
 * doc now imports this module instead of re-declaring its own copy.
 *
 * Identity fields (kind / indexSlug / routePrefix) are derived from
 * KIND_TABLE in src/lib/entityHref.ts — the pre-existing canonical typed
 * source for entity-kind → route mapping — so this module adds ONLY the
 * display-only fields (labels, parent index route, metadata field lists)
 * that consumers need on top of that identity. There is exactly one place
 * (KIND_TABLE) where kind/indexSlug/routePrefix can drift, and this module
 * fails loudly at load time if its own DISPLAY_ORDER list and KIND_TABLE's
 * kind set ever disagree (see the invariant check at the bottom of this
 * file) — the exact silent-drift failure mode that caused the search bug.
 */

import { KIND_TABLE, ALL_ENTITY_KINDS } from "@/lib/entityHref";
import type { EntityKind } from "@/data/entities";

export interface IndexRegistryEntry {
  /** EntityKind — matches Entity.kind / KIND_TABLE key. */
  kind: EntityKind;
  /** "index" field used in update-feed JSON, analytics, and KIND_CONFIG.indexSlug. */
  indexSlug: string;
  /** Entity detail route segment, e.g. "company" → /company/apple-inc. */
  routePrefix: string;
  /** Parent index page route, e.g. "/fortune-500". */
  indexRoute: string;
  /** Singular noun, e.g. "company". */
  label: string;
  /** Plural noun, e.g. "companies". */
  labelPlural: string;
  /** Full index title, e.g. "Fortune 500 Index" — used on entity detail pages. */
  indexLabel: string;
  /** Short label used in footer nav links (may omit the "Index" suffix). */
  navLabel: string;
  /** Short label used as the index tag on entity-search results. */
  searchLabel: string;
  /** Raw source metadata field keys to surface on entity detail pages. */
  metadataFields: string[];
}

type DisplayConfig = Omit<IndexRegistryEntry, "kind" | "indexSlug" | "routePrefix">;

/**
 * Display-only fields per EntityKind. Identity (indexSlug/routePrefix) comes
 * from KIND_TABLE, never re-declared here.
 */
const DISPLAY_CONFIG: Record<EntityKind, DisplayConfig> = {
  country: {
    indexRoute: "/countries",
    label: "country",
    labelPlural: "countries",
    indexLabel: "World Countries Index",
    navLabel: "Countries Index",
    searchLabel: "Countries",
    metadataFields: ["region"],
  },
  "us-state": {
    indexRoute: "/us-states",
    label: "U.S. state",
    labelPlural: "U.S. states",
    indexLabel: "U.S. States Index",
    navLabel: "U.S. States Index",
    searchLabel: "U.S. States",
    metadataFields: ["region"],
  },
  company: {
    indexRoute: "/fortune-500",
    label: "company",
    labelPlural: "companies",
    indexLabel: "Fortune 500 Index",
    navLabel: "Fortune 500",
    searchLabel: "Fortune 500",
    metadataFields: ["sector", "f500Rank"],
  },
  "ai-lab": {
    indexRoute: "/ai-labs",
    label: "AI lab",
    labelPlural: "AI labs",
    indexLabel: "Top 50 AI Labs Index",
    navLabel: "AI Labs",
    searchLabel: "AI Labs",
    metadataFields: ["hq", "sector"],
  },
  "robotics-lab": {
    indexRoute: "/robotics-labs",
    label: "robotics lab",
    labelPlural: "robotics labs",
    indexLabel: "Humanoid Robotics Labs Index",
    navLabel: "Robotics Labs",
    searchLabel: "Robotics Labs",
    metadataFields: ["country", "category"],
  },
  "us-city": {
    indexRoute: "/us-cities",
    label: "U.S. city",
    labelPlural: "U.S. cities",
    indexLabel: "U.S. Cities Index",
    navLabel: "U.S. Cities",
    searchLabel: "U.S. Cities",
    metadataFields: ["state", "region"],
  },
  city: {
    indexRoute: "/global-cities",
    label: "city",
    labelPlural: "cities",
    indexLabel: "Global Cities Index",
    navLabel: "Global Cities",
    searchLabel: "Global Cities",
    metadataFields: ["country", "region"],
  },
  university: {
    indexRoute: "/universities",
    label: "university",
    labelPlural: "universities",
    indexLabel: "Universities Index",
    navLabel: "Universities",
    searchLabel: "Universities",
    metadataFields: ["country", "type"],
  },
};

/**
 * Display order — the order these 8 indexes are presented across footer nav,
 * /indexes cards, the sitemap's index-page list, and entity search. This is
 * distinct from KIND_TABLE's own declaration order (ALL_ENTITY_KINDS, which
 * groups "company" first) — that order is preserved separately wherever a
 * consumer needs it (e.g. sitemap entity-detail URL loops) since it has no
 * user-visible effect there.
 */
const DISPLAY_ORDER: EntityKind[] = [
  "country",
  "us-state",
  "company",
  "ai-lab",
  "robotics-lab",
  "us-city",
  "city",
  "university",
];

/** One row per published index, in display order. THE canonical registry. */
export const INDEX_REGISTRY: IndexRegistryEntry[] = DISPLAY_ORDER.map((kind) => ({
  kind,
  indexSlug: KIND_TABLE[kind].indexSlug,
  routePrefix: KIND_TABLE[kind].routePrefix,
  ...DISPLAY_CONFIG[kind],
}));

/** Total number of published indexes. Assert against this, never a literal. */
export const INDEX_COUNT = INDEX_REGISTRY.length;

/** Lookup by EntityKind. Throws if the kind is unknown (fail loud, not silent). */
export function getIndexEntry(kind: EntityKind): IndexRegistryEntry {
  const entry = INDEX_REGISTRY.find((r) => r.kind === kind);
  if (!entry) {
    throw new Error(`indexRegistry: no entry registered for EntityKind "${kind}"`);
  }
  return entry;
}

/** Lookup by indexSlug (update-feed / analytics slug), e.g. "fortune-500". */
export function getIndexEntryBySlug(indexSlug: string): IndexRegistryEntry | null {
  return INDEX_REGISTRY.find((r) => r.indexSlug === indexSlug) ?? null;
}

/**
 * Re-exported for consumers that need KIND_TABLE's declaration order
 * (company-first) rather than display order — e.g. sitemap.ts's
 * entity-detail-page loop, where iteration order has no user-visible effect.
 */
export { ALL_ENTITY_KINDS };

// ─── Fail-loud drift guard ──────────────────────────────────────────────────
//
// This is the structural fix for the bug this module exists to prevent: if a
// future index is added to KIND_TABLE (entityHref.ts) but DISPLAY_ORDER above
// is never updated to match, every consumer of INDEX_REGISTRY would silently
// omit it — exactly how Universities went unsearchable for 3+ weeks. Instead,
// this throws at module load (breaking the build immediately) rather than
// shipping a silently-incomplete registry.

if (INDEX_REGISTRY.length !== ALL_ENTITY_KINDS.length) {
  throw new Error(
    `indexRegistry: DISPLAY_ORDER has ${INDEX_REGISTRY.length} entries but ` +
      `KIND_TABLE (entityHref.ts) has ${ALL_ENTITY_KINDS.length} EntityKinds — ` +
      `a kind was added to one but not the other.`,
  );
}

const missingFromDisplayOrder = ALL_ENTITY_KINDS.filter(
  (k) => !DISPLAY_ORDER.includes(k),
);
if (missingFromDisplayOrder.length > 0) {
  throw new Error(
    `indexRegistry: DISPLAY_ORDER is missing EntityKind(s): ${missingFromDisplayOrder.join(", ")}. ` +
      `Add display config for these kinds to DISPLAY_CONFIG and DISPLAY_ORDER above.`,
  );
}
