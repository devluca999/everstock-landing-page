"use client";

/**
 * Everstock v5 (the home page), hosted by components/dc/host.jsx. The page's CSS (helmet,
 * pseudo-classes, host) is imported by app/page.tsx so it is in the first HTML
 * response, before this client-only chunk arrives.
 *
 * Site-side wiring on top of the design's logic (the design itself only flips its
 * forms to a local "sent" state):
 * - CTA destinations come from lib/cta.ts: the template's hrefs are bound to the
 *   cta*Href render values below. "Join the waitlist" opens the modal in founding
 *   partner mode; "Book a demo" goes to the booking URL once set, else the demo modal.
 * - The waitlist / Book a demo modal posts to /api/request-access → Convex, then asks its
 *   follow-up questions (components/dc/accessFlow.js).
 * - The closing Book a demo card validates the email, shows its RECEIVED stamp, then
 *   opens the booking link (recording the email first) or the demo modal prefilled.
 * - Below-the-fold paints are deferred until their section is half a screen away
 *   (see DEFERRED), so the first load does not pay for the whole page at once.
 */
import * as dcrt from "./generated/dcrt";
import defineLogic from "./generated/logic";
import tree from "./generated/template.json";
import defaults from "./generated/props.json";
import { createDcPage, sendRequest } from "../dc/host";
import { submitAccess as sendAccess, accessVals } from "../dc/accessFlow";
import { CTA } from "@/lib/cta";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const pageLoadedAt = typeof performance !== "undefined" ? performance.now() : 0;

const NOTES = { demo: "Book a demo", waitlist: "Waitlist" };
// the design calls the waitlist mode "founding"; the site's forms say waitlist
const planOf = (state) => (state.plan === "demo" ? "demo" : "waitlist");
const CARD_NOTE = "Book a demo card";

/* Sets the modal's email once it has rendered (the input is uncontrolled). */
function prefillModalEmail(email) {
  let tries = 0;
  const tick = () => {
    const input = document.getElementById("acc-email");
    if (input) {
      if (!input.value) input.value = email;
      const name = input.form && input.form.elements.namedItem("name");
      if (name && name.focus) name.focus();
      return;
    }
    if (++tries < 90) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
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
  { fn: "layoutStakes", sections: ["stakes"], kick: "stkKick", margin: "0px" },
  { fn: "fillBA", sections: ["how-it-works"], margin: HALF_SCREEN },
  { fn: "sizeInd", sections: ["industries"], margin: HALF_SCREEN },
  // lays out both acts; a jump can land near act 2 without passing act 1
  { fn: "layoutActs", sections: ["act-1", "act-2"], kick: "actKick", margin: HALF_SCREEN },
  { fn: "layoutWhy", sections: ["why"], kick: "whyKick", margin: HALF_SCREEN },
  { fn: "layoutPlan", sections: ["plan"], margin: HALF_SCREEN },
  { fn: "fillClosing", sections: ["price-file"], margin: HALF_SCREEN },
];

const extend = (DesignLogic) =>
  class Logic extends DesignLogic {
    constructor(props) {
      super(props);
      const openDemo = this.openDemo;
      const submitAccess = this.submitAccess;
      const submitForm = this.submitForm;

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

      const opened = () => {
        this.accOpenedAt = performance.now();
        this.fromCard = false;
      };
      // "Join the waitlist" is now a stamped primary CTA, so it opens the way the design's
      // openDemo does (closes the phone menu, waits for the tap stamp), in founding mode
      this.openFounding = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        this.accReturn = document.activeElement;
        this.setState({ navMenu: false });
        opened();
        this.openLater(() => this.setState({ modal: true, plan: "founding", accSent: false }));
      };
      this.openDemo = (e) => {
        if (CTA.bookDemo.externalUrl) {
          // opened synchronously (not after the tap stamp) so it is not popup-blocked
          if (e && e.preventDefault) e.preventDefault();
          this.setState({ navMenu: false });
          window.open(CTA.bookDemo.externalUrl, "_blank", "noopener,noreferrer");
          return;
        }
        opened();
        openDemo(e);
      };

      this.submitAccess = (e) => {
        const plan = planOf(this.state);
        sendAccess(this, e, {
          plan,
          note: this.fromCard && plan === "demo" ? CARD_NOTE : NOTES[plan],
          elapsed: performance.now() - (this.accOpenedAt || pageLoadedAt),
          tag: "v5",
          designSubmit: submitAccess,
        });
      };

      // the closing Book a demo card (the design's records form, patched)
      this.submitForm = (e) => {
        const form = e.currentTarget;
        const input = form.elements.namedItem("email");
        const email = String((input && input.value) || "").trim();
        if (!EMAIL.test(email)) {
          e.preventDefault();
          if (input && input.setCustomValidity) {
            input.setCustomValidity("Enter an email, like you@company.com.");
            input.reportValidity();
            input.addEventListener("input", () => input.setCustomValidity(""), { once: true });
          }
          return;
        }
        submitForm(e); // the design's RECEIVED state
        if (CTA.bookDemo.externalUrl) {
          // record the email first: the booking tool is outside the site
          sendRequest({ email, stack: "other", source: "book-demo", note: CARD_NOTE, elapsed: performance.now() - pageLoadedAt }, "v5");
          window.open(CTA.bookDemo.externalUrl, "_blank", "noopener,noreferrer");
          return;
        }
        this.openDemo();
        this.fromCard = true;
        // the route's minimum-fill-time bot check counts from here; the visitor already
        // filled the card, so the clock starts at page load, not at the modal
        this.accOpenedAt = pageLoadedAt;
        prefillModalEmail(email);
      };
    }

    componentDidMount() {
      try {
        super.componentDidMount();
      } finally {
        // even if the design's mount throws, the deferred paints still get observers
        this.watchDeferred();
      }
      // CTA links opened in a new tab, shared, or typed arrive as /#book-demo or
      // /#waitlist (#access, #request: the older early-access links, which now mean the
      // waitlist); they open what the click would have
      this.onHash = () => {
        const h = location.hash;
        if (h === "#book-demo") {
          if (CTA.bookDemo.externalUrl) location.assign(CTA.bookDemo.externalUrl);
          else this.openDemo();
        } else if (h === CTA.waitlist.href || h === "#access" || h === "#request") this.openFounding();
      };
      this.onHash();
      window.addEventListener("hashchange", this.onHash);
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
      window.removeEventListener("hashchange", this.onHash);
      super.componentWillUnmount();
    }

    renderVals() {
      return {
        ...super.renderVals(),
        ...accessVals(this, planOf(this.state)),
        ctaWaitlistHref: CTA.waitlist.href,
        ctaBookDemoHref: CTA.bookDemo.href,
      };
    }
  };

export default createDcPage({ name: "Everstock v5", tree, defaults, dcrt, defineLogic, extend });
