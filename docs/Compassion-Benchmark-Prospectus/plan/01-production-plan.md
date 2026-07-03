# 01-production-plan.md

# Production Plan — Compassion Benchmark Funder Prospectus

**Document type:** Internal production and workflow reference for the writing panel and agent coordinator.
**Manuscript target:** 25,000–35,000 words (~33,800 budgeted). 30 chapters + 6 front-matter items + 6 appendices.
**Sources of truth:** `source_notes.md` (single fact source), `chapter-index.md` (blueprint). Do not derive facts from any other file without cross-checking §0 of `source_notes.md`.

---

## 1. BATCHING STRATEGY

### Batch 0 — Pre-flight (lock reference before any chapter drafts)

**Do this before any prose is written.**

Three appendices are load-bearing references. Chapters in Parts II, III, IV, and V cite specific dimension codes, evidence tiers, and assessment lifecycle steps. If these appendices shift after chapters are drafted, cascade corrections multiply.

| Appendix | Why it must lock first | Chapters that cite it |
|---|---|---|
| A — Eight Dimensions and Forty Subdimensions | All dimension codes (AWR, EMP, etc.), anchor language, and color assignments | Ch 6, 7, 8, 9, 10, 11, 12, 13 |
| B — Evidence Hierarchy | Five-tier structure; "T1 independent audit → T5 self-report"; weight logic | Ch 7, 8, 13, 15 |
| C — Assessment Lifecycle | Automated pipeline lane + human gate lane; session structure | Ch 8, 9, 24, 25 |

Also produce in Batch 0: `style-lock.md` (see Section 3). Every subsequent author receives it before drafting.

**Agent type:** Research/data agent with full access to `source_notes.md`, `dimensions.ts`, and `chapter-index.md`. No narrative prose required; this is lock-and-reference work.
**Word budget:** ~2,100 words across App A, B, C (draft form). Narrative polish applied in Batch 7.

---

### Batch 1 — Spine (anchor author only; establishes voice and throughline)

**One author. No parallel work. All other batches depend on this.**

| Item | Location | Words | Why it is spine |
|---|---|---|---|
| FM-4 Founder Letter | Front matter | 550 | Sets the personal voice; the "independence locked, not promised" anchor |
| FM-5 Executive Summary | Front matter | 1,150 | Crystallizes the complete argument; all sub-authors read this as their north star |
| Ch 1 The Decisions We Never See | Part I | 850 | The narrative hook that frames the entire manuscript |
| Ch 22 Theory of Change | Part V | 1,000 | The causal logic from which every public-benefit claim descends |
| Ch 30 Closing Vision | Part VI | 800 | The landing tone; closing echo of the cover |

FM-5 is written as a first draft here, capturing the argument. It is revised after all parts are drafted, before assembly, to reflect the actual manuscript content.

**Agent type:** Senior writing agent operating under `01-author-operating-system.md` and `02-editorial-style-guide.md` as primary constraints.
**Word budget:** ~4,350 words. Developmental rewrite and human-voice pass are applied to these pieces before any other batch begins.

---

### Batch 2 — Front Matter Remainder + Part I (non-spine)

Can begin once Batch 1 is complete.

| Items | Words |
|---|---|
| FM-1 Cover copy | 80 |
| FM-2 Inside cover | 150 |
| FM-3 Mission, vision, core belief | 300 |
| FM-6 How to read this publication | 350 |
| Ch 2 The Problem Is Not That Institutions Do Not Care | 800 |
| Ch 3 We Measure Almost Everything Except This | 850 |
| Ch 4 Why Existing Frameworks Fall Short | 900 |

**Agent type:** Writing agent. FM-1 through FM-3 require minimal invention; the inside-cover independence statement quotes GRANT_MODEL §4 Sec.5 verbatim.
**Word budget:** ~3,430 words.

---

### Batch 3 — Part II: The Standard (depends on App A, B, C being locked)

| Items | Words |
|---|---|
| Ch 5 What Compassion Benchmark Measures | 800 |
| Ch 6 The Eight Dimensions | 1,150 |
| Ch 7 Evidence Before Assertion | 850 |
| Ch 8 How Assessment Works | 1,100 |
| Ch 9 From Score to Improvement | 800 |

Ch 6 and Ch 8 contain the highest density of factual specificity in the manuscript: dimension codes, subdimension names, anchor scale, composite formula, integration premium, band boundaries. Every figure must match `source_notes.md §0` and App A/B/C exactly.

**Agent type:** Writing agent with close reading of Batch 0 output. Flag all quantitative claims for `claims-to-verify.md`.
**Word budget:** ~4,700 words.

---

### Batch 4 — Part III: Research Foundation

| Items | Words |
|---|---|
| Ch 10 Compassion as Observable Institutional Behavior | 850 |
| Ch 11 The Science Behind the Framework | 900 |
| Ch 12 Why Systems Matter More Than Intentions | 800 |
| Ch 13 Pressure Tests, Maturity Gates, and Character Over Time | 900 |

**Agent type:** Writing agent. Chapters are more argumentative than data-heavy. Ch 11 references the "science base" and may require soft-wording flags in `claims-to-verify.md`.
**Word budget:** ~3,450 words.

---

### Batch 5a — Part IV: Applications

| Items | Words |
|---|---|
| Ch 14 AI and Robotics | 900 |
| Ch 15 Healthcare and Human Services | 800 |
| Ch 16 Government and Public Service | 800 |
| Ch 17 Corporations and Employers | 800 |
| Ch 18 Nonprofits, Humanitarian Organizations, and Civil Society | 800 |

Ch 14 uses the AI/robotics safety framing module from `source_notes §1`. Ch 15 may reference UHG as a worked example — flag for defamation review in `claims-to-verify.md`. Ch 17 cites 448 Fortune 500 entities.

**Word budget:** ~4,100 words.

---

### Batch 5b — Part V: Public Benefit (can parallel 5a)

| Items | Words |
|---|---|
| Ch 19 A Shared Language for Institutional Accountability | 800 |
| Ch 20 Public Indexes and Open Research | 800 |
| Ch 21 Journalists, Policymakers, Researchers, and Communities | 800 |
| Ch 23 Measuring Impact | 850 |

Ch 22 is already written (Batch 1 spine). Ch 23 must flag all forward-looking KPI claims (source_notes §0 notes impact is forward-looking).

**Word budget:** ~3,250 words.

---

### Batch 6 — Part VI: Building the Institution (Ch 24–29)

Ch 30 already written (Batch 1 spine).

| Items | Words |
|---|---|
| Ch 24 Progress to Date | 900 |
| Ch 25 Technology Platform | 1,150 |
| Ch 26 Governance and Independence | 1,150 |
| Ch 27 Roadmap | 950 |
| Ch 28 Financial Sustainability | 1,050 |
| Ch 29 Funding Opportunities | 1,050 |

Ch 24 cites only [BUILT]-flagged items from source_notes. Ch 25 explains the nightly pipeline without inflating [PLANNED] capabilities into present tense. Ch 26 is governance-sensitive; the "two-plane independence diagram" and board design must match ORGANIZATION_PLAN §6 exactly.

**Agent type:** Writing agent with close reading of source_notes §5, §7, §8, §9, §10.
**Word budget:** ~6,250 words.

---

### Batch 7 — Appendices D, E, F + Refinement of A, B, C

| Items | Words |
|---|---|
| App D Governance Safeguards | 750 |
| App E Example Funding Packages | 850 |
| App F Suggested Graphics and Layout System | 600 |
| Revisions to App A, B, C from Batch 0 | minor |

**Word budget:** ~2,200 words new content.

---

## 2. DEPENDENCY ORDER

```
Batch 0: App A + App B + App C + style-lock.md
    |
Batch 1: Spine (FM-4, FM-5 draft, Ch 1, Ch 22, Ch 30)
    |
    +--- Batch 2: FM remainder + Part I (Ch 2-4)
    |
    +--- Batch 3: Part II (Ch 5-9) [requires Batch 0 locked]
         |
         +--- Batch 4: Part III (Ch 10-13)
              |
              +--- Batch 5a: Part IV (Ch 14-18) --+
              |                                    |
              +--- Batch 5b: Part V (Ch 19, 20,   |
                   21, 23) [Ch 22 already done]    |
                                                   |
              Batch 6: Part VI (Ch 24-29) ----------+
              |
         Batch 7: App D, E, F
```

---

## 3. CONTINUITY CONTROLS

### style-lock.md (produce in Batch 0; deliver to every subsequent agent before drafting)

The file is a single-page reference. It contains:

**Canonical voice sample** — three to five approved sentences pulled from the FM-5 draft after Batch 1 is complete. Every sub-author reads these first to calibrate register.

**Canonical terminology list:**

| Use | Never use |
|---|---|
| Compassion Benchmark | ACB / Applied Compassion Benchmark (in narrative) |
| 1,256 scored entities | 1,155 / 1,156 / 1,260 / "over a thousand" |
| v1.2 scoring / scoring model v1.2 | "the methodology" alone without version |
| 8 dimensions, 40 subdimensions | "aspects," "criteria," "pillars" |
| 5 evidence tiers / five-tier hierarchy | "evidence levels," "evidence categories" |
| nightly pipeline (automated) | "AI-generated scores" or "real-time scoring" |
| 7-session Human Assessment Battery | "manual assessment" |
| recognize, respond to, and reduce suffering | variations of this triad |
| Critical / Developing / Functional / Established / Exemplary | any other band names |

**Brand rules:** No em dashes. No public-facing "ACB." No "Applied Compassion Benchmark" in narrative. Periods after abbreviations (v1.2, not V1.2).

**Recurring motifs** (weave in, do not over-repeat; each chapter uses at most one):
- The measurement gap: we measure almost everything except whether institutions reduce suffering.
- Evidence beats aspiration.
- Compassion at institutional scale is a pattern of decisions, not a sentiment.
- Independence locked, not promised (verbatim from founder letter).
- Good people can work inside systems that still produce harm.
- The pressure test as character test.
- The Freedom House / TI CPI analogy for shared comparative measurement.
- The pipeline is already running (anchor claim of operational reality).

**Prohibited:** All phrases in `02-editorial-style-guide.md` Banned Phrases and Banned Patterns sections. Do not re-list them; instruct authors to read that file in full.

---

## 4. STAGED WORKFLOW — AGENT ORCHESTRATION SEQUENCE

Each draft batch goes through the following pass sequence before its chapters are accepted into the assembly. Passes run after each batch is drafted, not after the entire manuscript.

| Stage | Agent | Input | Output |
|---|---|---|---|
| 1. Draft | Writing agent (per batch) | source_notes.md, chapter-index.md, style-lock.md, Batch 0 appendices | Draft chapter files in `manuscript/` folder |
| 2. Developmental rewrite | Developmental editor agent (uses `prompts/critique-chapter.md`, `prompts/revise-chapter.md`) | Draft chapter | Rewritten chapter with structural issues resolved; annotation of cuts |
| 3. Human voice pass | Voice agent (uses `prompts/rewrite-for-human.md`, `prompts/eliminate-ai-slop.md`) | Rewritten chapter | Chapter with AI-sounding prose removed; cadence varied |
| 4. Funder readiness pass | Funder agent (uses `prompts/revise-chapter.md` with funder lens) | Voice-clean chapter | Chapter with funder questions embedded in the argument, not bolted on |
| 5. Evidence and claims pass | Claims agent | All chapters in the batch | Entries appended to `claims-to-verify.md`; flags on unsupported claims, market size, legal assertions, [PLANNED] items stated as current |
| 6. Layout pass | Layout agent (uses `08-layout-and-design.md`) | Finished chapter text | Entries appended to `layout-notes.md` and `graphics-plan.md`; one visual per chapter confirmed |
| 7. Assembly | Coordinator agent | All passed chapter files | `compassion-benchmark-funder-prospectus.md`; FM-5 revised to reflect full manuscript |
| 8. Quality gates | QA agent (uses `07-quality-gates.md`, `prompts/publication-review.md`, `prompts/final-editorial-pass.md`) | Full assembled manuscript | Gate pass/fail report; revision list or PASS certification |
| 9. Supporting files | Coordinator | Accumulated notes | `funder-summary.md` (standalone 3–5 page condensed version) |

Passes 2–4 can be collapsed into a single "editorial agent" session per batch if token budget allows. Pass 5 is always separate; claims accuracy and legal caution require a clean, focused pass.

---

## 5. QUALITY-GATE AND CLAIMS DISCIPLINE

**Gate checklist** derived from `07-quality-gates.md`:

- [ ] Gate 1 Strategic Coherence: manuscript moves problem → gap → standard → public benefit → readiness → funding opportunity. Funding does not appear before need is established.
- [ ] Gate 2 Human Voice: no chapter passes with uniform paragraph length, stacked aphorisms, AI cadence, or language that sounds like any other nonprofit report.
- [ ] Gate 3 Specificity: each chapter contains at least one insight specific to Compassion Benchmark that survives a name-replacement test.
- [ ] Gate 4 Reader Momentum: a busy, skeptical program officer would continue past each chapter opening.
- [ ] Gate 5 Funder Readiness: manuscript answers why this matters, why now, why this organization, why philanthropy, what changes if funded, how independence is protected, how impact is measured, how the work sustains. Answers are embedded in argument, not appended.
- [ ] Gate 6 Evidence Discipline: no unsupported market size, legal, tax, impact, or uniqueness claims in final text; all flagged items resolved or soft-worded.
- [ ] Gate 7 Brand Discipline: global search confirms zero instances of "ACB" (narrative), "Applied Compassion Benchmark" (narrative), em dashes, or 1,155 / 1,156 as entity count.
- [ ] Gate 8 Structural Completeness: all 30 chapters, 6 front-matter items, 6 appendices, all 7 output files present.
- [ ] Gate 9 Layout Readiness: every chapter has a confirmed visual, pull-quote candidate, and layout note.
- [ ] Gate 10 Final Acceptance: a professional editor believes this was written by one experienced author; a program officer would continue beyond the Executive Summary; a journalist could quote individual passages unedited.

**claims-to-verify.md maintenance:**

One file, maintained incrementally. The claims agent appends entries after each batch. Format per entry: claim text | manuscript location | why verification is needed | suggested source type | recommended interim wording. The coordinator reviews the file before assembly and ensures no unresolved item remains in the manuscript without soft wording or explicit [NEEDS VERIFICATION] annotation. Owner: whoever runs the evidence and claims pass (Stage 5 above).

---

## 6. OUTPUT FILE MAP

All files live under `docs/Compassion-Benchmark-Prospectus/` unless noted.

| File | Path (relative to prospectus folder) | Status |
|---|---|---|
| `source_notes.md` | `source_notes.md` | Exists |
| `chapter-index.md` | `chapter-index.md` | Exists |
| `style-lock.md` | `style-lock.md` | Produce in Batch 0 |
| `claims-to-verify.md` | `claims-to-verify.md` | Produce during Stage 5 passes |
| `graphics-plan.md` | `graphics-plan.md` | Produce during Stage 6 passes |
| `layout-notes.md` | `layout-notes.md` | Produce during Stage 6 passes |
| `funder-summary.md` | `funder-summary.md` | Produce in Stage 9 (post-assembly) |
| `compassion-benchmark-funder-prospectus.md` | `compassion-benchmark-funder-prospectus.md` | Produce in Stage 7 (assembly) |
| Draft chapter files | `manuscript/front-matter/fm-01.md` through `fm-06.md` | Produce in Batches 1–2 |
| Draft chapter files | `manuscript/part-1/ch-01.md` through `ch-04.md` | Produce in Batches 1–2 |
| Draft chapter files | `manuscript/part-2/` through `manuscript/part-6/` | Produce in Batches 3–6 |
| Draft appendix files | `manuscript/appendices/app-a.md` through `app-f.md` | Produce in Batches 0 and 7 |

The `manuscript/` subfolder holds per-chapter working files. The final assembled manuscript is the single file at the root of the prospectus folder. The `plan/` subfolder holds this document and any future planning artifacts.

---

## 7. EXECUTION ORDER

| Step | Action | Est. agent sessions |
|---|---|---|
| 1 | Lock Appendices A, B, C; produce `style-lock.md` (Batch 0) | 1 |
| 2 | Write spine: FM-4, FM-5 first draft, Ch 1, Ch 22, Ch 30 (Batch 1); apply passes 2–4 immediately | 2 |
| 3 | Write FM remainder + Part I — Ch 2, 3, 4 (Batch 2); apply passes 2–4 | 1–2 |
| 4 | Write Part II — Ch 5–9 (Batch 3); apply passes 2–5 (evidence pass is critical here) | 2 |
| 5 | Write Part III — Ch 10–13 (Batch 4); apply passes 2–5 | 1–2 |
| 6 | Write Part IV — Ch 14–18 (Batch 5a); apply passes 2–5 | 1–2 |
| 7 | Write Part V — Ch 19, 20, 21, 23 (Batch 5b); apply passes 2–5 | 1–2 |
| 8 | Write Part VI — Ch 24–29 (Batch 6); apply passes 2–5 | 2 |
| 9 | Write App D, E, F; finalize App A, B, C (Batch 7) | 1 |
| 10 | Layout pass across all chapters; complete `graphics-plan.md`, `layout-notes.md` | 1 |
| 11 | Assemble full manuscript; revise FM-5 to match final content | 1 |
| 12 | Quality gates pass; revise until all 10 gates pass or unresolved items documented | 1–2 |
| 13 | Produce `funder-summary.md` | 1 |

**Estimated total agent sessions: 16–21.** The range depends on whether passes 2–4 are collapsed (fewer sessions, longer context) or run separately (more sessions, tighter focus). Recommend collapsing passes 2–4 into one editorial session per batch and keeping pass 5 (claims) and pass 6 (layout) as separate focused sessions.

**Critical path:** Batch 0 must complete before Batch 3 begins. Batch 1 must complete before any other batch begins. Batches 5a and 5b can run in parallel with each other. Batch 7 can begin once Batch 6 is in its editorial passes. The FM-5 revision (Step 11) is the last thing before assembly acceptance — it must reflect the actual manuscript, not the first-draft argument outline.
