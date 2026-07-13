import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import Stat from "@/components/ui/Stat";
import Panel from "@/components/ui/Panel";
import Card from "@/components/ui/Card";
import Pill from "@/components/ui/Pill";
import SectionHead from "@/components/ui/SectionHead";
import DonateCTA from "@/components/nonprofit/DonateCTA";
import { INDEPENDENCE_FIREWALL_LINE } from "@/components/nonprofit/constants";
import { SCORED_ENTITY_COUNT_FORMATTED } from "@/data/entityCount";
import { INDEX_REGISTRY } from "@/data/indexRegistry";
import type { EntityKind } from "@/data/entities";

// ─── Real index data (read-only, build-time) — same source as the
// commercial /indexes page. Counts are never hand-typed. ────────────────────
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

// ─── Latest Daily Briefing (read-only, build-time) ───────────────────────────
/* eslint-disable @typescript-eslint/no-explicit-any */
import latestBriefingRaw from "@/data/updates/latest.json";
const latestBriefing = latestBriefingRaw as any;

const briefingDate: string = typeof latestBriefing.date === "string" ? latestBriefing.date : "";
const briefingHeadline: string =
  typeof latestBriefing.headline === "string" && latestBriefing.headline.length > 0
    ? latestBriefing.headline
    : "Today's briefing is available.";
const briefingSummary: string =
  typeof latestBriefing.summary === "string" ? latestBriefing.summary : "";
const pipelineScanned: number = latestBriefing.pipeline?.entitiesScanned ?? 0;
const pipelineAssessed: number = latestBriefing.pipeline?.entitiesAssessed ?? 0;
const pipelineChanges: number =
  latestBriefing.pipeline?.scoreChangesProposed ?? latestBriefing.pipeline?.scoreChanges ?? 0;

function formatBriefingDate(isoDate: string): string {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export const metadata: Metadata = {
  title: "Compassion Benchmark — An Independent Nonprofit Measuring Institutional Compassion",
  description:
    "Compassion Benchmark is an independent nonprofit that measures how institutions recognize, respond to, and reduce suffering — free public indexes, a daily research briefing, and an open methodology, funded by supporters and grants, never by the entities it scores.",
};

export default function NonprofitAltHome() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="pt-[72px] pb-10">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-[1.12fr_0.88fr] gap-[18px] items-start">
            <div>
              <Eyebrow>Independent nonprofit · free public research</Eyebrow>
              <h1 className="text-[clamp(2.3rem,5vw,4.2rem)] leading-[1.03] tracking-[-0.04em] max-w-[900px] mb-3.5">
                An independent nonprofit measuring how institutions recognize,
                respond to, and reduce suffering
              </h1>

              <p className="text-text text-[1.05rem] max-w-[820px] mb-2 font-medium">
                Governments, companies, AI labs, universities, and cities —
                re-examined every weekday, sourced from public evidence, free
                for anyone to read and cite.
              </p>

              <p className="text-muted text-[0.97rem] max-w-[820px] mb-3">
                We built the benchmark because institutions routinely claim to
                care about the people they affect, but few can show coherent
                evidence of it. Our job is to make that evidence legible,
                comparable, and free — not to sell access to it.
              </p>

              {briefingDate && (
                <p className="text-muted text-[0.9rem] mb-[22px] border-l-2 border-accent pl-3">
                  <span className="text-accent font-semibold">
                    Today&apos;s briefing — {formatBriefingDate(briefingDate)}
                  </span>{" "}
                  &mdash; <span>{briefingHeadline}</span>
                </p>
              )}

              <div className="flex gap-3 flex-wrap mt-1">
                <Button href="/nonprofit-alt/support" variant="primary">
                  Support the benchmark &rarr;
                </Button>
                <Button href="/nonprofit-alt/methodology">How the benchmark works</Button>
              </div>
              <p className="mt-3">
                <Link
                  href="/nonprofit-alt/indexes"
                  className="text-muted text-[0.9rem] hover:text-text underline underline-offset-2 decoration-dotted"
                >
                  Browse the 8 free indexes &rarr;
                </Link>
              </p>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
                <Stat value={SCORED_ENTITY_COUNT_FORMATTED} label="Entities scored, free to read" />
                <Stat value={String(INDEX_REGISTRY.length)} label="Published index families" />
                <Stat value="8" label="Core benchmark dimensions" />
                <Stat value="$0" label="Cost to read any index or briefing" />
              </div>
            </div>

            <Panel>
              <h3 className="text-[1.08rem] font-bold mb-2.5">
                What your support funds
              </h3>
              <p className="text-muted mb-3">
                Compassion Benchmark is not a subscription product. There is
                nothing paywalled to unlock. Support instead funds the nightly
                research pipeline itself — the evidence review, the editorial
                oversight, and the infrastructure that keeps the daily
                briefing and all 8 indexes free and citable for everyone.
              </p>
              <ul className="list-disc pl-[18px] text-muted space-y-2 mb-4">
                <li>Independent evidence review, every weekday</li>
                <li>Free public indexes across {SCORED_ENTITY_COUNT_FORMATTED} entities</li>
                <li>An open, published scoring methodology</li>
                <li>No entity ever pays for its score</li>
              </ul>
              <Button href="/nonprofit-alt/support" variant="primary" full>
                See ways to support &rarr;
              </Button>
            </Panel>
          </div>
        </Container>
      </section>

      {/* ── What we do ───────────────────────────────────────────────────── */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="What we do"
            description="The benchmark operates as a public-interest research program — publication, methodology, and daily monitoring, funded by supporters instead of by the institutions it scores."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: "Publish free indexes",
                desc: `Comparative public rankings across ${SCORED_ENTITY_COUNT_FORMATTED} entities — countries, U.S. states, corporations, AI labs, robotics labs, cities, and universities.`,
              },
              {
                title: "Run a daily briefing",
                desc: "A free research briefing published every weekday: what was scanned, what was reassessed, and what crossed a scoring threshold — with the evidence.",
              },
              {
                title: "Maintain an open methodology",
                desc: "A formal 8-dimension, 40-subdimension scoring standard, published in full so any reader can check how a score was reached.",
              },
              {
                title: "Protect independence",
                desc: "Entities never pay for inclusion, score changes, or the suppression of findings. Support funds the mission, not influence over it.",
              },
            ].map((item) => (
              <Card key={item.title}>
                <h3 className="text-[1.05rem] font-bold mb-2">{item.title}</h3>
                <p className="text-muted">{item.desc}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Indexes teaser — real counts, real routes ────────────────────── */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="Eight free, public indexes"
            description={`Every index uses the same 8-dimension, 0–100 framework, so a score means the same thing whether it belongs to a country or a company. All ${SCORED_ENTITY_COUNT_FORMATTED} entity scores are free to read, cite, and share.`}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {INDEX_REGISTRY.map((entry) => (
              <Card key={entry.indexRoute} href={entry.indexRoute}>
                <div className="flex gap-2.5 flex-wrap mb-3">
                  <Pill>Free</Pill>
                  <Pill>Open data</Pill>
                </div>
                <h3 className="text-[1.02rem] font-bold mb-1.5">{entry.indexLabel}</h3>
                <p className="text-muted text-[0.88rem]">
                  {ENTITY_COUNT_BY_KIND[entry.kind].toLocaleString("en-US")} {entry.labelPlural} scored and ranked.
                </p>
              </Card>
            ))}
          </div>
          <p className="text-muted text-[0.85rem] mt-4">
            <Link href="/nonprofit-alt/indexes" className="text-accent hover:underline">
              See all indexes with citation guidance &rarr;
            </Link>
          </p>
        </Container>
      </section>

      {/* ── Latest Daily Briefing teaser ─────────────────────────────────── */}
      <section className="py-[30px]">
        <Container>
          <Panel>
            <div className="flex items-center justify-between gap-4 mb-3 flex-wrap">
              <Eyebrow>
                Latest Daily Briefing{briefingDate ? ` · ${formatBriefingDate(briefingDate)}` : ""}
              </Eyebrow>
              <span
                className="text-muted text-[0.85rem]"
                title="scanned = nightly pipeline coverage · assessed = entities reviewed this cycle · changes = score proposals passing the evidence threshold"
              >
                {pipelineScanned > 0 ? `${pipelineScanned.toLocaleString()} scanned · ` : ""}
                {pipelineAssessed} assessed
                {pipelineChanges > 0 ? ` · ${pipelineChanges} ${pipelineChanges === 1 ? "change" : "changes"}` : " · 0 changes — all confirmed"}
              </span>
            </div>
            <h3 className="text-[1.15rem] font-bold mb-2 leading-snug">{briefingHeadline}</h3>
            {briefingSummary && (
              <p className="text-muted text-[0.92rem] leading-relaxed mb-4">
                {briefingSummary.length > 340 ? briefingSummary.slice(0, 337) + "…" : briefingSummary}
              </p>
            )}
            <div className="flex gap-3 flex-wrap">
              <Button href="/nonprofit-alt/updates" variant="primary">
                Read the full briefing &rarr;
              </Button>
              <Button href="/nonprofit-alt/updates">Free email alerts</Button>
            </div>
          </Panel>
        </Container>
      </section>

      {/* ── Independence promise ─────────────────────────────────────────── */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="The independence promise"
            description="Independence is the entire premise of the benchmark. If entities could influence their own scores, nothing published here would mean anything."
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Panel>
              <h3 className="text-[1.08rem] font-bold mb-2.5">What independence means here</h3>
              <ul className="list-disc pl-[18px] text-muted space-y-2">
                <li>Entities do not pay to be included in an index</li>
                <li>Entities do not pay to improve their score or rank</li>
                <li>Findings are never suppressed for commercial reasons</li>
                <li>Methodology is not adjusted to fit a preferred outcome</li>
                <li>Support (donations and grants) funds the mission — never a score</li>
              </ul>
            </Panel>
            <Panel>
              <h3 className="text-[1.08rem] font-bold mb-2.5">The technical firewall</h3>
              <p className="text-muted mb-3">{INDEPENDENCE_FIREWALL_LINE}</p>
              <p className="text-muted text-[0.85rem]">
                <Link href="/nonprofit-alt/about" className="text-accent hover:underline">
                  Read about our governance &rarr;
                </Link>
              </p>
            </Panel>
          </div>
        </Container>
      </section>

      {/* ── How we're funded ──────────────────────────────────────────────── */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="How we're funded"
            description="Transparency about funding is what allows readers, journalists, and researchers to trust a score. Here is exactly where our funding comes from."
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Panel>
              <h3 className="text-[1.08rem] font-bold mb-2.5">Funding sources</h3>
              <ul className="list-disc pl-[18px] text-muted space-y-2">
                <li>
                  <span className="text-text font-bold">Individual donations:</span>{" "}
                  monthly and one-time support from readers ($5–$25+ tiers, or a custom amount)
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
              <h3 className="text-[1.08rem] font-bold mb-2.5">Tax status</h3>
              <p className="text-muted">
                TODO: confirm 501(c)(3) / tax-deductible status before publishing final
                donation copy. Until confirmed, this site uses neutral
                &ldquo;support&rdquo; and &ldquo;contribute&rdquo; language rather than
                claiming tax deductibility.
              </p>
            </Panel>
          </div>
        </Container>
      </section>

      {/* ── Donate CTA ────────────────────────────────────────────────────── */}
      <section className="py-[30px]">
        <Container>
          <DonateCTA />
        </Container>
      </section>
    </>
  );
}
