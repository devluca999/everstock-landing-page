/**
 * Single source of truth for the responsive ladder + continuous interpolation.
 * Layout tiers (phone <768 / tablet 768-1024 / desktop >=1024) are handled in CSS;
 * the animation-heavy numbers interpolate smoothly so there are no hard cliffs.
 */
export const BP = { md: 768, lg: 1024 } as const;

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export interface Responsive {
  vw: number;
  isPhone: boolean;
  isTablet: boolean;
  isMobile: boolean; // below Tailwind lg
  t: number;
  beamCount: number;
  warpScale: number;
  dprCap: number;
}

/** @param beamMax desktop anchor for beam count (interpolation scales down from here) */
export function computeResponsive(vw: number, beamMax = 26): Responsive {
  const isPhone = vw < BP.md;
  const isTablet = vw >= BP.md && vw < BP.lg;
  const isMobile = vw < BP.lg;
  const t = clamp((vw - 480) / 800, 0, 1);
  // floor the phone anchor at min(10, beamMax) so a low max never inverts (phone > desktop)
  const beamLo = Math.min(10, beamMax);
  const beamCount = Math.max(1, Math.round(lerp(beamLo, beamMax, t)));
  const warpScale = lerp(0.12, 1.0, t);
  const dprCap = vw < BP.lg ? 1.5 : 2;
  return { vw, isPhone, isTablet, isMobile, t, beamCount, warpScale, dprCap };
}
