// research/model-runs/lib/leak-check.mjs
//
// The leak check for anything handed to a SUBJECT. It extends the one inside
// research/scripts/quote-item.mjs (which is a script with top-level side effects and cannot be
// imported) and keeps its two original tests identical in behaviour:
//   - six-word shingles of every anchor description, matched against the normalised text;
//   - the item's construct name.
// Extensions, all required by this protocol ("no anchors, rubric, construct, indicator, dimension or
// item id may appear"):
//   - anchors are checked for EVERY bank item, not only the served ones, and the verbatim anchor
//     label ("3.0 Functional") is checked as well as the description;
//   - item ids (every id in the bank, plus the generic id shape) and dimension codes;
//   - the harness's own scaffold text is scanned for rubric vocabulary. The scaffold is everything
//     except the verbatim prompts, which are the instrument and are never edited to pass a check.
//
// It reports; callers fail closed on any non-empty result.

import { HarnessError } from "./common.mjs";
import { DIMENSION_CODES } from "../../../tools/cb-probe/lib/canonical.mjs";

const normalise = (s) =>
  String(s)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** Six-word shingles: long enough not to fire on ordinary shared vocabulary (as quote-item.mjs). */
export function shingles(text, n = 6) {
  const w = normalise(text).split(" ").filter(Boolean);
  const out = [];
  for (let i = 0; i + n <= w.length; i += 1) out.push(w.slice(i, i + n).join(" "));
  return out;
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Vocabulary the harness's own words must never use when speaking to a subject. */
export const SCAFFOLD_BANNED =
  /\b(rubrics?|anchors?|constructs?|indicators?|sub-?dimensions?|dimensions?|criteria|criterion|scor(?:e|es|ed|ing)|ratings?|rated|benchmark|compassion|grader|judge|judges|judging|exemplary|established)\b/i;

/**
 * @param {object} p
 * @param {string} p.text         the full text a subject will receive
 * @param {string} [p.scaffoldText] the same text with every verbatim prompt removed
 * @param {string[]} [p.promptTexts] the verbatim prompts the text legitimately contains. An anchor shingle
 *   that is also a shingle of one of these is wording the ITEM ITSELF contains (an anchor routinely
 *   restates the task: AWR-4-A L1 shares "the booking email with the deposit" with its own prompt, and
 *   the stock quote-item.mjs check refuses that item on its own). The prompt cannot be edited to pass a
 *   check, so such shingles are exempt; an anchor planted anywhere else still contributes shingles that
 *   no prompt has, and is caught.
 * @param {object} p.bank
 * @returns {string[]} one human-readable line per leak; empty means clean
 */
export function findSubjectLeaks({ text, scaffoldText, promptTexts = [], bank, checkIds = true, checkConstructs = true }) {
  const leaks = [];
  const hay = ` ${normalise(text)} `;
  const exempt = new Set(promptTexts.flatMap((p) => shingles(p)));

  for (const item of bank.items) {
    for (const a of item.anchors ?? []) {
      for (const s of shingles(a.description)) {
        if (!exempt.has(s) && hay.includes(` ${s} `)) {
          leaks.push(`${item.id} L${a.level}: anchor text "...${s}..."`);
          break;
        }
      }
      const label = normalise(a.label ?? "");
      // A bare band word such as "established" is ordinary English; only the full printed label
      // ("4.0 established") is a rubric artefact.
      if (/\d/.test(String(a.label ?? "")) && label.length > 0 && hay.includes(` ${label} `)) {
        leaks.push(`${item.id} L${a.level}: anchor label "${a.label}"`);
      }
    }
    if (checkConstructs) {
      const construct = normalise(item.construct ?? "");
      if (construct.length > 3 && hay.includes(` ${construct} `)) {
        leaks.push(`${item.id}: construct name "${item.construct}"`);
      }
    }
  }

  if (checkIds) {
    const ids = bank.items.map((i) => escapeRe(String(i.id)));
    const idRe = new RegExp(`(?<![A-Za-z0-9])(?:${ids.join("|")})(?![A-Za-z0-9])`, "i");
    const hit = idRe.exec(text);
    if (hit) leaks.push(`item id "${hit[0]}"`);
    const shape = /(?<![A-Za-z0-9])[A-Z]{3}-\d-[A-Z](?![A-Za-z0-9])/.exec(text);
    if (shape) leaks.push(`item-id shaped token "${shape[0]}"`);
    const dim = new RegExp(`(?<![A-Za-z0-9])(?:${DIMENSION_CODES.join("|")})(?![A-Za-z0-9])`).exec(text);
    if (dim) leaks.push(`dimension code "${dim[0]}"`);
  }

  if (typeof scaffoldText === "string") {
    const m = SCAFFOLD_BANNED.exec(scaffoldText);
    if (m) leaks.push(`harness scaffold uses rubric vocabulary: "${m[0]}"`);
  }
  return leaks;
}

export function assertNoSubjectLeaks(args, what = "subject brief") {
  const leaks = findSubjectLeaks(args);
  if (leaks.length > 0) {
    throw new HarnessError(
      `REFUSED: the ${what} leaks rubric material -- ${leaks.length} leak(s):\n  ${leaks.join("\n  ")}\n` +
        "A subject that can see what it is marked against is aiming at it, and the score then measures the aim."
    );
  }
}

/**
 * Judge batches may contain the rubric, but must not contain anything that unblinds the SUBJECT.
 * `identityTerms` are strings that must not appear in the harness-written part of a batch.
 */
export function findIdentityLeaks({ scaffoldText, identityTerms }) {
  const leaks = [];
  for (const term of identityTerms) {
    if (!term) continue;
    if (new RegExp(`(?<![A-Za-z0-9])${escapeRe(String(term))}(?![A-Za-z0-9])`, "i").test(scaffoldText)) {
      leaks.push(`"${term}"`);
    }
  }
  return leaks;
}
