import type { CSSProperties, ReactNode } from "react";

/** Full-width industrial band. Content sits in a centered max-1160 inner that reveals on scroll. */
export function Band({
  id,
  tint,
  innerStyle,
  reveal = true,
  children,
}: {
  id?: string;
  tint: "blue" | "green";
  innerStyle?: CSSProperties;
  reveal?: boolean;
  children: ReactNode;
}) {
  return (
    <section id={id} className={`es-band es-panel--${tint}`}>
      <div className={`es-band-inner${reveal ? " es-reveal" : ""}`} style={innerStyle}>
        {children}
      </div>
    </section>
  );
}

/** Offset "tab" panel that extends from a screen edge (left or right). */
export function Tab({
  id,
  tint,
  side,
  children,
}: {
  id?: string;
  tint: "blue" | "green";
  side: "left" | "right";
  children: ReactNode;
}) {
  return (
    <section id={id} className={`es-tab es-tab--${side} es-panel--${tint} es-reveal`}>
      {children}
    </section>
  );
}

/** Numbered section eyebrow, e.g. "01 — THE LEAK" — monospace technical label. */
export function Eyebrow({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <p id={id} style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 500, letterSpacing: "0.3em", color: "var(--es-ink)", textShadow: "var(--es-glow)", margin: 0 }}>
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

/** Technical readout footer on a card, e.g. "SCAN INTERVAL … CONTINUOUS". */
export function CardMeta({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ marginTop: "auto", padding: "14px 0 15px", borderTop: "1px solid var(--es-edge)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, fontFamily: "var(--font-mono)", fontSize: 10.5, fontWeight: 500, letterSpacing: "0.16em", color: "var(--es-faint)" }}>
      <span>{label}</span>
      <span style={{ color: "var(--es-dim)" }}>{value}</span>
    </div>
  );
}
