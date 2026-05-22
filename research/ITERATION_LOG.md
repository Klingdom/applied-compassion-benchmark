# Iteration Log

Record of score-update batches applied to the published index files AND continuous improvement loops.

---

## Improvement Loop 6 — 2026-05-22 — Shared Rule Module (closes Loop 5 rule-sync caveat)

**Trigger:** Loop 5 left an explicit rule-sync caveat: `test-lint-briefings.mjs` mirrored the `FORBIDDEN_*` constants from `lint-daily-briefings.mjs`. Without a shared module, a rule update in one file could silently neuter test coverage in the other. Loop 5 explicitly logged this and created backlog item #13.

**Selected item:** Backlog #13 — Extract rule constants into shared `site/scripts/lib/lint-rules.mjs` (Priority Score 11).

**Selection rationale:**
- Closes the explicit caveat left open by the previous loop. Highest-confidence win available (predicted Effort 1, Risk 1).
- Strengthens determinism axis: a single source of truth for forbidden phrases / status values / pipeline keys means tests and enforcement cannot disagree.
- Loop diversity: Loops 1–5 touched 4 different files (score-updater.md, overnight-digest.md, benchmark-research.md/overnight-assessor.md, lint script, test harness). Loop 6 is a refactor — different defect class. No repetition penalty triggered.
- Per meta-coordinator's "small wins after long loops" guidance: Loop 5 was a substantial new file (11 tests, fixture management). Loop 6 is a 30-line refactor — gives the system breathing room before tackling higher-effort items.

**Agents involved:** coordinator (3-file refactor, no specialist needed).

**Changes:**
- `site/scripts/lib/lint-rules.mjs` — NEW. Single source of truth. Exports:
  - `FORBIDDEN_PHRASES` (22-entry array)
  - `FORBIDDEN_STATUS_VALUES` (9-entry Set)
  - `FORBIDDEN_PIPELINE_KEYS` (9-entry Set)
  - `scanForViolations(node, path = "")` — reusable recursive scanner returning `[{path, rule, detail, snippet}]`
- `site/scripts/lint-daily-briefings.mjs` — Refactored. Now imports `scanForViolations` from `./lib/lint-rules.mjs`. Removed inline constants and inline scan implementation. Reduced from ~180 LOC to ~125 LOC.
- `site/scripts/test-lint-briefings.mjs` — Refactored. Removed duplicated `FORBIDDEN_*` constants and inline scanner. Now imports `scanForViolations` from `./lib/lint-rules.mjs`. Preserved the legacy 3-arg `scanInMemory(node, path, violations)` wrapper so all 11 existing test cases continue to work unchanged.

**Validation:**
- `npm test` — 80/80 pass (69 scoring + 11 lint). All 11 lint tests now exercise the canonical shared module.
- `npm run build` — Clean. `[lint-daily-briefings] PASS — 38 daily JSON files clean`. 1,227 static pages prerendered.

**Outcome:** Rule constants now have a single source of truth. Any future rule addition (e.g., new forbidden phrase) lands in one file and is picked up automatically by both the build-time enforcer and the test harness. Drift impossible.

**Health impact:**
| Metric | Before | After |
|---|---:|---:|
| Rule sync risk | manual mirror in 2 files | impossible (shared module) |
| Source-of-truth files for rules | 1 doc (overnight-digest.md) + 2 code copies | 1 doc + 1 code copy (lib/lint-rules.mjs) |
| Lines of duplicated rule code | ~80 | 0 |

**Post-hoc Effort/Risk calibration:**
- Effort: predicted 1, actual 1. Mechanical refactor as predicted.
- Risk: predicted 1, actual 2. Initial refactor used 2-arg signature `scanForViolations(node, path)` that returns violations, but tests called the wrapper with a third `violations` arg. First test run produced 7 failures (each test pushed `v` to a wrapper that ignored it). Fix was a 7-line wrapper update preserving the legacy signature. **Calibration signal: refactors crossing a function boundary need to preserve consumer call shapes, not just internal logic. Risk underestimated; in retrospect should have been 2.**

**Learning to extract for the rubric:**
- Refactors that change function signatures inherit the risk of *every* caller. Even a "purely mechanical" extraction has Risk ≥2 if downstream code uses the function in idiomatic but undocumented ways. The 1-arg-return vs 3-arg-mutate idioms looked equivalent on paper; in practice they aren't.

**Follow-ups:**
- Loop 7+ candidates: #14 (drift-guard test harness, score 10) — directly enabled by Loop 5's calibration signal that test-harness Effort is overestimated; #6 (FORWARD_TRIGGERS.md, score 13) — pure new artifact, addresses 6/10 traceability axis on cycle planning; #10 (cycle-over-cycle drift report, score 9) — closes the 0→6 target listed in SYSTEM_HEALTH.md.

---

## Improvement Loop 5 — 2026-05-22 — Test Harness for Lint Rules (closes 2/10 test-coverage red zone)

**Trigger:** Meta-coordinator review flagged test coverage at 2/10 — a system-health red zone untouched across Loops 1–4. Backlog #11 (test harness, score 9) was explicitly named as the next-loop pick after Loop 4's pivot away from recency anchoring.

**Selected item:** Backlog #11 — Test harness for nightly pipeline rules (Priority Score 12 after post-hoc Effort/Risk re-scoring during the loop).

**Selection rationale:** Loops 1–4 created or strengthened rules in 3 agent files + 1 build-time script. None of them were under automated test. A regression in any rule would only show up in a future visible incident. The drift guard from Loop 1 is agent-rule (hard to test directly without agent invocation), but the lint script from Loop 3 is pure code and trivially testable. Closing the easiest win in the red zone first.

**Agents involved:** coordinator (single-file create + package.json wiring).

**Changes:**
- `site/scripts/test-lint-briefings.mjs` — Created. 11 tests covering each rule class in the lint script:
  1. Clean input → 0 violations
  2. Forbidden phrase in nested string caught
  3. Forbidden status value caught
  4. Forbidden pipeline key caught
  5. Empty pendingReview array caught
  6. cycleType parenthetical caught
  7. Phrase case-insensitivity
  8. Multiple violations in one document all caught
  9. Loop 2 GOOD observer-voice examples pass (regression guard)
  10. Lint script returns non-zero on synthetic violating fixture
  11. Lint script returns zero on real (clean) corpus
- `site/package.json` — Added `test:lint` script. Wired `npm test` to run both `test:scoring` (existing) and `test:lint` (new).

**Validation:**
- `npm test` runs both suites: 69 scoring tests pass, 11 lint tests pass — **80 total, 0 failures**.
- The fixture-based test (#10) writes a synthetic violating JSON file into the real daily/ folder, runs the actual lint script via execSync, and verifies non-zero exit. Cleans up after itself.
- Test #11 runs the actual lint script against the real corpus and verifies zero exit (proving no production-data regression introduced by the test harness itself).

**Outcome:** Test coverage rises 2/10 → 5/10 (rough estimate; covers lint rules and scoring formula; pipeline agents themselves still untested). The Loop 2 GOOD examples are now a permanent regression guard — any future rule change that would re-flag the polished observer-voice phrases would fail this test.

**Health impact:**
| Metric | Before | After |
|---|---:|---:|
| Test coverage of pipeline agents | 2/10 | 5/10 |
| Rule-set regression detection | none | automated |
| Build chain | lint at build time | lint at build time + tested at PR time |

**Post-hoc Effort/Risk calibration:**
- Effort: predicted 4, actual 2. Mirror-of-rules pattern made the test file trivial to author once the lint script existed. **Calibration signal: testing post-hoc-correct code is much cheaper than scoring assumed.**
- Risk: predicted 2, actual 1. Pure-additive test file; no behavior change.

**Learning to extract for the rubric:**
- Code that is *already* in production and known to work needs trivial-effort test scaffolding. Effort cost is dominated by writing tests for **new** code, not by retrofitting tests around existing code. Future similar items (e.g., test harness for score-updater drift guard) should score Effort 1–2, not 3–4.

**Rule-sync caveat (noted for future loop):**
- `test-lint-briefings.mjs` mirrors the `FORBIDDEN_PHRASES` / `FORBIDDEN_STATUS_VALUES` / `FORBIDDEN_PIPELINE_KEYS` constants from `lint-daily-briefings.mjs`. If the rule sets drift, tests #2–#7 could silently lose coverage. Recommend Loop N: extract rules into `site/scripts/lib/lint-rules.mjs` shared module, import from both files. Logged as new backlog item #13.

**Follow-ups:**
- Loop 6: add automated drift-guard test for the score-updater (synthesize change proposals with known drift, verify the documented refusal procedure). Higher effort because score-updater is an agent, not a script — likely requires extracting the drift check into a callable Node helper first.
- Loop 7+: per meta-coordinator cadence (every 5 loops), trigger next meta review.

---

## Improvement Loop 4 — 2026-05-21 — Open Bionics Math-Hygiene Flag CLOSED as False Positive

**Trigger:** Meta-coordinator review after Loops 1–3 recommended pivoting away from May 21 recency-anchoring. Open Bionics math-hygiene flag had been "CRITICAL BLOCKING" for 18 cycles. Aging multiplier (+3) lifted Backlog #7 score 9 → 12 — highest remaining.

**Selected item:** Backlog #7 — Open Bionics math-hygiene formula audit (Priority Score 12 with aging multiplier).

**Selection rationale (per meta-coordinator recommendations applied to scoring):**
- Aging: 18 cycles open (max-tier aging penalty triggered).
- Breaks recency-anchor pattern (Loops 1–3 all targeted the same May 21 reviewer-language slip class on the same agent).
- Different defect class (math/correctness, not editorial polish).
- Different agent surface (benchmark-research methodology + overnight-assessor, not score-updater or overnight-digest).
- Highest learning value remaining.

**Agents involved:** coordinator (single-loop investigation + two-file agent doc fix).

**Investigation:**
- Read `research/change-proposals/open-bionics-2026-05-07.json` math_check section: assessor reconstructed composite as `((4.5 − 1) / 4) × 100 = 87.5` and compared against published 97.5, generating +10pt discrepancy flag.
- Pulled all 13 top-ranked robotics-labs entities' published composites and ran simple-mean reconstruction: pattern showed +8 to +10pt discrepancies across the entire top-tier cluster.
- Read `site/scripts/lib/scoring.mjs::computeCompositeFromDimensions` — discovered canonical formula adds `integrationPremium = 10 × consistencyMult × weaknessFactor` to baseComposite (up to +10pt for high-consistency, no-weak-dimension entities).
- Verified canonical formula reconstructs all 13 published composites to within 0.0pt: Open Bionics 97.5 = 87.5 baseComposite + 10.0 premium ✅. All 12 sibling entities identical pattern.

**ROOT CAUSE:** `.claude/agents/benchmark-research.md` line 338 documented the composite formula as "the unweighted mean of all 8 dimension scores (0-100 scale)" — omitting the integration premium term. Assessors following this guidance computed wrong reconstructions and flagged correct composites as math-hygiene issues. The defect was in **agent documentation**, not in data or code.

**Changes:**
- `.claude/agents/benchmark-research.md` — "Composite Score" section completely rewritten (~70 lines): full formula breakdown, integration premium derivation, consistencyMult thresholds, weaknessFactor formula, harm-flag override, worked example using Open Bionics, reconstruction pseudocode. References `site/scripts/lib/scoring.mjs` as single source of truth.
- `.claude/agents/overnight-assessor.md` — Step 3d/CALIBRATION block: added canonical formula reference, math-hygiene flag rule (only flag if canonical reconstruct disagrees by >0.5pt), explicit guidance that simple-mean reconstruction disagreements of 8–10pt for high-consistency entities are EXPECTED and must NOT be flagged.
- `research/PENDING_CHANGES.md` — New 2026-05-21 section formally CLOSES the math-hygiene flag for Open Bionics and 12 sibling robotics-labs entities with full root-cause explanation.

**Validation:**
- `node site/scripts/validate-indexes.mjs` (which already uses the canonical formula) emits ZERO formula warnings for any robotics-labs entity. Confirms data is correct.
- Sample reconstruction via canonical formula on ranks 1–13 of robotics-labs: all 13 match published composite within 0.0pt.

**Outcome:** 18-cycle "CRITICAL BLOCKING" false positive resolved at root. 13 robotics-labs entities cleared of math-hygiene flag. Two agent definitions updated with correct formula. Future assessor cycles will not regenerate this false positive.

**Health impact:**
| Metric | Before | After |
|---|---:|---:|
| Active blockers count | 3 | 2 (Open Bionics flag closed) |
| Methodology documentation accuracy | partial | complete (formula + premium + example + pseudocode) |
| Aging defect count | 1 (18 cycles) | 0 |

**Post-hoc Effort/Risk calibration (per Loop 4 rubric update):**
- Effort: predicted 3, actual 1. Investigation was fast (10 min) once root cause located; doc fix small. **Calibration signal: Effort was overstated.** Items that look hard often dissolve once root cause is found.
- Risk: predicted 2, actual 1. Pure agent-doc fix; no code paths or data touched.
- Backlog table updated to reflect actual scores.

**Learning to extract for the rubric:**
- "Long-standing flags" often turn out to be doc-defects, not data-defects. Future similar items should score Confidence higher (4 instead of 3) given Loop 4's experience.
- The aging multiplier worked exactly as intended: it lifted #7 from rank-6 (score 9) to rank-2 (score 12) and surfaced an embarrassing-to-have-missed false positive that had been sitting in CRITICAL BLOCKING status for 6 weeks of cycles.

**Follow-ups:**
- Loop 5 will not need meta-coordinator (per recommendation to move cadence to every-5 loops).
- Loop 5 candidate by score: #6 FORWARD_TRIGGERS.md (13) OR #11 test harness for pipeline agents (9, but addresses the 2/10 test-coverage red zone). Meta-coordinator named #11 explicitly. Choose #11 next.

---

## Improvement Loop 3 — 2026-05-21 — Build-Time PUBLIC DAILY JSON RULES Validator

**Trigger:** Continuation. Loops 1 + 2 strengthened the rules and the agent definitions; Loop 3 enforces them automatically at build time so the same slip class cannot recur silently.

**Selected item:** Backlog #3 — Build-time PUBLIC DAILY JSON RULES validator (Priority Score 14).

**Selection rationale:** Loop 2 produced an ad-hoc validator that took 30 lines and ran in milliseconds; formalizing it as a build step is the smallest possible change with the highest leverage (catches every future slip across 38+ historical files automatically). Closes the slip class permanently rather than relying on agent compliance.

**Agents involved:** coordinator (single-file create + one-line package.json edit).

**Changes:**
- `site/scripts/lint-daily-briefings.mjs` — Created. 240 lines. Scans every `site/src/data/updates/daily/*.json` and `latest.json` recursively. Enforces:
  - 22 forbidden phrases (case-insensitive substring match)
  - 9 forbidden status/actionType/cycleType values
  - 9 forbidden top-level pipeline keys
  - Empty `pendingReview` arrays
  - "(human review required)" parenthetical in any cycleType
- `site/package.json` — Wired into the build chain: `validate-indexes → lint-daily-briefings → build-manifest → next build`. Also added `lint:briefings` script for standalone runs.

**Validation:**
- Initial run on existing 38 daily JSONs surfaced 2 historical violations that the manual sanitization pass had missed:
  - `2026-04-18.json` `emergingRisks[3]`: "(currently flagged for review)" → corrected to "(active conduct watch)"
  - `2026-04-23.json` `sectorAlerts[4].alert`: "decision requires founder signoff" → reframed in observer voice
- Post-fix lint run: PASS — 38 daily JSON files clean.
- Full `npm run build`: PASS — lint step ran in build chain, 1,227 static pages prerendered cleanly, 0 errors, 0 warnings beyond validate-indexes baseline.

**Outcome:** Rule enforcement now automated. Loop 1 (drift guard at agent level) + Loop 2 (rule strengthening at agent level) + Loop 3 (rule enforcement at build level) form a complete defense-in-depth chain: agent rules → agent examples → build-time fail-loud.

**Health impact:**
| Metric | Before | After |
|---|---:|---:|
| Public-surface polish (reviewer language) | 8/10 | 9/10 — fully automated enforcement |
| Slip detection latency | manual coordinator catch (often post-publish) | <100ms at build time, fail-loud |
| Historical-file coverage | unknown | 38 of 38 verified clean |

**Methodological note:** Loop 3 also retroactively scrubbed two slips from the historical record. This is acceptable because the daily briefings are derived artifacts (not source-of-truth findings); the underlying assessment markdowns and change proposals retain the original internal coordination language. The rule applies only to the public surface.

**Follow-ups:**
- Loop 4 will trigger meta-coordinator review (3 loops complete) before continuing.

---

## Improvement Loop 2 — 2026-05-21 — PUBLIC DAILY JSON RULES Field-Shape Coverage

**Trigger:** Continuation of overnight improvement run. Loop 1 closed cleanly; selecting next-highest-scored item.

**Selected item:** Backlog #4 — Extend PUBLIC DAILY JSON RULES coverage to `boundaryWatch[].note`, `emergingRisks[].risk`, and `recentAssessments[].whyHeadline` field shapes (Priority Score 15).

**Selection rationale:** Same-day evidence — 4 reviewer phrases slipped past the rules in these specific field shapes in the May 21 cycle. Rules covered string content well but underspecified observer-voice vs. operator-voice distinctions for fields that schema-implicitly invite a "what to do next" tone. Highest remaining backlog item.

**Agents involved:** coordinator (targeted edit to one agent definition).

**Changes:**
- `.claude/agents/overnight-digest.md` — Added "PER-FIELD-SHAPE GUIDANCE" section after WHERE REVIEWER LANGUAGE IS ALLOWED block:
  - `boundaryWatch[].note` — Observer voice required with BAD/GOOD examples drawn from May 21 incident.
  - `emergingRisks[].risk` — Observer voice required with BAD/GOOD examples.
  - `recentAssessments[].whyHeadline` and `.status` — Extended observer-voice rule covering held / documented status transitions.
- `.claude/agents/overnight-digest.md` — Added status field standardization table mapping internal proposal states to public-surface status values (`applied`, `documented`, `band-crossing-finding`, `boundary-watch`, `methodology-evolution`, `floor-confirmed`). Explicitly forbade `held`, `pending-review`, `requires-review`, `flagged`, `escalated`.

**Validation:**
- Built ad-hoc Node validator scanning `site/src/data/updates/daily/2026-05-21.json` against expanded phrase + status forbidden-lists (Loop 2 spec).
- Result: PASS — 0 forbidden phrases / 0 forbidden status values.
- This confirms the strengthened rules are internally consistent with the polished post-sanitization state from this morning. A digest agent following the new rules would produce clean output natively.
- This validator becomes the seed for Loop 3 (build-time validator).

**Outcome:** Slip class from May 21 cycle is closed at the rule level. Future digest runs have explicit BAD/GOOD examples in the agent definition for the exact field shapes that have slipped before. Status taxonomy now explicit (8 permitted values, 5 explicitly forbidden).

**Health impact:**
| Metric | Before | After |
|---|---:|---:|
| Public-surface polish | 7/10 | 8/10 (rule strength); will hit 9 after Loop 3 validator lands |
| Slip-class coverage (boundaryWatch/emergingRisks) | partial | complete |

**Follow-ups (next loops):**
- Loop 3 candidate: Build-time validator script (Backlog #3, Score 14) — formalize the ad-hoc node script run during Loop 2 validation into `site/scripts/lint-daily-briefings.mjs` that runs as a prebuild step. Closes the loop: rules + automated enforcement.
- Loop 4 candidate: FORWARD_TRIGGERS.md calendar artifact (Backlog #6, Score 13).

---

## Improvement Loop 1 — 2026-05-21 — Stale-Baseline Drift Guard in score-updater

**Trigger:** Founder directive — "Complete an improvement loop overnight and continue to improve until no gaps exist." Same-day evidence: May 21 WIDE cycle produced 2 of 8 proposals held under stale-baseline conditions (US, Pakistan), detected only by ad-hoc coordinator pattern-matching.

**Loop discipline:** Single item selected from a 10-item backlog. Foundational artifacts (IMPROVEMENT_BACKLOG.md, SYSTEM_HEALTH.md) bootstrapped within this loop as scaffolding for future loops.

**Selected item:** Backlog #1 — Stale-baseline drift guard in score-updater (Priority Score 16).

**Selection rationale:** Highest scored item. Bit production in the same cycle. Strengthens all three Ledgerium priorities (determinism, traceability, correctness). Lowest-risk fix (purely additive guard).

**Agents involved:** coordinator (this loop — no specialist delegation needed; targeted edit to one agent definition).

**Changes:**
- `.claude/agents/score-updater.md` — Added Step 2b.5 "Verify Baseline Drift (MANDATORY GUARD)" between Step 2b (read index) and Step 2c (write scores). Includes acceptance thresholds (≤0.5 accept, ≤2.0 accept-with-warning, >2.0 refuse), Stale-Baseline Hold procedure (status="held-stale-baseline", hold_reason field, PENDING_CHANGES.md `## Stale-Baseline Holds` row), direction-inversion safety check, and worked examples from today's US/Pakistan holds.
- `.claude/agents/score-updater.md` — Added IMPORTANT RULES #9 and #10 (non-negotiable guard; hold reporting in Step 4 summary).
- `.claude/agents/score-updater.md` — Step 4 summary now requires explicit hold and warning sections.
- `research/IMPROVEMENT_BACKLOG.md` — Created. 10 ranked candidates with scoring rubric, evidence anchors, selection rationale.
- `research/SYSTEM_HEALTH.md` — Created. Baseline snapshot: pipeline health, artifact coverage, quality scores (0–10), active blockers, held proposals, readiness status, improvement targets.

**Validation:**
- Applied guard logic to all 8 May 21 proposals (mental simulation, schema verified against actual proposal files):
  - US: drift 29.5pt → REFUSE ✅ (matches today's outcome)
  - Pakistan: drift 5.5pt → REFUSE ✅ (matches today's outcome)
  - India: drift 0.3pt → ACCEPT ✅ (matches today's outcome)
  - Hungary, Mongolia, Croatia, Marshall Islands, Timor-Leste: drift ≤0.5 → ACCEPT ✅ (matches today's outcome)
- Field schema verified: `published_scores.composite` exists in May 21 proposal files (hungary, india, united-states confirmed).
- Zero false positives in retrospective validation.

**Outcome:** Stale-baseline guard documented in agent definition. Future score-updater invocations will catch the May 21-class incident automatically and produce a structured PENDING_CHANGES.md hold record. Detection metric on SYSTEM_HEALTH.md raised from 3 → 8.

**Health impact:**
| Metric | Before | After |
|---|---:|---:|
| Stale-baseline detection | 3/10 | 8/10 |
| Foundational artifact coverage | 7/9 | 9/9 |
| Determinism (cycle reproducibility) | 7/10 | 8/10 |

**Follow-ups (next loops):**
- Loop 2 candidate: Build-time PUBLIC DAILY JSON RULES validator (Backlog #3) OR field-shape rule extension (Backlog #4).
- Eventually: incremental score-file regeneration (Backlog #8) to reduce 1,144-file diffs to ~6.
- Eventually: Open Bionics math-hygiene formula audit (Backlog #7) — 18 cycles blocking.

---

## Loop — 2026-05-21 — WIDE Daily Research Cycle (Symmetric Scanner + First Formal Upgrades Ever Applied)

**Trigger:** Founder requested a "super deep and complete" cycle with symmetric good/bad evidence over the past 24 hours. Approved option (b) — 50-80 full assessments, symmetric scanner. Becomes the canonical positive-evidence test case for the methodology.

**Agents:** overnight-scanner (modified for symmetric coverage) → overnight-assessor (wide cycle, 49 entities) → overnight-digest → frontend-engineer (minor JSON sanitization)

**Cycle outputs:**
- **Scanner:** 1,155 entities scanned, **symmetric weighting** of positive + negative evidence. 50 priority + 5 rotation flagged. NEW field `compassionImprovementsDetected` (15 entities). UNGA ICJ Climate vote confirmed ADOPTED 141-8-28 — single event affects 19 entities.
- **Assessor (WIDE CYCLE):** 49 full assessments. **5 score changes proposed for application** (2 upgrades + 3 downgrades), **4 band crossings proposed** (2 upward + 1 downward + 1 held-at-boundary), 11 sub-threshold movements documented, 21 first-baselines established, 6 floor confirmations, 9 standard confirmations.
- **Digest:** `site/src/data/updates/daily/2026-05-21.json` — Hungary chosen as lead (first formal upward score change ever applied). Opening question frames structural-governance-reversal as methodology test.
- **Manifest:** May 21 prepended, `latest: "2026-05-21"`.
- **`site/src/data/updates/latest.json`:** copy of May 21 daily JSON.

**Score changes proposed for application to published index files (apply=true, NOT YET COMMITTED — pending editorial decision):**
| Entity | From → To | Δ | Direction | Trigger |
|---|---|---|---|---|
| **Hungary** | 41.4 → 47.7 | **+6.3** | UPGRADE | Magyar government in office; rule-of-law mandate |
| **Mongolia** | 48.4 → 54.7 | **+6.3** | UPGRADE | HRDs Law + UN HCHR commendation |
| **India** | 27.8 → 22.7 | **-5.1** | DOWNGRADE | Rohingya forced-sea non-refoulement violation |
| **United States** | 54.5 → 49.2 | **-5.3** | DOWNGRADE | UNGA ICJ Climate vote AGAINST + immigration escalation |
| **Croatia** | 48.4 → 40.6 | **-7.8** | DOWNGRADE | Liberties.eu "Dismantler" classification |

**Band crossings proposed (NOT YET COMMITTED):**
- **Marshall Islands UPWARD** 39.1 → 41.4 (Developing → Functional, UNGA Pacific cluster post-vote)
- **Timor-Leste UPWARD** 39.1 → 40.6 (Developing → Functional, ASEAN accession)
- **Pakistan DOWNWARD** 22.7 → 20.3 (Developing → Critical, floor-proximity drift)
- **Anthropic HELD-AT-BOUNDARY** 60.0 (Functional/Established, DC Circuit ruling pending — Cycle 2)

**PUBLIC DAILY JSON RULES validation:** PARTIAL PASS
- Digest agent slipped 4 reviewer-facing phrases into the public JSON (band-crossing notes + Pakistan emerging-risk title). Sanitized inline by coordinator before build.
- Recommend strengthening the agent's bias against the words "human review required" in `boundaryWatch[].note` and `emergingRisks[].risk` fields specifically — the rules cover `topSignals` well but underspecify how to phrase band-crossing notes.

**Methodological significance:**
- **First cycle in benchmark history with formal positive score upgrades** (Hungary +6.3, Mongolia +6.3). Symmetric-evaluation rule PASSED its canonical test.
- **5 formal changes in one cycle = 5x normal volume.** WIDE-cycle special case; do not normalize this rate.
- **21 first-baselines** is a benchmark single-cycle record; countries index completeness accelerating toward 207-country target.
- **UNGA ICJ Climate vote ADOPTED** is the widest single-event scoring footprint in benchmark history (19 entities affected).

**Build:** 1,227 static pages prerendered, 0 errors. /updates/2026-05-21 + / both render cleanly with Hungary lead.

**Pending decisions (NOT executed by coordinator; require explicit founder approval):**
1. Run score-updater on 5 apply=true proposals (Hungary, Mongolia, India, US, Croatia) to update published index JSON files
2. Decision on Marshall Islands + Timor-Leste upward band crossings
3. Decision on Pakistan downward band crossing
4. Anthropic exact-60.0 Cycle 2 hold — continue or apply forward-event-triggered protocol
5. Palestine RS/INDEX reconciliation enters Cycle 3 (carry-forward)

**Outcome:** WIDE-CYCLE briefing layer complete and pushed. Index files NOT YET updated — those changes pending editorial approval via score-updater agent.

**Follow-ups (non-blocking):**
- Strengthen PUBLIC DAILY JSON RULES coverage of boundaryWatch and emergingRisks note fields
- May 27 Hungary EU funds reform-plan submission (canonical second-cycle enacted-evidence test)
- DC Circuit ruling watch (Anthropic)
- xAI first-baseline at 11.7 Critical — watch for regulatory enforcement outcomes
- Open Bionics math-hygiene formula audit (Cycle 18 — CRITICAL BLOCKING)

---

## Loop — 2026-05-20 — Daily Research Cycle (First Cycle on PUBLIC DAILY JSON RULES; High Event Density)

**Trigger:** Nightly research pipeline for 2026-05-20. First cycle exercising the new PUBLIC DAILY JSON RULES added to `overnight-digest.md` in commit d04e0bd. Goal: validate that the digest agent produces polished, reviewer-language-free public daily JSON natively, without post-hoc sanitization.

**Agents:** overnight-scanner → overnight-assessor → overnight-digest → frontend-engineer (homepage defensive shim only)

**Cycle outputs:**
- Scanner: 1,160 entities scanned; 15 priority + 5 rotation flagged. Top priorities Vanuatu (UNGA ICJ vote pending) / China (Xi-Putin Multipolar World declaration) / Meta (7,900 layoffs + MCI surveillance) / Microsoft (Israel GM fired over Azure/Unit 8200) / Amazon (Troutdale OR worker death cover-up)
- Assessor: 20 assessments → 0 score changes applied, 4 sub-threshold movements documented (Microsoft -2.8, Amazon -3.7, Turkey -1.9, OpenAI -1.7), 1 band-crossing-proposed (Anthropic at exact 60.0 Functional/Established boundary pending DC Circuit ruling), 3 floor-state confirmations (Russia, Israel, Sudan), 2 new methodology category candidates (Meta: `surveillance-of-labor-during-pre-notice-period`; Amazon: `worker-death-non-disclosure-with-continue-working-directive`)
- Digest: `site/src/data/updates/daily/2026-05-20.json` — Anthropic chosen as lead signal (most methodologically novel — first proposed upward band crossing driven by adversity-maintained institutional integrity rather than direct conduct improvement). Opening question frames the Anthropic case as a methodology test: does institutional refusal under sustained pressure constitute independently scoreable compassion-capacity evidence?
- Manifest: `site/src/data/updates/manifest.json` — `latest: "2026-05-20"`, May 20 prepended to date list
- `site/src/data/updates/latest.json` — copy of May 20 daily JSON for home page

**Score changes applied to index files:** None this cycle. All deltas sub-threshold or held pending forward signal.

**Pending editorial decisions (internal, not on public surface):**
- Anthropic band-crossing-proposed — awaiting DC Circuit ruling within weeks; favorable ruling = +3-5 composite + Established band crossing
- Palestine — RS/INDEX reconciliation enters Cycle 2; carried forward from May 19 (internal coordination only; no reviewer language in public JSON)

**PUBLIC DAILY JSON RULES validation:** PASS
- Zero "human review" / "founder decision" / "review queue" / forbidden-status / forbidden-actionType / forbidden-pipeline-key strings in `site/src/data/updates/daily/2026-05-20.json`
- Digest agent produced clean output natively — no `sanitize-daily-briefings.mjs` run required
- Confirms the rules section added in d04e0bd is working as designed

**Build issue (fixed):**
- `npm run build` failed on `/` prerender with `TypeError: Cannot read properties of undefined (reading 'length')` because the home page reads legacy fields (`updates.highlights`, `updates.pipeline.proposalsGenerated`) that the new daily-briefing schema dropped.
- **Fix:** Added defensive compat shim at the top of `site/src/app/page.tsx` — `highlightsArr` falls back to `topSignals.slice(0,3).map(s=>s.title)`; `pipelineProposalsCount` falls back to `pipeline.scoreChanges` or `scoreChangesArr.length`; all `pipeline.*` reads use optional chaining with explicit defaults.
- Rebuild: clean. 1226 static pages, 0 TS errors, /updates/2026-05-20 + / both prerendered successfully.

**Hygiene findings (non-blocking):**
- UNGA ICJ Climate resolution vote outcome not indexed at scan time — Pacific cluster (Vanuatu, Marshall Islands, Micronesia, Timor-Leste) mandatory reassessment May 21
- Microsoft/Amazon assessed-delta inversion (Microsoft -2.8 closer to apply threshold than Amazon -3.7 despite weaker evidence) — documented as expected behavior; reflects different baselines + offsetting ACC/INT positives

**Boundary watch (post-cycle):**
- Anthropic 60.0 (exact Functional/Established boundary, 0.0pt distance, upward band-crossing-proposed)
- General Motors 40.6 (+0.6 above Developing/Functional)
- China 19.5 (+0.5 above absolute Critical floor)
- Marshall Islands 39.1 (-0.9 below Functional, vote outcome pending)
- Timor-Leste 39.1 (-0.9 below Functional)

**Forward triggers (mandatory reassessment windows):**
- 2026-05-21 — Pacific cluster post-UNGA vote evaluation
- DC Circuit ruling on Pentagon Anthropic exclusion (weeks)
- Microsoft Azure/Unit 8200 investigation findings publication
- Meta 7-month no-layoffs consistency test (Dec 2026)

**Outcome:** PASS. End-to-end cycle complete on PUBLIC DAILY JSON RULES. Public surface is polished, finalized, trustworthy. Build clean, 1226 pages prerendered, home page + /updates landing + /updates/2026-05-20 all render without reviewer-facing language.

**Follow-ups (non-blocking):**
- May 21 Pacific cluster post-vote reassessment
- DC Circuit ruling watch for Anthropic band crossing
- Two new methodology categories (`surveillance-of-labor-during-pre-notice-period`, `worker-death-non-disclosure-with-continue-working-directive`) enter v1.3 candidate set

---

## Loop — 2026-05-19 — Daily Research Cycle (Pre-Event Consolidation; First Cycle on New Briefing Schema)

**Trigger:** Nightly research pipeline for 2026-05-19. First cycle exercising the new daily-briefing schema (`dailyOpeningQuestion` + 5 ScoreMovementCard enrichment fields) end-to-end through Scanner → Assessor → Digest → Build.

**Agents:** overnight-scanner → overnight-assessor → overnight-digest → frontend-engineer (build fix only)

**Cycle outputs:**
- Scanner: 1,160 entities scanned; top priorities Vanuatu / GM / Marshall Islands / China / Meta Platforms
- Assessor: 21 assessments → 17 confirmations, 5 floor-conduct documentations, 6 first-baselines, 8 sub-threshold movements documented, 6 RS-vs-INDEX baseline mismatches reconciled, 1 new methodology candidate (`scripted-video-termination`, GM)
- Digest: `site/src/data/updates/daily/2026-05-19.json` — populated `dailyOpeningQuestion` (sharp methodology question on GM scripted-video-termination, 4 entities, Q3 2026 resolution) + 21 enriched assessments (21/21 `whyHeadline`, 20/21 `primaryEvidenceUrl`, 8/21 `dominantDimension`, 5/21 `distanceToBoundary`, 8/21 `nextForwardSignal`)
- Manifest: `site/src/data/updates/manifest.json` — `latest: "2026-05-19"`, May 19 prepended to date list

**Score changes applied to index files:** None this cycle. All deltas sub-threshold or held for human review.

**Human review queued (founder decision required before commit):**
- Palestine — RS=20.0 (Critical-floor designated) vs INDEX=25.0 (Developing). 5.0pt categorical band gap. Interpretation A propagates floor (Developing → Critical band crossing); Interpretation B corrects RS to 25.0. Logged in `research/PENDING_CHANGES.md → 2026-05-19 → HUMAN REVIEW REQUIRED`.

**Build issue (fixed):**
- `npm run build` failed on `/updates/2026-05-19` prerender with "Event handlers cannot be passed to Client Component props" because the `primaryEvidenceUrl` `<a>` tag in `ScoreMovementCard.tsx` (lines 252-259) had an `onClick` stub left as a TODO by frontend-engineer. May 19 is the first daily JSON to populate `primaryEvidenceUrl`, so this was the first build to exercise the field.
- **Fix:** Removed the `onClick` stub entirely. Per FRONTEND_PLAN_UPDATES_2026-05-19.md guidance ("If NOT reusable in <30 minutes: skip step 6 entirely. Do not block the redesign on instrumentation."), trackEvent wiring is deferred to a later cycle.
- Rebuild: clean. 1224 static pages, 0 TS errors, /updates/2026-05-19 prerendered successfully.

**Hygiene findings (non-blocking; recommend dedicated sweep next cycle):**
- 6 RS-vs-INDEX baseline mismatches reconciled in a single cycle: Hungary (37.5→41.4 categorical Developing→Functional), UnitedHealth Group (16.9→11.4, 5.5pt NOT flagged by scanner), Vanuatu (33.9→35.9), and 3 others. Scanner mismatch-detection scope gap confirmed.
- Open Bionics math-hygiene formula: 16 cycles CRITICAL BLOCKING.

**Boundary watch (post-cycle):** Hungary 41.4 (+0.4 above Functional), GM 40.6 (+0.6 above Functional, first-baseline), Oracle 20.6 (+0.6 above Developing), Marshall Islands 39.1 (-1.9 below Functional), Timor-Leste 39.1 (-1.9 below Functional), China 19.5 (+0.5 above absolute Critical floor).

**Forward triggers (mandatory reassessment windows):**
- 2026-05-20 — UNGA climate resolution vote (Pacific cluster mandatory reassessment May 21)
- 2026-05-27 — Hungary EPPO reform plan publication
- 2026-05-31 — Hungary legislative deadline
- Xi-Putin summit outcome (China watch)
- Meta Platforms 8,000-layoff execution (May 20)

**Outcome:** PASS. End-to-end cycle complete on new briefing schema. Daily JSON published, manifest updated, build clean, PENDING_CHANGES.md updated with Palestine human review. One follow-up: hygiene sweep + scanner mismatch-detection scope expansion.

**Follow-ups (non-blocking):**
- Schedule hygiene sweep for next cycle (6 baseline corrections in one cycle is anomalous)
- Expand scanner mismatch-detection scope to catch UnitedHealth-class drift
- Founder decision on Palestine interpretation (A vs B) before next cycle commits
- Wire `updates.score_movement_card.evidence_click` analytics event when trackEvent helper is refactored

---

## Loop — 2026-05-19 — /updates Page Redesign (Best-in-Class Daily Briefing)

**Trigger:** Founder directive — reorder /updates per a new section sequence (Opening Question + Today's Analysis near top; Score Change Detail after Signal Stack; Score Movements / Evidence Ledger / Sector Findings / Risk Signals in that order toward bottom); replace closing diagnostic question with a daily opening question grounded in tonight's evidence; enrich Score Movement cards so they earn elevated position; improve evidence-with-links.

**Agents:** ux-designer, market-research, competitive-researcher, product-manager, growth-strategist, analytics (all parallel reviews) → frontend-engineer (implementation) → qa-engineer (validation) → product-manager (digest agent contract update)

**Reviews produced (all in research/):**
- UX_REVIEW_UPDATES_2026-05-19.md — canonical 17-section wireframe, opening question example using May 19 evidence
- MARKET_REVIEW_UPDATES_2026-05-19.md — Freedom House / TI / EIU / ACLED / RSF / RepRisk patterns; three transferable practices
- COMPETITIVE_REVIEW_UPDATES_2026-05-19.md — Axios "Why it matters" / Semafor "Room for Disagreement" / Bloomberg per-entity / Stratechery framing patterns
- PM_REVIEW_UPDATES_2026-05-19.md — opening question schema (6 fields) + ScoreMovementCard P0/P1/P2 tiers; positioning recommendation
- GROWTH_REVIEW_UPDATES_2026-05-19.md — conversion implications, SubscribeCTA placement, A/B test definition
- ANALYTICS_REVIEW_UPDATES_2026-05-19.md — 10 events to instrument, 8-panel dashboard, decision rule for promoting Score Movements
- FRONTEND_PLAN_UPDATES_2026-05-19.md — 5-step implementation sequence, 5 founder questions
- QA_REPORT_UPDATES_2026-05-19.md — PASS verdict; all 6 audit areas clean

**What changed:**
- `site/src/components/updates/DailyBriefing.tsx` — section JSX reordered into canonical 17-position sequence
- `site/src/components/updates/briefing/OpeningQuestion.tsx` — NEW; renders `updates.dailyOpeningQuestion.{text,themes,tensionFraming,tiedToEntities,forwardResolutionDate}` at page position 2; returns null if absent (no fallback rotation)
- `site/src/components/updates/briefing/TodaysAnalysisSection.tsx` — NEW; extracted from inline HighlightsSection; supports Axios "Why it matters" structure when digest provides `whyItMatters`/`relevance` fields
- `site/src/components/updates/briefing/ScoreMovementCard.tsx` — 5 optional enrichment fields added: `whyHeadline`, `dominantDimension`, `primaryEvidenceUrl`, `distanceToBoundary`, `nextForwardSignal`; all guarded for older briefings
- `site/src/components/updates/briefing/ScoreMovementDashboard.tsx` — merge logic propagates enrichment fields
- `site/src/components/updates/TrackedEntityLink.tsx` — `"openingQuestion"` added to source union
- `site/src/components/updates/briefing/DailyQuestion.tsx` — retained on disk for one-cycle rollback window; import removed from DailyBriefing.tsx
- `.claude/agents/overnight-digest.md` — appended "STRUCTURED OUTPUT FIELDS — UPDATES PAGE CONTRACT" block instructing the digest to populate `dailyOpeningQuestion` (top-level) and the 5 per-assessment enrichment fields; all optional, all backward-compatible

**Scope:**
- 2 new files, 4 modified files, 0 deleted files (DailyQuestion preserved)
- 17-section canonical order, validated against May 18 and April 2026 archives
- Build clean (Next.js 16 Turbopack, 1224 static pages)

**Validation:**
- `npm run build` clean — 0 TypeScript errors, all 1224 pages generated
- April 2026 archives render with no opening question and no enriched fields (degrades silently)
- May 18 page renders all new sections in correct order
- Click-target separation in ScoreMovementCard verified (TrackedEntityLink entity name vs. external primaryEvidenceUrl link)
- Fragment anchors preserved: `#highlights`, `#emerging-risks`, `#score-movements`; `#score-changes-detail` is data-conditional (only renders when scoreChanges array non-empty)

**Outcome:** PASS. The /updates page now matches the founder-mandated canonical order with backward-compatible enrichment for future digests. The May 19+ overnight-digest will populate the new fields automatically per the updated agent definition.

**Follow-ups (non-blocking):**
- Wire `updates.score_movement_card.evidence_click` analytics event when trackEvent helper is refactored for client-component reuse
- Add section impression events (`updates.section.view`) when Intersection Observer client-wrapper architecture is established
- Consider deleting `DailyQuestion.tsx` after 2026-05-26 if no rollback needed

---

## Loop — 2026-04-20 — Methodology v1.1 H1 (Integration Premium Cap)

**Trigger:** Determinism fix earlier today exposed the +20 integration premium was too aggressive. Seven entities (Target, Germany, Amsterdam, Munich, Massachusetts, Washington, Hugging Face) computed to 100 despite documented gaps (Target DEI rollback most visible). Bundled with determinism release to prevent an awkward "Target = 100" production window.

**Agents:** backend-engineer

**What changed:**
- `site/src/lib/scoring.ts` — integration premium constant changed from `20` to `10` in both `calcScores()` and `computeCompositeFromDimensions()`
- Mirrored to `site/scripts/test-scoring.mjs`, `site/scripts/recompute-composites.mjs`, `site/scripts/validate-indexes.mjs`
- `site/scripts/test-scoring.mjs` — 44 test expected values updated to reflect new formula; all 44 pass
- All 7 index JSONs recomputed with new cap

**Scope:**
- 90 entities adjusted by |Δ| ≥ 0.5
- 16 band transitions — all Exemplary → Established
- No entity now reaches exactly 100 (requires all-5 dim scores, which no entity has)

**Notable changes:**
- Target 100 → 92.8 (still Exemplary, but evidence-defensible within band)
- Germany 100 → 95.9
- Hugging Face 100 → 95.9
- Amsterdam / Massachusetts / Washington 100 → 94.4
- Munich 99.7 → 89.7 (Exemplary → Established)
- 11 F500 entities dropped from 89.4 → 81.4

**Validation:**
- `validate-indexes.mjs`: 12,750 checks, 0 errors, 117 warnings
- `test-scoring.mjs`: 44/44 pass
- Idempotent

**Outcome:** Integration premium is now bounded at +10, preventing uniform-high-dim profiles from auto-maxing to 100. Combined with today's determinism fix, Methodology v1.1 provides a principled, reproducible scoring layer.

**Remaining Tier H candidates (deferred to future loops):**
- H2 — Evidence-of-excellence gate (require documented dim=5 rationale for full premium)
- H3 — Qualitative override layer (allow documented regressions like Target DEI rollback to trigger visible named adjustments)
- H4 — Harm floor escalation (treat dim=1 as partial harm signal)

---

## Loop — 2026-04-20 — Methodology Determinism Fix

**Trigger:** Improvement loop selection. 2026-04-19 assessor flagged "four confirmed cases of display-layer floor clamping" (Haiti, South Sudan, Russia, North Korea). Investigation revealed the issue was systemic: all 1,155 stored composites had drifted from the canonical formula in `site/src/lib/scoring.ts`.

**Agents:** backend-engineer

**What changed:**
- Added `computeCompositeFromDimensions()` to `site/src/lib/scoring.ts` (pure function operating on 8 dim scores)
- New `site/scripts/recompute-composites.mjs` — recomputes every composite from dim scores as source of truth; dry-run + `--apply` modes; re-ranks each index deterministically
- Updated `site/scripts/validate-indexes.mjs` check #10 to enforce full-formula composite correctness (tolerance 2.0 for errors, 1.0 for warnings, downgraded to warning for assessor-override entities)
- Applied recomputation across all 7 index JSONs

**Scope:**
- 871 of 1,155 entities had material changes (|Δ| ≥ 0.5)
- 206 band changes
- 14 entities protected (Batch 4 + Batch 5 assessor-approved scores)

**Notable results:**
- Floor-clamp fix: Haiti, Libya, Somalia, CAR moved from 0.0 → 4.7
- South Sudan / North Korea / Russia remained at 0.0 (dim scores genuinely all 1 — formula-correct)
- 206 entities dropped exactly −3.0 (formula correctly removes integration premium when 6+ dims < 4.0)
- Top upward moves exposed a separate issue: integration premium too aggressive at top. Target (documented DEI rollback) computes to 100; Germany, Amsterdam, Munich, Massachusetts also hit 100.

**Validation:**
- `validate-indexes.mjs`: 12,750 checks passed, 0 errors, 117 warnings (all expected band-boundary cases)
- `test-scoring.mjs`: 44/44 tests passed
- Idempotency confirmed (second run produces 0 changes)

**Outcome:** System is now deterministic — stored composite = formula(dim scores) for all 1,155 entities, enforced by validator going forward. This is a core product claim ("evidence-based, reproducible scoring") finally backed by the data layer.

**Follow-up queued:** Methodology v1.1 — cap integration premium. See IMPROVEMENT_BACKLOG_2026-04-18.md (added as new tier D item).

---

## Batch 5 — 2026-04-20

**Applied by:** Score-updater agent (founder approval)
**Indexes affected:** fortune-500.json, countries.json
**Entities updated:** 8

### Changes

| Entity | Index | Old Score | New Score | Delta | Band Change | New Rank |
|--------|-------|-----------|-----------|-------|-------------|----------|
| State Street | fortune-500 | 92.5 | 60.2 | -32.3 | Exemplary → Functional | 76 |
| Abbott Laboratories | fortune-500 | 87.4 | 57.8 | -29.6 | Exemplary → Functional | 82 |
| Microsoft | fortune-500 | 87.8 | 66.4 | -21.4 | Exemplary → Established | 34 |
| Nucor | fortune-500 | 87.4 | 66.4 | -21.0 | Exemplary → Established | 35 |
| Ecolab | fortune-500 | 87.4 | 68.8 | -18.6 | Exemplary → Established | 32 |
| Walt Disney | fortune-500 | 60.8 | 52.2 | -8.6 | Established → Functional | 90 |
| Pfizer | fortune-500 | 65.5 | 57.8 | -7.7 | Established → Functional | 83 |
| Saudi Arabia | countries | 4.4 | 9.4 | +5.0 | No change (Critical) | 158 |

### Notes

- **State Street:** Two-band downgrade (Exemplary → Functional). F500 rank falls from #1 to #76. Published uniform 4.5 dimension profile confirmed as reputational baseline artifact. Core drivers: 900 AI-efficiency layoffs in Q2 2025, further 20–30% Global Delivery cuts projected, $7.5M Connecticut AG settlement for inflated fees, TCFD/SASB endorsement rolled back under political pressure. Genuine SYS strength (Sustainability Stewardship Service) preserved at 68.8.
- **Abbott Laboratories:** Two-band downgrade (Exemplary → Functional). Rank falls from #4 to #82. 782 NEC cases pending in MDL 3026, $495M + $70M verdicts. Company continues to deny NEC-formula link despite verdicts. 2022 Similac powder formula recall (Salmonella, Cronobacter). Medical device innovation (FreeStyle Libre) anchors SYS at 68.8.
- **Microsoft:** One-band downgrade (Exemplary → Established). Rank falls from #3 to #34. 11,000–22,000 planned layoffs (January 2026), February 2026 RTO mandate, removal of DEI from performance criteria, no diversity report published. Responsible AI Transparency Report and accessibility product leadership (Xbox Adaptive Controller, Seeing AI) anchor Established band.
- **Nucor:** One-band downgrade (Exemplary → Established). Rank falls from #9 to #35. No-layoff policy and EAF steel sustainability remain genuine strengths (SYS 75.0). Contractor fatalities 2023–2024 indicate oversight gap. F500 DEI disclosure decline applies.
- **Ecolab:** One-band downgrade (Exemplary → Established). Rank falls from #6 to #32. Strongest of five first-time baselines (SYS 81.3 Exemplary-dimension). PFAS phase-out commitment, 2030 Positive Impact framework, Water.org partnership are genuine. DEI disclosure decline applies; EQU 62.5 reflects published raw 3.5.
- **Walt Disney:** Band change Established → Functional. April 14, 2026 layoffs of ~1,000 employees with explicit AI-efficiency CEO rationale. Severance above sector median prevents Critical drop. Orlando UNITE HERE contract and Disneyland wage settlement provide structural EMP floor.
- **Pfizer:** Band change Established → Functional. Led 2026 US drug price increases (80 products). Washington State drug-pricing law. Patient-assistance infrastructure (RxPathways, PAP Connect) prevents deeper downgrade.
- **Saudi Arabia:** Floor-clamping methodology correction. Delta +5.0 is NOT a substantive improvement — execution record is worsening (356 executions in 2025, second consecutive record). INT score set to 1.0 (0.0 scaled) reflecting no independent oversight of detention practices. Founder accepted low-confidence flag.

### Hold Item

- UnitedHealth Group: Q1 2026 earnings call April 21 under returned CEO Hemsley. Proposed +0.4 preview confirm direction. HELD — do not apply until transcript reviewed.

### F500 Meta Changes (post-Batch 5)

- Exemplary band: 14 → 9 entities (-5)
- Established band: 63 → 65 entities (+2)
- Functional band: 105 → 108 entities (+3)
- Mean score: 38.8 → 38.5
- Median score: 33.9 (unchanged)

---

## Batch 4 — 2026-04-19

**Applied by:** Score-updater agent (founder approval)
**Indexes affected:** countries.json, fortune-500.json, ai-labs.json
**Entities updated:** 6

### Changes

| Entity | Index | Old Score | New Score | Delta | Band Change | New Rank |
|--------|-------|-----------|-----------|-------|-------------|----------|
| Venezuela | countries | 4.4 | 18.0 | +13.6 | No (Critical) | 139 |
| Alphabet/Google | fortune-500 | 42.2 | 40.6 | -1.6 | Yes: Functional → Developing | 183 |
| Anthropic | ai-labs | 68.8 | 62.2 | -6.6 | No (Established) | 14 |
| Character AI | ai-labs | 30.8 | 23.8 | -7.0 | No (Developing) | 44 |
| GEO Group | fortune-500 | 7.5 | 6.6 | -0.9 | No (Critical) | 447 |
| Core Civic | fortune-500 | 7.5 | 7.0 | -0.5 | No (Critical) | 446 |

### Notes

- Venezuela: Regime-change reset. First 100-day transitional baseline under Acting President Rodríguez. HRW/WOLA caution weighting applied. Band crossover to Developing (20.0) is 2.0 points away. Follow-up scheduled no later than June 2026.
- Alphabet/Google: Sub-threshold delta (-1.6) but crosses Functional/Developing boundary at 41.0. Founder confirmed band-boundary interpretation. AdX structural remedy proceedings still pending — next assessment is high priority when ruling lands.
- Anthropic: New-spec 14-day window result. RSP rollback (Apr 7) + Illinois SB 3261 filing (Apr 17) + Pentagon litigation (Apr 8 appeals ruling). Supersedes old-spec +1.5 confirm from same date. Remains highest-scoring frontier AI lab at 62.2 Established.
- Character AI: Score correction post-January 2026 Google settlement. Pre-settlement EMP/SYS/INT scores were more generous than the Garcia case record supports.
- GEO Group / Core Civic: First-time baseline corrections (no formal proposal files). Assessed composite refined from initial 7.5 placeholder. GEO Group Adelanto trial April 30 is next binary event.

### Hold Item

- UnitedHealth Group: Proposed confirm +1.0 (10.9 → 11.9). HELD pending April 21 earnings call review.

---

## Batch 3 — 2026-04-18

**Indexes affected:** fortune-500.json, countries.json, ai-labs.json, us-cities.json
**Entities updated:** 6 (Target, Meta Platforms, Ford Motor, Iran, New York City, OpenAI)

---

## Batch 2 — 2026-04-17

**Indexes affected:** fortune-500.json, countries.json, ai-labs.json
**Entities updated:** 4 (CVS Health, United States, OpenAI, Amazon)

---

## Batch 1 — 2026-04-15 / 2026-04-16

**Indexes affected:** ai-labs.json, fortune-500.json, countries.json
**Entities updated:** 9 (OpenAI, xAI/Grok, Johnson & Johnson, Israel, Mistral AI, Anthropic, Rwanda, Alphabet/Google, UnitedHealth Group, Walmart)

---

## Batch 6 — 2026-04-21

**Applied by:** Score-updater agent (founder approval)
**Indexes affected:** ai-labs.json
**Entities updated:** 2

### Changes

| Entity | Index | Old Score | New Score | Delta | Band Change | New Rank |
|--------|-------|-----------|-----------|-------|-------------|----------|
| Meta AI | ai-labs | 40.6 | 29.4 | -11.2 | Yes: Functional → Developing | 43 |
| OpenAI | ai-labs | 38.8 | 31.3 | -7.5 | No (Developing stays) | 42 |

### Notes

- **Meta AI:** First full reassessment as a distinct ai-labs entry. Published 40.6 Functional pre-dates the 2026 verdict cluster. Proposed 29.4 Developing reflects three convergent child-harm legal findings: Massachusetts SJC Commonwealth v. Meta Platforms (Apr 10, in-window anchor) holding Section 230 does not shield Instagram design features — court found design "capitalizes on developmental vulnerabilities of children"; New Mexico $375M civil verdict (Mar 24, 2026) for consumer-protection violations tied to child safety; Los Angeles $3M negligence verdict (Mar 25, 2026) with Meta 70% responsible for social-media addiction harm. Design-features-as-harm theory now validated by a state supreme court. High confidence. Band change Functional → Developing. Rank falls from #29 to #43.
- **OpenAI:** Evidence-based downgrade anchored on Illinois SB 3444 backing (Apr 10–17, 2026 coverage) — OpenAI actively supports liability shield exempting AI firms from mass-casualty responsibility (>100 deaths, >$1B damage, CBRN events); described by experts as "markedly weak approach to corporate liability." Musk v. OpenAI fraud trial begins Apr 27 in Oakland (jury selection); trial record itself weakens INT/I4 values-alignment regardless of outcome. Perplexity class action (Apr 1) adds B5 consent concern re: user chat data shared with Google/Meta. Medium confidence; upgrade to high if SB 3444 advances Apr 24 Illinois committee vote with OpenAI support. Stays Developing band. Rank falls from #30 to #42 (ties with Anduril and C3.ai at 31.3; ordered alphabetically).

### ai-labs Meta Changes (post-Batch 6)

- Functional band: 15 → 14 entities (−1; Meta AI exits Functional)
- Developing band: 18 → 19 entities (+1; Meta AI enters Developing; OpenAI stays Developing)
- Mean score: 45.4 → 45.0
- Median score: 47.7 (unchanged)

### Validation

- `validate-indexes.mjs`: 12,751 checks, 0 errors, 116 warnings (1 fewer than prior run — Meta AI composite delta eliminated)
- `test-scoring.mjs`: 44/44 pass

---

## Batch 7 — 2026-04-22

**Applied by:** Pending founder review (10 proposals generated; none applied yet)
**Indexes affected:** ai-labs.json, fortune-500.json, countries.json
**Entities assessed:** 19 (1 deferred: South Sudan)
**First-time baselines:** 6 (IBM, Palantir AI, Scale AI, Waymo, Norway, New Zealand)

### Proposals Pending Review

| Entity | Index | Old Score | Proposed Score | Delta | Band Change | Confidence |
|--------|-------|-----------|----------------|-------|-------------|------------|
| Anthropic | ai-labs | 90.9 | 61.6 | -29.3 | Yes: Exemplary → Established | Medium |
| Amazon | fortune-500 | 21.6 | 17.8 | -3.8 | Yes: Developing → Critical | High |
| IBM | fortune-500 | 62.5 | 51.3 | -11.2 | Yes: Established → Functional | High |
| Interpublic Group | fortune-500 | 53.0 | 40.0 | -13.0 | Yes: Functional → Developing | Medium |
| New Zealand | countries | 92.5 | 78.4 | -14.1 | Yes: Exemplary → Established | Medium |
| Norway | countries | 100.0 | 84.7 | -15.3 | No (Exemplary stays) | High |
| Palantir AI | ai-labs | 19.9 | 12.8 | -7.1 | No (Critical stays) | High |
| DRC | countries | 10.9 | 4.4 | -6.5 | No (Critical stays) | Medium |
| Deere & Company | fortune-500 | 56.2 | 48.1 | -8.1 | No (Functional stays) | Medium |
| Macy's | fortune-500 | 53.0 | 41.3 | -11.7 | No (Functional stays) | Medium |

### Confirmations (9)

| Entity | Index | Published | Assessed | Delta |
|--------|-------|-----------|----------|-------|
| OpenAI | ai-labs | 31.3 | 28.8 | -2.5 |
| Meta AI | ai-labs | 29.4 | 26.9 | -2.5 |
| xAI/Grok | ai-labs | 2.2 | 2.2 | 0.0 |
| Scale AI | ai-labs | 33.9 | 30.0 | -3.9 |
| Waymo | ai-labs | 48.4 | 46.3 | -2.1 |
| UnitedHealth Group | fortune-500 | 10.9 | 13.1 | +2.2 |
| United States | countries | 25.0 | 22.5 | -2.5 |
| Sudan | countries | 0.0 | 0.0 | 0.0 |
| Israel | countries | 8.8 | 7.8 | -1.0 |

### Deferred (1)

- **South Sudan:** UNMISS mandate vote pending before April 30. Re-queue immediately after Security Council vote result.

### Key Notes

- **Anthropic delta is primarily a calculation artifact.** Published 90.9 includes integration premium ~+27 exceeding v1.1 H1 cap of +10. Canonical formula score ~63.4. Genuine event-driven delta is approximately −2 (INT regression on Ballard Partners hire). Requires two separate founder decisions at review.
- **Amazon band crossing Developing → Critical** is the most reputationally significant finding for a rank-2 F500 entity. High confidence.
- **IBM first baseline** is the first DOJ FCA settlement under the Civil Rights Fraud Initiative — operationalizes the DEI enforcement theory effective April 25.
- **F500 Gen-2 artifact confirmed for 4th consecutive night** across IBM (3.5×8), Deere (near-uniform 3.5), Macy's (3.0×8), Interpublic (3.0×8). Pattern spans 11 entities. Formal batch re-scoring recommended.
- **Norway perfect-100 ceiling** is a methodology artifact — recommend empirical ceiling of ~95 across all indexes.
- **Interpublic Group entity-existence issue:** IPG acquired by Omnicom November 26, 2025; F500 index still carries as standalone. Founder decision required: remove, merge, or annotate.
- **Record 10 proposals in a single run.** Prior record was 8 (Batch 5, April 20).

---

## Batch 8 — 2026-04-23

**Applied by:** Digest agent (awaiting founder approval — all proposals pending)
**Indexes affected:** fortune-500.json (3 proposals), ai-labs.json (4 proposals), countries.json (3 proposals)
**Entities assessed:** 13 (9 proposals, 6 confirmations, 1 existence-flag, 2 deferrals)
**Proposals generated:** 9

### Proposals Pending Founder Review

| Entity | Index | Published | Proposed | Delta | Band Change |
|--------|-------|-----------|----------|-------|-------------|
| TIAA | fortune-500 | 97.5 | 58.6 | -38.9 | Exemplary → Functional |
| Masimo Corporation | fortune-500 | 81.4 | 48.4 | -33.0 | Exemplary → Functional |
| Fannie Mae | fortune-500 | 62.5 | 31.6 | -30.9 | Established → Developing |
| DeepMind/Google | ai-labs | 81.4 | 65.0 | -16.4 | Exemplary → Established |
| Germany | countries | 95.9 | 72.8 | -23.1 | Exemplary → Established |
| Netherlands | countries | 95.9 | 74.4 | -21.5 | Exemplary → Established |
| Singapore | countries | 74.3 | 62.2 | -12.1 | No (Established maintained) |
| Palantir AI | ai-labs | 19.9 | 10.3 | -9.6 | No (Critical maintained) |
| OpenAI | ai-labs | 31.3 | 27.5 | -3.8 | No (Developing maintained) |

### Notes

- **TIAA:** Largest composite delta in F500 pipeline history at −38.9. Published 97.5 is a 4.5×8 Gen-2 artifact at rank 1. Forensic anchor case for the F500 index. SEC enforcement (2021 $97M), active AARP-Foundation-backed ERISA class action, and multi-year whistleblower pattern. Mission is genuinely long-horizon (SYS 68.8 assessed). This is a methodology-disclosure event: the top-ranked F500 entity is proposed to move from Exemplary to Functional.
- **Masimo Corporation:** Published 81.4 is a 4×7+3.5×1 Gen-2 cluster shared by 8 entities at ranks 10-17. Second forensic anchor. Dual DOJ (Feb 2024) and SEC (March 2024) subpoenas, 16-employee whistleblower lawsuit, CEO undisclosed stock-pledge. Invalidates the entire cluster as a reliable score profile.
- **Fannie Mae:** First full baseline and Gen-2 correction combined. Published 62.5 is a 3.5×8 artifact. Real-world event (700 mass firings with ethnic concentration, congressional inquiry, Westfall Act immunity defense) establishes this as not purely a methodology correction.
- **DeepMind/Google:** First full baseline. Cross-index Gen-2 discovery — 81.4 profile in ai-labs is identical to F500 Masimo cluster. This is the first confirmed instance of Gen-2 batched scoring crossing indexes. Medium confidence; AlphaFold and FSF are genuine Exemplary-tier work.
- **Germany / Netherlands:** Countries-index top-rank ceiling artifact confirmed. Follows Norway correction (April 22). Three of top-10 countries corrected in two nights. Both proposals are partially artifact, partially real policy regression.
- **Singapore:** First baseline. UN High Commissioner formal moratorium call (April 22) is the in-window anchor. No band change; Established maintained.
- **Palantir AI:** 22-point manifesto is self-declared values-divergence — the rarest evidence type in the index. No audit required; entity stated its values publicly. Score drops to 10.3 Critical.
- **OpenAI:** Brockman diary ("it was a lie") is Tier-5 founder-contemporaneous evidence cited in federal court. INT drops 25.0 → 17.5. Trial starts April 27; reassess weekly through May 25.
- **Anthropic:** Held at 61.6 day-of-vote. Post-vote reassessment mandatory April 24.
- **Interpublic Group:** Entity-existence flag only. Omnicom acquisition completed November 26, 2025. No score proposal. Requires founder decision: archive vs. merge with Omnicom.

### Methodology Artifacts Surfaced

1. F500 Gen-2 forensic audit confirmed over 5 consecutive nights: estimated 46+ entities in 4 distinct uniform-score clusters. TIAA and Masimo as forensic anchors invalidate the 97.5 and 81.4 clusters respectively.
2. Cross-index Gen-2 spread confirmed: DeepMind/Google ai-labs profile is identical to F500 Masimo cluster.
3. Countries-index top-rank ceiling artifact: Germany, Netherlands, Norway all corrected; ranks 1-10 audit recommended.
4. Tier-5 evidence precedent (OpenAI/Brockman): founder-contemporaneous documentation cited in federal court is now formally in the index evidence record.
5. Self-declared values-divergence precedent (Palantir): corporate manifesto as primary evidence of I1-I4 misalignment.

---

## Batch 9 — 2026-04-24

**Applied by:** Digest agent (awaiting founder approval — all proposals pending)
**Indexes affected:** fortune-500.json (1 proposal), countries.json (2 proposals), us-states.json (2 proposals), ai-labs.json (1 proposal)
**Entities assessed:** 13 (6 proposals, 7 confirmations including DRC reaffirmation and South Sudan deferral)
**Proposals generated:** 6
**Deferrals:** 1 (South Sudan — UNMISS vote pending before April 30)

### Proposals Pending Founder Review

| Entity | Index | Published | Proposed | Delta | Band Change | Confidence |
|--------|-------|-----------|----------|-------|-------------|------------|
| Becton Dickinson | fortune-500 | 81.4 | 54.1 | -27.3 | Yes: Exemplary → Functional | High |
| Luxembourg | countries | 97.5 | 81.3 | -16.2 | No (Exemplary maintained) | Medium |
| Iceland | countries | 100.0 | 87.5 | -12.5 | No (Exemplary maintained) | High |
| Minnesota | us-states | 95.9 | 84.4 | -11.5 | No (Exemplary maintained) | Medium |
| Vermont | us-states | 97.5 | 87.5 | -10.0 | No (Exemplary maintained) | Medium |
| Hugging Face | ai-labs | 95.9 | 88.1 | -7.8 | No (Exemplary maintained) | High |

### Confirmations (7)

| Entity | Index | Published | Assessed | Delta | Basis |
|--------|-------|-----------|----------|-------|-------|
| Anthropic | ai-labs | 61.6 | 61.6 | 0.0 | Illinois SB 3261 vote deferred to May 15 |
| OpenAI | ai-labs | 27.5 | 27.5 | 0.0 | Illinois SB 3444 vote deferred to May 15 |
| xAI/Grok | ai-labs | 2.2 | 2.2 | 0.0 | Critical floor; new financial-fraud dimension noted |
| DRC | countries | 4.4 | 4.4 | 0.0 | Reaffirmation — live score matches proposed |
| South Sudan | countries | 0.0 | 0.0 | — | Deferred: UNMISS vote not yet held |
| Myanmar | countries | 0.0 | 3.1 | +3.1 | April 23 confirmation stands; earthquake date flag |
| Meta AI | ai-labs | 29.4 | 27.8 | -1.6 | EU GDPR fine within threshold |

### Key Notes

- **Becton Dickinson:** Third Gen-2 forensic anchor in two nights. $20M cancer verdict for ethylene oxide exposure; 402 pending cases; residential-adjacent industrial harm. Dual-trigger: methodology artifact + independent real-world harm evidence. The 81.4 cluster (8 entities, ranks 10-17) is now fully invalidated by three independent anchors.
- **US-States ceiling artifact (first surface):** Vermont and Minnesota are the first us-states first-baselines, and both immediately exhibit the ceiling-artifact pattern. Third index confirmed with systematic uniform-score inflation at the top of the rank distribution. Ranks 3-10 audit recommended before next index build.
- **Countries ceiling Night 4:** Luxembourg and Iceland extend the streak to five corrections across three nights. Five of the top 10 countries by published score have received evidence-based corrections; Denmark, Sweden, and Finland are unassessed T2 candidates.
- **Illinois vote deferral:** SB 3261 and SB 3444 both moved to May 15 via Rule 2-10. Both Anthropic (61.6, 1.6pts above Established/Functional boundary) and OpenAI (27.5) held — correct protocol application. Next mandatory reassessment: May 15.
- **DRC reaffirmation:** Assessor change-proposal from stale 10.9 baseline produced proposed 4.4 matching live score exactly. Classified as reaffirmation, not new change. Fresh evidence (M23 immunity demand, 500K+ displaced, UN Security Council emergency session) re-grounds the April 22 correction.
- **xAI/Grok floor limitation:** New financial-fraud dimension (Musk Paris non-appearance; SEC/DOJ IPO manipulation alert) documented but cannot be expressed at the 2.2 index floor. Floor-escalation methodology (Tier H4) prioritized for next index build.
- **Hugging Face:** Rotation audit correction within Exemplary band (95.9 → 88.1). Not a governance failure finding. Remains highest-scoring ai-labs entity by evidence-based assessment. INT rises to 95.0 on honest governance disclosure — counter-intuitive but methodology-correct.
- **F500 Gen-2 sprint:** Six consecutive nights without coordinated sprint. Six entities remain in the invalidated 81.4 cluster. Sprint recommendation is now overdue.

### Methodology Artifacts Surfaced

1. US-States ceiling artifact: first documented case. Vermont (rank 1, 97.5) and Minnesota (rank 2, 95.9) both carry uniform-score ceiling profiles as first baselines.
2. Third-index pattern confirmed: fortune-500, countries, and us-states all exhibit systematic uniform-score inflation at the top of rank distributions.
3. Index-floor limitation documented: xAI/Grok (2.2) evidence cluster has expanded to 9+ documented regulatory/criminal actions but the composite cannot decrease further. Tier H4 floor-escalation should be prioritized.
4. Pipeline integrity case: DRC stale-baseline change proposal correctly classified as reaffirmation when proposed score matches live score.

---

## Batch 10 — 2026-04-25

**Applied by:** Digest agent (awaiting founder approval — all proposals pending)
**Indexes affected:** fortune-500.json (4 proposals), countries.json (3 proposals)
**Entities assessed:** 11 (7 proposals, 3 confirmations: OpenAI, xAI/Grok, DRC)
**Proposals generated:** 7
**Deferrals:** 1 (South Sudan — third consecutive deferral; UNMISS mandate expires April 30)

### Proposals Pending Founder Review

| Entity | Index | Published | Proposed | Delta | Band Change | Confidence |
|--------|-------|-----------|----------|-------|-------------|------------|
| Danaher | fortune-500 | 81.4 | 54.7 | -26.7 | Yes: Exemplary → Functional | High |
| General Mills | fortune-500 | 81.4 | 53.1 | -28.3 | Yes: Exemplary → Functional | High |
| Eli Lilly | fortune-500 | 81.4 | 56.3 | -25.1 | Yes: Exemplary → Functional | High |
| Booz Allen Hamilton | fortune-500 | 48.4 | 36.7 | -11.7 | Yes: Functional → Developing | High |
| Denmark | countries | 100.0 | 81.3 | -18.7 | No (Exemplary maintained) | High |
| Sweden | countries | 97.2 | 81.3 | -15.9 | No (Exemplary maintained) | Medium |
| Finland | countries | 100.0 | 84.4 | -15.6 | No (Exemplary maintained) | Medium |

### Confirmations (3)

| Entity | Index | Published | Assessed | Delta | Basis |
|--------|-------|-----------|----------|-------|-------|
| OpenAI | ai-labs | 27.5 | 27.5 | 0.0 | Musk dropped fraud claims April 25; case narrowed; score held pre-trial |
| xAI/Grok | ai-labs | 2.2 | 2.2 | 0.0 | Critical floor; SpaceX S-1 IPO filing documents Grok risk to SEC investors (Tier-4 evidence upgrade); floor limits expression |
| DRC | countries | 4.4 | 4.4 | 0.0 | Re-confirmed; M23 immunity demand, 500K+ displaced, no resolution signal |

### Key Notes

- **F500 Night-7 Triple Anchor (Danaher, General Mills, Eli Lilly):** First time three forensic anchors assessed in a single pipeline run. The 4×7+3.5×1=81.4 cluster at F500 ranks 10-17 now has six confirmed forensic anchors. Mean correction across six anchors: approximately -29.9 points. Three remain: Cummins, US Bancorp, American Express.
- **Danaher:** $172.5M D.D.C. shareholder settlement (April 22-23, 2026) — largest D.D.C. securities settlement since 1996. INT 37.5 — executive misleading-statements pattern. SYS 62.5 retained on genuine life-sciences diagnostics infrastructure.
- **General Mills:** Dual-trigger — WARN Act violation (163 workers, St. Charles MO, 60-day notice failure) + Davis racial-harassment class action survived dismissal April 22 ('Good Ole Boy network' characterization by federal judge). EMP 50.0, EQU 43.8 — lowest equity score in Night-7 batch.
- **Eli Lilly:** SCOTUS petition No. 25-1126 to eliminate FCA qui tam whistleblower mechanism. Second application of Palantir-2026-04-23 values-divergence precedent — first pharmaceutical company. ACC 37.5, INT 43.8. SYS/ACT 68.8 retained on therapeutic-access mission.
- **Booz Allen Hamilton:** First pipeline capture. Treasury cancelled all 31 contracts ($21M) January 26, 2026 over Littlejohn IRS breach (406K taxpayers affected). Maryland federal court refused to dismiss class action April 2026. INT 12.5 — lowest on record for a federal consulting entity. Band change Functional → Developing. April 25 is the DEI EO 14398 effective date; sector-wide accountability context now in force.
- **Nordic ceiling sweep complete:** Denmark (-18.7, ECJ ghetto-law ruling + March 2026 visa ban), Sweden (-15.9, April 17 'honest living' Aliens Act proposal + abolition of permanent residence permits), Finland (-15.6, April 16 deportation-enforcement + pre-emptive entry-ban legislation + Border Security Act extension). Eight of the top 10 countries corrected in five nights. Mean correction: approximately -17.4 points. Only New Zealand remains in top-10 cluster.
- **OpenAI:** Musk dropped fraud claims April 25, hours before April 27 trial. Case narrowed to unjust enrichment + breach of charitable trust. Score held at 27.5; breach-of-charitable-trust claim is harder but more institutionally damaging. Reassess weekly.
- **xAI/Grok:** SpaceX S-1 IPO filing (April 1, reported April 23) formally documents Grok regulatory risk to SEC investors — Tier-3-to-Tier-4 evidence quality upgrade. Composite at 2.2 floor cannot express this. Floor-escalation Tier H4 is materially overdue.
- **South Sudan:** Third consecutive deferral. UNMISS mandate expires April 30 in five days. This is now the most time-sensitive deferred item in the pipeline.

### Methodology Artifacts Surfaced

1. F500 81.4 cluster invalidation complete (6 of 9 entities assessed): mean correction -29.9 points; dimension variance confirms the cluster masked distinct failure modes — information integrity (Danaher), constitutional attack on accountability (Eli Lilly), dual worker/equity failure (General Mills).
2. Nordic ceiling sweep closed (8 of 10 top countries corrected): the EQU dimension is the most consistently depressed across all eight corrections, with a modal bottom-dimension value of 68.8.
3. Palantir values-divergence precedent applied to second entity (Eli Lilly): affirmative legal action to dismantle accountability infrastructure is INT/ACC evidence regardless of outcome. Precedent now spans sectors (AI labs → Pharmaceuticals).
4. Federal-contractor rotation gap confirmed: Booz Allen Hamilton ($7B+ federal revenue, public Littlejohn event, Treasury contract cancellation) was not in rotation queue prior to this capture. Rotation methodology must enforce a federal-contractor revenue threshold as a standing T1 priority.
5. Floor-escalation methodology (Tier H4) is now 7+ days overdue from the perspective of the xAI/Grok evidence cluster. The SEC S-1 disclosure adds a regulated-filing evidence tier that the current composite floor cannot reflect.

---

## Batch 11 — 2026-04-26

**Applied by:** Digest agent (awaiting founder approval — all proposals pending)
**Indexes affected:** fortune-500.json (3 proposals), countries.json (2 proposals)
**Entities assessed:** 12 (5 proposals, 7 confirmations: Palantir AI, OpenAI, xAI/Grok, Sudan, Israel, DRC, Anthropic)
**Proposals generated:** 5
**Deferrals:** 2 (South Sudan — fourth consecutive deferral; UNMISS mandate expires April 30 — 4 days; Interpublic Group — entity-existence decision pending)

### Proposals Pending Founder Review

| Entity | Index | Published | Proposed | Delta | Band Change | Confidence |
|--------|-------|-----------|----------|-------|-------------|------------|
| Cummins | fortune-500 | 81.4 | 53.1 | -28.3 | Yes: Exemplary → Functional | High |
| American Express | fortune-500 | 81.4 | 55.5 | -25.9 | Yes: Exemplary → Functional | High |
| U.S. Bancorp | fortune-500 | 81.4 | 54.7 | -26.7 | Yes: Exemplary → Functional | High |
| New Zealand | countries | 78.4 | 70.3 | -8.1 | No (Established maintained) | Medium |
| Norway | countries | 84.7 | 78.1 | -6.6 | Yes: Exemplary → Established | Medium |

### Confirmations (7)

| Entity | Index | Published | Assessed | Delta | Basis |
|--------|-------|-----------|----------|-------|-------|
| Palantir AI | ai-labs | 10.3 | 10.3 | 0.0 | EFF Apr 25 + congressional non-response Apr 24 are INT/ACC upgrades; held at Critical-band floor |
| OpenAI | ai-labs | 27.5 | 27.5 | 0.0 | Pre-trial hold; jury selection April 27; proceedings out of window |
| xAI/Grok | ai-labs | 2.2 | 2.2 | 0.0 | Critical floor; fourth consecutive night with floor limitation |
| Sudan | countries | 0 | 0 | 0.0 | RSF Al-Jabalain Hospital drone attack + OHCHR/ACHPR-AU warning + 16%-funded appeal; evidence upgrades only |
| Israel | countries | 8.8 | 8.8 | 0.0 | Gaza closures since Feb 28 + 2,400+ ceasefire violations; delta below 5pt threshold |
| DRC | countries | 4.4 | 4.4 | 0.0 | Apr 18 humanitarian statement offset by Apr 25 continued South Kivu fighting; net delta < 5pt |
| Anthropic | ai-labs | 61.6 | 61.6 | 0.0 | Pentagon appeals denial Apr 8 + NSA/Mythos paradox Apr 20; DC Circuit May hearing is next inflection |

### Key Notes

- **F500 Gen-2 Sprint Complete:** All 8 entities in the uniform 4x7+3.5x1=81.4 cluster have been forensically corrected across Nights 1-8. Tonight's three completers close the sprint.
- **Cummins:** $1.675B EPA Clean Air Act civil penalty (Jan 2024) — largest in CAA history, second-largest environmental penalty in U.S. history. Deliberate defeat-device software across ~1M diesel trucks (2013-2023). INT 31.3 — the lowest in the Gen-2 forensic anchor series. BND 37.5 on highway-corridor NOx population-level harm. April 16 Green v. Cummins sex-discrimination suit survives dismissal. SYS/ACT 62.5 retained on genuine Accelera/Destination Zero zero-emission pivot.
- **American Express:** $230M combined DOJ civil + criminal NPA settlement (Jan 2025) for 2014-2017 deceptive small-business credit card marketing — dummy EINs ('123456788'), falsified income, unauthorized credit checks, inaccurate tax advice. Active $17.5M antitrust settlement (claim deadline April 29, in-window). 200 employees fired (self-remediation). INT 50.0; ACC 43.8.
- **U.S. Bancorp:** $37.5M CFPB sham-accounts settlement (Jul 2022); CFPB found "over a decade" of organizational awareness. Wells Fargo-pattern violation. CEO Andy Cecere in active shareholder derivative suit (2026). April 2026 cash-sweep litigation is secondary ongoing BND concern. INT/ACC 43.8. Sprint closure: the eighth and final 81.4-cluster forensic anchor.
- **Norway (second-pass):** NOT a ceiling-sweep correction. Norway was corrected from 100 to 84.7 on April 22 (Generation-1 ceiling artifact). Tonight's -6.6 reflects new in-window governance regression: March 27 formal TCP ban for Ukrainian men 18-60 (effective May 5) + late-April welfare-cut consultation. First entity in countries index to receive two distinct correction types in a single sprint. Band changes Exemplary to Established.
- **New Zealand (first baseline):** NOT a top-10 ceiling correction. NZ is rank 16, Established band (78.4). April 19-20 Cabinet decision to reduce Treaty of Waitangi clauses across ~28 laws from 'give effect to' to 'take into account'. Waitangi Tribunal October 2025 found review process likely breaches Treaty principles. EQU 56.3 — lowest for any Established-band country in the sprint. Band held Established.
- **Floor-limitation cluster:** Five entities (xAI/Grok, Sudan, South Sudan, Israel, Palantir AI) had evidence upgrades that cannot be expressed downward. Largest single-night floor-limitation cluster in pipeline history. Tier H4 methodology is now critically overdue — fourth consecutive night.
- **South Sudan:** Fourth consecutive deferral. UNMISS mandate expires April 30 in 4 days. April 26 'on the brink' report and April 22 civil-war reignition coverage are sustained crisis evidence. Night 9 deferral is not viable; resolution required.

### Methodology Artifacts Surfaced

1. **F500 81.4 cluster invalidation complete (all 8 entities):** Nine total forensic anchors (including TIAA as the first at a different cluster) across eight nights. Mean correction across the eight 81.4-cluster entities: approximately -28.7 points. The cluster is confirmed as a methodology artifact. INT differentiation (range 31.3-50.0 across all 8) demonstrates the pipeline's ability to surface distinct failure modes behind uniform published scores.
2. **Second-pass correction category established (Norway):** The pipeline can now produce two distinct correction types on the same entity in sequence — methodology-artifact correction (April 22) followed by evidence-regression correction (April 26). The record must distinguish these clearly; both must be preserved in the change-proposal archive.
3. **Floor-limitation cluster at five simultaneous entities:** The largest single-night floor-limited cluster in the pipeline's history. Tier H4 must be scheduled as the next methodology loop item. The Critical band currently cannot differentiate institutional severity across a 0.0-10.3 range.
4. **New Zealand Treaty dimension — EQU at 56.3 for Established band:** The lowest EQU score for any Established-band country in the current sprint. Established-band entities can carry deeply depressed single dimensions (particularly EQU) if the broader institutional substrate remains strong. The composite (70.3) stays above the 60.0 Functional boundary; the dimension (56.3) is below the Functional boundary. This is expected and correct behavior under the scoring formula.
5. **Two-cycle (Nights 7-8) cumulative summary:** 12 score changes totaling approximately -213.5 composite-points. Mean correction per proposal: approximately -17.8 points. F500 Gen-2 cluster and countries ceiling sprint are both closed as of this batch.

---

## Batch 12 — 2026-04-27

**Applied by:** Digest agent (awaiting founder approval — all proposals pending)
**Indexes affected:** countries.json (1 proposal), us-states.json (1 proposal), us-cities.json (1 proposal), ai-labs.json (1 calibration proposal)
**Entities assessed:** 20 (4 proposals, 15 confirmations: OpenAI, Anthropic, xAI/Grok, Sudan, Israel, Germany, Canada, Ireland, US, DRC, Austria, Estonia, Taiwan, Hawaii, Massachusetts)
**Proposals generated:** 4
**Deferrals:** 1 (South Sudan — FIFTH consecutive deferral; UNMISS mandate expires April 30 — 3 days; HARD DEADLINE)

### Proposals Pending Founder Review

| Entity | Index | Published | Proposed | Delta | Band Change | Confidence |
|--------|-------|-----------|----------|-------|-------------|------------|
| Netherlands | countries | 74.4 | 65.6 | -8.8 | No (Established maintained) | High |
| Texas | us-states | 20.3 | 14.1 | -6.2 | Yes: Developing → Critical | High |
| Houston | us-cities | 43.8 | 35.2 | -8.6 | Yes: Functional → Developing | High |
| Palantir AI | ai-labs | 10.3 | 6.6 | -3.7 | No (Critical maintained) | Medium |

### Confirmations (15)

| Entity | Index | Published | Assessed | Delta | Basis |
|--------|-------|-----------|----------|-------|-------|
| OpenAI | ai-labs | 27.5 | 27.5 | 0.0 | Trial Day 1 jury selection only; PBC Foundation retains CONTROL via board+veto despite 26% equity |
| Anthropic | ai-labs | 61.6 | 61.6 | 0.0 | NSA Mythos confirmation = INT mitigation; CEO WH meeting; DoD deal "possible" |
| xAI/Grok | ai-labs | 2.2 | 2.2 | 0.0 | Floor-limited; FIFTH consecutive night |
| Sudan | countries | 0 | 0 | 0.0 | Floor-limited; UN "abandoned crisis" + Amnesty 2026 quasi-judicial finding |
| Israel | countries | 8.8 | 8.8 | 0.0 | Floor-limited; Amnesty 2026 genocide+apartheid finding; 60+ day Gaza aid blockade |
| Germany | countries | 72.8 | 72.8 | 0.0 | Live composite already reflects mixed profile; rotation-state drift flagged |
| Canada | countries | 84.6 | 84.6 | 0.0 | Indigenous Health Equity Fund + Housing Strategy + reconciliation gap; rotation-state drift flagged |
| Ireland | countries | 84.6 | 84.6 | 0.0 | IPA 2026 signed Apr 23 — net-neutral mixed signal; rotation-state drift flagged |
| United States | countries | 25 | 25 | 0.0 | EO 14398 began Apr 24 + Houston cascade + Amnesty protest repression; rotation-state drift flagged |
| DRC | countries | 4.4 | 4.4 | 0.0 | Amnesty M23 finding offset by Apr 18 COVM ceasefire mechanism |
| Austria | countries | 83.0 | 83.0 | 0.0 | T3 rotation; deportation hub participation; low confidence |
| Estonia | countries | 83.0 | 83.0 | 0.0 | T3 rotation; digital governance leadership; low confidence |
| Taiwan | countries | 83.0 | 83.0 | 0.0 | T3 rotation; democracy under PRC pressure; low confidence |
| Hawaii | us-states | 95.9 | 95.9 | 0.0 | T3 rotation; rank 1 US States after April 24 Vermont correction |
| Massachusetts | us-states | 94.4 | 94.4 | 0.0 | T3 rotation; salary transparency law; rank 4 US States |

### Key Notes

- **Three index-level firsts in one night:** Netherlands (countries first evidence baseline), Texas (us-states first individual assessment), Houston (us-cities first individual assessment). Most diverse single-night first-baseline output to date.
- **Netherlands:** Dutch Senate two-tier asylum system passed April 21 — A-status (persecution) vs B-status (war/climate); B-status holders denied family reunification 2 years, restricted to legal spouses + minor biological children. April 25 Loosdrecht: government cut intake 110→70 yielding to violent anti-asylum protests. April 10 ECOSOC vote elected Iran to UN human rights body. EQU drops most sharply (-12.5); INT (-13.7); ACC (-12.5); BND (-12.5). Composite 65.6, lower-middle Established. Implementation timed June 12 to coincide with EU Pact on Migration.
- **Texas:** April 24 5th Circuit vacated SB4 preliminary injunction (Las Americas v. Texas, plaintiffs lacked standing) — state-level parallel deportation system activated. April 22 Houston ordinance gut under Abbott $110M+ coercion. Texas holds 18,734 ICE detainees (>2× any other state); hosts nation's largest ICE detention facility (El Paso Camp East Montana, 2,505/day FY26). NPR April 3: ICE detention deaths at record pace, "one Texas facility bears the brunt." EQU/ACC/INT cross to Critical-band positioning (6.3 each). BAND CHANGE Developing → Critical. Calibration vs Florida (18.4 Critical) — Texas has more severe profile.
- **Houston:** 14-day reversal of sanctuary ordinance under state fiscal coercion. Apr 8: Council passes 12-5 with judicial-warrant protection language. Apr 13: Abbott threatens $110M public safety grant withdrawal. Apr 22: Same Council reverses 13-4, gutting the ordinance. Mayor Whitmire flipped from supporter to architect of repeal. ACC drops sharply (-18.7) — city's accountability infrastructure cannot withstand state coercion. INT drops (-12.5) — Whitmire integrity flip. BAND CHANGE Functional → Developing.
- **Palantir AI calibration:** April 24 Intercept (American Oversight FOIA) reveals $130M IRS Lead and Case Analytics contract since 2018. LCA aggregates tax returns + ACA data + bank statements + "all available" FinCEN data + dark-web crypto wallet data. Qualitatively distinct scope expansion from immigration to general-population financial surveillance. Below standard 5-pt threshold but submitted as calibration — floor-limitation methodology gap is 5+ nights overdue. BND/INT/EQU/ACC/AWR/ACT to floor; SYS holds 12.5 on continued operational deployment. Composite 6.6 places Palantir lower in Critical band.
- **OpenAI trial:** Trial Day 1 (April 27) procedural-only. Two claims survive: unjust enrichment + breach of charitable trust. CRITICAL evidence-base correction: October 2025 PBC restructuring kept OpenAI Foundation in CONTROL via board appointments and safety-veto rights despite holding only 26% equity (~$130B). Press "nonprofit loses controlling stake" framing conflates equity-minority with control-minority. Composite 27.5 holds. Mandatory post-remedy re-queue (1-2 weeks).
- **South Sudan FIFTH deferral:** UNMISS mandate expires April 30 (3 days). USUN explanation-of-vote page returns Technical Difficulties; press.un.org has no April 2026 renewal release. CANNOT BE DEFERRED BEYOND APRIL 30. Tomorrow's scanner must attempt direct retrieval with explicit fallback to human review.
- **US federal/state/local immigration enforcement cascade — first co-incident capture:** Federal (Palantir IRS scope expansion, EO 14398 Apr 24) + State (Texas SB4 5th Circuit Apr 24) + Local (Houston ordinance gut Apr 22). Pattern likely to recur in other Texas cities (Austin, San Antonio, Dallas) and other state-level deportation laws (Florida 287(g), Georgia HB 1105).
- **European asylum rights rollback sprint — 8 countries documented:** Netherlands joins Norway, Sweden, Finland, Denmark, Ireland, Austria, Germany. All implementations align with EU Pact on Migration June 12 entry-into-force. Rollback crosses center-right and center-left coalitions — institutional, not partisan.
- **Pending-cycle volume:** 12 proposals from Apr 25 + Apr 26 + 4 proposals tonight = 16 pending proposals collectively across 3 nights. Live indexes diverge from assessment outputs by a growing margin.

### Methodology Artifacts Surfaced

1. **First simultaneous capture across countries + us-states + us-cities + ai-labs:** Pipeline can now produce coordinated multi-index baselines that document cross-level structural patterns (federal/state/local enforcement cascade) in a single night. Prior multi-index nights surfaced independent events; tonight's four captures share an analytical thread.
2. **Calibration-proposal category formalized:** Sub-5-pt deltas can be submitted as "calibration proposals" when (a) qualitatively distinct evidence emerges that the prior assessment did not anchor against, (b) floor-limitation methodology gap is overdue, and (c) the entity is at the upper edge of expressive band-band scoring. Palantir AI is the first formal calibration proposal. This category documents the gap between methodology rigor and practical responsiveness while the floor-limitation framework is being developed.
3. **Floor-limitation methodology gap — 5+ nights overdue, severity escalated to HIGH:** Five entities (xAI 2.2, Palantir 10.3 → 6.6, Sudan 0, South Sudan 0, Israel 8.8) accumulating new evidence without expressive composite movement. Tonight's Palantir calibration is a partial response — does NOT address xAI/Sudan/South Sudan/Israel. Tier H4 IMPROVEMENT_BACKLOG item graduated to critical priority.
4. **Rotation-state vs live-index drift — pipeline integrity issue:** 8+ entities show drift (Netherlands, Germany, Canada, Ireland, US, OpenAI, Palantir, Texas). Six of eight are NOT in pending batches, meaning the drift is independent of pending-cycle isolation. Recommend dedicated reconciliation pass after all pending cycles applied.
5. **South Sudan UNMISS gate — severity escalated to CRITICAL:** Hard deadline April 30 (3 days). Five consecutive deferrals. If vote terms still unavailable tomorrow, escalate to direct human review.
6. **Three-cycle pending volume:** 16 score changes pending application across Apr 25 + Apr 26 + Apr 27 = approximately -157 composite-points pending. Mean per proposal: approximately -9.8 points (lower than prior batch mean because tonight's first-baseline corrections are smaller than F500 Gen-2 forensic anchors).

---

## Batch 13 — 2026-04-28

**Applied by:** Digest agent (no score changes — zero proposals generated)
**Indexes affected:** None
**Entities assessed:** 19 (18 confirmations + 1 deferral; 1 error-skip: Oracle)
**Proposals generated:** 0
**Deferrals:** 1 (South Sudan — SIXTH consecutive deferral; HARD DEADLINE BREACHED)

### Pipeline Summary

| Stage | Count |
|-------|-------|
| Entities scanned | 1,155 |
| Entities assessed | 19 |
| Proposals generated | 0 |
| Confirmations | 18 |
| T1 priority | 10 |
| T2 sector watch | 4 |
| T3 rotation | 5 |
| Deferrals | 1 |
| Errors (index gap) | 1 |

### Zero-Proposals Significance

Tonight is the first zero-proposal night in the pipeline's history. This reflects three simultaneous phenomena:

1. **Genuine stability** for Anthropic, DeepMind, Booz Allen Hamilton, Eli Lilly, and the five T3 rotation entities.
2. **Floor-limitation boundary effects** for xAI (2.2), Palantir (6.6), Sudan (0), and Israel (8.8) — all four have new material negative evidence in the April 14-28 window that the methodology cannot express downward.
3. **Pending-cycle isolation** — with 16 proposals pending application from April 25-27, several baselines are stale; confirmations tonight are anchored against live indexes, but scanner rotation-state continues to diverge.

The zero-proposal count does not indicate that the institutional landscape is uniformly stable. It indicates that (a) the April 14-28 evidence window did not produce new events crossing the 5-point composite threshold for any entity at the live baseline, and (b) the floor-limitation cluster is growing, not shrinking.

### Key Findings

- **DeepMind Frontier Safety Framework v3** (April 17): Tracked Capability Levels, new Critical Capability Level for harmful manipulation, internal-deployment safety case requirements. Most significant positive governance event of the night. Pre-EU AI Act positioning 96 days before enforcement.
- **Anthropic DC Circuit filing** (April 22, 96 pages): Explicitly defends Claude classified-network non-manipulability; maintains refusal of mass domestic surveillance and autonomous weapons use. Strongest positive INT/ACC signal from any AI lab in the April cycle.
- **AI-labor cascade**: Oracle 30K (March 31, pre-window, index gap), Meta 8K (April 23), Microsoft 8,750 voluntary buyouts (April 23) — approximately 47K in 30 days. All cite AI spending reallocation. Microsoft voluntariness modifier gap identified for EMP dimension.
- **Musk v. OpenAI trial Day 2** (April 28): opening arguments delivered; two claims survive (unjust enrichment, breach of charitable trust); liability phase to May 21; post-remedy mandatory re-queue.
- **Oracle index gap**: T2 priority with material layoff evidence; not in live F500 index; cannot process.

### Methodology Flags

1. **floor_limitation_methodology_gap** — CRITICAL (escalated from HIGH). 7 nights overdue. Five entities: xAI 2.2, Palantir 6.6, Sudan 0, South Sudan 0, Israel 8.8. Three options documented: (a) permanent-floor designation framework, (b) cumulative-evidence-tier weighting, (c) sub-score harm-scale qualifier. Recommend dedicated methodology development cycle within 7 days.

2. **south_sudan_unmiss_hard_deadline_breach** — CRITICAL. Sixth consecutive deferral. UNMISS mandate expires April 30 (T-2 days). Vote not retrievable in public sources. 2025 cycle precedent (Res 2778 technical rollover April 30, Res 2779 May 8) is most likely scenario but unconfirmed. Floor-limitation means any vote outcome requires methodology-note registration rather than composite change. Human review mandatory.

3. **rotation_state_drift** — HIGH. Microsoft (user-provided 76.8 vs live 66.4) and Masimo (rotation-state 76.4 vs live 48.4) confirmed tonight on live data. Drift will widen further until 16-proposal backlog is applied and reconciliation pass run.

4. **oracle_index_gap** — MEDIUM. Oracle not in live fortune-500 index. March 31 30K-layoff event is one of the most severe labor events in the F500 pool this cycle and cannot be processed. Recommend index reconciliation.

### South Sudan Escalation

HARD DEADLINE PROTOCOL ACTIVATED. Sixth consecutive deferral. UNMISS mandate expires April 30 (T-2 days). Cannot be deferred again. Escalated to PENDING_CHANGES.md human-review queue with explicit April 30 hard-deadline-breached marker. Floor-limitation means the appropriate response to any vote outcome is methodology-note registration (not a composite change proposal). Human review required to authorize the methodology note and decide whether to document the vote outcome as a formal evidence-tier event.

### Pending-Cycle Status (as of Night 10)

| Night | Proposals | Status |
|-------|-----------|--------|
| April 25 (Batch 10) | 7 | Pending founder review |
| April 26 (Batch 11) | 5 | Pending founder review |
| April 27 (Batch 12) | 4 | Pending founder review |
| April 28 (Batch 13) | 0 | N/A — no proposals |

Total pending: 16 proposals. Recommend founder review and application before May 1.

---

## Batch 14 — 2026-04-29

**Applied by:** Digest agent (no score changes — zero proposals generated)
**Indexes affected:** None
**Entities assessed:** 16 (15 confirmations + 1 deferral)
**Proposals generated:** 0
**Deferrals:** 1 (South Sudan — SEVENTH consecutive; UNMISS mandate expires TOMORROW April 30; FINAL CYCLE)

### Pipeline Summary

| Stage | Count |
|-------|-------|
| Entities scanned | 1,155 |
| Entities assessed | 16 |
| Proposals generated | 0 |
| Confirmations | 15 |
| T1 priority | 10 |
| T2 sector watch | 1 |
| T3 rotation | 5 |
| Deferrals | 1 |
| Errors | 0 |

### Second-Consecutive Zero-Proposal Significance

Two consecutive zero-proposal nights confirm a pattern rather than a single anomaly. The interpretation differs from Night 10:

- Night 10 (April 28): first-ever zero-proposal night; primary driver was the rotation-state drift gap between scanner baselines and recently-applied live scores
- Night 14 (April 29): second consecutive zero; confirms the drift gap is substantively closed; no new evidence crosses the 5-point threshold at any live baseline

The pipeline is operating correctly. The zero reflects genuine evidence-based confirmation for all assessed entities — not deferred evidence or pending re-anchoring. The floor-limitation cluster and anti-double-counting applications account for the remainder. The institutional landscape has not stabilized uniformly; the pipeline's expressive range has reached its operational limits in both directions.

### Key Findings

- **Anthropic Mythos breach** (April 21, Bloomberg/TechCrunch): Most significant new event registering as confirmation rather than proposal. 14-hour unauthorized access via guessable URL and improperly-scoped vendor credentials. Offset by voluntary too-dangerous-to-release classification (positive AWR/INT) and DC Circuit filing. Sub-5pt net effect; composite 61.6 holds. Breach documented on record; re-queue next cycle with focus on access-control remediation disclosure.
- **OpenAI trial Day 3** (April 29): Musk retook stand; Jared Birchall next witness. Two surviving claims (unjust enrichment, breach of charitable trust); ~$134B sought; liability phase approximately May 21. Mandatory re-queue post-verdict.
- **Singapore OHCHR drug-execution moratorium call** (April 2026): 8 drug executions YTD; April 16 hanging triggered OHCHR Türk formal call for moratorium. Strongest rotation-cycle negative signal across T3 entities tonight. Documented in first-ever agent baseline (Singapore 62.2).
- **Australia UN HRC review** (January 26, 2026): 40 countries called for raised criminal-responsibility age; UN Working Group human rights crises framing; partially offset by Victoria Indigenous treaty. First-ever agent baseline (Australia 62.5).
- **Anti-double-counting applied** for Microsoft, Meta AI, Houston, Amazon — all correctly absorbed prior-cycle evidence without double-scoring.
- **T3 rotation first baselines**: Belgium 77.9, Singapore 62.2, Portugal 65.6, Japan 65.6, Australia 62.5 — all confirmed at live baselines.

### Methodology Flags

1. **south_sudan_unmiss_hard_deadline_FINAL_CYCLE** — CRITICAL. SEVENTH consecutive deferral. UNMISS mandate expires April 30 (TOMORROW). Cannot be deferred again. 2025 precedent (technical rollover Res 2778 April 30, substantive Res 2779 May 8) most likely scenario. Any vote outcome requires methodology-note registration rather than composite change. Emergency human review mandatory April 30 morning.

2. **floor_limitation_methodology_gap** — CRITICAL (escalated). 8 nights overdue. Five entities: xAI 2.2, Palantir 6.6, Sudan 0, South Sudan 0, Israel 8.8. Three options documented in PENDING_CHANGES.md. No new fourth option surfaces from tonight's evidence. Benchmark credibility risk if gap continues without resolution.

3. **user_input_baseline_drift** — HIGH. 6 entities with divergent scanner baselines vs. live data (Belgium, Singapore, Portugal, Japan, Australia, United States). Live baselines used per protocol. Reconciliation pass recommended before next rotation cycle.

4. **texas_floor_pressure** — MEDIUM. Texas 14.1 Critical with EQU/ACC/INT at 1.3 sub-band ceiling. Accumulating evidence pattern. May approach floor-limitation constraints in next 1-3 cycles.

### South Sudan — FINAL CYCLE

UNMISS mandate (Res. 2779) expires April 30, 2026. This is the final permissible deferral. April 30 morning protocol:
- Check press.un.org and What's In Blue for vote result
- If technical rollover: authorize methodology note; floor-limitation constraint documented
- If substantive renewal: same plus assess mandate scope changes
- If mandate lapses: emergency human review; unprecedented governance event

Floor-limitation means any outcome — renewal, rollover, reduction, or lapse — cannot be expressed via composite movement. Methodology-note registration is the only appropriate pipeline response under current methodology.

### Pending-Cycle Status (as of Night 11)

| Night | Proposals | Status |
|-------|-----------|--------|
| April 25 (Batch 10) | 7 | Applied April 27 |
| April 26 (Batch 11) | 5 | Applied April 27 |
| April 27 (Batch 12) | 4 | Applied April 27 |
| April 28 (Batch 13) | 0 | N/A — no proposals |
| April 29 (Batch 14) | 0 | N/A — no proposals |

Rotation-state drift gap: substantively closed. All 16 proposals from April 25-27 applied. Current pipeline operating on clean live-index baselines for assessed entities.
