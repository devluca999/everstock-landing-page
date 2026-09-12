/**
 * Two-point ground-plane camera shared by the hero conveyor (HeroFloor) and the
 * lattice cutout (GridBackground), so the grid quietens over exactly the deck the
 * floor draws. World units ≈ metres: `t` runs along the belt (away from the camera),
 * `u` across it (toward the camera). The camera stands beside the belt at chest
 * height, yawed 26° off its axis; belt direction and roller direction each vanish to
 * their own point on ONE horizontal horizon. Every vertical is drawn straight up the
 * screen from its projected base — nothing in the scene carries a rotation transform.
 */
const TH = (26 * Math.PI) / 180;
export const CAM = {
  AX: -Math.sin(TH), // receding direction (lateral, depth)
  AY: Math.cos(TH),
  CX: -Math.cos(TH), // toward the camera
  CY: -Math.sin(TH),
  P0: { x: 2.2, y: 3.2 }, // belt origin
  HW: 1.8, // deck half-width
  CAMH: 1.05, // camera height above the deck surface
  F: 430 / 640, // focal length per px of buffer width
  HORIZON: 0.24, // horizonY as a fraction of buffer height — HORIZONTAL, never tilted
} as const;

export type Pt = { x: number; y: number; s: number };

/** Projector for a W×H buffer. `h` is world height above the deck surface. */
export function projector(W: number, H: number) {
  const F = CAM.F * W;
  const HY = CAM.HORIZON * H;
  return (t: number, u: number, h = 0): Pt => {
    const wx = CAM.P0.x + t * CAM.AX + u * CAM.CX;
    const wy = Math.max(0.4, CAM.P0.y + t * CAM.AY + u * CAM.CY);
    return { x: W / 2 + (F * wx) / wy, y: HY + (F * (CAM.CAMH - h)) / wy, s: F / wy };
  };
}

/** Deck footprint in screen space for a W×H target — the polygon the lattice sits back over. */
export function deckFootprint(W: number, H: number): Pt[] {
  const P = projector(W, H);
  const { HW } = CAM;
  return [P(-2.1, HW + 0.9), P(-2.1, -HW - 0.4), P(30, -HW - 0.4), P(30, HW + 0.9)];
}
