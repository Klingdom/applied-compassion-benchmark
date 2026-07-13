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
import DonateCTA from "@/components/nonprofit/DonateCTA";

// One unified general contact — no "sales" framing, no routing by deal size.
// Mirrors the existing /contact page's mailto-based pattern (static-export
// safe, no server post) per docs/NONPROFIT_ALT_PAGES_BRIEF_2026-07-12.md and
// docs/NONPROFIT_ALT_MESSAGING_2026-07-12.md §5 ("Contact" row).

const CONTACT_EMAIL = "info@compassionbenchmark.com";

function mailtoWithSubject(subject: string) {
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`;
}

export const metadata: Metadata = {
  title: "Contact — Compassion Benchmark (Nonprofit)",
  description:
    "Contact Compassion Benchmark for general questions, press inquiries, research questions, partnerships, or support — one unified contact channel, no sales routing.",
};

export default function NonprofitAltContactPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-[72px] pb-10">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-[1.08fr_0.92fr] gap-[18px] items-start">
            <div>
              <Eyebrow>Contact the institution</Eyebrow>
              <h1 className="text-[clamp(2.3rem,5vw,4.1rem)] leading-[1.03] tracking-[-0.03em] mb-3.5">
                Get in touch
              </h1>
              <p className="text-muted text-[1.08rem] max-w-[860px] mb-[22px]">
                Reach out with a general question, a press inquiry, a research
                question, a partnership idea, or a question about supporting
                the work. Compassion Benchmark operates through a single,
                unified contact channel &mdash; there is no separate sales
                intake, and no inquiry is routed by deal size.
              </p>

              <div className="flex items-center gap-3 flex-wrap p-4 rounded-[18px] border border-[rgba(125,211,252,0.18)] bg-[rgba(125,211,252,0.08)] mt-3.5">
                <strong>Email:</strong>
                <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-accent">{CONTACT_EMAIL}</a>
              </div>

              <div className="flex gap-3 flex-wrap mt-4">
                <Button href={`mailto:${CONTACT_EMAIL}`} variant="primary" external>Send a message</Button>
                <Button href="/nonprofit-alt/support">Support the benchmark</Button>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
                <Stat value="General" label="Questions about the institution and the site" />
                <Stat value="Press · Researchers" label="Methodology, findings, and citation questions" />
                <Stat value="Partnerships" label="Mission-aligned, unpaid collaboration" />
                <Stat value="Support" label="Supporter, sustainer, benefactor, or grant questions" />
              </div>
            </div>

            <Panel>
              <h3 className="text-[1.08rem] font-bold mb-2.5">Best use of this page</h3>
              <p className="text-muted mb-3">
                This is the single contact point for Compassion Benchmark.
                Whatever the reason for reaching out &mdash; a general
                question, press, research, a partnership idea, or support
                &mdash; the same channel gets to the same team.
              </p>
              <Button href={`mailto:${CONTACT_EMAIL}`} variant="primary" external>Email the team</Button>
            </Panel>
          </div>
        </Container>
      </section>

      {/* One institution callout */}
      <section className="py-[30px]">
        <Container>
          <Callout>
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] mb-2">One institution, one contact channel</h2>
            <p className="text-muted max-w-[920px]">
              The benchmark serves readers, researchers, journalists, policy
              leaders, foundations, and supporters. This page is designed to
              help every one of them reach the same team clearly, without a
              tiered or sales-style routing structure.
            </p>
          </Callout>
        </Container>
      </section>

      {/* Contact topics */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="Contact topics"
            description="Common reasons people reach out — every one of them goes to the same inbox."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <Card variant="service">
              <div className="flex gap-2.5 flex-wrap">
                <Pill>General</Pill>
              </div>
              <h3 className="text-[1.05rem] font-bold">General</h3>
              <p className="text-muted text-[0.9rem]">
                Questions about the organization, the mission, or how to
                navigate the public benchmark.
              </p>
              <Button href={mailtoWithSubject("General inquiry")} external className="text-[0.9rem]">
                Email &rarr;
              </Button>
            </Card>

            <Card variant="service">
              <div className="flex gap-2.5 flex-wrap">
                <Pill>Press</Pill>
              </div>
              <h3 className="text-[1.05rem] font-bold">Press</h3>
              <p className="text-muted text-[0.9rem]">
                Media requests, interview asks, and questions about a specific
                finding or index.
              </p>
              <Button href={mailtoWithSubject("Press inquiry")} external className="text-[0.9rem]">
                Email &rarr;
              </Button>
            </Card>

            <Card variant="service">
              <div className="flex gap-2.5 flex-wrap">
                <Pill>Researchers</Pill>
              </div>
              <h3 className="text-[1.05rem] font-bold">Researchers</h3>
              <p className="text-muted text-[0.9rem]">
                Methodology questions, citation guidance, and reproducibility
                or evidence-trail questions.
              </p>
              <Button href={mailtoWithSubject("Research question")} external className="text-[0.9rem]">
                Email &rarr;
              </Button>
            </Card>

            <Card variant="service">
              <div className="flex gap-2.5 flex-wrap">
                <Pill>Partnerships</Pill>
              </div>
              <h3 className="text-[1.05rem] font-bold">Partnerships</h3>
              <p className="text-muted text-[0.9rem]">
                Unpaid mission partnerships and grant or foundation
                conversations &mdash; see the support page for the funders
                value proposition.
              </p>
              <Button href={mailtoWithSubject("Partnership / funding inquiry")} external className="text-[0.9rem]">
                Email &rarr;
              </Button>
            </Card>

            <Card variant="service">
              <div className="flex gap-2.5 flex-wrap">
                <Pill>Support</Pill>
              </div>
              <h3 className="text-[1.05rem] font-bold">Support</h3>
              <p className="text-muted text-[0.9rem]">
                Questions about becoming a supporter, sustainer, or
                benefactor, or about giving a one-time gift.
              </p>
              <Button href="/nonprofit-alt/support" variant="primary" className="text-[0.9rem]">
                Go to Support &rarr;
              </Button>
            </Card>
          </div>
        </Container>
      </section>

      {/* Helpful pages before contacting */}
      <section className="py-[30px]">
        <Container className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-2.5">What to include in your message</h3>
            <ul className="list-disc pl-[18px] text-muted space-y-2">
              <li>Your name and, if relevant, your organization</li>
              <li>The page, index, or finding you&apos;re referring to, if any</li>
              <li>What you need &mdash; a question answered, a correction reviewed, a partnership discussed, or a funding conversation started</li>
              <li>Any deadline, if you&apos;re press or on a grant timeline</li>
            </ul>
          </Panel>
          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-2.5">Helpful pages before contacting</h3>
            <ul className="list-disc pl-[18px] text-muted space-y-2">
              <li><a href="/nonprofit-alt/indexes" className="hover:text-text">Indexes</a> for current public benchmark publications</li>
              <li><a href="/nonprofit-alt/methodology" className="hover:text-text">Methodology</a> for framework, scoring logic, and the independence policy</li>
              <li><a href="/nonprofit-alt/research" className="hover:text-text">Research</a> for the research program and the grants/foundations path</li>
              <li><a href="/nonprofit-alt/support" className="hover:text-text">Support</a> for donation tiers and ways to contribute</li>
              <li><a href="/nonprofit-alt/tools" className="hover:text-text">Tools</a> for the free self-assessment</li>
            </ul>
          </Panel>
        </Container>
      </section>

      {/* Contact posture */}
      <section className="py-[30px]">
        <Container>
          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-2.5">Current contact posture</h3>
            <p className="text-muted">
              Compassion Benchmark currently operates with a single central
              institutional inbox. This keeps one public contact point across
              press, research, partnership, and support questions while the
              benchmark research and publication program continues to grow.
              Contacting the organization never opens a path to a better
              score, a changed rank, or the suppression of a finding &mdash;
              for any reason, including a gift or a grant.
            </p>
          </Panel>
        </Container>
      </section>

      {/* Light support nudge */}
      <section className="py-[30px]">
        <Container>
          <DonateCTA
            heading="Already know you want to support the work?"
            description="Skip the message — become a supporter directly."
            showTiers={false}
          />
        </Container>
      </section>

      {/* Final CTA */}
      <section className="py-[30px]">
        <Container>
          <Callout>
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] mb-2">Start a conversation</h2>
            <p className="text-muted max-w-[920px] mb-[18px]">
              One email address, one team, and no routing by inquiry size.
              Send a message and we&apos;ll follow up.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Button href={`mailto:${CONTACT_EMAIL}`} variant="primary" external>Email {CONTACT_EMAIL}</Button>
              <Button href="/nonprofit-alt/support">Support the benchmark</Button>
            </div>
          </Callout>
        </Container>
      </section>
    </>
  );
}
