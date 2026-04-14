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

export const metadata: Metadata = { title: "Enterprise Agreements", description: "Combine benchmark research access, data licensing, advisory support, and certified assessments into a recurring enterprise relationship." };

export default function EnterprisePage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-[72px] pb-10">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-[18px] items-start">
            <div>
              <Eyebrow>Enterprise agreements</Eyebrow>
              <h1 className="text-[clamp(2.2rem,5vw,4rem)] leading-[1.04] tracking-[-0.03em] mb-3.5">
                Institutional benchmark access and strategic support for serious organizations
              </h1>
              <p className="text-muted text-[1.08rem] max-w-[860px] mb-[22px]">
                Enterprise agreements are designed for institutions that need more than a single report or one-time engagement. These agreements can combine benchmark research access, data licensing, advisory consulting, certified assessments, executive briefings, and recurring support into a unified institutional relationship.
              </p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <Stat value="Access" label="Multi-user benchmark rights" />
                <Stat value="Support" label="Recurring advisory and review" />
                <Stat value="Licensing" label="Institutional data and usage terms" />
                <Stat value="Continuity" label="Annual and multi-period agreements" />
              </div>
            </div>
            <Panel>
              <h3 className="text-[1.08rem] font-bold mb-2.5">Enterprise boundary</h3>
              <p className="text-muted mb-3">
                Enterprise agreements provide broader access, recurring support, and tailored institutional terms. They do not purchase ranking changes, score changes, publication suppression, or preferred inclusion in public indexes.
              </p>
              <div className="flex gap-3 flex-wrap">
                <Button href="/contact-sales" variant="primary">Request enterprise discussion</Button>
                <Button href="/services">View all services</Button>
              </div>
            </Panel>
          </div>
        </Container>
      </section>

      {/* Agreement types */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="Enterprise agreement types"
            description="Enterprise agreements should give buyers a clear sense of the main institutional relationship models available."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { pills: ["Access", "Annual"], title: "Research access agreement", desc: "Annual institutional access to benchmark reports, annual bundles, and selected benchmark publications across the published index families.", price: "$10,000\u2013$25,000+" },
              { pills: ["Data", "Internal Use"], title: "Data and insights agreement", desc: "Institutional benchmark data licensing combined with rights for internal analysis, planning, intelligence, and reporting workflows.", price: "$25,000\u2013$75,000+" },
              { pills: ["Advisory", "Recurring"], title: "Strategic advisory agreement", desc: "Ongoing advisory support including briefings, leadership sessions, interpretation, peer comparison work, and benchmark-informed strategic guidance.", price: "$25,000\u2013$100,000+" },
              { pills: ["Assessment", "Formal Review"], title: "Assessment program agreement", desc: "Structured multi-period assessment support for organizations that need formal evaluation, recurring reassessment, or multi-unit review.", price: "$30,000\u2013$150,000+" },
              { pills: ["Enterprise", "Integrated"], title: "Integrated benchmark partnership", desc: "Combined institutional relationship spanning research access, data rights, advisory support, assessment services, and executive engagement.", price: "$50,000\u2013$250,000+" },
              { pills: ["Custom", "Institutional"], title: "Custom enterprise agreement", desc: "Tailored terms for governments, global institutions, investors, universities, research centers, or multi-division enterprise clients.", price: "Custom" },
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
            <h3 className="text-[1.08rem] font-bold mb-2.5">What enterprise agreements can include</h3>
            <ul className="list-disc pl-[18px] text-muted space-y-2">
              <li><span className="text-text font-semibold">Institutional research access:</span> annual access to benchmark reports and index families</li>
              <li><span className="text-text font-semibold">Structured data rights:</span> internal licensing for benchmark datasets and related assets</li>
              <li><span className="text-text font-semibold">Recurring advisory:</span> executive briefings, strategy sessions, peer analysis, and leadership support</li>
              <li><span className="text-text font-semibold">Assessment services:</span> formal reviews, reassessments, and multi-unit evaluation programs</li>
              <li><span className="text-text font-semibold">Executive delivery:</span> board-ready briefings, custom memos, and presentation support</li>
            </ul>
          </Panel>
          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-2.5">What enterprise agreements do not include</h3>
            <ul className="list-disc pl-[18px] text-muted space-y-2">
              <li>Guaranteed score improvement</li>
              <li>Guaranteed public ranking improvement</li>
              <li>Suppression of public benchmark findings</li>
              <li>Paid inclusion in benchmark indexes</li>
              <li>Methodology changes designed around a client{"\u2019"}s preferred outcome</li>
            </ul>
          </Panel>
        </Container>
      </section>

      {/* Common use cases */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="Common enterprise use cases"
            description="Enterprise buyers typically need continuity, internal coordination, and a broader institutional arrangement."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "Large companies", desc: "Need annual benchmark access, leadership briefings, peer comparisons, and structured improvement support." },
              { title: "Governments and public bodies", desc: "Need multi-stakeholder benchmark analysis, comparative policy review, and formal evaluation support." },
              { title: "Technology organizations", desc: "Need benchmark intelligence across AI, robotics, governance, safety, and institutional trust." },
              { title: "Universities and research centers", desc: "Need institution-wide access to benchmark materials, data, and structured comparative analysis." },
            ].map((item) => (
              <Card key={item.title}>
                <h3 className="text-[1.08rem] font-bold mb-2">{item.title}</h3>
                <p className="text-muted">{item.desc}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* How structured */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="How enterprise agreements are structured"
            description="Enterprise relationships should feel organized, credible, and scalable for both sides."
          />
          <Panel>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">Component</th>
                  <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">Description</th>
                  <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">Typical role in agreement</th>
                </tr>
              </thead>
              <tbody className="text-muted">
                {[
                  ["Access rights", "Who inside the institution can access reports, data, and benchmark materials", "Core baseline"],
                  ["Service mix", "Which services are included: research, data, advisory, assessments, briefings", "Customizable scope"],
                  ["Cadence", "Annual, quarterly, or multi-period delivery and support schedule", "Operational structure"],
                  ["Governance", "How requests, reviews, and strategic sessions are handled across the engagement", "Relationship quality"],
                  ["License terms", "Internal use, team use, enterprise-wide use, or research-limited usage rights", "Rights management"],
                  ["Executive delivery", "Leadership briefings, board updates, strategic memos, or workshop sessions", "High-value add-on"],
                ].map(([component, description, role]) => (
                  <tr key={component}>
                    <td className="py-3 px-2.5 border-b border-line text-text">{component}</td>
                    <td className="py-3 px-2.5 border-b border-line">{description}</td>
                    <td className="py-3 px-2.5 border-b border-line">{role}</td>
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
            <h3 className="text-[1.08rem] font-bold mb-2.5">Recommended initial enterprise menu</h3>
            <ul className="list-disc pl-[18px] text-muted space-y-2">
              <li>Research access agreement</li>
              <li>Data and insights agreement</li>
              <li>Strategic advisory agreement</li>
              <li>Assessment program agreement</li>
              <li>Integrated benchmark partnership</li>
            </ul>
          </Panel>
          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-2.5">Recommended expansion path</h3>
            <ul className="list-disc pl-[18px] text-muted space-y-2">
              <li>Quarterly benchmark intelligence retainers</li>
              <li>Multi-division assessment programs</li>
              <li>Cross-sector custom benchmark studies</li>
              <li>Leadership offsite support and recurring workshops</li>
              <li>Embedded benchmark data and API access</li>
            </ul>
          </Panel>
        </Container>
      </section>

      {/* Buyer pathways */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="Enterprise buyer pathways"
            description="Most enterprise clients arrive through one of a few recognizable paths."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <h3 className="text-[1.08rem] font-bold mb-2">Research-led</h3>
              <p className="text-muted">Starts with reports or public rankings and expands into broader institutional access.</p>
            </Card>
            <Card>
              <h3 className="text-[1.08rem] font-bold mb-2">Assessment-led</h3>
              <p className="text-muted">Begins with a formal review and evolves into recurring support, reassessment, and governance work.</p>
            </Card>
            <Card>
              <h3 className="text-[1.08rem] font-bold mb-2">Data-led</h3>
              <p className="text-muted">Begins with structured data needs and expands into advisory, licensing, and leadership interpretation.</p>
            </Card>
          </div>
        </Container>
      </section>

      {/* Principles + Buyer language */}
      <section className="py-[30px]">
        <Container className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-2.5">Enterprise principles</h3>
            <ul className="list-disc pl-[18px] text-muted space-y-2">
              <li>Institutional convenience should increase without compromising benchmark independence</li>
              <li>Enterprise support must remain clearly distinct from public scoring decisions</li>
              <li>Rights, scope, and support levels should be legible and contractible</li>
              <li>Recurring clients should receive structured service, not vague promises</li>
              <li>Large agreements should strengthen quality, not weaken credibility</li>
            </ul>
          </Panel>
          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-2.5">Buyer language this page should support</h3>
            <ul className="list-disc pl-[18px] text-muted space-y-2">
              <li>{"\u201C"}We want recurring access for our whole team.{"\u201D"}</li>
              <li>{"\u201C"}We need more than a report; we need a relationship.{"\u201D"}</li>
              <li>{"\u201C"}We want data, briefings, and strategic support together.{"\u201D"}</li>
              <li>{"\u201C"}We need a multi-unit or multi-period agreement.{"\u201D"}</li>
              <li>{"\u201C"}We want benchmark access at enterprise scale.{"\u201D"}</li>
            </ul>
          </Panel>
        </Container>
      </section>

      {/* Related services */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="Relationship to other services"
            description="Enterprise agreements unify the benchmark services stack at institutional scale."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <h3 className="text-[1.08rem] font-bold mb-2">Purchase Research</h3>
              <p className="text-muted">Best for individual reports and standalone benchmark publications.</p>
            </Card>
            <Card>
              <h3 className="text-[1.08rem] font-bold mb-2">Data Licenses</h3>
              <p className="text-muted">Best for structured data access and defined benchmark usage rights.</p>
            </Card>
            <Card>
              <h3 className="text-[1.08rem] font-bold mb-2">Advisory</h3>
              <p className="text-muted">Best for interpretation, executive briefings, and strategy work.</p>
            </Card>
            <Card>
              <h3 className="text-[1.08rem] font-bold mb-2">Certified Assessments</h3>
              <p className="text-muted">Best for formal structured reviews and deeper evaluator-led engagement.</p>
            </Card>
          </div>
        </Container>
      </section>

      {/* Final CTA */}
      <section className="py-[30px]">
        <Container>
          <Callout>
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] mb-2">Discuss an enterprise agreement</h2>
            <p className="text-muted max-w-[760px] mb-[18px]">
              Build a recurring institutional relationship around research access, data licensing, advisory support, and formal benchmark review.
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
