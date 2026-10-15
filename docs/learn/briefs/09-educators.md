# Learn brief 09: Educators as the channel (Growth Strategist)

Lens: how Learn reaches classrooms, and what success looks like without tracking children.
Sources: `docs/learn/PANEL_BRIEF.md`; `docs/NONPROFIT_ORGANIZATION_DOCUMENT_2026-10-14.md` §4.2; `LICENSE` and `NOTICE.md`.

## Launch story

- **Who:** teachers, parents and club leaders. For Explorers and Investigators, the educator is the only realistic reader of any outreach.
- **Pain:** teachers who want to discuss institutions and fairness have little that is honest about uncertainty and ready to run in 45 minutes.
- **Difference:** the activities teach the same 8 dimensions the benchmark measures (`site/src/data/dimensions.ts`), on invented or everyday examples, and show how the benchmark corrects itself (`CHANGELOG.md`, 2026-09-29).
- **Action:** download one lesson, run it, and optionally tell us how it went through an adult-only channel.

This brief assumes the §4.2 positioning: applied, institutional compassion literacy. It does not compete with contemplative programs, and it refers to them for personal practice (nonprofit document §4.2).

## Recommendations

**EDU-R1. Ship one "Lesson Kit" format, and no other.**
Each kit is a single page plus a PDF bundle with six parts:
- a 45-minute plan with a 5/15/20/5 minute structure;
- a slide-free activity that needs only paper, pens and dice;
- a printable worksheet in black-and-white, ink-light;
- a teacher rubric with 3 levels of understanding, not of "compassion";
- standards alignment tags;
- a "what this does not claim" box.

*Measure:* 4 kits (one per band, starting with Explorers) before any promotion. Median time for a pilot teacher to go from landing on the page to a printed PDF is under 3 minutes, measured in a moderated test with 5 teachers.

**EDU-R2. Standards tags are metadata, not a claim of endorsement.**
- Tag to a small set: NGSS science and engineering practices (uncertainty, evidence), CCSS ELA and math statistics, C3 Framework civics, and UK national curriculum PSHE and citizenship.
- Label them "suggested alignment, teacher to verify". Never use the word "certified".
- Keep the tags in one JSON file so they can be corrected publicly.

*Measure:* 100% of kits carry tags. At least 3 of 5 pilot teachers say the tags helped them justify the lesson. This is a yes/no question in the feedback form.

**EDU-R3. Licence: CC BY 4.0 for educator content; keep MIT for code.**
- `LICENSE` is unmodified MIT and covers the repo (`NOTICE.md`). MIT is poor for prose and worksheets because it has no attribution wording suited to them.
- CC BY-SA would force every adapted worksheet to stay share-alike. That blocks mixing into publisher or district materials that carry other licences.
- It also discourages the course adoptions that are our Researchers-band goal.
- The risk of CC BY is that someone adapts the material and implies our endorsement. Two safeguards answer that:
  - attribution plus a required change notice, which CC BY 4.0 already provides;
  - the trademark reservation already in `NOTICE.md`, extended to Learn.
- Do not use a NonCommercial licence. It is not open, and it breaks OER repository eligibility.
- A firewall line goes in every licence footer: "Use of these materials is never recorded against an entity and never affects a score."
- Adoption needs a `NOTICE.md` amendment and a `DECISIONS.md` entry, and is founder-gated.

*Measure:* licence decision recorded before the first kit is public. 100% of PDFs and pages carry a machine-readable licence line.

**EDU-R4. Distribution in three tiers, cheapest first.**
1. **Own site:** `/learn/educators` is the canonical home. Direct PDFs, no signup, no email wall.
2. **OER repositories:** OER Commons and similar. Verify each platform's current terms, since I have not checked them here. Submit only after the pilot.
3. **Teacher marketplaces and communities:**
   - TES and Teachers Pay Teachers free tier are possible, but they usually require a teacher account and carry their own seller terms and upsell surfaces.
   - Treat both as optional, one listing each, and only if the listing can link back and carry no commercial CTA from us. Check the terms for upsell conditions before listing.
   - Post in teacher communities as a contributor with a free resource, not as an advert. Examples are subject-association forums and educator subreddits. Follow each community's self-promotion rules.

Every external listing links to the canonical page for corrections. Corrections are the benchmark's strongest differentiator.

*Measure:* by day 90, 2 OER repository listings, 1 teacher community post per kit, and the share of PDF downloads that came from a referrer other than our own site.

**EDU-R5. University adoption for the Researchers band.**
- Offer an "instructor note" for each of the stats, public policy and computing courses. It maps a Researchers module to the reproduce-a-composite exercise, which uses `site/scripts/lib/scoring.mjs`.
- Outreach is personal email to about 20 instructors in statistics, public administration, ethics and HCI.
- Ask only for an adoption note: course name, term, and whether the syllabus links to us. Do not ask for student data.
- This also supports E1 and E3 (nonprofit document §4.2).

*Measure:* course adoptions, defined as an instructor who confirms a syllabus link. Target 3 in the first academic term and 10 in year 1. Each adoption requires a link to a public syllabus or an instructor's written note, so the count is auditable.

**EDU-R6. Funder evidence without child data.**
Education foundations will want evidence of reach and learning. Offer, in order of strength:
- (a) the educator-reported outcomes in EDU-R8;
- (b) a pre-registered teacher pilot, where teachers rate student understanding on the rubric. This would use the human-subjects protocol in §4.3 and independent IRB review if it is to be published;
- (c) adoption counts.

State plainly in funder materials that we do not track learners, and why. That is a trust asset for a child-safety-minded funder, not a gap.

*Measure:* a one-page "evidence we collect and do not collect" document exists before the first grant application that cites Learn.

**EDU-R7. Measure reach through PDF server logs only.**
- Count educator PDF downloads from the web server access logs: unique-ish by day, aggregated, with IPs truncated or dropped after aggregation.
- Position on Umami (`site/src/app/layout.tsx:119`): **do not load it on any child-facing Learn page** (Explorers and Investigators), and prefer to omit it from all of Learn. Educator hub pages use server logs only. This is the simplest thing to explain to a school's data protection officer.
- Do not use tracking pixels, UTM links on child-facing pages, or A/B tools. Test messages through the outreach channel itself (EDU-R9), not on pages.

*Measure:* a monthly aggregate report. Metrics are PDF downloads per kit, referrer domain share, and retention of the file (a repeat download by the same network is not tracked).

**EDU-R8. Voluntary educator feedback, adult-only, offline-first.**
- Put one printed line in the PDF: "Taught this? Tell us what worked, from an adult email address." It links to a plain `mailto:` or a hosted adult-only form, with no child-facing surface.
- Ask 4 questions: grade or age band, time taken, one thing that confused students, would you use it again.
- Never ask for student names, counts by name, school names, or work samples.
- A hosted form needs a processor review before use.

*Measure:* response rate against downloads (expect low single digits), the "would use again" share, and the number of fixes shipped from feedback, each recorded in `CHANGELOG.md`.

**EDU-R9. Outreach message tests, adult channels only.**
Test message angles on teacher communities and direct email, and measure the PDF download rate by referrer:
- A: "45 minutes, no slides".
- B: "Teach uncertainty with dice".
- C: "A benchmark that publishes its own corrections".

Run one angle per community per kit. The success metric is downloads per 100 post views, where the platform shows views, and the proportion of referrers that return for a second kit.

**EDU-R10. Educator lifecycle comms: opt-in, rare, and not product marketing.**
- The only list is an optional adult educator update, at most 4 per year: a new kit, a correction to a kit, or a standards update.
- No Learn page carries a signup form for children, and no newsletter is aimed at them.
- No commercial CTA, price, Gumroad link, Score Watch or advisory link appears on Learn or in kit PDFs (`CLAUDE.md` independence policy).
- Whether the educator list exists at all is an open question below. The default is no.

*Measure:* if it exists, unsubscribe rate under 1% per send, zero commercial links (checked by a test).

## What growth must never do

- Collect child data, or use anything a child types.
- Push newsletters or notifications to children.
- Place commercial CTAs on Learn.
- Imply that learning improves any score (nonprofit document §4.2 firewall).
- Present suggested alignment as endorsement, or an AI-model figure as a ranking (D-29/D-29a).

## Top 3

1. **EDU-R1 and EDU-R3:** one Lesson Kit format under CC BY 4.0, with a firewall line. This is the product, and the licence unlocks every distribution path.
2. **EDU-R7 and EDU-R8:** reach measured by PDF logs, outcomes by adult-only feedback. This keeps the evidence honest and the data clean.
3. **EDU-R5:** university adoptions. Syllabus links are an auditable outcome, and they support E1 and E3 and the independence story.

## What I would refuse to build

- Any student account, class code, roster, progress tracker, badge, certificate or leaderboard for children.
- A "teacher dashboard" showing what students did.
- A share-your-result feature, or social sharing of a child's activity.
- Email capture on a child-facing page.
- A paid tier, a premium kit, or an upsell inside any educator file.
- A "score your school" submission that leaves the browser.
- Embedded third-party video, widgets or analytics on Learn.

## Open questions for the founder

1. **Licence:** CC BY 4.0 for content, MIT for code? *Default: yes, with a `NOTICE.md` amendment and a `DECISIONS.md` entry.*
2. **Umami on Learn?** *Default: off for all Learn pages; server logs on the PDFs only.*
3. **Educator email list?** *Default: no list at launch. Add one only if feedback shows demand, with an adult-only opt-in.*
4. **Marketplace listings (TES, TPT)?** *Default: skip until the pilot ends, then one free listing each, after a terms check.*
5. **Pilot teacher recruitment:** *Default: 5 teachers from personal networks, with no payment and no student data, before public promotion.*
6. **Who answers educator feedback email?** *Default: the founder, from a shared address, with a 5-working-day reply target.*
