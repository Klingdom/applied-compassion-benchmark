/* eslint-disable @typescript-eslint/no-explicit-any */
import TrackedEntityLink from "@/components/updates/TrackedEntityLink";
import Band from "@/components/ui/Band";
import Pill from "@/components/ui/Pill";
import { entityHref } from "@/lib/entityHref";
import { normalizeBand, deltaColor, formatIndex } from "./utils";

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

export default function ScoreMovementCard({ assessment }: Props) {
  // Support both recentAssessments shape and scoreChanges shape
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

  const href = index && slug ? entityHref(index, slug) : null;
  const { arrow, color: arrowColor } = directionArrow(delta);

  return (
    <article
      className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3.5 rounded-[14px] border border-line bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.035)] transition-colors"
      aria-label={`${entity} score movement`}
    >
      {/* Entity + index */}
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
        {status && (
          <div className="text-[0.72rem] text-muted mt-0.5">
            {statusLabel(status)}
          </div>
        )}
      </div>

      {/* Score movement */}
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
      </div>

      {/* Band + confidence */}
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
      </div>
    </article>
  );
}
