/* eslint-disable @typescript-eslint/no-explicit-any */
import Container from "@/components/ui/Container";
import { pickLeadSignal } from "./utils";

interface Props {
  updates: any;
}

/**
 * HighCompassionContrast - constructive contrast block after the lead signal.
 *
 * Fields:
 *   - What responsible action would look like
 *   - What evidence would improve the score
 *   - What evidence would worsen the score
 *
 * Derived from: lead signal actionRequired + pendingReview[].alternativeIfRejected.
 * Hidden when neither is available.
 */
export default function HighCompassionContrast({ updates }: Props) {
  const topSignals: any[] = Array.isArray(updates.topSignals) ? updates.topSignals : [];
  const pendingReview: any[] = Array.isArray(updates.pendingReview) ? updates.pendingReview : [];

  const lead = pickLeadSignal(topSignals);
  if (!lead) return null;

  // Only render when there is something specific to contrast
  if (!lead.actionRequired && pendingReview.length === 0) return null;

  const pr: any = pendingReview.find(
    (r: any) => r.slug === lead.slug,
  ) ?? pendingReview[0] ?? null;

  const entityName: string =
    pr?.entity ?? lead.slug ?? "this entity";

  // Derive the three contrast points
  const responsibleAction = pr?.reason
    ? `Apply requires human review. The documented alternative: ${pr.alternativeIfRejected ?? "confirm at current score and escalate boundary watch pending methodology category formalization."}`
    : lead.actionType === "human-review-band-crossing"
    ? `Confirm or reject the band crossing with explicit written rationale. If rejected, document the boundary watch escalation and set a review window tied to the pending evidence event.`
    : null;

  const wouldImprove = (() => {
    // Look for carry-forward watches for the entity
    const cfwatches: any[] = Array.isArray(updates.carryForwardWatches)
      ? updates.carryForwardWatches
      : [];
    const watch = cfwatches.find((w: any) => w.slug === lead.slug);
    if (watch?.watch) return watch.watch;
    // Fallback: derive from signal description keywords
    if (/sanctions|sanctions package|formalized/i.test(lead.description ?? "")) {
      return "Methodology category formalization followed by legislative or enforcement action that withdraws the underlying conduct. Documented reversal of the designated entity supply chain.";
    }
    return null;
  })();

  const wouldWorsen = (() => {
    // Look in emerging risks for this slug
    const risks: any[] = Array.isArray(updates.emergingRisks) ? updates.emergingRisks : [];
    const risk = risks.find(
      (r: any) =>
        Array.isArray(r.affectedEntities) &&
        r.affectedEntities.includes(lead.slug),
    );
    if (risk?.description) {
      const parts = risk.description.split(/(?<=[.!?])\s+/);
      return parts.slice(0, 2).join(" ");
    }
    return null;
  })();

  // Need at least one substantive point to render
  if (!responsibleAction && !wouldImprove && !wouldWorsen) return null;

  return (
    <section
      aria-label={`Compassion contrast for ${entityName}`}
      className="py-[20px]"
    >
      <Container>
        <div className="rounded-[18px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-5 sm:p-6">
          <div className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-muted mb-4">
            Compassion contrast &mdash; {entityName}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {responsibleAction && (
              <div>
                <div className="text-[0.68rem] font-bold uppercase tracking-wider text-[#7dd3fc] mb-2">
                  Responsible action
                </div>
                <p className="text-[0.88rem] text-muted leading-relaxed">
                  {responsibleAction}
                </p>
              </div>
            )}
            {wouldImprove && (
              <div>
                <div className="text-[0.68rem] font-bold uppercase tracking-wider text-[#86efac] mb-2">
                  Would improve score
                </div>
                <p className="text-[0.88rem] text-muted leading-relaxed">
                  {wouldImprove}
                </p>
              </div>
            )}
            {wouldWorsen && (
              <div>
                <div className="text-[0.68rem] font-bold uppercase tracking-wider text-[#f87171] mb-2">
                  Would worsen score
                </div>
                <p className="text-[0.88rem] text-muted leading-relaxed">
                  {wouldWorsen}
                </p>
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
