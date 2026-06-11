/* eslint-disable @typescript-eslint/no-explicit-any */
import TrackedEntityLink from "@/components/updates/TrackedEntityLink";
import Band from "@/components/ui/Band";
import Pill from "@/components/ui/Pill";
import { entityHref } from "@/lib/entityHref";
import { normalizeBand, deltaColor, formatIndex, formatDateLabel, extractDomain } from "./utils";
import { DIMENSIONS } from "@/data/dimensions";
import {
  type EvidenceItem,
  SourceChip,
  SourcesDisclosure,
} from "./evidence";

interface Props {
  assessment: any;
}

function directionArrow(delta: number): { arrow: string; color: string } {
  if (delta > 0) return { arrow: "▲", color: "#86efac" };
  if (delta < 0) return { arrow: "▼", color: "#f87171" };
  return { arrow: "—", color: "#94a3b8" };
}

function statusLabel(status: string): string {
  if (!status) return "";
  return status
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ──────────────────────────────────────────────────────────────────────────────
// P0 enrichment helpers
// ──────────────────────────────────────────────────────────────────────────────

function dimensionColor(code: string): string {
  const dim = DIMENSIONS.find((d) => d.code === code);
  return dim?.color ?? "#94a3b8";
}

function formatDimensionChip(obj: { code: string; delta: number }): string {
  const sign = obj.delta > 0 ? "+" : obj.delta < 0 ? "−" : "";
  return `${obj.code} ${sign}${Math.abs(obj.delta).toFixed(2)}`;
}

function formatBoundaryLabel(obj: {
  band: string;
  pointsAway: number;
  direction: "above" | "below";
}): string {
  return `${obj.pointsAway.toFixed(1)} ${obj.direction} ${obj.band}`;
}

export default function ScoreMovementCard({ assessment }: Props) {
  const entity: string = assessment.entity ?? assessment.slug ?? "";
  const slug: string = assessment.slug ?? "";
  const index: string = assessment.index ?? assessment.publishedIndex ?? "";
  const published: number | null =
    assessment.publishedScore ?? assessment.published ?? null;
  const assessed: number | null =
    assessment.assessedScore ?? assessment.assessed ?? assessment.compositeScore ?? null;
  const delta: number = assessment.delta ?? (
    typeof published === "number" && typeof assessed === "number"
      ? assessed - published
      : 0
  );
  const band = normalizeBand(assessment.band ?? assessment.publishedBand ?? "");
  const confidence: string = assessment.confidence ?? "";
  const status: string = assessment.status ?? "";
  const isBoundary =
    assessment.bandCrossing === true ||
    /band.crossing|boundary/i.test(status);

  // ── P0 enrichment fields ────────────────────────────────────────────────────
  const whyHeadline: string | undefined = assessment.whyHeadline;

  const dominantDimension: { code: string; delta: number } | undefined =
    assessment.dominantDimension &&
    typeof assessment.dominantDimension === "object" &&
    typeof assessment.dominantDimension.code === "string"
      ? assessment.dominantDimension
      : undefined;

  // #8: evidence[] takes priority over primaryEvidenceUrl for the source chip
  // Guard: always safe even when evidence[] is absent
  const evidence: EvidenceItem[] = Array.isArray(assessment.evidence)
    ? assessment.evidence
    : [];

  const primaryEvidenceUrl: string | undefined =
    typeof assessment.primaryEvidenceUrl === "string"
      ? assessment.primaryEvidenceUrl
      : undefined;

  // ── P1 enrichment fields ────────────────────────────────────────────────────
  const rawDtb = assessment.distanceToBoundary;
  const distanceToBoundary: { band: string; pointsAway: number; direction: "above" | "below" } | undefined =
    rawDtb &&
    typeof rawDtb === "object" &&
    typeof rawDtb.pointsAway === "number" &&
    rawDtb.pointsAway < 3.0
      ? rawDtb
      : undefined;

  const rawNfs = assessment.nextForwardSignal;
  const nextForwardSignal: { date: string; label: string } | undefined =
    rawNfs &&
    typeof rawNfs === "object" &&
    typeof rawNfs.date === "string" &&
    rawNfs.date &&
    typeof rawNfs.label === "string"
      ? rawNfs
      : undefined;

  const href = index && slug ? entityHref(index, slug) : null;
  const { arrow, color: arrowColor } = directionArrow(delta);

  const dimColor = dominantDimension ? dimensionColor(dominantDimension.code) : null;
  const dimDeltaColor = dominantDimension ? deltaColor(dominantDimension.delta) : null;

  // ── #8: determine named source chip ────────────────────────────────────────
  // Priority: first evidence item url → primaryEvidenceUrl → nothing
  const topEvidence = evidence.length > 0 ? evidence[0] : null;
  const sourceChipUrl = topEvidence?.url ?? primaryEvidenceUrl ?? null;
  const sourceChipSource =
    topEvidence?.source ??
    (primaryEvidenceUrl ? extractDomain(primaryEvidenceUrl) : undefined);
  const sourceChipTier = topEvidence?.sourceTier;

  return (
    <article
      className="flex flex-col gap-2 px-4 py-3.5 rounded-[14px] border border-line bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.035)] transition-colors"
      aria-label={`${entity} score movement`}
    >
      {/* P1: distanceToBoundary pill */}
      {distanceToBoundary && (
        <div className="flex items-center">
          <span className="text-[0.72rem] text-muted px-2 py-0.5 rounded border border-line bg-[rgba(255,255,255,0.03)]">
            {formatBoundaryLabel(distanceToBoundary)}
          </span>
        </div>
      )}

      {/* Main row: entity + score movement + pills */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Entity + index + whyHeadline */}
        <div className="flex-1 min-w-0">
          <div className="text-[0.68rem] font-bold uppercase tracking-wider text-muted mb-0.5">
            {formatIndex(index)}
          </div>
          <div className="font-semibold text-[0.97rem] leading-tight">
            {href ? (
              <TrackedEntityLink
                href={href}
                slug={slug}
                index={index}
                source="scoreMovement"
                className="hover:text-accent transition-colors"
              >
                {entity}
              </TrackedEntityLink>
            ) : (
              entity
            )}
          </div>
          {whyHeadline && (
            <p
              className="text-[0.78rem] text-muted mt-0.5 leading-snug line-clamp-2"
              title={whyHeadline}
            >
              {whyHeadline}
            </p>
          )}
          {status && !whyHeadline && (
            <div className="text-[0.72rem] text-muted mt-0.5">
              {statusLabel(status)}
            </div>
          )}
        </div>

        {/* Score movement + P0 dimension chip */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {typeof published === "number" && (
            <span className="font-mono text-[0.9rem] text-muted tabular-nums">
              {published}
            </span>
          )}
          <span
            aria-hidden="true"
            className="font-bold text-[0.82rem]"
            style={{ color: arrowColor }}
          >
            {arrow}
          </span>
          {typeof assessed === "number" && (
            <span
              className="font-mono text-[1.1rem] font-bold tabular-nums"
              style={{ color: deltaColor(delta) }}
            >
              {assessed}
            </span>
          )}
          {delta !== 0 && (
            <span
              className="text-[0.8rem] font-bold tabular-nums"
              style={{ color: deltaColor(delta) }}
            >
              {delta > 0 ? "+" : ""}
              {delta}
            </span>
          )}
          {dominantDimension && dimColor && dimDeltaColor && (
            <span
              className="text-[0.72rem] font-semibold px-1.5 py-0.5 rounded border tabular-nums"
              style={{
                color: dimDeltaColor,
                borderColor: `${dimColor}40`,
                backgroundColor: `${dimColor}10`,
              }}
              title={`Dominant dimension: ${dominantDimension.code}`}
            >
              {formatDimensionChip(dominantDimension)}
            </span>
          )}
        </div>

        {/* Band + confidence + boundary pill + #8 named source chip */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {band && <Band level={band} />}
          {confidence && (
            <span
              className="text-[0.72rem] font-semibold px-2 py-0.5 rounded border border-line text-muted"
              aria-label={`Confidence: ${confidence}`}
            >
              {confidence}
            </span>
          )}
          {isBoundary && (
            <Pill className="border-[rgba(252,211,77,0.4)] bg-[rgba(252,211,77,0.08)] text-[#fcd34d] text-[0.65rem]">
              Boundary
            </Pill>
          )}

          {/* #8: named SourceChip — replaces anonymous icon button.
              Includes #12 tier badge (via SourceChip's tier prop).
              Falls back to primaryEvidenceUrl domain when no evidence[]. */}
          {sourceChipUrl && (
            <SourceChip
              url={sourceChipUrl}
              source={sourceChipSource}
              tier={sourceChipTier}
              className="inline-flex items-center gap-1 text-[0.73rem] text-muted hover:text-text transition-colors underline underline-offset-2 decoration-[rgba(255,255,255,0.2)] font-medium"
            />
          )}
        </div>
      </div>

      {/* #11 Sources (N) disclosure for ≥2 evidence items */}
      <SourcesDisclosure evidence={evidence} />

      {/* P1: nextForwardSignal */}
      {nextForwardSignal && (
        <p className="text-[0.78rem] text-muted italic">
          Next signal:{" "}
          <time dateTime={nextForwardSignal.date}>
            {formatDateLabel(nextForwardSignal.date)}
          </time>
          {" "}— {nextForwardSignal.label}
        </p>
      )}
    </article>
  );
}
