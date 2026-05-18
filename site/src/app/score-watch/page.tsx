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

/**
 * Hero CTA destination:
 * - When useGumroad is true: route to /indexes#pick-entity-to-watch so the
 *   visitor can pick an entity and subscribe from its detail page.
 * - When useGumroad is false: keep the contact-sales fallback for manual
 *   fulfillment.
 */
const heroCta = SCORE_WATCH.useGumroad
  ? { href: "/indexes#pick-entity-to-watch", external: false }
  : { href: "/contact-sales?product=score-watch#inquiry", external: false };

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
              <Button href={heroCta.href} variant="primary">
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
                No lock-in. Stop the alert at any point. Refund on the unused portion of the year,
                subject to the refund policy below.
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

      {/* Refund policy */}
      <section className="py-12 border-t border-line" id="refund-policy">
        <Container>
          <SectionHead
            title="Refund policy"
            description="We stand behind Score-Watch. If the product doesn't deliver, we refund."
          />
          <Panel>
            <ul className="space-y-4 text-muted">
              <li className="flex gap-3">
                <span className="text-[#7dd3fc] font-bold shrink-0">Within 14 days</span>
                <span>
                  Full refund if no alert has been delivered during the subscription period.
                  Request within 14 days of purchase date.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#7dd3fc] font-bold shrink-0 whitespace-nowrap">15–90 days</span>
                <span>
                  Pro-rated refund for the unused portion of the year (unused months &times;
                  $6.58/mo) if requested after the first alert has been delivered, up to 90 days
                  from purchase.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#7dd3fc] font-bold shrink-0">After 90 days</span>
                <span>
                  No refund after 90 days from purchase. The subscription continues until the
                  annual expiry date.
                </span>
              </li>
            </ul>
            <p className="text-muted mt-4 text-[0.9rem]">
              To request a refund, email{" "}
              <a href="mailto:alerts@compassionbenchmark.com" className="text-[#7dd3fc] hover:underline">
                alerts@compassionbenchmark.com
              </a>
              . Refund requests are processed manually within 5 business days via Gumroad refund.
            </p>
          </Panel>
        </Container>
      </section>

      {/* Independence safeguards */}
      <section className="py-12 border-t border-line" id="independence">
        <Container>
          <SectionHead
            title="Independence safeguards"
            description="Score-Watch is an observer product. It is structurally incapable of influencing what it tracks."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Panel>
              <h3 className="text-[1.08rem] font-bold mb-2">Two separate technical planes</h3>
              <p className="text-muted">
                The assessment pipeline (which produces scores) and the commercial system (which
                sells Score-Watch) run in separate technical planes with no shared credentials or
                network paths. The pipeline cannot read subscriber state; the commercial system
                cannot write scores.{" "}
                <Link href="/methodology" className="text-[#7dd3fc] hover:underline">
                  See methodology
                </Link>
                .
              </p>
            </Panel>
            <Panel>
              <h3 className="text-[1.08rem] font-bold mb-2">Alerts fire from research output only</h3>
              <p className="text-muted">
                The alert sender reads exclusively from the overnight research pipeline&rsquo;s
                change-proposal files. No commercial event — purchase, cancellation, renewal — can
                trigger or suppress an alert. Subscriber lists are invisible to the scoring system.
              </p>
            </Panel>
            <Panel>
              <h3 className="text-[1.08rem] font-bold mb-2">Auditable at the file level</h3>
              <p className="text-muted">
                Every score change is sourced to a git-committed change-proposal file with a
                proposal ID. Alert emails cite the proposal ID. The commercial system has no GitHub
                write token and cannot modify score files.{" "}
                <Link href="/methodology" className="text-[#7dd3fc] hover:underline">
                  Independence methodology
                </Link>
                .
              </p>
            </Panel>
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
              <Button href={heroCta.href} variant="primary">
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
