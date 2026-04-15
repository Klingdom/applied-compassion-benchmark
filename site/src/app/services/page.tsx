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

export const metadata: Metadata = { title: "Services", description: "Browse Compassion Benchmark service lines: research reports, data licensing, advisory consulting, certified assessments, and enterprise agreements." };

export default function ServicesPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-[72px] pb-10">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-[1.08fr_0.92fr] gap-[18px] items-start">
            <div>
              <Eyebrow>Services and commercial offerings</Eyebrow>
              <h1 className="text-[clamp(2.25rem,5vw,4.2rem)] leading-[1.03] tracking-[-0.04em] max-w-[920px] mb-3.5">
                Research access, data products, advisory support, and institutional benchmark services
              </h1>
              <p className="text-muted text-[1.08rem] max-w-[860px] mb-[22px]">
                Compassion Benchmark publishes public rankings independently. Paid services are built around premium report access, benchmark data licensing, interpretive advisory, certified assessments, and enterprise agreements. These services are designed to help institutions use the benchmark seriously without compromising its independence.
              </p>
              <div className="flex gap-3 flex-wrap mt-1">
                <Button href="/purchase-research" variant="primary">Purchase Research</Button>
                <Button href="/contact-sales">Contact Sales</Button>
                <Button href="/enterprise">Enterprise</Button>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
                <Stat value="Reports" label="Professional benchmark publications" />
                <Stat value="Data" label="Structured benchmark licensing" />
                <Stat value="Advisory" label="Interpretation and strategy" />
                <Stat value="Enterprise" label="Recurring institutional agreements" />
              </div>
            </div>

            <Panel>
              <h3 className="text-[1.08rem] font-bold mb-2.5">Commercial integrity</h3>
              <p className="text-muted mb-3">
                Organizations do not pay to be included in a benchmark, to improve a rank, to improve a score, or to suppress a public finding. Paid services support access, packaging, interpretation, review, and institutional use.
              </p>
              <p className="text-muted">
                That separation is core to the credibility of the benchmark.
              </p>
            </Panel>
          </div>
        </Container>
      </section>

      {/* Ladder callout */}
      <section className="py-[30px]">
        <Container>
          <Callout>
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] mb-2">Designed as a ladder, not a menu of random services</h2>
            <p className="text-muted max-w-[950px]">
              The service architecture is meant to move visitors from public benchmark discovery into the right next step: a report purchase, a data license, an interpretive engagement, a certified assessment, or a broader enterprise relationship.
            </p>
          </Callout>
        </Container>
      </section>

      {/* Primary service lines */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="Primary service lines"
            description="These pages represent the core monetization paths built on top of the public benchmark platform."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { href: "/purchase-research", pills: ["Research", "Self-Serve"], title: "Purchase Research", desc: "Buy benchmark reports by year and target area, including PDF formats, bundled report packages, and institutional-grade report delivery." },
              { href: "/data-licenses", pills: ["Data", "Licensing"], title: "Data License", desc: "License structured benchmark datasets, dimension-level outputs, annual bundles, and internal-use benchmark data rights." },
              { href: "/advisory", pills: ["Advisory", "Interpretation"], title: "Advisory", desc: "Book private briefings, peer comparison work, executive sessions, and strategic interpretation grounded in published benchmark findings." },
              { href: "/certified-assessments", pills: ["Assessment", "Formal Review"], title: "Certified Assessments", desc: "Engage in an assessor-led, evidence-based review process for structured institutional evaluation and findings delivery." },
              { href: "/enterprise", pills: ["Enterprise", "Institutional"], title: "Enterprise", desc: "Combine research access, data licensing, advisory support, certified assessments, and recurring executive support into one agreement." },
              { href: "/contact-sales", pills: ["Sales", "Routing"], title: "Contact Sales", desc: "Route your inquiry into the right commercial path based on your institution type, target area, and intended use." },
            ].map((item) => (
              <Card key={item.href} href={item.href} variant="service">
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

      {/* Public vs paid */}
      <section className="py-[30px]">
        <Container className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-2.5">Public benchmark vs paid services</h3>
            <ul className="list-disc pl-[18px] text-muted space-y-2">
              <li><span className="text-text font-bold">Public benchmark:</span> rankings, methodology, and research publication</li>
              <li><span className="text-text font-bold">Paid layer:</span> premium reports, data access, interpretation, formal review, and enterprise support</li>
              <li><span className="text-text font-bold">Not sold:</span> score changes, rank changes, inclusion changes, or publication suppression</li>
            </ul>
          </Panel>
          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-2.5">Best entry points by need</h3>
            <ul className="list-disc pl-[18px] text-muted space-y-2">
              <li><span className="text-text font-bold">I want a report:</span> <a href="/purchase-research" className="hover:text-text">Purchase Research</a></li>
              <li><span className="text-text font-bold">I want structured data:</span> <a href="/data-licenses" className="hover:text-text">Data Licenses</a></li>
              <li><span className="text-text font-bold">I want help understanding results:</span> <a href="/advisory" className="hover:text-text">Advisory</a></li>
              <li><span className="text-text font-bold">I want a formal review:</span> <a href="/certified-assessments" className="hover:text-text">Certified Assessments</a></li>
              <li><span className="text-text font-bold">I want a broader institutional relationship:</span> <a href="/enterprise" className="hover:text-text">Enterprise</a></li>
            </ul>
          </Panel>
        </Container>
      </section>

      {/* Monetization paths */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="Monetization paths from the platform"
            description="The service model is strongest when it is connected directly to real visitor intent."
          />
          <Panel>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">Visitor type</th>
                  <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">Likely need</th>
                  <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">Best service path</th>
                  <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">Revenue model</th>
                </tr>
              </thead>
              <tbody className="text-muted">
                {[
                  ["Reader of a public index", "Wants a formal report copy", "Purchase Research", "Report sale"],
                  ["Analyst or research team", "Needs spreadsheet-ready benchmark outputs", "Data License", "License fee"],
                  ["Executive team or board", "Needs peer context and interpretation", "Advisory", "Briefing / memo / workshop"],
                  ["Organization under review", "Wants structured external evaluation", "Certified Assessments", "Assessment fee"],
                  ["Large institution", "Needs recurring access and support", "Enterprise", "Annual agreement"],
                ].map(([visitor, need, path, revenue]) => (
                  <tr key={visitor}>
                    <td className="py-3 px-2.5 border-b border-line text-text">{visitor}</td>
                    <td className="py-3 px-2.5 border-b border-line">{need}</td>
                    <td className="py-3 px-2.5 border-b border-line">{path}</td>
                    <td className="py-3 px-2.5 border-b border-line">{revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </Container>
      </section>

      {/* Service ecosystem */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="Service ecosystem"
            description="The services page should help visitors understand how the commercial pages fit together."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "Indexes", desc: "Public-facing benchmark discovery and comparative rankings." },
              { title: "Research", desc: "Framework, reports, and benchmark publication context." },
              { title: "Assess Your Organization", desc: "Natural bridge from public benchmark curiosity into structured review." },
              { title: "Contact Sales", desc: "Central conversion point across all monetized offerings." },
            ].map((item) => (
              <Card key={item.title}>
                <h3 className="text-[1.08rem] font-bold mb-2">{item.title}</h3>
                <p className="text-muted">{item.desc}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Buying flow + Service pages */}
      <section className="py-[30px]">
        <Container className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-2.5">Recommended service buying flow</h3>
            <ul className="list-disc pl-[18px] text-muted space-y-2">
              <li>Discover the benchmark through public index pages</li>
              <li>Understand the framework through methodology and research</li>
              <li>Choose the right paid path based on need</li>
              <li>Convert through contact-sales or the relevant service page</li>
              <li>Expand into repeat or enterprise use if needed</li>
            </ul>
          </Panel>
          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-2.5">Service pages in this ecosystem</h3>
            <ul className="list-disc pl-[18px] text-muted space-y-2">
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

      {/* Final CTA */}
      <section className="py-[30px]">
        <Container>
          <Callout>
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] mb-2">Choose the right benchmark service path</h2>
            <p className="text-muted max-w-[950px] mb-[18px]">
              Whether you need a report, a data package, a strategic interpretation, a formal review, or an enterprise agreement, the benchmark service architecture is designed to meet that need without compromising public credibility.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Button href="/contact-sales" variant="primary">Contact Sales</Button>
              <Button href="/purchase-research">Purchase Research</Button>
            </div>
          </Callout>
        </Container>
      </section>
    </>
  );
}
