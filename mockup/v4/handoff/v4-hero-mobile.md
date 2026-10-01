# Everstock v4 · hero on phones + eyebrow (2026-10-01)

Apply these to `Everstock v4.dc.html`, in order. The site already runs them (port patches in the repo, `scripts/port-patches/v4-hero-mobile.mjs`); once they are in this file, delete that module's entries so design and code stay one source.

Each FIND occurs exactly once. Logic changes are in the logic `<script>`; the template change is in the markup.



## Logic 1. Hero, phones: measure where the hero CTA row ends, so the conveyor crop starts just below it

FIND
```js
this.floorCrop = window.innerWidth < 900 && H > W * 1.05;
```

REPLACE WITH
```js
this.floorCrop = window.innerWidth < 900 && H > W * 1.05;
      if (this.floorCrop) { const ct = document.getElementById('hero-cta'), r = ct && ct.getBoundingClientRect(); this.cropTop = r && r.height ? Math.max(0.4, Math.min(0.66, (r.bottom + window.scrollY + 12) / window.innerHeight)) : 0.52; }
      // the CTA row only settles once the web fonts and the title box have laid out
      if (this.floorCrop && !this.cropSettle) { this.cropSettle = true; if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (!this.dead) size(); }); setTimeout(() => { if (!this.dead) size(); }, 900); }
```

## Logic 2. Hero, phones: frame the whole conveyor (crane gantry ~12% of the scene height, crates ~24-60%, gears ~60-88%: the window is 5% to 93%, centred right of the belt so the pick-and-place arm stays in frame) in the area below the CTA row, instead of the near side frame only

FIND
```js
ch0 = crop ? H * 0.74 : H, dh = crop ? ah * 0.58 : ah, cw0 = crop ? Math.min(W * 0.62, ch0 * aw / dh) : W, cx0 = crop ? Math.min(W - cw0, W * 0.42) : 0, cy0 = crop ? H - ch0 : 0, dy = ah - dh;
```

REPLACE WITH
```js
ch0 = crop ? H * 0.88 : H, dh = crop ? Math.round(ah * (1 - (this.cropTop || 0.52))) : ah, cw0 = crop ? Math.min(W, ch0 * aw / dh) : W, cx0 = crop ? Math.max(0, Math.min(W - cw0, W * 0.6 - cw0 / 2)) : 0, cy0 = crop ? H * 0.05 : 0, dy = ah - dh;
```

## Logic 3. Hero, phones: the fade starts at the crop's top edge and reaches full strength quickly, so the crane and crates are not faded out

FIND
```js
const wide = window.innerWidth >= 900, key = W + 'x' + H + (wide ? 'w' : 'n');
```

REPLACE WITH
```js
const wide = window.innerWidth >= 900, ct0 = !wide && this.floorCrop ? this.cropTop || 0.52 : 0, key = W + 'x' + H + (wide ? 'w' : 'n') + ct0;
```

## Logic 4. (same) the fade stops

FIND
```js
else { const a = g.createLinearGradient(0, 0, 0, H); a.addColorStop(0, 'rgba(0,0,0,0)'); a.addColorStop(0.46, 'rgba(0,0,0,0)'); a.addColorStop(0.64, 'rgba(0,0,0,0.6)'); a.addColorStop(0.8, '#000'); a.addColorStop(1, '#000'); g.fillStyle = a; }
```

REPLACE WITH
```js
else { const a = g.createLinearGradient(0, 0, 0, H), s0 = ct0 ? ct0 : 0.46, s1 = ct0 ? Math.min(0.95, ct0 + 0.05) : 0.64, s2 = ct0 ? Math.min(0.97, ct0 + 0.12) : 0.8; a.addColorStop(0, 'rgba(0,0,0,0)'); a.addColorStop(s0, 'rgba(0,0,0,0)'); a.addColorStop(s1, 'rgba(0,0,0,0.6)'); a.addColorStop(s2, '#000'); a.addColorStop(1, '#000'); g.fillStyle = a; }
```

## Template 1. Hero eyebrow copy (Luca, 2026-10-01): "Software built for your supply chain" (set in caps by the design's style)

FIND
```html
>SUPPLY CHAIN SOFTWARE BUILT FOR YOUR PHYSICAL PRODUCTS</p>
```

REPLACE WITH
```html
>SOFTWARE BUILT FOR YOUR SUPPLY CHAIN</p>
```
