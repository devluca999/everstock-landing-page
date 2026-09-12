# Everstock v2 — Prompt 1 of 4: Hero field

Send first. Paste the block below into Claude Design.

---

> Two changes to the hero background. The perspective itself is correct now — level horizon, vertical
> uprights, proper recession — so do not touch the projection model beyond the sign changes in part A.
>
> ## A. The conveyor is on the wrong side of the frame
>
> It currently recedes toward the upper **left** with its mass left of centre, leaving the right side
> of the hero empty. Mirror it: the deck recedes toward the upper **right**, crates travel toward the
> viewer and to the left, and the deck's mass occupies the centre-right and the bottom of the frame.
> This is the arrangement in the reference clip, where the road fills the right side and traffic comes
> toward you across it.
>
> This is **not** a rotation and not a change of camera angle. Do not rotate anything. It is a mirror of
> the belt's placement in world space — three sign changes:
>
> ```
> theta  = 26°                          // unchanged
> P0     = (-0.55, 3.2)                 // unchanged
>
> along  = ( sin theta,  cos theta)     // x was negative, now positive
> across = (-cos theta, -sin theta)     // x was positive, now negative
> ```
>
> Everything else holds: `camH`, `f`, `HW`, `horizonY`, the projection equations, the crate depth
> range, roller spacing in `t`, and the rule that every vertical element is drawn straight up the
> screen with no rotation transform.
>
> Two consequences to carry through:
>
> - The warm-lit near rail now runs from the **upper right down toward the lower left**, not the
>   reverse. Skirt, legs and feet follow it.
> - The crates' warm rim light moves to their **left**-facing edge, since that is now the side turned
>   toward the camera.
>
> The worker stays at `u = HW + 1.0` on the near side; he lands on the other side of frame
> automatically once the signs flip.
>
> ## B. The field needs to blend, not just sit there
>
> Right now the hero reads as one flat composite. It should read as a clean surface on the left handing
> off to the operational world on the right. Three layers, two of them gradiented in opposite
> directions.
>
> **The solid field.** On the left of the hero the background is fully solid — flat graphite in dark
> theme, flat off-white in light theme. Not tinted by the conveyor, not partially transparent, solid.
> That solidity is what makes the grid and beams read crisply. It stays fully opaque across roughly the
> left third, then dissolves across the middle, and is gone by the right edge.
>
> **The conveyor.** The inverse. Fully hidden behind the solid field on the left, emerging through the
> middle, fully visible on the right. The crossover is the whole point: the page is handing off from
> the clean surface to the thing being modelled.
>
> **The grid and beams.** These run at full strength over the solid portion, where they are legible
> against flat ground, and ease down as they cross onto the conveyor so they are not competing with
> busy blurred imagery underneath. They never disappear entirely — a beam should still be traceable
> over the deck — but they sit back.
>
> Net effect reading left to right: solid ground with crisp lattice and bright beams → the two
> dissolving into each other → the conveyor visible with the lattice quiet over it.
>
> Since the hero copy is centred, the wordmark sits over the crossover region. It needs its own soft
> radial legibility scrim so it holds contrast regardless of what is behind it at that point. Do not
> solve this by weakening the conveyor globally.
>
> Invert the whole arrangement for light theme: solid becomes flat off-white, and the conveyor and
> beams adapt to read against it.
