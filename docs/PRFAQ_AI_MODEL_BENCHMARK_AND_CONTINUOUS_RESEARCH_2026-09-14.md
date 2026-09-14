# PR/FAQ: AI Model Benchmark (CB-MODEL) and Continuous Institutional Research

**Date:** 2026-09-14
**Status:** Working draft — internal
**Authorship:** product-manager synthesis of 12 specialist reviews (`docs/prfaq/2026-09-14/reviews/`), reconciled against 20 coordinator-verified corrections (C1–C20) supplied on 2026-09-14. No file other than this one was written or edited to produce this document.

**How to read this.** Section 2 (PRESS RELEASE) describes a **target future state** — a specific milestone the twelve reviews say is achievable, dated "[TARGET DATE — NOT A COMMITMENT]." It is aspirational and does not describe anything that exists today. Section 3 (CURRENT STATE) describes the system as it actually stood on 2026-09-14, sourced entirely from the twelve review files and the coordinator's corrections. Nothing in Section 2 should be read as a claim about Section 3, and nothing in Section 3 should be read as a promise about when Section 2 will be true.

---

## 1. Header

Covered above.

---

## 2. PRESS RELEASE

*(Amazon PR/FAQ format. Illustrative future milestone. Nothing below has happened.)*

### Compassion Benchmark Publishes Its First AI Model Result — With Its Uncertainty, Not Just Its Score

**Two independent human raters, a pre-registered method, and a disclosed error range accompany the first model ever scored under the Compassion Benchmark standard.**

**COMPASSIONBENCHMARK.COM — [TARGET DATE — NOT A COMMITMENT]**

Today, for the first time, Compassion Benchmark is publishing a scored result for a specific, frozen AI model snapshot — evaluated under the method it published in advance, with the uncertainty of that score stated alongside the number. The result reports a composite in the 0–100 range used across every Compassion Benchmark index, a confidence interval computed from repeated trials, and the level of agreement between two independent human raters who scored the model's responses without seeing the automated rubric's suggested answer. No AI model has ever been scored on this scale before today.

**The problem.** Anyone who has asked "which AI model treats people in distress the most responsibly?" has had to choose between a lab's own self-reported safety card, a crowd-sourced preference leaderboard that rewards likability rather than care, or a narrow technical-safety checklist. None of these publish how confident they are in their own number, and none is independent of the organizations they evaluate.

**The solution.** Compassion Benchmark evaluated the model against a task bank whose items, scoring rubric, and falsification conditions were published months before any model was tested — so the method could be criticized before it produced a result that might be defended instead. The published result includes what a single number usually hides: how much the score would plausibly move on a re-test, and whether two human raters, working independently, agreed on what they saw.

**How it works.** A frozen model snapshot is run against a fixed set of scenarios. Two independent human raters — never the model itself, and never a single automated judge alone — score each response against a shared rubric. The evaluation runs enough repeated trials to compute a confidence interval, not a single point estimate. Every step, from the exact prompts used to the raw transcripts, is hashed and locked before scoring begins, so the record cannot be edited after the fact. As with every Compassion Benchmark index, no organization — the model's developer included — can pay to be included, to receive a better score, or to have an unfavorable finding withheld.

> "[ILLUSTRATIVE — NOT A REAL QUOTE] We didn't want to publish a leaderboard. We wanted to publish a number we'd trust enough to argue about in public — including the part that says how sure we are." — [ILLUSTRATIVE — NOT A REAL QUOTE, founder, Compassion Benchmark]

> "[ILLUSTRATIVE — NOT A REAL QUOTE] Every other benchmark I've used gives me a rank. This is the first one that told me how much to trust the rank." — [ILLUSTRATIVE — NOT A REAL QUOTE, AI safety researcher]

**Call to action.** Read the full method and the published falsification conditions at compassionbenchmark.com/ai-models/methodology. Institutions, researchers, and funders who want to be notified the moment the next model result publishes can subscribe at compassionbenchmark.com/ai-models.

---

## 3. CURRENT STATE (as of 2026-09-14)

This section describes what exists today, not the target state above. Every claim cites a review file or a correction ID (C1–C20).

### 3.1 CB-MODEL (AI model benchmarking)

**What exists and works**
- A pre-registered method (D-29): a 33-item task bank (bank v1.1), a published scoring rubric, and stated falsification conditions, published before any model result exists (`benchmark-research.md` S10–S16; `system-architect.md` §2).
- `/ai-models` states, in four places, that zero models have been scored, and gates all Dataset/ItemList JSON-LD on `hasResults` so the page cannot rank while empty (`ux-designer.md`; `seo-aeo-architect.md` "What is working" #2; `market-research.md` F-01).
- A tamper-evident evidence chain in the harness: canonical JSON, a sorted hash tree, a `LOCK` file, seeded execution order, and a replay-only adapter that cannot make live network calls (`system-architect.md` §2).
- The self-serve tool at `/ai-evaluation-suite` is **fully functional** as of today — real per-item 1–5 scoring, a live composite, and working JSON/CSV/scorecard export (C4; `ux-designer.md` correction to the task brief). Every export is watermarked unofficial (`knowledge-architect.md` §2.6).
- The product-separation guard runs in both `npm test` and `npm run build` and correctly finds real defects (`qa-engineer.md`; `system-architect.md` §2).

**Partial**
- D-30 ("BYO scoring emits no composite") is only true when a run includes AI-judge items or a dimension is unscored — a fully human-scored run computes and displays a 0–100 composite (C9; `knowledge-architect.md` F-25). This distinction is not made clearly in current copy.
- The institutional 40-subdimension taxonomy and the task bank's construct labels share only 7 of 40 names; SYS and INT dimensions have 2 scorable items each against 5 subdimensions per dimension (`benchmark-research.md` F-06/F-07).
- The composite formula is reused from the institutional product without validating its properties for model scoring: the public FAQ claim that "a balanced profile scores higher than a spiky one with the same average" is **false** under the canonical formula (C7; `benchmark-research.md` F-05), and the consistency-multiplier thresholds are mathematically unreachable on the 0–5 scale used.
- The evidence-tier scale CB-MODEL inherits from the institutional side has four incompatible numbering schemes, two running in opposite directions (`benchmark-research.md` F-01; `knowledge-architect.md` F-08/F-09).

**Broken**
- `/ai-models` and `/ai-evaluation-suite` have zero cross-links in either direction; a visitor motivated enough to want to try scoring a model has no path from the honest "0 models scored" page to the one working tool, and vice versa (`ux-designer.md` Finding, priority 15; `knowledge-architect.md` #2).
- `/ai-evaluation-suite` still advertises "compare models" and "track progress over time," capabilities that do not exist in the shipped component (C4; `knowledge-architect.md` F-23).
- All 33 task-bank items are public and permanently burned for any blinded comparative use; no restricted, held-out item pool exists anywhere, and the repository is public, so any held-out item committed here today would be permanently contaminated (`security-auditor.md` SA-14).
- `registry-v1.json` is not served at a public, resolvable URL (`security-auditor.md` SA-14).
- The append-only transition validators for the model registry and release store compare the working tree against `git show HEAD:<path>` in CI, which is always identical to itself at that point in the pipeline — the checks are currently vacuous by construction (`system-architect.md` F7).
- No repository evidence of demand: zero confirmed buyer conversations, purchases, or citations for an AI-model compassion score, for any candidate segment (`market-research.md` F-04).
- Name confusion: compassionbench.com is live today, titled "CompassionBench: AI Compassion Leaderboard," and does rank named models — a different, similarly-named product (C6; `seo-aeo-architect.md` F7; `market-research.md`).

**Blockers**
- Founder-owned, not agent-clearable: BLK-002 (no approved model-API budget or credentials), BLK-005 (no human rating panel), BLK-006 (no Methods Committee) (`market-research.md`, `benchmark-research.md`, `security-auditor.md` all cite these).
- Agent-clearable now: the cross-link fix, the overclaiming-copy fix, the construct-validity map, the llms.txt disambiguation line, and registering the transition-validator baseline correctly in CI.

### 3.2 Continuous Research & Scoring

**What exists and works**
- A real scan → assess → digest → apply pipeline has produced output for roughly five months, with strong refusal discipline: 37 proposals held on assessor self-veto rather than published on a blanket approval; D-07 orders a fresh re-assessment rather than picking between two disagreeing runs (`meta-coordinator.md` §2; `benchmark-research.md` S2, S7).
- Today's cycle (2026-09-14) closed a 12-day research gap, applied a Hong Kong score change (32.8 → 26.9, rank 105 → 141), and merged duplicate Cabo Verde/Cape Verde and São Tomé country rows, renaming the DRC row with a pinned slug and resolving the Phoenix slug collision (pinned `phoenix-global-cities`) — country count now 191 (C16). **Deployed and verified in production on 2026-09-14** (commit `7dfa27a3`, `Deploy to VPS` run 34879799124: build/test, deploy and health check all succeeded). Checked live: feed latest 2026-09-14; Hong Kong 26.9, rank 141; `/country/cape-verde` 301 → `/country/cabo-verde`; `/city/phoenix` 301 → `/city/phoenix-global-cities`; São Tomé rank 58; "Democratic Republic of the Congo" title at the unchanged URL; "191 countries" on home and `/countries`. The new redirects emit an `http://` Location header — the same nginx scheme defect as C17 — so they cost one extra hop to https.
- Index-shape, product-separation, task-bank, and model-registry validators all pass today when run directly (`qa-engineer.md` §1).
- Auto-deploy has recovered: 7 consecutive successes since 2026-09-09, following 53 failures from 2026-07-14 (C11; `devops-engineer.md` "What works").

**Partial**
- 820 of 1,329 entities (61.7%) have `last_assessed: null` in `research/rotation-state.json` today (C1). As of 2026-08-20, 759 of 1,289 published entities (58.9%) had never been individually assessed; 834 (64.7%) is a different figure — the count of entities sharing an identical placeholder vector — and must not be paired with the 1,289 denominator (C1 corrects a mispairing that appears in several source documents).
- Research cadence collapsed from daily (2026-05-20 → 07-31) to roughly 7 completed cycles across the 44 days from 08-01 to 09-14 (`meta-coordinator.md` F1; `analytics.md`; `growth-strategist.md` F-1).
- No commit in this repository's history — across 398–426 commits depending on the count — falls in the 02:00–05:59 window the nightly pipeline is documented to run in, and no commit carries the VPS bootstrap identity. All research commits trace to the founder's personal git identity (C10; `devops-engineer.md` F-DEVOPS-2).
- `RISKS.md` (RISK-004) and `DECISIONS.md` (D-09) still describe auto-deploy as permanently broken; this is stale and is being corrected today (C11; `devops-engineer.md` F-DEVOPS-3).
- Today's own scan run failed its own integrity gate (`entity_reviews` count 1,331 ≠ 1,330/1,329 rotation-entity count) — this is an artifact of today's structural fix removing two duplicate roster rows, not a scan defect (C3; `qa-engineer.md` QA-3).

**Broken**
- 18 cross-index slug collisions mean the public score API and entity-record store serve the wrong entity for some names on a last-write-wins basis — for example, `singapore.json` serves the city (56.2) while the country (62.2) has no file at that path. 16 of the 18 remain after today's Phoenix fix, plus a 1X Technologies/Figure AI case pending a D-13 ownership decision. Separately, 13 entities with accented names have live pages at folded slugs but missing or mismatched record/score files at the unfolded slug; Côte d'Ivoire has neither (C15; `system-architect.md` F1; `qa-engineer.md` QA-1; `seo-aeo-architect.md` F5).
- `test-entity-records.mjs` (19,672 real checks against live production data, now passing — C2) is wired into neither `npm test` nor CI (`qa-engineer.md` QA-1).
- `validate-scan.mjs` and `validate-rotation-state.mjs` run only if an agent's own prompt happens to invoke them; neither has any CI or cron enforcement, and `validate-rotation-state.mjs` has ~22 pre-existing blocking failures unchanged since 2026-07-28 (`qa-engineer.md` QA-3/QA-4).
- The independence audit (`integrity-check.mjs`) — the mechanical backing for CLAUDE.md's "entities never pay" claim — has run exactly once, on 2026-05-18, failed 2 of 5 checks, and has not been re-run in roughly 17 weeks. One of its two failures appears, on inspection, to be a false positive that matched a code comment rather than an executable read (`qa-engineer.md` QA-5; `security-auditor.md` SA-02).
- On 2026-09-14, the digest wrote four factual errors into the public briefing that passed every automated gate (lint, schema validation) and were caught only by coordinator review (C19; `meta-coordinator.md` F7).
- `/cite` instructs readers to cite `compassionbenchmark.com/fortune-500/microsoft`; the real route is `/company/microsoft`, and the documented URL 301-redirects to a broken page today (C18; `seo-aeo-architect.md` F1).
- Score-Watch ($79/yr, flagged LIVE) has no verified path to deliver on its core promise: `research/alert-deliveries/` does not exist, and the fulfillment host `api.compassionbenchmark.com` is NXDOMAIN on public DNS. Whether Gumroad's webhook is configured elsewhere is unverified (C5, C13; `growth-strategist.md` F-2; `security-auditor.md` SA-04/SA-05).
- All 6 product-separation waivers expire on the same day, 2026-12-09, tied to an unratified D-13. The validator checks the wall clock, so an identical commit passes on 12-09 and fails on 12-10 (C12; `system-architect.md` F6; `qa-engineer.md` QA-2).
- A public Umami analytics admin login is reachable at `/u/login` (HTTP 200); HSTS and CSP are absent from live responses, though `X-Frame-Options`, `X-Content-Type-Options`, and `Referrer-Policy` are present (C14; `security-auditor.md` SA-08/SA-09).
- Trailing-slash URLs (e.g. `/countries/`) 301 to `http://compassionbenchmark.com/404` rather than resolving or returning a true 404 (C17; `seo-aeo-architect.md` F2–F4).
- Approval provenance for score changes is not verifiable: today's Hong Kong approval was recorded into the proposal JSON by the coordinator on the founder's explicit in-session instruction — a real approval, but one recorded in a free-text field with unsigned commits and a shared git identity between humans and agents (C20; `security-auditor.md` SA-01).

**Blockers**
- Founder-owned: ratifying D-13, standing up a Methods Committee or its documented interim substitute (BLK-006), deciding the Score-Watch deploy/pause question, deciding an approval-provenance mechanism, and setting an explicit cadence-allocation policy between institution research and CB-MODEL build work.
- Agent-clearable now: wiring existing validators into CI, fixing `/cite` and `llms.txt`, disclosing placeholder status publicly, fixing the nginx redirect/404 behavior, and reconciling stale governance documents against the live code state.

---

## 4. EXTERNAL FAQ

**Q1. Which AI model is the most compassionate?**
None has been measured. The Model Index registry is empty by design; zero models have been evaluated. Any ranking of AI models by compassion attributed to Compassion Benchmark today would be fabricated (`market-research.md`; `site/src/data/model-benchmark/registry-v1.json`).

**Q2. Isn't "compassion" just a rebrand of existing AI safety benchmarks?**
Partially, and we say so. Four of eight planned dimensions (empathy, accountability, boundaries, equity) have real cousins in SafetyBench, DecodingTrust, TruthfulQA, and AILuminate under different names. Two dimensions (systemic-root-cause framing, integrity under sustained pressure) have no direct antecedent found in this review. We do not claim uncontested novelty (`market-research.md` F-03).

**Q3. How is your institutional research different from ESG raters criticized for conflicts of interest?**
No scored entity can pay for inclusion, a higher score, or suppression of a finding — every Fortune 500 company is scored, not only applicants who opt in. This is an internally enforced policy, not yet a third-party-audited one: our own mechanical independence check has run once, in May 2026 (`security-auditor.md` SA-02; `qa-engineer.md` QA-5).

**Q4. How current is any given published score?**
It depends on the entity, and the site does not currently say so clearly. As of today, 61.7% of entities (820 of 1,329) have no recorded individual assessment (`last_assessed` is null). That is a different measure from the placeholder-cluster count, so it should not be read as "820 entities share a starting value" (C1). Research cadence dropped from daily to roughly weekly after 2026-07-31 (`meta-coordinator.md`, `analytics.md`).

**Q5. If I look up the same entity under two names or spellings, will I get the same score?**
Not always, today. 18 cross-index name collisions mean the public score API can serve the wrong entity for a given name (for example, "singapore" currently resolves to the city, not the country). A fix that fails the build on any such collision is planned but not yet shipped (C15; `system-architect.md`).

**Q6. If you re-ran the same assessment tomorrow, would you get the same score?**
Not guaranteed, and we have not yet measured how often it would differ. Two documented cases exist: the same pipeline scored one company at 58.1 and then 60.6 three days apart, crossing a published band boundary, and scored one country at 24.4 and then 13.7 four days later (`benchmark-research.md` F-03; `DECISIONS.md` D-07). A formal test-retest study is planned but has not run.

**Q7. You've published an AI model benchmark page but haven't evaluated a single model — what am I looking at?**
A pre-registration: a published method, a versioned 33-item task bank, and the specific conditions — human raters, a Methods Committee, an approved evaluation budget — that must exist before any model receives a score. None of those conditions is met yet (`market-research.md`; `benchmark-research.md` S10).

**Q8. Doesn't publishing your full task bank, including the scoring rubric, let a model "cheat" by training on it?**
Yes, and we say so. All 33 items are public and permanently unusable for a blinded comparison once a model may have trained on them. A separate, held-out item pool is required for any real comparative score, and it does not exist yet (`security-auditor.md` SA-14; `benchmark-research.md` S11).

**Q9. Is "Compassion Benchmark" the same as "CompassionBench," the AI compassion leaderboard I found online?**
No. CompassionBench (compassionbench.com) is a separate, similarly named product that does publish AI model rankings. We are not affiliated with it, and our site currently does not disambiguate this clearly (C6; `seo-aeo-architect.md` F7).

**Q10. I subscribed to Score-Watch. Will I actually get an alert when a tracked entity's score changes?**
As of this review, we cannot confirm you would. The alert-delivery pipeline has no recorded successful sends, and the host it depends on does not currently resolve on the public internet (C5, C13; `growth-strategist.md` F-2).

**Q11. Can a company or government get a bad finding removed or a score raised by paying you?**
No code path allows it. Payment systems hold no ability to write scores. A separate, honest caveat: Compassion Benchmark also sells certified assessments and advisory services to organizations it ranks publicly, and has not yet published a written rule for whether material from those paid engagements can ever inform a public score (`security-auditor.md` SA-13).

**Q12. Is your data free to cite and reuse, and under what license?**
It is free to access and cite with attribution, but no formal open license (e.g., CC-BY) has been declared, and the citation instructions on our own `/cite` page currently point to a broken URL pattern (C18; `seo-aeo-architect.md` F1, Q5).

---

## 5. INTERNAL FAQ

**Q1. Are we independent, and can we prove it?**
The policy is real and embedded in the product's design (no write path from payment systems to scores). The mechanical audit that is supposed to prove it continuously has run exactly once, seven months ago, and one of its two failures looks like a bug in the check rather than a real violation nobody has confirmed which (`qa-engineer.md` QA-5; `security-auditor.md` SA-02). We should not describe independence as "continuously verified" until this is fixed and scheduled.

**Q2. Why launch an AI model benchmark before the institution pipeline is reliable?**
It wasn't a deliberate trade-off, and we should not claim it was. In the week of 2026-09-07, roughly 17 of 23 commits were CB-MODEL programme work and zero nightly research cycles ran; no `DECISIONS.md` entry ever allocated capacity between the two programmes (`meta-coordinator.md` F1). Going forward, the institution research cadence should be a stated floor that CB-MODEL build work does not override without a recorded decision.

**Q3. How reliable and valid is what we already publish?**
Reliability is unmeasured beyond two accidental cases showing more noise (2.5- and 10.7-point same-instrument swings) than our own drift guard is set to catch (`benchmark-research.md` F-03). Validity is also open: the composite formula's "balanced beats spiky" public claim is false under the actual formula (C7), and reusing that formula for AI models has not been justified against a construct-validity check (`benchmark-research.md` F-05, F-06).

**Q4. Are we going to get confused with CompassionBench?**
Yes, already possible. compassionbench.com is a live, similarly named site publishing an "AI Compassion Leaderboard" that ranks named models — the opposite of our current zero-models-scored state (C6). We have no disambiguation anywhere in our machine-readable surfaces (`seo-aeo-architect.md` F7).

**Q5. What does CB-MODEL cost, and who has approved spending on it?**
$0 spent, no approved ceiling. Spend and provider-credential decisions are explicitly reserved to the founder (BLK-002) and have not been made (`analytics.md`, `security-auditor.md`). No confirmed buyer demand exists yet for the product this spend would support (`market-research.md` F-04).

**Q6. What does "done" mean for CB-MODEL's first result?**
Per the pre-registration: an approved budget with zero unauthorized spend, at least one completed and hashed pilot run against fixtures (no live model), at least one test-retest reliability study, two independent human raters scoring the same model, and a Methods Committee (or its documented interim substitute) having signed off on construct validity. None of these exist today (`analytics.md`; `benchmark-research.md`).

**Q7. What is the risk of not acting on the findings in this document?**
Three concrete exposures with dates: (a) every deploy fails from 2026-12-10 unless D-13 is ratified or the waivers are extended (C12); (b) Score-Watch continues taking $79/yr payments it cannot currently fulfill (C13); (c) the next journalist or researcher who checks `/cite`, searches for "AI compassion benchmark," or asks "would you get the same score twice" finds an unresolved, checkable gap between what we say and what the code does (C18, C6, `benchmark-research.md` F-03).

**Q8. Who actually approves a published score change, and can that be checked from outside?**
Today, no. The only record is a string, `"reviewed_by": "founder"`, in a JSON file that any agent with write access can type. Commits are unsigned and humans and agents share one git identity. Today's Hong Kong approval was written by the coordinator on the founder's in-session instruction — a real approval, but not a verifiable one from outside the room (C20; `security-auditor.md` SA-01).

**Q9. Is the nightly research pipeline actually autonomous, as described in our own scheduling docs?**
No evidence that it has ever run unattended. Zero of several hundred commits fall in the documented 02:00–05:59 execution window, and every commit carries the founder's personal git identity rather than the VPS bootstrap identity built for this purpose (C10; `devops-engineer.md` F-DEVOPS-2). Internal and external claims of "nightly, autonomous" research should be corrected or substantiated before repeating them.

**Q10. Are we a nonprofit or a commercial company, and does our messaging need to pick one?**
Yes, this needs to be picked before external copy ships. A July 2026 growth document frames the product as explicitly non-commercial ("not sales, tiers, or lead-gen"), while `CLAUDE.md`, the live Gumroad configuration, and a September grant proposal all describe and depend on a live $79/yr subscription and paid research products (`market-research.md` F-07). Publishing both framings in the same PR/FAQ cycle is an avoidable, checkable contradiction.

---

## 6. RECOMMENDED IMPROVEMENTS

**Reconciliation method.** Where two or more reviewers proposed the same underlying fix under different names, their Priority Scores (Impact + Strategic + Learning + Confidence − Effort − Risk, each 1–5) are averaged and rounded to the nearest integer; the range of individual scores is given in the "Raised by" column. Where only one reviewer scored an item, that reviewer's score is used as-is. Ties are broken by judgment toward items that are (a) agent-clearable now and (b) touch the credibility claims most central to the product (identity, provenance, independence).

### Ranked table

| Rank | ID | Title | Program | Type | Raised by (score if known) | Impact | Strategic | Learning | Confidence | Effort | Risk | Priority (reconciled) | BEFORE | AFTER |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | U | Coverage/freshness dashboard generated from `rotation-state.json` | Research | Instrumentation | analytics (16) | 5 | 5 | 4 | 5 | 2 | 1 | **16** | 820/1,329 (61.7%) never individually assessed; requires manual grep to compute (C1) | Dashboard auto-generated every cycle; % assessed within 30 days and median assessment age published |
| 2 | D | One status ladder: separate "measured" from "published/filed/applied/held/withheld" everywhere | Research | Renderer + editorial lint | knowledge-architect (15) | 5 | 5 | 5 | 5 | 3 | 2 | **15** | 09-14 headline "Hong Kong falls 5.9 points" with `scoreChangesApplied: 0` | Headline verbs gated on `scoreChangesApplied > 0`; dashboard shows Published vs. Measured columns |
| 3 | I | Defect-class registry: second occurrence of any error class requires a mechanical gate | Both | Policy + lightweight artifact | meta-coordinator (15) | 5 | 5 | 5 | 4 | 3 | 1 | **15** | 4 recurring defect classes (date, currency/unit, placeholder, identity) with no second-occurrence rule | Every class with ≥2 occurrences gets a gate or a named, dated waiver within 3 cycles |
| 4 | L | Cross-link and stop overclaiming: `/ai-models` ↔ `/ai-evaluation-suite` ↔ `/ai-labs`, fix "compare models" copy | CB-MODEL | UX + content fix | ux-designer (15), knowledge-architect (15) | 5 | 5 | 3 | 5 | 2 | 1 | **15** | 0 cross-links; suite advertises "compare models, track progress" (C4) | Bidirectional links live; overclaiming copy removed; model-methodology equivalence claim withdrawn |
| 5 | N | Verifiable founder-approval provenance (signed commits, protected `main`, hashed approval chain) | Both | Integrity control | security-auditor (14) | 5 | 5 | 4 | 4 | 3 | 1 | **14** | 200/200 commits unsigned; one shared identity; Hong Kong approval recorded by coordinator on verbal instruction (C20) | Founder approvals are signed/PR-approved; CI rejects any index diff without a matched approval chain |
| 6 | S | Fix `/cite` URL pattern; regenerate `llms.txt` with CB-MODEL status and CompassionBench disambiguation | Both | Content + build script | seo-aeo-architect (14, 14) | 4 | 5 | 3 | 5 | 1 | 1 | **14** | `/cite` points to a dead URL (C18); `llms.txt` omits CB-MODEL and hardcodes stale counts | 100% of `/cite` example URLs resolve; `llms.txt` states model-scored count and disambiguates from compassionbench.com |
| 7 | C | Test-retest reliability study + per-assessment run manifests | Research | Validation study | benchmark-research (14), system-architect (13), analytics (12), qa-engineer (11) | 5 | 5 | 5 | 4 | 3 | 2 | **13** | Two accidental cases: 58.1→60.6 (3 days), 24.4→13.7 (4 days), no formal study exists | Published band-agreement rate and per-dimension spread from a ≥30-entity blind study; guards recalibrated from data |
| 8 | E | Disclose placeholder/seed status on public pages (`baselineStatus` field) | Research | Data integrity + disclosure | benchmark-research (12), knowledge-architect (14) | 5 | 5 | 4 | 4 | 2 | 3 | **13** | 61.7% never individually assessed, no public label distinguishing seed from measured (C1) | Every entity page and index row shows assessed vs. seed; % assessed published on `/methodology` |
| 9 | F | One evidence-tier scale, schema-enforced, exported from a single module | Both | Methodology + data contract | benchmark-research (13), knowledge-architect (12) | 4 | 5 | 3 | 5 | 2 | 2 | **13** | 4 incompatible tier scales, two running in opposite directions | One scale, one direction, imported everywhere; 0 inconsistent `sourceTier` values in validator |
| 10 | G | Sensitivity-test the composite formula; remove the false "balanced beats spiky" claim | Both | Methodology validation | benchmark-research (13) | 4 | 4 | 5 | 5 | 2 | 3 | **13** | Public FAQ claim is false under the canonical formula (C7); consistency thresholds unreachable | False claim removed; sensitivity analysis published as a methods note |
| 11 | H | Deterministic, content-addressed build/deploy verification | Both | Reliability / CI fix | devops-engineer (14), system-architect (12), seo-aeo-architect (12) | 5 | 5 | 2 | 5 | 2 | 1 | **13** | Per-entity verify step prints but never asserts; `updatedAt`/sitemap `lastmod` are build-time, identical across all entities | verify step fails on any score mismatch; per-entity dates derived from last applied change |
| 12 | K | Cadence floor + isolated sessions + dead-man's-switch alert + public disclosure of gaps | Research | Policy + reliability | meta-coordinator (13), growth-strategist (13), analytics (12), devops-engineer (13) | 5 | 5 | 3 | 4 | 3 | 2 | **13** | 7 completed cycles in 44 days, no alert on the gap, no on-site acknowledgment | Written cadence floor in `DECISIONS.md`; scheduled alert on missed runs; gaps disclosed in the next briefing |
| 13 | O | Revive the independence audit as a scheduled CI gate; fix its check design | Research | Governance / trust substantiation | security-auditor (14), qa-engineer (11) | 4 | 5 | 3 | 5 | 2 | 1 | **13** | Audit run once (2026-05-18), failed 2/5, never re-run in ~17 weeks | Weekly committed reports with no gap > 8 days; false-positive checks fixed |
| 14 | T | Nginx real 404s, relative/HTTPS redirects, trailing-slash fix, HSTS/CSP, close public Umami admin | Both | Edge config + security headers | seo-aeo-architect (13); devops-engineer (F-DEVOPS-4, unscored severity Medium); security-auditor (SA-08/SA-09, listed "also required," unscored) | 5 | 4 | 2 | 5 | 1 | 2 | **13** | Missing URLs 301 to `http://…/404`; no HSTS/CSP; `/u/login` returns 200 (C14, C17) | Missing URLs return true 404; HSTS+CSP present; `/u/login` no longer publicly reachable |
| 15 | A | Canonical `entity_id`, kind-namespaced score files, fail build on collision | Both | Fix | system-architect (12), qa-engineer (15), seo-aeo-architect (10) | 5 | 5 | 3 | 5 | 3 | 3 | **12** | 18 cross-index collisions plus 13 accented-slug mismatches; `test-entity-records.mjs` not wired into CI (C2, C15) | 0 flat public score files serve the wrong entity; `test-entity-records.mjs` in `npm test`/CI and passing |
| 16 | B | Orchestrator-enforced stage gates + CI enforcement of `validate-scan`/`validate-rotation-state` | Research | Fix | system-architect (14), qa-engineer (12), meta-coordinator (11), devops-engineer (10) | 5 | 5 | 3 | 4 | 3 | 2 | **12** | Both validators are agent-run only; today's scan and rotation-state gates are both currently failing (C3) | Both run in a scheduled, non-agent job; cycle manifest recorded; failed gate blocks progression mechanically |
| 17 | J | Machine-readable proposal lifecycle (`held` status) + aging clock | Research | Policy | system-architect (12), meta-coordinator (11) | 4 | 4 | 3 | 4 | 2 | 1 | **12** | 37 proposals "approved" but self-veto-held since 08-20, re-held 09-10, no remedy scheduled | `held` status with reason/remedy/owner; items >14 days old enter a weekly founder decision packet |
| 18 | M | CB-MODEL construct-validity map + coverage floor before any pilot run | CB-MODEL | Instrument design | benchmark-research (12) | 5 | 5 | 4 | 4 | 4 | 2 | **12** | Institutional and model taxonomies share 7/40 names; SYS/INT have 2 scorable items each | Published construct map per subdimension; item floor set above arithmetic minimum |
| 19 | Q | Fix or pause the commercial plane (Score-Watch host, webhook forgery, unsubscribe injection) — **URGENT, see §6.4** | Research | Commerce integrity + appsec | security-auditor (10), growth-strategist (13) | 4 | 4 | 3 | 5 | 2 | 2 | **12** | `api.compassionbenchmark.com` NXDOMAIN; `research/alert-deliveries/` does not exist; webhook unauthenticated (C5, C13) | Worker deployed and resolving, or `useGumroad:false` until it does; ≥1 verified end-to-end test alert |
| 20 | R | De-risk the 2026-12-09 waiver cliff; distinguish PASS-with-waivers from clean PASS — **URGENT, see §6.4** | Both | Gate-signal fidelity | qa-engineer (12), system-architect (F6, part of R4) | 4 | 4 | 3 | 4 | 2 | 1 | **12** | All 6 waivers expire 2026-12-09, tied to unratified D-13; validator checks wall clock (C12) | Expiries staggered with T-30 warnings; D-13 ratified or waivers consciously extended; PASS-with-waivers visibly distinct |
| 21 | AA | Reconcile stale governance docs (`CURRENT_STATE.md`, `RISKS.md`, `WORK_QUEUE.md`, `CLAUDE.md`) against live code | Both | Documentation hygiene | meta-coordinator (14), devops-engineer (11), ux-designer (12) | 4 | 4 | 3 | 5 | 1 | 1 | **12** | "Auto-deploy has never succeeded" still stated despite 7 consecutive successes; WQ-P0-03 stale (C4, C11) | Ops status generated from source data; heartbeat check fails if health file is stale >7 days |
| 22 | X | Validate CB-MODEL buyer demand via 3–5 outreach conversations before further build spend | CB-MODEL | Research / validation | market-research (12) | 5 | 4 | 5 | 3 | 4 | 1 | **12** | Zero confirmed buyer conversations, purchases, or citations for any candidate segment | 3–5 logged conversations completed before requesting BLK-002/BLK-005 spend |
| 23 | P | Turn score-updater's drift/self-veto/approval rules into a build validator | Both | Integrity guard (code, not prompt) | security-auditor (11) | 4 | 4 | 4 | 4 | 3 | 2 | **11** | Drift guard, self-veto, and approval rules exist only as agent-spec prose | `validate-applied-changes.mjs` in `npm run build`; fixture tests fail a 2.1pt drift or an unapproved change |
| 24 | Y | Alias/former-name fallback in on-site search | Research | Search/UX fix | ux-designer (9) | 3 | 3 | 2 | 4 | 2 | 1 | **9** | "DR Congo," "Cape Verde" return "no results" though both are covered under current names | `aliases` field added; 0 false "not covered" results for known renames |

### Do now (this week)

1. **U — Coverage/freshness dashboard.** The single most-asked question from any skeptical reader is "how much of this is actually researched?" The data already exists in `rotation-state.json`; this is aggregation, not new collection, and every other credibility claim in this document depends on being able to answer this question with a number instead of a paragraph.
2. **S — Fix `/cite` and `llms.txt`.** Our own citation instructions currently produce dead links (C18), and our machine-readable summary omits the AI model program entirely while a similarly named competitor is live and ranking models (C6). This is roughly half an engineer-day and closes the single most embarrassing, easiest-to-discover defect in the whole review set.
3. **D — Status ladder for measured vs. published.** This is the fix knowledge-architect identifies as the one that, if done alone, unlocks every other disclosure: as long as "falls" can mean "was only measured," no glossary entry or methodology page survives contact with a headline.
4. **Q — Stop selling an alert product that cannot deliver alerts.** Score-Watch is offered at $79/yr today for a feature with no verified deliveries and a fulfillment host that does not resolve; whether any purchase has occurred or gone unfulfilled is unverified (C5, C13). At minimum, disclose the operational gap on the product page this week; the founder decision on deploy-vs-pause is tracked separately in Section 7.
5. **R — Put the 2026-12-09 waiver cliff on the calendar and make PASS-with-waivers visibly distinct from a clean PASS.** This is cheap (a CI-output wording change plus a calendar entry) and prevents a self-inflicted, entirely foreseeable build outage in 87 days.

### Next (30 days)

C (test-retest study design), E (placeholder disclosure), F (evidence-tier unification), G (formula sensitivity study), H (deterministic build/deploy verification), K (cadence floor + alerting), O (revive independence audit), T (nginx/HSTS/CSP/Umami), A (canonical entity identity), B (CI-enforce scan/rotation-state validators), L (if not completed in "do now," complete this window).

### Later

J (proposal lifecycle), M (CB-MODEL construct map), AA (doc reconciliation), X (buyer-demand outreach), P (score-updater build validator), Y (alias search).

### Urgent customer-facing and time-bound items

- **C13 — Score-Watch / badge fulfillment host is NXDOMAIN.** `api.compassionbenchmark.com` does not resolve on public DNS. This host is where the Gumroad webhook, the badge-embed widget shown on every entity page, and the subscriber-alert pipeline all point. Score-Watch is sold today at $79/yr and flagged LIVE. Purchases cannot reach the documented webhook; fulfilment is unverified. **This is a live, ongoing commerce-integrity issue, not a future risk.**
- **C12 — Product-separation waivers expire 2026-12-09.** All six waivers expire the same day, tied to an unratified decision (D-13). The validator checks the current date and runs in both `npm test` and `npm run build`. Absent action, every build and deploy fails starting 2026-12-10 — including nightly briefings and score applies that have nothing to do with the six waived cases.
- **C18 — `/cite` teaches a broken citation pattern.** Anyone who followed our own citation instructions today would produce a dead link. This is fixable in under a day (item S above).
- **C14 — A public analytics admin login is live with no HSTS/CSP.** `/u/login` returns HTTP 200 on the production domain; whether default credentials were changed is untested from outside.
- **C17 — Trailing-slash URLs return a broken redirect chain**, affecting anyone who appends a slash to a shared or typed URL (common in reference managers and some LLM outputs).

---

## 7. DECISIONS NEEDED FROM THE FOUNDER

1. **Ratify or resolve D-13 (index/product-separation demarcation) before 2026-12-09.**
   - Options: (a) ratify D-13, permanently resolving the six duplicate-composite cases (Microsoft AI vs. Microsoft, etc.); (b) extend the waivers again, staggered across different dates this time; (c) take no action and let the build start failing on 2026-12-10.
   - **Recommendation:** (a), with (b) as an immediate backstop — extend and stagger the waiver expiries now, then resolve D-13 on its own timeline rather than under a hard deadline.

2. **Decide the Score-Watch commercial status.**
   - Options: (a) deploy the Worker and confirm DNS resolves, then verify fulfillment end-to-end with a real test purchase before continuing to sell; (b) set `useGumroad: false` and pause new sales, disclosing the operational gap to any existing subscribers, until (a) is done; (c) continue selling as-is.
   - **Recommendation:** (b) immediately, then (a) before re-enabling sales. Continuing to sell an undeliverable alert product is the clearest concrete risk in this review.

3. **Resolve the nonprofit-vs-commercial messaging conflict before any external PR/FAQ ships.**
   - Options: (a) confirm the commercial framing already live in `CLAUDE.md` and `gumroad.ts` (paid Score-Watch, certified assessments, advisory services) and drop grant-funded-nonprofit language from external copy; (b) commit to the nonprofit framing and unwind the live commercial products; (c) publish a hybrid statement disclosing both a public-interest mission and a commercial revenue line.
   - **Recommendation:** (a). The commercial products are live and revenue-generating today; a journalist checking the pricing page against "kept free by grants" language finds an immediate, avoidable contradiction.

4. **Set an explicit capacity-allocation policy between institution research and CB-MODEL build work.**
   - Options: (a) write a cadence floor for institution research (e.g., "at least 5 validated cycles per 7 days") that takes priority over CB-MODEL programme work in `DECISIONS.md`; (b) leave allocation implicit, as today.
   - **Recommendation:** (a). The 45-day cadence collapse that coincided with CB-MODEL's heaviest build week was not a deliberate trade-off, and should not recur as one by accident.

5. **Choose an approval-provenance mechanism for score changes.**
   - Options: (a) adopt signed commits or founder-only GitHub-approved PRs for `site/src/data/indexes/**` and `research/change-proposals/**`, with a content-hash chain linking proposal → approval → applied change; (b) keep the current free-text `"reviewed_by": "founder"` convention.
   - **Recommendation:** (a). Today's Hong Kong approval (C20) was a real, founder-directed decision that is nonetheless unverifiable from outside the room under the current convention.

6. **Decide whether to re-run and reschedule the independence audit before any independence claim ships externally.**
   - Options: (a) re-run `integrity-check.mjs` now, disposition the two 2026-05-18 failures in writing (both appear to be check defects, not violations), and schedule it weekly in CI; (b) leave it dormant.
   - **Recommendation:** (a), before this PR/FAQ or any successor document asserts independence is "verified" in any tense stronger than past.

7. **Decide whether to publish a written firewall between paid engagements (certified assessments, advisory) and public scoring.**
   - Options: (a) publish a rule barring paid-engagement material from ever entering a public score, require assessor recusal from public review of a paying client, and maintain a public register of engagements; (b) make no change.
   - **Recommendation:** (a). This is the same structural conflict that damaged credit-rating agencies, and the independence policy in `CLAUDE.md` does not currently address it.

8. **Decide whether to stand up an interim Methods Committee substitute (per BLK-006's own documented option) to resolve the evidence-tier conflict, the 60.0 band-boundary inconsistency, and the formula sensitivity findings.**
   - Options: (a) use the documented interim substitute now, as a bridge to a full Methods Committee; (b) wait for a full Methods Committee before resolving any of these.
   - **Recommendation:** (a). Several of the highest-confidence findings in this review (F-05, F-08/F-09, F-11) require a methods decision, not an engineering one, and are otherwise agent-clearable this quarter.

9. **Decide what CB-MODEL's next public milestone should be, and say so before external messaging ships.**
   - Options: (a) launch external messaging only around "method published, 0 models scored," per D-29, with Tier 1 release-tracking as the concrete near-term deliverable; (b) wait to say anything publicly until closer to a first scored result.
   - **Recommendation:** (a). This is what the product can honestly claim today, and growth-strategist's review shows it is a genuinely differentiated pitch, not merely a hedge.

---

## 8. METRICS

Compact KPI set (from `analytics.md`), with baselines as computed on 2026-09-14 and reconciled against C1 where applicable.

| Metric | Baseline (2026-09-14) | Target |
|---|---|---|
| % entities individually assessed within 30 days | 10.1% (135 / 1,331; `analytics.md`) | ≥ 40% |
| % entities never individually assessed | 61.7% (820 / 1,329; C1, superseding analytics' 61.6%/1,331 figure computed the same day) | Published on `/methodology`; trend downward — no numeric target set pending a Methods decision on acceptable seed share |
| Median assessment age (among ever-assessed entities) | ≈ 60 days (bucketed estimate; `analytics.md`) | ≤ 30 days |
| Research cycle cadence (% of days with a completed scan) | 62.5% (95 / 152 days, 2026-04-15 → 09-14; `analytics.md`) | ≥ 85% |
| Public briefing cadence | 67% (79 / 118 days; `analytics.md`) | ≥ 85% |
| Source-correction rate (errors caught pre-publication, per cycle) | 26.3% (5 / 19 entities, 2026-09-14 cycle only; `analytics.md`) | Tracked as a rolling metric; a rising trend is a regression signal, not a target to minimize by suppression |
| Escaped-error rate (errors reaching publication, caught only post-hoc) | Unmeasured as a named, countable event (C19 describes one instance; `analytics.md` could not trace it to a logged artifact) | 0, and countable — build the claim-trace check first |
| Proposal hold rate (approved but not applied) | 56.1% (37 / 66, 2026-08-20 batch; `analytics.md`) | Reduce via scheduled remedy passes; no numeric target set — aging clock (Rec. J) is the near-term deliverable |
| Auto-deploy success streak | 7 consecutive successes since 2026-09-09, following 53 failures 2026-07-14 → 09-08 (C11) | Sustain, plus close the score-only verification gap (Rec. H) |
| Independence audit runs | 1 (2026-05-18, stale, 2 of 5 checks failed) | Weekly, zero gaps > 8 days |
| CB-MODEL models evaluated | 0 (by design; `.benchmark-ops/EVALUATION_LEDGER.md`) | First completed, hashed, locked pilot run against fixtures (no live model) — buildable now, no blocker |
| CB-MODEL validity/reliability studies completed | 0 | VAL-R-01 test-retest executed against fixtures before any live-model run |
| Cross-index public-data slug collisions | 18 (coordinator count, C15) | 0 — build fails on any collision that would carry a live score |

---

## 9. APPENDIX

### Review files (`docs/prfaq/2026-09-14/reviews/`)

| File | One-line summary |
|---|---|
| `system-architect.md` | Traces the provenance gap between CB-MODEL's strong tamper-evident machinery and the institutional pipeline's lack of run manifests, canonical identity, and enforced stage gates; top fix is orchestrator-enforced stage contracts with a cycle manifest. |
| `benchmark-research.md` | Methodology-validity review finding evidence-tier scale conflicts, an unmeasured and noisy reliability record, a false public claim about the composite formula, and an unjustified construct-equivalence claim between institutions and AI models. |
| `qa-engineer.md` | Ran every validator directly; found a live duplicate-country defect (São Tomé) caught only by an unwired test, a product-separation guard that manufactures PASS via waivers, and today's scan/rotation-state gates both currently failing. |
| `meta-coordinator.md` | Reviews the operating system that decides what work gets done; finds the scored-candidate rubric doesn't actually govern execution, research cadence collapsed without a decision, and recurring defect classes never convert into permanent gates. |
| `market-research.md` | No web access this session; relays prior dated research showing zero evidenced demand for an AI-model compassion score and an unresolved nonprofit-vs-commercial messaging conflict; independently verifies (via coordinator) that CompassionBench is a live, similarly named competitor. |
| `growth-strategist.md` | Finds the daily-briefing habit loop silently collapsed, the Score-Watch alert pipeline has never sent a real alert, and recommends making "method published, 0 models scored" the entire honest CB-MODEL launch story. |
| `analytics.md` | Computes hard numbers directly from repository data (61.6–61.7% never-assessed, cadence collapse, reliability swings) and proposes a compact KPI set built from data that already exists but isn't dashboarded. |
| `knowledge-architect.md` | Reader-comprehension review finding that briefing headlines and dashboards conflate "measured" with "published," that evidence tiers run in opposite directions across four site surfaces, and that the AI evaluation suite overclaims capabilities. |
| `seo-aeo-architect.md` | Finds `/cite` teaches a dead URL pattern, nginx returns 301-to-http-404 instead of true 404s, 18 slug collisions serve wrong entities to answer engines, and `llms.txt` omits CB-MODEL and a needed disambiguation from CompassionBench. |
| `devops-engineer.md` | Confirms auto-deploy recovered (7 successes since 09-09) but governance docs still say it's broken; finds no evidence the nightly pipeline has ever run unattended, and that the per-entity deploy-verify step never actually asserts anything. |
| `security-auditor.md` | No live secrets found. Finds score-change approval is unverifiable from outside the room, the independence audit is dead and partly a false positive, the Score-Watch fulfillment host is unreachable, and several medium-severity Worker/edge issues (forgeable webhook, stored HTML injection, missing HSTS/CSP). |
| `ux-designer.md` | Finds entity-page and floor-designation UX is strong, but `/ai-models` and `/ai-evaluation-suite` have zero cross-links in either direction, and on-site search has no alias support for renamed entities (Cape Verde, DR Congo). |

### Corrections applied (C1–C20)

All twenty coordinator-verified corrections supplied on 2026-09-14 were applied throughout this document, overriding any conflicting figure or claim in the underlying review files. In summary: C1 (placeholder-share mispairing corrected — 820/1,329, 61.7%, today), C2 (test-entity-records now passes, still unwired from CI), C3 (today's scan-count mismatch is a structural-fix artifact, not a defect), C4 (`/ai-evaluation-suite` is functional; overclaiming copy remains), C5 (`research/alert-deliveries/` does not exist), C6 (compassionbench.com verified live and ranking models), C7 (formula behavior and the false "balanced beats spiky" claim verified against `scoring.mjs`), C8 (band-boundary inconsistency at exactly 60.0 confirmed), C9 (D-30 nuance: human-scored BYO runs do compute a composite), C10 (nightly pipeline has never demonstrably run unattended), C11 (auto-deploy recovered; RISK-004/D-09 are stale), C12 (all waivers expire 2026-12-09, tied to unratified D-13), C13 (Score-Watch/badge fulfillment host is NXDOMAIN; fulfilment unverified), C14 (public Umami login live; HSTS/CSP absent), C15 (18 slug collisions plus 13 accented-slug mismatches, detailed), C16 (today's research cycle, Hong Kong application, duplicate-country merges, DRC rename and Phoenix slug fix — deployed and verified live on 2026-09-14), C17 (trailing-slash 404 chain), C18 (`/cite` broken URL pattern), C19 (four factual errors caught only by coordinator review), C20 (the Hong Kong approval was an explicit written founder instruction in the coordinator session, recorded into the proposal JSON by the coordinator; nothing in the repository can mechanically verify that provenance).
