import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Panel from "@/components/ui/Panel";
import Button from "@/components/ui/Button";
import SectionHead from "@/components/ui/SectionHead";
import FaqJsonLd, { type FaqItem } from "@/components/seo/FaqJsonLd";
import FaqAccordion from "@/components/seo/FaqAccordion";
import BreadcrumbJsonLd, { breadcrumbUrl } from "@/components/seo/BreadcrumbJsonLd";
import { DIMENSIONS, type Dimension } from "@/data/dimensions";
import { slugify } from "@/lib/slugify";

const SITE_URL = "https://compassionbenchmark.com";

function findDimension(slug: string): Dimension | undefined {
  return DIMENSIONS.find((d) => slugify(d.name) === slug);
}

// Static export requires every dynamic segment to be enumerated at build time.
export function generateStaticParams() {
  return DIMENSIONS.map((d) => ({ slug: slugify(d.name) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const dim = findDimension(slug);
  if (!dim) {
    return { title: "Dimension — Compassion Benchmark" };
  }
  return {
    title: `${dim.name} (${dim.code}) Dimension`,
    description: `What the ${dim.name} score measures: ${dim.desc}`,
  };
}

export default async function DimensionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const dim = findDimension(slug);
  if (!dim) notFound();

  const canonicalUrl = `${SITE_URL}/dimensions/${slug}`;

  // Single-term schema.org DefinedTerm for this dimension — sourced verbatim
  // from dimensions.ts, no invented text.
  const definedTermJsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: dim.name,
    termCode: dim.code,
    alternateName: dim.code,
    description: dim.longDesc,
    inDefinedTermSet: `${SITE_URL}/dimensions`,
    url: canonicalUrl,
  };

  const faqItems: FaqItem[] = [
    {
      question: `What is the ${dim.name} score?`,
      answer: dim.longDesc,
    },
    {
      question: `What does ${dim.name} (${dim.code}) measure?`,
      answer: dim.desc,
    },
    {
      question: `How many subdimensions make up ${dim.name}?`,
      answer: `${dim.name} is scored across 5 subdimensions: ${dim.subdims
        .map((s) => `${s.code} (${s.name})`)
        .join(", ")}.`,
    },
    {
      question: `How is the ${dim.name} score calculated?`,
      answer: `Each of the 5 ${dim.name} subdimensions is scored 0–5 against an anchored behavioral scale. The 5 subdimension scores combine into a ${dim.code} dimension score, which is averaged with the other 7 dimensions and converted into the entity's 0–100 composite score. See the full methodology for the exact formula.`,
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(definedTermJsonLd) }}
      />
      <FaqJsonLd items={faqItems} />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: breadcrumbUrl("/") },
          { name: "Dimensions", url: breadcrumbUrl("/dimensions") },
          { name: dim.name, url: breadcrumbUrl(`/dimensions/${slug}`) },
        ]}
      />

      <main id="main-content">
        {/* Hero — answer-first, self-contained liftable definition */}
        <section className="pt-[72px] pb-8">
          <Container>
            <Eyebrow>
              <span style={{ color: dim.color }}>{dim.code}</span>
              {" "}&middot; Compassion Benchmark Dimension
            </Eyebrow>
            <h1 className="text-[clamp(2.2rem,5vw,4rem)] leading-[1.04] tracking-[-0.03em] mb-3.5">
              What is the {dim.name} score?
            </h1>
            <p className="text-muted text-[1.08rem] max-w-[860px] mb-3">
              {dim.name} ({dim.code}) is one of the 8 core dimensions in the Compassion Benchmark
              framework — the independent 0&ndash;100 scoring system applied to governments, companies,
              AI labs, robotics labs, and cities. {dim.longDesc}
            </p>
            <p className="text-muted text-[0.95rem] max-w-[860px] mb-[22px]">
              {dim.name} is scored using 5 anchored subdimensions, each rated 0&ndash;5 against
              documented evidence. Those subdimension scores combine into the entity&apos;s {dim.code}{" "}
              dimension score, which contributes equally alongside the other 7 dimensions to the
              entity&apos;s overall composite score and performance band.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Button href="/methodology">Read full Methodology</Button>
              <Button href="/dimensions">All 8 Dimensions</Button>
            </div>
          </Container>
        </section>

        {/* 5 subdimensions as anchored sections */}
        <section className="py-[26px] border-t border-line">
          <Container>
            <SectionHead
              title={`The 5 ${dim.name} subdimensions`}
              description="Each subdimension is a specific assessment question, scored 0–5 against a behavioral anchor ladder from documented evidence."
            />
            <div className="space-y-4">
              {dim.subdims.map((sub) => (
                <div key={sub.code} id={`subdim-${sub.code.toLowerCase()}`} className="scroll-mt-24">
                  <Panel>
                    <p
                      className="text-[0.78rem] font-bold uppercase tracking-[0.1em] mb-1.5"
                      style={{ color: dim.color }}
                    >
                      {sub.code}
                    </p>
                    <h3 className="text-[1.05rem] font-bold mb-2">{sub.name}</h3>
                    <p className="text-muted mb-3">{sub.desc}</p>
                    <details className="group rounded-[10px] border border-line bg-[rgba(255,255,255,0.02)] overflow-hidden">
                      <summary className="flex items-center gap-2 px-3.5 py-2.5 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden text-[0.82rem] font-semibold text-muted hover:text-[#7dd3fc] transition-colors">
                        <svg
                          width="11"
                          height="11"
                          viewBox="0 0 13 13"
                          fill="none"
                          aria-hidden="true"
                          className="transition-transform group-open:rotate-90 shrink-0 motion-reduce:transition-none"
                        >
                          <path
                            d="M4.5 2.5l4 4-4 4"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        0–5 anchor scale for {sub.code}
                      </summary>
                      <ol className="border-t border-line px-3.5 py-3 text-muted text-[0.86rem] space-y-1.5 list-decimal pl-[1.6em]">
                        {sub.anchors.map((anchor, i) => (
                          <li key={i}>{anchor}</li>
                        ))}
                      </ol>
                    </details>
                  </Panel>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* FAQ */}
        <section className="py-[26px] border-t border-line">
          <Container>
            <FaqAccordion items={faqItems} />
          </Container>
        </section>

        {/* Back-links */}
        <section className="py-[26px] border-t border-line">
          <Container>
            <div className="flex gap-3 flex-wrap">
              <Button href="/methodology">Read full Methodology</Button>
              <Button href="/dimensions">All 8 Dimensions</Button>
              <Button href="/glossary">Glossary</Button>
            </div>
          </Container>
        </section>
      </main>
    </>
  );
}
