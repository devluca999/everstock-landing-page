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

**Logo mark — LOCKED (segmented chrome infinity).** The final mark is a true infinity symbol (lemniscate) — one continuous stroke that crosses at its center (a genuine figure-eight, not two adjacent "oo" rings) — divided into discrete faceted **chrome** segments. It's a deliberate visual echo of the product's "discrete deterministic state, not smooth interpolation" principle. Single reflective chrome material (specular sheen, not flat grey); **static — no beam / no motion dependency.** Ships as a **two-tier facet cut** (per `everstock-product-design-system.md` → "Logo exploration", which is the source of truth):
- **Display cut — 12 facets (6 per lobe), used at ≥24px** — nav, footer, wordmark lockup, app icons 32px+. Theme-inverted tones are swapped by `[data-theme]` (bright chrome on graphite, dark chrome on eggshell).
- **Small cut — 7 facets, used <24px** — favicon / small icons; a separately-drawn simplification (not the display cut scaled) that also inverts metal tone by background, since contrast beats tonal fidelity at that size.

Implemented from the actual Claude Design assets (`public/logo/*.svg`, favicon at `app/icon.svg`) — **do not redraw the facets by hand.** This **supersedes** the older "open loop that doesn't fully close, blue beam tracing through the gap" description, which was an earlier exploration and is *not* the locked mark. The chrome + glass-window "live" variant (beam through a real glass segment) is retained only for motion/onboarding contexts, never as the primary static identity.

**Hero placement — the mark is NOT in the hero (standing decision, updated 2026-08-10).** The marketing hero **does not carry the logo mark.** An earlier pass placed a second instance of the mark in the hero (below the eyebrow, above the title) with a beam flourish synced to the title's rare/signature effect layer; both the `HeroLogo` component and that synced flourish were **removed at the user's request on 2026-08-10**. Do not reintroduce a logo into the hero without checking first. The mark still appears — fully static, as always — in the **nav, footer, and favicon** (those instances were never animated and are unchanged). The `es:hero-flourish` event is still dispatched by `TitleCycle` (the locked title system) but now has no consumer; that's a harmless no-op, left in place to avoid touching the locked title logic. The title's **fixed-height clearance zone** in the hero remains intentional: the title lives in a box sized for the worst-case font (tallest, e.g. Anton × 1.16, plus effect-layer transform overflow) so the eyebrow above and the tagline below **never shift** whichever font/effect is active — keep that clearance even though the logo is gone.

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

**STANDING DECISION — the hero title system is intentional and locked, not a placeholder or draft.** The font-cycle list (Space Grotesk / Unbounded / Anton / Syne), the effect-layer weighting (~60% reveal / ~30% ambient / ~10% rare, with Fuzzy/Particle dropped on mobile), and the reflective bottom-half gradient sheen described above were designed and approved on their own terms and look good as-is. **They are explicitly EXEMPT from matching `everstock-product-design-system.md`.** That doc governs the **product / app interface's** typography and material rules; this is the **marketing site's hero** — a separate, independently-built, already-working system that is *allowed to diverge*. Do NOT simplify, replace, "align," or "correct" the hero's fonts/effects to match the product design system in a future session — the divergence is deliberate and approved. (The reflective sheen here is conceptually related to the design system's "chrome material rendered as typography" idea, but the hero's specific execution stands on its own and does not need to be reconciled 1:1 with the product's material rules.)

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

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
