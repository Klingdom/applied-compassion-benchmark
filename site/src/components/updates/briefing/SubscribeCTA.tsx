import Container from "@/components/ui/Container";
import NewsletterSignup from "@/components/ui/NewsletterSignup";

/**
 * SubscribeCTA - premium subscription block at the end of the briefing.
 * Reuses the existing NewsletterSignup form internals with an elevated visual treatment.
 */
export default function SubscribeCTA() {
  return (
    <section
      id="subscribe"
      className="py-[40px] scroll-mt-24"
      aria-label="Subscribe to weekly briefing"
    >
      <Container>
        <div className="rounded-[22px] border border-[rgba(125,211,252,0.22)] bg-gradient-to-b from-[rgba(125,211,252,0.07)] to-[rgba(125,211,252,0.02)] p-7 sm:p-10 shadow-[0_24px_60px_rgba(0,0,0,0.32)]">
          {/* Header */}
          <div className="max-w-xl mb-7">
            <div className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-[#7dd3fc] mb-3">
              Weekly score highlights
            </div>
            <h2 className="text-[1.6rem] sm:text-[2rem] font-bold leading-tight mb-3">
              Get the week&apos;s most consequential findings in one email.
            </h2>
            <p className="text-muted text-[0.97rem] leading-relaxed">
              Every Friday — a curated summary of the week&apos;s top score movements,
              sector findings, and evidence-linked analysis across governments,
              corporations, AI labs, and conflict actors. Daily briefings publish
              here on the site; the Friday email brings the week&apos;s highlights to
              your inbox.
            </p>
          </div>

          {/* Form — reuses existing NewsletterSignup card internals */}
          <div className="max-w-lg">
            <NewsletterSignup variant="inline" source="updates-subscribe-cta" />
          </div>

          {/* Privacy reassurance */}
          <p className="text-[0.75rem] text-muted mt-4">
            No spam. No third-party sharing. Unsubscribe at any time.
          </p>
        </div>
      </Container>
    </section>
  );
}
