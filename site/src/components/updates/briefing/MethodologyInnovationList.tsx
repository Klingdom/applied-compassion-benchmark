/* eslint-disable @typescript-eslint/no-explicit-any */
import Container from "@/components/ui/Container";
import TrackedEntityLink from "@/components/updates/TrackedEntityLink";
import { entityHref } from "@/lib/entityHref";

interface Props {
  updates: any;
}

function truncateDefinition(definition: string, maxSentences = 2): string {
  const sentences = definition.split(/(?<=[.!?])\s+/);
  return sentences.slice(0, maxSentences).join(" ");
}

/**
 * MethodologyInnovationList - collapsible cards for new conduct categories.
 *
 * Uses native <details> for accordion behavior (no JS client component needed).
 * Hidden when newConductCategories is absent or empty.
 */
export default function MethodologyInnovationList({ updates }: Props) {
  const items: any[] = Array.isArray(updates.newConductCategories)
    ? updates.newConductCategories
    : [];

  if (items.length === 0) return null;

  return (
    <section
      id="methodology-innovations"
      className="py-[30px] scroll-mt-24"
      aria-label="New methodology conduct categories"
    >
      <Container>
        <div className="mb-4">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span
              className="inline-block w-2 h-2 rounded-full bg-[#a78bfa]"
              aria-hidden="true"
            />
            <span className="text-[0.78rem] uppercase tracking-[0.14em] text-[#a78bfa] font-bold">
              Methodology innovation
            </span>
            <span className="text-muted text-[0.78rem]" aria-hidden="true">·</span>
            <span className="text-muted text-[0.82rem]">
              {items.length} new conduct{" "}
              {items.length === 1 ? "category" : "categories"}
            </span>
          </div>
          <h2 className="text-[1.25rem] font-bold mb-1">
            New analytical categories
          </h2>
          <p className="text-muted text-[0.88rem] max-w-2xl">
            The ACB framework is extended when conduct patterns appear that existing categories cannot capture. Each new category is dated and tied to its first-application entity, creating an auditable record of framework evolution.
          </p>
        </div>

        <div className="space-y-3">
          {items.map((cat: any, i: number) => {
            const href =
              cat.index && cat.slug ? entityHref(cat.index, cat.slug) : null;
            const definition: string = cat.definition ?? "";
            const collapsed = truncateDefinition(definition, 2);
            const hasMore = definition.length > collapsed.length + 5;

            return (
              <details
                key={`${cat.name ?? i}-${i}`}
                className="group rounded-[14px] border border-[rgba(167,139,250,0.22)] bg-[rgba(167,139,250,0.04)] overflow-hidden"
              >
                <summary className="flex items-start justify-between gap-4 p-4 cursor-pointer list-none">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      {cat.anchorTier && (
                        <span className="text-[0.66rem] font-bold uppercase tracking-wider text-[#a78bfa] px-1.5 py-0.5 rounded border border-[rgba(167,139,250,0.32)] bg-[rgba(167,139,250,0.08)]">
                          {cat.anchorTier}
                        </span>
                      )}
                      {cat.reviewRequired && (
                        <span className="text-[0.66rem] font-bold uppercase tracking-wider text-[#fcd34d] px-1.5 py-0.5 rounded border border-[rgba(252,211,77,0.32)] bg-[rgba(252,211,77,0.08)]">
                          Review required
                        </span>
                      )}
                      {!cat.formalized && (
                        <span className="text-[0.66rem] font-bold uppercase tracking-wider text-muted px-1.5 py-0.5 rounded border border-line">
                          Draft
                        </span>
                      )}
                    </div>
                    <h3 className="text-[0.95rem] font-bold font-mono text-text leading-snug">
                      {cat.name}
                    </h3>
                  </div>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                    className="shrink-0 mt-1 text-muted group-open:rotate-180 transition-transform"
                  >
                    <path
                      d="M4 6l4 4 4-4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </summary>

                <div className="px-4 pb-4 pt-0">
                  {/* Collapsed definition (always shown) */}
                  <p className="text-[0.88rem] text-muted leading-relaxed mb-3">
                    {hasMore ? collapsed + " ..." : definition}
                  </p>

                  {/* Full definition in details open state */}
                  {hasMore && (
                    <div className="hidden group-open:block mb-3">
                      <p className="text-[0.88rem] text-muted leading-relaxed">
                        {definition}
                      </p>
                    </div>
                  )}

                  {/* Metadata row */}
                  <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-[rgba(255,255,255,0.06)] text-[0.78rem] text-muted">
                    {/* First application entity */}
                    {(cat.entity ?? cat.firstApplicationEntity) && (
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold uppercase tracking-widest text-[0.66rem]">
                          First applied to
                        </span>
                        {href ? (
                          <TrackedEntityLink
                            href={href}
                            slug={cat.slug}
                            index={cat.index}
                            source="methodologyInnovation"
                            className="font-semibold text-text hover:text-accent transition-colors capitalize"
                          >
                            {(cat.entity ?? cat.firstApplicationEntity).replace(
                              /-/g,
                              " ",
                            )}
                          </TrackedEntityLink>
                        ) : (
                          <span className="font-semibold text-text capitalize">
                            {(cat.entity ?? cat.firstApplicationEntity).replace(
                              /-/g,
                              " ",
                            )}
                          </span>
                        )}
                      </div>
                    )}

                    {cat.date && (
                      <span>
                        <span className="font-bold uppercase tracking-widest text-[0.66rem] mr-1.5">
                          Dated
                        </span>
                        <time dateTime={cat.date}>{cat.date}</time>
                      </span>
                    )}

                    {cat.anchorTier && (
                      <span>
                        <span className="font-bold uppercase tracking-widest text-[0.66rem] mr-1.5">
                          Anchor tier
                        </span>
                        {cat.anchorTier}
                      </span>
                    )}
                  </div>
                </div>
              </details>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
