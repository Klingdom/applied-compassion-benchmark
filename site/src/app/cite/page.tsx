import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Panel from "@/components/ui/Panel";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import SectionHead from "@/components/ui/SectionHead";
import Callout from "@/components/ui/Callout";
import CopyCiteButton from "@/components/charts/CopyCiteButton";
import BreadcrumbJsonLd, { breadcrumbUrl } from "@/components/seo/BreadcrumbJsonLd";

export const metadata: Metadata = {
  title: "How to Cite the Compassion Benchmark",
  description:
    "Citation formats for the Compassion Benchmark — APA, MLA, Chicago, and plain-text. Data is free and open to cite with attribution.",
};

// Canonical citation string — lifted verbatim from /media.
const GENERAL_CITE =
  'Compassion Benchmark. compassionbenchmark.com. Accessed [Month Year]. Independent — entities never pay for inclusion, score changes, or suppression of findings.';

// Format-specific citation examples. Same underlying facts as /media,
// framed for the four requested citation styles.
const CITATION_FORMATS = [
  {
    style: "APA",
    text: 'Compassion Benchmark. ([Year]). [Entity name]. Compassion Benchmark. compassionbenchmark.com/[index]/[slug]',
  },
  {
    style: "MLA",
    text: '"[Entity name]." Compassion Benchmark, [Year], compassionbenchmark.com/[index]/[slug]. Accessed [Day Month Year].',
  },
  {
    style: "Chicago",
    text: 'Compassion Benchmark. "[Entity name]." Accessed [Month Day, Year]. compassionbenchmark.com/[index]/[slug].',
  },
  {
    style: "Plain text / journalism",
    text: 'According to the Compassion Benchmark (compassionbenchmark.com), accessed [Month Year], [Entity] scores [score] out of 100 on the [Index].',
  },
] as const;

export default function CitePage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: breadcrumbUrl("/") },
          { name: "How to Cite", url: breadcrumbUrl("/cite") },
        ]}
      />

      <main id="main-content">
        {/* Hero — answer-first, cite-framed (not sales) */}
        <section className="pt-[72px] pb-8">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-[18px] items-start">
              <div>
                <Eyebrow>Citation guide</Eyebrow>
                <h1 className="text-[clamp(2.2rem,5vw,4rem)] leading-[1.04] tracking-[-0.03em] mb-3.5">
                  How to cite the Compassion Benchmark
                </h1>
                <p className="text-muted text-[1.08rem] max-w-[860px] mb-[22px]">
                  Cite the Compassion Benchmark as <strong className="text-text">&ldquo;Compassion Benchmark&rdquo;</strong> with
                  the URL <code className="font-mono text-[0.92rem] text-accent">compassionbenchmark.com</code> and the date
                  accessed. Compassion Benchmark data is free and open to cite with attribution — no permission is required.
                </p>
                <p className="text-[0.92rem] text-muted max-w-[700px]">
                  <span className="text-text font-semibold">Independence:</span> Entities never pay for
                  inclusion, score changes, or suppression of findings. Commercial services support
                  access, interpretation, and institutional use only.
                </p>
              </div>

              <Panel>
                <h3 className="text-[1.08rem] font-bold mb-2.5">On this page</h3>
                <ul className="space-y-2.5 text-muted text-[0.92rem] mb-4">
                  <li>
                    <Link href="#general" className="text-accent hover:underline">
                      General citation string
                    </Link>
                  </li>
                  <li>
                    <Link href="#formats" className="text-accent hover:underline">
                      APA / MLA / Chicago / plain-text
                    </Link>
                  </li>
                  <li>
                    <Link href="#canonical-url" className="text-accent hover:underline">
                      Canonical URL &amp; date pattern
                    </Link>
                  </li>
                  <li>
                    <Link href="#data-use" className="text-accent hover:underline">
                      Free &amp; open data, with attribution
                    </Link>
                  </li>
                </ul>
                <Button href="/media" variant="primary">
                  Full press &amp; researcher page
                </Button>
              </Panel>
            </div>
          </Container>
        </section>

        {/* General cite string */}
        <section id="general" className="py-[26px] border-t border-line scroll-mt-24">
          <Container>
            <SectionHead
              title="General citation string"
              description="Use this string when citing the benchmark as a whole, rather than a specific entity or index."
            />
            <div className="rounded-[16px] border border-[rgba(125,211,252,0.22)] bg-[rgba(125,211,252,0.04)] p-5">
              <p
                className="font-mono text-[0.9rem] text-text leading-relaxed mb-1 select-all"
                aria-label="Citation string — click to select all"
              >
                {GENERAL_CITE}
              </p>
              <CopyCiteButton citeText={GENERAL_CITE} page_type="cite" path="/cite" />
            </div>
          </Container>
        </section>

        {/* Format examples: APA / MLA / Chicago / plain */}
        <section id="formats" className="py-[26px] border-t border-line scroll-mt-24">
          <Container>
            <SectionHead
              title="Citation formats"
              description="Replace bracketed placeholders with the specific entity, index, year, and access date."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CITATION_FORMATS.map((ex) => (
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
          </Container>
        </section>

        {/* Canonical URL / date pattern */}
        <section id="canonical-url" className="py-[26px] border-t border-line scroll-mt-24">
          <Container>
            <SectionHead
              title="Canonical URL & date pattern"
              description="Every entity and index page has a stable, citable URL. Always include the date you accessed the score — scores update over time."
            />
            <Panel>
              <p className="text-muted text-[0.9rem] mb-3">
                Entity URL pattern:{" "}
                <code className="font-mono text-[0.85rem] text-accent">
                  compassionbenchmark.com/[index]/[slug]
                </code>
                , for example{" "}
                <code className="font-mono text-[0.85rem] text-accent">
                  compassionbenchmark.com/fortune-500/microsoft
                </code>
                .
              </p>
              <p className="text-muted text-[0.9rem] mb-3">
                Index URL pattern:{" "}
                <code className="font-mono text-[0.85rem] text-accent">
                  compassionbenchmark.com/[index]
                </code>
                , for example{" "}
                <code className="font-mono text-[0.85rem] text-accent">
                  compassionbenchmark.com/ai-labs
                </code>
                .
              </p>
              <p className="text-muted text-[0.9rem]">
                Because scores are updated through a nightly evidence-review pipeline, always include an{" "}
                <strong className="text-text">access date</strong> (Month Year is sufficient) in any
                citation. This lets readers know which version of the score you referenced.
              </p>
            </Panel>
          </Container>
        </section>

        {/* Free & open data, with attribution */}
        <section id="data-use" className="py-[26px] border-t border-line scroll-mt-24">
          <Container>
            <SectionHead
              title="Free & open data, with attribution"
              description="Compassion Benchmark data is free to access and cite."
            />
            <Callout>
              <p className="text-muted max-w-[900px] mb-3">
                Data published at{" "}
                <code className="font-mono text-[0.9rem] text-accent">compassionbenchmark.com/data/</code>{" "}
                is free to access. Please cite with attribution using one of the formats above. For
                formal data usage rights — structured exports, institutional licensing, or
                redistribution — see the data licenses page.
              </p>
              <div className="flex gap-3 flex-wrap">
                <Button href="/data" variant="primary">
                  Data documentation
                </Button>
                <Button href="/data-licenses">Data licenses &amp; formal terms</Button>
                <Button href="/media">Press &amp; researcher page</Button>
              </div>
            </Callout>
          </Container>
        </section>
      </main>
    </>
  );
}
