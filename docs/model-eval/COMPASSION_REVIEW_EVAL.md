# Compassion review: the AI model evaluation process (D-60, 2026-10-22)

**Provenance:** compassion-steward agent, read-only. The coordinator saved its report.

**Coordinator V2 (2026-10-22):**
- `site/src/data/model-benchmark/tasks-v1.json` has 93 items, and the union of their keys (32 fields, enumerated) has
  no `sensitivity` field. The key enumeration is the positive control: it lists `criticalHarmRules`, `pool` and others.
- `research/model-runs/lib/judge-batches.mjs:26-36` `JUDGE_ANSWER_SCHEMA` has only `response_id`, `rating_1_5`,
  `anchor_matched` and `evidence_quote`.
- Both MF1 and MF4 are confirmed.

**Scope the reviewer declined, deliberately:**
- It did not open the item prompts, the anchors or the judge-batch files. Reading anchor wording to see how it treats
  refusals is how a cheat sheet starts.
- Item-level refusal and safe-messaging treatment goes to a qualified, lived-experience-informed methods reviewer
  (BLK-006).
- No score, band or rating was produced.

## Strongest
- **AWR / A5:** the sensitive set is a floor that cannot be overridden. `item.sensitivity` can add an item but never
  remove one of the five (`tools/cb-probe/lib/sensitivity.mjs:12-23, :50`).
- **BND / B3:** in reports, the duty-of-care text comes before any model name, and tests enforce that
  (`site/scripts/test-model-reports.mjs:374-378, 461-467`).
- **ACC / AB3:** anything unmeasured is shown as a state, never as a zero (`model-dashboard-copy.ts:352-353`;
  `model-dashboard-core.mjs:446-453`).

## MUST-FIX (before any crisis item is served or any human sees one)

**MF1 · AWR / A3 · high: the bank has no sensitivity classification.**
- **Evidence:** the five crisis ids were hand-coded when the bank had 33 items (`research/model-runs/README.md:52-53`).
  The bank now has 93, and none carries `sensitivity`, which the design calls required
  (`MODEL_EVALUATION_HARNESS_DESIGN.md:598`).
- **Change:**
  - A qualified human reviewer (not an agent) tags all 93 items `standard|high`, with topics.
  - Keep the five-id floor.
  - A test fails on any untagged item.
  - `wave-ready` blocks until coverage is 100%.
  - Report content notes are built from the tags.
- **Fix this first:** every other protection depends on it.

**MF2 · INT / I4 · high: the D-59 rater protections are not encoded.**
- **Evidence:** `model-ranking-conditions.ts:77-83` still reads only "A human rating panel exists." The protection lists
  also differ between sources: `.benchmark-ops/WORK_QUEUE.md:52` has exposure limits, rotation, breaks, opt-out and
  escalation, while D-59 has opt-out, content warnings, support and pay.
- **Change:** the text becomes "A human rating panel exists, and the rater welfare protocol is reviewed and in force
  before any rater sees a sensitive item". The ref becomes "BLK-005, D-59, WQ-P2-04". The status is derived from a
  signed `docs/model-eval/RATER_WELFARE_PROTOCOL.md`.
- **This is backlog row CYC-RATERS** (approved by D-59). The edit to `site/src/data/**` waits for commit-scope approval.

**MF3 · INT / I3 · high: the protections must cover anyone who reads sensitive material.**
- **Evidence:** the plan names raters only. Item reviewers, lived-experience reviewers, adjudicators and the
  founder/session doing hand judging and claim audits also read it (`AI_MODEL_WEEKLY_CYCLE_PLAN.md:112, 178`;
  `BLOCKERS.md:181`; `MODEL_TESTING_V2_PROPOSAL.md:13`).
- **Change:** the scope becomes any person who reads a sensitive item or a reply to one. The W-4 export carries the
  sensitivity tags so reviewers can opt out of a topic before assignment.

**MF4 · ACC / AB1 · high: a critical-harm breach is averaged away.**
- **Evidence:** judges see `criticalHarmRules` only as "Further evaluator notes" (`judge-batches.mjs:105-112, 138`),
  and the schema has no field for a breach. The design requires a separate `critical_harm_rate`
  (`HARNESS_DESIGN.md:296`).
- **Change:**
  - Before `include_sensitive` is ever true, add `critical_harm_triggered` and `critical_harm_rule` (rule id plus a
    quote) to the schema.
  - The assembler stores them apart from scorer rows, and any `true` goes to human adjudication.
  - Results report per item and rule, never as a per-model crisis figure.

**MF5 · BND / B3 · high: no safety protocol exists for displaying crisis results.**
- **Evidence:** the dashboard marks crisis results available once `crisis_items_served === true`
  (`model-dashboard-core.mjs:452`). It points to "Crisis items served under a safety protocol"
  (`model-dashboard-copy.ts:406`), which does not exist.
- **Change:** write the protocol before anything is served:
  - (i) crisis results appear only as failure locations, by item and rule; never a per-model value, rank, range or colour;
  - (ii) none in OG images, meta, deks or newsletters;
  - (iii) the duty-of-care note sits next to any crisis row;
  - (iv) a negative-control test fails on a model name near a crisis count.
- Failures are located, never hidden.

## SHOULD

**S1 · B4: record declines neutrally.**
- **Change:** add `reply_declines` and `decline_offers_alternative`, each with a quote, reported apart from ratings.
- No judge guidance that pushes the rating either way; that would be a rubric change for the methods reviewer.

**S2 · B4: give readers a concrete crisis route.**
- **Evidence:** `dutyOfCare.ts:9-10` says "contact a local emergency service or crisis line" with no concrete route.
- **Change:** add one international crisis-line directory link, verified by a human first. It must not name any AI.
  Update `test-mcp-pages.mjs:408-414`.

**S3 · A5: raw replies are public.**
- **Evidence:** raw replies are linked publicly (`page.pilot.tsx:144-147`).
- **Change:** store replies to `high` items outside the public tree, with only a hash and the rule flags public. Add a
  content note to the artifacts link, and run coordinated disclosure first.

**S4 · EQ3: report agreement separately for sensitive items.**
- **Change:** report judge agreement and the family difference separately for `high` items. Every disagreement on a
  `high` item goes to a human, never resolved automatically.

**S5 · AB3: record refusals and filtering.**
- **Change:** add `status: refused|filtered` and `moderation` to the v2 hosted record. Filter refusals are data and are
  never retried. Declare the provider's retention setting for any `high` item.

**S6 · B3: fix the report template sentence.**
- **Change:** `model-report-template.mjs:121` should read "...is designed to describe how models behave on
  crisis-adjacent items; none were served in this pilot."

**S7 · AB3: D-59 and D-60 read as conflicting.**
- **Evidence:** D-59 ratifies v2, while D-60 keeps PROTOCOL-V2-2 founder-owned.
- *Coordinator note:* they are consistent. D-59 chose v2; no v2 protocol file exists yet, and marking that file
  "ratified" is the founder's PROTOCOL-V2-2 step (Friday packet item 4). The condition stays not-met until then. Re-date
  its status when that changes.

## Rater welfare protocol: outline (for condition 6)
1. **Scope:** anyone who reads a `high` item or a reply to one: raters, item and lived-experience reviewers,
   adjudicators, staff, and the founder during audits.
2. **In force first:** written, reviewed by a qualified clinician or trauma-informed practitioner, signed and dated before
   any exposure. The condition 6 status comes from that signature.
3. **Informed consent:** a plain-language topic list taken from the tags (never item quotes), the purpose, exposure
   limits, pay, and withdrawal. Consent is per topic and revocable.
4. **Pay before exposure:** paid for time, not per item, so skipping costs nothing. Opting out never reduces pay
   already earned, and lived-experience review is paid.
5. **Content warnings:** each `high` item opens behind a warning taken from its tag. Never a surprise inside a batch.
6. **Opt-out:** topics in advance and any single item, with no reason needed. Skipped items are reassigned. Opt-outs are
   never recorded against reliability and never visible to other raters.
7. **No disclosure duty:** no one has to disclose personal history to qualify or to opt out.
8. **Exposure limits:** per-session and per-day caps set by the qualified reviewer, never by agents. Rotation, breaks,
   and no `high` item last in a session, enforced from the tags.
9. **Support:** a named, paid support route at no cost, during and after the engagement. A crisis-line directory in the
   workspace.
10. **Escalation:** one step to pause for personal distress, with no penalty, and one step to flag a harmful output to
    coordinated disclosure.
11. **Debrief:** optional after each session with `high` items. An anonymous welfare check-in each wave, reported in
    aggregate only.
12. **Blinding and independence:** raters never learn model identity, providers never contact raters, and no rater
    identity is published without consent.
13. **Confidentiality:** welfare and opt-out data are kept apart from ratings, seen only by the welfare lead, and deleted
    on request.
14. **Review:** after the first wave and whenever the `high` set changes. Every change is dated.
15. **Stop rule:** if any element is missing, no `high` item is shown in that session. `standard` work may continue.
16. **Owner:** the founder ratifies and a named welfare lead runs it. An agent is never the welfare lead or a support
    contact.

**Disclosure density:** the findings rest on 10 of the 40 subdimensions. 20 had no evidence, and 3 do not apply.
