# Briefing Evidence Pipeline — Structured Evidence + Verbatim Quote Capture

**Date**: 2026-06-11
**Author**: Pipeline data-collection design pass
**Status**: Proposal (read-only analysis; no pipeline code changed)
**Lens**: Increase the analysis and data collected by the daily-briefing pipeline, with a focus on capturing verbatim direct quotes + source URLs in a structured shape, multiple corroborating sources per claim, and deeper analytical attribution — under strict, machine-checkable integrity guards.

---

## 1. The gap (verified against repo artifacts)

| Stage | File | What it captures today | The loss |
|---|---|---|---|
| Scanner | `.claude/agents/overnight-scanner.md` (Step 6–7) | Per-entity `entity_reviews[].sources` = **bare URL array**; `top_entities[].news_sources` = bare URL array | No quote, no publisher, no date, no tier — just `["https://…"]`. Provenance is "a link existed," not "this link says X." |
| Assessor | `.claude/agents/overnight-assessor.md` (Step 3f) | `key_evidence[]` = **free-text strings** | Quotes ARE captured but embedded in prose. `research/change-proposals/india-2026-06-01.json` line 42 literally holds a verbatim quote — `"…'several of them turned out to be Indian citizens, mostly impoverished migrant workers'"` — with no machine-addressable `url`/`quote`/`source` separation. Unparseable, unverifiable, can't flow downstream. |
| Digest | `.claude/agents/overnight-digest.md` (recentAssessments enrichment) | Exactly **one** `primaryEvidenceUrl` per assessment; `topSignals[]` carry **zero** URLs or quotes | `site/src/data/updates/daily/2026-06-08.json`: the UAE topSignal description cites "UN FFM (Feb 19, 2026)," "Conflict Insights Group (June 2026)," "Amnesty," and "Sudan's ICJ filing" — four sources named in prose, **none clickable, none quoted, none tiered**. `recentAssessments[0]` keeps just one Refugees International URL out of four source chains. |
| Validator | `site/scripts/validate-daily-briefings.mjs` | Structural shape (types, required fields, approved status enums) | **No traceability rule.** Nothing requires a quote to have a URL. `primaryEvidenceUrl` is optional and unverified. A fabricated quote or a paraphrase-as-quote would pass the build clean. |

**Net effect**: The pipeline already *does the analytical work* of finding quotes and corroborating sources — the assessor's `key_evidence[]` for India and the UAE briefing prose prove it — but that richness is destroyed at every handoff because it is stored as unstructured strings. The public briefing, the institution's credibility surface, ships named-but-unlinked sources and no verbatim evidence. For a benchmark whose entire value proposition is independent, verifiable primary sourcing, this is the single highest-leverage data-collection gap.

---

## 2. Proposed structured evidence schema

### 2.1 The `EvidenceItem` object (the atom)

One object per discrete piece of evidence. Used identically in scanner `entity_reviews[]`, assessor change-proposals, and the public briefing — one shape, three stages, no re-keying.

```jsonc
{
  "quote": "several of them turned out to be Indian citizens, mostly impoverished migrant workers",
  // VERBATIM excerpt, ≤40 words. Optional. If present, `url` is MANDATORY.
  // Never paraphrase. Never reconstruct from memory. Copy exact characters from source.

  "claim": "India expelled 1,500+ people to Bangladesh without due process, including its own citizens",
  // The benchmark's one-sentence characterization of what this evidence establishes. Required.

  "source": "Human Rights Watch — World Report 2026, India chapter",
  // Publisher + document/author. Required. Human-readable attribution.

  "url": "https://www.hrw.org/world-report/2026/country-chapters/india",
  // Direct, resolvable source URL. Required whenever `quote` is present.
  // Should resolve to the document containing the quote, not a homepage.

  "publishedDate": "2026-01-16",
  // ISO date the source was published. Optional but strongly preferred (recency discipline).

  "sourceTier": 5,
  // 1–5 evidence-strength tier (see 2.3). Required.

  "sourceType": "io-report",
  // Controlled vocab: "gov-filing" | "court-record" | "treaty-body" | "io-report"
  //   | "regulator" | "ngo-report" | "top-tier-journalism" | "trade-press"
  //   | "company-disclosure" | "primary-data" | "other". Required.

  "dimension": "EQU",
  // Optional. The dimension code this evidence item most directly supports
  //   (ACC|INT|BND|ACT|EQU|SYS|EMP|AWR). Enables per-evidence dimension attribution.

  "polarity": "negative",
  // Optional. "negative" | "positive" | "contradicting" | "context".
  //   "contradicting" flags evidence that cuts AGAINST the proposed direction (see §4 rigor).

  "accessedDate": "2026-06-01"
  // Optional. ISO date the pipeline fetched/verified the URL.
}
```

**Design rules:**
- `quote` ≤ ~40 words (one tight excerpt, not a paragraph). Fair-use safe and forces the assessor to pick the load-bearing phrase.
- A `quote` **without** a `url` is a hard validation error (see §5). A `claim` without a `quote` is fine — not all evidence is quotable (e.g. a statistic).
- All fields except `claim`, `source`, `url`, `sourceTier`, `sourceType` are optional, so legacy records with thinner data still validate.

### 2.2 The `evidence[]` array (where it attaches)

`evidence[]` is an array of `EvidenceItem`. It attaches at three points:

1. **Scanner** — `entity_reviews[].evidence[]` and `top_entities[].evidence[]` replace/augment the bare `sources[]`/`news_sources[]` arrays. The scanner captures the *headline quote* (1–3 items per flagged entity) at discovery time, while the source is open in front of it.
2. **Assessor** — change-proposal `evidence[]` replaces the free-text `key_evidence[]` (with a migration shim — see §5). Each prose point in today's `key_evidence[]` becomes one `EvidenceItem`. Target: 3–6 items per proposal, ≥2 distinct `source` values for any band-crossing proposal.
3. **Public briefing** — `topSignals[].evidence[]` (NEW) and `recentAssessments[].evidence[]` (NEW, superset of the existing single `primaryEvidenceUrl`). The digest selects the 1–3 strongest, highest-tier items per surface and copies them verbatim — it never re-quotes or re-summarizes, only selects and forwards.

### 2.3 Source-tier preference order (controls selection AND scoring weight)

When multiple sources corroborate one claim, the pipeline prefers — and the digest surfaces — the highest tier:

| Tier | Source class (`sourceType`) | Examples |
|---|---|---|
| **5** | Government filing, court record, treaty-body decision, official statistical data | ICJ filings, DOJ indictments, UNGA vote records, census/labor data |
| **4** | International-organization report, independent UN mission | UN FFM, OHCHR, WHO PHEIC declarations, IPC famine classifications |
| **3** | Established human-rights / watchdog NGO report | HRW World Report, Amnesty, Freedom House, Liberties.eu |
| **2** | Top-tier journalism with named sourcing | Reuters, AP, NPR, Guardian/+972 joint investigations |
| **1** | Trade press, single-source reporting, advocacy statements | TechTimes, org press releases, op-eds |

**Rule (assessor + digest):** every band-crossing or floor proposal must rest on **≥2 independent sources, at least one of which is Tier ≥4.** The UAE briefing already does this implicitly (UN FFM + Amnesty + ICJ + CIG) — the schema makes it *explicit and enforceable* rather than narrative.

---

## 3. Per-stage capture changes

### 3.1 Scanner (`overnight-scanner.md`)
- **Step 6 / Step 7:** replace `sources: ["url"]` with `evidence: [EvidenceItem]` in both `entity_reviews[]` and `top_entities[]`. For flagged entities, capture at minimum: `claim`, `source`, `url`, `sourceTier`, `sourceType`, and — when a sharp verbatim line is present in the result snippet — one `quote`.
- New hard constraint #8: *"When you record a `quote`, copy it character-for-character from the source and attach the resolvable `url` you took it from. If you cannot produce the exact words + the URL, record a `claim` without a `quote`. Never reconstruct a quote from memory."*
- Keep the 250-search ceiling; this is a capture-format change, not a search-volume change. Batched/T2 entities with no specific source still emit `evidence: []`.

### 3.2 Assessor (`overnight-assessor.md`)
- **Step 3f:** change-proposal schema gains `evidence: [EvidenceItem]`. Deprecate `key_evidence[]` (keep readable during migration — see §5). Each former prose bullet maps to one item, splitting the embedded quote into `quote` + `url` and the analyst gloss into `claim`.
- **Step 3b/3c (deeper analysis):** require per-item `dimension` attribution so the proposal can show *which evidence moved which dimension* (today's India `methodology_note` does this in prose: "EQU 1.8→1.3: deliberate religious targeting, refoulement"). Structuring it makes the cause→effect chain machine-readable and auditable.
- New rule: any item flagged `polarity: "contradicting"` must be retained (not dropped) — the proposal records counter-evidence and why it did not change the direction. This is rigor *and* independence insurance.
- New rule: band-crossing/floor proposals require ≥2 distinct `source` values with ≥1 at Tier ≥4 (§2.3). Below that, downgrade `confidence` and note the single-source limitation.

### 3.3 Digest (`overnight-digest.md`)
- Add `evidence[]` to `topSignals[]` and `recentAssessments[]`. The digest **selects and forwards** the 1–3 strongest items from the assessor's `evidence[]` (highest tier first); it must not author new quotes.
- Retain `primaryEvidenceUrl` as a back-compat convenience = `evidence[0].url` of the highest-tier item, so existing UI keeps working.
- Observer-voice rules still apply to `claim` text. `quote` text is exempt from the phrase-lint (it is someone else's words) **but** is subject to the verbatim/traceability guard (§5).

---

## 4. Deeper-analysis capture (raises rigor)

1. **Per-evidence dimension attribution** (`EvidenceItem.dimension`) — turns "the composite dropped 5 points" into "this HRW refoulement finding drove EQU −0.5; this Calcutta HC reversal held INT off the floor."
2. **Cause→effect chain** — an optional `recentAssessments[].causeEffect` string array: ordered `evidence → dimension impact → composite/band effect`. The India proposal's `methodology_note` is exactly this, written in prose; structuring it makes it queryable across cycles.
3. **Contradicting-evidence note** (`polarity: "contradicting"`) — forces balance. The India case already does this verbally ("Held at 15.6 NOT the 0.0 floor because courts demonstrably reverse some acts"); the schema makes the counter-evidence a first-class, retained record.
4. **Confidence rationale** (`recentAssessments[].confidenceRationale`, ≤25 words) — ties the existing `confidence` enum to *why*: source count, tier mix, adjudication status. Makes "medium-high" defensible rather than asserted.
5. **Source diversity metric** (`pipeline.evidence.distinctSourcesMedian`, `tier5SourceCount`) — a cycle-level measure so the founder can track whether evidence depth is improving over time (a SUCCESS_METRIC per the repo's measurement principle).

---

## 5. Integrity guards (critical) + validator rules

These are the load-bearing controls. Verbatim + traceable, or it does not ship.

### 5.1 Validator rules (`validate-daily-briefings.mjs`, new `checkEvidence()` block)
For every `EvidenceItem` in `topSignals[].evidence[]` and `recentAssessments[].evidence[]`:

| # | Rule | Level |
|---|---|---|
| E1 | If `quote` is a non-empty string, `url` MUST be a non-empty string. **Quote without URL = build fails.** | ERROR |
| E2 | `url` must match `^https?://` and not be a known homepage-only host pattern (warn if path is `/` only). | ERROR (scheme) / WARNING (bare host) |
| E3 | `quote` length ≤ 60 words (hard ceiling above the ~40-word target; catches paragraph-dumps and paraphrase-creep). | ERROR |
| E4 | `sourceTier` ∈ {1,2,3,4,5}; `sourceType` ∈ controlled vocab. | ERROR |
| E5 | `claim`, `source` non-empty for every item. | ERROR |
| E6 | Band-crossing / floor `recentAssessments` items: `evidence[]` must contain ≥2 distinct `source` values, ≥1 with `sourceTier ≥ 4`. | ERROR (post-cutoff) |
| E7 | Every `url` in the briefing must also appear in that entity's assessor change-proposal `evidence[]` (cross-artifact traceability — the public quote must be backed by an internal research record). | WARNING first cycle, ERROR after grace |
| E8 | Duplicate-exact `quote` strings across different `source` values flagged (a verbatim quote can't come from two unrelated publishers — signals a copy-paste attribution error). | WARNING |

E1 and E6 are the two that close the fabrication and single-source risks respectively. E7 is the strongest integrity guard: it makes the public surface a *projection* of an auditable internal record, so a quote can never be invented at the digest stage.

### 5.2 A `quote` is NEVER allowed to be:
- a paraphrase, a reconstruction, or a "gist" — those go in `claim`;
- attributed to a URL that does not contain those exact words;
- present without `url` (E1).

### 5.3 Agent-def instructions (added to all three agent files)
A shared boxed rule, identical text in scanner/assessor/digest:

> **VERBATIM-QUOTE INTEGRITY (non-negotiable).** A `quote` is the source's exact words, copied character-for-character, with a resolvable `url` to the document containing them. If you did not see the exact words at a real URL this cycle, you write a `claim` instead — never a `quote`. Fabricating, paraphrasing-as-quoting, or mis-attributing a quote is the single most serious integrity failure in this pipeline and is grounds for discarding the entire proposal.

### 5.4 Why this strengthens independence
The institution's independence claim ("entities never pay for inclusion or score changes") is only as credible as its sourcing is *verifiable*. Today a reader must trust the benchmark's prose. With structured verbatim quotes + resolvable primary-source URLs + the ≥2-source / Tier-≥4 rule, **a skeptical reader (or a sued entity's lawyer) can independently confirm every score-moving claim from primary documents.** Verifiability is the operational form of independence: it removes the benchmark's *interpretation* as a single point of trust and replaces it with a citable evidentiary chain.

---

## 6. Migration (no broken briefings)

1. **Schema doc first.** Add the `EvidenceItem` shape and the `evidence[]` attachment points to `docs/DAILY_BRIEFING_SCHEMA.md` as **optional** fields (Section 2c/2e additions). Optional ⇒ all 30-day-window legacy briefings still validate untouched.
2. **Validator: warn-then-error.** Ship `checkEvidence()` with E1–E6 as ERRORs *only when `evidence[]` is present*. A briefing with no `evidence[]` still passes (back-compat). E7/E8 start as WARNINGs for one cycle, promote to ERROR after the agents are emitting reliably.
3. **Assessor dual-write.** For ~1 week the assessor emits BOTH `key_evidence[]` (legacy prose) and `evidence[]` (structured). A one-shot backfill script can parse existing `key_evidence[]` quotes (they're already quote-delimited, e.g. India line 42) into `EvidenceItem` skeletons for review. Drop `key_evidence[]` once `evidence[]` is proven.
4. **Digest forward-compat.** Digest populates `topSignals[].evidence[]` / `recentAssessments[].evidence[]` when the assessor provides them; if absent, it falls back to today's single `primaryEvidenceUrl` behavior. UI reads `evidence[]` if present, else `primaryEvidenceUrl`.
5. **Cutoff alignment.** Make `evidence[]` *required* (not just optional-when-present) for `recentAssessments` only from a new `EVIDENCE_REQUIRED_FROM` date (e.g. 2026-06-25), mirroring the existing `RICH_REQUIRED_FROM` pattern in the validator. Everything before that date is grandfathered.

---

## 7. Prioritized candidates

Scoring: **Priority = Impact + Strategic Alignment + Learning Value + Confidence − Effort − Risk** (each 1–5).

### C1 — `EvidenceItem` schema + `evidence[]` on change-proposals
- **Type:** Schema / assessor capture
- **Problem:** `research/change-proposals/india-2026-06-01.json:42` stores a verbatim quote inside a free-text `key_evidence` string — unparseable, no `url` field.
- **Proposed change:** Define `EvidenceItem` (§2.1); add `evidence[]` to the assessor change-proposal, dual-write with `key_evidence[]`.
- **Benefit:** Makes the richest evidence the pipeline already collects machine-addressable; foundation for every other candidate.
- **Independence check:** Strengthens — each score-moving claim becomes a structured, citable record.
- Impact 5 · Strategic 5 · Learning 4 · Confidence 5 · Effort 2 · Risk 1 → **Priority 16**

### C2 — Validator quote-traceability guards (E1, E3–E5)
- **Type:** Build-gate validator
- **Problem:** `validate-daily-briefings.mjs` enforces no link between a quote and a URL; a fabricated/paraphrased quote ships clean.
- **Proposed change:** Add `checkEvidence()` with E1 (quote⇒url), E3 (length), E4 (tier/type enums), E5 (required fields); active only when `evidence[]` present.
- **Benefit:** Hard, automated anti-fabrication gate wired into `npm run build`.
- **Independence check:** Strengthens decisively — verifiability becomes mandatory, not aspirational.
- Impact 5 · Strategic 5 · Learning 3 · Confidence 5 · Effort 2 · Risk 1 → **Priority 15**

### C3 — `topSignals[].evidence[]` on the public briefing
- **Type:** Digest capture / public surface
- **Problem:** In `2026-06-08.json` the UAE topSignal names UN FFM, CIG, Amnesty, ICJ in prose — zero clickable, zero quoted.
- **Proposed change:** Digest forwards 1–3 highest-tier `EvidenceItem`s into each `topSignal`; UI renders quote + source + link.
- **Benefit:** Turns the flagship public surface from assertion into citable evidence; highest reader-facing credibility lift.
- **Independence check:** Strengthens — readers verify the lead story themselves.
- Impact 5 · Strategic 5 · Learning 3 · Confidence 4 · Effort 3 · Risk 2 → **Priority 12**

### C4 — Multi-source rule: ≥2 sources, ≥1 Tier ≥4 (E6)
- **Type:** Assessor rule + validator
- **Problem:** Public `recentAssessments` carry one `primaryEvidenceUrl`; single-source band crossings are structurally possible.
- **Proposed change:** Require band-crossing/floor proposals to carry ≥2 distinct sources with ≥1 Tier ≥4; enforce via E6.
- **Benefit:** Corroboration discipline; matches what the UAE case already does, makes it mandatory.
- **Independence check:** Strengthens — no score change rests on a single, possibly-biased source.
- Impact 4 · Strategic 5 · Learning 3 · Confidence 4 · Effort 2 · Risk 2 → **Priority 12**

### C5 — Per-evidence dimension attribution + cause→effect chain
- **Type:** Deeper analysis capture
- **Problem:** Cause→effect lives only in prose `methodology_note` (India: "EQU 1.8→1.3…"); not queryable, not auditable.
- **Proposed change:** `EvidenceItem.dimension` + optional `recentAssessments[].causeEffect[]`.
- **Benefit:** Makes the scoring logic transparent and cross-cycle analyzable; raises rigor.
- **Independence check:** Strengthens — exposes exactly how evidence maps to score movement.
- Impact 4 · Strategic 4 · Learning 5 · Confidence 4 · Effort 2 · Risk 1 → **Priority 14**

### C6 — Scanner structured-evidence capture (`entity_reviews[].evidence[]`)
- **Type:** Scanner capture
- **Problem:** Scanner emits bare URL arrays (`sources: ["url"]`); the quote is lost at the first stage, before the assessor ever sees structure.
- **Proposed change:** Replace `sources[]` with `evidence[]`; capture headline quote at discovery; keep 250-search ceiling.
- **Benefit:** Pushes structured capture upstream so the assessor inherits — not re-derives — quotes.
- **Independence check:** Neutral-to-positive — earlier, broader provenance trail.
- Impact 3 · Strategic 4 · Learning 3 · Confidence 4 · Effort 3 · Risk 2 → **Priority 9**

### C7 — Cross-artifact traceability guard (E7)
- **Type:** Validator (cross-file)
- **Problem:** Nothing ties a public quote/URL back to an internal research record; a digest-stage invention is undetectable.
- **Proposed change:** Validator checks every public `evidence[].url` exists in that entity's change-proposal `evidence[]`; warn→error.
- **Benefit:** Strongest anti-fabrication control — public surface becomes a projection of an auditable record.
- **Independence check:** Strengthens most of all — closes the fabrication loophole end-to-end.
- Impact 4 · Strategic 5 · Learning 3 · Confidence 3 · Effort 3 · Risk 3 → **Priority 9**

### C8 — `contradicting`-evidence retention + confidence rationale
- **Type:** Deeper analysis / balance
- **Problem:** Counter-evidence (India's Calcutta HC reversal) survives only as prose; balance is not structurally enforced.
- **Proposed change:** `polarity:"contradicting"` items retained; `confidenceRationale` ≤25 words.
- **Benefit:** Demonstrable balance; defends against cherry-picking accusations.
- **Independence check:** Strengthens — proves the benchmark weighs disconfirming evidence.
- Impact 3 · Strategic 4 · Learning 4 · Confidence 4 · Effort 2 · Risk 1 → **Priority 12**

### Priority ranking
1. **C1 — EvidenceItem schema + proposal capture (16)**
2. **C2 — Validator quote-traceability guards (15)**
3. **C5 — Per-evidence dimension attribution + cause→effect (14)**
4. C3 — topSignals[].evidence[] (12)
5. C4 — Multi-source ≥2 / Tier≥4 rule (12)
6. C8 — Contradicting-evidence + confidence rationale (12)
7. C6 — Scanner structured capture (9)
8. C7 — Cross-artifact traceability guard (9)

**Recommended sequence:** C1 → C2 (schema + the gate that protects it) → C5 (rigor) → C3 (public payoff) → C4/C8 (discipline) → C6 → C7 (close the loop). C1+C2 alone close the fabrication risk and unlock everything else.
