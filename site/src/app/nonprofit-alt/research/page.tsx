import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import Stat from "@/components/ui/Stat";
import Panel from "@/components/ui/Panel";
import Card from "@/components/ui/Card";
import Pill from "@/components/ui/Pill";
import SectionHead from "@/components/ui/SectionHead";
import Callout from "@/components/ui/Callout";
import DonateCTA from "@/components/nonprofit/DonateCTA";
import { FUNDER_CONTACT_NOTE, INDEPENDENCE_FIREWALL_LINE } from "@/components/nonprofit/constants";
import { SCORED_ENTITY_COUNT_FORMATTED } from "@/data/entityCount";
import { INDEX_REGISTRY } from "@/data/indexRegistry";
import type { EntityKind } from "@/data/entities";

// Real per-index entity counts — same read-only pattern as the home page
// (site/src/app/nonprofit-alt/page.tsx) and the commercial /indexes page.
// Counts are never hand-typed.
import countriesData from "@/data/indexes/countries.json";
import usStatesData from "@/data/indexes/us-states.json";
import fortune500Data from "@/data/indexes/fortune-500.json";
import aiLabsData from "@/data/indexes/ai-labs.json";
import roboticsLabsData from "@/data/indexes/robotics-labs.json";
import usCitiesData from "@/data/indexes/us-cities.json";
import globalCitiesData from "@/data/indexes/global-cities.json";
import universitiesData from "@/data/indexes/universities.json";

const ENTITY_COUNT_BY_KIND: Record<EntityKind, number> = {
  country: countriesData.rankings.length,
  "us-state": usStatesData.rankings.length,
  company: fortune500Data.rankings.length,
  "ai-lab": aiLabsData.rankings.length,
  "robotics-lab": roboticsLabsData.rankings.length,
  "us-city": usCitiesData.rankings.length,
  city: globalCitiesData.rankings.length,
  university: universitiesData.rankings.length,
};

export const metadata: Metadata = {
  title: "Research Program — Compassion Benchmark (Nonprofit)",
  description:
    "The Compassion Benchmark research program: a daily scanner-assessor-digest pipeline with a human approval gate, an 8-dimension evidence-backed methodology, and a grants/foundations path for funders of independent institutional accountability research.",
};

const PIPELINE_STAGES = [
  {
    stage: "Stage 1",
    title: "Scanner",
    desc: `Every night, a structured search across all ${SCORED_ENTITY_COUNT_FORMATTED} benchmarked entities surfaces compassion-relevant evidence from the last 14 days. No entity is skipped.`,
  },
  {
    stage: "Stage 2",
    title: "Assessor",
    desc: "Entities with material new evidence receive a full reassessment against the 8-dimension, 40-subdimension rubric. Delta is computed against the published composite.",
  },
  {
    stage: "Stage 3",
    title: "Digest",
    desc: "A structured digest synthesizes the night's findings: proposed changes, sector alerts, methodology concerns, and watch items. Nothing is applied yet.",
  },
  {
    stage: "Stage 4",
    title: "Human approval gate",
    desc: "Every proposed score change is reviewed and approved — or rejected — by a human before reaching production. The approval log is auditable, and roughly 30% of proposals are sent back for additional evidence.",
  },
];

export default function NonprofitAltResearchPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-[72px] pb-10">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-[18px] items-start">
            <div>
              <Eyebrow>Research program &middot; built for grant-funded rigor</Eyebrow>
              <h1 className="text-[clamp(2.2rem,5vw,4rem)] leading-[1.04] tracking-[-0.03em] mb-3.5">
                The research program behind the rankings
              </h1>
              <p className="text-muted text-[1.08rem] max-w-[860px] mb-[22px]">
                Compassion Benchmark publishes comparative rankings of institutional compassion
                across governments, corporations, AI labs, and robotics labs, built on a public
                methodology and updated by a daily research pipeline. It is funded entirely by
                individual supporters and grants &mdash; never by the entities it scores. That
                separation is not a policy statement bolted on after the fact; it is the reason the
                benchmark can be trusted at all.
              </p>

              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-2">
                <Stat value={SCORED_ENTITY_COUNT_FORMATTED} label="Entities monitored" />
                <Stat value={String(INDEX_REGISTRY.length)} label="Published index families" />
                <Stat value="8" label="Core dimensions" />
                <Stat value="40" label="Subdimensions" />
                <Stat value="v1.2" label="Methodology version" />
              </div>

              <div className="flex gap-3 flex-wrap mt-4">
                <Button href="#pipeline" variant="primary">
                  Explore the research program &rarr;
                </Button>
                <Button href="/nonprofit-alt/contact">Talk to us about funding this work</Button>
              </div>
            </div>

            <Panel>
              <h3 className="text-[1.08rem] font-bold mb-2.5">Research scope</h3>
              <p className="text-muted mb-3">
                The benchmark spans countries, U.S. states, Fortune 500 companies, AI labs,
                robotics labs, U.S. cities, global cities, and universities &mdash; the same
                8-dimension framework applied to every sector, so scores are comparable across
                types of institution.
              </p>
              <div className="flex gap-2.5 flex-wrap">
                <Pill>Evidence-backed</Pill>
                <Pill>Reproducible</Pill>
                <Pill>Citation-ready</Pill>
              </div>
            </Panel>
          </div>
        </Container>
      </section>

      {/* Eight free, public indexes */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="Eight indexes, one methodology"
            description={`Every index applies the same 8-dimension, 0–100 framework, so a score means the same thing whether it belongs to a country or a company. All ${SCORED_ENTITY_COUNT_FORMATTED} entity scores are free to read, cite, and reuse in research.`}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {INDEX_REGISTRY.map((entry) => (
              <Card key={entry.indexRoute} href={entry.indexRoute}>
                <div className="flex gap-2.5 flex-wrap mb-3">
                  <Pill>Free</Pill>
                  <Pill>Citable</Pill>
                </div>
                <h3 className="text-[1.0rem] font-bold mb-1.5">{entry.indexLabel}</h3>
                <p className="text-muted text-[0.86rem]">
                  {ENTITY_COUNT_BY_KIND[entry.kind].toLocaleString("en-US")} {entry.labelPlural} scored and ranked.
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Daily research pipeline */}
      <section id="pipeline" className="py-[30px] scroll-mt-24">
        <Container>
          <SectionHead
            title="The daily research pipeline"
            description="After an initial human assessment establishes a baseline, a four-stage nightly pipeline monitors every benchmarked entity for material evidence within a 14-day recency window. Scores change only after human review."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PIPELINE_STAGES.map((item) => (
              <Card key={item.title}>
                <p className="text-accent text-[0.86rem] font-bold uppercase tracking-[0.08em] mb-2">{item.stage}</p>
                <h3 className="text-[1.05rem] font-bold mb-2">{item.title}</h3>
                <p className="text-muted">{item.desc}</p>
              </Card>
            ))}
          </div>
          <Panel className="mt-4">
            <p className="text-muted">
              Each entity page on the published site carries a freshness stamp &mdash;{" "}
              <em>Evidence reviewed YYYY-MM-DD</em> &mdash; showing either that no material change
              surfaced in the last 14 days or that new evidence is under review. The scanner touches
              every one of the {SCORED_ENTITY_COUNT_FORMATTED} entities nightly, not only the most
              active ones. Every approval decision, and every rejection, is retained in an auditable
              log.
            </p>
          </Panel>
        </Container>
      </section>

      {/* Evidence traceability & reproducibility */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="Evidence traceability, built for peer review"
            description="A daily record with a paper trail — designed so a researcher, journalist, or funder can check the work, not just the conclusion."
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Panel>
              <h3 className="text-[1.05rem] font-bold mb-2.5">A 5-tier evidence hierarchy</h3>
              <p className="text-muted">
                Findings are weighted by independence and reliability &mdash; from Tier 1
                independent external audits down to Tier 5 entity self-report, which requires
                corroboration before it carries weight. Strong scores require stronger evidence.
              </p>
            </Panel>
            <Panel>
              <h3 className="text-[1.05rem] font-bold mb-2.5">Deterministic, reconstructible scoring</h3>
              <p className="text-muted">
                Every composite is computed from a single shared scoring core, consumed by both the
                published site and the research pipeline, with a determinism test suite acting as a
                drift gate. Any published score can be reconstructed from its 8 dimension scores.
              </p>
            </Panel>
          </div>
          <p className="text-muted text-[0.9rem] mt-4">
            <a href="/nonprofit-alt/methodology" className="text-accent hover:underline">
              Read the full 8-dimension, 40-subdimension methodology &rarr;
            </a>
          </p>
        </Container>
      </section>

      {/* Grants / foundations */}
      <section id="funders" className="py-[30px] scroll-mt-24">
        <Container>
          <SectionHead title="For foundations and institutional funders" />
          <Callout>
            <p className="text-muted mb-3">
              Compassion Benchmark produces a daily, evidence-backed, publicly citable research
              record of how governments, corporations, AI labs, and robotics labs treat the people
              and systems in their power. For funders working on AI accountability, corporate
              governance, human rights, or public-interest technology, this is infrastructure: a
              standing, methodologically transparent measurement layer that press, researchers, and
              advocates already use and cite &mdash; funded independently of the entities it
              evaluates. Grant support sustains the daily research pipeline, expands index coverage,
              and keeps the entire public record free.
            </p>
            <p className="text-muted mb-4">{FUNDER_CONTACT_NOTE}</p>
            <div className="flex gap-3 flex-wrap">
              <Button href="/nonprofit-alt/contact" variant="primary">
                Talk to us about funding this work &rarr;
              </Button>
            </div>
          </Callout>
        </Container>
      </section>

      {/* Independence-as-architecture, funder-facing variant */}
      <section className="py-[30px]">
        <Container>
          <Panel>
            <h3 className="text-[1.05rem] font-bold mb-2.5">Why funders can trust the number</h3>
            <p className="text-muted mb-3">
              Independence here is not a policy &mdash; it&apos;s an architecture. The pipeline
              that produces every score cannot read a supporter list, a payment record, or a grant
              agreement. Nothing an entity or a funder does can move a number.
            </p>
            <p className="text-muted text-[0.9rem] border-t border-line pt-3">{INDEPENDENCE_FIREWALL_LINE}</p>
          </Panel>
        </Container>
      </section>

      {/* Compact donate surface — required firewall line included via DonateCTA */}
      <section className="py-[30px]">
        <Container>
          <DonateCTA
            heading="Fund the next research cycle"
            description="Individual support and grants both sustain the same daily pipeline — evidence review, editorial oversight, and the infrastructure that keeps every index free and citable."
            showTiers={false}
          />
        </Container>
      </section>
    </>
  );
}
