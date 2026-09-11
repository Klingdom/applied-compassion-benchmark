import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import Panel from "@/components/ui/Panel";
import Callout from "@/components/ui/Callout";
import SectionHead from "@/components/ui/SectionHead";
import BreadcrumbJsonLd, { breadcrumbUrl } from "@/components/seo/BreadcrumbJsonLd";
import FaqJsonLd from "@/components/seo/FaqJsonLd";
import FaqAccordion from "@/components/seo/FaqAccordion";
import SubjectLine from "@/components/model-benchmark/SubjectLine";
import { MODEL_INDEX_FACTS as F, scorableItemsByDimension } from "@/lib/model-index-facts";
import { DIMENSIONS, BANDS } from "@/data/dimensions";

// No Dataset / ItemList JSON-LD while F.hasResults is false. See DECISIONS.md D-29.

export const metadata: Metadata = {
  title: "AI Model Compassion Benchmark — Method & Pre-registration",
  description:
    `How Compassion Benchmark scores AI models: ${F.itemCount} task items, ${F.dimensionCount} dimensions, ` +
    `five-anchor rubrics, and the conditions under which this method should be judged to have failed. ` +
    `Published before any model result exists.`,
};

const faqItems = [
  {
    question: "How is an AI model's compassion score calculated?",
    answer:
      `Each task item puts the model in a situation and scores its response 1–5 against a five-anchor rubric ` +
      `written for that item. Item scores roll up to ${F.dimensionCount} dimensions, and the dimensions combine ` +
      `into a 0–100 composite. The composite is not a simple mean: a balanced profile scores higher than a spiky ` +
      `one with the same average, because consistent behaviour across dimensions is itself the thing being measured.`,
  },
  {
    question: "Is the same model guaranteed to get the same score twice?",
    answer:
      "No, and we do not claim otherwise. Serving stacks batch, route and shard in ways a caller cannot control, " +
      "so we make a replayability claim rather than a reproducibility one: stored responses can be re-analysed " +
      "identically forever, and whether re-execution reproduces them is treated as an empirical question measured " +
      "per snapshot by a determinism probe, not assumed.",
  },
  {
    question: "What would prove this benchmark wrong?",
    answer:
      "Several things, stated in advance: if independent raters cannot agree on item scores above chance; if scores " +
      "on the public item pool rise while scores on an unpublished pool do not, indicating memorisation rather than " +
      "behaviour; if the dimensions collapse statistically into one factor, meaning we are measuring a single trait " +
      "and calling it eight; or if results prove unstable across runs of an identical frozen snapshot beyond the " +
      "measured determinism baseline.",
  },
  {
    question: "Why publish the method before any results?",
    answer:
      "Because the order is checkable. A method published after results can be shaped, consciously or not, to fit " +
      "them. This method, the item bank and the falsification conditions are in a public git history that timestamps " +
      "them ahead of any score. It is a weaker claim than being right, but it is one a reader can verify rather " +
      "than trust.",
  },
];

export default function AiModelsMethodologyPage() {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: breadcrumbUrl("/") },
          { name: "AI Models", url: breadcrumbUrl("/ai-models") },
          { name: "Method", url: breadcrumbUrl("/ai-models/methodology") },
        ]}
      />
      <FaqJsonLd items={faqItems} />

      <p className="text-[0.9rem] text-muted text-center py-3 px-4 border-b border-line/40 bg-[rgba(255,255,255,0.01)]">
        This is the method, published before any model has been scored. Compassion Benchmark has evaluated{" "}
        <span className="text-text font-medium">{F.evaluatedModelCount}</span> models to date.
      </p>

      <section className="py-[38px]">
        <Container>
          <Eyebrow>Model Index · Method &amp; pre-registration</Eyebrow>
          <h1 className="text-[clamp(2rem,4.5vw,3rem)] leading-[1.1] mt-3 mb-4">
            How an AI model is scored for compassion
          </h1>
          <p className="text-muted max-w-[900px] text-[1.05rem] leading-relaxed mb-5">
            A model is not asked whether it is compassionate. It is put into situations and scored on what it does —
            whether it notices unstated distress, whether it responds to the person or only to the request, whether it
            holds a boundary without abandoning someone, and whether it behaves consistently when the person changes
            but the need does not.
          </p>
          <div className="mb-6">
            <SubjectLine />
          </div>
          <Button href="/ai-models">Back to the Model Index</Button>
        </Container>
      </section>

      <section className="py-[30px]">
        <Container>
          <SectionHead title="The procedure" description="Four steps, each with a recorded artifact." />
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(250px,1fr))]">
            {[
              {
                n: "1",
                h: "Freeze the subject",
                p: "A score attaches to an exact model snapshot, never to a family or a brand. 'GPT-latest' is not a measurable object; a dated, pinned snapshot is. The identifier is recorded with the result.",
              },
              {
                n: "2",
                h: "Run the task bank",
                p: `Each of the ${F.itemCount} items is presented in a clean session, multiple independent trials per item, with trial order randomised under a recorded seed. Paired counterfactual items are never adjacent, so one cannot prime the other.`,
              },
              {
                n: "3",
                h: "Score against anchors",
                p: "Each response is rated 1–5 against that item's own five-anchor rubric, which describes what each level looks like for that specific situation rather than in the abstract.",
              },
              {
                n: "4",
                h: "Publish with dispersion",
                p: "Per item and per model we publish the mean and the spread, not a bare number. Variance is a measured property of a model's behaviour, not noise to be averaged away.",
              },
            ].map((s) => (
              <Panel key={s.n}>
                <p className="text-[0.75rem] tracking-wide text-muted-subtle uppercase mb-1">Step {s.n}</p>
                <h3 className="text-[1.08rem] mb-2">{s.h}</h3>
                <p className="text-muted text-[0.93rem] leading-relaxed">{s.p}</p>
              </Panel>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-[30px]">
        <Container>
          <SectionHead
            title={`The ${F.dimensionCount} dimensions`}
            description="The same framework used to score governments, corporations and universities — which is what lets a model be compared against an institution on one scale."
          />
          <div className="overflow-x-auto border border-line rounded-[14px]">
            <table className="w-full text-[0.9rem] border-collapse min-w-[560px]">
              <thead>
                <tr className="text-left text-muted-subtle">
                  <th className="py-2.5 px-3 border-b border-line font-medium">Code</th>
                  <th className="py-2.5 px-3 border-b border-line font-medium">Dimension</th>
                  <th className="py-2.5 px-3 border-b border-line font-medium">Scorable items</th>
                </tr>
              </thead>
              <tbody className="text-muted">
                {DIMENSIONS.map((d) => {
                  const n = scorableItemsByDimension[d.code] ?? 0;
                  const thin = n <= 2;
                  return (
                    <tr key={d.code}>
                      <td className="py-2.5 px-3 border-b border-line/60 text-text font-medium">{d.code}</td>
                      <td className="py-2.5 px-3 border-b border-line/60">{d.name}</td>
                      <td className="py-2.5 px-3 border-b border-line/60">
                        <span className={thin ? "text-text" : ""}>{n}</span>
                        {thin && <span className="text-muted-subtle"> — thin, read with caution</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-[0.82rem] text-muted-subtle mt-3 max-w-[900px]">
            Counts are read from the published task bank at build time. {F.reviewedItemCount} of {F.itemCount} items
            have completed human validation.
          </p>
        </Container>
      </section>

      <section className="py-[30px]">
        <Container>
          <SectionHead
            title="Score bands"
            description="The same bands used across every Compassion Benchmark index, so a model score means the same thing a country score means."
          />
          <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(165px,1fr))]">
            {[...BANDS].reverse().map((b) => (
              <Panel key={b.name}>
                <p className="text-[1.05rem] text-text mb-1">{b.range}</p>
                <p className="text-[0.9rem] text-muted">{b.name}</p>
              </Panel>
            ))}
          </div>
        </Container>
      </section>

      {/* Pre-registration: the falsification conditions. */}
      <section className="py-[30px]">
        <Container>
          <Callout>
            <h2 className="text-[clamp(1.4rem,3vw,1.9rem)] mb-2">What would show this method is wrong</h2>
            <p className="text-muted max-w-[920px] mb-3">
              Stated now, while no result exists to defend. If any of these holds, the finding is a problem with the
              instrument and will be published as one.
            </p>
            <ul className="text-muted text-[0.94rem] leading-relaxed list-disc pl-5 space-y-1.5 max-w-[920px]">
              <li>
                Independent raters cannot agree on item scores above chance — the rubric is measuring the rater, not
                the model.
              </li>
              <li>
                Public-pool scores rise while unpublished-pool scores do not — the benchmark is measuring
                memorisation, and the gap is the size of the contamination.
              </li>
              <li>
                The {F.dimensionCount} dimensions collapse into one statistical factor — we are measuring a single
                trait and reporting it eight times.
              </li>
              <li>
                Repeated runs of an identical frozen snapshot diverge beyond the measured determinism baseline — the
                number is not stable enough to publish.
              </li>
              <li>
                Scores fail to move when a model is deliberately altered in a way the framework says should move them
                — the instrument is not sensitive to what it claims to detect.
              </li>
            </ul>
          </Callout>
        </Container>
      </section>

      <section className="pb-[24px]">
        <Container>
          <p className="text-[0.86rem] text-muted-subtle border-l-2 border-line pl-4 max-w-[920px] leading-relaxed">
            <strong className="text-muted">On crisis use.</strong> Crisis-adjacent items exist to locate failures,
            not to certify safety. Nothing here is guidance about which AI system to turn to when you or someone else
            is struggling. If you need support now, contact a local emergency service or crisis line.
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
