# QC Report: Compassion Benchmark Funder Prospectus
**Audit date:** 2026-06-28
**Manuscript:** `compassion-benchmark-funder-prospectus.md`
**Auditor role:** QA Engineer
**Status:** CONDITIONAL FAIL — 4 must-fix blockers before funder delivery

---

## Overall gate verdicts

| Gate | Result | Summary |
|---|---|---|
| 1. Brand/Mechanical | CONDITIONAL PASS | Em dashes: 0. Brand clean. Banned phrase "leverage" used 5 times as jargon. |
| 2. Structure | CONDITIONAL PASS | All 30 chapters + 6 appendices present. 3 required output files missing. |
| 3. Word Count | FAIL | ~39,830 raw words; estimated ~3,300-4,900 over the 35,000-word ceiling. |
| 4. Voice/AI-Slop | CONDITIONAL PASS | No high-risk slop phrases found. "leverage" and "ecosystem" are the only banned-phrase hits. |
| 5. Funder-Readiness | CONDITIONAL PASS | All 8 funder questions answered in substance. 4 unfilled [PERSONALIZE] blocks in Founder Letter are a hard blocker. |
| 6. Claims/Honesty | PASS | All high-risk claims correctly handled and flagged. Outstanding verification items are correctly deferred, not suppressed. |

---

## Gate 1: Brand and Mechanical

**Method:** grep on the assembled manuscript for the specific character and strings.

### Em dashes
`grep` for the em dash character (—): **0 hits.** PASS.

### Banned brand names
`grep` for "ACB" and "Applied Compassion Benchmark": **0 hits.** PASS.

### Stale entity counts
`grep` for "1,155" and "1,156": **0 hits.** PASS.

The correct count "1,256" appears throughout and is used correctly in the per-index breakdown (193 countries, 448 Fortune 500, 250 global cities, 50 AI labs, 50 robotics labs, 21 US states, 144 US cities, 100 universities).

### Scoring model version
"v1.2" referenced at lines 125, 392, 777, 795, 940, 1105, 1169, 1276. PASS.

### Formula and bands
The formula `((mean − 1) / 4) × 100` is stated correctly at line 394 and reproduced in the graphic callout at line 403. The five bands are correctly stated at line 405 as "Critical 0-20, Developing 20-40, Functional 40-60, Established 60-80, Exemplary 80-100." Band boundaries do not use 21/41/61/81. Integration premium cap "+10" stated correctly at multiple points. PASS.

### Banned phrase: "leverage"
"leverage" is banned by style-lock.md and 02-editorial-style-guide.md. It appears **7 times** in the manuscript. Two uses (lines 728 and 919) deploy "leverage" in the valid English sense of "power/influence." Five uses are the jargon-filler pattern the rule targets:

- Line 801: "The leverage story funders respond to lives here..."
- Line 813: "That figure is the whole leverage argument compressed into a number."
- Line 899: "this kind of high-leverage, underexplored bet"
- Line 901: "What unites all three packages is the leverage argument that recurs through this document..."
- Line 1126: "The leverage story is the cost per entity..."

FAIL — 5 instances require substitution.

### Banned phrase: "ecosystem"
"ecosystem" appears once at line 891: "the AI-safety regranting ecosystem." FAIL — 1 instance. Replace with "the AI-safety regranting field" or "the AI-safety grantmaking world."

### "mission-driven" (used as filler)
Appears once at line 635: "the case for scoring mission-driven institutions is undercut the moment it overstates itself." Used here as a category descriptor, not a filler intensifier. The claims-to-verify file (part IV, claim 18.4) already flags this and concludes it is "sparingly and substantively" used. This is a borderline instance, not a hard fail.

### "holistic"
Appears once at line 1275: "No score is a single holistic verdict that one person can adjust." Used as a precise adjective, not as jargon filler. Borderline; defensible in context but a reviewer will notice it on the banned list.

---

## Gate 2: Structure

**Method:** `grep` for all `# ` headings in the manuscript; `find` for required output files.

### Front matter items 1-6
All six front matter sections are present in the assembled manuscript in the correct order:

1. Cover copy (with tagline and back cover) — present
2. Inside Cover — present
3. Mission, Vision, and Core Belief — present
4. Founder Letter — present (with [PERSONALIZE] placeholders; see Gate 5)
5. Executive Summary — present
6. How to Read This Publication — present

Note: Lines 1-8 carry a document metadata block (title, subtitle, draft date) followed at lines 12-18 by the cover chapter. This is correct structure for an assembled document; it is not a duplicate error.

### Chapters 1-30
All 30 chapters present in correct part order. PASS.

### Appendices A-F
All six appendices present. PASS.

### Required output files per 06-output-specification.md

| File | Status |
|---|---|
| `compassion-benchmark-funder-prospectus.md` | PRESENT |
| `chapter-index.md` | PRESENT |
| `source_notes.md` | PRESENT |
| `claims-to-verify.md` | PRESENT |
| `graphics-plan.md` | MISSING |
| `layout-notes.md` | MISSING |
| `funder-summary.md` | MISSING |

**Three required output files are absent.** Note: `plan/04-graphics-layout-plan.md` and `chapters/appendix-F-graphics-and-layout-system.md` together cover some of the ground those files would cover, but they are not named per spec and are not standalone deliverables. The 06-output-specification.md requires exactly those three filenames at the root of the prospectus folder.

### GRAPHIC placeholder notes
35 `[GRAPHIC:]` instruction blocks appear in the manuscript. These are correct: they are layout-ready instructions to the designer and should remain. They are not errors.

---

## Gate 3: Word Count

**Method:** `wc -w` on the assembled manuscript.

Raw word count: **39,830 words.**

The raw figure includes 35 `[GRAPHIC:]` instruction blocks (averaging ~45 words each = ~1,575 words), 4 `[PERSONALIZE]` blocks (~100 words total), and markdown heading text. Stripping these artifacts reduces the estimate to approximately **37,500-38,200 prose words.**

Target: 25,000-35,000 words (chapter-index budget: ~33,830 words).

**Overage: approximately 2,500-4,830 words, or 7-14% above ceiling.** FAIL.

The chapter-index identifies Part IV (Applications) and the Appendices as the compression priority. Appendices are currently reference tables; Part IV has the most formulaic structure. Chapters 24-30 and the Executive Summary are flagged as full-length anchors that should not be cut.

---

## Gate 4: Voice and AI-Slop

**Method:** grep for each banned phrase in 02-editorial-style-guide.md and style-lock.md; manual read of chapter openings for structural pattern violations.

### High-risk phrase scan results (0 hits on all of these)

"this highlights," "this underscores," "taken together," "ultimately," "as we have seen," "this publication explores," "this chapter examines," "the following section," "imagine a world," "one thing is clear," "in today's rapidly changing world," "now more than ever," "at its core," "the reality is," "the truth is," "it is important to note," "unlock," "paradigm," "innovative" (as jargon), "transformative," "scalable solution," "game changer," "stakeholder."

All return 0 hits. The most common AI-slop indicators are absent. PASS on this sub-check.

### Hits requiring action

"leverage" — 5 jargon instances (see Gate 1). The noun phrase "leverage story" (lines 801, 1126) and "leverage argument" (lines 813, 901) are the clearest filler uses; "high-leverage" (line 899) is the adjective form.

"ecosystem" — 1 instance (line 891). Light but on the banned list.

### Banned patterns (structural)

A spot-check of chapters 1-4, 14-15, 22, 28-29 found no three-consecutive-same-length-paragraph stacking, no repeated chapter-opening grammatical structure, and no section endings that merely summarize. The document demonstrates genuine paragraph variation. PASS.

No chapter was found to use more than three rhetorical questions. PASS.

"Not X, but Y" contrast pairs appear sparingly and well below the threshold. PASS.

---

## Gate 5: Funder-Readiness

**Method:** Confirm the eight Gate 5 questions per 07-quality-gates.md are answered in the manuscript.

| Question | Answer present? | Location |
|---|---|---|
| Why this matters | YES | Part I (Ch 1-4), Exec Summary opening, mission statement |
| Why now | YES | Exec Summary §"Why philanthropy, and why now" (line 143); Ch 14 AI/robotics timing argument; Ch 27 roadmap context |
| Why this organization | PARTIAL — blocked by placeholders | Exec Summary, Ch 24 progress-to-date; but Founder Letter (the primary "why this org" vessel) has 4 unfilled [PERSONALIZE] blocks |
| Why philanthropy | YES | Exec Summary §"Why philanthropy, and why now"; Ch 28 financial sustainability (line 881) |
| What changes if funded | YES | Exec Summary ask paragraph (line 149); Ch 29 three funding packages; Ch 30 closing vision |
| How independence is protected | YES | Exec Summary §"Why independence is the product" (line 139); Ch 26 in full; Appendix D |
| How impact will be measured | YES | Ch 23 in full; KPI framework with explicit zero baselines |
| How the work becomes sustainable | YES | Ch 28 financial sustainability; diversified grant + earned revenue model described |

### Founder Letter [PERSONALIZE] placeholders — HARD BLOCKER

Four blocks in the Founder Letter are not yet written:

- Line 86: `[PERSONALIZE: origin moment...]` — the specific situation the founder witnessed. This is the document's primary answer to "why this organization" and "why this person."
- Line 94: `[PERSONALIZE: the hardest design decision...]` — the independence architecture choice and what it cost.
- Line 98: `[PERSONALIZE: a moment of doubt...]` — the specific thing that resolved the measurability question.
- Line 104: `[PERSONALIZE: one sentence on what Phil personally commits...]` — the first-funder commitment.

These placeholders are structurally central. The Founder Letter cannot be sent to any funder in its current state. Every other funder-readiness answer depends on the credibility the Founder Letter establishes.

---

## Gate 6: Claims and Honesty

**Method:** Read the claims-to-verify.md register in full (390 lines across 6 parts); cross-check named claims in the assembled manuscript against the style-lock canonical numbers.

### High-risk claims — disposition

**UnitedHealth Group 10.2, Critical band:**
Stated correctly at lines 100, 129, 434, 575. The "opinion-on-disclosed-facts" framing ("the sum of eight dimension scores, each anchored in sourced evidence") appears adjacent to each named use. The DOJ probe is described as a "federal probe" with a "tier upgrade with no composite change" — correctly framed. Defamation review flagged in claims-to-verify part II, item 1 and part IV, item 15.1. PASS for honesty; editorial/legal review still required before print.

**Harvard 52.3, university mean 46.2, zero Exemplary universities:**
Stated correctly at lines 129, 542. Sourced to source_notes §6. PASS.

**USC 36.7, NYU 39.1, Columbia 44.5:**
These three appear in Appendix F at line 1426 only (in the chart-buildable-now list). Not named in the body text. PASS — no overclaim.

**Integrity audit:**
Correctly described in the manuscript as "specified and partly built, not yet running on its own" (line 133), "designed and in rollout" (Appendix D, line 1280). Does not import the ORGANIZATION_PLAN §6 "already operational" phrasing that source_notes flagged as incorrect. PASS.

**Score-Watch:**
Correctly described as "sold" but "automated delivery ... is still being finished" (line 133, and echoed in claims-to-verify part V, item 21.1). PASS.

**501(c)(3) and bylaw:**
The 501(c)(3) is consistently described as "planned, not yet established" (line 133, Ch 26). The independence bylaw is described as "intended for a supermajority-locked bylaw" (line 141), not as enacted. PASS.

**Impact baselines:**
"No external citation of these scores has yet been documented; the baseline is zero. No institution has visibly changed its conduct because of a published score." (Line 133.) Zero-baseline stated at the top of the document and repeated throughout Ch 23. PASS.

**OpenAI 26.7 + multistate AG inquiry:**
Line 561 states both. Claims-to-verify part IV, items 14.1 and 14.2 flag both for pre-print verification. The source phrasing "42-state subpoena" was already softened to "multistate attorney-general inquiry" in the manuscript — a defensible hedge. The score needs confirming against the live JSON before print; the AG clause needs a primary source or should be cut. Correctly flagged; not a current overclaim. PASS for honesty in current draft; SHOULD-FIX before print.

**Israel 0.0 and Sudan 0.0 floor designations:**
Correctly stated at line 605 with full floor-designation criteria explanation. Claims-to-verify part IV, item 16.1 flags both for legal/editorial review before print. PASS for honesty in current draft; legal review required before print.

**Claims-to-verify completeness:**
The register covers all six parts (FM/Part I through Part VI) with 40+ itemized claims. It correctly captures every category the style-lock identifies as high-risk. PASS.

### One unresolved tension in the manuscript

**CSV data export wording (Ch 20, line ~678 area and Ch 21):** source_notes states the bulk data feed is "buildable now" but not necessarily currently shipping as an export. Claims-to-verify part V, items 20.4 and 21.3 flag this tension but it has not yet been resolved to a single agreed phrasing. The two chapters may currently use inconsistent language. This is a SHOULD-FIX before print.

---

## Prioritized fix list

### Must-fix before sending to any funder

**MF-1. Fill the Founder Letter [PERSONALIZE] placeholders.**
Lines 86, 94, 98, 104. The Founder Letter is the document's central answer to "why this person/organization." Four of its five narrative beats are scaffolding, not prose. No funder should receive this document until these four passages are written by the founder in his own voice and reviewed against the style-lock.

**MF-2. Reduce word count to target range (35,000 words maximum).**
Estimated overage: 2,500-4,900 words. Per the chapter-index, compress Part IV (Applications, Ch 14-18) and the appendices first. Ch 14 (AI/robotics) and Ch 15 (healthcare) have the most redundancy with Part III. Appendices B and D are the most compressed-without-loss candidates (both are primarily reference tables). Chapters 24-30 and the Executive Summary should hold length.

**MF-3. Replace "leverage" (jargon) in 5 locations.**
Lines 801, 813, 899, 901, 1126. Suggested replacements:
- Line 801: "The case funders respond to lives here..."
- Line 813: "That figure is the cost argument compressed into a number."
- Line 899: "exactly this kind of high-return, underexplored bet"
- Line 901: "What unites all three packages is the cost-efficiency argument..."
- Line 1126: "The efficiency case is the cost per entity..."

**MF-4. Create the three missing required output files.**
`graphics-plan.md`, `layout-notes.md`, and `funder-summary.md` are specified in 06-output-specification.md as required deliverables. Appendix F and `plan/04-graphics-layout-plan.md` provide most of the source material. The funder-summary.md (3-5 pages, per spec) is the most urgent: it is the standalone document needed for grant attachments and introductory funder emails, and it does not exist in any form.

---

### Should-fix before print

**SF-1. Replace "ecosystem" (jargon) at line 891.**
"the AI-safety regranting ecosystem" → "the AI-safety regranting field."

**SF-2. Resolve the CSV "exists today vs. buildable now" tension.**
Claims-to-verify items 20.4 and 21.3. Ch 20 and Ch 21 may say inconsistent things about the bulk data export. Pick the accurate word ("buildable on request" or "available as a data export") and apply it consistently in both chapters before print.

**SF-3. Verify or cut the OpenAI AG inquiry clause.**
Line 561: "while it is the subject of a multistate attorney-general inquiry." This is an externally checkable, legally sensitive factual assertion about a named entity. Either confirm against primary reporting before print, or cut the clause and rest the example on the score alone. Do not ship unconfirmed.

**SF-4. Reconcile Year-2 budget target.**
Claims-to-verify part VI, item 1378: the grant model cites $300k-$600k; source_notes §10 cites $300k-$750k. The prospectus uses $300k-$600k (Appendix E). Either confirm $300k-$600k as canonical and update source_notes, or reconcile to a single figure across Appendix E and any other Part VI mention.

**SF-5. Confirm V-Dem indicator characterization.**
Claims-to-verify part III, item 7. Ch 11 reads "thousands of specific indicators coded by a large, deliberately distributed body of coders." Source_notes says "~3,500 coders," not a count of indicators. The indicator count should not be asserted unless confirmed; the coder count is the sourced fact. Reword to: "coded by a distributed body of roughly 3,500 coders."

---

### Nice-to-have

**NH-1. Review "holistic" at line 1275.**
"No score is a single holistic verdict" is the only instance. The phrase is technically on the banned list but is being used precisely. A reviewer will notice it; consider substituting "unified" or "single overall."

**NH-2. Review "mission-driven" at line 635.**
Used as a category descriptor. The claims-to-verify already notes it is "sparingly and substantively" used. If any editor applies a strict reading of the ban, the phrase "organizations that claim compassionate purpose" is the natural replacement suggested in the style guide's examples.

**NH-3. Reconcile fiscal-sponsor fee band.**
Claims-to-verify part VI, item 14: ORGANIZATION_PLAN §5 cites 4-10%; Ch 28 uses 5-10% per GRANT_MODEL §7. Pick one band and apply it uniformly so the two source documents do not create a discrepancy a funder might notice.

**NH-4. Confirm all "open methodology" elements are genuinely public-facing.**
Claims-to-verify part V, item 20.1. Before print, verify that the v1.2 formula, premium multipliers, and all methodology elements described as "published in full today" are actually on the live public site — not only in internal documents. This is a fact-check, not a rewrite.

---

## Summary for handoff

**What was validated:** The assembled manuscript (1,449 lines, ~39,830 raw words), all 7 required output files (of which 4 exist), the chapter-index structure, style-lock rules, editorial-guide banned-phrase list, and claims-to-verify register.

**What passed:**
- Zero em dashes. Zero "ACB" or "Applied Compassion Benchmark" in prose. Zero stale entity counts.
- All chapters 1-30 and appendices A-F present in correct order.
- Formula, band boundaries, and version number all correct throughout.
- No high-risk AI-slop phrases found.
- All six funder-readiness questions substantively answered (with one placeholder exception).
- All named high-risk claims (UHG 10.2, Harvard 52.3, university mean, integrity-audit status, Score-Watch status, 501(c)(3) as planned, impact baselines = 0) handled honestly and captured in claims-to-verify.

**What failed:**
- Word count over ceiling by an estimated 2,500-4,900 words (Gate 3 FAIL).
- 4 unfilled [PERSONALIZE] placeholders in the Founder Letter (Gate 5 CONDITIONAL FAIL).
- 3 required output files absent: graphics-plan.md, layout-notes.md, funder-summary.md (Gate 2 CONDITIONAL FAIL).
- 5 jargon uses of "leverage" + 1 use of "ecosystem" (Gate 1 CONDITIONAL FAIL on banned phrases).

**Blocker status:** The document cannot be delivered to a funder until MF-1 through MF-4 are resolved. Gates 3 and 5 are the highest risk — a funder receiving a letter with placeholder text or a document running ~14% over its stated word target would have a legitimate confidence question about publication readiness.

**Recommended next action:** Return to writer/founder for MF-1 (Founder Letter personalization) and MF-2 (targeted compression of Part IV + appendices). MF-3 and MF-4 are editor-executable without the founder.
