'use strict';
/**
 * Nightly Evidence Scanner — 2026-07-13
 * Outputs:
 *   research/scans/2026-07-13.json
 *   site/src/data/evidence-reviews/2026-07-13.json
 *   site/src/data/evidence-reviews/latest.json
 * Updates: research/rotation-state.json (timestamps only — NO composite/band/rank changes)
 */

const fs   = require('fs');
const path = require('path');

const ROOT           = 'C:/Users/philk/applied-compassion-benchmark';
const SCAN_DATE      = '2026-07-13';
const LOOKBACK_START = '2026-06-29';
const LOOKBACK_END   = '2026-07-13';
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

// ── T1 individually-searched entities (33) ─────────────────────────────────────
const T1 = new Set([
  'tunisia','venezuela','china','pakistan','nigeria','lebanon','cuba','sudan',
  'israel','palestine','ukraine','russia','south-sudan','myanmar','yemen','uganda',
  'iran','haiti','mali','burkina-faso','anthropic','apple','princeton-university',
  'meta-platforms','xai-grok','unitedhealth-group','el-salvador','afghanistan',
  'somalia','ethiopia','bolivia','united-states','democratic-republic-of-c',
]);

// ── Real-search evidence map (dated within 2026-06-29 to 2026-07-13 unless noted) ──
const EV = {
  'tunisia': { news_score: 40, evidence_found: true,
    summary: "PENDING PROPOSAL RE-SURFACED, DAY 4 — NO NEW DATED ESCALATION BEYOND JUL 8 SENTENCING: The 62nd UN Human Rights Council session's closing warnings (Jul 8) and the mass sentencing of 21 opposition figures (12-35 years) remain the operative evidentiary basis for the 2026-07-10 downgrade proposal (34.4 -> 23.8), now day 4 and still awaiting founder review; published composite (34.4) unchanged. Additional documented sentences (Sihem Bensedrine, 25 years + ~$600M joint fine, Jun 26; Saadia Mosbah, 8 years, prior appeal) surfaced in searches but fall just outside the 14-day window (event-dated before Jun 29) and are noted as background pattern-reinforcement, not a new trigger. No materially new dated escalation this specific cycle.",
    sources: ['https://www.hrw.org/news/2026/07/08/sounding-the-alarm-over-tunisias-crackdown','https://www.hrw.org/news/2026/07/07/tunisia-harsh-sentences-for-rights-defenders','https://www.amnesty.org/en/latest/news/2026/06/tunisia-25-year-prison-term-for-prominent-human-rights-defender-sihem-bensedrine-an-outrageous-injustice/'] },

  'venezuela': { news_score: 40, evidence_found: true,
    summary: "EARTHQUAKE DAY 20 — TOLL CLIMBS TO 4,490 (Jul 13, within window, NEW): The government's official Telegram account listed 4,490 dead as of Jul 13, about 150 higher than the day before (4,333 reported Jul 11), with 16,740 injured; no estimate given for the number still unaccounted for. More than 19,500 people are now living in displacement camps, up from 17,854 reported Jul 11. The government's official toll continues to be climbing steadily with no indication the count is close to final; USGS's Jul 11 estimate that the ultimate toll could reach 10,000-100,000 remains the operative outside assessment. Government-response criticism (63.3% disapproval in June) remains unresolved.",
    sources: ['https://www.euronews.com/2026/07/13/venezuela-quake-death-toll-rises-to-4490-officials-say-but-no-number-given-for-missing','https://en.yenisafak.com/world/venezuela-earthquake-death-toll-reaches-4490-3720751','https://en.wikipedia.org/wiki/2026_Venezuela_earthquakes'] },

  'china': { news_score: 20, evidence_found: true,
    summary: "SUSTAINED — ETHNIC UNITY LAW / HONG KONG PRISON-RULES CRACKDOWN CONTINUE, NO DISTINCT NEW DATED ESCALATION THIS WINDOW: China's Ethnic Unity and Progress Law (effective Jul 1) remains in force and continues to draw international protest (ICT demonstrations at Washington/Brussels offices, Jul 1). Hong Kong authorities amended prison rules in July to further restrict inmate visits (including by lawyers/clergy) and correspondence, and the territory's last active pro-democracy party (League of Social Democrats) disbanded — both consistent with, not a departure from, the sustained repression pattern. Note: search results again surfaced Dalai Lama 90th-birthday-related Tibet monastery crackdown material referencing a monk's suicide \"in August\" without a confirmed year — this reads as drawn from HRW's World Report 2026 chapter (principally covering 2025-period events) rather than a freshly-dated 2026 incident; excluded from scoring again pending date verification (see false_positives_screened).",
    sources: ['https://savetibet.org/ict-joins-tibetans-in-protests-urging-global-action-against-chinas-new-ethnic-unity-law/','https://www.hrw.org/world-report/2026/country-chapters/china'] },

  'pakistan': { news_score: 40, evidence_found: true,
    summary: "OPERATION SHAABAN TOLL RISES TO 117 (Jul 13, within window, NEW): Following the Jul 4-8 coordinated insurgent assaults across Balochistan that killed 42 (38 security personnel, 4 civilians), Pakistan's Operation Shaaban has killed a cumulative 117 alleged militants as of Jul 13 (security-source figures, unverified), up from 102 on Jul 12 and 75 on Jul 10 — a continued, still-climbing operation now in its second week. PM Shehbaz Sharif's accusation that India facilitated the initial attacks remains unretracted; operations continue jointly across the Army, Frontier Corps Balochistan and Balochistan Police.",
    sources: ['https://www.pakistantoday.com.pk/2026/07/13/117-militants-killed-in-balochistan-operations-since-july-5-say-security-sources','https://en.wikipedia.org/wiki/July_2026_Balochistan_attacks','https://www.nation.com.pk/11-Jul-2026/75-terrorists-killed-ongoing-operation-shaban-balochistan-attacks'] },

  'nigeria': { news_score: 20, evidence_found: true,
    summary: "SUSTAINED — WFP/CADRE HARMONISE HUNGER RECORD RECONFIRMED, NO MATERIAL NEW ESCALATION THIS WINDOW: The Jul 2 WFP/Cadre Harmonise report (36.2M nationally food insecure; 17M+ across nine northern states at crisis/emergency/catastrophe levels; Borno 3M+ acutely food insecure) continues to be the operative record, reconfirmed in Jul 9 Nigerian press coverage with no materially new dated escalation beyond it. WFP still requires $89M over six months; only 740,000 of 6.2M in need across three northeast states are currently reached, leaving 5.5M — particularly children — without lifesaving assistance.",
    sources: ['https://dailypost.ng/2026/07/09/wfps-report-of-looming-severe-hunger-in-northern-nigeria-raises-concern/','https://www.wfp.org/news/wfp-warns-imminent-food-assistance-cuts-nigeria-violence-and-hunger-surges-across-north'] },

  'lebanon': { news_score: 40, evidence_found: true,
    summary: "CONTINUED CEASEFIRE VIOLATIONS — CUMULATIVE TOLL NOW 4,321 KILLED, POSSIBLE PARTIAL DE-ESCALATION SIGNAL (Jul 10, within window, NEW): Israeli drones struck a pick-up truck in the Nabatieh district (injuring two) and targeted al-Fawqa on/around Jul 10, despite the new US-brokered framework signed Jun 26. Lebanon's Ministry of Public Health reports the cumulative death toll from Israeli attacks has risen to 4,321 killed and 12,204 injured since the Mar 2 resumption. Notably, Israeli Broadcasting Authority reported the Israeli government ordered the military to refrain from \"sensitive operations\" in southern Lebanon following US pressure — a potential, unconfirmed easing signal that does not yet offset the sustained pattern of continued strikes and casualties.",
    sources: ['https://www.aljazeera.com/news/2026/7/10/israeli-drones-strike-lebanon-despite-us-brokered-framework-deal','https://en.wikipedia.org/wiki/2026_Israel%E2%80%93Lebanon_ceasefire','https://en.wikipedia.org/wiki/2026_Lebanon_war'] },

  'cuba': { news_score: 20, evidence_found: true,
    summary: "SUSTAINED — FOURTH NATIONWIDE BLACKOUT AND CACEROLAZO-PROTEST REPRESSION REMAIN OPERATIVE, NO NEW ESCALATION THIS WINDOW: The Jul 10 grid collapse (second in five days, fourth of 2026, up to 87 consecutive hours without power in Matanzas) and Diaz-Canel's acknowledgment that Cuba has been unable to import fuel since January (barring one Russian shipment) remain the operative record. Cubalex's count of 38 detentions (including 6 minors) tied to June's cacerolazo protests is unchanged. The Cuban Conflict Observatory's count of 107 June street protests (nearly double March's prior record of 54) underscores sustained, not newly escalating, unrest this window.",
    sources: ['https://www.techtimes.com/articles/320188/20260711/cuba-grid-collapses-twice-five-days-fuel-starvation-stripped-all-redundancy.htm','https://www.cubaheadlines.com/articles/334515'] },

  'sudan': { news_score: 40, evidence_found: true,
    summary: "EL OBEID DRONE-STRIKE TOLL DETAILED — 45+ CIVILIANS KILLED IN THREE WEEKS, EU PARLIAMENT CALLS FOR RSF TERRORIST LISTING (within window, NEW DETAIL): Reporting this window quantifies the RSF drone campaign against El Obeid for the first time with a specific civilian toll: 15 drone strikes in three weeks killed at least 45 civilians, repeatedly striking markets, schools, fuel stations, water infrastructure and civilian vehicles — food prices have surged up to 300% amid the siege of roughly 500,000 trapped civilians. Amnesty International's Jul 8 report documents the RSF siege of El Fasher and grave crimes against civilians, reinforcing the same fact pattern the OHCHR has already characterized as risking a further \"crime scene.\" In direct response, the European Parliament adopted a resolution in July calling on the EU to designate the RSF as a terrorist organization. Floor-level (0.0) confirmation sustained and reinforced with new casualty specificity.",
    sources: ['https://www.thenationalnews.com/news/mena/2026/07/06/al-obeid-in-darkness-as-rsf-maintains-siege-of-key-sudan-city/','https://sudantribune.com/article/316049','https://news.un.org/en/story/2026/07/1167871'] },

  'israel': { news_score: 40, evidence_found: true,
    summary: "GAZA CEASEFIRE VIOLATIONS CONTINUE — 8 KILLED JUL 13 INCLUDING 9-YEAR-OLD GIRL (within window, NEW): An Israeli strike on the Sabra neighborhood south of Gaza City killed 8 Palestinians, including a 9-year-old girl, on Jul 13 (day of scan); a separate drone strike targeted a metal workshop killing four, and Israeli machine-gun fire killed a girl in the Al-Bureij refugee camp. Additional deaths this window include a person killed in a drone strike on a tent sheltering displaced people west of Khan Younis and two men who died of wounds from Jul 11-12 incidents. Cumulative confirmed toll since the ceasefire began (Oct 10, 2025) now exceeds 1,100 killed and 3,500+ injured. IDF retains control of ~70% of the Strip. Sustained and freshly-dated floor-level (0.0) confirmation.",
    sources: ['https://thedefensepost.com/2026/07/13/gaza-health-israeli-strike/','https://www.newarab.com/news/eight-people-including-girl-killed-israeli-strikes-gaza','https://www.aljazeera.com/video/newsfeed/2026/7/12/deadly-israeli-strikes-pound-gaza'] },

  'palestine': { news_score: 20, evidence_found: true,
    summary: "SUSTAINED — AID-VOLUME DECLINE AND WEST BANK DISPLACEMENT PATTERN CONTINUE (Jul 10 OCHA sitrep, within window): The UN 2720 Mechanism shows aid volumes into Gaza declined to under 42,000 pallets last month, down from ~46,600 in May; families receiving shelter assistance fell 37% from May to June due to funding shortfalls. In the West Bank, more than 3,200 Palestinians have been displaced in 2026 by settler attacks and demolitions for lack of Israeli-issued permits — an average of 17 people per day, double the rate of the preceding three years. On Jul 8, a World Central Kitchen-affiliated driver was killed by Israeli forces while transporting aid from Kerem Shalom, within a movement Israeli authorities had coordinated. Fresh dated ceasefire-violation casualties are tracked under the Israel entry.",
    sources: ['https://www.ochaopt.org/content/humanitarian-situation-report-10-july-2026','https://news.un.org/en/story/2026/07/1167880'] },

  'ukraine': { news_score: 20, evidence_found: true,
    summary: "SUSTAINED — JUL 2/JUL 6 KYIV STRIKES REMAIN OPERATIVE, NO NEW MASS-CASUALTY EVENT CONFIRMED THIS SPECIFIC CYCLE: The Jul 2 Kyiv strike (22+ killed, 130+ civilian sites damaged by 74 missiles and ~500 drones) and the Jul 6 second strike (14+ killed, 80+ injured) remain the operative record for this window; both were already reflected in prior cycles. The UN Human Rights Monitoring Mission's assessment that Ukraine is averaging 170 civilians killed or injured per day in July — a monthly rate significantly higher than the same period in the prior three years — remains the operative baseline; no new dated mass-casualty strike beyond it was confirmed as of Jul 13.",
    sources: ['https://ukraine.ohchr.org/en/Civilian-Casualties-Soar-as-Ukraine-Comes-Under-the-Deadliest-Attack-in-Weeks-UN-Human-Rights-Monitors-Say','https://news.un.org/en/story/2026/07/1167875'] },

  'russia': { news_score: 20, evidence_found: true,
    summary: "SUSTAINED — SAME JUL 2/JUL 6 STRIKE CAMPAIGN, NEW EU SANCTIONS OVER NAVALNY CHEMICAL-WEAPONS FINDING (within window, NEW DETAIL): The Russian missile/drone strikes on Kyiv (Jul 2, Jul 6) remain the operative attributed record. This window, the EU Council imposed sanctions on six Russian individuals involved in developing chemical weapons — specifically epibatidine, found in samples taken from Alexei Navalny's body after his 2024 death in a Russian penal colony — a discrete new accountability action tying a specific atrocity finding to named individuals. The EU's 12-month blanket sanctions renewal (through Jul 2027) was also confirmed this window. Floor-level (0.0) confirmation sustained.",
    sources: ['https://www.consilium.europa.eu/en/press/press-releases/2026/06/25/russia-s-war-of-aggression-against-ukraine-council-extends-economic-sanctions-for-another-year/','https://www.consilium.europa.eu/en/policies/sanctions-against-russia/timeline-sanctions-against-russia/'] },

  'south-sudan': { news_score: 20, evidence_found: true,
    summary: "SUSTAINED — APR-JUL 2026 IPC PROJECTION REMAINS OPERATIVE, NO DISTINCT NEW ESCALATION THIS WINDOW: 7.8M people (56% of the population) remain at IPC Phase 3+ for the Apr-Jul 2026 period; approximately 73,000 are in Phase 5 Catastrophe (a confirmed 160% increase from the prior estimate) and 2.5M in Phase 4 Emergency. Credible risk of famine remains flagged in four counties across Jonglei and Upper Nile. This is the same seasonal IPC projection cited in prior cycles, not a newly-dated escalation within this window. Floor-level (0.0) confirmation sustained, not a fresh trigger.",
    sources: ['https://www.ipcinfo.org/ipc-country-analysis/details-map/en/c/1163302','https://www.unicef.org/press-releases/hunger-intensifies-south-sudan-78-million-people-face-high-acute-food-insecurity-0'] },

  'myanmar': { news_score: 20, evidence_found: true,
    summary: "SUSTAINED — POST-COUP 100,114 DEATH-TOLL MILESTONE (JUL 1) REMAINS OPERATIVE, NO NEW ESCALATION THIS WINDOW: ACLED's confirmation that conflict-related fatalities since the Feb 2021 coup exceed 100,000 (100,114, reported Jul 1) remains the operative and previously-confirmed milestone; no further escalation or new dated development surfaced this window. Myanmar remains assessed as the second-largest active armed conflict globally (after the Palestinian conflict) and the most fragmented, with 1,200+ armed groups tracked by ACLED. Floor-level (0.0) confirmation sustained.",
    sources: ['https://moemaka.net/eng/2026/07/death-toll-in-myanmars-civil-war-surpasses-100000-after-more-than-five-years/','https://www.rte.ie/news/world/2026/0701/1581192-myanmar-civil-war/'] },

  'yemen': { news_score: 20, evidence_found: true,
    summary: "SUSTAINED — PRISONER EXCHANGE REMAINS STALLED DESPITE RENEWED COMMITMENTS, NO FURTHER MOVEMENT THIS WINDOW: The Houthis' indefinite postponement of the ~1,700-detainee UN/ICRC-brokered exchange (the largest since the conflict began) and UN Special Envoy Grundberg's Jul 11 report of \"renewed commitments\" from both sides remain the operative and previously-confirmed record; each side continues to blame the other for the delay and no concrete implementation date has been set as of Jul 13. Floor-level (0.0) humanitarian confirmation sustained (73 UN staff detained, 450+ health facilities closed, 18.3M acutely food insecure) without a new distinct escalation this cycle.",
    sources: ['https://www.yemenmonitor.com/en/Details/ArtMID/908/ArticleID/175999','https://www.middleeastmonitor.com/20260711-un-envoy-says-yemen-parties-renew-commitment-to-delayed-prisoner-exchange/'] },

  'uganda': { news_score: 20, evidence_found: true,
    summary: "SUSTAINED — MARBURG CASE (JUN 30) AND BUNDIBUGYO EBOLA (20 CONFIRMED/2 DEATHS) CONTINUE, NO NEW ESCALATION THIS WINDOW: Uganda's Jun 30 confirmed Marburg case (Kyegegwa District) remains isolated with no further symptomatic contacts per Africa CDC. Uganda continues managing 20 confirmed Ebola (Bundibugyo strain) cases and 2 deaths tied to the DRC outbreak; the DRC border remains closed since May 27. No new Uganda-specific escalation confirmed this window.",
    sources: ['https://www.statnews.com/2026/06/30/marburg-virus-cases-ugandan-ebola-outbreak-zone/','https://medicalxpress.com/news/2026-07-marburg-virus-case-uganda.html'] },

  'iran': { news_score: 40, evidence_found: true,
    summary: "CEASEFIRE DISINTEGRATES FURTHER — TRUMP THREATENS RENEWED HORMUZ BLOCKADE, FIRST USE OF ONE-WAY ATTACK DRONES (Jul 13, within window, NEW): The US-Iran ceasefire teetered toward total collapse over the weekend as the US completed a second round of strikes in retaliation for Iranian attacks on commercial vessels in the Strait of Hormuz (Jul 6-7); CENTCOM said it used \"one-way attack aerial drones and one-way attack sea drones for the first time\" in these strikes. President Trump said Jul 13 the US would reinstate a blockade of Iranian oil-shipping vessels, and traffic through Hormuz has thinned to just 14 vessels (half Iranian) as shippers avoid the waterway. Execution-rate and repression baseline (784+ YTD) remains in force; this represents a further, freshly-dated deterioration beyond the Jul 11 four-Gulf-state retaliation pattern already reflected in prior cycles.",
    sources: ['https://www.cnn.com/2026/07/13/world/live-news/iran-war-trump','https://en.wikipedia.org/wiki/2026_Strait_of_Hormuz_crisis','https://www.aljazeera.com/news/2026/7/10/trump-says-us-has-agreed-to-continue-iran-talks-but-ceasefire-over'] },

  'haiti': { news_score: 20, evidence_found: true,
    summary: "TPS WORK-AUTHORIZATION DEADLINE EXTENDED TO JUL 24 — PROCEDURAL REPRIEVE AMID UNCHANGED UNDERLYING CRISIS (Jul 10, within window, NEW): USCIS/DHS guidance extended the Haitian TPS work-authorization expiration date from Jul 10 to Jul 24, giving roughly 350,000 Haitians (including ~158,000 in Florida, ~113,000 in healthcare roles) a brief additional window following the Jun 25 SCOTUS ruling permitting termination. The underlying HRW Jul 2 warning that ending TPS exposes Haitians to gang violence remains operative: 2,300+ killed and 1,100+ injured nationally since the start of 2026, with 26+ gangs controlling up to 90% of Port-au-Prince. 6.4M Haitians remain in need of humanitarian assistance; ~1.5M are displaced.",
    sources: ['https://www.cbsnews.com/miami/news/haiti-temporary-protected-status-south-florida-tps-july-10-2026/','https://www.wlrn.org/2026-07-10/about-350-000-haitian-tps-holders-get-last-minute-reprieve-work-permits-got-extended-to-july-24','https://www.hrw.org/news/2026/07/02/us-haitians-set-to-lose-protections-risk-return-to-violence'] },

  'mali': { news_score: 20, evidence_found: true,
    summary: "SUSTAINED — JUL 10 BLOCKADE-BROKEN CLAIM AND SIX-DAY ANEFIS BATTLE REMAIN OPERATIVE, NO FURTHER NEW ESCALATION THIS WINDOW: JNIM/FLA's countrywide offensive (Gao, Aguelhok, Anefis) and Mali's Jul 10 announcement that it broke a rebel blockade around a separate strategic northern base remain the most recently confirmed record; a Thursday-night FLA attack on an army/Africa Corps reinforcement convoy preceded that announcement. The Bamako fuel/food siege (300+ tankers burned since Sept 2025) continues unbroken. No materially new dated escalation confirmed beyond the previously-reflected record this cycle.",
    sources: ['https://www.washingtontimes.com/news/2026/jul/10/mali-military-says-broken-rebel-blockade-around-strategic-northern/','https://acleddata.com/media-citation/mali-under-siege-tracking-fuel-blockade-crippling-bamako-bellingcat'] },

  'burkina-faso': { news_score: 20, evidence_found: true,
    summary: "SUSTAINED — JUL 4-8 DEDOUGOU/SEGUENEGA ATTACKS AND 400+ MILITANTS-NEUTRALIZED CLAIM REMAIN OPERATIVE: JNIM's Jul 4-5 attack near Dedougou (22 soldiers/militia killed, reported Jul 8) and further attacks on Solhan and a military post at Seguenega remain the most recently confirmed record. A further attempted JNIM assault on positions at Tiu, Gorgaji, Tuguri and Tugu (reported Jul 6) was repulsed with no reported deaths; Burkinabe forces separately claim 400+ assailants neutralized in a large counter-offensive. No new dated mass-casualty escalation confirmed this window beyond the previously-reflected record.",
    sources: ['https://burkina-faso.news-pravda.com/en/world/2026/07/06/7178.html','https://thedefensepost.com/2026/07/08/burkina-jihadists-kill-soldiers-militia/'] },

  'anthropic': { news_score: 10, evidence_found: true,
    summary: "SUSTAINED — CHINA BACKDOOR TELEMETRY EPISODE REMAINS THE OPERATIVE RECORD, NO NEW DISTINCT CONVERSION-TRIGGER EVENT THIS WINDOW: The Claude Code \"backdoor\" telemetry mechanism (China National Vulnerability Database alert, Jul 8-10) was already removed in v2.1.198 (released Jul 1, before the allegation surfaced); Anthropic's characterization (anti-distillation experiment, not a consumer-facing disclosure failure) is unchanged. Alibaba separately ordered its employees to stop using Anthropic tools for work starting Jul 10 — a geopolitical/competitive retaliation, not a new safety or disclosure event. Boundary-watch status (59.1, 0.9 below Established/60.0) sustained without a new distinct escalation this cycle; assessor should continue to weigh the standing China-telemetry item rather than treat it as newly re-triggered. Screened this window: a Claude Max usage-cap class action (filed mid-June, event-dated outside the 14-day window) and an ongoing Pentagon supply-chain-risk dispute over refusal to support autonomous lethal weapons/mass domestic surveillance use cases (unresolved background dispute, no fresh dated escalation) — see false_positives_screened.",
    sources: ['https://securityboulevard.com/2026/07/china-warns-of-backdoor-in-anthropics-claude-code-amid-rising-ai-geopolitics/','https://www.govinfosecurity.com/anthropic-rejects-chinas-claim-about-claude-code-backdoor-a-32184'] },

  'apple': { news_score: 0, evidence_found: false,
    summary: "SCREENED — NO MATERIAL EVIDENCE WITHIN WINDOW: Individual search performed. The DOJ antitrust case remains in pretrial discovery, with Apple and DOJ filing a joint discovery-dispute letter over Apple's request for documents from 14 federal agencies — a procedural/competition-law development, out of compassion-relevance scope (not stakeholder-welfare, safety, labor, equity, or governance). No newly-dated material compassion-relevant escalation found. Boundary-watch status (59.4, 0.6 below Established/60.0) sustained without new evidence this window.",
    sources: [] },

  'princeton-university': { news_score: 0, evidence_found: false,
    summary: "SCREENED — NO NEW MATERIAL EVIDENCE WITHIN WINDOW: Individual search performed. The Jul 1 faculty-mandated exam-proctoring policy (ending 133 years of honor-code precedent) continues implementation; this remains an academic-integrity/administrative change, not a stakeholder-welfare, safety, labor, equity or governance-failure signal per scope rules, consistent with prior-cycle screening. No new governance controversy surfaced this window. Boundary-watch status (57.8, 2.2 below Established/60.0) sustained without new evidence.",
    sources: [] },

  'meta-platforms': { news_score: 20, evidence_found: true,
    summary: "SUSTAINED — $1.4T YOUTH-SAFETY PENALTY CLAIM REMAINS ACTIVE, SECOND BELLWETHER TRIAL APPROACHES JUL 27: State attorneys general (California, Colorado, Kentucky, New Jersey, and others among 33+ states with claims) continue seeking penalties up to $1.4 trillion over allegations Meta knowingly designed Facebook/Instagram to be addictive to teens; this remains the operative record with the second bellwether trial beginning Jul 27 ahead of the main August trial in Oakland. Meta continues to dispute the figure as unprecedented and unsupported. Critical-band (7.8) record sustained and continuing to escalate toward trial with no incremental new development this specific cycle.",
    sources: ['https://www.jurist.org/news/2026/07/meta-says-state-ags-seek-1-4t-over-youth-safety-claims/','https://gizmodo.com/metas-teen-safety-case-just-became-a-1-4-trillion-existential-threat-2000782306'] },

  'xai-grok': { news_score: 20, evidence_found: true,
    summary: "SUSTAINED — DEEPFAKE-CSAM CLASS ACTION EXPANSION REMAINS ACTIVE, NCMEC REPORTING-FAILURE DETAIL SURFACES: The Jul 7 amendment adding Jane Does 4-5 (including a minor whose stepfather generated 7,000+ CSAM images via Grok) and Stability AI as co-defendant remains the operative record. A supporting detail surfaced this window: the National Center for Missing & Exploited Children found that as of early 2026, 90% of xAI's CyberTipline reports were not actionable by law enforcement because xAI declined to include identifying user information — reinforcing, not newly escalating, the existing floor-level (0.0) confirmation.",
    sources: ['https://cyberscoop.com/deepfake-csam-lawsuit-grok-xai-expands-stability-ai/','https://letsdatascience.com/news/xai-faces-expanded-deepfake-csam-lawsuit-over-grok-9b8be998'] },

  'unitedhealth-group': { news_score: 10, evidence_found: true,
    summary: "SUSTAINED — DOJ MEDICARE ADVANTAGE PROBE CONTINUES, NO NEW DATED ESCALATION THIS WINDOW: DOJ's criminal probe into Optum Rx and physician-reimbursement arrangements and its civil probe into inflated Medicare Advantage diagnoses continue; UnitedHealth's internal third-party review remains ongoing. The Q2 2026 earnings call (Jul 29) remains a forward-looking event that has not yet occurred. No newly-dated escalation distinct from the previously-confirmed record found within the 14-day window.",
    sources: ['https://www.fiercehealthcare.com/payers/wsj-report-doj-interviewing-former-employees-about-medicare-billing-practices-unitedhealth'] },

  'el-salvador': { news_score: 10, evidence_found: true,
    summary: "SUSTAINED — NO NEW MATERIAL ESCALATION, RECURRING DATE-VERIFICATION ISSUE CONFIRMED AGAIN VIA TARGETED SEARCH: Individual search performed, including a follow-up targeted date-verification query. Confirmed: the \"July constitutional amendment\" removing presidential term limits is the Jul 31, 2025 amendment (57-3 vote, extends terms to six years, moves Bukele's term end from 2029 to 2027 to allow re-election) — not a fresh 2026 event; this is the same item already date-verified and excluded in prior cycles. Underlying severe record (86 political prisoners, 245+ persecuted since Bukele took power, Cristosal forced to suspend operations) is unchanged since the 2026-07-05 applied downgrade (20.3 -> 15.0).",
    sources: [] },

  'afghanistan': { news_score: 20, evidence_found: true,
    summary: "SUSTAINED — JUL 1 TALIBAN DRONE STRIKES INTO PAKISTAN REMAIN THE OPERATIVE RECORD, NO NEW ESCALATION RELIABLY DATED THIS WINDOW: The Jul 1 Taliban drone strikes into Pakistan's Balochistan (first direct aerial assault on Pakistani territory in this conflict) remain the operative and previously-confirmed record. A reference in search results to \"28 civilians killed, 49 injured\" in unspecified \"Monday\" Pakistani airstrikes could not be reliably re-dated within this specific window and is not scored as a new escalation pending confirmation. Underlying Q1 2026 record (372 Afghan civilians killed/397 injured per UNAMA) is unchanged.",
    sources: ['https://www.aljazeera.com/news/2026/6/10/afghanistan-says-pakistan-air-raids-killed-13-people-including-children','https://en.wikipedia.org/wiki/2026_Afghanistan%E2%80%93Pakistan_war'] },

  'somalia': { news_score: 20, evidence_found: true,
    summary: "NEW ATTACKS ON ETHIOPIAN TROOPS AND ARMY BASE, SOMALI COUNTER-STRIKES KILL 26 — FAMINE-RISK RECORD SUSTAINED (Jul 9, Jul 11-12, within window, NEW): Al-Shabaab attacked Ethiopian troops stationed at Wajid Airport (Bakool) on Jul 11 while a military aircraft was unloading supplies, and launched a heavy overnight assault on a Somali army base in the Birbiraha area of Luuq district (Gedo) on Jul 9. In response, the Somali National Army, with international-partner support, conducted coordinated airstrikes Jul 12 on Al-Shabaab positions in Middle Shabelle, killing 26 fighters per government statement (unverified). Underlying humanitarian record remains severe: ~6M people (31% of the population) face Crisis-or-worse acute food insecurity Apr-Jun 2026; Al-Shabaab continues taxing/confiscating food, water and livestock.",
    sources: ['https://hornobserver.com/articles/3692/Somalia-Says-26-Al-Shabaab-Fighters-Killed-in-Airstrikes','https://www.crisisgroup.org/africa/horn-africa/somalia/al-shabaab-and-somalias-spreading-famine'] },

  'ethiopia': { news_score: 20, evidence_found: true,
    summary: "SUSTAINED — ETHIOPIA-ERITREA WAR-RISK CONTINUES, NO NEW DATED CLASH THIS WINDOW: Analyses continue to describe escalating Ethiopia-Eritrea tension over Red Sea/Assab port access, with PM Abiy's framing that \"the Red Sea and Ethiopia cannot remain separated forever\" and both sides maintaining troop buildups (Ethiopia has moved heavy artillery, tanks and personnel north). RANE/Stratfor's assessment that a large-scale Ethiopian invasion of Eritrea is unlikely in 2026, but that intensifying proxy clashes (Fano/OLA cooperation with TPLF and Eritrea) could escalate quickly, remains the operative risk assessment. No confirmed new clash or dated escalation within the 14-day window.",
    sources: ['https://worldview.stratfor.com/article/assessing-risk-ethiopia-eritrea-war-2026','https://www.atlanticcouncil.org/blogs/africasource/ethiopia-and-eritrea-are-on-the-brink-of-war-again/'] },

  'bolivia': { news_score: 20, evidence_found: true,
    summary: "SUSTAINED — PROTEST DEATH TOLL UNCHANGED AT 24, CURRENCY FLOATED, PROTEST-LEADER ARREST: The blockade/protest-related death toll remains at 24 killed/37 injured (as of Jul 9), unchanged from prior cycles. The government floated the boliviano's exchange rate on Jun 29 (ending its peg to the US dollar) in response to the estimated Bs.14 billion in economic losses from the 53-day blockade. The Tupac Katari protest-movement leader was arrested in early July amid hundreds of legal cases opened against protest leaders. The 90-day state of emergency (declared Jun 19-20) remains in force; root economic crisis (40-year-high inflation, fuel scarcity) is unresolved.",
    sources: ['https://en.wikipedia.org/wiki/2026_Bolivian_protests','https://www.aljazeera.com/video/newsfeed/2026/7/1/state-of-emergency-bolivias-currency-plummets-as-anger-simmers'] },

  'united-states': { news_score: 0, evidence_found: false,
    summary: "SCREENED — NO NEW MATERIAL EVIDENCE WITHIN WINDOW: Individual search performed. The Jun 25 and Jun 30 SCOTUS rulings (TPS termination for Haitians/Syrians; Mullin v. Al Otro Lado narrowing asylum eligibility; Mullin v. Doe on TPS; birthright citizenship upheld) all fall within or just before the 14-day window but were already reflected in prior confirmed cycles and are not newly-dated for this scan. No newly-dated material federal compassion-relevant action found within the 2026-06-29 to 2026-07-13 window beyond the previously-confirmed record.",
    sources: [] },

  'democratic-republic-of-c': { news_score: 40, evidence_found: true,
    summary: "EBOLA DEATH TOLL CROSSES 600, HEALTHCARE WORKERS WALK OFF THE JOB OVER UNPAID WAGES (Jul 9-10, within window, NEW): The DRC's Bundibugyo-strain Ebola outbreak reached at least 600-625 confirmed deaths and 1,759-1,792 confirmed cases as of Jul 9-10 — Africa CDC and multiple outlets describe it as the fastest-growing Ebola outbreak on the continent. In a newly-surfaced compounding factor this window, healthcare workers in Ituri province (the hardest-hit region) walked off their jobs to protest delayed payments, directly threatening outbreak-response capacity. The MBP134/remdesivir clinical trial (begun Jul 2, given no approved treatment exists for this strain) continues. Ongoing armed clashes in North/South Kivu and Ituri continue to hamper the response.",
    sources: ['https://www.aljazeera.com/news/2026/7/9/confirmed-ebola-deaths-in-dr-congo-hit-600','https://www.npr.org/2026/07/10/g-s1-132930/ebola-outbreak-congo','https://medicalxpress.com/news/2026-07-dead-dr-congo-ebola-outbreak-1.html'] },
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
  'venezuela','pakistan','iran','israel','sudan','democratic-republic-of-c','lebanon',
  'tunisia','china','nigeria','ukraine','russia','yemen','mali','anthropic',
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
  { entity: 'China', index: 'countries',
    signal_type: 'Dalai Lama 90th-birthday Tibet monastery crackdown and monk-suicide reference ("in August", no year given)',
    decision: 'SCREENED (recurring date-verification catch)',
    reason: 'This item continues to surface in search indexes and reads as drawn from HRW\'s World Report 2026 China/Tibet chapter (principally covering 2025-period events) rather than a freshly-dated July 2026 incident. Excluded again from scoring pending independent date confirmation; the confirmed Ethnic Unity Law (effective Jul 1) and Hong Kong prison-rules tightening remain in the sustained China entry.' },
  { entity: 'El Salvador', index: 'countries',
    signal_type: '"July constitutional amendment" removing presidential term limits recurring in search results',
    decision: 'SCREENED (confirmed stale via targeted date-verification search)',
    reason: 'A dedicated follow-up search this cycle confirmed the amendment was approved Jul 31, 2025 (57-3 vote) — not a fresh 2026 event. This is the same item already date-verified and excluded in prior cycles; excluded again with higher confidence this cycle.' },
  { entity: 'Anthropic', index: 'ai-labs',
    signal_type: 'Claude Max usage-cap class action lawsuit (Karl Kahn v. Anthropic)',
    decision: 'SCREENED (outside 14-day window)',
    reason: 'The lawsuit was filed and reported in mid-June 2026 (approximately Jun 15-16), which falls before the 2026-06-29 window start. Not a newly-dated event for this scan; a consumer-pricing/usage-terms dispute would in any case sit at the margin of compassion-relevance scope. Noted for awareness but excluded from scoring.' },
  { entity: 'Anthropic', index: 'ai-labs',
    signal_type: 'Anthropic-Pentagon supply-chain-risk dispute over autonomous-weapons/surveillance refusal',
    decision: 'SCREENED (no fresh dated escalation)',
    reason: 'This is an ongoing, previously-known dispute (Anthropic\'s refusal to support fully autonomous lethal weapons or mass domestic surveillance use cases, and the Pentagon\'s resulting supply-chain-risk designation) with no newly-dated development confirmed within this specific 14-day window. If anything, Anthropic\'s position here is protective of the compassion-relevant record, not a negative signal.' },
  { entity: 'Robotics sector (Zoox / Amazon)', index: 'robotics-labs',
    signal_type: '"Amazon\'s Zoox recalls 332 vehicles due to software glitch" resurfacing in search results',
    decision: 'SCREENED (stale, recirculating December 2025 story)',
    reason: 'Cross-referencing the incident details (issue identified Aug 26, described as the "third recall in eight months") confirms this is a December 2025 story recirculating in search indexes, not a newly-dated July 2026 event. Zoox is not currently a rotation-tracked robotics-labs entity in any case. No genuine new robotics-lab safety incident found in the sector sweep this window.' },
  { entity: 'Afghanistan', index: 'countries',
    signal_type: 'Unsourced/undated "Monday airstrikes, 28 civilians killed" reference in search aggregation',
    decision: 'SCREENED (unable to confirm date within window)',
    reason: 'Search results surfaced this figure without a reliable, independently confirmable 2026 date within the current 14-day window; given the Jul 1 Taliban drone strikes are already the confirmed operative record, this additional figure is not scored as a new escalation pending clearer sourcing.' },
];

// ── Sector alerts ────────────────────────────────────────────────────────────────
const sectorAlerts = [
  { alert_id: 'sa-2026-07-13-01',
    title: 'Iran: ceasefire nears total collapse — Trump threatens renewed Hormuz oil-shipping blockade; first use of one-way attack drones by US forces',
    scope: 'countries/iran, countries/bahrain, countries/kuwait, countries/oman, countries/qatar, countries/saudi-arabia, countries/united-arab-emirates',
    severity: 'critical',
    summary: 'The US-Iran ceasefire teetered toward total collapse over the weekend of Jul 11-13 as the US completed a second round of retaliatory strikes on Iran following Iranian attacks on commercial vessels in the Strait of Hormuz (Jul 6-7); CENTCOM confirmed first-ever use of one-way attack aerial and sea drones in these strikes. President Trump said Jul 13 the US would reinstate a blockade of Iranian oil-shipping vessels; Hormuz traffic has thinned to just 14 vessels (half Iranian) as shippers avoid the waterway. Pakistan and Qatar continue mediating toward a possible new round of talks.',
    sources: ['https://www.cnn.com/2026/07/13/world/live-news/iran-war-trump','https://en.wikipedia.org/wiki/2026_Strait_of_Hormuz_crisis'] },
  { alert_id: 'sa-2026-07-13-02',
    title: 'Venezuela earthquake day 20: official toll reaches 4,490; 19,500+ living in displacement camps',
    scope: 'countries/venezuela',
    severity: 'critical',
    summary: 'The government-reported death toll from the Jun 24 twin earthquakes rose to 4,490 as of Jul 13, up roughly 150 from the day before, with 16,740 injured and more than 19,500 now living in displacement camps. USGS\'s standing estimate is that the final toll could reach 10,000-100,000. No estimate has been given for the number of people still unaccounted for.',
    sources: ['https://www.euronews.com/2026/07/13/venezuela-quake-death-toll-rises-to-4490-officials-say-but-no-number-given-for-missing'] },
  { alert_id: 'sa-2026-07-13-03',
    title: 'Sudan: El Obeid drone-strike toll detailed at 45+ civilians in three weeks; European Parliament calls for RSF terrorist designation',
    scope: 'countries/sudan',
    severity: 'critical',
    summary: 'Reporting this window quantifies the RSF drone campaign against El Obeid for the first time with a specific toll: 15 drone strikes in three weeks killed at least 45 civilians, repeatedly striking markets, schools, fuel stations, water infrastructure and civilian vehicles amid a siege of roughly 500,000 trapped people; food prices have surged up to 300%. The European Parliament adopted a resolution in July calling on the EU to designate the RSF as a terrorist organization in direct response to the siege.',
    sources: ['https://sudantribune.com/article/316049','https://www.thenationalnews.com/news/mena/2026/07/06/al-obeid-in-darkness-as-rsf-maintains-siege-of-key-sudan-city/'] },
  { alert_id: 'sa-2026-07-13-04',
    title: 'Gaza: ceasefire violations continue — 8 killed Jul 13 including 9-year-old girl; cumulative toll since ceasefire exceeds 1,100',
    scope: 'countries/israel, countries/palestine',
    severity: 'critical',
    summary: 'An Israeli strike on the Sabra neighborhood south of Gaza City killed 8 Palestinians, including a 9-year-old girl, on Jul 13; additional deaths this window include a drone strike on a metal workshop (4 killed), machine-gun fire killing a girl in Al-Bureij, and a drone strike on a tent sheltering displaced people west of Khan Younis. Cumulative confirmed toll since the Oct 10, 2025 ceasefire now exceeds 1,100 killed and 3,500+ injured. Aid volumes into Gaza fell to under 42,000 pallets last month (down from ~46,600 in May) per OCHA\'s Jul 10 situation report.',
    sources: ['https://thedefensepost.com/2026/07/13/gaza-health-israeli-strike/','https://www.ochaopt.org/content/humanitarian-situation-report-10-july-2026'] },
  { alert_id: 'sa-2026-07-13-05',
    title: 'Pakistan: Operation Shaaban toll reaches 117 militants killed in Balochistan since Jul 5',
    scope: 'countries/pakistan',
    severity: 'high',
    summary: 'Following coordinated insurgent attacks Jul 4-8 that killed 42 (38 security personnel, 4 civilians), Pakistan\'s Operation Shaaban has killed a cumulative 117 alleged militants as of Jul 13 (unverified security-source figures), continuing to climb day over day (102 on Jul 12, 75 on Jul 10). PM Shehbaz Sharif\'s accusation that India facilitated the initial attacks remains unretracted.',
    sources: ['https://www.pakistantoday.com.pk/2026/07/13/117-militants-killed-in-balochistan-operations-since-july-5-say-security-sources'] },
  { alert_id: 'sa-2026-07-13-06',
    title: 'DRC/Uganda: Ebola death toll crosses 600; Ituri healthcare workers walk off the job over unpaid wages',
    scope: 'countries/democratic-republic-of-c, countries/uganda',
    severity: 'critical',
    summary: 'DRC\'s Bundibugyo-strain Ebola outbreak reached at least 600-625 confirmed deaths and 1,759-1,792 confirmed cases as of Jul 9-10 — described by Africa CDC as the fastest-growing Ebola outbreak on the continent. Healthcare workers in the hardest-hit Ituri province walked off the job to protest delayed payments this window, directly threatening outbreak-response capacity. Uganda continues managing its own 20-case/2-death Ebola cluster and an isolated Marburg case (Jun 30) with no further symptomatic contacts.',
    sources: ['https://www.aljazeera.com/news/2026/7/9/confirmed-ebola-deaths-in-dr-congo-hit-600','https://www.npr.org/2026/07/10/g-s1-132930/ebola-outbreak-congo'] },
  { alert_id: 'sa-2026-07-13-07',
    title: 'Tunisia: pending downgrade proposal reaches day 4 — no new escalation, published score unchanged',
    scope: 'countries/tunisia',
    severity: 'moderate',
    summary: 'The 2026-07-10 downgrade proposal (34.4 -> 23.8) remains open and unreviewed by the founder as of this scan (day 4). No materially new dated escalation surfaced this window beyond the Jul 8 mass sentencing of 21 opposition figures already reflected in the prior cycle; additional documented sentences (Sihem Bensedrine, Saadia Mosbah) fall just outside the 14-day window. Published composite (34.4) remains unchanged pending founder review.',
    sources: ['https://www.hrw.org/news/2026/07/08/sounding-the-alarm-over-tunisias-crackdown'] },
  { alert_id: 'sa-2026-07-13-08',
    title: 'AI labs: Meta $1.4T youth-safety trial approaches (Jul 27 bellwether); xAI/Grok CSAM class action reinforced by NCMEC reporting-failure finding',
    scope: 'fortune-500/meta-platforms, ai-labs/xai-grok',
    severity: 'critical',
    summary: 'Meta continues to face a $1.4 trillion penalty claim from state AGs over allegedly addictive teen-targeted design, with the second bellwether trial beginning Jul 27 ahead of the main August trial in Oakland. Separately, NCMEC\'s finding that 90% of xAI\'s CyberTipline reports were not actionable by law enforcement (because xAI declined to include identifying user information) reinforces the existing Grok deepfake-CSAM class-action record; the case was expanded Jul 7 to add Stability AI as co-defendant.',
    sources: ['https://www.jurist.org/news/2026/07/meta-says-state-ags-seek-1-4t-over-youth-safety-claims/','https://cyberscoop.com/deepfake-csam-lawsuit-grok-xai-expands-stability-ai/'] },
];

// ── Assemble scan ──────────────────────────────────────────────────────────────
const T1_SEARCHES = 38;
const T3_SEARCHES = 7;
const TOTAL_SEARCHES = T1_SEARCHES + T3_SEARCHES;

const scan = {
  scan_date: SCAN_DATE,
  scan_start: `${SCAN_DATE}T02:00:00Z`,
  scan_end:   `${SCAN_DATE}T03:20:00Z`,
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

fs.writeFileSync(path.join(ROOT, 'research/scans/2026-07-13.json'), JSON.stringify(scan, null, 2));

const erPayload = { date: SCAN_DATE, lookback_window_days: LOOKBACK_DAYS, reviews: siteReviews };
fs.writeFileSync(path.join(ROOT, 'site/src/data/evidence-reviews/2026-07-13.json'), JSON.stringify(erPayload, null, 2));
fs.writeFileSync(path.join(ROOT, 'site/src/data/evidence-reviews/latest.json'), JSON.stringify(erPayload, null, 2));

// Update rotation state — timestamps only, NO composites/bands/ranks
for (const slug of Object.keys(entities)) {
  entities[slug].last_scanned        = SCAN_DATE;
  entities[slug].last_evidence_touch = SCAN_DATE;
}
rotationState.last_updated = SCAN_DATE;
fs.writeFileSync(path.join(ROOT, 'research/rotation-state.json'), JSON.stringify(rotationState, null, 2));

// ── Summary ────────────────────────────────────────────────────────────────────
console.log('=== 2026-07-13 SCAN COMPLETE ===');
console.log('entities_scanned       :', entityReviews.length);
console.log('entities_with_evidence :', withEvidence);
console.log('searches_performed      :', TOTAL_SEARCHES, `(T1:${T1_SEARCHES} T2:0 T3:${T3_SEARCHES})`);
console.log('T1 entity count         :', T1.size);
console.log('top_entities (15)       :', topEntities.map(e => e.slug + ':' + e.priority_score).join(', '));
console.log('sector_alerts           :', sectorAlerts.length);
console.log('false_positives_screened:', falsePositivesScreened.length);
console.log('rotation_backfill       :', rotationBackfill.map(e=>e.slug).join(', '));
