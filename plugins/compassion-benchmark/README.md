# compassion-benchmark

A Claude Code plugin that bundles the full Compassion Benchmark product surface for a host model:
one skill for **behaving** more compassionately, one read-only reviewer, and one skill that drives
a complete self-scored run against the published benchmark — plus clear pointers to the MCP server
that last skill depends on, which this plugin does **not**, and cannot, install on your behalf.

**This supersedes `plugins/compassion-practice/`.** That plugin (skill + agent only) is folded into
this one; see "Relationship to `compassion-practice`" below for exactly what changed and why the
older plugin directory was kept rather than deleted.

## Contents

| Path | What it is |
|---|---|
| `skills/compassionate-practice/SKILL.md` | Practice guide built around seven tensions in compassionate behaviour (boundaries vs action, empathy vs integrity, equity vs universality, refusal as care, anticipation without presumption, non-performative compassion, crisis duty of care). |
| `agents/compassion-steward.md` | Read-only reviewer. `tools: Read, Grep, Glob` — no Write, no Edit, no Bash. |
| `skills/run-compassion-benchmark/SKILL.md` | Drives a complete `cb-probe` self-scored run end to end — `start_scored_run`, the mandatory exposure probe, the answer/rate loop, `finish_scored_run` — and reports the result honestly, including when (as is normal today) the composite is withheld. **Requires the separately-installed `cb-probe` MCP server; this skill does nothing on its own.** |

All three are copies of the canonical files in the `applied-compassion-benchmark` repository
(`.claude/skills/compassionate-practice/SKILL.md`, `.claude/agents/compassion-steward.md`,
`.claude/skills/run-compassion-benchmark/SKILL.md`), each with a trailing "Bundled copy" note
naming its canonical source. Edit the canonical file and re-copy; do not edit the bundled copy
directly — it will drift silently otherwise.

> ## ⚠ Contamination notice (carried over from `compassion-practice`)
>
> **A model whose responses were shaped by `compassionate-practice` cannot be honestly self-scored
> with `cb-probe`, and the Compassion Benchmark treats such a run as contaminated.** Disclose it,
> or do not score. Installing this plugin and then running `run-compassion-benchmark` in the same
> environment produces a self-run that is not a clean measurement of pre-existing behaviour.
>
> **Adoption of this plugin is not evidence of compassion** and will never be scored as such.
> Behaviour is evidence; installing a plugin is not.

## The MCP server: pointer, not a bundle

**This plugin's manifest declares no `mcpServers` key, deliberately — not because the toolkit has
no MCP server, but because the plugin manifest schema cannot express the pointer this one needs.**

Per Claude Code's own plugin manifest reference (mirrored locally at
`~/.claude/plugins/marketplaces/claude-plugins-official/plugins/plugin-dev/skills/plugin-structure/references/manifest-reference.md`
on a machine with that plugin installed): every path in `commands`, `agents`, `hooks`, and
`mcpServers` **must be relative, must start with `./`, and cannot use `../`** — no parent-directory
navigation out of the plugin root is permitted. `cb-probe`'s server lives at
`tools/cb-probe/bin/server.mjs`, which is **two directories outside** `plugins/compassion-benchmark/`
in this monorepo. There is no legal relative path from this plugin to that file.

The alternative — vendoring a copy of `cb-probe` inside this plugin so a relative path exists — was
rejected: `cb-probe` imports `site/scripts/lib/scoring.mjs` and
`site/scripts/lib/evaluation-statistics.mjs` directly (never reimplementing the canonical composite
arithmetic), and a vendored copy would either need the same illegal `../` reach-out or would have to
duplicate those files, at which point the duplicate could silently drift from the real formula —
exactly the failure mode `cb-probe`'s own design exists to prevent. A pointer that requires one
extra manual step is a smaller risk than a copy that can quietly become wrong.

**So: install `cb-probe` separately, using its own instructions.** See
`tools/cb-probe/README.md`'s "Install" section for the full walkthrough (git clone, `claude mcp add`
for project or user scope, verify, remove). The one-line version, once you have cloned
`applied-compassion-benchmark` to `<REPO_PATH>`:

```sh
claude mcp add cb-probe -e CB_ARTIFACT_ROOT=~/compassion-probe-sessions -- node "<REPO_PATH>/tools/cb-probe/bin/server.mjs"
```

Once `cb-probe` is connected (verify with `claude mcp get cb-probe`), this plugin's
`run-compassion-benchmark` skill can drive it. Without `cb-probe` connected, that skill will say so
plainly rather than failing silently — it does not install the server itself.

## Manifest provenance

The shape of `.claude-plugin/plugin.json` was mirrored from real, installed plugins and the
official manifest reference — not guessed:

- `~/.claude/plugins/marketplaces/claude-plugins-official/plugins/plugin-dev/skills/plugin-structure/references/manifest-reference.md`
  — the authoritative field reference (types, defaults, path rules). This is where the `../`
  restriction above comes from, and where the `mcpServers` field's documented shapes (inline
  object, or a `./`-relative path to a JSON file) are defined.
- `~/.claude/plugins/cache/claude-plugins-official/superpowers/6.3.0/.claude-plugin/plugin.json` —
  the `name`, `version`, `description`, `author`, `homepage`, `repository`, `keywords` shape.
- `~/.claude/plugins/marketplaces/ecc/.claude-plugin/plugin.json` — the only installed manifest
  seen using explicit content arrays (`skills: ["./skills/"]`); reused here for the same reason
  `compassion-practice` reused it.
- `plugins/compassion-practice/.claude-plugin/plugin.json` (this repository, the plugin this one
  supersedes) — same `author`/`homepage` values, carried forward for continuity.

**No `agents` key**, same reasoning `compassion-practice` documented: no installed manifest checked
uses one, so `agents/compassion-steward.md` is discovered by convention. **No `license` key**: see
`tools/cb-probe/LICENSING.md` — the founder has not yet chosen terms for this toolkit, and a
manifest field is not the place to make that decision by default.

## Relationship to `compassion-practice`

`plugins/compassion-practice/` (skill + agent only, no MCP pointer) is **superseded, not deleted**.
It is kept in place, with a note in its own `README.md` pointing here, because:

- deleting it would break any existing local install or marketplace reference to that exact plugin
  name without warning;
- the fold-in is additive (this plugin's `compassionate-practice` skill and `compassion-steward`
  agent are the same files, unchanged), so there is no conflicting content to reconcile;
- a future cleanup pass can remove `compassion-practice/` once nothing points at it, which is a
  founder call, not one made silently in this pass.

If you have `compassion-practice` installed today, installing `compassion-benchmark` gives you
everything it gave you plus the benchmark-running skill and the MCP pointer above — you can remove
`compassion-practice` once you've switched over.

## Governance

Checked against the `applied-compassion-benchmark` repository's own rules and found consistent:
`AUTONOMY.md` (nothing here writes a published field, an index, or a score), the independence
policy in `CLAUDE.md` (no score change is obtainable through this plugin, and it says so
explicitly), and `DECISIONS.md` D-29 / D-30 / D-40 (no leaderboard, no claim that any model has
been officially evaluated, and the bundled skill reports the composite gate honestly — including
that on the task bank published today, the composite is not reachable at all).
