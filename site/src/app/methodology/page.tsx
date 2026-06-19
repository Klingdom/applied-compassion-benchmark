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
import NewsletterSignup from "@/components/ui/NewsletterSignup";
import DefinedTermSetJsonLd from "@/components/seo/DefinedTermSetJsonLd";
import { BANDS, DIMENSIONS, INTEGRATION_PREMIUM } from "@/data/dimensions";
import { SCORED_ENTITY_COUNT_FORMATTED } from "@/data/entityCount";
import DimensionRadar from "@/components/charts/DimensionRadar";
import AnchorLadder from "@/components/charts/AnchorLadder";
import BandScaleStrip from "@/components/charts/BandScaleStrip";
import IntegrationPremiumDiagram from "@/components/charts/IntegrationPremiumDiagram";
import ScorePipelineDiagram from "@/components/charts/ScorePipelineDiagram";
import ConsistencyStepChart from "@/components/charts/ConsistencyStepChart";
import EvidencePyramid from "@/components/charts/EvidencePyramid";
import PipelineFlowDiagram from "@/components/charts/PipelineFlowDiagram";
import ChartFrame from "@/components/charts/ChartFrame";
import MethodologyTOC from "@/components/methodology/MethodologyTOC";

export const metadata: Metadata = { title: "Methodology", description: "Understand the 8-dimension, 40-subdimension scoring framework, evidence hierarchy, and adversarial pressure-test model behind the benchmark." };

// Derived 40-row table from canonical DIMENSIONS data (Item 2)
const SUBDIM_ROWS = DIMENSIONS.flatMap((d) =>
  d.subdims.map((sd) => ({ dim: d.name, dimCode: d.code, dimColor: d.color, id: sd.code, subdim: sd.name, question: sd.desc, anchors: sd.anchors }))
);

// TOC items — benefit-phrased labels (#5)
const TOC_ITEMS = [
  { id: "framework-overview", label: "What every score guarantees" },
  { id: "pressure-test", label: "The pressure-test principle" },
  { id: "scoring-model", label: "How scores are built" },
  { id: "worked-example", label: "A real scored entity" },
  { id: "rubric-anchors", label: "Anchor scale and bands" },
  { id: "evidence-hierarchy", label: "Evidence hierarchy" },
  { id: "assessor-orientation", label: "Framework overview" },
  { id: "continuous-pipeline", label: "7-session protocol" },
  { id: "approval-gate", label: "Human approval gate" },
  { id: "floor-designation", label: "Floor designation" },
  { id: "subdimension-framework", label: "Full 40-subdim table" },
  { id: "independence-policy", label: "Independence policy" },
  { id: "changelog", label: "Version history" },
];

export default function MethodologyPage() {
  return (
    <>
      {/* SEO/AEO: DefinedTermSet JSON-LD */}
      <DefinedTermSetJsonLd />

      {/* #5 — sticky TOC + reading progress bar (client island) */}
      <MethodologyTOC items={TOC_ITEMS} />

      <main id="main-content">
        {/* Hero */}
        <section id="framework-overview" className="pt-[72px] pb-10 scroll-mt-24">
          <Container>
            {/* #5 mobile TOC injected by MethodologyTOC above Container */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-[18px] items-start">
              <div>
                <Eyebrow>Methodology &amp; Framework</Eyebrow>
                <h1 className="text-[clamp(2.2rem,5vw,4rem)] leading-[1.04] tracking-[-0.03em] mb-3.5">
                  How the Compassion Benchmark works
                </h1>
                <p className="text-muted text-[1.08rem] max-w-[860px] mb-[22px]">
                  Most institutional ratings measure what organizations say. The Compassion Benchmark measures what they do when compassion is costly — scored on a 0–100 scale built from 8 dimensions and 40 evidence-checked subdimensions.
                </p>
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
                  <Stat value="8" label="Core dimensions" />
                  <Stat value="40" label="Scored subdimensions" />
                  <Stat value="7" label="Human assessment sessions" />
                  <Stat value="5" label="Evidence tiers" />
                  <Stat value="0–100" label="Composite score scale" />
                  <Stat value="v1.1" label="Methodology version" />
                </div>
              </div>

              <Panel>
                <h2 className="text-[1.08rem] font-bold mb-2.5">What every published score guarantees</h2>
                <ul className="space-y-2 text-muted mb-3">
                  <li>
                    <span className="text-text font-bold">Evidence-grounded</span> — every score traces to documented public evidence across a 5-tier hierarchy, not opinion or self-report.
                  </li>
                  <li>
                    <span className="text-text font-bold">Adversarially tested</span> — performance only counts when it held up under cost or pressure (the{" "}
                    <a href="#pressure-test" className="text-[#7dd3fc] hover:underline">pressure-test principle</a>
                    ).
                  </li>
                  <li>
                    <span className="text-text font-bold">Reproducible</span> — the same 8 dimensions and 40 subdimensions are applied to every entity, so scores are comparable across sectors.
                  </li>
                  <li>
                    <span className="text-text font-bold">Independent</span> — no entity pays to be included, scored higher, or have findings withheld.
                  </li>
                  <li>
                    <span className="text-text font-bold">Contestable</span> — methodology version, evidence tiers, and scoring are published so any score can be checked and challenged.
                  </li>
                </ul>
                <div className="flex gap-2.5 flex-wrap">
                  <Pill>Interviews</Pill>
                  <Pill>Observation</Pill>
                  <Pill>Document Review</Pill>
                  <Pill>Community Testimony</Pill>
                </div>
              </Panel>
            </div>
          </Container>
        </section>

        {/* #11 — REORDERED: scoring block first (pressure-test → scoring model → worked example → anchors → bands → evidence) */}

        {/* Pressure-test principle */}
        <section id="pressure-test" className="py-[30px] scroll-mt-24">
          <Container>
            <Callout>
              <p className="text-accent text-[0.86rem] font-bold uppercase tracking-[0.08em] mb-2">Core methodological principle</p>
              <h2 className="text-[clamp(1.5rem,3vw,2rem)] mb-2">The pressure-test principle</h2>
              <p className="text-muted max-w-[920px] mb-3">
                Every dimension is assessed under adversarial conditions. For each subdimension, assessors look for at least one documented case where compassionate behavior was costly, legally risky, or institutionally inconvenient. If no such case exists, the maximum subdimension score is capped at Developing, even when the entity appears strong under favorable conditions.
              </p>
              <p className="text-muted text-[0.92rem] mb-3">
                In plain terms: high performance when it is easy is not treated as sufficient evidence of compassionate institutional character.
              </p>
              {/* #8 — inline "see this rule applied" link */}
              <p className="text-[0.86rem] text-muted">
                See this rule applied:{" "}
                <a href="/ai-lab/hugging-face" className="text-[#7dd3fc] hover:underline">Hugging Face</a>{" "}
                maintains an Exemplary designation across 7 of 8 dimensions, with pressure-test evidence present for each.
              </p>
            </Callout>
          </Container>
        </section>

        {/* Scoring model + pipeline + Integration premium */}
        <section id="scoring-model" className="py-[30px] scroll-mt-24">
          <Container>
            <SectionHead
              title="How scores are built"
              description="From individual subdimension anchors to the 0–100 composite."
            />

            {/* #6 — Score-building pipeline diagram */}
            <div className="mb-6">
              <ChartFrame
                title="The scoring pipeline"
                dek="40 subdimensions (0–5) → 8 dimensions (/10) → base /80 → +premium /10 → composite /100 → band"
                path="/methodology"
              >
                <ScorePipelineDiagram />
              </ChartFrame>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Panel>
                <h3 className="text-[1.08rem] font-bold mb-2.5">Common scoring model</h3>
                <p className="text-muted mb-3">
                  Each subdimension is scored on a 0–5 anchored behavioral scale. The five subdimensions within a dimension are summed and converted into a dimension score out of 10. The eight dimension scores together create a base total out of 80, which is then combined with an integration premium worth up to 10 additional points to produce a 0–100 composite.
                </p>
                {/* Item 14 — inline formula line */}
                <p className="text-[0.92rem] font-mono border border-line rounded-[10px] px-3 py-2 mb-3 bg-[rgba(255,255,255,0.02)]">
                  <span className="text-[#7dd3fc] font-bold">(8 dimensions</span>
                  <span className="text-muted"> &times; </span>
                  <span className="text-[#86efac] font-bold">up to 10 pts</span>
                  <span className="text-muted">)</span>
                  <span className="text-muted"> = </span>
                  <span className="text-text font-bold">base 80</span>
                  <span className="text-muted"> + </span>
                  <span className="text-[#fcd34d] font-bold">integration premium (0–10)</span>
                  <span className="text-muted"> = </span>
                  <span className="text-[#7dd3fc] font-bold">composite 0–100</span>
                </p>
                <p className="text-muted text-[0.92rem]">
                  A score of 0 represents active documented harm and requires lead assessor co-sign. A score of 4 or 5 is provisional unless there is pressure-test evidence.
                </p>
              </Panel>
              <Panel>
                <h3 className="text-[1.08rem] font-bold mb-2.5">Integration premium logic</h3>
                <p className="text-muted mb-3 text-[0.92rem] italic border-l-2 border-[rgba(125,211,252,0.3)] pl-3">
                  {INTEGRATION_PREMIUM.detail}
                </p>
                <p className="text-muted mb-3">
                  {INTEGRATION_PREMIUM.short}
                </p>
                {/* #16 — std-dev → consistency-factor step chart */}
                <div className="mt-3">
                  <ChartFrame
                    title="Standard deviation → consistency factor"
                    dek="Lower variance across 8 dimension scores earns a higher premium multiplier."
                    path="/methodology"
                  >
                    <ConsistencyStepChart />
                  </ChartFrame>
                </div>
                {/* #8 — inline link: integration premium applied */}
                <p className="text-[0.86rem] text-muted mt-3">
                  See this rule applied:{" "}
                  <a href="/company/costco" className="text-[#7dd3fc] hover:underline">Costco</a>{" "}
                  earns a reduced integration premium because its EQU and SYS dimension scores are below the 4.0 balance threshold.
                </p>
              </Panel>
            </div>

            {/* Integration premium diagram */}
            <div id="integration-premium-diagram" className="scroll-mt-20 mt-4">
              <ChartFrame
                title="Why isn't the composite just the average?"
                dek="Base score (0–80) + integration premium (0–10) = composite (0–100). Three worked examples showing how profile shape changes the premium."
                path="/methodology"
              >
                <IntegrationPremiumDiagram />
              </ChartFrame>
            </div>
          </Container>
        </section>

        {/* #7 — End-to-end worked example */}
        <section id="worked-example" className="py-[30px] scroll-mt-24">
          <Container>
            <SectionHead
              title="A real scored entity: Abridge"
              description="Walking the full scoring chain — anchors → dimension → base → integration premium → composite → band — using a real entity from the AI Labs index."
            />
            <Panel>
              {/* Entity intro */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <div>
                  <h3 className="text-[1.08rem] font-bold">
                    <a href="/ai-lab/abridge" className="text-[#7dd3fc] hover:underline">Abridge</a>
                  </h3>
                  <p className="text-muted text-[0.86rem]">AI Labs index · Rank 5 · Sector: AI/Healthcare</p>
                </div>
                <Band level="established" />
                <span className="font-bold text-text text-[1.1rem]">60.9</span>
              </div>

              {/* Step 1: Dimension scores */}
              <h4 className="text-[0.92rem] font-bold text-muted uppercase tracking-[0.07em] mb-2">Step 1 — Subdimension anchors → dimension scores</h4>
              <p className="text-muted text-[0.88rem] mb-3">
                Each of the 8 dimensions has 5 subdimensions, each scored 0–5 against behavioral anchors. The 5 subdimension scores sum to a dimension score out of 25, then convert to /10 (÷2.5). Abridge&apos;s assessed subdimension averages:
              </p>
              <div className="overflow-auto mb-4">
                <table className="w-full border-collapse text-[0.86rem]">
                  <caption className="sr-only">Abridge dimension scores: subdimension average, dimension score out of 10, and notes</caption>
                  <thead>
                    <tr>
                      <th scope="col" className="text-muted text-left py-2 px-2.5 border-b border-line font-semibold">Dimension</th>
                      <th scope="col" className="text-muted text-right py-2 px-2.5 border-b border-line font-semibold">Subdim avg (0–5)</th>
                      <th scope="col" className="text-muted text-right py-2 px-2.5 border-b border-line font-semibold">Dim score (/10)</th>
                      <th scope="col" className="text-muted text-left py-2 px-2.5 border-b border-line font-semibold">Anchor level</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted">
                    {[
                      ["AWR", "Awareness",        3.5, 7.0, "Developing → Established"],
                      ["EMP", "Empathy",           3.5, 7.0, "Developing → Established"],
                      ["ACT", "Action",            3.5, 7.0, "Developing → Established"],
                      ["EQU", "Equity",            3.0, 6.0, "Developing"],
                      ["BND", "Boundaries",        3.5, 7.0, "Developing → Established"],
                      ["ACC", "Accountability",    3.5, 7.0, "Developing → Established"],
                      ["SYS", "Systemic Thinking", 3.5, 7.0, "Developing → Established"],
                      ["INT", "Integrity",         3.5, 7.0, "Developing → Established"],
                    ].map(([code, name, avg, dim, anchor]) => (
                      <tr key={code as string}>
                        <td className="py-2 px-2.5 border-b border-line">
                          <span className="font-bold text-text">{code as string}</span>
                          <span className="ml-2 text-muted">{name as string}</span>
                        </td>
                        <td className="py-2 px-2.5 border-b border-line text-right font-mono">{(avg as number).toFixed(1)}</td>
                        <td className="py-2 px-2.5 border-b border-line text-right font-mono font-bold text-text">{(dim as number).toFixed(1)}</td>
                        <td className="py-2 px-2.5 border-b border-line">{anchor as string}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Step 2: Base */}
              <h4 className="text-[0.92rem] font-bold text-muted uppercase tracking-[0.07em] mb-2">Step 2 — Base score</h4>
              <p className="text-muted text-[0.88rem] mb-2">
                Sum of 8 dimension scores: 7.0 + 7.0 + 7.0 + 6.0 + 7.0 + 7.0 + 7.0 + 7.0 = <strong className="text-text">55.0 / 80</strong>
              </p>

              {/* Step 3: Integration premium */}
              <h4 className="text-[0.92rem] font-bold text-muted uppercase tracking-[0.07em] mb-2 mt-3">Step 3 — Integration premium</h4>
              <p className="text-muted text-[0.88rem] mb-2">
                Standard deviation across 8 dimension scores [7,7,7,6,7,7,7,7] ≈ 0.94 → consistency factor 100% (σ ≤ 1.5). All dimension scores are at or above 6.0/10, so no balance penalty applies. Integration premium formula applied: <strong className="text-text">+5.9 points</strong>.
              </p>

              {/* Step 4: Composite */}
              <h4 className="text-[0.92rem] font-bold text-muted uppercase tracking-[0.07em] mb-2 mt-3">Step 4 — Composite and band</h4>
              <p className="text-muted text-[0.88rem] mb-2">
                55.0 (base) + 5.9 (premium) = <strong className="text-text">60.9 composite</strong>.
              </p>
              <p className="text-muted text-[0.88rem] mb-3">
                60.9 falls in the <strong className="text-text">Established</strong> band (60–80): practices are systematic, documented, and supported by consistent evidence — but the sub-4.0 average on Equity (EQU 3.0) signals a dimension requiring further improvement.
              </p>

              <div className="flex items-center gap-3">
                <Band level="established" />
                <a href="/ai-lab/abridge" className="text-[#7dd3fc] text-[0.88rem] hover:underline">
                  See Abridge&apos;s full entity page →
                </a>
              </div>
            </Panel>
          </Container>
        </section>

        {/* Rubric anchors and score bands */}
        <section id="rubric-anchors" className="py-[30px] scroll-mt-24">
          <Container>
            <SectionHead
              title="Rubric anchors and score bands"
              description="The Human Assessment Battery uses universal behavioral anchors at the subdimension level and a five-band public interpretation model at the composite level."
            />

            {/* 0–5 anchor ladder visual */}
            <div id="anchor-ladder" className="scroll-mt-20 mb-6">
              <ChartFrame
                title="What each score level means"
                dek="The 0–5 behavioral anchor scale. Every subdimension is scored against these six anchors."
                path="/methodology"
              >
                <AnchorLadder />
              </ChartFrame>
            </div>

            {/* Band scale strip */}
            <div className="mb-6">
              <ChartFrame
                title="What the composite score means"
                dek="The five composite bands mapped across the 0–100 scale."
                path="/methodology"
              >
                <BandScaleStrip />
              </ChartFrame>
            </div>

            {/* Band/anchor name-collision disambiguator */}
            <div className="mb-6 border border-line rounded-[14px] bg-[rgba(255,255,255,0.02)] px-5 py-4 text-muted text-[0.92rem]">
              <p>
                <strong className="text-text">These labels describe two different things.</strong> Anchor levels score a single subdimension (0–5); bands describe the whole-entity composite (0–100). They share some names by design but are not the same measurement — an entity can have several &lsquo;Established&rsquo; subdimensions and still land in a lower band.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Panel>
                <table className="w-full border-collapse">
                  <caption className="sr-only">Rubric anchor scale: score 0–5 with anchor name and meaning for each level</caption>
                  <thead>
                    <tr>
                      <th scope="col" className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">Score</th>
                      <th scope="col" className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">Anchor level</th>
                      <th scope="col" className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">Meaning</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted">
                    {[
                      ["0", "Active Harm", "Specific documented harm in the domain; lead assessor co-sign required."],
                      ["1", "Absent", "No meaningful capacity exists."],
                      ["2", "Minimal", "Nominal capacity exists but fails under pressure and does not produce consistent real-world outcomes."],
                      ["3", "Developing", "Good-faith capacity exists in some cases, but not consistently or comprehensively."],
                      ["4", "Established", "Consistent operational capacity across most cases; community confirms positive experience."],
                      ["5", "Exemplary", "Outstanding independently verified performance sustained under significant pressure."],
                    ].map(([score, anchor, meaning]) => (
                      <tr key={score}>
                        <td className="py-3 px-2.5 border-b border-line text-text font-bold">{score}</td>
                        <td className="py-3 px-2.5 border-b border-line text-text">
                          <span className="text-muted mr-1">{score} &middot;</span>{anchor}
                        </td>
                        <td className="py-3 px-2.5 border-b border-line">{meaning}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Panel>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {BANDS.map((b) => (
                  <div key={b.name} className="bg-[rgba(255,255,255,0.03)] border border-line rounded-[16px] p-3.5">
                    <Band level={b.name.toLowerCase() as BandLevel} />
                    <strong className="block mt-1.5 mb-1">{b.range}</strong>
                    <span className="text-muted text-[0.92rem]">{b.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </section>

        {/* #12 — Evidence hierarchy as weighted pyramid */}
        <section id="evidence-hierarchy" className="py-[30px] scroll-mt-24">
          <Container>
            <SectionHead
              title="Evidence hierarchy"
              description="The benchmark deliberately differentiates evidence by independence and reliability. Strong scores require stronger evidence."
            />
            {/* #12 — pyramid replaces 6 equal cards */}
            <ChartFrame
              title="5-tier evidence trust pyramid"
              dek="Tiers narrower at top = higher weight. Evidence beats aspiration: where claims diverge from lived experience, the methodology scores the world as encountered."
              path="/methodology"
            >
              <EvidencePyramid />
            </ChartFrame>

            {/* #8 — inline link: evidence hierarchy applied */}
            <div className="mt-4 text-muted text-[0.88rem] border border-line rounded-[12px] px-4 py-3 bg-[rgba(255,255,255,0.02)]">
              <strong className="text-text">Evidence hierarchy applied:</strong>{" "}
              Floor-designated entities require corroboration from at least two T1 (Tier 1/Tier 2) sources — treaty bodies, courts of universal jurisdiction, IPC, ICRC, or equivalent.{" "}
              <a href="/country/israel" className="text-[#7dd3fc] hover:underline">See Israel&apos;s floor designation</a>{" "}
              for an example of multi-source T1 corroboration: ICJ provisional measures, ICC arrest warrants, and IPC famine determination all cited.
            </div>
          </Container>
        </section>

        {/* Framework overview (dimension cards + radar) */}
        <section id="assessor-orientation" className="py-[30px] scroll-mt-24">
          <Container>
            <SectionHead
              title="Framework overview"
              description="The benchmark preserves the same conceptual structure across sectors. What changes by entity type is the evidence model and assessment protocol, not the underlying definition of compassion."
            />
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
              {/* #20 — dimension cards link to their subdim group */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                {DIMENSIONS.map((dim) => (
                  <Card key={dim.code}>
                    <h3 className="text-[1.08rem] font-bold mb-2">
                      <a
                        href={`#subdim-group-${dim.code}`}
                        className="hover:text-[#7dd3fc] transition-colors"
                        style={{ color: dim.color }}
                      >
                        {dim.name} ({dim.code})
                      </a>
                    </h3>
                    <p className="text-muted">{dim.desc}</p>
                  </Card>
                ))}
              </div>

              {/* 8-dimension framework radar */}
              <div id="framework-radar" className="scroll-mt-20">
                <ChartFrame
                  title="The 8 dimensions"
                  dek="Framework diagram — not a real entity score. Each axis scored 0–5."
                  path="/methodology"
                >
                  <DimensionRadar
                    scores={Object.fromEntries(DIMENSIONS.map((d) => [d.code, 3.5]))}
                    entityName="Framework (representative)"
                    band="Functional"
                    ariaLabel={`The 8 compassion dimensions: ${DIMENSIONS.map((d) => `${d.name} (${d.code})`).join(", ")}. Each scored 0–5. This is a representative shape showing the framework structure, not a real entity score.`}
                    caption="Framework diagram — representative shape only, not a scored entity. Source: Compassion Benchmark · CC-BY"
                  />
                </ChartFrame>
              </div>
            </div>
          </Container>
        </section>

        {/* Assessor orientation + Interview principles */}
        <section id="assessment-protocol" className="py-[30px] scroll-mt-24">
          <Container className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Panel>
              <h3 className="text-[1.08rem] font-bold mb-2.5">Assessor orientation</h3>
              <ul className="list-disc pl-[18px] text-muted space-y-2">
                <li>Warmth and rigor are not opposites. Assessors document what they observe, not what leadership prefers.</li>
                <li>Policies on paper are weaker evidence than lived practice, observed outcomes, or affected-community testimony.</li>
                <li>Skipping the awkward question is one of the fastest ways to produce a weak assessment.</li>
                <li>If leadership and community testimony conflict, the community account is treated as the primary reference point.</li>
              </ul>
            </Panel>
            <Panel>
              <h3 className="text-[1.08rem] font-bold mb-2.5">Interview principles</h3>
              <ul className="list-disc pl-[18px] text-muted space-y-2">
                <li>Ask for examples, not abstractions.</li>
                <li>Follow the power gradient and include the least protected voices.</li>
                <li>Name the gap explicitly when a policy exists but no applied example can be produced.</li>
                <li>Treat deflection, silence, and refusal to provide evidence as data rather than noise.</li>
                <li>Score conservatively when evidence is incomplete, then flag for lead assessor review.</li>
              </ul>
            </Panel>
          </Container>
        </section>

        {/* 7-session protocol */}
        <section id="continuous-pipeline" className="py-[30px] scroll-mt-24">
          <Container>
            <SectionHead
              title="7-session human assessment protocol"
              description="The Human Assessment Battery uses a structured sequence intended to compare leadership narrative, frontline reality, community experience, and documentary evidence before final score synthesis."
            />
            <Panel>
              <table className="w-full border-collapse">
                <caption className="sr-only">7-session human assessment protocol: session number, participants, primary focus, and typical duration</caption>
                <thead>
                  <tr>
                    <th scope="col" className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">Session</th>
                    <th scope="col" className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">Participants</th>
                    <th scope="col" className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">Primary focus</th>
                    <th scope="col" className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">Typical duration</th>
                  </tr>
                </thead>
                <tbody className="text-muted">
                  {[
                    ["1A", "Senior leadership (2–3 people)", "Awareness, Action, Accountability, Integrity", "90 min"],
                    ["1B", "HR / People / Ethics leads", "Empathy, Boundaries", "60 min"],
                    ["2A", "Frontline staff selected by entity", "Pressure-test prior leadership claims", "60 min"],
                    ["2B", "Frontline staff selected independently by assessor", "Repeat and compare against entity-selected group", "60 min"],
                    ["3A", "Affected community members recruited independently", "Equity and Systemic Thinking, plus lived-experience validation", "90 min"],
                    ["3B", "Solo assessor document review", "Cross-check claims against records, protocols, data, and artifacts", "60 min"],
                    ["4", "Lead assessor synthesis", "Score finalization, discrepancy resolution, escalation flags", "60 min"],
                  ].map(([session, participants, focus, duration]) => (
                    <tr key={session}>
                      <td className="py-3 px-2.5 border-b border-line text-text font-bold">{session}</td>
                      <td className="py-3 px-2.5 border-b border-line">{participants}</td>
                      <td className="py-3 px-2.5 border-b border-line">{focus}</td>
                      <td className="py-3 px-2.5 border-b border-line">{duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>
          </Container>
        </section>

        {/* #19 — Continuous pipeline as 4-stage flow + human-approval gate */}
        <section className="py-[30px] scroll-mt-24">
          <Container>
            <SectionHead
              title="Continuous research pipeline"
              description={`After an initial human assessment establishes a baseline, a four-stage nightly pipeline monitors every benchmarked entity for material evidence within a 14-day recency window. Scores change only after human review.`}
            />

            <div className="mb-5">
              <ChartFrame
                title="How the nightly pipeline works"
                dek={`Scanner → Assessor → Digest → Human Approval Gate. ~30% of proposals are returned before reaching the published index.`}
                path="/methodology"
              >
                <PipelineFlowDiagram />
              </ChartFrame>
            </div>

            {/* Stage detail cards preserved below the diagram */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {[
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
                  title: "Founder approval",
                  desc: "Every proposed score change is reviewed and approved — or rejected — by a human before reaching production. The approval log is auditable.",
                },
              ].map((item) => (
                <Card key={item.title}>
                  <p className="text-accent text-[0.86rem] font-bold uppercase tracking-[0.08em] mb-2">{item.stage}</p>
                  <h3 className="text-[1.08rem] font-bold mb-2">{item.title}</h3>
                  <p className="text-muted">{item.desc}</p>
                </Card>
              ))}
            </div>
            <Panel>
              <p className="text-muted">
                Each entity page on the published site carries a freshness stamp — <em>Evidence reviewed YYYY-MM-DD</em> — showing either that no material change surfaced in the last 14 days (green) or that new evidence is under review (orange). The scanner touches every one of the {SCORED_ENTITY_COUNT_FORMATTED} entities daily, not only the most active ones.
              </p>
            </Panel>
          </Container>
        </section>

        {/* #13 — methodology-matched newsletter ask */}
        <section className="py-[30px]">
          <Container>
            <div className="max-w-[680px] mx-auto">
              <NewsletterSignup
                variant="card"
                source="methodology"
                preamble="Watch the methodology in motion — every score change runs the human approval gate you just read about. The weekly briefing surfaces which entities moved and why. Free and editorial. Commercial products are separate and do not affect scoring."
              />
            </div>
          </Container>
        </section>

        {/* Human approval gate */}
        <section id="approval-gate" className="py-[30px] scroll-mt-24">
          <Container>
            <Callout>
              <p className="text-accent text-[0.86rem] font-bold uppercase tracking-[0.08em] mb-2">Structural safeguard</p>
              <h2 className="text-[clamp(1.5rem,3vw,2rem)] mb-2">No automated score changes</h2>
              <p className="text-muted max-w-[920px] mb-3">
                Every proposed score change — whether generated by the overnight research pipeline, a new evidence disclosure, or a scheduled rotation — requires explicit human approval before it reaches the published index. The approval log is retained. The proposal and its evidence are retained. The decision is retained.
              </p>
              <p className="text-muted text-[0.92rem]">
                This gate is not a review of surface numbers. The approver examines the assessment reasoning, the evidence quality, the sector context, and any discrepancy with prior findings. Approximately 30 percent of generated proposals are sent back for additional evidence or adjusted before approval. Rejections are logged alongside approvals.
              </p>
            </Callout>
          </Container>
        </section>

        {/* #18 — Floor designation: definition visible, trigger/contents/exit in <details> */}
        <section id="floor-designation" className="py-[30px] scroll-mt-24">
          <Container>
            <SectionHead
              title="Floor designation"
              description="When the composite resolves at zero — the methodology basis, the trigger criteria, and how an entity exits the floor."
            />
            <Panel>
              {/* Definition always visible */}
              <p className="text-muted mb-4 max-w-[920px]">
                The composite formula has a natural mathematical floor: when all 8 dimensions resolve at the lowest behavioral anchor (1.0/5.0), the composite is exactly 0. Floor designation is the formal methodology disclosure attached to entities whose evidence pattern, sustained across multiple assessment cycles, satisfies that floor.
              </p>
              <p className="text-muted mb-4 max-w-[920px]">
                Without floor designation, residual sub-anchor variance (1.1, 1.2, 1.3) can keep an entity slightly above zero even when documented evidence shows no functional compassion behavior at any dimension. Floor designation resolves this by setting all dimensions to the floor anchor and attaching a public &ldquo;call out why&rdquo; disclosure on the entity page.
              </p>

              {/* #8 — inline link: floor designation applied */}
              <p className="text-[0.88rem] text-muted mb-4 border-l-2 border-[rgba(248,113,113,0.4)] pl-3">
                See this designation applied:{" "}
                <a href="/ai-lab/character-ai" className="text-[#7dd3fc] hover:underline">Character AI</a>{" "}
                (Pennsylvania AG enforcement + wrongful death settlements),{" "}
                <a href="/country/israel" className="text-[#7dd3fc] hover:underline">Israel</a>{" "}
                (ICJ, ICC, IPC corroboration), and{" "}
                <a href="/country/myanmar" className="text-[#7dd3fc] hover:underline">Myanmar</a>{" "}
                (junta formalization + martial law expansion 2026).
              </p>

              {/* #18 — Trigger criteria in <details> */}
              <details className="group mb-3 rounded-[10px] border border-line bg-[rgba(255,255,255,0.01)] overflow-hidden">
                <summary className="flex items-center gap-2 px-4 py-3 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden text-[0.9rem] font-semibold text-text hover:text-[#7dd3fc] transition-colors">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true" className="transition-transform group-open:rotate-90 shrink-0 motion-reduce:transition-none">
                    <path d="M4.5 2.5l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Trigger criteria — all four required across ≥3 assessment cycles
                </summary>
                <div className="border-t border-line px-4 py-4">
                  <p className="text-muted text-[0.88rem] mb-3">All four conditions must be documented across at least three independent assessment cycles:</p>
                  <ol className="list-decimal pl-6 space-y-2 text-muted">
                    <li>
                      <strong className="text-text">Multi-source evidence</strong> &mdash; the harm pattern is corroborated by at least two T1 (Tier 1/Tier 2 evidence) sources (treaty bodies, courts of universal jurisdiction, IPC, ICRC, or equivalent) or three independent T2 sources.
                    </li>
                    <li>
                      <strong className="text-text">Systemic, not episodic</strong> &mdash; the pattern is structural to the entity&rsquo;s operation, not a single incident or a contained episode.
                    </li>
                    <li>
                      <strong className="text-text">Active during the evidence window</strong> &mdash; documented harm continues within the most recent 14-day recency window, not historical only.
                    </li>
                    <li>
                      <strong className="text-text">No countervailing recognition or response</strong> &mdash; the entity has not produced functional response infrastructure sufficient to register at any sub-dimension above the floor anchor.
                    </li>
                  </ol>
                </div>
              </details>

              {/* #18 — Disclosure contents in <details> */}
              <details className="group mb-3 rounded-[10px] border border-line bg-[rgba(255,255,255,0.01)] overflow-hidden">
                <summary className="flex items-center gap-2 px-4 py-3 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden text-[0.9rem] font-semibold text-text hover:text-[#7dd3fc] transition-colors">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true" className="transition-transform group-open:rotate-90 shrink-0 motion-reduce:transition-none">
                    <path d="M4.5 2.5l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  What floor designation surfaces on the entity page
                </summary>
                <div className="border-t border-line px-4 py-4">
                  <p className="text-muted text-[0.88rem] mb-3">Every floor-designated entity page displays a structured disclosure containing:</p>
                  <ul className="list-disc pl-6 space-y-2 text-muted">
                    <li><strong className="text-text">Designated date</strong> &mdash; when the floor was formally applied.</li>
                    <li><strong className="text-text">Evidence window</strong> &mdash; the 14-day window of corroborating evidence.</li>
                    <li><strong className="text-text">Rationale</strong> &mdash; the methodology basis, in plain language.</li>
                    <li><strong className="text-text">Primary drivers</strong> &mdash; the dimensions where harm pattern is most documented.</li>
                    <li><strong className="text-text">Documented evidence pattern</strong> &mdash; bulleted summary of corroborating findings, written for transparency rather than persuasion.</li>
                    <li><strong className="text-text">Methodology version</strong> &mdash; the methodology revision under which the designation was applied.</li>
                  </ul>
                </div>
              </details>

              {/* #18 — Exit protocol in <details> */}
              <details className="group mb-3 rounded-[10px] border border-line bg-[rgba(255,255,255,0.01)] overflow-hidden">
                <summary className="flex items-center gap-2 px-4 py-3 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden text-[0.9rem] font-semibold text-text hover:text-[#7dd3fc] transition-colors">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true" className="transition-transform group-open:rotate-90 shrink-0 motion-reduce:transition-none">
                    <path d="M4.5 2.5l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  How an entity exits the floor
                </summary>
                <div className="border-t border-line px-4 py-4">
                  <p className="text-muted text-[0.88rem] mb-3 max-w-[920px]">
                    Floor designation is reversible. Exit requires evidence-of-care behavior at the dimension level, applied consistently across at least two consecutive assessment cycles. Examples that would register at sub-anchor levels above the floor:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted mb-4">
                    <li>Independent investigation with published findings and remediation plan.</li>
                    <li>Structural reform: leadership change paired with policy commitment, accountability action, or independent oversight.</li>
                    <li>Substantive engagement with treaty-body or court findings (compliance, not denial).</li>
                    <li>Verifiable change in behavior recorded by independent observers (ICRC, UN OCHA, IPC, named investigative outlets).</li>
                  </ul>
                  <p className="text-muted text-[0.88rem] max-w-[920px]">
                    Performative statements, press releases, and unverifiable commitments do not register. The bar is documented behavioral change, evidenced by sources outside the entity&rsquo;s control.
                  </p>
                </div>
              </details>

              {/* Approval and audit — always visible */}
              <h3 className="text-[1.08rem] font-bold mb-3 mt-5">Approval and audit</h3>
              <p className="text-muted max-w-[920px]">
                Floor designation requires the same human-approval gate as any other score change. The proposal, the corroborating evidence, the rationale, and the approval decision are retained in the audit log. Any future change to the designation &mdash; including exit &mdash; is logged with the same chain of evidence.
              </p>
            </Panel>
          </Container>
        </section>

        {/* Lead assessor review flags */}
        <section id="review-flags" className="py-[30px] scroll-mt-24">
          <Container>
            <SectionHead
              title="Lead assessor review flags"
              description="Certain patterns automatically trigger deeper review before a score is finalized."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: "Active harm", desc: "Any subdimension scored 0 requires written documentation and lead assessor co-sign." },
                {
                  title: "Rater discrepancy",
                  desc: "Inter-rater reliability (IRR) discrepancy greater than 1.5 on any subdimension triggers review.",
                },
                { title: "Unsupported high scores", desc: "A score of 4 or 5 without pressure-test evidence is flagged provisional." },
                { title: "Leadership-community gap", desc: "Significant differences between leadership narrative and community testimony must be resolved." },
                { title: "Missing documents", desc: "Refusal to provide requested documentation is itself a score-relevant event." },
                { title: "Open discussion flags", desc: "Any unresolved discussion note blocks finalization until reviewed." },
              ].map((item) => (
                <Card key={item.title}>
                  <h3 className="text-[1.08rem] font-bold mb-2">{item.title}</h3>
                  <p className="text-muted">{item.desc}</p>
                </Card>
              ))}
            </div>
          </Container>
        </section>

        {/* #10 — Full 40-subdimension framework: grouped by dimension with <details> */}
        <section id="subdimension-framework" className="py-[30px] scroll-mt-24">
          <Container>
            <SectionHead
              title="Full 40-subdimension framework"
              description="Each dimension contains five scored subdimensions. Together they define the operational content of the standard. Each group is collapsible — open any dimension to see all five subdimensions and their behavioral anchors."
            />
            {/* #10 — mobile scroll hint */}
            <p className="text-muted text-[0.8rem] mt-1 mb-3 lg:hidden">Scroll horizontally inside each group to see all columns</p>

            <div className="space-y-2">
              {DIMENSIONS.map((dim) => {
                const rows = SUBDIM_ROWS.filter((r) => r.dimCode === dim.code);
                return (
                  // #20 — anchor id for dimension card cross-links
                  <details
                    key={dim.code}
                    id={`subdim-group-${dim.code}`}
                    className="group rounded-[14px] border border-line bg-[rgba(255,255,255,0.02)] overflow-hidden scroll-mt-24"
                  >
                    <summary
                      className={[
                        "flex items-center gap-3 px-4 py-3.5",
                        "cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden",
                        "hover:bg-[rgba(255,255,255,0.03)] transition-colors",
                      ].join(" ")}
                    >
                      {/* Dimension color swatch */}
                      <span
                        className="inline-block w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: dim.color }}
                        aria-hidden="true"
                      />
                      <span className="font-bold text-text" style={{ color: dim.color }}>{dim.name}</span>
                      <span className="text-muted text-[0.82rem] ml-1">({dim.code})</span>
                      <span className="text-muted text-[0.82rem] ml-auto mr-3 hidden sm:block">{dim.desc}</span>
                      <svg
                        width="13" height="13" viewBox="0 0 13 13" fill="none"
                        aria-hidden="true"
                        className="transition-transform group-open:rotate-90 shrink-0 motion-reduce:transition-none ml-auto sm:ml-0"
                      >
                        <path d="M4.5 2.5l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </summary>
                    <div className="border-t overflow-auto" style={{ borderColor: `${dim.color}30` }}>
                      <table className="w-full border-collapse text-[0.86rem]">
                        <caption className="sr-only">{dim.name} subdimensions: ID, name, core assessment question, and behavioral anchors</caption>
                        <thead>
                          <tr>
                            <th scope="col" className="text-muted text-left py-2.5 px-3 border-b border-line font-semibold text-[0.82rem] w-12">ID</th>
                            <th scope="col" className="text-muted text-left py-2.5 px-3 border-b border-line font-semibold text-[0.82rem] w-40">Subdimension</th>
                            <th scope="col" className="text-muted text-left py-2.5 px-3 border-b border-line font-semibold text-[0.82rem]">Core assessment question</th>
                            <th scope="col" className="text-muted text-left py-2.5 px-3 border-b border-line font-semibold text-[0.82rem] w-60">Anchors (0 · 1 · 2 · 3 · 4 = Exemplary)</th>
                          </tr>
                        </thead>
                        <tbody className="text-muted">
                          {rows.map((row) => (
                            <tr key={row.id}>
                              <td className="py-2.5 px-3 border-b border-line font-bold text-text">{row.id}</td>
                              <td className="py-2.5 px-3 border-b border-line text-text">{row.subdim}</td>
                              <td className="py-2.5 px-3 border-b border-line">{row.question}</td>
                              <td className="py-2.5 px-3 border-b border-line text-[0.78rem]">
                                {row.anchors.map((anchor, ai) => (
                                  <span key={ai} className="block py-0.5">
                                    <span className="text-text font-semibold mr-1">{ai + 1}.</span>
                                    {anchor}
                                  </span>
                                ))}
                              </td>
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

        {/* What assessors are looking for */}
        <section id="assessors-in-practice" className="py-[30px] scroll-mt-24">
          <Container>
            <SectionHead
              title="What assessors are looking for in practice"
              description="The Human Assessment Battery turns abstract values into observable behaviors, evidence requests, and comparison points across populations and power levels."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: "Awareness examples", desc: "Soft-signal reporting, proactive outreach, silent-population detection, pre-launch harm assessment." },
                { title: "Empathy examples", desc: "Community testimony, direct-service observation, validation before procedure, leadership veto power for affected groups." },
                { title: "Action examples", desc: "Response-time data, proportional help, independent outcome studies, follow-through protocols." },
                { title: "Equity examples", desc: "Coverage gaps, disaggregated outcomes, bias audits, barrier-removal evidence, historical harm response." },
                { title: "Boundaries examples", desc: "Burnout prevention, autonomy measurement, scope clarity, dignified refusal, informed consent withdrawal." },
                { title: "Accountability examples", desc: "Public acknowledgment of harm, change after failure, transparency about poor outcomes, co-designed repair." },
                { title: "Systemic examples", desc: "Root-cause work, long-range planning, adjacent-system analysis, structural critique, coalition-building." },
                { title: "Integrity examples", desc: "Costly moral choices, invisible compassionate practices, staff treatment, values-based decisions, continuity through stress." },
              ].map((item) => (
                <Card key={item.title}>
                  <h3 className="text-[1.08rem] font-bold mb-2">{item.title}</h3>
                  <p className="text-muted">{item.desc}</p>
                </Card>
              ))}
            </div>
          </Container>
        </section>

        {/* Cross-sector adaptation + Methodology intent */}
        <section id="cross-sector" className="py-[30px] scroll-mt-24">
          <Container className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Panel>
              <h3 className="text-[1.08rem] font-bold mb-2.5">Cross-sector adaptation</h3>
              <p className="text-muted mb-3">
                The same framework can be adapted across governments, corporations, NGOs, religious institutions, AI labs, technology systems, products, and teams. The human battery is especially important when community interviews, leadership interviews, and observation are necessary to understand whether compassionate behavior actually exists in practice.
              </p>
              <p className="text-muted text-[0.92rem]">
                In the broader Applied Compassion Benchmark (ACB) architecture, AI systems may also be evaluated with the AI Prompt Battery while organizations behind those systems are evaluated using the Human Assessment Battery.
              </p>
            </Panel>
            <Panel>
              <h3 className="text-[1.08rem] font-bold mb-2.5">Methodology intent</h3>
              <p className="text-muted mb-3">
                The benchmark is designed to be interpretable, reproducible, and contestable. It is meant to reward genuine compassionate capacity, expose performative signaling, and create a shared language for institutional behavior that can be compared over time and across sectors.
              </p>
              <p className="text-muted text-[0.92rem]">
                The final submission test is simple: could the assessor defend the score in front of both leadership and the affected community in the same room?
              </p>
            </Panel>
          </Container>
        </section>

        {/* Independence policy */}
        <section id="independence-policy" className="py-[30px] scroll-mt-24">
          <Container>
            <SectionHead
              title="Independence policy"
              description="The commercial separation that protects benchmark integrity."
            />
            <Panel>
              <h3 className="text-[1.08rem] font-bold mb-4">Entities never pay for inclusion, score changes, or suppression of findings.</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
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
                    label: "Commercial services are observation products",
                    explanation: "Score-Watch, Purchase Research, Data License, and Advisory are observation and interpretation products. Subscribers pay for notification, data access, or guidance — they do not influence what is scored or how.",
                  },
                  {
                    label: "Findings are not embargoed for subscribers",
                    explanation: "Every confirmed score change is published to /updates and the public index pages at the same time all subscribers receive their alerts. Paying subscribers do not receive scoring information ahead of the public record.",
                  },
                  {
                    label: "Conflicts are declared",
                    explanation: "If an editorial or advisory relationship exists with a benchmarked entity, it is disclosed on that entity's page.",
                  },
                ].map((item) => (
                  <div key={item.label} className="grid grid-cols-[1fr_2fr] gap-4 py-3 border-b border-line last:border-b-0 lg:col-span-2">
                    <span className="font-bold text-text">{item.label}</span>
                    <span className="text-muted">{item.explanation}</span>
                  </div>
                ))}
              </div>
              <p className="text-muted text-[0.92rem] mt-4 pt-4 border-t border-line">
                This separation is the load-bearing trust commitment of the benchmark. If it ever appears compromised, the benchmark loses its value regardless of any other quality signal.
              </p>
            </Panel>
          </Container>
        </section>

        {/* Methodology version and change log */}
        <section id="changelog" className="py-[30px] scroll-mt-24">
          <Container>
            <SectionHead
              title="Methodology version and change log"
              description="Methodology changes are versioned, dated, and publicly described. Historical changes do not retroactively rewrite prior assessments."
            />
            <Panel>
              <div className="space-y-6">
                <div>
                  <div className="grid grid-cols-[160px_1fr] gap-4 items-start">
                    <span className="font-bold text-text pt-0.5">Version 1.1 — 2026-04-20</span>
                    <ul className="list-disc pl-[18px] text-muted space-y-2">
                      <li>Integration premium capped at +10 points (down from +20). Rationale: entities with uniform-high dimension profiles were computing to perfect 100 regardless of evidence quality. The cap ensures the premium rewards consistency without overriding evidence ceilings.</li>
                      <li>Composite score determinism enforced. Every composite must now compute deterministically from its dimension scores via the published formula. A data-layer validator rejects drift above 2.0 points.</li>
                      <li>Floor-clamping artifacts corrected. Entities previously displayed at composite 0.0 (a legacy display-layer artifact) now show their formula-computed composites — typically 4 to 7 points reflecting the actual dimension scores.</li>
                    </ul>
                  </div>
                </div>
                <div className="border-t border-line pt-6">
                  <div className="grid grid-cols-[160px_1fr] gap-4 items-start">
                    <span className="font-bold text-text pt-0.5">Version 1.0 — Initial release</span>
                    <ul className="list-disc pl-[18px] text-muted space-y-2">
                      <li>8-dimension, 40-subdimension framework.</li>
                      <li>7-session human assessment protocol.</li>
                      <li>5-tier evidence hierarchy.</li>
                      <li>Integration premium up to +20 (superseded by v1.1).</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-6 pt-4 border-t border-line">
                <Button href="/updates" variant="primary">See every approved score change</Button>
                <a
                  href="https://github.com/Klingdom/applied-compassion-benchmark/blob/main/CHANGELOG.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted hover:text-text"
                >
                  View full changelog on GitHub
                </a>
              </div>
            </Panel>
          </Container>
        </section>

        {/* Assessment instrument — document control */}
        <section className="py-[20px]">
          <Container>
            <details className="group rounded-[14px] border border-line bg-[rgba(255,255,255,0.02)] overflow-hidden">
              <summary
                className={[
                  "flex items-center gap-2 px-5 py-3.5",
                  "cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden",
                  "text-[0.82rem] font-semibold text-muted hover:text-text transition-colors",
                ].join(" ")}
              >
                <svg
                  width="13" height="13" viewBox="0 0 13 13" fill="none"
                  aria-hidden="true"
                  className="transition-transform group-open:rotate-90 shrink-0 motion-reduce:transition-none"
                >
                  <path d="M4.5 2.5l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Assessment instrument — document control
              </summary>
              <div className="border-t border-line px-5 py-4">
                <p className="text-[0.82rem] text-muted mb-3">
                  For assessors and institutional clients. The public scoring methodology above is fully open; these references identify the controlled field instruments used in certified assessments.
                </p>
                <p className="text-muted text-[0.88rem] mb-3">
                  ACB-HAB-001 is the human-administered field guide for corporations, governments, religious institutions, and AI development organizations. It uses structured interviews, document review, observation, and community testimony rather than self-report alone.
                </p>
                <table className="w-full border-collapse text-[0.86rem]">
                  <tbody className="text-muted">
                    {[
                      ["Document ID", "ACB-HAB-001"],
                      ["Version", "1.0 — Initial Release"],
                      ["Companions", "ACB-PAB-001 and ACB-STD-001"],
                      ["Administered by", "Credentialed ACB assessors"],
                      ["Typical duration", "4–6 hours per entity across 2–3 sessions"],
                      ["Sensitivity", "Restricted assessor-use instrument"],
                    ].map(([label, value]) => (
                      <tr key={label}>
                        <th className="text-muted text-[0.82rem] font-semibold text-left py-2 px-2.5 border-b border-line">{label}</th>
                        <td className="py-2 px-2.5 border-b border-line">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </Container>
        </section>

        {/* #17 — Footer nav funnel: Indexes dominant, Assess secondary, commercial quiet */}
        <section className="py-[30px]">
          <Container>
            {/* Primary CTA */}
            <div className="mb-4 rounded-[18px] border border-[rgba(125,211,252,0.2)] bg-gradient-to-b from-[rgba(125,211,252,0.06)] to-transparent p-6">
              <h3 className="text-[1.15rem] font-bold mb-2">See the framework applied</h3>
              <p className="text-muted mb-4 max-w-[600px]">
                The methodology above is active across {SCORED_ENTITY_COUNT_FORMATTED} benchmarked entities. Explore which governments, corporations, AI labs, and cities score highest — and why.
              </p>
              <Button href="/indexes" variant="primary">Explore the Indexes</Button>
            </div>

            {/* Secondary CTA */}
            <div className="mb-4 rounded-[16px] border border-line bg-[rgba(255,255,255,0.02)] p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <h3 className="text-[1.05rem] font-bold mb-1">Assess your organization</h3>
                <p className="text-muted text-[0.92rem]">
                  Use the framework as an entry point into guided review, advisory, or formal structured assessment.
                </p>
              </div>
              <Button href="/assess-your-organization" variant="default">Start a self-assessment</Button>
            </div>

            {/* Commercial links — quiet, independence-framed */}
            <p className="text-muted text-[0.82rem] pt-2 border-t border-line">
              For institutional use of the benchmark data:{" "}
              <a href="/purchase-research" className="text-muted hover:text-text underline decoration-muted">Purchase Research</a>
              {" · "}
              <a href="/data-licenses" className="text-muted hover:text-text underline decoration-muted">Data License</a>
              {" · "}
              <a href="/advisory" className="text-muted hover:text-text underline decoration-muted">Advisory</a>
              {" · "}
              <a href="/contact-sales" className="text-muted hover:text-text underline decoration-muted">Contact Sales</a>
              {" — "}
              <span className="text-[rgba(148,163,184,0.5)]">commercial relationships do not influence scoring.</span>
            </p>
          </Container>
        </section>

        {/* #20 — floating back-to-top (shown after deep scroll via CSS) */}
        <a
          href="#main-content"
          aria-label="Back to top"
          className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-9 h-9 rounded-full border border-line bg-[rgba(11,18,32,0.85)] backdrop-blur-sm text-muted hover:text-text hover:border-[rgba(125,211,252,0.4)] transition-colors shadow-lg"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M7 11V3M3.5 6.5L7 3l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </main>
    </>
  );
}
