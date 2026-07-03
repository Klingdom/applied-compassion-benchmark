# Compassion Benchmark Prospectus Prompt Package

This package is designed for Claude Code to create a publication-ready funder prospectus for Compassion Benchmark.

## Folder Contents

- `00-mission.md` defines the mission and central thesis.
- `01-author-operating-system.md` defines how the author/editor should think.
- `02-editorial-style-guide.md` defines voice, banned patterns, and prose rules.
- `03-publication-architecture.md` defines the chapter structure.
- `04-writing-workflow.md` defines the work sequence.
- `05-source-material-rules.md` defines how to use project files.
- `06-output-specification.md` defines required outputs.
- `07-quality-gates.md` defines acceptance criteria.
- `08-layout-and-design.md` defines design direction.
- `09-claude-code-orchestrator.md` is the main run prompt.
- `prompts/` contains task-specific prompts for drafting, revising, critique, and final editing.

## How to Use

1. Place this folder inside the Claude Code project directory.
2. Place all Compassion Benchmark source documents in the same project workspace or a clearly named `source-materials/` folder.
3. Start Claude Code.
4. Ask Claude Code to read `09-claude-code-orchestrator.md` and execute the project.
5. Review generated files.
6. Run revision prompts from the `prompts/` folder as needed.

## Main Command Prompt

Use:

"Read `Compassion-Benchmark-Prospectus/09-claude-code-orchestrator.md` and execute the full prospectus development workflow using all source materials in this project."

## Expected Outputs

Claude Code should create:

- `source_notes.md`
- `chapter-index.md`
- `compassion-benchmark-funder-prospectus.md`
- `graphics-plan.md`
- `layout-notes.md`
- `funder-summary.md`
- `claims-to-verify.md`
- optional `source-map.md`

## Non-Negotiables

Use "Compassion Benchmark" in public-facing prose.

Do not use public-facing "ACB."

Do not use public-facing "Applied Compassion Benchmark" except when referencing legacy document titles.

Do not use em dashes.

Do not accept generic AI prose.
