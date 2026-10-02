// research/model-runs/lib/probe-validate.mjs
//
// cb-probe's OWN per-rating validation, used as an oracle. cb-probe does not export its rating validator
// (validateRatingShape in tools/cb-probe/lib/scored-run.mjs, which carries the "substantive excerpt" rule, the
// anchor-label rule and the case-insensitive substring rule), and cb-probe is not modified here. The one
// public door to that function is recordItemRating, so this opens a THROWAWAY scored run in a scratch artifact
// root, offers each rating to recordItemRating exactly as assemble.mjs would, and reports the ToolError text.
// No rule is reimplemented: whatever cb-probe says is what this returns. The scratch root is deleted afterwards.

import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import { startScoredRun, recordItemRating, MIN_TRIALS } from "../../../tools/cb-probe/lib/scored-run.mjs";
import { ToolError } from "../../../tools/cb-probe/lib/tools.mjs";
import { assertSafeWriteRoot } from "../../../tools/cb-probe/lib/session-store.mjs";
import { refuse } from "./common.mjs";

/**
 * @param {{bank: object, seed?: number, scratchDir?: string,
 *          candidates: {key: string, item_id: string, response_text: string, rating_1_5: any, anchor_matched: any,
 *                       evidence_quote: any, judge_label: string}[]}} args
 * @returns {Map<string, string>} candidate key -> cb-probe's error message, for the candidates it REJECTS
 */
export function cbProbeRejections({ bank, seed, scratchDir, candidates }) {
  const rejected = new Map();
  if (candidates.length === 0) return rejected;
  const parent = scratchDir ? path.resolve(scratchDir) : os.tmpdir();
  const root = assertSafeWriteRoot(mkdtempSync(path.join(parent, "cbp-validate-")));
  try {
    const perItem = new Map();
    for (const c of candidates) perItem.set(c.item_id, (perItem.get(c.item_id) ?? 0) + 1);
    // trials_per_item caps recorded ratings per item; size the scratch run so the cap can never be the reason for a refusal.
    const trials = Math.max(MIN_TRIALS, ...perItem.values());
    const ctx = { bank, artifactRoot: root, runs: new Map(), sessions: new Map() };
    const started = startScoredRun(
      { subject_label: "scratch-validation", judge_label: "scratch-validation", judgeConfiguration: "panel", trials, seed },
      ctx
    );
    for (const c of candidates) {
      try {
        recordItemRating(
          {
            run_id: started.run_id,
            item_id: c.item_id,
            response_text: c.response_text,
            rating_1_5: c.rating_1_5,
            anchor_matched: c.anchor_matched,
            evidence_quote: c.evidence_quote,
            judge_label: c.judge_label,
          },
          ctx
        );
      } catch (e) {
        if (!(e instanceof ToolError)) throw e;
        // An item outside the scratch run's plan is a harness/bank inconsistency, not a rating defect.
        if (/planned item set|No item with id|already has \d+ recorded/.test(e.message)) {
          refuse(`cb-probe cannot validate ${c.key}: ${e.message}`);
        }
        rejected.set(c.key, e.message);
      }
    }
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
  return rejected;
}
