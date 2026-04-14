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

export const metadata: Metadata = { title: "Data Licenses" };

export default function DataLicensesPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-[72px] pb-10">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-[18px] items-start">
            <div>
              <Eyebrow>Data licensing</Eyebrow>
              <h1 className="text-[clamp(2.2rem,5vw,4rem)] leading-[1.04] tracking-[-0.03em] mb-3.5">
                License benchmark data for internal, academic, and enterprise use
              </h1>
              <p className="text-muted text-[1.08rem] max-w-[860px] mb-[22px]">
                Compassion Benchmark data licenses provide structured access to benchmark datasets, rankings, dimension-level summaries, and multi-index research assets for internal analysis, institutional research, reporting workflows, and strategic intelligence. Public benchmark pages remain openly viewable on the web; licensing applies to structured data access and broader usage rights.
              </p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <Stat value="CSV / XLSX" label="Structured data formats" />
                <Stat value="Annual" label="Single-year and recurring licenses" />
                <Stat value="Multi-index" label="Cross-sector data bundles" />
                <Stat value="Enterprise" label="Institutional access options" />
              </div>
            </div>
            <Panel>
              <h3 className="text-[1.08rem] font-bold mb-2.5">License policy</h3>
              <p className="text-muted mb-3">
                Data licenses grant access and defined usage rights for benchmark datasets. They do not alter benchmark inclusion, score, rank, or publication status. Public rankings remain editorially independent from licensing activity.
              </p>
              <div className="flex gap-3 flex-wrap">
                <Button href="/contact-sales" variant="primary">Contact sales</Button>
              </div>
            </Panel>
          </div>
        </Container>
      </section>

      {/* License categories */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="License categories"
            description="The site should make the primary licensing paths legible without collapsing everything into one generic quote form."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { pills: ["Single Index", "Structured Data"], title: "Rankings Table License", desc: "Access a structured dataset containing core rankings, score fields, and top-level published benchmark values for one index and one publication year.", price: "$500\u2013$2,500" },
              { pills: ["Single Index", "Expanded Data"], title: "Dimension-Level Dataset", desc: "License dimension-level benchmark values, summary tables, and deeper structured benchmark detail for one sector and year.", price: "$1,500\u2013$5,000" },
              { pills: ["Annual", "Bundle"], title: "Annual Data Bundle", desc: "Access all current-year benchmark datasets across the published index families in one coordinated package.", price: "$5,000\u2013$20,000" },
              { pills: ["Institutional", "Multi-user"], title: "Institutional Data Pack", desc: "Multi-user internal-use package for teams needing structured benchmark data, annual updates, and broader usage rights.", price: "$10,000+" },
              { pills: ["Academic", "Research"], title: "Academic / Research License", desc: "Structured benchmark data for university, think-tank, and non-commercial research workflows with defined research-use rights.", price: "Custom" },
              { pills: ["Enterprise", "Custom Scope"], title: "Enterprise Data Agreement", desc: "Tailored institutional access for recurring benchmark use, internal platforms, strategic intelligence programs, or multi-team deployment.", price: "Custom" },
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
            <h3 className="text-[1.08rem] font-bold mb-2.5">What benchmark data licensing includes</h3>
            <ul className="list-disc pl-[18px] text-muted space-y-2">
              <li><span className="text-text font-semibold">Structured exports:</span> CSV, spreadsheet-ready files, and related benchmark data packages</li>
              <li><span className="text-text font-semibold">Defined usage rights:</span> internal, academic, enterprise, or editorial scope depending on agreement</li>
              <li><span className="text-text font-semibold">Index-specific or bundled access:</span> purchase a single sector or a broader cross-index package</li>
              <li><span className="text-text font-semibold">Optional annual renewal:</span> recurring benchmark access as future publication cycles are released</li>
            </ul>
          </Panel>
          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-2.5">What data licensing does not include</h3>
            <ul className="list-disc pl-[18px] text-muted space-y-2">
              <li>Score changes or re-ranking</li>
              <li>Suppression of public benchmark findings</li>
              <li>Rights to present licensed benchmark data as self-authored benchmark methodology</li>
              <li>Unrestricted redistribution outside the defined license</li>
            </ul>
          </Panel>
        </Container>
      </section>

      {/* Common buyer types */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="Common buyer types"
            description="The licensing page should make it easy for different institutional buyers to see themselves in the offer structure."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "Research teams", desc: "Use benchmark datasets for internal analysis, benchmarking, and strategic review." },
              { title: "Academic institutions", desc: "Use structured benchmark data in research, policy studies, and non-commercial academic work." },
              { title: "Media organizations", desc: "Use benchmark data for editorial analysis, comparative reporting, and data-supported journalism." },
              { title: "Enterprise buyers", desc: "Use recurring benchmark data across teams, business units, or internal intelligence workflows." },
            ].map((item) => (
              <Card key={item.title}>
                <h3 className="text-[1.08rem] font-bold mb-2">{item.title}</h3>
                <p className="text-muted">{item.desc}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Available datasets */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="Available benchmark datasets"
            description="The current benchmark program supports data licensing across all published index families."
          />
          <Panel>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">Dataset</th>
                  <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">Coverage</th>
                  <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">Typical use</th>
                  <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">Common license fit</th>
                </tr>
              </thead>
              <tbody className="text-muted">
                {[
                  ["World Countries Dataset", "Global sovereign and territorial benchmark data", "Policy, international, and cross-country analysis", "Academic, internal, enterprise"],
                  ["U.S. States Dataset", "All 50 states and DC", "Domestic policy comparison and public-system research", "Internal, academic, editorial"],
                  ["Fortune 500 Dataset", "Large-company benchmark data", "Corporate analysis, governance review, strategy work", "Internal, enterprise"],
                  ["AI Labs Dataset", "Leading AI labs", "AI governance, safety, and competitive analysis", "Internal, academic, enterprise"],
                  ["Humanoid Robotics Dataset", "Top 50 robotics labs", "Technology, robotics, labor, and policy analysis", "Internal, academic, enterprise"],
                  ["Annual Cross-Index Bundle", "All current-year published benchmark datasets", "Institutional analysis across multiple sectors", "Enterprise, internal multi-team"],
                ].map(([dataset, coverage, use, fit]) => (
                  <tr key={dataset}>
                    <td className="py-3 px-2.5 border-b border-line text-text">{dataset}</td>
                    <td className="py-3 px-2.5 border-b border-line">{coverage}</td>
                    <td className="py-3 px-2.5 border-b border-line">{use}</td>
                    <td className="py-3 px-2.5 border-b border-line">{fit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </Container>
      </section>

      {/* Licensing model + Expansion */}
      <section className="py-[30px]">
        <Container className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-2.5">Recommended initial licensing model</h3>
            <ul className="list-disc pl-[18px] text-muted space-y-2">
              <li>Single-index rankings table license</li>
              <li>Single-index dimension-level dataset</li>
              <li>Annual all-indexes bundle</li>
              <li>Institutional internal-use license</li>
              <li>Academic/research license</li>
            </ul>
          </Panel>
          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-2.5">Expansion path</h3>
            <ul className="list-disc pl-[18px] text-muted space-y-2">
              <li>Recurring subscriptions by year</li>
              <li>Historical benchmark bundles</li>
              <li>API-based enterprise access</li>
              <li>Consultant or partner licensing terms</li>
              <li>Embedded benchmark intelligence agreements</li>
            </ul>
          </Panel>
        </Container>
      </section>

      {/* Related services */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="Relationship to other services"
            description="Data licensing is one layer in the broader benchmark commercial model."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <h3 className="text-[1.08rem] font-bold mb-2">Purchase Research</h3>
              <p className="text-muted">Best for buyers who need polished reports and benchmark deliverables rather than structured data rights.</p>
            </Card>
            <Card>
              <h3 className="text-[1.08rem] font-bold mb-2">Advisory</h3>
              <p className="text-muted">Best for teams that need interpretation, strategy, and expert guidance built on benchmark findings.</p>
            </Card>
            <Card>
              <h3 className="text-[1.08rem] font-bold mb-2">Enterprise Agreements</h3>
              <p className="text-muted">Best for recurring institutional access spanning data, reporting, briefings, and custom support.</p>
            </Card>
          </div>
        </Container>
      </section>

      {/* Final CTA */}
      <section className="py-[30px]">
        <Container>
          <Callout>
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] mb-2">Request a benchmark data license</h2>
            <p className="text-muted max-w-[760px] mb-[18px]">
              License structured benchmark datasets for internal, research, editorial, or enterprise use.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Button href="/contact-sales" variant="primary">Contact sales</Button>
            </div>
          </Callout>
        </Container>
      </section>
    </>
  );
}
