import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import Stat from "@/components/ui/Stat";
import Panel from "@/components/ui/Panel";
import Card from "@/components/ui/Card";
import Pill from "@/components/ui/Pill";
import SectionHead from "@/components/ui/SectionHead";

export const metadata: Metadata = { title: "Research", description: "Explore the Compassion Benchmark research program: published index reports, sector analysis, and future longitudinal benchmark studies." };

export default function ResearchPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-[72px] pb-10">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6 items-start">
            <div>
              <h1 className="text-[clamp(2.4rem,4vw,3.4rem)] leading-[1.03] tracking-[-0.03em] mb-4">
                Research &amp; Benchmark Analysis
              </h1>
              <p className="text-muted text-[1.08rem] max-w-[760px] mb-[22px]">
                The Compassion Benchmark research program produces comparative institutional rankings across governments, corporations, artificial intelligence labs, and emerging robotics developers. The benchmark framework measures how institutions recognize, respond to, and structurally reduce human suffering.
              </p>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mt-5">
                <Stat value="5" label="Published Index Families" />
                <Stat value="780+" label="Entities Benchmarked" />
                <Stat value="8" label="Core Dimensions" />
                <Stat value="40" label="Subdimensions" />
                <Stat value="2026" label="Current Publication Cycle" />
              </div>
            </div>

            <Panel>
              <h3 className="text-[1.08rem] font-bold mb-2.5">Research Scope</h3>
              <p className="text-muted mb-3">
                The benchmark currently spans governments, subnational public systems, corporations, artificial intelligence research labs, and humanoid robotics organizations. This allows cross-sector comparison of institutional compassion performance.
              </p>
              <Button href="/indexes" variant="primary">View Published Indexes</Button>
            </Panel>
          </div>
        </Container>
      </section>

      {/* Published Benchmark Reports */}
      <section className="py-[30px]">
        <Container>
          <SectionHead title="Published Benchmark Reports" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { pill: "2026", title: "World Countries Index", desc: "Ranking 200+ countries based on public evidence across the Compassion Benchmark framework.", href: "/countries" },
              { pill: "2026", title: "United States Index", desc: "Ranking all U.S. states using public policy, equity, healthcare, and social support metrics.", href: "/us-states" },
              { pill: "2026", title: "Fortune 500 Index", desc: "Comparative ranking of major corporations using labor practices, governance, social impact, and accountability data.", href: "/fortune-500" },
              { pill: "2026", title: "AI Labs Index", desc: "Evaluation of leading artificial intelligence organizations across safety governance, transparency, and societal risk handling.", href: "/ai-labs" },
              { pill: "2026", title: "Humanoid Robotics Labs Index", desc: "Benchmarking robotics organizations developing humanoid systems across ethical deployment and societal impact.", href: "/robotics-labs" },
            ].map((item) => (
              <Card key={item.title}>
                <div className="mb-3"><Pill>{item.pill}</Pill></div>
                <h3 className="text-[1.08rem] font-bold mb-2">{item.title}</h3>
                <p className="text-muted mb-3">{item.desc}</p>
                <Button href={item.href} variant="primary">View Index</Button>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Research Program Focus */}
      <section className="py-[30px]">
        <Container>
          <SectionHead title="Research Program Focus" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Panel>
              <h3 className="text-[1.08rem] font-bold mb-2.5">Comparative Institutional Analysis</h3>
              <p className="text-muted">
                Understanding how institutions differ in their ability to detect, reduce, and prevent systemic harm.
              </p>
            </Panel>
            <Panel>
              <h3 className="text-[1.08rem] font-bold mb-2.5">Dimension-Level Diagnostics</h3>
              <p className="text-muted">
                Tracking weaknesses across governance, accountability, equity, and long-term care infrastructure.
              </p>
            </Panel>
            <Panel>
              <h3 className="text-[1.08rem] font-bold mb-2.5">Technology Governance</h3>
              <p className="text-muted">
                Studying how AI and robotics organizations manage safety, externalities, and long-term societal risks.
              </p>
            </Panel>
          </div>
        </Container>
      </section>

      {/* Future Research Outputs */}
      <section className="py-[30px]">
        <Container>
          <SectionHead title="Future Research Outputs" />
          <Panel>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">Output</th>
                  <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">Description</th>
                  <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">Status</th>
                </tr>
              </thead>
              <tbody className="text-muted">
                {[
                  ["Annual Benchmark Reports", "Updated yearly rankings across all index families.", "In progress"],
                  ["Sector Research Briefs", "Focused studies on healthcare, finance, AI safety, robotics, and public systems.", "Planned"],
                  ["Longitudinal Benchmark Analysis", "Tracking score movement and structural policy changes across years.", "Planned"],
                  ["Benchmark Data Products", "Structured datasets and API access for institutional researchers.", "In development"],
                ].map(([output, description, status]) => (
                  <tr key={output}>
                    <td className="py-3 px-2.5 border-b border-line text-text">{output}</td>
                    <td className="py-3 px-2.5 border-b border-line">{description}</td>
                    <td className="py-3 px-2.5 border-b border-line">{status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </Container>
      </section>

      {/* Research Access & Data Licensing */}
      <section className="py-[30px]">
        <Container>
          <Panel>
            <h2 className="text-[clamp(1.55rem,3vw,2.15rem)] tracking-tight mb-2">Research Access &amp; Data Licensing</h2>
            <p className="text-muted mb-3">
              Organizations, researchers, and institutions can access benchmark data through multiple channels including:
            </p>
            <ul className="list-disc pl-[18px] text-muted space-y-2 mb-4">
              <li>Full benchmark reports and research publications</li>
              <li>Structured datasets for academic and institutional research</li>
              <li>API access and enterprise data licensing</li>
              <li>Interpretive advisory and strategic benchmarking consulting</li>
            </ul>
            <div className="flex gap-3 flex-wrap">
              <Button href="/purchase-research" variant="primary">Purchase Research</Button>
              <Button href="/data-licenses">Data Licensing</Button>
            </div>
          </Panel>
        </Container>
      </section>
    </>
  );
}
