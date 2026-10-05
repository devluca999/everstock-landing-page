import type { Metadata } from "next";
import PricingClient from "@/components/pricing/PricingClient";
import "@/components/pricing/generated/helmet.css";
import "@/components/pricing/generated/pseudo.css";
import "@/components/dc/dc-host.css";

const TITLE = "Pricing · Everstock";
const DESCRIPTION =
  "Everstock grows with you. Start with stockbot for $20/mo, then move to Base, Scale or Enterprise with your history and setup intact.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/pricing" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/pricing" },
  twitter: { title: TITLE, description: DESCRIPTION },
};

/* Pricing, ported from Claude Design ("Everstock site" → Pricing.dc.html). The source
   of truth is mockup/v5/; regenerate components/pricing/generated with `npm run port`.
   It links to the home page with plain anchors (full loads), so each page only ever
   has its own design CSS. */
export default function Pricing() {
  return <PricingClient />;
}
