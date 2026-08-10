import Logo from "./Logo";

const col: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 13 };
const head: React.CSSProperties = { fontFamily: "var(--font-space)", fontSize: 10, fontWeight: 600, letterSpacing: "0.24em", color: "var(--es-faint)" };
const link: React.CSSProperties = { fontFamily: "var(--font-plex)", fontWeight: 300, fontSize: 14, color: "var(--es-dim)", transition: "color 160ms ease" };
const cert: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "center", width: 96, height: 38, borderRadius: 4, border: "1px dashed var(--es-edge)", fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 500, letterSpacing: "0.16em", color: "var(--es-dim)" };

export default function Footer() {
  return (
    <footer
      style={{ position: "relative", width: "100%", margin: 0, padding: "clamp(56px,7.5vh,94px) 0", background: "linear-gradient(160deg,rgba(11,95,255,0.055),rgba(11,95,255,0.012) 55%,rgba(64,255,168,0.022)),var(--es-panel)", backdropFilter: "blur(18px) saturate(132%)", WebkitBackdropFilter: "blur(18px) saturate(132%)", borderTop: "1px solid var(--es-edge)", boxShadow: "inset 0 1px 0 var(--es-lip)" }}
    >
      <div className="es-reveal" style={{ maxWidth: 1160, margin: "0 auto", padding: "0 clamp(24px,5vw,68px)", display: "flex", flexDirection: "column", gap: "clamp(44px,6vh,72px)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Logo height={28} />
            <span style={{ fontFamily: "var(--font-space)", fontWeight: 700, fontSize: 13, letterSpacing: "0.2em", color: "var(--es-dim)" }}>EVERSTOCK</span>
          </div>
          <p style={{ fontFamily: "var(--font-plex)", fontWeight: 300, fontSize: 13, lineHeight: 1.55, margin: 0, maxWidth: 250, color: "var(--es-faint)" }}>
            Agentic procurement infrastructure for mid-market distributors.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(clamp(136px,(600px - 100%) * 999,100%),1fr))", gap: "clamp(26px,3vw,48px)" }}>
          <div style={col}>
            <span style={head}>PLATFORM</span>
            <a href="#platform" style={link}>How it works</a>
            <a href="#approvals" style={link}>Approval flow</a>
            <a href="#integrations" style={link}>Integrations</a>
          </div>
          <div id="pricing" style={col}>
            <span style={head}>PRICING</span>
            <a href="#request" style={link}>Design partner program</a>
            <a href="#request" style={link}>Request a quote</a>
          </div>
          <div style={col}>
            <span style={head}>COMPANY</span>
            <a href="#company" style={link}>About</a>
            <a href="#request" style={link}>Contact</a>
            <a id="login" href="#login" style={link}>Log in</a>
          </div>
          <div style={col}>
            <span style={head}>SECURITY</span>
            <a href="#security" style={{ ...link, fontWeight: 400, color: "var(--es-ink)", display: "inline-flex", alignItems: "center", gap: 8 }}>Security &amp; compliance →</a>
            <a href="#security" style={link}>Data handling</a>
            <a href="#security" style={link}>Subprocessors</a>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", paddingTop: 26, borderTop: "1px solid var(--es-hair)" }}>
            <span style={{ fontFamily: "var(--font-space)", fontSize: 9.5, fontWeight: 600, letterSpacing: "0.24em", color: "var(--es-faint)", marginRight: 6 }}>CERTIFICATIONS</span>
            <div style={cert}>SOC 2</div>
            <div style={cert}>ISO 27001</div>
            <div style={cert}>GDPR</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap", fontFamily: "var(--font-space)", fontSize: 10.5, fontWeight: 500, letterSpacing: "0.2em", color: "var(--es-faint)" }}>
            <span>EVERSTOCK © 2026</span>
            <span>AGENTIC PROCUREMENT INFRASTRUCTURE</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
