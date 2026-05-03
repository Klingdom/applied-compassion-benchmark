/**
 * Entity registry and lookup layer for entity detail pages
 * (`/company/{slug}`, `/country/{slug}`, etc.).
 *
 * Responsibilities:
 *  - Load every ranking JSON and expose a unified `Entity` shape.
 *  - Generate a stable slug from entity name + disambiguate collisions.
 *  - Reverse-lookup by (kind, slug) → Entity | null.
 *  - Provide generateStaticParams helpers.
 *  - Map between EntityKind and ranking index / route / Gumroad product.
 *
 * Slug convention matches the overnight pipeline (`ford-motor`, `new-york-city`,
 * `meta-platforms`, `iran`) — kebab-case lowercase with non-alphanum stripped.
 */
import fortune500 from "./indexes/fortune-500.json";
import countries from "./indexes/countries.json";
import usStates from "./indexes/us-states.json";
import aiLabs from "./indexes/ai-labs.json";
import roboticsLabs from "./indexes/robotics-labs.json";
import globalCities from "./indexes/global-cities.json";
import usCities from "./indexes/us-cities.json";
import { GUMROAD } from "./gumroad";
import { slugify as slugifyShared } from "@/lib/slugify";
import { IndexFileSchema, type IndexFile, type RankingEntry } from "./schema";

export type EntityKind =
  | "company"
  | "country"
  | "us-state"
  | "ai-lab"
  | "robotics-lab"
  | "city"
  | "us-city";

/**
 * Floor-designation disclosure attached to entities whose composite score
 * resolves at zero because every dimension hit the lowest anchor (1.0/5.0)
 * across multiple assessment cycles.
 *
 * Required "call out why" methodology disclosure — every floor-pressed entity
 * must surface the documented evidence pattern, not a silent zero.
 */
export interface FloorDesignation {
  designated: boolean;
  designatedDate: string;
  evidenceWindow: string;
  rationale: string;
  primaryDrivers: string[];
  evidenceSummary: string[];
  methodologyVersion: string;
}

export interface Entity {
  kind: EntityKind;
  slug: string;
  name: string;
  rank: number;
  composite: number;
  band: string; // normalized: "Exemplary" | "Established" | "Functional" | "Developing" | "Critical"
  scores: Record<string, number>; // dimension code → 0-5 score
  /** Raw source metadata fields preserved for display (sector, hq, country, region, state, f500Rank, category) */
  metadata: Record<string, string | number | undefined>;
  /** Total number of entities in this index — used for "rank X of Y" display */
  indexTotal: number;
  /** Index meta for CTA copy */
  indexTitle: string;
  /** Methodology disclosure: present iff entity has been formally floor-designated. */
  floorDesignation?: FloorDesignation | null;
}

// ─── Slug generation ────────────────────────────────────────────────────

/** Re-export the shared slugger for backwards-compatible import paths. */
export const slugify = slugifyShared;

function normalizeBand(raw: string): string {
  const b = raw.toLowerCase();
  if (b.startsWith("exempl")) return "Exemplary";
  if (b.startsWith("establ")) return "Established";
  if (b.startsWith("funct")) return "Functional";
  if (b.startsWith("devel")) return "Developing";
  if (b.startsWith("crit")) return "Critical";
  return raw;
}

// ─── Kind configuration ─────────────────────────────────────────────────

interface KindConfig {
  kind: EntityKind;
  label: string;          // singular noun, e.g. "company"
  labelPlural: string;    // plural, e.g. "companies"
  route: string;          // route segment without leading slash, e.g. "company"
  indexLabel: string;     // name of the parent index, e.g. "Fortune 500"
  indexSlug: string;      // slug used in /updates feed and change proposals, e.g. "fortune-500"
  indexRoute: string;     // parent index route on the site, e.g. "/fortune-500"
  gumroadUrl: string;
  gumroadPrice: string;   // display-only, e.g. "$195"
  metadataFields: string[]; // keys to surface in metadata block
}

export const KIND_CONFIG: Record<EntityKind, KindConfig> = {
  company: {
    kind: "company",
    label: "company",
    labelPlural: "companies",
    route: "company",
    indexLabel: "Fortune 500 Index",
    indexSlug: "fortune-500",
    indexRoute: "/fortune-500",
    gumroadUrl: GUMROAD.fortune500Index,
    gumroadPrice: "$195",
    metadataFields: ["sector", "f500Rank"],
  },
  country: {
    kind: "country",
    label: "country",
    labelPlural: "countries",
    route: "country",
    indexLabel: "World Countries Index",
    indexSlug: "countries",
    indexRoute: "/countries",
    gumroadUrl: GUMROAD.countriesIndex,
    gumroadPrice: "$195",
    metadataFields: ["region"],
  },
  "us-state": {
    kind: "us-state",
    label: "U.S. state",
    labelPlural: "U.S. states",
    route: "us-state",
    indexLabel: "U.S. States Index",
    indexSlug: "us-states",
    indexRoute: "/us-states",
    gumroadUrl: GUMROAD.countriesIndex, // no dedicated Gumroad product — fallback to countries bundle
    gumroadPrice: "$195",
    metadataFields: ["region"],
  },
  "ai-lab": {
    kind: "ai-lab",
    label: "AI lab",
    labelPlural: "AI labs",
    route: "ai-lab",
    indexLabel: "Top 50 AI Labs Index",
    indexSlug: "ai-labs",
    indexRoute: "/ai-labs",
    gumroadUrl: GUMROAD.aiLabsIndex,
    gumroadPrice: "$195",
    metadataFields: ["hq", "sector"],
  },
  "robotics-lab": {
    kind: "robotics-lab",
    label: "robotics lab",
    labelPlural: "robotics labs",
    route: "robotics-lab",
    indexLabel: "Humanoid Robotics Labs Index",
    indexSlug: "robotics-labs",
    indexRoute: "/robotics-labs",
    gumroadUrl: GUMROAD.roboticsIndex,
    gumroadPrice: "$195",
    metadataFields: ["country", "category"],
  },
  city: {
    kind: "city",
    label: "city",
    labelPlural: "cities",
    route: "city",
    indexLabel: "Global Cities Index",
    indexSlug: "global-cities",
    indexRoute: "/global-cities",
    gumroadUrl: GUMROAD.globalCitiesIndex,
    gumroadPrice: "$195",
    metadataFields: ["country", "region"],
  },
  "us-city": {
    kind: "us-city",
    label: "U.S. city",
    labelPlural: "U.S. cities",
    route: "us-city",
    indexLabel: "U.S. Cities Index",
    indexSlug: "us-cities",
    indexRoute: "/us-cities",
    gumroadUrl: GUMROAD.globalCitiesIndex, // no dedicated Gumroad product yet — fallback
    gumroadPrice: "$195",
    metadataFields: ["state", "region"],
  },
};

// ─── Build entity registry at module load ───────────────────────────────

/**
 * Parse a raw imported JSON index against the canonical zod schema.
 *
 * Failure here aborts the static export — surface drift loudly rather than
 * letting a malformed ranking entry hit production with silent zeros.
 *
 * `unknown` cast is the one boundary cast we accept: the imported JSON is
 * untrusted shape until parse runs.
 */
function parseIndex(name: string, raw: unknown): IndexFile {
  const result = IndexFileSchema.safeParse(raw);
  if (!result.success) {
    throw new Error(
      `Index "${name}" failed schema validation: ${result.error.message}`,
    );
  }
  return result.data;
}

/**
 * Pull index-specific metadata fields off a parsed ranking row.
 * Canonical fields (rank/name/scores/composite/band/floorDesignation) are
 * excluded; any remaining string|number value is preserved for display.
 */
function extractMetadata(
  row: RankingEntry,
): Record<string, string | number | undefined> {
  const metadata: Record<string, string | number | undefined> = {};
  for (const [key, v] of Object.entries(row)) {
    if (
      key === "rank" ||
      key === "name" ||
      key === "scores" ||
      key === "composite" ||
      key === "band" ||
      key === "floorDesignation"
    ) continue;
    if (typeof v === "string" || typeof v === "number") metadata[key] = v;
  }
  return metadata;
}

function buildEntities(kind: EntityKind, source: IndexFile): Entity[] {
  const total = source.meta.entityCount;
  const title = source.meta.title;
  const slugCounts = new Map<string, number>();

  // First pass: collision counts
  for (const row of source.rankings) {
    const baseSlug = slugify(row.name);
    slugCounts.set(baseSlug, (slugCounts.get(baseSlug) || 0) + 1);
  }

  const slugUsage = new Map<string, number>();
  const out: Entity[] = [];

  for (const row of source.rankings) {
    const baseSlug = slugify(row.name);
    // Disambiguate: if multiple entities share a slug, append rank
    let slug = baseSlug;
    if ((slugCounts.get(baseSlug) || 0) > 1) {
      const used = slugUsage.get(baseSlug) || 0;
      slugUsage.set(baseSlug, used + 1);
      slug = used === 0 ? baseSlug : `${baseSlug}-${row.rank}`;
    }

    const rawFloor = row.floorDesignation;
    const floorDesignation: FloorDesignation | null =
      rawFloor && rawFloor.designated === true ? rawFloor : null;

    out.push({
      kind,
      slug,
      name: row.name,
      rank: row.rank,
      composite: row.composite,
      band: normalizeBand(row.band),
      scores: row.scores,
      metadata: extractMetadata(row),
      indexTotal: total,
      indexTitle: title,
      floorDesignation,
    });
  }

  return out;
}

const ENTITIES: Record<EntityKind, Entity[]> = {
  company: buildEntities("company", parseIndex("fortune-500", fortune500)),
  country: buildEntities("country", parseIndex("countries", countries)),
  "us-state": buildEntities("us-state", parseIndex("us-states", usStates)),
  "ai-lab": buildEntities("ai-lab", parseIndex("ai-labs", aiLabs)),
  "robotics-lab": buildEntities("robotics-lab", parseIndex("robotics-labs", roboticsLabs)),
  city: buildEntities("city", parseIndex("global-cities", globalCities)),
  "us-city": buildEntities("us-city", parseIndex("us-cities", usCities)),
};

// ─── Public lookup API ──────────────────────────────────────────────────

export function getAllEntities(kind: EntityKind): Entity[] {
  return ENTITIES[kind];
}

export function getEntityBySlug(kind: EntityKind, slug: string): Entity | null {
  return ENTITIES[kind].find((e) => e.slug === slug) || null;
}

export function getAllSlugs(kind: EntityKind): string[] {
  return ENTITIES[kind].map((e) => e.slug);
}

/**
 * Cross-kind resolution: map an index slug (e.g. "fortune-500") from a score
 * change record back to the EntityKind. Useful for linking from /updates.
 */
export function kindFromIndexSlug(indexSlug: string): EntityKind | null {
  const entry = Object.values(KIND_CONFIG).find((c) => c.indexSlug === indexSlug);
  return entry ? entry.kind : null;
}
