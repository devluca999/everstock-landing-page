"use client";

/**
 * Hosts a ported Claude Design page (see scripts/port-dc.mjs) the way the dc-runtime
 * (mockup/<page>/support.js) hosts it: the logic class is instantiated from the design's
 * own source, its setState merges synchronously into logic.state, and the template is
 * rendered against { ...props, ...logic.renderVals() } with the runtime's own
 * expression and attribute helpers. Each builder below mirrors its runtime namesake
 * (walkText / walkFor / walkIf / walkElement, StreamableLogic, StreamableComponent).
 *
 * createDcPage() takes one page's generated files plus an optional `extend` that
 * subclasses the design's logic with the site-side wiring (forms, CTA config).
 */
import React from "react";

const h = React.createElement;
const Fragment = React.Fragment;

/* ---------- logic base (src/logic.ts) ---------- */
class StreamableLogic {
  constructor(props) {
    this.props = props || {};
    this.state = {};
    this.__host = undefined;
  }
  setState(update, cb) {
    if (this.__host) this.__host.__setLogicState(update, cb);
  }
  forceUpdate() {
    if (this.__host) this.__host.forceUpdate();
  }
  componentDidMount() {}
  componentDidUpdate() {}
  componentWillUnmount() {}
  renderVals() {
    return {};
  }
}

export function createDcPage({ name, tree, defaults, dcrt, defineLogic, extend }) {
  const { resolve, compileAttr, cssToObj } = dcrt;

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

  const DesignLogic = defineLogic(StreamableLogic, StreamableLogic, React);
  const Logic = extend ? extend(DesignLogic) : DesignLogic;

  /* ---------- host (src/component.ts) ---------- */
  class DcHost extends React.Component {
    constructor(props) {
      super(props);
      this.state = { __v: 0 };
      this.logic = new Logic(props);
      this.logic.__host = this;
      // dev-only console handle, used to re-bake a page's baked paints (scripts/port-dc.mjs)
      if (process.env.NODE_ENV !== "production" && typeof window !== "undefined") window.__dcLogic = this.logic;
    }
    __setLogicState(update, cb) {
      const prev = this.logic.state;
      const patch = typeof update === "function" ? update(prev) : update;
      this.logic.state = { ...prev, ...patch };
      this.setState((s) => ({ __v: s.__v + 1 }), cb);
    }
    componentDidMount() {
      // StrictMode (next dev) unmounts and remounts once; the design's unmount sets
      // logic.dead, which would leave its rAF loops dead on the remount
      this.logic.dead = false;
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
          console.warn(`[${name}] logic.componentDidUpdate threw (same as in the dc-runtime):`, e);
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
      return h("div", { className: "sc-host", "data-sc-name": name }, renderTemplate(vals, this));
    }
  }

  return function DcPage(props) {
    return (
      <div id="dc-root">
        <DcHost {...defaults} {...props} />
      </div>
    );
  };
}

/* Posts to the Request access pipeline (/api/request-access → Convex). The designs'
   forms only flip to a local "sent" state; the hosts call this alongside, so the sent
   state still shows at once, as designed. */
export function sendRequest(fields, tag) {
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
    .catch((err) => console.error(`[${tag}] request not recorded:`, err));
}
