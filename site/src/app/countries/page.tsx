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
import data from "@/data/indexes/countries.json";

export const metadata: Metadata = {
  title: "World Countries Index 2026",
  description:
    "The Compassion Benchmark Countries Index ranks 207 countries and territories across the full institutional compassion framework.",
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

export default function CountriesPage() {
  return (
    <>
      <DatasetJsonLd
        name="Compassion Benchmark World Countries Index 2026"
        description="Comparative rankings of 193 countries across 8 dimensions of institutional compassion including awareness, empathy, action, equity, boundaries, accountability, systemic impact, and integrity."
        url="/countries"
        entityCount={data.rankings.length}
        keywords={["compassion benchmark", "countries", "institutional compassion", "country rankings", "governance", "social policy"]}
      />
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
        bands={data.bands.map((b) => ({
          name: b.name,
          level: b.name.toLowerCase() as "exemplary" | "established" | "functional" | "developing" | "critical",
          range: b.range,
          count: b.count,
          pct: b.pct,
        }))}
      >
        <div className="flex gap-3 flex-wrap">
          <Button href={GUMROAD.countriesIndex} variant="primary" external>
            Purchase 2026 Countries Index
          </Button>
          <Button href="/methodology">Read Methodology</Button>
        </div>
      </IndexHero>

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
    </>
  );
}
