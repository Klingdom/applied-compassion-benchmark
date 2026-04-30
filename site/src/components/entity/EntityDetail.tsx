import Link from "next/link";
import Container from "@/components/ui/Container";
import Band, { BandLevel } from "@/components/ui/Band";
import Button from "@/components/ui/Button";
import NewsletterSignup from "@/components/ui/NewsletterSignup";
import Panel from "@/components/ui/Panel";
import { DIMENSIONS } from "@/data/dimensions";
import { Entity, KIND_CONFIG } from "@/data/entities";
import { GUMROAD, SCORE_WATCH } from "@/data/gumroad";

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

interface Props {
  entity: Entity;
  /** Most recent score change across the updates feed, if any. */
  latestChange?: EntityScoreChange | null;
  /** Most recent overnight-scanner evidence review for this entity, if any. */
  evidenceReview?: EntityEvidenceReview | null;
  /** Scanner lookback window in days (default 14). */
  lookbackWindowDays?: number;
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

export default function EntityDetail({
  entity,
  latestChange,
  evidenceReview,
  lookbackWindowDays = 14,
}: Props) {
  const config = KIND_CONFIG[entity.kind];
  const bandLevel = entity.band.toLowerCase() as BandLevel;

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
            </div>

            <div className="shrink-0 rounded-[18px] border border-line bg-[rgba(255,255,255,0.03)] px-6 py-5 text-center min-w-[180px]">
              <div className="text-[0.78rem] uppercase tracking-[0.12em] text-muted mb-1">
                Composite score
              </div>
              <div className="text-[2.6rem] font-bold leading-none">{entity.composite.toFixed(1)}</div>
              <div className="text-muted text-[0.82rem] mt-1">out of 100</div>
            </div>
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

      {/* ── Latest score change callout ───────────────────────────── */}
      {latestChange && (
        <section className="py-8 border-b border-line bg-[rgba(255,255,255,0.02)]">
          <Container>
            <Panel>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-[0.82rem] text-muted mb-2">
                    <span className="uppercase tracking-[0.1em] font-semibold text-[#7dd3fc]">
                      Latest research update
                    </span>
                    <span aria-hidden>·</span>
                    <time>{latestChange.date}</time>
                    <span aria-hidden>·</span>
                    <span>
                      {latestChange.delta >= 0 ? "+" : ""}
                      {latestChange.delta.toFixed(1)} delta
                    </span>
                    {latestChange.bandChange && (
                      <span className="px-1.5 py-0.5 rounded bg-[rgba(251,146,60,0.12)] border border-[rgba(251,146,60,0.25)] text-[#fb923c] text-[0.72rem] font-semibold uppercase">
                        Band change
                      </span>
                    )}
                  </div>
                  <p className="text-text text-[1.02rem] leading-snug">{latestChange.headline}</p>
                </div>
                <Link
                  href={`/updates/${latestChange.date}`}
                  className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-[10px] border border-line text-[0.88rem] text-text hover:bg-[rgba(255,255,255,0.04)] transition-colors"
                >
                  View briefing
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </div>
            </Panel>
          </Container>
        </section>
      )}

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {DIMENSIONS.map((dim) => {
              const score = entity.scores[dim.code] ?? 0;
              const pct = scorePct(score);
              return (
                <div
                  key={dim.code}
                  className="rounded-[14px] border border-line bg-[rgba(255,255,255,0.03)] p-4 sm:p-5"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
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
                      <div className="text-[1.35rem] font-bold leading-none" style={{ color: dim.color }}>
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
                    aria-label={`${dim.name} score`}
                  >
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: dim.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
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
                    href={`${GUMROAD.scoreWatch}?entity=${entity.slug}`}
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
                  <Button
                    href={`/contact-sales?product=score-watch&entity=${encodeURIComponent(entity.slug)}&kind=${encodeURIComponent(entity.kind)}&name=${encodeURIComponent(entity.name)}#inquiry`}
                    variant="primary"
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
                Every Monday: the benchmark digest
              </h3>
              <p className="text-muted text-[0.95rem] mb-4">
                Score changes, sector trends, and emerging risk signals from overnight research
                across 1,155 entities. Free. Unsubscribe anytime.
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
