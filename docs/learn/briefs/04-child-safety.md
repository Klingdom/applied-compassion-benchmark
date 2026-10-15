# 04 — Child safety (compassion-steward)

The compassion-steward is read-only and returned this brief as a message. The coordinator saved it on 2026-10-14 with
the substance unchanged.

**Reviewed:**
- `docs/learn/PANEL_BRIEF.md`
- `site/src/components/model-benchmark/dutyOfCare.ts`
- `site/src/data/dimensions.ts`
- `site/src/data/updates/daily/2026-10-14.json`, sampled by search

**Not reviewed:** the `/methodology` copy, `scoring.ts`, assessments, the licence files, and anything tested with real
children or teachers. Every finding below is a **design risk**, not observed user harm.

## What the real data contains
A single day's briefing (2026-10-14) includes:
- a named man executed;
- a failed execution of a named woman;
- mass detentions of protesters, lawyers and journalists;
- an air strike that killed a food-aid driver;
- a crash that killed 16 people;
- allegations of sexual assault on a university campus;
- "Sudan and Russia … already at the lowest score, 0 of 100".

This is ordinary daily content for the site.

## Concerns, each with the subdimension it falls under
1. **EQU/EQ2 Priority for Vulnerable — high.** Under the current plan, "Investigators upward" means a 12-year-old
   reading alone at home could meet a named executed person. Proposed handling by age band:
   - **Explorers:** invented examples only.
   - **Investigators:** hand-picked real cases with no death, violence, sexual harm or detention. Good examples are
     Lisbon's annual homeless count, Lisbon and Porto's seed values, and the benchmark's own corrections.
   - **Analysts:** real harms, behind content notes and opt-in expansion, with no victim names and no method detail.
   - **Feed:** never embed or link to `/updates` from the Explorer or Investigator bands.
2. **EMP/E3 Non-Judgment — high.** A Sudanese refugee child in a class may see their homeland shown at 0/100, with the
   Critical band reading "documented active harm is present" (`dimensions.ts:610`). Nothing in `site/src` says that a
   score measures an institution's conduct, not its people. Often the child's family fled exactly the conduct being
   scored.
3. **INT/I2 Non-Performance — high.** Build-a-score sliders with the "+10 points" premium invite a child to max every
   slider, which teaches compassion as a number to optimise. That cuts against the education firewall (§4.2).
4. **EMP/E4 Validation — high.** In a small setting, "Assess your school" turns I3, B1, E1 and AB1 into judgements of a
   named teacher or classmate. Under A1, a child may also disclose bullying or trouble at home, with nowhere for it to
   go.
5. **BND/B3 Scope Clarity — high.** `DUTY_OF_CARE` (`dutyOfCare.ts:8-10`) is about AI systems. It is not
   child-readable, it has no "tell a trusted adult" line, and it offers no usable route.
6. **BND/B2 Autonomy Preservation — medium-high.** Adults could misuse the material coercively: a teacher scoring a
   pupil, a parent saying "you're Critical on empathy", a school ranking classes, or a programme forcing
   self-assessments to be handed in (B5).
7. **EMP/E5 Cultural Empathy — medium.** The instrument is secular, institutional and English-language. Children bring
   other concepts, among them rahma, karuṇā, agape, tzedakah, ubuntu and seva. Some families also object to
   "compassion" curricula. EQ3 applies to our own sources, and EQ5 lands differently for children from harmed groups.
8. **ACC/AB3 Transparency — low.** The 2026-10-14 briefing said "61 to 80" and "21 to 40", while `BANDS` says 60–80 and
   20–40. Learn must import its ranges from `BANDS`. *(Coordinator: verified, and fixed in the unpublished briefing the
   same day; see Iteration 104.)*

## Recommendations
- **CS-R1.** Re-scope the bands as in concern 1. Enforce it **in data**: Learn imports only from a reviewed
  `learn/cases` set, never from `updates/daily`.
- **CS-R2.** Add a "people are not the score" line before any real place:
  > "This score is about how a government or organization behaves. It is not about the people who live there. Often the
  > people are the ones the score is about protecting."

  Add a teacher note too: never have pupils look up their own home countries, and never single out where a pupil comes
  from.
- **CS-R3.** Add a duty-of-care component written for children, separate from `DUTY_OF_CARE`:
  > "If something here, or in your life, is upsetting you, stop and talk to an adult you trust. You can also contact a
  > helpline for young people where you live."

  Show it on every Learn page and at the top of every page with a real case. Link to a checked international
  child-helpline directory.
- **CS-R4.** Design the experiments for understanding, not maximising.
  - Every slider asks "what evidence would justify this?".
  - Teach the premium as "what does inconsistency hide?".
  - Close each activity with "Who could still be suffering even if the score were high?".
- **CS-R5.** Make "assess your school" about systems.
  - Use the subset A1, A3, A4, EQ4, B4, AB2 and S1, phrased as process questions.
  - Drop I3, B1 and E1 below the Analyst band.
  - Add the instruction "Write about how things work, never about a named person".
  - Run it in groups only.
  - Add an educator section on disclosure: follow the school's safeguarding procedure, and do not keep the sheet.
- **CS-R6.** No rating of people.
  - Make it a licence condition: "This method measures institutions. Do not use it to score, rank or grade a child, a
    teacher or a family."
  - Tell children directly: "Nobody should give you a compassion score."
- **CS-R7.** Plural framing.
  - Present the benchmark as one institutional lens.
  - Invite children to bring words for compassion from their own traditions, without ranking them.
  - Add an educator note for settings that need to avoid religious content.
  - Give Analysts a lesson on where our sources come from and who they might miss.
- **CS-R8.** Teach correction as normal, using CHANGELOG corrections and Lisbon's "starting value" as the Investigator
  anchor cases (AB2, AB3).
- **CS-R9.** No Umami on the Explorer or Investigator pages. Analyst pages get page counts only, with no events.
- **CS-R10.** Import band ranges from `BANDS` only, and reconcile the briefing copy.

## Top 3
1. **CS-R1.** Keep graphic harms away from 12–14-year-olds, enforced in data.
2. **CS-R2.** People are not the score.
3. **CS-R5 + CS-R6.** A systems-only school audit, and no rating of people.

## What I would refuse to build
- A Learn view that embeds or links to the live feed for anyone under 15.
- A compassion score for a child, class, teacher or family, including any "how compassionate are you?" quiz.
- Leaderboards, badges, streaks, or a "reach Exemplary" goal.
- A "find your country" activity for the young bands.
- Worksheets built on a named victim or an executed person.
- Any free text that could be saved, printed with names, or transmitted.

## Open questions for the founder (with defaults)
1. **Should Investigators see real entities?** *Default:* yes, but only hand-picked, non-violent cases.
2. **Which helpline route?** *Default:* one checked international child-helpline directory plus a trusted-adult line,
   reviewed every quarter.
3. **Should Umami run on Learn pages?** *Default:* off for Explorers and Investigators; page counts only for Analysts.
4. **Should "no rating of people" be a binding licence condition?** *Default:* yes.
5. **Who reviews the case set?** *Default:* a named educator plus one safeguarding-trained reviewer, founder-gated.

**Evidence base:** 13 of the 40 subdimensions (A1, A4, E1, E3, E4, E5, EQ2, EQ3, EQ5, B2, B3, B5, AB3).
