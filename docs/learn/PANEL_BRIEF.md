# Learn — specialist panel brief (2026-10-14)

**Founder directive (2026-10-14, verbatim):** "The website also needs to place for children and students to understand
the methodology, analysis, scoring, insights, and corrective actions. Engage sub agents to develop pages for learning
and experiments for kids and students."

Working name: **Learn**, a section of compassionbenchmark.com. Each panelist writes ONE brief at
`docs/learn/briefs/<NN>-<role>.md`:
- at most about 1,200 words;
- recommendations numbered `<ROLE>-R1…`;
- every repo claim cites a path.

The coordinator then synthesises the briefs into a PRD and a build plan.

## Audiences (proposed age bands; challenge them if your lens says otherwise)
| Band | Ages | Reader |
|---|---|---|
| **Explorers** | about 8–11 | reads with a parent or teacher |
| **Investigators** | about 12–14 | reads independently, in class or at home |
| **Analysts** | about 15–18 | secondary school, statistics/civics/computing |
| **Researchers** | university and adult learners | links into the full methodology |

**Educators** (teachers, parents, club leaders) are a fifth audience. They are the real distribution channel for the
youngest bands.

## The five things to teach (from the directive)
1. **Methodology:**
   - 8 dimensions and 40 subdimensions (`site/src/data/dimensions.ts`);
   - evidence tiers;
   - how an entity is assessed (`/methodology`, `site/src/app/methodology/page.tsx`).
2. **Analysis:** how evidence is found and weighed, how a scan flags entities, and how an assessment turns evidence into
   anchors. Real examples are in `research/assessments/` and the public briefings at `/updates`.
3. **Scoring:**
   - the composite formula: `site/scripts/lib/scoring.mjs`, methodology v1.2, an integration premium and 5 bands;
   - uncertainty and intervals (the AI model pilots, `/ai-models/reports/<runId>`);
   - why a seed is not a measurement (backlog RC-2).
4. **Insights:** what the indexes show, read honestly. That covers patterns, uncertainty, and what the data cannot say.
5. **Corrective actions.** Two meanings, and both should be taught:
   - **(a) how institutions correct:** acknowledging harm, repairing it and changing systems (the Accountability and
     Systems dimensions);
   - **(b) how the benchmark corrects itself:** dated public corrections in `CHANGELOG.md`, for example "We were wrong
     about our own scoring formula" (2026-09-29) and rubric corrections. Showing that error and correction are normal
     in science is a core lesson.

## "Experiments" — interpret broadly
Hands-on activities, all fully client-side or offline (printable):
- build-a-score sliders using the real formula;
- band sorting;
- spot-the-evidence-tier;
- a dice or bootstrap demonstration of uncertainty;
- "is this a seed or a measurement?";
- design a corrective action;
- assess your school or club with a simplified rubric, done offline and never submitted;
- for older bands, reproduce a published composite from its dimension scores.

## Binding rules
- **Privacy (children):**
  - no accounts, forms, comments, uploads or free-text submission anywhere in Learn;
  - nothing a child types leaves the browser;
  - no third-party embeds or trackers;
  - the self-hosted Umami analytics loads on every page via `site/src/app/layout.tsx:119`, and whether it runs on Learn
    pages is an open decision; take a position.

  COPPA (US), the UK Age Appropriate Design Code and GDPR Art. 8 apply in spirit, even though nothing is collected.
- **Duty of care:** the benchmark measures suffering (war, executions, detention, crisis). The younger bands must never
  meet graphic or distressing specifics. They learn the method on gentle, everyday or invented examples, such as a
  school, a library or a fictional town. Real entities and real harms appear only from Investigators upward, framed
  carefully, and never as "this country is bad". The existing duty-of-care copy is in
  `site/src/components/model-benchmark/dutyOfCare.ts`.
- **Agent Hub separation:** no link from the Explorer or Investigator pages into the Agent Hub, comments, or any
  user-generated content.
- **Independence and education firewall** (`docs/NONPROFIT_ORGANIZATION_DOCUMENT_2026-10-14.md` §4.2): learning never
  affects a score, and is never presented as a way to raise one.
- **Honesty:**
  - never hard-code counts; import from `site/src/data/entityCount.ts` and `indexRegistry.ts`;
  - every figure comes from the data files;
  - the AI model rules D-29/D-29a apply here too (no model ranks or bare model scores);
  - simplification is allowed, falsehood is not, and every simplified page links to the full version.
- **Tech:** a static Next.js export, the dark theme in `globals.css`, Tailwind v4, and hand-rolled SVG. The scoring code
  must be reused, never re-implemented: `site/src/lib/scoring.ts` or `site/scripts/lib/scoring.mjs`.
- **Accessibility:** WCAG 2.2 AA at minimum, plus cognitive accessibility and reading levels per band.
- **Licence:** educator materials should be openly licensed. The repo licence is in `LICENSE` and `NOTICE.md`; check
  what applies to content.
- **AUTONOMY.md:** deploy and publication are founder-gated.

## Every brief ends with
**Top 3 recommendations** · **What I would refuse to build** · **Open questions for the founder (each with a
recommended default)**.

Write only your brief file. No code, no git, no other edits.
