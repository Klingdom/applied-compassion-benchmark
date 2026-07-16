import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import SectionHead from "@/components/ui/SectionHead";
import BreadcrumbJsonLd, { breadcrumbUrl } from "@/components/seo/BreadcrumbJsonLd";
import { DIMENSIONS } from "@/data/dimensions";
import { slugify } from "@/lib/slugify";

export const metadata: Metadata = {
  title: "The 8 Dimensions",
  description:
    "The 8 dimensions of institutional compassion scored by the Compassion Benchmark: Awareness, Empathy, Action, Equity, Boundaries, Accountability, Systemic Thinking, and Integrity.",
};

export default function DimensionsHubPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: breadcrumbUrl("/") },
          { name: "Dimensions", url: breadcrumbUrl("/dimensions") },
        ]}
      />

      <main id="main-content">
        {/* Hero — answer-first */}
        <section className="pt-[72px] pb-8">
          <Container>
            <Eyebrow>Framework</Eyebrow>
            <h1 className="text-[clamp(2.2rem,5vw,4rem)] leading-[1.04] tracking-[-0.03em] mb-3.5">
              The 8 Dimensions of Institutional Compassion
            </h1>
            <p className="text-muted text-[1.08rem] max-w-[860px] mb-3">
              Every entity scored by the Compassion Benchmark — governments, companies, AI labs, robotics
              labs, and cities — is assessed on the same 8 dimensions of institutional compassion:{" "}
              {DIMENSIONS.map((d) => d.name).join(", ")}. Each dimension breaks into 5 evidence-anchored
              subdimensions, scored 0&ndash;5, that roll up into the entity&apos;s 0&ndash;100 composite score.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Button href="/methodology">Read full Methodology</Button>
              <Button href="/glossary">Glossary of terms</Button>
            </div>
          </Container>
        </section>

        {/* 8 dimension cards */}
        <section className="py-[26px] border-t border-line">
          <Container>
            <SectionHead
              title="Select a dimension"
              description="Each dimension page defines the dimension, walks through its 5 subdimensions, and links back to the full methodology."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {DIMENSIONS.map((dim) => {
                const slug = slugify(dim.name);
                return (
                  <Card key={dim.code} href={`/dimensions/${slug}`}>
                    <p
                      className="text-[0.78rem] font-bold uppercase tracking-[0.1em] mb-2"
                      style={{ color: dim.color }}
                    >
                      {dim.code}
                    </p>
                    <h2 className="text-[1.1rem] font-bold mb-2">{dim.name}</h2>
                    <p className="text-muted text-[0.9rem]">{dim.desc}</p>
                  </Card>
                );
              })}
            </div>
          </Container>
        </section>

        {/* Footer link back into methodology */}
        <section className="py-[26px] border-t border-line">
          <Container>
            <p className="text-muted text-[0.92rem]">
              Want the full scoring formula, evidence hierarchy, and 40-subdimension anchor table in one
              place?{" "}
              <Link href="/methodology" className="text-accent hover:underline">
                Read the complete methodology &rarr;
              </Link>
            </p>
          </Container>
        </section>
      </main>
    </>
  );
}
