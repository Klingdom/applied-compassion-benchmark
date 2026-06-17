import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import Panel from "@/components/ui/Panel";
import Card from "@/components/ui/Card";
import SectionHead from "@/components/ui/SectionHead";
import Callout from "@/components/ui/Callout";
import CopyCiteButton from "@/components/charts/CopyCiteButton";

export const metadata: Metadata = {
  title: "For Press & Researchers",
  description:
    "Cite, embed, and access Compassion Benchmark data. Citation formats, methodology links, data endpoints, RSS/JSON feeds, and contact path for media and data inquiries.",
};

// Canonical citation string for general press / researcher use.
const GENERAL_CITE =
  'Compassion Benchmark. compassionbenchmark.com. Accessed [Month Year]. Independent — entities never pay for inclusion, score changes, or suppression of findings.';

// How-to-cite examples for common styles.
const CITE_EXAMPLES = [
  {
    style: "AP-style (journalism)",
    text: 'According to the Compassion Benchmark (compassionbenchmark.com), accessed [Month Year], [Entity] scores [score] out of 100 on the [Index].',
  },
  {
    style: "Academic / APA-adjacent",
    text: 'Compassion Benchmark. ([Year]). [Entity name]. compassionbenchmark.com/[index]/[slug]. Retrieved [Month Day, Year].',
  },
  {
    style: "Dataset reference",
    text: 'Compassion Benchmark. "[Index] dataset." compassionbenchmark.com/data/indexes/[slug].json. Accessed [Month Year].',
  },
] as const;

export default function MediaPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-[72px] pb-10">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-[18px] items-start">
            <div>
              <Eyebrow>For press &amp; researchers</Eyebrow>
              <h1 className="text-[clamp(2.2rem,5vw,4rem)] leading-[1.04] tracking-[-0.03em] mb-3.5">
                Cite, access, and use Compassion Benchmark data
              </h1>
              <p className="text-muted text-[1.08rem] max-w-[860px] mb-[22px]">
                Compassion Benchmark is an independent benchmark institution. Scores are
                based on published methodology and are never influenced by the entities
                being scored. This page gives journalists, researchers, and policy
                professionals everything they need to cite, link, and reference the
                benchmark in their work.
              </p>
              <p className="text-[0.92rem] text-muted max-w-[700px]">
                <span className="text-text font-semibold">Independence:</span> Entities
                never pay for inclusion, score changes, or suppression of findings.
                Commercial services support access, interpretation, and institutional
                use only.
              </p>
            </div>

            <Panel>
              <h3 className="text-[1.08rem] font-bold mb-2.5">Fast access</h3>
              <ul className="space-y-2.5 text-muted text-[0.92rem] mb-4">
                <li>
                  <Link href="#flagship" className="text-accent hover:underline">
                    Flagship 2026 report
                  </Link>
                  {" "}— press centerpiece, ready-to-cite
                </li>
                <li>
                  <Link href="#cite" className="text-accent hover:underline">
                    Citation formats
                  </Link>
                  {" "}— copy-ready strings
                </li>
                <li>
                  <Link href="#data" className="text-accent hover:underline">
                    Data endpoints
                  </Link>
                  {" "}— machine-readable JSON
                </li>
                <li>
                  <Link href="#feeds" className="text-accent hover:underline">
                    RSS / JSON feeds
                  </Link>
                  {" "}— subscribe to score updates
                </li>
                <li>
                  <Link href="#methodology" className="text-accent hover:underline">
                    Methodology
                  </Link>
                  {" "}— full scoring framework
                </li>
                <li>
                  <Link href="#contact" className="text-accent hover:underline">
                    Contact for data briefings
                  </Link>
                </li>
              </ul>
              <Button href="/contact" variant="primary">
                Media &amp; data inquiry
              </Button>
            </Panel>
          </div>
        </Container>
      </section>

      {/* Flagship report — press centerpiece */}
      <section id="flagship" className="py-[30px] border-t border-line scroll-mt-24">
        <Container>
          <div className="rounded-[20px] border border-[rgba(125,211,252,0.28)] bg-gradient-to-br from-[rgba(125,211,252,0.08)] to-[rgba(96,165,250,0.04)] p-7">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
              <div className="min-w-0">
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-accent mb-2">
                  Flagship Report &mdash; For Journalists
                </p>
                <h2 className="text-[clamp(1.2rem,3vw,1.75rem)] font-bold tracking-[-0.02em] leading-tight mb-2.5">
                  The State of Institutional Compassion &mdash; 2026
                </h2>
                <p className="text-muted text-[0.95rem] leading-relaxed max-w-[640px] mb-4">
                  The benchmark&apos;s inaugural state-of-the-field report. 1,156 institutions
                  scored across seven index families on one shared 0&ndash;100 framework. The
                  modal result is mediocrity; 67.7% cluster in the middle bands; a 90.5%
                  equity gap persists across every index family. Methodology and
                  independence disclosures are embedded in the report.
                </p>
                <p className="text-[0.82rem] text-muted mb-4">
                  <span className="text-text font-semibold">For press inquiries and data briefings</span>
                  {" "}— use the{" "}
                  <Link href="/contact" className="text-accent hover:underline">
                    contact page
                  </Link>
                  . No embargo applies; the full report is publicly available.
                </p>
                {/* Ready-to-cite string for the report */}
                <div className="rounded-[12px] border border-[rgba(125,211,252,0.18)] bg-[rgba(0,0,0,0.2)] px-4 py-3 mb-3">
                  <p className="text-[0.72rem] uppercase tracking-[0.1em] text-muted font-semibold mb-1.5">
                    Ready-to-cite (report)
                  </p>
                  <p
                    className="font-mono text-[0.82rem] text-text leading-relaxed select-all"
                    aria-label="Citation string for the 2026 flagship report — click to select all"
                  >
                    {`Compassion Benchmark. "The State of Institutional Compassion — 2026." compassionbenchmark.com/updates/special/state-of-institutional-compassion-2026. Accessed [Month Year]. Independent — entities never pay for inclusion, score changes, or suppression of findings.`}
                  </p>
                </div>
              </div>
              <div className="shrink-0 flex flex-col gap-2.5">
                <Button
                  href="/updates/special/state-of-institutional-compassion-2026"
                  variant="primary"
                >
                  Read the 2026 report &rarr;
                </Button>
                <Button href="/contact" variant="default">
                  Press inquiry
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* How to cite */}
      <section id="cite" className="py-[30px] border-t border-line scroll-mt-24">
        <Container>
          <SectionHead
            title="How to cite the benchmark"
            description="Copy-ready citation strings for journalism, academic work, and dataset references."
          />

          {/* General cite string */}
          <div className="rounded-[16px] border border-[rgba(125,211,252,0.22)] bg-[rgba(125,211,252,0.04)] p-5 mb-6">
            <p className="text-[0.78rem] uppercase tracking-[0.12em] text-muted font-semibold mb-2">
              General citation string
            </p>
            <p
              className="font-mono text-[0.9rem] text-text leading-relaxed mb-1 select-all"
              aria-label="Citation string — click to select all"
            >
              {GENERAL_CITE}
            </p>
            <CopyCiteButton
              citeText={GENERAL_CITE}
              page_type="media"
              path="/media"
            />
          </div>

          {/* Style examples */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {CITE_EXAMPLES.map((ex) => (
              <Card key={ex.style}>
                <p className="text-[0.78rem] uppercase tracking-[0.1em] text-muted font-semibold mb-2">
                  {ex.style}
                </p>
                <p className="font-mono text-[0.82rem] text-muted leading-relaxed select-all">
                  {ex.text}
                </p>
              </Card>
            ))}
          </div>

          <p className="text-muted text-[0.88rem]">
            Replace placeholders in brackets with the entity name, URL, and access date.
            For the entity URL pattern, see an example:{" "}
            <code className="font-mono text-[0.85rem] text-accent">
              compassionbenchmark.com/fortune-500/microsoft
            </code>
            .
          </p>
        </Container>
      </section>

      {/* Data access */}
      <section id="data" className="py-[30px] border-t border-line scroll-mt-24">
        <Container>
          <SectionHead
            title="Data access"
            description="Machine-readable score data for all 1,156 entities — free to access, please cite with attribution."
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
            <Panel>
              <h3 className="text-[1rem] font-bold mb-2.5">Available endpoints</h3>
              <ul className="space-y-2 text-[0.9rem] text-muted">
                <li>
                  <Link
                    href="/data/index.json"
                    className="text-accent hover:underline font-mono text-[0.85rem]"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    /data/index.json
                  </Link>{" "}
                  — full entity catalog (1,156 entries)
                </li>
                <li>
                  <span className="font-mono text-[0.85rem] text-accent">
                    /data/indexes/&#123;slug&#125;.json
                  </span>{" "}
                  — per-index aggregate (7 indexes)
                </li>
                <li>
                  <span className="font-mono text-[0.85rem] text-accent">
                    /data/scores/&#123;slug&#125;.json
                  </span>{" "}
                  — per-entity scores (~1,156 files)
                </li>
              </ul>
              <div className="mt-4">
                <Button href="/data" variant="primary">
                  Full data documentation →
                </Button>
              </div>
            </Panel>

            <Panel>
              <h3 className="text-[1rem] font-bold mb-2.5">Terms of use</h3>
              <p className="text-muted text-[0.9rem] mb-3">
                Data published at{" "}
                <code className="font-mono text-[0.85rem] text-accent">
                  compassionbenchmark.com/data/
                </code>{" "}
                is free to access. Please cite with attribution. For formal data usage
                rights — structured exports, institutional licensing, redistribution —
                see the data licenses page.
              </p>
              <Button href="/data-licenses" variant="default">
                Data licenses &amp; formal terms
              </Button>
            </Panel>
          </div>

          <p className="text-muted text-[0.88rem]">
            Charts on index and entity pages use own-data SVG. You may reference or
            reproduce them with attribution to Compassion Benchmark and a link to the
            source page.
          </p>
        </Container>
      </section>

      {/* RSS / JSON feeds */}
      <section id="feeds" className="py-[30px] border-t border-line scroll-mt-24">
        <Container>
          <SectionHead
            title="RSS and JSON feeds"
            description="Subscribe to daily score updates in your feed reader or by polling the JSON endpoint."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <h3 className="text-[1.05rem] font-bold mb-1">RSS feed</h3>
              <p className="text-muted text-[0.9rem] mb-3">
                Standard RSS 2.0 feed of daily benchmark briefings. Compatible with
                feed readers and journalistic alert tools.
              </p>
              <Link
                href="/updates/feed.xml"
                className="font-mono text-[0.88rem] text-accent hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                compassionbenchmark.com/updates/feed.xml
              </Link>
            </Card>

            <Card>
              <h3 className="text-[1.05rem] font-bold mb-1">JSON feed</h3>
              <p className="text-muted text-[0.9rem] mb-3">
                JSON Feed 1.1 format — machine-parseable daily briefings, suitable for
                programmatic monitoring of score changes.
              </p>
              <Link
                href="/updates/feed.json"
                className="font-mono text-[0.88rem] text-accent hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                compassionbenchmark.com/updates/feed.json
              </Link>
            </Card>
          </div>
        </Container>
      </section>

      {/* Methodology */}
      <section id="methodology" className="py-[30px] border-t border-line scroll-mt-24">
        <Container>
          <SectionHead
            title="Methodology"
            description="The scoring framework, evidence hierarchy, and adversarial pressure-test model behind every score."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Panel>
              <h3 className="text-[1rem] font-bold mb-2">What the scores measure</h3>
              <p className="text-muted text-[0.9rem] mb-3">
                Each entity is scored across 8 dimensions (Awareness, Responsiveness,
                Policy, Systemic, Participation, Learning, Communication, Integration)
                totaling 40 subdimensions. The composite score is a weighted mean
                (0–100). Scores are grouped into five bands: Critical, Developing,
                Functional, Established, and Exemplary.
              </p>
              <Button href="/methodology" variant="primary">
                Read full methodology
              </Button>
            </Panel>

            <Panel>
              <h3 className="text-[1rem] font-bold mb-2">Independence guarantee</h3>
              <p className="text-muted text-[0.9rem] mb-3">
                The methodology is applied identically to all entities. Scores are
                evidence-linked and can change in response to documented events. Entities
                never pay for inclusion, a better score, or removal of findings. This
                separation is non-negotiable and is the basis for the benchmark&apos;s
                citability.
              </p>
              <Button href="/about" variant="default">
                About the institution
              </Button>
            </Panel>
          </div>
        </Container>
      </section>

      {/* Contact */}
      <section id="contact" className="py-[30px] border-t border-line scroll-mt-24">
        <Container>
          <Callout>
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] mb-2">
              Media and data inquiries
            </h2>
            <p className="text-muted max-w-[760px] mb-[18px]">
              For data briefings, methodology questions, media requests, or
              information about citing the benchmark in published work, use the
              general contact channel. There is no dedicated press email — all
              inquiries are handled through the same single contact point.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Button
                href="/contact"
                variant="primary"
              >
                Contact the benchmark
              </Button>
              <Button href="/data" variant="default">
                Data documentation
              </Button>
            </div>
          </Callout>
        </Container>
      </section>
    </>
  );
}
