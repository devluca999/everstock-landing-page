import Logo from "./Logo";

const col: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 13 };
const head: React.CSSProperties = { fontFamily: "var(--font-space)", fontSize: 10, fontWeight: 600, letterSpacing: "0.24em", color: "var(--es-faint)" };
const link: React.CSSProperties = { fontFamily: "var(--font-plex)", fontWeight: 300, fontSize: 14, color: "var(--es-dim)", transition: "color 160ms ease" };

export default function Footer() {
  return (
    <footer
      className="vb-accent"
      style={{ position: "relative", width: "100%", margin: 0, padding: "clamp(56px,7.5vh,94px) 0", borderTop: "1px solid var(--es-edge)" }}
    >
      <div className="es-reveal" style={{ maxWidth: 1160, margin: "0 auto", padding: "0 clamp(24px,5vw,68px)", display: "flex", flexDirection: "column", gap: "clamp(44px,6vh,72px)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Logo height={28} />
            <span style={{ fontFamily: "var(--font-space)", fontWeight: 700, fontSize: 13, letterSpacing: "0.2em", color: "var(--es-dim)" }}>EVERSTOCK</span>
          </div>
          <p style={{ fontFamily: "var(--font-plex)", fontWeight: 300, fontSize: 13, lineHeight: 1.55, margin: 0, maxWidth: 250, color: "var(--es-faint)" }}>
            Procurement automation for mid-market distributors of physical goods.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(clamp(136px,(600px - 100%) * 999,100%),1fr))", gap: "clamp(26px,3vw,48px)" }}>
          <div style={col}>
            <span style={head}>PLATFORM</span>
            <a href="#platform" style={link}>How it works</a>
            <a href="#approvals" style={link}>Approval flow</a>
            <a href="#integrations" style={link}>Integrations</a>
          </div>
          <div style={col}>
            <span style={head}>GET STARTED</span>
            <a href="#request" style={link}>Request access</a>
            <a href="#request" style={link}>Design partner program</a>
          </div>
          <div style={col}>
            <span style={head}>COMPANY</span>
            <a href="#company" style={link}>Our commitment</a>
            <a href="#request" style={link}>Contact</a>
          </div>
          <div style={col}>
            <span style={head}>INDUSTRIES</span>
            <a href="#problem" style={link}>Auto parts</a>
            <a href="#problem" style={link}>Electronics</a>
            <a href="#problem" style={link}>Industrial supply</a>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap", paddingTop: 26, borderTop: "1px solid var(--es-hair)", fontFamily: "var(--font-space)", fontSize: 10.5, fontWeight: 500, letterSpacing: "0.2em", color: "var(--es-faint)" }}>
          <span>EVERSTOCK © 2026</span>
          <span>PROCUREMENT AUTOMATION</span>
        </div>
      </div>
    </footer>
  );
}
