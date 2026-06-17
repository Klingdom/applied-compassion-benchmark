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
import DimensionRadar from "@/components/charts/DimensionRadar";
import AnchorLadder from "@/components/charts/AnchorLadder";
import BandScaleStrip from "@/components/charts/BandScaleStrip";
import IntegrationPremiumDiagram from "@/components/charts/IntegrationPremiumDiagram";
import ChartFrame from "@/components/charts/ChartFrame";

export const metadata: Metadata = { title: "Methodology", description: "Understand the 8-dimension, 40-subdimension scoring framework, evidence hierarchy, and adversarial pressure-test model behind the benchmark." };

// Derived 40-row table from canonical DIMENSIONS data (Item 2)
const SUBDIM_ROWS = DIMENSIONS.flatMap((d) =>
  d.subdims.map((sd) => ({ dim: d.name, id: sd.code, subdim: sd.name, question: sd.desc }))
);

export default function MethodologyPage() {
  return (
    <>
      {/* #6 SEO/AEO: DefinedTermSet JSON-LD — teaches engines the 8 dimensions
          and 5 score bands as our citable vocabulary (AWR/Awareness/…). */}
      <DefinedTermSetJsonLd />

      <main id="main-content">
        {/* Hero */}
        <section id="framework-overview" className="pt-[72px] pb-10 scroll-mt-24">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-[18px] items-start">
              <div>
                <Eyebrow>Methodology &amp; Framework</Eyebrow>
                <h1 className="text-[clamp(2.2rem,5vw,4rem)] leading-[1.04] tracking-[-0.03em] mb-3.5">
                  How the Compassion Benchmark works
                </h1>
                {/* Item 3 — rewritten hero paragraph */}
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
                {/* Item 1 — promoted from h3 to h2 */}
                <h2 className="text-[1.08rem] font-bold mb-2.5">What every published score guarantees</h2>
                <ul className="space-y-2 text-muted mb-3">
                  <li>
                    <span className="text-text font-bold">Evidence-grounded</span> — every score traces to documented public evidence across a 5-tier hierarchy, not opinion or self-report.
                  </li>
                  <li>
                    <span className="text-text font-bold">Adversarially tested</span> — performance only counts when it held up under cost or pressure (the pressure-test principle).
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

        {/* Pressure-test principle */}
        <section id="pressure-test" className="py-[30px] scroll-mt-24">
          <Container>
            <Callout>
              <p className="text-accent text-[0.86rem] font-bold uppercase tracking-[0.08em] mb-2">Core methodological principle</p>
              <h2 className="text-[clamp(1.5rem,3vw,2rem)] mb-2">The pressure-test principle</h2>
              <p className="text-muted max-w-[920px] mb-3">
                Every dimension is assessed under adversarial conditions. For each subdimension, assessors look for at least one documented case where compassionate behavior was costly, legally risky, or institutionally inconvenient. If no such case exists, the maximum subdimension score is capped at Developing, even when the entity appears strong under favorable conditions.
              </p>
              <p className="text-muted text-[0.92rem]">
                In plain terms: high performance when it is easy is not treated as sufficient evidence of compassionate institutional character.
              </p>
            </Callout>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                {[
                  { title: "Awareness (AWR)", desc: "Whether the entity reliably detects suffering before it has to be formally named." },
                  { title: "Empathy (EMP)", desc: "Whether the entity genuinely models and honors the inner experience of affected people." },
                  { title: "Action (ACT)", desc: "Whether compassionate understanding becomes timely, effective, adequately resourced help." },
                  { title: "Equity (EQU)", desc: "Whether care is extended fairly, accessibly, and in proportion to need." },
                  { title: "Boundaries (BND)", desc: "Whether help is ethical, sustainable, consent-based, and autonomy-preserving." },
                  { title: "Accountability (ACC)", desc: "Whether the entity acknowledges harm, corrects course, learns, and repairs." },
                  { title: "Systemic Thinking (SYS)", desc: "Whether the entity addresses root causes, second-order effects, and structural conditions." },
                  { title: "Integrity (INT)", desc: "Whether compassion is genuine, consistent under pressure, and resilient over time." },
                ].map((item) => (
                  <Card key={item.title}>
                    <h3 className="text-[1.08rem] font-bold mb-2">{item.title}</h3>
                    <p className="text-muted">{item.desc}</p>
                  </Card>
                ))}
              </div>

              {/* S3.5 (M1) — 8-dimension framework radar in "framework mode" */}
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

        {/* Continuous research pipeline */}
        <section className="py-[30px]">
          <Container>
            <SectionHead
              title="Continuous research pipeline"
              description="After an initial human assessment establishes a baseline, a four-stage nightly pipeline monitors every benchmarked entity for material evidence within a 14-day recency window. Scores change only after human review."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {[
                {
                  stage: "Stage 1",
                  title: "Scanner",
                  desc: "Every night, a structured search across all 1,155 benchmarked entities surfaces compassion-relevant evidence from the last 14 days. No entity is skipped. Every entity carries a provenance record of the searches that touched it.",
                },
                {
                  stage: "Stage 2",
                  title: "Assessor",
                  desc: "Entities with material new evidence receive a full reassessment against the 8-dimension, 40-subdimension rubric. Delta is computed against the published composite.",
                },
                {
                  stage: "Stage 3",
                  title: "Digest",
                  desc: "A structured digest synthesizes the night’s findings: proposed changes, sector alerts, methodology concerns, and watch items. Nothing is applied yet.",
                },
                {
                  stage: "Stage 4",
                  title: "Founder approval",
                  desc: "Every proposed score change is reviewed and approved — or rejected — by a human before reaching production. The approval log is auditable. Evidence older than 14 days cannot drive a change.",
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
                Each entity page on the published site carries a freshness stamp — <em>Evidence reviewed YYYY-MM-DD</em> — showing either that no material change surfaced in the last 14 days (green) or that new evidence is under review (orange). The scanner touches every one of the 1,155 entities daily, not only the most active ones.
              </p>
            </Panel>
          </Container>
        </section>

        {/* Newsletter signup — primed by reading about the research pipeline */}
        <section className="py-[30px]">
          <Container>
            <div className="max-w-[680px] mx-auto">
              <NewsletterSignup
                variant="card"
                source="methodology"
                preamble="The weekly briefing is free and editorial. Commercial products are separate — they do not affect scoring."
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

        {/* Floor designation */}
        <section id="floor-designation" className="py-[30px] scroll-mt-24">
          <Container>
            <SectionHead
              title="Floor designation"
              description="When the composite resolves at zero — the methodology basis, the trigger criteria, and how an entity exits the floor."
            />
            <Panel>
              <p className="text-muted mb-4 max-w-[920px]">
                The composite formula has a natural mathematical floor: when all 8 dimensions resolve at the lowest behavioral anchor (1.0/5.0), the composite is exactly 0. Floor designation is the formal methodology disclosure attached to entities whose evidence pattern, sustained across multiple assessment cycles, satisfies that floor.
              </p>
              <p className="text-muted mb-4 max-w-[920px]">
                Without floor designation, residual sub-anchor variance (1.1, 1.2, 1.3) can keep an entity slightly above zero even when documented evidence shows no functional compassion behavior at any dimension. Floor designation resolves this by setting all dimensions to the floor anchor and attaching a public &ldquo;call out why&rdquo; disclosure on the entity page.
              </p>

              <h3 className="text-[1.08rem] font-bold mb-3 mt-6">Trigger criteria</h3>
              <p className="text-muted mb-3">All four conditions must be documented across at least three independent assessment cycles:</p>
              <ol className="list-decimal pl-6 space-y-2 text-muted mb-5">
                <li>
                  {/* Item 15 — T1/T2 gloss at first use */}
                  <strong className="text-text">Multi-source evidence</strong> &mdash; the harm pattern is corroborated by at least two T1 (Tier 1/Tier 2 evidence) sources (treaty bodies, courts of universal jurisdiction, IPC, ICRC, or equivalent) or three independent T2 sources (named investigative outlets, peer-reviewed research, official inspector reports).
                </li>
                <li>
                  <strong className="text-text">Systemic, not episodic</strong> &mdash; the pattern is structural to the entity&rsquo;s operation, not a single incident or a contained episode.
                </li>
                <li>
                  <strong className="text-text">Active during the evidence window</strong> &mdash; documented harm continues within the most recent 14-day recency window, not historical only.
                </li>
                <li>
                  <strong className="text-text">No countervailing recognition or response</strong> &mdash; the entity has not produced functional response infrastructure (independent investigation, structural reform, accountability action) sufficient to register at any sub-dimension above the floor anchor.
                </li>
              </ol>

              <h3 className="text-[1.08rem] font-bold mb-3 mt-6">What floor designation surfaces</h3>
              <p className="text-muted mb-3">Every floor-designated entity page displays a structured disclosure containing:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted mb-5">
                <li><strong className="text-text">Designated date</strong> &mdash; when the floor was formally applied.</li>
                <li><strong className="text-text">Evidence window</strong> &mdash; the 14-day window of corroborating evidence.</li>
                <li><strong className="text-text">Rationale</strong> &mdash; the methodology basis, in plain language.</li>
                <li><strong className="text-text">Primary drivers</strong> &mdash; the dimensions where harm pattern is most documented.</li>
                <li><strong className="text-text">Documented evidence pattern</strong> &mdash; bulleted summary of corroborating findings, written for transparency rather than persuasion.</li>
                <li><strong className="text-text">Methodology version</strong> &mdash; the methodology revision under which the designation was applied.</li>
              </ul>

              <h3 className="text-[1.08rem] font-bold mb-3 mt-6">How an entity exits the floor</h3>
              <p className="text-muted mb-3 max-w-[920px]">
                Floor designation is reversible. Exit requires evidence-of-care behavior at the dimension level, applied consistently across at least two consecutive assessment cycles. Examples that would register at sub-anchor levels above the floor:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted mb-5">
                <li>Independent investigation with published findings and remediation plan.</li>
                <li>Structural reform: leadership change paired with policy commitment, accountability action, or independent oversight.</li>
                <li>Substantive engagement with treaty-body or court findings (compliance, not denial).</li>
                <li>Verifiable change in behavior recorded by independent observers (ICRC, UN OCHA, IPC, named investigative outlets).</li>
              </ul>
              <p className="text-muted max-w-[920px]">
                Performative statements, press releases, and unverifiable commitments do not register. The bar is documented behavioral change, evidenced by sources outside the entity&rsquo;s control.
              </p>

              <h3 className="text-[1.08rem] font-bold mb-3 mt-6">Approval and audit</h3>
              <p className="text-muted max-w-[920px]">
                Floor designation requires the same human-approval gate as any other score change. The proposal, the corroborating evidence, the rationale, and the approval decision are retained in the audit log. Any future change to the designation &mdash; including exit &mdash; is logged with the same chain of evidence.
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
                    explanation: "If an editorial or advisory relationship exists with a benchmarked entity, it is disclosed on that entity’s page.",
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

        {/* Evidence hierarchy */}
        <section id="evidence-hierarchy" className="py-[30px] scroll-mt-24">
          <Container>
            <SectionHead
              title="Evidence hierarchy"
              description="The benchmark deliberately differentiates evidence by independence and reliability. Strong scores require stronger evidence."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { kicker: "Tier 1", title: "Independent external audit", desc: "Highest-weight evidence such as third-party assessments, regulatory findings, and academic studies." },
                { kicker: "Tier 2", title: "Verifiable outcome data", desc: "High-weight evidence including disaggregated service data, longitudinal surveys, and resolution rates." },
                { kicker: "Tier 3", title: "Community testimony", desc: "High-weight evidence from affected populations, independent focus groups, and structured interviews." },
                { kicker: "Tier 4", title: "Policy and process documents", desc: "Moderate-weight evidence such as governing documents, training records, and budget allocations." },
                { kicker: "Tier 5", title: "Entity self-report", desc: "Lowest-weight evidence including mission statements and annual reports, requiring corroboration from stronger tiers." },
                { kicker: "Interpretation rule", title: "Evidence beats aspiration", desc: "Where paper claims and lived experience diverge, the methodology scores the world as encountered, not the story as presented." },
              ].map((item) => (
                <Panel key={item.title}>
                  <p className="text-accent text-[0.86rem] font-bold uppercase tracking-[0.08em] mb-2">{item.kicker}</p>
                  <h3 className="text-[1.08rem] font-bold mb-2">{item.title}</h3>
                  <p className="text-muted">{item.desc}</p>
                </Panel>
              ))}
            </div>
          </Container>
        </section>

        {/* Scoring model + Integration premium */}
        <section id="scoring-model" className="py-[30px] scroll-mt-24">
          <Container className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
              {/* Item 15 — plain-language intuition from INTEGRATION_PREMIUM.detail */}
              <p className="text-muted mb-3 text-[0.92rem] italic border-l-2 border-[rgba(125,211,252,0.3)] pl-3">
                {INTEGRATION_PREMIUM.detail}
              </p>
              <p className="text-muted mb-3">
                {INTEGRATION_PREMIUM.short}
              </p>
              <p className="text-muted mb-3 text-[0.92rem]">
                The premium rewards consistent compassionate performance across dimensions rather than isolated strengths. Harm override sets the premium to zero when any subdimension scores 0. The premium is reduced when dimension scores are uneven and weakened further for each dimension that falls below 4.0.
              </p>
              <ul className="list-disc pl-[18px] text-muted space-y-2">
                <li>Std. dev. &le; 1.5 &rarr; 100% consistency factor</li>
                <li>Std. dev. 1.5–3.0 &rarr; 75%</li>
                <li>Std. dev. 3.0–5.0 &rarr; 40%</li>
                <li>Std. dev. &gt; 5.0 &rarr; 10%</li>
                <li>Weakness penalty: minus 20% for each dimension below 4.0</li>
              </ul>
            </Panel>
          </Container>

          {/* S3.5 (M3) — Integration premium "explain the formula" diagram */}
          <Container className="mt-4">
            <div id="integration-premium-diagram" className="scroll-mt-20">
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

        {/* Rubric anchors and score bands */}
        <section id="rubric-anchors" className="py-[30px] scroll-mt-24">
          <Container>
            <SectionHead
              title="Rubric anchors and score bands"
              description="The Human Assessment Battery uses universal behavioral anchors at the subdimension level and a five-band public interpretation model at the composite level."
            />

            {/* S3.5 (M2) — 0–5 anchor ladder visual */}
            <div id="anchor-ladder" className="scroll-mt-20 mb-6">
              <ChartFrame
                title="What each score level means"
                dek="The 0–5 behavioral anchor scale. Every subdimension is scored against these six anchors."
                path="/methodology"
              >
                <AnchorLadder />
              </ChartFrame>
            </div>

            {/* Item 4 — 0–100 band scale strip */}
            <div className="mb-6">
              <ChartFrame
                title="What the composite score means"
                dek="The five composite bands mapped across the 0–100 scale."
                path="/methodology"
              >
                <BandScaleStrip />
              </ChartFrame>
            </div>

            {/* Item 9 — Band/anchor name-collision disambiguator */}
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
                        {/* Item 9 — prefix numeral to anchor level label */}
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
                  /* Item 15 — expand IRR at first use */
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

        {/* Full 40-subdimension framework */}
        <section id="subdimension-framework" className="py-[30px] scroll-mt-24">
          <Container>
            <SectionHead
              title="Full 40-subdimension framework"
              description="Each dimension contains five scored subdimensions. Together they define the operational content of the standard."
            />
            <Panel>
              {/* Item 1 — mobile scroll hint */}
              <p className="text-muted text-[0.8rem] mt-1 mb-2 lg:hidden">Scroll horizontally to see all columns</p>
              <div className="overflow-auto">
                <table className="w-full border-collapse">
                  <caption className="sr-only">Full 40-subdimension framework: dimension name, subdimension ID, subdimension name, and core assessment question for all 40 scored subdimensions</caption>
                  <thead>
                    <tr>
                      <th scope="col" className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line bg-[rgba(255,255,255,0.02)]">Dimension</th>
                      <th scope="col" className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line bg-[rgba(255,255,255,0.02)]">ID</th>
                      <th scope="col" className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line bg-[rgba(255,255,255,0.02)]">Subdimension</th>
                      <th scope="col" className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line bg-[rgba(255,255,255,0.02)]">Core assessment question</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted">
                    {/* Item 2 — derived from canonical DIMENSIONS data */}
                    {SUBDIM_ROWS.map((row) => (
                      <tr key={row.id}>
                        <td className="py-3 px-2.5 border-b border-line text-text">{row.dim}</td>
                        <td className="py-3 px-2.5 border-b border-line font-bold">{row.id}</td>
                        <td className="py-3 px-2.5 border-b border-line text-text">{row.subdim}</td>
                        <td className="py-3 px-2.5 border-b border-line">{row.question}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
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
                {/* Item 15 — expand ACB at first use */}
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

        {/* Assessment instrument — document control (S1.4/2C) */}
        {/* Subordinate footnote for assessors and institutional clients.           */}
        {/* The public scoring methodology above is fully open; these references    */}
        {/* identify the controlled field instruments used in certified assessments. */}
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

        {/* Navigation links */}
        <section className="py-[30px]">
          <Container className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Panel>
              <h3 className="text-[1.08rem] font-bold mb-2.5">Explore the benchmark</h3>
              <p className="text-muted mb-3">See how the methodology is applied across the current published index families.</p>
              <Button href="/indexes" variant="primary">Indexes</Button>
            </Panel>
            <Panel>
              <h3 className="text-[1.08rem] font-bold mb-2.5">Apply it to your organization</h3>
              <p className="text-muted mb-3">Use the framework as an entry point into guided review, advisory, or formal structured assessment.</p>
              <Button href="/assess-your-organization" variant="primary">Assess Your Organization</Button>
            </Panel>
            <Panel>
              <h3 className="text-[1.08rem] font-bold mb-2.5">Use the benchmark seriously</h3>
              <p className="text-muted mb-3">Purchase reports, license data, book advisory work, or discuss a broader institutional relationship.</p>
              <div className="flex gap-2 flex-wrap">
                <a href="/purchase-research" className="text-muted hover:text-text">Purchase Research</a>
                <span className="text-muted">&middot;</span>
                <a href="/data-licenses" className="text-muted hover:text-text">Data License</a>
                <span className="text-muted">&middot;</span>
                <a href="/advisory" className="text-muted hover:text-text">Advisory</a>
                <span className="text-muted">&middot;</span>
                <a href="/contact-sales" className="text-muted hover:text-text">Contact Sales</a>
              </div>
            </Panel>
          </Container>
        </section>
      </main>
    </>
  );
}
