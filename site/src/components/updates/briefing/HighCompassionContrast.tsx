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
 * Briefings are finalized publications. The block reads as confident editorial
 * commentary, not a request for review. The "Responsible action" panel
 * describes what the responsible-action pathway looks like for the lead-signal
 * entity given the evidence on the record today.
 *
 * Derived from: lead signal's actionType + sibling context (carry-forward
 * watches, emerging risks). Hidden when no substantive point can be made.
 */
export default function HighCompassionContrast({ updates }: Props) {
  const topSignals: any[] = Array.isArray(updates.topSignals) ? updates.topSignals : [];

  const lead = pickLeadSignal(topSignals);
  if (!lead) return null;

  const entityName: string = lead.slug ?? "this entity";

  // Derive the three contrast points (no "human review" / "decision required" language)
  const responsibleAction = (() => {
    if (lead.actionType === "methodology-evolution") {
      return (
        `Treat the published score as the lower-confidence reading and the ` +
        `documented evidence pattern as the higher-confidence record. Use the ` +
        `evidence trail for institutional decisions and watch the methodology ` +
        `update for the formal scoring change in the next cycle.`
      );
    }
    if (lead.actionType === "band-crossing-finding") {
      return (
        `Treat the band crossing as the published reading of record. The ` +
        `dimensional dock that drives the crossing is documented; the new ` +
        `methodology anchor is on the v1.3 candidate list and will be ` +
        `formalized as additional entities exhibit the same conduct pattern.`
      );
    }
    return null;
  })();

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
