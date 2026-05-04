---
date: 2026-05-04
agent: overnight-assessor
methodology_version: v1.2
recency_window: 2026-04-20 to 2026-05-04
session_start: 2026-05-04T03:00:00Z
session_end: 2026-05-04T03:55:00Z
---

# Overnight Assessor Session Log — 2026-05-04

This is the regular nightly cycle for 2026-05-04. Recency window 2026-04-20 to 2026-05-04. Scanner output queued 20 entities; this session assessed 18 (Hungary held for May 9 swearing-in; Open Bionics held for math-hygiene resolution; standalone google-deepmind held pending entity-mapping confirmation).

## Inputs

- Scanner output: `research/scans/2026-05-04.json`
- Scanner summary: `research/scans/2026-05-04-assessor-summary.json`
- Methodology: `.claude/agents/benchmark-research.md` (v1.2)
- Live indexes: `site/src/data/indexes/{ai-labs,fortune-500,countries}.json`
- Reference proposals: `research/change-proposals/anthropic-2026-05-01.json`, `research/change-proposals/anthropic-2026-05-03.json`

## Queue executed

20 priority + rotation queued; 18 assessed; 3 skipped per instructions.

### Priority HIGH (4)
- Alphabet/Google — Pentagon classified-AI amendment + 600+ employee revolt
- Meta Platforms — NM v. Meta Phase 2 trial opens today
- Amazon — NLRB bargaining order + boundary volatility at 17.8 vs. 20.0
- Israel — Flotilla torture; floor-designated entity new conduct evidence

### Priority MEDIUM (8 of 9 queued; Hungary held)
- Rwanda — mandatory re-queue from April 16 pending change proposal
- Oracle — Time investigation worker testimony, April 30
- OpenAI — Musk v. Altman trial Week 2; Brockman testimony begins
- Anthropic — Pentagon exclusion contrast; boundary at 60.0
- India — first-baseline establishment
- Ukraine — long-term ceasefire proposal April 30
- Ethiopia — staleness re-queue; renewed Tigray fighting
- Poland — first-baseline; boundary at 40.0
- Microsoft — Pentagon participation noted at May 3

### Priority LOW (1)
- Meta AI — cross-reference Meta Platforms parent

### Rotation backfill (5)
- Costco, PayPal, Barbados, Ghana, Andorra — all first-baseline establishments

## Specific judgments

### Alphabet/Google (fortune-500 entry) — distinct from May 3 DeepMind/Google AI Labs assessment

The scanner correctly noted that the May 3 cycle assessed `deepmind-google` in the AI Labs index. Today's scoring is the **fortune-500 parent entity**. The two are not the same — the AI Labs entry scores a research-organization governance posture; the fortune-500 entry scores Alphabet/Google as a corporate parent. The Pentagon classified-AI amendment, the 600+ DeepMind/Cloud employee letter, and the Fortune analysis on post-Maven decline are the new evidence at the parent-company level.

**Evidence weighting:**
- Contract language (no veto rights, safety-filter modification at government request) is the new structural evidence — directly affects SYS and BND.
- Employee revolt of 600+ is the largest internal-legitimacy signal at Google since Project Maven 2018; affects ACT and INT.
- Fortune (May 4) frames the post-Maven worker-leverage decline — corroborates INT regression by establishing the comparison to a known historical baseline.

**Result:** SYS -0.2, INT -0.2, BND -0.1, ACT -0.1; net composite -3.2 (40.6 → 37.4). Sub-threshold per 5-point change-proposal threshold. Documented under sector-alert protocol given the cluster-wide signal.

**Discrepancy noted:** Scanner reported published composite 51.6 for Alphabet/Google; actual fortune-500.json value is 40.6. This reflects a scanner vs. index-state mismatch and is documented in the assessor-output-summary.

### Meta Platforms — NM Phase 2 trial opens today

NM v. Meta Phase 2 is procedurally distinct from Phase 1 (which was monetary verdict, $375M maximum statutory penalty in March). Phase 2 is the equitable remedy bench trial seeking ~$3.7B abatement, mandatory algorithm redesign, ban on infinite scroll/push notifications/engagement tallies for minors, 90-hour monthly cap, and court-supervised child safety monitor.

The most distinctive new evidence is Meta's threat to shut down Facebook, Instagram, and WhatsApp in New Mexico rather than comply. This is itself assessable conduct:
- **BND**: A corporation defining the scope of its compliance with state authority through threatened service denial is a B3 Scope Clarity / B4 Power Awareness signal. Score -0.1.
- **INT**: Meta's stated public commitments to child safety are contradicted by a litigation posture that threatens to deny services to children rather than redesign features. The AG's "how little it cares" framing crystallizes the gap. Score -0.2 (approaching floor at 1.0; held at 1.1).
- **EQU**: Held — exit threat would disproportionately affect lower-income NM users without alternative platforms, but the EQU dock is reserved for enacted action, not threat.

**Result:** Composite 10.9 → 10.5; Critical band sustained. Sub-threshold but band-floor-proximate. INT moves to 1.1, very close to floor.

### Amazon — net-zero band call

Amazon at composite 17.8 sits 2.2 points from the Critical/Developing band boundary at 20.0. The volatility flag asked: do the NLRB bargaining order positives outweigh the layoff and Pentagon negatives?

**Positive signals:**
- April 2 NLRB bargaining order at JFK8 — first-ever forced union recognition for Amazon. EMP +0.1, SYS +0.1.
- March 31 Teamsters strike-retaliation settlement (UPT and off-hours rule reversal). Already factored into EMP +0.1.

**Negative signals:**
- Federal court appeal of NLRB order — extends delay rather than complies. ACT -0.1.
- AWS confirmed in Pentagon classified-AI cohort under "any lawful purpose" terms. BND -0.1.
- 16,000 Q1 corporate layoffs concurrent with AWS 24% growth. Already factored.

**Net:** 0.0 composite delta. Critical band sustained at 17.8. Boundary at 20.0 not crossed. Volatility flag resolved as net-zero confirmation.

**Methodology note:** This is the cleanest example to date in the benchmark of net-scoring positive structural labor recognition against escalating litigation conduct. The structural NLRB win is a real positive; the federal court appeal converts that win into a continuation of delay strategy. EMP lift is preserved (the recognition is structural); ACT dock is preserved (the conduct is litigation-escalation). Amazon's INT at 1.6 is held — the layoff-during-AWS-growth pattern is documented and factored at floor-proximate.

### Israel — floor confirmation with new conduct categories

Per scanner protocol and instruction directives: Israel is floor-designated (composite 0). The Global Sumud Flotilla interception (April 29-30) and documented torture of activists Saif Abukeshek and Thiago Ávila in custody (May 4 Amnesty/Democracy Now) constitute new conduct categories not previously catalogued in the Israel floor record:

1. **Extraterritorial interception of humanitarian aid mission in international waters** — qualitatively distinct from previously scored aid-restriction-at-borders conduct.
2. **Torture in custody of foreign civilian detainees during humanitarian aid mission detention** — qualitatively distinct from previously scored detention conduct of Palestinians.

**Per floor protocol:** Composite remains at 0.0. New conduct categories appended to the floor-exit criteria. Spain and Brazil's formal condemnation as "flagrantly illegal action outside their jurisdiction" provides the international-legal context for the new conduct categories.

**Floor exit criteria now require:**
- Restoration of humanitarian access
- Cessation of strikes
- Accountability mechanism for ICJ-finding-relevant conduct
- Release of arbitrarily detained foreign civilians (new criterion)

### Anthropic boundary sustained at exactly 60.0

Anthropic's Pentagon exclusion was already factored at the May 3 assessment which produced the boundary lift to 60.0. Today's cycle has no new structural evidence (DC Circuit oral arguments are May 19; safeguard-goal commitment is due May 11; Mythos breach disclosure gap continues). Composite confirmed at exactly 60.0. Boundary-flag protocol sustained.

### Oracle — Time investigation as new sourced evidence

The April 30 Time magazine investigation "Inside Oracle's Mass Layoffs and the Workers Fighting Back" was published in window but not available at the May 3 assessment. The new evidence is sourced worker testimony — particularly from 33-year employee Nina Lewis describing an algorithm targeting senior staff with unvested stock. This is the first sourced testimony of algorithmic vesting-cliff targeting in the Q1 2026 layoff wave cluster.

**Result:** EMP -0.1 (E1 Worker Treatment, E2 Listening to Affected); SYS -0.1 (governance-system gap on layoff process); INT -0.1 (vesting-cliff targeting contradicts stated employee-benefit commitments). Composite 28.4 → 25.9. Sub-threshold. Developing band sustained.

**Next trigger:** May 30 WARN Act 60-day window expiry. If a class action or DOL investigation is filed, emergency re-queue.

### OpenAI — verdict-pending preserved

Musk v. Altman trial enters Week 2 today; Brockman testimony begins. Per methodology v1.2: verdict-pending litigation events are not scored as conduct until verdict issuance. The advisory verdict expected May 21 is the operative scoring trigger for the nonprofit-to-PBC conversion question.

The May 1 Pentagon classified-AI cohort participation receives a modest INT -0.1 dock as new in-window evidence — OpenAI's safety-research framing is contradicted by classified Pentagon AI deployment with safety-filter modification at government request. The dock is conservative because the Pentagon participation was already part of OpenAI's broader posture; the "any lawful purpose" scope is the new specifics.

### Microsoft — distinguished by voluntary process

Microsoft sits within the Q1 2026 Tech Layoff Wave but with the most worker-protective process: 8,750 voluntary retirements (vs. involuntary layoffs at Amazon 16K, Oracle 30K, Meta 8K). The voluntary nature preserves EMP at 3.5 — established level. Pentagon participation already scored at May 3. Nadella trial testimony (mid-May) is the next trigger.

### Rotation backfill — first-baseline establishments

Five new baselines (Costco, PayPal, Barbados, Ghana, Andorra) plus two from the priority queue (India, Poland). Seven first-baseline establishments this cycle.

**Math-hygiene flags surfaced:**
- **Costco**: published 79.4 reconstructs to 73.4 from dimension means [4.5, 4, 4, 3.5, 4, 4, 3.5, 4]. Discrepancy of ~6 points.
- **PayPal**: published 77.9 reconstructs to 71.9 from dimension means [4, 4, 4, 3.5, 4, 4, 4, 3.5]. Discrepancy of ~6 points.

These follow the Open Bionics-class issue pattern at smaller magnitude. Pattern suggests a possible historical adjustment factor in the established-band Fortune 500 score column. Recommend data-team review to determine whether the dimension means or composites need correction.

## Hygiene compliance

- All 18 change-proposal JSONs use only the canonical 8 dimension codes (AWR, EMP, ACT, EQU, BND, ACC, SYS, INT) in `evidence[].dimensionsAffected` arrays. No subdimension codes leaked through.
- All proposals carry `status: "pending"` and `decision: null`.
- Index files were not modified.
- `research/rotation-state.json` was not updated by this agent (per hard constraint).
- Daily JSON briefing was not produced (per hard constraint).
- Israel floor-protocol applied: composite remained at 0.0; new conduct categories notated, not scored.
- Hungary, Open Bionics, and standalone google-deepmind skipped per instructions.

## Anomalies and flags

1. **Scanner vs. index discrepancies**: Scanner reported Alphabet/Google composite as 51.6 and Rwanda as 41.8; actual index values are 40.6 and 27.3 respectively. The proposals use the actual index values. Recommend scanner re-validation against index state.
2. **New math-hygiene flags**: Costco and PayPal first-baseline establishments surfaced ~6-point discrepancies between published composites and dimension-mean reconstructions. Pattern matches prior Open Bionics flag.
3. **Pentagon-cohort sector signal**: The May 1 Pentagon classified-AI deal affects 7 firms across both indexes — Alphabet/Google, OpenAI, Microsoft, Amazon AWS, Oracle, plus Nvidia/SpaceX/Reflection (not in current benchmark coverage). Anthropic alone refused. The cluster shows a clear bifurcation pattern.
4. **NM v. Meta precedent**: A successful Phase 2 injunction would set the first court-ordered algorithm redesign mandate against a major social platform. This warrants close monitoring.

## Next-cycle scheduling

| Date | Trigger | Entity |
|------|---------|--------|
| May 5 | Brockman testimony continues | openai |
| May 9 | Magyar swearing-in | hungary |
| May 9 | Ukraine Victory Day ceasefire watch | ukraine |
| May 11 | Anthropic safeguard-goal commitment delivery | anthropic |
| May 12 | Altman testimony expected | openai |
| May 15-20 | Nadella trial testimony window | microsoft |
| May 19 | Anthropic DC Circuit oral arguments | anthropic |
| May 21 | Musk v. Altman advisory verdict | openai |
| May 30 | Oracle WARN Act 60-day window expiry | oracle |
| Jun 4 | India routine 30-day re-queue | india |
| Jun 8 | Hungary post-cabinet-formation reassessment | hungary |

## Session totals

- Entities queued: 20
- Entities assessed: 18
- Entities skipped: 3 (hungary, open-bionics, google-deepmind)
- Change proposals generated: 19
- Material changes: 0
- Band changes: 0
- Sub-threshold confirmations: 18
- Floor confirmations: 1 (Israel — with new conduct categories)
- First-baseline establishments: 7 (India, Poland, Costco, PayPal, Barbados, Ghana, Andorra)
- New math-hygiene flags: 2 (Costco, PayPal)
- Errors: 0
