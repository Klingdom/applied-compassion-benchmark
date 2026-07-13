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
import { SCORED_ENTITY_COUNT_FORMATTED } from "@/data/entityCount";
import { INDEX_REGISTRY } from "@/data/indexRegistry";
import type { EntityKind } from "@/data/entities";

// ─── Real index data (read-only, build-time) — same source as the home page
// and the commercial /indexes page. Counts are never hand-typed. ───────────
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

export const metadata: Metadata = {
  title: "Free Public Indexes — Compassion Benchmark (Nonprofit)",
  description:
    `Eight free, public-interest indexes covering ${SCORED_ENTITY_COUNT_FORMATTED} institutions — countries, U.S. states, Fortune 500 companies, AI labs, robotics labs, U.S. cities, global cities, and universities. Free to read, free to cite, updated daily. Funded by supporters and grants, never by the entities scored.`,
};

export default function NonprofitAltIndexesPage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="pt-[72px] pb-10">
        <Container>
          <Eyebrow>Free &amp; open public-interest data</Eyebrow>
          <h1 className="text-[clamp(2.3rem,5vw,4.2rem)] leading-[1.03] tracking-[-0.04em] max-w-[900px] mb-3.5">
            Eight public indexes. Free to read, free to cite, updated daily.
          </h1>
          <p className="text-text text-[1.05rem] max-w-[860px] mb-2 font-medium">
            Countries, U.S. states, Fortune 500 companies, AI labs, robotics
            labs, U.S. cities, global cities, and universities — all{" "}
            {SCORED_ENTITY_COUNT_FORMATTED} entities scored on the same
            8-dimension, 0–100 ruler.
          </p>
          <p className="text-muted text-[0.97rem] max-w-[860px] mb-3">
            These are public-interest research data, not a product catalog.
            There is nothing here to purchase, license, or unlock — every
            index, every entity page, and every score is free for anyone to
            read, reuse, and cite with attribution.
          </p>
          <div className="flex gap-3 flex-wrap mt-1">
            <Button href="#citation" variant="primary">
              See how to cite this data &rarr;
            </Button>
            <Button href="/nonprofit-alt/support">Support this research</Button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
            <Stat value={SCORED_ENTITY_COUNT_FORMATTED} label="Entities scored, free to read" />
            <Stat value={String(INDEX_REGISTRY.length)} label="Published index families" />
            <Stat value="8" label="Core benchmark dimensions" />
            <Stat value="$0" label="Cost to read, reuse, or cite" />
          </div>
        </Container>
      </section>

      {/* ── The eight indexes — real counts, real routes ─────────────────── */}
      <section className="py-[30px]" id="indexes">
        <Container>
          <SectionHead
            title="The eight indexes"
            description="Every index uses the same 8-dimension, 0–100 framework, so a score means the same thing whether it belongs to a country or a company. All entity scores are free and open."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {INDEX_REGISTRY.map((entry) => (
              <Card key={entry.indexRoute} href={entry.indexRoute}>
                <div className="flex gap-2.5 flex-wrap mb-3">
                  <Pill>Free</Pill>
                  <Pill>Open data</Pill>
                </div>
                <h3 className="text-[1.02rem] font-bold mb-1.5">{entry.indexLabel}</h3>
                <p className="text-muted text-[0.88rem] mb-3">
                  {ENTITY_COUNT_BY_KIND[entry.kind].toLocaleString("en-US")}{" "}
                  {entry.labelPlural} scored and ranked.
                </p>
                <p className="text-[0.8rem] text-accent font-semibold">
                  View {entry.navLabel} &rarr;
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* ── How to cite this data ─────────────────────────────────────────── */}
      <section className="py-[30px]" id="citation">
        <Container>
          <SectionHead
            title="Cite this data"
            description="Every index is built to be cited by journalists, researchers, and other institutions — that is the point of publishing it for free."
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Panel>
              <h3 className="text-[1.08rem] font-bold mb-2.5">Attribution guidance</h3>
              <p className="text-muted mb-3">
                Cite Compassion Benchmark as the source, name the specific
                index and date, and link back to the index or entity page you
                are referencing. Scores update on a daily research cycle, so
                citing the date lets readers verify what the score was at the
                time you cited it.
              </p>
              <p className="text-muted text-[0.85rem]">
                <Link href="/nonprofit-alt/methodology" className="text-accent hover:underline">
                  Read the full methodology and evidence hierarchy &rarr;
                </Link>
              </p>
            </Panel>
            <Panel>
              <h3 className="text-[1.08rem] font-bold mb-2.5">Why this data is free</h3>
              <ul className="list-disc pl-[18px] text-muted space-y-2">
                <li>Public-interest research is only useful if it can be checked and reused</li>
                <li>Entities never pay for inclusion, score changes, or suppression of findings</li>
                <li>The daily research pipeline is funded by supporters and grants, not readers</li>
                <li>No paywall, no purchase, no license required to read or cite any index</li>
              </ul>
            </Panel>
          </div>
        </Container>
      </section>

      {/* ── Soft support nudge ─────────────────────────────────────────────── */}
      <section className="py-[30px]">
        <Container>
          <DonateCTA
            heading="Help keep these indexes free and citable"
            description="Reading and citing this data will always be free. Support funds the daily evidence review that keeps it accurate."
            showTiers={false}
          />
        </Container>
      </section>
    </>
  );
}
