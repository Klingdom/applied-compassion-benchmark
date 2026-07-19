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
import PartialCoverageDisclosure from "@/components/index/PartialCoverageDisclosure";
import data from "@/data/indexes/us-states.json";

export const metadata: Metadata = {
  title: "Most & Least Compassionate U.S. States 2026 — Compassion Benchmark",
  description:
    "See which U.S. states rank most and least compassionate in 2026. Compassion Benchmark scores all 50 states and DC across 8 dimensions including healthcare, equity, and accountability.",
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

// G1.4: Index-page FAQ — real data only, no fabrication.
const indexFaqItems = [
  ...(topEntry && bottomEntry ? [
    {
      question: "What is the most compassionate U.S. state in 2026?",
      answer: `As of 2026, ${topEntry.name} is the most compassionate U.S. state on the Compassion Benchmark, with a composite score of ${topEntry.composite.toFixed(1)}/100 (${String(topEntry.band).charAt(0).toUpperCase() + String(topEntry.band).slice(1).toLowerCase()}).`,
    },
    {
      question: "What is the least compassionate U.S. state in 2026?",
      answer: `As of 2026, ${bottomEntry.name} ranks last in the Compassion Benchmark U.S. States Index, with a composite score of ${bottomEntry.composite.toFixed(1)}/100 (${String(bottomEntry.band).charAt(0).toUpperCase() + String(bottomEntry.band).slice(1).toLowerCase()}).`,
    },
  ] : []),
  {
    question: "How many U.S. states are scored?",
    answer: `The Compassion Benchmark U.S. States Index scores ${data.rankings.length} states and territories across 8 dimensions of institutional compassion.`,
  },
  {
    question: "How is the compassion score calculated?",
    answer: "The score is a composite across 8 dimensions (Awareness, Empathy, Action, Equity, Boundaries, Accountability, Systemic Impact, and Integrity), each scored 0–5 from behavioral evidence, then converted to a 0–100 scale with an integration premium for balanced profiles. See compassionbenchmark.com/methodology for the full framework.",
  },
  {
    question: "Who runs the Compassion Benchmark, and can a U.S. state pay for a better score?",
    answer: "The Compassion Benchmark is an independent benchmark institution. No state can pay for inclusion, a higher score, or the suppression of findings — every state in this index is scored from public evidence, not by application.",
  },
];

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
      <FaqJsonLd items={indexFaqItems} />

      {/* Data-coverage disclosure — must render first, above the fold, above
          the ranking table. This index publishes 21 of 51 U.S. jurisdictions;
          the legacy HTML extraction dropped ranks 9–38, and the surviving 21
          were renumbered 1–21, so the displayed Rank column is a position
          within this partial set, not each state's true national rank. Do
          not remove or soften this notice without founder sign-off. */}
      <PartialCoverageDisclosure
        publishedCount={data.rankings.length}
        totalCount={51}
        unitLabel="U.S. jurisdiction"
        unitLabelPlural="U.S. jurisdictions (50 states and the District of Columbia)"
      >
        <p>
          The <span className="text-text font-medium">Rank</span> column below numbers each entry 1–{data.rankings.length} within this published set only.
          It is not the jurisdiction&apos;s national rank. For example, Idaho is shown at rank 9; a full 51-jurisdiction assessment currently
          places Idaho at approximately rank 39.
        </p>
        <p>
          The 30 missing jurisdictions sat mostly in the middle of the national score distribution. That is why the table below shows a
          58-point gap between rank 8 (Connecticut, 83.0) and rank 9 (Idaho, 25.0), with no entries in the Established (61–80) or Functional
          (41–60) bands. This gap is an artifact of missing data, not a finding — it does not mean no state scores in that range.
        </p>
        <p>
          Most of the scores in this 21-jurisdiction set predate individual, evidence-based assessment. They carry over from an earlier
          bulk data import and are being re-derived one jurisdiction at a time.
        </p>
        <p className="text-text font-medium">
          A full 51-jurisdiction re-assessment is underway. This index will be replaced with the complete, correctly ranked set as that
          work is completed.
        </p>
      </PartialCoverageDisclosure>

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
        title="Most & Least Compassionate U.S. States 2026"
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

      {/* G1.4: FAQ accordion — visible content required alongside FaqJsonLd */}
      <section className="py-[30px]">
        <Container>
          <FaqAccordion items={indexFaqItems} />
        </Container>
      </section>
    </>
  );
}
