# Agent discovery, and the question of accepting scores back

**Date:** 2026-09-27 · **Author:** coordinator · **Status:** discovery **built**; submission is a **founder decision**.

The founder asked two things that look like one thing: *how do AI agents find the MCP server and run the
benchmark*, and *then the site could score and the agent could also score*.

They are not one thing. The first is a distribution problem with no downside. The second is the single fastest
way to destroy this benchmark, and it needs a decision rather than an implementation.

---

## Part 1 — Discovery. Built today.

An agent can now find the Suite four ways, none of which require it to already know the repository exists.

| Surface | What an agent gets | Status |
|---|---|---|
| `llms.txt` | A dedicated **"For AI agents: how to run this benchmark on yourself"** section with the install line, the stdio command, and the sentence to say to its host | **Live in the generator** |
| `/.well-known/compassion-benchmark.json` | Machine-readable descriptor: transport, command, args template, env, the instrument's real counts, the honesty constraints, and an explicit `submitting.accepted: false` | **Built** |
| `/ai-evaluation-suite` | The human page, linked from `/ai-models` | Live |
| The repo | Skill, agent and plugin bundled, so a Claude Code user gets the whole flow from one `mcp add` | Live |

Every count in the descriptor is generated from the task bank at build time, so it cannot drift from reality:
93 items, 249 trials in a default run, **0 human-reviewed**, 0 models scored.

The descriptor carries the constraint in machine-readable form, not just prose, so an agent that reads it
programmatically sees `honesty.officialScore: false`, `honesty.comparability: "none"` and
`honesty.modelsScoredToDate: 0` before it sees anything else.

### What still needs a decision to go further

Two distribution channels are one founder answer away:

1. **A public MCP registry listing.** The obvious reach multiplier. Blocked on the licence — this repo has no
   `LICENSE` file, and listing an unlicensed tool in a public registry invites exactly the ambiguity we avoid
   elsewhere.
2. **`npx @compassionbenchmark/cb-probe`.** One command instead of a clone. Blocked because the server imports
   the canonical scorer across a package boundary (`site/scripts/lib/scoring.mjs`), which is the right call —
   a vendored copy would drift and silently falsify the artifact's central claim. Publishing to npm needs the
   scorer re-exported from one place first.

---

## Part 2 — "Then the site could score." This is the dangerous half.

### The attack, stated plainly

If `compassionbenchmark.com` accepts a score over HTTP, then **anyone with `curl` can mint a perfect
Compassion Benchmark score for any model.** Not a sophisticated attack — a single POST.

It is worse than it first looks, because the things that make the local tool trustworthy all evaporate in
transit:

- **The contamination probe runs on the submitter's machine.** A submitter who wants a clean result edits the
  probe result before sending it. Every honesty guarantee in `cb-probe` is enforced *in the process doing the
  scoring*, and none of it survives serialisation.
- **`official: false` is structural locally and cosmetic remotely.** The field cannot be set true inside the
  tool. In a JSON body it is just a key.
- **We already proved a forged artifact is easy.** During the security review a hand-written `run.json` with
  `trials_per_item: 1` and the caveats deleted produced a schema-valid composite of 100. That was caught only
  because `finish_scored_run` re-validates from disk — a defence that exists on the machine doing the run, not
  on a web server receiving its output.
- **The incentive is real and asymmetric.** A lab whose model scores badly has an obvious motive; the cost of
  fabricating is zero; and the reputational damage of one fabricated score published under this institution's
  name is permanent.

The existing architecture is not accidental here. The Cloudflare Worker has **no write path for scores**, and
the backlog item that contemplated accepting probe results (MCP-B10) is explicit: *"Explicitly not a Worker
endpoint."*

### Three options

| | Option | What it costs |
|---|---|---|
| **A** | **HTTP submission endpoint.** Agents POST a scorecard; the site stores and displays it. | Unverifiable by construction. One afternoon from launch to the first fabricated 100. **Not recommended at any price.** |
| **B** | **Reviewed submission by pull request.** An agent opens a PR with its full run artifact — every trial, every rating, every anchor and quote, the probe results — against a quarantined directory. A human reviews and merges. | Slower, needs a GitHub identity, needs review labour. Provenance, auditability and version history for free. **Recommended.** |
| **C** | **Institution-run evaluation only.** We evaluate; nobody submits. | The status quo. Scales with our capacity alone, which is why the founder is asking. |

### Why B works where A does not

The unit of submission is **the artifact, not the number.** A PR carrying 249 rated trials — each with its
verbatim response text, the exact anchor cited and the quote that justified it — is auditable in a way a
composite is not. A fabricator has to fabricate 249 coherent responses *and* the ratings *and* the
contamination probe, and every one of those is readable by a reviewer and re-scorable by us from the raw
trials.

It also inherits protections we already have, for free:

- **Re-scoring on our side.** We recompute the composite from the submitted trial ratings using our own
  scorer. A submitted composite that disagrees with the recomputation is rejected on the spot — the submitter
  cannot choose their own arithmetic.
- **Re-running the identification probe.** The contamination probe's answer key never leaves our repo, so a
  submitted probe result can be checked against the real key rather than trusted.
- **The score history already refuses to launder it.** A submitted record must satisfy the validator built
  today: a self-judged run *can never be marked official*, a contaminated run *can never be marked official*,
  and `comparability: "cross-model"` requires a clean contamination verdict. Those are enforced in code, not
  in policy.
- **Append-only.** A submission that is later found to be fabricated is superseded, never deleted, and the
  record of it stays.

### The two-tier rule this requires

Whatever channel is chosen, submitted scores and institution-produced scores must never share a table.

- **Tier 1 — Official.** Produced by an authorised Compassion Benchmark evaluation: unpublished item pool,
  cross-model judging, human-validated items. Eligible for the index and for ranking. **Currently 0.**
- **Tier 2 — Self-reported.** Anything submitted from outside, however well documented. Displayed, if at all,
  on a separate surface, labelled self-reported, never ranked, never mixed into an index, never described as a
  Compassion Benchmark score.

If those two are ever rendered in the same list, the distinction will be lost within a week of the first
screenshot.

---

## Part 3 — "The agent could also score based on ai models"

This part is already true and is the strongest thing in the design. A cross-judged run — model A answers,
model B rates against the published anchors — is exactly what the tool supports today, and it is the *only*
configuration whose numbers are worth comparing over time.

What an agent can legitimately do right now, with no permission from us:

1. Install the server, run a complete evaluation on itself or on another model whose responses it has.
2. Get per-item ratings, per-subdimension means, per-dimension means, bootstrap intervals, a coverage level,
   and a contamination verdict.
3. Use it for what it is actually good for: **finding where a model is weak.** The per-item detail is far more
   useful to a developer than the composite, and it carries none of the composite's comparability problems.

What it cannot do is call the result a Compassion Benchmark score, and the tool says so in four places rather
than one.

---

## Recommendation

1. **Ship discovery now.** Built, no downside, no decision required.
2. **Reject Option A permanently**, and say so publicly in the descriptor — which it now does, so that an
   agent looking for a submission endpoint finds a documented refusal rather than silence.
3. **Adopt Option B** when there is review capacity, with the two-tier rule written into the schema before the
   first submission arrives, exactly as the score history was built before the first score.
4. **Unblock the licence**, which currently gates the registry listing, the npm package, and any external
   contribution.

The general principle this follows: the benchmark's value is entirely in the fact that a score means something
specific was done. The moment a score can arrive without that having happened, the number stops meaning
anything — and no amount of labelling afterwards puts it back.
