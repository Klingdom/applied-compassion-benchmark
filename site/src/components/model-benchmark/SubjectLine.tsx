/**
 * SubjectLine — the fixed "Three Objects" disambiguation device.
 *
 * Compassion Benchmark scores three different things and must never let a
 * reader conflate them: an organization (AI Labs Index), a frozen model
 * snapshot's behavior (Model Index — this component's context), and a
 * shipped, configured product (Deployed AI Audit, not yet published).
 *
 * Rendered identically on every Model Index page so the reader learns to
 * recognize the shape and, after a couple of exposures, reads only the
 * object slot. Positive statement first, then both other objects named —
 * never pure negation. See DECISIONS.md D-29.
 */

export default function SubjectLine() {
  return (
    <p className="text-[0.92rem] text-muted leading-relaxed border border-line rounded-[14px] bg-[rgba(255,255,255,0.02)] px-4 py-3.5">
      <span className="text-text font-semibold">
        This page scores the Model Index
      </span>{" "}
      — how Compassion Benchmark evaluates what a specific, frozen AI model
      snapshot does when tested against a published task bank. It does not
      score{" "}
      <span className="text-text font-medium">AI Labs</span> (the
      organizations that build models — see the AI Labs Index), or the{" "}
      <span className="text-text font-medium">Deployed AI Audit</span> (a
      product as shipped and configured for real users — not yet a published
      product on this site).
    </p>
  );
}
