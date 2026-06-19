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
import data from "@/data/indexes/universities.json";

export const metadata: Metadata = {
  title: "Most & Least Compassionate Universities 2026 — Compassion Benchmark",
  description:
    `See which universities rank most and least compassionate in 2026. Unlike US News, QS, or THE prestige rankings, the Compassion Benchmark scores ${data.rankings.length} leading universities on how they treat students and staff — across welfare governance, equity access, accountability, and institutional integrity.`,
};

const columns: ColumnDef[] = [
  { key: "rank", label: "Rank", type: "number" },
  { key: "name", label: "University", type: "text" },
  { key: "type", label: "Type", type: "text" },
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

// G1.4: Index-page FAQ — real data only, no fabrication.
const indexFaqItems = [
  ...(topEntry && bottomEntry ? [
    {
      question: "What is the most compassionate university in 2026?",
      answer: `As of 2026, ${topEntry.name} is the most compassionate university on the Compassion Benchmark, with a composite score of ${topEntry.composite.toFixed(1)}/100 (${String(topEntry.band).charAt(0).toUpperCase() + String(topEntry.band).slice(1).toLowerCase()}).`,
    },
    {
      question: "What is the least compassionate university in 2026?",
      answer: `As of 2026, ${bottomEntry.name} ranks last in the Compassion Benchmark Universities Index, with a composite score of ${bottomEntry.composite.toFixed(1)}/100 (${String(bottomEntry.band).charAt(0).toUpperCase() + String(bottomEntry.band).slice(1).toLowerCase()}).`,
    },
  ] : []),
  {
    question: "Is this the same as the US News, QS, or Times Higher Education rankings?",
    answer: `No. US News, QS, and Times Higher Education rank universities on prestige, research output, and reputation. The Compassion Benchmark Universities Index measures something different: how an institution treats students and staff — welfare governance, equity of access, accountability, and integrity — scored across 8 dimensions of institutional compassion. A highly prestigious university can still score low here, and vice versa.`,
  },
  {
    question: "How many universities are scored?",
    answer: `The Compassion Benchmark Universities Index scores ${data.rankings.length} leading universities across 8 dimensions of institutional compassion.`,
  },
  {
    question: "How is the compassion score calculated?",
    answer: "The score is a composite across 8 dimensions (Awareness, Empathy, Action, Equity, Boundaries, Accountability, Systemic Impact, and Integrity), each scored 0–5 from behavioral evidence, then converted to a 0–100 scale with an integration premium for balanced profiles. See compassionbenchmark.com/methodology for the full framework.",
  },
];

export default function UniversitiesPage() {
  return (
    <>
      <DatasetJsonLd
        name="Compassion Benchmark Universities Index 2026"
        description={`Rankings of ${data.rankings.length} leading universities across 8 dimensions of institutional compassion including welfare governance, equity access, transparency, accountability, and institutional integrity.`}
        url="/universities"
        indexSlug="universities"
        entityCount={data.rankings.length}
        keywords={["compassion benchmark", "universities", "higher education", "university rankings", "institutional compassion", "education equity", "student welfare", "staff treatment", "how universities treat students"]}
      />
      <BreadcrumbJsonLd items={[
        { name: "Home",            url: breadcrumbUrl("/") },
        { name: "Indexes",         url: breadcrumbUrl("/indexes") },
        { name: "Universities Index", url: breadcrumbUrl("/universities") },
      ]} />
      <FaqJsonLd items={indexFaqItems} />
      {/* Answer-first lead sentence */}
      {topEntry && bottomEntry && (
        <p className="text-[0.9rem] text-muted text-center py-3 px-4 border-b border-line/40 bg-[rgba(255,255,255,0.01)]">
          As of 2026,{" "}
          <span className="text-text font-medium">{topEntry.name}</span> is the most compassionate university (
          <span className="text-text font-medium">{topEntry.composite.toFixed(1)}/100</span>,{" "}
          {String(topEntry.band).charAt(0).toUpperCase() + String(topEntry.band).slice(1).toLowerCase()}) and{" "}
          <span className="text-text font-medium">{bottomEntry.name}</span> the least (
          <span className="text-text font-medium">{bottomEntry.composite.toFixed(1)}/100</span>,{" "}
          {String(bottomEntry.band).charAt(0).toUpperCase() + String(bottomEntry.band).slice(1).toLowerCase()}) on the Compassion Benchmark Universities Index, which scores{" "}
          <span className="text-text font-medium">{data.rankings.length}</span> universities across 8 dimensions.
        </p>
      )}

      <IndexHero
        eyebrow="Universities Compassion Benchmark · 2026"
        title="Universities Compassion Benchmark Index 2026"
        description={`Benchmark of ${data.rankings.length} leading universities across welfare governance, transparency, accountability, equity access, and institutional integrity.`}
        stats={[
          { value: String(data.meta.entityCount || data.rankings.length), label: "Universities ranked" },
          { value: String(data.meta.meanScore || "—"), label: "Mean score" },
          { value: String(data.meta.medianScore || "—"), label: "Median score" },
          { value: "8", label: "Dimensions" },
          { value: "2026", label: "Publication year" },
        ]}
        indexSlug="universities"
      >
        <div className="flex gap-3 flex-wrap">
          <Button href="/contact-sales?product=universities-index" variant="primary">Request Full Report — $195</Button>
          <Button href="/methodology">Read Methodology</Button>
        </div>
      </IndexHero>
      <section className="py-[24px]">
        <Container>
          <p className="text-muted max-w-[900px] text-[0.95rem] leading-relaxed">
            <span className="text-text font-medium">This is not a prestige ranking.</span>{" "}
            Where US News, QS, and Times Higher Education measure research output and reputation,
            the Compassion Benchmark measures how a university treats the people inside it — students
            and staff — across welfare governance, equity of access, accountability, and institutional
            integrity. A famous university can rank low here; a less prestigious one can rank high.
          </p>
        </Container>
      </section>
      <IndexPageCharts
        rankings={data.rankings as Parameters<typeof IndexPageCharts>[0]["rankings"]}
        indexSlug="universities"
        groupKey="type"
        groupLabel="Type"
        indexMean={data.meta.meanScore}
        medianScore={data.meta.medianScore}
        indexName="Universities"
        indexPagePath="/universities"
      />
      <section className="py-[30px]">
        <Container>
          <SectionHead title="Full rankings" description="Search, filter by type, and sort the complete Universities benchmark index." />
          <RankingTable
            data={data.rankings}
            columns={columns}
            searchPlaceholder="Search university..."
            filterKey="country"
            filterLabel="All countries"
            ctaText="Request the Universities Index Report — $195, delivered as PDF"
            ctaDescription={`Complete rankings for ${data.rankings.length} universities with welfare governance analysis, equity access assessment, and dimensional findings.`}
            ctaLink="/contact-sales?product=universities-index"
            entityKind="university"
          />
          <CrawlableRankingTable data={data.rankings} indexName="Universities Compassion Benchmark Index 2026" nameLabel="University" />
        </Container>
      </section>
      <section className="py-[30px]">
        <Container>
          <Callout>
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] mb-2">Request the Universities benchmark report</h2>
            <p className="text-muted max-w-[900px] mb-[18px]">The full report includes university profiles, welfare governance analysis, equity access assessment, and dimensional findings.</p>
            <div className="flex gap-3 flex-wrap">
              <Button href="/contact-sales?product=universities-index" variant="primary">Contact Sales — $195</Button>
              <Button href="/methodology">Read Methodology</Button>
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
