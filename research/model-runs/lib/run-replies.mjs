// Load every saved reply of a finished explicit-judge-set run, tied to the judge key's response ids.
// Two on-disk layouts exist: subject-answers/records/<variant>/<item>__t<N>.json (arms runs, pilot-2026-10-03) and
// subject-answers/<subject>-trial-<N>.answers.json (pilot-2026-10-02). Each reply is checked against the key's
// response_sha256, so a scan can never run over text that is not the text the judges saw.
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const sha256 = (s) => createHash("sha256").update(s).digest("hex");

/** @returns {{subject:string,item_id:string,trial:number,response_id:string,response:string}[]} in key order */
export function loadRunReplies(runDir, judgeKey) {
  const base = join(runDir, "subject-answers");
  const found = new Map();
  const recordsDir = join(base, "records");
  if (existsSync(recordsDir)) {
    for (const v of readdirSync(recordsDir)) {
      for (const f of readdirSync(join(recordsDir, v)).filter((x) => x.endsWith(".json"))) {
        const rec = JSON.parse(readFileSync(join(recordsDir, v, f), "utf8"));
        found.set(`${rec.subject}|${rec.item_id}|${rec.trial}`, rec.response);
      }
    }
  } else {
    const byCode = new Map(judgeKey.responses.map((r) => [`${r.subject}|${r.trial}|${r.code}`, r]));
    for (const f of readdirSync(base)) {
      const m = /^(.*)-trial-(\d+)[.]answers[.]json$/.exec(f);
      if (!m) continue;
      for (const x of JSON.parse(readFileSync(join(base, f), "utf8")).answers) {
        const k = byCode.get(`${m[1]}|${Number(m[2])}|${x.code}`);
        if (!k) throw new Error(`${f}: code ${x.code} is not in the judge key`);
        found.set(`${k.subject}|${k.item_id}|${k.trial}`, x.response);
      }
    }
  }
  return judgeKey.responses.map((k) => {
    const response = found.get(`${k.subject}|${k.item_id}|${k.trial}`);
    if (typeof response !== "string") throw new Error(`no saved reply for ${k.subject} ${k.item_id} trial ${k.trial}`);
    if (sha256(response) !== k.response_sha256) throw new Error(`saved reply for ${k.subject} ${k.item_id} trial ${k.trial} does not match the key's response_sha256`);
    return { subject: k.subject, item_id: k.item_id, trial: k.trial, response_id: k.response_id, response };
  });
}
