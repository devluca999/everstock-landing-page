"use client";

/**
 * Everstock v9 (the home page), hosted by components/dc/host.jsx. The page's CSS (helmet,
 * pseudo-classes, host) is imported by app/page.tsx so it is in the first HTML
 * response, before this client-only chunk arrives.
 *
 * Site-side wiring on top of the design's logic (the design itself only flips its
 * forms to a local "sent" state):
 * - Every primary CTA ("Claim your spot", {{ ctaClaimLabel }}) goes through lib/cta.ts
 *   openClaim: the claim form prelaunch, sign-up once LAUNCH_MODE=live. "Book a demo" goes
 *   through openDemo: Cal.com once BOOKING_URL is set, else the fallback form. Both forms
 *   are components/forms/*, mounted in the root layout (they also open on #claim /
 *   #book-demo). The design's own early-access and demo modal modes are no longer opened.
 * - The free Stock Plan (its section's card and the design's "plan" modal) posts to
 *   /api/request-access (kind "stock-plan") before showing the design's sent state.
 * - Below-the-fold paints are deferred until their section is half a screen away
 *   (see DEFERRED), so the first load does not pay for the whole page at once.
 */
import * as dcrt from "./generated/dcrt";
import defineLogic from "./generated/logic";
import tree from "./generated/template.json";
import defaults from "./generated/props.json";
import { createDcPage, sendRequest } from "../dc/host";
import { pricingVals } from "../dc/pricingVals";
import { CLAIM_HREF, DEMO_HREF, claimLabel, currentSeats, loadSeats, onSeats, openClaim, openDemo, seatsLine } from "@/lib/cta";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const pageLoadedAt = typeof performance !== "undefined" ? performance.now() : 0;

/* Which button opened a form: its data-cta (hero, nav, foot, tb, …), for attribution. */
const ctaOf = (e) => (e && e.currentTarget && e.currentTarget.getAttribute && e.currentTarget.getAttribute("data-cta")) || "other";

/* Reads and checks a Stock Plan form; flags the first problem on its field and returns null. */
function readForm(form, state) {
  const field = (n) => form.elements.namedItem(n);
  const val = (n) => String((field(n) && field(n).value) || "").trim();
  const flag = (n, msg) => {
    const input = field(n);
    if (input && input.setCustomValidity) {
      input.setCustomValidity(msg);
      input.reportValidity();
      form.addEventListener("input", () => input.setCustomValidity(""), { once: true });
    }
    return null;
  };
  const name = val("name");
  const email = val("email");
  if (name.length < 2) return flag("name", "Add your name.");
  if (!EMAIL.test(email)) return flag("email", "Enter an email like you@company.com.");
  // the where / track choices are shared state; only a form that shows them sends them
  const has = (group) => !!form.querySelector(`[role="group"][aria-labelledby$="-${group}"]`);
  const where = has("where") ? (state.spWhere || []).join(", ") : "";
  const track = has("track") ? state.spTrack : "";
  const extra = [where && `Sells on: ${where}`, track && `Tracks inventory in: ${track}`].filter(Boolean);
  return { name, email, sells: val("sell"), fax: val("fax"), extra };
}

function sendStockPlan(data, cta, elapsed) {
  return sendRequest(
    {
      kind: "stock-plan",
      name: data.name,
      email: data.email,
      sells: data.sell || data.sells,
      fax: data.fax, // honeypot, checked by the route
      note: ["Free Stock Plan", ...data.extra].join("\n"),
      cta,
      elapsed,
    },
    "v9"
  );
}

/* The design paints every section's sprites and canvases in componentDidMount (about
   350ms of main thread on a fast desktop, several times that on a throttled phone).
   These are idempotent paint/layout procedures that bail when their refs are missing,
   and the loops that read their output already guard against it being absent, so each
   waits until its section comes within `margin` of the viewport, then runs once and
   passes through from then on (theme toggles and resizes call them again as designed).
   A section whose loop may already have stopped for lack of that layout gets its loop
   kicked again after the replay. Stakes waits for the viewport itself: its canvas is
   empty until the rain starts at 50% in view anyway. */
const HALF_SCREEN = "50% 0px 50% 0px";
const DEFERRED = [
  { fn: "layoutStakes", sections: ["problem"], kick: "stkKick", margin: "0px" },
  { fn: "fillBA", sections: ["how-it-works"], margin: HALF_SCREEN },
  { fn: "sizeInd", sections: ["industries"], margin: HALF_SCREEN },
  // lays out both acts; a jump can land near act 2 without passing act 1
  { fn: "layoutActs", sections: ["act-1", "act-2"], kick: "actKick", margin: HALF_SCREEN },
  { fn: "layoutWhy", sections: ["why"], kick: "whyKick", margin: HALF_SCREEN },
  // the Plan section is back (2026-10-30, scripts/port-patches/v9-plan.mjs); its loop runs
  // while it is on screen and simply draws nothing until this layout exists
  { fn: "layoutPlan", sections: ["plan"], margin: HALF_SCREEN },
  // the closing crate stack is in the footer
  { fn: "fillClosing", sections: ["cta"], margin: HALF_SCREEN },
];

const extend = (DesignLogic) =>
  class Logic extends DesignLogic {
    constructor(props) {
      super(props);
      const mSubmit = this.mSubmit;
      const spSubmit = this.spSubmit;

      // readiness is per instance (DEFERRED is shared module state)
      const io = typeof IntersectionObserver !== "undefined";
      this.pendingPaint = new Set();
      this.deferred = DEFERRED.map((d) => ({ ...d, ready: !io }));
      for (const d of this.deferred) {
        const paint = DesignLogic.prototype[d.fn];
        this[d.fn] = (...args) => {
          if (d.ready) return paint.apply(this, args);
          this.pendingPaint.add(d.fn);
        };
      }

      this.openFounding = (e) => {
        this.setState({ navMenu: false });
        openClaim(ctaOf(e), e);
      };
      this.openDemo = (e) => {
        this.setState({ navMenu: false });
        openDemo(ctaOf(e), e);
      };

      // the design's modal: only its Stock Plan mode is still opened (goPF)
      this.mSubmit = (e) => {
        e.preventDefault();
        if (this.state.mSent) return;
        const data = readForm(e.currentTarget, this.state);
        if (!data) return;
        sendStockPlan(data, this.mCta || "other", performance.now() - (this.accOpenedAt || pageLoadedAt));
        mSubmit(e);
      };
      // the Stock Plan card in its section
      this.spSubmit = (e) => {
        e.preventDefault();
        if (this.state.spSent) return;
        const data = readForm(e.currentTarget, this.state);
        if (!data) return;
        sendStockPlan(data, "stock-plan-card", performance.now() - pageLoadedAt);
        spSubmit(e);
      };
    }

    // every modal opener goes through mOpen; the route's minimum-fill-time check counts from here
    mOpen(kind, e) {
      this.accOpenedAt = performance.now();
      this.mCta = ctaOf(e);
      super.mOpen(kind, e);
    }

    componentDidMount() {
      try {
        super.componentDidMount();
      } finally {
        // even if the design's mount throws, the deferred paints still get observers
        this.watchDeferred();
      }
      // the seat line and the claim label follow the real count once it arrives
      this.offSeats = onSeats(() => !this.dead && this.setState({ seatsAt: Date.now() }));
      loadSeats();
      // section links from /pricing (/#how-it-works, /#industries) arrive before the
      // client-rendered page exists, so the browser's own jump lands at the top
      const target = location.hash.length > 1 && document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (target) {
        const jump = () => window.scrollTo(0, target.getBoundingClientRect().top + window.scrollY);
        requestAnimationFrame(jump);
        setTimeout(() => { if (!this.dead) jump(); }, 600);
      }
    }

    watchDeferred() {
      if (typeof IntersectionObserver === "undefined") return;
      this.ioNear = [...new Set(this.deferred.map((d) => d.margin))].map((margin) => {
        const mine = this.deferred.filter((d) => d.margin === margin);
        const obs = new IntersectionObserver(
          (entries) =>
            entries.forEach((en) => {
              // edge-adjacent counts as intersecting (a section starting exactly at
              // the fold), so it takes a real overlap
              if (!en.isIntersecting || en.intersectionRatio === 0) return;
              obs.unobserve(en.target);
              for (const d of mine) {
                if (!d.sections.includes(en.target.id)) continue;
                d.ready = true;
                if (!this.pendingPaint.delete(d.fn)) continue;
                this[d.fn]();
                if (d.kick && this[d.kick]) this[d.kick]();
              }
            }),
          { rootMargin: margin, threshold: 0.01 }
        );
        new Set(mine.flatMap((d) => d.sections)).forEach((id) => {
          const el = document.getElementById(id);
          if (el) obs.observe(el);
        });
        // a paint whose section is not on the page (a design change) runs as designed
        // instead of waiting for an observer that never fires
        for (const d of mine) {
          if (d.sections.some((id) => document.getElementById(id))) continue;
          d.ready = true;
          if (this.pendingPaint.delete(d.fn)) this[d.fn]();
        }
        return obs;
      });
    }

    componentWillUnmount() {
      (this.ioNear || []).forEach((obs) => obs.disconnect());
      if (this.offSeats) this.offSeats();
      super.componentWillUnmount();
    }

    renderVals() {
      return {
        ...super.renderVals(),
        ctaClaimHref: CLAIM_HREF,
        ctaClaimLabel: claimLabel(currentSeats()),
        ctaBookDemoHref: DEMO_HREF,
        seatsLine: seatsLine(currentSeats()),
        // the pricing section (cards, Monthly / Yearly toggle, billing FAQ), from lib/pricing.config.ts
        ...pricingVals(this.state, (patch) => this.setState(patch)),
      };
    }
  };

export default createDcPage({ name: "Everstock v9", tree, defaults, dcrt, defineLogic, extend });
