/**
 * IndexPageCharts — S3.4 + S3.6 shared section for all 7 index pages.
 *
 * Renders two chart sections inside a single server component:
 *
 *   1. Top-5 / Bottom-5 callout (S3.6) — most and least compassionate
 *      entities with BandPositionStrip for each, linked to entity detail pages.
 *
 *   2. Per-cohort mean bars (S3.4) — GroupMeanBars showing mean composite
 *      per sector / region / category, wrapped in a <details> for E1 density.
 *
 * Accepts generic ranking shape; all data is computed at build time.
 * Graceful when groupKey is absent (GroupMeanBars renders null).
 *
 * Props:
 *   rankings    — the index rankings array (typed as generic to work across
 *                 all 7 indexes)
 *   indexSlug   — e.g. "fortune-500", "countries" (for ChartFrame path)
 *   entityKind  — e.g. "company", "country" (for slug routing)
 *   groupKey    — the field to group by (e.g. "sector", "region", "category")
 *   groupLabel  — human label for the group (e.g. "Sector", "Region")
 *   indexMean   — meta.meanScore for the reference line
 *   medianScore — meta.medianScore for BandPositionStrip reference ticks
 *   indexName   — e.g. "Fortune 500" for aria-label
 */

import Link from "next/link";
import BandPositionStrip from "@/components/charts/BandPositionStrip";
import GroupMeanBars from "@/components/charts/GroupMeanBars";
import ChartFrame from "@/components/charts/ChartFrame";
import Container from "@/components/ui/Container";
import SectionHead from "@/components/ui/SectionHead";
import { INDEX_REGISTRY } from "@/data/indexRegistry";

// ─── Slug helper (mirrors export-public-data.mjs) ────────────────────────────

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ─── Entity route helper ──────────────────────────────────────────────────────

const ENTITY_ROUTE_PREFIX: Record<string, string> = Object.fromEntries(
  INDEX_REGISTRY.map((entry) => [entry.indexSlug, entry.routePrefix]),
);

function entityHref(indexSlug: string, name: string): string {
  const prefix = ENTITY_ROUTE_PREFIX[indexSlug] ?? "entity";
  return `/${prefix}/${slugify(name)}`;
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface RankingEntry {
  name: string;
  composite: number;
  band?: string;
  [key: string]: unknown;
}

interface IndexPageChartsProps {
  rankings: RankingEntry[];
  indexSlug: string;
  groupKey?: string;
  groupLabel?: string;
  indexMean?: number;
  medianScore?: number;
  indexName?: string;
  indexPagePath?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function IndexPageCharts({
  rankings,
  indexSlug,
  groupKey,
  groupLabel = "Group",
  indexMean,
  medianScore,
  indexName = "Index",
  indexPagePath,
}: IndexPageChartsProps) {
  if (!rankings || rankings.length === 0) return null;

  // Top 5 and bottom 5
  const top5 = rankings.slice(0, 5);
  const bottom5 = [...rankings].slice(-5).reverse(); // worst first

  const pagePath = indexPagePath ?? `/${indexSlug}`;

  return (
    <>
      {/* S3.6 — Top-5 / Bottom-5 callout */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="Most and least compassionate"
            description={`Top 5 and bottom 5 entities in the ${indexName} by composite score, with position relative to the field median.`}
          />
          <ChartFrame
            id={`${indexSlug}-top-bottom`}
            path={pagePath}
            title={`Most and least compassionate — ${indexName}`}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top 5 */}
              <div>
                <h3 className="text-[0.86rem] font-bold text-[#86efac] uppercase tracking-widest mb-3">
                  Most compassionate
                </h3>
                <div className="space-y-4">
                  {top5.map((entry) => {
                    const href = entityHref(indexSlug, entry.name);
                    return (
                      <div key={entry.name} className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <Link
                            href={href}
                            className="text-[0.92rem] font-semibold text-text hover:text-accent transition-colors truncate block"
                          >
                            {entry.name}
                          </Link>
                          <div className="mt-1">
                            <BandPositionStrip
                              score={entry.composite}
                              entityName={entry.name}
                              compact
                              medianScore={medianScore}
                            />
                          </div>
                        </div>
                        <span
                          className="text-[1rem] font-bold shrink-0 tabular-nums"
                          style={{ color: "#86efac" }}
                        >
                          {entry.composite.toFixed(1)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom 5 */}
              <div>
                <h3 className="text-[0.86rem] font-bold text-[#f87171] uppercase tracking-widest mb-3">
                  Least compassionate
                </h3>
                <div className="space-y-4">
                  {bottom5.map((entry) => {
                    const href = entityHref(indexSlug, entry.name);
                    return (
                      <div key={entry.name} className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <Link
                            href={href}
                            className="text-[0.92rem] font-semibold text-text hover:text-accent transition-colors truncate block"
                          >
                            {entry.name}
                          </Link>
                          <div className="mt-1">
                            <BandPositionStrip
                              score={entry.composite}
                              entityName={entry.name}
                              compact
                              medianScore={medianScore}
                            />
                          </div>
                        </div>
                        <span
                          className="text-[1rem] font-bold shrink-0 tabular-nums"
                          style={{ color: "#f87171" }}
                        >
                          {entry.composite.toFixed(1)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </ChartFrame>
        </Container>
      </section>

      {/* S3.4 — Sector / Region breakdown, inside <details> for E1 density */}
      {groupKey && (
        <section className="py-[20px]">
          <Container>
            <details className="group rounded-[14px] border border-line bg-[rgba(255,255,255,0.02)] overflow-hidden">
              <summary
                className={[
                  "flex items-center gap-2 px-5 py-3.5",
                  "cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden",
                  "text-[0.86rem] font-semibold text-muted hover:text-text transition-colors",
                ].join(" ")}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 13 13"
                  fill="none"
                  aria-hidden="true"
                  className="transition-transform group-open:rotate-90 shrink-0"
                >
                  <path
                    d="M4.5 2.5l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                By {groupLabel}: mean composite breakdown
              </summary>
              <div className="border-t border-line px-5 py-4">
                <ChartFrame
                  id={`${indexSlug}-group-means`}
                  title={`Mean composite by ${groupLabel} — ${indexName}`}
                  dek={`Ranked highest to lowest. Reference line at index mean (${indexMean?.toFixed(1) ?? "—"}).`}
                  path={pagePath}
                >
                  <GroupMeanBars
                    rankings={rankings}
                    groupKey={groupKey}
                    groupLabel={groupLabel}
                    indexMean={indexMean}
                    indexName={indexName}
                  />
                </ChartFrame>
              </div>
            </details>
          </Container>
        </section>
      )}
    </>
  );
}
