import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import IndexHero from "@/components/index/IndexHero";
import RankingTable, { ColumnDef } from "@/components/index/RankingTable";
import SectionHead from "@/components/ui/SectionHead";
import Panel from "@/components/ui/Panel";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Callout from "@/components/ui/Callout";
import Pill from "@/components/ui/Pill";
import { GUMROAD } from "@/data/gumroad";
import DatasetJsonLd from "@/components/seo/DatasetJsonLd";
import BreadcrumbJsonLd, { breadcrumbUrl } from "@/components/seo/BreadcrumbJsonLd";
import FaqJsonLd from "@/components/seo/FaqJsonLd";
import FaqAccordion from "@/components/seo/FaqAccordion";
import CrawlableRankingTable from "@/components/seo/CrawlableRankingTable";
import IndexPageCharts from "@/components/index/IndexPageCharts";
import data from "@/data/indexes/fortune-500.json";

export const metadata: Metadata = {
  title: "Most & Least Compassionate Fortune 500 Companies 2026 — Compassion Benchmark",
  description:
    "See which Fortune 500 companies rank most and least compassionate in 2026. Compassion Benchmark scores 447 corporations across 8 dimensions including awareness, equity, and integrity.",
};

const columns: ColumnDef[] = [
  { key: "rank", label: "CR", type: "number" },
  { key: "f500", label: "F500", type: "number" },
  { key: "name", label: "Company", type: "text" },
  { key: "sector", label: "Sector", type: "text" },
  { key: "scores.AWR", label: "AWR" },
  { key: "scores.EMP", label: "EMP" },
  { key: "scores.ACT", label: "ACT" },
  { key: "scores.EQU", label: "EQU" },
  { key: "scores.BND", label: "BND" },
  { key: "scores.ACC", label: "ACC" },
  { key: "scores.SYS", label: "SYS" },
  { key: "scores.INT", label: "INT" },
  { key: "composite", label: "Score", type: "score" },
  { key: "band", label: "Band", type: "band" },
];

// Answer-first data — derived from real index data only. No fabricated values.
const topEntry = data.rankings[0];
const bottomEntry = data.rankings[data.rankings.length - 1];

// G1.4: Index-page FAQ — real data only, no fabrication.
const indexFaqItems = [
  ...(topEntry && bottomEntry ? [
    {
      question: "What is the most compassionate Fortune 500 company in 2026?",
      answer: `As of 2026, ${topEntry.name} is the most compassionate Fortune 500 company on the Compassion Benchmark, with a composite score of ${topEntry.composite.toFixed(1)}/100 (${String(topEntry.band).charAt(0).toUpperCase() + String(topEntry.band).slice(1).toLowerCase()}).`,
    },
    {
      question: "What is the least compassionate Fortune 500 company in 2026?",
      answer: `As of 2026, ${bottomEntry.name} ranks last in the Compassion Benchmark Fortune 500 Index, with a composite score of ${bottomEntry.composite.toFixed(1)}/100 (${String(bottomEntry.band).charAt(0).toUpperCase() + String(bottomEntry.band).slice(1).toLowerCase()}).`,
    },
  ] : []),
  {
    question: "How many Fortune 500 companies are scored?",
    answer: `The Compassion Benchmark Fortune 500 Index scores ${data.rankings.length} companies across 8 dimensions of institutional compassion.`,
  },
  {
    question: "How is the compassion score calculated?",
    answer: "The score is a composite across 8 dimensions (Awareness, Empathy, Action, Equity, Boundaries, Accountability, Systemic Impact, and Integrity), each scored 0–5 from behavioral evidence, then converted to a 0–100 scale with an integration premium for balanced profiles. See compassionbenchmark.com/methodology for the full framework.",
  },
];

export default function Fortune500Page() {
  return (
    <>
      <DatasetJsonLd
        name="Compassion Benchmark Fortune 500 Index 2026"
        description="Rankings of 447 Fortune 500 companies across 8 dimensions of institutional compassion including awareness, empathy, action, equity, boundaries, accountability, systemic impact, and integrity."
        url="/fortune-500"
        indexSlug="fortune-500"
        entityCount={data.rankings.length}
        keywords={["compassion benchmark", "Fortune 500", "corporate compassion", "ESG", "corporate responsibility", "company rankings"]}
      />
      <BreadcrumbJsonLd items={[
        { name: "Home",    url: breadcrumbUrl("/") },
        { name: "Indexes", url: breadcrumbUrl("/indexes") },
        { name: "Fortune 500 Index", url: breadcrumbUrl("/fortune-500") },
      ]} />
      <FaqJsonLd items={indexFaqItems} />
      {/* Top-5 AEO: answer-first lead sentence — pure restatement of index data */}
      {topEntry && bottomEntry && (
        <p className="text-[0.9rem] text-muted text-center py-3 px-4 border-b border-line/40 bg-[rgba(255,255,255,0.01)]">
          As of 2026,{" "}
          <span className="text-text font-medium">{topEntry.name}</span> is the most compassionate Fortune 500 company (
          <span className="text-text font-medium">{topEntry.composite.toFixed(1)}/100</span>,{" "}
          {String(topEntry.band).charAt(0).toUpperCase() + String(topEntry.band).slice(1).toLowerCase()}) and{" "}
          <span className="text-text font-medium">{bottomEntry.name}</span> the least (
          <span className="text-text font-medium">{bottomEntry.composite.toFixed(1)}/100</span>,{" "}
          {String(bottomEntry.band).charAt(0).toUpperCase() + String(bottomEntry.band).slice(1).toLowerCase()}) on the Compassion Benchmark Fortune 500 Index, which scores{" "}
          <span className="text-text font-medium">{data.rankings.length}</span> companies across 8 dimensions.
        </p>
      )}

      <IndexHero
        eyebrow="Fortune 500 Compassion Benchmark · 2026"
        title="Fortune 500 Compassion Benchmark Index 2026"
        description="The Fortune 500 Compassion Benchmark Index evaluates 447 of America's largest corporations across eight dimensions of institutional compassion: Awareness, Empathy, Action, Equity, Boundaries, Accountability, Systems Thinking, and Integrity."
        stats={[
          { value: String(data.meta.entityCount), label: "Companies ranked" },
          { value: String(data.meta.meanScore), label: "Mean score" },
          { value: String(data.meta.medianScore), label: "Median score" },
          { value: "8", label: "Dimensions" },
          { value: "2026", label: "Publication year" },
        ]}
        indexSlug="fortune-500"
      >
        <div className="flex gap-3 flex-wrap">
          <Button href={GUMROAD.fortune500Index} variant="primary" external>
            Purchase Full Report — $195
          </Button>
          <Button href="/methodology">Read Methodology</Button>
        </div>
      </IndexHero>

      <IndexPageCharts
        rankings={data.rankings as Parameters<typeof IndexPageCharts>[0]["rankings"]}
        indexSlug="fortune-500"
        groupKey="sector"
        groupLabel="Sector"
        indexMean={data.meta.meanScore}
        medianScore={data.meta.medianScore}
        indexName="Fortune 500"
        indexPagePath="/fortune-500"
      />

      {/* Rankings table */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="Full rankings"
            description="Search, filter by sector, and sort the complete Fortune 500 benchmark index."
          />
          <RankingTable
            data={data.rankings}
            columns={columns}
            searchPlaceholder="Search company..."
            filterKey="sector"
            filterLabel="All sectors"
            ctaText="Purchase the Fortune 500 Index Report — $195, delivered as PDF"
            ctaDescription="Complete rankings for 447 companies with methodology, sector analysis, key findings, themes among the highest-ranked, and concerns among the lowest-performing."
            ctaLink={GUMROAD.fortune500Index}
            ctaExternal
            ctaButtonLabel="Buy on Gumroad"
            entityKind="company"
          />
          <CrawlableRankingTable data={data.rankings} indexName="Fortune 500 Compassion Benchmark Index 2026" nameLabel="Company" />
        </Container>
      </section>

      {/* Key findings */}
      <section className="py-[30px]">
        <Container>
          <SectionHead title="Key findings" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Panel>
              <h3 className="text-[1.08rem] font-bold mb-2.5">Equity is the weakest dimension</h3>
              <p className="text-muted">
                With an average score of 2.25, Equity consistently lags behind other dimensions across the Fortune 500. This suggests most large corporations have not yet built systems that distribute care, access, or protection equitably across stakeholders.
              </p>
            </Panel>
            <Panel>
              <h3 className="text-[1.08rem] font-bold mb-2.5">Finance leads by sector</h3>
              <p className="text-muted">
                Financial services companies disproportionately appear in the upper ranks, driven by stronger governance, compliance infrastructure, and public accountability mechanisms.
              </p>
            </Panel>
            <Panel>
              <h3 className="text-[1.08rem] font-bold mb-2.5">The developing band is the largest</h3>
              <p className="text-muted">
                164 companies — nearly 37% of the index — fall in the Developing band. This means the majority of large corporations show fragmented rather than systemic compassion.
              </p>
            </Panel>
          </div>
        </Container>
      </section>

      {/* Services CTA */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="Go deeper"
            description="Move from public rankings into premium reports, data licensing, advisory support, or enterprise access."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                href: "/purchase-research",
                pills: ["Reports"],
                title: "Purchase Research",
                desc: "Buy the full Fortune 500 benchmark report in premium PDF format.",
              },
              {
                href: "/data-licenses",
                pills: ["Data"],
                title: "License Data",
                desc: "Access structured benchmark datasets for internal analysis.",
              },
              {
                href: "/advisory",
                pills: ["Advisory"],
                title: "Book Advisory",
                desc: "Get interpretive briefings and peer comparison analysis.",
              },
              {
                href: "/enterprise",
                pills: ["Enterprise"],
                title: "Enterprise Access",
                desc: "Recurring institutional benchmark access and support.",
              },
            ].map((item) => (
              <Card key={item.href} href={item.href} variant="service">
                <div className="flex gap-2 flex-wrap">
                  {item.pills.map((p) => (
                    <Pill key={p}>{p}</Pill>
                  ))}
                </div>
                <h3 className="text-[1.08rem] font-bold">{item.title}</h3>
                <p className="text-muted">{item.desc}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Final CTA */}
      <section className="py-[30px]">
        <Container>
          <Callout>
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] mb-2">
              Purchase the complete Fortune 500 benchmark report
            </h2>
            <p className="text-muted max-w-[900px] mb-[18px]">
              The full report includes methodology details, sector-level analysis, key findings, themes among the highest-performing companies, concerns among the lowest-performing, and structured appendix data.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Button href={GUMROAD.fortune500Index} variant="primary" external>
                Buy on Gumroad — $195
              </Button>
              <Button href="/contact-sales">Contact Sales</Button>
            </div>
          </Callout>
        </Container>
      </section>

      {/* G1.4: FAQ accordion — visible content required alongside FaqJsonLd */}
      <section className="py-[30px]">
        <Container>
          <FaqAccordion items={indexFaqItems} />
        </Container>
      </section>
    </>
  );
}
