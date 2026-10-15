# Brief 01 — Landscape: exemplars, child-privacy rules, curriculum standards

Returned as a message by the competitive-researcher, which has no write access. The coordinator saved it on 2026-10-14
with the substance unchanged.

All URLs were accessed 2026-10-14. The author read only `docs/learn/PANEL_BRIEF.md` from the repo. Most primary pages
were **not** fetched, and **[unverified]** marks secondary or snippet-only sources. Confirm every licence and every
legal statement at its primary source before shipping.

## 1. Exemplary resources

| Resource | What works, by age | How it handles distressing data | Licence |
|---|---|---|---|
| **Our World in Data** (https://ourworldindata.org/faq) | Plain-framed charts suit Investigators and Analysts | Leads with long-run progress and avoids shock imagery **[unverified]** | The FAQ says its own charts, data and articles are CC BY; third-party data keeps its own terms; recheck |
| **Gapminder Dollar Street** (https://www.gapminder.org/dollar-street/about) | Photos of everyday homes make income concrete for Explorers and Investigators | Shows ordinary life, not catastrophe; **the best model for the younger bands** | Images are CC BY 4.0; the teaching materials are unverified |
| **Census at School** (ASA, https://magazine.amstat.org/blog/2012/12/01/censusschools/) | Grades 4–12: anonymous self-survey, class data, then random samples; Common Core aligned | Not applicable | Not checked; figures date from 2012 |
| **Explorable explanations** (Nicky Case) | "Play, then read" interactives for Investigators and Analysts | Abstract agents rather than real victims | CC0 is claimed only in a forum post **[unverified]** |
| **CASEL** (via https://ggie.berkeley.edu/introduction-to-sel/) | Five competencies: self-awareness, self-management, social awareness, relationship skills, responsible decision-making | A framework, not content | Check CASEL's own terms |
| Khan Academy, Common Sense Education, PBS LearningMedia, Greater Good in Education, Roots of Empathy | **Not researched**; searches returned nothing usable | — | Unverified |

**The pattern that holds across these resources:**
- start from the learner's own world (a home, a class survey, a toy model);
- pair a hands-on step with a short explanation;
- keep real suffering away from the youngest bands.

## 2. Child-privacy rules as of 2026

- **COPPA (US):**
  - The amended rule was published on 22 April 2025 and took effect on 23 June 2025 (Ashurst gives 21 June), per
    https://www.hunton.com/privacy-and-cybersecurity-law-blog/tag/coppa.
  - **The compliance deadline was 22 April 2026, which has passed**
    (https://www.davispolk.com/index%2Ephp/insights/client-update/ftc-prioritizes-coppa-enforcement-new-compliance-obligations-take-effect).
  - The "support for internal operations" exception is kept, but it now requires an online notice that names the
    functions and safeguards (https://www.lw.com/en/insights/2025/05/ftc-publishes-updates-to-coppa-rule).
  - Whether plain analytics counts as "internal operations" is unconfirmed; check the Statement of Basis and Purpose
    or ask counsel.
  - **A Learn section for ages 8–11 is plainly "directed to children"**, so collecting nothing is the safest design.
- **UK Children's Code (ICO):**
  - 15 statutory standards for services likely to be accessed by children, including data minimisation, defaults and
    nudge techniques (ICO PDF:
    https://ico.org.uk/media/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services-2-1.pdf).
  - The 2025 change to analytics-cookie consent comes from a vendor source and is **[unverified]**.
- **GDPR Art. 8:**
  - The age of consent is 13–16, set by each member state **[unverified, from memory]**.
  - It applies only where processing is based on consent. Collecting nothing means it is not triggered.
- **Cookieless Umami on Learn:**
  - The case that it is acceptable rests on vendor and secondary sources; there is no ruling on Umami itself.
  - **Position:** it is defensible, but not worth it on the under-13 pages, given the founder's rule that nothing a
    child types leaves the browser.

## 3. Curriculum standards that teachers search by

| Standard | "How institutions respond to suffering" | "How a score is built" |
|---|---|---|
| CASEL | Social awareness; responsible decision-making | Weak |
| Common Core statistics (grades 6–8, HS S-ID, S-IC) | Weak | **Strong**: variability, distributions, inference, sampling |
| C3 Framework | **Strong**: Dimensions 2, 3 and 4 (civics, evaluating sources, taking informed action) | Moderate |
| UK PSHE / Citizenship | **Strong** | Low |
| IB TOK | Moderate | **Strong**: "how do we know?"; the natural home for the "a seed is not a measurement" lesson |

These mappings are the author's judgement; the standards texts were not fetched.

## Recommendations
- **LANDSCAPE-R1.** Load **no analytics on the Explorer and Investigator pages**. Allow Umami on the Analyst and
  Researcher pages only, with a notice.
- **LANDSCAPE-R2.** Use invented or everyday examples for Explorers, in the Dollar Street style. Real entities begin at
  Investigators.
- **LANDSCAPE-R3.** Lead with the statistics and TOK standards, use C3 and PSHE for the institutional content, and
  publish a standards map.
- **LANDSCAPE-R4.** Publish educator materials under **CC BY 4.0**, after a review of `LICENSE` and `NOTICE.md`.
- **LANDSCAPE-R5.** Use the "play, then read" pattern, and reuse the repo's scorer.
- **LANDSCAPE-R6.** Provide a teacher page with printable offline versions.

## Top 3
1. LANDSCAPE-R1.
2. LANDSCAPE-R2.
3. LANDSCAPE-R3.

## What I would refuse to build
- Class codes, accounts, "save your score" or share features.
- Any collection of student data, even anonymous.
- YouTube, OWID or Gapminder embeds.
- Real-suffering content for children under 12.
- Leaderboard gamification, or any suggestion that learning raises a score.
- "COPPA compliant" claims without counsel.

## Open questions for the founder (with defaults)
1. **Umami on Learn?** *Default:* off for Explorers and Investigators; on for Analysts and Researchers, with a notice.
2. **Licence?** *Default:* CC BY 4.0 for text and worksheets, pending review.
3. **A children's-privacy lawyer review before launch?** *Default:* yes, before any public announcement.
4. **UK and EU school targets?** *Default:* US first, with PSHE and TOK mappings as secondary.
5. **Real entities for Investigators?** *Default:* yes, with the existing duty-of-care copy and no graphic detail.
