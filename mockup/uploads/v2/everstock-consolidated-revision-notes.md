# Everstock — Consolidated Revision Notes (supersedes revision-pass-1, -2, -3)

Follow-up to the original page-narrative brief and Q3 revision brief, addressing issues found in the first build pass. This document replaces the three earlier incremental revision passes — work from this one only.

---

## 1. Two hologram containment patterns — use the right one for the right scale

Grounded against Doss (doss.com) and Muse (meuze.ai), which each use two genuinely different treatments depending on the hologram's role. Don't apply one uniform treatment everywhere — that was the root issue with the first pass.

### Pattern A — Big showcase (all four beats): scale, not a card

Muse's flagship illustrations (the restaurant forecast scene, the isometric office) are **not** boxed into a separate colored card — they sit directly on the section's own background and dominate purely through size and density.

**Apply to the big showcase section (The Guardrail, all four beats).** Each beat's hologram should run large — close to the full available width within the section — sitting directly on the section's own background. Do not wrap these in a separate small panel; the fix is scale, not containment. If the current build has these too small or boxed off, that's the correction.

### Pattern B — Small paired icon-holograms: bounded `Surface` card

Muse's small per-feature modules (their four-up Demand/Ordering/Labor/Supply-Chain grid) **do** sit in individually bounded, clearly-separated card containers.

**Apply to the two small paired icon-hologram sections:**
- **Section 4 (The Leak):** screw + gear pairing. Copy translucent on the left, hologram in a bounded `Surface` on the right.
- **Section 9 (Your Stack):** arm + crane pairing. **Invert** the section 4 orientation — hologram in a bounded `Surface` on the left, copy translucent on the right. This section is also currently misaligned (not centered) — fix alignment as part of this pass, and give the pairing real prominence at this scale, not small.

Build these with the design system's actual `Surface` primitive, not a hand-rolled background color:

```jsx
<Surface material="glass" z={2} state="active" padded>...</Surface>
```

Use `material="glass"` specifically — it's the "active/ephemeral" material variant, correct for live hologram content, and comes with grain, matte, sheen, and the proper dual-stack shadow already built in. **Do not construct these zones as a bare div with a background color and a single box-shadow** — the design system explicitly forbids that construction. If the current build did that, replace it with `Surface`.

---

## 2. No column should read as thin or under-filled

Wherever a section splits into two columns (text + hologram, text + illustration), neither side should feel sparse. Muse never leaves a column looking empty — the non-text side is always either a large dense illustration (Pattern A) or a properly-sized bounded module (Pattern B), never a small graphic floating in mostly-empty space.

This is the direct fix for **section 5 (Your Desk)**'s current empty space, and should be checked as a general rule across every split-layout section, not just that one.

## 3. Use the real spacing scale for section rhythm, not arbitrary gaps

The design system defines a 2px-base, 13-step spacing scale (2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 56, 72, 96). Every section boundary, every gap between a `Surface` and the copy beside it, every internal padding value should map to one of these steps rather than a custom pixel value. "Random gap" feelings between sections almost always trace back to arbitrary values instead of these tokens — fixing this is what will make transitions read as intentional rather than disconnected.

## 4. Whole-section background alternation — worth adopting, flag before building

Independent of what's inside any section, Muse alternates entire section backgrounds for rhythm (white → near-black → white → a full-bleed saturated blue CTA band). Worth considering at the page level:

- Give the big showcase section a genuinely full-bleed, distinctly solid-dark background, different in tone from its immediate neighbors — not just a lighter internal panel.
- Consider a bolder full-bleed treatment on the final CTA using Everstock's actual signal blue, echoing Muse's blue CTA band.

**This second point is a bigger departure from current color rules than anything else here** — the design system currently reserves that blue exclusively for agent-activity signal/hover use, not full-bleed backgrounds — so flag it for explicit approval before building rather than assuming it's wanted.

## 5. Beat 2 (sourcing) — logo must be the real composited component, not baked into the video

The Everstock mark is rendering incorrectly (malformed geometry, low-quality beam) because it's apparently being pulled from the generated video asset. Per the original brief, the mark is never part of the generated video — the video's center is intentionally left empty, and the real, live-animated `Identity.jsx` component (12-facet mark, unify/beam-loop/resolve states) must be composited into that reserved space at build time, running its own actual motion.

## 6. Video playback — needs a real compression/encoding pass

Videos are loading slowly, running at low frame rate, and freezing during playback. Treat as a technical encoding issue, not a creative one:

- Re-encode the source Higgsfield MP4s at a web-appropriate bitrate/resolution rather than serving the raw output files directly.
- Confirm `preload`, `autoplay`, `loop`, and `muted` attributes are set correctly for inline background-style video — required for reliable autoplay in most browsers and affects buffering behavior.
- Consider serving from a CDN with adaptive bitrate if load times remain an issue after re-encoding.
- If freezing persists after a proper re-encode, that may point to a hardware/decode limitation on the specific preview machine rather than the file itself — worth testing on a second device before treating it as a build issue.

---

Everything else from the original briefs (section order, four-beat showcase content, color language, motion specs, copy, locked asset URLs) stays as specified. This document is a layout/technical/containment revision pass only — no narrative changes.
