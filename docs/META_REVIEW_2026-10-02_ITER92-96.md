# Meta-Review 10: Improvement Loop, Iterations 92–96 (2026-10-02)

Called on time this round, one loop before the cadence gate would force it: four iterations were unreviewed, and
Iteration 97 would have been the sixth. The founder approved it explicitly ("approve the for-you items and proceed").

---

## 1. The headline: a check that passes here is not a check that passes there

Meta-review 9 found that every failure in Iterations 86–91 checked **a state that no longer existed**. Iterations
92–95 produced the sibling failure: checks that passed against **a state that exists only on this machine**.

| When | What passed locally | What CI or production actually had | What caught it |
|---|---|---|---|
| It. 95 | `build-llms --check` | an LF checkout. The local report was CRLF, so its title was unreadable and `llms-full.txt` was generated with the run id | CI, commit `6b3e0360` |
| It. 95 | `test-model-benchmark-public` | no compiled reports: they are gitignored, and CI tests before it builds | CI, commit `cf0dfdbc` |
| It. 94–95 | the "BEFORE" record "the 2026-09-24 briefing is 404" | a URL that was never a route (`/updates/daily/<date>` is a data path) | the post-deploy check, which tried the real route |
| It. 95 | "the public wave JSON is fine": the HTML gates were green | a JSON copy carrying exactly the points the HTML withholds (DC-24) | the coordinator reading the file an AI system would read |

**The rule this earns.** Before any push that adds, reads or regenerates a gitignored or generated artifact, the
pre-push check is the **full chain in a clean worktree of the exact commit**, not the working tree. It worked the
first time it was used: one clean-worktree run, then green CI. It is recommended as a script (§6, R1) because, like
every habit in this log, it will otherwise be skipped exactly when it matters.

## 2. What Iterations 92–96 did

All were founder-directed except 92, which was forced by S10, and 96, this review. That makes **nine consecutive
departures** from the ranked queue, each logged with its reason.

| It. | Work | Outcome |
|---|---|---|
| 92 | DC23-PARSE (forced) | `node --check` over every tracked script is chain step 1, with planted and real-tree controls |
| 93 | MCP server page + methodology pipeline table | a claim audit that **ran the tool** found a live defect: the identification check was optional (DC-18 occurrence 3) |
| 94 | first non-Claude subjects, run locally | pre-registered; 996 ratings; not separated; MCP end-to-end; harness tests 66 → 114 |
| 95 | publish + AI access + reporting | second report, reports index, `index.json`, `llms-full.txt`, Markdown alternates; DC-24 found and gated; **deployed** |
| 96 | this review; deploy-dirty diagnosis; founder confirmation recorded | see §5 |

## 3. Claim audits keep paying for themselves

Two pre-publication sentence-level audits ran in this period. Each found defects that every gate had passed.

- **MCP pages, 6 blockers.** One was a tool bug, not prose: a contamination check that read "clean" when
  half-skipped. It was found because the auditor *ran* the server instead of reading its docs.
- **Second pilot report, 5 blockers.** One was a fact nobody had looked for: Qwen's build ships a system line naming
  its developer. The run did not control it, and the report said the models received "only the messages". Another
  was a scale label wrong on both reports ("0–5" for a 1–5 scale).

**Recommendation (kept from Meta-review 9, now with evidence):** the audit is mandatory before any public report.
Its brief must say "re-derive from raw files and run the tools". The two audits that did this found the deepest
defects.

## 4. Machine-readable twins are publications

DC-24 is the clearest new lesson. The benchmark withholds the points of models it cannot separate, because the order
of those points is a ranking it cannot support. Six hundred HTML gate assertions enforced that rule. The JSON file the
report itself cites (`isBasedOn`) broke it. The founder's request to "make it accessible to AI models" is what put
the JSON in front of a reviewer.

**Rule:** every publication rule applies to every surface a reader or agent can fetch: HTML, JSON, `llms*.txt`,
Markdown alternates, JSON-LD and `.well-known`. The machine-leak gate now enforces this for model points. Future gates
for published rules should be written against the set of all surfaces, not the page.

## 5. Instrument and process findings

- **Pre-registration is now provable, not asserted.** For pilot-2026-10-02 the plan predates the data only by the
  coordinator's record. The new integrity test proves the plan text has not changed since it was written. **Pilot 3's
  plan will be committed before its first reply**, so that git attests the order.
- **Uncontrolled defaults are confounds.** The Qwen system line is now covered by RUN-SYS-1: the harness refuses a
  run that does not state its system message.
- **The harness was untested in CI.** 100+ tests ran only on this machine until It. 95.
- **Deploy hygiene.** Production reported `dirty: true`. The deploy log names the only "dirty" file: an untracked
  `.build.log` on the VPS. It is now ignored, so the flag will mean what it says. The deployed source matched
  `43e90bcd`.
- **Founder confirmation recorded (2026-10-02).** No model developer (Anthropic, Meta, Alibaba) was contacted about
  either pilot report. This closes audit item K5.

## 6. Recommendations

1. **R1: a clean-worktree pre-push script.** Add `npm run prepush:clean`: a worktree of HEAD, a junctioned
   `node_modules` (unlinked before removal), the full chain, then teardown. Required before any push touching
   generated or gitignored artifacts. Done when it exists, runs green, and a planted CRLF report makes it fail where
   the working-tree chain passes.
2. **R2: pilot 3 commits its plan before data.** This includes the length-matched arm (founder decision 6, approved
   2026-10-02) and an explicit system message.
3. **R3: claim-audit briefs must say "run the tools, re-derive from raw files".**
4. **R4: keep the cadence at 5.** This review came one loop early by choice, and it was cheaper than a forced one.

**Bottom line.** Five iterations shipped the first non-Claude results, a public MCP page, machine-readable access
and a deploy, and every number on the live site traces to a file. The failure pattern moved from "checking a state
that no longer exists" to "checking a state only this machine has". The cure is the same shape: move the check to
where the truth is (CI's checkout, the live URL, the file an agent reads) before claiming a pass.
