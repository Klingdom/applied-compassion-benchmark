import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import Stat from "@/components/ui/Stat";
import Panel from "@/components/ui/Panel";
import Card from "@/components/ui/Card";
import SectionHead from "@/components/ui/SectionHead";
import Callout from "@/components/ui/Callout";
import DonateCTA from "@/components/nonprofit/DonateCTA";
import { INDEPENDENCE_FIREWALL_LINE } from "@/components/nonprofit/constants";
import { SCORED_ENTITY_COUNT_FORMATTED } from "@/data/entityCount";
import { INDEX_REGISTRY } from "@/data/indexRegistry";
import type { EntityKind } from "@/data/entities";

// Real per-index entity counts — same read-only pattern as the home page
// (site/src/app/nonprofit-alt/page.tsx) and the /research alt page. Counts
// are never hand-typed.
import countriesData from "@/data/indexes/countries.json";
import usStatesData from "@/data/indexes/us-states.json";
import fortune500Data from "@/data/indexes/fortune-500.json";
import aiLabsData from "@/data/indexes/ai-labs.json";
import roboticsLabsData from "@/data/indexes/robotics-labs.json";
import usCitiesData from "@/data/indexes/us-cities.json";
import globalCitiesData from "@/data/indexes/global-cities.json";
import universitiesData from "@/data/indexes/universities.json";

const ENTITY_COUNT_BY_KIND: Record<EntityKind, number> = {
  country: countriesData.rankings.length,
  "us-state": usStatesData.rankings.length,
  company: fortune500Data.rankings.length,
  "ai-lab": aiLabsData.rankings.length,
  "robotics-lab": roboticsLabsData.rankings.length,
  "us-city": usCitiesData.rankings.length,
  city: globalCitiesData.rankings.length,
  university: universitiesData.rankings.length,
};

// This page reframes the commercial /about page for the nonprofit model —
// see docs/NONPROFIT_ALT_PAGES_BRIEF_2026-07-12.md and
// docs/NONPROFIT_ALT_MESSAGING_2026-07-12.md §5 ("About" row). Factual
// mission/scope content is kept; every "advisory / certified assessments /
// enterprise" reference is replaced with governance and funding-transparency
// framing.

export const metadata: Metadata = {
  title: "About — Compassion Benchmark (Nonprofit)",
  description:
    "Compassion Benchmark is the independent, donor-funded institution that measures whether governments, corporations, AI labs, and robotics labs actually recognize and reduce the suffering they cause or could prevent — its mission, governance, and funding transparency.",
};

export default function NonprofitAltAboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-[72px] pb-10">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-[18px] items-start">
            <div>
              <Eyebrow>About the institution</Eyebrow>
              <h1 className="text-[clamp(2.3rem,5vw,4.1rem)] leading-[1.03] tracking-[-0.03em] mb-3.5">
                An independent, donor-funded institution
              </h1>
              <p className="text-muted text-[1.08rem] max-w-[860px] mb-[22px]">
                Compassion Benchmark is the independent, donor-funded
                institution that measures whether the institutions shaping our
                lives &mdash; governments, corporations, AI labs, robotics labs
                &mdash; actually recognize and reduce the suffering they cause
                or could prevent. It is funded entirely by individual
                supporters and grants, never by the entities it scores. That
                separation is not a policy statement bolted on after the fact;
                it is the reason the benchmark can be trusted at all.
              </p>

              <div className="flex gap-3 flex-wrap mt-1">
                <Button href="/nonprofit-alt/methodology" variant="primary">
                  Read the methodology
                </Button>
                <Button href="/nonprofit-alt/support">Support the benchmark</Button>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
                <Stat value="Independent" label="Publication separated from any paid service" />
                <Stat value="Comparative" label="Cross-sector research across multiple institution types" />
                <Stat value="Structured" label="Built on a formal multi-dimension scoring framework" />
                <Stat value="Donor-funded" label="Supporters and grants — never the entities scored" />
              </div>
            </div>

            <Panel>
              <h3 className="text-[1.08rem] font-bold mb-2.5">What makes this institution different</h3>
              <p className="text-muted mb-3">
                Compassion Benchmark is not a campaign, branding exercise, or
                values-signaling site. It is a benchmark institution: a place
                where public methodology, comparative rankings, structured
                evidence, and a transparent funding model come together in a
                coherent research system.
              </p>
              <p className="text-muted">
                The purpose is to make compassionate institutional behavior
                legible in the same way that quality, safety, trust,
                transparency, and governance are increasingly measured
                elsewhere.
              </p>
            </Panel>
          </div>
        </Container>
      </section>

      {/* Why this organization exists */}
      <section className="py-[30px]">
        <Container>
          <Callout>
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] mb-2">Why this organization exists</h2>
            <p className="text-muted max-w-[900px]">
              Many institutions claim care, responsibility, safety, fairness,
              or public benefit. Far fewer can show coherent evidence of those
              qualities across governance, policy, operations, and outcomes.
              Compassion Benchmark exists to create a serious, legible
              benchmark for evaluating those claims &mdash; and to keep that
              record free and public rather than selling access to it.
            </p>
          </Callout>
        </Container>
      </section>

      {/* What the organization does */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="What the organization does"
            description="The benchmark operates as a research and publication program, sustained entirely by supporters and grants rather than by the entities it evaluates."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "Publishes indexes", desc: `Comparative public benchmark rankings across ${SCORED_ENTITY_COUNT_FORMATTED} entities — countries, U.S. states, corporations, AI labs, and humanoid robotics labs.` },
              { title: "Maintains methodology", desc: "A formal benchmark framework across eight dimensions and a deeper 40-subdimension standard, published in full." },
              { title: "Produces research", desc: "A daily research briefing, sector analysis, and a citation-ready, publicly reproducible evidence trail." },
              { title: "Runs on donor support", desc: "Sustained by individual supporters and grants from mission-aligned foundations — never by paid entity services." },
            ].map((item) => (
              <Card key={item.title}>
                <h3 className="text-[1.08rem] font-bold mb-2">{item.title}</h3>
                <p className="text-muted">{item.desc}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Core idea + What is being benchmarked */}
      <section className="py-[30px]">
        <Container className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-2.5">Core idea</h3>
            <p className="text-muted">
              The benchmark is built on the idea that compassion can be
              evaluated institutionally, not just individually. Institutions
              leave evidence trails. Those trails reveal whether they notice
              suffering, take it seriously, constrain harmful uses of power,
              and build systems that reduce harm instead of reproducing it.
            </p>
          </Panel>
          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-2.5">What is being benchmarked</h3>
            <p className="text-muted">
              The benchmark does not try to measure private virtue or public
              relations skill. It measures institutional behavior: governance,
              policies, resource allocation, safety posture, accountability,
              equity, integrity, and the real-world consequences of
              organizational systems.
            </p>
          </Panel>
        </Container>
      </section>

      {/* Institutional scope — real counts, never hand-typed */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="Institutional scope"
            description="The benchmark is designed to work across multiple classes of institutions while preserving a stable underlying framework."
          />
          <Panel>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">Institution type</th>
                  <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">Current coverage</th>
                  <th className="text-muted text-[0.86rem] font-semibold text-left py-3 px-2.5 border-b border-line">Index</th>
                </tr>
              </thead>
              <tbody className="text-muted">
                {INDEX_REGISTRY.map((entry) => (
                  <tr key={entry.indexRoute}>
                    <td className="py-3 px-2.5 border-b border-line text-text capitalize">{entry.labelPlural}</td>
                    <td className="py-3 px-2.5 border-b border-line">
                      {ENTITY_COUNT_BY_KIND[entry.kind].toLocaleString("en-US")} {entry.labelPlural} scored
                    </td>
                    <td className="py-3 px-2.5 border-b border-line">
                      <Link href={entry.indexRoute} className="hover:text-text">{entry.indexLabel}</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </Container>
      </section>

      {/* Independence and credibility */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="Independence and credibility"
            description="Benchmark credibility depends on institutional independence. The organization is designed around that principle."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: "No paid ranking changes", desc: "Entities do not pay to be included, improve their rank, or alter a published public score." },
              { title: "No methodology for sale", desc: "The methodology is not customized to produce a preferred result for a supporter, a funder, or an entity being scored." },
              { title: "Public findings remain public", desc: "Support funds the mission — the pipeline that produces every score, not access to it or influence over it." },
            ].map((item) => (
              <Card key={item.title}>
                <h3 className="text-[1.08rem] font-bold mb-2">{item.title}</h3>
                <p className="text-muted">{item.desc}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Governance & funding transparency */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="Governance &amp; funding transparency"
            description="How the institution is funded, and how that funding is kept separate from what it publishes."
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Panel>
              <h3 className="text-[1.08rem] font-bold mb-2.5">How we&apos;re funded</h3>
              <ul className="list-disc pl-[18px] text-muted space-y-2">
                <li>
                  <span className="text-text font-bold">Individual donations:</span>{" "}
                  monthly and one-time support from readers
                </li>
                <li>
                  <span className="text-text font-bold">Grants and foundations:</span>{" "}
                  institutional funders who support independent public-interest research
                </li>
              </ul>
              <p className="text-muted text-[0.85rem] mt-3 border-t border-line pt-3">
                What we do <span className="text-text font-bold">not</span> accept: payment from
                any entity we score, in exchange for inclusion, a score change, or the
                suppression of a finding.
              </p>
            </Panel>
            <Panel>
              <h3 className="text-[1.08rem] font-bold mb-2.5">The technical firewall</h3>
              <p className="text-muted mb-3">{INDEPENDENCE_FIREWALL_LINE}</p>
              <p className="text-muted text-[0.85rem]">
                <Link href="/nonprofit-alt/methodology" className="text-accent hover:underline">
                  Read the independence policy in the methodology &rarr;
                </Link>
              </p>
            </Panel>
          </div>
        </Container>
      </section>

      {/* Beliefs + Who served */}
      <section className="py-[30px]">
        <Container className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-2.5">What the organization believes</h3>
            <ul className="list-disc pl-[18px] text-muted space-y-2">
              <li>Institutions can be evaluated for compassionate performance</li>
              <li>Public evidence is a serious starting point for benchmark publication</li>
              <li>Accountability, boundaries, and integrity matter as much as stated care</li>
              <li>Cross-sector comparison reveals patterns that siloed analysis misses</li>
              <li>Benchmarks should be difficult to game and useful in practice</li>
            </ul>
          </Panel>
          <Panel>
            <h3 className="text-[1.08rem] font-bold mb-2.5">Who the organization serves</h3>
            <ul className="list-disc pl-[18px] text-muted space-y-2">
              <li>Researchers and journalists seeking comparative institutional analysis</li>
              <li>Policy leaders and public institutions comparing systems performance</li>
              <li>Technology governance communities evaluating AI and robotics labs</li>
              <li>Foundations and funders supporting independent accountability research</li>
              <li>Any reader who wants to check a claim of institutional care against evidence</li>
            </ul>
          </Panel>
        </Container>
      </section>

      {/* How the organization is structured */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="How the organization is structured on the site"
            description="The website is intentionally built like a benchmark institution rather than a generic nonprofit brochure."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card href="/nonprofit-alt/indexes">
              <h3 className="text-[1.08rem] font-bold mb-2">Indexes</h3>
              <p className="text-muted">The public benchmark layer where comparative rankings are published, free to read.</p>
            </Card>
            <Card href="/nonprofit-alt/methodology">
              <h3 className="text-[1.08rem] font-bold mb-2">Methodology</h3>
              <p className="text-muted">The formal scoring framework and independence policy behind every publication.</p>
            </Card>
            <Card href="/nonprofit-alt/research">
              <h3 className="text-[1.08rem] font-bold mb-2">Research</h3>
              <p className="text-muted">The daily research pipeline and evidence trail behind the rankings.</p>
            </Card>
            <Card href="/nonprofit-alt/support">
              <h3 className="text-[1.08rem] font-bold mb-2">Support</h3>
              <p className="text-muted">The donation and grants layer that funds the public benchmark.</p>
            </Card>
          </div>
        </Container>
      </section>

      {/* Compact donate surface */}
      <section className="py-[30px]">
        <Container>
          <DonateCTA
            heading="Help keep this research free"
            description="Every dollar funds evidence review, not a subscription — and none of it comes from the entities we score."
            showTiers={false}
          />
        </Container>
      </section>

      {/* Final CTA */}
      <section className="py-[30px]">
        <Container>
          <Callout>
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] mb-2">
              Read the benchmark. Use the benchmark. Challenge the benchmark.
            </h2>
            <p className="text-muted max-w-[920px] mb-[18px]">
              Compassion Benchmark is built to be a credible public benchmark
              institution: rigorous enough to be useful, structured enough to
              be comparable, and open enough to be challenged with better
              evidence. That is what makes the work stronger.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Button href="/nonprofit-alt/methodology" variant="primary">Read the methodology</Button>
              <Button href="/nonprofit-alt/indexes">Explore the indexes</Button>
              <Button href="/nonprofit-alt/support">Support the benchmark</Button>
            </div>
          </Callout>
        </Container>
      </section>
    </>
  );
}
