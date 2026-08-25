# Autonomy — Execution Authority

**What an agent may do alone, what needs founder approval, and what must never happen.**

This file exists because the boundary was previously written down nowhere. It was rediscovered
from first principles three times in one week — on 2026-08-16, 2026-08-20 and 2026-08-21 — each
time correctly, each time expensively. Every rule below traces to a dated event in this
repository. Nothing here is aspirational.

Adapted in structure from the 6S Success operating system; populated entirely from this repo's
own history. See `docs/OPERATING_SYSTEM_ADAPTATION.md`.

Related: `DECISIONS.md` (why the rules are what they are) · `AGENT-ROUTING.md` (who does what) ·
`INCIDENTS.md` (what happened when they were absent) · `RISKS.md` · `OBSERVABILITY.md`.

---

## 0. The one-line test

> **Would a skeptical reader, seeing this change on the public site tomorrow, be able to trace it
> to a dated artifact that says it was ready to publish?**

If yes, and it is inside your write scope in §4, act. If no, stop and report.

---

## 1. Authority classes

### 1a. Act alone — no approval needed

| Activity | Write target | Conditions |
|---|---|---|
| Evidence scanning | `research/scans/**`, `research/evidence-reviews` payloads, `last_scanned` / `last_evidence_touch` | Must pass `validate-scan.mjs` before promotion |
| Full assessment | `research/assessments/**` (`.md` + `.subdims.json`), `last_assessed`, `last_change_proposal` | Only for an entity actually assessed, with a report on disk |
| Change proposals | `research/change-proposals/*.json` with `status: "pending"` | Must clear §3e-bis screening; filing triggers per §3f |
| Studies and syntheses | `research/SEED_*`, `research/INDEX_*`, `research/*_CALIBRATION_*`, scoping documents | Must not write any index or `rotation-state.json` |
| Digest and queue log | `research/digests/**`, `research/PENDING_CHANGES.md` | Queue totals verified by directory count, never by increment |
| Validation runs | read-only; quarantine to `research/scans/superseded/**` | `validate-*.mjs`, `lint-*.mjs` |
| Non-published artifacts | root governance files, `docs/**`, agent specs | Not `site/src/data/**` |
| Corrections to the record | append-only notes in the file that carries the defect | Never retro-edit a prior dated entry |

**Volume is not the trigger. Publication is.** On 2026-08-23, 29 first-ever baseline assessments
were produced, verified and inserted in one operation — a large action, correctly performed,
because it was founder-directed and every composite reproduced exactly (diff 0.0000) before any
write.

### 1b. Always escalate — founder approval required before the write

- Any write to `site/src/data/indexes/*.json` (all 8 files).
- Any write to a published `composite`, `band`, `rank` or dimension vector, anywhere.
- Any write to `site/src/data/entity-records/**` other than via `apply-entity-record.mjs` during
  an approved apply.
- Any **delisting**, **deletion**, **merge**, **rename** or **index reassignment** of an entity.
- Any change to an entity's index membership (which index owns it).
- Adding entities to an index (first-ever baselines are still index writes).
- Any deploy, build-and-ship, container rebuild, DNS, TLS or secret operation.
- Any commit or push. Every structural operation on 2026-08-17, 2026-08-20, 2026-08-21 and
  2026-08-23 ended with "No commit performed" — that is the standing default.
- Any change to methodology, band boundaries, the composite formula, or a scoring convention.
- Publishing anything that names a real institution adversely.

### 1c. Never — no approval makes these correct

| Prohibition | Grounding |
|---|---|
| Publish a score for an entity that does not exist, is defunct, or is duplicated | §3 below; 13 held proposals as of 2026-08-20 |
| Invent, derive, adjust or "reasonably estimate" a composite | 2026-08-21 Apexica: delisted rather than given a replacement score |
| Fabricate a source, quote, URL or date | `overnight-assessor.md` §3f, integrity rules |
| Synthesise a `last_assessed` date | `reconcile-last-assessed.mjs`: "Never invents a date" |
| Edit a proposal's `recommendation` or `notes` to make it applicable | §6 below |
| Retro-edit a published briefing to match a later score change | 2026-08-16: the 2026-08-11 briefing was left intact and the staleness disclosed instead |
| Apply a proposal whose baseline has drifted > 2.0pt from the live index | `score-updater.md` §2b.5; May 21 US/Pakistan direction-inversion incident |
| Two agents writing the same index, `rotation-state.json`, or the same proposal file | §8 below |
| Resolve two conflicting assessments by picking one | 2026-08-17 ADP: 58.1 vs 60.6 → ordered a fresh assessment instead |

---

## 2. Routing versus self-veto — the central distinction

Two things in a proposal look like "don't apply this". They are different in kind.

### 2a. `recommendation: "flag-for-review"` is ROUTING. The founder may override it.

It means the assessor is sending the decision to a human. It is a **destination**, not a
prohibition. Overriding it is a documented, repeated, legitimate founder act.

| Date | Batch | Routing overridden | Notable |
|---|---|---|---|
| 2026-07-21 | 8 applied | **6 of 8** filed `flag-for-review` | Includes Egypt and Freeport-McMoRan, both flagged as likely screening-rule-3 false positives; founder informed, applied anyway |
| 2026-07-21 | State Farm | filed `downgrade` with a MAGNITUDE WARNING | Assessor suggested a peer-calibrated softer landing zone; founder applied the raw −47.1 two-band drop (Established → Critical, rank 57 → 427) |
| 2026-08-16 | 16 applied | **10 of 16** filed `flag-for-review` | Cerebras, Becton Dickinson, Cognition AI, Mali, Niger, Taipei, Baxter, Microsoft AI, Kathmandu, Portugal |
| 2026-08-16 | Taipei | formula-nonlinearity caveat | Assessor requested human calibration before the band crossing; founder applied the raw figure |

**Rule R1.** An agent must not refuse to apply a proposal solely because
`recommendation` is `"flag-for-review"` and the file carries a valid approval. Doing so
substitutes the agent's judgment for the founder's on a question the founder is entitled to
decide.

### 2b. A self-veto in `notes`/`rationale` is a STATED REMEDY. Approval alone does not clear it.

It means the author of the proposal has said, in the file, that the number is not ready to
publish and named what must happen first. On **2026-08-20** `score-updater` read all 66 approved
proposals in full before writing anything and held **37** on exactly this ground.

**Verbatim self-veto phrasings found in those 37 files:**

- "DO NOT APPLY WITHOUT A TARGETED EVIDENCE PASS"
- "DO NOT APPLY WITHOUT REVIEW"
- "No score change is applied / proposed for application by this study"
- "rotation-state composite/band/rank left at the PUBLISHED values"
- "Referred for coordinator-level calibration"
- "Recommend human review before any application"
- "A coordinator should treat the band change as provisional"

The 37 held: abridge, adept-ai, ai21-labs, anybotics, apptronik, clone-robotics, cohere,
databricks, ekso-bionics, engineered-arts, fourier-intelligence, groq, harvey-ai, hyatt-hotels,
idexx-laboratories, inflection-ai, isomorphic-labs, kawada-robotics, kinova-robotics, labelbox,
latvia, manpowergroup, metlife, moog-inc, omron-robotics, pal-robotics, recursion-pharma,
richtech-robotics, sakana-ai, sambanova-systems, symbio-robotics, tempus-ai, typeface,
ubtech-robotics, unitree-robotics, universal-robots, wandercraft.

**Rule R2.** Where a proposal's own `notes` or `rationale` instruct against application, **hold
it, even if `status` is `"approved"`.** Applying a score the assessor said was not ready
misrepresents the benchmark's own findings regardless of the status flag.

**Rule R3 — clearing a self-veto.** Only two things clear it:

1. **Do the named remedy.** Run the targeted evidence pass / calibration / review the proposal
   asked for, and file a fresh proposal against the current baseline.
2. **Explicit founder acknowledgment-and-override**, naming the entity and the self-veto text
   being overridden. A blanket "apply all approved proposals" is *not* this — that exact
   instruction was in force on 2026-08-20 and the 37 were still correctly held.

Neither remedy involves editing the `notes`.

### 2c. Decision procedure

```
Proposal has status "approved"?           no  -> do not apply (R6, §5)
        |yes
Entity record sound? (§3)                 no  -> HOLD, entity-record class
        |yes
notes/rationale contain a self-veto?      yes -> HOLD (R2), unless R3 satisfied
        |no
Baseline drift <= 2.0pt, no inversion?    no  -> HOLD, stale-baseline (score-updater §2b.5)
        |yes
recommendation == flag-for-review?        yes -> APPLY (R1) and disclose the override (§6)
        |no
APPLY
```

---

## 3. The entity-record hold class

**Rule R4. Approval cannot make a score for a non-existent entity correct.**

An entity-record defect is not an evidence question and cannot be resolved by weighing evidence
harder, by a founder approving faster, or by adjusting the number. If the row does not name one
real, currently-operating, singly-published entity, **no composite for that row can be true.**

As of 2026-08-24, **13** files in `research/change-proposals/` carry `status: "pending"` on this
class. Representative defects, quoted from each proposal's own `corporate_status` field:

| Proposal | Defect class | Evidence in file |
|---|---|---|
| `interpublic-group` | Merged | "Acquired by Omnicom Group; merger completed November 2025 … no longer exists as an independent company" |
| `rethink-robotics` | Defunct | The Robot Report, 16 September 2025: shut down for the second time; parent bankruptcy, US operations discontinued |
| `picasso-labs-machina` | Not one company | "ENTITY-IDENTITY DEFECT — DO NOT APPLY THIS SCORE … names two unrelated companies" (Picasso Labs → CreativeX 2020, not robotics; Machina Labs separate) |
| `halodi-robotics` | Duplicate | "Halodi Robotics and 1X Technologies are the same company … two published composites 18.9 points apart, in two bands, inside one index" |
| `1x-technologies` | Cross-index duplicate | Also in ai-labs at 50.0 vs robotics-labs 81.4 — "31.4 points apart, in two bands" |
| `figure-ai` | Cross-index duplicate | ai-labs 31.3 (2026-06-19) vs robotics-labs proposed 25.6 — "The benchmark should decide which index owns this company" |
| `harmonic-bionics` | Acquired | Bioness Medical acquired the assets and business, 18 June 2025 |
| `diligent-robotics` | Acquired | Serve Robotics, 19 January 2026; now "a Serve Robotics Company" |
| `rewalk-robotics` | Renamed + going concern | Lifeward Ltd. since 10 September 2024; "ReWalk" is a product line |
| `sarcos-technology`, `bionik-laboratories` | Rename / registration status | see each file's `corporate_status` |

**Remedy sequence — in this order. Do not skip a step.**

1. **Verify independently.** Two independent checks minimum, against dated sources, before
   asserting a defect. Precedent: 2026-08-17 ADP (identical composite, band, sector and
   byte-identical dimension vector confirmed before the merge) and 2026-08-21 Apexica ("no result
   across two independent searches", corroborating the prior scoping study).
2. **Do not score.** Leave the proposal `pending`. Do not apply, adjust, average or split.
   Averaging two composites for one company is explicitly rejected — 65.6 was assessed against
   Boston Dynamics the company and 20.3 against a product demonstration.
3. **Escalate for a disposition decision** (rename in place / merge / delist / reassign index).
   That decision is the founder's, not the agent's.
4. **Execute the disposition as a structural operation**, separately from any score change, with
   its own `APPLIED_CHANGES.md` entry, rank-cascade remediation and validator run. Precedents:
   2026-08-17 (ADP merge), 2026-08-21 (Apexica delisting).
5. **Then, and only then**, run a fresh assessment against the corrected record.

**Corollary — a defect is not a score change.** The 2026-08-17 merge changed no composite, band
or dimension for anyone. The 2026-08-21 delisting removed a rank-3 Exemplary claim without
substituting a number.

**Corollary — an unresolvable status is a withhold, not a guess.** On 2026-08-21 `hocoma` was
fully assessed but not inserted: `corporate_status: "unresolved"`, manifest `composite: null`.
Its parent DIH Holding US was delisted from Nasdaq in the same month its "still operating" press
release was issued. On 2026-08-23 `zimmer-biomet` was assessed, its composite verified, and still
not inserted — the index destination was genuinely open under R-SUB-4.

**Corollary — an operating flag is not a downgrade.** ABB Robotics, German Bionic, Bear Robotics,
CMR Surgical and Franka Robotics were all scored as fully operating with
`corporate_status: "operating-flagged"` and marked for re-verification. Being mid-acquisition is
not evidence about compassion.

---

## 4. Field ownership

**One writer per field. If it is not your field, you may not fix it, improve it, or keep it in
sync as a courtesy.**

| Field / artifact | Sole owner | Never written by | Grounding |
|---|---|---|---|
| `last_scanned`, `last_evidence_touch` | `overnight-scanner` | anyone else | `overnight-scanner.md` Step 8 |
| `last_assessed`, `last_change_proposal` | `overnight-assessor` | scanner, score-updater, studies | `overnight-assessor.md` §3h |
| rotation-state `composite` / `band` / `rank` | `score-updater`, on an approved apply | assessor, scanner, studies | `overnight-assessor.md` §3h integrity rule |
| Index `composite` / `band` / `rank` / dimensions | `score-updater` on founder approval, or a founder-directed structural operation | every other agent | `score-updater.md` §2c–2e |
| `site/src/data/entity-records/*.json` | `apply-entity-record.mjs`, invoked during an apply | hand-editing | `score-updater.md` §2i, G1/G2/G3 |
| Proposal `recommendation`, `notes`, `key_evidence`, `evidence[]` | the assessor / study that wrote it | reviewer, score-updater | §6 |
| Proposal `status`, `reviewed_by`, `reviewed_date`, `decision` | founder | agents, except to record a hold state | §5 |
| `research/PENDING_CHANGES.md` | `overnight-digest`, plus coordinator corrections appended | concurrent writers | 2026-08-19 queue correction |
| `research/APPLIED_CHANGES.md` | whoever performed the apply or structural operation | anyone not performing it | convention across all entries |

### 4a. `last_assessed` — two confirmed corruptions, opposite directions

| Date | Actor | Defect | Effect |
|---|---|---|---|
| 2026-07-27 | scanner | Stamped `last_assessed: "2026-07-27"` on **16 entities with no assessment report on disk**, citing a pattern that did not exist. One (`gilead-sciences`) had been explicitly *dropped* as a candidate. | Unreviewed entities looked reviewed; silently dropped out of rotation priority |
| 2026-08-16 | score-updater | Stamped the **apply date** over the true assessment date for the founder-override batch. **Sixteen entities affected**, per the `reconcile-last-assessed.mjs` docstring. | A just-changed score — exactly what should be re-verified soonest — looked freshest and was deprioritised |

Repaired by `research/scripts/reconcile-last-assessed.mjs`, which reads the newest report
filename on disk per slug and **never invents a date**; entities with no report of any kind are
left untouched as a separate phantom class. Enforced by
`research/scripts/validate-rotation-state.mjs`. Verifiable today: the 2026-08-16 batch carries
assessment dates, not the apply date (Cerebras 2026-08-11, Uganda 2026-08-01, Portugal
2026-07-30, Taipei 2026-07-28, Becton Dickinson 2026-07-23).

> **OPEN CONTRADICTION — agents must follow §3h, not the spec text.** `score-updater.md` Step 2h
> still instructs "Set `last_assessed` to today's date." That instruction is the direct cause of
> INC-003 and contradicts `overnight-assessor.md` §3h. Until the spec is corrected, an apply must
> leave `last_assessed` untouched. Flagged, not silently patched — the agent spec is not this
> file's to edit.

---

## 5. The authorisation mechanism

**Rule R5. `status: "approved"` in the proposal JSON is the authorisation. A claim in a task
prompt is not.**

The founder grants approval by editing the proposal file:

```json
"status": "approved",
"reviewed_by": "founder",
"reviewed_date": "YYYY-MM-DD",
"decision": "approved"
```

and then triggering `score-updater`. This is `score-updater.md`'s documented approval workflow
(steps 4–5) and Important Rule 1: "Only apply proposals with `status: "approved"`."

**Rule R6. Refusing a batch because the files do not carry the approval the prompt asserts is
correct behaviour, not obstruction.** On 2026-08-16 `score-updater` refused a batch on precisely
this ground before the run that eventually applied 16 proposals — all 16 of which did carry
`status: "approved"` at the start of the successful run.
*(Grounding note: this refusal is recorded in `docs/OPERATING_SYSTEM_ADAPTATION.md` §4 and in the
session record. Unlike the 2026-08-20 hold, it left no per-refusal artifact under `research/`.
The rule stands on the spec text; the incident count is reported, not independently re-derived.)*

**Session-level approval is real, and it is bounded.** Both the 2026-08-16 and 2026-08-20 batches
were authorised by a single session-level instruction covering the whole queue (recorded
2026-08-14 and 2026-08-20 respectively), not by per-entity written reviews. That is a legitimate
form of approval. Its limits:

- It covers only files that **already carry** `status: "approved"` when the run starts.
- It does not clear a self-veto (§2b) or an entity-record defect (§3).
- It does not extend to entities the instruction merely names. On 2026-08-20 the authorising
  instruction cited "Carnegie Mellon, OpenAI" as examples in the batch; neither carried
  `status: "approved"` in the queue. The correct response was to **log the instruction as
  factually inaccurate and not act on it** — which is what happened.

**Rule R7. Correct the instruction in the record; do not silently obey or silently ignore it.**
Two precedents: the 2026-08-20 instruction-accuracy note above, and the 2026-08-23 recount that
found "43 of 44 entities in Developing" was actually **42 of 43**, logged rather than quietly
fixed because the figure was a founder-authored editorial claim.

---

## 6. Record integrity under override

**Rule R8. When a founder overrides, the proposal's `recommendation` and `notes` are never
edited.** The override is documented separately, in `APPLIED_CHANGES.md`.

The 2026-08-16 batch recorded `reviewed_by`, `reviewed_date` and `decision` on all 16 files
"without altering any `recommendation` or `notes` field". The 37 held on 2026-08-20 "remain
`status: "approved"` in their files — untouched, including `recommendation` and `notes`."

**Why.** The text "FLAG FOR REVIEW — NOT A DOWNGRADE", "DO NOT APPLY WITHOUT A TARGETED EVIDENCE
PASS" and "This is a de-seeding, not a downgrade for new misconduct" must survive **verbatim**.
If it is edited away, the override becomes invisible and the benchmark can no longer show that
its own assessor disagreed. An unauditable override is indistinguishable from a fabrication.

**What the applied record must carry when a routing call is overridden:**

1. That the assessor's recommendation was `flag-for-review` (or carried a magnitude warning).
2. The assessor's stated reason, summarised faithfully — including reasons that argue against the
   applied figure.
3. That the founder was informed of it before approving.
4. The remedy the assessor recommended instead (e.g. cohort-wide calibration rather than an
   isolated move).

All four appear in every override note in the 2026-07-21 and 2026-08-16 entries.

---

## 7. Disclosure obligations — measuring absence, not misconduct

**Rule R9. Where a score movement measures absence of disclosure rather than misconduct, the
applied record and the public briefing must say so explicitly, in those words.**

This is not editorial softening. It protects a real company from a false implication, and it is
the operational form of the independence policy.

| Entity | Movement | Adverse evidence located |
|---|---|---|
| Cerebras Systems (2026-08-16) | 60.9 → 38.8, **−22.1**, Established → Developing, rank 7 → 27 | **Zero, in either direction.** Published 60.9 was a never-assessed uniform seed (7 of 8 dimensions identical at 3.5) |
| IDEXX Laboratories (2026-08-20 proposal) | 77.9 → 45.6 | **Zero.** "reporting either as a decline would be factually wrong" |
| ManpowerGroup (2026-08-20 proposal) | 60.9 → 46.9 | **Zero** |

The 2026-08-16 entry carries a "CEREBRAS SYSTEMS — REQUIRED CAVEAT" block stating the movement
"measures absence of disclosure … against a placeholder, not misconduct", explicitly mirroring
how the 2026-07-21 batch disclosed Egypt's and Freeport-McMoRan's screening-rule-3 status.

**Standing conventions that follow from this:**

- **The 2-convention.** Absence of disclosure scores **2**, never 1. A score of 1 requires
  positive documented evidence of a specific failure. Carried in the `scoring_convention` field of
  proposals from the 2026-08-16/17 studies onward. **See `DECISIONS.md` D-14: this is in live
  conflict with the convention Cerebras was applied under, and the conflict is unresolved.**
- **Say it in the row.** An assessment must state, in the affected subdimension rows, that the
  score reflects absence of disclosure and not evidence of harm.
- **Disclosure density.** Report the count: "28 of 40 subdimensions rest on absence of
  disclosure" (ABB Robotics), "39 of 40" (AgiBot).
- **Two 25.0s are not the same 25.0.** Globus Medical's 25.0 rests on a regulator finding that a
  harm-detection system did not work; Dexterity's 25.0 is silence. The index cannot currently
  distinguish them from the composite alone — logged 2026-08-23 as a **publication blocker**.
- **Never blur calibration into conduct.** The 2026-08-16 entry re-derived the batch's
  classification from each proposal's own content rather than accepting the instructing prompt's
  taxonomy, and found it "materially undercounted CONDUCT-DOWNGRADE".
- **Never blur conduct into calibration either.** Mali and Niger were filed as de-seeding
  calibrations, but the underlying record (HRW-documented mass graves, drone strikes on markets
  and mosques) is severe and undisputed. The 2026-08-16 entry flags that difference explicitly.

---

## 8. Concurrency

**Rule R10. Two agents must never write the same index file, `research/rotation-state.json`, or
`research/PENDING_CHANGES.md`. There is no lock. The only control is sequencing.**

There is no transaction, no merge and no conflict detection anywhere in this pipeline. Every
index write is a full-file rewrite followed by a global re-sort and re-rank; a concurrent write
loses one side entirely and the validator will not necessarily catch it, because both versions
are internally consistent.

**Standing arrangements, all evidenced:**

| Rule | Grounding |
|---|---|
| Studies run through `benchmark-research` are **barred from writing `rotation-state.json`** | `reconcile-last-assessed.mjs` docstring: "deliberately barred from writing rotation-state (to avoid concurrent-write corruption with the nightly pipeline)" — accepted cost: their entities carry an understated `last_assessed` until reconciled |
| A structural operation declares its untouched scope up front | 2026-08-17: "a separate, unrelated study filed 10 robotics-labs proposals there in the same window — none touched by this merge" |
| Batch multiple structural changes into **one** re-sort | 2026-08-21: delisting + 14 additions applied "in one pass so the index was re-sorted once rather than twice"; 2026-08-23: 29 insertions, one re-sort |
| Proposals are per-entity files, so parallel *assessment* is safe | The queue is a directory, not a shared document |
| Queue totals are counted from the directory, never incremented | 2026-08-19 correction: the log understated 72 as 8 |

**Rule R11 — incremental writes are mandatory.** On 2026-08-18 two concurrent `benchmark-research`
runs hit the same transient Anthropic API 529. The run that wrote each assessment, sidecar and
proposal to disk as it was produced survived with 7 of 7 intact
(`research/SEED_CLUSTER_AI_LABS_LOW_2026-08-17.md` records the termination in its own provenance
note). The run that batched its writes to the end lost the entire study — a 14-entity run,
reported and not independently re-derivable, because a batched-write loss leaves nothing to
inspect. Never hold results in context to write at the end.

**Before starting any index-touching work, state in your first message:** which index files you
will write, which you will not, and whether any other run is known to be active. This has been
managed by hand all session; the handoff is the only safeguard.

---

## 9. Stop-and-report triggers

Stop and report — do not proceed, do not work around it:

1. A proposal's own text instructs against application (§2b).
2. The entity record is defective or its corporate status cannot be resolved (§3).
3. Baseline drift > 2.0pt, or any direction inversion (`score-updater.md` §2b.5).
4. The authorising instruction is factually wrong about the queue (§5, R7).
5. `validate-indexes.mjs` returns any error, or `apply-entity-record.mjs` fails G1/G2/G3 —
   restore, mark `held-record-error`, log, report. Never ship an index change without its record.
6. Two assessments of the same entity disagree materially (ADP 58.1 vs 60.6; Kazakhstan 24.4 on
   2026-08-16 vs 13.7 on 2026-08-20 — a 10.7pt swing in four days, still open).
7. An entity is at or near the arithmetic floor and further downgrade is impossible — this is a
   methodology finding, not a proposal (2026-08-20: 8 of 20 entities evidence-insensitive).
8. The change would contradict a published briefing (2026-08-16 disclosed rather than edited).
9. Anything touching secrets, deploy credentials, DNS or TLS.
10. You are about to write a field you do not own (§4).

**Reporting a refusal is a deliverable.** Say what you held, how many, on what ground, with the
verbatim text that triggered it, and the remedy each item needs. That is exactly what the
2026-08-20 entry does for 37 proposals, and it is why the decision is auditable today.

---

## 10. Evidence index

| Rule | Primary evidence |
|---|---|
| R1 routing overridable | `research/APPLIED_CHANGES.md` `## 2026-07-21`, `## 2026-08-16` |
| R2/R3 self-veto | `research/APPLIED_CHANGES.md` `## 2026-08-20` (37 held, named) |
| R4 entity-record hold | 13 `status: "pending"` files in `research/change-proposals/`; `research/PENDING_CHANGES.md` "Entity-Record Defects -- 2026-08-20"; `research/INDEX_EXPANSION_SCOPE_2026-08-20.md` §1.1, §2.4 |
| R5/R6 authorisation | `.claude/agents/score-updater.md` (Approval Workflow, Rule 1); `docs/OPERATING_SYSTEM_ADAPTATION.md` §4 |
| R7 instruction accuracy | `APPLIED_CHANGES.md` 2026-08-20 instruction-accuracy note; 2026-08-23 cohort recount |
| R8 record integrity | `APPLIED_CHANGES.md` 2026-08-16 ("without altering any recommendation or notes"), 2026-08-20 ("untouched, including recommendation and notes") |
| R9 disclosure | `APPLIED_CHANGES.md` 2026-08-16 Cerebras caveat; `research/digests/2026-08-20.md` (IDEXX, ManpowerGroup) |
| R10/R11 concurrency | `research/scripts/reconcile-last-assessed.mjs`; `INCIDENTS.md` INC-004; `APPLIED_CHANGES.md` 2026-08-17/08-21/08-23 |
| Field ownership | `.claude/agents/overnight-scanner.md` Step 8; `.claude/agents/overnight-assessor.md` §3h; `INCIDENTS.md` INC-003 |
