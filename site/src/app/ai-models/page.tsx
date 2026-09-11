import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import Stat from "@/components/ui/Stat";
import Panel from "@/components/ui/Panel";
import Callout from "@/components/ui/Callout";
import SectionHead from "@/components/ui/SectionHead";
import BreadcrumbJsonLd, { breadcrumbUrl } from "@/components/seo/BreadcrumbJsonLd";
import FaqJsonLd from "@/components/seo/FaqJsonLd";
import FaqAccordion from "@/components/seo/FaqAccordion";
import SubjectLine from "@/components/model-benchmark/SubjectLine";
import { MODEL_INDEX_FACTS as F, scorableItemsByDimension } from "@/lib/model-index-facts";
import { RELEASE_WATCH_FACTS as R } from "@/lib/release-watch-facts";

// No Dataset or ItemList JSON-LD is emitted while F.hasResults is false.
// An empty Dataset advertising 0 entities is a machine-readable non-thing.
// See DECISIONS.md D-29.

export const metadata: Metadata = {
  title: "AI Model Compassion Benchmark — Method Published, No Model Scored Yet",
  description:
    `How Compassion Benchmark evaluates AI models for compassion: ${F.itemCount} published task items across ` +
    `${F.dimensionCount} behavioural dimensions. The method is published in advance. ` +
    `${F.evaluatedModelCount === 0 ? "No model has been scored yet." : ""}`.trim(),
};

const thin = F.thinnestDimensions.map((d) => `${d.code} (${d.count})`).join(" and ");

const faqItems = [
  {
    question: "Which AI model is the most compassionate?",
    answer:
      `No model has been scored. The Compassion Benchmark Model Index has evaluated ${F.evaluatedModelCount} models to date. ` +
      `The method, the ${F.itemCount}-item task bank and the scoring rules are published in advance of any result, ` +
      `so that the instrument can be examined before it produces numbers. Any ranking of AI models by compassion ` +
      `attributed to Compassion Benchmark today would be fabricated.`,
  },
  {
    question: "Does an AI lab's compassion score tell me how its models behave?",
    answer:
      "No, and conflating the two is the most common error. The AI Labs Index scores an organisation on its public " +
      "governance record. The Model Index scores what a specific frozen model snapshot did when tested. A lab can " +
      "govern itself well and ship a model that behaves poorly, or the reverse. They are separate measurements of " +
      "separate objects and neither substitutes for the other.",
  },
  {
    question: "How many task items are there, and have they been reviewed?",
    answer:
      `The published bank holds ${F.itemCount} items across ${F.dimensionCount} dimensions. ` +
      `${F.reviewedItemCount} of them have completed human validation. ${F.scorableItemCount} are scorable ` +
      `(the remaining ${F.draftItemCount} are authored drafts awaiting review). Per-dimension coverage is uneven — ` +
      `${thin} — so those dimensions rest on very few items and should not be read as precisely as the others.`,
  },
  {
    question: "The task items are public. Doesn't that make the benchmark gameable?",
    answer:
      `Yes, and we state it rather than manage it. All ${F.itemCount} items are published with their full ` +
      `five-anchor scoring rubrics and have been on the open web for months. Any model trained or fine-tuned since ` +
      `may have absorbed both the items and the target behaviours. A score on this public pool therefore measures ` +
      `some mixture of behaviour and memorisation, with no way to separate them — so no valid cross-model ` +
      `comparison can be drawn from it. The public pool exists as a transparency artifact, so readers can see what ` +
      `is asked, and as a saturation sentinel. Comparative scoring requires a separate, unpublished item pool.`,
  },
  {
    question: "Can a lab pay to be included, to score higher, or to have findings withheld?",
    answer:
      "No. Compassion Benchmark is an independent benchmark institution. No entity pays for inclusion, for a score, " +
      "or for the suppression of findings, and that applies to AI models exactly as it applies to governments and " +
      "corporations. Commercial services cover access and interpretation only.",
  },
];

export default function AiModelsPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: breadcrumbUrl("/") },
          { name: "AI Models", url: breadcrumbUrl("/ai-models") },
        ]}
      />
      <FaqJsonLd items={faqItems} />

      {/* Answer-first lead — the honest headline, stated before anything else. */}
      <p className="text-[0.9rem] text-muted text-center py-3 px-4 border-b border-line/40 bg-[rgba(255,255,255,0.01)]">
        <span className="text-text font-medium">The method is published. No model has been scored yet.</span>{" "}
        Compassion Benchmark has evaluated{" "}
        <span className="text-text font-medium">{F.evaluatedModelCount}</span> AI models to date. The{" "}
        <span className="text-text font-medium">{F.itemCount}</span>-item task bank and the scoring rules are public
        in advance of any result.
      </p>

      <section className="py-[38px]">
        <Container>
          <Eyebrow>AI Model Compassion Benchmark · Pre-registration</Eyebrow>
          <h1 className="text-[clamp(2rem,4.5vw,3.1rem)] leading-[1.1] mt-3 mb-4">
            How compassionate are AI models?
          </h1>
          <p className="text-muted max-w-[900px] text-[1.05rem] leading-relaxed mb-5">
            We do not know yet — and we would rather say so than publish a number we cannot defend. What exists today
            is the instrument: a published task bank, a published scoring method, and published conditions under which
            the whole approach should be judged to have failed. Results come after the method, not before it.
          </p>
          <div className="mb-6">
            <SubjectLine />
          </div>
          <div className="flex gap-3 flex-wrap">
            <Button href="/ai-models/methodology" variant="primary">
              Read the method
            </Button>
            <Button href="/ai-labs">AI Labs Index (organisations)</Button>
          </div>
        </Container>
      </section>

      <section className="py-[22px]">
        <Container>
          <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(160px,1fr))]">
            <Stat value={String(F.evaluatedModelCount)} label="Models scored" />
            <Stat value={String(F.itemCount)} label="Published task items" />
            <Stat value={String(F.reviewedItemCount)} label="Items human-validated" />
            <Stat value={String(F.dimensionCount)} label="Behavioural dimensions" />
          </div>
          <p className="text-[0.82rem] text-muted-subtle mt-3 max-w-[900px]">
            These four numbers are read directly from the published data files at build time. Two of them are zero.
            That is the current, accurate state of the programme.
          </p>
        </Container>
      </section>

      {/* The Three Objects device — the highest-value content on this page. */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="Three different things, three different scores"
            description="Compassion Benchmark measures three distinct objects in the AI space. Readers who merge them reach confident wrong conclusions, so this distinction comes before any number."
          />
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(270px,1fr))]">
            <Panel>
              <p className="text-[0.75rem] tracking-wide text-muted-subtle uppercase mb-1">Who built it</p>
              <h3 className="text-[1.15rem] mb-2">AI Labs Index</h3>
              <p className="text-muted text-[0.93rem] leading-relaxed">
                Scores an <strong className="text-text">organisation</strong> on its public governance record — safety
                commitments, accountability, deployment boundaries. Evidence is the public record, not model output.
              </p>
            </Panel>
            <Panel>
              <p className="text-[0.75rem] tracking-wide text-muted-subtle uppercase mb-1">What it did</p>
              <h3 className="text-[1.15rem] mb-2">Model Index</h3>
              <p className="text-muted text-[0.93rem] leading-relaxed">
                Scores a <strong className="text-text">frozen model snapshot</strong> on what it actually did when
                tested against the task bank. Evidence is transcripts. This is the page you are reading.
              </p>
            </Panel>
            <Panel>
              <p className="text-[0.75rem] tracking-wide text-muted-subtle uppercase mb-1">Where you meet it</p>
              <h3 className="text-[1.15rem] mb-2">Deployed AI Audit</h3>
              <p className="text-muted text-[0.93rem] leading-relaxed">
                Scores a <strong className="text-text">shipped product configuration</strong> — the model plus its
                system prompt, filters and routing, as real users encounter it. Not yet published.
              </p>
            </Panel>
          </div>

          <div className="mt-6">
            <h3 className="text-[1.05rem] mb-2">The change test</h3>
            <p className="text-muted text-[0.93rem] mb-3 max-w-[900px]">
              If you can predict which score moves in each row, you have the distinction. If you can only recite the
              definitions, you probably do not.
            </p>
            <div className="overflow-x-auto border border-line rounded-[14px]">
              <table className="w-full text-[0.9rem] border-collapse min-w-[540px]">
                <thead>
                  <tr className="text-left text-muted-subtle">
                    <th className="py-2.5 px-3 border-b border-line font-medium">If this happens…</th>
                    <th className="py-2.5 px-3 border-b border-line font-medium">…which score moves?</th>
                  </tr>
                </thead>
                <tbody className="text-muted">
                  {[
                    ["The lab dissolves its safety team", "AI Labs Index only"],
                    ["A new model version answers a distress prompt worse", "Model Index only"],
                    ["The product adds a crisis-resources banner, same model", "Deployed AI Audit only"],
                    ["The lab publishes a new transparency report", "AI Labs Index only"],
                    ["The same model is rebranded under a new product name", "None — the snapshot is unchanged"],
                  ].map(([change, moves]) => (
                    <tr key={change}>
                      <td className="py-2.5 px-3 border-b border-line/60">{change}</td>
                      <td className="py-2.5 px-3 border-b border-line/60 text-text">{moves}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Container>
      </section>

      {/* Disclosed limits — headline content, not footnotes. */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="What is wrong with this instrument today"
            description="Published before any result, so it cannot be read as excuse-making after an unflattering one."
          />
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
            <Panel>
              <h3 className="text-[1.05rem] mb-2">No item has been validated</h3>
              <p className="text-muted text-[0.93rem] leading-relaxed">
                {F.reviewedItemCount} of {F.itemCount} items have completed human review. {F.scorableItemCount} are
                scorable and {F.draftItemCount} remain authored drafts. Until that changes, the bank is a proposal,
                not a validated instrument.
              </p>
            </Panel>
            <Panel>
              <h3 className="text-[1.05rem] mb-2">Coverage is uneven</h3>
              <p className="text-muted text-[0.93rem] leading-relaxed">
                Scorable items per dimension:{" "}
                {Object.entries(scorableItemsByDimension)
                  .map(([c, n]) => `${c} ${n}`)
                  .join(" · ")}
                . A dimension resting on {F.thinnestDimensions[0]?.count} items cannot carry the same weight as one
                resting on five, and no composite should imply otherwise.
              </p>
            </Panel>
            <Panel>
              <h3 className="text-[1.05rem] mb-2">The public pool is burned</h3>
              <p className="text-muted text-[0.93rem] leading-relaxed">
                All {F.itemCount} items are published with their full scoring rubrics. Any model trained since may
                have absorbed them, so a score here mixes behaviour with memorisation. No valid cross-model
                comparison can be drawn from this pool. Comparative scoring needs a separate, unpublished one.
              </p>
            </Panel>
          </div>
        </Container>
      </section>

      <section className="py-[30px]">
        <Container>
          <Callout>
            <h2 className="text-[clamp(1.4rem,3vw,1.9rem)] mb-2">What publishes, and when</h2>
            <p className="text-muted max-w-[920px] mb-3">
              The method is public now. A model result publishes only when the evaluation behind it is complete,
              reproducible from a frozen snapshot, and traceable to a recorded item bank version. Until then this
              index reports {F.evaluatedModelCount} models, and says so on every surface rather than implying
              work-in-progress.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Button href="/ai-models/methodology" variant="primary">
                How the scoring works
              </Button>
              <Button href="/methodology">The 8-dimension framework</Button>
            </div>
          </Callout>
        </Container>
      </section>

      {/* Release watch — a separate, honest layer from the Model Index result
          itself. Tracking a release is NOT evaluating it: no entry here may
          imply a pending score, and there is no SLA (DECISIONS.md D-30;
          docs/PRD_RELEASE_WATCH_AND_BYO_SCORING.md §3). Every count below is
          read from RELEASE_WATCH_FACTS, which derives it from
          releases-v1.json at build time — never hardcoded here. */}
      <section className="py-[30px]" id="release-watch">
        <Container>
          <SectionHead
            title="Release watch"
            description="A separate, honest layer on top of the Model Index: has Compassion Benchmark even looked at a given model release yet? Tracking a release is not evaluating it — no entry below implies a pending score."
          />

          {R.scanState === "never-scanned" ? (
            <Callout className="mb-5">
              <p className="text-muted">
                <strong className="text-text">No release scan has ever run.</strong> That is a different fact from
                &ldquo;nothing has shipped&rdquo; &mdash; it means Compassion Benchmark has not yet looked, not that
                the AI industry has been quiet. {R.coverageClaimNote}
              </p>
            </Callout>
          ) : (
            <Callout className="mb-5">
              <p className="text-muted">
                <strong className="text-text">
                  {R.scanState === "current"
                    ? "Scan coverage is current."
                    : R.scanState === "stale"
                      ? "Scan coverage is stale."
                      : "Scan coverage is degraded."}
                </strong>{" "}
                Last completed scan: {R.lastScanCompletedAt ?? "unknown"}. Coverage through:{" "}
                {R.coverageThrough ?? "never"}.
              </p>
            </Callout>
          )}

          <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(160px,1fr))] mb-4">
            <Stat value={String(R.completedScanCount)} label="Scans completed" />
            <Stat value={String(R.confirmedReleaseCount)} label="Confirmed releases tracked" />
            <Stat value={String(R.evaluatedReleaseCount)} label="Tracked releases evaluated" />
            <Stat value={R.coverageThrough ?? "Never"} label="Coverage through" />
          </div>

          <Panel>
            <h3 className="text-[1.05rem] mb-2">Tracking a release is not evaluating it</h3>
            <p className="text-muted text-[0.93rem] leading-relaxed mb-3">
              An entry in this tracker records that a model shipped, with a dated, independently checkable primary
              source &mdash; never that it has been tested against the task bank. A tracked release carries no
              score, no band, and no queue position with a promised date. Publishing a result requires a frozen
              snapshot, two independent human raters and adjudication (see the method); none of that is automatic,
              and there is no service-level commitment for when, or whether, a tracked release will be evaluated.
            </p>
            <p className="text-muted text-[0.93rem] leading-relaxed">
              What not to infer from this section: that no models have shipped (many have &mdash; this tracker is
              evidence about our monitoring, not about the industry); that Compassion Benchmark monitors releases
              continuously today (it does not &mdash; {R.completedScanCount} scan
              {R.completedScanCount === 1 ? " has" : "s have"} ever completed); that a developer or model absent
              from this list has been assessed and cleared; or that the counts above form a ratio of anything
              &mdash; there is no denominator here.
            </p>
          </Panel>
        </Container>
      </section>

      {/* Duty of care — fixed, non-negotiable. */}
      <section className="pb-[24px]">
        <Container>
          <p className="text-[0.86rem] text-muted-subtle border-l-2 border-line pl-4 max-w-[920px] leading-relaxed">
            <strong className="text-muted">On crisis use.</strong> This benchmark describes how models behave on
            crisis-adjacent test items, which exist to locate failures rather than to certify safety. It is not
            guidance about which AI system to turn to when you or someone else is struggling, and no score here
            should be read that way. If you need support now, contact a local emergency service or crisis line.
          </p>
        </Container>
      </section>

      <section className="py-[30px]">
        <Container>
          <FaqAccordion items={faqItems} />
        </Container>
      </section>
    </>
  );
}
