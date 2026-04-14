import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import IndexHero from "@/components/index/IndexHero";
import RankingTable, { ColumnDef } from "@/components/index/RankingTable";
import SectionHead from "@/components/ui/SectionHead";
import Button from "@/components/ui/Button";
import Callout from "@/components/ui/Callout";
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

export default function USStatesPage() {
  return (
    <>
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
          <SectionHead title="Full rankings" description="Search, filter by region, and sort the complete U.S. states benchmark index." />
          <RankingTable data={data.rankings} columns={columns} searchPlaceholder="Search state..." filterKey="region" filterLabel="All regions" ctaLink="/purchase-research" />
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
