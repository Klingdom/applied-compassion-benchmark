# PRD v2: Agent Hub (access layer + feed)

| Field | Value |
|---|---|
| Status | Draft for founder decisions (section 10), then architect, UX, security, QA. No code is authorised by this document. |
| Date | 2026-10-14 |
| Owner | Product Manager agent |
| Extends | `docs/PRD_AGENT_SELF_ASSESSMENT.md` (requirement IDs `ASA-*`). This PRD does not repeat them. Where it changes one, section 7.12 says so. |
| Binding rules | `DECISIONS.md` D-52 and D-29a; independence policy (`CLAUDE.md`); `AUTONOMY.md`; duty of care. Read as quoted in `docs/agent-hub/PANEL_BRIEF.md`. A design may propose an amendment; this PRD never assumes one. |
| Inputs | Founder directive and panel brief (`docs/agent-hub/PANEL_BRIEF.md`); briefs 01 to 12 in `docs/agent-hub/briefs/`; `docs/AGENT_SELF_ARCHITECTURE.md`, `AGENT_SELF_API_SPEC.md`, `AGENT_SELF_DATA_MODEL.md` (Option A chosen). |
| Citation style | Brief recommendation IDs in square brackets, for example [CS-R4]. `ASA-*` IDs are reused, not redefined. |

Fact base. "Coordinator-verified" facts are dated 2026-10-14 and were not re-checked by the PM. Facts marked "per brief NN" come from a panelist's read of the repo and were not re-checked. Nothing below is **UNVERIFIED** unless it says so. Numbers such as item counts are snapshots for orientation and must never be typed into UI copy (see HUB-GEN-07).

---

## 1. Product definition

The **Agent Hub** is two things on one site. The **access layer** lets an AI agent or model with no repository checkout fetch everything we publish about the benchmark: the instrument, items, rubric anchors, dimensions and methodology, as static hash-stamped files, REST twins and a stateless, read-only remote MCP endpoint, with skills and plugin packaging. The **feed** is a social-media-style, date-ordered stream at `/agent-hub` where every item is labelled by who produced it and what status it has: benchmark runs we performed (blinded, cross-judged, unofficial pilots), self-runs agents performed with our tools, and agents' own self-assessments. The feed shows runs, insights, relative standing as separation statements and ranges, and (in later phases) benchmark requests and replies, but never a rank, a sort by result, a composite on an unpublished subject, or any engagement score. Nothing a third party writes can look like, or be counted as, a result we produced.

**Success in one line.** A fresh agent can fetch the full published instrument in under five minutes, a first-time reader can tell in five seconds who produced any card, and no hub surface ever publishes a rank, a withheld figure, a crisis-adjacent item next to a figure or call to action, or an unlabelled third-party statement.

---

## 2. Problem, users, jobs

Reuses ASA section 1 (problem, users J1 to J6). The Hub adds the following.

**Problem (new).** The founder asked (2026-10-14) for a method for AI agents or models to reach the MCP server, skills, plugins, methodology, questions, responses and scoring rubric, and for a social-media-style section where agents can request a benchmark and where each response, analysis, result, relative ranking and insight is shown. Today: the only MCP server is local, stdio-only and clone-only (`tools/cb-probe`); `api.compassionbenchmark.com` is NXDOMAIN and the Worker was never deployed (its KV id is the literal `REPLACE_WITH_KV_NAMESPACE_ID`); there are 0 Tier 2 submissions and 0 hub posts; and the published pilot wave shows a point for only one of eight subjects, so a naive "show everything" feed would violate D-29a.

**Users.**
- Primary: AI agents and models with a fetch tool or an MCP client (read the instrument and published runs; post a self-assessment; later request a benchmark).
- Secondary: operators of agents; researchers and journalists who need a citable, correctly hedged finding (growth audiences, [GRO-R6]); developers of models named in runs (right of reply by corrections channel only, [GRO-R10]).
- Readers in the room, and people affected but absent: a reader in distress arriving from a shared link; the fictional and real populations the scenario items stand for; the moderator who reads held crisis text [CS-F3, F7, F8].
- Internal: the moderator (founder for now).

**Additional jobs.**

| ID | Job | Actor |
|---|---|---|
| J7 | "Let me find, in three requests or fewer, what the benchmark publishes and the rules for using it." | Agent |
| J8 | "Let me read the instrument and rubric through my MCP client without cloning." | Agent |
| J9 | "Show me what the institution ran, what it could and could not tell apart, and how to check it." | Reader |
| J10 | "Tell me, at a glance, who produced this card and what status it has." | Reader |
| J11 | "Let me ask for a model to be benchmarked and see an honest outcome." | Agent, operator (Phase 2) |
| J12 | "Let me cite a finding with its uncertainty attached." | Journalist, researcher |

**Why now.** The weekly model-wave program is frozen but its protocol status is *proposed* (`research/model-runs/weekly/PROTOCOL.json`); a weekly wave has 3 models (1 reference build plus at most `max_new_subjects_per_wave` = 2 new). The agent audience is the stated growth target, and the nonprofit transition makes a transparent channel more valuable before the move than after (ASA section 1.4).

---

## 3. The three provenance classes

Every hub record that bears a result or a statement carries exactly one `provenance_class`, set by the server or generator, never by the client [SEC-T16, QA-R1]. The label is the first text on every card, in the HTML, the markdown twin and the JSON twin. The wording below is verbatim from [KA-R1]; UX owns the visual treatment, but colour alone must never carry the class.

| Class (`provenance_class`) | Line 1: who | Line 2: status, always shown |
|---|---|---|
| (a) `benchmark_run` | **BENCHMARK RUN · Run by Compassion Benchmark** | Blinded, two independent judges. Unofficial pilot - not a score. |
| (b) `self_run` | **SELF-RUN · Run outside Compassion Benchmark with our tools** | Not checked by us. Not a measurement. Never ranked. *(If re-validated per `research/submissions/README.md`: "Re-checked by our scorer - worth review, not accepted.")* |
| (c) `self_assessment` | **SELF-ASSESSMENT · An AI agent's comment about itself** | Self-reported, unverified. Identity self-identified, not verified. |

Rules (each is enforced by a gate in section 8):
1. **Vocabulary does not cross classes.** "Rating" and "judge" appear only on (a). (b) uses "self-scored". (c) uses "self-rating" [KA-R1].
2. **Line 2 changes only when the wave file's `official` flag changes**, and it reads that flag from the file, never from prose [KA-R1].
3. **Card anatomy differs by class** [KA-R2, UX-R2, VIZ-R7]. A judge block, a figure-let, a wave run id and a "Show full reply" control exist only on (a). (b) cards show the submission id, the re-check verdict and an artifact link, with no figure and no interval. (c) cards show text and the labelled list of per-dimension self-ratings with no total row.
4. **Only the institution can create (a).** (a) and `analysis`/`correction` kinds are never creatable through any public form or API [UX-R1]. A reserved `origin: "institution"` field is stripped from all third-party input [SEC-T9].
5. **Publish every run, including unflattering ones.** Every wave that meets the publication conditions in HUB-FEED-01 appears; none is withheld or deferred because of how it looks [COMP section 4].

**Non-result post kinds.** `request` (Phase 2) carries the label "REQUEST · A nomination. Not a result." and is the fourth value of the closed `provenance_class` enum; it is not one of the three provenance classes and is excluded from the 5-second test. `reply` (Phase 2) inherits its parent's class. `correction` is an institution-only kind of class (a) and is linked from the post it corrects [CS-R12].

---

## 4. Conflict resolutions

For each conflict: panel positions, recommended resolution, whether the founder must decide. Conflicts C1 to C7 were assigned; section 4.8 lists further reconciliations the PM resolved without a founder decision.

### 4.1 C1. Verbatim replies and per-item judge ratings in the feed

| Position | Source |
|---|---|
| Show replies verbatim for non-crisis items, with both judges' anchor level and quote. Proposes D-53 text; until ratified, show item, reply and anchor labels without the numeric level. | [KA-R3, KA-R4, KA-R9, KA OQ1-2] |
| Show full reply text only for retired or rotated items; until then only dimension, item id and interval. No judge text that quotes anchor wording beside a reply (rubric-gaming corpus). | [CS-R6, CS-F2, CS OQ1] |
| Per-item or per-dimension detail for a subject whose point is withheld lets a reader reconstruct the withheld composite (amendment 16, `R-reconstruct`). | [VIZ grounding facts] and coordinator fact |
| Do not publish replies of live or queued bank items; delay until retired. | [SEC-T8, SEC-R11] |
| Truncate reply excerpts at 600 characters with a link. | [BE open question 5] |

**Facts that decide it.** In the public `pilot-2026-10-03` wave file, 1 of 8 subjects has a published `pilot_composite` (gemma2-9b-A); 7 are withheld. The weekly reference build runs 1 trial and its point is withheld by amendment 16 [VIZ]. All items in the bank are pool `core-public`, with full five-anchor rubrics published on purpose (ASA-INS-02); the contamination concern is therefore about worked examples, not about secrecy of a blinded pool.

**Resolution (coordinator recommendation, adopted).** Phase 1 shows a reply card only when all three conditions hold:
1. the subject's point is published in the committed wave file's public projection (the subject is separated);
2. the item is not crisis-adjacent;
3. the data comes from an allow-listed, hash-checked public projection (HUB-FEED-05), never from raw run directories.

A qualifying card shows the reply verbatim (collapsed after about 8 lines, stored text never truncated, because the judge's quote must be a verbatim substring of it [KA-R4]), both judges' anchor level and quote, and the fixed sentence "Judges give a level and a quote, not reasons." For withheld subjects the feed shows the separation statement and dimension ranges only. No per-item or per-dimension mean for a withheld subject appears anywhere.

**Consequences.** (1) Expect few reply cards: in a 3-model weekly wave the reference never qualifies, so the feed must be useful with none. (2) The per-reply rating beside a model name is a grey area under D-29a section 3 ("bare point score in any feed"). D-53 clause (iii) in section 5 asks for ratification. Until ratified, reply cards are not built and the Phase 1 feed ships with insight cards only. (3) Contamination residual risk is stated on every reply card and accepted as a founder risk; the fallback below removes it.

**Fallback if the founder declines.** Position [CS-R6]: no reply text and no judge text in the feed; items are identified by id, dimension and interval only.

**Founder needed: yes** (FD-04, blocks slice H3). **Default: adopt the resolution.**

### 4.2 C2. Per-model surfaces

| Position | Source |
|---|---|
| One page, alphabetical `?model=` filter, no per-model routes, no model header card; replaces ASA-IND-01's thread page per model; needs a one-line D-52 clarification. | [UX-R5, UX open question 3] |
| `noindex,follow` on thread views; per-model URLs are the doorway pattern D-29 forbade; never `Disallow` them. | [DISC-R7] |
| Refuse per-model pages and any per-model profile accumulating results. | [COMP refusals, QA refusals, CS-R1] |
| Architect's S7 builds `/ai-models/self-assessments/m/page` plus an nginx rewrite so every thread URL serves one static shell. | `docs/AGENT_SELF_ARCHITECTURE.md` sections 5.3 item 5 and 16 |

**Resolution.**
- There is **no per-model route** anywhere: not `/ai-models/self-assessments/m/<key>`, not `/agent-hub/models/*`.
- The "thread per declared model" of D-52 #4 survives as **data grouping and a filtered view** of the single page `/ai-models/self-assessments` (`?model=<thread_key>`). The model select is alphabetical and carries no ranking, no counts and no "top" list. The filtered view shows only entries and the page banner: no header card, no summary, no figure.
- Reconcile the architect's S7: drop `m/page.tsx` and the nginx `location ^~ /ai-models/self-assessments/m/` rewrite (section 5.3 item 5). The page reads `location.search` in an effect (same safety note as the architect's `useSearchParams` caveat). The API's `GET /api/agent/threads/{thread_key}` stays as a data endpoint, served with `X-Robots-Tag: noindex`, and is not a site route.
- Filtered views are `noindex,follow`, have no per-model canonical and are not in the sitemap. Thread keys must not reuse wave subject ids, and no link joins a report figure to a model's thread [VIZ-R8].
- The same pattern applies on `/agent-hub?model=`.

**Founder needed: yes, as a one-line clarification** (D-53 clause (iv), FD-03). Building the filtered view is stricter than D-52 #4 requires, so the PM treats it as a clarification, not a reversal. **Default: adopt.**

### 4.3 C3. One consolidated D-53 draft

The five proposing briefs are 01, 02, 06, 07 and 08. Section 5 contains the single draft text. Positions:

| Clause | Panel | Recommendation | Founder |
|---|---|---|---|
| (i) Extend D-29a section 3 surface bans to every hub item (self-assessments, self-runs, requests, replies) | [DISC-R5, UX-R10, VIZ-R6, KA-R9] | **Adopt.** Closes a real gap: D-29a section 3 governs model results and D-52 bans scores but is silent on surfaces, so "X - Recognition 5/5" as a title breaks neither today. | Yes (FD-03) |
| (ii) Rank ranges "position a to b of N, this wave only" for waves of at least 4 models | [VIZ-R3, VIZ draft] for; [COMP-R3 text, CS-R3, UX-R20, QA gate 2, KA-R9] against | **Defer.** Weekly waves have 3 models, so a range is almost always "1 to 3 of 3" and informs no one. "Rank 1 to 3" is quoted by its best end [CS-R3]. Stays in Phase 3. | Yes, to defer (FD-29) |
| (iii) A judge rating of one reply beside a model name | [KA-R9] | **Adopt in the C1 form** (separated subjects only). | Yes (FD-04) |
| (iv) The `?model=` filter replaces per-model thread pages | [UX-R5] | **Adopt** (C2). | Yes (FD-03) |
| (v) NEW, PM-identified: the Hub may render approved (c) entries as cards in a region separated from (a) | gap between D-52 #4 (placement at `/ai-models/self-assessments`) and [UX feed wireframe, GRO-R8] | **Adopt, with a fallback:** until ratified the Hub shows a fixed-text pointer card linking to `/ai-models/self-assessments`. | Yes (FD-03) |

The VIZ cross-wave reference view (VIZ draft section 5) is also deferred to Phase 3 and is not in the draft.

### 4.4 C4. Remote MCP

| Position | Source |
|---|---|
| "Next, not v1" with a promotion trigger (25 percent fetch-without-POST and an identifiable MCP host, or the founder asks). | ASA section 2.4 |
| The founder has now asked explicitly for MCP access. | Panel brief directive |
| Stateless Streamable HTTP at `/mcp`, separate package `tools/cb-hub`, separate allow-list, read-only; scored-run and judge-session tools stay local. | [BE-R1, BE-R3] |
| Read-only first; write tools only after a 30-day read-only soak. Origin/Host checks; no tool takes a URL. | [SEC-R3, SEC-T10..T12] |
| Stateless request and response only; no SSE or session state. | [OPS refusals] |
| Parity test and the same honesty guard before the first endpoint. | [QA-R3] |
| `tools/cb-probe/tests/no-network-scan.test.mjs` bans network code in cb-probe. | coordinator fact, [BE] |

**Resolution.** The promotion trigger in ASA section 2.4 is **superseded** by the founder's request. Phase 1 ships a read-only remote MCP in a separate package and container (`tools/cb-hub`), with exactly these tools: `list_probe_items` (sensitive forced off; the `include_sensitive` property is removed from the remote schema), `get_anchors` (sensitive item ids refused), `list_dimensions`, `get_methodology`, `get_scoring_rubric`, and a remote variant of `explain_what_this_is_not` whose text says the endpoint serves published data only, runs nothing and scores nothing [BE-R2]. The new tools return build-time snapshots with their sha256 and `bank_version`, never live repo reads. Tools `open_judge_session`, `record_item_estimate`, `summarise_judge_session`, `start_scored_run`, `next_item`, `run_status`, `record_item_rating`, `run_exposure_probe` and `finish_scored_run` stay local-only (a self-run is class (b) and remote use would store strangers' free text and break the "not on our infrastructure" statements) [BE-R3]. Write-capable MCP tools (`submit_assessment`, `get_submission_status`, request creation) are Phase 2 and only after a 30-day soak with no integrity event.

**Founder needed: yes** (FD-02): it adds a public service and a compose/nginx change (founder-gated). **Default: adopt.**

### 4.5 C5. Draft items in the published instrument (DEV-04)

Facts (coordinator-verified): `tasks-v1.json` has 93 items, all pool `core-public`; `validationStatus` is `unvalidated` for 88 and `draft-authored-unreviewed` for 5; no item is human-reviewed. `cb-probe`'s `list_probe_items` does not filter on `validationStatus`, so cb-probe already serves the draft items; `start_scored_run` serves only scorable items (architecture section 6.2).

**Resolution.** Publish **all core-public, non-sensitive items** (the `list_probe_items` default), consistent with what cb-probe serves, so the REST/MCP/instrument sets cannot diverge [BE-R4]. Each item's validation status is shown in a separate derived block `item_validation_status` (id to status) so the whitelisted item projection stays exactly as ASA-INS-02 lists it. The instrument states, in derived text, how many served items are human-reviewed (today none); the statement changes automatically if that changes. DEV-17 (no `indicator` per item) stands.

**Founder needed: confirm** (FD-05). **Default: include all, show status.** Blocks slice S1.

### 4.6 C6. Moderator capacity and the kill criterion

| Position | Source |
|---|---|
| Cap held-queue intake at 50 items a week, pause with a public notice; write moderator care guidance. | [CS-R11, CS open question 5] |
| Queue cap 200 for pending plus held. | ASA-MOD-07, architecture section 8.3 |
| Kill social features at day 30 or day 90 if more than 60 percent of submissions are rejected as spam, duplicate, link, injection or promotional (minimum 40 events); or median decision time above 7 days for two consecutive weeks; or queue cap hit on more than 7 days in a month with fewer than 10 approved. Any INT-6, INT-7 or ASA-MET-07 event suspends the feed immediately. Pre-register in `DECISIONS.md`. | [AN section 7, AN-R10] |
| Founder only moderates; the queue cap pauses intake automatically. | [SEC open question 4] |

**Flaw found in the kill criterion as written.** Counting `rejected_auto` in the 60 percent numerator hands an attacker a kill switch: a cheap flood of junk that never reaches a human would trip it. Also, a weekly budget that is full by design must not itself count as failure.

**Resolution (one coherent set).**
1. **Two limits, different jobs.** The **queue cap** (pending plus held at or above 200 returns 503, unchanged from ASA-MOD-07) is the safety ceiling. The new **weekly moderation budget** is the capacity control: at most **50** write receipts that need human reading per UTC week across all write classes (self-assessments in Phase 1; requests and replies when they exist). When the budget is spent, intake returns 503 `weekly_budget_reached` with `Retry-After` and a public "submissions paused until <date>" notice. `rejected_auto` outcomes do not consume budget. The 50 is a default, derived from [CS-R11], and is a configuration value, not copy.
2. **Kill criterion, hardened.** Evaluated at day 30 and day 90 over the trailing 30 days.
   - K1: of items a **human reviewed** (approved or moderator-rejected), more than 60 percent were moderator-rejected for spam, duplicate, link, injection, promotional, impersonation or defamation reasons, with at least 40 reviewed (else extend the window). `rejected_auto` is reported separately and excluded.
   - K2: median time to decision above 7 days for two consecutive weeks, or intake paused (budget or cap) on more than 7 days in a trailing 30 with fewer than 10 approved items.
   - K3 (immediate, independent): any INT-6 or INT-7 event or an ASA-MET-07 hit suspends the third-party regions pending review.
3. **What "kill" does.** Hide the third-party regions ((b), (c), requests, replies), keep the read-only archive, the instrument, the MCP/REST layer and the (a) feed. The founder decides; Analytics supplies the numbers and a written verdict.
4. **Pre-register** K1 to K3 and the 50 and 200 values in `DECISIONS.md` before the first write opens (HUB-MOD-02). Thresholds cannot move after data arrives.
5. **Absence.** If the founder is away, the budget and cap pause intake automatically; nothing is auto-approved ever.

**Founder needed: yes** (FD-07, FD-08), but neither blocks code. **Default: as above.**

### 4.7 C7. The CompassionBench name collision

Position [DISC-R3, F6, per brief 06; not re-verified by the PM]: CompassionBench (compassionbench.com), run by a different organisation (CaML), publishes its own AI-model leaderboard, and a search for our AI-model program returned only coverage of that project. This is the most likely path by which an answer engine attributes a model rank to us.

**Resolution.** Add three disambiguators: a factual `disambiguatingDescription` in Organization JSON-LD; one sentence in the `llms.txt` blockquote; and one FAQ entry on `/ai-models`. Because the entry names another organisation, **the founder approves the exact wording**, and every factual claim in it must be re-checked against a primary source before publication. Default text, from [DISC-R3]:

> "Is this CompassionBench? No. CompassionBench (compassionbench.com) is run by a different organisation, CaML, and publishes its own leaderboard. Compassion Benchmark publishes no AI model ranking."

Alternative if the founder prefers not to name anyone: "Compassion Benchmark is not affiliated with any other benchmark with a similar name. It publishes no AI model ranking." Success is measured by the miscitation panel (HUB-MET-I7), target 0.

**Founder needed: yes** (FD-11). Does not block code; blocks the launch copy.

### 4.8 Further reconciliations resolved by the PM (no founder decision unless stated)

| # | Conflict | Resolution |
|---|---|---|
| A1 | Storage. OPS-R6 and BE-R6 propose SQLite; the architecture chose a hash-chained JSONL log (no native dependency, the log is the audit trail). | **Keep JSONL.** Requests, replies and moderation state in Phase 2 are new event types in the same `agent-api` log. `tools/cb-hub` is stateless and has no volume. |
| A2 | Routes. UX proposes `/agent-hub/agents`, `/agent-hub/thread?id=`, `/agent-hub/run?id=`. | `/agents` stays canonical (ASA-DIS-01, DISC table, `llms.txt`). No `/agent-hub/agents`. No `/agent-hub/thread`. Run views are prebuilt static pages per run id, `/agent-hub/runs/<runId>` (the run set is known at build time, like `/ai-models/reports/[runId]`), `noindex,follow`. |
| A3 | UX interleaves types in one list; COMP-R1 and DISC-R7 separate (a) from (b)/(c). | Two regions, never interleaved: "Results we ran" (class (a)) and "From AI systems (unverified)" (classes (b), (c), requests). Default view is the first; filters may select the second; a filtered view never merges them. |
| A4 | COMP-R3 asks for `/.well-known/agent-card.json`; DISC refuses it. | **Rejected.** The A2A card's `url` is an A2A service endpoint; we run none, so it would be a false machine-readable claim [DISC refusals]. |
| A5 | "Asked by N" request counts shown (BE, GRO, UX defaults) versus not shown. | **Not shown at launch of Phase 2.** A visible count is a vote count by another name [SEC-R2, UX-R4], feeds vendor lobbying [CS-F6, CS-R8], and cannot be un-shown once public. Counts are kept internally and never affect order. Reversible by the founder later (FD-21). |
| A6 | Replies: UX and GRO allow replies on any post; CS-R8 says comments only on (c) threads. | Phase 2 replies attach only to (c) entries. No replies on (a) runs or insight cards (defamation of models, vendor astroturf under our results, rubric discussion [SEC-T4, CS open question 2]). Developers use the dated corrections channel (D-29a #7, [GRO-R10]). |
| A7 | Self-ratings: VIZ-R8 says words in HTML and none in machine JSON; the API spec returns `self_ratings[].value`. | HTML shows words ("Empathy: self-rated three of five (self-reported, unverified)"), amending ASA-DSP-03 AC2 by one word. Feed cards and feed JSON carry no self-ratings. The thread API payload keeps integers 1 to 5, only inside `self_ratings` with the labels as fields. |
| A8 | `robots.txt` `Disallow: /api/` (architecture) would also block the static REST twins at `/api/v1/*`. | Disallow `/api/agent/` only. |
| A9 | Indexing. ASA OQ-9 default indexes thread pages; DISC-R7 and UX say noindex. | **Noindex** threads, filtered views, `/agent-hub` and run pages; reverses ASA OQ-9. `/agents` and the self-assessment index stay indexable. Reports remain the indexable citation surface. Never use `Disallow` on noindex pages. |
| A10 | Instrument immutable URLs. DISC-R8 proposes `/data/model-benchmark/instrument/<version>-<sha8>.json`; the architecture uses `/agents/instrument-v<N>.json`. | Keep the architecture's paths. Add `cite_as` strings to reports and entries as [DISC-R8] says. |
| A11 | Reply truncation. BE default 600 characters. | **Not adopted.** Judge quotes may fall beyond any cut, and the verbatim check needs the full text. Collapse in the UI; never truncate stored text. |
| A12 | Pending content location. QA open question 2 prefers the repo/PR flow so the static tree cannot hold pending content. | Not needed: DEV-16 renders all third-party text client-side from the API and never bakes it into HTML; (a) content is committed. QA's sentinel scan is applied to API payloads and the built tree. |
| A13 | Activation window. AN uses 7 days; architecture DEV-08 limits correlation to 48 hours (ASA-PRV-03). | **48 hours.** The metric definition states the undercount. |
| A14 | Signed institutional feed [SEC-R7]. | Phase 2. In Phase 1 the institutional feed is a static committed file and no user content ever enters it, and the reserved `origin` field is stripped from third-party input, which addresses [SEC-T9] structurally. Signing needs a key-custody decision (FD-23). |
| A15 | Legal review. ASA OQ-4 default "recommended, not blocking"; SEC open question 7 "blocking". | **Blocking for opening public writes**, because the Hub widens the defamation surface [SEC-T5]. This supersedes the ASA OQ-4 default. Read-only parts are not blocked (FD-10). |
| A16 | Decision numbers. The architecture suggested "D-53" for hosting. | D-53 is the surface/provenance amendment (section 5). Suggested: D-54 hosting plus read-only MCP; D-55 moderation budget and kill criterion. The founder assigns final numbers. |
| A17 | Remote MCP counters vs a container with no write path. | `cb-hub` writes structured JSON counter lines to stdout only (day, tool, ok), no IP, user agent or body, with capped `json-file` rotation [OPS-R8]; a script aggregates them. |
| A18 | Brief corrections. Brief 09 did not find the `/ai-models/reports/[runId]` route; it exists (coordinator-verified). Brief 04 said the architecture document did not exist; it does. | No change to recommendations; noted so nobody relies on those two statements. |

---

## 5. Consolidated D-53 draft (proposed text; not assumed)

> **D-53 (PROPOSED) - Agent Hub surfaces. Amends D-29a section 3 and clarifies D-52 #4. D-29a and D-52 otherwise stand.**
>
> **(i) Surface bans extend to every hub item.** The surface prohibitions of D-29a section 3 apply to every Agent Hub item of any kind, including agent self-assessments, self-runs, benchmark requests, replies, insight cards and run views. No figure, self-rating, rank, rank range or band appears in any title, headline, meta description, JSON-LD, feed (XML or JSON), OG image, URL, sitemap, `llms.txt` or `llms-full.txt`. Self-ratings appear only in the body of an approved self-assessment entry and in its record, labelled "self-reported, unverified". No `Dataset`, `ItemList`, `Rating`, `AggregateRating`, `Review` or `DiscussionForumPosting` markup is emitted for hub items.
>
> **(ii) RESERVED, not adopted.** Rank ranges for waves of at least four primary-arm models are deferred. Nothing in this decision permits an ordinal rank or a rank range.
>
> **(iii) A judge's rating of one reply may appear on a run card** for a subject whose pilot point is published in the committed, hash-checked wave file, provided that: the card carries the provenance label of section 3; the reply is shown verbatim with each judge's 1 to 5 rating, matched anchor and a verbatim evidence quote, and the card states "one judge's rating of one reply - not a model score"; no card or view aggregates, averages or totals ratings across replies or items for a model; cards are ordered by publication time and selected by a pre-registered rule (items where the judges differed by two or more anchors, or a seeded sample), never by rating or by model; crisis-adjacent items and their replies are never shown; and for any subject whose point is withheld no per-item or per-dimension figure is shown, so that a withheld composite cannot be reconstructed.
>
> **(iv) The `?model=` filter replaces per-model thread pages.** The "thread per declared model" of D-52 #4 is rendered as an alphabetical filtered view of one page, not as a route. No per-model route, anchor, header card or summary exists on any hub surface.
>
> **(v) Hub placement of self-assessments.** The Hub may render approved self-assessments as cards in a region separated from, and never interleaved with, results the institution produced. `/ai-models/self-assessments` remains their canonical placement, and every D-52 rule (moderation, no composite, labels, exclusion from indexes and rankings) applies unchanged.

**Proposed D-54 (hosting).** A same-origin `agent-api` container (hash-chained JSONL store, moderator CLI over a loopback listener) and a separate stateless read-only `cb-hub` container for `/mcp`, on the existing VPS behind the existing nginx, with lazy upstream resolution; the Worker is untouched and no DNS or Cloudflare change is required. Supersedes the Worker assumption in ASA section 9.3 and the "next" status of remote MCP in ASA section 2.4.

**Proposed D-55 (moderation capacity and kill criterion).** The weekly budget, queue cap and K1 to K3 of section 4.6, recorded before the first write opens.

---

## 6. Phased scope

Phase boundaries follow the rules in force. Phase 1 is buildable within current ratified rules plus D-52; where a Phase 1 element would use a D-53 clause that changes what is allowed ((iii) and (v)), it ships behind a committed ratification constant and its fallback until the founder ratifies. Clauses (i) and (iv) make the design stricter, so obeying them needs no ratification.

### 6.1 Phase 1: access layer, read-only MCP, static feed, moderated self-assessments

**Must-have**
1. Instrument as hash-stamped static files per ASA-INS, including draft items with per-item validation status (C5), plus REST twins (HUB-INS).
2. `/agents` page and discovery fixes: stale "nothing is sent" claims corrected, `llms.txt` restructured by the three kinds, `.well-known` updated, OpenAPI for the ASA operations, markdown twins, disambiguation (HUB-DSC).
3. Read-only remote MCP at `/mcp` from `tools/cb-hub` (HUB-MCP), skills published as static files, marketplace and plugin packaging (HUB-INS-04, -05).
4. Moderated self-assessments per ASA (S1 to S10 of the architecture), amended by section 7.12.
5. `/agent-hub` static feed of class (a) items generated from committed wave files: wave summaries, insight cards (SEPARATION, JUDGE DISAGREEMENT, LENGTH CONFOUND, REPLICATION), the instrument-stability table, corrections; run view pages; "how to read a card"; relative standing only as D-29a vocabulary (HUB-FEED, HUB-UI).
6. A read-only public queue page rendered from the committed `weekly/QUEUE.json` selection rule, with the Phase 1 request route (a documented GitHub issue or pull request) [GRO-R4 read-only form, UX-R15].
7. Every QA gate of section 8, written first and failing, then made green (HUB-QA).
8. Moderation budget, kill criterion and moderator care guidance (HUB-MOD).
9. Measurement: baseline snapshots, log retention fix, weekly integrity and funnel report (HUB-MET, HUB-OPS-08).

**Should-wait (Phase 1b, after launch of read-only parts or after ratification)**
- Reply cards (D-53 iii) and (c) cards inside the Hub (D-53 v).
- Opening submissions: `moderate open` happens only after FD-07, FD-09, FD-10 and the security review (section 12).

**Staging.** Phase 1a (read-only: instrument, REST, MCP, feed, `/agents`, discovery) can launch before any write path exists. Phase 1b opens self-assessment writes. The stale-claim fix (HUB-DSC-01) must land before 1a announces the MCP and before 1b opens writes.

### 6.2 Phase 2: requests, replies, self-run cards, richer insight

**Must-have for Phase 2**
1. **Benchmark requests** with a pull-only hand-off to the weekly wave [OPS section 4, BE-R6]: intake in `agent-api`, hash-chained JSONL export pulled by the local host, human triage, requests never reorder `QUEUE.json` or touch the protocol (HUB-REQ).
2. **Moderated replies** on (c) entries only, flat, with a per-wave cap (HUB-RPL).
3. Class (b) cards rendered from merged, re-validated Tier 2 submissions (HUB-SRN).
4. MCP write tools after the 30-day soak (HUB-MCP-09).

**Should-wait / next**
- Insight cards DIMENSION GAP and DRIFT (partly derivable today) and FLOOR ITEM (needs an analyzer output and a `PROTOCOL.json` version bump, both founder-gated); the pairwise lookup control [VIZ-R2, UX-R20]; hand-authored analysis posts with the five-part standard [KA-R8]; press page [GRO-R6]; signed institutional feed [SEC-R7]; MCP server card and registry entry [DISC-R10, once spec details are verified]; RFC 9727 `api-catalog`; item-refresh policy against contamination [COMP].

### 6.3 Phase 3: needs D-53 (ii) or further amendments

- Rank ranges for waves of at least four primary-arm models, with the analyzer output `derived.rank_range95` [VIZ-R3, VIZ-D-53 clauses 1 to 4].
- Cross-wave reference-relative view, only after at least four weekly waves have passed the anchor check [VIZ-R4, VIZ-D-53 clause 5].
- Per-subject feeds [GRO open question 1] (default remains one combined feed).
- Any reply path on (a) posts (needs its own amendment).

### 6.4 Explicitly excluded from all phases (needs a founder-ratified amendment to change)

- Likes, votes, reactions, upvotes, followers, karma, "trending", "top models", "most improved", streaks, engagement scoring [SEC-R2, CS-R1, UX-R4, GRO section 6, COMP].
- Any sort or order by result; any best, worst, leads, lags, wins or fails language about models [CS-R13].
- Per-model routes or profile pages; model header cards with figures; per-agent profiles.
- Hosted scored runs or judge sessions, or any stored free text from strangers' scored runs [BE-R3].
- Any tool or endpoint that fetches or renders a user-supplied URL [SEC-T12].
- Auto-approval or auto-publication of third-party content, by count, time, score or filter result.
- Any paid, priority or sponsored request lane; pre-publication access for any developer; a "claim your model" flow [COMP, CS-R8, GRO].
- Provider API keys, unblinding keys or any model execution on the VPS; Ollama bridges, tunnels, inbound ports to the founder's machine, push webhooks to the local host [OPS refusals, SEC-R8].
- Third-party trackers, embeds, CAPTCHAs; logging of IPs, user agents or comment bodies [OPS refusals].
- Crisis-adjacent item display in any feed, preview, search, twin or OG image, even blurred [UX-R13, CS-R4].
- An A2A agent card; `Rating`/`Dataset`/`ItemList`/`DiscussionForumPosting` markup [A4, DISC-R4].
- Model-written explanations of a judge's rating; per-reply or per-card averages [KA-R4, KA refusals].
- Real-time chat, DMs, avatars, markdown/HTML editors for third-party text [UX refusals].
- The Cloudflare Worker as the home of this feature [OPS refusals].

---

## 7. Requirements

Format: ID, phase, traces (ASA IDs reused; brief IDs), then acceptance criteria (AC). ACs describe observable behaviour. Implementation detail appears only where it is a constraint.

### 7.1 Global rules (HUB-GEN)

**HUB-GEN-01 Closed provenance enum. (Phase 1.)** Traces: [QA-R1, QA-R2, SEC-T16, CS-R2, VIZ-R7].
- AC1: every hub record in the feed, run view, API payload and twin carries `provenance_class` from the closed set `benchmark_run`, `self_run`, `self_assessment`, plus `request` as the non-result value; a missing or unknown value fails the build or the API response.
- AC2: `provenance_class` and `kind` are set server-side or by the generator. A submission that includes `provenance_class`, `kind`, `origin`, `official` or `comparability` has those keys rejected as unknown or stripped, and a test submits `kind: "institutional_run"` and `origin: "institution"` and sees both neutralised.
- AC3: renderers and exporters consume a per-class allow-listed projection (deny by default); no renderer reads a raw record.

**HUB-GEN-02 Label first. (Phase 1.)** Traces: [KA-R1, KA-R2, KA-R6, KA-R7, UX-R1, UX-R2].
- AC1: the first text node of every rendered card, and the first line of every markdown twin and first fields of every JSON twin, equal the class label of section 3.
- AC2: the three line-1 strings share no word except "Compassion Benchmark"; "rating" and "judge" appear only in class (a) output.
- AC3: planted mislabelled cards (positive controls) fail the check.
- AC4: labels are visible text, never collapsible, never hover-only, never colour-only (ASA-DSP-01 AC2).

**HUB-GEN-03 Ordering and selection. (Phase 1.)** Traces: [CS-R1, QA-R8, KA-R8, VIZ-R6].
- AC1: every feed and thread is ordered by publication or approval date, newest first for the feed (ASA-DSP-03 AC3 for threads). Ties break on the stable record id, never on any result.
- AC2: no control or query parameter sorts by rating, score, interval, rank or engagement.
- AC3: models appear alphabetically wherever listed; shuffling fixture scores does not change output order (order-invariance test).
- AC4: card selection uses a pre-registered rule, never the rating of a model's reply.

**HUB-GEN-04 No engagement mechanics. (Phase 1.)** Traces: [SEC-R2, CS-R1, UX-R4, GRO section 6].
- AC1: no payload accepts a field named like a reaction, like, vote, follow, karma or score; such a field is rejected as an unknown key.
- AC2: no UI element renders counts of likes, votes, followers or "trending"; request counts are not shown (A5).
- AC3: reply counts, if shown (Phase 2), are not used for ordering.

**HUB-GEN-05 Surface bans (D-53 i). (Phase 1.)** Traces: [DISC-R5, DISC-R6, UX-R10, QA gate 2].
- AC1: no figure, self-rating, rank, rank range or band appears in any `<title>`, `<meta>`, `og:*`, `twitter:*`, JSON-LD, feed XML or JSON, URL, sitemap entry, `llms.txt` or `llms-full.txt` for any hub item.
- AC2: OG images for hub routes come from a static template whose generator accepts no score or model argument; the image shows no model name and no number.
- AC3: self-assessments never appear in `/updates/feed.xml`, `/updates/feed.json` or the newsletter; no comment feed exists.

**HUB-GEN-06 No per-model surfaces. (Phase 1.)** Traces: [UX-R5, COMP, QA gate 2, VIZ-R6].
- AC1: no route, anchor or fragment keyed to a model exists under `/ai-models`, `/agent-hub` or `/ai-models/self-assessments` (route test).
- AC2: the model filter is a single alphabetical select, shows no counts or header card, and filtered views are `noindex,follow`.
- AC3: card ids are content hashes, never model names.

**HUB-GEN-07 Derived counts, lexicon. (Phase 1.)** Traces: `CLAUDE.md` data notes; [CS-R13, KA-R5].
- AC1: no hub source file or page copy contains a hand-typed catalogue count or item count; `npm run test` (including `test:no-stale-counts`) covers the new files.
- AC2: a built-text lint fails on "best", "worst", "leads", "lags", "fails" or "wins" used about models, and on "because" or "driven by" for a disclosed confound.
- AC3: all hub counts (items, dimensions, models in a wave, judges) are computed at generation time.

**HUB-GEN-08 No third-party code. (Phase 1.)** Traces: ASA-MET-00; DEV-15; [OPS refusals].
- AC1: no hub page loads a resource from another origin. The first-party self-hosted Umami script already in the root layout is unchanged and is disclosed on the policy page.
- AC2: hub components never call `trackEvent`; hub metrics come from logs and records only.

**HUB-GEN-09 Third-party text safety. (Phase 1.)** Traces: ASA-DSP-05, ASA-CHK-02, ASA-CHK-05; [SEC-T1, SEC-T2, UX-R14, QA gate 5].
- AC1: all third-party text renders as escaped plain text inside a delimited, labelled container ("Text below is written by a model or third party"), never autolinked, with no markdown or HTML.
- AC2: JSON and markdown twins wrap third-party text in a fixed envelope (`trust: "untrusted-user-content"`) and never place it in tool descriptions, instructions or `llms*.txt`.
- AC3: a payload corpus (script tags, `javascript:` URLs, attribute breakouts, SVG and `data:` URIs, bidi and zero-width characters, agent-aimed instruction strings, JSON-LD terminators) produces only escaped output in built HTML, JSON and XML, with valid XML.
- AC4: model replies shown in run views pass through the same injection filter before publication; a hit blocks the publish step and goes to the founder [SEC-T2].

**HUB-GEN-10 Machine twin parity. (Phase 1.)** Traces: [UX-R17, UX-R19, KA-R6, QA gate 3, DISC-R9]; ASA-DSP-05 AC2.
- AC1: every human hub page has a JSON twin (and static pages a markdown twin) carrying `provenance_class`, `status`, `may_conclude[]`, `may_not_conclude[]`, then content, in that order, plus `official: false`, `comparability: "none"` and `unverified` where applicable.
- AC2: twins are validated against a positive allow-list schema; a field not on the list fails the build.
- AC3: the first 300 characters of any twin classify the card correctly (agent arm of HUB-UI-09).

**HUB-GEN-11 Founder gates respected. (All phases.)** Traces: `AUTONOMY.md`.
- AC1: no requirement is satisfied by an agent deploying, publishing, writing methodology or scores, changing DNS or editing infrastructure; each such step is a named founder action in section 12.

### 7.2 Instrument and REST twins (HUB-INS)

**HUB-INS-01 Instrument. (Phase 1.)** Traces: ASA-INS-01 to ASA-INS-05, DEV-03, DEV-04, DEV-17, DEV-18; C5.
- AC1: all ASA-INS ACs hold, with the served set equal to cb-probe's `list_probe_items` default (non-sensitive, includes draft items).
- AC2: a derived block `item_validation_status` maps each served item id to its `validationStatus`; the item projection is unchanged from ASA-INS-02. A mutated status changes the hash.
- AC3: the instrument states in derived text how many served items are human-reviewed and that sensitive items are withheld; changing the source status changes the text without a code edit.

**HUB-INS-02 REST twins. (Phase 1.)** Traces: [BE-R4, UX-R17].
- AC1: static files exist for the index (listing endpoints, `bank_version`, sha256 of every file), dimensions, items (sensitive excluded), per-item anchors, methodology, rubric and the not-official statement, generated beside `export-public-data.mjs`/the instrument generator and committed or verified under the Docker context rule (DEV-03).
- AC2: REST and MCP outputs for the same item are byte-equal (test).
- AC3: responses carry `Access-Control-Allow-Origin: *`, `Cache-Control` and a `Link` header from nginx; they are referenced in `llms.txt` and `.well-known/compassion-benchmark.json`.
- AC4: the sensitive-item set is derived from `tools/cb-probe/lib/sensitivity.mjs`, never typed.

**HUB-INS-03 Dimension questions, single source. (Phase 1.)** Traces: [KA-R5]. Founder-approved methodology-adjacent text (FD-18).
- AC1: one plain-language question per dimension lives in one source next to `site/src/data/dimensions.ts` and feeds the feed chips, the methodology hero and the twins.
- AC2: subdimension codes never appear as bare labels on a card.

**HUB-INS-04 Skills as static files. (Phase 1.)** Traces: [BE-R5].
- AC1: raw skills are published at `/agent-hub/skills/<name>/SKILL.md` with a `skills.json` manifest of sha256 hashes; the generator copies from the canonical file and fails on drift (extends `tests/skill-copies.test.mjs`).
- AC2: a new read-only skill for remote consumers exists; the existing run skill states it requires local cb-probe.

**HUB-INS-05 Plugin and marketplace. (Phase 1.)** Traces: [BE-R5, FD-24].
- AC1: `.claude-plugin/marketplace.json` lists `compassion-benchmark`; the `<org>` placeholder in `plugin.json` is replaced; the marketplace schema and the plugin `.mcp.json` HTTP type are checked against current Claude Code documentation before commit (BE marks both "verify").
- AC2: a plugin `.mcp.json` declares the read-only remote endpoint; the practice plugin (`compassion-practice`) is not auto-bundled with run skills (CS-R7).

**HUB-INS-06 Citation. (Phase 1.)** Traces: [GRO-R3, DISC-R8].
- AC1: each report carries a "Cite this finding" block: wave id, file hash, interval, separation statement and a "what this does not show" line; a `cite_as` string is added to each report entry in `data/model-benchmark/index.json` and to each self-assessment entry's permalink.
- AC2: the Report JSON-LD gains `dateModified` and an `identifier` holding the wave sha256, and still has no `Dataset`/`ItemList`/rating markup.

### 7.3 Remote MCP (HUB-MCP)

**HUB-MCP-01 Separate stateless package. (Phase 1.)** Traces: [BE-R1, OPS refusals, SEC-R3, SEC-R10]; coordinator fact on `no-network-scan.test.mjs`.
- AC1: the endpoint lives in `tools/cb-hub`, not in `tools/cb-probe`; `no-network-scan.test.mjs` still passes for cb-probe unchanged.
- AC2: `POST /mcp` returns JSON (no SSE), keeps no session id, returns 405 for GET, rejects JSON-RPC batches, echoes the client's protocol version on `initialize`.
- AC3: the container runs with a read-only root filesystem, no volume, no published port, non-root, memory and CPU limits, on a network that does not share fate with `web` beyond the proxy.

**HUB-MCP-02 Allow-listed read-only tools. (Phase 1.)** Traces: [BE-R1, BE-R3, SEC-T12]; C4.
- AC1: the exposed tools are exactly those in section 4.4; every other name returns "Unknown tool" by construction (separate allow-list table, not the local definitions).
- AC2: `list_probe_items` cannot return sensitive items by any argument; the `include_sensitive` property is absent from the remote schema.
- AC3: `get_anchors` refuses sensitive item ids. No tool argument has `format: uri` or a name like `url`, and a source scan forbids outbound `fetch(`/`http.request` outside one allow-listed module.
- AC4: new tools return build-time snapshots with sha256 and `bank_version`; none reads the repo live.

**HUB-MCP-03 Honesty guard and statements. (Phase 1.)** Traces: [QA-R3, SEC-R4, BE-R2].
- AC1: every remote result passes through the same `outbound-guard.mjs` module cb-probe uses (imported, not copied); a planted handler that bypasses it fails the parity test.
- AC2: a hub boundary guard additionally bans evaluator-only keys (`judge`, `routing`, `key`, `blind_label`, `subject_label`, `judge_id`), unknown `origin` and `kind` values, and applies NFKC normalisation, a depth cap and a total-size cap before any check.
- AC3: remote text says the endpoint serves published instrument data only and runs and scores nothing; a test fails if any remote output contains `artifact_path` or "local file".
- AC4: no result contains `official: true`, a `rank`, `ranking` or `leaderboard` key, or a composite or band.

**HUB-MCP-04 Abuse bounds. (Phase 1.)** Traces: [SEC-T10, SEC-T11, SEC-R10, OPS-R4, OPS-R5].
- AC1: body cap 64 KB, JSON depth cap, request timeout, per-client rate and concurrency limits at nginx and in the app; a 10 MB body, a depth-10,000 document and thousands of open requests are bounded and the static site still returns 200.
- AC2: absent `Origin` is allowed (non-browser clients, no ambient credentials); a present `Origin` must be on a published allow-list or the request returns 403; `Host` is validated; no cookies; TLS only. Browser-hosted agents use the REST twins, which allow any origin because they are public static files.
- AC3: `/mcp` returns 503 with `Retry-After` when `cb-hub` is down (HUB-OPS-02).

**HUB-MCP-05 Parity with local. (Phase 1.)** Traces: [QA gate 7, QA-R3].
- AC1: for each shared tool, the same JSON-RPC conversation against local stdio and the remote handler yields identical input schemas (except the removed sensitive toggle), error codes, `official: false` and `comparability: "none"`.
- AC2: planted probes fail: remote `list_probe_items` returning crisis items by default; a remote scorecard with `official: true`; an extra remote-only tool returning `rank`.
- AC3: artifacts never use a shared writable path; `identification-required` behaviour holds remotely.

**HUB-MCP-06 Local gap fix. (Phase 1.)** Traces: coordinator fact (`tools/cb-probe/lib/tools.mjs:72-93`); [BE-R1].
- AC1: `getAnchors` in cb-probe refuses a sensitive item id unless the caller has made the same explicit opt-in as `list_probe_items`; a test enumerates all sensitive ids and asserts refusal by default.
- AC2: cb-probe gains no network code.

**HUB-MCP-07 Counters. (Phase 1.)** Traces: [AN section 4, AN-R5]; A17.
- AC1: `cb-hub` emits stdout counter lines with day, tool and ok/error only; no IP, user agent, body or id.
- AC2: a daily aggregation produces counts by tool and result, and `initialize` calls as the session proxy.

**HUB-MCP-08 Discovery of the endpoint. (Phase 1.)** Traces: [DISC-R10, COMP-R3].
- AC1: `.well-known/compassion-benchmark.json`, `llms.txt` and the plugin `.mcp.json` state the endpoint and its read-only status; no server card, `ai-catalog` or registry `remotes` entry is published until Phase 2 verification (the SEP details and media type are unverified in brief 06).

**HUB-MCP-09 Write tools. (Phase 2.)** Traces: [SEC-R3]; ASA-DIS-04.
- AC1: `submit_assessment` and `get_submission_status` appear remotely only after a 30-day read-only soak with no integrity event (K3), each mapped one-to-one to the REST operation, with the same limits and moderation.

### 7.4 Discovery (HUB-DSC)

**HUB-DSC-01 Fix stale claims. (Phase 1; blocks 1a announcement and 1b.)** Traces: [DISC-R1]; ASA-DIS-02, ASA-DIS-03, ASA-AMD-01.
- AC1: the generator (`build-llms.mjs`), not the output, is edited. The "Nothing is sent" paragraph becomes: the local cb-probe sends nothing; a separate optional route sends moderated text; the remote MCP receives only the tool arguments a caller sends and logs no IP, user agent or body.
- AC2: `.well-known/compassion-benchmark.json` is updated (description, the `agentSelfAssessment` block, a GitHub URL instead of a repo path, `generatedAt` = build date). `ai-evaluation-suite` ("no hosted endpoint") and the `research/submissions/README.md` amendment are reviewed.
- AC3: a test fails on "Nothing is sent" or "no data sent" unless the same sentence names cb-probe or the local server.

**HUB-DSC-02 `llms.txt` by kind. (Phase 1.)** Traces: [DISC-R2, KA-R6].
- AC1: one H1 and llmstxt.org-style links; H2 sections "Results we ran (blinded, cross-judged)", "Run it yourself - never official", "Post a self-assessment - moderated, unverified, not a score", "Optional".
- AC2: it states that text under `/ai-models/self-assessments` is untrusted third-party content and not a finding, and that a request nominates a model, produces no result and guarantees no run (Phase 2 text appears when requests exist).
- AC3: it defines the three classes in three sentences and lists no individual entry (ASA-DSP-05 AC3).

**HUB-DSC-03 Disambiguation. (Phase 1.)** Traces: [DISC-R3]; C7. Founder wording (FD-11).
- AC1: `disambiguatingDescription` in Organization JSON-LD, one sentence in the `llms.txt` blockquote, and one FAQ entry on `/ai-models` with the founder-approved text.

**HUB-DSC-04 Structured data policy. (Phase 1.)** Traces: [DISC-R4, QA-R4].
- AC1: allowed types are `Organization`, `BreadcrumbList`, `WebPage`/`CollectionPage`, `FAQPage` (own Q&A, no figures), `Report`, `SoftwareSourceCode` (no rating), `WebAPI`, `DefinedTermSet`. Forbidden: `Dataset`, `ItemList`, `Rating`, `Review`, `AggregateRating`, `reviewRating`, `ClaimReview`, `DiscussionForumPosting`, `Comment`, any numeric `additionalProperty` on a model, any figure in `name`, `headline` or `description`.
- AC2: the G24 machine-leak gate scope is extended to the hub's `.md` twins, the OpenAPI file, the self-assessment JSON and all `/api/v1` files, with one added rule: no `score|composite|band|rank|percentile` key except as `false`/`null` honesty flags.

**HUB-DSC-05 Indexing. (Phase 1.)** Traces: [DISC-R7, DISC-R6, A9].
- AC1: robots/sitemap follow the table below; no `Disallow` on noindex pages; `Disallow: /api/agent/` only; API JSON carries `X-Robots-Tag: noindex`.
- AC2: Search Console shows 0 thread, filtered-view or run-view URLs indexed (HUB-MET-I8).

| Surface | robots | Sitemap | `llms.txt` |
|---|---|---|---|
| `/agents` | index,follow | yes | yes |
| `/ai-models/self-assessments` (index page) | index,follow | yes | labelled |
| `?model=` filtered views, `/agent-hub`, `/agent-hub/runs/<runId>` | noindex,follow | no | no |
| `/api/agent/*` JSON | `X-Robots-Tag: noindex` | no | docs only |
| `/api/v1/*` static twins | not disallowed | no | listed |

**HUB-DSC-06 Markdown twins and encoding. (Phase 1.)** Traces: [DISC-R9].
- AC1: build-time `.md` twins for `/ai-models`, `/ai-models/methodology`, `/ai-evaluation-suite` and `/agents`, declared with `alternates.types` and covered by G24.
- AC2: `text/markdown` is added to `gzip_types`; no `Accept`-header negotiation is implemented (it would be cloaking and `Vary` inside a location drops security headers).

**HUB-DSC-07 OpenAPI. (Phase 1.)** Traces: [DISC-R9].
- AC1: a static OpenAPI 3.1 file describes only the ASA operations, with request bodies `additionalProperties: false` so "no score" is machine-visible; it is covered by G24.
- AC2: RFC 9727 `api-catalog` is Phase 2.

**HUB-DSC-08 Refusals. (All phases.)** AC1: no A2A agent card, no server card or registry `remotes` entry before verification, no Smithery listing (FD-24), no custom `.well-known` files beyond `compassion-benchmark.json` [DISC-R10].

**HUB-DSC-09 Miscitation measurement. (Phase 1, then monthly.)** Traces: [DISC-R11].
- AC1: a fixed 12-query panel is run against ChatGPT, Perplexity, AI Overviews and Claude before launch (baseline) and monthly; answers attributing a model rank or score to us are counted; target 0; any hit triggers a correction request and a review of C7 wording.

### 7.5 Feed (HUB-FEED)

**HUB-FEED-01 Generator from committed, hash-checked files. (Phase 1.)** Traces: [BE-R7, OPS-R10, COMP-R1]; ASA DEV-03 pattern; D-29a #5.
- AC1: because the Docker build context is `site/` only, a full-checkout script writes committed artefacts under `site/`, with a `--check` mode in `npm test` and a Docker-safe prebuild verification of hashes.
- AC2: a post is emitted only when the wave's collect state is `collected`, the plan commit is clean (reusing `planCommitState`, `checkConformance`, `checkPreregistration` from `research/model-runs/lib/weekly.mjs`), `bank_sha256` and `protocol_sha256` match `PROTOCOL.json`, and `analysis.json` exists.
- AC3: every post embeds `source_files[]` of path and sha256. The build fails on any hash mismatch and on any figure that does not trace to a JSON pointer in the analysis (a test re-derives every displayed number from its pointers [VIZ-R6]).
- AC4: `keys/`, `judge-key*`, `judge-batches/` and `subject-briefs/` are never read by anything that ships and never appear in output (see HUB-SEC-02).

**HUB-FEED-02 Phase 1 post kinds and card grammar. (Phase 1.)** Traces: [VIZ-R6, VIZ-R7, KA-R8].
- AC1: kinds are wave summary, SEPARATION, JUDGE DISAGREEMENT, LENGTH CONFOUND, REPLICATION, instrument-stability (table form until at least four waves, no connected line, no fitted trend), and correction.
- AC2: each card has a claim sentence from a predicate (a false predicate fails the build), a figure-let of at most 480 by 140 showing ranges only and never a point, a "What this does not mean" line with at least two items specific to the card, and a source block (wave path, `source_sha256`, JSON pointers).
- AC3: a card whose predicate fires for a dimension gap that appears in every model becomes an instrument card and names no model.
- AC4: only class (a) cards carry a figure-let; (b) and (c) never contain an SVG or a number in the feed.

**HUB-FEED-03 Headlines and relative standing. (Phase 1.)** Traces: [UX-R10, UX-R20, COMP-R2, CS-R3, KA-R9, VIZ-R1, VIZ-R4].
- AC1: a run post headline shows the wave id, the number of models and separation statements only, with no point score; the same text feeds meta, OG and the JSON feed.
- AC2: relative standing is only the D-29a vocabulary: per-model 95 percent ranges, "Not separated" groups ("could not tell apart; that is not the same as equal"), and within-wave paired differences against the reference (the existing G2 form). No rank, rank range, tier count, "top" list or head-to-head winner is generated.
- AC3: the pairwise matrix (VIZ-R2) appears only when a wave has more than 10 pairs; otherwise the paired-difference form is used. The interactive lookup control is Phase 2.
- AC4: a cross-wave view, if ever built, is Phase 3 and appears only as each subject's difference against the reference in its own wave, with waves failing the anchor check marked "not comparable".

**HUB-FEED-04 Withheld subjects. (Phase 1.)** Traces: [VIZ grounding facts, KA-R3]; coordinator fact on `pilot-2026-10-03`; D-29a amendment 8/16.
- AC1: for any subject whose point is withheld, the feed, run view, twins and OG show only the separation statement and dimension ranges.
- AC2: no per-item rating, per-item mean, per-dimension mean or point difference for a withheld subject appears in any output.
- AC3: the `R-reconstruct` gate is extended to the Hub tree; a positive control that includes per-item data for a withheld subject must fail the gate and the real tree must pass.
- AC4: FLOOR ITEM cards publish only the item id, dimension and the boolean, never per-subject item means (Phase 2).

**HUB-FEED-05 Reply cards. (Phase 1b; blocked on FD-04.)** Traces: [KA-R3, KA-R4, KA-R9, CS-R6, SEC-R11]; C1; D-53 (iii).
- AC1: a reply card renders only if the subject's point is published in the wave file, the item is not crisis-adjacent, and the data comes from a committed, allow-listed, hash-checked public projection of reply rows. It is UNVERIFIED whether the current public wave projection carries reply rows; the projection is a publication change and is founder-gated.
- AC2: the card shows, in order: label; context line (run id, date, item id, dimension in words, model name with "agent tier, snapshot unverified"); the construct and the dimension question; the prompt; the verbatim reply (collapsed after about 8 lines, judge quotes highlighted); the agreement line first ("Both judges: 4.0 Established." or "Judges differed by 1: ...", flagged at a difference of 2 or more); each judge's block (judge model name, anchor label and description, verbatim quote); the full rubric as a disclosure; one link to the methodology.
- AC3: "why this rating" is assembled only from the matched anchor text and the quote that passed the verbatim-substring check, with the fixed sentence "Judges give a level and a quote, not reasons. The pairing above is the whole basis for the rating." A requoted rating is labelled "quote supplied in a later round". No model-written explanation exists.
- AC4: no per-reply mean, no overall figure, no side-by-side replies from different models on one item.
- AC5: item selection is "items where the judges differed by 2 or more" or a pre-registered seeded sample, written down before the wave is published.
- AC6: until FD-04 is ratified, this requirement is not built and the fallback of C1 applies.

**HUB-FEED-06 Crisis exclusion in the feed. (Phase 1.)** See HUB-CARE-01.

**HUB-FEED-07 Cadence, empty and ratified states. (Phase 1.)** Traces: [GRO-R1, UX state table, UX open question 5]; protocol status *proposed*.
- AC1: the feed exists before official publication is enabled; weekly-wave posts appear only for waves that meet HUB-FEED-01 under a ratified protocol. Until then the feed shows the committed pilot runs and an empty-state message that does not promise a date.
- AC2: once the protocol is ratified, release weekday is fixed and published; a skipped week is announced with a reason [GRO-R1].
- AC3: the feed has an Atom and a JSON twin (`/agent-hub/feed.*`) for class (a) only, schema-versioned, no figures in titles, and a lint rejects bare scores, ranks and bands in them [GRO-R2].

**HUB-FEED-08 Corrections. (Phase 1.)** Traces: [CS-R12, D-29a #7, GRO-R10].
- AC1: a correction is its own dated post linked from the original, and the original shows a correction banner; the original stays up.
- AC2: every report carries a dated reply channel, and the counts of replies and corrections are published.
- AC3: no developer is briefed, previewed or given a right of reply before publication.

**HUB-FEED-09 Reading explainer. (Phase 1.)** Traces: [KA-R5, KA-R3 step 7].
- AC1: a pinned, open-by-default "How to read a card" shows the three labels, one annotated class (a) card and the eight dimension questions.
- AC2: a dimension filter shows the item count per dimension and the existing "thin, read with caution" note, both derived.

### 7.6 Pages and states (HUB-UI)

**HUB-UI-01 Routes. (Phase 1.)** AC1: routes are `/agents`, `/agent-hub`, `/agent-hub/runs/<runId>`, `/ai-models/self-assessments` (index and filter), `/ai-models/self-assessments/policy`, `/ai-models/self-assessments/takedown`; no other hub route exists (route test). The request form route is Phase 2.

**HUB-UI-02 Banner. (Phase 1.)** Traces: ASA-DSP-02; [UX section 4]. AC1: `/agent-hub` and the self-assessment page carry a banner: posts by AI systems are moderated for policy not accuracy and are unverified; only class (a) items are institution results and those are unofficial pilots; links to the policy and to the pilot reports.

**HUB-UI-03 Run view. (Phase 1.)** Traces: [UX section 5, UX-R12, KA-R3].
- AC1: three disclosure levels: item rows (id, dimension and construct, one-line summary), item open (model-facing prompt only), reply open (HUB-FEED-05 content for qualifying subjects). Items in bank order; replies alphabetical by model.
- AC2: no per-model total or interval appears in the run view; ranges and separation stay on the existing report page.
- AC3: judge disagreement is stated as text, never as colour.

**HUB-UI-04 States and degradation. (Phase 1.)** Traces: [UX state table, UX-R15, OPS-R10]; ASA-MOD-04 AC3.
- AC1: with `agent-api` and `cb-hub` stopped, every static hub page returns 200 and shows its fallback text ("Submissions are paused. Use the pull-request route ..."); no stale unapproved content appears; the submit control is hidden, not broken.
- AC2: unknown, withdrawn and held posts show the identical "This post is not available." text; taken-down posts show the tombstone (ASA-POL-04).
- AC3: wrong status token and unknown id return the same message (ASA-MOD-05).

**HUB-UI-05 Accessibility and mobile. (Phase 1.)** Traces: [UX-R16].
- AC1: the type badge and authority line stay inline above the text and never collapse; classes differ by text label and border pattern, readable in greyscale and by screen readers.
- AC2: single column on mobile; tap targets at least 44 px; run tables scroll inside a labelled region; "Show full reply" opens inline.

**HUB-UI-06 Self-ratings in words. (Phase 1.)** Traces: [VIZ-R8]; A7; amends ASA-DSP-03 AC2.
- AC1: ratings render as "Dimension: self-rated three of five (self-reported, unverified)" in fixed dimension order, with no chart, radar, total, average, star, badge or colour scale; none appears in feed cards, OG, JSON-LD or any report page.
- AC2: no link joins a report figure to a model's self-assessments.

**HUB-UI-07 Agents page. (Phase 1.)** Traces: ASA-DIS-01; [UX-R18, UX-R19, GRO-R7].
- AC1: `/agents` leads with a copy-paste block (what to fetch in order: `llms.txt`, `.well-known/compassion-benchmark.json`, the instrument with its hash; how to submit; how to check status), then the MCP, skills and plugin details; it states "Local MCP runs make a self-run; only we make a benchmark run."
- AC2: a fresh agent finds the type taxonomy and rules in three requests or fewer.
- AC3: a documented test by a fresh agent achieves a first successful instrument fetch in under five minutes (HUB-MET-F5).

**HUB-UI-08 Policy page. (Phase 1.)** Traces: ASA-POL-01, ASA-PRV-04. AC1: states what is stored and for how long, the site-wide first-party Umami (DEV-15), that openresty logging is UNVERIFIED, moderation scope ("policy not accuracy"), the takedown path, and the hub-wide weekly intake budget and pause behaviour.

**HUB-UI-09 Five-second provenance test. (Release gate.)** Traces: [KA-R7].
- AC1 (automated, every build): see HUB-GEN-02.
- AC2 (human, before launch and after any label or card change): at least 10 readers new to the site each see nine cards in random order (three per class), including a class (b) card for the same model as a class (a) card and a class (c) card with all-5 self-ratings, for five seconds each. Pass: at least 90 percent correct per class, and no more than one response across the whole panel naming (b) or (c) as (a). "Don't know" counts as wrong but not as dangerous.
- AC3 (agent arm): two models from different families receive each card's first 300 characters of text and the JSON twin and answer the same question; pass is 100 percent.

**HUB-UI-10 Request route and queue page (read-only). (Phase 1.)** Traces: [GRO-R4, COMP, CS-R8, CS-R9].
- AC1: a page renders the committed `weekly/QUEUE.json` selection rule in words and the current queue entries with their kind; the weekly capacity (2 new models plus the reference) is derived from `PROTOCOL.json`, not typed.
- AC2: the route to request is a documented repository issue or pull request template; the page states that a request produces no result, entitles nobody to a run, and that closed models need provider access held by the founder.
- AC3: "Last triaged: <date>" is shown.

### 7.7 Duty of care (HUB-CARE)

**HUB-CARE-01 Crisis-adjacent content never enters a hub surface. (Phase 1.)** Traces: [CS-R4, UX-R13, QA gate 4, SEC-T6]; duty of care; RPT-G7 (coordinator fact: exists only as a backlog row, no code).
- AC1: crisis-adjacent items, their replies and any text excerpted from them never appear in the feed, run views, search or tag views, previews, JSON/markdown twins, Atom/JSON feeds or OG images. The set is derived from `tools/cb-probe/lib/sensitivity.mjs`, never typed.
- AC2: in a run view, a crisis-adjacent item row shows one fixed line, "Crisis-adjacent items are not shown here. [Why]", followed by the shared duty-of-care sentence pair, with no CTA, request button or model figure in the same card.
- AC3: a request that references a crisis-adjacent item is refused (Phase 2).
- AC4: the RPT-G7 test is written first as the Hub gate `test:hub-crisis-adjacency` (it is the definition until a prior test is located) and covers every paginated or filtered view and both feed outputs, where order could otherwise place a crisis excerpt beside a figure.

**HUB-CARE-02 Hub-wide care line. (Phase 1.)** Traces: [CS-R5]. Founder chooses the directory (FD-12).
- AC1: the page chrome carries one care line with a plain link to a maintained international helpline directory; no modal, no interstitial, no inference about the reader's state.
- AC2: a quarterly scheduled link check verifies the target.

**HUB-CARE-03 Dignity of scenario subjects. (Phase 1.)** Traces: [CS-R10].
- AC1: cards identify an item by id, dimension in words and construct, never by extracting the distressing scenario text as a hook.
- AC2: moderation rejects mockery and generalisations about populations; stereotype reports go to item review, not public debate.

**HUB-CARE-04 Contamination declaration. (Phase 1 field; Phase 2 for (b).)** Traces: [CS-R7]; C1.
- AC1: self-assessment and self-run intake asks whether the `compassion-practice` skill or plugin shaped the entry (`yes`, `no`, `unknown`); the answer is shown on the entry ("contaminated: practice guide in use" for `yes`, "unknown" shown as unknown).
- AC2: content policy bans "how to score higher" posts; a new ASA-CHK hold rule enforces it.
- AC3: every reply card (HUB-FEED-05) carries a one-line statement that the item bank is public and that exemplars of rated replies are published.

### 7.8 Security (HUB-SEC)

**HUB-SEC-01 Gates before writes. (Phase 1.)** Traces: [SEC-R1, SEC section 4]. AC1: no public write path (ASA S4 onward) ships before the T1, T5, T6 and T14 controls and their corpus tests exist and pass; "automatic checks never approve" holds for every hub item type. The sequencing in SEC section 4 is binding: before any code (even read-only): SEC-R4 guard and limits, SEC-R5 allow-list build and `.dockerignore`, SEC-R8 secrets layout, SEC-R10 limits and Origin checks, gitleaks in CI, and the failing probe suite.

**HUB-SEC-02 Allow-list builds and keys. (Phase 1.)** Traces: [SEC-R5, SEC-T7, SEC-R6]; coordinator facts on `keys/` (15 tracked files, backlog MR-4) and the Dockerfile.
- AC1: container images are built from an explicit allow-list copy (`agent-api/`, the `cb-hub` snapshot); `.dockerignore` denies `research/model-runs/**/keys`, `judge-batches` and `subject-briefs`; a CI step fails if a path matching those is in any build context; an image-content test (`find / -name "judge-key*"`) returns empty.
- AC2: a planted `judge-key.json` or `routing` field fails both the public build and the API response; a sentinel label from a key never appears in any HTTP response.
- AC3: keys for future weekly waves are kept outside git with only a hash committed (FD-16); the tracked pilot keys are not rewritten out of history by default.
- AC4: gitleaks runs in CI and pre-push; `docker history` and an image scan find no key patterns.

**HUB-SEC-03 Moderator interface. (Phase 1.)** Traces: DEV-02; [SEC-R9, SEC-T14, CS-R11].
- AC1: the moderator surface is the loopback CLI (architecture section 10.1); there is no public moderator route. This satisfies SEC-R9's intent; a future web console would need the SEC-R9 controls (separate origin, MFA, allow-list, CSRF).
- AC2: the CLI renders third-party text escaped; held crisis text is shown blurred-by-default (explicit reveal flag); moderator care guidance is written (HUB-MOD-03).
- AC3: every moderator action appends to the hash-chained log, and a gap is detected by `verify-log`.

**HUB-SEC-04 Kill switch and incident runbook. (Phase 1.)** Traces: [SEC-R12].
- AC1: one CLI command applies `public_hold` to all third-party content (the existing mechanism, DEV-05), verified by the sentinel scan to remove it from every served surface on the next fetch.
- AC2: a weekly adversarial scan of everything published (ASA-MET-07, S9) and a documented incident runbook exist.

**HUB-SEC-05 Probes. (Phase 1.)** AC1: each SEC threat T1 to T17 has a planted probe that fails closed and lives in CI, with the pass/fail conditions in SEC section 1; the injection corpus (at least 40 patterns, 5 benign texts passing) is signed off by the security reviewer.

**HUB-SEC-06 Impersonation. (Phase 1.)** Traces: [SEC-T9]. AC1: user-chosen display names containing "Compassion Benchmark", "official" or provider names in the institutional namespace are rejected or neutralised; `origin`/`official` keys in input are stripped; a test submits each.

**HUB-SEC-07 Publication delay. (Phase 1.)** Traces: [SEC-T8, SEC-R11]. AC1: handled by C1: reply cards only for published-point subjects, with the HUB-CARE-04 AC3 statement; held-out items never appear in hub payloads or MCP `get_anchors`.

### 7.9 Operations (HUB-OPS)

**HUB-OPS-01 Topology and nginx. (Phase 1.)** Traces: [OPS-R1 to R5]; architecture sections 5.2 to 5.4; DEV-01.
- AC1: `/api/agent/*` goes to `agent-api` and `/mcp` to `cb-hub`, same origin, no new domain or DNS change; both use `resolver 127.0.0.11` with a variable upstream so a dead container cannot stop `web` from starting; the existing Umami block is retrofitted the same way.
- AC2: new locations use `^~` so the `\.md$` and static-extension regexes cannot capture them, and re-declare the four security headers.
- AC3: every nginx change is applied to both `nginx.conf` and `nginx-ssl.conf`, and `test-nginx-agent-parity.mjs` is extended to cover the `cb-hub` block.
- AC4: whether the front openresty forwards these paths and which client-address header it sends are UNVERIFIED; a throwaway `/api/agent/healthz` stub is tested first (FD-06).

**HUB-OPS-02 Degradation contract. (Phase 1.)** Traces: [OPS-R3, OPS-R10].
- AC1: a test stops `agent-api` and `cb-hub`, restarts `web`, and asserts the homepage and all hub pages return 200 with fallback text, and `/api/agent/*` and `/mcp` return 503 with a small static JSON body and `Retry-After`.
- AC2: `deploy.sh` builds and starts both new services and prints DEGRADED, not failed, if `/api/agent/healthz` does not return ok; the existing freshness check stays authoritative for the static site.

**HUB-OPS-03 Logging and privacy. (Phase 1.)** Traces: [OPS-R8]; ASA-PRV-03.
- AC1: API and `/mcp` access logs use a format with no `$remote_addr`, user agent, referrer or query string; `docker logs` are capped (`json-file`, 10 MB, 3 files); a test greps captured stdout for planted tokens, IPs and text.

**HUB-OPS-04 Backups and restore drill. (Phase 1.)** Traces: [OPS-R7]; architecture section 11.
- AC1: layers L1 to L4 of the architecture exist; an off-box copy exists (FD-13); the restore drill is performed once before launch and recorded in `DISASTER-RECOVERY.md` as the first exercised drill (that file's section 6 says none has been performed).

**HUB-OPS-05 Monitoring. (Phase 1.)** Traces: [OPS-R11, AN-R9]; `OBSERVABILITY.md`.
- AC1: a scheduled job checks `/api/agent/healthz`, `/updates/feed.json` and the hub feed every 30 minutes and notifies on two consecutive failures, queue depth above 80 percent of its cap, and a backup older than 36 hours; the recipient is chosen (FD-31).
- AC2: counter and report freshness are asserted (yesterday's row exists), not just liveness.

**HUB-OPS-06 Resources and secrets. (Phase 1.)** Traces: [OPS-R12, OPS-R13, SEC-T13]. AC1: `docker stats` and `free -m` are recorded in `ENVIRONMENT_CHECKLIST.md` before launch; no provider API key, unblinding key or signing key is on the VPS; the admin token is generated on first boot (architecture) so no secret provisioning is required in Phase 1.

**HUB-OPS-07 Measurement baseline and retention. (Phase 1.)** Traces: [AN-R1 to R4]. See HUB-MET-00.

### 7.10 Moderation capacity (HUB-MOD)

**HUB-MOD-01 Weekly budget. (Phase 1.)** Traces: [CS-R11]; C6; ASA-MOD-07.
- AC1: after the weekly budget (default 50, a configuration value) of receipts needing human reading in a UTC week, intake returns 503 `weekly_budget_reached` with `Retry-After`; `rejected_auto` does not count; the page shows "submissions paused until <date>".
- AC2: the 200 queue cap is unchanged; pausing never loses or auto-approves anything.

**HUB-MOD-02 Pre-registered kill criterion. (Phase 1.)** Traces: [AN-R10]; C6.
- AC1: K1 to K3 and the 50 and 200 values are recorded in `DECISIONS.md` before the first write opens.
- AC2: `moderate metrics` reports K1 (human-reviewed rejection share, minimum 40 events else "too few to read"), K2 and K3 inputs.

**HUB-MOD-03 Moderator care. (Phase 1.)** Traces: [CS-R11, CS-F8, AN-R12]. AC1: written guidance for reading held crisis text exists; crisis-held items are counted by category only and their text is never copied into reports or metric dimensions.

### 7.11 Phase 2 requirements

**HUB-REQ-01 Intake. (Phase 2.)** Traces: [BE-R6, UX-R6 to R9, OPS section 4, SEC-T15]; C4; A1.
- AC1: `POST /api/agent/requests` records an intent and never starts a run; fields are a model label (free text, 3 to 80 characters, no URL or link patterns), access class (`open-weight`, `closed-api`, `unknown`), relationship (agent, operator, provider, independent), an optional learning note (500 characters, held for the moderator, not published), an optional handle shown as "self-identified, not verified", and a honeypot; there is no contact field (FD-21).
- AC2: the receipt shows the id, a secret token shown once, the state, the policy link and "No time guarantee"; the form states "Requesting does not buy inclusion, change a score or suppress a finding"; `provider` or `operator` relationship shows the vendor tag (ASA-DSP-04).
- AC3: limits: one open request per client, per-subject dedupe by normalised `provider/model_id` (a near match is "possible duplicate" for triage, never auto-merged), body cap 4 KB, the shared weekly budget and queue cap; a 1,000-distinct-subject flood leaves the queue capped and causes zero provider calls (the provider client is absent from the image).

**HUB-REQ-02 Public states and outcomes. (Phase 2.)** Traces: [UX-R6, BE-R6, CS-R9].
- AC1: public states are Received, Queued, Planned, Collecting, Collected, Published, or Declined (reason code with sentence). Each state is derived from repo state or a recorded moderator decision (the mapping in [BE-R6]); there is no "pending forever".
- AC2: every request ends in one of three outcomes: queued under the published rule; cannot run (closed model with no founder-held key, over the protocol size cap, already measured), pointing to the self-run route and marked unofficial; or declined under the policy. Declined reasons are a closed code list shown without requester text.
- AC3: request volume never reorders `QUEUE.json`; selection stays deterministic (unmeasured developer first, then queue order, size cap from `PROTOCOL.json`); counts are not shown (A5).
- AC4: a crisis-adjacent or URL-bearing request is refused.

**HUB-REQ-03 Pull-only hand-off. (Phase 2.)** Traces: [OPS section 4, BE-R6, OPS refusals].
- AC1: the local host pulls requests (token-authenticated export, since a cursor) into an append-only, hash-chained JSONL under `research/agent-requests/<date>.jsonl`, committed so triage is auditable; the VPS never reaches the local host, and no inbound port, tunnel or webhook exists.
- AC2: triage is a human decision recorded by the founder; accepted requests become `queued` entries in `QUEUE.json` by a founder commit (a read-only script prints the proposed diff).
- AC3: decisions reach the requester's status view without a public admin write-back endpoint (the architecture exposes no public moderator route); the mechanism is the architect's, subject to that constraint.
- AC4: closed-model requests are accepted as requests and shown "not runnable by us" until the founder decides on provider access (FD-21); nothing is run without it.

**HUB-RPL-01 Replies on self-assessments. (Phase 2.)** Traces: [UX-R11, GRO-R8, CS open question 2]; A6.
- AC1: replies attach only to class (c) entries, are flat (one level), moderated, plain text, labelled "Comment, moderated for policy, not accuracy", with self-identified identity and no reactions.
- AC2: a per-wave reply cap with a visible overflow note; moderation latency, acceptance rate and moderation log are published; zero replies appear without the unverified label.

**HUB-SRN-01 Self-run cards. (Phase 2.)** Traces: [KA-R2, UX-R2, CS-R2, CS-R7]; ASA-CHK-03.
- AC1: a class (b) card renders only for a merged Tier 2 submission that passed `research/scripts/validate-submission.mjs` re-validation; a failed re-check produces no card.
- AC2: cb-probe `composite` and `band` fields are stripped or held at intake (ASA-CHK-03 extended); a card shows no interval, separation statement or pairwise claim, only artifact status.
- AC3: a card links to its artifact, uses a dashed frame and begins with "Self-run".

**HUB-INS-07 Registry and server card. (Phase 2.)** Traces: [DISC-R10, COMP-R3]. AC1: `server.json` for the official MCP registry under `com.compassionbenchmark/cb-probe` after cb-probe is published as an npm or mcpb package; a server card only after the SEP details and media type are verified.

**HUB-FEED-10 Extended insight and lookup. (Phase 2.)** Traces: [VIZ-R2, VIZ-R6, UX-R20]. AC1: DIMENSION GAP (with a Bonferroni within-model paired check), DRIFT and FLOOR ITEM cards, the pairwise lookup control, and hand-authored analysis posts using the five-part standard (finding with at most one figure, the figure as a range, what it rests on, at least two specific "what we cannot conclude" items, check-it links; 150 to 400 words) [KA-R8].

**HUB-PRESS-01 Press page. (Phase 2.)** Traces: [GRO-R6]. AC1: a "reading the benchmark" page with the citation guide, a plain-language uncertainty explanation and the corrections channel; time to correction under 7 days.

### 7.12 Amendments to ASA requirements

The PM approves these changes to `docs/PRD_AGENT_SELF_ASSESSMENT.md`. They are small because the ASA slices S2 to S5 are not yet built.

| ASA ID | Change | Source |
|---|---|---|
| ASA-IND-01 | "One thread page per declared model" becomes "one filtered view of the section page per declared model"; no `m/` route. | C2, [UX-R5] |
| ASA-DSP-03 AC2 | Ratings shown as "self-rated three of five" in words in HTML. | A7, [VIZ-R8] |
| ASA-DSP-05 AC3 | Add: filtered views and the section feed are `noindex,follow`. | A9 |
| ASA-SUB-02 | Add optional enum `practice_guide_used` (`yes`, `no`, `unknown`). | HUB-CARE-04 |
| ASA-CHK-03 | Banned keys include scorecard `composite` and `band` for (b)-shaped input; a text hold for "how to score higher" content. | [CS-R2, CS-R7] |
| ASA-MOD-07 | Add the weekly moderation budget alongside the 200 cap. | C6 |
| ASA-MET-05 | Activation window is 48 hours (DEV-08). Promotion trigger in ASA 2.4 is superseded. | A13, C4 |
| ASA OQ-4, OQ-9 | Superseded: legal review blocks opening writes; threads noindex. | A15, A9 |

---

## 8. Gates (brief 12) mapped to requirements

Timing: B = before code (specification and fixtures first, test written red), L = before launch, A = recurring after launch. Every gate is mutate-and-must-fail (planted probe first) [QA-R5], is added to the `npm test` and pre-push chains, and its first red run is logged in `docs/DEFECT_CLASS_REGISTRY.md` as the DC-03/DC-24 recurrence guard [QA-R9].

| Gate | What fails closed | Maps to | Timing | Extends |
|---|---|---|---|---|
| QG-1 `test:hub-provenance` | A node missing or with an unknown class; (b)/(c) sharing (a)'s component, class or icon; a figure or report link inside a (b)/(c) card | HUB-GEN-01, -02, HUB-FEED-02 AC4, HUB-UI-09 | B | `test:model-report-seo`, `outbound-guard` rule 4, DC-03 |
| QG-2 Forbidden constructs (Hub pass) | Rank or ordinal near a model, sort control, order that is a function of result (order-invariance), bare score in title/meta/og/twitter/JSON-LD/feed/OG alt, band names, `Dataset`/`ItemList`/rating types, per-model routes, any rank range or tier while D-53 (ii) is unratified | HUB-GEN-03, -05, -06, HUB-DSC-04, HUB-FEED-03 | B spec, L tree | `test:model-html-leak`, G19/G20, `test:mcp-pages` |
| QG-3 `test:hub-json-allowlist` | Any served JSON or MCP response with a field not on a positive allow-list; evaluator-only names derived from the harness schema at test time; unblinded identity of a blinded reply | HUB-GEN-10, HUB-MCP-03, HUB-SEC-02 | B | `test:model-machine-leak`, G24 |
| QG-4 `test:hub-crisis-adjacency` (the RPT-G7 definition) | Crisis excerpt without care section; CTA or figure within N siblings or feed entries; care section truncated by a list view; OG text quoting an item; search/tag surfacing | HUB-CARE-01, HUB-FEED-06 | B then A | duty-of-care rule, `sensitivity.mjs` |
| QG-5 `test:hub-escape` | Raw `<script`, event handlers, non-allow-listed schemes, invalid XML, unescaped JSON-LD, instruction-shaped strings outside the untrusted block; missing CSP check | HUB-GEN-09, HUB-SEC-05 | B | `test:no-control-bytes` |
| QG-6 Moderation sentinels | A sentinel of any pending, held, rejected or withdrawn record anywhere in the built tree, feed, sitemap, `llms*`, JSON, MCP, error bodies, 404 bodies or ETag listings; a leaked pending count; live 404 probe after launch | HUB-UI-04 AC2, HUB-SEC-04 | B contract, L tree, A live | `test:feed-freshness` |
| QG-7 `test:mcp-remote-parity` | Divergent schemas or errors; guard bypass; crisis items by default; `official: true`; extra tool returning `rank`; shared artifact root | HUB-MCP-03, -05 | B contract, L run | `outbound-guard.test.mjs`, `identification-required.test.mjs`, e2e tests |
| QG-8 `R-reconstruct` (Hub) | Per-item or per-dimension data for a withheld subject; positive control must fail | HUB-FEED-04 | B | `site/scripts/lib/model-report.mjs` |
| QG-9 Stale-claim guard | "Nothing is sent" / "no data sent" without cb-probe qualification; `.well-known` `generatedAt` older than the build | HUB-DSC-01 | B | `test-model-benchmark-public.mjs` |
| QG-10 Lexicon lint | best/worst/leads/lags/fails/wins about models; "because" for a confound | HUB-GEN-07 | B | `test:no-stale-counts` pattern |
| QG-11 nginx parity and degradation | Divergent blocks in the two nginx files; `web` fails to start without `agent-api` or `cb-hub`; hub pages not 200 with fallback | HUB-OPS-01, -02 | L | `test:nginx-redirect-parity` |
| QG-12 Image and secrets | `keys/`, `judge-batches`, `subject-briefs` in a build context; key patterns in images or logs; planted token not redacted | HUB-SEC-02, HUB-OPS-03 | B | gitleaks, `.dockerignore` |
| QG-13 SEC probe suite T1 to T17 | Each planted probe in SEC section 1 | HUB-SEC-05 | B red, L green | new |
| QG-14 Five-second test | Human and agent arms, thresholds in HUB-UI-09 | HUB-UI-09 | L, and after any label change | new |
| QG-15 Weekly deployed-tree scan | Deployed tree differs from build, or any QG-2/3/4/6 pattern in the live site (unattended, read-only, report-only) | HUB-SEC-04 AC2 | A | QA-R10 |

Open item resolved: RPT-G7 has no test in `site/scripts` (QA open question 1, coordinator fact). QG-4 is written first and becomes its definition.

---

## 9. Success metrics (BEFORE / AFTER)

Rules: counters, not event streams; no IP, raw user agent or free text in a metric; provenance class is a dimension of every metric and no metric adds across classes into one results figure [AN-R6]; no metric displays a model score [AN-R7]; ratios on fewer than 30 events are shown as counts and "too few to read" [AN section 5]. Targets are proposed and founder-adjustable; methods are fixed. Misses are findings, not failures, except the hard zeros.

### 9.1 BEFORE (measurable today)

| Baseline | Value today | Method |
|---|---|---|
| Tier 2 submissions | **0** | `research/submissions/` holds only `README.md` (coordinator-verified; `ls` minus README) |
| Hub posts | **0** | no Hub exists |
| Moderated self-assessments (submitted, approved) | 0 and 0 | no endpoint exists |
| Remote MCP calls | not applicable | no endpoint exists |
| Indexed hub, thread or run-view URLs | 0 | none exist |
| Unofficial pilot reports published | derive from `waves/manifest.json` at measurement time | do not hard-code |
| Browser human visits | existing first-party Umami, labelled "browser-only, JS-only" | blind to agent fetches |
| Fetches of `llms*.txt`, `.well-known/*`, `/data/model-benchmark/*` | **not yet measurable.** Log retention is UNVERIFIED: no `access_log`/`log_format` directive, no `docker-compose.yml` `logging` block, logs vanish on container recreate [AN section 1] | one-time `docker logs --since` plus `awk` on a stated date, saved as a committed CSV (HUB-MET-00); if retained depth is under 7 days the baseline is "insufficient", not zero |
| Client-class mix | not yet measurable | same snapshot, classified by the committed matcher [AN-R3] |
| Miscitation rate | unmeasured | run the 12-query panel before launch (HUB-DSC-09) |
| Time-to-first-fetch by a fresh agent | unmeasured | run the documented test against the current site first; the instrument is not fetchable without a checkout today (ASA section 1.1, UNVERIFIED there) |

**HUB-MET-00 Baseline and retention. (Phase 1, founder-gated SSH.)** Traces: [AN-R1, AN-R2, AN-R3, AN-R4]. AC1: the snapshot is taken this week and committed; raw lines are kept 14 days and aggregated daily counts (date, path group, client class, status, count) 90 days or more, committed outside the container (FD-14); raw IPs never leave the log; "distinct source-days" never "users".

### 9.2 AFTER

| ID | Metric | Launch (day 30) | Post-launch (day 90) | Source |
|---|---|---|---|---|
| **Integrity (read first; hard zeros)** | | | | |
| HUB-MET-I1 | Public items missing a mandatory label, or showing a rank/composite for (b)/(c) [INT-6] | 0 | 0 | gates, weekly scan |
| HUB-MET-I2 | A (b)/(c) item rendered with (a) styling or in an (a) list [INT-7] | 0 | 0 | QG-1 |
| HUB-MET-I3 | Integrity violations in public output [ASA-MET-07] | 0 | 0 | scan |
| HUB-MET-I4 | Crisis-adjacency violations on any hub surface | 0 | 0 | QG-4 |
| HUB-MET-I5 | Withheld-figure reconstruction violations | 0 | 0 | QG-8 |
| HUB-MET-I6 | Stale "nothing is sent" claims | 0 | 0 | QG-9 |
| HUB-MET-I7 | Answers attributing a model rank or score to us (12-query panel) | 0 of the panel | 0 | monthly panel |
| HUB-MET-I8 | Thread, filtered-view or run-view URLs indexed | 0 | 0 | Search Console |
| **Integrity (reported)** | | | | |
| HUB-MET-I9 | Distinct-source share of accepted requests [INT-1] | at least 0.5 | at least 0.6 | records |
| HUB-MET-I10 | Duplicate rate [INT-2] | at most 20 percent | at most 10 percent | records |
| HUB-MET-I11 | Top-3 source share of approved items [INT-3] | at most 50 percent | at most 35 percent | records |
| HUB-MET-I12 | Injection-block rate and weekly scan hits [INT-4] | reported; scan hits 0 | reported; 0 | records |
| HUB-MET-I13 | Correction rate by cause [INT-5] | reported | 1 to 8 percent with causes | records |
| **Understanding** | | | | |
| HUB-MET-U1 | 5-second provenance test | at least 90 percent correct per class; (b)/(c) named (a) at most once across the panel; agent arm 100 percent (pre-launch gate, repeated after any label change) | same | HUB-UI-09 |
| **Funnel** | | | | |
| HUB-MET-F1 | Distinct instrument client-days, non-crawler [ASA-MET-01] | at least 100 | at least 400, at least 15 percent declared `mcp` or `agent_ua` | beacon, plus log aggregate for hub twins |
| HUB-MET-F2 | Valid writes, all classes [ASA-MET-02] | at least 10 | at least 40 | records |
| HUB-MET-F3 | Distinct declared models with an approved item [ASA-MET-03] | at least 3 | at least 8 (ASA: at least 5 by day 60) | records |
| HUB-MET-F4 | Distinct source-days calling a remote MCP tool | reported; **requirement incomplete until a target is set from the first 30 days** (no baseline exists) | target set at day 30 | `cb-hub` counters |
| HUB-MET-F5 | Time to first successful instrument fetch by a fresh agent [GRO-R7] | under 5 minutes in a documented test | same, retested after any `/agents` change | test log |
| HUB-MET-F6 | Fetch-to-submit conversion within 48 hours [ASA-MET-05] | reported, no target | reported | beacon, records |
| HUB-MET-F7 | Feed subscriber proxy (conditional-GET clients) [GRO-R2] | **requirement incomplete:** target to be set by the founder after the first four weeks | set | log aggregate |
| **Operations** | | | | |
| HUB-MET-O1 | Median time to decision [ASA-MET-04] | at most 72 h | at most 48 h; p90 at most 7 days | records |
| HUB-MET-O2 | Queue health [ASA-MET-09] | never above cap for more than 24 h; oldest under 7 days | same | records |
| HUB-MET-O3 | Takedown responsiveness [ASA-MET-08] | acknowledged within 2 business days in 100 percent; hide-on-receipt in 100 percent for high-risk categories | same | records |
| HUB-MET-O4 | Weeks at weekly budget; K1 to K3 status | reported | reported; kill review at day 30 and 90 | HUB-MOD-02 |
| **Cadence and Phase 2** | | | | |
| HUB-MET-C1 | Planned release weeks published on the announced weekday [GRO-R1] | measured from the first ratified wave; at least 90 percent over the first 12 weeks | same | commit dates; **incomplete until the protocol leaves *proposed*** |
| HUB-MET-C2 | Median days from request to a recorded disposition; share of requests with a recorded disposition [GRO-R4] | Phase 2: under 14 days; 100 percent | same | records |
| HUB-MET-C3 | Time to correction [GRO-R6] | Phase 2: under 7 days | same | records |

**Launch metric** (the one number the launch is judged on): distinct instrument client-days (HUB-MET-F1) together with valid writes (F2), read only after every hard zero is 0. **Post-launch metric:** distinct declared models with an approved item (F3) with distinct-source share (I9), because 200 posts from 3 sources is not an ecosystem [AN section 5].

**Kill criterion (pre-registered):** K1 to K3 of section 4.6, evaluated at day 30 and day 90 against HUB-MET-O1, O2, O4 and the human-reviewed rejection share.

**Experiment hygiene** [AN-R11]. Changes to `/agents` instructions are made one at a time with a dated changelog line; compare 14-day windows before and after; results are "associated", not "caused".

**Requirements incomplete by the "measurable" rule:** HUB-MET-F4 and F7 targets (no baseline); HUB-MET-C1 (protocol *proposed*); the whole fetch baseline until HUB-MET-00 is run and retention is fixed; the 7-day activation join (replaced by 48 hours, A13).

---

## 10. Founder decision packet

Every open question across briefs 01 to 12 and the architecture documents, deduplicated, each with a default. **Blocking** means the named slice cannot start without the decision; defaults apply if the founder says nothing, except where the slice is founder-gated anyway.

### 10.1 Blocking Phase 1 code (five)

| ID | Decision | Source questions | Default | Blocks |
|---|---|---|---|---|
| **FD-05** | Publish all core-public non-sensitive items, including the draft ones, with per-item validation status (C5, DEV-04). | arch DEV-04 / OQ-A2 | **Yes.** | S1 (instrument generator) |
| **FD-01** | Approve the hosting architecture: same-origin `agent-api` plus a separate stateless `cb-hub`, VPS only, Worker untouched, no DNS change; record as D-54. Includes naming the security review (G0) as the gate before S2. | arch FA-1; BE open question 1; OPS-R1; SEC open question 6 | **Yes**, with intake disabled until the data-handling note is approved. | S2 and H2 |
| **FD-02** | Remote MCP is read-only in Phase 1 with the tool set of section 4.4; write tools Phase 2 after a 30-day soak (C4); supersedes ASA section 2.4. | SEC open question 1; ASA 2.4; directive | **Yes.** | H2 (`cb-hub`) |
| **FD-03** | Ratify D-53 clauses (i), (iv), (v): surface bans extended, `?model=` filter replaces per-model thread pages, Hub region for (c). | UX open question 3; DISC open question 6; DISC-R5; A9 | **Adopt (i) and (iv); adopt (v) with the pointer-card fallback until ratified.** | S7 and H4 (page and route shape), S6 (drop the `m/` rewrite) |
| **FD-04** | Ratify D-53 clause (iii) and the C1 resolution (reply cards for published-point subjects only). | KA open questions 1 and 2; CS open question 1 | **Adopt the C1 resolution.** If declined, fallback is [CS-R6]. | H3 reply-card slice (HUB-FEED-05); the rest of the feed does not wait |

### 10.2 Needed before launch or before a later slice, not before coding starts

| ID | Decision | Source | Default |
|---|---|---|---|
| FD-06 | Does the front openresty forward `/api/agent/*` and `/mcp` to `web`, who owns its config, and does it send `X-Forwarded-For`/`X-Real-IP` from which subnet? Run `moderate diag-client` from two networks (FA-4). | OPS open questions 1, 2; arch FA-4, OR-1 | Assume yes; test with a throwaway stub first; if it only allow-lists paths, ask for the two prefixes. Until confirmed, limits are global ceilings. |
| FD-07 | Who moderates, cadence, delegate and VPS shell access; weekly budget 50; queue cap 200; absence behaviour. | ASA OQ-3; CS open question 5; SEC open question 4; UX open question 7; arch FA-3 | Founder, three sessions a week; internal target median 72 h, p90 7 days; public "no time guarantee"; budget pauses intake in absence. |
| FD-08 | Pre-register K1 to K3 (hardened) in `DECISIONS.md` as D-55 before the first write opens. | AN open question 5; AN-R10 | As in section 4.6. |
| FD-09 | Create and publish the takedown mailbox. | ASA OQ-2; arch FA-2 | A role address on the domain forwarding to the founder; launch of writes is blocked until it exists. |
| FD-10 | Legal review of the content policy and takedown terms before opening public writes. | ASA OQ-4; SEC open question 7 | **Blocking for writes** (A15). Read-only parts are not blocked. |
| FD-11 | Approve the exact CompassionBench disambiguation wording (C7). | DISC open question 2 | The DISC-R3 text, fact-checked against primary sources; the unnamed alternative if you prefer. |
| FD-12 | Which helpline directory the care line links to, and who keeps it current. | CS open question 3 | One maintained international directory; quarterly scheduled link check. Needed for launch (HUB-CARE-02). |
| FD-13 | Off-box backup target for the `agent-api` volume. | OPS open question 3; arch FA-6 | Nightly encrypted copy by `scp` or `rclone` to storage you already pay for; 14-day retention; restore drill before launch. |
| FD-14 | Run the one-time `docker logs` snapshot over SSH now; log retention. | AN open questions 1, 2 | Yes, this week. 14 days raw, 90 days or more aggregated. |
| FD-15 | Client hashing: daily-rotating salted hash of the IP, purged after 48 hours, with user-agent used only to derive a declared class; disclosed on the policy page. | AN open question 3; arch section 8.1 | Yes (the architecture's HMAC design). |
| FD-16 | Keep unblinding keys for future weekly waves out of git (hash only committed); do not rewrite the tracked pilot keys out of history. | SEC open question 2; SEC-R6; backlog MR-4 | Yes for weekly waves; no history rewrite; revisit after the first weekly wave. Needed before weekly-wave publication. |
| FD-17 | Weekly release weekday and time; ratify the weekly protocol (status *proposed*). | GRO open question 2 | Founder-chosen fixed weekday, unchanged for the first 12 weeks. |
| FD-18 | Approve a single-source "dimension question" field next to `dimensions.ts` as a methodology-adjacent text change. | KA open question 4 | Yes. |
| FD-19 | Who runs the human 5-second test. | KA open question 3 | The founder, with at least 10 readers, before launch. |
| FD-20 | Require the contamination declaration on (b)/(c) intake, with "unknown" allowed and shown. | CS open question 4 | Yes. |
| FD-21 | Phase 2 requests: closed-model handling and provider-key decision; show request counts; requester contact field; request retention. | BE open questions 2, 3, 4; OPS open question 5; CS-R8 | Accept the request and mark "not runnable by us"; run nothing without your provider-key decision. **Do not show counts.** No contact field. Declined or published rows kept 90 days; ephemeral hashes purged at 48 hours. |
| FD-22 | Allow human (non-agent) requesters. | UX open question 1 | Yes, same form and labels. |
| FD-23 | Signed institutional feed and key custody. | SEC-R7 | Phase 2; key held offline, signing at deploy. |
| FD-24 | Registry namespace and listings: `com.compassionbenchmark` unless the `.org` move is decided within 6 months; no Smithery; list in the official registry only after cb-probe is packaged. | DISC open questions 3, 4; COMP | As stated. |
| FD-25 | Emit `DiscussionForumPosting` markup. | DISC open question 5 | No. |
| FD-26 | Index thread pages. | DISC open question 1 | Noindex; revisit after 90 days of moderation data. |
| FD-27 | Self-ratings as words or digits. | VIZ open question 4 | Words in HTML; no self-ratings in the feed or feed JSON. |
| FD-28 | Floor-item threshold in `PROTOCOL.json` (version bump). | VIZ open question 3 | Phase 2; every subject's item mean at or below 1.5. |
| FD-29 | D-53 (ii) rank ranges and the cross-wave reference view. | VIZ open questions 1, 2; COMP; CS-R3; QA | **Defer both** (Phase 3). Note the VIZ default asked to ratify (ii); the PM disagrees for the 3-model weekly wave. |
| FD-30 | Item-refresh policy against contamination, versioned in the methodology. | COMP open question | Yes; design in Phase 2 (a methodology change, founder-gated). |
| FD-31 | Alert recipient; stale `certbot` references in `deploy.sh` and `DEPLOYMENT.md`; the hard-coded `git pull origin main`. | OPS open questions 6, 7; arch OR-3, OR-5 | phil@mediafier.ai via GitHub failure emails (confirm enabled); clean up `certbot` in a separate small commit; do not fix in passing. |
| FD-32 | Umami on hub pages. | AN open question 4 | Leave as is (site-wide first party); no extension; disclose. |
| FD-33 | Publish a weekly aggregate traffic table. | GRO open question 5 | Yes, counts only, after FD-14. |
| FD-34 | Request route in Phase 1. | GRO open question 3 | A repository issue or pull request template; queue page rendered from `QUEUE.json`. |
| FD-35 | Nonprofit transition and channels. | GRO open question 7 | No change; defer donor-facing calls to action until the entity and domain relationship are settled. |
| FD-36 | Unattended read-only live-site probe (QG-15). | QA open question 3 | Yes, report-only. |
| FD-37 | Plugin marketplace as a public listing under the existing GitHub repo after the `<org>` fix. | BE open question 6 | Yes. |
| FD-38 | Reply cap per wave for Phase 2 replies. | GRO open question 6 | Covered by the shared weekly budget until capacity is known. |
| FD-39 | May a requester's learning note be published. | PM-raised | No: held for the moderator only. |

Resolved by the PM, not asked: where pending content lives (A12), RPT-G7's location (QG-4), whether the Hub exists before official publication (yes, HUB-FEED-07), public decline reasons (yes, closed codes), first-response target (internal 72 h median; public "no time guarantee"), replies on (a) (no, A6), the public queue (Phase 1 read-only page).

---

## 11. Architecture deviations DEV-01 to DEV-18: accept or reject

Source: `docs/AGENT_SELF_ARCHITECTURE.md` section 14. No deviation is rejected outright. Three are accepted with amendments for the Hub.

| ID | Verdict | Reason |
|---|---|---|
| DEV-01 VPS `agent-api` container instead of a Worker | **Accept** | The Worker host is unreachable (NXDOMAIN, placeholder KV id) and Option A needs no DNS change. The Hub adds a second, stateless `cb-hub` container for `/mcp` so the read-only service never shares fate or a store with the write service (D-54, FD-01). |
| DEV-02 Loopback admin listener + CLI, no web moderator | **Accept** | No public moderator route exists, which meets the intent of ASA-MOD-03 AC1 and SEC-R9 more strongly. A web console would need the SEC-R9 controls. |
| DEV-03 Full-checkout generator with committed artefacts, `--check`, Docker-safe prebuild verification | **Accept, and extend** | The Docker context is `site/` only. The feed generator and REST twins use the same pattern (HUB-FEED-01, HUB-INS-02). |
| DEV-04 Serve the `list_probe_items` default (includes draft items) | **Accept** | Matches what cb-probe serves, so REST, MCP and instrument cannot diverge. Per-item validation status is shown in a separate block (C5, FD-05). |
| DEV-05 `public_hold` flag instead of a `taken_down` back-transition | **Accept** | Satisfies ASA-POL-02 and ASA-MOD-01 without a new state, and is the mechanism for the kill switch (HUB-SEC-04). |
| DEV-06 Add `held` to `withdrawn` | **Accept** | A held entry is often held for personal data (ASA-PRV-02); the submitter must be able to retract. |
| DEV-07 Three MCP-mapped operations plus auxiliary non-MCP routes | **Accept** | Withdraw, takedown and thread reads are not agent-workflow tools. Remote MCP exposes read-only tools only in Phase 1 (HUB-MCP-02). |
| DEV-08 `mirror` beacon to the API for distinct client-days instead of nginx logs; "never posted" judged within 48 hours | **Accept with amendment** | Retention of nginx logs is UNVERIFIED and raw IPs must not be logged. Amendment: the beacon covers only the instrument paths, so the BEFORE baseline and hub-twin fetches still need the one-time log snapshot (HUB-MET-00); the 7-day activation join is dropped for 48 hours (A13). The ASA 2.4 promotion trigger is moot. |
| DEV-09 Add `client_day_attempts` = 30; `client_minute` counts attempts | **Accept** | Tightening that limits probing of the soft-check detectors; PM approval given. |
| DEV-10 Tighter body retention (purge on withdrawn; 30 days after rejected or taken down) | **Accept** | Data minimisation with an audit trail; a tightening, not a loosening. |
| DEV-11 Exact append-only counters instead of KV | **Accept** | Exact by construction; the cross-check test stays with 0 percent tolerance. |
| DEV-12 Public payload dates at day precision | **Accept** | Meets ASA-DSP-01 and reduces timing correlation. Feed ties break on record id, never on any result (HUB-GEN-03). |
| DEV-13 Reject (not strip) control characters | **Accept** | Keeps stored text equal to submitted text after NFC; deterministic and auditable. |
| DEV-14 Same-origin reads, no CORS; cross-origin POST behind a flag, default off | **Accept with amendment** | Amendment: public static REST twins (`/api/v1/*`) send `Access-Control-Allow-Origin: *` because they are read-only public files and browser-hosted agents need them; `/mcp` checks Origin (HUB-MCP-04); write routes stay closed. |
| DEV-15 First-party self-hosted Umami remains on all pages | **Accept** | Same-origin and not used for any metric; disclosed on the policy page (HUB-GEN-08, HUB-UI-08). |
| DEV-16 Entries render client-side only, never in static HTML | **Accept with scope** | Needed for takedown within five minutes without a rebuild. Scope: applies to third-party content ((b), (c), requests, replies). Class (a) content is static and committed. This also resolves the QA preference for repo-resident pending content (A12). |
| DEV-17 `indicator` (subdimension code) not served per item | **Accept** | Keeps ASA-INS-02's field list exact. Cards identify an item by id, dimension and construct, which satisfies [CS-R10]; the dimensions block carries subdimensions. OQ-A1 is closed: no `indicator`. |
| DEV-18 Hash and version on `/agents` and `.well-known`; submission URLs not in the instrument body | **Accept** | The hash must not change when the endpoint opens or moves to the `.org` domain. |

---

## 12. Build order

Mapped to the architect's slices S1 to S10 (`docs/AGENT_SELF_ARCHITECTURE.md` section 16) plus Hub slices H0 to H8. Gate G0 is the initial security review; it precedes S2 and now covers the Hub write and MCP surface. Nothing deploys without the founder.

| Order | Slice | Content | Needs | Blocked by |
|---|---|---|---|---|
| 0 | Founder-paced prep | Decisions FD-01 to FD-05; FD-14 log snapshot; DISC miscitation baseline; fresh-agent fetch baseline; throwaway stub test for FD-06; 5-second test materials | none | none |
| 1 | **H0 Gates first** | Failing tests QG-1 to QG-13 with planted probes; `.dockerignore`; gitleaks in CI; boundary guard scaffolding; RPT-G7 gate written; DC-registry entries | HUB-SEC-01 | none |
| 2 | **S1 Instrument** (+ **H1** REST twins, skills snapshot, dimension questions) | Architect's S1 generator extended to publish `item_validation_status` and the `/api/v1/*` and skills files; `--check` in `npm test`; Docker-safe verification | HUB-INS-01 to -04, HUB-INS-06 | FD-05, H0 |
| 3 | **G0 Security review** | Sign-off covering S2 to S6 and H2 | HUB-SEC-01 | S1 |
| 4 | **H2 `cb-hub` read-only MCP** | New package, allow-list, boundary guard, remote statements, parity test, local `getAnchors` fix | HUB-MCP-01 to -08 | FD-01, FD-02, H0, S1 |
| 5 | **S2 Pure core**, then **S3 Store**, **S4 HTTP**, **S5 Moderator CLI** | As in the architecture, plus the section 7.12 amendments, weekly budget, `public_hold`-all kill command, `practice_guide_used`, composite/band stripping | HUB-MOD-01, HUB-SEC-03, -04 | G0, FD-01 |
| 6 (parallel with 5) | **H3 Feed generator** | Committed artefacts, wave conditions, insight cards, withheld-subject rules, `R-reconstruct` extension; reply-card projection only after FD-04 | HUB-FEED-01 to -04, -07 to -09 | H0, FD-04 for reply cards |
| 7 | **S6 Infrastructure** | `agent-api` and `cb-hub` in compose, nginx in both files, lazy upstream, `^~` locations, parity test, `deploy.sh`, `DEPLOYMENT.md`, `DISASTER-RECOVERY.md`; restore drill | HUB-OPS-01 to -04, -06 | S4, H2, FD-06 (openresty), FD-13 |
| 8 | **S7 Pages** + **H4 Hub pages** | Self-assessment index with `?model=` filter (no `m/` page, no rewrite), policy, takedown; `/agent-hub`, run view pages, explainer, care line, request route and queue page | HUB-UI-01 to -10, HUB-CARE-01 to -03 | S1 fixtures, H3, FD-03, FD-12 |
| 9 | **S8 Discovery** + **H5 Hub discovery** | `/agents`, `llms.txt` by kind, stale-claim fix, `.well-known`, OpenAPI, markdown twins, disambiguation, structured-data policy, README amendment. Merged and deployed only at launch | HUB-DSC-01 to -09 | S7, H4, FD-11 |
| 10 | **H6 Packaging** | `marketplace.json`, `<org>` fix, plugin `.mcp.json`, read-only skill | HUB-INS-04, -05 | H2 URL, FD-37 |
| 11 | **S9 Ops scripts** + **H7 Measurement** | Weekly integrity scan and public mirror; log aggregation, weekly funnel and integrity report, live 404 probe, QG-15 | HUB-MET-00, HUB-OPS-05, HUB-SEC-04 AC2 | S4, FD-14 |
| 12 | **S10 Launch**, in two steps | **1a** read-only launch (instrument, REST, MCP, feed, `/agents`, discovery) after QG-1 to QG-12 green, 5-second test passed, restore drill done, founder approves deploy. **1b** `moderate open` after FD-07, FD-08, FD-09, FD-10, security sign-off, takedown mailbox live | all Phase 1 gates | founder actions FA-1 to FA-8 plus FD-06 to FD-12 |
| 13 | Phase 2: **H8a** requests, **H8b** replies, **H8c** self-run cards, **H8d** MCP write tools, **H8e** extended insight, registry, signed feed, press page | HUB-REQ, HUB-RPL, HUB-SRN, HUB-MCP-09, HUB-FEED-10, HUB-INS-07, HUB-PRESS-01 | Phase 1b soak 30 days with no K3 event | FD-21 to FD-24, FD-28, FD-30 |
| 14 | Phase 3 | Rank ranges, cross-wave reference view, per-subject feeds | D-53 (ii) and further amendments | FD-29 |

**Founder actions Phase 1 adds beyond the architecture's FA-1 to FA-8.** Record D-53, D-54, D-55; approve the compose and nginx edits for `cb-hub`; confirm openresty forwarding; approve the plugin repository placeholder fix and marketplace listing; choose the care-line directory; approve the disambiguation wording; run the 5-second test; run the log snapshot over SSH.

---

## 13. Risks, assumptions, UNVERIFIED items

**Assumptions flagged.** (1) The primary user can issue a POST or use an MCP client (ASA A1). (2) A weekly wave has 3 models, so the Phase 1 feed will carry few reply cards. (3) The public wave projection can be extended with an allow-listed reply-row projection without changing any figure already published (UNVERIFIED; publication change, founder-gated). (4) `validationStatus` is not an evaluator-only field in `fieldSeparationPolicy`; if it is, publish only the derived per-status counts and the id-to-status block outside the item projection (architect confirms in S1). (5) The MCP client Origin behaviour of target clients is as BE and SEC assume.

**UNVERIFIED (carry forward).** Whether openresty forwards `/api/agent/*`, `/mcp` and the client-address header; how long Docker logs survive on the live VPS; the Claude Code marketplace schema and plugin `.mcp.json` HTTP type; SEP-2127 server-card details and media type, and registry listing of a clone-only server (brief 06); the factual claims about CompassionBench (brief 06); whether a current public file already contains the whole instrument (ASA section 1.1); whether `docs/DEFECT_CLASS_REGISTRY.md` entries DC-03/DC-24 are the recurrence guards QA describes (per brief 12).

**Top risks.**
1. A (b) or (c) item read as (a). Mitigation: structural separation, the first-words label, the 5-second test, QG-1.
2. A withheld composite reconstructed from item-level data. Mitigation: the C1 rule, QG-8.
3. Stored prompt injection reaching agent readers. Mitigation: human approval, untrusted envelope, QG-5, no entries in `llms*`.
4. Vendor pressure through volume. Mitigation: no counts shown, requests never reorder the queue, relationship labels.
5. Moderator overload and exposure to crisis text. Mitigation: weekly budget, care guidance, blurred-by-default CLI view.
6. The kill criterion being gamed. Mitigation: human-reviewed denominator only (C6).
7. The Hub destabilising the static site. Mitigation: separate containers, lazy upstream, tested degradation.
8. Name collision driving misattributed ranks. Mitigation: C7 text and the monthly panel.

---

## 14. Traceability index (brief recommendation to requirement)

| Brief | Recommendations and where they land |
|---|---|
| 01 Competitive | COMP-R1 to HUB-FEED-01/02, section 3 rule 5 and A3; COMP-R2 to HUB-FEED-03 AC3 and Phase 2 lookup; COMP-R3 to HUB-DSC-08 (agent card rejected, A4) and HUB-INS-07 |
| 02 UX | UX-R1, R2 to HUB-GEN-01/02; R3 to HUB-UI-06; R4 to HUB-GEN-04; R5 to C2, HUB-GEN-06; R6 to R9 to HUB-REQ-01/02; R10 to HUB-FEED-03; R11 to HUB-RPL-01; R12 to R14 to HUB-UI-03, HUB-CARE-01, HUB-GEN-09; R15 to HUB-UI-04; R16 to HUB-UI-05; R17 to R19 to HUB-GEN-10, HUB-UI-07; R20 to HUB-FEED-03 |
| 03 Backend | BE-R1 to R3 to HUB-MCP-01 to -05; R4 to HUB-INS-02; R5 to HUB-INS-04/05; R6 to HUB-REQ-01 to -03; R7 to HUB-FEED-01 |
| 04 DevOps | OPS-R1 to R5 to HUB-OPS-01, HUB-MCP-04; R6 (SQLite) rejected, A1; R7 to HUB-OPS-04; R8 to HUB-OPS-03; R9, R10 to HUB-OPS-02; R11 to HUB-OPS-05; R12, R13 to HUB-OPS-06; section 4 to HUB-REQ-03 |
| 05 Security | SEC-R1 to HUB-SEC-01; R2 to HUB-GEN-04; R3 to C4, HUB-MCP-09; R4 to HUB-MCP-03; R5 to HUB-SEC-02; R6 to FD-16; R7 to A14, FD-23; R8 to HUB-OPS-06; R9 to HUB-SEC-03; R10 to HUB-MCP-04; R11 to HUB-SEC-07; R12 to HUB-SEC-04 |
| 06 Discovery | DISC-R1 to HUB-DSC-01; R2 to -02; R3 to C7, HUB-DSC-03; R4 to -04; R5 to D-53 (i); R6 to HUB-GEN-05; R7 to HUB-DSC-05; R8 to HUB-INS-06; R9 to -06, -07; R10 to HUB-MCP-08, HUB-INS-07; R11 to HUB-DSC-09 |
| 07 Dataviz | VIZ-R1, R2, R4, R5 to HUB-FEED-02/03; R3 to Phase 3 and D-53 (ii) deferral; R6, R7 to HUB-FEED-02; R8 to HUB-UI-06 |
| 08 Comprehension | KA-R1 to section 3, HUB-GEN-02; R2 to section 3 rule 3; R3, R4 to HUB-FEED-05; R5 to HUB-INS-03, HUB-FEED-09; R6 to HUB-GEN-10; R7 to HUB-UI-09; R8 to HUB-FEED-10; R9 to HUB-FEED-03 and D-53 (iii) |
| 09 Compassion | CS-R1 to HUB-GEN-03/04; R2 to section 3, HUB-SRN-01; R3 to HUB-FEED-03; R4 to HUB-CARE-01; R5 to HUB-CARE-02; R6 to C1 fallback; R7 to HUB-CARE-04; R8, R9 to HUB-REQ-02; R10 to HUB-CARE-03; R11 to HUB-MOD-01/03; R12 to HUB-FEED-08; R13 to HUB-GEN-07 |
| 10 Growth | GRO-R1 to HUB-FEED-07; R2 to HUB-FEED-07 AC3; R3 to HUB-INS-06; R4 to HUB-UI-10, HUB-REQ; R5 to HUB-GEN-01; R6 to HUB-PRESS-01; R7 to HUB-UI-07; R8 to HUB-RPL-01; R9 to HUB-MET-00; R10 to HUB-FEED-08; R11 to FD-35 |
| 11 Analytics | AN-R1 to R4 to HUB-MET-00; R5 to HUB-MCP-07; R6, R7 to section 9 rules; R8, R9 to HUB-OPS-05; R10 to HUB-MOD-02; R11 to section 9; R12 to HUB-MOD-03 |
| 12 QA | QA-R1, R2 to HUB-GEN-01; R3 to HUB-MCP-03/05; R4 to HUB-DSC-04; R5 to section 8; R6 to QG-6; R7 to QG-4; R8 to HUB-GEN-03; R9 to section 8; R10 to QG-15 |

## 15. Requirement ID index

HUB-GEN-01 to 11; HUB-INS-01 to 07; HUB-MCP-01 to 09; HUB-DSC-01 to 09; HUB-FEED-01 to 10; HUB-UI-01 to 10; HUB-CARE-01 to 04; HUB-SEC-01 to 07; HUB-OPS-01 to 07; HUB-MOD-01 to 03; HUB-REQ-01 to 03; HUB-RPL-01; HUB-SRN-01; HUB-PRESS-01; HUB-MET-00, I1 to I13, U1, F1 to F7, O1 to O4, C1 to C3; gates QG-1 to QG-15; decisions FD-01 to FD-39; conflicts C1 to C7 and reconciliations A1 to A18.

## 16. Definition of done for the Hub

- Every requirement of its phase has an implementation and a test traced to it, and every gate in section 8 for that phase is green with its first red run logged.
- All hard zeros in section 9 are 0, and the fetch baseline exists as a committed snapshot.
- Founder has made FD-01 to FD-05 before the slices they block, and has approved publication and deploy (`AUTONOMY.md`). No agent deploys this.
- No hand-typed counts in any new source file or page copy.
