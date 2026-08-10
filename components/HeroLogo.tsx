"use client";

import { useEffect, useRef } from "react";
import Logo from "./Logo";

// same lemniscate the mark is built on — the beam rides this exact ring path
const PATH =
  "M32 20C28 12 22 8 16 8C8 8 3 13 3 20C3 27 8 32 16 32C22 32 28 28 32 20C36 12 42 8 48 8C56 8 61 13 61 20C61 27 56 32 48 32C42 32 36 28 32 20Z";

/**
 * Hero-only placement of the locked mark. Base construction is unchanged (pure
 * segmented chrome, via <Logo>). Layered on top: a thin beam that runs along the
 * ring's facet seams (blue, occasionally green) — fired ONLY when the title's
 * rare/signature effect layer fires (es:hero-flourish). Nav/favicon never get this.
 * prefers-reduced-motion → a static glow tick instead of a traveling beam.
 */
export default function HeroLogo({ height = 44 }: { height?: number }) {
  const beamRef = useRef<SVGPathElement>(null);
  const width = Math.round((height * 64) / 40);

  useEffect(() => {
    const beam = beamRef.current;
    if (!beam) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let current: Animation | null = null;

    const onFlourish = (e: Event) => {
      const green = (e as CustomEvent).detail?.green === true;
      const color = green ? "#40FFA8" : "#2E7BFF";
      beam.style.stroke = color;
      beam.style.filter = `drop-shadow(0 0 2.5px ${color}) drop-shadow(0 0 6px ${color})`;
      current?.cancel();
      if (reduced) {
        // no travel — a brief, subtle glow tick over the whole seam ring
        beam.style.strokeDasharray = "100 0";
        beam.style.strokeDashoffset = "0";
        current = beam.animate([{ opacity: 0 }, { opacity: 0.5, offset: 0.35 }, { opacity: 0 }], {
          duration: 1100,
          easing: "ease-in-out",
        });
      } else {
        // a short bright pulse travels once around the ring's seams, then fades to rest
        beam.style.strokeDasharray = "10 90";
        current = beam.animate(
          [
            { strokeDashoffset: 100, opacity: 0 },
            { opacity: 1, offset: 0.12 },
            { opacity: 1, offset: 0.86 },
            { strokeDashoffset: -10, opacity: 0 },
          ],
          { duration: 1500, easing: "cubic-bezier(0.42,0,0.4,1)" }
        );
      }
    };

    window.addEventListener("es:hero-flourish", onFlourish as EventListener);
    return () => {
      window.removeEventListener("es:hero-flourish", onFlourish as EventListener);
      current?.cancel();
    };
  }, []);

  return (
    <span className="es-hero-logo" style={{ position: "relative", display: "inline-flex", width, height, lineHeight: 0 }}>
      <Logo height={height} />
      <svg
        viewBox="0 0 64 40"
        width={width}
        height={height}
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible" }}
      >
        <path
          ref={beamRef}
          d={PATH}
          fill="none"
          stroke="#2E7BFF"
          strokeWidth="1.7"
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray="10 90"
          strokeDashoffset={100}
          style={{ opacity: 0 }}
        />
      </svg>
    </span>
  );
}
