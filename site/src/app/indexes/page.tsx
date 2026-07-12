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
import EntitySearch from "@/components/index/EntitySearch";
import PickEntityCallout from "@/components/index/PickEntityCallout";
import ScoreLegend from "@/components/charts/ScoreLegend";
import GroupMeanBars from "@/components/charts/GroupMeanBars";
import BandDistributionBar from "@/components/charts/BandDistributionBar";
import BreadcrumbJsonLd, { breadcrumbUrl } from "@/components/seo/BreadcrumbJsonLd";
import FaqJsonLd from "@/components/seo/FaqJsonLd";
import FaqAccordion from "@/components/seo/FaqAccordion";
import { GUMROAD } from "@/data/gumroad";
import { INDEX_REGISTRY, getIndexEntry } from "@/data/indexRegistry";
import type { EntityKind } from "@/data/entities";

// ─── Index data (build-time) ──────────────────────────────────────────────────

import countriesData from "@/data/indexes/countries.json";
import usStatesData from "@/data/indexes/us-states.json";
import fortune500Data from "@/data/indexes/fortune-500.json";
import aiLabsData from "@/data/indexes/ai-labs.json";
import roboticsLabsData from "@/data/indexes/robotics-labs.json";
import usCitiesData from "@/data/indexes/us-cities.json";
import globalCitiesData from "@/data/indexes/global-cities.json";
import universitiesData from "@/data/indexes/universities.json";

// ─── Latest briefing (build-time) ────────────────────────────────────────────

/* eslint-disable @typescript-eslint/no-explicit-any */
import latestBriefingRaw from "@/data/updates/latest.json";
const latestBriefing = latestBriefingRaw as any;

// ─── Canonical scored-entity count (#19) ─────────────────────────────────────

import { SCORED_ENTITY_COUNT_FORMATTED } from "@/data/entityCount";

// ─── Cross-index mean bars synthetic data (#8) ────────────────────────────────
// One row per index: name, composite = meta.meanScore, group = name.
// GroupMeanBars groups by the `group` field and computes the mean of `composite`
// within each group. With one entity per group, mean == composite.

const INDEX_MEAN_ROWS = [
  { name: "Countries",        composite: countriesData.meta.meanScore,    group: "Countries" },
  { name: "U.S. States",     composite: usStatesData.meta.meanScore,     group: "U.S. States" },
  { name: "Fortune 500",     composite: fortune500Data.meta.meanScore,   group: "Fortune 500" },
  { name: "AI Labs",         composite: aiLabsData.meta.meanScore,       group: "AI Labs" },
  { name: "Robotics Labs",   composite: roboticsLabsData.meta.meanScore, group: "Robotics Labs" },
  { name: "U.S. Cities",     composite: usCitiesData.meta.meanScore,     group: "U.S. Cities" },
  { name: "Global Cities",   composite: globalCitiesData.meta.meanScore, group: "Global Cities" },
  { name: "Universities",    composite: universitiesData.meta.meanScore,  group: "Universities" },
];

// Overall mean across all 8 indexes (unweighted) for the reference line
const OVERALL_MEAN = Math.round(
  (INDEX_MEAN_ROWS.reduce((sum, r) => sum + r.composite, 0) / INDEX_MEAN_ROWS.length) * 10
) / 10;

// ─── Per-index entity counts (derived from real data, #13) ───────────────────

const COUNTS = {
  countries:    countriesData.rankings.length,
  usStates:     usStatesData.rankings.length,
  fortune500:   fortune500Data.rankings.length,
  aiLabs:       aiLabsData.rankings.length,
  roboticsLabs: roboticsLabsData.rankings.length,
  usCities:     usCitiesData.rankings.length,
  globalCities: globalCitiesData.rankings.length,
  universities: universitiesData.rankings.length,
};

/** Same counts, keyed by indexSlug — used to zip with INDEX_REGISTRY entries
 *  (e.g. for collectionJsonLd) without re-declaring the index list. */
const COUNTS_BY_SLUG: Record<string, number> = {
  countries: COUNTS.countries,
  "us-states": COUNTS.usStates,
  "fortune-500": COUNTS.fortune500,
  "ai-labs": COUNTS.aiLabs,
  "robotics-labs": COUNTS.roboticsLabs,
  "us-cities": COUNTS.usCities,
  "global-cities": COUNTS.globalCities,
  universities: COUNTS.universities,
};

// ─── Briefing delta signals — used by #4 live tease graphic ──────────────────
// Extract top score-change signals (entities with non-zero delta) from
// recentAssessments. Fall back gracefully to topSignals if none exist.

const recentAssessments: any[] = Array.isArray(latestBriefing.recentAssessments)
  ? latestBriefing.recentAssessments
  : [];

// Entities with a real delta (proposed score changes)
const deltaSignals: any[] = recentAssessments
  .filter((a: any) => typeof a.delta === "number" && a.delta !== 0)
  .slice(0, 3);

// Confirmations (delta = 0, status floor-confirmed or documented)
const confirmSignals: any[] = recentAssessments
  .filter((a: any) => a.delta === 0)
  .slice(0, 3);

// Pipeline stats for the tease
const pipelineScanned: number = latestBriefing.pipeline?.entitiesScanned ?? 0;
const pipelineAssessed: number = latestBriefing.pipeline?.entitiesAssessed ?? 0;
const pipelineChanges: number = latestBriefing.pipeline?.scoreChangesProposed
  ?? latestBriefing.pipeline?.scoreChanges
  ?? deltaSignals.length;

// ─── Metadata (#17 — answer-first title + description) ───────────────────────

export const metadata: Metadata = {
  title: "Compassion Benchmark Indexes — Compare How Governments, Companies, AI Labs, Universities, and Cities Reduce Suffering",
  description: `Browse ${SCORED_ENTITY_COUNT_FORMATTED} institutions — countries, Fortune 500, AI labs, robotics labs, U.S. states, cities, and universities — all ranked on the same 8-dimension, 0–100 compassion ruler. Free, updated every weekday.`,
};

// ─── Index card definitions — all 8 real indexes (#1, #10, #11, #13) ─────────
// Each card includes: count (real from data), differentiator (honest finding),
// and the same ruler note (#11: cross-type comparability). Never fabricated.

// href/slug for each card are sourced from the canonical registry (by
// EntityKind) rather than hand-typed strings, so the URL identity can never
// drift from indexRegistry.ts. Copy (pills/title/differentiator) stays
// page-specific and unchanged.
const INDEX_CARDS = [
  {
    kind: "us-state",
    pills: ["2026", "Public Systems"],
    title: "U.S. States Index",
    count: COUNTS.usStates,
    differentiator: `Mean score ${usStatesData.meta.meanScore} — U.S. public systems sit in the Functional band with notable equity gaps across healthcare access and accountability.`,
  },
  {
    kind: "company",
    pills: ["2026", "Corporations"],
    title: "Fortune 500 Index",
    count: COUNTS.fortune500,
    differentiator: `Mean score ${fortune500Data.meta.meanScore} — major corporations cluster in Developing; labor, equity, and accountability gaps are the primary scoring drivers.`,
  },
  {
    kind: "ai-lab",
    pills: ["2026", "AI"],
    title: "AI Labs Index",
    count: COUNTS.aiLabs,
    differentiator: `Mean score ${aiLabsData.meta.meanScore} — AI labs sit in Functional on average; the widest spread of any index, from Critical to Exemplary, reflects divergent safety postures.`,
  },
  {
    kind: "robotics-lab",
    pills: ["2026", "Robotics"],
    title: "Humanoid Robotics Labs Index",
    count: COUNTS.roboticsLabs,
    differentiator: `Mean score ${roboticsLabsData.meta.meanScore} — the highest-mean index; robotics labs score well on awareness and intent but show gaps on governance and deployment risk.`,
  },
  {
    kind: "us-city",
    pills: ["2026", "U.S. Cities"],
    title: "U.S. Cities Index",
    count: COUNTS.usCities,
    differentiator: `Mean score ${usCitiesData.meta.meanScore} — U.S. cities span Critical to Functional; housing, homelessness response, and public health access are the most variable dimensions.`,
  },
  {
    kind: "city",
    pills: ["2026", "Global Cities"],
    title: "Global Cities Index",
    count: COUNTS.globalCities,
    differentiator: `Mean score ${globalCitiesData.meta.meanScore} — the lowest-mean index; global cities track closely with their national government scores, especially on equity and accountability.`,
  },
  {
    kind: "university",
    pills: ["2026", "Education"],
    title: "Universities Index",
    count: COUNTS.universities,
    differentiator: `Mean score ${universitiesData.meta.meanScore} — universities score in the Functional band on average; equity access and boundary accountability are the most variable dimensions across institutions.`,
  },
].map((item) => {
  const entry = getIndexEntry(item.kind as EntityKind);
  return { ...item, href: entry.indexRoute, slug: entry.indexSlug };
});

// ─── Briefing date formatting ─────────────────────────────────────────────────

function formatBriefingDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

// ─── FAQ items (#18) — traced to real data. No fabrication. ──────────────────

const indexesFaqItems = [
  {
    question: "What does the Compassion Benchmark measure across all indexes?",
    answer: `Every index measures the same thing: how reliably an institution recognizes, responds to, and reduces the suffering of the people it affects. All ${SCORED_ENTITY_COUNT_FORMATTED} entities — governments, companies, AI labs, robotics labs, U.S. states, cities, and universities — are scored on the same 8-dimension, 0–100 ruler. A score of 50 means the same thing whether it appears in the Countries Index or the Fortune 500 Index.`,
  },
  {
    question: "Are the 8 indexes directly comparable across sectors?",
    answer: `Yes. The benchmark uses an identical 8-dimension framework (Awareness, Empathy, Action, Equity, Boundaries, Accountability, Systemic Thinking, Integrity) across all indexes. The scoring scale (0–100) and five bands (Critical 0–20 · Developing 20–40 · Functional 40–60 · Established 60–80 · Exemplary 80–100) are the same in every index. A country and a corporation with the same score have passed the same evidentiary tests on the same criteria.`,
  },
  {
    question: "How often are index scores updated?",
    answer: `The nightly pipeline scans the monitored entity catalog and publishes a daily briefing every weekday. Score changes are proposed when new public evidence crosses the threshold for a dimension change. Most days include confirmations (scores re-examined and held) alongside any proposals. All updates are free to read on the Daily Briefing page.`,
  },
  {
    question: "Do entities pay to be included or to improve their score?",
    answer: `No. Public index inclusion is independent. Entities do not pay for inclusion, score changes, or suppression of findings. Paid services — premium reports, data licenses, advisory, certified assessments — are built around access, interpretation, and institutional use only. The commercial and scoring functions are fully separated.`,
  },
  {
    question: "What do the five bands mean — Critical, Developing, Functional, Established, Exemplary?",
    answer: `The five bands divide the 0–100 scale into equal 20-point segments. Critical (0–20): foundational practices absent or active harm documented. Developing (20–40): some practices emerging but inconsistent. Functional (40–60): core practices present with significant gaps. Established (60–80): practices systematic, documented, evidenced. Exemplary (80–100): independently verified, consistent, sustained under pressure.`,
  },
  {
    question: "What is a composite score and how is it built?",
    answer: `A composite score is the entity's overall 0–100 benchmark result, derived from its 8 dimension scores. Each dimension is rated on a 0–5 anchor scale (five behavioral anchors per subdimension, five subdimensions per dimension), then normalized to 0–100 and combined. The composite reflects the center of gravity across all 8 dimensions — no single dimension can carry the composite without evidence across the others.`,
  },
];

// ─── JSON-LD: CollectionPage + ItemList (#16) ─────────────────────────────────
// Binds hub to all 8 index spokes. URLs use REAL routes, verified against the build.

const SITE = "https://compassionbenchmark.com";

/**
 * Bespoke JSON-LD display names — intentionally shorter than KIND_CONFIG's
 * indexLabel for AI Labs ("AI Labs Index" here vs. "Top 50 AI Labs Index"
 * elsewhere); preserved as page-specific copy, not sourced from the registry.
 */
const JSONLD_NAME_BY_KIND: Record<EntityKind, string> = {
  country: "World Countries Index",
  "us-state": "U.S. States Index",
  company: "Fortune 500 Index",
  "ai-lab": "AI Labs Index",
  "robotics-lab": "Humanoid Robotics Labs Index",
  "us-city": "U.S. Cities Index",
  city: "Global Cities Index",
  university: "Universities Index",
};

const collectionJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": `${SITE}/indexes`,
  name: "Compassion Benchmark Indexes",
  description: `All 8 published Compassion Benchmark indexes covering ${SCORED_ENTITY_COUNT_FORMATTED} entities — countries, Fortune 500, AI labs, robotics labs, U.S. states, U.S. cities, global cities, and universities — on one shared 8-dimension, 0–100 ruler.`,
  url: `${SITE}/indexes`,
  publisher: {
    "@type": "Organization",
    name: "Compassion Benchmark",
    url: SITE,
  },
  mainEntity: {
    "@type": "ItemList",
    name: "Published Compassion Benchmark Indexes",
    numberOfItems: INDEX_REGISTRY.length,
    // Position/order/url are sourced from the canonical registry (display
    // order, same as before); name text is bespoke JSON-LD copy (unchanged).
    itemListElement: INDEX_REGISTRY.map((entry, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `${JSONLD_NAME_BY_KIND[entry.kind]} (${COUNTS_BY_SLUG[entry.indexSlug]} entities)`,
      url: `${SITE}${entry.indexRoute}`,
    })),
  },
};

// ─── Page component ───────────────────────────────────────────────────────────

export default function IndexesPage() {
  const briefingDate = formatBriefingDate(latestBriefing.date);
  const briefingHeadline: string =
    typeof latestBriefing.headline === "string" && latestBriefing.headline.length > 0
      ? latestBriefing.headline.length > 180
        ? latestBriefing.headline.slice(0, 177) + "…"
        : latestBriefing.headline
      : "Today's briefing is available.";

  return (
    <>
      {/* ── JSON-LD: BreadcrumbList (#18) ────────────────────────────────── */}
      <BreadcrumbJsonLd items={[
        { name: "Home",    url: breadcrumbUrl("/") },
        { name: "Indexes", url: breadcrumbUrl("/indexes") },
      ]} />

      {/* ── JSON-LD: FAQPage (#18) ────────────────────────────────────────── */}
      <FaqJsonLd items={indexesFaqItems} />

      {/* ── JSON-LD: CollectionPage + ItemList (#16) ─────────────────────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />

      {/* ── Hero (#12 visitor-first, #15 reader paths, #17 answer-first) ─── */}
      <section className="pt-[72px] pb-10">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-[1.08fr_0.92fr] gap-[18px] items-start">
            <div>
              <Eyebrow>Free benchmark research · independent · updated weekdays</Eyebrow>
              {/* #12 — visitor-first headline; #17 — answer-first lead */}
              <h1 className="text-[clamp(2.25rem,5vw,4.2rem)] leading-[1.03] tracking-[-0.04em] max-w-[900px] mb-3.5">
                Compare how {SCORED_ENTITY_COUNT_FORMATTED} institutions recognize and reduce suffering
              </h1>
              {/* #17 — liftable "what the benchmark ranks" sentence */}
              <p className="text-text text-[1.05rem] max-w-[860px] mb-2 font-medium">
                Governments, corporations, AI labs, robotics labs, and cities — all ranked on the same
                8-dimension, 0–100 ruler, sourced from public evidence, free to browse.
              </p>
              {/* #11 — cross-type comparability */}
              <p className="text-muted text-[0.97rem] max-w-[860px] mb-3">
                The benchmark uses identical criteria across all 8 indexes. A score of 50 means the same
                thing whether it appears in the Countries Index or the Fortune 500 Index — enabling direct
                comparison across sectors for the first time.
              </p>
              {/* #12 — reader-first CTAs */}
              <div className="flex gap-3 flex-wrap mt-1">
                <Button href="/updates" variant="primary">Read today&apos;s briefing</Button>
                <Button href="/methodology">How the benchmark works</Button>
                <Button href="#pick-entity-to-watch">Browse the 8 indexes</Button>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
                <Stat value="8" label="Published index families" />
                <Stat value={SCORED_ENTITY_COUNT_FORMATTED} label="Entities benchmarked" />
                <Stat value="8" label="Core benchmark dimensions" />
                <Stat value="Free" label="All public rankings, no paywall" />
              </div>
            </div>

            {/* #15 — Reader paths panel (replaces buyer table) */}
            <Panel>
              <h3 className="text-[1.08rem] font-bold mb-2.5">Three ways to start</h3>
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">Goal</th>
                    <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">Where to go</th>
                  </tr>
                </thead>
                <tbody className="text-muted">
                  {([
                    { goal: "Browse rankings",          path: "Pick an index below — all free", href: "#pick-entity-to-watch" },
                    { goal: "Understand the method",    path: "Read the Methodology page",      href: "/methodology" },
                    { goal: "Read today's briefing",    path: "Go to Daily Briefing",           href: "/updates" },
                    { goal: "Search a specific entity", path: "Use entity search below",        href: "#entity-search" },
                    { goal: "Get a research report",    path: "Purchase Research catalog",      href: "/purchase-research" },
                  ] as { goal: string; path: string; href: string }[]).map(({ goal, path, href }) => (
                    <tr key={goal} className="hover:bg-[rgba(255,255,255,0.025)] transition-colors">
                      <td className="py-2.5 px-2.5 border-b border-line text-text text-[0.88rem]">{goal}</td>
                      <td className="py-2.5 px-2.5 border-b border-line text-[0.88rem]">
                        <a href={href} className="text-[#7dd3fc] hover:underline">{path}</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-muted mt-3 text-[0.82rem]">
                Public rankings are independent. Paid products support access and interpretation — never paid score changes.
              </p>
            </Panel>
          </div>
        </Container>
      </section>

      {/* ── #2 + #4 — Daily briefing on-ramp with live movement tease ─────── */}
      <section className="py-[16px]">
        <Container>
          <div className="rounded-[14px] border border-[rgba(125,211,252,0.18)] bg-[rgba(7,17,31,0.46)] px-5 py-4">
            {/* Top row: date label + pipeline stats + CTA */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
              <div className="flex-1 min-w-0">
                <p className="text-[0.74rem] font-bold uppercase tracking-[0.12em] text-[rgba(125,211,252,0.7)] mb-1">
                  Daily briefing — {briefingDate}
                </p>
                <p className="text-muted text-[0.88rem] leading-relaxed line-clamp-2">
                  {briefingHeadline}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {pipelineScanned > 0 && (
                  <span className="text-[0.78rem] text-muted hidden sm:inline">
                    {pipelineScanned.toLocaleString()} scanned &middot; {pipelineAssessed} assessed
                    {pipelineChanges > 0 ? ` · ${pipelineChanges} ${pipelineChanges === 1 ? "change" : "changes"}` : " · 0 changes"}
                  </span>
                )}
                <a
                  href="/updates"
                  className="text-[0.86rem] font-semibold text-[#7dd3fc] hover:text-text transition-colors whitespace-nowrap"
                >
                  Full briefing &rarr;
                </a>
              </div>
            </div>

            {/* #4 — Live movement chips: delta signals */}
            {deltaSignals.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1">
                {deltaSignals.map((a: any, i: number) => {
                  const down = a.delta < 0;
                  return (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.75rem] font-bold border"
                      style={{
                        borderColor: down ? "rgba(248,113,113,0.35)" : "rgba(134,239,172,0.35)",
                        background: down ? "rgba(248,113,113,0.08)" : "rgba(134,239,172,0.08)",
                        color: down ? "#f87171" : "#86efac",
                      }}
                    >
                      <span className="font-semibold text-[rgba(255,255,255,0.7)] text-[0.72rem]">{a.entity}</span>
                      {a.delta > 0 ? "+" : ""}{a.delta}
                    </span>
                  );
                })}
                {/* Confirmation chip — shows how many were confirmed without movement */}
                {confirmSignals.length > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.75rem] font-bold border border-[rgba(148,163,184,0.2)] bg-[rgba(148,163,184,0.06)] text-muted">
                    +{recentAssessments.filter((a: any) => a.delta === 0).length} confirmed
                  </span>
                )}
              </div>
            )}
            {/* Graceful fallback: no delta events */}
            {deltaSignals.length === 0 && pipelineAssessed > 0 && (
              <div className="flex flex-wrap gap-2 mt-1">
                <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.75rem] font-bold border border-[rgba(148,163,184,0.2)] bg-[rgba(148,163,184,0.06)] text-muted">
                  {pipelineAssessed} assessed &middot; all confirmed — no changes
                </span>
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* ── #6 — Methodology on-ramp (prominent, near-top) ──────────────────── */}
      <section className="py-[14px]">
        <Container>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-[14px] border border-[rgba(134,239,172,0.18)] bg-[rgba(7,31,17,0.46)] px-5 py-4">
            <div className="flex-1 min-w-0">
              <p className="text-[0.74rem] font-bold uppercase tracking-[0.12em] text-[rgba(134,239,172,0.7)] mb-1">
                Methodology
              </p>
              <p className="text-muted text-[0.88rem] leading-relaxed">
                Every score in every index is built on the same 8-dimension, 40-subdimension framework — with
                publicly documented anchor scales, an evidence hierarchy, and a human approval gate. Read the full
                methodology to understand what a score means before you cite it.
              </p>
            </div>
            <a
              href="/methodology"
              className="shrink-0 text-[0.86rem] font-semibold text-[#86efac] hover:text-text transition-colors whitespace-nowrap"
            >
              Read the methodology &rarr;
            </a>
          </div>
        </Container>
      </section>

      {/* ── #20 — Entity search (moved up; free follow-on links) ─────────── */}
      <section className="py-[28px]" id="entity-search">
        <Container>
          <SectionHead
            title="Look up any entity"
            description={`Search across all ${SCORED_ENTITY_COUNT_FORMATTED} benchmarked entities — countries, corporations, AI labs, robotics labs, U.S. states, and cities. Use ?entity=name in the URL to link directly to any entity.`}
          />
          <EntitySearch />
          {/* #20 — Free follow-on links after search results (not commerce-only) */}
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[0.85rem] text-muted">
            <span className="text-[0.82rem] font-semibold text-muted mr-1">Explore further:</span>
            <a href="/updates" className="hover:text-text transition-colors">Today&apos;s briefing</a>
            <span aria-hidden>·</span>
            <a href="/methodology" className="hover:text-text transition-colors">How scores are built</a>
            <span aria-hidden>·</span>
            <a href="/countries" className="hover:text-text transition-colors">Countries Index</a>
            <span aria-hidden>·</span>
            <a href="/fortune-500" className="hover:text-text transition-colors">Fortune 500 Index</a>
            <span aria-hidden>·</span>
            <a href="/ai-labs" className="hover:text-text transition-colors">AI Labs Index</a>
            <span aria-hidden>·</span>
            <a href="/purchase-research" className="hover:text-text transition-colors">Purchase research</a>
          </div>
        </Container>
      </section>

      {/* ── #5 — "How to read every index" teaching block ────────────────── */}
      <section className="py-[20px]">
        <Container>
          <div className="rounded-[14px] border border-line bg-[rgba(255,255,255,0.02)] px-5 py-4">
            <p className="text-[0.74rem] font-bold uppercase tracking-[0.12em] text-muted mb-2">
              How to read every index
            </p>
            {/* #7 — Decode framework jargon inline */}
            <p className="text-muted text-[0.88rem] leading-relaxed mb-3 max-w-[820px]">
              All 8 indexes share one framework: 8{" "}
              <strong className="text-text" title="The eight scored categories: Awareness, Empathy, Action, Equity, Boundaries, Accountability, Systemic Thinking, Integrity">dimensions</strong>,
              {" "}40 subdimensions, scored 0–100,
              assigned to one of five{" "}
              <strong className="text-text" title="Bands divide the 0–100 scale: Critical (0–20) · Developing (20–40) · Functional (40–60) · Established (60–80) · Exemplary (80–100)">bands</strong>.
              {" "}The{" "}
              <strong className="text-text" title="Composite = the entity's overall 0–100 score, averaged across all 8 dimension scores">composite score</strong>
              {" "}is directly comparable across all indexes — a 59 in Countries means the same as a 59 in Fortune 500.
              Search results, index cards, and entity pages all use this common ruler.
            </p>
            <ScoreLegend />
          </div>
        </Container>
      </section>

      {/* ── #8 — Cross-index "state of the field" ranked mean bars ─────────── */}
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
              Mean compassion score by index — 2026 (which index should I open first?)
            </summary>
            <div className="border-t border-line px-5 py-4">
              <p className="text-muted text-[0.82rem] mb-3 max-w-[700px]">
                Each bar shows the mean composite{" "}
                <span title="Composite = entity's overall 0–100 benchmark score across all 8 dimensions" className="underline decoration-dotted cursor-help">score</span>
                {" "}across all entities in that index. Sorted highest to lowest. Band color reflects the mean band.
                Reference line at the overall cross-index mean ({OVERALL_MEAN.toFixed(1)}).
              </p>
              <GroupMeanBars
                rankings={INDEX_MEAN_ROWS}
                groupKey="group"
                groupLabel="Index"
                indexMean={OVERALL_MEAN}
                indexName="All Indexes"
              />
              <p className="text-[0.72rem] text-[rgba(148,163,184,0.55)] mt-2 text-right">
                Source: Compassion Benchmark · CC-BY
              </p>
            </div>
          </details>
        </Container>
      </section>

      {/* ── Current indexes — all 8 (#1, #9, #10, #11, #13) ─────────────── */}
      <section className="py-[30px]" id="pick-entity-to-watch">
        <Container>
          <PickEntityCallout />
          <SectionHead
            title="Current indexes"
            description={`Eight index families. All ${SCORED_ENTITY_COUNT_FORMATTED} entities — governments, companies, AI labs, robotics labs, cities, and universities — scored on the same 8-dimension, 0–100 ruler, making cross-sector comparison possible.`}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Countries — featured card */}
            <Card href={getIndexEntry("country").indexRoute} variant="featured">
              <div className="flex gap-2.5 flex-wrap mb-3">
                <Pill>2026</Pill>
                <Pill>Governments</Pill>
                <Pill>First Published Report</Pill>
              </div>
              <h3 className="text-[1.08rem] font-bold mb-1.5">Countries Index</h3>
              {/* #10 — differentiator + #13 — real entity count */}
              <p className="text-muted text-[0.86rem] mb-1">
                {COUNTS.countries} countries and territories on the same ruler as every other index.
              </p>
              <p className="text-muted text-[0.82rem] mb-3">
                Mean score {countriesData.meta.meanScore} — countries show the widest band spread of any index; the Critical cluster reflects sustained documented harm patterns.
              </p>
              {/* #9 — band mini-strip + entity count */}
              <div className="mt-auto pt-2 space-y-1.5">
                <BandDistributionBar index="countries" compact />
              </div>
              {/* #10 — explicit "View index" affordance */}
              <p className="text-[0.8rem] text-[#7dd3fc] font-semibold mt-3">View Countries Index &rarr;</p>
            </Card>

            {/* Remaining 6 index cards */}
            {INDEX_CARDS.map((item) => (
              <Card key={item.href} href={item.href}>
                <div className="flex gap-2.5 flex-wrap mb-3">
                  {item.pills.map((p) => <Pill key={p}>{p}</Pill>)}
                </div>
                <h3 className="text-[1.08rem] font-bold mb-1.5">{item.title}</h3>
                {/* #10 — entity count + #13 — real count */}
                <p className="text-muted text-[0.86rem] mb-1">
                  {item.count} entities. Same 8-dimension ruler as every other index.
                </p>
                {/* #10 — differentiator finding */}
                <p className="text-muted text-[0.82rem] mb-3">
                  {item.differentiator}
                </p>
                {/* #9 — band mini-strip */}
                <div className="mt-auto pt-2 space-y-1.5">
                  <BandDistributionBar index={item.slug} compact />
                </div>
                {/* #10 — explicit CTA */}
                <p className="text-[0.8rem] text-[#7dd3fc] font-semibold mt-3">View index &rarr;</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Featured launch (commerce — below free value) ─────────────────── */}
      <section className="py-[30px]">
        <Container>
          <Card variant="featured">
            <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-[18px] items-start">
              <div>
                <Eyebrow>Now available</Eyebrow>
                <h2 className="text-[clamp(1.55rem,3vw,2.15rem)] tracking-[-0.03em] mb-2.5">
                  The first published Compassion Benchmark research report is live
                </h2>
                <p className="text-muted mb-3.5">
                  The <span className="text-text font-bold">2026 Countries Compassion Benchmark Index</span> is now available for direct purchase as the first published flagship digital report from Compassion Benchmark.
                </p>
                <p className="text-muted mb-3.5">
                  This Individual Research License edition goes beyond the public countries page and includes the complete benchmark PDF with full rankings, methodology, key findings, regional analysis, highest-performer themes, and structural concerns shaping the lowest-performing countries.
                </p>
                <ul className="list-disc pl-[18px] text-muted space-y-2 mb-4">
                  <li>Complete 2026 countries benchmark report</li>
                  <li>Individual Research License digital edition</li>
                  <li>Full rankings, findings, and interpretive analysis</li>
                  <li>Instant online purchase and delivery through Gumroad</li>
                </ul>
                <div className="flex gap-3 flex-wrap">
                  <Button href={GUMROAD.countriesIndex} variant="primary" external>Purchase the 2026 Countries Index</Button>
                  <Button href="/countries">Preview the Countries Index</Button>
                </div>
              </div>
              <div className="bg-[rgba(7,17,31,0.46)] border border-[rgba(125,211,252,0.18)] rounded-[22px] p-[22px]">
                <Eyebrow>Individual Research License</Eyebrow>
                <h3 className="text-[1.15rem] font-bold mb-2">2026 Countries Compassion Benchmark Index</h3>
                <p className="text-[2rem] font-extrabold leading-none mb-2">$195</p>
                <p className="text-muted text-[0.94rem] mb-3.5">Single-user digital research report</p>
                <ul className="list-disc pl-[18px] text-muted space-y-2 mb-4">
                  <li>Designed for researchers, journalists, students, and policy professionals</li>
                  <li>Immediate digital access after purchase</li>
                  <li>Personal research use</li>
                  <li>No redistribution or resale</li>
                </ul>
                <Button href={GUMROAD.countriesIndex} variant="primary" external>Buy on Gumroad</Button>
              </div>
            </div>
          </Card>
        </Container>
      </section>

      {/* ── Assess Your Organization ──────────────────────────────────────── */}
      <section className="py-[20px]">
        <Container>
          <Callout>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <h2 className="text-[1.12rem] font-bold mb-1">Assess your organization</h2>
                <p className="text-muted text-[0.92rem]">
                  Organizations that want to move from public benchmark visibility into structured self-review or formal assessment work can start here.
                </p>
              </div>
              <Button href="/assess-your-organization" variant="primary">Start assessment</Button>
            </div>
          </Callout>
        </Container>
      </section>

      {/* ── Public benchmark first ────────────────────────────────────────── */}
      <section className="py-[20px]">
        <Container>
          <Callout>
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] mb-2">Public benchmark first. Premium depth when needed.</h2>
            <p className="text-muted max-w-[950px]">
              Every index page is designed to stand on its own as a public benchmark publication. Organizations that need more can purchase premium reports, license benchmark data, request interpretive support, or engage in structured assessment and enterprise relationships. The first of these premium report products is now live: the 2026 Countries Compassion Benchmark Index.
            </p>
          </Callout>
        </Container>
      </section>

      {/* ── Monetization + Independence ───────────────────────────────────── */}
      <section className="py-[30px]">
        <Container className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-2.5">How the benchmark stays free and funded</h3>
            <ul className="list-disc pl-[18px] text-muted space-y-2">
              <li><span className="text-text font-bold">Public benchmark pages:</span> freely accessible rankings and findings</li>
              <li><span className="text-text font-bold">Premium reports:</span> professional PDF and bundled benchmark products</li>
              <li><span className="text-text font-bold">Data licensing:</span> structured datasets and usage rights</li>
              <li><span className="text-text font-bold">Advisory:</span> interpretation, peer comparison, and strategic guidance</li>
              <li><span className="text-text font-bold">Certified assessments:</span> formal review services</li>
              <li><span className="text-text font-bold">Enterprise agreements:</span> recurring institutional relationships</li>
            </ul>
          </Panel>
          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-2.5">Independence policy</h3>
            <ul className="list-disc pl-[18px] text-muted space-y-2">
              <li>Entities do not pay to be included in indexes</li>
              <li>Entities do not pay to improve a score or rank</li>
              <li>Public index publication is independent of commercial services</li>
              <li>Paid offerings support access, analysis, review, and institutional use</li>
              <li>The benchmark is designed to be difficult to game</li>
            </ul>
          </Panel>
        </Container>
      </section>

      {/* ── Go deeper with benchmark products ────────────────────────────── */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="Go deeper with benchmark products"
            description="Move from public rankings into professional reports, licensed data, advisory interpretation, certified assessments, and enterprise access."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { href: GUMROAD.countriesIndex, external: true,  pills: ["Featured Product", "Direct Purchase"], title: "Buy the 2026 Countries Index",        desc: "Purchase the first published Compassion Benchmark digital report directly as an Individual Research License edition." },
              { href: "/purchase-research",   external: false, pills: ["Reports", "Catalog"],                  title: "Purchase Research",                   desc: "Browse benchmark reports by year and target area, including premium PDF formats, appendices, and bundled publications." },
              { href: "/data-licenses",       external: false, pills: ["Data", "Licensing"],                   title: "License Benchmark Data",              desc: "Access structured benchmark datasets for internal analysis, research workflows, and institutional intelligence use." },
              { href: "/advisory",            external: false, pills: ["Advisory", "Interpretation"],          title: "Book Advisory Support",               desc: "Translate benchmark findings into peer comparison, strategic interpretation, executive discussion, and action priorities." },
              { href: "/certified-assessments", external: false, pills: ["Assessment", "Formal Review"],       title: "Request a Certified Assessment",       desc: "Move from public benchmark visibility into a structured, assessor-led review process with findings and next steps." },
              { href: "/enterprise",          external: false, pills: ["Enterprise", "Institutional"],         title: "Explore Enterprise Access",           desc: "Combine reports, data, advisory, and recurring support into a broader enterprise benchmark relationship." },
            ].map((item) => (
              <Card key={item.title} href={item.href} variant="service">
                <div className="flex gap-2.5 flex-wrap">
                  {item.pills.map((p) => <Pill key={p}>{p}</Pill>)}
                </div>
                <h3 className="text-[1.12rem] font-bold">{item.title}</h3>
                <p className="text-muted">{item.desc}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* ── #18 — FAQ accordion (visible; mirrors FaqJsonLd above) ─────────── */}
      <section className="py-[16px]">
        <Container>
          <FaqAccordion items={indexesFaqItems} heading="Indexes — frequently asked questions" />
        </Container>
      </section>

      {/* ── Closing navigation + trust (#3 — /media, /data added) ──────────── */}
      <section className="py-[30px]">
        <Container>
          <Panel>
            <p className="text-[1.05rem] font-semibold text-text mb-3">
              Every index page is free to read. When you need more, go deeper.
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted text-[0.92rem] mb-4">
              <a href="/methodology" className="hover:text-text transition-colors">Methodology</a>
              <span aria-hidden>·</span>
              <a href="/research" className="hover:text-text transition-colors">Research</a>
              <span aria-hidden>·</span>
              <a href="/updates" className="hover:text-text transition-colors">Daily Briefing</a>
              <span aria-hidden>·</span>
              {/* #3 — /media and /data added to link panel */}
              <a href="/media" className="hover:text-text transition-colors">Media</a>
              <span aria-hidden>·</span>
              <a href="/data" className="hover:text-text transition-colors">Data</a>
              <span aria-hidden>·</span>
              <a href="/purchase-research" className="hover:text-text transition-colors">Purchase Research</a>
              <span aria-hidden>·</span>
              <a href="/data-licenses" className="hover:text-text transition-colors">Data Licenses</a>
              <span aria-hidden>·</span>
              <a href="/advisory" className="hover:text-text transition-colors">Advisory</a>
              <span aria-hidden>·</span>
              <a href="/certified-assessments" className="hover:text-text transition-colors">Certified Assessments</a>
              <span aria-hidden>·</span>
              <a href="/enterprise" className="hover:text-text transition-colors">Enterprise</a>
              <span aria-hidden>·</span>
              <a href="/contact-sales" className="hover:text-text transition-colors">Contact Sales</a>
            </div>
            <p className="text-[0.82rem] text-muted border-t border-line pt-3">
              Inclusion and scores are never for sale. Paid products cover access, interpretation, and licensing only.
            </p>
          </Panel>
        </Container>
      </section>
    </>
  );
}
