const col: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 13 };
const head: React.CSSProperties = { fontFamily: "var(--font-space)", fontSize: 10, fontWeight: 600, letterSpacing: "0.24em", color: "var(--es-faint)" };
const link: React.CSSProperties = { fontFamily: "var(--font-plex)", fontWeight: 300, fontSize: 14, color: "var(--es-dim)", transition: "color 160ms ease" };

export default function Footer() {
  return (
    <footer
      className="es-panel es-panel--blue"
      data-side="left"
      style={{ padding: "clamp(48px,6.5vh,80px) clamp(28px,3.6vw,56px) clamp(32px,4vh,44px)", display: "flex", flexDirection: "column", gap: "clamp(44px,6vh,72px)" }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(clamp(150px,(720px - 100%) * 999,100%),1fr))", gap: "clamp(30px,4vw,56px)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <svg width="44" height="27" viewBox="0 0 44 26" fill="none" style={{ display: "block" }} aria-hidden="true">
              <path d="M21,13 C18,4.5 6,4.5 6,13 C6,21.5 18,21.5 21,13 C23.2,7.5 28.4,3.6 35.66,7.34 A8.5,8.5 0 1 0 35.66,18.66" stroke="var(--es-dim)" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            </svg>
            <span style={{ fontFamily: "var(--font-space)", fontWeight: 700, fontSize: 13, letterSpacing: "0.2em", color: "var(--es-dim)" }}>EVERSTOCK</span>
          </div>
          <p style={{ fontFamily: "var(--font-plex)", fontWeight: 300, fontSize: 13, lineHeight: 1.55, margin: 0, maxWidth: 250, color: "var(--es-faint)" }}>
            Agentic procurement infrastructure for mid-market distributors.
          </p>
        </div>

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

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap", paddingTop: 26, borderTop: "1px solid var(--es-line)", fontFamily: "var(--font-space)", fontSize: 10.5, fontWeight: 500, letterSpacing: "0.2em", color: "var(--es-faint)" }}>
        <span>EVERSTOCK © 2026</span>
        <span>AGENTIC PROCUREMENT INFRASTRUCTURE</span>
      </div>
    </footer>
  );
}
