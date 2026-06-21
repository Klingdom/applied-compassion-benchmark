import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import Stat from "@/components/ui/Stat";
import DefinedTerm from "@/components/ui/DefinedTerm";
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
import BackToTop from "@/components/methodology/BackToTop";

export const metadata: Metadata = { title: "Methodology", description: "Understand the 8-dimension, 40-subdimension scoring framework, evidence hierarchy, and adversarial pressure-test model behind the benchmark." };

// Derived 40-row table from canonical DIMENSIONS data (Item 2)
const SUBDIM_ROWS = DIMENSIONS.flatMap((d) =>
  d.subdims.map((sd) => ({ dim: d.name, dimCode: d.code, dimColor: d.color, id: sd.code, subdim: sd.name, question: sd.desc, anchors: sd.anchors }))
);

// Abridge worked-example numbers, indexed to DIMENSIONS order.
// Order is driven by DIMENSIONS; only the per-entity numeric values live here.
const ABRIDGE_DIM_DATA: { avg: number; dim: number; anchor: string }[] = [
  { avg: 3.5, dim: 7.0, anchor: "Developing → Established" }, // AWR
  { avg: 3.5, dim: 7.0, anchor: "Developing → Established" }, // EMP
  { avg: 3.5, dim: 7.0, anchor: "Developing → Established" }, // ACT
  { avg: 3.0, dim: 6.0, anchor: "Developing" },               // EQU
  { avg: 3.5, dim: 7.0, anchor: "Developing → Established" }, // BND
  { avg: 3.5, dim: 7.0, anchor: "Developing → Established" }, // ACC
  { avg: 3.5, dim: 7.0, anchor: "Developing → Established" }, // SYS
  { avg: 3.5, dim: 7.0, anchor: "Developing → Established" }, // INT
];

// Assessors-in-practice example bodies, indexed to DIMENSIONS order.
// Titles are derived at render time as `${dim.name} examples`.
const ASSESSORS_IN_PRACTICE_DESCS: string[] = [
  "Soft-signal reporting, proactive outreach, silent-population detection, pre-launch harm assessment.",
  "Community testimony, direct-service observation, validation before procedure, leadership veto power for affected groups.",
  "Response-time data, proportional help, independent outcome studies, follow-through protocols.",
  "Coverage gaps, disaggregated outcomes, bias audits, barrier-removal evidence, historical harm response.",
  "Burnout prevention, autonomy measurement, scope clarity, dignified refusal, informed consent withdrawal.",
  "Public acknowledgment of harm, change after failure, transparency about poor outcomes, co-designed repair.",
  "Root-cause work, long-range planning, adjacent-system analysis, structural critique, coalition-building.",
  "Costly moral choices, invisible compassionate practices, staff treatment, values-based decisions, continuity through stress.",
];

// TOC items — benefit-phrased labels (#5)
const TOC_ITEMS = [
  { id: "framework-overview", label: "What every score guarantees" },
  { id: "pressure-test", label: "The pressure-test principle" },
  { id: "scoring-model", label: "How scores are built" },
  { id: "worked-example", label: "A real scored entity" },
  { id: "rubric-anchors", label: "Anchor scale and bands" },
  { id: "evidence-hierarchy", label: "Evidence hierarchy" },
  { id: "attribution-rule", label: "Who is scored & whose harm counts" },
  { id: "assessor-orientation", label: "The 8 dimensions" },
  { id: "assessment-protocol", label: "Assessment protocol" },
  { id: "continuous-pipeline", label: "7-session protocol" },
  { id: "nightly-pipeline", label: "Nightly pipeline" },
  { id: "approval-gate", label: "Human approval gate" },
  { id: "near-floor-limitation", label: "Near-floor limitation" },
  { id: "floor-designation", label: "Floor designation" },
  { id: "review-flags", label: "Review flags" },
  { id: "subdimension-framework", label: "Full 40-subdim table" },
  { id: "assessors-in-practice", label: "Assessors in practice" },
  { id: "cross-sector", label: "Cross-sector adaptation" },
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
                  <Stat value="v1.2" label="Methodology version" />
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

        {/* A9 — 3-minute summary collapsible, immediately below hero stats */}
        <section className="pb-2">
          <Container>
            <details className="group rounded-[14px] border border-[rgba(125,211,252,0.25)] bg-[rgba(125,211,252,0.04)] overflow-hidden">
              <summary className="flex items-center gap-2 px-5 py-3.5 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden text-[0.88rem] font-semibold text-text hover:text-[#7dd3fc] transition-colors">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true" className="transition-transform group-open:rotate-90 shrink-0 motion-reduce:transition-none">
                  <path d="M4.5 2.5l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                If you have 3 minutes — the short version
              </summary>
              <div className="border-t border-[rgba(125,211,252,0.2)] px-5 py-4">
                <p className="text-muted text-[0.88rem] mb-3">Every published score carries five guarantees. Here is what each one means in practice:</p>
                <ul className="space-y-2 text-muted text-[0.88rem]">
                  <li>
                    <span className="text-text font-bold">Evidence-grounded.</span> Every score traces to documented public evidence across a{" "}
                    <a href="#evidence-hierarchy" className="text-[#7dd3fc] hover:underline">5-tier evidence hierarchy</a>
                    {" "}— not opinion, self-report, or press releases. Adverse events and positive structural evidence are both actively searched.
                  </li>
                  <li>
                    <span className="text-text font-bold">Adversarially tested.</span> High scores only count if the compassionate behavior held under cost or pressure. See the{" "}
                    <a href="#pressure-test" className="text-[#7dd3fc] hover:underline">pressure-test principle</a>
                    .
                  </li>
                  <li>
                    <span className="text-text font-bold">Reproducible.</span> The same{" "}
                    <a href="#assessor-orientation" className="text-[#7dd3fc] hover:underline">8 dimensions and 40 subdimensions</a>
                    {" "}apply to every entity. Scores can be compared across sectors because the framework does not change by sector.
                  </li>
                  <li>
                    <span className="text-text font-bold">Independent.</span> No entity pays to be included, scored higher, or have findings withheld. The{" "}
                    <a href="#independence-policy" className="text-[#7dd3fc] hover:underline">independence policy</a>
                    {" "}is the load-bearing trust commitment.
                  </li>
                  <li>
                    <span className="text-text font-bold">Contestable.</span> Methodology version, evidence tiers, and the{" "}
                    <a href="#scoring-model" className="text-[#7dd3fc] hover:underline">scoring formula</a>
                    {" "}are all published. Any score can be checked and challenged.
                  </li>
                </ul>
              </div>
            </details>
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
                dek="40 subdimensions (0–5) → 8 dimensions (/10) → base composite 0–100 via ((avg−1)/4×100) → +premium /10 → composite /100 → band"
                path="/methodology"
              >
                <ScorePipelineDiagram />
              </ChartFrame>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Panel>
                <h3 className="text-[1.08rem] font-bold mb-2.5">Common scoring model</h3>
                <p className="text-muted mb-3">
                  Each subdimension is scored on a 0–5 anchored behavioral scale. The five subdimensions within a dimension are summed and converted into a dimension score out of 10. The eight dimension scores are averaged on the 0–5 scale and converted to a base composite via ((average − 1) ÷ 4) × 100 (a 0–100 value); an integration premium of up to 10 points is then added and the result clamped to a 0–100 maximum.
                </p>
                {/* Item 14 — inline formula line */}
                <p className="text-[0.92rem] font-mono border border-line rounded-[10px] px-3 py-2 mb-3 bg-[rgba(255,255,255,0.02)]">
                  <span className="text-[#86efac] font-bold">((avg − 1) ÷ 4) × 100</span>
                  <span className="text-muted"> = </span>
                  <span className="text-text font-bold">base composite (0–100)</span>
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
                dek="Base composite (0–100, from ((avg−1)/4×100)) + integration premium (0–10), clamped to 100. Three worked examples showing how profile shape changes the premium."
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
                    {DIMENSIONS.map((d, i) => {
                      const row = ABRIDGE_DIM_DATA[i];
                      return (
                        <tr key={d.code}>
                          <td className="py-2 px-2.5 border-b border-line">
                            <span className="font-bold text-text">{d.code}</span>
                            <span className="ml-2 text-muted">{d.name}</span>
                          </td>
                          <td className="py-2 px-2.5 border-b border-line text-right font-mono">{row.avg.toFixed(1)}</td>
                          <td className="py-2 px-2.5 border-b border-line text-right font-mono font-bold text-text">{row.dim.toFixed(1)}</td>
                          <td className="py-2 px-2.5 border-b border-line">{row.anchor}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Step 2: Base composite */}
              <h4 className="text-[0.92rem] font-bold text-muted uppercase tracking-[0.07em] mb-2">Step 2 — Base composite</h4>
              <p className="text-muted text-[0.88rem] mb-2">
                Average the 8 dimension scores on the 0–5 scale: (3.5 + 3.5 + 3.5 + 3.0 + 3.5 + 3.5 + 3.5 + 3.5) ÷ 8 = 3.44. Base composite = ((3.44 − 1) ÷ 4) × 100 = <strong className="text-text">60.9</strong>.
              </p>

              {/* Step 3: Integration premium — A7 */}
              <h4 className="text-[0.92rem] font-bold text-muted uppercase tracking-[0.07em] mb-2 mt-3">Step 3 — Integration premium</h4>
              <p className="text-muted text-[0.88rem] mb-2">
                The formula is: <strong className="text-text font-mono">premium = 10 &times; consistencyFactor &times; balanceFactor</strong> (with any single dimension at exactly 0 zeroing the premium entirely).
              </p>
              <div className="rounded-[10px] border border-line bg-[rgba(255,255,255,0.02)] px-4 py-3 mb-2 text-[0.85rem]">
                <p className="text-muted mb-1.5">
                  <strong className="text-text">Consistency factor</strong> — standard deviation across the 8 subdimension averages [3.5, 3.5, 3.5, 3.0, 3.5, 3.5, 3.5, 3.5] ≈ <strong className="text-text">0.17</strong> (σ ≤ 1.5 → factor = <strong className="text-text">1.0</strong>).
                </p>
                <p className="text-muted mb-1.5">
                  <strong className="text-text">Balance factor</strong> — counts dimensions below the 4.0 threshold (on the 0–5 scale). All 8 of Abridge&apos;s subdimension averages are below 4.0 (highest is 3.5) → <strong className="text-text">8 weak dimensions</strong> → factor = max(0, 1 − 8 × 0.2) = max(0, −0.6) = <strong className="text-text">0.0</strong>.
                </p>
                <p className="text-muted mb-1.5">
                  Formula substitution: 10 × 1.0 × 0.0 = <strong className="text-text">0.0</strong>.
                </p>
                <p className="text-[0.82rem] text-muted border-t border-line pt-2 mt-2">
                  <strong className="text-text">Teaching note:</strong> Abridge earns no integration premium because the premium rewards entities whose dimension scores clear the 4.0-of-5 bar — a threshold that signals balanced, cross-dimensional strength. All of Abridge&apos;s dimensions sit at 3.0–3.5, so the balance factor collapses to zero and the premium is 0.0. The premium is deliberately hard to earn; see the three-profile diagram above for examples of profiles that do earn a positive premium.
                </p>
              </div>

              {/* Step 4: Composite */}
              <h4 className="text-[0.92rem] font-bold text-muted uppercase tracking-[0.07em] mb-2 mt-3">Step 4 — Composite and band</h4>
              <p className="text-muted text-[0.88rem] mb-2">
                60.9 (base composite) + 0.0 (premium) = <strong className="text-text">60.9 composite</strong> (clamped to a 0–100 maximum).
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

            {/* A8 — Evidence notes: recency/decay, served population, positive-evidence search */}
            <div className="mt-6 space-y-3">
              <details className="group rounded-[12px] border border-line bg-[rgba(255,255,255,0.02)] overflow-hidden">
                <summary className="flex items-center gap-2 px-4 py-3 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden text-[0.88rem] font-semibold text-text hover:text-[#7dd3fc] transition-colors">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true" className="transition-transform group-open:rotate-90 shrink-0 motion-reduce:transition-none">
                    <path d="M4.5 2.5l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Recency and evidence decay — what the 14-day window governs
                </summary>
                <div className="border-t border-line px-4 py-4 text-muted text-[0.88rem] space-y-2">
                  <p>The <strong className="text-text">14-day window is the scan cadence</strong>, not the lifespan of the evidence base. Each nightly cycle looks for material new evidence within the most recent 14 days; that window governs what can trigger a re-assessment, not what a score rests on.</p>
                  <ul className="list-disc pl-[18px] space-y-2">
                    <li><strong className="text-text">Baseline scores draw on a multi-year evidence base.</strong> Assessments routinely cite findings from prior years as the load-bearing evidence for a dimension. Harvard&apos;s Empathy and Accountability scores rest on standing findings (an OCR Title VI/IX violation, the Comaroff harassment case) that predate the current window; because no new conduct toward students emerged, those dimensions held.</li>
                    <li><strong className="text-text">Adjudicated findings persist.</strong> A court ruling, regulatory finding, or settlement remains part of the evidence base until superseded by documented change — it does not expire on a 14-day clock.</li>
                    <li><strong className="text-text">Uncorroborated allegations decay.</strong> Evidence that is not corroborated and not adjudicated carries less weight over time and does not accumulate into a score change on its own. This is the same discipline that keeps pre-adjudication probes as evidence-tier upgrades rather than composite movements until adjudication occurs.</li>
                  </ul>
                </div>
              </details>

              <details className="group rounded-[12px] border border-line bg-[rgba(255,255,255,0.02)] overflow-hidden">
                <summary className="flex items-center gap-2 px-4 py-3 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden text-[0.88rem] font-semibold text-text hover:text-[#7dd3fc] transition-colors">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true" className="transition-transform group-open:rotate-90 shrink-0 motion-reduce:transition-none">
                    <path d="M4.5 2.5l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Served population — whose experience the evidence search is scoped to
                </summary>
                <div className="border-t border-line px-4 py-4 text-muted text-[0.88rem]">
                  <p className="mb-3">The evidence search is scoped to how the entity treats its served population (the subjects defined in the <a href="#attribution-rule" className="text-[#7dd3fc] hover:underline">attribution rule</a>):</p>
                  <table className="w-full border-collapse text-[0.85rem]">
                    <caption className="sr-only">Served population by index type</caption>
                    <thead>
                      <tr>
                        <th scope="col" className="text-muted text-left py-2 px-2.5 border-b border-line font-semibold">Index</th>
                        <th scope="col" className="text-muted text-left py-2 px-2.5 border-b border-line font-semibold">Population the evidence search covers</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["Countries", "Residents and people under the state's effective control or authority"],
                        ["Cities (US & global)", "Residents and people the city serves"],
                        ["Companies (Fortune 500)", "Workers, customers, and the communities the company operates in"],
                        ["AI labs", "Users and the broader society affected by the lab's systems"],
                        ["Robotics labs", "Users and the broader society affected by the lab's systems"],
                        ["Universities", "Students, workers (faculty and staff), and surrounding communities"],
                      ].map(([index, pop]) => (
                        <tr key={index}>
                          <td className="py-2 px-2.5 border-b border-line text-text font-semibold">{index}</td>
                          <td className="py-2 px-2.5 border-b border-line text-muted">{pop}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>

              <details className="group rounded-[12px] border border-line bg-[rgba(255,255,255,0.02)] overflow-hidden">
                <summary className="flex items-center gap-2 px-4 py-3 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden text-[0.88rem] font-semibold text-text hover:text-[#7dd3fc] transition-colors">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true" className="transition-transform group-open:rotate-90 shrink-0 motion-reduce:transition-none">
                    <path d="M4.5 2.5l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Positive-evidence search — countering the desk-research downward bias
                </summary>
                <div className="border-t border-line px-4 py-4 text-muted text-[0.88rem] space-y-2">
                  <p>Desk-based research has a built-in downward bias: adverse events (lawsuits, probes, strikes, casualties) are reported far more aggressively than the quiet existence of working structures. To counter this, assessors must <strong className="text-text">actively search for structural positive evidence</strong>, not only adverse news.</p>
                  <p>Positive evidence is structural and verifiable — published outcome data acted upon, independent audits with corrective action, durable access and equity infrastructure, worker-voice gains, and commitments held at real cost — not press releases or mission statements.</p>
                  <p>Without an active positive search, the benchmark would systematically under-score entities that are quietly competent and over-weight whoever happened to be in the news. University labor wins (graduate-worker contract gains, faculty unionization) and Harvard&apos;s choice to bear cost rather than settle a compliance demand are both examples of positive signals that require deliberate search to surface.</p>
                </div>
              </details>
            </div>
          </Container>
        </section>

        {/* A6 — Attribution & subject rule: who is scored and whose harm counts */}
        <section id="attribution-rule" className="py-[30px] scroll-mt-24">
          <Container>
            <SectionHead
              title="Who is scored & whose harm counts"
              description="Two questions must be settled before any harm event can be scored: who is the subject, and which actor does a given harm belong to. The rules below are testable and applied uniformly across indexes."
            />
            <div className="space-y-4">
              {/* Subject-per-index table */}
              <Panel>
                <h3 className="text-[1.08rem] font-bold mb-3">Scored subject by index type</h3>
                <p className="text-muted text-[0.88rem] mb-3">The subject is the population the entity is responsible for recognizing, responding to, and not depleting. Scoring asks how the entity treats <em>that</em> population.</p>
                <div className="overflow-auto">
                  <table className="w-full border-collapse text-[0.86rem]">
                    <caption className="sr-only">Scored subject by index type: the population each index is responsible for</caption>
                    <thead>
                      <tr>
                        <th scope="col" className="text-muted text-left py-2 px-2.5 border-b border-line font-semibold">Index</th>
                        <th scope="col" className="text-muted text-left py-2 px-2.5 border-b border-line font-semibold">Scored subject (the population the entity is responsible for)</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted">
                      {[
                        ["Countries", "Residents and people under the state's effective control or authority"],
                        ["Cities (US & global)", "Residents and people the city serves"],
                        ["Companies (Fortune 500)", "Workers, customers, and the communities the company operates in"],
                        ["AI labs", "Users and the broader society affected by the lab's systems"],
                        ["Robotics labs", "Users and the broader society affected by the lab's systems"],
                        ["Universities", "Students, workers (faculty and staff), and surrounding communities"],
                      ].map(([index, subject]) => (
                        <tr key={index}>
                          <td className="py-2 px-2.5 border-b border-line text-text font-semibold">{index}</td>
                          <td className="py-2 px-2.5 border-b border-line">{subject}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>

              {/* Victim / perpetrator test */}
              <Panel>
                <h3 className="text-[1.08rem] font-bold mb-3">The victim / perpetrator test</h3>
                <p className="text-muted text-[0.88rem] mb-3">For any harm event in the evidence window, decide where the harm belongs before scoring it:</p>
                <ol className="list-decimal pl-6 space-y-2 text-muted text-[0.88rem]">
                  <li><strong className="text-text">Identify the actor who caused the harm.</strong> Ask who <em>did</em> the harmful thing, not merely where the harm landed.</li>
                  <li><strong className="text-text">If the entity being scored is the actor</strong> — the harm reflects the entity&apos;s own conduct toward its subject population — the event is scored against the entity (subject to the evidence and adjudication standards).</li>
                  <li><strong className="text-text">If an external actor is the cause and the scored entity is the victim</strong> — the event is attributed to the perpetrator, not the entity, and is <em>not</em> scored as a compassion failure of the entity.</li>
                  <li><strong className="text-text">Apply the rule symmetrically.</strong> The reverse also holds: if an entity inflicts the same category of harm on its own people by its own choice (rather than having it imposed from outside), that conduct is scored against the entity.</li>
                </ol>
                <p className="text-muted text-[0.88rem] mt-3 border-l-2 border-[rgba(125,211,252,0.3)] pl-3">
                  In the 2026-06-20 cycle this rule was applied at index scale: the entire June 2026 federal campaign against US universities (DOJ funding suits, grant freezes, admissions compliance reviews) was treated as external action inflicted <em>on</em> the universities and attributed to the federal government — so none of it lowered a university&apos;s score. The same convention attributes strikes on Ukraine to Russia, leaving Ukraine&apos;s own conduct profile unchanged.
                </p>
              </Panel>

              {/* Harvard dual-role worked example */}
              <details className="group rounded-[12px] border border-line bg-[rgba(255,255,255,0.02)] overflow-hidden">
                <summary className="flex items-center gap-2 px-4 py-3 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden text-[0.9rem] font-semibold text-text hover:text-[#7dd3fc] transition-colors">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true" className="transition-transform group-open:rotate-90 shrink-0 motion-reduce:transition-none">
                    <path d="M4.5 2.5l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Worked example — the dual-role case (Harvard, 2026-06-20)
                </summary>
                <div className="border-t border-line px-4 py-4 text-muted text-[0.88rem] space-y-3">
                  <p>Harvard in June 2026 was simultaneously a victim of external action and an actor in its own right. The two roles are scored differently:</p>
                  <div className="rounded-[8px] border border-[rgba(248,113,113,0.25)] bg-[rgba(248,113,113,0.04)] px-3 py-2.5">
                    <p className="text-[0.82rem] font-bold text-text mb-1">External action — NOT scored against Harvard</p>
                    <p>The DOJ lawsuit to recoup grants and bar future federal access, and the funding freeze, are harm <em>inflicted on</em> Harvard by the federal government. A federal court had already ruled the funding cut unlawful; Harvard is the contesting party, not the wrongdoer. Under the victim/perpetrator test, the harm is attributed to the perpetrator (the federal government) and does not register as a Harvard compassion failure.</p>
                  </div>
                  <div className="rounded-[8px] border border-[rgba(125,211,252,0.2)] bg-[rgba(125,211,252,0.04)] px-3 py-2.5">
                    <p className="text-[0.82rem] font-bold text-text mb-1">Harvard&apos;s own conduct — scored</p>
                    <p>The continued layoffs, salary freeze, hiring moratorium, and Broad Institute staff cuts fall on Harvard&apos;s own workers by Harvard&apos;s own decisions. These are genuine internal-consistency (I3) and self-sustainability (B1) signals and stay in the assessment. In this case they were consistent with — and did not push below — Harvard&apos;s already-conservative published Integrity (2.5) and Accountability (2.75) scores, so the composite held at 52.3. Harvard&apos;s choice to bear significant cost rather than capitulate to a settlement demand was also noted as a modest consistency-under-pressure (I1) positive.</p>
                  </div>
                  <p className="text-[0.82rem] text-muted border-t border-line pt-2">The takeaway: the same news cluster splits cleanly into &ldquo;done to the entity&rdquo; (not scored) and &ldquo;done by the entity&rdquo; (scored).</p>
                </div>
              </details>
            </div>
          </Container>
        </section>

        {/* The 8 dimensions (dimension cards + radar) */}
        <section id="assessor-orientation" className="py-[30px] scroll-mt-24">
          <Container>
            <SectionHead
              title="The 8 dimensions"
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
        <section id="nightly-pipeline" className="py-[30px] scroll-mt-24">
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

        {/* A6 — Near-floor limitation: immediately before floor-designation */}
        <section id="near-floor-limitation" className="py-[30px] scroll-mt-24">
          <Container>
            <SectionHead
              title="Near-floor limitation"
              description="When an entity is already at or very close to the bottom of the Critical band, additional adverse pre-adjudication evidence is handled differently."
            />
            <Panel>
              <p className="text-muted mb-4 max-w-[920px]">
                An entity that is already scored at or very close to the bottom of the Critical band has almost no scorable distance left to fall short of a formal floor designation. When that is the case, additional adverse evidence that has <strong className="text-text">not yet been adjudicated</strong> (an ongoing probe, an investigatory finding, a single filed charge) is handled as an <strong className="text-text">evidence-tier upgrade recorded against the relevant dimensions — without moving the composite</strong>.
              </p>
              <p className="text-muted mb-4 max-w-[920px]">
                This is an editorial/data-level practice, not a formula output. The formula does not &ldquo;know&rdquo; that an entity is near the floor; assessors recognize the condition and choose to log the strengthened evidence rather than manufacture a composite change there is no scorable room for. The change still passes through the same human-approval gate as any other assessment decision, and the dimensions remain reconstructible to the published composite (diff 0.0).
              </p>

              {/* UHG worked example */}
              <details className="group mb-3 rounded-[10px] border border-line bg-[rgba(255,255,255,0.01)] overflow-hidden">
                <summary className="flex items-center gap-2 px-4 py-3 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden text-[0.9rem] font-semibold text-text hover:text-[#7dd3fc] transition-colors">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true" className="transition-transform group-open:rotate-90 shrink-0 motion-reduce:transition-none">
                    <path d="M4.5 2.5l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Worked example — UnitedHealth Group (10.2, Critical), 2026-06-20
                </summary>
                <div className="border-t border-line px-4 py-4 text-muted text-[0.88rem] space-y-2">
                  <p>On 2026-06-20, UnitedHealth Group&apos;s DOJ criminal probe expanded from Medicare Advantage billing to also cover Optum Rx and physician reimbursement, and a separate Senate (Grassley) investigation found the company had &ldquo;aggressively&rdquo; gamed Medicare Advantage risk scores. This is substantial, specific, and corroborating evidence. But:</p>
                  <ul className="list-disc pl-[18px] space-y-1.5">
                    <li>UHG was already at near-floor Critical (composite 10.2), with Accountability scaled at 3.1 and several dimensions near the dimensional floor — minimal scorable headroom remained.</li>
                    <li>The new material was <strong className="text-text">pre-adjudication</strong>: no charge, no settlement, no court ruling in the window. The probe is ongoing and UHG denies wrongdoing.</li>
                  </ul>
                  <p><strong className="text-text">Outcome:</strong> the evidence reinforced the existing Critical score and upgraded the evidence tier behind Accountability, Integrity, and Systemic Thinking (toward Tier 4–5, federal/Senate sourcing), but produced no composite delta and no band change. The standing re-flag is explicit: revisit toward a stronger designation only on an adjudicated criminal charge, indictment, or settlement admitting misconduct.</p>
                </div>
              </details>

              {/* Open methodological question */}
              <Callout>
                <p className="text-accent text-[0.86rem] font-bold uppercase tracking-[0.08em] mb-2">Open methodological question — under review for a future version</p>
                <p className="text-muted max-w-[920px]">
                  The UHG case surfaces a question the research itself raises and does not answer: <strong className="text-text">at what point does the sheer density of pre-adjudication evidence — here, three simultaneous probe areas plus a Senate finding — justify a floor-designation move on its own, absent any formal charge?</strong>
                </p>
                <p className="text-muted max-w-[920px] mt-2 text-[0.92rem]">
                  The current rule is unambiguous: adjudication is the trigger, and pre-adjudication evidence is absorbed as a tier upgrade. Whether &ldquo;scope of documented probe&rdquo; should become a distinct pathway to designation is under review for a future version. No such pathway exists today.
                </p>
              </Callout>
            </Panel>
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

              {/* A6 / A11 — Two kinds of scores: formula vs editorial */}
              <div className="mb-5 rounded-[12px] border border-line bg-[rgba(255,255,255,0.02)] overflow-hidden">
                <div className="px-4 py-3 border-b border-line">
                  <h3 className="text-[0.9rem] font-bold text-text">Two kinds of composite 0.0</h3>
                  <p className="text-muted text-[0.82rem] mt-0.5">There are two distinct ways an entity ends up at composite 0.0. The methodology does not blur them.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-line text-[0.85rem]">
                  <div className="px-4 py-3">
                    <p className="font-bold text-text mb-1.5">Formula output (natural floor)</p>
                    <p className="text-muted mb-2">The base composite is <span className="font-mono">((average of 8 dimension scores − 1) / 4) × 100</span>. When every dimension sits at the lowest behavioral anchor (1.0/5), the result is exactly 0. The final value is also clamped to 0–100, so it cannot go negative.</p>
                    <p className="text-muted text-[0.82rem]">The harm flag (any single dimension at exactly 0) removes the integration premium — it does not by itself force the composite to 0. In practice, a true zero in even one dimension places the composite at or extremely near 0.</p>
                  </div>
                  <div className="px-4 py-3">
                    <p className="font-bold text-text mb-1.5">Editorial designation (assessor decision)</p>
                    <p className="text-muted mb-2">Floor designation is an <strong>editorial/data-level decision</strong> — an assessor sets all dimensions to the floor anchor, making the formula then compute 0.0, and attaches a public disclosure. The number displayed is still a formula output; what is editorial is the decision to place the dimensions at the floor and to attach the disclosure.</p>
                    <p className="text-muted text-[0.82rem]">This decision goes through the standard human-approval gate and is retained in the audit log. It is the appropriate response when evidence clearly shows no functional compassion at any dimension, but sub-anchor variance (1.1, 1.2) would otherwise keep the composite slightly above zero.</p>
                  </div>
                </div>
              </div>

              {/* A6 — real examples: Israel and Sudan */}
              <details className="group mb-3 rounded-[10px] border border-line bg-[rgba(255,255,255,0.01)] overflow-hidden">
                <summary className="flex items-center gap-2 px-4 py-3 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden text-[0.9rem] font-semibold text-text hover:text-[#7dd3fc] transition-colors">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true" className="transition-transform group-open:rotate-90 shrink-0 motion-reduce:transition-none">
                    <path d="M4.5 2.5l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Real examples — how the floor absorbs new evidence (Israel & Sudan, 2026-06-20)
                </summary>
                <div className="border-t border-line px-4 py-4 text-muted text-[0.88rem] space-y-3">
                  <div>
                    <p className="font-bold text-text mb-1">Israel (0.0)</p>
                    <p>Held at the absolute harm-flag floor on 2026-06-20, with multi-source corroboration of an active, structural harm pattern (IDF operations across the majority of Gaza, UNRWA blocked from direct aid since March 2025, large displaced populations, documented West Bank fatalities). New evidence in the window is absorbed by the floor — there is no composite movement available.</p>
                  </div>
                  <div>
                    <p className="font-bold text-text mb-1">Sudan (0.0)</p>
                    <p>Reinforced at the floor on 2026-06-20 (an RSF drone strike killing 13 civilians in al-Obeid on June 19; a 29-nation UNHRC warning of an imminent assault on roughly 500,000 residents). As the digest puts it, &ldquo;the floor absorbs&rdquo; the new evidence: monitoring continues for the humanitarian system and for pattern documentation, but the composite cannot fall further.</p>
                  </div>
                </div>
              </details>

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
                      <DefinedTerm term={dim.code.toLowerCase()}>
                        <span className="font-bold text-text" style={{ color: dim.color }}>{dim.name}</span>
                      </DefinedTerm>
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
                            <th scope="col" className="text-muted text-left py-2.5 px-3 border-b border-line font-semibold text-[0.82rem] w-60">Anchors (1–5, where 5 = Exemplary)</th>
                          </tr>
                        </thead>
                        <tbody className="text-muted">
                          {rows.map((row) => (
                            <tr key={row.id}>
                              <td className="py-2.5 px-3 border-b border-line font-bold text-text">{row.id}</td>
                              <td className="py-2.5 px-3 border-b border-line text-text">
                                <DefinedTerm term={row.id.toLowerCase()}>{row.subdim}</DefinedTerm>
                              </td>
                              <td className="py-2.5 px-3 border-b border-line">{row.question}</td>
                              <td className="py-2.5 px-3 border-b border-line text-[0.78rem]">
                                {row.anchors.map((anchor, ai) => (
                                  <span key={`${row.id}-${ai}`} className="block py-0.5">
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
              {DIMENSIONS.map((dim, i) => (
                <Card key={dim.code}>
                  <h3 className="text-[1.08rem] font-bold mb-2">{dim.name} examples</h3>
                  <p className="text-muted">{ASSESSORS_IN_PRACTICE_DESCS[i]}</p>
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

        {/* A10 — NewsletterSignup moved here: after independence-policy, before changelog */}
        <section className="py-[30px]">
          <Container>
            <div className="max-w-[680px] mx-auto">
              <NewsletterSignup
                variant="card"
                source="methodology"
                preamble="Watch the methodology in motion — every score change runs the human approval gate described above. The weekly briefing surfaces which entities moved and why. Free and editorial. Commercial products are separate and do not affect scoring."
              />
            </div>
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
                {/* A3 — v1.2 changelog entry */}
                <div id="changelog-v1-2">
                  <div className="grid grid-cols-[160px_1fr] gap-4 items-start">
                    <span className="font-bold text-text pt-0.5">Version 1.2 — 2026-06</span>
                    <ul className="list-disc pl-[18px] text-muted space-y-2">
                      <li>
                        <strong className="text-text">Integration premium refined from a flat bonus to a consistency-and-balance product.</strong> The premium (still capped at +10) is now computed as{" "}
                        <span className="font-mono text-[0.88rem]">10 &times; consistencyFactor &times; balanceFactor</span>
                        . The consistency factor steps down as dimension scores spread apart (standard deviation across the eight dimensions: ≤1.5 → 1.0; ≤3.0 → 0.75; ≤5.0 → 0.4; above → 0.1). The balance factor steps down by 0.2 for each dimension scoring below 4.0 (the exemplary threshold), to a floor of 0. Effect: a balanced 70/70-style profile can now out-earn a spiky 90/40 profile. This rewards even, sustained performance across all eight dimensions rather than a few standout scores.
                      </li>
                      <li>
                        <strong className="text-text">Harm flag preserved and unchanged.</strong> Any single dimension resolving at exactly 0 sets the integration premium to 0 — active documented harm cancels the consistency reward outright.
                      </li>
                      <li>
                        <strong className="text-text">One canonical formula, two enforced mirrors.</strong> The composite math now lives in a single shared core (<span className="font-mono text-[0.88rem]">compositeCore</span>) consumed by both the site runtime and the pipeline scripts, with a determinism test suite acting as the drift gate. This makes every published composite reconstructible from its eight dimension scores.
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="border-t border-line pt-6">
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

        {/* A11 — "If you remember one thing" closer */}
        <section className="py-[20px]">
          <Container>
            <div className="max-w-[760px] mx-auto text-center border border-[rgba(125,211,252,0.18)] rounded-[16px] px-6 py-5 bg-[rgba(125,211,252,0.04)]">
              <p className="text-[1.05rem] font-bold text-text mb-1">If you remember one thing</p>
              <p className="text-muted text-[0.95rem]">
                A score is <strong className="text-text">documented compassion that survived a real cost</strong>. Every point requires evidence. High scores can only be earned when performance held under pressure. Zero is assigned — and disclosed — when a documented harm pattern leaves no other honest conclusion.
              </p>
            </div>
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

        {/* A4 — floating back-to-top, appears only after scrolling past one viewport */}
        <BackToTop />
      </main>
    </>
  );
}
