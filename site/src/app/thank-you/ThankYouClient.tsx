"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import Button from "@/components/ui/Button";
import Panel from "@/components/ui/Panel";
import Callout from "@/components/ui/Callout";
import { trackEvent } from "@/lib/analytics";

/** Known product keys and their human-readable names + support copy. */
const PRODUCT_COPY: Record<
  string,
  { name: string; detail: string; nextHref: string; nextLabel: string }
> = {
  "score-watch": {
    name: "Score-Watch Alert",
    detail:
      "Your Score-Watch subscription is active. You will receive an email alert the next time overnight research moves the score for your watched entity.",
    nextHref: "/score-watch",
    nextLabel: "How Score-Watch works",
  },
  "us-cities-index": {
    name: "U.S. Cities Index",
    detail:
      "Your U.S. Cities Index report is on its way. Check your inbox — Gumroad delivers the download link immediately.",
    nextHref: "/us-cities",
    nextLabel: "Browse U.S. Cities Index",
  },
  "us-states-index": {
    name: "U.S. States Index",
    detail:
      "Your U.S. States Index report is on its way. Check your inbox — Gumroad delivers the download link immediately.",
    nextHref: "/us-states",
    nextLabel: "Browse U.S. States Index",
  },
  supporter: {
    name: "Supporter Subscription",
    detail:
      "Thank you for supporting independent benchmark research. Your contribution goes directly toward maintaining and expanding the benchmark.",
    nextHref: "/supporters",
    nextLabel: "View supporters",
  },
  api: {
    name: "Pro API Access",
    detail:
      "Your Pro API access is being provisioned. You will receive your API key by email within 15 minutes.",
    nextHref: "/api-access",
    nextLabel: "API documentation",
  },
};

const DEFAULT_COPY = {
  name: "Purchase",
  detail:
    "Your purchase is complete. Check your inbox for your receipt and any download or access links.",
  nextHref: "/indexes",
  nextLabel: "Browse indexes",
};

export default function ThankYouClient() {
  const [product, setProduct] = useState<string>("");
  const [entity, setEntity] = useState<string>("");
  const [fired, setFired] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const p = params.get("product") || "";
    const e = params.get("entity") || "";
    setProduct(p);
    setEntity(e);
  }, []);

  // Fire purchase_confirmed once after product/entity are resolved.
  useEffect(() => {
    if (fired) return;
    if (!product && !entity) return; // wait for params to load (or there are none)
    trackEvent("purchase_confirmed", {
      product: product || "unknown",
      entity: entity || null,
    });
    setFired(true);
  }, [product, entity, fired]);

  const copy = PRODUCT_COPY[product] ?? DEFAULT_COPY;

  return (
    <>
      <section className="pt-[72px] pb-10 border-b border-line">
        <Container>
          <div className="max-w-3xl">
            <Eyebrow>Order confirmed</Eyebrow>
            <h1 className="text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.06] tracking-[-0.03em] mb-4">
              Purchase confirmed
            </h1>
            <p className="text-muted text-[1.12rem] mb-2">
              {copy.name}
            </p>
            {entity && (
              <p className="text-muted text-[1rem] mb-2">
                Entity: <span className="text-text font-semibold">{decodeURIComponent(entity)}</span>
              </p>
            )}
            <p className="text-[1.05rem] mt-4">
              Welcome email in your inbox within 15 minutes.
            </p>
          </div>
        </Container>
      </section>

      <section className="py-12">
        <Container>
          <div className="max-w-3xl space-y-6">
            <Callout>
              <p className="text-muted">{copy.detail}</p>
            </Callout>

            <Panel>
              <h2 className="text-[1.08rem] font-bold mb-3">What happens next</h2>
              <ul className="list-disc pl-[18px] text-muted space-y-2">
                <li>Check your inbox for a confirmation email from Gumroad.</li>
                <li>
                  A welcome email from{" "}
                  <span className="text-text">alerts@compassionbenchmark.com</span> will arrive
                  within 15 minutes.
                </li>
                {product === "score-watch" && (
                  <li>
                    Alerts fire automatically on overnight pipeline runs (Mon–Sat). If the entity
                    score does not change, no alert is sent — that is the expected behavior.
                  </li>
                )}
              </ul>
            </Panel>

            <div className="flex flex-wrap gap-3">
              <Button href={copy.nextHref} variant="primary">
                {copy.nextLabel}
              </Button>
              <Button href="/contact-sales">
                Contact support
              </Button>
            </div>

            <p className="text-[0.88rem] text-muted">
              Questions or issues? Email{" "}
              <a
                href="mailto:alerts@compassionbenchmark.com"
                className="text-[#7dd3fc] hover:underline"
              >
                alerts@compassionbenchmark.com
              </a>
              . For Gumroad account questions, visit{" "}
              <a
                href="https://help.gumroad.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#7dd3fc] hover:underline"
              >
                help.gumroad.com
              </a>
              .{" "}
              <Link href="/score-watch#refund-policy" className="text-[#7dd3fc] hover:underline">
                Refund policy
              </Link>
              .
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
