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
import { GUMROAD } from "@/data/gumroad";

// ─── Index data (build-time) ──────────────────────────────────────────────────

import countriesData from "@/data/indexes/countries.json";
import usStatesData from "@/data/indexes/us-states.json";
import fortune500Data from "@/data/indexes/fortune-500.json";
import aiLabsData from "@/data/indexes/ai-labs.json";
import roboticsLabsData from "@/data/indexes/robotics-labs.json";
import usCitiesData from "@/data/indexes/us-cities.json";
import globalCitiesData from "@/data/indexes/global-cities.json";

// ─── Latest briefing (build-time) ────────────────────────────────────────────

import latestBriefing from "@/data/updates/latest.json";

// ─── Derived entity count (#19 — canonical 1,156) ────────────────────────────
// Sum of rankings.length across all 7 indexes, computed at build time.

const SCORED_ENTITY_COUNT = [
  countriesData.rankings.length,
  usStatesData.rankings.length,
  fortune500Data.rankings.length,
  aiLabsData.rankings.length,
  roboticsLabsData.rankings.length,
  usCitiesData.rankings.length,
  globalCitiesData.rankings.length,
].reduce((a, b) => a + b, 0);

const SCORED_ENTITY_COUNT_FORMATTED = SCORED_ENTITY_COUNT.toLocaleString("en-US");

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
];

// Overall mean across all 7 indexes (unweighted) for the reference line
const OVERALL_MEAN = Math.round(
  (INDEX_MEAN_ROWS.reduce((sum, r) => sum + r.composite, 0) / INDEX_MEAN_ROWS.length) * 10
) / 10;

// ─── Metadata (#19 — updated count) ──────────────────────────────────────────

export const metadata: Metadata = {
  title: "Indexes — Compassion Benchmark",
  description: `Explore published Compassion Benchmark rankings across ${SCORED_ENTITY_COUNT_FORMATTED} entities including countries, U.S. states, Fortune 500, AI labs, robotics labs, U.S. cities, and global cities — all on the same 8-dimension, 0–100 ruler.`,
};

// ─── Index card definitions (all 7 real indexes) ─────────────────────────────

const INDEX_CARDS = [
  {
    href: "/us-states",
    slug: "us-states",
    pills: ["2026", "Public Systems"],
    title: "U.S. States Index",
    desc: "Comparative benchmark across all 50 states and the District of Columbia.",
    count: usStatesData.rankings.length,
    featured: false,
  },
  {
    href: "/fortune-500",
    slug: "fortune-500",
    pills: ["2026", "Corporations"],
    title: "Fortune 500 Index",
    desc: "Comparative benchmark of major corporations using public evidence, governance patterns, and institutional behavior.",
    count: fortune500Data.rankings.length,
    featured: false,
  },
  {
    href: "/ai-labs",
    slug: "ai-labs",
    pills: ["2026", "AI"],
    title: "AI Labs Index",
    desc: "Benchmark of leading AI labs across accountability, safety posture, deployment boundaries, equity, and integrity.",
    count: aiLabsData.rankings.length,
    featured: false,
  },
  {
    href: "/robotics-labs",
    slug: "robotics-labs",
    pills: ["2026", "Robotics"],
    title: "Humanoid Robotics Labs Index",
    desc: "Benchmark of global humanoid robotics labs across labor, healthcare, accessibility, governance, and deployment risk.",
    count: roboticsLabsData.rankings.length,
    featured: false,
  },
  {
    href: "/us-cities",
    slug: "us-cities",
    pills: ["2026", "U.S. Cities"],
    title: "U.S. Cities Index",
    desc: "Benchmark of 144 U.S. cities across municipal policy, public health access, equity, and institutional accountability.",
    count: usCitiesData.rankings.length,
    featured: false,
  },
  {
    href: "/global-cities",
    slug: "global-cities",
    pills: ["2026", "Global Cities"],
    title: "Global Cities Index",
    desc: "Comparative benchmark of 250 cities worldwide on the same 8-dimension ruler applied to all indexes.",
    count: globalCitiesData.rankings.length,
    featured: false,
  },
];

// ─── Briefing date formatting ─────────────────────────────────────────────────

function formatBriefingDate(isoDate: string): string {
  // Parse YYYY-MM-DD safely without timezone shift
  const [year, month, day] = isoDate.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

// ─── Page component ───────────────────────────────────────────────────────────

export default function IndexesPage() {
  const briefingDate = formatBriefingDate(latestBriefing.date);
  // Trim headline to ~140 chars for the strip (it can be very long)
  const briefingHeadline = latestBriefing.headline.length > 140
    ? latestBriefing.headline.slice(0, 137) + "…"
    : latestBriefing.headline;

  return (
    <>
      {/* Hero */}
      <section className="pt-[72px] pb-10">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-[1.08fr_0.92fr] gap-[18px] items-start">
            <div>
              <Eyebrow>Published benchmark indexes</Eyebrow>
              <h1 className="text-[clamp(2.25rem,5vw,4.2rem)] leading-[1.03] tracking-[-0.04em] max-w-[900px] mb-3.5">
                Explore benchmark rankings across governments, corporations, AI, and robotics
              </h1>
              <p className="text-muted text-[1.08rem] max-w-[860px] mb-[22px]">
                Compare how institutions across sectors recognize, respond to, and reduce suffering — free.
                All {SCORED_ENTITY_COUNT_FORMATTED} entities are scored on the same 8-dimension, 0–100 ruler,
                making the indexes directly comparable across governments, companies, AI labs, robotics labs, and cities.
              </p>
              <div className="flex gap-3 flex-wrap mt-1">
                <Button href="/countries" variant="primary">View Countries Index</Button>
                <Button href={GUMROAD.countriesIndex} external>Buy First Published Report</Button>
                <Button href="/data-licenses">Data Licensing</Button>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
                <Stat value="7" label="Published index families" />
                <Stat value={SCORED_ENTITY_COUNT_FORMATTED} label="Entities benchmarked" />
                <Stat value="2026" label="Current publication cycle" />
                <Stat value="Public + Premium" label="Free rankings with paid formats and services" />
              </div>
            </div>

            <Panel>
              <h3 className="text-[1.08rem] font-bold mb-2.5">How to use the indexes</h3>
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">Need</th>
                    <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">Best path</th>
                  </tr>
                </thead>
                <tbody className="text-muted">
                  {[
                    ["Browse rankings", "Use the public index pages"],
                    ["Buy the first published report", "Purchase the Countries Index PDF"],
                    ["License structured data", "Go to Data License"],
                    ["Interpret results", "Go to Advisory"],
                    ["Request formal review", "Go to Certified Assessments"],
                  ].map(([need, path]) => (
                    <tr key={need}>
                      <td className="py-3 px-2.5 border-b border-line text-text">{need}</td>
                      <td className="py-3 px-2.5 border-b border-line">{path}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-muted mt-3">
                Public index inclusion is independent. Paid services are built around access, packaging, interpretation, licensing, and institutional support.
              </p>
            </Panel>
          </div>
        </Container>
      </section>

      {/* #2 — Daily briefing on-ramp */}
      <section className="py-[16px]">
        <Container>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-[14px] border border-[rgba(125,211,252,0.18)] bg-[rgba(7,17,31,0.46)] px-5 py-4">
            <div className="flex-1 min-w-0">
              <p className="text-[0.74rem] font-bold uppercase tracking-[0.12em] text-[rgba(125,211,252,0.7)] mb-1">
                Daily briefing — {briefingDate}
              </p>
              <p className="text-muted text-[0.88rem] leading-relaxed line-clamp-2">
                {briefingHeadline}
              </p>
            </div>
            <a
              href="/updates"
              className="shrink-0 text-[0.86rem] font-semibold text-[#7dd3fc] hover:text-text transition-colors whitespace-nowrap"
            >
              Read today&rsquo;s briefing &rarr;
            </a>
          </div>
        </Container>
      </section>

      {/* Entity search */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="Look up any entity"
            description={`Search across all ${SCORED_ENTITY_COUNT_FORMATTED} benchmarked entities — countries, corporations, AI labs, robotics labs, U.S. states, and cities. Use ?entity=name in the URL to link directly to any entity.`}
          />
          <EntitySearch />
        </Container>
      </section>

      {/* #5 — "How to read every index" teaching block */}
      <section className="py-[20px]">
        <Container>
          <div className="rounded-[14px] border border-line bg-[rgba(255,255,255,0.02)] px-5 py-4">
            <p className="text-[0.74rem] font-bold uppercase tracking-[0.12em] text-muted mb-2">
              How to read every index
            </p>
            <p className="text-muted text-[0.88rem] leading-relaxed mb-3 max-w-[820px]">
              All 7 indexes share the same framework: 8 dimensions, 40 subdimensions, scored 0–100, assigned to one of five bands.
              That means a 59 in the Countries Index is directly comparable to a 59 in the Fortune 500 Index.
              Search results, index cards, and entity pages all use this common ruler.
            </p>
            <ScoreLegend />
          </div>
        </Container>
      </section>

      {/* #8 — Cross-index "state of the field" ranked mean bars */}
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
              Mean compassion score by index — 2026 (which index should I open?)
            </summary>
            <div className="border-t border-line px-5 py-4">
              <p className="text-muted text-[0.82rem] mb-3 max-w-[700px]">
                Each bar shows the mean composite score across all entities in that index.
                Sorted highest to lowest. Band color reflects the mean band.
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

      {/* Current indexes (#1 — all 7 real indexes) */}
      <section className="py-[30px]" id="pick-entity-to-watch">
        <Container>
          <PickEntityCallout />
          <SectionHead
            title="Current indexes"
            description={`The benchmark publishes seven index families. All ${SCORED_ENTITY_COUNT_FORMATTED} entities across all 7 indexes are scored on the same 8-dimension, 0–100 ruler — making cross-sector comparison possible.`}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Countries — featured card */}
            <Card href="/countries" variant="featured">
              <div className="flex gap-2.5 flex-wrap mb-3">
                <Pill>2026</Pill>
                <Pill>Governments</Pill>
                <Pill>First Published Report</Pill>
              </div>
              <h3 className="text-[1.08rem] font-bold mb-2">Countries Index</h3>
              <p className="text-muted mb-3">Global benchmark of countries and territories using the full public institutional compassion framework.</p>
              {/* #9 — band mini-strip + entity count */}
              <div className="mt-auto pt-2 space-y-1.5">
                <p className="text-[0.74rem] text-muted">{countriesData.rankings.length} entities</p>
                <BandDistributionBar index="countries" compact />
              </div>
            </Card>
            {/* Remaining 6 index cards */}
            {INDEX_CARDS.map((item) => (
              <Card key={item.href} href={item.href}>
                <div className="flex gap-2.5 flex-wrap mb-3">
                  {item.pills.map((p) => <Pill key={p}>{p}</Pill>)}
                </div>
                <h3 className="text-[1.08rem] font-bold mb-2">{item.title}</h3>
                <p className="text-muted mb-3">{item.desc}</p>
                {/* #9 — band mini-strip + entity count */}
                <div className="mt-auto pt-2 space-y-1.5">
                  <p className="text-[0.74rem] text-muted">{item.count} entities</p>
                  <BandDistributionBar index={item.slug} compact />
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Featured launch */}
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

      {/* Assess Your Organization — services callout (moved out of index grid) */}
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

      {/* Public benchmark first */}
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

      {/* Monetization + Independence */}
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

      {/* Turn index traffic into revenue */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="Go deeper with benchmark products"
            description="Move from public rankings into professional reports, licensed data, advisory interpretation, certified assessments, and enterprise access."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { href: GUMROAD.countriesIndex, external: true, pills: ["Featured Product", "Direct Purchase"], title: "Buy the 2026 Countries Index", desc: "Purchase the first published Compassion Benchmark digital report directly as an Individual Research License edition." },
              { href: "/purchase-research", external: false, pills: ["Reports", "Catalog"], title: "Purchase Research", desc: "Browse benchmark reports by year and target area, including premium PDF formats, appendices, and bundled publications." },
              { href: "/data-licenses", external: false, pills: ["Data", "Licensing"], title: "License Benchmark Data", desc: "Access structured benchmark datasets for internal analysis, research workflows, and institutional intelligence use." },
              { href: "/advisory", external: false, pills: ["Advisory", "Interpretation"], title: "Book Advisory Support", desc: "Translate benchmark findings into peer comparison, strategic interpretation, executive discussion, and action priorities." },
              { href: "/certified-assessments", external: false, pills: ["Assessment", "Formal Review"], title: "Request a Certified Assessment", desc: "Move from public benchmark visibility into a structured, assessor-led review process with findings and next steps." },
              { href: "/enterprise", external: false, pills: ["Enterprise", "Institutional"], title: "Explore Enterprise Access", desc: "Combine reports, data, advisory, and recurring support into a broader enterprise benchmark relationship." },
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

      {/* Closing navigation + trust (S1.4/1C) */}
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
