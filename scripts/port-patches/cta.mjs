// One recipe for the home page's calls to action (2026-10-30, Luca: "every section should have
// a CTA that's clearly visible ... make sure the CTAs match").
//
// - stampedCta: the page's primary button (as the hero / Plan "Get early access"): solid ink,
//   the green APPROVED stamp lands on hover. `key` is its data-cta; the stamp reads
//   {{ <key>StampOp }} / {{ <key>StampTf }}, so the key must be in STAMP_KEYS (v9-ctas.mjs adds
//   them to the logic's list). ink/bg follow the section's tone, so it works on dark and light.
// - textCta: the secondary action, an underlined link (as "Book a demo" beside the hero CTA).
//
// Destinations: "Try it now" and "Get a free Stock Plan" open the Stock Plan modal (goPF, like the
// design's own "Try it now" links); "Get early access" opens early access (openFounding);
// "Book a demo" / "Talk to us" open the demo (openDemo). The port binds #waitlist / #book-demo.

const MONO = "font-family:'Geist Mono',ui-monospace,monospace;";
const HANDLERS = 'onMouseEnter="{{ ctaIn }}" onTouchStart="{{ ctaIn }}" onMouseLeave="{{ ctaOut }}" onFocus="{{ ctaIn }}" onBlur="{{ ctaOut }}"';

export const DEST = {
  plan: 'href="#price-file" onClick="{{ goPF }}"',
  early: 'href="#waitlist" onClick="{{ openFounding }}"',
  demo: 'href="#book-demo" onClick="{{ openDemo }}"',
};

export const stampedCta = ({ key, to, label, style = "", h = 50 }) =>
  `<a ${DEST[to]} data-cta="${key}" ${HANDLERS} style="position:relative;justify-self:start;height:${h}px;padding:0 24px;display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;border-radius:8px;background:rgb(var(--ink));color:rgb(var(--bg));font-size:16px;font-weight:600;white-space:nowrap;text-decoration:none;transition:box-shadow 220ms cubic-bezier(.2,.8,.25,1),background-color 220ms cubic-bezier(.2,.8,.25,1);${style}" style-hover="background:rgb(var(--hi));color:rgb(var(--bg));box-shadow:0 10px 22px -10px rgba(0,0,0,0.5);" style-active="transform:scale(0.985);">${label}` +
  `<span aria-hidden="true" style="position:absolute;top:-11px;right:-12px;z-index:1;padding:2px 6px;background:#FAF7F1;border:2px solid #08745A;border-radius:3px;color:#08745A;${MONO}font-weight:700;font-size:9.5px;line-height:1.2;letter-spacing:0.14em;text-transform:uppercase;-webkit-mask-image:var(--v3-stamp);mask-image:var(--v3-stamp);-webkit-mask-size:140px;mask-size:140px;pointer-events:none;opacity:{{ ${key}StampOp }};transform:{{ ${key}StampTf }};transition:{{ stampTr }};">Approved</span></a>`;

export const textCta = ({ to, label, style = "" }) =>
  `<a ${DEST[to]} style="display:inline-flex;align-items:center;min-height:44px;font-size:16px;font-weight:600;color:rgb(var(--ink));text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:5px;text-decoration-color:rgb(var(--ink) / 0.35);white-space:nowrap;${style}" style-hover="text-decoration-color:rgb(var(--ink));">${label}</a>`;

// a primary + secondary pair on one row (wraps on phones)
export const ctaRow = (primary, secondary, style = "") =>
  `<div style="display:flex;flex-wrap:wrap;align-items:center;gap:14px 26px;${style}">${primary}${secondary || ""}</div>`;

// the data-cta keys added to the logic's stamp list
export const STAMP_KEYS = ["cap", "prob", "wf", "ind", "tb", "ts", "te", "foot3"];

// a compact outlined button with the same stamp (the per-tier "Start with …" buttons)
export const outlineCta = ({ key, to, label, style = "" }) =>
  `<a ${DEST[to]} data-cta="${key}" ${HANDLERS} style="position:relative;height:40px;padding:0 16px;display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;border-radius:7px;border:1.5px solid rgb(var(--ink));background:transparent;color:rgb(var(--ink));font-size:14.5px;font-weight:600;white-space:nowrap;text-decoration:none;transition:background-color 200ms cubic-bezier(.2,.8,.25,1),color 200ms cubic-bezier(.2,.8,.25,1);${style}" style-hover="background:rgb(var(--ink));color:rgb(var(--bg));" style-active="transform:scale(0.985);">${label}` +
  `<span aria-hidden="true" style="position:absolute;top:-10px;right:-12px;z-index:1;padding:2px 5px;background:#FAF7F1;border:2px solid #08745A;border-radius:3px;color:#08745A;${MONO}font-weight:700;font-size:8.5px;line-height:1.2;letter-spacing:0.14em;text-transform:uppercase;-webkit-mask-image:var(--v3-stamp);mask-image:var(--v3-stamp);-webkit-mask-size:120px;mask-size:120px;pointer-events:none;opacity:{{ ${key}StampOp }};transform:{{ ${key}StampTf }};transition:{{ stampTr }};">Approved</span></a>`;
