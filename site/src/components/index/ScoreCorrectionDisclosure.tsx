/**
 * ScoreCorrectionDisclosure — notice for an index whose published scores
 * moved substantially because the underlying data was corrected, not
 * because the entities themselves changed.
 *
 * Sibling of PartialCoverageDisclosure — same structure, same amber accent
 * (not a band color — see globals.css: band colors are semantic score
 * encoding only and must not be reused for chrome), same "callers pass the
 * facts so copy stays accurate" pattern.
 *
 * This component is presentational only. Callers pass the specific facts
 * (counts, examples, the mean correction) so the copy stays accurate to the
 * underlying dataset rather than being hardcoded here.
 */

import Container from "@/components/ui/Container";

export interface ScoreCorrectionExample {
  name: string;
  from: number;
  to: number;
}

/** A group of entities that shared one identical placeholder score, evidence that the
 * placeholder was invented rather than assessed, paired with what each now scores. */
export interface IdenticalPlaceholderExample {
  /** The single placeholder value all listed entities shared, e.g. 25.0. */
  placeholderValue: number;
  /** The entities that shared it, each with its corrected, evidence-based score. */
  entities: { name: string; to: number }[];
}

export interface ScoreCorrectionDisclosureProps {
  /** Number of entities now backed by a dated, cited, individual assessment. */
  assessedCount: number;
  /** Full size of the set this index covers. */
  totalCount: number;
  /** Number of previously published rows replaced by a new assessment. */
  replacedCount: number;
  /** Number of entities receiving their first-ever individual assessment (no prior published row). */
  firstBaselineCount: number;
  /** Mean absolute point change across all replaced rows. */
  meanAbsoluteCorrection: number;
  /** Number of entities whose score fell. */
  fellCount: number;
  /** Number of entities whose score rose. */
  roseCount: number;
  /** The largest single downward correction, for concreteness. */
  largestDrop: ScoreCorrectionExample;
  /** The largest single upward correction, for concreteness. */
  largestRise: ScoreCorrectionExample;
  /** A set of entities that shared one identical, invented placeholder score before
   * correction — the clearest evidence the old numbers were never assessed. */
  identicalPlaceholderExample: IdenticalPlaceholderExample;
  /** Number of entities previously published in the top (Exemplary) band. */
  previouslyExemplary: number;
  /** Number of entities that reach the Exemplary band on the corrected, evidence-based scores. */
  nowExemplary: number;
  /** Plural label for the entity kind, e.g. "states". Defaults to "states". */
  unitLabelPlural?: string;
  children?: React.ReactNode;
}

export default function ScoreCorrectionDisclosure({
  assessedCount,
  totalCount,
  replacedCount,
  firstBaselineCount,
  meanAbsoluteCorrection,
  fellCount,
  roseCount,
  largestDrop,
  largestRise,
  identicalPlaceholderExample,
  previouslyExemplary,
  nowExemplary,
  unitLabelPlural = "states",
  children,
}: ScoreCorrectionDisclosureProps) {
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
              Score correction notice
            </p>
            <span className="text-muted text-[0.78rem]">·</span>
            <span className="text-muted text-[0.82rem]">
              {assessedCount} of {totalCount} now individually assessed
            </span>
          </div>
          <h2 className="text-[1.2rem] sm:text-[1.32rem] font-bold leading-snug mb-2">
            These scores changed because the benchmark was corrected, not because the entities changed.
          </h2>
          <div className="text-muted text-[0.9rem] sm:text-[0.94rem] leading-relaxed space-y-2 max-w-3xl">
            <p>
              Every score in this index is now derived from a dated, cited, individual assessment —
              the first time that has been true.{" "}
              <span className="text-text font-medium">{replacedCount} previously published rows</span>{" "}
              were replaced and{" "}
              <span className="text-text font-medium">{firstBaselineCount} entities</span> received a
              first-ever assessment. The scores they replace were a bulk data import, never
              individual assessments, and carried no assessment date.
            </p>
            <p>
              Corrections moved in both directions:{" "}
              <span className="text-text font-medium">{fellCount} fell</span> and{" "}
              <span className="text-text font-medium">{roseCount} rose</span>, a mean absolute change
              of <span className="text-text font-medium">{meanAbsoluteCorrection.toFixed(1)} points</span>.
              The largest drop was{" "}
              <span className="text-text font-medium">
                {largestDrop.name} ({largestDrop.from.toFixed(1)} → {largestDrop.to.toFixed(1)})
              </span>
              , and the largest rise was{" "}
              <span className="text-text font-medium">
                {largestRise.name} ({largestRise.from.toFixed(1)} → {largestRise.to.toFixed(1)})
              </span>
              . This is a correction, not a downgrade.
            </p>
            <p>
              The clearest evidence the old numbers were meaningless:{" "}
              <span className="text-text font-medium">
                {identicalPlaceholderExample.entities.length} {unitLabelPlural} —{" "}
                {identicalPlaceholderExample.entities.map((e) => e.name).join(", ")}
              </span>{" "}
              all carried an identical placeholder of exactly{" "}
              {identicalPlaceholderExample.placeholderValue.toFixed(1)} with byte-identical dimension
              scores. They now score{" "}
              {identicalPlaceholderExample.entities.map((e) => e.to.toFixed(1)).join(", ")}. One
              invented number, a real spread on evidence.
            </p>
            <p>
              <span className="text-text font-medium">
                {previouslyExemplary} entities were previously published in the top (Exemplary) band.
                On evidence, {nowExemplary} reach it.
              </span>{" "}
              Part of the old top tier was inflated by an integration premium — a methodology feature
              that rewards genuinely balanced performance across dimensions — being awarded to
              invented, uniformly high placeholder scores it was never meant to apply to.
            </p>
            <p>
              A known limitation: roughly one in five evidence citations in the earliest assessments
              in this campaign carry a year-anchored rather than day-precise publication date. Later
              assessments in the campaign mark date precision explicitly. The underlying claims are
              sourced; some publication dates are precise only to the month or year.
            </p>
            {children}
          </div>
        </div>
      </Container>
    </section>
  );
}
