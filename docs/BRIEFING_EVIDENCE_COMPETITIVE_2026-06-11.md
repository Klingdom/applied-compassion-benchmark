# Briefing Evidence — Competitive / Citation-Craft Benchmark (2026-06-11)

> Authored by competitive-researcher. Persisted by coordinator (returned inline). Lens: how best-in-class intelligence/research/data-journalism products surface PRIMARY EVIDENCE (verbatim quotes, hyperlinked sources, tiers, archives) and structure analytical depth. Integrity-first; independence = verifiability.

## Comparators → evidence mechanic (sources)
| Comparator | Evidence mechanic |
|---|---|
| Human Rights Watch | "told HRW" inline attribution + claim-level endnotes + block quotes; methodology separate from findings (hrw.org) |
| Bellingcat | Claim-level inline links; PS/SS primary/secondary notation; 6-level evidence grade; Hunchly/Mnemonic archives (bellingcat.com/about/editorial-standards-practices) |
| ProPublica | "Nerd box" methodology appendix; primary-doc links; GitHub raw-data release (propublica.org/nerds) |
| Our World in Data | Every chart "Source:" footer + linked dataset; derivation chain labeled; versioned downloads (ourworldindata.org/faqs) |
| Semafor "Semaform" | Named layers: The News (facts) / Reporter's View (analysis) / Room for Disagreement (counter-evidence) (semafor.com) |
| Axios Smart Brevity | "Why it matters" (analysis) + "Go deeper" (source links) separated from the lead fact |
| Wikipedia | Bidirectional `[n]` footnotes; full refs with publisher/date/url/access-date; Wayback for dead links |
| ICIJ | Primary docs published alongside narrative; hyperlinked entity→database; per-investigation methodology |
| Freedom House | Country chapters cite events; analysts defend scores; 3-layer methodology/findings/score |
| The Economist / Reuters Fact Check | Footnoted chart sources; "names sources, links to evidence" standard |
| Intelligence (BLUF) | Judgment → evidence bullets → assessment; confirmed/estimated/assumed labels; verbatim quotes distinct from paraphrase |

## Adaptable mechanics (scored)
1. **Claim-level inline attribution** ("according to OCHA…", linked) — Priority **14**. Universal across all comparators; turns independence from claim into click-verifiable fact.
2. **Expandable "Sources (N)" citation block** (native `<details>`, like the HistoryTimeline pattern) — **14**. `EntityEvidenceReview.sources[]`/tier scaffold exists; casual readers unaffected, researchers/institutions get full verification.
3. **Verbatim pull-quote block** (styled blockquote + named attribution + url) — **13**. Hardest evidence to fabricate/dispute; read at ~3× body rate; most differentiated from AI summaries. *Must be exact, captured verbatim upstream.*
4. **Evidence tier label (T1/T2/T3)** — **13**. Source-quality badge ("Primary source"/"Cross-referenced"/"Single-source"); also a scoring-confidence modifier.
5. **Structural evidence/interpretation separation** (Semaform) — **12**. "What the evidence shows" vs "what the benchmark concluded."
6. **Cause→effect→evidence chain** — **13**. Compact numbered, each step linked; operationalizes the "deterministic, evidence-linked" claim.
7. **Archived-link practice** (Wayback/Perma.cc `archivedUrl`) — **12**. Link-rot resistance; matches the "immutable evidence" moat.
8. **Counter-evidence note** ("Room for Disagreement", sourced) — **12**. Preempts the "activist" critique; shows scoring is evidence-responsive.

## Top 3 most adaptable
1. **Expandable Sources (N)** — lowest friction, scaffold exists, `<details>` pattern proven.
2. **Claim-level inline attribution** — pipeline prose discipline + per-signal sourceUrl; the most universal practice.
3. **Verbatim pull-quote** — highest impact; the benchmark's strongest latent asset (quotes already in `key_evidence`).

Proposed schema additions: `topSignals[].{sourceLabel, sourceUrl, citations[]{title,publisher,date,url,archivedUrl}, pullQuote{text,speaker,sourceUrl,date}}`. Note: weight evidence-tier as a scoring-confidence modifier (T3 raises the hold threshold; T1 lowers it).

Sources: hrw.org/publications · bellingcat.com/about/editorial-standards-practices · propublica.org/nerds · ourworldindata.org/faqs · semafor.com (Semaform explainer) · axioshq.com (Smart Brevity) · en.wikipedia.org/wiki/Wikipedia:Citing_sources · icij.org (Pandora methodology) · freedomhouse.org (FIW methodology) · gijn.org (Wayback for investigations) · specialeurasia.com (BLUF).
