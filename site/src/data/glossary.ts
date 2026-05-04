/**
 * Glossary of technical terms used in Compassion Benchmark briefings.
 *
 * Each entry powers an inline <DefinedTerm> tooltip that surfaces the
 * methodology meaning of a term without leaving the page.
 *
 * Definitions are written for a non-expert reader. Keep them short
 * (1–2 sentences) and link to deeper sources when possible.
 */

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
 * Registry of glossary terms. Add new entries here; reference them by key
 * via <DefinedTerm term="..."> at any callsite.
 */
export const GLOSSARY: Record<string, GlossaryEntry> = {
  // --- Scoring fundamentals ---
  composite: {
    key: "composite",
    label: "composite score",
    definition:
      "A 0–100 weighted average of an entity's performance across all 8 compassion dimensions and their 40 subdimensions, anchored in primary-source evidence.",
    href: "/methodology",
  },

  band: {
    key: "band",
    label: "band",
    definition:
      "One of five performance tiers — Critical, Developing, Functional, Established, or Exemplary — that summarize composite-score ranges into a comparable label.",
    href: "/methodology",
  },

  "band-critical": {
    key: "band-critical",
    label: "Critical",
    definition:
      "Foundational compassion infrastructure is absent. Composite typically below 40. Immediate attention needed across multiple dimensions.",
  },
  "band-developing": {
    key: "band-developing",
    label: "Developing",
    definition:
      "Compassionate practices are emerging but remain inconsistent or reactive. Composite typically 40–55.",
  },
  "band-functional": {
    key: "band-functional",
    label: "Functional",
    definition:
      "Systems exist but have significant gaps in consistency, depth, or equity. Composite typically 55–70.",
  },
  "band-established": {
    key: "band-established",
    label: "Established",
    definition:
      "Practices are systematic, documented, and improving. Composite typically 70–85.",
  },
  "band-exemplary": {
    key: "band-exemplary",
    label: "Exemplary",
    definition:
      "Practices are independently verified, consistent, and sustained under pressure. Composite typically 85+.",
  },

  // --- Dimensions (8) ---
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

  // --- Briefing-specific terms ---
  confidence: {
    key: "confidence",
    label: "confidence",
    definition:
      "An indicator of how robust the underlying evidence is. Higher confidence reflects multiple independent primary sources, recent verification, and stable signal across subdimensions.",
    href: "/methodology",
  },

  floor: {
    key: "floor",
    label: "floor designation",
    definition:
      "A score reduction triggered when an entity meets specific evidentiary criteria — typically credible documentation of severe rights violations, systemic harm denial, or refusal to acknowledge primary-source findings.",
    href: "/methodology",
  },

  "band-change": {
    key: "band-change",
    label: "band change",
    definition:
      "A shift between two performance tiers (e.g., Functional → Developing) on the basis of new evidence. Band changes carry more weight than within-band score movements because they reflect a categorical reassessment.",
    href: "/methodology",
  },

  "first-baseline": {
    key: "first-baseline",
    label: "first baseline",
    definition:
      "An entity's initial assessment — the first published composite score and band. Subsequent reviews compare against this baseline to surface change over time.",
    href: "/methodology",
  },

  "sector-alert": {
    key: "sector-alert",
    label: "sector alert",
    definition:
      "A pattern observed across multiple entities in the same sector — for example, parallel governance failures, coordinated improvements, or shared exposure to a single externality.",
  },

  "in-window": {
    key: "in-window",
    label: "in-window",
    definition:
      "Material developments that occurred within the briefing's review window — typically the prior 24–72 hours of monitored coverage.",
  },

  "evidence-tier": {
    key: "evidence-tier",
    label: "evidence tier",
    definition:
      "A classification of source strength: Tier 1 (primary documents — filings, official statements, court records), Tier 2 (verified reporting from established outlets), Tier 3 (secondary analysis with attribution).",
    href: "/methodology",
  },
};

/**
 * Lookup helper. Returns null when the term is not in the registry —
 * callers should fall back to rendering plain text in that case.
 */
export function getGlossaryEntry(term: string): GlossaryEntry | null {
  return GLOSSARY[term.toLowerCase()] ?? null;
}
