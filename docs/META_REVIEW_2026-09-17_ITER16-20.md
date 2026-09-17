# Meta-Review 3: Improvement Loop, Iterations 16–20 (2026-09-17)

**Reviewer:** independent meta-reviewer, read-only.
**Scope:** selection, verification and orchestration of Iterations 16, 17 and 18 (committed and deployed), and
Iterations 19 and 20 (validated, not committed). Also covers whether Meta-review 2's rules changed behaviour.
**Mode:** I edited no existing file. I made no commit, push or deploy, and I ran no `npm run build`. This document is
the only new file in the repo. Isolation test trees and probe scripts were built in the session scratchpad, outside
the repo.
**Builds on:** `docs/META_REVIEW_2026-09-14_ITER10-12.md` (scoring v2, S1–S7, V1–V7) and
`docs/META_REVIEW_2026-09-16_ITER13-15.md` (V8, S8–S11, the P amendment). The rules I checked against are the ones
now in `.claude/agents/coordinator.md` lines 601–671.

---

## Triggers — did they fire?

| Trigger (coordinator.md) | Fired? | Evidence |
|---|---|---|
| Every 3 completed loops | **Yes, at the close of It. 18 (2026-09-16, after deploy 35161725312). Honoured two iterations late.** | Iterations 19 and 20 were implemented after the trigger fired and before any review existed. Nothing in the overlay makes a fired trigger stop work, so the loop kept going. |
| Two consecutive loops deviate from the top eligible v2 item | **Yes. Fired unambiguously at It. 19 → It. 20, and arguably already at It. 17 → It. 18.** | Eligible and queued the whole time: **L 16** and **R-1 16** (`IMPROVEMENT_BACKLOG.md:197–198`). Selections: It. 17 v2 15 (founder directive) · It. 18 v2 15 (Meta-review 2's order) · It. 19 v2 14 (Meta-review 2's order; the log wrongly calls it the "top-ranked eligible item") · It. 20 **no v2 score logged**, v1 11, chosen because its files did not overlap It. 19's under S6. Not one of the four carries the `Deviation:` label that S1 requires (grep count 0; the same grep finds it in `coordinator.md`). |
| Founder decision > 14 days blocks an item scoring ≥ 16 | **No, not formally. It will effectively fire on 2026-10-17.** | D-13 (28 days) blocks A-2c and the fix for the waiver that expires first. Neither blocked item has a v2 score, so the trigger has nothing to compare against (see Amendment T1). Scored today, the D-13-gated waiver fix is about 15, and it reaches 16–17 when its deadline enters the 30-day window on 2026-10-17. |
| Two consecutive failed validations | No | — |

---

## 0. What I verified myself (not taken from the log)

Every ✔ row below was re-run, re-fetched or probed by me on 2026-09-17. Every absence claim is paired with a
positive control, as V8 requires.

| Check | Result |
|---|---|
| `npm run test` on the working tree (It. 19 + It. 20 together) | ✔ exit 0. **28 steps** (`scripts.test.split('&&')`). HEAD has 27 and `65861fb0` (Meta-review 2) has 23. SYSTEM_HEALTH's 2026-09-17 note ("27 → 28") is right; its **Tests header still says 23**, even though its own regeneration command prints 28. |
| Concurrent-scanner interference with `test:rotation-state` | ✔ none possible. The suite is fixture-only (`test-validate-rotation-state.mjs:6`: "Does not touch research/rotation-state.json"). It passed 28/0 first time. The scanner had not written yet: `research/scans/2026-09-17.json` was absent and `rotation-state.json` was last modified 2026-09-16 08:33. No re-run was needed. |
| **It. 19 alone** (HEAD + only It. 19's 5 test-relevant files, isolated tree) | ✔ exit 0, 27 steps. Collision ratchet 19/0. Entity records 19,702/0. |
| **It. 20 alone** (HEAD + only It. 20's 7 files, isolated tree) | ✔ exit 0, 28 steps. `test:pinned-slugs` 10/0, with **33** divergent rows (not 34 — the 34th is It. 19's Singapore pin). Entity records 19,687/0. |
| Positive control that the isolation can detect coupling | ✔ I put It. 19's ratchet into the It. 20-only tree and it **FAILED** ("expected exactly 15 known collisions … got 16"). The two iterations really are independent at the test level. |
| Probe: does `test:pinned-slugs` guard the `rowSlug` that actually ships? | ✔ **No.** I made the shipped `src/lib/slugify.ts` `rowSlug` ignore the pinned slug (so all 34 links would break again) and the guard still passed **10/0, exit 0**. The test checks its own mirrored copy (`test-pinned-slugs.mjs:66`). No other test in the chain imports `rowSlug`. The file was restored, sha256 `925674a6…` identical before and after. |
| `gh run list --limit 15` | ✔ 15 consecutive `success`. Since Meta-review 2: 35144049054 (`81865fbf`, It. 16 and It. 17 in one commit) and 35161725312 (`633ed6ff`, It. 18). `6fad2a3f` is `[skip ci]`. |
| Live `/build-manifest.json` (It. 18's V7) | ✔ `{"sha":"633ed6ff","branch":"main","dirty":true,"source":"env"}`. The sha matches HEAD. **`dirty: true` is still unexplained** because there has been no deploy since. |
| Live `/global-cities` (It. 20's V1 claim) | ✔ `href="/city/phoenix"` ×1 and `/city/phoenix-global-cities` ×0. Control `href="/city/tokyo"` ×1. `/city/singapore` ×1. Iteration 20 is not deployed, as expected. |
| Live `/data/scores/singapore.json` | ✔ still `indexSlug: "global-cities"`, 56.2. Iteration 19 is not deployed. |
| **Live audit of all 34 pinned-slug rows** (fetch each index page, then request each name-derived href without following redirects) | ✔ **All 34 are linked by their name-derived slug on production. 32 of them 301 to `/404`.** One redirects correctly (Phoenix) and one returns 200 (Singapore, because the city still sits at the bare slug). The 32 broken links include AT&T, S&T Bancorp, W&T Offshore, DR Congo, Georgia (the US state), Google DeepMind, xAI and **25 robotics labs**. Controls: `/robotics-lab/intuitive-surgical` 200, a nonsense slug gives the same 301 → `/404`, and Phoenix proves the classifier can recognise a working redirect. |
| Which nginx config production runs | ✔ `Dockerfile:40` `COPY nginx.conf`. Only `deploy.sh:53` copies `nginx-ssl.conf`, and CI never runs `deploy.sh` (`deploy.yml:130–137`). **26 rewrites exist only in `nginx-ssl.conf`** (25 robotics labs + Georgia, from `70f81dc2`, 2026-09-01). A fixed-string grep finds each in `nginx-ssl.conf` (=1) and not in `nginx.conf` (=0). Control: the Phoenix rewrite is found in both. The other 6 broken slugs have no rewrite in either file. |
| Live headers | ✔ `Strict-Transport-Security` 0 and `Content-Security-Policy` 0; control `X-Frame-Options` 1. `Server: openresty` is an upstream TLS proxy. Every `rewrite … permanent` sends `Location: http://…` (`/city/phoenix`, `/country/cape-verde`, `/methodology.html`), which adds a downgrade hop. |
| RISK-018 (accented slugs) still live | ✔ `/data/scores/sao-paulo.json` → 301 `/404`; `/data/scores/s-o-paulo.json` 200; `/city/sao-paulo` 200. |
| Private `slugify` implementations | ✔ **9 in scripts**: `export-public-data`, `build-entity-records`, `apply-entity-record`, `apply-us-states`, `validate-indexes`, `test-entity-records`, `test-collision-ratchet`, `reconcile-rotation-state`, plus a model-registry one. Control: the exported `src/lib/slugify.ts:14` is found. The export uses `row.slug ?? slugify(name)`, which differs from `rowSlug` for blank slugs. That is latent only: 0 of 169 pinned slugs are blank or untrimmed. |
| `test:no-stale-counts` scope | ✔ scans **`.tsx` only**, under `src/app` + `src/components` (176 files, which matches its own banner). Same patterns run by me elsewhere: `src/lib` 0 hits; `src/data` **3 hits, all in comments** ("8 indexes" in `entities.ts:153`, `indexRegistry.ts:133`, `nav.ts:15`); `.ts` files under app/components 0. Controls: a probe string gives 2 pattern hits, and the guard's own scope gives the 2 allowlisted `media/page.tsx` lines. |
| Remaining collisions vs the prose describing them | ✔ `known-collisions.json` has **15** = 13 global/US-city pairs *including* `washington-dc`, plus 2 labs. The public CHANGELOG entry (It. 19) and RISK-017 both say "**13 US cities**, Washington DC, and two robotics companies", which adds up to **16**. |
| Waiver clock | ✔ earliest expiry `D13-figure` **2026-11-16**, so **T-30 = 2026-10-17**. S7 in `coordinator.md:633` still says 2026-11-09. `validate-product-separation` prints expiry dates but gives no pre-expiry warning, so R-1 is not built. |
| Proposal queue, counted from the directory | ✔ 37 `approved` + 20 `pending`, **unchanged across all three meta-reviews**. |
| It. 17's empty registry | ✔ `release-sources-v1.json` has `sources: []` and 0 `http` strings (control: the validator contains 4). |
| It. 16's claim gate in practice | ✔ `CLAIM_TO_SOURCE_CUTOFF = "2026-09-17"`. The newest daily briefing is `2026-09-15.json`. **The gate has never run against a briefing it enforces**, so tonight's cycle is its first real test. |
| ITERATION_LOG rule markers, It. 16–20 (lines 1–320) | ✔ commit pathspec **0 of 5** (control: It. 13 has `Commit pathspec (It. 13)`) · `Deviation:` 0 (control above) · V4 0 (control: 3 elsewhere in the log) · §6 metrics table 0 · It. 20 has no v2 score (control: It. 19 has one). |
| `SYSTEM_HEALTH.md` "Latest status notes (last 3)" | ✔ holds **6** dated notes. Step 8 of the overlay allows ≤ 3. |
| `research/entity-records-dryrun.json` | ✔ `generated_at 2026-09-16T14:04Z`, `scope.only_slug: "ljubljana"`, `git_sha f0aedb37`. A scoped dry run overwrote the tracked July full-catalogue dry run. It belongs to neither iteration. |

---

## 1. Verdict: **Amber, and splitting.** Engineering is stronger than ever; governance is slipping at loop speed.

The engineering is real. It. 16 installed the claim-to-source gate that Meta-review 2 called the most dangerous hole,
and found its own silent-degradation defect before shipping. It. 18 took build churn from 19 files to 0 and made
production name its commit; the CI-path catch was load-bearing and I confirmed it live. It. 19 applied S8 and S9 as
written, and reverted a green-gated change that would have quietly decided an open founder question. V8 visibly
changed how the coordinator works: 20 void probes were recorded and caught before any claim was made.

Three things keep this Amber, and they are more serious than last time:

1. **The live-defect picture was wrong in the loop's own records.** 32 entity links on the published ranking pages
   go to `/404` today. It. 20 described them as "surviving only because nginx rewrites it". That description came
   from reading a config file that production does not run, not from requesting the URLs.
2. **Gates are checking copies of the logic, not the logic that ships.** The newest gate passes with the shipped
   function broken. The same pattern (nine private slug functions, three of them inside identity gates) is why
   RISK-018 is still serving 404s with a green suite.
3. **The governance layer is written down, not followed.** The meta-review trigger was overrun by two iterations.
   Commit pathspecs, `Deviation:` labels, V4 and the metrics table were each recorded 0 of 5 times.
   SYSTEM_HEALTH is more wrong than when S11 was written. The coordinator's own summary of Meta-review 2 inverted two
   of its metric verdicts. S7 carries a date that D-37 made obsolete.

---

## 2. Findings

### F1: Selection. S10 bound; after It. 16 the queue order came from the previous review, and then from WIP capacity

| It. | Item | v2 logged | Top eligible at the time | What actually decided it |
|---|---|---:|---|---|
| 16 | CS-1 claim-to-source gate | 18 | CS-1 18 | **S10 forced selection.** The rule did its job. |
| 17 | L1 release-detection path | 15 | L 16 / R-1 16 | Founder directive. Legitimate, but no `Deviation:` record. |
| 18 | DC-08 + BM-1 | 15 | L 16 / R-1 16 | Meta-review 2's order (a reason outside the formula, allowed by S1). No `Deviation:` record. |
| 19 | A-2 tranche 1 | 14 | L 16 / R-1 16 | Meta-review 2's order. The log wrongly says "top-ranked eligible item". |
| 20 | Components honour pinned slugs | **none** (v1 11) | L 16 / R-1 16 | "Iteration 19 is uncommitted and S6 forbids a second uncommitted iteration on the same file set." |

- **The deviations were not bad choices.** It. 18 and It. 19 followed a reviewed ordering. It. 20 turned out to be
  the most valuable of the five, because it removes 32 live 404s. It was picked for the wrong reason, though: it
  fit the WIP limit. Had V1 been measured on production, It. 20 would have qualified outright as an S3 pre-emption
  (a "live identity error"). The loop got the right item by luck.
- **S6 has turned from a brake into a steering wheel.** It exists to stop work piling up uncommitted. It. 20 used
  S6 to *choose* work: whatever touches different files is selectable, so an 11 beats two 16s. Even read literally,
  S6 did not need disjointness here, because one iteration was pending when It. 20 started (the limit is ≤ 1).
- **The disjointness claim is false for four files.** `ITERATION_LOG.md`, `IMPROVEMENT_BACKLOG.md`,
  `SYSTEM_HEALTH.md` and `docs/DEFECT_CLASS_REGISTRY.md` each mix It. 19 and It. 20 text, sometimes in a single hunk
  or on a single table row (the DC-05 registry row). No per-iteration pathspec can separate them. The code sets are
  disjoint, and I proved each iteration is green on its own. The governance record is not, so approving only one of
  the two would commit text describing work that is not in the commit.
- **L has been eligible at 16 since 2026-09-14.** Under the Ag term it becomes 17 on 2026-09-28.

### F2: Verification. The gap has moved from "is the check sensitive?" to "is the check looking at what ships?"

V8 fixed the failure mode Meta-review 2 found. Across It. 16, 19 and 20 the coordinator recorded **20** probes that
returned void or false readings, and every one was caught by a control before a claim was made. That is a real
behavioural change. The new failure mode is one level up: **checks that are sensitive but aimed at the wrong
artifact.** There are three dated instances, and none is caught by V1–V8 as written:

1. **The test checks a mirror, not the product** (2026-09-17, my probe). `test-pinned-slugs.mjs` defines its own
   `rowSlug` "mirrored from src/data/entities.ts". Its semantics tests pass whatever the shipped function does. I
   broke the shipped `rowSlug` and the guard stayed 10/0. The same pattern is why **RISK-018 stays green**:
   `test-entity-records.mjs` and `test-collision-ratchet.mjs` each carry a private `slugify` that matches the
   exporter's non-accent-folding copy, so the exporter and its tests agree with each other and disagree with the
   pages. `/data/scores/sao-paulo.json` returns `/404` today.
2. **The config checked is not the config that ships** (2026-09-01, discovered 2026-09-17). `70f81dc2` added 26
   slug-correction rewrites to `nginx-ssl.conf` only. `Dockerfile:40` ships `nginx.conf`. The only thing that ever
   copied `nginx-ssl.conf` in was manual `deploy.sh`, and CI deploys (continuous since 2026-09-09) never call it. It.
   19 then edited both files "byte-identically", and the S9 consumer list names both, so one of the two edits is
   maintenance of a file that does nothing. The 2026-09-14 PR/FAQ security and SEO reviews both said this
   (`security-auditor.md:190`, `seo-aeo-architect.md:18,57`), and the loop never absorbed it. RISK-022's mitigation
   still says "add HSTS … in nginx-ssl.conf", and that file already has the header production does not send.
3. **The deploy script edited is not the one that runs** (2026-09-16, It. 18). The BM-1 exports were wired into
   `deploy.sh`, which CI never runs. The coordinator caught this one in review.

**It. 20's V1 was part measurement, part inference.** "Measured on production" is true for `/global-cities`. It is
not true for the claim that the robotics links survive via 301: one `curl` shows 301 → `/404`. That understated the
live severity, left the iteration unscored, and hid an urgent deploy. See Amendment V9(b).

**V4 has now lapsed for eight iterations running** (13–20), all because local builds run out of memory. `tsc --noEmit`
now works locally (It. 20) and CI builds. Nothing, however, greps the built or served output for the defect. A
post-deploy link check over the 8 ranking pages would have caught all 32 broken links on any of the green deploys
since they appeared. That is LC-1 in §7, not a new rule.

### F3: Orchestration. Throughput beat bookkeeping, and the review of the review drifted

- **Trigger overrun.** Three loops completed by the evening of 2026-09-16; two more were implemented by 2026-09-17
  08:50. The overlay says "call meta-coordinator when…" but never says to stop. See Amendment T1.
- **S6.3 pathspec: 0 of 5**, down from 2 of 4 in the previous window. It. 16 and It. 17 went into **one commit**
  (`81865fbf`); they shared `site/package.json`, so neither can be reverted without the other. D-31 ("every
  approval names its files") exists to prevent exactly this.
- **The coordinator's summary of Meta-review 2 misstates its metrics.** `ITERATION_LOG.md:348–351` lists
  "unattributable dirty paths 0" as passing and "founder decisions open 24–30 days" as failing. The review itself
  (§6) scored dirty paths **FAIL (24)** and founder decisions **PASS (falling)**. It. 18 then describes dirty paths as
  "the one metric that review scored as failing". The review scored three as failing. Adoption was recorded from
  memory rather than read back.
- **Adoption was partial.** The Rc amendment was replaced by prose, which was fine and recorded. The P line inside
  the v2 block (`coordinator.md:617`) still says "+1", with the "+2" amendment appended 50 lines further down. S7's
  date was never re-derived after D-37 staggered the waivers.
- **§1b approval scope for A-2 is inferred, not explicit.** The backlog cites D-35 for the collision renames. D-35's
  text covers the 20 encoded Fortune 500 names and the `&` convention. It. 19's near-miss on Figure AI and 1X shows
  the risk of stretching a class-level approval. The founder should confirm the scope (packet item 4).
- **A public CHANGELOG entry about to be committed contains an arithmetic error** ("15 collisions remain (13 US
  cities …, Washington DC, and two robotics companies…)", which is 16). The DC-04 gate covers briefings only. The
  changelog and RISKS rows need correcting before the It. 19 commit (packet item 1).
- **Unattributable dirty paths fell from 24 to 6.** That is DC-08's fix working. The remaining six are listed in
  packet item 3.

### F4: Rule effectiveness. What changed behaviour, and what was only written down

| Rule | Changed behaviour? | Evidence |
|---|---|---|
| **V8** (positive control) | **Yes, strongly** | 6 + 12 + 2 void probes recorded as caught (It. 16, 19, 20). The planted-probe habit is now routine. |
| **S10** (ungated class forces selection) | **Yes** | It. 16 was selected by it. DC-04 is gated. |
| **S8** (edit JSON through a parser) | **Yes** | It. 19: "parser-based edit after verifying `parse → stringify` was byte-identical". |
| **S9** (path-set diff on rename) | **Yes, with a wrong input** | It. 19 recorded the before/after path set (+`singapore-global-cities` only). The consumer list it works from includes an undeployed nginx file and a Worker KV store with no migration path. |
| **S2** (split gated work) | **Yes, newly applied to a new item** | A-2 split into a/b/c at intake, with A-2c correctly placed in the blocked lane. This fixes Meta-review 2's F8. |
| **S5** (scope expansion) | **Late** | The Figure/1X pins passed every gate and were only reverted after re-reading RISK-017. The rule held because the coordinator re-read the risk file, not because anything enforced it. |
| **S6** (WIP limit) | **Yes, but inverted** | Used to *select* It. 20. Its pathspec clause was followed 0 of 5 times. Its disjointness test ignores governance files. |
| **S1** (`Deviation:` label) | **No** | 0 labels across 4 below-top selections. |
| **S7** (waiver T-30 clock) | **No (date is stale)** | Still 2026-11-09. The real T-30 is 2026-10-17. |
| **S11** (generated status figures) | **No** | Tests header "23" beside a regeneration command that prints 28. See the §6 table for the row count. The "or carry the command" clause let the figure stay wrong. |
| V4 (grep built output) | No (8 iterations) | Out of memory locally; no substitute defined. |
| Metrics table every loop | No (0 of 5) | Only this review measured them. |
| Meta-review triggers | No (overrun by 2) | — |

**The pattern:** rules that change *what an engineer does at the keyboard* (V8, S8, S9, S10) were followed. Rules
that change *what gets recorded or when to stop* (S1, S6.3, S7, S11, triggers, metrics) were not, and each of those
failures makes the next review's job harder. The fix is not more rules. It is making the few bookkeeping rules either
mechanical or stop conditions.

### F5: S10 forced-selection check

**No registered class forces a selection today.** DC-04 and DC-08 were closed. DC-06 has a real partial gate
(`research/scripts/validate-scan.mjs` date checks since 2026-07-27, which I verified), though no waiver for the
over-correction direction. DC-07 has no evidence. DC-10 has one occurrence.

The two candidates It. 20 logged:
- **The fifth private `rowSlug` copy in `src/data/entities.ts`.** Not forced. That copy *is* the page builder and is
  correct. There is no live divergence from it. The live private-copy instances are in `site/scripts` (RISK-018, see
  F2.1), which the It. 20 guard does not scan.
- **`test:no-stale-counts` not scanning `src/lib` / `src/data`.** Not forced. The gap is wider than logged: the guard
  also skips every `.ts` file. Scanning the skipped scope finds only **3 comment-level** literals in `src/data` and
  **0** reader-facing ones. Log it as a coverage note; it is not a live defect.

**Two classes that are not in the registry already have ≥ 2 dated occurrences with neither a gate nor a waiver.**
They should be registered now, which starts their S10 clock:
- **DC-11: a change applied to an artifact production does not run.** 2026-09-01 (26 rewrites in `nginx-ssl.conf`
  only; 32 live 404s today, verified) · 2026-09-16 (BM-1 exports in `deploy.sh` only; caught) · RISK-022's
  mitigation aimed at the unused file. Gate: a CI assertion that the redirect set lives in the file `Dockerfile`
  copies, plus the post-deploy link check (LC-1).
- **DC-12: a gate verifies a copy of the logic it guards.** 2026-07-12 (`test-entity-href` listed 7 indexes and
  passed while 100 universities were unsearchable; SYSTEM_HEALTH archive) · 2026-09-16 (It. 16's lookup degraded to
  advisory on a wrong path while reporting success; fixed) · 2026-09-17 (`test-pinned-slugs` mirror, my probe) ·
  RISK-018's private `slugify` copies in identity tests. Gate: guards must import the shipped symbol (Amendment
  V9a). Extend the private-`slugify` scan in `test-pinned-slugs.mjs` to `site/scripts` and `research/scripts`, with
  an allowlist that shrinks toward zero.

---

## 3. What is working (keep unchanged)

| # | Strength | Evidence |
|---|---|---|
| K1 | **V8 adopted as a reflex** | 20 void probes caught before any claim was made, and recorded with root cause (`/tmp` → `C:\tmp`, MSYS `sed` stripping `\r`, JSDoc-only imports). |
| K2 | **Fail-loud over fail-quiet** | It. 16 turned an empty lookup into an exit-2 error. It. 18 replaced a plausible `"unknown"` with `source: "unavailable"` plus a reason. Both are the right instinct. |
| K3 | **Reading the consumer before changing a field** | It. 18 derived `generatedAt` from git (it has a JSON-LD reader) and deleted the unread `updatedAt` fields after grepping for readers. Churn 19 → 0, verified. |
| K4 | **Reverting a green change on authority grounds** | It. 19 reverted the Figure/1X pins to HEAD bytes, deleted the twins, and wrote the lesson ("no gate encodes an unratified ownership decision") into the registry. |
| K5 | **Honest emptiness** | It. 17 shipped an empty source registry with no invented URLs (0 `http` strings, verified), and a `not-run` scan record kept as evidence (D-39). |
| K6 | **Predictions registered before validation** | It. 19's table of predicted and actual values (63 warnings, 15 collisions, 1,310 unique slugs, 19,702 records) is the best validation record in the log. |

---

## 4. What is not working

| # | Problem | Severity |
|---|---|---|
| N1 | **32 published ranking-page links go to `/404`** (AT&T, DR Congo, Georgia, Google DeepMind, xAI, 25 robotics labs). The fix (It. 20) is validated but not deployed. No post-deploy check covers links, and every green deploy since the links broke missed it (all 15 runs listed since 2026-09-09 are green). | **High** |
| N2 | **Gates verify copies, not the shipped code** (DC-12). `test-pinned-slugs` is blind to its own subject. Nine private `slugify` copies, three inside identity tests, keep RISK-018 live and green. | **High** |
| N3 | **Two nginx configs, one deployed** (DC-11). 26 rewrites and HSTS exist only in the dead file. Every redirect downgrades to `http://`. RISK-022's mitigation targets the wrong file. | **High** |
| N4 | Meta-review trigger overrun by 2 iterations. Deviation trigger fired with no `Deviation:` records. S6 used as a selection criterion. | Medium-High |
| N5 | SYSTEM_HEALTH contradicted rows: ≥ 5 → **≥ 12**. S11's "or carry the command" clause let a false figure stand beside a correct command. | Medium-High |
| N6 | Pathspec recording 0/5, and two iterations fused into one commit (`81865fbf`). The 4 governance files cannot be split between It. 19 and It. 20. | Medium |
| N7 | RISK-018 (High, live) and RISK-022 have **no backlog row**. This is the same failure Meta-review 2 found for A-2. | Medium |
| N8 | S7's date (2026-11-09) is obsolete. The real T-30 is **2026-10-17**, and from 2026-11-17 `validate:product-separation` blocks `npm test` and therefore every CI deploy. | Medium (dated) |
| N9 | Public CHANGELOG entry and RISK-017 row (uncommitted, It. 19) say "13 US cities + Washington DC + 2" = 16, while the file lists 15. | Medium (fix before commit) |
| N10 | The status records are stale. RISK-020 is still "Open" with no mention of the It. 16 gate. RISK-019 still says "pending deploy" (deployed 09-14). RISK-017 still says the export "only warns" (it fails the build since It. 14). | Low-Medium |
| N11 | `dirty: true` in production's manifest is still unexplained. `git status --porcelain` counts untracked files, so the most likely cause is untracked files on the VPS, but that is unproven. | Low |

---

## 5. Proposed amendments (four, each grounded in a dated event)

Append to the overlay in `.claude/agents/coordinator.md`. Nothing else in S1–S11 or V1–V8 changes.

> **V9: Verify the artifact that ships, not a copy or a neighbour of it.**
> (a) A test that guards a function must import the shipped symbol. A local re-implementation inside a test
> ("mirrored from …") is a defect in the gate, not a convenience. (b) A claim about production behaviour (status
> code, redirect target, header, link destination) is a recorded request against production. It is never inferred
> from a config or script. Config and deploy edits are verified against the file the `Dockerfile` or CI workflow
> actually consumes, named in the log. (c) The planted probe that proves a gate (V3) is committed as a self-test
> inside that gate, so a later refactor that blinds the gate fails the chain.
> *Grounding: 2026-09-17, `test-pinned-slugs` passed 10/0 with the shipped `rowSlug` broken; 2026-09-17, It. 20
> recorded 34 links "surviving via 301" when 32 resolve to `/404`, because the rewrites live only in the
> undeployed `nginx-ssl.conf` (since `70f81dc2`, 2026-09-01); 2026-09-16, BM-1 exports wired into `deploy.sh`,
> which CI never runs.*

> **S6 (amended): WIP capacity is a brake, never a selection reason.** Disjointness is computed from
> `git diff --name-only` per iteration, and `ITERATION_LOG.md`, `IMPROVEMENT_BACKLOG.md`, `SYSTEM_HEALTH.md`,
> `docs/DEFECT_CLASS_REGISTRY.md`, `CHANGELOG.md` and `RISKS.md` always count as shared. An item selected *because*
> it fits the WIP limit records `Deviation: WIP-fit` and counts toward the two-deviation trigger. When two iterations
> are pending, the approval request names both code pathspecs, the commit order, and one shared governance commit.
> *Grounding: It. 20 (2026-09-17) selected at v1 11 over two eligible 16s "because S6"; its governance edits share
> hunks with It. 19's.*

> **T1: A fired trigger is a stop condition, and blocked items are scored.** When any meta-review trigger fires,
> the next loop may do governance, hygiene or docs work only, until the review exists (the same brake as S6 with
> two pending). Every backlog item carries a v2 score whatever its lane, so the "founder decision > 14 days blocks
> an item ≥ 16" trigger can actually fire. S7's date is **derived, not typed**: T-30 of the earliest `expires` in
> `site/scripts/product-separation-waivers.json` (today `D13-figure` 2026-11-16, so **2026-10-17**).
> *Grounding: Iterations 19 and 20 ran after the 3-loop trigger fired at It. 18's close (2026-09-16); S7 still read
> 2026-11-09 after D-37 re-dated every waiver (2026-09-16).*

> **S11 (amended): the regeneration-command escape is removed.** A status figure that disagrees with its own
> regeneration command counts as a contradicted row and an occurrence of DC-01. The numeric sections of
> `SYSTEM_HEALTH.md` (test steps, deploy streak, deployed SHA, risk tally, dirty-path count) are emitted by a
> committed script as the last step of each loop. Prose is exempt.
> *Grounding: 2026-09-17, header "23 steps" beside a command that prints 28; ≥ 12 contradicted rows.*

**Rejected on purpose:** a new scoring term, a rule about founder directives, and a rule requiring metrics
measurement. The metrics table belongs in the S11 generator's output, not in a new rule.

---

## 6. Metrics: Meta-review 1 §7.3, measured for Iterations 16–20

| Metric | 13–15 | Target | **Measured 16–20** | Verdict |
|---|---|---|---|---|
| Loops reducing or closing a RISKS.md High item | 3/3 | ≥ 2/3 | **2/5**: It. 16 RISK-020, It. 19 RISK-017. It. 18 partly addresses RISK-004 (not High/High). The RISK-016 row is unchanged after It. 17, and detection still cannot run. | ❌ FAIL |
| Loops touching the research or data pipeline | 2/3 | ≥ 2/3 | **4/5**: 16, 17, 18, 19 | ✅ PASS |
| Selections below top eligible v2 without a `Deviation:` record | 0/3 | 0 | **4/5** below top; 0 labelled; 1 (It. 20) without any reason about the item itself | ❌ FAIL |
| Validated-uncommitted iterations at loop end | 0 | ≤ 1 | **2** (19, 20) | ❌ FAIL |
| Dirty paths not attributable to a pending iteration | 24 | 0 | **6** (settings, dry-run JSON, 2 held America-at-250, 2 `.bak`) | ❌ FAIL (−75%) |
| SYSTEM_HEALTH rows contradicted by repo facts | ≥ 5 | 0 | **≥ 12**: snapshot date and "last change"; 6 notes under "last 3"; Tests "23"; `test:no-stale-counts` "uncommitted"; lint rule "uncommitted"; waivers "all expire 12-09"; build-churn row; "9 consecutive … 376b0f85"; "17 entries, all open"; RISK-020 "pending"; RISK-023 "founder-gated"; working tree "release/2026-09-15 … 16 timestamp JSON"; Loop artifacts missing Meta-review 2 | ❌ FAIL (worse) |
| Founder decisions open > 14 days | 4, falling | falling | **Same 4, older**: D-14 31d · D-13 28d · D-20 25d · D-21 25d. Also 37 + 20 proposals unchanged for 28 days. | ❌ FAIL |
| Recurring classes (≥ 2) with neither gate nor waiver | 3–4 | ≤ 2 | **Registry: 0 hard + DC-06 partial. Evidence: 2 unregistered (DC-11, DC-12).** | ⚠️ PASS on the registry, FAIL on the evidence |

**1 clear pass of 8.** The failures cluster in bookkeeping and stopping, which is exactly what T1 and the amended S6
and S11 target. The one large improvement (dirty paths 24 → 6) came from a mechanical fix (DC-08), not from a rule.
That is the argument for making the rest mechanical too.

---

## 7. Ranked next-3 shortlist (v2 as amended; arithmetic shown)

**Binding constraint:** two iterations are pending, so S6 forbids new implementation until the founder answers
packet items 1–2. Item 2 below is docs-only and can run now. Items 1 and 3 start once 19 and 20 are committed.

| Rank | Item | Base | v2 | Why this, now | Lane / S6 |
|---|---|---|---:|---|---|
| **1** | **LC-1: link integrity and one nginx config (DC-11).** (a) Move the 26 `nginx-ssl.conf`-only rewrites and the HSTS header into `nginx.conf`, add `absolute_redirect off` (or `https` `return 301`s) so redirects stop downgrading, and retire `nginx-ssl.conf` plus the `deploy.sh` copy line. (b) Add a post-deploy job to `deploy.yml` that fetches the 8 ranking pages and asserts every entity href returns 200 (`/404` fails), with a planted broken href as its probe. (c) Add a CI assertion that the file `Dockerfile` copies contains every rewrite in the committed redirect list. | I4 S4 L4 C5 − E2 − R2 = 13 | **17** = 13 + K 1 (RISK-004, the deploy-verification gap; High impact, reduced) + P 1 (26 legacy URLs → `/404` live; http downgrade on every redirect) + Rc 2 (DC-11 once registered, ≥ 2 dated) | Up to 15 consecutive green deploys shipped these broken links and nothing noticed. This is the check that would have caught it, and it also covers RISK-022's HSTS. Touches `nginx.conf` (It. 19's file), so start after It. 19 is committed. | Eligible; deploy approval under §1b |
| **2** | **D-13-1: draft the primary-product determinations for the 6 waivered entities** (Figure AI, 1X/Halodi, Boston Dynamics SPOT demo, Amazon, Meta, Microsoft), using `INDEX_EXPANSION_SCOPE_2026-08-20.md` §1.1–1.2. One docs artifact with a proposed disposition per entity, for the founder to ratify. | I4 S5 L2 C4 − E2 − R1 = 12 | **16** = 12 + K 2 (RISK-015 High/High, reduced) + Dl 2 (first expiry 2026-11-16, ≤ 90 days). **Becomes 17 on 2026-10-17** (Dl ≤ 30 days). | The real remedy for the 2026-11-17 build break, and it unblocks A-2c. Tie-break against R-1: Dl and K are equal, and on forward exposure D-13-1 *removes* the cliff while R-1 only *announces* it. Docs only, so allowed under S6 today. | Eligible now (§1a docs); ratification is founder-gated |
| **3** | **R-1: waiver T-30 warning** in `validate-product-separation.mjs`, with PASS-with-waivers reported distinctly from PASS | recorded 12 | **16** (recorded; K 2 · Dl 2). **Forced on 2026-10-17** under corrected S7. | Cheap, disjoint from 19 and 20, and it becomes compulsory in 30 days anyway. Doing it before the force date avoids a forced loop. | Eligible after 19 and 20 are committed |

**Also eligible, deliberately not in the top 3:**
- **L (16 → 17 on 2026-09-28).** Its defect surface publishes nothing new between reviews. That is Meta-review 2's
  S1 reason, still true.
- **RS-4: one slug implementation for scripts, plus the 13 accented-slug migrations (RISK-018).**
  I4 S5 L3 C4 − E3 − R3 = 10, + K 2 (RISK-018 High, closed) + P 1 (`sao-paulo.json` → `/404`) + Rc 2 (DC-12
  gate) = **15**. **It has no backlog row; create one** (same failure as A-2 in Meta-review 2). It touches
  `lib/slugify.ts` (It. 20) and the exporter, so it waits for It. 20 to be committed. The migration half falls under
  the D-35 approval-scope question (packet item 4).
- **Fix the test-pinned-slugs mirror (V9a)** is a 3-line change, so fold it into RS-4 or LC-1 rather than giving it
  a loop. A-2a is about 12 and A-2b about 11.

---

## 8. Founder decision packet

Numbered for yes/no/alternative replies, each with a recommended default. Ages are as of 2026-09-17.

| # | Decision | Recommended default | Unblocks / risk | Age |
|---|---|---|---|---|
| **1** | **Commit Iteration 19** (A-2 tranche 1, Singapore). Exact pathspec: `git add -- site/src/data/indexes/global-cities.json site/src/data/entity-records/singapore.json site/src/data/entity-records/singapore-global-cities.json site/scripts/known-collisions.json site/scripts/test-collision-ratchet.mjs nginx.conf nginx-ssl.conf CHANGELOG.md RISKS.md` | **Approve after one wording fix.** In `CHANGELOG.md` and the RISK-017 row, "13 US cities … Washington DC" becomes "**12** US cities … plus Washington DC" (the file lists 15). Green on its own (isolated run: exit 0, 27 steps, ratchet 19/0, records 19,702/0). Note that the `nginx-ssl.conf` edit has no effect in production. | Fixes `/data/scores/singapore.json` serving the city | 1 day |
| **2** | **Commit Iteration 20** (components honour pinned slugs). Exact pathspec: `git add -- site/src/lib/slugify.ts site/src/components/index/EntitySearch.tsx site/src/components/index/IndexPageCharts.tsx site/src/components/index/RankingTable.tsx site/src/components/layout/NavbarSearch.tsx site/package.json site/scripts/test-pinned-slugs.mjs` | **Approve and deploy first.** It removes **32 live `/404` links** on the ranking pages. Green on its own (exit 0, 28 steps, pinned-slugs 10/0). Ship it as-is; its guard's mirror of `rowSlug` (V9a) is a follow-up, not a blocker. | 32 broken links: AT&T, DR Congo, Georgia, Google DeepMind, xAI, 25 robotics labs | 0 days |
| **2b** | **Shared governance commit and order.** After commits 1 and 2: `git add -- ITERATION_LOG.md IMPROVEMENT_BACKLOG.md SYSTEM_HEALTH.md docs/DEFECT_CLASS_REGISTRY.md docs/META_REVIEW_2026-09-17_ITER16-20.md` (`[skip ci]`). Push all three together so there is one deploy. | Approve both or neither. **If only one is approved,** the coordinator must rewrite these four files rather than commit text describing uncommitted work, because the It. 19 and It. 20 entries share hunks. Before this commit, correct the It. 20 log and registry wording ("34 divergent rows must exist": the test asserts ≥ 1 plus two named anchors). | S6.3 traceability | — |
| **3** | **Files that belong to neither iteration.** Never commit `.claude/settings.local.json` (local harness permissions). **`research/entity-records-dryrun.json`**: a scoped Ljubljana dry run (2026-09-16 14:04Z, `f0aedb37`) overwrote the tracked full-catalogue dry run. **`research/special-briefings/america-at-250-2026-07-04.md` and `site/src/data/special-briefings/america-at-250-2026-07-04.json`**: the held §1c rewrite from 2026-09-03 (the JSON is rebuilt from the held `.md` by It. 18's deterministic generator). **`research/rotation-state.json.bak` and `research/scans/2026-09-09.json.bak`**: untracked since 2026-09-10. | Restore the dry run (`git checkout -- research/entity-records-dryrun.json`) and point the script's default output at a gitignored path. Delete both `.bak` files. For America-at-250, see item 8. | 6 dirty paths → 0 | 1–14 days |
| **4** | **Confirm the approval scope for slug renames.** The backlog treats D-35 (encoded names) as approving *all* collision renames under §1b. | State it explicitly: "A-2a/A-2b renames with 301s approved; any row covered by an open decision (D-13) is excluded." That makes the It. 19 near-miss impossible by definition. | A-2a, A-2b, RS-4 migration | 1 day |
| **5** | **D-13: ratify or reject the primary-product test.** The Figure AI waiver expires **2026-11-16**. From 2026-11-17 `validate:product-separation` fails `npm test`, and CI will not deploy. | Ratify, and delist the ai-labs rows for Figure AI and 1X (the drafted disposition). Otherwise extend those two waivers by 60 days as a recorded decision **by 2026-10-17**. The agent can draft all six determinations now (shortlist item 2). | RISK-015, A-2c, RISK-003 | **28 days** |
| **6** | **One nginx config** (DC-11): production ships `nginx.conf`, while 26 rewrites and HSTS live only in `nginx-ssl.conf`. | Approve the direction for LC-1: move everything into `nginx.conf`, stop the `http://` redirect downgrade, retire `nginx-ssl.conf` and the `deploy.sh` copy line. Container and deploy changes still come back for commit approval. | RISK-022, 26 legacy URLs | new |
| 7 | **D-14** (absence of disclosure = 2 vs Cerebras) | Re-assess Cerebras under the 2-convention (carried default). | RISK-005 | **31 days** |
| 8 | **America-at-250**: publish the held rewrite as a dated correction, or discard it | Publish it as a dated addendum (§1c). Either answer closes 2 dirty paths permanently. | §1c | 14 days |
| 9 | **D-20 / D-21** (Zimmer Biomet destination; disclosure density before robotics batches) | Decide both in one sitting (carried). | Robotics batches, one entity | **25 days** |
| 10 | **RISK-002**: 37 approved-but-held + 20 pending proposals (**unchanged across three reviews**) | Authorise a de-veto re-assessment batch for the 10 largest divergences (carried). | Core currency claim | 28 days |
| 11 | Carried, short: **Gumroad sales-history check** (RISK-014, the only item involving money) · **branch protection on `main`** (RISK-021) · **RS-3** delist 4 tracked ai-labs · **populate `release-sources-v1.json`** with verified URLs (It. 17, the only thing blocking detection) | Defaults as in Meta-review 2 §8. For the source registry: add 5–10 official model-release pages you have personally verified. | — | 1–3 days |

---

## 9. Changes for the coordinator to apply, if accepted

1. `.claude/agents/coordinator.md`: append V9, replace S6 and S11 with the amended wording, add T1, replace S7's
   literal date with the derived rule, and change the v2 block's `P +1` line to match the adopted +2 amendment.
2. `docs/DEFECT_CLASS_REGISTRY.md`: register **DC-11** and **DC-12** with the dated occurrences in F5 (this starts
   their S10 clock). Note on DC-01 that `test:no-stale-counts` scans `.tsx` only. Correct the DC-05 wording "34
   divergent rows must exist".
3. `IMPROVEMENT_BACKLOG.md`: add rows for **LC-1**, **D-13-1**, **RS-4 (RISK-018)** and a RISK-022 row (or fold it
   into LC-1). Score L's Ag. Log a v2 score for It. 20 retroactively (about 14–15 on its true live severity).
4. `RISKS.md`: RISK-020 (It. 16 gate, not yet exercised on an enforced briefing) · RISK-019 (deployed) · RISK-017
   (the export fails the build; 15 = 12 cities + DC + 2) · RISK-022 (the mitigation targets the undeployed file) ·
   RISK-015 (next T-30 is 2026-10-17).
5. `SYSTEM_HEALTH.md`: build the S11 generator rather than hand-correcting the 12 rows a third time.
6. `ITERATION_LOG.md`: correct the Meta-review 2 summary's inverted metric verdicts in a dated addendum (do not
   rewrite the entry). From the next loop on, record the pathspec, any `Deviation:`, and the §6 table.
7. After deploying 19 and 20 (V7): `/global-cities` links `/city/phoenix-global-cities` and
   `/city/singapore-global-cities`; `/data/scores/singapore.json` shows `indexSlug: "countries"`; re-run the
   34-link audit from §0 and expect **34 of 34 hrefs returning 200 and 0 redirecting to `/404`** (control: a nonsense
   slug still goes to `/404`). Also record whether `build-manifest.json` still says `dirty: true`.
