import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import IndexHero from "@/components/index/IndexHero";
import RankingTable, { ColumnDef } from "@/components/index/RankingTable";
import SectionHead from "@/components/ui/SectionHead";
import Button from "@/components/ui/Button";
import Callout from "@/components/ui/Callout";
import DatasetJsonLd from "@/components/seo/DatasetJsonLd";
import BreadcrumbJsonLd, { breadcrumbUrl } from "@/components/seo/BreadcrumbJsonLd";
import FaqJsonLd from "@/components/seo/FaqJsonLd";
import FaqAccordion from "@/components/seo/FaqAccordion";
import CrawlableRankingTable from "@/components/seo/CrawlableRankingTable";
import IndexPageCharts from "@/components/index/IndexPageCharts";
import data from "@/data/indexes/us-cities.json";

export const metadata: Metadata = {
  title: "Most & Least Compassionate U.S. Cities 2026 — Compassion Benchmark",
  description:
    "See which U.S. cities rank most and least compassionate in 2026. Compassion Benchmark scores 144 major American cities across 8 dimensions of institutional compassion.",
};

const columns: ColumnDef[] = [
  { key: "rank", label: "Rank", type: "number" },
  { key: "name", label: "City", type: "text" },
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
      question: "What is the most compassionate U.S. city in 2026?",
      answer: `As of 2026, ${topEntry.name} is the most compassionate U.S. city on the Compassion Benchmark, with a composite score of ${topEntry.composite.toFixed(1)}/100 (${String(topEntry.band).charAt(0).toUpperCase() + String(topEntry.band).slice(1).toLowerCase()}).`,
    },
    {
      question: "What is the least compassionate U.S. city in 2026?",
      answer: `As of 2026, ${bottomEntry.name} ranks last in the Compassion Benchmark U.S. Cities Index, with a composite score of ${bottomEntry.composite.toFixed(1)}/100 (${String(bottomEntry.band).charAt(0).toUpperCase() + String(bottomEntry.band).slice(1).toLowerCase()}).`,
    },
  ] : []),
  {
    question: "How many U.S. cities are scored?",
    answer: `The Compassion Benchmark U.S. Cities Index scores ${data.rankings.length} major American cities across 8 dimensions of institutional compassion.`,
  },
  {
    question: "How is the compassion score calculated?",
    answer: "The score is a composite across 8 dimensions (Awareness, Empathy, Action, Equity, Boundaries, Accountability, Systemic Impact, and Integrity), each scored 0–5 from behavioral evidence, then converted to a 0–100 scale with an integration premium for balanced profiles. See compassionbenchmark.com/methodology for the full framework.",
  },
];

export default function USCitiesPage() {
  return (
    <>
      <DatasetJsonLd
        name="Compassion Benchmark U.S. Cities Index 2026"
        description="Rankings of 144 major American cities across 8 dimensions of institutional compassion including governance, equity, healthcare access, and structural care capacity."
        url="/us-cities"
        indexSlug="us-cities"
        entityCount={data.rankings.length}
        keywords={["compassion benchmark", "US cities", "city rankings", "municipal compassion", "urban policy", "city governance"]}
      />
      <BreadcrumbJsonLd items={[
        { name: "Home",    url: breadcrumbUrl("/") },
        { name: "Indexes", url: breadcrumbUrl("/indexes") },
        { name: "U.S. Cities Index", url: breadcrumbUrl("/us-cities") },
      ]} />
      <FaqJsonLd items={indexFaqItems} />
      {/* Top-5 AEO: answer-first lead sentence — pure restatement of index data */}
      {topEntry && bottomEntry && (
        <p className="text-[0.9rem] text-muted text-center py-3 px-4 border-b border-line/40 bg-[rgba(255,255,255,0.01)]">
          As of 2026,{" "}
          <span className="text-text font-medium">{topEntry.name}</span> is the most compassionate U.S. city (
          <span className="text-text font-medium">{topEntry.composite.toFixed(1)}/100</span>,{" "}
          {String(topEntry.band).charAt(0).toUpperCase() + String(topEntry.band).slice(1).toLowerCase()}) and{" "}
          <span className="text-text font-medium">{bottomEntry.name}</span> the least (
          <span className="text-text font-medium">{bottomEntry.composite.toFixed(1)}/100</span>,{" "}
          {String(bottomEntry.band).charAt(0).toUpperCase() + String(bottomEntry.band).slice(1).toLowerCase()}) on the Compassion Benchmark U.S. Cities Index, which scores{" "}
          <span className="text-text font-medium">{data.rankings.length}</span> U.S. cities across 8 dimensions.
        </p>
      )}

      <IndexHero
        eyebrow="U.S. Cities Compassion Benchmark · 2026"
        title="Top U.S. Cities Compassion Benchmark Index 2026"
        description="Comparative benchmark of major American cities across the institutional compassion framework, including governance, equity, healthcare access, and structural care capacity."
        stats={[
          { value: String(data.meta.entityCount || 144), label: "Cities ranked" },
          { value: String(data.meta.meanScore || "—"), label: "Mean score" },
          { value: String(data.meta.medianScore || "—"), label: "Median score" },
          { value: "8", label: "Dimensions" },
          { value: "2026", label: "Publication year" },
        ]}
        indexSlug="us-cities"
      >
        <div className="flex gap-3 flex-wrap">
          <Button href="/purchase-research" variant="primary">Purchase Full Report</Button>
          <Button href="/methodology">Read Methodology</Button>
        </div>
      </IndexHero>
      <IndexPageCharts
        rankings={data.rankings as Parameters<typeof IndexPageCharts>[0]["rankings"]}
        indexSlug="us-cities"
        groupKey="region"
        groupLabel="Region"
        indexMean={data.meta.meanScore}
        medianScore={data.meta.medianScore}
        indexName="U.S. Cities"
        indexPagePath="/us-cities"
      />
      <section className="py-[30px]">
        <Container>
          <SectionHead title="Full rankings" description="Search, filter by region, and sort the complete U.S. cities benchmark index." />
          <RankingTable
            data={data.rankings}
            columns={columns}
            searchPlaceholder="Search city..."
            filterKey="region"
            filterLabel="All regions"
            ctaText="Purchase the U.S. Cities Index Report"
            ctaDescription="Complete rankings for 144 cities with regional analysis and structural findings. Configure your report and license."
            ctaLink="/purchase-research"
            ctaButtonLabel="Configure Your Report"
            entityKind="us-city"
          />
          <CrawlableRankingTable data={data.rankings} indexName="U.S. Cities Compassion Benchmark Index 2026" nameLabel="City" />
        </Container>
      </section>
      <section className="py-[30px]">
        <Container>
          <Callout>
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] mb-2">Purchase the U.S. Cities benchmark report</h2>
            <p className="text-muted max-w-[900px] mb-[18px]">Full report includes complete city rankings, regional analysis, and structural findings.</p>
            <div className="flex gap-3 flex-wrap">
              <Button href="/purchase-research" variant="primary">Purchase Report</Button>
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
