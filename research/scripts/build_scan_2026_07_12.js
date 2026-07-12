'use strict';
/**
 * Nightly Evidence Scanner — 2026-07-12
 * Outputs:
 *   research/scans/2026-07-12.json
 *   site/src/data/evidence-reviews/2026-07-12.json
 *   site/src/data/evidence-reviews/latest.json
 * Updates: research/rotation-state.json (timestamps only — NO composite/band/rank changes)
 */

const fs   = require('fs');
const path = require('path');

const ROOT           = 'C:/Users/philk/applied-compassion-benchmark';
const SCAN_DATE      = '2026-07-12';
const LOOKBACK_START = '2026-06-28';
const LOOKBACK_END   = '2026-07-12';
const LOOKBACK_DAYS  = 14;

const rotationState = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'research/rotation-state.json'), 'utf8')
);
const entities = rotationState.entities;

// ── Pending proposals (only entries with status "proposed" count) ─────────────
const proposalsDir = path.join(ROOT, 'research/change-proposals');
const pendingSlugs = new Set();
for (const f of fs.readdirSync(proposalsDir)) {
  if (!f.endsWith('.json')) continue;
  try {
    const j = JSON.parse(fs.readFileSync(path.join(proposalsDir, f), 'utf8'));
    if (j.status === 'proposed') pendingSlugs.add(j.slug || f.replace(/\.json$/, ''));
  } catch (e) { /* skip */ }
}

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
  'north-korea','libya','bolivia',
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
function basePriority(slug, e) {
  return staleness(e.last_assessed) + importance(e.index)
       + volatility(e.composite, slug) + pending(slug);
}

// ── T1 individually-searched entities (32) ─────────────────────────────────────
const T1 = new Set([
  'tunisia','venezuela','china','pakistan','nigeria','lebanon','cuba','sudan',
  'israel','palestine','ukraine','russia','south-sudan','myanmar','yemen','uganda',
  'iran','haiti','mali','burkina-faso','anthropic','apple','princeton-university',
  'meta-platforms','xai-grok','unitedhealth-group','el-salvador','afghanistan',
  'somalia','ethiopia','bolivia','united-states','democratic-republic-of-c',
]);

// ── Real-search evidence map (dated within 2026-06-28 to 2026-07-12 unless noted) ──
const EV = {
  'tunisia': { news_score: 40, evidence_found: true,
    summary: "MASS SENTENCING OF OPPOSITION FIGURES — PENDING PROPOSAL RE-SURFACED, DAY 3 (Jul 8, within window, NEW): A Tunis court sentenced 21 people — including Ennahda party leaders, former government officials and lawyers — to prison terms of 12 to 35 years on vague terrorism/state-security charges. Rached Ghannouchi, former Ennahda president detained since April 2023, received a 14-year sentence in absentia (his latest of several convictions). This followed the closing (Jul 8) of the 62nd UN Human Rights Council session, where UN experts and civil society warned continued member-state silence gives Tunisian authorities a \"free pass\" to escalate the crackdown on civic space. This is the same evidentiary basis underlying the 2026-07-10 downgrade proposal (34.4 -> 23.8), which remains OPEN and unreviewed by the founder (status: proposed, day 3). Published composite (34.4) unchanged; proposal not applied.",
    sources: ['https://www.hrw.org/news/2026/07/08/sounding-the-alarm-over-tunisias-crackdown','https://allafrica.com/stories/202607080239.html','https://www.ohchr.org/en/press-releases/2026/05/turk-calls-tunisia-end-repressive-measures-against-civil-society-and-media'] },

  'venezuela': { news_score: 40, evidence_found: true,
    summary: "EARTHQUAKE DAY 18-19 — TOLL CLIMBS TO 4,333, USGS WARNS FINAL COUNT COULD REACH 10,000-100,000 (Jul 11, within window, NEW): National Assembly President Jorge Rodriguez said Jul 11 the official death toll from the Jun 24 twin earthquakes rose to 4,333 (up from 3,889 on Jul 10), with 16,740 injured and 17,854 left without housing; 12,800+ remain in 80 shelters across Caracas/La Guaira. USGS estimates the final death toll will most likely fall between 10,000 and 100,000 given the scale of devastation. Government response remains widely criticized: disapproval of the handling reached 63.3% in June; acting President Delcy Rodriguez has made only brief site visits while relying on produced-video messaging; Venezuelans place greater trust in NGOs, doctors and opposition figures than the state for relief efforts.",
    sources: ['https://www.bloomberg.com/news/articles/2026-07-11/venezuela-earthquake-death-toll-climbs-to-more-than-4-300','https://www.cnn.com/2026/07/08/americas/venezuela-earthquake-delcy-rodriguez-intl-latam','https://www.pbs.org/newshour/world/in-venezuela-a-completely-ineffective-government-worsens-earthquake-disaster-experts-say'] },

  'china': { news_score: 20, evidence_found: true,
    summary: "SUSTAINED — ETHNIC UNITY LAW / HONG KONG CRACKDOWN CONTINUE, NO DISTINCT NEW DATED ESCALATION THIS WINDOW: China's Ethnic Unity and Progress Law (effective Jul 1) and its claimed extraterritorial reach remain in force; Hong Kong national-security enforcement continues per prior reporting. No newly and reliably dated escalation beyond the previously confirmed record (Jul 2 Tibetan self-immolation at UN HQ, already reflected in the 2026-07-11 cycle) surfaced this window. Note: search results also surfaced Dalai Lama 90th-birthday-related monastery crackdown and a named student-activist arrest, but these read as drawn from HRW's World Report 2026 China chapter (which principally covers 2025-period events) rather than freshly-dated July 2026 incidents — excluded from scoring pending date verification (see false_positives_screened).",
    sources: ['https://www.hrw.org/world-report/2026/country-chapters/china','https://hongkongfp.com/2026/07/05/explainer-hong-kongs-national-security-crackdown-month-72/'] },

  'pakistan': { news_score: 40, evidence_found: true,
    summary: "OPERATION SHAABAN TOLL RISES TO 102 (Jul 11-12, within window, NEW): Following coordinated insurgent assaults across Balochistan Jul 4-8 that killed 42 (38 security personnel, 4 civilians, including a police-checkpoint raid in Ziarat and a highway ambush in Lasbela), Pakistan's Operation Shaaban — run jointly by the Army, Frontier Corps Balochistan and Balochistan Police — has killed a cumulative 102 alleged militants as of Jul 12 (state media/ISPR), up from 88 on Jul 11 and 75 on Jul 10; casualty figures are security-source-reported and not independently verified. PM Shehbaz Sharif blamed India for facilitating the attacks and traveled to Quetta vowing continued operations. Continues and intensifies the confirmed Afghanistan-Pakistan/domestic-insurgency pattern.",
    sources: ['https://www.pakistantoday.com.pk/2026/07/12/operation-shaban-toll-rises-to-102-as-23-more-terrorists-neutralized-in-balochistan','https://en.dailypakistan.com.pk/11-Jul-2026/operation-shaban-intensifies-as-another-nine-militants-eliminated-in-balochistan','https://en.wikipedia.org/wiki/July_2026_Balochistan_attacks'] },

  'nigeria': { news_score: 20, evidence_found: true,
    summary: "SUSTAINED — WFP/CADRE HARMONISE HUNGER RECORD RECONFIRMED, NO MATERIAL NEW ESCALATION THIS WINDOW: The Jul 2 WFP/Cadre Harmonise report (36.2M nationally food insecure; 17M+ across nine northern states at crisis/emergency/catastrophe levels; Borno 3M+ acutely food insecure, 750,000+ in severe hunger, 10,000+ at catastrophe; WFP able to support only 740,000 of 6.2M in need in three northeast states) continues to be the operative record this window with no materially new dated escalation beyond it. WFP still requires $89M over six months to sustain assistance; funding-shortfall-driven suspensions continue to be linked to exploitation and gender-based-harm risk for women and children.",
    sources: ['https://www.globalsecurity.org/military/library/news/2026/07/mil-260702-wfp01.htm','https://www.thisdaylive.com/2026/07/03/conflict-funding-cuts-push-northern-nigeria-hunger-crisis-to-worst-level-in-nearly-a-decade-wfp-warns/'] },

  'lebanon': { news_score: 40, evidence_found: true,
    summary: "FRESH CEASEFIRE-VIOLATION STRIKES JUL 10 AND JUL 12 (within window, NEW): A drone strike killed one man on his motorcycle and seriously injured another in the southern town of Kafr Rumman on Jul 10 (Lebanese state media NNA). On Jul 12 (day of scan), Israel struck the Al-Mashaa neighborhood of Al-Mansouri in southern Lebanon, injuring seven, despite the truce agreed as part of the Iran-ceasefire framework; Israel is nominally expected to withdraw from two southern areas in the coming days per the US-brokered agreement. Continues the sustained pattern of Israeli strikes in the Nabatieh/south Lebanon area since the ceasefire; background record of 4,000+ killed since Mar 2 resumption and 1M+ displaced unchanged.",
    sources: ['https://www.nation.com.pk/12-Jul-2026/israel-continues-strikes-southern-lebanon-despite-ceasefire','https://en.wikipedia.org/wiki/2026_Israel%E2%80%93Lebanon_ceasefire'] },

  'cuba': { news_score: 20, evidence_found: true,
    summary: "FOURTH NATIONWIDE BLACKOUT OF 2026 — GRID COLLAPSED TWICE IN FIVE DAYS (Jul 10, within window, NEW): Cuba's national electric grid collapsed for the second time in five days on Jul 10 (the fourth total islandwide blackout of 2026), following the Jul 7 third blackout. Energy Minister Vicente de la O Levy: \"We have absolutely no fuel, oil, and absolutely no diesel\" — Cuba produces only 40% of needed fuel; generating capacity (935 MW) runs far below demand (3,100 MW) after the aging Soviet-era grid lost reserve redundancy. Cubalex documented at least 38 detentions tied to June's cacerolazo protests (including six minors); HRW counts 700+ political prisoners, Prisoners Defenders reports 1,200+. Moderate escalation of the sustained energy-crisis/repression record; no new mass-casualty event confirmed.",
    sources: ['https://www.techtimes.com/articles/320188/20260711/cuba-grid-collapses-twice-five-days-fuel-starvation-stripped-all-redundancy.htm','https://www.aljazeera.com/news/2026/7/7/cuba-sees-nationwide-power-blackout-for-third-time-in-six-months'] },

  'sudan': { news_score: 20, evidence_found: true,
    summary: "SUSTAINED — EL OBEID SIEGE CONTINUES, NO DISTINCT NEW DATED ESCALATION THIS WINDOW BEYOND PREVIOUSLY CONFIRMED RECORD: Half a million civilians remain trapped in El Obeid under RSF siege, without electricity for nearly a month; roughly 16+ civilian/service targets (hospitals, schools, power stations, fuel depots) have been damaged and food prices have surged up to 300%. \"Relentless\" RSF drone strikes were still being reported as of Jul 10. The UN Human Rights Council's urgent inquiry (opened week of Jul 8) and OHCHR's warning that El Obeid must not become \"the next crime scene\" remain the operative record; no new dated mass-casualty escalation confirmed this window. Floor-level (0.0) confirmation sustained.",
    sources: ['https://www.aljazeera.com/news/2026/7/6/el-obeid-under-siege-by-rsf-could-this-be-sudans-next-el-fasher','https://www.aljazeera.com/video/newsfeed/2026/7/10/sudans-el-obeid-faces-intensifying-rsf-drone-attacks','https://news.un.org/en/story/2026/07/1167871'] },

  'israel': { news_score: 40, evidence_found: true,
    summary: "GAZA CEASEFIRE VIOLATIONS CONTINUE — 5 MORE KILLED JUL 12, TOLL SINCE CEASEFIRE NOW 1,098+ (within window, NEW): Five Palestinians, including a child, were killed Jul 12 (day of scan) by Israeli army fire despite the ceasefire in effect since Oct 10, 2025 (Middle East Monitor). This follows a Jul 9 incident killing 12 and injuring 20, and a Jul 6 incident killing at least 6. Cumulative confirmed toll since the ceasefire began: at least 1,098 killed and 3,535 injured (Gaza Ministry of Health). IDF retains control of ~70% of the Strip per the May 28 Netanyahu order. Total Palestinian deaths since Oct 2023 confirmed above 73,100. Sustained and freshly-dated floor-level (0.0) confirmation.",
    sources: ['https://www.middleeastmonitor.com/20260712-5-more-gazans-killed-by-israeli-fire-despite-ceasefire/','https://www.aljazeera.com/news/2026/7/9/israeli-attacks-on-gaza-kill-10-people-in-24-hours-despite-ceasefire','https://www.aljazeera.com/news/2026/7/6/israeli-attacks-on-gaza-kill-at-least-6-as-ceasefire-violations-continue'] },

  'palestine': { news_score: 20, evidence_found: true,
    summary: "SUSTAINED — GAZA/WEST BANK HUMANITARIAN APPEAL AND CEASEFIRE-VIOLATION PATTERN CONTINUE (within window): The $4.1B 2026 Flash Appeal for the Occupied Palestinian Territory (3.6M people across Gaza and the West Bank) remains the operative humanitarian record; laboratories and blood banks remain near total shutdown from supply shortages. Fresh dated ceasefire-violation casualties this window are tracked under the Israel entity (Jul 12: 5 killed; Jul 9: 12 killed/20 injured). West Bank record of displacement, demolitions, settler violence and movement restriction continues unabated per the Flash Appeal.",
    sources: ['https://press.un.org/en/2026/sc16390.doc.htm','https://www.unocha.org/publications/report/world/press-release-life-life-un-launches-33-billion-aid-appeal-urgent-call-global-solidarity'] },

  'ukraine': { news_score: 20, evidence_found: true,
    summary: "SUSTAINED — RECORD JULY STRIKE PACE ALREADY REFLECTED, NO NEW STRIKE CONFIRMED THIS SPECIFIC CYCLE: The Jul 2 Kyiv strike (22+ killed, 130+ residential sites damaged) and the Jul 6 second strike (14+ killed, 46 injured, 68 missiles + 351 drones) remain the operative record for this 14-day window; both were already reflected in the 2026-07-11 confirmed cycle. No newly-dated mass-casualty strike beyond these was confirmed as of Jul 12. Ukrainian drone strikes on Russia's Omsk refinery (deep in Siberia) continue retaliatory operations. UN Human Rights Monitoring Mission's assessment that 2026 civilian casualties are running \"significantly higher\" than 2025 remains the operative baseline.",
    sources: ['https://www.aljazeera.com/news/2026/7/2/kyiv-attacked-after-ukraines-zelenskyy-warns-of-massive-russian-strike','https://www.aljazeera.com/news/2026/7/6/russian-attacks-on-ukraine-kill-11-on-eve-of-nato-summit-authorities-say'] },

  'russia': { news_score: 20, evidence_found: true,
    summary: "SUSTAINED — SAME JUL 2/JUL 6 STRIKE CAMPAIGN AS UKRAINE ENTRY, NO NEW ATTRIBUTION EVENT THIS CYCLE: Russian missile/drone strikes on Kyiv (Jul 2: 22+ killed; Jul 6: 14+ killed) remain the operative and previously-confirmed record for this window; attribution to Russia unchanged. No new dated strike or accountability development beyond the sustained pattern was confirmed as of Jul 12. Floor-level (0.0) confirmation sustained.",
    sources: ['https://www.aljazeera.com/news/2026/7/2/kyiv-attacked-after-ukraines-zelenskyy-warns-of-massive-russian-strike'] },

  'south-sudan': { news_score: 20, evidence_found: true,
    summary: "SUSTAINED — APR-JUL 2026 IPC PROJECTION REMAINS OPERATIVE, NO DISTINCT NEW ESCALATION THIS WINDOW: 7.8M people (56% of population) remain at IPC Phase 3+ for the Apr-Jul 2026 period; 73,300 at Catastrophe (Phase 5) across four counties in Jonglei and Upper Nile; 2.2M children acutely malnourished. This is the same seasonal IPC projection cited in the 2026-07-11 confirmed cycle, not a newly-dated escalation within this window. Floor-level (0.0) confirmation sustained, not a fresh trigger.",
    sources: ['https://www.ipcinfo.org/ipc-country-analysis/details-map/en/c/1163302'] },

  'myanmar': { news_score: 20, evidence_found: true,
    summary: "SUSTAINED — POST-COUP 100,000+ DEATH-TOLL MILESTONE ALREADY REFLECTED, NO NEW ESCALATION THIS WINDOW: ACLED's confirmation that conflict-related fatalities since the Feb 2021 coup exceed 100,000 (100,114) was newly reported and reflected in the 2026-07-11 confirmed cycle; no further escalation or new dated milestone surfaced this window. Myanmar remains assessed as the second-largest active armed conflict globally after the Palestinian conflict. Floor-level (0.0) confirmation sustained.",
    sources: ['https://thedefensepost.com/2026/07/01/myanmar-post-coup-casualties/amp/'] },

  'yemen': { news_score: 40, evidence_found: true,
    summary: "LARGEST PRISONER EXCHANGE REMAINS COLLAPSED — RENEWED COMMITMENTS SOUGHT AMID STC OPPOSITION (Jul 11, within window, NEW): Following the Jul 10 indefinite postponement of the UN/ICRC-brokered ~1,700-1,750-detainee exchange (the largest since the conflict began, agreed May 14 in Amman), UN Special Envoy Hans Grundberg said Jul 11 he received \"renewed commitments\" from Yemen's government and the Houthis to implement the deal — but the dissolved Southern Transitional Council intensified tribal/political mobilization against releasing eight Houthi-list detainees just days before the exchange was to begin, placing the deal further in jeopardy. The anticipated rare positive development remains unresolved and stalled. Floor-level (0.0) humanitarian confirmation sustained (73 UN staff detained, 450+ health facilities closed, 18.3M acutely food insecure).",
    sources: ['https://www.middleeastmonitor.com/20260711-un-envoy-says-yemen-parties-renew-commitment-to-delayed-prisoner-exchange/','https://www.aljazeera.com/features/2026/7/11/what-is-going-on-in-yemen'] },

  'uganda': { news_score: 20, evidence_found: true,
    summary: "SUSTAINED — MARBURG CASE (JUN 30) AND BUNDIBUGYO EBOLA (20 CONFIRMED/2 DEATHS) CONTINUE, NO NEW ESCALATION THIS WINDOW: Uganda's Jun 30 confirmed Marburg case (Kyegegwa District, a 17-month-old child identified via enhanced Ebola surveillance) remains isolated with no further symptomatic contacts per Africa CDC. Uganda continues managing 20 confirmed Ebola (Bundibugyo strain) cases and 2 deaths tied to the DRC outbreak; DRC border remains closed since May 27 with 21-day isolation in effect. Managing two concurrent viral hemorrhagic fever threats continues to complicate the regional public-health response; no new Uganda-specific escalation confirmed this window.",
    sources: ['https://www.statnews.com/2026/06/30/marburg-virus-cases-ugandan-ebola-outbreak-zone/','https://medicalxpress.com/news/2026-07-marburg-virus-case-uganda.html'] },

  'iran': { news_score: 40, evidence_found: true,
    summary: "CEASEFIRE COLLAPSE DEEPENS — US STRIKES IRAN AGAIN JUL 11, RETALIATION NOW HITS FOUR GULF STATES (within window, NEW): The US military attacked Iran again in the early hours of Jul 11 after Iran struck three commercial ships in the Strait of Hormuz, setting one container ship ablaze; Washington separately revoked Iran's ability to openly sell crude oil. Iran's Revolutionary Guard Corps retaliated by targeting more than 80 US military facilities across Bahrain and Kuwait, and additionally struck Jordan and Qatar — a widening from the Jul 8 pattern (previously Bahrain/Kuwait only). Kuwaiti forces are actively intercepting \"hostile aerial targets.\" Washington's core demands (Iran surrender enriched uranium, declare Hormuz toll-free) remain unmet; Pakistan and Qatar are mediating a possible new round of talks, potentially in Switzerland. Execution-rate and repression baseline (784+ YTD) remains in force.",
    sources: ['https://www.npr.org/2026/07/11/g-s1-133212/us-iran-vessel-attack-strait-hormuz-gulf','https://www.cnn.com/2026/07/11/world/live-news/iran-war-trump','https://www.axios.com/2026/07/10/trump-iran-talks-ceasefire-over'] },

  'haiti': { news_score: 20, evidence_found: true,
    summary: "HRW JUL 2 REPORT — HAITIANS 'SET TO LOSE PROTECTIONS, RISK RETURN TO VIOLENCE' (within window, NEW): Human Rights Watch published a dedicated report Jul 2, 2026 warning that ending TPS exposes Haitians to gang violence amid an active security crisis; gang violence has killed 2,300+ and injured 1,100+ nationally since the start of 2026 (as of mid-June), with 26+ heavily armed gangs controlling up to 90% of Port-au-Prince and surrounding areas through summary executions, extortion and kidnapping. 6.4M Haitians remain in need of humanitarian assistance; nearly 1.5M are displaced. The Jun 25 SCOTUS TPS ruling continues implementation (Jul 24 work-authorization expiration date per USCIS/E-Verify guidance); ~350,000 Haitians remain at risk.",
    sources: ['https://www.hrw.org/news/2026/07/02/us-haitians-set-to-lose-protections-risk-return-to-violence','https://haitiantimes.com/2026/07/02/supreme-court-tps-ruling-little-haiti-brooklyn-haitians/'] },

  'mali': { news_score: 40, evidence_found: true,
    summary: "JNIM/FLA COUNTRYWIDE OFFENSIVE CONTINUES — SIX-DAY ANEFIS BATTLE, MALI CLAIMS BLOCKADE BROKEN AT NORTHERN BASE (within window, NEW): JNIM and its Tuareg-aligned FLA allies renewed a countrywide offensive Jul 4, striking the Gao military base and bases at Aguelhok and Anefis; FAMA and Russia's Africa Corps repelled the Aguelhok and Gao attacks, but fighting at Anefis continued for six consecutive days — underscoring JNIM's growing capacity to project simultaneous pressure. Mali's military announced Jul 10 it had broken a rebel blockade around a separate strategic northern army base, a claimed tactical gain amid the broader offensive. The Bamako fuel/food siege (imposed since Sept 2025) continues unbroken, still blocking major supply roads to the capital.",
    sources: ['https://www.criticalthreats.org/analysis/jnim-fla-mali-sudan-rsf-saf-car-russia-burundi-drc-m23','https://www.washingtontimes.com/news/2026/jul/10/mali-military-says-broken-rebel-blockade-around-strategic-northern/','https://www.riotimesonline.com/mali-fuel-blockade-bamako-siege-2026/'] },

  'burkina-faso': { news_score: 40, evidence_found: true,
    summary: "CONTINUED ATTACKS — 22 KILLED NEAR DEDOUGOU, THIRD ATTACK AT SEGUENEGA, 400+ MILITANTS CLAIMED NEUTRALIZED (within window): At least 22 soldiers and civilian militia (14 military + 7 civilian army volunteers) were killed in a suspected JNIM attack on a military base at Di, near Dedougou, over the weekend of Jul 4-5 (reported Jul 8); a further attack struck Solhan and a third targeted a military post at Seguenega near Kaya. JNIM (Al-Qaeda-affiliated) claimed responsibility for \"several attacks against positions of the Burkinabe army.\" Burkinabe forces separately claimed 400+ assailants neutralized in a large counter-offensive (reported Jul 2). Tensions between the ruling junta and France continue amid accusations the latter supports jihadist groups. Sustained and intensifying Sahel-conflict pattern.",
    sources: ['https://thedefensepost.com/2026/07/08/burkina-jihadists-kill-soldiers-militia/','https://burkina-faso.news-pravda.com/en/world/2026/07/11/7290.html','https://punchng.com/suspected-jihadists-kill-at-least-22-soldiers-militia-in-burkina-faso/'] },

  'anthropic': { news_score: 20, evidence_found: true,
    summary: "CHINA REGULATOR ALLEGES UNDISCLOSED TELEMETRY IN CLAUDE CODE — AMBIGUOUS RE: CONVERSION TRIGGER, FLAGGED FOR ASSESSOR REVIEW (Jul 9-10, within window, NEW): A cybersecurity platform run by China's Ministry of Industry and Information Technology (National Vulnerability Database) posted an alert warning of a \"backdoor\" security risk in Anthropic's Claude Code, alleging its built-in monitoring can transmit a user's location and identity to a remote server without consent. Anthropic states the mechanism was an experimental tool deployed to prevent IP theft and model distillation by Chinese competitors, not a consumer-facing disclosure failure. This is a materially different fact pattern from the specified conversion trigger (\"a second undisclosed telemetry episode OR a regulator/court deceptive-practice finding\") in that the allegation originates from a rival government's cybersecurity agency amid AI-export tensions rather than a US/EU consumer-protection regulator or court — but it does describe an undisclosed telemetry mechanism. Recommend assessor determine whether this constitutes or contributes toward the conversion trigger; boundary-watch status (59.1, 0.9 below Established/60.0) not resolved either way this cycle. Separately, Anthropic's redeployed Fable 5 safety classifier was independently tested and approved by the government's CAISI before Jun 12 export controls were lifted.",
    sources: ['https://securityboulevard.com/2026/07/china-warns-of-backdoor-in-anthropics-claude-code-amid-rising-ai-geopolitics/','https://securityonline.info/claude-code-telemetry-rollback/','https://www.technology.org/2026/07/10/china-anthropic-claude-code-backdoor-warning/'] },

  'apple': { news_score: 0, evidence_found: false,
    summary: "SCREENED — NO MATERIAL EVIDENCE WITHIN WINDOW: Individual search performed. The DOJ's ongoing antitrust suit alleging Apple maintains an illegal \"walled garden\" monopoly via iMessage/hardware restrictions (reported Jul 8) is a competition/market-structure dispute, out of compassion-relevance scope (not stakeholder-welfare, safety, labor, equity, or governance). The $18.25M DOJ hiring-discrimination back-pay distribution to affected workers was announced in May 2026, outside the 14-day window. Boundary-watch status (59.4, 0.6 below Established/60.0) sustained without new evidence this window.",
    sources: [] },

  'princeton-university': { news_score: 0, evidence_found: false,
    summary: "SCREENED — OUT OF SCOPE, NO NEW MATERIAL EVIDENCE: Individual search performed. Princeton announced eight new Board of Trustees appointments (effective Jul 1) — routine governance/board-composition news, not a stakeholder-welfare, safety, labor, equity or governance-failure signal per scope rules. The universal exam proctoring policy (effective Jul 1) remains an academic-integrity/administrative change, consistent with prior-cycle screening. Boundary-watch status (57.8, 2.2 below Established/60.0) sustained without new evidence this window.",
    sources: [] },

  'meta-platforms': { news_score: 20, evidence_found: true,
    summary: "SUSTAINED — $1.4T YOUTH-SAFETY PENALTY CLAIM REMAINS ACTIVE, NO INCREMENTAL NEW DEVELOPMENT THIS SPECIFIC CYCLE: State attorneys general (California, New Jersey, Colorado, Kentucky, and others among 40+ states with claims) continue seeking penalties of up to $1.4 trillion over allegations Meta knowingly designed Facebook/Instagram to be addictive to teens — a figure representing a large share of Meta's ~$1.5T market cap. This was reported Jul 7 and remains the operative record; a second bellwether trial begins Jul 27, 2026, ahead of the main August trial. Meta continues to dispute the claims and has failed to get them dismissed. Critical-band (7.8) record sustained and continuing to escalate toward trial.",
    sources: ['https://www.jurist.org/news/2026/07/meta-says-state-ags-seek-1-4t-over-youth-safety-claims/','https://gizmodo.com/metas-teen-safety-case-just-became-a-1-4-trillion-existential-threat-2000782306'] },

  'xai-grok': { news_score: 20, evidence_found: true,
    summary: "SUSTAINED — DEEPFAKE-CSAM CLASS ACTION EXPANSION REMAINS ACTIVE, CORPORATE REBRAND NOTED: The Jul 7 amendment adding Jane Does 4-5 (including a Wyoming minor whose stepfather generated 7,000+ CSAM images via Grok) and Stability AI as co-defendant remains the operative record with no further incremental legal development confirmed this specific cycle. Note: the company has rebranded as \"SpaceXAI\" following its merger with SpaceX earlier in 2026. Floor-level (0.0) confirmation sustained.",
    sources: ['https://cyberscoop.com/deepfake-csam-lawsuit-grok-xai-expands-stability-ai/','https://www.lieffcabraser.com/2026/07/deepfake-victims-bolster-class-action-against-xai-add-stability-ai/'] },

  'unitedhealth-group': { news_score: 10, evidence_found: true,
    summary: "SUSTAINED — DOJ MEDICARE ADVANTAGE PROBE CONTINUES, NO NEW DATED ESCALATION THIS WINDOW: DOJ's criminal probe into Optum Rx and physician-reimbursement arrangements and its civil probe into inflated Medicare Advantage diagnoses continue; UnitedHealth's internal third-party review remains ongoing. The Q2 2026 earnings call (Jul 29) is a forward-looking event that has not yet occurred. No newly-dated escalation distinct from the previously-confirmed record found within the 14-day window.",
    sources: ['https://www.medicaleconomics.com/view/unitedhealth-group-under-doj-investigation-over-medicare-billing-practices'] },

  'el-salvador': { news_score: 10, evidence_found: true,
    summary: "SUSTAINED — NO NEW MATERIAL ESCALATION, RECURRING DATE-VERIFICATION ISSUE CONFIRMED AGAIN: Individual search performed. HRW's World Report 2026 chapter language referencing a July constitutional amendment removing presidential term limits continues to surface in search indexes; this is very likely the same Jul 31, 2025 amendment already date-verified and screened in the 2026-07-11 cycle (World Report chapters cover the prior calendar year), not a fresh 2026 event — excluded again from scoring pending confirmation (see false_positives_screened). Underlying severe record (86 political prisoners, 245+ persecuted since Bukele took power, ~1.9% of the population imprisoned — the highest rate in the world) is unchanged since the 2026-07-05 applied downgrade (20.3 -> 15.0).",
    sources: [] },

  'afghanistan': { news_score: 20, evidence_found: true,
    summary: "SUSTAINED — JUL 1 TALIBAN DRONE STRIKES INTO PAKISTAN ALREADY REFLECTED, NO NEW ESCALATION THIS WINDOW: The Jul 1 Taliban drone strikes into Pakistan's Balochistan (first direct aerial assault on Pakistani territory in this conflict) remain the operative record, already confirmed in the 2026-07-11 cycle. Peace talks remain deadlocked with no comprehensive ceasefire; the underlying Q1 2026 record (372 Afghan civilians killed/397 injured per UNAMA) is unchanged. No new dated escalation confirmed this window.",
    sources: ['https://easternherald.com/2026/07/02/afghanistan-drones-pakistan-balochistan-border-war-july-2026/'] },

  'somalia': { news_score: 20, evidence_found: true,
    summary: "NEW ATTACKS ON ETHIOPIAN TROOPS AND ARMY BASE — FAMINE-RISK RECORD SUSTAINED (Jul 9, Jul 11, within window, NEW): Al-Shabaab reportedly attacked Ethiopian troops stationed at Wajid Airport (Bakool) on Jul 11 while a military aircraft was unloading supplies, and launched a heavy overnight assault on a Somali army base in the Birbiraha area of Luuq district (Gedo) on Jul 9. Underlying humanitarian record remains severe: ~6M people (31% of the population) face Crisis-or-worse acute food insecurity Apr-Jun 2026; ~1.9M children suffer acute malnutrition; Al-Shabaab continues taxing/confiscating food, water and livestock, compounding the crisis.",
    sources: ['https://www.crisisgroup.org/africa/horn-africa/somalia/al-shabaab-and-somalias-spreading-famine','https://www.cfr.org/global-conflict-tracker/conflict/al-shabab-somalia'] },

  'ethiopia': { news_score: 20, evidence_found: true,
    summary: "SUSTAINED — ETHIOPIA-ERITREA WAR-RISK CONTINUES, NO NEW DATED CLASH THIS WINDOW; MOST STALE T1 RECORD: Analyses continue to describe escalating Ethiopia-Eritrea tension over Red Sea/Assab port access and mutual accusations of proxy support to Tigray/Fano-region armed actors; both sides maintain troop buildups at the shared border. Experts continue to warn a renewed war could draw in 10-15 countries across three continents (\"Africa's Second World War\" risk). No confirmed new clash or dated escalation within the 14-day window; this entity remains the most stale in the T1 set (last assessed 2026-06-10, 32 days prior), warranting priority reassessment attention independent of fresh news.",
    sources: ['https://www.atlanticcouncil.org/blogs/africasource/ethiopia-and-eritrea-are-on-the-brink-of-war-again/','https://addisstandard.com/renewed-ethiopia-eritrea-war-could-ignite-conflict-spanning-10-15-countries-on-three-continents-expert-warns/'] },

  'bolivia': { news_score: 20, evidence_found: true,
    summary: "SUSTAINED — PROTEST DEATH TOLL UNCHANGED AT 24, STATE OF EMERGENCY CONTINUES, NO NEW ESCALATION THIS WINDOW: The blockade/protest-related death toll remains at 24 killed / 37 injured as of Jul 9 — the same figure already confirmed in the 2026-07-11 cycle, not a new escalation. The 90-day state of emergency (declared Jun 19-20, giving the military authority to patrol cities) remains in force even though blockades were lifted Jun 23. Root economic crisis (40-year-high inflation, fuel scarcity, currency collapse) is unresolved; no new dated escalation confirmed this window.",
    sources: ['https://en.wikipedia.org/wiki/2026_Bolivian_protests','https://www.aljazeera.com/news/2026/6/20/bolivia-declares-state-of-emergency-amid-blockade-crisis'] },

  'united-states': { news_score: 0, evidence_found: false,
    summary: "SCREENED — NO NEW MATERIAL EVIDENCE WITHIN WINDOW: Individual search performed. The Jun 30 SCOTUS ruling upholding birthright citizenship (rejecting the executive order to restrict it) falls within the 14-day window but was already reflected in the 2026-07-04 confirmed cycle and is not newly-dated for this scan. TPS work-authorization implementation guidance (extended through Jul 10 for Burma/Ethiopia/Haiti/Somalia/Syria/South Sudan/Yemen nationals) and USCIS's Jul 8 Atlanta asylum office opening are routine administrative/operational items, not new compassion-relevant escalations. No newly-dated material federal action found within the 2026-06-28 to 2026-07-12 window beyond the previously-confirmed record.",
    sources: [] },

  'democratic-republic-of-c': { news_score: 40, evidence_found: true,
    summary: "EBOLA DEATH TOLL CROSSES 500 THEN 625 — THIRD-LARGEST OUTBREAK ON RECORD (Jul 7-9, within window, NEW MILESTONE): WHO/UN reported the Ebola (Bundibugyo strain) death toll passing 500 (Jul 7), with the DRC Ministry of Health's latest count reaching 1,792 confirmed cases and 625 confirmed deaths as of Jul 9 — now the third-largest Ebola outbreak on record, spreading substantially faster than prior outbreaks. Ituri province remains most affected (1,631 cases, 535 deaths across 25 of 36 health zones). A clinical trial evaluating monoclonal antibody MBP134 and remdesivir began Jul 2 — significant because no approved vaccine or treatment exists for this strain. A US citizen working for a humanitarian organization in DRC tested positive (reported Jul 10). Ongoing armed clashes between DRC forces and militias in North/South Kivu and Ituri continue to hamper the response.",
    sources: ['https://news.un.org/en/story/2026/07/1167882','https://reliefweb.int/report/democratic-republic-congo/drc-eastern-dr-congo-ebola-situational-report-3-6-july-2026','https://www.npr.org/2026/07/07/g-s1-132218/theres-no-treatment-designed-for-the-ebola-strain-ravaging-drc-but-now-theres-hope'] },
};

// ── Batch name resolvers ────────────────────────────────────────────────────────
const BATCH_COUNTRY = {
  'finland':'nordic-europe-batch','denmark':'nordic-europe-batch','norway':'nordic-europe-batch',
  'iceland':'nordic-europe-batch','sweden':'nordic-europe-batch','switzerland':'nordic-europe-batch',
  'netherlands':'nordic-europe-batch','germany':'nordic-europe-batch','luxembourg':'nordic-europe-batch',
  'austria':'nordic-europe-batch','liechtenstein':'nordic-europe-batch','ireland':'nordic-europe-batch',
  'new-zealand':'pacific-batch','australia':'pacific-batch',
  'canada':'anglosphere-batch','united-kingdom':'anglosphere-batch',
  'france':'western-europe-batch','belgium':'western-europe-batch',
  'portugal':'southern-europe-batch','spain':'southern-europe-batch','italy':'southern-europe-batch',
  'greece':'southern-europe-batch','malta':'southern-europe-batch','andorra':'southern-europe-batch',
  'san-marino':'southern-europe-batch','monaco':'southern-europe-batch','cyprus':'southern-europe-batch',
  'vatican-city':'southern-europe-batch',
  'estonia':'eastern-europe-batch','latvia':'eastern-europe-batch','lithuania':'eastern-europe-batch',
  'czech-republic':'eastern-europe-batch','slovakia':'eastern-europe-batch','hungary':'eastern-europe-batch',
  'poland':'eastern-europe-batch','romania':'eastern-europe-batch','bulgaria':'eastern-europe-batch',
  'slovenia':'eastern-europe-batch','croatia':'eastern-europe-batch','moldova':'eastern-europe-batch',
  'belarus':'eastern-europe-batch',
  'serbia':'balkans-batch','albania':'balkans-batch','north-macedonia':'balkans-batch',
  'montenegro':'balkans-batch','bosnia-and-herzegovina':'balkans-batch','kosovo':'balkans-batch',
  'georgia':'caucasus-batch','armenia':'caucasus-batch','azerbaijan':'caucasus-batch',
  'uzbekistan':'central-asia-batch','kazakhstan':'central-asia-batch','kyrgyzstan':'central-asia-batch',
  'tajikistan':'central-asia-batch','turkmenistan':'central-asia-batch',
  'taiwan':'east-asia-batch','japan':'east-asia-batch','south-korea':'east-asia-batch',
  'mongolia':'east-asia-batch','north-korea':'east-asia-batch',
  'singapore':'southeast-asia-batch','cambodia':'southeast-asia-batch','vietnam':'southeast-asia-batch',
  'thailand':'southeast-asia-batch','laos':'southeast-asia-batch','indonesia':'southeast-asia-batch',
  'philippines':'southeast-asia-batch','malaysia':'southeast-asia-batch','timor-leste':'southeast-asia-batch',
  'brunei':'southeast-asia-batch',
  'india':'south-asia-batch','nepal':'south-asia-batch','sri-lanka':'south-asia-batch',
  'bangladesh':'south-asia-batch','maldives':'south-asia-batch','bhutan':'south-asia-batch',
  'morocco':'north-africa-batch','algeria':'north-africa-batch','egypt':'north-africa-batch','libya':'north-africa-batch',
  'jordan':'middle-east-batch','turkey':'middle-east-batch','syria':'middle-east-batch',
  'iraq':'middle-east-batch',
  'kuwait':'gcc-middle-east-batch','bahrain':'gcc-middle-east-batch','oman':'gcc-middle-east-batch',
  'saudi-arabia':'gcc-middle-east-batch','united-arab-emirates':'gcc-middle-east-batch','qatar':'gcc-middle-east-batch',
  'rwanda':'east-africa-batch','kenya':'east-africa-batch','tanzania':'east-africa-batch','burundi':'east-africa-batch',
  'djibouti':'horn-of-africa-batch','eritrea':'horn-of-africa-batch',
  'ghana':'west-africa-batch','senegal':'west-africa-batch','cote-divoire':'west-africa-batch',
  'benin':'west-africa-batch','togo':'west-africa-batch','sierra-leone':'west-africa-batch',
  'liberia':'west-africa-batch','guinea':'west-africa-batch','guinea-bissau':'west-africa-batch',
  'gambia':'west-africa-batch','the-gambia':'west-africa-batch',
  'niger':'sahel-batch','chad':'sahel-batch',
  'cameroon':'central-africa-batch','republic-of-the-congo':'central-africa-batch','gabon':'central-africa-batch',
  'equatorial-guinea':'central-africa-batch','central-african-republic':'central-africa-batch',
  'comoros':'africa-islands-batch','mauritius':'africa-islands-batch','cape-verde':'africa-islands-batch',
  'cabo-verde':'africa-islands-batch','seychelles':'africa-islands-batch','madagascar':'africa-islands-batch',
  'sao-tome-and-principe':'africa-islands-batch',
  'south-africa':'southern-africa-batch','namibia':'southern-africa-batch','botswana':'southern-africa-batch',
  'malawi':'southern-africa-batch','zambia':'southern-africa-batch','zimbabwe':'southern-africa-batch',
  'angola':'southern-africa-batch','mozambique':'southern-africa-batch','lesotho':'southern-africa-batch',
  'eswatini':'southern-africa-batch','swaziland':'southern-africa-batch',
  'uruguay':'latam-southern-cone-batch','chile':'latam-southern-cone-batch','argentina':'latam-southern-cone-batch',
  'brazil':'latam-southern-cone-batch','paraguay':'latam-southern-cone-batch',
  'colombia':'latam-andean-batch','peru':'latam-andean-batch','ecuador':'latam-andean-batch',
  'guyana':'latam-andean-batch','suriname':'latam-andean-batch',
  'mexico':'north-america-batch',
  'costa-rica':'central-america-batch','panama':'central-america-batch','belize':'central-america-batch',
  'guatemala':'central-america-batch','honduras':'central-america-batch','nicaragua':'central-america-batch',
  'dominican-republic':'caribbean-batch','jamaica':'caribbean-batch','trinidad-and-tobago':'caribbean-batch',
  'bahamas':'caribbean-batch','barbados':'caribbean-batch',
  'palau':'pacific-islands-batch','samoa':'pacific-islands-batch','fiji':'pacific-islands-batch',
  'kiribati':'pacific-islands-batch','tonga':'pacific-islands-batch','tuvalu':'pacific-islands-batch',
  'vanuatu':'pacific-islands-batch','marshall-islands':'pacific-islands-batch','micronesia':'pacific-islands-batch',
  'solomon-islands':'pacific-islands-batch','nauru':'pacific-islands-batch','cook-islands':'pacific-islands-batch',
};

function buildNumberedBatches(indexName, size) {
  const list = Object.entries(entities)
    .filter(([slug, e]) => e.index === indexName)
    .sort((a, b) => (a[1].rank || 0) - (b[1].rank || 0));
  const map = {};
  list.forEach(([slug], i) => {
    map[slug] = `${indexName}-batch-${Math.floor(i / size)}`;
  });
  return map;
}
const FORTUNE500_BATCHES  = buildNumberedBatches('fortune-500', 10);
const USSTATES_BATCHES    = buildNumberedBatches('us-states', 10);
const USCITIES_BATCHES    = buildNumberedBatches('us-cities', 10);
const GLOBALCITIES_BATCHES= buildNumberedBatches('global-cities', 10);
const UNIVERSITIES_BATCHES= buildNumberedBatches('universities', 10);

const countryOverflowMap = {};
const countrySlugsNotInMap = Object.entries(entities)
  .filter(([slug, e]) => e.index === 'countries' && !BATCH_COUNTRY[slug] && !T1.has(slug))
  .sort((a, b) => (a[1].rank || 0) - (b[1].rank || 0));
countrySlugsNotInMap.forEach(([slug], i) => {
  countryOverflowMap[slug] = `countries-overflow-batch-${Math.floor(i / 10)}`;
});

function batchName(slug, entity) {
  if (entity.index === 'countries') {
    return BATCH_COUNTRY[slug] || countryOverflowMap[slug] || 'countries-overflow-batch-x';
  }
  if (entity.index === 'fortune-500')   return FORTUNE500_BATCHES[slug]   || 'fortune-500-batch-x';
  if (entity.index === 'us-states')     return USSTATES_BATCHES[slug]     || 'us-states-batch-x';
  if (entity.index === 'us-cities')     return USCITIES_BATCHES[slug]     || 'us-cities-batch-x';
  if (entity.index === 'global-cities') return GLOBALCITIES_BATCHES[slug] || 'global-cities-batch-x';
  if (entity.index === 'universities')  return UNIVERSITIES_BATCHES[slug] || 'universities-batch-x';
  if (entity.index === 'ai-labs')       return 'ai-labs-batch';
  if (entity.index === 'robotics-labs') return 'robotics-labs-batch';
  return 'general-batch';
}

// ── Build entity_reviews for all entities ───────────────────────────────────────
const entityReviews = [];
const siteReviews   = {};
let withEvidence = 0;

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
    pending_proposal: ps > 0,
    summary, sources,
  };
  if (tier === 'T2') review.batch_name = batchName(slug, entity);
  entityReviews.push(review);

  const siteKey = `${entity.index}/${slug}`;
  siteReviews[siteKey] = { reviewed_at: SCAN_DATE, evidence_found: ef, summary };
  if (sources && sources.length > 0) siteReviews[siteKey].sources = sources;
}

// ── Top 15 (highest priority, recommendation: assess) — computed by priority_score ──
const TOP15_SLUGS = [
  'venezuela','pakistan','lebanon','tunisia','israel','yemen','iran','mali',
  'burkina-faso','democratic-republic-of-c','ethiopia','china','nigeria','uganda','anthropic',
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
    news_summary: ev ? ev.summary : r.summary,
    news_sources: ev ? (ev.sources || []) : [],
    recommendation: 'assess',
  };
});
// Verify sorted descending by priority_score (sanity check, not enforced structurally)
topEntities.sort((a, b) => b.priority_score - a.priority_score);

// ── Rotation backfill (5 next-highest by staleness, no new evidence) ────────────
const ROTATION_SLUGS = ['stone-energy','ring-energy','covia-holdings','us-silica','nacco-industries'];
const rotationBackfill = ROTATION_SLUGS.map(slug => {
  const r = entityReviews.find(e => e.slug === slug);
  return {
    slug, name: r.name, index: r.index,
    priority_score: r.priority_score, base_priority: r.base_priority,
    staleness_score: r.staleness_score, tier: r.tier,
    summary: r.summary, recommendation: 'rotation',
  };
});

// ── False positives screened ────────────────────────────────────────────────────
const falsePositivesScreened = [
  { entity: 'Apple', index: 'fortune-500',
    signal_type: 'DOJ "walled garden" antitrust monopolization suit (reported Jul 8)',
    decision: 'SCREENED (out of scope)',
    reason: 'Competition/market-structure dispute over App Store restrictions and super-app suppression, not a stakeholder-welfare, safety, labor, equity, or governance signal per compassion-relevance scope. Boundary-watch (59.4) sustained without new evidence.' },
  { entity: 'Princeton University', index: 'universities',
    signal_type: 'Board of Trustees expansion (8 new trustees, effective Jul 1)',
    decision: 'SCREENED (out of scope)',
    reason: 'Routine governance/board-composition news, not a stakeholder-welfare, safety, labor, equity or governance-failure signal per scope rules; consistent with prior-cycle screening of the exam-proctoring policy.' },
  { entity: 'El Salvador', index: 'countries',
    signal_type: '"Indefinite presidential re-election" constitutional-amendment language recurring in HRW World Report 2026 chapter search results',
    decision: 'SCREENED (recurring date-verification catch)',
    reason: 'This is very likely the same Jul 31, 2025 constitutional amendment already date-verified and excluded in the 2026-07-11 cycle (HRW World Report chapters principally cover the prior calendar year). Recurs in search indexes without a fresh 2026 date attached; excluded again pending explicit re-dating.' },
  { entity: 'China', index: 'countries',
    signal_type: 'Dalai Lama 90th-birthday monastery crackdown and named student-activist ("Zhang Yadi") arrest surfacing in HRW China materials',
    decision: 'SCREENED (date-verification catch)',
    reason: 'This item (including a reference to a monk\'s suicide "in August" without a year) reads as drawn from HRW\'s World Report 2026 China/Tibet chapter, which principally documents 2025-period events, rather than a freshly-dated July 2026 incident. Excluded from this cycle\'s scoring pending independent date confirmation; the confirmed Ethnic Unity Law (effective Jul 1) and Hong Kong "month 72" record remain in the sustained China entry.' },
  { entity: 'United States', index: 'countries',
    signal_type: 'Jun 30 SCOTUS birthright-citizenship ruling (Trump v. Barbara) resurfacing in current search results',
    decision: 'SCREENED (already reflected / stale)',
    reason: 'The ruling falls within the nominal 14-day window (Jun 30) but was already reported and reflected in the 2026-07-04 confirmed cycle; it is not a newly-dated event for this scan and is excluded to avoid double-counting sustained record as fresh evidence.' },
  { entity: 'Robotics sector (unnamed lab)', index: 'robotics-labs',
    signal_type: 'Viral video of a humanoid robot "freaking out" near office staff in Indonesia',
    decision: 'SCREENED (staged / not a genuine incident)',
    reason: 'Multiple outlets (Jul 5) confirmed the clip was a staged demonstration pre-programmed to show agility (choreographed kicks/poses in a costume), not evidence of an autonomous malfunction or safety failure. No genuine robotics-lab safety incident found in the sector sweep this window.' },
];

// ── Sector alerts ────────────────────────────────────────────────────────────────
const sectorAlerts = [
  { alert_id: 'sa-2026-07-12-01',
    title: 'Iran: US strikes Iran again Jul 11 after Strait of Hormuz ship attacks; Iranian retaliation now hits Bahrain, Kuwait, Jordan and Qatar',
    scope: 'countries/iran, countries/bahrain, countries/kuwait, countries/jordan, countries/qatar, countries/saudi-arabia, countries/united-arab-emirates, countries/oman',
    severity: 'critical',
    summary: 'The US struck Iran again in the early hours of Jul 11 after Iran attacked three commercial ships in the Strait of Hormuz, setting one ablaze; Washington revoked Iran\'s ability to openly sell crude oil. Iran\'s Revolutionary Guard retaliated against more than 80 US facilities across Bahrain and Kuwait and additionally struck Jordan and Qatar — widening from the Jul 8 pattern. Kuwaiti forces are intercepting "hostile aerial targets." Core US demands (surrendered enriched uranium, toll-free Hormuz) remain unmet; Pakistan and Qatar are mediating a possible new round of talks.',
    sources: ['https://www.npr.org/2026/07/11/g-s1-133212/us-iran-vessel-attack-strait-hormuz-gulf','https://www.cnn.com/2026/07/11/world/live-news/iran-war-trump'] },
  { alert_id: 'sa-2026-07-12-02',
    title: 'Venezuela earthquake day 18-19: toll reaches 4,333; USGS warns final count could reach 10,000-100,000',
    scope: 'countries/venezuela',
    severity: 'critical',
    summary: 'Official death toll rose to 4,333 as of Jul 11, up from 3,889 on Jul 10, with 16,740 injured and 17,854 left without housing. USGS estimates the final toll will most likely fall between 10,000 and 100,000 given the scale of devastation. Government-response disapproval reached 63.3% in June; Venezuelans report greater trust in NGOs and opposition figures than the state for relief.',
    sources: ['https://www.bloomberg.com/news/articles/2026-07-11/venezuela-earthquake-death-toll-climbs-to-more-than-4-300'] },
  { alert_id: 'sa-2026-07-12-03',
    title: 'DRC/Uganda: Ebola death toll crosses 625 (third-largest outbreak on record); Marburg case detected in Uganda',
    scope: 'countries/democratic-republic-of-c, countries/uganda',
    severity: 'critical',
    summary: 'DRC\'s Bundibugyo-strain Ebola outbreak reached 1,792 confirmed cases and 625 confirmed deaths as of Jul 9 — the third-largest Ebola outbreak on record and spreading faster than prior outbreaks. Ituri province remains most affected. A clinical trial for MBP134 and remdesivir began Jul 2 given no approved treatment exists. Uganda separately confirmed an isolated Marburg virus case (Jun 30, Kyegegwa District) alongside its ongoing 20-case/2-death Ebola cluster tied to the DRC outbreak, complicating the regional public-health response.',
    sources: ['https://news.un.org/en/story/2026/07/1167882','https://www.statnews.com/2026/06/30/marburg-virus-cases-ugandan-ebola-outbreak-zone/'] },
  { alert_id: 'sa-2026-07-12-04',
    title: "Tunisia: mass sentencing of 21 opposition figures (12-35 years); downgrade proposal remains open, day 3",
    scope: 'countries/tunisia',
    severity: 'high',
    summary: 'A Tunis court sentenced 21 people — including Ennahda leaders, former officials and lawyers — to 12-35 years on vague terrorism/state-security charges Jul 8, closing out a 62nd UN Human Rights Council session at which experts warned of a state "free pass" to escalate repression. The 2026-07-10 downgrade proposal (34.4 -> 23.8) remains open, unreviewed by the founder as of this scan (day 3); published score (34.4) unchanged.',
    sources: ['https://www.hrw.org/news/2026/07/08/sounding-the-alarm-over-tunisias-crackdown'] },
  { alert_id: 'sa-2026-07-12-05',
    title: "Yemen: renewed commitments sought after largest-ever prisoner exchange collapses; STC mobilizes against deal",
    scope: 'countries/yemen',
    severity: 'high',
    summary: 'Following the Jul 10 indefinite postponement of the ~1,700-1,750-detainee UN/ICRC exchange, UN Special Envoy Grundberg reported Jul 11 renewed government/Houthi commitments to proceed — but the dissolved Southern Transitional Council intensified opposition to releasing eight Houthi-list detainees days before the planned exchange, placing the deal further in jeopardy.',
    sources: ['https://www.middleeastmonitor.com/20260711-un-envoy-says-yemen-parties-renew-commitment-to-delayed-prisoner-exchange/'] },
  { alert_id: 'sa-2026-07-12-06',
    title: 'Pakistan: Operation Shaaban toll reaches 102 in Balochistan since Jul 5',
    scope: 'countries/pakistan',
    severity: 'high',
    summary: 'Following coordinated insurgent attacks Jul 4-8 that killed 42 (38 security personnel, 4 civilians), Pakistan\'s Operation Shaaban has killed a cumulative 102 alleged militants as of Jul 12 (unverified security-source figures). PM Shehbaz Sharif blamed India for facilitating the attacks and pledged continued operations from Quetta.',
    sources: ['https://www.pakistantoday.com.pk/2026/07/12/operation-shaban-toll-rises-to-102-as-23-more-terrorists-neutralized-in-balochistan'] },
  { alert_id: 'sa-2026-07-12-07',
    title: 'Gaza: ceasefire violations continue — 5 more killed Jul 12; toll since ceasefire now 1,098+',
    scope: 'countries/israel, countries/palestine',
    severity: 'critical',
    summary: 'Five Palestinians, including a child, were killed Jul 12 by Israeli army fire despite the ceasefire in effect since Oct 10, 2025, following a Jul 9 incident that killed 12 and injured 20. Cumulative confirmed toll since the ceasefire began now stands at 1,098+ killed and 3,535+ injured; the $4.1B 2026 Flash Appeal for the Occupied Palestinian Territory remains severely under-resourced.',
    sources: ['https://www.middleeastmonitor.com/20260712-5-more-gazans-killed-by-israeli-fire-despite-ceasefire/'] },
  { alert_id: 'sa-2026-07-12-08',
    title: 'Sahel: JNIM/FLA offensive continues in Mali (six-day Anefis battle); Burkina Faso attacks continue; region critically underfunded',
    scope: 'countries/mali, countries/burkina-faso, countries/niger, countries/chad',
    severity: 'high',
    summary: 'JNIM/FLA forces fought FAMA and Russia\'s Africa Corps for six consecutive days around Anefis, Mali, while Mali\'s military claimed to have broken a separate rebel blockade at a strategic northern base (Jul 10); the Bamako fuel/food siege continues unbroken. Burkina Faso suffered further attacks (22 killed near Dedougou, a third attack at Seguenega). Regional humanitarian funding has collapsed to its lowest level in a decade — only 19% of the required $3.7B received as of April 2026 — against 24.4M people in need and 15.4M facing crisis-level food insecurity in the Jun-Aug lean season.',
    sources: ['https://www.criticalthreats.org/analysis/jnim-fla-mali-sudan-rsf-saf-car-russia-burundi-drc-m23','https://www.unocha.org/publications/report/mali/24-million-people-sahel-urgently-need-aid-and-world-needs-do-more'] },
  { alert_id: 'sa-2026-07-12-09',
    title: 'AI labs: Meta $1.4T youth-safety trial approaches (Aug); xAI/Grok deepfake-CSAM class action remains active with Stability AI co-defendant',
    scope: 'fortune-500/meta-platforms, ai-labs/xai-grok',
    severity: 'critical',
    summary: 'Meta continues to face a $1.4 trillion penalty claim from state AGs over allegedly addictive teen-targeted design, with a second bellwether trial beginning Jul 27 ahead of the main August trial. Separately, the Grok deepfake-CSAM class action (expanded Jul 7 to add plaintiffs including a minor whose stepfather generated 7,000+ CSAM images, and to add Stability AI as co-defendant) remains active; the company operating Grok has rebranded as SpaceXAI following its SpaceX merger.',
    sources: ['https://www.jurist.org/news/2026/07/meta-says-state-ags-seek-1-4t-over-youth-safety-claims/','https://cyberscoop.com/deepfake-csam-lawsuit-grok-xai-expands-stability-ai/'] },
  { alert_id: 'sa-2026-07-12-10',
    title: 'Anthropic: China regulator alleges undisclosed telemetry "backdoor" in Claude Code — boundary-watch entity flagged for assessor review',
    scope: 'ai-labs/anthropic',
    severity: 'moderate',
    summary: 'China\'s Ministry of Industry and Information Technology-affiliated cybersecurity platform warned (Jul 9-10) that Anthropic\'s Claude Code contains built-in monitoring that can transmit a user\'s location and identity to a remote server without consent. Anthropic describes the mechanism as an experimental anti-IP-theft/anti-distillation tool. Given Anthropic\'s boundary-watch status (59.1, just below Established/60.0) and the previously-defined conversion trigger referencing "a second undisclosed telemetry episode," this item is surfaced for explicit assessor review rather than auto-screened, notwithstanding that the accusation originates from a rival government\'s cybersecurity agency rather than a Western consumer-protection regulator or court.',
    sources: ['https://securityboulevard.com/2026/07/china-warns-of-backdoor-in-anthropics-claude-code-amid-rising-ai-geopolitics/'] },
];

// ── Assemble scan ──────────────────────────────────────────────────────────────
const T1_SEARCHES = 33;
const T3_SEARCHES = 5;
const TOTAL_SEARCHES = T1_SEARCHES + T3_SEARCHES;

const scan = {
  scan_date: SCAN_DATE,
  scan_start: `${SCAN_DATE}T02:00:00Z`,
  scan_end:   `${SCAN_DATE}T03:10:00Z`,
  lookback_window_days:  LOOKBACK_DAYS,
  lookback_window_start: LOOKBACK_START,
  lookback_window_end:   LOOKBACK_END,
  entities_scanned:   entityReviews.length,
  searches_performed: TOTAL_SEARCHES,
  tier_breakdown: {
    tier_1_individual: T1.size,
    tier_2_batched: entityReviews.length - T1.size,
    tier_3_sector_sweeps: T3_SEARCHES,
  },
  top_entities: topEntities,
  rotation_backfill: rotationBackfill,
  sector_alerts: sectorAlerts,
  false_positives_screened: falsePositivesScreened,
  entity_reviews: entityReviews,
  stats: {
    total_entities: entityReviews.length,
    entities_with_evidence: withEvidence,
    entities_no_evidence: entityReviews.length - withEvidence,
    entities_assess: topEntities.length,
    entities_rotation: rotationBackfill.length,
    index_breakdown: (() => {
      const b = {};
      for (const e of Object.values(entities)) b[e.index] = (b[e.index] || 0) + 1;
      return b;
    })(),
    searches_by_tier: {
      T1_individual: T1_SEARCHES,
      T2_batched: 0,
      T3_sector_sweeps: T3_SEARCHES,
    },
    scan_quality: 'standard',
    degraded_batches: [],
    false_positives_screened: falsePositivesScreened.length,
    lookback_window: `${LOOKBACK_START} to ${LOOKBACK_END}`,
    pending_proposal_watch: ['tunisia'],
  },
};

fs.writeFileSync(path.join(ROOT, 'research/scans/2026-07-12.json'), JSON.stringify(scan, null, 2));

const erPayload = { date: SCAN_DATE, lookback_window_days: LOOKBACK_DAYS, reviews: siteReviews };
fs.writeFileSync(path.join(ROOT, 'site/src/data/evidence-reviews/2026-07-12.json'), JSON.stringify(erPayload, null, 2));
fs.writeFileSync(path.join(ROOT, 'site/src/data/evidence-reviews/latest.json'), JSON.stringify(erPayload, null, 2));

// Update rotation state — timestamps only, NO composites/bands/ranks
for (const slug of Object.keys(entities)) {
  entities[slug].last_scanned        = SCAN_DATE;
  entities[slug].last_evidence_touch = SCAN_DATE;
}
rotationState.last_updated = SCAN_DATE;
fs.writeFileSync(path.join(ROOT, 'research/rotation-state.json'), JSON.stringify(rotationState, null, 2));

// ── Summary ────────────────────────────────────────────────────────────────────
console.log('=== 2026-07-12 SCAN COMPLETE ===');
console.log('entities_scanned       :', entityReviews.length);
console.log('entities_with_evidence :', withEvidence);
console.log('searches_performed      :', TOTAL_SEARCHES, `(T1:${T1_SEARCHES} T2:0 T3:${T3_SEARCHES})`);
console.log('T1 entity count         :', T1.size);
console.log('top_entities (15)       :', topEntities.map(e => e.slug + ':' + e.priority_score).join(', '));
console.log('sector_alerts           :', sectorAlerts.length);
console.log('false_positives_screened:', falsePositivesScreened.length);
console.log('rotation_backfill       :', rotationBackfill.map(e=>e.slug).join(', '));
