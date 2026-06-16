import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import Panel from "@/components/ui/Panel";
import Card from "@/components/ui/Card";
import SectionHead from "@/components/ui/SectionHead";
import Callout from "@/components/ui/Callout";

export const metadata: Metadata = {
  title: "Data Access",
  description:
    "Compassion Benchmark publishes machine-readable score data for all 1,156 entities across seven indexes. Access per-entity JSON, per-index aggregates, and the entity catalog — free to access, please cite with attribution.",
};

// The seven published indexes and their public endpoint slugs.
const INDEXES = [
  {
    slug: "fortune-500",
    label: "Fortune 500",
    description: "447 large U.S. companies scored across 8 dimensions.",
    page: "/fortune-500",
  },
  {
    slug: "countries",
    label: "World Countries",
    description: "193 sovereign and territorial entities — global coverage.",
    page: "/countries",
  },
  {
    slug: "us-states",
    label: "U.S. States",
    description: "21 U.S. states scored in the current publication cycle.",
    page: "/us-states",
  },
  {
    slug: "ai-labs",
    label: "AI Labs",
    description: "50 leading AI laboratories with HQ and sector.",
    page: "/ai-labs",
  },
  {
    slug: "robotics-labs",
    label: "Robotics Labs",
    description: "50 humanoid robotics labs with category and country.",
    page: "/robotics-labs",
  },
  {
    slug: "us-cities",
    label: "U.S. Cities",
    description: "144 U.S. cities with region classification.",
    page: "/us-cities",
  },
  {
    slug: "global-cities",
    label: "Global Cities",
    description: "250 global cities with country and region.",
    page: "/global-cities",
  },
] as const;

export default function DataPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-[72px] pb-10">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-[18px] items-start">
            <div>
              <Eyebrow>Public data endpoints</Eyebrow>
              <h1 className="text-[clamp(2.2rem,5vw,4rem)] leading-[1.04] tracking-[-0.03em] mb-3.5">
                Machine-readable benchmark data
              </h1>
              <p className="text-muted text-[1.08rem] max-w-[860px] mb-[22px]">
                Compassion Benchmark publishes score data for all 1,156 entities as
                structured JSON files served directly from this domain. They are free
                to access; if you use them in research or reporting, please cite the
                source with attribution. See{" "}
                <Link
                  href="/data-licenses"
                  className="text-accent hover:underline"
                >
                  /data-licenses
                </Link>{" "}
                for formal usage terms.
              </p>
              <p className="text-muted text-[0.95rem] max-w-[760px] mb-5">
                <span className="text-text font-semibold">Independence note:</span>{" "}
                Entities never pay for inclusion, score changes, or suppression of
                findings. Published scores reflect the benchmark&apos;s independent
                methodology only.
              </p>
            </div>

            <Panel>
              <h3 className="text-[1.08rem] font-bold mb-2.5">Quick links</h3>
              <ul className="space-y-2 text-[0.95rem] text-muted mb-4">
                <li>
                  <Link
                    href="/data/index.json"
                    className="text-accent hover:underline font-mono text-[0.88rem]"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    /data/index.json
                  </Link>{" "}
                  — entity catalog (1,156 entries)
                </li>
                <li>
                  <Link
                    href="/data/indexes/fortune-500.json"
                    className="text-accent hover:underline font-mono text-[0.88rem]"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    /data/indexes/fortune-500.json
                  </Link>{" "}
                  — example aggregate
                </li>
                <li>
                  <Link
                    href="/data/scores/microsoft.json"
                    className="text-accent hover:underline font-mono text-[0.88rem]"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    /data/scores/microsoft.json
                  </Link>{" "}
                  — example entity file
                </li>
              </ul>
              <div className="flex gap-3 flex-wrap">
                <Button href="/data-licenses" variant="primary">
                  Usage terms
                </Button>
                <Button href="/methodology" variant="default">
                  Methodology
                </Button>
              </div>
            </Panel>
          </div>
        </Container>
      </section>

      {/* Endpoint 1: Per-index aggregate files */}
      <section className="py-[30px] border-t border-line">
        <Container>
          <SectionHead
            title="Per-index aggregate files"
            description="One JSON file per index containing all entities, ranks, scores, and band classifications for that index."
          />

          <div className="mb-5">
            <p className="text-muted text-[0.95rem] mb-2">
              <span className="text-text font-semibold">Base URL pattern:</span>{" "}
              <code className="font-mono text-[0.88rem] text-accent bg-[rgba(125,211,252,0.06)] px-1.5 py-0.5 rounded border border-[rgba(125,211,252,0.14)]">
                https://compassionbenchmark.com/data/indexes/&#123;slug&#125;.json
              </code>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {INDEXES.map((idx) => (
              <Card key={idx.slug}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="text-[1.05rem] font-bold">{idx.label}</h3>
                  <Link
                    href={idx.page}
                    className="text-[0.78rem] text-accent hover:underline shrink-0"
                  >
                    Browse index →
                  </Link>
                </div>
                <p className="text-muted text-[0.9rem] mb-3">{idx.description}</p>
                <Link
                  href={`/data/indexes/${idx.slug}.json`}
                  className="font-mono text-[0.8rem] text-accent hover:underline break-all"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  /data/indexes/{idx.slug}.json
                </Link>
              </Card>
            ))}
          </div>

          <Panel>
            <h3 className="text-[1rem] font-bold mb-2">Aggregate file schema</h3>
            <p className="text-muted text-[0.9rem] mb-3">
              Each per-index file is a JSON object with the following top-level fields:
            </p>
            <ul className="space-y-1.5 text-[0.9rem] text-muted">
              <li>
                <code className="text-accent font-mono text-[0.85rem]">generatedAt</code>{" "}
                — ISO 8601 timestamp of last build
              </li>
              <li>
                <code className="text-accent font-mono text-[0.85rem]">index</code>{" "}
                — index slug (e.g. &quot;fortune-500&quot;)
              </li>
              <li>
                <code className="text-accent font-mono text-[0.85rem]">entities[]</code>{" "}
                — array of entity objects, each with: <code className="text-accent font-mono text-[0.82rem]">slug</code>,{" "}
                <code className="text-accent font-mono text-[0.82rem]">name</code>,{" "}
                <code className="text-accent font-mono text-[0.82rem]">rank</code>,{" "}
                <code className="text-accent font-mono text-[0.82rem]">composite</code>{" "}
                (0–100 score),{" "}
                <code className="text-accent font-mono text-[0.82rem]">band</code>{" "}
                (Critical / Developing / Functional / Established / Exemplary),
                and dimension scores (AWR, RES, POL, SYS, PAR, LRN, COM, INT)
              </li>
            </ul>
          </Panel>
        </Container>
      </section>

      {/* Endpoint 2: Per-entity score files */}
      <section className="py-[30px] border-t border-line">
        <Container>
          <SectionHead
            title="Per-entity score files"
            description="A separate JSON file for each of the 1,156 scored entities, keyed by slug."
          />

          <div className="mb-5">
            <p className="text-muted text-[0.95rem] mb-2">
              <span className="text-text font-semibold">Base URL pattern:</span>{" "}
              <code className="font-mono text-[0.88rem] text-accent bg-[rgba(125,211,252,0.06)] px-1.5 py-0.5 rounded border border-[rgba(125,211,252,0.14)]">
                https://compassionbenchmark.com/data/scores/&#123;slug&#125;.json
              </code>
            </p>
            <p className="text-muted text-[0.92rem] mt-2">
              There are approximately 1,156 entity files. Slugs match the URL
              segment on each entity&apos;s benchmark page — for example, the slug for
              Microsoft is{" "}
              <code className="font-mono text-[0.85rem] text-accent">microsoft</code>{" "}
              and its file is at{" "}
              <Link
                href="/data/scores/microsoft.json"
                className="text-accent hover:underline font-mono text-[0.85rem]"
                target="_blank"
                rel="noopener noreferrer"
              >
                /data/scores/microsoft.json
              </Link>
              .
            </p>
          </div>

          <Panel>
            <h3 className="text-[1rem] font-bold mb-2">Entity score file schema</h3>
            <p className="text-muted text-[0.9rem] mb-3">
              Each per-entity file is a JSON object used to power the live scoring badge
              and entity-page data. Fields include:
            </p>
            <ul className="space-y-1.5 text-[0.9rem] text-muted">
              <li>
                <code className="text-accent font-mono text-[0.85rem]">slug</code>,{" "}
                <code className="text-accent font-mono text-[0.85rem]">name</code>,{" "}
                <code className="text-accent font-mono text-[0.85rem]">kind</code>{" "}
                — entity identifier and type (country, company, ai-lab, etc.)
              </li>
              <li>
                <code className="text-accent font-mono text-[0.85rem]">composite</code>{" "}
                — overall score (0–100), weighted mean of the 8 dimensions
              </li>
              <li>
                <code className="text-accent font-mono text-[0.85rem]">band</code>{" "}
                — band name (Critical / Developing / Functional / Established / Exemplary)
              </li>
              <li>
                <code className="text-accent font-mono text-[0.85rem]">rank</code>,{" "}
                <code className="text-accent font-mono text-[0.85rem]">indexTotal</code>{" "}
                — position within the index and total entities in that index
              </li>
              <li>
                <code className="text-accent font-mono text-[0.85rem]">dimensions</code>{" "}
                — object with per-dimension scores (AWR, RES, POL, SYS, PAR, LRN, COM, INT)
              </li>
              <li>
                <code className="text-accent font-mono text-[0.85rem]">generatedAt</code>{" "}
                — ISO 8601 build timestamp
              </li>
            </ul>
          </Panel>
        </Container>
      </section>

      {/* Endpoint 3: Entity catalog */}
      <section className="py-[30px] border-t border-line">
        <Container>
          <SectionHead
            title="Entity catalog"
            description="A single file listing every scored entity across all indexes."
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Panel>
              <h3 className="text-[1rem] font-bold mb-2">
                <Link
                  href="/data/index.json"
                  className="text-accent hover:underline font-mono text-[0.95rem]"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  /data/index.json
                </Link>
              </h3>
              <p className="text-muted text-[0.9rem] mb-3">
                The top-level catalog of all entities. Use this file to discover
                available slugs before fetching individual score files. Fields include:
              </p>
              <ul className="space-y-1 text-[0.9rem] text-muted">
                <li>
                  <code className="text-accent font-mono text-[0.85rem]">generatedAt</code>{" "}
                  — build timestamp
                </li>
                <li>
                  <code className="text-accent font-mono text-[0.85rem]">totalEntities</code>{" "}
                  — count of all scored entities
                </li>
                <li>
                  <code className="text-accent font-mono text-[0.85rem]">indexes</code>{" "}
                  — array of index slugs
                </li>
                <li>
                  <code className="text-accent font-mono text-[0.85rem]">entities[]</code>{" "}
                  — array with slug, name, indexSlug, kind, rank, composite, band
                </li>
              </ul>
            </Panel>

            <Panel>
              <h3 className="text-[1rem] font-bold mb-2">Suggested use pattern</h3>
              <ol className="space-y-2 text-[0.9rem] text-muted list-decimal pl-4">
                <li>
                  Fetch <code className="text-accent font-mono text-[0.82rem]">/data/index.json</code>{" "}
                  to enumerate all available slugs and their index membership.
                </li>
                <li>
                  Fetch individual{" "}
                  <code className="text-accent font-mono text-[0.82rem]">/data/scores/&#123;slug&#125;.json</code>{" "}
                  files for the entities you need.
                </li>
                <li>
                  Or fetch{" "}
                  <code className="text-accent font-mono text-[0.82rem]">/data/indexes/&#123;slug&#125;.json</code>{" "}
                  to get all entities for a given index in one request.
                </li>
                <li>
                  All files are static JSON served with standard cache headers — no API
                  key required.
                </li>
              </ol>
            </Panel>
          </div>
        </Container>
      </section>

      {/* How to cite */}
      <section id="how-to-cite" className="py-[30px] border-t border-line scroll-mt-24">
        <Container>
          <SectionHead
            title="How to cite this data"
            description="If you use Compassion Benchmark data in research, reporting, or a product, please cite the source."
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <Panel>
              <h3 className="text-[1rem] font-bold mb-3">General citation format</h3>
              <blockquote className="border-l-2 border-[rgba(125,211,252,0.35)] pl-4 text-muted text-[0.9rem] leading-relaxed italic mb-3">
                Compassion Benchmark. &quot;[Index or Entity Name].&quot;
                compassionbenchmark.com, accessed [Month Year].
              </blockquote>
              <p className="text-muted text-[0.85rem]">
                For a specific entity page, use the full URL, e.g.
                <br />
                <span className="font-mono text-[0.82rem] text-accent">
                  compassionbenchmark.com/fortune-500/microsoft
                </span>
              </p>
            </Panel>

            <Panel>
              <h3 className="text-[1rem] font-bold mb-3">Attribution notes</h3>
              <ul className="space-y-2 text-[0.9rem] text-muted">
                <li>
                  Data is free to access. We ask for attribution when the data
                  appears in published work, reporting, or a product visible to others.
                </li>
                <li>
                  Scores reflect the benchmark&apos;s independent methodology — see{" "}
                  <Link href="/methodology" className="text-accent hover:underline">
                    /methodology
                  </Link>{" "}
                  for the full framework.
                </li>
                <li>
                  For formal data usage rights (CSV exports, institutional use,
                  redistribution), see{" "}
                  <Link href="/data-licenses" className="text-accent hover:underline">
                    /data-licenses
                  </Link>
                  .
                </li>
              </ul>
            </Panel>
          </div>

          <p className="text-muted text-[0.9rem] max-w-[760px]">
            For press inquiries and data briefing requests, see{" "}
            <Link href="/media" className="text-accent hover:underline">
              For Press &amp; Researchers
            </Link>
            .
          </p>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-[30px] border-t border-line">
        <Container>
          <Callout>
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] mb-2">
              Formal data licensing
            </h2>
            <p className="text-muted max-w-[760px] mb-[18px]">
              Need CSV exports, structured data rights, institutional access, or
              multi-team licensing? See the data licenses page for usage categories
              and contact sales for a quote.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Button href="/data-licenses" variant="primary">
                Data licenses
              </Button>
              <Button href="/contact-sales" variant="default">
                Contact sales
              </Button>
            </div>
          </Callout>
        </Container>
      </section>
    </>
  );
}
