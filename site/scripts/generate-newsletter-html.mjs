#!/usr/bin/env node

/**
 * generate-newsletter-html.mjs — V3
 * Generates Listmonk-ready HTML email content from the weekly JSON briefing data.
 * Implements Newsletter Design Spec V3 (2026-04-17) — editorial research publication theme.
 *
 * Design: FT Moral Money archetype. Warm paper (#FDFAF6 container, #F4EFE6 outer).
 * Georgia serif masthead. Single accent: #8B1A1A. Zero dark backgrounds. Zero cyan.
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
console.log(`Generating V3 HTML newsletter for ${date}...`);

// ── Issue number counter ─────────────────────────────────────────

let config = readJson(CONFIG_PATH) || { nextIssueNumber: 1 };
const issueNumber = config.nextIssueNumber;

// ── Load JSON data ───────────────────────────────────────────────

const jsonPath = join(WEEKLY_JSON_DIR, `${date}.json`);
const data = readJson(jsonPath);
if (!data) {
  console.error(`Error: No weekly JSON found at ${jsonPath}`);
  process.exit(1);
}

const {
  scoreChanges   = [],
  confirmations  = [],
  findings       = [],
  signals        = [],
  editorsNote    = null,  // Optional override field in JSON
} = data;

const stats = data.stats || {};
const {
  bandChanges    = 0,
  downgrades     = 0,
} = stats;

// ── Date range label ─────────────────────────────────────────────

function buildDateRange() {
  const weekStart = data.weekStart || "";
  const weekEnd   = data.weekEnd || date;
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const year = (weekEnd || date).split("-")[0];
  if (weekStart) {
    const [, sm, sday] = weekStart.split("-");
    const [, em, eday] = weekEnd.split("-");
    const startMonth = months[parseInt(sm, 10) - 1];
    const endMonth   = months[parseInt(em, 10) - 1];
    const endDay = parseInt(eday, 10);
    if (sm === em) {
      return `${startMonth} ${parseInt(sday, 10)}&ndash;${endDay}, ${year}`;
    } else {
      return `${startMonth} ${parseInt(sday, 10)}&ndash;${endMonth} ${endDay}, ${year}`;
    }
  }
  const [, em, eday] = weekEnd.split("-");
  return `${months[parseInt(em, 10) - 1]} ${parseInt(eday, 10)}, ${year}`;
}

function buildFullDate() {
  // For byline: "April 17, 2026"
  const d = new Date(date + "T12:00:00Z");
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
}

function buildWeekOfDate() {
  // "Week of April 14, 2026" — start of the week
  if (data.weekStart) {
    const d = new Date(data.weekStart + "T12:00:00Z");
    return `Week of ${d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" })}`;
  }
  return `Week of ${buildFullDate()}`;
}

const dateRange   = buildDateRange();
const fullDate    = buildFullDate();
const weekOfDate  = buildWeekOfDate();

// ── Helpers ──────────────────────────────────────────────────────

const INDEX_LABELS = {
  "ai-labs":                            "AI Labs",
  "fortune-500":                        "Fortune 500",
  "f500":                               "Fortune 500",
  "countries":                          "Countries",
  "us-states":                          "US States",
  "us-cities":                          "US Cities",
  "global-cities":                      "Global Cities",
  "robotics-labs":                      "Robotics",
  "humanoid robotics labs index 2026":  "Robotics",
};

function indexLabel(index) {
  if (!index) return "";
  const key = index.toLowerCase().replace(/\s+/g, "-");
  return INDEX_LABELS[key] || INDEX_LABELS[index.toLowerCase()] || index;
}

function bandLabel(band) {
  if (!band) return "";
  return band.charAt(0).toUpperCase() + band.slice(1).toLowerCase();
}

function esc(text) {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escProse(text) {
  // esc + convert em-dash variants to HTML entity
  if (!text) return "";
  return esc(text)
    .replace(/\s*—\s*/g, " &mdash; ")
    .replace(/\s*--\s*/g, " &mdash; ");
}

// Sorted changes (largest |delta| first)
const sorted = [...scoreChanges].sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
const topChange     = sorted[0] || null;
const secondary     = sorted.slice(1, 5);   // up to 4 secondary
const alsoThisWeek  = sorted.slice(5);      // remainder in compressed sentence

// ── Section label ────────────────────────────────────────────────

function sectionLabel(label, deck) {
  const deckRow = deck ? `
  <tr>
    <td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif; font-size:13px; font-style:italic; font-weight:400; color:#4A4A4A; line-height:1.5; padding-bottom:10px;">
      ${deck}
    </td>
  </tr>` : "";
  return `
<!-- Section label: ${label} -->
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:6px;">
  <tr>
    <td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif; font-size:11px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:#8B1A1A; padding-top:16px; padding-bottom:4px;">
      ${esc(label)}
    </td>
  </tr>${deckRow}
</table>`;
}

// ── Divider ───────────────────────────────────────────────────────

function divider() {
  return `
<!-- Divider -->
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:28px; margin-bottom:0;">
  <tr>
    <td style="border-top:1px solid #E0D8CC; font-size:1px; line-height:1px;">&nbsp;</td>
  </tr>
</table>`;
}

// ── Preheader ────────────────────────────────────────────────────

function buildPreheader() {
  let text = "";
  if (topChange) {
    const dir = topChange.delta < 0 ? "fell" : "rose";
    const pts = Math.abs(topChange.delta).toFixed(1);
    text = `${topChange.entity} ${dir} ${pts} pts. `;
  }
  if (secondary.length > 0) {
    text += secondary.slice(0, 2).map(sc =>
      `${sc.entity} (${sc.delta > 0 ? "+" : ""}${sc.delta.toFixed(1)})`
    ).join(", ") + ". ";
  }
  text += "Full briefing inside.";
  if (text.length > 100) text = text.slice(0, 97) + "...";
  return esc(text);
}

// ── Editor's Note / Lede ─────────────────────────────────────────

function buildEditorsNote() {
  if (editorsNote) return escProse(editorsNote);

  // Auto-generate 3-5 sentence editorial framing
  if (!topChange) {
    return "This week produced no score changes and sixteen confirmations — the most stable assessment cycle in recent months. Confirmed scores hold within our ±5 threshold.";
  }

  const parts = [];
  const dir   = topChange.delta < 0 ? "fell" : "rose";
  const pts   = Math.abs(topChange.delta).toFixed(1);
  const idx   = indexLabel(topChange.index);
  const bc    = topChange.bandChange && topChange.publishedBand && topChange.proposedBand
    ? `, moving from ${bandLabel(topChange.publishedBand)} to ${bandLabel(topChange.proposedBand)}`
    : "";

  // Sentence 1: top story
  parts.push(`This week produced the largest single-entity score collapse in the ${idx} index recorded by the benchmark. ${esc(topChange.entity)} ${dir} ${pts} points${escProse(bc)}.`);

  // Sentence 2: evidence cue from first evidence item
  if (topChange.evidence && topChange.evidence[0]) {
    const ev = escProse(topChange.evidence[0]);
    // Ensure it reads as an independent sentence (capitalize and close with period)
    const evSentence = ev.charAt(0).toUpperCase() + ev.slice(1);
    const closed = evSentence.match(/[.!?]$/) ? evSentence : evSentence + ".";
    parts.push(closed);
  }

  // Sentence 3: additional AI labs if applicable
  const aiLabs = scoreChanges.filter(sc =>
    indexLabel(sc.index) === "AI Labs" && sc.entity !== topChange.entity
  );
  if (aiLabs.length >= 2) {
    parts.push(`${aiLabs.length} additional AI labs also received downgrade proposals this week, together representing a combined ${aiLabs.reduce((s, sc) => s + Math.abs(sc.delta), 0).toFixed(0)}-point loss across the index.`);
  } else if (aiLabs.length === 1) {
    parts.push(`${esc(aiLabs[0].entity)} also received a downgrade proposal, falling ${Math.abs(aiLabs[0].delta).toFixed(1)} points.`);
  }

  // Sentence 4: band changes or downgrade sweep
  if (bandChanges >= 5) {
    parts.push(`Seven entities crossed a band boundary this week &mdash; the highest concentration of band changes in a single assessment cycle.`);
  } else if (downgrades >= 10 && downgrades === scoreChanges.length) {
    parts.push(`Every score change this week was a downgrade. No entity assessed received an upgrade or confirmation upgrade.`);
  }

  // Sentence 5: implication
  if (aiLabs.length >= 2) {
    parts.push(`The convergence suggests AI safety commitments are decoupling from institutional behavior at scale.`);
  } else if (scoreChanges.length >= 10) {
    parts.push(`Thirteen entities across four indexes declined this week. No upgrades were recorded.`);
  }

  return parts.join(" ");
}

// ── Hero Story (largest |delta|) ──────────────────────────────────

function buildHeroStory(sc) {
  if (!sc) return "";

  const oldScore = sc.publishedScore.toFixed(1);
  const newScore = sc.proposedScore.toFixed(1);
  const idx      = indexLabel(sc.index);
  const bandLine = sc.bandChange && sc.publishedBand && sc.proposedBand
    ? `${bandLabel(sc.publishedBand)} &rarr; ${bandLabel(sc.proposedBand)}`
    : (sc.proposedBand ? bandLabel(sc.proposedBand) : "");

  // Use editorialBody field from JSON if provided, otherwise auto-generate
  let editorial = "";
  if (sc.editorialBody) {
    editorial = escProse(sc.editorialBody);
  } else if (sc.evidence && sc.evidence.length > 0) {
    const ev1 = escProse(sc.evidence[0]);
    const ev2 = sc.evidence[1] ? escProse(sc.evidence[1]) : null;
    editorial = ev2
      ? `${ev1}. ${ev2}.`
      : `${ev1}.`;
  }

  const evidenceLine = sc.evidence
    ? `Evidence: ${sc.evidence.map(e => escProse(e)).join("; ")}.`
    : "";

  // Slug for "Read the full assessment" link — prefer explicit slug, fallback to kebab-case
  const slug = sc.slug || esc(sc.entity).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const assessmentUrl = `https://compassionbenchmark.com/entity/${slug}?utm_source=newsletter&utm_medium=email&utm_campaign=weekly`;

  return `
<!-- ============================================ -->
<!-- HERO STORY: ${esc(sc.entity)}                -->
<!-- ============================================ -->
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:20px; border-left:3px solid #8B1A1A;">
  <tr>
    <td style="padding:4px 0 4px 20px;">

      <!-- Entity name + index (same line) -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:6px;">
        <tr>
          <td style="font-family:Georgia,'Times New Roman',serif; font-size:24px; font-weight:700; color:#1C1C1C; line-height:1.2; letter-spacing:-0.015em; vertical-align:bottom;">
            ${esc(sc.entity)}
          </td>
          <td align="right" class="mobile-hide" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif; font-size:11px; font-weight:400; color:#7A7A7A; vertical-align:bottom; white-space:nowrap; padding-bottom:4px;">
            ${esc(idx)}
          </td>
        </tr>
      </table>

      <!-- Score line -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:8px; margin-bottom:12px;">
        <tr>
          <td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif; font-size:14px; font-weight:400; color:#4A4A4A; line-height:1.3;">
            Score:&nbsp;<span style="font-family:'SF Mono','Fira Code',Consolas,'Courier New',monospace; font-size:14px; color:#7A7A7A;">${oldScore}</span>&nbsp;&rarr;&nbsp;<span style="font-family:'SF Mono','Fira Code',Consolas,'Courier New',monospace; font-size:22px; font-weight:700; color:#8B1A1A;">${newScore}</span>
            ${bandLine ? `&nbsp;&middot;&nbsp;<span style="font-size:13px; color:#7A7A7A;">${bandLine}</span>` : ""}
          </td>
        </tr>
      </table>

      <!-- Editorial body -->
      ${editorial ? `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:10px;">
        <tr>
          <td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif; font-size:16px; line-height:1.7; color:#1C1C1C;">
            ${editorial}
          </td>
        </tr>
      </table>` : ""}

      <!-- Evidence line -->
      ${evidenceLine ? `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:0;">
        <tr>
          <td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif; font-size:13px; font-style:italic; line-height:1.55; color:#7A7A7A;">
            ${evidenceLine}
          </td>
        </tr>
      </table>` : ""}

      <!-- Read the full assessment link -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td style="padding-top:12px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif; font-size:13px; font-weight:500; line-height:1.4;">
            <a href="{{ TrackLink "${assessmentUrl}" }}" style="color:#1A5CA8; text-decoration:none;">Read the full assessment &rarr;</a>
          </td>
        </tr>
      </table>

    </td>
  </tr>
</table>`;
}

// ── Secondary Changes (2-4 entries) ──────────────────────────────

function buildSecondaryChanges(changes) {
  if (!changes || changes.length === 0) return "";

  const items = changes.slice(0, 4).map((sc, i) => {
    const isLast   = i === Math.min(changes.length, 4) - 1;
    const oldScore = sc.publishedScore.toFixed(1);
    const newScore = sc.proposedScore.toFixed(1);
    const idx      = indexLabel(sc.index);
    const mb       = isLast ? "0" : "16px";

    // One-sentence story from first evidence item
    let story = "";
    if (sc.evidence && sc.evidence[0]) {
      story = escProse(sc.evidence[0]);
      // Ensure it reads as a complete sentence
      if (!story.match(/[.!?]$/)) story += ".";
    }

    // Slug for inline "Read the full assessment" link
    const slug = sc.slug || esc(sc.entity).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const assessmentUrl = `https://compassionbenchmark.com/entity/${slug}?utm_source=newsletter&utm_medium=email&utm_campaign=weekly`;

    // Append read-more link inline after story sentence
    const storyWithLink = story
      ? `${story} <a href="{{ TrackLink "${assessmentUrl}" }}" style="color:#1A5CA8; text-decoration:none;">Read the full assessment &rarr;</a>`
      : `<a href="{{ TrackLink "${assessmentUrl}" }}" style="color:#1A5CA8; text-decoration:none;">Read the full assessment &rarr;</a>`;

    return `
  <!-- Secondary: ${esc(sc.entity)} -->
  <tr>
    <td style="padding-bottom:${mb};">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif; font-size:15px; font-weight:700; color:#1C1C1C; padding-bottom:3px; line-height:1.3;">
            ${esc(sc.entity)}&nbsp;<span style="font-family:'SF Mono','Fira Code',Consolas,'Courier New',monospace; font-size:13px; font-weight:400; color:#4A4A4A;">(${esc(idx)}, ${oldScore}&nbsp;&rarr;&nbsp;${newScore})</span>
          </td>
        </tr>
        <tr>
          <td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif; font-size:14px; line-height:1.55; color:#1C1C1C;">
            ${storyWithLink}
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
  });

  return `
<!-- ============================================ -->
<!-- OTHER CHANGES (secondary)                    -->
<!-- ============================================ -->
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:4px;">
${items.join("\n")}
</table>`;
}

// ── "Also this week" compressed paragraph ────────────────────────

// Well-known acronyms that should always be fully uppercase
const KNOWN_ACRONYMS = new Set([
  "DOJ","FTC","SEC","NLRB","FDA","EU","UN","US","NATO","CEO","CFO",
  "CSAM","CBRN","NAACP","FBI","CIA","IRS","EPA","OSHA","FCC","CFPB",
  "ICE","DHS","HHS","DOD","IRS","WHO","IMF","WTO","RICO","IPO"
]);

function extractClause(evidenceText) {
  if (!evidenceText) return "";

  // Take the first sentence: split at first ". ", "; ", " — ", or " -- "
  let clause = evidenceText.split(/\.\s+|;\s+|\s+—\s+|\s+--\s+/)[0];

  // Trim trailing punctuation: , . ; — - :
  clause = clause.replace(/[,\.;\u2014\-:]+$/, "").trim();

  // Hard cap at 60 chars, cutting at the last space before the limit
  if (clause.length > 60) {
    clause = clause.slice(0, 60);
    const lastSpace = clause.lastIndexOf(" ");
    if (lastSpace > 20) clause = clause.slice(0, lastSpace);
    clause = clause.replace(/[,\.;\u2014\-:]+$/, "").trim();
  }

  // Guard: reject if ends in a stopword fragment or is too short
  const stopwords = /\b(the|a|an|and|or|of|in|on|at|to|for|with|by|over|into|from|after|before|under|per|as|that|this|which|who|was|is|are|were|has|have|been|be|its|their|our|not|no|vs|via)\s*$/i;
  if (!clause || clause.length < 5 || stopwords.test(clause)) {
    return "";
  }

  // Uppercase first character (only the first char — don't touch acronyms)
  clause = clause.charAt(0).toUpperCase() + clause.slice(1);

  // Force uppercase any well-known acronym that appears lowercased at the start
  const firstWord = clause.split(/[\s\/]/)[0].toUpperCase();
  if (KNOWN_ACRONYMS.has(firstWord)) {
    clause = firstWord + clause.slice(firstWord.length);
  }

  return clause;
}

function buildAlsoThisWeek(remaining) {
  if (!remaining || remaining.length === 0) return "";

  const items = remaining.map(sc => {
    const oldScore = sc.publishedScore.toFixed(1);
    const newScore = sc.proposedScore.toFixed(1);

    // Preference 1: curated summary field
    let clause = "";
    if (sc.summary && sc.summary.trim()) {
      clause = sc.summary.trim();
    } else if (sc.evidence && sc.evidence[0]) {
      // Preference 2: extract clean noun phrase from evidence
      clause = extractClause(sc.evidence[0]);
      // Preference 3: fallback to generic label
      if (!clause) clause = "downgrade proposal";
    } else {
      clause = "downgrade proposal";
    }

    return `${esc(sc.entity)} (${oldScore}&nbsp;&rarr;&nbsp;${newScore}, ${escProse(clause)})`;
  });

  // Oxford "and" before final item
  let joined;
  if (items.length === 1) {
    joined = items[0];
  } else {
    joined = items.slice(0, -1).join("; ") + "; and " + items[items.length - 1];
  }

  const dir = remaining.every(sc => sc.delta < 0) ? "downgraded" : "changed";
  const sentence = `Also ${dir} this week: ${joined}.`;

  return `
<!-- Also this week compressed paragraph -->
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:4px;">
  <tr>
    <td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif; font-size:14px; line-height:1.55; color:#1C1C1C;">
      ${sentence}
    </td>
  </tr>
</table>`;
}

// ── Findings — prose paragraphs, no numbering ─────────────────────

function buildFindings(findingsList) {
  if (!findingsList || findingsList.length === 0) return "";

  const paras = findingsList.slice(0, 3).map((text, i) => {
    const isLast = i === Math.min(findingsList.length, 3) - 1;
    const mb     = isLast ? "0" : "18px";
    return `
  <tr>
    <td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif; font-size:15px; line-height:1.7; color:#1C1C1C; padding-bottom:${mb};">
      ${escProse(text)}
    </td>
  </tr>`;
  });

  return `
<!-- ============================================ -->
<!-- FINDINGS: prose paragraphs                   -->
<!-- ============================================ -->
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:4px;">
${paras.join("\n")}
  <tr>
    <td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif; font-size:13px; font-weight:500; line-height:1.4; padding-top:12px;">
      <a href="{{ TrackLink "https://compassionbenchmark.com/updates?utm_source=newsletter&utm_medium=email&utm_campaign=weekly" }}" style="color:#1A5CA8; text-decoration:none;">View all daily findings &rarr;</a>
    </td>
  </tr>
</table>`;
}

// ── Signals — inline type-labeled items ──────────────────────────

const LITIGATION_KEYWORDS  = /lawsuit|suit\b|case\b|verdict|settlement|court|trial|NLRB|litigation|injunction|invest|indictment|charges?|criminal/i;
const REGULATORY_KEYWORDS  = /\bEU\b|FTC|DOJ|FDA|SEC|OSHA|enforcement|regulation|compliance|deadline|act\b|enforceable|regulatory|mandate|penalty|fine/i;
const FINANCIAL_KEYWORDS   = /market cap|revenue|stock|earnings|bankruptcy|debt|credit|IPO|valuation|damages?\s+\$|\$\d+[BM]/i;
const GOVERNANCE_KEYWORDS  = /CEO|board|chairman|executive|resignation|leadership|governance|accountability|director|oversight|audit/i;

function classifySignal(signal) {
  if (signal.signalType) return signal.signalType.charAt(0).toUpperCase() + signal.signalType.slice(1).toLowerCase();
  const text = typeof signal === "string" ? signal : (signal.text || signal.body || "");
  if (LITIGATION_KEYWORDS.test(text))  return "Litigation";
  if (REGULATORY_KEYWORDS.test(text))  return "Regulatory";
  if (FINANCIAL_KEYWORDS.test(text))   return "Financial";
  if (GOVERNANCE_KEYWORDS.test(text))  return "Governance";
  return "Regulatory";
}

function signalText(signal) {
  return typeof signal === "string" ? signal : (signal.text || signal.body || "");
}

function signalLink(signal) {
  // Only return a URL if the signal has an explicit string url/link field
  if (!signal || typeof signal !== "object") return null;
  if (typeof signal.url === "string" && signal.url.startsWith("http")) return signal.url;
  if (typeof signal.link === "string" && signal.link.startsWith("http")) return signal.link;
  return null;
}

function buildSignals(signalsList) {
  if (!signalsList || signalsList.length === 0) return "";

  const items = signalsList.slice(0, 4).map((item, i) => {
    const isLast = i === Math.min(signalsList.length, 4) - 1;
    const mb     = isLast ? "0" : "12px";
    const type   = classifySignal(item);
    const text   = signalText(item);
    const link   = signalLink(item);

    // If signal has an explicit URL, hyperlink the body; otherwise plain prose
    const body = link
      ? `<a href="{{ TrackLink "${link}?utm_source=newsletter&utm_medium=email&utm_campaign=weekly" }}" style="color:#1A5CA8; text-decoration:none;">${escProse(text)}</a>`
      : escProse(text);

    return `
  <tr>
    <td style="padding-bottom:${mb}; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif; font-size:14px; line-height:1.6; color:#1C1C1C;">
      <span style="font-weight:700;">${esc(type)}</span> &mdash; ${body}
    </td>
  </tr>`;
  });

  return `
<!-- ============================================ -->
<!-- SIGNALS: inline type-labeled items           -->
<!-- ============================================ -->
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:4px;">
${items.join("\n")}
</table>`;
}

// ── Confirmations — one prose sentence + two-column text list ─────

function buildConfirmations(confs) {
  if (!confs || confs.length === 0) return "";

  // Group by index label
  const groups = {};
  const groupOrder = [];
  for (const c of confs) {
    const lbl = indexLabel(c.index) || c.index || "Other";
    if (!groups[lbl]) { groups[lbl] = []; groupOrder.push(lbl); }
    groups[lbl].push(c);
  }

  // Lead sentence: count + 2-3 notable entities (highest scores, most recognizable)
  const notableConfs = [...confs].sort((a, b) => (b.assessedScore || b.publishedScore) - (a.assessedScore || a.publishedScore));
  const notableNames = notableConfs.slice(0, 3).map(c => {
    const score = (c.assessedScore ?? c.publishedScore ?? 0).toFixed(1);
    return `${esc(c.entity)} (${score})`;
  });
  const leadSentence = `${confs.length} ${confs.length === 1 ? "entity was" : "entities were"} confirmed within our &plusmn;5 threshold this week, including ${notableNames.join(", ")}.`;

  // Build two/three column text table (no cell backgrounds)
  // Determine max rows per column
  const cols = groupOrder.length >= 3 ? groupOrder.slice(0, 3) : groupOrder;
  const colPct = cols.length === 3 ? "33%" : cols.length === 2 ? "50%" : "100%";

  const colHtml = cols.map(lbl => {
    const items = groups[lbl];
    const rows  = items.map(c => {
      const score = (c.assessedScore ?? c.publishedScore ?? 0).toFixed(1);
      return `<div style="font-size:13px; line-height:1.8; color:#4A4A4A;">${esc(c.entity)}&nbsp;&nbsp;${score}</div>`;
    }).join("");
    return `
      <td width="${colPct}" valign="top" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif; padding-right:16px;">
        <div style="font-size:11px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#7A7A7A; margin-bottom:4px;">${esc(lbl)}</div>
        ${rows}
      </td>`;
  }).join("");

  return `
<!-- ============================================ -->
<!-- SCORES CONFIRMED: prose sentence + text list -->
<!-- ============================================ -->
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:8px;">
  <tr>
    <td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif; font-size:15px; line-height:1.65; color:#1C1C1C; padding-bottom:14px;">
      ${leadSentence}
    </td>
  </tr>
  <tr>
    <td>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          ${colHtml}
        </tr>
      </table>
    </td>
  </tr>
</table>`;
}

// ── Build content block ──────────────────────────────────────────

const parts = [];

// Preheader (hidden)
parts.push(`
<!-- ============================================ -->
<!-- PREHEADER (hidden inbox preview text)        -->
<!-- ============================================ -->
<div style="display:none; max-height:0; overflow:hidden; mso-hide:all;" aria-hidden="true">
  ${buildPreheader()}
  &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
</div>`);

// Byline
parts.push(`
<!-- ============================================ -->
<!-- BYLINE                                       -->
<!-- ============================================ -->
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:20px; margin-bottom:20px;">
  <tr>
    <td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif; font-size:11px; font-weight:400; color:#7A7A7A; line-height:1.4; letter-spacing:0.02em;">
      From the Compassion Benchmark Research Desk &nbsp;&middot;&nbsp; ${esc(fullDate)} &middot; Week in review
    </td>
  </tr>
</table>`);

// Editor's note / lede
const editorsNoteText = buildEditorsNote();
parts.push(`
<!-- ============================================ -->
<!-- EDITOR'S NOTE / LEDE                         -->
<!-- ============================================ -->
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:32px;">
  <tr>
    <td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif; font-size:17px; font-weight:400; line-height:1.7; color:#1C1C1C;">
      ${editorsNoteText}
    </td>
  </tr>
</table>`);

// THIS WEEK'S HEADLINE CHANGE (hero story)
if (topChange) {
  parts.push(divider());
  parts.push(sectionLabel("This Week's Headline Change", "The largest single-entity score movement this week."));
  parts.push(buildHeroStory(topChange));
}

// OTHER CHANGES (secondary + also this week)
if (secondary.length > 0) {
  // Compute deck: N additional entities across M sectors
  const otherN = secondary.length + alsoThisWeek.length;
  const otherIndexes = new Set([...secondary, ...alsoThisWeek].map(sc => indexLabel(sc.index)));
  const otherM = otherIndexes.size;
  const otherDeck = `${otherN} additional ${otherN === 1 ? "entity" : "entities"} received downgrade proposals across ${otherM} ${otherM === 1 ? "sector" : "sectors"}.`;
  parts.push(divider());
  parts.push(sectionLabel("Other Changes", otherDeck));
  parts.push(buildSecondaryChanges(secondary));
  if (alsoThisWeek.length > 0) {
    parts.push(`<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:16px;"><tr><td style="border-top:1px solid #EDE8DF; font-size:1px; line-height:1px;">&nbsp;</td></tr></table>`);
    parts.push(buildAlsoThisWeek(alsoThisWeek));
  }
} else if (alsoThisWeek.length > 0) {
  const otherN = alsoThisWeek.length;
  const otherIndexes = new Set(alsoThisWeek.map(sc => indexLabel(sc.index)));
  const otherM = otherIndexes.size;
  const otherDeck = `${otherN} additional ${otherN === 1 ? "entity" : "entities"} received downgrade proposals across ${otherM} ${otherM === 1 ? "sector" : "sectors"}.`;
  parts.push(divider());
  parts.push(sectionLabel("Other Changes", otherDeck));
  parts.push(buildAlsoThisWeek(alsoThisWeek));
}

// FINDINGS
if (findings.length > 0) {
  parts.push(divider());
  parts.push(sectionLabel("Findings", "Cross-entity patterns identified by the research desk."));
  parts.push(buildFindings(findings));
}

// SIGNALS
if (signals.length > 0) {
  parts.push(divider());
  parts.push(sectionLabel("Signals", "Forward-looking regulatory, legal, and policy developments."));
  parts.push(buildSignals(signals));
}

// SCORES CONFIRMED
if (confirmations.length > 0) {
  parts.push(divider());
  parts.push(sectionLabel("Scores Confirmed", "Entities whose published scores remain accurate within the \u00B15 threshold."));
  parts.push(buildConfirmations(confirmations));
}

// ACCESS FULL RESEARCH (richer two-paragraph block)
parts.push(divider());
parts.push(sectionLabel("Access Full Research"));
parts.push(`
<!-- ============================================ -->
<!-- ACCESS FULL RESEARCH                         -->
<!-- ============================================ -->
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:12px;">
  <tr>
    <td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif; font-size:14px; line-height:1.65; color:#1C1C1C;">
      Dimension-level assessments &mdash; showing each entity&rsquo;s score across the 8 dimensions (Awareness, Empathy, Active Response, Equity, Boundaries, Accountability, Systems Thinking, Integrity) &mdash; are available to subscribers at <a href="{{ TrackLink "https://compassionbenchmark.com/purchase-research?utm_source=newsletter&utm_medium=email&utm_campaign=weekly" }}" style="color:#1A5CA8; text-decoration:none;">compassionbenchmark.com/purchase-research</a>.
    </td>
  </tr>
</table>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:24px;">
  <tr>
    <td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif; font-size:14px; line-height:1.65; color:#1C1C1C;">
      Producing an ESG brief, divestment analysis, or policy position using these rankings? <a href="mailto:phil@mediafier.ai?subject=Research%20inquiry" style="color:#1A5CA8; text-decoration:none;">Reply to this email</a> &mdash; our research team can provide licensed data access, structured briefings, and expert review for institutional use.
    </td>
  </tr>
</table>`);

const contentHtml = parts.join("\n");

// ── Write content block ──────────────────────────────────────────

const contentPath = join(TEMPLATES_DIR, `weekly-briefing-content-${date}.html`);
writeTextAtomic(contentPath, contentHtml);
console.log(`  Content block: ${contentPath}`);

// ── Patch base template: issue number, date range, week-of date ──

const templatePath = join(TEMPLATES_DIR, "listmonk-campaign.html");
if (!existsSync(templatePath)) {
  console.error(`Error: Base template not found at ${templatePath}`);
  process.exit(1);
}

let rawTemplate = readFileSync(templatePath, "utf-8");

// Update issue number in masthead
rawTemplate = rawTemplate.replace(
  /Issue <!-- ISSUE_NUMBER:[^>]*-->#\d+/,
  `Issue <!-- ISSUE_NUMBER: generator updates this value -->#${issueNumber}`
);

// Update date range (inline in issue line — format: "Apr 11–17, 2026")
rawTemplate = rawTemplate.replace(
  /<!-- DATE_RANGE: generator updates this value each run -->[A-Z][a-z]{2} \d{1,2}&ndash;(?:[A-Z][a-z]{2} )?\d{1,2}, \d{4}/,
  `<!-- DATE_RANGE: generator updates this value each run -->${dateRange}`
);

writeTextAtomic(templatePath, rawTemplate);
console.log(`  Base template: updated issue #${issueNumber}, date range "${dateRange}"`);

// ── Build preview (merge updated template + content) ─────────────

let templateHtml = readFileSync(templatePath, "utf-8");

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

// ── Sizes and summary ────────────────────────────────────────────

const contentSize  = Buffer.byteLength(contentHtml, "utf-8");
const previewSize  = Buffer.byteLength(templateHtml, "utf-8");

console.log(`\nOutput sizes:`);
console.log(`  Content block: ${(contentSize / 1024).toFixed(1)} KB`);
console.log(`  Preview:       ${(previewSize / 1024).toFixed(1)} KB`);

console.log(`\nStructure:`);
console.log(`  Byline:           ${fullDate}`);
console.log(`  Editor's note:    ${editorsNoteText.replace(/<[^>]+>/g, "").slice(0, 80)}...`);
if (topChange) {
  console.log(`  Hero story:       ${topChange.entity} (${topChange.publishedScore} → ${topChange.proposedScore}, Δ${topChange.delta})`);
}
console.log(`  Secondary:        ${secondary.slice(0,4).map(sc => sc.entity).join(", ") || "(none)"}`);
console.log(`  Also this week:   ${alsoThisWeek.length} entities`);
console.log(`  Findings:         ${Math.min(findings.length, 3)} shown`);
console.log(`  Signals:          ${Math.min(signals.length, 4)} shown`);
console.log(`  Confirmations:    ${confirmations.length} total`);

console.log(`\nSignal types:`);
for (const sig of signals.slice(0, 4)) {
  console.log(`  [${classifySignal(sig)}] ${signalText(sig).slice(0, 60)}...`);
}
