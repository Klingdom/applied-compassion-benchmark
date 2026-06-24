"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import Container from "@/components/ui/Container";
import SignalCard from "./SignalCard";
import { pickLeadSignal } from "./utils";

// Wave-A fix: the hero CTA always links to #signals, so this section
// must always render its anchor wrapper even when there are no signals.

interface Props {
  updates: any;
}

const ALL_FILTERS = [
  { id: "all", label: "All signals" },
  { id: "ai", label: "AI" },
  { id: "countries", label: "Countries" },
  { id: "corporations", label: "Corporations" },
  { id: "conflict", label: "Conflict" },
  { id: "score-changes", label: "Score changes" },
  { id: "boundary-watch", label: "Boundary watch" },
  { id: "action-required", label: "Action required" },
] as const;

type FilterId = (typeof ALL_FILTERS)[number]["id"];

function matchesFilter(signal: any, filterId: FilterId): boolean {
  if (filterId === "all") return true;
  const index: string = (signal.index ?? "").toLowerCase();
  const title: string = (signal.title ?? "").toLowerCase();
  const severity: string = (signal.severity ?? "").toLowerCase();
  const actionRequired = Boolean(signal.actionRequired);

  switch (filterId) {
    case "ai":
      return index.includes("ai") || index.includes("robot");
    case "countries":
      return index === "countries";
    case "corporations":
      return index.includes("fortune") || index.includes("company");
    case "conflict":
      return /conflict|war|attack|ceasefire|drone|missile|military/i.test(
        title + " " + (signal.description ?? ""),
      );
    case "score-changes":
      return (
        typeof signal.delta === "number" ||
        /score changed|band crossing/i.test(title)
      );
    case "boundary-watch":
      return (
        signal.boundaryWatch === true ||
        /boundary|threshold|crossing/i.test(title) ||
        severity === "critical"
      );
    case "action-required":
      return actionRequired;
    default:
      return true;
  }
}

export default function SignalStack({ updates }: Props) {
  const [activeFilter, setActiveFilter] = useState<FilterId>("all");

  const topSignals: any[] = Array.isArray(updates.topSignals)
    ? updates.topSignals
    : [];
  const sectorAlerts: any[] = Array.isArray(updates.sectorAlerts)
    ? updates.sectorAlerts
    : [];

  // Exclude the lead signal from the stack to avoid duplication
  const lead = pickLeadSignal(topSignals);
  const leadSlug = lead?.slug;

  // Build unified signal feed: remaining topSignals + normalized confirmations + sectorAlerts
  const allSignals: any[] = [
    ...topSignals.filter((s: any) => s.slug !== leadSlug),
    ...sectorAlerts.map((a: any) => ({
      slug: a.slug ?? a.sector,
      index: a.index ?? "",
      title: a.sector ?? a.headline,
      // Takeaway = headline; full content (the observations bullets) is revealed
      // via the card's "Read the full signal" disclosure rather than dropped.
      description: a.headline ?? a.alert ?? a.summary ?? "",
      bullets: Array.isArray(a.observations) ? a.observations : undefined,
      severity: a.severity ?? "medium",
      actionRequired: a.actionRequired ?? false,
    })),
  ];

  // Always render the #signals anchor so the hero CTA never dead-links.
  // When there are no signals, show a minimal graceful empty state.
  if (allSignals.length === 0) {
    return (
      <section
        id="signals"
        className="py-[30px] scroll-mt-24"
        aria-label="Signal stack"
      >
        <Container>
          <p className="text-muted text-[0.9rem] py-6">
            Signal stack not available for this briefing — see score movements below.
          </p>
        </Container>
      </section>
    );
  }

  // ITEM 4: precompute per-filter match counts for chip labels
  const filterCounts: Record<FilterId, number> = {} as Record<FilterId, number>;
  for (const { id } of ALL_FILTERS) {
    filterCounts[id] = allSignals.filter((s) => matchesFilter(s, id)).length;
  }

  const filtered = allSignals.filter((s) => matchesFilter(s, activeFilter));

  // ITEM 5: truncation — show first 6 by default, toggle to reveal all
  const INITIAL_SHOWN = 6;
  const [showAll, setShowAll] = useState(false);
  const visibleSignals = showAll ? filtered : filtered.slice(0, INITIAL_SHOWN);
  const hiddenCount = filtered.length - INITIAL_SHOWN;

  return (
    <section
      id="signals"
      className="py-[30px] scroll-mt-24"
      aria-label="Signal stack"
    >
      <Container>
        <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
          <h2 className="text-[1.25rem] font-bold">Signal stack</h2>
          <span className="text-muted text-[0.85rem]">
            {allSignals.length} signals
          </span>
        </div>

        {/* Filter chips with match counts (ITEM 4) */}
        <div
          role="tablist"
          aria-label="Filter signals by category"
          className="flex flex-wrap gap-2 mb-5"
        >
          {ALL_FILTERS.map(({ id, label }) => {
            const isActive = activeFilter === id;
            const count = filterCounts[id];
            // Hide filters with 0 matches (except "All signals")
            if (id !== "all" && count === 0) return null;
            return (
              <button
                key={id}
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  setActiveFilter(id);
                  // Reset show-all when filter changes
                  setShowAll(false);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[0.78rem] font-semibold border transition-colors ${
                  isActive
                    ? "border-[rgba(125,211,252,0.5)] bg-[rgba(125,211,252,0.15)] text-[#7dd3fc]"
                    : "border-line bg-[rgba(255,255,255,0.03)] text-muted hover:border-[rgba(125,211,252,0.25)] hover:text-text"
                }`}
              >
                {label}
                {/* Count badge — shows "all" count for "All signals" chip */}
                <span
                  className={`text-[0.66rem] font-bold tabular-nums px-1 py-0 rounded ${
                    isActive
                      ? "text-[#7dd3fc] opacity-80"
                      : "text-muted opacity-70"
                  }`}
                  aria-hidden="true"
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <p className="text-muted text-[0.9rem] py-6">
            No signals match the selected filter.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {visibleSignals.map((signal: any, i: number) => (
                <SignalCard key={`${signal.slug ?? i}-${i}`} signal={signal} />
              ))}
            </div>
            {/* ITEM 5: show-all toggle */}
            {!showAll && hiddenCount > 0 && (
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => setShowAll(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[0.82rem] font-semibold border border-line bg-[rgba(255,255,255,0.03)] text-muted hover:border-[rgba(125,211,252,0.3)] hover:text-text transition-colors"
                  aria-label={`Show all ${filtered.length} signals`}
                >
                  Show all {filtered.length} signals
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M6 2v8M2 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            )}
            {showAll && filtered.length > INITIAL_SHOWN && (
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => setShowAll(false)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[0.82rem] font-semibold border border-line bg-[rgba(255,255,255,0.03)] text-muted hover:border-[rgba(125,211,252,0.3)] hover:text-text transition-colors"
                  aria-label="Collapse signal list"
                >
                  Show fewer
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M6 10V2M2 6l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}

        {/* #18 a11y — announce filter result count to screen readers */}
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          {activeFilter === "all"
            ? `${filtered.length} signal${filtered.length !== 1 ? "s" : ""} shown`
            : `${filtered.length} signal${filtered.length !== 1 ? "s" : ""} matching ${ALL_FILTERS.find((f) => f.id === activeFilter)?.label ?? activeFilter}`}
        </div>
      </Container>
    </section>
  );
}
