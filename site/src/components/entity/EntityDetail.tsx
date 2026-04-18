import Link from "next/link";
import Container from "@/components/ui/Container";
import Band, { BandLevel } from "@/components/ui/Band";
import Button from "@/components/ui/Button";
import NewsletterSignup from "@/components/ui/NewsletterSignup";
import Panel from "@/components/ui/Panel";
import { DIMENSIONS } from "@/data/dimensions";
import { Entity, KIND_CONFIG } from "@/data/entities";

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

interface Props {
  entity: Entity;
  /** Most recent score change across the updates feed, if any. */
  latestChange?: EntityScoreChange | null;
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

export default function EntityDetail({ entity, latestChange }: Props) {
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

            {/* Newsletter CTA — entity-scoped */}
            <div className="rounded-[20px] border border-line bg-gradient-to-b from-[rgba(125,211,252,0.06)] to-[rgba(125,211,252,0.02)] p-6 sm:p-7">
              <p className="text-[0.78rem] uppercase tracking-[0.12em] text-muted mb-2">
                Get notified
              </p>
              <h3 className="text-[1.2rem] font-bold mb-2">
                Be first to know when {entity.name}&rsquo;s score changes
              </h3>
              <p className="text-muted text-[0.95rem] mb-4">
                Join the weekly benchmark briefing — score changes, sector trends, and emerging risk
                signals from overnight research across 1,155 entities.
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
