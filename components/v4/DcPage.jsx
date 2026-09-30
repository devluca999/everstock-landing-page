"use client";

/**
 * Everstock v4, hosted by components/dc/host.jsx. The page's CSS (helmet,
 * pseudo-classes, host) is imported by app/page.tsx so it is in the first HTML
 * response, before this client-only chunk arrives.
 *
 * Site-side wiring on top of the design's logic (the design itself only flips its
 * forms to a local "sent" state):
 * - CTA destinations come from lib/cta.ts: the template's hrefs are bound to the
 *   cta*Href render values below, and "Book a demo" goes to the booking URL once set.
 * - The Request access modal (demo / early access / founding partner) posts to
 *   /api/request-access → Convex.
 * - The records form validates the email, shows its RECEIVED stamp, then opens the
 *   modal with the email prefilled. Files are not uploaded yet (see uploadRecords).
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

const SOURCES = { demo: "book-demo", early: "early-access", founding: "founding-partner" };
const NOTES = { demo: "Book a demo", early: "Early access", founding: "Founding partner program" };

/**
 * TODO(records-upload): upload + storage plug in here. Today it only returns the
 * chosen file names, which ride along in the request's note; nothing leaves the
 * browser. When the backend exists, upload `files` and return a reference to them.
 */
function uploadRecords(files) {
  return files.map((f) => f.name).join(", ");
}

/* Sets the modal's email once it has rendered (the input is uncontrolled). */
function prefillModalEmail(email) {
  let tries = 0;
  const tick = () => {
    const input = document.getElementById("acc-email");
    if (input) {
      if (!input.value) input.value = email;
      const company = input.form && input.form.elements.namedItem("company");
      if (company && company.focus) company.focus();
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
  { fn: "layoutStakes", section: "stakes", kick: "stkKick", margin: "0px" },
  { fn: "fillBA", section: "before-after", margin: HALF_SCREEN },
  { fn: "sizeInd", section: "industries", margin: HALF_SCREEN },
  { fn: "layoutActs", section: "act-1", kick: "actKick", margin: HALF_SCREEN },
  { fn: "layoutWhy", section: "why", kick: "whyKick", margin: HALF_SCREEN },
  { fn: "layoutPlan", section: "plan", margin: HALF_SCREEN },
  { fn: "fillClosing", section: "price-file", margin: HALF_SCREEN },
];

const extend = (DesignLogic) =>
  class Logic extends DesignLogic {
    constructor(props) {
      super(props);
      const openAccess = this.openAccess;
      const openDemo = this.openDemo;
      const openFounding = this.openFounding;
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
        this.records = null;
      };
      this.openAccess = (e) => {
        opened();
        openAccess(e);
      };
      this.openFounding = (e) => {
        opened();
        openFounding(e);
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
        const f = new FormData(e.currentTarget);
        const plan = this.state.plan in SOURCES ? this.state.plan : "early";
        const rec = this.records;
        sendRequest(
          {
            email: String(f.get("email") || ""),
            company: String(f.get("company") || ""),
            stack: "other",
            source: rec ? "scattered-records" : SOURCES[plan],
            note: rec ? "Scattered records form" + (rec.files ? ": " + rec.files + " (files not uploaded yet)" : "") : NOTES[plan],
            elapsed: performance.now() - (this.accOpenedAt || pageLoadedAt),
          },
          "v4"
        );
        submitAccess(e);
      };

      this.submitForm = (e) => {
        const form = e.currentTarget;
        const input = form.elements.namedItem("email");
        const email = String((input && input.value) || "").trim();
        if (!EMAIL.test(email)) {
          e.preventDefault();
          if (input && input.setCustomValidity) {
            input.setCustomValidity("Enter a work email, like you@company.com.");
            input.reportValidity();
            input.addEventListener("input", () => input.setCustomValidity(""), { once: true });
          }
          return;
        }
        const picker = form.elements.namedItem("files");
        const files = picker && picker.files ? Array.from(picker.files) : [];
        submitForm(e); // the design's RECEIVED state
        this.openAccess();
        this.records = { files: uploadRecords(files) };
        prefillModalEmail(email);
      };
    }

    componentDidMount() {
      super.componentDidMount();
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
                if (d.section !== en.target.id) continue;
                d.ready = true;
                if (!this.pendingPaint.delete(d.fn)) continue;
                this[d.fn]();
                if (d.kick && this[d.kick]) this[d.kick]();
              }
            }),
          { rootMargin: margin, threshold: 0.01 }
        );
        new Set(mine.map((d) => d.section)).forEach((id) => {
          const el = document.getElementById(id);
          if (el) obs.observe(el);
        });
        return obs;
      });
    }

    componentWillUnmount() {
      (this.ioNear || []).forEach((obs) => obs.disconnect());
      super.componentWillUnmount();
    }

    renderVals() {
      return {
        ...super.renderVals(),
        ctaBookDemoHref: CTA.bookDemo.href,
        ctaEarlyAccessHref: CTA.earlyAccess.href,
        ctaRecordsHref: CTA.scatteredRecords.href,
        ctaJourneyHref: CTA.journey.href,
      };
    }
  };

export default createDcPage({ name: "Everstock v4", tree, defaults, dcrt, defineLogic, extend });
