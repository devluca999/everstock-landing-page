#!/usr/bin/env node
/**
 * Ports a Claude Design `.dc.html` page into the Next.js app without retyping it.
 *
 *   node scripts/port-dc.mjs v4      (or v3; see PAGES below, and `npm run port:v4`)
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
import { parseFragment } from "parse5";
import * as v4Fixes from "./port-patches/v4-industries-fixes.mjs";
import * as v4Hero from "./port-patches/v4-hero-mobile.mjs";

const PAGES = {
  v3: {
    src: "mockup/v3/Everstock v3.dc.html",
    runtime: "mockup/v3/support.js",
    out: "components/v3/generated",
    logicPatches: [
      {
        why: "Industries › Any physical product: the screw + gear group sits the stack's distance (max(30, side * 0.16)) off the box's left edge, measured from its rightmost part incl. callouts (was pinned at side * 0.14 from the page edge)",
        find: "const ks = Math.max(0.6, Math.min(1, side / 420)), L0 = side * 0.14, sy2 = cy + 62 * ks, T6 = red ? 3.2 : t % 6;",
        replace:
          "const ks = Math.max(0.6, Math.min(1, side / 420)), sy2 = cy + 62 * ks, T6 = red ? 3.2 : t % 6;\n" +
          "        const L0 = (() => { g.font = '500 10px \"Geist Mono\", ui-monospace, monospace'; const mw = (s) => g.measureText(s).width; const reach = Math.max(130 * ks, 140 * ks + 22 + mw('MODULE: 1.5'), 125 * ks + 6 + mw('FITS: M12 × 2.0')); return Math.max(12, side - Math.max(30, side * 0.16) - reach); })();",
      },
    ],
    templatePatches: [],
    hrefBindings: {},
  },
  v4: {
    src: "mockup/v4/Everstock v4.dc.html",
    runtime: "mockup/v4/support.js",
    out: "components/v4/generated",
    logicPatches: [
      {
        why: "AA contrast: the Plan's inactive steps dimmed to 0.42 (1.8:1 and 2.7:1 on eggshell); 0.72 keeps the highlight and clears 4.5:1 (with the step-number ink below)",
        find: "o['po' + i] = red || i === Math.max(0, this.state.planStep) ? 1 : 0.42;",
        replace: "o['po' + i] = red || i === Math.max(0, this.state.planStep) ? 1 : 0.72;",
      },
      ...v4Fixes.logicPatches,
      ...v4Hero.logicPatches,
    ],
    templatePatches: [
      ...v4Fixes.templatePatches,
      ...v4Hero.templatePatches,
      {
        why: "The archived v3 journey block (journeyArchive: false) never renders; /journey hosts the v3 page itself, so the block is dropped instead of shipping dead markup",
        find: /\n {2}<sc-if value="\{\{ journeyArchive \}\}"[\s\S]*?\n {2}<\/sc-if>/g,
        count: 1,
        replace: "",
      },
      {
        why: "Footer nav: the transitional CTA carries its final label everywhere (r8), not the design's leftover 'Upload your documents'",
        find: ">Upload your documents</a>",
        replace: ">Send us your scattered records</a>",
      },
      {
        why: "Records form sent state: files are not uploaded yet, so it is a stamped RECEIVED (ink, the foundations' moving-box colour) instead of 'Everstock is reading your file.' + a blue Checking stamp",
        find: '<span style="font-size:16px;color:#1A1B1F;">Everstock is reading your file.</span>',
        replace: '<span style="font-size:16px;color:#1A1B1F;">Got it. Add your company and we\'ll be in touch.</span>',
      },
      {
        why: "(same) the stamp itself",
        find: /border:3px solid #0B5FFF;border-radius:4px;box-shadow:inset 0 0 0 2px #DED7CB,inset 0 0 0 3\.5px #0B5FFF;color:#0B5FFF;([^"]*)">Checking<\/span>/g,
        count: 1,
        replace: 'border:3px solid #2B2C31;border-radius:4px;box-shadow:inset 0 0 0 2px #DED7CB,inset 0 0 0 3.5px #2B2C31;color:#2B2C31;$1">Received</span>',
      },
      {
        why: "(with the legal nav removal below) the © line keeps the removed links' 44px row height, so the footer keeps the design's height",
        find: `<span style="font-family:'Geist Mono',monospace;font-size:11px;letter-spacing:0.06em;color:rgb(var(--ink) / 0.64);">© 2026 Everstock</span>`,
        replace: `<span style="display:inline-flex;align-items:center;min-height:44px;font-family:'Geist Mono',monospace;font-size:11px;letter-spacing:0.06em;color:rgb(var(--ink) / 0.64);">© 2026 Everstock</span>`,
      },
      {
        why: "AA contrast: the Plan step numbers are muted ink (0.64) and dim with their step; at 0.9 ink they clear 4.5:1 while dimmed (0.9 × 0.72)",
        find: /(opacity:\{\{ po[0-2] \}\};transition:\{\{ fade \}\};font-family:'Geist Mono',monospace;font-size:12px;letter-spacing:0\.08em;color:rgb\(var\(--ink\) \/ )0\.64\)/g,
        count: 3,
        replace: "$10.9)",
      },
      {
        why: "CTA labels are exactly 'Get early access' (port brief); the design's Act 1 card link, bird banner and its label carry a trailing arrow",
        find: "Get early access →<",
        count: 3,
        replace: "Get early access<",
      },
      {
        why: "Footer legal nav: Privacy, Terms and LinkedIn are placeholder anchors (#privacy, #terms, #linkedin) with nothing behind them; left out until the pages and the company URL exist",
        find: /\n {6}<nav aria-label="Legal"[\s\S]*?<\/nav>/g,
        count: 1,
        replace: "",
      },
    ],
    // CTA destinations come from lib/cta.ts (through renderVals keys the host adds),
    // never from the template: each designed <a href> below is rebound to its config key.
    hrefBindings: {
      "#book-demo": "{{ ctaBookDemoHref }}",
      "#access": "{{ ctaEarlyAccessHref }}",
      "#price-file": "{{ ctaRecordsHref }}",
      "/journey": "{{ ctaJourneyHref }}",
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
  if (n !== 1) throw new Error(`logic patch anchor matched ${n} times (expected 1): ${p.why}`);
  logicSrc = logicSrc.replace(p.find, () => p.replace);
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
