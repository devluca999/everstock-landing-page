"use client";

import { useEffect } from "react";

/**
 * Variant B's signature accent. Two connected moments, both keyed off scroll:
 *  1. On section entry the schematic blueprint grid fades in, holds, then dissolves —
 *     one deterministic run per entry (IntersectionObserver, threshold 0.22).
 *  2. In the gap between one section settling and the next firing, thin measurement
 *     lines trail down from one side, alternating side per boundary, driven by a
 *     rAF-throttled scroll pass that writes `--vb-p` on each trail.
 * Layers are injected into the real DOM (not pseudo-elements) so they rasterise with
 * the section and animate predictably. The hero (first block) is skipped.
 */
export default function BlueprintAccent() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const blocks = Array.from(
      document.querySelectorAll<HTMLElement>("main > section, main > footer")
    ).slice(1);
    if (!blocks.length) return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    let dead = false;

    // --- inject blueprint + trailing-line layers ---
    blocks.forEach((b, idx) => {
      if (!b.querySelector(":scope > .vb-bp")) {
        const layer = document.createElement("span");
        layer.className = "vb-bp";
        layer.setAttribute("aria-hidden", "true");
        const major = document.createElement("span");
        major.className = "vb-bp-major";
        layer.appendChild(major);
        b.insertBefore(layer, b.firstChild);
      }
      // trailing measurement lines alternate side per boundary; not on the last block
      if (!b.querySelector(":scope > .vb-trail") && idx !== blocks.length - 1) {
        const side = idx % 2 === 0 ? "l" : "r";
        const trail = document.createElement("span");
        trail.className = "vb-trail vb-trail--" + side;
        trail.setAttribute("aria-hidden", "true");
        const spine = document.createElement("span");
        spine.className = "vb-trail-spine";
        trail.appendChild(spine);
        ([[0.17, 46], [0.39, 26], [0.61, 38], [0.83, 22]] as const).forEach(([y, w]) => {
          const tick = document.createElement("span");
          tick.className = "vb-trail-tick";
          tick.style.top = (y * 100).toFixed(0) + "%";
          tick.style.width = w + "px";
          tick.style.setProperty("--vb-t", String(y * 0.9));
          trail.appendChild(tick);
        });
        b.appendChild(trail);
      }
    });

    // --- blueprint materialise on entry ---
    let bio: IntersectionObserver | undefined;
    if ("IntersectionObserver" in window) {
      const run = (el: HTMLElement) => {
        if (el.dataset.vbBusy) return;
        el.dataset.vbBusy = "1";
        const layers = el.querySelectorAll<HTMLElement>(":scope > .vb-bp");
        layers.forEach((l) => l.classList.add("vb-armed"));
        el.classList.remove("vb-in");
        void el.offsetWidth;
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            if (!dead) el.classList.add("vb-in");
          })
        );
        timers.push(setTimeout(() => layers.forEach((l) => l.classList.remove("vb-armed")), 3800));
        timers.push(
          setTimeout(() => {
            el.classList.remove("vb-in");
            delete el.dataset.vbBusy;
          }, 3600)
        );
      };
      bio = new IntersectionObserver(
        (entries) => entries.forEach((e) => e.isIntersecting && run(e.target as HTMLElement)),
        { threshold: 0.22 }
      );
      blocks.forEach((b) => bio!.observe(b));
    }

    // --- trailing lines: rAF-throttled scroll pass writing --vb-p ---
    let queued = false;
    const apply = () => {
      const vh = window.innerHeight;
      blocks.forEach((b) => {
        const trail = b.querySelector<HTMLElement>(":scope > .vb-trail");
        if (!trail) return;
        const r = b.getBoundingClientRect();
        const p = Math.max(0, Math.min(1, (vh * 0.96 - r.bottom) / (vh * 0.62)));
        trail.style.setProperty("--vb-p", p.toFixed(3));
        trail.style.visibility = p > 0.001 && p < 0.999 ? "visible" : "hidden";
      });
    };
    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        apply();
      });
    };
    if (!reduced) {
      apply();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
    }

    return () => {
      dead = true;
      timers.forEach(clearTimeout);
      bio?.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return null;
}
