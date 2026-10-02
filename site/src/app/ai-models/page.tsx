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
import PipelineStages from "@/components/model-benchmark/PipelineStages";
import ModelGlossary from "@/components/model-benchmark/ModelGlossary";
import PilotSummaryCard from "@/components/model-benchmark/pilot/PilotSummaryCard";
import NewsletterSignup from "@/components/ui/NewsletterSignup";
import { latestRenderableReport, renderableEntries } from "@/lib/model-report-gate";
import { pilotPageFacts, numberWord } from "@/lib/model-report-facts";
import { MODEL_INDEX_FACTS as F, scorableItemsByDimension } from "@/lib/model-index-facts";
import { RELEASE_WATCH_FACTS as R } from "@/lib/release-watch-facts";
import { SCORED_ENTITY_COUNT_FORMATTED } from "@/data/entityCount";
import { BANDS } from "@/data/dimensions";

// No Dataset or ItemList JSON-LD is emitted while F.hasResults is false.
// An empty Dataset advertising 0 entities is a machine-readable non-thing.
// See DECISIONS.md D-29.

// Reading order (docs/AI_MODELS_PAGE_REVIEW_2026-10-01.md, A1/A4/A10/A11):
// banner, hero, key facts, jump list, three objects, pipeline, release watch,
// limits (+ who has checked), runs, records, run it yourself, duty of care, FAQ.
// Item-status words (Draft / Scorable / Validated) are defined once, in
// ModelGlossary, and used only in those senses. "Validated" is always
// F.itemsWithTwoReviews (derived from the review log), never reviewedItemCount.

const noModelScored = F.evaluatedModelCount === 0;

// Unofficial pilot (D-29a). In the default build the wave's decision is "proposed", nothing
// renders, and NO pilot wording appears anywhere on this page. `pilot` is non-null only when
// the gate renders a wave (ratified, or the local CB_PREVIEW_PILOT_REPORTS=1 founder preview).
// Pilot counts are separate from F.evaluatedModelCount and are never summed with it.
const pilotRendered = latestRenderableReport();
const pilot = pilotRendered ? pilotPageFacts(pilotRendered.wave, pilotRendered.report) : null;
const pilotReportCount = renderableEntries().length;
const pilotPreview = pilotRendered?.mode === "preview";

export const metadata: Metadata = {
  title: noModelScored
    ? "AI Model Compassion Benchmark — Method Published, No Official Model Scores Yet"
    : "AI Model Compassion Benchmark — Method and Results",
  description: (
    `How Compassion Benchmark evaluates AI models for compassion: ${F.itemCount} published task items across ` +
    `${F.dimensionCount} behavioural dimensions. The method is published in advance. ` +
    `${noModelScored ? "No model has an official score." : ""}` +
    `${pilot ? " One unofficial pilot is reported separately; it is not a score." : ""}`
  ).trim(),
};

const thin = F.thinnestDimensions.map((d) => `${d.code} (${d.count})`).join(" and ");

const faqItems = [
  {
    question: "Which AI model is the most compassionate?",
    answer:
      `${noModelScored ? "Compassion Benchmark publishes no ranking of AI models by compassion, so it does not name one. No model has an official score." : ""}` +
      `The Compassion Benchmark Model Index has officially evaluated ${F.evaluatedModelCount} models to date. ` +
      `The method, the ${F.itemCount}-item task bank and the scoring rules are published in advance of any official result, ` +
      `so that the instrument can be examined before it produces numbers.` +
      `${noModelScored ? " Any ranking of AI models by compassion attributed to Compassion Benchmark today would be fabricated." : ""}` +
      `${pilot ? pilot.faqQ1Addendum : ""}`,
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
      `${F.itemsWithTwoReviews} of them are validated (two independent human reviews). ${F.scorableItemCount} are scorable ` +
      `(the remaining ${F.draftItemCount} are authored drafts awaiting review). Per-dimension coverage is uneven — ` +
      `${thin} — so those dimensions rest on very few items and should not be read as precisely as the others.`,
  },
  ...(pilot ? pilot.faq : []),
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
  {
    question: "How does an AI model get added to the Model Index?",
    answer:
      "Not automatically, and not by request. A release first has to be detected by release watch, which tracks " +
      `${R.confirmedReleaseCount} confirmed release${R.confirmedReleaseCount === 1 ? "" : "s"} today, each logged ` +
      "only once a human registers a verified source and a dated, independently checkable record of the release " +
      "exists. A tracked release still carries no score. It becomes eligible for evaluation only once Compassion " +
      "Benchmark has provisioned API access and an approved spend budget for that provider, and even then " +
      `evaluation is a separate, manual step with its own requirements. ${F.evaluatedModelCount} models have completed that ` +
      "path so far.",
  },
  {
    question: "What happens when a new model ships?",
    answer:
      "Nothing on this page changes automatically. If release watch has run a scan since the ship date, and a " +
      "dated, independently checkable primary source exists for it, the release is logged in the tracker as a " +
      "confirmed release with no score. Evaluation — calling the model, scoring its responses, publishing a " +
      "result — is a separate, later step that is not automatic and carries no service-level promise of when, " +
      "or whether, it happens.",
  },
  {
    question: "How does the Model Index relate to Compassion Benchmark's other indexes?",
    answer:
      `It reuses the same instrument: the same ${F.dimensionCount} dimensions, the same 0-100 composite formula, and the same ` +
      `${BANDS.length}-band vocabulary used to score governments, corporations, universities and cities. What differs is ` +
      "the evidence and the subject. An institution index scores a public governance record; the Model Index " +
      "scores what a frozen model snapshot did on a task bank. The two are never merged into one number, and a " +
      "strong score on one says nothing about the other.",
  },
];

/** Jump-list targets; each must match an `id` on a section below. */
const JUMP_LINKS: { href: string; label: string }[] = [
  { href: "#three-objects", label: "Lab is not model" },
  ...(pilot ? [{ href: "#pilot-results", label: "Pilot results (unofficial)" }] : []),
  { href: "#pipeline", label: "The pipeline" },
  { href: "#release-watch", label: "Release watch" },
  { href: "#limits", label: "What is wrong with the instrument" },
  { href: "#runs", label: "Run log" },
  { href: "#records", label: "How results are recorded" },
  { href: "#run-it-yourself", label: "Run it yourself" },
  { href: "#faq", label: "FAQ" },
];

/** Headline for the first limits panel, derived from the validated count. */
const validationHeading =
  F.itemsWithTwoReviews === 0
    ? "No item has been validated"
    : F.itemsWithTwoReviews < F.itemCount
      ? "Not every item has been validated"
      : "Every item has been validated";

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

      {/* Answer-first lead — the one statement of "zero", made once. Rendered
          only while no model has an official score; the wording that replaces
          it once one does is a separate decision (D-29 amendment). */}
      {noModelScored && (
        <p className="text-[0.9rem] text-muted text-center py-3 px-4 border-b border-line/40 bg-[rgba(255,255,255,0.01)]">
          <span className="text-text font-medium">The method is published. No model has an official score.</span>{" "}
          {F.itemCount} test items, published before any result.
          {pilot && <> {pilot.bannerClause}</>}
        </p>
      )}

      <section className="py-[38px]">
        <Container>
          <Eyebrow>AI Model Compassion Benchmark · Pre-registration</Eyebrow>
          <h1 className="text-[clamp(2rem,4.5vw,3.1rem)] leading-[1.1] mt-3 mb-4">
            How compassionate are AI models?
          </h1>
          <p className="text-muted max-w-[900px] text-[1.05rem] leading-relaxed mb-5">
            {noModelScored && "There is no compassion ranking of AI models from Compassion Benchmark, and no model has an official score. "}
            {pilot && `${pilot.heroSentence} `}
            What exists is the instrument: {F.itemCount} published test items across {F.dimensionCount} dimensions, a
            published scoring method, and published conditions under which the method should be judged to have
            failed. This page shows what has to happen before a score can publish, and how far each step has got.
          </p>
          <div className="mb-6">
            <SubjectLine />
          </div>
          <div className="flex gap-3 flex-wrap">
            {pilot ? (
              <>
                <Button
                  href={pilot.href}
                  variant="primary"
                  trackAs="report_open"
                  trackData={{ report_id: pilot.runId, surface: "ai-models", position: "hero" }}
                >
                  Read the pilot report (about {pilot.readingMinutes} min)
                </Button>
                <Button href="/ai-models/methodology">Read the method</Button>
              </>
            ) : (
              <Button href="/ai-models/methodology" variant="primary">
                Read the method
              </Button>
            )}
          </div>
        </Container>
      </section>

      {/* Key facts — each row is a complete, quotable claim with its own
          definition. Every value is a facts-module field, never typed. */}
      <section className="py-[22px]" id="key-facts">
        <Container>
          <h2 className="text-[clamp(1.3rem,2.5vw,1.7rem)] tracking-tight mb-3">Key facts</h2>
          <dl className="border border-line rounded-[14px] max-w-[900px] text-[0.93rem] leading-relaxed">
            {[
              {
                term: "Models with an official score",
                value: String(F.evaluatedModelCount),
                def: "A score here means an official Compassion Benchmark evaluation of a pinned model snapshot.",
              },
              ...(pilot
                ? [
                    {
                      term: "Unofficial pilot reports",
                      value: String(pilotReportCount),
                      def: "Not scores.",
                      link: { href: "#pilot-results", label: "See the pilot results." },
                    },
                  ]
                : []),
              {
                term: "Published test items",
                value: String(F.itemCount),
                def: `Each one is a situation plus a five-level rubric.${
                  F.allItemsPublic ? " All are public, so none can be used for blinded scoring." : ""
                }`,
              },
              {
                term: "Items with two independent human reviews",
                value: `${F.itemsWithTwoReviews} of ${F.itemCount}`,
                def: "An item needs two before it counts as validated.",
              },
              {
                term: "Dimensions / subdimensions covered",
                value: `${F.dimensionCount} / ${F.subdimensionsCovered} of ${F.subdimensionCount}`,
                def: "",
              },
              {
                term: "Release scans completed",
                value: String(R.completedScanCount),
                def: "",
                link: { href: "#release-watch", label: "See release watch." },
              },
            ].map((row) => (
              <div key={row.term} className="px-4 py-3 border-b border-line/60 last:border-b-0">
                <dt className="text-muted-subtle text-[0.8rem] tracking-wide uppercase mb-0.5">{row.term}</dt>
                <dd className="text-muted">
                  <span className="text-text font-medium">{row.value}</span>
                  {row.def ? `. ${row.def}` : "."}
                  {row.link && (
                    <>
                      {" "}
                      <a href={row.link.href} className="underline underline-offset-2">
                        {row.link.label}
                      </a>
                    </>
                  )}
                </dd>
              </div>
            ))}
          </dl>

          <p className="text-[0.9rem] text-muted mt-4 max-w-[900px] leading-relaxed">
            <strong className="text-text">Accurate to say:</strong> &ldquo;Compassion Benchmark has published a method
            for scoring AI models for compassion but has given {F.evaluatedModelCount} models an official score.&rdquo;
            &middot; &ldquo;Its AI Labs Index scores organisations, not models.&rdquo;
            {pilot && (
              <>
                {" "}
                &middot; &ldquo;Its only model results come from one unofficial pilot, which is not a score and carries no
                ranking.&rdquo;
              </>
            )}
            {noModelScored && (
              <>
                {" "}
                <strong className="text-text">Not accurate:</strong> any ranking of AI models attributed to
                Compassion Benchmark; any official model score or ranking from this site; using an AI lab&rsquo;s index
                score as a score for that lab&rsquo;s models.
                {pilot && " Reading the unofficial pilot as a score or a ranking of the models in it."}
              </>
            )}
          </p>
          <p className="text-[0.86rem] text-muted-subtle mt-3 max-w-[900px] leading-relaxed">
            Not guidance on which AI to talk to in a crisis. If you need support now, contact a local emergency
            service or crisis line.
          </p>
        </Container>
      </section>

      <section className="py-[14px]">
        <Container>
          <nav aria-label="On this page" className="mb-4">
            <p className="text-[0.75rem] tracking-wide text-muted-subtle uppercase mb-2">On this page</p>
            <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-[0.9rem]">
              {JUMP_LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="text-muted underline underline-offset-2">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <ModelGlossary />
        </Container>
      </section>

      {/* The Three Objects device — the highest-value content on this page. */}
      <section className="py-[30px]" id="three-objects">
        <Container>
          <SectionHead
            title="Three different things, three different scores"
            description="Readers who merge these reach confident, wrong conclusions — the lab's score is not its model's score."
          />
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(270px,1fr))]">
            <Panel>
              <p className="text-[0.75rem] tracking-wide text-muted-subtle uppercase mb-1">Who built it</p>
              <h3 className="text-[1.15rem] mb-2">AI Labs Index</h3>
              <p className="text-muted text-[0.93rem] leading-relaxed">
                Scores an <strong className="text-text">organisation</strong> on its public governance record — safety
                commitments, accountability, deployment boundaries. Evidence is the public record, not model output.
              </p>
              <p className="text-[0.9rem] mt-3">
                <a href="/ai-labs" className="text-muted underline underline-offset-2">
                  Scoring organisations, not models? AI Labs Index &rarr;
                </a>
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

      {pilot && <PilotSummaryCard facts={pilot} preview={pilotPreview} />}

      {/* The pipeline — what exists and what blocks each stage, in the order a
          model result would actually move through. Every figure quoted below
          comes from PipelineStages, which reads it from the data stores at
          build time. See DECISIONS.md D-29: no stage description below may
          imply "evaluation underway" — only what is true today. */}
      <section className="py-[26px]" id="pipeline">
        <Container>
          <SectionHead
            title="The pipeline: detect → evaluate → score → publish"
            description="A model result moves through four stages before it publishes. Each is labelled with what exists today and, where a stage has not started, exactly why."
          />
          <PipelineStages />
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
            <Stat value={String(R.evaluatedReleaseCount)} label="Tracked releases officially evaluated" />
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

      {/* Disclosed limits — headline content, not footnotes. "Who has checked
          the instrument" lives here because it answers the same question:
          should I trust the instrument? Review progress is derived from the
          append-only review log, with partial progress reported separately so
          it cannot read as done. */}
      <section className="py-[30px]" id="limits">
        <Container>
          <SectionHead
            title="What is wrong with this instrument today"
            description="Published before any result, so it cannot be read as excuse-making after an unflattering one."
          />
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
            <Panel>
              <h3 className="text-[1.05rem] mb-2">{validationHeading}</h3>
              <p className="text-muted text-[0.93rem] leading-relaxed">
                {F.itemsWithTwoReviews} of {F.itemCount} items are validated (two human reviews).{" "}
                {F.scorableItemCount} are scorable and {F.draftItemCount} remain authored drafts.
                {F.itemsWithTwoReviews < F.itemCount &&
                  " Until that changes, the bank is a proposal, not a validated instrument."}
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

          <h3 className="text-[1.3rem] tracking-tight mt-8 mb-2">Who has checked the instrument</h3>
          <p className="text-muted max-w-[900px] mb-4">
            The task bank was written by AI agents against published rubrics and verified structurally. Structural
            checks say an item is well-formed; they say nothing about whether it measures what it claims to.
          </p>
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
            <Panel>
              <h3 className="text-[1.05rem] mb-2">Human review</h3>
              <p className="text-muted text-[0.93rem] leading-relaxed">
                <span className="text-text font-medium">{F.itemsWithTwoReviews}</span> of{" "}
                <span className="text-text font-medium">{F.itemCount}</span> items have the two independent
                reviews that validation requires;{" "}
                <span className="text-text font-medium">{F.itemsWithAnyReview}</span> have at least one. One
                reviewer never validates an item, because a single judgement is the thing that cannot be
                checked.
              </p>
            </Panel>
            <Panel>
              <h3 className="text-[1.05rem] mb-2">Why structure is not enough</h3>
              <p className="text-muted text-[0.93rem] leading-relaxed">
                Two Identity Equity items are perfectly well-formed and each carry one anchor that{" "}
                <em>cannot be applied</em> — their second level asks whether the answer is worse than one the
                model was never asked for. Four of five levels are fine, so the items score everywhere except
                that boundary. Structural checks passed them; reading caught it.
              </p>
              <p className="text-muted text-[0.93rem] leading-relaxed mt-3">
                For four days this row named the wrong item and called it wholly unscorable. Both were wrong,
                and the item we accused had already been scored three times. The affected set is now derived
                from the anchors themselves, so this text cannot drift from the bank again — which is the more
                honest argument for the row than the one it replaced.
              </p>
            </Panel>
            <Panel>
              <h3 className="text-[1.05rem] mb-2">Disagreement is kept</h3>
              <p className="text-muted text-[0.93rem] leading-relaxed">
                Where two reviewers reach different verdicts, both are recorded and the item is marked
                disputed rather than averaged to a conclusion. An item two careful people read differently is
                a fact about the item, and it is the clearest evidence an anchor is ambiguous.
              </p>
            </Panel>
          </div>
        </Container>
      </section>

      {/* Run log. The 2026-09-25 self-run is ONE row, verdict first (template F7). It is published
          because its findings are about the INSTRUMENT, not about a model. No model score appears here;
          the official-score count is F.evaluatedModelCount. The self-run's own headline figure no longer
          appears on this page (K1, default: removed): a maximum on a compromised run is a fact about the
          instrument, and quoting it invites exactly the misreading the row exists to prevent.

          DATED-RUN FACTS: the figures inside the disclosure (83 prompts, 249 responses, 0.22 / 0.6,
          6 of 6 and 1 in 4, 4 of 18, 22.2% / 25%, 4.63) describe the 2026-09-25 self-run and the
          2026-09-26 probe fix. They are quotations of a dated artifact, not live state, and are
          deliberately not derived. Source: research/model-assessments/claude-opus-5-2026-09-25.md (and
          its addendum). The catalogue size below IS live state and is derived. */}
      <section className="py-[30px]" id="runs">
        <Container>
          <SectionHead
            title="Run log"
            description="Each run, with its verdict first. These are findings about the instrument. No model has an official score."
          />
          <div className="overflow-x-auto border border-line rounded-[14px] mb-5">
            <table className="w-full text-[0.9rem] border-collapse min-w-[560px]">
              <caption className="sr-only">Run log</caption>
              <thead>
                <tr className="text-left text-muted-subtle">
                  <th scope="col" className="py-2.5 px-3 border-b border-line font-medium">Date</th>
                  <th scope="col" className="py-2.5 px-3 border-b border-line font-medium">Run</th>
                  <th scope="col" className="py-2.5 px-3 border-b border-line font-medium">Verdict</th>
                </tr>
              </thead>
              <tbody className="text-muted">
                {pilot && (
                  <tr>
                    <td className="py-2.5 px-3 border-b border-line/60 align-top whitespace-nowrap">{pilotRendered?.wave.report_date}</td>
                    <td className="py-2.5 px-3 border-b border-line/60 align-top">Unofficial pilot</td>
                    <td className="py-2.5 px-3 border-b border-line/60 align-top">
                      <span className="text-text font-medium">Not a score.</span> It tested the test, not the models; see{" "}
                      <a href="#pilot-results" className="underline underline-offset-2">Pilot results (unofficial)</a>.
                    </td>
                  </tr>
                )}
                <tr>
                  <td className="py-2.5 px-3 align-top whitespace-nowrap">2026-09-25</td>
                  <td className="py-2.5 px-3 align-top">Self-run</td>
                  <td className="py-2.5 px-3 align-top">
                    <span className="text-text font-medium">Not a measurement.</span> The subject had read the rubric and judged its own
                    answers, so the result describes the instrument, not a model. It is why a self-run never counts as a score.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <details className="border border-line rounded-[14px] px-4 py-3 max-w-[900px]">
            <summary className="cursor-pointer text-text font-medium">What the 2026-09-25 self-run found about the instrument</summary>
            <div className="mt-4 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
              <Panel>
                <p className="text-muted text-[0.93rem] leading-relaxed">
                  On 2026-09-25 the Evaluation Suite ran end to end for the first time: 83 prompts, 249 rated responses, all {F.dimensionCount}{" "}
                  dimensions and all {F.subdimensionCount} subdimensions. The subject was the model that had written most of the task bank
                  earlier the same session, which read each rubric before answering and then judged its own answers. Under those
                  conditions a maximum result was the predicted outcome, and it arrived. That describes the instrument&rsquo;s behaviour
                  when pointed at a subject it cannot assess, not the model.
                </p>
              </Panel>
              <Panel>
                <h3 className="text-[1.05rem] mb-2">The contamination probe was measuring the wrong thing</h3>
                <p className="text-muted text-[0.93rem] leading-relaxed">
                  It scored word overlap against the prompt and passed that subject as clean — 0.22 against a 0.6
                  threshold — while the subject could name each probe item&rsquo;s scenario, hidden mechanism and
                  scoring intent. It detected memorisation of <em>wording</em> and missed knowledge of the{" "}
                  <em>answer key</em>, which is what actually inflates a score. Replaced the following day with a
                  forced-choice test; the same subject is now identified: it picked the right scenario for 6 of 6
                  items, where a model that had never seen the bank would be right about 1 time in 4.
                </p>
                <p className="text-muted text-[0.93rem] leading-relaxed mt-3">
                  Catching the guilty is the easy half. Three models that had never seen the task bank identified{" "}
                  <span className="text-text font-medium">4 of 18</span> scenarios — 22.2% against a 25% chance baseline — so
                  it clears subjects it should clear, tested on models rather than on a random number generator.
                  That check found a latent defect: the answer key was matched by description text, so two items
                  sharing a title would have marked a <em>correct</em> answer wrong and invented contamination.
                </p>
              </Panel>
              <Panel>
                <h3 className="text-[1.05rem] mb-2">We thought the formula rewarded flatness. It does not.</h3>
                <p className="text-muted text-[0.93rem] leading-relaxed">
                  For a year this row said the composite rewards an even profile twice over, and that a
                  rubric-aware model could therefore beat a genuinely stronger but uneven one. We checked it
                  properly. Two profiles with the same average — one perfectly flat, one split 5/4 — score{" "}
                  <em>identically</em>. Spread does not enter the composite at all once every dimension clears 4.0.
                  Across all <span className="text-text font-medium">{SCORED_ENTITY_COUNT_FORMATTED}</span> scored
                  entities the consistency factor has never once left its maximum.
                </p>
                <p className="text-muted text-[0.93rem] leading-relaxed mt-3">
                  What the formula actually rewards is being above 4.0 on <em>every</em> dimension, which is a
                  claim about level rather than evenness — and is what the methodology page always said. The
                  self-run reached the maximum because it averaged 4.63 with no weak dimension, not because it was flat.
                  Three narrower questions survive and are recorded; the one that blocked publishing a model score
                  does not.
                </p>
              </Panel>
              <Panel>
                <h3 className="text-[1.05rem] mb-2">Where even a compromised run dipped</h3>
                <p className="text-muted text-[0.93rem] leading-relaxed">
                  In a contaminated self-assessment the high scores carry no information; the low points do.
                  Awareness was the weakest dimension, and four of the eight weakest items were Awareness items —
                  every one of them from the portion of the bank the subject had <em>not</em> authored. Weak
                  evidence inside an invalid run, but it points the same way the contamination analysis does.
                </p>
              </Panel>
            </div>
          </details>
        </Container>
      </section>

      {/* Duty of care — fixed, non-negotiable. The one-line version also sits in the key facts near the
          top. It follows the run log and precedes the records section, so no call-to-action button
          sits beside it (template F10, H). */}
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

      {/* SUB-1 + score history, condensed: one sentence per rule, reasoning in
          disclosures. The two-tier rule is rendered before the first
          submission exists — once official and self-reported results share a
          table the distinction dies with the first screenshot. Every count
          derives from a real file; Tier 2 is NOT scoreRecordCount (that is
          score-history-v1.json, the Tier 1 store). */}
      <section className="py-[30px]" id="records">
        <Container>
          <SectionHead
            title="How results will be recorded"
            description="Anyone can run this benchmark and submit the result. Those results are kept strictly apart from scores this institution produced, and the record is built before the first evaluation, because a history that starts after the scores do has already lost some."
          />
          <div className="grid gap-3 max-w-[900px]">
            <details className="border border-line rounded-[14px] px-4 py-3">
              <summary className="cursor-pointer text-text font-medium">
                Official and self-submitted results are never shown in one table.
              </summary>
              <div className="mt-3 text-muted text-[0.93rem] leading-relaxed">
                <p>
                  Self-submitted results are labelled, structured and stored differently from official ones — not
                  merely footnoted.
                </p>
                <h3 className="text-[1.05rem] text-text mt-3 mb-1">
                  Tier 1 — Official · <span className="text-text font-medium">{F.evaluatedModelCount}</span>
                </h3>
                <p>
                  Produced by an authorised Compassion Benchmark evaluation: an unpublished item pool, cross-model
                  judging, human-validated items. Only these are eligible for an index or a ranking.
                  {noModelScored && " There are none, and there will be none until those three conditions hold."}
                </p>
                <h3 className="text-[1.05rem] text-text mt-3 mb-1">
                  Tier 2 — Self-reported
                  {F.selfReportedSubmissionCount !== null && (
                    <>
                      {" "}
                      · <span className="text-text font-medium">{F.selfReportedSubmissionCount}</span>
                    </>
                  )}
                </h3>
                <p>
                  Submitted from outside and re-checked here: we recompute the composite from the raw trials with
                  our own scorer, recompute item hashes from our own copy of the bank, and verify every anchor and
                  quote. Passing that means <em>worth a reviewer&rsquo;s time</em>, not <em>accepted</em>. Never
                  ranked, never merged into an index, never called a Compassion Benchmark score.
                </p>
              </div>
            </details>
            <details className="border border-line rounded-[14px] px-4 py-3">
              <summary className="cursor-pointer text-text font-medium">
                Scores are append-only: never edited, never deleted; corrections are new dated records.
              </summary>
              <div className="mt-3 text-muted text-[0.93rem] leading-relaxed">
                <p>
                  A model&rsquo;s current score is derived as its most recent record rather than stored beside the
                  history. Keeping a current value next to a history is how the two come to disagree, and this
                  benchmark has fixed that class of defect too often to design it in deliberately. There is no
                  &ldquo;current score&rdquo; field.
                </p>
              </div>
            </details>
            <details className="border border-line rounded-[14px] px-4 py-3">
              <summary className="cursor-pointer text-text font-medium">
                A score belongs to an exact snapshot, so a renamed or updated model starts a new history.
              </summary>
              <div className="mt-3 text-muted text-[0.93rem] leading-relaxed">
                <p>
                  Scores attach to an exact model snapshot, not to a product name. When a provider ships a new
                  checkpoint under the same name it becomes a separate entry with its own timeline, so a later
                  version can never quietly inherit or overwrite an earlier version&rsquo;s result.
                </p>
              </div>
            </details>
            <details className="border border-line rounded-[14px] px-4 py-3">
              <summary className="cursor-pointer text-text font-medium">
                There is no submission API — results arrive as full evidence files, not numbers.
              </summary>
              <div className="mt-3 text-muted text-[0.93rem] leading-relaxed">
                <p>
                  If this site accepted a score over HTTP, anyone could mint a perfect result in one request.
                  Everything that makes the tool trustworthy is enforced where the scoring happens and none of it
                  survives being put in a JSON body. Submissions arrive as pull requests carrying the whole
                  artifact — every trial, every rating — because evidence is auditable and a number is not.
                </p>
              </div>
            </details>
          </div>
          <p className="text-muted text-[0.93rem] leading-relaxed mt-4 max-w-[900px]">
            Records held:{" "}
            <span className="text-text font-medium">{F.scoreRecordCount}</span> score records across{" "}
            <span className="text-text font-medium">{F.modelsWithScoreHistory}</span> model snapshots.
            {F.scoreRecordCount === 0 &&
              F.modelsWithScoreHistory === 0 &&
              " No model has an official score, so both are zero, and this section will say so until that changes."}
            {F.selfReportedSubmissionCount !== null && (
              <>
                {" "}
                Self-submitted results held:{" "}
                <span className="text-text font-medium">{F.selfReportedSubmissionCount}</span>.
              </>
            )}
          </p>
        </Container>
      </section>

      {/* The Suite: the instrument is installable and runnable by anyone, which
          is a separate fact from whether WE have scored anything. Both are
          stated here so neither can be mistaken for the other. */}
      <section className="py-[30px]" id="run-it-yourself">
        <Container>
          <SectionHead
            title="Run it yourself — the AI Evaluation Suite"
            description="The same task bank, the same anchors and the same scoring arithmetic this benchmark applies to institutions, packaged as a local tool. No API key, no network call, no data sent to us."
          />
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
            <Panel>
              <h3 className="text-[1.05rem] mb-2">What it measures</h3>
              <p className="text-muted text-[0.93rem] leading-relaxed">
                All {F.dimensionCount} dimensions and all {F.subdimensionCount} subdimensions, from{" "}
                {F.itemCount} published items. A complete run rates every subdimension and reports a 0–100
                composite computed by the <em>same</em> function that scores countries and companies here — so
                the arithmetic is identical even though the subject and the instrument are not.
              </p>
            </Panel>
            <Panel>
              <h3 className="text-[1.05rem] mb-2">What it refuses to do</h3>
              <p className="text-muted text-[0.93rem] leading-relaxed">
                A result is marked unofficial in a field that cannot be set otherwise. Every rating must cite an
                exact published anchor and a verbatim quote from the response being judged. Scoring is blocked
                until a contamination probe has run. A per-subdimension number that is not backed by rated items
                fails validation rather than printing.
              </p>
            </Panel>
            <Panel>
              <h3 className="text-[1.05rem] mb-2">What it cannot tell you</h3>
              <p className="text-muted text-[0.93rem] leading-relaxed">
                Nothing about how one model compares to another. Every item is published with its full answer
                key, so any model trained since may have memorised it, and{" "}
                <span className="text-text font-medium">
                  {F.itemsWithTwoReviews} of {F.itemCount}
                </span>{" "}
                items are validated (two human reviews). A self-run is an upper bound, not a measurement.
              </p>
            </Panel>
          </div>
          <p className="text-muted text-[0.93rem] leading-relaxed mt-4 max-w-[900px]">
            <strong className="text-text">Lab, researcher or reader?</strong> If you think a finding on this site is wrong, tell us and
            show us why. A correction is published as a new dated record and the original stays visible. You can also propose a
            model for a future wave. A proposal does not guarantee evaluation, and there is never a fee.{" "}
            <a
              href="mailto:info@compassionbenchmark.com?subject=Model%20benchmark%20reply%20or%20proposal"
              className="underline underline-offset-2"
              data-umami-event="report_reply_click"
              data-umami-event-surface="ai-models"
            >
              Send a reply or proposal
            </a>
            .
          </p>
          <div className="flex gap-3 flex-wrap mt-4">
            <Button href="/ai-evaluation-suite">Open the AI Evaluation Suite</Button>
            <Button href="/ai-models/methodology" variant="default">
              Read the method
            </Button>
            <Button href="/methodology" variant="default">
              The {F.dimensionCount}-dimension framework
            </Button>
          </div>
        </Container>
      </section>

      <section className="py-[30px]" id="faq">
        <Container>
          <FaqAccordion items={faqItems} />
        </Container>
      </section>

      {pilot && (
        <section className="pb-[40px]">
          <Container>
            <div className="max-w-[900px]">
              <NewsletterSignup
                variant="card"
                source="ai-models-end"
                heading="Get the next assessment wave when it publishes"
                body={`The pilot covers one developer's ${numberWord(pilotRendered?.wave.derived.subject_count ?? 0)} models and no result in it is official. One email on Fridays, with the highlights where new research is announced. It is free, and you can unsubscribe in one click.`}
                buttonLabel="Email me the next wave"
                finePrint="No spam. We never share your email. We never sell it to the companies we assess."
                successTitle="Subscribed."
                successBody="You'll get the Friday highlights, where new research is announced."
              />
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
