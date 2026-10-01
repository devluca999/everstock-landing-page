/**
 * v4 hero, 2026-10-01 (Luca): on phones the conveyor crop showed the near side frame and
 * gears while the crates and the crane fell in the faded band under the copy; and the
 * eyebrow copy changes. Applied by scripts/port-dc.mjs at port time (anchors match
 * exactly once). The same pairs are the change list for the Claude Design v4 file.
 */

export const logicPatches = [
  {
    why: "Hero, phones: measure where the hero CTA row ends, so the conveyor crop starts just below it",
    find: "this.floorCrop = window.innerWidth < 900 && H > W * 1.05;",
    replace:
      "this.floorCrop = window.innerWidth < 900 && H > W * 1.05;\n" +
      "      if (this.floorCrop) { const ct = document.getElementById('hero-cta'), r = ct && ct.getBoundingClientRect(); this.cropTop = r && r.height ? Math.max(0.4, Math.min(0.66, (r.bottom + window.scrollY + 12) / window.innerHeight)) : 0.52; }\n" +
      "      // the CTA row only settles once the web fonts and the title box have laid out\n" +
      "      if (this.floorCrop && !this.cropSettle) { this.cropSettle = true; if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (!this.dead) size(); }); setTimeout(() => { if (!this.dead) size(); }, 900); }",
  },
  {
    why: "Hero, phones: frame the whole conveyor (crane gantry ~12% of the scene height, crates ~24-60%, gears ~60-88%: the window is 5% to 93%, centred right of the belt so the pick-and-place arm stays in frame) in the area below the CTA row, instead of the near side frame only",
    find: "ch0 = crop ? H * 0.74 : H, dh = crop ? ah * 0.58 : ah, cw0 = crop ? Math.min(W * 0.62, ch0 * aw / dh) : W, cx0 = crop ? Math.min(W - cw0, W * 0.42) : 0, cy0 = crop ? H - ch0 : 0, dy = ah - dh;",
    replace:
      "ch0 = crop ? H * 0.88 : H, dh = crop ? Math.round(ah * (1 - (this.cropTop || 0.52))) : ah, cw0 = crop ? Math.min(W, ch0 * aw / dh) : W, cx0 = crop ? Math.max(0, Math.min(W - cw0, W * 0.6 - cw0 / 2)) : 0, cy0 = crop ? H * 0.05 : 0, dy = ah - dh;",
  },
  {
    why: "Hero, phones: the fade starts at the crop's top edge and reaches full strength quickly, so the crane and crates are not faded out",
    find: "const wide = window.innerWidth >= 900, key = W + 'x' + H + (wide ? 'w' : 'n');",
    replace:
      "const wide = window.innerWidth >= 900, ct0 = !wide && this.floorCrop ? this.cropTop || 0.52 : 0, key = W + 'x' + H + (wide ? 'w' : 'n') + ct0;",
  },
  {
    why: "(same) the fade stops",
    find: "else { const a = g.createLinearGradient(0, 0, 0, H); a.addColorStop(0, 'rgba(0,0,0,0)'); a.addColorStop(0.46, 'rgba(0,0,0,0)'); a.addColorStop(0.64, 'rgba(0,0,0,0.6)'); a.addColorStop(0.8, '#000'); a.addColorStop(1, '#000'); g.fillStyle = a; }",
    replace:
      "else { const a = g.createLinearGradient(0, 0, 0, H), s0 = ct0 ? ct0 : 0.46, s1 = ct0 ? Math.min(0.95, ct0 + 0.05) : 0.64, s2 = ct0 ? Math.min(0.97, ct0 + 0.12) : 0.8; a.addColorStop(0, 'rgba(0,0,0,0)'); a.addColorStop(s0, 'rgba(0,0,0,0)'); a.addColorStop(s1, 'rgba(0,0,0,0.6)'); a.addColorStop(s2, '#000'); a.addColorStop(1, '#000'); g.fillStyle = a; }",
  },
];

export const templatePatches = [
  {
    why: "Hero eyebrow copy (Luca, 2026-10-01): \"Software built for your supply chain\" (set in caps by the design's style)",
    find: ">SUPPLY CHAIN SOFTWARE BUILT FOR YOUR PHYSICAL PRODUCTS</p>",
    replace: ">SOFTWARE BUILT FOR YOUR SUPPLY CHAIN</p>",
  },
];
