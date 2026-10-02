/**
 * McpServerSection -- the `#mcp-server` section of /ai-evaluation-suite.
 *
 * Spec: docs/MCP_AND_MODEL_BENCHMARK_PAGES_SPEC_2026-10-02.md section 3.4 (blocks M0-M13),
 * with coordinator corrections: subdimensions and the composite floor are rendered from
 * the facts file; install is repo-path only while distribution.npmPublished is false; no
 * paid/sales link anywhere in this section; no model name or model figure.
 *
 * Server component. Every number, threshold, version and tool name comes from
 * cb-probe-facts.generated.json via lib/cb-probe-facts.ts. Prose that references a tool
 * goes through <Tool>, which throws at build time if the tool is not in the generated list.
 * Each block carries a source comment (spec AC-17).
 */
import Link from "next/link";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Panel from "@/components/ui/Panel";
import Callout from "@/components/ui/Callout";
import { CB_PROBE_FACTS as P, toolName, repoWebUrl, repoCloneUrl } from "@/lib/cb-probe-facts";
import { DIMENSIONS } from "@/data/dimensions";
import { publishableWaves } from "@/lib/model-wave-facts";
import { DUTY_OF_CARE } from "./dutyOfCare";

function Tool({ n }: { n: string }) {
  return <code data-tool="">{toolName(n)}</code>;
}

const REPO_PATH_PLACEHOLDER = "<REPO_PATH>";
const SERVER_REL = "tools/cb-probe/bin/server.mjs";
const CLAUDE_ADD = `claude mcp add cb-probe -e CB_ARTIFACT_ROOT=~/compassion-probe-sessions -- node "${REPO_PATH_PLACEHOLDER}/${SERVER_REL}"`;

function Code({ children }: { children: string }) {
  return (
    <pre className="bg-[rgba(0,0,0,0.35)] border border-line rounded-[12px] p-3 overflow-x-auto text-[0.82rem] leading-relaxed text-text">
      <code>{children}</code>
    </pre>
  );
}

const th = "py-2.5 px-3 border-b border-line font-medium text-left";
const td = "py-2.5 px-3 border-b border-line/60 align-top";
const rowTh = `${td} text-left text-text font-medium`;

// Plain-language meaning of each judge configuration (tool-definitions.mjs judgeConfiguration enum).
const JUDGE_COPY: Record<string, string> = {
  cross: "A different model judges the subject's answers.",
  self: "The model judges itself. Flagged prominently in the output: self-judging carries an inflation risk.",
  panel: "Two or more judge labels. Disagreement between them is reported, not averaged away.",
};

export default function McpServerSection() {
  const toolsIn = (g: string) => P.tools.filter((t) => t.group === g);
  const dimensionRows = DIMENSIONS.map((d) => ({
    code: d.code,
    name: d.name,
    n: P.perDimensionDefaultItems[d.code] ?? 0,
  }));
  const perDimValues = Object.values(P.perDimensionDefaultItems);
  const firstRunLow = Math.min(...perDimValues) * P.minTrials;
  const firstRunHigh = Math.max(...perDimValues) * P.minTrials;
  const pilots = publishableWaves;
  const hasSeparation = typeof P.separationStatement === "string" && P.separationStatement.trim().length > 0;
  const repo = repoWebUrl();

  const toc: { id: string; label: string }[] = [
    { id: "mcp-status", label: "Status" },
    { id: "mcp-what", label: "What it is" },
    { id: "mcp-artifacts", label: "Two artifacts" },
    { id: "mcp-tools", label: "Tools" },
    { id: "mcp-install", label: "Install" },
    { id: "mcp-walkthrough", label: "Scored run" },
    { id: "mcp-contamination", label: "Contamination check" },
    { id: "mcp-judges", label: "Who judges" },
    { id: "mcp-floor", label: "Coverage floor" },
    { id: "mcp-refuses", label: "What it refuses" },
    { id: "mcp-data", label: "Data handling" },
    { id: "mcp-sensitive", label: "Sensitive items" },
    ...(hasSeparation ? [{ id: "mcp-not", label: "What this is not" }] : []),
    { id: "mcp-docs", label: "Further reading" },
  ];

  return (
    <section className="py-[30px]" id="mcp-server" aria-labelledby="mcp-server-heading">
      <Container>
        <Eyebrow>Local, unofficial, no API key</Eyebrow>
        <h2 id="mcp-server-heading" className="text-[clamp(1.55rem,3vw,2.15rem)] tracking-tight mt-3 mb-2">
          Run it from your own AI tool: the cb-probe MCP server
        </h2>
        <p className="text-muted max-w-[900px] mb-4">
          How to install the local MCP server, what a run produces, and what that output can and cannot be used for.
        </p>
        <nav aria-label="On this section" className="mb-6">
          <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-[0.88rem]">
            {toc.map((t) => (
              <li key={t.id}>
                <a href={`#${t.id}`} className="underline underline-offset-2 text-muted">
                  {t.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-8">
          {/* M0 -- status callout. Sources: DECISIONS D-30/D-40 (different tool from the browser scorer);
              well-known honesty.officialScore=false; facts distribution.npmPublished. */}
          <div id="mcp-status">
            <Callout>
              <h3 className="text-[1.15rem] font-bold mb-2">Status</h3>
              <ul className="text-muted text-[0.95rem] leading-relaxed list-disc pl-5 space-y-1.5 max-w-[920px]">
                <li>
                  This is a different tool from the browser scorer above. Its output differs; see the table under
                  &ldquo;Two artifacts&rdquo; below.
                </li>
                <li>Nothing it produces is a Compassion Benchmark score, result or index entry.</li>
                {!P.distribution.npmPublished && (
                  <li>It is not published as a package. Install it from a repository checkout.</li>
                )}
              </ul>
            </Callout>
          </div>

          {/* M1 -- what it is. Sources: README.md intro; well-known mcp.requiresNetwork/requiresApiKey=false;
              facts version, bankVersion, itemsTotal, itemsServedDefault, license. */}
          <div id="mcp-what">
            <h3 className="text-[1.25rem] font-bold mb-2">What it is</h3>
            <p className="text-muted max-w-[900px] mb-3">
              A local program that speaks MCP over stdio. It lets a model running in your own host read the published
              items, answer them, and record ratings against the published rubric. It runs on your machine, uses your
              host&rsquo;s own credential, makes no network request and needs no key.
            </p>
            <dl className="grid grid-cols-2 lg:grid-cols-5 gap-3 text-[0.9rem]">
              {[
                ["Server version", P.version],
                ["Item bank", P.bankVersion],
                ["Items in the bank", String(P.itemsTotal)],
                ["Served by default", String(P.itemsServedDefault)],
                ["Licence", P.license],
              ].map(([k, v]) => (
                <div key={k} className="border border-line rounded-[12px] px-3 py-2">
                  <dt className="text-muted-subtle text-[0.75rem] uppercase tracking-wide">{k}</dt>
                  <dd className="text-text font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* M2 -- two artifacts. Sources: README.md:13-28; validate-estimate.mjs; validate-scorecard.mjs;
              facts tools[].group, minTrials, subdimensions (bank v2.0 coverage). */}
          <div id="mcp-artifacts">
            <h3 className="text-[1.25rem] font-bold mb-2">Two artifacts</h3>
            <p className="text-muted max-w-[900px] mb-3">
              The server can produce two different outputs. Neither is a Compassion Benchmark result.
            </p>
            <div className="overflow-x-auto border border-line rounded-[14px]">
              <table className="w-full text-[0.9rem] border-collapse min-w-[640px]">
                <caption className="sr-only">JudgeEstimate compared with SelfRunScorecard</caption>
                <thead>
                  <tr className="text-muted-subtle">
                    <th scope="col" className={th}>
                      <span className="sr-only">Property</span>
                    </th>
                    <th scope="col" className={th}>JudgeEstimate</th>
                    <th scope="col" className={th}>SelfRunScorecard</th>
                  </tr>
                </thead>
                <tbody className="text-muted">
                  <tr>
                    <th scope="row" className={rowTh}>Tools</th>
                    <td className={td}>
                      {toolsIn("JudgeEstimate").map((t, i) => (
                        <span key={t.name}>
                          {i > 0 && ", "}
                          <Tool n={t.name} />
                        </span>
                      ))}
                    </td>
                    <td className={td}>
                      {toolsIn("SelfRunScorecard").map((t, i) => (
                        <span key={t.name}>
                          {i > 0 && ", "}
                          <Tool n={t.name} />
                        </span>
                      ))}
                    </td>
                  </tr>
                  <tr>
                    <th scope="row" className={rowTh}>Per-item ratings</th>
                    <td className={td}>Yes, with a rationale.</td>
                    <td className={td}>
                      Yes, with the matched anchor and a verbatim quote; at least {P.minTrials} trials per item.
                    </td>
                  </tr>
                  <tr>
                    <th scope="row" className={rowTh}>Dimension means with an interval</th>
                    <td className={td}>No.</td>
                    <td className={td}>Always, for every dimension with at least one rated item.</td>
                  </tr>
                  <tr>
                    <th scope="row" className={rowTh}>Subdimension coverage</th>
                    <td className={td}>Not applicable.</td>
                    <td className={td}>
                      {P.subdimensions.available
                        ? `${P.subdimensions.covered} of ${P.subdimensions.total} subdimensions are covered by at least one item in a default run.`
                        : `Not available on the current bank (${P.subdimensions.covered} of ${P.subdimensions.total} covered).`}
                    </td>
                  </tr>
                  <tr>
                    <th scope="row" className={rowTh}>Composite and band</th>
                    <td className={td}>Never. The schema has no field that can hold one.</td>
                    <td className={td}>
                      Only past the coverage floor (see &ldquo;Coverage floor and composite&rdquo;); otherwise null,
                      with a stated reason.
                    </td>
                  </tr>
                  <tr>
                    <th scope="row" className={rowTh}><code>official</code></th>
                    <td className={td}>false, structurally.</td>
                    <td className={td}>false, structurally.</td>
                  </tr>
                  <tr>
                    <th scope="row" className={rowTh}><code>comparability</code></th>
                    <td className={td}>none.</td>
                    <td className={td}>none.</td>
                  </tr>
                  <tr>
                    <th scope="row" className={rowTh}>Contamination check</th>
                    <td className={td}>Not required.</td>
                    <td className={td}>Required to finish: both the recall check and the forced-choice identification questions.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* M3 -- tool list. Source: facts tools[] (name, group, summary), in the order the server lists them. */}
          <div id="mcp-tools">
            <h3 className="text-[1.25rem] font-bold mb-2">Tools ({P.toolCount})</h3>
            <div className="overflow-x-auto border border-line rounded-[14px]">
              <table className="w-full text-[0.9rem] border-collapse min-w-[640px]">
                <caption className="sr-only">Tools the cb-probe server exposes</caption>
                <thead>
                  <tr className="text-muted-subtle">
                    <th scope="col" className={th}>Tool</th>
                    <th scope="col" className={th}>Group</th>
                    <th scope="col" className={th}>Purpose</th>
                  </tr>
                </thead>
                <tbody className="text-muted">
                  {P.tools.map((t) => (
                    <tr key={t.name}>
                      <th scope="row" className={`${td} text-left font-normal text-text`}>
                        <code data-tool-row="">{t.name}</code>
                      </th>
                      <td className={td}>{t.group}</td>
                      <td className={td}>{t.summary}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* M4 -- install, repo path only. Sources: README.md Install; well-known mcp.claudeCodeInstall,
              mcp.argsTemplate; facts repository, distribution.npmPublished; package.json engines (node >=20).
              No package-manager one-liner is shown: nothing is published (npmPublished flag). */}
          <div id="mcp-install">
            <h3 className="text-[1.25rem] font-bold mb-2">Install</h3>
            <p className="text-muted max-w-[900px] mb-3">
              Requires Node 20 or newer and a checkout of the repository. There is no other dependency. Replace{" "}
              <code>{REPO_PATH_PLACEHOLDER}</code> with the absolute path to your checkout.
            </p>
            <ol className="space-y-4 list-decimal pl-5 text-muted">
              <li>
                <p className="mb-2">Clone the repository.</p>
                <Code>{`git clone ${repoCloneUrl()} ${REPO_PATH_PLACEHOLDER}`}</Code>
              </li>
              <li>
                <p className="mb-2">Register the server with the Claude Code CLI.</p>
                <Code>{CLAUDE_ADD}</Code>
                <p className="mt-2">
                  This registers the server for the current project only. Add <code>-s user</code> after{" "}
                  <code>cb-probe</code> to make it available everywhere.
                </p>
              </li>
              <li>
                <p className="mb-2">Or, in any other MCP host, point it at the same stdio command.</p>
                <Code>{`node ${REPO_PATH_PLACEHOLDER}/${SERVER_REL}`}</Code>
              </li>
              <li>
                <p className="mb-2">Verify. This should show the server as connected.</p>
                <Code>{"claude mcp get cb-probe"}</Code>
                <p className="mt-2">
                  Your host&rsquo;s MCP panel (in Claude Code, <code>/mcp</code>) lists the server&rsquo;s tools; expect{" "}
                  {P.toolCount}.
                </p>
              </li>
              <li>
                <p className="mb-2">Remove.</p>
                <Code>{"claude mcp remove cb-probe"}</Code>
              </li>
            </ol>
            <p className="text-muted text-[0.9rem] max-w-[900px] mt-3">
              Use an absolute path for the checkout: some hosts do not expand <code>~</code> inside arguments. The{" "}
              <code>~</code> in <code>CB_ARTIFACT_ROOT</code> is expanded by the server itself. A project-scoped{" "}
              <code>.mcp.json</code> form is in the{" "}
              <a href={`${repo}/blob/main/tools/cb-probe/README.md`} className="underline underline-offset-2">
                README
              </a>
              .
            </p>
          </div>

          {/* M5 -- walkthrough. Sources: README.md first-run; tool-definitions.mjs; SKILL.md;
              facts minTrials, itemsServedDefault, trialsInDefaultRun, perDimensionDefaultItems.
              Step 2 states the identification_answers shape; the run_exposure_probe input schema declares it (AC-13). */}
          <div id="mcp-walkthrough">
            <h3 className="text-[1.25rem] font-bold mb-2">A scored run, step by step</h3>
            <p className="text-muted max-w-[900px] mb-3">
              A default run is {P.trialsInDefaultRun} ratings ({P.itemsServedDefault} items &times; {P.minTrials} trials).
              A single-dimension first run is {firstRunLow} to {firstRunHigh} ratings, depending on the dimension, and is
              the recommended place to start. A run over fewer than all dimensions can never carry a composite.
            </p>
            <ol className="space-y-3 list-decimal pl-5 text-muted max-w-[920px]">
              <li>
                <strong className="text-text">Read the separation statement.</strong> Call{" "}
                <Tool n="explain_what_this_is_not" />.
              </li>
              <li>
                <strong className="text-text">Start.</strong> Call <Tool n="start_scored_run" /> with{" "}
                <code>subject_label</code>, <code>judge_label</code>, a <code>judgeConfiguration</code> (defaults to {P.defaultJudgeConfiguration}),
                optionally <code>dimensions</code>, <code>trials</code> (not below {P.minTrials}) and{" "}
                <code>include_sensitive</code> (default false). It returns a <code>run_id</code>.
              </li>
              <li>
                <strong className="text-text">Contamination challenge, before answering.</strong> Call{" "}
                <Tool n="run_exposure_probe" /> with only <code>run_id</code>. It returns item ids (never item text) and
                the forced-choice question set. Answer the recall questions from memory, before looking anything up, and
                say so if you do not remember. Then call it again with <code>recall_attempts</code> and{" "}
                <code>identification_answers</code>, each answer shaped <code>{"{item_id, option_id}"}</code>.
              </li>
              <li>
                <strong className="text-text">Loop until done.</strong> Call <Tool n="next_item" /> (item id, dimension, construct and prompt; no
                anchors), answer it, call <Tool n="get_anchors" />, then <Tool n="record_item_rating" /> (one rating or a
                batch). <code>anchor_matched</code> must be exactly the published anchor label and{" "}
                <code>evidence_quote</code> a verbatim excerpt. Repeat until <Tool n="next_item" /> returns{" "}
                <code>status: &quot;complete&quot;</code>. <Tool n="run_status" /> re-orients without writing anything.
              </li>
              <li>
                <strong className="text-text">Finish.</strong> <Tool n="finish_scored_run" /> re-validates the whole run
                against the bank and writes <code>scorecard.json</code>.
              </li>
              <li>
                <strong className="text-text">Read it in this order.</strong> <code>contamination</code> and{" "}
                <code>judge_configuration_notice</code> first, then the dimension means with intervals, then{" "}
                <code>composite_withheld_reason</code> or the composite, then <code>provenance</code>.
              </li>
              <li>
                <strong className="text-text">What to do with it.</strong> Keep it as a record of your own run. Do not
                publish it as a Compassion Benchmark score, and do not place it beside a published entity score. There is
                no submission endpoint; this site does not accept scores over HTTP.
              </li>
            </ol>
            <p className="text-muted max-w-[920px] mt-3">
              Unscored path: open a judge session with <Tool n="open_judge_session" />, record a 1 to 5 rating with a
              rationale per item using <Tool n="record_item_estimate" />, then call <Tool n="summarise_judge_session" />.
              The result holds your per-item 1 to 5 ratings and a count per dimension. It has no dimension mean, composite or band.
            </p>
          </div>

          {/* M6 -- contamination. Sources: exposure-probe.mjs EXPOSURE_FLAG_THRESHOLD; identification-probe.mjs
              (count, options, alpha); well-known honesty.contaminationProbe. Wording rule: never "clean"/"cleared". */}
          <div id="mcp-contamination">
            <h3 className="text-[1.25rem] font-bold mb-2">Contamination check</h3>
            <p className="text-muted max-w-[900px] mb-3">
              Every item is published with its answer key, so a model trained since may already know it. A run must
              complete both checks before it can finish.
            </p>
            <ul className="text-muted list-disc pl-5 space-y-2 max-w-[920px]">
              <li>
                <strong className="text-text">Recall overlap.</strong> The model recalls the wording of a few challenged
                items from memory. The recall is compared offline by normalised token overlap and flagged at{" "}
                {P.recallThreshold}.
              </li>
              <li>
                <strong className="text-text">Forced-choice identification.</strong> {P.identificationCount} items,{" "}
                {P.identificationOptions} options each. Accuracy is compared with chance by an exact binomial tail and
                flagged below {P.identificationAlpha}.
              </li>
            </ul>
            <p className="text-muted max-w-[920px] mt-3">
              A run is marked contaminated if either check fires. When neither fires, the only accurate wording is
              &ldquo;no contamination indicated on the sampled items&rdquo;. The checks are a screen, not proof. They cover
              only the sampled items, they cannot tell reading an item earlier in the session from training exposure, and
              because the whole bank is published with its answer key, a model trained since may know both.
            </p>
          </div>

          {/* M7 -- who judges. Sources: tool-definitions.mjs judgeConfiguration enum; scored-run.mjs
              DEFAULT_JUDGE_CONFIGURATION; D-07. Facts judgeConfigurations, defaultJudgeConfiguration. */}
          <div id="mcp-judges">
            <h3 className="text-[1.25rem] font-bold mb-2">Who judges the answers</h3>
            <ul className="text-muted list-disc pl-5 space-y-2 max-w-[920px]">
              {P.judgeConfigurations.map((j) => {
                const copy = JUDGE_COPY[j];
                if (!copy) throw new Error(`McpServerSection: no copy for judge configuration "${j}"`);
                return (
                  <li key={j}>
                    <code>{j}</code>
                    {j === P.defaultJudgeConfiguration ? " (default)" : ""}. {copy}
                  </li>
                );
              })}
            </ul>
            <p className="text-muted max-w-[920px] mt-3">
              Judge labels are self-reported and never verified. None of the configurations is blinded or adjudicated by a
              second party, so a local run is not equivalent to the published pilot wave. See{" "}
              <Link href="/ai-models/methodology#analysis" className="underline underline-offset-2">
                the stage-by-stage comparison
              </Link>
              .
            </p>
          </div>

          {/* M8 -- coverage floor. Sources: validate-scorecard.mjs MIN_ITEMS_PER_DIMENSION_FOR_COMPOSITE;
              DECISIONS D-40, D-07; facts minItemsPerDimension, dimensionCount, perDimensionDefaultItems,
              floorReachable (both branches coded), subdimensions. */}
          <div id="mcp-floor">
            <h3 className="text-[1.25rem] font-bold mb-2">Coverage floor and composite</h3>
            <p className="text-muted max-w-[920px] mb-3">
              A composite and band appear only when the run covers all {P.dimensionCount} dimensions and every dimension
              rests on at least {P.minItemsPerDimension} rated items. Otherwise both are null and a{" "}
              <code>composite_withheld_reason</code> names the dimension and the counts. Dimension means with a bootstrap
              interval are always reported. The reason: an absent dimension is treated as 1 by the canonical formula, and
              a small change on a thin dimension moves the composite further than the documented swing.
            </p>
            <div className="overflow-x-auto border border-line rounded-[14px]">
              <table className="w-full text-[0.9rem] border-collapse min-w-[520px]">
                <caption className="sr-only">Items per dimension in a default run, against the floor</caption>
                <thead>
                  <tr className="text-muted-subtle">
                    <th scope="col" className={th}>Dimension</th>
                    <th scope="col" className={th}>Items in a default run</th>
                    <th scope="col" className={th}>Floor</th>
                  </tr>
                </thead>
                <tbody className="text-muted">
                  {dimensionRows.map((r) => (
                    <tr key={r.code}>
                      <th scope="row" className={`${td} text-left font-normal text-text`}>
                        {r.code} &middot; {r.name}
                      </th>
                      <td className={td}>{r.n}</td>
                      <td className={td}>{P.minItemsPerDimension}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-muted max-w-[920px] mt-3" data-floor-reachable={String(P.floorReachable)}>
              {P.floorReachable
                ? "On the current default served bank the floor is reachable: a complete default run can meet it in every dimension."
                : "On the current default served bank the floor is not reachable: no default run can carry a composite."}
            </p>
            <p className="text-muted max-w-[920px] mt-2">
              {P.subdimensions.available
                ? `Subdimension coverage: ${P.subdimensions.covered} of ${P.subdimensions.total} subdimensions are represented by at least one item in a default run.`
                : `Subdimension coverage is not available on the current bank: ${P.subdimensions.covered} of ${P.subdimensions.total} subdimensions are represented.`}
            </p>
          </div>

          {/* M9 -- what it refuses. Sources: README.md; tool-definitions.mjs; scored-run.mjs MIN_TRIALS (facts minTrials).
              The only blocks where rank/leaderboard/official/band names appear, and only in negation (data-negation-list;
              the M12 statement is the tool's own text and carries the same marker). */}
          <div id="mcp-refuses">
            <h3 className="text-[1.25rem] font-bold mb-2">What it refuses</h3>
            <ul data-negation-list="" className="text-muted list-disc pl-5 space-y-1.5 max-w-[920px]">
              <li>Fewer than {P.minTrials} trials per item.</li>
              <li>Finishing before both contamination checks (recall and identification) are complete, or before every planned trial is recorded.</li>
              <li>
                A rating whose <code>anchor_matched</code> is not exactly the published anchor label.
              </li>
              <li>
                A rating whose <code>evidence_quote</code> is not a verbatim, substantive excerpt of the answer.
              </li>
              <li>A blank or one-word recall.</li>
              <li>A partly valid batch: nothing from it is written.</li>
              <li>An edited run file that no longer matches the bank: it is re-validated at finish.</li>
              <li>
                Any result that carries a rank, a leaderboard position, a <code>comparability</code> other than none, or{" "}
                <code>official: true</code>.
              </li>
              <li>A writable location inside this repository or inside any git working tree.</li>
            </ul>
          </div>

          {/* M10 -- data handling. Sources: README.md "Where session/run data lands"; well-known
              mcp.writesOutsideArtifactRoot=false. */}
          <div id="mcp-data">
            <h3 className="text-[1.25rem] font-bold mb-2">Where your data goes</h3>
            <p className="text-muted max-w-[920px]">
              Everything is written as plain JSON files under a folder you control (<code>CB_ARTIFACT_ROOT</code>, default{" "}
              <code>~/compassion-probe-sessions</code>). The server makes no network request. To delete a run, delete its
              folder; cb-probe holds no other copy. The model provider you use still sees whatever you send it. If you
              paste real distress text rather than a fictional test response, treat it as you would any message to that
              provider.
            </p>
          </div>

          {/* M11 -- sensitive items. Sources: tool-definitions.mjs include_sensitive; facts
              crisisItemsExcludedByDefault; duty-of-care sentence shared with methodology (dutyOfCare.ts). */}
          <div id="mcp-sensitive">
            <h3 className="text-[1.25rem] font-bold mb-2">Sensitive items</h3>
            <p className="text-muted max-w-[920px] mb-3">
              {P.crisisItemsExcludedByDefault} crisis-adjacent items are excluded by default. They are included only with{" "}
              <code>include_sensitive: true</code>, and each is then marked at the moment it is served, with a duty-of-care
              notice. A default run does not test crisis responses.
            </p>
            <p
              className="text-[0.9rem] text-muted-subtle border-l-2 border-line pl-4 max-w-[920px] leading-relaxed"
              data-duty-of-care=""
            >
              {DUTY_OF_CARE}
            </p>
          </div>

          {/* M12 -- what this is not. Source: facts separationStatement, rendered verbatim (the return value of
              the explain_what_this_is_not handler). No hand-typed fallback: absent => block not rendered. */}
          {hasSeparation && (
            <div id="mcp-not">
              <h3 className="text-[1.25rem] font-bold mb-2">What this is not</h3>
              <blockquote
                className="border-l-2 border-line pl-4 text-muted whitespace-pre-wrap text-[0.88rem] max-w-[920px]"
                data-separation-statement=""
                data-negation-list=""
              >
                {P.separationStatement}
              </blockquote>
              <p className="text-muted max-w-[920px] mt-3">Not a measurement of how compassionate a model is.</p>
              {pilots.length > 0 && (
                <p className="text-muted max-w-[920px] mt-2">
                  The separately published{" "}
                  {pilots.length === 1 ? (
                    <Link href={`/ai-models/reports/${pilots[0].run_id}`} className="underline underline-offset-2">
                      unofficial pilot report
                    </Link>
                  ) : (
                    <Link href="/ai-models/reports" className="underline underline-offset-2">
                      unofficial pilot reports
                    </Link>
                  )}{" "}
                  {pilots.length === 1 ? "was" : "were"} produced under {pilots.length === 1 ? "a different design" : "different designs"}, described on the method page.
                </p>
              )}
            </div>
          )}

          {/* M13 -- further reading. Source: facts repository (D3). Umami events are data attributes only. */}
          <div id="mcp-docs">
            <h3 className="text-[1.25rem] font-bold mb-2">Further reading</h3>
            <ul className="text-muted list-disc pl-5 space-y-1.5">
              <li>
                <a
                  href={`${repo}/blob/main/tools/cb-probe/README.md`}
                  className="underline underline-offset-2"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-umami-event="mcp_readme_click"
                >
                  cb-probe README
                </a>
              </li>
              <li>
                <a
                  href={`${repo}/blob/main/docs/CB_PROBE_USER_GUIDE.md`}
                  className="underline underline-offset-2"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-umami-event="mcp_guide_click"
                >
                  cb-probe user guide
                </a>
              </li>
              <li>
                <Link
                  href="/ai-models/methodology#analysis"
                  className="underline underline-offset-2"
                  data-umami-event="mcp_methodology_click"
                >
                  How a model run is analysed
                </Link>
              </li>
            </ul>
            <Panel className="mt-4">
              <p className="text-muted text-[0.9rem]">
                Once installed, ask your assistant to call <Tool n="explain_what_this_is_not" />, then to start a scored run on
                one dimension with <code>judgeConfiguration</code> cross and a different judge. Do not ask a model to
                judge its own answers; if it does, that is the self configuration, and the scorecard carries a notice
                saying so.
              </p>
            </Panel>
          </div>
        </div>
      </Container>
    </section>
  );
}
