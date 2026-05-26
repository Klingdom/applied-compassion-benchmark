"use client";

/**
 * ArchiveSearch — full-text search for /updates/archive.
 *
 * Independence policy:
 *   Search runs entirely client-side using the Pagefind index generated at
 *   build time (out/_pagefind/). No search queries are transmitted to any
 *   third party. No analytics on query text in this component (PR 5 scope).
 *   Only aggregate signals (query length, result count) may be wired later.
 *
 * Architecture:
 *   - Pagefind JS is loaded lazily: prefetched on idle, instantiated only
 *     when the search box receives focus. First-paint impact: ~0ms.
 *   - In-memory metadata from the archive entries prop provides instant
 *     grouping of results by date, entity, and methodology rulings.
 *   - If Pagefind fails to load (offline, JS disabled), a graceful fallback
 *     message is shown; the existing ArchiveList client-side filter remains
 *     available as a degraded experience.
 *
 * Keyboard nav: ↑↓ to move through results, Enter to navigate, Esc to close.
 *
 * See: docs/UX_FLOWS_ARCHIVE.md §3, docs/PR_PLAN_ARCHIVE.md PR 4
 */

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useId,
} from "react";
import { useRouter } from "next/navigation";
import type { ArchiveEntry } from "@/data/updates/archiveIndex";

// ── Types ─────────────────────────────────────────────────────────────────────

interface PagefindResult {
  id: string;
  score: number;
  words: number[];
  data: () => Promise<PagefindResultData>;
}

interface PagefindResultData {
  url: string;
  excerpt: string;
  title: string;
  meta: Record<string, string>;
  content: string;
  anchors: Array<{ element: string; id: string; text: string; location: number }>;
  locations: number[];
  word_count: number;
}

interface PagefindAPI {
  search: (
    query: string,
    options?: { filters?: Record<string, string> }
  ) => Promise<{ results: PagefindResult[] }>;
  preload: (query: string) => Promise<void>;
  debouncedSearch?: (
    query: string,
    options?: Record<string, unknown>,
    debounceMs?: number
  ) => Promise<{ results: PagefindResult[] } | null>;
}

interface ResultItem {
  type: "briefing" | "entity" | "methodology";
  url: string;
  date?: string;
  headline?: string;
  entityName?: string;
  entityIndex?: string;
  briefingCount?: number;
  excerpt?: string;
}

type LoadState = "idle" | "loading" | "ready" | "error";

export interface ArchiveSearchProps {
  /** Pre-computed archive entries, passed down from the server page. */
  entries: ArchiveEntry[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatShortDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n).trimEnd() + "…" : s;
}

// Derive entity mentions across all entries (used for grouping)
function buildEntityMentions(
  entries: ArchiveEntry[]
): Map<string, { slug: string; title: string; index: string; count: number }> {
  const map = new Map<
    string,
    { slug: string; title: string; index: string; count: number }
  >();
  for (const entry of entries) {
    for (const entity of entry.topEntities) {
      if (!entity.slug) continue;
      const existing = map.get(entity.slug);
      if (existing) {
        existing.count++;
      } else {
        map.set(entity.slug, {
          slug: entity.slug,
          title: entity.title,
          index: entity.index,
          count: 1,
        });
      }
    }
  }
  return map;
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ArchiveSearch({ entries }: ArchiveSearchProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLUListElement>(null);
  const pagefindRef = useRef<PagefindAPI | null>(null);
  const loadStateRef = useRef<LoadState>("idle");
  const prefetchStarted = useRef(false);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ResultItem[]>([]);
  const [panelOpen, setPanelOpen] = useState(false);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [activeIndex, setActiveIndex] = useState(-1);

  const panelId = useId();
  const liveRegionId = useId();

  // Pre-compute entity mentions map once
  const entityMentions = useRef(buildEntityMentions(entries));
  useEffect(() => {
    entityMentions.current = buildEntityMentions(entries);
  }, [entries]);

  // ── Pagefind loader ─────────────────────────────────────────────────────────

  const loadPagefind = useCallback(async () => {
    if (loadStateRef.current !== "idle") return;
    loadStateRef.current = "loading";
    setLoadState("loading");
    try {
      // Dynamic import of the statically-served Pagefind JS.
      // The URL /_pagefind/pagefind.js is served from out/_pagefind/ by nginx.
      // @ts-expect-error — Pagefind JS is not a typed module; it's a runtime artifact.
      const pf = await import(/* webpackIgnore: true */ "/_pagefind/pagefind.js");
      pagefindRef.current = pf as PagefindAPI;
      loadStateRef.current = "ready";
      setLoadState("ready");
    } catch {
      loadStateRef.current = "error";
      setLoadState("error");
    }
  }, []);

  // Idle prefetch: start loading Pagefind after the page is interactive
  // so it's ready when the user focuses the search box.
  useEffect(() => {
    if (prefetchStarted.current) return;
    prefetchStarted.current = true;

    if (typeof window === "undefined") return;

    const schedule =
      "requestIdleCallback" in window
        ? (cb: () => void) => (window as Window & { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback(cb, { timeout: 3000 })
        : (cb: () => void) => setTimeout(cb, 200);

    schedule(() => {
      loadPagefind();
    });
  }, [loadPagefind]);

  // ── Search logic ────────────────────────────────────────────────────────────

  const doSearch = useCallback(
    async (q: string) => {
      if (q.length < 2) {
        setResults([]);
        setPanelOpen(false);
        setActiveIndex(-1);
        return;
      }

      const grouped: ResultItem[] = [];

      if (pagefindRef.current && loadStateRef.current === "ready") {
        // Full-text Pagefind search
        try {
          const searchResult = await pagefindRef.current.search(q);
          const top = searchResult.results.slice(0, 10);

          const resolved = await Promise.all(
            top.map(async (r) => {
              try {
                return await r.data();
              } catch {
                return null;
              }
            })
          );

          // Group 1: Briefings by date (URLs that match /updates/YYYY-MM-DD)
          const briefingResults: ResultItem[] = [];
          const entityResults: ResultItem[] = [];
          const methodologyResults: ResultItem[] = [];

          for (const data of resolved) {
            if (!data) continue;
            const url = data.url;

            if (/^\/updates\/\d{4}-\d{2}-\d{2}$/.test(url)) {
              const date = url.replace("/updates/", "");
              const entry = entries.find((e) => e.date === date);
              briefingResults.push({
                type: "briefing",
                url,
                date,
                headline: entry
                  ? truncate(entry.headline, 70)
                  : truncate(data.title || url, 70),
                excerpt: truncate(data.excerpt || "", 120),
              });
            } else if (
              /^\/(country|company|ai-lab|robotics-lab|city|us-city|us-state)\/[^/]+\/history$/.test(url)
            ) {
              // Entity history pages — surface as entity results
              const meta = data.meta ?? {};
              entityResults.push({
                type: "entity",
                url,
                entityName: meta.entity || data.title || url,
                entityIndex: meta.band ? `Band: ${meta.band}` : "",
                excerpt: truncate(data.excerpt || "", 80),
              });
            } else if (url.startsWith("/updates/")) {
              // Other updates pages (latest briefing page)
              briefingResults.push({
                type: "briefing",
                url,
                headline: truncate(data.title || url, 70),
                excerpt: truncate(data.excerpt || "", 120),
              });
            }
          }

          // Group 3: Methodology rulings — flag briefings with methodology rulings
          // if query contains "methodology" or "ruling"
          const qLower = q.toLowerCase();
          if (qLower.includes("methodology") || qLower.includes("ruling")) {
            for (const entry of entries) {
              if (entry.hasMethodologyRuling) {
                const exists = methodologyResults.find(
                  (r) => r.url === `/updates/${entry.date}`
                );
                if (!exists) {
                  methodologyResults.push({
                    type: "methodology",
                    url: `/updates/${entry.date}`,
                    date: entry.date,
                    headline: truncate(entry.headline, 60),
                  });
                }
              }
            }
          }

          // Entity name matches from in-memory index (fast path for entity queries)
          const qLow = q.toLowerCase();
          let entityMatchCount = 0;
          for (const [, entity] of entityMentions.current) {
            if (
              entity.slug.toLowerCase().includes(qLow) ||
              entity.title.toLowerCase().includes(qLow)
            ) {
              // Avoid duplicates with Pagefind entity history results
              const alreadyAdded = entityResults.some(
                (r) => r.entityName?.toLowerCase() === entity.title.toLowerCase()
              );
              if (!alreadyAdded) {
                entityResults.push({
                  type: "entity",
                  url: `/updates/archive`,
                  entityName: entity.title,
                  entityIndex: entity.index,
                  briefingCount: entity.count,
                });
              }
              entityMatchCount++;
              if (entityMatchCount >= 5) break;
            }
          }

          grouped.push(
            ...briefingResults.slice(0, 5),
            ...entityResults.slice(0, 5),
            ...methodologyResults.slice(0, 3)
          );
        } catch {
          // Pagefind search failure — fall through to in-memory fallback
        }
      }

      // In-memory fallback (or supplement when Pagefind not yet loaded):
      // search across headline, date, and entity slugs from loaded entries.
      if (grouped.length === 0) {
        const qLow = q.toLowerCase();
        const matchedEntries = entries.filter(
          (e) =>
            e.date.includes(qLow) ||
            e.headline.toLowerCase().includes(qLow) ||
            e.topEntities.some(
              (en) =>
                en.slug.toLowerCase().includes(qLow) ||
                en.title.toLowerCase().includes(qLow)
            )
        );

        for (const entry of matchedEntries.slice(0, 5)) {
          grouped.push({
            type: "briefing",
            url: `/updates/${entry.date}`,
            date: entry.date,
            headline: truncate(entry.headline, 70),
          });
        }

        // Entity matches
        const qLow2 = q.toLowerCase();
        let emCount = 0;
        for (const [, entity] of entityMentions.current) {
          if (
            entity.slug.toLowerCase().includes(qLow2) ||
            entity.title.toLowerCase().includes(qLow2)
          ) {
            grouped.push({
              type: "entity",
              url: `/updates/archive`,
              entityName: entity.title,
              entityIndex: entity.index,
              briefingCount: entity.count,
            });
            emCount++;
            if (emCount >= 3) break;
          }
        }
      }

      setResults(grouped);
      setPanelOpen(true);
      setActiveIndex(-1);
    },
    [entries]
  );

  // Debounced search — 150ms per UX doc
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleQueryChange = useCallback(
    (value: string) => {
      setQuery(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (value.length < 2) {
        setResults([]);
        setPanelOpen(false);
        setActiveIndex(-1);
        return;
      }
      debounceRef.current = setTimeout(() => {
        doSearch(value);
      }, 150);
    },
    [doSearch]
  );

  // On focus: load Pagefind if not already loading
  const handleFocus = useCallback(() => {
    if (loadStateRef.current === "idle") {
      loadPagefind();
    }
    if (query.length >= 2) {
      setPanelOpen(true);
    }
  }, [loadPagefind, query]);

  // Clear button
  const handleClear = useCallback(() => {
    setQuery("");
    setResults([]);
    setPanelOpen(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  }, []);

  // Navigate to a result
  const navigateTo = useCallback(
    (url: string) => {
      setPanelOpen(false);
      setActiveIndex(-1);
      router.push(url);
    },
    [router]
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!panelOpen || results.length === 0) {
        if (e.key === "Escape") {
          setPanelOpen(false);
        }
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => {
          if (i <= 0) {
            // Return focus to input
            return -1;
          }
          return i - 1;
        });
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (activeIndex >= 0 && results[activeIndex]) {
          navigateTo(results[activeIndex].url);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        setPanelOpen(false);
        setActiveIndex(-1);
        inputRef.current?.focus();
      } else if (e.key === "Tab") {
        setPanelOpen(false);
        setActiveIndex(-1);
      }
    },
    [panelOpen, results, activeIndex, navigateTo]
  );

  // Close panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        panelRef.current &&
        !panelRef.current.contains(e.target as Node)
      ) {
        setPanelOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Result section label ────────────────────────────────────────────────────

  const briefings = results.filter((r) => r.type === "briefing");
  const entities = results.filter((r) => r.type === "entity");
  const methodologies = results.filter((r) => r.type === "methodology");
  const hasResults = results.length > 0;

  // Build a flat ordered list for keyboard nav (same order as rendered)
  const flatResults: ResultItem[] = [
    ...briefings,
    ...entities,
    ...methodologies,
  ];

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="relative w-full" role="search">
      {/* Search input */}
      <div className="relative flex items-center">
        {/* Search icon */}
        <span
          aria-hidden="true"
          className="absolute left-3.5 text-muted pointer-events-none"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M11 11l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </span>

        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={panelOpen}
          aria-controls={panelId}
          aria-autocomplete="list"
          aria-activedescendant={
            activeIndex >= 0 ? `search-result-${activeIndex}` : undefined
          }
          aria-label="Search briefings, entities, methodology rulings"
          placeholder="Search briefings, entities, methodology rulings…"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          className={[
            "w-full pl-10 pr-10 py-3 rounded-[12px]",
            "bg-[rgba(255,255,255,0.04)] border border-line",
            "text-text text-[0.95rem] placeholder:text-muted",
            "focus:outline-none focus:ring-2 focus:ring-[rgba(125,211,252,0.4)] focus:border-[rgba(125,211,252,0.4)]",
            "transition-colors",
          ].join(" ")}
        />

        {/* Clear button */}
        {query && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={handleClear}
            className="absolute right-3 text-muted hover:text-text transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {/* Live region for screen reader announcements */}
      <div
        id={liveRegionId}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {panelOpen && query.length >= 2
          ? hasResults
            ? `${results.length} result${results.length !== 1 ? "s" : ""} for ${query}`
            : `No results for ${query}`
          : ""}
      </div>

      {/* Results panel */}
      {panelOpen && query.length >= 2 && (
        <ul
          id={panelId}
          ref={panelRef}
          role="listbox"
          aria-label="Search results"
          className={[
            "absolute left-0 right-0 top-[calc(100%+6px)] z-50",
            "rounded-[14px] border border-line",
            "bg-[rgba(11,18,32,0.97)] backdrop-blur-[12px]",
            "shadow-[0_8px_32px_rgba(0,0,0,0.5)]",
            "max-h-[400px] overflow-y-auto",
            "divide-y divide-line",
          ].join(" ")}
        >
          {!hasResults ? (
            /* No-results state */
            <li className="px-4 py-5" role="option" aria-selected="false">
              <p className="text-text text-[0.92rem] font-semibold mb-1.5">
                No results for &ldquo;{query}&rdquo;
              </p>
              <p className="text-muted text-[0.82rem] mb-0.5">
                Suggestions:
              </p>
              <ul className="text-muted text-[0.82rem] space-y-0.5 pl-3">
                <li>· Try an entity name (e.g. &ldquo;Turkey&rdquo;, &ldquo;Anthropic&rdquo;)</li>
                <li>· Try a date (e.g. &ldquo;May 15&rdquo;, &ldquo;2026-04-22&rdquo;)</li>
                <li>· Try a sector (e.g. &ldquo;AI labs&rdquo;, &ldquo;countries&rdquo;)</li>
              </ul>
              {loadState === "error" && (
                <p className="text-muted text-[0.78rem] mt-3 italic">
                  Full-text search is unavailable. Searching briefing headlines only.
                </p>
              )}
            </li>
          ) : (
            <>
              {/* Group 1: Briefings */}
              {briefings.length > 0 && (
                <>
                  <li
                    role="presentation"
                    className="px-4 pt-3 pb-1.5"
                  >
                    <span className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-muted">
                      Briefings
                    </span>
                  </li>
                  {briefings.map((item, localIdx) => {
                    const globalIdx = flatResults.indexOf(item);
                    const isActive = globalIdx === activeIndex;
                    return (
                      <li
                        key={`briefing-${item.url}-${localIdx}`}
                        id={`search-result-${globalIdx}`}
                        role="option"
                        aria-selected={isActive}
                        onMouseEnter={() => setActiveIndex(globalIdx)}
                        onClick={() => navigateTo(item.url)}
                        className={[
                          "px-4 py-3 cursor-pointer transition-colors",
                          isActive
                            ? "bg-[rgba(26,42,70,0.9)] border-l-2 border-l-[#7dd3fc]"
                            : "hover:bg-[rgba(255,255,255,0.03)]",
                        ].join(" ")}
                      >
                        <div className="flex items-start gap-2">
                          <span className="shrink-0 text-[0.78rem] text-muted font-mono tabular-nums mt-0.5 min-w-[42px]">
                            {item.date ? formatShortDate(item.date) : ""}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-text text-[0.88rem] leading-snug">
                              {item.headline}
                            </p>
                            {item.excerpt && (
                              <p className="text-muted text-[0.78rem] mt-0.5 line-clamp-2">
                                {item.excerpt}
                              </p>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </>
              )}

              {/* Group 2: Entities */}
              {entities.length > 0 && (
                <>
                  <li
                    role="presentation"
                    className="px-4 pt-3 pb-1.5"
                  >
                    <span className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-muted">
                      Entities
                    </span>
                  </li>
                  {entities.map((item, localIdx) => {
                    const globalIdx = flatResults.indexOf(item);
                    const isActive = globalIdx === activeIndex;
                    return (
                      <li
                        key={`entity-${item.entityName}-${localIdx}`}
                        id={`search-result-${globalIdx}`}
                        role="option"
                        aria-selected={isActive}
                        onMouseEnter={() => setActiveIndex(globalIdx)}
                        onClick={() => navigateTo(item.url)}
                        className={[
                          "px-4 py-2.5 cursor-pointer transition-colors",
                          isActive
                            ? "bg-[rgba(26,42,70,0.9)] border-l-2 border-l-[#7dd3fc]"
                            : "hover:bg-[rgba(255,255,255,0.03)]",
                        ].join(" ")}
                      >
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-text text-[0.88rem] font-semibold">
                            {item.entityName}
                          </span>
                          {item.entityIndex && (
                            <span className="text-muted text-[0.78rem] capitalize">
                              {item.entityIndex.replace(/-/g, " ")}
                            </span>
                          )}
                          {item.briefingCount !== undefined && (
                            <span className="text-muted text-[0.78rem]">
                              {item.briefingCount} briefing{item.briefingCount !== 1 ? "s" : ""}
                            </span>
                          )}
                          {item.excerpt && (
                            <span className="text-muted text-[0.78rem] w-full">
                              {item.excerpt}
                            </span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </>
              )}

              {/* Group 3: Methodology rulings */}
              {methodologies.length > 0 && (
                <>
                  <li
                    role="presentation"
                    className="px-4 pt-3 pb-1.5"
                  >
                    <span className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-muted">
                      Methodology Rulings
                    </span>
                  </li>
                  {methodologies.map((item, localIdx) => {
                    const globalIdx = flatResults.indexOf(item);
                    const isActive = globalIdx === activeIndex;
                    return (
                      <li
                        key={`method-${item.url}-${localIdx}`}
                        id={`search-result-${globalIdx}`}
                        role="option"
                        aria-selected={isActive}
                        onMouseEnter={() => setActiveIndex(globalIdx)}
                        onClick={() => navigateTo(item.url)}
                        className={[
                          "px-4 py-2.5 cursor-pointer transition-colors",
                          isActive
                            ? "bg-[rgba(26,42,70,0.9)] border-l-2 border-l-[#7dd3fc]"
                            : "hover:bg-[rgba(255,255,255,0.03)]",
                        ].join(" ")}
                      >
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="w-2 h-2 rounded-full bg-[#7dd3fc] shrink-0 shadow-[0_0_4px_rgba(125,211,252,0.6)]" aria-hidden="true" />
                          <span className="text-text text-[0.88rem]">
                            {item.date ? formatShortDate(item.date) : ""}
                          </span>
                          <span className="text-muted text-[0.82rem] min-w-0 flex-1">
                            {item.headline}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </>
              )}

              {/* Pagefind load error notice (shown alongside results) */}
              {loadState === "error" && (
                <li role="presentation" className="px-4 py-2.5 border-t border-line">
                  <p className="text-muted text-[0.78rem] italic">
                    Full-text search unavailable. Showing headline matches only.
                  </p>
                </li>
              )}
            </>
          )}
        </ul>
      )}
    </div>
  );
}
