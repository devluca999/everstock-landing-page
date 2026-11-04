"use client";

/**
 * Pricing (Claude Design "Pricing.dc.html"), hosted by components/dc/host.jsx. The page's
 * CSS is imported by app/pricing/page.tsx so it is in the first HTML response.
 *
 * Site-side wiring on top of the design's logic, the same as the home page's:
 * - Every primary CTA ({{ ctaClaimLabel }}, the stockbot and Base tiers, the scenes) goes
 *   through lib/cta.ts openClaim: the claim form prelaunch, sign-up once LAUNCH_MODE=live.
 *   "Book a demo" (Scale, Enterprise, the secondary links) goes through openDemo: Cal.com
 *   once BOOKING_URL is set, else the fallback form. Both forms live in the root layout and
 *   also open on /pricing#claim and /pricing#book-demo. The design's own modal is no longer
 *   opened.
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
import { BILLING_FAQ, FOUNDING, baseSeatsAnswer, plan, priceFor, sceneNote, seatsRow, tierHeader, usd } from "@/lib/pricing.config";
import { CLAIM_HREF, DEMO_HREF, claimLabel, currentSeats, loadSeats, onSeats, openClaim, openDemo, seatsLine } from "@/lib/cta";

const ctaOf = (e) => (e && e.currentTarget && e.currentTarget.getAttribute && e.currentTarget.getAttribute("data-cta")) || "other";

const extend = (DesignLogic) =>
  class Logic extends DesignLogic {
    constructor(props) {
      super(props);
      this.openFounding = (e) => {
        this.setState({ navMenu: false });
        openClaim(`pricing-${ctaOf(e)}`, e);
      };
      this.openDemo = (e) => {
        this.setState({ navMenu: false });
        openDemo(`pricing-${ctaOf(e)}`, e);
      };
      // the tiers' and scenes' claim label (a logic patch reads it, see claim.mjs)
      this.claimText = () => claimLabel(currentSeats());
    }

    // prices from lib/pricing.config.ts (scripts/port-patches/pricing-billing.mjs calls these from
    // the design's class fields, so they are prototype methods, there before the fields run)
    tierHeader(id) {
      return tierHeader(id);
    }
    scenePrice(id) {
      const pr = priceFor(plan(id), "monthly");
      return { price: pr.amount, per: !!pr.per, pre: !!pr.pre, note: sceneNote(id) };
    }
    seatsRow() {
      return seatsRow();
    }

    paintStack() {
      return bakes.paintStack || super.paintStack();
    }

    componentDidMount() {
      super.componentDidMount();
      this.offSeats = onSeats(() => !this.dead && this.setState({ seatsAt: Date.now() }));
      loadSeats();
    }

    componentWillUnmount() {
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
        prFoundingMo: `${usd(FOUNDING.monthly)}/mo`,
        faqBaseSeats: baseSeatsAnswer(),
        faqCancel: BILLING_FAQ[0].a,
      };
    }
  };

export default createDcPage({ name: "Everstock pricing", tree, defaults, dcrt, defineLogic, extend });
