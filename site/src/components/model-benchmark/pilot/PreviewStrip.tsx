/**
 * PreviewStrip: shown only when a PROPOSED (not ratified) wave renders because
 * CB_PREVIEW_PILOT_REPORTS=1 is set. It exists so a founder-review build can
 * never be mistaken for a published page. Never rendered in the default build.
 */
export default function PreviewStrip({ decisionRef }: { decisionRef: string }) {
  return (
    <div role="note" className="pilot-preview">
      <strong>PREVIEW &mdash; not approved for publication.</strong> This page renders only because the local review flag is set;{" "}
      {decisionRef} is proposed, not ratified. Do not deploy this build.
    </div>
  );
}
