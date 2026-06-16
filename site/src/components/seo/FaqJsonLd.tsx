/**
 * FaqJsonLd — schema.org FAQPage structured data.
 *
 * Mirrors the DatasetJsonLd / BreadcrumbJsonLd pattern: emits a single
 * <script type="application/ld+json"> from a typed prop array.
 *
 * Anti-fabrication contract: callers MUST derive every question/answer from
 * real, rendered page data. Never pass invented or synthesised text.
 * Google requires FAQ content to be visibly present on the page — callers
 * should render the same Q&A in an accessible visible block alongside this
 * component (FaqAccordion).
 */

export type FaqItem = {
  question: string;
  answer: string;
};

type Props = {
  items: FaqItem[];
};

export default function FaqJsonLd({ items }: Props) {
  if (items.length === 0) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
