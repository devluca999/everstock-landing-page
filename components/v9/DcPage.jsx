"use client";

/**
 * Everstock v9 (the home page), hosted by components/dc/host.jsx. The page's CSS (helmet,
 * pseudo-classes, host) is imported by app/page.tsx so it is in the first HTML
 * response, before this client-only chunk arrives.
 *
 * Site-side wiring on top of the design's logic (the design itself only flips its
 * forms to a local "sent" state):
 * - CTA destinations come from lib/cta.ts: the template's hrefs are bound to the
 *   cta*Href render values below. "Book a demo" goes to the booking URL once set, else
 *   the demo modal; "Get early access" opens the modal in early access (waitlist) mode.
 * - v9's forms (the Stock Plan card and the plan / early access / demo modal) post to
 *   /api/request-access → Convex before showing the design's sent state. The fields the
 *   route has no column for (what they sell, where, how they track, what to look at)
 *   travel in the note.
 * - Below-the-fold paints are deferred until their section is half a screen away
 *   (see DEFERRED), so the first load does not pay for the whole page at once.
 */
import * as dcrt from "./generated/dcrt";
import defineLogic from "./generated/logic";
import tree from "./generated/template.json";
import defaults from "./generated/props.json";
import { createDcPage, sendRequest } from "../dc/host";
import { CTA } from "@/lib/cta";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const pageLoadedAt = typeof performance !== "undefined" ? performance.now() : 0;

// modal mode (or the Stock Plan card) → how the row is stored
const KINDS = {
  plan: { source: "stock-plan", note: "Stock Plan" },
  early: { source: "waitlist", note: "Early access", waitlist: true },
  demo: { source: "book-demo", note: "Book a demo" },
};

/* Reads and checks a v9 form; flags the first problem on its field and returns null. */
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
  const extra = [
    val("sell") && `Sells: ${val("sell")}`,
    where && `Sells on: ${where}`,
    track && `Tracks inventory in: ${track}`,
    val("look") && `Look at: ${val("look")}`,
  ].filter(Boolean);
  return { name, email, company: val("company"), website: val("website"), extra };
}

function send(data, kind, elapsed) {
  const k = KINDS[kind];
  return sendRequest(
    {
      name: data.name,
      email: data.email,
      company: data.company,
      website: data.website, // honeypot, checked by the route
      stack: "other",
      source: k.source,
      waitlist: k.waitlist,
      note: [k.note, ...data.extra].join("\n"),
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
  // v8 dropped the Plan section (layoutPlan bails without its refs); the closing crate
  // stack is in the footer
  { fn: "fillClosing", sections: ["cta"], margin: HALF_SCREEN },
];

const extend = (DesignLogic) =>
  class Logic extends DesignLogic {
    constructor(props) {
      super(props);
      const openDemo = this.openDemo;
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

      this.openDemo = (e) => {
        if (CTA.bookDemo.externalUrl) {
          // opened synchronously (not after the tap stamp) so it is not popup-blocked
          if (e && e.preventDefault) e.preventDefault();
          this.setState({ navMenu: false });
          window.open(CTA.bookDemo.externalUrl, "_blank", "noopener,noreferrer");
          return;
        }
        openDemo(e);
      };

      // the modal (plan / early access / demo)
      this.mSubmit = (e) => {
        e.preventDefault();
        if (this.state.mSent) return;
        const data = readForm(e.currentTarget, this.state);
        if (!data) return;
        send(data, this.state.modal || "plan", performance.now() - (this.accOpenedAt || pageLoadedAt));
        mSubmit(e);
      };
      // the Stock Plan card in its section
      this.spSubmit = (e) => {
        e.preventDefault();
        if (this.state.spSent) return;
        const data = readForm(e.currentTarget, this.state);
        if (!data) return;
        send(data, "plan", performance.now() - pageLoadedAt);
        spSubmit(e);
      };
    }

    // every modal opener goes through mOpen; the route's minimum-fill-time check counts from here
    mOpen(kind, e) {
      this.accOpenedAt = performance.now();
      super.mOpen(kind, e);
    }

    componentDidMount() {
      try {
        super.componentDidMount();
      } finally {
        // even if the design's mount throws, the deferred paints still get observers
        this.watchDeferred();
      }
      // CTA links opened in a new tab, shared, or typed arrive as /#book-demo or
      // /#waitlist (#access, #request: the older early-access links); they open what the
      // click would have
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
        ctaWaitlistHref: CTA.waitlist.href,
        ctaBookDemoHref: CTA.bookDemo.href,
      };
    }
  };

export default createDcPage({ name: "Everstock v9", tree, defaults, dcrt, defineLogic, extend });
