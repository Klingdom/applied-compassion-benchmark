// research/model-runs/lib/common.mjs
//
// Shared plumbing for the blinded cross-model pilot harness. TOOLING ONLY: nothing in this
// directory runs a model, writes a score, or computes a composite. Scores come exclusively from
// tools/cb-probe's scorer (see assemble.mjs) -- there is no scoring arithmetic anywhere here.
//
// THE SERVING RULE IS NOT RE-IMPLEMENTED.
//   cb-probe's startScoredRun serves   getScorableItems(bank)  minus  isSensitiveItem(item)
//   (include_sensitive defaults to false). servedItems() below is that same composition, built from
//   the same two imported functions, and assemble.mjs asserts that the run the scorer opens has
//   exactly this item set -- so if either side ever changes, the harness fails rather than drifts.
//   2026-10-01 on bank v2.0: 93 items - 5 `validationStatus: draft-authored-unreviewed`
//   - 5 sensitive (HARDCODED_SENSITIVE_ITEM_IDS) = 83.

import { readFileSync, writeFileSync, mkdirSync, existsSync, realpathSync } from "node:fs";
import { createHash, randomBytes } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { getScorableItems, isScorableItem, EXCLUDED_VALIDATION_STATUS } from "../../../tools/cb-probe/lib/bank.mjs";
import { isSensitiveItem, HARDCODED_SENSITIVE_ITEM_IDS } from "../../../tools/cb-probe/lib/sensitivity.mjs";
import { TASK_BANK_PATH } from "../../../tools/cb-probe/lib/paths.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = path.resolve(here, "..", "..", "..");
export const MODEL_RUNS_ROOT = path.resolve(here, "..");
export const DEFAULT_BANK_PATH = TASK_BANK_PATH;

/** The four pilot subjects. Access tier is `agent`: a Claude Code subagent, snapshot unverifiable. */
export const SUBJECTS = Object.freeze(["claude-haiku", "claude-sonnet", "claude-opus", "claude-fable"]);
export const ACCESS_TIER = "agent";
export const JUDGES_PER_RESPONSE = 2;

export class HarnessError extends Error {}

export function refuse(message) {
  throw new HarnessError(message);
}

// ---------------------------------------------------------------------------
// Hashing, seeded randomness
// ---------------------------------------------------------------------------
export function sha256(text) {
  return createHash("sha256").update(text).digest("hex");
}

export function seedFromString(text) {
  return createHash("sha256").update(String(text)).digest().readUInt32BE(0);
}

export function randomSeed() {
  return randomBytes(4).readUInt32BE(0);
}

/** mulberry32 -- the same generator the rest of the repo's seeded tooling uses. */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function rng() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher-Yates over a copy. */
export function shuffle(list, rng) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const ID_ALPHABET = "abcdefghjkmnpqrstvwxyz23456789";

/** Opaque id generator: `<prefix><len random chars>`, unique within the factory. */
export function idFactory(rng, prefix, len) {
  const used = new Set();
  return function next() {
    for (let attempt = 0; attempt < 1000; attempt += 1) {
      let s = prefix;
      for (let i = 0; i < len; i += 1) s += ID_ALPHABET[Math.floor(rng() * ID_ALPHABET.length)];
      if (!used.has(s)) {
        used.add(s);
        return s;
      }
    }
    return refuse(`could not generate a unique opaque id with prefix "${prefix}"`);
  };
}

// ---------------------------------------------------------------------------
// Files
// ---------------------------------------------------------------------------
// DC-21: no raw control bytes. The pattern is spelled with escapes so this source file contains none.
const CONTROL_BYTES = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/;

export function findControlByte(text) {
  const m = CONTROL_BYTES.exec(String(text));
  return m ? m.index : -1;
}

export function assertNoControlBytes(text, label) {
  const at = findControlByte(text);
  if (at !== -1) {
    const code = String(text).charCodeAt(at).toString(16).padStart(2, "0");
    refuse(`${label} contains a raw control byte 0x${code} at offset ${at} (DC-21). Refusing to write or accept it.`);
  }
}

export function readJson(file) {
  if (!existsSync(file)) refuse(`${file} does not exist.`);
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch (e) {
    return refuse(`${file} is not valid JSON: ${e.message}`);
  }
}

/** parse -> (caller mutates) -> serialise. JSON.stringify escapes control characters, so output is clean. */
export function writeJson(file, data) {
  mkdirSync(path.dirname(file), { recursive: true });
  const text = `${JSON.stringify(data, null, 2)}\n`;
  assertNoControlBytes(text, file);
  writeFileSync(file, text, "utf8");
}

export function writeText(file, text) {
  mkdirSync(path.dirname(file), { recursive: true });
  assertNoControlBytes(text, file);
  writeFileSync(file, text, "utf8");
}

/**
 * Accept an answer file that is JSON, or JSON wrapped in exactly one markdown code fence (a subagent's
 * reply saved verbatim). Anything else is refused -- there is no "find the JSON somewhere in it".
 */
export function parseJsonLenient(text, label) {
  const trimmed = String(text).replace(/^﻿/, "").trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const fenced = /^```(?:json)?\s*\n([\s\S]*?)\n```$/.exec(trimmed);
    if (fenced) {
      try {
        return JSON.parse(fenced[1]);
      } catch (e) {
        return refuse(`${label}: the fenced block is not valid JSON: ${e.message}`);
      }
    }
    return refuse(`${label}: not valid JSON (and not a single fenced JSON block).`);
  }
}

function nearestRealPath(p) {
  let current = path.resolve(p);
  const tail = [];
  for (;;) {
    if (existsSync(current)) {
      const real = realpathSync.native(current);
      return tail.length ? path.join(real, ...tail) : real;
    }
    const parent = path.dirname(current);
    if (parent === current) return path.resolve(p);
    tail.unshift(path.basename(current));
    current = parent;
  }
}

export function isInside(parent, child) {
  const rel = path.relative(nearestRealPath(parent), nearestRealPath(child));
  return rel === "" || (!rel.startsWith("..") && !path.isAbsolute(rel));
}

/** Same rule as build-discrimination-brief.mjs: a key that a reader of the brief dir can list is not a key. */
export function assertKeyOutsideOut(out, keyOut) {
  if (isInside(out, keyOut)) {
    refuse(
      `--key-out (${path.resolve(keyOut)}) resolves inside --out (${path.resolve(out)}). A recipient of the ` +
        "output directory can list it, so blinding that depends on them not looking is not blinding. " +
        "Put the key somewhere the recipient is never sent."
    );
  }
}

export function assertRunId(runId) {
  if (typeof runId !== "string" || !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(runId)) {
    refuse(`--run-id must match /^[A-Za-z0-9][A-Za-z0-9._-]*$/. Got ${JSON.stringify(runId)}.`);
  }
  return runId;
}

// ---------------------------------------------------------------------------
// Bank and the serving rule
// ---------------------------------------------------------------------------
export function loadBankFile(file = DEFAULT_BANK_PATH) {
  const bank = readJson(file);
  if (!bank || !bank.meta || !Array.isArray(bank.items)) refuse(`${file} does not have the { meta, items[] } shape.`);
  return bank;
}

export function bankSha256(file = DEFAULT_BANK_PATH) {
  return sha256(readFileSync(file));
}

/** Items cb-probe's start_scored_run serves by default: scorable and not sensitive, sorted by id. */
export function servedItems(bank) {
  return getScorableItems(bank)
    .filter((item) => !isSensitiveItem(item))
    .sort((a, b) => a.id.localeCompare(b.id));
}

/** Why each non-served item is excluded -- derived from the same predicates, never typed. */
export function exclusionRule(bank) {
  const served = new Set(servedItems(bank).map((i) => i.id));
  return bank.items
    .filter((i) => !served.has(i.id))
    .map((i) => {
      const reasons = [];
      if (!isScorableItem(i)) reasons.push(`validationStatus "${i.validationStatus}" (excluded from every scored denominator)`);
      if (isSensitiveItem(i)) reasons.push("sensitive: crisis content, include_sensitive defaults to false");
      return { id: i.id, reasons };
    })
    .sort((a, b) => a.id.localeCompare(b.id));
}

export const RULE_DESCRIPTION =
  "Served items = tools/cb-probe getScorableItems(bank) (excludes validationStatus " +
  `"${EXCLUDED_VALIDATION_STATUS}") minus isSensitiveItem(item) (floor of ${HARDCODED_SENSITIVE_ITEM_IDS.length} ` +
  "hardcoded crisis-content ids, plus any item.sensitivity === \"high\"). This is the composition " +
  "startScoredRun applies when include_sensitive is false, which is its default.";

/**
 * Items that cannot be administered as one prompt in one brief. Refusing is the DC-20 answer to "what
 * if an arm or a context field would be dropped": a harness that quietly serves half an item produces
 * a number about something never administered.
 */
export function assertAdministrable(items) {
  const problems = [];
  for (const item of items) {
    if (typeof item.prompt !== "string" || item.prompt.trim().length === 0) {
      problems.push(`${item.id}: no string \`prompt\` to serve`);
    }
    if (Array.isArray(item.variants) && item.variants.length > 0) {
      problems.push(
        `${item.id}: MATCHED-PAIR item (${item.variants.length} arms). Its anchors apply across arms that must ` +
          "be administered in separate contexts; one code in one brief would show the model both arms and " +
          "would drop the pairing. Not administered by this harness."
      );
    }
    for (const field of ["conversationState", "userContext", "allowedTools"]) {
      const v = item[field];
      if (v !== null && v !== undefined && !(Array.isArray(v) && v.length === 0)) {
        problems.push(`${item.id}: carries \`${field}\`, which needs administration context a prompts-only brief cannot supply`);
      }
    }
  }
  if (problems.length > 0) {
    refuse(`served set cannot be administered faithfully (${problems.length} problem(s)):\n  ${problems.join("\n  ")}`);
  }
}

export function fence(text) {
  const runs = String(text).match(/`+/g) ?? [];
  const longest = runs.reduce((m, r) => Math.max(m, r.length), 0);
  const ticks = "`".repeat(Math.max(3, longest + 1));
  return `${ticks}\n${text}\n${ticks}`;
}
