# Observability

What is actually watched in this repository, what each check actually proves, what is not
watched at all, and what would catch each known failure class. Adapted in structure from the 6S
Success operating system; populated entirely from this repo's own checks and incidents. See
`docs/OPERATING_SYSTEM_ADAPTATION.md` and `INCIDENTS.md`.

---

## 1. What exists now

All figures below were run live against the current working tree while writing this document,
not copied from a stale report.

| Check | Command | Result observed | What it actually proves |
|---|---|---|---|
| `validate-indexes.mjs` | `node site/scripts/validate-indexes.mjs` | **85,477 checks passed, 0 errors, 65 warnings** | Every published index entity has internally consistent composite/rank/band arithmetic, cross-checks the scoring formula, and flags (as warnings, not errors) drift, boundary proximity, and cross-index slug collisions. Does **not** prove the underlying score is *correct* — only that it is *internally consistent*. |
| `test-entity-records.mjs` | `node site/scripts/test-entity-records.mjs` | **19,702 tests passed, 0 failed** | Composite invariance and full determinism (subdimensions → dimensions → composite) hold across the entity-record corpus, including all 29 whitelisted `ASSESSOR_OVERRIDE_NAMES`. Proves the scoring math is reproducible, not that the inputs are current. |
| `validate-daily-briefings.mjs` | `node site/scripts/validate-daily-briefings.mjs` | **PASS — 76 of 76 briefings validated** | Every published daily briefing JSON is structurally valid and matches its expected schema. Does not check the briefing's prose against the underlying data. |
| `lint-daily-briefings.mjs` | `node site/scripts/lint-daily-briefings.mjs` | **PASS — 78 files clean, 0 forbidden phrases/status/pipeline keys** | No briefing leaks internal pipeline vocabulary or forbidden status language into public-facing text. A wording gate, not a factual one. |
| `validate-rotation-state.mjs` | `node research/scripts/validate-rotation-state.mjs` | **24 blocking failures** (current, live) | Cross-checks every entity's claimed `last_assessed` date against a real report file on disk. Currently the lowest recorded failure count for this check (down from a differently-sourced 93 on 2026-07-31, per commit `afc2fa62`). The 24 remaining are pre-existing phantoms, not the INC-003 apply-date corruption, which is repaired. |
| `validate-scan.mjs` | `node research/scripts/validate-scan.mjs <date>` | Gate for nightly scanner output | Catches under-coverage self-reported as success, evidence silently overwritten by placeholders, inferred (not verified) evidence dates, and declared-vs-actual tier-count mismatches — each added after a specific confirmed failure (see the script's own header comment and INC-006). Exit 1 blocks promotion to the assessor stage; this is a hard gate, not a warning. |
| Freshness assertion (deploy) | Step in `.github/workflows/deploy.yml` (added 2026-08-19) | Compares `manifest.json .latest` against live `/updates/feed.json` | The **only** check in this repository that proves a deploy actually landed new content, as opposed to a container merely restarting successfully. Added directly in response to INC-002. |

---

## 2. The health-check trap

**Liveness is not currency.** A status-code probe (`curl -o /dev/null -w "%{http_code}"`) proves
a server process is answering requests. It proves nothing about whether the content behind that
process is the content you just shipped.

This repository's deploy pipeline ran four such probes for weeks — homepage 200, `/updates` 200,
`index.json` non-trivial size, one sample score file served — and **every one of them passed
against a stale container** for three days (INC-002), because the site is a static export baked
into the Docker image at build time. `docker compose up -d --build` reusing a cached layer
produces a perfectly healthy, perfectly wrong container.

**The only thing that proves a deploy landed is a data assertion against a value you know
changed in this release** — comparing a specific score, or (as implemented) the latest briefing
date, against what the live host actually serves. This is now codified as the freshness
assertion in `deploy.yml` and as the mandatory final step in `.claude/agents/vps-docker-manager.md`'s
deploy sequence ("Skipping step 6 is the failure this agent exists to prevent").

**Generalize the distinction:** every check in section 1 above is a *liveness/consistency* check
— it proves something is internally well-formed. Only the freshness assertion is a *currency*
check — it proves the well-formed thing is also the current thing. A repository can pass every
check in section 1 and still be INC-002.

---

## 3. Known blind spots

Each row below is tied to a real, dated incident — not a hypothetical.

| Blind spot | Nothing currently catches this | Tied to |
|---|---|---|
| **CI failure is silent.** No alert, email, or notification fires when a GitHub Actions workflow fails. A red run sits in the Actions tab until someone looks. | 25+ consecutive `Deploy to VPS` failures went unnoticed for a month. | INC-001 |
| **No production-vs-`main` drift check outside a deploy run.** If a deploy silently fails to refresh data (INC-002's exact mechanism) and nobody manually `curl`s a known value, there is no scheduled, deploy-independent check that would ever surface it. | Uganda/Cerebras served stale for 3 days across 6 pushes. | INC-002 |
| **No queue-count self-check.** `PENDING_CHANGES.md`'s stated total can silently diverge from the actual count of `status: "pending"` files in `research/change-proposals/`, because proposals can enter the directory by a path the digest never observes. | Stated queue of 8 vs. true queue of 72 — a 64-proposal undercount, hiding every pending band correction in two indexes. | INC-005 |
| **No entity-currency check.** Nothing in the validation suite checks whether a published entity is still an operating company, still independently incorporated, or still uniquely represented (not duplicated across or within an index). | **12 entity-currency defects found**, spanning: a defunct company (Rethink Robotics) published as "Established" 11 months after it ceased operations (assessed 2026-08-16 against a 2025-09-16 closure date); two within-index duplicate pairs (Boston Dynamics listed twice 45.3 points apart; 1X Technologies/Halodi Robotics — the same company renamed — listed twice 18.9 points apart); five cross-index double-publications (e.g., Amazon at 12.8 in fortune-500 vs. Amazon AWS AI at 35.9 in ai-labs, a 23.1-point gap for the same parent company); two unresolved corporate-status questions (Adept AI, Inflection AI — both substantially absorbed by acquirers); and a country listed twice under two spellings (Sao Tome and Principe / São Tomé and Príncipe). See `research/INDEX_EXPANSION_SCOPE_2026-08-20.md` §1.1–1.2 and `research/assessments/rethink-robotics-2026-08-16.md`. | New finding, no prior incident |
| **No manifest-pointer consistency check.** Three files independently track "the latest published date" (`manifest.json .latest`, `updates/latest.json .date`, `updates/daily/latest.json .date`); nothing asserts they agree. | Reported divergence on 2026-08-20 (not independently re-traced to a changelog entry; see `INCIDENTS.md` INC-007). | INC-007 |
| **No scheduled-run alert for the nightly research pipeline itself failing outright** (as opposed to a scan failing its own quality gate, which `validate-scan.mjs` does catch). A completely silent nightly failure (crash before any output) has no distinct alarm from "ran clean, nothing found." | Not yet observed as a distinct incident; flagged here as an inference from INC-001's pattern (silent failure of an automated process is this repo's dominant observability gap). | Inferred, not incident-confirmed |

---

## 4. Proposed checks (not yet built — marked explicitly as proposed)

These are recommendations, not commitments. None of the following exists in the codebase today.

1. **Queue-count assertion in the validation gate.** Add a check (candidate location:
   `validate-indexes.mjs` or a new `validate-pending-queue.mjs`) that counts
   `research/change-proposals/*.json` files with `status: "pending"` and fails loudly if
   `PENDING_CHANGES.md`'s most recent stated total disagrees. Directly closes the INC-005 gap.
2. **Scheduled production-vs-`main` freshness probe, independent of deploys.** A cron-triggered
   (not push-triggered) GitHub Action that runs the same freshness assertion currently embedded
   in `deploy.yml`, on a schedule (e.g., every few hours), so drift is caught even if no deploy
   has run recently or a deploy's own verify step was itself skipped or misconfigured.
3. **CI-failure notification.** Any mechanism — GitHub's built-in email-on-failure (verify it is
   enabled; it is not workflow-visible from within this repo), a Slack/webhook step in the
   workflow, or a scheduled `gh run list --status failure` check — so a red run is seen within
   hours, not audited into visibility a month later.
4. **Entity-currency check.** A periodic (not necessarily automated at first — a scoped audit
   pass would do) sweep that checks whether published entities are still operating, still
   uniquely represented, and still correctly named, extending the method already used manually in
   `research/INDEX_EXPANSION_SCOPE_2026-08-20.md`.
5. **Manifest-pointer consistency check.** Assert `manifest.json .latest`,
   `updates/latest.json .date`, and `updates/daily/latest.json .date` agree, ideally at build
   time so a mismatch fails the Next.js build rather than shipping.

None of these should be read as urgent relative to INC-001 (the deploy pipeline itself, which
remains open pending founder action on the SSH key). They are ordered roughly by cost to build,
not by importance.
