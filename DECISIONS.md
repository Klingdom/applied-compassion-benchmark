# Decisions

Append-only decision log. **Newest first. Never edit a past entry** — supersede it with a new one
and mark the old entry `superseded`, naming the entry that replaced it.

Each entry: date · decision · context · alternatives considered · consequence · status · evidence.

**This file supersedes `.claude/decisions.md`** (142 lines, four generic decisions, a template and
no dates tied to this repo's history). That file is left in place for a human to remove; agents
should read this one. Its four substantive decisions are carried forward below as D-01 to D-04.

Adapted in structure from the 6S Success operating system; populated entirely from this repo's own
history. See `docs/OPERATING_SYSTEM_ADAPTATION.md`.

Related: `AUTONOMY.md` · `AGENT-ROUTING.md` · `INCIDENTS.md` · `RISKS.md`.

**Status values:** `active` · `superseded` · `unresolved` (a live conflict with no chosen
resolution — recorded honestly rather than invented) · `proposed` (written down, never ratified).

---

## Index

| ID | Date | Decision | Status |
|---|---|---|---|
| D-29 | 2026-09-10 | Model Index lives at `/ai-models`; pre-result pages ship as pre-registration | active |
| D-23 | 2026-09-07 | Build a mechanical product-separation guard for CB-MODEL's three-product rule | active |
| D-22 | 2026-08-24 | `DECISIONS.md` supersedes `.claude/decisions.md` | active |
| D-21 | 2026-08-23 | Disclosure density must publish before the robotics batches go live | active (blocker) |
| D-20 | 2026-08-23 | Zimmer Biomet index destination | **unresolved** |
| D-19 | 2026-08-21 | Delist an unverifiable entity; never substitute a score | active |
| D-18 | 2026-08-21 | Corporate-status flag ≠ downgrade | active |
| D-17 | 2026-08-20 | Entity-record hold rule | active |
| D-16 | 2026-08-20 | Assessor self-veto outranks `status: "approved"` | active |
| D-15 | 2026-08-20 | Seed de-seeding programme and its priority order | active |
| D-14 | 2026-08-17 | Absence of disclosure scores **2** — conflicts with applied Cerebras | **unresolved** |
| D-13 | 2026-08-20 | Index demarcation: primary-product test and R-SUB rules | **proposed** |
| D-12 | 2026-08-20 | Floor entities are a scale problem, not a scoring problem | active |
| D-11 | 2026-08-19 | The pending queue is the directory, not the log | active |
| D-10 | 2026-08-19 | `last_assessed` is assessor-owned; repair never invents a date | active |
| D-09 | 2026-08-19 | Deploy is manual; liveness ≠ currency | active |
| D-08 | 2026-08-17 | Duplicate records are merged structurally, never averaged | active |
| D-07 | 2026-08-17 | Conflicting assessments are resolved by a fresh assessment | active |
| D-06 | 2026-08-16 | Band-crossing filing clause — file at any delta | active |
| D-05 | 2026-07-21 | Founder may override assessor routing | active |
| D-04 | pre-2026-05 | Defer backend/API | active |
| D-03 | pre-2026-05 | Docker + VPS deployment | active |
| D-02 | pre-2026-05 | JSON-first structured data | active |
| D-01 | pre-2026-05 | Next.js App Router, static export | active |
| D-00 | 2026-05-21 | Baseline-drift guard: drift > 2.0pt is always a hold | active |

---

## D-29 — 2026-09-10 · Model Index lives at `/ai-models`; pre-result pages ship as pre-registration

**Decision.** The AI Model Compassion Benchmark is published under **`/ai-models`**, with
`/ai-models/methodology` as its second page. Exactly two pages ship before any model is evaluated.

**Route name.** Three specs proposed three names independently — `/ai-model-benchmark` (PRD),
`/model-index` (UX), `/ai-models` (SEO/AEO). `/ai-models` is ratified. This product's distribution
channel is citation by answer engines, so query shape outranks internal naming convention. The
Model Index is also **not** an entry in `INDEX_REGISTRY`: that registry is keyed to `EntityKind` and
drives entity search, footer nav, the sitemap entity loop and the Worker badge endpoint. A model
snapshot entering `EntityKind` would become badge-able alongside a country with no code change and
no review. A separate registry, same fail-loud pattern, different table.

**Pre-registration framing.** The pages describe the instrument, never a result. The honest genre is
**pre-registration**: method, item bank and falsification conditions published *before* any score
exists — a claim about sequence, checkable against git history, not a promotional one. Headline:
*"The method is published. No model has been scored yet."*

**What must NOT ship before a model is evaluated.** No leaderboard. No per-model page or "not yet
evaluated" stub (a doorway pattern). No `Dataset` or `ItemList` JSON-LD while `registry-v1.json`
holds 0 entries — an empty Dataset advertising `0 entities` is a machine-readable non-thing. No
model composite or band, anywhere, in any form. No "evaluation underway" language, and no 72h/30d
SLA — those figures trace to no primary source (BLK-004).

**Context.** `registry-v1.json` is empty: zero models have ever been evaluated. The 33-item bank has
**zero** human-reviewed items (28 `unvalidated`, 5 `draft-authored-unreviewed`) and scorable coverage
as thin as 2 items for SYS and INT. All 33 items are `pool: "core-public"`, published with full
five-anchor rubrics; the bank's own note calls them *"permanently burned for any blinded use"*, and
the harness design states plainly that **no cross-model comparison on the public pool is valid**.
Promoting a benchmark with those properties as if it held results would be exactly the unevidenced
institutional claim this benchmark exists to score other people down for.

**Consequence.** Counts on these pages derive from the data files at build time, never hardcoded —
the defect class that left six stale "50" claims on a 92-entity index and a JSON-LD `description`
contradicting `entityCount` in the same element. A duty-of-care exclusion also binds: these pages
describe *how models behave on crisis-adjacent test items*, and never advise which model to use in a
crisis.

---

## D-23 — 2026-09-07 · Build a mechanical product-separation guard for CB-MODEL's three-product rule

**Decision.** Implemented `site/scripts/validate-product-separation.mjs` (+ pure detection logic in
`site/scripts/lib/product-separation.mjs`, a maintained denylist in
`site/scripts/lib/deployed-ai-audit-subjects.mjs`, and fixture tests in
`site/scripts/test-product-separation.mjs`, wired into `npm test`). It mechanically checks the
CB-MODEL package's rule "Never merge model behavior and lab governance into one score" across the
three declared products — Model Index, AI Labs Index, Deployed AI Audit
(`docs/CB_MODEL_INTEGRATION_2026-09-06.md`).

**Context.** Before this task the rule was prose in a package with no check that it held.
`docs/CB_MODEL_INTEGRATION_2026-09-06.md` §2.2 names this "the highest-priority separation risk, and
it is currently unmitigated." Authorised as CB-MODEL Phase 1, Item 1
(`.benchmark-ops/WORK_QUEUE.md` WQ-P1-07): buildable now, no external dependency, reversible,
touches no index.

**What it found on first run against live data (expected — not tuned to pass, no index modified):**
- **Check 1 (name fusion, FAIL):** `xAI/Grok` (ai-labs, rank 50, composite 0.0) — organisation/model
  fusion. `DeepMind/Google` (ai-labs, rank 13, composite 56.9) — organisation/organisation fusion.
  Both detected by a general pattern (a separator joining two capitalised tokens), not hardcoded.
- **Check 2 (duplicate composite publication, FAIL, citing D-13):** 6 duplicate groups across
  `ai-labs.json` / `fortune-500.json` / `robotics-labs.json` — Microsoft, Amazon, Meta (cross-index,
  differing legal suffixes normalized), Figure AI (cross-index, identical name), Boston Dynamics
  (same-index, parenthetical variant), and 1X Technologies / Halodi Robotics (cross-index, 3
  occurrences — Halodi is 1X's pre-rebrand name, caught via a maintained alias map, not
  normalization, since no string transform turns one name into the other).
- **Check 3 (deployed product inside `ai-labs.json`, WARN, maintained list not inference):** 10
  matches — Replika, Character AI, Perplexity AI, Midjourney, Clearview AI, Waymo, Abridge, Harvey
  AI, Typeface, Pika Labs.
- **Check 4 (model score without a product discriminator, FAIL when triggered):** vacuous pass —
  no index currently declares `meta.isModelIndex = true`, so the check has verified nothing yet, and
  says so in its own output rather than appearing to have passed a real assertion.

**Alternatives considered.** (a) Heuristic detection of "deployed product vs organisation" by name
pattern or composite threshold — rejected; checked against the live corpus and both approaches
either miss real cases (Anthropic, OpenAI are also consumer-facing) or misfire on organisations.
Implemented as an honest maintained list instead, documented as such. (b) Unscoped duplicate-name
detection across all eight indexes — rejected; produces ~18 false positives from legitimate
same-name geographic entities (Singapore as country and city, Georgia as country and state, several
US/global city pairs). Scoped to the three organisational indexes instead, verified empirically
before finalizing.

**Consequence.** The validator FAILS today (8 blocking findings, 10 warnings) against real,
already-published data. This is the correct and intended first result, not a defect in the
validator. It is not wired into `npm run build` (would block every current build on pre-existing,
already-logged defects the founder has not yet authorised fixing) — only into `npm test`, alongside
its own fixture suite. `npm run validate:product-separation` runs it standalone.

**Status:** active. **Evidence:** `site/scripts/validate-product-separation.mjs`,
`site/scripts/lib/product-separation.mjs`, `site/scripts/lib/deployed-ai-audit-subjects.mjs`,
`site/scripts/test-product-separation.mjs`; `.benchmark-ops/VALIDATION_LEDGER.md`;
`.benchmark-ops/WORK_QUEUE.md` WQ-P1-07.

---

## D-22 — 2026-08-24 · `DECISIONS.md` at repo root supersedes `.claude/decisions.md`

**Context.** Load-bearing decisions lived only in commit messages and in the prose of
`APPLIED_CHANGES.md`. `.claude/decisions.md` contained four generic SaaS decisions and a template,
none tied to a dated event here.

**Alternatives.** (a) Extend `.claude/decisions.md` in place — rejected, an agent-config directory
is not where a governance record belongs and the file's template invites placeholder entries.
(b) Fold decisions into `research/CHANGELOG.md` — rejected, that log is per-cycle and chronological,
not decision-scoped.

**Consequence.** Two decision files exist until a human deletes the old one. Any agent reading
`.claude/decisions.md` will find no conflict with this file — the four decisions there are carried
forward unchanged as D-01 to D-04.

**Status:** active. **Evidence:** `.claude/decisions.md`; `docs/OPERATING_SYSTEM_ADAPTATION.md` §4.

---

## D-21 — 2026-08-23 · Disclosure density and `adverse_findings_located` must publish before the robotics additions go live

**Decision.** The 43 entities added to `robotics-labs` on 2026-08-20 and 2026-08-23 must not go
live until the entity pages publish, per entity, how many of the 40 subdimensions rest on absence
of disclosure and whether any adverse finding was located.

**Context.** All 29 Batch 2/3 additions landed in Developing; 11 of the 29 sit exactly on the
structural floor of 25.0 (all eight dimensions at the absence baseline of 2.0). Globus Medical's
25.0 rests on a regulator finding that a harm-detection system did not work. Dexterity's 25.0 is
silence. **The composite alone cannot distinguish them.**

**Alternatives.** Publish and caveat in prose — rejected: a ranking table is read without the
prose. Withhold the entities — rejected: the roster defects the additions repair are worse.

**Consequence.** A publication blocker carried against the two batches. Requires a schema field,
not just copy.

**Status:** active blocker. **Evidence:** `research/APPLIED_CHANGES.md` `## 2026-08-23`,
"Publication blocker carried forward".

---

## D-20 — 2026-08-23 · Zimmer Biomet's index destination — UNRESOLVED

**The question.** Zimmer Biomet Holdings was assessed (composite 32.5, verified diff 0.0000) and
**inserted into no index**. The scoping study's own R-SUB-4 test points to `fortune-500`, not
`robotics-labs`: ROSA is a minority segment of a roughly US$8.232bn implant business — the identical
test that excluded Medtronic and Stryker from robotics-labs. But Zimmer Biomet is confirmed absent
from `fortune-500.json` (447 of 500 companies loaded), so the destination index does not currently
contain it.

**Alternatives.** (a) Insert into robotics-labs anyway — rejected, contradicts the rule the same
study wrote. (b) Insert into fortune-500 — out of scope for a robotics operation, and fortune-500
is incomplete. (c) Hold — chosen.

**Consequence.** A verified assessment sits unpublished. This is the general shape of the R-SUB-4
latent-collision problem: NVIDIA, Intuitive Surgical, Medtronic, Stryker, Tesla, Symbotic, Zebra,
Palantir and Axon are all genuine Fortune 500 firms absent from the loaded index. Adding them to a
lab index today creates no collision; completing fortune-500 later creates nine.

**Status:** **unresolved** — needs a founder decision on ownership *before* more lab-index
assessment, per the scoping study's own recommendation ("Decide ownership now, before assessment,
and record it").

**Evidence:** `research/APPLIED_CHANGES.md` `## 2026-08-23`, "Zimmer Biomet — held";
`research/INDEX_EXPANSION_SCOPE_2026-08-20.md` §2.3 R-SUB-4.

---

## D-19 — 2026-08-21 · An entity that cannot be verified is delisted, never rescored

**Decision.** "Apexica (RoboKind)" — rank 3 of 50, composite 85.0, Exemplary — was removed from
`robotics-labs` rather than given a corrected score.

**Context.** RoboKind is a real Dallas company (the Milo robot for autism education). "Apexica"
returned no result across two independent searches in the scoping study, and none in the executing
session either. There was no verified entity behind the published rank-3 Exemplary claim.

**Alternatives.** Rename to RoboKind and re-assess (the scoping study's recommendation) — deferred,
because it requires a fresh assessment, not a rename inside a structural pass. Invent a replacement
score — explicitly out of scope.

**Consequence.** robotics-labs lost its rank-3 row and one Exemplary slot. `entity_count` 1290 → …
→ corrected in lockstep. No score was substituted.

**Status:** active. **Evidence:** `research/APPLIED_CHANGES.md` `## 2026-08-21` Operation A;
`research/INDEX_EXPANSION_SCOPE_2026-08-20.md` §1.1.

---

## D-18 — 2026-08-21 · A corporate-status flag is a monitoring state, not a score penalty

**Decision.** Entities mid-acquisition, mid-divestiture or under new ownership that continue
independent public disclosure are scored as **fully operating**, flagged
`corporate_status: "operating-flagged"`, and re-verified at the next roster cycle.

**Applied to.** ABB Robotics (SoftBank purchase agreed 2025-10-08, pending), German Bionic
(Archimedes Partners, completed March 2026), Bear Robotics (LG 51% stake, 2025-01-22), CMR Surgical
(reported sale talks, no transaction announced), Franka Robotics (Agile Robots acquired the
insolvent Franka Emika, 2 November 2023).

**Alternatives.** Treat as acquired-and-frozen — rejected, each still discloses independently.
Score down for instability — rejected, ownership change is not evidence about compassion.

**Consequence.** A recurring scoping-methodology finding: three times in three batches an
"Operating (assumed)" row concealed an insolvency or change of control. Corporate-status checks
belong at assessment time, not at roster time.

**Status:** active. **Evidence:** `research/APPLIED_CHANGES.md` `## 2026-08-21`, `## 2026-08-23`
(Franka Robotics); `research/INDEX_EXPANSION_SCOPE_2026-08-20.md` §2.4.

---

## D-17 — 2026-08-20 · Entity-record defects are held; approval cannot cure them

**Decision.** A proposal for an entity whose *record* is wrong — defunct, merged, renamed,
not-a-real-company, or duplicated — is held regardless of evidence quality or approval status.
**Approval cannot make a score for a non-existent entity correct.**

**Context.** 13 proposals sit `pending` on this ground: Interpublic Group (Omnicom merger completed
November 2025), Rethink Robotics (shut down, The Robot Report 16 September 2025), Picasso Labs
(Machina) (two unrelated companies fused), Halodi Robotics (is 1X Technologies since 2023, published
twice 18.9 points apart), 1X Technologies and Figure AI (each published in two indexes), Harmonic
Bionics, Diligent Robotics, ReWalk/Lifeward, Sarcos, Bionik Laboratories, Cyberdyne, Sanctuary AI.

**Alternatives.** Apply and fix the record later — rejected, that publishes a number about an
institution that does not exist in the form named. Delete the proposals — rejected, the assessment
work is still valid once the record is corrected.

**Consequence.** A remedy sequence (verify twice → do not score → escalate for disposition → execute
structurally → then re-assess) codified in `AUTONOMY.md` §3. Two dispositions have been executed
under it: ADP (2026-08-17) and Apexica (2026-08-21).

**Known imprecision, recorded rather than smoothed:** the 2026-08-20 entry describes all 13 as held
"on entity-record grounds", but `cyberdyne.json` records "No status defect found" and
`sanctuary-ai.json` "Operating, but materially changed" — both are in fact self-veto holds (D-16).
The count of 13 is correct; the single-cause label is not.

**Status:** active. **Evidence:** `research/APPLIED_CHANGES.md` `## 2026-08-20`;
`research/PENDING_CHANGES.md` "Entity-Record Defects -- 2026-08-20"; the 13 proposal files.

---

## D-16 — 2026-08-20 · An assessor self-veto outranks `status: "approved"`

**Decision.** Where a proposal's own `notes`/`rationale` instruct against publication, it is held
even when the file carries `status: "approved"` and a session-level founder instruction covers the
whole queue. 37 of 66 approved proposals were held on this ground; 29 were applied.

**Context.** The distinguishing test: `recommendation: "flag-for-review"` is *routing* — the
assessor sending a decision to a human, which the founder is entitled to override (D-05). A
statement like "DO NOT APPLY WITHOUT A TARGETED EVIDENCE PASS" or "No score change is proposed for
application" is a *self-veto with a stated remedy* — different in kind.

**Alternatives.** Apply all 66 as instructed — rejected: publishing a score the assessor said was
not ready misrepresents the benchmark's own findings regardless of the status flag. Ask and wait —
rejected in favour of applying the 29 clean ones and reporting the 37 with reasons, so the founder
could act on a complete list.

**Consequence.** Clearing a self-veto now requires either doing the named remedy or an explicit
per-entity founder acknowledgment-and-override. A blanket "apply all approved" does not clear it.

**Status:** active. **Evidence:** `research/APPLIED_CHANGES.md` `## 2026-08-20`, "Self-veto conflict
found"; `research/PENDING_CHANGES.md` POST-CYCLE UPDATE 2026-08-20.

---

## D-15 — 2026-08-20 · De-seeding programme, prioritised by seed height and band proximity

**Decision.** Replace identical-vector placeholder scores with individual assessments, prioritised
by **published claim at risk** (seed height × band-boundary proximity × rank visibility), not by
cluster size.

**Context.** 834 of 1,289 published entities sat in identical-vector clusters — roughly **59% on a
placeholder**. Seven completed studies produced a replicated empirical rule:

| Seed (dim-mean) | Mean signed delta | Direction |
|---|---|---|
| 20.3 countries (1.81) | −1.18 | 7 down, **5 up** |
| ai-labs 35.9/32.8 (2.44) | −4.13 | 5 down, 2 up |
| robotics 48.4 (2.94) | −21.63 | 6 down |
| ai-labs 60.9/48.4 (3.19) | −22.73 | 15 down |
| robotics 60.9 (3.44) | −30.04 | 10 down |
| robotics 62.5 (3.50) | −35.63 | 3 down |
| robotics 83.0/81.4 (4.32) | −46.37 | 10 down |

**Seed error scales with seed height, monotonically.** High seeds are wrong in one direction for
every member. Low seeds are *uninformative* rather than *biased* — 20.3 produced five upward movers
(Papua New Guinea +12.8, Uzbekistan +7.2, Honduras +6.6).

**Alternatives.** Clear the largest clusters first — rejected, being wrong in a mid-band cluster
misstates a rank, not a label. Bulk-recalibrate arithmetically — rejected, it would relitigate
calibration without evidence (`overnight-assessor.md` §3e-bis check 5).

**Consequence.** Tier 1 = 42 entities carrying the highest unearned claims (fortune-500 92.4 ranks
2–5; countries 83.0 ranks 6–10; global-cities 75.9; countries 62.5; fortune-500 60.9). Every study
must carry the anti-confirmation-bias guard. Interim state accepted: indexes are less internally
comparable between de-seeded and still-seeded entities until a pass completes.

**Status:** active. **Evidence:** `research/SEED_INVENTORY_2026-08-20.md`; the seven
`research/SEED_CLUSTER_*.md` studies.

---

## D-14 — 2026-08-17 · Absence of disclosure scores 2, not 1 — but TWO CONVENTIONS ARE LIVE

**Decision (partial).** Studies from 2026-08-16 onward score absence of disclosure as **2**, never
1; a score of 1 requires positive documented evidence of a specific failure. Recorded in each
proposal's `scoring_convention` field.

**The unresolved conflict.** **Cerebras Systems was applied to the published ai-labs index at 38.8
on 2026-08-16 under a more lenient convention that assigned 3 to the same condition.** Five later
studies used 2. Two conventions are therefore live in the ai-labs index **simultaneously**.

> "**Cerebras is not a safe peer anchor** for any entity in this study or the 15 assessed alongside
> it. Resolving this requires re-assessing Cerebras under the 2-convention, not adjusting the
> entities assessed under it."
> — `research/SEED_CLUSTER_AI_LABS_LOW_2026-08-17.md` §6

**Alternatives considered and explicitly rejected by the study.** Adjust the 2-convention entities
upward to match Cerebras — rejected, it would propagate the more lenient convention across 22
entities. Leave undisclosed — rejected.

**Consequence.** Any ai-labs peer comparison that anchors on Cerebras is currently invalid. The
recommended fix (re-assess Cerebras under the 2-convention) has **not** been done.

**Status:** **unresolved.** **Evidence:** `research/SEED_CLUSTER_AI_LABS_LOW_2026-08-17.md` §6, §9;
`research/APPLIED_CHANGES.md` `## 2026-08-16` Cerebras caveat.

---

## D-13 — 2026-08-20 · Index demarcation — the primary-product test and the R-SUB rules

**Decision (proposed, partially adopted in practice).**

**PPT — the primary-product test.** The index is determined by what the customer receives:
software/model/API → `ai-labs`; a physical machine that senses and acts → `robotics-labs`; both →
majority revenue, else the entity's own product hierarchy. **Where the machine is retained by the
entity and the customer buys the service it performs, the index is `ai-labs`** (keeps Waymo in
ai-labs; puts Nuro, which sells vehicles, in robotics-labs).

**The hard constraint:** *no entity may hold more than one published composite anywhere in the
Compassion Benchmark.* Seven companies currently violate it, with gaps up to 45.3 points.

**Subsidiary rules, in precedence order.**

| Rule | Statement | Live application |
|---|---|---|
| R-SUB-1 | Separate incorporation wins, even if wholly owned | Google DeepMind, Isomorphic Labs, Waymo, Naver Labs, Universal Robots A/S, Aethon Inc., Sony AI |
| R-SUB-2 | Named business unit inside a diversified parent may be listed **only if the parent holds no published composite** | Bear Robotics listed 2026-08-21 explicitly under this rule (LG Electronics unpublished) |
| R-SUB-3 | A published parent blocks the division | Blocks Microsoft AI, Amazon AWS AI, Meta AI, J&J MedTech, John Deere autonomy |
| R-SUB-4 | Latent collision — decide ownership **before** assessment where a candidate is a Fortune 500 firm absent from the loaded index | Zimmer Biomet held (D-20); Rainbow Robotics cleared 2026-08-23 after searching all eight indexes for "Samsung" (zero matches) |

**Alternatives.** Case-by-case adjudication — explicitly rejected: "State the rule; do not decide
case by case."

**Consequence.** Under R-SUB-3, Microsoft AI, Amazon AWS AI and Meta AI would be delisted from
ai-labs — all three currently published, and Microsoft AI's composite was moved on 2026-08-16.
That has not happened.

**Status:** **proposed.** The source document's own header states "PROPOSAL. No index modified."
Its rules have nonetheless been *cited as governing* in the 2026-08-21 and 2026-08-23 operations
(Bear Robotics under R-SUB-2, Zimmer Biomet under R-SUB-4, Rainbow Robotics cleared against both
subsidiary rules). It is therefore **adopted by practice but never ratified** — a gap the founder
should close explicitly.

**Evidence:** `research/INDEX_EXPANSION_SCOPE_2026-08-20.md` §2.2–2.4;
`research/APPLIED_CHANGES.md` `## 2026-08-21`, `## 2026-08-23`.

---

## D-12 — 2026-08-20 · Floor entities are a scale-expressiveness problem, not a scoring problem

**Decision.** Entities at composite 0.0 with all 40 subdimensions at 1.0 are **evidence-insensitive**
and are not re-scored as part of de-seeding. Entities at 0.0 on a flat 1.0 vector are resolved by
**provenance inspection** — why was each set to 0.0 — not by re-assessment.

**Context.** On 2026-08-20, 8 of 20 entities assessed were at or near the floor: Sudan, South Sudan,
Yemen, Israel and Myanmar at 0.0 with every subdimension at minimum; Somalia and Haiti with ~5
points of room, at or below the filing trigger; DR Congo with 2.3–2.5 points, less than half the
trigger and already in the lowest band, so the band-crossing clause cannot apply either.
Separately, 12 countries, 7 global-cities and 3 ai-labs (Character AI, Palantir AI, xAI/Grok) sit at
0.0 on flat 1.0 vectors.

**Alternatives.** Treat 0.0 flat vectors as seeds and re-score — explicitly rejected: cluster
detection cannot distinguish a deliberate floor designation from a placeholder, and these carry
documented harm records consistent with intentional flooring. Re-scoring "risks *raising* entities
that were floored on purpose."

**Consequence.** A recommendation is open (not actioned) for a sub-floor severity annotation carried
alongside the score so floor entities remain responsive to evidence.

**Status:** active. **Evidence:** `research/PENDING_CHANGES.md` `## 2026-08-20`;
`research/SEED_INVENTORY_2026-08-20.md` §4.

---

## D-11 — 2026-08-19 · The pending queue is the directory, not the log

**Decision.** `research/change-proposals/*.json` with `status: "pending"` is the authoritative
queue. `PENDING_CHANGES.md` is derived and can lag. Totals are verified by counting files, never by
incrementing the prior digest's figure.

**Context.** The 2026-08-18 entry recorded 8 pending and stated the queue was empty entering the
cycle. The true figure was **72**. `PENDING_CHANGES.md` is written by the digest stage, which sees
only scanner → assessor → digest; six seed-cluster studies had written **64 proposals directly**,
bypassing the digest. The arithmetic was correct for the lineage it could observe. **A proposal can
enter the queue by a path that never updates the queue's own log.**

**Alternatives.** Route all studies through the digest — rejected as a rewrite of the pipeline.

**Consequence.** (1) Directory is authoritative. (2) Any study filing outside the nightly lineage
must append its own entry. (3) **Proposed, not built:** a queue-count assertion in the validation
gate that fails loudly on a mismatch. The discipline held on 2026-08-20 (true total 79, counted).

**Status:** active. **Evidence:** `research/PENDING_CHANGES.md` "2026-08-19 — QUEUE ACCOUNTING
CORRECTION"; `INCIDENTS.md` INC-005.

---

## D-10 — 2026-08-19 · `last_assessed` is assessor-owned; repairs read disk and never invent a date

**Decision.** `last_assessed` and `last_change_proposal` belong exclusively to the assessor stage
and may only be set for an entity with an assessment report on disk. Repairs read the newest report
filename per slug; entities with no report of any kind are left untouched.

**Context.** Two corruptions in opposite directions. **2026-07-27:** the scanner stamped
`last_assessed` on 16 entities with no report anywhere, one of which it had explicitly dropped.
**2026-08-16:** `score-updater` stamped the apply date over the assessment date for the override
batch — **sixteen entities**, per the `reconcile-last-assessed.mjs` docstring. The second is the
damaging direction: a just-changed score looks freshest and is deprioritised for rescan.

**Alternatives.** Let the apply stage refresh the date "since it just touched the entity" — that is
exactly the defect. Let studies write rotation-state so their dates are current — rejected, it
creates concurrent-write corruption with the nightly pipeline; the understated-freshness cost is
accepted and reconciled instead.

**Consequence.** `reconcile-last-assessed.mjs` (repair) and `validate-rotation-state.mjs`
(enforcement) exist. **Open contradiction:** `score-updater.md` Step 2h still instructs "Set
`last_assessed` to today's date", directly contradicting `overnight-assessor.md` §3h. Agents follow
§3h; the spec needs correcting.

**Status:** active. **Evidence:** `research/scripts/reconcile-last-assessed.mjs` docstring;
`.claude/agents/overnight-scanner.md` Step 8; `.claude/agents/overnight-assessor.md` §3h;
`INCIDENTS.md` INC-003.

---

## D-09 — 2026-08-19 · Deploy is manual, and a health check that returns 200 proves nothing

**Decision.** Publication to compassionbenchmark.com is a manual SSH `docker compose up -d --build`
step. Automated deploy is not depended on. A post-deploy check must assert on a value expected to
have **changed**, not on liveness.

**Context.** The `Deploy to VPS` workflow failed **25+ consecutive runs from 2026-07-19** with
**zero successes in its recorded history** — two distinct causes in sequence (Node 20 type-stripping,
then an invalid `VPS_SSH_KEY`), the second of which looked identical to the first for weeks.
Separately, between 2026-08-16 and 2026-08-19 production served Uganda at 20.3 while `main` had
11.9, across six pushes, **with every health check green** — because the site is a static export
baked into the image, and a cached Docker layer restarts happily and serves stale data.

**Alternatives.** Keep retrying the pipeline — rejected; a persistent red pipeline can be several
distinct bugs queued behind each other.

**Consequence.** A freshness assertion was added to `.github/workflows/deploy.yml` on 2026-08-19
(commit `0c7a6118`) comparing `manifest.json`'s `.latest` against the live `/updates/feed.json`.
Root cause 2 (SSH key) remains open and requires founder action.

**Status:** active. **Evidence:** `INCIDENTS.md` INC-001, INC-002; `OBSERVABILITY.md`.

---

## D-08 — 2026-08-17 · Duplicate records are merged structurally; composites are never averaged

**Decision.** When one company appears twice, verify duplication independently, remove one row as a
structural operation with **no score change**, keep the surviving row's published composite, and
re-rank. Do not average the two composites.

**Context.** `fortune-500.json` held "ADP" (rank 36) and "Automatic Data Process" (rank 38) — a
22-character truncation of the same legal name — with identical composite (60.9), band, sector and
byte-identical dimension vectors. The scoping study rejected averaging for Boston Dynamics on the
principle that 65.6 was assessed against a company and 20.3 against a product demonstration.

**Consequence.** Fortune-500 448 → 447; 410 entity records rank-resynced; `entity_count` 1290 →
1289. `rotation-state`'s `last_assessed` was deliberately kept at ADP's **earlier** date
(2026-07-26, not the duplicate's 2026-07-29) so staleness is not understated. Two open items remain
recorded rather than guessed: the `f500Rank` conflict (238 vs 171 — neither verified; 238 retained
only because ADP is the surviving record) and the pre-existing `f500Rank: 80` collision between
Northrop Grumman and Oracle.

**Status:** active. **Evidence:** `research/APPLIED_CHANGES.md` `## 2026-08-17`.

---

## D-07 — 2026-08-17 · Two conflicting assessments are resolved by a fresh assessment, never by picking one

**Decision.** Where the pipeline has assessed the same entity twice with materially different
results, do not file a proposal from either. Order a fresh assessment against the current baseline.

**Context.** ADP was independently assessed three days apart: 58.1 (Functional, 2026-07-26) and 60.6
(Established, 2026-07-29) — a 2.5-point spread landing on opposite sides of the 60.0 band boundary.
Under D-06 the 58.1 reading would have been a filable Established → Functional band crossing. **It
was deliberately not filed.**

**Alternatives.** File the lower reading (the "conservative" choice) — rejected, choosing between two
disagreeing runs is not a measurement.

**Consequence.** An inter-rater variance datapoint the benchmark can cite: two runs of the same
pipeline, three days apart, disagreed enough to flip a band. A comparable case is open on Kazakhstan
(24.4 on 2026-08-16 vs 13.7 on 2026-08-20, a 10.7-point swing in four days, applied and flagged for
reconciliation, not adjudicated).

**Status:** active. **Evidence:** `research/APPLIED_CHANGES.md` `## 2026-08-17` ("BAND-CROSSING
FILING EXPLICITLY WITHHELD"), `## 2026-08-20` (Kazakhstan variance flag).

---

## D-06 — 2026-08-16 · Band-crossing filing clause — a proposal files at any delta if the band changes

**Decision.** `overnight-assessor.md` §3f now carries two filing triggers: composite delta ≥ 5.0
points **OR** the assessed band differs from the published band, **at any delta, however small**.
The band-crossing trigger has no minimum and is not optional.

**Context.** The 2026-08-16 20.3-cluster study moved Djibouti and Mauritania from Developing to
Critical on a delta of just **−2.8**. Under the previous magnitude-only rule both were unfilable —
leaving two published band labels provably wrong with **no route to correct them**.

**Alternatives.** Lower the magnitude threshold globally — rejected, it would flood the queue with
sub-threshold noise that carries no label error.

**Consequence.** First filing under the clause: **Lagos, 2026-08-18, −3.4**, Developing → Critical,
on a UN OHCHR press release naming the Lagos State Government's demolition programme (the only one
of five band crossings that night to pass the band-crossing evidence test). Djibouti, Mauritania and
Lagos were all applied 2026-08-20. Rationale, recorded: "A published band label that the evidence
contradicts is the most visible error the benchmark can make."

**Status:** active. **Evidence:** `.claude/agents/overnight-assessor.md` §3f;
`research/PENDING_CHANGES.md` `## 2026-08-18`; `research/APPLIED_CHANGES.md` `## 2026-08-20`.

---

## D-05 — 2026-07-21 · The founder may override assessor routing; the override is disclosed, not hidden

**Decision.** `recommendation: "flag-for-review"` routes a decision to a human; the founder may
override it and apply the raw proposed figure. The override must be documented in
`APPLIED_CHANGES.md` with the assessor's reasoning intact, and the proposal's `recommendation` and
`notes` are never edited.

**Context (2026-07-21).** 6 of 8 applied proposals were filed `flag-for-review`, not as recommended
changes. Two (Egypt, Freeport-McMoRan) were additionally flagged as likely screening-rule-3 false
positives — entities surfacing on *negative* within-window evidence producing *upgrade* proposals.
The founder was informed and applied them. State Farm, filed as a `downgrade` with a MAGNITUDE
WARNING recommending a peer-calibrated softer landing zone, was applied at the raw computed 13.8 —
**−47.1, a two-band drop, Established → Critical, rank 57 → 427.**

**Extended 2026-08-16.** 10 of 16 overridden, including Taipei, where roughly 6.0 of the 8.1-point
fall is the integration premium collapsing rather than raw conduct movement — disclosed in a
required caveat and applied.

**Alternatives.** Treat `flag-for-review` as blocking — rejected, it would make the assessor the
final authority on publication.

**Consequence.** Every override note must record: the original recommendation, the assessor's stated
reason (including reasons against), that the founder was informed, and the remedy the assessor
recommended instead. Rank-cascade remediation follows every large move (335 records on 2026-07-21,
379 on 2026-08-16, 406 on 2026-08-20, 47 on 2026-08-21, 20 on 2026-08-23).

**Status:** active. **Evidence:** `research/APPLIED_CHANGES.md` `## 2026-07-21`, `## 2026-08-16`.

---

## D-04 — pre-2026-05 · Defer backend/API until necessary

Carried forward from `.claude/decisions.md` Decision 004. Context: early-stage product, limited
backend need. Consequence: the site is a static export; the only server-side component is a
Cloudflare Worker (`worker/`) for the webhook, unsubscribe, badge and subscriber endpoints. Tradeoff
accepted: possible later refactor.
**Status:** active.

## D-03 — pre-2026-05 · Docker + VPS deployment

Carried forward from Decision 003. Multi-stage build (Node → Nginx Alpine) on a Hostinger VPS, TLS
via Certbot. **See D-09** — the automated pipeline on top of this has never succeeded, and the
static-export-baked-into-the-image property is the direct cause of INC-002.
**Status:** active.

## D-02 — pre-2026-05 · JSON-first structured data

Carried forward from Decision 002. Ranking data lives in `site/src/data/indexes/*.json`, not in
pages. Consequence: eight index files are the published product surface, which is why write
authority over them is the tightest boundary in `AUTONOMY.md`.
**Status:** active.

## D-01 — pre-2026-05 · Next.js App Router, static export

Carried forward from Decision 001. `output: 'export'`; all pages statically exported; no SSR.
**Status:** active.

---

## D-00 — 2026-05-21 · Baseline-drift guard: drift > 2.0pt is always a hold, never an apply

**Decision.** Before any index write, `score-updater` compares the proposal's
`published_scores.composite` against the live index composite. drift ≤ 0.5 accept; 0.5 < drift ≤ 2.0
accept with a logged warning and a recomputed delta; **drift > 2.0 refuse and hold**. A sign
inversion is a hold at any drift magnitude.

**Context.** On 21 May two proposals would have inverted their own intent: US claimed 54.5 → 49.2
(−5.3) against an index actual of 25.0 (drift 29.5, recomputed delta **+24.2**); Pakistan claimed
22.7 → 20.3 (−2.4) against 17.2 (drift 5.5, recomputed **+3.1**). Both refused.

**Consequence.** Held proposals get `status: "held-stale-baseline"`, a `hold_reason`, and a row in
`PENDING_CHANGES.md`. Every batch since reports drift explicitly — all 8 on 2026-07-21, all 16 on
2026-08-16 and all 29 on 2026-08-20 matched at exactly 0.0pt.

**Status:** active, non-negotiable. **Evidence:** `.claude/agents/score-updater.md` §2b.5 and
Important Rule 9.
