import Link from "next/link";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import Panel from "@/components/ui/Panel";
import Pill from "@/components/ui/Pill";
import SectionHead from "@/components/ui/SectionHead";
import Callout from "@/components/ui/Callout";
import Band from "@/components/ui/Band";
import type { BandLevel } from "@/components/ui/Band";
import NewsletterSignup from "@/components/ui/NewsletterSignup";
import TrackedEntityLink from "@/components/updates/TrackedEntityLink";
import TopSignals from "@/components/updates/TopSignals";
import { entityHref } from "@/lib/entityHref";
import { getAllEntities, getEntityBySlug } from "@/data/entities";
import type { EntityKind } from "@/data/entities";
import { DIMENSIONS } from "@/data/dimensions";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface DailyBriefingProps {
  updates: any;
  showNewsletter?: boolean;
  /** Date navigation tabs: array of { date, label, isCurrent } */
  dateNav?: { date: string; label: string; isCurrent: boolean }[];
}

function normalizeBand(band: string): BandLevel | null {
  const normalized = band?.toLowerCase() as BandLevel;
  const valid: BandLevel[] = ["critical", "developing", "functional", "established", "exemplary"];
  return valid.includes(normalized) ? normalized : null;
}

function bandColor(band: string): string {
  const map: Record<string, string> = {
    critical: "#f87171",
    developing: "#fb923c",
    functional: "#fcd34d",
    established: "#86efac",
    exemplary: "#7dd3fc",
  };
  return map[band?.toLowerCase()] ?? "#94a3b8";
}

function deltaColor(delta: number): string {
  if (delta <= -10) return "#f87171";
  if (delta < 0) return "#fb923c";
  if (delta >= 10) return "#86efac";
  if (delta > 0) return "#34d399";
  return "#94a3b8";
}

function formatIndex(index: string): string {
  return index?.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
}

/** Format a YYYY-MM-DD string to "Apr 16" */
function formatDateLabel(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Extract hostname from a URL for display (e.g. "bankinfosecurity.com") */
function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/**
 * Resolve a bare entity slug (no index context) to an href by searching
 * across all entity kinds. Used for sectorAlerts.affected_entities.
 * Returns null if the slug is not found in any registered index.
 */
const SLUG_LOOKUP_KINDS: EntityKind[] = [
  "ai-lab",
  "company",
  "robotics-lab",
  "country",
  "city",
  "us-city",
  "us-state",
];

const SLUG_LOOKUP_PREFIXES: Record<EntityKind, string> = {
  "ai-lab": "ai-lab",
  company: "company",
  "robotics-lab": "robotics-lab",
  country: "country",
  city: "city",
  "us-city": "us-city",
  "us-state": "us-state",
};

/** Maps EntityKind back to the index slug used in the updates feed. */
const KIND_TO_INDEX_SLUG: Record<EntityKind, string> = {
  "ai-lab": "ai-labs",
  company: "fortune-500",
  "robotics-lab": "robotics-labs",
  country: "countries",
  city: "global-cities",
  "us-city": "us-cities",
  "us-state": "us-states",
};

function resolveSlugHref(
  entitySlug: string,
): { href: string; index: string } | null {
  for (const kind of SLUG_LOOKUP_KINDS) {
    if (getEntityBySlug(kind, entitySlug)) {
      return {
        href: `/${SLUG_LOOKUP_PREFIXES[kind]}/${entitySlug}`,
        index: KIND_TO_INDEX_SLUG[kind],
      };
    }
  }
  return null;
}

export default function DailyBriefing({
  updates,
  showNewsletter = true,
  dateNav,
}: DailyBriefingProps) {
  // Defensive defaults: any missing array in the upstream JSON must not
  // crash prerender. Schema drift from the overnight digest has caused
  // build failures historically (e.g. 2026-04-21 shipped without
  // `emergingRisks`). Normalising here keeps render code unchanged.
  const {
    pipeline,
    scoreChanges = [],
    confirmations = [],
    sectorTrends = [],
    emergingRisks = [],
    insights = [],
    highlights = [],
    recentAssessments = [],
    sectorAlerts = [],
    // Editorial blocks introduced by the overnight-digest in late-April/May 2026.
    // Defaulted to [] / undefined here so older briefings (which don't ship
    // these fields) still render unchanged.
    floorEntities = [],
    signals = [],
    holds = [],
    boundaryWatchEntities = [],
    newConductCategories = [],
    carryForwardDimensionalCredits = [],
    mathHygiene,
  } = updates;

  // Today's lead: the most consequential finding of the day, surfaced
  // editorially in the hero. Priority: first band change > largest |delta|≥10.
  // On quiet days (no band change, no large delta) the lead callout is
  // suppressed entirely — silence is cleaner than an empty alert pill.
  const leadChange = (() => {
    const bandLead = (scoreChanges as any[]).find((c: any) => c.bandChange);
    if (bandLead) return bandLead;
    const deltaLead = (scoreChanges as any[])
      .filter((c: any) => typeof c.delta === "number" && Math.abs(c.delta) >= 10)
      .sort(
        (a: any, b: any) => Math.abs(b.delta ?? 0) - Math.abs(a.delta ?? 0),
      )[0];
    return deltaLead ?? null;
  })();

  // Normalise sectorTrends: the overnight digest has shipped two shapes —
  // `{sector, points: string[]}` (canonical, 2026-04-20) and
  // `{sector, trend: string}` (2026-04-21). Coerce the single-trend form
  // into the canonical array shape so the render code stays uniform and
  // future schema drift can't crash the prerender.
  // Hide-if-empty: filter out trend objects with zero points so a section
  // with all-empty trends doesn't render as blank panels (a digest-output
  // edge case observed on 2026-04-30).
  const normalizedSectorTrends = (sectorTrends as any[])
    .map((t) => ({
      sector: t.sector,
      points: Array.isArray(t.points)
        ? t.points
        : t.trend
          ? [t.trend]
          : [],
    }))
    .filter((t) => t.points.length > 0);

  // Long-form date label (e.g., "Wednesday, April 29, 2026") for the hero.
  const heroDate = (() => {
    const [year, month, day] = updates.date.split("-").map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  })();

  // Issue numbering relative to the publication's first issue (Apr 15 2026).
  // Reads as standard periodical notation ("No. 16") rather than the previous
  // day-of-month / month build-number format.
  const issueNo = (() => {
    const [year, month, day] = updates.date.split("-").map(Number);
    const baseline = Date.UTC(2026, 3, 15); // 2026-04-15 = Issue No. 1
    const current = Date.UTC(year, month - 1, day);
    const days = Math.max(0, Math.round((current - baseline) / 86_400_000));
    return days + 1;
  })();

  return (
    <>
      {/* Hero — Compassion Benchmark Daily Briefing */}
      <section className="pt-[72px] pb-8 relative overflow-hidden">
        {/* Subtle ambient backdrop — matches the rest of the dark theme but
            gives the briefing destination a distinct top-of-page presence. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at top, rgba(125,211,252,0.08) 0%, rgba(125,211,252,0) 60%)",
          }}
        />
        <Container className="relative">
          {/* Date navigation tabs */}
          {dateNav && dateNav.length > 0 && (
            <nav
              aria-label="Browse previous briefings"
              className="flex flex-wrap gap-2 mb-8"
            >
              {dateNav.map(({ date, label, isCurrent }) =>
                isCurrent ? (
                  <span
                    key={date}
                    aria-current="page"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[10px] border border-[rgba(125,211,252,0.4)] bg-[rgba(125,211,252,0.12)] text-[#7dd3fc] text-[0.88rem] font-semibold"
                  >
                    {label}
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-[#7dd3fc] shrink-0"
                      aria-hidden="true"
                    />
                  </span>
                ) : (
                  <Link
                    key={date}
                    href={`/updates/${date}`}
                    className="inline-flex items-center px-3.5 py-1.5 rounded-[10px] border border-line bg-[rgba(255,255,255,0.04)] text-muted text-[0.88rem] font-medium hover:border-[rgba(125,211,252,0.3)] hover:text-text hover:bg-[rgba(125,211,252,0.06)] transition-colors"
                  >
                    {label}
                  </Link>
                )
              )}
            </nav>
          )}

          {/* Masthead row: institution name + dateline + issue number */}
          <div className="flex items-baseline gap-3 mb-5 flex-wrap">
            <span className="text-[0.78rem] font-bold uppercase tracking-[0.18em] text-[#7dd3fc]">
              Compassion Benchmark
            </span>
            <span className="text-muted text-[0.78rem]">·</span>
            <span className="text-text text-[0.88rem] font-medium">
              {heroDate}
            </span>
            <span className="text-muted text-[0.78rem]">·</span>
            <span className="text-muted text-[0.78rem] font-semibold uppercase tracking-wider tabular-nums">
              No. {issueNo}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_0.75fr] gap-8 items-start">
            <div>
              <h1 className="text-[clamp(2.4rem,5.5vw,4.4rem)] leading-[1.02] tracking-[-0.035em] mb-4 font-bold">
                Daily Briefing
              </h1>
              <p className="text-text text-[1.15rem] sm:text-[1.22rem] leading-snug max-w-[820px] mb-7 font-medium">
                Daily findings on how institutions recognize, respond to, and reduce suffering — scored across 1,155 entities, grounded in primary-source evidence.
              </p>

              {/* Primary CTA cluster */}
              <div className="flex gap-3 flex-wrap mb-6">
                <Button href="#top-signals" variant="primary">Read today&apos;s brief</Button>
                <Button href="#newsletter">Subscribe to weekly briefing</Button>
                <Button href="/purchase-research">View research reports</Button>
              </div>

              {/* Today's lead — editorial dek surfacing the most consequential
                  finding of the day. Suppressed entirely on quiet days. */}
              {leadChange && (
                <Link
                  href={`#${leadChange.slug}`}
                  className="inline-flex items-center gap-3 px-4 py-2.5 rounded-[12px] border border-[rgba(125,211,252,0.30)] bg-[rgba(125,211,252,0.06)] hover:border-[rgba(125,211,252,0.55)] hover:bg-[rgba(125,211,252,0.10)] transition-colors group"
                >
                  <span className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-[#7dd3fc] shrink-0">
                    Today&apos;s lead
                  </span>
                  <span className="text-[0.92rem] font-medium text-text leading-snug">
                    {leadChange.bandChange && leadChange.publishedBand && leadChange.assessedBand
                      ? `${leadChange.entity} moves from ${leadChange.publishedBand} to ${leadChange.assessedBand} band`
                      : `${leadChange.entity} score revised ${leadChange.delta > 0 ? "up" : "down"} ${Math.abs(leadChange.delta)} points`}
                    <span className="text-[#7dd3fc] ml-1 group-hover:translate-x-0.5 inline-block transition-transform">→</span>
                  </span>
                </Link>
              )}
            </div>

            {/* Right column: scope statement + about-the-briefing */}
            <div className="flex flex-col gap-4">
              {/* Coverage statement — replaces the previous pipeline stat strip
                  with a single prose line of scope. */}
              <div className="rounded-[18px] border border-line bg-[rgba(255,255,255,0.025)] p-5">
                <div className="text-[0.72rem] font-bold uppercase tracking-widest text-muted mb-3">
                  Today&apos;s coverage
                </div>
                <p className="text-text text-[0.95rem] leading-relaxed">
                  This briefing reviews{" "}
                  <span className="font-bold tabular-nums">
                    {pipeline.entitiesScanned.toLocaleString()}
                  </span>{" "}
                  indexed entities, with{" "}
                  <span className="font-bold tabular-nums">
                    {pipeline.entitiesAssessed}
                  </span>{" "}
                  receiving full assessment
                  {pipeline.proposalsGenerated > 0 && (
                    <>
                      {" "}— including{" "}
                      <span className="font-bold tabular-nums">
                        {pipeline.proposalsGenerated}
                      </span>{" "}
                      score{" "}
                      {pipeline.proposalsGenerated === 1 ? "change" : "changes"}
                    </>
                  )}
                  .
                </p>
              </div>

              {/* About the briefing — slimmer */}
              <Panel>
                <h3 className="text-[1rem] font-bold mb-2">About the Daily Briefing</h3>
                <p className="text-muted mb-3 text-[0.88rem] leading-relaxed">
                  Compassion Benchmark monitors 1,155 indexed entities for new evidence. Entities with material developments receive full 40-subdimension assessment. Every score on this page reflects a completed editorial determination grounded in primary-source evidence.
                </p>
                <div className="flex gap-2 flex-wrap">
                  <Link href="/methodology" className="text-[0.85rem] font-semibold text-[#7dd3fc] hover:text-text transition-colors">Methodology →</Link>
                  <span className="text-muted text-[0.85rem]">·</span>
                  <Link href="/indexes" className="text-[0.85rem] font-semibold text-[#7dd3fc] hover:text-text transition-colors">All indexes →</Link>
                </div>
              </Panel>
            </div>
          </div>
        </Container>
      </section>

      {/* Today's Top Signals — the briefing's lead intelligence */}
      <TopSignals updates={updates} />

      {/* New conduct categories — methodology innovations defined in this cycle.
          Surfaces first-application events so the publication's evolving
          analytical framework is visible as a citable record rather than
          buried in prose. */}
      {newConductCategories.length > 0 && (
        <NewConductCategoriesPanel items={newConductCategories as any[]} />
      )}

      {/* Floor designations — methodology disclosure */}
      <FloorDesignationsPanel />

      {/* Score Changes — Centerpiece */}
      {scoreChanges.length > 0 && (
        <section id="score-movements" className="py-[30px] scroll-mt-24">
          <Container>
            <div className="flex items-end justify-between gap-4 mb-6 flex-wrap">
              <SectionHead
                title="Score movements"
                description="Entities where new evidence produced a documented change in published score. Each card is a complete dossier entry."
              />
            </div>
            <div className="grid grid-cols-1 gap-5">
              {(scoreChanges as any[]).map((change: any) => {
                const isDowngrade = change.delta < 0;
                const cardBorderColor = isDowngrade
                  ? "rgba(248,113,113,0.35)"
                  : "rgba(134,239,172,0.35)";
                const cardBg = isDowngrade
                  ? "linear-gradient(160deg, rgba(248,113,113,0.07) 0%, rgba(251,146,60,0.03) 100%)"
                  : "linear-gradient(160deg, rgba(134,239,172,0.07) 0%, rgba(125,211,252,0.03) 100%)";
                const pubBand = normalizeBand(change.publishedBand);
                const assBand = normalizeBand(change.assessedBand);
                const href = entityHref(change.index, change.slug);

                return (
                  <div
                    key={change.slug}
                    id={change.slug}
                    className="rounded-[20px] p-6 border"
                    style={{ borderColor: cardBorderColor, background: cardBg }}
                  >
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
                      <div className="flex items-start gap-3 flex-wrap">
                        <div>
                          <h3 className="text-[1.4rem] font-bold leading-tight">
                            {href ? (
                              <TrackedEntityLink
                                href={href}
                                slug={change.slug}
                                index={change.index}
                                source="scoreChanges"
                                className="hover:text-accent transition-colors"
                              >
                                {change.entity}
                              </TrackedEntityLink>
                            ) : (
                              change.entity
                            )}
                          </h3>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <Pill>{formatIndex(change.index)}</Pill>
                            <Link
                              href="/methodology"
                              className="text-muted text-[0.82rem] hover:text-accent transition-colors"
                            >
                              {change.confidence} confidence
                            </Link>
                            {change.date && (
                              <time dateTime={change.date} className="text-muted text-[0.82rem]">
                                Assessed {formatDateLabel(change.date)}
                              </time>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Score display */}
                      <div className="text-right shrink-0">
                        <div className="flex items-center gap-2 justify-end mb-1">
                          {typeof change.publishedScore === "number" ? (
                            <>
                              <span className="text-muted text-[1.1rem] font-semibold">{change.publishedScore}</span>
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-muted" aria-hidden="true">
                                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </>
                          ) : (
                            <span className="text-[0.7rem] uppercase tracking-[0.1em] text-[#7dd3fc] font-bold px-1.5 py-0.5 rounded border border-[rgba(125,211,252,0.32)] bg-[rgba(125,211,252,0.08)]">
                              First baseline
                            </span>
                          )}
                          <span
                            className="text-[1.5rem] font-bold leading-none"
                            style={{ color: deltaColor(change.delta ?? 0) }}
                          >
                            {change.assessedScore}
                          </span>
                        </div>
                        <div
                          className="text-[0.9rem] font-bold mb-2"
                          style={{ color: deltaColor(change.delta ?? 0) }}
                        >
                          {typeof change.delta === "number"
                            ? `${change.delta > 0 ? "+" : ""}${change.delta} pts`
                            : "New entry"}
                        </div>
                        {change.bandChange && pubBand && assBand && (
                          <div className="flex items-center gap-1.5 justify-end flex-wrap">
                            <Band level={pubBand} />
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-muted" aria-hidden="true">
                              <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <Band level={assBand} />
                          </div>
                        )}
                        {!change.bandChange && pubBand && (
                          <div className="flex justify-end">
                            <Band level={pubBand} />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Headline */}
                    <p className="text-[0.97rem] text-text mb-4 font-medium leading-relaxed border-l-2 pl-3" style={{ borderColor: deltaColor(change.delta) }}>
                      {change.headline}
                    </p>

                    {/* Evidence trail — supports three input shapes:
                        1. Rich evidence objects: change.evidence = [{source, url, finding, ...}, ...]
                        2. Legacy strings: change.evidence = ["text", ...]
                        3. keyEvidence fallback: change.keyEvidence = ["text", ...]
                           (May 12 cycle introduced keyEvidence; assessor agent had
                            stopped populating change.evidence on score-change cards,
                            causing every card to render with no evidence visible to
                            the reader. The fallback restores evidence rendering for
                            those cards.) */}
                    {(() => {
                      const richEvidence: unknown[] =
                        Array.isArray(change.evidence) && change.evidence.length > 0
                          ? (change.evidence as unknown[])
                          : [];
                      const keyEvidence: string[] =
                        richEvidence.length === 0 &&
                        Array.isArray(change.keyEvidence) &&
                        change.keyEvidence.length > 0
                          ? (change.keyEvidence as string[])
                          : [];
                      if (richEvidence.length === 0 && keyEvidence.length === 0) {
                        return null;
                      }
                      return (
                        <div>
                          <div className="text-[0.78rem] font-bold uppercase tracking-widest text-muted mb-3">
                            Evidence record
                          </div>
                          <ol className="space-y-2.5">
                            {richEvidence.length > 0
                              ? richEvidence.map((evRaw: unknown, i: number) => {
                                  // Normalize: legacy string[] | rich object { source, url, finding, ... }
                                  const isObject =
                                    evRaw !== null &&
                                    typeof evRaw === "object" &&
                                    !Array.isArray(evRaw);
                                  const ev = isObject
                                    ? (evRaw as {
                                        source?: string;
                                        url?: string;
                                        finding?: string;
                                        dimensionsAffected?: string[];
                                        inWindow?: boolean;
                                      })
                                    : null;
                                  const findingText =
                                    ev?.finding ?? (typeof evRaw === "string" ? evRaw : "");
                                  return (
                                    <li key={i} className="flex gap-3">
                                      <span
                                        aria-hidden="true"
                                        className="text-[0.78rem] font-bold shrink-0 mt-[2px] w-5 h-5 rounded-full flex items-center justify-center border"
                                        style={{
                                          color: deltaColor(change.delta),
                                          borderColor: `${deltaColor(change.delta)}44`,
                                          background: `${deltaColor(change.delta)}11`,
                                        }}
                                      >
                                        {i + 1}
                                      </span>
                                      <div
                                        className="flex-1 text-muted text-[0.9rem] leading-relaxed pl-3 border-l"
                                        style={{ borderColor: `${deltaColor(change.delta)}28` }}
                                      >
                                        <div>{findingText}</div>
                                        {ev?.source ? (
                                          <div className="text-[0.78rem] text-muted-subtle mt-1">
                                            {ev.url ? (
                                              <a
                                                href={ev.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="hover:text-accent transition-colors underline decoration-dotted underline-offset-2"
                                              >
                                                {ev.source}
                                              </a>
                                            ) : (
                                              ev.source
                                            )}
                                          </div>
                                        ) : null}
                                      </div>
                                    </li>
                                  );
                                })
                              : keyEvidence.map((finding: string, i: number) => (
                                  <li key={i} className="flex gap-3">
                                    <span
                                      aria-hidden="true"
                                      className="text-[0.78rem] font-bold shrink-0 mt-[2px] w-5 h-5 rounded-full flex items-center justify-center border"
                                      style={{
                                        color: deltaColor(change.delta),
                                        borderColor: `${deltaColor(change.delta)}44`,
                                        background: `${deltaColor(change.delta)}11`,
                                      }}
                                    >
                                      {i + 1}
                                    </span>
                                    <div
                                      className="flex-1 text-muted text-[0.9rem] leading-relaxed pl-3 border-l"
                                      style={{ borderColor: `${deltaColor(change.delta)}28` }}
                                    >
                                      {finding}
                                    </div>
                                  </li>
                                ))}
                          </ol>
                        </div>
                      );
                    })()}

                    {/* Boundary-watch resolution — surfaced when this score
                        change resolves a previously-flagged boundary watch.
                        Narrates how the watch closed (band crossing realized
                        / watch withdrawn / watch carried forward). */}
                    {typeof change.boundaryWatchResolution === "string" &&
                      change.boundaryWatchResolution.trim() && (
                        <div className="mt-4 rounded-[12px] border border-[rgba(167,139,250,0.32)] bg-[rgba(167,139,250,0.05)] p-3.5">
                          <div className="text-[0.72rem] font-bold uppercase tracking-widest text-[#a78bfa] mb-1">
                            Boundary watch resolution
                          </div>
                          <p className="text-[0.88rem] text-muted leading-relaxed">
                            {change.boundaryWatchResolution}
                          </p>
                        </div>
                      )}

                    {/* Open watches — next-assessment triggers for this
                        entity. Highest-value forward-looking content on a
                        score-change card. */}
                    {Array.isArray(change.openWatches) &&
                      change.openWatches.length > 0 && (
                        <div className="mt-4">
                          <div className="text-[0.72rem] font-bold uppercase tracking-widest text-muted mb-2">
                            Next assessment triggers
                          </div>
                          <ul className="flex flex-wrap gap-1.5">
                            {(change.openWatches as string[]).map(
                              (w: string, i: number) => (
                                <li
                                  key={i}
                                  className="text-[0.82rem] text-muted px-2.5 py-1 rounded-full border border-line bg-[rgba(255,255,255,0.025)]"
                                >
                                  {w}
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      )}

                    {/* Entity detail link — shown when a detail page exists */}
                    {href && (
                      <div className="mt-4 pt-3.5 border-t border-[rgba(255,255,255,0.06)] flex justify-end">
                        <TrackedEntityLink
                          href={href}
                          slug={change.slug}
                          index={change.index}
                          source="scoreChanges"
                          className="inline-flex items-center gap-1.5 text-[0.82rem] font-semibold text-muted hover:text-accent transition-colors group"
                        >
                          View entity profile
                          <svg
                            width="13"
                            height="13"
                            viewBox="0 0 13 13"
                            fill="none"
                            aria-hidden="true"
                            className="group-hover:translate-x-0.5 transition-transform"
                          >
                            <path d="M2.5 6.5h8M7 3l3.5 3.5L7 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </TrackedEntityLink>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Inline newsletter nudge — captures users at peak engagement */}
            <div className="mt-6 rounded-[16px] border border-[rgba(125,211,252,0.15)] bg-[rgba(125,211,252,0.04)] p-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <p className="flex-1 min-w-0 text-[0.94rem] text-muted">
                  Get these findings every week.{" "}
                  <span className="text-text font-medium">Free.</span>
                </p>
                <NewsletterSignup variant="inline-compact" source="updates-score-movements" />
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* Floor conduct documentations — cycle-specific narrative for entities
          at composite=0 where this cycle adds new conduct evidence. Distinct
          from the floor-designation registry: this is *journalism*, not a
          methodology disclosure. */}
      {floorEntities.length > 0 && (
        <FloorConductSection items={floorEntities as any[]} date={updates.date} />
      )}

      {/* Boundary watches — entities near band thresholds. Surfaces both
          resolved watches (this cycle produced a band crossing) and active
          watches (carried forward for future cycles). */}
      {boundaryWatchEntities.length > 0 && (
        <BoundaryWatchPanel items={boundaryWatchEntities as any[]} />
      )}

      {/* Source Intelligence — sectorAlerts */}
      {sectorAlerts && (sectorAlerts as any[]).length > 0 && (
        <section className="py-[30px]">
          <Container>
            <SectionHead
              title="Source record"
              description="Primary sources reviewed for this briefing — regulatory filings, court records, investigative reports, and international legal instruments."
            />
            <div className="grid grid-cols-1 gap-4">
              {(sectorAlerts as any[]).map((alert: any, i: number) => (
                <div
                  key={i}
                  className="rounded-[20px] border-l-4 border border-[rgba(125,211,252,0.25)] bg-[rgba(125,211,252,0.05)] p-5"
                  style={{ borderLeftColor: "#7dd3fc" }}
                >
                  <h3 className="text-[1.05rem] font-bold mb-2 text-[#7dd3fc]">
                    {alert.sector}
                  </h3>
                  <p className="text-[0.92rem] text-muted leading-relaxed mb-3">
                    {alert.alert}
                  </p>
                  {(alert.affected_entities as string[])?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {(alert.affected_entities as string[]).map((slug: string) => {
                        const resolved = resolveSlugHref(slug);
                        return resolved ? (
                          <TrackedEntityLink
                            key={slug}
                            href={resolved.href}
                            slug={slug}
                            index={resolved.index}
                            source="sectorAlert"
                            className="text-[0.78rem] font-semibold px-2 py-0.5 rounded-full border border-[rgba(125,211,252,0.2)] bg-[rgba(125,211,252,0.06)] text-[#7dd3fc] hover:border-[rgba(125,211,252,0.5)] hover:bg-[rgba(125,211,252,0.14)] transition-colors cursor-pointer"
                          >
                            {slug}
                          </TrackedEntityLink>
                        ) : (
                          <span
                            key={slug}
                            className="text-[0.78rem] font-semibold px-2 py-0.5 rounded-full border border-[rgba(125,211,252,0.2)] bg-[rgba(125,211,252,0.06)] text-[#7dd3fc]"
                          >
                            {slug}
                          </span>
                        );
                      })}
                    </div>
                  )}
                  {(alert.sources as string[])?.length > 0 && (
                    <ol className="space-y-1">
                      {(alert.sources as string[]).map((src: string, j: number) => (
                        <li key={j} className="flex items-baseline gap-2">
                          <span className="text-[0.75rem] font-bold text-[#7dd3fc] shrink-0">
                            {j + 1}.
                          </span>
                          <a
                            href={src}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[0.82rem] text-[#7dd3fc] hover:text-text transition-colors underline underline-offset-2 decoration-[rgba(125,211,252,0.35)] hover:decoration-[rgba(125,211,252,0.7)] break-all"
                          >
                            {extractDomain(src)}
                          </a>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Purchase CTA — positioned after Score Movements at peak intent */}
      <section className="py-[30px]">
        <Container>
          <Callout>
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] mb-2">
              Get the full benchmark report
            </h2>
            <p className="text-muted max-w-[760px] mb-[18px]">
              Daily briefings surface headline findings. Full benchmark reports include complete methodology documentation, all 40 subdimension scores, full evidence trails, certified assessments, and sector-level analysis packages.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Button href="/purchase-research" variant="primary">Purchase Research</Button>
              <Button href="/certified-assessments">Request Certified Assessment</Button>
              <Button href="/advisory">Book Advisory</Button>
            </div>
          </Callout>
        </Container>
      </section>

      {/* Scores Confirmed */}
      {confirmations.length > 0 && (
        <section className="py-[30px]">
          <Container>
            <SectionHead
              title="Confirmed positions"
              description="Entities reassessed for this briefing where published scores remain supported by current evidence. Confirmations are documented evidence, not silence."
            />
            <div className="overflow-auto border border-line rounded-[20px] bg-[rgba(255,255,255,0.02)]">
              <table className="w-full border-collapse">
                <caption className="sr-only">
                  Entities reassessed in this briefing where the published score remains supported by current evidence. Boundary-watch, first-baseline, and carry-forward chips on the entity column flag editorially significant rows.
                </caption>
                <thead>
                  <tr className="border-b border-line">
                    <th scope="col" className="text-muted text-[0.82rem] font-semibold uppercase tracking-wider text-left py-3.5 px-5">Entity</th>
                    <th scope="col" className="text-muted text-[0.82rem] font-semibold uppercase tracking-wider text-left py-3.5 px-4">Index</th>
                    <th scope="col" className="text-muted text-[0.82rem] font-semibold uppercase tracking-wider text-left py-3.5 px-4">Band</th>
                    <th scope="col" className="text-muted text-[0.82rem] font-semibold uppercase tracking-wider text-right py-3.5 px-4">Published</th>
                    <th scope="col" className="text-muted text-[0.82rem] font-semibold uppercase tracking-wider text-right py-3.5 px-4">Assessed</th>
                    <th scope="col" className="text-muted text-[0.82rem] font-semibold uppercase tracking-wider text-right py-3.5 px-4">Delta</th>
                    <th scope="col" className="text-muted text-[0.82rem] font-semibold uppercase tracking-wider text-left py-3.5 px-4">Date</th>
                    <th scope="col" className="text-muted text-[0.82rem] font-semibold uppercase tracking-wider text-left py-3.5 px-5">Finding</th>
                  </tr>
                </thead>
                <tbody>
                  {(confirmations as any[]).map((c: any) => {
                    const band = normalizeBand(c.publishedBand);
                    const confirmHref = entityHref(c.index, c.slug);
                    return (
                      <tr key={c.slug} className="border-b border-line last:border-b-0 hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                        <td className="py-4 px-5 font-semibold text-[0.95rem]">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {confirmHref ? (
                              <TrackedEntityLink
                                href={confirmHref}
                                slug={c.slug}
                                index={c.index}
                                source="confirmation"
                                className="hover:text-accent transition-colors"
                              >
                                {c.entity}
                              </TrackedEntityLink>
                            ) : (
                              c.entity
                            )}
                            {/* Confirmation flag chips — distinguish editorially
                                significant confirmations from routine no-change
                                rows. Boundary watch + first baseline + carry-
                                forward credit are the events that typically
                                precede band crossings, so they read as a
                                monitoring register, not a dead-data list. */}
                            {c.boundaryWatch && (
                              <span
                                className="text-[0.66rem] font-bold uppercase tracking-wider text-[#fcd34d] px-1.5 py-0.5 rounded border border-[rgba(252,211,77,0.4)] bg-[rgba(252,211,77,0.08)]"
                                title="Boundary watch active — within one point of band threshold"
                              >
                                Watch
                              </span>
                            )}
                            {c.firstAgentBaseline && (
                              <span
                                className="text-[0.66rem] font-bold uppercase tracking-wider text-[#7dd3fc] px-1.5 py-0.5 rounded border border-[rgba(125,211,252,0.4)] bg-[rgba(125,211,252,0.08)]"
                                title="First agent baseline — entity assessed by the daily pipeline for the first time"
                              >
                                First baseline
                              </span>
                            )}
                            {c.carryForwardActive && (
                              <span
                                className="text-[0.66rem] font-bold uppercase tracking-wider text-[#a78bfa] px-1.5 py-0.5 rounded border border-[rgba(167,139,250,0.4)] bg-[rgba(167,139,250,0.08)]"
                                title={
                                  typeof c.carryForwardDelta === "number"
                                    ? `Carry-forward dimensional credit: +${c.carryForwardDelta} pts not yet reflected in published composite`
                                    : "Carry-forward dimensional credit active"
                                }
                              >
                                Carry-forward
                                {typeof c.carryForwardDelta === "number" &&
                                  ` +${c.carryForwardDelta}`}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-muted text-[0.88rem]">{formatIndex(c.index)}</td>
                        <td className="py-4 px-4">
                          {band && <Band level={band} />}
                        </td>
                        <td className="py-4 px-4 text-right font-mono text-[0.92rem]">{c.publishedScore}</td>
                        <td className="py-4 px-4 text-right font-mono text-[0.92rem]">{c.assessedScore}</td>
                        <td className="py-4 px-4 text-right font-mono text-[0.92rem] font-semibold" style={{ color: deltaColor(c.delta) }}>
                          {c.delta > 0 ? "+" : ""}{c.delta}
                        </td>
                        <td className="py-4 px-4 text-muted text-[0.88rem]">
                          {c.date && (
                            <time dateTime={c.date}>{formatDateLabel(c.date)}</time>
                          )}
                        </td>
                        <td className="py-4 px-5 text-muted text-[0.88rem] max-w-[380px] leading-relaxed">{c.headline}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Container>
        </section>
      )}

      {/* Key Highlights */}
      {highlights.length > 0 && (
        <section id="highlights" className="py-[30px] scroll-mt-24">
          <Container>
            <SectionHead
              title="Today's analysis"
              description={`The most significant editorial findings in the ${formatDateLabel(updates.date)} briefing.`}
            />
            <div className="grid grid-cols-1 gap-3">
              {(highlights as string[]).map((h: string, i: number) => (
                <div
                  key={i}
                  className="rounded-[20px] border border-[rgba(125,211,252,0.18)] bg-[rgba(125,211,252,0.05)] p-5"
                >
                  <div className="flex gap-3 items-start">
                    <span className="text-[0.78rem] font-bold text-accent shrink-0 mt-[3px] uppercase tracking-wider">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="text-[0.95rem] leading-relaxed">{h}</p>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Newsletter Signup — positioned after Key Highlights at interest peak */}
      {showNewsletter && (
        <section id="newsletter" className="py-[30px]">
          <Container>
            <NewsletterSignup variant="card" source="updates-highlights" />
          </Container>
        </section>
      )}

      {/* Sector Intelligence */}
      {normalizedSectorTrends.length > 0 && (
        <section className="py-[30px]">
          <Container>
            <SectionHead
              title="Sector findings"
              description={`Patterns emerging across indexed sectors in the ${formatDateLabel(updates.date)} briefing.`}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {normalizedSectorTrends.map((trend) => (
                <Panel key={trend.sector}>
                  <div className="flex items-center gap-2.5 mb-4">
                    <span className="w-1 h-5 rounded-full bg-accent shrink-0" />
                    <h3 className="text-[1.08rem] font-bold">{trend.sector}</h3>
                  </div>
                  <ul className="space-y-3">
                    {trend.points.map((p: string, i: number) => (
                      <li key={i} className="flex gap-2.5 text-muted text-[0.9rem] leading-relaxed">
                        <span className="text-accent shrink-0 mt-[2px]">&#8250;</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </Panel>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Emerging Risks */}
      {emergingRisks.length > 0 && (
        <section id="emerging-risks" className="py-[30px] scroll-mt-24">
          <Container>
            <SectionHead
              title="Risk signals"
              description={`Developments that may affect future scores. Watch items from the ${formatDateLabel(updates.date)} briefing.`}
            />
            <div className="grid grid-cols-1 gap-3">
              {(emergingRisks as unknown[]).map((rawRisk: unknown, i: number) => {
                // Schema drift defense: emergingRisks has shipped in two shapes —
                //   string[] (canonical, ≤ 2026-05-12)
                //   Array<{ risk, description, affectedEntities?, timeframe? }>
                //     (May 13 onward — richer, includes timeframe + affected entities)
                // Normalise to a common render shape so both render uniformly.
                const isObject =
                  rawRisk !== null &&
                  typeof rawRisk === "object" &&
                  !Array.isArray(rawRisk);
                const obj = isObject
                  ? (rawRisk as {
                      risk?: string;
                      description?: string;
                      affectedEntities?: string[];
                      timeframe?: string;
                    })
                  : null;
                const title = obj?.risk ?? null;
                const body = obj
                  ? (obj.description ?? "")
                  : typeof rawRisk === "string"
                    ? rawRisk
                    : "";
                const affected: string[] = Array.isArray(obj?.affectedEntities)
                  ? (obj?.affectedEntities as string[])
                  : [];
                const timeframe = obj?.timeframe ?? null;
                return (
                  <div
                    key={i}
                    className="rounded-[20px] border-l-4 border border-[rgba(251,146,60,0.25)] bg-[rgba(251,146,60,0.05)] p-5"
                    style={{ borderLeftColor: "#fb923c" }}
                  >
                    <div className="flex gap-3 items-start">
                      <div className="shrink-0 mt-[2px]">
                        <span className="text-[0.78rem] font-bold uppercase tracking-wider text-[#fb923c]">Risk</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        {title && (
                          <h3 className="text-[0.98rem] font-bold text-text leading-tight mb-1">
                            {title}
                          </h3>
                        )}
                        <p className="text-[0.92rem] text-muted leading-relaxed">{body}</p>
                        {(affected.length > 0 || timeframe) && (
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2.5 text-[0.78rem]">
                            {affected.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {affected.map((slug) => {
                                  const resolved = resolveSlugHref(slug);
                                  return resolved ? (
                                    <TrackedEntityLink
                                      key={slug}
                                      href={resolved.href}
                                      slug={slug}
                                      index={resolved.index}
                                      source="boundaryWatch"
                                      className="font-semibold px-2 py-0.5 rounded-full border border-[rgba(251,146,60,0.3)] bg-[rgba(251,146,60,0.08)] text-[#fb923c] hover:border-[rgba(251,146,60,0.6)] transition-colors"
                                    >
                                      {slug}
                                    </TrackedEntityLink>
                                  ) : (
                                    <span
                                      key={slug}
                                      className="font-semibold px-2 py-0.5 rounded-full border border-[rgba(251,146,60,0.3)] bg-[rgba(251,146,60,0.08)] text-[#fb923c]"
                                    >
                                      {slug}
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                            {timeframe && (
                              <span className="text-muted">
                                <span className="text-[0.7rem] font-bold uppercase tracking-widest text-muted mr-1.5">
                                  Window
                                </span>
                                {timeframe}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Container>
        </section>
      )}

      {/* Research Insights */}
      {insights.length > 0 && (
        <section className="py-[30px]">
          <Container>
            <SectionHead
              title="Analytical notes"
              description={`Observations on methodology, evidence quality, and structural patterns from the ${formatDateLabel(updates.date)} briefing.`}
            />
            <div className="grid grid-cols-1 gap-3">
              {(insights as string[]).map((insight: string, i: number) => (
                <div
                  key={i}
                  className="rounded-[20px] border border-line bg-[rgba(255,255,255,0.025)] p-5"
                >
                  <div className="flex gap-3 items-start">
                    <span className="text-[0.78rem] font-bold text-muted shrink-0 mt-[3px] uppercase tracking-wider border border-line rounded px-1.5 py-0.5">
                      Note
                    </span>
                    <p className="text-[0.92rem] text-muted leading-relaxed">{insight}</p>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Math hygiene cluster — publication-integrity disclosure.
          Surfaces the reconciliation cohort and any critical-flag entity
          (sustained discrepancy at ≥10 cycles requires formula audit). */}
      {mathHygiene && (
        <MathHygienePanel data={mathHygiene as any} />
      )}

      {/* Carry-forward dimensional credits — methodology transparency.
          When published composite under-reflects accumulated dimensional
          pressure, we document the reconstructed score alongside it. */}
      {carryForwardDimensionalCredits.length > 0 && (
        <CarryForwardCreditsPanel items={carryForwardDimensionalCredits as any[]} />
      )}

      {/* Holds — entities deferred from this cycle with documented reason
          and resume date. Distinct from confirmations (which are full
          re-assessments). */}
      {holds.length > 0 && (
        <HoldsPanel items={holds as any[]} />
      )}

      {/* Forward signals — what the methodology pipeline is tracking next.
          Date-grouped calendar with priority and action-required notes. */}
      {signals.length > 0 && (
        <ForwardSignalsList items={signals as any[]} />
      )}

      {/* Assessed Entities */}
      {recentAssessments.length > 0 && (
        <section className="py-[30px]">
          <Container>
            <SectionHead
              title="Today's coverage"
              description="All entities assessed in this briefing, with composite scores and band classifications."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {(recentAssessments as any[]).map((a: any) => {
                const band = normalizeBand(a.band);
                const assessmentHref = entityHref(a.publishedIndex, a.slug) ?? "/indexes";
                return (
                  <TrackedEntityLink
                    key={a.slug}
                    href={assessmentHref}
                    slug={a.slug}
                    index={a.publishedIndex ?? ""}
                    source="recentAssessment"
                    className="block rounded-[16px] border border-line bg-[rgba(255,255,255,0.03)] p-4 hover:border-[rgba(125,211,252,0.3)] hover:bg-[rgba(125,211,252,0.04)] transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-bold text-[0.97rem] group-hover:text-text transition-colors leading-tight">
                        {a.entity}
                      </h4>
                      <span
                        className="text-[1.25rem] font-bold leading-none shrink-0"
                        style={{ color: bandColor(a.band) }}
                      >
                        {a.compositeScore}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {band && <Band level={band} />}
                    </div>
                    <div className="text-[0.8rem] text-muted leading-snug">
                      {a.sector}
                    </div>
                    {a.publishedComposite != null && (
                      <div className="text-[0.78rem] text-muted mt-1.5 flex items-center gap-1">
                        <span>Published:</span>
                        <span className="font-semibold">{a.publishedComposite}</span>
                        {a.publishedComposite !== a.compositeScore && (
                          <span style={{ color: deltaColor(a.compositeScore - a.publishedComposite) }}>
                            ({a.compositeScore - a.publishedComposite > 0 ? "+" : ""}
                            {Math.round((a.compositeScore - a.publishedComposite) * 10) / 10})
                          </span>
                        )}
                      </div>
                    )}
                  </TrackedEntityLink>
                );
              })}
            </div>
          </Container>
        </section>
      )}

      {/* End-of-page CTA — secondary placement for users who read everything */}
      <section className="py-[30px]">
        <Container>
          <Callout>
            <h2 className="text-[clamp(1.3rem,2.5vw,1.7rem)] mb-2">
              Want the complete picture?
            </h2>
            <p className="text-muted max-w-[760px] mb-[18px]">
              Full benchmark reports include all 40 subdimension scores, complete evidence trails, and methodology documentation for every assessed entity.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Button href="/purchase-research" variant="primary">Purchase Research</Button>
              <Button href="/certified-assessments">Request Assessment</Button>
            </div>
          </Callout>
        </Container>
      </section>
    </>
  );
}

/**
 * Floor designations panel — methodology disclosure for entities whose
 * composite resolves at zero because every dimension hit the lowest anchor.
 *
 * Iterates the entity registry to find all floor-designated entities and
 * surfaces them as a compact, persistent grid linked to entity-page disclosures.
 *
 * Renders nothing if no entities are floor-designated (defensive default).
 */
function FloorDesignationsPanel() {
  const KINDS: EntityKind[] = [
    "ai-lab",
    "company",
    "country",
    "us-state",
    "robotics-lab",
    "city",
    "us-city",
  ];
  const designated = KINDS.flatMap((k) => getAllEntities(k))
    .filter((e) => e.floorDesignation && e.floorDesignation.designated)
    // Stable order: rank-bucket within kind then alphabetical
    .sort((a, b) => {
      const kindOrder = a.kind.localeCompare(b.kind);
      if (kindOrder !== 0) return kindOrder;
      return a.name.localeCompare(b.name);
    });

  if (designated.length === 0) return null;

  return (
    <section
      id="floor-designations"
      className="py-[30px] scroll-mt-24"
    >
      <Container>
        <div className="rounded-[16px] border border-[rgba(244,63,94,0.32)] bg-gradient-to-br from-[rgba(244,63,94,0.07)] via-[rgba(244,63,94,0.03)] to-transparent p-5 sm:p-6 shadow-[0_18px_44px_rgba(0,0,0,0.28)]">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span
              className="inline-block w-2 h-2 rounded-full bg-[#f43f5e]"
              aria-hidden
            />
            <p className="text-[0.78rem] uppercase tracking-[0.14em] text-[#f43f5e] font-bold">
              Floor designations
            </p>
            <span className="text-muted text-[0.78rem]">·</span>
            <span className="text-muted text-[0.82rem]">
              {designated.length} {designated.length === 1 ? "entity" : "entities"} at composite 0 with documented evidence pattern
            </span>
          </div>

          <h2 className="text-[1.2rem] sm:text-[1.32rem] font-bold leading-snug mb-2">
            Composite scores resolving at zero — methodology disclosure
          </h2>
          <p className="text-muted text-[0.92rem] sm:text-[0.95rem] mb-4 max-w-3xl">
            These entities have all 8 dimensions resolving at the lowest behavioral
            anchor (1.0/5.0) across multiple assessment cycles. The composite is
            zero by formula; each entity page surfaces the documented evidence
            pattern. Floor designation is reversible when functional improvement is
            evidenced.{" "}
            <Link
              href="/methodology#floor-designation"
              className="text-[#7dd3fc] hover:underline"
            >
              Read the methodology
            </Link>
            .
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {designated.map((e) => {
              const fd = e.floorDesignation!;
              const indexSlug =
                e.kind === "ai-lab"
                  ? "ai-labs"
                  : e.kind === "country"
                  ? "countries"
                  : e.kind === "company"
                  ? "fortune-500"
                  : e.kind === "robotics-lab"
                  ? "robotics-labs"
                  : e.kind === "us-state"
                  ? "us-states"
                  : e.kind === "us-city"
                  ? "us-cities"
                  : "global-cities";
              const indexLabel = formatIndex(indexSlug);
              const href = entityHref(indexSlug, e.slug);
              if (!href) return null;
              return (
                <Link
                  key={`${e.kind}-${e.slug}`}
                  href={href}
                  className="block rounded-[12px] border border-[rgba(244,63,94,0.22)] bg-[rgba(15,18,24,0.55)] p-3.5 hover:border-[rgba(244,63,94,0.45)] hover:bg-[rgba(244,63,94,0.04)] transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <p className="text-[0.7rem] uppercase tracking-[0.1em] text-muted mb-0.5">
                        {indexLabel}
                      </p>
                      <p className="text-text font-semibold text-[0.98rem] truncate">
                        {e.name}
                      </p>
                    </div>
                    <span className="shrink-0 text-[0.72rem] font-bold text-[#f43f5e] uppercase tracking-wider px-1.5 py-0.5 rounded border border-[rgba(244,63,94,0.32)] bg-[rgba(244,63,94,0.08)]">
                      Floor
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {fd.primaryDrivers.slice(0, 6).map((code) => {
                      const dim = DIMENSIONS.find((d) => d.code === code);
                      const color = dim?.color ?? "#94a3b8";
                      return (
                        <span
                          key={code}
                          className="inline-flex items-center px-1.5 py-0.5 rounded text-[0.7rem] font-semibold"
                          style={{
                            color,
                            backgroundColor: `${color}14`,
                            border: `1px solid ${color}40`,
                          }}
                          title={dim?.name ?? code}
                        >
                          {code}
                        </span>
                      );
                    })}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}

/* -------------------------------------------------------------------------
 * Helper section components for editorial blocks introduced by the
 * overnight-digest in late-April / May 2026. Each renders nothing if its
 * input is empty so older briefings that don't ship these fields are
 * unaffected.
 * ----------------------------------------------------------------------- */

function extractDomainSafe(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/**
 * NewConductCategoriesPanel — surfaces methodology innovations defined in this
 * cycle. Each item documents a new conduct category (name, definition,
 * pairing rule, first-application entity). Treats the framework's evolution
 * as a citable record, not buried prose.
 */
function NewConductCategoriesPanel({ items }: { items: any[] }) {
  return (
    <section
      id="new-conduct-categories"
      className="py-[30px] scroll-mt-24"
      aria-label="New conduct categories defined this cycle"
    >
      <Container>
        <div className="rounded-[16px] border border-[rgba(167,139,250,0.32)] bg-gradient-to-br from-[rgba(167,139,250,0.07)] via-[rgba(167,139,250,0.03)] to-transparent p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span
              className="inline-block w-2 h-2 rounded-full bg-[#a78bfa]"
              aria-hidden="true"
            />
            <p className="text-[0.78rem] uppercase tracking-[0.14em] text-[#a78bfa] font-bold">
              Methodology innovation
            </p>
            <span className="text-muted text-[0.78rem]">·</span>
            <span className="text-muted text-[0.82rem]">
              {items.length} new conduct{" "}
              {items.length === 1 ? "category" : "categories"} introduced
            </span>
          </div>
          <h2 className="text-[1.2rem] sm:text-[1.32rem] font-bold leading-snug mb-2">
            New analytical categories defined in this briefing
          </h2>
          <p className="text-muted text-[0.92rem] sm:text-[0.95rem] mb-4 max-w-3xl">
            Compassion Benchmark&apos;s analytical framework evolves when conduct
            patterns are documented that don&apos;t fit existing categories.
            Each new category is dated, defined, and tied to the first-
            application entity so the framework is auditable.{" "}
            <Link
              href="/methodology"
              className="text-[#7dd3fc] hover:underline"
            >
              Read the methodology
            </Link>
            .
          </p>
          <div className="grid grid-cols-1 gap-3">
            {items.map((cat, i) => (
              <article
                key={`${cat.name}-${i}`}
                className="rounded-[12px] border border-[rgba(167,139,250,0.22)] bg-[rgba(15,18,24,0.55)] p-4"
              >
                <div className="flex flex-wrap items-baseline gap-2 mb-2">
                  <h3 className="text-[1.02rem] font-bold text-text font-mono">
                    {cat.name}
                  </h3>
                  {cat.firstApplicationDate && (
                    <>
                      <span className="text-muted text-[0.78rem]">·</span>
                      <span className="text-muted text-[0.78rem]">
                        First applied{" "}
                        <time dateTime={cat.firstApplicationDate}>
                          {formatDateLabel(cat.firstApplicationDate)}
                        </time>
                      </span>
                    </>
                  )}
                  {cat.firstApplicationEntity && (
                    <>
                      <span className="text-muted text-[0.78rem]">to</span>
                      <span className="text-text text-[0.85rem] font-semibold capitalize">
                        {cat.firstApplicationEntity.replace(/-/g, " ")}
                      </span>
                    </>
                  )}
                </div>
                {cat.definition && (
                  <p className="text-[0.92rem] text-muted leading-relaxed mb-2">
                    {cat.definition}
                  </p>
                )}
                {cat.pairingRule && (
                  <div className="text-[0.85rem] text-muted leading-relaxed mb-1">
                    <span className="text-[0.72rem] font-bold uppercase tracking-widest text-[#a78bfa] mr-2">
                      Pairing rule
                    </span>
                    {cat.pairingRule}
                  </div>
                )}
                {cat.priorRelatedCategory && (
                  <div className="text-[0.82rem] text-muted-subtle leading-relaxed">
                    <span className="text-[0.72rem] font-bold uppercase tracking-widest text-muted mr-2">
                      Related
                    </span>
                    {cat.priorRelatedCategory}
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

/**
 * FloorConductSection — cycle-specific conduct documentation for entities at
 * composite=0. Each item carries headline, conductCategories[] bullet list,
 * sources[] external links, and an optional newConductCategory badge.
 */
function FloorConductSection({ items, date }: { items: any[]; date: string }) {
  return (
    <section
      id="floor-conduct"
      className="py-[30px] scroll-mt-24"
      aria-label="Floor conduct documentations from this cycle"
    >
      <Container>
        <SectionHead
          title="Floor conduct record"
          description={`Cycle-specific conduct documentation for entities at composite zero, recorded for the ${formatDateLabel(date)} briefing.`}
        />
        <div className="grid grid-cols-1 gap-4">
          {items.map((fe, i) => {
            const href = entityHref(fe.index, fe.slug);
            return (
              <article
                key={`${fe.slug}-${i}`}
                className="rounded-[20px] border border-[rgba(244,63,94,0.32)] bg-gradient-to-br from-[rgba(244,63,94,0.08)] via-[rgba(244,63,94,0.03)] to-transparent p-5 sm:p-6"
                aria-label={`Floor conduct documentation for ${fe.entity}`}
              >
                <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span
                        className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-[#f43f5e] px-1.5 py-0.5 rounded border border-[rgba(244,63,94,0.32)] bg-[rgba(244,63,94,0.08)]"
                      >
                        Floor · {fe.band ?? "Critical"}
                      </span>
                      {fe.newConductCategory && (
                        <span
                          className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-[#a78bfa] px-1.5 py-0.5 rounded border border-[rgba(167,139,250,0.32)] bg-[rgba(167,139,250,0.08)]"
                          title="New conduct category defined this cycle"
                        >
                          New category: {fe.newConductCategory}
                        </span>
                      )}
                      {fe.completeBadFaithFormatCycle && (
                        <span className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-[#fb923c] px-1.5 py-0.5 rounded border border-[rgba(251,146,60,0.32)] bg-[rgba(251,146,60,0.08)]">
                          Complete bad-faith-format cycle
                        </span>
                      )}
                    </div>
                    <h3 className="text-[1.2rem] sm:text-[1.32rem] font-bold leading-tight">
                      {href ? (
                        <TrackedEntityLink
                          href={href}
                          slug={fe.slug}
                          index={fe.index}
                          source="floorConduct"
                          className="hover:text-accent transition-colors"
                        >
                          {fe.entity}
                        </TrackedEntityLink>
                      ) : (
                        fe.entity
                      )}
                    </h3>
                  </div>
                </div>
                {fe.headline && (
                  <p className="text-[0.95rem] text-text leading-relaxed mb-4 border-l-2 border-[rgba(244,63,94,0.45)] pl-3">
                    {fe.headline}
                  </p>
                )}
                {Array.isArray(fe.conductCategories) && fe.conductCategories.length > 0 && (
                  <div className="mb-3">
                    <div className="text-[0.72rem] font-bold uppercase tracking-widest text-muted mb-2">
                      Conduct documented
                    </div>
                    <ul className="space-y-1.5">
                      {fe.conductCategories.map((c: string, j: number) => (
                        <li key={j} className="flex gap-2 text-[0.9rem] text-muted leading-relaxed">
                          <span className="text-[#f43f5e] shrink-0 mt-[2px]" aria-hidden="true">
                            ›
                          </span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {Array.isArray(fe.sources) && fe.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.06)]">
                    <div className="text-[0.72rem] font-bold uppercase tracking-widest text-muted mb-2">
                      Primary sources
                    </div>
                    <ol className="space-y-1">
                      {fe.sources.map((src: string, j: number) => (
                        <li key={j} className="flex items-baseline gap-2">
                          <span className="text-[0.74rem] font-bold text-[#f43f5e] shrink-0">
                            {j + 1}.
                          </span>
                          <a
                            href={src}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[0.82rem] text-[#f87171] hover:text-text transition-colors underline underline-offset-2 break-all"
                          >
                            {extractDomainSafe(src)}
                          </a>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

/**
 * BoundaryWatchPanel — entities near band thresholds. Renders both resolved
 * (band crossing realized) and active watches as a compact chip strip.
 */
function BoundaryWatchPanel({ items }: { items: any[] }) {
  return (
    <section
      id="boundary-watches"
      className="py-[24px] scroll-mt-24"
      aria-label="Entities on boundary watch near band thresholds"
    >
      <Container>
        <div className="rounded-[16px] border border-line bg-[rgba(255,255,255,0.025)] p-5">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span
              className="inline-block w-2 h-2 rounded-full bg-[#fcd34d]"
              aria-hidden="true"
            />
            <p className="text-[0.78rem] uppercase tracking-[0.14em] text-[#fcd34d] font-bold">
              Boundary watch
            </p>
            <span className="text-muted text-[0.78rem]">·</span>
            <span className="text-muted text-[0.82rem]">
              {items.length} {items.length === 1 ? "entity" : "entities"} within 1 point of a band threshold
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {items.map((w, i) => {
              const href = entityHref(w.index, w.slug);
              const resolved = typeof w.status === "string" && /resolv|realiz|crossed/i.test(w.status);
              return (
                <div
                  key={`${w.slug}-${i}`}
                  className={`rounded-[12px] border p-3.5 ${
                    resolved
                      ? "border-[rgba(167,139,250,0.32)] bg-[rgba(167,139,250,0.05)]"
                      : "border-[rgba(252,211,77,0.25)] bg-[rgba(252,211,77,0.04)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5 flex-wrap">
                    <div className="min-w-0">
                      <p className="text-[0.7rem] uppercase tracking-[0.1em] text-muted mb-0.5">
                        {formatIndex(w.index)}
                      </p>
                      <p className="text-text font-semibold text-[0.98rem]">
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
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        className="font-mono font-bold text-[1.05rem] tabular-nums"
                        style={{ color: resolved ? "#a78bfa" : "#fcd34d" }}
                      >
                        {w.composite ?? "—"}
                      </span>
                      {typeof w.priorWatchComposite === "number" && (
                        <div className="text-[0.74rem] text-muted-subtle tabular-nums">
                          was {w.priorWatchComposite}
                        </div>
                      )}
                    </div>
                  </div>
                  {w.status && (
                    <p className="text-[0.82rem] text-muted leading-snug">
                      {w.status}
                    </p>
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

/**
 * MathHygienePanel — publication-integrity disclosure. Surfaces the
 * reconciliation cohort, sustained-discrepancy critical flags, and any
 * sub-threshold candidates being tracked.
 */
function MathHygienePanel({ data }: { data: any }) {
  const cluster: any[] = Array.isArray(data.clusterEntities) ? data.clusterEntities : [];
  const subThreshold: any[] = Array.isArray(data.subThresholdCandidates)
    ? data.subThresholdCandidates
    : [];
  const critical = data.criticalFlag;

  return (
    <section
      id="math-hygiene"
      className="py-[30px] scroll-mt-24"
      aria-label="Math hygiene and publication integrity cluster"
    >
      <Container>
        <SectionHead
          title="Math hygiene"
          description="Entities where published composite and reconstructed composite diverge. Tracked openly as a publication-integrity obligation."
        />

        {critical && (
          <div className="mb-4 rounded-[16px] border border-[rgba(248,113,113,0.45)] bg-gradient-to-br from-[rgba(248,113,113,0.10)] via-[rgba(248,113,113,0.04)] to-transparent p-5">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span
                className="inline-block w-2 h-2 rounded-full bg-[#f87171]"
                aria-hidden="true"
              />
              <p className="text-[0.78rem] uppercase tracking-[0.14em] text-[#f87171] font-bold">
                Critical flag
              </p>
              <span className="text-muted text-[0.78rem]">·</span>
              <span className="text-muted text-[0.82rem]">
                {critical.cyclesOpen ?? "?"} cycles open
              </span>
            </div>
            <h3 className="text-[1.1rem] font-bold mb-1">
              {critical.entity}
              {critical.index && (
                <span className="text-muted text-[0.82rem] font-normal ml-2">
                  {formatIndex(critical.index)}
                </span>
              )}
            </h3>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[0.85rem] text-muted mb-2 tabular-nums">
              {typeof critical.published === "number" && (
                <span>
                  Published <span className="text-text font-semibold">{critical.published}</span>
                </span>
              )}
              {typeof critical.reconstructed === "number" && (
                <span>
                  Reconstructed <span className="text-text font-semibold">{critical.reconstructed}</span>
                </span>
              )}
              {critical.discrepancy !== undefined && (
                <span>
                  Discrepancy{" "}
                  <span
                    className="font-bold"
                    style={{
                      color:
                        typeof critical.discrepancy === "number" && critical.discrepancy < 0
                          ? "#f87171"
                          : "#7dd3fc",
                    }}
                  >
                    {typeof critical.discrepancy === "number" && critical.discrepancy > 0 ? "+" : ""}
                    {critical.discrepancy}
                  </span>
                </span>
              )}
            </div>
            {critical.severity && (
              <p className="text-[0.9rem] text-text leading-relaxed">{critical.severity}</p>
            )}
          </div>
        )}

        {data.note && (
          <p className="text-muted text-[0.92rem] leading-relaxed mb-4 max-w-3xl">
            {data.note}
          </p>
        )}

        {cluster.length > 0 && (
          <div className="overflow-auto border border-line rounded-[16px] bg-[rgba(255,255,255,0.02)] mb-4">
            <table className="w-full border-collapse">
              <caption className="sr-only">
                Math-hygiene cluster: entities with sustained published vs. reconstructed score discrepancy
              </caption>
              <thead>
                <tr className="border-b border-line">
                  <th scope="col" className="text-muted text-[0.78rem] font-semibold uppercase tracking-wider text-left py-3 px-4">Entity</th>
                  <th scope="col" className="text-muted text-[0.78rem] font-semibold uppercase tracking-wider text-left py-3 px-4">Index</th>
                  <th scope="col" className="text-muted text-[0.78rem] font-semibold uppercase tracking-wider text-right py-3 px-4">Published</th>
                  <th scope="col" className="text-muted text-[0.78rem] font-semibold uppercase tracking-wider text-right py-3 px-4">Reconstructed</th>
                  <th scope="col" className="text-muted text-[0.78rem] font-semibold uppercase tracking-wider text-right py-3 px-4">Δ</th>
                  <th scope="col" className="text-muted text-[0.78rem] font-semibold uppercase tracking-wider text-right py-3 px-4">Cycles</th>
                  <th scope="col" className="text-muted text-[0.78rem] font-semibold uppercase tracking-wider text-left py-3 px-4">Severity</th>
                </tr>
              </thead>
              <tbody>
                {cluster.map((row, i) => {
                  const sevColor =
                    row.severity === "CRITICAL"
                      ? "#f87171"
                      : row.severity === "HIGH"
                        ? "#fb923c"
                        : row.severity === "MEDIUM"
                          ? "#fcd34d"
                          : "#94a3b8";
                  return (
                    <tr
                      key={`${row.entity}-${i}`}
                      className="border-b border-line last:border-b-0 hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                    >
                      <td className="py-2.5 px-4 font-semibold text-[0.9rem]">{row.entity}</td>
                      <td className="py-2.5 px-4 text-muted text-[0.85rem]">{formatIndex(row.index)}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-[0.88rem] tabular-nums">
                        {row.published ?? "—"}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-[0.88rem] tabular-nums">
                        {row.reconstructed ?? "—"}
                      </td>
                      <td
                        className="py-2.5 px-4 text-right font-mono text-[0.88rem] tabular-nums font-semibold"
                        style={{
                          color:
                            typeof row.discrepancy === "number" && row.discrepancy < 0
                              ? "#f87171"
                              : typeof row.discrepancy === "number" && row.discrepancy > 0
                                ? "#7dd3fc"
                                : "#94a3b8",
                        }}
                      >
                        {typeof row.discrepancy === "number" && row.discrepancy > 0 ? "+" : ""}
                        {row.discrepancy ?? "—"}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-[0.88rem] tabular-nums">
                        {row.cyclesOpen ?? "—"}
                      </td>
                      <td className="py-2.5 px-4">
                        <span
                          className="text-[0.74rem] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border"
                          style={{
                            color: sevColor,
                            borderColor: `${sevColor}55`,
                            background: `${sevColor}14`,
                          }}
                        >
                          {row.severity ?? "—"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {subThreshold.length > 0 && (
          <div className="text-[0.85rem] text-muted-subtle leading-relaxed">
            <span className="text-[0.72rem] font-bold uppercase tracking-widest text-muted mr-2">
              Sub-threshold candidates
            </span>
            {subThreshold.map((c, i) => (
              <span key={`${c.entity}-${i}`}>
                {i > 0 && " · "}
                <span className="text-text font-semibold">{c.entity}</span>
                {typeof c.gap === "number" && (
                  <span className="text-muted ml-1 tabular-nums">
                    (gap {c.gap > 0 ? "+" : ""}{c.gap})
                  </span>
                )}
              </span>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}

/**
 * CarryForwardCreditsPanel — methodology transparency for entities where
 * accumulated dimensional pressure has not yet been reflected in the
 * published composite.
 */
function CarryForwardCreditsPanel({ items }: { items: any[] }) {
  return (
    <section
      id="carry-forward-credits"
      className="py-[24px] scroll-mt-24"
      aria-label="Carry-forward dimensional credits"
    >
      <Container>
        <div className="rounded-[16px] border border-[rgba(125,211,252,0.18)] bg-[rgba(125,211,252,0.04)] p-5">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span
              className="inline-block w-2 h-2 rounded-full bg-[#7dd3fc]"
              aria-hidden="true"
            />
            <p className="text-[0.78rem] uppercase tracking-[0.14em] text-[#7dd3fc] font-bold">
              Carry-forward dimensional credits
            </p>
            <span className="text-muted text-[0.78rem]">·</span>
            <span className="text-muted text-[0.82rem]">
              {items.length} {items.length === 1 ? "entity" : "entities"} with documented pressure not yet reflected in composite
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {items.map((c, i) => (
              <div
                key={`${c.slug}-${i}`}
                className="rounded-[12px] border border-line bg-[rgba(15,18,24,0.55)] p-3.5"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5 flex-wrap">
                  <p className="text-text font-semibold text-[0.96rem] capitalize">
                    {c.entity}
                  </p>
                  <div className="text-right shrink-0 tabular-nums">
                    <span className="text-muted text-[0.82rem]">
                      {c.publishedScore ?? "—"}
                    </span>
                    <span className="text-muted mx-1.5">→</span>
                    <span className="text-[#7dd3fc] font-bold text-[0.95rem]">
                      {c.reconstructedScore ?? "—"}
                    </span>
                    {typeof c.dimensionalPressure === "number" && (
                      <span className="text-[#86efac] ml-1.5 text-[0.82rem] font-semibold">
                        (+{c.dimensionalPressure})
                      </span>
                    )}
                  </div>
                </div>
                {c.dimensionsAffected && typeof c.dimensionsAffected === "object" && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {Object.entries(c.dimensionsAffected).map(([code, value]) => {
                      const dim = DIMENSIONS.find((d) => d.code === code);
                      const color = dim?.color ?? "#94a3b8";
                      return (
                        <span
                          key={code}
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[0.72rem] font-semibold tabular-nums"
                          style={{
                            color,
                            background: `${color}14`,
                            border: `1px solid ${color}40`,
                          }}
                          aria-label={`${dim?.name ?? code}: ${value}`}
                        >
                          <span>{code}</span>
                          <span className="opacity-90">{String(value)}</span>
                        </span>
                      );
                    })}
                  </div>
                )}
                {c.firstLoggedDate && (
                  <p className="text-[0.74rem] text-muted-subtle mt-2">
                    First logged{" "}
                    <time dateTime={c.firstLoggedDate}>
                      {formatDateLabel(c.firstLoggedDate)}
                    </time>
                    {c.status && ` · ${c.status}`}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

/**
 * HoldsPanel — entities deferred from this cycle with reason and resume date.
 */
function HoldsPanel({ items }: { items: any[] }) {
  return (
    <section
      id="holds"
      className="py-[24px] scroll-mt-24"
      aria-label="Entities held from this cycle with resume date"
    >
      <Container>
        <div className="rounded-[16px] border border-line bg-[rgba(255,255,255,0.025)] p-5">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span
              className="inline-block w-2 h-2 rounded-full bg-[#94a3b8]"
              aria-hidden="true"
            />
            <p className="text-[0.78rem] uppercase tracking-[0.14em] text-muted font-bold">
              Held this cycle
            </p>
            <span className="text-muted text-[0.78rem]">·</span>
            <span className="text-muted text-[0.82rem]">
              {items.length} {items.length === 1 ? "entity" : "entities"} deferred with documented reason
            </span>
          </div>
          <ul className="space-y-3">
            {items.map((h, i) => {
              const href = entityHref(h.index, h.slug);
              return (
                <li
                  key={`${h.slug}-${i}`}
                  className="rounded-[12px] border border-line bg-[rgba(15,18,24,0.45)] p-3.5"
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5 flex-wrap">
                    <div className="min-w-0">
                      <p className="text-[0.7rem] uppercase tracking-[0.1em] text-muted mb-0.5">
                        {formatIndex(h.index)}
                      </p>
                      <p className="text-text font-semibold text-[0.98rem]">
                        {href ? (
                          <TrackedEntityLink
                            href={href}
                            slug={h.slug}
                            index={h.index}
                            source="hold"
                            className="hover:text-accent transition-colors"
                          >
                            {h.entity}
                          </TrackedEntityLink>
                        ) : (
                          h.entity
                        )}
                      </p>
                    </div>
                    {h.resumeDate && (
                      <div className="text-right shrink-0">
                        <p className="text-[0.7rem] uppercase tracking-widest text-muted">
                          Resume
                        </p>
                        <time
                          dateTime={h.resumeDate}
                          className="text-text text-[0.88rem] font-semibold"
                        >
                          {formatDateLabel(h.resumeDate)}
                        </time>
                      </div>
                    )}
                  </div>
                  {h.holdReason && (
                    <p className="text-[0.88rem] text-muted leading-relaxed">
                      {h.holdReason}
                    </p>
                  )}
                  {h.preStaged && (
                    <p className="text-[0.74rem] text-muted-subtle mt-1.5">
                      Pre-staged for post-hold assessment
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </Container>
    </section>
  );
}

/**
 * ForwardSignalsList — date-grouped calendar of what the methodology pipeline
 * is tracking next. Surfaces forward indicators so the briefing isn't only
 * about what happened today.
 */
function ForwardSignalsList({ items }: { items: any[] }) {
  const priorityRank: Record<string, number> = {
    CRITICAL: 4,
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1,
  };

  // Sort by date ascending then priority descending so the calendar reads
  // top-to-bottom in chronological order with the most consequential item
  // at the top of each date bucket.
  const sorted = [...items].sort((a, b) => {
    const da = String(a.date ?? "");
    const db = String(b.date ?? "");
    if (da !== db) return da.localeCompare(db);
    return (priorityRank[b.priority] ?? 0) - (priorityRank[a.priority] ?? 0);
  });

  const groupedByDate = new Map<string, any[]>();
  for (const s of sorted) {
    const date = String(s.date ?? "TBD");
    if (!groupedByDate.has(date)) groupedByDate.set(date, []);
    groupedByDate.get(date)!.push(s);
  }

  const priorityColor: Record<string, string> = {
    CRITICAL: "#f87171",
    HIGH: "#fb923c",
    MEDIUM: "#fcd34d",
    LOW: "#7dd3fc",
  };

  return (
    <section
      id="forward-signals"
      className="py-[30px] scroll-mt-24"
      aria-label="Forward signals and upcoming scoring events"
    >
      <Container>
        <SectionHead
          title="Forward signals"
          description="Calendar of upcoming scoring events the methodology pipeline is tracking — band-threshold expiries, resume dates for held entities, scheduled re-assessments."
        />
        <div className="space-y-4">
          {Array.from(groupedByDate.entries()).map(([date, group]) => (
            <div
              key={date}
              className="rounded-[16px] border border-line bg-[rgba(255,255,255,0.025)] p-4"
            >
              <div className="flex items-baseline gap-2 mb-3">
                <time
                  dateTime={date !== "TBD" ? date : undefined}
                  className="text-text font-bold text-[0.95rem] font-mono tabular-nums"
                >
                  {date !== "TBD" ? formatDateLabel(date) : "TBD"}
                </time>
                <span className="text-muted text-[0.78rem]">·</span>
                <span className="text-muted text-[0.78rem]">
                  {group.length} {group.length === 1 ? "signal" : "signals"}
                </span>
              </div>
              <ul className="space-y-2.5">
                {group.map((s, i) => {
                  const color = priorityColor[s.priority] ?? "#94a3b8";
                  const href = s.slug ? resolveSlugHref(s.slug) : null;
                  return (
                    <li
                      key={`${date}-${i}`}
                      className="flex gap-3"
                    >
                      <span
                        className="text-[0.7rem] font-bold uppercase tracking-wider shrink-0 mt-[3px] px-1.5 py-0.5 rounded border tabular-nums"
                        style={{
                          color,
                          borderColor: `${color}55`,
                          background: `${color}14`,
                        }}
                      >
                        {s.priority ?? "—"}
                      </span>
                      <div className="flex-1 min-w-0">
                        {s.entity && (
                          <div className="text-text font-semibold text-[0.9rem] mb-0.5">
                            {href ? (
                              <TrackedEntityLink
                                href={href.href}
                                slug={s.slug}
                                index={href.index}
                                source="forwardSignal"
                                className="hover:text-accent transition-colors"
                              >
                                {s.entity}
                              </TrackedEntityLink>
                            ) : (
                              s.entity
                            )}
                          </div>
                        )}
                        {s.signal && (
                          <p className="text-[0.88rem] text-muted leading-relaxed">
                            {s.signal}
                          </p>
                        )}
                        {s.actionRequired && (
                          <p className="text-[0.78rem] text-muted-subtle mt-1 leading-relaxed">
                            <span className="text-[0.7rem] font-bold uppercase tracking-widest text-muted mr-1.5">
                              Action
                            </span>
                            {s.actionRequired}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

// Re-export helpers so [date]/page.tsx can use them without duplication
export { formatDateLabel };
