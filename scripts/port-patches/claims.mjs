// Claims pass (2026-11-22, eBRAiN tasks/luca "rework the landing page"): the page may only say
// what the product repo's docs/value-prop-audit.md ("Claims we must not make yet", branch
// feature/value-prop-audit-and-build) allows. Each patch names the audit line it answers.
// Carry these into the design (Claude Design "Everstock site"), then delete them.
// Loaded last by scripts/port-dc.mjs for both pages, so anchors are the text after the other patches.

const home = {
  logicPatches: [
    {
      why: "Claims (Tier 1: don't say Everstock reads your supplier emails on its own): the approvals card's first step names what the buyer does, not an inbox Everstock reads",
      find: "p3Steps: ['Forward an invoice or connect your inbox',",
      replace: "p3Steps: ['Text or upload an invoice',",
    },
  ],
  templatePatches: [
    {
      why: "Claims (Tier 5: no text channel is proven live): the integrations strip drops the channel logos, which made the same claim as the line under it",
      find: /\n *<li title="(?:WhatsApp|Telegram|iMessage)"[^\n]*<\/li>/g,
      count: 2,
      replace: "",
    },
    {
      why: "Claims (Tier 3: the PO always waits for a person's yes): 'handle themselves ... approve the exceptions' read as orders going out without approval",
      find: ">Purchase orders, supplier follow-ups and invoice matching handle themselves. You approve the exceptions.</p>",
      replace: ">Purchase orders drafted, invoices checked, late suppliers flagged. You approve every order.</p>",
    },
    {
      why: "Claims (Tier 5: don't name a text channel as proven; none has run live)",
      find: ">Text stockbot on WhatsApp or Telegram.</p>",
      replace: ">Text stockbot from your phone.</p>",
    },
  ],
};

const pricing = {
  logicPatches: [
    {
      why: "Claims (Tier 1: don't say Everstock reads your supplier emails on its own): Base's scene line (lib/pricing.config.ts carries the same line for the home tiers)",
      find: "sub: 'stockbot reads your inbox, so paperwork sorts itself.',",
      replace: "sub: 'Up to five people, your order history and your rules, in one place.',",
    },
    {
      why: "Claims (Tier 1): Base's first bullet names order-history import (a Base feature, Tier 6) instead of reading the inbox",
      find: "bullets: ['Reads your inbox automatically',",
      replace: "bullets: ['Imports your order history',",
    },
    {
      why: "Claims (Tier 1): the compare table's inbox row becomes the order-history import Base includes",
      find: "['Reads your inbox automatically', 0, 1, 1, 1]",
      replace: "['Imports your order history', 0, 1, 1, 1]",
    },
    {
      why: "Claims (Tier 5: don't name a text channel as proven)",
      find: "['Text it on WhatsApp or Telegram', 1, 1, 1, 1]",
      replace: "['Text it from your phone', 1, 1, 1, 1]",
    },
    {
      why: "Claims (Tier 5: the stockbot plan's web view is setup only; chat on the web is Base and up)",
      find: "['Chat with it in the Everstock app', 1, 1, 1, 1]",
      replace: "['Chat with it in the Everstock app', 0, 1, 1, 1]",
    },
    {
      why: "Claims (tier review 2026-11-22: sell Scale only on what has shipped; the automation builder is not built): Scale's first bullet",
      find: "bullets: ['Build workflows by describing them, even by voice',",
      replace: "bullets: ['A desktop workspace for your team',",
    },
    {
      why: "Claims (the automation builder is not built): the compare table's row goes",
      find: "['Build workflows by describing them, even by voice', 0, 0, 1, 1], ",
      replace: "",
    },
  ],
  templatePatches: [
    {
      why: "Claims (Tier 5: no text channel is proven live): the integrations strip drops the channel logos, which made the same claim as the line under it",
      find: /\n *<li title="(?:WhatsApp|Telegram|iMessage)"[^\n]*<\/li>/g,
      count: 3,
      replace: "",
    },
    {
      why: "Claims (Tier 5: don't name a text channel as proven)",
      find: ">Text stockbot on WhatsApp, Telegram or iMessage.</p>",
      replace: ">Text stockbot from your phone.</p>",
    },
    {
      why: "Claims (Tier 1: don't say Everstock reads a PDF or photo correctly; figures count only after a person confirms them)",
      find: "Send it a photo or PDF of an invoice, quote or packing slip. It reads it, matches it to your orders, and flags overcharges, missing items and price changes.",
      replace: "Send it a photo or PDF of an invoice, quote or packing slip and confirm the figures it pulls out. It checks them against your orders and flags overcharges, missing items and price changes.",
    },
    {
      why: "Claims (Tier 1: don't say Everstock reads your supplier emails on its own)",
      find: ">No. Everstock works from your inbox, documents and spreadsheets.",
      replace: ">No. Everstock works from your documents and spreadsheets.",
    },
    {
      why: "Claims (Tier 5: no channel named as proven; the stockbot plan has no web chat)",
      find: ">Shopify, Etsy, Excel, Google Sheets, your ERP, WhatsApp and Telegram. stockbot also works right in the Everstock app.</p>",
      replace: ">Shopify, Etsy, Excel, Google Sheets and your ERP. stockbot works by text.</p>",
    },
  ],
};

export { home, pricing };
