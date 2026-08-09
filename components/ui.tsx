import type { CSSProperties, ReactNode } from "react";

export function Panel({
  id,
  tint,
  side,
  children,
  className = "",
  style,
}: {
  id?: string;
  tint: "blue" | "green";
  side?: "left" | "right";
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <section id={id} data-side={side} className={`es-panel es-panel--${tint} ${className}`} style={style}>
      {children}
    </section>
  );
}

/** Numbered section eyebrow, e.g. "01 — THE LEAK" */
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p style={{ fontFamily: "var(--font-space)", fontSize: 11.5, fontWeight: 700, letterSpacing: "0.28em", color: "var(--es-ink)", textShadow: "var(--es-glow)", margin: 0 }}>
      {children}
    </p>
  );
}

export function PrimaryCta({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className="es-cta-primary"
      style={{ fontFamily: "var(--font-space)", fontSize: 13, fontWeight: 500, letterSpacing: "0.08em", background: "var(--es-ink)", color: "var(--es-bg)", borderRadius: 999, padding: "15px 32px", display: "inline-block" }}
    >
      {children}
    </a>
  );
}

export function SecondaryCta({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className="es-cta-secondary"
      style={{ fontFamily: "var(--font-space)", fontSize: 13, fontWeight: 500, letterSpacing: "0.08em", color: "var(--es-ink)", border: "1px solid var(--es-line)", borderRadius: 999, padding: "15px 32px", display: "inline-block" }}
    >
      {children}
    </a>
  );
}
