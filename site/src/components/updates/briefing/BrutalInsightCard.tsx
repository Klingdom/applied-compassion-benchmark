/* eslint-disable @typescript-eslint/no-explicit-any */
import Container from "@/components/ui/Container";
import { pickLeadSignal } from "./utils";

interface Props {
  updates: any;
}

/**
 * BrutalInsightCard - a short interpretive insight derived from briefing context.
 *
 * Source priority:
 *   1. updates.editorialInsight (explicit field, not yet in any briefing)
 *   2. Derived from lead signal's actionRequired + pendingReview context
 *   3. Hidden if neither is available
 *
 * No em dashes. No generic framing. Insight must be specific to the day.
 */
export default function BrutalInsightCard({ updates }: Props) {
  const topSignals: any[] = Array.isArray(updates.topSignals) ? updates.topSignals : [];
  const pendingReview: any[] = Array.isArray(updates.pendingReview) ? updates.pendingReview : [];
  const methodologyNotes: any[] = Array.isArray(updates.methodologyNotes) ? updates.methodologyNotes : [];

  // If an explicit editorial insight field exists, use it directly.
  if (updates.editorialInsight && typeof updates.editorialInsight === "string") {
    return <InsightBlock text={updates.editorialInsight} />;
  }

  // Otherwise, derive from lead signal + pending review.
  const lead = pickLeadSignal(topSignals);
  if (!lead) return null;

  // Look for methodology-category-driving-band-crossing note
  const novelCategoryNote = methodologyNotes.find(
    (n: any) => n.type === "novel-category-driving-band-crossing",
  );

  let insight: string | null = null;

  if (novelCategoryNote && lead.actionRequired) {
    // Specific insight: novel category + band crossing requires precedent decision
    const entity: string = novelCategoryNote.entity ?? lead.slug ?? "";
    insight =
      `${entity}'s band crossing rests on a methodology category not yet formalized. ` +
      `This is not a measurement question. It is a precedent-setting question about ` +
      `whether the underlying conduct pattern can score at the entity level before the ` +
      `scoring rulebook formalizes it. Committing the change without formalizing the ` +
      `category sets methodology precedent by accident. Rejecting it without explanation ` +
      `leaves documented conduct unscored. The resolution requires an explicit decision, not a default.`;
  } else if (lead.actionRequired && pendingReview.length > 0) {
    const pr = pendingReview[0];
    const entity: string = pr.entity ?? lead.slug ?? "";
    const alt: string = pr.alternativeIfRejected ?? "";
    insight =
      `The ${entity} assessment cannot be resolved by pipeline logic alone. ` +
      `Apply=true was set automatically by the band-crossing protocol, but the ` +
      `underlying dimensional change rests on evidence the methodology has not ` +
      `yet formally categorized.` +
      (alt
        ? ` The documented alternative: ${alt}`
        : ``);
  } else if (lead.actionRequired) {
    // Generic actionRequired without novel category
    const entity: string = lead.slug ?? "";
    insight =
      `The ${entity} finding requires editorial judgment, not pipeline confirmation. ` +
      `The assessment protocol flagged it correctly. The question is what the resolution ` +
      `communicates about the methodology's scope boundaries going forward.`;
  }

  if (!insight) return null;

  return <InsightBlock text={insight} />;
}

function InsightBlock({ text }: { text: string }) {
  return (
    <section
      aria-label="Editorial insight"
      className="py-[20px]"
    >
      <Container>
        <div className="rounded-[18px] border border-[rgba(125,211,252,0.22)] bg-[rgba(125,211,252,0.05)] p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div
              aria-hidden="true"
              className="shrink-0 mt-[3px] w-[3px] self-stretch rounded-full bg-[#7dd3fc] opacity-70"
            />
            <div>
              <div className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-[#7dd3fc] mb-2">
                Editorial insight
              </div>
              <p className="text-text text-[0.97rem] leading-relaxed font-medium">
                {text}
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
