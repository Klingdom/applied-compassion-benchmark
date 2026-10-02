#!/usr/bin/env node
/**
 * split-judge-batch.mjs — re-deliver one judge batch as smaller fresh-context halves.
 *
 * Why: on pilot-2026-10-01 the claude-haiku judge repeatedly returned fewer
 * ratings than entries (12-15 of 15-16), even when told the exact count. The
 * fix is to remove the cause (load per call), not to keep re-sampling.
 *
 *   split:  node split-judge-batch.mjs split --batch <judge-batches/X.json> --parts 2 --out <dir outside repo> --name <jbNNN>
 *           writes <out>/<name>h<k>.md (rendered by the harness's own renderBatchMarkdown)
 *           and <out>/<name>h<k>.json (the sub-batch, for merge-time checking)
 *   merge:  node split-judge-batch.mjs merge --batch <judge-batches/X.json> --dir <out> --name <jbNNN> --to <answers.json>
 *           concatenates <name>h<k>.answers.json ratings under the ORIGINAL batch_id, refusing
 *           unless every sub-batch is answered completely (every response_id exactly once).
 *
 * Sub-batch ids are <batch_id>-h<k>. Entries, instructions and anchors are copied
 * verbatim from the original batch object; nothing is retyped.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { renderBatchMarkdown } from "../lib/judge-batches.mjs";

const [mode] = process.argv.slice(2);
const arg = (n) => {
  const i = process.argv.indexOf(n);
  return i >= 0 ? process.argv[i + 1] : undefined;
};
const fail = (m) => {
  console.error(`refusing: ${m}`);
  process.exit(1);
};
const batch = JSON.parse(readFileSync(arg("--batch"), "utf8"));
const name = arg("--name");
if (!name) fail("--name required");

if (mode === "split") {
  const parts = Number(arg("--parts") ?? 2);
  const out = resolve(arg("--out"));
  const repo = resolve(new URL("../../..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
  if (out.toLowerCase().startsWith(repo.toLowerCase())) fail("--out must be outside the repository");
  const size = Math.ceil(batch.entries.length / parts);
  for (let k = 0; k < parts; k++) {
    const entries = batch.entries.slice(k * size, (k + 1) * size);
    if (!entries.length) continue;
    const sub = { ...batch, batch_id: `${batch.batch_id}-h${k + 1}`, entries };
    writeFileSync(join(out, `${name}h${k + 1}.json`), JSON.stringify(sub, null, 2) + "\n");
    writeFileSync(join(out, `${name}h${k + 1}.md`), renderBatchMarkdown(sub));
    console.log(`${name}h${k + 1}\t${entries.length} entries\t${sub.batch_id}`);
  }
} else if (mode === "merge") {
  const dir = resolve(arg("--dir"));
  const ratings = [];
  for (let k = 1; existsSync(join(dir, `${name}h${k}.json`)); k++) {
    const sub = JSON.parse(readFileSync(join(dir, `${name}h${k}.json`), "utf8"));
    const f = join(dir, `${name}h${k}.answers.json`);
    if (!existsSync(f)) fail(`${name}h${k}.answers.json missing`);
    const ans = JSON.parse(readFileSync(f, "utf8"));
    if (ans.batch_id !== sub.batch_id) fail(`${name}h${k} batch_id ${ans.batch_id} != ${sub.batch_id}`);
    const want = sub.entries.map((e) => e.response_id);
    const got = (ans.ratings ?? []).map((r) => r.response_id);
    const miss = want.filter((x) => !got.includes(x));
    const extra = got.filter((x) => !want.includes(x));
    if (miss.length || extra.length || got.length !== want.length)
      fail(`${name}h${k} want ${want.length} got ${got.length} missing ${miss.length} extra ${extra.length}`);
    ratings.push(...ans.ratings);
  }
  if (ratings.length !== batch.entries.length) fail(`merged ${ratings.length} of ${batch.entries.length}`);
  writeFileSync(arg("--to"), JSON.stringify({ batch_id: batch.batch_id, ratings }, null, 2) + "\n");
  console.log(`${name}: merged ${ratings.length} ratings under ${batch.batch_id}`);
} else fail("mode must be split or merge");
