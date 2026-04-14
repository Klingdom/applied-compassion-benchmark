import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import IndexHero from "@/components/index/IndexHero";
import RankingTable, { ColumnDef } from "@/components/index/RankingTable";
import SectionHead from "@/components/ui/SectionHead";
import Button from "@/components/ui/Button";
import Callout from "@/components/ui/Callout";
import data from "@/data/indexes/robotics-labs.json";

export const metadata: Metadata = {
  title: "Humanoid Robotics Labs Index 2026",
  description: "The Compassion Benchmark Humanoid Robotics Labs Index ranks the top 50 global labs across healthcare, labor, accessibility, governance, and deployment risk.",
};

const columns: ColumnDef[] = [
  { key: "rank", label: "Rank", type: "number" },
  { key: "name", label: "Lab", type: "text" },
  { key: "category", label: "Category", type: "text" },
  { key: "country", label: "Country", type: "text" },
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

export default function RoboticsLabsPage() {
  return (
    <>
      <IndexHero
        eyebrow="Humanoid Robotics Labs Compassion Benchmark · 2026"
        title="Humanoid Robotics Labs Compassion Benchmark Index 2026"
        description="Benchmark of the top 50 global humanoid robotics labs across healthcare, labor, accessibility, governance, ethical deployment, and societal impact."
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
          <Button href="/purchase-research" variant="primary">Purchase Full Report</Button>
          <Button href="/methodology">Read Methodology</Button>
        </div>
      </IndexHero>
      <section className="py-[30px]">
        <Container>
          <SectionHead title="Full rankings" description="Search, filter by category, and sort the complete robotics labs benchmark index." />
          <RankingTable data={data.rankings} columns={columns} searchPlaceholder="Search lab..." filterKey="category" filterLabel="All categories" ctaLink="/purchase-research" />
        </Container>
      </section>
      <section className="py-[30px]">
        <Container>
          <Callout>
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] mb-2">Purchase the Robotics Labs benchmark report</h2>
            <p className="text-muted max-w-[900px] mb-[18px]">Full report includes lab profiles, category analysis, deployment risk assessment, and dimensional findings.</p>
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
