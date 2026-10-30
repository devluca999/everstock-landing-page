// v9 site patches for one area of the home page (2026-10-30). Same rules as the patches in
// scripts/port-dc.mjs: each anchor must match its count exactly against the design text as
// the earlier patches left it, or the port fails.
//
// Area: the footer (#cta) and the Stock Plan section's Chicago → globe canvas.

/* ---------- footer ---------- */

// One template patch rebuilds the whole footer (after NO_LEGAL_NAV, FOOTER_FEEDBACK and the
// #how-it-works → #workflows patch have run). The headline, the sub line, the two CTAs (with
// their APPROVED stamp and hover handlers) and the crate stack's ref/img are lifted out of the
// design's own markup, so only the layout around them is new.
const take = (src, re, what) => {
  const m = src.match(re);
  if (!m) throw new Error("v9-footer: could not find the footer's " + what);
  return m;
};
const HEAD = `style="margin:0 0 12px;font-family:'Geist Mono',monospace;font-size:11px;font-weight:500;letter-spacing:0.12em;text-transform:uppercase;color:rgb(var(--ink) / 0.5);"`;
const LINK = `style="display:inline-flex;align-items:center;min-height:40px;font-size:15px;font-weight:500;color:rgb(var(--ink) / 0.72);white-space:nowrap;" style-hover="color:rgb(var(--ink));"`;
const col = (label, links) =>
  `<nav aria-label="${label}" style="display:grid;align-content:start;justify-items:start;min-width:0;"><p ${HEAD}>${label}</p>` +
  links.map(([href, on, text]) => `<a href="${href}"${on ? ` onClick="{{ ${on} }}"` : ""} ${LINK}>${text}</a>`).join("") +
  `</nav>`;

const FOOTER_LAYOUT = {
  why: "Footer (2026-10-30, Luca): the crate stack sits centred on the 'Your week back' line, and the footer reads as a proper site footer: the CTA on top, then a hairline, the logo with a one-line description and three link columns (Product, Get started, Company), then the © row",
  find: /<footer id="cta"[\s\S]*?<\/footer>/g,
  count: 1,
  replace: (ft) => {
    const open = take(ft, /^<footer [^>]*>/, "opening tag")[0];
    const h2 = take(ft, /<h2 [\s\S]*?<\/h2>/, "headline")[0];
    const sub = take(ft, /<p [^>]*>Your week back\. Shelves full\. Suppliers on time\.<\/p>/, "sub line")[0].replace('style="margin:0;', 'style="margin:24px 0 0;');
    const btns = take(ft, /<div style="grid-area:\{\{ footA2 \}\};[^"]*">([\s\S]*?Book a demo<\/a>)<\/div>/, "CTA row")[1];
    const legal = take(ft, /<span aria-hidden="true" style="display:block;width:max\(178px[^"]*"><\/span>/, "legal slot (NO_LEGAL_NAV)")[0];
    const copy = take(ft, /<span [^>]*>© 2026 Everstock<\/span>/, "© line")[0];
    if (!/href="#feedback"/.test(ft)) throw new Error("v9-footer: FOOTER_FEEDBACK has not run");
    return [
      open,
      `  <div style="padding:clamp(104px,14svh,152px) var(--edge) calc(28px + env(safe-area-inset-bottom));">`,
      `    <div style="display:grid;grid-template-columns:{{ fCols }};column-gap:clamp(48px,6vw,120px);align-items:center;">`,
      `      <div style="grid-area:{{ fH }};">${h2}</div>`,
      `      <div style="grid-area:{{ fP }};">${sub}</div>`,
      `      <div style="grid-area:{{ fB }};margin-top:40px;display:flex;flex-wrap:wrap;align-items:center;gap:16px 28px;">${btns}</div>`,
      // zero-height row box on tablet/desktop: the stack overflows it evenly above and below, so its
      // centre sits on the sub line whatever the headline's size
      `      <div ref="{{ stackRef }}" data-keep="true" aria-hidden="true" style="grid-area:{{ fArt }};align-self:center;height:{{ fArtH }};margin-top:{{ fArtMt }};display:flex;align-items:center;justify-content:center;position:relative;pointer-events:none;">`,
      `        <img data-stack2="true" alt="" style="display:block;flex:none;image-rendering:pixelated;">`,
      `      </div>`,
      `    </div>`,
      `    <div style="margin-top:{{ fRuleMt }};padding-top:clamp(48px,7svh,72px);border-top:1px solid rgb(var(--ink) / 0.12);display:grid;grid-template-columns:{{ fLinkCols }};gap:40px clamp(24px,3vw,48px);">`,
      `      <div style="grid-column:{{ fBrandSpan }};display:grid;align-content:start;gap:18px;max-width:340px;">`,
      `        <a href="#top" aria-label="Everstock home" style="display:inline-flex;align-items:center;gap:12px;min-height:44px;justify-self:start;"><img src="assets/logo-mark-dark.svg" width="45" height="28" alt=""><span style="font-weight:600;font-size:13.5px;letter-spacing:0.2em;color:rgb(var(--ink));white-space:nowrap;">EVERSTOCK</span></a>`,
      `        <p style="margin:0;font-size:15px;line-height:1.55;color:rgb(var(--ink) / 0.64);">Supply chain software that reads your quotes, orders and invoices and drafts every order for your sign-off.</p>`,
      `      </div>`,
      `      ${col("Product", [["#workflows", "", "How it works"], ["#industries", "", "Industries"], ["Pricing.dc.html", "", "Pricing"], ["Pricing.dc.html#compare", "", "Compare"]])}`,
      `      ${col("Get started", [["#stock-plan", "goPF", "Get a Stock Plan"], ["#waitlist", "openFounding", "Get early access"], ["#book-demo", "openDemo", "Book a demo"]])}`,
      `      ${col("Company", [["#feedback", "", "Send feedback"]])}`,
      `    </div>`,
      // the empty slot NO_LEGAL_NAV leaves (Privacy, Terms, LinkedIn come back here once they exist)
      `    <div style="margin-top:clamp(48px,7svh,72px);display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px 32px;padding-top:20px;border-top:1px solid rgb(var(--ink) / 0.12);">`,
      `      ${copy}`,
      `      ${legal}`,
      `    </div>`,
      `  </div>`,
      `</footer>`,
    ].join("\n");
  },
};

const FOOTER_VALS = {
  why: "Footer: grid placement for the rebuilt footer. Phone: one column, the stack under the CTAs. Tablet and desktop: the stack in the right column on the sub line's row; desktop puts the logo and the three link columns on one row, tablet puts the logo above them",
  find: "...(this.state.phone ? { footCols: 'minmax(0,1fr)', footA1: '1 / 1 / 2 / 2', footA2: '2 / 1 / 3 / 2', footA4: '3 / 1 / 4 / 2', footA3: '4 / 1 / 5 / 2', footArtJs: 'center', footArtMt: '40px', footArtMr: '0' }\n        : { footCols: 'auto auto', footA1: '1 / 1 / 2 / 2', footA2: '2 / 1 / 3 / 2', footA4: '1 / 2 / 2 / 3', footA3: '3 / 1 / 4 / 3', footArtJs: 'start', footArtMt: '-52px', footArtMr: '0' }),",
  replace:
    "...(this.state.phone ? { fCols: 'minmax(0,1fr)', fH: '1 / 1 / 2 / 2', fP: '2 / 1 / 3 / 2', fB: '3 / 1 / 4 / 2', fArt: '4 / 1 / 5 / 2', fArtH: 'auto', fArtMt: '56px', fRuleMt: '72px', fLinkCols: 'repeat(2,minmax(0,1fr))', fBrandSpan: '1 / -1' }\n" +
    "        : { fCols: 'auto minmax(0,1fr)', fH: '1 / 1 / 2 / 2', fP: '2 / 1 / 3 / 2', fB: '3 / 1 / 4 / 2', fArt: '2 / 2 / 3 / 3', fArtH: '0px', fArtMt: '24px', fRuleMt: 'clamp(104px,13svh,136px)', fLinkCols: wide ? 'minmax(0,1.7fr) repeat(3,minmax(0,1fr))' : 'repeat(3,minmax(0,1fr))', fBrandSpan: wide ? 'auto' : '1 / -1' }),",
};

/* ---------- Chicago canvas ---------- */
// After CHICAGO_SMOOTH (scripts/port-dc.mjs): the scene is sampled on a finer dot grid (3px
// cells of the 640×400 drawing instead of 4px) with a matching globe density, phones render at
// up to 3x, the L train pulls out and brakes to a stop instead of gliding at one speed, and the
// per-dot colour strings are looked up instead of built every frame.
const CHICAGO_HIFI = [
  {
    why: "Chicago: the skyline is sampled every 3px of the drawing instead of every 4px (about 1.8x the dots), so the city reads finer and the window strips and bridge truss show",
    find: "const W0 = 640, H0 = 400, C = 4, rnd = this.rng(20260929);",
    replace: "const W0 = 640, H0 = 400, C = 3, rnd = this.rng(20260929);",
  },
  {
    why: "Chicago: the globe gets the same density step (4200 → 7600 points), so its dots match the city's size and spacing",
    find: "const NG = 4200,",
    replace: "const NG = 7600,",
  },
  {
    why: "Chicago: phones render the scene at up to 3x device pixels (the canvas is small there, so it is cheap); larger canvases stay at 2x",
    find: "const dpr = Math.min(2, window.devicePixelRatio || 1), W = Math.round(w * dpr), H = Math.round(hh * dpr);",
    replace: "const dpr = Math.min(w * hh > 200000 ? 2 : 3, window.devicePixelRatio || 1), W = Math.round(w * dpr), H = Math.round(hh * dpr);",
  },
  {
    why: "Chicago: the city's dot pitch is a whole number of device pixels (the scene scales by a few percent to land on one, never past the canvas edges (the drawing has 8px of empty sky above the spires)) and the scene's origin sits on a device pixel, so every gap between dots is the same width instead of alternating 1px / 2px",
    find: "const k = Math.min(w / 640, hh / 400) * 0.96, ox = (w - 640 * k) / 2, oy = (hh - 400 * k) / 2;",
    replace:
      "const k0 = Math.min(w / 640, hh / 400) * 0.96, cq = cg.C * dpr, cpx = Math.round(k0 * cq), k = (cpx / cq > Math.min(w / 640, hh / 384) ? Math.max(2, Math.floor(k0 * cq)) : Math.max(2, cpx)) / cq, ox = Math.round(((w - 640 * k) / 2) * dpr) / dpr, oy = Math.round(((hh - 400 * k) / 2) * dpr) / dpr;",
  },
  {
    why: "Chicago: the dot size floor is 2 device pixels instead of 1.5 CSS pixels (which was 4.5 device pixels at 3x, wider than the finer pitch and soft)",
    find: "ds = Math.max(1.5, Math.round(cg.C * k * 0.72 * dpr) / dpr)",
    replace: "ds = Math.max(2, Math.round(cg.C * k * 0.72 * dpr)) / dpr",
  },
  {
    why: "Chicago: the dot colours come from a 256-step table instead of a new rgba() string per dot per frame (the scene draws ~10k dots a frame now)",
    find: "INK = (a) => (cgDK ? 'rgba(236,234,228,' : 'rgba(22,23,27,') + Math.max(0, Math.min(1, a)).toFixed(3) + ')';",
    replace:
      "INKT = (this.cgInk && this.cgInk.dk === cgDK) ? this.cgInk : (this.cgInk = Object.assign(Array.from({ length: 256 }, (_, q) => (cgDK ? 'rgba(236,234,228,' : 'rgba(22,23,27,') + (q / 255).toFixed(3) + ')'), { dk: cgDK })), INK = (a) => INKT[Math.round(Math.max(0, Math.min(1, a)) * 255)];",
  },
  {
    why: "Chicago: the L train reads as one object in front of the skyline: the building dots behind its three cars are left out, its dots are a touch darker (0.94 vs 0.86 ink), and on 2x/3x screens it snaps to device pixels so it is crisp when it stops (1x screens keep the sub-pixel glide)",
    find: "if (pp <= 0) { const tf = P.tr ? clamp(Math.min(x, 466 - x) / 28) : 1; if (tf <= 0) continue; g.fillStyle = INK(0.86 * tf); g.fillRect(P.tr ? ax : sn(ax), sn(ay), ds, ds); continue; }",
    replace:
      "if (pp <= 0) { if (!P.tr && P.y >= 222 && P.y < 247 && x > 14 && x < 452) { const q = x - trX; if (q >= -1 && q < 190 && (q + 64) % 64 < 61) continue; } const tf = P.tr ? clamp(Math.min(x, 466 - x) / 28) : 1; if (tf <= 0) continue; g.fillStyle = INK((P.tr ? 0.94 : 0.86) * tf); g.fillRect(P.tr && dpr < 2 ? ax : sn(ax), sn(ay), ds, ds); continue; }",
  },
  {
    why: "Chicago: each particle's landing spot on the globe is projected once per globe pose and size, not every frame (with the finer grid the morph moves ~6k particles a frame)",
    find: "pca = Math.cos(angEnd), psa = Math.sin(angEnd);",
    replace: "pca = Math.cos(angEnd), psa = Math.sin(angEnd), pbk = angEnd + ',' + w + ',' + hh;\n    if (this.cgPBk !== pbk || this.cgPBo !== cg.P) { this.cgPBk = pbk; this.cgPBo = cg.P; this.cgPB = []; }\n    const PB = this.cgPB;",
  },
  {
    why: "Chicago: the morph reads the cached landing spot",
    find: "const b = proj(P.tg, pca, psa), e = ease(pp)",
    replace: "const b = PB[n] || (PB[n] = proj(P.tg, pca, psa)), e = ease(pp)",
  },
  {
    why: "Chicago: the L train pulls out of the station and brakes to a stop over 0.7s at each end of the city's hold (same distance per cycle), instead of running at one speed and freezing when the city starts to dissolve",
    find: "trT = !this.cgStart || red ? t : this.cgStart + cyc * HC + Math.min(tau, HC), trX = ((trT * 46) % 672) - 200;",
    replace:
      "RMP = 0.7, VT = (46 * HC) / (HC - RMP), trD = (u) => (u < RMP ? (VT * u * u) / (2 * RMP) : u > HC - RMP ? VT * (HC - RMP) - (VT * (HC - u) * (HC - u)) / (2 * RMP) : VT * (u - RMP / 2)), trX = ((!this.cgStart || red ? t * 46 : (this.cgStart * 46) % 672 + cyc * 46 * HC + trD(Math.min(tau, HC))) % 672) - 200;",
  },
];

export const logicPatches = [FOOTER_VALS, ...CHICAGO_HIFI];
export const templatePatches = [FOOTER_LAYOUT];
