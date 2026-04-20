import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import Panel from "@/components/ui/Panel";
import SectionHead from "@/components/ui/SectionHead";
import Card from "@/components/ui/Card";
import Callout from "@/components/ui/Callout";
import { SCORE_WATCH } from "@/data/gumroad";

export const metadata: Metadata = {
  title: "Score-Watch Alert — Get notified when an entity's compassion score changes",
  description:
    "Per-entity email alerts the moment overnight research moves a Compassion Benchmark score. $79/year per entity. Covers Fortune 500, countries, AI labs, robotics labs, global and U.S. cities, and U.S. states.",
};

const indexes: Array<{ label: string; href: string; count: string }> = [
  { label: "Fortune 500", href: "/fortune-500", count: "447 companies" },
  { label: "Countries", href: "/countries", count: "193 countries" },
  { label: "U.S. States", href: "/us-states", count: "21 states" },
  { label: "AI Labs", href: "/ai-labs", count: "50 labs" },
  { label: "Robotics Labs", href: "/robotics-labs", count: "50 labs" },
  { label: "Global Cities", href: "/global-cities", count: "250 cities" },
  { label: "U.S. Cities", href: "/us-cities", count: "144 cities" },
];

export default function ScoreWatchPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-[72px] pb-10 border-b border-line">
        <Container>
          <div className="max-w-4xl">
            <Eyebrow>Subscription product</Eyebrow>
            <h1 className="text-[clamp(2.2rem,5vw,4rem)] leading-[1.04] tracking-[-0.03em] mb-4">
              Score-Watch Alert
            </h1>
            <p className="text-muted text-[1.12rem] max-w-[760px] mb-6">
              Email the moment a tracked entity&rsquo;s Compassion Benchmark score moves. Delta,
              band change, headline evidence, and a link to the full assessment — delivered the
              morning after overnight research flags the change.
            </p>
            <div className="flex flex-wrap gap-3 items-center">
              <Button href="/contact-sales?product=score-watch#inquiry" variant="primary">
                Subscribe — {SCORE_WATCH.priceShort} per entity
              </Button>
              <span className="text-muted text-[0.95rem]">
                One year. Cancel anytime. Covers every entity in every index.
              </span>
            </div>
          </div>
        </Container>
      </section>

      {/* What you get */}
      <section className="py-12">
        <Container>
          <SectionHead
            title="What you get"
            description="A concrete, per-entity signal — not another weekly newsletter."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <h3 className="text-[1.08rem] font-bold mb-2">Per-entity email alert</h3>
              <p className="text-muted">
                One email per score change for the entity you&rsquo;re watching. No generalist
                digest. No marketing blasts.
              </p>
            </Card>
            <Card>
              <h3 className="text-[1.08rem] font-bold mb-2">Delta, band change, evidence</h3>
              <p className="text-muted">
                Every alert includes the composite delta, whether the entity crossed a band
                boundary (e.g., Functional → Developing), and the headline evidence behind the
                change.
              </p>
            </Card>
            <Card>
              <h3 className="text-[1.08rem] font-bold mb-2">Link to full assessment</h3>
              <p className="text-muted">
                Click through to the daily briefing with full evidence, dimension-level analysis,
                and confidence score.
              </p>
            </Card>
            <Card>
              <h3 className="text-[1.08rem] font-bold mb-2">Overnight research, six days a week</h3>
              <p className="text-muted">
                The pipeline scans 1,155 entities for evidence every night Monday–Saturday. Your
                alerts land in your inbox the morning after a change is confirmed.
              </p>
            </Card>
            <Card>
              <h3 className="text-[1.08rem] font-bold mb-2">Independence-preserving</h3>
              <p className="text-muted">
                Subscription purchase does not affect the score. Entities never pay for inclusion,
                score changes, or suppression. See{" "}
                <Link href="/about" className="text-[#7dd3fc] hover:underline">
                  the independence policy
                </Link>
                .
              </p>
            </Card>
            <Card>
              <h3 className="text-[1.08rem] font-bold mb-2">Cancel anytime</h3>
              <p className="text-muted">
                No lock-in. Stop the alert at any point. Refund on the unused portion of the year.
              </p>
            </Card>
          </div>
        </Container>
      </section>

      {/* How it works */}
      <section className="py-12 border-y border-line bg-[rgba(255,255,255,0.02)]">
        <Container>
          <SectionHead
            title="How it works"
            description="Three steps. No configuration. No dashboards."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Panel>
              <div className="text-[#7dd3fc] text-[0.82rem] font-bold uppercase tracking-wider mb-2">
                Step 1
              </div>
              <h3 className="text-[1.08rem] font-bold mb-2">Pick an entity</h3>
              <p className="text-muted">
                Browse any of the seven indexes below and find the entity you want to watch. Any
                assessed entity is eligible — companies, countries, labs, states, cities.
              </p>
            </Panel>
            <Panel>
              <div className="text-[#7dd3fc] text-[0.82rem] font-bold uppercase tracking-wider mb-2">
                Step 2
              </div>
              <h3 className="text-[1.08rem] font-bold mb-2">Subscribe from the entity page</h3>
              <p className="text-muted">
                On the entity&rsquo;s detail page, click <em>Subscribe — {SCORE_WATCH.priceShort}</em>.
                The subscription is scoped to that entity. Add more entities by subscribing again.
              </p>
            </Panel>
            <Panel>
              <div className="text-[#7dd3fc] text-[0.82rem] font-bold uppercase tracking-wider mb-2">
                Step 3
              </div>
              <h3 className="text-[1.08rem] font-bold mb-2">Receive alerts when scores move</h3>
              <p className="text-muted">
                Overnight research runs six nights a week. When the assessment moves an entity
                you&rsquo;re watching, an alert is in your inbox by morning.
              </p>
            </Panel>
          </div>
        </Container>
      </section>

      {/* Which entities */}
      <section className="py-12">
        <Container>
          <SectionHead
            title="Eligible entities — every benchmark index"
            description="1,155 entities across seven indexes. Every assessed entity has a detail page and can be watched."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {indexes.map((idx) => (
              <Link
                key={idx.href}
                href={idx.href}
                className="block rounded-[14px] border border-line bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(125,211,252,0.05)] hover:border-[rgba(125,211,252,0.3)] p-4 transition-colors"
              >
                <div className="font-semibold text-[1rem] mb-0.5">{idx.label}</div>
                <div className="text-muted text-[0.88rem]">{idx.count}</div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Typical buyers */}
      <section className="py-12 border-t border-line">
        <Container>
          <SectionHead
            title="Who buys Score-Watch"
            description="Teams and individuals who need to track a specific institution continuously, not periodically."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <h3 className="text-[1.08rem] font-bold mb-2">Investors and analysts</h3>
              <p className="text-muted">
                Tracking ESG risk signals for one or more portfolio companies. $79/yr per name is a
                fraction of one analyst hour — and the signal lands before it&rsquo;s in the news
                cycle.
              </p>
            </Card>
            <Card>
              <h3 className="text-[1.08rem] font-bold mb-2">Policy and trust-and-safety teams</h3>
              <p className="text-muted">
                Watching AI labs, robotics companies, or platform operators for governance signals
                that affect policy work. Alerts include legislative context when relevant.
              </p>
            </Card>
            <Card>
              <h3 className="text-[1.08rem] font-bold mb-2">NGOs and journalists</h3>
              <p className="text-muted">
                Tracking institutions on your beat. Every alert is evidence-linked and citable.
                Source list included.
              </p>
            </Card>
            <Card>
              <h3 className="text-[1.08rem] font-bold mb-2">Executives at benchmarked institutions</h3>
              <p className="text-muted">
                Know when your own score moves, what triggered it, and what evidence is now public
                — before a stakeholder asks.
              </p>
            </Card>
          </div>
        </Container>
      </section>

      {/* Closing CTA */}
      <section className="py-12 border-t border-line">
        <Container>
          <Callout>
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] mb-2">Start with one entity</h2>
            <p className="text-muted max-w-[760px] mb-5">
              Most subscribers start with one entity and add more as the need becomes concrete. No
              annual commitment beyond the one subscription. Cancel anytime.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Button href="/contact-sales?product=score-watch#inquiry" variant="primary">
                Subscribe — {SCORE_WATCH.priceShort} per entity
              </Button>
              <Button href="/indexes">Browse entities</Button>
            </div>
          </Callout>
        </Container>
      </section>
    </>
  );
}
