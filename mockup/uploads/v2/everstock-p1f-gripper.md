# Everstock v2 — Prompt 1f: Gripper arm and scan colours

Send after the crane prompt. Refines it — the crane stays, its construction and the colour logic change.

---

> Three corrections to the hero pickup sequence.
>
> ## 1. The grab needs to be an articulated arm with a real gripper
>
> The current version is a straight mast with two probes that approach the crate. Replace it with an
> **articulated industrial arm**, closer to a real pick-and-place robot.
>
> Construction, from where it enters the frame down to the crate:
>
> - It reaches in from the **top of the frame**, mounted off-screen. Do not show a floor base.
> - **Two rigid segments** with a visible **joint housing** between them — a thicker cylindrical block
>   at the elbow, wider than the segments it connects. The joint housings are what make it read as a
>   machine rather than as a stick.
> - A **wrist** below the lower segment: another short housing, narrower than the elbow.
> - A **two-finger gripper** at the end. Each finger is **jointed in two segments**, hinged so the
>   fingertips curl inward as they close. Flat inner faces.
>
> **The gripper must actually enclose the crate.** Open wide enough that the fingers clear the crate's
> width on approach, descend around it so the crate sits between them, then close until the inner faces
> meet the crate's sides. The fingers wrap it, they do not pinch at it. Right now they read as two
> probes touching a box, which is the whole problem.
>
> The arm articulates as it works — the elbow angle changes through the reach and the lift rather than
> the whole assembly translating rigidly down and up. That articulation is most of what sells it.
>
> It stays in the blurred atmospheric layer: dark silhouette, warm rim light on the lamp-facing edges,
> same treatment the crates get. **Not** the wireframe-mesh hologram look — that belongs to the section
> assets below the hero.
>
> ## 2. Fix the colour logic
>
> Current behaviour has the wrong thing changing colour and leaves glow behind. Correct model:
>
> - **The scan light at the gate is always blue. It never changes colour.** It is the machine looking,
>   and it looks the same way at everything. Do not tint it by outcome.
> - **A crate that passes** picks up a **green** glow as it clears the gate, which **dissipates**
>   within about a second. It continues down the line as a plain crate.
> - **A crate that is denied** picks up an **orange** glow — noticeably darker and deeper than amber,
>   not a yellow — which also **dissipates**. This is the crate the arm will collect.
>
> **No residual glow anywhere.** Every glow fully returns to zero. No crate on the belt is carrying
> colour at rest, no faint trail is left behind the gate, nothing accumulates over time. If you can
> pause the animation at a random moment and find a crate that is still tinted, that is the bug.
>
> One consequence worth handling deliberately: since the orange also dissipates, the denied crate is
> visually identical to the others by the time it reaches the pickup point. That is fine — the belt
> stopping and the arm arriving is what identifies it. To keep the association readable, let the orange
> **dissipate more slowly than the green**, roughly two seconds against one. The viewer's eye follows
> the one that took longer to fade.
>
> ## 3. Make the belt less regular
>
> The crates are currently evenly spaced and the denial fires on a fixed interval, which makes the
> whole scene read as a loop.
>
> - **Vary the crate spacing.** Run them in loose clusters with gaps between — two or three close
>   together, then a stretch of empty belt, then a single one. Alternate the density rather than
>   holding a constant pitch.
> - **Jitter the denial interval.** Keep the average around seven seconds after the belt resumes, but
>   vary it by a couple of seconds either way so the viewer cannot anticipate it.
> - **Vary the crate sizes a little more** within the existing range, so no two adjacent crates read as
>   identical.
>
> None of this should be so pronounced that it looks random. A real line has rhythm with irregularity
> inside it, not chaos.
>
> ## Unchanged
>
> The stop-and-resume sequence and its easing, the projection model, travel direction, horizon, the
> rule that all verticals are drawn straight up the screen, crate opacity, the solid-field gradient and
> the lattice cutout over the conveyor.
