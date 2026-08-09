import TitleCycle from "./TitleCycle";
import { PrimaryCta, SecondaryCta } from "./ui";

export default function Hero() {
  return (
    <section
      id="top"
      className="es-fullvh"
      style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(96px,13vh,120px) 40px 0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}
    >
      <p style={{ fontFamily: "var(--font-space)", fontSize: 11, fontWeight: 500, letterSpacing: "0.34em", color: "#0B5FFF", textShadow: "0 0 26px rgba(11,95,255,0.55)", margin: "0 0 44px" }}>
        AGENTIC PROCUREMENT, DETERMINISTIC TRUST
      </p>

      <TitleCycle />

      <p style={{ fontFamily: "var(--font-plex)", fontWeight: 300, fontSize: "clamp(16px,1.5vw,21px)", lineHeight: 1.55, letterSpacing: "0.005em", color: "var(--es-dim)", margin: "40px 0 0", maxWidth: 640, textWrap: "pretty" }}>
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
