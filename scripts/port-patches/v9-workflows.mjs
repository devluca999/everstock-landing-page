// v9 site patches for one area of the home page (2026-10-30). Same rules as the patches in
// scripts/port-dc.mjs: each anchor must match its count exactly against the design text as
// the earlier patches left it, or the port fails.
//
// Area: #workflows ("The supply work that runs itself."), Luca 2026-10-30:
//  - the section must keep one size whichever tab is showing (tab 04 used to grow it), and the
//    panel moves up next to the headline so the section is not taller than before;
//  - less plain: richer "what came in" artifacts with real brand marks (Gmail, Shopify,
//    QuickBooks, WhatsApp), a progress rail that fills as the workflow plays, and the produced
//    card filling in step by step. Reduced motion shows every pane complete and still.
//
// How the size stays fixed: all four tab panes are rendered in one grid cell of #wf-panel, only
// the active one visible, so the cell is always as tall as the tallest pane at that width.
// The panel picks its inner layout (two columns, horizontal or vertical rail) with container
// queries on its own width, so it is right wherever the outer grid puts it.

const E = "cubic-bezier(.2,.8,.25,1)";
const MONO = "font-family:'Geist Mono',ui-monospace,monospace;font-variant-numeric:tabular-nums lining-nums;";
const LAB = "font-family:'Space Grotesk',sans-serif;font-size:10.5px;font-weight:500;letter-spacing:0.1em;text-transform:uppercase;color:rgba(242,241,237,0.64);";
const MUTED = "rgba(242,241,237,0.64)";
const CARD =
  "position:relative;background:linear-gradient(180deg,#202127,#1A1B20);border:1px solid rgba(242,241,237,0.12);border-radius:10px;box-shadow:inset 0 1px 0 rgba(255,255,255,0.06),0 2px 4px rgba(0,0,0,0.35),0 26px 44px -24px rgba(0,0,0,0.8);color:#F2F1ED;";
const PAPER_SH = "box-shadow:0 1px 2px rgba(0,0,0,0.35),0 26px 44px -22px rgba(0,0,0,0.7);";
const ROW = "display:flex;justify-content:space-between;align-items:baseline;gap:12px;text-align:right;padding:9px 0;border-top:1px solid rgba(242,241,237,0.08);";
const dot = (c) =>
  `<span aria-hidden="true" style="flex:none;width:7px;height:7px;border-radius:50%;background:${c};box-shadow:0 0 0 1px ${c}80,0 0 8px 1px ${c}B0;"></span>`;

/* ---------- brand marks (official shapes and colors, drawn small) ---------- */
const GMAIL = (s = 16) =>
  `<svg aria-hidden="true" width="${s}" height="${Math.round(s * 0.75)}" viewBox="3 8 42 32" style="display:block;flex:none;"><path fill="#4caf50" d="M45,16.2l-5,2.75l-5,4.75L35,40h7c1.657,0,3-1.343,3-3V16.2z"></path><path fill="#1e88e5" d="M3,16.2l3.614,1.71L13,23.7V40H6c-1.657,0-3-1.343-3-3V16.2z"></path><polygon fill="#e53935" points="35,11.2 24,19.45 13,11.2 12,17 13,23.7 24,31.95 35,23.7 36,17"></polygon><path fill="#c62828" d="M3,12.298V16.2l10,7.5V11.2L9.876,8.859C9.132,8.301,8.228,8,7.298,8h0C4.924,8,3,9.924,3,12.298z"></path><path fill="#fbc02d" d="M45,12.298V16.2l-10,7.5V11.2l3.124-2.341C38.868,8.301,39.772,8,40.702,8h0C43.076,8,45,9.924,45,12.298z"></path></svg>`;
const SHOPIFY = (h = 15) =>
  `<svg width="${Math.round(h * 0.88)}" height="${h}" aria-hidden="true" viewBox="0 0 109.5 124.5" style="display:block;flex:none;"><path fill="#95BF47" d="M74.7,14.8c0,0-1.4,0.4-3.7,1.1c-0.4-1.3-1-2.8-1.8-4.4c-2.6-5-6.5-7.7-11.1-7.7c-0.3,0-0.6,0-1,0.1c-0.1-0.2-0.3-0.3-0.4-0.5c-2-2.2-4.6-3.2-7.7-3.1c-6,0.2-12,4.5-16.8,12.2c-3.4,5.4-6,12.2-6.7,17.5c-6.9,2.1-11.7,3.6-11.8,3.7c-3.5,1.1-3.6,1.2-4,4.5C9.1,40.7,0,111.2,0,111.2l75.6,13.1V14.6C75.2,14.7,74.9,14.7,74.7,14.8z"></path><path fill="#5E8E3E" d="M78.1,123.9l31.4-7.8c0,0-13.5-91.3-13.6-91.9c-0.1-0.6-0.6-1-1.1-1c-0.5,0-9.3-0.2-9.3-0.2s-5.4-5.2-7.4-7.2V123.9z"></path></svg>`;
const QB = (s = 16) =>
  `<svg aria-hidden="true" width="${s}" height="${s}" viewBox="0 0 24 24" style="display:block;flex:none;"><circle cx="12" cy="12" r="12" fill="#2CA01C"></circle><path fill="#FFFFFF" d="M12.642 4.1335c.9554 0 1.7296.776 1.7296 1.7332v9.0667h1.6c1.614 0 2.9275-1.3156 2.9275-2.933 0-1.6173-1.3136-2.9333-2.9276-2.9333h-.6654V7.3334h.6654c2.5722 0 4.6577 2.0897 4.6577 4.667 0 2.5774-2.0855 4.6666-4.6577 4.6666H12.642zM7.9837 7.333h3.3291v12.533c-.9555 0-1.73-.7759-1.73-1.7332V9.0662H7.9837c-1.6146 0-2.9277 1.316-2.9277 2.9334 0 1.6175 1.3131 2.9333 2.9277 2.9333h.6654v1.7332h-.6654c-2.5725 0-4.6577-2.0892-4.6577-4.6665 0-2.5771 2.0852-4.6666 4.6577-4.6666Z"></path></svg>`;
const WHATSAPP = (s = 18) =>
  `<svg aria-hidden="true" width="${s}" height="${s}" viewBox="0 0 720 720" fill="#25D366" style="display:block;flex:none;"><path d="M360,0C161.18,0,0,161.18,0,360c0,65.41,17.45,126.75,47.94,179.61L0,720l187.02-44.21c51.34,28.18,110.28,44.21,172.98,44.21,198.82,0,360-161.18,360-360S558.82,0,360,0ZM360,655.52c-60.17,0-116.13-17.98-162.82-48.87l-110.49,28.14,30.99-105.61c-33.53-47.93-53.2-106.26-53.2-169.19,0-163.21,132.31-295.52,295.52-295.52s295.52,132.31,295.52,295.52-132.31,295.52-295.52,295.52Z"></path><path d="M444.35,407.52l87.1,41.06c4,1.88,6.56,5.94,6.2,10.34-.94,11.46-5.54,34.43-26.13,55.02-58.12,58.12-162.49-7.64-166.74-10.18-25.67-13.79-50.06-32.24-73.19-55.36-23.12-23.12-41.58-47.52-55.37-73.19-2.55-4.24-68.31-108.61-10.18-166.74,20.59-20.59,43.56-25.19,55.02-26.13,4.41-.36,8.46,2.2,10.34,6.2l41.07,87.1c1.94,4.12,1.09,9.02-2.13,12.24l-30.61,30.61c-6.62,6.62-8.56,16.93-4,25.11,11.17,20.03,26.19,39.32,43.59,57.07,17.75,17.4,37.04,32.43,57.07,43.59,8.18,4.56,18.48,2.62,25.11-4l30.61-30.61c3.22-3.22,8.12-4.08,12.24-2.13Z"></path></svg>`;
const CHECK = (c = "#1A1B1F", s = 12) =>
  `<svg aria-hidden="true" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"></path></svg>`;

/* ---------- layout CSS (classes keep the breakpoints out of the inline styles) ---------- */
const CSS = [
  "#workflows .wfx{padding:clamp(96px,13svh,144px) var(--edge);display:grid;grid-template-columns:minmax(0,1fr);grid-template-areas:'h' 't' 'p';row-gap:clamp(28px,4.4svh,44px);}",
  "#workflows .wfx-h{grid-area:h;font-size:clamp(32px,4vw,56px);}",
  "#workflows .wfx-t{grid-area:t;display:grid;gap:6px;align-content:start;}",
  "#workflows .wfx-p{grid-area:p;min-width:0;container-type:inline-size;}",
  "@media (max-width:1099.98px){#workflows .wfx-t{grid-template-columns:repeat(2,minmax(0,1fr));}}",
  // phones: the four tabs as a 2 x 2 grid of compact cards, number above the label
  "@media (max-width:639.98px){#workflows .wfx-tab{grid-template-columns:minmax(0,1fr)!important;align-content:start;gap:6px!important;min-height:0!important;padding:12px 14px 14px!important;}#workflows .wfx-tl{font-size:16.5px!important;}}",
  "@media (min-width:1100px){#workflows .wfx{grid-template-columns:minmax(250px,22vw) minmax(0,1fr);grid-template-rows:auto 1fr;grid-template-areas:'h p' 't p';column-gap:clamp(40px,4.4vw,72px);row-gap:clamp(32px,4.6svh,48px);align-items:start;}#workflows .wfx-h{font-size:clamp(36px,3.4vw,52px);}}",
  "#workflows .wfx-stack{display:grid;}",
  "#workflows .wfx-pane{grid-area:1/1;min-width:0;display:grid;grid-template-rows:auto auto 1fr auto;gap:clamp(20px,2.4vw,26px);}",
  "#workflows .wfx-io{display:grid;gap:22px;align-items:start;align-content:start;}",
  "#workflows .wfx-col{display:grid;gap:12px;min-width:0;align-content:start;}",
  "#workflows .wfx-rail{position:relative;list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px;}",
  "#workflows .wfx-rail li{position:relative;z-index:1;display:grid;grid-template-rows:10px auto auto;gap:6px;align-content:start;min-width:0;}",
  "#workflows .wfx-rail .wfx-dot{align-self:center;}",
  "#workflows .wfx-track{position:absolute;z-index:0;left:3px;top:4px;width:calc(80% + 8px);height:2px;border-radius:1px;background:rgba(242,241,237,0.12);overflow:hidden;}",
  "#workflows .wfx-fh,#workflows .wfx-fv{position:absolute;inset:0;border-radius:inherit;}",
  "#workflows .wfx-fh{transform-origin:0 50%;}#workflows .wfx-fv{display:none;transform-origin:50% 0;}",
  "@container (min-width:540px){#workflows .wfx-io{grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:clamp(18px,2.4vw,28px);}}",
  "@container (max-width:539.98px){#workflows .wfx-rail{grid-template-columns:minmax(0,1fr);gap:0;}#workflows .wfx-rail li{grid-template-rows:none;grid-template-columns:7px auto minmax(0,1fr);align-items:center;gap:12px;height:30px;}#workflows .wfx-rail .wfx-d{justify-self:end;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;}#workflows .wfx-track{left:2.5px;top:15px;width:2px;height:calc(100% - 30px);}#workflows .wfx-fh{display:none;}#workflows .wfx-fv{display:block;}}",
].join("\n");

/* ---------- the panes ---------- */
// b(p, key) → a binding into this pane's values (see wfPanes in the logic patch)
const b = (p, k) => `{{ wp${p}.${k} }}`;
const label = (t) => `<span style="${LAB}">${t}</span>`;

function rail(p) {
  return `<ol aria-label="Steps" class="wfx-rail">
              <span aria-hidden="true" class="wfx-track"><span class="wfx-fh" style="${b(p, "fillH")}"></span><span class="wfx-fv" style="${b(p, "fillV")}"></span></span>
              <sc-for list="${b(p, "steps")}" as="s" hint-placeholder-count="5">
                <li><span aria-hidden="true" class="wfx-dot" style="flex:none;width:7px;height:7px;border-radius:50%;background:{{ s.dotBg }};box-shadow:{{ s.dotSh }};transition:background-color 300ms ${E},box-shadow 300ms ${E};"></span><span style="font-size:13.5px;font-weight:500;line-height:1.3;color:#F2F1ED;text-wrap:pretty;">{{ s.t }}</span><span class="wfx-d" style="${MONO}font-size:11.5px;line-height:1.35;color:{{ s.dCol }};transition:color 300ms ${E};">{{ s.d }}</span></li>
              </sc-for>
            </ol>`;
}

function head(p) {
  return `<div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-start;gap:14px 24px;">
            <p style="margin:0;flex:1 1 300px;font-size:clamp(16px,1.3vw,18px);line-height:1.5;color:rgba(242,241,237,0.86);max-width:46ch;text-wrap:pretty;">${b(p, "desc")}</p>
            <span aria-label="Time per task, example" style="flex:none;display:inline-flex;align-items:center;gap:8px;height:32px;padding:0 13px;border-radius:999px;border:1px solid rgba(242,241,237,0.2);background:rgba(242,241,237,0.05);${MONO}font-size:12.5px;"><span style="color:${MUTED};">${b(p, "from")}</span><svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:${MUTED};"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg><span style="font-weight:600;color:#F2F1ED;">${b(p, "to")}</span></span>
          </div>`;
}

// a status chip that swaps from "working" (blue, agent activity) to its final word
const chip = (p, at, word, col) =>
  `<span style="display:grid;justify-items:end;font-size:12.5px;"><span style="grid-area:1/1;display:flex;align-items:center;gap:7px;${b(p, "w" + at)}">${dot("#2E7BFF")}Working</span><span style="grid-area:1/1;display:flex;align-items:center;gap:7px;${b(p, "s" + at)}">${dot(col)}${word}</span></span>`;

// a WhatsApp message from stockbot, as it lands on your phone
const waNote = (p, at, text) =>
  `<div role="img" aria-label="WhatsApp message from Everstock: ${text}" style="display:grid;grid-template-columns:auto minmax(0,1fr);gap:4px 10px;padding:11px 13px;border-radius:12px;background:rgba(242,241,237,0.06);border:1px solid rgba(242,241,237,0.12);${b(p, "s" + at)}">${WHATSAPP(18)}<span style="display:flex;justify-content:space-between;gap:8px;font-size:12px;color:${MUTED};"><span><span style="font-weight:600;color:#F2F1ED;">Everstock</span> · WhatsApp</span><span style="${MONO}font-size:11px;">now</span></span><span></span><span style="font-size:12.5px;line-height:1.45;color:rgba(242,241,237,0.92);text-wrap:pretty;">${text}</span></div>`;

/* 01 · Matches invoices to POs */
function in0() {
  const R = "display:grid;grid-template-columns:minmax(0,1fr) 36px 72px;gap:10px;align-items:center;padding:7px 0;border-bottom:1px solid rgba(26,27,31,0.12);";
  const n = `${MONO}font-size:12px;`;
  const H = "font-size:10px;letter-spacing:0.1em;text-transform:uppercase;color:#6A665D;";
  return `<div role="img" aria-label="Email from Meridian Supply with invoice INV-4471 attached as a PDF" style="border-radius:8px;overflow:hidden;background:#2A2B30;border:1px solid rgba(242,241,237,0.12);box-shadow:0 26px 44px -24px rgba(0,0,0,0.8);transform:rotate(-1deg);">
                  <div style="display:flex;align-items:center;gap:8px;height:34px;padding:0 10px;border-bottom:1px solid rgba(242,241,237,0.08);font-size:12px;color:rgba(242,241,237,0.86);">${GMAIL(16)}<span style="font-weight:600;white-space:nowrap;">Meridian Supply</span><span style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:${MUTED};">Invoice INV-4471</span><span style="margin-left:auto;${MONO}font-size:11px;color:${MUTED};">06:41</span></div>
                  <div style="display:flex;justify-content:space-between;align-items:center;height:28px;padding:0 10px;${MONO}font-size:11px;color:rgba(242,241,237,0.72);"><span style="display:flex;align-items:center;gap:6px;"><span style="display:grid;place-items:center;height:14px;padding:0 3px;border-radius:2px;background:#EA4335;color:#FFFFFF;font-size:7.5px;font-weight:700;">PDF</span>INV-4471.pdf</span><span>1 / 1</span></div>
                  <div style="position:relative;overflow:hidden;margin:0 10px 10px;padding:14px 16px 12px;display:grid;gap:10px;background-color:#FBFAF6;background-image:var(--v3-paper);background-size:160px;color:#1A1B1F;border-radius:3px;${PAPER_SH}font-size:12px;">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;"><span style="display:grid;gap:2px;"><span style="font-weight:700;font-size:13px;">Meridian Supply Co.</span><span style="font-size:11px;color:#5A564E;">1200 W Fulton St, Chicago IL</span></span><span style="display:grid;gap:2px;justify-items:end;"><span style="font-weight:700;font-size:14px;letter-spacing:0.14em;">INVOICE</span><span style="${MONO}font-size:11px;color:#5A564E;">PO-2291</span></span></div>
                    <div><div style="${R}"><span style="font-family:'Space Grotesk',sans-serif;${H}">Item</span><span style="${H}">Qty</span><span style="${H}text-align:right;">Amount</span></div>
                    <div style="${R}"><span>Rotor 320mm</span><span style="${n}">12</span><span style="${n}text-align:right;">$456.00</span></div>
                    <div style="${R}"><span>Pad set, front</span><span style="${n}">24</span><span style="${n}text-align:right;">$588.00</span></div>
                    <div style="${R}"><span>Caliper bolt kit</span><span style="${n}">40</span><span style="${n}text-align:right;">$840.00</span></div>
                    <div style="${R}border-bottom:0;"><span style="font-weight:700;">Total due</span><span></span><span style="${n}text-align:right;font-weight:700;">$1,884.00</span></div></div>
                    <span aria-hidden="true" style="position:absolute;left:0;right:0;height:2px;background:#2E7BFF;box-shadow:0 0 10px 2px rgba(46,123,255,0.5);pointer-events:none;${b(0, "scan")}"></span>
                  </div>
                </div>`;
}
function out0() {
  const R = "display:grid;grid-template-columns:minmax(0,1fr) 40px 48px 40px;gap:10px;align-items:center;padding:10px 14px;border-top:1px solid rgba(242,241,237,0.08);";
  const n = `${MONO}font-size:12px;`;
  const v = (at, x, extra = "") => `<span style="${n}${extra}${b(0, at)}">${x}</span>`;
  return `<div style="display:grid;gap:10px;">
                <div role="table" aria-label="INV-4471 matched to PO-2291 and the receipt, held for 4 missing bolt kits" style="${CARD}overflow:hidden;">
                  <div style="${R}border-top:0;"><span style="${n}font-weight:600;">INV-4471</span><span style="${LAB}">PO</span><span style="${LAB}">Billed</span><span style="${LAB}">Got</span></div>
                  <div style="${R}"><span style="font-size:13px;">Rotor 320mm</span>${v("s3", "12")}${v("s3d1", "12")}${v("s4", "12")}</div>
                  <div style="${R}"><span style="font-size:13px;">Pad set, front</span>${v("s3", "24")}${v("s3d1", "24")}${v("s4d1", "24")}</div>
                  <div style="${R}${b(0, "flag4")}"><span style="display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;"><span aria-hidden="true" style="flex:none;width:7px;height:7px;border-radius:50%;background:#E8A13A;box-shadow:0 0 0 1px #E8A13A80,0 0 8px 1px #E8A13AB0;${b(0, "s4d2")}"></span>Caliper bolt kit</span>${v("s3", "40")}${v("s3d1", "40", "font-weight:600;")}${v("s4d2", "36", "font-weight:700;color:#E8A13A;")}</div>
                  <div style="display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:10px;align-items:center;padding:10px 14px;border-top:1px solid rgba(242,241,237,0.08);"><span style="font-size:12.5px;color:${MUTED};${b(0, "s5")}">Held for 4 kits never received</span><span data-keep="true" style="position:relative;flex:none;padding:3px 10px;border:3px solid #E8A13A;border-radius:4px;box-shadow:inset 0 0 0 2px #1D1E23,inset 0 0 0 3.5px #E8A13A;color:#E8A13A;font-family:'Geist Mono',monospace;font-weight:700;font-size:13px;letter-spacing:0.18em;text-transform:uppercase;-webkit-mask-image:var(--v3-stamp);mask-image:var(--v3-stamp);-webkit-mask-size:180px;mask-size:180px;${b(0, "stamp5")}">Hold</span><span style="${n}font-weight:600;${b(0, "s5")}">$84.00</span></div>
                  <div style="display:flex;align-items:center;gap:8px;padding:9px 14px;border-top:1px solid rgba(242,241,237,0.08);background:rgba(242,241,237,0.025);font-size:12px;color:${MUTED};">${QB(15)}<span>QuickBooks</span><span style="margin-left:auto;color:#F2F1ED;${b(0, "s5d1")}">Bill on hold</span></div>
                </div>
                ${waNote(0, "5d2", "INV-4471 bills 40 bolt kits and 36 arrived. I held $84.00 until Meridian sends the rest.")}
              </div>`;
}

/* 02 · Chases late suppliers */
function in1() {
  const msg = (av, avBg, name, org, time, body, st) =>
    `<div style="display:grid;gap:6px;padding:11px 14px;border-top:1px solid #ECEEF1;${st}"><div style="display:flex;align-items:center;gap:9px;"><span aria-hidden="true" style="flex:none;width:26px;height:26px;display:grid;place-items:center;border-radius:50%;background:${avBg};color:#FFFFFF;font-size:11px;font-weight:600;">${av}</span><span style="min-width:0;display:grid;"><span style="font-size:12.5px;font-weight:600;color:#202124;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${name} <span style="font-weight:400;color:#5F6368;">${org}</span></span></span><span style="margin-left:auto;font-size:11px;color:#5F6368;white-space:nowrap;">${time}</span></div><p style="margin:0;padding-left:35px;font-size:12.5px;line-height:1.45;color:#202124;text-wrap:pretty;">${body}</p></div>`;
  return `<div role="img" aria-label="Gmail thread with Northline Parts about the PO-2288 ship date" style="overflow:hidden;background:#FFFFFF;border-radius:8px;${PAPER_SH}font-family:system-ui,-apple-system,'Segoe UI',sans-serif;transform:rotate(-0.8deg);">
                  <div style="display:flex;align-items:center;gap:8px;padding:9px 14px;background:#F6F8FC;border-bottom:1px solid #ECEEF1;">${GMAIL(18)}<span style="font-size:13px;color:#444746;">Gmail</span><span style="margin-left:auto;display:flex;gap:6px;"><span style="padding:1px 6px;border-radius:4px;background:#E8F0FE;font-size:10.5px;color:#0B57D0;">Suppliers</span><span style="padding:1px 6px;border-radius:4px;background:#E9EAEC;font-size:10.5px;color:#5F6368;">Inbox</span></span></div>
                  <div style="display:flex;align-items:baseline;gap:8px;padding:10px 14px 9px;"><span style="font-size:14.5px;color:#202124;">PO-2288 ship date</span><span style="margin-left:auto;font-size:11px;color:#5F6368;white-space:nowrap;${b(1, "s3")}">2 messages</span></div>
                  ${msg("E", "#16171B", "Everstock", "for you", "Mon 07:02", "Hi Dana, PO-2288 was due to ship 10 Mar and hasn’t moved. Can you confirm a new ship date?", b(1, "s2"))}
                  ${msg("DR", "#5E7D57", "Dana Ruiz", "Northline Parts", "Mon 09:46", `Sorry for the delay. We can ship the 96 pad sets on <span style="border-radius:2px;transition:background-color 400ms ${E},box-shadow 400ms ${E};${b(1, "mk3")}">12 Mar, ETA 14 Mar</span>.`, b(1, "s3"))}
                </div>`;
}
function out1() {
  const val = (at, x, extra = "") => `<span style="${MONO}font-size:12.5px;${extra}${b(1, at)}">${x}</span>`;
  // a 2 to 24 Mar line: due 10 Mar (missed), ETA 14 Mar, shelf empty 23 Mar (9 days of cover)
  const pct = (d) => (((d - 2) / 22) * 100).toFixed(1) + "%";
  const tick = (d, c, at) => `<span aria-hidden="true" style="position:absolute;left:${pct(d)};top:15px;width:9px;height:9px;margin-left:-4.5px;border-radius:50%;background:#1D1E23;border:2px solid ${c};${b(1, at)}"></span>`;
  const tl = (d, txt, at, top, shift, extra = "") => `<span style="position:absolute;left:${pct(d)};top:${top}px;transform:translateX(${shift});white-space:nowrap;${MONO}font-size:10.5px;"><span style="display:block;${extra}${b(1, at)}">${txt}</span></span>`;
  return `<div role="group" aria-label="PO-2288 tracking: ETA moved from 10 Mar to 14 Mar, 9 days of cover left at arrival" style="${CARD}display:grid;padding:14px 16px 6px;">
                  <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;padding-bottom:6px;"><span style="${MONO}font-size:14px;font-weight:600;">PO-2288</span>${chip(1, 5, "Tracking", "#2E7BFF")}</div>
                  <div aria-hidden="true" style="position:relative;height:56px;margin:0 6px 4px;">
                    <span style="position:absolute;left:0;right:0;top:19px;height:1px;background:rgba(242,241,237,0.18);"></span>
                    <span style="position:absolute;left:${pct(14)};right:${(100 - parseFloat(pct(23))).toFixed(1)}%;top:18px;height:3px;border-radius:2px;background:rgba(47,203,143,0.55);${b(1, "s4")}"></span>
                    ${tick(2, "rgba(242,241,237,0.5)", "s0")}${tick(10, "#E07A2E", "s1")}${tick(14, "#2E7BFF", "s3")}${tick(23, "#2FCB8F", "s4")}
                    ${tl(2, "2 Mar", "s0", 0, "0", `color:${MUTED};`)}${tl(10, "due 10 Mar", "s1", 0, "-50%", "color:#E07A2E;")}
                    ${tl(14, "ETA 14 Mar", "s3", 34, "-50%", "color:#F2F1ED;font-weight:600;")}${tl(23, "out 23 Mar", "s4", 34, "-86%", `color:${MUTED};`)}
                  </div>
                  <div style="${ROW}"><span style="flex:none;white-space:nowrap;font-size:13px;color:${MUTED};">Supplier</span><span style="font-size:13px;">Northline Parts · 96 pad sets</span></div>
                  <div style="${ROW}"><span style="flex:none;white-space:nowrap;font-size:13px;color:${MUTED};">ETA</span><span style="display:flex;gap:8px;align-items:baseline;">${val("s1", "10 Mar", `text-decoration:line-through;color:${MUTED};font-size:12px;`)}${val("s3", "14 Mar", "font-size:13px;font-weight:600;")}</span></div>
                  <div style="${ROW}"><span style="flex:none;white-space:nowrap;font-size:13px;color:${MUTED};">Cover at ETA</span>${val("s4", "9 days left", "font-size:13px;")}</div>
                  <div style="${ROW}"><span style="flex:none;white-space:nowrap;font-size:13px;color:${MUTED};">Next check</span>${val("s5", "12 Mar · ship confirmation")}</div>
                </div>`;
}

/* 03 · Flags short shipments */
function in2() {
  const box = (i) =>
    i < 10
      ? `<span style="display:grid;place-items:center;height:28px;border:1.5px solid rgba(26,27,31,0.55);border-radius:2px;"><span style="display:block;${b(2, "ck" + i)}">${CHECK()}</span></span>`
      : `<span style="display:grid;place-items:center;height:28px;border-radius:2px;${MONO}font-size:10.5px;transition:border-color 300ms ${E},color 300ms ${E};${b(2, "miss")}">${i + 1}</span>`;
  // a Code 128-ish barcode: fixed bar widths so it renders the same everywhere
  const bars = [2, 1, 1, 3, 1, 2, 2, 1, 1, 1, 3, 2, 1, 2, 1, 1, 2, 3, 1, 1, 2, 1, 3, 1, 1, 2, 1, 2, 2, 1, 1, 3, 1, 1, 2];
  let x = 0;
  const rects = bars.map((w, i) => { const r = i % 2 ? "" : `<rect x="${x}" y="0" width="${w}" height="22"></rect>`; x += w + (i % 2 ? 0 : 0); return r; }).join("");
  const bw = bars.reduce((a, c) => a + c, 0);
  return `<div style="position:relative;display:grid;">
                <div role="img" aria-label="Packing slip SH-8812 for PO-2290: 12 cartons listed, 10 checked off as received" style="padding:14px 16px 14px;display:grid;gap:11px;background-color:#FBFAF6;background-image:var(--v3-paper);background-size:160px;color:#1A1B1F;border-radius:3px;${PAPER_SH}transform:rotate(1.2deg);font-size:12px;">
                  <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;padding-bottom:10px;border-bottom:1.5px solid #1A1B1F;"><span style="display:grid;gap:2px;"><span style="font-weight:700;font-size:14px;letter-spacing:0.14em;">PACKING SLIP</span><span style="font-size:11px;color:#5A564E;">Arcadia Electronics</span></span><span style="display:grid;gap:4px;justify-items:end;"><svg aria-hidden="true" width="${bw * 2}" height="22" viewBox="0 0 ${bw} 22" preserveAspectRatio="none" fill="#1A1B1F" style="display:block;">${rects}</svg><span style="${MONO}font-size:10.5px;color:#5A564E;">SH-8812 · PO-2290</span></span></div>
                  <div style="display:flex;justify-content:space-between;"><span>2,000 connectors</span><span style="${MONO}font-size:12px;">Cartons: 12</span></div>
                  <div style="display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:5px;">${Array.from({ length: 12 }, (_, i) => box(i)).join("")}</div>
                  <div style="display:flex;justify-content:flex-end;min-height:28px;"><span style="padding:2px 10px;border:1.5px solid #B4441C;border-radius:50%;color:#B4441C;font-family:'Segoe Print','Bradley Hand','Comic Neue',cursive;font-size:15px;${b(2, "stamp3")}">rec’d 10 of 12</span></div>
                </div>
                <div role="img" aria-label="Receiving scan at dock 2: 10 of 12 cartons scanned" style="justify-self:start;margin:-18px 0 0 12px;position:relative;display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:9px;background:#1D1E23;border:1px solid rgba(242,241,237,0.14);box-shadow:0 14px 28px -14px rgba(0,0,0,0.8);font-size:12px;color:#F2F1ED;transform:rotate(-1deg);">
                  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="color:${MUTED};"><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 8v8M11 8v8M15 8v8M18 8v8"></path></svg>
                  <span style="display:grid;gap:1px;"><span style="${LAB}font-size:9.5px;">Receiving · Dock 2</span><span style="${MONO}font-size:12px;"><span style="${b(2, "s2")}">10</span> / 12 scanned</span></span>
                  <span style="margin-left:4px;display:grid;">${"<span style=\"grid-area:1/1;" + b(2, "w2") + "\">" + dot("#2E7BFF") + "</span>"}<span style="grid-area:1/1;${b(2, "s3")}">${dot("#E8A13A")}</span></span>
                </div>
              </div>`;
}
function out2() {
  const val = (at, x, extra = "") => `<span style="${MONO}font-size:12.5px;${extra}${b(2, at)}">${x}</span>`;
  return `<div role="group" aria-label="Short shipment on PO-2290: 10 of 12 cartons received, credit CR-0112 for $96.40 requested" style="${CARD}display:grid;padding:14px 16px 6px;transition:box-shadow 400ms ${E};${b(2, "ring3")}">
                  <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;padding-bottom:10px;"><span style="${MONO}font-size:14px;font-weight:600;">PO-2290</span>${chip(2, 3, "Short shipment", "#E8A13A")}</div>
                  <div style="${ROW}"><span style="flex:none;white-space:nowrap;font-size:13px;color:${MUTED};">Received</span>${val("s2", "10 of 12 cartons", "font-size:13px;font-weight:600;")}</div>
                  <div style="${ROW}"><span style="flex:none;white-space:nowrap;font-size:13px;color:${MUTED};">Missing</span>${val("s3", "2 cartons · 2 × $48.20")}</div>
                  <div style="${ROW}"><span style="flex:none;white-space:nowrap;font-size:13px;color:${MUTED};">Credit requested</span>${val("s4", "$96.40 · CR-0112", "font-size:13px;font-weight:600;")}</div>
                  <div style="${ROW}"><span style="flex:none;white-space:nowrap;font-size:13px;color:${MUTED};">Sent to</span><span style="font-size:12.5px;${b(2, "s4d1")}">Arcadia Electronics</span></div>
                  <div style="${ROW}"><span style="flex:none;white-space:nowrap;font-size:13px;color:${MUTED};">Status</span><span style="display:flex;align-items:center;gap:7px;font-size:12.5px;${b(2, "s5")}">${dot("#2E7BFF")}Tracking until paid</span></div>
                </div>`;
}

/* 04 · Drafts the reorder */
function in3() {
  const er = (k, v, at) =>
    `<div style="display:flex;justify-content:space-between;gap:10px;padding:6px 12px;border-top:1px solid #E3E5E8;transition:background-color 400ms ${E},box-shadow 400ms ${E};${at ? b(3, "hl" + at) : ""}"><span style="color:#5B616E;">${k}</span><span style="${MONO}font-size:11.5px;color:#1F2329;">${v}</span></div>`;
  return `<div style="display:grid;">
                <div role="img" aria-label="Shopify inventory chart for Brake rotor 320mm falling toward the reorder point" style="position:relative;z-index:1;display:grid;gap:8px;padding:12px 14px 10px;background:#FFFFFF;border-radius:8px;${PAPER_SH}color:#303030;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;transform:rotate(-1deg);">
                  <div style="display:flex;align-items:center;gap:7px;">${SHOPIFY(15)}<span style="font-size:12px;font-weight:600;color:#303030;">Shopify</span><span style="font-size:12px;color:#616161;">Inventory</span><span style="margin-left:auto;font-size:11px;color:#616161;">Last 30 days</span></div>
                  <div style="display:flex;align-items:baseline;gap:8px;"><span style="font-size:13px;font-weight:600;">Brake rotor 320mm</span><span style="margin-left:auto;font-size:20px;font-weight:600;${MONO}">62</span><span style="font-size:11.5px;color:#8E1F0B;font-weight:500;">−71%</span></div>
                  <svg viewBox="0 0 280 84" style="display:block;width:100%;height:auto;" aria-hidden="true"><path d="M0 14H280M0 42H280M0 70H280" stroke="#EBEBEB" stroke-width="1"></path><path d="M0 57H280" stroke="#C4320A" stroke-width="1.2" stroke-dasharray="4 4"></path><text x="276" y="52" text-anchor="end" font-size="9" fill="#C4320A" font-family="system-ui,sans-serif">Reorder point</text><path d="M0 17 L28 18 L56 23 L84 22 L112 29 L140 34 L168 40 L196 47 L224 54 L252 61 L280 67 L280 84 L0 84 Z" fill="rgba(0,91,211,0.08)" style="${b(3, "area")}"></path><polyline pathLength="1" points="0,17 28,18 56,23 84,22 112,29 140,34 168,40 196,47 224,54 252,61 280,67" fill="none" stroke="#005BD3" stroke-width="2" stroke-linejoin="round" stroke-dasharray="1.05 1.05" style="${b(3, "draw")}"></polyline><circle cx="280" cy="67" r="3.5" fill="#005BD3" stroke="#FFFFFF" stroke-width="1.5" style="${b(3, "s1d3")}"></circle></svg>
                  <div style="display:flex;justify-content:space-between;font-size:10.5px;color:#8A8A8A;${MONO}"><span>1 Mar</span><span>15 Mar</span><span>30 Mar</span></div>
                </div>
                <div role="img" aria-label="Item record for 320-ROT: preferred vendor Meridian Supply, lead time 9 days, last cost $40.40" style="margin:-10px 0 0 18px;display:grid;background:#F7F8FA;border-radius:6px;${PAPER_SH}color:#1F2329;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;font-size:12px;transform:rotate(0.8deg);overflow:hidden;">
                  <div style="display:flex;align-items:center;gap:8px;padding:16px 12px 7px;background:#E9ECF0;"><span style="padding:1px 5px;border-radius:3px;background:#2B3442;color:#FFFFFF;font-size:9.5px;font-weight:700;letter-spacing:0.06em;">ERP</span><span style="font-weight:600;">Item 320-ROT</span><span style="margin-left:auto;font-size:11px;color:#5B616E;">Purchasing</span></div>
                  ${er("Preferred vendor", "Meridian Supply", 3)}${er("Lead time", "9 days", 2)}${er("Last cost", "$40.40", 0)}${er("On order", "0", 0)}
                </div>
              </div>`;
}
function out3() {
  const val = (at, x, extra = "") => `<span style="${MONO}font-size:12.5px;${extra}${b(3, at)}">${x}</span>`;
  return `<div style="display:grid;gap:10px;">
                <div role="group" aria-label="Draft PO-2291 for Meridian Supply: 480 Rotor 320mm at $40.40, $19,392.00, waiting on your approval" style="${CARD}display:grid;padding:14px 16px 6px;">
                  <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;padding-bottom:10px;"><span style="display:flex;align-items:baseline;gap:8px;"><span style="${MONO}font-size:14px;font-weight:600;">PO-2291</span><span style="${LAB}font-size:9.5px;">Draft</span></span>${chip(3, 5, "Waiting on you", "#E8A13A")}</div>
                  <div style="${ROW}"><span style="flex:none;white-space:nowrap;font-size:13px;color:${MUTED};">Why now</span>${val("s2", "11 days left · 9 day lead", "font-size:12px;")}</div>
                  <div style="${ROW}"><span style="flex:none;white-space:nowrap;font-size:13px;color:${MUTED};">Supplier</span><span style="font-size:13px;${b(3, "s3")}">Meridian Supply</span></div>
                  <div style="${ROW}"><span style="flex:none;white-space:nowrap;font-size:13px;color:${MUTED};">Line</span>${val("s4", "480 × Rotor 320mm @ $40.40")}</div>
                  <div style="${ROW}"><span style="flex:none;white-space:nowrap;font-size:13px;color:${MUTED};">Total</span>${val("s4d1", "$19,392.00", "font-size:15px;font-weight:600;")}</div>
                </div>
                ${waNote(3, "5d1", "PO-2291 is ready: 480 rotors from Meridian, $19,392.00. Reply APPROVE or HOLD.")}
              </div>`;
}

const INS = [in0, in1, in2, in3];
const OUTS = [out0, out1, out2, out3];

function pane(p) {
  return `<div class="wfx-pane" aria-hidden="${b(p, "hid")}" style="${b(p, "pane")}">
          ${head(p)}
          ${rail(p)}
          <div class="wfx-io">
            <div class="wfx-col">${label("What came in")}
              ${INS[p]()}
            </div>
            <div class="wfx-col">${label("What Everstock produced")}
              ${OUTS[p]()}
            </div>
          </div>
          <p style="margin:0;padding-top:18px;border-top:1px dashed rgba(242,241,237,0.16);font-size:15.5px;line-height:1.5;color:rgba(242,241,237,0.86);text-wrap:pretty;"><span style="font-weight:600;color:#E07A2E;">Without it:</span> ${b(p, "stake")}</p>
        </div>`;
}

const SECTION_BODY = `
    <style>${CSS}</style>
    <div class="wfx">
      <h2 class="wfx-h" style="font-family:'General Sans','Space Grotesk',sans-serif;letter-spacing:-0.022em;margin:0;max-width:18ch;font-weight:600;line-height:1.05;color:rgb(var(--ink));text-wrap:balance;">The supply work that runs itself.</h2>
      <div role="tablist" aria-label="Workflows" aria-orientation="vertical" class="wfx-t">
          <sc-for list="{{ wfTabs }}" as="tab" hint-placeholder-count="4">
            <button type="button" role="tab" class="wfx-tab" aria-selected="{{ tab.sel }}" aria-controls="wf-panel" onClick="{{ tab.pick }}" style="position:relative;overflow:hidden;display:grid;grid-template-columns:28px minmax(0,1fr);align-items:baseline;gap:12px;min-height:64px;padding:16px 18px;text-align:left;border-radius:10px;border:1px solid {{ tab.bd }};background:{{ tab.bg }};color:{{ tab.col }};cursor:pointer;font:inherit;transition:background-color 260ms ${E},border-color 260ms ${E},color 260ms ${E};" style-hover="color:rgb(var(--ink));"><span style="font-family:'Geist Mono',ui-monospace,monospace;font-variant-numeric:tabular-nums lining-nums;font-size:12px;color:{{ tab.numCol }};">{{ tab.n }}</span><span class="wfx-tl" style="font-family:'General Sans','Space Grotesk',sans-serif;font-weight:600;font-size:clamp(19px,1.6vw,22px);line-height:1.2;letter-spacing:-0.022em;">{{ tab.label }}</span><span aria-hidden="true" style="position:absolute;left:18px;right:18px;bottom:0;height:2px;border-radius:1px;background:rgb(var(--ink) / 0.32);transform-origin:0 50%;{{ tab.bar }}"></span></button>
          </sc-for>
      </div>
      <div id="wf-panel" role="tabpanel" aria-live="polite" class="wfx-p" style="position:relative;padding:clamp(20px,2.2vw,30px);border-radius:12px;background-color:#111215;background-image:radial-gradient(rgba(242,241,237,0.13) 1px,transparent 1.3px);background-size:16px 16px;border:1px solid rgba(242,241,237,0.10);box-shadow:inset 0 1px 0 rgba(255,255,255,0.05),0 1px 2px rgba(0,0,0,0.4),0 36px 64px -36px rgba(0,0,0,0.75);color:#F2F1ED;">
        <div class="wfx-stack">
        ${[0, 1, 2, 3].map(pane).join("\n        ")}
        </div>
      </div>
    </div>
`;

/* ---------- logic: per-pane values ---------- */
const WF_PANES = `wfPanes(red, W, wf, ws, ST) {
    const E = '${E}', o = {};
    W.forEach((w, p) => {
      const act = p === wf, n = w.steps.length, k = red ? 99 : act ? ws : 0, on = (at) => red || k >= at;
      const T = (s) => (red || !act ? 'none' : s);
      // a value that lands when step 'at' starts (fades up into place), d = small stagger
      const land = (at, d) => on(at) ? 'opacity:1;transform:none;transition:' + T('opacity 420ms ' + E + ' ' + d + 'ms,transform 520ms ' + E + ' ' + d + 'ms') : 'opacity:0;transform:translateY(6px);transition:none';
      const v = {
        pane: act ? 'visibility:visible;opacity:1;transition:' + T('opacity 320ms ' + E) : 'visibility:hidden;opacity:0;transition:none',
        hid: act ? 'false' : 'true', desc: w.desc, stake: w.stake,
        from: ['25 min', '45 min', '30 min', '1 hr'][p], to: ['40 sec', '2 min', '1 min', '3 min'][p]
      };
      for (let at = 0; at <= 6; at++) {
        for (let d = 0; d < 4; d++) v['s' + at + (d ? 'd' + d : '')] = land(at, d * 120);
        // the "Working" chip that a final word replaces
        v['w' + at] = on(at) ? 'opacity:0;transition:' + T('opacity 240ms ' + E) : 'opacity:1;transition:none';
        // the agent reading a field (blue), only while that step runs
        v['hl' + at] = !red && act && k === at && at > 0 ? 'background-color:rgba(46,123,255,0.12);box-shadow:inset 2px 0 0 #2E7BFF' : 'background-color:transparent;box-shadow:inset 0 0 0 transparent';
      }
      v.mk3 = on(3) ? 'background-color:rgba(46,123,255,0.16);box-shadow:0 1.5px 0 #2E7BFF' : 'background-color:transparent;box-shadow:0 0 0 transparent';
      for (let i = 0; i < 12; i++) v['ck' + i] = on(2) ? 'opacity:1;transform:none;transition:' + T('opacity 200ms ' + E + ' ' + (i * 70) + 'ms,transform 260ms ' + E + ' ' + (i * 70) + 'ms') : 'opacity:0;transform:scale(0.5);transition:none';
      v.miss = on(3) ? 'border:1.5px dashed #B4441C;color:#B4441C' : 'border:1.5px dashed rgba(26,27,31,0.35);color:rgba(26,27,31,0.45)';
      const stamp = (at, rot) => on(at) ? 'opacity:0.92;transform:rotate(' + rot + 'deg) scale(1);transition:' + T('opacity 160ms ease-out,transform 260ms cubic-bezier(.3,1.4,.5,1)') : 'opacity:0;transform:rotate(' + rot + 'deg) scale(1.4);transition:none';
      v.stamp5 = stamp(5, -6); v.stamp3 = stamp(3, -4);
      v.flag4 = on(4) ? 'background:rgba(232,161,58,0.09);box-shadow:inset 0 0 0 1px rgba(232,161,58,0.45);transition:' + T('background-color 400ms ' + E + ',box-shadow 400ms ' + E) : 'background:transparent;box-shadow:inset 0 0 0 1px transparent;transition:none';
      v.ring3 = on(3) ? 'box-shadow:inset 0 0 0 1px rgba(232,161,58,0.4),0 26px 44px -24px rgba(0,0,0,0.8)' : 'box-shadow:inset 0 1px 0 rgba(255,255,255,0.06),0 26px 44px -24px rgba(0,0,0,0.8)';
      // the read pass over the invoice while "Reads the line items" runs
      v.scan = !red && act && k === 2 ? 'top:100%;opacity:1;transition:top 950ms linear,opacity 160ms' : 'top:' + (on(3) ? '100%' : '0%') + ';opacity:0;transition:' + (on(3) ? T('opacity 240ms') : 'none');
      v.draw = on(1) ? 'stroke-dashoffset:0;transition:' + T('stroke-dashoffset 1100ms ' + E) : 'stroke-dashoffset:1.05;transition:none';
      v.area = on(1) ? 'opacity:1;transition:' + T('opacity 700ms ' + E + ' 400ms') : 'opacity:0;transition:none';
      // the rail fills dot to dot, blue while it runs, green once every step is done
      const pr = red || k > n ? 1 : Math.max(0, Math.min(1, (k - 1) / (n - 1))), done = red || k > n;
      const fill = (ax) => 'transform:scale' + ax + '(' + pr + ');background:' + (done ? 'rgba(47,203,143,0.8)' : '#2E7BFF') + ';transition:' + T('transform 900ms ' + E + ',background-color 400ms ' + E);
      v.fillH = fill('X'); v.fillV = fill('Y');
      v.steps = w.steps.map((s, i) => {
        let st = i < k - 1 || k > n ? 'done' : i === k - 1 ? 'active' : 'pending';
        if (st === 'done' && s.flag) st = 'attn';
        return { ...s, ...ST[st], dCol: st === 'active' ? '#8DB6FF' : 'rgba(242,241,237,0.64)' };
      });
      o['wp' + p] = v;
    });
    return o;
  }
  v7Start() {`;

export const logicPatches = [
  {
    why: "Workflows: per-pane values (landing values, stamps, the rail fill, the read highlights) so all four tab panes can be rendered at once and the panel keeps the tallest pane's size",
    find: "  v7Start() {",
    replace: "  " + WF_PANES,
  },
  {
    why: "Workflows: v7Vals hands the per-pane values to the template",
    find: "    return { ...trs, wfI0: wf === 0,",
    replace: "    const wpx = this.wfPanes(red, W, wf, ws, ST);\n    return { ...trs, ...wpx, wfI0: wf === 0,",
  },
  {
    why: "Workflows: the active tab carries a thin bar that fills while it plays, so it reads as auto-advancing (hidden once you pick a tab, and with reduced motion)",
    find: "numCol: a ? 'rgb(var(--ink) / 0.72)' : 'rgb(var(--ink) / 0.40)', pick:",
    replace:
      "numCol: a ? 'rgb(var(--ink) / 0.72)' : 'rgb(var(--ink) / 0.40)', bar: a && this.v7auto && !red ? 'opacity:1;transform:scaleX(' + Math.min(1, ws / (n + 3)) + ');transition:' + (ws ? 'transform 1000ms linear' : 'none') : 'opacity:0;transform:scaleX(0);transition:none', pick:",
  },
];

export const templatePatches = [
  {
    why: "Workflows (Luca 2026-10-30): the section keeps one size on every tab (all four panes share one grid cell, the tallest sets it), the panel sits next to the headline on wide screens, and the panes get real-looking inputs (Gmail, Shopify, an ERP item record, a receiving scan), QuickBooks and WhatsApp marks, a filling progress rail and produced cards that fill in step by step",
    find: /(?<=<section id="workflows"[^>]*>)\n[\s\S]*?(?=\n  <\/section>)/,
    replace: () => SECTION_BODY,
  },
];
