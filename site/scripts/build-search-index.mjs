/**
 * build-search-index.mjs
 *
 * Postbuild step: runs Pagefind against the Next.js static export in site/out/
 * to produce a sharded, client-loadable search index at site/out/_pagefind/.
 *
 * Must run AFTER `next build` completes (out/ must exist).
 * Invoked from the build script in package.json.
 *
 * Independence policy: Pagefind is entirely build-time and client-side.
 * No search queries are ever transmitted to any third party. The index is
 * static HTML → binary index shards shipped under /_pagefind/* and queried
 * directly in the browser using pagefind.js.
 */

import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
import { createIndex } from "pagefind";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const siteRoot = path.resolve(__dirname, "..");
const outDir = path.join(siteRoot, "out");
const pagefindOutputSubdir = "_pagefind";

// Verify that out/ exists before attempting to index.
if (!fs.existsSync(outDir)) {
  console.error(
    "[build-search-index] ERROR: site/out/ does not exist.",
    "Run `next build` before this step."
  );
  process.exit(1);
}

console.log(`[build-search-index] Indexing ${outDir} with Pagefind 1.5.2…`);

const startMs = Date.now();

const { index, errors: createErrors } = await createIndex({
  // No additional config needed — Pagefind reads data-pagefind-* attributes
  // from the static HTML automatically.
});

if (createErrors?.length) {
  console.error("[build-search-index] createIndex errors:", createErrors);
  process.exit(1);
}

// ── Exclusion rules ──────────────────────────────────────────────────────────
//
// Pages that should NOT appear in the archive search. These are commercial
// service pages, contact pages, and navigation shells — not research content.
//
// Entity ranking index pages (fortune-500/, countries/, etc.) are INCLUDED
// because they are high-SEO research surfaces per ARCHITECTURE_ARCHIVE.md §3.
//
// Next.js static export produces TWO forms for top-level routes:
//   - "advisory.html"         (flat file at out/ root)
//   - "advisory/index.html"   (directory form, if any sub-routes exist)
// This exclusion list handles both forms.
const EXCLUDED_PAGE_NAMES = new Set([
  // Commercial / service pages
  "purchase-research",
  "advisory",
  "score-watch",
  "enterprise",
  "api-access",
  "certified-assessments",
  "data-licenses",
  "prompting-suite-for-humans",
  "ai-evaluation-suite",
  "services",
  // Contact / legal
  "contact",
  "contact-sales",
  "thank-you",
  "supporters",
  // Interactive tools (not static research content)
  "self-assessment",
  "assess-your-organization",
  // Archive landing is a navigation surface, not a content page.
  // Searching for "archive" in the archive search would be circular.
  "updates/archive",
]);

/**
 * Returns true if a file path (relative to out/) should be excluded from
 * the Pagefind index.
 */
function isExcluded(relPath) {
  const normalized = relPath.replace(/\\/g, "/");
  for (const name of EXCLUDED_PAGE_NAMES) {
    // Match flat form: "advisory.html"
    if (normalized === `${name}.html`) return true;
    // Match directory form: "advisory/index.html"
    if (normalized === `${name}/index.html`) return true;
    // Match nested directory form: "updates/archive/index.html"
    if (normalized.startsWith(`${name}/`) && normalized.endsWith("/index.html")) return true;
  }
  return false;
}

/**
 * Recursively enumerate HTML files under a directory.
 * Returns absolute paths.
 */
function collectHtmlFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectHtmlFiles(full));
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      results.push(full);
    }
  }
  return results;
}

// Collect and filter HTML files.
const allHtmlFiles = collectHtmlFiles(outDir);
let excludedCount = 0;
const includedFiles = allHtmlFiles.filter((absPath) => {
  const rel = path.relative(outDir, absPath).replace(/\\/g, "/");
  if (isExcluded(rel)) {
    excludedCount++;
    return false;
  }
  return true;
});

console.log(
  `[build-search-index] Found ${allHtmlFiles.length} HTML files. ` +
  `Excluding ${excludedCount} service/commercial pages. ` +
  `Indexing ${includedFiles.length} research pages.`
);

// Add each file to the Pagefind index.
// addHTMLFile reads the content, respects data-pagefind-body / data-pagefind-ignore
// / data-pagefind-meta attributes, and stores the correct URL path.
let addedCount = 0;
let addErrorCount = 0;
for (const absPath of includedFiles) {
  const rel = path.relative(outDir, absPath).replace(/\\/g, "/");
  // Build the public URL: strip index.html suffix → clean path.
  // e.g. "updates/2026-05-25/index.html" → "/updates/2026-05-25"
  //       "index.html"                   → "/"
  const url = "/" + rel.replace(/\/index\.html$/, "").replace(/^index\.html$/, "");

  const content = fs.readFileSync(absPath, "utf8");
  const { errors: fileErrors } = await index.addHTMLFile({
    url,
    content,
  });

  if (fileErrors?.length) {
    console.warn(`[build-search-index] Warn indexing ${rel}:`, fileErrors);
    addErrorCount++;
  } else {
    addedCount++;
  }
}

console.log(
  `[build-search-index] Indexed ${addedCount} pages` +
  (addErrorCount > 0 ? ` (${addErrorCount} with warnings)` : "") + "."
);

// Write the index into out/_pagefind/
const { errors: writeErrors } = await index.writeFiles({
  outputPath: path.join(outDir, pagefindOutputSubdir),
});

if (writeErrors?.length) {
  console.error("[build-search-index] writeFiles errors:", writeErrors);
  process.exit(1);
}

const durationMs = Date.now() - startMs;

// ── Size check ───────────────────────────────────────────────────────────────
// Acceptance criterion: out/_pagefind/ total size < 2 MB (ARCHITECTURE_ARCHIVE.md §3).

function dirSizeBytes(dirPath) {
  if (!fs.existsSync(dirPath)) return 0;
  let total = 0;
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      total += dirSizeBytes(fullPath);
    } else {
      total += fs.statSync(fullPath).size;
    }
  }
  return total;
}

const pagefindDir = path.join(outDir, pagefindOutputSubdir);
const sizeBytes = dirSizeBytes(pagefindDir);
const sizeMB = (sizeBytes / 1024 / 1024).toFixed(2);

// Count shards for build-manifest observability.
function countFiles(dirPath, ext) {
  if (!fs.existsSync(dirPath)) return 0;
  let count = 0;
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const full = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      count += countFiles(full, ext);
    } else if (entry.name.endsWith(ext)) {
      count++;
    }
  }
  return count;
}

const shardCount = countFiles(pagefindDir, ".pf_index");

console.log(
  `[build-search-index] Done in ${durationMs}ms. ` +
  `Index at out/${pagefindOutputSubdir}/ — ${sizeMB} MB, ${shardCount} shard(s).`
);

if (sizeBytes > 2 * 1024 * 1024) {
  console.warn(
    `[build-search-index] WARNING: index size ${sizeMB} MB exceeds the 2 MB target ` +
    "from ARCHITECTURE_ARCHIVE.md §3. " +
    "Consider narrowing data-pagefind-body selectors on large pages."
  );
}
