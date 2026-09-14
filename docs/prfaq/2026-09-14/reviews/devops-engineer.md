# DevOps Engineer Review — Reliability, Scheduling, Deployment & Operations

Scope: CB-MODEL (AI model benchmarking program) and the continuous research & scoring pipeline.
Read-only review. No SSH, no workflow dispatch, no deploys, no writes outside this file.

---

## 1. Scope + commands run

Read-only evidence gathering only. Commands actually executed:

- `git log --oneline -20 -- .github/workflows/deploy.yml`
- Read `.github/workflows/deploy.yml` in full
- `gh run list --workflow=deploy.yml --limit 20`
- `gh run view 34638653783 --json jobs -q '.jobs[] | {name, conclusion}'`
- `gh run list --workflow=deploy.yml --limit 3 --json databaseId,conclusion,status,createdAt`
- Read `research/SCHEDULING.md`, `docs/VPS_SCHEDULING.md`, `scripts/vps-bootstrap.sh`, `scripts/nightly-pipeline.sh` (header), `research/run-pipeline.sh` (grepped for budget/search preflight — none found)
- Read `RISKS.md`, `DECISIONS.md` (D-09, D-30 excerpts), `OBSERVABILITY.md`, `DISASTER-RECOVERY.md`, `.benchmark-ops/BLOCKERS.md`, `.benchmark-ops/COST_LEDGER.md`
- `git log --format='%ad %an %s' --date=iso -i --grep="vps"`
- `git log --format='%an <%ae>' | sort | uniq -c` (author distribution)
- `git log --format='%ad' --date=format:'%H' | sort | uniq -c` (commit-hour distribution, all history)
- `git log --format='%ad' --date=iso-strict | grep -oE '[+-][0-9]{2}:[0-9]{2}$' | sort | uniq -c` (timezone-offset distribution)
- `git log --oneline -i --grep="^Nightly research"` and timestamped variant
- `git show --stat` on the INC-008 commit
- `git log --oneline -- research/logs` (no history — path is gitignored and never committed)
- `git log --oneline -- scripts/vps-bootstrap.sh`
- `curl` against the live site: homepage, `/updates`, `/data/index.json`, a nonexistent path (404 behavior), `/updates/feed.json`, a Worker badge endpoint
- `node -p` against the local (uncommitted working-tree) `manifest.json` vs. the live `feed.json`'s latest `date_published`
- `git rev-parse --abbrev-ref HEAD`, `git log HEAD..origin/main`, `git diff --stat origin/main HEAD` for the four ops files above (branch divergence check — confirmed negligible: 1 commit ahead, one `RISKS.md` line)
- `ls .github/workflows/`, `git status --short | grep bak`

No web searches, no SSH, no builds, no writes to any tracked file other than this report.

---

## 2. What works

- **The build+test→deploy→verify pipeline is currently green.** `gh run list` shows 7 consecutive
  successes from 2026-09-09 onward, following two fixed root causes: Node 20→24 pin (unblocked
  every deploy from 2026-07-19) and — per `RISKS.md` RISK-004 / `DECISIONS.md` D-09 — a since-resolved
  `VPS_SSH_KEY` failure. The 09-11 run (`Ratify D-30...`) shows all three jobs (`Build + test`, `Deploy
  to VPS`, `Post-deploy health check`) green.
- **The freshness assertion is a real, non-trivial safeguard, not decoration.** It compares the
  commit's expected latest-briefing date against what `/updates/feed.json` actually serves on the
  live host, specifically to catch the class of failure documented in INC-002 (a cached Docker layer
  producing a healthy-looking but stale container). This is the one check in the pipeline that
  proves *currency*, not just *liveness* — correctly self-described as such in `OBSERVABILITY.md` §2.
- **Rollback path is documented and specific, including what it does *not* fix.**
  `DISASTER-RECOVERY.md` §4–5 correctly separates "roll back the container" (infra) from "a bad
  score is still sitting in `main`" (data) — a distinction many teams get wrong, and one that
  matters directly for a benchmark whose product *is* the published numbers.
- **Test/build gate before deploy is real.** `npm test` (80 cases) and `npm run build` (which
  chains `lint:briefings` and `validate-indexes`) run on the GitHub Actions runner before the SSH
  step, so a broken build cannot reach the VPS.
- **Secrets discipline for CB-MODEL is unusually rigorous for a pre-launch program.** `BLK-002`
  states a verified `grep` across the repo for API-key patterns (`ANTHROPIC_API_KEY`,
  `OPENAI_API_KEY`, `api.anthropic.com`, etc.) returns zero hits, and explicitly assigns spend
  and credential decisions to the founder, not an agent. `COST_LEDGER.md` is honest about being
  empty rather than backfilling a plausible-looking estimate.
- **Known failure modes are written down with real dates and deltas, not hand-waved.**
  `OBSERVABILITY.md` §3 and `RISKS.md` name specific incidents (INC-001, INC-002, INC-005, INC-007,
  INC-008) with concrete numbers (Uganda 20.3 vs. 11.9, an 8-vs-64-proposal undercount). This is a
  genuinely good practice — most of what follows in §3 below is a gap analysis *of a team that
  already tracks its own gaps*, not one that's blind to them.

---

## 3. Findings

### F-DEVOPS-1 (High) — The per-entity "freshness" check in `verify` doesn't assert anything
**System:** `.github/workflows/deploy.yml`, `verify` job, step `"Per-entity score file is served
(sample: slovakia)"`.
**Evidence:** Lines 167–176 of `deploy.yml` fetch `data/scores/slovakia.json`, extract `composite`
and `updatedAt` with `grep -oP`, and `echo` them. There is no comparison against an expected value
and no `exit 1` path if the printed values don't match what this commit publishes. Contrast with the
freshness-assertion step immediately below it, which does compare and does fail.
**Consequence:** This directly answers the task's question — *does verify detect stale scores, not
just stale briefings?* **No, only indirectly.** The freshness assertion is keyed to the *daily
briefing* date (`manifest.json .latest` vs. `feed.json`'s first item). Any commit that changes a
score **without** touching the briefing pipeline — a `score-updater` run applying an approved
`change-proposals/*.json` entry outside the nightly digest cycle, which `docs/VPS_SCHEDULING.md`
itself documents as a separate manual step ("Apply: `claude --agent score-updater`... Rebuild...
Commit + push") — would not move `manifest.json .latest`. If that specific deploy hit a cached
Docker layer (the exact INC-002 mechanism), the freshness assertion would still pass (old briefing
date matches old briefing date) while the sample-score step prints numbers nobody checks. This is
the same trap INC-002 already demonstrated, still open for the score-only path.

### F-DEVOPS-2 (High) — No evidence the VPS nightly cron pipeline has ever run unattended
**System:** `research/SCHEDULING.md`, `docs/VPS_SCHEDULING.md`, `scripts/vps-bootstrap.sh`, git history.
**Evidence:**
- Commit-hour histogram across the entire repo's history (398 commits) has **zero commits in hours
  02, 03, 04, or 05** — the exact window the pipeline is documented to run in (`02:00 git pull` →
  `04:36 git commit + push`, per `docs/VPS_SCHEDULING.md` §"What happens each night").
- Timezone-offset histogram: **100% of commits (398/398) carry `-06:00`**, Phil's local offset. If
  even one unattended VPS-cron commit had landed with the VPS's own timezone/identity (the bootstrap
  script sets `vps@compassionbenchmark.com` / `Compassion Benchmark VPS` specifically for this), a
  different offset or author would show up. It doesn't.
- Author distribution: 100% of commits are `Phil Kling` / `Philip Kling <philklingmbb@gmail.com>` —
  no commit from the VPS identity `vps@compassionbenchmark.com` that `vps-bootstrap.sh` step 6 is
  designed to create.
- "Nightly research" commit timestamps are irregular and daytime/evening in Phil's timezone (e.g.
  `2026-09-14 10:43 -0600`, `2026-08-31 14:08 -0600`, `2026-08-05 09:23 -0600`), not clustered at
  ~04:36. The most recent one is explicitly self-described as a catch-up: *"catch-up closes the
  09-02→09-13 gap; 19 assessed, 1 proposal"* — an 11-day gap on a pipeline documented as Mon–Sat.
- `research/logs/` (where `vps-bootstrap.sh` and `docs/VPS_SCHEDULING.md` say cron output and
  `last-run-status.txt` land) has never been committed — expected, since it's gitignored — but
  there is also no other artifact in this repo (webhook receipt, `LAST_SUCCESSFUL_RUN.json` entry
  tied to a cron run, etc.) that independently confirms the crontab was ever installed or has ever
  fired. This is not provable false from inside the repo, but the available evidence points the same
  direction the task brief already flagged: cadence collapsed after 07-31 into manual catch-ups.
**Consequence:** The documented "autonomous, runs when the computer is off" pipeline should be
treated as **unverified, likely not running**, not as a working system with an occasional gap. This
matters directly for the PR/FAQ: a claim of nightly automated coverage is not currently substantiable
from repo evidence.

### F-DEVOPS-3 (High) — Governance docs assert a broken deploy pipeline that has, in fact, recovered
**System:** `RISKS.md` RISK-004, `DECISIONS.md` D-09, `OBSERVABILITY.md` §4 note.
**Evidence:** RISK-004 states *"every publication to production currently depends on a manual SSH
deploy step, since the... workflow fails at SSH authentication... 25+ consecutive workflow runs
never succeeded"* and assigns the SSH-key fix to *"founder action... cannot be resolved by an
agent."* D-09 similarly states *"Publication... is a manual SSH... step. Automated deploy is not
depended on."* Live `gh run list` evidence: the failure streak did happen (`33661807551` through
`34368906894`, 2026-09-02 → 09-09, all `failure`) but **the deploy job has succeeded 7 times in a row
since `34401139222` on 2026-09-09**, with the SSH step passing. This confirms the shared-context
note that RISK-004/D-09 are stale.
**Consequence:** This is a documentation-drift risk in its own right, independent of which direction
it's wrong in. An operator or agent relying on `RISKS.md`/`DECISIONS.md` today would either (a)
needlessly keep doing manual SSH deploys, defeating the point of having fixed the pipeline, or (b) in
the opposite failure mode, trust "auto-deploy works" for a scenario nobody has actually re-verified
(e.g., the score-only path in F-DEVOPS-1). Neither file states *when* or *whether* it was
last checked against `gh run list`.

### F-DEVOPS-4 (Medium) — Live, reproducible scheme inconsistency on 404s
**System:** Nginx config serving `compassionbenchmark.com`.
**Evidence:** `curl -sS -I https://compassionbenchmark.com/this-page-does-not-exist-xyz` returns
`HTTP/1.1 301 Moved Permanently` with `Location: http://compassionbenchmark.com/404` — **http, not
https**, on a request that arrived over https. Reproduced live on 2026-09-14.
**Consequence:** Confirmed, currently live. Downgrades a missing-page hit from HTTPS to HTTP,
which most browsers will then need to re-upgrade (HSTS-dependent) or, in stricter contexts, block/warn
on as mixed content. Root cause not isolated in this review per task scope (would require reading
`nginx.conf`/`nginx-ssl.conf`, which is in-scope reading but not chased further here since it's a
config-fix task for backend/DevOps to do outside this read-only review, not a finding this task
needs to resolve).

### F-DEVOPS-5 (Medium) — No search-budget preflight; the WebSearch cap can silently kill a nightly run mid-pipeline
**System:** `research/run-pipeline.sh`, `scripts/nightly-pipeline.sh`, INC-008.
**Evidence:** Neither script references `WebSearch`, `budget`, or any `MAX_` environment variable
(confirmed by grep — zero matches in `run-pipeline.sh`). INC-008 (documented in
`.benchmark-ops/BLOCKERS.md` BLK-001 and the `0f6854ad` commit) shows a session-wide cap of
2,000 WebSearch calls, shared across **every agent invoked in one session**, silently truncated
three consecutive scan attempts (2026-09-02, -03, -06) — one partway through Tier 2 with zero
warning until the cap was hit, one that produced zero output because the cap was already exhausted
at session start. The commit's own text: *"misdiagnosed twice before the shared external constraint
was identified."*
**Consequence:** A single long-running "one session runs scanner→assessor→digest sequentially"
execution model (as both `nightly-pipeline.sh` and Option A's `claude /schedule create` examples in
`research/SCHEDULING.md` imply) is structurally exposed to this cap with no preflight and no
graceful degradation — it fails mid-run, indistinguishably from a real error, rather than either
declining to start or budgeting itself against a known ceiling.

### F-DEVOPS-6 (Low) — Deploy notification / CI-failure alerting does not exist
**System:** `.github/workflows/deploy.yml`, GitHub Actions default settings.
**Evidence:** No Slack/Discord/email/webhook step anywhere in `deploy.yml`. `OBSERVABILITY.md` §3
names this directly: *"No alert, email, or notification fires when a GitHub Actions workflow fails.
A red run sits in the Actions tab until someone looks"* — and cites the 25+ failure streak
(2026-07-19 → 09-08) as the confirming incident, which this review's own `gh run list` reproduces.
Already flagged as a proposed fix in `OBSERVABILITY.md` §4 item 3, not yet built.
**Consequence:** Not a new finding — corroborating an already-known, already-documented gap with
independent evidence from this session. Included because it directly answers the task's "monitoring/
alerting of silent pipeline failure" prompt and because F-DEVOPS-2's cron uncertainty makes it
strictly worse (there is also no alert if the VPS cron *itself* never fires at all — a failure mode
one level upstream of "the workflow ran and failed").

### F-DEVOPS-7 (Low) — No secrets storage/rotation plan defined ahead of CB-MODEL's future model-API credentials
**System:** `.benchmark-ops/BLOCKERS.md` BLK-002, `.benchmark-ops/COST_LEDGER.md`.
**Evidence:** BLK-002 correctly blocks spend and credential provisioning on founder approval and
confirms zero API-key hits exist in the repo today. Neither BLK-002 nor `COST_LEDGER.md` nor any
`.benchmark-ops` file specifies *where* a future model-provider API key would live (GitHub Actions
secret vs. VPS `.bashrc`-style env var vs. a per-provider vault) or a rotation cadence, once BLK-002
clears. This repo has two recent, resolved-but-real secrets incidents in adjacent systems — F-01
(".env leak path at the repo root", HIGH, closed 2026-09-10) and F-04 ("redact secrets from Worker
admin alerts", closed 2026-09-11) per the git log — so the general pattern of secrets handling
needing explicit design, not assumption, is already established practice here.
**Consequence:** Low severity only because BLK-002 is not yet cleared and nothing is at risk today.
Flagging now, ahead of the decision, is cheaper than retrofitting a storage/rotation policy onto a
provisioned key later — and the repo's own two prior secrets incidents are the argument for doing it
before, not after.

---

## 4. Top 5 recommended improvements

### 1. Make the per-entity verify step actually assert, not just print
- **Type:** Reliability / CI fix
- **Problem:** F-DEVOPS-1 — the sample score-file check in `verify` fetches `composite`/`updatedAt`
  and echoes them but never compares against the value this commit is expected to publish, so a
  cached-layer deploy of a score-only change (bypassing the briefing-date proxy) would pass every
  check in the pipeline while serving stale numbers — the exact INC-002 mechanism, unclosed for this
  one path.
- **Expected benefit:** Closes the last known gap in "does a green deploy mean the live scores are
  current," for a benchmark whose entire product is the correctness of published scores.
- **Evidence:** `.github/workflows/deploy.yml` lines 167–176 (no assertion, no `exit 1`); INC-002
  (`OBSERVABILITY.md` §2) as the precedent this exact pattern already caused once.
- **Impact:** 5
- **Strategic alignment:** 5 (directly protects the core claim of the product — that published scores are current)
- **Learning value:** 2 (mechanical fix, not new information)
- **Confidence:** 5 (the gap is directly visible in the workflow file, not inferred)
- **Effort:** 2 (add one `if [ "$composite" != "$expected_composite" ]; then exit 1; fi`-style check, sourcing `expected` from the same JSON the score file was built from)
- **Risk:** 1 (additive check; worst case is a false-positive failure on the check itself, not a production risk)
- **Priority Score:** 5+5+2+5−2−1 = **14**

### 2. Get an honest, verified answer to "is the nightly pipeline actually running unattended," then either fix or re-document it
- **Type:** Operational-truth / scheduling
- **Problem:** F-DEVOPS-2 — no commit in this repo's history falls in the 02:00–05:00 window the
  pipeline is documented to run in, and 100% of commits carry the founder's personal git identity
  and timezone offset, not the VPS identity `vps-bootstrap.sh` is designed to create. The
  "autonomous, runs when the computer is off" claim in `research/SCHEDULING.md` is not currently
  substantiated by any artifact this review could read.
- **Expected benefit:** Either restores real unattended coverage (closing the 09-02→09-13-style
  gaps) or removes a false claim from internal docs and the PR/FAQ before it ships externally.
- **Evidence:** commit-hour histogram (0 commits at 02–05h across 398 commits); 100% `-06:00` offset;
  100% `Phil Kling`/`Philip Kling` authorship; the 09-14 commit's own text ("catch-up closes the
  09-02→09-13 gap").
- **Impact:** 5 (this is the core operational claim of the "continuous research pipeline" program)
- **Strategic alignment:** 5
- **Learning value:** 4 (requires someone to actually SSH in and check `crontab -l` / `last-run-status.txt` — a real diagnostic, not a doc fix)
- **Confidence:** 4 (strong circumstantial evidence; not provable to certainty without VPS access, which this review does not have)
- **Effort:** 3 (one SSH session to check state, then either re-run bootstrap or rewrite the scheduling docs to say "manual, run by the founder" — a founder/ops action, not purely an agent one)
- **Risk:** 2 (low risk to fix; the risk is in continuing to claim automation that isn't happening)
- **Priority Score:** 5+5+4+4−3−2 = **13**

### 3. Redesign nightly execution around the per-session search cap, with a preflight check
- **Type:** Reliability / scheduling architecture
- **Problem:** F-DEVOPS-5 — INC-008 shows the pipeline has no way to know it's about to run out of
  WebSearch budget until it silently stops mid-Tier-2, and the failure mode was misdiagnosed twice
  before the shared session-wide cap was identified as the cause.
- **Expected benefit:** A pipeline that fails fast and legibly ("budget exhausted, did not start")
  instead of failing silently partway through, and that structurally can't be starved by unrelated
  agent activity in the same session.
- **Evidence:** `.benchmark-ops/BLOCKERS.md` BLK-001; commit `0f6854ad` (INC-008) table showing three
  distinct partial-failure signatures across three attempts; `research/run-pipeline.sh` has zero
  references to budget/search caps.
- **Reliable execution model given the cap (recommendation, not yet built):** run each pipeline
  stage (scanner, assessor, digest) as its **own** Claude Code session rather than one 3-hour shared
  session, so the 2,000-call cap applies per stage, not across the whole run; add a preflight step
  at the top of `nightly-pipeline.sh` that checks remaining budget (or, absent an introspectable
  counter, tracks a local running total against the ~270-search-per-cycle figure `docs/
  VPS_SCHEDULING.md` already documents) and exits cleanly with a distinct "budget preflight failed"
  status in `last-run-status.txt` rather than starting and failing partway through.
- **Impact:** 4
- **Strategic alignment:** 4
- **Learning value:** 3
- **Confidence:** 4 (INC-008's root cause is already confirmed and documented, not speculative)
- **Effort:** 3 (script changes only; no new infrastructure)
- **Risk:** 2 (session-splitting could introduce new coordination issues between stages, e.g. stage 2 starting before stage 1's output is fully committed — needs a handoff contract, not just a cron-line split)
- **Priority Score:** 4+4+3+4−3−2 = **10**

### 4. Reconcile RISKS.md / DECISIONS.md against live `gh run list` state, and add a "last verified" field
- **Type:** Process / documentation hygiene
- **Problem:** F-DEVOPS-3 — RISK-004 and D-09 both assert the deploy pipeline is broken and manual;
  it has, in fact, succeeded 7 times in a row since 2026-09-09.
- **Expected benefit:** Prevents both failure directions: unnecessary manual deploys continuing out
  of habit, and (separately) misplaced confidence that "auto-deploy works" covers cases it doesn't
  (see recommendation 1 — the score-only path is still genuinely uncovered even though the pipeline
  as a whole is green again).
- **Evidence:** `gh run list --workflow=deploy.yml --limit 20` (7 consecutive successes from
  `34401139222` onward) vs. `RISKS.md` RISK-004 and `DECISIONS.md` D-09 text, both unmarked as stale.
- **Impact:** 3
- **Strategic alignment:** 3
- **Learning value:** 2
- **Confidence:** 5 (directly comparable evidence, no inference required)
- **Effort:** 1 (edit two files, add one field to the risk-register schema)
- **Risk:** 1
- **Priority Score:** 3+3+2+5−1−1 = **11**

### 5. Fix the HTTPS→HTTP 404 redirect, and pre-define secrets storage/rotation for CB-MODEL's future model-API credentials
- **Type:** Config fix (immediate) + secrets governance (forward-looking)
- **Problem:** F-DEVOPS-4 (live, reproducible scheme downgrade on every 404) and F-DEVOPS-7 (no
  defined storage location or rotation cadence for the model-provider API keys BLK-002 will
  eventually require, despite this repo having two recent secrets incidents in adjacent systems —
  F-01 and F-04 per git log).
- **Expected benefit:** Removes a live mixed-content redirect defect today; removes a foreseeable
  repeat of the F-01/F-04 pattern before real money and real provider credentials are involved in
  CB-MODEL, at effectively zero cost since BLK-002 hasn't cleared yet.
- **Evidence:** `curl -I https://compassionbenchmark.com/<missing-path>` → `Location:
  http://compassionbenchmark.com/404`, reproduced live 2026-09-14; `.benchmark-ops/BLOCKERS.md`
  BLK-002 and `COST_LEDGER.md` (no storage/rotation plan present); git log entries "Redact secrets
  from Worker admin alerts... (F-04)" and "Close a live .env leak path at the repo root (F-01,
  HIGH)".
- **Impact:** 2 (404 defect is minor traffic impact; secrets planning is preventive, not urgent yet)
- **Strategic alignment:** 3
- **Learning value:** 2
- **Confidence:** 4
- **Effort:** 2 (nginx config fix is small; a one-page secrets-storage decision doc is small)
- **Risk:** 1
- **Priority Score:** 2+3+2+4−2−1 = **8**

---

## 5. PR/FAQ inputs

### "How do you keep this running?"

Deploys go through a tested build (80 test cases, full static build with lint/validation gates)
before anything touches production, followed by an automated post-deploy check that specifically
verifies the live site is serving *this* release's content — not just that the server responds — by
comparing the newest published briefing date against what the live host actually returns. That
check exists because we hit a real failure mode once (a healthy-looking container quietly serving
three-day-old scores) and built a check that would have caught it. The research side runs a nightly
scan → assess → publish cycle with machine-checked gates at each handoff (schema validation, a
forbidden-language linter, a staleness cross-check against evidence on disk) before anything reaches
the public site. Where we currently fall short, we say so rather than paper over it: the
score-file-freshness check is not yet as complete as the briefing-freshness check (see FAQ below),
and we do not yet have independently verified evidence that the nightly research cycle runs
unattended every scheduled night, as opposed to being run manually in catch-up bursts — both are
active work items, not settled claims.

### Hard FAQ questions

**Q: Is the nightly research pipeline actually running unattended every scheduled night, as the
scheduling docs describe?**
A: Not verifiably, as of this review. No commit in this repository's history falls inside the
documented 02:00–05:00 execution window, and every commit — including every "nightly research"
commit — carries the founder's personal git identity and local timezone offset, not the distinct VPS
identity the bootstrap script is designed to create for unattended runs. The most recent nightly
commit describes itself as a catch-up closing an 11-day gap. The honest current state is: a pipeline
designed to run unattended, with no repo-internal evidence yet that it has.

**Q: Does a green deploy prove the live site is showing correct, current scores?**
A: For the briefing/updates feed, yes — a specific automated check compares the expected latest
briefing date against what the live site serves, and fails the deploy if they don't match. For a
change to a score that lands *outside* the nightly digest cycle (a manually applied, human-approved
correction), no — the pipeline's per-entity check currently prints the live values but does not
compare them against what the commit expected to publish, so that specific path could still serve a
stale cached build without the deploy failing.

**Q: What happens if the nightly deploy or research pipeline fails silently — who finds out, and
when?**
A: Today, nobody is notified automatically. A failed GitHub Actions run sits in the Actions tab until
a person looks; this is exactly what happened for over a month in mid-2026, when 25+ consecutive
deploy failures went unnoticed. The research pipeline has an equivalent risk one level up: if the
scheduled trigger itself never fires, there is currently no alert distinguishing "ran clean, found
nothing" from "never ran."

**Q: Do we have model API credentials, an approved budget, and a plan for how those secrets will be
stored, for the AI model benchmarking program?**
A: No credentials exist and no budget is approved — verified by a repo-wide search for common
provider API-key patterns returning zero hits. That is a deliberate, founder-owned gate, not an
oversight. What is not yet defined is *where* those credentials will live and how they'll be rotated
once the founder approves them; given this codebase has already had two real secrets-handling
incidents in adjacent systems this month, that plan should exist before the first key is issued, not
after.

**Q: If the VPS were lost tonight, how long would it take to get the site back up, and has that ever
been tested?**
A: There is a documented rebuild path (clone, `deploy.sh`, Docker multi-stage build, Let's Encrypt
provisioning), but it has never been executed as a drill. The disaster-recovery documentation says
this plainly: the first real recovery would be the first time this path has ever actually been run.
The Cloudflare Worker component is a fully separate recovery path with eleven secrets that are not
recoverable from git and would need to be re-obtained from three different external systems.

---

## Files referenced (read-only)

- `C:\Users\philk\applied-compassion-benchmark\.github\workflows\deploy.yml`
- `C:\Users\philk\applied-compassion-benchmark\research\SCHEDULING.md`
- `C:\Users\philk\applied-compassion-benchmark\docs\VPS_SCHEDULING.md`
- `C:\Users\philk\applied-compassion-benchmark\scripts\vps-bootstrap.sh`
- `C:\Users\philk\applied-compassion-benchmark\scripts\nightly-pipeline.sh`
- `C:\Users\philk\applied-compassion-benchmark\research\run-pipeline.sh`
- `C:\Users\philk\applied-compassion-benchmark\RISKS.md`
- `C:\Users\philk\applied-compassion-benchmark\DECISIONS.md`
- `C:\Users\philk\applied-compassion-benchmark\OBSERVABILITY.md`
- `C:\Users\philk\applied-compassion-benchmark\DISASTER-RECOVERY.md`
- `C:\Users\philk\applied-compassion-benchmark\.benchmark-ops\BLOCKERS.md`
- `C:\Users\philk\applied-compassion-benchmark\.benchmark-ops\COST_LEDGER.md`
