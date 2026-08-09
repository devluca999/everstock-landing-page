"use client";

import { useEffect, useRef } from "react";
import { computeResponsive } from "@/lib/responsive";

const TEXT = "EVERSTOCK";
const BASE_SIZE = "clamp(56px, 13.2vw, 208px)";
const GRAD =
  "linear-gradient(180deg,var(--es-ink,#FAF9F5) 0%,var(--es-ink,#FAF9F5) 38%,var(--es-grad-mid,#8A8D93) 76%,var(--es-grad-end,#55585F) 100%)";

const FONTS = [
  { name: "var(--font-space), 'Space Grotesk', sans-serif", weight: 700, ls: "-0.03em", scale: 1, pick: 0.46, hold: [3000, 4000] },
  { name: "var(--font-unbounded), 'Unbounded', sans-serif", weight: 700, ls: "-0.012em", scale: 0.68, pick: 0.18, hold: [1600, 2500] },
  { name: "var(--font-anton), 'Anton', sans-serif", weight: 400, ls: "0.005em", scale: 1.16, pick: 0.18, hold: [1700, 2600] },
  { name: "var(--font-syne), 'Syne', sans-serif", weight: 800, ls: "-0.02em", scale: 0.62, pick: 0.18, hold: [1600, 2600] },
] as const;

/**
 * The EVERSTOCK hero title. System 1: continuous base font-cycle. System 2:
 * occasional effect layer (reveal/ambient + rare Fuzzy/Particle) — desktop only.
 * Always-on: CSS sheen sweep + edge-trace overlays. Mobile gets a cheap blur-fade
 * entrance; reduced-motion leaves it static. Legible at every frame.
 */
export default function TitleCycle() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const sheenRef = useRef<HTMLSpanElement>(null);
  const traceRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const title = titleRef.current;
    if (!title) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let fontIdx = 0;
    let busy = false;
    let lastRare = 0;
    let dead = false;
    let raf2 = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];
    let isMobile = computeResponsive(window.innerWidth).isMobile;

    const layers = (fn: (el: HTMLElement) => void) =>
      [sheenRef.current, traceRef.current].forEach((l) => l && fn(l));

    const fillGradient = (el: HTMLElement) => {
      el.style.backgroundImage = GRAD;
      el.style.backgroundSize = "100% 100%";
      el.style.webkitBackgroundClip = "text";
      el.style.backgroundClip = "text";
      el.style.webkitTextFillColor = "transparent";
      el.style.color = "transparent";
    };

    const pickFont = () => {
      let total = 0;
      const pool = FONTS.map((f, i) => ({ f, i })).filter((x) => x.i !== fontIdx);
      pool.forEach((x) => (total += x.f.pick));
      let r = Math.random() * total;
      for (const x of pool) {
        r -= x.f.pick;
        if (r <= 0) return x.i;
      }
      return pool[0].i;
    };

    const fitTitle = () => {
      const el = titleRef.current;
      if (!el || !el.parentElement) return;
      const avail = el.parentElement.clientWidth;
      if (!avail) return;
      const wsc = el.scrollWidth;
      if (wsc > avail) {
        const base = parseFloat(getComputedStyle(el).fontSize);
        el.style.fontSize = (base * (avail / wsc) * 0.985).toFixed(2) + "px";
      }
    };

    const syncLayers = () => {
      const el = titleRef.current;
      if (!el) return;
      const cs = getComputedStyle(el);
      layers((l) => {
        l.style.fontFamily = cs.fontFamily;
        l.style.fontWeight = cs.fontWeight;
        l.style.letterSpacing = cs.letterSpacing;
        l.style.fontSize = cs.fontSize;
      });
    };

    const applyFont = (idx: number) => {
      const el = titleRef.current;
      if (!el) return;
      const f = FONTS[idx];
      el.style.fontFamily = f.name;
      el.style.fontWeight = String(f.weight);
      el.style.letterSpacing = f.ls;
      el.style.fontSize = `calc(${BASE_SIZE} * ${f.scale})`;
      fontIdx = idx;
      fitTitle();
      syncLayers();
    };

    const setLayerVis = (v: number) =>
      layers((l) => {
        l.style.transition = "opacity 300ms ease";
        l.style.opacity = String(v);
      });

    const wait = (ms: number) => new Promise<void>((r) => timers.push(setTimeout(r, ms)));

    const tween = (dur: number, fn: (p: number) => void) =>
      new Promise<void>((res) => {
        const s = performance.now();
        const step = (n: number) => {
          if (dead) return res();
          const p = Math.min(1, (n - s) / dur);
          fn(p);
          if (p < 1) raf2 = requestAnimationFrame(step);
          else res();
        };
        raf2 = requestAnimationFrame(step);
      });

    const chars = () => {
      const el = titleRef.current!;
      el.textContent = "";
      return [...TEXT].map((ch) => {
        const s = document.createElement("span");
        s.textContent = ch;
        s.style.display = "inline-block";
        s.style.willChange = "transform,opacity,filter";
        fillGradient(s);
        el.appendChild(s);
        return s;
      });
    };

    const plain = () => {
      const el = titleRef.current;
      if (!el) return;
      el.textContent = TEXT;
      el.style.filter = "";
      el.style.opacity = "1";
      el.style.transform = "";
      el.style.clipPath = "";
      el.style.textShadow = "";
      el.style.background = "";
      el.style.webkitBackgroundClip = "";
      el.style.backgroundClip = "";
      el.style.webkitTextFillColor = "";
      el.style.webkitTextStroke = "";
      fillGradient(el);
    };

    /* ---------- effects ---------- */
    const fxShuffle = async () => {
      const G = "ACDEFHKMNORSTVXZ0248#/";
      const cs = chars();
      const target = [...TEXT];
      const start = performance.now();
      await tween(1000, () => {
        const n = performance.now();
        cs.forEach((s, i) => {
          const lockAt = 0.12 + (i / cs.length) * 0.72;
          const p = Math.min(1, (n - start) / 1000);
          if (p >= lockAt) {
            s.textContent = target[i];
            s.style.opacity = "1";
          } else {
            const tick = Math.floor((n - start) / 52);
            if (tick !== (s as { _tick?: number })._tick) {
              (s as { _tick?: number })._tick = tick;
              s.textContent = target[i] === " " ? " " : G[Math.floor(Math.random() * G.length)];
              s.style.opacity = "0.72";
            }
          }
        });
      });
      cs.forEach((s, i) => {
        s.textContent = target[i];
        s.style.opacity = "1";
      });
      await wait(500);
    };

    const fxType = async () => {
      const cs = chars();
      cs.forEach((s) => (s.style.opacity = "0"));
      for (let i = 0; i < cs.length; i++) {
        cs[i].style.opacity = "1";
        await wait(72);
      }
      await wait(700);
    };

    const fxSplitFlap = async () => {
      const G = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const cs = chars();
      const target = [...TEXT];
      cs.forEach((s) => (s.style.transformStyle = "preserve-3d"));
      await Promise.all(
        cs.map(async (s, i) => {
          await wait(i * 58);
          for (let f = 0; f < 4; f++) {
            s.style.transition = "transform 70ms linear";
            s.style.transform = "rotateX(-88deg)";
            await wait(72);
            s.textContent = f === 3 ? target[i] : G[Math.floor(Math.random() * G.length)];
            s.style.transition = "none";
            s.style.transform = "rotateX(88deg)";
            await wait(16);
            s.style.transition = "transform 70ms linear";
            s.style.transform = "rotateX(0deg)";
            await wait(74);
          }
        })
      );
      await wait(500);
    };

    const fxMask = async () => {
      const el = titleRef.current!;
      el.style.transition = "none";
      el.style.clipPath = "inset(0 100% 0 0)";
      await wait(30);
      await tween(760, (p) => {
        const e = 1 - Math.pow(1 - p, 3);
        el.style.clipPath = "inset(0 " + (100 - e * 100).toFixed(2) + "% 0 0)";
      });
      await wait(600);
    };

    const fxShiny = async () => {
      const el = titleRef.current!;
      const ink = getComputedStyle(el).color;
      el.style.background = "linear-gradient(100deg," + ink + " 34%, rgba(255,255,255,0.98) 50%," + ink + " 66%)";
      el.style.backgroundSize = "260% 100%";
      el.style.webkitBackgroundClip = "text";
      el.style.backgroundClip = "text";
      el.style.webkitTextFillColor = "transparent";
      await tween(2400, (p) => {
        const c = (p * 2) % 1;
        el.style.backgroundPosition = (140 - c * 280).toFixed(1) + "% 0";
      });
    };

    const fxStroke = async () => {
      const el = titleRef.current!;
      const ink = getComputedStyle(el).color;
      await tween(2600, (p) => {
        const s = (Math.sin(p * Math.PI * 4 - Math.PI / 2) + 1) / 2;
        el.style.webkitTextStroke = (0.6 + s * 1.6).toFixed(2) + "px " + ink;
        el.style.webkitTextFillColor = "rgba(0,0,0,0)";
        el.style.opacity = (0.72 + (1 - s) * 0.28).toFixed(2);
      });
      el.style.webkitTextFillColor = "";
      el.style.webkitTextStroke = "";
    };

    const fxWarp = async () => {
      const el = titleRef.current!;
      el.style.transition = "none";
      await tween(2600, (p) => {
        const a = Math.sin(p * Math.PI * 3);
        const fade = Math.sin(Math.min(1, p * 6)) * Math.sin(Math.min(1, (1 - p) * 6));
        el.style.transform =
          "skewX(" + (a * 4.5 * fade).toFixed(2) + "deg) scaleY(" + (1 + a * 0.05 * fade).toFixed(3) + ") scaleX(" + (1 - a * 0.02 * fade).toFixed(3) + ")";
      });
      el.style.transform = "";
    };

    const fxEcho = async () => {
      const el = titleRef.current!;
      const ink = getComputedStyle(el).color;
      const soft = ink.replace("rgb(", "rgba(").replace(")", ", 0.20)");
      await tween(2400, (p) => {
        const a = Math.sin(p * Math.PI * 2) * Math.sin(Math.min(1, p * 5)) * Math.sin(Math.min(1, (1 - p) * 5));
        const d = a * 16;
        el.style.textShadow = [1, 2, 3]
          .map((k) => (d * k).toFixed(1) + "px 0 0 " + soft.replace("0.20", (0.2 / k).toFixed(2)))
          .join(",");
      });
      el.style.textShadow = "";
    };

    const fxDepth = async () => {
      const el = titleRef.current!;
      const nLayers = 7;
      await tween(2500, (p) => {
        const a = Math.sin(p * Math.PI * 2) * Math.sin(Math.min(1, p * 5)) * Math.sin(Math.min(1, (1 - p) * 5));
        const out: string[] = [];
        for (let k = 1; k <= nLayers; k++) {
          out.push((a * k * 1.7).toFixed(1) + "px " + (a * k * 1.1).toFixed(1) + "px 0 rgba(128,128,132," + (0.19 - k * 0.022).toFixed(3) + ")");
        }
        el.style.textShadow = out.join(",");
      });
      el.style.textShadow = "";
    };

    const fxFuzzy = async () => {
      const cs = chars();
      await tween(1700, (p) => {
        const amp = Math.sin(Math.min(1, p * 4)) * Math.sin(Math.min(1, (1 - p) * 4));
        cs.forEach((s) => {
          s.style.transform = "translate(" + ((Math.random() - 0.5) * 5 * amp).toFixed(2) + "px," + ((Math.random() - 0.5) * 5 * amp).toFixed(2) + "px)";
          s.style.filter = "blur(" + (Math.random() * 1.1 * amp).toFixed(2) + "px)";
          s.style.opacity = (1 - Math.random() * 0.2 * amp).toFixed(2);
        });
      });
    };

    const fxParticle = async () => {
      const cs = chars();
      const seeds = cs.map(() => ({ x: (Math.random() - 0.5) * 46, y: (Math.random() - 0.5) * 34, r: (Math.random() - 0.5) * 14 }));
      await tween(1500, (p) => {
        const e = Math.pow(1 - p, 2.6);
        cs.forEach((s, i) => {
          s.style.transform = "translate(" + (seeds[i].x * e).toFixed(2) + "px," + (seeds[i].y * e).toFixed(2) + "px) rotate(" + (seeds[i].r * e).toFixed(2) + "deg)";
          s.style.opacity = (1 - e * 0.55).toFixed(3);
          s.style.filter = "blur(" + (e * 2.2).toFixed(2) + "px)";
        });
      });
      cs.forEach((s) => {
        s.style.transform = "";
        s.style.opacity = "1";
        s.style.filter = "";
      });
      await wait(320);
    };

    const EFFECTS: Record<string, () => Promise<void>> = {
      shuffle: fxShuffle, type: fxType, splitflap: fxSplitFlap, mask: fxMask,
      shiny: fxShiny, stroke: fxStroke, warp: fxWarp, echo: fxEcho, depth: fxDepth,
      fuzzy: fxFuzzy, particle: fxParticle,
    };

    const scheduleEffect = () => {
      timers.push(setTimeout(() => fireEffect(), 20000 + Math.random() * 20000));
    };

    const fireEffect = async () => {
      if (dead) return;
      if (isMobile) { busy = false; return; }
      if (busy) { timers.push(setTimeout(() => fireEffect(), 1500)); return; }
      const now = performance.now();
      const reveal = ["shuffle", "type", "splitflap", "mask"];
      const ambient = ["shiny", "stroke", "warp", "echo", "depth"];
      const rare = ["fuzzy", "particle"];
      const r = Math.random();
      let pool = reveal;
      if (r > 0.9 && now - lastRare > 60000) { pool = rare; lastRare = now; }
      else if (r > 0.6) pool = ambient;
      const name = pool[Math.floor(Math.random() * pool.length)];
      busy = true;
      setLayerVis(0);
      try {
        await EFFECTS[name]();
      } catch {
        /* keep the page alive */
      }
      plain();
      syncLayers();
      setLayerVis(1);
      busy = false;
      scheduleEffect();
    };

    const startBaseCycle = () => {
      const step = () => {
        if (dead) return;
        if (busy) { timers.push(setTimeout(step, 600)); return; }
        const next = pickFont();
        const el = titleRef.current;
        if (!el) return;
        el.style.transition = "filter 210ms ease, opacity 210ms ease, transform 210ms ease";
        el.style.filter = "blur(5px)";
        el.style.opacity = "0.42";
        el.style.transform = "scale(0.968)";
        layers((l) => {
          l.style.transition = "filter 210ms ease, opacity 210ms ease, transform 210ms ease";
          l.style.filter = "blur(5px)";
          l.style.opacity = "0";
          l.style.transform = "scale(0.968)";
        });
        timers.push(
          setTimeout(() => {
            applyFont(next);
            el.style.filter = "blur(0px)";
            el.style.opacity = "1";
            el.style.transform = "scale(1)";
            layers((l) => {
              l.style.filter = "blur(0px)";
              l.style.opacity = "1";
              l.style.transform = "scale(1)";
            });
            const hold = FONTS[next].hold;
            timers.push(setTimeout(step, hold[0] + Math.random() * (hold[1] - hold[0])));
          }, 220)
        );
      };
      const h = FONTS[fontIdx].hold;
      timers.push(setTimeout(step, h[0] + Math.random() * (h[1] - h[0])));
    };

    const entranceMobile = async () => {
      const el = titleRef.current;
      if (!el) return;
      el.style.transition = "none";
      el.style.filter = "blur(9px)";
      el.style.opacity = "0";
      el.style.transform = "scale(0.985)";
      await wait(30);
      el.style.transition = "filter 620ms ease, opacity 620ms ease, transform 620ms ease";
      el.style.filter = "blur(0px)";
      el.style.opacity = "1";
      el.style.transform = "scale(1)";
      await wait(660);
    };

    const entrance = async () => {
      busy = true;
      setLayerVis(0);
      if (isMobile) await entranceMobile();
      else await fxParticle();
      syncLayers();
      setLayerVis(1);
      busy = false;
      startBaseCycle();
      if (!isMobile) scheduleEffect();
    };

    // boot
    fillGradient(title);
    const bootTimers = [
      setTimeout(() => applyFont(fontIdx), 400),
      setTimeout(() => setLayerVis(1), 700),
    ];
    bootTimers.forEach((t) => timers.push(t));
    if (document.fonts?.ready) document.fonts.ready.then(() => applyFont(fontIdx));
    if (!reduced) timers.push(setTimeout(() => entrance(), 900));

    const onResize = () => {
      isMobile = computeResponsive(window.innerWidth).isMobile;
      applyFont(fontIdx);
    };
    window.addEventListener("resize", onResize);

    return () => {
      dead = true;
      cancelAnimationFrame(raf2);
      timers.forEach(clearTimeout);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const shared: React.CSSProperties = {
    fontFamily: "var(--font-space), 'Space Grotesk', sans-serif",
    fontWeight: 700,
    fontSize: BASE_SIZE,
    lineHeight: 0.92,
    letterSpacing: "-0.03em",
    whiteSpace: "nowrap",
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "clamp(90px, 17vw, 240px)",
      }}
    >
      <div aria-hidden style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", zIndex: 2 }}>
        <span
          ref={sheenRef}
          style={{
            ...shared,
            color: "transparent",
            backgroundImage:
              "linear-gradient(102deg,rgba(255,255,255,0) 41%,rgba(255,255,255,0.5) 47%,rgba(255,255,255,0.95) 50%,rgba(255,255,255,0.5) 53%,rgba(255,255,255,0) 59%)",
            backgroundSize: "300% 100%",
            backgroundRepeat: "no-repeat",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            opacity: 0,
            animation: "esSheen 7.4s linear infinite",
          }}
        >
          {TEXT}
        </span>
      </div>
      <div aria-hidden style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", zIndex: 3 }}>
        <span
          ref={traceRef}
          style={{
            ...shared,
            color: "transparent",
            WebkitTextStroke: "1.1px #2E7BFF",
            filter: "drop-shadow(0 0 6px rgba(11,95,255,0.75))",
            WebkitMaskImage: "linear-gradient(96deg,transparent 38%,#000 46%,#000 54%,transparent 62%)",
            maskImage: "linear-gradient(96deg,transparent 38%,#000 46%,#000 54%,transparent 62%)",
            WebkitMaskSize: "300% 100%",
            maskSize: "300% 100%",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            opacity: 0,
            animation: "esTrace 11.5s cubic-bezier(0.5,0,0.5,1) infinite, esTraceTint 47s linear infinite",
          }}
        >
          {TEXT}
        </span>
      </div>
      <h1
        ref={titleRef}
        style={{
          ...shared,
          margin: 0,
          color: "transparent",
          backgroundImage: GRAD,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textShadow: "var(--es-glow)",
          willChange: "filter,opacity,transform",
        }}
      >
        {TEXT}
      </h1>
    </div>
  );
}
