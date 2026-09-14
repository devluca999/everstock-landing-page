"use client";

import { useEffect, useRef } from "react";
import { CAM, projector, type Pt } from "@/lib/heroFloor";

type Flag = "blue" | "pass" | "deny" | null;
type Crate = {
  t: number;
  u: number;
  flag: Flag;
  ft: number;
  glow: number;
  alpha: number;
  scanned: boolean;
  sz: number;
  held?: boolean;
  pos?: { t: number; u: number; h: number };
};
type CraneState = "rest" | "armed" | "travel" | "stop" | "hold" | "descend" | "grip" | "settle" | "lift" | "resume";
type Crane = {
  state: CraneState;
  tm: number;
  y: number;
  jaw: number;
  target: Crate | null;
  ys: number;
  js: number;
  bs: number;
  dHold: number;
  dDown: number;
  dGrip: number;
  dSet: number;
  dUp: number;
  dMin: number;
};

const FRAME_MS = 31; // the floor is atmosphere: ~30fps is plenty and halves its cost
const TF = 30, TN = -2.1, FLOOR = -0.8, SK = -0.2, GATE = 3.2;
const BELT = 0.55, HIGH = 3.4, PICK_T = 1.6;

const newCrate = (t: number): Crate => ({
  t,
  u: -0.9 + Math.random() * 1.8,
  flag: null,
  ft: 0,
  glow: 0,
  alpha: 1,
  scanned: t < 3.6,
  sz: 0.74 + Math.random() * 0.58,
});

/**
 * Hero floor (ported from the v2 design): a blurred perspective conveyor under the
 * lattice — deck, rollers, sodium pools, a scanner gate that always looks blue, crates
 * that pick up a transient green (pass) or deep-orange (deny) glow that dissipates to
 * exactly zero, and an articulated pick-and-place arm that stops the belt and lifts
 * the denied crate out of frame. Drawn at 1/5 resolution into an offscreen scene, then
 * composited into ONE plain canvas: a near-sharp pass, a heavier-blur pass confined to
 * the outer zone by a radial weight, and the horizontal/vertical fades that hand the
 * field off to the solid graphite on the left. All of that is baked into the small
 * buffer, so the element itself carries no CSS mask, filter or blend: two masked
 * full-viewport canvases refreshing 30 times a second were the hero's dominant cost.
 * The solid field / scrim layers are plain CSS.
 *
 * Runtime rules: ~30fps cap, paused while the tab is hidden or the hero is scrolled
 * away, one static frame under prefers-reduced-motion. Browsers without canvas
 * `ctx.filter` (Safari) skip the blur passes; the 5x upscale is already soft.
 */
export default function HeroFloor() {
  const aRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const a = aRef.current;
    if (!a) return;
    const A = a.getContext("2d");
    if (!A) return;
    const scene = document.createElement("canvas");
    const g = scene.getContext("2d");
    const soft = document.createElement("canvas"); // the blur pass, radially weighted
    const T = soft.getContext("2d");
    if (!g || !T) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // feature-detect canvas filters without letting TS narrow the context to `never`
    const canvasFilter = typeof (A as unknown as { filter?: unknown }).filter === "string";

    let crates: Crate[] = [];
    const cr: Crane = { state: "rest", tm: 0, y: 0, jaw: 0, target: null, ys: 0, js: 0, bs: 0, dHold: 0.6, dDown: 1.7, dGrip: 0.5, dSet: 0.5, dUp: 1.8, dMin: 2.8 };
    let beltK = 1, restDur = 6.4, cluster = 2, nextSpawn = 0, lastF = 0, beltPhase = 0, beltAngle = 0;
    let raf = 0, lastDraw = 0, dead = false;
    // seed the visible range with loose clusters: two or three close together, then a gap
    for (let t = 2.5, gap = 0; t < 27; t += (gap = gap ? 0 : 1) ? 2.2 + Math.random() * 0.6 : 4.8 + Math.random() * 2.4) crates.push(newCrate(t));

    const size = () => {
      // one shared scale (1/5, floored so tiny viewports keep a usable buffer) so the buffer
      // keeps the viewport's aspect: the lattice cutout is computed at viewport size and the
      // two have to line up
      const vw = window.innerWidth, vh = window.innerHeight;
      const k = Math.max(1 / 5, 96 / vw, 64 / vh);
      const W = Math.round(vw * k), H = Math.round(vh * k);
      a.width = scene.width = soft.width = W;
      a.height = scene.height = soft.height = H;
      if (reduced) draw(performance.now());
    };

    const draw = (now: number) => {
      const W = scene.width, H = scene.height;
      const dt = reduced ? 0 : Math.min(0.06, (now - (lastF || now)) / 1000);
      lastF = now;
      const { HW, HORIZON } = CAM;
      const HY = HORIZON * H;
      const P = projector(W, H);
      const poly = (pts: Pt[], fill: string | CanvasGradient) => {
        g.fillStyle = fill;
        g.beginPath();
        g.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) g.lineTo(pts[i].x, pts[i].y);
        g.closePath();
        g.fill();
      };
      const line = (p: { x: number; y: number }, q: { x: number; y: number }, stroke: string, w: number) => {
        g.strokeStyle = stroke;
        g.lineWidth = w;
        g.beginPath();
        g.moveTo(p.x, p.y);
        g.lineTo(q.x, q.y);
        g.stroke();
      };
      g.globalCompositeOperation = "source-over";
      g.clearRect(0, 0, W, H);

      /* --- simulation --- */
      if (dt > 0) {
        const bs = beltK;
        nextSpawn -= dt * bs;
        if (nextSpawn <= 0) {
          crates.push(newCrate(28));
          // rhythm with irregularity inside it: a cluster, then a stretch of empty belt
          if (cluster > 0) { cluster--; nextSpawn = 2.05 + Math.random() * 0.6; }
          else { cluster = Math.random() < 0.6 ? 1 + Math.round(Math.random()) : 0; nextSpawn = 4.6 + Math.random() * 2.8; }
        }
        beltPhase = (beltPhase + BELT * bs * dt) % 0.45;
        beltAngle = (beltAngle + (BELT * bs * dt) / 0.09) % (Math.PI * 2);
        const heldOut = crates.some((o) => o.flag === "deny");
        for (const c of crates) {
          if (c.held) continue;
          c.t -= BELT * bs * dt;
          if (c.flag) c.ft += dt;
          // every crate is read as it crosses the gate: blue is transient ("being checked");
          // the gate's own light is always blue — it looks the same way at everything
          if (!c.scanned && c.t < GATE + 0.4) { c.scanned = true; c.flag = "blue"; c.ft = 0; c.glow = 1; }
          if (c.flag === "blue" && c.ft > 0.7) {
            // the outcome colours the CRATE, not the scan: green passes, deep orange is denied
            if (cr.state === "armed" && !heldOut) { c.flag = "deny"; c.ft = 0; c.glow = 1; cr.state = "travel"; cr.tm = 0; cr.target = c; }
            else { c.flag = "pass"; c.ft = 0; c.glow = 1; }
          }
          // both outcomes dissipate to exactly zero; the denial lingers about twice as long
          if (c.flag === "pass" || c.flag === "deny") {
            const dur = c.flag === "deny" ? 2 : 1;
            c.glow = Math.max(0, 1 - c.ft / dur);
            if (c.ft >= dur) { c.flag = null; c.glow = 0; }
          }
        }
        crates = crates.filter((c) => c.t > TN + 0.3 && c.alpha > 0.02);
        if (cr.target && !crates.includes(cr.target)) { cr.target = null; if (cr.state === "travel") { cr.state = "rest"; cr.tm = 0; } }
        /* --- the arm. One deliberate beat: the belt eases to a stop, the gripper comes
           down around the denied crate, closes on it and takes it up out of frame. --- */
        cr.tm += dt;
        const eio = (k: number) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
        if (cr.state === "rest") {
          beltK = 1; cr.y = 0; cr.jaw = 0;
          if (cr.tm >= restDur) {
            cr.state = "armed"; cr.tm = 0;
            // jittered so the viewer cannot anticipate the next denial
            restDur = 5.4 + Math.random() * 4.2;
            cr.dHold = 0.45 + Math.random() * 0.45; cr.dDown = 1.5 + Math.random() * 0.55; cr.dGrip = 0.42 + Math.random() * 0.16;
            cr.dSet = 0.34 + Math.random() * 0.32; cr.dUp = 1.55 + Math.random() * 0.5; cr.dMin = 2.2 + Math.random() * 1.6;
          }
        } else if (cr.state === "travel") {
          if (cr.target && cr.target.t <= PICK_T && cr.tm >= cr.dMin) { cr.state = "stop"; cr.tm = 0; }
        } else if (cr.state === "stop") {
          const k = Math.min(1, cr.tm / 0.5); beltK = (1 - k) * (1 - k);
          if (k >= 1) { beltK = 0; cr.state = "hold"; cr.tm = 0; }
        } else if (cr.state === "hold") {
          if (cr.tm >= cr.dHold) { cr.state = "descend"; cr.tm = 0; }
        } else if (cr.state === "descend") {
          const k = Math.min(1, cr.tm / cr.dDown); cr.y = eio(k);
          if (k >= 1 && cr.ys > 0.96) { cr.state = "grip"; cr.tm = 0; }
        } else if (cr.state === "grip") {
          cr.jaw = Math.min(1, cr.tm / cr.dGrip);
          if (cr.tm >= cr.dGrip) { if (cr.target) cr.target.held = true; cr.state = "settle"; cr.tm = 0; }
        } else if (cr.state === "settle") {
          if (cr.tm >= cr.dSet) { cr.state = "lift"; cr.tm = 0; }
        } else if (cr.state === "lift") {
          const k = Math.min(1, cr.tm / cr.dUp); cr.y = 1 - 2.9 * k * k;
          if (k >= 1) { if (cr.target) cr.target.alpha = 0; cr.target = null; cr.jaw = 0; cr.y = 0; cr.state = "resume"; cr.tm = 0; }
        } else if (cr.state === "resume") {
          const k = Math.min(1, cr.tm / 0.7); beltK = k * k * (3 - 2 * k);
          if (k >= 1) { beltK = 1; cr.state = "rest"; cr.tm = 0; }
        }
        // fluid follow: frame-rate-independent exponential smoothing (a stiff spring blows up at
        // 30fps), plus a laggier boom so the shoulder leads and the gripper trails it
        cr.ys += (cr.y - cr.ys) * (1 - Math.exp(-dt * 13));
        cr.js += (cr.jaw - cr.js) * (1 - Math.exp(-dt * 17));
        cr.bs += (cr.ys - cr.bs) * (1 - Math.exp(-dt * 6.5));
        // the gripped crate rides with the jaws, straight up the screen
        if (cr.target && cr.target.held) { const c = cr.target; c.pos = { t: c.t, u: c.u, h: HIGH + (0.12 * c.sz - HIGH) * cr.ys - 0.12 * c.sz }; }
      }
      const scanning = crates.some((c) => c.flag === "blue" && c.ft < 0.6);
      // the floor palette is fixed (warm + steel), but its blue signal light reads as a flat
      // block over the light field, so the emissive passes sit back in light theme
      const light = document.documentElement.dataset.theme === "light";
      const EM = light ? 0.55 : 1;

      /* --- floor plane: everything below the horizon that is not deck --- */
      const fg = g.createLinearGradient(0, HY, 0, H);
      fg.addColorStop(0, "rgba(34,29,24,0)"); fg.addColorStop(0.12, "#221D18"); fg.addColorStop(1, "#2A2420");
      g.fillStyle = fg; g.fillRect(0, HY, W, H - HY);
      // contact shadow under the near rail
      const s0 = P(1, HW, FLOOR), s1 = P(1, HW + 0.7, FLOOR);
      const sh = g.createLinearGradient(s0.x, s0.y, s1.x, s1.y); sh.addColorStop(0, "rgba(0,0,0,0.65)"); sh.addColorStop(1, "rgba(0,0,0,0)");
      poly([P(TF, HW, FLOOR), P(TN, HW, FLOOR), P(TN, HW + 0.7, FLOOR), P(TF, HW + 0.7, FLOOR)], sh);
      // legs with feet + cross braces, straight up in screen space
      let prev: { base: Pt; top: Pt } | null = null;
      for (let t = TN + 0.5; t < TF; t += 2.2) {
        const base = P(t, HW, FLOOR), top = P(t, HW, SK), w = Math.max(0.6, 0.07 * base.s);
        line(base, top, "rgba(58,60,66,0.95)", w);
        line({ x: base.x - w * 1.4, y: base.y }, { x: base.x + w * 1.4, y: base.y }, "rgba(58,60,66,0.95)", Math.max(0.6, w * 0.7));
        if (prev) { line(prev.top, base, "rgba(58,60,66,0.55)", w * 0.45); line(prev.base, top, "rgba(58,60,66,0.55)", w * 0.45); }
        prev = { base, top };
      }
      // skirt + deck
      poly([P(TF, HW, 0), P(TN, HW, 0), P(TN, HW, SK), P(TF, HW, SK)], "#2B2E34");
      const d0 = P(2, HW), d1 = P(2, -HW);
      const dg = g.createLinearGradient(d0.x, d0.y, d1.x, d1.y);
      dg.addColorStop(0, "#5B5148"); dg.addColorStop(0.3, "#3D414A"); dg.addColorStop(1, "#262A31");
      poly([P(TN, HW), P(TN, -HW), P(TF, -HW), P(TF, HW)], dg);
      // sodium pools: tight pools under each lamp, radius clamped so a near-camera lamp does not
      // wash the whole frame amber when there is nothing on that stretch of belt
      for (const t of [-1, 2.4, 6, 11, 18]) {
        const p = P(t, 0.2), r = Math.min(1.05 * p.s, W * 0.17);
        const lg = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
        lg.addColorStop(0, "rgba(232,168,86,0.34)"); lg.addColorStop(0.5, "rgba(232,168,86,0.1)"); lg.addColorStop(1, "rgba(232,168,86,0)");
        g.fillStyle = lg; g.beginPath(); g.arc(p.x, p.y, r, 0, Math.PI * 2); g.fill();
      }
      // cross-rollers: constant t, even in t, converging to their own vanishing point
      for (let t = TN + 0.2; t < TF; t += 0.9) { const p = P(t, -HW), q = P(t, HW); line(p, q, "rgba(168,182,200,0.4)", Math.max(0.5, 0.05 * q.s)); }
      for (let t = TN + 0.45 - beltPhase; t < TF; t += 0.45) { const p = P(t, -HW), q = P(t, HW); line(p, q, "rgba(0,0,0,0.22)", Math.max(0.4, 0.018 * q.s)); }
      line(P(TF, HW), P(TN, HW), "rgba(232,168,86,0.6)", Math.max(0.6, 0.02 * P(2, HW).s));
      // roller end-caps on the near rail, spinning with the belt
      for (let t = TN + 0.2; t < 16; t += 0.9) {
        const c = P(t, HW + 0.04, -0.09), r = 0.09 * c.s;
        if (r < 1.1) continue;
        g.fillStyle = "#3A3D44"; g.beginPath(); g.arc(c.x, c.y, r, 0, Math.PI * 2); g.fill();
        g.strokeStyle = "rgba(232,168,86,0.7)"; g.lineWidth = Math.max(0.5, r * 0.22);
        g.beginPath(); g.moveTo(c.x - Math.cos(beltAngle) * r * 0.8, c.y - Math.sin(beltAngle) * r * 0.8); g.lineTo(c.x + Math.cos(beltAngle) * r * 0.8, c.y + Math.sin(beltAngle) * r * 0.8); g.stroke();
      }
      // scanner gate: two uprights + crossbar over the belt; its light is always blue
      const gp0 = P(GATE, -HW - 0.15, 0), gp1 = P(GATE, HW + 0.15, 0), gt0 = P(GATE, -HW - 0.15, 1.6), gt1 = P(GATE, HW + 0.15, 1.6);
      line(gp0, gt0, "rgba(138,144,154,0.95)", Math.max(0.8, 0.07 * gp0.s)); line(gp1, gt1, "rgba(138,144,154,0.95)", Math.max(0.8, 0.07 * gp1.s)); line(gt0, gt1, "rgba(138,144,154,0.95)", Math.max(0.8, 0.07 * gp1.s));
      const bc = P(GATE, 0, 1.66), br = Math.max(1, 0.05 * bc.s);
      g.fillStyle = scanning ? "#5B9BFF" : "rgba(62,125,255,0.45)"; g.beginPath(); g.arc(bc.x, bc.y, br, 0, Math.PI * 2); g.fill();
      if (scanning) { const gg = g.createLinearGradient(gt0.x, gt0.y, gp0.x, gp0.y); gg.addColorStop(0, `rgba(62,125,255,${(0.5 * EM).toFixed(3)})`); gg.addColorStop(1, "rgba(62,125,255,0)"); poly([gt0, gt1, gp1, gp0], gg); }

      /* --- crates, far to near, after the deck so nothing clips them --- */
      const drawCrate = (c: Crate) => {
        const HS = 0.4 * c.sz, CH = 0.8 * c.sz, ct = c.pos ? c.pos.t : c.t, u = c.pos ? c.pos.u : c.u, h0 = c.pos ? c.pos.h : 0, gl = (c.glow || 0) * EM;
        g.globalAlpha = c.alpha;
        if (gl > 0.01) {
          const col = c.flag === "deny" ? "196,102,32" : c.flag === "pass" ? "62,170,132" : "62,125,255";
          const pc = P(ct, u, h0 + CH * 0.5), r = Math.min(1.25 * pc.s * c.sz, W * 0.26);
          const fgl = g.createRadialGradient(pc.x, pc.y, 0, pc.x, pc.y, r);
          fgl.addColorStop(0, `rgba(${col},${(0.72 * gl).toFixed(3)})`); fgl.addColorStop(0.45, `rgba(${col},${(0.22 * gl).toFixed(3)})`); fgl.addColorStop(1, `rgba(${col},0)`);
          g.fillStyle = fgl; g.beginPath(); g.arc(pc.x, pc.y, r, 0, Math.PI * 2); g.fill();
        }
        const END = [P(ct - HS, u - HS, h0), P(ct - HS, u + HS, h0), P(ct - HS, u + HS, h0 + CH), P(ct - HS, u - HS, h0 + CH)];
        const FRONT = [P(ct - HS, u + HS, h0), P(ct + HS, u + HS, h0), P(ct + HS, u + HS, h0 + CH), P(ct - HS, u + HS, h0 + CH)];
        const TOP = [P(ct - HS, u - HS, h0 + CH), P(ct - HS, u + HS, h0 + CH), P(ct + HS, u + HS, h0 + CH), P(ct + HS, u - HS, h0 + CH)];
        poly(END, "#6E5238"); poly(FRONT, "#845F41"); poly(TOP, "#A8845C");
        // strapping + label
        poly([P(ct - HS, u - 0.06, h0 + CH), P(ct - HS, u + 0.06, h0 + CH), P(ct + HS, u + 0.06, h0 + CH), P(ct + HS, u - 0.06, h0 + CH)], "rgba(214,200,172,0.85)");
        poly([P(ct - HS, u - 0.06, h0 + CH), P(ct - HS, u + 0.06, h0 + CH), P(ct - HS, u + 0.06, h0 + CH * 0.62), P(ct - HS, u - 0.06, h0 + CH * 0.62)], "rgba(214,200,172,0.85)");
        poly([P(ct - HS * 0.7, u + HS, h0 + CH * 0.22), P(ct + HS * 0.1, u + HS, h0 + CH * 0.22), P(ct + HS * 0.1, u + HS, h0 + CH * 0.5), P(ct - HS * 0.7, u + HS, h0 + CH * 0.5)], "rgba(232,228,218,0.9)");
        line(P(ct - HS, u, h0 + CH), P(ct + HS, u, h0 + CH), "rgba(70,50,32,0.5)", Math.max(0.4, 0.012 * P(ct, u).s));
        if (gl > 0.01) {
          const t2 = c.flag === "deny" ? `196,102,32,${(0.4 * gl).toFixed(3)}` : c.flag === "pass" ? `62,170,132,${(0.34 * gl).toFixed(3)}` : `62,125,255,${(0.38 * gl).toFixed(3)}`;
          const tint = `rgba(${t2})`; poly(END, tint); poly(FRONT, tint); poly(TOP, tint);
        }
        // warm rim on the lamp-facing edge
        const e0 = P(ct - HS, u + HS, h0), e1 = P(ct - HS, u + HS, h0 + CH);
        line(e0, e1, "rgba(232,168,86,0.6)", Math.max(0.5, 0.03 * e0.s));
        g.globalAlpha = 1;
      };
      const armLive = cr.state !== "rest" && cr.state !== "armed" && cr.state !== "travel";
      const depth = (c: Crate) => (c.pos ? c.pos.t : c.t);
      const sorted = crates.slice().sort((p, q) => depth(q) - depth(p));
      // the arm occupies the target crate's depth: anything in front of that crate must occlude it
      const cutT = armLive && cr.target ? depth(cr.target) : -Infinity;
      const nearer: Crate[] = [];
      for (const c of sorted) { if (depth(c) < cutT - 0.01 && c !== cr.target) nearer.push(c); else drawCrate(c); }

      /* --- the pick-and-place arm, drawn last. It reaches in from the top of the frame (mounted
         off-screen, no floor base): a short swinging boom, then two rigid segments, so three joints
         move through the reach — boom pivot, shoulder and elbow — plus the wrist. A two-finger
         gripper, each finger jointed in two parts, curls inward to enclose the crate. --- */
      if (armLive) {
        const tgt = cr.target, pt = tgt ? tgt.t : PICK_T, pu = tgt ? tgt.u : 0, sz = tgt ? tgt.sz : 1;
        const an = P(pt, pu, 0), ax = an.x, sc = an.s, Y = (h: number) => P(pt, pu, h).y;
        const gripH = HIGH + (0.12 * sz - HIGH) * cr.ys; // world height of the fingertips
        const tipY = Y(gripH);
        if (tipY > -4) {
          /* 2.5D: every part is a stack of strokes rather than one flat bar — an offset back plate
             for thickness, the body, a shaded underside, a cool specular band on the lit side and the
             warm rim. Reads as a cylinder, not a line. */
          const BACK = "#07080A", STEEL = "#181B21", SHADE = "#0C0E12", LIT = "rgba(158,174,196,0.4)", RIM = "rgba(232,168,86,0.6)";
          const PX = 0.055 * sc, PY = 0.07 * sc; // parallax of the far side plate
          type XY = { x: number; y: number };
          const str = (p: XY, q: XY, wpx: number, col: string) => { g.strokeStyle = col; g.lineWidth = Math.max(0.4, wpx); g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(q.x, q.y); g.stroke(); };
          const shf = (p: XY, nx: number, ny: number, d: number): XY => ({ x: p.x + nx * d, y: p.y + ny * d });
          const seg = (p: XY, q: XY, wpx: number) => {
            g.lineCap = "round"; g.lineJoin = "round";
            const dx = q.x - p.x, dy = q.y - p.y, L = Math.hypot(dx, dy) || 1;
            let nx = dy / L, ny = -dx / L;
            if (nx > 0) { nx = -nx; ny = -ny; } // n points to the lamp-facing (screen-left) side
            str({ x: p.x + PX, y: p.y + PY }, { x: q.x + PX, y: q.y + PY }, wpx * 0.96, BACK);
            str(p, q, wpx, STEEL);
            str(shf(p, -nx, -ny, wpx * 0.26), shf(q, -nx, -ny, wpx * 0.26), wpx * 0.34, SHADE);
            str(shf(p, nx, ny, wpx * 0.25), shf(q, nx, ny, wpx * 0.25), wpx * 0.16, LIT);
            str(shf(p, nx, ny, wpx * 0.42), shf(q, nx, ny, wpx * 0.42), wpx * 0.12, RIM);
            // panel lines: two cross-ribs give the casting some texture at rest
            if (L > wpx * 2.4) {
              g.strokeStyle = "rgba(0,0,0,0.5)"; g.lineWidth = Math.max(0.4, wpx * 0.09);
              for (const k of [0.36, 0.64]) {
                const c1 = { x: p.x + dx * k, y: p.y + dy * k };
                g.beginPath(); g.moveTo(c1.x + nx * wpx * 0.44, c1.y + ny * wpx * 0.44); g.lineTo(c1.x - nx * wpx * 0.44, c1.y - ny * wpx * 0.44); g.stroke();
              }
            }
          };
          const hub = (p: XY, r: number) => {
            g.fillStyle = BACK; g.beginPath(); g.arc(p.x + PX * 1.5, p.y + PY * 1.5, r * 0.98, 0, Math.PI * 2); g.fill();
            g.fillStyle = STEEL; g.beginPath(); g.arc(p.x, p.y, r, 0, Math.PI * 2); g.fill();
            g.fillStyle = SHADE; g.beginPath(); g.arc(p.x + r * 0.16, p.y + r * 0.2, r * 0.62, 0, Math.PI * 2); g.fill();
            g.strokeStyle = LIT; g.lineWidth = Math.max(0.4, r * 0.16);
            g.beginPath(); g.arc(p.x, p.y, r * 0.74, Math.PI * 0.75, Math.PI * 1.5); g.stroke();
            g.strokeStyle = RIM; g.lineWidth = Math.max(0.5, r * 0.2);
            g.beginPath(); g.arc(p.x, p.y, r * 0.92, Math.PI * 0.62, Math.PI * 1.32); g.stroke();
          };
          // crate footprint in screen space: what the fingers have to clear, then close on
          const cxs = [P(pt + 0.4 * sz, pu + 0.4 * sz, 0).x, P(pt + 0.4 * sz, pu - 0.4 * sz, 0).x, P(pt - 0.4 * sz, pu + 0.4 * sz, 0).x, P(pt - 0.4 * sz, pu - 0.4 * sz, 0).x];
          const hwS = (Math.max(...cxs) - Math.min(...cxs)) / 2;
          const chS = Math.abs(Y(0) - Y(0.8 * sz));
          const bw = hwS * 1.42, Lf1 = chS * 0.58, Lf2 = hwS * 0.82;
          const curl = 0.07 + Math.asin(Math.min(0.96, (bw - hwS) / Lf2)) * Math.max(0, Math.min(1.06, cr.js));
          // build the gripper upward from the fingertips
          const p1y = tipY - Lf2 * Math.cos(curl), wristBotY = p1y - Lf1;
          const wristLen = 0.24 * sc, Wr = { x: ax, y: wristBotY - wristLen };
          // joint 1: a short boom swings out of the off-screen mount as the arm extends
          const M = { x: ax + 1.55 * sc, y: -2.15 * sc }, Lb = 1.15 * sc;
          const th = 1.6 + 0.52 * Math.max(0, Math.min(1, cr.bs));
          const S = { x: M.x + Math.cos(th) * Lb, y: M.y + Math.sin(th) * Lb };
          // joints 2 + 3: shoulder and elbow, solved as a 2-link chain onto the wrist
          const L1 = 1.75 * sc, L2 = 1.5 * sc;
          const dx = Wr.x - S.x, dy = Wr.y - S.y, dr = Math.hypot(dx, dy) || 1;
          const d = Math.min(Math.max(dr, Math.abs(L1 - L2) + 0.01), L1 + L2 - 0.01);
          const ux = dx / dr, uy = dy / dr;
          const ca = Math.max(-1, Math.min(1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d))), Aa = Math.acos(ca);
          const el = (s2: number) => ({ x: S.x + (ux * Math.cos(s2 * Aa) - uy * Math.sin(s2 * Aa)) * L1, y: S.y + (ux * Math.sin(s2 * Aa) + uy * Math.cos(s2 * Aa)) * L1 });
          const eA = el(1), eB = el(-1), E = eA.x >= eB.x ? eA : eB; // elbow breaks outward, away from frame centre
          // hydraulic ram across the elbow: its length changes with the articulation
          const rmA = { x: S.x + (E.x - S.x) * 0.28, y: S.y + (E.y - S.y) * 0.28 };
          const rmB = { x: E.x + (Wr.x - E.x) * 0.34, y: E.y + (Wr.y - E.y) * 0.34 };
          seg(M, S, 0.3 * sc);
          seg(S, E, 0.27 * sc);
          seg(rmA, rmB, 0.085 * sc);
          seg(E, Wr, 0.22 * sc);
          hub(rmA, 0.055 * sc);
          hub(S, 0.2 * sc);
          hub(E, 0.21 * sc);
          hub(Wr, 0.15 * sc);
          seg({ x: Wr.x, y: Wr.y }, { x: Wr.x, y: wristBotY }, 0.32 * sc);
          // yoke: a horizontal block off the wrist that both fingers hang from
          seg({ x: ax - bw - 0.06 * sc, y: wristBotY }, { x: ax + bw + 0.06 * sc, y: wristBotY }, 0.19 * sc);
          for (const s of [-1, 1]) {
            const bpt = { x: ax + s * bw, y: wristBotY };
            const p1 = { x: bpt.x, y: bpt.y + Lf1 };
            const tp = { x: p1.x - s * Math.sin(curl) * Lf2, y: p1.y + Math.cos(curl) * Lf2 };
            hub(bpt, 0.085 * sc);
            seg(bpt, p1, 0.13 * sc);
            seg(p1, tp, 0.115 * sc);
            hub(p1, 0.075 * sc);
          }
        }
      }
      for (const c of nearer) drawCrate(c);

      /* --- composite, all in the small buffer so the element needs no CSS mask/filter ---
         1. near-sharp pass  2. heavier blur, weighted toward the outer zone by a radial
         gradient (sharpest over the conveyor at ~70%/60%)  3. horizontal + vertical fades
         that dissolve the field into the solid graphite on the left and the section below. */
      A.clearRect(0, 0, W, H);
      if (canvasFilter) { A.filter = "blur(0.6px)"; A.drawImage(scene, 0, 0); A.filter = "none"; }
      else A.drawImage(scene, 0, 0);
      if (canvasFilter) {
        T.globalCompositeOperation = "source-over";
        T.clearRect(0, 0, W, H);
        T.filter = "blur(2.6px)"; T.drawImage(scene, 0, 0); T.filter = "none";
        T.globalCompositeOperation = "destination-in";
        const cx = 0.7 * W, cy = 0.6 * H, rx = 0.44 * W, ry = 0.42 * H;
        T.save();
        T.translate(cx, cy);
        T.scale(rx, ry);
        const rg = T.createRadialGradient(0, 0, 0, 0, 0, 1);
        rg.addColorStop(0, "rgba(0,0,0,0)"); rg.addColorStop(0.55, "rgba(0,0,0,0.55)"); rg.addColorStop(1, "rgba(0,0,0,1)");
        T.fillStyle = rg;
        T.fillRect(-cx / rx, -cy / ry, W / rx, H / ry);
        T.restore();
        A.drawImage(soft, 0, 0);
      }
      A.globalCompositeOperation = "destination-in";
      const hz = A.createLinearGradient(0, 0, W, 0);
      hz.addColorStop(0, "rgba(0,0,0,0)"); hz.addColorStop(0.22, "rgba(0,0,0,0)"); hz.addColorStop(0.46, "rgba(0,0,0,0.55)"); hz.addColorStop(0.68, "rgba(0,0,0,1)");
      A.fillStyle = hz; A.fillRect(0, 0, W, H);
      const vt = A.createLinearGradient(0, 0, 0, H);
      vt.addColorStop(0, "rgba(0,0,0,1)"); vt.addColorStop(0.72, "rgba(0,0,0,1)"); vt.addColorStop(1, "rgba(0,0,0,0)");
      A.fillStyle = vt; A.fillRect(0, 0, W, H);
      A.globalCompositeOperation = "source-over";
    };

    size();
    window.addEventListener("resize", size);
    // the emissive scale follows the theme; under reduced motion the single static frame
    // has to be redrawn when the theme flips, since no loop will do it
    const mo = new MutationObserver(() => { if (reduced) draw(performance.now()); });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    if (!reduced) {
      const loop = (now: number) => {
        if (dead) return;
        // atmosphere only: skip while hidden or once the hero has scrolled away
        if (!document.hidden && window.scrollY < window.innerHeight * 1.15 && now - lastDraw >= FRAME_MS) { lastDraw = now; draw(now); }
        raf = requestAnimationFrame(loop);
      };
      // atmosphere can wait for the main thread to go quiet after hydration
      const start = () => { if (!dead) raf = requestAnimationFrame(loop); };
      const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
      if (w.requestIdleCallback) w.requestIdleCallback(start, { timeout: 1500 });
      else setTimeout(start, 600);
    }
    return () => {
      dead = true;
      cancelAnimationFrame(raf);
      mo.disconnect();
      window.removeEventListener("resize", size);
    };
  }, []);

  return (
    <>
      <div className="v2-floor" aria-hidden="true">
        <canvas ref={aRef} />
        <div className="v2-grain" />
      </div>
      <div className="v2-solid" aria-hidden="true" />
      <div className="v2-scrim" aria-hidden="true" />
    </>
  );
}
