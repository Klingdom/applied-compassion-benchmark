"use client";

/**
 * NavbarSearch — S1.7 (Wave S1)
 *
 * A search icon in the navbar that expands to a compact search panel
 * for fast entity lookup without navigating to /indexes.
 *
 * - Click the search icon to open; click outside or press Escape to close.
 * - Uses the same dynamic-import data loading as EntitySearch.
 * - Results link directly to entity detail pages.
 * - Mobile: full-width panel below the navbar toggle row.
 */

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import { entityHref } from "@/lib/entityHref";
import { slugify } from "@/lib/slugify";
import { trackEvent } from "@/lib/analytics";
import { SCORED_ENTITY_COUNT_FORMATTED } from "@/data/entityCount";

interface SearchResult {
  name: string;
  rank: number;
  composite: number;
  band: string;
  indexTitle: string;
  indexSlug: string;
  totalEntities: number;
}

interface IndexData {
  meta: { title: string; entityCount?: number };
  rankings: Array<{ rank: number; name: string; composite: number; band: string }>;
}

const INDEX_REGISTRY = [
  { slug: "countries",     label: "Countries" },
  { slug: "us-states",     label: "U.S. States" },
  { slug: "fortune-500",   label: "Fortune 500" },
  { slug: "ai-labs",       label: "AI Labs" },
  { slug: "robotics-labs", label: "Robotics Labs" },
  { slug: "us-cities",     label: "U.S. Cities" },
  { slug: "global-cities", label: "Global Cities" },
];

function bandColor(band: string): string {
  const map: Record<string, string> = {
    critical: "#f87171", developing: "#fb923c", functional: "#fcd34d",
    established: "#86efac", exemplary: "#7dd3fc",
  };
  return map[band.toLowerCase()] ?? "#7dd3fc";
}

export default function NavbarSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [allEntities, setAllEntities] = useState<SearchResult[]>([]);
  const [loaded, setLoaded] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load data when panel first opens
  useEffect(() => {
    if (!open || loaded) return;
    async function load() {
      const mods = await Promise.all([
        import("@/data/indexes/countries.json"),
        import("@/data/indexes/us-states.json"),
        import("@/data/indexes/fortune-500.json"),
        import("@/data/indexes/ai-labs.json"),
        import("@/data/indexes/robotics-labs.json"),
        import("@/data/indexes/us-cities.json"),
        import("@/data/indexes/global-cities.json"),
      ]);
      const results: SearchResult[] = [];
      mods.forEach((mod, i) => {
        const data = (mod.default ?? mod) as IndexData;
        const reg = INDEX_REGISTRY[i];
        data.rankings.forEach((entity) => {
          results.push({
            name: entity.name, rank: entity.rank, composite: entity.composite,
            band: entity.band, indexTitle: reg.label, indexSlug: reg.slug,
            totalEntities: data.meta.entityCount ?? data.rankings.length,
          });
        });
      });
      setAllEntities(results);
      setLoaded(true);
    }
    load();
  }, [open, loaded]);

  // Focus input when panel opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // Close on click outside
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || q.length < 2) return [];
    const matches = allEntities.filter((e) => e.name.toLowerCase().includes(q));
    matches.sort((a, b) => {
      const aP = a.name.toLowerCase().startsWith(q) ? 0 : 1;
      const bP = b.name.toLowerCase().startsWith(q) ? 0 : 1;
      if (aP !== bP) return aP - bP;
      return b.composite - a.composite;
    });
    return matches.slice(0, 8);
  }, [query, allEntities]);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  }, []);

  return (
    <div ref={panelRef} className="relative">
      {/* Search icon button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Search entities"
        aria-expanded={open}
        className="text-muted hover:text-text transition-colors p-2 rounded-[10px] hover:bg-[rgba(255,255,255,0.06)]"
      >
        <svg
          width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
      </button>

      {/* Expanded search panel */}
      {open && (
        <div className="absolute top-full right-0 mt-2 w-[340px] sm:w-[420px] bg-panel border border-line rounded-[16px] shadow-[0_20px_50px_rgba(0,0,0,0.4)] z-50 overflow-hidden">
          <div className="p-3 border-b border-line">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={handleInput}
                placeholder={loaded ? "Search entities..." : "Loading…"}
                disabled={!loaded}
                className="w-full min-h-[40px] rounded-[10px] border border-line bg-[rgba(255,255,255,0.04)] text-text px-4 pr-9 text-[0.92rem] focus:outline-none focus:border-[rgba(125,211,252,0.4)] placeholder:text-muted disabled:opacity-50"
              />
              <svg
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Results */}
          {query.trim().length >= 2 && (
            <div className="max-h-[360px] overflow-y-auto">
              {results.length === 0 ? (
                <p className="text-center text-muted text-[0.88rem] py-5 px-4">
                  No entities found for &ldquo;{query}&rdquo;
                </p>
              ) : (
                <ul>
                  {results.map((r, i) => {
                    const detailHref = entityHref(r.indexSlug, slugify(r.name));
                    const href = detailHref ?? `/${r.indexSlug}`;
                    return (
                      <li key={`${r.indexSlug}-${r.name}-${i}`}>
                        <Link
                          href={href}
                          onClick={() => {
                            setOpen(false);
                            trackEvent("navbar_entity_search_click", {
                              query: query.trim(),
                              index_slug: r.indexSlug,
                              entity_name: r.name,
                            });
                          }}
                          className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-[rgba(255,255,255,0.04)] transition-colors border-b border-line last:border-b-0"
                        >
                          <div className="min-w-0">
                            <p className="text-[0.92rem] font-semibold text-text truncate">
                              {r.name}
                            </p>
                            <p className="text-[0.75rem] text-muted">
                              {r.indexTitle} · #{r.rank}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p
                              className="text-[1.1rem] font-bold leading-none"
                              style={{ color: bandColor(r.band) }}
                            >
                              {r.composite}
                            </p>
                            <p className="text-[0.68rem] text-muted mt-0.5">/ 100</p>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
              <div className="border-t border-line px-4 py-2.5">
                <Link
                  href={`/indexes?entity=${encodeURIComponent(query)}`}
                  onClick={() => setOpen(false)}
                  className="text-[0.78rem] text-accent hover:text-text transition-colors"
                >
                  Search all entities on /indexes →
                </Link>
              </div>
            </div>
          )}

          {query.trim().length < 2 && loaded && (
            <p className="text-[0.78rem] text-muted text-center py-3 px-4">
              Type 2+ characters to search {SCORED_ENTITY_COUNT_FORMATTED} entities
            </p>
          )}
        </div>
      )}
    </div>
  );
}
