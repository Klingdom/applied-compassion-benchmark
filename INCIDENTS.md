# Incidents

Operational incident log for Compassion Benchmark. Newest first. Every entry traces to a
verifiable artifact in this repository (commit, script output, or dated research file). Where a
detail could not be independently re-verified, that is stated explicitly rather than presented as
confirmed.

Adapted in structure from the 6S Success incident-log pattern; populated entirely from this
repo's own history. See `docs/OPERATING_SYSTEM_ADAPTATION.md`.

---

## How to open an incident

An incident is any event where the system did something other than what an operator or a reader
of the public site would reasonably expect, **and** the cause was not immediately obvious from
the failing signal alone (i.e., it required investigation, not just a retry).

| Severity | Definition | Example |
|---|---|---|
| **Critical** | Publicly visible wrong data, or a total loss of the ability to ship a fix. | INC-002 (stale live scores), INC-001 (deploy never worked) |
| **High** | Internal data integrity compromised in a way that would eventually cause a Critical incident if undetected. | INC-003 (last_assessed corruption), INC-005 (queue undercount) |
| **Medium** | Work lost or a process failed, but caught before publication and without lasting data damage. | INC-004 (concurrent-study loss), INC-006 (scan quarantine) |
| **Low** | A record disagreed with itself; caught by routine checking; no downstream consequence found. | INC-007 (manifest pointer disagreement) |

Open an incident entry when: (a) wrong data reached `main` or production, (b) a pipeline stage
silently produced an incorrect artifact that another stage trusted, or (c) an automated gate
failed and the cause took more than a quick look to identify. Do not open one for an expected,
self-correcting condition (e.g., a single confirmed-at-published-value nightly cycle).

---

## Log

### INC-007 — Updates manifest disagreed with its own freshness pointers (2026-08-20, low, closed on inspection)

**Summary.** Three separate files each carry an independent "what is the latest briefing"
pointer: `site/src/data/updates/manifest.json` (`.latest`), `site/src/data/updates/latest.json`
(`.date`), and `site/src/data/updates/daily/latest.json` (`.date`). Nothing enforces that the
three agree; each is written by a different build/pipeline step.

**Detection.** Reported by the requester of this artifact set as a 2026-08-20 mismatch.
**Verification note:** as of this writing all three files agree (`2026-08-20`), so the specific
divergence event could not be independently reproduced from a changelog entry — no
`research/CHANGELOG.md` or `research/ITERATION_LOG.md` entry documents it directly. What **is**
independently verified is the structural defect: three redundant, independently-writable
pointers to the same fact is a real defect vector regardless of whether this specific instance
is fully re-traceable.

**Root cause.** Structural — no single source of truth for "latest published date"; the
freshness assertion added to `deploy.yml` (see INC-002) only compares `manifest.latest` against
the live `/updates/feed.json`, not against the other two files.

**Remediation.** Not yet implemented. Recommend one of the two `latest.json` files be derived
from the other at build time rather than independently written, or a build-time assertion that
all three agree (candidate addition to `site/scripts/validate-daily-briefings.mjs`).

**Status:** Open as a structural risk; the specific 2026-08-20 divergence is not blocking.

---

### INC-005 — Pending-queue count understated by 64 (opened 2026-08-18, corrected 2026-08-19, closed)

**Summary.** `research/PENDING_CHANGES.md`'s 2026-08-18 entry stated the pending queue was 8
and effectively empty entering the cycle. The true count was **72**.

**Detection.** Coordinator-level manual audit on 2026-08-19, logged directly in
`research/PENDING_CHANGES.md` under "2026-08-19 — QUEUE ACCOUNTING CORRECTION."

**Root cause.** Structural, not arithmetic. `PENDING_CHANGES.md` is written by the digest stage,
which only sees the nightly lineage (scanner → assessor → digest). Between 2026-08-16 and
2026-08-18 a separate calibration programme ran six seed-cluster de-seeding studies through
`benchmark-research` that wrote **64 proposals directly to `research/change-proposals/`**,
bypassing the digest entirely. The digest's arithmetic was correct for the lineage it can see;
the defect is that a proposal can enter the queue by a path that never updates the queue's own
log.

**True composition at correction (72 total):** 20 from the Sahel + 20.3 country de-seeding
studies (2026-08-16), 44 from the robotics + ai-labs de-seeding studies (2026-08-17), 8 from the
nightly cycle (2026-08-18).

**Impact.** Read literally on 2026-08-18, a reviewer would have missed 64 pending proposals,
including every band correction in the robotics and ai-labs indexes and 10 of 12 countries
de-seeded from the 20.3 cluster.

**Remediation.** (1) `research/change-proposals/*.json` with `status: "pending"` is now the
authoritative queue, not the digest's running total. (2) Any study filing proposals outside the
nightly lineage must append its own entry to the log. (3) **Proposed, not yet built:** a
queue-count assertion in the validation gate that fails loudly when the stated total disagrees
with a directory count. By 2026-08-20 the same manual-count discipline caught the true total
rising to 79 — verified directly by counting files, not by incrementing the prior stated figure.

**Evidence:** `research/PENDING_CHANGES.md`, "2026-08-19 — QUEUE ACCOUNTING CORRECTION" section.

---

### INC-004 — Two concurrent studies hit a transient API 529; one survived, one was lost (2026-08-18, closed)

**Summary.** Two `benchmark-research` agent runs terminated mid-run on the same transient
Anthropic API 529 (server overloaded) error. One run wrote its assessment, sidecar, and proposal
files incrementally per entity and survived with 7 of 7 assessments intact. The other batched
its writes to the end of the run and lost a full study.

**Verified.** The surviving run is independently confirmed at
`research/SEED_CLUSTER_AI_LABS_LOW_2026-08-17.md`, whose provenance note states explicitly:
*"the assessment run that produced these seven reports and sidecars terminated on a transient
server error (API 529) after all seven assessments, all seven sidecars and six of seven
proposals were written, but before this synthesis was authored"* — and every value was
re-verified afterward against `computeCompositeFromDimensions`.

**Not independently verifiable.** The companion "lost 14-entity study" left no artifact by
definition — a batched-write loss on API failure produces nothing to inspect after the fact.
This entry records it because it was reported as the reason the incremental-write requirement
now exists, but it cannot be confirmed against a committed file the way every other incident in
this log can. Treat the loss itself as reported, not independently re-derived.

**Root cause.** Write strategy. Batching all writes to the end of a long agent run means any
mid-run failure — API error, timeout, context exhaustion — loses everything, not just the
in-progress item.

**Remediation.** Incremental writes (write each assessment, sidecar, and proposal to disk as
soon as it is produced, not batched at run end) are now mandated in every study brief.

**Status:** Closed. No published score was affected either way (both studies fed the pending
queue, not applied scores).

---

### INC-003 — `last_assessed` corrupted by the apply stage (2026-08-16 → 2026-08-19, closed)

**Summary.** `score-updater` stamped the **apply date** into `research/rotation-state.json`'s
`last_assessed` field instead of preserving the true assessment date, for entities in the
2026-08-16 founder-override batch. This makes an entity look freshly assessed immediately after
a score change, which suppresses its rescan priority — the opposite of the intended effect,
since a just-applied score is exactly the kind of change a benchmark should want to re-verify
soonest.

**Scale.** The `research/scripts/reconcile-last-assessed.mjs` docstring records this precisely:
*"the 2026-08-16 founder override batch had score-updater stamp `last_assessed` with the APPLY
date rather than leaving the assessment date intact. Sixteen entities were affected."* A second,
opposite-direction defect compounded it: de-seeding studies run by `benchmark-research` are
deliberately barred from writing rotation-state (to avoid concurrent-write corruption with the
nightly pipeline), so entities they assessed kept an *older* date than their real newest report —
understating freshness for a different set of entities.

**Detection.** `research/scripts/validate-rotation-state.mjs`, which cross-checks every entity
with a non-null `last_assessed` against the assessment report actually on disk for that date and
fails on any claim with no backing file.

**Remediation.** `research/scripts/reconcile-last-assessed.mjs` repairs both directions by
reading the true newest report filename per slug and never synthesizing a date — an entity with
no report of any kind is left untouched as a pre-existing phantom for separate investigation
rather than guessed at. **Verified live in this session:** running
`node research/scripts/validate-rotation-state.mjs` currently reports **24 blocking failures**,
the lowest count on record for this check (a related, larger reconciliation on 2026-07-31,
commit `afc2fa62`, had brought a different failure population from 93 down to 31 — a separate
prior cleanup of the same class of defect, not this incident).

**Evidence:** `research/scripts/reconcile-last-assessed.mjs` (docstring + logic), live
`validate-rotation-state.mjs` output (24 failures at time of writing).

**Status:** Closed. `last_assessed` corruption for the 2026-08-16 batch is repaired; 24
unrelated pre-existing phantom entries remain open as a separate, lower-priority backlog item
(see `RISKS.md`).

---

### INC-002 — Live site served stale scores for three days (2026-08-16 → 2026-08-19, closed)

**Summary.** Production served Uganda at composite 20.3 while `main` had already moved it to
11.9, and Cerebras at 60.9 against a `main` value of 38.8, across six intervening pushes. **Every
health check the deploy workflow ran passed throughout**: homepage 200, `/updates` 200,
`index.json` present and non-trivially sized, and a per-entity score file (`slovakia.json`)
served successfully.

**Root cause.** The site is a static export baked into the Docker image at build time; score
JSON is not read at container runtime. If `docker compose up -d --build` reuses a cached Docker
layer, the container restarts, returns HTTP 200 everywhere, and serves stale data — every naive
health check is blind to this, because none of them assert on a value that is expected to have
changed.

**Remediation.** A freshness assertion was added to `.github/workflows/deploy.yml` on 2026-08-19
(commit `0c7a6118`, "Add freshness assertion to post-deploy health check"). It compares
`site/src/data/updates/manifest.json`'s `.latest` field — what *this commit* expects to
publish — against the `date_published` of the first item in the live
`https://compassionbenchmark.com/updates/feed.json`. A mismatch fails the workflow with an
explicit remedy: `docker compose build --no-cache web && docker compose up -d`.

**Detection.** Manual `curl` comparison, not any automated check (the automated checks were the
thing that failed to catch it).

**Evidence:** `.github/workflows/deploy.yml` lines 148–188 (the freshness-assertion step and its
comment block); `.claude/agents/vps-docker-manager.md` "The verification trap" section.

**Status:** Closed for this instance; the freshness assertion is now a permanent gate. See
`OBSERVABILITY.md` for the liveness-vs-currency distinction this incident established.

---

### INC-001 — Deploy pipeline never succeeded (2026-07-19 → open)

**Summary.** The `Deploy to VPS` GitHub Actions workflow failed **25+ consecutive runs**,
stretching back to 2026-07-19 — **zero successes in the workflow's entire recorded history**
until this audit.

**Two distinct causes in sequence:**

1. **Node version.** `site/scripts/test-entity-href.mjs` imports `src/lib/entityHref.ts` directly
   and relies on Node's native TypeScript type-stripping, which landed in Node 22 and is on by
   default from Node 23. The workflow ran Node 20, so `npm test` threw
   `ERR_UNKNOWN_FILE_EXTENSION` and died before the deploy job could even start. Fixed by pinning
   `actions/setup-node@v4` to `node-version: '24'` (see `.github/workflows/deploy.yml` lines
   32–43).
2. **SSH authentication.** Once tests passed, the failure moved downstream to
   `ssh: handshake failed: unable to authenticate` — an invalid `VPS_SSH_KEY` secret. **This
   cause is still open** as of this writing; it requires founder action (regenerating and
   re-authorizing a deploy key per `docs/SETUP_AUTO_DEPLOY.md`), which `github-manager` cannot do
   itself (it cannot read or set secrets).

**Detection.** Manual audit on 2026-08-19, not any alert — nothing in this repository notifies on
CI failure (see `OBSERVABILITY.md` blind spots).

**The lesson, recorded explicitly because it generalizes:** because the run list showed an
unbroken wall of red for weeks, the second bug looked identical to the first and went
undiagnosed. **A persistent red pipeline can be several distinct bugs in a queue, and the next
one will look exactly like the last one until you re-diagnose from the top.**

**Impact.** Every publication to `compassionbenchmark.com` since at least 2026-07-19 has
depended on a manual SSH deploy step (`docker compose up -d --build` run by hand), not the
automated pipeline `docs/SETUP_AUTO_DEPLOY.md` describes.

**Evidence:** `.github/workflows/deploy.yml` (Node-version comment block),
`.claude/agents/github-manager.md` "Why this agent exists" section (written 2026-08-19).

**Status:** Open. Root cause 1 (Node version) is fixed. Root cause 2 (SSH key) requires founder
action and is not resolvable from within the repository.

---

### INC-006 — Nightly scan output quarantined for failing `validate-scan.mjs` (2026-08-03, closed)

**Summary.** The 2026-08-03 nightly scan output failed `validate-scan.mjs` and was not promoted
into the assessor stage.

**Evidence.** Two quarantine files are present in the working tree (untracked, per `git status`
at the start of this work): `research/scans/superseded/2026-08-03.failed-validation.json` and
`research/scans/superseded/2026-08-03.evidence-reviews.failed-validation.json`. `validate-scan.mjs`'s
own header documents four distinct failure modes it was built to catch across its history
(under-coverage self-reported as success on 2026-07-20; a merge script silently overwriting real
evidence with placeholders the same night; inferred-not-verified evidence dates on 2026-07-24;
declared-vs-actual tier-count mismatch on 2026-07-30) — the gate that caught the 2026-08-03
failure is the same lineage of checks.

**Root cause.** Not independently re-diagnosed for this specific date in the material reviewed
for this artifact set; the file naming (`failed-validation`) and its presence in `superseded/`
confirms the gate fired and the run was correctly blocked from promotion, consistent with the
gate's documented purpose.

**Remediation.** None needed beyond what already exists — this is the gate working as designed.
Recorded here because a quarantine event that leaves no trace in a top-level log is itself a
minor observability gap (see `OBSERVABILITY.md`).

**Status:** Closed. The scan was correctly blocked; no bad data reached the assessor or index.
