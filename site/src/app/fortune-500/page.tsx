import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import IndexHero from "@/components/index/IndexHero";
import RankingTable, { ColumnDef } from "@/components/index/RankingTable";
import SectionHead from "@/components/ui/SectionHead";
import Panel from "@/components/ui/Panel";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Callout from "@/components/ui/Callout";
import Pill from "@/components/ui/Pill";
import { GUMROAD } from "@/data/gumroad";
import DatasetJsonLd from "@/components/seo/DatasetJsonLd";
import CrawlableRankingTable from "@/components/seo/CrawlableRankingTable";
import data from "@/data/indexes/fortune-500.json";

export const metadata: Metadata = {
  title: "Fortune 500 Index 2026",
  description:
    "The Compassion Benchmark Fortune 500 Index ranks 447 major corporations across eight dimensions of institutional compassion.",
};

const columns: ColumnDef[] = [
  { key: "rank", label: "CR", type: "number" },
  { key: "f500", label: "F500", type: "number" },
  { key: "name", label: "Company", type: "text" },
  { key: "sector", label: "Sector", type: "text" },
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

export default function Fortune500Page() {
  return (
    <>
      <DatasetJsonLd
        name="Compassion Benchmark Fortune 500 Index 2026"
        description="Rankings of 447 Fortune 500 companies across 8 dimensions of institutional compassion including awareness, empathy, action, equity, boundaries, accountability, systemic impact, and integrity."
        url="/fortune-500"
        entityCount={data.rankings.length}
        keywords={["compassion benchmark", "Fortune 500", "corporate compassion", "ESG", "corporate responsibility", "company rankings"]}
      />
      <IndexHero
        eyebrow="Fortune 500 Compassion Benchmark · 2026"
        title="Fortune 500 Compassion Benchmark Index 2026"
        description="The Fortune 500 Compassion Benchmark Index evaluates 447 of America's largest corporations across eight dimensions of institutional compassion: Awareness, Empathy, Action, Equity, Boundaries, Accountability, Systems Thinking, and Integrity."
        stats={[
          { value: String(data.meta.entityCount), label: "Companies ranked" },
          { value: String(data.meta.meanScore), label: "Mean score" },
          { value: String(data.meta.medianScore), label: "Median score" },
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
          <Button href={GUMROAD.fortune500Index} variant="primary" external>
            Purchase Full Report — $195
          </Button>
          <Button href="/methodology">Read Methodology</Button>
        </div>
      </IndexHero>

      {/* Rankings table */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="Full rankings"
            description="Search, filter by sector, and sort the complete Fortune 500 benchmark index."
          />
          <RankingTable
            data={data.rankings}
            columns={columns}
            searchPlaceholder="Search company..."
            filterKey="sector"
            filterLabel="All sectors"
            ctaText="Purchase the Fortune 500 Index Report — $195, delivered as PDF"
            ctaDescription="Complete rankings for 447 companies with methodology, sector analysis, key findings, themes among the highest-ranked, and concerns among the lowest-performing."
            ctaLink={GUMROAD.fortune500Index}
            ctaExternal
            ctaButtonLabel="Buy on Gumroad"
            entityKind="company"
          />
          <CrawlableRankingTable data={data.rankings} indexName="Fortune 500 Compassion Benchmark Index 2026" nameLabel="Company" />
        </Container>
      </section>

      {/* Key findings */}
      <section className="py-[30px]">
        <Container>
          <SectionHead title="Key findings" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Panel>
              <h3 className="text-[1.08rem] font-bold mb-2.5">Equity is the weakest dimension</h3>
              <p className="text-muted">
                With an average score of 2.25, Equity consistently lags behind other dimensions across the Fortune 500. This suggests most large corporations have not yet built systems that distribute care, access, or protection equitably across stakeholders.
              </p>
            </Panel>
            <Panel>
              <h3 className="text-[1.08rem] font-bold mb-2.5">Finance leads by sector</h3>
              <p className="text-muted">
                Financial services companies disproportionately appear in the upper ranks, driven by stronger governance, compliance infrastructure, and public accountability mechanisms.
              </p>
            </Panel>
            <Panel>
              <h3 className="text-[1.08rem] font-bold mb-2.5">The developing band is the largest</h3>
              <p className="text-muted">
                164 companies — nearly 37% of the index — fall in the Developing band. This means the majority of large corporations show fragmented rather than systemic compassion.
              </p>
            </Panel>
          </div>
        </Container>
      </section>

      {/* Services CTA */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="Go deeper"
            description="Move from public rankings into premium reports, data licensing, advisory support, or enterprise access."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                href: "/purchase-research",
                pills: ["Reports"],
                title: "Purchase Research",
                desc: "Buy the full Fortune 500 benchmark report in premium PDF format.",
              },
              {
                href: "/data-licenses",
                pills: ["Data"],
                title: "License Data",
                desc: "Access structured benchmark datasets for internal analysis.",
              },
              {
                href: "/advisory",
                pills: ["Advisory"],
                title: "Book Advisory",
                desc: "Get interpretive briefings and peer comparison analysis.",
              },
              {
                href: "/enterprise",
                pills: ["Enterprise"],
                title: "Enterprise Access",
                desc: "Recurring institutional benchmark access and support.",
              },
            ].map((item) => (
              <Card key={item.href} href={item.href} variant="service">
                <div className="flex gap-2 flex-wrap">
                  {item.pills.map((p) => (
                    <Pill key={p}>{p}</Pill>
                  ))}
                </div>
                <h3 className="text-[1.08rem] font-bold">{item.title}</h3>
                <p className="text-muted">{item.desc}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Final CTA */}
      <section className="py-[30px]">
        <Container>
          <Callout>
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] mb-2">
              Purchase the complete Fortune 500 benchmark report
            </h2>
            <p className="text-muted max-w-[900px] mb-[18px]">
              The full report includes methodology details, sector-level analysis, key findings, themes among the highest-performing companies, concerns among the lowest-performing, and structured appendix data.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Button href={GUMROAD.fortune500Index} variant="primary" external>
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
