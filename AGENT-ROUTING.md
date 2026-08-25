# Agent Routing

**Who owns what, who is canonical where two agents overlap, what may never run concurrently, and
when an agent must stop and report.**

Scope: 31 agent definitions in `.claude/agents/` (32 files including `CLAUDE.md`), plus 26
user-level definitions in `~/.claude/agents/`.

Adapted in structure from the 6S Success operating system; populated entirely from this repo's own
history. See `docs/OPERATING_SYSTEM_ADAPTATION.md`.

Related: `AUTONOMY.md` (execution authority) · `DECISIONS.md` · `INCIDENTS.md` · `OBSERVABILITY.md`.

---

## 0. Two rules that resolve most routing questions

**RT-1 — Project agents are canonical. User-level agents are not for this repo.** Every agent in
`~/.claude/agents/` other than the trading set is scoped, in its own `description`, to **6S Success**
— a household-organisation SaaS with rooms, micro-zones, quests and cards. Routing benchmark work
to `product-manager` (user-level), `qa-reviewer`, `devops-sre`, `analytics-intelligence`, `seo-aeo`,
`ux-frontend`, `security-auditor`, `software-engineer`, `content-editor`, `cro-growth`,
`commerce-manager` or `6s-ceo` imports a different product's model of the world. Where a name
collides (`product-manager`, `github-manager`, `vps-docker-manager`), the **project-level** file
wins — and for the latter two, the project versions are explicitly Compassion-Benchmark-specific.

**RT-2 — Only `score-updater` writes published data.** Every research agent produces proposals,
assessments, manifests and syntheses. None of them writes an index. See §5.

---

## 1. The nightly pipeline — the spine

`overnight-scanner` → `overnight-assessor` → `overnight-digest` → validation → **stop** →
(founder approval) → `score-updater`

The chain **does not run end to end**. It stops at the digest. `score-updater` is
"human-triggered only — never runs automatically" and "NEVER runs automatically" in its own spec.

| Stage | Reads | Writes | May NOT write | Gate before hand-off |
|---|---|---|---|---|
| **overnight-scanner** | `rotation-state.json`, web (≤14-day lookback) | `research/scans/YYYY-MM-DD.json`, evidence-review payload, `site/src/data/evidence-reviews/latest.json`, rotation-state `last_scanned` + `last_evidence_touch` | `last_assessed`, `last_change_proposal` (Step 8, absolute), any index | `validate-scan.mjs`; failures quarantined to `research/scans/superseded/*.failed-validation.json` (last fired 2026-08-03) |
| **overnight-assessor** | tonight's scan, `benchmark-research.md` methodology, `APPLIED_CHANGES.md` history, index composites | `research/assessments/<slug>-<date>.md` + `.subdims.json`, `research/change-proposals/<slug>.json` (`status: "pending"`), `research/scans/<date>-assessor-summary.json`, rotation-state `last_assessed` + `last_change_proposal` | rotation-state `composite`/`band`/`rank` (must mirror published), any index | §3e-bis anti-false-positive screening (5 checks, mandatory); §3f filing triggers; composite reconstructed with `computeCompositeFromDimensions` |
| **overnight-digest** | assessor summary + tonight's proposals | `research/digests/<date>.md` + `.json`, `research/PENDING_CHANGES.md`, updates-page payload | proposals, assessments, rotation-state, indexes | Queue totals counted from `research/change-proposals/*.json`, never incremented (D-11) |
| **validation** | everything above | quarantine files, failure logs | nothing substantive | `validate-indexes.mjs` (0 errors required), `validate-rotation-state.mjs`, `validate-daily-briefings.mjs`, `lint-daily-briefings.mjs` |
| **score-updater** | approved proposals + live indexes | `site/src/data/indexes/*.json`, `site/src/data/entity-records/*.json` (via `apply-entity-record.mjs`), rotation-state `composite`/`band`/`rank`, `research/APPLIED_CHANGES.md`, proposal `status` → `applied` | proposal `recommendation`/`notes`; `last_assessed` (see defect D-3 in §7); `site/src/data/updates/**`; `research/digests/**` | §2b.5 drift guard → §2i record write (G1/G2/G3) → §2j `validate-indexes.mjs` **0 errors**, else restore and mark `held-record-error` |

### 1a. Hand-off contracts

- **Scanner → assessor:** `top_entities` (prioritised) plus `entity_reviews[].sources[]`, which is
  the assessor's **URL pool** for evidence quotes. A quote must come from a URL that actually
  contains it.
- **Assessor → digest:** the assessor summary is the digest's input of record. The digest sees
  *only* this lineage — which is exactly why 64 study-filed proposals went unlogged in August
  (D-11 / INC-005).
- **Digest → founder:** `PENDING_CHANGES.md` is the review surface, but it is **derived**. The
  directory is authoritative.
- **Founder → score-updater:** `status: "approved"` in the proposal file. Not a prompt claim
  (`AUTONOMY.md` §5).
- **score-updater → site:** `APPLIED_CHANGES.md` entry + rank-cascade remediation + validator run.
  Deployment is a separate, manual, founder-owned step (D-09).

### 1b. Off-lineage studies

`benchmark-research` runs de-seeding and calibration studies **outside** the nightly chain. They
write assessments, sidecars, proposals and a synthesis (`research/SEED_CLUSTER_*.md`,
`research/SAHEL_BAND_CALIBRATION_*.md`, `research/INDEX_*`). They are **barred from writing
`rotation-state.json`** to avoid concurrent-write corruption with the nightly pipeline — an accepted
cost that leaves their entities with an understated `last_assessed` until reconciled. Any such study
**must append its own entry to `PENDING_CHANGES.md`** (D-11, remediation item 2).

---

## 2. Ownership map by artifact class

| Artifact class | Owner | Notes |
|---|---|---|
| `site/src/data/indexes/*.json` (8 files) | **`score-updater`** only | Or a founder-directed structural operation, logged identically |
| `site/src/data/entity-records/*.json` | `apply-entity-record.mjs` during an apply | Never hand-edited; G1/G2/G3 enforced |
| `research/rotation-state.json` | split by field — see `AUTONOMY.md` §4 | scanner: `last_scanned`/`last_evidence_touch`; assessor: `last_assessed`/`last_change_proposal`; score-updater: `composite`/`band`/`rank` |
| `research/scans/**` | `overnight-scanner` | |
| `research/assessments/**` | `overnight-assessor`, `benchmark-research` | Never deleted, even when superseded (both ADP assessments retained) |
| `research/change-proposals/*.json` | the agent that filed it | `status`/`reviewed_*`/`decision` are the founder's |
| `research/digests/**`, `research/PENDING_CHANGES.md` | `overnight-digest` (+ coordinator corrections) | |
| `research/APPLIED_CHANGES.md` | whoever performed the apply or structural operation | Append-only; prior entries never retro-edited |
| `site/src/data/updates/**`, `site/src/data/special-briefings/**` | `overnight-digest` (daily), `special-briefing` (thematic) | A published briefing is never edited to match a later score change |
| Teleprompter / spoken scripts | `communications-expert` | "never changes scores, data, or methodology" |
| Chart and graphic selection | `dataviz-architect` | Owns visualization grammar, not pixels |
| Comprehension, IA, progressive disclosure | `knowledge-architect` | |
| Search + answer-engine discoverability | `seo-aeo-architect` | Hands heavy implementation to `frontend-engineer` |
| CTA / conversion surfaces | `conversion-strategist` | Bounded by the independence policy |
| CI, branches, PRs, Actions, secrets configuration | `github-manager` (project-level) | Cannot read or set secret values |
| VPS, Docker, Nginx, TLS, deploy execution, rollback | `vps-docker-manager` (project-level) | Owns "the verification trap" — liveness ≠ currency |
| Architecture, data model, API contracts | `system-architect` | |
| Site code | `frontend-engineer`, `backend-engineer` | |
| Sequencing multi-agent work | `coordinator` | |

---

## 3. Overlap resolution

### 3a. Project agent vs 6S user-level agent — project wins, always

| Role | Canonical here | Not canonical | Why |
|---|---|---|---|
| Analytics | `analytics` (project) | `analytics-intelligence` (user) | The latter measures "customer journeys, search, products, quests, experiments, revenue" for 6S Success. This repo has no quests and no logged-in customer journey. |
| DevOps / reliability | `vps-docker-manager` + `github-manager` (project) | `devops-sre` (user), `devops-engineer` (project) | `devops-sre` governs 6S SLOs and delegates to *its own* github/vps managers. Real deploy work here has been done by the two project-level platform agents; INC-001 and INC-002 are both theirs. |
| QA | `qa-engineer` (project) | `qa-reviewer` (user) | `qa-reviewer` validates "commerce journeys" and blocks 6S releases. The equivalent gate here is the validator suite, not a browser QA pass. |
| Security | `security-engineer` (project) | `security-auditor` (user) | `security-auditor` is scoped to 6S ecommerce/privacy/secrets. **Neither has an incident to its name here** — `docs/OPERATING_SYSTEM_ADAPTATION.md` declined to write `SECURITY.md` for exactly this reason. Prefer the project agent; treat both as unexercised. |
| SEO / AEO | `seo-aeo-architect` (project) | `seo-aeo` (user) | The project agent is written for this site, names the answer engines, and defines the citability standard for generated content. |
| Product | `product-manager` (project) + `docs/PRD_MONETIZATION.md` | `product-manager` (user, 6S) | The user-level file defines "room and micro-zone functions" — a different product entirely. |
| UX | `ux-designer` (project) | `ux-frontend` (user) | The user-level agent both designs *and implements* for 6S. Here design and implementation are split: `ux-designer` → `frontend-engineer`. |
| Implementation | `frontend-engineer` / `backend-engineer` (project) | `software-engineer` (user) | Split by surface; the user-level agent is a single 6S implementer. |

### 3b. Overlaps inside the project set

| Pair | Canonical | Why |
|---|---|---|
| `devops-engineer` vs `vps-docker-manager` / `github-manager` | the two platform agents | `devops-engineer` is a generic SaaS CI/CD agent. The platform agents are written against this VPS, this Compose file, this workflow. |
| `coordinator` vs `meta-coordinator` | `coordinator` | `meta-coordinator`'s description scopes it to "the Ledgerium AI improvement system" — not this product. Same for `competitive-researcher` ("relevant to Ledgerium AI"). Both are misfiled here; do not route benchmark work to them without rescoping. |
| `benchmark-research` vs `overnight-assessor` | both, by lineage | `overnight-assessor` owns nightly rotation. `benchmark-research` owns methodology and off-lineage studies. They must not assess the same entity in the same window — see §4. |
| `overnight-digest` vs `special-briefing` | by cadence | Digest = nightly, mechanical. Special briefing = thematic, human/coordinator-triggered, and it *modifies the research lens*, so it must never be mistaken for a scoring run. |
| `analytics` vs `dataviz-architect` | by question | `analytics` defines what to measure; `dataviz-architect` decides how a number is drawn. Neither touches scores. |

---

## 4. Concurrency rules

**There is no lock, no transaction and no merge anywhere in this pipeline.** Every index write is a
full-file rewrite followed by a global re-sort and re-rank. A concurrent write loses one side
entirely, and the validator will not necessarily catch it because both versions are internally
consistent. Sequencing is the only control, and it has been managed by hand.

| # | Rule |
|---|---|
| C-1 | **Two agents must never write the same index file.** One index writer at a time, repo-wide. |
| C-2 | **Two agents must never write `research/rotation-state.json`.** Off-lineage studies are barred from it entirely. |
| C-3 | **Two agents must never write `research/PENDING_CHANGES.md`.** The digest owns it; corrections are appended by the coordinator between cycles, never during one. |
| C-4 | **One proposal file, one writer.** Parallel *assessment* is safe because the queue is a directory of per-entity files. |
| C-5 | **Batch structural changes into one re-sort.** 2026-08-21 combined a delisting and 14 insertions "in one pass so the index was re-sorted once rather than twice"; 2026-08-23 inserted 29 rows with a single re-sort and re-rank. |
| C-6 | **Declare your untouched scope before you start.** Every structural operation since 2026-08-17 has ended with an explicit "Out of scope, untouched per instruction" list. |
| C-7 | **Write incrementally. Never batch writes to the end of a run.** |

**Real incidents behind these rules:**

- **Hand-managed sequencing (2026-08-17).** While the ADP de-duplication ran on `fortune-500.json`,
  "a separate, unrelated study filed 10 robotics-labs proposals there in the same window — none
  touched by this merge." The isolation was achieved by declaring scope, not by any mechanism.
- **Rotation-state exclusion (documented in `reconcile-last-assessed.mjs`).** De-seeding studies are
  "deliberately barred from writing rotation-state (to avoid concurrent-write corruption with the
  nightly pipeline)." The cost — understated `last_assessed` for their entities — is accepted and
  repaired by reconciliation rather than by allowing the write.
- **Transient API 529, 2026-08-18 (INC-004).** Two concurrent `benchmark-research` runs terminated
  mid-run on the same server-overload error. The run writing each assessment, sidecar and proposal
  to disk as produced survived with **7 of 7** intact — its own synthesis records the termination in
  its provenance note. The run that batched writes to the end **lost a full 14-entity study**, and
  by construction left no artifact to recover. Hence C-7.

---

## 5. Which agents may write published data

**Only `score-updater`.** Plus `apply-entity-record.mjs`, which it invokes.

| Agent | Published-data write | Produces instead |
|---|---|---|
| `score-updater` | **Yes** — indexes, entity records, rotation-state score fields | `APPLIED_CHANGES.md` entry |
| `overnight-assessor` | No | assessments, sidecars, `status: "pending"` proposals |
| `benchmark-research` | No | assessments, sidecars, proposals, study syntheses, addition manifests |
| `overnight-scanner` | No | scans, evidence reviews |
| `overnight-digest` | Briefings only, never scores | digests, `PENDING_CHANGES.md` |
| `special-briefing` | Briefings only, never scores | thematic briefing |
| every other agent | No | code, specs, audits, plans |

A manifest is not a publication. On 2026-08-20 and 2026-08-23, 43 entities were added to
`robotics-labs` from `INDEX_ADDITIONS_ROBOTICS_BATCH*` manifests — and every composite was
independently re-verified against its 40-subdimension sidecar via `computeCompositeFromDimensions`
(diff 0.0000 in all 43 cases) **before** anything was written. "No score was derived, adjusted, or
invented; every value came from the manifest, which came from a verified sidecar."

---

## 6. Escalation — stop and report

Full trigger list in `AUTONOMY.md` §9. The four refusals that define the standard:

| # | Date | Agent | Refusal | Outcome |
|---|---|---|---|---|
| 1 | 2026-08-16 | `score-updater` | Refused a batch because the prompt asserted an approval the proposal files did not carry | Correct. The successful run applied 16 proposals, all of which **did** carry `status: "approved"`. *(Recorded in `docs/OPERATING_SYSTEM_ADAPTATION.md` §4 and the session record; no per-refusal artifact under `research/`.)* |
| 2 | 2026-08-16 | `score-updater` | Refused again on the same ground | Same. Two refusals in one day; the boundary was rediscovered from first principles because it was written down nowhere — the reason `AUTONOMY.md` now exists. |
| 3 | 2026-08-20 | `score-updater` | Read all 66 approved proposals in full before writing anything; **held 37** whose own notes instructed against application | 29 applied, 37 held with verbatim triggering text, named list and per-item remedy. Fully documented. |
| 4 | 2026-08-21 | structural operation agent | **Withheld Hocoma** — assessed, but `corporate_status: "unresolved"`, manifest `composite: null`; parent DIH Holding US was delisted from Nasdaq in the same month as the "still operating" press release | Not inserted. Manifest row and assessment left untouched. A fifth of the same kind followed on 2026-08-23 (Zimmer Biomet, held on index destination). |

**A refusal is a deliverable.** Report: what was held, how many, on what ground, the verbatim text
that triggered it, and the remedy each item needs.

---

## 7. Known routing defects — open, not fixed here

These are real and will misroute work. None is repaired by this file; each needs an owner.

| # | Defect | Evidence | Effect |
|---|---|---|---|
| D-1 | **`score-updater.md` §2a maps only 7 index files; there are 8.** `universities` is missing. | `.claude/agents/score-updater.md` §2a vs `site/src/data/indexes/` | Carnegie Mellon (2026-08-16) and Washington University in St. Louis (2026-08-20) were both applied to `universities.json` — correctly, but off-spec. |
| D-2 | **Five agents use `summary:` instead of `description:`** — `billing-pricing`, `customer-success`, `data-engineer`, `security-engineer`, `support-ops`. | frontmatter | No description means no auto-delegation trigger; these agents are effectively invisible to routing. |
| D-3 | **`score-updater.md` Step 2h instructs "Set `last_assessed` to today's date"**, contradicting `overnight-assessor.md` §3h. | both specs; `INCIDENTS.md` INC-003 | Direct cause of the 2026-08-16 corruption of 16 entities. Agents must follow §3h until the spec is corrected. |
| D-4 | **`data-engineer.md` contains its own frontmatter and body twice.** | file lines 1–29 and 30+ | Malformed definition. |
| D-5 | **Two project agents are scoped to a different product**, "Ledgerium AI": `meta-coordinator`, `competitive-researcher`. | their `description` fields | Routing benchmark work to them imports the wrong domain model. |
| D-6 | **Entity-count drift across specs.** `overnight-scanner.md` says 1,155 entities; `research/ARCHITECTURE.md` says 1,155; the 2026-08-20 scan ran 1,289; `rotation-state.json` now carries 1,331. `CLAUDE.md` says 7 index JSON files; there are 8. | those files | An agent sizing a run from a spec constant will under-cover. |

---

## 8. Quick routing table

| Task | Route to | Never |
|---|---|---|
| Apply an approved score change | `score-updater` | any other agent |
| Assess an entity tonight | `overnight-assessor` | `score-updater` |
| Assess a cluster / write a methodology study | `benchmark-research` | anything that writes rotation-state |
| Find new evidence | `overnight-scanner` | |
| Nightly summary + queue log | `overnight-digest` | |
| Thematic deep-dive | `special-briefing` | the nightly digest |
| Resolve a duplicate / defunct / renamed entity | escalate to founder, then a structural operation | `score-updater`'s normal proposal path |
| Fix CI / a failing workflow / branch state | `github-manager` (project) | `devops-sre` |
| Deploy, container, TLS, "site not updating" | `vps-docker-manager` (project) | `devops-engineer` |
| Chart or infographic choice | `dataviz-architect` | `ux-designer` |
| Make a page comprehensible | `knowledge-architect` | |
| Make a page findable / citable | `seo-aeo-architect` | `seo-aeo` (user-level) |
| Spoken script from a finished briefing | `communications-expert` | any agent that could alter a score |
| Architecture / data model / contracts | `system-architect` | |
| Sequence multi-agent work | `coordinator` | `meta-coordinator` |
