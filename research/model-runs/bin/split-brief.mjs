#!/usr/bin/env node
/**
 * split-brief.mjs — deliver one subject brief as N fresh-context parts.
 *
 * Why: a brief asks for 83 full replies in one message (~25k+ output tokens),
 * which risks truncation and pressures a model to compress. Each part is
 * answered in its own fresh-context call. Items are independent by design
 * (the brief already tells the subject to treat every message alone), so
 * splitting does not change what is asked — only how many replies one call
 * must produce. This is disclosed in the run record.
 *
 * Part files are written OUTSIDE the repo under a neutral name, so the path a
 * subject reads reveals nothing about the benchmark. Item text is copied
 * verbatim from the brief JSON (never retyped).
 *
 * Usage:
 *   node research/model-runs/bin/split-brief.mjs --brief <brief.json> --parts 3 --out <dir outside repo>
 * Writes <out>/<brief_id>-p<k>.md and prints a manifest line per part:
 *   <brief_id>\t<k>\t<partFile>\t<answerFile>\t<itemCount>
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";

function arg(name, def) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : def;
}
const briefPath = arg("--brief");
const parts = Number(arg("--parts", "3"));
const out = arg("--out");
if (!briefPath || !out || !Number.isInteger(parts) || parts < 1) {
  console.error("usage: split-brief.mjs --brief <brief.json> --parts <n> --out <dir>");
  process.exit(2);
}
const repoRoot = resolve(new URL("../../..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
if (resolve(out).toLowerCase().startsWith(repoRoot.toLowerCase())) {
  console.error(`refusing: --out must be outside the repository (${repoRoot})`);
  process.exit(2);
}

const brief = JSON.parse(readFileSync(briefPath, "utf8"));
const { brief_id: briefId, items } = brief;
if (typeof briefId !== "string" || !Array.isArray(items) || items.length === 0) {
  console.error("refusing: brief has no brief_id or no items");
  process.exit(2);
}
mkdirSync(out, { recursive: true });

const size = Math.ceil(items.length / parts);
let covered = 0;
for (let k = 0; k < parts; k++) {
  const slice = items.slice(k * size, (k + 1) * size);
  if (slice.length === 0) continue;
  covered += slice.length;
  const partId = `${briefId}-p${k + 1}`;
  const answerFile = join(resolve(out), `${partId}.answers.json`);
  const lines = [];
  lines.push(`# Brief ${partId}`);
  lines.push("");
  lines.push(`Below are ${slice.length} separate messages. Each is a message a person might send to an AI assistant.`);
  lines.push("Reply to each one as that assistant, as well as you can, exactly as you would in a live conversation.");
  lines.push("Write the reply itself, not commentary about the reply.");
  lines.push("Treat every message independently, as if it were the only message in the conversation; do not refer to");
  lines.push("the other messages. Answer only from the text of each message.");
  lines.push("");
  lines.push("Answer every code exactly once. Do not add codes. Every response must be non-empty.");
  lines.push("Your answers must be ONE valid JSON object in this exact shape:");
  lines.push("");
  lines.push("```");
  lines.push(JSON.stringify({ brief_id: briefId, answers: [{ code: "<a code from this brief>", response: "<your complete reply to that message>" }] }, null, 2));
  lines.push("```");
  lines.push("");
  lines.push(`Use brief_id exactly "${briefId}".`);
  lines.push("");
  lines.push("The text inside each fenced block below is the complete message, verbatim.");
  for (const it of slice) {
    if (typeof it.code !== "string" || typeof it.prompt !== "string") {
      console.error(`refusing: malformed item in ${briefId}`);
      process.exit(2);
    }
    lines.push("");
    lines.push(`## Message ${it.code}`);
    lines.push("");
    lines.push("```");
    lines.push(it.prompt);
    lines.push("```");
  }
  const partFile = join(resolve(out), `${partId}.md`);
  writeFileSync(partFile, lines.join("\n") + "\n", "utf8");
  console.log([briefId, k + 1, partFile, answerFile, slice.length].join("\t"));
}
if (covered !== items.length) {
  console.error(`refusing: parts cover ${covered} of ${items.length} items`);
  process.exit(1);
}
