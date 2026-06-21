# Special Briefing — Introducing the University Index

**How We Score Universities on Compassion, Not Prestige**

- **Edition:** Thematic — new-index explainer (one-off; companion to the launch findings briefing)
- **Date:** 2026-06-21
- **Author:** Special-Briefing agent (interpretive synthesis over the canonical record; read-only of index JSONs)
- **Scope:** A newcomer's on-ramp to the benchmark's 8th index — the top 100 universities and higher-education institutions worldwide, scored on the standard 8-dimension framework for how they recognize, respond to, and reduce suffering among the students, workers, and communities they are responsible for. This piece explains what the index is, what it measures, how to read a score, and how it differs from prestige rankings. For the leaders, the outliers, and the prestige–compassion argument, see the companion findings briefing, "The University Index — The Prestige–Compassion Gap" (2026-06-19).
- **Method note:** This briefing interprets the published University Index (`site/src/data/indexes/universities.json`), the canonical framework (`site/src/data/dimensions.ts`), the methodology page (v1.2), the launch CHANGELOG entry (2026-06-19), and the index's first nightly maintenance cycle (`research/digests/2026-06-20.md`). It does not re-score and changes no published value. Every score, rank, and distribution figure traces to the index data or those artifacts.

---

## publicSummary

> **Title:** Introducing the University Index — How We Score Universities on Compassion, Not Prestige
>
> **Dek:** The Compassion Benchmark's newest index ranks the top 100 universities worldwide — but not on the things prestige tables measure. It asks a single question the famous rankings never do: how does an institution treat the students, workers, and communities it is responsible for, and can that treatment be evidenced? This is the on-ramp for a newcomer: what the index is, what it measures, how to read a score, and what a number does and does not claim. (For the leaders and the prestige–compassion argument, see the companion findings briefing.)
>
> **The cohort:**
> - 100 universities and higher-education institutions, selected by composite of three public prestige rankings — Times Higher Education 2026, QS 2026, and the Academic Ranking of World Universities (Shanghai) 2025 — and scored on the same 8 dimensions and 0–100 composite as the benchmark's other seven indexes.
> - **0 Exemplary. 3 Established. 76 Functional. 21 Developing. 0 Critical.** Mean composite 46.2, median 46.9 — a field that sits almost exactly at the center of the 0–100 scale.
> - Each institution carries four context flags: country, region, type (78 public, 22 private), and an evidence-confidence flag (62 high, 29 medium, 9 low).
> - Scored on conduct toward students, workers (including graduate and contingent labor), and surrounding communities — never on research output, citations, or selectivity.
>
> **Key findings (observer voice):**
> 1. **It measures a different thing than every prestige ranking.** Times Higher Education, QS, and Shanghai score research, citations, reputation, and selectivity. The University Index scores none of those. It asks how an institution treats the people inside and around it — students, faculty and staff (including graduate and contingent workers), and the surrounding community — using the same 8 dimensions applied to every other index.
> 2. **A score is evidence of conduct under cost, not a moral percentage.** The 0–100 composite reflects what an institution can be shown to have done — documented in counseling-center data, union contracts, regulator findings, investigative reporting, and institutional disclosures. Performance only counts when it held up under cost or pressure; a strong record under easy conditions is capped, not rewarded.
> 3. **The whole field reads as middling.** 97 of 100 institutions fall in the two central bands (76 Functional, 21 Developing); none reaches Exemplary and only three reach Established. With a mean of 46.2 and a median of 46.9, the category as a whole is neither failing nor leading.
> 4. **The confidence flag is part of the score.** Sixty-two institutions are scored at high confidence, 29 at medium, and 9 at low. A low-confidence score signals thin public evidence, not a proven verdict — and where evidence is thin the index scores conservatively toward the middle rather than manufacturing a confident indictment.
> 5. **The index is maintained nightly, with a clear rule about whose conduct counts.** Every institution enters a nightly evidence scan. On the index's first maintenance cycle, all 10 universities assessed held at their published scores: the June 2026 federal campaign against US universities was treated as harm inflicted *on* them and attributed to the actor that caused it — not scored against the schools.
> 6. **Read a score for what it claims, and what it does not.** It does not claim an institution is good or bad, famous or obscure. It claims that, on the public record, this is how the institution recognizes, responds to, and reduces suffering among the people it is responsible for — and how confidently that can be evidenced today.

---

## 1. Why a compassion lens on universities at all

Every prominent university ranking measures roughly the same family of things. Times Higher Education, QS, and the Academic Ranking of World Universities (Shanghai) score research output, citations, faculty and employer reputation, and internationalization. They are prestige instruments, and they are good at what they do: they tell a prospective student which institution is most admired by other academics and employers.

They tell that student almost nothing about how the institution will treat them.

A university can sit at the very top of a prestige table while its graduate workers pay more than half their stipend in rent, while its counseling center's wait-times stretch past the point of usefulness, while adjunct faculty earn near-poverty wages, and while harm reports go to legal review before they are acknowledged. None of that is visible on a research-and-reputation ranking. The two questions — "how admired is this institution?" and "how does it treat the people inside it?" — are simply different questions, and they do not have the same answer.

The Compassion Benchmark's University Index — the institution's 8th index, joining countries, the Fortune 500, AI labs, robotics labs, US states, US cities, and global cities — exists to answer the second question on the public record. It scores the top 100 universities worldwide on the same eight dimensions and the same 0–100 composite used everywhere else in the benchmark, asking: **does this university recognize, respond to, and reduce suffering among the people it is responsible for?**

That question fills a gap that nothing else fills. Prospective students, graduate workers, and adjuncts have never had an independent, comparative read on institutional conduct — only marketing and prestige. This index is that read. It does not replace the prestige tables; it sits beside them and measures the dimension they omit.

## 2. Scope and sourcing — how the 100 were chosen

The 100 institutions are not the benchmark's own opinion of which universities matter. They are selected by **composite of the three most-cited global prestige rankings: Times Higher Education 2026, QS 2026, and the Academic Ranking of World Universities (Shanghai) 2025.** Inclusion is therefore defensible to any institution on neutral grounds — "you appear in the top tiers of THE, QS, or Shanghai" — and is never paid for, never solicited, and never adjustable. No university paid for inclusion, received its score before publication, or had a score changed in response to outreach or pressure.

Using prestige rankings to *select* the cohort, and then scoring that cohort on something prestige rankings cannot see, is deliberate. It means the index is examining exactly the institutions the world already considers elite — and asking whether elite status coincides with compassionate conduct.

Each of the 100 institutions carries four context flags, visible on the index and on every per-institution page:

- **Country** — where the institution is based.
- **Region** — its world region, so the table can be read by geography.
- **Type** — public or private. The cohort is **78 public and 22 private** institutions; the index leans public, which matters because much of the access-and-equity record concentrates there.
- **Evidence-confidence** — high, medium, or low, signaling how much substantive public evidence underwrites the score. The cohort is **62 high, 29 medium, and 9 low** confidence. This flag is not decorative; it is part of how a score should be read (Section 6).

## 3. Whose experience the index scores

The single most important thing to understand about this index is **whose experience it is measuring.** It is not the institution's research, its endowment size, or its admit rate. It is the institution's conduct toward the people it is responsible for.

The benchmark defines that population precisely for universities: **students, workers (faculty and staff, explicitly including graduate and contingent labor), and the surrounding communities the institution operates in.** This is the "scored subject" for the University Index, and it is fixed in the same attribution framework that governs every other index — for countries it is residents; for companies it is workers, customers, and communities; for universities it is the campus and its neighbors.

That definition has consequences a newcomer should anticipate:

- **Graduate and contingent workers count fully.** A university's treatment of teaching assistants, postdocs, and adjunct faculty — stipends against local cost of living, health coverage, workload, job security — is squarely in scope, not a footnote to it.
- **Selectivity and research are explicitly out of scope.** How hard it is to get in, how many papers the faculty publish, and how famous the institution is have no bearing on the score. Those are precisely the things the prestige tables already measure.
- **Surrounding communities are in scope.** How the institution affects the people who live around it — its neighbors, not only its members — is part of the record.

When you read a University Index score, you are reading an answer to one bounded question: *how does this institution treat students, its workers, and its community, as far as the public record can show?*

## 4. How scoring works, in plain terms

The University Index uses the benchmark's standard scoring machinery, unchanged. A newcomer does not need the full formula to read the table, but the shape of it is worth knowing.

**Eight dimensions, forty subdimensions.** Every entity is scored on the same eight dimensions: Awareness (does it detect distress early?), Empathy (do people feel cared about, not processed?), Action (does need produce timely, effective help?), Equity (is care distributed fairly, especially to those with least power?), Boundaries (is helping sustainable and non-exploitative?), Accountability (does it own failures and repair them?), Systemic Thinking (does it reach root causes, not just symptoms?), and Integrity (is the commitment genuine and consistent when it costs something?). Each dimension has five subdimensions, for forty in total, and each subdimension is scored 0–5 against fixed behavioral anchors — from 0 (active documented harm) through 3 (developing) to 5 (independently verified and sustained under pressure).

**From subdimensions to a 0–100 composite.** The five subdimension scores within a dimension are summed and converted to a dimension score out of 10. The eight dimension scores are averaged on the 0–5 scale, then converted to a base composite by the canonical formula:

```
((average − 1) ÷ 4) × 100 = base composite (0–100)
```

An **integration premium** of up to 10 points is then added and the result clamped to a 0–100 maximum. The premium rewards consistency: strong, even performance across all eight dimensions earns up to +10, while spiky profiles earn little or none, and any single dimension at zero (active harm) cancels the bonus entirely. The premium is deliberately hard to earn — it is why a balanced profile can outscore a higher-but-lopsided one, and why no university in this cohort reaches the top bands on a single strength alone.

**Five bands.** The composite maps to five public bands: Critical (0–20), Developing (20–40), Functional (40–60), Established (60–80), and Exemplary (80–100). These bands describe the whole-institution composite; they are not the same as the 0–5 anchor levels used on individual subdimensions, even where the names overlap.

The methodology is published in full, versioned (currently **v1.2**), and contestable — the same eight dimensions and forty subdimensions apply to every entity in every index, which is what makes a university's 52.3 comparable to a company's or a city's 52.3.

## 5. The distribution as it actually stands

Read as a whole, the University Index describes a category clustered in the middle of the scale. The verified distribution, drawn directly from the index data:

| Band | Range | Count | Share |
|------|-------|-------|-------|
| Exemplary | 80–100 | 0 | 0% |
| Established | 60–80 | 3 | 3% |
| Functional | 40–60 | 76 | 76% |
| Developing | 20–40 | 21 | 21% |
| Critical | 0–20 | 0 | 0% |

The **mean composite is 46.2 and the median is 46.9** — both sitting almost exactly at the center of the 0–100 scale. Ninety-seven of the 100 institutions fall in the two central bands. Not one reaches Exemplary; only three reach Established. No institution sits in Critical, and none reaches the top band. The picture is a tight cluster around the middle, with short tails at each end.

What that means for a reader: as a category, the world's most prestigious universities are neither failing nor leading on compassion. They are middling — competent on the basics with significant gaps remaining. The companion findings briefing examines *why* the field compresses this way and which institutions break from it; this explainer's point is narrower and prior. Before asking who leads, a newcomer should know that the honest baseline for this cohort is the middle of the scale, and that a score in the low 50s is, in this field, an above-average result rather than a failing grade.

## 6. How to read a score — what it does and does not claim

A University Index number is easy to misread if you bring prestige-ranking habits to it. Three reading rules keep it honest.

**A score is evidence of conduct, not a moral percentage.** A composite of 52.3 does not mean an institution is "52% compassionate." It means that, against forty behavioral anchors and a published formula, the documented public record places the institution there — and that the components of that record held up under the pressure-test (performance only counts when it was costly, risky, or inconvenient to deliver). A score is a structured reading of evidence, not a verdict on character.

**Prestige and selectivity are not in the number.** Nothing about admit rate, research volume, or fame moves the composite. If a famous, hyper-selective institution lands in the middle of the table, that is not an error or a snub; it is the index doing exactly its job — reporting that selectivity and compassion are different things and do not automatically travel together.

**The confidence flag is part of the score.** Sixty-two institutions are scored at high confidence, 29 at medium, and 9 at low. A high-confidence score rests on a substantial public record. A **low-confidence score reflects an evidence gap, not a proven failure** — much of the relevant record may exist only in another language, or disaggregated institutional data (counseling wait-times, completion gaps, labor conditions) may not be openly published. Where evidence is thin, the index scores conservatively toward the middle rather than dressing uncertainty up as a confident indictment, and no low-confidence institution is scored into the top band. When you read a low-confidence number, read it as "this is what the public record currently allows us to say," not "this is the final word."

## 7. How the index is maintained

A published score is not a one-time verdict. Every one of the 100 institutions enters the benchmark's **nightly research pipeline**: a structured scan looks for material new public evidence within a recent window, entities with material new evidence receive a full reassessment against the 40-subdimension rubric, a digest synthesizes the night's findings, and **no score changes without human approval.** Each per-institution page carries a freshness stamp showing when its evidence was last reviewed.

The index's **first maintenance cycle (2026-06-20)** is the cleanest illustration of how this works in practice — and of one rule a newcomer should understand. Ten universities were assessed that night, and **all ten held at their published scores** (Brown 60.2, UC Irvine 60.2, Yale 55.5, UC Berkeley 55.5, Stanford 54.7, Harvard 52.3, UCLA 45.3, Columbia 44.5, NYU 39.1, USC 36.7 — each confirmed at delta 0.0). The reason is instructive: the dominant university news of June 2026 was the federal campaign against US universities — funding-clawback suits, grant freezes, admissions compliance reviews — and that is **harm inflicted *on* the universities, not conduct *by* them.**

This is the benchmark's **victim/perpetrator attribution rule**, applied here at the scale of an entire new index for the first time. Before any harm event is scored, the assessor asks who *did* the harmful thing, not merely where the harm landed. Action inflicted on a university by an external actor is attributed to that actor and does not lower the university's score. The same rule attributes missile strikes on Ukraine to Russia, leaving Ukraine's own conduct profile unchanged.

The rule cuts both ways, which is what keeps it from being a shield. Harm a university inflicts on its own people *by its own choice* is scored. In the same June 20 cycle, Harvard's own layoffs, salary freeze, and staff cuts were treated as genuine internal-consistency signals that stay in the assessment — even as the externally imposed funding suit against Harvard did not. The same news cluster splits cleanly into "done to the institution" (not scored) and "done by the institution" (scored). That discipline is how the index stays a measure of conduct rather than a measure of who happened to be in the headlines.

## 8. Forward view — where to go next

- **Read the companion findings briefing for the leaders and the argument.** This explainer deliberately stops short of ranking and interpretation. "The University Index — The Prestige–Compassion Gap" (2026-06-19) covers who tops the table and why, the dimensions that most consistently hold universities back, and the prestige-gap thesis in full. This piece is the on-ramp; that one is the destination.
- **Browse the full table at `/universities`.** The 100-institution ranking is published with each institution's composite, band, region, type, and confidence flag, sortable and filterable.
- **Open a per-institution page at `/university/[slug]`.** Each institution has its own page with the full eight-dimension profile, the evidence behind each dimension, and a freshness stamp showing when the record was last reviewed.
- **Watch the confidence frontier.** The 9 low-confidence institutions are the index's largest open question. As more disaggregated institutional data becomes available in English — or does not — those scores will be revisited. Movement there will reflect evidence availability as much as institutional change, and the conservative-when-uncertain discipline should hold through any such revision.
- **Watch the maintenance log.** Because the index is monitored nightly, the live numbers can move when a university's own conduct changes — a labor settlement, a regulator finding, a documented reform. The published table is a snapshot of an actively maintained record, not a frozen verdict.

## Sources

- **Canonical scores (ground truth):** `site/src/data/indexes/universities.json` — the 100-institution roster, every composite, band, dimension vector, and the country/region/type/confidence flags cited above. Verified distribution: mean 46.2, median 46.9; bands 0 Exemplary / 3 Established / 76 Functional / 21 Developing / 0 Critical; type split 78 public / 22 private; confidence split 62 high / 29 medium / 9 low. First-cycle holds verified: Brown 60.2, UC Irvine 60.2, Yale 55.5, UC Berkeley 55.5, Stanford 54.7, Harvard 52.3, UCLA 45.3, Columbia 44.5, NYU 39.1, USC 36.7.
- **Framework / dimensions:** `site/src/data/dimensions.ts` — the eight dimensions and forty subdimensions, the 0–5 anchor ladder, the five-band vocabulary and ranges, and the canonical integration-premium logic summarized in Section 4.
- **Method (canonical, v1.2):** `site/src/app/methodology/page.tsx` — the scoring formula `((avg − 1) ÷ 4) × 100 + integration premium`, the pressure-test principle, the scored-subject table (universities = students, workers, surrounding communities), the victim/perpetrator attribution rule, the evidence hierarchy, and the human-approval gate on all score changes.
- **Launch record:** `CHANGELOG.md`, entry "2026-06-19 — New index: the University Index (top 100 universities)" — entity selection (THE 2026 + QS 2026 + ARWU 2025), the distribution figures, the leaders, and the sourcing model.
- **First maintenance cycle:** `research/digests/2026-06-20.md` — the index's first nightly cycle, in which 10 universities were assessed and all held at published composites via the victim/perpetrator rule; canonical-formula reconstruction of all spot-checked baselines matched published values exactly (diff 0.0).
- **Companion findings briefing:** `site/src/data/special-briefings/university-index-2026-06-19.json` — "The University Index — The Prestige–Compassion Gap," the leaders/findings argument this explainer points readers to and deliberately does not duplicate.
