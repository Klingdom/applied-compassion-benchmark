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
import ResearchConfigurator from "@/components/purchase/ResearchConfigurator";

export const metadata: Metadata = {
  title: "Purchase Research",
  description:
    "Buy published benchmark research by year, sector, and format. Access reports, annual bundles, and premium research formats.",
};

const products = [
  {
    pills: ["Single Index", "PDF"],
    title: "Single Index Report",
    desc: "Purchase one benchmark report by year and target area in a polished PDF format suitable for review, discussion, and citation.",
    price: "$95–$295",
    priceNote: "starting range",
    link: "/contact-sales?product=single-index-report",
    cta: "Purchase",
  },
  {
    pills: ["Single Index", "PDF + Appendix"],
    title: "Index Report with Data Appendix",
    desc: "Includes the PDF report plus structured appendix tables for rankings, dimension-level summaries, and related benchmark tables.",
    price: "$295–$750",
    priceNote: "starting range",
    link: "/contact-sales?product=index-report-appendix",
    cta: "Purchase",
  },
  {
    pills: ["Bundle", "Annual"],
    title: "Annual All-Indexes Bundle",
    desc: "Access the full current-year benchmark portfolio across all published index families in one consolidated purchase.",
    price: "$1,250+",
    priceNote: "starting range",
    link: "/contact-sales?product=annual-bundle",
    cta: "Purchase",
  },
  {
    pills: ["Institutional", "Internal Use"],
    title: "Institutional Research Pack",
    desc: "Expanded delivery package for internal teams, including report files, structured appendices, and broader internal-use rights.",
    price: "$1,500–$5,000",
    priceNote: "starting range",
    link: "/contact-sales?product=institutional-research-pack",
    cta: "Request quote",
  },
  {
    pills: ["Board Ready", "Presentation"],
    title: "Research Deck Package",
    desc: "Benchmark report delivered with a presentation-ready slide deck for leadership, board, or strategy conversations.",
    price: "$2,500+",
    priceNote: "starting range",
    link: "/contact-sales?product=research-deck-package",
    cta: "Request quote",
  },
  {
    pills: ["Custom", "Comparative"],
    title: "Custom Research Package",
    desc: "Tailored benchmark packaging, peer group slicing, special report format, or a custom blend of published benchmark materials.",
    price: "Custom",
    priceNote: "quoted per request",
    link: "/contact-sales?product=custom-research-package",
    cta: "Request quote",
  },
];

export default function PurchaseResearchPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-[72px] pb-[34px]">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-[18px] items-start">
            <div>
              <Eyebrow>Purchase benchmark research</Eyebrow>
              <h1 className="text-[clamp(2.2rem,5vw,4rem)] leading-[1.04] tracking-[-0.03em] mb-3.5">
                Buy published research by year, sector, and format
              </h1>
              <p className="text-muted text-[1.08rem] max-w-[860px] mb-[22px]">
                Access benchmark reports, annual bundles, and premium research
                formats built on the published benchmark. Public rankings remain
                freely available on the website. Paid research products provide
                professional delivery formats, structured appendices, and
                institution-ready materials for internal use, executive review,
                and strategic planning.
              </p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <Stat value="5" label="Live index families" />
                <Stat value="2026" label="Current publication cycle" />
                <Stat value="PDF" label="Professional report delivery" />
                <Stat value="Bundle" label="Multi-index purchase options" />
              </div>
            </div>
            <Panel>
              <h3 className="text-[1.08rem] font-bold mb-2.5">
                Research purchase policy
              </h3>
              <p className="text-muted mb-3">
                Benchmark rankings are published independently. Paid research
                products provide access, formatting, convenience, internal-use
                packaging, and interpretation pathways. Purchasing research does
                not change inclusion, score, or rank.
              </p>
              <div className="flex gap-3 flex-wrap">
                <Button href="#configurator" variant="primary">
                  Build your order
                </Button>
                <Button href="/contact-sales">Contact sales</Button>
              </div>
            </Panel>
          </div>
        </Container>
      </section>

      {/* Configurator */}
      <section className="py-[28px]" id="configurator">
        <Container>
          <SectionHead
            title="Build your research order"
            description="Select a year, benchmark area, format, and license type to route buyers into the right purchase flow."
          />
          <ResearchConfigurator />
        </Container>
      </section>

      {/* Products */}
      <section className="py-[28px]">
        <Container>
          <SectionHead
            title="Popular research products"
            description="These are the cleanest initial self-serve and semi-self-serve offers for the benchmark website."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => (
              <div
                key={p.title}
                className="bg-gradient-to-b from-[rgba(255,255,255,0.04)] to-[rgba(255,255,255,0.02)] border border-line rounded-[20px] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.28)] flex flex-col gap-3.5"
              >
                <div className="flex gap-2.5 flex-wrap">
                  {p.pills.map((pill) => (
                    <Pill key={pill}>{pill}</Pill>
                  ))}
                </div>
                <h3 className="text-[1.12rem] font-bold">{p.title}</h3>
                <p className="text-muted">{p.desc}</p>
                <div className="text-[1.5rem] font-bold">
                  {p.price}{" "}
                  <small className="text-[0.92rem] font-medium text-muted">
                    {p.priceNote}
                  </small>
                </div>
                <Button href={p.link} variant="primary" full>
                  {p.cta}
                </Button>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Details */}
      <section className="py-[28px]">
        <Container className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-2.5">
              Buy by year and target area
            </h3>
            <ul className="list-disc pl-[18px] text-muted space-y-2">
              <li>
                <span className="text-text font-semibold">Years:</span>{" "}
                current-year reports, historical reports, and multi-year bundles
              </li>
              <li>
                <span className="text-text font-semibold">Target areas:</span>{" "}
                World Countries, U.S. States, Fortune 500, AI Labs, Humanoid
                Robotics Labs, and annual combined bundles
              </li>
              <li>
                <span className="text-text font-semibold">Formats:</span> PDF,
                PDF + appendix, PDF + deck, institutional pack
              </li>
              <li>
                <span className="text-text font-semibold">License types:</span>{" "}
                individual, internal team, enterprise, academic
              </li>
            </ul>
          </Panel>
          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-2.5">Best use cases</h3>
            <ul className="list-disc pl-[18px] text-muted space-y-2">
              <li>Executive review and strategic planning</li>
              <li>Board or investor discussion materials</li>
              <li>Policy, governance, and comparative analysis</li>
              <li>Internal research and benchmarking</li>
              <li>Media, university, or think-tank reference use</li>
            </ul>
          </Panel>
        </Container>
      </section>

      {/* Catalog */}
      <section className="py-[28px]">
        <Container>
          <SectionHead title="Benchmark catalog" />
          <div className="overflow-auto border border-line rounded-[20px] bg-[rgba(255,255,255,0.03)]">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {["Report", "Coverage", "Typical buyer", "Available formats"].map((h) => (
                    <th key={h} className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-[0.95rem]">
                {[
                  ["World Countries Index", "Global sovereign and territorial benchmarking", "Policy teams, media, academia, global analysts", "PDF, PDF + appendix, institutional pack"],
                  ["U.S. States Index", "All 50 states and DC", "Public policy teams, advocacy groups, political analysts", "PDF, PDF + appendix, internal team pack"],
                  ["Fortune 500 Index", "Large U.S. corporate benchmark", "Executives, boards, enterprise strategy teams, media", "PDF, PDF + appendix, board deck"],
                  ["AI Labs Index", "Leading frontier and applied AI labs", "AI governance teams, tech media, enterprise leaders", "PDF, PDF + appendix, briefing package"],
                  ["Humanoid Robotics Labs Index", "Top 50 global humanoid robotics developers", "Technology strategists, robotics observers, policy teams", "PDF, PDF + appendix, strategic brief"],
                  ["Annual All-Indexes Bundle", "Full multi-sector benchmark package", "Institutions, investors, enterprise teams, research groups", "Bundle PDF set, appendices, enterprise pack"],
                ].map(([report, coverage, buyer, formats]) => (
                  <tr key={report}>
                    <td className="py-3 px-2.5 border-b border-line text-text font-medium">{report}</td>
                    <td className="py-3 px-2.5 border-b border-line text-muted">{coverage}</td>
                    <td className="py-3 px-2.5 border-b border-line text-muted">{buyer}</td>
                    <td className="py-3 px-2.5 border-b border-line text-muted">{formats}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Container>
      </section>

      {/* Beyond the report */}
      <section className="py-[28px]">
        <Container>
          <SectionHead
            title="Beyond the report"
            description="Many buyers need more than a document. This page should also serve as the bridge into higher-value services."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "Interpretive briefing", desc: "Private analyst session to explain the implications of a purchased benchmark report." },
              { title: "Peer comparison memo", desc: "Tailored written comparison of selected entities against published benchmark peers." },
              { title: "Data license", desc: "Structured access for teams needing spreadsheet-ready or licensed benchmark data." },
              { title: "Enterprise agreement", desc: "Annual benchmark access and recurring support for larger institutions." },
            ].map((item) => (
              <Card key={item.title}>
                <h3 className="text-[1.05rem] font-bold mb-2">{item.title}</h3>
                <p className="text-muted">{item.desc}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Integrity + Next steps */}
      <section className="py-[28px]">
        <Container className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-2.5">
              Commercial integrity rules
            </h3>
            <ul className="list-disc pl-[18px] text-muted space-y-2">
              <li>Purchasing research does not alter benchmark inclusion</li>
              <li>Purchasing research does not alter score or rank</li>
              <li>Benchmark publication remains independent</li>
              <li>Paid research products are delivery, format, and access products</li>
              <li>Interpretive and advisory services are separate from published scoring decisions</li>
            </ul>
          </Panel>
          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-2.5">
              Recommended next-step pages
            </h3>
            <ul className="list-disc pl-[18px] text-muted space-y-2">
              <li><a href="/data-licenses" className="hover:text-text">/data-licenses</a></li>
              <li><a href="/advisory" className="hover:text-text">/advisory</a></li>
              <li><a href="/certified-assessments" className="hover:text-text">/certified-assessments</a></li>
              <li><a href="/enterprise" className="hover:text-text">/enterprise</a></li>
              <li><a href="/contact-sales" className="hover:text-text">/contact-sales</a></li>
            </ul>
          </Panel>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-[28px]">
        <Container>
          <Callout className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-[18px]">
            <div>
              <h2 className="text-[clamp(1.45rem,3vw,2rem)] mb-2">
                Purchase published benchmark research
              </h2>
              <p className="text-muted max-w-[760px]">
                Select a report, bundle, or institutional package, or contact
                the research team for a tailored purchase.
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Button href="#configurator" variant="primary">
                Build your order
              </Button>
              <Button href="/contact-sales">Contact sales</Button>
            </div>
          </Callout>
        </Container>
      </section>
    </>
  );
}
