# Design spec: MCP server (cb-probe) and AI-model benchmarking pages

Date: 2026-10-02 · Author: product-manager · Status: proposed, awaiting founder answers to section 9
Founder request (2026-10-02): "Build out more detail for the MCP server and AI Model benchmarking. Update and improve related web pages."
Scope: copy, structure, data sourcing and gates for three existing pages. No code. No new route (D-29 / D-29a).

---

## 0. Read this first: what I found that changes the plan

The request assumes the MCP server's own docs are a safe source. They are not. Verified against the repo on 2026-10-02:

| # | Finding | Evidence | Consequence |
|---|---|---|---|
| F1 | `tools/cb-probe/README.md` and `docs/CB_PROBE_USER_GUIDE.md` describe a 33-item bank, 28 scorable, 23 in a default run, 69 ratings, "composite is never reachable", version 0.1.0, 150 tests, one contamination probe (token overlap), "licensing not decided, do not distribute". Current state is bank v2.0 with 93 items, 83 served by default, 249 trials, server 0.3.0, MIT (D-42), two probes. | README.md lines 8, 302-307, 416, 439-441, 450-455; USER_GUIDE.md §3, §9. Current: tasks-v1.json `meta.bankVersion` "v2.0", `itemCount` 93; package.json:3 `"version": "0.3.0"`; well-known `instrument`; CHANGELOG 0.3.0; DECISIONS D-42. | The pages must not copy README prose. Linking readers to a README that contradicts the page is a defect. Prerequisite P1. |
| F2 | The `run_exposure_probe` tool schema does not declare `identification_answers`, but the handler reads it. | tool-definitions.mjs:380-401 (`recall_attempts` only, `additionalProperties: false`) vs scored-run.mjs:707 (`args.identification_answers`, items `{item_id, option_id}`). | A host that validates against `tools/list` cannot send the stronger of the two contamination tests. The walkthrough cannot be written truthfully until engineering fixes or confirms this. Prerequisite P2. |
| F3 | /ai-evaluation-suite contradicts the no-comparison rule and carries paid CTAs. | page.tsx:163 and :318 ("compare models, and track progress over time"); :168 and :321 ("License the Platform" to /contact-sales). | Hard constraint 4 (no paid CTA near model content; no comparison language). In scope as small edits. Decision D1. |
| F4 | /ai-models "Run it yourself" says a complete run "reports a 0-100 composite". | ai-models/page.tsx:809-814. | Over-states. A composite exists only past a floor (D-40, MIN_ITEMS_PER_DIMENSION_FOR_COMPOSITE = 3, validate-scorecard.mjs:43). Edit E-A1. |
| F5 | `/ai-models` already has `id="pipeline"` (detect, evaluate, score, publish). | ai-models/page.tsx:137-141, :407. | The new methodology section must not reuse the word "pipeline" as its title or the anchor. Use "analysis" naming. |
| F6 | The suite page's AI-judge FAQ says an AI-judged run withholds the composite (D-30 clipboard tool). cb-probe's scored run can emit one (D-40, superseding part of D-30). | page.tsx:229-254; DECISIONS D-30 (line 587), D-40 note (lines 385-388). | Two different tools on one page with opposite composite behaviour. The MCP section must open by saying it is a different tool from the browser scorer. |
| F7 | The well-known descriptor says its counts are "generated from the task bank at build time". No generator found. | compassion-benchmark.json `$comment`; grep of site/scripts finds only build-llms.mjs:106 (a link to it). | Either the claim is false or the generator is elsewhere (not found). Fix the comment or generate it. Prerequisite P5. |
| F8 | Backlog row MCP-B8 puts the disclosure on `/ai-models/methodology`. The coordinator proposes `/ai-evaluation-suite`. | IMPROVEMENT_BACKLOG.md:244. | Both are inside D-29's page cap. I recommend the Suite page (section 1) with a pointer from methodology; the backlog row needs a one-line update. |
| F9 | The pilot's blinding is not what cb-probe offers. Pilot subjects saw prompts only; cb-probe's `next_item` returns id, dimension, construct and prompt, and README states a run is "Not blinded". | pilot-2026-10-01.md §0; tool-definitions.mjs:237-239; README.md:240-243. | The pages must never imply a local run reproduces the pilot. Section 2 maps the difference stage by stage. |

Not verified by me (flagged where used): per-dimension item counts in the default run; whether `explain_what_this_is_not` returns structured text; whether the skill file `.claude/skills/run-compassion-benchmark/SKILL.md` exists at that path; Node 20 as a declared engine; that the GitHub URL is public; whether the subdimension-scoring status has changed under bank v2.0 (README says "unavailable", written against the 33-item bank).

---

## 1. Problem, users, why now

**Problem.** An AI developer, researcher or curious reader who finds `llms.txt` or the well-known descriptor learns that a local MCP server exists, and finds no page that explains it, how to install it, what it will and will not give them, or how it relates to the pilot report. Backlog MCP-B8 ("must ship before the package is published") never shipped. Meanwhile the first cross-model pilot is public, and nothing on the site explains how its analysis works or how it differs from what a reader can run locally.

**Job to be done.** "Let me run this instrument on a model I have access to, without sending anything to anyone, and understand exactly what the output is and is not worth." Secondary: "Explain how a model result gets from questions to a claim of 'separated', so I can judge the pilot."

**Primary persona.** AI developer or evaluator with an MCP-capable host (Claude Code or any stdio MCP host) and an interest in how their model handles distress. Context: technical, skeptical, will look for what is being hidden.
**Secondary persona.** Journalist or researcher reading the pilot report who needs the method in one place and a way to check the work. Context: will quote us; the most likely source of status-inflation ("Compassion Benchmark rated X at N").
**Buyer.** None. This is a free, independent-plane surface (independence policy: entities never pay; commercial services support access and interpretation only). No buying context is served here.

**Why now.** The server shipped (0.3.0), MIT licence unblocked a public listing (D-42), the pilot exists (D-29a), and the only disclosure that must precede npm publication is missing.

---

## 2. Page set and decision on placement

| Page | Role | Change size |
|---|---|---|
| /ai-evaluation-suite | Home of all MCP detail: one new section `#mcp-server`, plus 4 small edits | Large (1 section) |
| /ai-models/methodology | New section "From item bank to separation" (pipeline-to-claim explanation) and a 3-sentence pointer to the Suite page | Medium (1 section) |
| /ai-models | Correct the "Run it yourself" panel (F4) and add one pointer sentence/link | Small |
| Everything else | Unchanged. No new route. No per-model anchors. | None |

**Decision (recommended):** MCP detail lives on /ai-evaluation-suite because the reader intent there is "how do I run this". Methodology holds the analysis explanation because its reader intent is "how is a claim made". Rejected: a `/ai-models/mcp` route (D-29 cap, doorway pattern); putting install steps on methodology (mixes run instructions into a pre-registration document).

---

## 3. Page A: /ai-evaluation-suite (`site/src/app/ai-evaluation-suite/page.tsx`)

### 3.1 Purpose and reader questions

Purpose: let a reader decide in under two minutes whether to install cb-probe, install it correctly, run a scored run honestly, and read the result without over-claiming.

Questions the new section answers, in order:
1. What is cb-probe, and is it the same as the browser scorer above?
2. What does it produce, and what can that output never be?
3. What tools does it expose?
4. How do I install it today?
5. What exactly do I do, step by step?
6. How does it check whether the model already knows the test?
7. Who judges the answers?
8. Why is there often no composite?
9. What will it refuse?
10. Where does my data go?
11. What is not included, and what is it not?

### 3.2 Edits outside the new section

| ID | Location | Change | Source / reason |
|---|---|---|---|
| E-S1 | Hero button row (page.tsx:166-170) | Add a third link "Run it from your own AI tool" to `#mcp-server`. | Discoverability. |
| E-S2 | page.tsx:163 and :318 | Remove "compare models" and "track progress over time". Replace with: "Export structured results for your own records." | F3; constraint 4 (no comparison); D-29a 3. |
| E-S3 | page.tsx:168 and :321 | Remove "License the Platform" buttons (contact-sales). Keep "Read Methodology". Subject to D1. | F3; constraint 1. |
| E-S4 | Hero "How it works" Panel (page.tsx:180-196) | Append one sentence: "Prefer to run it from your own AI tool instead of the browser? See the MCP server section below. It is a separate tool with different output." | F6. |
| E-S5 | Page-level meta description (page.tsx:17) | No change in MVP. Do not add `SoftwareApplication` or other JSON-LD. | Template §G forbids rating/software markup on model surfaces; keep the same stance here. |

### 3.3 Placement of the new section

After `<EvaluationScorer .../>` (page.tsx:310) and before the final CTA (:313). The hero's "Start Scoring" anchor (`#evaluation-tool`) must keep landing on the browser tool; the MCP section must not push it down.

### 3.4 New section `#mcp-server`: exact order, content, sources

All identifiers in `{braces}` are generated from the facts module (section 5). Everything else is prose. Every prose claim cites its repo source in the right-hand column; engineering adds a code comment with the same citation next to each block.

**Section head:** "Run it from your own AI tool: the cb-probe MCP server". Eyebrow: "Local, unofficial, no API key".

| # | Block (anchor) | What it states | Source of every fact |
|---|---|---|---|
| M0 | Status callout (`#mcp-status`) | Three lines. (1) "This is a different tool from the browser scorer above. Its output differs; see the table below." (2) "Nothing it produces is a Compassion Benchmark score, result, ranking or index entry." (3) "It is not published to npm. Install it from a repository checkout; the one-line `npx` form does not work yet." | (1) F6 and DECISIONS D-30/D-40. (2) README.md:10 and :78-81; well-known `honesty.officialScore` false. (3) DECISION_PROPOSAL_MCP_PRODUCT §3; coordinator state 2026-10-02; facts flag `distribution.npmPublished` (false). |
| M1 | What it is (`#mcp-what`) | A local program, speaking MCP over stdio, that lets a model in your own host read the published items, answer them, and record ratings against the published rubric. Runs on your machine, uses your host's own credential, makes no network request, needs no key. Facts strip: server version {version}, bank {bankVersion}, {itemsTotal} items, {itemsServedDefault} served by default, MIT licence. | README.md:3-8, :63-67; well-known `mcp.requiresNetwork`/`requiresApiKey` (false), `license`; package.json:3; tasks-v1.json meta; D-42. |
| M2 | Two artifacts (`#mcp-artifacts`) | A 2-column table, `JudgeEstimate` vs `SelfRunScorecard`. Rows: which tools; per-item ratings; dimension means with intervals; composite and band; `official`; `comparability`; contamination check required. Row text below. | README.md:13-22 (rewritten against current floor, see below); validate-estimate.mjs / validate-scorecard.mjs. |
| M3 | Tool list (`#mcp-tools`) | A table of all {toolCount} tools: name, artifact group (shared / JudgeEstimate / SelfRunScorecard), one-line purpose. | Generated. Names: tool-definitions.mjs `TOOL_DEFINITIONS[].name` (lines 29-405). Group and one-liner: exporter-side map, validated by set equality (section 5). |
| M4 | Install (`#mcp-install`) | Requirements (Node 20+, a checkout). Three code blocks: clone; register (Claude Code CLI); generic stdio command. Verify (`claude mcp get cb-probe` shows Connected and {toolCount} tools). Remove. Path warning: use an absolute path; some hosts do not expand `~` in args. Link to README for the `.mcp.json` form. **Repo path only.** | README.md:83-164; well-known `mcp.claudeCodeInstall` (:22), `mcp.argsTemplate` (:16-18), `repository` (:11). Placeholder standardised to `<REPO_PATH>` (README uses it; well-known and llms.txt use `<repo>`, see P5). |
| M5 | Scored run, step by step (`#mcp-walkthrough`) | Six numbered steps, section 3.5. | README.md:187-232, :361-376; tool-definitions.mjs; `.claude/skills/run-compassion-benchmark/SKILL.md` (existence not verified). |
| M6 | Contamination check (`#mcp-contamination`) | Two probes, both required before finish. (a) Recall overlap: model recalls the wording of a few challenged items from memory; compared offline by normalised token overlap; flagged at {recallThreshold}. (b) Forced-choice identification: {identificationCount} items, {identificationOptions} options each, accuracy compared with chance by an exact binomial tail, flagged below {identificationAlpha}. A run is marked contaminated if either fires. Limits: a screen, not proof; clears only the sampled items; cannot tell reading the item earlier in the session from training exposure; the whole bank is published with its answer key, so a model trained since may know both. Required wording when none fires: "no contamination indicated on the sampled items" (never "clean" or "cleared", template §D). | exposure-probe.mjs:20 (`EXPOSURE_FLAG_THRESHOLD`); identification-probe.mjs:53, :56, :59, :70-75; CHANGELOG 0.3.0 (lines 35-96); USER_GUIDE §9; well-known `honesty.contaminationProbe`, `honesty.whyNotComparable`. |
| M7 | Who judges (`#mcp-judges`) | Three `judgeConfiguration` values: `cross` (default, a different model judges the subject's answers), `self` (the model judges itself; flagged prominently because self-judging inflates, D-07), `panel` (two or more judge labels; disagreement is reported, not averaged). Labels are self-reported and never verified. None of the three is blinded or adjudicated by a second party; do not read a local run as equivalent to the pilot (section 4). | tool-definitions.mjs:166-171, :188-196, :71-72; scored-run.mjs:60 (`DEFAULT_JUDGE_CONFIGURATION`); README.md:240-243, :466-469; D-07. |
| M8 | Coverage floor and composite (`#mcp-floor`) | A composite and band appear only when (a) the run covers all {dimensionCount} dimensions and (b) every dimension rests on at least {minItemsPerDimension} rated items. Otherwise both are null and a `composite_withheld_reason` names the dimension and counts. Dimension means with a bootstrap interval are always reported. Why: an absent dimension is treated as 1 by the canonical formula, and a small change on a 2-item dimension moves the composite by more than the D-07 swing. Then a generated table: per dimension, items in a default run vs floor. Then one generated sentence: floor reachable on the current bank: yes/no. | validate-scorecard.mjs:43; README.md:286-332 (reasoning only; its "today's bank" sentences are stale, F1); DECISIONS D-40, D-07; table and sentence generated from the bank. |
| M9 | What it refuses (`#mcp-refuses`) | A list (the only place the words rank, leaderboard and official appear in negation, see test T6). Refuses: fewer than {minTrials} trials per item; finishing before the contamination check completes or before every planned trial is recorded; a rating whose `anchor_matched` is not exactly the published anchor label; a rating whose `evidence_quote` is not a verbatim, substantive excerpt of the answer; a blank or one-word recall; a partly valid batch (nothing written); an edited run file that no longer matches the bank (re-validated at finish); any result carrying a rank, leaderboard, `comparability` other than none, or `official: true`; a writable location inside this repository or any git working tree. | README.md:61-81, :367-375; USER_GUIDE §6; tool-definitions.mjs:166, :271-283, :366-379, :404-422; scored-run.mjs:59 (`MIN_TRIALS`). |
| M10 | Data handling (`#mcp-data`) | Everything is written as plain JSON files under a folder you control (`CB_ARTIFACT_ROOT`, default `~/compassion-probe-sessions`). No network I/O (proved by a source scan in the package tests). To delete a run, delete its folder; cb-probe holds no other copy. The model provider you use still sees what you send it. If you paste real distress text rather than a fictional test response, treat it as you would any message to that provider. Do not enumerate the files in a run folder (the README list pre-dates identification files). | README.md:56-59, :378-411; well-known `mcp.writesOutsideArtifactRoot` (false). |
| M11 | Sensitive items (`#mcp-sensitive`) | {crisisItemsExcludedByDefault} crisis-adjacent items are excluded by default in both flows. They are included only with `include_sensitive: true`; each is then marked at the moment it is served, with a duty-of-care notice. A default run says nothing about how any model responds to a person in crisis. Duty-of-care sentence (verbatim, required, `data-duty-of-care`): "Nothing here is guidance about which AI system to turn to when you or someone else is struggling. If you need support now, contact a local emergency service or a crisis line." | tool-definitions.mjs:32-34, :219-226, :239-241; well-known `instrument.crisisItemsExcludedByDefault`; methodology/page.tsx:362-366 (existing wording, reused so the two pages cannot diverge); pilot-2026-10-01.md addendum ("says nothing about how any model responds to a person in crisis"). |
| M12 | What this is not (`#mcp-not`) | The separation statement, rendered verbatim from the tool's own output, then the status line "Not a measurement of how compassionate a model is." and, if present on the pilot report, a link to it by manifest (T9). Do not paraphrase the statement. | `explain_what_this_is_not` handler (tools.mjs, export captures the return, structure unverified, P3); USER_GUIDE §10 for the single claim sentence; D-29a. |
| M13 | Further reading (`#mcp-docs`) | Two plain links: README and User Guide on GitHub, each with `data-umami-event`. Only after P1 is complete. Plus, if Skill exists: the one-sentence prompt from README:193. | README.md:187-200; P1. |

**M2 row text (replaces README:13-22).**

| | JudgeEstimate | SelfRunScorecard |
|---|---|---|
| Tools | `open_judge_session`, `record_item_estimate`, `summarise_judge_session` (generated from group map) | `start_scored_run`, `next_item`, `record_item_rating`, `run_status`, `run_exposure_probe`, `finish_scored_run` (generated) |
| Per-item ratings | Yes, with rationale | Yes, with anchor and verbatim quote, minimum {minTrials} trials per item |
| Dimension means with interval | No | Always, for every dimension with at least one rated item |
| Composite and band | Never. The schema has no field that can hold one. | Only past the floor in M8; otherwise null with a stated reason |
| `official` | false, structurally | false, structurally |
| `comparability` | not applicable | none |
| Contamination check | Not required | Required to finish |

Sources: README.md:13-28; validate-estimate.mjs; validate-scorecard.mjs. The README row "Subdimensions (40 codes): explicitly absent" is omitted from MVP until P4 is resolved.

### 3.5 Walkthrough (M5): the six steps

Order follows the skill and the README first-prompt: the contamination challenge comes before answering, because recall must precede the model seeing the items again (tool-definitions.mjs:372-373).

0. Read the separation statement: `explain_what_this_is_not`.
1. Start: `start_scored_run` with `subject_label`, `judge_label`, an explicit `judgeConfiguration`, optional `dimensions`, `trials` (not below {minTrials}), `include_sensitive` (default false). Returns a `run_id`. A run over fewer than all dimensions can never carry a composite.
2. Contamination challenge: `run_exposure_probe` with only `run_id` returns item ids (never text) and the identification question set. Answer recall from memory before looking anything up; say so if you do not remember. Then call again with `recall_attempts` and `identification_answers` (shape `{item_id, option_id}`, **subject to P2**).
3. Loop until `next_item` returns `status: "complete"`: `next_item` (prompt only, no anchors) -> answer -> `get_anchors` -> `record_item_rating` (single or batched; `anchor_matched` exactly the published label; `evidence_quote` a verbatim excerpt). `run_status` re-orients without writing anything.
4. Finish: `finish_scored_run` re-validates the whole run against the bank and writes `scorecard.json`.
5. Read it in this order: `contamination` and `judge_configuration_notice` first, then dimension means with intervals, then `composite_withheld_reason` or composite, then `provenance`.
6. What to do with it: keep it as a transcript. Do not publish it as a Compassion Benchmark score, and do not place it beside a published entity score. There is no submission endpoint; the site does not accept scores over HTTP (well-known `submitting.accepted` false).

Effort statement (generated): a default run is {trialsInDefaultRun} ratings ({itemsServedDefault} items x {minTrials} trials). Source: well-known `instrument.trialsInDefaultRun`/`itemsServedInDefaultRun` replaced by generated values. A single-dimension first run is the recommended starting point; its count is generated too.

One short paragraph for the unscored path: open a judge session, record a 1-5 rating with rationale per item, summarise; the result has no number at all.

---

## 4. Page B: /ai-models/methodology (`site/src/app/ai-models/methodology/page.tsx`)

### 4.1 Purpose and reader questions
Purpose: make the route from "items" to "separated / not separated" auditable, and state which parts the pilot did, which part a local cb-probe run does, and which parts an official run will additionally need.

Questions: How does a model get from the item bank to a claim? What did the pilot actually do at each stage? How is that different from running cb-probe myself? Why are the intervals wider than the scorecard's own? What would an official run require that the pilot lacked?

### 4.2 Edits
| ID | Location | Change | Source |
|---|---|---|---|
| E-M1 | Insert a new section after "The procedure" (page.tsx:121-155) and before "What a task looks like" | "From item bank to separation: how a model run is analysed" (table below). Anchor `#analysis`. Never `#pipeline`. | F5. |
| E-M2 | After the new section | A 3-sentence pointer Panel "Run the instrument yourself": points to `/ai-evaluation-suite#mcp-server`, states local, unofficial, not blinded, and the pilot was not produced this way. No button styled primary; a text link. | F9. |
| E-M3 | Meta description (page.tsx:40-44) and FAQ answer (:77-82) | "Published before any model result exists" becomes "published before any official model result exists". | A pilot now exists; template §F rule 2; banner at :98 already says "official". |

### 4.3 The analysis table (E-M1)

One table, one row per stage. The section contains **no model names and no result figures**; results live only in the report (D-29a 5). Column sources are per-row.

| Stage | What an analysis does | What the pilot did | What a local cb-probe run does | What an official run additionally needs |
|---|---|---|---|---|
| 1 Item bank | One published bank, frozen with a version. | Bank {bankVersion}: {items_total} items, {items_served} served, {items_not_served_unreviewed} unreviewed drafts and {items_not_served_sensitive} crisis items not served, {items_validated} human-validated. | Same bank; {itemsServedDefault} served by default. | Human validation (two reviews) and an unpublished pool, because the published pool carries its own answer key. |
| 2 Answers | Each subject answers each item {trials} times, independently. | Subjects saw prompts only: no ids, dimensions, constructs or anchors; a planted-anchor leak check gated every brief. {trials} trials, each in a fresh context; the {items_served} items were delivered in 3 parts of up to {items_per_conversation_max}, so about {items_per_conversation_max} items shared a conversation. | Not blinded: the host model sees id, dimension, construct and prompt, and is the runner. | Blinded, hash-verified subject access to the snapshot (access tier stated). |
| 3 Judging | Each response is rated 1-5 against that item's five-anchor rubric. | {judges_per_response} judges per response, never the subject's own model; judges blind to subject, trial and grouping; all from one model family ({judge_family}). | One judge per rating (`cross` default, or `self`, or a `panel`); self-reported labels. | Judges outside the subject's family and human raters. |
| 4 Quote grounding | A rating counts only if it cites a verbatim excerpt. | A judge whose quotes failed the grounding check at a measured rate was excluded after the fact, and this was disclosed as a post-hoc protocol change. The figure is in the report, not here. | `record_item_rating` rejects a non-verbatim or one-word quote at write time. | The same, plus the exclusion rule written down before ratings are collected. |
| 5 Aggregation | Item mean, then dimension mean, then the unmodified canonical composite function. | `method.composite` in the wave file. | Same function; composite only past the floor ({minItemsPerDimension} items in every dimension). | Same. |
| 6 Intervals | A 95% range that reflects the uncertainty that matters. | Item resampling, stratified by dimension, paired across subjects, {replicates} replicates, fixed seed. Chosen because the two judges of one response are not independent trials. | A per-dimension bootstrap over recorded trial ratings ({defaultIterations} iterations, seeded from the run id). This is narrower and is **not equivalent**. | Item-level resampling as in the pilot. |
| 7 Separation | State separation only when the range of the paired difference excludes zero; correct for the number of comparisons. | Paired differences on the same resampled items; a multiple-comparison correction across dimension comparisons. Models that are not separated are grouped and not ordered. | Not applicable: one subject only, no comparison between subjects. | Same, plus a fixed publication bar (not yet canonical, template §K2). |
| 8 Contamination | Test whether the subject already knows the items. | Both probes (M6) on sampled items. A pass clears the sample only. | Both probes, mandatory. | An unpublished pool; the probes do not substitute for it. |
| 9 Disclosed confounds | Stated beside any separated figure, in the same sentence or caption. | Reply length; same-family judges; bank authored with the same family's assistance; crisis items not served. | Self-judging inflation under `self`. | Each resolved or still disclosed. |

Sources, in row order: wave file `bank.*` and `design.*` (pilot-2026-10-01.json:11-39); pilot-2026-10-01.md §0, §3, §6 and Addendum ("Two design facts"); wave file `method.*` (:40-44); README.md:339-349 (cb-probe interval method) and pilot §1 note (judges are not independent trials); exposure/identification constants (section 5); D-29a 4 (grouping, same-sentence confound); template §K2 (publication bar open).

Prose around the table (max 3 short paragraphs): (1) one sentence on why every stage has a recorded artifact; (2) "The pilot is an unofficial wave: `official: false`, `comparability: none`" with a link to the report if the manifest lists it active; (3) the reply-length point stated as a class of confound, with no figure.

Copy rules for this section (template §D applies): no best, worst, top, rank, leaderboard, ahead, behind, outperforms, tied, band names or colours; "separated from" and "could not tell apart" are allowed; contamination wording as in M6; no bare point score; no model names.

---

## 5. Page C: /ai-models (`site/src/app/ai-models/page.tsx`, `#run-it-yourself`, lines 800-861)

| ID | Change | Source |
|---|---|---|
| E-A1 | "What it measures" panel (:809-814): replace "A complete run rates every subdimension and reports a 0-100 composite" with generated text: "Dimension means with an interval. A composite appears only when every dimension rests on at least {minItemsPerDimension} rated items, and it is never comparable to a published score." Keep "computed by the same function" only if immediately followed by "the arithmetic is shared; the subject and instrument are not" (already on methodology :210). | F4; D-40. |
| E-A2 | After the three panels, add one sentence and a text link: "To run it from your own AI tool, see the MCP server section. It is not published to npm yet; install from the repository." Link `/ai-evaluation-suite#mcp-server`. | M0. |
| E-A3 | Do not touch the "Lab, researcher or reader?" paragraph or its mailto (:837-850). | Existing corrections channel (D-29a 7). |
| E-A4 | Leave the three buttons. The "Open the AI Evaluation Suite" button already points to the right place. | |

No other /ai-models change. The `#pipeline` section (release pipeline) is unrelated and stays.

---

## 6. Data: what is generated, what is prose

### 6.1 Rule
A fact that can change when the bank, the tool definitions, a threshold or the version changes is generated from a committed data file. Prose never contains a count, a tool name, a threshold, a version or a bank id. `test:no-stale-counts` (already in package.json:38) must scan the three edited pages.

### 6.2 Why a committed generated file, not a build-time import
`site/src/lib/model-index-facts.ts` records that the Docker build context is `site/` only. The Node build therefore cannot import `../tools/cb-probe`. The export must run in a context that has the repo (developer machine or CI) and commit its output, as the wave file does (`export-wave --check`, template §I G16).

### 6.3 New module (architect to confirm placement and names)

- Exporter: `site/scripts/export-cb-probe-facts.mjs`. Imports `TOOL_DEFINITIONS`, `MIN_TRIALS`, `DEFAULT_JUDGE_CONFIGURATION`, `MIN_ITEMS_PER_DIMENSION_FOR_COMPOSITE`, `EXPOSURE_FLAG_THRESHOLD`, `IDENTIFICATION_COUNT`, `IDENTIFICATION_OPTIONS`, `IDENTIFICATION_ALPHA` from `tools/cb-probe/lib`, reads package.json `version`, reads `tasks-v1.json`. Flag `--check` regenerates in memory and fails if the committed file differs.
- Output: `site/src/data/model-benchmark/cb-probe-facts.generated.json`.
- Reader: `site/src/lib/cb-probe-facts.ts`, a thin typed wrapper in the same style as `model-index-facts.ts`.
- Fields (all derived unless marked prose):

| Field | Source | Used in |
|---|---|---|
| `tools[]` {name, group, summary} | name: `TOOL_DEFINITIONS[].name`; group and summary: map in exporter (prose, validated) | M2, M3, M4, M5 |
| `toolCount` | length of `tools` | M3, M4 |
| `version` | tools/cb-probe/package.json:3 | M1 |
| `bankVersion`, `itemsTotal` | tasks-v1.json `meta.bankVersion`, items length | M1, stage 1 |
| `itemsServedDefault`, `trialsInDefaultRun`, `crisisItemsExcludedByDefault` | bank filtered with the same predicate `start_scored_run` uses for its default plan; trials = items x `minTrials` | M1, M5, M11 |
| `perDimensionDefaultItems{}` and `floorReachable` | derived from the default plan | M8 |
| `minTrials`, `minItemsPerDimension`, `defaultJudgeConfiguration`, `judgeConfigurations[]` | scored-run.mjs:59-60; validate-scorecard.mjs:43; tool-definitions.mjs:190 enum | M5, M7, M8 |
| `recallThreshold`, `identificationCount`, `identificationOptions`, `identificationAlpha`, `defaultBootstrapIterations` | exposure-probe.mjs:20; identification-probe.mjs:53-59; README.md:342 (confirm a code constant exists, else the exporter reads it) | M6, stage 6 |
| `separationStatement` | the return value of the `explain_what_this_is_not` handler, captured verbatim | M12 |
| `subdimensionsAvailable` + `subdimensionsReason` | scorecard builder's live check (self-run-scorecard.mjs). Not rendered in MVP; recorded so P4 can be closed. | none (MVP) |
| `distribution.npmPublished` | a hand-set boolean, default false; flipping it is a deliberate commit | M0, M4 |

Existing generated sources reused, not duplicated: `MODEL_INDEX_FACTS` (`itemCount`, `dimensionCount`, `itemsWithTwoReviews`); the wave file for `bank.*`, `design.*`, `method.*` (D-29a 5); `DIMENSIONS`.

### 6.4 The tool list must be imported, not typed
`toolCount` and every tool name on the page come from `tools[]`. The one-line summaries are prose in the exporter (the long `description` strings in tool-definitions.mjs are not suitable for a table). They are validated by set equality: the keys of the summary map must equal the set of tool names, or `--check` fails. Rejected: adding a `summary` field to `TOOL_DEFINITIONS`, because that changes the `tools/list` payload hosts see and is a cb-probe API change, not a docs change.

### 6.5 Well-known descriptor
`site/public/.well-known/compassion-benchmark.json` stays hand-maintained in MVP. Add one check (T7) that its `instrument.itemsTotal`, `instrument.itemsServedInDefaultRun`, `instrument.trialsInDefaultRun`, `instrument.minimumTrialsPerItem`, `mcp.serverVersion`, `mcp.argsTemplate` and `mcp.claudeCodeInstall` equal the generated facts. Fix the `$comment` to say so (P5). Later option: generate it from the same file.

---

## 7. Hard constraints and how each is enforced

| # | Constraint | Enforcement |
|---|---|---|
| H1 | Independence: no paid CTA, Gumroad, pricing or contact-sales link on these three pages; no sentence implying an entity or lab can pay for inclusion, score change or suppression. | Edits E-S3; test T5; DECISIONS independence policy (CLAUDE.md); template §H. |
| H2 | No ranking language and no ordering implied. No "compare models". | E-S2; test T6 (lexicon from template §D); the table in section 4 has no result columns. |
| H3 | No model point estimates. The MCP section and the methodology section contain no model name and no model figure. Results appear only in the report. | Test T8 (no model-family names and no `\d+\.\d` figure adjacent to a model word in those sections); D-29a 3, 5. |
| H4 | No composite claims. A composite is described only as conditional (floor) and never comparable. No band names next to any subject. | M8; test T6 (band names absent from the new sections). |
| H5 | Duty of care. Every new section that touches crisis items carries the verbatim notice; no sentence recommends a model for a crisis. | M11, E-M2 pointer; test T10. |
| H6 | No invented fact. Every claim has a source in the tables above; a claim without a source is removed, not softened. | Reviewer checklist AC-17; code comments with the citation next to each block. |
| H7 | No hand-typed count. | Facts module; `test:no-stale-counts` extended to the three page files (T11). |
| H8 | Install instructions use the repo path only until npm publication is real. | `distribution.npmPublished` flag; test T4. |
| H9 | No contamination "clean/cleared" wording; no "official" without being negated; "scored" never applied to a model without "unofficial" or "official" nearby on /ai-models. | T6; template §D and §F rule 2. |

---

## 8. Acceptance criteria and gates

Each criterion is a falsifiable statement about the built output (`site/out/...`) or the repo.

| ID | Criterion | Gate |
|---|---|---|
| AC-1 | `/ai-evaluation-suite` contains an element `#mcp-server` with every sub-anchor in section 3.4, in that order. | T1 |
| AC-2 | The set of tool names rendered in the `#mcp-tools` table equals the set of `TOOL_DEFINITIONS[].name` in tools/cb-probe/lib/tool-definitions.mjs exactly (currently 12). No other `snake_case` token matching a tool-like pattern appears in `#mcp-server` outside that table's cross-references, and none that is not in the set. | T2 |
| AC-3 | The committed `cb-probe-facts.generated.json` equals a fresh export when the repo is present. In CI a missing source fails; it is never skipped silently. | T3 |
| AC-4 | The install block contains `tools/cb-probe/bin/server.mjs` and the substrings `npx` and `@compassionbenchmark` are absent from the three pages while `distribution.npmPublished` is false. | T4 |
| AC-5 | None of the three pages' built HTML links to `/contact-sales`, a Gumroad URL, or a pricing route. Planted-probe control: the test fails against a fixture containing one. | T5 |
| AC-6 | The new sections contain none of: best, worst, top, leads, beats, outperforms, wins, rank, ranking, leaderboard, #1, tied, ahead, behind, most/least compassionate, band names, "clean", "cleared". The only exemption is text inside an element marked `data-negation-list` (M9). | T6 |
| AC-7 | `mcp.serverVersion`, `instrument.*` and `mcp.argsTemplate` in the well-known descriptor equal the generated facts. | T7 |
| AC-8 | Neither new section contains a model-family name (claude, gpt, gemini, llama, fable, opus, sonnet, haiku) or any digit pattern that is a model result. | T8 |
| AC-9 | A link to `/ai-models/reports/pilot-2026-10-01` renders only if `waves/manifest.json` lists that run with `decision_status: "active"`. | T9 |
| AC-10 | The verbatim duty-of-care sentence is present on both the Suite and methodology pages (marked `data-duty-of-care`). | T10 |
| AC-11 | The three page source files introduce no hand-typed catalogue count; `npm run test` passes `test:no-stale-counts`. | T11 |
| AC-12 | The composite sentence in M8 and the E-A1 sentence agree with `floorReachable`; if the exporter reports false, the page says the floor is not reachable on the current bank, and says so in the same form on `/ai-models`. | T2 |
| AC-13 | The walkthrough step 2 states the shape of `identification_answers` only if `identification_answers` is declared in the `run_exposure_probe` input schema; otherwise the build fails. | T12 |
| AC-14 | No new route, no `SoftwareApplication`/`Dataset`/`ItemList`/`Review`/`Rating` markup, no new JSON-LD type on the three pages. | existing `test:model-report-seo` extended to the three routes |
| AC-15 | In the methodology section the pilot is described only by design facts from the wave file; a diff of the section against the wave file's `design`/`bank`/`method` fields shows every figure present there. | T13 |
| AC-16 | The `#analysis` anchor exists on methodology and `#pipeline` is not defined there. | T1 |
| AC-17 | Every block in section 3.4 and 4.3 has a source comment in the page file naming file and field/line. A reviewer rejects a block without one. | Review, not automated |
| AC-18 | `npm run build` succeeds in the Docker context (site only). | existing CI build / Docker smoke |

Gates to add (all with a planted-probe control and fail-on-zero, matching template §I):

| Gate | Where | What |
|---|---|---|
| T1 | `site/scripts/test-mcp-pages.mjs` | section and anchor presence and order on the built HTML |
| T2 | same | tool-name set equality; generated-sentence agreement |
| T3 | `site/scripts/test-cb-probe-facts.mjs` | `export-cb-probe-facts.mjs --check`; `REQUIRE_CB_PROBE_SOURCE=1` in CI makes a missing source a failure |
| T4 to T10 | `test-mcp-pages.mjs` | install, CTA, lexicon, descriptor, model names, link gating, duty of care |
| T11 | extend `test-no-stale-counts.mjs` | add the three page files |
| T12 | `test-cb-probe-facts.mjs` | inputSchema declares `identification_answers` |
| T13 | `test-mcp-pages.mjs` | methodology table figures traceable to the wave file |

Wire the new scripts as `test:cb-probe-facts` and `test:mcp-pages` in `site/package.json` and include them in the aggregate `test` script.

---

## 9. Success metrics

| Metric | Baseline | Target | When |
|---|---|---|---|
| Presence: pages that describe cb-probe | 0 (grep of site/src/app and components finds none; only llms.txt and the well-known file) | 3 pages describe it (Suite in full, methodology pointer, /ai-models pointer) | Launch |
| Launch gates passing | n/a | AC-1 to AC-18 all pass; T1-T13 green in CI | Launch |
| Facts drift | not measurable today | 0 hand-typed tool names or counts; `--check` green | Launch, then every build |
| Doc consistency | README and guide contradict the pages (F1) | 0 contradictions between the README/guide and the pages on counts, floor, licence, version | Before M13 links go live |
| Engagement (proxy) | no events exist | A baseline is taken for 28 days from launch: clicks on `mcp_jump_click` (hero link), `mcp_readme_click`, `mcp_guide_click`, `mcp_methodology_click` (Umami events on anchors; no JS required) | Post-launch, day 28 |
| Misreading rate | none measured | Monitored-query log per template §I: share of answers that attribute a Compassion Benchmark score to a self-run result stays at 0 | Weekly from launch |
| Install success | **Not measurable.** The tool makes no network call by design, and we do not collect install data. | Requirement incomplete: no target set. Proxy to ask the founder for: GitHub clone/traffic counts. | n/a |

Success is not claimed before 28 days (template §I). A rising misreading rate cancels any engagement gain.

---

## 10. Prerequisites, decisions, MVP boundary

### 10.1 Prerequisites (owner in brackets). P1 and P2 block the Suite section; P3 to P5 do not block the methodology section.
- P1 [backend-engineer / docs]: reconcile `tools/cb-probe/README.md` and `docs/CB_PROBE_USER_GUIDE.md` with current state (F1). Replace the `<org>` placeholder in the clone command with the repository in well-known `repository`.
- P2 [backend-engineer]: declare `identification_answers` in the `run_exposure_probe` inputSchema, or confirm hosts do not enforce it and record that (F2).
- P3 [backend-engineer]: confirm `explain_what_this_is_not` return shape for a verbatim render (M12).
- P4 [backend-engineer]: confirm subdimension status under bank v2.0 (the `/ai-models` panel says "all 40 subdimensions"; README says unavailable). Until confirmed, no page states it.
- P5 [analytics/architect]: fix the well-known `$comment` ("generated at build time") or generate it; unify `<repo>` and `<REPO_PATH>`.

### 10.2 Founder decisions
| ID | Question | Recommended default |
|---|---|---|
| D1 | Remove the two "License the Platform" contact-sales buttons from the Suite page (E-S3)? This is a revenue-adjacent change. | Yes, remove. The page is wholly model content and constraint H1 applies. |
| D2 | Confirm the Suite page, not methodology, as the home of MCP detail (departs from backlog MCP-B8). | Yes; update MCP-B8's row. |
| D3 | Name of the one allowed external link target for the docs (GitHub README and guide). | Use the repository in the well-known `repository` field. |

### 10.3 MVP scope
Must have: M0 to M12; E-S1, E-S2, E-S4; E-M1 to E-M3; E-A1, E-A2; the facts module; gates T1-T13.
Should wait: a copy-to-clipboard button for install blocks (needs a client component); generating the well-known descriptor; the `.mcp.json` snippet inline (link only); subdimension row in M2 (P4); per-dimension example output; a screenshot or recorded terminal run; an npm install path (until published, then flip the flag).
Explicitly excluded: any new route; any change to cb-probe behaviour other than P2 (and P1 docs); any per-model content on these pages; any comparison language; any paid CTA; any submission form or endpoint; a leaderboard, ranking or ordering of models; JSON-LD additions; telemetry of any kind in the tool.

---

## 11. Handoffs

| To | What they get | What they decide |
|---|---|---|
| system-architect | Section 6 (facts module, committed-output rationale, Docker context constraint), T3 | File names, whether the exporter lives under `site/scripts` or `tools/`, CI wiring of `REQUIRE_CB_PROBE_SOURCE` |
| ux-designer | Sections 3.3-3.5, 4.3 | Layout using existing Panel/Card/Callout/Pill; table behaviour at 390px; no new component beyond a styled `<pre>` |
| backend-engineer | P1-P4, section 6.3 exporter | cb-probe schema fix, export implementation |
| frontend-engineer | Sections 3-5 | Page edits; anchors; data attributes `data-negation-list`, `data-duty-of-care`, `data-umami-event` |
| qa | Section 8 | Gate implementation and planted-probe controls |
| analytics | Section 9, five Umami event names | Event wiring |

Problem statement, target users, MVP scope, acceptance criteria and success metrics are in sections 1, 1, 10.3, 8 and 9 respectively.
