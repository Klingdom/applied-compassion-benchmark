import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import Panel from "@/components/ui/Panel";
import SectionHead from "@/components/ui/SectionHead";
import Callout from "@/components/ui/Callout";
import SupporterCta from "./SupporterCta";
import supportersData from "@/data/supporters.json";

export const metadata: Metadata = {
  title: "Supporters — Compassion Benchmark",
  description:
    "Support independent benchmark research with a monthly contribution. Supporters keep the Compassion Benchmark free and independent.",
};

interface Supporter {
  name: string;
  since: string;
}

const supporters: Supporter[] = supportersData.supporters;

export default function SupportersPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-[72px] pb-10 border-b border-line">
        <Container>
          <div className="max-w-4xl">
            <Eyebrow>Supporter tier</Eyebrow>
            <h1 className="text-[clamp(2.2rem,5vw,4rem)] leading-[1.04] tracking-[-0.03em] mb-4">
              Support independent benchmark research
            </h1>
            <p className="text-muted text-[1.12rem] max-w-[760px] mb-6">
              Compassion Benchmark is an independent institution. Supporters help keep it free,
              public, and funded outside of entity fees or sponsored research. A monthly
              contribution of $5, $10, or $25 goes directly toward maintaining and expanding the
              benchmark.
            </p>
            <SupporterCta />
          </div>
        </Container>
      </section>

      {/* What supporters get */}
      <section className="py-12">
        <Container>
          <SectionHead
            title="What supporters get"
            description="Supporter contributions are a vote for independent research, not a purchase of access or influence."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Panel>
              <h3 className="text-[1.08rem] font-bold mb-2">Optional name listing</h3>
              <p className="text-muted">
                Active supporters may have their name listed on this page (opt-in). No company
                logos, no link placements — names only.
              </p>
            </Panel>
            <Panel>
              <h3 className="text-[1.08rem] font-bold mb-2">Gratitude, not influence</h3>
              <p className="text-muted">
                Supporters do not influence scores, entity inclusion, or research priorities.
                Independence is non-negotiable regardless of support level.
              </p>
            </Panel>
            <Panel>
              <h3 className="text-[1.08rem] font-bold mb-2">Cancel anytime</h3>
              <p className="text-muted">
                Monthly billing via Gumroad. Cancel anytime from your Gumroad account. No
                commitment.
              </p>
            </Panel>
          </div>
        </Container>
      </section>

      {/* Independence note */}
      <section className="py-12 border-t border-line">
        <Container>
          <Callout>
            <h2 className="text-[clamp(1.4rem,2.5vw,1.8rem)] mb-3">
              Supporters do not influence scores or entity inclusion
            </h2>
            <p className="text-muted max-w-[820px]">
              Compassion Benchmark operates two independent technical planes. The assessment
              pipeline — which produces all scores — has no access to supporter records, payment
              data, or any commercial system. Supporting the benchmark contributes to its
              operational continuity; it cannot affect how any entity is scored, included, or
              ranked.
            </p>
          </Callout>
        </Container>
      </section>

      {/* Tiers */}
      <section className="py-12 border-t border-line">
        <Container>
          <SectionHead
            title="Supporter tiers"
            description="Choose the level that feels right. All tiers receive the same acknowledgment."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { amount: "$5 / month", label: "Basic supporter", desc: "Covers infrastructure costs for one assessed entity per month." },
              { amount: "$10 / month", label: "Contributing supporter", desc: "Covers nightly research pipeline costs for a small index cohort." },
              { amount: "$25 / month", label: "Sustaining supporter", desc: "Sustains ongoing research, scoring, and public access for a sector." },
            ].map((tier) => (
              <div
                key={tier.amount}
                className="bg-gradient-to-b from-[rgba(255,255,255,0.04)] to-[rgba(255,255,255,0.02)] border border-line rounded-[20px] p-6 flex flex-col gap-3"
              >
                <p className="text-[1.6rem] font-extrabold leading-none">{tier.amount}</p>
                <p className="font-semibold text-[1rem]">{tier.label}</p>
                <p className="text-muted text-[0.95rem]">{tier.desc}</p>
                <div className="mt-auto pt-2">
                  <SupporterCta compact />
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Current supporters */}
      <section className="py-12 border-t border-line">
        <Container>
          <SectionHead
            title="Current supporters"
            description={
              supporters.length === 0
                ? "No named supporters listed yet. Be the first."
                : `${supporters.length} supporter${supporters.length !== 1 ? "s" : ""} currently listed.`
            }
          />
          {supporters.length === 0 ? (
            <p className="text-muted">
              Supporters who opt in to name listing will appear here.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {supporters.map((s) => (
                <div
                  key={`${s.name}-${s.since}`}
                  className="rounded-[12px] border border-line bg-[rgba(255,255,255,0.02)] p-3"
                >
                  <p className="font-semibold text-[0.95rem]">{s.name}</p>
                  <p className="text-muted text-[0.8rem]">
                    Since {new Date(s.since).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Container>
      </section>

      {/* Closing CTA */}
      <section className="py-12 border-t border-line">
        <Container>
          <Callout>
            <h2 className="text-[clamp(1.4rem,2.5vw,1.8rem)] mb-3">Become a supporter</h2>
            <p className="text-muted max-w-[720px] mb-5">
              Independent benchmarking takes sustained effort. If you find the benchmark useful,
              consider a monthly contribution to keep it free and public.
            </p>
            <SupporterCta />
          </Callout>
        </Container>
      </section>
    </>
  );
}
