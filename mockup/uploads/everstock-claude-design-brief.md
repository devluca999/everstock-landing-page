# Everstock — Landing Page Design Brief

Paste the block under "PROMPT" directly into Claude Design. Everything above it is reference context if you need to answer follow-up questions.

---

## Positioning context (for your own reference, not necessarily verbatim on page)

Everstock is agentic procurement automation for mid-market distributors, starting with auto parts. Thesis: **deterministic spine, agentic edges** — price-threshold rules and PO execution run as deterministic logic against cached vendor data; LLM-agentic work (vendor discovery, quote parsing, negotiation drafting) runs in scheduled batches. This hero page is aimed primarily at the **economic buyer** (owner/GM/CFO) — lead with outcome and trust, not AI terminology. Keep the "stealth SaaS" framing: this reads as sharp procurement software first, agentic-commerce vocabulary second.

**Established brand system (do not deviate without reason):** Graphite is the primary base, not white. Electric blue is reserved exclusively as a meaning-carrying signal for agent activity — it should never be decorative. Chrome and carbon-fiber textures were explicitly considered and rejected (chrome reads dated, carbon fiber adds competing visual noise) — keep all surfaces clean and quiet so blue is the only thing that pops. There's also a symbol mark: an infinite loop that doesn't fully close, its open tail resolving into a "C" — it doubles as the live/working indicator when a blue beam traces through the open loop. Bring this into the nav as the logo, not just a plain "EVERSTOCK" wordmark.

---

## PROMPT — paste into Claude Design

Design a landing page hero for **Everstock**, an agentic procurement platform for mid-market auto parts distributors. **Graphite is the primary mode** — deep charcoal, near-black but with a warm neutral undertone, not cold pure black or blue-black. Treat a lighter mode as the secondary/alt toggle, not the default.

**Visual system (graphite / primary):**
- Background: deep graphite (~#16171B), warm-neutral undertone
- A full-bleed grid lattice of thin lines that gently "breathes" — each intersection warps on overlapping sine waves (not a rigid grid), plus a slow uniform scale pulse so the whole lattice expands and contracts, like fabric breathing. Soothing speed, full cycle roughly 10-15 seconds. Grid line color: light warm-grey at low opacity (~10-12%) — present but quiet, graphite surface should feel premium and uncluttered, not busy.
- 6-8 (restrained, not a spam of particles) electric-blue glowing data beams that trace along the grid's actual warped paths, each with a fading trail and glow head, like agentic work moving through deterministic rails. Against graphite the glow should read crisp and precise — this contrast is the primary "premium" signal, lean into it. Calm, unhurried pace.
- Logo mark in the nav: the open-loop/incomplete-infinity symbol (open tail forms a "C") standing in for or alongside the wordmark, with a thin blue beam occasionally tracing through the loop as a subtle "live" cue — sparing, not constant.

**Visual system (light / secondary alt mode):**
- Pure white background (#FFFFFF), same grid+beam logic, grid lines near-black at low opacity (~15%), beams stay electric blue (#0B5FFF)
- This is the toggle-away mode, not what a first-time visitor sees by default

**Guardrails:** No chrome, no carbon-fiber texture, no glassmorphism/gradient-mesh AI-startup clichés. Electric blue must not appear anywhere on the page except where it's signaling actual agent/system activity (beams, live indicator, maybe the CTA hover state) — if it's used decoratively elsewhere, it dilutes the meaning.

**Text and button colors on graphite:** Title and body copy in warm off-white (~#F2F1ED), not pure white — keeps the premium/warm-neutral feel consistent with the graphite base. Primary CTA as a solid off-white pill with graphite text (inverted from a typical dark-on-light button); secondary CTA as an outlined pill, light border, transparent fill. Reserve actual electric blue for the CTA hover/focus state only, consistent with "blue means agent activity."

**Typography — hero title only ("EVERSTOCK"), two independent systems running on separate clocks:**

**System 1 — base font cycle (continuous, this is the norm).** Rotates through pristine → edgy static fonts every 1.5-4s using the existing plain blur/scale swap: Space Grotesk (default, most frequent, held longest), Unbounded, Anton, Syne. This is what's showing 90%+ of the time. Never repeat the same font twice in a row.

**System 2 — occasional effect layer (separate, infrequent event).** Independently timed, low-probability trigger — fires roughly every 20-40 seconds, not on a fixed beat, so it feels like a moment rather than part of the loop. When it fires, it interrupts the base cycle to play one effect from reactbits.dev on whatever text is currently up, then hands control back to System 1.

Effects available to this layer, in three weight classes:
- Reveal effects (most common of this layer, ~60% weight): Shuffle (scramble-decode), Text Type (typewriter), Split Flap (departure-board flip), Masked Heading (clip/wipe reveal) — plays once as a one-off "arrival" moment.
- Ambient effects (~30% weight): Shiny Text (sheen sweep), Stroke Text (outline pulse), Warp Text (gentle continuous distortion), Echo Text (trailing ghost), Depth Text (parallax/3D) — loops briefly (~2-3s) then fades back to the base cycle.
- Rare/signature effects (~10% weight, and never more than once per minute): Fuzzy Text, Particle Text — heaviest novelty, reserve for genuine flourish. Also fine to use one of these as a one-time first-load entrance before System 1 and 2 start running.

**Rules for both systems:**
- At every single frame, "EVERSTOCK" must stay legible — no effect should make it unreadable if screenshotted mid-animation.
- Everything else on the page (nav, body copy, buttons) stays static and quiet — the cycling and the occasional-effect layer are reserved for the hero title only, so the page doesn't feel unstable.

**Copy:**
- Nav: EVERSTOCK · PLATFORM · PRICING · COMPANY · LOG IN
- Eyebrow (small, electric blue, uppercase, tracked out): AGENTIC PROCUREMENT, DETERMINISTIC TRUST
- H1: EVERSTOCK
- Tagline: Deterministic spine. Agentic edges. Every dollar approved before it moves.
- Primary CTA: Request access
- Secondary CTA: See how it works
- Scroll hint: Scroll

**Below the fold (starter copy, expand as needed):**
- Problem: You're already spending thousands a month on tires, filters, brake pads, and fluids — with no visibility into price.
- Solution: Everstock's agent watches vendor pricing and executes purchases inside limits you set. Every action shows up in your approval queue before it moves a dollar.
- Trust: Nothing is automatic by default. Proposed → Approved → Executed — you're never surprised by a decision you didn't see coming.

**Tone:** Confident, precise, calm. This is infrastructure-grade software for people who move real money, not a flashy AI demo. Avoid gradient-mesh/glassmorphism AI-startup clichés — the grid-and-beam system IS the brand signature, lean into it rather than layering generic effects on top.

---

## Design system note

Since this hero doubles as the seed for the broader design system: treat the breathing grid, the electric-blue accent, and the pristine→edgy title spectrum as the three load-bearing signature elements. Everything else (buttons, cards, section dividers) should stay quiet and let those three carry the brand — resist the urge to add more "AI-coded" visual noise (particles everywhere, gradient blobs, glow-on-everything) as you build out further pages, or it undercuts the deterministic-trust positioning with the economic buyer.
