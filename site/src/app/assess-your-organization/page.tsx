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

export const metadata: Metadata = { title: "Assess Your Organization", description: "Start a structured benchmark evaluation of your organization through advisory, certified assessment, or enterprise review pathways." };

export default function AssessYourOrganizationPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-[72px] pb-10">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-[18px] items-start">
            <div>
              <Eyebrow>Organization assessment pathway</Eyebrow>
              <h1 className="text-[clamp(2.2rem,5vw,4rem)] leading-[1.04] tracking-[-0.03em] mb-3.5">
                Assess your organization against the benchmark framework
              </h1>
              <p className="text-muted text-[1.08rem] max-w-[860px] mb-[22px]">
                This page is the entry point for organizations that want to move from public benchmark visibility into a structured evaluation process. Whether you need interpretive guidance, a formal certified assessment, or a broader institutional relationship, this page helps route you to the right next step.
              </p>
              <div className="flex gap-3 flex-wrap mt-1">
                <Button href="/contact-sales" variant="primary">Start an Inquiry</Button>
                <Button href="/certified-assessments">View Certified Assessments</Button>
                <Button href="/advisory">Explore Advisory</Button>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
                <Stat value="Structured" label="Built on the benchmark framework" />
                <Stat value="Evidence-Based" label="Grounded in documented signals" />
                <Stat value="Flexible" label="From advisory to formal review" />
                <Stat value="Actionable" label="Designed to support next steps" />
              </div>
            </div>
            <Panel>
              <h3 className="text-[1.08rem] font-bold mb-2.5">Important boundary</h3>
              <p className="text-muted mb-3">
                Assessment services do not allow an organization to buy a better public rank, change a published score, or suppress public findings. Payment supports review, interpretation, evidence gathering, structured evaluation, and institutional guidance.
              </p>
              <p className="text-muted">
                That separation protects the credibility of the benchmark.
              </p>
            </Panel>
          </div>
        </Container>
      </section>

      {/* Who this page is for + Best next step */}
      <section className="py-[30px]">
        <Container className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-2.5">Who this page is for</h3>
            <ul className="list-disc pl-[18px] text-muted space-y-2">
              <li>Companies seeking structured benchmark interpretation</li>
              <li>Organizations pursuing external evaluation</li>
              <li>Public institutions assessing policy and systems posture</li>
              <li>AI and robotics labs seeking governance-oriented review</li>
              <li>Large institutions considering enterprise benchmark use</li>
            </ul>
          </Panel>
          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-2.5">Best next step by need</h3>
            <ul className="list-disc pl-[18px] text-muted space-y-2">
              <li><strong className="text-text">We want a conversation first</strong> → <a href="/advisory" className="hover:text-text">Advisory</a></li>
              <li><strong className="text-text">We want a formal external review</strong> → <a href="/certified-assessments" className="hover:text-text">Certified Assessments</a></li>
              <li><strong className="text-text">We need a broader institutional arrangement</strong> → <a href="/enterprise" className="hover:text-text">Enterprise</a></li>
              <li><strong className="text-text">We are ready to talk now</strong> → <a href="/contact-sales" className="hover:text-text">Contact Sales</a></li>
            </ul>
          </Panel>
        </Container>
      </section>

      {/* Available pathways */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="Available pathways"
            description="Organizations can engage at different levels depending on seriousness, readiness, and internal need."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card href="/advisory" variant="service">
              <div className="flex gap-2.5 flex-wrap">
                <Pill>Step 1</Pill>
                <Pill>Interpretation</Pill>
              </div>
              <h3 className="text-[1.12rem] font-bold">Advisory consultation</h3>
              <p className="text-muted">
                Start with a private briefing, interpretation session, or peer comparison conversation to understand what the benchmark means for your organization.
              </p>
            </Card>
            <Card href="/certified-assessments" variant="service">
              <div className="flex gap-2.5 flex-wrap">
                <Pill>Step 2</Pill>
                <Pill>Formal Review</Pill>
              </div>
              <h3 className="text-[1.12rem] font-bold">Certified assessment</h3>
              <p className="text-muted">
                Move into a structured, assessor-led evaluation process with evidence review, findings, and formal benchmark interpretation.
              </p>
            </Card>
            <Card href="/enterprise" variant="service">
              <div className="flex gap-2.5 flex-wrap">
                <Pill>Step 3</Pill>
                <Pill>Institutional</Pill>
              </div>
              <h3 className="text-[1.12rem] font-bold">Enterprise relationship</h3>
              <p className="text-muted">
                Expand into a broader agreement that may include recurring assessments, data access, advisory support, and executive engagement.
              </p>
            </Card>
          </div>
        </Container>
      </section>

      {/* What an organization can expect */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="What an organization can expect"
            description="The process is designed to be serious, structured, and useful — not symbolic."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "Framework alignment", desc: "Your review is mapped to the benchmark framework and its dimensions." },
              { title: "Evidence review", desc: "Relevant public and submitted evidence can be incorporated into structured evaluation." },
              { title: "Findings delivery", desc: "You receive interpretation, identified gaps, and clear indications of strengths and shortfalls." },
              { title: "Next-step options", desc: "Organizations can extend into roadmap, reassessment, or broader institutional support." },
            ].map((item) => (
              <Card key={item.title}>
                <h3 className="text-[1.08rem] font-bold mb-2">{item.title}</h3>
                <p className="text-muted">{item.desc}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Includes / Does not include */}
      <section className="py-[30px]">
        <Container className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-2.5">What this process includes</h3>
            <ul className="list-disc pl-[18px] text-muted space-y-2">
              <li>Guided entry into the right benchmark path</li>
              <li>Interpretation of your public benchmark context where applicable</li>
              <li>Scoping for advisory or assessment engagement</li>
              <li>Optional movement into formal certified review</li>
              <li>Institutional next-step planning</li>
            </ul>
          </Panel>
          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-2.5">What this process does not include</h3>
            <ul className="list-disc pl-[18px] text-muted space-y-2">
              <li>Buying a higher public benchmark score</li>
              <li>Buying a better public rank</li>
              <li>Suppressing published findings</li>
              <li>Guaranteed certification approval</li>
              <li>Methodology changes tailored to a preferred outcome</li>
            </ul>
          </Panel>
        </Container>
      </section>

      {/* Typical entry points */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="Typical entry points"
            description="Most serious organizations arrive with one of a few recognizable goals."
          />
          <Panel>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">Situation</th>
                  <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">Likely need</th>
                  <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">Best entry path</th>
                  <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">Potential next step</th>
                </tr>
              </thead>
              <tbody className="text-muted">
                {[
                  ["Leadership saw a public index result", "Needs interpretation and implications", "Advisory", "Certified Assessment"],
                  ["Organization wants external review", "Needs formal structured evaluation", "Certified Assessments", "Improvement roadmap / enterprise support"],
                  ["Institution needs recurring support", "Needs broader benchmark relationship", "Enterprise", "Annual or multi-period agreement"],
                  ["Team wants to discuss options first", "Needs a scoping conversation", "Contact Sales", "Right-fit service path"],
                ].map(([situation, need, path, next]) => (
                  <tr key={situation}>
                    <td className="py-3 px-2.5 border-b border-line text-text">{situation}</td>
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

      {/* Related service cards */}
      <section className="py-[30px]">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card href="/purchase-research" variant="service">
              <div className="flex gap-2.5 flex-wrap">
                <Pill>Research</Pill>
                <Pill>Context</Pill>
              </div>
              <h3 className="text-[1.12rem] font-bold">Purchase Research</h3>
              <p className="text-muted">
                Start with a published report if your team first needs benchmark context, sector data, or comparative rankings.
              </p>
            </Card>
            <Card href="/data-licenses" variant="service">
              <div className="flex gap-2.5 flex-wrap">
                <Pill>Data</Pill>
                <Pill>Internal Analysis</Pill>
              </div>
              <h3 className="text-[1.12rem] font-bold">Data License</h3>
              <p className="text-muted">
                License benchmark datasets if your organization wants deeper internal analysis before entering a formal review process.
              </p>
            </Card>
            <Card href="/services" variant="service">
              <div className="flex gap-2.5 flex-wrap">
                <Pill>Overview</Pill>
                <Pill>Navigation</Pill>
              </div>
              <h3 className="text-[1.12rem] font-bold">All Services</h3>
              <p className="text-muted">
                Review the full benchmark service ecosystem and choose the best path for your organization.
              </p>
            </Card>
          </div>
        </Container>
      </section>

      {/* Assessment tools */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="Assessment tools"
            description="Use these structured tools to begin internal evaluation before or alongside a formal assessment."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card href="/self-assessment" variant="service">
              <div className="flex gap-2 flex-wrap"><Pill>Interactive</Pill><Pill>Free</Pill></div>
              <h3 className="text-[1.08rem] font-bold">Self-Assessment Tool</h3>
              <p className="text-muted">Complete the 40-question benchmark questionnaire across 8 dimensions with instant scoring and recommendations.</p>
            </Card>
            <Card href="/prompting-suite-for-humans" variant="service">
              <div className="flex gap-2 flex-wrap"><Pill>Licensed</Pill><Pill>Organizations</Pill></div>
              <h3 className="text-[1.08rem] font-bold">Prompting Suite for Humans</h3>
              <p className="text-muted">License structured question libraries, interview guides, and scoring tools for internal assessment and coaching.</p>
            </Card>
            <Card href="/ai-evaluation-suite" variant="service">
              <div className="flex gap-2 flex-wrap"><Pill>Technical</Pill><Pill>AI Systems</Pill></div>
              <h3 className="text-[1.08rem] font-bold">AI Evaluation Suite</h3>
              <p className="text-muted">33 test prompts with rubrics to evaluate AI system compassion across all 8 benchmark dimensions.</p>
            </Card>
          </div>
        </Container>
      </section>

      {/* Final CTA */}
      <section className="py-[30px]">
        <Container>
          <Callout>
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] mb-2">Begin your organization{"\u2019"}s benchmark pathway</h2>
            <p className="text-muted max-w-[760px] mb-[18px]">
              Start with a sales inquiry, book an advisory conversation, or move directly into a structured certified assessment process.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Button href="/contact-sales" variant="primary">Contact Sales</Button>
              <Button href="/certified-assessments">Certified Assessments</Button>
            </div>
          </Callout>
        </Container>
      </section>
    </>
  );
}
