import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import Panel from "@/components/ui/Panel";
import Card from "@/components/ui/Card";
import Pill from "@/components/ui/Pill";
import SectionHead from "@/components/ui/SectionHead";
import Callout from "@/components/ui/Callout";
import {
  GUMROAD,
  SCORE_WATCH,
  UNIVERSITIES_INDEX,
  US_CITIES_INDEX,
  US_STATES_INDEX,
  API_ACCESS,
  BOOKING_URL,
} from "@/data/gumroad";
import { EVENTS } from "@/lib/analytics";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Transparent pricing for every tier — self-serve index reports, Score-Watch alerts, Pro access, and institutional data licenses, advisory retainers, and custom deep-dive reports.",
};

/**
 * Resolve a CTA link using the useGumroad flag pattern.
 * When useGumroad is false, routes to the contact-sales fallback so no CTA
 * ever points at a placeholder Gumroad URL that would 404.
 */
function resolveLink(
  gumroadUrl: string,
  useGumroad: boolean,
  fallbackProduct: string,
): { href: string; external: boolean } {
  if (useGumroad) return { href: gumroadUrl, external: true };
  return { href: `/contact-sales?product=${fallbackProduct}`, external: false };
}

/* ── Self-serve tier definitions ─────────────────────────────────── */
const selfServeTiers = [
  {
    key: "free",
    label: "Free",
    price: "$0",
    billing: "always free",
    description:
      "Public indexes, daily briefing digest, and score-band alert emails for any watched entity.",
    cta: "Subscribe free",
    link: { href: "/score-watch", external: false },
  },
  {
    key: "score-watch",
    label: "Score-Watch",
    price: SCORE_WATCH.priceLabel,
    billing: "per entity, annual",
    description:
      "Email alert the moment a watched entity's score or band changes, with the evidence delta.",
    cta: SCORE_WATCH.useGumroad ? "Subscribe — Gumroad" : "Get Score-Watch",
    link: resolveLink(
      GUMROAD.scoreWatch,
      SCORE_WATCH.useGumroad,
      "score-watch",
    ),
  },
  {
    key: "index-report",
    label: "Index Report",
    price: "$49 individual / $195 commercial",
    billing: "one-time per index",
    description:
      "Structured download of a full index — rankings, scores, and dimension breakdown. Instant delivery.",
    cta: "Browse reports",
    link: { href: "/purchase-research", external: false },
  },
  {
    key: "pro",
    label: "Pro",
    price: "$59/mo",
    billing: "or $590/yr (2 months free)",
    description:
      "Daily depth, multi-entity alerting, deeper data views, and early access for active analysts.",
    cta: API_ACCESS.useGumroad ? "Start Pro — Gumroad" : "Get Pro access",
    link: resolveLink(GUMROAD.apiAccess, API_ACCESS.useGumroad, "api-access"),
  },
];

/* ── Institutional tier definitions ─────────────────────────────── */
const institutionalTiers = [
  {
    key: "data-license",
    pills: ["Recurring", "CSV / API"],
    title: "Data License",
    price: "From $1,500/mo",
    priceSub: "or from $18k/yr — annual from $12k",
    description:
      "Full catalog access + daily deltas delivered as CSV/XLSX export or API feed. Covers all indexes, all entities, dimension-level scores.",
    includes: [
      "All 8 published indexes",
      "Dimension-level scores for every entity",
      "Daily delta updates Mon–Sat",
      "Defined usage rights for internal analysis",
      "CSV/XLSX export; API feed available",
    ],
    guardrail:
      "License grants access and usage rights only. Cannot alter inclusion, score, or rank.",
    cta: "Book a 20-min data walkthrough",
    segment: "For ESG teams and portfolio monitoring",
  },
  {
    key: "deep-dive",
    pills: ["One-time", "Custom Report"],
    title: "Custom Deep-Dive Report",
    price: "From $3,500",
    priceSub: "one-time (range $2,500–$5,000 by scope)",
    description:
      "One entity or sector across all 8 dimensions and 40 subdimensions with the full evidence trail. Citable, methodology-backed. Delivered in 5–10 business days.",
    includes: [
      "All 40 subdimension scores + evidence citations",
      "Peer-sector comparison",
      "Citable, methodology-backed findings",
      "5–10 business day turnaround",
    ],
    guardrail:
      "Commissioned by a data user about an entity. The entity does not commission or approve it.",
    cta: "Scope a report",
    segment: "For position memos and newsroom investigations",
  },
  {
    key: "advisory",
    pills: ["Monthly Recurring", "3-mo minimum"],
    title: "Advisory Retainer",
    price: "From $2,500/mo",
    priceSub: "3-month minimum term",
    description:
      "Named analyst on call: sector-specific monthly memo, quarterly briefing, board/IR/regulatory-prep built on published findings.",
    includes: [
      "Named analyst dedicated to your sector",
      "Monthly sector memo",
      "Quarterly briefing session",
      "Board and IR prep support",
      "Ongoing data interpretation and QA",
    ],
    guardrail:
      "Advisory interprets published data for the buyer — never advises a scored entity on how to raise its own score.",
    cta: "Book a call",
    segment: "For ongoing interpretation and board reporting",
  },
];

export default function PricingPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-[72px] pb-10">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-[18px] items-start">
            <div>
              <Eyebrow>Pricing</Eyebrow>
              <h1 className="text-[clamp(2.2rem,5vw,4rem)] leading-[1.04] tracking-[-0.03em] mb-3.5">
                Self-serve or institutional — transparent pricing for every tier
              </h1>
              <p className="text-muted text-[1.08rem] max-w-[860px] mb-[22px]">
                Start free with public indexes and daily alerts. Add Score-Watch
                for per-entity signals, a one-time index report, or Pro daily
                depth. Institutional buyers get a full data license, a custom
                deep-dive, or an advisory retainer — all bookable in 20 minutes.
              </p>
            </div>

            {/* Independence callout — a selling point, not a disclaimer */}
            <Panel>
              <h3 className="text-[1.08rem] font-bold mb-2.5">
                Independence is the product
              </h3>
              <p className="text-muted mb-3">
                Entities never pay for inclusion, score changes, or suppression
                of findings. Every dollar here comes from a{" "}
                <strong className="text-text">data user</strong> — investor,
                researcher, journalist, or foundation — not from a scored entity.
                The research pipeline is structurally isolated from the
                commercial system.
              </p>
              <Button href="/methodology">Review the methodology</Button>
            </Panel>
          </div>
        </Container>
      </section>

      {/* Self-serve strip */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="Self-serve — buy now, no call required"
            description="All self-serve tiers are instant. No sales conversation needed."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {selfServeTiers.map((tier) => (
              <div
                key={tier.key}
                className="bg-gradient-to-b from-[rgba(255,255,255,0.04)] to-[rgba(255,255,255,0.02)] border border-line rounded-[20px] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.28)] flex flex-col gap-3.5"
              >
                <p className="text-[0.82rem] font-semibold text-muted uppercase tracking-wider">
                  {tier.label}
                </p>
                <div>
                  <p className="text-[1.6rem] font-bold leading-tight">
                    {tier.price}
                  </p>
                  <p className="text-[0.82rem] text-muted">{tier.billing}</p>
                </div>
                <p className="text-muted text-[0.95rem] flex-1">
                  {tier.description}
                </p>
                <div className="mt-auto">
                  {tier.link.external ? (
                    <Button
                      href={tier.link.href}
                      variant="primary"
                      full
                      external
                    >
                      {tier.cta}
                    </Button>
                  ) : (
                    <Button
                      href={tier.link.href}
                      variant="primary"
                      full
                      trackAs={EVENTS.PRICING_SELFSERVE_CLICK}
                      trackData={{ tier: tier.key }}
                    >
                      {tier.cta}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Self-serve availability note */}
          <p className="text-muted text-[0.84rem] mt-4">
            Score-Watch self-serve checkout is live. Pro is currently fulfilled
            via the sales team while its Gumroad product is being set up —
            self-serve checkout activates without a page change once it goes live.
          </p>
        </Container>
      </section>

      {/* Also available section for index reports with useGumroad gates */}
      <section className="py-[10px] pb-[30px]">
        <Container>
          <SectionHead
            title="Individual index reports"
            description="Buy a single index as a structured data download. Five indexes are available now on Gumroad; three more route through the sales team while Gumroad products are being created."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(
              [
                {
                  title: "World Countries Index",
                  desc: "193 countries across 8 dimensions.",
                  link: { href: GUMROAD.countriesIndex, external: true },
                },
                {
                  title: "Fortune 500 Index",
                  desc: "447 major U.S. corporations.",
                  link: { href: GUMROAD.fortune500Index, external: true },
                },
                {
                  title: "AI Labs Index",
                  desc: "50 frontier and applied AI labs.",
                  link: { href: GUMROAD.aiLabsIndex, external: true },
                },
                {
                  title: "Humanoid Robotics Index",
                  desc: "50 global robotics developers.",
                  link: { href: GUMROAD.roboticsIndex, external: true },
                },
                {
                  title: "Global Cities Index",
                  desc: "250 cities worldwide.",
                  link: { href: GUMROAD.globalCitiesIndex, external: true },
                },
                /* useGumroad-gated products — route to contact-sales until real Gumroad products exist */
                {
                  title: "U.S. Cities Index",
                  desc: "144 U.S. cities scored.",
                  link: resolveLink(
                    GUMROAD.usCitiesIndex,
                    US_CITIES_INDEX.useGumroad,
                    "us-cities-index",
                  ),
                },
                {
                  title: "U.S. States Index",
                  desc: "21 U.S. states scored to date.",
                  link: resolveLink(
                    GUMROAD.usStatesIndex,
                    US_STATES_INDEX.useGumroad,
                    "us-states-index",
                  ),
                },
                {
                  title: "Universities Index",
                  desc: "100 universities scored.",
                  link: resolveLink(
                    GUMROAD.universitiesIndex,
                    UNIVERSITIES_INDEX.useGumroad,
                    "universities-index",
                  ),
                },
              ] as Array<{
                title: string;
                desc: string;
                link: { href: string; external: boolean };
              }>
            ).map((item) => (
              <div
                key={item.title}
                className="bg-gradient-to-b from-[rgba(255,255,255,0.04)] to-[rgba(255,255,255,0.02)] border border-line rounded-[20px] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.28)] flex flex-col gap-3"
              >
                <div className="flex gap-2 flex-wrap">
                  <Pill>$49 individual</Pill>
                  <Pill>$195 commercial</Pill>
                </div>
                <h3 className="text-[1.05rem] font-bold">{item.title}</h3>
                <p className="text-muted text-[0.93rem] flex-1">{item.desc}</p>
                <div className="mt-auto">
                  {item.link.external ? (
                    <Button
                      href={item.link.href}
                      variant="primary"
                      full
                      external
                    >
                      Purchase on Gumroad
                    </Button>
                  ) : (
                    <Button
                      href={item.link.href}
                      full
                      trackAs={EVENTS.PRICING_REPORT_REQUEST}
                      trackData={{ index: item.title }}
                    >
                      Request report
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Institutional grid */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="Institutional — book a 20-minute data walkthrough"
            description="These tiers close on a call. Book below and we will scope and send a one-page proposal within 24 hours."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {institutionalTiers.map((tier) => (
              <Card key={tier.key} variant="service">
                <div className="flex gap-2 flex-wrap">
                  {tier.pills.map((p) => (
                    <Pill key={p}>{p}</Pill>
                  ))}
                </div>

                <div>
                  <h3 className="text-[1.18rem] font-bold">{tier.title}</h3>
                  <p className="text-[0.82rem] text-muted">{tier.segment}</p>
                </div>

                <div>
                  <p className="text-[1.7rem] font-bold leading-tight">
                    {tier.price}
                  </p>
                  <p className="text-[0.82rem] text-muted">{tier.priceSub}</p>
                </div>

                <p className="text-muted text-[0.95rem]">{tier.description}</p>

                <ul className="list-disc pl-[18px] text-muted text-[0.9rem] space-y-1.5">
                  {tier.includes.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>

                {/* Independence guardrail — always visible */}
                <p className="text-[0.82rem] text-muted border-t border-line pt-3">
                  {tier.guardrail}
                </p>

                <Button
                  href={BOOKING_URL}
                  variant="primary"
                  full
                  trackAs={EVENTS.PRICING_BOOKING_CLICK}
                  trackData={{ tier: tier.key }}
                >
                  {tier.cta}
                </Button>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Enterprise footer strip */}
      <section className="py-[30px]">
        <Container>
          <Panel>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-[18px]">
              <div>
                <h3 className="text-[1.08rem] font-bold mb-1.5">Enterprise</h3>
                <p className="text-muted max-w-[680px]">
                  Multi-team, all-indexes, API feed, or custom scope? Enterprise
                  agreements from{" "}
                  <strong className="text-text">$30k/yr</strong> — aligns with
                  our existing Institutional Data Pack and Annual Bundle tiers.
                  Covers recurring data access, optional advisory, and tailored
                  usage rights across teams.
                </p>
              </div>
              <Button
                href={BOOKING_URL}
                variant="primary"
                trackAs={EVENTS.PRICING_BOOKING_CLICK}
                trackData={{ tier: "enterprise" }}
              >
                Talk to us
              </Button>
            </div>
          </Panel>
        </Container>
      </section>

      {/* Upgrade path */}
      <section className="py-[30px]">
        <Container className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-2.5">
              Natural upgrade path
            </h3>
            <ul className="text-muted space-y-2.5 text-[0.95rem]">
              <li>
                <span className="text-text font-semibold">Free</span> — public
                indexes + daily briefing
              </li>
              <li className="pl-4 border-l border-line">
                <span className="text-text font-semibold">
                  Score-Watch $79/yr
                </span>{" "}
                — track 1 entity
              </li>
              <li className="pl-4 border-l border-line">
                <span className="text-text font-semibold">Pro $59/mo</span> —
                multi-entity depth
              </li>
              <li className="pl-4 border-l border-line">
                <span className="text-text font-semibold">
                  Data License $1,500/mo
                </span>{" "}
                — full portfolio monitoring
              </li>
              <li className="pl-4 border-l border-line">
                <span className="text-text font-semibold">
                  Advisory $2,500/mo
                </span>{" "}
                — ongoing interpretation
              </li>
            </ul>
            <p className="text-muted text-[0.84rem] mt-3">
              One-time spike at any stage:{" "}
              <strong className="text-text">Custom Deep-Dive $3,500</strong>
            </p>
          </Panel>

          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-2.5">
              Discounts and access programs
            </h3>
            <ul className="list-disc pl-[18px] text-muted text-[0.95rem] space-y-2">
              <li>
                <span className="text-text font-semibold">
                  Annual prepay:
                </span>{" "}
                10–15% off institutional tiers
              </li>
              <li>
                <span className="text-text font-semibold">
                  Academic / nonprofit / newsroom:
                </span>{" "}
                30–50% off self-serve and data license — contact us
              </li>
              <li>
                <span className="text-text font-semibold">
                  Reference account:
                </span>{" "}
                one early newsroom at break-even in exchange for public
                attribution
              </li>
            </ul>
            <p className="text-muted text-[0.84rem] mt-3 border-t border-line pt-3">
              No discount is ever conditioned on anything that touches a score.
            </p>
          </Panel>
        </Container>
      </section>

      {/* Independence statement — prominent, not a buried disclaimer */}
      <section className="py-[30px]">
        <Container>
          <Callout>
            <h2 className="text-[clamp(1.35rem,3vw,1.75rem)] mb-2">
              Independence is the selling point
            </h2>
            <p className="text-muted max-w-[820px] mb-4">
              Entities never pay for inclusion, score changes, or suppression of
              findings. Commercial products are sold to data users — investors,
              journalists, researchers, foundations — not to the entities being
              scored. The assessment pipeline operates on a structurally
              separate technical plane from the commercial system. This
              separation is documented publicly at{" "}
              <a href="/methodology" className="text-accent hover:underline">
                compassionbenchmark.com/methodology
              </a>{" "}
              and enforced at the code level.
            </p>
            <p className="text-muted text-[0.9rem]">
              Buyers pay a premium precisely because the data cannot be gamed by
              the entity they are evaluating.
            </p>
          </Callout>
        </Container>
      </section>

      {/* Quiet Certified Assessment path — de-emphasized per REVENUE_MODEL.md §5.7 */}
      <section className="py-[20px]">
        <Container>
          <p className="text-muted text-[0.9rem] text-center">
            Are you an institution seeking a formal internal evidence review?{" "}
            <a
              href="/certified-assessments"
              className="text-accent hover:underline"
            >
              Certified Assessments
            </a>{" "}
            — available for inbound requests.
          </p>
        </Container>
      </section>

      {/* Final CTA */}
      <section className="py-[30px]">
        <Container>
          <Callout className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-[18px]">
            <div>
              <h2 className="text-[clamp(1.45rem,3vw,2rem)] mb-2">
                Ready to start?
              </h2>
              <p className="text-muted max-w-[640px]">
                Book a 20-minute data walkthrough for institutional tiers, or
                jump straight into self-serve.
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Button
                href={BOOKING_URL}
                variant="primary"
                trackAs={EVENTS.PRICING_BOOKING_CLICK}
                trackData={{ tier: "final-cta" }}
              >
                Book a walkthrough
              </Button>
              <Button href="/purchase-research">Browse reports</Button>
            </div>
          </Callout>
        </Container>
      </section>
    </>
  );
}
