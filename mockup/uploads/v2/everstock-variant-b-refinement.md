# Everstock — Variant B Refinement Pass

Follow-up to the Variant B brief. Variant B's core direction is approved — these are targeted refinements, not a rethink.

---

## 1. Remove the side position rail

The vertical progress rail on the side of the page isn't needed — remove it entirely.

## 2. New scroll-transition accent: alternating-side trailing blueprint lines

Keep the existing behavior (grid materializes in on section entry, holds, fades out). **Add:** once a section's grid has faded out and the visitor resumes scrolling toward the next section, thin blueprint-style measurement lines trail down the page from one side as they scroll — alternating which side each time. First occurrence trails from the **left**, next occurrence (going into the following section) trails from the **right**, alternating back and forth for each subsequent section transition down the page. This sits in the gap between one section's grid-fade-out and the next section's grid-fade-in — a connective accent during the scroll itself, not during the settled/resting state of either section.

## 3. Showcase section — dot-rail/timeline needs to be immediately reachable, no extra scroll required

Currently, when a showcase beat is centered in the viewport, the dot-rail navigation sits low enough that visitors need to scroll one additional step to reach and click it. Fix the vertical layout so the dot-rail is reachable at the same scroll position where the beat's video is centered — no extra scrolling required to interact with it.

**Reorder each beat's vertical layout** to put the interactive navigation higher, directly under the title, rather than at the very bottom below the description:

1. **Beat title** (e.g. "Everstock fills the paperwork")
2. **Dot-rail / timeline navigation** (moved here, directly under the title)
3. **Description copy** (e.g. "It reads the quote and writes the vendor, price, and quantity fields itself") — keep this copy as-is, this is a reposition, not a content cut

This same reordering applies to every beat in the showcase, not just the first one.

## 4. Light/dark mode section alternation — invert which sections are "accent" vs "majority" per theme

Currently, dark mode is mostly dark with periodic light sections breaking it up. Light mode should not just recolor those same sections into a light-tinted equivalent — it should **invert which sections carry the accent role**. In light mode: mostly light background overall, with the specific sections that were the "light accent" sections in dark mode now becoming the **dark accent** sections instead (not just a lighter tint of the same treatment). The alternation *position* in the page stays the same section-to-section; which *tone* is majority vs. accent flips per theme. This keeps both themes internally cohesive (mostly-one-tone-with-occasional-contrast) rather than light mode just being a pale recolor of dark mode's pattern.

## 5. Logo/beam — needs another implementation pass

The beam is better than the previous round but still needs work. Re-check the implementation against the exact material and beam specs already provided in the showcase-refinement document (the four-layer chrome material: base gradient, grain, matte, sheen; the three-pass beam: soft glow + solid core + bright highlight; the mandatory dual-stack shadow). This is a re-check against an existing spec, not new research — the gap is between the spec and the current implementation.

## 6. Fix the animation auto-advance timing — sync to actual video length, not a fixed timer

Current behavior: beats appear to auto-advance on a fixed timer (looks like ~8 seconds) that doesn't match each video's actual length, causing a beat to cut off mid-loop and jump to the next one instead of completing cleanly. **Fix:** drive auto-advance off each video's own native duration — play one full cycle of the beat's actual video length, hold on the settled final frame for about 2 seconds, then transition to the next beat. This removes the choppy mid-loop cutoff.

---

Everything else from the Variant B brief (solid-block section structure, hero unchanged, reused locked assets, section order and copy) stays as specified.
