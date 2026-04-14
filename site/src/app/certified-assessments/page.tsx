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

export const metadata: Metadata = { title: "Certified Assessments" };

export default function CertifiedAssessmentsPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-[72px] pb-10">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-[18px] items-start">
            <div>
              <Eyebrow>Certified assessments</Eyebrow>
              <h1 className="text-[clamp(2.2rem,5vw,4rem)] leading-[1.04] tracking-[-0.03em] mb-3.5">
                Structured benchmark reviews conducted under a formal assessment process
              </h1>
              <p className="text-muted text-[1.08rem] max-w-[860px] mb-[22px]">
                Certified assessments provide a structured, assessor-led benchmark review for organizations, institutions, governments, labs, and other entities seeking a formal evaluation process beyond the public benchmark. These assessments use the benchmark framework, documented evidence, structured review protocols, and defined assessor procedures to produce findings suitable for leadership, governance, and improvement planning.
              </p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <Stat value="Formal" label="Structured assessment workflow" />
                <Stat value="Evidence-Based" label="Documented review model" />
                <Stat value="Assessor-Led" label="Certified review pathway" />
                <Stat value="Actionable" label="Findings and next-step guidance" />
              </div>
            </div>
            <Panel>
              <h3 className="text-[1.08rem] font-bold mb-2.5">Assessment boundary</h3>
              <p className="text-muted mb-3">
                Certified assessments are formal review services, not paid score manipulation. Payment covers the assessment process, evidence review, findings delivery, and related professional services. It does not guarantee a target score, ranking change, certification outcome, or public listing decision.
              </p>
              <div className="flex gap-3 flex-wrap">
                <Button href="/contact-sales" variant="primary">Request an assessment</Button>
                <Button href="/methodology">Review methodology</Button>
              </div>
            </Panel>
          </div>
        </Container>
      </section>

      {/* Assessment offerings */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="Assessment offerings"
            description="The assessment model should provide a clear ladder from lighter review to full advisory-grade structured evaluation."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { pills: ["Entry", "Guided Review"], title: "Guided self-assessment review", desc: "A lighter-touch engagement in which the client completes a structured benchmark intake and receives a guided review session and findings summary.", price: "$2,500+" },
              { pills: ["Core", "Assessor-Led"], title: "Certified assessor review", desc: "A formal review conducted by trained assessors using the benchmark framework, documented evidence, and structured evaluation procedures.", price: "$5,000\u2013$15,000" },
              { pills: ["Advanced", "Deep Review"], title: "Advanced advisory assessment", desc: "A deeper benchmark evaluation combining document review, assessor analysis, leadership interviews, findings synthesis, and improvement guidance.", price: "$15,000\u2013$50,000+" },
              { pills: ["Leadership", "Readout"], title: "Executive findings presentation", desc: "Leadership-facing presentation of assessment findings, strengths, structural gaps, and recommended priorities.", price: "$5,000+" },
              { pills: ["Roadmap", "Improvement"], title: "Improvement roadmap package", desc: "A structured post-assessment roadmap translating findings into sequenced priorities, governance moves, and operating recommendations.", price: "$10,000+" },
              { pills: ["Custom", "Institutional"], title: "Custom assessment engagement", desc: "For institutions that require multi-unit review, cross-entity comparison, phased evaluation, or tailored governance support.", price: "Custom" },
            ].map((item) => (
              <Card key={item.title} variant="service">
                <div className="flex gap-2.5 flex-wrap">
                  {item.pills.map((p) => <Pill key={p}>{p}</Pill>)}
                </div>
                <h3 className="text-[1.12rem] font-bold">{item.title}</h3>
                <p className="text-muted">{item.desc}</p>
                <p className="text-[1.5rem] font-bold">{item.price} <span className="text-[0.92rem] font-medium text-muted">starting range</span></p>
                <Button href="/contact-sales" variant="primary" full>Request quote</Button>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Includes / Does not include */}
      <section className="py-[30px]">
        <Container className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-2.5">What certified assessments include</h3>
            <ul className="list-disc pl-[18px] text-muted space-y-2">
              <li><span className="text-text font-semibold">Structured intake:</span> evidence collection, documentation intake, and benchmark scoping</li>
              <li><span className="text-text font-semibold">Assessor review:</span> formal evaluation against the benchmark framework</li>
              <li><span className="text-text font-semibold">Findings package:</span> strengths, gaps, and dimension-level interpretation</li>
              <li><span className="text-text font-semibold">Leadership readout:</span> optional briefing or presentation for senior stakeholders</li>
              <li><span className="text-text font-semibold">Improvement path:</span> optional roadmap or next-step recommendations</li>
            </ul>
          </Panel>
          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-2.5">What certified assessments do not include</h3>
            <ul className="list-disc pl-[18px] text-muted space-y-2">
              <li>Guaranteed certification approval</li>
              <li>Guaranteed target score</li>
              <li>Guaranteed rank improvement</li>
              <li>Suppression of published findings</li>
              <li>Methodology changes tailored to a client preference</li>
            </ul>
          </Panel>
        </Container>
      </section>

      {/* Assessment process */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="Assessment process"
            description="The certified assessment page should make the review workflow clear and credible."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "1. Intake", desc: "Initial scoping, entity profile, evidence request, and assessment fit review." },
              { title: "2. Evidence review", desc: "Assessors review submitted materials alongside public evidence and benchmark criteria." },
              { title: "3. Findings synthesis", desc: "Dimension-level findings, structural observations, and benchmark interpretation are prepared." },
              { title: "4. Delivery", desc: "Assessment outputs are delivered through memo, briefing, readout, and optional roadmap work." },
            ].map((item) => (
              <Card key={item.title}>
                <h3 className="text-[1.08rem] font-bold mb-2">{item.title}</h3>
                <p className="text-muted">{item.desc}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Who assessments are for */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="Who certified assessments are for"
            description="Certified assessments are best suited for entities that want more than public ranking visibility and need formal structured review."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "Companies", desc: "Organizations seeking structured review of benchmark positioning and internal improvement priorities." },
              { title: "Public institutions", desc: "Governments, agencies, and public systems seeking formal evidence-based evaluation." },
              { title: "AI and robotics labs", desc: "Technology organizations requiring governance, deployment, and trust-oriented assessment." },
              { title: "Large enterprises", desc: "Multi-unit organizations seeking repeatable assessment architecture and leadership-level reporting." },
            ].map((item) => (
              <Card key={item.title}>
                <h3 className="text-[1.08rem] font-bold mb-2">{item.title}</h3>
                <p className="text-muted">{item.desc}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Assessment pathways */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="Assessment pathways"
            description="Different organizations enter the assessment process from different levels of readiness."
          />
          <Panel>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">Starting point</th>
                  <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">Need</th>
                  <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">Best assessment path</th>
                  <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">Typical next step</th>
                </tr>
              </thead>
              <tbody className="text-muted">
                {[
                  ["Benchmark-curious organization", "Wants an initial structured review without a large engagement", "Guided self-assessment review", "Certified assessor review"],
                  ["Leadership team", "Needs a formal outside evaluation of institutional posture", "Certified assessor review", "Executive findings presentation"],
                  ["Improvement-oriented organization", "Wants formal findings plus a change pathway", "Advanced advisory assessment", "Improvement roadmap package"],
                  ["Large institution", "Needs multi-unit, phased, or recurring structured review", "Custom assessment engagement", "Enterprise agreement"],
                ].map(([start, need, path, next]) => (
                  <tr key={start}>
                    <td className="py-3 px-2.5 border-b border-line text-text">{start}</td>
                    <td className="py-3 px-2.5 border-b border-line">{need}</td>
                    <td className="py-3 px-2.5 border-b border-line">{path}</td>
                    <td className="py-3 px-2.5 border-b border-line">{next}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </Container>
      </section>

      {/* Menu + Expansion */}
      <section className="py-[30px]">
        <Container className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-2.5">Recommended initial assessment menu</h3>
            <ul className="list-disc pl-[18px] text-muted space-y-2">
              <li>Guided self-assessment review</li>
              <li>Certified assessor review</li>
              <li>Advanced advisory assessment</li>
              <li>Executive findings presentation</li>
              <li>Improvement roadmap package</li>
            </ul>
          </Panel>
          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-2.5">Expansion path</h3>
            <ul className="list-disc pl-[18px] text-muted space-y-2">
              <li>Annual reassessment offerings</li>
              <li>Quarterly review and progress checks</li>
              <li>Sector-specific certification pathways</li>
              <li>Multi-site or multi-unit assessment programs</li>
              <li>Integrated enterprise assessment agreements</li>
            </ul>
          </Panel>
        </Container>
      </section>

      {/* Related services */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="Relationship to other services"
            description="Certified assessments sit between public benchmark interpretation and larger enterprise advisory structures."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <h3 className="text-[1.08rem] font-bold mb-2">Advisory consulting</h3>
              <p className="text-muted">Best for interpretation, peer context, and strategic discussion without a formal assessment workflow.</p>
            </Card>
            <Card>
              <h3 className="text-[1.08rem] font-bold mb-2">Purchase Research</h3>
              <p className="text-muted">Best for benchmark reports, document access, and structured research deliverables.</p>
            </Card>
            <Card>
              <h3 className="text-[1.08rem] font-bold mb-2">Enterprise agreements</h3>
              <p className="text-muted">Best for recurring institutional arrangements that combine research, assessment, licensing, and support.</p>
            </Card>
          </div>
        </Container>
      </section>

      {/* Principles + Buyer language */}
      <section className="py-[30px]">
        <Container className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-2.5">Assessment principles</h3>
            <ul className="list-disc pl-[18px] text-muted space-y-2">
              <li>Evidence-based review comes first</li>
              <li>Assessor credibility must be preserved</li>
              <li>Certification decisions cannot be purchased</li>
              <li>Findings must remain grounded in the benchmark framework</li>
              <li>Assessment and public ranking functions should remain clearly separated where needed</li>
            </ul>
          </Panel>
          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-2.5">Buyer language this page should support</h3>
            <ul className="list-disc pl-[18px] text-muted space-y-2">
              <li>{"\u201C"}We want a formal review, not just a conversation.{"\u201D"}</li>
              <li>{"\u201C"}We need structured findings for leadership.{"\u201D"}</li>
              <li>{"\u201C"}We want a third-party benchmark assessment.{"\u201D"}</li>
              <li>{"\u201C"}Help us identify our biggest gaps.{"\u201D"}</li>
              <li>{"\u201C"}We want a documented process we can take seriously internally.{"\u201D"}</li>
            </ul>
          </Panel>
        </Container>
      </section>

      {/* Final CTA */}
      <section className="py-[30px]">
        <Container>
          <Callout>
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] mb-2">Begin a certified assessment inquiry</h2>
            <p className="text-muted max-w-[760px] mb-[18px]">
              Request a structured review, assessor-led evaluation, or advanced benchmark assessment engagement.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Button href="/contact-sales" variant="primary">Contact sales</Button>
              <Button href="/services">View all services</Button>
            </div>
          </Callout>
        </Container>
      </section>
    </>
  );
}
