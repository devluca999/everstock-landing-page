# Everstock — Project Context

This file is read automatically at the start of every Claude Code session in this directory. It's the durable reference for how this project works — not a one-time task list.

## What this is

Everstock is agentic procurement automation for mid-market distributors, starting with auto parts (tires, brake pads, rotors, oil filters, batteries, fluids). Core thesis: **deterministic spine, agentic edges** — price-threshold rules and PO execution run as deterministic logic; vendor discovery and quote parsing run as agentic (LLM) work in scheduled batches. This decouples LLM cost from transaction volume.

This repo is the marketing/landing site, live at **tryeverstock.com**, deployed on Vercel.

Primary audience for the site: the economic buyer (owner/GM/CFO of a mid-market distributor). Positioning stance is "stealth SaaS" — reads as sharp procurement software first; agentic-commerce vocabulary is reserved for category/investor-facing contexts, not the buyer-facing copy.

## Tech stack

Next.js (App Router) + TypeScript + Tailwind CSS.

## Design system

**Base:** Graphite is primary (~#16171B, warm-neutral undertone, not cold pure black or blue-black). Light mode is the secondary/toggle-away alt (white background, same system inverted). Toggle labels are simply "Dark" / "Light".

**Signal color:** Electric blue is reserved *exclusively* for agent-activity signals — beams, live indicators, CTA hover/focus states. It should never appear decoratively. Neon green is a secondary accent within the beam system only (60% blue / 40% green split), not a general second brand color.

**Guardrails — do not deviate without discussing first:**
- No chrome or carbon-fiber textures (explicitly considered and rejected)
- No glassmorphism / gradient-mesh "AI-startup" clichés
- No blue used decoratively outside the agent-activity signal role
- Motion stays utility-focused, not decorative-for-its-own-sake

**Logo mark:** An infinite loop that doesn't fully close, its open tail resolving into a "C." Doubles as a live/working indicator — a blue beam occasionally traces through the open loop.

### Grid background

Full-bleed lattice of thin lines that breathes: individual grid cells stretch/compress in width and height independently (2D only — **never** implement as a 3D/depth-field warp, perspective distortion, or z-axis effect; it stays flat). Slow, soothing cycle. On desktop, this is a persistent full-page background behind every section, not just the hero. On mobile, reduce warp to minimal or none — it reads as chaotic rather than premium on a small screen.

### Beam system

Glowing particles tracing along the grid's actual warped paths, with fading trails and glow heads — reads as agentic work moving through deterministic rails. 60% electric blue / 40% neon green. Desktop: 24-30 beams, evenly distributed across the full viewport (guarantee coverage per screen region rather than random placement, which clumps), varied travel direction, staggered timing. Mobile: reduce to 8-12 beams, same distribution logic scaled down. Longer trails and stronger glow/luminescence than a typical particle effect — should read as genuinely bright against graphite, not faint dots. Presence, not spam — calm and ambient even at higher density.

### Hero title ("EVERSTOCK")

Two independent systems on separate clocks:

**System 1 — base font cycle (continuous, the norm ~90%+ of the time).** Rotates every 1.5-4s through: Space Grotesk (default, most frequent, held longest), Unbounded, Anton, Syne. Never repeat the same font twice in a row.

**System 2 — occasional effect layer (separate, infrequent, fires roughly every 20-40s off its own timer).** Interrupts the base cycle briefly, then hands back control. Weight classes:
- Reveal effects (~60% of this layer): Shuffle, Text Type, Split Flap, Masked Heading (reactbits.dev) — one-off "arrival" moment
- Ambient effects (~30%): Shiny, Stroke, Warp, Echo, Depth — loops briefly (~2-3s) then fades back
- Rare/signature (~10%, never more than once/minute): Fuzzy, Particle — reserve for genuine flourish; **drop entirely on mobile** (heaviest cost, least payoff on small screens)

**Always-on layers (independent of the above):**
- Continuous light sheen sweep across the lettering
- Thin energy-trace line along the letter edges (blue, occasionally green)
- Bottom-half gradient on each letter: off-white at top fading to matte asphalt/concrete grey at the bottom — strictly neutral, no blue/green in this gradient, so it doesn't compete with the beams as the signal color. Letters read as grounded industrial material; beams are the only glowing/colored element on screen.

Rule for all of the above: "EVERSTOCK" must stay legible at every single frame, even mid-transition.

### Nav

Desktop: individual translucent pills per nav item as the resting state on the hero. On scroll past the hero, pills consolidate into a single floating translucent pill that sticks to the top and follows scroll — logo + wordmark join that same unified pill. Smooth transition, not an abrupt cut.

Mobile: collapse to logo + hamburger icon (pills don't fit narrow viewports). Same sticky behavior applies — the floating pill becomes logo + menu icon post-scroll; tapping opens a full-screen or slide-down nav sheet.

### Section panels (below the hero)

Alternate between two treatments down the page, not a floating box on every section:
- **Full-bleed** — background tint/panel spans the entire section width edge-to-edge (content still sits in the centered max-width container, but the background covers the whole section, no visible margins or rounded box).
- **Contained** — content pane is deliberately narrower, aligned left or right (alternating), grid visible and uncovered on the other side. Should read as intentional and asymmetric, not a randomly placed card.

Order: full-bleed, contained-left, full-bleed, contained-right, etc. Mobile: no alternation — full-width, centered, stacked in document order.

Subtle hue tint pulling from the blue/green palette (very low saturation) on both treatments. Use https://cluely-next-git-origin-pixelpoint.vercel.app/ as the craft/motion reference for scroll-triggered reveals and section-to-section transitions — smooth and connected, not independently placed boxes.

## Typography outside the hero

The cycling/effect treatment is exclusive to the hero H1. Everything else — nav, body copy, section headers, buttons — uses one stable, quiet type family. No font-cycling anywhere else on the page.

## Layout conventions

Left-aligned body copy and headlines inside a centered max-width container, everywhere except the hero (which is the one deliberate centered, animated exception). Flat components, hairline borders — no drop shadows. 8/12/16/24px spacing rhythm.

## Copy

- Hero eyebrow: "Agentic procurement, deterministic trust" (or evaluate against "Supply-chain intelligence, at your command" — that phrase currently lives in the subheading, worth a gut-check on whether it belongs in both places or just one)
- Hero H1: EVERSTOCK
- Hero subheading: "Supply-chain intelligence, at your command."
- Nav: Platform · Pricing · Company · Log in
- Primary CTA: "Request access" — Secondary CTA: "See how it works" (repeated verbatim at the bottom of the page, matching the hero)

Full section-by-section copy and structure (trust bar, problem statement, how it works, trust architecture / approval queue visualization, ops-user reassurance, integrations, footer) is in the project's design brief docs — ask if you need the full site map restated. Integrations section should include Excel/spreadsheet import-export alongside named ERP/EDI systems — many mid-market distributors run on spreadsheets rather than a formal ERP, and that's the lower-friction on-ramp for that segment.

## Accessibility & performance (non-negotiable, not nice-to-haves)

- Respect `prefers-reduced-motion` — fall back to a static or significantly simplified version of the grid/beam/title animations
- Cap devicePixelRatio on canvas rendering; pause/reduce animation when the tab isn't visible
- Use `dvh` units, not `vh`, for full-viewport-height sections (mobile address bar resize causes layout jump with `vh`)
- Proper semantic HTML, alt text, keyboard navigation for nav and CTAs

## Working conventions

- Flag ambiguous decisions rather than guessing silently, especially around mobile behavior for animation-heavy elements
- Ask before touching real infrastructure (GitHub repo creation/auth, Vercel deploy, domain/DNS config) — code changes are fine to proceed on, infra actions need a check-in first
- Componentize sensibly (Hero, Nav, GridBackground, BeamField, TitleCycle, Section, etc.) rather than one large file
