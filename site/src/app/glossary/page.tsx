import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import SectionHead from "@/components/ui/SectionHead";
import DefinedTermSetJsonLd from "@/components/seo/DefinedTermSetJsonLd";
import BreadcrumbJsonLd, { breadcrumbUrl } from "@/components/seo/BreadcrumbJsonLd";
import { DIMENSIONS } from "@/data/dimensions";
import { getGlossaryEntry } from "@/data/glossary";

export const metadata: Metadata = {
  title: "Glossary",
  description:
    "Plain-English definitions for every Compassion Benchmark scoring term — composite score, bands, the 8 dimensions, the 40 subdimensions, and evidence classifications.",
};

/**
 * Ordered, de-duplicated glossary keys, grouped for readability.
 *
 * All labels/definitions are pulled verbatim at render time from
 * @/data/glossary (GLOSSARY, derived from @/data/dimensions) via
 * getGlossaryEntry() — nothing on this page is hand-typed content.
 */
const SCORING_FUNDAMENTALS_KEYS = [
  "composite",
  "band",
  "band-critical",
  "band-developing",
  "band-functional",
  "band-established",
  "band-exemplary",
];

const META_KEYS = ["dimension", "subdimension", "integration-premium"];

const EVIDENCE_KEYS = [
  "confidence",
  "floor",
  "band-change",
  "first-baseline",
  "sector-alert",
  "in-window",
  "evidence-tier",
];

// The 8 dimension terms — keyed by lowercase dimension code (awr, emp, act, ...).
const DIMENSION_KEYS = DIMENSIONS.map((d) => d.code.toLowerCase());

function TermRow({ termKey }: { termKey: string }) {
  const entry = getGlossaryEntry(termKey);
  if (!entry) return null;
  return (
    <div id={termKey} className="scroll-mt-24 border-b border-line py-4 last:border-b-0">
      <dt className="text-text font-bold mb-1">{entry.label}</dt>
      <dd className="text-muted m-0">
        {entry.definition}{" "}
        {entry.href && (
          <Link href={entry.href} className="text-accent hover:underline whitespace-nowrap">
            {entry.hrefLabel ?? "Read more"} &rarr;
          </Link>
        )}
      </dd>
    </div>
  );
}

function TermGroup({ keys }: { keys: string[] }) {
  return (
    <dl className="m-0">
      {keys.map((k) => (
        <TermRow key={k} termKey={k} />
      ))}
    </dl>
  );
}

export default function GlossaryPage() {
  return (
    <>
      {/* SEO/AEO: DefinedTermSet JSON-LD (dimensions + bands), reused from /methodology */}
      <DefinedTermSetJsonLd />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: breadcrumbUrl("/") },
          { name: "Glossary", url: breadcrumbUrl("/glossary") },
        ]}
      />

      <main id="main-content">
        {/* Hero — answer-first */}
        <section className="pt-[72px] pb-8">
          <Container>
            <Eyebrow>Reference</Eyebrow>
            <h1 className="text-[clamp(2.2rem,5vw,4rem)] leading-[1.04] tracking-[-0.03em] mb-3.5">
              Compassion Benchmark Glossary
            </h1>
            <p className="text-muted text-[1.08rem] max-w-[860px] mb-[10px]">
              The Compassion Benchmark is an independent research institution that scores governments,
              companies, AI labs, robotics labs, and cities on a 0&ndash;100 scale across 8 dimensions and 40
              evidence-checked subdimensions of institutional compassion. Below is the full vocabulary used
              across every published score.
            </p>
            <p className="text-muted text-[0.9rem] max-w-[860px]">
              Every definition on this page is pulled directly from the canonical scoring data
              — see the{" "}
              <Link href="/methodology" className="text-accent hover:underline">
                full methodology
              </Link>{" "}
              or the{" "}
              <Link href="/dimensions" className="text-accent hover:underline">
                8 dimensions
              </Link>{" "}
              for the complete framework.
            </p>
          </Container>
        </section>

        {/* Scoring fundamentals */}
        <section className="py-[26px] border-t border-line scroll-mt-24" id="scoring-fundamentals">
          <Container>
            <SectionHead
              title="Scoring fundamentals"
              description="The composite score and the five bands used to interpret it."
            />
            <TermGroup keys={SCORING_FUNDAMENTALS_KEYS} />
          </Container>
        </section>

        {/* The 8 dimensions */}
        <section className="py-[26px] border-t border-line scroll-mt-24" id="dimension-terms">
          <Container>
            <SectionHead
              title="The 8 dimensions"
              description="Each of the 8 core dimensions in the Compassion Benchmark framework. See the full dimension pages for subdimensions and anchors."
            />
            <TermGroup keys={DIMENSION_KEYS} />
          </Container>
        </section>

        {/* Meta terms */}
        <section className="py-[26px] border-t border-line scroll-mt-24" id="meta-terms">
          <Container>
            <SectionHead
              title="Framework structure"
              description="How dimensions, subdimensions, and the integration premium fit together."
            />
            <TermGroup keys={META_KEYS} />
          </Container>
        </section>

        {/* Evidence & briefing terms */}
        <section className="py-[26px] border-t border-line scroll-mt-24" id="evidence-terms">
          <Container>
            <SectionHead
              title="Evidence & briefing terms"
              description="Terms used in the nightly research pipeline and daily briefings."
            />
            <TermGroup keys={EVIDENCE_KEYS} />
          </Container>
        </section>

        {/* 40 subdimensions, grouped by parent dimension */}
        <section className="py-[26px] border-t border-line scroll-mt-24" id="subdimensions">
          <Container>
            <SectionHead
              title="The 40 subdimensions"
              description="Every subdimension is scored 0–5 against a behavioral anchor ladder. Grouped by parent dimension."
            />
            <div className="space-y-8">
              {DIMENSIONS.map((dim) => (
                <div key={dim.code}>
                  <h3
                    className="text-[1.05rem] font-bold mb-1.5"
                    style={{ color: dim.color }}
                  >
                    {dim.name} ({dim.code})
                  </h3>
                  <TermGroup keys={dim.subdims.map((s) => s.code.toLowerCase())} />
                </div>
              ))}
            </div>
          </Container>
        </section>
      </main>
    </>
  );
}
