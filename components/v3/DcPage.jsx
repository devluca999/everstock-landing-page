"use client";

/**
 * Everstock v3 (now served at /journey), hosted by components/dc/host.jsx.
 * The page's CSS (helmet, pseudo-classes, host) is imported by app/journey/page.tsx so
 * it is in the first HTML response, before this client-only chunk arrives.
 */
import * as dcrt from "./generated/dcrt";
import defineLogic from "./generated/logic";
import tree from "./generated/template.json";
import defaults from "./generated/props.json";
import { createDcPage, sendRequest } from "../dc/host";

const pageLoadedAt = typeof performance !== "undefined" ? performance.now() : 0;

/* The design's two forms only flip to their "sent" state; here they also post to
   /api/request-access (Convex), leaving the design's own handlers and UI untouched. */
const extend = (DesignLogic) =>
  class Logic extends DesignLogic {
    constructor(props) {
      super(props);
      const openAccess = this.openAccess;
      const openFounding = this.openFounding;
      const submitAccess = this.submitAccess;
      const submitForm = this.submitForm;
      this.openAccess = (e) => {
        this.accOpenedAt = performance.now();
        openAccess(e);
      };
      this.openFounding = (e) => {
        this.accOpenedAt = performance.now();
        openFounding(e);
      };
      this.submitAccess = (e) => {
        const f = new FormData(e.currentTarget);
        const founding = this.state.plan === "founding";
        sendRequest(
          {
            email: String(f.get("email") || ""),
            company: String(f.get("company") || ""),
            stack: "other",
            source: founding ? "founding-partner" : "early-access",
            note: founding ? "Founding partner program" : "Early access",
            elapsed: performance.now() - (this.accOpenedAt || pageLoadedAt),
          },
          "v3"
        );
        submitAccess(e);
      };
      this.submitForm = (e) => {
        const f = new FormData(e.currentTarget);
        const file = f.get("file");
        sendRequest(
          {
            email: String(f.get("email") || ""),
            stack: "other",
            source: "price-file",
            note: "Price file form" + (file && file.name ? ": " + file.name + " (file not uploaded yet)" : ""),
            elapsed: performance.now() - pageLoadedAt,
          },
          "v3"
        );
        submitForm(e);
      };
    }
  };

export default createDcPage({ name: "Everstock v3", tree, defaults, dcrt, defineLogic, extend });
