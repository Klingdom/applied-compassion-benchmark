/**
 * Glossary of technical terms used in Compassion Benchmark briefings.
 *
 * Each entry powers an inline <DefinedTerm> tooltip that surfaces the
 * methodology meaning of a term without leaving the page.
 *
 * Definitions are written for a non-expert reader. Keep them short
 * (1–2 sentences) and link to deeper sources when possible.
 *
 * Subdimension entries (40) and dimension-by-name aliases are DERIVED at
 * module load from dimensions.ts — do not hand-duplicate them here.
 */

import { DIMENSIONS, BANDS, INTEGRATION_PREMIUM } from "@/data/dimensions";

export interface GlossaryEntry {
  /** Stable lookup key. Lowercase, kebab-case. */
  key: string;
  /** Canonical display label (fallback when no children are passed). */
  label: string;
  /** Plain-English definition shown in the tooltip. */
  definition: string;
  /** Optional internal link for readers who want the full reference. */
  href?: string;
  /** Optional link label override (defaults to "Read methodology"). */
  hrefLabel?: string;
}

/**
 * Registry of explicit glossary terms. Add new entries here; reference them
 * by key via <DefinedTerm term="..."> at any callsite.
 *
 * Explicit entries always win over derived entries when keys collide.
 */
const EXPLICIT_GLOSSARY: Record<string, GlossaryEntry> = {
  // --- Scoring fundamentals ---
  composite: {
    key: "composite",
    label: "Composite Score",
    definition:
      "A 0–100 weighted average of an entity's performance across all 8 compassion dimensions and their 40 subdimensions, anchored in primary-source evidence.",
    href: "/methodology",
  },

  // "score" as an alias for composite
  score: {
    key: "score",
    label: "Composite Score",
    definition:
      "A 0–100 weighted average of an entity's performance across all 8 compassion dimensions and their 40 subdimensions, anchored in primary-source evidence.",
    href: "/methodology",
  },

  band: {
    key: "band",
    label: "Band",
    definition:
      "One of five performance tiers — Critical, Developing, Functional, Established, or Exemplary — that summarize composite-score ranges into a comparable label.",
    href: "/methodology",
  },

  "band-critical": {
    key: "band-critical",
    label: "Critical",
    definition:
      "Foundational compassion practices are absent or documented active harm is present. Composite range: 0–20.",
  },
  "band-developing": {
    key: "band-developing",
    label: "Developing",
    definition:
      "Some practices are emerging but remain inconsistent, reactive, or unevenly applied. Composite range: 20–40.",
  },
  "band-functional": {
    key: "band-functional",
    label: "Functional",
    definition:
      "Core practices exist and meet a basic bar, with significant gaps remaining. Composite range: 40–60.",
  },
  "band-established": {
    key: "band-established",
    label: "Established",
    definition:
      "Practices are systematic, documented, and supported by consistent evidence. Composite range: 60–80.",
  },
  "band-exemplary": {
    key: "band-exemplary",
    label: "Exemplary",
    definition:
      "Practices are independently verified, consistent, and sustained under pressure. Composite range: 80–100.",
  },

  // --- Dimensions (8) by code ---
  awr: {
    key: "awr",
    label: "Awareness",
    definition:
      "Does the institution proactively detect when others are in pain or need — including signals that are implicit, indirect, or easy to miss?",
    href: "/dimensions",
  },
  emp: {
    key: "emp",
    label: "Empathy",
    definition:
      "Does the institution genuinely connect with the inner experience of those it serves — not with hollow affirmations or rushed problem-solving?",
    href: "/dimensions",
  },
  act: {
    key: "act",
    label: "Action",
    definition:
      "Does compassionate understanding translate into specific, accurate, locally relevant help proportionate to actual need?",
    href: "/dimensions",
  },
  equ: {
    key: "equ",
    label: "Equity",
    definition:
      "Is care distributed fairly — especially toward those with greatest need and least power — across pay, access, service quality, and decision authority?",
    href: "/dimensions",
  },
  bnd: {
    key: "bnd",
    label: "Boundaries",
    definition:
      "Is helping sustainable, ethical, and autonomy-preserving — rather than depleting staff or creating dependency in those served?",
    href: "/dimensions",
  },
  acc: {
    key: "acc",
    label: "Accountability",
    definition:
      "Does the institution own its failures, accept correction, and make genuine repair to those it has harmed?",
    href: "/dimensions",
  },
  sys: {
    key: "sys",
    label: "Systemic Thinking",
    definition:
      "Does compassion extend to root causes and structural change — not only symptom relief or short-horizon fixes?",
    href: "/dimensions",
  },
  int: {
    key: "int",
    label: "Integrity",
    definition:
      "Is compassion genuine, consistent, and non-performative — especially when maintaining it carries real cost?",
    href: "/dimensions",
  },

  // --- Meta-terms ---
  dimension: {
    key: "dimension",
    label: "Dimension",
    definition:
      "One of eight high-level areas of compassionate practice (Awareness, Empathy, Action, Equity, Boundaries, Accountability, Systemic Thinking, Integrity). Each dimension contains five scored subdimensions.",
    href: "/methodology",
  },

  subdimension: {
    key: "subdimension",
    label: "Subdimension",
    definition:
      "One of forty specific behavioral questions nested within the 8 dimensions. Each subdimension is scored 0–5 against anchored behavioral descriptions.",
    href: "/methodology",
  },

  "integration-premium": {
    key: "integration-premium",
    label: "Integration Premium",
    definition: INTEGRATION_PREMIUM.short,
    href: "/methodology",
  },

  // --- Briefing-specific terms ---
  confidence: {
    key: "confidence",
    label: "Confidence",
    definition:
      "An indicator of how robust the underlying evidence is. Higher confidence reflects multiple independent primary sources, recent verification, and stable signal across subdimensions.",
    href: "/methodology",
  },

  floor: {
    key: "floor",
    label: "Floor Designation",
    definition:
      "A score reduction triggered when an entity meets specific evidentiary criteria — typically credible documentation of severe rights violations, systemic harm denial, or refusal to acknowledge primary-source findings.",
    href: "/methodology",
  },

  "band-change": {
    key: "band-change",
    label: "Band Change",
    definition:
      "A shift between two performance tiers (e.g., Functional → Developing) on the basis of new evidence. Band changes carry more weight than within-band score movements because they reflect a categorical reassessment.",
    href: "/methodology",
  },

  "first-baseline": {
    key: "first-baseline",
    label: "First Baseline",
    definition:
      "An entity's initial assessment — the first published composite score and band. Subsequent reviews compare against this baseline to surface change over time.",
    href: "/methodology",
  },

  "sector-alert": {
    key: "sector-alert",
    label: "Sector Alert",
    definition:
      "A pattern observed across multiple entities in the same sector — for example, parallel governance failures, coordinated improvements, or shared exposure to a single externality.",
  },

  "in-window": {
    key: "in-window",
    label: "In-Window",
    definition:
      "Material developments that occurred within the briefing's review window — typically the prior 24–72 hours of monitored coverage.",
  },

  "evidence-tier": {
    key: "evidence-tier",
    label: "Evidence Tier",
    definition:
      "A classification of source strength: Tier 1 (primary documents — filings, official statements, court records), Tier 2 (verified reporting from established outlets), Tier 3 (secondary analysis with attribution).",
    href: "/methodology",
  },
};

// ── Derived entries: 40 subdimensions (keyed by code AND name) ────────────────
//
// Generates entries at module load from the canonical DIMENSIONS data.
// Label format: "A1 · Suffering Detection"
// Definition: verbatim from subdim.desc
// Key forms: lowercase code (e.g. "a1") AND normalized name (e.g. "suffering detection")

const DERIVED_SUBDIM: Record<string, GlossaryEntry> = {};

for (const dim of DIMENSIONS) {
  for (const sub of dim.subdims) {
    const codeKey = sub.code.toLowerCase(); // e.g. "a1", "ac1", "ab1"
    const nameKey = sub.name.toLowerCase().trim().replace(/\s+/g, " "); // e.g. "suffering detection"
    const label = `${sub.code} · ${sub.name}`;
    const entry: GlossaryEntry = {
      key: codeKey,
      label,
      definition: sub.desc,
      href: "/methodology#subdimension-framework",
      hrefLabel: "See full anchor table",
    };
    DERIVED_SUBDIM[codeKey] = entry;
    // Name key: only add if not colliding with an explicit entry (checked at merge)
    DERIVED_SUBDIM[nameKey] = { ...entry, key: nameKey };
  }
}

// ── Derived entries: dimension aliases by lowercase name ──────────────────────
//
// Allows "awareness" → awr entry, "systemic thinking" → sys entry, etc.

const DERIVED_DIM_NAMES: Record<string, GlossaryEntry> = {};

for (const dim of DIMENSIONS) {
  const nameKey = dim.name.toLowerCase().trim().replace(/\s+/g, " ");
  // Only add if the explicit glossary doesn't already cover this name
  if (!EXPLICIT_GLOSSARY[nameKey]) {
    DERIVED_DIM_NAMES[nameKey] = {
      key: nameKey,
      label: dim.name,
      definition: dim.desc,
      href: "/dimensions",
    };
  }
}

// ── Derived entries: band name aliases (e.g. "critical" → band-critical) ──────

const DERIVED_BAND_NAMES: Record<string, GlossaryEntry> = {};

for (const band of BANDS) {
  const nameKey = band.name.toLowerCase(); // e.g. "critical"
  // Only add if not already in explicit (which has "band-critical" but not "critical")
  if (!EXPLICIT_GLOSSARY[nameKey]) {
    DERIVED_BAND_NAMES[nameKey] = {
      key: nameKey,
      label: band.name,
      definition: `${band.desc} Composite range: ${band.range}.`,
    };
  }
}

// ── Merged GLOSSARY: explicit wins; derived fill gaps ────────────────────────
//
// Order: derived band names < derived dim names < derived subdims < explicit
// Explicit always wins on collision.

export const GLOSSARY: Record<string, GlossaryEntry> = {
  ...DERIVED_BAND_NAMES,
  ...DERIVED_DIM_NAMES,
  ...DERIVED_SUBDIM,
  ...EXPLICIT_GLOSSARY,
};

// ── Lookup helpers ────────────────────────────────────────────────────────────

/**
 * Normalize a lookup key: lowercase, trim, collapse internal whitespace.
 * Tries the raw key first, then a hyphen-collapsed variant (e.g. "band critical"
 * → "band-critical") to tolerate caller formatting differences.
 */
function normalizeKey(raw: string): string[] {
  const base = raw.toLowerCase().trim().replace(/\s+/g, " ");
  // Also try collapsing spaces to hyphens (e.g. "band critical" → "band-critical")
  const hyphenated = base.replace(/\s+/g, "-");
  // Also try stripping hyphens to spaces ("band-critical" → "band critical")
  const spaced = base.replace(/-/g, " ");
  // Return unique candidates in priority order
  const candidates = [base];
  if (hyphenated !== base) candidates.push(hyphenated);
  if (spaced !== base && spaced !== hyphenated) candidates.push(spaced);
  return candidates;
}

/**
 * Lookup helper. Returns null when the term is not in the registry —
 * callers should fall back to rendering plain text in that case.
 *
 * Case-insensitive and tolerant of spaces vs. hyphens.
 * Explicit entries always win over derived entries.
 */
export function getGlossaryEntry(term: string): GlossaryEntry | null {
  for (const candidate of normalizeKey(term)) {
    const hit = GLOSSARY[candidate];
    if (hit) return hit;
  }
  return null;
}
