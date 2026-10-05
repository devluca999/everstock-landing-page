/**
 * Every CTA destination on the site, in one place. Components never hardcode a CTA
 * href: the v4 port rebinds each designed link to one of these (scripts/port-dc.mjs →
 * hrefBindings) and components/v4/DcPage.jsx routes the click handlers through here.
 *
 * Labels live in the design's template (as patched by
 * scripts/port-patches/v4-waitlist-dark-only.mjs); they are listed here only so the
 * config reads as a complete map.
 */

const BOOKING_URL = (process.env.NEXT_PUBLIC_BOOKING_URL || "").trim();

export const CTA = {
  /**
   * Primary. Opens the Request access modal in founding partner mode →
   * /api/request-access → Convex (source "founding-partner").
   */
  waitlist: {
    label: "Join the waitlist",
    href: "#waitlist",
  },

  /**
   * Secondary, and the closing Book a demo card. TODO(booking): set
   * NEXT_PUBLIC_BOOKING_URL (Vercel → Production + Preview, inlined at build time) to
   * the scheduling link. While it is unset, "Book a demo" opens the Request access
   * modal in demo mode, which records the request in Convex with source "book-demo".
   */
  bookDemo: {
    label: "Book a demo",
    href: BOOKING_URL || "#book-demo",
    externalUrl: BOOKING_URL || null,
  },
} as const;

export type CtaKey = keyof typeof CTA;
