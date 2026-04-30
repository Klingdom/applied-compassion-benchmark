"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import Band, { BandLevel } from "@/components/ui/Band";
import Button from "@/components/ui/Button";
import { slugify } from "@/lib/slugify";
import { trackEvent } from "@/lib/analytics";

/**
 * Route prefixes by entity kind — kept in sync with the per-kind dynamic
 * routes under `app/company`, `app/country`, etc.
 */
const ENTITY_ROUTE: Record<string, string> = {
  company: "/company",
  country: "/country",
  "us-state": "/us-state",
  "ai-lab": "/ai-lab",
  "robotics-lab": "/robotics-lab",
  city: "/city",
  "us-city": "/us-city",
};

/**
 * Reverse map: entityKind → index slug used by analytics events.
 * This mirrors the route registry without requiring callers to pass an
 * additional indexSlug prop. Kept aligned with `entityHref.ts` INDEX_ROUTE_PREFIX.
 */
const KIND_TO_INDEX_SLUG: Record<string, string> = {
  company: "fortune-500",
  country: "countries",
  "us-state": "us-states",
  "ai-lab": "ai-labs",
  "robotics-lab": "robotics-labs",
  city: "global-cities",
  "us-city": "us-cities",
};

export type RankingEntry = {
  rank: number;
  name: string;
  scores: Record<string, number>;
  composite: number;
  band: string;
  [key: string]: unknown;
};

export type ColumnDef = {
  key: string;
  label: string;
  type?: "score" | "band" | "number" | "text";
};

type Props = {
  data: RankingEntry[];
  columns: ColumnDef[];
  searchPlaceholder?: string;
  filterKey?: string;
  filterLabel?: string;
  ctaText?: string;
  ctaDescription?: string;
  ctaLink?: string;
  ctaExternal?: boolean;
  ctaButtonLabel?: string;
  ctaInterval?: number;
  /**
   * If set, the `name` column is rendered as a link to the entity's detail page
   * (`/{kind}/{slug}`) using the shared slug convention.
   */
  entityKind?:
    | "company"
    | "country"
    | "us-state"
    | "ai-lab"
    | "robotics-lab"
    | "city"
    | "us-city";
};

export default function RankingTable({
  data,
  columns,
  searchPlaceholder = "Search...",
  filterKey,
  filterLabel = "All",
  ctaText = "Get the Complete Benchmark Report",
  ctaDescription = "Purchase the full benchmark report for added insights, methodology, sector analysis, key findings, and more.",
  ctaLink = "/purchase-research",
  ctaExternal = false,
  ctaButtonLabel = "Purchase Complete Report",
  ctaInterval = 50,
  entityKind,
}: Props) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("rank");

  const indexSlug = entityKind ? KIND_TO_INDEX_SLUG[entityKind] : undefined;

  // Debounced search tracking — only fire after the user stops typing for 800ms
  // and only when the query has 2+ characters. Avoids flooding analytics.
  const lastTrackedSearchRef = useRef<string>("");
  useEffect(() => {
    const trimmed = search.trim();
    if (trimmed.length < 2) return;
    const handle = setTimeout(() => {
      if (trimmed === lastTrackedSearchRef.current) return;
      lastTrackedSearchRef.current = trimmed;
      trackEvent("ranking_table_search", {
        index_slug: indexSlug,
        entity_kind: entityKind,
        query_length: trimmed.length,
      });
    }, 800);
    return () => clearTimeout(handle);
  }, [search, indexSlug, entityKind]);

  const filterOptions = useMemo(() => {
    if (!filterKey) return [];
    const values = new Set<string>();
    data.forEach((row) => {
      const val = row[filterKey];
      if (typeof val === "string" && val) values.add(val);
    });
    return Array.from(values).sort();
  }, [data, filterKey]);

  const filtered = useMemo(() => {
    let rows = data;

    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter((r) => r.name.toLowerCase().includes(q));
    }

    if (filterKey && filter !== "all") {
      rows = rows.filter((r) => r[filterKey] === filter);
    }

    if (sortBy === "score") {
      rows = [...rows].sort((a, b) => b.composite - a.composite);
    } else if (sortBy === "name") {
      rows = [...rows].sort((a, b) => a.name.localeCompare(b.name));
    } else {
      rows = [...rows].sort((a, b) => a.rank - b.rank);
    }

    return rows;
  }, [data, search, filter, filterKey, sortBy]);

  function renderCell(entry: RankingEntry, col: ColumnDef) {
    if (col.type === "band") {
      return <Band level={entry.band as BandLevel} />;
    }
    if (col.type === "score" && col.key === "composite") {
      return (
        <span className="text-accent font-bold whitespace-nowrap">
          {entry.composite}
        </span>
      );
    }

    // Dimension scores
    if (col.key.startsWith("scores.")) {
      const dim = col.key.replace("scores.", "");
      return entry.scores[dim];
    }

    // Link the entity name to its detail page when entityKind is provided.
    if (col.key === "name" && entityKind && ENTITY_ROUTE[entityKind]) {
      const slug = slugify(entry.name);
      return (
        <Link
          href={`${ENTITY_ROUTE[entityKind]}/${slug}`}
          onClick={() =>
            trackEvent("ranking_entity_click", {
              index_slug: indexSlug,
              entity_kind: entityKind,
              entity_name: entry.name,
              entity_slug: slug,
              rank: entry.rank,
              composite: entry.composite,
              band: entry.band,
            })
          }
          className="text-text hover:text-[#7dd3fc] transition-colors font-medium"
        >
          {entry.name}
        </Link>
      );
    }

    const val = entry[col.key];
    return val != null ? String(val) : "";
  }

  return (
    <div>
      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_220px_180px] gap-3 mb-4">
        <input
          type="text"
          className="min-h-[48px] rounded-[14px] border border-line bg-panel-2 text-text px-3.5 w-full text-base"
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {filterKey && (
          <select
            className="min-h-[48px] rounded-[14px] border border-line bg-panel-2 text-text px-3.5 w-full text-base"
            value={filter}
            onChange={(e) => {
              const next = e.target.value;
              setFilter(next);
              trackEvent("ranking_table_filter", {
                index_slug: indexSlug,
                entity_kind: entityKind,
                filter_key: filterKey,
                filter_value: next,
              });
            }}
          >
            <option value="all">{filterLabel}</option>
            {filterOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        )}
        <select
          className="min-h-[48px] rounded-[14px] border border-line bg-panel-2 text-text px-3.5 w-full text-base"
          value={sortBy}
          onChange={(e) => {
            const next = e.target.value;
            setSortBy(next);
            trackEvent("ranking_table_sort", {
              index_slug: indexSlug,
              entity_kind: entityKind,
              sort_by: next,
            });
          }}
        >
          <option value="rank">Sort by rank</option>
          <option value="score">Sort by score</option>
          <option value="name">Sort by name</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-auto border border-line rounded-[20px] bg-[rgba(255,255,255,0.03)]">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line whitespace-nowrap"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((entry, idx) => (
              <>
                <tr key={entry.rank}>
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="py-3 px-2.5 border-b border-line text-[0.95rem]"
                    >
                      {renderCell(entry, col)}
                    </td>
                  ))}
                </tr>
                {ctaInterval > 0 &&
                  (idx + 1) % ctaInterval === 0 &&
                  idx + 1 !== filtered.length && (
                    <tr key={`cta-${idx}`}>
                      <td
                        colSpan={columns.length}
                        className="py-[30px] px-5 bg-[rgba(125,211,252,0.08)] border-y border-[rgba(125,211,252,0.25)] text-center"
                      >
                        <strong className="block text-[1.2rem] mb-2.5">
                          {ctaText}
                        </strong>
                        <p className="text-muted max-w-[700px] mx-auto mb-4">
                          {ctaDescription}
                        </p>
                        <Button href={ctaLink} variant="primary" external={ctaExternal}>
                          {ctaButtonLabel}
                        </Button>
                      </td>
                    </tr>
                  )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-muted text-[0.92rem] mt-3">
        Showing {filtered.length} of {data.length} entities
      </p>
    </div>
  );
}
