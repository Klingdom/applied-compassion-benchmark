import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import Stat from "@/components/ui/Stat";
import Panel from "@/components/ui/Panel";
import Card from "@/components/ui/Card";
import SectionHead from "@/components/ui/SectionHead";
import DonateCTA from "@/components/nonprofit/DonateCTA";
import { SCORED_ENTITY_COUNT_FORMATTED } from "@/data/entityCount";

// ─── Latest Daily Briefing (read-only, build-time) ───────────────────────────
/* eslint-disable @typescript-eslint/no-explicit-any */
import latestBriefingRaw from "@/data/updates/latest.json";
import manifest from "@/data/updates/manifest.json";
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

const totalBriefings: number = Array.isArray(manifest.dates) ? manifest.dates.length : 0;

function formatBriefingDate(isoDate: string): string {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export const metadata: Metadata = {
  title: "Daily Briefing — Free Public-Interest Research | Compassion Benchmark (Nonprofit)",
  description:
    `The Compassion Benchmark Daily Briefing is free public-interest research: what changed, why, and with what evidence — published every weekday across ${SCORED_ENTITY_COUNT_FORMATTED} scored entities. Free email alerts, RSS/JSON feeds, and a full archive, funded by supporters and grants.`,
};

export default function NonprofitAltUpdatesPage() {
  const formattedDate = formatBriefingDate(briefingDate);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="pt-[72px] pb-10">
        <Container>
          <Eyebrow>Free public-interest research · updated daily</Eyebrow>
          <h1 className="text-[clamp(2.3rem,5vw,4.2rem)] leading-[1.03] tracking-[-0.04em] max-w-[900px] mb-3.5">
            The daily record of what changed — and why
          </h1>
          <p className="text-text text-[1.05rem] max-w-[860px] mb-2 font-medium">
            A free research briefing published every weekday: what was
            scanned, what was reassessed, and what crossed a scoring
            threshold — with the underlying evidence attached.
          </p>
          <p className="text-muted text-[0.97rem] max-w-[860px] mb-3">
            This is the benchmark&apos;s most-cited, most-alive publication.
            It is written and published like a research record, not a lead
            magnet — free to read, free to subscribe to, free to cite.
          </p>
          <div className="flex gap-3 flex-wrap mt-1">
            <Button href="#subscribe" variant="primary">
              Subscribe free &rarr;
            </Button>
            <Button href="/nonprofit-alt/support">Support the daily pipeline</Button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
            <Stat value={String(totalBriefings)} label="Daily briefings published" />
            <Stat value={SCORED_ENTITY_COUNT_FORMATTED} label="Entities monitored" />
            <Stat value="Weekdays" label="Publishing cadence" />
            <Stat value="$0" label="Cost to read or subscribe" />
          </div>
        </Container>
      </section>

      {/* ── Today's briefing ─────────────────────────────────────────────── */}
      <section className="py-[30px]">
        <Container>
          <Panel>
            <div className="flex items-center justify-between gap-4 mb-3 flex-wrap">
              <Eyebrow>
                Today&apos;s briefing{formattedDate ? ` · ${formattedDate}` : ""}
              </Eyebrow>
              <span
                className="text-muted text-[0.85rem]"
                title="scanned = nightly pipeline coverage · assessed = entities reviewed this cycle · changes = score proposals passing the evidence threshold"
              >
                {pipelineScanned > 0 ? `${pipelineScanned.toLocaleString()} scanned · ` : ""}
                {pipelineAssessed} assessed
                {pipelineChanges > 0
                  ? ` · ${pipelineChanges} ${pipelineChanges === 1 ? "change" : "changes"}`
                  : " · 0 changes — all confirmed"}
              </span>
            </div>
            <h3 className="text-[1.15rem] font-bold mb-2 leading-snug">{briefingHeadline}</h3>
            {briefingSummary && (
              <p className="text-muted text-[0.92rem] leading-relaxed mb-4">
                {briefingSummary.length > 480 ? briefingSummary.slice(0, 477) + "…" : briefingSummary}
              </p>
            )}
            <div className="flex gap-3 flex-wrap">
              <Button href="/updates" variant="primary">
                Read the full briefing &rarr;
              </Button>
              <Button href="/updates/archive">Browse the archive</Button>
            </div>
          </Panel>
        </Container>
      </section>

      {/* ── Subscribe free ───────────────────────────────────────────────── */}
      <section className="py-[30px]" id="subscribe">
        <Container>
          <SectionHead
            title="Subscribe free"
            description="No paywall, no trial, no credit card. Free email alerts and free machine-readable feeds — built so the daily record can be read, cited, and reused by anyone."
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Panel>
              <h3 className="text-[1.08rem] font-bold mb-2.5">Free email alerts</h3>
              <p className="text-muted mb-4">
                Get the Daily Briefing in your inbox on publishing days.
                Free, sustained entirely by supporters — never a paid tier.
              </p>
              {/* Placeholder subscribe control — no live email-signup backend
                  wired yet; static markup, no Gumroad, no paywall. Not a
                  <form> so there is no native submit navigation to a
                  non-existent handler. */}
              <div className="flex flex-col sm:flex-row gap-2.5" role="group" aria-label="Subscribe to free email alerts">
                <label htmlFor="nonprofit-alt-updates-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="nonprofit-alt-updates-email"
                  type="email"
                  placeholder="you@example.org"
                  disabled
                  className="flex-1 min-w-0 rounded-[14px] border border-line bg-[rgba(255,255,255,0.03)] px-4 py-3 text-text placeholder:text-muted-subtle disabled:opacity-60"
                />
                <Button variant="primary" className="shrink-0">
                  Notify me &rarr;
                </Button>
              </div>
              <p className="text-[0.78rem] text-muted-subtle mt-2.5">
                Sign-up is not yet live on this preview — this is a placeholder for the free
                subscribe flow.
              </p>
            </Panel>
            <Panel>
              <h3 className="text-[1.08rem] font-bold mb-2.5">Free RSS &amp; JSON feeds</h3>
              <p className="text-muted mb-4">
                Prefer to pull the briefing into your own reader or pipeline?
                Both machine-readable feeds are free and open, no key required.
              </p>
              <div className="flex gap-3 flex-wrap mb-4">
                <Button href="/updates/feed.xml" variant="primary">RSS feed</Button>
                <Button href="/updates/feed.json">JSON feed</Button>
              </div>
              <p className="text-muted text-[0.85rem]">
                <Link href="/updates/archive" className="text-accent hover:underline">
                  Browse all {totalBriefings} published briefings &rarr;
                </Link>
              </p>
            </Panel>
          </div>
        </Container>
      </section>

      {/* ── What the briefing covers ──────────────────────────────────────── */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="What every briefing covers"
            description="Each weekday, the briefing reports on the nightly research pipeline in plain language, with sources attached to every claim."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: "What was scanned",
                desc: "The nightly pipeline's coverage across the monitored entity catalog.",
              },
              {
                title: "What was reassessed",
                desc: "Entities whose public evidence was reviewed against the 8-dimension framework this cycle.",
              },
              {
                title: "What changed, and why",
                desc: "Any score movement, with the specific evidence that crossed the threshold for a change.",
              },
              {
                title: "What was confirmed",
                desc: "Scores re-examined and held, so a lack of change is reported as deliberately as a change.",
              },
            ].map((item) => (
              <Card key={item.title}>
                <h3 className="text-[1.02rem] font-bold mb-2">{item.title}</h3>
                <p className="text-muted text-[0.9rem]">{item.desc}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Support the daily pipeline ────────────────────────────────────── */}
      <section className="py-[30px]">
        <Container>
          <DonateCTA
            heading="Support the daily pipeline"
            description="The Daily Briefing is free, and sustained entirely by supporters and grants — never by a subscription, and never by the entities it covers."
            showTiers={false}
          />
        </Container>
      </section>
    </>
  );
}
