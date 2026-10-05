#!/usr/bin/env node
/**
 * Ports a Claude Design `.dc.html` page into the Next.js app without retyping it.
 *
 *   node scripts/port-dc.mjs v5|pricing   (see PAGES below; `npm run port` runs both)
 *
 * The design runs on the dc-runtime (support.js): a template compiled at runtime into
 * React elements, driven by a logic class. This script does the compile step ahead of
 * time with the runtime's own code (sliced out of support.js, not re-implemented):
 *
 *   template.json  the template as a node tree, attribute keys already resolved the way
 *                  collectProps() resolves them; values keep their {{ }} holes
 *   pseudo.css     style-hover / style-focus / style-active rules, same class names and
 *                  !important treatment as createPseudoSheet()
 *   helmet.css     the <style> block from the <helmet>
 *   logic.js       the logic <script>, byte-for-byte, wrapped exactly like evalDcLogic()
 *   dcrt.js        the runtime's expression + attribute helpers (src/expr.ts, src/encode.ts)
 *   props.json     the declared props' defaults
 *
 * Site-side changes to a design are applied here, at port time, so mockup/<page> stays a
 * byte-exact copy of the design. Every patch anchor must match an exact number of times:
 * if the design changes under a patch, the port fails instead of silently dropping it
 * (then either carry the change into the design and delete the patch, or update it).
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { parseFragment } from "parse5";
/* Site-side patches shared by both v5 pages. */
const NO_LEGAL_NAV = {
  why: "Footer legal nav: Privacy, Terms and LinkedIn are placeholder anchors (#privacy, #terms, #linkedin) with nothing behind them; left out until the pages and the company URL exist",
  find: /(\n {6})<nav aria-label="Legal"[\s\S]*?<\/nav>/g,
  count: 1,
  // an empty slot the nav's size (178px wide, 215px under 900px, 44px tall) keeps the row's wrap, so the footer keeps the design's height on every width
  replace: '$1<span aria-hidden="true" style="display:block;width:max(178px, min(215px, calc((900px - 100vw) * 100)));min-height:44px;"></span>',
};
// CTA destinations come from lib/cta.ts (through renderVals keys the host adds), never
// from the template; the two design files' links to each other become site routes.
const CTA_BINDINGS = {
  "#waitlist": "{{ ctaWaitlistHref }}",
  "#book-demo": "{{ ctaBookDemoHref }}",
};
// The waitlist / Book a demo modal (same markup on both pages): the fields the site asks
// for, and the questions asked once the form is sent. The logic behind both lives in
// components/dc/accessFlow.js; the styles are the design's own label/input/button styles.
const LBL = "font-family:'Geist Mono',monospace;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:rgba(22,23,27,0.56);";
const OPT = '<span style="color:rgba(22,23,27,0.4);"> · optional</span>';
const INPUT =
  'style="width:100%;min-width:0;height:44px;padding:0 12px;border:1px solid rgba(22,23,27,0.2);border-radius:7px;background:#FFFFFF;font-family:inherit;font-size:15px;color:#101115;outline:none;box-sizing:border-box;" style-focus="border-color:#101115;"';
const field = (label, input) => `<label style="display:grid;gap:6px;"><span style="${LBL}">${label}</span>${input}</label>`;
const BTN_PRIMARY =
  'style="height:44px;padding:0 18px;border:0;border-radius:8px;background:#16171B;color:#FAF9F5;font-family:inherit;font-size:15px;font-weight:600;cursor:pointer;" style-hover="background:#000000;" style-active="transform:scale(0.985);"';
const BTN_QUIET =
  'style="height:44px;padding:0 16px;border-radius:8px;border:1px solid rgba(22,23,27,0.2);background:transparent;color:#101115;font-family:inherit;font-size:15px;font-weight:500;cursor:pointer;" style-hover="border-color:#101115;"';
const HEARD = ["Search engine", "LinkedIn", "A colleague or friend", "An event", "An article or newsletter", "Something else"];
const ACCESS_FIELDS = {
  why: "Forms: name (required), email and work email (at least one), company and 'How did you hear about us?' (optional), plus the route's honeypot",
  find: /<label style="display:grid;gap:6px;"><span[^>]*>Work email<\/span><input id="acc-email"[^\n]*\n( *)<label style="display:grid;gap:6px;"><span[^>]*>Company<\/span>[^\n]*?<\/label>/g,
  count: 1,
  replace: (_m, ind) =>
    [
      `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,190px),1fr));gap:18px 12px;">`,
      `  ${field("Name", `<input id="acc-name" name="name" type="text" required="{{ true }}" autocomplete="name" ${INPUT}>`)}`,
      `  ${field("Email", `<input id="acc-email" name="email" type="email" autocomplete="email" placeholder="you@example.com" ${INPUT}>`)}`,
      `  ${field("Work email" + OPT, `<input name="workEmail" type="email" autocomplete="work email" placeholder="you@company.com" ${INPUT}>`)}`,
      `  ${field("Company" + OPT, `<input name="company" type="text" autocomplete="organization" ${INPUT}>`)}`,
      `</div>`,
      field(
        "How did you hear about us?" + OPT,
        `<select name="heardFrom" ${INPUT.replace('box-sizing:border-box;"', 'box-sizing:border-box;color-scheme:light;"')}><option value="">Choose one</option>${HEARD.map((h) => `<option>${h}</option>`).join("")}</select>`
      ),
      `<input name="website" type="text" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0;">`,
    ].join("\n" + ind),
};
const accessFocus = (count) => ({
  why: "Forms: the modal opens on its first field, which is Name now (the design focuses the email input)",
  find: "getElementById('acc-email')",
  replace: "getElementById('acc-name')",
  count,
});
const ACCESS_STEPS = {
  why: "Forms: the sent state asks the follow-up questions (Book a demo: the waitlist too?; both: the founding partner program?) one at a time, and promises no email (none is sent yet)",
  find: /<p style="([^"]*)">Request received for \{\{ accPlanName \}\}\. Look for an email with next steps\.<\/p>/g,
  count: 1,
  replace: (_m, pStyle) =>
    `<div aria-live="polite" style="display:grid;gap:20px;"><p style="${pStyle}">{{ accSentText }}</p>` +
    `<sc-if value="{{ accAsk }}" hint-placeholder-val="{{ true }}"><div style="display:grid;gap:14px;padding-top:20px;border-top:1px solid rgba(22,23,27,0.12);">` +
    `<div style="display:grid;gap:6px;"><p style="margin:0;font-size:18px;font-weight:600;letter-spacing:-0.01em;line-height:1.3;">{{ accAskTitle }}</p>` +
    `<p style="margin:0;font-size:14px;line-height:1.5;color:rgba(22,23,27,0.68);">{{ accAskBody }}</p></div>` +
    `<div style="display:flex;flex-wrap:wrap;gap:10px;"><button type="button" onClick="{{ accYes }}" ${BTN_PRIMARY}>{{ accYesLabel }}</button>` +
    `<button type="button" onClick="{{ accNo }}" ${BTN_QUIET}>{{ accNoLabel }}</button></div></div></sc-if>` +
    `<sc-if value="{{ accFinished }}" hint-placeholder-val="{{ false }}"><div><button type="button" onClick="{{ closeAccess }}" ${BTN_PRIMARY}>Done</button></div></sc-if></div>`,
};

const PAGES = {
  // the home page (Claude Design "Everstock v5.dc.html")
  v5: {
    src: "mockup/v5/Everstock v5.dc.html",
    runtime: "mockup/v5/support.js",
    out: "components/v5/generated",
    logicPatches: [
      accessFocus(1),
      {
        why: "AA contrast: the Plan's inactive steps dimmed to 0.42 (1.8:1 and 2.7:1 on eggshell); 0.72 keeps the highlight and clears 4.5:1 (with the step-number ink below)",
        find: "o['po' + i] = red || i === Math.max(0, this.state.planStep) ? 1 : 0.42;",
        replace: "o['po' + i] = red || i === Math.max(0, this.state.planStep) ? 1 : 0.72;",
      },
    ],
    templatePatches: [
      {
        why: "The archived v3 journey block (journeyArchive: false) never renders, so it is dropped instead of shipping dead markup",
        find: /\n {2}<sc-if value="\{\{ journeyArchive \}\}"[\s\S]*?\n {2}<\/sc-if>/g,
        count: 1,
        replace: "",
      },
      {
        why: "AA contrast: the Plan step numbers are muted ink (0.64) and dim with their step; at 0.9 ink they clear 4.5:1 while dimmed (0.9 × 0.72)",
        find: /(opacity:\{\{ po[0-2] \}\};transition:\{\{ fade \}\};font-family:'Geist Mono',monospace;font-size:12px;letter-spacing:0\.08em;color:rgb\(var\(--ink\) \/ )0\.64\)/g,
        count: 3,
        replace: "$10.9)",
      },
      NO_LEGAL_NAV,
      ACCESS_FIELDS,
      ACCESS_STEPS,
    ],
    hrefBindings: {
      ...CTA_BINDINGS,
      "Pricing.dc.html": "/pricing",
      "Pricing.dc.html#compare": "/pricing#compare",
    },
  },
  // /pricing (Claude Design "Pricing.dc.html")
  pricing: {
    src: "mockup/v5/Pricing.dc.html",
    runtime: "mockup/v5/support.js",
    out: "components/pricing/generated",
    logicPatches: [
      accessFocus(2),
      {
        why: "Perf: tick clears this.raf before goScene → kick(), so every auto-advance started a second loop (60 → 120 → 180 ticks/s, the scene re-rendered once per loop per frame); the loop is now one vsync-paced rAF chain, capped near 60fps on high-refresh phones",
        find: "kick() { if (!this.raf && !this.dead) this.raf = setTimeout(() => this.tick(performance.now()), 16); }",
        replace: "kick() { if (!this.raf && !this.dead) this.raf = requestAnimationFrame(this.frame); }\n  frame = (t) => { this.raf = 0; if (t - (this.tickT || 0) < 15) { this.kick(); return; } this.tickT = t; this.tick(t); };",
      },
      {
        why: "Perf: the tick reschedules through the guarded kick (see above), never alongside a loop goScene already started",
        find: "    this.raf = setTimeout(() => this.tick(performance.now()), 16);\n  };",
        replace: "    this.kick();\n  };",
      },
      {
        why: "The loop is rAF-driven now; cancel it the same way",
        find: "this.dead = true; if (this.raf) clearTimeout(this.raf);",
        replace: "this.dead = true; if (this.raf) cancelAnimationFrame(this.raf);",
      },
    ],
    templatePatches: [NO_LEGAL_NAV, ACCESS_FIELDS, ACCESS_STEPS],
    // deterministic paints served as baked PNGs (see bakes below)
    bakes: [{ method: "paintStack", png: "public/pricing/stack-{hash}.png" }],
    hrefBindings: {
      ...CTA_BINDINGS,
      "Everstock%20v5.dc.html": "/",
      "Everstock%20v5.dc.html#how-it-works": "/#how-it-works",
      "Everstock%20v5.dc.html#industries": "/#industries",
    },
  },
};

const page = PAGES[process.argv[2]];
if (!page) {
  console.error("usage: port-dc.mjs <" + Object.keys(PAGES).join("|") + ">");
  process.exit(1);
}
const html = fs.readFileSync(page.src, "utf8");
const support = fs.readFileSync(page.runtime, "utf8");
const outDir = page.out;
fs.mkdirSync(outDir, { recursive: true });

function applyPatches(src, patches, kind) {
  for (const p of patches) {
    const n = typeof p.find === "string" ? src.split(p.find).length - 1 : (src.match(p.find) || []).length;
    const want = p.count ?? 1;
    if (n !== want) throw new Error(`${kind} patch anchor matched ${n} times (expected ${want}): ${p.why}`);
    src = typeof p.find === "string" ? src.split(p.find).join(p.replace) : src.replace(p.find, p.replace);
  }
  return src;
}

/* ---------- runtime sections, sliced verbatim ---------- */
function section(name) {
  const start = support.indexOf("  // src/" + name + ".ts");
  if (start < 0) throw new Error("support.js: no section " + name);
  const next = support.indexOf("  // src/", start + 10);
  return support.slice(start, next);
}
const exprSrc = section("expr");
const encodeSrc = section("encode");
const pseudoSrc = section("pseudo");

// build-time copies of the runtime helpers
const rt = new Function(
  exprSrc + encodeSrc + pseudoSrc +
    "\nreturn { resolve, encodeCase, kebabToCamel, CAMEL_ATTR, RAW_UNWRAP, EVENT_MAP, importantify };"
)();

// the same helpers for the browser, as an ES module
fs.writeFileSync(
  path.join(outDir, "dcrt.js"),
  "// GENERATED by scripts/port-dc.mjs from the dc-runtime (support.js) — do not edit.\n" +
    "/* eslint-disable */\n" +
    exprSrc + encodeSrc +
    "\nexport { resolve, compileAttr, cssToObj, kebabToCamel };\n"
);

/* ---------- split the document ---------- */
const dcOpen = html.indexOf("<x-dc>");
const dcClose = html.lastIndexOf("</x-dc>");
let inner = html.slice(dcOpen + "<x-dc>".length, dcClose);

const helmetMatch = inner.match(/<helmet>([\s\S]*?)<\/helmet>/i);
if (!helmetMatch) throw new Error("no <helmet>");
const helmet = helmetMatch[1];
inner = inner.replace(helmetMatch[0], "");
inner = applyPatches(inner, page.templatePatches, "template");

const styles = [...helmet.matchAll(/<style>([\s\S]*?)<\/style>/gi)].map((m) => m[1]);
fs.writeFileSync(
  path.join(outDir, "helmet.css"),
  "/* GENERATED by scripts/port-dc.mjs: the page's <helmet> <style>, verbatim. */\n" + styles.join("\n")
);

const scriptMatch = html.match(/<script type="text\/x-dc" data-dc-script data-props="([^"]*)">([\s\S]*)<\/script>\s*<\/body>/);
if (!scriptMatch) throw new Error("no logic <script>");
const decode = (s) => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const propsMeta = JSON.parse(decode(scriptMatch[1]));
const defaults = Object.fromEntries(Object.entries(propsMeta).filter(([, m]) => m.default !== undefined).map(([k, m]) => [k, m.default]));
fs.writeFileSync(path.join(outDir, "props.json"), JSON.stringify(defaults, null, 2) + "\n");

let logicSrc = scriptMatch[2];
for (const p of page.logicPatches) {
  const n = logicSrc.split(p.find).length - 1;
  const want = p.count ?? 1;
  if (n !== want) throw new Error(`logic patch anchor matched ${n} times (expected ${want}): ${p.why}`);
  logicSrc = logicSrc.split(p.find).join(p.replace);
}

fs.writeFileSync(
  path.join(outDir, "logic.js"),
  "// GENERATED by scripts/port-dc.mjs: the design's logic <script>, byte-for-byte, wrapped\n" +
    "// the way the dc-runtime's evalDcLogic() wraps it. Do not edit; re-run the port.\n" +
    "/* eslint-disable */\n" +
    "export default function defineLogic(DCLogic, StreamableLogic, React) {\n" +
    logicSrc +
    '\n;return (typeof Component!=="undefined"&&Component)||undefined;\n}\n'
);

/* ---------- baked paints ----------
   A deterministic paint method (no inputs, same pixels every run) can be served as a PNG
   instead of painting at runtime. The PNG's name carries a hash of the method's source and
   bakes.json lists only PNGs that exist for the current hash, so a design change to the
   method falls back to the live paint (the host's override finds no entry) until the PNG
   is re-baked. To re-bake: open the
   page under `next dev`, run window.__dcLogic.<method>().src in the console, and save
   that data URL's PNG at the path the port prints. */
const bakes = {};
for (const b of page.bakes || []) {
  const a = logicSrc.indexOf("  " + b.method + "() {");
  const end = logicSrc.indexOf("\n  }\n", a);
  if (a < 0 || end < 0) throw new Error(`bake: no ${b.method}() in the logic`);
  const hash = crypto.createHash("sha1").update(logicSrc.slice(a, end + 4)).digest("hex").slice(0, 10);
  const png = b.png.replace("{hash}", hash);
  if (!fs.existsSync(png)) {
    console.warn(`bake: ${png} is missing; ${b.method}() paints live until it is baked`);
    continue;
  }
  const head = fs.readFileSync(png).subarray(16, 24); // the PNG's IHDR width and height
  bakes[b.method] = { src: "/" + png.replace(/^public\//, ""), w: head.readUInt32BE(0), h: head.readUInt32BE(4) };
}
if (page.bakes) fs.writeFileSync(path.join(outDir, "bakes.json"), JSON.stringify(bakes, null, 2) + "\n");

/* ---------- template -> node tree (compileTemplate / walk / collectProps) ---------- */
const frag = parseFragment(rt.encodeCase(inner));
const pseudoCache = new Map();
const pseudoRules = [];
function pseudoClass(pseudo, css) {
  const k = pseudo + "|" + css;
  if (pseudoCache.has(k)) return pseudoCache.get(k);
  const cls = "scp" + pseudoRules.length.toString(36);
  const isEl = pseudo === "before" || pseudo === "after";
  const sel = isEl ? "." + cls + "::" + pseudo : "." + cls + ":" + pseudo;
  pseudoRules.push(sel + "{" + (isEl ? css : rt.importantify(css)) + "}");
  pseudoCache.set(k, cls);
  return cls;
}

/* Asset URLs that deliberately differ from the design. The design points at the
   pre-upscale CloudFront original of the guardrail clip because Claude Design cannot
   reach the repo; the corrected/upscaled copy in public/videos is the one we ship. */
const SRC_OVERRIDES = {
  "https://d8j0ntlcm91z4.cloudfront.net/user_3FMfW2x8TD9jPPPVdRryKluSeEm/hf_20260823_052642_1d43c521-6909-47da-af26-1642ff625320.mp4#t=0.1":
    "/videos/beat3-approve.mp4#t=0.1",
};

const tags = new Set();
const unbound = new Set();
function walk(node) {
  if (node.nodeName === "#text") {
    const txt = node.value ?? "";
    if (!txt.includes("{{") && !txt.trim() && !txt.includes(" ")) return null;
    return { t: "text", v: txt };
  }
  if (!node.tagName) return null; // comments
  const kids = () => {
    const src = node.tagName === "template" ? node.content.childNodes : node.childNodes;
    return src.map(walk).filter(Boolean);
  };
  const attr = (n) => node.attrs.find((a) => a.name === n)?.value;
  const tag = node.tagName.toLowerCase();
  if (tag === "sc-for") return { t: "for", list: attr("list") || "", as: attr("as") || "item", kids: kids() };
  if (tag === "sc-if") return { t: "if", value: attr("value") || "", kids: kids() };
  if (tag === "x-import" || tag === "dc-import" || tag === "sc-helmet") throw new Error("unsupported: <" + tag + ">");

  const props = [];
  const classes = [];
  for (const { name, value } of node.attrs) {
    if (name === "sc-name" || name === "data-dc-tpl") continue;
    let key = name;
    if (key.startsWith(rt.CAMEL_ATTR)) key = rt.kebabToCamel(key.slice(rt.CAMEL_ATTR.length));
    if (key === "hint-size") continue;
    if (key.startsWith("style-")) {
      classes.push(pseudoClass(key.slice(6), value));
      continue;
    }
    if (key === "class") key = "className";
    else if (key === "for") key = "htmlFor";
    else if (key.startsWith("on")) key = rt.EVENT_MAP[key] || "on" + key[2].toUpperCase() + key.slice(3);
    let v = value;
    if (key === "src" && SRC_OVERRIDES[v]) v = SRC_OVERRIDES[v];
    if (key === "href" && tag === "a" && page.hrefBindings[v]) v = page.hrefBindings[v];
    else if (key === "href" && tag === "a" && Object.keys(page.hrefBindings).length && !v.includes("{{")) unbound.add(v);
    props.push([key, v]);
  }
  // SVG elements keep their case-adjusted names (linearGradient, feGaussianBlur…) as
  // the browser's parser gives them to the runtime; lowercased, React creates unknown
  // elements and every url(#…) gradient and filter reference silently renders nothing
  const svgTag = node.namespaceURI === "http://www.w3.org/2000/svg" ? node.tagName : null;
  const realTag = rt.RAW_UNWRAP[tag] || svgTag || tag;
  tags.add(realTag);
  const out = { t: "el", tag: realTag, props, kids: kids() };
  if (classes.length) out.cls = classes;
  return out;
}
const tree = frag.childNodes.map(walk).filter(Boolean);
fs.writeFileSync(path.join(outDir, "template.json"), JSON.stringify(tree));
fs.writeFileSync(
  path.join(outDir, "pseudo.css"),
  "/* GENERATED by scripts/port-dc.mjs: style-hover/-focus/-active from the template. */\n" + pseudoRules.join("\n") + "\n"
);

console.log(
  `template: ${tree.length} root nodes, tags: ${[...tags].sort().join(" ")}\n` +
    `pseudo rules: ${pseudoRules.length}\nlogic: ${scriptMatch[2].length} chars\nprops: ${JSON.stringify(defaults)}\n` +
    (unbound.size ? `hrefs left as designed (not CTAs): ${[...unbound].join(" ")}\n` : "") +
    `helmet links:\n${[...helmet.matchAll(/<link[^>]*>/gi)].map((m) => "  " + m[0]).join("\n")}\n` +
    `helmet scripts:\n${[...helmet.matchAll(/<script[^>]*>/gi)].map((m) => "  " + m[0]).join("\n")}`
);
