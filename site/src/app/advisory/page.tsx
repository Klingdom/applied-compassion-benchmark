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

export const metadata: Metadata = { title: "Advisory Consulting", description: "Book private benchmark briefings, peer comparison memos, executive sessions, and strategic improvement roadmaps from Compassion Benchmark." };

export default function AdvisoryPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-[72px] pb-10">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-[18px] items-start">
            <div>
              <Eyebrow>Advisory consulting</Eyebrow>
              <h1 className="text-[clamp(2.2rem,5vw,4rem)] leading-[1.04] tracking-[-0.03em] mb-3.5">
                Interpret benchmark findings and turn them into action
              </h1>
              <p className="text-muted text-[1.08rem] max-w-[860px] mb-[22px]">
                Advisory consulting helps leaders, research teams, investors, policy groups, and organizations understand what benchmark results mean, how peer positioning should be interpreted, and what strategic, governance, or operational responses may be warranted. Advisory work is built on top of the published benchmark and does not change inclusion, score, or ranking.
              </p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <Stat value="Briefings" label="Private interpretation sessions" />
                <Stat value="Memos" label="Written peer comparison analysis" />
                <Stat value="Workshops" label="Leadership and board sessions" />
                <Stat value="Roadmaps" label="Strategic improvement guidance" />
              </div>
            </div>

            <Panel>
              <h3 className="text-[1.08rem] font-bold mb-2.5">Advisory boundary</h3>
              <p className="text-muted mb-3">
                Advisory services explain benchmark findings, compare peer positioning, and support strategy. They do not sell score changes, ranking changes, publication suppression, or preferred treatment.
              </p>
              <div className="flex gap-3 flex-wrap">
                <Button href="/contact-sales" variant="primary">Request advisory support</Button>
                <Button href="/methodology">Review methodology</Button>
              </div>
            </Panel>
          </div>
        </Container>
      </section>

      {/* Core advisory offerings */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="Core advisory offerings"
            description="Advisory consulting should be positioned as a premium interpretation and strategy layer above the public benchmark and paid research products."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { pills: ["Briefing", "Entry Point"], title: "Interpretive briefing", desc: "A private session explaining major findings, benchmark meaning, peer context, and strategic implications for a selected index or entity group.", price: "$1,500\u2013$3,500" },
              { pills: ["Memo", "Custom Analysis"], title: "Peer comparison memo", desc: "A tailored written comparison showing how a selected organization, government, lab, or sector performs relative to benchmark peers.", price: "$2,500\u2013$7,500" },
              { pills: ["Executive", "Workshop"], title: "Executive advisory session", desc: "A deeper working session for executive teams, boards, or policy leaders focused on meaning, implications, and response options.", price: "$5,000\u2013$15,000" },
              { pills: ["Strategy", "Roadmap"], title: "Improvement roadmap engagement", desc: "Structured advisory work to help leadership teams identify priority dimensions, institutional gaps, and strategic sequencing for improvement.", price: "$15,000\u2013$50,000+" },
              { pills: ["Board", "Presentation"], title: "Board or leadership briefing deck", desc: "Presentation-ready benchmark interpretation package for boards, investors, executive committees, or internal governance meetings.", price: "$7,500+" },
              { pills: ["Custom", "Inquiry"], title: "Custom advisory engagement", desc: "Custom work for institutions that need multi-index interpretation, sector-specific analysis, ongoing support, or hybrid advisory structures.", price: "Custom" },
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
            <h3 className="text-[1.08rem] font-bold mb-2.5">What advisory consulting includes</h3>
            <ul className="list-disc pl-[18px] text-muted space-y-2">
              <li><span className="text-text font-semibold">Interpretation:</span> translating benchmark results into operational, strategic, or governance meaning</li>
              <li><span className="text-text font-semibold">Comparison:</span> understanding peer position by sector, geography, category, or benchmark family</li>
              <li><span className="text-text font-semibold">Implications:</span> helping teams understand what the findings imply for reputation, governance, policy, or product choices</li>
              <li><span className="text-text font-semibold">Prioritization:</span> identifying which dimensions matter most and where improvement work should begin</li>
            </ul>
          </Panel>
          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-2.5">What advisory consulting does not include</h3>
            <ul className="list-disc pl-[18px] text-muted space-y-2">
              <li>Paid score improvement</li>
              <li>Paid rank improvement</li>
              <li>Suppression of published benchmark findings</li>
              <li>Guaranteed certification outcomes</li>
              <li>Rewriting methodology to fit a client preference</li>
            </ul>
          </Panel>
        </Container>
      </section>

      {/* Who it's for */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="Who advisory consulting is for"
            description="The advisory model should make it easy for different types of serious buyers to see clear value."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "Executive teams", desc: "Need benchmark interpretation, peer context, and strategic response options." },
              { title: "Boards and investors", desc: "Need concise interpretation of benchmark position, risk, and organizational implications." },
              { title: "Policy and research groups", desc: "Need structured explanation of comparative public-system or sector results." },
              { title: "Technology leaders", desc: "Need benchmark context for AI, robotics, governance, safety, and trust decisions." },
            ].map((item) => (
              <Card key={item.title}>
                <h3 className="text-[1.08rem] font-bold mb-2">{item.title}</h3>
                <p className="text-muted">{item.desc}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Typical advisory pathways */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="Typical advisory pathways"
            description="Advisory buyers usually enter from one of three pathways: benchmark readers, report buyers, or assessment clients."
          />
          <Panel>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">Starting point</th>
                  <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">Need</th>
                  <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">Best advisory entry</th>
                  <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">Potential next step</th>
                </tr>
              </thead>
              <tbody className="text-muted">
                {[
                  ["Public index reader", "Wants help understanding what a published ranking means", "Interpretive briefing", "Peer comparison memo"],
                  ["Research buyer", "Has purchased a report and wants strategic interpretation", "Executive advisory session", "Board briefing or roadmap"],
                  ["Institution under review", "Wants to understand gaps and possible improvement paths", "Improvement roadmap engagement", "Certified assessment"],
                  ["Enterprise client", "Needs recurring interpretation across teams or quarters", "Custom advisory engagement", "Enterprise agreement"],
                ].map(([start, need, entry, next]) => (
                  <tr key={start}>
                    <td className="py-3 px-2.5 border-b border-line text-text">{start}</td>
                    <td className="py-3 px-2.5 border-b border-line">{need}</td>
                    <td className="py-3 px-2.5 border-b border-line">{entry}</td>
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
            <h3 className="text-[1.08rem] font-bold mb-2.5">Recommended initial advisory menu</h3>
            <ul className="list-disc pl-[18px] text-muted space-y-2">
              <li>Interpretive briefing</li>
              <li>Peer comparison memo</li>
              <li>Executive advisory session</li>
              <li>Board briefing deck</li>
              <li>Improvement roadmap engagement</li>
            </ul>
          </Panel>
          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-2.5">Recommended expansion path</h3>
            <ul className="list-disc pl-[18px] text-muted space-y-2">
              <li>Quarterly retained advisory relationships</li>
              <li>Sector-specific workshops</li>
              <li>Multi-index strategic reviews</li>
              <li>Leadership offsite support</li>
              <li>Custom benchmark intelligence programs</li>
            </ul>
          </Panel>
        </Container>
      </section>

      {/* Related services */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="Relationship to other services"
            description="Advisory consulting is one layer in the broader benchmark services ecosystem."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <h3 className="text-[1.08rem] font-bold mb-2">Purchase Research</h3>
              <p className="text-muted">Best for buyers who need report deliverables, PDF packaging, and benchmark publications.</p>
            </Card>
            <Card>
              <h3 className="text-[1.08rem] font-bold mb-2">Certified Assessments</h3>
              <p className="text-muted">Best for organizations seeking structured formal review under an assessor-led process.</p>
            </Card>
            <Card>
              <h3 className="text-[1.08rem] font-bold mb-2">Enterprise Agreements</h3>
              <p className="text-muted">Best for recurring institutions that need ongoing benchmark access, analysis, and strategic support.</p>
            </Card>
          </div>
        </Container>
      </section>

      {/* Principles + Buyer language */}
      <section className="py-[30px]">
        <Container className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-2.5">Advisory principles</h3>
            <ul className="list-disc pl-[18px] text-muted space-y-2">
              <li>Benchmark independence comes first</li>
              <li>Advisory work interprets results rather than changing them</li>
              <li>Recommendations remain grounded in the published methodology</li>
              <li>Peer comparison work uses benchmark evidence and structured logic</li>
              <li>Institutional credibility is preserved by keeping advisory distinct from scoring decisions</li>
            </ul>
          </Panel>
          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-2.5">Suggested buyer language</h3>
            <ul className="list-disc pl-[18px] text-muted space-y-2">
              <li>{"\u201C"}Help us understand what this benchmark result means.{"\u201D"}</li>
              <li>{"\u201C"}Compare us to our closest peers.{"\u201D"}</li>
              <li>{"\u201C"}Prepare a briefing for our executive team.{"\u201D"}</li>
              <li>{"\u201C"}Translate the findings into a priority roadmap.{"\u201D"}</li>
              <li>{"\u201C"}Support our board with a benchmark interpretation session.{"\u201D"}</li>
            </ul>
          </Panel>
        </Container>
      </section>

      {/* Final CTA */}
      <section className="py-[30px]">
        <Container>
          <Callout>
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] mb-2">Request advisory support</h2>
            <p className="text-muted max-w-[760px] mb-[18px]">
              Book an interpretive session, request a peer comparison memo, or scope a deeper strategic engagement.
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
