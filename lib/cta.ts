/**
 * Every CTA destination on the site, in one place. Components never hardcode a CTA
 * href: the v4 port rebinds each designed link to one of these (scripts/port-dc.mjs →
 * hrefBindings) and components/v4/DcPage.jsx routes the click handlers through here.
 *
 * Labels are the approved copy (v4 revisions r1 to r10); they live in the design's
 * template and are listed here only so the config reads as a complete map.
 */

const BOOKING_URL = (process.env.NEXT_PUBLIC_BOOKING_URL || "").trim();

export const CTA = {
  /**
   * Primary. TODO(booking): set NEXT_PUBLIC_BOOKING_URL (Vercel → Production + Preview,
   * inlined at build time) to the scheduling link. While it is unset, "Book a demo"
   * opens the existing Request access modal in demo mode, which records the request in
   * Convex with source "book-demo".
   */
  bookDemo: {
    label: "Book a demo",
    href: BOOKING_URL || "#book-demo",
    externalUrl: BOOKING_URL || null,
  },

  /** Secondary. Wired: opens the Request access modal (early-access mode) → /api/request-access → Convex. */
  earlyAccess: {
    label: "Get early access",
    href: "#access",
  },

  /**
   * Transitional. Links scroll to the records form in the Offer section (#price-file).
   * TODO(records-upload): the form UI is complete (email, multi-file picker, SEND
   * RECORDS stamp, RECEIVED state) but nothing is uploaded or stored yet. On submit it
   * validates the email, then opens the Request access modal with that email prefilled
   * (Convex source "scattered-records", with the chosen file names in the note).
   * Upload + storage plug in at `uploadRecords` in components/v4/DcPage.jsx.
   */
  scatteredRecords: {
    label: "Send us your scattered records",
    href: "#price-file",
  },

  /** The v3 full-scroll journey, served as its own page until it is reworked. */
  journey: {
    label: "Journey",
    href: "/journey",
  },
} as const;

export type CtaKey = keyof typeof CTA;
