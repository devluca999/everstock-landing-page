# Everstock v2 — correction prompt (v2)

Paste into the same Claude Design thread as a follow-up on `Everstock v2.dc.html`.

This supersedes the earlier correction prompt. It is anchored to the locked page-narrative brief, the
consolidated revision notes, and the Variant B refinement pass, which v2 did not follow.

---

> v2 discarded the locked page system. Before changing anything, re-read these three documents in the
> project and treat them as binding: the page-narrative design brief, the consolidated revision notes,
> and the Variant B refinement pass. The corrections below are on top of those, not instead of them.
>
> ---
>
> ## 0. The wordmark has lost its treatment and its prominence. This is the priority fix.
>
> EVERSTOCK is the single attention-grabbing showcase of the page and it currently reads as a caption.
> Reference page 1 of this file and the current live tryeverstock.com — match that prominence, power
> and presence. Two parts to this, layout and effects.
>
> **Layout.** The wordmark is centred, horizontally and optically, and dominant in scale. The hero is
> the one deliberate centred, animated exception on the page; every section below it still holds the
> single left spine. Do not left-align the hero. The lead, the body line, the CTAs and the design
> partner note all centre under the wordmark.
>
> Because the copy is now centred rather than sitting in a left column, the conveyor field can no
> longer mask out to the left the way it does in the current build. Instead, run the field full-bleed
> behind the whole hero and sit a soft radial legibility scrim under the type so the wordmark holds
> contrast without the field being cut in half. Everything in section 1 below about the conveyor's
> geometry still applies; only the masking changes.
>
> **Effects.** Two independent systems on separate clocks, plus three always-on layers. All of this is
> already specified in the project conventions and is simply missing from v2.
>
> *System 1, the base font cycle.* Continuous, the norm for over ninety percent of the time. Rotates
> every 1.5 to 4 seconds through Space Grotesk, Unbounded, Anton and Syne. Space Grotesk is the
> default, appears most often and is held longest. Never repeat the same face twice in a row.
>
> *System 2, the occasional effect layer.* Separate and infrequent, firing on its own timer every 20
> to 40 seconds. It interrupts the base cycle briefly then hands control back. Weighted:
> reveal effects at roughly 60 percent (Shuffle, Text Type, Split Flap, Masked Heading — a one-off
> arrival moment); ambient effects at roughly 30 percent (Shiny, Stroke, Warp, Echo, Depth — loops for
> two to three seconds then fades back); rare signature effects at roughly 10 percent (Fuzzy,
> Particle) and never more than once a minute. Drop the rare tier entirely on mobile, it is the
> heaviest cost and the least payoff on a small screen.
>
> *Always-on, independent of both systems.* A continuous light sheen sweeping across the lettering. A
> thin energy-trace line along the letter edges, blue and occasionally green. A vertical gradient on
> each letter running off-white at the top to matte asphalt grey at the foot — strictly neutral, no
> blue or green anywhere in it, so the letters read as grounded industrial material and the beams stay
> the only glowing coloured element on screen.
>
> The hard rule across all of it: EVERSTOCK stays legible at every single frame, including mid
> transition. If an effect makes it unreadable at any point, that effect is wrong.
>
> > ## 1. The hero conveyor is a plan view. It has to be a perspective view.
>
> It currently reads as a flat band seen from overhead. It should read as standing on the factory
> floor beside a wide conveyor at chest height, looking down the line as crates come toward you at a
> diagonal. Standing on the shoulder of a road watching cars approach, not looking down from a drone.
>
> Build it with a real perspective projection rather than by eye:
>
> - Each object gets a depth `z`. Near plane `z = 1.05`, far plane `z = 14`.
> - Screen scale is `1/z` normalised to the near plane. Position interpolates along the belt
>   centreline by `((1/z) - 1/14) / (1/1.05 - 1/14)`. This is the critical part. It is what makes
>   objects accelerate as they approach and what makes evenly spaced things bunch in the distance.
>   Do not interpolate position linearly.
> - Centreline runs from a vanishing point at roughly `(0.18w, -0.02h)`, just above the top-left of
>   the hero, down to roughly `(1.70w, 1.45h)`, well past the bottom-right corner.
> - Deck half-width about `620` units at the near plane, perpendicular to the centreline. That number
>   matters: it is wide enough that the deck's far edge passes above the top-right corner, so the
>   whole right side of the frame is conveyor with nothing behind it. Below about 500 an empty wedge
>   reappears top-right.
> - Crates travel toward the viewer at a constant `z` velocity of about `0.46` per second, roughly
>   thirty seconds end to end. They are large relative to the deck, about a sixth of its width. They
>   sit on top of the deck and are never clipped by it. They are currently being cut off, which means
>   they are drawn behind the deck rather than on it, or z-sorted against the deck as one object
>   instead of per crate.
> - Cross-rollers run perpendicular to the centreline, spaced evenly in `z`, never evenly on screen.
>   This is the strongest depth cue in the scene.
> - Frame skirt, legs with cross braces, and a floor strip with a contact shadow sit below and left of
>   the deck's near edge.
>
> ## 2. The hero worker is missing. Put him back.
>
> One human silhouette walking the floor strip on the near side, at about `1.06` times the deck
> half-width laterally. Cycle runs eleven to sixteen seconds: a crate flags itself blue, he walks up,
> bends and inspects while walking alongside it for two to four seconds, then it resolves green and
> continues or amber and he lifts it off and carries it away, then he walks back upstream and waits
> two to five seconds. He walks slower than the belt, which is why he only handles flagged crates and
> most pass untouched. Do not synchronise him to the line. Give him a warm rim light on the
> belt-facing edge or he disappears against the floor.
>
> Note this hero worker is a blurred atmospheric silhouette and is deliberately *not* in the locked
> wireframe-mesh hologram style. The hologram style applies to the section assets below the hero, not
> to the hero's background field.
>
> ## 3. Restore the locked section order and the hologram system.
>
> v2 invented its own bottom half. Go back to the twelve-section order in the page-narrative brief:
> Nav, Hero, Trust bar (tagline stream, no logos), The Leak, The System, The Guardrail, The Contract,
> Your Desk, Your Stack, Outcome stream, Final CTA, Footer.
>
> Restore the hologram assets, which are already generated and locked. Drop them in at these URLs:
>
> - The Leak, screw + gear pairing, alternating focus cycle:
>   `https://d8j0ntlcm91z4.cloudfront.net/user_3FMfW2x8TD9jPPPVdRryKluSeEm/hf_20260823_062652_30ad984f-c21b-4fed-b2bf-009ad6be990e.mp4`
> - The Guardrail Beat 1, document prefilling:
>   `https://d8j0ntlcm91z4.cloudfront.net/user_3FMfW2x8TD9jPPPVdRryKluSeEm/hf_20260823_044129_df5c7c84-21ca-45c9-89ba-2969cca48cb4.mp4`
> - The Guardrail Beat 2, sourcing, centre reserved for the live composited mark:
>   `https://d8j0ntlcm91z4.cloudfront.net/user_3FMfW2x8TD9jPPPVdRryKluSeEm/hf_20260823_050644_7df87958-7671-429e-babe-93acdeeef922.mp4`
> - The Guardrail Beat 3, approval queue:
>   `https://d8j0ntlcm91z4.cloudfront.net/user_3FMfW2x8TD9jPPPVdRryKluSeEm/hf_20260823_052642_1d43c521-6909-47da-af26-1642ff625320.mp4`
> - The Guardrail Beat 4, reconciliation:
>   `https://d8j0ntlcm91z4.cloudfront.net/user_3FMfW2x8TD9jPPPVdRryKluSeEm/hf_20260823_060719_0059b8f8-07d7-4d7b-b6fa-0fec8004f1bf.mp4`
> - Your Stack, robotic arm + crane, independent async actions:
>   `https://d8j0ntlcm91z4.cloudfront.net/user_3FMfW2x8TD9jPPPVdRryKluSeEm/hf_20260823_062700_d5c6c6b7-e767-4508-be39-29cfa4c67af8.mp4`
>
> Containment follows the two patterns from the revision notes, not one uniform treatment. The four
> Guardrail beats run near full section width, sitting directly on the section background with no
> card. The two paired icon-holograms sit in bounded `Surface material="glass"` cards, with The Leak's
> hologram on the right and Your Stack's inverted to the left.
>
> Beat 2's centre stays empty in the video. The live `Identity.jsx` mark composites into that reserved
> space and runs its own unify, beam-loop and resolve states. Never bake the mark into the video.
>
> ## 4. The grid should not run behind the whole page.
>
> A persistent page-wide grid flattens the sectioning and makes body copy hard to read. The locked
> behaviour from the Variant B pass is the right one and v2 dropped it: the grid materialises in on
> section entry, holds while the section is settled, then fades out. Between sections, thin blueprint
> measurement lines trail down the page as the visitor scrolls, alternating side each time — left on
> the first transition, right on the next, and so on.
>
> Also restore whole-section background alternation. The Guardrail gets a genuinely full-bleed solid
> dark background, distinctly different in tone from its neighbours. In light mode, invert which
> sections carry the accent role rather than recolouring the same sections to a pale tint.
>
> To be precise about a rule that got over-applied: alternating left/right **alignment** stays killed,
> every section holds one left spine. Alternating light/dark section **backgrounds** are required.
> Those are two different things and v2 removed both.
>
> ## 5. Where the two new interactive diagrams go.
>
> v2 produced two new modules that are good and should survive, but one of them duplicates an existing
> beat. Place them like this:
>
> - **The schema assembly** — clickable Invoice / Spreadsheet / Purchase order sources resolving into
>   Vendor / Part / Price / Order with orthogonal connectors and the honest partially-mapped state.
>   This is genuinely new; nothing in the locked brief covers it, and it is the section that carries
>   the model claim. Insert it as a new section directly after The System and before The Guardrail.
>   Interactive, no video, grid visible behind it since it is a window into the product.
>
> - **The Proposed → Approved → Executed state graph** with the Returned branch, blue border meaning
>   Everstock runs the step and solid meaning the human owns it. This overlaps Guardrail Beat 3, which
>   is the same content as a hologram. Do not run both as separate full sections. Instead, promote The
>   Contract from a typographic banner into this state graph. The video beat stays the atmospheric
>   version inside the showcase; the graph immediately after it is the precise, readable version.
>
> ## 6. Keep unchanged.
>
> The hero wordmark with its gradient, sheen, trace and font cycling. The `beamDensity`, `conveyor`
> and `reducedMotion` controls. The hero's breathing grid and beams.
>
> ## 7. Anchor everything unspecified to the current live site.
>
> Where this prompt is silent, follow the current live tryeverstock.com rather than reinventing. The
> live implementation is the reviewed one. This page is that site's structure and theme with the new
> hero motion, the new positioning copy, and the schema section added — not a fresh design.
