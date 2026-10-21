#!/usr/bin/env node
/**
 * build-special-briefings.mjs
 *
 * Parses each research/special-briefings/*.md file and emits:
 *   site/src/data/special-briefings/<slug>.json  — full public brief
 *   site/src/data/special-briefings/manifest.json — index (newest-first)
 *
 * PUBLIC-SAFE RULE:
 *   Sections 1–6, Section 8 (Forward view), and Sources are public.
 *   Section 7 ("Methodology flags") MUST be excluded entirely.
 *   Strip all reviewer language: SBQ refs, "human review", "NOT auto-applied".
 *
 * Run via: node site/scripts/build-special-briefings.mjs
 * Wired into npm run prebuild.
 */

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { mdToHtml } from "./lib/markdown-lite.mjs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const REPO_ROOT = join(__dirname, "..", "..");
const BRIEFINGS_SRC = join(REPO_ROOT, "research", "special-briefings");
const OUT_DIR = join(__dirname, "..", "src", "data", "special-briefings");

if (!existsSync(OUT_DIR)) {
  mkdirSync(OUT_DIR, { recursive: true });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Derive a URL slug from a filename: "floor-and-critical-2026-06-11.md" → "floor-and-critical-2026-06-11"
 */
function fileToSlug(filename) {
  return basename(filename, ".md");
}

/**
 * Derive a deterministic "last modified" timestamp for a briefing from its
 * source, instead of stamping the wall clock on every build (DC-08).
 *
 * Preference order:
 *   1. The source .md file's last commit date (git log), so the value only
 *      changes when the briefing's actual content is edited and committed —
 *      a genuine "content changed" signal, reused as `dateModified` in the
 *      Article JSON-LD on /updates/special/[slug].
 *   2. The briefing's own front-matter `**Date:**` (its publish date), if the
 *      file is uncommitted or `git` is unavailable in this environment.
 *   3. null (omitted from output) if neither is available.
 */
function deriveGeneratedAt(filepath, frontMatterDate) {
  try {
    const out = execFileSync(
      "git",
      ["log", "-1", "--format=%cI", "--", filepath],
      { cwd: REPO_ROOT, encoding: "utf8" },
    ).trim();
    if (out) return out;
  } catch {
    // git unavailable, or filepath outside a git repo — fall through.
  }
  if (frontMatterDate) return `${frontMatterDate}T00:00:00.000Z`;
  return null;
}

/**
 * Return true if a heading line is the internal methodology-flags section that
 * must be excluded from all public output.
 *
 * We match on the section-7 heading regardless of whitespace or emoji variation:
 *   ## 7. Methodology flags …
 *   ## 7. Methodology Flags …
 */
function isMethodologyFlagsHeading(headingText) {
  const t = headingText.trim().toLowerCase();
  return /^7[.\s]/.test(t) && t.includes("methodology");
}

/**
 * Return true if a heading is internal/reviewer-only — currently just the
 * methodology-flags section (§7). Extend here if future briefings add more.
 */
function isInternalSection(headingText) {
  return isMethodologyFlagsHeading(headingText);
}

/**
 * Strip reviewer-only language that must not appear on the public surface.
 * The patterns here are:
 *   - References to "SBQ-N" methodology question tags
 *   - The phrase "for human review" and variants
 *   - The phrase "NOT auto-applied" and variants
 *   - The phrase "Methodology flags" (only in body text; headings already filtered)
 *   - "Filed as a methodology question (§7…)" clauses
 *   - "methodology question" standalone references pointing to section 7
 */
function stripInternalLanguage(text) {
  return text
    // Remove SBQ references like "(§7, Q1)", "(§7, SBQ-6)", "Q1", "SBQ-9" etc.
    .replace(/\(§7[^)]*\)/g, "")
    .replace(/\bSBQ-\d+\b/g, "")
    // Remove "for human review" / "— for human review" phrases
    .replace(/[—–-]?\s*for human review\s*[—–-]?/gi, "")
    .replace(/for human review/gi, "")
    // Remove "NOT auto-applied" and variants
    .replace(/NOT auto-applied/gi, "")
    .replace(/not auto-applied/gi, "")
    // Remove "Filed as a methodology question…" clauses (sentence fragments)
    .replace(/\.\s*Filed as a methodology question[^.]*\./gi, ".")
    .replace(/Filed as a methodology question[^.]*\./gi, "")
    // Remove "appended to research/PENDING_CHANGES.md…" internal-process notes
    .replace(/\.\s*They are appended to[^.]*\./gi, ".")
    // Remove "flagged for human decision" phrases
    .replace(/and flagged for human decision/gi, "")
    .replace(/flagged for human decision/gi, "")
    // Remove "continuing the SBQ numbering from …" internal cross-refs
    .replace(/,\s*continuing the SBQ numbering[^.]*\./gi, ".")
    // Remove "(see §7, Q1)" style cross-refs
    .replace(/\(see §7[^)]*\)/gi, "")
    // Remove "methodology question" trailing fragments that now dangle
    .replace(/,\s*and it is filed as a methodology question\./gi, ".")
    .replace(/\s*\(filed §7,?\s*Q?\d*\)/gi, "")
    // Trim extra whitespace / doubled spaces that may result
    .replace(/ {2,}/g, " ")
    .replace(/\. \./g, ".")
    .trim();
}

// Markdown rendering lives in lib/markdown-lite.mjs (shared with build-insights.mjs).

// ─── publicSummary parser ─────────────────────────────────────────────────────

/**
 * Parse the ## publicSummary block from the markdown document.
 * Returns { title, dek, cohortSummary, keyFindings[] } or null if not found.
 *
 * The publicSummary block uses a blockquote format:
 *   > **Title:** ...
 *   > **Dek:** ...
 *   > **The cohort:** (followed by bullet list blockquotes)
 *   > **Key findings (observer voice):** (followed by numbered list)
 */
function parsePublicSummary(md) {
  // Locate ## publicSummary and extract everything until the next ## heading.
  // Use an index-based approach to avoid \Z (not valid in JS regex).
  const startIdx = md.indexOf("\n## publicSummary");
  if (startIdx === -1) return null;

  // Find the next ## heading after publicSummary
  const afterSummaryTag = startIdx + "\n## publicSummary".length;
  const nextSectionIdx = md.indexOf("\n## ", afterSummaryTag);
  const block = nextSectionIdx === -1
    ? md.slice(afterSummaryTag)
    : md.slice(afterSummaryTag, nextSectionIdx);

  // Title: "> **Title:** <text>"
  const titleMatch = block.match(/>\s*\*\*Title:\*\*\s*(.+)/);
  const title = titleMatch ? titleMatch[1].trim() : "";

  // Dek: "> **Dek:** <text>" (may span lines)
  const dekMatch = block.match(/>\s*\*\*Dek:\*\*\s*([\s\S]+?)(?=\n>\s*\n|\n>\s*\*\*|\n\n)/);
  const dek = dekMatch ? dekMatch[1].replace(/\n>\s*/g, " ").trim() : "";

  // Cohort summary: "> **The cohort:**" block bullet items
  const cohortMatch = block.match(/>\s*\*\*The cohort:\*\*\s*\n([\s\S]*?)(?=\n>\s*\*\*Key findings)/);
  let cohortSummary = "";
  if (cohortMatch) {
    cohortSummary = cohortMatch[1]
      .split("\n")
      .filter((l) => l.startsWith("> "))
      .map((l) => l.replace(/^>\s*-?\s*/, "").replace(/\*\*/g, "").trim())
      .filter(Boolean)
      .join(" · ");
  }

  // Key findings: numbered items under "> **Key findings…**"
  // Each line looks like: "> 1. **Heading text.** Body text."
  const findingsMatch = block.match(/>\s*\*\*Key findings[^*]*\*\*\s*\n([\s\S]*)/);
  const keyFindings = [];
  if (findingsMatch) {
    const rawFindings = findingsMatch[1];
    const lines = rawFindings.split("\n");
    let current = "";
    for (const line of lines) {
      // Match a numbered finding line, e.g.: "> 1. **Bold part.** Rest of text."
      const m = line.match(/^>\s+\d+\.\s+\*\*([^*]+)\*\*\s*(.*)/);
      if (m) {
        if (current) keyFindings.push(current.trim());
        current = `**${m[1]}** ${m[2] || ""}`.trim();
      } else if (line.startsWith(">") && current) {
        // Continuation of the same finding
        current += " " + line.replace(/^>\s*/, "").trim();
      } else if (line.trim() === "" && current) {
        // Blank line — end of this finding or just whitespace, keep accumulating
        // (don't push yet — some findings span blank > lines)
      }
    }
    if (current) keyFindings.push(current.trim());
  }

  return { title, dek, cohortSummary, keyFindings };
}

// ─── Main section parser ──────────────────────────────────────────────────────

/**
 * Split a markdown document into named sections.
 * Returns array of { heading, level, rawMd } objects.
 *
 * Sections are delineated by ## headings. The publicSummary section and the
 * document preamble (before the first ##) are excluded.
 *
 * Internal sections (§7 Methodology flags) are also excluded.
 */
function parseSections(md) {
  const sections = [];
  // Split on ## headings (level 2+), keeping the delimiter
  const parts = md.split(/\n(?=#{2,}\s)/);

  for (const part of parts) {
    const headingMatch = part.match(/^(#{2,})\s+(.+)\n/);
    if (!headingMatch) continue;

    const levelHashes = headingMatch[1];
    const headingText = headingMatch[2].trim();
    const level = levelHashes.length;
    const body = part.slice(headingMatch[0].length);

    // Skip the publicSummary block
    if (headingText.toLowerCase() === "publicsummary") continue;
    // Skip internal sections (§7 methodology flags)
    if (isInternalSection(headingText)) {
      console.log(`  [skip] §7 internal section: "${headingText}"`);
      continue;
    }

    sections.push({ heading: headingText, level, rawMd: body });
  }

  return sections;
}

// ─── Extract date and edition from front matter ───────────────────────────────

function parseFrontMatter(md) {
  // Lines like: "- **Edition:** Foundational (one-off; thereafter quarterly)"
  // and: "- **Date:** 2026-06-11"
  const editionMatch = md.match(/\*\*Edition:\*\*\s*(.+)/);
  const dateMatch = md.match(/\*\*Date:\*\*\s*(\d{4}-\d{2}-\d{2})/);
  const scopeMatch = md.match(/\*\*Scope:\*\*\s*(.+)/);

  return {
    edition: editionMatch ? editionMatch[1].trim() : "",
    date: dateMatch ? dateMatch[1].trim() : "",
    scope: scopeMatch ? scopeMatch[1].trim() : "",
  };
}

// ─── Process one .md file ─────────────────────────────────────────────────────

function processBriefing(filepath) {
  const filename = basename(filepath);
  const slug = fileToSlug(filename);
  const rawMd = readFileSync(filepath, "utf8");

  // 1. Parse publicSummary
  const summary = parsePublicSummary(rawMd);
  if (!summary) {
    console.warn(`  [skip] No publicSummary found in ${filename} — skipping.`);
    return null;
  }

  // 2. Parse front matter (edition, date, scope)
  const frontMatter = parseFrontMatter(rawMd);

  // 3. Parse body sections (public only — §7 excluded)
  const sections = parseSections(rawMd);

  // 4. Render each section's markdown to HTML, stripping internal language
  const bodySections = sections.map(({ heading, level, rawMd: sectionMd }) => {
    const cleanMd = stripInternalLanguage(sectionMd);
    const html = mdToHtml(cleanMd, 1); // offset 1: ## becomes h3
    const cleanHeading = stripInternalLanguage(heading);
    return { heading: cleanHeading, level, html };
  });

  // 5. Strip internal language from key findings
  const keyFindings = summary.keyFindings.map(stripInternalLanguage);

  // 6. Assemble output JSON
  const out = {
    slug,
    title: stripInternalLanguage(summary.title),
    dek: stripInternalLanguage(summary.dek),
    edition: frontMatter.edition,
    date: frontMatter.date,
    scope: frontMatter.scope,
    cohortSummary: stripInternalLanguage(summary.cohortSummary),
    keyFindings,
    bodySections,
    generatedAt: deriveGeneratedAt(filepath, frontMatter.date),
  };

  // 7. Write output
  const outPath = join(OUT_DIR, `${slug}.json`);
  writeFileSync(outPath, JSON.stringify(out, null, 2) + "\n", "utf8");
  console.log(`  [ok] ${slug}.json — ${bodySections.length} public sections`);

  return out;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

// Find all .md files in the special-briefings source directory.
// The research/ tree is NOT present in the production Docker build context
// (the Dockerfile copies only site/), so when the source dir is absent we
// SKIP regeneration and rely on the committed site/src/data/special-briefings/*
// JSON (the deployable source of truth). This must exit 0 so `npm run build`
// succeeds in the container.
if (!existsSync(BRIEFINGS_SRC)) {
  console.log(
    `[build-special-briefings] Source dir ${BRIEFINGS_SRC} not present (expected in Docker build) — using committed site/src/data/special-briefings/*. Skipping regeneration.`,
  );
  process.exit(0);
}

const mdFiles = readdirSync(BRIEFINGS_SRC)
  .filter((f) => f.endsWith(".md"))
  .map((f) => join(BRIEFINGS_SRC, f));

console.log(`[build-special-briefings] Found ${mdFiles.length} briefing file(s) in ${BRIEFINGS_SRC}`);

const results = [];
for (const filepath of mdFiles) {
  console.log(`  Processing: ${basename(filepath)}`);
  const result = processBriefing(filepath);
  if (result) results.push(result);
}

// Sort newest-first by date
results.sort((a, b) => b.date.localeCompare(a.date));

// Write manifest
// NOTE: no `updatedAt` field here — nothing in site/src reads it (grepped
// 2026-09-16), and a wall-clock stamp on an otherwise-deterministic index
// file was pure git churn (DC-08). Re-add only if a real consumer needs it,
// derived from source data rather than `new Date()`.
const manifest = {
  briefings: results.map(({ slug, title, dek, date, edition }) => ({
    slug,
    title,
    dek,
    date,
    edition,
  })),
};

const manifestPath = join(OUT_DIR, "manifest.json");
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");

console.log(`[build-special-briefings] Done. ${results.length} briefing(s) published. Manifest written.`);
if (results.length === 0) {
  console.warn("[build-special-briefings] WARNING: No briefings produced. Check source files.");
}
