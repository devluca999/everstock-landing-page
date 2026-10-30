/**
 * v9 home page: the v5 Plan section ("Up and running in days.") and the brief marquee come
 * back, and the Pricing section lists the tiers (2026-10-30, Luca).
 *
 * Order after these patches: … Industries · Plan `#plan` · Pricing `#pricing` (stockbot card +
 * Base / Scale / Enterprise) · marquee · Stock Plan `#stock-plan` · footer.
 *
 * The Plan's logic is still in the v9 design (layoutPlan / drawPlan / planLoop, planRef …), and
 * the Plan logic patches in scripts/port-dc.mjs already make it autoplay on a clock instead of
 * scroll (planSecH auto, plT0 clock: 7s run + 2.5s hold, loop; reset on leaving). The marquee's
 * logic (mqItems, mqStatic/mqLive, mqAnim, hover pause) and the esMarquee keyframes are in v9 too.
 * Only the markup was gone, so most of this is template.
 *
 * Copy: setup takes days (Luca: "onboarded and set up in less than a week, like in a couple
 * days"). No em dashes; prices and one-liners match mockup/v9/Pricing.dc.html and
 * app/llms.txt/route.ts.
 */

const MONO = "font-family:'Geist Mono',ui-monospace,monospace;";
const GRID_BG =
  "background-color:rgb(var(--bg));background-image:linear-gradient(rgb(var(--ink) / 0.06) 1px,transparent 1px),linear-gradient(90deg,rgb(var(--ink) / 0.06) 1px,transparent 1px);background-size:84px 84px;";
const STEP_NUM = `opacity:{{ po$ }};transition:{{ fade }};${MONO}font-size:12px;letter-spacing:0.08em;color:rgb(var(--ink) / 0.9);`;
const STEP_TXT =
  "font-family:'General Sans','Space Grotesk',sans-serif;font-weight:600;font-size:clamp(20px,1.8vw,25px);line-height:1.2;letter-spacing:-0.02em;text-wrap:balance;color:rgb(var(--ink));opacity:{{ po$ }};transition:{{ fade }};";
const step = (i, text, extra = "") =>
  `<li style="display:grid;gap:12px;align-content:start;"><span style="${STEP_NUM.replace("$", i)}">0${i + 1}</span><span style="justify-self:start;${STEP_TXT.replace("$", i)}">${text}</span>${extra}</li>`;

// v9's primary CTA (hero / pricing card): "Get early access", the green APPROVED stamp on hover
const PLAN_CTA =
  `<a href="#waitlist" onClick="{{ openFounding }}" data-cta="plan" onMouseEnter="{{ ctaIn }}" onTouchStart="{{ ctaIn }}" onMouseLeave="{{ ctaOut }}" onFocus="{{ ctaIn }}" onBlur="{{ ctaOut }}" style="position:relative;justify-self:start;margin-top:6px;height:50px;padding:0 24px;display:inline-flex;align-items:center;border-radius:8px;background:rgb(var(--ink));color:rgb(var(--bg));font-size:16px;font-weight:600;white-space:nowrap;transition:box-shadow 220ms cubic-bezier(.2,.8,.25,1),background-color 220ms cubic-bezier(.2,.8,.25,1);" style-hover="background:rgb(var(--hi));color:rgb(var(--bg));box-shadow:0 10px 22px -10px rgba(0,0,0,0.5);" style-active="transform:scale(0.985);">Get early access` +
  `<span aria-hidden="true" style="position:absolute;top:-11px;right:-12px;z-index:1;padding:2px 6px;background:#FAF7F1;border:2px solid #08745A;border-radius:3px;color:#08745A;${MONO}font-weight:700;font-size:9.5px;line-height:1.2;letter-spacing:0.14em;text-transform:uppercase;-webkit-mask-image:var(--v3-stamp);mask-image:var(--v3-stamp);-webkit-mask-size:140px;mask-size:140px;pointer-events:none;opacity:{{ planStampOp }};transform:{{ planStampTf }};transition:{{ stampTr }};">Approved</span></a>`;

// v5's Plan section, set like its v9 neighbours: General Sans heading, var(--edge) gutters, the
// light grid. The canvas stays the direct parent-sibling of the <ol> (layoutPlan finds the step
// columns with cv.parentElement.querySelectorAll('ol > li')).
// The brief banner (MARQUEE_SECTION) goes right after the Plan, before Pricing (Luca, 2026-10-30:
// two sections above it, two below: Pricing + Stock Plan). It scrolls on its own, pauses on hover,
// and is one static row under reduced motion.
const PLAN_SECTION = [
  `<section ref="{{ planRef }}" id="plan" data-tone="light" data-screen-label="06b Plan" aria-labelledby="plan-h" style="position:relative;height:{{ planSecH }};${GRID_BG}color:rgb(var(--ink));border-top:1px solid rgb(var(--ink) / 0.10);">`,
  `    <div style="position:{{ planPos }};top:0;padding:clamp(88px,12svh,128px) var(--edge) clamp(64px,9svh,96px);display:grid;gap:clamp(28px,4.4svh,48px);">`,
  `      <div style="display:grid;gap:16px;">`,
  `        <span style="${MONO}font-size:11px;font-weight:500;letter-spacing:0.1em;text-transform:uppercase;color:rgb(var(--ink) / 0.64);">Setup</span>`,
  `        <h2 id="plan-h" style="font-family:'General Sans','Space Grotesk',sans-serif;letter-spacing:-0.022em;margin:0;max-width:24ch;font-weight:600;font-size:clamp(32px,4vw,56px);line-height:1.04;color:rgb(var(--ink));text-wrap:balance;">Up and running in days.</h2>`,
  `      </div>`,
  `      <div style="display:grid;gap:22px;">`,
  `        <canvas ref="{{ planCvRef }}" aria-hidden="true" style="display:block;width:100%;height:{{ planCvH }};"></canvas>`,
  `        <ol style="list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));gap:24px 32px;">`,
  `          ${step(0, "Send us your paperwork.", PLAN_CTA)}`,
  `          ${step(1, "Review your live model.")}`,
  `          ${step(2, "Approve your first orders.")}`,
  `        </ol>`,
  `      </div>`,
  `      <p style="margin:0;padding-top:22px;border-top:1px solid rgb(var(--ink) / 0.12);${MONO}font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:rgb(var(--ink) / 0.72);">Send it Monday. Approve orders by Friday.</p>`,
  `    </div>`,
  `  </section>`,
  ``,
  `  `,
].join("\n");

// v5's marquee band ("08b Marquee"), verbatim but for the section id. Reduced motion gets one
// static centred row; otherwise two copies scroll by -50% (esMarquee, 52s) and pause on hover.
const MQ_ITEM =
  `<div style="display:flex;align-items:center;gap:clamp(26px,3vw,52px);padding-right:clamp(26px,3vw,52px);">` +
  `<span style="font-size:clamp(11px,1.05vw,13px);font-weight:500;letter-spacing:max(0.14em, min(0.24em, calc(0.24em - (900px - 100vw) * 100)));text-transform:uppercase;color:rgb(var(--ink) / 0.72);white-space:nowrap;">{{ m }}</span>` +
  `<span aria-hidden="true" style="display:block;width:4px;height:4px;border-radius:50%;background:rgb(var(--ink) / 0.44);"></span></div>`;
const MQ_DOT = `<span aria-hidden="true" style="display:block;width:4px;height:4px;border-radius:50%;background:rgb(var(--ink) / 0.44);"></span>`;
const MARQUEE_SECTION = [
  `<section id="brief" data-tone="dark" data-screen-label="08b Marquee" aria-label="Everstock in brief" style="position:relative;background:rgb(var(--bg));border-top:1px solid rgb(var(--ink) / 0.08);padding:clamp(30px,4.6svh,52px) 0;">`,
  `    <sc-if value="{{ mqStatic }}" hint-placeholder-val="{{ false }}">`,
  `      <p style="margin:0;padding:0 var(--edge);display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:10px clamp(26px,3vw,52px);font-size:clamp(11px,1.05vw,13px);font-weight:500;letter-spacing:max(0.14em, min(0.24em, calc(0.24em - (900px - 100vw) * 100)));text-transform:uppercase;color:rgb(var(--ink) / 0.78);text-align:center;"><span>Every part matched to what it fits</span>${MQ_DOT}<span>You approve every order</span>${MQ_DOT}<span>No rip and replace</span>${MQ_DOT}<span>Runs with your ERP, or without one</span></p>`,
  `    </sc-if>`,
  `    <sc-if value="{{ mqLive }}" hint-placeholder-val="{{ true }}">`,
  `    <div onMouseEnter="{{ mqPause }}" onMouseLeave="{{ mqPlay }}" style="overflow:hidden;-webkit-mask-image:linear-gradient(90deg,transparent 0,#000 7%,#000 93%,transparent 100%);mask-image:linear-gradient(90deg,transparent 0,#000 7%,#000 93%,transparent 100%);">`,
  `      <div style="display:flex;width:max-content;animation:{{ mqAnim }};animation-play-state:{{ mqPlayState }};">`,
  `        <div style="display:flex;align-items:center;"><sc-for list="{{ mqItems }}" as="m" hint-placeholder-count="6">${MQ_ITEM}</sc-for></div>`,
  `        <div aria-hidden="true" style="display:flex;align-items:center;"><sc-for list="{{ mqItems }}" as="m" hint-placeholder-count="6">${MQ_ITEM}</sc-for></div>`,
  `      </div>`,
  `    </div>`,
  `    </sc-if>`,
  `  </section>`,
  ``,
  `  `,
].join("\n");

// The tiers, beside the stockbot card (it stays the "Start here" offer): one hairline row each,
// name and price on top, who it's for underneath. Replaces the "Grow into Base, Scale or
// Enterprise…" line, so nothing on the page says the same thing twice.
const tier = (name, price, line, note = "") =>
  `<li style="display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:baseline;gap:4px 16px;padding:12px 0;border-bottom:1px solid rgb(var(--ink) / 0.14);">` +
  `<span style="font-family:'General Sans','Space Grotesk',sans-serif;font-size:17px;font-weight:600;letter-spacing:-0.01em;color:rgb(var(--ink));">${name}</span>` +
  `<span style="${MONO}font-variant-numeric:tabular-nums lining-nums;font-size:15px;font-weight:500;color:rgb(var(--ink));white-space:nowrap;">${price}</span>` +
  `<span style="grid-column:1 / -1;font-size:14px;line-height:1.45;color:rgb(var(--ink) / 0.72);text-wrap:pretty;">${line}${note ? `<span style="display:block;margin-top:2px;${MONO}font-size:11.5px;letter-spacing:0.02em;color:rgb(var(--ink) / 0.64);">${note}</span>` : ""}</span></li>`;
const PER = `<span style="font-size:12px;color:rgb(var(--ink) / 0.64);">/mo</span>`;
const TIERS = (ind) =>
  [
    `<div style="flex:1 1 300px;min-width:0;display:grid;gap:6px;">`,
    `  <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:4px 16px;">`,
    `    <span style="${MONO}font-size:11px;font-weight:500;letter-spacing:0.1em;text-transform:uppercase;color:rgb(var(--ink) / 0.64);">Grow into</span>`,
    `    <a href="Pricing.dc.html" style="display:inline-flex;align-items:center;min-height:44px;font-size:15px;font-weight:600;color:rgb(var(--ink));text-decoration:underline;text-decoration-color:rgb(var(--ink) / 0.35);text-underline-offset:5px;" style-hover="text-decoration-color:rgb(var(--ink));">Compare plans →</a>`,
    `  </div>`,
    `  <ul aria-label="Plans" style="list-style:none;margin:0;padding:0;display:grid;border-top:1px solid rgb(var(--ink) / 0.14);">`,
    `    ${tier("Base", `<span style="font-size:12px;color:rgb(var(--ink) / 0.64);">from </span>$199${PER}`, "stockbot reads your inbox, so paperwork sorts itself.", "+ $75 per seat · capped at $499/mo")}`,
    `    ${tier("Scale", `$999${PER}`, "Your team and your agent, working off the same page.", "Up to 50 seats")}`,
    `    ${tier("Enterprise", "Custom", "Multiple agents, your systems, your rules.")}`,
    `  </ul>`,
    `</div>`,
  ].join("\n" + ind);

export const templatePatches = [
  {
    why: "Plan (2026-10-30, Luca): v5's 'Up and running' section comes back, right after Industries and before Pricing, so setup and price read as one stretch. It autoplays (see the Plan logic patches in port-dc.mjs); heading 'Up and running in days.', footnote 'Send it Monday. Approve orders by Friday.' (setup takes days, not two weeks); the CTA is v9's 'Get early access'",
    find: '<section id="pricing" data-tone="light"',
    replace: PLAN_SECTION + MARQUEE_SECTION + '<section id="pricing" data-tone="light"',
  },
  {
    why: "Pricing (2026-10-30, Luca): the tiers are on the home page in a small footprint: Base, Scale and Enterprise as three hairline rows beside the stockbot card (price, who it's for), with 'Compare plans →' to /pricing, in place of the one line that only named them",
    find: /\n( *)<div style="flex:1 1 300px;min-width:0;display:grid;gap:10px;justify-items:start;">\n *<p [^\n]*Grow into Base, Scale or Enterprise[^\n]*\n *<a href="Pricing\.dc\.html"[^\n]*See all plans →<\/a>\n *<\/div>/g,
    count: 1,
    replace: (_m, ind) => "\n" + ind + TIERS(ind),
  },
];

export const logicPatches = [
  {
    // runs after MARQUEE_DAYS ('Live in two weeks' → 'Live in a few days')
    why: "Marquee: 'Findings in days' and 'Live in a few days' sat side by side and said the same thing; one item, 'Live in days', matches the Plan heading",
    find: "'Findings in days', 'Live in a few days',",
    replace: "'Live in days',",
  },
  {
    why: "Plan: the autoplaying canvas paints at display rate (it capped itself at ~33fps, which made the paperwork → model particles step visibly); it still only runs while the section is on screen and the tab is visible",
    find: "if (now - (this.plLast || 0) < 30) return; this.plLast = now;",
    replace: "if (now - (this.plLast || 0) < 15) return; this.plLast = now;",
  },
  {
    why: "Plan (Luca, 2026-10-30): the paperwork and the live model each hold for 1.5s before moving on (the model used to give way after about a second). The clock is in seconds: paperwork lands (0.7s) and holds to 2.2s, flies to the model by 3.3s, the model holds to 4.8s, flies to the box by 5.8s, the box is checked and APPROVED by about 6.9s, then the whole thing holds and loops every 9.8s. The seconds map onto the design's own 0-1 phase marks, so every stage draws as designed",
    find: "const p = this.plT0 == null ? 0 : c01(((t - this.plT0) % 9.5) / 7), S = L.S, C3 = L.cols;",
    replace: "const plK = [[0, 0], [2.2, 0.28], [3.3, 0.44], [4.8, 0.58], [5.8, 0.72], [7.8, 1]], plS = this.plT0 == null ? 0 : (t - this.plT0) % 9.8;\n    let p = 1; for (let i = 1; i < plK.length; i++) if (plS <= plK[i][0]) { const a = plK[i - 1], b = plK[i]; p = a[1] + ((plS - a[0]) / (b[0] - a[0])) * (b[1] - a[1]); break; }\n    const S = L.S, C3 = L.cols;",
  },
  {
    why: "Plan (Luca, 2026-10-30): each picture is centred on its step's title, not on the whole column (the titles are left-aligned, so 'Review your live model' sat right of its words)",
    find: "const cols = wide && lis.length === 3 ? lis.map((li) => { const r = li.getBoundingClientRect(); return r.left - cr.left + r.width / 2; }) : [w / 2, w / 2, w / 2];",
    replace: "const cols = wide && lis.length === 3 ? lis.map((li) => { const r = (li.children[1] || li).getBoundingClientRect(); return r.left - cr.left + r.width / 2; }) : [w / 2, w / 2, w / 2];",
  },
];
