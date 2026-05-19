"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import Container from "@/components/ui/Container";
import SignalCard from "./SignalCard";
import { pickLeadSignal } from "./utils";

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
      description: a.alert ?? a.summary ?? a.headline,
      severity: a.severity ?? "medium",
      actionRequired: a.actionRequired ?? false,
    })),
  ];

  if (allSignals.length === 0) return null;

  const filtered = allSignals.filter((s) => matchesFilter(s, activeFilter));

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

        {/* Filter chips */}
        <div
          role="tablist"
          aria-label="Filter signals by category"
          className="flex flex-wrap gap-2 mb-5"
        >
          {ALL_FILTERS.map(({ id, label }) => {
            const isActive = activeFilter === id;
            return (
              <button
                key={id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveFilter(id)}
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-[0.78rem] font-semibold border transition-colors ${
                  isActive
                    ? "border-[rgba(125,211,252,0.5)] bg-[rgba(125,211,252,0.15)] text-[#7dd3fc]"
                    : "border-line bg-[rgba(255,255,255,0.03)] text-muted hover:border-[rgba(125,211,252,0.25)] hover:text-text"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <p className="text-muted text-[0.9rem] py-6">
            No signals match the selected filter.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((signal: any, i: number) => (
              <SignalCard key={`${signal.slug ?? i}-${i}`} signal={signal} />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
