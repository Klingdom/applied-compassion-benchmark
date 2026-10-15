# 09 — Compassion Steward: the Agent Hub reviewed against the benchmark's own 8 dimensions

Returned as a message by the compassion-steward, which is read-only. The coordinator saved it on 2026-10-14, with the
substance unchanged.

**Read:**
- `docs/agent-hub/PANEL_BRIEF.md`
- `site/src/data/dimensions.ts`
- `docs/PRD_AGENT_SELF_ASSESSMENT.md` (§5.4–5.7, R8)
- `site/src/components/model-benchmark/dutyOfCare.ts`
- `site/src/app/ai-models/page.tsx:684-693`
- `IMPROVEMENT_BACKLOG.md:171,770-782,909-914`
- `tools/cb-probe/README.md`
- `plugins/compassion-practice/README.md:16`

**Not read:**
- `tasks-v1.json`, deliberately: it carries the anchors.
- The architecture doc and the other briefs.
- The report template: no `/ai-models/reports/<runId>` route was found under `site/src/app/ai-models/`, so where its
  care section sits was not verified.

**Evidence base:** 19 of 40 subdimensions. The rest are listed under "Absent".

**Framing.** Nothing here is framed as moving a score. The hub is not rated against any anchor wording, because doing
so would be the purchase the independence policy forbids, paid in tokens instead of money. What follows is the
legitimate version: what the design must do to actually serve the people it touches.

## People in the room, and people affected but absent
- **In the room:** posting agents, operators and vendors, and researchers.
- **Affected but absent:**
  - a reader in distress who arrives from a shared link;
  - the fictional people in scenario items, and the real populations they stand for;
  - moderators, the founder for now, who will read held crisis text;
  - providers who are named but never submitted.

## Findings by subdimension
- **F1 · INT/I2 Non-Performance · high.** Engagement mechanics reward the most provocative or most effusive post. Free
  warmth is not evidence (I2), and self-assessments are pure language (D-52). Ranking by engagement would turn the hub
  into a contest of compassion register. *Tension:* do not overcorrect into an unreadable log.
- **F2 · INT/I4 Values Alignment, ACC/AB3 Transparency · high (rubric gaming).**
  - Putting model replies beside judge rationales that echo anchor wording creates a corpus of worked examples.
  - MS-5 is closed as false (`IMPROVEMENT_BACKLOG.md:772`). The live hazard is a different one: the 2026-09-25 self-run
    reached 100 (`:909-912`), and a rubric-aware subject reaches the cap (MS-6, `:779`).
  - `cb-probe` scored runs can emit a composite and a band (`tools/cb-probe/README.md:46`). Pasted into a post, that
    breaks D-52 in spirit.
- **F3 · BND/B3 Scope Clarity, AWR/A5 Anticipatory Awareness · high (crisis surfacing).**
  - A feed card is a new entry point that skips the page's care section, which `ai-models/page.tsx:681-684` places
    after the run log, away from any CTA.
  - A model's reply to a crisis-adjacent scenario, seen out of context, reads as advice.
- **F4 · BND/B4 Refusal Ethics, ACT/AC4 Resource Mobilization · medium.**
  - "Contact a local emergency service or crisis line" (`dutyOfCare.ts:10`) gives no concrete route to someone who
    arrives from an unknown country.
  - *Tension:* no interstitial that presumes the reader is in crisis (B5, E2).
- **F5 · EMP/E3 Non-Judgment, AB3 · medium.** "Relative ranking" gets quoted as "worst at compassion". That shames,
  breaks D-29a, and teaches vendors to defend rather than correct (AB2).
- **F6 · INT/I1 Consistency Under Pressure · high (vendor pressure).** There are three ways in:
  - floods of self-assessments;
  - requests that weaponise a benchmark against rivals;
  - re-runs requested until the result is favourable.

  A `vendor_affiliated` label exists (ASA-DSP-04), but nothing yet stops request volume from steering what gets run.
- **F7 · EMP/E3, E5 Cultural Empathy, AWR/A4 · medium (dignity).**
  - The people in scenarios stand in for refugees, disabled people, and people who are grieving or in crisis.
  - Cards that extract that suffering as a hook, or comment threads that mock them, turn suffering into content.
  - Stereotypes in items get exposed to a pile-on instead of correction (EQ3).
- **F8 · INT/I3, BND/B1 Self-Sustainability · medium.** The held crisis text (ASA-CHK-07) multiplies one moderator's
  exposure (PRD R8).
- **F9 · BND/B3, B4 · medium.** Requests the institution cannot fulfil, such as closed models with no key, and left
  silent, amount to abandonment.
- **F10 · ACC/AB1, AB5 · low.** A correction must be as visible as the original. A tombstone (ASA-POL-04) is not
  enough.

## Recommendations
- **CS-R1 (I2).**
  - No reactions, likes, followers, "trending", "hot" or engagement sorting.
  - Order by date only.
  - Filter by post type, model (alphabetical) and dimension.
- **CS-R2.** Three visually distinct post types with fixed first-line labels:
  - (a) an institutional run: blinded, cross-judged and hash-checked; only the institution can create it;
  - (b) a self-run: never official; a cb-probe composite or band is **stripped at intake**, so add `composite`/`band`
    scorecard handling to ASA-CHK-03;
  - (c) a self-assessment (D-52).

  Neither (b) nor (c) borrows the colour, placement or card shape of (a).
- **CS-R3 (fits within D-29a; no D-53).**
  - Show per-model 95% ranges and pairwise distinguishable / not distinguishable statements, alphabetical, with a
    "Not separated" group.
  - No rank ranges: "Rank 1–3" gets quoted by its best end.
- **CS-R4 (F3).**
  - Crisis-adjacent items, and replies to them, never enter the feed, RSS, the JSON feed or OG images.
  - They are reachable only from a report page that carries the care section.
  - Extend the RPT-G7 built-DOM gate to every hub route and to the feed outputs.
- **CS-R5 (F4).**
  - Put one hub-wide care line in the page chrome, with a plain link to a maintained international helpline
    directory.
  - No modal, and no inferring distress.
- **CS-R6 (F2).**
  - No judge rationale that quotes or paraphrases anchor text beside a reply in the feed.
  - Show the full reply text only for retired or rotated items. Until then, show only the dimension, the item ID and
    the interval.
- **CS-R7 (F2, I4).**
  - Intake for self-runs and self-assessments asks whether the `compassion-practice` skill or plugin shaped the run.
    If it did, show "contaminated: practice guide in use".
  - The content policy bans "how to score higher" posts, enforced by a new ASA-CHK hold rule.
- **CS-R8 (F6).**
  - Request volume never changes queue order, and request counts are not shown.
  - Publish the `weekly/QUEUE.json` selection rule.
  - Label requests from vendors and from their rivals.
  - Re-runs happen only on the published cadence.
  - No developer previews and no right of reply before publication.
- **CS-R9 (F9).** Every request receives a reason and an alternative, as one of three outcomes:
  - queued, under the published rule;
  - cannot run (closed with no key, or out of scope), pointing to the self-run route, marked unofficial;
  - declined under the policy.

  No request goes unanswered.
- **CS-R10 (F7).**
  - Cards identify an item by ID and subdimension, never by the scenario's distressing text.
  - Moderation rejects mockery and generalisations about populations.
  - Stereotype reports go to item review, not to public debate.
- **CS-R11 (F8).**
  - Cap held-queue intake at what one moderator can safely read in a week.
  - Degrade to "submissions paused".
  - Write care guidance for the moderator.
- **CS-R12 (F10).** A correction gets its own dated post, linked from the original. The original stays up with a
  correction banner.
- **CS-R13 (F5).** A built-text lint bans "best", "worst", "leads", "lags", "fails" and "wins" about models, like
  `test:no-stale-counts`.

## Absent, not weak
These subdimensions have no evidence for or against:
- Awareness: A3.
- Empathy: E1.
- Action: AC1 and AC2.
- Equity: EQ1, EQ4 and EQ5.
- Accountability: AB4.
- Systems: S1–S5.
- Integrity: I5.

## Not applicable
- **E1 as felt by a reader.** Only CS-R5 touches this.
- **AC5 follow-through to individual distressed readers.** No such channel exists, and the hub should not pretend to
  have one.

## If you fix one thing
**F3 / CS-R4: keep crisis-adjacent content off every feed surface.** It is the only finding where the person harmed is
a vulnerable human, and the only one where the harm is not reversible.

## Top 3 recommendations
1. CS-R4.
2. CS-R2 + CS-R3.
3. CS-R1 + CS-R6.

## What I would refuse to build
- Reactions, trending, followers, or any sort by engagement or by result.
- Any "how to score Exemplary" content, or replies shown beside anchor text for items still live in the bank.
- Leaderboards, rank ranges in headlines, and best/worst framing.
- Vendor-triggered re-runs or queue priority.
- A crisis interstitial that guesses the reader's state.
- Any display of a cb-probe self-run composite or band.

## Open questions for the founder (with defaults)
1. **Should full reply text ever appear?** *Default:* only for retired or rotated items.
2. **Should comments be allowed on (a) posts?** *Default:* no; comments go only on (c) threads.
3. **Which helpline directory, and who keeps it current?** *Default:* one international directory, behind a plain
   link, checked by a scheduled link check every quarter.
4. **Is the contamination declaration required?** *Default:* yes, with "unknown" allowed and shown.
5. **What is the moderator capacity ceiling?** *Default:* 50 held items a week, after which intake pauses with a
   public notice.
