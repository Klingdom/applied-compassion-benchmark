---
entity: "Anthropic"
type: "Company"
sector: "AI Lab"
date: "2026-07-01"
assessment_type: "resolved-event-arc-screen"
composite_score: 59.1
band: "Functional"
scores: { AWR: 3.6, EMP: 3.4, ACT: 3.5, EQU: 3.1, BND: 3.4, ACC: 3.5, SYS: 3.2, INT: 3.2 }
published_index: "ai-labs"
published_rank: 13
published_composite: 59.1
published_band: "Functional"
recommendation: "confirm"
delta: 0.0
direction: "none"
confidence: "medium"
watch_flags: ["SYS (WH 30-day AI vetting framework)", "BND (model-capability guardrails vs deployment pressure)"]
---

# Assessment: Anthropic — Model Ban → Clearance → Lift Arc (Net-Neutral Screen)

**Composite:** 59.1/100 (CONFIRM — resolved arc nets neutral)
**Band:** Functional

## Why it matters (plain language)
A US government action against Anthropic opened and closed inside the scan window. On June 12, 2026, the Commerce Department ordered Anthropic to shut off two models — Claude Fable 5 and Mythos 5 — over cybersecurity worries about automated-hacking capability, after Amazon's CEO flagged guardrail-bypass concerns. On June 26-27 the government cleared Mythos 5 for about 100 companies and federal agencies. On June 30, all restrictions were lifted. The 18-day arc opened and resolved with the models restored. The net effect on Anthropic's compassion conduct is neutral.

## Baseline provenance (§3e-bis(1))
- Live baseline **59.1**, rank **13** of 50 AI labs, Functional. Set **2026-05-29** (boundary case; INT 3.0→3.2, SYS 3.1→3.2 on a Pentagon "supply-chain risk" cost-of-conscience event). The baseline already prices Anthropic's safety-forward posture and its documented commercial costs for holding red lines.
- Recent, own-conduct-derived baseline. No "stale baseline" rationale applies.

## §3e-bis screening
- **Exogenous vs own-conduct:** the ban was a **government action** (Commerce Department), not Anthropic misconduct. The trigger was model *capability* (cyber), and the resolution (full lift June 30) restored the status quo. This is largely exogenous and resolved.
- **Directionality (both ways blocked):**
  - *No downgrade:* the ban was not a documented Anthropic harm event; the models were cleared, not found harmful. Absence of an adverse finding blocks a downgrade.
  - *No upgrade:* the lift restores prior state; it is not new positive compassion own-conduct. The arc is net-neutral.
- **Double-count:** Anthropic's safety-guardrail posture (the thing that both caused the flag and was vindicated by clearance) is already priced into the 2026-05-29 INT/SYS uplift.
- **Forward trigger, not realized:** the White House 30-day AI vetting framework governs *future* releases — a forward factor, not realized conduct this window.

## Disposition
**CONFIRM at 59.1. Delta 0.0. No change proposal.** Confidence: medium.
- **Forward trigger (downgrade):** a documented deployment of a model found to bypass safety guardrails in the wild, or abandonment of a safety pledge under vetting-framework pressure, would be scorable (SYS/INT).
- **Forward trigger (upgrade):** a documented, costly safety refusal under the new vetting framework would extend the cost-of-conscience pattern.
- **Watch:** SYS, BND.

---
*This assessment is based on publicly available information and does not constitute a formal Compassion Benchmark Certified Assessment. For a comprehensive, assessor-led evaluation, visit compassionbenchmark.com/certified-assessments.*

Sources:
- https://www.cnn.com/2026/06/26/tech/anthropic-mythos-release
- https://www.cbsnews.com/news/anthropic-trump-administration-lifted-claude-restrictions/
- https://techcrunch.com/2026/06/12/anthropics-safety-warnings-may-have-just-backfired-the-government-has-pulled-the-plug-on-its-most-powerful-ai/
- research/APPLIED_CHANGES.md (2026-05-29 Anthropic 58.1 → 59.1)
- site/src/data/indexes/ai-labs.json (live baseline 59.1, rank 13)
