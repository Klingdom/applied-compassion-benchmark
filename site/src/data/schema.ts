/**
 * Runtime schemas for ranking index data and change proposals.
 *
 * Single source of truth. Module-load-time `IndexFileSchema.parse(...)` calls
 * in `entities.ts` will fail the static export immediately on any drift —
 * eliminating the ~30 hand-written `as` casts that previously masked shape
 * regressions until runtime.
 *
 * Schemas intentionally use `z.looseObject({...})` for ranking entries and
 * change proposals so that index-specific metadata (sector, hq, region,
 * country, state, f500Rank, category, …) can flow through without being
 * stripped, while the canonical fields are still strictly validated.
 *
 * Inferred types are exported alongside the validators — consumers should
 * import the types from here rather than redeclaring them.
 */
import { z } from "zod";

// ─── Constants ──────────────────────────────────────────────────────────

/** Canonical 8 dimension codes — matches `src/lib/scoring.ts` and `dimensions.ts`. */
export const DIMENSION_CODES = [
  "AWR",
  "EMP",
  "ACT",
  "EQU",
  "BND",
  "ACC",
  "SYS",
  "INT",
] as const;

export type DimensionCode = (typeof DIMENSION_CODES)[number];

/** Canonical band names (capitalized form used in TS layer). */
export const BAND_NAMES = [
  "Exemplary",
  "Established",
  "Functional",
  "Developing",
  "Critical",
] as const;

// ─── Primitives ─────────────────────────────────────────────────────────

/**
 * Dimension scores: each of the 8 codes mapped to a number in [0, 5].
 * 0 is the harm flag (disables integration premium) — see scoring.ts.
 */
export const DimensionScoresSchema = z.object(
  Object.fromEntries(
    DIMENSION_CODES.map((c) => [c, z.number().min(0).max(5)]),
  ) as Record<DimensionCode, z.ZodNumber>,
);

/** Band string on rankings is lowercase in source JSON ("exemplary"); normalize at consumer. */
export const RawBandSchema = z.string().min(1);

/**
 * Floor designation disclosure block — required when an entity's composite
 * is at the methodology floor across multiple cycles. See methodology v1.2.
 */
export const FloorDesignationSchema = z.object({
  designated: z.boolean(),
  designatedDate: z.string(),
  evidenceWindow: z.string(),
  rationale: z.string(),
  primaryDrivers: z.array(z.string()),
  evidenceSummary: z.array(z.string()),
  methodologyVersion: z.string(),
});

// ─── Index file ─────────────────────────────────────────────────────────

/**
 * One entity row in a ranking index.
 *
 * `looseObject` preserves index-specific metadata fields (sector, hq, region,
 * country, state, f500Rank, category, etc.) without forcing each schema to
 * enumerate them.
 */
export const RankingEntrySchema = z.looseObject({
  rank: z.number().int().positive(),
  name: z.string().min(1),
  scores: DimensionScoresSchema,
  composite: z.number().min(0).max(100),
  band: RawBandSchema,
  floorDesignation: FloorDesignationSchema.optional(),
});

export const BandSummarySchema = z.object({
  name: z.string(),
  range: z.string(),
  count: z.number().int().nonnegative(),
  pct: z.string(),
});

export const IndexMetaSchema = z.looseObject({
  title: z.string().min(1),
  year: z.number().int().optional(),
  entityCount: z.number().int().nonnegative(),
  meanScore: z.number().optional(),
  medianScore: z.number().optional(),
  dimensions: z.array(z.string()).optional(),
});

export const IndexFileSchema = z.object({
  meta: IndexMetaSchema,
  bands: z.array(BandSummarySchema).optional(),
  rankings: z.array(RankingEntrySchema),
});

// ─── Change proposals ───────────────────────────────────────────────────

/**
 * Single piece of evidence cited in a change proposal.
 * `dimensionsAffected` is constrained to known dimension codes.
 */
export const EvidenceItemSchema = z.looseObject({
  source: z.string(),
  url: z.string(),
  finding: z.string(),
  dimensionsAffected: z.array(z.enum(DIMENSION_CODES)).optional(),
  inWindow: z.boolean().optional(),
});

/**
 * Change proposal as written by the overnight assessor agent — the exact
 * shape is allowed to evolve, but core fields used by the score-updater and
 * by the build-manifest emission are pinned.
 */
export const ChangeProposalSchema = z.looseObject({
  entity: z.string().min(1),
  slug: z.string().min(1),
  index: z.string().min(1),
  date: z.string().min(1),
  assessment_date: z.string().optional(),
  headline: z.string().optional(),
  publishedScore: z.number().min(0).max(100).optional(),
  assessedScore: z.number().min(0).max(100).optional(),
  delta: z.number().optional(),
  publishedBand: z.string().optional(),
  assessedBand: z.string().optional(),
  bandChange: z.boolean().optional(),
  confidence: z.string().optional(),
  recommendation: z.string().optional(),
  publishedDimensions: DimensionScoresSchema.optional(),
  proposedDimensions: DimensionScoresSchema.optional(),
  evidence: z.array(EvidenceItemSchema).optional(),
  negativeSignals: z.string().optional(),
  positiveSignals: z.string().optional(),
  status: z.string().optional(),
});

// ─── Inferred TS types ──────────────────────────────────────────────────

export type DimensionScores = z.infer<typeof DimensionScoresSchema>;
export type RankingEntry = z.infer<typeof RankingEntrySchema>;
export type BandSummary = z.infer<typeof BandSummarySchema>;
export type IndexMeta = z.infer<typeof IndexMetaSchema>;
export type IndexFile = z.infer<typeof IndexFileSchema>;
export type FloorDesignationData = z.infer<typeof FloorDesignationSchema>;
export type EvidenceItem = z.infer<typeof EvidenceItemSchema>;
export type ChangeProposal = z.infer<typeof ChangeProposalSchema>;
