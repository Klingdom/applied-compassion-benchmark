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
import ChartFrame from "@/components/charts/ChartFrame";
import ScoreLegend from "@/components/charts/ScoreLegend";
import DimensionRadar from "@/components/charts/DimensionRadar";
import DimensionLegend from "@/components/index/DimensionLegend";
import updatesRaw from "@/data/updates/latest.json";
// Index JSON imports — used to derive the canonical scored-entity count at build time.
import countriesData from "@/data/indexes/countries.json";
import fortune500Data from "@/data/indexes/fortune-500.json";
import globalCitiesData from "@/data/indexes/global-cities.json";
import aiLabsData from "@/data/indexes/ai-labs.json";
import roboticsLabsData from "@/data/indexes/robotics-labs.json";
import usStatesData from "@/data/indexes/us-states.json";
import usCitiesData from "@/data/indexes/us-cities.json";
/* eslint-disable @typescript-eslint/no-explicit-any */
const updates = updatesRaw as any;

// ── Canonical scored-entity count — derived from index data, not hardcoded. ───
// The 7 published indexes are the single source of truth for how many entities
// are ranked and scored. This total is the "1,156 entities" figure.
const SCORED_ENTITY_COUNT: number =
  (countriesData as { rankings: unknown[] }).rankings.length +
  (fortune500Data as { rankings: unknown[] }).rankings.length +
  (globalCitiesData as { rankings: unknown[] }).rankings.length +
  (aiLabsData as { rankings: unknown[] }).rankings.length +
  (roboticsLabsData as { rankings: unknown[] }).rankings.length +
  (usStatesData as { rankings: unknown[] }).rankings.length +
  (usCitiesData as { rankings: unknown[] }).rankings.length;

const SCORED_ENTITY_COUNT_FORMATTED = SCORED_ENTITY_COUNT.toLocaleString("en-US");

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

export const metadata: Metadata = {
  title: { absolute: "Compassion Benchmark | Global Benchmarking for Institutional Compassion" },
  description: "Independent benchmark research measuring how institutions recognize, respond to, and reduce suffering across governments, corporations, AI labs, and robotics.",
};

export default function Home() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="pt-[72px] pb-10">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-[1.12fr_0.88fr] gap-[18px] items-start">
            <div>
              <Eyebrow>Independent benchmark research for institutions</Eyebrow>
              <h1 className="text-[clamp(2.4rem,5vw,4.5rem)] leading-[1.02] tracking-[-0.04em] max-w-[920px] mb-3.5">
                Benchmarking how institutions recognize, respond to, and reduce
                suffering
              </h1>

              {/* #9 — "Institutional compassion" definition */}
              <p className="text-text text-[1.05rem] max-w-[800px] mb-2 font-medium">
                Institutional compassion is how reliably an institution
                recognizes, responds to, and reduces the suffering of the people
                it affects.
              </p>

              <p className="text-muted text-[1.1rem] max-w-[860px] mb-3">
                Compassion Benchmark publishes comparative benchmark research
                across governments, public systems, corporations, AI labs, and
                humanoid robotics labs using a structured institutional
                compassion framework. The benchmark is designed to make
                compassionate performance legible, comparable, and difficult to
                fake.
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
                      ? updates.headline.substring(0, 180) +
                        (updates.headline.length > 180 ? "…" : "")
                      : "Today’s briefing is available."}
                  </span>
                </p>
              )}

              {/* #2 — Three-tier CTA hierarchy. "Purchase Research" removed from hero. */}
              <div className="flex gap-3 flex-wrap mt-1">
                {/* Primary */}
                <Button href="/updates" variant="primary">
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
                    ["World Countries", "207 countries and territories"],
                    ["U.S. States", "50 states and the District of Columbia"],
                    ["Fortune 500", "447 published company rankings"],
                    ["AI Labs", "50 leading AI labs"],
                    ["Humanoid Robotics Labs", "Top 50 global labs"],
                    ["U.S. Cities", "Top 150 American cities"],
                    ["Global Cities", "Top 250 cities worldwide"],
                  ].map(([index, coverage]) => (
                    <tr key={index}>
                      <td className="py-3 px-2.5 border-b border-line text-text">
                        {index}
                      </td>
                      <td className="py-3 px-2.5 border-b border-line">
                        {coverage}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-muted mt-3">
                Public rankings are published independently. Commercial
                offerings support access, interpretation, licensing, assessment,
                and enterprise use &mdash; never paid ranking changes.
              </p>
            </Panel>
          </div>
        </Container>
      </section>

      {/* ── Section 2: Today's briefing (ALWAYS-ON) ──────────────────────── */}
      {/* #1 + #2 — Rendered unconditionally. Leads with the real headline.
          Falls back to topSignals when there are no delta events.
          On a zero-change day shows a calm confirmation line, not alarm. */}
      <section className="py-[30px]">
        <Container>
          <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
            <div>
              {/* #2 — Relabeled eyebrow */}
              <Eyebrow>
                Today&apos;s briefing
                {briefingDate ? ` · ${briefingDate}` : ""}
              </Eyebrow>
              {/* #1 — Full, untruncated real headline as section dek */}
              {typeof updates.headline === "string" && updates.headline.length > 0 && (
                <p className="text-muted text-[0.93rem] leading-relaxed mt-1 max-w-[860px]">
                  {updates.headline}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3 flex-wrap shrink-0">
              {/* #1 — Pipeline line: always shown; calm on zero-change days */}
              <span className="text-muted text-[0.88rem]">
                {isQuietDay ? (
                  <>
                    {pipelineEntitiesScanned > 0
                      ? `${pipelineEntitiesScanned.toLocaleString()} entities scanned`
                      : "Entities scanned"}
                    {pipelineEntitiesAssessed > 0
                      ? ` · ${pipelineEntitiesAssessed} assessed`
                      : ""}
                    {" · 0 score changes — all confirmed at published scores"}
                  </>
                ) : (
                  <>
                    {pipelineEntitiesScanned > 0
                      ? `${pipelineEntitiesScanned.toLocaleString()} entities scanned · `
                      : ""}
                    {pipelineEntitiesAssessed} assessed &middot;{" "}
                    {pipelineProposalsCount}{" "}
                    score {pipelineProposalsCount === 1 ? "change" : "changes"}
                  </>
                )}
              </span>
              <Link
                href="/updates"
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
                : /* Quiet-day signal cards — neutral styling, no delta color */
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

          <div className="mt-4">
            <Button href="/updates">View full briefing</Button>
          </div>
        </Container>
      </section>

      {/* Flagship report callout — "State of Institutional Compassion 2026" */}
      <section className="py-[18px]">
        <Container>
          <Callout className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <div className="min-w-0">
              <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-accent mb-1.5">
                Flagship Annual Report
              </p>
              <h2 className="text-[clamp(1.15rem,2.5vw,1.5rem)] font-bold tracking-[-0.02em] leading-tight mb-1.5">
                The State of Institutional Compassion &mdash; 2026
              </h2>
              {/* #15 — Use derived count for the scored count in the callout */}
              <p className="text-muted text-[0.93rem] leading-relaxed max-w-[620px]">
                Across {SCORED_ENTITY_COUNT_FORMATTED} institutions worldwide,
                the modal result is mediocrity &mdash; 67.7% cluster in the
                middle bands, and a 90.5% equity gap persists at the bottom of
                every index family.
              </p>
            </div>
            <div className="shrink-0">
              <Button
                href="/updates/special/state-of-institutional-compassion-2026"
                variant="primary"
              >
                Read the 2026 report &rarr;
              </Button>
            </div>
          </Callout>
        </Container>
      </section>

      {/* ── S3.1 — "State of the field" master bar + ScoreLegend (#5) ────── */}
      <section id="state-of-field" className="py-[30px] scroll-mt-20">
        <Container>
          <ChartFrame
            id="all-bands-chart"
            title="The state of institutional compassion"
            dek={`Of ${SCORED_ENTITY_COUNT_FORMATTED} institutions benchmarked across governments, corporations, AI labs, and cities — most sit in the Critical or Developing bands.`}
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

            {/* Dimension glossary */}
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

      {/* S3.3 — 7-index small-multiple band strips */}
      <section id="indexes-at-a-glance" className="py-[20px] scroll-mt-20">
        <Container>
          <SectionHead
            title="Seven indexes at a glance"
            description="Band distribution per index, sorted by share in the top two bands (Established + Exemplary). Shows which domains lead and which are in crisis."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { slug: "robotics-labs",  label: "Humanoid Robotics Labs",  href: "/robotics-labs" },
              { slug: "ai-labs",        label: "AI Labs",                  href: "/ai-labs" },
              { slug: "global-cities",  label: "Global Cities",            href: "/global-cities" },
              { slug: "us-cities",      label: "U.S. Cities",              href: "/us-cities" },
              { slug: "countries",      label: "World Countries",          href: "/countries" },
              { slug: "fortune-500",    label: "Fortune 500",              href: "/fortune-500" },
              { slug: "us-states",      label: "U.S. States",              href: "/us-states" },
            ].map((idx) => (
              <div key={idx.slug} className="bg-[rgba(255,255,255,0.02)] border border-line rounded-[14px] p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[0.86rem] font-semibold text-text">{idx.label}</span>
                  <Link
                    href={idx.href}
                    className="text-accent text-[0.78rem] font-semibold hover:underline"
                  >
                    View index &rarr;
                  </Link>
                </div>
                <BandDistributionBar index={idx.slug} />
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Newsletter signup */}
      <section className="py-[30px]">
        <Container>
          <NewsletterSignup variant="inline" source="homepage" />
        </Container>
      </section>

      {/* Published indexes */}
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

      {/* How + Research */}
      <section className="py-[30px]">
        <Container className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-2.5">
              How the benchmark works
            </h3>
            <p className="text-muted mb-3">
              The framework measures institutions across eight dimensions:{" "}
              <span className="text-text font-bold">Awareness</span>,{" "}
              <span className="text-text font-bold">Empathy</span>,{" "}
              <span className="text-text font-bold">Action</span>,{" "}
              <span className="text-text font-bold">Equity</span>,{" "}
              <span className="text-text font-bold">Boundaries</span>,{" "}
              <span className="text-text font-bold">Accountability</span>,{" "}
              <span className="text-text font-bold">Systems Thinking</span>, and{" "}
              <span className="text-text font-bold">Integrity</span>.
            </p>
            <p className="text-muted mb-3">
              Published scores are derived from public evidence and normalized to a 0&ndash;100 scale.{" "}
              {INTEGRATION_PREMIUM.short}
            </p>
            <Button href="/methodology" variant="primary">
              View Methodology
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
              Explore Research
            </Button>
          </Panel>
        </Container>
      </section>

      {/* Services */}
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

      {/* Who it&apos;s for */}
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

      {/* Independence policy */}
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

      {/* Final CTA */}
      <section className="py-[30px]">
        <Container>
          <Callout>
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] mb-2">
              Start with the public benchmark. Go deeper when needed.
            </h2>
            <p className="text-muted max-w-[900px] mb-[18px]">
              The site is designed to let visitors move from public rankings to
              methodology, from methodology to research, and from research into
              premium services such as report purchases, data licensing, advisory
              consulting, certified assessments, and enterprise agreements.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Button href="/indexes" variant="primary">
                Explore Indexes
              </Button>
              <Button href="/contact-sales">Contact Sales</Button>
            </div>
          </Callout>
        </Container>
      </section>
    </>
  );
}
