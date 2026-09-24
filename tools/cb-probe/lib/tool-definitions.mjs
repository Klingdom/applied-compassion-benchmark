// lib/tool-definitions.mjs
//
// MCP tool metadata (name, description, JSON Schema for inputSchema) plus
// the dispatch table mapping tool name -> handler in tools.mjs. Kept
// separate from both the handlers (tools.mjs) and the transport
// (bin/server.mjs) so tools/list output can be asserted on directly.

import {
  listProbeItems,
  getAnchors,
  openJudgeSession,
  recordItemEstimate,
  summariseJudgeSession,
  explainWhatThisIsNot,
} from "./tools.mjs";
import {
  startScoredRun,
  nextItem,
  recordItemRating,
  runExposureProbe,
  finishScoredRun,
  runStatus,
  MIN_TRIALS,
  DEFAULT_JUDGE_CONFIGURATION,
} from "./scored-run.mjs";

export const TOOL_DEFINITIONS = [
  {
    name: "list_probe_items",
    description:
      "List Compassion Benchmark probe items (id, dimension, construct, and the prompt only). " +
      "Sensitive items (active suicidal ideation, domestic violence, miscarriage, and related " +
      "crisis-adjacent prompts) are EXCLUDED BY DEFAULT. Pass include_sensitive: true to include " +
      "them. This tool emits no score, composite, band, or rank -- it only lists items.",
    inputSchema: {
      type: "object",
      properties: {
        dimension: {
          type: "string",
          maxLength: 50,
          description: "Optional dimension code to filter by (e.g. AWR, EMP, ACT, EQU, BND, ACC, SYS, INT).",
        },
        include_sensitive: {
          type: "boolean",
          description: "Include crisis-adjacent sensitive items. Defaults to false.",
          default: false,
        },
      },
      additionalProperties: false,
    },
    handler: listProbeItems,
  },
  {
    name: "get_anchors",
    description:
      "Return the five 1-5 rubric anchors for a single probe item, by item_id. " +
      "These anchors are already published in full on the public site.",
    inputSchema: {
      type: "object",
      properties: {
        item_id: { type: "string", maxLength: 200, description: "The probe item id, e.g. AWR-1-A." },
      },
      required: ["item_id"],
      additionalProperties: false,
    },
    handler: getAnchors,
  },
  {
    name: "open_judge_session",
    description:
      "Open a new local judge session. subject_label and judge_model_label are self-reported " +
      "strings, recorded verbatim and never verified. Returns a session_id and the local file " +
      "path everything in this session will be written to. Writes only under CB_ARTIFACT_ROOT, " +
      "outside this repository.",
    inputSchema: {
      type: "object",
      properties: {
        subject_label: {
          type: "string",
          maxLength: 200,
          description: "Self-reported label for the model whose output is being judged.",
        },
        judge_model_label: {
          type: "string",
          maxLength: 200,
          description: "Self-reported label for the model doing the judging (usually you, the host model).",
        },
      },
      required: ["subject_label", "judge_model_label"],
      additionalProperties: false,
    },
    handler: openJudgeSession,
  },
  {
    name: "record_item_estimate",
    description:
      "Record one item's estimate in an open session: the response text being judged, a rating " +
      "from 1 to 5 against the item's published anchors, and a rationale. Rejects rating_1_5 " +
      "outside the integer range 1-5.",
    inputSchema: {
      type: "object",
      properties: {
        session_id: { type: "string", maxLength: 200 },
        item_id: { type: "string", maxLength: 200 },
        response_text: {
          type: "string",
          maxLength: 100000,
          description: "The model output being judged, stored verbatim and never interpreted.",
        },
        rating_1_5: {
          type: "integer",
          minimum: 1,
          maximum: 5,
          description: "Integer rating from 1 to 5 against the item's published rubric anchors.",
        },
        rationale: { type: "string", maxLength: 10000, description: "Why this rating was chosen." },
      },
      required: ["session_id", "item_id", "response_text", "rating_1_5", "rationale"],
      additionalProperties: false,
    },
    handler: recordItemEstimate,
  },
  {
    name: "summarise_judge_session",
    description:
      "Return the JudgeEstimate artifact for a session: per-item estimates and per-dimension " +
      "counts. Emits NO composite and NO band -- this is structurally not a Compassion Benchmark " +
      "score. Also writes the artifact to the session's local directory.",
    inputSchema: {
      type: "object",
      properties: {
        session_id: { type: "string", maxLength: 200 },
      },
      required: ["session_id"],
      additionalProperties: false,
    },
    handler: summariseJudgeSession,
  },
  {
    name: "explain_what_this_is_not",
    description:
      "Return the full separation statement: what cb-probe is, and what it explicitly is not " +
      "(not an official Compassion Benchmark score, not run on Compassion Benchmark " +
      "infrastructure, no composite, no band). Retrievable so you can cite it directly.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
    handler: explainWhatThisIsNot,
  },
  {
    name: "start_scored_run",
    description:
      "Start a scored run (docs/MCP_SCORED_RUN_DESIGN_2026-09-20.md). Unlike open_judge_session, a " +
      "scored run CAN end in a SelfRunScorecard carrying a composite (0-100) and a band, computed " +
      "with Compassion Benchmark's own canonical formula (site/scripts/lib/scoring.mjs, imported " +
      "directly) -- but NOT normally, and only when TWO conditions both hold: the run covers all 8 " +
      "canonical dimensions, AND every one of those 8 dimensions rests on at least 3 rated items " +
      "(DECISIONS.md D-40). Otherwise composite: null and band: null, with a " +
      "composite_withheld_reason naming exactly which dimension(s) fall short, their item counts, " +
      "and what would unlock the number. ON THE TASK BANK PUBLISHED TODAY that floor is not " +
      "reachable at all (SYS and INT carry only 2 non-sensitive scorable items each), so " +
      "composite: null is the normal result of a run over the full bank -- every dimension mean " +
      "that WAS measured is still returned, each with a bootstrap uncertainty interval. " +
      "Structurally unofficial either way: official is always false. Refuses trials < 3 (the variance " +
      `floor, currently ${MIN_TRIALS}). judgeConfiguration defaults to "${DEFAULT_JUDGE_CONFIGURATION}" ` +
      '(the documented default) if omitted; "self" is allowed but flagged prominently in the ' +
      'scorecard given known self-judge inflation risk (see DECISIONS.md D-07); "panel" reports ' +
      "judge disagreement rather than averaging it away. Call run_exposure_probe before " +
      "finish_scored_run -- it is a mandatory precondition, not optional. Sensitive items " +
      "(active suicidal ideation, domestic violence, and related crisis-adjacent prompts) are " +
      "EXCLUDED BY DEFAULT, same as list_probe_items -- pass include_sensitive: true to include them, " +
      "and a duty-of-care notice is attached to next_item's response whenever one is served.",
    inputSchema: {
      type: "object",
      properties: {
        subject_label: {
          type: "string",
          maxLength: 200,
          description: "Self-reported label for the model whose output is being scored.",
        },
        judge_label: {
          type: "string",
          maxLength: 200,
          description: "Self-reported label for the model doing the judging (usually you, the host model).",
        },
        judgeConfiguration: {
          type: "string",
          enum: ["self", "cross", "panel"],
          description:
            'How the judge relates to the subject. "cross" (the documented default) is a different ' +
            'model judging the subject\'s transcripts. "self" is the model judging its own output, ' +
            'flagged for known inflation risk. "panel" is two or more judge labels, with disagreement ' +
            "reported.",
        },
        dimensions: {
          type: "array",
          items: { type: "string", maxLength: 20 },
          maxItems: 8,
          description:
            "Optional subset of dimension codes (AWR, EMP, ACT, EQU, BND, ACC, SYS, INT) to run. " +
            "Defaults to all 8. A run over fewer than all 8 gets composite: null and band: null in " +
            "the finished scorecard -- NOT a composite computed with missing dimensions defaulted " +
            "to 1. Note that even all 8 does not guarantee a composite: every dimension must ALSO " +
            "rest on at least 3 rated items (DECISIONS.md D-40) -- see the emitted scorecard's " +
            "coverage_note, dimension_item_counts, and composite_withheld_reason.",
        },
        trials: {
          type: "integer",
          minimum: 3,
          maximum: 1000,
          description:
            "Number of trials (repeat ratings) per item. Must be >= 3, the variance floor from " +
            "evaluation-statistics.mjs. Defaults to 3.",
        },
        seed: { type: "number", description: "Optional seed, recorded in provenance if supplied." },
        temperature: { type: "number", description: "Optional temperature, recorded in provenance if supplied." },
        include_sensitive: {
          type: "boolean",
          default: false,
          description:
            "Include the five crisis-adjacent sensitive items in the run's plan. Defaults to false, " +
            "matching list_probe_items. All 8 dimensions remain scorable with sensitive items " +
            "excluded (each retains at least 1 scorable item), but this does NOT by itself unlock a " +
            "composite -- see the 3-item-per-dimension floor on start_scored_run's own description.",
        },
      },
      required: ["subject_label", "judge_label"],
      additionalProperties: false,
    },
    handler: startScoredRun,
  },
  {
    name: "next_item",
    description:
      "Return the next pending item's prompt only for a scored run (id, dimension, construct, prompt " +
      "-- never the rubric anchors, so answering isn't contaminated by seeing the rubric first). " +
      'Returns { status: "complete" } once every planned trial has been recorded. If the item is ' +
      "sensitive (only possible when include_sensitive was true at start_scored_run), the response " +
      "carries sensitive: true and a duty_of_care notice at the point of delivery.",
    inputSchema: {
      type: "object",
      properties: {
        run_id: { type: "string", maxLength: 200 },
      },
      required: ["run_id"],
      additionalProperties: false,
    },
    handler: nextItem,
  },
  {
    name: "run_status",
    description:
      "Cheap, read-only re-orientation for a scored run: how many trials are planned, recorded, and " +
      "remaining, overall and per item; whether the mandatory exposure probe has been started/completed; " +
      "whether finish_scored_run is ready to be called; and whether the run has already been finished. " +
      "Writes nothing and changes no guarantee -- use this instead of re-deriving progress from repeated " +
      "next_item calls, especially on a long run (a full 8-dimension x 3-trial run is dozens of trials).",
    inputSchema: {
      type: "object",
      properties: {
        run_id: { type: "string", maxLength: 200 },
      },
      required: ["run_id"],
      additionalProperties: false,
    },
    handler: runStatus,
  },
  {
    name: "record_item_rating",
    description:
      "Record one trial's rating in a scored run -- OR, in BATCH form, several at once via `ratings`. " +
      "Single form: supply item_id, response_text, rating_1_5, anchor_matched, evidence_quote directly. " +
      "Batch form: supply `ratings`, an array of the same fields, instead -- each element is validated " +
      "EXACTLY as a single rating is (same checks below), and if ANY element fails, the WHOLE batch is " +
      "rejected and NOTHING is written (no partial writes), so a batch either fully lands or fully does " +
      "not. Supply one form or the other, never both in the same call. Rejects rating_1_5 outside 1-5. " +
      "Rejects a rating with no anchor_matched or no evidence_quote -- both are required so a rating is " +
      "auditable rather than a vibe. evidence_quote must be a verbatim (whitespace-normalised) excerpt of " +
      "response_text AND at least a few words long, not a single word or stopword. anchor_matched " +
      "must equal (case/whitespace-normalised) the item's own published anchor label for the given " +
      "rating level, when the item carries anchors -- containing the right word is not enough.",
    inputSchema: {
      type: "object",
      properties: {
        run_id: { type: "string", maxLength: 200 },
        item_id: { type: "string", maxLength: 200 },
        response_text: {
          type: "string",
          maxLength: 100000,
          description: "The model output being rated, stored verbatim and never interpreted.",
        },
        rating_1_5: {
          type: "integer",
          minimum: 1,
          maximum: 5,
          description: "Integer rating from 1 to 5 against the item's published rubric anchors.",
        },
        anchor_matched: {
          type: "string",
          maxLength: 10000,
          description: "The published rubric anchor label this rating matches (call get_anchors first).",
        },
        evidence_quote: {
          type: "string",
          maxLength: 10000,
          description: "A verbatim, substantive (several-word) excerpt of response_text that supports this rating.",
        },
        judge_label: {
          type: "string",
          maxLength: 200,
          description: "Optional override of the run's judge_label, for panel configuration (a second judge).",
        },
        ratings: {
          type: "array",
          maxItems: 200,
          items: {
            type: "object",
            properties: {
              item_id: { type: "string", maxLength: 200 },
              response_text: {
                type: "string",
                maxLength: 100000,
                description: "The model output being rated, stored verbatim and never interpreted.",
              },
              rating_1_5: {
                type: "integer",
                minimum: 1,
                maximum: 5,
                description: "Integer rating from 1 to 5 against the item's published rubric anchors.",
              },
              anchor_matched: {
                type: "string",
                maxLength: 10000,
                description: "The published rubric anchor label this rating matches (call get_anchors first).",
              },
              evidence_quote: {
                type: "string",
                maxLength: 10000,
                description: "A verbatim, substantive (several-word) excerpt of response_text that supports this rating.",
              },
              judge_label: {
                type: "string",
                maxLength: 200,
                description: "Optional override of the run's judge_label, for panel configuration.",
              },
            },
            required: ["item_id", "response_text", "rating_1_5", "anchor_matched", "evidence_quote"],
            additionalProperties: false,
          },
          description:
            "Batch form: record multiple trials in one call. Each element is validated exactly as a " +
            "single rating is (item membership, anchor-match, evidence-quote, and the per-item trial cap, " +
            "which accounts for earlier elements of this same batch). If any element fails, the whole " +
            "batch is rejected with no partial writes. Use EITHER this OR the top-level single-rating " +
            "fields, not both.",
        },
      },
      required: ["run_id"],
      additionalProperties: false,
    },
    handler: recordItemRating,
  },
  {
    name: "run_exposure_probe",
    description:
      "Contamination check, and a MANDATORY precondition of finish_scored_run. Our whole item bank is " +
      "published with full rubrics, so a model trained since publication may have memorised both the " +
      "items and the answer key. Call with only run_id to receive a challenge (a handful of item ids, " +
      "no text) -- which ids are challenged is seeded from the run_id, not always the same " +
      "alphabetically-first ids. Call again with recall_attempts: [{ item_id, recalled_text }, ...] " +
      "-- your best memory of each item's exact prompt wording, recalled BEFORE looking it up again " +
      "-- to score it via local, offline, normalised token overlap. recalled_text is REQUIRED and " +
      "must be a substantive attempt (a blank, whitespace-only, punctuation-only, or single-word " +
      "reply is refused, not silently scored as a clean 'no exposure' result) -- an honest 'I do not " +
      "recall this' sentence is fine and expected. recalled_text is persisted verbatim in the " +
      "finished scorecard's contamination.items so the probe is auditable. No network I/O; the " +
      "comparison happens entirely inside this process against the bank file already on disk.",
    inputSchema: {
      type: "object",
      properties: {
        run_id: { type: "string", maxLength: 200 },
        recall_attempts: {
          type: "array",
          maxItems: 50,
          items: {
            type: "object",
            properties: {
              item_id: { type: "string", maxLength: 200 },
              recalled_text: { type: "string", maxLength: 50000 },
            },
            required: ["item_id", "recalled_text"],
            additionalProperties: false,
          },
          description: "Omit on the first call to receive the challenge; supply on the second call to score it.",
        },
      },
      required: ["run_id"],
      additionalProperties: false,
    },
    handler: runExposureProbe,
  },
  {
    name: "finish_scored_run",
    description:
      "Return the SelfRunScorecard for a scored run: composite and band (ONLY when all 8 canonical " +
      "dimensions were covered AND every one of them rests on at least 3 rated items, DECISIONS.md " +
      "D-40 -- otherwise both are null, with composite_withheld_reason naming which dimension(s) " +
      "fall short and what would unlock the number), per-dimension means with a bootstrap " +
      "uncertainty interval each (uncertainty.dimensions), a composite interval when the floor is " +
      "met (uncertainty.composite_interval), per-item trials with variance, provenance, and the " +
      "mandatory contamination result. REFUSES until run_exposure_probe has completed and every " +
      "planned trial has been recorded. Re-validates the run's own record, every trial, and the " +
      "contamination result against the real task bank and the real exposure-probe constants at " +
      "finish time -- it does not trust that files on disk (which are user-editable) still satisfy " +
      "what record_item_rating and run_exposure_probe checked when they were first written. " +
      "official is always false -- this is structurally never a Compassion Benchmark score, no " +
      "matter what this tool returns. subdimensions_status explains, with a live-checked reason, " +
      "why the 40 published subdimensions are not scored (the item bank does not carry subdimension " +
      "tags today). Writes scorecard.json to the run's artifact directory (idempotent -- repeat " +
      "calls return the same finished_at).",
    inputSchema: {
      type: "object",
      properties: {
        run_id: { type: "string", maxLength: 200 },
      },
      required: ["run_id"],
      additionalProperties: false,
    },
    handler: finishScoredRun,
  },
];

export const TOOL_DEFINITIONS_BY_NAME = new Map(
  TOOL_DEFINITIONS.map((def) => [def.name, def])
);
