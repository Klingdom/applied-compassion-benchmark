# Briefing Evidence — Knowledge & Trust Review — 2026-06-11

**Agent:** knowledge-architect
**Lens:** how primary evidence (verbatim quotes + source URLs) and the separation of evidence from interpretation build *comprehension* and *credibility* fast — without re-bloating the page (Wave E1 density discipline holds).
**North star claim under test:** "Every score is traceable to a primary source." Today the briefing *asserts* this; it does not *show* it.

Scope reviewed (all claims grounded in files):
`site/src/data/updates/daily/2026-06-08.json` (topSignals, recentAssessments, sectorAlerts, methodologyNotes); `docs/DAILY_BRIEFING_SCHEMA.md`; `briefing/EvidenceLedger.tsx`; `briefing/SignalCard.tsx` + `SignalStack.tsx`; `briefing/ScoreMovementCard.tsx`; `briefing/LeadSignalCard.tsx`; `briefing/TodaysAnalysisSection.tsx`; `DailyBriefing.tsx` (incl. `LegacyScoreChangesSection`, `FloorConductSection`); `research/change-proposals/india-2026-06-01.json` (`key_evidence`). Prior: `CONTENT_STRATEGY_KNOWLEDGE_2026-06-10.md`, `UPDATES_BACKLOG2_2026-06-10.md` (#6 evidence/interpretation separation).

Scoring key: each metric 1–5. **Priority = Impact + Strategic Alignment + Learning Value + Confidence − Effort − Risk.** (Range −2 to +18.)

---

## The convergent finding

The benchmark's most defensible trust asset — **the rich, verbatim, attributed evidence that already exists upstream** — is destroyed before it reaches the reader.

1. **The richest evidence already exists, in a structured field, and is dropped at publish time.** `research/change-proposals/india-2026-06-01.json` `key_evidence` carries six entries with *direct verbatim quotes and named sources*: HRW — "several of them turned out to be Indian citizens, mostly impoverished migrant workers"; the UN special rapporteur citing "blatant disregard for the lives and safety" of protected persons; the May 2 SOP detail; the Calcutta HC reversal. In the public `2026-06-08.json`, India collapses to one paraphrased `whyHeadline` ("~5,000 Bengali-Muslim deportations without due process deepen the EQU 1.3/EMP 1.4/ACC 1.4 profile") and **no URL at all**. The quote that makes the finding *visceral and checkable* never ships.

2. **Evidence and interpretation are fused into one prose blob.** Every `topSignals[].description` and every `recentAssessments[].whyHeadline` welds *what was observed* ("656 drones and 73 missiles, 22 civilians killed") to *what we concluded* ("active-perpetration floor holds; reinforces without creating further scoring movement"). The reader cannot tell the source-grounded fact from the benchmark's editorial call — which is exactly the line independence depends on.

3. **The "traceability" promise is contradicted by the link layer.** `recentAssessments` exposes at most **one** `primaryEvidenceUrl`, rendered as a bare 24px icon (`ScoreMovementCard.tsx` 244–269) — yet the UAE finding rests on **four independent source chains** (UN FFM, Conflict Insights Group, Amnesty, Sudan ICJ filing), all named in prose but **none linked**. Meanwhile `EvidenceLedger.tsx` — the page's dedicated "primary sources reviewed" table — looks only for `topSignals[].sources[]`, `sectorAlerts[].sources[]`, and `scoreChanges[].evidence[]` (lines 79–118). **None of those arrays exist in the post-cutoff briefing shape.** So on the 2026-06-08 issue the Evidence Ledger renders *nothing* (`rows.length === 0 → return null`, line 125), and `DailyBriefing.tsx`'s `hasEvidenceSources` guard (238–247) drops the jump-nav chip too. The marquee trust surface is dark on a day with ~30 primary sources in play.

The fix is not "more data" — the data is upstream. It is a **thin evidence contract** (quote + source array) wired end-to-end, rendered with **consistent formatting** and **progressive disclosure** so density stays flat.

---

## Candidate 1 — Add a verbatim-quote + multi-source evidence array to the schema and pipe it through (the keystone)

**Surface:** Schema (`DAILY_BRIEFING_SCHEMA.md` §2e) + overnight digest emitter + `recentAssessments[]` / `topSignals[]` consumers.

**Problem (file evidence + cost).** The upstream proposal `india-2026-06-01.json` has `key_evidence[]` with quotes and attributions; the public schema's `recentAssessments[]` (schema 103–119) has only optional scalar `primaryEvidenceUrl` and paraphrased `whyHeadline`. The transform from proposal → public briefing **discards the quote and collapses N sources to ≤1 URL** (India: 0 URLs shipped). Comprehension cost: a paraphrase ("without due process") is abstract and unmemorable; the verbatim "several of them turned out to be Indian citizens" is concrete, sticky, and self-evidently damning — the reader *understands* faster and *believes* more. Trust cost: a single icon-link cannot substantiate a four-source finding, so the strongest cases look the *least* sourced.

**Proposed change.** Add one optional structured field to `recentAssessments[]` and `topSignals[]`:
```jsonc
"evidence": [
  { "quote": "several of them turned out to be Indian citizens, mostly impoverished migrant workers",
    "source": "Human Rights Watch — World Report 2026",
    "url": "https://www.hrw.org/...",
    "sourceType": "ngo",          // optional; inferable from domain
    "dimension": "EQU" }          // optional; ties evidence → score
]
```
Keep `whyHeadline`/`primaryEvidenceUrl` for backward compatibility (the array supersedes when present). The digest already *has* `key_evidence`; this is a field-mapping step, plus a quote-length cap (≤30 words) and a "must be verbatim, no editorializing inside `quote`" lint rule that piggybacks on the existing `lint-daily-briefings.mjs` phrase scanner.

**Knowledge/trust benefit.** Unlocks every candidate below. Turns "trust us" into "here is the sentence, here is the link." Verbatim + attributed = higher comprehension *and* higher credibility in the same line.

**Independence check:** PASS — strengthens it. A verbatim, externally-linked quote is the purest evidence-first artifact; the `quote` lint rule forbids interpretation leaking into the evidence field, hard-coding the separation.

| Impact | Strat. Align | Learning | Confidence | Effort | Risk |
|---|---|---|---|---|---|
| 5 | 5 | 5 | 5 | 3 | 2 |

**Priority = 5+5+5+5 − 3 − 2 = 15**

---

## Candidate 2 — Split every assessment into a labeled "Evidence" vs "Our reading" structure (the separation, made visible)

**Surface:** `ScoreMovementCard.tsx`, `LeadSignalCard.tsx`; backlog #6.

**Problem (file evidence + cost).** `LeadSignalCard` already gestures at this with a two-column "What happened" / "Why it matters" grid (lines 139–163) — but it builds both columns by *naively sentence-splitting one paragraph* (`description.split(/(?<=[.!?])\s+/)`, sentences 0–1 vs 2–3, lines 68–71). So "what happened" and "why it matters" are whatever sentences happen to land in slots 0–1 vs 2–3 — not a real evidence/interpretation boundary. `ScoreMovementCard` doesn't separate at all: `whyHeadline` (a *conclusion*) is the only descriptive line (165–172). The reader is never shown a clean "this is the observed fact / this is the benchmark's inference" seam — the exact distinction the independence policy rests on.

**Proposed change.** Once Candidate 1 ships, render two explicitly labeled blocks wherever an assessment appears:
- **EVIDENCE** — the `evidence[]` quotes + source chips (verbatim, linked). Neutral, externally attributable.
- **OUR READING** — the `whyHeadline`/conclusion + the dimension deltas (`dominantDimension`). Clearly the benchmark's call.

Reuse the existing uppercase-micro-label treatment (`text-[0.68rem] uppercase tracking-[0.18em] text-muted`, already in `LeadSignalCard` 143/155 and `ScoreMovementCard` 146). Stop the sentence-split heuristic in `LeadSignalCard`; drive the two blocks from real fields.

**Knowledge/trust benefit.** Teaches the reader the single most important meta-fact about the benchmark — *facts are sourced; scores are our inference from them* — and reinforces it on every card. A reader can audit the evidence and disagree with the reading, which is precisely what a credible independent benchmark invites.

**Independence check:** PASS — this *is* the independence policy rendered as UI. Makes "entities never pay to change findings" legible: findings are visibly downstream of cited evidence.

| Impact | Strat. Align | Learning | Confidence | Effort | Risk |
|---|---|---|---|---|---|
| 5 | 5 | 5 | 4 | 3 | 2 |

**Priority = 5+5+5+4 − 3 − 2 = 14**

---

## Candidate 3 — Fix the Evidence Ledger so it actually reads the post-cutoff shape (repair the dark trust surface)

**Surface:** `EvidenceLedger.tsx` (extractor 55–121) + `DailyBriefing.tsx` `hasEvidenceSources` guard (238–247).

**Problem (file evidence + cost).** The Evidence Ledger is the page's explicit "Primary sources reviewed in this briefing cycle" table — the literal embodiment of the traceability claim. Its extractor only mines `topSignals[].sources[]`, `sectorAlerts[].sources[]`, and `scoreChanges[].evidence[]` (79–118). The 2026-06-08 briefing has **none** of those arrays — its links live in `recentAssessments[].primaryEvidenceUrl` (9 of them) and as *unlinked prose* in descriptions. Result: `rows.length === 0` → the section returns `null` (125), and the matching nav guard hides the chip. On a cycle with a band crossing built on four source chains, the "sources reviewed" table **shows nothing** — actively undermining the trust claim it was built to prove.

**Proposed change.** Extend `extractSourcesFromSignals` to also harvest (a) `recentAssessments[].primaryEvidenceUrl` (with `entity`, `index`, `dominantDimension.code` → the Dimension column it already has), and (b) once Candidate 1 lands, every `evidence[].url`. Mirror the same source-type inference (`inferSourceType`, 11–24) for free badges. Update `hasEvidenceSources` (238–247) to match. Net effect today: the ledger fills with ~9 attributed rows; after Candidate 1, ~25–30. Zero new sections, zero added height on the lead cards (the ledger already exists, lower on the page).

**Knowledge/trust benefit.** The "every source, in one auditable table" promise becomes real on every issue. A skeptic can scan domain + type + entity + dimension + link in one place — the strongest single credibility artifact on the page, currently empty.

**Independence check:** PASS — pure auditability gain.

| Impact | Strat. Align | Learning | Confidence | Effort | Risk |
|---|---|---|---|---|---|
| 4 | 5 | 4 | 5 | 1 | 1 |

**Priority = 4+5+4+5 − 1 − 1 = 16**

---

## Candidate 4 — Progressive-disclosure evidence: lead claim → one quote → full source chain in a `<details>`

**Surface:** `ScoreMovementCard.tsx` / `LeadSignalCard.tsx`; pattern precedent: audit-trail `<details>` in `DailyBriefing.tsx` (374–445).

**Problem (file evidence + cost).** Two failure modes pull in opposite directions. (a) Today: the card shows a conclusion only — too *little* evidence to trust. (b) The naive fix (dump all four UAE source chains inline) would re-bloat exactly what Wave E1 fought (`CONTENT_STRATEGY_KNOWLEDGE_2026-06-10.md` Candidate 4 warns against parallel restated surfaces). There is no middle rung: the reader either gets an unsupported claim or a wall.

**Proposed change.** A three-rung ladder per assessment, density-flat by default:
1. **Lead claim** (the `whyHeadline`) — always visible, ~1 line. *5-second rung.*
2. **One hero quote + one source chip** — the single highest-tier `evidence[0]` quote, verbatim, linked. Always visible, ~1–2 lines. *30-second rung.*
3. **"All N sources ▸"** — a native `<details>` (the proven audit-trail pattern, in-DOM for Pagefind/screen readers) expanding the full `evidence[]` chain with quotes + links. *Deep rung.*

UAE renders: claim + one Amnesty/UN quote + "All 4 sources ▸". The default card grows by ~one line; the four-source depth is one click away, not on screen.

**Knowledge/trust benefit.** Comprehension and credibility at every scan depth without density cost. The reader *grasps* (lead claim), *trusts* (one verbatim linked quote), and can *verify exhaustively* (expand) — self-selecting depth. Directly honors the Wave E1 discipline while raising evidence density.

**Independence check:** PASS — all sources remain in the DOM (indexed, accessible), merely collapsed; same sanctioned approach as the audit trail.

| Impact | Strat. Align | Learning | Confidence | Effort | Risk |
|---|---|---|---|---|---|
| 5 | 4 | 4 | 4 | 3 | 2 |

**Priority = 5+4+4+4 − 3 − 2 = 12**

---

## Candidate 5 — A reusable `<SourceChip>` / `<EvidenceQuote>` primitive so evidence formatting compounds site-wide

**Surface:** new `briefing/EvidenceQuote.tsx` + `SourceChip.tsx`; adopted by `ScoreMovementCard`, `LeadSignalCard`, `EvidenceLedger`, `FloorConductSection`, and reusable by `EntityEvidenceCard` (per `git log`: "EntityEvidenceCard — surface assessment record on entity pages").

**Problem (file evidence + cost).** Source/evidence rendering is reinvented incoherently in at least four places: `EvidenceLedger` uses a typed badge with per-type colors (26–42); `ScoreMovementCard` uses a bare 24px icon link (244–269); `LegacyScoreChangesSection` uses a numbered `<ol>` with dotted-underline source links (718–798); `FloorConductSection` uses a red numbered list of bare domains (1431–1454). Four visual languages for "here is a source." Cost: the reader re-learns "what a citation looks like" on every section, and the quote-formatting Candidate 1 introduces would otherwise be reinvented a fifth time — knowledge does not compound, and the citation style never becomes a recognizable trust signature.

**Proposed change.** Two tiny primitives: `<EvidenceQuote quote source url sourceType dimension />` (blockquote + attribution + optional dimension tag, one consistent treatment) and `<SourceChip domain type url />` (the `EvidenceLedger` typed-badge style, extracted). Refactor the four call sites to use them. The `inferSourceType` map (`EvidenceLedger` 11–42) becomes the shared source of truth for type + color.

**Knowledge/trust benefit.** One visual grammar for evidence across briefing *and* entity pages → the reader learns "this is what a Compassion Benchmark citation looks like" once and recognizes it everywhere. Consistent formatting is itself a credibility cue (it signals systematic sourcing, not ad-hoc).

**Independence check:** PASS — formatting consolidation only.

| Impact | Strat. Align | Learning | Confidence | Effort | Risk |
|---|---|---|---|---|---|
| 4 | 4 | 4 | 4 | 2 | 1 |

**Priority = 4+4+4+4 − 2 − 1 = 13**

---

## Candidate 6 — Surface source *type* and *count* as a one-line "evidence basis" cue per finding

**Surface:** `ScoreMovementCard.tsx`, `LeadSignalCard.tsx` meta row; data from Candidate 1's `evidence[]` + existing `confidence`.

**Problem (file evidence + cost).** The briefing buries evidence *strength* in prose: the UAE summary says "four independent source chains" and "medium-high confidence," but the card UI shows only a `confidence` text pill (`ScoreMovementCard` 230–237) with no indication of *how many* or *what kind* of sources back it. The reader cannot distinguish a finding resting on one news article from one resting on a UN FFM + Amnesty + an ICJ filing. Comprehension cost: "confidence" is an opaque label; *"4 sources · UN, NGO, Legal"* is concrete and self-explaining. Trust cost: the benchmark's strongest evidentiary cases (multi-source, official-body) look identical to its weakest.

**Proposed change.** Add a derived one-line "evidence basis" cue to the meta row: `Basis: 4 sources · UN · NGO · Legal — medium-high confidence`, computed from `evidence[]` length + distinct `sourceType`s (reusing `inferSourceType`) + existing `confidence`. One line, no new section; degrades to just the confidence pill when `evidence[]` is absent.

**Knowledge/trust benefit.** Teaches the reader to read *evidentiary weight*, not just a confidence adjective — and makes the multi-source rigor (the benchmark's actual differentiator) visible at a glance. Concrete-before-abstract: count + types before the abstract "confidence."

**Independence check:** PASS — factual counts; "confidence" already published. Keep descriptors source-type-based, never value-laden.

| Impact | Strat. Align | Learning | Confidence | Effort | Risk |
|---|---|---|---|---|---|
| 4 | 4 | 4 | 4 | 2 | 1 |

**Priority = 4+4+4+4 − 2 − 1 = 13**

---

## Candidate 7 — Teach the evidence-tier / traceability model once, with a persistent "How we source" micro-explainer

**Surface:** `EvidenceLedger.tsx` header (134–140) + a one-line link from each assessment's evidence block; ties to `methodology` (evidence tiers; the proposal carries `tier_classification: "A"` and Tier-5 references).

**Problem (file evidence + cost).** The upstream record has a rich provenance model — `tier_classification`, "corroborated (Tier-5) finding," "four independent source chains," "ICJ-unadjudicated magnitude cap" — but the public reader is never taught that **a tiering/corroboration system exists**. The Evidence Ledger header just says "Primary sources reviewed in this briefing cycle" (137–138) with no explanation of *how* sources become scores. The core credibility claim ("scores are traceable to primary sources, weighted by evidence tier") is the benchmark's deepest moat and is currently invisible — a newcomer cannot learn the trust model without leaving for `/methodology`.

**Proposed change.** Add a compact, persistent **"How we source"** micro-explainer (one collapsible line or a 3-chip strip) at the Evidence Ledger header: *"Findings are graded by source tier (official bodies → NGOs → news) and require independent corroboration before a score moves. [How scoring works ▸]"* — definitions pulled verbatim from `/methodology`, deep-linked. Optionally expose a public-safe `tier` letter as a small chip on the evidence block (the data exists upstream as `tier_classification`).

**Knowledge/trust benefit.** Teaches the *mechanism* of traceability, not just the assertion — converting "independent benchmark" from a label into an explained, inspectable process. This is the single highest-leverage *teaching* move for the credibility claim; it makes every cited quote legible as part of a disciplined system.

**Independence check:** PASS — definitional and neutral; strengthens the evidence-first brand. (Confirm with methodology owner that the public `tier` letter carries no internal-only semantics before exposing it.)

| Impact | Strat. Align | Learning | Confidence | Effort | Risk |
|---|---|---|---|---|---|
| 4 | 4 | 5 | 3 | 2 | 2 |

**Priority = 4+4+5+3 − 2 − 2 = 12**

---

## Summary table (sorted by Priority)

| # | Candidate | Surface | Priority |
|---|-----------|---------|----------|
| 3 | Fix Evidence Ledger to read post-cutoff shape (`primaryEvidenceUrl` + future `evidence[]`) | EvidenceLedger / nav guard | **16** |
| 1 | Add verbatim-quote + multi-source `evidence[]` to schema and pipe it through | Schema + digest + cards | **15** |
| 2 | Split each assessment into labeled EVIDENCE vs OUR READING | ScoreMovementCard / LeadSignalCard | **14** |
| 5 | Reusable `<EvidenceQuote>` / `<SourceChip>` primitive | new primitives, 4 call sites | **13** |
| 6 | One-line "evidence basis" cue (source count + types) | card meta row | **13** |
| 4 | Progressive-disclosure evidence ladder (claim → quote → all sources) | cards + `<details>` | **12** |
| 7 | "How we source" tier/traceability micro-explainer | EvidenceLedger header + methodology link | **12** |

---

## Fix one thing

**Candidate 1 — add the verbatim-quote + multi-source `evidence[]` field to the schema and wire it from the existing upstream `key_evidence` through to the cards.** It is the keystone: the data already exists (`india-2026-06-01.json` `key_evidence` has quotes and attributions today), and nothing else can deliver real comprehension or trust gains until the quote and the full source chain survive the publish step. It directly converts the benchmark's strongest latent asset — disciplined, verbatim, attributed evidence — into the thing the reader actually sees, and it unblocks Candidates 2, 3, 4, 5, and 6. A single linked sentence in the entity's own words ("several of them turned out to be Indian citizens, mostly impoverished migrant workers") does more for both *understanding* and *credibility* than any amount of paraphrase — and it makes the core claim, "every score is traceable to a primary source," literally true on the page for the first time.

> Sequencing note: ship **Candidate 3 first** (one-day, surfaces the 9 URLs already present and lights up the dark ledger), then **Candidate 1** (the keystone field), then the rendering layer (2 → 5 → 6 → 4 → 7).
