# Everstock v2 — follow-up prompt

Standalone. Everything here is new since the correction prompt was sent.
Two parts: the hero perspective fix, then the line-breaking pass.

---

> Two things, unrelated to each other.
>
> # Part 1 — The hero conveyor is rotated, not in perspective
>
> The instruction you were given described the belt as a line between two screen points, with the deck
> width taken as an offset perpendicular to that line. That description has no horizon in it, so the
> cross-rollers came out perpendicular to a diagonal and the whole scene reads as a rotated top-down
> view rather than a camera standing on a factory floor. Discard that approach completely — it was a
> bad spec, not a bad build.
>
> Replace it with a real ground-plane camera projection. The belt is a flat plane; the camera stands
> beside it at chest height, yawed off the belt's axis. This is two-point perspective: the belt
> direction and the roller direction each have their own vanishing point, and **both sit on one
> horizontal horizon.**
>
> ## The model
>
> Work in world units where 1.0 is roughly a metre. Belt coordinates are `t` along the belt
> (increasing away from camera) and `u` across it (increasing toward camera).
>
> ```
> theta    = 26°                       // belt yaw relative to camera forward
> along    = (-sin theta,  cos theta)  // receding direction
> across   = ( cos theta, -sin theta)  // toward the camera
> P0       = (-0.55, 3.2)              // belt origin: (lateral, depth)
> HW       = 1.8                       // deck half-width
> camH     = 1.05                      // camera height above the deck surface
> f        = 430                       // focal length in px for a 640px-wide buffer; scale with width
> horizonY = 0.24 * heroHeight         // HORIZONTAL. never tilted.
>
> wx = P0.x + t*along.x + u*across.x
> wy = P0.y + t*along.y + u*across.y      // depth; discard anything with wy <= 0.4
>
> screenX = width/2 + f * wx / wy
> screenY = horizonY + f * camH / wy
> scale   = f / wy
> ```
>
> ## The rule that fixes the rotation
>
> **Everything vertical is drawn straight up the screen.** Belt legs, the worker, the vertical edges of
> a crate: take the base point from the projection above and draw upward in screen space, multiplied by
> `scale`. Never apply a rotation transform to any of them. This is the single thing separating a
> perspective view from the rotated one currently on the page.
>
> ## The rest of the scene
>
> **Cross-rollers** are constant `t`, sweeping `u` from `-HW` to `+HW`. Draw them at even intervals in
> `t`, never at even intervals on screen. They will converge toward their own vanishing point on the
> horizon and will not be parallel to one another. That convergence is the depth cue.
>
> **Crates** travel by decreasing `t` at a constant world speed, roughly `0.55` units per second, so a
> crate takes about thirty seconds through the visible range. Place them across the whole visible depth
> range including the near foreground, roughly `t = 1.5` out to `t = 28`. If they all sit in the far
> half, the foreground deck reads as a large empty grey wedge — a real failure mode, check for it.
> Crate footprint is about `0.8` by `0.8` world units, substantial against a `3.6` wide deck. They sit
> on the deck surface and are never clipped by it.
>
> **Deck structure.** The near rail is lit warm and runs from upper-left down toward the right edge. A
> skirt drops about `0.2` units below it, then vertical legs with feet drop another `0.6` onto the
> floor. The floor plane fills everything below the horizon that is not deck.
>
> **The worker** walks the floor on the near side, at about `u = HW + 1.0`. He is drawn as a vertical
> silhouette like everything else. His cycle is unchanged from the previous brief: a crate flags itself
> blue, he walks up, bends and inspects alongside it for two to four seconds, then it resolves green
> and continues or amber and he carries it off, then he walks back upstream and waits. Eleven to
> sixteen seconds per cycle, and he walks slower than the belt so he only handles flagged crates.
>
> ## Four checks before calling this done
>
> 1. The horizon is a horizontal line, and both vanishing points sit on it.
> 2. Every leg and the worker are exactly vertical in screen space.
> 3. The rollers converge rather than running parallel.
> 4. No element anywhere in the scene has a rotation transform applied to it.
>
> If any of those fail, the view will read as tilted again.
>
> ---
>
> # Part 2 — Display headlines are breaking at the container, not at clause boundaries
>
> Page-wide, not a one-off. Headlines are wrapping wherever the column happens to end, which splits
> phrases the eye needs to hold together. Two live examples:
>
> Section 06 currently reads `This makes your / job easier, not / obsolete.` It should read:
>
> ```
> This makes your job easier,
> not obsolete.
> ```
>
> Section 05 currently reads `Every proposal carries the quote, the / spec, and the reason it fired.
> You / approve with the full picture in front / of you, or you don't.` It should read:
>
> ```
> Every proposal carries the quote,
> the spec, and the reason it fired.
> You approve with the full picture
> in front of you, or you don't.
> ```
>
> ## The rules
>
> 1. A line breaks at a clause boundary — a comma, a conjunction, or the end of a sentence. Never
>    mid-clause.
> 2. A comma ends a line. It never starts one, and a clause never gets orphaned from the punctuation
>    that governs it.
> 3. Never leave one word alone on the final line. `obsolete.` sitting by itself is the clearest tell
>    that the container broke the line rather than the writer.
> 4. Keep line widths within roughly fifteen percent of each other. Connected lines occupying similar
>    width is what makes a stack read as deliberate rather than accidental.
> 5. Prepositional phrases stay intact. `in front of you` never splits across a break.
> 6. Set the breaks explicitly with hard breaks in the markup. Do not rely on `text-wrap: balance` for
>    display type — it optimises for even ragging, not for meaning, and will split a clause to even out
>    two lines. Balance is acceptable only as a fallback below the smallest breakpoint, where the
>    measure is too narrow for the intended breaks to fit.
> 7. Define break points per breakpoint, not once. A three-line stack at desktop width is usually a
>    four-line stack at tablet, and the clause boundaries move with it. Desktop breaks carried down
>    unchanged will read worse than automatic wrapping.
>
> ## Scope
>
> Apply to every headline, sub-headline, section intro, pull quote and CTA line across both pages in
> this file, hero included.
>
> Do **not** apply to body copy. At body scale the reader is not holding whole phrases in a single
> glance, and forcing clause breaks there produces a strange rag for no legibility gain. Body copy
> keeps wrapping naturally inside its measure.
>
> Where a headline cannot break cleanly because the column is too narrow, widen the column rather than
> accepting a mid-clause break. The clause structure decides the breaks; the container accommodates
> them.
