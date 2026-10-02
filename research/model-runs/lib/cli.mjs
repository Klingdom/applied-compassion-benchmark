// research/model-runs/lib/cli.mjs -- argument parsing and the one error policy shared by the four bins.

import { parseArgs } from "node:util";
import path from "node:path";
import { MODEL_RUNS_ROOT, HarnessError, assertRunId } from "./common.mjs";

export function parse(options, argv = process.argv.slice(2)) {
  try {
    return parseArgs({ args: argv, options, strict: true, allowPositionals: false }).values;
  } catch (e) {
    console.error(`REFUSED: ${e.message}`);
    process.exit(2);
  }
}

/** research/model-runs/<run-id>, unless --run-root overrides it (used by tests and scratch runs). */
export function runRoot(values) {
  assertRunId(values["run-id"]);
  return path.resolve(values["run-root"] ?? path.join(MODEL_RUNS_ROOT, values["run-id"]));
}

export function main(fn) {
  try {
    const code = fn();
    if (typeof code === "number") process.exitCode = code;
  } catch (e) {
    if (e instanceof HarnessError) {
      console.error(e.message.startsWith("REFUSED") ? e.message : `REFUSED: ${e.message}`);
      process.exitCode = 1;
      return;
    }
    throw e;
  }
}
