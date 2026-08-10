/**
 * Everstock's locked mark: the segmented chrome infinity (lemniscate faceted via
 * stroke-dasharray into discrete chrome segments). Display cut (12 facets, >=24px)
 * is used everywhere on the marketing site; the 7-facet small cut is favicon-only.
 * Theme-inverted tones (bright chrome on graphite, dark chrome on eggshell) are
 * baked into the two SVG files and swapped by [data-theme] in CSS — flash-free,
 * no ID collisions (each <img> is an isolated document). Static, no beam.
 */
export default function Logo({ height = 40, className = "" }: { height?: number; className?: string }) {
  const width = Math.round((height * 64) / 40); // marks are 64x40 (8:5)
  return (
    <span className={`es-logo ${className}`.trim()} aria-hidden="true" style={{ display: "inline-flex", lineHeight: 0 }}>
      <img src="/logo/logo-mark-dark.svg" alt="" width={width} height={height} className="es-logo-img es-logo-dark" />
      <img src="/logo/logo-mark-light.svg" alt="" width={width} height={height} className="es-logo-img es-logo-light" />
    </span>
  );
}
