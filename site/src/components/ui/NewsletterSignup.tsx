"use client";

import { useState, useCallback } from "react";
import { trackEvent } from "@/lib/analytics";

/**
 * Newsletter email signup with dual Listmonk + Formspree submission.
 *
 * Submit target is controlled by two env vars (set at build time):
 *   NEXT_PUBLIC_LISTMONK_URL       — base URL of the Listmonk instance
 *                                    e.g. https://lists.compassionbenchmark.com
 *   NEXT_PUBLIC_LISTMONK_LIST_UUID — UUID of the list to subscribe to
 *                                    e.g. xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
 *
 * When BOTH vars are present:
 *   1. Primary submit: POST {LISTMONK_URL}/subscription/form
 *      Content-Type: application/x-www-form-urlencoded
 *      Body: email={encoded}&l={uuid}&nonce=&name=
 *      Any 2xx response is treated as success.
 *   2. On non-2xx or network error: falls back to Formspree (dual-send).
 * When either var is absent: Formspree only (local dev / unconfigured deploys).
 *
 * Variants:
 *  - "inline" (default): compact horizontal layout for embedding in pages
 *  - "inline-compact": minimal email+button only, no wrapper — for embedding inside other components
 *  - "card": larger card-style layout for prominent placement
 *  - "footer": minimal single-line for the footer
 */

const FORMSPREE_ID = "xaqaeeez";
const LISTMONK_URL = process.env.NEXT_PUBLIC_LISTMONK_URL;
const LISTMONK_UUID = process.env.NEXT_PUBLIC_LISTMONK_LIST_UUID;
const USE_LISTMONK = Boolean(LISTMONK_URL && LISTMONK_UUID);

interface Props {
  variant?: "inline" | "inline-compact" | "card" | "footer";
  source?: string;
  /** Optional override text shown above the card form title (card variant only). */
  preamble?: string;
}

async function submitToFormspree(email: string, source: string): Promise<boolean> {
  const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      email: email.trim(),
      source: `newsletter-${source}`,
      subscribed_at: new Date().toISOString(),
    }),
  });
  return res.ok;
}

async function submitToListmonk(email: string): Promise<boolean> {
  const body = new URLSearchParams({
    email: email.trim(),
    l: LISTMONK_UUID!,
    nonce: "",
    name: "",
  });
  const res = await fetch(`${LISTMONK_URL}/subscription/form`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  return res.ok;
}

export default function NewsletterSignup({ variant = "inline", source = "unknown", preamble }: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email.trim() || !email.includes("@")) return;
      setStatus("submitting");

      const trimmed = email.trim();

      if (USE_LISTMONK) {
        // Primary: Listmonk. On failure, fall back to Formspree.
        let listmonkOk = false;
        try {
          listmonkOk = await submitToListmonk(trimmed);
        } catch {
          listmonkOk = false;
        }

        if (listmonkOk) {
          setStatus("success");
          try { localStorage.setItem("cb_newsletter", trimmed); } catch {}
          trackEvent("newsletter_subscribed", { source, variant, backend: "listmonk" });
          return;
        }

        // Listmonk failed — fall through to Formspree as dual-send safety net.
        trackEvent("newsletter_subscribe_error", { source, variant, backend: "listmonk", errorStage: "listmonk_primary" });
      }

      // Formspree path (primary when Listmonk is unconfigured; fallback otherwise).
      try {
        const ok = await submitToFormspree(trimmed, source);
        if (ok) {
          setStatus("success");
          try { localStorage.setItem("cb_newsletter", trimmed); } catch {}
          trackEvent("newsletter_subscribed", { source, variant, backend: "formspree" });
        } else {
          setStatus("error");
          trackEvent("newsletter_subscribe_error", { source, variant, backend: "formspree", errorStage: "formspree_non2xx" });
        }
      } catch {
        setStatus("error");
        trackEvent("newsletter_subscribe_error", { source, variant, backend: "formspree", errorStage: "formspree_network" });
      }
    },
    [email, source, variant],
  );

  // ── Success state ──────────────────────────────────────────────
  if (status === "success") {
    if (variant === "footer" || variant === "inline-compact") {
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

  // ── Inline-compact variant ──────────────────────────────────────
  if (variant === "inline-compact") {
    return (
      <form onSubmit={handleSubmit} className="flex gap-2 shrink-0">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          aria-label="Email address for newsletter"
          className="w-[160px] sm:w-[190px] bg-[rgba(255,255,255,0.05)] border border-line rounded-[10px] px-3 py-2 text-[0.88rem] text-text placeholder:text-[rgba(148,163,184,0.5)] focus:outline-none focus:border-[rgba(125,211,252,0.4)]"
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          className="shrink-0 bg-[rgba(125,211,252,0.15)] hover:bg-[rgba(125,211,252,0.25)] border border-[rgba(125,211,252,0.3)] text-[#7dd3fc] rounded-[10px] px-4 py-2 text-[0.88rem] font-semibold transition-colors disabled:opacity-50"
        >
          {status === "submitting" ? "…" : "Subscribe"}
        </button>
      </form>
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
        {preamble && (
          <p className="text-muted text-[0.88rem] mb-3 italic">{preamble}</p>
        )}
        <h3 className="text-[1.12rem] font-bold mb-1.5">
          The weekly briefing on institutional compassion scores
        </h3>
        <p className="text-muted text-[0.94rem] mb-4">
          Score changes, sector trends, and emerging risk signals from overnight research across 1,155 entities — every Monday. Free.
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
            Weekly compassion scores briefing
          </p>
          <p className="text-muted text-[0.85rem]">
            Score changes across 1,155 entities, every Monday. Free.
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
