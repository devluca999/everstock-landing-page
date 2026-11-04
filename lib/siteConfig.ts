/**
 * The site's launch switches, read on the server (Vercel env, Production + Preview) and
 * handed to the client pages as window.__ES_SITE by app/layout.tsx. The pages are built
 * statically, so a change needs a redeploy.
 *
 *   LAUNCH_MODE        "prelaunch" (default) or "live". Live: "Claim your spot" becomes
 *                      self-serve sign-up at SIGNUP_URL with founding pricing applied while
 *                      seats remain.
 *   SIGNUP_URL         the app's sign-up page, e.g. https://app.tryeverstock.com/sign-up
 *   BOOKING_URL        the Cal.com event link, e.g. https://cal.com/everstock/demo. Unset:
 *                      "Book a demo" opens the short fallback form.
 *   FOUNDING_END_DATE  optional, YYYY-MM-DD: "Founding pricing ends <date> or at 100 seats".
 * The seat count itself is never configured: it comes from real claims (/api/founding-seats).
 */
export type SiteConfig = {
  launchMode: "prelaunch" | "live";
  signupUrl: string | null;
  bookingUrl: string | null;
  foundingEndDate: string | null;
};

export function siteConfig(): SiteConfig {
  const live = process.env.LAUNCH_MODE === "live" && !!process.env.SIGNUP_URL;
  const end = (process.env.FOUNDING_END_DATE || "").trim();
  return {
    launchMode: live ? "live" : "prelaunch",
    signupUrl: (process.env.SIGNUP_URL || "").trim() || null,
    bookingUrl: (process.env.BOOKING_URL || process.env.NEXT_PUBLIC_BOOKING_URL || "").trim() || null,
    foundingEndDate: /^\d{4}-\d{2}-\d{2}$/.test(end) ? end : null,
  };
}

export const siteScript = (c: SiteConfig) => `window.__ES_SITE=${JSON.stringify(c).replace(/</g, "\\u003c")};`;
