/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * DailyBriefing — Wave B layout for the /updates route.
 *
 * Wave B changes (2026-05-29):
 * - Section reorder: editorial synthesis before raw detail
 * - Jump nav + reading progress bar (client components)
 * - Collapsible audit trail (native <details>)
 * - Completion block (Wave E1: email capture now inside completion block; standalone SubscribeCTA removed)
 *
 * Prop signature is unchanged so page wrappers require no modification.
 * Defensive defaults ensure flat legacy briefings (< 2026-05-26) still render.
 */

import Link from "next/link";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import Panel from "@/components/ui/Panel";
import Pill from "@/components/ui/Pill";
import SectionHead from "@/components/ui/SectionHead";
import CopyCiteButton from "@/components/charts/CopyCiteButton";
import Callout from "@/components/ui/Callout";
import Band from "@/components/ui/Band";
import TrackedEntityLink from "@/components/updates/TrackedEntityLink";
import {
  entityHref,
  kindToIndexSlug,
  kindToRoutePrefix,
  ALL_ENTITY_KINDS,
} from "@/lib/entityHref";
import { getAllEntities, getEntityBySlug } from "@/data/entities";
import { DIMENSIONS } from "@/data/dimensions";

// Briefing sub-components
import DailyBriefingHeader from "./briefing/DailyBriefingHeader";
import LeadSignalCard from "./briefing/LeadSignalCard";
import TodaysAnalysisSection from "./briefing/TodaysAnalysisSection";
import SignalStack from "./briefing/SignalStack";
import ScoreMovementDashboard from "./briefing/ScoreMovementDashboard";
import BoundaryWatch from "./briefing/BoundaryWatch";
import FailureModeCard from "./briefing/FailureModeCard";
import MethodologyInnovationList from "./briefing/MethodologyInnovationList";
import EvidenceLedger from "./briefing/EvidenceLedger";
// Wave B new components
import BriefingJumpNav, { type NavItem as BriefingNavItem } from "./briefing/BriefingJumpNav";
import ReadingProgress from "./briefing/ReadingProgress";
import CompletionBlock from "./briefing/CompletionBlock";
// Wave C new components
import ForwardTriggerCountdown from "./briefing/ForwardTriggerCountdown";
import ScoreSparkline from "./briefing/ScoreSparkline";
import {
  pickLeadSignal,
  normalizeBand,
  deltaColor,
  formatIndex,
  formatDateLabel,
  deriveTodayInBrief,
} from "./briefing/utils";
import TodayInBrief from "./briefing/TodayInBrief";
// Wave E2 new components
import MidBriefingSubscribe from "./briefing/MidBriefingSubscribe";
// Wave F new components (items 4 + 5)
import MovementDeltaStrip from "./briefing/MovementDeltaStrip";
import HowToReadBriefing from "./briefing/HowToReadBriefing";

interface DailyBriefingProps {
  updates: any;
  showNewsletter?: boolean;
  /** Date navigation tabs: array of { date, label, isCurrent } */
  dateNav?: { date: string; label: string; isCurrent: boolean }[];
}

// ──────────────────────────────────────────────────────────────────────────────
// Re-export formatDateLabel for consumers importing it from this module.
// Implementation lives in briefing/utils.ts (single source of truth).
// ──────────────────────────────────────────────────────────────────────────────
export { formatDateLabel } from "./briefing/utils";

// ──────────────────────────────────────────────────────────────────────────────
// Slug resolution — cross-kind lookup using canonical KIND_TABLE from entityHref
// ──────────────────────────────────────────────────────────────────────────────

function resolveSlugHref(
  entitySlug: string,
): { href: string; index: string } | null {
  for (const kind of ALL_ENTITY_KINDS) {
    if (getEntityBySlug(kind, entitySlug)) {
      return {
        href: `/${kindToRoutePrefix(kind)}/${entitySlug}`,
        index: kindToIndexSlug(kind),
      };
    }
  }
  return null;
}

// ──────────────────────────────────────────────────────────────────────────────
// Main component
// ──────────────────────────────────────────────────────────────────────────────

export default function DailyBriefing({
  updates,
  showNewsletter = true,
  dateNav,
}: DailyBriefingProps) {
  // Defensive defaults — any missing array must not crash prerender.
  // Schema drift from the overnight digest has caused build failures
  // historically. Normalising here keeps render code unchanged.
  const {
    scoreChanges = [],
    confirmations = [],
    sectorTrends = [],
    emergingRisks = [],
    insights = [],
    highlights = [],
    floorEntities = [],
    signals = [],
    holds = [],
    carryForwardDimensionalCredits = [],
    mathHygiene,
  } = updates;

  // Normalise sectorTrends: two shapes have shipped.
  const normalizedSectorTrends = (sectorTrends as any[])
    .map((t) => ({
      sector: t.sector,
      points: Array.isArray(t.points)
        ? t.points
        : t.trend
          ? [t.trend]
          : [],
    }))
    .filter((t) => t.points.length > 0);

  // ── Compute audit trail summary for the <details> label ────────────────────
  const auditConfirmCount = (confirmations as any[]).length;
  const auditHoldsCount = (holds as any[]).length;
  const auditMathFlag = mathHygiene ? 1 : 0;
  const auditFloorCount = (floorEntities as any[]).length;
  const auditParts: string[] = [];
  if (auditConfirmCount > 0) auditParts.push(`${auditConfirmCount} confirmation${auditConfirmCount !== 1 ? "s" : ""}`);
  if (auditHoldsCount > 0) auditParts.push(`${auditHoldsCount} hold${auditHoldsCount !== 1 ? "s" : ""}`);
  if (auditMathFlag > 0) auditParts.push("math-hygiene record");
  if (auditFloorCount > 0) auditParts.push(`${auditFloorCount} floor-conduct record${auditFloorCount !== 1 ? "s" : ""}`);
  const auditSummaryText = auditParts.length > 0
    ? auditParts.join(", ")
    : "methodology audit records";

  // ── Compute which sections actually render for this briefing ───────────────
  // Used by BriefingJumpNav to render ONLY chips whose anchor exists in the DOM.
  // Each guard below must mirror the condition that gates the corresponding
  // section/component in the JSX below. "Always" sections (LeadSignalCard and
  // SignalStack) always emit their anchor; conditional sections are gated here
  // with the same predicate used in the JSX.
  const presentSections: BriefingNavItem[] = [];

  // S1.6: ThirtySecondTier always present (first chip in jump nav)
  presentSections.push({ id: "today-30s", label: "30 seconds" });

  // LeadSignalCard always renders id="lead-signal" (null path emits bare anchor)
  presentSections.push({ id: "lead-signal", label: "Lead signal" });

  // ForwardTriggerCountdown renders when forwardTriggers is non-empty
  const forwardTriggers: any[] = Array.isArray(updates.forwardTriggers) ? updates.forwardTriggers : [];
  if (forwardTriggers.length > 0) {
    presentSections.push({ id: "forward-watch", label: "Forward watch" });
  }

  // SignalStack always renders id="signals" (Wave A invariant — empty state kept)
  presentSections.push({ id: "signals", label: "Signals" });

  // ScoreMovementDashboard renders when any assessment/change data is non-empty
  const hasScoreMovements =
    (Array.isArray(updates.recentAssessments) && (updates.recentAssessments as any[]).length > 0) ||
    (Array.isArray(updates.appliedChanges) && (updates.appliedChanges as any[]).length > 0) ||
    (Array.isArray(updates.pendingReview) && (updates.pendingReview as any[]).length > 0) ||
    (scoreChanges as any[]).length > 0;
  if (hasScoreMovements) {
    presentSections.push({ id: "score-movements", label: "Score movements" });
  }

  // BoundaryWatch renders when boundaryWatchEntities is non-empty
  if (Array.isArray(updates.boundaryWatchEntities) && (updates.boundaryWatchEntities as any[]).length > 0) {
    presentSections.push({ id: "boundary-watch", label: "Boundary watch" });
  }

  // SectorTrendsSection renders when normalizedSectorTrends is non-empty
  if (normalizedSectorTrends.length > 0) {
    presentSections.push({ id: "sector-findings", label: "Sector findings" });
  }

  // EvidenceLedger renders when any signal/change has linked source URLs.
  // Use the same heuristic as extractSourcesFromSignals: check for non-empty
  // source arrays in topSignals, sectorAlerts, or scoreChanges evidence.
  const topSignalsForNav: any[] = Array.isArray(updates.topSignals) ? updates.topSignals : [];
  const sectorAlertsForNav: any[] = Array.isArray(updates.sectorAlerts) ? updates.sectorAlerts : [];
  const hasEvidenceSources =
    topSignalsForNav.some((s: any) => Array.isArray(s.sources) && s.sources.length > 0) ||
    sectorAlertsForNav.some((a: any) => Array.isArray(a.sources) && a.sources.length > 0) ||
    (scoreChanges as any[]).some((c: any) =>
      (Array.isArray(c.evidence) && c.evidence.some((e: any) => typeof e === "object" && e?.url)) ||
      (Array.isArray(c.sources) && c.sources.length > 0)
    );
  if (hasEvidenceSources) {
    presentSections.push({ id: "evidence-ledger", label: "Evidence" });
  }

  // Audit trail section renders when any audit data exists (same guard as JSX below)
  if (auditConfirmCount > 0 || auditHoldsCount > 0 || auditMathFlag > 0 || (carryForwardDimensionalCredits as any[]).length > 0) {
    presentSections.push({ id: "audit-trail", label: "Audit trail" });
  }

  return (
    <>
      {/* Reading progress bar (client, fixed top) */}
      <ReadingProgress date={updates.date} />

      {/* ── 1. Header ────────────────────────────────────────────────────────── */}
      <DailyBriefingHeader updates={updates} dateNav={dateNav} />

      {/* ── Jump nav (client, sticky below navbar) ───────────────────────────── */}
      <BriefingJumpNav presentSections={presentSections} date={updates.date} />

      {/* ── S1.6: ThirtySecondTier — "Today in 30 seconds" ─────────────────── */}
      {/* Always present; promoted from TodayInBrief in header. */}
      {(() => {
        const briefItems = deriveTodayInBrief(updates);
        const forwardTriggerCount = forwardTriggers.length;
        const earliestTrigger = forwardTriggers.length > 0 ? forwardTriggers[0] : null;
        const topSignalsArr: any[] = Array.isArray(updates.topSignals) ? updates.topSignals : [];
        const leadSig = pickLeadSignal(topSignalsArr);
        const hasBandCrossing = leadSig?.actionType === "band-crossing-finding";

        // Compute pipeline line
        const pipeline = updates.pipeline ?? {};
        const pipelineParts: string[] = [];
        if (typeof pipeline.reviewed === "number" && pipeline.reviewed > 0)
          pipelineParts.push(`${pipeline.reviewed} reviewed`);
        if (typeof pipeline.assessed === "number" && pipeline.assessed > 0)
          pipelineParts.push(`${pipeline.assessed} assessed`);
        if (typeof pipeline.scoreChanges === "number" && pipeline.scoreChanges > 0)
          pipelineParts.push(`${pipeline.scoreChanges} score changes`);
        if (forwardTriggerCount > 0)
          pipelineParts.push(`${forwardTriggerCount} forward watch${forwardTriggerCount !== 1 ? "es" : ""}`);

        if (briefItems.length === 0 && pipelineParts.length === 0) return null;

        return (
          <section id="today-30s" className="py-[20px] scroll-mt-24" aria-label="Today in 30 seconds">
            <Container>
              <div className="rounded-[16px] border border-[rgba(125,211,252,0.2)] bg-[rgba(125,211,252,0.03)] px-5 py-4">
                <div className="text-[0.63rem] font-bold uppercase tracking-[0.18em] text-[#7dd3fc] mb-2">
                  Today in 30 seconds
                </div>

                {/* Pipeline line */}
                {pipelineParts.length > 0 && (
                  <p className="text-[0.75rem] text-muted mb-3 tabular-nums">
                    {pipelineParts.join(" · ")}
                  </p>
                )}

                {/* Bullets */}
                <TodayInBrief items={briefItems} />

                {/* Band-crossing flag */}
                {hasBandCrossing && (
                  <p className="text-[0.78rem] text-[#fcd34d] font-semibold mt-2">
                    Band crossing detected on lead signal — the entity moved into a different performance band.
                  </p>
                )}

                {/* Forward trigger count */}
                {forwardTriggerCount > 0 && earliestTrigger && (
                  <p className="text-[0.75rem] text-muted mt-1">
                    {forwardTriggerCount} forward trigger{forwardTriggerCount !== 1 ? "s" : ""} tracked
                    {earliestTrigger.triggerDate ? ` · earliest: ${earliestTrigger.triggerDate}` : ""}.
                  </p>
                )}
              </div>
            </Container>
          </section>
        );
      })()}

      {/* ── Item 5: Today's movement — diverging delta strip ────────────────── */}
      {/* Renders immediately after "Today in 30 seconds", before lead signal.
          Degrades gracefully: MovementDeltaStrip returns null when no assessed entities. */}
      {(() => {
        const hasAnyMovement =
          (Array.isArray(updates.recentAssessments) && (updates.recentAssessments as any[]).length > 0) ||
          (Array.isArray(updates.appliedChanges) && (updates.appliedChanges as any[]).length > 0) ||
          (Array.isArray(updates.pendingReview) && (updates.pendingReview as any[]).length > 0) ||
          (scoreChanges as any[]).length > 0;
        if (!hasAnyMovement) return null;
        return (
          <section className="py-[14px]" aria-label="Today's score movement">
            <Container>
              <div className="rounded-[16px] border border-line bg-[rgba(255,255,255,0.02)] px-5 py-4">
                <div className="text-[0.63rem] font-bold uppercase tracking-[0.18em] text-muted mb-3">
                  Today&apos;s movement
                </div>
                <MovementDeltaStrip updates={updates} />
              </div>
            </Container>
          </section>
        );
      })()}

      {/* ── Item 4: How to read this briefing — schema legend ────────────────── */}
      {/* Collapsed by default so it never taxes return visitors.
          Order: 30s → MovementDeltaStrip → HowToRead → Lead signal */}
      <section className="py-[8px]" aria-label="Schema legend">
        <Container>
          <HowToReadBriefing />
        </Container>
      </section>

      {/* ── EDITORIAL LEAD cluster ───────────────────────────────────────────── */}

      {/* 3. Lead signal card */}
      <LeadSignalCard updates={updates} />

      {/* 3a. Score sparkline for the lead signal entity (Chart of the Day) */}
      {(() => {
        const topSignals: any[] = Array.isArray(updates.topSignals) ? updates.topSignals : [];
        const lead = pickLeadSignal(topSignals);
        const leadSlug: string | null = lead?.slug ?? null;
        if (!leadSlug) return null;
        return (
          <section className="pt-0 pb-[20px]" aria-label="Score trajectory chart">
            <Container>
              <div className="rounded-[14px] border border-line bg-[rgba(255,255,255,0.02)] px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-muted mb-2">
                    Score trajectory — {lead.entity ?? lead.slug}
                  </div>
                  <ScoreSparkline slug={leadSlug} entityName={lead.entity ?? undefined} />
                </div>
              </div>
            </Container>
          </section>
        );
      })()}

      {/* 3b. Forward-trigger countdown */}
      {forwardTriggers.length > 0 && (
        <ForwardTriggerCountdown
          triggers={forwardTriggers as any[]}
          briefingDate={updates.date ?? ""}
        />
      )}

      {/* 4a. Mid-briefing subscribe (Wave E2 #10) — client, hides if already subscribed */}
      <MidBriefingSubscribe />

      {/* S1.6: Unified synthesis (BrutalInsightCard + TodaysAnalysisSection + */}
      {/* OpeningQuestion + HighCompassionContrast all folded into one section) */}
      <TodaysAnalysisSection updates={updates} />

      {/* 7. Signal stack: remaining top signals + sector alerts */}
      <SignalStack updates={updates} />

      {/* ── SYNTHESIS cluster ────────────────────────────────────────────────── */}

      {/* 8. Sector findings */}
      {normalizedSectorTrends.length > 0 && (
        <SectorTrendsSection trends={normalizedSectorTrends} date={updates.date} />
      )}

      {/* 9. Emerging risks */}
      {(emergingRisks as any[]).length > 0 && (
        <EmergingRisksSection risks={emergingRisks as any[]} date={updates.date} />
      )}

      {/* 10. Research disclosures */}
      <FailureModeCard updates={updates} />
      <MethodologyInnovationList updates={updates} />

      {/* 11. Forward signals */}
      {(signals as any[]).length > 0 && (
        <ForwardSignalsList items={signals as any[]} />
      )}

      {/* 12. Research insights (Analytical notes) */}
      {(insights as string[]).length > 0 && (
        <InsightsSection insights={insights as string[]} date={updates.date} />
      )}

      {/* ── DETAIL cluster ───────────────────────────────────────────────────── */}

      {/* 13. Score movement dashboard */}
      <ScoreMovementDashboard updates={updates} />

      {/* 14. Boundary watch */}
      <BoundaryWatch updates={updates} />

      {/* 15. Score change detail (full evidence cards) */}
      {(scoreChanges as any[]).length > 0 && (
        <LegacyScoreChangesSection
          scoreChanges={scoreChanges as any[]}
        />
      )}

      {/* 16. Evidence ledger */}
      <EvidenceLedger updates={updates} />

      {/* 17. Floor conduct documentations */}
      {(floorEntities as any[]).length > 0 && (
        <FloorConductSection items={floorEntities as any[]} date={updates.date} />
      )}

      {/* ── AUDIT TRAIL cluster (collapsible) ────────────────────────────────── */}
      {/*
        Wrapped in a native <details> disclosure.
        - Closed by default; resets on every page load.
        - Content stays in the DOM so Pagefind indexes it and screen readers
          can access it when expanded.
        - Uses dark-theme tokens; summary is keyboard-accessible by default.
      */}
      {(auditConfirmCount > 0 || auditHoldsCount > 0 || auditMathFlag > 0 || (carryForwardDimensionalCredits as any[]).length > 0) && (
        <section id="audit-trail" className="py-[20px] scroll-mt-24">
          <Container>
            <details className="group rounded-[18px] border border-line bg-[rgba(255,255,255,0.02)] overflow-hidden">
              <summary
                className={[
                  "flex items-center justify-between gap-3 px-5 py-4",
                  "cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden",
                  "hover:bg-[rgba(255,255,255,0.025)] transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(125,211,252,0.5)] focus-visible:ring-inset",
                ].join(" ")}
              >
                <div className="flex items-center gap-2.5">
                  {/* Chevron — rotates when open */}
                  <svg
                    aria-hidden="true"
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    className="text-muted shrink-0 motion-safe:transition-transform group-open:rotate-90"
                  >
                    <path
                      d="M5 2l4.5 5L5 12"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="text-[0.88rem] font-semibold text-muted">
                    Show audit trail
                  </span>
                  <span
                    className="text-[0.78rem] text-muted-subtle"
                    aria-hidden="true"
                  >
                    — {auditSummaryText}
                  </span>
                </div>
                <span className="text-[0.72rem] uppercase tracking-widest font-bold text-muted shrink-0">
                  Methodology records
                </span>
              </summary>

              {/* Audit content — always in DOM */}
              <div className="border-t border-line">
                {/* Confirmations */}
                {auditConfirmCount > 0 && (
                  <ConfirmationsSection
                    confirmations={confirmations as any[]}
                    date={updates.date}
                  />
                )}

                {/* Math hygiene */}
                {mathHygiene && <MathHygienePanel data={mathHygiene as any} />}

                {/* Carry-forward credits */}
                {(carryForwardDimensionalCredits as any[]).length > 0 && (
                  <CarryForwardCreditsPanel
                    items={carryForwardDimensionalCredits as any[]}
                  />
                )}

                {/* Holds */}
                {auditHoldsCount > 0 && (
                  <HoldsPanel items={holds as any[]} />
                )}
              </div>
            </details>
          </Container>
        </section>
      )}

      {/* 18. Floor designations registry */}
      <FloorDesignationsPanel />

      {/* ── COMPLETION block ─────────────────────────────────────────────────── */}
      <CompletionBlock updates={updates} />

      {/* ── Cite this briefing (G2.1) ────────────────────────────────────────── */}
      {/* Collapsed by default — gives journalists and researchers a copy-ready
          citation string without cluttering the reading flow for casual visitors. */}
      {updates.date && (
        <section className="py-[8px]">
          <Container>
            <details className="group rounded-[14px] border border-line bg-[rgba(255,255,255,0.02)] overflow-hidden">
              <summary className={[
                "flex items-center gap-2 px-4 py-3 cursor-pointer select-none",
                "text-[0.78rem] font-semibold text-muted hover:text-text transition-colors",
                "list-none [&::-webkit-details-marker]:hidden",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(125,211,252,0.5)] focus-visible:ring-inset",
              ].join(" ")}>
                <svg
                  aria-hidden="true"
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  className="shrink-0 transition-transform group-open:rotate-90"
                >
                  <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Cite this briefing
              </summary>
              <div className="px-4 pb-4">
                <p className="text-[0.78rem] text-muted mb-2 leading-relaxed">
                  Copy-ready citation string for journalism, research, or academic use.
                </p>
                <p
                  className="font-mono text-[0.82rem] text-text leading-relaxed select-all bg-[rgba(255,255,255,0.03)] rounded-[8px] border border-line px-3 py-2 mb-1"
                  aria-label="Citation string — click to select all"
                >
                  {`Compassion Benchmark. "Daily Briefing — ${formatDateLabel(updates.date)}." compassionbenchmark.com/updates/${updates.date}. Accessed [Month Year]. Independent — entities never pay for inclusion, score changes, or suppression of findings.`}
                </p>
                <CopyCiteButton
                  citeText={`Compassion Benchmark. "Daily Briefing — ${formatDateLabel(updates.date)}." compassionbenchmark.com/updates/${updates.date}. Accessed [Month Year]. Independent — entities never pay for inclusion, score changes, or suppression of findings.`}
                  page_type="daily-briefing"
                  path={`/updates/${updates.date}`}
                />
                <p className="text-[0.75rem] text-muted mt-2">
                  For methodology, see{" "}
                  <Link href="/methodology" className="text-accent hover:underline">
                    compassionbenchmark.com/methodology
                  </Link>
                  . Data terms:{" "}
                  <Link href="/data-licenses" className="text-accent hover:underline">
                    /data-licenses
                  </Link>
                  . Press resources:{" "}
                  <Link href="/media" className="text-accent hover:underline">
                    /media
                  </Link>
                  .
                </p>
              </div>
            </details>
          </Container>
        </section>
      )}

      {/* ── 19. Subscribe CTA ────────────────────────────────────────────────── */}
      {/* Removed Wave E1 #6: email capture is now inside CompletionBlock above,
          which is the single end-of-briefing ask. SubscribeCTA removed to avoid
          stacked duplicate subscribe blocks. The showNewsletter prop is kept for
          external callers that may set it to false (no behavioral change). */}

      {/* ── 20. Purchase CTA Callout ─────────────────────────────────────────── */}
      <section className="py-[20px]">
        <Container>
          <Callout>
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] mb-2">
              Get the full benchmark report
            </h2>
            <p className="text-muted max-w-[760px] mb-[18px]">
              Daily briefings surface headline findings. Full benchmark reports
              include complete methodology documentation, all 40 subdimension
              scores, full evidence trails, certified assessments, and
              sector-level analysis packages.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Button href="/purchase-research" variant="primary">
                Purchase Research
              </Button>
              <Button href="/certified-assessments">
                Request Certified Assessment
              </Button>
              <Button href="/advisory">Book Advisory</Button>
            </div>
          </Callout>
        </Container>
      </section>

      {/* ── 21. Archive nav ──────────────────────────────────────────────────── */}
      <section className="py-[20px]">
        <Container>
          <div className="flex gap-3 flex-wrap items-center justify-between">
            <p className="text-muted text-[0.88rem]">
              Viewing{" "}
              <span className="text-text font-semibold">
                {formatDateLabel(updates.date)}
              </span>
            </p>
            <Link
              href="/updates"
              className="inline-flex items-center gap-1.5 text-[0.85rem] text-[#7dd3fc] hover:text-text transition-colors font-medium"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M9 2L4 7l5 5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              View archive
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Legacy section components (preserved for backward compatibility and sections
// not yet ported to the new briefing subfolder architecture)
// ──────────────────────────────────────────────────────────────────────────────

function LegacyScoreChangesSection({
  scoreChanges,
}: {
  scoreChanges: any[];
}) {
  // Wave-A fix: do not render a card that has both an empty/whitespace headline
  // AND an empty evidence array — named cards with no explanation contradict
  // the evidence-first brand. Keep entries that have either.
  const visibleChanges = scoreChanges.filter((change: any) => {
    const hasHeadline = typeof change.headline === "string" && change.headline.trim().length > 0;
    const hasEvidence =
      (Array.isArray(change.evidence) && change.evidence.length > 0) ||
      (Array.isArray(change.keyEvidence) && change.keyEvidence.length > 0);
    return hasHeadline || hasEvidence;
  });

  if (visibleChanges.length === 0) return null;

  return (
    <section id="score-changes-detail" className="py-[16px] scroll-mt-24">
      <Container>
        <SectionHead
          title="Score change detail"
          description="Full evidence record for entities with score changes in this cycle."
        />
        <div className="grid grid-cols-1 gap-5">
          {visibleChanges.map((change: any) => {
            const isDowngrade = change.delta < 0;
            const cardBorderColor = isDowngrade
              ? "rgba(248,113,113,0.35)"
              : "rgba(134,239,172,0.35)";
            const cardBg = isDowngrade
              ? "linear-gradient(160deg, rgba(248,113,113,0.07) 0%, rgba(251,146,60,0.03) 100%)"
              : "linear-gradient(160deg, rgba(134,239,172,0.07) 0%, rgba(125,211,252,0.03) 100%)";
            const pubBand = normalizeBand(change.publishedBand ?? "");
            const assBand = normalizeBand(
              change.assessedBand ?? change.proposedBand ?? "",
            );
            const href = entityHref(change.index, change.slug);

            return (
              <div
                key={change.slug}
                id={change.slug}
                className="rounded-[20px] p-6 border"
                style={{ borderColor: cardBorderColor, background: cardBg }}
              >
                <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
                  <div className="flex items-start gap-3 flex-wrap">
                    <div>
                      <h3 className="text-[1.4rem] font-bold leading-tight">
                        {href ? (
                          <TrackedEntityLink
                            href={href}
                            slug={change.slug}
                            index={change.index}
                            source="scoreChanges"
                            className="hover:text-accent transition-colors"
                          >
                            {change.entity}
                          </TrackedEntityLink>
                        ) : (
                          change.entity
                        )}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Pill>{formatIndex(change.index)}</Pill>
                        <Link
                          href="/methodology"
                          className="text-muted text-[0.82rem] hover:text-accent transition-colors"
                        >
                          {change.confidence} confidence
                        </Link>
                        {change.date && (
                          <time
                            dateTime={change.date}
                            className="text-muted text-[0.82rem]"
                          >
                            Assessed {formatDateLabel(change.date)}
                          </time>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-2 justify-end mb-1">
                      {typeof change.publishedScore === "number" ? (
                        <>
                          <span className="text-muted text-[1.1rem] font-semibold">
                            {change.publishedScore}
                          </span>
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            className="text-muted"
                            aria-hidden="true"
                          >
                            <path
                              d="M3 8h10M9 4l4 4-4 4"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </>
                      ) : (
                        <span className="text-[0.7rem] uppercase tracking-[0.1em] text-[#7dd3fc] font-bold px-1.5 py-0.5 rounded border border-[rgba(125,211,252,0.32)] bg-[rgba(125,211,252,0.08)]">
                          First baseline
                        </span>
                      )}
                      <span
                        className="text-[1.5rem] font-bold leading-none"
                        style={{
                          color: deltaColor(change.delta ?? 0),
                        }}
                      >
                        {change.assessedScore ?? change.proposedScore}
                      </span>
                    </div>
                    <div
                      className="text-[0.9rem] font-bold mb-2"
                      style={{ color: deltaColor(change.delta ?? 0) }}
                    >
                      {typeof change.delta === "number"
                        ? `${change.delta > 0 ? "+" : ""}${change.delta} pts`
                        : "New entry"}
                    </div>
                    {change.bandChange && pubBand && assBand && (
                      <div className="flex items-center gap-1.5 justify-end flex-wrap">
                        <Band level={pubBand} />
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                          className="text-muted"
                          aria-hidden="true"
                        >
                          <path
                            d="M2 7h10M8 3l4 4-4 4"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <Band level={assBand} />
                      </div>
                    )}
                    {!change.bandChange && pubBand && (
                      <div className="flex justify-end">
                        <Band level={pubBand} />
                      </div>
                    )}
                  </div>
                </div>

                <p
                  className="text-[0.97rem] text-text mb-4 font-medium leading-relaxed border-l-2 pl-3"
                  style={{ borderColor: deltaColor(change.delta) }}
                >
                  {change.headline}
                </p>

                {/* Evidence record — supports rich objects, legacy strings, keyEvidence */}
                {(() => {
                  const richEvidence: unknown[] =
                    Array.isArray(change.evidence) && change.evidence.length > 0
                      ? (change.evidence as unknown[])
                      : [];
                  const keyEvidence: string[] =
                    richEvidence.length === 0 &&
                    Array.isArray(change.keyEvidence) &&
                    change.keyEvidence.length > 0
                      ? (change.keyEvidence as string[])
                      : [];
                  if (richEvidence.length === 0 && keyEvidence.length === 0)
                    return null;
                  return (
                    <div>
                      <div className="text-[0.78rem] font-bold uppercase tracking-widest text-muted mb-3">
                        Evidence record
                      </div>
                      <ol className="space-y-2.5">
                        {richEvidence.length > 0
                          ? richEvidence.map((evRaw: unknown, i: number) => {
                              const isObject =
                                evRaw !== null &&
                                typeof evRaw === "object" &&
                                !Array.isArray(evRaw);
                              const ev = isObject
                                ? (evRaw as {
                                    source?: string;
                                    url?: string;
                                    finding?: string;
                                  })
                                : null;
                              const findingText =
                                ev?.finding ??
                                (typeof evRaw === "string" ? evRaw : "");
                              return (
                                <li key={i} className="flex gap-3">
                                  <span
                                    aria-hidden="true"
                                    className="text-[0.78rem] font-bold shrink-0 mt-[2px] w-5 h-5 rounded-full flex items-center justify-center border"
                                    style={{
                                      color: deltaColor(change.delta),
                                      borderColor: `${deltaColor(change.delta)}44`,
                                      background: `${deltaColor(change.delta)}11`,
                                    }}
                                  >
                                    {i + 1}
                                  </span>
                                  <div
                                    className="flex-1 text-muted text-[0.9rem] leading-relaxed pl-3 border-l"
                                    style={{
                                      borderColor: `${deltaColor(change.delta)}28`,
                                    }}
                                  >
                                    <div>{findingText}</div>
                                    {ev?.source && (
                                      <div className="text-[0.78rem] text-muted-subtle mt-1">
                                        {ev.url ? (
                                          <a
                                            href={ev.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:text-accent transition-colors underline decoration-dotted underline-offset-2"
                                          >
                                            {ev.source}
                                          </a>
                                        ) : (
                                          ev.source
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </li>
                              );
                            })
                          : keyEvidence.map((finding: string, i: number) => (
                              <li key={i} className="flex gap-3">
                                <span
                                  aria-hidden="true"
                                  className="text-[0.78rem] font-bold shrink-0 mt-[2px] w-5 h-5 rounded-full flex items-center justify-center border"
                                  style={{
                                    color: deltaColor(change.delta),
                                    borderColor: `${deltaColor(change.delta)}44`,
                                    background: `${deltaColor(change.delta)}11`,
                                  }}
                                >
                                  {i + 1}
                                </span>
                                <div
                                  className="flex-1 text-muted text-[0.9rem] leading-relaxed pl-3 border-l"
                                  style={{
                                    borderColor: `${deltaColor(change.delta)}28`,
                                  }}
                                >
                                  {finding}
                                </div>
                              </li>
                            ))}
                      </ol>
                    </div>
                  );
                })()}

                {typeof change.boundaryWatchResolution === "string" &&
                  change.boundaryWatchResolution.trim() && (
                    <div className="mt-4 rounded-[12px] border border-[rgba(167,139,250,0.32)] bg-[rgba(167,139,250,0.05)] p-3.5">
                      <div className="text-[0.72rem] font-bold uppercase tracking-widest text-[#a78bfa] mb-1">
                        Boundary watch resolution
                      </div>
                      <p className="text-[0.88rem] text-muted leading-relaxed">
                        {change.boundaryWatchResolution}
                      </p>
                    </div>
                  )}

                {Array.isArray(change.openWatches) &&
                  change.openWatches.length > 0 && (
                    <div className="mt-4">
                      <div className="text-[0.72rem] font-bold uppercase tracking-widest text-muted mb-2">
                        Next assessment triggers
                      </div>
                      <ul className="flex flex-wrap gap-1.5">
                        {(change.openWatches as string[]).map(
                          (w: string, i: number) => (
                            <li
                              key={i}
                              className="text-[0.82rem] text-muted px-2.5 py-1 rounded-full border border-line bg-[rgba(255,255,255,0.025)]"
                            >
                              {w}
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  )}

                {href && (
                  <div className="mt-4 pt-3.5 border-t border-[rgba(255,255,255,0.06)] flex justify-end">
                    <TrackedEntityLink
                      href={href}
                      slug={change.slug}
                      index={change.index}
                      source="scoreChanges"
                      className="inline-flex items-center gap-1.5 text-[0.82rem] font-semibold text-muted hover:text-accent transition-colors group"
                    >
                      {change.entity ? `See ${change.entity}'s full breakdown` : "See the full breakdown"}
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 13 13"
                        fill="none"
                        aria-hidden="true"
                        className="group-hover:translate-x-0.5 transition-transform"
                      >
                        <path
                          d="M2.5 6.5h8M7 3l3.5 3.5L7 10"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </TrackedEntityLink>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

function ConfirmationsSection({
  confirmations,
  date,
}: {
  confirmations: any[];
  date: string;
}) {
  // Determine which tokens actually appear so we only show relevant legend entries
  const hasFirstBaseline = confirmations.some((c: any) => c.firstAgentBaseline);
  const hasCarryForward = confirmations.some((c: any) => c.carryForwardActive);
  const hasWatch = confirmations.some((c: any) => c.boundaryWatch);
  const showLegend = hasFirstBaseline || hasCarryForward || hasWatch;

  return (
    <section className="py-[16px]">
      <Container>
        <SectionHead
          title="Confirmed positions"
          description="Entities reassessed for this briefing where published scores remain supported by current evidence."
        />
        {showLegend && (
          <p className="text-muted text-[0.82rem] mb-3 leading-relaxed">
            {hasFirstBaseline && "First baseline = first time scored · "}
            {hasCarryForward && "Carry-forward = credit retained from a prior assessment · "}
            {hasWatch && "Watch = near a band threshold"}
          </p>
        )}
        <div className="overflow-auto border border-line rounded-[20px] bg-[rgba(255,255,255,0.02)]">
          <table className="w-full border-collapse">
            <caption className="sr-only">
              Confirmed positions from the{" "}
              {formatDateLabel(date)} briefing.
            </caption>
            <thead>
              <tr className="border-b border-line">
                <th
                  scope="col"
                  className="text-muted text-[0.82rem] font-semibold uppercase tracking-wider text-left py-3.5 px-5"
                >
                  Entity
                </th>
                <th
                  scope="col"
                  className="text-muted text-[0.82rem] font-semibold uppercase tracking-wider text-left py-3.5 px-4"
                >
                  Index
                </th>
                <th
                  scope="col"
                  className="text-muted text-[0.82rem] font-semibold uppercase tracking-wider text-left py-3.5 px-4"
                >
                  Band
                </th>
                <th
                  scope="col"
                  className="text-muted text-[0.82rem] font-semibold uppercase tracking-wider text-right py-3.5 px-4"
                >
                  Published
                </th>
                <th
                  scope="col"
                  className="text-muted text-[0.82rem] font-semibold uppercase tracking-wider text-right py-3.5 px-4"
                >
                  Assessed
                </th>
                <th
                  scope="col"
                  className="text-muted text-[0.82rem] font-semibold uppercase tracking-wider text-right py-3.5 px-4"
                >
                  Delta
                </th>
                <th
                  scope="col"
                  className="text-muted text-[0.82rem] font-semibold uppercase tracking-wider text-left py-3.5 px-4"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="text-muted text-[0.82rem] font-semibold uppercase tracking-wider text-left py-3.5 px-5"
                >
                  Finding
                </th>
              </tr>
            </thead>
            <tbody>
              {confirmations.map((c: any) => {
                const band = normalizeBand(c.publishedBand ?? "");
                const confirmHref = entityHref(c.index, c.slug);
                return (
                  <tr
                    key={c.slug}
                    className="border-b border-line last:border-b-0 hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                  >
                    <td className="py-4 px-5 font-semibold text-[0.95rem]">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {confirmHref ? (
                          <TrackedEntityLink
                            href={confirmHref}
                            slug={c.slug}
                            index={c.index}
                            source="confirmation"
                            className="hover:text-accent transition-colors"
                          >
                            {c.entity}
                          </TrackedEntityLink>
                        ) : (
                          c.entity
                        )}
                        {c.boundaryWatch && (
                          <span
                            className="text-[0.66rem] font-bold uppercase tracking-wider text-[#fcd34d] px-1.5 py-0.5 rounded border border-[rgba(252,211,77,0.4)] bg-[rgba(252,211,77,0.08)]"
                            title="Boundary watch active"
                          >
                            Watch
                          </span>
                        )}
                        {c.firstAgentBaseline && (
                          <span className="text-[0.66rem] font-bold uppercase tracking-wider text-[#7dd3fc] px-1.5 py-0.5 rounded border border-[rgba(125,211,252,0.4)] bg-[rgba(125,211,252,0.08)]">
                            First baseline
                          </span>
                        )}
                        {c.carryForwardActive && (
                          <span className="text-[0.66rem] font-bold uppercase tracking-wider text-[#a78bfa] px-1.5 py-0.5 rounded border border-[rgba(167,139,250,0.4)] bg-[rgba(167,139,250,0.08)]">
                            Carry-forward
                            {typeof c.carryForwardDelta === "number" &&
                              ` +${c.carryForwardDelta}`}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-muted text-[0.88rem]">
                      {formatIndex(c.index)}
                    </td>
                    <td className="py-4 px-4">
                      {band && <Band level={band} />}
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-[0.92rem]">
                      {c.publishedScore}
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-[0.92rem]">
                      {c.assessedScore}
                    </td>
                    <td
                      className="py-4 px-4 text-right font-mono text-[0.92rem] font-semibold"
                      style={{ color: deltaColor(c.delta) }}
                    >
                      {c.delta > 0 ? "+" : ""}
                      {c.delta}
                    </td>
                    <td className="py-4 px-4 text-muted text-[0.88rem]">
                      {c.date && (
                        <time dateTime={c.date}>{formatDateLabel(c.date)}</time>
                      )}
                    </td>
                    <td className="py-4 px-5 text-muted text-[0.88rem] max-w-[380px] leading-relaxed">
                      {c.headline}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Container>
    </section>
  );
}

// HighlightsSection removed — replaced by TodaysAnalysisSection component
// (site/src/components/updates/briefing/TodaysAnalysisSection.tsx)

function SectorTrendsSection({
  trends,
  date,
}: {
  trends: { sector: string; points: string[] }[];
  date: string;
}) {
  return (
    <section id="sector-findings" className="py-[16px] scroll-mt-24">
      <Container>
        <SectionHead
          title="Sector findings"
          description={`Patterns emerging across indexed sectors in the ${formatDateLabel(date)} briefing.`}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trends.map((trend) => (
            <Panel key={trend.sector}>
              <div className="flex items-center gap-2.5 mb-4">
                <span className="w-1 h-5 rounded-full bg-accent shrink-0" />
                <h3 className="text-[1.08rem] font-bold">{trend.sector}</h3>
              </div>
              <ul className="space-y-3">
                {trend.points.map((p: string, i: number) => (
                  <li
                    key={i}
                    className="flex gap-2.5 text-muted text-[0.9rem] leading-relaxed"
                  >
                    <span className="text-accent shrink-0 mt-[2px]">
                      &#8250;
                    </span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          ))}
        </div>
      </Container>
    </section>
  );
}

function EmergingRisksSection({
  risks,
  date,
}: {
  risks: any[];
  date: string;
}) {
  return (
    <section id="emerging-risks" className="py-[16px] scroll-mt-24">
      <Container>
        <SectionHead
          title="Risk signals"
          description={`Developments that may affect future scores. Watch items from the ${formatDateLabel(date)} briefing.`}
        />
        <div className="grid grid-cols-1 gap-3">
          {risks.map((rawRisk: unknown, i: number) => {
            const isObject =
              rawRisk !== null &&
              typeof rawRisk === "object" &&
              !Array.isArray(rawRisk);
            const obj = isObject
              ? (rawRisk as {
                  risk?: string;
                  description?: string;
                  affectedEntities?: string[];
                  timeframe?: string;
                })
              : null;
            const title = obj?.risk ?? null;
            const body = obj
              ? (obj.description ?? "")
              : typeof rawRisk === "string"
                ? rawRisk
                : "";
            const affected: string[] = Array.isArray(obj?.affectedEntities)
              ? (obj?.affectedEntities as string[])
              : [];
            const timeframe = obj?.timeframe ?? null;
            return (
              <div
                key={i}
                className="rounded-[20px] border-l-4 border border-[rgba(251,146,60,0.25)] bg-[rgba(251,146,60,0.05)] p-5"
                style={{ borderLeftColor: "#fb923c" }}
              >
                <div className="flex gap-3 items-start">
                  <div className="shrink-0 mt-[2px]">
                    <span className="text-[0.78rem] font-bold uppercase tracking-wider text-[#fb923c]">
                      Risk
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    {title && (
                      <h3 className="text-[0.98rem] font-bold text-text leading-tight mb-1">
                        {title}
                      </h3>
                    )}
                    <p className="text-[0.92rem] text-muted leading-relaxed">
                      {body}
                    </p>
                    {(affected.length > 0 || timeframe) && (
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2.5 text-[0.78rem]">
                        {affected.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {affected.map((slug) => {
                              const resolved = resolveSlugHref(slug);
                              return resolved ? (
                                <TrackedEntityLink
                                  key={slug}
                                  href={resolved.href}
                                  slug={slug}
                                  index={resolved.index}
                                  source="boundaryWatch"
                                  className="font-semibold px-2 py-0.5 rounded-full border border-[rgba(251,146,60,0.3)] bg-[rgba(251,146,60,0.08)] text-[#fb923c] hover:border-[rgba(251,146,60,0.6)] transition-colors"
                                >
                                  {slug}
                                </TrackedEntityLink>
                              ) : (
                                <span
                                  key={slug}
                                  className="font-semibold px-2 py-0.5 rounded-full border border-[rgba(251,146,60,0.3)] bg-[rgba(251,146,60,0.08)] text-[#fb923c]"
                                >
                                  {slug}
                                </span>
                              );
                            })}
                          </div>
                        )}
                        {timeframe && (
                          <span className="text-muted">
                            <span className="text-[0.7rem] font-bold uppercase tracking-widest text-muted mr-1.5">
                              Window
                            </span>
                            {timeframe}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

function InsightsSection({
  insights,
  date,
}: {
  insights: string[];
  date: string;
}) {
  return (
    <section className="py-[16px]">
      <Container>
        <SectionHead
          title="Analytical notes"
          description={`Observations on methodology, evidence quality, and structural patterns from the ${formatDateLabel(date)} briefing.`}
        />
        <div className="grid grid-cols-1 gap-3">
          {insights.map((insight: string, i: number) => (
            <div
              key={i}
              className="rounded-[20px] border border-line bg-[rgba(255,255,255,0.025)] p-5"
            >
              <div className="flex gap-3 items-start">
                <span className="text-[0.78rem] font-bold text-muted shrink-0 mt-[3px] uppercase tracking-wider border border-line rounded px-1.5 py-0.5">
                  Note
                </span>
                <p className="text-[0.92rem] text-muted leading-relaxed">
                  {insight}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

// ── Preserved from original DailyBriefing.tsx ────────────────────────────────

function extractDomainSafe(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function FloorDesignationsPanel() {
  const designated = ALL_ENTITY_KINDS.flatMap((k) => getAllEntities(k))
    .filter((e) => e.floorDesignation && e.floorDesignation.designated)
    .sort((a, b) => {
      const kindOrder = a.kind.localeCompare(b.kind);
      if (kindOrder !== 0) return kindOrder;
      return a.name.localeCompare(b.name);
    });

  if (designated.length === 0) return null;

  return (
    <section id="floor-designations" className="py-[16px] scroll-mt-24">
      <Container>
        <div className="rounded-[16px] border border-[rgba(244,63,94,0.32)] bg-gradient-to-br from-[rgba(244,63,94,0.07)] via-[rgba(244,63,94,0.03)] to-transparent p-5 sm:p-6 shadow-[0_18px_44px_rgba(0,0,0,0.28)]">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span
              className="inline-block w-2 h-2 rounded-full bg-[#f43f5e]"
              aria-hidden
            />
            <p className="text-[0.78rem] uppercase tracking-[0.14em] text-[#f43f5e] font-bold">
              Floor designations
            </p>
            <span className="text-muted text-[0.78rem]">·</span>
            <span className="text-muted text-[0.82rem]">
              {designated.length}{" "}
              {designated.length === 1 ? "entity" : "entities"} at composite 0
              with documented evidence pattern
            </span>
          </div>
          <h2 className="text-[1.2rem] sm:text-[1.32rem] font-bold leading-snug mb-2">
            Composite scores resolving at zero — methodology disclosure
          </h2>
          <p className="text-muted text-[0.92rem] sm:text-[0.95rem] mb-4 max-w-3xl">
            Floor designation: an entity scoring the worst possible result on all 8 dimensions, repeatedly — the benchmark&apos;s most serious finding. These entities have all 8 dimensions resolving at the lowest
            behavioral anchor (1.0/5.0) across multiple assessment cycles.{" "}
            <Link
              href="/methodology#floor-designation"
              className="text-[#7dd3fc] hover:underline"
            >
              Read the methodology
            </Link>
            .
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {designated.map((e) => {
              const fd = e.floorDesignation!;
              const indexSlug =
                e.kind === "ai-lab"
                  ? "ai-labs"
                  : e.kind === "country"
                    ? "countries"
                    : e.kind === "company"
                      ? "fortune-500"
                      : e.kind === "robotics-lab"
                        ? "robotics-labs"
                        : e.kind === "us-state"
                          ? "us-states"
                          : e.kind === "us-city"
                            ? "us-cities"
                            : "global-cities";
              const indexLabel = formatIndex(indexSlug);
              const href = entityHref(indexSlug, e.slug);
              if (!href) return null;
              return (
                <Link
                  key={`${e.kind}-${e.slug}`}
                  href={href}
                  className="block rounded-[12px] border border-[rgba(244,63,94,0.22)] bg-[rgba(15,18,24,0.55)] p-3.5 hover:border-[rgba(244,63,94,0.45)] hover:bg-[rgba(244,63,94,0.04)] transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <p className="text-[0.7rem] uppercase tracking-[0.1em] text-muted mb-0.5">
                        {indexLabel}
                      </p>
                      <p className="text-text font-semibold text-[0.98rem] truncate">
                        {e.name}
                      </p>
                    </div>
                    <span className="shrink-0 text-[0.72rem] font-bold text-[#f43f5e] uppercase tracking-wider px-1.5 py-0.5 rounded border border-[rgba(244,63,94,0.32)] bg-[rgba(244,63,94,0.08)]">
                      Floor
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {fd.primaryDrivers.slice(0, 6).map((code) => {
                      const dim = DIMENSIONS.find((d) => d.code === code);
                      const color = dim?.color ?? "#94a3b8";
                      return (
                        <span
                          key={code}
                          className="inline-flex items-center px-1.5 py-0.5 rounded text-[0.7rem] font-semibold"
                          style={{
                            color,
                            backgroundColor: `${color}14`,
                            border: `1px solid ${color}40`,
                          }}
                          title={dim?.name ?? code}
                        >
                          {code}
                        </span>
                      );
                    })}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}

function FloorConductSection({
  items,
  date,
}: {
  items: any[];
  date: string;
}) {
  return (
    <section id="floor-conduct" className="py-[16px] scroll-mt-24">
      <Container>
        <SectionHead
          title="Floor conduct record"
          description={`Cycle-specific conduct documentation for entities at composite zero, recorded for the ${formatDateLabel(date)} briefing.`}
        />
        <div className="grid grid-cols-1 gap-4">
          {items.map((fe, i) => {
            const href = entityHref(fe.index, fe.slug);
            return (
              <article
                key={`${fe.slug}-${i}`}
                className="rounded-[20px] border border-[rgba(244,63,94,0.32)] bg-gradient-to-br from-[rgba(244,63,94,0.08)] via-[rgba(244,63,94,0.03)] to-transparent p-5 sm:p-6"
              >
                <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-[#f43f5e] px-1.5 py-0.5 rounded border border-[rgba(244,63,94,0.32)] bg-[rgba(244,63,94,0.08)]">
                        Floor · {fe.band ?? "Critical"}
                      </span>
                      {fe.newConductCategory && (
                        <span className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-[#a78bfa] px-1.5 py-0.5 rounded border border-[rgba(167,139,250,0.32)] bg-[rgba(167,139,250,0.08)]">
                          New category: {fe.newConductCategory}
                        </span>
                      )}
                    </div>
                    <h3 className="text-[1.2rem] sm:text-[1.32rem] font-bold leading-tight">
                      {href ? (
                        <TrackedEntityLink
                          href={href}
                          slug={fe.slug}
                          index={fe.index}
                          source="floorConduct"
                          className="hover:text-accent transition-colors"
                        >
                          {fe.entity}
                        </TrackedEntityLink>
                      ) : (
                        fe.entity
                      )}
                    </h3>
                  </div>
                </div>
                {fe.headline && (
                  <p className="text-[0.95rem] text-text leading-relaxed mb-4 border-l-2 border-[rgba(244,63,94,0.45)] pl-3">
                    {fe.headline}
                  </p>
                )}
                {Array.isArray(fe.conductCategories) &&
                  fe.conductCategories.length > 0 && (
                    <div className="mb-3">
                      <div className="text-[0.72rem] font-bold uppercase tracking-widest text-muted mb-2">
                        Conduct documented
                      </div>
                      <ul className="space-y-1.5">
                        {fe.conductCategories.map((c: string, j: number) => (
                          <li
                            key={j}
                            className="flex gap-2 text-[0.9rem] text-muted leading-relaxed"
                          >
                            <span
                              className="text-[#f43f5e] shrink-0 mt-[2px]"
                              aria-hidden="true"
                            >
                              ›
                            </span>
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                {Array.isArray(fe.sources) && fe.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.06)]">
                    <div className="text-[0.72rem] font-bold uppercase tracking-widest text-muted mb-2">
                      Primary sources
                    </div>
                    <ol className="space-y-1">
                      {fe.sources.map((src: string, j: number) => (
                        <li key={j} className="flex items-baseline gap-2">
                          <span className="text-[0.74rem] font-bold text-[#f43f5e] shrink-0">
                            {j + 1}.
                          </span>
                          <a
                            href={src}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[0.82rem] text-[#f87171] hover:text-text transition-colors underline underline-offset-2 break-all"
                          >
                            {extractDomainSafe(src)}
                          </a>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}


function MathHygienePanel({ data }: { data: any }) {
  const cluster: any[] = Array.isArray(data.clusterEntities)
    ? data.clusterEntities
    : [];
  const subThreshold: any[] = Array.isArray(data.subThresholdCandidates)
    ? data.subThresholdCandidates
    : [];
  const critical = data.criticalFlag;

  return (
    <section id="math-hygiene" className="py-[16px] scroll-mt-24">
      <Container>
        <SectionHead
          title="Math hygiene"
          description="Entities where published composite and reconstructed composite diverge. Tracked openly as a publication-integrity obligation."
        />
        {critical && (
          <div className="mb-4 rounded-[16px] border border-[rgba(248,113,113,0.45)] bg-gradient-to-br from-[rgba(248,113,113,0.10)] via-[rgba(248,113,113,0.04)] to-transparent p-5">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span
                className="inline-block w-2 h-2 rounded-full bg-[#f87171]"
                aria-hidden="true"
              />
              <p className="text-[0.78rem] uppercase tracking-[0.14em] text-[#f87171] font-bold">
                Critical flag
              </p>
              <span className="text-muted text-[0.78rem]">·</span>
              <span className="text-muted text-[0.82rem]">
                {critical.cyclesOpen ?? "?"} cycles open
              </span>
            </div>
            <h3 className="text-[1.1rem] font-bold mb-1">
              {critical.entity}
              {critical.index && (
                <span className="text-muted text-[0.82rem] font-normal ml-2">
                  {formatIndex(critical.index)}
                </span>
              )}
            </h3>
          </div>
        )}
        {data.note && (
          <p className="text-muted text-[0.92rem] leading-relaxed mb-4 max-w-3xl">
            {data.note}
          </p>
        )}
        {cluster.length > 0 && (
          <div className="overflow-auto border border-line rounded-[16px] bg-[rgba(255,255,255,0.02)] mb-4">
            <table className="w-full border-collapse">
              <caption className="sr-only">
                Math-hygiene cluster
              </caption>
              <thead>
                <tr className="border-b border-line">
                  <th
                    scope="col"
                    className="text-muted text-[0.78rem] font-semibold uppercase tracking-wider text-left py-3 px-4"
                  >
                    Entity
                  </th>
                  <th
                    scope="col"
                    className="text-muted text-[0.78rem] font-semibold uppercase tracking-wider text-right py-3 px-4"
                  >
                    Published
                  </th>
                  <th
                    scope="col"
                    className="text-muted text-[0.78rem] font-semibold uppercase tracking-wider text-right py-3 px-4"
                  >
                    Reconstructed
                  </th>
                  <th
                    scope="col"
                    className="text-muted text-[0.78rem] font-semibold uppercase tracking-wider text-right py-3 px-4"
                  >
                    Discrepancy
                  </th>
                </tr>
              </thead>
              <tbody>
                {cluster.map((row, i) => (
                  <tr
                    key={`${row.entity}-${i}`}
                    className="border-b border-line last:border-b-0"
                  >
                    <td className="py-2.5 px-4 font-semibold text-[0.9rem]">
                      {row.entity}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-[0.88rem]">
                      {row.published ?? "—"}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono text-[0.88rem]">
                      {row.reconstructed ?? "—"}
                    </td>
                    <td
                      className="py-2.5 px-4 text-right font-mono text-[0.88rem] font-semibold"
                      style={{
                        color:
                          typeof row.discrepancy === "number" &&
                          row.discrepancy < 0
                            ? "#f87171"
                            : "#7dd3fc",
                      }}
                    >
                      {typeof row.discrepancy === "number" && row.discrepancy > 0
                        ? "+"
                        : ""}
                      {row.discrepancy ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {subThreshold.length > 0 && (
          <div className="text-[0.85rem] text-muted-subtle">
            <span className="text-[0.72rem] font-bold uppercase tracking-widest text-muted mr-2">
              Sub-threshold candidates
            </span>
            {subThreshold.map((c, i) => (
              <span key={`${c.entity}-${i}`}>
                {i > 0 && " · "}
                <span className="text-text font-semibold">{c.entity}</span>
              </span>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}

function CarryForwardCreditsPanel({ items }: { items: any[] }) {
  return (
    <section id="carry-forward-credits" className="py-[24px] scroll-mt-24">
      <Container>
        <div className="rounded-[16px] border border-[rgba(125,211,252,0.18)] bg-[rgba(125,211,252,0.04)] p-5">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span
              className="inline-block w-2 h-2 rounded-full bg-[#7dd3fc]"
              aria-hidden="true"
            />
            <p className="text-[0.78rem] uppercase tracking-[0.14em] text-[#7dd3fc] font-bold">
              Carry-forward dimensional credits
            </p>
            <span className="text-muted text-[0.78rem]">·</span>
            <span className="text-muted text-[0.82rem]">
              {items.length}{" "}
              {items.length === 1 ? "entity" : "entities"} with documented
              pressure not yet reflected in composite
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {items.map((c, i) => (
              <div
                key={`${c.slug}-${i}`}
                className="rounded-[12px] border border-line bg-[rgba(15,18,24,0.55)] p-3.5"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5 flex-wrap">
                  <p className="text-text font-semibold text-[0.96rem] capitalize">
                    {c.entity}
                  </p>
                  <div className="text-right shrink-0 tabular-nums">
                    <span className="text-muted text-[0.82rem]">
                      {c.publishedScore ?? "—"}
                    </span>
                    <span className="text-muted mx-1.5">→</span>
                    <span className="text-[#7dd3fc] font-bold text-[0.95rem]">
                      {c.reconstructedScore ?? "—"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

function HoldsPanel({ items }: { items: any[] }) {
  return (
    <section id="holds" className="py-[24px] scroll-mt-24">
      <Container>
        <div className="rounded-[16px] border border-line bg-[rgba(255,255,255,0.025)] p-5">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span
              className="inline-block w-2 h-2 rounded-full bg-[#94a3b8]"
              aria-hidden="true"
            />
            <p className="text-[0.78rem] uppercase tracking-[0.14em] text-muted font-bold">
              Held this cycle
            </p>
            <span className="text-muted text-[0.78rem]">·</span>
            <span className="text-muted text-[0.82rem]">
              {items.length}{" "}
              {items.length === 1 ? "entity" : "entities"} deferred with
              documented reason
            </span>
          </div>
          <ul className="space-y-3">
            {items.map((h, i) => {
              const href = entityHref(h.index, h.slug);
              return (
                <li
                  key={`${h.slug}-${i}`}
                  className="rounded-[12px] border border-line bg-[rgba(15,18,24,0.45)] p-3.5"
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5 flex-wrap">
                    <div className="min-w-0">
                      <p className="text-[0.7rem] uppercase tracking-[0.1em] text-muted mb-0.5">
                        {formatIndex(h.index)}
                      </p>
                      <p className="text-text font-semibold text-[0.98rem]">
                        {href ? (
                          <TrackedEntityLink
                            href={href}
                            slug={h.slug}
                            index={h.index}
                            source="hold"
                            className="hover:text-accent transition-colors"
                          >
                            {h.entity}
                          </TrackedEntityLink>
                        ) : (
                          h.entity
                        )}
                      </p>
                    </div>
                  </div>
                  {(h.holdReason ?? h.reason) && (
                    <p className="text-[0.88rem] text-muted leading-relaxed">
                      {h.holdReason ?? h.reason}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </Container>
    </section>
  );
}

function ForwardSignalsList({ items }: { items: any[] }) {
  const sorted = [...items].sort((a, b) => {
    const da = String(a.date ?? "");
    const db = String(b.date ?? "");
    return da.localeCompare(db);
  });

  const groupedByDate = new Map<string, any[]>();
  for (const s of sorted) {
    const date = String(s.date ?? "TBD");
    if (!groupedByDate.has(date)) groupedByDate.set(date, []);
    groupedByDate.get(date)!.push(s);
  }

  return (
    <section id="forward-signals" className="py-[16px] scroll-mt-24">
      <Container>
        <SectionHead
          title="Forward signals"
          description="Calendar of upcoming scoring events the methodology pipeline is tracking."
        />
        <div className="space-y-4">
          {Array.from(groupedByDate.entries()).map(([date, group]) => (
            <div
              key={date}
              className="rounded-[16px] border border-line bg-[rgba(255,255,255,0.025)] p-4"
            >
              <div className="flex items-baseline gap-2 mb-3">
                <time
                  dateTime={date !== "TBD" ? date : undefined}
                  className="text-text font-bold text-[0.95rem] font-mono tabular-nums"
                >
                  {date !== "TBD" ? formatDateLabel(date) : "TBD"}
                </time>
                <span className="text-muted text-[0.78rem]">·</span>
                <span className="text-muted text-[0.78rem]">
                  {group.length} {group.length === 1 ? "signal" : "signals"}
                </span>
              </div>
              <ul className="space-y-2.5">
                {group.map((s, i) => {
                  const href = s.slug ? resolveSlugHref(s.slug) : null;
                  return (
                    <li key={`${date}-${i}`} className="flex gap-3">
                      <div className="flex-1 min-w-0">
                        {s.entity && (
                          <div className="text-text font-semibold text-[0.9rem] mb-0.5">
                            {href ? (
                              <TrackedEntityLink
                                href={href.href}
                                slug={s.slug}
                                index={href.index}
                                source="forwardSignal"
                                className="hover:text-accent transition-colors"
                              >
                                {s.entity}
                              </TrackedEntityLink>
                            ) : (
                              s.entity
                            )}
                          </div>
                        )}
                        {s.signal && (
                          <p className="text-[0.88rem] text-muted leading-relaxed">
                            {s.signal}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

