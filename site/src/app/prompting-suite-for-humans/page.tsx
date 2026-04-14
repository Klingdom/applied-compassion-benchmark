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

export const metadata: Metadata = { title: "Compassion Benchmark Standard Prompting Suite for Humans", description: "License the 40-question assessment suite to evaluate compassionate behavior in people and organizations across all 8 benchmark dimensions." };

export default function PromptingSuiteForHumansPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-[72px] pb-10">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-[1.08fr_0.92fr] gap-[18px] items-start">
            <div>
              <Eyebrow>Assessment product &middot; people and organizations</Eyebrow>
              <h1 className="text-[clamp(2.25rem,5vw,4rem)] leading-[1.03] tracking-[-0.03em] mb-3.5">
                Compassion Benchmark Standard Prompting Suite for Humans
              </h1>
              <p className="text-muted text-[1.08rem] max-w-[860px] mb-[22px]">
                License the standard question libraries, interview guides, reflection prompts, and scoring tools needed to assess compassionate behavior in people and organizations. Built for leadership teams, culture and people teams, assessors, coaches, consultants, nonprofits, public institutions, and enterprises that want a structured way to surface real behavior instead of polished intentions.
              </p>

              <div className="flex gap-3 flex-wrap mt-2">
                <Button href="/contact-sales" variant="primary">License the Suite</Button>
                <Button href="mailto:info@compassionbenchmark.com?subject=Compassion%20Benchmark%20Human%20Prompting%20Suite%20Inquiry" external>Email Product Inquiry</Button>
                <Button href="/methodology">Read Methodology</Button>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
                <Stat value="40 questions" label="Full human and organization suite" />
                <Stat value="8 dimensions" label="Benchmark-wide coverage" />
                <Stat value="2 modes" label="Self-Serve and Interview Editions" />
                <Stat value="Train or assess" label="Use for internal review or structured evaluation" />
              </div>
            </div>

            <Panel>
              <h3 className="text-[1.08rem] font-bold mb-2.5">What this product is</h3>
              <p className="text-muted mb-3">
                This is the human and organization implementation layer of the benchmark standard. It turns the published question suite into a usable product for internal diagnostics, leadership review, team development, assessor workflows, and structured pre-assessment work.
              </p>
              <p className="text-muted">
                The public publication establishes the standard. The paid suite makes it operational inside real organizations.
              </p>
            </Panel>
          </div>
        </Container>
      </section>

      {/* What the suite measures */}
      <section className="py-[30px]">
        <Container>
          <Callout>
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] mb-2">What the suite measures</h2>
            <p className="text-muted max-w-[920px]">
              The suite is designed to surface actual behavior rather than values language. It asks for examples, outcomes, names, practices, and evidence — not aspirations, commitments, or brand statements. In practical terms, it tests whether a person or organization can answer hard compassion questions specifically, honestly, and concretely, instead of abstractly.
            </p>
          </Callout>
        </Container>
      </section>

      {/* Who this is for */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="Who this is for"
            description="The suite is built for organizations and practitioners who want serious reflection, structured interviews, and evidence-based self-assessment rather than generic culture surveys."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "Leadership teams", desc: "Use the suite to examine leadership behavior, values modeling, and gaps between rhetoric and reality." },
              { title: "People & culture teams", desc: "Use it for structured internal reflection, cultural diagnostics, and accountability conversations." },
              { title: "Assessors and consultants", desc: "Use it as a structured interview and scoring instrument in organizational review work." },
              { title: "Institutions preparing for review", desc: "Use it to prepare for formal benchmark assessment or to identify internal gaps before external scrutiny." },
            ].map((item) => (
              <Card key={item.title}>
                <h3 className="text-[1.08rem] font-bold mb-2">{item.title}</h3>
                <p className="text-muted">{item.desc}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* How the standard works / Why teams buy */}
      <section className="py-[30px]">
        <Container className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-2.5">How the standard works</h3>
            <p className="text-muted mb-3">
              The suite contains 40 questions across the benchmark{"'"}s 8 dimensions. Each question exists in two forms: a Self-Serve version for independent completion and an Interview Version with interviewer notes for structured assessment conversations.
            </p>
            <p className="text-muted">
              The scoring logic emphasizes observable evidence: specific examples, named practices, measurable outcomes, and concrete organizational behavior. Generic values language without examples should score low.
            </p>
          </Panel>

          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-2.5">Why teams buy the commercial suite</h3>
            <p className="text-muted">
              The open publication is useful as a standard. The commercial suite is useful as a workflow product. It gives teams packaged implementation assets, usable scoring tools, rollout-ready formats, versioned updates, and commercial rights for internal deployment.
            </p>
          </Panel>
        </Container>
      </section>

      {/* What is included */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="What is included"
            description="The commercial product should feel like an assessment system, not just a PDF."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "Standard question library", desc: "Full 40-question suite in polished and working formats." },
              { title: "Self-Serve edition", desc: "Independent completion format for individuals, leaders, teams, or organizations." },
              { title: "Interview edition", desc: "Structured interviewer version with interviewer notes and deeper probing guidance." },
              { title: "Reflection prompts", desc: "Prompts designed to push past surface answers into more honest responses." },
              { title: "Behavioral scoring rubrics", desc: "Anchored 1.0\u20135.0 scoring guidance for each question and dimension." },
              { title: "Implementation worksheets", desc: "Ready-to-use score sheets and structured rollout materials for teams and facilitators." },
            ].map((item) => (
              <Card key={item.title}>
                <h3 className="text-[1.08rem] font-bold mb-2">{item.title}</h3>
                <p className="text-muted">{item.desc}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Use cases */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="Use cases"
            description="This suite can be used for leadership reflection, internal diagnostics, culture work, readiness review, and structured external assessment support."
          />
          <Panel>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">Use case</th>
                  <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">How the suite helps</th>
                </tr>
              </thead>
              <tbody className="text-muted">
                {[
                  ["Leadership review", "Surface whether senior leaders actually model the values they ask others to live."],
                  ["Organizational self-assessment", "Run a structured internal reflection process before entering formal review or certification pathways."],
                  ["Culture diagnostics", "Move beyond engagement language into specific behavioral questions about harm, repair, accountability, and integrity."],
                  ["Facilitated interviews", "Give assessors, consultants, or coaches a common structure for serious interviews and scoring discipline."],
                  ["Assessment readiness", "Help organizations identify where they lack specific evidence, examples, or mature operating practices."],
                ].map(([useCase, help]) => (
                  <tr key={useCase}>
                    <td className="py-3 px-2.5 border-b border-line text-text">{useCase}</td>
                    <td className="py-3 px-2.5 border-b border-line">{help}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </Container>
      </section>

      {/* Pricing */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="Pricing"
            description="Price the product like a real organizational assessment and facilitation asset, not like a workbook."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Practitioner */}
            <Card variant="service">
              <div className="flex gap-2.5 flex-wrap">
                <Pill>Practitioner</Pill>
                <Pill>Single org or consultant</Pill>
              </div>
              <h3 className="text-[1.12rem] font-bold">Practitioner License</h3>
              <p className="text-[2rem] font-extrabold tracking-[-0.03em]">$3,500</p>
              <p className="text-muted">Best for a single consultant, coach, nonprofit leader, or one internal organizational pilot.</p>
              <ul className="list-disc pl-[18px] text-muted space-y-2">
                <li>Human prompting suite package</li>
                <li>Self-Serve and Interview Editions</li>
                <li>Scoring worksheet</li>
                <li>PDF + spreadsheet delivery</li>
                <li>Internal use for one organization or one practitioner</li>
              </ul>
              <Button href="/contact-sales" variant="primary" full>Buy Practitioner</Button>
            </Card>

            {/* Team — featured */}
            <Card variant="featured">
              <div className="flex gap-2.5 flex-wrap">
                <Pill>Team</Pill>
                <Pill>Most popular</Pill>
              </div>
              <h3 className="text-[1.12rem] font-bold">Team / Internal Rollout License</h3>
              <p className="text-[2rem] font-extrabold tracking-[-0.03em]">$9,500<span className="text-[0.92rem] font-medium text-muted"> / year</span></p>
              <p className="text-muted">Best for internal people teams, leadership orgs, HR, culture, ethics, or improvement teams.</p>
              <ul className="list-disc pl-[18px] text-muted space-y-2">
                <li>Everything in Practitioner</li>
                <li>Multi-user internal deployment</li>
                <li>Facilitator and evaluator pack</li>
                <li>Versioned annual updates</li>
                <li>Implementation call included</li>
              </ul>
              <Button href="/contact-sales" variant="primary" full>Buy Team License</Button>
            </Card>

            {/* Enterprise */}
            <Card variant="service">
              <div className="flex gap-2.5 flex-wrap">
                <Pill>Enterprise</Pill>
                <Pill>Assessor rights</Pill>
              </div>
              <h3 className="text-[1.12rem] font-bold">Enterprise / Assessor License</h3>
              <p className="text-[2rem] font-extrabold tracking-[-0.03em]">Starting at $28,000<span className="text-[0.92rem] font-medium text-muted"> / year</span></p>
              <p className="text-muted">Best for large enterprises, consulting firms, assessor networks, or multi-entity use.</p>
              <ul className="list-disc pl-[18px] text-muted space-y-2">
                <li>Everything in Team</li>
                <li>Multi-entity internal use</li>
                <li>Broader facilitation rights</li>
                <li>Priority updates</li>
                <li>Advisory and calibration support options</li>
              </ul>
              <Button href="/contact-sales" variant="primary" full>Talk to Sales</Button>
            </Card>
          </div>
        </Container>
      </section>

      {/* Buyers receive / What this is not */}
      <section className="py-[30px]">
        <Container className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-2.5">What buyers receive</h3>
            <ul className="list-disc pl-[18px] text-muted space-y-2">
              <li>Named product license</li>
              <li>Question suite in polished and working formats</li>
              <li>Self-Serve and Interview mode materials</li>
              <li>Scoring tools for internal or facilitated use</li>
              <li>Commercial terms appropriate to the buyer tier</li>
            </ul>
          </Panel>

          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-2.5">What this product is not</h3>
            <ul className="list-disc pl-[18px] text-muted space-y-2">
              <li>Not a generic employee survey</li>
              <li>Not a substitute for full formal assessment</li>
              <li>Not a certification by itself</li>
              <li>Not a branding exercise</li>
              <li>Not a way to bypass evidence-based review</li>
            </ul>
          </Panel>
        </Container>
      </section>

      {/* Related links */}
      <section className="py-[30px]">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card href="/assess-your-organization">
              <h3 className="text-[1.08rem] font-bold mb-2">Apply it to your organization</h3>
              <p className="text-muted">Use the suite as a bridge into more serious organizational review and structured benchmark work.</p>
            </Card>
            <Card href="/methodology">
              <h3 className="text-[1.08rem] font-bold mb-2">Read the benchmark methodology</h3>
              <p className="text-muted">Understand the framework logic behind the suite and the broader scoring model.</p>
            </Card>
            <Card href="/certified-assessments">
              <h3 className="text-[1.08rem] font-bold mb-2">Move into formal review</h3>
              <p className="text-muted">Use the suite as preparation, then progress into a more formal certified assessment pathway.</p>
            </Card>
          </div>
        </Container>
      </section>

      {/* Final CTA */}
      <section className="py-[30px]">
        <Container>
          <Callout>
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] mb-2">Turn a public standard into a real organizational practice</h2>
            <p className="text-muted max-w-[920px] mb-[18px]">
              The standard prompting suite gives leaders, teams, and assessors a structured way to surface how compassion actually operates inside people and organizations. License the suite, deploy it internally, and use it to support honesty, accountability, and better institutional behavior.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Button href="/contact-sales" variant="primary">License the Suite</Button>
              <Button href="mailto:info@compassionbenchmark.com?subject=Compassion%20Benchmark%20Human%20Prompting%20Suite%20Inquiry" external>Email Inquiry</Button>
            </div>
          </Callout>
        </Container>
      </section>
    </>
  );
}
