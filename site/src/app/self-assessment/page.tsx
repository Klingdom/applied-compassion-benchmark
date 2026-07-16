import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import SelfAssessment from "@/components/assessment/SelfAssessment";

export const metadata: Metadata = {
  title: "Free Self-Assessment — Measure Your Organization",
  description:
    "Measure your organization's institutional compassion with a free self-assessment across 8 dimensions and 40 subdimensions — the same framework used in the Compassion Benchmark.",
};

export default function SelfAssessmentPage() {
  return (
    <>
      {/* G6: search-intent intro (page-level only — SelfAssessment component
          logic and its own internal headings are unchanged). */}
      <section className="pt-[72px] pb-2">
        <Container>
          <Eyebrow>Free tool &middot; 8 Dimensions &middot; 40 Subdimensions</Eyebrow>
          <h1 className="text-[clamp(2.2rem,5vw,4rem)] leading-[1.04] tracking-[-0.03em] mb-3.5 max-w-[900px]">
            Measure your organization&apos;s institutional compassion (free self-assessment)
          </h1>
          <p className="text-muted text-[1.05rem] max-w-[820px] mb-2">
            Score your own organization against the same 8-dimension, 40-subdimension framework the
            Compassion Benchmark uses to rank governments, companies, AI labs, and cities — free, and
            without submitting anything to us until you choose to save your results.
          </p>
        </Container>
      </section>
      <SelfAssessment />
    </>
  );
}
