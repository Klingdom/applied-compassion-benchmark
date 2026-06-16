/**
 * FaqAccordion — visible, accessible FAQ section that mirrors FaqJsonLd.
 *
 * Google's FAQ rich-result policy requires that the question/answer text
 * be visibly present on the page (not only in JSON-LD). This component
 * renders the same items as a native <details>/<summary> list so the
 * content is visible to users and crawlable without JavaScript.
 *
 * Always render FaqAccordion alongside FaqJsonLd with identical items.
 */

import type { FaqItem } from "./FaqJsonLd";

type Props = {
  items: FaqItem[];
  /** Section heading label. Defaults to "Frequently asked questions". */
  heading?: string;
};

export default function FaqAccordion({
  items,
  heading = "Frequently asked questions",
}: Props) {
  if (items.length === 0) return null;

  return (
    <section aria-label={heading} className="py-8 sm:py-10 border-t border-line">
      <h2 className="text-[0.82rem] uppercase tracking-[0.12em] text-muted mb-4 font-semibold px-0">
        {heading}
      </h2>
      <div className="space-y-2">
        {items.map((item, i) => (
          <details
            key={i}
            className="group border border-line rounded-[10px] bg-[rgba(255,255,255,0.02)] overflow-hidden"
          >
            <summary className={[
              "cursor-pointer select-none px-4 py-3",
              "flex items-center gap-2",
              "text-[0.9rem] font-medium text-text hover:text-[#7dd3fc] transition-colors",
              "list-none [&::-webkit-details-marker]:hidden",
            ].join(" ")}>
              {/* Chevron arrow */}
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden="true"
                className="transition-transform group-open:rotate-90 shrink-0 text-muted"
              >
                <path
                  d="M4 2l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {item.question}
            </summary>
            <div className="px-4 pb-4 pt-1 text-[0.88rem] text-muted leading-relaxed">
              {item.answer}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
