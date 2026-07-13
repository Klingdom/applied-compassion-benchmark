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
import Band, { BandLevel } from "@/components/ui/Band";
import DonateCTA from "@/components/nonprofit/DonateCTA";
import { INDEPENDENCE_FIREWALL_LINE, SUPPORT_URL } from "@/components/nonprofit/constants";
import { DIMENSIONS, BANDS } from "@/data/dimensions";
import { SCORED_ENTITY_COUNT_FORMATTED } from "@/data/entityCount";
import { INDEX_REGISTRY } from "@/data/indexRegistry";

export const metadata: Metadata = {
  title: "Methodology — Compassion Benchmark (Nonprofit)",
  description:
    "How the Compassion Benchmark scores institutions: the 8-dimension, 40-subdimension framework, the 5-tier evidence hierarchy, and the independence policy that keeps every score free of entity influence.",
};

// Derived 40-row list from the canonical DIMENSIONS data — never hand-typed.
const SUBDIM_ROWS = DIMENSIONS.flatMap((d) =>
  d.subdims.map((sd) => ({
    dimCode: d.code,
    dimName: d.name,
    dimColor: d.color,
    id: sd.code,
    name: sd.name,
    question: sd.desc,
  })),
);

// 5-tier evidence hierarchy — same tiers/ordering as the commercial methodology
// page's EvidencePyramid data (site/src/components/charts/EvidencePyramid.tsx),
// transcribed here as plain copy rather than importing the chart component.
const EVIDENCE_TIERS = [
  {
    tier: "Tier 1",
    title: "Independent external audit",
    desc: "Regulatory findings, third-party assessments, academic studies.",
    weight: "Highest weight",
  },
  {
    tier: "Tier 2",
    title: "Verifiable outcome data",
    desc: "Disaggregated service data, longitudinal surveys, resolution rates.",
    weight: "High weight",
  },
  {
    tier: "Tier 3",
    title: "Community testimony",
    desc: "Affected populations, independent focus groups, structured interviews.",
    weight: "High weight",
  },
  {
    tier: "Tier 4",
    title: "Policy and process documents",
    desc: "Governing documents, training records, budget allocations.",
    weight: "Moderate weight",
  },
  {
    tier: "Tier 5",
    title: "Entity self-report",
    desc: "Mission statements and annual reports — requires corroboration.",
    weight: "Lowest weight",
  },
];

// Guarantee list — same five guarantees as the commercial methodology page,
// reframed for a nonprofit/credibility-first reading rather than a product one.
const GUARANTEES = [
  {
    label: "Evidence-grounded",
    desc: "Every score traces to documented public evidence across a 5-tier hierarchy, not opinion or self-report.",
  },
  {
    label: "Adversarially tested",
    desc: "Performance only counts when it held up under cost or pressure — the pressure-test principle.",
  },
  {
    label: "Reproducible",
    desc: "The same 8 dimensions and 40 subdimensions are applied to every entity, so scores are comparable across sectors.",
  },
  {
    label: "Independent",
    desc: "No entity pays to be included, scored higher, or have findings withheld — see the independence policy below.",
  },
  {
    label: "Contestable",
    desc: "Methodology version, evidence tiers, and the scoring formula are all published, so any score can be checked and challenged.",
  },
];

export default function NonprofitAltMethodologyPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-[72px] pb-10">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-[18px] items-start">
            <div>
              <Eyebrow>Methodology &middot; the credibility layer</Eyebrow>
              <h1 className="text-[clamp(2.2rem,5vw,4rem)] leading-[1.04] tracking-[-0.03em] mb-3.5">
                How we score, and why you can check our work
              </h1>
              <p className="text-muted text-[1.08rem] max-w-[860px] mb-[22px]">
                Compassion Benchmark scores {SCORED_ENTITY_COUNT_FORMATTED} governments, companies,
                AI labs, robotics labs, cities, and universities on a 0&ndash;100 scale built from{" "}
                <strong className="text-text">8 dimensions</strong> and{" "}
                <strong className="text-text">40 evidence-checked subdimensions</strong>. This page
                is for skeptics: the full framework, the evidence standard, and the independence
                policy that keeps every score free of influence from the entities it describes.
              </p>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-2">
                <Stat value="8" label="Core dimensions" />
                <Stat value="40" label="Scored subdimensions" />
                <Stat value="5" label="Evidence tiers" />
                <Stat value="v1.2" label="Methodology version" />
              </div>

              <div className="flex gap-3 flex-wrap mt-4">
                <Button href="#independence-policy" variant="primary">
                  Read the independence policy &rarr;
                </Button>
                <Button href={SUPPORT_URL}>Support this work</Button>
              </div>
            </div>

            <Panel>
              <h2 className="text-[1.08rem] font-bold mb-2.5">What every published score guarantees</h2>
              <ul className="space-y-2 text-muted mb-3">
                {GUARANTEES.map((g) => (
                  <li key={g.label}>
                    <span className="text-text font-bold">{g.label}</span> &mdash; {g.desc}
                  </li>
                ))}
              </ul>
              <div className="flex gap-2.5 flex-wrap">
                <Pill>Free to read</Pill>
                <Pill>Free to cite</Pill>
                <Pill>Open methodology</Pill>
              </div>
            </Panel>
          </div>
        </Container>
      </section>

      {/* The 8 dimensions */}
      <section id="dimensions" className="py-[30px] scroll-mt-24">
        <Container>
          <SectionHead
            title="The 8 dimensions"
            description="The same conceptual structure applies across every sector we score. What changes by entity type is the evidence model and interview protocol, not the underlying definition of compassion."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {DIMENSIONS.map((dim) => (
              <Card key={dim.code}>
                <h3 className="text-[1.02rem] font-bold mb-2" style={{ color: dim.color }}>
                  {dim.name} <span className="text-muted font-normal">({dim.code})</span>
                </h3>
                <p className="text-muted text-[0.9rem]">{dim.desc}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* 40-subdimension framework */}
      <section id="subdimensions" className="py-[30px] scroll-mt-24">
        <Container>
          <SectionHead
            title="The full 40-subdimension framework"
            description="Each of the 8 dimensions is scored through 5 subdimensions on a 0&ndash;5 behavioral anchor scale. Open any dimension to see all 5 of its subdimensions and the question each one asks."
          />
          <div className="space-y-2">
            {DIMENSIONS.map((dim) => {
              const rows = SUBDIM_ROWS.filter((r) => r.dimCode === dim.code);
              return (
                <details
                  key={dim.code}
                  className="group rounded-[14px] border border-line bg-[rgba(255,255,255,0.02)] overflow-hidden"
                >
                  <summary className="flex items-center gap-3 px-4 py-3.5 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden hover:bg-[rgba(255,255,255,0.03)] transition-colors">
                    <span
                      className="inline-block w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: dim.color }}
                      aria-hidden="true"
                    />
                    <span className="font-bold text-text" style={{ color: dim.color }}>
                      {dim.name}
                    </span>
                    <span className="text-muted text-[0.82rem]">({dim.code})</span>
                    <span className="text-muted text-[0.82rem] ml-auto mr-3 hidden sm:block">
                      {dim.desc}
                    </span>
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 13 13"
                      fill="none"
                      aria-hidden="true"
                      className="transition-transform group-open:rotate-90 shrink-0 motion-reduce:transition-none ml-auto sm:ml-0"
                    >
                      <path d="M4.5 2.5l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </summary>
                  <div className="border-t overflow-auto" style={{ borderColor: `${dim.color}30` }}>
                    <table className="w-full border-collapse text-[0.86rem]">
                      <caption className="sr-only">{dim.name} subdimensions: ID, name, and core assessment question</caption>
                      <thead>
                        <tr>
                          <th scope="col" className="text-muted text-left py-2.5 px-3 border-b border-line font-semibold text-[0.82rem] w-14">ID</th>
                          <th scope="col" className="text-muted text-left py-2.5 px-3 border-b border-line font-semibold text-[0.82rem] w-48">Subdimension</th>
                          <th scope="col" className="text-muted text-left py-2.5 px-3 border-b border-line font-semibold text-[0.82rem]">Core assessment question</th>
                        </tr>
                      </thead>
                      <tbody className="text-muted">
                        {rows.map((row) => (
                          <tr key={row.id}>
                            <td className="py-2.5 px-3 border-b border-line font-bold text-text">{row.id}</td>
                            <td className="py-2.5 px-3 border-b border-line text-text">{row.name}</td>
                            <td className="py-2.5 px-3 border-b border-line">{row.question}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </details>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Evidence hierarchy */}
      <section id="evidence-hierarchy" className="py-[30px] scroll-mt-24">
        <Container>
          <SectionHead
            title="Evidence hierarchy"
            description="The benchmark deliberately weights evidence by independence and reliability. Strong scores require stronger evidence — a mission statement never outweighs an independent audit."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {EVIDENCE_TIERS.map((t) => (
              <Card key={t.tier}>
                <p className="text-accent text-[0.8rem] font-bold uppercase tracking-[0.06em] mb-1.5">{t.tier}</p>
                <h3 className="text-[0.98rem] font-bold mb-1.5">{t.title}</h3>
                <p className="text-muted text-[0.86rem] mb-2">{t.desc}</p>
                <p className="text-muted text-[0.78rem] uppercase tracking-[0.05em]">{t.weight}</p>
              </Card>
            ))}
          </div>
          <p className="text-muted text-[0.9rem] mt-4">
            Evidence beats aspiration: where an entity&apos;s claims diverge from lived experience,
            the methodology scores the world as encountered, not the world as described.
          </p>
        </Container>
      </section>

      {/* Score bands */}
      <section id="bands" className="py-[30px] scroll-mt-24">
        <Container>
          <SectionHead
            title="What a composite score means"
            description="Every dimension score (0&ndash;5) rolls up into a single 0&ndash;100 composite, interpreted through five public bands."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {BANDS.map((b) => (
              <div key={b.name} className="bg-[rgba(255,255,255,0.03)] border border-line rounded-[16px] p-3.5">
                <Band level={b.name.toLowerCase() as BandLevel} />
                <strong className="block mt-1.5 mb-1">{b.range}</strong>
                <span className="text-muted text-[0.9rem]">{b.desc}</span>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Methodology version */}
      <section id="version" className="py-[30px] scroll-mt-24">
        <Container>
          <Panel>
            <div className="flex items-center justify-between gap-4 mb-3 flex-wrap">
              <h2 className="text-[1.08rem] font-bold">Methodology version 1.2</h2>
              <Pill>Current version</Pill>
            </div>
            <p className="text-muted mb-2">
              Each subdimension is scored 0&ndash;5 against behavioral anchors. The 5 subdimensions
              in a dimension sum to a dimension score out of 10. The 8 dimension scores average out
              on the 0&ndash;5 scale and convert to a base composite via{" "}
              <span className="font-mono text-[0.9rem]">((avg &minus; 1) &divide; 4) &times; 100</span>,
              plus an integration premium of up to 10 points for balanced, consistent performance
              across all 8 dimensions &mdash; clamped to a 0&ndash;100 maximum.
            </p>
            <p className="text-muted text-[0.9rem]">
              The composite formula lives in a single shared core consumed by both the published
              site and the research pipeline, with a determinism test suite acting as the drift
              gate &mdash; every published composite is reconstructible from its 8 dimension scores.
            </p>
          </Panel>
        </Container>
      </section>

      {/* Independence policy — front and center */}
      <section id="independence-policy" className="py-[30px] scroll-mt-24">
        <Container>
          <SectionHead
            title="The independence policy"
            description="This is the single load-bearing trust commitment of the benchmark. If it were ever compromised, nothing published here would mean anything."
          />
          <Callout>
            <p className="text-accent text-[0.86rem] font-bold uppercase tracking-[0.08em] mb-2">
              The independence policy
            </p>
            <h3 className="text-[clamp(1.4rem,3vw,1.9rem)] mb-4">
              Entities never pay for inclusion, score changes, or suppression of findings.
            </h3>
            <div className="grid grid-cols-1 gap-0 mb-4">
              {[
                {
                  label: "Inclusion is editorial",
                  explanation: "Which entities are benchmarked is determined by the editorial team based on institutional significance. It cannot be purchased, sponsored, or influenced by the entity being benchmarked.",
                },
                {
                  label: "Scores are evidence-driven",
                  explanation: "A score reflects the 8-dimension framework applied to available evidence. It is not negotiable. An entity cannot pay to raise, lower, suppress, delay, or condition any score.",
                },
                {
                  label: "Support funds the mission, never a score",
                  explanation: "Donations and grants sustain the research pipeline itself — the evidence review, the editorial oversight, the infrastructure. Support cannot influence what is scored or how.",
                },
                {
                  label: "Findings are published, not embargoed",
                  explanation: "Every confirmed score change is published to the Daily Briefing and the public index pages at the same time, for every reader, free.",
                },
                {
                  label: "Conflicts are declared",
                  explanation: "If an editorial relationship exists with a benchmarked entity, it is disclosed on that entity's page.",
                },
              ].map((item) => (
                <div key={item.label} className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-2 lg:gap-4 py-3 border-b border-line last:border-b-0">
                  <span className="font-bold text-text">{item.label}</span>
                  <span className="text-muted">{item.explanation}</span>
                </div>
              ))}
            </div>
            <p className="text-muted mb-2">{INDEPENDENCE_FIREWALL_LINE}</p>
            <p className="text-muted text-[0.92rem] italic">
              Independence here is not a policy &mdash; it&apos;s an architecture. The pipeline that
              produces every score cannot read a supporter list, a payment record, or a grant
              agreement. Nothing an entity or a funder does can move a number.
            </p>
          </Callout>
        </Container>
      </section>

      {/* Related indexes — real routes, real counts */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="See the framework applied"
            description="All 8 published indexes use this same framework, so a score means the same thing whether it belongs to a country or a company."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {INDEX_REGISTRY.slice(0, 4).map((entry) => (
              <Card key={entry.indexRoute} href={entry.indexRoute}>
                <h3 className="text-[1.0rem] font-bold mb-1.5">{entry.indexLabel}</h3>
                <p className="text-muted text-[0.86rem]">Free to read and cite &rarr;</p>
              </Card>
            ))}
          </div>
          <p className="text-muted text-[0.85rem] mt-4">
            See all {INDEX_REGISTRY.length} indexes on the{" "}
            <a href="/nonprofit-alt/indexes" className="text-accent hover:underline">indexes page &rarr;</a>
          </p>
        </Container>
      </section>

      {/* Compact donate surface — required firewall line included via DonateCTA */}
      <section className="py-[30px]">
        <Container>
          <DonateCTA
            heading="Support this work"
            description="Every dollar funds evidence review and editorial oversight — not a subscription. The methodology above stays free and open either way."
            showTiers={false}
          />
        </Container>
      </section>
    </>
  );
}
