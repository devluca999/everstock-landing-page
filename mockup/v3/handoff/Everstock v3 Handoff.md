# Everstock v3 landing page: handoff spec

Source of truth: `Everstock v3.dc.html` (page) and `Everstock v3 Foundations.dc.html` (component sheet). Tokens: `handoff/everstock-v3-tokens.css`.

## Global rules
- Section themes are fixed, not toggled. Graphite: Hero, Stakes, Final CTA, Footer. Eggshell: Value, Industries, Sign-off, Plan, Journey, Founders, Price file.
- Blue means only "Everstock is doing something". Green = passed. `#C46620` = denied or a problem.
- One loud visual per screen height; everything else is micro-motion.
- One easing curve: `--v3-ease` `cubic-bezier(.2,.8,.25,1)`. Simulations (hero crane, crane swing) use physics or smoothstep internally but never a second CSS curve.
- Box labels are live HTML over the art, never baked. Label background on a box is `#DED7CB` (label white composited on kraft).
- All illustration pixels come from the box palette via an ordered 8×8 Bayer dither on a 2px cell. State colours join only while an object carries state.
- No em dashes in copy. Box puns are capped at two: "The full package." and "Built for anything that ships in a box."
- Breakpoint 900px: below it everything is single column. The Value section also has a short-viewport mode below 780px height.

## Components

| Component | Props | Notes |
|---|---|---|
| `SiteNav` | `ctaLabel`, `ctaHref`, `links: {label, href}[]`, `solidAfter = 24` | Transparent over hero, solid `--v3-g-bg` + 0.12 hairline after scroll. Links collapse below 900. |
| `Hero` | `eyebrow`, `title`, `sub`, `primary: {label, href}`, `secondary: {label, href}` | Copy left, `HeroFloor` right. Static faint lattice. |
| `HeroFloor` (v2 reuse) | `reducedMotion` | See v2 reuse. |
| `KraftBox` | `variant: 'iso' \| 'flat'`, `width`, `state: 'default' \| 'checking' \| 'passed' \| 'denied'`, `labelArea: boolean`, `theme` | Canvas dither renderer. Returns the label rect so children can be positioned on it. |
| `ShippingLabel` | `heading` (≤6 words), `fields: {label, value, mono?}[]` (3 to 5), `stamp?: StampVariant`, `po?` | Live text. Used standalone and as a child of `KraftBox`. |
| `Stamp` | `variant: 'Quoted' \| 'Matched' \| 'Approved' \| 'Shipped' \| 'Arriving' \| 'Received' \| 'Stocked' \| 'Sold' \| 'Checking'`, `rotate`, `size`, `as?: 'span' \| 'button'` | Double rule + distressed mask. Blue: Quoted, Matched, Checking. Green: Approved. Ink: the rest. |
| `StatusDot` | `state`, `theme` | LED dot. Glow on graphite, contrast ring on eggshell. |
| `Stakes` | `statements: {text, hot}[]` | Pinned 320vh. Includes `FallingStack`. |
| `FallingStack` | `columns = [2,3,3,2,1]`, `slips: {kind, title, id}[]` | Scroll-scrubbed; lands at the dark/light seam. |
| `ValueStory` | `heading`, `accentWord`, `steps: {title, body}[4]` | Pinned 420vh. Sticky list + `OperationScene`. |
| `OperationScene` | `progress: 0..4`, `draftLabel: ShippingLabel` | Z-buffered iso cuboids, dither dissolve on appear, blue edge when learned. |
| `IndustryTabs` | `tabs: {id, label, scene, label: ShippingLabel}[]` | Arrow keys move between tabs. Box stays; label retypes; scene cross-fades. |
| `IndustryScene` | `kind: 'auto' \| 'electronics' \| 'industrial' \| 'any'`, `active` | v2 blueprint line language on canvas. |
| `SignOffVideo` | `src`, `label` | Guardrail beat 3. Framed 16:9. |
| `PlanSteps` | `steps: string[3]`, `footnote` | Box slides step to step once on entry. |
| `Journey` | `stages: {kicker, stamps[], body, scene}[6]` | Not pinned. Contains `GuidePath`, `JourneyScene`s, the travelling `KraftBox` + `ShippingLabel`. |
| `JourneyScene` | `kind: 'dock' \| 'plane' \| 'truck' \| 'conveyor' \| 'crane' \| 'store'`, `lp` (local progress, −1..1), `speed`, `t`, `boxTop` | Drawn in material codes, then quantised. Only the nearest stage is live; the others freeze at 45% opacity. |
| `GuidePath` | `nodes: {x,y}[]`, `progress` | 1px `--v3-e-guide`. Draws to the box tip. Straight down below 900. |
| `Founders` | `heading`, `body`, `portraits: {src?, caption}[2]` | Grayscale, 168×208. |
| `PriceFileForm` | `onSubmit(email, file)`, `accept = '.csv,.xlsx,.xls,.pdf'` | Kraft box whose label is the form. The submit button is a stamp. The sent state shows a blue Checking stamp. |
| `FinalCta` | `heading`, `ctaLabel`, `ctaHref` | Graphite. Static 3-box iso stack. |
| `SiteFooter` | `links[]`, `tagline = 'Built in Chicago.'` | Oversized wordmark at 0.14 ink so it doesn't compete with the Final CTA. |

## Animations

| # | Animation | Trigger | Duration / rate | Easing | Reduced motion |
|---|---|---|---|---|---|
| 1 | Hero conveyor | rAF while hero is in view (≤1.15 vh scrolled), ~32fps | Belt 0.55 u/s. Crane: rest 5.4–9.6s, hold 0.45–0.9, descend 1.5–2.05, grip 0.42–0.58, settle 0.34–0.66, lift 1.55–2.05. Belt stop 0.5s, resume 0.7s. | Simulation (quad in-out, smoothstep, exp follow) | One still frame, crate under the gate reading blue |
| 2 | Crate state glow | Crate crosses the gate | Blue 0.7s, then green fades 1s or orange fades 2s | Linear decay in sim | Static blue crate |
| 3 | Nav solid | scrollY > 24 | 220ms | `--v3-ease` | Instant |
| 4 | Stakes statements | Scroll progress 0 / 0.3 / 0.6 | 420ms opacity, translateY 18px, orange text-shadow | `--v3-ease` | All three visible, static glow |
| 5 | Falling boxes + slips | Scroll-scrubbed (no clock) | Box window 0.3 of progress, staggered −0.14..0.62. Slips 0.46. | x ease-out quad, y ease-in quad (gravity), spin decays ^1.6 | Final stacks, slips at rest |
| 6 | Value assembly | Scroll-scrubbed, `P = progress × 4` | Each object dissolves in over 0.32 step units. Blue edge dissolves over 0.18. | Dither threshold (linear) | Each step shown fully built |
| 7 | Value list state | Active step changes | 220ms opacity | `--v3-ease` | Instant |
| 8 | Draft order label | Scene progress ≥ 3.45 | 220ms fade | `--v3-ease` | Shown with step 4 |
| 9 | Industry scene cross-fade | Tab change | 520ms | `--v3-ease` | Cut |
| 10 | Label retype | Tab change | 180ms delay, 24ms/char heading, 20ms/char fields, 120ms between fields | Stepped | Instant swap |
| 11 | Stamp land (industries) | After the last field | 160ms delay; opacity 140ms, scale 1.3 → 1 in 220ms | `--v3-ease` | Instant |
| 12 | Electronics pulse | Tab active + in view | 3.4s loop; pads flash over the last 10% | Linear along the trace | Still, pulse mid-trace |
| 13 | Industrial ram / arm | Tab active + in view | sin 0.7 rad/s (ram), 0.45 rad/s (arm) | Sine | Still |
| 14 | Sign-off video | ≥35% visible | Native loop | n/a | No autoplay; Play button |
| 15 | Plan box slide | 45% visible, once | Steps at 0, 900, 1900ms; 820ms per move | `--v3-ease` | Sits at step 3 |
| 16 | Journey box travel | Scroll-scrubbed | Dwell ±12vh at each node; linear arc length between | Arc-length mapping | Static strip: 6 frames, each with its box |
| 17 | Guide line draw | Scroll-scrubbed | `strokeDashoffset = L − s` | Tied to scroll | Drawn full length |
| 18 | Label print | 16vh of scroll before dock | clip-path inset | Tied to scroll | Printed |
| 19 | Journey stamp thunk | Stamp index increases | Scale 1.6 → 1 in 140ms, then box squash 110ms (translateY 2px, scaleY 0.97) | `--v3-ease` | New stamp appears, no squash |
| 20 | Scroll-speed motion | Scroll velocity (EMA 0.85/0.15) | Contrail length, wheel and roller angle, road dashes | Proportional | Off |
| 21 | Idle motion | Speed < 0.3 px/frame | Clouds drift, printer LED blink 3 rad/s, truck idle 14 rad/s ±0.5px, gate breathe, crane sway 1.7 rad/s | Sine | Off |
| 22 | Crane swing | Box hanging in crane stage | Spring k 0.05, damping 0.9, target −0.55 × velocity, ±8° | Spring | Off |
| 23 | Press feedback | :active | scale(0.985) | `--v3-ease` | Kept (not motion-heavy) |

## v2 components reused
- **HeroFloor**: `initFloor` / `drawFloor` from `Everstock v2.dc.html`, ported as-is (camera θ 26°, P0 2.2/3.2, quarter-res scene composited sharp + 2.6px blur). v3 changes:
  - Amber lamp pools, rail, roller caps and arm rim are now neutral cream `rgba(214,200,172,…)`, so orange only means denied.
  - The gate lamp is steel at idle and blue only while reading.
  - Pass colour is jade `47,196,155`.
  - Scanning blue is `38,110,255`.
  - Floor tint is neutralised to `#1E1C1A → #25221F`.
- **Guardrail video (beat 3, "Everything stops at your queue")**: `hf_20260823_052642_1d43c521-6909-47da-af26-1642ff625320.mp4` on the existing CloudFront path. Framed 16:9 on `#0B0D11` with a 12px radius.
- **Holograms**: the v2 hologram videos are retired in v3. The v2 pick-and-place arm lives on only as line art in the Industrial scene: capsule segments, double-ring hubs, hydraulic ram and reach arc, all in 1px ink.
- **Lattice**: 84px pitch from v2. It's static CSS in v3 (the v2 warp lives only in the Foundations sheet).
- **Segmented logo**: `assets/logo-mark-dark.svg` / `logo-mark-light.svg`, never animated.

## Open items
- Founder names and photos (slots are in place).
- Price-file form endpoint and upload handling (it currently only sets the sent state).
- `{CTA}` label: the placeholder is "Get early access".
- Mobile framing of the hero conveyor.
