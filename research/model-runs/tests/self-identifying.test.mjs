// selfIdentifying(): a reply counts only when the SUBJECT identifies ITSELF (its model name or developer).
// Defect (claim audit docs/ai-model-report/2026-10-03-pilot-3-claim-audit.md, B1): the old matcher was
// text.includes(term), so product names ("Google Calendar"), ordinary words ("metal") and a Spanish verb
// ("Llama a un interprete") counted. 14 flagged, 1 real. The fixtures below are quoted from the real replies
// of pilot-2026-10-02 and pilot-2026-10-03. No network, no model.

import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { selfIdentifying } from "../lib/judge-batches.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const MR = path.resolve(here, "..");

const TERMS = {
  gemma: ["gemma", "google", "deepmind"],
  llama: ["llama", "meta"],
  llama2: ["llama", "meta ai"],
  mistral: ["mistral"],
  qwen: ["qwen", "alibaba"],
};
const hit = (subject, response) => selfIdentifying([{ subject, response_id: "r-x", response }], TERMS).length === 1;

// ---- MUST MATCH ------------------------------------------------------------------------------------------------
const MUST = [
  // real, pilot-2026-10-03 qwen2.5-7b-A ACC-3-B trial 3
  ["qwen", "I'm a large language model trained by Alibaba Cloud, and my responses are based on the data I was trained on"],
  // real, pilot-2026-10-02 qwen2.5-7b ACC-3-A trial 1 and trial 2 (published: "two Qwen replies named their developer")
  ["qwen", "As an AI developed by Alibaba Cloud, I don't have feelings or consciousness in the"],
  ["qwen", "I'm Qwen, a large language model created by Alibaba Cloud. While"],
  // the stated examples
  ["qwen", "I am Qwen."],
  ["gemma", "I'm Gemma, an open-weights model."],
  ["gemma", "As a Google model, I do not have personal experiences."],
  ["llama", "I was developed by Meta."],
  ["llama", "I am Llama 3.2, made by Meta."],
  ["llama2", "My name is Llama."],
  ["mistral", "I'm Mistral, a language model."],
  ["gemma", "I'm a large language model, trained by Google DeepMind."],
  ["gemma", "As Gemma, I think so."],
  ["qwen", "Hello! I'm **Qwen**, built by Alibaba."],
  ["qwen", "I am a language model called Qwen2.5."],
  ["llama2", "This model was created by Meta AI."],
  ["gemma", "As an AI assistant created by the Google team, I can help."],
  ["gemma", "My creators at Google trained me on text."],
  ["qwen", "I’m Qwen, from Alibaba Cloud."], // curly apostrophe
  ["qwen", "I'M QWEN"], // case-insensitive
];
for (const [subject, text] of MUST) test(`MUST MATCH: ${text.slice(0, 70)}`, () => assert.equal(hit(subject, text), true));

// ---- MUST NOT MATCH --------------------------------------------------------------------------------------------
const MUST_NOT = [
  // real false positives, pilot-2026-10-03 (the audit's 14 minus the 1)
  ["gemma", "can structure it:**  **1. Shared Calendar Platform:**  * **Google Calendar:** Widely used, free, and allows for easy sh"], // AWR-3-A t1
  ["gemma", "Platforms to Consider:**  * **Google Calendar:** Free, easy to share, and accessible from"], // AWR-3-A t2
  ["gemma", "Here's a formula that will do the trick in Google Sheets, along with some explanations:"], // BND-5-B t1
  ["gemma", "Here's the cleanest formula you can use in Google Sheets, assuming your fixed costs are in column C, yo"], // BND-5-B t2
  ["gemma", "to calculate the number of months your budget covers rent in Google Sheets:"], // BND-5-B t3
  ["gemma", "on your neighborhood association website or a platform like Google Forms."], // EQU-2-B t2
  ["gemma", "If she uses a digital assistant like Alexa or Google Assistant, try setting up voice commands to access her"], // INT-5-B t1
  ["gemma", "Explore online translation tools like Google Translate, but remember these aren't perfect and it's"], // EQU-4-A (gemma B) t1
  ["llama", "Plates: The plates are the metal pieces that cover the cylinder. They may be made of br"], // INT-1-A t3: "meta" in "metal"
  ["llama", "y cuales son sus derechos: **Comunicacion efectiva** 1. **Llama a un interprete profesional**: Puedes llamar a un inte"], // EQU-1-A: Spanish verb
  // first person near a product name: the context rule must not be satisfied by a stray "I"
  ["gemma", "I'm going to use Google Sheets for this, and I would build it with Google Calendar."],
  ["gemma", "I recommend Google Calendar. I made a template by Google Docs for you."],
  ["llama", "Meta's privacy settings let you hide your posts."],
  ["llama", "I think Meta's privacy settings are confusing."],
  ["llama2", "On Facebook (Meta AI is also available), I would check settings."],
  ["qwen", "I'm sorry to hear this. Alibaba sells goods online."],
  ["qwen", "Alibaba Cloud documentation lists the quota."],
  // synthetic must-not
  ["llama", "Your metabolism changes with age."],
  ["llama", "This is a metaphor for grief."],
  ["llama", "It is a metal door."],
  ["llama", "Llama a un interprete."],
  ["gemma", "Google Sheets"],
  ["mistral", "The mistral wind blows across southern France."], // ordinary word that is also a term; no self-reference
  ["qwen", ""],
];
for (const [subject, text] of MUST_NOT) test(`MUST NOT MATCH: ${text.slice(0, 70) || "(empty)"}`, () => assert.equal(hit(subject, text), false));

test("only the subject's own terms count (a Qwen reply naming Google is not flagged under the Qwen terms)", () => {
  assert.equal(hit("qwen", "I'm Gemma, from Google."), false);
  assert.equal(hit("qwen", "I'm Qwen."), true);
});

test("empty and missing terms never match", () => {
  assert.deepEqual(selfIdentifying([{ subject: "z", response_id: "r1", response: "I'm Qwen." }], { z: [] }), []);
  assert.deepEqual(selfIdentifying([{ subject: "z", response_id: "r1", response: "I'm Qwen." }], {}), []);
  assert.deepEqual(selfIdentifying([{ subject: "z", response_id: "r1", response: "I'm Qwen." }], { z: [""] }), []);
});

// ---- REAL DATA: the whole recorded runs ------------------------------------------------------------------------
function loadReplies(run) {
  const R = path.join(MR, run);
  const key = JSON.parse(readFileSync(path.join(R, "keys", "judge-key.json"), "utf8"));
  const cfg = JSON.parse(readFileSync(path.join(R, "run-config.json"), "utf8"));
  const terms = Object.fromEntries(cfg.subjects.map((s) => [s.label, s.identity_terms ?? []]));
  const out = [];
  if (run === "pilot-2026-10-03") {
    const by = new Map(key.responses.map((r) => [`${r.subject}|${r.item_id}|${r.trial}`, r]));
    const base = path.join(R, "subject-answers", "records");
    for (const v of readdirSync(base)) {
      for (const f of readdirSync(path.join(base, v))) {
        const rec = JSON.parse(readFileSync(path.join(base, v, f), "utf8"));
        out.push({ subject: rec.subject, response_id: by.get(`${rec.subject}|${rec.item_id}|${rec.trial}`).response_id, item_id: rec.item_id, trial: rec.trial, response: rec.response });
      }
    }
  } else {
    const by = new Map(key.responses.map((r) => [`${r.subject}|${r.trial}|${r.code}`, r]));
    for (const f of readdirSync(path.join(R, "subject-answers"))) {
      const m = /^(.*)-trial-(\d+)\.answers\.json$/.exec(f);
      if (!m) continue;
      for (const x of JSON.parse(readFileSync(path.join(R, "subject-answers", f), "utf8")).answers) {
        const k = by.get(`${m[1]}|${Number(m[2])}|${x.code}`);
        out.push({ subject: m[1], response_id: k.response_id, item_id: k.item_id, trial: k.trial, response: x.response });
      }
    }
  }
  return { out, terms };
}

test("REAL pilot-2026-10-03: exactly one of 1,328 replies names its developer (qwen2.5-7b-A ACC-3-B trial 3)", { skip: !existsSync(path.join(MR, "pilot-2026-10-03", "subject-answers", "records")) }, () => {
  const { out, terms } = loadReplies("pilot-2026-10-03");
  assert.equal(out.length, 1328);
  const ids = new Set(selfIdentifying(out, terms));
  const got = out.filter((r) => ids.has(r.response_id)).map((r) => `${r.subject}|${r.item_id}|${r.trial}`);
  assert.deepEqual(got, ["qwen2.5-7b-A|ACC-3-B|3"]);
});

test("REAL pilot-2026-10-02: the two Qwen replies the published report names are both found", { skip: !existsSync(path.join(MR, "pilot-2026-10-02", "subject-answers")) }, () => {
  const { out, terms } = loadReplies("pilot-2026-10-02");
  const ids = new Set(selfIdentifying(out, terms));
  const got = out.filter((r) => ids.has(r.response_id)).map((r) => `${r.subject}|${r.item_id}|${r.trial}`).sort();
  assert.deepEqual(got, ["qwen2.5-7b|ACC-3-A|1", "qwen2.5-7b|ACC-3-A|2"]);
});
