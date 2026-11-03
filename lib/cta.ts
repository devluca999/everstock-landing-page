/**
 * Every call to action on the site goes through here (browser only).
 *
 * - Primary, "Claim your spot" (founding pricing): prelaunch, it opens the claim form
 *   (components/forms/ClaimDialog.tsx); live, it goes to SIGNUP_URL with founding pricing
 *   applied while seats remain, and its label changes to match.
 * - Secondary, "Book a demo": the Cal.com popup when BOOKING_URL is set (name, email and
 *   ref code prefilled where the page knows them), else the short fallback form
 *   (components/forms/DemoDialog.tsx).
 * - The founding seat line: "100 founding seats" until there are enough real claims to
 *   show a count (see /api/founding-seats).
 * Launch switches: lib/siteConfig.ts (read on the server, injected as window.__ES_SITE).
 */
import type { SiteConfig } from "./siteConfig";

export type Seats = { total: number; claimed: number | null };

const FALLBACK: SiteConfig = { launchMode: "prelaunch", signupUrl: null, bookingUrl: null, foundingEndDate: null };
export const site = (): SiteConfig =>
  (typeof window !== "undefined" && (window as unknown as { __ES_SITE?: SiteConfig }).__ES_SITE) || FALLBACK;

export const CLAIM_HREF = "#claim";
export const DEMO_HREF = "#book-demo";
/** Hashes that open the claim form on arrival (#claim, plus links printed before 2026-11-03). */
export const CLAIM_HASHES = ["#claim", "#waitlist", "#access", "#request"];

/* ---------- seats ---------- */

let seats: Seats = { total: 100, claimed: null };
let seatsLoad: Promise<Seats> | null = null;
const listeners = new Set<(s: Seats) => void>();

export function loadSeats(): Promise<Seats> {
  if (!seatsLoad) {
    seatsLoad = fetch("/api/founding-seats")
      .then((r) => (r.ok ? r.json() : seats))
      .then((s: Seats) => {
        if (s && typeof s.total === "number") seats = { total: s.total, claimed: typeof s.claimed === "number" ? s.claimed : null };
        listeners.forEach((f) => f(seats));
        return seats;
      })
      .catch(() => seats);
  }
  return seatsLoad;
}
export const currentSeats = () => seats;
export function onSeats(f: (s: Seats) => void) {
  listeners.add(f);
  return () => listeners.delete(f);
}

const seatsLeft = (s: Seats) => (s.claimed === null ? null : Math.max(0, s.total - s.claimed));
const fmtDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

/** The line under the primary CTA. Never a number that real claims don't back. */
export function seatsLine(s: Seats = seats): string {
  const left = seatsLeft(s);
  const end = site().foundingEndDate;
  if (left === 0) return `All ${s.total} founding seats are taken`;
  if (left !== null) return `${left} of ${s.total} founding seats left${end ? ` · ends ${fmtDate(end)}` : ""}`;
  if (end) return `Founding pricing ends ${fmtDate(end)} or at ${s.total} seats`;
  return `${s.total} founding seats`;
}

/* ---------- Claim your spot ---------- */

export const isLive = () => site().launchMode === "live" && !!site().signupUrl;

export function claimLabel(s: Seats = seats): string {
  if (!isLive()) return "Claim your spot";
  return seatsLeft(s) === 0 ? "Sign up" : "Start with founding pricing";
}

const readRef = () => {
  try {
    return document.cookie.match(/(?:^|;\s*)es_ref=([A-Za-z0-9-]{3,24})/)?.[1] || null;
  } catch {
    return null;
  }
};

function signupHref() {
  const u = new URL(site().signupUrl!);
  if (seatsLeft(seats) !== 0) u.searchParams.set("founding", "1");
  const ref = readRef();
  if (ref) u.searchParams.set("ref", ref);
  return u.toString();
}

/** Opens the claim form (prelaunch) or goes to sign-up (live). `cta` names the button. */
export function openClaim(cta = "other", e?: { preventDefault?: () => void }) {
  if (e && e.preventDefault) e.preventDefault();
  if (isLive()) {
    location.assign(signupHref());
    return;
  }
  window.dispatchEvent(new CustomEvent("es:claim", { detail: { cta } }));
}

/* ---------- Book a demo ---------- */

type CalNs = (...a: unknown[]) => void;
type CalWin = { Cal?: { ns?: Record<string, CalNs> } };
const CAL_SRC = "https://app.cal.com/embed/embed.js";
// Cal.com's embed snippet, verbatim from their snippet generator (it queues calls until embed.js loads)
const CAL_SNIPPET = `(function (C, A, L) { let p = function (a, ar) { a.q.push(ar); }; let d = C.document; C.Cal = C.Cal || function () { let cal = C.Cal; let ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement("script")).src = A; cal.loaded = true; } if (ar[0] === L) { const api = function () { p(api, arguments); }; const namespace = ar[1]; api.q = api.q || []; if(typeof namespace === "string"){cal.ns[namespace] = cal.ns[namespace] || api;p(cal.ns[namespace], ar);p(cal, ["initNamespace", namespace]);} else p(cal, ar); return;} p(cal, ar); }; })(window, "${CAL_SRC}", "init");
Cal("init", "demo", {origin:"https://app.cal.com"});`;
let calFailed = false;
let calWatching = false;
let calFallback: (() => void) | null = null;

/** Loads the embed once; returns the "demo" namespace (calls queue until it is ready). */
function calNs(onFail: () => void): CalNs | null {
  const w = window as unknown as CalWin;
  if (!w.Cal?.ns?.demo) {
    const s = document.createElement("script");
    s.textContent = CAL_SNIPPET;
    document.head.appendChild(s);
    const lib = document.querySelector<HTMLScriptElement>(`script[src="${CAL_SRC}"]`);
    lib?.addEventListener("error", () => {
      calFailed = true;
      onFail();
    });
  }
  return calFailed ? null : (w.Cal?.ns?.demo ?? null);
}

/** "everstock/demo" from https://cal.com/everstock/demo (the embed takes the path). */
const calLinkOf = (url: string) => {
  try {
    const u = new URL(url);
    return u.pathname.replace(/^\/+|\/+$/g, "");
  } catch {
    return url;
  }
};

/** What the page already knows about the visitor (a claim made earlier on this device). */
export function knownLead(): { name?: string; email?: string } {
  try {
    return JSON.parse(localStorage.getItem("es_lead") || "{}");
  } catch {
    return {};
  }
}
export function rememberLead(lead: { name: string; email: string }) {
  try {
    localStorage.setItem("es_lead", JSON.stringify(lead));
  } catch {
    /* private window: nothing to prefill next time */
  }
}

/** The Cal.com prefill: name, email, and the attribution the webhook reads back from metadata. */
function calConfig(cta: string) {
  const lead = knownLead();
  const cfg: Record<string, string> = { "metadata[page]": location.pathname, "metadata[cta]": cta };
  if (lead.name) cfg.name = lead.name;
  if (lead.email) cfg.email = lead.email;
  const ref = readRef();
  if (ref) cfg["metadata[ref]"] = ref;
  new URLSearchParams(location.search).forEach((v, k) => {
    if (/^utm_[a-z_]{1,20}$/.test(k)) cfg[`metadata[${k}]`] = v.slice(0, 120);
  });
  return cfg;
}

export function openDemo(cta = "other", e?: { preventDefault?: () => void }) {
  if (e && e.preventDefault) e.preventDefault();
  const booking = site().bookingUrl;
  if (!booking) {
    window.dispatchEvent(new CustomEvent("es:demo", { detail: { cta } }));
    return;
  }
  const config = calConfig(cta);
  // a new tab with the same prefill, if the popup can't load (blocked script, offline)
  const tab = () => {
    const u = new URL(booking);
    for (const [k, v] of Object.entries(config)) u.searchParams.set(k, v);
    window.open(u.toString(), "_blank", "noopener,noreferrer");
  };
  const ns = calNs(tab);
  if (!ns) return tab();
  calFallback = tab;
  if (!calWatching) {
    calWatching = true;
    ns("on", { action: "linkFailed", callback: () => calFallback?.() });
  }
  ns("modal", { calLink: calLinkOf(booking), config });
}
