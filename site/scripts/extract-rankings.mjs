/**
 * extract-rankings.mjs
 *
 * Parses legacy HTML ranking pages into structured JSON files.
 * Uses only built-in Node.js modules (no cheerio dependency).
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { resolve } from "path";

const LEGACY_DIR = resolve("../legacy-html");
const OUT_DIR = resolve("src/data/indexes");
mkdirSync(OUT_DIR, { recursive: true });

const DIMS = ["AWR", "EMP", "ACT", "EQU", "BND", "ACC", "SYS", "INT"];

// ── Helpers ──────────────────────────────────────────────────────────────────

function readHtml(filename) {
  return readFileSync(resolve(LEGACY_DIR, filename), "utf8");
}

/** Extract text content from an HTML snippet, stripping tags */
function stripTags(s) {
  return s.replace(/<[^>]*>/g, "").trim();
}

/** Parse the mini-table band distribution */
function parseBands(html) {
  const bands = [];
  const miniMatch = html.match(/<table class="mini-table">([\s\S]*?)<\/table>/);
  if (!miniMatch) return bands;
  const tbody = miniMatch[1];
  const rowRe = /<tr>([\s\S]*?)<\/tr>/g;
  let m;
  while ((m = rowRe.exec(tbody)) !== null) {
    const cells = [];
    const tdRe = /<td[^>]*>([\s\S]*?)<\/td>/g;
    let td;
    while ((td = tdRe.exec(m[1])) !== null) cells.push(stripTags(td[1]));
    if (cells.length < 3) continue;
    const bandName = cells[0];
    if (["Exemplary", "Established", "Functional", "Developing", "Critical"].includes(bandName)) {
      bands.push({
        name: bandName,
        range: cells[1].replace(/\u2013/g, "-"),
        count: parseInt(cells[2], 10),
        pct: cells[3] || undefined,
      });
    }
  }
  return bands;
}

/** Extract mean and median from hero stats */
function parseStats(html) {
  let mean = null, median = null;
  const meanM = html.match(/<strong>([\d.]+)<\/strong><span>Mean score<\/span>/);
  if (meanM) mean = parseFloat(meanM[1]);
  const medM = html.match(/<strong>([\d.]+)<\/strong><span>Median score<\/span>/);
  if (medM) median = parseFloat(medM[1]);
  return { mean, median };
}

/** Extract title from <title> tag */
function parseTitle(html) {
  const m = html.match(/<title>(.*?)<\/title>/);
  return m ? m[1].replace(/\s*\|.*$/, "").trim() : "Unknown";
}

/**
 * Parse the full rankings table (#rankTable) from HTML <tr> rows.
 * Works even when the entire HTML is on a single line.
 */
function parseRankTable(html, columnDefs) {
  const rankings = [];

  // Find the rankTable - use id attribute to locate it
  const tableStart = html.indexOf('id="rankTable"');
  if (tableStart === -1) return rankings;

  // Find <tbody> after the table start
  const tbodyStart = html.indexOf("<tbody>", tableStart);
  if (tbodyStart === -1) return rankings;
  const tbodyEnd = html.indexOf("</tbody>", tbodyStart);
  if (tbodyEnd === -1) return rankings;

  const tbody = html.substring(tbodyStart + 7, tbodyEnd);

  // Match all <tr> elements (handles both <tr> and <tr data-...>)
  const rowRe = /<tr[^>]*>([\s\S]*?)<\/tr>/g;
  let m;
  while ((m = rowRe.exec(tbody)) !== null) {
    const cells = [];
    const tdRe = /<td[^>]*>([\s\S]*?)<\/td>/g;
    let td;
    while ((td = tdRe.exec(m[1])) !== null) cells.push(stripTags(td[1]));
    if (cells.length < columnDefs.length) continue;

    const entry = {};
    const scores = {};
    for (let i = 0; i < columnDefs.length; i++) {
      const { key, type } = columnDefs[i];
      const val = cells[i];
      if (key === "_dim") {
        scores[type] = parseFloat(val);
      } else if (type === "int") {
        entry[key] = parseInt(val, 10);
      } else if (type === "float") {
        entry[key] = parseFloat(val);
      } else if (type === "band") {
        entry[key] = val.toLowerCase();
      } else {
        entry[key] = val;
      }
    }
    if (Object.keys(scores).length > 0) entry.scores = scores;
    rankings.push(entry);
  }
  return rankings;
}

/**
 * Parse JS-embedded array data from inline <script>.
 * Handles both `const allRows = [...]` and `const companies = [...]`.
 * Handles both quoted keys (JSON) and unquoted keys (JS object literals).
 */
function parseJsArray(html, varName = "allRows") {
  // Build regex for the specific variable name
  // Match: const varName = [...]; where the array may span multiple lines
  const re = new RegExp(`const\\s+${varName}\\s*=\\s*(\\[)`);
  const startMatch = re.exec(html);
  if (!startMatch) return [];

  // Find the matching closing bracket by counting brackets
  const startIdx = startMatch.index + startMatch[0].length - 1; // position of opening [
  let depth = 0;
  let endIdx = -1;
  for (let i = startIdx; i < html.length; i++) {
    if (html[i] === "[") depth++;
    else if (html[i] === "]") {
      depth--;
      if (depth === 0) { endIdx = i; break; }
    }
  }
  if (endIdx === -1) return [];

  let raw = html.substring(startIdx, endIdx + 1);

  // Try parsing as JSON first (quoted keys)
  try {
    return JSON.parse(raw);
  } catch (_) {
    // Fall back: quote unquoted keys for JS object literals
    // Match word characters before colons that aren't inside quotes
    raw = raw.replace(/([{,])\s*(\w+)\s*:/g, '$1"$2":');
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error(`  Failed to parse ${varName} as JSON:`, e.message.substring(0, 100));
      // Last resort: use Function constructor
      try {
        const original = html.substring(startIdx, endIdx + 1);
        return new Function("return " + original)();
      } catch (e2) {
        console.error(`  Eval fallback also failed:`, e2.message.substring(0, 100));
        return [];
      }
    }
  }
}

function buildOutput(title, entityCount, mean, median, bands, rankings) {
  return {
    meta: {
      title,
      year: 2026,
      entityCount,
      meanScore: mean,
      medianScore: median,
      dimensions: [...DIMS],
    },
    bands,
    rankings,
  };
}

function writeJson(filename, data) {
  const path = resolve(OUT_DIR, filename);
  writeFileSync(path, JSON.stringify(data, null, 2), "utf8");
  console.log(`  -> ${filename}: ${data.rankings.length} entities`);
}

// ── 1. Fortune 500 ──────────────────────────────────────────────────────────

function extractFortune500() {
  console.log("Processing fortune-500.html...");
  const html = readHtml("fortune-500.html");
  const title = parseTitle(html);
  const { mean, median } = parseStats(html);
  const bands = parseBands(html);

  const colDefs = [
    { key: "rank", type: "int" },
    { key: "f500Rank", type: "int" },
    { key: "name", type: "str" },
    { key: "sector", type: "str" },
    ...DIMS.map(d => ({ key: "_dim", type: d })),
    { key: "composite", type: "float" },
    { key: "band", type: "band" },
  ];

  const rankings = parseRankTable(html, colDefs);
  const data = buildOutput(title, rankings.length, mean, median, bands, rankings);
  writeJson("fortune-500.json", data);
}

// ── 2. US States ────────────────────────────────────────────────────────────

function extractUsStates() {
  console.log("Processing us-states.html...");
  const html = readHtml("us-states.html");
  const title = "United States Index 2026";
  const { mean, median } = parseStats(html);
  const bands = parseBands(html);

  const colDefs = [
    { key: "rank", type: "int" },
    { key: "name", type: "str" },
    { key: "region", type: "str" },
    ...DIMS.map(d => ({ key: "_dim", type: d })),
    { key: "composite", type: "float" },
    { key: "band", type: "band" },
  ];

  const rankings = parseRankTable(html, colDefs);
  const data = buildOutput(title, rankings.length, mean, median, bands, rankings);
  writeJson("us-states.json", data);
}

// ── 3. Countries ────────────────────────────────────────────────────────────

function extractCountries() {
  console.log("Processing countries-index.html...");
  const html = readHtml("countries-index.html");
  const title = parseTitle(html);
  const { mean, median } = parseStats(html);
  const bands = parseBands(html);

  const rows = parseJsArray(html, "allRows");
  const rankings = rows.map(r => ({
    rank: r.rank,
    name: r.country,
    region: r.region,
    scores: {
      AWR: parseFloat(r.awr),
      EMP: parseFloat(r.emp),
      ACT: parseFloat(r.act),
      EQU: parseFloat(r.equ),
      BND: parseFloat(r.bnd),
      ACC: parseFloat(r.acc),
      SYS: parseFloat(r.sys),
      INT: parseFloat(r.int),
    },
    composite: parseFloat(r.score),
    band: (r.band || "").toLowerCase(),
  }));

  const data = buildOutput(title, rankings.length, mean, median, bands, rankings);
  writeJson("countries.json", data);
}

// ── 4. AI Labs ──────────────────────────────────────────────────────────────

function extractAiLabs() {
  console.log("Processing top-50-ai-labs.html...");
  const html = readHtml("top-50-ai-labs.html");
  const title = parseTitle(html);
  const { mean, median } = parseStats(html);
  const bands = parseBands(html);

  // AI labs data is in `const companies = [...]` (JSON format with quoted keys)
  const rows = parseJsArray(html, "companies");
  const rankings = rows.map(r => ({
    rank: r.rank,
    name: r.company,
    hq: r.hq,
    sector: r.sector,
    scores: {
      AWR: parseFloat(r.awr),
      EMP: parseFloat(r.emp),
      ACT: parseFloat(r.act),
      EQU: parseFloat(r.equ),
      BND: parseFloat(r.bnd),
      ACC: parseFloat(r.acc),
      SYS: parseFloat(r.sys),
      INT: parseFloat(r.int),
    },
    composite: parseFloat(r.score),
    band: (r.band || "").toLowerCase(),
  }));

  const data = buildOutput(title, rankings.length, mean, median, bands, rankings);
  writeJson("ai-labs.json", data);
}

// ── 5. Robotics ─────────────────────────────────────────────────────────────

function extractRobotics() {
  console.log("Processing top-50-robotics-companies.html...");
  const html = readHtml("top-50-robotics-companies.html");
  const title = parseTitle(html);
  const { mean, median } = parseStats(html);
  const bands = parseBands(html);

  const colDefs = [
    { key: "rank", type: "int" },
    { key: "name", type: "str" },
    { key: "country", type: "str" },
    { key: "category", type: "str" },
    ...DIMS.map(d => ({ key: "_dim", type: d })),
    { key: "composite", type: "float" },
    { key: "band", type: "band" },
  ];

  const rankings = parseRankTable(html, colDefs);
  const data = buildOutput(title, rankings.length, mean, median, bands, rankings);
  writeJson("robotics-labs.json", data);
}

// ── 6. US Cities ────────────────────────────────────────────────────────────

function extractUsCities() {
  console.log("Processing top-150-us-cities.html...");
  const html = readHtml("top-150-us-cities.html");
  const title = parseTitle(html);
  const { mean, median } = parseStats(html);
  const bands = parseBands(html);

  const rows = parseJsArray(html, "allRows");
  let rankings;
  if (rows.length > 0) {
    rankings = rows.map(r => ({
      rank: r.rank,
      name: r.city,
      state: r.state || r.st,
      region: r.region,
      scores: {
        AWR: parseFloat(r.awr),
        EMP: parseFloat(r.emp),
        ACT: parseFloat(r.act),
        EQU: parseFloat(r.equ),
        BND: parseFloat(r.bnd),
        ACC: parseFloat(r.acc),
        SYS: parseFloat(r.sys),
        INT: parseFloat(r.int),
      },
      composite: parseFloat(r.score),
      band: (r.band || "").toLowerCase(),
    }));
  } else {
    const colDefs = [
      { key: "rank", type: "int" },
      { key: "name", type: "str" },
      { key: "state", type: "str" },
      { key: "region", type: "str" },
      ...DIMS.map(d => ({ key: "_dim", type: d })),
      { key: "composite", type: "float" },
      { key: "band", type: "band" },
    ];
    rankings = parseRankTable(html, colDefs);
  }

  const data = buildOutput(title, rankings.length, mean, median, bands, rankings);
  writeJson("us-cities.json", data);
}

// ── 7. Global Cities ────────────────────────────────────────────────────────

function extractGlobalCities() {
  console.log("Processing top-250-global-cities.html...");
  const html = readHtml("top-250-global-cities.html");
  const title = parseTitle(html);
  const { mean, median } = parseStats(html);
  const bands = parseBands(html);

  const rows = parseJsArray(html, "allRows");
  let rankings;
  if (rows.length > 0) {
    rankings = rows.map(r => ({
      rank: r.rank,
      name: r.city,
      country: r.country,
      region: r.region,
      scores: {
        AWR: parseFloat(r.awr),
        EMP: parseFloat(r.emp),
        ACT: parseFloat(r.act),
        EQU: parseFloat(r.equ),
        BND: parseFloat(r.bnd),
        ACC: parseFloat(r.acc),
        SYS: parseFloat(r.sys),
        INT: parseFloat(r.int),
      },
      composite: parseFloat(r.score),
      band: (r.band || "").toLowerCase(),
    }));
  } else {
    const colDefs = [
      { key: "rank", type: "int" },
      { key: "name", type: "str" },
      { key: "country", type: "str" },
      { key: "region", type: "str" },
      ...DIMS.map(d => ({ key: "_dim", type: d })),
      { key: "composite", type: "float" },
      { key: "band", type: "band" },
    ];
    rankings = parseRankTable(html, colDefs);
  }

  const data = buildOutput(title, rankings.length, mean, median, bands, rankings);
  writeJson("global-cities.json", data);
}

// ── Run all ─────────────────────────────────────────────────────────────────

console.log("=== Extracting ranking data from legacy HTML ===\n");

extractFortune500();
extractUsStates();
extractCountries();
extractAiLabs();
extractRobotics();
extractUsCities();
extractGlobalCities();

console.log("\n=== Validation summary ===");
// Note: us-states.html only publishes 21 of 51 states (top 8 + bottom 13).
// countries-index.html only embeds 193 of 207 countries in the JS array.
// These are source-data limitations, not extraction bugs.
const expected = {
  "fortune-500.json": 447,
  "us-states.json": 21,
  "countries.json": 193,
  "ai-labs.json": 50,
  "robotics-labs.json": 50,
  "us-cities.json": 144,
  "global-cities.json": 250,
};

let allOk = true;
for (const [file, exp] of Object.entries(expected)) {
  const data = JSON.parse(readFileSync(resolve(OUT_DIR, file), "utf8"));
  const actual = data.rankings.length;
  const ok = actual === exp ? "OK" : `MISMATCH (expected ${exp})`;
  if (actual !== exp) allOk = false;
  console.log(`  ${file}: ${actual} entities -- ${ok}`);
}

console.log(allOk ? "\nAll counts match!" : "\nSome counts do not match expected values.");
