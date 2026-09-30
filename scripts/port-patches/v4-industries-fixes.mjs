/**
 * v4 fixes, 2026-09-30 (Luca): Industries full-bleed stage, Electronics mobile trace,
 * Act 1 plane clouds. Applied by scripts/port-dc.mjs at port time; each `find` must
 * match its logic/template source exactly once. The same find/replace pairs are the
 * change list for the Claude Design "Everstock v4" file (handoff/v4-industries-fixes.md).
 */

export const logicPatches = [
  /* ---------- 1. Industries: full-bleed stage (drawInd) ---------- */
  {
    why: "Industries: keep W as the composition width (flanking art stays symmetric around the centre box), add X0/X1 = the true page edges in local coords for backgrounds and travel paths; mob = the under-768px layout",
    find: "const W0 = cv._w, H = cv._h, MX = Math.max(24, (W0 - 1280) / 2 + 40), W = W0 - 2 * MX; let g = cv.getContext('2d'); const gB = g;",
    replace:
      "const W0 = cv._w, H = cv._h, MX = Math.max(24, (W0 - 1280) / 2 + 40), W = W0 - 2 * MX; let g = cv.getContext('2d'); const gB = g;\n" +
      "    const X0 = -MX, X1 = W + MX, mob = W0 < 768; // page edges in the translated space; phone layout",
  },
  {
    why: "Industries: blueprint grids run to both page edges",
    find: "const grid = (step, a) => { g.strokeStyle = ink(a); g.lineWidth = 1; g.beginPath(); for (let x = ((W / 2) % step) + 0.5; x < W; x += step) { g.moveTo(x, 0); g.lineTo(x, H); } for (let y = ((H / 2) % step) + 0.5; y < H; y += step) { g.moveTo(0, y); g.lineTo(W, y); } g.stroke(); };",
    replace:
      "const grid = (step, a) => { g.strokeStyle = ink(a); g.lineWidth = 1; g.beginPath(); for (let x = ((W / 2) % step) + 0.5 - Math.ceil(MX / step) * step; x < X1; x += step) { g.moveTo(x, 0); g.lineTo(x, H); } for (let y = ((H / 2) % step) + 0.5; y < H; y += step) { g.moveTo(X0, y); g.lineTo(X1, y); } g.stroke(); };",
  },
  {
    why: "Industries › Auto: centreline to both page edges",
    find: "grid(14, 0.04); grid(84, 0.1);\n      dash([22, 5, 3, 5]); ln(0, cy, W, cy, 0.3); dash();",
    replace: "grid(14, 0.04); grid(84, 0.1);\n      dash([22, 5, 3, 5]); ln(X0, cy, X1, cy, 0.3); dash();",
  },
  {
    why: "Industries › Auto: the car's run starts and ends beyond the page edges (same drive time)",
    find: "const lt = t % LOOP, span = W + 420 * kc, v = span / DRIVE, xs = -190 * kc;",
    replace: "const lt = t % LOOP, span = X1 - X0 + 420 * kc, v = span / DRIVE, xs = X0 - 190 * kc;",
  },
  {
    why: "Industries › Auto: road line to both page edges",
    find: "dash([10, 8]); ln(0, yR + 0.5, W, yR + 0.5, 0.2); dash();",
    replace: "dash([10, 8]); ln(X0, yR + 0.5, X1, yR + 0.5, 0.2); dash();",
  },
  {
    why: "Industries › Auto: exhaust follows the car past the old frame",
    find: "if (x < -cell || x > W) continue;",
    replace: "if (x < X0 - cell || x > X1) continue;",
  },
  {
    why: "Industries › Auto: the car is drawn until it has left the page",
    find: "if (x0 > -200 * kc && x0 < W + 20) {",
    replace: "if (x0 > X0 - 200 * kc && x0 < X1 + 20) {",
  },
  {
    why: "Industries › Electronics: dot grid to both page edges; the bordered frame and its corner screws are removed",
    find:
      "g.fillStyle = ink(0.1); for (let y = ((H / 2) % 14); y < H; y += 14) for (let x = ((W / 2) % 14); x < W; x += 14) g.fillRect(x, y, 1.2, 1.2);\n" +
      "      rr(18.5, 18.5, W - 37, H - 37, 16, 0.32);\n" +
      "      [[36, 36], [W - 36, 36], [36, H - 36], [W - 36, H - 36]].forEach((p) => { ell(p[0], p[1], 7, 7, 0.4); ell(p[0], p[1], 3, 3, 0.3); });",
    replace:
      "g.fillStyle = ink(0.1); for (let y = ((H / 2) % 14); y < H; y += 14) for (let x = ((W / 2) % 14) - Math.ceil(MX / 14) * 14; x < X1; x += 14) g.fillRect(x, y, 1.2, 1.2);",
  },
  {
    why: "Industries › Electronics: a shorter power-up cycle on phones (the pulse route is shorter)",
    find: "EC = this.eCyc = { t0, len: 2.6 + 5.1 + 0.5 + Math.random() * 0.5, burst: false }; }\n      const TR = 2.6,",
    replace: "EC = this.eCyc = { t0, len: (mob ? 1.8 : 2.6) + 5.1 + 0.5 + Math.random() * 0.5, burst: false }; }\n      const TR = mob ? 1.8 : 2.6,",
  },
  {
    why: "Industries › Electronics: PCB traces spread across the full page width, at the same density",
    find:
      "for (let n = 0; n < 18; n++) {\n" +
      "        let y = Math.round((48 + R2() * (H - 96)) / G) * G, x = 34 + R2() * W * 0.18; const pts = [[x, y]];\n" +
      "        while (x < W - 60) { x = Math.min(W - 48, x + G * (2 + Math.floor(R2() * 6))); pts.push([x, y]); if (R2() < 0.5 && x < W - 110) {",
    replace:
      "const TW = X1 - X0;\n" +
      "      for (let n = 0; n < Math.round((18 * TW) / W); n++) {\n" +
      "        let y = Math.round((48 + R2() * (H - 96)) / G) * G, x = X0 + 34 + R2() * (TW - W * 0.82); const pts = [[x, y]];\n" +
      "        while (x < X1 - 60) { x = Math.min(X1 - 48, x + G * (2 + Math.floor(R2() * 6))); pts.push([x, y]); if (R2() < 0.5 && x < X1 - 110) {",
  },
  {
    why: "Industries › Electronics: J1, footprint and route. Desktop unchanged; under 768px the source sits above the box, the footprint below it (under the CTA) and the trace runs down the box's left side, all on screen",
    find:
      "const cw = 88 * sc, ch = 34 * sc, cx = lx;\n" +
      "      g.fillStyle = BG; g.fillRect(cx - cw / 2 - 8, cy - ch / 2 - 22, cw + 16, ch + 44);\n" +
      "      rr(cx - cw / 2, cy - ch / 2, cw, ch, ch / 2, 0.62, 1.2); rr(cx - cw * 0.34, cy - ch * 0.2, cw * 0.68, ch * 0.4, ch * 0.2, 0.45);\n" +
      "      for (let k = 0; k < 12; k++) ln(cx - cw * 0.3 + k * cw * 0.055, cy + ch / 2, cx - cw * 0.3 + k * cw * 0.055, cy + ch / 2 + 6, 0.5);\n" +
      "      txt('J1 · USB-C', cx, cy - ch / 2 - 12, 0.66, 'center');\n" +
      "      const fx = rx, pw = 4.5 * sc, pg = 8 * sc, fx0 = fx - 5.5 * pg;\n" +
      "      g.fillStyle = BG; g.fillRect(fx - 76 * sc, cy - 40 * sc, 152 * sc, 80 * sc);\n" +
      "      dash([4, 3]); rr(fx - 64 * sc, cy - 22 * sc, 128 * sc, 50 * sc, 4, 0.36); dash();\n" +
      "      for (let k = 0; k < 12; k++) { const x = fx0 + k * pg - pw / 2; g.fillStyle = FILL2; g.fillRect(x, cy - 8 * sc, pw, 16 * sc); rr(x, cy - 8 * sc, pw, 16 * sc, 1, 0.6); }\n" +
      "      [[-1, 1], [1, 1]].forEach((s2) => { ell(fx + s2[0] * 54 * sc, cy + 14 * sc, 6 * sc, 6 * sc, 0.5); ell(fx + s2[0] * 54 * sc, cy + 14 * sc, 3 * sc, 3 * sc, 0.4); });\n" +
      "      txt('J1 FOOTPRINT · REV C', fx, cy - 32 * sc, 0.66, 'center');\n" +
      "      const yb = Math.min(H - 44, cy + bh / 2 + 38), xa = cx + cw / 2, xL = Math.max(xa + 24, W / 2 - bw / 2 - 28), xR = Math.min(fx0 - 24, W / 2 + bw / 2 + 28), j = 16;\n" +
      "      const path = [[xa, cy], [xL - j, cy], [xL, cy + j], [xL, yb - j], [xL + j, yb], [xR - j, yb], [xR, yb - j], [xR, cy + j], [xR + j, cy], [fx0 - pw, cy]];",
    replace:
      "// phones: the box fills the width, so J1 sits above it, the footprint below the CTA\n" +
      "      // under it, and the trace runs down the box's left side; nothing off screen\n" +
      "      const sE = mob ? 0.72 : sc, bxL = W / 2 - bw / 2, bxT = cy - bh / 2, bxB = cy + bh / 2;\n" +
      "      const cw = 88 * sE, ch = 34 * sE, cx = mob ? W / 2 - bw * 0.18 : lx, jy = mob ? Math.max(ch / 2 + 30, bxT * 0.5) : cy;\n" +
      "      g.fillStyle = BG; g.fillRect(cx - cw / 2 - 8, jy - ch / 2 - 22, cw + 16, ch + 44);\n" +
      "      rr(cx - cw / 2, jy - ch / 2, cw, ch, ch / 2, 0.62, 1.2); rr(cx - cw * 0.34, jy - ch * 0.2, cw * 0.68, ch * 0.4, ch * 0.2, 0.45);\n" +
      "      for (let k = 0; k < 12; k++) ln(cx - cw * 0.3 + k * cw * 0.055, jy + ch / 2, cx - cw * 0.3 + k * cw * 0.055, jy + ch / 2 + 6, 0.5);\n" +
      "      txt('J1 · USB-C', cx, jy - ch / 2 - 12, 0.66, 'center');\n" +
      "      const fx = mob ? W / 2 + bw * 0.12 : rx, fyF = mob ? Math.min(H - 34 * sE, (bxB + 64 + H) / 2 + 6) : cy, pw = 4.5 * sE, pg = 8 * sE, fx0 = fx - 5.5 * pg;\n" +
      "      g.fillStyle = BG; g.fillRect(fx - 76 * sE, fyF - 40 * sE, 152 * sE, 80 * sE);\n" +
      "      dash([4, 3]); rr(fx - 64 * sE, fyF - 22 * sE, 128 * sE, 50 * sE, 4, 0.36); dash();\n" +
      "      for (let k = 0; k < 12; k++) { const x = fx0 + k * pg - pw / 2; g.fillStyle = FILL2; g.fillRect(x, fyF - 8 * sE, pw, 16 * sE); rr(x, fyF - 8 * sE, pw, 16 * sE, 1, 0.6); }\n" +
      "      [[-1, 1], [1, 1]].forEach((s2) => { ell(fx + s2[0] * 54 * sE, fyF + 14 * sE, 6 * sE, 6 * sE, 0.5); ell(fx + s2[0] * 54 * sE, fyF + 14 * sE, 3 * sE, 3 * sE, 0.4); });\n" +
      "      txt('J1 FOOTPRINT · REV C', fx, fyF - 32 * sE, 0.66, 'center');\n" +
      "      let path;\n" +
      "      if (mob) { const xL = bxL - 14, j = 10; path = [[cx - cw / 2, jy], [xL + j, jy], [xL, jy + j], [xL, fyF - j], [xL + j, fyF], [fx0 - pw, fyF]]; }\n" +
      "      else { const yb = Math.min(H - 44, cy + bh / 2 + 38), xa = cx + cw / 2, xL = Math.max(xa + 24, W / 2 - bw / 2 - 28), xR = Math.min(fx0 - 24, W / 2 + bw / 2 + 28), j = 16;\n" +
      "        path = [[xa, cy], [xL - j, cy], [xL, cy + j], [xL, yb - j], [xL + j, yb], [xR - j, yb], [xR, yb - j], [xR, cy + j], [xR + j, cy], [fx0 - pw, cy]]; }",
  },
  {
    why: "Industries › Electronics: arrival sparks at the footprint's row",
    find: "sp.push({ x: fx0 + Math.random() * 11 * pg, y: cy + (Math.random() - 0.5) * 16 * sc,",
    replace: "sp.push({ x: fx0 + Math.random() * 11 * pg, y: fyF + (Math.random() - 0.5) * 16 * sE,",
  },
  {
    why: "Industries › Electronics: the power-up ripple starts at the footprint and reaches both page edges",
    find: "const dmax = Math.hypot(Math.max(fx, W - fx), Math.max(cy, H - cy)), dnOf = (x, y) => Math.min(1, Math.hypot(x - fx, y - cy) / dmax);",
    replace: "const dmax = Math.hypot(Math.max(fx - X0, X1 - fx), Math.max(fyF, H - fyF)), dnOf = (x, y) => Math.min(1, Math.hypot(x - fx, y - fyF) / dmax);",
  },
  {
    why: "Industries › Electronics: relit traces stay out of the J1 and footprint panels (moved on phones)",
    find: "g.save(); g.beginPath(); g.rect(0, 0, W, H); g.rect(fx - 76 * sc, cy - 40 * sc, 152 * sc, 80 * sc); g.rect(cx - cw / 2 - 8, cy - ch / 2 - 22, cw + 16, ch + 44); g.clip('evenodd');",
    replace: "g.save(); g.beginPath(); g.rect(X0, 0, X1 - X0, H); g.rect(fx - 76 * sE, fyF - 40 * sE, 152 * sE, 80 * sE); g.rect(cx - cw / 2 - 8, jy - ch / 2 - 22, cw + 16, ch + 44); g.clip('evenodd');",
  },
  {
    why: "Industries › Electronics: pins light only once the pulse arrives; on phones pin by pin, and the MATCHED stamp lands as the last pin lights (re-armed every cycle)",
    find: "for (let k = 0; k < 12; k++) { const x = fx0 + k * pg - pw / 2, I = glowAt(0); g.fillStyle = FILL2; g.fillRect(x, cy - 8 * sc, pw, 16 * sc); if (I > 0.01) { g.fillStyle = HOT(I, 0.92 * I); g.fillRect(x, cy - 8 * sc, pw, 16 * sc); } rr(x, cy - 8 * sc, pw, 16 * sc, 1, 0.6); }\n      }",
    replace:
      "const cool0 = c01((l2 - 3.9) / 1.2), pinI = (k) => (mob ? c01((l2 - k * 0.05) / 0.06) * Math.pow(1 - cool0, 1.6) : glowAt(0));\n" +
      "        for (let k = 0; k < 12; k++) { const x = fx0 + k * pg - pw / 2, I = pinI(k); g.fillStyle = FILL2; g.fillRect(x, fyF - 8 * sE, pw, 16 * sE); if (I > 0.01) { g.fillStyle = HOT(I, 0.92 * I); g.fillRect(x, fyF - 8 * sE, pw, 16 * sE); } rr(x, fyF - 8 * sE, pw, 16 * sE, 1, 0.6); }\n" +
      "      }\n" +
      "      if (mob && !red && i === this.state.tab && this.state.labFrom === this.indLabels[1][3]) { const want = lt >= TR + 11 * 0.05 + 0.06; if (want !== !!this.state.stampOn) this.setState({ stampOn: want }); }",
  },
  {
    why: "Industries › Industrial: road line to both page edges",
    find: "dash([10, 8]); ln(0, yF + 0.5, W, yF + 0.5, 0.2); dash();",
    replace: "dash([10, 8]); ln(X0, yF + 0.5, X1, yF + 0.5, 0.2); dash();",
  },
  {
    why: "Industries › Industrial: the forklift's run starts and ends beyond the page edges",
    find: "const k = Math.max(0.62, Math.min(1.05, W / 1300)), yF = Math.min(H - 30, cy + bh / 2 + 14), LOOP = 10, span = W + 420 * k;",
    replace: "const k = Math.max(0.62, Math.min(1.05, W / 1300)), yF = Math.min(H - 30, cy + bh / 2 + 14), LOOP = 10, span = X1 - X0 + 420 * k;",
  },
  {
    why: "(same) forklift position",
    find: "const x = red ? Math.max(20, side * 0.5 - 90 * k) : -200 * k + ((t % LOOP) / LOOP) * span,",
    replace: "const x = red ? Math.max(20, side * 0.5 - 90 * k) : X0 - 200 * k + ((t % LOOP) / LOOP) * span,",
  },
  {
    why: "(same) forklift drawn until it has left the page",
    find: "if (x > -220 * k && x < W + 20) {",
    replace: "if (x > X0 - 220 * k && x < X1 + 20) {",
  },
  {
    why: "Industries › Industrial: the excavator enters and leaves beyond the page edges, still crossing the box half a loop after the forklift",
    find: "const sp2 = W + 300 * k, fX = (W / 2 + 120 * k) / span, gX = (W / 2 + 40 + 60 * k) / sp2, te0 = fX * LOOP + LOOP / 2 - gX * LOOP;",
    replace: "const sp2 = X1 - X0 + 300 * k, fX = (W / 2 - X0 + 120 * k) / span, gX = (X1 - W / 2 + 40 + 60 * k) / sp2, te0 = fX * LOOP + LOOP / 2 - gX * LOOP;",
  },
  {
    why: "(same) excavator position",
    find: "ex = red ? W - Math.max(20, side * 0.5) - 60 * k : W + 40 - ph2 * sp2,",
    replace: "ex = red ? W - Math.max(20, side * 0.5) - 60 * k : X1 + 40 - ph2 * sp2,",
  },
  {
    why: "(same) excavator drawn until it has left the page",
    find: "if (ex > -200 * k && ex < W + 60) {",
    replace: "if (ex > X0 - 200 * k && ex < X1 + 60) {",
  },
  {
    why: "Industries › Any physical product: sliding crates enter from beyond the right page edge",
    find: "if (sl[2] === 0) x = sl[0] + (W + 40 - sl[0]) * (1 - outBack(p));",
    replace: "if (sl[2] === 0) x = sl[0] + (X1 + 40 - sl[0]) * (1 - outBack(p));",
  },

  /* ---------- 3. Act 1 plane scene: clouds behind the plane ----------
     The plane fills the scene buffer from its fin (top edge) to its wing tip (bottom
     edge), so there is no band above or below it for a cloud lane at any width; the
     clouds move to the layer behind it instead. Lanes need a smaller plane or a
     taller scene: a design call, flagged in the handoff. */
  {
    why: "Act 1 plane: the front cloud row moves onto the layer behind the plane (drawn before it, same heights, count, speed and dither), so the fuselage, wing and tail cover it instead of it painting over them",
    find:
      "for (let k = 0; k < 4; k++) { const x = (((k * 91 - drift * 0.55) % span) + span) % span - 45; cloud(x, H * (0.1 + 0.1 * (k % 2)), 0.9 + (k % 3) * 0.2, 0.5); }",
    replace:
      "for (let k = 0; k < 4; k++) { const x = (((k * 91 - drift * 0.55) % span) + span) % span - 45; cloud(x, H * (0.1 + 0.1 * (k % 2)), 0.9 + (k % 3) * 0.2, 0.5); }\n" +
      "      for (let k = 0; k < 5; k++) { const x = (((k * 73 - drift * 1.2) % span) + span) % span - 45; cloud(x, H * (0.82 + 0.06 * (k % 2)), 1.1 + (k % 2) * 0.3, 0.62); } // behind the plane",
  },
  {
    why: "(same) the front cloud row no longer draws over the plane",
    find: "\n      for (let k = 0; k < 5; k++) { const x = (((k * 73 - drift * 1.2) % span) + span) % span - 45; cloud(x, H * (0.82 + 0.06 * (k % 2)), 1.1 + (k % 2) * 0.3, 0.62); }\n    } else if (i === 2) {",
    replace: "\n    } else if (i === 2) {",
  },
];

export const templatePatches = [
  {
    why: "Industries: never a horizontal scroll from the full-bleed stage",
    find: '<section id="industries" data-tone="light" data-screen-label="04 Industries" style="position:relative;',
    replace: '<section id="industries" data-tone="light" data-screen-label="04 Industries" style="position:relative;overflow-x:clip;',
  },
];
