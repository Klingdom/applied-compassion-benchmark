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

export const metadata: Metadata = { title: "Contact", description: "Contact Compassion Benchmark for general inquiries, research questions, media outreach, or commercial service discussions." };

export default function ContactPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-[72px] pb-10">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-[1.08fr_0.92fr] gap-[18px] items-start">
            <div>
              <Eyebrow>Contact the benchmark institution</Eyebrow>
              <h1 className="text-[clamp(2.3rem,5vw,4.1rem)] leading-[1.03] tracking-[-0.03em] mb-3.5">
                Get in touch with Compassion Benchmark
              </h1>
              <p className="text-muted text-[1.08rem] max-w-[860px] mb-[22px]">
                Contact the benchmark for general inquiries, research questions, media outreach, benchmark interpretation, advisory support, certified assessments, enterprise discussions, and partnership conversations. The organization is currently reachable through a single central contact channel.
              </p>

              <div className="flex items-center gap-3 flex-wrap p-4 rounded-[18px] border border-[rgba(125,211,252,0.18)] bg-[rgba(125,211,252,0.08)] mt-3.5">
                <strong>Email:</strong>
                <a href="mailto:info@compassionbenchmark.com" className="hover:text-accent">info@compassionbenchmark.com</a>
              </div>

              <div className="flex gap-3 flex-wrap mt-4">
                <Button href="mailto:info@compassionbenchmark.com" variant="primary" external>Email the Team</Button>
                <Button href="/contact-sales">Contact Sales</Button>
                <Button href="/services">View Services</Button>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
                <Stat value="General inquiries" label="Questions about the benchmark institution and site" />
                <Stat value="Research inquiries" label="Questions about reports, methodology, and publications" />
                <Stat value="Institutional services" label="Advisory, assessments, licensing, and enterprise" />
                <Stat value="Single contact point" label="Centralized intake through one email channel" />
              </div>
            </div>

            <Panel>
              <h3 className="text-[1.08rem] font-bold mb-2.5">Best use of this page</h3>
              <p className="text-muted mb-3">
                This page is the main contact point for general communication with Compassion Benchmark. If your inquiry is commercial in nature — such as advisory work, certified assessments, enterprise agreements, or research purchases — the fastest path is usually the dedicated sales route.
              </p>
              <Button href="/contact-sales" variant="primary">Go to Contact Sales</Button>
            </Panel>
          </div>
        </Container>
      </section>

      {/* One institution callout */}
      <section className="py-[30px]">
        <Container>
          <Callout>
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] mb-2">One institution, multiple inquiry types</h2>
            <p className="text-muted max-w-[920px]">
              The benchmark serves researchers, journalists, executives, public institutions, technology organizations, and enterprise buyers. This page is designed to help people route their inquiry clearly even while the organization currently operates through one central email channel.
            </p>
          </Callout>
        </Container>
      </section>

      {/* Contact reasons */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="Contact reasons"
            description="Common reasons people and institutions reach out to the benchmark."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card variant="service">
              <div className="flex gap-2.5 flex-wrap">
                <Pill>General</Pill>
                <Pill>Information</Pill>
              </div>
              <h3 className="text-[1.12rem] font-bold">General inquiries</h3>
              <p className="text-muted">
                Ask about the organization, benchmark purpose, current index families, page structure, or how to navigate the public benchmark.
              </p>
              <Button href="mailto:info@compassionbenchmark.com" external>Email General Inquiry</Button>
            </Card>

            <Card variant="service">
              <div className="flex gap-2.5 flex-wrap">
                <Pill>Research</Pill>
                <Pill>Media</Pill>
              </div>
              <h3 className="text-[1.12rem] font-bold">Research and media</h3>
              <p className="text-muted">
                Reach out regarding benchmark methodology, comparative findings, citation questions, media requests, or research collaboration discussions.
              </p>
              <Button href="mailto:info@compassionbenchmark.com" external>Email Research Inquiry</Button>
            </Card>

            <Card variant="service">
              <div className="flex gap-2.5 flex-wrap">
                <Pill>Commercial</Pill>
                <Pill>Services</Pill>
              </div>
              <h3 className="text-[1.12rem] font-bold">Commercial inquiries</h3>
              <p className="text-muted">
                Reach out regarding report purchases, data licensing, advisory support, certified assessments, or enterprise agreements.
              </p>
              <Button href="/contact-sales" variant="primary">Go to Contact Sales</Button>
            </Card>
          </div>
        </Container>
      </section>

      {/* Routing + Helpful pages */}
      <section className="py-[30px]">
        <Container className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-2.5">Best routing by need</h3>
            <ul className="list-disc pl-[18px] text-muted space-y-2">
              <li><strong className="text-text">General benchmark question</strong> → <a href="mailto:info@compassionbenchmark.com" className="hover:text-text">info@compassionbenchmark.com</a></li>
              <li><strong className="text-text">Methodology or research question</strong> → <a href="mailto:info@compassionbenchmark.com" className="hover:text-text">info@compassionbenchmark.com</a></li>
              <li><strong className="text-text">Purchase reports or data</strong> → <a href="/contact-sales" className="hover:text-text">Contact Sales</a></li>
              <li><strong className="text-text">Advisory or assessment inquiry</strong> → <a href="/contact-sales" className="hover:text-text">Contact Sales</a></li>
              <li><strong className="text-text">Enterprise or partnership conversation</strong> → <a href="/contact-sales" className="hover:text-text">Contact Sales</a></li>
            </ul>
          </Panel>
          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-2.5">Helpful pages before contacting</h3>
            <ul className="list-disc pl-[18px] text-muted space-y-2">
              <li><a href="/indexes" className="hover:text-text">Indexes</a> for current public benchmark publications</li>
              <li><a href="/methodology" className="hover:text-text">Methodology</a> for framework and scoring logic</li>
              <li><a href="/research" className="hover:text-text">Research</a> for current research program and reports</li>
              <li><a href="/services" className="hover:text-text">Services</a> for all institutional service lines</li>
              <li><a href="/assess-your-organization" className="hover:text-text">Assess Your Organization</a> for structured review pathways</li>
            </ul>
          </Panel>
        </Container>
      </section>

      {/* What to include */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="What to include in your message"
            description="Clear outreach gets faster routing and a better response."
          />
          <Panel>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">If you are contacting about</th>
                  <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">Helpful details to include</th>
                </tr>
              </thead>
              <tbody className="text-muted">
                {[
                  ["General inquiry", "Your question, the page or index you are referring to, and what you need clarified."],
                  ["Research or media", "Your publication or organization, deadline if relevant, and the benchmark topic or sector you want to discuss."],
                  ["Purchase research", "Which index family, year, and format you want, plus whether the use is individual, institutional, or enterprise."],
                  ["Data licensing", "The target dataset, use case, organization type, and whether you need internal or broader usage rights."],
                  ["Advisory / assessment / enterprise", "Your organization type, goals, timeline, and which service path seems closest to your need."],
                ].map(([about, details]) => (
                  <tr key={about}>
                    <td className="py-3 px-2.5 border-b border-line text-text">{about}</td>
                    <td className="py-3 px-2.5 border-b border-line">{details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </Container>
      </section>

      {/* Common next steps */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="Common next steps from contact"
            description="Most inquiries route into one of the organization's primary benchmark pathways."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card href="/purchase-research">
              <h3 className="text-[1.08rem] font-bold mb-2">Purchase Research</h3>
              <p className="text-muted">For report buying, publication access, and premium research formats.</p>
            </Card>
            <Card href="/data-licenses">
              <h3 className="text-[1.08rem] font-bold mb-2">Data License</h3>
              <p className="text-muted">For structured benchmark datasets and institutional data rights.</p>
            </Card>
            <Card href="/advisory">
              <h3 className="text-[1.08rem] font-bold mb-2">Advisory</h3>
              <p className="text-muted">For interpretation, comparison, briefings, and strategic support.</p>
            </Card>
            <Card href="/certified-assessments">
              <h3 className="text-[1.08rem] font-bold mb-2">Certified Assessments</h3>
              <p className="text-muted">For formal structured review using the benchmark framework.</p>
            </Card>
          </div>
        </Container>
      </section>

      {/* Contact posture + Commercial integrity */}
      <section className="py-[30px]">
        <Container className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-2.5">Current contact posture</h3>
            <p className="text-muted">
              Compassion Benchmark currently operates with a central institutional inbox. This makes it possible to maintain a single public contact point while the broader benchmark research, publication, and service system continues to develop.
            </p>
          </Panel>
          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-2.5">Commercial integrity</h3>
            <p className="text-muted">
              Contacting the organization about paid services does not provide a path to purchase better benchmark rankings, alter public scores, or suppress public benchmark findings. Paid offerings support access, interpretation, structured review, and institutional use only.
            </p>
          </Panel>
        </Container>
      </section>

      {/* Final CTA */}
      <section className="py-[30px]">
        <Container>
          <Callout>
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] mb-2">Start with the right channel</h2>
            <p className="text-muted max-w-[920px] mb-[18px]">
              For general communication, use the central benchmark email. For commercial conversations, go directly to the dedicated sales pathway. Both routes are designed to connect visitors to the right next step quickly and clearly.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Button href="mailto:info@compassionbenchmark.com" variant="primary" external>Email info@compassionbenchmark.com</Button>
              <Button href="/contact-sales">Contact Sales</Button>
            </div>
          </Callout>
        </Container>
      </section>
    </>
  );
}
