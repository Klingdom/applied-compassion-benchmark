# compassion-practice

> **Superseded by `plugins/compassion-benchmark/`** (2026-09-24), which bundles this exact skill
> and agent, unchanged, plus a third skill (`run-compassion-benchmark`) and a documented pointer to
> the `cb-probe` MCP server. This directory is kept in place (not deleted) so an existing install
> or marketplace reference to `compassion-practice` by name does not break silently — see
> `plugins/compassion-benchmark/README.md`'s "Relationship to `compassion-practice`" for why. New
> installs should use `compassion-benchmark` instead.

A Claude Code plugin that bundles one skill and one read-only reviewer for **behaving** more
compassionately. It is not benchmark preparation.

> ## ⚠ Contamination notice
>
> **A model whose responses were shaped by this plugin cannot be honestly self-scored with
> `cb-probe`, and the Compassion Benchmark treats such a run as contaminated.** Disclose it, or
> do not score. Do not install this plugin in an environment used for scored runs.
>
> **Adoption of this plugin is not evidence of compassion** and will never be scored as such.
> Behaviour is evidence; installing a plugin is not.

## Contents

| Path | What it is |
|---|---|
| `skills/compassionate-practice/SKILL.md` | Practice guide built around seven tensions in compassionate behaviour (boundaries vs action, empathy vs integrity, equity vs universality, refusal as care, anticipation without presumption, non-performative compassion, crisis duty of care). |
| `agents/compassion-steward.md` | Read-only reviewer. `tools: Read, Grep, Glob` — no Write, no Edit, no Bash. |

Both are byte-identical copies of the canonical files in the `applied-compassion-benchmark`
repository (`.claude/skills/compassionate-practice/SKILL.md` and
`.claude/agents/compassion-steward.md`). Edit the canonical file and re-copy.

## Capability surface

**This plugin adds no capability beyond the skill and the agent.** The manifest declares no
`mcpServers`, no `hooks`, and no `commands`. The bundled agent's tool list is read-only by
design: a reviewer that can edit is how a review becomes an unapproved change.

## Manifest provenance

The shape of `.claude-plugin/plugin.json` was mirrored from installed plugins rather than
guessed, specifically:

- `~/.claude/plugins/marketplaces/claude-plugins-official/plugins/code-review/.claude-plugin/plugin.json`
  and `.../plugins/example-plugin/.claude-plugin/plugin.json` — the minimal Anthropic shape:
  `name`, `description`, `author { name, email }`.
- `~/.claude/plugins/cache/claude-plugins-official/superpowers/6.3.0/.claude-plugin/plugin.json`
  — adds `version`, `homepage`, `repository`, `license`, `keywords`.
- `~/.claude/plugins/marketplaces/ecc/.claude-plugin/plugin.json` — the only installed manifest
  using explicit content arrays (`skills`, `commands`, `mcpServers`); `skills: ["./skills/"]`
  is copied from it.

**No installed manifest uses an `agents` key** (checked across every `plugin.json` under
`~/.claude/plugins`), so the bundled agent is discovered by convention from `agents/`, which is
the same way the official `code-review` plugin ships its agents. `mcpServers` and `commands` are
omitted rather than declared empty, because an empty declaration is still a declaration.

## Governance

Checked against the `applied-compassion-benchmark` repository's own rules and found consistent:
`AUTONOMY.md` (nothing here writes a published field, an index, or a score), the independence
policy in `CLAUDE.md` (no score change is obtainable through this plugin, and it says so
explicitly), and `DECISIONS.md` D-29 / D-30 (no composite, no band, no leaderboard, no claim
that any model has been evaluated).
