import TitleCycle from "./TitleCycle";
import { PrimaryCta, SecondaryCta } from "./ui";

export default function Hero() {
  return (
    <section
      id="top"
      className="es-fullvh"
      style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(96px,13vh,120px) 40px 0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}
    >
      <p style={{ fontFamily: "var(--font-space)", fontSize: 11, fontWeight: 500, letterSpacing: "0.34em", color: "#0B5FFF", textShadow: "0 0 26px rgba(11,95,255,0.55)", margin: "0 0 clamp(22px,3vh,34px)" }}>
        PROCUREMENT FOR PARTS DISTRIBUTORS
      </p>

      {/* Fixed-height clearance zone for the title. Its height reserves the WORST-CASE
          title box (tallest font, e.g. Anton scale 1.16, + effect-layer transform
          overflow). The title overflows this box visually if it ever needs to, but the
          box height never changes — so nothing above it (the eyebrow) or below it (the
          tagline) reacts to the title's live font/effect state. overflow:visible keeps
          effects unclipped. */}
      <div style={{ width: "100%", height: "clamp(120px, 20.5vw, 300px)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "visible" }}>
        <TitleCycle />
      </div>

      {/* statement column: 36ch holds the 32/31-character lines square under the wordmark.
          The hero sits over the solid→conveyor crossover, so this keeps --es-glow (the
          scrim-like halo) — it is plain text, not a clipped gradient. */}
      <p className="es-hl" style={{ fontFamily: "var(--font-space)", fontWeight: 600, fontSize: "clamp(1.3rem,2.4vw,2.05rem)", lineHeight: 1.18, letterSpacing: "-0.02em", color: "var(--es-ink)", textShadow: "var(--es-glow)", margin: "clamp(24px,3vh,40px) 0 0", maxWidth: "36ch" }}>
        <span className="es-line">Everstock learns your operation.</span>{" "}
        <span className="es-line" style={{ color: "var(--es-dim)" }}>Then it buys the way you would.</span>
      </p>
      <p style={{ fontFamily: "var(--font-plex)", fontWeight: 500, fontSize: "clamp(15px,1.3vw,18px)", lineHeight: 1.55, color: "var(--es-ink)", margin: "14px 0 0", maxWidth: 640 }}>
        Nothing gets ordered until you say so.
      </p>

      <div className="es-cta" style={{ marginTop: 44, justifyContent: "center" }}>
        <PrimaryCta href="#request">Request access</PrimaryCta>
        <SecondaryCta href="#platform">See how it works</SecondaryCta>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 22 }}>
        <span aria-hidden="true" style={{ display: "block", width: 6, height: 6, borderRadius: "50%", background: "#5B9BFF", boxShadow: "0 0 8px rgba(11,95,255,.9)", animation: "esPulse 2.6s ease-in-out infinite" }} />
        <span style={{ fontFamily: "var(--font-plex)", fontWeight: 300, fontSize: 12.5, color: "var(--es-faint)" }}>Currently onboarding design partners</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginTop: "clamp(48px,7vh,96px)" }}>
        <span style={{ fontFamily: "var(--font-space)", fontSize: 10, fontWeight: 500, letterSpacing: "0.3em", color: "var(--es-faint)" }}>SCROLL</span>
        <span style={{ display: "block", width: 1, height: 46, background: "var(--es-line)", animation: "esScroll 3.4s cubic-bezier(0.65,0,0.35,1) infinite" }} />
      </div>
    </section>
  );
}
