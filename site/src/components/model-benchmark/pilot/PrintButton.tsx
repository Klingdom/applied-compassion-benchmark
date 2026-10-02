"use client";

/** Print or save as PDF. window.print() only; no server, no tracking of the reader. */
export default function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="pilot-print-btn">
      Print or save as PDF
    </button>
  );
}
