import type { Metadata } from "next";
import { pageMeta } from "@/lib/page-meta";
import Link from "next/link";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Callout from "@/components/ui/Callout";
import Panel from "@/components/ui/Panel";
import BreadcrumbJsonLd, { breadcrumbUrl } from "@/components/seo/BreadcrumbJsonLd";
import { MODEL_CYCLE_FACTS as C, countWord } from "@/lib/model-cycle-facts";

// "How we analyse AI models every week" (founder-approved copy: research/ai-model-cycle/weekly-cycle-public.md, C-FD-3).
// Every value comes from src/lib/model-cycle-facts.ts; nothing is typed here. No model is named, no figure is given for
// any model, and there is no Article/Dataset/ItemList/Rating/Review JSON-LD (BreadcrumbList only, like /ai-models/watch).
// Built-tree gate: cycleProblems in scripts/lib/model-watch-gates.mjs.

export const metadata: Metadata = pageMeta({
  title: "How we analyse AI models every week",
  description:
    "What runs today (a sourced weekly list of AI model releases and disclosures) and what is planned and conditional " +
    "(a weekly test run of open-weight models). No official model ranking, band or score is published.",
}, "/ai-models/cycle");

const H2 = "text-[clamp(1.35rem,2.6vw,1.85rem)] tracking-tight mb-4";
const LINK = "underline underline-offset-2";

/** "a, b and c" */
function joinList(xs: string[]): string {
  return xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`;
}

const LOOP: { link: string; output: string; input: string; status: string }[] = [
  {
    link: "Releases to test queue",
    output: "New open-weight models found by Model Watch",
    input: "They can join the test queue if they fit our hardware. They do not move up the queue. The order follows a written rule",
    status: "Done by hand today. Automation planned",
  },
  {
    link: "Tests to the tracker",
    output: "A published pilot report",
    input: "The \"tested by us\" label on the tracker changes. It says pilot, queued or not yet. It never shows a figure",
    status: "Running today",
  },
  {
    link: "Results to the test items",
    output: "Test items whose rubric cannot be applied, or prompts that cause confusion",
    input: "A list of fixes. Fixes are grouped and released as a new, versioned item bank. The bank is never changed in the middle of a run",
    status: "Planned",
  },
  {
    link: "Judge disagreement to the judge panel and human review",
    output: "Items where judges disagree most, and judges that fail our checks",
    input: "Changes to the judge panel, and a short list of items for the first human reviewers",
    status: "Planned. Human reviewers do not exist yet",
  },
  {
    link: "Corrections to dated corrections",
    output: "An error report from a reader or a provider",
    input: "A new dated correction. The original stays visible",
    status: "Running today",
  },
  {
    link: "Weekly measures to the to-do list",
    output: "A short list of weekly measures, such as days since the last measurement",
    input: "Anything past its limit becomes a work item",
    status: "Done by hand today. Automation planned",
  },
  {
    link: "Instrument checks to the protocol",
    output: "The reference model's series and the drift readings",
    input: "Evidence for adjusting the limits, which can only change in a new protocol version approved by the founder",
    status: "Planned",
  },
];

export default function CyclePage() {
  const pilotDates = joinList(C.pilotReportDates);

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: breadcrumbUrl("/") },
          { name: "AI Models", url: breadcrumbUrl("/ai-models") },
          { name: "How we analyse AI models every week", url: breadcrumbUrl("/ai-models/cycle") },
        ]}
      />

      <section className="py-[38px]">
        <Container>
          <nav aria-label="Breadcrumb" className="text-[0.88rem] text-muted-subtle mb-4">
            <Link href="/" className={LINK}>Home</Link> /{" "}
            <Link href="/ai-models" className={LINK}>AI Models</Link> / How we analyse AI models every week
          </nav>
          <Eyebrow>AI Model Watch</Eyebrow>
          <h1 className="text-[clamp(2rem,4.5vw,3.1rem)] leading-[1.1] mt-3 mb-5">
            How we analyse AI models every week
          </h1>
          <Callout>
            <p className="text-text text-[0.98rem] leading-relaxed mb-3">
              If you need support now, contact your local emergency number or a crisis line. This page does not advise which
              AI to talk to.
            </p>
            <p className="text-muted text-[0.98rem] leading-relaxed mb-3">
              We run a weekly routine for AI models. Part of it runs today: a sourced weekly list of what providers released
              and disclosed. Part of it is planned: a weekly test run of open-weight models (models whose files anyone can download). None of this produces a ranking.
            </p>
            <p className="text-muted text-[0.98rem] leading-relaxed mb-3">
              <strong className="text-text">No official model ranking, band or score is published.</strong> Where this page says
              &quot;score&quot;, it means one thing: a reply rated from 1 to 5 against a rubric written for one test item, in
              an unofficial pilot run. Pilot results are shown as ranges, in alphabetical order, and are labelled
              &quot;comparability: none&quot;: they test our instrument and are not a basis for choosing between models. Where a
              pilot&apos;s statistical test could tell one model&apos;s results apart from the others, the report says so and
              shows a point estimate inside that model&apos;s range. That is a finding about one unofficial test run, not a
              ranking and not an official score.
            </p>
          </Callout>
        </Container>
      </section>

      <section className="py-[16px]" aria-labelledby="weekly-heading">
        <Container>
          <div className="max-w-[900px] text-muted leading-relaxed">
            <h2 id="weekly-heading" className={H2}>What we do every week</h2>

            <p className="mb-3">
              <strong className="text-text">Running today: AI Model Watch.</strong> We aim to publish one edition every seven
              days. We do not promise the timing. Each edition:
            </p>
            <ol className="list-decimal pl-5 grid gap-2 mb-4">
              <li>Scans provider release pages, model cards and system cards, and records what was released in the period.</li>
              <li>
                Cites at least one source we opened for every entry. A release needs a primary source (the provider&apos;s own
                page). An item with only secondary sources is held out of the log.
              </li>
              <li>
                Is checked by a second, independent AI agent before publication. The checker reviews every release and a sample
                of at least 20 catalog rows, including every new or changed row.
              </li>
              <li>Goes live only when the founder approves the publication.</li>
              <li>States what was not scanned. A scan that did not run is never reported as &quot;nothing found&quot;.</li>
            </ol>
            <p className="mb-3">
              Model Watch summarises. It does not assess, rate, rank or score any model. Where a provider has published a safety
              or welfare disclosure, we quote the provider&apos;s own words and link the source.
            </p>
            <p className="mb-8">
              The first edition covered {C.firstEditionWindowDays} days and logged {C.firstEditionReleaseCount} releases,
              deprecations and policy notices, {C.firstEditionDisclosureCount} of which include a published safety or welfare
              disclosure.
            </p>

            <p className="mb-3">
              <strong className="text-text">Planned, conditional: a weekly test run.</strong> We intend to run a small batch of
              open-weight models through our task bank each week, under a written protocol that stays fixed from week to week.
              This has not started.
            </p>
            <ul className="list-disc pl-5 grid gap-2 mb-8">
              <li>No weekly run has taken place yet.</li>
              <li>The weekly protocol is proposed. It is not ratified.</li>
              <li>
                {C.queuedBuildCount} open-weight builds are downloaded and waiting in a queue. {C.measuredBuildCount} others
                were measured in the early-October pilots. None of the queued builds has been tested.
              </li>
              <li>The first run starts only after the founder ratifies the protocol and approves the plan.</li>
            </ul>

            <p className="mb-3">
              <strong className="text-text">What a weekly run would involve (planned):</strong>
            </p>
            <ol className="list-decimal pl-5 grid gap-2">
              <li>
                <strong className="text-text">Plan before data.</strong> The plan is committed to our version history before any
                reply is collected. The history shows the order.
              </li>
              <li>
                <strong className="text-text">Collect.</strong> Each model is asked each of the task items several times, in a
                fixed way. The queue picks which model is next by a written rule. No provider can pay to be tested, tested
                sooner, or tested in a particular way.
              </li>
              <li>
                <strong className="text-text">Judge.</strong> Each reply is rated by two judges against the item&apos;s rubric.
                Today every judge is an AI model from one family (Anthropic&apos;s Claude). Claude models were also among the
                models tested in the first pilot, so this is a known risk of bias until judges from other families take part.
                A panel of judges from three families is planned.
              </li>
              <li>
                <strong className="text-text">Check the instrument.</strong> One reference model is re-run every week. A sample
                of stored replies from an earlier pilot is re-rated each week. If the re-ratings drift beyond a set limit, that
                week is marked &quot;not comparable&quot;.
              </li>
              <li>
                <strong className="text-text">Audit.</strong> Every number in the write-up is re-derived from the raw records
                before anything is published.
              </li>
              <li>
                <strong className="text-text">Approve.</strong> The founder approves each publication. Nothing goes live without
                it.
              </li>
            </ol>
          </div>
        </Container>
      </section>

      <section className="py-[22px]" aria-labelledby="loop-heading">
        <Container>
          <h2 id="loop-heading" className={H2}>How each week makes the next one better</h2>
          <p className="text-muted max-w-[900px] leading-relaxed mb-4">
            Each week&apos;s outputs feed the next week&apos;s inputs. The loop has seven links. Some run today and some are
            planned.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-[0.92rem]">
              <caption className="sr-only">The seven links of the weekly loop, with the status of each</caption>
              <thead>
                <tr className="border-b border-line text-text">
                  <th scope="col" className="py-2 pr-4 align-bottom">Link</th>
                  <th scope="col" className="py-2 pr-4 align-bottom">This week&apos;s output</th>
                  <th scope="col" className="py-2 pr-4 align-bottom">Next week&apos;s input</th>
                  <th scope="col" className="py-2 align-bottom">Status</th>
                </tr>
              </thead>
              <tbody className="text-muted">
                {LOOP.map((r) => (
                  <tr key={r.link} className="border-b border-line align-top">
                    <th scope="row" className="py-3 pr-4 font-semibold text-text">{r.link}</th>
                    <td className="py-3 pr-4 leading-relaxed">{r.output}</td>
                    <td className="py-3 pr-4 leading-relaxed">{r.input}</td>
                    <td className="py-3 leading-relaxed">{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-muted max-w-[900px] leading-relaxed mt-4">
            The corrections channel is open to everyone, including providers. Corrections are published as new dated records and
            the original stays visible. No provider pays for a result.
          </p>
        </Container>
      </section>

      <section className="py-[22px]" aria-labelledby="publish-heading">
        <Container>
          <div className="max-w-[900px] text-muted leading-relaxed">
            <h2 id="publish-heading" className={H2}>What we publish, and what we do not</h2>

            <p className="mb-3"><strong className="text-text">We publish</strong></p>
            <ul className="list-disc pl-5 grid gap-2 mb-8">
              <li>
                A weekly edition of AI Model Watch: dated, sourced, with its coverage stated.{" "}
                <Link href="/ai-models/watch" className={LINK}>AI Model Watch</Link>.
              </li>
              <li>
                A model tracker: a sourced catalog of {C.catalogModelCount} models, listed alphabetically by provider, with a
                &quot;tested by us&quot; label of pilot, queued or not yet. &quot;Pilot&quot; means a model was in an unofficial test. It
                does not mean it passed.{" "}
                <Link href="/ai-models/tracker" className={LINK}>Tracker</Link>. A listing is not an evaluation.
              </li>
              <li>
                Unofficial pilot reports: ranges per model (plus a point estimate inside the range for a model the test could tell
                apart from the others), model names in alphabetical order, models that cannot be told apart
                grouped together first, and every figure labelled &quot;unofficial pilot&quot; with the run, the date and the
                access method. {countWord(C.pilotReportDates.length, true)} exist, dated {pilotDates}.
              </li>
              <li>Corrections as new dated records. Originals stay visible.</li>
              <li>
                The AI Labs Index, which scores {C.aiLabCount} organisations on their public governance record. It describes how
                an organisation governs itself. It does not describe how any model behaves.{" "}
                <Link href="/ai-labs" className={LINK}>AI Labs</Link>.
              </li>
            </ul>

            <p className="mb-3"><strong className="text-text">We do not publish</strong></p>
            <ul className="list-disc pl-5 grid gap-2">
              <li>
                A model ranking, rank or band, or an official model score. No model has an official score.{" "}
                {C.evaluatedModelCount === 0
                  ? "No model has been officially evaluated."
                  : `${countWord(C.evaluatedModelCount, true)} ${C.evaluatedModelCount === 1 ? "model has" : "models have"} been officially evaluated.`}
              </li>
              <li>A single number for a model in any headline, title or summary.</li>
              <li>
                Official comparisons between models. A pilot report may say its test could tell one model&apos;s results apart
                from the others, but every pilot is labelled &quot;comparability: none&quot; and none is a ranking.
              </li>
              <li>
                Advice on which AI to use, in a crisis or otherwise. Crisis-adjacent test items exist to locate failures, not to
                certify safety. {countWord(C.pilotItemsNotServedSensitive, true)} sensitive items are not given to the models in
                the pilots.
              </li>
              <li>
                Our own assessment of a provider&apos;s safety or welfare disclosure in Model Watch. We quote and link it.
              </li>
              <li>
                Anything paid for by a provider. No provider pays for inclusion, coverage, testing order, status, wording or
                scores. Our commercial services support access and interpretation only, never findings.
              </li>
            </ul>
          </div>
        </Container>
      </section>

      <section className="py-[22px]" id="scoring" aria-labelledby="scoring-heading">
        <Container>
          <div className="max-w-[900px] text-muted leading-relaxed">
            <h2 id="scoring-heading" className={H2}>How scoring works today, and what would change it</h2>

            <p className="mb-3"><strong className="text-text">Today.</strong></p>
            <ul className="list-disc pl-5 grid gap-2 mb-8">
              <li>
                The task bank has {C.itemCount} items across {C.dimensionCount} dimensions. In the most recent pilot,{" "}
                {C.pilotItemsServed} items were given to the models. {C.pilotItemsNotServed} were not, including the{" "}
                {countWord(C.pilotItemsNotServedSensitive)} sensitive ones.
              </li>
              <li>A model&apos;s reply to an item is rated from 1 to 5 against five written anchors for that item.</li>
              <li>
                Each reply is rated by two judges. All judges so far are AI models from one family. That is a stated limit of all{" "}
                {countWord(C.pilotReportDates.length)} pilots.
              </li>
              <li>
                No item has yet been reviewed by two independent humans: {C.itemsValidated} of {C.itemCount}. The whole bank is
                public, so a model could have seen it. Because of that, comparison between models on this bank is not valid.
              </li>
              <li>
                Because of these limits, pilot results are ranges, not official scores. A point estimate appears only for a model
                the test could tell apart from the others, inside its range. All of it is labelled unofficial, and no comparability
                claim is made.
              </li>
            </ul>

            <p className="mb-3">
              <strong className="text-text">What would have to change.</strong> We have listed {C.conditionsTotal} conditions.
              All must be met, and the founder must then decide. {C.conditionsMet} are met today. They are:
            </p>
            <Panel>
              <ul className="list-disc pl-5 grid gap-2">
                <li>the weekly testing protocol is ratified;</li>
                <li>the model dashboard decision is ratified;</li>
                <li>a judge panel of {C.judgeFamiliesRequired} model families is operating;</li>
                <li>a blinded or secure item pool exists;</li>
                <li>
                  items are human-validated, with at least {C.minValidatedItemsPerDimension} rated items in every dimension;
                </li>
                <li>a human rating panel exists;</li>
                <li>variance checks and judge-agreement floors are met;</li>
                <li>
                  {C.consecutiveWavesRequired} consecutive weekly runs are published under per-run approval with no open defects;
                </li>
                <li>no check of our published claims is still open (open claim audits: {C.openClaimAuditsAllowed});</li>
                <li>results from a model run on our own computers and on the provider&apos;s service are never compared unless we say so;</li>
                <li>legal and duty-of-care review is complete.</li>
              </ul>
            </Panel>
            <p className="mt-4 mb-3">
              The live status of each condition, with its source, is at{" "}
              <Link href="/ai-models/leaderboards#conditions" className={LINK}>
                Compassion leaderboards: what exists and what does not
              </Link>
              .
            </p>
            <p className="mb-8">
              Even if every condition is met, the first form would be groups with ranges, not an ordered list. Whether to publish
              one is the founder&apos;s decision. It is not decided.
            </p>

            <p className="mb-3">
              <strong className="text-text">Planned, conditional steps toward those conditions</strong> (none has a date):
            </p>
            <ol className="list-decimal pl-5 grid gap-2">
              <li>Run weekly local test runs under a ratified protocol.</li>
              <li>
                Add a hosted-access tier for larger models, and a judge panel from several families. This needs an approved
                budget and an access key.
              </li>
              <li>Publish a dashboard and complete two clean runs under per-run approval.</li>
              <li>
                Build a secure item pool and recruit a human rating panel, with protections for raters before they see sensitive
                material. This needs funding.
              </li>
            </ol>
          </div>
        </Container>
      </section>

      <section className="py-[22px] pb-[48px]" aria-labelledby="follow-heading">
        <Container>
          <div className="max-w-[900px] text-muted leading-relaxed">
            <h2 id="follow-heading" className={H2}>How to follow along</h2>
            <ul className="list-disc pl-5 grid gap-2 mb-6">
              <li><Link href="/ai-models/watch" className={LINK}>AI Model Watch</Link>: the weekly edition.</li>
              <li><Link href="/ai-models/tracker" className={LINK}>Model tracker</Link>: the sourced catalog.</li>
              <li>
                <Link href="/ai-models/leaderboards" className={LINK}>Compassion leaderboards</Link>: what exists, what does
                not, and the conditions.
              </li>
              <li>
                <Link href="/ai-models/methodology" className={LINK}>Method</Link>: the task bank, the rubric and what would show
                the method is wrong.
              </li>
              <li><Link href="/ai-labs" className={LINK}>AI Labs Index</Link>: the organisational compassion leaderboard.</li>
              <li>
                <Link href="/insights" className={LINK}>Insights</Link>: articles, including why we do not rank AI models yet.
              </li>
            </ul>
            <p className="mb-3">
              <strong className="text-text">Independence.</strong> Compassion Benchmark is independent. No provider pays for
              inclusion, coverage, testing order, status, wording or scores. Commercial services support access and interpretation only, never
              findings.
            </p>
            <p>
              <strong className="text-text">See an error?</strong> Send a correction to{" "}
              <a href="mailto:info@compassionbenchmark.com?subject=Model%20Watch%20correction" className={LINK}>
                info@compassionbenchmark.com
              </a>
              . Corrections are published as new dated records and the original stays visible.
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
