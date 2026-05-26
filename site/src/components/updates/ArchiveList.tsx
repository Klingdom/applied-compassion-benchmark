"use client";

/**
 * ArchiveList — client component for /updates/archive.
 *
 * Receives pre-computed archive data as a prop from the server page.
 * All filtering, sorting, and expand behaviour runs client-side with no
 * API calls.
 */

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import ArchiveSearch from "@/components/search/ArchiveSearch";
import type { ArchiveEntry } from "@/data/updates/archiveIndex";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ArchiveListProps {
  entries: ArchiveEntry[];
}

type SortMode = "chronological" | "most-significant";

// ─── Constants ────────────────────────────────────────────────────────────────

const SECTOR_OPTIONS = [
  { value: "", label: "All sectors" },
  { value: "ai-labs", label: "AI Labs" },
  { value: "countries", label: "Countries" },
  { value: "fortune-500", label: "Fortune 500" },
  { value: "us-states", label: "US States" },
  { value: "us-cities", label: "US Cities" },
  { value: "global-cities", label: "Global Cities" },
  { value: "robotics-labs", label: "Robotics Labs" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getMonthKey(date: string): string {
  // date is "YYYY-MM-DD"
  const [year, month] = date.split("-");
  return `${year}-${month}`;
}

function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split("-").map(Number);
  const d = new Date(year, month - 1, 1);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function formatShortDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ─── Row component ────────────────────────────────────────────────────────────

function ArchiveRow({
  entry,
  showDatePill,
}: {
  entry: ArchiveEntry;
  showDatePill: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);

  const toggle = useCallback(() => setExpanded((v) => !v), []);

  // Keyboard: Enter expands, Escape collapses
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setExpanded((v) => !v);
      }
      if (e.key === "Escape" && expanded) {
        setExpanded(false);
        rowRef.current?.focus();
      }
    },
    [expanded]
  );

  // Truncate headline to 80 chars
  const truncatedHeadline =
    entry.headline.length > 80
      ? entry.headline.slice(0, 80).trimEnd() + "…"
      : entry.headline;

  // Truncate summary to 200 chars
  const truncatedSummary =
    entry.summary.length > 200
      ? entry.summary.slice(0, 200).trimEnd() + "…"
      : entry.summary;

  const ariaLabel = `${entry.date} — ${truncatedHeadline}`;

  return (
    <div
      ref={rowRef}
      role="article"
      tabIndex={0}
      aria-label={ariaLabel}
      onClick={toggle}
      onKeyDown={handleKeyDown}
      className={[
        "border-b border-line cursor-pointer outline-none",
        "focus-visible:ring-2 focus-visible:ring-[rgba(125,211,252,0.5)] focus-visible:ring-inset",
        "transition-colors",
        expanded
          ? "bg-[rgba(26,42,70,0.8)]"
          : "bg-transparent hover:bg-[rgba(255,255,255,0.025)]",
      ].join(" ")}
    >
      {/* Main row content */}
      <div className="px-4 py-3 sm:px-6">
        <div className="flex items-start gap-3 flex-wrap sm:flex-nowrap">
          {/* Date */}
          {showDatePill ? (
            <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-[6px] bg-[rgba(255,255,255,0.06)] border border-line text-[0.78rem] text-muted font-mono tabular-nums mt-0.5">
              {entry.date}
            </span>
          ) : (
            <span className="shrink-0 min-w-[52px] text-[0.88rem] text-muted font-semibold tabular-nums mt-0.5">
              {formatShortDate(entry.date)}
            </span>
          )}

          {/* Headline + meta */}
          <div className="flex-1 min-w-0">
            <p className="text-text text-[0.95rem] leading-snug font-medium">
              {truncatedHeadline}
            </p>

            {/* Second line: entities + change count */}
            <div className="flex items-center gap-2 flex-wrap mt-1.5">
              {/* Top entity chips */}
              {entry.topEntities.slice(0, 3).map((entity) => (
                <span
                  key={entity.slug}
                  className="inline-flex px-2 py-0.5 rounded-[6px] text-[0.75rem] font-semibold border border-[rgba(125,211,252,0.2)] bg-[rgba(125,211,252,0.07)] text-[#7dd3fc]"
                >
                  {entity.title.split(" ")[0]}
                </span>
              ))}

              {/* Score changes badge */}
              {entry.scoreChanges > 0 && (
                <span className="text-[0.75rem] font-semibold text-[#fb923c]">
                  +{entry.scoreChanges} change{entry.scoreChanges !== 1 ? "s" : ""}
                </span>
              )}

              {/* Sub-threshold count */}
              {entry.subThresholdMovements > 0 && (
                <span className="text-[0.75rem] text-muted">
                  {entry.subThresholdMovements} sub
                </span>
              )}

              {/* Methodology ruling dot */}
              {entry.hasMethodologyRuling && (
                <span
                  title="Methodology ruling established"
                  aria-label="Methodology ruling established"
                  className="w-2 h-2 rounded-full bg-[#7dd3fc] shrink-0 shadow-[0_0_4px_rgba(125,211,252,0.6)]"
                />
              )}
            </div>
          </div>

          {/* Expand chevron */}
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden="true"
            className={`shrink-0 mt-1 text-muted transition-transform duration-150 ${expanded ? "rotate-180" : ""}`}
          >
            <path
              d="M3 5L7 9L11 5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Expanded preview */}
      {expanded && (
        <div
          role="region"
          aria-label={`Preview: ${entry.date} briefing`}
          className="px-4 pb-4 sm:px-6 sm:pl-[calc(52px+24px)]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="rounded-[12px] border border-line bg-[rgba(125,211,252,0.04)] p-4">
            {truncatedSummary ? (
              <p className="text-muted text-[0.9rem] leading-relaxed mb-3">
                {truncatedSummary}
              </p>
            ) : (
              <p className="text-muted text-[0.9rem] italic mb-3">
                No summary available for this briefing.
              </p>
            )}
            <Link
              href={`/updates/${entry.date}`}
              className="inline-flex items-center gap-1.5 text-[0.88rem] text-[#7dd3fc] hover:text-text font-semibold transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              Read full briefing
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2.5 6h7M6 2.5L9.5 6 6 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Month group ──────────────────────────────────────────────────────────────

function MonthGroup({
  monthKey,
  entries,
}: {
  monthKey: string;
  entries: ArchiveEntry[];
}) {
  const [collapsed, setCollapsed] = useState(false);
  const monthLabel = formatMonthLabel(monthKey);

  return (
    <div>
      {/* Sticky month header */}
      <div
        className="sticky top-[74px] z-10 bg-[rgba(11,18,32,0.92)] backdrop-blur-[8px] border-b border-line"
        id={`month-${monthKey}`}
      >
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-2 sm:px-6 text-left group"
          aria-expanded={!collapsed}
          aria-controls={`month-content-${monthKey}`}
        >
          <h2 className="text-[0.75rem] font-bold uppercase tracking-[0.18em] text-[#7dd3fc]">
            {monthLabel}
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-[0.75rem] text-muted">
              {entries.length} briefing{entries.length !== 1 ? "s" : ""}
            </span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden="true"
              className={`text-muted transition-transform duration-150 ${collapsed ? "-rotate-90" : ""}`}
            >
              <path
                d="M3 4.5L6 7.5L9 4.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </button>
      </div>

      {!collapsed && (
        <div id={`month-content-${monthKey}`}>
          {entries.map((entry) => (
            <ArchiveRow key={entry.date} entry={entry} showDatePill={false} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Filter bar ───────────────────────────────────────────────────────────────

interface FilterBarProps {
  monthOptions: string[];
  activeMonth: string;
  activeSector: string;
  activeEntity: string;
  sortMode: SortMode;
  onMonthChange: (v: string) => void;
  onSectorChange: (v: string) => void;
  onEntityChange: (v: string) => void;
  onSortChange: (v: SortMode) => void;
  onClearAll: () => void;
  matchCount: number;
  totalCount: number;
}

function FilterBar({
  monthOptions,
  activeMonth,
  activeSector,
  activeEntity,
  sortMode,
  onMonthChange,
  onSectorChange,
  onEntityChange,
  onSortChange,
  onClearAll,
  matchCount,
  totalCount,
}: FilterBarProps) {
  const hasActiveFilter = !!(activeMonth || activeSector || activeEntity);
  const entityInputRef = useRef<HTMLInputElement>(null);

  // Debounce for entity input
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleEntityInput = (v: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onEntityChange(v);
    }, 200);
  };

  // Clear all resets focus to entity input per UX doc
  const handleClearAll = () => {
    onClearAll();
    if (entityInputRef.current) {
      entityInputRef.current.value = "";
    }
    entityInputRef.current?.focus();
  };

  const selectClass =
    "bg-[rgba(255,255,255,0.06)] border border-line text-text text-[0.88rem] rounded-[10px] px-3 py-1.5 appearance-none cursor-pointer hover:border-[rgba(125,211,252,0.3)] focus:outline-none focus:ring-2 focus:ring-[rgba(125,211,252,0.4)] transition-colors";

  return (
    <div className="border-b border-line bg-[rgba(255,255,255,0.02)]">
      <div className="px-4 py-3 sm:px-6 flex flex-wrap gap-3 items-center overflow-x-auto">
        {/* Month filter */}
        <select
          aria-label="Filter by month"
          value={activeMonth}
          onChange={(e) => onMonthChange(e.target.value)}
          className={selectClass}
        >
          <option value="">All months</option>
          {monthOptions.map((m) => (
            <option key={m} value={m}>
              {formatMonthLabel(m)}
            </option>
          ))}
        </select>

        {/* Sector filter */}
        <select
          aria-label="Filter by sector"
          value={activeSector}
          onChange={(e) => onSectorChange(e.target.value)}
          className={selectClass}
        >
          {SECTOR_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Entity text filter */}
        <div className="relative flex items-center">
          <input
            ref={entityInputRef}
            type="text"
            aria-label="Filter by entity name"
            placeholder="Entity…"
            defaultValue={activeEntity}
            onChange={(e) => handleEntityInput(e.target.value)}
            className={`${selectClass} pr-7 min-w-[120px] placeholder:text-muted`}
          />
          {activeEntity && (
            <button
              type="button"
              aria-label="Clear entity filter"
              onClick={() => {
                onEntityChange("");
                if (entityInputRef.current) entityInputRef.current.value = "";
              }}
              className="absolute right-2 text-muted hover:text-text transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1 min-w-0" />

        {/* Sort */}
        <div className="flex items-center gap-2">
          <span className="text-[0.82rem] text-muted shrink-0">Sort:</span>
          <select
            aria-label="Sort briefings"
            value={sortMode}
            onChange={(e) => onSortChange(e.target.value as SortMode)}
            className={selectClass}
          >
            <option value="chronological">Chronological</option>
            <option value="most-significant">Most significant</option>
          </select>
        </div>
      </div>

      {/* Active filter chips + count */}
      {hasActiveFilter && (
        <div className="px-4 pb-3 sm:px-6 flex flex-wrap items-center gap-2">
          {activeMonth && (
            <button
              type="button"
              onClick={() => onMonthChange("")}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.78rem] bg-[rgba(125,211,252,0.1)] border border-[rgba(125,211,252,0.25)] text-[#7dd3fc] hover:bg-[rgba(125,211,252,0.18)] transition-colors"
            >
              {formatMonthLabel(activeMonth)}
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-label="Remove month filter">
                <path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          )}
          {activeSector && (
            <button
              type="button"
              onClick={() => onSectorChange("")}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.78rem] bg-[rgba(125,211,252,0.1)] border border-[rgba(125,211,252,0.25)] text-[#7dd3fc] hover:bg-[rgba(125,211,252,0.18)] transition-colors"
            >
              {SECTOR_OPTIONS.find((o) => o.value === activeSector)?.label ?? activeSector}
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-label="Remove sector filter">
                <path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          )}
          {activeEntity && (
            <button
              type="button"
              onClick={() => {
                onEntityChange("");
                if (entityInputRef.current) entityInputRef.current.value = "";
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.78rem] bg-[rgba(125,211,252,0.1)] border border-[rgba(125,211,252,0.25)] text-[#7dd3fc] hover:bg-[rgba(125,211,252,0.18)] transition-colors"
            >
              Entity: {activeEntity}
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-label="Remove entity filter">
                <path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          )}
          <span className="text-[0.82rem] text-muted ml-1">
            Showing {matchCount} of {totalCount} briefings
          </span>
          <button
            type="button"
            onClick={handleClearAll}
            className="text-[0.82rem] text-[#7dd3fc] hover:text-text transition-colors ml-1 underline underline-offset-2"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({
  activeEntity,
  activeSector,
  onClearAll,
}: {
  activeEntity: string;
  activeSector: string;
  onClearAll: () => void;
}) {
  const hasEntity = !!activeEntity;
  const hasSector = !!activeSector;

  let suggestion: string;
  if (hasEntity && hasSector) {
    suggestion = `Try removing the sector filter — "${activeEntity}" may appear in other indexes.`;
  } else if (hasEntity) {
    suggestion = `"${activeEntity}" appears in 0 briefings. Try a different entity name or check your spelling.`;
  } else {
    suggestion = "Try selecting a different month or sector, or clear all filters.";
  }

  return (
    <div className="px-6 py-16 text-center">
      <p className="text-text text-[1rem] font-semibold mb-2">
        No briefings match these filters.
      </p>
      <p className="text-muted text-[0.9rem] mb-6 max-w-[420px] mx-auto">{suggestion}</p>
      <button
        type="button"
        onClick={onClearAll}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-[10px] border border-[rgba(125,211,252,0.3)] bg-[rgba(125,211,252,0.08)] text-[#7dd3fc] text-[0.9rem] font-semibold hover:bg-[rgba(125,211,252,0.14)] transition-colors focus:outline-none focus:ring-2 focus:ring-[rgba(125,211,252,0.5)]"
      >
        Reset all filters
      </button>
    </div>
  );
}

// ─── Main ArchiveList ─────────────────────────────────────────────────────────

export default function ArchiveList({ entries }: ArchiveListProps) {
  const [activeMonth, setActiveMonth] = useState("");
  const [activeSector, setActiveSector] = useState("");
  const [activeEntity, setActiveEntity] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("chronological");

  // Derive month options from entries
  const monthOptions = [
    ...new Set(entries.map((e) => getMonthKey(e.date))),
  ].sort((a, b) => b.localeCompare(a)); // newest first

  // Filter
  const filtered = entries.filter((entry) => {
    if (activeMonth && getMonthKey(entry.date) !== activeMonth) return false;
    if (activeSector && !entry.indexSlugs.includes(activeSector)) return false;
    if (activeEntity) {
      const q = activeEntity.toLowerCase();
      const matchesEntity = entry.topEntities.some(
        (e) =>
          e.slug.toLowerCase().includes(q) ||
          e.title.toLowerCase().includes(q)
      );
      if (!matchesEntity) return false;
    }
    return true;
  });

  // Sort
  const sorted =
    sortMode === "most-significant"
      ? [...filtered].sort(
          (a, b) =>
            b.scoreChanges - a.scoreChanges ||
            b.date.localeCompare(a.date)
        )
      : filtered; // already newest-first from manifest

  const handleClearAll = () => {
    setActiveMonth("");
    setActiveSector("");
    setActiveEntity("");
  };

  // Group by month for chronological view
  const monthGroups: Array<{ monthKey: string; entries: ArchiveEntry[] }> = [];
  if (sortMode === "chronological") {
    const seen = new Map<string, ArchiveEntry[]>();
    for (const entry of sorted) {
      const mk = getMonthKey(entry.date);
      if (!seen.has(mk)) seen.set(mk, []);
      seen.get(mk)!.push(entry);
    }
    for (const [monthKey, monthEntries] of seen) {
      monthGroups.push({ monthKey, entries: monthEntries });
    }
  }

  return (
    <div>
      {/* Search box — positioned above filter bar per UX_FLOWS_ARCHIVE.md §3.1 */}
      <div className="px-4 py-4 sm:px-6 border-b border-line">
        <ArchiveSearch entries={entries} />
      </div>

      <FilterBar
        monthOptions={monthOptions}
        activeMonth={activeMonth}
        activeSector={activeSector}
        activeEntity={activeEntity}
        sortMode={sortMode}
        onMonthChange={setActiveMonth}
        onSectorChange={setActiveSector}
        onEntityChange={setActiveEntity}
        onSortChange={setSortMode}
        onClearAll={handleClearAll}
        matchCount={sorted.length}
        totalCount={entries.length}
      />

      <div
        role="feed"
        aria-label="Archive briefings list"
        aria-busy="false"
      >
        {sorted.length === 0 ? (
          <EmptyState
            activeEntity={activeEntity}
            activeSector={activeSector}
            onClearAll={handleClearAll}
          />
        ) : sortMode === "most-significant" ? (
          // Flat ranked list — no month grouping per UX doc
          sorted.map((entry) => (
            <ArchiveRow key={entry.date} entry={entry} showDatePill={true} />
          ))
        ) : (
          // Grouped by month
          monthGroups.map(({ monthKey, entries: monthEntries }) => (
            <MonthGroup key={monthKey} monthKey={monthKey} entries={monthEntries} />
          ))
        )}
      </div>

      {/* Live region for filter result announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {sorted.length > 0
          ? `${sorted.length} briefing${sorted.length !== 1 ? "s" : ""} shown`
          : "No briefings match these filters"}
      </div>
    </div>
  );
}
