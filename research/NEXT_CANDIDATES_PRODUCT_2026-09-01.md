# Next Candidates — Product — 2026-09-01

Top 5 product priorities for Compassion Benchmark, ranked, grounded in this repository's own
files as of this writing. Every claim below cites a file. Where a claim could not be evidenced
directly, it is marked **[hypothesis]**.

**Scope note.** Per instruction, this document does not propose robotics-labs Batch 4 or any
ai-labs expansion batch (`research/INDEX_EXPANSION_SCOPE_2026-08-20.md` §3.1). It does not modify
any index, `rotation-state.json`, change-proposal, assessment, or `site/src/data/updates/**`, and
performs no commit.

Last verified repository state referenced throughout: `APPLIED_CHANGES.md` `## 2026-08-23`
(most recent structural operation), `DECISIONS.md` D-22 (2026-08-24, most recent decision),
`site/src/data/updates/daily/2026-08-26.json` (most recent public briefing).

---

## Candidate 1 — Publish disclosure density and `adverse_findings_located` per entity

**Type:** Fix (schema + surfacing; closes a standing publication blocker)

**Problem.** `DECISIONS.md` D-21 (2026-08-23, status "active blocker") states directly: the 43
entities added to `robotics-labs` on 2026-08-20/23 "must not go live until the entity pages
publish, per entity, how many of the 40 subdimensions rest on absence of disclosure and whether
any adverse finding was located." The composite alone cannot distinguish **Globus Medical, Inc.**
(25.0, a regulator found its harm-detection system did not work — `research/assessments/
globus-medical-2026-08-23.md`) from **Dexterity, Inc.** (25.0, silence). `APPLIED_CHANGES.md`
`## 2026-08-23`, "Publication blocker carried forward," restates the same gap after the entities
were inserted. `research/INDEX_ADDITIONS_ROBOTICS_BATCH3_2026-08-23.md` (lines 107–112, 282)
supplies the underlying finding: disclosure-share-to-composite correlation fell from **−0.905
(Batch 1) → −0.935 (Batch 2) → −0.741 (Batch 3)** specifically because two entities (Globus
Medical, Ecovacs) carry adverse findings the composite doesn't distinguish from silence — the
study's own recommendation is "a simple boolean or count field: `adverse_findings_located`."

**Who it serves.** A reader comparing two "Developing"-band robotics companies at 25.0 who needs
to know whether that number means "we found nothing" or "we found a failure" before citing it. A
buyer of the robotics-labs research report, which will otherwise ship with 43 entities the
benchmark's own decision log has already said are not ready. The benchmark's own credibility — 11
of the 29 newly-inserted entities sit exactly on the absence-baseline floor of 25.0
(`APPLIED_CHANGES.md` `## 2026-08-23`), and shipping them undifferentiated invites exactly the
kind of dispute RISK-007 in `RISKS.md` names.

**Expected benefit (observable).** The robotics-labs publication blocker (D-21) closes and 43
already-assessed entities can go live. Every entity page in ai-labs and robotics-labs displays a
disclosure-density figure ("28 of 40 subdimensions rest on absence of disclosure") and an
`adverse_findings_located` indicator, sourced from data that already exists in each entity's
`.subdims.json` sidecar. Observable test: a reader can distinguish Globus Medical from Dexterity
without leaving the entity page.

**Effort:** M — a schema field (backend/data), a small computation pass over existing sidecars
(no new research needed for the 43 already-assessed entities), and a UI component
(frontend-engineer). Extending to the rest of the benchmark beyond robotics-labs is optional
follow-on scope, not required to close the blocker.

**Risk:** Low-medium. Mostly additive; the risk is scope discipline — the field must report
*absence of disclosure*, never be phrased as a conduct finding, per the standing 2-convention
disclosure discipline (`AUTONOMY.md` §7, Rule R9; `RISKS.md` RISK-005).

**Score:** Impact 5 + Alignment 5 + Learning 3 + Confidence 5 − Effort 3 − Risk 2 = **13**

---

## Candidate 2 — Close an evidence-retraction gap before it produces a published error

**Type:** Fix (pipeline gate, not an index change)

**Problem.** `site/src/data/updates/daily/2026-08-26.json` — the most recent public briefing —
documents a near-miss the benchmark caught only by luck: Peru was scanned and nearly scored on a
report that an Indigenous leader had been shot and killed. Both underlying sources were correctly
dated when read; the source organization retracted its own alert *after* the benchmark's checks
had already passed it (`topSignals[0]`, `methodologyNotes[0]`: "A Correctly Dated Source Can Still
Be Retracted — A New Evidence-Lifecycle Check"). The briefing's own text states the gap plainly:
"the existing checks confirm a source is dated and real, not whether it will still stand days
later." No entity in this repository shows a case where a retracted claim was actually published
— this incident was caught before publication — but the mechanism that caught it was manual, not
a gate, and the briefing recommends "a retraction re-check on any score-moving single-incident
report, before a proposal is filed."

**Who it serves.** Every reader of a `severity: "critical"` briefing item — this is the highest
attention, highest-consequence category the benchmark publishes, and this incident was exactly
that: a claimed death. It also serves the benchmark's own institutional credibility directly: a
published, later-retracted death claim about a named country is close to the worst single
correction the benchmark could be forced to run.

**Expected benefit (observable).** No change-proposal citing a single dated incident (the class of
evidence most exposed to retraction — an individual attack, death, or arrest, as opposed to a
report, ruling, or filing) is filed without a documented recheck that the source has not been
withdrawn or corrected since publication. Observable test: `INCIDENTS.md` gains no new entry in
this failure class, and the pipeline's own `methodologyNotes` block records the check moving from
`"status": "methodology-evolution"` to `"status": "active"` (the same lifecycle it already uses,
visible in the same file for the other three methodology notes in the 2026-08-26 briefing).

**Effort:** S — one additional verification step in the assessor pipeline for a narrow class of
evidence (single-incident, severity-critical), not a rebuild.

**Risk:** Low. The main cost is added latency for a narrow category of proposals, not accuracy
risk. There is a smaller, real risk of over-scoping the gate to all evidence (which would slow the
whole pipeline for no benefit) — the fix should be scoped narrowly, matching what the briefing
itself flags.

**Score:** Impact 4 + Alignment 5 + Learning 3 + Confidence 4 − Effort 2 − Risk 1 = **13**

---

## Candidate 3 — Execute the 13-entity entity-record disposition backlog

**Type:** Fix (structural correction, not a score change — per `AUTONOMY.md` §3's own framing)

**Problem.** `RISKS.md` RISK-003 and `AUTONOMY.md` §3 both confirm **13 proposals held on
entity-record grounds** as of 2026-08-24 — a defect class the methodology itself says "approval
cannot cure" (`DECISIONS.md` D-17). Concretely, per `research/INDEX_EXPANSION_SCOPE_2026-08-20.md`
§1.1–1.2 and `AUTONOMY.md` §3's table: **Rethink Robotics** was ranked "Established" 11 months
after its confirmed 2025-09-16 closure; **Boston Dynamics** is published twice, 45.3 points apart
(one row is a product demo, not a company); **1X Technologies/Halodi Robotics** is published
twice within robotics-labs, 18.9 points apart, and **again** across ai-labs/robotics-labs, up to
31.4 points apart; **Amazon** (fortune-500, 12.8) and **Amazon AWS AI** (ai-labs, 35.9) are the
same company at a 23.1-point gap; the same pattern repeats for Microsoft (10.6-point gap) and Meta
(18.5-point gap). `APPLIED_CHANGES.md` `## 2026-08-23`, "Known open duplicates, still not
addressed," confirms none of this has been executed as of the most recent structural operation.
The remedy sequence is already codified (`AUTONOMY.md` §3, Rule R4, four-step remedy), and two
dispositions have already been executed successfully under it (ADP merge 2026-08-17; Apexica
delisting 2026-08-21) — this is finishing a known playbook, not inventing one.

**Who it serves.** A reader who looks up Amazon, Boston Dynamics, or Meta and finds two different,
both-currently-published scores for what the site presents as one company, with no explanation on
either page of the other. A reader who trusts the "Established" band label on a company (Rethink
Robotics) that stopped existing 11 months ago.

**Expected benefit (observable).** Zero entities anywhere in the benchmark hold more than one
published composite (the "hard constraint" stated in `research/INDEX_EXPANSION_SCOPE_2026-08-20.md`
§2.2). Zero defunct entities carry an active band label. Observable test: re-run the slug-collision
scan the scoping study used (`site/src/lib/slugify.ts` against all eight indexes) and get zero
name-collision or known-duplicate hits, down from the current known count of at least 7 companies
published twice.

**Effort:** M — 13 entities, each requiring the AUTONOMY §3 remedy sequence (verify twice → hold
→ escalate for a founder disposition decision → execute structurally → re-assess where needed).
Bounded and precedented (two of 13 already done), but every write in this class requires founder
approval (`AUTONOMY.md` §1b: "Any delisting, deletion, merge, rename, or index reassignment").

**Risk:** Low-medium. Well-precedented and low-risk *if* the remedy sequence is followed; the
principal risk is the founder-approval bottleneck itself becoming the delay, and D-20 (Zimmer
Biomet's index destination) shows a related class of decision can sit unresolved for weeks.

**Score:** Impact 5 + Alignment 5 + Learning 2 + Confidence 5 − Effort 3 − Risk 2 = **12**

---

## Candidate 4 — Fix the 60.9 band-boundary gap, then clear Tier 1 seed placeholders (9 entities)

**Type:** Fix (methodology documentation) + small measurement study

**Problem.** `research/SEED_INVENTORY_2026-08-20.md` reports **59% of published entities (834 of
1,289) sit on a never-individually-assessed placeholder score** (§Headline), and prioritizes
remediation by "published claim at risk," not cluster size (§6). The two highest-priority,
cheapest items in its own sequence are unexecuted as of the most recent applied-changes entry
(`APPLIED_CHANGES.md` `## 2026-08-23` records only robotics-labs work, no fortune-500 or countries
de-seeding): **fortune-500's four highest-ranked companies (ranks 2–5) sit on an unmeasured seed
of 92.4** — "the highest unranked claim anywhere in the benchmark" — and **countries ranks 6–10
sit on 83.0**, only 2.0 points above the Exemplary cutoff, the same seed value that fell −46.37 on
average when de-seeded in robotics (`DECISIONS.md` D-15 table). Separately, `RISKS.md` RISK-006
documents an undocumented resolution of composite 60.9 to the "Established" band (the methodology
table shows `41–60 Functional`, `61–80 Established`, leaving 60.9 undefined) affecting roughly 30
published band labels, including the 17 remaining fortune-500 entities at that exact seed.

**Who it serves.** A reader of the flagship fortune-500 and countries indexes who assumes the
top-ranked, "Exemplary"-band names were individually measured — they were not. The de-seeding
programme's own future studies, which the source document says should not run "against an
ambiguous [boundary] target" (§5).

**Expected benefit (observable).** Zero entities remain in the Exemplary band on an unmeasured
seed value. The band-boundary table in the published methodology states explicitly what composite
60.9 resolves to. Observable test: re-run the identical-vector cluster detection used to produce
the 834/1,289 figure and confirm the fortune-500 92.4 (4 entities) and countries 83.0 (5 entities)
clusters no longer appear.

**Effort:** S — the boundary fix is a documentation/code-comment correction (`SEED_INVENTORY_
2026-08-20.md` §6 step 1 calls it "cheap, unblocks Tier 1"); the study itself is 9 entities, the
smallest tier defined, following a template already run seven times.

**Risk:** Low-medium. The seven prior studies are direct precedent with a documented,
anti-confirmation-bias-guarded method (`DECISIONS.md` D-15) and produced both upward and downward
corrections — the risk is standard measurement risk, not process risk.

**Score:** Impact 4 + Alignment 4 + Learning 3 + Confidence 5 − Effort 2 − Risk 2 = **12**

---

## Candidate 5 — Surface the 50-entity known-divergence backlog on the public site

**Type:** Improvement (transparency/UX pattern, not a score change)

**Problem.** `RISKS.md` RISK-002 states the core issue directly: 50 approved proposals sit held
(37 self-veto, 13 entity-record per `AUTONOMY.md` §2b/§3) — "every day these sit unapplied is a
day the public site shows a score the benchmark's own process has already superseded internally."
`research/APPLIED_CHANGES.md` line 723 (quoted in RISK-002) confirms public briefings already
describe some of these as "pending, not applied," but this framing exists inside dated briefing
prose that ages out of view — it is not a persistent, discoverable signal on the affected entity's
own page today. Candidates 1, 3, and 4 above all take real time to clear their backlogs; this
candidate does not close any of them — it makes the existing gap visible where a reader is
actually looking, now.

**Who it serves.** A reader who looks up one of the ~50 affected entities today, sees only the
stale published number, and has no way to know — without independently reading `PENDING_CHANGES.md`
— that the benchmark's own process has already produced a different, unapplied assessment for that
exact entity.

**Expected benefit (observable).** Any entity page for one of the 50 held entities carries a
visible, dated notice that a reassessment exists and is pending review, without stating the
undisclosed number itself. Observable test: for a held entity (e.g., one of the 37 named in
`AUTONOMY.md` §2b, such as `moog-inc` or `unitree-robotics`), the entity page differs visibly from
an entity with no pending proposal.

**Effort:** S — a manifest field mapping held proposals to entity slugs (already exists as a
directory of files, `research/change-proposals/*.json` with `status: "pending"`, per `DECISIONS.md`
D-11) plus one UI badge component.

**Risk:** Medium. This is the least de-risked candidate here — it is a new product pattern, not a
precedented one. Two specific risks: (a) surfacing "a change is pending" for a named real
institution could itself read as a public claim requiring the same evidentiary care as a score
change, which is exactly the class of exposure `RISKS.md` RISK-007 names; (b) it could invite
exactly the "score entities pay to influence" misreading the independence policy exists to
foreclose (`docs/PRD_MONETIZATION.md` §2), if not worded with equal care to the Score-Watch
alert copy discipline already established there. Wording this correctly is a real design problem,
not a formality.

**Score:** Impact 4 + Alignment 4 + Learning 4 + Confidence 3 − Effort 2 − Risk 3 = **10**

---

## Ranked summary

| Rank | Candidate | Type | Impact | Align | Learning | Confidence | Effort | Risk | **Score** |
|---|---|---|---:|---:|---:|---:|---:|---:|---:|
| 1 | Disclosure density + `adverse_findings_located` | Fix | 5 | 5 | 3 | 5 | 3 | 2 | **13** |
| 1 | Evidence-retraction recheck gate | Fix | 4 | 5 | 3 | 4 | 2 | 1 | **13** |
| 3 | Entity-record disposition backlog (13 proposals) | Fix | 5 | 5 | 2 | 5 | 3 | 2 | **12** |
| 4 | Band-boundary fix + Tier 1 de-seeding (9 entities) | Fix / small study | 4 | 4 | 3 | 5 | 2 | 2 | **12** |
| 5 | Surface the 50-entity divergence backlog | Improvement | 4 | 4 | 4 | 3 | 2 | 3 | **10** |

Candidates 1 and 2 tie on score. Between them, Candidate 1 is ranked first because it clears a
**named, already-declared blocker** (D-21) sitting in front of 43 already-completed assessments
that cannot ship until it closes — the work is done and waiting. Candidate 2 (the retraction gate)
prevents a *future* recurrence of a class of failure that, this time, did not reach publication;
it is no less important, but nothing is presently blocked on it.

## Recommended next action

**Start Candidate 1: define the disclosure-density and `adverse_findings_located` field spec and
hand off to system-architect and frontend-engineer**, scoped to the 43 already-assessed
robotics-labs entities named in `DECISIONS.md` D-21. This is the highest-confidence, most
narrowly-scoped item on the list — the underlying data already exists in each entity's
`.subdims.json` sidecar, the two batches that produced it already recommended the exact field, and
closing it directly answers the founder's own standing publication blocker rather than opening a
new one. Immediately following it — same sprint if capacity allows, given its S effort and 1-point
higher confidence-minus-risk profile — is Candidate 2 (the retraction recheck gate), since it is
the cheapest item on this list and addresses the most severe class of error the benchmark could
publish (a false death claim), which the 2026-08-26 briefing shows the current process caught only
by chance.

**Handoff package for both:**
- **Problem statement:** see Candidate 1 and Candidate 2 above, each with primary evidence cited.
- **Target users:** readers comparing entities within a band; buyers of index research reports;
  the benchmark's own credibility as the deciding stakeholder for Candidate 2.
- **MVP scope:** Candidate 1 — schema field + computation over existing sidecars + entity-page
  surfacing for the 43 named entities only; extension to the rest of the benchmark is explicitly
  out of scope for this pass. Candidate 2 — a single verification step scoped to single-incident,
  severity-critical proposals; do not extend to all evidence types in this pass.
- **Acceptance criteria:** stated as observable tests in each candidate section above.
- **Success metrics:** Candidate 1 — the D-21 blocker in `DECISIONS.md` is marked closed and the
  43 entities publish; Candidate 2 — zero new `INCIDENTS.md` entries in the evidence-retraction
  failure class, and the corresponding `methodologyNotes` entry's `status` field advances from
  `methodology-evolution` to `active` in a subsequent daily briefing.
