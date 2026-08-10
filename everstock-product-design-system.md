# Everstock — Product Design System

This file is the durable design reference for Everstock's **product interface** — the live application, distinct from the marketing site (tryeverstock.com). Reference this continuously across Claude Design sessions; it should stay accurate as the system evolves.

Everstock is agentic procurement automation, built to be **industry/vertical-agnostic** — the platform architecture doesn't assume any one vertical. The initial wedge covers two starting verticals: **auto parts distribution** (tires, brake pads, rotors, filters, batteries, fluids) and **electronics distribution**. Design language, examples, and copy in this doc should stay flexible enough to extend beyond these two without rework — avoid hard-coding assumptions that only make sense for one vertical (e.g. don't over-index every example on tire/vendor-quote language; use it as one illustrative case among others).

---

## Core philosophy

**The interface should feel like a living environment the user inhabits and works alongside, not software they operate.**

Most B2B and AI-agent software builds trust through information density and control surfaces — tables, dashboards, confirmation dialogs. That's a control-room mental model. Everstock deliberately chooses a different trust mechanism: **visible, legible presence.** The user trusts the system because they can see it actively working, in a form that reads like a real process happening in front of them, and they always know how to interrupt it. This is closer to working alongside a competent colleague than operating a machine.

This only works if it never costs the user time. **"Don't waste people's time" is the load-bearing constraint on the whole system** — presence must earn its keep on every screen, not just impress once.

---

## Base palette

Graphite (~#16171B, warm-neutral undertone, not cold pure black or blue-black) as the primary dark-mode background — same base as the marketing site, but the product's material system below is independent of the site's flat/hairline-only panel rules.

---

## Grid & beam field — the persistent environment (Z-0)

**The background grid must render as one continuous, consistent environment across every screen, not a per-screen background choice.** A user moving from the agent workspace to Quotes to Connections should feel like they're moving through *one space*, the same grid, same base treatment, persisting underneath everything — not like each screen loaded its own separate background. If the grid looks different (density, visibility, warp behavior) from screen to screen, that breaks the core "living environment" premise the whole system is built on. Treat the grid as a fixed, shared layer that different screens sit on top of, not something each screen re-renders independently.

**Beam distribution must cover the full viewport, not clump to one side.** When not in reduced-motion mode, beams need guaranteed coverage across every region of the screen — left and right, not just left. This mirrors the marketing site's existing beam rule (guarantee coverage per screen region rather than random placement, which visibly clumps) — that same discipline applies here and has been missing from recent renders. Check every screen for left/right (and top/bottom) balance before calling a beam pass complete.

---

## Pillar 1 — Material duality as a semantic system

Two materials, each carrying meaning, never used decoratively:


**Frosted / translucent glass** — the material of anything active, in-motion, or ephemeral.
- Crisp 1px hairline border — sharp edge even when the interior is blurred (the backdrop can blur; the border line never does)
- Tight corner radius, roughly 4–8px — reads precision-engineered, not soft/consumer
- Subtle inner top-edge highlight for depth, substituting for drop shadow (no drop shadows)
- Faint cool blue/green hue cast so the pane reads as a distinct material, not just "blurred graphite"

**Chrome / metallic** — reserved *exclusively* for resolved, committed, or executed states — the moment something becomes real and can't be undone. A step, quote, or PO transitions from glass to metal as it locks in. This is a deliberate, meaningful material event, not ambient texture.
- Never apply chrome to active or in-progress elements
- Should read as rare and intentional, not decorative or overused
- **Reflective sheen extends to text, not just panels.** The marketing site's hero title treatment (bottom-half gradient, off-white fading to matte asphalt-grey in dark mode, inverting in light mode) is the chrome material rendered as typography rather than a surface. Reserve this sheen/gradient text treatment for content that represents the chrome/resolved state — a committed step's headline, a completed PO's title — and for the product wordmark itself (see "Persistent identity" below). Active/glass-state headlines stay flat, unadorned text, so the sheen remains a meaningful signal of "this is resolved," not a decorative default applied everywhere.

---

### Surface construction — physical layering, not flat panels

This is the biggest gap between spec and first-pass output, worth stating explicitly: **no surface is ever a single flat translucent layer with one soft shadow.** That's what produces the generic "AI SaaS card" look regardless of hue. Every glass or chrome surface is constructed from stacked layers so it reads as a physical object floating above the grid, not a shape painted on it.

**Required layer stack, every surface, no exceptions:**
1. **Base fill** — the glass or chrome material itself (per Pillar 1)
2. **Grain** — a subtle noise texture at two tiers: page-level grain (near-imperceptible, applied to the grid/background itself) and surface-level grain (slightly stronger, applied per-panel). This is a deliberate material choice, not a rendering artifact — it's what keeps flat digital surfaces from looking sterile. Blend as overlay in dark mode.
3. **Matte pass** — a subtle non-reflective darkening layer that grounds the surface, prevents it from looking like raw uncomposited blur
4. **Reflective sheen** — a soft directional highlight (typically top-edge or diagonal), suggesting the surface catches ambient light. This is where "premium" actually comes from, not from the blur amount.
5. **Content**, positioned above all of the above.

**Dual-stack shadows, never single-stop.** A flat `box-shadow: 0 4px 12px rgba(0,0,0,0.3)` is forbidden — that single-stop shadow is the single most common tell of a generic/generated surface. Every elevated surface needs at minimum:
- An **ambient** shadow — large, soft, low-opacity, suggesting general elevation
- A **key** shadow — tighter, darker, more directional, suggesting a specific light source
- An **inset top highlight** — a 1px near-white inset line at low opacity along the top edge, suggesting the surface catches light from above

Together these three replace what a single shadow can't do: they make the object feel like it's actually resting in space above the grid, with real thickness, rather than stamped flat onto the background.

**Strict z-layer discipline.** Three tiers, each with its own shadow/grain intensity:
- **Z-0 (background):** the grid/beam field itself. No shadow. Faint page-level grain only.
- **Z-1 (mid-layer):** the center-stage module, hub tiles, standard glass/chrome panels. Dual-stack shadow (ambient + key + inset highlight), full surface-level grain, matte + reflective passes.
- **Z-2 (foreground):** the floating input oval when expanded, modals, anything sitting on top of a Z-1 surface. Maximum shadow stack, strongest grain, highest blur on the backdrop behind it.

This layering is what should replace "dark blue gradient card" as the default output — the physicality comes from construction (grain + dual shadow + matte + sheen), not from any particular hue.

---

## Typography

Numbers, in particular, carry real weight in this product — prices, lead times, quote counts, PO totals. Flat proportional-width digits undercut the "precision instrument" feel the rest of the system is going for.

**Partial sharing with the marketing site, not identical usage.** The site's hero cycles through Space Grotesk, Unbounded, Anton, and Syne as a personality-signaling device unique to that one moment — that showiness doesn't belong in daily-use product UI. Instead, one thread carries over for brand continuity while the product gets its own steady, calm system built for legibility over performance.

- **UI/body type — Space Grotesk.** Reused from the site's default/most-frequent hero font for labels, body copy, buttons, nav. This is the workhorse face, used constantly, low personality by design so it never competes with the display type or the numerals. Sharing this one face with the site ties the two experiences together without importing the site's showiness.
- **Display/headline type — General Sans.** Used for module titles and section headers (e.g. "Comparing 14 vendor quotes"). Distinct from the UI face — more confident, slightly more industrial weight — but still disciplined and geometric, not decorative. Should feel considered and specific, never a generic system font.
- **Numeral/data type — Geist Mono.** A **monospace face with tabular figures, used for every price, quantity, SKU, lead time, and PO/RFQ identifier in the product**, no exceptions. Digits must stack cleanly in a column — this is non-negotiable for anything resembling a table or comparison view (e.g. vendor quote comparisons). Proportional-width numerals reading side-by-side in a data context is an immediate "looks generated" signal.
- **Micro-labels** (small uppercase field labels like "UNIT PRICE," "LEAD TIME"): the *only* place uppercase is used in the whole system — small size, moderate letter-spacing, muted color, set in the UI face (Space Grotesk). Never uppercase a heading, button, or badge — that's a distinct, deliberately narrow role.

---

## Pillar 2 — Color as strict state language

Applied as glow/accent on top of either material. Hue is reserved for **state only** — never used to distinguish task categories (use icon, shape, or position for that instead), with one narrow exception noted below.

**Use refined, specific hues, not primary/generic web colors.** "Red" and "green" read as default-palette and undercut the material sophistication established everywhere else — pick a specific, considered version of each hue and use it consistently.

| Color | Meaning |
|---|---|
| Electric blue | Active agent work in progress |
| Amber | Needs attention / requires input |
| Jade (a refined, slightly cool green — not a generic/primary green) | Completed / success |
| Crimson (a deep, slightly desaturated red — not a generic/primary red) | Failure / urgent alert requiring a human |

**Light-mode contrast is a hard requirement for every state indicator, not just badges.** Small state dots (not just filled pills) must be independently contrast-checked against the light/eggshell background — a state dot that reads clearly in dark mode can nearly disappear against a near-white card in light mode if it isn't specifically tuned. Test every dot, badge, and indicator against both backgrounds before calling a state-color pass complete.

**Narrow exception — a category accent for infrastructure/management surfaces.** Task-state color (the four above) must stay reserved for genuine process state. But hub tiles that represent *infrastructure/management* rather than *live process* (Connections, Settings) can carry their own distinct accent — a muted **indigo/violet** — used only for that tile category's identity, never implying task status. This is a category signal, not a state signal, and it must stay visually distinct from the crimson failure state so the two are never confused. Critically: **a genuine problem within an infrastructure tile (e.g. an expired credential) still uses crimson for that specific status line/badge** — the indigo accent is for the tile's ambient identity/hover treatment, not a replacement for real alert coloring. See "Hover feedback" under Pillar 3 for how this applies in practice.

---

## Pillar 3 — Presence-based interaction

**Center-stage module** — shows the agent's current unit of work with real visual weight (glow, subtle motion). The rule is **no smooth/ambiguous percentage bars or generic spinners** — those imply false precision about an LLM process and don't communicate anything real. This does *not* rule out progress indicators entirely: **segmented, discrete step indicators are allowed, sparingly and intentionally**, where each segment maps to one real concrete step (not an interpolated percentage) and is colored via the Pillar 2 state system (completed segments green, active segment blue/pulsing, pending segments neutral/dim, a failed segment red). This is really a formalization of the step-filmstrip pattern already emerging in practice — a step-by-step tracker is legible and honest in a way a 73%-style progress bar never is, because it's showing real discrete state, not a manufactured sense of continuous precision.
- As a step resolves, it demotes, shrinks, and slides into a filmstrip of completed steps while the next step animates into center focus
- **Horizontal progressive disclosure** = depth within one task (e.g., evaluating multiple tire vendors one at a time, each surfacing manufacturer, price, shipping, delivery time — or, in the electronics vertical, comparing component distributors on a chip/connector part number, unit price, and lead time)
- **Vertical stacking** = movement between distinct process stages (e.g., sourcing → quoting → approval)

**Comparison rail (horizontal scroll within a module)** — where a module's content extends beyond the visible width (e.g. scrolling through vendor quote cards), the scroll affordance must be built from system materials, not a default browser/OS scrollbar. Specifically:
- The track is a thin glass rail (per Pillar 1's glass material, scaled down — grain and hairline border still apply even at this small size)
- The position indicator/thumb is not a flat grey pill — it should be material-consistent (subtle glow matching the active state color) and **hover-reactive**: brightens, lifts slightly, or shows subtle magnetism toward the cursor on hover, echoing the bento tile behavior below, rather than sitting completely inert
- Where the content has a natural discrete count (e.g. 14 vendor cards), consider a segmented rail — one small tick/segment per item rather than a continuous bar — so the rail itself reflects the same "discrete state, not smooth interpolation" principle as the step indicator above
- Under reduced motion (Pillar 5): hover reactivity and any magnetism disable; the rail itself and its position remain fully legible statically

**Floating input** — small, persistent oval, minimal/translucent at rest regardless of what else is happening on screen.
- Expands slightly for text input on interaction
- Shows a live waveform reacting to actual speech for voice input
- Never feels like a modal or form field — always feels like part of the environment

**Command hub** — bento-style grid for navigation (connections/settings, quotes, purchase orders, invoices, email drafts, schedules). Explicitly **not a CRM**.
- Each tile carries a live preview or subtle presence indicator, not just an icon and label
- Clicking a tile expands in place into that sub-environment — never a hard navigational cut
- **Motion reference: reactbits.dev "Magic Bento"** (https://reactbits.dev/components/magic-bento), adapted into Everstock's own material and color language, not used as-is:
  - **Spotlight/border-glow →** the cursor-follow glow and edge-intensifying border use the state color system (Pillar 2), not a generic white/rainbow glow — a tile with an active live process glows blue as the cursor nears it, a tile with something needing attention glows amber, etc. The glow becomes informative, not just decorative.
  - **Particles →** replace generic sparkle/star particles with the beam system's particle language (small blue/green traveling points with fading trails) at low density, so the hub feels like the same living material as the rest of the product, not a different effect library bolted on.
  - **Tilt/magnetism →** keep subtle, in service of "the hub responds to your presence" — this reinforces the "environment, not a menu" framing, but must stay light enough to not fight the calm/scannable requirement once a tile's content itself (quotes, invoices) is a lookup surface (see Pillar 4).
  - Respect Pillar 5 (reduced motion): tilt, magnetism, and particle drift all disable under reduced-motion; spotlight/border-glow can remain as a static state-color highlight since it carries information, not just motion.
  - **Hover feedback defaults to neutral material response, not automatic state color.** A tile's hover state (shine, lift, subtle glow) should default to a neutral chrome/glass material reaction — the same kind of responsive "presence" treatment regardless of tile content — *unless* the tile is currently carrying a genuine, specific alert (e.g. an actually-expired credential), in which case the relevant status color surfaces as a badge or line item within the tile, not as a full-tile color flare triggered merely by hovering. Hovering over a tile should never itself imply failure — only real content does. Infrastructure/management tiles (Connections, Settings) use the indigo category accent (Pillar 2) for their ambient hover identity by default.
    - **Hard rule, stated explicitly because it has been missed in output repeatedly: the Connections tile's border and background glow on hover must never render as crimson/red.** The tile's ambient hover state is indigo, full stop, regardless of what's inside it. The word "expired" and the specific status line for the affected connection may be crimson text/badge — nothing else on that tile, at any hover state, should be. If a render shows a red-bordered or red-glowing tile background for Connections, that's a direct violation of this rule and needs to be corrected, not treated as a stylistic variant.

**Persistent identity** — the Everstock wordmark and logo mark must be visible in at least one fixed location on every screen, no exceptions, including inside expanded hub sub-environments, modals, and deep navigation states. Modeled on the marketing site's nav pattern (sticky, logo+wordmark anchored top-left, consolidating into a floating pill on scroll): the product interface carries an equivalent persistent nav element at all times, so the user is never navigated into a state where the app's identity isn't anchored somewhere on screen. This is a continuity/orientation requirement, not a branding nicety — in an environment this dynamic (center-stage module shifting, hub tiles expanding), a fixed identity anchor is what keeps the interface legible as "one place" rather than a series of disconnected states.

---

## Pillar 4 — Firm line between living and calm surfaces

- **Where the agent is actively working:** full atmosphere, presence, motion.
- **Review/lookup spaces** (quotes list, invoice history, PO records): fast, dense, scannable — **not** living/breathing.
- Ambient presence in calm surfaces is a garnish only — a glowing status dot, a faint beam trace on live update — never the dominant visual language.
- This line is deliberate and non-negotiable. Daily lookup work should never be slowed by decorative motion.

---

## Pillar 5 — Motion as enhancement, not foundation (reduced-motion mode)

Every meaningful piece of information (state, material, hierarchy, active vs. resolved) must be legible from a single still frame, with or without motion enabled. This is also a useful test of the system itself: if reduced motion makes Everstock look like generic SaaS, the differentiation was only ever in the animation, not the underlying structure.

Design a reduced-motion variant alongside the standard motion design:

| Standard | Reduced motion |
|---|---|
| Breathing/warping grid | Static grid |
| Traveling beam particles with trails | Static or subtly pulsing indicator points, no travel |
| Center-stage module slide/shrink/demote | Instant state change, no easing or motion path |
| Hub tile expand transition | Simple cut or fast crossfade |
| Glass-to-chrome transition | Instant material swap — meaning lives in before/after states, not the journey |
| Voice waveform | Static level meter |

**Always preserved regardless of motion setting:** material duality, color-as-state, center-stage-plus-filmstrip spatial layout, hub tile live-preview content, floating input presence.

---

## Light / dark mode

**Dark mode is the flagship** — full atmosphere, glass, chrome, full beam density. This is where "living environment" is fully realized.

**Light mode** inherits identical layout, components, and interaction logic, but is a **deliberately calmer counterpart**, not an equally-ornamented parallel system:
- **Background is warm eggshell/off-white, not stark white and not a cool grey.** Think warm paper or matte industrial off-white — the light-mode equivalent of graphite's warm-neutral undertone, not a clinical `#FFFFFF`. Explicitly not required to render — this must be built and reviewed alongside dark mode every pass, not treated as optional.
- Replace both glass and chrome with a single "elevated surface" material — crisp border, subtle non-shadow-free elevation (the dual-stack shadow discipline from Surface Construction above still applies, just softened — shadows soften in light mode, they never vanish entirely, or surfaces go flat again), no metallic rendering (chrome doesn't render well against a light field and shouldn't be forced)
- **Grain persists in light mode**, at a slightly higher opacity than dark mode, blended as multiply rather than overlay — light mode is not "grain-free," it's "same material discipline, different blend math"
- Reduce beam/grid density and glow intensity
- Independently contrast-check and re-tune all four state colors against the eggshell background — don't reuse dark-mode hex values verbatim. Status pills/badges in light mode should be saturated fills with light text, not pale tinted backgrounds, or they'll read as flat and low-contrast against a warm light field

Light mode's job is speed and legibility in bright/daylight working conditions (e.g., shop floor tablets), not atmosphere. This is an intentional difference in purpose, not a stripped-down version of dark mode. (Consistent with the marketing site's existing "dark is primary, light is secondary toggle" convention.)

---

## Logo exploration

**Motif: a true infinity symbol (lemniscate) resolving into a "C" (Everstock) — one continuous stroke that crosses at its center, not two separate adjacent circles/rings placed side by side.** Previous renders read as two disconnected "oo" rings (closer to glasses/binoculars) rather than a genuine infinity form — the defining feature of the mark is the continuous crossing at the middle where the single stroke figure-eights back on itself. Every direction below should be built on that true lemniscate structure, not a two-ring approximation of it.

**LOCKED — segmented chrome is the product's logo.** This decision is final: segmented chrome (lemniscate divided into discrete faceted segments, single material, no material split) is the flagship static mark, used everywhere the product needs an icon — favicon, nav, app icon, business materials. Three reasons this won out: (1) it's a direct visual echo of the product's actual mechanic — discrete, deterministic segments forming a continuous cycle, the same "no ambiguous percentage, only real discrete state" principle already established in Pillar 3's step indicators; (2) it's genuinely differentiated — smooth infinity marks are common across fintech/agency branding, a segmented structure buys real distinctiveness without relying on color or material tricks; (3) it's implementable at any scale with no fragility — one material, faceted, legible at 16px with no compositing or motion dependency, unlike the glass-window version.
- **Segmented chrome** is the mark, full stop. All further logo refinement work should focus on tightening this direction — facet count, proportions, small-size legibility — not exploring alternatives to it.
  - **FINAL SPEC — two-tier facet cut, locked.** The mark ships in two distinct facet counts depending on size, not one facet count scaled uniformly, because a single facet count that looks right large reads muddy small and vice versa:
    - **Display cut — 12 facets (6 per lobe), used at 24px and up.** This is the full-detail version — hero contexts, the wordmark lockup, larger app-icon sizes (32px+).
    - **Small cut — 7 facets, used below 24px.** A deliberately simplified facet count for favicon and small-icon contexts (18/14/10px, and the 16px app-icon size), where 12 facets would blur into noise. This is not a scaled-down version of the display cut, it's a separately-drawn simplification that preserves the "faceted, constructed" read at a scale where fine detail can't survive.
    - **The small cut also inverts its metal tone by background** — bright chrome on graphite (dark mode), dark chrome on eggshell (light mode) — rather than using the same mid-tone rendering as the display cut, since contrast matters more than tonal fidelity at that size.
    - **App icon uses the display cut at 32px and up, the small cut at 16px.** This threshold is fixed — don't let the display cut render at 16px or the small cut render at 32px+.
    - **Further small-cut refinement ideas worth testing, not yet mandated:** (a) exaggerate the gaps between facets disproportionately at the smallest sizes (10-16px) rather than scaling them uniformly with the facet size, since uniformly-scaled gaps tend to anti-alias into a blur before the facets themselves do; (b) simplify the specular highlight to a single flat highlight rather than a graduated one at small sizes, since multiple gradient highlights can flicker/muddy at few pixels; (c) always check the actual rasterized favicon/app-icon output (real 16×16, 32×32 PNG/ICO), not just a scaled-down vector preview, since rasterization artifacts at those exact pixel dimensions are the real test, not the vector proportions.
- **Chrome + glass window** is preserved as a special **"live" variant**, not a competing static identity — reserved for contexts where scale and motion are actually available (an onboarding moment, a loading/working state), where the beam-through-glass effect gets to be a genuine flourish instead of straining to survive at small sizes.
- **Full smooth chrome** doesn't need to be a third parallel identity — if used at all, it's an occasional "resolved" treatment tied to Pillar 1's chrome material logic (e.g. a completed-PO celebratory moment), not a primary mark.

1. **Open-loop infinity → C.** The gap resolves into a C shape. Needs refinement for legibility and confidence at small sizes — the earlier execution read as unresolved/broken rather than intentional.
2. **Closed loop, entirely matte, no chrome.** Fully closed infinity loop rendered as **solid matte carbon/concrete/graphite** — no reflective sheen, no metallic highlight anywhere on the mark, flat and non-reflective across the entire ring. This is a deliberately quieter, more industrial counterpart to direction 3 below — worth testing whether a fully non-reflective mark reads as more premium/restrained than a shinier treatment, or whether it loses too much presence without any chrome material at all.
3. **Closed loop, chrome ring with one true glass segment.** This refines the earlier "closed loop with live gap" concept with much more specific material logic: the ring is chrome/metallic (reflective, per Pillar 1's chrome material) across nearly its full circumference, **except for one specific segment that is rendered as true translucent glass** (not just a color-shifted section of the same material — an actual material change, matching Pillar 1's glass spec: hairline border, faint hue cast, grain). A beam (blue, occasionally green) travels through *that glass segment specifically* on a slow periodic cycle — so the mark is reading two materials simultaneously at rest (mostly chrome, one glass window), and the beam event is the moment you can see through the glass into the "live" activity, rather than an ambiguous colored gap in a single material. This is a more precise, more literal execution of the material duality than what rendered previously — call out explicitly that the chrome portion needs to actually look reflective (specular highlight, not flat grey) and the glass segment needs to look genuinely translucent/different in material, not just a different fill color on the same flat shape. **Superseded as the primary mark by the locked segmented-chrome decision above — retained only as the "live" variant.**
4. **Duality split family — explored, not selected.** Splitting the lemniscate into two material halves was explored across three pairings (chrome + glass, glass + concrete/matte, chrome + carbon fiber) as a strong alternative direction, but segmented chrome was ultimately locked in as flagship instead (see above). Retained here for reference in case a duality-split treatment is useful elsewhere (e.g. a special edition or campaign context), not as a candidate for the primary mark.
5. **Segmented monotone variants — this is where the winning direction came from.** A single-material mark built from visible discrete segments/facets rather than one smooth continuous stroke. Tested in both fully-chrome and fully-carbon-fiber renderings; **fully chrome, segmented is the locked flagship logo** (see decision above). The carbon-fiber-segmented variant remains a valid secondary/alternate-material exploration if a non-metallic context ever calls for it, but is not the primary mark.
6. **Open direction.** An additional original direction, informed by the infinity/loop motif and the material system above.

---

## Guardrails

- **Every render pass must produce both dark mode and light mode.** Light mode is not optional or a "phase two" — if only dark mode is shown, the pass is incomplete.
- **Exploration passes need real variation volume, not one example per concept.** When asked for light-mode coverage or logo directions, produce enough distinct variants to actually compare (multiple full-screen light-mode renders across different components/states, 5-8 logo variations rather than 2-3) — a single token example of each doesn't give enough to evaluate against.
- **No flat single-layer cards, ever.** If a surface doesn't have grain + dual-stack shadow + matte + reflective sheen (see Surface Construction), it will read as generic/generated regardless of color choices. This is the most common failure mode to check for in any output.
- **The base background is graphite/asphalt/carbon-neutral dark, never a navy or blue-toned dark.** If the background reads as "dark blue SaaS app" rather than "warm-neutral dark graphite," that's a miss to flag and correct, not a stylistic variant to accept.
- Avoid glassmorphism-as-wallpaper and gradient-mesh AI-startup clichés.
  - **Clarifying note — translucency itself is not the problem.** Cluely, Terzo, and Pillar 1's glass material all use translucency deliberately, and that's correct, not a contradiction of this guardrail. What actually reads as "cliché glassmorphism" is: blur applied decoratively with no functional reason, rainbow/multi-hue gradient washes bleeding through the blur, panels stacked on panels with no material logic, or translucency used as the default treatment for nearly everything so nothing feels intentional. Everstock's glass avoids all of this because it is **semantic and rare, not decorative and everywhere** — it means "active/ephemeral" specifically, it's paired with precision details (sharp hairline borders, tight radius, single controlled hue cast, no rainbow gradients), and it exists in contrast with chrome/metal so it reads as one distinct material among several, not the UI's default surface. The dividing line is *decorative-everywhere vs. semantic-and-rare*, not *translucent vs. not translucent*. Do not over-correct this guardrail into avoiding blur/translucency altogether.
- Chrome/metallic must stay rare and intentional — never decorative, never forced into light mode.
- This is a **product interface** system — separate from and not bound by the marketing site's flat/hairline-only panel rules (CLAUDE.md).
- Never let hue double up as both state and category — category distinctions live in icon/shape/position, not color.
- Presence and motion must always serve legibility and speed, never slow down daily production-line use.
