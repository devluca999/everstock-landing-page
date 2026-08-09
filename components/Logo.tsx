/**
 * Everstock mark: an infinite loop that doesn't fully close, its open tail
 * resolving into a "C". A blue beam occasionally traces through the open loop
 * (live/working indicator). `beam` toggles that animated trace.
 */
const PATH =
  "M21,13 C18,4.5 6,4.5 6,13 C6,21.5 18,21.5 21,13 C23.2,7.5 28.4,3.6 35.66,7.34 A8.5,8.5 0 1 0 35.66,18.66";

export default function Logo({ width = 64, height = 39, beam = true }: { width?: number; height?: number; beam?: boolean }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 44 26"
      fill="none"
      aria-hidden="true"
      style={{ display: "block", overflow: "visible", filter: "drop-shadow(var(--es-logo-glow,0 0 20px rgba(16,17,21,0.9)))" }}
    >
      <path d={PATH} stroke="var(--es-ink,#FAF9F5)" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      {beam && (
        <path
          d={PATH}
          stroke="#0B5FFF"
          strokeWidth="2.8"
          strokeLinecap="round"
          fill="none"
          strokeDasharray="16 130"
          style={{ animation: "esLogoBeam 17s linear infinite", filter: "drop-shadow(0 0 7px rgba(11,95,255,0.9))" }}
        />
      )}
    </svg>
  );
}
