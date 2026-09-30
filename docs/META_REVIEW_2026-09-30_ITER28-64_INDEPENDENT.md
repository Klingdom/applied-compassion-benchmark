# Meta-Review 5: Improvement Loop, Iterations 28–64 (2026-09-30)

**Reviewer:** independent meta-coordinator, read-only. No file was edited, no command was run that writes to the
repository. All figures below were re-derived from `ITERATION_LOG.md`, `IMPROVEMENT_BACKLOG.md`,
`docs/DEFECT_CLASS_REGISTRY.md`, `RISKS.md`, `research/PENDING_CHANGES.md`, `research/APPLIED_CHANGES.md`,
`research/rotation-state.json` and `site/scripts/known-collisions.json`, not taken from the log's own summaries.

**Builds on:** `docs/META_REVIEW_2026-09-21_ITER21-27.md` (Meta-review 4, Iterations 21–27).

---

## A. Selection quality — the ranked backlog stopped being consulted

The loop got much better at *internal* discipline (gates, probes, negative controls — see §D) and much worse at
actually consulting `IMPROVEMENT_BACKLOG.md`'s ranked queue. Two kinds of evidence:

**1. A live, reader-facing, eligible, decently-scored defect sat completely untouched for the entire window.**

`IMPROVEMENT_BACKLOG.md:120-146` (filed 2026-09-16, during Iteration 19) records **A-2a** (12 US-city cross-index
slug collisions, v2 ≈ 12, eligible) and **A-2b** (`washington-dc`, v2 ≈ 11, eligible) as explicitly *not*
founder-blocked — only the two ai-labs/robotics-labs rows (A-2c) are gated on D-13. `RISK-017`
(`RISKS.md:27`, severity **High**) still reads, verbatim, as of 2026-09-30: *"15 remain... Open — Phoenix
resolved."* `RISK-018` (`RISKS.md:28`) still reads *"Open — one face closed 2026-09-16."* `site/scripts/known-
collisions.json` is dated `asOf: 2026-09-16` and still lists all 15 rows I could verify by reading it directly.
**Grepping `ITERATION_LOG.md` for "collision" across Iterations 28–64 returns zero hits that touch the live
defect** — the only matches are about an unrelated prose-parsing class (DC-23) and the original 2026-09-16/17
work. A reader who looks up "Boston," "Houston," "Chicago," etc. on compassionbenchmark.com is still, today,
sometimes served the wrong entity's score (the global-city vs. US-city collision RISK-017 itself describes as
"wrong entity served to badges and data consumers"). This is the single clearest S10/selection failure in the
window: a ≥2-occurrence, High-severity, reader-visible, *not* founder-blocked class sat for 37 iterations while
the loop worked a self-generated queue instead.

**2. `Deviation:` is still zero, for the entire window, not just unmeasurable.**

Meta-review 4 flagged 0 of 7 in Iterations 21–27 and called it "0 for twelve consecutive iterations." Across
Iterations 28–64, the literal string `Deviation:` **does not appear once** in `ITERATION_LOG.md` (checked by
full-file grep). The amendments Meta-review 4 proposed (D1, R1, V9(d)) and the re-tabled Meta-review 3 rules
(V9, T1, amended S6/S11) are likewise absent by name from the log — the coordinator continues to invent
functionally similar language ("Step 2 override," "no candidate-generation round," "forced by S10") without ever
writing the literal `Deviation:` label the scoring model calls for. The bookkeeping gap Meta-review 4 named is
unchanged, 37 iterations later.

**3. What actually drove selection instead.** Reading Iterations 28–64 in sequence, selection followed one of
three patterns almost exclusively: (a) founder directives (It. 17, 24, 28, 31, 32, 33, 37 — all legitimate,
all pre-empting the ranked queue by design), (b) S10 forced selections on newly-discovered internal-governance
defect classes (It. 34, 39, 46, 54→57, 61→62, 63→64 — DC-14, DC-16, DC-17, DC-21, DC-22, DC-23), and (c) the
loop's **own self-generated follow-up queue** — TRI-1 through TRI-12, GI-1 through GI-5, CAL-1/CAL-2 — items
filed by one iteration and picked up by the next, almost never cross-checked against the wider backlog. Once the
loop had generated its own queue of review/triage/gate work, it consumed that queue for roughly 30 of the 37
iterations without returning to `IMPROVEMENT_BACKLOG.md`'s other eligible rows. S10 was applied faithfully
*within* that self-generated queue (the registry documents nine separate forced selections, each correctly
justified against the ≥2-occurrence rule). It was never applied to pull A-2a/b back into scope, because nobody
re-scored them against the classes that kept winning.

**Verdict on A:** S10 worked exactly as designed for the classes the loop itself was busy creating. It did not
prevent the loop from drifting away from the one thing the ranked backlog said was worth doing next among
non-model-benchmark items.

---

## B. Honesty of the record — self-correction is real, frequent, and well-labelled; but the failure rate that
makes it necessary is itself worth flagging

The loop corrects itself constantly, and the corrections are dated, prominent, and not retro-edited over the
original claim (AUTONOMY §1c is respected consistently). Concrete instances, all inside the review window:

- **It. 52** publishes a self-correction of a claim made in **It. 51**, the same day: "20 of 93 items make an
  external factual claim, 4 wrong — one in five" is revised to "at least 22... roughly one in six, with the
  denominator a lower bound," with the table of three readings shown rather than hidden (`ITERATION_LOG.md:790-
  824`).
- **It. 63 (TRI-12)** pre-registers a test of its own **It. 61** repair claim ("`SYS-5-A` improved from 3/2 to
  1/4, recorded as a repair") and comes back **INCONCLUSIVE** — mean cold-arm lift +0.88, between the null and
  effect thresholds — and explicitly states the earlier repair procedure "may only be a way to raise a score" and
  "should not be used that way again" (`ITERATION_LOG.md:79-125`). The 33-of-35 headline is kept as the
  pre-registered figure; 34-of-35 is explicitly downgraded to "post-probe."
- **`docs/DEFECT_CLASS_REGISTRY.md` DC-11** carries a dated correction on itself: *"CORRECTION 2026-09-25: that
  job [nginx-config-syntax] was added on 2026-09-17 and then never executed once until today... So this row
  claimed protection from 2026-09-17 that did not exist until 2026-09-25."* An eight-day gap between "claimed
  gated" and "actually gated," self-reported.
- **It. 62 (HEALTH-1)** audits `SYSTEM_HEALTH.md` against the repo and finds **18 of 65 checkable claims false**,
  the worst being a green CI workflow name ("Deploy to VPS") read as evidence of 9 consecutive deployments when
  the deploy *job* inside that workflow is skipped on every push (`ITERATION_LOG.md:159-165`). Filed as **OBS-1**
  and corrected in the file, not hidden.
- **DC-22's own change-log entry** states the residual risk plainly: "the gate holds four specific figures, and
  the other 47 claims in that file are still only as true as the last person to read them" — an honest admission
  that the fix is partial, not a claim of completeness.

**What is still overstated as of Iteration 64:** nothing I could find in the *published site* — every live-page
correction I checked (It. 47's wrong-item claim, It. 50's MS-5 flatness claim) was actually fixed on
`/ai-models`. What remains overstated is **internal status bookkeeping that keeps failing the same way faster
than it's caught**: `SYSTEM_HEALTH.md` skipped seven consecutive iterations (54–60) before It. 62 caught it, and
DC-22's own count (18 of 65 claims wrong in one file) is itself only the *measured* floor — the file's other 47
claims are, by the gate's own admission, unverified. The pattern across DC-16, DC-17, DC-22 is consistent: status
artifacts assert more than anyone re-derived, and the loop discovers this by audit rather than by the artifact
failing to be written in the first place.

**Verdict on B:** honesty discipline when a defect is *found* is excellent — corrections are dated, prominent,
and not retro-edited. The problem is upstream: the rate at which self-reporting artifacts go wrong (7 straight
skipped iterations on SYSTEM_HEALTH.md; a gate claiming protection it didn't have for 8 days) suggests these
artifacts are being trusted between audits more than the loop's own evidence says they should be.

---

## C. Recurring patterns NOT yet gated — one clear candidate, one near-miss

The registry (23 classes, DC-01 through DC-23) is unusually thorough and mostly closes the loop Meta-review 4
opened (DC-15, the "gate compares two artifacts instead of a specification" class Meta-review 4 asked to be
registered, **is** now DC-15, correctly attributed). Looking for what is *not* there:

1. **"A live, eligible, correctly-filed backlog item is never re-selected because the loop is working its own
   self-generated queue"** (§A above) has **no registry row**. This is a selection-process failure, not a code
   defect, so it sits outside the registry's stated scope (code/process defects with ≥2 dated occurrences) — but
   it recurred for the entire window (A-2a, A-2b: 0 selections across 37 iterations) and it is exactly the shape
   of thing S10 exists to catch. It is arguably a gap in S10's own definition: S10 triggers on *ungated recurring
   defect classes*, but has no analogous trigger for *ungated recurring backlog neglect*. Worth a rule, not
   necessarily a registry row — see recommendation 1.

2. **Near-miss, already caught inside the window: the shallow-clone blind spot.** It. 46 found that
   `actions/checkout`'s default depth-1 clone made **both** `test:iteration-log-silence` (DC-16) and
   `test:commit-message-tokens` (DC-17) report vacuous/indeterminate results in CI from the day each was added,
   until `fetch-depth: 0` was set. This is the same *shape* as DC-15 ("a gate that cannot see what it claims to
   check") but is registered nowhere as its own class — it is folded into the DC-16 narrative instead of getting
   an ID. Given it hit two independent gates, it would meet the ≥2-occurrence bar for its own registry row (a
   CI/runtime environment silently degrading a committed gate), and the loop did not register it as such.

3. Everything else recurring — control bytes (DC-21), shell metacharacter loss (DC-23), verification-harness-
   manufactures-its-own-defect (DC-20), stale status artifacts (DC-22) — **is** registered, several within the
   same iteration they were found, which is a genuine strength.

---

## D. Verification discipline — strong and improving; the one blind spot is CI execution, not the harness design

This window is markedly better than Meta-review 4's window on verification mechanics. Nearly every gate built in
Iterations 28–64 follows the same pattern: measure a baseline before building (V1), prove a zero means something
with a positive control (V8), plant a real negative-control defect and show the gate catches it by name, restore
and sha256-verify (V3), and state the gate's residual hole rather than claim completeness. Examples: It. 39
(destructive-git gate, 9 probes), It. 50 (MS-5, measured across all 1,325 live entities rather than argued), It.
53 (control-byte gate, baseline "2 of 5,828 files" measured before the gate existed), It. 62 (HEALTH-1, 7
negative controls including two that plant the *cause* rather than the *symptom*), It. 64 (content-loss gate,
four rejected candidate signatures with their false-positive counts shown, not hidden).

**Where it falls short — gates that shipped without proof they worked in their real execution environment:**

- **DC-11's `nginx-config-syntax` CI job** is the clearest case: built and claimed as gating protection on
  2026-09-17, and it is now on the record (registry, self-disclosed) that it **never executed once** until
  2026-09-25 — first because of skip-ci pushes, then because it died on a DNS artifact particular to the VPS
  network. Eight days of claimed-but-absent protection, found only by later audit, not by a planted probe run
  against the actual CI environment.
- **DC-16/DC-17's shallow-clone hole** (§C.2): both gates were locally proven with `assertGateCatches`-style
  negative controls, and both were silently ineffective in the one environment (`actions/checkout`, depth 1)
  that actually matters, until It. 46 happened to probe a real depth-1 clone rather than reason about it.

Both holes share a root cause: **the planted-probe discipline is consistently applied to the *code path*, but
not consistently applied to the *CI environment the code path runs in*.** A gate proven locally with a real
negative control and a real restore is not evidence it behaves the same way once GitHub Actions' checkout depth,
skip-ci substring matching, or a VPS-only DNS name gets involved — three separate instances of exactly this
(DC-16, DC-17, DC-11) recurred across the window before being caught.

**Negative controls actually run?** Yes, pervasively and with real restoration proofs (sha256 comparisons shown
in nearly every entry from It. 34 onward) — this is not a case of accepting subagent claims. Where subagents
*are* used (the 93-item bank triage, It. 47–61), the coordinator explicitly re-verifies factual claims against
primary sources before publishing them (AC-001 through AC-007 all cite eeoc.gov, statute text, etc., independently
checked), and twice catches its own harness manufacturing false findings from a paraphrase rather than the
source text (DC-20, It. 49 and It. 51) — a genuinely good habit, not a claimed one.

---

## E. What the loop is NOT doing — the ratio is badly lopsided, and it is not close

**Estimate: of the 37 iterations in scope (28–64), roughly 8–9 touch any page a visitor to
compassionbenchmark.com would see, and every one of those 8–9 is on the same single, not-yet-launched,
self-admittedly-unreviewed feature (`/ai-models`, `/ai-evaluation-suite`) — not the core rankings
(Fortune 500, Countries, US States, AI Labs, Robotics Labs, US Cities, Global Cities, Universities) that
`CLAUDE.md` defines as the product.** That is roughly a **75–80% internal-tooling-and-governance / 20–25%
product-adjacent** split, and the 20–25% is itself entirely inside a pre-launch side feature. **Zero of the 37
iterations touched the core index pages, the core entity data, or the actual research/scoring pipeline.**

Evidence for the split, iteration by iteration:

- **Pure internal tooling/governance (≈28 of 37):** It. 28, 29, 30, 31, 32, 33, 34, 35, 36, 38, 39, 41, 42, 43,
  45, 46, 51, 52, 53, 54, 57, 58, 59, 60, 61, 62, 63, 64. This is the `tools/cb-probe` MCP server (a local
  developer tool, not deployed to the site), its packaging, its six code-reviews, its contamination probe, its
  submission validator, CI/commit-message/destructive-git/control-byte/iteration-log/publication-drift/health-
  freshness/content-loss gates, and a chain of self-generated triage passes (TRI-1 through TRI-12) auditing a
  93-item AI-model evaluation task bank that has **0 of 93 items human-reviewed** and is not linked from any core
  ranking page.
- **Touches a page a reader could see (≈9 of 37), all on the same niche feature:** It. 37 (bank expansion, the
  `/ai-evaluation-suite` page), It. 40 and 44 (`/ai-models` page text), It. 47 (fixes a wrong item name on
  `/ai-models`), It. 48, 49, 55 (fixes published rubric text on `/ai-evaluation-suite`), It. 50 (fixes a false
  methodology claim on `/ai-models`), It. 56 (`PUB-1`, fixes a stale RSS/JSON feed — the one genuinely
  reader-facing fix outside the AI-models feature, and it is a distribution-channel fix, not a ranking).
- **Core product (rankings, entity scores, research pipeline): 0 of 37.**

**This is corroborated independently by the research pipeline's own numbers, which the loop's iteration log
never surfaces because no iteration in this window touched it:**

- The last entry in `research/APPLIED_CHANGES.md` is **2026-09-16** (`## 2026-09-16 — Wellington downgrade`).
  **Zero score applications in the 14 days this review covers.**
- `research/PENDING_CHANGES.md`'s own counted totals grew from **22 pending (2026-09-20/21) to 29 pending
  (2026-09-24, the last cycle recorded)** — the backlog of *already-assessed, not-yet-applied* score changes got
  **larger**, not smaller, across this window.
- The oldest pending proposal, cited unchanged across five consecutive digest entries
  (`research/PENDING_CHANGES.md:10246`–`10602`), is **Rethink Robotics, filed 2026-08-16** — six weeks old.
  `RISKS.md` RISK-003 independently confirms Rethink Robotics is **defunct** (closed 2025-09-16) and **still
  published, ranked "Established," the second-highest band**, on the live site.
- `research/rotation-state.json`'s own metadata shows `last_updated: "2026-07-22"` — over two months stale
  against a `last_scan` of `2026-09-24`.

**The institution's stated purpose is "measures how institutions recognize, respond to, and reduce suffering"
and sells comparative rankings.** For the entire window this review covers, the loop's effort went almost
exclusively into building and auditing an internal capability to let a *third party* run a self-administered,
unofficial, 0-human-reviewed version of that same benchmark against an AI model via an MCP server — while the
actual rankings sat with zero score updates, a growing backlog, a confirmed-defunct company still published in
a high band, and two High-severity risks (wrong entity served on 15 collision slugs) sitting untouched despite
being explicitly eligible in the backlog the whole time.

---

## F. Three concrete recommendations, ranked

**1. Stop the loop from re-entering its own self-generated queue without re-checking the wider backlog first.**
*Next action:* add a rule (call it **S12**) — before selecting the next item from a self-generated follow-up
queue (a TRI-N, GI-N, CAL-N, or any item filed by the *previous* iteration rather than pre-existing in
`IMPROVEMENT_BACKLOG.md`), the coordinator must first re-score and list the top 3 *pre-existing* eligible backlog
rows and state in one line why the self-generated item outranks all three or why it doesn't (S1's existing
"deviations must cite a non-formula reason" already covers this in spirit; S12 would make it apply to the
self-generated queue specifically, which S1 has evidently not been read as covering for 37 iterations). This
would have forced A-2a/A-2b back into view by roughly Iteration 40.

**2. Spend the next loop closing RISK-017/RISK-018, not another model-benchmark item.** *Next action:* A-2a (12
US-city twins) is mechanical, already scoped (`IMPROVEMENT_BACKLOG.md:134-138`), uses the exact recipe already
proven on Phoenix and Singapore, and directly fixes a confirmed live wrong-entity-served defect. It should be the
very next selection under any honest application of the v2 formula (P+2 for live-wrong-data applies directly:
`RISK-017` itself states "wrong entity served to badges and data consumers," present tense, today).

**3. Require a CI-environment planted probe, not just a local one, before a gate's registry row may say
"Gated."** *Next action:* extend `probe.mjs`/`assertGateCatches` (or a CI-specific variant) so that a new gate's
first real CI run is checked to have actually executed against a genuine defect — e.g., a scratch commit on a
disposable branch that the gate must catch in an actual Actions run — before the registry is allowed to mark the
class "Gated" rather than "Gated locally, CI unverified." This would have caught DC-11's 8-day false-protection
gap and the DC-16/DC-17 shallow-clone hole at creation time instead of by later audit (both were found *after*
the fact, correctly, but at a measurable cost — RISK-025 carried an "unidentified second cause" for three days
because of exactly this gap, per Meta-review 4).
