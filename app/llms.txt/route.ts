/**
 * /llms.txt (https://llmstxt.org): a plain-text brief of the site for language models.
 * Keep it true to the live pages (the home and pricing designs); update it with the copy.
 */
import { FOUNDING, YEARLY_MONTHS_PAID, plan, priceFor, termsFor, usd } from "@/lib/pricing.config";

const SITE_URL = "https://tryeverstock.com";
const s = plan("stockbot"), b = plan("base"), sc = plan("scale"), en = plan("enterprise");
// every figure from lib/pricing.config.ts
const PRICING = [
  `- stockbot: ${usd(s.monthly!)}/mo, or ${priceFor(s, "yearly").amount}/mo billed yearly (${priceFor(s, "yearly").billed.replace("Billed ", "")}). ${termsFor(s, "monthly")} Founding price: ${usd(FOUNDING.monthly)}/mo for life for the first ${FOUNDING.seats} customers, monthly billing only. Text it a photo or PDF of an invoice, quote or packing slip; it matches it to your orders and flags problems.`,
  `- Base: ${usd(b.monthly!)}/mo ${priceFor(b, "monthly").seat}, or ${priceFor(b, "yearly").amount}/mo billed yearly (${priceFor(b, "yearly").billed.replace("Billed ", "")}). ${termsFor(b, "monthly")} ${b.promise}`,
  `- Scale: ${usd(sc.monthly!)}/mo, for a team and its agent working off the same records. ${termsFor(sc, "monthly")}`,
  `- Enterprise: from ${usd(en.monthly!)}/mo; multiple agents, plugs into your ERP and systems. ${termsFor(en, "monthly")}`,
  `- Yearly billing (stockbot and Base): pay for ${YEARLY_MONTHS_PAID} months, get 12.`,
].join("\n");

const BODY = `# Everstock

> Everstock is supply chain software for companies that make, move and sell physical products. It reads your quotes, orders and invoices, drafts purchase orders before the shelf empties, chases suppliers, matches invoices, and sends every order to you for a one-tap approval by text. It works with or without an ERP.

Everstock is built in Chicago, with pilots live. The first 100 customers get founding pricing. Start with stockbot, an agent you text, then move to Base, Scale or Enterprise with your history and setup intact.

## What it does

- Approvals by text: every purchase order comes to you for sign-off and takes one tap.
- Purchase orders: drafted from your sales and stock before you run out.
- Invoice matching: catches overcharges, missing items and price changes against your orders.
- Supplier follow-ups: chases late shipments and drafts the replies.
- Learns your rules from every order you approve, then buys the way you would.
- Works with Shopify, Etsy, Excel, Google Sheets, your ERP, WhatsApp and Telegram. stockbot also works in the Everstock app.
- Up and running in days: send your paperwork, review the model Everstock builds from it, approve your first orders. No rip and replace.

## Who it is for

Sellers and operators of anything that ships in a box: from a business shipping out of the living room to a team whose job is purchasing.

## Pricing

${PRICING}

## Pages

- [Home](${SITE_URL}/): what Everstock does, how it works, industries, and the free Stock Plan.
- [Pricing](${SITE_URL}/pricing): plans side by side, with an FAQ.
- [Free Stock Plan](${SITE_URL}/#stock-plan): tell us what you sell and how you buy; we send a one-page plan of what Everstock would take off your plate and what it costs you now.

## Contact

- Claim your spot (founding pricing): ${SITE_URL}/#claim
- Book a demo: ${SITE_URL}/#book-demo
`;

export const dynamic = "force-static";

export function GET() {
  return new Response(BODY, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
