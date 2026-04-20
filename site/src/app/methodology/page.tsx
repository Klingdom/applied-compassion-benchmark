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
import Band from "@/components/ui/Band";
import NewsletterSignup from "@/components/ui/NewsletterSignup";

export const metadata: Metadata = { title: "Methodology", description: "Understand the 8-dimension, 40-subdimension scoring framework, evidence hierarchy, and adversarial pressure-test model behind the benchmark." };

export default function MethodologyPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-[72px] pb-10">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-[18px] items-start">
            <div>
              <Eyebrow>Methodology &amp; Framework</Eyebrow>
              <h1 className="text-[clamp(2.2rem,5vw,4rem)] leading-[1.04] tracking-[-0.03em] mb-3.5">
                How the Compassion Benchmark works
              </h1>
              <p className="text-muted text-[1.08rem] max-w-[860px] mb-[22px]">
                The Compassion Benchmark is a structured methodology for measuring whether an institution reliably detects suffering, understands it, responds effectively, distributes care fairly, respects ethical limits, owns failures, addresses root causes, and behaves with genuine integrity. The formal assessment architecture combines an eight-dimension framework, forty scored subdimensions, a tiered evidence model, adversarial pressure testing, and a human-led synthesis workflow designed to make scores legible, contestable, and difficult to game.
              </p>
              <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
                <Stat value="8" label="Core dimensions" />
                <Stat value="40" label="Scored subdimensions" />
                <Stat value="7" label="Human assessment sessions" />
                <Stat value="5" label="Evidence tiers" />
                <Stat value="0\u2013100" label="Composite score scale" />
                <Stat value="v1.1" label="Methodology version" />
              </div>
            </div>

            <Panel>
              <h3 className="text-[1.08rem] font-bold mb-2.5">Human Assessment Battery</h3>
              <p className="text-muted mb-3">
                ACB-HAB-001 is the human-administered field guide for corporations, governments, religious institutions, and AI development organizations. It uses structured interviews, document review, observation, and community testimony rather than self-report alone.
              </p>
              <table className="w-full border-collapse mb-3">
                <tbody className="text-muted">
                  {[
                    ["Document ID", "ACB-HAB-001"],
                    ["Version", "1.0 \u2014 Initial Release"],
                    ["Companions", "ACB-PAB-001 and ACB-STD-001"],
                    ["Administered by", "Credentialed ACB assessors"],
                    ["Typical duration", "4\u20136 hours per entity across 2\u20133 sessions"],
                    ["Sensitivity", "Restricted assessor-use instrument"],
                  ].map(([label, value]) => (
                    <tr key={label}>
                      <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">{label}</th>
                      <td className="py-3 px-2.5 border-b border-line">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
      <section className="py-[30px]">
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

      {/* Framework overview */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="Framework overview"
            description="The benchmark preserves the same conceptual structure across sectors. What changes by entity type is the evidence model and assessment protocol, not the underlying definition of compassion."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "Awareness", desc: "Whether the entity reliably detects suffering before it has to be formally named." },
              { title: "Empathy", desc: "Whether the entity genuinely models and honors the inner experience of affected people." },
              { title: "Action", desc: "Whether compassionate understanding becomes timely, effective, adequately resourced help." },
              { title: "Equity", desc: "Whether care is extended fairly, accessibly, and in proportion to need." },
              { title: "Boundaries", desc: "Whether help is ethical, sustainable, consent-based, and autonomy-preserving." },
              { title: "Accountability", desc: "Whether the entity acknowledges harm, corrects course, learns, and repairs." },
              { title: "Systemic Thinking", desc: "Whether the entity addresses root causes, second-order effects, and structural conditions." },
              { title: "Integrity", desc: "Whether compassion is genuine, consistent under pressure, and resilient over time." },
            ].map((item) => (
              <Card key={item.title}>
                <h3 className="text-[1.08rem] font-bold mb-2">{item.title}</h3>
                <p className="text-muted">{item.desc}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Assessor orientation + Interview principles */}
      <section className="py-[30px]">
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
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="7-session human assessment protocol"
            description="The Human Assessment Battery uses a structured sequence intended to compare leadership narrative, frontline reality, community experience, and documentary evidence before final score synthesis."
          />
          <Panel>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">Session</th>
                  <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">Participants</th>
                  <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">Primary focus</th>
                  <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">Typical duration</th>
                </tr>
              </thead>
              <tbody className="text-muted">
                {[
                  ["1A", "Senior leadership (2\u20133 people)", "Awareness, Action, Accountability, Integrity", "90 min"],
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
                desc: "A structured digest synthesizes the night\u2019s findings: proposed changes, sector alerts, methodology concerns, and watch items. Nothing is applied yet.",
              },
              {
                stage: "Stage 4",
                title: "Founder approval",
                desc: "Every proposed score change is reviewed and approved \u2014 or rejected \u2014 by a human before reaching production. The approval log is auditable. Evidence older than 14 days cannot drive a change.",
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
              Each entity page on the published site carries a freshness stamp \u2014 <em>Evidence reviewed YYYY-MM-DD</em> \u2014 showing either that no material change surfaced in the last 14 days (green) or that new evidence is under review (orange). The scanner touches every one of the 1,155 entities daily, not only the most active ones.
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
      <section className="py-[30px]">
        <Container>
          <Callout>
            <p className="text-accent text-[0.86rem] font-bold uppercase tracking-[0.08em] mb-2">Structural safeguard</p>
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] mb-2">No automated score changes</h2>
            <p className="text-muted max-w-[920px] mb-3">
              Every proposed score change \u2014 whether generated by the overnight research pipeline, a new evidence disclosure, or a scheduled rotation \u2014 requires explicit human approval before it reaches the published index. The approval log is retained. The proposal and its evidence are retained. The decision is retained.
            </p>
            <p className="text-muted text-[0.92rem]">
              This gate is not a review of surface numbers. The approver examines the assessment reasoning, the evidence quality, the sector context, and any discrepancy with prior findings. Approximately 30 percent of generated proposals are sent back for additional evidence or adjusted before approval. Rejections are logged alongside approvals.
            </p>
          </Callout>
        </Container>
      </section>

      {/* Independence policy */}
      <section className="py-[30px]">
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
                  explanation: "Score-Watch, Purchase Research, Data License, and Advisory are observation and interpretation products. Subscribers pay for notification, data access, or guidance \u2014 they do not influence what is scored or how.",
                },
                {
                  label: "Findings are not embargoed for subscribers",
                  explanation: "Every confirmed score change is published to /updates and the public index pages at the same time all subscribers receive their alerts. Paying subscribers do not receive scoring information ahead of the public record.",
                },
                {
                  label: "Conflicts are declared",
                  explanation: "If an editorial or advisory relationship exists with a benchmarked entity, it is disclosed on that entity\u2019s page.",
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
      <section className="py-[30px]">
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
      <section className="py-[30px]">
        <Container className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-2.5">Common scoring model</h3>
            <p className="text-muted mb-3">
              Each subdimension is scored on a 0\u20135 anchored behavioral scale. The five subdimensions within a dimension are summed and converted into a dimension score out of 10. The eight dimension scores together create a base total out of 80, which is then combined with an integration premium worth up to 10 additional points to produce a 0\u2013100 composite.
            </p>
            <p className="text-muted text-[0.92rem]">
              A score of 0 represents active documented harm and requires lead assessor co-sign. A score of 4 or 5 is provisional unless there is pressure-test evidence.
            </p>
          </Panel>
          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-2.5">Integration premium logic</h3>
            <p className="text-muted mb-3">
              The premium rewards consistent compassionate performance across dimensions rather than isolated strengths. Harm override sets the premium to zero when any subdimension scores 0. The premium is reduced when dimension scores are uneven and weakened further for each dimension that falls below 4.0.
            </p>
            <ul className="list-disc pl-[18px] text-muted space-y-2">
              <li>Std. dev. &le; 1.5 &rarr; 100% consistency factor</li>
              <li>Std. dev. 1.5\u20133.0 &rarr; 75%</li>
              <li>Std. dev. 3.0\u20135.0 &rarr; 40%</li>
              <li>Std. dev. &gt; 5.0 &rarr; 10%</li>
              <li>Weakness penalty: minus 20% for each dimension below 4.0</li>
            </ul>
          </Panel>
        </Container>
      </section>

      {/* Rubric anchors and score bands */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="Rubric anchors and score bands"
            description="The Human Assessment Battery uses universal behavioral anchors at the subdimension level and a five-band public interpretation model at the composite level."
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Panel>
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">Score</th>
                    <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">Anchor</th>
                    <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">Meaning</th>
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
                      <td className="py-3 px-2.5 border-b border-line text-text">{anchor}</td>
                      <td className="py-3 px-2.5 border-b border-line">{meaning}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {([
                { level: "critical" as const, range: "0\u201320", label: "Active harm or fundamental compassionate failure." },
                { level: "developing" as const, range: "21\u201340", label: "Nominal capacity in some areas, but major gaps remain." },
                { level: "functional" as const, range: "41\u201360", label: "Basic compassionate capacity exists, though significant weakness remains." },
                { level: "established" as const, range: "61\u201380", label: "Consistent, pressure-tested, independently supported performance." },
                { level: "exemplary" as const, range: "81\u2013100", label: "Sector-leading performance with no weak dimensions and strong evidence." },
              ]).map((item) => (
                <div key={item.level} className="bg-[rgba(255,255,255,0.03)] border border-line rounded-[16px] p-3.5">
                  <Band level={item.level} />
                  <strong className="block mt-1.5 mb-1">{item.range}</strong>
                  <span className="text-muted text-[0.92rem]">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Lead assessor review flags */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="Lead assessor review flags"
            description="Certain patterns automatically trigger deeper review before a score is finalized."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "Active harm", desc: "Any subdimension scored 0 requires written documentation and lead assessor co-sign." },
              { title: "Rater discrepancy", desc: "IRR discrepancy greater than 1.5 on any subdimension triggers review." },
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
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="Full 40-subdimension framework"
            description="Each dimension contains five scored subdimensions. Together they define the operational content of the standard."
          />
          <Panel>
            <div className="overflow-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line bg-[rgba(255,255,255,0.02)]">Dimension</th>
                    <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line bg-[rgba(255,255,255,0.02)]">ID</th>
                    <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line bg-[rgba(255,255,255,0.02)]">Subdimension</th>
                    <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line bg-[rgba(255,255,255,0.02)]">Core assessment question</th>
                  </tr>
                </thead>
                <tbody className="text-muted">
                  {[
                    ["Awareness","A1","Suffering Detection","Does this entity reliably detect when others are in pain or need before they explicitly name it?"],
                    ["Awareness","A2","Contextual Sensitivity","Does awareness adjust to the actual populations being served, rather than to default assumptions?"],
                    ["Awareness","A3","Blind Spot Mitigation","Does the entity actively seek out the suffering it is currently missing?"],
                    ["Awareness","A4","Signal Amplification","Does it make visible the suffering of those who cannot easily speak for themselves?"],
                    ["Awareness","A5","Anticipatory Awareness","Can the entity foresee potential harms before they manifest?"],
                    ["Empathy","E1","Affective Resonance","Do people feel genuinely cared about rather than merely processed?"],
                    ["Empathy","E2","Perspective-Taking","Does the entity model the inner experience of those it serves, especially those far from leadership power?"],
                    ["Empathy","E3","Non-Judgment","Does it suspend judgment across identity, behavior, and belief differences under pressure?"],
                    ["Empathy","E4","Validation","Does it affirm the legitimacy of others\u2019 experiences, even when inconvenient?"],
                    ["Empathy","E5","Cultural Empathy","Does it integrate diverse cultural ways of knowing into practice rather than offering surface accommodation?"],
                    ["Action","AC1","Responsiveness","Do identified needs receive timely, appropriately prioritized response?"],
                    ["Action","AC2","Proportionality","Is help calibrated to actual need, not simply to what is easiest to provide?"],
                    ["Action","AC3","Efficacy","Does the help actually reduce suffering rather than just creating activity that looks like help?"],
                    ["Action","AC4","Resource Mobilization","Does the entity bring adequate resources to the problems it has identified?"],
                    ["Action","AC5","Follow-Through","Does the entity persist rather than disengage when attention moves on?"],
                    ["Equity","EQ1","Universality","Does care extend to all people regardless of identity?"],
                    ["Equity","EQ2","Priority for the Vulnerable","Are those with the greatest need actually prioritized?"],
                    ["Equity","EQ3","Bias Awareness","Does the entity identify and correct bias in who receives care and how?"],
                    ["Equity","EQ4","Access Design","Are services designed to be accessible to those who need them most?"],
                    ["Equity","EQ5","Historical Harm Acknowledgment","Does the entity recognize and respond to historical harms associated with itself or its predecessors?"],
                    ["Boundaries","B1","Self-Sustainability","Does compassionate work come from a stable, non-depleting foundation?"],
                    ["Boundaries","B2","Autonomy Preservation","Does help build self-determination rather than dependency?"],
                    ["Boundaries","B3","Scope Clarity","Does the entity communicate honestly about what it can and cannot do?"],
                    ["Boundaries","B4","Refusal Ethics","When the entity declines to help, is refusal delivered with dignity and alternatives?"],
                    ["Boundaries","B5","Consent Orientation","Does it obtain genuine informed consent before acting?"],
                    ["Accountability","AB1","Harm Acknowledgment","Does the entity acknowledge harm it has caused without deflection?"],
                    ["Accountability","AB2","Correction Willingness","Does it change course when shown it is causing harm?"],
                    ["Accountability","AB3","Transparency","Does it operate with genuine transparency about performance and failures?"],
                    ["Accountability","AB4","Systemic Learning","Does it institutionally learn from failures?"],
                    ["Accountability","AB5","Reparative Action","Does it make concrete repair to those it has harmed?"],
                    ["Systemic Thinking","S1","Root Cause Orientation","Does the entity address causes of suffering, not only symptoms?"],
                    ["Systemic Thinking","S2","Long-Term Impact","Does it plan for long-horizon effects of its actions?"],
                    ["Systemic Thinking","S3","Interconnection Awareness","Does it understand effects on adjacent systems and second-order consequences?"],
                    ["Systemic Thinking","S4","Structural Critique","Does it critically examine structures that perpetuate suffering, including those from which it benefits?"],
                    ["Systemic Thinking","S5","Coalitional Compassion","Does it collaborate in ways that amplify impact beyond its own institutional capacity?"],
                    ["Integrity","I1","Consistency Under Pressure","Does compassionate behavior hold when it is costly?"],
                    ["Integrity","I2","Non-Performance","Is compassion genuine rather than reputationally driven?"],
                    ["Integrity","I3","Internal Consistency","Does the entity treat internal stakeholders with the same compassion it claims externally?"],
                    ["Integrity","I4","Values Alignment","Are major decisions actually aligned with stated values?"],
                    ["Integrity","I5","Resilience of Care","Does compassion persist across leadership change and institutional stress?"],
                  ].map(([dim, id, subdim, question]) => (
                    <tr key={id}>
                      <td className="py-3 px-2.5 border-b border-line text-text">{dim}</td>
                      <td className="py-3 px-2.5 border-b border-line font-bold">{id}</td>
                      <td className="py-3 px-2.5 border-b border-line text-text">{subdim}</td>
                      <td className="py-3 px-2.5 border-b border-line">{question}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </Container>
      </section>

      {/* What assessors are looking for */}
      <section className="py-[30px]">
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
      <section className="py-[30px]">
        <Container className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-2.5">Cross-sector adaptation</h3>
            <p className="text-muted mb-3">
              The same framework can be adapted across governments, corporations, NGOs, religious institutions, AI labs, technology systems, products, and teams. The human battery is especially important when community interviews, leadership interviews, and observation are necessary to understand whether compassionate behavior actually exists in practice.
            </p>
            <p className="text-muted text-[0.92rem]">
              In the broader ACB architecture, AI systems may also be evaluated with the AI Prompt Battery while organizations behind those systems are evaluated using the Human Assessment Battery.
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
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="Methodology version and change log"
            description="Methodology changes are versioned, dated, and publicly described. Historical changes do not retroactively rewrite prior assessments."
          />
          <Panel>
            <div className="space-y-6">
              <div>
                <div className="grid grid-cols-[160px_1fr] gap-4 items-start">
                  <span className="font-bold text-text pt-0.5">Version 1.1 \u2014 2026-04-20</span>
                  <ul className="list-disc pl-[18px] text-muted space-y-2">
                    <li>Integration premium capped at +10 points (down from +20). Rationale: entities with uniform-high dimension profiles were computing to perfect 100 regardless of evidence quality. The cap ensures the premium rewards consistency without overriding evidence ceilings.</li>
                    <li>Composite score determinism enforced. Every composite must now compute deterministically from its dimension scores via the published formula. A data-layer validator rejects drift above 2.0 points.</li>
                    <li>Floor-clamping artifacts corrected. Entities previously displayed at composite 0.0 (a legacy display-layer artifact) now show their formula-computed composites \u2014 typically 4 to 7 points reflecting the actual dimension scores.</li>
                  </ul>
                </div>
              </div>
              <div className="border-t border-line pt-6">
                <div className="grid grid-cols-[160px_1fr] gap-4 items-start">
                  <span className="font-bold text-text pt-0.5">Version 1.0 \u2014 Initial release</span>
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
    </>
  );
}
