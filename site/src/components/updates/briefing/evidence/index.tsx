/**
 * evidence/index.tsx — shared evidence primitives for Wave F2
 *
 * Exports:
 *   EvidenceItem        — type matching DAILY_BRIEFING_SCHEMA §2c-evidence
 *   TIER_LABELS         — display text for sourceTier 1–5
 *   TIER_COLORS         — hex colors for each tier
 *   TIER_RELIABILITY_CUTOFF_DATE — first briefing date (YYYY-MM-DD) whose
 *                          sourceTier values were mechanically verified against
 *                          the documented scale (EV-1)
 *   isTierReliable       — true when a briefing date is on/after the cutoff
 *   TIER_UNRELIABLE_NOTICE — explanatory copy for pre-cutoff briefings
 *   ExternalLinkIcon    — shared 10×10 SVG for external links
 *   SourceChip          — named link "Publisher ↗" with optional tier badge
 *   EvidenceQuote       — verbatim <blockquote> + SourceChip attribution
 *
 * Guard pattern for callers:
 *   const evidence = Array.isArray(signal.evidence) ? signal.evidence : [];
 *
 * All components are Server Components (no "use client"). Static-export safe.
 *
 * ─── EV-1 tier-scale correction (2026-09-21) ──────────────────────────────────
 * The tier maps below previously ran inverted against the documented scale in
 * overnight-assessor.md §"Evidence Tier" (5 = government/court/treaty-body
 * down to 1 = trade press/advocacy). They are now correct: 5 is the strongest
 * tier. See docs/EVIDENCE_TIER_CONVENTION_2026-09-20.md for the full audit —
 * source data itself was NOT migrated (that is a separate, founder-owned
 * decision per AUTONOMY.md §1c), so briefings dated before
 * TIER_RELIABILITY_CUTOFF_DATE must not show a tier badge: their sourceTier
 * values were authored under an inconsistent mix of the correct and inverted
 * convention and cannot be trusted under either label.
 */

import { extractDomain } from "../utils";

// ─── Type ─────────────────────────────────────────────────────────────────────

export interface EvidenceItem {
  quote?: string;
  claim?: string;
  source: string;
  url?: string;
  publishedDate?: string;
  sourceTier?: 1 | 2 | 3 | 4 | 5;
  archivedUrl?: string;
}

// ─── Tier metadata ────────────────────────────────────────────────────────────
// Documented scale (overnight-assessor.md, overnight-digest.md "Tier 5 —
// strongest evidence"): 5 = government/court/treaty-body; 4 = international
// org / UN mission; 3 = watchdog NGO; 2 = top-tier journalism; 1 = trade
// press/advocacy. Higher number = stronger evidence.

export const TIER_LABELS: Record<number, string> = {
  5: "Tier 5 · Gov/Court",
  4: "Tier 4 · UN/IO",
  3: "Tier 3 · NGO",
  2: "Tier 2 · Journalism",
  1: "Tier 1 · Trade/Advocacy",
};

export const TIER_SHORT_LABELS: Record<number, string> = {
  5: "Primary source",
  4: "Cross-referenced",
  3: "NGO",
  2: "Journalism",
  1: "Advocacy",
};

export const TIER_COLORS: Record<number, string> = {
  5: "#fcd34d",
  4: "#86efac",
  3: "#7dd3fc",
  2: "#a78bfa",
  1: "#94a3b8",
};

// ─── Tier reliability cutoff (EV-1) ───────────────────────────────────────────
// 2026-09-17 is the first date the claim-to-source gate was live-enforced and
// the first cycle whose tiers were verified mechanically against the
// documented scale (per the EV-1 audit). Briefings dated before this may have
// been authored under either convention — indistinguishably — so their tier
// badges are suppressed rather than reinterpreted.

export const TIER_RELIABILITY_CUTOFF_DATE = "2026-09-17";

/** True when a briefing date (YYYY-MM-DD) is on/after the tier-reliability cutoff. */
export function isTierReliable(briefingDate?: string | null): boolean {
  return typeof briefingDate === "string" && briefingDate >= TIER_RELIABILITY_CUTOFF_DATE;
}

export const TIER_UNRELIABLE_NOTICE =
  "Source-tier badges are shown only from 2026-09-17 onward. Earlier briefings mixed two conflicting tier scales, so their tier values are not shown rather than risk mislabeling a source's provenance.";

// ─── Shared icon ──────────────────────────────────────────────────────────────

export function ExternalLinkIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M1.5 8.5L8.5 1.5M4.5 1.5H8.5V5.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── SourceChip ───────────────────────────────────────────────────────────────

interface SourceChipProps {
  /** Fully-qualified URL — required. */
  url: string;
  /** Publisher / source label. Falls back to extractDomain(url). */
  source?: string;
  /** Publication date (YYYY-MM-DD). Rendered as "· date" when present. */
  date?: string;
  /** sourceTier 1–5. Renders a subtle tier badge when present AND reliable (see briefingDate). */
  tier?: number;
  /**
   * The briefing cycle's own date (YYYY-MM-DD) — NOT the source's publishedDate.
   * Gates the tier badge via isTierReliable(); omitted/pre-cutoff suppresses the
   * badge (EV-1). Always pass updates.date / the containing briefing's date here.
   */
  briefingDate?: string | null;
  /** Additional CSS classes for the anchor element. */
  className?: string;
}

/**
 * SourceChip — a named external-link element: "Al Jazeera ↗"
 *
 * - Validates url is non-empty before rendering (returns null if absent)
 * - Sets rel="noopener noreferrer" target="_blank"
 * - aria-label includes display name + "(opens in new tab)"
 * - Optional tier badge rendered inline after the link, only for briefings on
 *   or after TIER_RELIABILITY_CUTOFF_DATE (EV-1)
 */
export function SourceChip({
  url,
  source,
  date,
  tier,
  briefingDate,
  className,
}: SourceChipProps) {
  if (!url || !url.trim()) return null;

  const display = (source && source.trim()) ? source.trim() : extractDomain(url);
  const tierReliable = isTierReliable(briefingDate);
  const tierColor = tier && tierReliable ? TIER_COLORS[tier] : null;
  const tierLabel = tier && tierReliable ? TIER_SHORT_LABELS[tier] : null;

  return (
    <span className="inline-flex items-center gap-1.5 flex-wrap">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Open source: ${display} (opens in new tab)`}
        className={
          className ??
          "inline-flex items-center gap-1 text-[0.75rem] text-[#7dd3fc] hover:text-text transition-colors underline underline-offset-2 decoration-[rgba(125,211,252,0.35)] font-medium"
        }
      >
        {display}
        <ExternalLinkIcon />
      </a>
      {date && (
        <span className="text-[0.72rem] text-muted" aria-label={`Published ${date}`}>
          {date}
        </span>
      )}
      {tierLabel && tierColor && (
        <span
          className="text-[0.65rem] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border"
          style={{
            color: tierColor,
            borderColor: `${tierColor}44`,
            background: `${tierColor}12`,
          }}
          title={TIER_LABELS[tier!]}
        >
          {tierLabel}
        </span>
      )}
    </span>
  );
}

// ─── EvidenceQuote ────────────────────────────────────────────────────────────

interface EvidenceQuoteProps {
  item: EvidenceItem;
  /** When true, shows only the SourceChip (no blockquote). Used in compact contexts. */
  chipOnly?: boolean;
  /**
   * The briefing cycle's own date (YYYY-MM-DD) — gates the SourceChip's tier
   * badge via isTierReliable() (EV-1). Pass updates.date from the caller.
   */
  briefingDate?: string | null;
}

/**
 * EvidenceQuote — verbatim <blockquote> with SourceChip attribution.
 *
 * When item.quote is present:
 *   <blockquote cite={url}>
 *     <q>{quote}</q>
 *   </blockquote>
 *   <SourceChip …>
 *
 * When item.quote is absent (chip-only mode, or chipOnly=true):
 *   <SourceChip …>
 *
 * Returns null when no url AND no source are present (safety guard).
 */
export function EvidenceQuote({ item, chipOnly = false, briefingDate }: EvidenceQuoteProps) {
  const hasQuote =
    !chipOnly &&
    typeof item.quote === "string" &&
    item.quote.trim().length > 0;
  const hasUrl =
    typeof item.url === "string" && item.url.trim().length > 0;
  const hasSource =
    typeof item.source === "string" && item.source.trim().length > 0;

  if (!hasUrl && !hasSource) return null;

  return (
    <figure className="my-0">
      {hasQuote && (
        <blockquote
          cite={hasUrl ? item.url : undefined}
          className="border-l-2 border-[rgba(125,211,252,0.4)] pl-3 mb-2 italic text-[0.875rem] text-text leading-relaxed"
        >
          <q>{item.quote}</q>
        </blockquote>
      )}
      <figcaption className="flex items-center gap-1.5 flex-wrap">
        {hasUrl ? (
          <SourceChip
            url={item.url!}
            source={item.source}
            date={item.publishedDate}
            tier={item.sourceTier}
            briefingDate={briefingDate}
          />
        ) : (
          <span className="text-[0.75rem] text-muted font-medium">
            {item.source}
            {item.publishedDate && (
              <span className="ml-1 text-muted">{item.publishedDate}</span>
            )}
          </span>
        )}
        {item.archivedUrl && (
          <a
            href={item.archivedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[0.68rem] text-muted hover:text-text transition-colors underline underline-offset-1"
            aria-label="Open archived snapshot (opens in new tab)"
          >
            archived
          </a>
        )}
      </figcaption>
    </figure>
  );
}

// ─── SourcesDisclosure ────────────────────────────────────────────────────────

interface SourcesDisclosureProps {
  evidence: EvidenceItem[];
  /**
   * When true, renders a full EvidenceQuote per item (with blockquote).
   * When false (default), renders chip-only rows — compact for signal cards.
   */
  withQuotes?: boolean;
  /**
   * The briefing cycle's own date (YYYY-MM-DD) — gates each item's SourceChip
   * tier badge via isTierReliable() (EV-1). Pass updates.date from the caller.
   */
  briefingDate?: string | null;
}

/**
 * SourcesDisclosure — native <details> "Sources (N)" disclosure.
 *
 * Renders only when evidence.length >= 2 (per spec: 0–1 items are handled
 * inline; the disclosure is for the long tail). Content stays in DOM for
 * Pagefind and a11y.
 *
 * Closed by default.
 */
export function SourcesDisclosure({
  evidence,
  withQuotes = false,
  briefingDate,
}: SourcesDisclosureProps) {
  const items = Array.isArray(evidence) ? evidence : [];
  if (items.length < 2) return null;

  return (
    <details className="mt-2">
      <summary
        className="cursor-pointer text-[0.75rem] font-semibold text-muted hover:text-text transition-colors select-none list-none flex items-center gap-1"
        aria-label={`Show all ${items.length} sources`}
      >
        <span className="inline-block w-3 h-3 mr-0.5 text-[0.65rem] details-marker" aria-hidden="true">▸</span>
        Sources ({items.length})
      </summary>
      <div className="mt-2 space-y-3 pl-1">
        {items.map((item, i) => (
          <EvidenceQuote
            key={`${item.url ?? item.source}-${i}`}
            item={item}
            chipOnly={!withQuotes}
            briefingDate={briefingDate}
          />
        ))}
      </div>
    </details>
  );
}
