/**
 * evidence/index.tsx — shared evidence primitives for Wave F2
 *
 * Exports:
 *   EvidenceItem        — type matching DAILY_BRIEFING_SCHEMA §2c-evidence
 *   TIER_LABELS         — display text for sourceTier 1–5
 *   TIER_COLORS         — hex colors for each tier
 *   ExternalLinkIcon    — shared 10×10 SVG for external links
 *   SourceChip          — named link "Publisher ↗" with optional tier badge
 *   EvidenceQuote       — verbatim <blockquote> + SourceChip attribution
 *
 * Guard pattern for callers:
 *   const evidence = Array.isArray(signal.evidence) ? signal.evidence : [];
 *
 * All components are Server Components (no "use client"). Static-export safe.
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

export const TIER_LABELS: Record<number, string> = {
  1: "Tier 1 · Gov/Court",
  2: "Tier 2 · UN/IO",
  3: "Tier 3 · NGO",
  4: "Tier 4 · Journalism",
  5: "Tier 5 · Trade/Advocacy",
};

export const TIER_SHORT_LABELS: Record<number, string> = {
  1: "Primary source",
  2: "Cross-referenced",
  3: "NGO",
  4: "Journalism",
  5: "Advocacy",
};

export const TIER_COLORS: Record<number, string> = {
  1: "#fcd34d",
  2: "#86efac",
  3: "#7dd3fc",
  4: "#a78bfa",
  5: "#94a3b8",
};

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
  /** sourceTier 1–5. Renders a subtle tier badge when present. */
  tier?: number;
  /** Additional CSS classes for the anchor element. */
  className?: string;
}

/**
 * SourceChip — a named external-link element: "Al Jazeera ↗"
 *
 * - Validates url is non-empty before rendering (returns null if absent)
 * - Sets rel="noopener noreferrer" target="_blank"
 * - aria-label includes display name + "(opens in new tab)"
 * - Optional tier badge rendered inline after the link
 */
export function SourceChip({
  url,
  source,
  date,
  tier,
  className,
}: SourceChipProps) {
  if (!url || !url.trim()) return null;

  const display = (source && source.trim()) ? source.trim() : extractDomain(url);
  const tierColor = tier ? TIER_COLORS[tier] : null;
  const tierLabel = tier ? TIER_SHORT_LABELS[tier] : null;

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
export function EvidenceQuote({ item, chipOnly = false }: EvidenceQuoteProps) {
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
          />
        ))}
      </div>
    </details>
  );
}
