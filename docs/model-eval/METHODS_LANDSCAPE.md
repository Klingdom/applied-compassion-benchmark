# Methods landscape for Model Testing v2 (research date 2026-10-22)

**Provenance:** competitive-researcher agent, D-60 Phase 1. The coordinator saved the report as returned. The agent
says it opened every URL below in its session. Most arXiv pages gave the abstract and metadata only, and each finding
says so where that limits the claim. **The coordinator has not re-opened these sources (V2 pending).** Treat each
finding as a lead to verify before any of it enters a protocol or a public page.

§ refers to sections of `docs/MODEL_TESTING_V2_PROPOSAL.md`. "Gate n" is its §4 list; "Item n" is its §6 build plan.

---

## 1. LLM-as-judge reliability

**F1.1 Self-preference is measured, and partly causal.**
- Judges score their own outputs higher than other models' outputs, while human raters rate them as equal. Judges can
  recognise their own text out of the box, and self-preference tracks self-recognition (Panickssery, Bowman, Feng).
  https://arxiv.org/abs/2404.13076 (2024-04-15; abstract only).
- Wataoka et al. link GPT-4's self-preference to a preference for lower-perplexity text.
  https://arxiv.org/abs/2410.21819 (v2 2025-06-21; abstract only).
- *Implication:* this supports the cross-family panel (§3 stage 5, Item 5). Excluding the subject's family is
  necessary but not sufficient, so report the Gate 4 signed Claude-minus-non-Claude difference **per subject**.

**F1.2 Panels of judges from different families reduce intra-model bias.**
- PoLL (Verga et al.): a panel from disjoint families beat a single large judge on six datasets, at more than 7 times
  lower cost. https://arxiv.org/abs/2404.18796 (2024-04-29; abstract only).
- *Implication:* supports 3 families with 2 non-self judges per reply, and mid-size judges rather than frontier ones.
- No claim about how PoLL compares with human ratings was verified.

**F1.3 The named biases are position, verbosity and self-enhancement.**
- MT-Bench / Arena (Zheng et al.): strong judges agree with humans more than 80% of the time, about the same as humans
  agree with each other. https://arxiv.org/abs/2306.05685 (v4 2023-12-24; abstract only).
- *Implication:* shuffle the entry order of the 16-item batch per judge, and report a rating-vs-position check in the
  wave file.

**F1.4 Length bias: the standard fix is a statistical adjustment.**
- Length-controlled AlpacaEval raised its Spearman correlation with Arena from 0.94 to 0.98.
  https://arxiv.org/abs/2404.04475 (v2 2025-03-10).
- Arena's style control. https://arena.ai/blog/style-control/ (2024-08-29, updated 2025-06-13).
- *Implication:* the instruction "length is not a criterion" is not a control. Add a length-adjusted composite for
  reporting only, shown beside the unadjusted one, and treat a large gap as a Gate 4 style flag. Pilot-3 arm B is
  already a natural test of this.

**F1.5 Percent agreement is not enough.**
- Judges with high percent agreement can still give "vastly different scores" ("Judging the Judges").
  https://arxiv.org/abs/2406.12624 (v6 2025-08-18; abstract only).
- *Implication:* add a chance-corrected ordinal statistic (weighted kappa or Krippendorff's alpha) and the mean signed
  difference between judges. **Which variant to use is UNVERIFIED and is a methodology decision.**

## 2. Contamination and held-out pools

**F2.1 Fresh, matched held-out sets expose memorisation.**
- On GSM1k, leading models scored up to 8 points lower than on the matching public set.
  https://arxiv.org/abs/2405.00332 (v4 2024-11-22).
- *Implication:* build a small held-back matched item set and report each subject's public-vs-held-back gap. The plan
  needs a rule for who writes these items and where they are stored.

**F2.2 Official benchmarks keep part of the pool secret and hold reserves.**
- MLCommons AILuminate v1.0 makes 10% of its practice set public, keeps its official set confidential, and swaps in
  reserve prompts. https://arxiv.org/html/2503.05731 (v2 2025-04-18; Sections 4.1, 5.2, 7, 10; the agent read the
  first 100,000 of about 128,700 characters).
- *Implication:* propose three tiers: public practice, private official, and reserve.
  - Hosted calls must not see private items unless no-retention is verified for that provider (UNVERIFIED per provider).
  - A retirement rule would be ours to write.

**F2.3 Designs that limit contamination have a cost.**
- LiveBench refreshes its questions monthly, which works because its answers are objectively checkable.
  https://arxiv.org/abs/2406.19314 (ICLR 2025; abstract only).
- *Implication:* refresh at the reserve tier only, and tie every swap to a bank version bump.

**F2.4 Selective testing distorts a leaderboard.**
- "Leaderboard Illusion": 27 private variants of one provider's model were tested before release, and data access was
  uneven. https://arxiv.org/abs/2504.20879 (v2 2025-05-12; abstract only).
- *Implication:* every planned subject appears in the published wave file even if it failed or was unstable. No
  silent drops (Gates 1, 2 and 6).

## 3. Run-to-run variance and trials

**F3.1 "Deterministic" settings are not deterministic.**
- Accuracy varied by up to 15% across 10 runs. https://arxiv.org/abs/2408.04667 (v5 2025-04-02; abstract only).
- *Implication:* add a judge test-retest on a seeded 5–10% sample, reporting the exact-repeat rate and the mean
  absolute difference. The 48-rating bridge measures drift between waves, not repeatability within one.

**F3.2 Resampling reduces only the within-question part of variance.**
- With binary items, K=2 trials cut that part by 1/3, K=4 by 1/2, and K=6 by 5/9, up to a limit of 2/3. Compute
  standard errors over question-level means. https://arxiv.org/html/2411.00640 (Sections 3.1–3.3).
- *Implication:* with 83 items and 3 trials, the item pool dominates, so spend extra budget on items before trials.
  **The bootstrap must resample items.**
  - README limit 1 says the current scorer treats the two judges' ratings of one response as independent trials, so its
    intervals are too narrow.
  - **The coordinator must verify this against `research/model-runs/lib/paired-bootstrap.mjs` and the scorer before
    acting on it.**

**F3.3 Clustered and paired standard errors.**
- Clustered standard errors came out up to about 3 times the naive ones, and paired differences reduce variance (same
  source, Sections 2.2 and 4.2).
- *Implication:* report the number of clusters next to the number of items.

**F3.4 Power.**
- Detecting a 3-point difference in binary accuracy needed about 969 questions at 80% power (same source, Section 5).
- *Implication:* compute the minimum detectable difference from pilot-3's per-item variance, and state it in the v2
  preregistration. **Not computed here.**

## 4. Human validation, inter-rater reliability, annotator welfare

**F4.1 Validate the judge against humans on the target distribution.**
- IatroBench (pre-registered): the judge agreed with physicians about as well as physicians agree with each other, but
  scored zero in 86.6% of the cases flagged for omission harm. https://arxiv.org/abs/2604.07709 (v6 2026-09-30;
  abstract only).
- *Implication:* draw a stratified human validation sample, including cases where judge families disagree, and report
  human–human and human–judge agreement. **The sample size is UNVERIFIED.**

**F4.2 Chance-corrected agreement and score-level gaps both matter.**
- See F1.5. Pre-register the agreement statistic and the failure rule.
- A reported 2026 example (arXiv 2608.09942) was not opened and is UNVERIFIED.

**F4.3 Annotator exposure to distressing content.**
- There is no standard workflow for disclosing well-being risks to annotators. https://arxiv.org/abs/2505.24246
  (v4 2026-03-31; abstract only).
- The Partnership on AI Responsible Data Enrichment guidelines include a living wage, piloting, training and
  communication. https://partnershiponai.org/responsible-sourcing-library/ (undated; about 2024 is UNVERIFIED).
- *Implication:* content warnings and consent up front, the right to skip any item without penalty, time-boxed
  sessions, opt-in before any withheld item is shown, and paid raters, with the cost in the ledger. **Session caps are
  UNVERIFIED; seek clinical or counsel input.**

## 5. Preregistration, versioning, uncertainty

**F5.1 Preregister against models not yet released.**
- Thomas, Gligoric and Shah: registering the plan and the eligible future models blocked p-hack transfer in 73.9% and
  72.7% of cases. https://arxiv.org/abs/2606.27687 (2026-06-26; abstract only).
- *Implication:* lock the queue entry and the analysis plan before the model is observed, label any unplanned analysis
  as exploratory, and keep the D<n> deviations table.

**F5.2 AILuminate's versioning and uncertainty rules.**
- Results from deprecated versions are obsolete. Evaluator error is the largest source of uncertainty, and an error band
  can span several grades. Section 10 / Section 7 of the same source as F2.2.
- *Implication:* a protocol bump makes older waves "superseded, not comparable", and error bands include judge error.

**F5.3 HELM and Inspect as logging models.**
- HELM documents per-version re-run recipes. https://crfm-helm.readthedocs.io/en/latest/reproducing_leaderboards/
- Inspect's eval logs store task, model, config, samples, scores and token stats.
  https://inspect.aisi.org.uk/eval-logs.html
- Inspect's `--epochs` with reducers, and a `--seed` that only some providers honour.
  https://inspect.aisi.org.uk/options.html (all three pages undated).
- *Implication:* store the bank version and git revision in the wave file, and publish a re-run recipe for each
  protocol version.

**F5.4 Arena reports with statistical models; the critique is about process.**
- https://arxiv.org/abs/2403.04132 (2024-03-07). The bootstrap details are UNVERIFIED.
- *Implication:* publish the interval method and the number of items and clusters beside any range.

---

## Suggested v2 additions
1. Gate 4: weighted kappa or alpha; a per-subject signed cross-family difference; a length-adjusted composite flag.
2. Cluster the bootstrap by item, and state the minimum detectable difference from pilot-3.
3. Judge test-retest on a seeded 5–10% sample.
4. Bank tiers (public practice, private official, reserve), plus a held-back matched set.
5. A human validation protocol with welfare rules and paid raters.
6. Lock future-model eligibility and the analysis plan in the preregistration.
7. Wave-file fields: protocol version, bank sha, panel id, superseded status, re-run recipe.

## Not verified (do not cite)
- PoLL's agreement with humans.
- Which kappa or alpha variant to use.
- HELM's raw-output release.
- How Inspect combines multiple graders, and its clustered standard errors.
- Arena's bootstrap details.
- The AILuminate text after character 100,000.
- Annotator session caps.
- Hosted-provider prices, seeds and retention terms.
- Abstract-only 2026 items: 2606.27687 and 2604.07709.
