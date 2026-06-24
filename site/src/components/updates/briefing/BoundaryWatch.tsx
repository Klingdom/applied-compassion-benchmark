/* eslint-disable @typescript-eslint/no-explicit-any */
import Container from "@/components/ui/Container";
import TrackedEntityLink from "@/components/updates/TrackedEntityLink";
import { entityHref } from "@/lib/entityHref";
import { formatIndex } from "./utils";
import BandPositionStrip from "@/components/charts/BandPositionStrip";

interface Props {
  updates: any;
}

function directionLabel(direction: string): string {
  if (!direction) return "";
  if (/upward/i.test(direction)) return "upward pressure";
  if (/downward/i.test(direction)) return "downward pressure";
  if (/above/i.test(direction)) return "above threshold";
  if (/below/i.test(direction)) return "below threshold";
  return direction;
}

function pressureArrow(direction: string): string {
  if (/upward/i.test(direction)) return "▲";
  if (/downward/i.test(direction)) return "▼";
  if (/above/i.test(direction)) return "▼";
  if (/below/i.test(direction)) return "▲";
  return "—";
}

/** Status-driven color: uses status field first, falls back to monitoringLevel */
function statusColor(status: string, monitoringLevel: string): string {
  // Status-based color for downgrade risk
  if (/floor-confirmed/i.test(status)) return "#f87171";
  if (/methodology-evolution/i.test(status)) return "#a78bfa";
  if (/documented/i.test(status)) return "#fcd34d";
  // Fallback to monitoring level
  const map: Record<string, string> = {
    critical: "#f87171",
    high: "#fb923c",
    medium: "#fcd34d",
    low: "#94a3b8",
  };
  return map[(monitoringLevel ?? "").toLowerCase()] ?? "#7dd3fc";
}

/**
 * BoundaryWatch — entities near a band threshold.
 *
 * Reads `updates.boundaryWatch[]` (the actual data field).
 * Sorted ascending by `distance` (closest-to-crossing first).
 * Each card shows a compact BandPositionStrip to visualise where the score sits.
 *
 * Falls back to the legacy `updates.boundaryWatchEntities` field for older
 * digest shapes so no existing briefing breaks.
 */
export default function BoundaryWatch({ updates }: Props) {
  // Accept the current schema field (`boundaryWatch`) with fallback to legacy
  const raw: any[] = Array.isArray(updates.boundaryWatch)
    ? updates.boundaryWatch
    : Array.isArray(updates.boundaryWatchEntities)
      ? updates.boundaryWatchEntities
      : [];

  if (raw.length === 0) return null;

  // Sort ascending by distance (closest-to-crossing first)
  const items = [...raw].sort((a, b) => {
    const da = typeof a.distance === "number" ? a.distance : 999;
    const db = typeof b.distance === "number" ? b.distance : 999;
    return da - db;
  });

  return (
    <section
      id="boundary-watch"
      className="py-[30px] scroll-mt-24"
      aria-label="Boundary watch"
    >
      <Container>
        <div className="rounded-[18px] border border-[rgba(125,211,252,0.25)] bg-[rgba(125,211,252,0.04)] p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span
              className="inline-block w-2 h-2 rounded-full bg-[#7dd3fc]"
              aria-hidden="true"
            />
            <span className="text-[0.78rem] uppercase tracking-[0.14em] text-[#7dd3fc] font-bold">
              Boundary watch
            </span>
            <span className="text-muted text-[0.78rem]" aria-hidden="true">·</span>
            <span className="text-muted text-[0.82rem]">
              {items.length}{" "}
              {items.length === 1 ? "entity" : "entities"} near a band threshold
            </span>
          </div>

          <h2 className="text-[1.1rem] sm:text-[1.22rem] font-bold mb-4">
            Entities approaching band boundaries
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {items.map((w: any, i: number) => {
              const href = w.index && w.slug ? entityHref(w.index, w.slug) : null;
              // Resolve score: prefer `score` (new schema), fall back to `composite`
              const score: number | null =
                typeof w.score === "number" ? w.score :
                typeof w.composite === "number" ? w.composite :
                null;
              // Resolve distance: prefer `distance`, fall back to `boundaryDistance`
              const distance: number | null =
                typeof w.distance === "number" ? w.distance :
                typeof w.boundaryDistance === "number" ? w.boundaryDistance :
                null;
              const arrow = pressureArrow(w.direction ?? "");
              const mColor = statusColor(w.status ?? "", w.monitoringLevel ?? "");
              const isCrossing =
                typeof w.status === "string" &&
                /crossing|proposed/i.test(w.status);

              // Direction label: prefer fromBand/toBand when available
              const dirLabel = (w.fromBand && w.toBand)
                ? `${w.fromBand} → ${w.toBand}`
                : directionLabel(w.direction ?? "");

              // "X pts to {toBand}" label
              const toBandLabel = distance !== null && w.toBand
                ? `${distance.toFixed(1)} pts to ${w.toBand}`
                : distance !== null
                  ? `${distance.toFixed(1)} pt to threshold`
                  : null;

              return (
                <div
                  key={`${w.slug ?? i}-${i}`}
                  className="rounded-[14px] border p-4"
                  style={{
                    borderColor: isCrossing
                      ? "rgba(248,113,113,0.4)"
                      : "rgba(125,211,252,0.2)",
                    background: isCrossing
                      ? "rgba(248,113,113,0.05)"
                      : "rgba(255,255,255,0.015)",
                  }}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="min-w-0">
                      <div className="text-[0.68rem] font-bold uppercase tracking-wider text-muted mb-0.5">
                        {formatIndex(w.index)}
                      </div>
                      <div className="font-semibold text-[0.97rem]">
                        {href ? (
                          <TrackedEntityLink
                            href={href}
                            slug={w.slug}
                            index={w.index}
                            source="boundaryWatch"
                            className="hover:text-accent transition-colors"
                          >
                            {w.entity}
                          </TrackedEntityLink>
                        ) : (
                          w.entity
                        )}
                      </div>
                    </div>
                    {/* Score + distance */}
                    <div className="text-right shrink-0">
                      {score !== null && (
                        <div
                          className="font-mono font-bold text-[1.15rem] tabular-nums"
                          style={{ color: "#7dd3fc" }}
                        >
                          {score}
                        </div>
                      )}
                      {toBandLabel && (
                        <div
                          className="text-[0.72rem] tabular-nums font-semibold"
                          style={{ color: mColor }}
                        >
                          {toBandLabel}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Compact BandPositionStrip — shows where the score sits on the 0–100 scale */}
                  {score !== null && (
                    <div className="mb-3">
                      <BandPositionStrip
                        score={score}
                        entityName={w.entity ?? w.slug}
                        compact
                      />
                    </div>
                  )}

                  {/* Direction + band transition */}
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span
                      className="font-bold text-[0.88rem]"
                      aria-label={`Pressure direction: ${dirLabel}`}
                      style={{ color: mColor }}
                    >
                      {arrow}
                    </span>
                    <span className="text-[0.75rem] text-muted">
                      {dirLabel}
                    </span>
                    {typeof w.cycle === "number" && (
                      <span className="text-[0.72rem] font-mono text-muted">
                        cycle {w.cycle}
                      </span>
                    )}
                  </div>

                  {/* Trigger */}
                  {(w.trigger ?? w.note) && (
                    <div className="mt-1.5">
                      <div className="text-[0.66rem] font-bold uppercase tracking-widest text-muted mb-0.5">
                        Trigger to watch
                      </div>
                      <p className="text-[0.83rem] text-muted leading-relaxed">
                        {w.trigger ?? w.note}
                      </p>
                    </div>
                  )}

                  {/* Status */}
                  {w.status && (
                    <div
                      className="mt-2 text-[0.72rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded border inline-block"
                      style={{
                        color: mColor,
                        borderColor: `${mColor}44`,
                        background: `${mColor}10`,
                      }}
                    >
                      {w.status}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
