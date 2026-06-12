import Link from "next/link";
import Container from "@/components/ui/Container";
import Band, { BandLevel } from "@/components/ui/Band";
import Button from "@/components/ui/Button";
import NewsletterSignup from "@/components/ui/NewsletterSignup";
import { DIMENSIONS, BAND_DESCS } from "@/data/dimensions";
import { Entity, KIND_CONFIG } from "@/data/entities";
import { SCORE_WATCH, buildScoreWatchUrl } from "@/data/gumroad";
import BadgeEmbedWidget from "@/components/entity/BadgeEmbedWidget";
import EntityEvidenceCard from "@/components/entity/EntityEvidenceCard";
import type { EntityEvidenceCardProps } from "@/components/entity/EntityEvidenceCard";
import BandPositionStrip from "@/components/charts/BandPositionStrip";
import DimensionProfileBar from "@/components/charts/DimensionProfileBar";
import type { DimensionScores as DimProfileScores } from "@/components/charts/DimensionProfileBar";
import BandDistributionBar from "@/components/charts/BandDistributionBar";
import type { BandCounts } from "@/components/charts/BandDistributionBar";
import ScoreLegend from "@/components/charts/ScoreLegend";
import CompositeSparkline from "@/components/entity/CompositeSparkline";
import type { HistoryEvent } from "@/types/entity-history";

export interface EntityScoreChange {
  date: string;
  delta: number;
  publishedScore: number;
  assessedScore: number;
  headline: string;
  recommendation: string;
  bandChange: boolean;
  confidence?: number;
  status?: string;
}

export interface EntityEvidenceReview {
  reviewed_at: string;
  evidence_found: boolean;
  summary?: string;
  sources?: string[];
  tier?: "T1" | "T2" | "T3";
}

/** Band distribution entry from meta.bands in index JSON. */
export interface IndexBandEntry {
  band: string; // lowercase: "exemplary" | "established" | "functional" | "developing" | "critical"
  count: number;
  percentage: number;
}

interface Props {
  entity: Entity;
  /** Most recent score change across the updates feed, if any. */
  latestChange?: EntityScoreChange | null;
  /** Most recent overnight-scanner evidence review for this entity, if any. */
  evidenceReview?: EntityEvidenceReview | null;
  /** Scanner lookback window in days (default 14). */
  lookbackWindowDays?: number;
  /** If set, a "View score history →" link is shown in the entity hero. */
  historyHref?: string | null;
  /**
   * Props for the EntityEvidenceCard. When supplied, the card is rendered
   * between the freshness stamp and the floor-designation section.
   * The old single-event "Latest score change callout" is superseded by this.
   */
  evidenceCardProps?: EntityEvidenceCardProps | null;

  // ── Wave E1 additions ──────────────────────────────────────────────────────

  /**
   * Field median composite score from the index meta (0–100).
   * Used by #1 BandPositionStrip median marker.
   */
  medianScore?: number | null;

  /**
   * Band distribution from the index meta.bands array.
   * Used by #5 "you are here" band distribution.
   */
  indexBands?: IndexBandEntry[] | null;

  /**
   * Entity history events (scored events with newComposite) for the sparkline
   * and trend caption (#4, #7, #8). Null when no history exists.
   */
  historyEvents?: HistoryEvent[] | null;

  /**
   * Total event count from entity history. Used to determine whether
   * to show the short-history notice (#8).
   */
  totalEventCount?: number | null;

  /**
   * Date of first recorded event, ISO string. Used in #8 orientation notice.
   */
  firstEventDate?: string | null;

  /**
   * Latest score change event (from history). Used for trend caption (#7).
   */
  latestScoreChangeEvent?: HistoryEvent | null;
}

const metadataLabels: Record<string, string> = {
  sector: "Sector",
  f500Rank: "Fortune 500 rank",
  hq: "Headquarters",
  region: "Region",
  country: "Country",
  category: "Category",
  state: "State",
};

function formatMetadata(key: string, value: string | number | undefined): string {
  if (value === undefined || value === null || value === "") return "";
  if (key === "f500Rank") return `#${value}`;
  return String(value);
}

/** Map a 0–5 sub-score to a 0–100 percent for the bar fill. */
function scorePct(score: number): number {
  return Math.min(100, Math.max(0, (score / 5) * 100));
}

/** Band color from a 0–100 composite value (matches DimensionProfileBar). */
function bandColorFrom100(score: number): string {
  if (score <= 20) return "#f87171"; // Critical
  if (score <= 40) return "#fb923c"; // Developing
  if (score <= 60) return "#fcd34d"; // Functional
  if (score <= 80) return "#86efac"; // Established
  return "#7dd3fc";                  // Exemplary
}

/** Format "2026-04-01" → "Apr 2026" */
function formatMonthYear(dateStr: string): string {
  if (!dateStr || dateStr === "now") return "";
  try {
    const [year, month] = dateStr.split("-").map(Number);
    const d = new Date(year, month - 1, 1);
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  } catch {
    return dateStr;
  }
}

/** Format "2026-04-01" → "April 1, 2026" */
function formatLongDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  } catch {
    return dateStr;
  }
}

/**
 * Build the trend-in-words caption for #7.
 * Returns null if there are fewer than 2 scored events with newComposite.
 */
function buildTrendCaption(
  events: HistoryEvent[],
  currentComposite: number,
): string | null {
  // Sort chronologically, filter to events with actual composite values
  const scored = events
    .filter(e => e.newComposite !== null && e.newComposite !== undefined)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (scored.length < 2) return null;

  const first = scored[0];
  const latest = scored[scored.length - 1];
  const delta = (latest.newComposite as number) - (first.newComposite as number);
  const absDelta = Math.abs(delta);
  const direction = delta > 0.1 ? "Up" : delta < -0.1 ? "Down" : "Flat";
  const count = scored.length;
  const sinceMonth = formatMonthYear(first.date);

  if (direction === "Flat") {
    return `No net change over ${count} assessment${count !== 1 ? "s" : ""} since ${sinceMonth}`;
  }
  return `${direction} ${absDelta.toFixed(1)} pts over ${count} assessment${count !== 1 ? "s" : ""} since ${sinceMonth}`;
}

/**
 * Build BandCounts from IndexBandEntry[] for BandDistributionBar.
 * Returns null if the entries are missing or malformed.
 */
function buildBandCounts(bands: IndexBandEntry[]): BandCounts | null {
  const counts: BandCounts = { Critical: 0, Developing: 0, Functional: 0, Established: 0, Exemplary: 0 };
  let hasAny = false;
  for (const entry of bands) {
    const key = entry.band.charAt(0).toUpperCase() + entry.band.slice(1).toLowerCase();
    if (key in counts) {
      counts[key as keyof BandCounts] = entry.count;
      hasAny = true;
    }
  }
  return hasAny ? counts : null;
}

// ─── Tier-provenance chip colors ──────────────────────────────────────────────

const TIER_LABELS: Record<string, { label: string; color: string }> = {
  A: { label: "Tier-A gov/court",      color: "#86efac" },
  B: { label: "Tier-B regulatory",     color: "#7dd3fc" },
  C: { label: "Tier-C NGO/academic",   color: "#c084fc" },
  D: { label: "Tier-D media/other",    color: "#fcd34d" },
};

export default function EntityDetail({
  entity,
  latestChange,
  evidenceReview,
  lookbackWindowDays = 14,
  historyHref = null,
  evidenceCardProps = null,
  medianScore = null,
  indexBands = null,
  historyEvents = null,
  totalEventCount = null,
  firstEventDate = null,
  latestScoreChangeEvent = null,
}: Props) {
  const config = KIND_CONFIG[entity.kind];
  const bandLevel = entity.band.toLowerCase() as BandLevel;

  // ── Wave E1: hero sparkline data ───────────────────────────────────────────
  // Filter to events with composite values, sorted chronologically
  const scoredEvents = (historyEvents ?? [])
    .filter(e => e.newComposite !== null && e.newComposite !== undefined)
    .sort((a, b) => a.date.localeCompare(b.date));

  const hasSparkline = scoredEvents.length >= 3;
  const hasTrendCaption = scoredEvents.length >= 2;
  const trendCaption = hasTrendCaption ? buildTrendCaption(scoredEvents, entity.composite) : null;

  // #8: short-history notice conditions
  const isShortHistory = (totalEventCount === null || totalEventCount < 3) && !hasSparkline;
  const hasNoHistory = totalEventCount === null || totalEventCount === 0;

  // ── Wave E1: dimension profile scores (convert 0–5 → 0–100) ───────────────
  const dimProfileScores: DimProfileScores = {};
  for (const dim of DIMENSIONS) {
    const raw = entity.scores[dim.code] ?? 0;
    dimProfileScores[dim.code as keyof DimProfileScores] = Math.round(raw * 20);
  }

  // ── Wave E1: band distribution counts ─────────────────────────────────────
  const bandCounts = indexBands ? buildBandCounts(indexBands) : null;

  // ── Wave E1: tier-provenance chips ────────────────────────────────────────
  const tierCounts = evidenceCardProps?.tierCounts ?? null;
  const hasTierCounts = tierCounts !== null
    && (tierCounts.A + tierCounts.B + tierCounts.C + tierCounts.D) > 0;

  // ── Wave E1: band description gloss ───────────────────────────────────────
  const bandGloss = BAND_DESCS[entity.band] ?? null;

  // Rephrase from "Your institution" to third-person for entity page context
  function rephraseGloss(gloss: string, name: string): string {
    return gloss
      .replace(/^Your institution( is| demonstrates| has)/, `${name}$1`)
      .replace(/^Your institution/, name);
  }

  return (
    <>
      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 border-b border-line">
        <Container>
          <div className="flex items-center gap-2 text-[0.82rem] text-muted mb-4">
            <Link href="/indexes" className="hover:text-text transition-colors">
              Indexes
            </Link>
            <span aria-hidden>›</span>
            <Link href={config.indexRoute} className="hover:text-text transition-colors">
              {config.indexLabel}
            </Link>
            <span aria-hidden>›</span>
            <span className="text-text font-medium truncate">{entity.name}</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="min-w-0">
              <p className="text-[0.82rem] uppercase tracking-[0.12em] text-muted mb-2">
                {config.indexLabel} · 2026
              </p>
              <h1 className="text-[2.2rem] sm:text-[2.8rem] font-bold leading-[1.05] mb-3">
                {entity.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                <Band level={bandLevel} />
                <span className="text-muted text-[0.95rem]">
                  Rank <span className="text-text font-semibold">#{entity.rank}</span> of{" "}
                  {entity.indexTotal.toLocaleString()}
                </span>
                {config.metadataFields.map((key) => {
                  const val = formatMetadata(key, entity.metadata[key]);
                  if (!val) return null;
                  return (
                    <span key={key} className="text-muted text-[0.95rem]">
                      <span className="text-[rgba(148,163,184,0.7)]">
                        {metadataLabels[key] || key}:
                      </span>{" "}
                      <span className="text-text">{val}</span>
                    </span>
                  );
                })}
              </div>

              {/* ── #3 Band gloss ──────────────────────────────────────── */}
              {bandGloss && (
                <p className="text-muted text-[0.88rem] mt-2 max-w-[540px] leading-relaxed">
                  {rephraseGloss(bandGloss, entity.name)}
                </p>
              )}

              {/* ── #3 ScoreLegend <details> ───────────────────────────── */}
              <div className="mt-2">
                <ScoreLegend />
              </div>
            </div>

            <div className="shrink-0 rounded-[18px] border border-line bg-[rgba(255,255,255,0.03)] px-6 py-5 text-center min-w-[180px]">
              <div className="text-[0.78rem] uppercase tracking-[0.12em] text-muted mb-1">
                Composite score
              </div>
              <div className="text-[2.6rem] font-bold leading-none">{entity.composite.toFixed(1)}</div>
              <div className="text-muted text-[0.82rem] mt-1">out of 100</div>
            </div>
          </div>

          {/* ── #1 Band-position strip (with optional median marker) ──── */}
          <div className="mt-6 max-w-[400px]">
            <BandPositionStrip
              score={entity.composite}
              entityName={entity.name}
              medianScore={medianScore ?? undefined}
            />
          </div>

          {/* ── #4/#7/#8 Sparkline + trend/short-history row ─────────── */}
          <div className="mt-4">
            {hasSparkline ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                {/* Sparkline */}
                <div className="w-[280px] sm:w-[340px] shrink-0">
                  <CompositeSparkline
                    events={scoredEvents}
                    currentComposite={entity.composite}
                    entityName={entity.name}
                    height={52}
                    width={340}
                  />
                </div>
                {/* #7 trend caption */}
                {trendCaption && (
                  <p className="text-muted text-[0.82rem] leading-snug max-w-[260px]">
                    {trendCaption}
                  </p>
                )}
              </div>
            ) : isShortHistory ? (
              /* #8 Short-history orientation notice */
              <p className="text-[0.82rem] text-muted italic max-w-[480px]">
                {hasNoHistory
                  ? "Not yet reassessed since publication — interpret with caution."
                  : firstEventDate
                    ? `First assessed ${formatLongDate(firstEventDate)} — short history, interpret with caution.`
                    : "Short history — interpret with caution."}
              </p>
            ) : null}

            {/* "View score history →" link — always shown when historyHref exists */}
            {historyHref && (
              <div className="mt-2">
                <Link
                  href={historyHref}
                  className="text-[0.85rem] text-accent hover:text-[#a5e3ff] transition-colors"
                >
                  View score history →
                </Link>
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* ── Evidence-review freshness stamp ───────────────────────── */}
      {/* Rendered whenever the overnight scanner has touched this entity.   */}
      {/* Always visible (even when no new evidence) — this IS the signal    */}
      {/* that the entity page is actively maintained, not frozen.            */}
      {evidenceReview && (
        <section className="py-4 border-b border-line bg-[rgba(125,211,252,0.02)]">
          <Container>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[0.88rem]">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-muted">
                <span
                  className={`inline-block w-1.5 h-1.5 rounded-full ${
                    evidenceReview.evidence_found ? "bg-[#fb923c]" : "bg-[#4ade80]"
                  }`}
                  aria-hidden
                />
                <span className="uppercase tracking-[0.1em] text-[0.72rem] font-semibold text-[#7dd3fc]">
                  Evidence reviewed
                </span>
                <time className="text-text font-medium">{evidenceReview.reviewed_at}</time>
                <span aria-hidden>·</span>
                <span>
                  {evidenceReview.evidence_found
                    ? "New evidence surfaced in the last " + lookbackWindowDays + " days"
                    : "No material change in the last " + lookbackWindowDays + " days"}
                </span>
              </div>
              {evidenceReview.summary && evidenceReview.evidence_found && (
                <p className="text-text max-w-[640px] sm:text-right">{evidenceReview.summary}</p>
              )}
            </div>
          </Container>
        </section>
      )}

      {/* ── Assessment record (entity evidence card) ──────────────── */}
      {/* Supersedes the old single-event "Latest score change callout".      */}
      {/* Renders null automatically when there is no Tier-A evidence.        */}
      {evidenceCardProps && (
        <EntityEvidenceCard {...evidenceCardProps} />
      )}

      {/* ── #6 Evidence-tier provenance bar ───────────────────────── */}
      {/* Small chips showing the T1–T4 source mix behind the score.          */}
      {hasTierCounts && tierCounts && (
        <section className="py-4 border-b border-line">
          <Container>
            <div className="flex flex-wrap items-center gap-2 text-[0.82rem]">
              <span className="text-muted font-semibold uppercase tracking-[0.08em] text-[0.72rem]">
                Evidence:
              </span>
              {(["A", "B", "C", "D"] as const).map((tier) => {
                const count = tierCounts[tier];
                if (!count) return null;
                const cfg = TIER_LABELS[tier];
                return (
                  <span
                    key={tier}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[0.72rem] font-semibold"
                    style={{
                      color: cfg.color,
                      borderColor: `${cfg.color}44`,
                      backgroundColor: `${cfg.color}10`,
                    }}
                    title={`${count} ${cfg.label} source${count !== 1 ? "s" : ""}`}
                  >
                    <span
                      className="inline-block w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: cfg.color }}
                      aria-hidden
                    />
                    {count}×{cfg.label}
                  </span>
                );
              })}
            </div>
          </Container>
        </section>
      )}

      {/* ── Floor-designation disclosure ──────────────────────────── */}
      {/* Required "call out why" methodology disclosure for entities whose      */}
      {/* composite resolves at zero. Surfaces documented evidence pattern so a  */}
      {/* reader sees the methodology basis for the floor — never a silent zero. */}
      {entity.floorDesignation && entity.floorDesignation.designated && (
        <section className="py-8 sm:py-10 border-b border-line bg-gradient-to-br from-[rgba(244,63,94,0.08)] via-[rgba(244,63,94,0.04)] to-[rgba(244,63,94,0.02)]">
          <Container>
            <div className="rounded-[18px] border border-[rgba(244,63,94,0.35)] bg-[rgba(15,18,24,0.55)] p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.32)]">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span
                  className="inline-block w-2 h-2 rounded-full bg-[#f43f5e]"
                  aria-hidden
                />
                <p className="text-[0.78rem] uppercase tracking-[0.14em] text-[#f43f5e] font-bold">
                  Floor designation
                </p>
                <span className="text-muted text-[0.78rem]">·</span>
                <span className="text-muted text-[0.82rem]">
                  Designated{" "}
                  <time className="text-text font-medium">
                    {entity.floorDesignation.designatedDate}
                  </time>
                </span>
                <span className="text-muted text-[0.78rem]">·</span>
                <span className="text-muted text-[0.82rem]">
                  Methodology{" "}
                  <span className="text-text font-medium">
                    {entity.floorDesignation.methodologyVersion}
                  </span>
                </span>
              </div>

              <h2 className="text-[1.32rem] sm:text-[1.5rem] font-bold leading-snug mb-3">
                Composite score resolves at zero — methodology disclosure
              </h2>

              <p className="text-text text-[0.98rem] sm:text-[1.02rem] leading-relaxed mb-5">
                {entity.floorDesignation.rationale}
              </p>

              {/* Primary drivers — dimensions where harm pattern is most documented */}
              {entity.floorDesignation.primaryDrivers.length > 0 && (
                <div className="mb-5">
                  <p className="text-[0.78rem] uppercase tracking-[0.12em] text-muted mb-2 font-semibold">
                    Primary drivers
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {entity.floorDesignation.primaryDrivers.map((code) => {
                      const dim = DIMENSIONS.find((d) => d.code === code);
                      const color = dim?.color ?? "#94a3b8";
                      const label = dim?.name ?? code;
                      return (
                        <span
                          key={code}
                          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-[0.78rem] font-semibold"
                          style={{
                            color,
                            borderColor: `${color}55`,
                            backgroundColor: `${color}14`,
                          }}
                          title={label}
                        >
                          <span
                            className="inline-block w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: color }}
                            aria-hidden
                          />
                          {code}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Evidence summary — bullet list of documented patterns */}
              {entity.floorDesignation.evidenceSummary.length > 0 && (
                <div className="mb-5">
                  <p className="text-[0.78rem] uppercase tracking-[0.12em] text-muted mb-2 font-semibold">
                    Documented evidence pattern
                    <span className="text-muted/70 ml-2 font-normal normal-case tracking-normal">
                      ({entity.floorDesignation.evidenceWindow})
                    </span>
                  </p>
                  <ul className="space-y-1.5">
                    {entity.floorDesignation.evidenceSummary.map((item, i) => (
                      <li
                        key={i}
                        className="flex gap-2 text-[0.94rem] text-text leading-snug"
                      >
                        <span
                          className="shrink-0 text-[#f43f5e] font-bold"
                          aria-hidden
                        >
                          ›
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-4 border-t border-[rgba(244,63,94,0.18)] text-[0.85rem] text-muted">
                Floor designation means every dimension resolves at the lowest
                behavioral anchor (1.0/5.0). Entities can exit the floor when
                evidence shows functional improvement against the documented
                pattern.{" "}
                <Link
                  href="/methodology#floor-designation"
                  className="text-[#7dd3fc] hover:underline"
                >
                  Read the methodology
                </Link>
                .
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* ── Latest score change callout — REMOVED ────────────────── */}
      {/* Superseded by EntityEvidenceCard above. The latestChange prop and    */}
      {/* EntityScoreChange type are intentionally preserved for backwards     */}
      {/* compatibility with external callers until confirmed unused.          */}

      {/* ── Dimension bars ─────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 border-b border-line">
        <Container>
          <div className="mb-8">
            <p className="text-[0.82rem] uppercase tracking-[0.12em] text-muted mb-2">
              Compassion framework
            </p>
            <h2 className="text-[1.5rem] sm:text-[1.75rem] font-bold leading-tight mb-2">
              8 dimensions, scored 0–5
            </h2>
            <p className="text-muted max-w-2xl">
              Each dimension rolls up five subdimensions with five-level behavioral anchors. See the{" "}
              <Link href="/methodology" className="text-[#7dd3fc] hover:underline">
                methodology
              </Link>{" "}
              for anchor definitions and weighting.
            </p>
          </div>

          {/* ── #2 Dimension profile bar (compact visual shape) ────── */}
          <div className="mb-6">
            <DimensionProfileBar
              scores={dimProfileScores}
              entityName={entity.name}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {DIMENSIONS.map((dim) => {
              const score = entity.scores[dim.code] ?? 0;
              const pct = scorePct(score);
              // #2 Band color for progress bar (quality encoding, not dimension identity)
              const barColor = bandColorFrom100(pct);
              return (
                <div
                  key={dim.code}
                  className="rounded-[14px] border border-line bg-[rgba(255,255,255,0.03)] p-4 sm:p-5"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        {/* #2 Small dimension-identity dot (dim.color) preserved */}
                        <span
                          className="inline-block w-2 h-2 rounded-full"
                          style={{ backgroundColor: dim.color }}
                          aria-hidden
                        />
                        <h3 className="font-semibold text-[1rem]">{dim.name}</h3>
                      </div>
                      <p className="text-muted text-[0.82rem] leading-snug">{dim.desc}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      {/* Score number colored by band quality */}
                      <div className="text-[1.35rem] font-bold leading-none" style={{ color: barColor }}>
                        {score.toFixed(1)}
                      </div>
                      <div className="text-muted text-[0.7rem]">of 5.0</div>
                    </div>
                  </div>
                  <div
                    className="h-1.5 rounded-full overflow-hidden bg-[rgba(255,255,255,0.06)] mt-2"
                    role="progressbar"
                    aria-valuenow={score}
                    aria-valuemin={0}
                    aria-valuemax={5}
                    aria-label={`${dim.name} score: ${score.toFixed(1)} of 5.0 (${entity.band} band quality)`}
                  >
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: barColor }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── #5 Index band distribution "you are here" ──────────── */}
          {bandCounts && (
            <details className="group mt-8 border border-line rounded-[14px] bg-[rgba(255,255,255,0.02)] overflow-hidden">
              <summary
                className={[
                  "cursor-pointer select-none px-5 py-4",
                  "flex items-center gap-2",
                  "text-[0.85rem] font-semibold text-muted hover:text-text transition-colors",
                  "list-none [&::-webkit-details-marker]:hidden",
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
                How the {config.indexLabel} is distributed
              </summary>
              <div className="px-5 pb-5">
                <p className="text-[0.82rem] text-muted mb-3">
                  Distribution of all {entity.indexTotal.toLocaleString()} entities across five
                  bands. {entity.name} is in the{" "}
                  <span className="text-text font-medium">{entity.band}</span> band.
                </p>
                <BandDistributionBar
                  counts={bandCounts}
                  highlightBand={entity.band}
                  caption={`${config.indexLabel} 2026 · Source: Compassion Benchmark · CC-BY`}
                />
              </div>
            </details>
          )}
        </Container>
      </section>

      {/* ── Entity-scoped CTAs ─────────────────────────────────────── */}
      <section className="py-12 sm:py-16 border-b border-line">
        <Container>
          {/* Primary CTA — Score-Watch Alert (entity-scoped subscription) */}
          <div className="rounded-[20px] border border-[rgba(125,211,252,0.35)] bg-gradient-to-br from-[rgba(125,211,252,0.12)] via-[rgba(125,211,252,0.06)] to-[rgba(125,211,252,0.02)] p-6 sm:p-8 mb-6 shadow-[0_20px_50px_rgba(0,0,0,0.28)]">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <p className="text-[0.78rem] uppercase tracking-[0.12em] text-[#7dd3fc] font-semibold">
                    Score-Watch Alert
                  </p>
                  <span className="px-2 py-0.5 rounded bg-[rgba(125,211,252,0.18)] border border-[rgba(125,211,252,0.35)] text-[#7dd3fc] text-[0.72rem] font-bold uppercase tracking-wider">
                    {SCORE_WATCH.priceShort}
                  </span>
                </div>
                <h3 className="text-[1.32rem] sm:text-[1.5rem] font-bold leading-snug mb-2">
                  Be first to know when {entity.name}&rsquo;s score changes
                </h3>
                <p className="text-muted text-[0.95rem] sm:text-[1rem] max-w-2xl">
                  Email alert the moment overnight research moves {entity.name}&rsquo;s composite
                  score — with the delta, headline evidence, and band change flag. One year of
                  continuous monitoring. Cancel anytime.
                </p>
              </div>
              <div className="shrink-0 flex flex-col gap-2">
                {SCORE_WATCH.useGumroad ? (
                  <Button
                    href={buildScoreWatchUrl(
                      entity.slug,
                      KIND_CONFIG[entity.kind].indexSlug,
                      entity.name,
                    )}
                    variant="primary"
                    external
                    trackAs="score_watch_click"
                    trackData={{
                      entity_slug: entity.slug,
                      entity_kind: entity.kind,
                      entity_name: entity.name,
                    }}
                  >
                    Subscribe — {SCORE_WATCH.priceShort}
                  </Button>
                ) : (
                  // Manual-fulfillment fallback while SCORE_WATCH.useGumroad is false.
                  // We still fire score_watch_click so the leading-indicator funnel
                  // works during the manual-fulfillment phase (otherwise we are
                  // blind to entity-page intent until a sales-form submit fires).
                  <Button
                    href={`/contact-sales?product=score-watch&entity=${encodeURIComponent(entity.slug)}&kind=${encodeURIComponent(entity.kind)}&name=${encodeURIComponent(entity.name)}#inquiry`}
                    variant="primary"
                    trackAs="score_watch_click"
                    trackData={{
                      entity_slug: entity.slug,
                      entity_kind: entity.kind,
                      entity_name: entity.name,
                      fulfillment: "manual",
                    }}
                  >
                    Subscribe — {SCORE_WATCH.priceShort}
                  </Button>
                )}
                <Link
                  href="/score-watch"
                  className="text-[0.82rem] text-muted hover:text-text transition-colors text-center"
                >
                  How it works →
                </Link>
              </div>
            </div>
          </div>

          {/* Badge embed widget */}
          <div className="mb-6">
            <BadgeEmbedWidget
              slug={entity.slug}
              entityKind={entity.kind}
              entityRoute={KIND_CONFIG[entity.kind].route}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Purchase CTA */}
            <div className="rounded-[20px] border border-line bg-gradient-to-b from-[rgba(255,255,255,0.04)] to-[rgba(255,255,255,0.01)] p-6 sm:p-7">
              <p className="text-[0.78rem] uppercase tracking-[0.12em] text-muted mb-2">
                Full dataset
              </p>
              <h3 className="text-[1.2rem] font-bold mb-2">
                {entity.name} is one of {entity.indexTotal.toLocaleString()} {config.labelPlural} in
                the {config.indexLabel}
              </h3>
              <p className="text-muted text-[0.95rem] mb-4">
                Purchase the full index for methodology, sector/peer comparisons, subdimension
                breakdowns, and evidence sources.
              </p>
              <Button
                href={config.gumroadUrl}
                variant="primary"
                external
                trackData={{ entity_slug: entity.slug, entity_name: entity.name }}
              >
                Purchase {config.indexLabel} — {config.gumroadPrice}
              </Button>
            </div>

            {/* Free weekly briefing — secondary */}
            <div className="rounded-[20px] border border-line bg-[rgba(255,255,255,0.03)] p-6 sm:p-7">
              <p className="text-[0.78rem] uppercase tracking-[0.12em] text-muted mb-2">
                Free weekly briefing
              </p>
              <h3 className="text-[1.2rem] font-bold mb-2">
                Free — the Friday briefing
              </h3>
              <p className="text-muted text-[0.95rem] mb-4">
                See it move before your stakeholders do. One email every Friday: the week&apos;s
                biggest score changes, sector trends, and risk signals from overnight research
                across ~1,160 entities. Free. Unsubscribe anytime.
              </p>
              <NewsletterSignup variant="inline-compact" source={`entity-${entity.slug}`} />
            </div>
          </div>
        </Container>
      </section>

      {/* ── Footer nav ─────────────────────────────────────────────── */}
      <section className="py-10">
        <Container>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              href={config.indexRoute}
              className="inline-flex items-center gap-1.5 text-[0.92rem] text-[#7dd3fc] hover:text-text transition-colors font-medium"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back to {config.indexLabel}
            </Link>
            <Link
              href="/methodology"
              className="text-muted hover:text-text text-[0.92rem] transition-colors"
            >
              Read the methodology →
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
