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
import { GUMROAD } from "@/data/gumroad";

export const metadata: Metadata = { title: "Indexes", description: "Explore published Compassion Benchmark rankings across 780+ entities including countries, U.S. states, Fortune 500, AI labs, and robotics labs." };

export default function IndexesPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-[72px] pb-10">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-[1.08fr_0.92fr] gap-[18px] items-start">
            <div>
              <Eyebrow>Published benchmark indexes</Eyebrow>
              <h1 className="text-[clamp(2.25rem,5vw,4.2rem)] leading-[1.03] tracking-[-0.04em] max-w-[900px] mb-3.5">
                Explore benchmark rankings across governments, corporations, AI, and robotics
              </h1>
              <p className="text-muted text-[1.08rem] max-w-[860px] mb-[22px]">
                The indexes are the public-facing core of the Compassion Benchmark platform. They make institutional behavior legible across sectors and give researchers, leaders, boards, journalists, and policy teams a comparative starting point for deeper analysis.
              </p>
              <div className="flex gap-3 flex-wrap mt-1">
                <Button href="/countries" variant="primary">View Countries Index</Button>
                <Button href={GUMROAD.countriesIndex} external>Buy First Published Report</Button>
                <Button href="/data-licenses">Data Licensing</Button>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
                <Stat value="5" label="Published index families" />
                <Stat value="780" label="Entities benchmarked" />
                <Stat value="2026" label="Current publication cycle" />
                <Stat value="Public + Premium" label="Free rankings with paid formats and services" />
              </div>
            </div>

            <Panel>
              <h3 className="text-[1.08rem] font-bold mb-2.5">How to use the indexes</h3>
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">Need</th>
                    <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">Best path</th>
                  </tr>
                </thead>
                <tbody className="text-muted">
                  {[
                    ["Browse rankings", "Use the public index pages"],
                    ["Buy the first published report", "Purchase the Countries Index PDF"],
                    ["License structured data", "Go to Data License"],
                    ["Interpret results", "Go to Advisory"],
                    ["Request formal review", "Go to Certified Assessments"],
                  ].map(([need, path]) => (
                    <tr key={need}>
                      <td className="py-3 px-2.5 border-b border-line text-text">{need}</td>
                      <td className="py-3 px-2.5 border-b border-line">{path}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-muted mt-3">
                Public index inclusion is independent. Paid services are built around access, packaging, interpretation, licensing, and institutional support.
              </p>
            </Panel>
          </div>
        </Container>
      </section>

      {/* Featured launch */}
      <section className="py-[30px]">
        <Container>
          <Card variant="featured">
            <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-[18px] items-start">
              <div>
                <Eyebrow>Now available</Eyebrow>
                <h2 className="text-[clamp(1.55rem,3vw,2.15rem)] tracking-[-0.03em] mb-2.5">
                  The first published Compassion Benchmark research report is live
                </h2>
                <p className="text-muted mb-3.5">
                  The <span className="text-text font-bold">2026 Countries Compassion Benchmark Index</span> is now available for direct purchase as the first published flagship digital report from Compassion Benchmark.
                </p>
                <p className="text-muted mb-3.5">
                  This Individual Research License edition goes beyond the public countries page and includes the complete benchmark PDF with full rankings, methodology, key findings, regional analysis, highest-performer themes, and structural concerns shaping the lowest-performing countries.
                </p>
                <ul className="list-disc pl-[18px] text-muted space-y-2 mb-4">
                  <li>Complete 2026 countries benchmark report</li>
                  <li>Individual Research License digital edition</li>
                  <li>Full rankings, findings, and interpretive analysis</li>
                  <li>Instant online purchase and delivery through Gumroad</li>
                </ul>
                <div className="flex gap-3 flex-wrap">
                  <Button href={GUMROAD.countriesIndex} variant="primary" external>Purchase the 2026 Countries Index</Button>
                  <Button href="/countries">Preview the Countries Index</Button>
                </div>
              </div>
              <div className="bg-[rgba(7,17,31,0.46)] border border-[rgba(125,211,252,0.18)] rounded-[22px] p-[22px]">
                <Eyebrow>Individual Research License</Eyebrow>
                <h3 className="text-[1.15rem] font-bold mb-2">2026 Countries Compassion Benchmark Index</h3>
                <p className="text-[2rem] font-extrabold leading-none mb-2">$195</p>
                <p className="text-muted text-[0.94rem] mb-3.5">Single-user digital research report</p>
                <ul className="list-disc pl-[18px] text-muted space-y-2 mb-4">
                  <li>Designed for researchers, journalists, students, and policy professionals</li>
                  <li>Immediate digital access after purchase</li>
                  <li>Personal research use</li>
                  <li>No redistribution or resale</li>
                </ul>
                <Button href={GUMROAD.countriesIndex} variant="primary" external>Buy on Gumroad</Button>
              </div>
            </div>
          </Card>
        </Container>
      </section>

      {/* Public benchmark first */}
      <section className="py-[30px]">
        <Container>
          <Callout>
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] mb-2">Public benchmark first. Premium depth when needed.</h2>
            <p className="text-muted max-w-[950px]">
              Every index page is designed to stand on its own as a public benchmark publication. Organizations that need more can purchase premium reports, license benchmark data, request interpretive support, or engage in structured assessment and enterprise relationships. The first of these premium report products is now live: the 2026 Countries Compassion Benchmark Index.
            </p>
          </Callout>
        </Container>
      </section>

      {/* Current indexes */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="Current indexes"
            description="The benchmark currently publishes five major index families. Each one can function as a public research product, a premium report, a data product, and a basis for advisory or enterprise work."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card href="/countries" variant="featured">
              <div className="flex gap-2.5 flex-wrap mb-3">
                <Pill>2026</Pill>
                <Pill>Governments</Pill>
                <Pill>First Published Report</Pill>
              </div>
              <h3 className="text-[1.08rem] font-bold mb-2">Countries Index</h3>
              <p className="text-muted">Global benchmark of countries and territories using the full public institutional compassion framework.</p>
            </Card>
            {[
              { href: "/us-states", pills: ["2026", "Public Systems"], title: "U.S. States Index", desc: "Comparative benchmark across all 50 states and the District of Columbia." },
              { href: "/fortune-500", pills: ["2026", "Corporations"], title: "Fortune 500 Index", desc: "Comparative benchmark of major corporations using public evidence, governance patterns, and institutional behavior." },
              { href: "/ai-labs", pills: ["2026", "AI"], title: "AI Labs Index", desc: "Benchmark of leading AI labs across accountability, safety posture, deployment boundaries, equity, and integrity." },
              { href: "/robotics-labs", pills: ["2026", "Robotics"], title: "Humanoid Robotics Labs Index", desc: "Benchmark of global humanoid robotics labs across labor, healthcare, accessibility, governance, and deployment risk." },
              { href: "/assess-your-organization", pills: ["Assessment", "Entry Point"], title: "Assess Your Organization", desc: "Entry point for organizations that want to move from public benchmark visibility into structured self-review or formal assessment work." },
            ].map((item) => (
              <Card key={item.href} href={item.href}>
                <div className="flex gap-2.5 flex-wrap mb-3">
                  {item.pills.map((p) => <Pill key={p}>{p}</Pill>)}
                </div>
                <h3 className="text-[1.08rem] font-bold mb-2">{item.title}</h3>
                <p className="text-muted">{item.desc}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Monetization + Independence */}
      <section className="py-[30px]">
        <Container className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-2.5">Monetization model for the indexes</h3>
            <ul className="list-disc pl-[18px] text-muted space-y-2">
              <li><span className="text-text font-bold">Public benchmark pages:</span> freely accessible rankings and findings</li>
              <li><span className="text-text font-bold">Premium reports:</span> professional PDF and bundled benchmark products</li>
              <li><span className="text-text font-bold">Data licensing:</span> structured datasets and usage rights</li>
              <li><span className="text-text font-bold">Advisory:</span> interpretation, peer comparison, and strategic guidance</li>
              <li><span className="text-text font-bold">Certified assessments:</span> formal review services</li>
              <li><span className="text-text font-bold">Enterprise agreements:</span> recurring institutional relationships</li>
            </ul>
          </Panel>
          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-2.5">Independence policy</h3>
            <ul className="list-disc pl-[18px] text-muted space-y-2">
              <li>Entities do not pay to be included in indexes</li>
              <li>Entities do not pay to improve a score or rank</li>
              <li>Public index publication is independent of commercial services</li>
              <li>Paid offerings support access, analysis, review, and institutional use</li>
              <li>The benchmark is designed to be difficult to game</li>
            </ul>
          </Panel>
        </Container>
      </section>

      {/* Turn index traffic into revenue */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="Turn index traffic into revenue"
            description="The indexes page should do more than list publications. It should also show visitors the next step that matches their need."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { href: "${GUMROAD.countriesIndex}", external: true, pills: ["Featured Product", "Direct Purchase"], title: "Buy the 2026 Countries Index", desc: "Purchase the first published Compassion Benchmark digital report directly as an Individual Research License edition." },
              { href: "/purchase-research", external: false, pills: ["Reports", "Catalog"], title: "Purchase Research", desc: "Browse benchmark reports by year and target area, including premium PDF formats, appendices, and bundled publications." },
              { href: "/data-licenses", external: false, pills: ["Data", "Licensing"], title: "License Benchmark Data", desc: "Access structured benchmark datasets for internal analysis, research workflows, and institutional intelligence use." },
              { href: "/advisory", external: false, pills: ["Advisory", "Interpretation"], title: "Book Advisory Support", desc: "Translate benchmark findings into peer comparison, strategic interpretation, executive discussion, and action priorities." },
              { href: "/certified-assessments", external: false, pills: ["Assessment", "Formal Review"], title: "Request a Certified Assessment", desc: "Move from public benchmark visibility into a structured, assessor-led review process with findings and next steps." },
              { href: "/enterprise", external: false, pills: ["Enterprise", "Institutional"], title: "Explore Enterprise Access", desc: "Combine reports, data, advisory, and recurring support into a broader enterprise benchmark relationship." },
            ].map((item) => (
              <Card key={item.title} href={item.href} variant="service">
                <div className="flex gap-2.5 flex-wrap">
                  {item.pills.map((p) => <Pill key={p}>{p}</Pill>)}
                </div>
                <h3 className="text-[1.12rem] font-bold">{item.title}</h3>
                <p className="text-muted">{item.desc}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Index buyer paths */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="Index buyer paths"
            description="Different visitors arrive at the indexes for different reasons. This page should make those paths legible."
          />
          <Panel>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">Visitor type</th>
                  <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">Likely need</th>
                  <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">Best next step</th>
                  <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">Revenue path</th>
                </tr>
              </thead>
              <tbody className="text-muted">
                {[
                  ["Researcher / Journalist", "Public rankings, context, comparative storylines", "Open countries index or buy the PDF report", "Direct report purchase"],
                  ["Executive / Board member", "Peer position and implications", "Advisory", "Briefing or memo"],
                  ["Institutional analyst", "Structured use of benchmark data", "Data License", "Data licensing"],
                  ["Organization being evaluated", "Understand standing and improvement options", "Assess Your Organization", "Assessment / advisory"],
                  ["Large institutional buyer", "Recurring access across services", "Enterprise", "Enterprise agreement"],
                ].map(([visitor, need, step, revenue]) => (
                  <tr key={visitor}>
                    <td className="py-3 px-2.5 border-b border-line text-text">{visitor}</td>
                    <td className="py-3 px-2.5 border-b border-line">{need}</td>
                    <td className="py-3 px-2.5 border-b border-line">{step}</td>
                    <td className="py-3 px-2.5 border-b border-line">{revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </Container>
      </section>

      {/* CTAs + Ecosystem */}
      <section className="py-[30px]">
        <Container className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-2.5">Recommended calls to action from index pages</h3>
            <ul className="list-disc pl-[18px] text-muted space-y-2">
              <li>Buy this report as a PDF</li>
              <li>License the benchmark dataset</li>
              <li>Book an interpretive briefing</li>
              <li>Request a certified assessment</li>
              <li>Discuss enterprise access</li>
            </ul>
          </Panel>
          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-2.5">Index ecosystem pages</h3>
            <ul className="list-disc pl-[18px] text-muted space-y-2">
              <li><a href="/methodology" className="hover:text-text">Methodology</a></li>
              <li><a href="/research" className="hover:text-text">Research</a></li>
              <li><a href="/purchase-research" className="hover:text-text">Purchase Research</a></li>
              <li><a href="/data-licenses" className="hover:text-text">Data Licenses</a></li>
              <li><a href="/advisory" className="hover:text-text">Advisory</a></li>
              <li><a href="/certified-assessments" className="hover:text-text">Certified Assessments</a></li>
              <li><a href="/enterprise" className="hover:text-text">Enterprise</a></li>
              <li><a href="/contact-sales" className="hover:text-text">Contact Sales</a></li>
            </ul>
          </Panel>
        </Container>
      </section>
    </>
  );
}
