/**
 * PipelineStages — the detect → evaluate → score → publish arc as four
 * labelled stages, each stating what exists and what is blocking it.
 *
 * Every fact rendered here is read from the published data stores at build
 * time (model-index-facts.ts, release-watch-facts.ts, and
 * release-sources-v1.json directly) — never hand-typed. See DECISIONS.md
 * D-29 for why: a hardcoded count left six stale "50" claims live on this
 * site after the Robotics Labs Index grew to 92 entities.
 *
 * D-29 also forbids implying "evaluation underway" anywhere on these pages.
 * The Evaluate stage below states a plain, checkable reason it has not
 * started (no model API has ever been called from this repository) rather
 * than a progress verb.
 */

import Panel from "@/components/ui/Panel";
import releaseSources from "@/data/model-benchmark/release-sources-v1.json";
import { MODEL_INDEX_FACTS as F } from "@/lib/model-index-facts";
import { RELEASE_WATCH_FACTS as R } from "@/lib/release-watch-facts";

const sourceCount = (releaseSources as { sources?: unknown[] }).sources?.length ?? 0;

type Stage = {
  n: string;
  h: string;
  status: string;
  /** Only the stage with a genuine external blocker (an approval only the founder can give) is flagged in colour. */
  flagged: boolean;
  p: string;
};

const stages: Stage[] = [
  {
    n: "1",
    h: "Detect",
    status: R.hasEverScanned ? "Scanning" : "Never run",
    flagged: false,
    p:
      `${sourceCount} release source${sourceCount === 1 ? "" : "s"} registered, ` +
      `${R.completedScanCount} scan${R.completedScanCount === 1 ? "" : "s"} completed. A source must be ` +
      `added by a human from a verified URL before a scan can look for anything against it — see release watch below.`,
  },
  {
    n: "2",
    h: "Evaluate",
    status: "Blocked",
    flagged: true,
    p:
      "Evaluating a model means calling that model's API and recording what it does. That requires " +
      "provisioned credentials and an approved spend budget. Neither exists yet: no model API has ever " +
      "been called from this programme.",
  },
  {
    n: "3",
    h: "Score",
    status: "Not reached",
    flagged: false,
    p:
      `The scoring formula is fully specified (see the method), but has never run on real model output. ` +
      `${F.reviewedItemCount} of ${F.itemCount} task-bank items have completed human review, so a score ` +
      `produced today would rest on items no one has validated.`,
  },
  {
    n: "4",
    h: "Publish",
    status: `${F.evaluatedModelCount} published`,
    flagged: false,
    p:
      "A result publishes only when the evaluation behind it is complete, reproducible from a frozen " +
      "snapshot, and traceable to a recorded item-bank version. Nothing has met that bar yet.",
  },
];

export default function PipelineStages() {
  return (
    <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
      {stages.map((s) => (
        <Panel key={s.n}>
          <p className="text-[0.75rem] tracking-wide text-muted-subtle uppercase mb-1">Stage {s.n}</p>
          <div className="flex items-baseline justify-between gap-2 mb-2">
            <h3 className="text-[1.08rem]">{s.h}</h3>
            <span
              className={`text-[0.78rem] font-semibold whitespace-nowrap ${s.flagged ? "text-[#fb923c]" : "text-muted-subtle"}`}
            >
              {s.status}
            </span>
          </div>
          <p className="text-muted text-[0.88rem] leading-relaxed">{s.p}</p>
        </Panel>
      ))}
    </div>
  );
}
