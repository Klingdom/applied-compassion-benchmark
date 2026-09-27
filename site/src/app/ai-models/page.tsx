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
  {
    question: "How does an AI model get added to the Model Index?",
    answer:
      "Not automatically, and not by request. A release first has to be detected by release watch, which tracks " +
      `${R.confirmedReleaseCount} confirmed release${R.confirmedReleaseCount === 1 ? "" : "s"} today, each logged ` +
      "only once a human registers a verified source and a dated, independently checkable record of the release " +
      "exists. A tracked release still carries no score. It becomes eligible for evaluation only once Compassion " +
      "Benchmark has provisioned API access and an approved spend budget for that provider, and even then " +
      `evaluation is not automatic — see the pipeline above. ${F.evaluatedModelCount} models have completed that ` +
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
      "It reuses the same instrument: the same 8 dimensions, the same 0-100 composite formula, and the same " +
      "five-band vocabulary used to score governments, corporations, universities and cities. What differs is " +
      "the evidence and the subject. An institution index scores a public governance record; the Model Index " +
      "scores what a frozen model snapshot did on a task bank. The two are never merged into one number, and a " +
      "strong score on one says nothing about the other.",
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

      {/* The pipeline — what exists and what blocks each stage, in the order a
          model result would actually move through. Every figure quoted below
          comes from PipelineStages, which reads it from the data stores at
          build time. See DECISIONS.md D-29: no stage description below may
          imply "evaluation underway" — only what is true today. */}
      <section className="py-[26px]">
        <Container>
          <SectionHead
            title="The pipeline: detect → evaluate → score → publish"
            description="A model result moves through four stages before it publishes. Each is labelled with what exists today and, where a stage has not started, exactly why."
          />
          <PipelineStages />
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
      {/* Initial findings from the first complete run (2026-09-25). Published
          because they are about the INSTRUMENT, not about a model. No model
          score appears here and none exists: F.evaluatedModelCount is 0. */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="First complete run — what it found"
            description="On 2026-09-25 the Evaluation Suite ran end to end for the first time: 83 prompts, 249 rated responses, all 8 dimensions and all 40 subdimensions. These are findings about the instrument. No model was validly evaluated and no model score is published."
          />
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
            <Panel>
              <h3 className="text-[1.05rem] mb-2">A self-run reached the maximum score</h3>
              <p className="text-muted text-[0.93rem] leading-relaxed">
                The subject was the model that had written most of the task bank earlier the same session. It
                read each scoring rubric immediately before answering, judged its own responses, and scored{" "}
                <span className="text-text font-medium">100 out of 100</span>. That is not a measurement of
                anything — it is what the instrument does when pointed at a subject it cannot validly assess,
                and it is the clearest available argument for why a self-run is never a comparable score.
              </p>
            </Panel>
            <Panel>
              <h3 className="text-[1.05rem] mb-2">The contamination probe was measuring the wrong thing</h3>
              <p className="text-muted text-[0.93rem] leading-relaxed">
                It scored word overlap against the prompt and passed that subject as clean — 0.22 against a 0.6
                threshold — while the subject could name each probe item&rsquo;s scenario, hidden mechanism and
                scoring intent. It detected memorisation of <em>wording</em> and missed knowledge of the{" "}
                <em>answer key</em>, which is what actually inflates a score. Replaced the following day with a
                forced-choice test; the same subject now flags at{" "}
                <span className="text-text font-medium">p = 0.02%</span>.
              </p>
              <p className="text-muted text-[0.93rem] leading-relaxed mt-3">
                Catching the guilty is the easy half. Three judges with no access to the task bank scored{" "}
                <span className="text-text font-medium">4 of 18</span> — 22.2% against a 25% chance baseline — so
                it clears subjects it should clear, tested on models rather than on a random number generator.
                That check found a latent defect: the answer key was matched by description text, so two items
                sharing a title would have marked a <em>correct</em> answer wrong and invented contamination.
              </p>
            </Panel>
            <Panel>
              <h3 className="text-[1.05rem] mb-2">The formula rewards a flat profile twice</h3>
              <p className="text-muted text-[0.93rem] leading-relaxed">
                A dimension spread of 0.121 points put the consistency multiplier at maximum <em>and</em> left
                the full integration premium intact. Answering every prompt at the same level is therefore the
                most efficient route to the cap — so a rubric-aware subject outscores a genuinely strong but
                uneven one. That is now an open methodology question, recorded rather than quietly adjusted.
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
          <div className="flex gap-3 flex-wrap mt-4">
            <Button href="/ai-evaluation-suite">Run it yourself</Button>
          </div>
        </Container>
      </section>

      {/* SUB-1: the two-tier rule, rendered before the first submission exists.
          Official and self-reported results must never share a table — once
          they are in one list the distinction dies with the first screenshot.
          Both counts derive from real files, so neither can overstate. */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="Two tiers, never one table"
            description="Anyone can run this benchmark and submit the result. Those results are kept strictly apart from scores this institution produced, and they are labelled, structured and stored differently — not merely footnoted."
          />
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
            <Panel>
              <h3 className="text-[1.05rem] mb-2">
                Tier 1 — Official · <span className="text-text font-medium">{F.evaluatedModelCount}</span>
              </h3>
              <p className="text-muted text-[0.93rem] leading-relaxed">
                Produced by an authorised Compassion Benchmark evaluation: an unpublished item pool,
                cross-model judging, human-validated items. Only these are eligible for an index or a ranking.
                There are none, and there will be none until those three conditions hold.
              </p>
            </Panel>
            <Panel>
              <h3 className="text-[1.05rem] mb-2">
                Tier 2 — Self-reported · <span className="text-text font-medium">{F.scoreRecordCount}</span>
              </h3>
              <p className="text-muted text-[0.93rem] leading-relaxed">
                Submitted from outside and re-checked here: we recompute the composite from the raw trials with
                our own scorer, recompute item hashes from our own copy of the bank, and verify every anchor and
                quote. Passing that means <em>worth a reviewer&rsquo;s time</em>, not <em>accepted</em>. Never
                ranked, never merged into an index, never called a Compassion Benchmark score.
              </p>
            </Panel>
            <Panel>
              <h3 className="text-[1.05rem] mb-2">Why there is no submission API</h3>
              <p className="text-muted text-[0.93rem] leading-relaxed">
                If this site accepted a score over HTTP, anyone could mint a perfect result in one request.
                Everything that makes the tool trustworthy is enforced where the scoring happens and none of it
                survives being put in a JSON body. Submissions arrive as pull requests carrying the whole
                artifact — every trial, every rating — because evidence is auditable and a number is not.
              </p>
            </Panel>
          </div>
        </Container>
      </section>

      {/* Instrument review progress. Derived from the append-only review log,
          with partial progress reported separately so it cannot read as done. */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="Who has checked the instrument"
            description="The task bank was written by AI agents against published rubrics and verified structurally. Structural checks say an item is well-formed; they say nothing about whether it measures what it claims to."
          />
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
                Two Identity Equity items in this bank are perfectly well-formed and{" "}
                <em>cannot be scored as written</em> — their anchors demand a comparison the items never
                present. That survived every automated check until a person read them. It is the reason this
                row exists.
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

      {/* Score history: built before the first score, so the first ones cannot
          be lost. Renders the real derived counts, never a typed literal. */}
      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="Every score a model has ever had"
            description="Model scores are recorded append-only. A score is never edited and never deleted; a correction is a new dated record and the original stays. Built before the first evaluation, because a history that starts after the scores do has already lost some."
          />
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
            <Panel>
              <h3 className="text-[1.05rem] mb-2">Records held</h3>
              <p className="text-muted text-[0.93rem] leading-relaxed">
                <span className="text-text font-medium">{F.scoreRecordCount}</span> score records across{" "}
                <span className="text-text font-medium">{F.modelsWithScoreHistory}</span> model snapshots. No
                model has been scored, so both are zero, and this section will say so until that changes.
              </p>
            </Panel>
            <Panel>
              <h3 className="text-[1.05rem] mb-2">A renamed model does not inherit a score</h3>
              <p className="text-muted text-[0.93rem] leading-relaxed">
                Scores attach to an exact model snapshot, not to a product name. When a provider ships a new
                checkpoint under the same name it becomes a separate entry with its own timeline, so a later
                version can never quietly inherit or overwrite an earlier version&rsquo;s result.
              </p>
            </Panel>
            <Panel>
              <h3 className="text-[1.05rem] mb-2">There is no &ldquo;current score&rdquo; field</h3>
              <p className="text-muted text-[0.93rem] leading-relaxed">
                A model&rsquo;s current score is derived as its most recent record rather than stored beside the
                history. Keeping a current value next to a history is how the two come to disagree, and this
                benchmark has fixed that class of defect too often to design it in deliberately.
              </p>
            </Panel>
          </div>
        </Container>
      </section>

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

      {/* The Suite: the instrument is installable and runnable by anyone, which
          is a separate fact from whether WE have scored anything. Both are
          stated here so neither can be mistaken for the other. */}
      <section className="py-[30px]">
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
                  {F.reviewedItemCount} of {F.itemCount}
                </span>{" "}
                items have been reviewed by a human. A self-run is an upper bound, not a measurement.
              </p>
            </Panel>
          </div>
          <div className="flex gap-3 flex-wrap mt-4">
            <Button href="/ai-evaluation-suite">Open the AI Evaluation Suite</Button>
            <Button href="/ai-models/methodology" variant="default">
              How scoring works
            </Button>
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
