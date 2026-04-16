/**
 * pipeline-reader.mjs — Shared helpers for reading pipeline research data.
 *
 * Used by:
 *   - generate-newsletter.mjs (weekly newsletter)
 *   - prepare-updates.mjs (daily website JSON)
 *   - run-pipeline.sh agents (via import)
 *
 * Centralizes: JSON reading, atomic writing, frontmatter parsing, markdown
 * section extraction, bullet extraction, band classification, text normalization,
 * and assessment history management.
 */

import { readFileSync, writeFileSync, renameSync, appendFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";

// ── File readers ────────────────────────────────────────────────

/**
 * Read and parse a JSON file. Returns null if file does not exist or is corrupt.
 * Logs a warning on parse failure rather than crashing the pipeline.
 */
export function readJson(path) {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf-8"));
  } catch (e) {
    console.error(`[pipeline-reader] Failed to parse ${path}: ${e.message}`);
    return null;
  }
}

/**
 * Atomic JSON write: writes to a .tmp file then renames.
 * Prevents corruption if the process is killed mid-write.
 * Ensures parent directory exists.
 */
export function writeJsonAtomic(path, data) {
  const dir = dirname(path);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const tmp = path + ".tmp";
  writeFileSync(tmp, JSON.stringify(data, null, 2));
  renameSync(tmp, path);
}

/**
 * Atomic text write: writes to a .tmp file then renames.
 * For markdown and other non-JSON outputs.
 */
export function writeTextAtomic(path, content) {
  const dir = dirname(path);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const tmp = path + ".tmp";
  writeFileSync(tmp, content);
  renameSync(tmp, path);
}

/**
 * Append a single JSON line to a JSONL manifest file.
 * Creates the file if it doesn't exist. Used for assessment-log and proposal-log.
 */
export function appendJsonl(path, record) {
  const dir = dirname(path);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  appendFileSync(path, JSON.stringify(record) + "\n");
}

/**
 * Read all records from a JSONL file. Returns empty array if file doesn't exist.
 */
export function readJsonl(path) {
  if (!existsSync(path)) return [];
  try {
    return readFileSync(path, "utf-8")
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => {
        try { return JSON.parse(line); }
        catch { return null; }
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

/**
 * Parse YAML-style frontmatter from a markdown file.
 * Handles top-level key: value pairs and one level of indented sub-objects.
 * Returns null if file does not exist or has no frontmatter.
 *
 * Known limitations:
 *   - YAML list values (e.g. tags: [a, b]) are silently dropped
 *   - Nested objects deeper than 1 level are not parsed
 */
export function readFrontmatter(path) {
  if (!existsSync(path)) return null;
  const content = readFileSync(path, "utf-8");
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const fm = {};
  const lines = match[1].split("\n");
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    // Indented line (part of a sub-object) — skip, handled by parent
    if (line.match(/^\s{2}/)) { i++; continue; }
    // Top-level key: value
    const kv = line.match(/^([\w_]+)\s*:\s*(.*?)\s*$/);
    if (!kv) { i++; continue; }
    const key = kv[1];
    const rawVal = kv[2].trim().replace(/^["']|["']$/g, "");

    // Check if next lines are indented (sub-object)
    if (i + 1 < lines.length && lines[i + 1].match(/^\s{2}\w/)) {
      const sub = {};
      i++;
      while (i < lines.length && lines[i].match(/^\s{2}/)) {
        const sm = lines[i].match(/^\s{2}([\w_]+)\s*:\s*(.+)/);
        if (sm) {
          const sv = sm[2].trim().replace(/^["']|["']$/g, "");
          sub[sm[1]] = isNaN(Number(sv)) || sv === "" ? sv : Number(sv);
        }
        i++;
      }
      fm[key] = sub;
    } else {
      fm[key] = rawVal === "" ? null : (isNaN(Number(rawVal)) ? rawVal : Number(rawVal));
      i++;
    }
  }
  return fm;
}

// ── Markdown helpers ────────────────────────────────────────────

/**
 * Extract a markdown section by heading (## Heading).
 * Returns the trimmed text between this heading and the next ## heading (or EOF).
 */
export function extractSection(md, heading) {
  const regex = new RegExp(`## ${heading}\\n+([\\s\\S]*?)(?=\\n## |$)`);
  const match = md.match(regex);
  return match ? match[1].trim() : "";
}

/**
 * Extract bullet points from markdown text.
 * Strips bold markers and bullet prefix, returns clean strings.
 */
export function extractBullets(text) {
  return text
    .split("\n")
    .filter((l) => l.startsWith("- "))
    .map((l) => l.replace(/\*\*/g, "").replace(/^-\s+/, "").trim())
    .filter(Boolean);
}

// ── Score helpers ────────────────────────────────────────────────

/** Score change proposal threshold (points). Deltas below this are confirmations. */
export const CHANGE_THRESHOLD = 5;

/**
 * Return the band name for a composite score.
 * Bands: Critical (0-20), Developing (21-40), Functional (41-60),
 *        Established (61-80), Exemplary (81-100).
 */
export function bandFor(score) {
  if (score <= 20) return "Critical";
  if (score <= 40) return "Developing";
  if (score <= 60) return "Functional";
  if (score <= 80) return "Established";
  return "Exemplary";
}

// ── Text normalization ──────────────────────────────────────────

/**
 * Normalize a string for deduplication comparison.
 * Lowercases, strips punctuation, collapses whitespace, takes first 80 chars.
 */
export function normalizeForDedup(s) {
  return s.toLowerCase().replace(/[^\w\s]/g, "").replace(/\s+/g, " ").trim().slice(0, 80);
}

/**
 * Deduplicate an array of strings using normalized comparison.
 */
export function dedup(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = normalizeForDedup(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ── Assessment history ──────────────────────────────────────────

/**
 * Save a timestamped snapshot of an assessment or proposal to the history directory.
 * Does NOT replace the current file — that's still handled by the caller.
 *
 * Usage:
 *   saveHistory("research/assessments", "openai", "2026-04-15", content)
 *   → writes research/assessments/history/openai/2026-04-15.md
 *
 *   saveHistory("research/change-proposals", "openai", "2026-04-15", data)
 *   → writes research/change-proposals/history/openai/2026-04-15.json
 */
export function saveHistory(baseDir, slug, date, content, ext = ".md") {
  const histDir = join(baseDir, "history", slug);
  if (!existsSync(histDir)) mkdirSync(histDir, { recursive: true });
  const histPath = join(histDir, `${date}${ext}`);
  if (typeof content === "string") {
    writeFileSync(histPath, content);
  } else {
    writeFileSync(histPath, JSON.stringify(content, null, 2));
  }
  return histPath;
}
