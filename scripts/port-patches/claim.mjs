// Claim your spot (2026-11-03, eBRAiN decisions/landing-ctas-founding-cohort-2026-11-03): the
// waitlist is gone. Every primary CTA reads {{ ctaClaimLabel }} ("Claim your spot" prelaunch;
// "Start with founding pricing" / "Sign up" once LAUNCH_MODE=live, see lib/cta.ts) and opens the
// claim form (components/forms/ClaimDialog.tsx) through the host's openFounding. Book a demo
// stays the secondary. The design's own early-access modal is no longer opened by anything;
// its copy is rewritten too so no waitlist wording is left in the page.
import { stampedCta, textCta, ctaRow } from "./cta.mjs";

const SEATS_LINE = `<p style="margin:14px 0 0;font-family:'Geist Mono',ui-monospace,monospace;font-size:12px;font-weight:500;letter-spacing:0.08em;text-transform:uppercase;color:rgb(var(--ink) / 0.64);">{{ seatsLine }}</p>`;

/* ---------- home (v9) ---------- */
export const home = {
  logicPatches: [
    {
      why: "Claim: the early-access modal mode's copy (unused now) says nothing about a waitlist",
      find: "early: ['Get early access', 'Early access', 'Early access · Chicago', 'Get early access', 'You\\'re on the list.']",
      replace: "early: ['Claim your spot', 'Founding', 'Founding · Chicago', 'Claim your spot', 'You\\'re in.']",
    },
    {
      why: "Claim: the older modal's title and submit labels",
      find: "'Get early access'",
      count: 2,
      replace: "'Claim your spot'",
    },
    {
      why: "Claim: the older modal's plan name",
      find: "'the founding partner waitlist'",
      replace: "'a founding spot'",
    },
    {
      why: "Claim: the older modal's eyebrow names founding pricing, not the old founding partner program",
      find: "'Founding partner access'",
      replace: "'Founding pricing'",
    },
    {
      why: "Claim: the Stock Plan section's new CTA ('sp') gets its APPROVED stamp like the others",
      find: "...['nav','hero','foot','bar',",
      replace: "...['sp','nav','hero','foot','bar',",
    },
  ],
  templatePatches: [
    {
      why: "Claim: every 'Get early access' label is the primary CTA, which reads {{ ctaClaimLabel }}",
      find: "Get early access",
      count: 10,
      replace: "{{ ctaClaimLabel }}",
    },
    {
      why: "Claim: the hollow 'founding partner program' button in the archived Chicago section opens the claim form with the new wording",
      find: ">Check out our founding partner program</button>",
      replace: ">{{ ctaClaimLabel }}</button>",
    },
    {
      why: "Claim: the founding seat line under the hero's CTAs ('100 founding seats' until real claims back a count)",
      find: /(id="hero-cta"[\s\S]*?>Book a demo<\/a>\n( *)<\/div>)/g,
      count: 1,
      replace: (_m, block, ind) => `${block}\n${ind}${SEATS_LINE}`,
    },
    {
      why: "Claim: the Stock Plan (globe) section gets the primary and secondary CTAs under its caption",
      find: /(<p [^>]*>Built in Chicago, delivered to the world\.<\/p>)/g,
      count: 1,
      replace: (p) => p + ctaRow(stampedCta({ key: "sp", to: "early", label: "{{ ctaClaimLabel }}" }), textCta({ to: "demo", label: "Book a demo" }), "margin-top:18px;justify-content:center;"),
    },
  ],
};

/* ---------- /pricing ---------- */
export const pricing = {
  logicPatches: [
    {
      why: "Claim: the tiers and scenes that said 'Join the waitlist' are claims",
      find: "cta: 'Join the waitlist'",
      count: 3,
      replace: "cta: 'Claim your spot'",
    },
    {
      why: "Claim: tier buttons read the live label (lib/cta.ts claimLabel) and link to #claim",
      find: "cta: t.cta, hi: !!t.hi, k, href: demo ? '#book-demo' : '#waitlist',",
      replace: "cta: demo ? t.cta : (this.claimText ? this.claimText() : t.cta), hi: !!t.hi, k, href: demo ? '#book-demo' : '#claim',",
    },
    {
      why: "Claim: the scene CTA reads the live label too and links to #claim",
      find: "scCta: sc.cta, scHref: sc.cta === 'Book a demo' ? '#book-demo' : '#waitlist',",
      replace: "scCta: sc.cta === 'Book a demo' ? sc.cta : (this.claimText ? this.claimText() : sc.cta), scHref: sc.cta === 'Book a demo' ? '#book-demo' : '#claim',",
    },
    {
      why: "Claim: the older modal's copy (unused now) says nothing about a waitlist",
      find: "accTitle: s.plan === 'demo' ? 'Book a demo' : 'Join the waitlist', accPlanName: s.plan === 'demo' ? 'a demo' : 'the founding partner waitlist',",
      replace: "accTitle: s.plan === 'demo' ? 'Book a demo' : 'Claim your spot', accPlanName: s.plan === 'demo' ? 'a demo' : 'a founding spot',",
    },
    {
      why: "Claim: the older modal's eyebrow names founding pricing, not the old founding partner program",
      find: "'Founding partner access'",
      replace: "'Founding pricing'",
    },
  ],
  templatePatches: [
    {
      why: "Claim: every 'Join the waitlist' label is the primary CTA, which reads {{ ctaClaimLabel }}",
      find: "Join the waitlist",
      count: 5,
      replace: "{{ ctaClaimLabel }}",
    },
  ],
};
