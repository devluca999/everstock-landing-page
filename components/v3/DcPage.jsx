"use client";

/**
 * Hosts a ported Claude Design page (see scripts/port-dc.mjs) the way the dc-runtime
 * (mockup/v3/support.js) hosts it: the logic class is instantiated from the design's
 * own source, its setState merges synchronously into logic.state, and the template is
 * rendered against { ...props, ...logic.renderVals() } with the runtime's own
 * expression and attribute helpers. Each builder below mirrors its runtime namesake
 * (walkText / walkFor / walkIf / walkElement, StreamableLogic, StreamableComponent).
 */
import React from "react";
import { resolve, compileAttr, cssToObj } from "./generated/dcrt";
import defineLogic from "./generated/logic";
import tree from "./generated/template.json";
import defaults from "./generated/props.json";
// the page's CSS (helmet, pseudo-classes, host) is imported by app/page.tsx so it is in
// the first HTML response, before this client-only chunk arrives

const h = React.createElement;
const Fragment = React.Fragment;

/* ---------- template builders (src/compile.ts) ---------- */
function build(node) {
  if (node.t === "text") {
    const txt = node.v;
    if (!txt.includes("{{")) return () => txt;
    const parts = txt.split(/\{\{([\s\S]+?)\}\}/g);
    return (vals, ctx, key) =>
      h(
        Fragment,
        { key },
        ...parts.map((p, i) => {
          if (!(i & 1)) return p;
          const v = resolve(vals, p);
          if (v === undefined) return null;
          if (React.isValidElement(v) || Array.isArray(v)) return h(Fragment, { key: i }, v);
          if (v === null || typeof v === "boolean") return null;
          return h("span", { key: i, className: "sc-interp" }, String(v));
        })
      );
  }
  if (node.t === "for") {
    const listGet = compileAttr(node.list);
    const kids = node.kids.map(build);
    return (vals, ctx, key) => {
      let list = listGet(vals);
      if (!Array.isArray(list)) list = [];
      return h(
        Fragment,
        { key },
        list.map((item, i) => {
          const sub = { ...vals, [node.as]: item, $index: i };
          return h(Fragment, { key: i }, kids.map((b, j) => b(sub, ctx, j)));
        })
      );
    };
  }
  if (node.t === "if") {
    const valGet = compileAttr(node.value);
    const kids = node.kids.map(build);
    return (vals, ctx, key) => (valGet(vals) ? h(Fragment, { key }, kids.map((b, j) => b(vals, ctx, j))) : null);
  }
  const getters = node.props.map(([k, raw]) => [k, compileAttr(raw)]);
  const kids = node.kids.map(build);
  return (vals, ctx, key) => {
    const props = { key };
    for (const [k, g] of getters) {
      let v = g(vals);
      if (k === "style" && typeof v === "string") v = cssToObj(v);
      if ((k === "value" || k === "checked") && v === undefined) v = k === "checked" ? false : "";
      props[k] = v;
    }
    if (node.cls) props.className = [props.className, ...node.cls].filter(Boolean).join(" ");
    return h(node.tag, props, ...kids.map((b, j) => b(vals, ctx, j)));
  };
}
const builders = tree.map(build);
const renderTemplate = (vals, ctx) => builders.map((b, i) => b(vals || {}, ctx, i));

/* ---------- logic base (src/logic.ts) ---------- */
class StreamableLogic {
  constructor(props) {
    this.props = props || {};
    this.state = {};
    this.__host = undefined;
  }
  setState(update, cb) {
    this.__host && this.__host.__setLogicState(update, cb);
  }
  forceUpdate() {
    this.__host && this.__host.forceUpdate();
  }
  componentDidMount() {}
  componentDidUpdate() {}
  componentWillUnmount() {}
  renderVals() {
    return {};
  }
}
const DesignLogic = defineLogic(StreamableLogic, StreamableLogic, React);

/* The design's two forms only flip to their "sent" state (a handoff open item). Here
   they also post to /api/request-access (Convex), leaving the design's own handlers
   and UI untouched: the sent state shows at once, as designed, and the request goes
   out alongside it. */
function sendRequest(fields) {
  const params = new URLSearchParams(location.search);
  const utm = {};
  params.forEach((v, k) => {
    if (k.startsWith("utm_")) utm[k] = v;
  });
  fetch("/api/request-access", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    body: JSON.stringify({ ...fields, referrer: document.referrer, utm }),
  })
    .then((r) => (r.ok ? r.json() : r.json().then((j) => Promise.reject(j.error || r.status))))
    .catch((err) => console.error("[v3] request not recorded:", err));
}
const pageLoadedAt = typeof performance !== "undefined" ? performance.now() : 0;

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
      sendRequest({
        email: String(f.get("email") || ""),
        company: String(f.get("company") || ""),
        stack: "other",
        source: founding ? "founding-partner" : "early-access",
        note: founding ? "Founding partner program" : "Early access",
        elapsed: performance.now() - (this.accOpenedAt || pageLoadedAt),
      });
      submitAccess(e);
    };
    this.submitForm = (e) => {
      const f = new FormData(e.currentTarget);
      const file = f.get("file");
      sendRequest({
        email: String(f.get("email") || ""),
        stack: "other",
        source: "price-file",
        note: "Price file form" + (file && file.name ? ": " + file.name + " (file not uploaded yet)" : ""),
        elapsed: performance.now() - pageLoadedAt,
      });
      submitForm(e);
    };
  }
}

/* ---------- host (src/component.ts) ---------- */
class DcHost extends React.Component {
  constructor(props) {
    super(props);
    this.state = { __v: 0 };
    this.logic = new Logic(props);
    this.logic.__host = this;
  }
  __setLogicState(update, cb) {
    const prev = this.logic.state;
    const patch = typeof update === "function" ? update(prev) : update;
    this.logic.state = { ...prev, ...patch };
    this.setState((s) => ({ __v: s.__v + 1 }), cb);
  }
  componentDidMount() {
    try {
      this.logic.componentDidMount();
    } catch (e) {
      console.error(e);
    }
  }
  componentDidUpdate(prevProps) {
    this.logic.props = this.props;
    // The runtime passes prevProps only (no prevState), exactly as here, so the
    // design's componentDidUpdate(pp, ps) stops at its first `ps.` read. Kept as-is:
    // that is how the page behaves in Claude Design.
    try {
      this.logic.componentDidUpdate(prevProps);
    } catch (e) {
      if (process.env.NODE_ENV !== "production" && !this.__warnedDidUpdate) {
        this.__warnedDidUpdate = true;
        console.warn("[v3] logic.componentDidUpdate threw (same as in the dc-runtime):", e);
      }
    }
  }
  componentWillUnmount() {
    try {
      this.logic.componentWillUnmount();
    } catch (e) {
      console.error(e);
    }
  }
  render() {
    this.logic.props = this.props;
    let vals = this.props;
    try {
      vals = { ...this.props, ...(this.logic.renderVals() || {}) };
    } catch (e) {
      console.error(e);
    }
    return h("div", { className: "sc-host", "data-sc-name": "Everstock v3" }, renderTemplate(vals, this));
  }
}

export default function DcPage(props) {
  return (
    <div id="dc-root">
      <DcHost {...defaults} {...props} />
    </div>
  );
}
