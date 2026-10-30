// v9 site patches for one area of the home page (2026-10-30). Same rules as the patches in
// scripts/port-dc.mjs: each anchor must match its count exactly against the design text as
// the earlier patches left it, or the port fails.
//
// Area: #capabilities ("Everstock learns your operation. Then it buys the way you would.").
// Luca, 2026-10-30: planes in the open band around the headline (both directions, semi-erratic,
// straight / drift / roll / loop), the existing planes slower, and denser cards (more POs and a
// "why now" strip, more approvals, an Outlook thread caught on the invoice, a list of rules).
// Carry these into the design, then delete the patches.

/* ---------- shared bits of markup (the cards' own visual language) ---------- */
const MONO = "font-family:'Geist Mono',ui-monospace,monospace;font-variant-numeric:tabular-nums lining-nums;";
const PAPER = "background:#FFFDF9;border:1px solid rgb(22 23 27 / 0.12);border-radius:10px;box-shadow:0 1px 2px rgba(22,23,27,0.08),0 18px 36px -20px rgba(22,23,27,0.32);";
const LABEL = "font-size:10px;font-weight:500;letter-spacing:0.1em;text-transform:uppercase;color:#6A665D;";
const DOT_G = '<span aria-hidden="true" style="flex:none;width:7px;height:7px;border-radius:50%;background:#08745A;box-shadow:0 0 0 1.5px rgba(8,116,90,0.22),0 1px 1.5px rgba(0,0,0,0.3);"></span>';
const DOT_A = '<span aria-hidden="true" style="flex:none;width:7px;height:7px;border-radius:50%;background:#A35A00;box-shadow:0 0 0 1.5px #FFFFFF,0 0 0 2.5px rgba(163,90,0,0.3);"></span>';
const ARROW_DOWN = '<span style="display:grid;justify-items:center;"><span style="width:0;height:30px;border-left:1.5px dashed rgba(22,23,27,0.38);"></span><svg width="10" height="7" viewBox="0 0 10 7" fill="none" stroke="rgba(22,23,27,0.5)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m1 1 4 4 4-4"></path></svg></span>';
// Microsoft Outlook mark (Simple Icons path), in Outlook blue
const OUTLOOK = '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="#0078D4" style="display:block;flex:none;"><path d="M7.88 12.04q0 .45-.11.87-.1.41-.33.74-.22.33-.58.52-.37.2-.87.2t-.85-.2q-.35-.21-.57-.55-.22-.33-.33-.75-.1-.42-.1-.86t.1-.87q.1-.43.34-.76.22-.34.59-.54.36-.2.87-.2t.86.2q.35.21.57.55.22.34.31.77.1.43.1.88zM24 12v9.38q0 .46-.33.8-.33.32-.8.32H7.13q-.46 0-.8-.33-.32-.33-.32-.8V18H1q-.41 0-.7-.3-.3-.29-.3-.7V7q0-.41.3-.7Q.58 6 1 6h6.5V2.55q0-.44.3-.75.3-.3.75-.3h12.9q.44 0 .75.3.3.3.3.75V10.85l1.24.72h.01q.1.07.18.18.07.12.07.25zm-6-8.25v3h3v-3zm0 4.5v3h3v-3zm0 4.5v1.83l3.05-1.83zm-5.25-9v3h3.75v-3zm0 4.5v3h3.75v-3zm0 4.5v2.03l2.41 1.5 1.34-.8v-2.73zM9 3.75V6h2l.13.01.12.04v-2.3zM5.98 15.98q.9 0 1.6-.3.7-.32 1.19-.86.48-.55.73-1.28.25-.74.25-1.61 0-.83-.25-1.55-.24-.71-.71-1.24t-1.15-.83q-.68-.3-1.55-.3-.92 0-1.64.3-.71.3-1.2.85-.5.54-.75 1.3-.25.74-.25 1.63 0 .85.26 1.56.26.72.74 1.23.48.52 1.17.81.69.3 1.56.3zM7.5 21h12.39L12 16.08V17q0 .41-.3.7-.29.3-.7.3H7.5zm15-.13v-7.24l-5.9 3.54Z"></path></svg>';

/* ---------- PO card: "why now" sparkline (on hand for Rotor 320mm, 4 weeks + the next 12 days) ---------- */
const sparkSvg = (vbW, step, today) => {
  const X = (d) => +(14 + (d + 28) * step).toFixed(1); // day -28 .. +12
  const Y = (v) => +(12 + (1 - v / 760) * 66).toFixed(1); // 0 .. 760 units
  const hist = [[-28, 737], [-21, 611], [-14, 462], [-7, 345], [0, 205]];
  const line = hist.map(([d, v], i) => (i ? "L" : "M") + X(d) + " " + Y(v)).join(" ");
  const area = line + ` L${X(0)} ${Y(0)} L${X(-28)} ${Y(0)} Z`;
  const rp = Y(240), base = Y(0), dx = X(-2), dy = Y(240), land = X(9), empty = X(11);
  return `<svg aria-hidden="true" viewBox="0 0 ${vbW} 96" width="100%" style="display:block;overflow:visible;">
    <path d="M14 ${base}H${X(12)}" stroke="rgba(22,23,27,0.22)" stroke-width="1"></path>
    <path d="M14 ${rp}H${X(12)}" stroke="#A35A00" stroke-width="1" stroke-dasharray="3 3" opacity="0.7"></path>
    <text x="16" y="${rp - 4}" font-size="8.5" fill="#A35A00" font-family="Geist Mono, ui-monospace, monospace">REORDER POINT 240</text>
    <path d="${area}" fill="rgba(22,23,27,0.05)"></path>
    <path d="${line}" fill="none" stroke="#16171B" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"></path>
    <path d="M${X(0)} ${Y(205)}L${empty} ${base}" fill="none" stroke="rgba(22,23,27,0.45)" stroke-width="1.3" stroke-dasharray="2 3"></path>
    <path d="M${land} ${base + 3}V${Y(240) - 16}" stroke="#08745A" stroke-width="1.3"></path>
    <text x="${land - 3}" y="${Y(240) - 19}" font-size="8.5" fill="#08745A" text-anchor="end" font-family="Geist Mono, ui-monospace, monospace">PO LANDS · DAY 9</text>
    <text x="${empty + 2}" y="${base + 12}" font-size="8.5" fill="#5A564E" text-anchor="end" font-family="Geist Mono, ui-monospace, monospace">EMPTY · DAY 11</text>
    ${today ? `<text x="${X(0)}" y="${base + 12}" font-size="8.5" fill="#5A564E" text-anchor="middle" font-family="Geist Mono, ui-monospace, monospace">TODAY</text>` : ""}
    <circle cx="${dx}" cy="${dy}" r="3.6" fill="#0B5FFF" stroke="#FFFFFF" stroke-width="1.5"></circle>
    <circle cx="${X(0)}" cy="${Y(205)}" r="2.6" fill="#16171B"></circle>
  </svg>`;
};
// three drawings so the labels stay readable: each card width gets an axis length that keeps the labels near 9px
const spark = `<sc-if value="{{ capSpS }}" hint-placeholder-val="{{ false }}">${sparkSvg(286, 6.6, false)}</sc-if><sc-if value="{{ capSpM }}" hint-placeholder-val="{{ true }}">${sparkSvg(400, 9.5, true)}</sc-if><sc-if value="{{ capSpL }}" hint-placeholder-val="{{ false }}">${sparkSvg(560, 13.3, true)}</sc-if>`;

const stat = (k, v) => `<div style="display:grid;gap:3px;min-width:0;"><dt style="${LABEL}">${k}</dt><dd style="margin:0;${MONO}font-size:15px;font-weight:500;color:#16171B;white-space:nowrap;">${v}</dd></div>`;

const poCard = (shopify) => `<article data-cap="po" style="flex:3 1 460px;min-width:0;position:relative;overflow:hidden;display:flex;flex-direction:column;gap:16px;padding-bottom:clamp(22px,2.6vw,32px);border-radius:12px;border:1px solid rgb(22 23 27 / 0.10);background-color:#FDFBF7;background-image:radial-gradient(rgb(22 23 27 / 0.16) 1px,transparent 1.3px);background-size:16px 16px;box-shadow:inset 0 1px 0 rgba(255,255,255,0.9),0 1px 2px rgba(22,23,27,0.06),0 28px 56px -36px rgba(22,23,27,0.28);color:#16171B;">
            <h3 style="position:relative;z-index:3;margin:0;padding:clamp(22px,2.6vw,32px) clamp(22px,2.6vw,32px) 0;max-width:24ch;font-family:'General Sans','Space Grotesk',sans-serif;font-weight:600;font-size:clamp(21px,1.9vw,27px);line-height:1.15;letter-spacing:-0.022em;color:#16171B;text-wrap:balance;">Purchase orders <span style="color:#6A665D;">drafted before the shelf empties.</span></h3>
            <div style="position:relative;z-index:1;display:grid;grid-template-columns:minmax(0,1fr);justify-items:start;padding:clamp(4px,1vw,12px) 0 0 clamp(22px,2.6vw,32px);">
              <div aria-hidden="true" style="position:relative;z-index:2;display:flex;align-items:center;gap:11px;margin:0 0 -14px calc(clamp(10px,1.4vw,16px) - clamp(22px,2.6vw,32px));padding:10px 14px 10px 12px;${PAPER}border-radius:9px;">
                <span style="flex:none;width:30px;height:30px;display:grid;place-items:center;border-radius:7px;background:#16171B;color:#FAF7F1;">${shopify}</span>
                <span style="display:grid;gap:2px;"><span style="font-size:13px;font-weight:600;">Low stock · Brake rotor 320mm</span><span style="${MONO}font-size:11.5px;color:#5A564E;">11 days of cover · lead time 9 days</span></span>
              </div>
              <div role="table" aria-label="Purchase orders" style="position:relative;justify-self:stretch;margin-right:{{ capPoMr }};min-width:{{ capPoMin }};${PAPER}overflow:hidden;">
                <div role="row" style="display:grid;grid-template-columns:{{ capPoCols }};gap:{{ capPoGap }};align-items:center;padding:24px 16px 11px;border-bottom:1px solid rgb(22 23 27 / 0.08);"><span role="columnheader" style="${LABEL}">PO</span><span role="columnheader" style="${LABEL}">Supplier</span><span role="columnheader" style="${LABEL}">Qty</span><span role="columnheader" style="${LABEL}">Total</span><span role="columnheader" style="${LABEL}">Status</span></div>
                <sc-for list="{{ capPoRows }}" as="r" hint-placeholder-count="4">
                  <div role="row" style="display:grid;grid-template-columns:{{ capPoCols }};gap:{{ capPoGap }};align-items:center;padding:12px 16px;border-bottom:{{ r.bb }};background:{{ r.bg }};"><span style="${MONO}font-size:13px;color:#16171B;white-space:nowrap;font-weight:600;">{{ r.po }}</span><span style="font-size:13.5px;">{{ r.sup }}</span><span style="${MONO}font-size:13px;color:#16171B;white-space:nowrap;">{{ r.qty }}</span><span style="${MONO}font-size:13px;color:#16171B;white-space:nowrap;">{{ r.tot }}</span><span style="display:flex;align-items:center;gap:7px;font-size:13px;white-space:nowrap;"><span aria-hidden="true" style="flex:none;width:7px;height:7px;border-radius:50%;background:{{ r.dot }};box-shadow:{{ r.dsh }};"></span>{{ r.st }}</span></div>
                </sc-for>
              </div>
            </div>
            <div role="group" aria-label="Why PO-2291 was drafted now: 205 rotors on hand, 19 sold a day, 11 days of cover, 9 days of lead time, so the order lands before the shelf empties" style="position:relative;z-index:1;margin:0 clamp(22px,2.6vw,32px);display:grid;gap:12px;padding:14px 16px;${PAPER}">
              <div style="min-width:0;display:grid;gap:8px;">
                <span style="display:flex;justify-content:space-between;align-items:baseline;gap:10px;"><span style="${LABEL}color:#16171B;">Why PO-2291 now</span><span style="${MONO}font-size:11px;color:#5A564E;white-space:nowrap;">Rotor 320mm · on hand</span></span>
                ${spark}
              </div>
              <dl style="margin:0;padding-top:12px;border-top:1px solid rgb(22 23 27 / 0.08);display:grid;grid-template-columns:repeat(auto-fit,minmax(88px,1fr));gap:12px 16px;">
                ${stat("On hand", "205")}${stat("Sells a day", "19")}${stat("Days of cover", "11")}${stat("Lead time", "9 days")}
              </dl>
            </div>
          </article>`;

/* ---------- Approvals card: more replies beside the phone ---------- */
const miniChip = (po, dot, st, col, body, rot, ml) => `<div role="listitem" style="width:176px;box-sizing:border-box;display:grid;gap:4px;margin-left:${ml};padding:10px 12px;${PAPER}transform:rotate(${rot});">
                  <span style="display:flex;justify-content:space-between;gap:8px;${MONO}font-size:11.5px;font-weight:600;">${po}<span style="display:flex;align-items:center;gap:6px;font-family:'Space Grotesk',sans-serif;font-weight:500;color:${col};">${dot}${st}</span></span>
                  ${body}
                </div>`;
const apChips = `<div role="list" aria-label="Recent replies" style="position:absolute;z-index:3;left:{{ capApL }};bottom:clamp(110px,11vw,150px);display:flex;flex-direction:column;align-items:flex-start;gap:12px;">
              <sc-if value="{{ capApMore }}" hint-placeholder-val="{{ true }}">
                ${miniChip("PO-2286", DOT_A, "Held", "#A35A00", '<span style="font-size:12px;line-height:1.35;color:#5A564E;">Fuse price up 9%. You replied “Hold”.</span>', "1.2deg", "8px")}
                ${miniChip("PO-2289", DOT_G, "Swapped", "#08745A", '<span style="font-size:12px;line-height:1.35;color:#5A564E;">Bearings moved to Halden. Ships in 3 days, not 12.</span>', "-1deg", "0px")}
                ${miniChip("PO-2290", DOT_G, "Approved", "#08745A", `<span style="font-size:12px;line-height:1.35;color:#5A564E;">Arcadia’s new connector price</span><span style="${MONO}font-size:11.5px;color:#16171B;">$0.55 → $0.57 a unit</span>`, "1.6deg", "12px")}
              </sc-if>
              <div role="listitem" style="width:{{ capApW }};box-sizing:border-box;display:grid;gap:5px;padding:12px 14px;${PAPER}transform:rotate(-2deg);">
                <span style="display:flex;justify-content:space-between;gap:8px;${MONO}font-size:12px;font-weight:600;">PO-2291<span style="display:flex;align-items:center;gap:6px;font-family:'Space Grotesk',sans-serif;font-weight:500;color:#08745A;">${DOT_G}Sent</span></span>
                <span style="font-size:12.5px;color:#5A564E;">Meridian Supply · 480 rotors</span>
                <span style="${MONO}font-size:15px;font-weight:500;">$19,392.00</span>
              </div>
            </div>`;

/* ---------- Invoice card: an Outlook thread whose price change is caught on the rotor line ---------- */
const outlookCard = `<div role="img" aria-label="Outlook thread from Dana Ruiz at Meridian Supply: from 1 March, Rotor 320mm is $41.90 a unit" style="position:relative;z-index:2;width:{{ capOlW }};margin-left:{{ capOlMl }};box-sizing:border-box;min-width:0;overflow:hidden;background:#FFFFFF;border:1px solid rgb(22 23 27 / 0.12);border-radius:10px;box-shadow:0 1px 2px rgba(22,23,27,0.08),0 18px 36px -20px rgba(22,23,27,0.32);font-family:'Segoe UI',system-ui,-apple-system,sans-serif;color:#242424;">
                <div style="display:flex;align-items:center;gap:8px;padding:9px 12px;">${OUTLOOK}<span style="font-size:15px;color:#424242;letter-spacing:-0.01em;">Outlook</span><span style="margin-left:auto;font-size:11.5px;font-weight:600;">Inbox</span></div>
                <div style="padding:8px 12px;border-top:1px solid #EDEBE9;font-size:12.5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">Price update: Rotor 320mm</div>
                <div style="display:flex;align-items:center;gap:8px;padding:6px 12px;border-top:1px solid #EDEBE9;font-size:11.5px;color:#616161;white-space:nowrap;overflow:hidden;"><span aria-hidden="true" style="flex:none;width:20px;height:20px;display:grid;place-items:center;border-radius:50%;background:#E1DFDD;color:#424242;font-size:8.5px;font-weight:600;">YOU</span><span style="overflow:hidden;text-overflow:ellipsis;">Can you confirm March pricing?</span></div>
                <div style="display:grid;grid-template-columns:30px minmax(0,1fr);gap:4px 9px;padding:9px 12px 12px;border-top:1px solid #EDEBE9;box-shadow:inset 3px 0 0 #0F6CBD;background:#F5F9FD;">
                  <span aria-hidden="true" style="grid-row:span 2;width:30px;height:30px;display:grid;place-items:center;border-radius:50%;background:#8764B8;color:#FFFFFF;font-size:11.5px;font-weight:600;letter-spacing:0.02em;">DR</span>
                  <span style="display:flex;align-items:baseline;gap:6px;min-width:0;white-space:nowrap;"><span style="font-size:12.5px;font-weight:600;">Dana Ruiz</span><span style="font-size:11px;color:#616161;overflow:hidden;text-overflow:ellipsis;">Meridian Supply · 2 Mar</span></span>
                  <span style="font-size:12.5px;line-height:1.4;text-wrap:pretty;">From 1 March, Rotor 320mm is <span style="font-weight:600;">$41.90</span> a unit. Other lines stay the same.</span>
                </div>
              </div>`;

const invArrows = `<div aria-hidden="true" style="display:grid;grid-template-columns:{{ capInvCols }};gap:14px;height:40px;padding-right:{{ capInvPr }};">
                <div style="display:flex;align-items:center;min-width:0;padding-left:{{ capArPl }};">${ARROW_DOWN}<span data-keep="true" style="margin-left:auto;margin-right:{{ capStampMr }};position:relative;z-index:3;padding:5px 13px;border:3px solid #A35A00;border-radius:4px;box-shadow:inset 0 0 0 2px #FFFDF9,inset 0 0 0 3.5px #A35A00;background:rgba(255,253,249,0.86);color:#A35A00;font-family:'Geist Mono',monospace;font-weight:700;font-size:18px;letter-spacing:0.18em;text-transform:uppercase;transform:translateY(-4px) rotate(-8deg);-webkit-mask-image:var(--v3-stamp);mask-image:var(--v3-stamp);-webkit-mask-size:180px;mask-size:180px;">Hold</span></div>
                <sc-if value="{{ capInvWide }}" hint-placeholder-val="{{ true }}"><div style="display:grid;justify-items:center;align-items:center;">${ARROW_DOWN}</div></sc-if>
              </div>`;

const NUM = `${MONO}font-size:13px;color:#16171B;white-space:nowrap;`;
const rotorRow = `<div role="row" style="display:grid;grid-template-columns:minmax(0,1fr) 64px 64px 64px 72px;gap:12px;align-items:center;padding:11px 16px;border-bottom:1px solid rgb(22 23 27 / 0.08);background:rgba(163,90,0,0.045);"><span style="display:grid;gap:2px;min-width:0;"><span style="font-size:13.5px;font-weight:600;">Rotor 320mm</span><span style="${MONO}font-size:11px;color:#5A564E;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">Billed $41.90 · PO $40.40</span></span><span style="${NUM}">12</span><span style="${NUM}">12</span><span style="${NUM}">12</span><span style="display:flex;align-items:center;gap:6px;${MONO}font-size:12.5px;font-weight:600;color:#A35A00;">${DOT_A}+3.7%</span></div>`;
const summaryRows = `<div role="row" style="display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;padding:12px 16px 6px;border-top:1px solid rgb(22 23 27 / 0.08);"><span style="font-size:13px;color:#5A564E;">Billed for 4 bolt kits that never arrived</span><span style="${NUM}font-weight:600;">$84.00</span></div>
              <div role="row" style="display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;padding:6px 16px 13px;"><span style="font-size:13px;color:#5A564E;">Rotors up 3.7%, as Meridian’s 2 Mar email said</span><span style="${NUM}font-weight:600;">+$18.00</span></div>`;

/* ---------- Rules card: the newest rule lands on a list of learned and set rules ---------- */
const rulesList = `<div ref="{{ capRulesRef }}" aria-label="Learned rules, newest on top" role="list" style="position:relative;display:grid;margin:clamp(18px,2.4vw,28px) clamp(22px,2.6vw,32px) clamp(24px,3vw,36px);">
              <div role="listitem" style="position:relative;z-index:2;display:grid;gap:9px;margin-bottom:12px;padding:16px 18px;background:#FFFDF9;border:1px solid rgb(22 23 27 / 0.12);border-radius:10px;box-shadow:0 1px 2px rgba(22,23,27,0.1),0 26px 44px -18px rgba(22,23,27,0.4);opacity:{{ capNewOp }};transform:{{ capNewTf }};transition:{{ capNewTr }};">
                <span style="display:flex;justify-content:space-between;gap:10px;"><span style="${LABEL}color:#16171B;">Rule 07 · Learned today</span><span style="display:flex;align-items:center;gap:6px;font-size:12px;font-weight:500;color:#08745A;">${DOT_G}New</span></span>
                <span style="font-size:16px;font-weight:500;line-height:1.4;">Meridian first for rotors under <span style="${MONO}">$42.00</span></span>
                <span style="${MONO}font-size:11.5px;color:#5A564E;">From 41 approved orders</span>
              </div>
              <sc-for list="{{ capRules }}" as="r" hint-placeholder-count="4">
                <div role="listitem" style="display:grid;grid-template-columns:28px minmax(0,1fr);gap:3px 10px;padding:11px 14px;background:#FFFDF9;border:1px solid rgb(22 23 27 / 0.12);border-top-width:{{ r.bt }};border-radius:{{ r.rad }};box-shadow:{{ r.sh }};">
                  <span style="grid-row:span 2;padding-top:2px;${MONO}font-size:11px;font-weight:600;color:#6A665D;">{{ r.n }}</span>
                  <span style="font-size:14px;font-weight:500;line-height:1.35;">{{ r.a }}<span style="${MONO}font-size:13px;">{{ r.num }}</span>{{ r.b }}</span>
                  <span style="${MONO}font-size:11px;color:#5A564E;">{{ r.src }}</span>
                </div>
              </sc-for>
            </div>`;

/* ---------- logic: state, measuring, the plane band ---------- */
const CAP_METHODS = String.raw`/* ---------- 03 capabilities (site patch v9-capabilities): card density + the plane band ---------- */
  capSkyRef = React.createRef(); capRulesRef = React.createRef();
  capSetup() {
    const sec = document.getElementById('capabilities'); if (!sec) return;
    this.capMeasure();
    if ('ResizeObserver' in window) { this.capRO = new ResizeObserver(() => this.capMeasure()); this.capRO.observe(sec); }
    const rl = this.capRulesRef.current;
    if (rl && 'IntersectionObserver' in window) {
      this.capIO = new IntersectionObserver((es) => es.forEach((e) => {
        if (!e.isIntersecting || this.capRuleDone) return; this.capRuleDone = true; this.capIO.disconnect();
        this.capRuleT = setTimeout(() => { if (!this.dead) this.setState({ capRuleIn: true }); }, 320);
      }), { threshold: 0.45 });
      this.capIO.observe(rl);
    } else this.setState({ capRuleIn: true });
    this.rafCS = requestAnimationFrame(this.capSkyLoop);
  }
  // layouts follow each card's own width (the cards wrap at different viewport widths)
  capMeasure() {
    if (this.dead) return;
    const W = (k) => { const el = document.querySelector('#capabilities [data-cap="' + k + '"]'); return el ? el.getBoundingClientRect().width : 0; };
    const T = (k) => { const el = document.querySelector('#capabilities [data-cap="' + k + '"]'); return el ? Math.round(el.getBoundingClientRect().top) : 0; }, pair = (a, b) => Math.abs(T(a) - T(b)) < 2;
    // side by side, a list fills its card next to a taller neighbour; stacked (phones), it shows fewer rows
    const nx = { capApMore: W('ap') >= 452, capPoFull: pair('ap', 'po') || W('po') >= 600, capInvWide: W('inv') >= 600, capPoWide: W('po') >= 600, capPoXL: W('po') >= 700, capInvMid: W('inv') >= 470, capRuFull: pair('inv', 'ru') || W('ru') >= 600 };
    if (Object.keys(nx).some((k) => nx[k] !== !!this.state[k])) this.setState(nx);
  }
  capVals(red) {
    const S = this.state, wide = !!S.capInvWide;
    const ST = {
      d: ['Drafted', '#0B5FFF', '0 0 0 1.5px #FFFFFF,0 0 0 2.5px rgba(11,95,255,0.35)'],
      w: ['Waiting on you', '#FFFDF9', 'inset 0 0 0 1.5px #16171B'],
      c: ['Confirmed', '#08745A', '0 0 0 1.5px rgba(8,116,90,0.22),0 1px 1.5px rgba(0,0,0,0.3)'],
      l: ['Late · chasing', '#A35A00', '0 0 0 1.5px #FFFFFF,0 0 0 2.5px rgba(163,90,0,0.3)'],
      r: ['Received', '#9A968D', 'none'],
    };
    const po = [
      ['PO-2291', 'Meridian Supply', '480 rotors', '$19,392.00', 'd', 1], ['PO-2292', 'Kestrel Fasteners', '5,000 M8 bolts', '$1,450.00', 'w', 1],
      ['PO-2290', 'Arcadia Electronics', '2,000 connectors', '$1,140.00', 'c', 1], ['PO-2289', 'Halden Industrial', '60 bearings', '$702.00', 'c', 0],
      ['PO-2288', 'Northline Parts', '96 pad sets', '$3,072.00', 'l', 1], ['PO-2287', 'Corvan Hydraulics', '24 hose kits', '$1,176.00', 'r', 0],
    ].filter((r) => S.capPoFull || r[5]);
    const rules = [
      ['06', 'From 14 orders', 'Order Arcadia connectors in boxes of ', '500', ' or more', 1], ['05', 'You set this', 'Ask before paying more than ', '3%', ' over the last price', 1],
      ['04', 'From 9 deliveries', 'Add ', '4 days', ' to Northline’s quoted lead time', 1], ['03', 'From 12 orders', 'Split POs above ', '600 units', ' across two suppliers', 1],
      ['02', 'You set this', 'Hold invoices more than ', '2%', ' over quote', 0], ['01', 'You set this', 'Ask before any order for SKU ', 'CB-118', '', 0],
    ].filter((r) => S.capRuFull || r[5]);
    const shown = red || S.capRuleIn;
    return {
      capSkyRef: this.capSkyRef, capRulesRef: this.capRulesRef, capApMore: !!S.capApMore, capInvWide: wide,
      capPoRows: po.map((r, i, a) => ({ po: r[0], sup: r[1], qty: r[2], tot: r[3], st: ST[r[4]][0], dot: ST[r[4]][1], dsh: ST[r[4]][2], bg: i === 0 ? 'rgba(11,95,255,0.04)' : 'transparent', bb: i < a.length - 1 ? '1px solid rgb(22 23 27 / 0.08)' : '0' })),
      capRules: rules.map((r, i, a) => ({ n: r[0], src: r[1], a: r[2], num: r[3], b: r[4], bt: i ? '0' : '1px', rad: (i ? '0 0 ' : '10px 10px ') + (i === a.length - 1 ? '10px 10px' : '0 0'), sh: i === a.length - 1 ? '0 18px 36px -22px rgba(22,23,27,0.3)' : 'none' })),
      capInvCols: wide ? 'minmax(0,1fr) 236px' : 'minmax(0,1fr)', capInvGap: wide ? '14px' : '10px', capInvPr: wide ? 'clamp(20px,2.4vw,28px)' : '0',
      capGmW: wide ? '100%' : 'min(460px,calc(100% - 24px))', capOlW: wide ? '100%' : 'min(340px,calc(100% - 48px))', capOlMl: wide ? '0' : '24px',
      capSpS: !S.capPoWide, capSpM: !!S.capPoWide && !S.capPoXL, capSpL: !!S.capPoXL, capPoMr: S.capPoWide ? '-24px' : '-140px', capPoMin: S.capPoWide ? '0' : '620px', capPoCols: S.capPoWide ? '72px minmax(0,1fr) 128px 92px 120px' : '96px minmax(0,1.4fr) 132px 110px minmax(0,1fr)', capPoGap: S.capPoWide ? '12px' : '14px',
      capApL: S.capApMore ? 'clamp(14px,1.8vw,24px)' : 'clamp(20px,2.6vw,32px)', capApW: S.capApMore ? '184px' : '196px', capApR: S.capApMore ? '16px' : 'clamp(20px,3vw,40px)', capTblPl: wide ? 'clamp(28px,5vw,64px)' : S.capInvMid ? '12px' : 'clamp(28px,5vw,64px)', capTblMin: wide || !S.capInvMid ? '520px' : '0',
      capArPl: wide ? '42%' : 'clamp(120px,40%,220px)', capStampMr: wide ? '6px' : 'clamp(24px,4vw,56px)',
      capNewOp: shown ? 1 : 0, capNewTf: shown ? 'none' : 'translateY(-14px) scale(0.98)', capNewTr: red ? 'none' : 'opacity 520ms ease, transform 680ms cubic-bezier(0.2,0.8,0.2,1)',
    };
  }
  // one flight in the open band: a dense polyline [x, y, speed factor], built for one direction
  capPath(kind, dir, w, o) {
    const R = Math.random, E = 90, pts = []; let steep = false;
    const seg = (a, b) => {
      // climbs and dives stay gentle: the curve is steepest at its middle, 1.5x the average slope
      if (Math.abs(b[1] - a[1]) * 1.5 > Math.abs(b[0] - a[0]) * 0.9) steep = true;
      const n = Math.max(8, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 5)), mx = (a[0] + b[0]) / 2;
      for (let i = pts.length ? 1 : 0; i <= n; i++) { const u = i / n, q = 1 - u, x = q * q * q * a[0] + 3 * q * u * mx + u * u * u * b[0], y = (q * q * q + 3 * q * q * u) * a[1] + (3 * q * u * u + u * u * u) * b[1]; pts.push([x, y, 1]); }
      return b;
    };
    // loop-the-loop: up and over, drifting forward k px; slower over the top
    const loop = (a, r, k, d) => { const n = Math.ceil((2 * Math.PI * r + k) / 4); for (let i = 1; i <= n; i++) { const th = (i / n) * Math.PI * 2; pts.push([a[0] + d * (r * Math.sin(th) + (k * th) / (Math.PI * 2)), a[1] - r * (1 - Math.cos(th)), 0.74 + 0.26 * Math.cos(th)]); } return [a[0] + d * k, a[1]]; };
    const lane = () => o.yMin + R() * (o.yLane - o.yMin), L = -E, Rx = w + E, xR = o.xR;
    if (kind === 'line' || kind === 'roll') {
      const y0 = lane(), y1 = Math.max(o.yMin, Math.min(o.yLane, y0 + (R() - 0.5) * 30));
      const a = dir > 0 ? [L, y0] : [Rx, y0], b = dir > 0 ? [Rx, y1] : [L, y1]; seg(a, b);
      const ph = R() * 6, amp = 2 + R() * 4; pts.forEach((p) => { p[1] += Math.sin(ph + p[0] / 140) * amp; });
      return pts;
    }
    const yR = () => o.yLane + R() * Math.max(0, o.yLow - o.yLane);
    if (kind === 'drift') {
      const y0 = lane(), yD = yR();
      if (dir > 0) { seg([L, y0], [xR, y0]); seg([xR, y0], [Rx, yD]); } else { seg([Rx, yD], [xR, y0]); seg([xR, y0], [L, y0 + (R() - 0.5) * 16]); }
      return steep ? null : pts;
    }
    const r = o.wide ? 30 + R() * 16 : 19 + R() * 7, k = r * (0.5 + R() * 0.7), yA = o.yMin + 2 * r + 8 + R() * Math.max(0, o.yLow - (o.yMin + 2 * r + 8));
    if (yA > o.yLow) return null;
    if (dir > 0) {
      const x0 = xR + r + 70, x1 = w - r - k - 40; if (x1 < x0) return null;
      const xL = x0 + R() * (x1 - x0), y0 = lane();
      seg([L, y0], [xR - 10, y0]); seg([xR - 10, y0], [xL, yA]); const e = loop([xL, yA], r, k, 1);
      seg(e, [Rx, Math.min(o.yLow, yA + 12 + R() * 46)]);
    } else {
      const x0 = xR + r + k + 80, x1 = w - r - 30; if (x1 < x0) return null;
      const xL = x0 + R() * (x1 - x0), yS = o.yMin + R() * Math.max(0, yA - o.yMin), y1 = lane();
      seg([Rx, yS], [xL, yA]); const e = loop([xL, yA], r, k, -1);
      seg(e, [xR - 10, y1]); seg([xR - 10, y1], [L, y1 + (R() - 0.5) * 14]);
    }
    return steep ? null : pts;
  }
  capMake(w, h, cv, other) {
    const R = Math.random, cr = cv.getBoundingClientRect(), box = cv.parentElement;
    const obs = [box.querySelector('h2'), ...box.querySelectorAll('ol > li > span')].filter(Boolean)
      .map((el) => { const r = el.getBoundingClientRect(); return [r.left - cr.left, r.top - cr.top, r.right - cr.left, r.bottom - cr.top]; }).filter((r) => r[2] > r[0]);
    if (!obs.length) return null;
    const wide = w >= 900, sc = (wide ? 0.74 : 0.5) * (0.88 + R() * 0.24), pad = 30 * sc + 10;
    // the top lane keeps clear of the sticky nav, which covers the band's top edge while the headline is read
    const top = Math.min(...obs.map((b) => b[1])), yMin = Math.max(14 + 22 * sc, top * 0.42), yLane = top - pad;
    if (yLane < yMin) return null;
    // the open area right of the headline, down to the step pills (or the band's foot)
    const xR = obs[0][2] + 28, below = obs.slice(1).filter((b) => b[2] > xR).map((b) => b[1]);
    const yLow = Math.min(h - pad, below.length ? Math.min(...below) - pad : h - pad);
    const hit = (pts) => pts.some((p) => p[1] < yMin - 8 || p[1] > h - 12 * sc - 4 || obs.some((b) => p[0] > b[0] - pad && p[0] < b[2] + pad && p[1] > b[1] - pad && p[1] < b[3] + pad));
    const dir = other ? (R() < 0.75 ? -other.dir : other.dir) : R() < 0.5 ? 1 : -1;
    const room = w - 20 - xR > (wide ? 260 : 150) && yLow - yMin > (wide ? 96 : 60);
    const kinds = room ? ['line', 'line', 'roll', 'drift', 'drift', 'loop', 'loop', 'loop'] : ['line', 'line', 'line', 'roll'];
    const v = (wide ? 190 : 112) * (0.85 + R() * 0.3);
    for (let tr = 0; tr < 16; tr++) {
      const kind = tr > 11 ? 'line' : kinds[Math.floor(R() * kinds.length)], pts = this.capPath(kind, dir, w, { yMin, yLane, yLow, xR, wide });
      if (!pts || pts.length < 2 || hit(pts)) continue;
      const tt = [0], dots = []; let acc = 0, run = 0;
      for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); acc += d / (v * pts[i][2]); tt.push(acc); run += d; if (run >= 9) { run = 0; dots.push([pts[i][0], pts[i][1], acc]); } }
      const f = { pts, tt, dots, dur: acc, dir, sc, i: 0, lag: (30 * sc) / v + 0.06 };
      if (kind === 'roll') { const a = acc * (0.3 + R() * 0.35); f.roll = [a, a + 1.15]; }
      return f;
    }
    return null;
  }
  // 0-2 planes at a time, at uneven gaps; nothing under reduced motion or off screen
  capSkyLoop = (now) => {
    if (this.dead) return;
    this.rafCS = requestAnimationFrame(this.capSkyLoop);
    const cv = this.capSkyRef.current; if (!cv) return;
    const g = cv.getContext('2d'), red = this.isReduced();
    let on = !red && !!this.pfIn;
    if (on) { const vr = cv.getBoundingClientRect(); on = vr.bottom > 0 && vr.top < window.innerHeight; }
    if (!on) { if (this.csDrawn) { g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height); this.csDrawn = false; } this.csF = []; this.csNext = 0; return; }
    const w = cv.clientWidth, h = cv.clientHeight; if (!w || !h) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1), CW = Math.round(w * dpr), CH = Math.round(h * dpr);
    if (cv.width !== CW || cv.height !== CH) { cv.width = CW; cv.height = CH; }
    const t = now / 1000, key = w + 'x' + h;
    if (this.csKey !== key || !this.csF) { this.csKey = key; this.csF = []; this.csNext = 0; }
    if (!this.csNext) this.csNext = t + 0.8 + Math.random() * 1.8;
    this.csF = this.csF.filter((f) => t - f.t0 < f.dur + 4);
    if (t >= this.csNext) {
      const live = this.csF.filter((f) => t - f.t0 < f.dur);
      if (live.length < 2 && !live.some((f) => (t - f.t0) / f.dur < 0.3)) {
        const f = this.capMake(w, h, cv, live[0]); if (f) { f.t0 = t; this.csF.push(f); }
        this.csNext = t + (Math.random() < 0.3 ? 2.4 + Math.random() * 2.4 : 5.5 + Math.random() * 7);
      } else this.csNext = t + 0.8 + Math.random() * 1.6;
    }
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, h);
    const ink = this.effDark('light') ? 'rgba(236,234,228,' : 'rgba(22,23,27,', sp = this.pfSprite();
    this.csF.forEach((f) => {
      const T = t - f.t0;
      // the dashed trail: each dot shows once the plane is past it and fades a few seconds later
      f.dots.forEach((d) => { const age = T - d[2]; if (age < f.lag) return; const a = 0.24 * Math.min(1, Math.max(0, 1 - (age - 2.6) / 1.2)); if (a <= 0) return; g.fillStyle = ink + a.toFixed(3) + ')'; g.fillRect(Math.round(d[0]) - 1, Math.round(d[1]) - 1, 2, 2); });
      if (T >= f.dur) return;
      const P = f.pts, TT = f.tt; let i = f.i; while (i < P.length - 2 && TT[i + 1] < T) i++; f.i = i;
      const u = Math.max(0, Math.min(1, (T - TT[i]) / Math.max(1e-6, TT[i + 1] - TT[i]))), x = P[i][0] + (P[i + 1][0] - P[i][0]) * u, y = P[i][1] + (P[i + 1][1] - P[i][1]) * u;
      const a0 = P[Math.max(0, i - 2)], a1 = P[Math.min(P.length - 1, i + 3)], an = Math.atan2(a1[1] - a0[1], a1[0] - a0[0]);
      let sy = f.dir < 0 ? -1 : 1; if (f.roll && T > f.roll[0] && T < f.roll[1]) sy *= Math.cos(((T - f.roll[0]) / (f.roll[1] - f.roll[0])) * Math.PI * 2);
      g.save(); g.translate(x, y); g.rotate(an); g.scale(f.sc, f.sc * sy); g.imageSmoothingEnabled = false; g.drawImage(sp, -36, -22); g.restore();
    });
    this.csDrawn = true;
  };
  pfSprite() {`;

export const logicPatches = [
  {
    why: "Capabilities: the methods behind the denser cards (layout by card width, the PO rows and rules lists, the newest rule landing) and the plane band around the headline",
    find: "  pfSprite() {",
    replace: "  " + CAP_METHODS,
  },
  {
    why: "Capabilities: start the plane band and the card measuring with the section's other loops",
    find: "this.rafPF = requestAnimationFrame(this.pfLoop);\n    this.rafSB = requestAnimationFrame(this.spLoop);",
    replace: "this.rafPF = requestAnimationFrame(this.pfLoop);\n    this.capSetup();\n    this.rafSB = requestAnimationFrame(this.spLoop);",
  },
  {
    why: "Capabilities: stop the plane band and its observers on unmount",
    find: "cancelAnimationFrame(this.rafPF);",
    replace: "cancelAnimationFrame(this.rafPF); cancelAnimationFrame(this.rafCS); if (this.capRO) this.capRO.disconnect(); if (this.capIO) this.capIO.disconnect(); clearTimeout(this.capRuleT);",
  },
  {
    why: "Capabilities: the planes over the cards fly about 38% slower (Luca: some still swooshed by too quickly); the whole flight clock runs at 1/1.6, so the gaps between them stretch too",
    find: "const t = now / 1000, sp = this.pfSprite(), base = w >= 900 ? 1.15 : 0.8;",
    replace: "const t = now / 1000 / 1.6, sp = this.pfSprite(), base = w >= 900 ? 1.15 : 0.8;",
  },
  {
    why: "Capabilities: hand the template the card and plane band values",
    find: "cgRef: this.cgRef, pfPlaneRef: this.pfPlaneRef,",
    replace: "...this.capVals(red), cgRef: this.cgRef, pfPlaneRef: this.pfPlaneRef,",
  },
];

export const templatePatches = [
  {
    why: "Capabilities: the headline block holds the plane band's canvas (it spans the section's width, from the top edge down to the stockbot diagram)",
    find: `<div style="display:grid;gap:clamp(20px,3svh,28px);">`,
    replace: `<div style="position:relative;display:grid;gap:clamp(20px,3svh,28px);">`,
  },
  {
    why: "Capabilities: the plane band canvas, above the text but drawn only where the headline and the step pills are not",
    find: `        </ol>\n      </div>\n      <div style="position:relative;display:grid;gap:clamp(14px,1.6vw,20px);">`,
    replace: `        </ol>\n        <canvas ref="{{ capSkyRef }}" aria-hidden="true" style="position:absolute;z-index:1;pointer-events:none;display:block;left:calc(-1 * var(--edge));width:calc(100% + 2 * var(--edge));top:calc(-1 * clamp(96px,13svh,144px));height:calc(100% + clamp(96px,13svh,144px) + clamp(40px,6svh,64px) - 6px);"></canvas>\n      </div>\n      <div style="position:relative;display:grid;gap:clamp(14px,1.6vw,20px);">`,
  },
  {
    why: "Capabilities › Approvals: the card is measured, so the extra replies only show when they fit beside the phone",
    find: `<article style="flex:2 1 340px;min-width:0;min-height:660px;`,
    replace: `<article data-cap="ap" style="flex:2 1 340px;min-width:0;min-height:660px;`,
  },
  {
    why: "Capabilities › Approvals: with the reply stack showing, the phone sits 16px off the card edge so the stack only overlaps its frame",
    find: `<div role="img" aria-label="iPhone showing a stockbot iMessage thread: a reorder request, an Approve reply marked Delivered, and confirmation that PO-2291 was sent" style="position:absolute;z-index:2;right:clamp(20px,3vw,40px);`,
    replace: `<div role="img" aria-label="iPhone showing a stockbot iMessage thread: a supplier switch, a reorder request, an Approve reply marked Delivered, and confirmation that PO-2291 was sent" style="position:absolute;z-index:2;right:{{ capApR }};`,
  },
  {
    why: "Capabilities › Approvals: the thread starts with an earlier exchange (a supplier swap), cut off by the top of the screen like a real scrolled thread",
    find: `<div style="flex:1;min-height:0;display:flex;flex-direction:column;justify-content:flex-end;gap:3px;padding:10px 9px 8px;">\n                  <span style="align-self:center;margin-bottom:6px;text-align:center;font-size:9.5px;line-height:1.35;color:#8E8E93;"><span style="font-weight:600;">iMessage</span><br>Today 9:38 AM</span>`,
    replace: `<div style="flex:1;min-height:0;overflow:hidden;display:flex;flex-direction:column;justify-content:flex-end;gap:3px;padding:10px 9px 8px;">
                  <span style="align-self:center;margin-bottom:6px;text-align:center;font-size:9.5px;line-height:1.35;color:#8E8E93;">Yesterday 4:12 PM</span>
                  <div style="flex:none;max-width:80%;align-self:flex-start;padding:7px 11px;border-radius:17px;background:#E9E9EB;color:#000000;font-size:12.5px;line-height:1.32;text-wrap:pretty;">Northline needs 12 days for the 60 bearings. Halden can ship in 3 at the same price. Switch?</div>
                  <div style="flex:none;margin-top:6px;margin-bottom:8px;max-width:70%;align-self:flex-end;padding:7px 12px;border-radius:17px;background:#0A84FF;color:#FFFFFF;font-size:12.5px;line-height:1.32;">Switch</div>
                  <span style="flex:none;align-self:center;margin-bottom:6px;text-align:center;font-size:9.5px;line-height:1.35;color:#8E8E93;"><span style="font-weight:600;">iMessage</span><br>Today 9:38 AM</span>`,
  },
  {
    why: "Capabilities › Approvals: the thread's bubbles keep their height when the earlier exchange pushes the thread past the top",
    find: `<div style="max-width:80%;align-self:flex-start;padding:7px 11px;border-radius:17px;background:#E9E9EB;color:#000000;font-size:12.5px;line-height:1.32;text-wrap:pretty;">Reorder ready:`,
    replace: `<div style="flex:none;max-width:80%;align-self:flex-start;padding:7px 11px;border-radius:17px;background:#E9E9EB;color:#000000;font-size:12.5px;line-height:1.32;text-wrap:pretty;">Reorder ready:`,
  },
  {
    why: "Capabilities › Approvals: a stack of recent replies (a hold, a supplier swap, a price change) above the PO-2291 chip, on cards wide enough to hold them beside the phone",
    find: /<div aria-hidden="true" style="position:absolute;z-index:3;left:clamp\(20px,2\.6vw,32px\);bottom:clamp\(110px,11vw,150px\);width:196px;[\s\S]*?\$19,392\.00<\/span>\n\s*<\/div>/g,
    replace: () => apChips,
  },
  {
    why: "Capabilities › Purchase orders: six POs across suppliers and statuses (four on narrow cards) and a 'why now' strip with the rotor's stock line, reorder point and lead time, so the card is full",
    find: /<article style="flex:3 1 460px;min-width:0;min-height:clamp\(440px,40vw,520px\);[\s\S]*?<\/article>/g,
    replace: (m) => poCard(m.match(/<svg width="14" height="16" aria-hidden="true" viewBox="0 0 109\.5 124\.5"[\s\S]*?<\/svg>/)[0]),
  },
  {
    why: "Capabilities › Invoice matching: the card is measured, so the Outlook thread sits beside Gmail when there is room",
    find: `<article style="flex:3 1 460px;min-width:0;position:relative;overflow:hidden;display:flex;flex-direction:column;padding-bottom`,
    replace: `<article data-cap="inv" style="flex:3 1 460px;min-width:0;position:relative;overflow:hidden;display:flex;flex-direction:column;padding-bottom`,
  },
  {
    why: "Capabilities › Invoice matching: the card body keeps the card's width (the invoice table still bleeds off the right edge), so the HOLD stamp is no longer pushed out of view",
    find: `<div style="position:relative;display:grid;padding:clamp(20px,2.4vw,28px) 0 0 clamp(22px,2.6vw,32px);">`,
    replace: `<div style="position:relative;display:grid;grid-template-columns:minmax(0,1fr);padding:clamp(20px,2.4vw,28px) 0 0 clamp(22px,2.6vw,32px);">`,
  },
  {
    why: "Capabilities › Invoice matching: on mid-width cards the invoice lines fit the card, so the flags in the last column stay in view",
    find: `<div style="margin-right:-12px;padding-left:clamp(28px,5vw,64px);"><div role="table" aria-label="Invoice INV-4471 matched against the PO" style="position:relative;min-width:520px;`,
    replace: `<div style="margin-right:-12px;padding-left:{{ capTblPl }};"><div role="table" aria-label="Invoice INV-4471 matched against the PO" style="position:relative;min-width:{{ capTblMin }};`,
  },
  {
    why: "Capabilities › Invoice matching: Gmail and an Outlook thread side by side (stacked on narrow cards)",
    find: `<div role="img" aria-label="Gmail inbox with an invoice from Meridian Supply, INV-4471.pdf attached" style="width:min(460px,calc(100% - 24px));overflow:hidden;background:#FFFFFF;`,
    replace: `<div style="display:grid;grid-template-columns:{{ capInvCols }};gap:{{ capInvGap }};align-items:end;padding-right:{{ capInvPr }};"><div role="img" aria-label="Gmail inbox with an invoice from Meridian Supply, INV-4471.pdf attached" style="width:{{ capGmW }};box-sizing:border-box;min-width:0;overflow:hidden;background:#FFFFFF;`,
  },
  {
    why: "Capabilities › Invoice matching: the Outlook thread from Meridian (Dana Ruiz, initials avatar) with the rotor price change",
    find: `Yesterday</span></div>\n              </div>`,
    replace: `Yesterday</span></div>\n              </div>\n              ${outlookCard}</div>`,
  },
  {
    why: "Capabilities › Invoice matching: an arrow from each inbox into the invoice lines (the Outlook one lands on the rotor line); the HOLD stamp sits between them",
    find: /<div aria-hidden="true" style="display:flex;align-items:center;height:40px;padding-left:clamp\(150px,18vw,200px\);">[\s\S]*?>Hold<\/span>\n\s*<\/div>/g,
    replace: () => invArrows,
  },
  {
    why: "Capabilities › Invoice matching: the rotor line is caught billing $41.90 against the PO's $40.40 (+3.7%)",
    find: /<div role="row" style="display:grid;grid-template-columns:minmax\(0,1fr\) 64px 64px 64px 72px;gap:12px;align-items:center;padding:13px 16px;border-bottom:1px solid rgb\(22 23 27 \/ 0\.08\);"><span style="font-size:13\.5px;">Rotor 320mm<\/span>[\s\S]*?<\/svg><\/div>/g,
    replace: () => rotorRow,
  },
  {
    why: "Capabilities › Invoice matching: the summary names both catches, the missing bolt kits and the rotor price rise from Meridian's email",
    find: /<div role="row" style="display:grid;grid-template-columns:minmax\(0,1fr\) auto;gap:12px;padding:13px 16px;border-top:1px solid rgb\(22 23 27 \/ 0\.08\);"><span style="font-size:13px;color:#5A564E;">Billed for 4 bolt kits that never arrived<\/span>[\s\S]*?\$84\.00<\/span><\/div>/g,
    replace: () => summaryRows,
  },
  {
    why: "Capabilities › Learns your rules: the card is measured, so narrow cards list fewer rules",
    find: `<article style="flex:2 1 340px;min-width:0;position:relative;overflow:hidden;display:flex;flex-direction:column;border-radius`,
    replace: `<article data-cap="ru" style="flex:2 1 340px;min-width:0;position:relative;overflow:hidden;display:flex;flex-direction:column;border-radius`,
  },
  {
    why: "Capabilities › Learns your rules: the newest rule lands on top of a list of learned and set rules (MOQ, price drift, lead-time buffer, order splits, invoice holds, a SKU that always asks), each with where it came from",
    find: /<div aria-label="Learned rules, newest on top" role="list"[\s\S]*?Learned from 41 approved orders<\/span>\n\s*<\/div>\n\s*<\/div>/g,
    replace: () => rulesList,
  },
];
