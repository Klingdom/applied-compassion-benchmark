"use client";

import { useState, useCallback } from "react";

/**
 * Newsletter email signup with Formspree submission.
 *
 * Variants:
 *  - "inline" (default): compact horizontal layout for embedding in pages
 *  - "card": larger card-style layout for prominent placement
 *  - "footer": minimal single-line for the footer
 */

const FORMSPREE_ID = "xaqaeeez";

interface Props {
  variant?: "inline" | "card" | "footer";
  source?: string;
}

export default function NewsletterSignup({ variant = "inline", source = "unknown" }: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email.trim() || !email.includes("@")) return;
      setStatus("submitting");

      try {
        const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            email: email.trim(),
            source: `newsletter-${source}`,
            subscribed_at: new Date().toISOString(),
          }),
        });

        if (res.ok) {
          setStatus("success");
          // Store locally so we can suppress on revisits
          try { localStorage.setItem("cb_newsletter", email.trim()); } catch {}
        } else {
          setStatus("error");
        }
      } catch {
        setStatus("error");
      }
    },
    [email, source],
  );

  // ── Success state ──────────────────────────────────────────────
  if (status === "success") {
    if (variant === "footer") {
      return (
        <p className="text-[0.88rem] text-[#86efac]">
          Subscribed. Weekly briefing starts next Monday.
        </p>
      );
    }
    return (
      <div className={variant === "card" ? "rounded-[20px] border border-[rgba(134,239,172,0.25)] bg-[rgba(134,239,172,0.06)] p-6 text-center" : ""}>
        <p className="text-[#86efac] font-semibold mb-1">You&apos;re subscribed</p>
        <p className="text-muted text-[0.92rem]">
          The weekly benchmark briefing arrives every Monday with score changes, sector trends, and emerging risks.
        </p>
      </div>
    );
  }

  // ── Footer variant ─────────────────────────────────────────────
  if (variant === "footer") {
    return (
      <form onSubmit={handleSubmit} className="flex gap-2 mt-1">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email for weekly briefing"
          required
          className="flex-1 min-w-0 bg-[rgba(255,255,255,0.05)] border border-line rounded-lg px-3 py-1.5 text-[0.88rem] text-text placeholder:text-[rgba(148,163,184,0.5)] focus:outline-none focus:border-[rgba(125,211,252,0.4)]"
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          className="shrink-0 bg-[rgba(125,211,252,0.15)] hover:bg-[rgba(125,211,252,0.25)] border border-[rgba(125,211,252,0.3)] text-[#7dd3fc] rounded-lg px-3 py-1.5 text-[0.85rem] font-semibold transition-colors disabled:opacity-50"
        >
          {status === "submitting" ? "…" : "Subscribe"}
        </button>
      </form>
    );
  }

  // ── Card variant ───────────────────────────────────────────────
  if (variant === "card") {
    return (
      <div className="rounded-[20px] border border-line bg-gradient-to-b from-[rgba(125,211,252,0.06)] to-[rgba(125,211,252,0.02)] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.28)]">
        <h3 className="text-[1.12rem] font-bold mb-1.5">
          Weekly benchmark briefing
        </h3>
        <p className="text-muted text-[0.94rem] mb-4">
          Score changes, sector trends, and emerging risks from the overnight research pipeline — delivered every Monday.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            aria-label="Email address for newsletter"
            className="flex-1 min-w-0 bg-[rgba(255,255,255,0.05)] border border-line rounded-[12px] px-4 py-3 text-[0.95rem] text-text placeholder:text-[rgba(148,163,184,0.5)] focus:outline-none focus:border-[rgba(125,211,252,0.4)] transition-colors"
          />
          <button
            type="submit"
            disabled={status === "submitting"}
            className="shrink-0 bg-[rgba(125,211,252,0.15)] hover:bg-[rgba(125,211,252,0.25)] border border-[rgba(125,211,252,0.3)] text-[#7dd3fc] rounded-[12px] px-5 py-3 text-[0.95rem] font-semibold transition-colors disabled:opacity-50"
          >
            {status === "submitting" ? "Subscribing…" : "Subscribe — free"}
          </button>
        </form>
        {status === "error" && (
          <p className="text-[#f87171] text-[0.85rem] mt-2">
            Something went wrong. Try again or email{" "}
            <a href="mailto:info@compassionbenchmark.com" className="underline">
              info@compassionbenchmark.com
            </a>
          </p>
        )}
        <p className="text-[rgba(148,163,184,0.5)] text-[0.78rem] mt-3">
          No spam. Unsubscribe anytime. Your email is never shared.
        </p>
      </div>
    );
  }

  // ── Inline variant (default) ───────────────────────────────────
  return (
    <div className="rounded-[16px] border border-line bg-[rgba(255,255,255,0.03)] p-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[0.97rem] text-text">
            Weekly benchmark briefing
          </p>
          <p className="text-muted text-[0.85rem]">
            Score changes and research findings, every Monday.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2 shrink-0">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            aria-label="Email address for newsletter"
            className="w-[180px] sm:w-[200px] bg-[rgba(255,255,255,0.05)] border border-line rounded-[10px] px-3 py-2 text-[0.88rem] text-text placeholder:text-[rgba(148,163,184,0.5)] focus:outline-none focus:border-[rgba(125,211,252,0.4)]"
          />
          <button
            type="submit"
            disabled={status === "submitting"}
            className="shrink-0 bg-[rgba(125,211,252,0.15)] hover:bg-[rgba(125,211,252,0.25)] border border-[rgba(125,211,252,0.3)] text-[#7dd3fc] rounded-[10px] px-4 py-2 text-[0.88rem] font-semibold transition-colors disabled:opacity-50"
          >
            {status === "submitting" ? "…" : "Subscribe"}
          </button>
        </form>
      </div>
      {status === "error" && (
        <p className="text-[#f87171] text-[0.85rem] mt-2">
          Something went wrong. Try again or email info@compassionbenchmark.com
        </p>
      )}
    </div>
  );
}
