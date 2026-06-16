import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import IndexHero from "@/components/index/IndexHero";
import RankingTable, { ColumnDef } from "@/components/index/RankingTable";
import SectionHead from "@/components/ui/SectionHead";
import Button from "@/components/ui/Button";
import Callout from "@/components/ui/Callout";
import { GUMROAD } from "@/data/gumroad";
import DatasetJsonLd from "@/components/seo/DatasetJsonLd";
import BreadcrumbJsonLd, { breadcrumbUrl } from "@/components/seo/BreadcrumbJsonLd";
import FaqJsonLd from "@/components/seo/FaqJsonLd";
import FaqAccordion from "@/components/seo/FaqAccordion";
import CrawlableRankingTable from "@/components/seo/CrawlableRankingTable";
import IndexPageCharts from "@/components/index/IndexPageCharts";
import data from "@/data/indexes/countries.json";

export const metadata: Metadata = {
  title: "Most & Least Compassionate Countries 2026 — Compassion Benchmark",
  description:
    "See which countries rank most and least compassionate in 2026. The Compassion Benchmark scores 193 countries across 8 dimensions of institutional compassion, from awareness to integrity.",
};

const columns: ColumnDef[] = [
  { key: "rank", label: "Rank", type: "number" },
  { key: "name", label: "Country", type: "text" },
  { key: "region", label: "Region", type: "text" },
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
      question: "What is the most compassionate country in 2026?",
      answer: `As of 2026, ${topEntry.name} is the most compassionate country on the Compassion Benchmark, with a composite score of ${topEntry.composite.toFixed(1)}/100 (${String(topEntry.band).charAt(0).toUpperCase() + String(topEntry.band).slice(1).toLowerCase()}).`,
    },
    {
      question: "What is the least compassionate country in 2026?",
      answer: `As of 2026, ${bottomEntry.name} ranks last in the Compassion Benchmark World Countries Index, with a composite score of ${bottomEntry.composite.toFixed(1)}/100 (${String(bottomEntry.band).charAt(0).toUpperCase() + String(bottomEntry.band).slice(1).toLowerCase()}).`,
    },
  ] : []),
  {
    question: "How many countries are scored?",
    answer: `The Compassion Benchmark World Countries Index scores ${data.rankings.length} countries across 8 dimensions of institutional compassion.`,
  },
  {
    question: "How is the compassion score calculated?",
    answer: "The score is a composite across 8 dimensions (Awareness, Empathy, Action, Equity, Boundaries, Accountability, Systemic Impact, and Integrity), each scored 0–5 from behavioral evidence, then converted to a 0–100 scale with an integration premium for balanced profiles. See compassionbenchmark.com/methodology for the full framework.",
  },
];

export default function CountriesPage() {
  return (
    <>
      <DatasetJsonLd
        name="Compassion Benchmark World Countries Index 2026"
        description="Comparative rankings of 193 countries across 8 dimensions of institutional compassion including awareness, empathy, action, equity, boundaries, accountability, systemic impact, and integrity."
        url="/countries"
        indexSlug="countries"
        entityCount={data.rankings.length}
        keywords={["compassion benchmark", "countries", "institutional compassion", "country rankings", "governance", "social policy"]}
      />
      <BreadcrumbJsonLd items={[
        { name: "Home",    url: breadcrumbUrl("/") },
        { name: "Indexes", url: breadcrumbUrl("/indexes") },
        { name: "World Countries Index", url: breadcrumbUrl("/countries") },
      ]} />
      <FaqJsonLd items={indexFaqItems} />
      {/* Top-5 AEO: answer-first lead sentence — pure restatement of index data */}
      {topEntry && bottomEntry && (
        <p className="text-[0.9rem] text-muted text-center py-3 px-4 border-b border-line/40 bg-[rgba(255,255,255,0.01)]">
          As of 2026,{" "}
          <span className="text-text font-medium">{topEntry.name}</span> is the most compassionate country (
          <span className="text-text font-medium">{topEntry.composite.toFixed(1)}/100</span>,{" "}
          {String(topEntry.band).charAt(0).toUpperCase() + String(topEntry.band).slice(1).toLowerCase()}) and{" "}
          <span className="text-text font-medium">{bottomEntry.name}</span> the least (
          <span className="text-text font-medium">{bottomEntry.composite.toFixed(1)}/100</span>,{" "}
          {String(bottomEntry.band).charAt(0).toUpperCase() + String(bottomEntry.band).slice(1).toLowerCase()}) on the Compassion Benchmark World Countries Index, which scores{" "}
          <span className="text-text font-medium">{data.rankings.length}</span> countries across 8 dimensions.
        </p>
      )}

      <IndexHero
        eyebrow="World Countries Compassion Benchmark · 2026"
        title="World Countries Compassion Benchmark Index 2026"
        description="Comparative benchmark of 207 countries and territories across the full institutional compassion framework. Scores are derived from public evidence across governance, policy, healthcare, social protection, rights, equity, and institutional accountability."
        stats={[
          { value: String(data.meta.entityCount || 207), label: "Countries ranked" },
          { value: String(data.meta.meanScore || "—"), label: "Mean score" },
          { value: String(data.meta.medianScore || "—"), label: "Median score" },
          { value: "8", label: "Dimensions" },
          { value: "2026", label: "Publication year" },
        ]}
        indexSlug="countries"
      >
        <div className="flex gap-3 flex-wrap">
          <Button href={GUMROAD.countriesIndex} variant="primary" external>
            Purchase 2026 Countries Index
          </Button>
          <Button href="/methodology">Read Methodology</Button>
        </div>
      </IndexHero>

      <IndexPageCharts
        rankings={data.rankings as Parameters<typeof IndexPageCharts>[0]["rankings"]}
        indexSlug="countries"
        groupKey="region"
        groupLabel="Region"
        indexMean={data.meta.meanScore}
        medianScore={data.meta.medianScore}
        indexName="World Countries"
        indexPagePath="/countries"
      />

      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="Full rankings"
            description="Search, filter by region, and sort the complete countries benchmark index."
          />
          <RankingTable
            data={data.rankings}
            columns={columns}
            searchPlaceholder="Search country..."
            filterKey="region"
            filterLabel="All regions"
            ctaText="Purchase the Countries Index Report — $195, delivered as PDF"
            ctaDescription="Complete rankings for 193 countries with methodology, regional analysis, dimension-level breakdowns, and key findings."
            ctaLink={GUMROAD.countriesIndex}
            ctaExternal
            ctaButtonLabel="Buy on Gumroad"
            entityKind="country"
          />
          <CrawlableRankingTable data={data.rankings} indexName="World Countries Compassion Benchmark Index 2026" nameLabel="Country" />
        </Container>
      </section>

      <section className="py-[30px]">
        <Container>
          <Callout>
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] mb-2">
              Purchase the 2026 Countries Compassion Benchmark Index
            </h2>
            <p className="text-muted max-w-[900px] mb-[18px]">
              The first published flagship report from Compassion Benchmark. Includes complete rankings, methodology, key findings, regional analysis, and structural concerns.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Button href={GUMROAD.countriesIndex} variant="primary" external>
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
