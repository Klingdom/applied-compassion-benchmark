/* eslint-disable @typescript-eslint/no-explicit-any */
import Container from "@/components/ui/Container";
import Band from "@/components/ui/Band";
import TrackedEntityLink from "@/components/updates/TrackedEntityLink";
import { entityHref } from "@/lib/entityHref";
import { normalizeBand, formatIndex, SEVERITY_COLORS, pickLeadSignal } from "./utils";

interface Props {
  updates: any;
}

export default function LeadSignalCard({ updates }: Props) {
  const topSignals: any[] = Array.isArray(updates.topSignals) ? updates.topSignals : [];
  const lead = pickLeadSignal(topSignals);
  if (!lead) return null;

  const severity: string = lead.severity ?? "medium";
  const color = SEVERITY_COLORS[severity] ?? "#94a3b8";
  const href = lead.index && lead.slug ? entityHref(lead.index, lead.slug) : null;
  const band = normalizeBand(lead.band ?? "");

  // Derive "what happened" from description, limited to the first 2 sentences
  const description: string = lead.description ?? "";
  const sentences = description.split(/(?<=[.!?])\s+/);
  const whatHappened = sentences.slice(0, 2).join(" ");
  const whyMatters = sentences.slice(2, 4).join(" ") || "";

  return (
    <section
      id="lead-signal"
      className="py-[30px] scroll-mt-24"
      aria-label="Lead signal"
    >
      <Container>
        <div className="mb-4 flex items-center gap-2">
          <span
            className="text-[0.7rem] font-bold uppercase tracking-[0.18em] px-2 py-0.5 rounded border"
            style={{
              color,
              borderColor: `${color}55`,
              background: `${color}14`,
            }}
          >
            Lead signal
          </span>
          {severity && (
            <span
              className="text-[0.7rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded border"
              style={{
                color,
                borderColor: `${color}44`,
                background: `${color}10`,
              }}
            >
              {severity}
            </span>
          )}
          {lead.actionType === "methodology-evolution" && (
            <span className="text-[0.7rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-[rgba(167,139,250,0.4)] bg-[rgba(167,139,250,0.1)] text-[#a78bfa]">
              Methodology evolution
            </span>
          )}
          {lead.actionType === "band-crossing-finding" && (
            <span className="text-[0.7rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-[rgba(251,146,60,0.4)] bg-[rgba(251,146,60,0.1)] text-[#fb923c]">
              Band crossing
            </span>
          )}
        </div>

        <article
          className="rounded-[22px] border p-6 sm:p-8"
          style={{
            borderColor: `${color}55`,
            background: `linear-gradient(160deg, ${color}12 0%, ${color}04 100%)`,
          }}
          aria-label={`Lead signal: ${lead.title}`}
        >
          <h2 className="text-[1.3rem] sm:text-[1.55rem] font-bold leading-snug mb-5">
            {href ? (
              <TrackedEntityLink
                href={href}
                slug={lead.slug}
                index={lead.index}
                source="topSignal"
                className="hover:text-accent transition-colors"
              >
                {lead.title}
              </TrackedEntityLink>
            ) : (
              lead.title
            )}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* What happened */}
            {whatHappened && (
              <div>
                <div className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-muted mb-2">
                  What happened
                </div>
                <p className="text-[0.95rem] text-text leading-relaxed">
                  {whatHappened}
                </p>
              </div>
            )}

            {/* Why it matters */}
            {whyMatters && (
              <div>
                <div className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-muted mb-2">
                  Why it matters
                </div>
                <p className="text-[0.95rem] text-muted leading-relaxed">
                  {whyMatters}
                </p>
              </div>
            )}
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[rgba(255,255,255,0.07)]">
            {lead.index && (
              <span className="text-[0.78rem] text-muted">
                {formatIndex(lead.index)}
              </span>
            )}
            {band && <Band level={band} />}
            {lead.confidence && (
              <span
                className="text-[0.75rem] font-semibold px-2 py-0.5 rounded border border-line text-muted"
                aria-label={`Confidence: ${lead.confidence}`}
              >
                {lead.confidence} confidence
              </span>
            )}
            {href && (
              <div className="ml-auto">
                <TrackedEntityLink
                  href={href}
                  slug={lead.slug}
                  index={lead.index}
                  source="topSignal"
                  className="inline-flex items-center gap-1.5 text-[0.82rem] font-semibold text-[#7dd3fc] hover:text-text transition-colors group"
                >
                  View entity profile
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 13 13"
                    fill="none"
                    aria-hidden="true"
                    className="group-hover:translate-x-0.5 transition-transform"
                  >
                    <path
                      d="M2.5 6.5h8M7 3l3.5 3.5L7 10"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </TrackedEntityLink>
              </div>
            )}
          </div>
        </article>
      </Container>
    </section>
  );
}
