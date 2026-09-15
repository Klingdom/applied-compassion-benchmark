# Meta-Review — Improvement Loop, Iterations 10–12 (2026-09-14)

**Reviewer:** meta-coordinator (scoped here to Compassion Benchmark, not Ledgerium; AGENT-ROUTING D-5 still applies to its description).
**Mode:** read-only analysis. No loop artifact, site, research, RISKS or CHANGELOG file was edited. No commit, push or deploy.
**Builds on:** `docs/prfaq/2026-09-14/reviews/meta-coordinator.md` (same-day, "earlier review" below, findings F1–F9, recommendations R1–R5). This document does not repeat those findings; it tests them against the first three loops run after it and turns them into exact rules.

---

## 1. Executive summary

The loop is healthy at the execution layer and weak at the selection layer.

- **Execution: strong.** 3 of 3 loops passed validation on the first attempt. The coordinator re-ran every agent claim itself and caught real defects that agent validation missed. Each loop cut a live error count to zero (1 false formula claim, 1 dead citation pattern, ~20 stale count literals). One of the three added a regression gate that was proven with a planted probe.
- **Selection: biased.** 3 of 3 selections were site-copy/derivation fixes. 0 of 3 touched the research pipeline, which carries 4 of the 6 open High risks (RISK-001, -016, -020, and -002 by volume). 3 of 3 selections ranked below the top ungated item under the current rubric. Two of those deviations were justified by factors the rubric does not encode (live public error, risk-register severity). One deviation (It. 11) was justified by low effort and low risk, which the rubric already subtracts. That counts ease twice.
- **Gating is treated as terminal.** U (16) was skipped twice because one half of it (publishing 61.7%) needs founder sign-off. The other half (computing the number) is agent-doable under AUTONOMY §1a and was never split out. Founder decisions are raised in a briefing that cannot be emailed from this environment, so the time it takes to get an answer has no upper bound.
- **Artifact hygiene is regressing in a new way.** The Jun 20 → Sep 14 log gap is closed by a note. The new risk is an uncommitted pile-up: 54 dirty or untracked paths. They mix It. 12 with build-timestamp churn, July-era uncommitted edits to a published dated briefing, two backup files (1.3 MB) and settings. One "approve commit" could sweep in a §1c violation.

**Overall loop health: Amber.** It is productive and trustworthy per loop. It is not yet pointed at the highest risks, and it cannot yet clear its own founder gates.

---

## 2. What is working (evidence-cited)

| # | Strength | Evidence |
|---|---|---|
| W1 | **Coordinator re-verification catches what agent validation misses** | It. 11: production curl found `/fortune-500/microsoft` → 2 redirects → `/404` served HTTP 200 (soft 404), invisible to build/tests. It. 12: coordinator context review protected dated copy (`/media` inaugural-report sentence; per-briefing trust line reworded rather than restated with today's count, AUTONOMY §1c). It. 10: independent re-run of `scoring.mjs` ([1,1,1,1,5,5,5,5] → 51.5 vs 50.0). It. 12 candidate itself came from verifying a grant-doc line. |
| W2 | **Before/after baselines are measured on production, not asserted** | It. 11 and It. 12 "BEFORE (production curl)" blocks with per-route occurrence counts; It. 11 post-deploy curl verification recorded (run 34901047499). |
| W3 | **Guard proven with a negative control** | It. 12: planted probe with all four patterns → exit 1 (4 findings, file:line); removed → exit 0. This is the right standard for any new gate. |
| W4 | **Discovered work was logged and scored before implementation** | `IMPROVEMENT_BACKLOG.md` lines 38–44: the count-drift item carries I4 S5 L3 C5 E1 R1 = 15 and evidence lines before It. 12 ran. |
| W5 | **Candidate generation was throttled correctly** | It. 10 reused the PR/FAQ reconciled table instead of re-running five candidate agents ("not regenerated, to avoid duplicate work"). This applied earlier-review R2 without being told to. |
| W6 | **Meta-review trigger fired on schedule** | It. 10 and It. 12 follow-ups both flag the 3-loop trigger; this review exists because of it (earlier review F9 said the trigger had been dead since May). |
| W7 | **One-item discipline held under a real temptation** | It. 11 declined CompassionBench disambiguation (names a third party) and left `/404` soft-404 to item T. |

---

## 3. What is not working

### N1 — The rubric's ease terms are applied twice (High)

- **Evidence.**
  - `coordinator.md` Step 5 "Prefer: low effort, low risk" on top of a formula that already subtracts Effort and Risk.
  - It. 11 selected S (14) over D, I and L (each 15). `IMPROVEMENT_BACKLOG.md` line 46 records D and L as ungated. The stated reason was "Effort 1 / Risk 1".
  - It. 12 tie at 15 was broken toward E1 again.
- **Effect.** The top ungated pipeline-facing items (D status ladder, I defect registry) lost two selections in a row to cheaper site items. Neither of those items was blocked.

### N2 — The rubric has no term for risk severity, live exposure, recurrence or deadlines, so the coordinator encodes them by judgment (High)

- **Evidence.**
  - It. 10's reason ("certain, currently-published factual error, RISK-019 Certain/High") is a severity argument the formula cannot express. G-1 scored 14 and U scored 16.
  - RISK-015 (all builds fail from 2026-12-10, 86 days away) sits at PR/FAQ rank 20 with score 12. The formula has no deadline term.
  - The count-drift class recurred **6 times** before it got a gate: It. 6 (06-18), It. 8 agent-introduced "1,156" literal, `0a596d5b` (09-09), `c0c64833` (09-10), It. 11 llms.txt, It. 12. The legacy repetition penalty (earlier review F4) would have *discouraged* the It. 12 gate.
- **Effect.** Every high-value selection needs a written deviation. That makes selection hard to reproduce and easy to bend toward whatever is cheap.

### N3 — Founder gates block whole items instead of only the gated write (High)

- **Evidence.**
  - U was deferred in It. 11 and It. 12 because "U publishes the 61.7% never-assessed share".
  - AUTONOMY §1a lists "Non-published artifacts: root governance files, `docs/**`" as act-alone. The generator and a report-only artifact are agent-doable; only the site publication needs the decision.
  - Same shape for Q (Score-Watch disclosure), R (waiver early-warning is tooling; only the extension is founder), A (collision gate vs slug renames) and K (alerting vs cadence decision).
- **Effect.** "Ungated + low effort" crowds out high-impact work mainly because gated items are not split. Weighting is the smaller cause.

### N4 — Founder decision latency has no clock and no delivery channel (High)

- **Evidence.**
  - `docs/founder-briefings/2026-09-14.md` §4 lists decisions A–F plus two addenda, and the email cannot be sent from this environment (It. 10 follow-ups).
  - Only decision C (commit/deploy It. 10–11) was answered.
  - RISK-014 (Score-Watch NXDOMAIN, "Open — urgent") and RISK-015 (86 days) remain open.
  - D-13/D-14/D-20 have been unresolved since Aug 17–23 (DECISIONS index).
  - 37 approved-but-held and 20 pending proposals, re-counted today by grep, are unchanged since the earlier review.

### N5 — Uncommitted pile-up mixes unrelated and risky changes (High, new)

`git status --short` shows 54 entries. Only about 30 belong to It. 12. The rest:

| Class | Paths | Risk |
|---|---|---|
| Build churn (non-deterministic) | 15 `special-briefings/*.json` + `special-briefings/manifest.json` + `updates/manifest.json` + `public/build-manifest.json` | `build-special-briefings.mjs:474` stamps `generatedAt: new Date()` into **tracked source JSON** on every build. Every loop's diff is noisy; It. 12 had to exclude these by hand. This is a determinism defect. |
| **Uncommitted edit to a published dated briefing** | `site/src/data/special-briefings/america-at-250-2026-07-04.json` (`scope`, `cohortSummary` rewritten) + `research/special-briefings/america-at-250-2026-07-04.md` (last commits 07-02/07-03) | AUTONOMY §1c "Retro-edit a published briefing" is a Never. It may be a legitimate correction, but it has no recorded disposition and would ride along with any broad `git add`. |
| Stale dry-run output | `research/entity-records-dryrun.json` (generated 2026-07-20, scope `us-states`, −1,066 lines vs committed) | Overwrites a full-corpus dry-run with a 51-entity one. |
| Backups | `research/rotation-state.json.bak` (408 KB), `research/scans/2026-09-09.json.bak` (874 KB), dated 09-10 | Clutter; risk of accidental commit of quarantined state. |
| Other | `.claude/settings.local.json` (+289), `docs/GRANT_PROPOSAL_2026-09.md`, untracked `docs/GRANT_REQUEST_2026-09-14.md` | Needs separate founder disposition. |

Also: the working branch is `nightly-research-2026-07-24-27` (equal to `origin/main`), while local `main` is 57 commits behind. A branch named for a July research run now carries improvement loops, which weakens traceability.

### N6 — Status artifacts contradict themselves and the repo (Medium-High)

- **`SYSTEM_HEALTH.md` contradicts itself.**
  - Header: 1,325 entities / 8 indexes.
  - Its "Canonical facts" say "Scored entities: 1,156 … 7 indexes".
  - "Build Status" says 1,666 pages; It. 10 measured 1,978.
  - "Quality Scores" say "54 E2E tests, 0 unit tests", while 16+ unit/validator suites run in `npm run test`.
  - "Artifact Coverage" lists `CHANGELOG.md` as Missing while it exists.
  - "Known Blockers" says the VPS auto-deploy is broken; it has 7+ consecutive successes.
  - The header has grown to 8 prepended narrative blocks, while the tables have not been updated since 2026-06.
- **`CLAUDE.md` Data notes** (loaded by every agent) still say "US States: 21 of 51", "Robotics Labs: 50 labs", "Countries: 193 of 207" and "7 JSON ranking data files". These are the very figures It. 12 removed from the site. The It. 12 guard scans only `src/app` + `src/components`, so an agent that copies facts from CLAUDE.md can reintroduce them into scripts, docs or briefings.
- **`CHANGELOG.md`** It. 10 and It. 11 entries still read "pending commit/deploy" after the verified deploy.
- **ITERATION_LOG gap.** 136 commits between 2026-06-21 and 2026-09-13, 0 with "iteration"/"loop" in the subject. It. 10's numbering note is adequate and must not be retro-filled.

### N7 — One recurring class got no gate (Medium)

"Published method copy contradicts the canonical formula" has now occurred twice: It. 9 ("base /80" model) and It. 10 ("balanced beats spiky"). G-3 (`methodology/page.tsx:1266`, `ConsistencyStepChart.tsx`, `dimensions.ts:635`) is a probable third site. It. 10 fixed the instance and added no check. Under the recurrence rule below, the next item in this class must include an executable check. For example, a test that recomputes every numeric example on method pages via `computeCompositeFromDimensions`.

---

## 4. Pattern analysis

| Pattern | Type | Evidence | Implication |
|---|---|---|---|
| Live public error → verified fix → zero | Success | It. 10/11/12 outcomes | Keep the verification protocol (§7) exactly. |
| Instance-fixing a recurring class for months before gating it | Failure | Count drift ×6 before `test-no-stale-counts`; slug collisions documented 05-18, first fix 09-14 | Recurrence bonus plus a required gate (§5, §6 rule S4) |
| Gated item deferred whole | Failure | U deferred ×2; Q, R, K, N, E all have agent-doable halves | Split rule (§6 rule S2) |
| Ease double-counted in tie-breaks and deviations | Failure | It. 11, It. 12 | Remove ease from Step 5 preferences (§6 rule S1) |
| Discovered defect logged and scored before work | Success | Backlog lines 38–44 | Codify with a pre-emption cap (§6 rule S3) |
| Scope expansion accepted as "same defect" | Mixed | It. 12 added Universities rows (same defect face) **and** a new hand-written home takeaway sentence (new drift surface, It. 12 follow-up) | Accept/reject rule (§6 rule S5) |
| Validated work waits on founder; next loop starts on top of it | Failure (emerging) | It. 10 and It. 11 both uncommitted at It. 11 end; It. 12 uncommitted now; 54 dirty paths | Uncommitted-work (WIP) limit (§6 rule S6) |
| Build writes tracked files | Waste | `build-special-briefings.mjs:474` | Backlog item: deterministic `generatedAt` (§8) |

**Portfolio mix, Iterations 10–12:**

| Area | Loops |
|---|---|
| Site copy/derivation correctness | 3 |
| Traceability/evidence linkage | 1 partial (It. 11 citations) |
| Test gates | 1 (It. 12) |
| Research-pipeline correctness | 0 |
| Coverage/observability | 0 |
| Entity identity | 0 |
| Commerce integrity | 0 |
| Governance/provenance | 0 |

The work was not low-value. Each loop removed a live, externally checkable error. It was low-leverage relative to the risk register.

---

## 5. Scoring assessment and exact model change

### 5.1 Assessment

- The base rubric (I + S + L + C − E − R) is reasonable. Keep it unchanged so v1 scores stay comparable.
- It lacks the four signals the coordinator kept adding by hand: risk severity, live exposure, recurrence and deadline.
- The founder gate must not be a score penalty. A penalty hides importance and pushes urgent items down the queue. It should be a **lane**: blocked items are ineligible for selection, stay visible, and get a clock.

### 5.2 Scoring model v2 (exact)

```
Base     = Impact + Strategic + Learning + Confidence − Effort − Risk        (each 1–5; unchanged)

Adjusted = Base + K + P + Rc + Ag + Dl

K  (risk reduction)  Highest RISKS.md entry the item CLOSES:  High/High = +3 · one High = +2 · Medium/Medium = +1 · none = 0
                     If the item only REDUCES (does not close) that risk: subtract 1 (min 0).
                     "Certain" likelihood counts as High. The item must cite the RISK ID.
P  (live exposure)   +1 if the defect is on production now and was confirmed by a recorded BEFORE check (curl/grep of live output).
                     Cap: K + P ≤ +4.
Rc (recurrence)      +2 if the item installs a mechanical gate for a defect class with ≥2 dated occurrences in the defect-class registry and no gate.
                     −1 if the item fixes an instance of such a class WITHOUT adding a gate (forces gate-or-waiver).
                     0 otherwise.
Ag (aging)           +1 per full 14 days an item with Base ≥ 13 has been eligible and not started. Cap +3.
Dl (deadline)        Hard external or self-inflicted date: ≤ 30 days = +3 · ≤ 90 days = +2 · ≤ 180 days = +1.

Tie-break (in order): higher Dl → higher K → forward exposure (the defect can publish NEW errors next cycle) → higher Rc → lower Effort.
Lane (not score): status = blocked-on-founder | eligible. Blocked items are never selected; see rule S2.
```

### 5.3 Backtest against Iterations 10–12 (sanity check, not re-scoring history)

| Item | Base | K | P | Rc | Dl | v2 | Notes |
|---|---:|---:|---:|---:|---:|---:|---|
| G-1 (It. 10) | 14 | +2 | +1 | −1 | 0 | **16** | RISK-019 reduced (cliff/premium open); 2nd formula-copy occurrence, no gate |
| S-1 (It. 11) | 14 | 0 | +1 | 0 | 0 | **15** | No RISKS.md entry (C18 is a PR/FAQ correction) |
| Count drift (It. 12) | 15 | 0 | +1 | +2 | 0 | **18** | Gate for a 6-occurrence class |
| U-1 (build only, report-only) | 15 | +2 | 0 | 0 | 0 | **17** | RISK-001/016 observability (reduces) |
| D-1 (headline-verb gate) | 16 | +2 | +1 | 0* | 0 | **19** | RISK-020 reduces; *+2 if registry confirms ≥2 occurrences |
| A-1 (entity-records test + collision ratchet) | 15 | +2 | 0 | +2 | 0 | **19** | RISK-017/018 reduces; identity class ≥8 occurrences |
| R-1 (waiver T-30 warning, PASS-with-waivers) | 12 | +2 | 0 | 0 | +2 | **16** | RISK-015; 86 days |
| L (cross-links/overclaiming) | 15 | 0 | +1 | 0 | 0 | **16** | No RISKS.md entry |

**Result.**
- v2 would have kept It. 10 (16 vs L 16, tie-break on K) and It. 12 (18).
- It would have replaced It. 11's S-1 (15) with a pipeline or identity item.
- It ranks D-1 and A-1 above every site-copy item.

That is the intended correction, and it is small.

### 5.4 Adoption

Treat v2 as **one control variable**, the scoring model version.

- For Iterations 13–15, log both v1 and v2 scores for the selected item and the top two alternatives.
- Do not change selection rules and weights again until the next meta-review has these three data points.
- The Rc term requires a defect-class registry. The coordinator should create it as a governance artifact (§1a) when applying this review, not as an iteration. Seed it from earlier-review F4 plus N7:
  - count drift (gated, partial coverage)
  - method copy vs formula (2, ungated)
  - date/year (partly gated)
  - currency/unit (ungated)
  - entity identity/slug (ungated for collisions)
  - briefing claim vs source (RISK-020, ungated)

---

## 6. Selection rules (exact coordinator changes)

- **S1 — No double-counting ease.** Delete "low effort" and "low risk" from `coordinator.md` Step 5 "Prefer". Any selection that is not the top eligible v2 score must cite a reason that is **not** a term already in the formula. Record it as `Deviation: <reason>`.
- **S2 — Split gated items; the gate applies to the write, not the work.**
  1. When an item needs founder sign-off, split it into `X-1` (everything AUTONOMY §1a allows: generator, report-only artifact, test, draft copy behind no route) and `X-2` (the gated publication or decision).
  2. Score `X-1` on its own and keep it eligible.
  3. Put `X-2` in the decision packet with a recommended default.
  4. Never defer the whole item for a gate that covers only part of it.
- **S3 — Mid-session discovered defects.** A discovery may pre-empt the ranked queue only if all four hold:
  1. It is logged in `IMPROVEMENT_BACKLOG.md` with a v2 score and evidence **before** implementation starts (It. 12 did this).
  2. Its v2 score ≥ the top eligible ranked item, **or** it is a live error about scores, formula, entity identity or money (P = 1 and K ≥ 2).
  3. No more than 1 pre-emption per 3 loops, so the queue does not become inbox-driven.
  4. It is not the same defect class as the previous loop unless it installs the gate (Rc = +2).
- **S4 — Gate-or-waiver on recurrence.** Any item fixing an instance of a class with ≥2 registry occurrences must either include a mechanical check (with a planted-probe proof) or record a dated waiver with an owner in the registry. N7's formula-copy class is the first application.
- **S5 — Scope expansion accept/reject.** Accept agent scope expansion only if all five hold:
  - (a) same defect class and the same verification method covers it;
  - (b) no new authority class (no index/score/methodology/entity-identity write, no dated-copy edit);
  - (c) no new hand-written factual claim, unless it is derived from data or the coordinator verified it against the data and logged a derive-it follow-up;
  - (d) it adds no more than ~30% to the planned file count;
  - (e) it is logged under "Same-defect completions".

  Otherwise revert the extra hunk and add a backlog row. It. 12's Universities rows pass (a–e). Its home takeaway sentence passes only through (c) with the logged follow-up. That was correct but borderline, and the rule would have made it explicit.
- **S6 — Uncommitted-work (WIP) limit and path-scoped commits.**
  1. At most 1 validated-but-uncommitted iteration may exist when a new implementation loop starts. Exception: its file set is disjoint from the pending one (record the pathspec).
  2. With 2 pending, stop implementing and do non-implementation work (decision packet, registry, artifact hygiene).
  3. Every ITERATION_LOG entry lists an explicit **commit pathspec**. Approval requests name that pathspec, never "commit all".
  4. Build-churn files and pre-existing unrelated edits are listed as "excluded" in the entry.
- **S7 — Deadline forcing.** If a dated risk reaches T-30 with no founder decision (RISK-015: **2026-11-09**), its agent-doable half (R-1) becomes the forced next selection, regardless of score.

---

## 7. Orchestration and verification rules

### 7.1 Standardize the verification protocol that worked (V1–V7)

Record each as a checkbox line in every ITERATION_LOG entry:

| # | Step | Origin |
|---|---|---|
| V1 | Production BEFORE baseline by curl/grep with counts per route | It. 11, It. 12 |
| V2 | Coordinator re-runs each agent claim (tests, formula checks, greps); reading the agent's report does not count | It. 10, It. 11 |
| V3 | Negative-control proof for every new guard (planted probe fails, removal passes) | It. 12 |
| V4 | Grep the **built output** (`out/`), not only source | It. 11 (15/15 llms URLs), It. 12 |
| V5 | Dated-content check against AUTONOMY §1c for any copy change touching dated publications | It. 12 |
| V6 | Diff scope review listing every changed file as in-scope, same-defect (S5) or excluded churn | It. 11, It. 12 |
| V7 | Post-deploy production AFTER curl, recorded against V1 | It. 10–11 deploy |

### 7.2 Invocation changes

1. **Match specialists to the item type, especially outside site copy.**
   - Research-pipeline and briefing items (D-1, claim-trace): implementer plus `benchmark-research` for semantic correctness of status vocabulary, and `qa-engineer` for the gate's false-positive run on the existing 79 briefings (report-only first).
   - Identity/data items (A-1): `data-engineer` or `backend-engineer`, with `qa-engineer` validating the ratchet.
   - `frontend-engineer` alone was right for It. 10–12. It is not sufficient for pipeline items.
2. **Root-cause before retry** (earlier review F6, still unimplemented). After a second failed validation or stage failure, invoke a root-cause pass that checks shared constraints (budget caps, credentials, environment, WIP collisions) before rewriting a brief or relaunching.
3. **Candidate generation stays throttled.** Skip Step 2 (five-agent candidate generation) until the top 5 eligible v2 items are done or declined with a reason. The PR/FAQ §6 table plus the backlog is the candidate set through Iteration 15.
4. **Meta-review cadence.** Keep "every 3 loops". Add two triggers: any loop that deviates from the top eligible v2 item, twice in a row; and any founder decision older than 14 days that blocks an item with v2 ≥ 16.
5. **Artifact updates are part of "done"** (earlier review R2.3, now concrete):
   - correct every SYSTEM_HEALTH row the change makes false;
   - flip CHANGELOG "pending commit/deploy" to the commit SHA on deploy;
   - keep at most the last 3 narrative blocks in the SYSTEM_HEALTH header and point to ITERATION_LOG for older ones.
6. **Rescope this agent.** Update `meta-coordinator.md`'s description to Compassion Benchmark (agent spec, §1a) so AGENT-ROUTING D-5 stops routing work away from it.

### 7.3 Loop metrics to judge v2 at the next meta-review

| Metric | Baseline (It. 10–12) | Target (It. 13–15) |
|---|---|---|
| Loops that reduce or close a RISKS.md High item | 1/3 (It. 10, RISK-019) | ≥ 2/3 |
| Loops touching the research or data pipeline | 0/3 | ≥ 2/3 |
| Selections below the top eligible score (v1 / v2) | 3/3 / 1/3 (backtest) | v2: 0/3 without a non-formula deviation reason |
| Validated-uncommitted iterations at loop end | 1–2 | ≤ 1 |
| Dirty paths not attributable to a pending iteration | ~24 | 0 |
| SYSTEM_HEALTH rows contradicted by repo facts | ≥ 6 (N6) | 0 |
| Founder decisions open > 14 days | ≥ 5 (D-13, D-14, D-20, D-21, RISK-006) | falling; each has a default in the packet |
| Recurring classes (≥ 2) with neither gate nor waiver | ≥ 4 | ≤ 2 |

---

## 8. Priority tuning: categories for Iterations 13–15

**Favor:**
1. Research/briefing publication correctness (RISK-020)
2. Entity identity gates (RISK-017/018)
3. Coverage observability (RISK-001/016)
4. Deadline de-risking (RISK-015, forced at T-30)

**Hold back:** further site-copy items without a RISKS.md entry (L, G-3, S-2), unless they carry Rc = +2.

**Add to backlog** (coordinator to score; not selected here):
- **Deterministic `generatedAt` in `build-special-briefings.mjs`.** Derive it from the source content hash or the source commit date, not `new Date()`. Type fix, determinism; likely I3 S5 L2 C5 E1 R1 = 13.
- **Extend `test-no-stale-counts` to `site/scripts/` generators** (It. 12 follow-up).
- **Method-page numeric-example test** (N7; required by S4 before G-3 ships).

### Recommended next-3 shortlist

| Order | Item | v2 | Why | Founder-gated? | Sequencing constraint |
|---|---|---:|---|---|---|
| **13** | **D-1 — measured-vs-published headline gate.** Add a rule to `lint-daily-briefings`: status verbs (falls / rises / drops / moves to a band) in a headline or dek require `scoreChangesApplied > 0` for that entity, or an explicit "measured"/"proposed" qualifier. Forward-dated briefings only. The existing 79 are checked report-only and **not rewritten** (AUTONOMY §1c). PR/FAQ D, first half; the renderer's Published/Measured columns are D-2 later. | 19 (21 if registry confirms ≥2 occurrences) | Reduces RISK-020 (High/High) on the path that publishes every cycle (forward exposure). Evidence: 09-14 headline "Hong Kong falls 5.9 points" with `scoreChangesApplied: 0`; four post-gate errors in `cef937df`. First loop to move the benchmark's own public claims under a mechanical check. | **No** (commit/deploy approval only) | File set disjoint from It. 12 if it avoids `site/package.json` (the lint already runs in `build`). Can start with It. 12 pending under S6. |
| **14** | **A-1 — wire `test-entity-records.mjs` into `npm run test` and turn the `export-public-data.mjs` slug-collision WARN into a ratchet.** The build fails on any collision beyond the 16 known, and the known list only shrinks. | 19 | Reduces RISK-017/018 (High likelihood; the wrong entity is served to badges and data consumers). Installs a gate for the most-recurring class (identity, ≥8 occurrences), and PR/FAQ A's "wired into CI" AFTER state. **Verified today:** the test exists, writes no files, and passes (19,687 passed, 0 failed), so wiring it is low-risk. No slug renames (those stay §1b). | **No** | Edits `site/package.json` `test` chain, which It. 12 also edits. **Wait for It. 12 to be committed.** |
| **15** | **U-1 — coverage/freshness generator, report-only.** A script over `research/rotation-state.json` emits a committed report under `research/` or `docs/`: never-assessed share, % assessed within 30 days, median assessment age, per-index breakdown. Fail-loud on schema drift; unit test on a fixture. Site publication is U-2, founder-gated. | 17 | PR/FAQ rank 1 (16), deferred twice for a gate covering only its publication half (N3). Reduces RISK-001/016 by making the measurement repeatable, and supplies §8 KPI baselines (61.7%, 10.1%, ≈60 days) that are currently one-off manual greps. Also gives future meta-reviews a coverage trend to measure loop value against. | **Build: no. Publish (U-2): yes** (packet item 4) | Independent of It. 12. If the founder approves publication before It. 15, U-1 still ships first; U-2 becomes the following item. |

**Forced override:** if no waiver decision exists by **2026-11-09**, R-1 (T-30 expiry warning + PASS-with-waivers visibly distinct) pre-empts whichever of these is next (S7).

---

## 9. Founder decision packet (bundled; each has a recommended default)

Deliver as one message with numbered yes/no/alternative replies. It replaces the addenda-style asks in `docs/founder-briefings/2026-09-14.md` §4 and consolidates PR/FAQ §7 items that block the queue.

| # | Decision | Recommended default | Unblocks / risk | Age |
|---|---|---|---|---|
| 1 | **Commit + deploy Iteration 12, path-scoped.** Commit only the It. 12 files plus `site/scripts/test-no-stale-counts.mjs`, `site/package.json`, `CHANGELOG.md`, `ITERATION_LOG.md`, `IMPROVEMENT_BACKLOG.md` and `SYSTEM_HEALTH.md`. **Exclude** build-churn JSON/manifests, America-at-250 files, `entity-records-dryrun.json`, `.bak` files, `settings.local.json` and grant docs. | Approve, scoped | It. 12 live; unblocks A-1 (S6) | 0 days |
| 2 | **Uncommitted July edit to the published 2026-07-04 America-at-250 briefing** (`scope`, `cohortSummary` rewritten; `.md` source also modified). | Hold. Do not commit with anything. If it is a correction, publish it as a disclosed, dated correction note rather than a silent rewrite (AUTONOMY §1c); otherwise discard. | §1c compliance | ~73 days |
| 3 | **Score-Watch (RISK-014, NXDOMAIN).** | Pause new sales (`useGumroad: false`) and hide the badge widget now. Check Gumroad sales history. Deploy Worker + DNS and run one real test purchase before re-enabling. | Live commerce integrity | Open, "urgent" |
| 4 | **Publish the never-assessed share (U-2 / E).** | Yes: on `/methodology` with the measurement definition (`last_assessed` null in rotation-state) and date, generated by U-1 rather than hand-typed. | U-2, E | 0 days |
| 5 | **Product-separation waivers (RISK-015, expire 2026-12-09).** | Extend now on staggered dates with a recorded DECISIONS entry; resolve D-13 on its own timeline. Otherwise R-1 is forced on 2026-11-09. | All builds after 12-10 | 86 days to cliff |
| 6 | **Research cadence floor and execution model (RISK-016, PR/FAQ K).** | ≥ 5 validated cycles per 7 days, taking precedence over programme work. One isolated session per cycle with a search-budget preflight. Scheduled runs commit to a date branch, not `main`. | K; stops cadence collapse recurring | Open since earlier review |
| 7 | **Approval provenance (RISK-021, PR/FAQ N).** | Branch protection on `main`; founder-approved PRs required for `site/src/data/indexes/**` and `research/change-proposals/**`. | N; independence claim | 0 days |
| 8 | **Approval throughput.** | Batch commit/deploy approvals once per day by named pathspec. *Optional:* a standing approval limited to commits with no data, score, methodology or entity change, all gates passing and a scoped pathspec. This changes AUTONOMY §1b, so it is founder-only; do not assume it. | S6 queue; loop latency | — |
| 9 | **Refresh `CLAUDE.md` Data notes** ("21 of 51 states", "Robotics 50", "193 of 207", "7 JSON files"). | Replace the literal counts with a pointer to `site/src/data/entityCount.ts` and `site/public/build-manifest.json`. The founder edits it, or approves the edit explicitly. | Stops agents re-seeding the count-drift class It. 12 just gated | Stale since 05-18 |
| 10 | *Low urgency:* backup files and branch naming. | Delete the two `.bak` files after confirming they match quarantined artifacts. Run future loops on `improve/<date>-<item>` branches rather than `nightly-research-2026-07-24-27`. | Hygiene | — |

---

## 10. Concrete changes for the coordinator to apply (if accepted)

1. `coordinator.md` Step 4: replace the formula with scoring model v2 (§5.2). Step 5: delete "low effort / low risk" from "Prefer" and add rules S1–S7 (§6).
2. `coordinator.md` Step 7: add the V1–V7 checklist (§7.1). Step 8: add the artifact definition of done (§7.2 item 5) and the pathspec line (S6).
3. `coordinator.md` Meta-Review Trigger: add the two triggers in §7.2 item 4.
4. Create the defect-class registry (governance artifact, §1a) seeded as in §5.4; it is the data source for Rc.
5. `IMPROVEMENT_BACKLOG.md`: add the v2 column for the PR/FAQ top 20 plus the three new items in §8; mark U, Q, R, K, N, E split into X-1/X-2 with lanes.
6. `SYSTEM_HEALTH.md`: one-time replacement of the stale tables with an as-of-dated snapshot (1,325 · 8 indexes · 1,978 pages · current suite list · deploy streak · open High risks); trim the header to 3 blocks.
7. `ITERATION_LOG.md`: from It. 13, log v1 and v2 scores, any deviation reason, V1–V7 and the commit pathspec. Do not backfill the Jun–Sep gap.
8. Deliver §9 as a single decision packet. Record each answer in DECISIONS.md with its date; unanswered items age into the next packet.
