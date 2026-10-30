/**
 * /llms.txt (https://llmstxt.org): a plain-text brief of the site for language models.
 * Keep it true to the live pages (the home and pricing designs); update it with the copy.
 */
const SITE_URL = "https://tryeverstock.com";

const BODY = `# Everstock

> Everstock is supply chain software for companies that make, move and sell physical products. It reads your quotes, orders and invoices, drafts purchase orders before the shelf empties, chases suppliers, matches invoices, and sends every order to you for a one-tap approval by text. It works with or without an ERP.

Everstock is built in Chicago and is in early access, with pilots live. Start with stockbot, an agent you text, then move to Base, Scale or Enterprise with your history and setup intact.

## What it does

- Approvals by text: every purchase order comes to you for sign-off and takes one tap.
- Purchase orders: drafted from your sales and stock before you run out.
- Invoice matching: catches overcharges, missing items and price changes against your orders.
- Supplier follow-ups: chases late shipments and drafts the replies.
- Learns your rules from every order you approve, then buys the way you would.
- Works with Shopify, Etsy, Excel, Google Sheets, your ERP, WhatsApp and Telegram. stockbot also works in the Everstock app.

## Who it is for

Sellers and operators of anything that ships in a box: from a business shipping out of the living room to a team whose job is purchasing.

## Pricing

- stockbot: $20/mo (founding price). Text it a photo or PDF of an invoice, quote or packing slip; it matches it to your orders and flags problems.
- Base: from $199/mo plus $75 per seat, capped at $499/mo.
- Scale: $999/mo, for a team and its agent working off the same records.
- Enterprise: custom pricing; multiple agents, plugs into your ERP and systems.
- No setup fees, no lock-in, cancel anytime; your data comes with you.

## Pages

- [Home](${SITE_URL}/): what Everstock does, how it works, industries, and the free Stock Plan.
- [Pricing](${SITE_URL}/pricing): plans side by side, with an FAQ.
- [Free Stock Plan](${SITE_URL}/#stock-plan): tell us what you sell and how you buy; we send a one-page plan of what Everstock would take off your plate and what it costs you now.

## Contact

- Get early access: ${SITE_URL}/#waitlist
- Book a demo: ${SITE_URL}/#book-demo
`;

export const dynamic = "force-static";

export function GET() {
  return new Response(BODY, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
