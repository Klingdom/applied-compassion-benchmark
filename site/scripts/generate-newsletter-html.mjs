#!/usr/bin/env node

/**
 * generate-newsletter-html.mjs — V2
 * Generates Listmonk-ready HTML email content from the weekly JSON briefing data.
 * Implements Newsletter Design Spec V2 (2026-04-17).
 *
 * Usage:
 *   node site/scripts/generate-newsletter-html.mjs               # Today's date
 *   node site/scripts/generate-newsletter-html.mjs 2026-04-17    # Explicit date
 *
 * Output:
 *   - site/email-templates/weekly-briefing-content-{date}.html   (Listmonk content block)
 *   - site/email-templates/preview-{date}.html                   (browser preview)
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { readJson, writeTextAtomic, writeJsonAtomic } from "./lib/pipeline-reader.mjs";

const ROOT = join(import.meta.dirname, "..", "..");
const WEEKLY_JSON_DIR = join(ROOT, "site", "src", "data", "updates", "weekly");
const TEMPLATES_DIR = join(ROOT, "site", "email-templates");
const CONFIG_PATH = join(TEMPLATES_DIR, "newsletter-config.json");

// ── Date argument ────────────────────────────────────────────────

const date = process.argv[2] || new Date().toISOString().split("T")[0];
console.log(`Generating V2 HTML newsletter for ${date}...`);

// ── Issue number counter ─────────────────────────────────────────

let config = readJson(CONFIG_PATH) || { nextIssueNumber: 1 };
const issueNumber = config.nextIssueNumber;
// Increment and save (do at end after successful generation)

// ── Load JSON data ───────────────────────────────────────────────

const jsonPath = join(WEEKLY_JSON_DIR, `${date}.json`);
const data = readJson(jsonPath);
if (!data) {
  console.error(`Error: No weekly JSON found at ${jsonPath}`);
  process.exit(1);
}

const {
  stats,
  scoreChanges = [],
  confirmations = [],
  findings = [],
  signals = [],
  overrideLede = null,
} = data;

const {
  entitiesAssessed = 0,
  proposalsGenerated = 0,
  confirmations: confirmationCount = 0,
  upgrades = 0,
  downgrades = 0,
  bandChanges = 0,
  pipelineRuns = 0,
  entityCount = 1155,
  indexesAssessed = 0,
} = stats;

// ── Date range label ─────────────────────────────────────────────

function buildDateRange() {
  const weekStart = data.weekStart || "";
  const weekEnd = data.weekEnd || date;
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const year = (weekEnd || date).split("-")[0];
  if (weekStart) {
    const [, sm, sday] = weekStart.split("-");
    const [, em, eday] = weekEnd.split("-");
    const startMonth = months[parseInt(sm,10)-1];
    const endMonth   = months[parseInt(em,10)-1];
    const endDay = parseInt(eday,10);
    // If same month: "Apr 11&ndash;17, 2026"
    // Different month: "Mar 28&ndash;Apr 3, 2026"
    if (sm === em) {
      return `${startMonth} ${parseInt(sday,10)}&ndash;${endDay}, ${year}`;
    } else {
      return `${startMonth} ${parseInt(sday,10)}&ndash;${endMonth} ${endDay}, ${year}`;
    }
  }
  const [, em, eday] = weekEnd.split("-");
  return `${months[parseInt(em,10)-1]} ${parseInt(eday,10)}, ${year}`;
}

const dateRange = buildDateRange();

// ── Helpers ──────────────────────────────────────────────────────

const INDEX_LABELS = {
  "ai-labs": "AI Labs",
  "fortune-500": "Fortune 500",
  "f500": "Fortune 500",
  "countries": "Countries",
  "us-states": "US States",
  "us-cities": "US Cities",
  "global-cities": "Global Cities",
  "robotics-labs": "Robotics",
  "humanoid robotics labs index 2026": "Robotics",
};

const INDEX_ABBR = {
  "ai-labs": "AI Labs",
  "fortune-500": "F500",
  "f500": "F500",
  "countries": "Countries",
  "us-states": "US States",
  "us-cities": "US Cities",
  "global-cities": "Global Cities",
  "robotics-labs": "Robotics",
  "humanoid robotics labs index 2026": "Robotics",
};

function indexLabel(index) {
  if (!index) return "—";
  const key = index.toLowerCase().replace(/\s+/g, "-");
  return INDEX_LABELS[key] || INDEX_LABELS[index.toLowerCase()] || index;
}

function indexAbbr(index) {
  if (!index) return "—";
  const key = index.toLowerCase().replace(/\s+/g, "-");
  return INDEX_ABBR[key] || INDEX_ABBR[index.toLowerCase()] || index;
}

const BAND_COLORS = {
  exemplary: "#7dd3fc",
  established: "#86efac",
  functional: "#fcd34d",
  developing: "#fb923c",
  critical: "#f87171",
};

function bandColor(band) {
  if (!band) return "#8fa3be";
  return BAND_COLORS[band.toLowerCase()] || "#8fa3be";
}

function bandLabel(band) {
  if (!band) return "Unknown";
  return band.charAt(0).toUpperCase() + band.slice(1).toLowerCase();
}

function confidenceLabel(confidence) {
  if (!confidence) return "";
  return confidence.charAt(0).toUpperCase() + confidence.slice(1).toLowerCase() + " confidence";
}

function esc(text) {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function evidenceText(text) {
  if (!text) return "";
  return esc(text)
    .replace(/\s*—\s*/g, " &mdash; ")
    .replace(/\s*--\s*/g, " &mdash; ");
}

// Truncate evidence bullet to 120 chars at last word boundary
function truncateBullet(text) {
  if (!text || text.length <= 120) return text;
  const sub = text.slice(0, 120);
  const lastSpace = sub.lastIndexOf(" ");
  return lastSpace > 80 ? sub.slice(0, lastSpace) : sub;
}

// Direction color logic: large vs small threshold at 10pts
function deltaColor(delta) {
  if (delta <= -10) return "#f87171";
  if (delta < 0)    return "#fb923c";
  if (delta >= 10)  return "#86efac";
  if (delta > 0)    return "#34d399";
  return "#5a6a7e";
}

// ── Score bar (V2 pixel-width HTML table bar) ────────────────────
// BAR_TOTAL_PX = 460 (per spec section 12.17 / 7.10)
const BAR_TOTAL_PX = 460;
const LABEL_COL_PX = 48;
const TICK_PX = 2;
// Threshold positions (px) at 20/40/60/80% of 460px
// Each 20% segment = 92px. Ticks are 2px wide positioned at 20%/40%/60%/80%
// Segment cells: [0-20%][tick][20-40%][tick][40-60%][tick][60-80%][tick][80-100%]
// seg widths = 90,2,90,2,90,2,90,2,90 = 460 total (5 segs × 90 + 4 ticks × 2 = 458... adjust)
// Actually: 5 segments of 92px each = 460. Tick at boundary = split between adjacent segments.
// Simplest: use filled + empty approach, then a separate tick row.

function buildScoreBar(score, band) {
  const filledPx = Math.round(score / 100 * BAR_TOTAL_PX);
  const emptyPx = BAR_TOTAL_PX - filledPx;
  const color = bandColor(band);

  // Tick positions at 20/40/60/80 (px from left)
  const tick20 = Math.round(0.20 * BAR_TOTAL_PX);
  const tick40 = Math.round(0.40 * BAR_TOTAL_PX);
  const tick60 = Math.round(0.60 * BAR_TOTAL_PX);
  const tick80 = Math.round(0.80 * BAR_TOTAL_PX);

  // Tick row: segments between ticks
  // Widths: [0..tick20), tick, [tick20..tick40), tick, [tick40..tick60), tick, [tick60..tick80), tick, [tick80..460)
  const seg0 = tick20 - TICK_PX / 2;                 // ~91
  const seg1 = tick40 - tick20 - TICK_PX;             // ~88
  const seg2 = tick60 - tick40 - TICK_PX;             // ~88
  const seg3 = tick80 - tick60 - TICK_PX;             // ~88
  const seg4 = BAR_TOTAL_PX - tick80 - TICK_PX / 2;  // ~91

  return `
      <!-- Score bar (V2) -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:12px;" class="mobile-full-width">
        <tr>
          <!-- Filled portion -->
          <td width="${filledPx}" height="6" bgcolor="${color}" style="font-size:1px; line-height:1px; background-color:${color};">&nbsp;</td>
          <!-- Empty portion -->
          <td width="${emptyPx}" height="6" bgcolor="#2a3444" style="font-size:1px; line-height:1px; background-color:#2a3444;">&nbsp;</td>
          <!-- Score label -->
          <td width="${LABEL_COL_PX}" valign="middle" style="padding-left:8px; font-family:'SF Mono','Fira Code',Consolas,'Courier New',monospace; font-size:12px; color:#5a6a7e; white-space:nowrap;" aria-label="Score: ${score} out of 100, ${bandLabel(band)} band">
            ${score}
          </td>
        </tr>
        <!-- Band threshold tick row -->
        <tr>
          <td width="${seg0}" height="4" style="font-size:1px; line-height:1px;">&nbsp;</td>
          <td width="${TICK_PX}" height="4" bgcolor="#3a4a5e" style="font-size:1px; line-height:1px; background-color:#3a4a5e;">&nbsp;</td>
          <td width="${seg1}" height="4" style="font-size:1px; line-height:1px;">&nbsp;</td>
          <td width="${TICK_PX}" height="4" bgcolor="#3a4a5e" style="font-size:1px; line-height:1px; background-color:#3a4a5e;">&nbsp;</td>
          <td width="${seg2}" height="4" style="font-size:1px; line-height:1px;">&nbsp;</td>
          <td width="${TICK_PX}" height="4" bgcolor="#3a4a5e" style="font-size:1px; line-height:1px; background-color:#3a4a5e;">&nbsp;</td>
          <td width="${seg3}" height="4" style="font-size:1px; line-height:1px;">&nbsp;</td>
          <td width="${TICK_PX}" height="4" bgcolor="#3a4a5e" style="font-size:1px; line-height:1px; background-color:#3a4a5e;">&nbsp;</td>
          <td width="${seg4}" height="4" style="font-size:1px; line-height:1px;">&nbsp;</td>
          <td width="${LABEL_COL_PX}">&nbsp;</td>
        </tr>
      </table>`;
}

// ── Signal type classifier ───────────────────────────────────────

const SIGNAL_COLORS = {
  LITIGATION:  "#f87171",
  REGULATORY:  "#fb923c",
  FINANCIAL:   "#fcd34d",
  GOVERNANCE:  "#7dd3fc",
};

const SIGNAL_BG_RGB = {
  LITIGATION:  "248,113,113",
  REGULATORY:  "251,146,60",
  FINANCIAL:   "252,211,77",
  GOVERNANCE:  "125,211,252",
};

const LITIGATION_KEYWORDS  = /lawsuit|suit\b|case\b|verdict|settlement|court|trial|plaintiff|defendant|NLRB|litigation|injunction|investigate|investigation|indictment|charges?|criminal|felony/i;
const REGULATORY_KEYWORDS  = /\bEU\b|FTC|DOJ|NLRB|FDA|SEC|OSHA|CPSC|ICO|CMA|enforcement|regulation|compliance|deadline|act\b|enforceable|regulatory|mandate|penalty|fine/i;
const FINANCIAL_KEYWORDS   = /market cap|revenue|stock|earnings|M&A|bankruptcy|debt|credit|investment|IPO|valuation|fund|shares|equity|bond|damages?\s+\$|\$\d+[BM]/i;
const GOVERNANCE_KEYWORDS  = /CEO|board|chairman|executive|resignation|leadership|governance|accountability|director|management|oversight|audit committee/i;

function classifySignal(signal) {
  // Honor explicit field if JSON provides it
  if (signal.signalType && SIGNAL_COLORS[signal.signalType.toUpperCase()]) {
    return signal.signalType.toUpperCase();
  }
  const text = typeof signal === "string" ? signal : (signal.text || signal.body || "");
  // Priority: LITIGATION > REGULATORY > FINANCIAL > GOVERNANCE
  if (LITIGATION_KEYWORDS.test(text))  return "LITIGATION";
  if (REGULATORY_KEYWORDS.test(text))  return "REGULATORY";
  if (FINANCIAL_KEYWORDS.test(text))   return "FINANCIAL";
  if (GOVERNANCE_KEYWORDS.test(text))  return "GOVERNANCE";
  return "REGULATORY"; // default fallback
}

function signalText(signal) {
  return typeof signal === "string" ? signal : (signal.text || signal.body || "");
}

// ── Auto-lede generation (Spec section 11) ───────────────────────

function buildLede() {
  if (overrideLede) return overrideLede;

  const sorted = [...scoreChanges].sort((a,b) => Math.abs(b.delta) - Math.abs(a.delta));
  const topEntity = sorted[0];
  const topDelta = topEntity ? Math.abs(topEntity.delta) : 0;

  // Strategy 1: largest single-entity |delta| >= 25
  if (topDelta >= 25) {
    const dir = topEntity.delta < 0 ? "fell" : "rose";
    const pts = Math.abs(topEntity.delta).toFixed(1);
    const sentence = `${topEntity.entity} ${dir} ${pts} points — the largest single-entity change in pipeline history.`;
    return sentence.length <= 160 ? sentence : sentence.slice(0, sentence.lastIndexOf(" ", 160)) + ".";
  }

  // Strategy 2: band changes >= 5
  if (bandChanges >= 5) {
    const sentence = `${bandChanges} entities crossed a band boundary this week — the highest concentration of band changes in the index.`;
    return sentence.length <= 160 ? sentence : sentence;
  }

  // Strategy 3: single sector has 3+ changes
  const sectorCounts = {};
  const sectorDeltas = {};
  for (const sc of scoreChanges) {
    const s = indexLabel(sc.index);
    sectorCounts[s] = (sectorCounts[s] || 0) + 1;
    sectorDeltas[s] = (sectorDeltas[s] || 0) + Math.abs(sc.delta);
  }
  for (const [sector, count] of Object.entries(sectorCounts)) {
    if (count >= 3) {
      const combined = sectorDeltas[sector].toFixed(1);
      const sentence = `${sector} entities accounted for ${count} of ${scoreChanges.length} score changes this week, falling a combined ${combined} points.`;
      if (sentence.length <= 160) return sentence;
    }
  }

  // Strategy 4: all changes are downgrades and total > 5
  if (downgrades === scoreChanges.length && scoreChanges.length > 5) {
    const totalDelta = scoreChanges.reduce((sum, sc) => sum + Math.abs(sc.delta), 0).toFixed(1);
    const sectors = [...new Set(scoreChanges.map(sc => indexLabel(sc.index)))].join(", ");
    const sentence = `Every score change this week was a downgrade — ${scoreChanges.length} entities across ${sectors} fell a combined ${totalDelta} points.`;
    if (sentence.length <= 160) return sentence;
    return `Every score change this week was a downgrade — ${scoreChanges.length} entities fell a combined ${totalDelta} points.`;
  }

  // Strategy 5: default quiet week
  if (topEntity) {
    return `${confirmationCount} confirmations and ${scoreChanges.length} score changes this week. The largest: ${topEntity.entity} at ${topEntity.delta > 0 ? "+" : ""}${topEntity.delta.toFixed(1)} pts.`;
  }
  return `${confirmationCount} confirmations and no score changes this week — the most stable assessment cycle in recent history.`;
}

// ── Preheader (V2 refined: must include specific entity or event) ─

function buildPreheader() {
  const sorted = [...scoreChanges].sort((a,b) => Math.abs(b.delta) - Math.abs(a.delta));
  const topTwo = sorted.slice(0, 2).map(sc => sc.entity);
  let text = "";
  if (topTwo.length >= 2) {
    text = `${topTwo[0]} &minus;${Math.abs(sorted[0].delta).toFixed(1)}pts, ${topTwo[1]} &minus;${Math.abs(sorted[1].delta).toFixed(1)}pts.`;
  } else if (topTwo.length === 1) {
    text = `${topTwo[0]} ${sorted[0].delta > 0 ? "+" : ""}${sorted[0].delta.toFixed(1)}pts.`;
  }
  if (bandChanges > 0) text += ` ${bandChanges} band change${bandChanges !== 1 ? "s" : ""}.`;
  if (signals.length > 0) {
    // Add first signal keyword
    const firstSig = signalText(signals[0]);
    const match = firstSig.match(/[A-Z][^.]{10,40}/);
    if (match) text += ` ${match[0].slice(0, 40)}.`;
  }
  text += " Full briefing inside.";
  // Strip HTML entities for raw char count
  const raw = text.replace(/&[^;]+;/g, "X");
  if (raw.length > 90) {
    // Trim the text before "Full briefing inside."
    const base = text.replace(" Full briefing inside.", "");
    return base.slice(0, 60) + "... Full briefing inside.";
  }
  return text;
}

// ── Summary ticker ───────────────────────────────────────────────

function buildSummaryTicker() {
  const sorted = [...scoreChanges].sort((a,b) => Math.abs(b.delta) - Math.abs(a.delta));
  const topMover = sorted[0];
  const topDeltaVal = topMover ? topMover.delta.toFixed(1) : "—";
  const topDeltaColor = topMover ? deltaColor(topMover.delta) : "#5a6a7e";
  const topEntityName = topMover ? esc(topMover.entity) : "—";
  const topSign = topMover && topMover.delta > 0 ? "+" : "";

  return `
<!-- ============================================ -->
<!-- SUMMARY TICKER                               -->
<!-- ============================================ -->
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:24px; background-color:#0d1525; border:1px solid rgba(125,211,252,0.08);">
  <tr>
    <td class="ticker-cell" width="20%" align="center" style="padding:16px 4px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
      <div style="font-size:10px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#8fa3be; line-height:1.0; margin-bottom:6px;">ASSESSED</div>
      <div style="font-family:'SF Mono','Fira Code',Consolas,'Courier New',monospace; font-size:16px; font-weight:700; color:#e8eefb; line-height:1.0;">${entitiesAssessed}</div>
    </td>
    <td class="ticker-cell" width="20%" align="center" style="padding:16px 4px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
      <div style="font-size:10px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#8fa3be; line-height:1.0; margin-bottom:6px;">CHANGES</div>
      <div style="font-family:'SF Mono','Fira Code',Consolas,'Courier New',monospace; font-size:16px; font-weight:700; color:#e8eefb; line-height:1.0;">${scoreChanges.length}</div>
    </td>
    <td class="ticker-cell" width="20%" align="center" style="padding:16px 4px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
      <div style="font-size:10px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#8fa3be; line-height:1.0; margin-bottom:6px;">BAND&nbsp;&uarr;&darr;</div>
      <div style="font-family:'SF Mono','Fira Code',Consolas,'Courier New',monospace; font-size:16px; font-weight:700; color:#e8eefb; line-height:1.0;">${bandChanges}</div>
    </td>
    <td class="ticker-cell" width="20%" align="center" style="padding:16px 4px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
      <div style="font-size:10px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#8fa3be; line-height:1.0; margin-bottom:6px;">TOP MOVE</div>
      <div style="font-family:'SF Mono','Fira Code',Consolas,'Courier New',monospace; font-size:16px; font-weight:700; color:${topDeltaColor}; line-height:1.0;">${topSign}${topDeltaVal} pts</div>
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif; font-size:11px; font-weight:400; color:#8fa3be; line-height:1.0; margin-top:4px;">${topEntityName}</div>
    </td>
    <td class="ticker-cell" width="20%" align="center" style="padding:16px 4px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
      <div style="font-size:10px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#8fa3be; line-height:1.0; margin-bottom:6px;">CONFIRMED</div>
      <div style="font-family:'SF Mono','Fira Code',Consolas,'Courier New',monospace; font-size:16px; font-weight:700; color:#e8eefb; line-height:1.0;">${confirmationCount}</div>
    </td>
  </tr>
</table>`;
}

// ── Compressed change table (conditional: only if >= 4 changes) ──

function buildCompressedChangeTable() {
  if (scoreChanges.length < 4) return "";

  const sorted = [...scoreChanges].sort((a,b) => Math.abs(b.delta) - Math.abs(a.delta));
  const rows = sorted.slice(0, 15).map((sc, i) => {
    const dc = deltaColor(sc.delta);
    const absDelta = Math.abs(sc.delta).toFixed(1);
    const arrow = sc.delta < 0 ? "&darr;" : "&uarr;";
    const sign = sc.delta < 0 ? "&minus;" : "+";
    const newScoreColor = bandColor(sc.proposedBand || sc.publishedBand);
    const bandTick = sc.bandChange
      ? `<span style="color:#7dd3fc;">&#8597;</span>` : `&nbsp;`;
    const rowBg = i % 2 === 1 ? "background-color:rgba(255,255,255,0.02);" : "";

    return `
    <tr style="${rowBg}">
      <td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif; font-size:13px; font-weight:600; color:#e8eefb; padding:8px 4px 8px 0;">${esc(sc.entity)}</td>
      <td class="mobile-hide" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif; font-size:13px; font-weight:400; color:#8fa3be; padding:8px 8px 8px 0;">${indexAbbr(sc.index)}</td>
      <td class="mobile-hide" style="font-family:'SF Mono','Fira Code',Consolas,'Courier New',monospace; font-size:13px; font-weight:400; padding:8px 8px 8px 0; white-space:nowrap;">
        <span style="color:#5a6a7e;">${sc.publishedScore.toFixed(1)}&nbsp;&rarr;&nbsp;</span><span style="color:${newScoreColor};">${sc.proposedScore.toFixed(1)}</span>
      </td>
      <td style="font-family:'SF Mono','Fira Code',Consolas,'Courier New',monospace; font-size:13px; font-weight:600; color:${dc}; padding:8px 8px 8px 0; white-space:nowrap;">${arrow}${sign}${absDelta}</td>
      <td width="20" align="center" style="font-size:13px; padding:8px 0;">${bandTick}</td>
    </tr>`;
  });

  const overflow = scoreChanges.length > 15
    ? `<tr><td colspan="5" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif; font-size:12px; color:#5a6a7e; padding:6px 0;">... and ${scoreChanges.length - 15} more &mdash; <a href="{{ TrackLink "https://compassionbenchmark.com/updates?utm_source=newsletter&utm_medium=email&utm_campaign=weekly" }}" style="color:#7dd3fc; text-decoration:none;">compassionbenchmark.com/updates</a></td></tr>`
    : "";

  return `
<!-- ============================================ -->
<!-- COMPRESSED CHANGE TABLE                      -->
<!-- ============================================ -->
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:24px;">
  <tr>
    <td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif; font-size:11px; font-weight:400; color:#5a6a7e; font-style:italic; padding-bottom:8px;">
      All changes &middot; ${dateRange} &middot; sorted by |&Delta;|
    </td>
  </tr>
  <tr>
    <td>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
        <!-- Header row -->
        <tr style="border-bottom:1px solid rgba(255,255,255,0.08);">
          <td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif; font-size:10px; font-weight:700; color:#5a6a7e; letter-spacing:0.08em; text-transform:uppercase; padding-bottom:8px;">Entity</td>
          <td class="mobile-hide" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif; font-size:10px; font-weight:700; color:#5a6a7e; letter-spacing:0.08em; text-transform:uppercase; padding-bottom:8px;">Index</td>
          <td class="mobile-hide" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif; font-size:10px; font-weight:700; color:#5a6a7e; letter-spacing:0.08em; text-transform:uppercase; padding-bottom:8px;">Score</td>
          <td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif; font-size:10px; font-weight:700; color:#5a6a7e; letter-spacing:0.08em; text-transform:uppercase; padding-bottom:8px;">&Delta;</td>
          <td width="20" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif; font-size:10px; font-weight:700; color:#5a6a7e; letter-spacing:0.08em; text-transform:uppercase; padding-bottom:8px;">Band&nbsp;&#8597;</td>
        </tr>
        ${rows.join("")}
        ${overflow}
      </table>
    </td>
  </tr>
  <tr>
    <td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif; font-size:11px; font-weight:400; color:#5a6a7e; padding-top:8px; font-style:italic;">
      Detailed cards for top 5 changes follow below.
    </td>
  </tr>
</table>`;
}

// ── Score change card (V2 redesigned) ───────────────────────────

function buildScoreCard(sc) {
  const isDowngrade = sc.delta < 0;
  const isUpgrade   = sc.delta > 0;
  const dc = deltaColor(sc.delta);

  // Card border: 30% opacity of direction color
  const borderColor = isDowngrade
    ? `rgba(${sc.delta <= -10 ? "248,113,113" : "251,146,60"},0.30)`
    : isUpgrade
      ? "rgba(134,239,172,0.30)"
      : "rgba(90,106,126,0.30)";

  // Evidence border accent: 35% opacity
  const evidBorderColor = isDowngrade
    ? `rgba(${sc.delta <= -10 ? "248,113,113" : "251,146,60"},0.35)`
    : isUpgrade
      ? "rgba(134,239,172,0.35)"
      : "rgba(90,106,126,0.35)";

  const absDelta = Math.abs(sc.delta).toFixed(1);
  const arrow = isDowngrade ? "&darr;" : isUpgrade ? "&uarr;" : "&rarr;";

  // Status badge
  const badgeText  = sc.recommendation === "flag-for-review" ? "Proposed" : "Applied";
  const badgeColor    = badgeText === "Applied" ? "#86efac" : "#fcd34d";
  const badgeBgColor  = badgeText === "Applied" ? "rgba(134,239,172,0.10)" : "rgba(252,211,77,0.10)";
  const badgeBorder   = badgeText === "Applied" ? "rgba(134,239,172,0.25)" : "rgba(252,211,77,0.25)";

  // New score color = band color
  const newScoreColor = bandColor(sc.proposedBand || sc.publishedBand);

  // Band row
  let bandRow;
  if (sc.bandChange && sc.publishedBand && sc.proposedBand) {
    const fc = bandColor(sc.publishedBand);
    const tc = bandColor(sc.proposedBand);
    bandRow = `
            <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background-color:${fc}; vertical-align:middle;"></span>
            <span style="color:${fc}; font-weight:600; vertical-align:middle;">&nbsp;${bandLabel(sc.publishedBand)}</span>
            <span style="color:#5a6a7e; vertical-align:middle;">&nbsp;&rarr;&nbsp;</span>
            <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background-color:${tc}; vertical-align:middle;"></span>
            <span style="color:${tc}; font-weight:600; vertical-align:middle;">&nbsp;${bandLabel(sc.proposedBand)}</span>
            <span style="color:#5a6a7e; vertical-align:middle;">&nbsp;&nbsp;&middot;&nbsp;&nbsp;</span>
            <span style="color:#8fa3be; vertical-align:middle;">${confidenceLabel(sc.confidence)}</span>`;
  } else {
    const curBand  = sc.proposedBand || sc.publishedBand;
    const curColor = bandColor(curBand);
    bandRow = `
            <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background-color:${curColor}; vertical-align:middle;"></span>
            <span style="color:${curColor}; font-weight:600; vertical-align:middle;">&nbsp;${bandLabel(curBand)}</span>
            <span style="color:#5a6a7e; vertical-align:middle;">&nbsp;&nbsp;&middot;&nbsp;&nbsp;</span>
            <span style="color:#8fa3be; vertical-align:middle;">${confidenceLabel(sc.confidence)}</span>`;
  }

  // Evidence bullets (max 2, truncated to 120 chars)
  const ev = sc.evidence || [];
  const b1 = ev[0] ? `<span style="display:block; margin-bottom:8px;">${evidenceText(truncateBullet(ev[0]))}</span>` : "";
  const b2 = ev[1] ? `<span style="display:block;">${evidenceText(truncateBullet(ev[1]))}</span>` : "";

  const displayScore     = sc.proposedScore != null ? sc.proposedScore.toFixed(1) : "—";
  const displayPublished = sc.publishedScore != null ? sc.publishedScore.toFixed(1) : "—";

  const barHtml = sc.proposedScore != null
    ? buildScoreBar(sc.proposedScore, sc.proposedBand || sc.publishedBand)
    : "";

  // PLACEHOLDER: dimension profile strip insertion point
  // TODO: Implement dimension strip (spec section 7.5) when weekly JSON carries dimension scores.
  // const dimensionStripHtml = buildDimensionStrip(sc); // deferred — data not yet available

  return `
<!-- === Score Change Card: ${esc(sc.entity)} === -->
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:16px; border:1px solid ${borderColor}; border-radius:12px; border-collapse:separate;">
  <tr>
    <td style="padding:20px; background-color:#111827; border-radius:12px;">

      <!-- Entity header row -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr class="score-row">
          <!-- Entity name + index + badge -->
          <td class="mobile-stack" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif; vertical-align:top; padding-bottom:4px;">
            <span style="font-size:15px; font-weight:700; color:#e8eefb; letter-spacing:-0.01em;">${esc(sc.entity)}</span>
            <br>
            <span style="font-size:11px; font-weight:500; color:#8fa3be; letter-spacing:0.02em;">${indexLabel(sc.index)}</span>
            &nbsp;
            <span style="display:inline-block; font-size:10px; font-weight:600; color:${badgeColor}; background-color:${badgeBgColor}; border:1px solid ${badgeBorder}; border-radius:10px; padding:2px 8px; vertical-align:middle;">
              ${badgeText}
            </span>
          </td>
          <!-- Score + delta (monospace for numbers) -->
          <td class="mobile-stack" align="right" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif; vertical-align:top; white-space:nowrap; padding-bottom:4px;">
            <span style="font-family:'SF Mono','Fira Code',Consolas,'Courier New',monospace; font-size:13px; font-weight:400; color:#5a6a7e;">${displayPublished}</span>
            <span style="font-size:12px; color:#5a6a7e;">&nbsp;&rarr;&nbsp;</span>
            <span class="mobile-score-new" style="font-family:'SF Mono','Fira Code',Consolas,'Courier New',monospace; font-size:20px; font-weight:700; color:${newScoreColor};">${displayScore}</span>
            <br>
            <span style="font-family:'SF Mono','Fira Code',Consolas,'Courier New',monospace; font-size:13px; font-weight:600; color:${dc};">${arrow} ${absDelta} pts</span>
          </td>
        </tr>
      </table>

      <!-- Band indicator row -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:8px 0 12px 0;">
        <tr>
          <td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif; font-size:12px; color:#b8c6de; line-height:1.0;">${bandRow}
          </td>
        </tr>
      </table>

      <!-- Evidence bullets -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif; font-size:13px; line-height:1.55; color:#b8c6de; border-left:2px solid ${evidBorderColor}; padding-left:12px;">
            ${b1}${b2}
          </td>
        </tr>
      </table>

      ${barHtml}

    </td>
  </tr>
</table>`;
}

// ── Confirmations grouped by index (V2) ──────────────────────────

function buildConfirmations(confs) {
  if (!confs || confs.length === 0) return "";

  // Group by index
  const groups = {};
  const groupOrder = [];
  for (const c of confs) {
    const lbl = indexLabel(c.index);
    if (!groups[lbl]) {
      groups[lbl] = [];
      groupOrder.push(lbl);
    }
    groups[lbl].push(c);
  }

  // Sort within each group by |delta| descending
  for (const lbl of groupOrder) {
    groups[lbl].sort((a,b) => Math.abs(b.delta || 0) - Math.abs(a.delta || 0));
  }

  let html = "";
  let firstGroup = true;
  let totalShown = 0;
  const MAX_SHOWN = 16;

  for (const lbl of groupOrder) {
    if (totalShown >= MAX_SHOWN) break;
    const items = groups[lbl];
    const topPad = firstGroup ? "" : "padding-top:12px;";
    firstGroup = false;

    html += `
    <!-- Index group: ${lbl} -->
    <tr>
      <td colspan="3" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif; font-size:11px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase; color:#5a6a7e; padding-bottom:4px; ${topPad} border-bottom:1px solid rgba(255,255,255,0.04);">
        ${lbl}
      </td>
    </tr>`;

    for (const c of items) {
      if (totalShown >= MAX_SHOWN) break;
      totalShown++;
      const delta = c.delta ?? 0;
      const dc2 = delta === 0 ? "#5a6a7e" : (delta < 0 ? deltaColor(delta) : deltaColor(delta));
      const deltaSign = delta > 0 ? "+" : delta < 0 ? "&minus;" : "";
      const deltaAbs = Math.abs(delta).toFixed(1);
      const pub = c.publishedScore != null ? c.publishedScore.toFixed(1) : "—";
      const assessed = c.assessedScore != null ? c.assessedScore.toFixed(1) : "—";

      html += `
    <tr>
      <td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif; font-size:13px; font-weight:600; color:#e8eefb; padding:4px 8px 4px 0; width:60%;">${esc(c.entity)}</td>
      <td class="confirm-col-score" style="font-family:'SF Mono','Fira Code',Consolas,'Courier New',monospace; font-size:13px; font-weight:400; color:#5a6a7e; padding:4px 8px 4px 0; width:25%; white-space:nowrap;">${pub}&nbsp;&rarr;&nbsp;${assessed}</td>
      <td style="font-family:'SF Mono','Fira Code',Consolas,'Courier New',monospace; font-size:13px; font-weight:600; color:${dc2}; padding:4px 0; width:15%; white-space:nowrap; text-align:right;">${deltaSign}${deltaAbs}</td>
    </tr>`;
    }
  }

  const overflow = confs.length > MAX_SHOWN
    ? `<tr><td colspan="3" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif; font-size:12px; color:#5a6a7e; padding-top:8px;">... and ${confs.length - MAX_SHOWN} more confirmed. <a href="{{ TrackLink "https://compassionbenchmark.com/updates?utm_source=newsletter&utm_medium=email&utm_campaign=weekly" }}" style="color:#7dd3fc; text-decoration:none;">View all at compassionbenchmark.com/updates &rarr;</a></td></tr>` : "";

  return `
<!-- SCORES CONFIRMED grouped by index -->
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:24px;">
  ${html}
  ${overflow}
  <tr>
    <td colspan="3" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif; font-size:11px; color:#5a6a7e; padding-top:12px;">
      ${confs.length} total &middot; <a href="{{ TrackLink "https://compassionbenchmark.com/updates?utm_source=newsletter&utm_medium=email&utm_campaign=weekly" }}" style="color:#7dd3fc; text-decoration:none;">View all at compassionbenchmark.com/updates &rarr;</a>
    </td>
  </tr>
</table>`;
}

// ── Findings section (V2 typography push) ───────────────────────

function buildFindings(findingsList) {
  const items = findingsList.slice(0, 3);
  if (items.length === 0) return "";
  const rows = items.map((text, i) => {
    const num = String(i + 1).padStart(2, "0");
    const isLast = i === items.length - 1;
    return `  <!-- Finding ${num} -->
  <tr${isLast ? "" : ' style="padding-bottom:0;"'}>
    <td${isLast ? "" : ' style="padding-bottom:16px;"'}>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td width="32" valign="top" style="font-family:'SF Mono','Fira Code',Consolas,'Courier New',monospace; font-size:13px; font-weight:700; color:#7dd3fc; letter-spacing:0.04em; padding-top:2px; line-height:1.0;">
            ${num}
          </td>
          <td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif; font-size:14px; line-height:1.65; color:#b8c6de; padding-left:0;" class="mobile-text-lg">
            ${evidenceText(text)}
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
  });

  return `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:24px;">
${rows.join("\n")}
</table>`;
}

// ── Signals section (V2 with type differentiation) ───────────────

function buildSignals(signalsList) {
  const items = signalsList.slice(0, 3);
  return items.map((item, i) => {
    const isLast = i === items.length - 1;
    const mb = isLast ? "24px" : "12px";
    const type = classifySignal(item);
    const color = SIGNAL_COLORS[type];
    const bgRgb = SIGNAL_BG_RGB[type];
    const text = signalText(item);

    return `<!-- Signal ${i + 1}: ${type} -->
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:${mb}; border-left:3px solid ${color}; background-color:rgba(${bgRgb},0.04);">
  <tr>
    <td style="padding:12px 16px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
      <div style="font-size:10px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:${color}; margin-bottom:6px;">${type}</div>
      <div style="font-size:13px; line-height:1.55; color:#b8c6de;" class="mobile-text-lg">
        ${evidenceText(text)}
      </div>
    </td>
  </tr>
</table>`;
  }).join("\n");
}

// ── Section helpers ──────────────────────────────────────────────

function divider(style = "rgba(255,255,255,0.06)") {
  return `
<!-- Divider -->
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:20px;">
  <tr>
    <td style="border-top:1px solid ${style}; font-size:1px; line-height:1px;">&nbsp;</td>
  </tr>
</table>`;
}

function sectionLabel(label) {
  return `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:4px;">
  <tr>
    <td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif; font-size:10px; font-weight:700; letter-spacing:0.10em; text-transform:uppercase; color:#7dd3fc; padding-bottom:12px;">
      ${label}
    </td>
  </tr>
</table>`;
}

// ── Build content block ──────────────────────────────────────────

const topCards = [...scoreChanges]
  .sort((a,b) => Math.abs(b.delta) - Math.abs(a.delta))
  .slice(0, 5);

const parts = [];

// 1. Preheader
parts.push(`

<!-- ============================================ -->
<!-- PREHEADER (hidden inbox preview text)        -->
<!-- ============================================ -->
<div style="display:none; max-height:0; overflow:hidden; mso-hide:all;" aria-hidden="true">
  ${buildPreheader()}
  &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
</div>`);

// 2. Lede block
const ledeText = buildLede();
parts.push(`

<!-- ============================================ -->
<!-- LEDE BLOCK                                   -->
<!-- ============================================ -->
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:20px;">
  <tr>
    <td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif; font-size:17px; font-weight:600; line-height:1.45; color:#e8eefb; letter-spacing:-0.01em;" class="mobile-lede">
      ${evidenceText(ledeText)}
    </td>
  </tr>
</table>`);

// 3. Summary ticker
parts.push(buildSummaryTicker());

// 4. Score movements section
parts.push(`

<!-- ============================================ -->
<!-- SECTION: SCORE MOVEMENTS                     -->
<!-- ============================================ -->`);
parts.push(divider());
parts.push(sectionLabel("Score Movements"));

// 4a. Compressed change table (conditional >= 4 changes)
parts.push(buildCompressedChangeTable());

// 4b. Top 5 detail cards
for (const sc of topCards) {
  parts.push(buildScoreCard(sc));
}

// 5. CTA 1: Research upsell (V2 copy, plain text, not italic)
parts.push(`

<!-- ============================================ -->
<!-- CTA 1: Research upsell (text-only, V2 copy)  -->
<!-- ============================================ -->
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:20px; margin-bottom:24px;">
  <tr>
    <td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif; font-size:13px; line-height:1.6; color:#5a6a7e;">
      Dimension-level scores, evidence citations, and methodology notes for all assessed entities are available at
      <a href="{{ TrackLink "https://compassionbenchmark.com/purchase-research?utm_source=newsletter&utm_medium=email&utm_campaign=weekly&utm_content=cta1" }}" style="color:#7dd3fc; text-decoration:none;">compassionbenchmark.com/purchase-research</a>.
    </td>
  </tr>
</table>`);

// 6. Scores confirmed section
parts.push(`

<!-- ============================================ -->
<!-- SECTION: SCORES CONFIRMED                    -->
<!-- ============================================ -->`);
parts.push(divider());
parts.push(sectionLabel("Scores Confirmed"));
parts.push(buildConfirmations(confirmations));

// 7. Findings section
parts.push(`

<!-- ============================================ -->
<!-- SECTION: FINDINGS                            -->
<!-- ============================================ -->`);
parts.push(divider());
parts.push(sectionLabel("Findings"));
parts.push(buildFindings(findings));

// 8. Signals section
parts.push(`

<!-- ============================================ -->
<!-- SECTION: SIGNALS                             -->
<!-- ============================================ -->`);
parts.push(divider());
parts.push(sectionLabel("Signals"));
parts.push(buildSignals(signals));

// 9. CTA 2: Institutional services (V2 copy)
parts.push(`

<!-- ============================================ -->
<!-- CTA 2: Institutional services (V2 copy)      -->
<!-- ============================================ -->
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:8px; background-color:rgba(125,211,252,0.04); border:1px solid rgba(125,211,252,0.10); border-radius:12px; border-collapse:separate;">
  <tr>
    <td style="padding:20px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif; font-size:13px; line-height:1.6; color:#8fa3be; text-align:center;">
      Producing an ESG brief, divestment analysis, or policy position that intersects with these rankings?
      <br>
      We provide licensed dataset access, structured briefings, and expert review for institutional use.
      <br>
      <span style="font-weight:600; color:#7dd3fc;">Reply to this email.</span>
    </td>
  </tr>
</table>`);

// 10. Pipeline stats — moved to footer (rendered in content, just above the template footer)
// The template footer will show independence + nav + unsub.
// Per spec 7.13, pipeline stats are the first item AFTER the footer divider.
// We emit them as a block the template footer div will follow.
parts.push(`

<!-- ============================================ -->
<!-- PIPELINE STATS (footer — moved from opening) -->
<!-- ============================================ -->
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:8px; margin-bottom:16px;">
  <tr>
    <td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif; font-size:12px; color:#5a6a7e; text-align:center; letter-spacing:0.02em;">
      Assessed: <span style="color:#8fa3be; font-weight:600;">${entitiesAssessed}</span>
      &nbsp;&middot;&nbsp;
      Changes: <span style="color:#8fa3be; font-weight:600;">${scoreChanges.length}</span>
      &nbsp;&middot;&nbsp;
      Band changes: <span style="color:#8fa3be; font-weight:600;">${bandChanges}</span>
      &nbsp;&middot;&nbsp;
      Confirmed: <span style="color:#8fa3be; font-weight:600;">${confirmationCount}</span>
      &nbsp;&middot;&nbsp;
      Tracked: <span style="color:#8fa3be; font-weight:600;">${entityCount.toLocaleString()}</span>
    </td>
  </tr>
</table>`);

const contentHtml = parts.join("\n");

// ── Write content block ──────────────────────────────────────────

const contentPath = join(TEMPLATES_DIR, `weekly-briefing-content-${date}.html`);
writeTextAtomic(contentPath, contentHtml);
console.log(`  Content block: ${contentPath}`);

// ── Patch base template with current issue number + date range ───
// Updates listmonk-campaign.html so the Listmonk paste always reflects
// the correct issue number and date range without manual editing.

const templatePath = join(TEMPLATES_DIR, "listmonk-campaign.html");
if (!existsSync(templatePath)) {
  console.error(`Error: Base template not found at ${templatePath}`);
  process.exit(1);
}

let rawTemplate = readFileSync(templatePath, "utf-8");

// Replace the issue number comment+value pattern
rawTemplate = rawTemplate.replace(
  /Issue #<!-- ISSUE_NUMBER:[^>]*-->\d+/,
  `Issue #<!-- ISSUE_NUMBER: update each campaign -->${issueNumber}`
);

// Replace the date range pattern (handles "Mon D&ndash;D, YYYY" and "Mon D&ndash;Mon D, YYYY")
rawTemplate = rawTemplate.replace(
  /[A-Z][a-z]{2} \d{1,2}&ndash;(?:[A-Z][a-z]{2} )?\d{1,2}, \d{4}/,
  dateRange
);

writeTextAtomic(templatePath, rawTemplate);
console.log(`  Base template: updated issue #${issueNumber} + date range`);

// ── Build preview (merge updated template + content, strip Go directives) ─

// Re-read the just-patched template (issue number + date range now current)
let templateHtml = readFileSync(templatePath, "utf-8");

// Strip/replace Go template directives for local preview
templateHtml = templateHtml
  .replace(/\{\{\s*template\s+"content"\s+\.\s*\}\}/g, contentHtml)
  .replace(/\{\{\s*TrackLink\s+"([^"]+)"\s*\}\}/g, "$1")
  .replace(/\{\{\s*UnsubscribeURL\s*\}\}/g, "#unsubscribe")
  .replace(/\{\{\s*MessageURL\s*\}\}/g, "#");

const previewPath = join(TEMPLATES_DIR, `preview-${date}.html`);
writeTextAtomic(previewPath, templateHtml);
console.log(`  Preview:       ${previewPath}`);

// ── Increment issue counter ──────────────────────────────────────

config.nextIssueNumber = issueNumber + 1;
writeJsonAtomic(CONFIG_PATH, config);
console.log(`  Issue number:  #${issueNumber} (next will be #${issueNumber + 1})`);

// ── File size report ─────────────────────────────────────────────

const contentSize  = Buffer.byteLength(contentHtml, "utf-8");
const previewSize  = Buffer.byteLength(templateHtml, "utf-8");
const contentLines = contentHtml.split("\n").length;
const previewLines = templateHtml.split("\n").length;

console.log(`\nOutput sizes:`);
console.log(`  Content block: ${(contentSize / 1024).toFixed(1)} KB, ${contentLines} lines`);
console.log(`  Preview:       ${(previewSize / 1024).toFixed(1)} KB, ${previewLines} lines`);
console.log(`\nStats:`);
console.log(`  Lede:           ${ledeText.slice(0, 80)}...`);
console.log(`  Top cards:      ${topCards.map(sc => sc.entity).join(", ")}`);
console.log(`  Confirmations:  ${confirmations.length} total (grouped by index)`);
console.log(`  Findings:       ${Math.min(findings.length, 3)} shown`);
console.log(`  Signals:        ${Math.min(signals.length, 3)} shown`);
console.log(`  Pipeline stats: Assessed:${entitiesAssessed} · Changes:${scoreChanges.length} · BandChanges:${bandChanges} · Confirmed:${confirmationCount} · Tracked:${entityCount.toLocaleString()}`);
console.log(`\nSignal types detected:`);
for (const sig of signals.slice(0, 3)) {
  console.log(`  [${classifySignal(sig)}] ${signalText(sig).slice(0, 60)}...`);
}

// Report missing/fallback fields
const missing = [];
if (!data.findings || data.findings.length === 0) missing.push("findings (none in JSON)");
if (!data.signals  || data.signals.length === 0)  missing.push("signals (none in JSON)");
if (missing.length > 0) {
  console.log(`\nMissing fields (fallbacks applied):`);
  for (const m of missing) console.log(`  - ${m}`);
}
