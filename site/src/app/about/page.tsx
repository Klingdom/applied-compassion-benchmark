import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import Stat from "@/components/ui/Stat";
import Panel from "@/components/ui/Panel";
import Card from "@/components/ui/Card";
import SectionHead from "@/components/ui/SectionHead";
import Callout from "@/components/ui/Callout";

export const metadata: Metadata = { title: "About", description: "Learn how Compassion Benchmark independently measures institutional compassion across governments, corporations, AI labs, and robotics organizations." };

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-[72px] pb-10">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-[18px] items-start">
            <div>
              <Eyebrow>About the organization</Eyebrow>
              <h1 className="text-[clamp(2.3rem,5vw,4.1rem)] leading-[1.03] tracking-[-0.03em] mb-3.5">
                An independent benchmark institution for compassionate systems
              </h1>
              <p className="text-muted text-[1.08rem] max-w-[860px] mb-[22px]">
                Compassion Benchmark is an independent benchmark and research organization focused on one central question: how well do institutions recognize suffering, respond to vulnerability, and build systems that reduce harm over time? The organization exists to make compassionate institutional performance visible, comparable, and difficult to fake.
              </p>

              <div className="flex gap-3 flex-wrap mt-1">
                <Button href="/indexes" variant="primary">Explore Indexes</Button>
                <Button href="/methodology">Read Methodology</Button>
                <Button href="/research">Explore Research</Button>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
                <Stat value="Independent" label="Public benchmark publication separated from paid services" />
                <Stat value="Comparative" label="Cross-sector benchmark research across multiple institution types" />
                <Stat value="Structured" label="Built on a formal multi-dimension scoring framework" />
                <Stat value="Actionable" label="Designed for research, interpretation, and assessment use" />
              </div>
            </div>

            <Panel>
              <h3 className="text-[1.08rem] font-bold mb-2.5">What makes this institution different</h3>
              <p className="text-muted mb-3">
                Compassion Benchmark is not a campaign, branding exercise, or values-signaling site. It is designed as a benchmark institution: a place where public methodology, comparative rankings, structured evidence, and institutional services come together in a coherent research system.
              </p>
              <p className="text-muted">
                The purpose is to make compassionate institutional behavior legible in the same way that quality, safety, trust, transparency, and governance are increasingly measured elsewhere.
              </p>
            </Panel>
          </div>
        </Container>
      </section>

      {/* Why this organization exists */}
      <section className="py-[30px]">
        <Container>
          <Callout>
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] mb-2">Why this organization exists</h2>
            <p className="text-muted max-w-[900px]">
              Many institutions claim care, responsibility, safety, fairness, or public benefit. Far fewer can show coherent evidence of those qualities across governance, policy, operations, and outcomes. Compassion Benchmark exists to create a serious, legible benchmark for evaluating those claims.
            </p>
          </Callout>
        </Container>
      </section>

      {/* What the organization does */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="What the organization does"
            description="The benchmark operates as a research and publication system, with additional institutional services built around access, interpretation, and formal review."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "Publishes indexes", desc: "Comparative public benchmark rankings across countries, U.S. states, corporations, AI labs, and humanoid robotics labs." },
              { title: "Maintains methodology", desc: "A formal benchmark framework across eight dimensions and a deeper 40-subdimension standard." },
              { title: "Produces research", desc: "Sector analysis, interpretive reports, and future longitudinal benchmark outputs." },
              { title: "Supports institutions", desc: "Through reports, data access, advisory support, certified assessments, and enterprise agreements." },
            ].map((item) => (
              <Card key={item.title}>
                <h3 className="text-[1.08rem] font-bold mb-2">{item.title}</h3>
                <p className="text-muted">{item.desc}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Core idea + What is being benchmarked */}
      <section className="py-[30px]">
        <Container className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-2.5">Core idea</h3>
            <p className="text-muted">
              The benchmark is built on the idea that compassion can be evaluated institutionally, not just individually. Institutions leave evidence trails. Those trails reveal whether they notice suffering, take it seriously, constrain harmful uses of power, and build systems that reduce harm instead of reproducing it.
            </p>
          </Panel>
          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-2.5">What is being benchmarked</h3>
            <p className="text-muted">
              The benchmark does not try to measure private virtue or public relations skill. It measures institutional behavior: governance, policies, resource allocation, safety posture, accountability, equity, integrity, and the real-world consequences of organizational systems.
            </p>
          </Panel>
        </Container>
      </section>

      {/* Institutional scope */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="Institutional scope"
            description="The benchmark is designed to work across multiple classes of institutions while preserving a stable underlying framework."
          />
          <Panel>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">Institution type</th>
                  <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">Current coverage</th>
                  <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">Why it matters</th>
                </tr>
              </thead>
              <tbody className="text-muted">
                {[
                  ["Countries", "World Countries Index", "National systems determine law, care access, rights protection, and structural harm exposure."],
                  ["U.S. States", "U.S. States Index", "Subnational policy choices shape daily lived outcomes across healthcare, housing, justice, and labor."],
                  ["Corporations", "Fortune 500 Index", "Large firms affect workers, consumers, supply chains, communities, and public systems at massive scale."],
                  ["AI Labs", "AI Labs Index", "AI organizations increasingly shape information, labor, governance, safety, and human autonomy."],
                  ["Humanoid Robotics Labs", "Humanoid Robotics Labs Index", "Embodied automation will influence labor, safety, care, accessibility, and the physical distribution of power."],
                ].map(([type, coverage, reason]) => (
                  <tr key={type}>
                    <td className="py-3 px-2.5 border-b border-line text-text">{type}</td>
                    <td className="py-3 px-2.5 border-b border-line">{coverage}</td>
                    <td className="py-3 px-2.5 border-b border-line">{reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </Container>
      </section>

      {/* Independence and credibility */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="Independence and credibility"
            description="Benchmark credibility depends on institutional independence. The organization is designed around that principle."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: "No paid ranking changes", desc: "Entities do not pay to be included, improve their rank, or alter a published public score." },
              { title: "No methodology for sale", desc: "The methodology is not customized to produce a preferred result for a paying institution." },
              { title: "Public findings remain public", desc: "Paid services support access, interpretation, and formal review, not suppression of benchmark findings." },
            ].map((item) => (
              <Card key={item.title}>
                <h3 className="text-[1.08rem] font-bold mb-2">{item.title}</h3>
                <p className="text-muted">{item.desc}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Beliefs + Who served */}
      <section className="py-[30px]">
        <Container className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-2.5">What the organization believes</h3>
            <ul className="list-disc pl-[18px] text-muted space-y-2">
              <li>Institutions can be evaluated for compassionate performance</li>
              <li>Public evidence is a serious starting point for benchmark publication</li>
              <li>Accountability, boundaries, and integrity matter as much as stated care</li>
              <li>Cross-sector comparison reveals patterns that siloed analysis misses</li>
              <li>Benchmarks should be difficult to game and useful in practice</li>
            </ul>
          </Panel>
          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-2.5">Who the organization serves</h3>
            <ul className="list-disc pl-[18px] text-muted space-y-2">
              <li>Researchers and journalists seeking comparative institutional analysis</li>
              <li>Executives and boards seeking peer context and interpretation</li>
              <li>Policy leaders and public institutions comparing systems performance</li>
              <li>Technology governance communities evaluating AI and robotics labs</li>
              <li>Organizations seeking external review, formal assessment, or enterprise support</li>
            </ul>
          </Panel>
        </Container>
      </section>

      {/* How the organization is structured */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="How the organization is structured on the site"
            description="The website is intentionally built like a benchmark institution rather than a generic consultancy."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card href="/indexes">
              <h3 className="text-[1.08rem] font-bold mb-2">Indexes</h3>
              <p className="text-muted">The public benchmark layer where comparative rankings are published.</p>
            </Card>
            <Card href="/methodology">
              <h3 className="text-[1.08rem] font-bold mb-2">Methodology</h3>
              <p className="text-muted">The formal scoring framework and benchmark logic behind the publications.</p>
            </Card>
            <Card href="/research">
              <h3 className="text-[1.08rem] font-bold mb-2">Research</h3>
              <p className="text-muted">The broader publication and analysis program surrounding the benchmark.</p>
            </Card>
            <Card href="/services">
              <h3 className="text-[1.08rem] font-bold mb-2">Services</h3>
              <p className="text-muted">The institutional service layer built on top of the public benchmark.</p>
            </Card>
          </div>
        </Container>
      </section>

      {/* Related service cards */}
      <section className="py-[30px]">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card href="/purchase-research">
              <h3 className="text-[1.08rem] font-bold mb-2">Purchase Research</h3>
              <p className="text-muted">Buy benchmark publications, premium report formats, and structured report packages.</p>
            </Card>
            <Card href="/advisory">
              <h3 className="text-[1.08rem] font-bold mb-2">Advisory</h3>
              <p className="text-muted">Book interpretation, peer comparison, and strategic benchmark guidance.</p>
            </Card>
            <Card href="/certified-assessments">
              <h3 className="text-[1.08rem] font-bold mb-2">Certified Assessments</h3>
              <p className="text-muted">Enter a more formal review process grounded in the benchmark framework.</p>
            </Card>
          </div>
        </Container>
      </section>

      {/* Final CTA */}
      <section className="py-[30px]">
        <Container>
          <Callout>
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] mb-2">
              Read the benchmark. Use the benchmark. Challenge the benchmark.
            </h2>
            <p className="text-muted max-w-[920px] mb-[18px]">
              Compassion Benchmark is built to be a credible public benchmark institution: rigorous enough to be useful, structured enough to be comparable, and open enough to be challenged with better evidence. That is what makes the work stronger.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Button href="/indexes" variant="primary">Explore Indexes</Button>
              <Button href="/methodology">Read Methodology</Button>
              <Button href="/contact-sales">Contact Sales</Button>
            </div>
          </Callout>
        </Container>
      </section>
    </>
  );
}
