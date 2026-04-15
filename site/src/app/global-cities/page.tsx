import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import IndexHero from "@/components/index/IndexHero";
import RankingTable, { ColumnDef } from "@/components/index/RankingTable";
import SectionHead from "@/components/ui/SectionHead";
import Button from "@/components/ui/Button";
import Callout from "@/components/ui/Callout";
import { GUMROAD } from "@/data/gumroad";
import DatasetJsonLd from "@/components/seo/DatasetJsonLd";
import CrawlableRankingTable from "@/components/seo/CrawlableRankingTable";
import data from "@/data/indexes/global-cities.json";

export const metadata: Metadata = {
  title: "Top 250 Global Cities Index 2026",
  description: "The Compassion Benchmark Global Cities Index ranks 250 cities worldwide across the institutional compassion framework.",
};

const columns: ColumnDef[] = [
  { key: "rank", label: "Rank", type: "number" },
  { key: "name", label: "City", type: "text" },
  { key: "country", label: "Country", type: "text" },
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

export default function GlobalCitiesPage() {
  return (
    <>
      <DatasetJsonLd
        name="Compassion Benchmark Global Cities Index 2026"
        description="Rankings of 250 cities worldwide across 8 dimensions of institutional compassion including governance, equity, healthcare access, social protection, and structural care capacity."
        url="/global-cities"
        entityCount={data.rankings.length}
        keywords={["compassion benchmark", "global cities", "city rankings", "urban compassion", "municipal governance", "city policy"]}
      />
      <IndexHero
        eyebrow="Global Cities Compassion Benchmark · 2026"
        title="Top 250 Global Cities Compassion Benchmark Index 2026"
        description="Comparative benchmark of 250 cities worldwide across governance, equity, healthcare access, social protection, and structural care capacity."
        stats={[
          { value: String(data.meta.entityCount || 250), label: "Cities ranked" },
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
          <Button href={GUMROAD.globalCitiesIndex} variant="primary" external>Purchase Full Report — $195</Button>
          <Button href="/methodology">Read Methodology</Button>
        </div>
      </IndexHero>
      <section className="py-[30px]">
        <Container>
          <SectionHead title="Full rankings" description="Search, filter by country or region, and sort the complete global cities benchmark index." />
          <RankingTable
            data={data.rankings}
            columns={columns}
            searchPlaceholder="Search city..."
            filterKey="region"
            filterLabel="All regions"
            ctaText="Purchase the Global Cities Index Report — $195, delivered as PDF"
            ctaDescription="Complete rankings for 250 cities worldwide with regional analysis, country-level patterns, and structural findings."
            ctaLink={GUMROAD.globalCitiesIndex}
            ctaExternal
            ctaButtonLabel="Buy on Gumroad"
          />
          <CrawlableRankingTable data={data.rankings} indexName="Global Cities Compassion Benchmark Index 2026" nameLabel="City" />
        </Container>
      </section>
      <section className="py-[30px]">
        <Container>
          <Callout>
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] mb-2">Purchase the Global Cities benchmark report</h2>
            <p className="text-muted max-w-[900px] mb-[18px]">Full report includes complete city rankings, regional analysis, country-level patterns, and structural findings.</p>
            <div className="flex gap-3 flex-wrap">
              <Button href={GUMROAD.globalCitiesIndex} variant="primary" external>Buy on Gumroad — $195</Button>
              <Button href="/contact-sales">Contact Sales</Button>
            </div>
          </Callout>
        </Container>
      </section>
    </>
  );
}
