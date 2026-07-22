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
import RankingItemListJsonLd from "@/components/seo/RankingItemListJsonLd";
import { decodeHtmlEntities } from "@/lib/decodeHtmlEntities";
import data from "@/data/indexes/robotics-labs.json";

export const metadata: Metadata = {
  title: "Most & Least Compassionate Robotics Labs 2026 — Compassion Benchmark",
  description:
    "See which humanoid robotics labs rank most and least compassionate in 2026. Compassion Benchmark scores 50 global labs across healthcare, labor, accessibility, governance, and ethical deployment.",
  alternates: { canonical: "https://compassionbenchmark.com/robotics-labs" },
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

// Answer-first data — derived from real index data only. No fabricated values.
const topEntry = data.rankings[0];
const bottomEntry = data.rankings[data.rankings.length - 1];
// Display-only HTML-entity decode (source JSON has ~20 escaped names, e.g.
// "Procter &amp; Gamble") — never used for slug/URL generation.
const topEntryName = topEntry ? decodeHtmlEntities(topEntry.name) : "";
const bottomEntryName = bottomEntry ? decodeHtmlEntities(bottomEntry.name) : "";

// G1.4: Index-page FAQ — real data only, no fabrication.
const indexFaqItems = [
  ...(topEntry && bottomEntry ? [
    {
      question: "What is the most compassionate humanoid robotics lab in 2026?",
      answer: `As of 2026, ${topEntryName} is the most compassionate humanoid robotics lab on the Compassion Benchmark, with a composite score of ${topEntry.composite.toFixed(1)}/100 (${String(topEntry.band).charAt(0).toUpperCase() + String(topEntry.band).slice(1).toLowerCase()}).`,
    },
    {
      question: "What is the least compassionate humanoid robotics lab in 2026?",
      answer: `As of 2026, ${bottomEntryName} ranks last in the Compassion Benchmark Humanoid Robotics Labs Index, with a composite score of ${bottomEntry.composite.toFixed(1)}/100 (${String(bottomEntry.band).charAt(0).toUpperCase() + String(bottomEntry.band).slice(1).toLowerCase()}).`,
    },
  ] : []),
  {
    question: "How many robotics labs are scored?",
    answer: `The Compassion Benchmark Humanoid Robotics Labs Index scores ${data.rankings.length} global robotics labs across 8 dimensions of institutional compassion.`,
  },
  {
    question: "How is the compassion score calculated?",
    answer: "The score is a composite across 8 dimensions (Awareness, Empathy, Action, Equity, Boundaries, Accountability, Systemic Impact, and Integrity), each scored 0–5 from behavioral evidence, then converted to a 0–100 scale with an integration premium for balanced profiles. See compassionbenchmark.com/methodology for the full framework.",
  },
  {
    question: "Who runs the Compassion Benchmark, and can a robotics lab pay for a better score?",
    answer: "The Compassion Benchmark is an independent benchmark institution. No robotics lab can pay for inclusion, a higher score, or the suppression of findings — every lab in this index is scored from public evidence, not by application.",
  },
];

export default function RoboticsLabsPage() {
  return (
    <>
      <DatasetJsonLd
        name="Compassion Benchmark Humanoid Robotics Labs Index 2026"
        description="Rankings of 50 global humanoid robotics labs across 8 dimensions of institutional compassion including healthcare, labor, accessibility, governance, and ethical deployment."
        url="/robotics-labs"
        indexSlug="robotics-labs"
        entityCount={data.rankings.length}
        keywords={["compassion benchmark", "robotics labs", "humanoid robots", "robotics ethics", "AI robotics", "robot governance"]}
      />
      <BreadcrumbJsonLd items={[
        { name: "Home",    url: breadcrumbUrl("/") },
        { name: "Indexes", url: breadcrumbUrl("/indexes") },
        { name: "Humanoid Robotics Labs Index", url: breadcrumbUrl("/robotics-labs") },
      ]} />
      <FaqJsonLd items={indexFaqItems} />
      <RankingItemListJsonLd kind="robotics-lab" />
      {/* Top-5 AEO: answer-first lead sentence — pure restatement of index data */}
      {topEntry && bottomEntry && (
        <p className="text-[0.9rem] text-muted text-center py-3 px-4 border-b border-line/40 bg-[rgba(255,255,255,0.01)]">
          As of 2026,{" "}
          <span className="text-text font-medium">{topEntryName}</span> is the most compassionate humanoid robotics lab (
          <span className="text-text font-medium">{topEntry.composite.toFixed(1)}/100</span>,{" "}
          {String(topEntry.band).charAt(0).toUpperCase() + String(topEntry.band).slice(1).toLowerCase()}) and{" "}
          <span className="text-text font-medium">{bottomEntryName}</span> the least (
          <span className="text-text font-medium">{bottomEntry.composite.toFixed(1)}/100</span>,{" "}
          {String(bottomEntry.band).charAt(0).toUpperCase() + String(bottomEntry.band).slice(1).toLowerCase()}) on the Compassion Benchmark Humanoid Robotics Labs Index, which scores{" "}
          <span className="text-text font-medium">{data.rankings.length}</span> robotics labs across 8 dimensions.
        </p>
      )}

      <IndexHero
        eyebrow="Humanoid Robotics Labs Compassion Benchmark · 2026"
        title="Most & Least Compassionate Robotics Labs 2026"
        description="Benchmark of the top 50 global humanoid robotics labs across healthcare, labor, accessibility, governance, ethical deployment, and societal impact."
        stats={[
          { value: String(data.meta.entityCount || 50), label: "Labs ranked" },
          { value: String(data.meta.meanScore || "—"), label: "Mean score" },
          { value: String(data.meta.medianScore || "—"), label: "Median score" },
          { value: "8", label: "Dimensions" },
          { value: "2026", label: "Publication year" },
        ]}
        indexSlug="robotics-labs"
      >
        <div className="flex gap-3 flex-wrap">
          <Button href={GUMROAD.roboticsIndex} variant="primary" external>Purchase Full Report — $195</Button>
          <Button href="/methodology">Read Methodology</Button>
        </div>
      </IndexHero>
      <IndexPageCharts
        rankings={data.rankings as Parameters<typeof IndexPageCharts>[0]["rankings"]}
        indexSlug="robotics-labs"
        groupKey="category"
        groupLabel="Category"
        indexMean={data.meta.meanScore}
        medianScore={data.meta.medianScore}
        indexName="Humanoid Robotics Labs"
        indexPagePath="/robotics-labs"
      />
      <section className="py-[30px]">
        <Container>
          <SectionHead title="Full rankings" description="Search, filter by category, and sort the complete robotics labs benchmark index." />
          <RankingTable
            data={data.rankings}
            columns={columns}
            searchPlaceholder="Search lab..."
            filterKey="category"
            filterLabel="All categories"
            ctaText="Purchase the Robotics Labs Index Report — $195, delivered as PDF"
            ctaDescription="Complete rankings for 50 robotics labs with category analysis, deployment risk assessment, and dimensional findings."
            ctaLink={GUMROAD.roboticsIndex}
            ctaExternal
            ctaButtonLabel="Buy on Gumroad"
            entityKind="robotics-lab"
          />
          <CrawlableRankingTable data={data.rankings} indexName="Humanoid Robotics Labs Compassion Benchmark Index 2026" nameLabel="Lab" />
        </Container>
      </section>
      <section className="py-[30px]">
        <Container>
          <Callout>
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] mb-2">Purchase the Robotics Labs benchmark report</h2>
            <p className="text-muted max-w-[900px] mb-[18px]">Full report includes lab profiles, category analysis, deployment risk assessment, and dimensional findings.</p>
            <div className="flex gap-3 flex-wrap">
              <Button href={GUMROAD.roboticsIndex} variant="primary" external>Buy on Gumroad — $195</Button>
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
