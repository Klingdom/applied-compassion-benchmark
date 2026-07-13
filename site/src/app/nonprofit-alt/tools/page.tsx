import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import Panel from "@/components/ui/Panel";
import Card from "@/components/ui/Card";
import Pill from "@/components/ui/Pill";
import SectionHead from "@/components/ui/SectionHead";
import DonateCTA from "@/components/nonprofit/DonateCTA";
import { DIMENSIONS } from "@/data/dimensions";

export const metadata: Metadata = {
  title: "Free Tools — Self-Assessment | Compassion Benchmark (Nonprofit)",
  description:
    "Free public-interest tools from Compassion Benchmark: an 8-dimension self-assessment for any organization, free to explore and use — no licensed product, no enterprise tier, no paid unlock.",
};

export default function NonprofitAltToolsPage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="pt-[72px] pb-10">
        <Container>
          <Eyebrow>Free public-interest tools</Eyebrow>
          <h1 className="text-[clamp(2.3rem,5vw,4.2rem)] leading-[1.03] tracking-[-0.04em] max-w-[900px] mb-3.5">
            Free tools for self-assessment and public-interest use
          </h1>
          <p className="text-text text-[1.05rem] max-w-[860px] mb-2 font-medium">
            The same 8-dimension, 40-subdimension framework that scores
            governments, companies, AI labs, and robotics labs is free for
            any organization to apply to itself.
          </p>
          <p className="text-muted text-[0.97rem] max-w-[860px] mb-3">
            There is no licensed product here, no enterprise tier, and no
            paid unlock. The self-assessment is a genuine public utility —
            explore the framework, score yourself against it, and see where
            you stand.
          </p>
          <div className="flex gap-3 flex-wrap mt-1">
            <Button href="/self-assessment" variant="primary">
              Take the free self-assessment &rarr;
            </Button>
            <Button href="/nonprofit-alt/support">Support the benchmark</Button>
          </div>
        </Container>
      </section>

      {/* ── The free self-assessment tool ─────────────────────────────────── */}
      <section className="py-[30px]">
        <Container>
          <Card variant="featured" href="/self-assessment">
            <div className="flex gap-2.5 flex-wrap mb-3">
              <Pill>Free</Pill>
              <Pill>No account required</Pill>
              <Pill>8 dimensions · 40 subdimensions</Pill>
            </div>
            <h2 className="text-[1.3rem] font-bold mb-2">Self-Assessment</h2>
            <p className="text-muted mb-3 max-w-[760px]">
              Walk through the benchmark&apos;s 8 dimensions and 40
              subdimensions, rate your own organization against the same
              anchor scale used across every published index, and see an
              instant composite score and band.
            </p>
            <p className="text-[0.85rem] text-accent font-semibold">
              Start the free self-assessment &rarr;
            </p>
          </Card>
        </Container>
      </section>

      {/* ── The 8 dimensions it covers ────────────────────────────────────── */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="What the assessment covers"
            description="The same 8 dimensions used to score every entity in every published index — free to explore, free to apply to your own organization."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {DIMENSIONS.map((dim) => (
              <Card key={dim.code}>
                <h3 className="text-[1.02rem] font-bold mb-2" style={{ color: dim.color }}>
                  {dim.name}
                </h3>
                <p className="text-muted text-[0.88rem]">{dim.desc}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Not a paid product ────────────────────────────────────────────── */}
      <section className="py-[30px]">
        <Container>
          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-2.5">Free, not licensed</h3>
            <p className="text-muted mb-3 max-w-[860px]">
              This self-assessment is a public utility, not a paid product.
              There is no enterprise tier, no certified-assessment upsell,
              and no license to buy — the framework behind every published
              index is open for anyone to apply to their own organization,
              free of charge.
            </p>
            <p className="text-muted text-[0.85rem]">
              Want to understand the framework in more depth first?{" "}
              <Link href="/nonprofit-alt/methodology" className="text-accent hover:underline">
                Read the full methodology &rarr;
              </Link>
            </p>
          </Panel>
        </Container>
      </section>

      {/* ── Support nudge ─────────────────────────────────────────────────── */}
      <section className="py-[30px]">
        <Container>
          <DonateCTA
            heading="Support the benchmark"
            description="Free tools, free indexes, and a free daily briefing all run on the same independent research pipeline — funded by supporters, not by a product tier."
            showTiers={false}
          />
        </Container>
      </section>
    </>
  );
}
