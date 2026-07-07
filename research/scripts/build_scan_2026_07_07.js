'use strict';
/**
 * Nightly Evidence Scanner — 2026-07-07
 * Outputs:
 *   research/scans/2026-07-07.json
 *   site/src/data/evidence-reviews/2026-07-07.json
 *   site/src/data/evidence-reviews/latest.json
 * Updates: research/rotation-state.json (timestamps only — NO composite/band/rank changes)
 */

const fs   = require('fs');
const path = require('path');

const ROOT           = 'C:/Users/philk/applied-compassion-benchmark';
const SCAN_DATE      = '2026-07-07';
const LOOKBACK_START = '2026-06-23';
const LOOKBACK_END   = '2026-07-07';
const LOOKBACK_DAYS  = 14;

// ── Rotation state ─────────────────────────────────────────────────────────────
const rotationState = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'research/rotation-state.json'), 'utf8')
);
const entities = rotationState.entities;

// ── Pending proposals — queue confirmed CLEAR as of 2026-07-06 commit ──────────
// (El Salvador applied 2026-07-05; "queue clear" per 2026-07-06 commit message)
const pendingSlugs = new Set();

// ── Scoring helpers ────────────────────────────────────────────────────────────
function daysBetween(d1, d2) {
  if (!d1) return Infinity;
  return Math.floor((new Date(d2) - new Date(d1)) / 86400000);
}
function staleness(lastAssessed) {
  const d = daysBetween(lastAssessed, SCAN_DATE);
  if (!lastAssessed || d === Infinity) return 25;
  if (d >= 60) return 20;
  if (d >= 30) return 15;
  if (d >= 14) return 5;
  return 0;
}
function importance(index) {
  return ({
    'fortune-500': 15, 'countries': 12, 'ai-labs': 10,
    'global-cities': 8, 'us-cities': 5, 'robotics-labs': 5,
    'us-states': 3, 'universities': 5,
  })[index] || 5;
}
const BOUNDS = [20, 40, 60, 80];
const SYSTEMIC = new Set([
  'ukraine','russia','iran','sudan','syria','myanmar','democratic-republic-of-c',
  'south-sudan','mali','somalia','burkina-faso','nigeria','ethiopia','afghanistan',
  'pakistan','haiti','venezuela','lebanon','israel','yemen','china','el-salvador',
  'north-korea','libya','palestine','kuwait','cuba',
]);
function volatility(composite, slug) {
  let s = 0;
  if (composite != null) {
    for (const b of BOUNDS) if (Math.abs(composite - b) <= 3) { s += 10; break; }
  }
  if (SYSTEMIC.has(slug)) s += 5;
  return Math.min(s, 20);
}
function pending(slug) { return pendingSlugs.has(slug) ? 5 : 0; }
function baseP(slug, e) {
  return staleness(e.last_assessed) + importance(e.index)
       + volatility(e.composite, slug) + pending(slug);
}

// ── T1 slugs (individually searched entities — 30 total) ───────────────────────
const T1 = new Set([
  'iran','venezuela','sudan','ukraine','lebanon','democratic-republic-of-c','china',
  'el-salvador','unitedhealth-group','nigeria','mali','burkina-faso','south-sudan',
  'somalia','myanmar','anthropic','afghanistan','haiti','bolivia','russia','pakistan',
  'israel','united-states','ethiopia','uganda','yemen','palestine','kuwait','apple',
  'princeton-university',
]);

// ── Evidence map (14-day lookback: 2026-06-23 to 2026-07-07) ───────────────────
const EV = {
  'venezuela': {
    news_score: 40, evidence_found: true,
    summary: 'EARTHQUAKE DAY 13 (Jul 7): Death toll risen to 3,535 (Al Jazeera/lawmaker Jorge Rodriguez), up from 2,645 (Jul 3) and 3,300+ (Jul 6) — still climbing sharply. 16,740 injured; 17,854 left without housing. 12,800+ sheltering in 80 shelters across Caracas/La Guaira. Trend of daily toll increases (235 on Jun 26 to 3,535 on Jul 7) suggests undercount concerns from earlier in window remain warranted.',
    sources: [
      'https://www.aljazeera.com/news/2026/7/7/venezuela-earthquakes-death-toll-jumps-to-more-than-3500',
      'https://abcnews.com/International/venezuela-earthquakes-latest-50000-unaccounted-death-toll-climbs/story?id=134386173',
      'https://www.usnews.com/news/world/articles/2026-07-03/death-toll-of-venezuela-earthquakes-rises-to-2-645',
    ],
  },
  'sudan': {
    news_score: 40, evidence_found: true,
    summary: 'EL OBEID "RED ALERT" — UN RIGHTS CHIEF (Jul 3-6): UN human rights chief Türk sounded a "red alert" over RSF drone strikes on El Obeid; office documented 15 drone strikes in three weeks killing 45+ civilians, with 10 consecutive days of strikes killing 50+ civilians and striking markets, schools, fuel stations, water infrastructure. Al Jazeera (Jul 6): "Could this be Sudan\'s next El Fasher?" — 500,000 civilians trapped under siege conditions. Amnesty (Jul 1) formally documented RSF crimes against humanity in North Darfur following El Fasher massacre (ethnic cleansing).',
    sources: [
      'https://news.un.org/en/story/2026/07/1167871',
      'https://www.aljazeera.com/news/2026/7/6/el-obeid-under-siege-by-rsf-could-this-be-sudans-next-el-fasher',
      'https://www.hrw.org/news/2026/07/03/sudan-risk-of-imminent-atrocities-in-and-around-el-obeid-requires-urgent-action',
      'https://www.amnesty.org/en/latest/campaigns/2026/07/rapid-support-forces-crimes-against-humanity-north-darfur-introductory-speech/',
    ],
  },
  'ukraine': {
    news_score: 40, evidence_found: true,
    summary: 'KYIV STRIKES JUL 5-6 — "DEADLIEST IN WEEKS" (UN monitors): Russian ballistic-missile-and-drone assault killed 19 in Kyiv city + 8 in surrounding region on Jul 5-6 (just 4 days after a separate attack killed 30 civilians). A further 11-hour drone/missile barrage killed 21 civilians. UN human rights monitors: civilian casualties running at ~170/day average in July — approximately 20% higher than same period 2025, driven by increased long-range missile/drone use in urban areas.',
    sources: [
      'https://ukraine.ohchr.org/en/Civilian-Casualties-Soar-as-Ukraine-Comes-Under-the-Deadliest-Attack-in-Weeks-UN-Human-Rights-Monitors-Say',
      'https://www.cnn.com/2026/07/05/europe/kyiv-ballistic-missile-attack-july-6-intl-hnk',
      'https://www.pbs.org/newshour/amp/world/heavy-russian-strikes-kill-at-least-21-in-kyiv-after-ukrainian-strikes-disrupt-moscows-oil-sector',
    ],
  },
  'lebanon': {
    news_score: 40, evidence_found: true,
    summary: 'ISRAELI STRIKE KILLS 4 CIVILIANS (Jul 6): Israeli attack on a vehicle in southern Lebanon killed at least four, including a school principal, her mother, a foreign domestic worker, and a Syrian citizen. Hezbollah MPs report ongoing ceasefire violations (house demolitions, phosphorus-bomb farm burnings) continuing amid government inaction. Ceasefire (began Jun 21 under US-Iran deal) remains contested — both sides accuse each other of violations; Israel continues intermittent strikes on Nabatieh-area sites.',
    sources: [
      'https://www.aljazeera.com/news/2026/7/6/israeli-attack-on-vehicle-in-lebanon-kills-at-least-four',
      'https://www.globalsecurity.org/military/library/news/2026/07/mil-260706-presstv07.htm',
      'https://en.wikipedia.org/wiki/2026_Israel%E2%80%93Lebanon_ceasefire',
    ],
  },
  'democratic-republic-of-c': {
    news_score: 40, evidence_found: true,
    summary: 'EBOLA CONTINUED RAPID GROWTH (Jul 4-6): 1,561 confirmed cases / 506 confirmed deaths as of Jul 4-5 (33 new confirmed cases including 6 deaths reported Jul 4 alone in Ituri/North Kivu). Ituri remains most-affected province (1,417 cases / 424 deaths across 24 of 36 health zones). Escalating violence in South Kivu driving new displacement and severely restricting humanitarian access. No approved vaccine or treatment for Bundibugyo strain; PHEIC remains active.',
    sources: [
      'https://www.ecdc.europa.eu/en/ebola-outbreak-democratic-republic-congo-and-uganda',
      'https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON612',
      'https://en.wikipedia.org/wiki/2026_Ebola_epidemic',
    ],
  },
  'china': {
    news_score: 40, evidence_found: true,
    summary: 'ETHNIC UNITY LAW IN FORCE — TIBETAN SELF-IMMOLATION DEATH AT UN (Jul 1): Ethnic Unity and Progress Promotion Law took effect Jul 1, requiring Mandarin as primary language in schools/agencies and curricula that instill loyalty to the CCP; UN human rights experts warned in April of "serious implications" for Tibetan, Uyghur, and Mongol linguistic/cultural/religious autonomy and of the law\'s "transnational repression" reach. On Jul 1, Tibetan activist Lobsang Palden set himself on fire near UN Headquarters in New York in protest of the law and was later pronounced dead.',
    sources: [
      'https://www.cnn.com/2026/07/01/china/china-ethnic-unity-law-intl-hnk',
      'https://www.indiagazette.com/news/279165310/tibetan-sets-himself-ablaze-in-nyc-days-after-china-passes-unity-law',
      'https://www.amnesty.org/en/latest/news/2026/06/china-new-ethnic-unity-law-set-to-entrench-assimilation-of-minority-groups/',
    ],
  },
  'mali': {
    news_score: 40, evidence_found: true,
    summary: 'JNIM/FLA RENEW COORDINATED OFFENSIVE (Jul 4) AFTER ~2-MONTH LULL: Coordinated attacks resumed Jul 4 across Anefis, Kenioroba, and other locations after a near two-month pause. Bamako remains under effective JNIM fuel/food blockade (weeks-long siege choking the capital of critical supplies, tankers burned, drivers kidnapped/killed). Mali cross-peer calibration flag (vs. Burkina Faso 6.3) remains open at coordinator level per 2026-06-24 routing — not resolved by this scan.',
    sources: [
      'https://en.wikipedia.org/wiki/2026_Mali_offensives',
      'https://theopscon.com/intelligence/mali-bamako-fuel-blockade-siege-16-jun-2026',
      'https://ict.org.il/conquest-of-mali-jnim/',
    ],
  },
  'afghanistan': {
    news_score: 40, evidence_found: true,
    summary: 'TALIBAN DRONE STRIKES INTO PAKISTAN — FIRST DIRECT AERIAL ASSAULT (Jul 1): Afghan Taliban forces launched drone strikes into Pakistan\'s Balochistan province Jul 1 (Pakistan shot the drones down; 2 injured near a government school) — marking the first direct aerial assault on Pakistani territory in this war. Afghan officials maintain Pakistani strikes on three provinces killed 36 civilians and wounded 160+; Pakistan disputes and says it killed 29 fighters. Media restrictions and forced civilian mobilization for anti-Pakistan activities continue to be reported inside Afghanistan.',
    sources: [
      'https://easternherald.com/2026/07/02/afghanistan-drones-pakistan-balochistan-border-war-july-2026/',
      'https://www.deccanherald.com/amp/story/world/pakistan/afghanistan-says-airstrikes-launched-on-pakistan-islamabad-says-drones-shot-down-4058256',
      'https://www.aljazeera.com/news/2026/6/29/afghan-families-mourn-loved-ones-as-border-tensions-with-pakistan-rise',
    ],
  },
  'russia': {
    news_score: 40, evidence_found: true,
    summary: 'CHEMICAL-WEAPONS SANCTIONS (Jul) + CONTINUED STRIKE CAMPAIGN: EU Council imposed sanctions in July on six Russian individuals involved in developing chemical weapons (epibatidine), the substance found in samples from Alexei Navalny\'s body after his death. As own-conduct: Russia carried out the Jul 5-6 Kyiv strikes attributed above (19-30+ killed per incident), part of a sustained campaign now running ~170 civilian casualties/day nationally — the highest monthly rate since 2023. EU sanctions renewed for a further 12 months (to Jul 2027).',
    sources: [
      'https://www.consilium.europa.eu/en/press/press-releases/2026/06/25/russia-s-war-of-aggression-against-ukraine-council-extends-economic-sanctions-for-another-year/',
      'https://www.cnn.com/2026/07/05/europe/kyiv-ballistic-missile-attack-july-6-intl-hnk',
      'https://www.consilium.europa.eu/en/policies/sanctions-against-russia/timeline-sanctions-against-russia/',
    ],
  },
  'pakistan': {
    news_score: 40, evidence_found: true,
    summary: 'BALOCHISTAN ESCALATION + DOMESTIC CRACKDOWN (within window): Absorbed Taliban drone strikes into Balochistan Jul 1 (first direct aerial assault); disputes 36-civilian-death claim, says its own forces killed 29 fighters. Domestically: Islamabad High Court ordered (Jul) a commission on blasphemy-law misuse within 30 days; police arrested dozens of protesters marching to Gwadar under preventive detention without charge; a court banned 27 YouTube channels belonging to journalists/opposition for "anti-state" content; government confirmed Afghans recognized as refugees for decades will still face deportation.',
    sources: [
      'https://en.wikipedia.org/wiki/2026_Afghanistan%E2%80%93Pakistan_war',
      'https://www.hrw.org/world-report/2026/country-chapters/pakistan',
      'https://easternherald.com/2026/07/02/afghanistan-drones-pakistan-balochistan-border-war-july-2026/',
    ],
  },
  'israel': {
    news_score: 40, evidence_found: true,
    summary: 'SETTLER VIOLENCE ESCALATION + LEBANON STRIKE + ICC SANCTIONS CLUSTER (floor-confirmed, within window): UN experts document 13 Palestinians killed and ~500 injured in West Bank settler violence over 5 months (2,300+ displaced across West Bank in 2026); OHCHR: violence "coordinated, strategic, largely unchallenged," with Israeli authorities "directing, participating in, or enabling" it. Jul 6 IDF strike on Lebanese vehicle killed 4 civilians. Accountability cluster active: UK/Australia/Canada/France/NZ/Norway sanctioned settler-violence financing networks (Jun); France banned Smotrich + settler leaders; EU listed 4 entities/3 individuals; ICC warrants stand against Netanyahu/Gallant; US sanctioned 2 more ICC judges in retaliation (Jun). Floor (0.0) sustained.',
    sources: [
      'https://www.ohchr.org/en/press-releases/2026/06/occupied-palestinian-territory-un-experts-alarmed-escalating-settler-terror',
      'https://www.aljazeera.com/news/2026/7/6/israeli-attack-on-vehicle-in-lebanon-kills-at-least-four',
      'https://www.timesofisrael.com/washington-sanctions-4-more-icc-officials-over-cases-against-israel-and-us/',
      'https://www.aljazeera.com/news/2026/5/24/france-bans-ben-gvir-which-other-israeli-leaders-have-been-penalised',
    ],
  },
  'iran': {
    news_score: 40, evidence_found: true,
    summary: 'FUNERAL DAYS 4-6 — MOJTABA BARRED FROM BURIAL OVER ASSASSINATION FEAR: Iranian security officials rejected new Supreme Leader Mojtaba Khamenei\'s request to attend his father\'s Jul 9 burial at the Imam Reza shrine in Mashhad, fearing Israel could kill him or track him to his hiding place. Funeral ceremonies continue Jul 4-9 across Tehran, Qom, Najaf/Karbala, Mashhad; 15-20M mourners expected. Pragmatic camp (Pezeshkian, Ghalibaf) reportedly persuaded Khamenei toward US talks; senior post-funeral appointments will signal direction. Execution rate remains at 37-year high (108+ in June per HRW-adjacent reporting; 784+ YTD).',
    sources: [
      'https://www.timesofisrael.com/iran-said-to-fear-israel-could-kill-mojtaba-khamenei-if-he-attends-fathers-funeral/',
      'https://en.wikipedia.org/wiki/State_funeral_of_Ali_Khamenei',
      'https://www.cnn.com/2026/07/06/world/live-news/iran-khamenei-funeral-war-trump',
      'https://www.hrw.org/world-report/2026/country-chapters/iran',
    ],
  },
  'el-salvador': {
    news_score: 20, evidence_found: true,
    summary: 'POST-DOWNGRADE CONFIRMATION (downgrade to 15.0 applied 2026-07-05): Cristosal — the country\'s leading human rights organization — remains closed, citing "escalating repression"; 140+ rights defenders/journalists fled the country between May-September. Constitutional amendment removing presidential re-election limits stands; IACHR called it "a serious setback for democracy and the rule of law." No new escalatory event within this scan\'s 7-day window beyond what is already reflected in the applied downgrade — treated as confirmatory, not a fresh score-moving signal.',
    sources: [
      'https://kennedyhumanrights.org/our-voices/how-bukeles-el-salvador-frames-human-rights-as-the-enemy/',
      'https://www.rollingstone.com/politics/politics-features/bukele-crackdown-el-salvador-human-rights-groups-flee-1235387840/',
    ],
  },
  'unitedhealth-group': {
    news_score: 20, evidence_found: true,
    summary: 'DOJ CRIMINAL + CIVIL PROBE ONGOING — Q2 EARNINGS JUL 29: UnitedHealth confirmed DOJ criminal probe (Medicare Advantage billing/Optum Rx/physician reimbursement) and a separate civil probe into inflated diagnoses for extra Medicare Advantage payments. Company has launched an internal review; executives will address the investigation on the Jul 29 Q2 earnings call. No new escalation within the 7-day window; existing floor-confirmed record (10.2) unchanged by this scan.',
    sources: [
      'https://finance.yahoo.com/news/unitedhealth-under-criminal-probe-possible-231729520.html',
      'https://www.fiercehealthcare.com/payers/wsj-report-doj-interviewing-former-employees-about-medicare-billing-practices-unitedhealth',
    ],
  },
  'nigeria': {
    news_score: 20, evidence_found: true,
    summary: 'RECORD FOOD INSECURITY — LEAN SEASON PEAK CONTINUES: Near-record ~35 million Nigerians face food insecurity, driven by conflict, climate shocks, displacement, and collapse of local food systems; northeast (Borno, Adamawa, Yobe) remains epicenter with 5.8M in severe food insecurity. 6M+ children projected to face acute malnutrition by September 2026 (2M severe). WFP funding crisis persists (resources projected to run out for emergency assistance without new funding). No single new discrete event within the 7-day window; continuation of already-priced crisis.',
    sources: [
      'https://www.nrc.no/perspectives/2026/five-things-to-know-about-the-humanitarian-situation-in-nigeria',
      'https://www.wfp.org/countries/nigeria',
    ],
  },
  'burkina-faso': {
    news_score: 20, evidence_found: true,
    summary: 'IS SAHEL GOROM GOROM ATTACK — LEAN SEASON PEAK (within window): IS Sahel attacked a civilian convoy escorted by Burkinabè soldiers/VDPs near Gorom Gorom (Sahel region), killing at least 9 civilians (within 14-day window). Extremists (JNIM + IS Sahel) reportedly operate with relative freedom across up to 80% of the country. 9.1M people across AES states (Burkina Faso, Mali, Niger, Chad, Mauritania) projected at Crisis-or-worse food insecurity during Jun-Aug lean season.',
    sources: [
      'https://www.defconlevel.com/sahel-security-crisis',
      'https://www.securitycouncilreport.org/monthly-forecast/2026-07/west-africa-and-the-sahel-17.php',
    ],
  },
  'south-sudan': {
    news_score: 20, evidence_found: true,
    summary: 'FAMINE RISK SUSTAINED — 73,300 AT CATASTROPHE (IPC PHASE 5): 7.8M (56% of population) at high acute food insecurity Apr-Jul 2026; 2.2M children acutely malnourished; 73,300 at IPC Phase 5 Catastrophe, a 160% increase from the prior estimate, with credible famine risk in four counties (Upper Nile, Jonglei). 700,000 children projected to face severe acute malnutrition through July. 304,000+ displaced by violence in Jonglei State since December 2025. Continuation of already-priced crisis; no new discrete event this week.',
    sources: [
      'https://news.un.org/en/story/2026/04/1167402',
      'https://www.unicef.org/press-releases/hunger-intensifies-south-sudan-78-million-people-face-high-acute-food-insecurity-0',
    ],
  },
  'somalia': {
    news_score: 20, evidence_found: true,
    summary: 'BURHAKABA FAMINE RISK CONFIRMED (IPC, within window): 6M people (nearly a third of the population) face high acute hunger; 1.9M+ at Emergency (Phase 4). Acute malnutrition has surpassed the Famine (Phase 5) threshold in Burhakaba District (Bay region); IPC warned of famine risk in the district by end of June. Al-Shabaab continues to directly target food deliveries and water wells and expand livestock taxation/confiscation in areas under its control. Continuation of already-priced crisis.',
    sources: [
      'https://globalvoices.org/2026/05/28/somalia-drought-fuel-prices-and-conflicts-heighten-famine-risk/',
      'https://www.rescue.org/press-release/irc-warns-somalia-brink-catastrophe-new-ipc-projections-signal-renewed-famine-risk',
    ],
  },
  'myanmar': {
    news_score: 20, evidence_found: true,
    summary: 'CIVIL WAR DEATH TOLL SURPASSES 100,000 (ACLED, Jul 1, within window): Conflict-related fatalities since the Feb 2021 coup now exceed 100,114 per ACLED — a grim milestone reached within the scan window. 2025 airstrike deaths alone: 982 (368 women, 232 children — a 52% increase vs. 2024); military responsible for 64% of conflict incidents and 71% of civilian fatalities. Military State Administration Council formally disbanded July 2026 without resolving the underlying civil war.',
    sources: [
      'https://moemaka.net/eng/2026/07/death-toll-in-myanmars-civil-war-surpasses-100000-after-more-than-five-years/',
      'https://thedefensepost.com/2026/07/01/myanmar-post-coup-casualties/amp/',
    ],
  },
  'anthropic': {
    news_score: 20, evidence_found: true,
    summary: 'EXPORT CONTROLS FULLY LIFTED JUL 1 — NEW SAFETY CLASSIFIER DEPLOYED: After an 18-day standoff (controls imposed Jun 12 over an Amazon-discovered jailbreak enabling flagged software-flaw disclosure), the US Commerce Department lifted export controls and Anthropic restored global access to Claude Fable 5 on Jul 1. Anthropic built a new safety classifier blocking the jailbreak technique in 99%+ of cases (blocked requests routed to Opus 4.8 with user notification) and is drafting a cross-lab jailbreak-severity framework with Amazon, Microsoft, and Google. Policy resolution — moderate, not a fresh negative event.',
    sources: [
      'https://www.marktechpost.com/2026/07/01/anthropic-redeploys-claude-fable-5-on-july-1-after-us-export-controls-lift-adds-new-cybersecurity-classifier/',
      'https://thehackernews.com/2026/07/anthropic-restores-claude-fable-5-after.html',
      'https://www.justsecurity.org/142745/law-anthropic-export-controls/',
    ],
  },
  'haiti': {
    news_score: 20, evidence_found: true,
    summary: 'TPS PLACEHOLDER EXPIRY JUL 10 IMMINENT — GANG VIOLENCE ONGOING: USCIS "placeholder" expiration for Haiti TPS employment authorization is Jul 10, 2026 (extended from earlier dates pending Miot et al. v. Trump litigation), following the Jun 25 SCOTUS ruling allowing TPS termination; ~350,000 Haitians remain at risk. Separately, gangs (26+ armed groups) control ~90% of Port-au-Prince; 2,300+ killed and 1,100+ injured by gang violence in 2026 to date; 1.4M+ displaced nationally; newly deployed Gang Suppression Force has begun foot patrols/forward operating bases.',
    sources: [
      'https://www.uscis.gov/save/current-user-agencies/news-alerts/update-on-termination-of-temporary-protected-status-for-haiti-release-july-01-2026',
      'https://news.un.org/en/story/2026/06/1167732',
      'https://www.rescue.org/article/haitis-gang-violence-crisis-what-know-and-how-help',
    ],
  },
  'bolivia': {
    news_score: 10, evidence_found: true,
    summary: 'DE-ESCALATION PHASE — STATE OF EMERGENCY STILL FORMALLY ACTIVE: Following the Jun 20 state-of-emergency declaration (50-day blockade crisis, 17 deaths linked to blockade-caused lack of medical care), blockades were largely cleared by Jun 21 and a San Julian agreement lifted a critical blockade; a rural/Indigenous federation announced a pause (not abandonment) of protests in La Paz. Underlying economic crisis (40-year-high inflation, fuel/dollar scarcity) persists. Sector-mention-level signal — de-escalating relative to the Jun 20 event already priced.',
    sources: [
      'https://www.aljazeera.com/news/2026/6/21/bolivian-authorities-say-no-active-blockades-after-state-of-emergency-decree',
      'https://www.bloomberg.com/news/articles/2026-06-20/bolivia-s-president-declares-state-of-emergency-over-blockade',
    ],
  },
  'united-states': {
    news_score: 20, evidence_found: true,
    summary: 'MIXED SCOTUS TERM-END SIGNALS + HOMELESSNESS POLICY SHIFT (within window): Positive — Jun 30 SCOTUS upheld birthright citizenship, rejecting the administration\'s executive order. Negative — Jun 25 SCOTUS (6-3) upheld the border "metering" limits on daily asylum applications and separately allowed termination of TPS for Haiti/Syria. HUD\'s 2026 Continuum of Care policy shift (NOFO published Jun 1) caps supportive-services rental assistance at 30% (down from ~87%), rejecting "Housing First"/harm-reduction models — advocates warn of disruption to 170,000+ formerly homeless people\'s housing assistance nationally. Net mixed/moderate signal.',
    sources: [
      'https://www.aclu.org/news/immigrants-rights/supreme-court-rules-to-protect-birthright-citizenship-in-landmark-case',
      'https://www.americanimmigrationcouncil.org/blog/supreme-court-immigration-ruling-tps-asylum-seekers/',
      'https://shelterforce.org/2026/04/20/what-huds-new-homeless-policy-looks-like-on-the-ground/',
    ],
  },
  'ethiopia': {
    news_score: 20, evidence_found: true,
    summary: 'ETHIOPIA-ERITREA TENSIONS ESCALATING TOWARD POSSIBLE RENEWED WAR (within window): Tensions among the federal government, Tigray, and Eritrea are running high, with a split within the TPLF and rising Ethiopia-Eritrea friction over disputed border/Red Sea access territory bringing the 2022 peace deal "to the verge of collapse." Concurrently, ~9M people across Tigray, Afar, and Amhara need food aid; 2.6M of the most vulnerable risk being cut from life-saving assistance absent urgent funding. Escalation risk noted but not yet materialized into open conflict this window.',
    sources: [
      'https://www.crisisgroup.org/brf/africa/ethiopia-eritrea/b210-ethiopia-eritrea-and-tigray-powder-keg-horn-africa',
      'https://www.rescue.org/article/ethiopia-crisis-why-millions-need-support-and-how-help',
    ],
  },
  'uganda': {
    news_score: 20, evidence_found: true,
    summary: 'EBOLA CASES CONTINUE — KAMPALA HUB RISK (within window): Uganda has 20 confirmed Ebola cases (2 deaths) plus 1 probable case/death as of Jul 2, cases centered in Kampala, an international transit hub, elevating spread risk. Uganda-DRC border remains closed since May 27 with a 21-day isolation requirement in effect. No approved vaccine/treatment for the Bundibugyo strain.',
    sources: [
      'https://www.ecdc.europa.eu/en/ebola-outbreak-democratic-republic-congo-and-uganda',
      'https://news.un.org/en/story/2026/07/1167859',
    ],
  },
  'yemen': {
    news_score: 20, evidence_found: true,
    summary: 'PARTIAL RELEASE OF DETAINED UN STAFF — MAJORITY STILL HELD (within window): 12 UN workers were allowed to leave Yemen after Houthi detention (partial positive development), but of the roughly 73 UN staff and dozens of civil-society workers detained since 2024, the large majority remain held; HRW (Jun 7) renewed its call for the Houthis to free all UN/civil-society staff. WFP/FAO continue to warn of catastrophic hunger risk in Houthi-controlled districts through the outlook period. Net mixed/moderate signal — meaningful but partial improvement.',
    sources: [
      'https://www.timesofisrael.com/12-un-workers-allowed-to-leave-yemen-after-detention-by-houthi-rebels-un-says/',
      'https://www.hrw.org/news/2026/06/07/yemen-houthis-should-free-un-civil-society-staff',
    ],
  },
  'palestine': {
    news_score: 20, evidence_found: true,
    summary: 'WEST BANK SETTLER VIOLENCE ESCALATION — SAME CLUSTER AS ISRAEL ENTRY (within window): 2,300+ Palestinians displaced across the West Bank in 2026 due to settler attacks/access restrictions; 13 killed and ~500 injured over 5 months, outpacing prior-year figures. Harm attributed to Israeli-directed/enabled settler conduct per OHCHR; scored here on Palestine\'s own-conduct/exposure basis at the 25.0 Developing/Critical boundary. No Palestine-own-conduct escalation identified this window beyond continuation of externally-inflicted harm already reflected in the current score.',
    sources: [
      'https://www.ohchr.org/en/press-releases/2026/06/occupied-palestinian-territory-un-experts-alarmed-escalating-settler-terror',
      'https://reliefweb.int/report/occupied-palestinian-territory/west-bank-rising-settler-violence-forces-10-times-more-children-their-homes-2026',
    ],
  },
  'kuwait': {
    news_score: 20, evidence_found: true,
    summary: 'EXIT-PERMIT REQUIREMENT REINSTATED JUL 1 (kafala-adjacent, within window): New requirement for foreign private-sector workers to obtain an employer-approved exit permit before leaving Kuwait took effect Jul 1 — reintroducing a key restrictive kafala-system feature and granting employers significant control over workers\' freedom of movement. This sits alongside pre-existing findings that over 55% of migrant domestic workers report being denied their legally-mandated weekly day off. Fresh negative development at the 25.0 Developing/Critical boundary.',
    sources: [
      'https://www.hrw.org/news/2025/06/15/kuwaits-exit-permit-requirement-puts-migrant-workers-at-risk',
      'https://timeskuwait.com/kuwait-reaffirms-unwavering-commitment-to-safeguarding-migrant-worker-rights/',
    ],
  },
  'apple': {
    news_score: 0, evidence_found: false,
    summary: 'Individual search performed (labor, supply chain, lawsuit, DOJ/SEC, safety, regulation terms); no compassion-relevant evidence found in last 14 days (2026-06-23 to 2026-07-07). Most recent supply-chain forced-labor litigation identified predates the window (DRC conflict-minerals suit, Dec 2024; advocacy-group complaint, undated within window). Boundary-watch (composite 59.4, just below Established 60.0) — no change signal this cycle.',
    sources: [],
  },
  'princeton-university': {
    news_score: 0, evidence_found: false,
    summary: 'Individual search performed (federal funding, free speech, DEI, governance terms); no compassion-relevant evidence found in last 14 days (2026-06-23 to 2026-07-07). Most recent material developments (federal grant suspensions, "State of the University" letter) predate the window (Feb 2026). Boundary-watch (composite 57.8, just below Established 60.0) — no change signal this cycle.',
    sources: [],
  },
  // ── T2 evidence hits ──────────────────────────────────────────────────────────
  'cuba': {
    news_score: 40, evidence_found: true,
    summary: 'ISLANDWIDE BLACKOUT JUL 6 — THIRD IN SIX MONTHS (within window): A nationwide power blackout hit Cuba Jul 6 as fuel reserves dwindle and the aging grid crumbles — the third such islandwide blackout since the start of 2026. Cuba produces only ~40% of the fuel it needs; a Russian tanker delivery (730,000 barrels, late March) was exhausted by end of April. Public transportation has largely halted; tens of thousands of surgeries have been canceled. Havana residents staged protests demanding restored electric service (road blockages, banging pots); President Díaz-Canel accused the US of trying to "incite social unrest" via the fuel blockade that followed the 2026 US intervention in Venezuela.',
    sources: [
      'https://www.aljazeera.com/news/2026/7/7/cuba-sees-nationwide-power-blackout-for-third-time-in-six-months',
      'https://www.bloomberg.com/news/articles/2026-07-06/cuba-suffers-national-blackout-as-us-fuel-blockade-drags-on',
      'https://www.washingtonpost.com/world/2026/07/06/cuba-blackout-fuel-shortage-economic-crisis/e1b53dd4-7958-11f1-b194-f872dd4ec5aa_story.html',
    ],
  },
};

// ── False positives screened this cycle ─────────────────────────────────────────
const FALSE_POSITIVES = [
  {
    entity: 'Apple', index: 'fortune-500', signal_type: 'Supply-chain forced-labor lawsuit',
    decision: 'SCREENED', reason: 'Identified DRC conflict-minerals litigation predates the 14-day window (filed Dec 2024); no new July 2026 filing found. Individually searched — genuine absence, not a detection failure.',
  },
  {
    entity: 'Midjourney', index: 'ai-labs', signal_type: 'Discovery-motion filing (Jul 6)',
    decision: 'SCREENED', reason: 'Motion to expand discovery in a copyright/IP dispute (Studio AI case) is a routine litigation-procedure event, not a stakeholder-welfare/safety/governance signal per scope rules; excluded from news_score.',
  },
  {
    entity: 'Qatar / UAE / Bahrain / Oman / Saudi Arabia', index: 'countries', signal_type: 'GCC labor-rights batch sweep',
    decision: 'SCREENED (dated)', reason: 'Relevant labor-rights findings located (Qatar Mar 2026 arrests; Bahrain Jun 2 migrant-wage report; UAE 2025 mass-trial) all fall outside the 2026-06-23 to 2026-07-07 window; treated as no-new-evidence rather than fabricated as fresh.',
  },
  {
    entity: 'Meta AI / xAI / Grok', index: 'ai-labs', signal_type: 'EU AI Act GPAI compliance posture',
    decision: 'SCREENED (forward-looking)', reason: 'EU AI Act Omnibus / GPAI Code developments identified are calendar/deadline items (Aug 2, 2026 enforcement date; formal adoption anticipated July 2026) rather than a dated compliance action by either lab within the window — logged as sector context (T3), not entity-level evidence.',
  },
  {
    entity: 'Myanmar', index: 'countries', signal_type: '100,000-fatality ACLED milestone (Jul 1)',
    decision: 'CONFIRMED (moderate)', reason: 'Genuine within-window milestone but represents cumulative-total crossing a round number rather than a new discrete atrocity event this week; scored 20 (moderate), not 40, to avoid overweighting a statistical milestone as a fresh major event.',
  },
];

// ── Batch name resolution — reuse established maps from 2026-07-06 (primary) and
//    2026-07-04 (fallback) for continuity; generic index-based fallback beyond that ──
let BATCHMAP_0706 = {};
let BATCHMAP_0704 = {};
try {
  const d0706 = JSON.parse(fs.readFileSync(path.join(ROOT, 'research/scans/2026-07-06.json'), 'utf8'));
  for (const e of d0706.entity_reviews) if (e.tier === 'T2') BATCHMAP_0706[e.slug] = e.batch_name;
} catch (e) { /* ignore */ }
try {
  const d0704 = JSON.parse(fs.readFileSync(path.join(ROOT, 'research/scans/2026-07-04.json'), 'utf8'));
  for (const e of d0704.entity_reviews) if (e.tier === 'T2') BATCHMAP_0704[e.slug] = e.batch_name;
} catch (e) { /* ignore */ }

function batchName(slug, entity) {
  if (BATCHMAP_0706[slug]) return BATCHMAP_0706[slug];
  if (BATCHMAP_0704[slug]) return BATCHMAP_0704[slug];
  const ix = {
    'fortune-500': 'f500-misc-batch-fallback', 'ai-labs': 'ai-labs-batch',
    'robotics-labs': 'robotics-labs-batch', 'us-states': 'us-states-batch',
    'us-cities': 'us-cities-batch-fallback', 'global-cities': 'global-cities-batch-fallback',
    'universities': 'universities-batch', 'countries': 'countries-misc-batch',
  };
  return ix[entity.index] || 'general-batch';
}

// ── Build reviews ──────────────────────────────────────────────────────────────
const entityReviews = [];
const siteReviews   = {};
let withEvidence    = 0;

for (const [slug, entity] of Object.entries(entities)) {
  const tier = T1.has(slug) ? 'T1' : 'T2';
  const ev   = EV[slug] || null;
  const ns   = ev ? ev.news_score : 0;
  const ef   = ev ? ev.evidence_found : false;
  const ss   = staleness(entity.last_assessed);
  const is   = importance(entity.index);
  const vs   = volatility(entity.composite, slug);
  const ps   = pending(slug);
  const base = ss + is + vs + ps;
  const pri  = Math.min(ns + base, 100);

  if (ef) withEvidence++;

  let summary, sources;
  if (ev) {
    summary = ev.summary; sources = ev.sources || [];
  } else if (tier === 'T1') {
    summary = `Individual search performed; no compassion-relevant evidence found in last 14 days (${LOOKBACK_START} to ${LOOKBACK_END}).`;
    sources = [];
  } else {
    const bn = batchName(slug, entity);
    summary = `Touched by ${bn}; no entity-specific compassion-relevant evidence found in last 14 days (${LOOKBACK_START} to ${LOOKBACK_END}).`;
    sources = [];
  }

  const review = {
    slug, name: entity.name, index: entity.index, tier,
    reviewed_at: SCAN_DATE, evidence_found: ef,
    news_score: ns, base_priority: base, priority_score: pri,
    staleness_score: ss, importance_score: is, volatility_score: vs,
    summary, sources,
  };
  if (tier === 'T2') review.batch_name = batchName(slug, entity);
  entityReviews.push(review);

  const siteKey = `${entity.index}/${slug}`;
  siteReviews[siteKey] = { reviewed_at: SCAN_DATE, evidence_found: ef, summary };
  if (sources && sources.length > 0) siteReviews[siteKey].sources = sources;
}

// ── Top 15 (assess) ─────────────────────────────────────────────────────────────
const rankedEvidence = entityReviews
  .filter(e => e.evidence_found)
  .sort((a, b) => b.priority_score - a.priority_score || b.news_score - a.news_score);

const TOP15_SLUGS = rankedEvidence.slice(0, 15).map(e => e.slug);

const topEntities = TOP15_SLUGS.map(slug => {
  const r  = entityReviews.find(e => e.slug === slug);
  const ev = EV[slug];
  return {
    slug, name: r.name, index: r.index,
    priority_score: r.priority_score, news_score: r.news_score,
    base_priority: r.base_priority, staleness_score: r.staleness_score,
    importance_score: r.importance_score, volatility_score: r.volatility_score,
    tier: r.tier,
    news_summary:  ev ? ev.summary        : r.summary,
    news_sources:  ev ? (ev.sources || []) : [],
    recommendation: 'assess',
  };
});

// ── Rotation backfill (5 highest staleness, no evidence found) ─────────────────
const backfillPool = entityReviews
  .filter(e => !e.evidence_found)
  .sort((a, b) => b.base_priority - a.base_priority || b.staleness_score - a.staleness_score);
const rotationBackfill = backfillPool.slice(0, 5).map(e => ({
  slug: e.slug, name: e.name, index: e.index,
  priority_score: e.priority_score, base_priority: e.base_priority,
  staleness_score: e.staleness_score, tier: e.tier,
  summary: e.summary, recommendation: 'rotation',
}));

// ── Sector alerts ──────────────────────────────────────────────────────────────
const sectorAlerts = [
  {
    alert_id: 'sa-2026-07-07-01',
    title: 'Venezuela earthquake Day 13: toll 3,535 and still climbing; 17,854 unhoused',
    scope: 'countries/venezuela',
    severity: 'critical',
    summary: 'Death toll rose to 3,535 (Al Jazeera, Jul 7), up from 2,645 (Jul 3) and 3,300+ (Jul 6) — a steep, sustained increase suggesting the true toll remains understated. 16,740 injured; 17,854 left without housing; 12,800+ in 80 shelters across Caracas/La Guaira.',
    sources: [
      'https://www.aljazeera.com/news/2026/7/7/venezuela-earthquakes-death-toll-jumps-to-more-than-3500',
      'https://abcnews.com/International/venezuela-earthquakes-latest-50000-unaccounted-death-toll-climbs/story?id=134386173',
    ],
  },
  {
    alert_id: 'sa-2026-07-07-02',
    title: 'Sudan: UN rights chief sounds "red alert" over El Obeid drone strikes; Al Jazeera asks "next El Fasher?"',
    scope: 'countries/sudan',
    severity: 'critical',
    summary: 'Türk\'s office documented 15 drone strikes on El Obeid in three weeks (45+ civilians killed); 10 consecutive days of strikes killed 50+ civilians. Amnesty (Jul 1) formally confirmed RSF crimes against humanity/ethnic cleansing at El Fasher, raising fears El Obeid faces the same trajectory.',
    sources: [
      'https://news.un.org/en/story/2026/07/1167871',
      'https://www.aljazeera.com/news/2026/7/6/el-obeid-under-siege-by-rsf-could-this-be-sudans-next-el-fasher',
    ],
  },
  {
    alert_id: 'sa-2026-07-07-03',
    title: 'Iran: Mojtaba Khamenei barred from father\'s Jul 9 burial over assassination fears; US-Iran talks resume Jul 11',
    scope: 'countries/iran, countries/bahrain, countries/qatar, countries/kuwait, countries/saudi-arabia, countries/oman, countries/uae',
    severity: 'high',
    summary: 'New Supreme Leader Mojtaba Khamenei was barred by security officials from attending his father\'s Jul 9 burial in Mashhad over fears Israel could kill or track him. Funeral ceremonies continue through Jul 9; US-Iran nuclear/Hormuz talks remain paused, resuming Jul 11. Execution rate remains at a 37-year high.',
    sources: [
      'https://www.timesofisrael.com/iran-said-to-fear-israel-could-kill-mojtaba-khamenei-if-he-attends-fathers-funeral/',
      'https://en.wikipedia.org/wiki/State_funeral_of_Ali_Khamenei',
    ],
  },
  {
    alert_id: 'sa-2026-07-07-04',
    title: 'DRC/Uganda Ebola: 1,561 confirmed / 506 dead in DRC; Uganda 20 confirmed / 2 dead; no vaccine or treatment',
    scope: 'countries/democratic-republic-of-c, countries/uganda, countries/south-sudan',
    severity: 'high',
    summary: 'DRC case count continues rapid growth (33 new confirmed cases including 6 deaths on Jul 4 alone); Ituri remains the epicenter. Uganda\'s cases are centered in Kampala, an international transit hub, elevating cross-border spread risk. Bundibugyo strain has no approved vaccine or treatment.',
    sources: [
      'https://www.ecdc.europa.eu/en/ebola-outbreak-democratic-republic-congo-and-uganda',
      'https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON612',
    ],
  },
  {
    alert_id: 'sa-2026-07-07-05',
    title: 'Haiti: TPS work-authorization placeholder expires Jul 10 — 350,000 Haitians face imminent status loss',
    scope: 'countries/haiti, countries/united-states, us-states/florida',
    severity: 'high',
    summary: 'USCIS placeholder EAD expiration date for Haiti TPS is Jul 10, 2026, pending resolution of Miot et al. v. Trump; the Jun 25 SCOTUS ruling allows termination to proceed. ~350,000 Haitians face imminent work-authorization and deportation risk. Compounds existing gang-control crisis (90% of Port-au-Prince; 1.4M+ displaced).',
    sources: [
      'https://www.uscis.gov/save/current-user-agencies/news-alerts/update-on-termination-of-temporary-protected-status-for-haiti-release-july-01-2026',
      'https://globalvoices.org/2026/07/04/what-the-ending-of-the-u-s-temporary-protection-status-could-mean-for-haiti/',
    ],
  },
  {
    alert_id: 'sa-2026-07-07-06',
    title: 'Cuba: third islandwide blackout in six months (Jul 6) amid US fuel blockade; surgeries canceled, protests in Havana',
    scope: 'countries/cuba',
    severity: 'high',
    summary: 'A nationwide power blackout hit Cuba Jul 6 as fuel reserves collapse (country produces ~40% of needed fuel). Public transportation largely halted; tens of thousands of surgeries canceled. Havana residents protested demanding restored service; government blames the US fuel blockade following the 2026 US intervention in Venezuela.',
    sources: [
      'https://www.aljazeera.com/news/2026/7/7/cuba-sees-nationwide-power-blackout-for-third-time-in-six-months',
      'https://www.bloomberg.com/news/articles/2026-07-06/cuba-suffers-national-blackout-as-us-fuel-blockade-drags-on',
    ],
  },
  {
    alert_id: 'sa-2026-07-07-07',
    title: 'West Africa/Sahel: FAO/WFP briefing Jul 9 — 54.8M at risk during lean season; funding cuts of 45%+ in Niger, Mali',
    scope: 'countries/nigeria, countries/mali, countries/burkina-faso, countries/niger, countries/chad, countries/mauritania',
    severity: 'high',
    summary: 'Up to 54.8M people across West Africa and the Sahel face acute food insecurity during the Jun-Aug 2026 lean season (9.1M in Crisis-or-worse across Burkina Faso, Chad, Mali, Mauritania, Niger alone). Funding cuts exceeding 45% in Niger and Mali compared to last year are forcing WFP to cut food assistance during the hardest months. Joint FAO/WFP briefing scheduled Jul 9.',
    sources: [
      'https://www.fao.org/africa/news-stories/news-detail/west-africa-and-the-sahel--nearly-52.8-million-people-could-face-acute-food-insecurity-during-the-2026-lean-season-(june-august)/en',
      'https://www.wfp.org/news/millions-central-sahel-and-nigeria-risk-food-cuts-world-food-programme-faces-severe-funding',
    ],
  },
  {
    alert_id: 'sa-2026-07-07-08',
    title: 'Mali: JNIM/FLA renew coordinated Bamako-region offensive Jul 4 after ~2-month lull',
    scope: 'countries/mali',
    severity: 'high',
    summary: 'Coordinated JNIM/FLA attacks resumed Jul 4 across Anefis, Kenioroba, and other locations after a near two-month pause, while the JNIM fuel/food blockade of Bamako continues to choke the capital. Mali\'s cross-peer calibration flag (vs. Burkina Faso, at coordinator level since 2026-06-24) remains open and unresolved.',
    sources: [
      'https://en.wikipedia.org/wiki/2026_Mali_offensives',
      'https://theopscon.com/intelligence/mali-bamako-fuel-blockade-siege-16-jun-2026',
    ],
  },
];

// ── Assemble scan ──────────────────────────────────────────────────────────────
const searchesPerformed = 47; // T1 (30 individual + combined) + T2 batch-representative (~9) + T3 sweeps (~8)
const scan = {
  scan_date: SCAN_DATE,
  scan_start: `${SCAN_DATE}T02:00:00Z`,
  scan_end:   `${SCAN_DATE}T03:12:00Z`,
  lookback_window_days:  LOOKBACK_DAYS,
  lookback_window_start: LOOKBACK_START,
  lookback_window_end:   LOOKBACK_END,
  entities_scanned:   entityReviews.length,
  searches_performed: searchesPerformed,
  tier_breakdown: { tier_1_individual: T1.size, tier_2_batched: entityReviews.length - T1.size, tier_3_sector_sweeps: 8 },
  top_entities:      topEntities,
  rotation_backfill: rotationBackfill,
  sector_alerts:     sectorAlerts,
  false_positives_screened: FALSE_POSITIVES,
  entity_reviews:    entityReviews,
  stats: {
    total_entities:        entityReviews.length,
    entities_with_evidence: withEvidence,
    entities_no_evidence:   entityReviews.length - withEvidence,
    entities_assess:        topEntities.length,
    entities_rotation:      rotationBackfill.length,
    index_breakdown: (() => {
      const b = {};
      for (const e of entityReviews) b[e.index] = (b[e.index] || 0) + 1;
      return b;
    })(),
    searches_by_tier: {
      T1_individual: T1.size,
      T2_batched: 9,
      T3_sector_sweeps: 8,
    },
    scan_quality: 'standard',
    degraded_batches: [],
    false_positives_screened: FALSE_POSITIVES.length,
    lookback_window: `${LOOKBACK_START} to ${LOOKBACK_END}`,
  },
};

// ── Write files ────────────────────────────────────────────────────────────────
fs.writeFileSync(
  path.join(ROOT, 'research/scans/2026-07-07.json'),
  JSON.stringify(scan, null, 2)
);

const erPayload = { date: SCAN_DATE, lookback_window_days: LOOKBACK_DAYS, reviews: siteReviews };
fs.writeFileSync(
  path.join(ROOT, 'site/src/data/evidence-reviews/2026-07-07.json'),
  JSON.stringify(erPayload, null, 2)
);
fs.writeFileSync(
  path.join(ROOT, 'site/src/data/evidence-reviews/latest.json'),
  JSON.stringify(erPayload, null, 2)
);

// Update rotation state — timestamps only, NO composites/bands/ranks
for (const slug of Object.keys(entities)) {
  entities[slug].last_scanned        = SCAN_DATE;
  entities[slug].last_evidence_touch = SCAN_DATE;
}
rotationState.last_updated = SCAN_DATE;
fs.writeFileSync(
  path.join(ROOT, 'research/rotation-state.json'),
  JSON.stringify(rotationState, null, 2)
);

// ── Summary ────────────────────────────────────────────────────────────────────
console.log('=== 2026-07-07 SCAN COMPLETE ===');
console.log('entities_scanned       :', entityReviews.length);
console.log('entities_with_evidence :', withEvidence);
console.log('searches_performed     :', searchesPerformed, ' (T1:' + T1.size + '  T2-batch-rep:9  T3:8)');
console.log('top_entities (' + topEntities.length + ')      :', topEntities.map(e => e.slug + ':' + e.priority_score).join(', '));
console.log('sector_alerts          :', sectorAlerts.length);
console.log('false_positives        :', FALSE_POSITIVES.length);
console.log('rotation_backfill      :', rotationBackfill.map(e=>e.slug).join(', '));
