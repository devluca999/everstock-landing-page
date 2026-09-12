# Everstock — Full Page Narrative & Hologram System Design Brief (v2 — assets locked)

For: Claude Design session, using the "Everstock Design System" design system and "ui-wizard" skill against the `everstock-landing-page` codebase.

This brief restructures the page's hologram usage and finalizes section-by-section narrative. It does **not** touch the hero — hero stays exactly as built. Everything below covers what comes after it.

**This is being sent alongside the separate Q3 revision brief** (branding/copy fixes — removing false cert claims, fixing the broken stat, tagline-stream trust bar, etc.). Build both in the same pass.

**Status: all hologram assets are now generated and locked.** This supersedes the earlier stub-first version of this brief — the placeholder-container approach is no longer needed for the assets listed below; drop the real media in directly. If any asset filename/link is missing at build time, fall back to a labeled placeholder container matching the correct aspect ratio rather than blocking the build.

---

## Governing principle

Three categories of hologram, each doing a different job:

1. **Paired icon-holograms** (small, quiet, textural) — two objects composed together in one scene, each pairing living in a different section, each with its own motion behavior. Two pairings on the page, one per small-hologram section.
2. **Narrative-holograms** (one big showcase, animated, mechanism-demonstrating) — consolidated into a single section, told as four sequential beats along a progressive-disclosure LED dot rail.
3. **The Everstock mark** — appears within Beat 2 (sourcing) as a live coded component, not a generated asset. See dedicated section below.

No hologram appears anywhere else on the page. Sections without holograms exist specifically to let the eye rest before/after a hologram moment — don't fill that quiet with a visual that competes.

---

## Locked visual style (applies to every hologram asset on the page)

- **No border or frame** around any hologram — objects sit directly in their page section against the ambient background, not inside a bordered viewport panel.
- **Background:** a full-bleed lattice of thin white/light-grey grid lines on the dark graphite background, quiet and subtle — matching the site's existing persistent grid background exactly. This replaces the earlier "dark viewport inset" approach; holograms are not boxed off from the page, they sit in the same grid the rest of the page uses.
- **Object rendering:** every object (documents, gear, screw, robotic arm, crane, worker figures, package icons) is a solid, dark navy filled form with a fine light-blue wireframe grid mesh overlaid across its entire surface, tracing its real structure and contours — not flat 2D line art, not a hyper-detailed photoreal 3D render. A deliberate "good in-between" fidelity: confident technical-illustration quality, Spider-Verse-adjacent pen-scrub energy without tipping into cartoon.
- **Figures (workers, people):** when a human figure appears, use blocky, simplified, chunky proportions — a minifig/voxel-adjacent stylization (think generically "blocky simplified pictogram figure," not any named copyrighted character system) — rendered with the *same dimensional wireframe-mesh fidelity* as every other object in the scene. This consistency-of-fidelity rule is important: a flat 2D pictogram figure standing next to a dimensional wireframe object reads as a mismatch and breaks the illusion of one coherent world. Confirmed working reference: the Beat 3 approval-queue workers.
- **Annotations:** sparse, thin light-blue (or status-colored, see below) schematic leader lines pointing to small labeled captions — real spec-sheet/blueprint energy. Labels must always be present and legible, correctly spelled. This is a recurring device across nearly every asset, not just the showcase beats.
- **Quality bar:** motion should read as confidently produced as Doss (doss.com) and Muse (meuze.ai) — smooth, cinematic easing, not stiff or mechanical. Worth an extra iteration on any beat where the motion feels rushed rather than accepting the first pass.

---

## Full section order

### 1. Nav
Unchanged. Textured pill fix still pending separately — not this brief's concern.

### 2. Hero
**Do not touch the visuals** — breathing grid, cycling title, beams, subheading, dual CTA are already locked and built correctly. **Eyebrow copy is now finalized:** "Digital intelligence, deterministic trust." (the alliterative device this line uses is intentionally echoed by the trust bar and the outcome-stream section below, tying the three moments together).

### 3. Trust bar
Slow-scroll/fade-cycle tagline stream, no logos, no hologram:
> Deterministic spine, agentic edges · Nothing moves a dollar without approval · Built for auto parts distributors · Works with your existing ERP · Human-in-the-loop by default · No rip-and-replace

### 4. The Leak — PAIRED ICON-HOLOGRAM: Screw + Gear
**Copy job:** make the financial pain concrete and specific, *and* introduce the SKU/spec-precision story — the idea that a wrong-color screw on the wrong production line is a real, disqualifying failure, straight from a design-partner discovery conversation. This is "you define the spec, Everstock matches it exactly."
**Hologram:** a minimal, boxy Phillips-head screw and a minimal boxy gear, composed together as companion components of the same assembly, both in the locked wireframe-mesh style. **Motion — alternating focus cycle:** one object sits centered and large, in sharp focus, with its technical spec annotation leader lines actively visible (thread pitch, head finish, coating for the screw; tooth count, material, tolerance for the gear); the other sits small, shrunk into a corner, out of focus, annotations inactive. Roughly every 1.5 seconds they swap — the focused object shrinks to a *different* corner each time, annotations fade; the cornered object grows to center, comes into focus, and its own annotations activate. This cycle continues indefinitely.
**Tone:** blunt, not soft. Draft direction: "You're already spending thousands a month on tires, filters, brake pads, and fluids — with no visibility into whether you're getting the best price." Pair with a second, sharper line specifically about spec precision (e.g. referencing the screw-color example) — this is new copy to be written, not yet drafted.

### 5. The System (Watch / Propose / Execute) — NO HOLOGRAM
Explains the mechanism in plain copy only. Include one light integration-reassurance line here (Muse-style: state plainly that Everstock connects to what they already run, replaces none of it) — this defuses the "will this even work with my systems" objection early, without pulling the full integrations section forward.
**Visual:** solid panel, quiet, no hologram. This section's job is to set up the big showcase that follows.

### 6. The Guardrail — BIG SHOWCASE (centered, all narrative holograms live here)
The page's single largest trust-building moment. One continuous section, centered layout, driven by a progressive-disclosure LED dot rail. Four sequential beats:

**Beat 1 — Document prefilling.** Cross-section/edge-on document stack glides in, one document peels off and rotates to face the camera dead-on in the locked wireframe-mesh style, scan-line sweep, key fields (vendor/price/qty) autofill with a glow, annotation leader lines calling out each field. Smallest atomic unit.

**Beat 2 — Sourcing.** The Everstock mark sits centrally as the active searching agent — **see the dedicated "Everstock mark" section below; this is a live composited component, not a generated asset, and the generated video must leave its center space empty/reserved.** Around it, three small holographic storefront/building glyphs (vendors) fan out in a loose arc, each labeled. As the mark processes, vendor storefronts are evaluated one at a time: each blinks **orange** two to three times (actively evaluating), then resolves to either **green→blue** (approved/favorable) or **red→blue** (disapproved), before moving to the next. Same four-color status language as Beat 3.

**Beat 3 — Approval queue (assembly line).** Viewed head-on: a conveyor belt runs across the frame carrying package icons, most resting in **blue**. Three blocky, dimensional worker figures (same wireframe-mesh fidelity as the belt and packages — do not render them flat) stand *behind* the belt, facing the camera, at consistent depth — never on top of or overlapping the belt surface. Each performs a distinct action: one inspects a package with a magnifying glass (glows **orange**, blinking two to three times); the middle worker stamps an approved package (**green** flash, pushed forward, settles to **blue**); the third lifts a flagged package into a visible holding tray (**red**, stays visible, never deleted). Four-color status language:
- **Blue** — resting/normal
- **Orange** — actively being checked (blinks 2-3x)
- **Green** — approved, brief flash, returns to blue
- **Red** — held for review, physically set aside into a visible tray, never vanishes

This is a closed loop, many independent objects each cycling through their own state, not a single linear arc.

**Beat 4 — Timeline reconciliation.** The emotional close of the showcase, and the most structurally complex beat. Two layers stacked vertically:
- **Top layer — documents.** Starts scattered and disorganized, glowing red.
- **Bottom layer — spreadsheets.** Starts cracked/shattered like broken glass, glowing red.

Four (start) to six (resolved) schematic leader lines point to small rendered charts and text labels — mix of line-graph and arrow/percentage-indicator chart types, varied diagonal positions (top-left, bottom-right, etc.) for visual rhythm. Start-state labels: "unreconciled orders," "scattered spreadsheets," plus declining stat charts. Resolved-state labels (six total): "reconciled documents," "production history," "improved margin visibility," "uniform timeline," "demand forecast accuracy," "production planning accuracy" — all charts trending upward.

**Motion — two-phase floating whirlwind (not a solid tornado funnel):** individual sheets flutter and orbit loosely, papers-caught-in-wind style (each sheet visibly separate, tumbling with its own rotation, never fused into one solid cone). Phase 1: the top layer's documents swirl in their own independent cluster; the bottom layer's spreadsheets swirl in their own separate independent cluster. Phase 2: the two clusters drift together, briefly intermingle, then separate back apart, with sheets settling one by one into two final organized rows — documents landing individually left-to-right on top; spreadsheets **fully repairing** (crack lines heal completely, ending totally solid, no fractures anywhere) and landing individually left-to-right on bottom.

**Color behavior — two distinct languages, do not conflate:**
- *Main content* (documents, spreadsheets): red → orange → green as it resolves, then **cools further to a resting blue** once settled. This is the "healthy resting state" behavior used elsewhere on the page.
- *Schematic charts and labels*: these are status indicators, not physical objects — they do **not** fade to blue. They stay red while broken, and switch to and *permanently remain green* once resolved. The charts themselves actively animate (not static swaps): they fade in already animating a decline in red at the start (e.g. a line graph dropping from 60% toward 0%, an arrow ticking downward), freeze static during the orange mid-transition, then resume active upward animation in green once resolved (e.g. climbing from 40% toward 100%).

Let this beat land with more weight/duration than the other three — it's the closing note of the entire section.

**Everything else in this section stays quiet** — no competing copy blocks, no secondary visuals beyond the dot rail and the four beats.

### 7. The Contract (banner) — NO HOLOGRAM
Short typographic reinforcement line only, transitional.

### 8. Your Desk (ops reassurance) — NO HOLOGRAM
"Not obsolete" reassurance for the day-to-day ops/procurement user. Quiet, light UI mockup only.

### 9. Your Stack — PAIRED ICON-HOLOGRAM: Robotic Arm + Crane
**Copy job:** full integrations list, monochrome, calm — Epicor Vision/Eagle, MAM/Kerridge, Nexpart, PartsTech, SPS Commerce, TrueCommerce, plus Excel/spreadsheet import-export. Last feasibility objection cleared before conversion.
**Hologram:** a holographic industrial robotic arm as the larger primary element, and a smaller companion crane beside it, both in the locked wireframe-mesh style, positions fixed. **Motion — independent asynchronous actions, not position-swapping** (deliberately different visual language from the section 4 pairing): the robotic arm lifts, reaches, angles its joint, and closes its gripper claw as if grabbing something, then releases and returns to rest. Independently, on a different timing interval, the crane lowers its lifting line/hook, pauses briefly, then raises it back up. The two actions run asynchronously, not synchronized to each other.

### 10. Outcome stream — NO HOLOGRAM (renamed from "Stat section")
No real numbers exist yet (pending Charles's data), so this section is **not** a numeric stat block. Instead, reuse the exact same flowing marquee/tagline-stream device already built for section 3 (the trust bar) — same left-to-right scroll mechanic, same quiet visual treatment — but swap the content from capability taglines to **outcome promises**: what the visitor should expect to gain, stated plainly and without invented numbers. Draft direction (placeholder copy, refine before ship): "Fewer stockouts · Faster vendor response · Cleaner audit trail · Prices you can actually compare · Time back for your ops team · No more spreadsheet reconciliation." Reusing the established marquee pattern here (rather than inventing a new stat-block UI to paper over missing data) is the deliberate choice — once real numbers exist, this can either gain a tabular-figure companion stat elsewhere or be revisited, but it should not be replaced with placeholder/fake statistics in the meantime.

### 11. Final CTA — NO HOLOGRAM
Not a bare repeat of the hero CTA line alone — precede it with a short, plain-spoken summary of the core value case (2-3 sentences, synthesizing what the visitor just walked through: the trust architecture, the precision, the fit with existing systems), then the CTA itself, copy matching the hero CTA exactly ("Request access" / "See how it works"). Keep it simple — do not overcomplicate or introduce new claims here — the intentionality is in the restraint: a clean recap, not a new pitch.

### 12. Footer — NO HOLOGRAM
Quiet, honest. Certification badges removed (not yet earned); "Security & compliance →" link retained as a page promise, not a claim.

---

## The Everstock mark in Beat 2 (sourcing) — composited live component, not a generated asset

The mark's geometry (a closed figure-eight lemniscate, 12 discrete chrome facets, 6 per lobe, with visible gaps between facets) and its defined motion states are precise and already built as a real coded component (`Identity.jsx`) in the design system:

1. **Rest** — 12 separated facets, static.
2. **Unify** (~220ms) — facets merge into one continuous closed loop.
3. **Loading loop** — while active, a wide glowing blue beam (filling the loop's full cross-section, not a thin trace) travels continuously around the unified loop, reading as the metal itself lighting up.
4. **Resolve** (reverse of unify) — the loop separates back into 12 resting facets.

Do not attempt to regenerate this mark via AI image/video generation for use inside the hologram scene — reconstructing this geometry (especially the center crossing point, which must stay built from small uniform facets, never collapse into one solid shape) proved unreliable across many attempts. Instead: the generated Beat 2 video leaves an intentionally empty/reserved space at the center where the vendor storefronts fan out around it; the real, live-animated logo component is composited into that reserved space at build time, running its actual defined CSS/motion states in sync with the surrounding generated hologram content.

---

## Icon-hologram inventory (all locked, all in the locked wireframe-mesh style)

Individual solo assets (used standalone in some contexts, e.g. the robotic arm is dual-purpose and can also stand alone if needed):
- **Robotic arm** — idle motion: small mechanical joint adjustments, gripper gently opening/closing, plus a brief self-correcting glitch (mesh doubles/misaligns momentarily, snaps back to precise register).
- **Gear** (solo version) — continuous rotation; a fixed solid/wireframe-mesh split boundary (in world space) that the gear rotates through, so different teeth alternate between appearing solid and appearing as open wireframe as they pass through the split.
- **Crane** — same idle-motion-plus-glitch treatment as the robotic arm.

Paired compositions (as used in the actual page sections):
- **Screw + Gear** (section 4, The Leak) — alternating focus cycle, described above.
- **Robotic Arm + Crane** (section 9, Your Stack) — independent asynchronous actions, described above.

## Locked asset URLs (direct drop-in, no placeholder needed)

**Big showcase beats (section 6):**
- Beat 1 — Document prefilling: https://d8j0ntlcm91z4.cloudfront.net/user_3FMfW2x8TD9jPPPVdRryKluSeEm/hf_20260823_044129_df5c7c84-21ca-45c9-89ba-2969cca48cb4.mp4
- Beat 2 — Sourcing (center reserved for composited logo mark): https://d8j0ntlcm91z4.cloudfront.net/user_3FMfW2x8TD9jPPPVdRryKluSeEm/hf_20260823_050644_7df87958-7671-429e-babe-93acdeeef922.mp4
- Beat 3 — Approval queue: https://d8j0ntlcm91z4.cloudfront.net/user_3FMfW2x8TD9jPPPVdRryKluSeEm/hf_20260823_052642_1d43c521-6909-47da-af26-1642ff625320.mp4
- Beat 4 — Reconciliation: https://d8j0ntlcm91z4.cloudfront.net/user_3FMfW2x8TD9jPPPVdRryKluSeEm/hf_20260823_060719_0059b8f8-07d7-4d7b-b6fa-0fec8004f1bf.mp4

**Paired icon-holograms:**
- Screw + Gear (section 4, The Leak — alternating focus cycle): https://d8j0ntlcm91z4.cloudfront.net/user_3FMfW2x8TD9jPPPVdRryKluSeEm/hf_20260823_062652_30ad984f-c21b-4fed-b2bf-009ad6be990e.mp4
- Robotic Arm + Crane (section 9, Your Stack — independent async actions): https://d8j0ntlcm91z4.cloudfront.net/user_3FMfW2x8TD9jPPPVdRryKluSeEm/hf_20260823_062700_d5c6c6b7-e767-4508-be39-29cfa4c67af8.mp4

**Solo assets (available if needed elsewhere, e.g. standalone robotic arm use):**
- Gear (rotating, solo): https://d8j0ntlcm91z4.cloudfront.net/user_3FMfW2x8TD9jPPPVdRryKluSeEm/hf_20260823_043548_3d2e7f4b-630a-47e7-b24c-b5c431fdf20d.mp4
- Robotic arm (idle + glitch, solo): https://d8j0ntlcm91z4.cloudfront.net/user_3FMfW2x8TD9jPPPVdRryKluSeEm/hf_20260823_061302_22cdd5a2-b3f5-4c89-8a43-5e5c8bdb48e3.mp4
- Crane (idle + glitch, solo): https://d8j0ntlcm91z4.cloudfront.net/user_3FMfW2x8TD9jPPPVdRryKluSeEm/hf_20260823_061308_f7a17cb1-a6a1-4f73-88a3-6dbfc64668a7.mp4

All confirmed `completed` and hosted on Higgsfield's CDN as of this brief's writing. If any link 404s at build time, regenerate from the corresponding locked reference still described above rather than guessing at a replacement style.

## Alignment rhythm summary

Small pairing (section 4) → quiet → **BIG showcase, four beats (section 6)** → quiet → small pairing (section 9)

This is the page's visual heartbeat below the hero — deliberate, not templated, with the two small pairings framing the one big showcase.
