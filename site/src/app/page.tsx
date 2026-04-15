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
import Link from "next/link";
import updatesRaw from "@/data/updates/latest.json";
/* eslint-disable @typescript-eslint/no-explicit-any */
const updates = updatesRaw as any;

export const metadata: Metadata = {
  title: { absolute: "Compassion Benchmark | Global Benchmarking for Institutional Compassion" },
  description: "Independent benchmark research measuring how institutions recognize, respond to, and reduce suffering across governments, corporations, AI labs, and robotics.",
};

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="pt-[72px] pb-10">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-[1.12fr_0.88fr] gap-[18px] items-start">
            <div>
              <Eyebrow>Independent benchmark research for institutions</Eyebrow>
              <h1 className="text-[clamp(2.4rem,5vw,4.5rem)] leading-[1.02] tracking-[-0.04em] max-w-[920px] mb-3.5">
                Benchmarking how institutions recognize, respond to, and reduce
                suffering
              </h1>
              <p className="text-muted text-[1.1rem] max-w-[860px] mb-[22px]">
                Compassion Benchmark publishes comparative benchmark research
                across governments, public systems, corporations, AI labs, and
                humanoid robotics labs using a structured institutional
                compassion framework. The benchmark is designed to make
                compassionate performance legible, comparable, and difficult to
                fake.
              </p>
              <div className="flex gap-3 flex-wrap mt-1">
                <Button href="/indexes" variant="primary">
                  Explore Indexes
                </Button>
                <Button href="/methodology">Read Methodology</Button>
                <Button href="/purchase-research">Purchase Research</Button>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
                <Stat value="1,155" label="Entities currently benchmarked" />
                <Stat value="7" label="Published index families" />
                <Stat value="8" label="Core benchmark dimensions" />
                <Stat value="40" label="Subdimensions in full standard" />
              </div>
            </div>

            <Panel>
              <h3 className="text-[1.08rem] font-bold mb-2.5">
                Current publication set
              </h3>
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">
                      Index
                    </th>
                    <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">
                      Coverage
                    </th>
                  </tr>
                </thead>
                <tbody className="text-muted">
                  {[
                    ["World Countries", "207 countries and territories"],
                    ["U.S. States", "50 states and the District of Columbia"],
                    ["Fortune 500", "447 published company rankings"],
                    ["AI Labs", "50 leading AI labs"],
                    ["Humanoid Robotics Labs", "Top 50 global labs"],
                    ["U.S. Cities", "Top 150 American cities"],
                    ["Global Cities", "Top 250 cities worldwide"],
                  ].map(([index, coverage]) => (
                    <tr key={index}>
                      <td className="py-3 px-2.5 border-b border-line text-text">
                        {index}
                      </td>
                      <td className="py-3 px-2.5 border-b border-line">
                        {coverage}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-muted mt-3">
                Public rankings are published independently. Commercial
                offerings support access, interpretation, licensing, assessment,
                and enterprise use — never paid ranking changes.
              </p>
            </Panel>
          </div>
        </Container>
      </section>

      {/* Benchmark institution callout */}
      <section className="py-[30px]">
        <Container>
          <Callout>
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] mb-2">
              A benchmark institution, not a campaign site
            </h2>
            <p className="text-muted max-w-[900px]">
              The platform is organized around comparative publication,
              methodology transparency, structured evidence, and institutional
              services. It is designed for executives, researchers, boards,
              journalists, policy teams, investors, and technology leaders who
              need a serious way to evaluate compassionate institutional behavior
              across sectors.
            </p>
          </Callout>
        </Container>
      </section>

      {/* Published indexes */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="Published indexes"
            description="The benchmark currently publishes seven index families covering governments, public systems, corporations, cities, and frontier technology institutions."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                href: "/countries",
                pills: ["2026", "Governments"],
                title: "World Countries Index",
                desc: "Comparative benchmark of 207 countries and territories across the full institutional compassion framework.",
              },
              {
                href: "/us-states",
                pills: ["2026", "Public Systems"],
                title: "United States Index",
                desc: "All 50 states and DC benchmarked across policy, equity, accountability, and structural care capacity.",
              },
              {
                href: "/fortune-500",
                pills: ["2026", "Corporations"],
                title: "Fortune 500 Index",
                desc: "Comparative benchmark of the largest corporations using public evidence, governance signals, and institutional behavior.",
              },
              {
                href: "/ai-labs",
                pills: ["2026", "AI"],
                title: "AI Labs Index",
                desc: "Leading AI labs evaluated across safety, accountability, deployment boundaries, equity, and integrity.",
              },
              {
                href: "/robotics-labs",
                pills: ["2026", "Robotics"],
                title: "Humanoid Robotics Labs Index",
                desc: "Top global humanoid robotics labs benchmarked across healthcare, labor, accessibility, governance, and deployment risk.",
              },
              {
                href: "/us-cities",
                pills: ["2026", "Cities"],
                title: "U.S. Cities Index",
                desc: "Top American cities benchmarked across governance, equity, healthcare access, and structural care capacity.",
              },
              {
                href: "/global-cities",
                pills: ["2026", "Cities"],
                title: "Global Cities Index",
                desc: "250 cities worldwide benchmarked across governance, equity, healthcare, and institutional compassion.",
              },
              {
                href: "/indexes",
                pills: ["Directory", "Navigation"],
                title: "All Indexes",
                desc: "Browse the full benchmark index library, summaries, and publication pages from one central location.",
              },
            ].map((item) => (
              <Card key={item.href} href={item.href}>
                <div className="flex gap-2.5 flex-wrap mb-3">
                  {item.pills.map((p) => (
                    <Pill key={p}>{p}</Pill>
                  ))}
                </div>
                <h3 className="text-[1.08rem] font-bold mb-2">{item.title}</h3>
                <p className="text-muted">{item.desc}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* How + Research */}
      <section className="py-[30px]">
        <Container className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-2.5">
              How the benchmark works
            </h3>
            <p className="text-muted mb-3">
              The framework measures institutions across eight dimensions:{" "}
              <span className="text-text font-bold">Awareness</span>,{" "}
              <span className="text-text font-bold">Empathy</span>,{" "}
              <span className="text-text font-bold">Action</span>,{" "}
              <span className="text-text font-bold">Equity</span>,{" "}
              <span className="text-text font-bold">Boundaries</span>,{" "}
              <span className="text-text font-bold">Accountability</span>,{" "}
              <span className="text-text font-bold">Systems Thinking</span>, and{" "}
              <span className="text-text font-bold">Integrity</span>.
            </p>
            <p className="text-muted mb-3">
              Published scores are derived from public evidence and normalized to
              a 0–100 scale with an integration adjustment that rewards
              consistency and penalizes active documented harm.
            </p>
            <Button href="/methodology" variant="primary">
              View Methodology
            </Button>
          </Panel>
          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-2.5">
              Current research program
            </h3>
            <p className="text-muted mb-3">
              The benchmark has moved from concept to active publication. The
              current program includes live index reports, a formal methodology,
              a broader 40-subdimension standard, and an operating model for
              future data products, certified assessments, and enterprise
              benchmark services.
            </p>
            <Button href="/research" variant="primary">
              Explore Research
            </Button>
          </Panel>
        </Container>
      </section>

      {/* Services */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="Services"
            description="The commercial model is built around access, interpretation, licensing, assessment, and institutional support — never paid score manipulation."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                href: "/purchase-research",
                pills: ["Research", "Self-Serve"],
                title: "Purchase Research",
                desc: "Buy benchmark reports by year and target area, including premium PDF packaging, bundles, and institutional report formats.",
              },
              {
                href: "/data-licenses",
                pills: ["Data", "Licensing"],
                title: "Data Licenses",
                desc: "License structured benchmark datasets, annual bundles, and institutional data rights for internal or academic use.",
              },
              {
                href: "/advisory",
                pills: ["Advisory", "Interpretation"],
                title: "Advisory Consulting",
                desc: "Book private briefings, comparison memos, executive sessions, and strategic interpretation built on the published benchmark.",
              },
              {
                href: "/certified-assessments",
                pills: ["Assessment", "Formal Review"],
                title: "Certified Assessments",
                desc: "Engage a structured assessor-led process for formal benchmark review, findings delivery, and improvement guidance.",
              },
              {
                href: "/enterprise",
                pills: ["Enterprise", "Institutional"],
                title: "Enterprise Agreements",
                desc: "Combine research access, data licensing, advisory support, and assessment services into a recurring institutional relationship.",
              },
              {
                href: "/contact-sales",
                pills: ["Sales", "Routing"],
                title: "Contact Sales",
                desc: "Discuss the right benchmark product, service, or institutional arrangement for your team, organization, or research need.",
              },
            ].map((item) => (
              <Card key={item.href} href={item.href} variant="service">
                <div className="flex gap-2.5 flex-wrap">
                  {item.pills.map((p) => (
                    <Pill key={p}>{p}</Pill>
                  ))}
                </div>
                <h3 className="text-[1.12rem] font-bold">{item.title}</h3>
                <p className="text-muted">{item.desc}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Latest findings */}
      {(updates.scoreChanges.length > 0 || updates.highlights.length > 0) && (
        <section className="py-[30px]">
          <Container>
            <SectionHead
              title="Latest research findings"
              description={`Updated ${updates.date} — ${updates.pipeline.entitiesScanned.toLocaleString()} entities scanned, ${updates.pipeline.entitiesAssessed} assessed overnight.`}
            />
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-4">
              {updates.scoreChanges.slice(0, 3).map((change: Record<string, unknown>) => (
                <Panel key={change.slug as string}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-bold text-[1.05rem]">{change.entity as string}</h3>
                    <span className="text-[1.2rem] font-bold shrink-0" style={{ color: (change.delta as number) < 0 ? "#f87171" : "#86efac" }}>
                      {(change.delta as number) > 0 ? "+" : ""}{change.delta as number}
                    </span>
                  </div>
                  <p className="text-muted text-[0.92rem] mb-2">{(change.headline as string)?.substring(0, 160)}...</p>
                  <div className="text-[0.82rem] text-muted">
                    {change.publishedScore as number} &rarr; {change.assessedScore as number} &middot;{" "}
                    {change.bandChange ? (
                      <span style={{ color: "#f87171" }}>Band change: {change.publishedBand as string} &rarr; {change.assessedBand as string}</span>
                    ) : (
                      <span>Score change proposed</span>
                    )}
                  </div>
                </Panel>
              ))}
              {updates.highlights.slice(0, updates.scoreChanges.length > 0 ? 1 : 3).map((h: string, i: number) => (
                <Panel key={`h-${i}`}>
                  <p className="text-[0.95rem]">{h}</p>
                </Panel>
              ))}
            </div>
            <div className="mt-4">
              <Button href="/updates">View all findings</Button>
            </div>
          </Container>
        </section>
      )}

      {/* Who it's for */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="Who the benchmark is for"
            description="The platform is designed for high-seriousness users who need more than narrative claims and less than empty ESG theater."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: "Executives and Boards",
                desc: "Use the benchmark to understand institutional posture, peer position, and governance implications.",
                href: "/advisory",
              },
              {
                title: "Researchers and Journalists",
                desc: "Use published benchmark work for comparative analysis, public reporting, and sector interpretation.",
                href: "/purchase-research",
              },
              {
                title: "Policy and Public Leaders",
                desc: "Use benchmark findings to compare public systems, regional performance, and structural policy tradeoffs.",
                href: "/countries",
              },
              {
                title: "AI and Robotics Leaders",
                desc: "Use sector benchmarks to understand deployment risks, governance gaps, and leadership differentiation.",
                href: "/ai-labs",
              },
            ].map((item) => (
              <Card key={item.title} href={item.href}>
                <h3 className="text-[1.08rem] font-bold mb-2">{item.title}</h3>
                <p className="text-muted">{item.desc}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Independence + Starting paths */}
      <section className="py-[30px]">
        <Container className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-2.5">
              Independence policy
            </h3>
            <ul className="list-disc pl-[18px] text-muted space-y-2">
              <li>Entities do not pay to be included in an index</li>
              <li>Entities do not pay to improve their score or rank</li>
              <li>Commercial services do not suppress public findings</li>
              <li>
                Benchmark methodology is not sold to fit a preferred outcome
              </li>
              <li>
                Paid offerings support access, interpretation, review, and
                institutional use
              </li>
            </ul>
          </Panel>
          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-2.5">
              Best starting paths
            </h3>
            <ul className="list-disc pl-[18px] text-muted space-y-2">
              <li>
                <span className="text-text font-bold">Explore rankings:</span>{" "}
                <a href="/indexes" className="hover:text-text">Indexes</a>
              </li>
              <li>
                <span className="text-text font-bold">Understand the framework:</span>{" "}
                <a href="/methodology" className="hover:text-text">Methodology</a>
              </li>
              <li>
                <span className="text-text font-bold">Review the research program:</span>{" "}
                <a href="/research" className="hover:text-text">Research</a>
              </li>
              <li>
                <span className="text-text font-bold">See service lines:</span>{" "}
                <a href="/services" className="hover:text-text">Services</a>
              </li>
              <li>
                <span className="text-text font-bold">Begin a commercial conversation:</span>{" "}
                <a href="/contact-sales" className="hover:text-text">Contact Sales</a>
              </li>
            </ul>
          </Panel>
        </Container>
      </section>

      {/* Final CTA */}
      <section className="py-[30px]">
        <Container>
          <Callout>
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] mb-2">
              Start with the public benchmark. Go deeper when needed.
            </h2>
            <p className="text-muted max-w-[900px] mb-[18px]">
              The site is designed to let visitors move from public rankings to
              methodology, from methodology to research, and from research into
              premium services such as report purchases, data licensing, advisory
              consulting, certified assessments, and enterprise agreements.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Button href="/indexes" variant="primary">
                Explore Indexes
              </Button>
              <Button href="/contact-sales">Contact Sales</Button>
            </div>
          </Callout>
        </Container>
      </section>
    </>
  );
}
