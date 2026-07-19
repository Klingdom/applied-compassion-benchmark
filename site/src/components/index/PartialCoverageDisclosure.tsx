/**
 * PartialCoverageDisclosure — data-coverage notice for indexes published
 * with an incomplete entity set.
 *
 * Styled after FloorDesignationsPanel's methodology-disclosure pattern, but
 * uses a distinct amber accent (not a band color — see globals.css: band
 * colors are semantic score encoding only and must not be reused for chrome).
 *
 * This component is presentational only. Callers pass the specific facts
 * (counts, example rank gap) so the copy stays accurate to the underlying
 * dataset rather than being hardcoded here.
 */

import Container from "@/components/ui/Container";

export interface PartialCoverageDisclosureProps {
  /** Number of entities currently published in this index. */
  publishedCount: number;
  /** Full size of the set this index is meant to cover. */
  totalCount: number;
  /** Label for one unit of the entity kind, e.g. "U.S. jurisdiction". */
  unitLabel: string;
  /** Plural label, e.g. "U.S. jurisdictions (50 states and the District of Columbia)". */
  unitLabelPlural: string;
  children?: React.ReactNode;
}

export default function PartialCoverageDisclosure({
  publishedCount,
  totalCount,
  unitLabel,
  unitLabelPlural,
  children,
}: PartialCoverageDisclosureProps) {
  const missingCount = totalCount - publishedCount;
  return (
    <section className="py-4 sm:py-5">
      <Container>
        <div className="rounded-[16px] border border-[rgba(245,158,11,0.32)] bg-gradient-to-br from-[rgba(245,158,11,0.08)] via-[rgba(245,158,11,0.03)] to-transparent p-5 sm:p-6 shadow-[0_18px_44px_rgba(0,0,0,0.28)]">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span
              className="inline-block w-2 h-2 rounded-full bg-[#f59e0b]"
              aria-hidden
            />
            <p className="text-[0.78rem] uppercase tracking-[0.14em] text-[#f59e0b] font-bold">
              Data coverage notice
            </p>
            <span className="text-muted text-[0.78rem]">·</span>
            <span className="text-muted text-[0.82rem]">
              {publishedCount} of {totalCount} {unitLabelPlural} published
            </span>
          </div>
          <h2 className="text-[1.2rem] sm:text-[1.32rem] font-bold leading-snug mb-2">
            This index is partial. Displayed rank is a position within the published set, not national rank.
          </h2>
          <div className="text-muted text-[0.9rem] sm:text-[0.94rem] leading-relaxed space-y-2 max-w-3xl">
            <p>
              This index currently publishes <span className="text-text font-medium">{publishedCount} of {totalCount} {unitLabelPlural}</span>. The
              remaining {missingCount} {missingCount === 1 ? unitLabel : `${unitLabel}s`} {missingCount === 1 ? "has" : "have"} not yet been published here.
            </p>
            {children}
          </div>
        </div>
      </Container>
    </section>
  );
}
