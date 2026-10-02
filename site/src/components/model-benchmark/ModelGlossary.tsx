/**
 * ModelGlossary — "Terms used on this page", collapsed by default.
 *
 * Only terms the Model Index pages actually use. The Draft / Scorable /
 * Validated definitions are the single item-status vocabulary; they match the
 * comment on isValidatedStatus in lib/model-index-facts.ts, and page copy must
 * use these words in these senses and no others.
 */

const TERMS: { term: string; definition: string }[] = [
  { term: "Item", definition: "One situation given to a model, plus its rubric." },
  { term: "Anchor", definition: "One of the five level descriptions a response is rated against." },
  {
    term: "Snapshot",
    definition: "One exact, dated version of a model. Names get reused; snapshots do not.",
  },
  { term: "Composite", definition: "The 0–100 number computed from the dimension scores." },
  { term: "Band", definition: "The named range a composite falls in." },
  {
    term: "Public pool",
    definition: "Items published with their rubrics. Usable for transparency, not for blinded comparison.",
  },
  {
    term: "Contamination",
    definition: "A model having seen the items or their rubrics, so its score partly reflects memory.",
  },
  { term: "Draft", definition: "An item that is authored but never reviewed. Not scored." },
  {
    term: "Scorable",
    definition: "An item that is not a draft. Used in runs, but not yet validated.",
  },
  {
    term: "Validated",
    definition: "An item with two independent human reviews and no unresolved dispute.",
  },
];

export default function ModelGlossary() {
  return (
    <details className="border border-line rounded-[14px] px-4 py-3 max-w-[900px]">
      <summary className="cursor-pointer text-[0.95rem] text-text font-medium">Terms used on this page</summary>
      <dl className="mt-3 grid gap-x-4 gap-y-2 text-[0.9rem] [grid-template-columns:1fr] sm:[grid-template-columns:max-content_1fr]">
        {TERMS.map((t) => (
          <div key={t.term} className="contents">
            <dt className="text-text font-medium">{t.term}</dt>
            <dd className="text-muted">{t.definition}</dd>
          </div>
        ))}
      </dl>
    </details>
  );
}
