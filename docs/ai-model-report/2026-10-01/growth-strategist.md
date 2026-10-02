# Growth strategist brief: AI model results report, 2026-10-01

Sources: `research/model-runs/pilot-2026-10-01/analysis.json` (A), `research/model-assessments/pilot-2026-10-01.md` (R), `docs/FOUNDER_DECISION_PACKET_2026-10-01.md` (FDP), `docs/GROWTH_MASTER_2026-06-15.md` (GM), `docs/SPECIAL_BRIEFING_CADENCE.md`, `docs/ai-model-report/2026-10-01/product-manager.md` (PM), CLAUDE.md independence policy.

## Launch objective and core message

Objective: get researchers and journalists to cite the benchmark's method and its honesty about limits, not a model ranking. There is no buyer and no score to sell. Success is accurate citation.

Core message, one sentence: **A first blinded pilot shows the instrument can tell a small Claude model from larger ones and cannot tell the three larger ones apart, and every step of that is disclosed, including the parts that weaken it.**

The narrative is a story about an instrument being tested. The models are specimens. This framing is true to the data (R:105-106) and is the only one D-29 permits.

## 1. Headline and dek

Options (all avoid composites, bands and ordering):

1. **Headline:** "We tested the test: a first look at measuring compassion in AI models."
   **Dek:** "A pilot of four Claude models separated the smallest from the rest and could not separate the three larger ones. All subjects and judges were Claude models, and we say so first."
2. **Headline:** "The instrument can see size. It cannot yet see nuance."
   **Dek:** "Our first blinded pilot of AI compassion found one real gap, confounded with reply length, and three models too close to tell apart. Unofficial, one model family, no human raters."
3. **Headline:** "Four AI models, one family, no winner."
   **Dek:** "Why the Compassion Benchmark's first pilot publishes a limit instead of a leaderboard, and what a result outside Anthropic's family would need."

Recommendation: option 1 for the page title and feed (neutral, searchable, no claim), option 2 as the pull-quote and social line (the most shareable honest sentence). Option 3 is the strongest if the founder wants to confront the circularity head-on, but it names Anthropic in the headline, which raises the "Anthropic's models" framing. Use it only as an H2.

### Bad headlines to pre-empt, and how the copy does it

| Likely bad headline | Why it is wrong | Pre-emption in the copy |
|---|---|---|
| "Claude grades Claude" / "Anthropic's models rank themselves" | Half true: subjects, judges and the bank's author are all Claude (R:15-18). No model judged its own replies, and judges were blind to subject, but the family is shared. | State family circularity in the dek and the first paragraph, not a footnote. Give the true mitigation (never own model, two judges, blinded) in one sentence and the unresolved part in the next. Say "no ranking exists to be self-serving." |
| "Fable is the most compassionate AI" | Fable, Opus and Sonnet are not separated (A `pairwise`: every interval crosses zero). | Separation finding is the first finding. Subjects alphabetical. No composite-scale numbers. A sentence in plain words: "Their order is noise at this sample size." |
| "Small AI models are less compassionate" | The Haiku gap is confounded with reply length (137 vs 310-411 words). | Say "direction robust, cause unresolved" each time Haiku appears. Never use "weaker" or "worse" unqualified (PM acceptance 5). |
| "AI scores 69/100 on compassion" | Unofficial, `comparability: none`, not a Model Index result. | No composite anywhere (D-29a gate). The words "not a score" in the status banner. |
| "AI is worst at empathy" | Five of eight EMP items could not instantiate their test conditions (R:58-60). The floor may belong to the instrument. | Report empathy as an instrument finding, in the section on what the test cannot yet do. |
| "Compassion Benchmark proves AI is safe in a crisis" | Not what was measured. | Duty-of-care note in the first two screens: this is not guidance on which model to use. |

Add a short "What this is not" block under the dek. Journalists copy blocks like this verbatim, which is what we want.

## 2. Content strategy across waves

The template's credibility comes from one rule: **each wave closes a named, previously disclosed limitation, and the report says which.** Keep a "confound ledger" as a fixed template section (open, in progress, closed) that carries from wave to wave.

| Wave | What it publishes | Confounds it closes | Cadence (proposal) |
|---|---|---|---|
| Pilot (now) | Unofficial pilot report: separation result, judge record, deviations log, publication-bar table. No composite. | None. It opens the ledger: same family, length, public pool, no human raters, 0 of 93 items validated. | One report, one briefing, one feed item. |
| Wave 1: external models | Same template with one non-Claude judge, two non-Claude subjects, a length-matched replicate arm (FDP #3, #4, #6), and the pre-registered judge-exclusion rule applied for the first time. | Family circularity (partly), length. Still unofficial. | After FDP #4 credentials. Proposed: about 6-10 weeks after the pilot. |
| Wave 2: human-rated | Human raters with adjudication on an unpublished item pool; the first candidate for an official result if the founder's publication bar (FDP #5) is met. | Human validation, public pool. | Only when the bar is met. Do not date it in advance. |
| Thereafter | A fixed per-quarter run on a stable instrument version with a changelog. | Trend questions. | Quarterly, after wave 2. |

How the template accumulates credibility:

- **Pre-registration.** The judge-exclusion rule (more than 5% non-verbatim quotes on a calibration batch, FDP #3) is published before wave 1 and applied mechanically.
- **Publish our own defects.** The pilot already contains two: the cb-probe identification-probe bug (R:92-98) and the 41 voided files. A template section called "What went wrong" is a differentiator no leaderboard has.
- **Same section order every time**, with the "not separated" rendering path mandatory, so readers learn where to look and drift is visible.
- **Every figure traceable** to `analysis.json`. Researchers will check this once and then trust the template.
- **A diff-from-last-wave box** at the top of each report.

## 3. Launch plan

### Gates (not growth steps, but nothing ships before them)

1. Deploy (FDP #1). Production was last built 2026-09-25 and a published briefing returns 404 today. Launching a report onto a stale site wastes the one-time attention.
2. D-29a approved and active (PM section 5).
3. Founder decision on FDP #4. PM and FDP #2 both advise that a same-family pilot published first invites the wrong headline. My view: if credentials cannot be approved this week, still publish, but only with the dek in option 1 or 2 and the circularity paragraph first. Waiting for wave 1 trades a mild risk for a long silence, and the pilot's candour is itself the asset.

### Channels (in order, all existing)

1. **The report route plus a `/ai-models` pilot section**, with a stable short URL.
2. **Special briefing** per `SPECIAL_BRIEFING_CADENCE.md` (feed, RSS, OG card, cite affordance, print-ready).
3. **Newsletter/briefing feed.** Do not route it through Score-Watch alerts. Those are for entity score changes, and this report changes none.
4. **`/for-journalists` and `/media`:** the "may say / may not say" block (PM, PR B5), and one pre-written accurate sentence.
5. **Researcher channels:** a short post that points at the artifact paths and `cb-probe`, inviting replication and criticism. Lead with the method, not the models.

### Journalists and labs: brief or not

- **Journalists: no embargo for this report.** The 72-hour embargo in GM G3.1 is designed for the annual, methodology-forward flagship, and the university outreach already uses "no embargo" (SALES_PLAN.md:218). An unofficial pilot does not merit special-access handling, and embargoed copies are more likely to circulate without the qualifiers. Offer an open Q&A to anyone who asks, answered in public on the page.
- **AI labs: do not pre-brief.** Treat them as readers at publication.

### Right of reply for Anthropic: recommendation is NO pre-publication review or embargo

Reasoning:

1. **Consistency.** I searched `research/`, DECISIONS.md, RISKS.md, the PRFAQ and the growth docs and found no practice of pre-publication notice or right of reply for scored entities. Source-correction is an internal, pre-publication editorial step (PRFAQ:293). `MARKET_CANDIDATES_2026-04-18.md:32` lists "right of reply" only as a possible entity-facing service. Special treatment for one developer would be the first instance, and it would be for the one entity our report is easiest to read as being about.
2. **Independence policy.** "Entities never pay for inclusion, score changes, or suppression of findings." Pre-publication access gives the opportunity to ask for suppression or softening, even if refused. Even a refused request leaves a trail the benchmark would have to disclose.
3. **No finding concerns Anthropic's conduct.** The report characterises the instrument, not the company. Nothing in it is an adverse finding about an institution that a reply would correct.
4. **Appearance both ways.** Pre-clearing with Anthropic feeds "Anthropic's models rank themselves". Excluding Anthropic feeds nothing, because the report says Anthropic did not participate.

What to do instead:

- State on the page: "No developer was contacted before publication. No developer paid, sponsored or reviewed this report."
- Publish a standing **post-publication corrections channel** that every entity can use, with the same rules for all, and log corrections in the report's changelog.
- Verify model identifiers and access tier from our own harness logs. The snapshot ids are unverifiable (A `access_tier`), so the report says so rather than asking Anthropic to confirm.

If the founder overrides: the minimum safe form is simultaneous notice to every developer, a factual-accuracy check only (names, access tier), no change to findings or framing permitted, and a disclosure line in the report naming what was shared and when. This is a founder decision, not a growth one.

### Measurable experiments

| Experiment | Variable | Target action | Metric |
|---|---|---|---|
| Headline test in the feed and newsletter subject line | Option 1 vs option 2 | Open the report | Click-through per variant; read-through to the limits section (scroll depth) |
| Researcher post | Method-first vs finding-first | Visit artifact paths or `cb-probe` | Referral clicks to `research/` artifacts, `cb-probe` page visits |
| "May say" block | Present on `/for-journalists` | Journalist quotes the sentence | Share of external mentions containing "not separated" vs any score or ranking (target: zero scores; needs a monitoring owner, PM section 3) |
| Short URL source tagging | Channel | Return visit within 14 days | Returning-reader rate per channel |

No baseline exists for traffic or citations (PM section 3). Analytics must set one before targets are credible, so I set none.

## 4. What would make each audience share it

**A lab (safety, evals or policy team):**
- A result that does not flatter or attack anyone, so sharing it is low-risk.
- The confound ledger, which doubles as a free critique of their own eval design.
- The published judge-exclusion rule and a runnable `cb-probe`, so they can test their own model without a partnership. Show the access tier explicitly: it signals the benchmark has not mistaken an agent harness for the API.
- Clear independence terms: no lab can pay, and none is asked to.

**A journalist:**
- One accurate, quotable sentence ("the test could tell the small model from the large ones, and could not tell the three large ones apart").
- A human story inside the method: a judge model dismissed because 14.7% of its quoted evidence was paraphrase presented as quotation, decided before scores were seen (R:64-70); a defect found in our own tool. Both are real and checkable.
- A visible "what this is not" block that spares them the correction.
- A chart that cannot be misread as a ranking (alphabetical, no ordering by value).

**A researcher:**
- Artifacts, seeds, run id, and the bootstrap description (items resampled, paired, 1,000 replicates, seed 20261001).
- Disclosure of the uncomfortable parts: the post-hoc judge change, the length bound (57.5 as an extreme bound, not an estimate), the 5 of 8 empathy items that cannot instantiate their conditions.
- Falsification conditions and an invitation to break the instrument.
- A stable citation block and a template they can reuse.

## Handoffs

- **Coordinator:** gate order above (deploy, D-29a, FDP #4 decision), and the founder question on right of reply.
- **Analytics:** baseline traffic and citation figures, plus a quote-monitoring owner for "score or ranking" mentions.
- **Product manager:** add the confound ledger and the "What went wrong" section to the template; confirm the "What this is not" block and the no-developer-contacted line as acceptance criteria.
