import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import IndexHero from "@/components/index/IndexHero";
import RankingTable, { ColumnDef } from "@/components/index/RankingTable";
import SectionHead from "@/components/ui/SectionHead";
import Button from "@/components/ui/Button";
import Callout from "@/components/ui/Callout";
import DatasetJsonLd from "@/components/seo/DatasetJsonLd";
import BreadcrumbJsonLd, { breadcrumbUrl } from "@/components/seo/BreadcrumbJsonLd";
import CrawlableRankingTable from "@/components/seo/CrawlableRankingTable";
import IndexPageCharts from "@/components/index/IndexPageCharts";
import data from "@/data/indexes/us-states.json";

export const metadata: Metadata = {
  title: "United States Index 2026",
  description: "The Compassion Benchmark U.S. States Index ranks all 50 states and DC across eight dimensions of institutional compassion.",
};

const columns: ColumnDef[] = [
  { key: "rank", label: "Rank", type: "number" },
  { key: "name", label: "State", type: "text" },
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

export default function USStatesPage() {
  return (
    <>
      <DatasetJsonLd
        name="Compassion Benchmark U.S. States Index 2026"
        description="Rankings of all 50 U.S. states and the District of Columbia across 8 dimensions of institutional compassion including policy, equity, healthcare, social protection, and accountability."
        url="/us-states"
        indexSlug="us-states"
        entityCount={data.rankings.length}
        keywords={["compassion benchmark", "US states", "state rankings", "state policy", "social policy", "healthcare access"]}
      />
      <BreadcrumbJsonLd items={[
        { name: "Home",    url: breadcrumbUrl("/") },
        { name: "Indexes", url: breadcrumbUrl("/indexes") },
        { name: "U.S. States Index", url: breadcrumbUrl("/us-states") },
      ]} />
      {/* Top-5 AEO: answer-first lead sentence — pure restatement of index data */}
      {topEntry && bottomEntry && (
        <p className="text-[0.9rem] text-muted text-center py-3 px-4 border-b border-line/40 bg-[rgba(255,255,255,0.01)]">
          As of 2026,{" "}
          <span className="text-text font-medium">{topEntry.name}</span> is the most compassionate U.S. state (
          <span className="text-text font-medium">{topEntry.composite.toFixed(1)}/100</span>,{" "}
          {String(topEntry.band).charAt(0).toUpperCase() + String(topEntry.band).slice(1).toLowerCase()}) and{" "}
          <span className="text-text font-medium">{bottomEntry.name}</span> the least (
          <span className="text-text font-medium">{bottomEntry.composite.toFixed(1)}/100</span>,{" "}
          {String(bottomEntry.band).charAt(0).toUpperCase() + String(bottomEntry.band).slice(1).toLowerCase()}) on the Compassion Benchmark U.S. States Index, which scores{" "}
          <span className="text-text font-medium">{data.rankings.length}</span> U.S. states across 8 dimensions.
        </p>
      )}

      <IndexHero
        eyebrow="United States Compassion Benchmark · 2026"
        title="United States Compassion Benchmark Index 2026"
        description="Comparative benchmark of all 50 U.S. states and the District of Columbia across policy, equity, healthcare, social protection, accountability, and structural care capacity."
        stats={[
          { value: String(data.meta.entityCount || 51), label: "States ranked" },
          { value: String(data.meta.meanScore || "—"), label: "Mean score" },
          { value: String(data.meta.medianScore || "—"), label: "Median score" },
          { value: "8", label: "Dimensions" },
          { value: "2026", label: "Publication year" },
        ]}
        indexSlug="us-states"
      >
        <div className="flex gap-3 flex-wrap">
          <Button href="/purchase-research" variant="primary">Purchase Full Report</Button>
          <Button href="/methodology">Read Methodology</Button>
        </div>
      </IndexHero>
      <IndexPageCharts
        rankings={data.rankings as Parameters<typeof IndexPageCharts>[0]["rankings"]}
        indexSlug="us-states"
        groupKey="region"
        groupLabel="Region"
        indexMean={data.meta.meanScore}
        medianScore={data.meta.medianScore}
        indexName="U.S. States"
        indexPagePath="/us-states"
      />
      <section className="py-[30px]">
        <Container>
          <SectionHead title="Full rankings" description="Search, filter by region, and sort the complete U.S. states benchmark index." />
          <RankingTable
            data={data.rankings}
            columns={columns}
            searchPlaceholder="Search state..."
            filterKey="region"
            filterLabel="All regions"
            ctaText="Purchase the U.S. States Index Report"
            ctaDescription="Complete rankings with regional analysis, dimension-level insights, and key structural findings. Configure your report and license."
            ctaLink="/purchase-research"
            ctaButtonLabel="Configure Your Report"
            entityKind="us-state"
          />
          <CrawlableRankingTable data={data.rankings} indexName="U.S. States Compassion Benchmark Index 2026" nameLabel="State" />
        </Container>
      </section>
      <section className="py-[30px]">
        <Container>
          <Callout>
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] mb-2">Purchase the U.S. States benchmark report</h2>
            <p className="text-muted max-w-[900px] mb-[18px]">Includes complete rankings, regional analysis, dimension-level insights, and key structural findings.</p>
            <div className="flex gap-3 flex-wrap">
              <Button href="/purchase-research" variant="primary">Purchase Report</Button>
              <Button href="/contact-sales">Contact Sales</Button>
            </div>
          </Callout>
        </Container>
      </section>
    </>
  );
}
