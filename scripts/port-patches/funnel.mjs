// The bill-check funnel (2026-11-24, eBRAiN tasks/luca "Rework the landing page to suit the funnel",
// strategy strategies/bill-check-funnel-gtm). The free bill check becomes the way in:
//   - the hero's primary button reads Luca's line, "Send us the bills. We check them." (plural:
//     the check needs two bills from the same supplier), with "Free. No account." under it;
//   - the Shopify / Etsy audience line goes (the platform logos stay: they are integrations);
//   - a "How the check works" section and a privacy block follow the hero;
//   - pricing gets the free entry row before stockbot and the founding close after the cards;
//     /pricing's stockbot strip leads with the free check and closes on founding pricing.
// Every free-check button goes through the host's openBillCheck (lib/cta.ts): BILL_CHECK_URL once
// the check runs (eBRAiN tasks/jordi task 30), the claim form until then, and the note under the
// buttons says "Opening soon" until then.
// Copy rules: operator language, third person, no dashes, no exclamation marks, no emoji. Claims
// stay inside the strategy's ladder: price changes against the buyer's own bills, duplicates, and
// with a packing slip, items billed beyond what arrived. Never the cross-supplier comparison until
// Jordi confirms its tests (it is the audit on feature/value-prop-audit-and-build).
// Loaded after claims.mjs for both pages, so anchors are the text the other patches leave.
// Carry these into the design (Claude Design "Everstock site"), then delete them.
import { stampedCta, textCta, outlineCta, ctaRow } from "./cta.mjs";

const MONO = "font-family:'Geist Mono',ui-monospace,monospace;";
const DISPLAY = "font-family:'General Sans','Space Grotesk',sans-serif;";
const EYEBROW = `margin:0;${MONO}font-size:11px;font-weight:500;letter-spacing:0.1em;text-transform:uppercase;color:rgb(var(--ink) / 0.64);`;
const NOTE = `margin:0;${MONO}font-size:12px;font-weight:500;letter-spacing:0.08em;text-transform:uppercase;color:rgb(var(--ink) / 0.64);`;

export const LINE = "Send us the bills. We check them.";
// the new buttons' stamp keys (bc: the section, prf: the free row, pfc: the founding close)
export const STAMP_KEYS = ["bc", "prf", "pfc"];

const STEPS = [
  ["Send two bills", "Two bills from the same supplier, as photos or PDFs. Bills you have already paid work."],
  ["stockbot reads them back", "It lists the supplier, items, quantities and prices it read, so you see exactly what it took from the page."],
  ["You see what changed", "Prices that went up since the last bill and charges that appear twice. Add a packing slip and it flags items billed beyond what arrived."],
];
const PRIVACY = [
  ["Start with a paid bill", "A bill you have already paid is enough to show price changes and duplicates."],
  ["Cross out bank details", "The check only needs the supplier, items, quantities and prices."],
  ["Deleted after the check", "Bills sent for a free check are deleted once the check is done."],
  ["Only what was read", "The result shows exactly what stockbot read from the page, and nothing else."],
  ["No logins", "No accounting or bank logins. Bills only."],
];

const step = ([t, d], i) =>
  `<li style="display:grid;grid-template-columns:44px 1fr;gap:4px 14px;padding:18px 0;border-bottom:1px solid rgb(var(--ink) / 0.12);">` +
  `<span aria-hidden="true" style="grid-row:span 2;${MONO}font-size:13px;font-weight:500;letter-spacing:0.06em;color:rgb(var(--ink) / 0.64);padding-top:3px;">0${i + 1}</span>` +
  `<span style="${DISPLAY}font-size:clamp(18px,1.5vw,21px);font-weight:600;line-height:1.25;letter-spacing:-0.015em;color:rgb(var(--ink));">${t}</span>` +
  `<span style="font-size:15.5px;line-height:1.55;color:rgb(var(--ink) / 0.72);text-wrap:pretty;">${d}</span></li>`;

const promise = ([t, d]) =>
  `<li style="display:grid;gap:6px;align-content:start;padding:18px 0 0;border-top:1px solid rgb(var(--ink) / 0.12);">` +
  `<span style="font-size:16px;font-weight:600;line-height:1.3;color:rgb(var(--ink));">${t}</span>` +
  `<span style="font-size:15px;line-height:1.5;color:rgb(var(--ink) / 0.7);text-wrap:pretty;">${d}</span></li>`;

const SECTION = [
  `<section id="bill-check" data-tone="dark" data-screen-label="01c Bill check" aria-labelledby="bc-h" style="position:relative;background:rgb(var(--bg));color:rgb(var(--ink));border-top:1px solid rgb(var(--ink) / 0.08);">`,
  `    <div style="max-width:1280px;margin:0 auto;padding:clamp(72px,10svh,112px) var(--edge);display:grid;gap:clamp(40px,6svh,64px);">`,
  `      <div style="display:flex;flex-wrap:wrap;gap:36px clamp(32px,6vw,96px);">`,
  `        <div style="flex:1 1 340px;min-width:0;display:grid;gap:18px;align-content:start;">`,
  `          <p style="${EYEBROW}">The free bill check</p>`,
  `          <h2 id="bc-h" style="margin:0;max-width:16ch;${DISPLAY}font-weight:600;font-size:clamp(30px,3.6vw,50px);line-height:1.05;letter-spacing:-0.03em;color:rgb(var(--ink));text-wrap:balance;">${LINE}</h2>`,
  `          <p style="margin:0;max-width:44ch;font-size:clamp(16px,1.3vw,18px);line-height:1.5;color:rgb(var(--ink) / 0.72);text-wrap:pretty;">Text stockbot two bills from the same supplier. It checks them and answers in the same thread with what it found. Free, with no account and no card.</p>`,
  `          ${ctaRow(stampedCta({ key: "bc", to: "check", label: "Send us the bills" }), textCta({ to: "demo", label: "Book a demo" }), "margin-top:8px;")}`,
  `          <p style="${NOTE}">{{ billCheckNote }}</p>`,
  `        </div>`,
  `        <div style="flex:1.2 1 400px;min-width:0;display:grid;gap:14px;align-content:start;">`,
  `          <p style="${EYEBROW}">How the check works</p>`,
  `          <ol style="list-style:none;margin:0;padding:0;border-top:1px solid rgb(var(--ink) / 0.12);">${STEPS.map(step).join("")}</ol>`,
  `          <p style="margin:0;max-width:62ch;font-size:14px;line-height:1.55;color:rgb(var(--ink) / 0.64);text-wrap:pretty;">What a first check cannot judge: a first order from a supplier, or a price rise the supplier made for every customer. Once orders run through Everstock, every later bill is checked against its order.</p>`,
  `        </div>`,
  `      </div>`,
  `      <div id="privacy" aria-labelledby="bc-privacy-h" style="display:grid;gap:22px;padding:clamp(22px,3vw,36px);border:1px solid rgb(var(--ink) / 0.14);border-radius:12px;">`,
  `        <div style="display:grid;gap:8px;">`,
  `          <p style="${EYEBROW}">Privacy</p>`,
  `          <h3 id="bc-privacy-h" style="margin:0;${DISPLAY}font-weight:600;font-size:clamp(22px,2.2vw,30px);line-height:1.15;letter-spacing:-0.02em;color:rgb(var(--ink));">Your bills stay yours.</h3>`,
  `        </div>`,
  `        <ul style="list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:20px 28px;">${PRIVACY.map(promise).join("")}</ul>`,
  `      </div>`,
  `    </div>`,
  `  </section>`,
].join("\n");

// the free entry row above the stockbot card (home pricing, light tone)
const FREE_ROW =
  `<div aria-label="Free bill check" style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:14px 28px;padding:16px clamp(16px,2vw,24px);border:1px solid rgb(var(--ink) / 0.16);border-radius:8px;background:rgb(var(--bg));">` +
  `<div style="flex:1 1 320px;min-width:0;display:grid;gap:6px;">` +
  `<p style="margin:0;display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 12px;"><span style="${MONO}font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:rgb(var(--ink));">{{ prFreeName }}</span><span style="${MONO}font-variant-numeric:tabular-nums lining-nums;font-size:22px;font-weight:500;line-height:1;letter-spacing:-0.02em;color:rgb(var(--ink));">{{ prFreeAmount }}</span></p>` +
  `<p style="margin:0;max-width:62ch;font-size:15px;line-height:1.5;color:rgb(var(--ink) / 0.74);text-wrap:pretty;">{{ prFreeLine }}</p></div>` +
  `<div style="display:grid;gap:6px;justify-items:end;">${outlineCta({ key: "prf", to: "check", label: "Send us the bills" })}<span style="${MONO}font-size:11px;letter-spacing:0.06em;color:rgb(var(--ink) / 0.64);">{{ billCheckNote }}</span></div></div>`;

// the founding close under the cards, before the billing FAQ (home pricing)
const CLOSE =
  `<div style="display:grid;gap:10px;margin-top:clamp(12px,2svh,24px);padding-top:clamp(20px,3svh,32px);border-top:1px solid rgb(var(--ink) / 0.14);">` +
  `<h3 style="margin:0;${DISPLAY}font-weight:600;font-size:clamp(22px,2.2vw,30px);line-height:1.15;letter-spacing:-0.02em;color:rgb(var(--ink));text-wrap:balance;">{{ prCloseTitle }}</h3>` +
  `<p style="margin:0;max-width:60ch;font-size:16px;line-height:1.5;color:rgb(var(--ink) / 0.74);text-wrap:pretty;">{{ prCloseLine }}</p>` +
  ctaRow(stampedCta({ key: "pfc", to: "early", label: "{{ ctaClaimLabel }}" }), `<span style="${NOTE}">{{ seatsLine }}</span>`, "margin-top:8px;") +
  `</div>`;

const AUDIENCE = {
  why: "Funnel: the Shopify / Etsy audience line goes (the strategy opens four doors, not one seller type); the logos under it stay, as what Everstock works with",
  find: ">Built for sellers on Shopify, Etsy, and wherever you sell next.</p>",
  replace: ">Works with the tools you already run.</p>",
};

/* ---------- home (v9) ---------- */
export const home = {
  logicPatches: [
    {
      why: "Funnel: the new buttons' APPROVED stamps (the section, the free pricing row, the founding close) land on hover like the others",
      find: "...['sp','nav',",
      replace: "...[" + STAMP_KEYS.map((k) => `'${k}'`).join(",") + ",'sp','nav',",
    },
  ],
  templatePatches: [
    {
      why: "Funnel: the hero's primary button is the free bill check (it keeps data-cta 'hero' for its stamp; openBillCheck tags it bill-check-hero)",
      find: /href="#waitlist" onClick="\{\{ openFounding \}\}" data-cta="hero"([^>]*)>\{\{ ctaClaimLabel \}\}/g,
      count: 1,
      replace: (_m, rest) => `href="#waitlist" onClick="{{ openBillCheck }}" data-cta="hero"${rest}>${LINE}`,
    },
    {
      why: "Funnel: under the hero's buttons, what the check costs (and 'Opening soon' until it runs) instead of the founding seat count, which moves to the pricing close",
      find: /(id="hero-cta"[\s\S]*?<\/div>\n *<p [^>]*>)\{\{ seatsLine \}\}/g,
      count: 1,
      replace: (_m, head) => `${head}{{ billCheckNote }}`,
    },
    AUDIENCE,
    {
      why: "Funnel: 'How the check works' and the privacy block, right after the platforms band",
      find: '\n\n  <section ref="{{ stakesRef }}" id="problem"',
      replace: `\n\n  ${SECTION}\n\n  <section ref="{{ stakesRef }}" id="problem"`,
    },
    {
      why: "Funnel: the free entry row comes first in pricing, above the stockbot card",
      find: /(\n *)(<div style="display:flex;flex-wrap:wrap;align-items:center;gap:28px clamp\(28px,5vw,72px\);">\n *<article aria-label="stockbot")/g,
      count: 1,
      replace: (_m, ind, cards) => `${ind}${FREE_ROW}${ind}${cards}`,
    },
    {
      why: "Funnel: the founding close ends the cards, before the billing FAQ (the founding seat line now lives here)",
      find: '<div style="display:grid;gap:4px;margin-top:clamp(20px,3svh,36px);max-width:860px;">',
      replace: `${CLOSE}<div style="display:grid;gap:4px;margin-top:clamp(20px,3svh,36px);max-width:860px;">`,
    },
  ],
};

/* ---------- /pricing ---------- */
export const pricing = {
  logicPatches: [],
  templatePatches: [
    AUDIENCE,
    {
      why: "Funnel: the stockbot strip leads with the free check (the founding price moves to the line under it)",
      find: /Not ready for a plan\? Start with stockbot at the founding price, <span [^>]*>\{\{ prFoundingMo \}\}<\/span>\./g,
      count: 1,
      replace: `Not ready for a plan? Start free. ${LINE}`,
    },
    {
      why: "Funnel: the strip's button is the free check (it keeps data-cta 'sb' for its stamp)",
      find: /href="#waitlist" onClick="\{\{ openFounding \}\}" data-cta="sb"([^>]*)>\{\{ ctaClaimLabel \}\}/g,
      count: 1,
      replace: (_m, rest) => `href="#waitlist" onClick="{{ openBillCheck }}" data-cta="sb"${rest}>Send us the bills`,
    },
    {
      why: "Funnel: the founding close under the strip: what the check costs, then founding pricing and the claim link",
      find: /(<p [^>]*>)Bring your stockbot to Everstock\. Your history and setup come with you\.<\/p>/g,
      count: 1,
      replace: (_m, p) =>
        `${p}{{ billCheckNote }} Then: {{ prCloseLine }}</p>` +
        textCta({ to: "early", label: "{{ ctaClaimLabel }} →", style: "justify-self:start;font-size:15px;" }),
    },
  ],
};
