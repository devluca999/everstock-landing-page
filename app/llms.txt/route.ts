/**
 * /llms.txt (https://llmstxt.org): a plain-text brief of the site for language models.
 * Keep it true to the live pages (the home and pricing designs); update it with the copy.
 */
import { FREE_CHECK, YEARLY_MONTHS_PAID, foundingTerms, plan, priceFor, termsFor, usd } from "@/lib/pricing.config";
import { siteConfig } from "@/lib/siteConfig";

const SITE_URL = "https://tryeverstock.com";
const s = plan("stockbot"), b = plan("base"), sc = plan("scale"), en = plan("enterprise");
// the free bill check runs once BILL_CHECK_URL is set (read at build, like the pages)
const checkOpen = !!siteConfig().billCheckUrl;
// every figure from lib/pricing.config.ts
const PRICING = [
  `- ${FREE_CHECK.name}: ${FREE_CHECK.amount}. ${FREE_CHECK.line}${checkOpen ? "" : " Opening soon."}`,
  `- stockbot: ${usd(s.monthly!)}/mo, billed monthly. ${termsFor(s, "monthly")} Founding price: ${foundingTerms()} Text it a photo or PDF of an invoice, quote or packing slip, confirm the figures, and it checks them against your orders and flags problems.`,
  `- Base: ${usd(b.monthly!)}/mo ${priceFor(b, "monthly").seat}, or ${priceFor(b, "yearly").amount}/mo billed yearly (${priceFor(b, "yearly").billed.replace("Billed ", "")}). ${termsFor(b, "monthly")} ${b.promise}`,
  `- Scale: ${usd(sc.monthly!)}/mo, for a team and its agent working off the same records. ${termsFor(sc, "monthly")}`,
  `- Enterprise: from ${usd(en.monthly!)}/mo; multiple agents, plugs into your ERP and systems. ${termsFor(en, "monthly")}`,
  `- Yearly billing (Base): pay for ${YEARLY_MONTHS_PAID} months, get 12.`,
].join("\n");

const BODY = `# Everstock

> Everstock is supply chain software for companies that make, move and sell physical products. It works from your quotes, orders and invoices: it drafts purchase orders before the shelf empties, checks invoices against your orders, flags late suppliers, and sends every order to you for approval. Nothing is ordered until a person says yes. It works with or without an ERP.

Everstock is built in Chicago. Send us the bills. We check them: the bill check is free and needs no account${checkOpen ? "" : " (opening soon)"}. The first 100 customers get founding pricing. Start with stockbot, an agent you text, then move to Base, Scale or Enterprise with your history and setup intact.

## The free bill check

- Send two bills from the same supplier, as photos or PDFs. stockbot reads them back, then shows prices that went up since the last bill and charges that appear twice. With a packing slip, it flags items billed beyond what arrived.
- It cannot judge a first order from a supplier, or a price rise the supplier made for every customer.
- Privacy: a bill you have already paid is enough; cross out bank details; bills sent for a free check are deleted once the check is done; the result shows only what was read; no accounting or bank logins.

## What it does

- Approvals by text: every purchase order comes to you for sign-off and takes one tap.
- Purchase orders: drafted from your sales and stock before you run out.
- Invoice matching: catches overcharges, missing items and price changes against your orders.
- Late shipments: flags a supplier that has slipped and drafts the follow-up for you.
- Learns your rules from every order you approve, then buys the way you would.
- Works with Shopify, Etsy, Excel, Google Sheets and your ERP. stockbot works by text; chat in the Everstock app is on Base and up.
- Up and running in days: send your paperwork, review the model Everstock builds from it, approve your first orders. No rip and replace.

## Who it is for

Sellers and operators of anything that ships in a box: from a business shipping out of the living room to a team whose job is purchasing.

## Pricing

${PRICING}

## Pages

- [Home](${SITE_URL}/): the free bill check, what Everstock does, how it works, industries, and the free Stock Plan.
- [Free bill check](${SITE_URL}/#bill-check): how the check works and how your bills are handled.
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
