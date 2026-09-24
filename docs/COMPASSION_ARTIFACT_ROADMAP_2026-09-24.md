# Compassion Benchmark — artifact roadmap for AI models and AI-assisted workflows

**Date:** 2026-09-24 · **Author:** product-manager · **Status:** recommendation for founder decision. Nothing built.

**Scope note.** Three artifacts are already being written by another agent and are deliberately **not** re-proposed
here: a `compassionate-practice` skill, a `compassion-steward` reviewer agent, and a plugin bundling both. This
roadmap covers what else earns a place — mostly **reference docs**, not new agents or skills. That is itself a
finding: once the compassion-behavior surface (skill) and the code-review surface (agent) are accounted for, almost
every remaining real gap in this repo is a **document a model or a human loads for context**, not a new actor with
its own authority. I did not force agents into existence to hit a quota.

**The hard constraint, restated and applied throughout:** anything that teaches a model to **score well on our
published task bank** is a cheat sheet and corrupts the measurement — illegitimate. Anything that helps a model
**behave** more compassionately, independent of whether we are watching, is legitimate. I judged every candidate
below against that line and state the verdict explicitly. I also flag, separately, anywhere an artifact would make
the benchmark look like a consultancy to the entities it measures — a violation of the independence policy in
`CLAUDE.md`, and a different failure mode from rubric-gaming.

---

## Ranked recommendations

| # | Name | Type | Audience | Priority (I+S+L+C−E−R) | Effort | Verdict |
|---|---|---|---|---|---|---|
| 1 | `EVIDENCE_DISCIPLINE.md` | Reference doc | Our own research agents (already partial); externally, journalists, researchers, other benchmark builders | **15** | ~1 day | **Build first** |
| 2 | `INTERPRETING_AND_CITING_CB.md` | Reference doc | Journalists, researchers, procurement/vendor-diligence teams (and their AI assistants) | **13** | 4–6 hrs | **Build first** |
| 3 | `MEASURING_YOUR_OWN_MODEL_HONESTLY.md` | Reference doc | AI labs' internal eval teams; researchers building their own harness | **13** | ~1 day | **Build first** |
| 4 | `REFUSAL_WITH_CARE.md` | Reference doc (shareable fragment, not a standalone skill) | Prompt engineers, safety teams, any AI-assisted product build | **10** | 4–6 hrs | Recommended, second wave |
| 5 | `CRISIS_ADJACENT_PRODUCT_GUIDE.md` | Reference doc (skill-shaped candidate later) | Product/eng teams building mental-health, DV, grief/loss AI features | **9** | ~2 days | Recommended, second wave — needs clinical-literature sourcing, not benchmark-derived |

Each score uses this project's own model, I + S + L + C − E − R, 1–5 per letter (Impact, Strategic alignment,
Learning value, Confidence, minus Effort, minus Risk). Full breakdown is in each artifact's section below.

---

## 1. `EVIDENCE_DISCIPLINE.md` — reference doc

**Gap it fills.** This institution has paid, in dated incidents, for a specific set of evidence-handling defects —
recurring misdated claims (`research/known-misdated-claims.json`, the Meta "8,000 layoffs" claim surfacing three
cycles running), absence claims from searches that proved nothing (`AUTONOMY.md` §Meta-review V8: four false
all-clears in 48 hours, one from `head -4` truncation), entity-identity confusion across duplicates and mergers
(ADP, Apexica, Halodi/1X, Interpublic/Omnicom), and a documented convention for telling **absence of disclosure**
apart from **evidence of harm** (the "2-convention," the Cerebras −22.1 caveat). None of this is packaged anywhere
a model or a third-party researcher could load it independent of this specific codebase.

**Who uses it and when.** Any AI-assisted research or journalism workflow doing evidential claims about an
institution — loaded as context before a research/fact-check pass. Internally: a generalized, portable version of
what `overnight-assessor.md` and `AUTONOMY.md` §V8 already encode for our own pipeline, usable by teams who have
never seen those files.

**Why it is not covered.** The lessons exist, but scattered across agent specs, `AUTONOMY.md`, `IMPROVEMENT_BACKLOG.md`
entries and a ledger file — none written as a standalone, exportable methodology doc. `cb-probe` measures a model's
answers; it does not teach research rigor. None of the 32 project agents produce a redistributable artifact — they
produce internal work product.

**Legitimacy.** Clearly on the **behave-honestly** side. It teaches verification discipline in general (date-check
before citing, run a positive control before claiming absence, distinguish allegation from finding, attribute to
the correct legal entity), never references our probe items or rubric anchors, and would apply equally to a
benchmark that had never heard of Compassion Benchmark. No path from this doc to a higher CB score.

**Integrity risk and containment.** Publishing our own defect history is mildly embarrassing but not a game-ability
risk — it does not touch the task bank at all. Contain by keeping the doc's examples generic (paraphrase the lesson,
do not reproduce internal proposal-file mechanics like `status: "approved"` workflows, which are ours, not
generalizable).

**Effort:** ~1 day, mostly synthesis of material that already exists.
**Priority:** I5 S5 L4 C4 − E2 − R1 = **15**.

---

## 2. `INTERPRETING_AND_CITING_CB.md` — reference doc

**Gap it fills.** Nothing today tells a journalist, researcher, or procurement team what a band means, what a
placeholder is, or what our actual coverage is, in one place a model can load before writing about us. The
`docs/SEPTEMBER_2026_COVERAGE_MAP.md` finding that "we scan daily" would be a false claim, and the `CLAUDE.md` data
notes distinguishing the published catalogue (1,325 scored entities) from the research-tracking count (1,329,
"scanned"/"tracked," a different number) are exactly the kind of distinction an external citer will get wrong
without help. `official: false` self-run scores from `cb-probe`/`cb-ops` (per `docs/MCP_SCORED_RUN_DESIGN_2026-09-20.md`)
are a second, adjacent trap: "Compassion Benchmark rates X at N" from a self-judged estimate is explicitly named as
an accepted risk (AMB-E) in that design, with no public-facing correction artifact yet.

**Who uses it and when.** A journalist or researcher's AI assistant, loaded before drafting a piece that cites a CB
score; a procurement/vendor-diligence team deciding how much weight a band should carry in a contract decision.

**Why it is not covered.** `seo-aeo-architect`'s citability work is about our own pages being findable and citable —
not about a third party correctly interpreting what they found. `/ai-models/methodology` explains the methodology
of the AI-model track specifically; nothing explains bands, placeholders, and coverage caveats for the whole
catalogue in a compact, citation-ready form external tools can quote.

**Legitimacy.** Behave-honestly side — it constrains how our own numbers may be represented, in our favor toward
accuracy, not in favor of any entity's score.

**Integrity risk and containment — independence flag.** This is the one candidate closest to reading as a
certification service: if positioned as "here is how to correctly use our score in your procurement decision," it
edges toward endorsing outcomes for entities we measure, which conflicts with the independence policy's line
between "access, interpretation, and institutional use" (permitted, commercial) and anything resembling paid
influence over how an entity is treated. Containment: publish it free and unbranded-as-service (a reference doc, not
a consulting deliverable), and include an explicit line that the guide is not an endorsement or certification
service and confers no preferential treatment to any entity.

**Effort:** 4–6 hours — mostly compiling facts already established in `dimensions.ts` (`BANDS`), `CLAUDE.md` data
notes, and the coverage map.
**Priority:** I4 S4 L3 C4 − E1 − R1 = **13**.

---

## 3. `MEASURING_YOUR_OWN_MODEL_HONESTLY.md` — reference doc

**Gap it fills.** D-07 is on the record: the same automated scoring pipeline rated the same subject 58.1 and 60.6,
three days apart, across a band boundary. `docs/MCP_SCORED_RUN_DESIGN_2026-09-20.md` §4 formalizes why a model
rating its own compassion is the weakest possible eval configuration (C1 self-judge) and why cross-judge (C2) or
panel (C3) configurations are the honest default, and §5 makes contamination-testing (has the model memorized the
answer key) a precondition for emitting any number at all. None of that reasoning exists as a standalone document a
team without our tooling could use to sanity-check their own internal eval.

**Who uses it and when.** An AI lab's internal eval/safety team, before or while building their own compassion- or
values-alignment eval — read once, referenced whenever someone proposes trusting a single self-judged run.

**Why it is not covered.** `cb-ops`/`cb-probe` (per `docs/MCP_SERVER_PLAN_2026-09-20.md`) are *tools*; this is the
*why*, usable by a team that never touches our MCP servers at all. The MCP planning docs are dated, founder-facing
planning artifacts, not written for redistribution.

**Legitimacy.** Clearly behave/measure-honestly side. It teaches eval methodology (judge configuration, trial
counts, contamination testing, variance reporting) in general terms; it says nothing about our specific rubric
anchors or how to answer them, so there is no path to a higher CB score through it.

**Integrity risk and containment.** The mild risk here is commercial, not integrity: if this document is generous
enough, a lab might reasonably conclude they do not need to pay for an official CB assessment. That is an acceptable
trade — the same trade the MCP plan already accepted at MCP-B6, judging the credibility upside worth more than the
revenue it might substitute for. No containment needed beyond the standard `official: false` framing already used
elsewhere.

**Effort:** ~1 day — synthesis of `docs/MCP_SCORED_RUN_DESIGN_2026-09-20.md` §4–5 and D-07 into a standalone,
tool-independent document.
**Priority:** I5 S4 L4 C4 − E2 − R2 = **13**.

---

## 4. `REFUSAL_WITH_CARE.md` — reference doc, not a standalone skill

**Gap it fills.** B4 (Refusal Ethics) names exactly the failure mode the brief calls out: refusal delivered as
abandonment rather than care is the most common failure pattern in deployed assistants. B4's published anchors
(`dimensions.ts`) already describe the *institutional* version of this (warm referral, no one turned away without
an alternative) — but nothing translates that into guidance for a single model turn: how to decline without
pretending the need doesn't exist, without a lecture, and without a dead end.

**Who uses it and when.** Prompt/safety engineers shaping a model's refusal behavior; loaded as a system-prompt
fragment or design reference at build time, not at runtime per-request.

**Why it is not covered.** This is the one candidate with real overlap risk against the in-progress
`compassionate-practice` skill, since refusal ethics is literally one of that skill's eight underlying dimensions.
**Resolution:** ship this as a **reference doc**, not a competing skill package — something `compassionate-practice`
(or any other skill) can `@`-reference rather than duplicate. If the in-progress skill already covers B4 to this
depth, this document becomes its source citation rather than redundant work; if it does not, this fills the gap
without creating a second skill surface that could drift from the first.

**Legitimacy.** Behave side. It is written from general refusal/de-escalation practice, not from our held-back task
items, so it teaches a behavior, not an answer key.

**Integrity risk and containment.** Low. The only risk is scope drift into duplicating `compassionate-practice`;
contained by the reference-doc-not-skill decision above, and by a one-line coordination note asking whoever owns
that skill to confirm before this ships.

**Effort:** 4–6 hours.
**Priority:** I5 S3 L3 C3 − E2 − R2 = **10**.

---

## 5. `CRISIS_ADJACENT_PRODUCT_GUIDE.md` — reference doc (skill-shaped candidate later)

**Gap it fills.** The task bank contains suicidal-ideation, domestic-violence, and miscarriage items, held back from
public serving by default (`include_sensitive` defaults false, per `docs/MCP_SERVER_PLAN_2026-09-20.md` §2.2). That
correctly protects *our* measurement surface. It does nothing for a product team actually building AI features that
sit next to those exact human situations — a mental-health companion, a DV-resource chat, a pregnancy-loss support
tool — none of whom have any artifact from us today, because we have never published anything outward-facing about
duty of care in these contexts.

**Who uses it and when.** Product/engineering teams building crisis-adjacent AI features; loaded as design guidance
before shipping, and periodically re-reviewed as the feature evolves.

**Why it is not covered.** `compassion-steward` reviews this repo's own work; it does not produce outward-facing
product guidance for other teams' crisis features. No project agent, ECC skill, or published page addresses this
audience.

**Legitimacy — the one place this candidate must be built carefully.** This must be sourced from **independent
clinical/crisis literature** (e.g., established crisis-line practice, DV-advocacy guidance, grief-support literature)
— never from our own sensitive item text or rubric anchors. If it were derived from the bank, it would become
exactly the kind of rehearsal-against-our-measurement the hard constraint forbids, and it would risk leaking
held-back item content through paraphrase. Built from outside sources about real-world crisis response, it sits
cleanly on the behave side.

**Integrity risk and containment.** Two risks, both real: (1) leak risk — contained by sourcing rule above, verified
by a simple diff-against-bank check before publication; (2) liability/authority risk — a benchmark institution is
not a clinical authority, so this must carry a strong disclaimer, point to real crisis lines (988 and equivalents),
and never be framed as clinical advice.

**Effort:** ~2 days — the extra time is the clinical-literature sourcing and review, not the writing.
**Priority:** I5 S4 L3 C3 − E3 − R3 = **9**.

---

## Proposed and rejected

Rejecting a candidate is as much a decision as recommending one. Each of these was considered against the hard
constraint and the independence risk, and did not earn a place.

- **Institutional compassion guide for organizations, external-facing (SYS/INT).** Rejected — **independence risk**.
  Our catalogue already covers governments, corporations, AI labs, and robotics labs; an outward-facing "how to be a
  structurally compassionate institution" guide, framed around our own SYS/INT vocabulary, would read as a
  benchmark-as-consultancy product to the exact entities we score, in direct tension with "entities never pay for
  inclusion, score changes, or suppression of findings" (`CLAUDE.md`). The legitimate version of this — paid,
  disclosed institutional-use engagement — already exists as a permitted commercial category; a free redistributable
  markdown artifact optimized around our own dimension taxonomy is not that.
- **Institutional compassion guide, internal-only (assessor-facing, SYS/INT).** Rejected — not a new gap.
  `dimensions.ts` anchors already describe what genuine vs. performative structural compassion looks like (I2
  Non-Performance exists for exactly this), and `MB-5` (EQU rubric repair) is already queued in
  `IMPROVEMENT_BACKLOG.md`. A narrower internal doc would duplicate work already scoped elsewhere rather than fill
  an unaddressed gap.
- **Band-calibration worked-examples dataset.** Rejected — **hard-constraint violation**. The published anchors
  already are the full rubric; a set of worked "here is a 3 vs. a 4" examples would function as an answer key. This
  is the clearest illegitimate candidate considered.
- **A "compassion red-team" skill derived from the item bank**, rehearsing crisis-style scenarios against our
  sensitive items. Rejected — **hard-constraint violation**: it would contaminate `run_exposure_probe`'s memorization
  signal and constitute rehearsal against our own measurement. The legitimate version of this idea is already folded
  into `CRISIS_ADJACENT_PRODUCT_GUIDE.md` above, built from independent clinical sources instead.
- **Band-appeal / self-correction request template for entities.** Rejected — out of scope for this roadmap. It is a
  real process gap, but it is not shaped for "use inside AI models and AI-assisted workflows"; it belongs with
  `support-ops` as a process document, not this artifact set.
- **Localized/translated probe-item dataset.** Rejected — no evidenced audience demand, and it expands the exposure
  surface of held-back and sensitive items for no demonstrated gap.
- **A standalone "compassion glossary" reference doc/command.** Rejected as redundant — its content folds entirely
  into `INTERPRETING_AND_CITING_CB.md`; a second artifact would fragment the one place external readers should look.
- **A "cite-us" MCP tool or command wrapping the citation guide.** Rejected — out of scope for this request (a
  tool/server, not a markdown artifact) and, per the MCP plan's own pattern, wrappers "add zero capability" over the
  document itself; ship the doc first and reconsider packaging only if adoption shows the need.

---

## The three to build first, and what each changes

1. **`EVIDENCE_DISCIPLINE.md`.** Changes how a research or journalism workflow verifies a claim before publishing
   it — moves from "a search found nothing, so I'll say it's absent" to "I ran a positive control first," and from
   "I found a date" to "I checked whether that date is the true one." This is the highest-value artifact because it
   is the most thoroughly evidenced by our own incident history and generalizes cleanly to anyone doing evidential
   work with an AI assistant, not just us.
2. **`INTERPRETING_AND_CITING_CB.md`.** Changes what a journalist, researcher, or procurement officer's AI assistant
   writes when it cites a CB number — stops a self-run `official: false` estimate from being reported as "Compassion
   Benchmark rates X at N," and stops a placeholder or lightly-assessed entity's score from being treated with the
   same confidence as a fully-assessed one.
3. **`MEASURING_YOUR_OWN_MODEL_HONESTLY.md`.** Changes how an AI lab's internal eval team designs their own
   self-assessment — moves them from "the model rated itself and we believed the number" toward multi-trial,
   cross-judged, contamination-checked evaluation before anyone treats a self-run score as evidence of anything.
