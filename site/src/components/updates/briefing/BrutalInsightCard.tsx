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
 *   1. updates.editorialInsight (explicit field, preferred)
 *   2. Derived from lead signal + methodology evolution context
 *   3. Hidden if neither is available
 *
 * Briefings are finalized publications. No "requires review", no
 * "decision required" language. Every insight reads as confident editorial.
 *
 * No em dashes. No generic framing. Insight must be specific to the day.
 */
export default function BrutalInsightCard({ updates }: Props) {
  const topSignals: any[] = Array.isArray(updates.topSignals) ? updates.topSignals : [];
  const methodologyNotes: any[] = Array.isArray(updates.methodologyNotes) ? updates.methodologyNotes : [];

  // If an explicit editorial insight field exists, use it directly.
  if (updates.editorialInsight && typeof updates.editorialInsight === "string") {
    return <InsightBlock text={updates.editorialInsight} />;
  }

  // Otherwise, derive from lead signal + methodology context.
  const lead = pickLeadSignal(topSignals);
  if (!lead) return null;

  // Look for methodology-category-driving-band-crossing note
  const novelCategoryNote = methodologyNotes.find(
    (n: any) => n.type === "novel-category-driving-band-crossing",
  );

  let insight: string | null = null;
  const isMethodologyEvolution =
    lead.actionType === "methodology-evolution" ||
    lead.actionType === "band-crossing-finding";

  if (novelCategoryNote) {
    // Specific insight: novel category driving a band crossing
    const entity: string = novelCategoryNote.entity ?? lead.slug ?? "";
    insight =
      `${entity}'s band crossing rests on a conduct pattern the methodology is ` +
      `formalizing in this cycle. The dimensional dock is documented and the ` +
      `band crossing is logged. The reading worth holding is that boundary cases ` +
      `are where the rulebook gets sharpened, and the rulebook is sharper today ` +
      `than it was yesterday.`;
  } else if (isMethodologyEvolution) {
    const entity: string = lead.slug ?? "this entity";
    insight =
      `The ${entity} finding is a methodology-evolution case as much as a ` +
      `score finding. The evidence pattern is the kind of pattern the benchmark ` +
      `is built to surface, and surfacing it is what the public record is for.`;
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
