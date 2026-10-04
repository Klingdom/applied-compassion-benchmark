// Self-identification detector (REPORTING ONLY, never blocking).
//
// WHAT IT IS FOR: find replies in which the SUBJECT identifies ITSELF, by model name or by developer ("I am Qwen",
// "trained by Alibaba Cloud", "As a Google model", "I'm Gemma", "developed by Meta"). Such a reply lets a judge infer
// the source, so blinding is weaker for it. It is NOT a scan for the word "google" or "meta": product mentions
// ("Google Calendar", "Meta's privacy settings") and ordinary words ("metal", Spanish "llama") must not count.
// History: the first matcher was text.includes(term); in pilot-2026-10-03 it flagged 14 replies, 1 genuine
// (docs/ai-model-report/2026-10-03-pilot-3-claim-audit.md, B1).
//
// RULE: a reply counts when, after normalisation, the subject's identity term occurs as a WHOLE WORD,
// case-insensitively, INSIDE one of the self-reference patterns below. Within a pattern only the listed filler
// words may sit between the parts, so a stray "I" in the same sentence ("I'm going to use Google Sheets") cannot
// satisfy it. No sentence punctuation is allowed inside a pattern except a comma.
//
// Normalisation: curly apostrophes become ', markdown emphasis and code marks (* _ `) are removed, whitespace runs
// become one space, comparison is case-insensitive (the "i" and "u" regex flags).
// Whole word: the term must not touch a letter, digit-leading letter or underscore on either side. A digit may follow
// ("Qwen2.5", "Gemma2", "Llama3.2"); a letter may not ("metal", "metabolism", "llamas" do not match "meta"/"llama").
//
// PATTERNS (T = the identity term; HEAD, FILL, GAP, PROV, ORG are defined below):
//   N1  HEAD-name:   (I am | I'm | I was | my name is | call me | I go by) FILL{0,3} T
//                    "I am Qwen", "I'm Gemma", "I'm a Gemma model", "my name is Llama", "I am a language model called Qwen2.5"
//                    (the last through N1b, GAP then "called|named")
//   N1b              (I am | I'm | I was) GAP{0,8} (called | named) T
//   N2  As-name:     as T , I        ("As Gemma, I ...")
//   N3  As-a-model:  as (a | an) T (model | assistant | AI | chatbot | LLM | language model)   ("As a Google model")
//   P1  Provenance:  (HEAD | this model | this assistant | this AI | as (a|an) AI | as (a|an) (language model | assistant | chatbot | LLM))
//                    GAP{0,8} PROV by ORG{0,3} T
//                    "I'm a large language model trained by Alibaba Cloud", "As an AI developed by Alibaba Cloud",
//                    "I was developed by Meta", "This model was created by Meta AI", "I am Llama 3.2, made by Meta"
//                    (the last also matches N1)
//   C1  Creators:    my (creators | developers | makers) (at | are | is | from)? ORG{0,3} T   ("My creators at Google")
//
// NOT MATCHED, on purpose (conservative): a first-person sentence that merely mentions a product ("I recommend Google
// Calendar"), a bare term ("Google Sheets", "Meta's privacy settings"), non-English self-statements ("Soy Qwen"),
// indirect forms ("the company that built me, Google"). Misses in these forms are possible; over-reporting was the defect.

const HEAD = "(?:i am|i'm|i was|my name is|call me|i go by)";
const SELF = `(?:${HEAD}|this (?:model|assistant|ai|chatbot)(?: is| was)?|as an? ai|as an? (?:language model|assistant|chatbot|llm|large language model))`;
const FILL = "(?:a|an|the|called|named|also|just|simply|now|currently|actually|open|open-source|open-weights|new)";
// GAP is deliberately NOT "any word": only the listed words (plus a version-like token such as "3.2") may sit between parts.
const GAP = "(?:(?:a|an|the|large|language|model|ai|assistant|chatbot|llm|open|source|open-source|open-weights|weights|text|based|that|who|which|was|were|is|am|being|been|originally|first|also|and|[0-9][0-9.]*)[ ,]+)";
const PROV = "(?:(?:developed|trained|created|built|made|designed|released|produced|fine-tuned|finetuned|open-sourced)(?: and (?:developed|trained|created|built|made|designed|released|produced|fine-tuned))?)";
const ORG = "(?:(?:the|a|an|team|teams|researchers|engineers|scientists|at|from|of|group|lab|labs|ai)[ ]+)";

const esc = (s) => s.replace(/[.*+?^${}()|[\]]/g, "\\$&").replace(/\s+/g, " ");

export function normaliseForIdentity(text) {
  return String(text)
    .replace(/[‘’ʼ]/g, "'")
    .replace(/[*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const cache = new Map();
function patternsFor(term) {
  if (cache.has(term)) return cache.get(term);
  const T = `(?<![\\p{L}\\p{N}_])${esc(term.toLowerCase())}(?![\\p{L}_])`;
  const src = {
    N1: `(?<![\\p{L}\\p{N}_])${HEAD}[ ]+(?:${FILL}[ ]+){0,3}${T}`,
    N1b: `(?<![\\p{L}\\p{N}_])(?:i am|i'm|i was)[ ]+${GAP}{0,8}(?:called|named)[ ]+${T}`,
    N2: `(?<![\\p{L}\\p{N}_])as[ ]+${T},?[ ]+i(?![\\p{L}\\p{N}_])`,
    N3: `(?<![\\p{L}\\p{N}_])as[ ]+an?[ ]+${T}[ ]+(?:language model|large language model|model|assistant|ai|chatbot|llm)(?![\\p{L}\\p{N}_])`,
    P1: `(?<![\\p{L}\\p{N}_])${SELF}[ ,]+${GAP}{0,8}${PROV}[ ]+by[ ]+${ORG}{0,3}${T}`,
    C1: `(?<![\\p{L}\\p{N}_])my (?:creators|developers|makers)[ ]+(?:(?:at|are|is|from)[ ]+)?${ORG}{0,3}${T}`,
  };
  const res = Object.entries(src).map(([name, s]) => [name, new RegExp(s, "iu")]);
  cache.set(term, res);
  return res;
}

/**
 * The first self-reference match for any of `terms` in `text`, as { term, pattern, snippet }, or null.
 * `terms` are the subject's identity_terms from run-config.json; empty terms are ignored.
 */
export function selfIdentificationMatch(text, terms) {
  const norm = normaliseForIdentity(text);
  for (const t of terms ?? []) {
    const term = String(t).trim();
    if (term.length === 0) continue;
    for (const [pattern, re] of patternsFor(term)) {
      const m = re.exec(norm);
      if (m) return { term, pattern, snippet: m[0] };
    }
  }
  return null;
}

export function namesItself(text, terms) {
  return selfIdentificationMatch(text, terms) !== null;
}
