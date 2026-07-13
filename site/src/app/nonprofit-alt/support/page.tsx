import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import Stat from "@/components/ui/Stat";
import Panel from "@/components/ui/Panel";
import Card from "@/components/ui/Card";
import SectionHead from "@/components/ui/SectionHead";
import Callout from "@/components/ui/Callout";
import DonateCTA from "@/components/nonprofit/DonateCTA";
import SupportTiers from "@/components/nonprofit/SupportTiers";
import {
  INDEPENDENCE_FIREWALL_LINE,
  TAX_STATUS_NOTE,
  FUNDER_CONTACT_NOTE,
} from "@/components/nonprofit/constants";
import { SCORED_ENTITY_COUNT_FORMATTED } from "@/data/entityCount";

// This page replaces the commercial /services page. There is no pricing
// grid, no "book a call," and no tiered institutional sales ladder here —
// see docs/NONPROFIT_ALT_PAGES_BRIEF_2026-07-12.md and
// docs/NONPROFIT_ALT_MESSAGING_2026-07-12.md §5 ("Support" row) for the
// reframe this page implements.

export const metadata: Metadata = {
  title: "Support — Compassion Benchmark (Nonprofit)",
  description:
    "Become a supporter of Compassion Benchmark: monthly or one-time giving, a grants and foundations path for institutional funders, unpaid mission partnerships, and free ways to contribute — cite the data, share the briefing, or volunteer expertise. Funded by supporters and grants, never by the entities it scores.",
};

export default function NonprofitAltSupportPage() {
  return (
    <>
      {/* Hero — leads with the independence firewall line, per the brief */}
      <section className="pt-[72px] pb-10">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-[18px] items-start">
            <div>
              <Eyebrow>Support the research &middot; not a purchase</Eyebrow>
              <h1 className="text-[clamp(2.3rem,5vw,4.1rem)] leading-[1.03] tracking-[-0.03em] max-w-[880px] mb-3.5">
                Become a supporter
              </h1>
              <p className="text-text text-[1.05rem] max-w-[820px] mb-2 font-medium">
                Compassion Benchmark is funded entirely by individual supporters
                and grants &mdash; never by the entities it scores. There is
                nothing paywalled here to unlock. Your support funds the
                nightly research pipeline itself, so the daily briefing and
                all 8 indexes stay free and citable for every reader.
              </p>
              <p className="text-muted text-[0.97rem] max-w-[820px] mb-[22px] border-l-2 border-accent pl-3">
                {INDEPENDENCE_FIREWALL_LINE}
              </p>

              <div className="flex gap-3 flex-wrap mt-1">
                <Button href="#tiers" variant="primary">
                  Become a supporter &rarr;
                </Button>
                <Button href="#one-time">One-time gift</Button>
                <Button href="#funders">Foundations &amp; grants</Button>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
                <Stat value={SCORED_ENTITY_COUNT_FORMATTED} label="Entities kept free to read by support" />
                <Stat value="$5" label="Suggested monthly tier — starts here" />
                <Stat value="2" label="Separate technical planes — pipeline vs. support" />
                <Stat value="$0" label="Ever paid by a scored entity for its score" />
              </div>
            </div>

            <Panel>
              <h3 className="text-[1.08rem] font-bold mb-2.5">How we&apos;re funded</h3>
              <p className="text-muted mb-3">
                Compassion Benchmark is funded by individual supporters and
                grants from foundations that value independent institutional
                research. We do not accept payment from any entity we score,
                in any form, for any reason. There is no sponsored ranking, no
                pay-to-improve, and no removal-for-a-fee. If that ever changed
                for a single entity, the independence claim on this entire
                site would become worthless &mdash; so it doesn&apos;t change.
              </p>
              <p className="text-[rgba(148,163,184,0.7)] text-[0.8rem] border-t border-line pt-3">
                {TAX_STATUS_NOTE}
              </p>
            </Panel>
          </div>
        </Container>
      </section>

      {/* Monthly + one-time tiers */}
      <section id="tiers" className="py-[30px] scroll-mt-24">
        <Container>
          <SectionHead
            title="Ways to give"
            description="A gift doesn't unlock anything you didn't already have for free — it funds the fact that the research stays free for everyone. Every tier keeps the daily research free and citable."
          />
          <SupportTiers />
          <p id="one-time" className="text-muted text-[0.9rem] mt-4 scroll-mt-24">
            One-time and custom gifts are not a downgrade from the monthly
            tiers &mdash; they&apos;re an equal option for major gifts, grants,
            and readers who&apos;d rather give once than subscribe. No tier, no
            minimum: every amount counts the same.
          </p>
        </Container>
      </section>

      {/* Grants / foundations */}
      <section id="funders" className="py-[30px] scroll-mt-24">
        <Container>
          <SectionHead title="For foundations and institutional funders" />
          <Callout>
            <p className="text-muted mb-3">
              Compassion Benchmark produces a daily, evidence-backed, publicly
              citable research record of how governments, corporations, AI
              labs, and robotics labs treat the people and systems in their
              power. For funders working on AI accountability, corporate
              governance, human rights, or public-interest technology, this is
              infrastructure: a standing, methodologically transparent
              measurement layer that press, researchers, and advocates already
              use and cite &mdash; funded independently of the entities it
              evaluates. Grant support sustains the daily research pipeline,
              expands index coverage, and keeps the entire public record free.
            </p>
            <p className="text-muted mb-4">{FUNDER_CONTACT_NOTE}</p>
            <div className="flex gap-3 flex-wrap">
              <Button href="/nonprofit-alt/contact" variant="primary">
                Talk to us about funding this work &rarr;
              </Button>
              <Button href="/nonprofit-alt/research">See the research program</Button>
            </div>
          </Callout>
        </Container>
      </section>

      {/* Mission partnerships (unpaid) */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="Mission partnerships"
            description="Unpaid, mission-aligned collaborations — never a paid engagement, and never available to an entity we score."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <h3 className="text-[1.05rem] font-bold mb-2">Aligned nonprofits &amp; advocacy groups</h3>
              <p className="text-muted">
                Joint citation, data-sharing arrangements, and cross-linking
                with organizations working on AI accountability, corporate
                governance, and human rights &mdash; unpaid, mission-aligned,
                and never with an entity under our own scoring.
              </p>
            </Card>
            <Card>
              <h3 className="text-[1.05rem] font-bold mb-2">Academic &amp; research institutions</h3>
              <p className="text-muted">
                Reproducibility reviews, methodology critique, and joint
                research use of the published evidence trail &mdash; the kind
                of scrutiny that makes the benchmark stronger, not a paid
                consulting arrangement.
              </p>
            </Card>
            <Card>
              <h3 className="text-[1.05rem] font-bold mb-2">Newsrooms &amp; journalists</h3>
              <p className="text-muted">
                Free syndication and citation support for reporting that draws
                on the indexes or the daily briefing &mdash; no licensing fee,
                no sponsored coverage arrangement.
              </p>
            </Card>
          </div>
        </Container>
      </section>

      {/* Non-monetary ways to contribute */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="Ways to contribute that don't cost anything"
            description="Support doesn't have to be financial. These are free, and just as valuable."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card href="/nonprofit-alt/methodology">
              <h3 className="text-[1.05rem] font-bold mb-2">Cite the data</h3>
              <p className="text-muted">
                Every index and every entity score is free to cite. See the
                methodology page for attribution guidance.
              </p>
            </Card>
            <Card href="/nonprofit-alt/updates">
              <h3 className="text-[1.05rem] font-bold mb-2">Share the daily briefing</h3>
              <p className="text-muted">
                Forward today&apos;s briefing, subscribe a colleague, or share
                a finding &mdash; free distribution is free support.
              </p>
            </Card>
            <Card href="/nonprofit-alt/contact">
              <h3 className="text-[1.05rem] font-bold mb-2">Send evidence or a correction</h3>
              <p className="text-muted">
                Public-record evidence and corrections strengthen every score.
                Reach out if you&apos;ve found something we should review.
              </p>
            </Card>
            <Card href="/nonprofit-alt/contact">
              <h3 className="text-[1.05rem] font-bold mb-2">Volunteer your expertise</h3>
              <p className="text-muted">
                Methodology review, translation, and evidence-sourcing help
                from researchers and subject-matter experts &mdash; unpaid,
                and always welcome.
              </p>
            </Card>
          </div>
        </Container>
      </section>

      {/* Closing donate surface */}
      <section className="py-[30px]">
        <Container>
          <DonateCTA
            heading="Become a supporter"
            description="Choose a monthly tier above, give once, or talk to us about a grant. Every path funds the same thing: independent research that stays free."
            showTiers={false}
          />
        </Container>
      </section>
    </>
  );
}
