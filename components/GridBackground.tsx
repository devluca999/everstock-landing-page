"use client";

import { useEffect, useRef } from "react";
import { computeResponsive } from "@/lib/responsive";
import { deckFootprint } from "@/lib/heroFloor";

const SPACING = 84;
const TRAIL = 34;
const STEP = 0.084;

type Beam = {
  slot: number;
  h: boolean;
  dir: number;
  line: number;
  u: number;
  speed: number;
  green: boolean;
  bright: number;
  wait: number;
};

/**
 * Hero breathing lattice + agent beams. Ported from the mockup canvas:
 * 2D-only warp (never depth), viewport-interpolated beam count + warp amplitude,
 * capped DPR, reduced-motion static frame, and RAF paused while the tab is hidden
 * or the hero has scrolled away. Frames are transparent (the hero floor shows
 * through) and a soft cutout over the conveyor's footprint quietens the field there.
 */
export default function GridBackground({ beamMax = 26 }: { beamMax?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0,
      h = 0,
      cols = 0,
      rows = 0,
      dpr = 1,
      beamCount = beamMax,
      warpScale = 1,
      prevBeamCount = -1,
      beams: Beam[] = [],
      raf = 0,
      last = 0,
      paused = false,
      dead = false,
      mask: HTMLCanvasElement | null = null;

    const colors = { bg: "#16171B", grid: "rgba(226,222,214,0.11)", additive: true };
    const readColors = () => {
      const cs = getComputedStyle(document.documentElement);
      colors.bg = cs.getPropertyValue("--es-bg").trim() || colors.bg;
      colors.grid = cs.getPropertyValue("--es-grid").trim() || colors.grid;
      colors.additive = (document.documentElement.dataset.theme ?? "graphite") !== "light";
    };

    /* Beam-head glow as a pre-rendered sprite per colour + blend mode instead of a fresh
       radial gradient every frame for every beam: same stops, one drawImage each. */
    const SPRITE = 128; // px, drawn for R = SPRITE/2 and scaled to the live radius
    const makeGlow = (C: number[], HOT: number[], add: boolean) => {
      const c = document.createElement("canvas");
      c.width = c.height = SPRITE;
      const g2 = c.getContext("2d");
      if (!g2) return c;
      const R = SPRITE / 2;
      const g = g2.createRadialGradient(R, R, 0, R, R, R);
      g.addColorStop(0, `rgba(${HOT[0]},${HOT[1]},${HOT[2]},${add ? 0.98 : 0.6})`);
      g.addColorStop(0.18, `rgba(${C[0]},${C[1]},${C[2]},${add ? 0.62 : 0.3})`);
      g.addColorStop(0.5, `rgba(${C[0]},${C[1]},${C[2]},${add ? 0.22 : 0.1})`);
      g.addColorStop(1, `rgba(${C[0]},${C[1]},${C[2]},0)`);
      g2.fillStyle = g;
      g2.fillRect(0, 0, SPRITE, SPRITE);
      return c;
    };
    const BLUE = [56, 122, 255], GREEN = [64, 255, 168], HOT_B = [222, 236, 255], HOT_G = [214, 255, 234];
    const glows = {
      add: { blue: makeGlow(BLUE, HOT_B, true), green: makeGlow(GREEN, HOT_G, true) },
      flat: { blue: makeGlow(BLUE, HOT_B, false), green: makeGlow(GREEN, HOT_G, false) },
    };

    const spawnBeam = (seed: boolean, slot?: number): Beam => {
      const n = Math.max(2, beamCount);
      const s = slot === undefined ? Math.floor(Math.random() * n) : slot;
      const horizontal = s % 2 === 0;
      const BANDS = 4;
      const band = Math.floor(s / 2) % BANDS;
      const lines = Math.max(BANDS + 2, horizontal ? rows : cols);
      const per = Math.max(1, Math.floor(lines / BANDS));
      const line = Math.min(lines - 1, band * per + 1 + Math.floor(Math.random() * Math.max(1, per - 1)));
      const span = horizontal ? cols : rows;
      return {
        slot: s,
        h: horizontal,
        dir: s % 4 < 2 ? 1 : -1,
        line,
        u: seed ? Math.random() * span : 0,
        speed: 0.5 + Math.random() * 0.6,
        green: Math.random() < 0.4,
        bright: 0.74 + Math.random() * 0.34,
        wait: seed ? (s / n) * 3800 + Math.random() * 700 : 400 + Math.random() * 3600,
      };
    };

    /* strictly 2D: x displaces on x only, y on y only — only cell width/height change */
    const warpX = (x: number, t: number) => {
      const cx = w / 2;
      const ws = warpScale;
      const pulse = 1 + Math.sin(t * 0.45) * 0.04 * ws;
      const d =
        (Math.sin(x * 0.0062 + t * 0.37) * 16 +
          Math.sin(x * 0.0131 - t * 0.23) * 10 +
          Math.sin(x * 0.0037 + t * 0.61) * 7) *
        ws;
      return cx + (x + d - cx) * pulse;
    };
    const warpY = (y: number, t: number) => {
      const cy = h / 2;
      const ws = warpScale;
      const pulse = 1 + Math.sin(t * 0.45 + 1.9) * 0.04 * ws;
      const d =
        (Math.cos(y * 0.0074 - t * 0.31) * 15 +
          Math.sin(y * 0.0148 + t * 0.27) * 9 +
          Math.sin(y * 0.0041 - t * 0.53) * 7) *
        ws;
      return cy + (y + d - cy) * pulse;
    };

    /* The canvas's alpha mask, built once per resize at quarter resolution: the fade toward
       the hero's lower edge (so the first solid section reads as a clean cut) times a
       soft-edged cutout over the conveyor's footprint, limited to where the floor is
       actually visible (the solid field hides it on the left), so the lattice + beams stay
       crisp on solid ground and sit back over the busy blurred deck without vanishing.
       Applied with ONE destination-in blit per frame. Never as a CSS mask-image: any mask
       on the element, even the old plain gradient, takes the canvas off the compositor's
       fast path and turns every frame into a long main-thread task. Built without
       ctx.filter (no Safari support): the footprint is drawn off-canvas and only its
       blurred shadow lands. */
    const buildMask = (): HTMLCanvasElement | null => {
      const k = 0.25;
      const mw = Math.max(8, Math.round(w * k)), mh = Math.max(8, Math.round(h * k));
      const cutC = document.createElement("canvas");
      cutC.width = mw;
      cutC.height = mh;
      const cg = cutC.getContext("2d");
      const maskC = document.createElement("canvas");
      maskC.width = mw;
      maskC.height = mh;
      const mg = maskC.getContext("2d");
      if (!cg || !mg) return null;
      const fp = deckFootprint(mw, mh);
      const R = Math.min(mw, mh) * 0.09;
      const OFF = 1e4;
      cg.save();
      cg.shadowColor = "#000";
      cg.shadowBlur = R * 2; // canvas shadowBlur is roughly twice a CSS blur radius
      cg.shadowOffsetX = OFF;
      cg.fillStyle = "#000";
      cg.beginPath();
      cg.moveTo(fp[0].x - OFF, fp[0].y);
      for (let i = 1; i < fp.length; i++) cg.lineTo(fp[i].x - OFF, fp[i].y);
      cg.closePath();
      cg.fill();
      cg.restore();
      cg.globalCompositeOperation = "destination-in";
      const hg = cg.createLinearGradient(0, 0, mw, 0);
      hg.addColorStop(0, "rgba(0,0,0,0)");
      hg.addColorStop(0.26, "rgba(0,0,0,0)");
      hg.addColorStop(0.48, "rgba(0,0,0,0.88)");
      hg.addColorStop(1, "rgba(0,0,0,0.88)");
      cg.fillStyle = hg;
      cg.fillRect(0, 0, mw, mh);
      // mask alpha = fade(y) * (1 - cut alpha)
      const fade = mg.createLinearGradient(0, 0, 0, mh);
      fade.addColorStop(0, "rgba(0,0,0,1)");
      fade.addColorStop(0.68, "rgba(0,0,0,1)");
      fade.addColorStop(1, "rgba(0,0,0,0)");
      mg.fillStyle = fade;
      mg.fillRect(0, 0, mw, mh);
      mg.globalCompositeOperation = "destination-out";
      mg.drawImage(cutC, 0, 0);
      return maskC;
    };
    const applyMask = () => {
      if (!mask) return;
      ctx.globalCompositeOperation = "destination-in";
      ctx.drawImage(mask, 0, 0, w, h);
      ctx.globalCompositeOperation = "source-over";
    };

    const resize = () => {
      const r = computeResponsive(window.innerWidth, beamMax);
      const nextDpr = Math.min(window.devicePixelRatio || 1, r.dprCap);
      // nothing to do unless the buffer actually changes (resize fires on every URL-bar
      // tick on mobile, and each rebuild allocates a full-viewport cutout canvas)
      if (w === window.innerWidth && h === window.innerHeight && dpr === nextDpr) return;
      beamCount = r.beamCount;
      warpScale = r.warpScale;
      dpr = nextDpr;
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      cols = Math.ceil(w / SPACING) + 4;
      rows = Math.ceil(h / SPACING) + 4;
      mask = buildMask();
      if (!reduced && beams.length && beamCount !== prevBeamCount) {
        beams = [];
        for (let i = 0; i < beamCount; i++) beams.push(spawnBeam(true, i));
        prevBeamCount = beamCount;
      }
      if (reduced) drawStatic();
    };

    /* one flat lattice frame for prefers-reduced-motion (no beams, no RAF) */
    const drawStatic = () => {
      const S = SPACING,
        ox = -S * 2,
        oy = -S * 2;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // transparent frames: the page ground + the hero floor (conveyor) show through
      ctx.clearRect(0, 0, w, h);
      const xs: number[] = [],
        ys: number[] = [];
      for (let i = 0; i <= cols; i++) xs.push(warpX(ox + i * S, 0));
      for (let j = 0; j <= rows; j++) ys.push(warpY(oy + j * S, 0));
      ctx.lineWidth = 1;
      ctx.strokeStyle = colors.grid;
      ctx.beginPath();
      for (let j = 0; j <= rows; j++) {
        ctx.moveTo(xs[0], ys[j]);
        ctx.lineTo(xs[cols], ys[j]);
      }
      for (let i = 0; i <= cols; i++) {
        ctx.moveTo(xs[i], ys[0]);
        ctx.lineTo(xs[i], ys[rows]);
      }
      ctx.stroke();
      applyMask();
    };

    const lerpArr = (arr: number[], u: number) => {
      const c = Math.max(0, Math.min(arr.length - 1.0001, u));
      const i0 = Math.floor(c),
        f = c - i0;
      return arr[i0] + (arr[i0 + 1] - arr[i0]) * f;
    };

    // phones: 30fps is plenty for ambient beams, and it halves the per-frame blit + strokes
    // that dominate the throttled main thread there
    const frameMs = window.innerWidth < 1024 ? 31 : 0;
    let lastDraw = 0;
    const frame = (now: number) => {
      if (dead || paused) return;
      if (frameMs && now - lastDraw < frameMs) { raf = requestAnimationFrame(frame); return; }
      lastDraw = now;
      const dt = Math.min(64, now - last) / 1000;
      last = now;
      const t = now * 0.001;
      const S = SPACING,
        ox = -S * 2,
        oy = -S * 2;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // transparent frames: the page ground + the hero floor (conveyor) show through
      ctx.clearRect(0, 0, w, h);

      const tw = t * 0.55;
      const xs: number[] = [],
        ys: number[] = [];
      for (let i = 0; i <= cols; i++) xs.push(warpX(ox + i * S, tw));
      for (let j = 0; j <= rows; j++) ys.push(warpY(oy + j * S, tw));

      ctx.lineWidth = 1;
      ctx.strokeStyle = colors.grid;
      ctx.beginPath();
      for (let j = 0; j <= rows; j++) {
        ctx.moveTo(xs[0], ys[j]);
        ctx.lineTo(xs[cols], ys[j]);
      }
      for (let i = 0; i <= cols; i++) {
        ctx.moveTo(xs[i], ys[0]);
        ctx.lineTo(xs[i], ys[rows]);
      }
      ctx.stroke();

      const add = colors.additive;
      ctx.globalCompositeOperation = add ? "lighter" : "source-over";
      ctx.lineCap = "round";
      for (const b of beams) {
        if (b.wait > 0) {
          b.wait -= dt * 1000;
          continue;
        }
        b.u += b.speed * dt;
        const span = b.h ? cols : rows;
        if (b.u > span + TRAIL * STEP + 2) {
          Object.assign(b, spawnBeam(false, b.slot));
          continue;
        }
        const C = b.green ? [64, 255, 168] : [56, 122, 255];
        const li = Math.min(b.line, b.h ? rows : cols);
        const P = (u: number) => (b.dir < 0 ? span - u : u);
        const pt = (u: number): [number, number] =>
          b.h ? [lerpArr(xs, P(u)), ys[li]] : [xs[li], lerpArr(ys, P(u))];
        let prev: [number, number] | null = null;
        for (let k = TRAIL; k >= 0; k--) {
          const u = b.u - k * STEP;
          if (u < 0) {
            prev = null;
            continue;
          }
          const p = pt(Math.min(u, span));
          if (prev) {
            const f = 1 - k / TRAIL;
            const a = Math.pow(f, 1.9) * (add ? 0.9 : 0.62) * b.bright;
            ctx.strokeStyle = `rgba(${C[0]},${C[1]},${C[2]},${a.toFixed(3)})`;
            ctx.lineWidth = 1 + f * 2.1;
            ctx.beginPath();
            ctx.moveTo(prev[0], prev[1]);
            ctx.lineTo(p[0], p[1]);
            ctx.stroke();
          }
          prev = p;
        }
        const head = pt(Math.min(b.u, span));
        if (
          b.u >= 0 &&
          b.u <= span + 0.4 &&
          head[0] > -80 &&
          head[0] < w + 80 &&
          head[1] > -80 &&
          head[1] < h + 80
        ) {
          const R = 34 * b.bright;
          const sprite = (add ? glows.add : glows.flat)[b.green ? "green" : "blue"];
          ctx.drawImage(sprite, head[0] - R, head[1] - R, R * 2, R * 2);
          ctx.fillStyle = add
            ? "rgba(255,255,255,0.98)"
            : `rgba(${C[0]},${C[1]},${C[2]},0.95)`;
          ctx.beginPath();
          ctx.arc(head[0], head[1], 2.1, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      applyMask();
      raf = requestAnimationFrame(frame);
    };

    readColors();
    resize();
    beams = [];
    if (!reduced) for (let i = 0; i < beamCount; i++) beams.push(spawnBeam(true, i));
    prevBeamCount = beamCount;
    last = performance.now();
    if (reduced) drawStatic();
    else raf = requestAnimationFrame(frame);

    // Variant B: the field lives only behind the hero. Once scrolled well past it the
    // canvas is offscreen (absolute, scrolls away) — pausing the RAF there is pure win.
    let scrolledAway = false;
    const resume = () => {
      if (reduced || paused === false) return;
      if (document.hidden || scrolledAway) return;
      paused = false;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    let resizeRaf = 0;
    const onResize = () => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(resize);
    };
    const onVis = () => {
      if (document.hidden) {
        paused = true;
        cancelAnimationFrame(raf);
      } else {
        resume();
      }
    };
    const onScroll = () => {
      const away = window.scrollY > window.innerHeight * 1.15;
      if (away === scrolledAway) return;
      scrolledAway = away;
      if (away) {
        paused = true;
        cancelAnimationFrame(raf);
      } else {
        resume();
      }
    };
    const onTheme = () => {
      readColors();
      if (reduced) drawStatic();
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVis);
    // re-read colors whenever the theme attribute flips
    const mo = new MutationObserver(onTheme);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    return () => {
      dead = true;
      cancelAnimationFrame(raf);
      cancelAnimationFrame(resizeRaf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVis);
      mo.disconnect();
    };
  }, [beamMax]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="block es-hero-layer"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        zIndex: 0,
        pointerEvents: "none",
        // no CSS mask here: the lower-edge fade + conveyor cutout are baked into the
        // frames (see buildMask). A mask-image on this element forces main-thread paint.
      }}
    />
  );
}
