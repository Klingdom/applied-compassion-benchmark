import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import Stat from "@/components/ui/Stat";
import Panel from "@/components/ui/Panel";
import Card from "@/components/ui/Card";
import SectionHead from "@/components/ui/SectionHead";
import Callout from "@/components/ui/Callout";

export const metadata: Metadata = { title: "Contact Sales" };

export default function ContactSalesPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-[72px] pb-10">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-[18px] items-start">
            <div>
              <Eyebrow>Sales and service inquiries</Eyebrow>
              <h1 className="text-[clamp(2.2rem,5vw,4rem)] leading-[1.04] tracking-[-0.03em] mb-3.5">
                Contact sales
              </h1>
              <p className="text-muted text-[1.08rem] max-w-[860px] mb-[22px]">
                Contact the benchmark team to purchase research, discuss data licensing, scope advisory support, request a certified assessment, or explore an enterprise agreement. This page is designed to route serious inquiries into the right commercial pathway while preserving the independence of the published benchmark.
              </p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <Stat value="Research" label="Reports and bundles" />
                <Stat value="Licensing" label="Structured data access" />
                <Stat value="Advisory" label="Interpretation and strategy" />
                <Stat value="Enterprise" label="Institutional agreements" />
              </div>
            </div>
            <Panel>
              <h3 className="text-[1.08rem] font-bold mb-2.5">Use this page for</h3>
              <p className="text-muted mb-3">
                Use this page to request pricing, scope a service, discuss institutional needs, or route a benchmark-related commercial inquiry to the appropriate service line.
              </p>
              <div className="flex gap-3 flex-wrap">
                <Button href="mailto:info@compassionbenchmark.com" variant="primary" external>Email sales inquiry</Button>
                <Button href="/services">View services</Button>
              </div>
            </Panel>
          </div>
        </Container>
      </section>

      {/* Common reasons */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="Common reasons to contact sales"
            description="This page should make it easy for different buyers to recognize their path."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "Purchase a benchmark report", desc: "Buy a report by year, target area, format, or institutional use need." },
              { title: "License benchmark data", desc: "Request structured datasets, usage rights, or recurring data access." },
              { title: "Book interpretation support", desc: "Scope briefings, comparison memos, executive sessions, or workshops." },
              { title: "Request a formal assessment", desc: "Discuss assessor-led reviews, structured evaluation, or improvement pathways." },
              { title: "Explore enterprise access", desc: "Combine research, licensing, advisory, and assessments into one agreement." },
              { title: "Discuss a custom need", desc: "Request a tailored package for sector research, comparative analysis, or institutional support." },
            ].map((item) => (
              <Card key={item.title}>
                <h3 className="text-[1.08rem] font-bold mb-2">{item.title}</h3>
                <p className="text-muted">{item.desc}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Fastest routing + What sales can help with */}
      <section className="py-[30px]">
        <Container className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-2.5">Fastest routing by intent</h3>
            <ul className="list-disc pl-[18px] text-muted space-y-2">
              <li><span className="text-text font-semibold">I want a report:</span> Purchase Research</li>
              <li><span className="text-text font-semibold">I want spreadsheet-ready data:</span> Data License</li>
              <li><span className="text-text font-semibold">I want help interpreting findings:</span> Advisory Consulting</li>
              <li><span className="text-text font-semibold">I want a formal review:</span> Certified Assessment</li>
              <li><span className="text-text font-semibold">I want a recurring institutional relationship:</span> Enterprise Agreement</li>
            </ul>
          </Panel>
          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-2.5">What sales can help with</h3>
            <ul className="list-disc pl-[18px] text-muted space-y-2">
              <li>Scoping the right product or service path</li>
              <li>Determining the right year, target area, and delivery model</li>
              <li>Choosing between report, data, advisory, assessment, and enterprise options</li>
              <li>Clarifying institutional use rights and support models</li>
              <li>Preparing custom proposals for larger engagements</li>
            </ul>
          </Panel>
        </Container>
      </section>

      {/* Service routing guide */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="Service routing guide"
            description="This table helps buyers understand where their request will go."
          />
          <Panel>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">Need</th>
                  <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">Best page</th>
                  <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">Typical buyer</th>
                  <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">Outcome</th>
                </tr>
              </thead>
              <tbody className="text-muted">
                {[
                  ["Buy a benchmark report or annual bundle", "/purchase-research", "Researchers, executives, analysts, policy teams", "Report purchase or quote"],
                  ["License benchmark data", "/data-licenses", "Institutions, academic teams, enterprise users", "Data license proposal"],
                  ["Interpret benchmark findings", "/advisory", "Executives, boards, strategy teams", "Advisory scope and proposal"],
                  ["Request a structured formal review", "/certified-assessments", "Organizations seeking formal benchmark evaluation", "Assessment scoping"],
                  ["Establish a larger institutional relationship", "/enterprise", "Enterprise, government, university, investor, multi-unit client", "Enterprise discussion"],
                ].map(([need, page, buyer, outcome]) => (
                  <tr key={need}>
                    <td className="py-3 px-2.5 border-b border-line text-text">{need}</td>
                    <td className="py-3 px-2.5 border-b border-line"><a href={page} className="hover:text-text">{page}</a></td>
                    <td className="py-3 px-2.5 border-b border-line">{buyer}</td>
                    <td className="py-3 px-2.5 border-b border-line">{outcome}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </Container>
      </section>

      {/* Commercial integrity + Operational */}
      <section className="py-[30px]">
        <Container className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-2.5">Commercial integrity policy</h3>
            <ul className="list-disc pl-[18px] text-muted space-y-2">
              <li>Commercial inquiries do not affect benchmark inclusion</li>
              <li>Commercial inquiries do not affect rank or score</li>
              <li>Public benchmark publication remains independent</li>
              <li>Services are sold around access, interpretation, review, and institutional support</li>
              <li>Benchmark methodology is not tailored to a buyer{"\u2019"}s preferred outcome</li>
            </ul>
          </Panel>
          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-2.5">Recommended operational use</h3>
            <ul className="list-disc pl-[18px] text-muted space-y-2">
              <li>Connect this page to a CRM or form tool</li>
              <li>Auto-route by service type and buyer type</li>
              <li>Trigger different email templates for different service categories</li>
              <li>Use this page as the primary CTA destination from all services pages</li>
              <li>Track inquiry volume by target area and service interest</li>
            </ul>
          </Panel>
        </Container>
      </section>

      {/* Final CTA */}
      <section className="py-[30px]">
        <Container>
          <Callout>
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] mb-2">Talk to the benchmark team</h2>
            <p className="text-muted max-w-[760px] mb-[18px]">
              Start a conversation about research access, licensing, advisory support, assessments, or enterprise agreements.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Button href="mailto:info@compassionbenchmark.com" variant="primary" external>Submit inquiry</Button>
              <Button href="/services">View all services</Button>
            </div>
          </Callout>
        </Container>
      </section>
    </>
  );
}
