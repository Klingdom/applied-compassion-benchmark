"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface RankingEntity {
  rank: number;
  name: string;
  composite: number;
  band: string;
  [key: string]: unknown;
}

interface IndexData {
  meta: { title: string; entityCount?: number };
  rankings: RankingEntity[];
}

interface SearchResult {
  name: string;
  rank: number;
  composite: number;
  band: string;
  indexTitle: string;
  indexSlug: string;
  totalEntities: number;
}

/* ------------------------------------------------------------------ */
/* Index registry — maps slugs to data imports                         */
/* ------------------------------------------------------------------ */

const INDEX_REGISTRY: { slug: string; label: string; path: string }[] = [
  { slug: "countries", label: "Countries", path: "countries" },
  { slug: "us-states", label: "U.S. States", path: "us-states" },
  { slug: "fortune-500", label: "Fortune 500", path: "fortune-500" },
  { slug: "ai-labs", label: "AI Labs", path: "ai-labs" },
  { slug: "robotics-labs", label: "Robotics Labs", path: "robotics-labs" },
  { slug: "us-cities", label: "U.S. Cities", path: "us-cities" },
  { slug: "global-cities", label: "Global Cities", path: "global-cities" },
];

/* ------------------------------------------------------------------ */
/* Band color helper                                                   */
/* ------------------------------------------------------------------ */

function bandColor(band: string): string {
  const map: Record<string, string> = {
    critical: "#f87171",
    developing: "#fb923c",
    functional: "#fcd34d",
    established: "#86efac",
    exemplary: "#7dd3fc",
  };
  return map[band.toLowerCase()] ?? "#7dd3fc";
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export default function EntitySearch() {
  const [allEntities, setAllEntities] = useState<SearchResult[]>([]);
  const [query, setQuery] = useState("");
  const [loaded, setLoaded] = useState(false);

  // Load all index data at mount
  useEffect(() => {
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
            name: entity.name,
            rank: entity.rank,
            composite: entity.composite,
            band: entity.band,
            indexTitle: reg.label,
            indexSlug: reg.slug,
            totalEntities: data.meta.entityCount ?? data.rankings.length,
          });
        });
      });

      setAllEntities(results);
      setLoaded(true);
    }
    load();
  }, []);

  // Read URL param on mount for SEO entry point
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const entity = params.get("entity");
    if (entity) {
      setQuery(entity);
    }
  }, []);

  // Search logic — fuzzy-ish prefix + substring matching
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || q.length < 2) return [];

    const matches = allEntities.filter((e) =>
      e.name.toLowerCase().includes(q),
    );

    // Sort: exact prefix match first, then by composite score descending
    matches.sort((a, b) => {
      const aPrefix = a.name.toLowerCase().startsWith(q) ? 0 : 1;
      const bPrefix = b.name.toLowerCase().startsWith(q) ? 0 : 1;
      if (aPrefix !== bPrefix) return aPrefix - bPrefix;
      return b.composite - a.composite;
    });

    return matches.slice(0, 12);
  }, [query, allEntities]);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  }, []);

  return (
    <div className="w-full">
      {/* Search input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInput}
          placeholder={
            loaded
              ? `Search ${allEntities.length.toLocaleString()} entities across all indexes...`
              : "Loading entity data..."
          }
          disabled={!loaded}
          className="w-full min-h-[54px] rounded-[16px] border border-line bg-[rgba(255,255,255,0.04)] text-text px-5 pr-12 text-[1.05rem] transition-all duration-150 focus:outline-none focus:border-[rgba(125,211,252,0.4)] focus:bg-[rgba(125,211,252,0.04)] placeholder:text-muted disabled:opacity-50"
        />
        <svg
          className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Results */}
      {query.trim().length >= 2 && (
        <div className="mt-3">
          {results.length === 0 ? (
            <div className="bg-[rgba(255,255,255,0.03)] border border-line rounded-[14px] p-5 text-center text-muted">
              No entities found matching &ldquo;{query}&rdquo;
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {results.map((r, i) => (
                <Link
                  key={`${r.indexSlug}-${r.name}-${i}`}
                  href={`/${r.indexSlug}`}
                  className="bg-[rgba(255,255,255,0.03)] border border-line rounded-[16px] p-4 hover:border-[rgba(125,211,252,0.25)] hover:bg-[rgba(125,211,252,0.04)] transition-all duration-150 group block"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h4 className="font-bold text-text text-[1rem] group-hover:text-accent transition-colors">
                        {r.name}
                      </h4>
                      <span className="text-[0.82rem] text-muted">
                        {r.indexTitle} &middot; Rank {r.rank} of{" "}
                        {r.totalEntities}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <div
                        className="text-[1.3rem] font-bold leading-none"
                        style={{ color: bandColor(r.band) }}
                      >
                        {r.composite}
                      </div>
                      <div
                        className="text-[0.72rem] font-bold mt-0.5 uppercase"
                        style={{ color: bandColor(r.band) }}
                      >
                        {r.band}
                      </div>
                    </div>
                  </div>
                  <div className="bg-[rgba(255,255,255,0.06)] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${r.composite}%`,
                        background: bandColor(r.band),
                      }}
                    />
                  </div>
                </Link>
              ))}
            </div>
          )}
          {results.length > 0 && (
            <p className="text-[0.82rem] text-muted mt-3 text-center">
              Want the full report for an entity?{" "}
              <Link
                href="/purchase-research"
                className="text-accent hover:underline"
              >
                Purchase benchmark research
              </Link>{" "}
              or{" "}
              <Link href="/advisory" className="text-accent hover:underline">
                book an advisory briefing
              </Link>
              .
            </p>
          )}
        </div>
      )}
    </div>
  );
}
