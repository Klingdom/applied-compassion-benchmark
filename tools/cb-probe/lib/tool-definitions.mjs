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
        item_id: { type: "string", description: "The probe item id, e.g. AWR-1-A." },
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
          description: "Self-reported label for the model whose output is being judged.",
        },
        judge_model_label: {
          type: "string",
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
        session_id: { type: "string" },
        item_id: { type: "string" },
        response_text: {
          type: "string",
          description: "The model output being judged, stored verbatim and never interpreted.",
        },
        rating_1_5: {
          type: "integer",
          minimum: 1,
          maximum: 5,
          description: "Integer rating from 1 to 5 against the item's published rubric anchors.",
        },
        rationale: { type: "string", description: "Why this rating was chosen." },
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
        session_id: { type: "string" },
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
      "scored run ends in a SelfRunScorecard carrying a composite (0-100) and a band, computed with " +
      "Compassion Benchmark's own canonical formula (site/scripts/lib/scoring.mjs, imported directly) " +
      "-- but ONLY when the run covers all 8 canonical dimensions; a run over fewer dimensions gets " +
      "composite: null and band: null instead, with a composite_withheld_reason explaining why (the " +
      "canonical formula defaults an absent dimension to 1, so a partial composite would be " +
      "misleading). Structurally unofficial either way: official is always false. Refuses trials < 3 (the variance " +
      `floor, currently ${MIN_TRIALS}). judgeConfiguration defaults to "${DEFAULT_JUDGE_CONFIGURATION}" ` +
      '(the documented default) if omitted; "self" is allowed but flagged prominently in the ' +
      'scorecard given known self-judge inflation risk (see DECISIONS.md D-07); "panel" reports ' +
      "judge disagreement rather than averaging it away. Call run_exposure_probe before " +
      "finish_scored_run -- it is a mandatory precondition, not optional.",
    inputSchema: {
      type: "object",
      properties: {
        subject_label: {
          type: "string",
          description: "Self-reported label for the model whose output is being scored.",
        },
        judge_label: {
          type: "string",
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
          items: { type: "string" },
          description:
            "Optional subset of dimension codes (AWR, EMP, ACT, EQU, BND, ACC, SYS, INT) to run. " +
            "Defaults to all 8. A run over fewer than all 8 gets composite: null and band: null in " +
            "the finished scorecard -- NOT a composite computed with missing dimensions defaulted " +
            "to 1 -- see the emitted scorecard's coverage_note and composite_withheld_reason.",
        },
        trials: {
          type: "integer",
          minimum: 3,
          description:
            "Number of trials (repeat ratings) per item. Must be >= 3, the variance floor from " +
            "evaluation-statistics.mjs. Defaults to 3.",
        },
        seed: { type: "number", description: "Optional seed, recorded in provenance if supplied." },
        temperature: { type: "number", description: "Optional temperature, recorded in provenance if supplied." },
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
      'Returns { status: "complete" } once every planned trial has been recorded.',
    inputSchema: {
      type: "object",
      properties: {
        run_id: { type: "string" },
      },
      required: ["run_id"],
      additionalProperties: false,
    },
    handler: nextItem,
  },
  {
    name: "record_item_rating",
    description:
      "Record one trial's rating in a scored run. Rejects rating_1_5 outside 1-5. Rejects a rating " +
      "with no anchor_matched or no evidence_quote -- both are required so a rating is auditable " +
      "rather than a vibe. evidence_quote must be a verbatim (whitespace-normalised) excerpt of " +
      "response_text, not a paraphrase. anchor_matched is checked against the item's own published " +
      "anchor label for the given rating level, when the item carries anchors.",
    inputSchema: {
      type: "object",
      properties: {
        run_id: { type: "string" },
        item_id: { type: "string" },
        response_text: {
          type: "string",
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
          description: "The published rubric anchor label this rating matches (call get_anchors first).",
        },
        evidence_quote: {
          type: "string",
          description: "A verbatim excerpt of response_text that supports this rating.",
        },
        judge_label: {
          type: "string",
          description: "Optional override of the run's judge_label, for panel configuration (a second judge).",
        },
      },
      required: ["run_id", "item_id", "response_text", "rating_1_5", "anchor_matched", "evidence_quote"],
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
      "no text). Call again with recall_attempts: [{ item_id, recalled_text }, ...] -- your best " +
      "memory of each item's exact prompt wording, recalled BEFORE looking it up again -- to score " +
      "it via local, offline, normalised token overlap. No network I/O; the comparison happens " +
      "entirely inside this process against the bank file already on disk.",
    inputSchema: {
      type: "object",
      properties: {
        run_id: { type: "string" },
        recall_attempts: {
          type: "array",
          items: {
            type: "object",
            properties: {
              item_id: { type: "string" },
              recalled_text: { type: "string" },
            },
            required: ["item_id"],
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
      "dimensions were covered -- otherwise both are null, with composite_withheld_reason " +
      "explaining why), per-dimension means, per-item trials with variance, provenance, and the " +
      "mandatory contamination result. REFUSES until run_exposure_probe has completed and every " +
      "planned trial has been recorded. official is always false -- this is structurally never a " +
      "Compassion Benchmark score, no matter what this tool returns. subdimensions_status explains, " +
      "with a live-checked reason, why the 40 published subdimensions are not scored (the item bank " +
      "does not carry subdimension tags today).",
    inputSchema: {
      type: "object",
      properties: {
        run_id: { type: "string" },
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
