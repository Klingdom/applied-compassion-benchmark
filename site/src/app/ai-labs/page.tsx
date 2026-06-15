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
import CrawlableRankingTable from "@/components/seo/CrawlableRankingTable";
import IndexPageCharts from "@/components/index/IndexPageCharts";
import data from "@/data/indexes/ai-labs.json";

export const metadata: Metadata = {
  title: "AI Labs Index 2026",
  description: "The Compassion Benchmark AI Labs Index evaluates 50 leading AI organizations across safety, accountability, deployment boundaries, equity, and integrity.",
};

const columns: ColumnDef[] = [
  { key: "rank", label: "Rank", type: "number" },
  { key: "name", label: "Lab", type: "text" },
  { key: "sector", label: "Sector", type: "text" },
  { key: "hq", label: "HQ", type: "text" },
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

export default function AILabsPage() {
  return (
    <>
      <DatasetJsonLd
        name="Compassion Benchmark AI Labs Index 2026"
        description="Rankings of 50 leading AI organizations across 8 dimensions of institutional compassion including safety governance, transparency, accountability, deployment boundaries, and equity."
        url="/ai-labs"
        indexSlug="ai-labs"
        entityCount={data.rankings.length}
        keywords={["compassion benchmark", "AI labs", "AI safety", "AI ethics", "artificial intelligence", "AI governance"]}
      />
      <BreadcrumbJsonLd items={[
        { name: "Home",    url: breadcrumbUrl("/") },
        { name: "Indexes", url: breadcrumbUrl("/indexes") },
        { name: "AI Labs Index", url: breadcrumbUrl("/ai-labs") },
      ]} />
      {/* Top-5 AEO: answer-first lead sentence — pure restatement of index data */}
      {topEntry && bottomEntry && (
        <p className="text-[0.9rem] text-muted text-center py-3 px-4 border-b border-line/40 bg-[rgba(255,255,255,0.01)]">
          As of 2026,{" "}
          <span className="text-text font-medium">{topEntry.name}</span> is the most compassionate AI lab (
          <span className="text-text font-medium">{topEntry.composite.toFixed(1)}/100</span>,{" "}
          {String(topEntry.band).charAt(0).toUpperCase() + String(topEntry.band).slice(1).toLowerCase()}) and{" "}
          <span className="text-text font-medium">{bottomEntry.name}</span> the least (
          <span className="text-text font-medium">{bottomEntry.composite.toFixed(1)}/100</span>,{" "}
          {String(bottomEntry.band).charAt(0).toUpperCase() + String(bottomEntry.band).slice(1).toLowerCase()}) on the Compassion Benchmark AI Labs Index, which scores{" "}
          <span className="text-text font-medium">{data.rankings.length}</span> AI labs across 8 dimensions.
        </p>
      )}

      <IndexHero
        eyebrow="AI Labs Compassion Benchmark · 2026"
        title="AI Labs Compassion Benchmark Index 2026"
        description="Benchmark of 50 leading AI organizations across safety governance, transparency, accountability, deployment boundaries, equity, and institutional integrity."
        stats={[
          { value: String(data.meta.entityCount || 50), label: "Labs ranked" },
          { value: String(data.meta.meanScore || "—"), label: "Mean score" },
          { value: String(data.meta.medianScore || "—"), label: "Median score" },
          { value: "8", label: "Dimensions" },
          { value: "2026", label: "Publication year" },
        ]}
        indexSlug="ai-labs"
      >
        <div className="flex gap-3 flex-wrap">
          <Button href={GUMROAD.aiLabsIndex} variant="primary" external>Purchase Full Report — $195</Button>
          <Button href="/methodology">Read Methodology</Button>
        </div>
      </IndexHero>
      <IndexPageCharts
        rankings={data.rankings as Parameters<typeof IndexPageCharts>[0]["rankings"]}
        indexSlug="ai-labs"
        groupKey="sector"
        groupLabel="Sector"
        indexMean={data.meta.meanScore}
        medianScore={data.meta.medianScore}
        indexName="AI Labs"
        indexPagePath="/ai-labs"
      />
      <section className="py-[30px]">
        <Container>
          <SectionHead title="Full rankings" description="Search, filter by sector, and sort the complete AI Labs benchmark index." />
          <RankingTable
            data={data.rankings}
            columns={columns}
            searchPlaceholder="Search lab..."
            filterKey="sector"
            filterLabel="All sectors"
            ctaText="Purchase the AI Labs Index Report — $195, delivered as PDF"
            ctaDescription="Complete rankings for 50 AI labs with safety governance analysis, deployment risk assessment, and dimensional findings."
            ctaLink={GUMROAD.aiLabsIndex}
            ctaExternal
            ctaButtonLabel="Buy on Gumroad"
            entityKind="ai-lab"
          />
          <CrawlableRankingTable data={data.rankings} indexName="AI Labs Compassion Benchmark Index 2026" nameLabel="Lab" />
        </Container>
      </section>
      <section className="py-[30px]">
        <Container>
          <Callout>
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] mb-2">Purchase the AI Labs benchmark report</h2>
            <p className="text-muted max-w-[900px] mb-[18px]">The full report includes lab profiles, safety governance analysis, deployment risk assessment, and dimensional findings.</p>
            <div className="flex gap-3 flex-wrap">
              <Button href={GUMROAD.aiLabsIndex} variant="primary" external>Buy on Gumroad — $195</Button>
              <Button href="/contact-sales">Contact Sales</Button>
            </div>
          </Callout>
        </Container>
      </section>
    </>
  );
}
