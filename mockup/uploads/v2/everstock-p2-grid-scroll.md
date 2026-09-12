# Everstock v2 — Prompt 2 of 4: Grid and scroll behaviour

Send second, after prompt 1 has built. This is a port from the live repo, not a redesign.

---

This is a port, not a redesign. Every value is from the live repo, which is the reviewed build.

> The grid behaviour is wrong, and the root cause is that two separate systems have been collapsed into
> one. On the live site there are **two different grids**, doing different jobs, built different ways.
> Do not unify them.
>
> ## System 1 — the canvas lattice with beams. Hero only.
>
> This is `GridBackground`. It is a canvas, and it exists **only behind the hero**:
>
> ```
> position: absolute; top: 0; left: 0;
> width: 100%; height: 100vh;          // one viewport. not the page.
> z-index: 0; pointer-events: none;
> mask-image: linear-gradient(180deg, #000 68%, transparent 100%);
> ```
>
> It scrolls away with the hero rather than being fixed, the mask gives the first solid section a clean
> cut instead of a canvas seam, and its animation loop **pauses outright** once
> `window.scrollY > window.innerHeight * 1.15`. It is never behind a content section.
>
> Parameters: `SPACING 84`, `beamMax 26`, `TRAIL 34`, `STEP 0.084`, beams distributed across 4 bands by
> slot rather than randomly, 40% green, additive blend except in light theme, colours read from
> `--es-bg` and `--es-grid`, warp strictly 2D.
>
> ## System 2 — the blueprint layer. Every section after the hero.
>
> A CSS layer injected into each block, not a canvas. Different grid, different scale:
>
> ```css
> .vb-bp {
>   position: absolute; inset: 0; z-index: 0; pointer-events: none;
>   opacity: 0.004;                     /* resting: effectively invisible */
>   background-image: linear-gradient(var(--vb-grid) 1px, transparent 1px),
>                     linear-gradient(90deg, var(--vb-grid) 1px, transparent 1px);
>   background-size: 56px 56px, 56px 56px;
> }
> .vb-bp-major {                        /* child of .vb-bp */
>   position: absolute; inset: 0; opacity: 0.55;
>   background-size: 224px 224px, 224px 224px;
> }
> .vb-in > .vb-bp { animation: vbBlueprint 3200ms cubic-bezier(0.4,0,0.2,1) forwards; }
> @keyframes vbBlueprint {
>   0%   { opacity: 0.004; }
>   18%  { opacity: 1; }
>   56%  { opacity: 1; }
>   100% { opacity: 0.004; }
> }
> ```
>
> **This is a timed animation, not a scroll-scrubbed value.** About 0.6s to materialise, 1.2s held, 1.4s
> to dissolve. The long tail on the way out is what makes it feel like it is crawling down the page; if
> the current build ramps to full instantly and then holds until the section leaves, that is the bug.
>
> It fires once per entry on an `IntersectionObserver` at `threshold: 0.22`, guarded by a `data-vbBusy`
> flag so it cannot re-fire mid-run, re-arming after 3600ms. The hero is skipped — take
> `main > section, main > footer` and drop the first.
>
> The resting `opacity: 0.004` rather than `0` is deliberate. It keeps the layer composited so the
> animation starts instantly instead of hitching on first paint. Do not "clean it up" to zero.
>
> ## System 3 — the trailing measurement lines. These *are* scrubbed.
>
> They sit in the gap between sections, alternate side by block index (left on even, right on odd), and
> are not added to the last block. Each has a spine and four ticks at `17%`, `39%`, `61%`, `83%` with
> widths `46`, `26`, `38`, `22`, each tick carrying `--vb-t` set to its `y * 0.9`.
>
> A rAF-throttled scroll pass writes `--vb-p`:
>
> ```js
> const p = clamp(0, 1, (window.innerHeight * 0.96 - rect.bottom) / (window.innerHeight * 0.62));
> trail.style.setProperty("--vb-p", p.toFixed(3));
> trail.style.visibility = p > 0.001 && p < 0.999 ? "visible" : "hidden";
> ```
>
> The CSS consumes it directly, which is what makes these track the scroll:
>
> ```css
> .vb-trail-spine { transform: scaleY(var(--vb-p)); opacity: calc(0.34 + var(--vb-p) * 0.66); }
> .vb-trail-tick  { opacity: clamp(0, calc((var(--vb-p) - var(--vb-t)) * 7), 1);
>                   transform: scaleX(clamp(0.15, calc((var(--vb-p) - var(--vb-t)) * 5), 1)); }
> ```
>
> ## System 4 — content reveal
>
> Separate again. `.es-reveal` gains `.es-revealed` on an `IntersectionObserver` with
> `rootMargin: "0px 0px -10% 0px"` and `threshold: 0.04`, then unobserves. Content rises and fades;
> backgrounds stay put so panel surfaces read continuous.
>
> ## Section tone
>
> Driven by explicit classes, never `nth-of-type`, so it survives a reorder: `.vb-major` and
> `.vb-accent` for majority and accent roles, plus `.vb-ink` `#101216`, `.vb-stage` `#0B0D11` and
> `.vb-deep` `#17181D`. Under `[data-theme="light"]` the tones invert which role is majority and which
> is accent; the alternation *position* down the page does not move.
>
> ## Reduced motion
>
> `.vb-in > .vb-bp` gets `animation: none; opacity: 0.5`. The canvas draws one static frame and never
> starts its loop. Reveals all show immediately.
