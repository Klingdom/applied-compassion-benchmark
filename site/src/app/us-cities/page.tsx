import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import IndexHero from "@/components/index/IndexHero";
import RankingTable, { ColumnDef } from "@/components/index/RankingTable";
import SectionHead from "@/components/ui/SectionHead";
import Button from "@/components/ui/Button";
import Callout from "@/components/ui/Callout";
import DatasetJsonLd from "@/components/seo/DatasetJsonLd";
import CrawlableRankingTable from "@/components/seo/CrawlableRankingTable";
import data from "@/data/indexes/us-cities.json";

export const metadata: Metadata = {
  title: "Top 150 U.S. Cities Index 2026",
  description: "The Compassion Benchmark U.S. Cities Index ranks 144 major American cities across the institutional compassion framework.",
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

export default function USCitiesPage() {
  return (
    <>
      <DatasetJsonLd
        name="Compassion Benchmark U.S. Cities Index 2026"
        description="Rankings of 144 major American cities across 8 dimensions of institutional compassion including governance, equity, healthcare access, and structural care capacity."
        url="/us-cities"
        entityCount={data.rankings.length}
        keywords={["compassion benchmark", "US cities", "city rankings", "municipal compassion", "urban policy", "city governance"]}
      />
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
        bands={data.bands.map((b) => ({
          name: b.name,
          level: b.name.toLowerCase() as "exemplary" | "established" | "functional" | "developing" | "critical",
          range: b.range, count: b.count, pct: b.pct,
        }))}
      >
        <div className="flex gap-3 flex-wrap">
          <Button href="/purchase-research" variant="primary">Purchase Full Report</Button>
          <Button href="/methodology">Read Methodology</Button>
        </div>
      </IndexHero>
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
    </>
  );
}
