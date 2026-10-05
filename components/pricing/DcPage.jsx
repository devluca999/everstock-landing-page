"use client";

/**
 * Pricing (Claude Design "Pricing.dc.html"), hosted by components/dc/host.jsx. The page's
 * CSS is imported by app/pricing/page.tsx so it is in the first HTML response.
 *
 * Site-side wiring on top of the design's logic, the same as the home page's:
 * - CTA destinations come from lib/cta.ts (the template's hrefs are bound to the
 *   cta*Href render values below); "Book a demo" goes to the booking URL once set.
 * - The Request access modal (demo / founding partner waitlist) posts to
 *   /api/request-access → Convex. The design defines its submit handler inside
 *   renderVals(), so it is wrapped there.
 * - /pricing#book-demo and /pricing#waitlist open the matching modal on arrival.
 * - Deterministic paints baked by the port (generated/bakes.json) load as PNGs instead of
 *   painting at mount: the closing crate stack alone was ~100ms of main thread on a fast
 *   desktop, several times that on a phone.
 */
import * as dcrt from "./generated/dcrt";
import defineLogic from "./generated/logic";
import tree from "./generated/template.json";
import defaults from "./generated/props.json";
import bakes from "./generated/bakes.json";
import { createDcPage, sendRequest } from "../dc/host";
import { CTA } from "@/lib/cta";

const pageLoadedAt = typeof performance !== "undefined" ? performance.now() : 0;
const SOURCES = { demo: "book-demo", founding: "founding-partner" };
const NOTES = { demo: "Book a demo (pricing page)", founding: "Founding partner waitlist (pricing page)" };

const extend = (DesignLogic) =>
  class Logic extends DesignLogic {
    constructor(props) {
      super(props);
      const openDemo = this.openDemo;
      const openFounding = this.openFounding;
      this.openDemo = (e) => {
        if (CTA.bookDemo.externalUrl) {
          if (e && e.preventDefault) e.preventDefault();
          this.setState({ navMenu: false });
          window.open(CTA.bookDemo.externalUrl, "_blank", "noopener,noreferrer");
          return;
        }
        this.accOpenedAt = performance.now();
        openDemo(e);
      };
      this.openFounding = (e) => {
        this.accOpenedAt = performance.now();
        openFounding(e);
      };
    }

    paintStack() {
      return bakes.paintStack || super.paintStack();
    }

    componentDidMount() {
      super.componentDidMount();
      this.onHash = () => {
        const h = location.hash;
        if (h === "#book-demo") {
          if (CTA.bookDemo.externalUrl) location.assign(CTA.bookDemo.externalUrl);
          else this.openDemo();
        } else if (h === CTA.waitlist.href) this.openFounding();
      };
      this.onHash();
      window.addEventListener("hashchange", this.onHash);
    }

    componentWillUnmount() {
      window.removeEventListener("hashchange", this.onHash);
      super.componentWillUnmount();
    }

    renderVals() {
      const vals = super.renderVals();
      const submitAccess = vals.submitAccess;
      return {
        ...vals,
        submitAccess: (e) => {
          const f = new FormData(e.currentTarget);
          const plan = this.state.plan in SOURCES ? this.state.plan : "founding";
          sendRequest(
            {
              email: String(f.get("email") || ""),
              company: String(f.get("company") || ""),
              stack: "other",
              source: SOURCES[plan],
              note: NOTES[plan],
              elapsed: performance.now() - (this.accOpenedAt || pageLoadedAt),
            },
            "pricing"
          );
          if (submitAccess) submitAccess(e);
        },
        ctaWaitlistHref: CTA.waitlist.href,
        ctaBookDemoHref: CTA.bookDemo.href,
      };
    }
  };

export default createDcPage({ name: "Everstock pricing", tree, defaults, dcrt, defineLogic, extend });
