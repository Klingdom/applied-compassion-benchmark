"use client";

import { useState, useEffect } from "react";

const FORMSPREE_ID = "xojyjllo"; // TODO: Create a separate Formspree form for sales inquiries and replace this ID

const serviceOptions = [
  { value: "", label: "Select a service interest" },
  { value: "research", label: "Research Purchase (Reports)" },
  { value: "data-license", label: "Data License" },
  { value: "advisory", label: "Advisory Consulting" },
  { value: "assessment", label: "Certified Assessment" },
  { value: "enterprise", label: "Enterprise Agreement" },
  { value: "other", label: "Other / Not sure" },
];

const inputClass =
  "min-h-[44px] rounded-[12px] border border-line bg-[rgba(255,255,255,0.04)] text-text px-3.5 w-full text-[0.95rem] placeholder:text-muted focus:outline-none focus:border-[rgba(125,211,252,0.4)] focus:bg-[rgba(125,211,252,0.04)] transition-colors";

export default function SalesInquiryForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [org, setOrg] = useState("");
  const [service, setService] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  // Pre-populate from URL query params (from ResearchConfigurator, etc.)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const product = params.get("product");
    const area = params.get("area");
    const format = params.get("format");
    const license = params.get("license");
    const year = params.get("year");

    if (product) {
      setService("research");
      setMessage(`Inquiry about: ${product}`);
    } else if (area || format) {
      setService("research");
      const parts = [year, area, format, license].filter(Boolean);
      if (parts.length > 0) {
        setMessage(`Research configuration: ${parts.join(", ")}`);
      }
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) return;
    setStatus("sending");

    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          organization: org.trim(),
          service_interest: service,
          message: message.trim(),
          source: "contact-sales",
          timestamp: new Date().toISOString(),
        }),
      });
      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="text-center py-4">
        <div className="text-[1.3rem] font-bold text-accent mb-2">Inquiry submitted</div>
        <p className="text-muted">We'll review your inquiry and respond within 1-2 business days.</p>
      </div>
    );
  }

  return (
    <form id="inquiry" onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        type="text"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className={inputClass}
      />
      <input
        type="email"
        placeholder="Work email *"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={inputClass}
      />
      <input
        type="text"
        placeholder="Organization"
        value={org}
        onChange={(e) => setOrg(e.target.value)}
        className={inputClass}
      />
      <select
        value={service}
        onChange={(e) => setService(e.target.value)}
        className={inputClass}
      >
        {serviceOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <textarea
        placeholder="Tell us about your needs"
        rows={3}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className={`${inputClass} min-h-[80px] py-2.5`}
      />
      <button
        type="submit"
        disabled={status === "sending"}
        className="inline-flex items-center justify-center min-h-[46px] px-5 rounded-[12px] bg-gradient-to-br from-accent to-accent-2 text-[#07111f] font-bold border-0 transition-all duration-150 hover:from-[#8bddff] hover:to-[#6caefb] disabled:opacity-60 text-[0.95rem]"
      >
        {status === "sending" ? "Submitting..." : "Submit inquiry"}
      </button>
      {status === "error" && (
        <p className="text-[#f87171] text-[0.88rem]">
          Something went wrong. Email <a href="mailto:info@compassionbenchmark.com" className="underline">info@compassionbenchmark.com</a> directly.
        </p>
      )}
    </form>
  );
}
