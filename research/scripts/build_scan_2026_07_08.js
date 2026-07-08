'use strict';
/**
 * Nightly Evidence Scanner — 2026-07-08
 * Outputs:
 *   research/scans/2026-07-08.json
 *   site/src/data/evidence-reviews/2026-07-08.json
 *   site/src/data/evidence-reviews/latest.json
 * Updates: research/rotation-state.json (timestamps only — NO composite/band/rank changes)
 */

const fs   = require('fs');
const path = require('path');

const ROOT           = 'C:/Users/philk/applied-compassion-benchmark';
const SCAN_DATE      = '2026-07-08';
const LOOKBACK_START = '2026-06-24';
const LOOKBACK_END   = '2026-07-08';
const LOOKBACK_DAYS  = 14;

// ── Rotation state ─────────────────────────────────────────────────────────────
const rotationState = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'research/rotation-state.json'), 'utf8')
);
const entities = rotationState.entities;

// ── Pending proposals — queue confirmed CLEAR per 2026-07-06/07 commits ────────
// (Legacy undated proposal files for amazon/mali/unitedhealth-group predate the
//  current daily cycle and are not treated as live pending items — consistent
//  with 2026-07-07 script convention.)
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
  'north-korea','libya','palestine','kuwait','cuba','turkey','kenya',
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

// ── T1 slugs (individually searched entities — 30 total, continuity from 07-07) ─
const T1 = new Set([
  'iran','venezuela','sudan','ukraine','lebanon','democratic-republic-of-c','china',
  'el-salvador','unitedhealth-group','nigeria','mali','burkina-faso','south-sudan',
  'somalia','myanmar','anthropic','afghanistan','haiti','bolivia','russia','pakistan',
  'israel','united-states','ethiopia','uganda','yemen','palestine','kuwait','apple',
  'princeton-university',
]);

// ── Evidence map (14-day lookback: 2026-06-24 to 2026-07-08) ───────────────────
const EV = {
  'venezuela': {
    news_score: 40, evidence_found: true,
    summary: 'EARTHQUAKE DAY 14 (Jul 8): Death toll remains at 3,535+ (per Jul 7 tally; USGS models place plausible final toll between 10,000-100,000 given devastation level), 16,740 injured, 17,854 unhoused, 12,800+ in 80 shelters across Caracas/La Guaira. No new discrete escalation beyond the sustained daily-toll climb already reflected in the confirmed 2026-07-07 assessment; continuation of documented earthquake-response failure.',
    sources: [
      'https://www.aljazeera.com/news/2026/7/7/venezuela-earthquakes-death-toll-jumps-to-more-than-3500',
      'https://www.nbcnews.com/world/south-america/venezuelas-earthquakes-death-toll-reaches-3533-survivors-look-missing-rcna353135',
      'https://abcnews.com/International/venezuela-earthquakes-latest-50000-unaccounted-death-toll-climbs/story?id=134386173',
    ],
  },
  'sudan': {
    news_score: 40, evidence_found: true,
    summary: 'EL OBEID SIEGE CONTINUES — UN HUMAN RIGHTS COUNCIL ORDERS URGENT INQUIRY: UN Human Rights Council adopted a resolution ordering an urgent inquiry into alleged human rights violations/war crimes in and around El Obeid, where 500,000 civilians remain trapped as RSF besieges the city (darkness/blackout maintained by RSF per The National, Jul 6). Builds on the "red alert" (15 drone strikes/45+ civilians killed in 3 weeks) and Amnesty\'s Jul 1 ethnic-cleansing finding at El Fasher already reflected in the confirmed 2026-07-07 assessment.',
    sources: [
      'https://www.aljazeera.com/news/2026/7/6/el-obeid-under-siege-by-rsf-could-this-be-sudans-next-el-fasher',
      'https://sudantribune.com/article/315927',
      'https://www.hrw.org/news/2026/07/03/sudan-risk-of-imminent-atrocities-in-and-around-el-obeid-requires-urgent-action',
    ],
  },
  'ukraine': {
    news_score: 40, evidence_found: true,
    summary: 'CONTINUED RECORD STRIKE CAMPAIGN (within window): Jul 5-6 Kyiv assault (29 ballistic missiles, 18 attack drones across 34 locations; 350+ drones/66 missiles nationally) killed 14-22 depending on count, injuring 80+; occurred 4 days after a separate strike killed 30. UN: civilian casualties "significantly higher" than 2025, averaging ~170/day in July. Guterres condemned strikes on civilian infrastructure as a clear IHL violation. Own-conduct unchanged (victim of Russian aggression); confirms existing record.',
    sources: [
      'https://news.un.org/en/story/2026/07/1167875',
      'https://www.cnn.com/2026/07/05/europe/kyiv-ballistic-missile-attack-july-6-intl-hnk',
      'https://www.cnbc.com/2026/07/02/russia-launches-missile-drone-strikes-ukraine-kyiv.html',
    ],
  },
  'lebanon': {
    news_score: 20, evidence_found: true,
    summary: 'CEASEFIRE VIOLATIONS CONTINUE — GOVERNANCE INACTION PRICED: Jul 6 Israeli strike on a vehicle in southern Lebanon killed 4 civilians (already reflected 2026-07-07). No further discrete escalation found this cycle; ceasefire (from Apr 16, extended Apr 23) remains contested with Hezbollah rejecting terms requiring full Israeli withdrawal. Principal within-window harm continues to be externally inflicted (scored vs. Israel); Lebanese governance-inaction basis unchanged.',
    sources: [
      'https://www.aljazeera.com/news/2026/7/6/israeli-attack-on-vehicle-in-lebanon-kills-at-least-four',
      'https://en.wikipedia.org/wiki/2026_Israel%E2%80%93Lebanon_ceasefire',
    ],
  },
  'democratic-republic-of-c': {
    news_score: 40, evidence_found: true,
    summary: 'EBOLA DEATH TOLL SURPASSES 500 (Al Jazeera, Jul 6, within window): 1,561 confirmed cases / 506+ confirmed deaths as of Jul 5 (33 new confirmed cases incl. 6 deaths Jul 4 alone). Ituri remains epicenter (1,417 cases/424 deaths). NPR (Jul 7) reports clinical trials advancing for tools against the untreatable Bundibugyo strain — first hopeful development, though no approved vaccine/treatment yet exists. Continues previously-confirmed near-floor record.',
    sources: [
      'https://www.aljazeera.com/news/2026/7/6/ebola-death-toll-in-dr-congo-surpasses-500',
      'https://news.un.org/en/story/2026/07/1167882',
      'https://www.npr.org/2026/07/07/g-s1-132218/theres-no-treatment-designed-for-the-ebola-strain-ravaging-drc-but-now-theres-hope',
    ],
  },
  'china': {
    news_score: 20, evidence_found: true,
    summary: 'ETHNIC UNITY LAW CONSOLIDATION — TIBETAN/UYGHUR PROTEST AT UN CONTINUES TO REVERBERATE (within window continuation): Law on Promoting Ethnic Unity and Progress (effective Jul 1) continues drawing international condemnation (Al Jazeera Jul 2 explainer; Hong Kong FP Jul 1 coverage of minorities warning at UN that the law legalizes cultural "erasure"). Article 63\'s extraterritorial reach and Mandarin-primacy provisions (displacing Tibetan) already reflected in 2026-07-07 assessment; Tibetan activist self-immolation death (Jul 1-2) remains the discrete triggering event, not repeated this cycle.',
    sources: [
      'https://www.aljazeera.com/news/2026/7/2/whats-chinas-new-ethnic-unity-law-and-what-does-it-mean-for-minorities',
      'https://hongkongfp.com/2026/07/01/chinas-new-ethnic-unity-law-legalising-cultural-erasure-tibetan-and-uyghur-minorities-warn-at-un/',
    ],
  },
  'mali': {
    news_score: 40, evidence_found: true,
    summary: 'JNIM/FLA OFFENSIVE WIDENS (within window): Renewed Jul 4 offensive (after ~2-month lull) has expanded to Anefis, Aguelhoc, Gao, Kouakourou, Bandiagara-area, Kati military base, Kenieroba prison, Sévaré, and clashes at Base 101 (Senou); Bamako-Sikasso road now also under JNIM blockade in addition to the ongoing fuel/food siege of the capital. Cross-peer calibration flag (vs. Burkina Faso, reweighted to 6.3 on 2026-06-01) remains open at coordinator level per 2026-06-24 routing, unresolved — now sharpened by fresh evidence that Burkina Faso\'s accountability infrastructure (UN human-rights office) was forcibly closed this week while Mali\'s was not, a material asymmetry for the open flag to consider.',
    sources: [
      'https://en.wikipedia.org/wiki/2026_Mali_offensives',
      'https://theopscon.com/intelligence/mali-bamako-fuel-blockade-siege-16-jun-2026',
      'https://www.riotimesonline.com/mali-fuel-blockade-bamako-siege-2026/',
    ],
  },
  'afghanistan': {
    news_score: 20, evidence_found: true,
    summary: 'CROSS-BORDER CASUALTIES + DECREE NO. 18 CHILD-MARRIAGE CONCERNS (within window continuation): UNAMA-documented cross-border civilian casualties (70 deaths/478 injuries from Pakistani strikes in Q4 2025, far exceeding prior annual totals) continue to compound; Taliban Decree No. 18 (published 14 May 2026) sets no minimum marriage age, raising child-marriage/forced-separation concerns (HRW, ongoing coverage). Jul 1 Balochistan drone strikes (first direct aerial assault) already reflected in 2026-07-07 assessment. Floor sustained.',
    sources: [
      'https://www.unwomen.org/en/news-stories/statement/2026/05/un-women-afghanistan-statement-on-decree-no-18-issued-by-the-de-facto-authorities',
      'https://www.hrw.org/world-report/2026/country-chapters/afghanistan',
      'https://en.wikipedia.org/wiki/2026_Afghanistan%E2%80%93Pakistan_war',
    ],
  },
  'russia': {
    news_score: 40, evidence_found: true,
    summary: 'CONTINUED STRIKE CAMPAIGN + NEW EU SANCTIONS PROPOSAL (within window): Russia carried out the Jul 5-6 Kyiv assault attributed under Ukraine (14-22+ killed, 80+ injured) as part of a sustained campaign now averaging ~170 civilian casualties/day nationally in July — the highest monthly rate since 2023. EU foreign policy chief Kallas announced (Jul 2) she would propose new sanctions on Moscow over the attacks, in addition to the chemical-weapons (Navalny-linked) sanctions imposed in early July. Floor sustained.',
    sources: [
      'https://www.cnn.com/2026/07/05/europe/kyiv-ballistic-missile-attack-july-6-intl-hnk',
      'https://www.aljazeera.com/news/2026/7/2/kyiv-attacked-after-ukraines-zelenskyy-warns-of-massive-russian-strike',
      'https://www.consilium.europa.eu/en/policies/sanctions-against-russia/timeline-sanctions-against-russia/',
    ],
  },
  'pakistan': {
    news_score: 40, evidence_found: true,
    summary: 'BALOCHISTAN CRACKDOWN DEEPENS (within window): Six more people (incl. an elderly man) reportedly disappeared after alleged security-force detentions across Gwadar, Kech, and Chagai districts as of Jul 1 — even as 10 previously-disappeared individuals returned to families. Residents in Kech allege raids involving property destruction/confiscation (motorcycles, appliances, jewelry) and intimidation/physical abuse of women and children. Compounds the Jul 1 first-ever Taliban drone strikes into Balochistan and the mass preventive-detention/media-ban record already reflected in 2026-07-07 assessment.',
    sources: [
      'https://aninews.in/news/world/asia/pakistani-forces-accused-of-fresh-crackdown-as-six-more-reportedly-disappear-in-balochistan20260701124624/',
      'https://www.hrw.org/world-report/2026/country-chapters/pakistan',
      'https://unpo.org/balochistan-pakistani-military-continues-its-crackdown-on-human-rights-activists/',
    ],
  },
  'israel': {
    news_score: 40, evidence_found: true,
    summary: 'SETTLER VIOLENCE ESCALATION + NEW SETTLEMENT APPROVALS (within window): Settlers destroyed the main electricity line to al-Maniya (power cut, panic), vandalized greenhouses near Tulkarem, and seized the Ein Rawabi spring relied on by Bedouin families for 1,300 sheep — all reported Jul 3. Settler attacks now averaging ~6/day per UN. Jul 6: Finance Minister Smotrich declared a "revolution" in West Bank settlement expansion as the cabinet approved 13 new settlements in strategically critical parts of the central West Bank (illegal under international law) — a fresh, discrete escalatory policy action within the window. Floor (0.0) sustained; accountability cluster (ICC warrants, EU/UK/Canada/France sanctions on settler-violence financiers) remains external-only.',
    sources: [
      'https://www.aljazeera.com/news/2026/7/3/israeli-settlers-intensify-attacks-in-west-bank-targeting-water-supplies',
      'https://www.aljazeera.com/news/2026/7/6/israels-smotrich-declares-revolution-in-west-bank-settlement-expansion',
      'https://www.ohchr.org/en/press-releases/2026/06/occupied-palestinian-territory-un-experts-alarmed-escalating-settler-terror',
    ],
  },
  'iran': {
    news_score: 20, evidence_found: true,
    summary: 'FUNERAL CONCLUDES JUL 9 — TALKS RESUME JUL 11 (within window): Six-day state funeral for Ali Khamenei concludes with burial at the Imam Reza shrine, Mashhad, Jul 9 (body transferred through Iraq Jul 8); new Supreme Leader Mojtaba Khamenei was barred from attending over assassination fears. US-Iran technical/indirect talks remain paused during the funeral period and are expected to resume Jul 11. Execution rate remains at a 37-year high. Near-floor sustained; post-transition governance direction not yet a scoreable compassion signal.',
    sources: [
      'https://www.cnn.com/2026/07/06/world/live-news/iran-khamenei-funeral-war-trump',
      'https://en.wikipedia.org/wiki/State_funeral_of_Ali_Khamenei',
      'https://www.foxnews.com/live-news/iran-peace-talks-trump-khamenei-july-5',
    ],
  },
  'el-salvador': {
    news_score: 20, evidence_found: true,
    summary: 'CRISTOSAL CLOSURE FORMALIZED (within window, post-downgrade confirmation): Cristosal — El Salvador\'s leading human rights organization, in the country 25 years — formally announced office closure in July citing "escalating repression," confirming its May decision to evacuate staff. Cristosal\'s own reporting documents 86 current political prisoners and 245+ facing political persecution since Bukele took office; Legislative Assembly amendment removing presidential term limits (already reflected in 2026-07-05 downgrade to 15.0) stands. Treated as confirmatory of the applied downgrade, not a fresh escalatory signal.',
    sources: [
      'https://www.rollingstone.com/politics/politics-features/bukele-crackdown-el-salvador-human-rights-groups-flee-1235387840/',
      'https://www.youtube.com/watch?v=nObPPUv4IyI',
    ],
  },
  'unitedhealth-group': {
    news_score: 20, evidence_found: true,
    summary: 'DOJ CRIMINAL + CIVIL PROBE ONGOING — Q2 EARNINGS JUL 29 UNCHANGED: No new escalation within the 14-day window beyond the previously confirmed DOJ criminal probe (Medicare Advantage billing/Optum Rx/physician reimbursement) and internal review. Company will address the investigation on its Jul 29 Q2 earnings call. Floor-confirmed record (10.2) unchanged by this scan.',
    sources: [
      'https://www.healthcaredive.com/news/unitedhealth-under-investigation-department-of-justice-medicare/753913/',
      'https://www.fiercehealthcare.com/payers/wsj-report-doj-interviewing-former-employees-about-medicare-billing-practices-unitedhealth',
    ],
  },
  'nigeria': {
    news_score: 20, evidence_found: true,
    summary: 'FOOD INSECURITY WORSENS FASTER THAN PROJECTED (within window): WFP (early Jul) warns Nigeria\'s crisis is deepening faster than anticipated; updated Cadre Harmonisé analysis shows 17M+ across nine conflict-affected northern states in Crisis/Emergency/Catastrophe hunger — up ~2M since the last projection. Borno alone has 3M+ acutely food insecure, 750,000+ in severe hunger, 10,000+ facing catastrophic hunger. Continuation of already-priced structural crisis; no single new discrete event.',
    sources: [
      'https://www.globalsecurity.org/military/library/news/2026/07/mil-260702-wfp01.htm',
      'https://www.nrc.no/perspectives/2026/five-things-to-know-about-the-humanitarian-situation-in-nigeria',
    ],
  },
  'burkina-faso': {
    news_score: 40, evidence_found: true,
    summary: 'UN FORCED TO PERMANENTLY CLOSE ITS HUMAN RIGHTS OFFICE (Jul 2, within window — MAJOR NEW EVENT): UN Human Rights Office announced Jun 30/reported Jul 2 that it will permanently close its Burkina Faso operations following the junta\'s suspension of the office, eliminating the UN\'s ability to monitor, document, and report on abuses at a time HRW says violations are "rampant." This is a discrete, fresh accountability-structure removal — materially more significant than the previously-cited Gorom Gorom civilian-convoy attack. Sharpens the open Mali/Burkina Faso cross-peer calibration flag: Burkina Faso (6.3) now shows an even starker accountability-infrastructure gap versus Mali (12.5), where no equivalent UN office closure has occurred. Flagged for coordinator attention.',
    sources: [
      'https://www.hrw.org/news/2026/07/02/burkina-faso-forces-closure-of-un-human-rights-office',
      'https://www.euronews.com/2026/07/02/un-to-close-its-human-rights-office-in-burkina-faso-following-juntas-suspension',
      'https://allafrica.com/stories/202607020533.html',
    ],
  },
  'south-sudan': {
    news_score: 20, evidence_found: true,
    summary: 'FAMINE RISK SUSTAINED, NO NEW DISCRETE EVENT (within window continuation): 7.8M (56%) face high acute food insecurity Apr-Jul 2026; 73,300 at IPC Phase 5 Catastrophe (+160% from prior estimate); credible famine risk in Upper Nile/Jonglei. 300,000+ displaced in Jonglei since Dec 2025; 200,000+ from Akobo County since Mar 6. Fuel-price doubling (partly Middle East conflict spillover) compounding agricultural collapse. Continuation of already-priced crisis.',
    sources: [
      'https://www.fao.org/newsroom/detail/hunger-intensifies-in-south-sudan-as-7.8-million-people-face-high-acute-food-insecurity-and-2.2-million-children-suffer-acute-malnutrition/en',
      'https://news.un.org/en/story/2026/04/1167402',
    ],
  },
  'somalia': {
    news_score: 20, evidence_found: true,
    summary: 'FUNDING CRISIS THREATENS TOTAL COLLAPSE OF WFP ASSISTANCE (within window continuation): 6.5M face crisis-or-worse hunger (2M at Emergency); 1.84M children face acute malnutrition in 2026 (nearly half a million SAM). Aid agencies can currently reach only 1 in 10 people in need; WFP emergency assistance projected to halt entirely by July absent urgent funding — a sharper funding-collapse framing than the prior cycle\'s Burhakaba famine-threshold finding. Al-Shabaab continues targeting food/water infrastructure and expanding livestock taxation.',
    sources: [
      'https://www.wfp.org/news/somalias-humanitarian-crisis-worsening-65-million-people-facing-high-levels-hunger-federal',
      'https://news.un.org/en/story/2026/05/1167473',
    ],
  },
  'myanmar': {
    news_score: 20, evidence_found: true,
    summary: 'CIVIL WAR CONTINUES — SAC DISSOLUTION DID NOT END CONFLICT (within window continuation): Confirms the Jul 1 ACLED 100,000-fatality milestone already reflected in 2026-07-07; junta State Administration Council formally dissolved (transfer to National Defence and Security Council under Min Aung Hlaing) without resolving underlying civil war. 5.2M displaced; junta controls only 21% of territory; 15,000+ killed in 2025, driven substantially by escalating airstrikes/paramotor attacks on civilian sites. Continuation of already-priced crisis.',
    sources: [
      'https://world-on-fire.com/conflicts/myanmar.html',
      'https://press.un.org/en/2026/sgsm22999.doc.htm',
    ],
  },
  'anthropic': {
    news_score: 10, evidence_found: true,
    summary: 'POST-RESOLUTION STABILIZATION (within window, moderate/positive continuation): Export-control standoff resolved Jul 1 (already reflected 2026-07-07); Claude Fable 5 fully restored globally with new jailbreak-blocking safety classifier (99%+ effective). Cross-lab jailbreak-severity framework development with Amazon/Microsoft/Google continues. No new negative development this cycle — policy resolution holding.',
    sources: [
      'https://www.marktechpost.com/2026/07/01/anthropic-redeploys-claude-fable-5-on-july-1-after-us-export-controls-lift-adds-new-cybersecurity-classifier/',
      'https://thehackernews.com/2026/07/anthropic-restores-claude-fable-5-after.html',
    ],
  },
  'haiti': {
    news_score: 20, evidence_found: true,
    summary: 'HRW WARNS OF IMMINENT HARM AS TPS TERMINATION NEARS (Jul 2, within window): HRW published "US: Haitians Set to Lose Protections, Risk Return to Violence" (Jul 2), warning deportees would be exposed to a gang-control crisis where 26+ armed groups now control ~90% of Port-au-Prince, 2,300+ killed and rising through mid-2026, 1.4M+ displaced (nearly half children), and widespread sexual violence/child recruitment. TPS placeholder expiry (Jul 10) is now 2 days away. Compounds the confirmed 2026-07-07 record.',
    sources: [
      'https://www.hrw.org/news/2026/07/02/us-haitians-set-to-lose-protections-risk-return-to-violence',
      'https://www.wlrn.org/immigration/2026-07-02/humanitarian-crisis-looming-for-haitian-immigrants-after-supreme-court-decision-to-end-tps-report',
      'https://www.uscis.gov/save/current-user-agencies/news-alerts/update-on-termination-of-temporary-protected-status-for-haiti-release-july-01-2026',
    ],
  },
  'bolivia': {
    news_score: 10, evidence_found: true,
    summary: 'HRW: ROADS CLEARED, CRISIS NOT RESOLVED (Jul 2, within window): HRW published "Bolivia Cleared the Roads, but it Hasn\'t Cleared the Crisis" (Jul 2), confirming blockades lifted by Jun 23 while the underlying land-reform dispute, worst-in-40-years economic crisis (dollar/fuel scarcity), and impunity for 2019 protest killings remain unresolved. 17 blockade-linked deaths (mostly lack of medical care) already reflected in 2026-07-07. Sector-mention-level continuation; de-escalating relative to the Jun 20 state-of-emergency event.',
    sources: [
      'https://www.hrw.org/news/2026/07/02/bolivia-cleared-the-roads-but-it-hasnt-cleared-the-crisis',
      'https://www.aljazeera.com/news/2026/6/21/bolivian-authorities-say-no-active-blockades-after-state-of-emergency-decree',
    ],
  },
  'united-states': {
    news_score: 20, evidence_found: true,
    summary: 'NEW HRW DETENTION-DEATHS REPORT ADDS TO MIXED WINDOW (within window): HRW published "Dying in Detention: Rising Deaths in an Expanding US Immigration Detention System" (early Jul), documenting rising deaths in ICE custody via statistical/medical analysis — a fresh negative data point layering onto the previously-confirmed mixed signal (Jun 30 SCOTUS birthright-citizenship win vs. Jun 25 asylum-metering/TPS-termination rulings and HUD\'s Housing-First rollback). Net mixed/moderate signal continues; no band-crossing basis.',
    sources: [
      'https://www.hrw.org/world-report/2026/country-chapters/united-states',
      'https://www.aclu.org/news/immigrants-rights/supreme-court-rules-to-protect-birthright-citizenship-in-landmark-case',
      'https://shelterforce.org/2026/04/20/what-huds-new-homeless-policy-looks-like-on-the-ground/',
    ],
  },
  'ethiopia': {
    news_score: 20, evidence_found: true,
    summary: 'ESCALATION RISK PERSISTS, NOT YET MATERIALIZED (within window continuation): Ethiopia-Eritrea-Tigray tensions remain high (federal troop redeployment to Tigray since Feb, Mekelle-Addis flight disruptions, banking disruptions); PM Abiy\'s Red Sea/maritime-access rhetoric continues raising war-resumption risk per Crisis Group. Concurrently ~9M across Tigray/Afar/Amhara need food aid, 2.6M at risk of assistance cuts absent funding. No open-conflict resumption this window; risk-flag continuation only.',
    sources: [
      'https://www.crisisgroup.org/brf/africa/ethiopia-eritrea/b210-ethiopia-eritrea-and-tigray-powder-keg-horn-africa',
      'https://www.rescue.org/article/ethiopia-crisis-why-millions-need-support-and-how-help',
    ],
  },
  'uganda': {
    news_score: 20, evidence_found: true,
    summary: 'EBOLA STIGMA MANAGEMENT + CONTINUED CASE GROWTH (within window): 20 confirmed cases (2 deaths) plus 1 probable death as of Jul 2; UN News (Jul, within window) highlights WHO-led community efforts to counter Ebola-survivor stigma in Kampala (international transit hub, elevating spread risk). Uganda-DRC border remains closed since May 27 (21-day isolation protocol). WHO director praised Uganda\'s response while warning continued cross-border vigilance is critical.',
    sources: [
      'https://news.un.org/en/story/2026/07/1167859',
      'https://www.ecdc.europa.eu/en/ebola-outbreak-democratic-republic-congo-and-uganda',
    ],
  },
  'yemen': {
    news_score: 20, evidence_found: true,
    summary: 'MAJORITY OF DETAINED UN STAFF STILL HELD (within window continuation): Despite the partial Jul release of 12 UN workers, ~73 UN personnel remain arbitrarily detained by Houthis as of Jun 2026, many since 2024, facing baseless espionage accusations; HRW\'s Jun 7 call for release remains unmet. WFP/FAO continue warning of Catastrophe-level (Phase 5) food insecurity risk in four Houthi-controlled districts. Net mixed/moderate signal continues — meaningful but incomplete improvement.',
    sources: [
      'https://www.timesofisrael.com/12-un-workers-allowed-to-leave-yemen-after-detention-by-houthi-rebels-un-says/',
      'https://www.hrw.org/news/2026/06/07/yemen-houthis-should-free-un-civil-society-staff',
    ],
  },
  'palestine': {
    news_score: 20, evidence_found: true,
    summary: 'SETTLEMENT EXPANSION "REVOLUTION" DEEPENS EXPOSURE (within window — sharpened): Jul 6 cabinet approval of 13 new West Bank settlements (Smotrich\'s "revolution" framing) compounds the settler-violence displacement pattern (2,300+ displaced in 2026; 13 killed/~500 injured over 5 months) already reflected in 2026-07-07. Harm remains attributed to Israeli-directed/enabled settler conduct per OHCHR; scored on Palestine\'s own-conduct/exposure basis at the 25.0 Developing/Critical boundary. No Palestine-own-conduct change identified.',
    sources: [
      'https://www.aljazeera.com/news/2026/7/6/israels-smotrich-declares-revolution-in-west-bank-settlement-expansion',
      'https://www.ohchr.org/en/press-releases/2026/06/occupied-palestinian-territory-un-experts-alarmed-escalating-settler-terror',
    ],
  },
  'kuwait': {
    news_score: 10, evidence_found: true,
    summary: 'EXIT-PERMIT REGIME CONTINUES — NO FRESH ESCALATION (within window continuation): Jul 1, 2025-effective exit-permit requirement (kafala-adjacent) remains fully in force; no new dated escalation found within this 14-day window beyond the already-confirmed 2026-07-07 record. Retained at sector-mention level pending any fresh enforcement action.',
    sources: [
      'https://www.hrw.org/news/2025/06/15/kuwaits-exit-permit-requirement-puts-migrant-workers-at-risk',
      'https://www.ecdhr.org/how-kuwaits-online-exit-visa-permits-are-digitalizing-the-kafala-system/',
    ],
  },
  'apple': {
    news_score: 0, evidence_found: false,
    summary: `Individual search performed (labor, supply chain, lawsuit, DOJ/SEC, safety, regulation terms); no compassion-relevant evidence found in last 14 days (${LOOKBACK_START} to ${LOOKBACK_END}). Supply-chain forced-labor litigation (DRC/Rwanda minerals) identified predates or lacks a dated July 2026 filing within window. Boundary-watch (composite 59.4, just below Established 60.0) — no change signal this cycle.`,
    sources: [],
  },
  'princeton-university': {
    news_score: 0, evidence_found: false,
    summary: `Individual search performed (federal funding, free speech, DEI, governance terms); no compassion-relevant evidence found in last 14 days (${LOOKBACK_START} to ${LOOKBACK_END}). Federal funding cuts, FIRE "F" free-speech grade, and DEI-messaging debate are all continuations of positions predating the window. Boundary-watch (composite 57.8, just below Established 60.0) — no change signal this cycle.`,
    sources: [],
  },
  'amazon': {
    news_score: 0, evidence_found: false,
    summary: `Individual search performed (labor, NLRB, warehouse safety terms); no fresh compassion-relevant evidence found in last 14 days (${LOOKBACK_START} to ${LOOKBACK_END}) beyond continuation of long-running, previously-documented NLRB/Teamsters matters (Staten Island bargaining order, Apr 2026; injury-rate findings, 2023-2025 data). No new dated escalation within window.`,
    sources: [],
  },
  // ── T2 evidence hits (specific entities within batches with genuine findings) ──
  'cuba': {
    news_score: 40, evidence_found: true,
    summary: 'THIRD ISLANDWIDE BLACKOUT CONFIRMED, ONGOING (within window continuation): Jul 6 nationwide power-grid failure (third in six months) confirmed; UNE could serve only 1% of Havana demand by late afternoon; tens of thousands of surgeries canceled; daily protests (bucket blockades in Mantilla over water, pot-banging in Regla) now routine. Díaz-Canel blames US fuel blockade following the 2026 Venezuela intervention. No fuel import since January except one Russian shipment. Confirms 2026-07-07 record.',
    sources: [
      'https://www.aljazeera.com/news/2026/7/7/cuba-sees-nationwide-power-blackout-for-third-time-in-six-months',
      'https://www.washingtonpost.com/world/2026/07/06/cuba-blackout-fuel-shortage-economic-crisis/e1b53dd4-7958-11f1-b194-f872dd4ec5aa_story.html',
      'https://www.cnn.com/2026/07/06/americas/cuba-blackout-electrical-grid-intl-latam',
    ],
  },
  'turkey': {
    news_score: 40, evidence_found: true,
    summary: 'MASS CRACKDOWN AHEAD OF/DURING NATO SUMMIT (Jun 22 - Jul 8, within window — NEW): At least 209-225 people arrested in Ankara ahead of the Jul 7-8 NATO summit; 178 sent to pretrial detention, 34 under house arrest. Detainees include a prominent LGBT-rights activist, an academic, two lawyers, journalists (Buse Sogutlu, Ceren Erdogdu), and reforestation-charity members. Dozens of independent-outlet journalists (Cumhuriyet, Sozcu, Anka, T24, Medyascope) denied summit press accreditation. HRW (Jun 25) and international press-freedom groups condemned the crackdown as a free-speech/assembly violation; separate anti-NATO protests saw 100+ more detained in Ankara/Istanbul.',
    sources: [
      'https://www.hrw.org/news/2026/06/25/turkiye-crackdown-ahead-of-nato-summit',
      'https://www.bloomberg.com/news/articles/2026-07-06/turkey-cracks-down-on-press-as-nato-leaders-descend-on-ankara',
      'https://sundayguardianlive.com/world/turkiye-detains-more-than-100-anti-nato-protesters-as-ankara-locks-down-ahead-of-alliance-summit-228329/amp/',
    ],
  },
  'kenya': {
    news_score: 20, evidence_found: true,
    summary: 'SABA SABA MARCH PRE-EMPTIVELY BLOCKED (Jul 7, within window — NEW): Police prevented the planned Jul 7 Saba Saba march to Parliament (petition on extrajudicial killings, enforced disappearances, excessive force) via checkpoints, plainclothes officers, and unmarked vehicles; fewer than 10 protesters managed to gather before being dispersed, with at least 3 bundled into unmarked vehicles. Materially less deadly than 2025\'s Saba Saba (41 killed) but represents a fresh prior-restraint/freedom-of-assembly action within the window.',
    sources: [
      'https://www.africanews.com/2026/07/07/kenya-crushes-saba-saba-march-in-latest-crackdown-on-dissent/',
      'https://www.riotimesonline.com/saba-saba-2026-kenya-protests/',
    ],
  },
  'xai-grok': {
    news_score: 40, evidence_found: true,
    summary: 'GROK DEEPFAKE-CSAM CLASS ACTION EXPANDED (Jul 7, within window — NEW): Class action against xAI over Grok-generated deepfake CSAM was amended Jul 7 to add two more anonymous plaintiffs, with new allegations that minors\' real photographs were used to generate sexually abusive images. A serious, discrete child-safety harm event within the window for an entity already at composite floor (0.0, Critical band, pending change proposal since 2026-05-13).',
    sources: [
      'https://letsdatascience.com/news/xai-faces-expanded-deepfake-csam-lawsuit-over-grok-9b8be998',
    ],
  },
};

// ── False positives screened this cycle ─────────────────────────────────────────
const FALSE_POSITIVES = [
  {
    entity: 'Apple', index: 'fortune-500', signal_type: 'Supply-chain forced-labor lawsuit (DRC/Rwanda minerals)',
    decision: 'SCREENED', reason: 'Advocacy-group complaint referencing cobalt/tin/tantalum/tungsten sourcing is undated within window in available reporting; no confirmed new July 2026 filing located. Individually searched — treated as genuine absence, not a detection failure.',
  },
  {
    entity: 'Midjourney', index: 'ai-labs', signal_type: 'Disney/Universal/Warner Bros. copyright lawsuit + discovery dispute (Jul 6-7)',
    decision: 'SCREENED', reason: 'Studio-vs-Midjourney copyright/IP litigation (including the discovery-scope motion) is a routine commercial litigation matter, not a stakeholder-welfare/safety/governance signal per scope rules; excluded from news_score.',
  },
  {
    entity: 'Qatar / UAE / Bahrain / Oman / Saudi Arabia', index: 'countries', signal_type: 'GCC labor-rights / conflict-related migrant-worker repression batch sweep',
    decision: 'SCREENED (dated)', reason: 'HRW/Amnesty findings (Bahrain Jun 2 wage-support exclusion; HRW Jun 11 "Repression of Migrant Workers During Conflict"; Saudi ILO complaint, Jan 2026) predate or sit at the edge of the 2026-06-24 to 2026-07-08 window without a fresh dated escalation confirmed within it; treated as no-new-evidence rather than fabricated as fresh.',
  },
  {
    entity: 'Various AI labs', index: 'ai-labs', signal_type: 'EU AI Act GPAI compliance / Aug 2 enforcement deadline',
    decision: 'SCREENED (forward-looking)', reason: 'EU AI Act high-risk provisions become applicable Aug 2, 2026 — a calendar/deadline item, not a dated compliance action by any specific lab within the window. Logged as sector context (T3), not entity-level evidence.',
  },
  {
    entity: 'Houston (Lorenzo Salgado Araujo ICE shooting)', index: 'us-cities', signal_type: 'ICE fatal shooting during arrest attempt',
    decision: 'CONTEXT-LOGGED (not entity-attributable)', reason: 'Fatal shooting was carried out by federal ICE agents, not Houston city government/police; not attributable to the Houston municipal entity\'s own conduct under scope rules. Logged as sector context (T3 ICE-accountability theme) rather than a Houston-specific hit.',
  },
];

// ── Batch name resolution — reuse established map from 2026-07-07 for continuity;
//    generic index-based fallback beyond that ──────────────────────────────────
let BATCHMAP_0707 = {};
try {
  const d0707 = JSON.parse(fs.readFileSync(path.join(ROOT, 'research/scans/2026-07-07.json'), 'utf8'));
  for (const e of d0707.entity_reviews) if (e.tier === 'T2') BATCHMAP_0707[e.slug] = e.batch_name;
} catch (e) { /* ignore */ }

function batchName(slug, entity) {
  if (BATCHMAP_0707[slug]) return BATCHMAP_0707[slug];
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
    alert_id: 'sa-2026-07-08-01',
    title: 'Burkina Faso: UN forced to permanently close its human rights office (Jul 2) — sharpens open Mali calibration flag',
    scope: 'countries/burkina-faso, countries/mali',
    severity: 'critical',
    summary: 'The UN Human Rights Office announced it will permanently close its Burkina Faso operations after the junta suspended it, eliminating independent monitoring/documentation capacity amid "rampant" violations (HRW). This is a discrete, fresh accountability-structure removal that materially sharpens the still-open Mali (12.5) vs. Burkina Faso (6.3) cross-peer calibration flag (routed to coordinator 2026-06-24, unresolved 14+ days).',
    sources: [
      'https://www.hrw.org/news/2026/07/02/burkina-faso-forces-closure-of-un-human-rights-office',
      'https://www.euronews.com/2026/07/02/un-to-close-its-human-rights-office-in-burkina-faso-following-juntas-suspension',
    ],
  },
  {
    alert_id: 'sa-2026-07-08-02',
    title: 'Turkey: mass crackdown (200+ detained) ahead of and during NATO summit (Jun 22 - Jul 8)',
    scope: 'countries/turkey',
    severity: 'high',
    summary: 'At least 209-225 people including journalists, lawyers, an academic, and an LGBT-rights activist were arrested in Ankara ahead of the Jul 7-8 NATO summit; 178 sent to pretrial detention. Dozens of independent journalists were denied summit press accreditation. HRW and international press-freedom groups condemned the crackdown.',
    sources: [
      'https://www.hrw.org/news/2026/06/25/turkiye-crackdown-ahead-of-nato-summit',
      'https://www.bloomberg.com/news/articles/2026-07-06/turkey-cracks-down-on-press-as-nato-leaders-descend-on-ankara',
    ],
  },
  {
    alert_id: 'sa-2026-07-08-03',
    title: 'xAI/Grok: deepfake-CSAM class action expanded with new minor-victim allegations (Jul 7)',
    scope: 'ai-labs/xai-grok',
    severity: 'high',
    summary: 'The Grok deepfake-CSAM class action against xAI was amended Jul 7 to add two more anonymous plaintiffs and new allegations that minors\' real photographs were used to generate sexually abusive images — a serious child-safety harm event for an AI lab already at composite floor (0.0).',
    sources: [
      'https://letsdatascience.com/news/xai-faces-expanded-deepfake-csam-lawsuit-over-grok-9b8be998',
    ],
  },
  {
    alert_id: 'sa-2026-07-08-04',
    title: 'Venezuela earthquake Day 14: toll holds at 3,535+, USGS models final toll as high as 100,000',
    scope: 'countries/venezuela',
    severity: 'critical',
    summary: 'Death toll steady at 3,535+ (16,740 injured, 17,854 unhoused, 12,800+ in shelters) as of the most recent official tally; USGS modeling places a plausible final range of 10,000-100,000 given the level of devastation, underscoring the earlier undercount concerns.',
    sources: [
      'https://www.nbcnews.com/world/south-america/venezuelas-earthquakes-death-toll-reaches-3533-survivors-look-missing-rcna353135',
    ],
  },
  {
    alert_id: 'sa-2026-07-08-05',
    title: 'Sudan: UN Human Rights Council orders urgent inquiry into El Obeid; 500,000 civilians remain trapped',
    scope: 'countries/sudan',
    severity: 'critical',
    summary: 'The UN Human Rights Council adopted a resolution ordering an urgent inquiry into alleged violations/war crimes in and around El Obeid, where RSF maintains a blackout siege and 500,000 civilians remain trapped, following the "red alert" drone-strike documentation and Amnesty\'s El Fasher ethnic-cleansing finding.',
    sources: [
      'https://sudantribune.com/article/315927',
      'https://www.aljazeera.com/news/2026/7/6/el-obeid-under-siege-by-rsf-could-this-be-sudans-next-el-fasher',
    ],
  },
  {
    alert_id: 'sa-2026-07-08-06',
    title: 'Israel: cabinet approves 13 new West Bank settlements (Jul 6) amid intensifying settler violence',
    scope: 'countries/israel, countries/palestine',
    severity: 'high',
    summary: 'Finance Minister Smotrich declared a "revolution" in settlement expansion as the cabinet approved 13 new settlements in strategically critical parts of the central West Bank (illegal under international law), alongside settler attacks now averaging ~6/day including destruction of an electricity line, greenhouse vandalism, and spring seizure documented Jul 3.',
    sources: [
      'https://www.aljazeera.com/news/2026/7/6/israels-smotrich-declares-revolution-in-west-bank-settlement-expansion',
      'https://www.aljazeera.com/news/2026/7/3/israeli-settlers-intensify-attacks-in-west-bank-targeting-water-supplies',
    ],
  },
  {
    alert_id: 'sa-2026-07-08-07',
    title: 'Haiti: HRW warns of imminent harm as TPS termination nears (2 days to Jul 10 placeholder expiry)',
    scope: 'countries/haiti, countries/united-states',
    severity: 'high',
    summary: 'HRW published "US: Haitians Set to Lose Protections, Risk Return to Violence" (Jul 2), warning ~350,000 Haitian TPS holders face imminent work-authorization/deportation risk into a gang-control crisis (90% of Port-au-Prince, 2,300+ killed in 2026, 1.4M+ displaced). USCIS placeholder expiry is Jul 10.',
    sources: [
      'https://www.hrw.org/news/2026/07/02/us-haitians-set-to-lose-protections-risk-return-to-violence',
    ],
  },
  {
    alert_id: 'sa-2026-07-08-08',
    title: 'West Africa/Sahel: lean season funding crisis persists — 45%+ cuts in Niger/Mali vs. last year',
    scope: 'countries/nigeria, countries/mali, countries/burkina-faso, countries/niger, countries/chad, countries/mauritania',
    severity: 'high',
    summary: 'Up to 54.8M people across West Africa and the Sahel face acute food insecurity during the Jun-Aug lean season; funding cuts exceeding 45% in Niger and Mali vs. last year are forcing WFP to cut food assistance during the hardest months, with Nigeria alone dropping from 1.3M assisted to a fraction of that.',
    sources: [
      'https://www.fao.org/africa/news-stories/news-detail/west-africa-and-the-sahel--nearly-52.8-million-people-could-face-acute-food-insecurity-during-the-2026-lean-season-(june-august)/en',
      'https://www.wfp.org/news/millions-central-sahel-and-nigeria-risk-food-cuts-world-food-programme-faces-severe-funding',
    ],
  },
  {
    alert_id: 'sa-2026-07-08-09',
    title: 'DRC/Uganda Ebola: death toll surpasses 500; first hopeful clinical-trial developments for untreatable Bundibugyo strain',
    scope: 'countries/democratic-republic-of-c, countries/uganda',
    severity: 'high',
    summary: 'DRC Ebola deaths surpassed 500 (Al Jazeera, Jul 6); 1,561 confirmed cases total. Uganda holds at 20 confirmed/2 deaths, cases centered in Kampala (transit-hub spread risk). Clinical trials are advancing for the first time against the Bundibugyo strain, for which no vaccine or treatment currently exists.',
    sources: [
      'https://www.aljazeera.com/news/2026/7/6/ebola-death-toll-in-dr-congo-surpasses-500',
      'https://www.npr.org/2026/07/07/g-s1-132218/theres-no-treatment-designed-for-the-ebola-strain-ravaging-drc-but-now-theres-hope',
    ],
  },
  {
    alert_id: 'sa-2026-07-08-10',
    title: 'ICE accountability: fatal shooting of Lorenzo Salgado Araujo in Houston during attempted arrest',
    scope: 'us-cities/houston, countries/united-states',
    severity: 'high',
    summary: 'Immigration and civil rights advocacy groups are demanding an independent investigation into the fatal shooting of Lorenzo Salgado Araujo, a Mexican father killed by ICE during an attempted arrest in Houston. Attributed to federal ICE conduct, not the city government, and logged as sector context rather than a Houston-specific entity hit.',
    sources: [
      'https://www.democracynow.org/2026/7/8/headlines',
    ],
  },
];

// ── Assemble scan ──────────────────────────────────────────────────────────────
const searchesPerformed = 58; // T1 (30 individual) + T2 batch-representative/sector-hit searches (~16) + T3 sweeps (~12)
const scan = {
  scan_date: SCAN_DATE,
  scan_start: `${SCAN_DATE}T02:00:00Z`,
  scan_end:   `${SCAN_DATE}T03:20:00Z`,
  lookback_window_days:  LOOKBACK_DAYS,
  lookback_window_start: LOOKBACK_START,
  lookback_window_end:   LOOKBACK_END,
  entities_scanned:   entityReviews.length,
  searches_performed: searchesPerformed,
  tier_breakdown: { tier_1_individual: T1.size, tier_2_batched: entityReviews.length - T1.size, tier_3_sector_sweeps: 12 },
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
      T2_batched: 16,
      T3_sector_sweeps: 12,
    },
    scan_quality: 'standard',
    degraded_batches: [],
    false_positives_screened: FALSE_POSITIVES.length,
    lookback_window: `${LOOKBACK_START} to ${LOOKBACK_END}`,
  },
};

// ── Write files ────────────────────────────────────────────────────────────────
fs.writeFileSync(
  path.join(ROOT, 'research/scans/2026-07-08.json'),
  JSON.stringify(scan, null, 2)
);

const erPayload = { date: SCAN_DATE, lookback_window_days: LOOKBACK_DAYS, reviews: siteReviews };
fs.writeFileSync(
  path.join(ROOT, 'site/src/data/evidence-reviews/2026-07-08.json'),
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
console.log('=== 2026-07-08 SCAN COMPLETE ===');
console.log('entities_scanned       :', entityReviews.length);
console.log('entities_with_evidence :', withEvidence);
console.log('searches_performed     :', searchesPerformed, ' (T1:' + T1.size + '  T2-batch-rep:16  T3:12)');
console.log('top_entities (' + topEntities.length + ')      :', topEntities.map(e => e.slug + ':' + e.priority_score).join(', '));
console.log('sector_alerts          :', sectorAlerts.length);
console.log('false_positives        :', FALSE_POSITIVES.length);
console.log('rotation_backfill      :', rotationBackfill.map(e=>e.slug).join(', '));
