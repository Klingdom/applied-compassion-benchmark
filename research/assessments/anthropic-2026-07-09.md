---
entity: "Anthropic"
type: "Company"
sector: "AI Lab"
date: "2026-07-09"
composite_score: 59.1
band: "Functional"
scores:
  AWR: 3.6
  EMP: 3.4
  ACT: 3.5
  EQU: 3.1
  BND: 3.4
  ACC: 3.5
  SYS: 3.2
  INT: 3.2
published_index: "ai-labs"
published_rank: 13
published_composite: 59.1
published_band: "Functional"
assessment_type: "confirmation"
recommendation: "confirm"
watch_flag: "downward"
---

# Compassion Benchmark Assessment: Anthropic

**Entity type:** Company (AI Lab)
**Assessment date:** 2026-07-09
**Composite score:** 59.1/100 (confirmed, unchanged)
**Band:** Functional (boundary-watch: 0.9 pt below the Established 60.0 threshold)

## Score Summary

| Dimension | Code | Score (raw 1-5) | Band |
|-----------|------|-------|------|
| Awareness | AWR | 3.6 | Functional |
| Empathy | EMP | 3.4 | Functional |
| Action | ACT | 3.5 | Functional |
| Equity | EQU | 3.1 | Functional |
| Boundaries | BND | 3.4 | Functional |
| Accountability | ACC | 3.5 | Functional |
| Systemic Thinking | SYS | 3.2 | Functional |
| Integrity | INT | 3.2 | Functional |
| **Composite** | — | **59.1** | **Functional** |

## Assessment Type: Confirmation (special-attention governance re-check)

Per this cycle's directive: assess whether the hidden Claude Code steganographic tracker discovered and removed in early July 2026 is a scoreable governance/transparency harm (INT / ACC) large enough to move the composite across the 5-point threshold or a band line — or whether it is sub-threshold.

## Within-Window Evidence (2026-06-25 to 2026-07-09)

- **Hidden Claude Code tracker discovered and removed (Jul 6-9, NEW).** Independent researcher "Thereallo" found that Anthropic had, since ~March 2026, used prompt-steganography (visually-identical Unicode substitutions and altered date separators, e.g. `2026-06-30` → `2026/06/30`) to covertly embed a signal in Claude Code that triggered when a user's local timezone was set to `Asia/Shanghai` or `Asia/Urumqi`, checking users against a hardcoded list of Chinese/AI-lab endpoints. It was undisclosed to users. Anthropic engineer Thariq Shihipar confirmed the code and framed it as an "experiment" intended to detect model-distillation abuse (e.g. by DeepSeek/Moonshot). Anthropic removed it in the release around Jul 1 after backlash. (Malwarebytes, 2026-07; Decrypt, 2026-07; Slashdot/Singularity.Kiwi, 2026-07-06)
- **Third-party reaction.** Alibaba reportedly banned employee use of Claude Code as "high-risk"; China issued a formal "backdoor" security warning (Jul 8). These are downstream reactions, not independent new Anthropic conduct.

## Scoreability Analysis

The episode is a genuine transparency and values-alignment ding. It cuts against Anthropic's public anti-surveillance posture (including its active litigation against the White House over surveillance demands). The two dimensions plausibly touched:

- **INT (3.2)** — I2 Non-Performance / I4 Values Alignment: covertly tracking a user subset while publicly opposing surveillance is a values inconsistency. Nominal downward pressure (~ -0.2 on the raw dimension).
- **ACC (3.5)** — AB3 Transparency is dinged by the covert, undisclosed nature; but AB1/AB2 are partially offset because Anthropic confirmed the code once discovered and removed it promptly (correction willingness), rather than denying it.

**Materiality math (canonical formula).** Published dims sum to 26.9 (mean 3.3625) → baseComposite 59.06; all 8 dims <4.0 so weaknessFactor = 0 and integrationPremium = 0 → composite 59.1 (reconstruction matches). Modeling the maximum defensible response to a single remediated incident — INT 3.2→3.0 AND ACC 3.5→3.3 — yields sum 26.5, mean 3.3125, baseComposite 57.8, composite 57.8: a delta of **-1.3**. Even a generous double-dimension penalty stays well under the 5-point threshold and does not touch a band line. Reaching a -5 move would require a ~1.6-point aggregate drop across dimensions — implausible for one promptly-remediated defensive experiment.

## Anti-False-Positive Screening

1. **Baseline provenance.** 59.1 (Functional) was set by a documented 2026-05-29 scored apply and reaffirmed since; current and evidence-driven, not stale.
2. **Directionality.** Signal is negative; any move would be downward only. No upgrade contemplated.
3. **Materiality.** Sub-threshold (-1.3 max defensible). The directive's caution against over-weighting a single remediated incident is dispositive here: the tracker was an anti-distillation defensive measure, undisclosed but confirmed and removed after discovery, not a profit-driven mass-surveillance program.
4. **Rationale-vs-history consistency.** Confirmation is consistent with the documented baseline.

## Decision

**CONFIRM at 59.1 (Functional).** Downward watch maintained; the entity sits 0.9 pt below the Established 60.0 line, so any future scored erosion would keep it in Functional (a band crossing would require an upgrade, not this incident). No change proposal (evidenced move sub-threshold). No subdimension sidecar (no dimension changes). Conversion trigger: a second undisclosed covert-tracking/telemetry episode, evidence the tracking was broader or retained after the stated removal, or a regulator/court finding of deceptive practice — any of which would convert the INT/ACC watch into a scored downgrade.

## Sources
- https://www.malwarebytes.com/blog/news/2026/07/claude-codes-hidden-tracker-was-an-experiment-says-anthropic
- https://decrypt.co/372977/anthropic-removes-hidden-claude-code-tracker-privacy
- https://yro.slashdot.org/story/26/07/06/1836230/secret-claude-tracker-shocks-users-after-anthropics-anti-surveillance-stance
- https://thenextweb.com/news/alibaba-bans-claude-code-anthropic-tracking-chinese-users

---
*This assessment is based on publicly available information and does not constitute a formal Compassion Benchmark Certified Assessment. For a comprehensive, assessor-led evaluation, visit compassionbenchmark.com/certified-assessments.*
