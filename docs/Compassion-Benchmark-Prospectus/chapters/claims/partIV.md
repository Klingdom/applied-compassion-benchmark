# Claims to Verify : Part IV: Applications (Chapters 14–18)

Flagged claims from the Part IV draft, for the claims-verification pass. Each row: the claim, where it appears, why it needs checking, and a suggested fix. Priority order within each chapter is roughly most-sensitive first. "Sourced" means it traces to `source_notes.md`; "illustrative" means it is framed in-text as a scenario, not asserted as a published fact.

---

## Chapter 14: Artificial Intelligence and Robotics

| # | Claim | Where | Why it needs verification | Suggested fix |
|---|---|---|---|---|
| 14.1 | **OpenAI scores 26.7, in the Developing band.** | Ch14, "Consider the single most-cited example" paragraph | Sourced to source_notes §8 (sales hooks: "OpenAI 26.7"), but flagged in chapter-index as "verify OpenAI 26.7." The number is presented as a current published composite; confirm it matches the live AI Labs index JSON before print. Defamation-sensitive because it names a real lab with a low score. | Confirm 26.7 against `site/src/data/indexes/ai-labs.json`. If the live score has moved, update or generalize. Keep the "anchored in sourced evidence, reconstructable" framing, which is the defamation protection (opinion on disclosed facts). |
| 14.2 | **OpenAI "is the subject of a multistate attorney-general inquiry."** | Ch14, same paragraph | source_notes §8 says "OpenAI 26.7 under 42-state AG subpoena." Chapter-index explicitly flags "verify ... any AG-subpoena reference." This is a specific, externally checkable, legally sensitive factual claim about a named entity. I deliberately softened "42-state subpoena" to "multistate attorney-general inquiry" to reduce exposure; the underlying fact still must be confirmed. | Verify the existence, scope, and current status of the AG action against primary reporting before publication. If it cannot be cleanly sourced, cut the clause and rest the example on the score alone. Do not restore the specific "42-state subpoena" figure unless independently confirmed. |
| 14.3 | **The robotics index = "multi-agent oversight" (Schmidt framing).** | Ch14, dimensions paragraph | Maps the Robotics Labs index onto the Schmidt Sciences "Scaling AI Safety for a Multi-Agent World" framing (source_notes §10). This is a positioning analogy for funders, not a benchmark finding. | Acceptable as framing; confirm the Schmidt program language still matches before leaning on it in the funder-facing chapters (Ch29/Appendix E carry the hard deadline). |
| 14.4 | **No specific robotics-lab score is named.** | Ch14, robotics/demo paragraph | Intentional. source_notes contains no individual robotics-lab composite, so the robotics discussion is kept qualitative (demo vs pressure-test) with no invented number. | No fix needed; preserve this in edits. Do not let a later pass insert an illustrative robotics number without an explicit "illustrative" flag. |
| 14.5 | Index counts: **50 AI labs, 50 robotics labs**; pipeline maintains the 100 within the 1,256. | Ch14, throughout | Sourced (source_notes §0/§6). Routine count check. | Confirm against entity-count table; no change anticipated. |

---

## Chapter 15: Healthcare and Human Services

| # | Claim | Where | Why it needs verification | Suggested fix |
|---|---|---|---|---|
| 15.1 | **UnitedHealth Group scores 10.2, Critical band.** | Ch15, opening line and entity card | Sourced (source_notes §4, §8; methodology-v1.2 §3). The canonical real example, but it is a named corporation placed at the floor band, so it carries the highest defamation sensitivity in Part IV. | Confirm 10.2 against the live Fortune 500 index JSON. Keep the explicit "sum of eight dimension scores, anchored in sourced evidence, reconstructable" framing in the same paragraph : this is the legal protection (opinion on disclosed facts; *Bose v. Consumers Union* posture per source_notes §9). Editorial/defamation review required before print. |
| 15.2 | **The expanded federal probe was logged as an evidence-tier upgrade with no composite move (held at 10.2).** | Ch15, near-floor paragraph | Sourced (source_notes §4: "DOJ probe expansion logged as tier upgrade, no composite change"). I wrote "federal probe" rather than naming a specific agency; confirm whether source intends DOJ specifically. Near-floor limitation mechanics must be stated correctly. | Verify the agency/probe characterization against methodology-v1.2 §3. If "DOJ" is correct and printable, name it; otherwise keep the generic "federal probe." Confirm the no-composite-move logic reads accurately. |
| 15.3 | **"the pipeline logged a downgrade for another large managed-care insurer in the same period."** | Ch15, downgrade paragraph | This is the **Humana downgrade** from source_notes §8, which appears only as a bare sales-hook phrase with **no score, no detail, and no date**. Chapter-index flags "verify Humana downgrade." I deliberately did **not** name Humana and did **not** assert a number, to avoid an unsupported defamatory specific. | Before naming Humana or attaching any figure, confirm the downgrade event, its magnitude, and timing from the index change logs (`APPLIED_CHANGES.md`). If it cannot be substantiated, cut the sentence; the chapter does not depend on it. Do not add a Humana score. |
| 15.4 | **"ninety seconds per case" review window.** | Ch15, intentions paragraph | Echoes the illustrative composite scene from Ch1 (explicitly a composite there). Here it reads as a general sector illustration, not a UHG-specific fact. | Ensure edit keeps it generic/illustrative and does not let it attach to UnitedHealth Group as an asserted operational detail. |

---

## Chapter 16: Government and Public Service

| # | Claim | Where | Why it needs verification | Suggested fix |
|---|---|---|---|---|
| 16.1 | **Israel and Sudan each carry a composite of 0.0 (floor designation).** | Ch16, floor paragraph | Sourced (source_notes §4: "Israel (0.0); Sudan (0.0)"). Among the most geopolitically and legally sensitive claims in the manuscript. Must be verified against the live Countries index and accompanied by the floor-designation disclosure the methodology requires. | Confirm both 0.0 values against `site/src/data/indexes/countries.json`. Confirm each carries a public `FloorDesignation` disclosure and meets all four documented criteria across ≥3 cycles (source_notes §4). Legal/editorial review mandatory. If either has changed band, update. Keep the attribution-rule context that immediately precedes it. |
| 16.2 | **"Missile strikes on Ukraine are attributed to Russia, not counted against the country absorbing them."** | Ch16, attribution paragraph | Sourced as a worked example of the attribution/subject rule (source_notes §4, methodology-v1.2 §2). Politically sensitive but methodologically illustrative. | Confirm the example still matches the methodology doc's wording; keep it tied to the victim/perpetrator rule rather than to any country's composite. |
| 16.3 | **Coverage: 193 of ~207 countries; 21 of 51 US states.** | Ch16, coverage paragraph | Sourced (source_notes §0, §6; "~207" and "21 of 51"). The 207 denominator is approximate. | Keep "roughly 207." Confirm the 21/51 states figure is current; source_notes notes CLAUDE.md counts are stale, so verify against the live US States index JSON. |
| 16.4 | Index counts: **193 countries, 21 US states, 144 US cities, 250 global cities.** | Ch16, second paragraph | Sourced (source_notes §0). Routine. | Confirm against entity-count table. |
| 16.5 | **Floor-designation criteria** (four conditions, ≥3 cycles, reversible exit protocol). | Ch16, floor paragraph | Sourced (source_notes §4). Must be stated accurately because it is the safeguard that makes a 0.0 a measurement rather than an opinion. | Cross-check each of the four criteria and the exit-protocol description against methodology-v1.2 §3–4 verbatim. |

---

## Chapter 17: Corporations and Employers

| # | Claim | Where | Why it needs verification | Suggested fix |
|---|---|---|---|---|
| 17.1 | **Fortune 500 index = 448 companies.** | Ch17, second paragraph | Sourced (source_notes §0; canonical 448, not CLAUDE.md's 447). Routine but a known stale-count trap. | Confirm 448 against `fortune-500.json` meta. |
| 17.2 | **The histogram "distribution across the five bands"** and the claim that the index "discriminates" / places companies across bands. | Ch17, histogram paragraph and graphic note | No specific band counts are asserted (deliberate : source_notes gives no F500 distribution). The text describes the *shape* argument without numbers, and the graphic is "own data." | Keep numberless unless a verified distribution is pulled from the live index. If the designer renders real counts, those must be generated from `fortune-500.json` and flagged as own-data, zero-baseline. Do not let an edit insert illustrative band counts as fact. |
| 17.3 | **No individual F500 company is scored by name in Ch17.** | Ch17, throughout | Intentional. The only sourced F500-adjacent score (UnitedHealth Group) is used in Ch15; no other named corporate score exists in source_notes. | No fix; preserve. Any named corporate score added later must trace to source_notes or be flagged illustrative. |
| 17.4 | **ESG / disclosure characterization** ("ESG can tell you whether a company filed the right disclosures... was not answering this one"). | Ch17, ESG-contrast paragraph | Framing claim about a category of products. source_notes §8/§9 supports the positioning; chapter-index warns "ESG-buyer framing not overstated." Written as a distinction, not a disparagement. | Confirm it reads as "different question," not "ESG is worthless." Current wording credits ESG's purpose; keep that. |

---

## Chapter 18: Nonprofits, Humanitarian Organizations, and Civil Society

| # | Claim | Where | Why it needs verification | Suggested fix |
|---|---|---|---|---|
| 18.1 | **"Compassion Benchmark does not yet publish a civil-society index ... nonprofits ... are a planned extension, not a current scoreboard."** | Ch18, second paragraph and throughout | This is the chapter's central guardrail. source_notes confirms there is **no live nonprofits index** (only 8 indexes; nonprofits absent). Chapter-index flags "[VERIFY] whether nonprofits are an existing scored index or a forward application; do not imply current scoring." | Verified correct as forward-only. Ensure no edit introduces a present-tense nonprofit score, count, or named org placement. The whole chapter must stay in the conditional/forward voice. |
| 18.2 | **Per-entity confidence flag** would publish low-confidence civil-society scores with caveat. | Ch18, final-build paragraph | Sourced from the Universities index precedent (source_notes §6: High/Medium/Low confidence flag, "Low" published with explicit caveat). Applied forward to a not-yet-built index. | Keep framed as design intent ("would publish"), not an existing civil-society feature. Confirm the confidence-flag mechanism description matches the Universities index docs. |
| 18.3 | **Sector-agnostic framework claim** (same 8×5 structure; only evidence model and subject change). | Ch18, second paragraph + graphic | Sourced (source_notes §2 cross-sector adaptation; Appendix A closing line, verbatim concept). | Confirm wording matches Appendix A ("what changes by entity type is the evidence model and who counts as the subject of care, not the definition of compassion"). Currently paraphrased closely; fine. |
| 18.4 | **"mission-driven"** usage. | Ch18, title-area concept | style-lock bans "mission-driven" as filler. I avoided the phrase, using "mission-driven institutions/orgs" only where it denotes a real category, not as decoration. | Verify no filler use slipped in; current draft uses "mission-driven" sparingly and substantively. Consider "organizations that claim compassionate purpose" if a reviewer reads any instance as filler. |

---

## Top 3 flagged claims (highest priority for the verification pass)

1. **UnitedHealth Group 10.2, Critical (15.1)** and the **DOJ/federal-probe tier-upgrade-without-composite-move (15.2).** Named real entity at the floor band; the single most defamation-exposed pair in Part IV. Must be confirmed against the live index and cleared by editorial/legal review, with the "reconstructable, evidence-anchored" framing kept adjacent as the opinion-on-disclosed-facts protection.

2. **Israel 0.0 and Sudan 0.0 floor designations (16.1).** Geopolitically and legally sensitive; require confirmation against the live Countries index, proof that each carries the required public floor-designation disclosure and meets all four criteria across ≥3 cycles, and mandatory legal review before print.

3. **OpenAI 26.7 + the attorney-general inquiry (14.1, 14.2).** The score is sourced but chapter-index-flagged; the AG-action clause is an externally checkable, legally sensitive factual assertion that I already softened from the source's "42-state subpoena." Verify both, and cut the AG clause rather than ship it unconfirmed.
