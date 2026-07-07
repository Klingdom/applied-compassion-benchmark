'use strict';
/**
 * Nightly Evidence Scanner — 2026-07-04
 * Outputs:
 *   research/scans/2026-07-04.json
 *   site/src/data/evidence-reviews/2026-07-04.json
 *   site/src/data/evidence-reviews/latest.json
 * Updates: research/rotation-state.json (timestamps only — NO composite/band/rank changes)
 */

const fs   = require('fs');
const path = require('path');

const ROOT            = 'C:/Users/philk/applied-compassion-benchmark';
const SCAN_DATE       = '2026-07-04';
const LOOKBACK_START  = '2026-06-20';
const LOOKBACK_END    = '2026-07-04';
const LOOKBACK_DAYS   = 14;

// ── Rotation state ─────────────────────────────────────────────────────────────
const rotationState = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'research/rotation-state.json'), 'utf8')
);
const entities = rotationState.entities;

// ── Pending proposals ──────────────────────────────────────────────────────────
const proposalsDir   = path.join(ROOT, 'research/change-proposals');
const proposalFiles  = fs.existsSync(proposalsDir)
  ? fs.readdirSync(proposalsDir)
      .map(f => f.replace(/\.json$/, '').replace(/-\d{4}-\d{2}-\d{2}$/, ''))
  : [];
const pendingSlugs   = new Set(proposalFiles);

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
  'north-korea','libya',
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

// ── T1 slugs (individually searched entities) ──────────────────────────────────
const T1 = new Set([
  'iran','venezuela','sudan','ukraine','lebanon','democratic-republic-of-c','china',
  'el-salvador','unitedhealth-group','nigeria','mali','burkina-faso','south-sudan',
  'somalia','myanmar','anthropic','afghanistan','haiti','bolivia','russia','pakistan',
  'israel','united-states','ethiopia','uganda','yemen',
]);

// ── Evidence map ───────────────────────────────────────────────────────────────
const EV = {
  'ukraine': {
    news_score: 40, evidence_found: true,
    summary: 'JULY 4 STRIKES + KYIV ATTACK: Russia struck Dnipro (7 injured), Poltava, and Zaporizhzhia (1 killed — postal facility) on July 4. Continuing from July 1-3 Kyiv attack — 30+ killed including 9-floor residential building collapse in Darnytskyi district, most deadly single 2026 attack. July 2026 civilian toll: 286 killed / 1,388 injured — highest monthly rate since 2023, ~20% above same period 2025. 62,716 civilian casualties since Feb 2022. EU Special Tribunal for Russian crime of aggression now operational. EU sanctioned 9 Bucha massacre perpetrators.',
    sources: [
      'https://www.kyivpost.com/post/79600',
      'https://www.cnn.com/2026/07/03/world/ukraine-russia-kyiv-attack-analysis-intl',
      'https://ukraine.ohchr.org/en/In-Ukraine-Overnight-Russian-Attack-Leaves-Dozens-Dead-and-Injured',
      'https://www.europarl.europa.eu/doceo/document/RC-10-2026-0201_EN.html',
    ],
  },
  'venezuela': {
    news_score: 40, evidence_found: true,
    summary: 'EARTHQUAKE DAY 10 (July 4): Official death toll 2,645. UN ODRR estimates $37B direct damage. ~50,000 still unaccounted. 12,500+ injured; 60,000 buildings damaged/destroyed. Forensic pathologist told CNN: official figure "not even a third of what is actually there." "Miracle" rescues ongoing (security guard pulled alive after 8 days). US committed $300M; Venezuelan government announced $200M reconstruction fund (fraction of actual need). Hospitals face severe shortages. Monsoon season concerns mounting.',
    sources: [
      'https://www.wmnf.org/venezuela-earthquake-live-updates-july-4-2026/',
      'https://brusselssignal.eu/2026/07/venezuela-earthquake-death-toll-passes-2000/',
      'https://news.un.org/en/story/2026/07/1167850',
      'https://www.cnn.com/2026/07/02/americas/venezuela-earthquakes-morgue-death-toll-latam-intl',
    ],
  },
  'sudan': {
    news_score: 40, evidence_found: true,
    summary: 'RSF EL OBEID — HRW JULY 3 "IMMINENT ATROCITIES" REPORT: HRW July 3 formal report: RSF drone strikes intensifying — 16+ civilian/service targets damaged including hospitals, schools, power stations, fuel depots; food prices surged 300%. UNHCR supply truck (50 MT of relief items) destroyed in drone strike on Tendelti (White Nile State) July 1. 500,000 civilians + 105,000 IDPs at siege risk. 29+ countries raised alarm. UN Rights Chief Turk: "Stop this madness." Amnesty July 2026: RSF crimes against humanity and ethnic cleansing at El Fasher confirmed. Sudan has more people in famine than rest of world combined.',
    sources: [
      'https://www.hrw.org/news/2026/07/03/sudan-risk-of-imminent-atrocities-in-and-around-el-obeid-requires-urgent-action',
      'https://sudantribune.com/article/315813',
      'https://www.aljazeera.com/editorial/2026/7/2/fears-of-new-massacre-in-sudans-el-obeid-what-do-we-know',
      'https://www.rescue.org/uk/press-release/sudan-imminent-rsf-offensive-pushing-north-kordofan-toward-humanitarian-catastrophe',
    ],
  },
  'iran': {
    news_score: 40, evidence_found: true,
    summary: 'KHAMENEI STATE FUNERAL DAY 1 (July 4) — MOJTABA NEW SUPREME LEADER, TALKS PAUSED UNTIL JULY 11: Casket displayed in Tehran; 15-20 million mourners expected. Mojtaba Khamenei named new Supreme Leader but has not appeared in public — neither he nor any sons attended July 4 ceremony. US-Iran nuclear and Hormuz talks explicitly paused pending conclusion of funeral; scheduled to resume July 11. Trump declared Iran is "dying to settle." Memorandum of Understanding signed June 17 (60-day deadline). Execution surge: 784+ YTD (37-year high).',
    sources: [
      'https://www.cbsnews.com/live-updates/us-iran-war-trump-negotiations-pause-ayatollah-funeral/',
      'https://www.foxnews.com/live-news/iran-us-trump-khamenei-funeral-july-4',
      'https://eciks.org/11724-49760-iran-khamenei-funeral-peace-talks-pause',
      'https://www.iranintl.com/en/liveblog/202606274036',
    ],
  },
  'nigeria': {
    news_score: 40, evidence_found: true,
    summary: 'WFP JULY 2 REPORT — WORST HUNGER IN NEARLY A DECADE: 36.2M food insecure nationally (highest ever recorded). 17M+ across nine northern states at crisis/emergency/catastrophe levels — increase of 2M since last projections. Borno: 3M+ acutely food insecure; 750,000+ in severe hunger; 10,000+ at catastrophe. WFP can support only 740,000 of 6.2M in need — 5.5M without lifesaving food aid. Communities reporting people joining armed groups for food. Lean season peak (June-August) ongoing. WFP funding crisis compounding.',
    sources: [
      'https://www.globalsecurity.org/military/library/news/2026/07/mil-260702-wfp01.htm',
      'https://www.wfp.org/news/increased-insurgent-attacks-nigeria-threaten-regional-stability-and-drive-sharp-spike-hunger',
      'https://www.wfp.org/news/conflict-and-shrinking-humanitarian-assistance-drives-northern-nigeria-hunger-crisis-levels',
    ],
  },
  'china': {
    news_score: 40, evidence_found: true,
    summary: "ETHNIC UNITY LAW IN FORCE (July 1) — TRANSNATIONAL REACH CONFIRMED: Law enacted July 1. Senior officials at June 24 State Council press conference confirmed the law applies outside China's borders — individuals and organizations outside mainland China can be held liable for acts 'undermining ethnic solidarity.' Amnesty International: 'legal blueprint for cultural erasure' for Uyghurs, Tibetans, Mongolians. Germany Foreign Ministry: 'great concern' about transnational repression. European Parliament April 30 resolution condemning the law. Plataforma Media (July 2): law 'codifies forced minority assimilation and claims right to prosecute critics worldwide.'",
    sources: [
      'https://www.cnn.com/2026/07/01/china/china-ethnic-unity-law-intl-hnk',
      'https://www.amnesty.org/en/latest/news/2026/06/china-new-ethnic-unity-law-set-to-entrench-assimilation-of-minority-groups/',
      'https://www.plataformamedia.com/en/2026/07/02/china-implements-ethnic-unity-assimilation-law-global-jurisdiction/',
      'https://uyghurstudy.org/chinas-new-ethnic-unity-law-a-legal-blueprint-for-cultural-erasure/',
    ],
  },
  'lebanon': {
    news_score: 40, evidence_found: true,
    summary: "CEASEFIRE VIOLATIONS — IDF 'NO CEASEFIRE' IN SOUTH (ongoing): IDF chief declared 'no ceasefire' in south Lebanon amid continued fighting with Hezbollah. Hezbollah attacked IDF forces at Nabatieh; IDF responded with strikes. June 28 US-brokered framework (Secretary Rubio) has not held. 4,000+ killed since March 2 resumption; 1M+ displaced (>20% of population). 76% of south Lebanon farmers displaced; 22% of agricultural land damaged. 1M+ facing future food insecurity.",
    sources: [
      'https://en.wikipedia.org/wiki/2026_Israel-Lebanon_ceasefire',
      'https://www.timesofisrael.com/idf-chief-says-theres-no-ceasefire-in-south-lebanon-amid-continued-fighting-with-hezbollah/',
      'https://en.wikipedia.org/wiki/2026_Lebanon_war',
    ],
  },
  'south-sudan': {
    news_score: 40, evidence_found: true,
    summary: 'IPC PHASE 5 IN 4 COUNTIES — FAMINE RISK: 7.8M at IPC Phase 3+ (56% of population). 2.2M children acutely malnourished. 73,300 at IPC Phase 5 Catastrophe — 160% increase from prior estimate — in Akobo, Fangak, Nyirol, Uror (Jonglei) and Luakpiny/Nasir, Ulang (Upper Nile). Credible risk of famine in four counties. 300,000 displaced in Jonglei; 200,000 displaced from Akobo since March 6. Cholera, malaria, measles outbreaks compounding malnutrition. DRC Ebola spread to Haut-Uele province (borders South Sudan) — cross-border disease risk.',
    sources: [
      'https://www.ipcinfo.org/ipc-country-analysis/details-map/en/c/1163302',
      'https://www.unicef.org/press-releases/hunger-intensifies-south-sudan-78-million-people-face-high-acute-food-insecurity-0',
      'https://www.wfp.org/news/hunger-intensifies-south-sudan-78-million-people-face-high-acute-food-insecurity-and-22',
    ],
  },
  'mali': {
    news_score: 40, evidence_found: true,
    summary: 'JNIM BAMAKO SIEGE + HRW JUNE 28 GRAVE ABUSES REPORT: JNIM siege blocking all major supply roads since April 28. Civilian executions: public execution in Tonka; 40+ civilian vehicles burned May 6-21. Bus landmine June 1 (Bamako-Kayes highway): 8 killed, 42 injured. HRW June 28 report documenting "grave abuses amid renewed fighting." Schools/universities shut by junta. 5M in humanitarian need; 1.56M acutely food insecure; humanitarian response 18.5% funded.',
    sources: [
      'https://www.hrw.org/news/2026/06/28/mali-grave-abuses-amid-renewed-fighting',
      'https://en.wikipedia.org/wiki/2026_Mali_offensives',
      'https://www.amnesty.org/en/latest/news/2026/05/mali-bamako-siege/',
      'https://theopscon.com/intelligence/mali-bamako-fuel-blockade-siege-16-jun-2026',
    ],
  },
  'el-salvador': {
    news_score: 40, evidence_found: true,
    summary: "CRISTOSAL SHUTDOWN + CONSTITUTIONAL AMENDMENT: Cristosal — El Salvador's leading human rights organization — suspended operations citing 'escalating repression'; Ruth Lopez remains imprisoned. Legislative Assembly amended constitution allowing indefinite presidential re-election. Foreign Agents Law (May 2026) drove 140+ rights defenders/journalists from country; 4+ organizations shut down. 86 political prisoners documented; 245+ facing persecution. State of exception Year 5. Life sentences for persons as young as 12 (April 2026). El Salvador downgrade proposal (20.3 to 15.0) REMAINS PENDING — not yet applied.",
    sources: [
      'https://www.wola.org/2026/03/four-years-of-ongoing-human-rights-violations-in-el-salvador-and-the-erosion-of-democracy/',
      'https://kennedyhumanrights.org/our-voices/how-bukeles-el-salvador-frames-human-rights-as-the-enemy/',
      'https://humanrightscommission.house.gov/events/hearings/state-exception-el-salvador-year-five',
    ],
  },
  'democratic-republic-of-c': {
    news_score: 40, evidence_found: true,
    summary: 'EBOLA — WHO CASE COUNT REVISION + INTERNATIONAL SPREAD (within window): WHO/CDC revised confirmed case count; CIDRAP reported WHO "drastically downsizes" case count during review — mixed messaging reflects chaotic response. Active spread: Ituri, North Kivu, South Kivu, Haut-Uele provinces. International cases: Uganda (20 confirmed/2 deaths), France (1 imported), Germany (US citizen evacuated). Bundibugyo strain — no approved vaccine or treatment. Public Health Emergency of International Concern active. UNHCR seeking $14M for regional preparedness.',
    sources: [
      'https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON612',
      'https://www.cidrap.umn.edu/ebola/who-drastically-downsizes-ebola-case-count-dr-congo-outbreak',
      'https://www.ecdc.europa.eu/en/ebola-outbreak-democratic-republic-congo-and-uganda',
      'https://www.cdc.gov/ebola/situation-summary/index.html',
    ],
  },
  'unitedhealth-group': {
    news_score: 40, evidence_found: true,
    summary: 'DOJ CRIMINAL + CIVIL PROBE — Q2 EARNINGS JULY 29: DOJ criminal probe extends to Optum Rx and physician reimbursement arrangements. Civil probe: inflated diagnoses for higher Medicare Advantage payments. Third-party review ongoing (complete by end Q3). Senate Grassley investigation: "aggressively gaming" Medicare Advantage. Q2 earnings call July 29 — potential bellwether for further disclosures. DOJ June 23 national healthcare fraud takedown ($6.5B, 455 defendants) maintains regulatory pressure. CMS suspended 1,079 providers. Medicare Advantage kickback lawsuit (Aetna/Elevance/Humana) moved forward March 2026.',
    sources: [
      'https://www.fiercehealthcare.com/payers/wsj-report-doj-interviewing-former-employees-about-medicare-billing-practices-unitedhealth',
      'https://www.healthcaredive.com/news/unitedhealth-grassley-medicare-advantage-investigation/809377/',
      'https://phemex.com/academy/unitedhealth-group-unh-stock-2026',
    ],
  },
  'russia': {
    news_score: 40, evidence_found: true,
    summary: 'JULY 4 STRIKES + KYIV ATTACK ACCOUNTABILITY: Russia struck Dnipro, Poltava, Zaporizhzhia on July 4 (1 killed in Zaporizhzhia postal facility). July 2-3 Kyiv attack: 30+ killed, CNN: "exceptionally deadly" — 9-floor residential building collapsed, 74 missiles + 496 drones deployed. July 2026 civilian toll: 286 killed / 1,388 injured — highest monthly rate since 2023. EU Council sanctioned 9 individuals for Bucha massacre (crimes against humanity). EU Special Tribunal for crime of aggression against Ukraine now operational. EU sanctions renewed until July 2027. 20,500+ Ukrainian children forcibly deported.',
    sources: [
      'https://www.cnn.com/2026/07/03/world/ukraine-russia-kyiv-attack-analysis-intl',
      'https://www.kyivpost.com/post/79600',
      'https://www.consilium.europa.eu/en/policies/sanctions-against-russia/timeline-sanctions-against-russia/',
      'https://www.europarl.europa.eu/doceo/document/RC-10-2026-0201_EN.html',
    ],
  },
  'yemen': {
    news_score: 40, evidence_found: true,
    summary: 'HUMANITARIAN SYSTEM STRESS — 73 UN STAFF DETAINED (ongoing): 73 UN staff detained by Houthi de facto authorities; all Yemeni nationals. WFP terminated all staff contracts in Houthi areas. 450+ health facilities closed. 18.3M acutely food insecure. Houthi cross-Red Sea attacks: 14 seafarer deaths (IMO). IPC: tens of thousands risk catastrophic hunger/famine-like conditions. US airstrikes ongoing (Iran war context). Doha talks paused (Khamenei funeral). 12.7% of $2.16B appeal funded.',
    sources: [
      'https://news.un.org/en/story/2026/01/1166761',
      'https://www.hrw.org/world-report/2026/country-chapters/yemen',
      'https://www.unocha.org/yemen',
    ],
  },
  'pakistan': {
    news_score: 40, evidence_found: true,
    summary: 'AFGHANISTAN CONFLICT ESCALATION JUNE 28-29 — CIVILIAN CASUALTIES: Pakistan launched ground operation and airstrikes June 28-29 against TTP targets in Paktia, Paktika, Kunar provinces. Afghan Taliban reported 36 civilians killed / 163 injured; Pakistan disputes. Pakistan security forces killed 29 fighters June 29. Multiple 2026 ceasefire collapses: Qatar-mediated ceasefire (Oct 2025) collapsed; Pakistani airstrikes Feb 2026; March Eid truce violated; China-hosted April talks temporary pause; Eid al-Adha ceasefire May 25-29 collapsed. Militants killed 3 Pakistani rangers in Karachi June 27. Cumulative: 372 Afghan civilians killed / 397 injured Q1 2026 (UNAMA). 115,000+ displaced in Afghanistan.',
    sources: [
      'https://en.wikipedia.org/wiki/2026_Afghanistan-Pakistan_war',
      'https://www.aljazeera.com/news/2026/6/29/pakistan-says-its-security-forces-killed-29-fighters-along-afghan-border',
      'https://reliefweb.int/report/afghanistan/food-security-under-pressure-impacts-middle-east-crisis-and-pakistan-conflict-afghanistan-june-2026',
    ],
  },
  'haiti': {
    news_score: 40, evidence_found: true,
    summary: 'SCOTUS JUNE 25 TPS RULING — 350K HAITIANS AT RISK + GANG CRISIS: Supreme Court ruled 6-3 on June 25 allowing termination of TPS for Haitians; 350,000 at risk of deportation; remittances (15%+ GDP) threatened. US District Judge separately ruled DHS decision unlawful — legal uncertainty ongoing. Gang control: ~90% of Port-au-Prince; 1.45M+ internally displaced; 17,000+ displaced in latest Port-au-Prince clashes. 5.8M Haitians (52%) at crisis food insecurity; 1.8M at emergency levels. 6.4M need humanitarian assistance; 24% of required funding secured.',
    sources: [
      'https://globalvoices.org/2026/07/04/what-the-ending-of-the-u-s-temporary-protection-status-could-mean-for-haiti/',
      'https://www.politifact.com/article/2026/jun/29/Supreme-Court-TPS-Haitians-safe-Markwayne-Mullin/',
      'https://news.un.org/en/story/2026/04/1167362',
    ],
  },
  'burkina-faso': {
    news_score: 20, evidence_found: true,
    summary: 'LEAN SEASON PEAK — ONGOING (June-August 2026): 9.1M food insecure across AES states during lean season peak. 4.5M displaced including 2.9M children. JNIM siege blockades affecting ~2M people across 40+ localities. WFP helicopter deliveries only route for many communities. Junta restricting independent reporting. No new confirmed armed attack within July 4 lookback window (noted: July 28 IS Sahel Gorom Gorom attack is outside this window).',
    sources: [
      'https://humanitarianaction.info/document/global-humanitarian-overview-2026/article/west-and-central-africa-4',
      'https://www.refugeesinternational.org/perspectives-and-commentaries/humanitarian-aid-crisis-in-enclaved-areas-of-burkina-faso/',
    ],
  },
  'somalia': {
    news_score: 20, evidence_found: true,
    summary: 'FAMINE RISK — BURHAKABA IPC PHASE 5 (within window): 6M (31% of population) at IPC Phase 3+; 1.9M at Emergency (Phase 4). Burhakaba District at IPC AMN Phase 5. Credible famine risk in Bay and Bakool regions. 1.84M children expected to suffer acute malnutrition in 2026. Only 20% of $1.42B intervention plan funded; 75% reduction in beneficiaries (6M to 1.3M). Al-Shabaab attacks ongoing. IRC warning of catastrophic hunger levels.',
    sources: [
      'https://www.rescue.org/press-release/irc-warns-somalia-brink-catastrophe-new-ipc-projections-signal-renewed-famine-risk',
      'https://www.wfp.org/countries/somalia',
    ],
  },
  'israel': {
    news_score: 20, evidence_found: true,
    summary: 'CEASEFIRE VIOLATIONS — 77% OF GAZANS FOOD INSECURE (within window): 1,000+ killed (including 100+ children) since ceasefire started October 2025. 77% of Gaza population at acute food insecurity. 3,700 children require malnutrition treatment. Aid volumes fallen; crossings closed Feb 28 reduced trucks from 4,200 to 590/week. Total Palestinian deaths: 72,000+ confirmed (March 2026). ICC arrest warrants active. Ceasefire violations also ongoing in Lebanon.',
    sources: [
      'https://www.hrw.org/news/2026/05/19/gaza-israel-curbs-aid-kills-civilians-during-ceasefire',
      'https://press.un.org/en/2026/sc16390.doc.htm',
    ],
  },
  'afghanistan': {
    news_score: 20, evidence_found: true,
    summary: 'PAKISTAN CONFLICT — 370+ CIVILIANS KILLED Q1 2026 + ONGOING: June 28-29 Pakistan strikes killed 36 civilians per Taliban (163 injured); Pakistan disputes. Cumulative: 372 Afghan civilians killed / 397 injured in Q1 2026 alone (UNAMA). March 16 strike on Kabul drug treatment hospital: 269 killed, 122 wounded. 115,000+ displaced in Afghanistan. Multiple ceasefire collapses throughout 2026. Media restricted. 15.8M Afghans needing emergency food assistance.',
    sources: [
      'https://en.wikipedia.org/wiki/2026_Afghanistan-Pakistan_war',
      'https://www.aljazeera.com/news/2026/3/4/nearly-66000-afghans-displaced-amid-fierce-fighting-on-pakistan-border-un',
    ],
  },
  'myanmar': {
    news_score: 20, evidence_found: true,
    summary: 'CIVIL WAR — 100,000+ KILLED TOTAL (ACLED, July 1, 2026): 100,114 conflict-related fatalities since February 2021 coup. 2025 airstrike deaths: 982 including 368 women and 232 children (52% increase vs. 2024). Military responsible for 64% of conflict incidents and 71% of civilian fatalities. Military State Administration Council formally disbanded July 2026. UN Secretary-General February 2026: "suffering in Myanmar has deepened."',
    sources: [
      'https://thedefensepost.com/2026/07/01/myanmar-post-coup-casualties/amp/',
      'https://press.un.org/en/2026/sgsm22999.doc.htm',
    ],
  },
  'ethiopia': {
    news_score: 20, evidence_found: true,
    summary: 'FOOD CRISIS + ERITREA TENSIONS (within window): 15.8M Ethiopians need emergency food assistance. Tigray conflict displacement persists; ongoing clashes in Amhara and Oromia. Ethiopia-Eritrea tensions escalating — Ethiopia signaled intent to regain Red Sea access by force, fueling Eritrean fears about Assab port. East Africa: 63M+ in humanitarian need (45% of continental total).',
    sources: [
      'https://commonslibrary.parliament.uk/africa-in-2026-conflict-elections-and-a-new-uk-framework/',
      'https://africacenter.org/spotlight/famine-takes-grip-in-africas-prolonged-conflict-zones/',
    ],
  },
  'bolivia': {
    news_score: 20, evidence_found: true,
    summary: "STATE OF EMERGENCY (June 20, within window): President Paz declared 90-day state of emergency June 20 giving military power to remove blockades. 17 deaths from transportation disruptions (denied medical care). Worst economic crisis in decades (energy/dollar shortage). Blockades lifted June 23 after government-COB agreement. Still under state of emergency. Bolivia's currency plummeting as of July 1.",
    sources: [
      'https://www.aljazeera.com/news/2026/6/20/bolivia-declares-state-of-emergency-amid-blockade-crisis',
      'https://www.aljazeera.com/video/newsfeed/2026/7/1/state-of-emergency-bolivias-currency-plummets-as-anger-simmers',
    ],
  },
  'anthropic': {
    news_score: 20, evidence_found: true,
    summary: 'FABLE/MYTHOS EXPORT CONTROLS IMPOSED AND LIFTED (within window): US Commerce Secretary directed Anthropic June 12 to suspend all access to Claude Fable 5 and Mythos 5 by foreign nationals worldwide, including foreign-national Anthropic employees, citing jailbreak vulnerability and reports of China-linked Mythos access. Anthropic complied. Controls lifted: Fable 5 globally late June; Mythos 5 for some US organizations June 26; full restoration by July 1. Anthropic disagreed with government assessment. G7: Amodei and Hassabis called for US-led AI governance coalition.',
    sources: [
      'https://fortune.com/2026/06/13/anthropic-disables-fable-mythos-export-controls-national-security-threat/',
      'https://www.cnbc.com/2026/06/30/anthropic-says-trump-admin-has-lifted-export-controls-on-claude-fable-5-and-mythos-5.html',
      'https://www.aljazeera.com/economy/2026/7/1/us-lifts-restrictions-on-powerful-ai-models-fable-mythos-anthropic-says',
    ],
  },
  'united-states': {
    news_score: 20, evidence_found: true,
    summary: 'SCOTUS TERM END — BIRTHRIGHT + TPS RULINGS (within window): June 30: SCOTUS upheld birthright citizenship (Fourteenth Amendment) — rejected Trump executive order. June 25: SCOTUS 6-3 allowed ending TPS for Haitians and Syrians. June 25: SCOTUS 6-3 narrowed asylum eligibility (Mullin v. Al Otro Lado). DOJ memo June 20 potentially threatening disability rights via institutionalization of unhoused. Fortune 500 DEI disclosures fell 65% in 2026. EEOC warned Fortune 500 CEOs on DEI compliance. Tech layoffs: 164K+ affected in 2026.',
    sources: [
      'https://www.aclu.org/news/immigrants-rights/supreme-court-rules-to-protect-birthright-citizenship-in-landmark-case',
      'https://www.dhs.gov/news/2026/06/25/dhs-issues-statement-following-multiple-supreme-court-wins',
      'https://www.npr.org/2026/06/20/nx-s1-5865100/doj-memo-trump-disability-civil-rights-institutionalization',
    ],
  },
  'uganda': {
    news_score: 20, evidence_found: true,
    summary: 'EBOLA CASES CONFIRMED (within window): Uganda has 20 confirmed Ebola cases including 2 deaths, plus 1 probable case/death. Cases centered in Kampala (international hub) — elevating international spread risk. DRC Bundibugyo strain: no approved vaccine or treatment. Uganda-DRC border closed since May 27 with 21-day isolation requirement.',
    sources: [
      'https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON612',
      'https://www.ecdc.europa.eu/en/ebola-outbreak-democratic-republic-congo-and-uganda',
    ],
  },
  'germany': {
    news_score: 10, evidence_found: true,
    summary: "Touched by western-europe-batch: Germany Foreign Ministry expressed 'great concern' about China's Ethnic Unity Law and transnational repression risk to diaspora communities (within window). Engaged in EU accountability frameworks for Ukraine and Russia. Treated imported Ebola case (US citizen evacuated from DRC).",
    sources: [
      'https://tibet.net/german-foreign-ministry-voices-great-concern-over-chinas-ethnic-unity-law-and-risk-of-transnational-repression/',
    ],
  },
  'france': {
    news_score: 10, evidence_found: true,
    summary: 'Touched by western-europe-batch: France reported one imported Bundibugyo Ebola case from DRC (within window). Case managed under isolation protocols; ECDC considers EU/EEA infection likelihood "very low."',
    sources: [
      'https://www.ecdc.europa.eu/en/ebola-outbreak-democratic-republic-congo-and-uganda',
    ],
  },
  'saudi-arabia': {
    news_score: 10, evidence_found: true,
    summary: 'Touched by GCC-middle-east-batch: UN experts (May 2026) raised alarm over Saudi Arabia abusive labor governance system (kafala); ILO complaint deferred to November 2026 Governing Body. HRW World Report 2026: ongoing restrictions on freedom of expression; long prison terms for critics.',
    sources: [
      'https://www.hrw.org/news/2026/05/19/un-experts-sound-alarm-over-saudi-arabias-abusive-labor-governance-system',
    ],
  },
  'uae': {
    news_score: 10, evidence_found: true,
    summary: "Touched by GCC-middle-east-batch: UAE court upheld convictions of 53 human rights defenders in country's second-largest mass trial (2025). Zero-tolerance policy toward government criticism; invasive domestic and international surveillance.",
    sources: ['https://www.hrw.org/world-report/2026/country-chapters/united-arab-emirates'],
  },
  'qatar': {
    news_score: 10, evidence_found: true,
    summary: 'Touched by GCC-middle-east-batch: Qatar hosted US-Iran Doha talks (paused for Khamenei funeral); Al Udeid Air Base and desalination plants at risk. Visa extensions for residents affected by regional conflict. Qatar never formally assessed.',
    sources: ['https://www.cbsnews.com/live-updates/us-iran-war-trump-negotiations-pause-ayatollah-funeral/'],
  },
  'cuba': {
    news_score: 20, evidence_found: true,
    summary: 'Touched by caribbean-batch: Cuba officially ran out of fuel amid US blockade (within window). Public demonstrations over worsening humanitarian conditions. Unsustainable socioeconomic conditions; domestic unrest risk increasing.',
    sources: ['https://acleddata.com/update/latin-america-and-caribbean-overview-june-2026'],
  },
  'chad': {
    news_score: 10, evidence_found: true,
    summary: 'Touched by central-africa-batch: 4.5M need humanitarian aid in 2026. 1.3M Sudan refugees/returnees have crossed into Chad; 2M+ total forcibly displaced. 2.9M (15% of population) need food assistance in lean season June-August 2026.',
    sources: ['https://humanitarianaction.info/document/global-humanitarian-overview-2026/article/west-and-central-africa-4'],
  },
  'meta-ai': {
    news_score: 10, evidence_found: true,
    summary: 'Touched by ai-labs-batch: Meta declined to sign the full EU GPAI Code of Practice ahead of the August 2, 2026 enforcement deadline. Heightened EU scrutiny expected.',
    sources: ['https://artificialintelligenceact.eu/'],
  },
  'xai-grok': {
    news_score: 10, evidence_found: true,
    summary: 'Touched by ai-labs-batch: xAI signed only the Safety and Security chapter of the EU GPAI Code of Practice — compliance via alternative adequate means. European Commission indicated this position will face heightened scrutiny.',
    sources: ['https://cnn.com/2026/05/05/tech/microsoft-google-xai-government-test-ai-models'],
  },
};

// ── Batch name resolver ────────────────────────────────────────────────────────
const BATCH_COUNTRY = {
  'finland':'nordic-western-europe-batch','denmark':'nordic-western-europe-batch',
  'norway':'nordic-western-europe-batch','iceland':'nordic-western-europe-batch',
  'sweden':'nordic-western-europe-batch','switzerland':'nordic-western-europe-batch',
  'netherlands':'nordic-western-europe-batch','germany':'nordic-western-europe-batch',
  'luxembourg':'nordic-western-europe-batch','austria':'nordic-western-europe-batch',
  'liechtenstein':'nordic-western-europe-batch','new-zealand':'pacific-batch',
  'australia':'pacific-batch','canada':'anglosphere-batch','united-kingdom':'anglosphere-batch',
  'ireland':'western-europe-batch','france':'western-europe-batch','belgium':'western-europe-batch',
  'portugal':'southern-europe-batch','spain':'southern-europe-batch','italy':'southern-europe-batch',
  'greece':'southern-europe-batch','malta':'southern-europe-batch','andorra':'southern-europe-batch',
  'san-marino':'southern-europe-batch','monaco':'southern-europe-batch',
  'estonia':'eastern-europe-batch','latvia':'eastern-europe-batch','lithuania':'eastern-europe-batch',
  'czech-republic':'eastern-europe-batch','slovakia':'eastern-europe-batch',
  'hungary':'eastern-europe-batch','poland':'eastern-europe-batch','romania':'eastern-europe-batch',
  'bulgaria':'eastern-europe-batch','slovenia':'eastern-europe-batch','croatia':'eastern-europe-batch',
  'moldova':'eastern-europe-batch','belarus':'eastern-europe-batch',
  'serbia':'balkans-batch','albania':'balkans-batch','north-macedonia':'balkans-batch',
  'montenegro':'balkans-batch','bosnia-and-herzegovina':'balkans-batch',
  'georgia':'caucasus-batch','armenia':'caucasus-batch','azerbaijan':'caucasus-batch',
  'uzbekistan':'central-asia-batch','kazakhstan':'central-asia-batch','kyrgyzstan':'central-asia-batch',
  'tajikistan':'central-asia-batch','turkmenistan':'central-asia-batch',
  'taiwan':'east-asia-batch','japan':'east-asia-batch','south-korea':'east-asia-batch',
  'mongolia':'east-asia-batch','north-korea':'east-asia-batch',
  'singapore':'southeast-asia-batch','cambodia':'southeast-asia-batch','vietnam':'southeast-asia-batch',
  'thailand':'southeast-asia-batch','laos':'southeast-asia-batch','indonesia':'southeast-asia-batch',
  'philippines':'southeast-asia-batch','malaysia':'southeast-asia-batch','timor-leste':'southeast-asia-batch',
  'india':'south-asia-batch','nepal':'south-asia-batch','sri-lanka':'south-asia-batch',
  'bangladesh':'south-asia-batch','maldives':'south-asia-batch','bhutan':'south-asia-batch',
  'morocco':'north-africa-batch','tunisia':'north-africa-batch','algeria':'north-africa-batch',
  'egypt':'north-africa-batch','libya':'north-africa-batch',
  'jordan':'middle-east-batch','turkey':'middle-east-batch','syria':'middle-east-batch',
  'iraq':'middle-east-batch','palestine':'middle-east-batch','kuwait':'gcc-middle-east-batch',
  'bahrain':'gcc-middle-east-batch','oman':'gcc-middle-east-batch',
  'rwanda':'east-africa-batch','kenya':'east-africa-batch','tanzania':'east-africa-batch',
  'burundi':'east-africa-batch','djibouti':'horn-of-africa-batch','eritrea':'horn-of-africa-batch',
  'ghana':'west-africa-batch','senegal':'west-africa-batch','cote-divoire':'west-africa-batch',
  'benin':'west-africa-batch','togo':'west-africa-batch','sierra-leone':'west-africa-batch',
  'liberia':'west-africa-batch','guinea':'west-africa-batch','guinea-bissau':'west-africa-batch',
  'gambia':'west-africa-batch','niger':'sahel-batch','cameroon':'central-africa-batch',
  'republic-of-the-congo':'central-africa-batch','gabon':'central-africa-batch',
  'equatorial-guinea':'central-africa-batch','central-african-republic':'central-africa-batch',
  'comoros':'africa-islands-batch','mauritius':'africa-islands-batch','cape-verde':'africa-islands-batch',
  'seychelles':'africa-islands-batch','madagascar':'africa-islands-batch',
  'south-africa':'southern-africa-batch','namibia':'southern-africa-batch','botswana':'southern-africa-batch',
  'malawi':'southern-africa-batch','zambia':'southern-africa-batch','zimbabwe':'southern-africa-batch',
  'angola':'southern-africa-batch','mozambique':'southern-africa-batch','lesotho':'southern-africa-batch',
  'swaziland':'southern-africa-batch',
  'uruguay':'latam-southern-cone-batch','chile':'latam-southern-cone-batch',
  'argentina':'latam-southern-cone-batch','brazil':'latam-southern-cone-batch',
  'paraguay':'latam-southern-cone-batch','colombia':'latam-andean-batch','peru':'latam-andean-batch',
  'ecuador':'latam-andean-batch','guyana':'latam-andean-batch','suriname':'latam-andean-batch',
  'mexico':'north-america-batch','costa-rica':'central-america-batch','panama':'central-america-batch',
  'belize':'central-america-batch','guatemala':'central-america-batch','honduras':'central-america-batch',
  'nicaragua':'central-america-batch','dominican-republic':'caribbean-batch','jamaica':'caribbean-batch',
  'trinidad-and-tobago':'caribbean-batch','bahamas':'caribbean-batch','barbados':'caribbean-batch',
  'palau':'pacific-islands-batch','samoa':'pacific-islands-batch',
};

function batchName(slug, entity) {
  if (BATCH_COUNTRY[slug]) return BATCH_COUNTRY[slug];
  const ix = { 'fortune-500':'fortune-500-batch','ai-labs':'ai-labs-batch',
    'robotics-labs':'robotics-labs-batch','us-states':'us-states-batch',
    'us-cities':'us-cities-batch','global-cities':'global-cities-batch',
    'universities':'universities-batch' };
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

// ── Top 15 ─────────────────────────────────────────────────────────────────────
const TOP15_SLUGS = [
  'venezuela','nigeria','china','el-salvador','lebanon',
  'ukraine','south-sudan','mali','unitedhealth-group',
  'iran','sudan','russia','yemen','democratic-republic-of-c','pakistan',
];

const topEntities = TOP15_SLUGS.map(slug => {
  const r  = entityReviews.find(e => e.slug === slug);
  const ev = EV[slug];
  return {
    slug, name: r.name, index: r.index,
    priority_score: r.priority_score, news_score: r.news_score,
    base_priority: r.base_priority, staleness_score: r.staleness_score,
    importance_score: r.importance_score, volatility_score: r.volatility_score,
    tier: 'T1',
    news_summary:  ev ? ev.summary        : r.summary,
    news_sources:  ev ? (ev.sources || []) : [],
    recommendation: 'assess',
  };
});

// ── Sector alerts ──────────────────────────────────────────────────────────────
const sectorAlerts = [
  {
    alert_id: 'sa-2026-07-04-01',
    title: 'Iran: Khamenei state funeral begins July 4 — Mojtaba Khamenei new Supreme Leader; nuclear/Hormuz talks paused until July 11',
    scope: 'countries/iran, countries/bahrain, countries/qatar, countries/kuwait, countries/saudi-arabia, countries/oman, countries/uae',
    severity: 'high',
    summary: 'July 4, 2026 (Day 1 of state funeral): Casket of assassinated Supreme Leader Ali Khamenei on display in Tehran; 15-20 million mourners expected over week-long ceremonies (Tehran July 4-6, Qom July 7, Najaf/Karbala Iraq July 8, Mashhad July 9). Mojtaba Khamenei named new Supreme Leader but has not appeared in public. US-Iran nuclear and Hormuz talks explicitly paused pending conclusion of funeral; CBS News: "peace talks paused"; talks scheduled to resume July 11. Trump declared Iran is "dying to settle." Memorandum of Understanding signed June 17 (60-day deadline counting down). All GCC entities remain exposed to Strait of Hormuz instability during mourning period.',
    sources: [
      'https://www.cbsnews.com/live-updates/us-iran-war-trump-negotiations-pause-ayatollah-funeral/',
      'https://www.foxnews.com/live-news/iran-us-trump-khamenei-funeral-july-4',
      'https://eciks.org/11724-49760-iran-khamenei-funeral-peace-talks-pause',
    ],
  },
  {
    alert_id: 'sa-2026-07-04-02',
    title: 'Venezuela earthquake Day 10: official toll 2,645; UN estimates $37B direct damage; 50,000 unaccounted',
    scope: 'countries/venezuela',
    severity: 'critical',
    summary: 'July 4, 2026 (Day 10): Official death toll 2,645. UN ODRR estimates $37 billion in direct physical damage — Venezuelan government reconstruction fund ($200M) covers less than 1% of estimated need. ~50,000 still unaccounted. 12,500+ injured; 60,000 buildings damaged or destroyed. Forensic pathologist at La Guaira morgue: official figure "not even a third of what is actually there." Hospitals facing severe shortages; health crisis risk mounting with monsoon season approaching.',
    sources: [
      'https://www.wmnf.org/venezuela-earthquake-live-updates-july-4-2026/',
      'https://news.un.org/en/story/2026/07/1167850',
      'https://www.cnn.com/2026/07/02/americas/venezuela-earthquakes-morgue-death-toll-latam-intl',
    ],
  },
  {
    alert_id: 'sa-2026-07-04-03',
    title: 'Sudan RSF El Obeid: HRW July 3 "imminent atrocities" report — UNHCR supply truck destroyed July 1; 16+ civilian targets struck',
    scope: 'countries/sudan',
    severity: 'critical',
    summary: 'July 3, 2026: HRW published "Sudan: Risk of Imminent Atrocities in and around El Obeid Requires Urgent Action." RSF drone strikes: 16+ civilian/service targets damaged including hospitals, schools, power stations, fuel depots; food prices surged 300%. July 1: UNHCR truck carrying 50 MT of relief items destroyed in drone strike on Tendelti (White Nile State). 500,000 civilians + 105,000 IDPs at siege risk. UN Rights Chief Turk: "Stop this madness." Amnesty July 2026 report confirming RSF crimes against humanity at El Fasher. Sudan has more people in famine than rest of world combined.',
    sources: [
      'https://www.hrw.org/news/2026/07/03/sudan-risk-of-imminent-atrocities-in-and-around-el-obeid-requires-urgent-action',
      'https://sudantribune.com/article/315813',
      'https://www.aljazeera.com/editorial/2026/7/2/fears-of-new-massacre-in-sudans-el-obeid-what-do-we-know',
    ],
  },
  {
    alert_id: 'sa-2026-07-04-04',
    title: 'Afghanistan-Pakistan conflict: June 28-29 Pakistani strikes killed 36 civilians (Taliban claim); active war with multiple 2026 ceasefire collapses',
    scope: 'countries/afghanistan, countries/pakistan',
    severity: 'high',
    summary: 'June 28-29, 2026: Pakistan launched ground operation and airstrikes against TTP targets in Paktia, Paktika, Kunar. Afghan Taliban reported 36 civilians killed and 163 injured; Pakistan disputes figures. Multiple 2026 ceasefire collapses. Militants killed 3 Pakistani rangers in Karachi June 27. Cumulative Q1 2026: 372 Afghan civilians killed / 397 injured (UNAMA). 115,000+ displaced in Afghanistan. Conflict compounding severe food insecurity (15.8M Afghans need emergency food).',
    sources: [
      'https://en.wikipedia.org/wiki/2026_Afghanistan-Pakistan_war',
      'https://www.aljazeera.com/news/2026/6/29/pakistan-says-its-security-forces-killed-29-fighters-along-afghan-border',
    ],
  },
  {
    alert_id: 'sa-2026-07-04-05',
    title: 'Haiti: SCOTUS June 25 allows ending TPS for 350,000 Haitians — gang control 90% Port-au-Prince; 52% food insecure',
    scope: 'countries/haiti, countries/united-states',
    severity: 'high',
    summary: 'June 25, 2026: US Supreme Court ruled 6-3 allowing termination of Temporary Protected Status for Haitians and Syrians. ~350,000 Haitians at risk of deportation; remittances (15%+ of Haiti GDP) threatened. US District Judge separately ruled DHS decision unlawful — legal uncertainty ongoing. Background: ~90% of Port-au-Prince under gang control; 1.45M+ internally displaced. 5.8M Haitians (52%) at crisis food insecurity; 1.8M at emergency levels. 6.4M need humanitarian assistance; only 24% of required funding secured.',
    sources: [
      'https://globalvoices.org/2026/07/04/what-the-ending-of-the-u-s-temporary-protection-status-could-mean-for-haiti/',
      'https://www.politifact.com/article/2026/jun/29/Supreme-Court-TPS-Haitians-safe-Markwayne-Mullin/',
      'https://news.un.org/en/story/2026/04/1167362',
    ],
  },
];

// ── Assemble scan ──────────────────────────────────────────────────────────────
const scan = {
  scan_date: SCAN_DATE,
  scan_start: `${SCAN_DATE}T02:00:00Z`,
  scan_end:   `${SCAN_DATE}T02:56:00Z`,
  lookback_window_days:  LOOKBACK_DAYS,
  lookback_window_start: LOOKBACK_START,
  lookback_window_end:   LOOKBACK_END,
  entities_scanned:   entityReviews.length,
  searches_performed: 62,
  tier_breakdown: { tier_1_individual: 26, tier_2_batched: 31, tier_3_sector_sweeps: 5 },
  top_entities:    topEntities,
  rotation_backfill: [],
  sector_alerts:   sectorAlerts,
  entity_reviews:  entityReviews,
  stats: {
    entities_scanned:       entityReviews.length,
    entities_with_evidence: withEvidence,
    entities_assess:        15,
    entities_rotation:      0,
    tier_1_entities:        T1.size,
    tier_2_entities:        entityReviews.length - T1.size,
    tier_3_sweeps:          5,
    searches_performed:     62,
    sector_alerts:          5,
    lookback_window:        `${LOOKBACK_START} to ${LOOKBACK_END}`,
  },
};

// ── Write files ────────────────────────────────────────────────────────────────
fs.writeFileSync(
  path.join(ROOT, 'research/scans/2026-07-04.json'),
  JSON.stringify(scan, null, 2)
);

const erPayload = { date: SCAN_DATE, lookback_window_days: LOOKBACK_DAYS, reviews: siteReviews };
fs.writeFileSync(
  path.join(ROOT, 'site/src/data/evidence-reviews/2026-07-04.json'),
  JSON.stringify(erPayload, null, 2)
);
fs.writeFileSync(
  path.join(ROOT, 'site/src/data/evidence-reviews/latest.json'),
  JSON.stringify(erPayload, null, 2)
);

// Update rotation state — timestamps only, NO composites/bands/ranks
for (const slug of Object.keys(entities)) {
  entities[slug].last_scanned       = SCAN_DATE;
  entities[slug].last_evidence_touch = SCAN_DATE;
}
rotationState.last_updated = SCAN_DATE;
fs.writeFileSync(
  path.join(ROOT, 'research/rotation-state.json'),
  JSON.stringify(rotationState, null, 2)
);

// ── Summary ────────────────────────────────────────────────────────────────────
console.log('=== 2026-07-04 SCAN COMPLETE ===');
console.log('entities_scanned       :', entityReviews.length);
console.log('entities_with_evidence :', withEvidence);
console.log('searches_performed     : 62  (T1:26  T2:31  T3:5)');
console.log('top_entities (15)      :', topEntities.map(e => e.slug + ':' + e.priority_score).join(', '));
console.log('sector_alerts          :', sectorAlerts.length);
console.log('rotation_backfill      : 0');
console.log('Top entity tiers       :', topEntities.map(e => e.tier).join(', '));
