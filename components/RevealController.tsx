"use client";

import { useEffect } from "react";

/**
 * Scroll-reveal for [.es-reveal] surfaces (ported from the mockup's initReveals):
 * content rises + fades in as it enters the viewport; backgrounds stay put so the
 * panel surfaces read continuous. Reduced-motion / no-IntersectionObserver → show all.
 */
export default function RevealController() {
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(".es-reveal"));
    if (!nodes.length) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window)) {
      nodes.forEach((n) => n.classList.add("es-revealed"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add("es-revealed");
          io.unobserve(e.target);
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.04 }
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  return null;
}
