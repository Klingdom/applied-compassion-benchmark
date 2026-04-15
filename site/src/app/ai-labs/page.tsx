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

export default function AILabsPage() {
  return (
    <>
      <DatasetJsonLd
        name="Compassion Benchmark AI Labs Index 2026"
        description="Rankings of 50 leading AI organizations across 8 dimensions of institutional compassion including safety governance, transparency, accountability, deployment boundaries, and equity."
        url="/ai-labs"
        entityCount={data.rankings.length}
        keywords={["compassion benchmark", "AI labs", "AI safety", "AI ethics", "artificial intelligence", "AI governance"]}
      />
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
        bands={data.bands.map((b) => ({
          name: b.name,
          level: b.name.toLowerCase() as "exemplary" | "established" | "functional" | "developing" | "critical",
          range: b.range, count: b.count, pct: b.pct,
        }))}
      >
        <div className="flex gap-3 flex-wrap">
          <Button href={GUMROAD.aiLabsIndex} variant="primary" external>Purchase Full Report — $195</Button>
          <Button href="/methodology">Read Methodology</Button>
        </div>
      </IndexHero>
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
