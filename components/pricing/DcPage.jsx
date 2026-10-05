"use client";

/**
 * Pricing (Claude Design "Pricing.dc.html"), hosted by components/dc/host.jsx. The page's
 * CSS is imported by app/pricing/page.tsx so it is in the first HTML response.
 *
 * Site-side wiring on top of the design's logic, the same as the home page's:
 * - CTA destinations come from lib/cta.ts (the template's hrefs are bound to the
 *   cta*Href render values below); "Book a demo" goes to the booking URL once set.
 * - The waitlist / Book a demo modal posts to /api/request-access → Convex, then asks its
 *   follow-up questions (components/dc/accessFlow.js). The design defines its submit
 *   handler inside renderVals(), so it is wrapped there.
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
import { createDcPage } from "../dc/host";
import { submitAccess as sendAccess, accessVals } from "../dc/accessFlow";
import { CTA } from "@/lib/cta";

const pageLoadedAt = typeof performance !== "undefined" ? performance.now() : 0;
const NOTES = { demo: "Book a demo (pricing page)", waitlist: "Waitlist (pricing page)" };
// the design calls the waitlist mode "founding"; the site's forms say waitlist
const planOf = (state) => (state.plan === "demo" ? "demo" : "waitlist");

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
      const plan = planOf(this.state);
      return {
        ...vals,
        ...accessVals(this, plan),
        submitAccess: (e) =>
          sendAccess(this, e, {
            plan,
            note: NOTES[plan],
            elapsed: performance.now() - (this.accOpenedAt || pageLoadedAt),
            tag: "pricing",
            designSubmit: (ev) => vals.submitAccess && vals.submitAccess(ev),
          }),
        ctaWaitlistHref: CTA.waitlist.href,
        ctaBookDemoHref: CTA.bookDemo.href,
      };
    }
  };

export default createDcPage({ name: "Everstock pricing", tree, defaults, dcrt, defineLogic, extend });
