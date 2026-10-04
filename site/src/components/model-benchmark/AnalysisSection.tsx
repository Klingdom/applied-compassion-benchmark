/**
 * AnalysisSection -- the `#analysis` section of /ai-models/methodology.
 *
 * Spec: docs/MCP_AND_MODEL_BENCHMARK_PAGES_SPEC_2026-10-02.md section 4.3 (E-M1, E-M2).
 * Anchor is `analysis`, never `pipeline` (F5: /ai-models already owns #pipeline).
 *
 * Contains no model name and no result figure. Pilot facts are design facts only,
 * read from the wave file (design / bank / method) through model-wave-facts; local-run
 * facts come from cb-probe-facts.generated.json. Server component.
 */
import Link from "next/link";
import type { ReactNode } from "react";
import Container from "@/components/ui/Container";
import Panel from "@/components/ui/Panel";
import { CB_PROBE_FACTS as P, toolName } from "@/lib/cb-probe-facts";
import { publishableWaves, loadWave, assertRenderable, type PilotWave } from "@/lib/model-wave-facts";
import { dateLong, judgesAreCrossFamily, isLocalOpenWeight } from "@/lib/model-report-facts";
import { DUTY_OF_CARE } from "./dutyOfCare";

const th = "py-2.5 px-3 border-b border-line font-medium text-left align-bottom";
const td = "py-2.5 px-3 border-b border-line/60 align-top";
const rowTh = `${td} text-left text-text font-medium`;

const capitalise = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

/**
 * The pilot column describes EVERY published pilot, each from its own wave file: a pilot's design differs from another's
 * (one conversation per item or parts of many, same-family or cross-family judges, an excluded judge or none), so a
 * sentence true of one is not assumed true of the next. When every pilot yields the same sentence it is shown once;
 * when they differ each is labelled by its date. Design facts only: no model name, no result figure.
 */
function pilotCell(pilots: PilotWave[], describe: (w: PilotWave) => string): ReactNode {
  if (pilots.length === 0) return "No pilot wave is currently published.";
  const texts = pilots.map(describe);
  if (texts.every((t) => t === texts[0])) return texts[0];
  return (
    <>
      {pilots.map((w, i) => (
        <span key={w.run_id} className="block mb-2 last:mb-0">
          <strong className="text-text font-medium">Pilot of {dateLong(w.report_date)}:</strong> {texts[i]}
        </span>
      ))}
    </>
  );
}

/** Does this wave run every build in two arms (template amendment 16)? From design.arms, never inferred. */
const hasArms = (w: PilotWave): boolean => w.design.arms !== undefined;

const countWord = (n: number): string => ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"][n] ?? String(n);

/** Trials per item: one number for every subject, or (an arms wave) the number in each arm, from design.arms. */
function trialsSentence(w: PilotWave): string {
  const t = w.design.trials_per_subject;
  if (typeof t === "number") return `${t} trials. `;
  const byArm = new Map<string, Set<number>>();
  for (const e of Object.values(w.design.arms ?? {})) byArm.set(e.arm, (byArm.get(e.arm) ?? new Set()).add(e.trials));
  const parts = [...byArm.entries()].sort(([x], [y]) => (x < y ? -1 : 1)).map(([arm, n]) => `arm ${arm}: ${[...n].map((v) => `${countWord(v)} trial${v === 1 ? "" : "s"} per item`).join("/")}`);
  return `${capitalise(parts.join("; "))}. `;
}

/** The explicit system message of an arms wave, per arm, verbatim from design.arms, and where it sits (a build's own template). */
function systemMessageSentence(w: PilotWave): string {
  const arms = w.design.arms;
  if (!arms) return "";
  const first = new Map<string, string>();
  for (const id of Object.keys(arms).sort()) if (!first.has(arms[id].arm) && arms[id].system_message) first.set(arms[id].arm, arms[id].system_message as string);
  const quoted = [...first.entries()].sort(([x], [y]) => (x < y ? -1 : 1)).map(([arm, m]) => `arm ${arm} \u201c${m}\u201d`).join(", ");
  return ` An explicit system message was sent with every item, identical for every build within an arm (${quoted}). Where it sits in the prompt differs by each build's own template, which is disclosed and not controlled.`;
}

/** How a pilot's items were put to the subjects, from design.items_per_conversation_max. */
function conversationSentence(w: PilotWave): string {
  const max = w.design.items_per_conversation_max;
  const trials = trialsSentence(w);
  if (max <= 1) {
    return `${trials}Each item of each trial was sent in its own fresh conversation, as one user turn${hasArms(w) ? " after the system message" : ""}, so no item shared a conversation with another.${systemMessageSentence(w)}`;
  }
  return `${trials}Within each trial the ${w.design.items_served} items were sent in parts of up to ${max}, and each part was answered in its own fresh conversation, so up to ${max} items shared a conversation.`;
}

/** What the subjects were shown: design.conversation_per_item is present on later runs, absent on the first pilot. */
function blindingSentence(w: PilotWave): string {
  return w.design.conversation_per_item
    ? "Subjects saw prompt text only: no ids, dimensions, constructs or anchors, and an outgoing-message check screened every message."
    : "Subjects saw prompts only: no ids, dimensions, constructs or anchors, and a planted-anchor leak check gated every brief.";
}

export default function AnalysisSection() {
  const pilots: PilotWave[] = publishableWaves.map((e) => assertRenderable(loadWave(e.run_id)));
  const pilotLinks = publishableWaves;
  const many = pilots.length > 1;
  // Source comment for each row: wave file bank.* / design.* / method.* (pilot), cb-probe-facts (local run).
  const rows: { stage: string; does: string; pilot: ReactNode; local: ReactNode; official: string }[] = [
    {
      // pilot: wave bank.*; local: facts bankVersion, itemsServedDefault.
      stage: "1. Item bank",
      does: "One published bank, frozen with a version.",
      pilot: pilotCell(pilots, (w) => `Bank ${w.design.bank_version}: ${w.bank.items_total} items, ${w.bank.items_served} served, ${w.bank.items_not_served_unreviewed} unreviewed drafts and ${w.bank.items_not_served_sensitive} crisis items not served, ${w.bank.items_validated} human-validated.`),
      local: `Bank ${P.bankVersion}; ${P.itemsServedDefault} items served by default.`,
      official: "Human validation (two reviews) and an unpublished pool, because the published pool carries its own answer key.",
    },
    {
      // pilot: wave design.trials_per_subject, design.items_per_conversation_max, design.items_served;
      // pilot pilot-2026-10-01.md section 0 (prompts only, planted-anchor leak check).
      stage: "2. Answers",
      does: "Each subject answers each item several times, independently.",
      pilot: pilotCell(pilots, (w) => `${blindingSentence(w)} ${conversationSentence(w)}`),
      local: "Not blinded: the host model sees the item id, dimension, construct and prompt, and is also the runner.",
      official: "A frozen, registry-recorded snapshot, blinded subject access, and the access tier stated.",
    },
    {
      // pilot: wave design.judges_per_response, design.self_judging; facts defaultJudgeConfiguration, judgeConfigurations.
      stage: "3. Judging",
      does: "Each response is rated 1 to 5 against that item's five-anchor rubric.",
      pilot: pilotCell(pilots, (w) => `${w.design.judges_per_response} judges per response${w.design.self_judging ? "" : ", never the subject's own model"}; judges blind to subject, trial and grouping by design; all drawn from one model family, named in the report${judgesAreCrossFamily(w) ? ", and a different family from the models tested" : ""}.`),
      local: (
        <>
          One judge per rating. Configurations: {P.judgeConfigurations.map((j) => <code key={j}>{j} </code>)}
          ({P.defaultJudgeConfiguration} is the default). Labels are self-reported.
        </>
      ),
      official: "Judges outside the subject's family, and human raters.",
    },
    {
      // pilot: wave design.excluded_judges, exclusion_record; local: record_item_rating write-time check.
      stage: "4. Quote grounding",
      does: "A rating counts only if it cites a verbatim excerpt.",
      pilot: pilotCell(pilots, (w) =>
        w.design.excluded_judges.length > 0
          ? "A judge whose quotes failed the grounding check at a measured rate was excluded after the fact, and this was disclosed as a post-hoc protocol change. The figure is in the report, not here."
          : "No judge was excluded.",
      ),
      local: (
        <>
          <code data-tool="">{toolName("record_item_rating")}</code> rejects a non-verbatim or one-word quote at write
          time.
        </>
      ),
      official: "The same, plus the exclusion rule written down before ratings are collected.",
    },
    {
      // pilot: wave method.composite; local: facts minItemsPerDimension.
      stage: "5. Aggregation",
      does: "Item mean, then dimension mean, then the unmodified canonical composite function.",
      pilot: pilotCell(pilots, () => "Dimension means are averages of item means; the composite uses the unmodified canonical function."),
      local: `Same function. A composite appears only past the floor (${P.minItemsPerDimension} items in every dimension).`,
      official: "Same.",
    },
    {
      // pilot: wave method.interval (verbatim); local: facts defaultBootstrapIterations.
      stage: "6. Intervals",
      does: "A 95% range, with the sources of uncertainty it covers stated.",
      pilot: pilotCell(pilots, (w) => `${capitalise(w.method.interval)}, covering item sampling only. Chosen because the judges of one response are not independent trials.`),
      local: (
        <>
          A per-dimension bootstrap that resamples each item&rsquo;s recorded trial ratings and keeps the items fixed (
          {P.defaultBootstrapIterations} iterations, seeded from the run id). It does not cover which items were drawn,
          so it is <strong className="text-text">not equivalent</strong> to the pilot&rsquo;s interval and should not be
          read as comparable.
        </>
      ),
      official: "Item-level resampling, as in the pilot.",
    },
    {
      // pilot: pilot report section on separation; D-29a item 4 (grouping, same-sentence confound).
      stage: "7. Separation",
      does: "State separation only when the range of the paired difference excludes zero.",
      pilot: pilotCell(pilots, (w) =>
        hasArms(w)
          ? `Paired differences on the same resampled items, declared before the data: ${w.comparisons?.length ?? 0} comparisons across the two arms. In the primary arm each pair is reported both without correction and with a Bonferroni correction over the primary arm's pairs; neither is promoted, and a point is shown only for a model separated after correction. The secondary arm has one trial per item and shows ranges only, as does each build's second arm against its first. ${w.dimension_pairwise.length} dimension-level comparisons add a Bonferroni correction. Models that could not be told apart are grouped, not ordered.`
          : `Paired differences on the same resampled items. The ${w.pairwise.length} model pair${w.pairwise.length === 1 ? "" : "s"} at composite level use uncorrected 95% ranges; the ${w.dimension_pairwise.length} dimension-level comparisons add a Bonferroni correction. Models that could not be told apart are grouped, not ordered.`,
      ),
      local: "Not applicable: one subject only, so there is no comparison between subjects.",
      official: "Same, plus a fixed publication bar that is not yet canonical.",
    },
    {
      // pilot: report (both probes on sampled items); local: facts recallThreshold, identificationCount/Options/Alpha.
      stage: "8. Contamination",
      does: "Test whether the subject already knows the items.",
      pilot: pilotCell(pilots, (w) => hasArms(w)
        ? "Both probes, once per build rather than per arm, through the cb-probe MCP server, on sampled items; the secondary arm uses its build's probe. Not flagged means only that no contamination was indicated on the sampled items."
        : "Both probes, on sampled items. Not flagged means only that no contamination was indicated on the sampled items."),
      local: (
        <>
          Both probes are required to finish: recall overlap flagged at {P.recallThreshold}, and forced-choice identification
          over {P.identificationCount} items with {P.identificationOptions} options each, flagged below{" "}
          {P.identificationAlpha}.
        </>
      ),
      official: "An unpublished pool. The probes do not substitute for it.",
    },
    {
      // pilot: report confounds section (class only, no figures); local: judgeConfiguration self.
      stage: "9. Disclosed confounds",
      does: "Stated beside any separated figure, in the same sentence or caption.",
      pilot: pilotCell(pilots, (w) => {
        const parts = ["reply length"];
        parts.push(judgesAreCrossFamily(w) ? "a bank authored with help from the judges' model family" : "overlap between the judges' and the subjects' model family, a bank authored with that family's assistance");
        if (isLocalOpenWeight(w)) parts.push("quantised local builds, which may behave differently from the unquantised models");
        if (hasArms(w)) parts.push("a system message that sits differently in each build's template, and a secondary arm with one trial per item");
        if (w.bank.items_not_served_sensitive > 0) parts.push("crisis items not served");
        return capitalise(`${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}.`);
      }),
      local: "Self-judging inflation risk under the self configuration.",
      official: "Each resolved, or still disclosed.",
    },
  ];

  return (
    <section className="py-[30px]" id="analysis" aria-labelledby="analysis-heading">
      <Container>
        <h2 id="analysis-heading" className="text-[clamp(1.55rem,3vw,2.15rem)] tracking-tight mb-2">
          From item bank to separation: how a model run is analysed
        </h2>
        <p className="text-muted max-w-[900px] mb-4">
          Nine stages, and where the pilot wave, a local cb-probe run and a future
          official run differ at each one.
        </p>
        <div className="space-y-3 text-muted max-w-[920px] mb-5 text-[0.95rem] leading-relaxed">
          <p>
            The pilot and a local run each keep a record of every rating, so a figure can be traced back to the answers and
            ratings it rests on. This section describes the method only. It names no model and states no result; results live in the
            report.
          </p>
          <p>
            {many ? "Each pilot is an unofficial wave" : "The pilot is an unofficial wave"}: <code>official: false</code>, <code>comparability: none</code>.
            {pilotLinks.length > 0 && (
              <>
                {" "}
                {pilotLinks.length === 1 ? "Its report is" : "Their reports are"}{" "}
                {pilotLinks.map((l, i) => (
                  <span key={l.run_id}>
                    {i > 0 && (i === pilotLinks.length - 1 ? " and " : ", ")}
                    <Link href={`/ai-models/reports/${l.run_id}`} className="underline underline-offset-2">
                      {pilotLinks.length === 1 ? "the pilot report" : `the pilot of ${dateLong(l.report_date)}`}
                    </Link>
                  </span>
                ))}
                .
              </>
            )}
          </p>
          <p>
            Reply length is a class of confound for any rated response: longer replies can read as more attentive. In the
            {many ? " pilots" : " pilot"}, reply length was measured and disclosed beside any separated figure, never folded into it. A local
            cb-probe run does not measure it.
          </p>
        </div>

        <div className="overflow-x-auto border border-line rounded-[14px]">
          <table className="w-full text-[0.88rem] border-collapse min-w-[1000px]">
            <caption className="sr-only">
              Analysis stages: what the analysis does, what the pilot did, what a local cb-probe run does, and what an
              official run would additionally need
            </caption>
            <thead>
              <tr className="text-muted-subtle">
                <th scope="col" className={th}>Stage</th>
                <th scope="col" className={th}>What an analysis does</th>
                <th scope="col" className={th}>{many ? "What each pilot did" : "What the pilot did"}</th>
                <th scope="col" className={th}>What a local cb-probe run does</th>
                <th scope="col" className={th}>What an official run additionally needs</th>
              </tr>
            </thead>
            <tbody className="text-muted">
              {rows.map((r) => (
                <tr key={r.stage}>
                  <th scope="row" className={rowTh}>{r.stage}</th>
                  <td className={td}>{r.does}</td>
                  <td className={td}>{r.pilot}</td>
                  <td className={td}>{r.local}</td>
                  <td className={td}>{r.official}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p
          className="text-[0.86rem] text-muted-subtle border-l-2 border-line pl-4 max-w-[920px] leading-relaxed mt-4"
          data-duty-of-care=""
        >
          {DUTY_OF_CARE}
        </p>

        {/* E-M2: pointer, text link only; no button, no CTA. */}
        <Panel className="mt-6 max-w-[920px]">
          <h3 className="text-[1.05rem] mb-2">Run the instrument yourself</h3>
          <p className="text-muted text-[0.93rem] leading-relaxed">
            A local MCP server lets you run the same item bank on a model you have access to. It is local, unofficial and
            not blinded, and the pilot was not produced this way. See{" "}
            <Link href="/ai-evaluation-suite#mcp-server" className="underline underline-offset-2">
              the MCP server section
            </Link>
            .
          </p>
        </Panel>
      </Container>
    </section>
  );
}
