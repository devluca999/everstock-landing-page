#!/usr/bin/env node
/**
 * Ports a Claude Design `.dc.html` page into the Next.js app without retyping it.
 *
 *   node scripts/port-dc.mjs v9|pricing   (see PAGES below; `npm run port` runs both)
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
import * as v9Capabilities from "./port-patches/v9-capabilities.mjs";
import * as v9Workflows from "./port-patches/v9-workflows.mjs";
import * as v9Plan from "./port-patches/v9-plan.mjs";
import * as v9Footer from "./port-patches/v9-footer.mjs";
import * as v9Industries from "./port-patches/v9-industries.mjs";
import * as v9Ctas from "./port-patches/v9-ctas.mjs";
const V9_AREAS = [v9Capabilities, v9Workflows, v9Plan, v9Footer, v9Industries, v9Ctas];
/* Site-side patches shared by both pages. */
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
const FOOTER_FEEDBACK = {
  why: "Footer: a 'Send feedback' link, styled like its neighbours; components/feedback/FeedbackDialog.tsx (mounted in the root layout) opens on any #feedback link",
  find: /(\n( *)<a href="#book-demo" onClick="\{\{ openDemo \}\}" (style="[^"]*") (style-hover="[^"]*")>Book a demo<\/a>)(\n *<\/nav>)/g,
  count: 1,
  replace: '$1\n$2<a href="#feedback" $3 $4>Send feedback</a>$5',
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
// Setup time: the site promises "a few days", not two weeks (2026-10-14). v8 dropped the
// Plan section and the hero checklist that said it; the marquee (both pages) still does.
const MARQUEE_DAYS = {
  why: "Setup time: the marquee says 'Live in a few days' (the design says two weeks)",
  find: "'Live in two weeks'",
  replace: "'Live in a few days'",
};
// v9's forms (the Stock Plan card and the plan / early access / demo modal) post through
// components/v9/DcPage.jsx; these two template patches are what the site needs around them.
const NO_INVOICE_DROP = {
  why: "Forms: 'Drop an invoice' is left out of both Stock Plan forms until the site can store files (the request route takes JSON only, so an upload would be silently lost)",
  find: /\n *<label style="position:relative;display:flex;align-items:center;justify-content:space-between;[^\n]*?Drop an invoice[^\n]*?<\/label>/g,
  count: 2,
  replace: "",
};
const FORM_HONEYPOT = {
  why: "Forms: the request route's honeypot field, last in both v9 forms (the modal focuses its first input)",
  find: "</form>",
  count: 2,
  replace: '<input name="website" type="text" tabIndex="-1" autoComplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0;"></form>',
};
// The Stock Plan section's Chicago → globe canvas (same code as v4/v5). It snapped every dot
// to a whole CSS pixel while the L train moves ~0.7px a frame, so the train stood still on
// alternate frames (the stutter); dots ~2.7px wide blurred and shimmered on the pixel grid;
// and train cars popped in and out at the track ends. (2026-10-30)
const CHICAGO_SMOOTH = [
  {
    why: "Chicago: dots are a whole number of device pixels (crisp, no shimmer); positions snap to device pixels, not CSS pixels (half the step on Retina)",
    find: "ds = Math.max(1.4, cg.C * k * 0.72);",
    replace: "ds = Math.max(1.5, Math.round(cg.C * k * 0.72 * dpr) / dpr), sn = (v) => Math.round(v * dpr) / dpr;",
  },
  {
    why: "Chicago: the L train moves at sub-pixel precision (no stutter) and fades in and out over the last stretch of track instead of popping",
    find: "if (pp <= 0) { g.fillStyle = INK(0.86); g.fillRect(Math.round(ax), Math.round(ay), ds, ds); continue; }",
    replace: "if (pp <= 0) { const tf = P.tr ? clamp(Math.min(x, 466 - x) / 28) : 1; if (tf <= 0) continue; g.fillStyle = INK(0.86 * tf); g.fillRect(P.tr ? ax : sn(ax), sn(ay), ds, ds); continue; }",
  },
  {
    why: "Chicago: globe land dots snap to device pixels",
    find: "g.fillRect(Math.round(p[0] - ds / 2), Math.round(p[1] - ds / 2), ds, ds); }",
    replace: "g.fillRect(sn(p[0] - ds / 2), sn(p[1] - ds / 2), ds, ds); }",
  },
  {
    why: "Chicago: globe sea dots are whole device pixels and snap to them",
    find: "const s2 = ds * 0.62; g.fillStyle = INK(0.3 * sh * ga); g.fillRect(Math.round(p[0] - s2 / 2), Math.round(p[1] - s2 / 2), s2, s2); }",
    replace: "const s2 = Math.max(1 / dpr, Math.round(ds * 0.62 * dpr) / dpr); g.fillStyle = INK(0.3 * sh * ga); g.fillRect(sn(p[0] - s2 / 2), sn(p[1] - s2 / 2), s2, s2); }",
  },
  {
    why: "Chicago: the city ↔ globe particles glide at sub-pixel precision instead of hopping a CSS pixel at a time",
    find: "g.fillStyle = INK(a); g.fillRect(Math.round(px - sz / 2), Math.round(py - sz / 2), sz, sz);",
    replace: "g.fillStyle = INK(a); g.fillRect(px - sz / 2, py - sz / 2, sz, sz);",
  },
];
const PAGES = {
  // the home page (Claude Design "Everstock v9.dc.html")
  v9: {
    src: "mockup/v9/Everstock v9.dc.html",
    runtime: "mockup/v9/support.js",
    out: "components/v9/generated",
    logicPatches: [
      MARQUEE_DAYS,
      ...CHICAGO_SMOOTH,
      {
        why: "Plan autoplays: the section is no longer pinned for 2-2.5 screens of scroll; it sits in the flow like the others",
        find: "planSecH: red ? 'auto' : wide ? '250svh' : '200svh', planPos: red ? 'relative' : 'sticky',",
        replace: "planSecH: 'auto', planPos: 'relative',",
      },
      {
        why: "Plan autoplays: progress comes from a clock instead of the scroll position. It starts once the canvas is three quarters up the screen, runs 7s (paperwork → model → APPROVED), holds 2.5s, then loops; steps 01-03 still follow it",
        find: "const p = c01((window.scrollY - L.top) / L.span), S = L.S, C3 = L.cols;",
        replace: "if (this.plT0 == null && cv.getBoundingClientRect().top < window.innerHeight * 0.75) this.plT0 = t;\n    const p = this.plT0 == null ? 0 : c01(((t - this.plT0) % 9.5) / 7), S = L.S, C3 = L.cols;",
      },
      {
        why: "Plan autoplays: leaving the section resets the clock, so coming back plays it from the start",
        find: "this.planVis = en.isIntersecting; if (this.planVis) this.planStart();",
        replace: "this.planVis = en.isIntersecting; if (this.planVis) this.planStart(); else this.plT0 = null;",
      },
      {
        why: "AA contrast: the Plan's inactive steps dimmed to 0.42 (1.8:1 and 2.7:1 on eggshell); 0.72 keeps the highlight and clears 4.5:1 (with the step-number ink below)",
        find: "o['po' + i] = red || i === Math.max(0, this.state.planStep) ? 1 : 0.42;",
        replace: "o['po' + i] = red || i === Math.max(0, this.state.planStep) ? 1 : 0.72;",
      },
      ...V9_AREAS.flatMap((a) => a.logicPatches),
    ],
    templatePatches: [
      {
        why: "Structure: v8/v9 close the root div right before </main>, so the footer, the phone bar and the modal render outside it (and lose its Space Grotesk, falling back to Times); the root closes at the end, as in v5",
        find: "\n</div>\n</main>\n\n<footer id=\"cta\"",
        replace: "\n</main>\n\n<footer id=\"cta\"",
      },
      NO_LEGAL_NAV,
      FOOTER_FEEDBACK,
      NO_INVOICE_DROP,
      FORM_HONEYPOT,
      {
        // EVERSTOCK is clamp(40px, 8.3vw, 150px) with a cap height of about 0.7em, so ~42% of
        // its cap height is ~0.29 of its size: clamp(14px, 2.45vw, 44px)
        why: "Hero (2026-10-29): 'Stay in stock with' supports the EVERSTOCK wordmark instead of competing with it: regular weight, ~42% of the wordmark's cap height, off-white ink at 70%, +0.015em tracking, sitting close above it as one lockup",
        find: `<p aria-hidden="true" style="margin:0 0 clamp(10px,1.6svh,18px);font-family:'General Sans','Space Grotesk',sans-serif;font-weight:600;font-size:clamp(26px,3.4vw,58px);line-height:1.05;letter-spacing:-0.022em;color:rgb(var(--ink));">Stay in stock with</p>`,
        replace: `<p aria-hidden="true" style="margin:0 0 clamp(2px,0.5svh,6px);font-family:'General Sans','Space Grotesk',sans-serif;font-weight:400;font-size:clamp(14px,2.45vw,44px);line-height:1.1;letter-spacing:0.015em;color:rgb(var(--ink) / 0.7);">Stay in stock with</p>`,
      },
      {
        why: "Links: the footer's 'How it works' points at #how-it-works, which v9 hides; the top nav's goes to #workflows, so this one does too",
        find: 'href="#how-it-works"',
        replace: 'href="#workflows"',
      },
      ...V9_AREAS.flatMap((a) => a.templatePatches),
    ],
    // the sections v9 shows, in order (the older ones are still in the design at zero height)
    seo: { sections: ["top", "integrations", "problem", "capabilities", "workflows", "industries", "plan", "pricing", "stock-plan", "cta"] },
    hrefBindings: {
      ...CTA_BINDINGS,
      "Pricing.dc.html": "/pricing",
      "Pricing.dc.html#compare": "/pricing#compare",
    },
  },
  // /pricing (Claude Design "Pricing.dc.html")
  pricing: {
    seo: { sections: ["top", "stockbot", "integrations", "compare", "faq", "cta"] },
    src: "mockup/v9/Pricing.dc.html",
    runtime: "mockup/v9/support.js",
    out: "components/pricing/generated",
    logicPatches: [
      accessFocus(2),
      MARQUEE_DAYS,
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
    templatePatches: [NO_LEGAL_NAV, ACCESS_FIELDS, ACCESS_STEPS, FOOTER_FEEDBACK],
    // deterministic paints served as baked PNGs (see bakes below)
    bakes: [{ method: "paintStack", png: "public/pricing/stack-{hash}.png" }],
    hrefBindings: {
      ...CTA_BINDINGS,
      "Everstock%20v9.dc.html": "/",
      // v8 hides #how-it-works; its own nav sends "How it works" to #workflows
      "Everstock%20v9.dc.html#how-it-works": "/#workflows",
      "Everstock%20v9.dc.html#industries": "/#industries",
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
    if (n !== want) {
      const msg = `${kind} patch anchor matched ${n} times (expected ${want}): ${p.why}`;
      // PORT_CHECK=1 lists every stale anchor instead of stopping at the first (writes nothing useful)
      if (process.env.PORT_CHECK) { console.log("STALE " + msg); continue; }
      throw new Error(msg);
    }
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

/* ---------- seo.json: the page's readable text for the server-rendered fallback ----------
   The design renders on the client only, so crawlers without JS would see an empty page.
   This keeps the static text of the sections a visitor actually sees (page.seo.sections, in
   order; the first element with each id) as headings, paragraphs and links. Text that is
   bound ({{ }}) or inside aria-hidden decoration is left out. The page routes render it (components/dc/SeoFallback.tsx). */
if (page.seo) {
  const BLOCK = new Set(["p", "li", "blockquote", "figcaption", "dt", "dd"]);
  const HEAD = { h1: 1, h2: 2, h3: 3, h4: 4 };
  const pv = (n, k) => (n.props || []).find(([key]) => key === k)?.[1];
  const hidden = (n) => pv(n, "aria-hidden") === "true";
  const textOf = (n) => {
    if (n.t === "text") return n.v;
    if (n.t === "el" && (hidden(n) || ["svg", "script", "style", "canvas", "video", "select"].includes(n.tag))) return "";
    if (n.t === "el" && n.tag === "br") return " ";
    // two elements side by side ("<span>stockbot</span><span>$20</span>") are separate words
    const kids = n.kids || [];
    return kids.map((k, i) => (i && k.t !== "text" && kids[i - 1].t !== "text" ? " " : "") + textOf(k)).join("");
  };
  const clean = (str) => str.replace(/\s+/g, " ").trim();
  const literal = (str) => (str && !str.includes("{{") ? clean(str) : "");
  const blocks = (n, out) => {
    if (n.t === "text" || n.t === "for") return; // for: rows come from the logic, not the template
    if (n.t === "el" && (hidden(n) || ["svg", "script", "style", "canvas", "video", "form"].includes(n.tag))) return;
    if (n.t === "el" && HEAD[n.tag]) {
      const txt = literal(pv(n, "aria-label")) || literal(textOf(n));
      if (txt) out.push({ h: HEAD[n.tag], text: txt });
      return;
    }
    if (n.t === "el" && BLOCK.has(n.tag)) {
      const txt = literal(textOf(n));
      if (txt) out.push({ p: txt });
      return;
    }
    if (n.t === "el" && n.tag === "a") {
      const href = pv(n, "href");
      const txt = literal(pv(n, "aria-label")) || literal(textOf(n));
      // in-page anchors only where the fallback has that section (no JS: nothing else opens)
      const ok = href && !href.includes("{{") && (!href.startsWith("#") || page.seo.sections.includes(href.slice(1)));
      if (txt && ok) out.push({ a: txt, href });
      return;
    }
    (n.kids || []).forEach((k) => blocks(k, out));
  };
  const found = new Map();
  const find = (n) => {
    if (n.t === "el") {
      const id = pv(n, "id");
      if (id && page.seo.sections.includes(id) && !found.has(id)) {
        found.set(id, n);
        return;
      }
    }
    (n.kids || []).forEach(find);
  };
  tree.forEach(find);
  const sections = page.seo.sections.map((id) => {
    const n = found.get(id);
    if (!n) throw new Error(`seo: no element with id="${id}"`);
    const out = [];
    blocks({ t: "el", tag: "div", props: [], kids: n.kids }, out);
    const seen = new Set();
    return { id, footer: n.tag === "footer", blocks: out.filter((b) => { const k = JSON.stringify(b); return seen.has(k) ? false : (seen.add(k), true); }) };
  });
  fs.writeFileSync(path.join(outDir, "seo.json"), JSON.stringify(sections, null, 2) + "\n");
  console.log(`seo: ${sections.map((x) => `${x.id}(${x.blocks.length})`).join(" ")}`);
}
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
