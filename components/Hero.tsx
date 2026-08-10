import TitleCycle from "./TitleCycle";
import HeroLogo from "./HeroLogo";
import { PrimaryCta, SecondaryCta } from "./ui";

export default function Hero() {
  return (
    <section
      id="top"
      className="es-fullvh"
      style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(96px,13vh,120px) 40px 0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}
    >
      <p style={{ fontFamily: "var(--font-space)", fontSize: 11, fontWeight: 500, letterSpacing: "0.34em", color: "#0B5FFF", textShadow: "0 0 26px rgba(11,95,255,0.55)", margin: "0 0 clamp(22px,3vh,34px)" }}>
        AGENTIC PROCUREMENT, DETERMINISTIC TRUST
      </p>

      {/* Logo mark — sits directly below the eyebrow, above the title. Position is
          fixed (anchored to the eyebrow, not the title's live font/effect size). */}
      <div style={{ marginBottom: "clamp(26px,3.6vh,46px)" }}>
        <HeroLogo height={60} />
      </div>

      {/* Fixed-height clearance zone for the title. Its height reserves the WORST-CASE
          title box (tallest font, e.g. Anton scale 1.16, + effect-layer transform
          overflow). The title overflows this box visually if it ever needs to, but the
          box height never changes — so nothing above it (the logo) or below it (the
          tagline) reacts to the title's live font/effect state; the logo above also
          keeps a fixed gap from the title's upward effect overflow. overflow:visible
          keeps effects unclipped. */}
      <div style={{ width: "100%", height: "clamp(120px, 20.5vw, 300px)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "visible" }}>
        <TitleCycle />
      </div>

      <p style={{ fontFamily: "var(--font-plex)", fontWeight: 300, fontSize: "clamp(16px,1.5vw,21px)", lineHeight: 1.55, letterSpacing: "0.005em", color: "var(--es-dim)", margin: "clamp(24px,3vh,40px) 0 0", maxWidth: 640, textWrap: "pretty" }}>
        Supply-chain intelligence, at your command.
      </p>

      <div className="es-cta" style={{ marginTop: 44, justifyContent: "center" }}>
        <PrimaryCta href="#request">Request access</PrimaryCta>
        <SecondaryCta href="#platform">See how it works</SecondaryCta>
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginTop: "clamp(48px,7vh,96px)" }}>
        <span style={{ fontFamily: "var(--font-space)", fontSize: 10, fontWeight: 500, letterSpacing: "0.3em", color: "var(--es-faint)" }}>SCROLL</span>
        <span style={{ display: "block", width: 1, height: 46, background: "var(--es-line)", animation: "esScroll 3.4s cubic-bezier(0.65,0,0.35,1) infinite" }} />
      </div>
    </section>
  );
}
