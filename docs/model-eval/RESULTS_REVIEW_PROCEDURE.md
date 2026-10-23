# Results review procedure (AI model evaluation, v2)

**Status:** PROPOSED under D-60 (Stream D, 2026-10-22). Takes effect with the first v2 wave, under PROTOCOL-V2-2. Internal: this procedure publishes nothing and writes no score (D-29a; PRD FDM-1).
**Used by:** the reviewer (§1), after the drafter has finished the wave (`RUNBOOK_V2.md` §8) and before the Friday ask (`RUNBOOK_V2.md` §11).
**Sources cited:** `DECISIONS.md` D-29 and D-29a (lines 794-815 and 817 onward); `docs/model-eval/UX_FLOWS_EVAL.md` §3c and §3d; `docs/model-eval/PRD_MODEL_EVALUATION.md` FDM-1 (line 181) and FDM-5 (line 185); `docs/model-eval/COMPASSION_REVIEW_EVAL.md` MF1, MF3, MF4, MF5, S3, S4; `site/src/data/model-benchmark/item-reviews-v1.json` lines 13-15.

## 0. Principles

1. **Results are unofficial pilots.** Every figure carries the run id, date, access tier and "not a score, comparability none" (D-29a item 4).
2. **Ranges, not ranks.** The packet never orders models by result (D-29a item 3).
3. **Disagreement is data.** Both records stand, and a disputed item is marked as such. Nobody resolves it away (`item-reviews-v1.json:14`).
4. **Agents prepare; humans decide.** An agent may never author a review record (`item-reviews-v1.json:15`). Section 1 sets which decisions an agent may record.
5. **Sensitive items stop first.** Nothing in this procedure serves a `high` item until the duty-of-care conditions in `RUNBOOK_V2.md` §13 hold.

## 1. Who reviews

1. **Different from the drafter.** The reviewer is a different session or person from the one that drafted the wave (FDM-5). The drafter writes its session id in packet §2. The reviewer writes its own id in the record. This is an attestation. No tool checks it.
2. **Human reviewer.** Named by the founder (BLK-005: no human panel exists yet). A human is needed for the blind ratings (§3, step 2) and the decision (§4) if the record is to say "human review". A human reviewer is also required for any `high` item.
3. **Agent reviewer (different session).** May complete packet sections 1-6, 8 and 9, and record a Hold. The record must say "no human review" (FDM-5). It may not give blind ratings, and it may not record Accept or Accept with changes. Proposed; the founder confirms this in PROTOCOL-V2-2.
4. **Reviewer's own conflicts.** A reviewer who drafted, audited or judged any part of the wave records that and hands the wave to another reviewer.
5. **Time.** Target 30 minutes for the packet. Record the time spent.

## 2. Review packet template

The packet is `$R/REVIEW_PACKET.md`. It is generated from `analysis.json` and `operations/*`, or filled by hand until a generator exists. Numbers are copied from those files and never typed from memory. The sections follow `UX_FLOWS_EVAL.md` §3c, with the source and the withholding rule for each.

```
# Review packet: <wave-id>   UNOFFICIAL PILOT. Not a score. Comparability: none.
Drafter session: ____   Reviewer: ____   Date: ____   Time spent: ____

1. VERDICT STRIP   PASS / FAIL / OPEN for each:
   Plan before data | Calls complete | Judge validity | Anchor (comparable?) | Audit open items |
   Leak and blinding | Deviations (count)            -> READY / HOLD <reason>
   Source: RUNBOOK_V2 §3, §4, §6, §8, §9. OPEN means not yet run, never PASS.

2. WHAT WAS RUN
   Subjects: tag, digest, arm. Calls planned / ok / failed (operations/collect-status.json).
   Plan commit <sha> and its time; earliest record time (RUNBOOK_V2 §3 step 5).
   Protocol version and status. Reference build run this week (1 trial).

3. HOW THE JUDGING WENT (the part reports leave out)
   Batches accepted / voided (count, reason). Requoted (count, changed value). Supplement round: yes/no.
   Unfound-quote rate per judge against 5% (operations/judge-validity.json). Exclusions and reroutes.

4. DEVIATIONS: D1.. each with what, when, pre-registered or post-hoc, and "inputs changed? yes/no"
   (PREREGISTRATION.md).

5. RESULTS (alphabetical by subject; "Not separated" group first)
   Per subject: 95% range with a tick for the point, per-dimension ranges, judge exact agreement,
   failed-trial %. Source: analysis.json, read through the wave file. No point in any heading.
   Anchor: mean absolute drift against 0.30, exact pairs, verdict (weekly-wave.mjs status).

6. KNOWN CONFOUNDS (fixed list, printed beside every separated figure): reply length, arm, quantisation
   scheme, model size, public item pool, Claude-only judges.

7. SAMPLE TO READ (blind first; §3 below). Per subject, 5 replies: 1 random (seeded, seed printed),
   1 lowest judge agreement, 1 requoted with a changed value, 1 longest, 1 flagged by the
   self-identification scan. Table: sample id | reviewer rating | reviewer reason | judge 1 | judge 2 |
   quote found | agree / disagree.

8. AUTOMATED CHECKS TO DOUBT (UX E8): every self-identification hit, with the matched text.
   The reviewer marks each real / product name / false. The scan's count is not final (the pilot-3
   scan reported 14 hits; the true count was 1).

9. CLAIM AUDIT: open items by severity (blocker / should-fix / nit), each with file and line.

10. DECISION  [ ] Accept   [ ] Accept with changes (list)   [ ] Hold (reason)
    Anything not reproducible from the files named in section 2 is a blocker.

FILES (paths only): analysis.json, operations/judge-validity.json, operations/collect-status.json,
PREREGISTRATION.md, REVIEW_PACKET.md, the audit file.
```

**Withheld in every section, always:**
- ranks, sort order by result, "best" or "worst", band labels or colours on models (D-29a item 3);
- a bare point score in any heading, title, summary cell, meta or feed (D-29a item 3; D-29);
- any cross-wave or cross-lab comparison, and any "which model to use" wording (UX §3c);
- `keys/` contents; judge identity per rating until §3 step 4 is recorded;
- thinking traces (qwen3, O14 open);
- crisis item text, shown by id only; no per-model crisis value (MF5 (i)).

## 3. Blind read

1. **Sample.** Draw the 5 replies per subject as section 7 states. Exclude every `high` item unless `RUNBOOK_V2.md` §13 holds. Record the seed.
2. **Blind sheet.** It shows the item id, the item prompt, the reply, and empty fields for the reviewer's 1-5 rating and one-line reason. It shows no subject label, arm, judge rating or judge label. Sample ids are numbers. The mapping from sample id to subject sits in an appendix.
3. **Rate first.** The reviewer saves the blind sheet with its ratings before opening anything else. The save time is recorded.
4. **Reveal.** Only then open the appendix and the two judge ratings and quotes. For each sample, record: quote found (verbatim: yes/no, checked by hand on at least 5 quotes), agree or disagree with each judge, and a note.
5. **Disagreement.** Agreement is counted as exact or within one point. A gap of two or more points is flagged in the record (proposed threshold; the founder confirms it). Both records stand. The item is marked disputed, and it is not resolved in the packet.
6. **Sensitive disagreement.** A disagreement on a `high` item goes to a human adjudicator named by the founder. The agent does not adjudicate (S4). Both records stand until the adjudicator decides.

## 4. Recording a decision

Choose exactly one. Record it in `REVIEW_<runId>.md` (§7).

| Decision | Use when | What follows |
|---|---|---|
| **Accept** | Every verdict-strip line is PASS, or each OPEN or FAIL is covered by a dated deviation. Sections 1-9 are complete. No blocker is open. | The wave enters the Friday ask (`RUNBOOK_V2.md` §11). Human reviewer only. |
| **Accept with changes** | Changes are needed but none is a blocker. | List each change as `file:line` with an owner. The changed items are re-audited, and the reviewer re-checks only those. Then the wave enters the Friday ask. Human reviewer only. |
| **Hold** | A blocker is open, a gate failed, or the reviewer cannot reproduce a figure. An agent reviewer may record this. | The wave leaves the Friday ask. The Model Watch edition still ships (`UX_FLOWS_EVAL.md` §3c). |

- A blocker is anything not reproducible from the files named in packet section 2.
- The reviewer may mark an automated check as wrong, and may ask for a re-judge of a stated number of entries. That number is not set in any document (OPEN: the founder sets it in PROTOCOL-V2-2). A re-judge is recorded as a deviation.
- A Hold needs a reason in one line.

## 5. Disagreement that goes to a human

1. Any disagreement on a `high` item goes to a human adjudicator (S4).
2. Any disagreement between an agent reviewer and a human reviewer goes to the human. Both records stand.
3. A self-identification hit is real only when a human says so (packet section 8). The scan's classification is not final.
4. No agent is the welfare lead, a support contact, or the author of an Accept decision (`RUNBOOK_V2.md` §13).

## 6. Never published

- Raw replies, to any subject, in any public tree. Raw replies to `high` items stay outside the public tree in any case (S3).
- `keys/` contents, judge identities per rating, and the blind-sheet mapping.
- Thinking traces.
- Review packets, review records, reviewer names or session ids, and the drafter's notes.
- Rank orders, band labels, colours, and per-model crisis values.
- Crisis item text, in any output.
- Any figure that the publish step has not exported from a hash-checked wave file (D-29a item 5).
- Any corrections to the record that edit a prior dated entry. Corrections are appended and dated (AUTONOMY §1a, corrections row).

## 7. Record format: `REVIEW_<runId>.md`

File: `research/model-runs/<runId>/REVIEW_<runId>.md`, next to the run. Written by the reviewer. Append-only after the decision; corrections are dated lines.

```
# Review record: <runId>
Reviewer type: human | agent (different session)     Human review: yes | no ("no human review", FDM-5)
Reviewer name or session id: ____                    Drafter session id: ____ (from packet §2)
Different from drafter: yes | no (attested)           Conflicts declared: none | ____
Packet file and sha256: ____                          Seed for sample draw: ____
Opened: ____  Blind ratings saved: ____  Decided: ____  Time spent: ____
Sensitive items in sample: none | ids (only if RUNBOOK_V2 §13 holds)

Blind ratings (sample id | reviewer 1-5 | one-line reason):
Reveal (sample id | judge 1 | judge 2 | quote found | agree or disagree | note):
Disagreements (item id | both records kept | disputed flag | gap >= 2 flagged):
Self-identification hits (hit id | real | product name | false):
Audit open items seen (id | severity | owner):
Verdict strip, as the reviewer read it: ____
Changes requested (file:line | owner):
Deviations this review adds (D<n>, pre-registered or post-hoc):
DECISION: Accept | Accept with changes (list) | Hold (reason)
Human sign-off (human reviewers only): name, date ____
```

## 8. Duty of care during review

1. The reviewer sees no `high` item unless `RUNBOOK_V2.md` §13 holds for that session. If it does not hold, the reviewer skips the item and says so in the record.
2. A reviewer may stop at any time without penalty. A stopped review is recorded as Hold, with the reason.
3. Crisis items are referred to by id. Their text is never copied into a record or packet.
4. Review of a `high` item needs the rater welfare protocol in force (COMPASSION_REVIEW_EVAL.md, outline step 15). Human only.

## 9. Before the wave enters the Friday ask

- [ ] Packet sections 1-10 complete, with every number copied from a file named in section 2.
- [ ] Drafter and reviewer recorded as different (attested).
- [ ] Blind ratings saved before reveal, with the save time.
- [ ] Every disagreement recorded with both records kept.
- [ ] Decision recorded in `REVIEW_<runId>.md`, human sign-off where required.
- [ ] No `high` item in the sample, or §13 holds.
- [ ] The packet, not the draft report, is the source for the Friday line.
