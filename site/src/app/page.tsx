import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import Stat from "@/components/ui/Stat";
import Panel from "@/components/ui/Panel";
import Card from "@/components/ui/Card";
import Pill from "@/components/ui/Pill";
import SectionHead from "@/components/ui/SectionHead";
import Callout from "@/components/ui/Callout";
import Link from "next/link";
import NewsletterSignup from "@/components/ui/NewsletterSignup";
import { DIMENSIONS, INTEGRATION_PREMIUM } from "@/data/dimensions";
import BandDistributionBar from "@/components/charts/BandDistributionBar";
import BandPositionStrip from "@/components/charts/BandPositionStrip";
import ChartFrame from "@/components/charts/ChartFrame";
import ScoreLegend from "@/components/charts/ScoreLegend";
import DimensionRadar from "@/components/charts/DimensionRadar";
import DimensionLegend from "@/components/index/DimensionLegend";
import FaqJsonLd from "@/components/seo/FaqJsonLd";
import FaqAccordion from "@/components/seo/FaqAccordion";
import updatesRaw from "@/data/updates/latest.json";
import { SCORED_ENTITY_COUNT, SCORED_ENTITY_COUNT_FORMATTED } from "@/data/entityCount";
/* eslint-disable @typescript-eslint/no-explicit-any */
const updates = updatesRaw as any;

// ── Defensive compat shim — briefing JSON schema ──────────────────────────────
// The daily briefing JSON schema evolved (May 2026): legacy fields `scoreChanges`
// (array) and `highlights` were replaced with `topSignals` / `recentAssessments`.
// `pipeline.scoreChanges` is now a count, not an array.
// The home page reads only a small subset; fall back gracefully so both schema
// versions render correctly.
const scoreChangesArr: any[] = Array.isArray(updates.scoreChanges)
  ? updates.scoreChanges
  : [];

// Top signals: fall back to topSignals when scoreChangesArr is empty.
// Used for briefing cards when there are no delta events.
const topSignalsArr: any[] = Array.isArray(updates.topSignals)
  ? updates.topSignals
  : [];

// Highlights: legacy highlights array or titles from topSignals.
const highlightsArr: string[] =
  Array.isArray(updates.highlights) && updates.highlights.length > 0
    ? updates.highlights
    : topSignalsArr.slice(0, 3).map((s: any) => s.title).filter(Boolean);

// Pipeline metrics — all from `pipeline` object in the briefing JSON.
const pipelineProposalsCount: number =
  typeof updates.pipeline?.proposalsGenerated === "number"
    ? updates.pipeline.proposalsGenerated
    : typeof updates.pipeline?.scoreChanges === "number"
      ? updates.pipeline.scoreChanges
      : typeof updates.pipeline?.scoreChangesProposed === "number"
        ? updates.pipeline.scoreChangesProposed
        : scoreChangesArr.length;

const pipelineEntitiesScanned: number = updates.pipeline?.entitiesScanned ?? 0;
const pipelineEntitiesAssessed: number = updates.pipeline?.entitiesAssessed ?? 0;

// Briefing date formatted for the section eyebrow.
const briefingDate: string = updates.date ?? "";

// True when the briefing is a zero-change/confirmation-dominant cycle.
const isQuietDay = pipelineProposalsCount === 0 && scoreChangesArr.length === 0;

// Cards to show in the briefing section:
// - When delta events exist, show up to 2 score-change cards.
// - On a quiet day, show up to 2 topSignals cards (no delta styling).
const briefingCards: any[] = scoreChangesArr.length > 0
  ? scoreChangesArr.slice(0, 2)
  : topSignalsArr.slice(0, 2);

// Lead signal for #4 BandPositionStrip — use the first topSignal with a score.
const leadSignal: any | null =
  topSignalsArr.length > 0 ? topSignalsArr[0] : null;

// Extract a score from the lead signal to feed BandPositionStrip.
// Prefer the proposed assessed score; fall back to published; else no strip.
const leadSignalScore: number | null = (() => {
  if (!leadSignal) return null;
  // recentAssessments has the delta scores; cross-reference by slug.
  const recentArr: any[] = Array.isArray(updates.recentAssessments)
    ? updates.recentAssessments
    : [];
  const match = recentArr.find(
    (a: any) => a.slug === leadSignal.slug && a.index === leadSignal.index,
  );
  if (match) {
    // Show assessed score if proposed; else published score.
    if (typeof match.assessed === "number") return match.assessed;
    if (typeof match.published === "number") return match.published;
  }
  return null;
})();

// ── FAQ items — traced to real published data. No fabrication. ────────────────
const homeFaqItems = [
  {
    question: "What is the Compassion Benchmark?",
    answer: `The Compassion Benchmark is an independent benchmark institution that measures how reliably institutions recognize, respond to, and reduce the suffering of the people they affect. It publishes comparative rankings across ${SCORED_ENTITY_COUNT_FORMATTED} entities — governments, corporations, AI labs, cities — re-examined every weekday, sourced from public evidence, free to access.`,
  },
  {
    question: "How are scores calculated?",
    answer: `Every entity is scored across 8 dimensions (Awareness, Empathy, Action, Equity, Boundaries, Accountability, Systemic Thinking, Integrity), each on a 0–5 scale, normalized to a 0–100 composite. Consistency is rewarded: ${INTEGRATION_PREMIUM.short} Scores are derived from public evidence only — not from self-reporting or paid submissions.`,
  },
  {
    question: "What do the bands mean — Critical, Developing, Functional, Established, Exemplary?",
    answer: "The five bands divide the 0–100 scale into equal 20-point segments. Critical (0–20): foundational practices absent or active harm documented. Developing (20–40): some practices emerging but inconsistent. Functional (40–60): core practices exist with significant gaps. Established (60–80): practices systematic, documented, evidenced. Exemplary (80–100): independently verified, consistent, sustained under pressure.",
  },
  {
    question: "How often are scores updated?",
    answer: "The nightly pipeline scans the monitored entity catalog and publishes a daily briefing every weekday. Score changes are proposed when new public evidence crosses the scoring threshold for a dimension change; most days include confirmations (scores held at published values after re-examination) alongside any proposals. The daily briefing is published free on the site.",
  },
];

export const metadata: Metadata = {
  title: { absolute: "Compassion Benchmark | Global Benchmarking for Institutional Compassion" },
  description: "Independent benchmark research measuring how institutions recognize, respond to, and reduce suffering across governments, corporations, AI labs, and robotics.",
};

export default function Home() {
  return (
    <>
      {/* ── JSON-LD: FAQ ──────────────────────────────────────────────────── */}
      {/* #16 — FaqJsonLd rendered alongside FaqAccordion below */}
      <FaqJsonLd items={homeFaqItems} />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="pt-[72px] pb-10">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-[1.12fr_0.88fr] gap-[18px] items-start">
            <div>
              <Eyebrow>Independent benchmark research · no paid rankings</Eyebrow>
              <h1 className="text-[clamp(2.4rem,5vw,4.5rem)] leading-[1.02] tracking-[-0.04em] max-w-[920px] mb-3.5">
                Score how {SCORED_ENTITY_COUNT_FORMATTED} institutions recognize
                and reduce suffering
              </h1>

              {/* #10 — Benefit-first subhead: scope + cadence + cost */}
              <p className="text-text text-[1.05rem] max-w-[800px] mb-2 font-medium">
                Governments, companies, AI labs, and cities &mdash; re-examined
                every weekday, sourced from public evidence, free.
              </p>

              {/* #9 — "Institutional compassion" definition */}
              <p className="text-muted text-[0.97rem] max-w-[800px] mb-1.5">
                <strong className="text-text">Institutional compassion</strong>{" "}
                is how reliably an institution recognizes, responds to, and
                reduces the suffering of the people it affects. The benchmark
                makes this measurable, comparable, and difficult to fake.
              </p>

              {/* #14 — Independence statement elevated into hero */}
              <p className="text-muted text-[0.88rem] max-w-[800px] mb-3">
                No entity pays for inclusion, score changes, or suppression of
                findings.{" "}
                <Link
                  href="/about"
                  className="text-accent hover:underline"
                >
                  About the institution &rarr;
                </Link>
              </p>

              {/* #2 — Live briefing teaser in the hero */}
              {briefingDate && (
                <p className="text-muted text-[0.9rem] mb-[22px] border-l-2 border-accent pl-3">
                  <span className="text-accent font-semibold">
                    {briefingDate}
                  </span>{" "}
                  &mdash;{" "}
                  <span>
                    {typeof updates.headline === "string" && updates.headline.length > 0
                      ? updates.headline
                      : "Today's briefing is available."}
                  </span>
                </p>
              )}

              {/* #3 — Three-tier CTA; collapsed duplicate /updates CTAs into one */}
              <div className="flex gap-3 flex-wrap mt-1">
                {/* Primary */}
                <Button
                  href={briefingDate ? `/updates/${briefingDate}` : "/updates"}
                  variant="primary"
                >
                  Read today&apos;s briefing &rarr;
                </Button>
                {/* Secondary */}
                <Button href="/methodology">How the benchmark works</Button>
              </div>
              {/* Tertiary text-link */}
              <p className="mt-3">
                <Link
                  href="/indexes"
                  className="text-muted text-[0.9rem] hover:text-text underline underline-offset-2 decoration-dotted"
                >
                  Browse the 7 indexes &rarr;
                </Link>
              </p>

              {/* Stats row — #15: use derived count consistently for the scored count */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
                <Stat value={SCORED_ENTITY_COUNT_FORMATTED} label="Entities currently ranked and scored" />
                <Stat value="7" label="Published index families" />
                <Stat value="8" label="Core benchmark dimensions" />
                <Stat value="40" label="Subdimensions in full standard" />
              </div>
            </div>

            {/* #18 — Hero index rows are now clickable via Link wrappers */}
            <Panel>
              <h3 className="text-[1.08rem] font-bold mb-2.5">
                Current publication set
              </h3>
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">
                      Index
                    </th>
                    <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">
                      Coverage
                    </th>
                  </tr>
                </thead>
                <tbody className="text-muted">
                  {[
                    { label: "World Countries",       coverage: "207 countries and territories",        href: "/countries" },
                    { label: "U.S. States",           coverage: "50 states and the District of Columbia", href: "/us-states" },
                    { label: "Fortune 500",           coverage: "447 published company rankings",        href: "/fortune-500" },
                    { label: "AI Labs",               coverage: "50 leading AI labs",                    href: "/ai-labs" },
                    { label: "Humanoid Robotics Labs",coverage: "Top 50 global labs",                    href: "/robotics-labs" },
                    { label: "U.S. Cities",           coverage: "Top 150 American cities",               href: "/us-cities" },
                    { label: "Global Cities",         coverage: "Top 250 cities worldwide",              href: "/global-cities" },
                  ].map(({ label, coverage, href }) => (
                    <tr
                      key={label}
                      className="hover:bg-[rgba(255,255,255,0.03)] transition-colors"
                    >
                      <td className="py-3 px-2.5 border-b border-line text-text">
                        <Link href={href} className="hover:text-accent transition-colors">
                          {label}
                        </Link>
                      </td>
                      <td className="py-3 px-2.5 border-b border-line">
                        {coverage}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-muted mt-3 text-[0.82rem]">
                Public rankings are independent. Commercial offerings support
                access and interpretation &mdash; never paid score changes.
              </p>
            </Panel>
          </div>
        </Container>
      </section>

      {/* ── Section 2: Today's briefing (ALWAYS-ON) ──────────────────────── */}
      {/* #1 + #2 + #3 — Rendered unconditionally. Leads with the real headline.
          Falls back to topSignals when there are no delta events.
          On a zero-change day shows a calm confirmation line, not alarm. */}
      <section className="py-[30px]">
        <Container>
          <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
            <div>
              {/* #3 — Relabeled eyebrow with date */}
              <Eyebrow>
                Today&apos;s briefing
                {briefingDate ? ` · ${briefingDate}` : ""}
              </Eyebrow>
              {/* #3 — Full, untruncated real headline as section dek */}
              {typeof updates.headline === "string" && updates.headline.length > 0 && (
                <p className="text-muted text-[0.93rem] leading-relaxed mt-1 max-w-[860px]">
                  {updates.headline}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3 flex-wrap shrink-0">
              {/* #20 — Pipeline vocabulary defined inline so "0 changes" reads as rigor */}
              <span className="text-muted text-[0.88rem]" title="scanned = nightly pipeline coverage · assessed = entities reviewed in this cycle · changes = score proposals passing the evidence threshold">
                {isQuietDay ? (
                  <>
                    {pipelineEntitiesScanned > 0
                      ? `${pipelineEntitiesScanned.toLocaleString()} scanned`
                      : "Entities scanned"}
                    {pipelineEntitiesAssessed > 0
                      ? ` · ${pipelineEntitiesAssessed} assessed`
                      : ""}
                    {" · 0 changes — all confirmed"}
                  </>
                ) : (
                  <>
                    {pipelineEntitiesScanned > 0
                      ? `${pipelineEntitiesScanned.toLocaleString()} scanned · `
                      : ""}
                    {pipelineEntitiesAssessed} assessed &middot;{" "}
                    {pipelineProposalsCount}{" "}
                    {pipelineProposalsCount === 1 ? "change" : "changes"}
                  </>
                )}
              </span>
              {/* #3 — Single benefit-framed CTA; no duplicate /updates links */}
              <Link
                href={briefingDate ? `/updates/${briefingDate}` : "/updates"}
                className="text-accent text-[0.9rem] font-semibold hover:underline shrink-0"
              >
                Full briefing &rarr;
              </Link>
            </div>
          </div>

          {/* Briefing cards */}
          {briefingCards.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
              {scoreChangesArr.length > 0
                ? /* Delta cards — red/green ONLY when there are real non-zero deltas */
                  (briefingCards as Record<string, unknown>[]).map((change) => (
                    <div
                      key={change.slug as string}
                      className="rounded-[16px] border p-4"
                      style={{
                        borderColor:
                          (change.delta as number) < 0
                            ? "rgba(248,113,113,0.3)"
                            : "rgba(134,239,172,0.3)",
                        background:
                          (change.delta as number) < 0
                            ? "linear-gradient(135deg, rgba(248,113,113,0.06), rgba(8,12,24,0.5))"
                            : "linear-gradient(135deg, rgba(134,239,172,0.06), rgba(8,12,24,0.5))",
                      }}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <h3 className="font-bold text-[1.02rem] leading-tight">
                            {change.entity as string}
                          </h3>
                          <span className="text-muted text-[0.8rem]">
                            {(change.index as string)
                              ?.replace(/-/g, " ")
                              .replace(/\b\w/g, (c: string) => c.toUpperCase())}
                          </span>
                        </div>
                        <span
                          className="text-[1.3rem] font-bold leading-none shrink-0"
                          style={{
                            color:
                              (change.delta as number) < 0 ? "#f87171" : "#86efac",
                          }}
                        >
                          {(change.delta as number) > 0 ? "+" : ""}
                          {change.delta as number}
                        </span>
                      </div>
                      <p className="text-muted text-[0.88rem] leading-relaxed mb-2">
                        {((change.headline as string) ?? "").substring(0, 140)}
                        {((change.headline as string) ?? "").length > 140
                          ? "…"
                          : ""}
                      </p>
                      <div className="text-[0.8rem] text-muted">
                        {change.publishedScore as number} &rarr;{" "}
                        {change.assessedScore as number}
                        {Boolean(change.bandChange) && (
                          <span className="ml-2" style={{ color: "#f87171" }}>
                            Band change: {change.publishedBand as string} &rarr;{" "}
                            {change.assessedBand as string}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                : /* Quiet-day / signal cards — neutral styling, no delta color */
                  (briefingCards as Record<string, unknown>[]).map(
                    (signal, idx) => (
                      <div
                        key={(signal.slug as string) ?? String(idx)}
                        className="rounded-[16px] border border-[rgba(125,211,252,0.15)] bg-[rgba(255,255,255,0.02)] p-4"
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="min-w-0">
                            <span
                              className="inline-block text-[0.72rem] font-bold uppercase tracking-widest mb-1"
                              style={{ color: "#7dd3fc" }}
                            >
                              {typeof signal.actionType === "string"
                                ? (signal.actionType as string).replace(/-/g, " ")
                                : "confirmed"}
                            </span>
                            <h3 className="font-semibold text-[0.95rem] leading-snug">
                              {signal.title as string}
                            </h3>
                          </div>
                          {typeof signal.severity === "string" && (
                            <span className="text-[0.72rem] font-bold uppercase tracking-widest text-muted shrink-0">
                              {signal.severity}
                            </span>
                          )}
                        </div>
                        {typeof signal.description === "string" && (
                          <p className="text-muted text-[0.85rem] leading-relaxed">
                            {(signal.description as string).substring(0, 180)}
                            {(signal.description as string).length > 180
                              ? "…"
                              : ""}
                          </p>
                        )}
                      </div>
                    ),
                  )}
            </div>
          )}

          {/* Highlight strip — shown when there are highlights and no delta cards */}
          {highlightsArr.length > 0 && scoreChangesArr.length === 0 && briefingCards.length === 0 && (
            <div className="rounded-[16px] border border-[rgba(125,211,252,0.18)] bg-[rgba(125,211,252,0.04)] p-4">
              <div className="text-[0.78rem] font-bold uppercase tracking-widest text-accent mb-1.5">
                Highlight
              </div>
              <p className="text-[0.93rem] leading-relaxed">{highlightsArr[0]}</p>
            </div>
          )}

          {/* #4 — BandPositionStrip on the lead signal's score */}
          {leadSignalScore !== null && leadSignal && (
            <div className="mt-4 rounded-[14px] border border-[rgba(125,211,252,0.12)] bg-[rgba(255,255,255,0.02)] p-4">
              <p className="text-[0.78rem] font-bold uppercase tracking-widest text-accent mb-3">
                Lead signal score position
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-[0.88rem] font-semibold text-text leading-snug mb-1">
                    {leadSignal.title as string}
                  </p>
                  <p className="text-muted text-[0.78rem]">
                    {(leadSignal.index as string)
                      ?.replace(/-/g, " ")
                      .replace(/\b\w/g, (c: string) => c.toUpperCase())}
                    {" "}&mdash;{" "}
                    <span className="italic">
                      score position on the 0–100 band scale (Critical · Developing · Functional · Established · Exemplary)
                    </span>
                  </p>
                </div>
                <div className="shrink-0">
                  <BandPositionStrip
                    score={leadSignalScore}
                    entityName={
                      typeof leadSignal.title === "string"
                        ? (leadSignal.title as string).split(" ")[0]
                        : "Entity"
                    }
                    compact
                  />
                </div>
              </div>
            </div>
          )}

          {/* #19 — Newsletter at intent peak post-briefing */}
          <div className="mt-6">
            <NewsletterSignup
              variant="card"
              source="homepage-post-briefing"
              preamble="Liked today's briefing? Get the Friday email — free."
            />
          </div>
        </Container>
      </section>

      {/* ── Section 3: How the benchmark works (moved up from ~§8 per #7) ─── */}
      {/* #7 — Framework panel before the charts that use band terms.
          #8 — "Difficult to fake" claim now substantiated with INTEGRATION_PREMIUM.short. */}
      <section id="how-it-works" className="py-[30px] scroll-mt-20">
        <Container className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-2.5">
              How the benchmark works
            </h3>
            {/* #11 — Dimensions are named; each is defined by DimensionLegend below */}
            <p className="text-muted mb-3">
              The framework measures institutions across eight dimensions:{" "}
              {DIMENSIONS.map((d, i) => (
                <span key={d.code}>
                  <span
                    className="font-bold"
                    style={{ color: d.color }}
                    title={d.desc}
                  >
                    {d.name}
                  </span>
                  {i < DIMENSIONS.length - 2 ? ", " : i === DIMENSIONS.length - 2 ? ", and " : "."}
                </span>
              ))}
            </p>
            <p className="text-muted mb-3">
              Published scores are derived from public evidence and normalized
              to a 0&ndash;100 scale. {INTEGRATION_PREMIUM.short}
            </p>
            {/* #8 — Micro-teaser: substantiates "difficult to fake" */}
            <p className="text-muted text-[0.88rem] mb-3 border-l-2 border-[rgba(125,211,252,0.3)] pl-3">
              <strong className="text-text">Why it&apos;s difficult to fake:</strong>{" "}
              {INTEGRATION_PREMIUM.short} A single dimension at zero (documented
              active harm) cancels the consistency bonus, so surface-level improvements
              without addressing root failures do not improve the composite.{" "}
              <Link href="/methodology" className="text-accent hover:underline">
                Full scoring methodology &rarr;
              </Link>
            </p>
            <Button href="/methodology" variant="primary">
              View methodology
            </Button>
          </Panel>
          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-2.5">
              Current research program
            </h3>
            <p className="text-muted mb-3">
              The benchmark has moved from concept to active publication. The
              current program includes live index reports, a formal methodology,
              a broader 40-subdimension standard, and an operating model for
              future data products, certified assessments, and enterprise
              benchmark services.
            </p>
            <Button href="/research" variant="primary">
              Explore research
            </Button>
          </Panel>
        </Container>
      </section>

      {/* ── State of the field: flagship callout merged with master bar (#18) */}
      {/* #12 — Inline definitions for "modal" and "90.5% equity gap" */}
      <section id="state-of-field" className="py-[30px] scroll-mt-20">
        <Container>
          <SectionHead
            title="The state of institutional compassion"
            description={`Of ${SCORED_ENTITY_COUNT_FORMATTED} entities benchmarked across governments, corporations, AI labs, and cities — most cluster in the middle. The chart below shows band distribution across the full catalog.`}
          />

          {/* Flagship callout — merged with master bar context */}
          <div className="rounded-[16px] border border-[rgba(125,211,252,0.15)] bg-[rgba(125,211,252,0.03)] p-5 mb-6">
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-accent mb-1.5">
              Flagship Annual Report &mdash; 2026
            </p>
            <h2 className="text-[clamp(1.05rem,2vw,1.35rem)] font-bold tracking-[-0.02em] leading-tight mb-1.5">
              The State of Institutional Compassion &mdash; 2026
            </h2>
            {/* #12 — "modal" and "90.5% equity gap" are now defined inline */}
            <p className="text-muted text-[0.93rem] leading-relaxed max-w-[700px] mb-3">
              Across {SCORED_ENTITY_COUNT_FORMATTED} institutions, the{" "}
              <span
                className="text-text font-semibold"
                title="modal = the most common result — where the most entities cluster"
              >
                modal result
              </span>{" "}
              (the band containing the most entities) is mediocrity &mdash; 67.7%
              cluster in the Functional band (40&ndash;60) on the chart below. A{" "}
              <span
                className="text-text font-semibold"
                title="equity gap = the difference in average scores between the top and bottom 10% of entities, expressed as a percentage of the scale"
              >
                90.5% equity gap
              </span>{" "}
              persists at the bottom of every index family, meaning the best-scoring
              entities score nearly 90 points higher than the lowest-scoring ones.
            </p>
            <Button
              href="/updates/special/state-of-institutional-compassion-2026"
              variant="primary"
            >
              Read the 2026 report &rarr;
            </Button>
          </div>

          {/* Master bar */}
          <ChartFrame
            id="all-bands-chart"
            title="Band distribution — all entities"
            dek={`${SCORED_ENTITY_COUNT_FORMATTED} institutions. Each segment shows the share in that band. Read left-to-right: Critical (0–20) to Exemplary (80–100).`}
            path="/"
          >
            <BandDistributionBar index="all" />
          </ChartFrame>
          {/* #5 — ScoreLegend (band scale + 8-dimension glossary) under the master bar */}
          <div className="mt-4 border-t border-[rgba(255,255,255,0.07)] pt-4">
            <ScoreLegend />
          </div>
        </Container>
      </section>

      {/* ── #6 — Dimension-radar framework primer ────────────────────────── */}
      {/* Near the top, after hero/briefing/state-of-field, before small-multiples.
          Uses DimensionRadar in framework mode (representative shape, not a scored
          entity) + DimensionLegend so a first-timer instantly sees what the 8
          dimensions are. Own-data / own-framework, CC-BY. */}
      <section id="framework-primer" className="py-[30px] scroll-mt-20">
        <Container>
          <SectionHead
            title="The 8 dimensions of institutional compassion"
            description="Every entity is scored across the same 8 dimensions — from awareness of suffering to structural integrity. Together they define what it means to institutionally reduce harm."
          />
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start">
            {/* Radar in framework mode — clearly labeled as representative */}
            <div>
              <ChartFrame
                title="The 8 dimensions"
                dek="Framework diagram — representative shape, not a scored entity. Each axis scored 0–5."
                path="/"
              >
                <DimensionRadar
                  scores={Object.fromEntries(DIMENSIONS.map((d) => [d.code, 3.5]))}
                  entityName="Framework (representative)"
                  band="Functional"
                  ariaLabel={`The 8 compassion dimensions: ${DIMENSIONS.map((d) => `${d.name} (${d.code})`).join(", ")}. Each scored 0–5. This is a representative shape showing the framework structure, not a real entity score.`}
                  caption="Framework diagram — representative shape only, not a scored entity. Source: Compassion Benchmark · CC-BY"
                />
              </ChartFrame>
            </div>

            {/* #11 — Dimension glossary with color-coded names */}
            <div>
              <DimensionLegend />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                {DIMENSIONS.map((dim) => (
                  <div
                    key={dim.code}
                    className="rounded-[12px] border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)] px-3 py-2.5"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: dim.color }}
                        aria-hidden="true"
                      />
                      <span
                        className="font-bold text-[0.82rem]"
                        style={{ color: dim.color }}
                      >
                        {dim.code}
                      </span>
                      <span className="font-semibold text-[0.82rem] text-text">
                        {dim.name}
                      </span>
                    </div>
                    <p className="text-muted text-[0.78rem] leading-relaxed">
                      {dim.desc}
                    </p>
                  </div>
                ))}
              </div>
              <p className="text-[0.72rem] text-muted mt-3">
                <Link
                  href="/methodology"
                  className="text-accent hover:underline"
                >
                  Full methodology &rarr;
                </Link>{" "}
                &middot; Source: Compassion Benchmark &middot; CC-BY
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Seven indexes at a glance (small-multiples — moved after primer per #18) */}
      {/* #13 — One shared legend strip replaces 7 per-card legends.
               One-line "how to read" header + one-line takeaway per card. */}
      <section id="indexes-at-a-glance" className="py-[20px] scroll-mt-20">
        <Container>
          <SectionHead
            title="Seven indexes at a glance"
            description="How to read: each bar shows the share of entities in each band — Critical (red) → Developing → Functional → Established → Exemplary (blue). Sorted by share in the top two bands."
          />
          {/* Shared legend — one instance, not repeated per card (#13) */}
          <div className="flex flex-wrap gap-3 mb-4 text-[0.78rem] text-muted items-center">
            <span className="font-semibold text-text text-[0.8rem]">Shared band legend:</span>
            {[
              { label: "Critical", color: "#f87171" },
              { label: "Developing", color: "#fb923c" },
              { label: "Functional", color: "#fcd34d" },
              { label: "Established", color: "#86efac" },
              { label: "Exemplary", color: "#7dd3fc" },
            ].map((b) => (
              <span key={b.label} className="flex items-center gap-1.5">
                <span
                  className="inline-block w-3 h-3 rounded-sm"
                  style={{ backgroundColor: b.color, opacity: 0.7 }}
                  aria-hidden="true"
                />
                {b.label}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { slug: "robotics-labs", label: "Humanoid Robotics Labs", href: "/robotics-labs",  takeaway: "Earliest-stage sector — most labs in Developing." },
              { slug: "ai-labs",       label: "AI Labs",                 href: "/ai-labs",        takeaway: "No lab yet reaches Established; safety gaps dominate." },
              { slug: "global-cities", label: "Global Cities",           href: "/global-cities",  takeaway: "Cities cluster in Functional; equity drives variance." },
              { slug: "us-cities",     label: "U.S. Cities",             href: "/us-cities",      takeaway: "U.S. cities span all five bands; regional spread is wide." },
              { slug: "countries",     label: "World Countries",         href: "/countries",       takeaway: "Most countries in Developing; Critical band is large." },
              { slug: "fortune-500",   label: "Fortune 500",             href: "/fortune-500",     takeaway: "Corporations cluster in Developing–Functional; top band rare." },
              { slug: "us-states",     label: "U.S. States",             href: "/us-states",       takeaway: "States span Developing through Established; no Exemplary." },
            ].map((idx) => (
              <div key={idx.slug} className="bg-[rgba(255,255,255,0.02)] border border-line rounded-[14px] p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[0.86rem] font-semibold text-text">{idx.label}</span>
                  <Link
                    href={idx.href}
                    className="text-accent text-[0.78rem] font-semibold hover:underline"
                  >
                    View index &rarr;
                  </Link>
                </div>
                {/* #13 — One-line takeaway per card */}
                <p className="text-muted text-[0.75rem] mb-2 italic">{idx.takeaway}</p>
                <BandDistributionBar index={idx.slug} />
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Published indexes grid ──────────────────────────────────────────── */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="Published indexes"
            description="The benchmark currently publishes seven index families covering governments, public systems, corporations, cities, and frontier technology institutions."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                href: "/countries",
                pills: ["2026", "Governments"],
                title: "World Countries Index",
                desc: "Comparative benchmark of 207 countries and territories across the full institutional compassion framework.",
              },
              {
                href: "/us-states",
                pills: ["2026", "Public Systems"],
                title: "United States Index",
                desc: "All 50 states and DC benchmarked across policy, equity, accountability, and structural care capacity.",
              },
              {
                href: "/fortune-500",
                pills: ["2026", "Corporations"],
                title: "Fortune 500 Index",
                desc: "Comparative benchmark of the largest corporations using public evidence, governance signals, and institutional behavior.",
              },
              {
                href: "/ai-labs",
                pills: ["2026", "AI"],
                title: "AI Labs Index",
                desc: "Leading AI labs evaluated across safety, accountability, deployment boundaries, equity, and integrity.",
              },
              {
                href: "/robotics-labs",
                pills: ["2026", "Robotics"],
                title: "Humanoid Robotics Labs Index",
                desc: "Top global humanoid robotics labs benchmarked across healthcare, labor, accessibility, governance, and deployment risk.",
              },
              {
                href: "/us-cities",
                pills: ["2026", "Cities"],
                title: "U.S. Cities Index",
                desc: "Top American cities benchmarked across governance, equity, healthcare access, and structural care capacity.",
              },
              {
                href: "/global-cities",
                pills: ["2026", "Cities"],
                title: "Global Cities Index",
                desc: "250 cities worldwide benchmarked across governance, equity, healthcare, and institutional compassion.",
              },
              {
                href: "/indexes",
                pills: ["Directory", "Navigation"],
                title: "All Indexes",
                desc: "Browse the full benchmark index library, summaries, and publication pages from one central location.",
              },
            ].map((item) => (
              <Card key={item.href} href={item.href}>
                <div className="flex gap-2.5 flex-wrap mb-3">
                  {item.pills.map((p) => (
                    <Pill key={p}>{p}</Pill>
                  ))}
                </div>
                <h3 className="text-[1.08rem] font-bold mb-2">{item.title}</h3>
                <p className="text-muted">{item.desc}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Who it's for (personas — moved before services per #18) ──────── */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="Who the benchmark is for"
            description="The platform is designed for high-seriousness users who need more than narrative claims and less than empty ESG theater."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: "Executives and Boards",
                desc: "Use the benchmark to understand institutional posture, peer position, and governance implications.",
                href: "/advisory",
              },
              {
                title: "Researchers and Journalists",
                desc: "Use published benchmark work for comparative analysis, public reporting, and sector interpretation.",
                href: "/purchase-research",
              },
              {
                title: "Policy and Public Leaders",
                desc: "Use benchmark findings to compare public systems, regional performance, and structural policy tradeoffs.",
                href: "/countries",
              },
              {
                title: "AI and Robotics Leaders",
                desc: "Use sector benchmarks to understand deployment risks, governance gaps, and leadership differentiation.",
                href: "/ai-labs",
              },
            ].map((item) => (
              <Card key={item.title} href={item.href}>
                <h3 className="text-[1.08rem] font-bold mb-2">{item.title}</h3>
                <p className="text-muted">{item.desc}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Services ────────────────────────────────────────────────────────── */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="Services"
            description="The commercial model is built around access, interpretation, licensing, assessment, and institutional support — never paid score manipulation."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                href: "/purchase-research",
                pills: ["Research", "Self-Serve"],
                title: "Purchase Research",
                desc: "Buy benchmark reports by year and target area, including premium PDF packaging, bundles, and institutional report formats.",
              },
              {
                href: "/data-licenses",
                pills: ["Data", "Licensing"],
                title: "Data Licenses",
                desc: "License structured benchmark datasets, annual bundles, and institutional data rights for internal or academic use.",
              },
              {
                href: "/advisory",
                pills: ["Advisory", "Interpretation"],
                title: "Advisory Consulting",
                desc: "Book private briefings, comparison memos, executive sessions, and strategic interpretation built on the published benchmark.",
              },
              {
                href: "/certified-assessments",
                pills: ["Assessment", "Formal Review"],
                title: "Certified Assessments",
                desc: "Engage a structured assessor-led process for formal benchmark review, findings delivery, and improvement guidance.",
              },
              {
                href: "/enterprise",
                pills: ["Enterprise", "Institutional"],
                title: "Enterprise Agreements",
                desc: "Combine research access, data licensing, advisory support, and assessment services into a recurring institutional relationship.",
              },
              {
                href: "/contact-sales",
                pills: ["Sales", "Routing"],
                title: "Contact Sales",
                desc: "Discuss the right benchmark product, service, or institutional arrangement for your team, organization, or research need.",
              },
            ].map((item) => (
              <Card key={item.href} href={item.href} variant="service">
                <div className="flex gap-2.5 flex-wrap">
                  {item.pills.map((p) => (
                    <Pill key={p}>{p}</Pill>
                  ))}
                </div>
                <h3 className="text-[1.12rem] font-bold">{item.title}</h3>
                <p className="text-muted">{item.desc}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Independence policy ─────────────────────────────────────────────── */}
      <section className="py-[30px]">
        <Container>
          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-2.5">
              Independence policy
            </h3>
            <ul className="list-disc pl-[18px] text-muted space-y-2">
              <li>Entities do not pay to be included in an index</li>
              <li>Entities do not pay to improve their score or rank</li>
              <li>Commercial services do not suppress public findings</li>
              <li>
                Benchmark methodology is not sold to fit a preferred outcome
              </li>
              <li>
                Paid offerings support access, interpretation, review, and
                institutional use
              </li>
            </ul>
          </Panel>
        </Container>
      </section>

      {/* ── FAQ — answer-first definition block (#16) ───────────────────────── */}
      {/* FaqJsonLd is rendered at the top of the page (before the <section> tree).
          FaqAccordion renders the same items visibly for users + crawlers. */}
      <section id="faq" className="py-[30px] scroll-mt-20">
        <Container>
          <FaqAccordion
            items={homeFaqItems}
            heading="What is the Compassion Benchmark?"
          />
          {/* #20 — Link to /about */}
          <p className="text-[0.85rem] text-muted mt-4">
            <Link href="/about" className="text-accent hover:underline">
              About the institution &rarr;
            </Link>
            {" "}&middot;{" "}
            {briefingDate && (
              <>
                <Link
                  href={`/updates/${briefingDate}`}
                  className="text-accent hover:underline"
                >
                  Today&apos;s briefing ({briefingDate}) &rarr;
                </Link>
                {" "}&middot;{" "}
              </>
            )}
            <Link href="/methodology" className="text-accent hover:underline">
              Methodology &rarr;
            </Link>
          </p>
        </Container>
      </section>

      {/* ── Final CTA: daily-habit close (#19) ─────────────────────────────── */}
      {/* #19 — Converted from "Explore Indexes / Contact Sales" to daily-habit close */}
      <section className="py-[30px]">
        <Container>
          <Callout>
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] mb-2">
              The benchmark updates every weekday. Come back tomorrow.
            </h2>
            <p className="text-muted max-w-[900px] mb-[18px]">
              Each day&apos;s briefing covers which entities were scanned,
              which were assessed, and which crossed a scoring threshold &mdash;
              with the evidence. Free, on the site. Or get the Friday weekly
              highlights by email.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Button
                href={briefingDate ? `/updates/${briefingDate}` : "/updates"}
                variant="primary"
              >
                Today&apos;s briefing &rarr;
              </Button>
              <Button href="/indexes">Browse indexes</Button>
            </div>
          </Callout>
        </Container>
      </section>
    </>
  );
}
