# Briefing Evidence & Analysis PM Review
**Date:** 2026-06-11
**Author:** PM agent
**Scope:** Evidence and analysis depth of the daily briefing — surfacing primary evidence (verbatim quotes, source URLs) and deepening analysis; product/content model lens only.

---

## Ground-truth gaps (verified in files)

**topSignals have no url or quote field.**
The June 8 briefing (`site/src/data/updates/daily/2026-06-08.json`) has 10 `topSignals` entries. Each carries a `description` that references sources verbally (e.g. "Conflict Insights Group June 2026 confirms…"; "Amnesty documents UAE re-exporting…") but no `sources[]` array, no `url`, and no verbatim quote. `EvidenceLedger.tsx` is designed to read `s.sources[]` — it returns zero rows for this briefing because the field is absent from every signal.

**recentAssessments carry only one primaryEvidenceUrl per entity, no quote.**
The `ScoreMovementCard.tsx` renders `primaryEvidenceUrl` as a small icon link button. For 8 of the 20 assessed entities in June 8 the field is absent entirely (India, Anthropic, OpenAI, UnitedHealth, Alphabet, Luxembourg, Liechtenstein, San Jose, Pittsburgh, Unitree). Where present, the link points to a single URL with no surrounding context, no quote, no description of what the linked page proves.

**Research proposals contain rich evidence that never surfaces publicly.**
`research/change-proposals/india-2026-06-01.json` carries a `key_evidence[]` array with verbatim findings embedded as quoted strings (e.g. `"HRW: at least 192 UNHCR-registered Rohingya refugees unlawfully expelled (refoulement); 40 Rohingya placed on a navy ship, beaten, given life jackets and tossed into the sea near Myanmar — UN special rapporteur cited 'blatant disregard for the lives and safety' of protected persons"`). The `evidence[]` array in `anthropic-2026-05-01.json` carries structured per-source records with `url`, `finding`, `dimensionsAffected`, and `inWindow`. None of this reaches the public briefing or entity pages.

**TodaysAnalysisSection renders highlights[] strings — no evidence/interpretation separation.**
`TodaysAnalysisSection.tsx` renders `highlights` as numbered claim cards. The data model supports an optional `whyItMatters` field but not a paired `evidence` or `quote` field. Claim and source are merged into one prose string; a reader cannot distinguish what the document says from what the benchmark concludes.

**EvidenceLedger renders an empty table for most briefings.**
`EvidenceLedger.tsx` reads only `topSignals[].sources[]`, `sectorAlerts[].sources[]`, and `scoreChanges[].evidence[].url`. Since none of those arrays exist in the June 8 briefing JSON, the component returns null and the ledger never renders. It is implemented but starved of data.

**The briefing's top signals carry description prose of 200–400 words per entry — dense but uncitable.**
The UAE signal in June 8 runs to approximately 340 words describing four independent source chains. All citations are embedded in prose ("the Conflict Insights Group (June 2026) confirms…") with no separately accessible URL or quotation. A journalist or researcher who wants to verify cannot click through from the signal card.

---

## Candidates

---

### Candidate 1: Sources array on topSignals — populate EvidenceLedger and make signals citable

**Page/surface:** `topSignals[]` in every daily briefing JSON; rendered by `EvidenceLedger.tsx`, `SignalCard.tsx`, and `LeadSignalCard.tsx`.

**Problem (file evidence):** `EvidenceLedger.tsx` lines 78–99 expect `s.sources[]` on each top signal. No signal in `2026-06-08.json` has this field. The ledger returns null for every recent briefing. The June 8 UAE signal cites four independent source chains in prose but not as linkable items. A reader cannot verify the RSF/genocide claim chain without separately searching all four organizations.

**Proposed change:** Add a `sources[]` array to each `topSignals[]` item. Each element carries `url` (string), `label` (string, 5–10 words), and optionally `tier` (T1–T5 matching the research methodology). No verbatim quote required at this stage — just the structured URL-plus-label pair. This populates EvidenceLedger with zero additional render code and makes every signal citable in one click.

**Reader/credibility value:** Journalists and researchers can click from a signal directly to the primary document. The UAE genocide-complicity finding, currently credible but unchecked, becomes a four-link evidence chain that readers can audit in under two minutes. This is the minimum viable "show your work" layer. It also differentiates the briefing from news aggregators that also describe but do not source.

**Independence check:** PASS. Surfacing the sources that drove a score does not allow entities to pay for inclusion or suppression. It strengthens independence by making the evidence chain public and auditable.

| Dimension | Score |
|---|---|
| Impact | 5 |
| Strategic Alignment | 5 |
| Learning Value | 4 |
| Confidence | 5 |
| Effort | 2 |
| Risk | 1 |
| **Priority** | **16** |

---

### Candidate 2: Evidence/interpretation separation on recentAssessments — structured "what the document says" vs. "what we concluded"

**Page/surface:** `recentAssessments[]` in daily briefing JSON; rendered by `ScoreMovementCard.tsx`; `TodaysAnalysisSection.tsx` for highlights.

**Problem (file evidence):** Every `recentAssessments` item has a `whyHeadline` (≤18 words) and a `primaryEvidenceUrl` (often absent). There is no field for the primary claim the evidence supports, nor a field for the interpretation step. The `india-2026-06-01.json` change proposal has both: `key_evidence[0]` says exactly what HRW reported (what the document says), and `methodology_note` says how that maps to dimension scores (what the benchmark concluded). The public briefing collapses this into one `whyHeadline` sentence that conflates both. A reader cannot distinguish documented fact from analytical judgment.

**Proposed change:** Add two optional fields to `recentAssessments[]` items: `evidenceSummary` (≤40 words, present-tense statement of what the primary source documents) and `interpretationNote` (≤30 words, how the benchmark applied that evidence to the score). The existing `whyHeadline` becomes the merger/headline. `ScoreMovementCard.tsx` already has the layout structure (two-column grid visible in `LeadSignalCard.tsx`) to render a small "What the evidence shows / What we concluded" row below the entity name without a new component.

**Reader/credibility value:** This is the single biggest trust-building content change available. It makes the score disputable in a productive way: a reader can disagree with the interpretation without disputing the evidence, or challenge the evidence without challenging the methodology. For journalists and institutional researchers, it transforms the briefing from a scorecard into a citable intelligence product. It also preempts the most common credibility attack ("who decides?") by showing the decision chain.

**Independence check:** PASS. The separation actively strengthens the independence principle. If an entity's score changes, the `evidenceSummary` field records what the third-party source documented. That record is stable regardless of any future pressure to re-interpret.

| Dimension | Score |
|---|---|
| Impact | 5 |
| Strategic Alignment | 5 |
| Learning Value | 5 |
| Confidence | 4 |
| Effort | 3 |
| Risk | 2 |
| **Priority** | **14** |

---

### Candidate 3: Verbatim quote field on the lead signal card

**Page/surface:** `topSignals[0]` (lead signal); `LeadSignalCard.tsx`; the briefing's above-the-fold.

**Problem (file evidence):** The June 8 UAE lead signal runs ~340 words of analytical prose. The single most damning line in the underlying research — the UN Fact-Finding Mission finding that RSF attacks "bear the hallmarks of genocide" — is paraphrased, not quoted. The Conflict Insights Group finding that UAE support "enabled the El Fasher mass atrocities of October 2025 targeting Zaghawa and Fur populations" is also paraphrased. The `india-2026-06-01.json` research file embeds the UN special rapporteur's quote about "blatant disregard for the lives and safety" verbatim. The public briefing strips it. `LeadSignalCard.tsx` has a two-column "What happened / Why it matters" layout that currently splits the description prose by sentence count — no designated quote slot exists.

**Proposed change:** Add an optional `keyQuote` field to `topSignals[]` items: `{text: string (≤80 words), attribution: string, url: string}`. Render it in `LeadSignalCard.tsx` as a styled blockquote between the "What happened" and "Why it matters" columns, with the attribution and a link to the source. Apply to high-severity signals only (severity: critical or high) so the constraint on the researcher's time is respected. One quote per lead signal, chosen from the primary institutional source (UN, ICJ, WHO, HRW, Amnesty — not news media).

**Reader/credibility value:** A verbatim quote from the UN Fact-Finding Mission or the Amnesty International embargo-breach report transforms the lead signal from a sophisticated summary into primary-source journalism. It is citable. It is shareable. It anchors the analytical conclusion in language that a third party wrote and that the benchmark did not originate. For the Score-Watch ICP (institutional buyers monitoring specific entities), the quote is the citation they would otherwise need to retrieve separately. For journalists, it is the pull quote.

**Independence check:** PASS. Quoting the primary institutional source verbatim is the most stringent independence discipline available. The benchmark is not authoring the claim — it is surfacing and attributing it. The `url` field in the quote object links back to the original, preventing misattribution.

| Dimension | Score |
|---|---|
| Impact | 4 |
| Strategic Alignment | 5 |
| Learning Value | 4 |
| Confidence | 4 |
| Effort | 2 |
| Risk | 1 |
| **Priority** | **14** |

---

### Candidate 4: Per-entity evidence trail linking briefings to entity pages

**Page/surface:** Entity pages (`EntityDetail.tsx`); `recentAssessments[]` data; `EntityEvidenceCard.tsx`.

**Problem (file evidence):** `EntityDetail.tsx` renders `EntityEvidenceCard` when `evidenceCardProps` is supplied. The component exists (line 11 of `EntityDetail.tsx`). However the briefing's `recentAssessments` items carry only `primaryEvidenceUrl` (one URL, often absent) and `whyHeadline`. There is no structured evidence trail connecting an entity page to the specific briefing dates on which evidence was reviewed, which sources were cited, and what the assessment concluded. A reader landing on the India entity page after the June 1 downgrade sees a score of 15.6 with no way to trace it to the HRW World Report 2026 data and the UN rapporteur quote that drove it. `UPDATES_BACKLOG2_2026-06-10.md` item #14 identified the entity-to-briefing link as missing; the gap here is the reverse: the briefing's evidence needs to populate the entity page's evidence record.

**Proposed change:** Add an `evidenceItems[]` optional array to `recentAssessments[]`: each item carries `source` (institution name), `url`, `finding` (≤30 words), and `dimensionsAffected` (string[]). This mirrors the structure already in `research/change-proposals/anthropic-2026-05-01.json`'s `evidence[]` array. On the entity page, `EntityEvidenceCard` reads the most recent assessment's `evidenceItems` as the current evidence record. The briefing's EvidenceLedger also reads them (EvidenceLedger already handles per-source items with dimension metadata, lines 103–118 of `EvidenceLedger.tsx`).

**Reader/credibility value:** An entity page that shows its evidence trail — not just a score number — is a fundamentally different product than a ranking table. For institutional buyers and researchers who land on specific entity pages, the evidence trail is the primary value: it answers "what drove this score and when." This also closes the gap between internal research depth (richly documented in `change-proposals/`) and public surface (one number and a one-line note).

**Independence check:** PASS. Evidence items that attribute findings to named third-party institutions (HRW, UNHCR, Amnesty, UN FFM) with source URLs make it harder, not easier, for an entity to dispute its score through informal pressure. The evidence record is public and timestamped.

| Dimension | Score |
|---|---|
| Impact | 4 |
| Strategic Alignment | 5 |
| Learning Value | 4 |
| Confidence | 3 |
| Effort | 4 |
| Risk | 2 |
| **Priority** | **10** |

---

### Candidate 5: Longitudinal evidence summary — "why the score was this before and what changed"

**Page/surface:** `topSignals[]` and `recentAssessments[]` for entities with score changes; `LeadSignalCard.tsx`; entity pages.

**Problem (file evidence):** The June 8 UAE signal explains the new finding but does not explain what the prior 23.4 was based on or why it did not already price the RSF complicity. Without the "what we knew before" anchor, a reader cannot evaluate whether the score change is proportionate or whether the benchmark was late. The India change proposal (`india-2026-06-01.json`) states this explicitly in `methodology_note`: "The published uniform-~1.9 baseline (22.7) predates and does not reflect HRW World Report 2026's corroborated (Tier-5) finding of a government-directed refoulement-and-expulsion regime." That sentence is crucial for credibility — it explains the gap — but it does not appear in the public briefing. The public June 1 India signal says only "~5,000 Bengali-Muslim deportations without due process deepen the EQU 1.3/EMP 1.4/ACC 1.4 profile."

**Proposed change:** For score-change signals (delta != 0), add an optional `priorBasisNote` field (≤50 words): a statement of what the prior score reflected and why new evidence constitutes a change rather than a correction of an error. This is distinct from `whyHeadline` (which describes the new evidence) and from `nextForwardSignal` (which is forward-looking). It is the backward-facing anchor that makes the change defensible. Apply only when a score delta occurs or a band crossing is proposed.

**Reader/credibility value:** For journalists and institutional researchers, the most challenging question about a score change is "why now?" The `priorBasisNote` answers that question in one sentence and prevents the change from appearing arbitrary. For the independence position, it demonstrates that the benchmark is updating on new evidence rather than responding to entity pressure — the prior basis was legitimate given prior evidence, and new evidence changed it.

**Independence check:** PASS. Stating what the prior score reflected and why it changed is the clearest possible evidence-based discipline. It makes the process transparent and reduces the surface area for entity complaints that score changes were discretionary.

| Dimension | Score |
|---|---|
| Impact | 4 |
| Strategic Alignment | 4 |
| Learning Value | 5 |
| Confidence | 4 |
| Effort | 2 |
| Risk | 1 |
| **Priority** | **14** |

---

### Candidate 6: Confidence-anchor explanation — surface what "medium-high confidence" actually means

**Page/surface:** `recentAssessments[]`; `ScoreMovementCard.tsx`; `LeadSignalCard.tsx`; also applies to methodology notes.

**Problem (file evidence):** `ScoreMovementCard.tsx` renders a `confidence` chip (lines 232–237) as a styled string (e.g. "medium-high confidence"). The June 8 UAE assessment is labeled "medium-high confidence" with a confidence cap that rests specifically on the ICJ case being unadjudicated. This constraint is stated in the `methodologyNotes[]` description but is not accessible from the `recentAssessments` confidence chip. A reader who sees "medium-high confidence" on a −5.0 band-crossing score change has no way to know that the confidence level is bounded by a specific pending legal proceeding — which also tells them exactly when and why confidence would change. This information exists in `forwardTriggers` for UAE but is not linked to the confidence display.

**Proposed change:** Add an optional `confidenceConstraint` field to `recentAssessments[]`: a single sentence (≤25 words) naming the specific condition that caps or could upgrade the confidence rating. Render it in `ScoreMovementCard.tsx` as a tooltip or a small muted line beneath the confidence chip. Example for UAE: "Confidence capped by ICJ case remaining unadjudicated." Example for India: "Confidence bounded by absence of confirmed disappearance count at scale."

**Reader/credibility value:** For sophisticated readers (Score-Watch subscribers, journalists, institutional researchers), the confidence constraint is more informative than the confidence label. It tells them what to watch. It is also the most honest form of epistemic transparency — the benchmark is saying "here is exactly what would change our certainty level." This converts a static label into a forward-looking signal.

**Independence check:** PASS. Naming the specific legal or evidentiary constraint on confidence is a stricter form of evidence discipline than a generic label. It prevents "medium-high" from being read as a subjective assessment of the entity rather than an assessment of evidence quality.

| Dimension | Score |
|---|---|
| Impact | 3 |
| Strategic Alignment | 4 |
| Learning Value | 5 |
| Confidence | 4 |
| Effort | 1 |
| Risk | 1 |
| **Priority** | **14** |

---

### Candidate 7: Source-tier labeling on the EvidenceLedger — distinguish Tier-1 institutional from media

**Page/surface:** `EvidenceLedger.tsx`; `evidence[]` arrays in change proposals.

**Problem (file evidence):** `EvidenceLedger.tsx` already infers `sourceType` (government, NGO, news, legal, academic, unknown) from domain pattern matching (lines 12–23). However it has no concept of the research methodology's Tier system (T1–T5 used in change proposals). The `anthropic-2026-05-01.json` evidence array includes `inWindow: true` and `polarity` fields but no tier. The `india-2026-06-01.json` proposal does have `"tier_classification": "A"` at the proposal level but not per-source. As a result the EvidenceLedger cannot distinguish a UN Fact-Finding Mission report (highest credibility tier in the methodology) from a TechCrunch article in the same table row — both show as "News" or "NGO." This conflation weakens the EvidenceLedger's credibility signal.

**Proposed change:** Add an optional `tier` field (T1–T5) to each source item in `sources[]` and `evidence[]` arrays in the briefing JSON. In `EvidenceLedger.tsx`, render a tier badge beside the existing source-type badge when `tier` is present. Define T1 as: UN agencies, ICJ, ICC, peer-reviewed journals, official government statistics. T2 as: Established NGOs (HRW, Amnesty, MSF, ICRC). T3 as: Credible specialist outlets (Reuters, AP, FT, Bloomberg). T4 as: Single-outlet reporting without corroboration. T5 as: Advocacy or contested sources. The existing `inferSourceType` logic remains as a fallback when no tier is supplied.

**Reader/credibility value:** For journalists and researchers, source tier is the most important meta-property of an evidence item. A T1-anchored finding (UN Fact-Finding Mission, ICJ filing) is citable in ways a T4 finding is not. Labeling this in the EvidenceLedger makes the benchmark's evidentiary standard visible and auditable. It also strengthens the case that score changes are not driven by media narratives (T4) but by institutional documentation (T1–T2).

**Independence check:** PASS. Tier labeling makes it harder, not easier, to inflate a score change on weak evidence. If a proposed downgrade rests on T4 sources, the public ledger shows that.

| Dimension | Score |
|---|---|
| Impact | 3 |
| Strategic Alignment | 4 |
| Learning Value | 4 |
| Confidence | 4 |
| Effort | 2 |
| Risk | 1 |
| **Priority** | **12** |

---

### Candidate 8: Interpretive synthesis field — explicit statement of what this cycle's evidence establishes for the institution's position

**Page/surface:** `dailyOpeningQuestion` and a new optional `cycleSynthesis` top-level field; rendered near the briefing header.

**Problem (file evidence):** The `dailyOpeningQuestion` in the June 8 briefing is analytically sharp ("If Sudan's ICJ case finds UAE liable for complicity in the RSF genocide, does the adjudicated finding remove the magnitude cap…"). However the briefing has no field that states what the current cycle definitively established — as opposed to what it raised as a question. The `summary` field at the top level does this to some extent (it is a 400-word paragraph), but it is a prose block without a designated slot for the narrower claim: "What the benchmark's position is, based on this cycle's evidence, that it was not previously on record stating." This is the missing "institution's current position" layer that distinguishes an intelligence product from a news digest.

**Proposed change:** Add an optional `cycleSynthesis` field: a structured object with `established` (≤40 words: what is now on the record that was not before) and `stillOpen` (≤40 words: what the evidence does not yet resolve). For June 8 this would read: established = "UAE is a documented, ongoing external sponsor of a force the UN FFM found bears genocide hallmarks — this is now priced in the benchmark's published score for the first time." stillOpen = "Whether the ICJ ruling removes the magnitude cap and whether direct UAE-force participation exists at a level that would trigger a floor assessment." This is not a new section but a structured distillation of what the analyst already knows and currently writes in the `summary` prose.

**Reader/credibility value:** For Score-Watch subscribers and institutional users, the `cycleSynthesis` is the most concise form of the product's value proposition: not just what happened today, but what the institution now believes and what it still needs to establish. This is the layer that separates a benchmark from a news alert. It is also the natural hook for a structured citation in journalism ("according to the Compassion Benchmark, which now scores UAE as a documented external sponsor of genocide…").

**Independence check:** PASS. A `stillOpen` field that names what the evidence does not yet establish is a stronger independence discipline than claiming certainty. It prevents overreach and makes the institution's analytical limits visible.

| Dimension | Score |
|---|---|
| Impact | 4 |
| Strategic Alignment | 5 |
| Learning Value | 5 |
| Confidence | 3 |
| Effort | 3 |
| Risk | 2 |
| **Priority** | **12** |

---

## Summary: top 3 candidates with scores

| Rank | Candidate | Priority | One-line rationale |
|---|---|---|---|
| 1 | Sources array on topSignals | **16** | Zero render code change; populates the already-built EvidenceLedger and makes every signal citable with one click — highest leverage at lowest effort. |
| 2 | Evidence/interpretation separation on recentAssessments | **14** | Transforms the briefing from a conclusions product into a citable intelligence product by distinguishing what the document says from what the benchmark concluded — the single biggest trust-building content change available. |
| 3 (tied) | Verbatim quote on lead signal | **14** | A UN or Amnesty verbatim quote on the highest-severity signal is the pull quote that makes the briefing citable for journalists and shareable as a primary-source artifact, not a paraphrase. |
| 3 (tied) | Longitudinal prior-basis note | **14** | Answers "why now?" for score changes — the most common credibility question — by anchoring the change in what the prior score reflected and why new evidence changed it. |
| 3 (tied) | Confidence-constraint explanation | **14** | Converts a static "medium-high confidence" chip into a forward-looking signal by naming the specific condition that caps or would upgrade it — highest information density at near-zero effort. |

---

## Single highest-leverage evidence/analysis upgrade

**Add `sources[]` to every `topSignals[]` item in the briefing JSON (Candidate 1).**

The EvidenceLedger component is already built and deployed. It reads `s.sources[]` and renders a typed, linked source table. The only reason it renders nothing today is that the JSON field is absent. Adding a two-field `{url, label}` array to each signal takes minimal pipeline time and zero frontend code. It immediately makes every signal in every future briefing citable and auditable in one click. This is the minimum viable "show your work" layer that the independence moat requires, and it is the prerequisite for all downstream evidence richness: once sources are structured on signals, adding quotes, tiers, and interpretation separation is additive rather than foundational.

Candidate 2 (evidence/interpretation separation) is the highest-leverage content model change for reader trust and ICP value, but it requires both schema evolution and editorial discipline in the pipeline. Candidate 1 requires neither — it only requires the pipeline to populate a field that the frontend already consumes.
