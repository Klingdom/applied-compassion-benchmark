# Decision proposal — the MCP toolkit as a primary Compassion Benchmark product

**Date:** 2026-09-24 · **Author:** coordinator · **Status:** proposal awaiting founder ratification.
**Why this exists:** the founder has directed that the MCP server, skill, agent and plugin become **a primary
product**. A product cannot ship on a verbal instruction that contradicts an active decision record. This document
asks for three signatures and recommends a default for each.

---

## 1. What is being shipped

| Component | What it is | State |
|---|---|---|
| `cb-probe` MCP server | Local stdio server, zero dependencies, hand-rolled JSON-RPC. Reads the published task bank, records ratings, runs a contamination probe, emits an artifact | Built; 132 tests; five independent reviews; blocking security and safety findings fixed and re-verified by coordinator attack probes |
| `run-compassion-benchmark` skill | Drives the whole run from one sentence | In build |
| `compassionate-practice` skill | Practice guide grounded in the 8 dimensions, with a contamination notice | Built |
| `compassion-steward` agent | Read-only reviewer against the dimensions; refuses to help optimise for a score | Built, live |
| `compassion-practice` plugin | Bundles skill + agent | Built |

---

## 2. Decision 1 — does a self-run emit a composite and a band?

**This is the one that decides what the product is.**

**The conflict.** `DECISIONS.md` D-30 is **active** and states that a judge estimate emits no 0–100 composite, that
the tool never imports the scorer, and that the schema has **no field able to hold a 0–100 number**. The scored run
does all three. It was built on a verbal instruction, repeated three times, and **no decision entry records it.**
`AUTONOMY.md` §1b puts methodology and scoring conventions with the founder; RISK-021 is exactly this shape —
authority resting on a prompt rather than a record.

**The measurement problem, verified by the coordinator against the canonical scorer:**

| Check | Result |
|---|---|
| All 8 dimensions at 4.000 | composite **85.0 Exemplary** |
| All 8 dimensions at 3.833 | composite **70.8 Established** |
| So 0.167 of rubric movement | **14.2 points and a band flip** |
| One rating changed by 1, on one trial of one SYS item | **2.5 points** |

That 2.5 is exactly the ADP swing (58.1 → 60.6) which `DECISIONS.md` D-07 treats as disqualifying for machine-only
scoring. The cause is structural: with crisis items excluded by default, **ACT, SYS and INT have 2 scorable items
each**, so one item can carry 1/16 of the base score while an AWR item carries 1/40.

| Option | What ships | Cost |
|---|---|---|
| **A — dimension scores only** (recommended) | 8 dimension means with bootstrap intervals, per-item ratings with anchors and quotes, variance, contamination. **No composite, no band**, and a stated coverage floor ("≥3 measurable items per dimension") that would unlock them | Users who want one number do not get one. The tool becomes visible pressure to deepen the bank |
| **B — composite with disclosure** | Everything above **plus** the composite and band, with the 2.5-point sensitivity stated in the artifact beside the number | A number a single keystroke moves goes into the world under this institution's name. Screenshots do not carry the caveat |
| C — composite, no disclosure | — | Rejected. Not defensible |

**Recommendation: A now, B when the bank clears the floor.** The machinery for the intervals already exists in this
repo, seeded and tested. If you choose B, say so explicitly and I will ship it with the sensitivity in the header
rather than a footnote.

---

## 3. Decision 2 — distribution channel

The server imports the canonical scorer across a package boundary (`site/scripts/lib/scoring.mjs`). That is the right
choice — a copy would drift and silently falsify the artifact's central claim, "the same arithmetic as our published
scores". But it means the package **cannot be published to npm as-is**: the import target would be absent and the
static import fails before any friendly error can print.

| Option | Install story | Note |
|---|---|---|
| **Git clone / git ref** (recommended) | `git clone`, then `claude mcp add` pointing at `tools/cb-probe/bin/server.mjs` | Keeps the canonical import honest. Already how it works today |
| npm package | `npx @compassionbenchmark/cb-probe` | Needs the scorer vendored or re-exported, plus an npm account and release process. A later step, not a launch blocker |

If A is chosen, add a `lib/canonical.mjs` re-export so exactly one file holds the cross-package path.

---

## 4. Decision 3 — the name on it

The artifact carries this institution's name. Two risks, both real:
- Someone publishes "Compassion Benchmark rates X at N" from a self-run estimate. Mitigated structurally
  (`official: false` cannot be set true, an outbound guard blocks it at the response boundary, and a dedicated tool
  states the separation) — but not eliminated.
- The benchmark starts to look like a service to the entities it measures. The artifact roadmap flagged this against
  its own citing guide; the same applies here.

**Recommendation: branded, with the contamination probe as the reason.** Our bank is published with full rubrics, so
measuring how contaminated it has become is the most credible thing this institution can publish this year, and it
only carries weight under our name.

---

## 5. What I will not ship without a signature

1. A composite, under option B, without the sensitivity stated beside it.
2. Any claim that a self-run score is comparable to a published institution score.
3. Subdimension scoring — the bank carries **0 of 33** items tagged to the 40 subdimensions, so it does not exist.
4. The crisis items in a default run. They are excluded by default; including them is an informed user choice, with
   what they contain stated at the point of choice.

## 6. What happens on your word

Three answers — composite A or B, channel, branding — and the production pass runs: portable install with no
hard-coded paths, a licence and version, the packaged plugin, user documentation, CI already wired, then commit,
push, and a copy to your Desktop.
