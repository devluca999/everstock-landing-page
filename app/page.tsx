import GridBackground from "@/components/GridBackground";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import ApprovalFlow from "@/components/ApprovalFlow";
import { Panel, Eyebrow, PrimaryCta, SecondaryCta } from "@/components/ui";
import type { CSSProperties } from "react";

const stmtLg: CSSProperties = { fontFamily: "var(--font-space)", fontWeight: 600, fontSize: "clamp(24px,3.1vw,44px)", lineHeight: 1.22, letterSpacing: "-0.02em", margin: 0, color: "var(--es-ink)", textShadow: "var(--es-glow)", textWrap: "pretty" };
const h2Md: CSSProperties = { fontFamily: "var(--font-space)", fontWeight: 600, fontSize: "clamp(22px,2.6vw,36px)", lineHeight: 1.24, letterSpacing: "-0.02em", margin: 0, color: "var(--es-ink)", textShadow: "var(--es-glow)", textWrap: "pretty" };
const body: CSSProperties = { fontFamily: "var(--font-plex)", fontWeight: 300, lineHeight: 1.6, color: "var(--es-dim)", textWrap: "pretty" };
const logoCell: CSSProperties = { height: 34, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 4, background: "var(--es-line)" };
const intCell: CSSProperties = { background: "var(--es-bg)", padding: "18px 4px", fontFamily: "var(--font-space)", fontSize: 12.5, fontWeight: 500, letterSpacing: "0.06em", color: "var(--es-dim)" };

const STEPS = [
  { n: "01", name: "Watch", desc: "Everstock's agent tracks vendor pricing against the thresholds you set." },
  { n: "02", name: "Propose", desc: "When a price or reorder trigger fires, a purchase gets queued for approval — never executed automatically." },
  { n: "03", name: "Execute", desc: "Once approved, the deterministic rules engine places the order through your existing vendor relationships." },
];
const QUEUE = [
  { name: "Michelin Defender T+H", meta: "Qty 24 · $2,140", state: "PROPOSED", active: true },
  { name: "Wix filters — bulk case", meta: "Qty 60 · $884", state: "APPROVED", active: false },
  { name: "Brake pads — front set", meta: "Qty 18 · $1,062", state: "EXECUTED", active: false },
];
const INTEGRATIONS = ["Epicor Vision", "Epicor Eclipse", "MAM / Kerridge", "Infor Distribution", "NetSuite", "ANSI X12 EDI", "AS2 / SFTP feeds", "Flat-file / CSV"];

export default function Home() {
  return (
    <>
      <GridBackground />
      <div id="es-content" style={{ position: "relative", zIndex: 1, overflowX: "clip" }}>
        <Nav />
        <main>
          <Hero />

          {/* trust bar */}
          <Panel id="partners" tint="blue" side="left" style={{ maxWidth: "min(1040px, 100%)" }}>
            <p style={{ fontFamily: "var(--font-space)", fontSize: 10.5, fontWeight: 500, letterSpacing: "0.28em", color: "var(--es-faint)", margin: "0 0 clamp(30px,4vh,52px)", textTransform: "uppercase" }}>
              Piloting with forward-thinking distributors
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: "clamp(24px,4vw,64px)", alignItems: "center", filter: "grayscale(1)", opacity: 0.34 }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} style={logoCell}>
                  <span style={{ fontFamily: "var(--font-space)", fontSize: 9.5, fontWeight: 600, letterSpacing: "0.24em", color: "var(--es-ink)" }}>LOGO</span>
                </div>
              ))}
            </div>
          </Panel>

          {/* 01 — the leak */}
          <Panel id="platform" tint="green" side="right">
            <div className="es-split">
              <Eyebrow>01 — THE LEAK</Eyebrow>
              <p style={stmtLg}>You&apos;re already spending thousands a month on tires, filters, brake pads, and fluids — with no visibility into price.</p>
            </div>
          </Panel>

          {/* 02 — the system */}
          <Panel tint="blue" side="left">
            <div className="es-split">
              <Eyebrow>02 — THE SYSTEM</Eyebrow>
              <div style={{ display: "flex", flexDirection: "column", gap: 34 }}>
                <p style={{ ...body, fontSize: "clamp(17px,1.6vw,22px)", margin: 0, color: "var(--es-dim)", maxWidth: 720 }}>
                  Everstock&apos;s agent watches vendor pricing inside limits you set. Nothing moves a dollar until it clears your approval queue.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div style={{ position: "relative", height: 1, background: "linear-gradient(90deg,rgba(11,95,255,0) 0%,rgba(11,95,255,0.42) 12%,rgba(11,95,255,0.42) 88%,rgba(11,95,255,0) 100%)" }}>
                    <span style={{ position: "absolute", top: "50%", width: 7, height: 7, margin: "-3.5px 0 0 -3.5px", borderRadius: "50%", background: "#5B9BFF", boxShadow: "0 0 6px 1px rgba(11,95,255,0.9),0 0 18px 3px rgba(11,95,255,0.55),0 0 40px 8px rgba(11,95,255,0.25)", animation: "esRailTravel 7.5s cubic-bezier(0.55,0,0.45,1) infinite" }} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(clamp(210px,(670px - 100%) * 999,100%),1fr))", gap: 20 }}>
                    {STEPS.map((s) => (
                      <div key={s.n} style={{ border: "1px solid var(--es-line)", borderRadius: 12, padding: "26px 24px 28px", display: "flex", flexDirection: "column", gap: 11 }}>
                        <span style={{ fontFamily: "var(--font-space)", fontSize: 10, fontWeight: 600, letterSpacing: "0.26em", color: "var(--es-faint)" }}>{s.n}</span>
                        <span style={{ fontFamily: "var(--font-space)", fontSize: 19, fontWeight: 600, letterSpacing: "-0.01em", color: "var(--es-ink)", textShadow: "var(--es-glow)" }}>{s.name}</span>
                        <span style={{ ...body, fontSize: 14.5, lineHeight: 1.55, color: "var(--es-dim)" }}>{s.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Panel>

          {/* 03 — the guardrail */}
          <Panel id="approvals" tint="green" side="right">
            <div className="es-split">
              <Eyebrow>03 — THE GUARDRAIL</Eyebrow>
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <h2 style={h2Md}>Nothing moves without your sign-off.</h2>
                <p style={{ ...body, fontSize: "clamp(16px,1.5vw,20px)", margin: 0, color: "var(--es-dim)", maxWidth: 660 }}>
                  Every agent action surfaces in your queue before it touches a dollar — proposed, approved, executed, in that order, every time.
                </p>
                <ApprovalFlow />
              </div>
            </div>
          </Panel>

          {/* 04 — the contract */}
          <Panel id="company" tint="blue" side="left">
            <div className="es-split">
              <Eyebrow>04 — THE CONTRACT</Eyebrow>
              <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
                <p style={{ ...stmtLg, fontSize: "clamp(22px,2.6vw,36px)", lineHeight: 1.28, maxWidth: 820 }}>
                  Nothing is automatic by default. You&apos;re never surprised by a decision you didn&apos;t see coming.
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                  <span style={{ display: "block", width: 7, height: 7, borderRadius: "50%", background: "#0B5FFF", boxShadow: "0 0 12px rgba(11,95,255,0.8)", animation: "esPulse 2.6s ease-in-out infinite" }} />
                  <span style={{ fontFamily: "var(--font-space)", fontSize: 10.5, fontWeight: 500, letterSpacing: "0.26em", color: "var(--es-dim)" }}>AGENT ACTIVE — 14 QUOTES IN QUEUE</span>
                </div>
                <div id="request" className="es-cta" style={{ paddingTop: 6 }}>
                  <PrimaryCta href="#request">Request access</PrimaryCta>
                  <span style={{ fontFamily: "var(--font-plex)", fontWeight: 300, fontSize: 14, color: "var(--es-faint)" }}>Mid-market distributors · Onboarding in 2 weeks</span>
                </div>
              </div>
            </div>
          </Panel>

          {/* 05 — your desk */}
          <Panel tint="green" side="right">
            <div className="es-split">
              <Eyebrow>05 — YOUR DESK</Eyebrow>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(clamp(280px,(700px - 100%) * 999,100%),1fr))", gap: "clamp(28px,4vw,56px)", alignItems: "center" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <h2 style={h2Md}>This makes your job easier, not obsolete.</h2>
                  <p style={{ ...body, fontSize: "clamp(15px,1.4vw,18px)", margin: 0, color: "var(--es-dim)" }}>
                    Everstock handles the repetitive price-watching and reorder busywork. You still see everything, approve everything, and stay the one who knows the vendors.
                  </p>
                </div>
                <div style={{ border: "1px solid var(--es-line)", borderRadius: 12, overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "14px 18px", borderBottom: "1px solid var(--es-line)" }}>
                    <span style={{ fontFamily: "var(--font-space)", fontSize: 10, fontWeight: 600, letterSpacing: "0.24em", color: "var(--es-dim)" }}>APPROVAL QUEUE</span>
                    <span style={{ fontFamily: "var(--font-space)", fontSize: 10, fontWeight: 600, letterSpacing: "0.18em", color: "var(--es-faint)" }}>3 ITEMS</span>
                  </div>
                  {QUEUE.map((q, i) => (
                    <div key={q.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, padding: "15px 18px", borderBottom: i < QUEUE.length - 1 ? "1px solid var(--es-line)" : "none" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
                        <span style={{ fontFamily: "var(--font-space)", fontSize: 13.5, fontWeight: 600, color: "var(--es-ink)" }}>{q.name}</span>
                        <span style={{ fontFamily: "var(--font-plex)", fontWeight: 300, fontSize: 12, color: "var(--es-faint)" }}>{q.meta}</span>
                      </div>
                      <span style={{ flex: "none", fontFamily: "var(--font-space)", fontSize: 9.5, fontWeight: 600, letterSpacing: "0.16em", padding: "6px 12px", borderRadius: 999, border: q.active ? "1px solid rgba(11,95,255,0.5)" : "1px solid var(--es-line)", color: q.active ? "#8FBAFF" : "var(--es-faint)", background: q.active ? "rgba(11,95,255,0.08)" : "transparent" }}>{q.state}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Panel>

          {/* 06 — your stack */}
          <Panel tint="blue" side="left">
            <div className="es-split">
              <p id="integrations" style={{ fontFamily: "var(--font-space)", fontSize: 11.5, fontWeight: 700, letterSpacing: "0.28em", color: "var(--es-ink)", textShadow: "var(--es-glow)", margin: 0 }}>06 — YOUR STACK</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <h2 style={{ ...h2Md, maxWidth: 820 }}>Works on top of what you&apos;ve already got — no rip-and-replace.</h2>
                <p style={{ ...body, fontSize: "clamp(15px,1.4vw,18px)", margin: 0, color: "var(--es-dim)", maxWidth: 700 }}>
                  Everstock connects to the ERPs and EDI systems mid-market distributors already run, from vertical tools like Epicor Vision and MAM/Kerridge to standard EDI feeds.
                </p>
                <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(clamp(160px,(640px - 100%) * 999,100%),1fr))", gap: 1, background: "var(--es-line)", borderTop: "1px solid var(--es-line)", borderBottom: "1px solid var(--es-line)", opacity: 0.62 }}>
                  {INTEGRATIONS.map((it) => (
                    <div key={it} style={intCell}>{it}</div>
                  ))}
                </div>
                <p style={{ fontFamily: "var(--font-plex)", fontWeight: 300, fontSize: 13.5, lineHeight: 1.5, margin: "8px 0 0", color: "var(--es-faint)" }}>
                  Don&apos;t see yours? Most systems export a price file — that&apos;s enough to start.
                </p>
              </div>
            </div>
          </Panel>

          {/* final CTA */}
          <Panel tint="green" side="right" style={{ position: "relative", overflow: "hidden", padding: 0 }}>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 120%,rgba(11,95,255,0.14),transparent 62%)", pointerEvents: "none" }} />
            <div style={{ position: "relative", maxWidth: 1280, margin: "0 auto", padding: "clamp(80px,12vh,150px) clamp(28px,3.6vw,56px)", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 22 }}>
              <h2 style={{ fontFamily: "var(--font-space)", fontWeight: 700, fontSize: "clamp(30px,4.4vw,60px)", lineHeight: 1.1, letterSpacing: "-0.03em", margin: 0, color: "var(--es-ink)", textShadow: "var(--es-glow)", textWrap: "pretty" }}>
                Stop guessing at your parts spend.
              </h2>
              <p style={{ ...body, fontSize: "clamp(15px,1.5vw,19px)", margin: 0, maxWidth: 560, color: "var(--es-dim)" }}>
                We&apos;re onboarding a small group of mid-market distributors as design partners.
              </p>
              <div className="es-cta" style={{ marginTop: 16, justifyContent: "center" }}>
                <PrimaryCta href="#request">Request access</PrimaryCta>
                <SecondaryCta href="#platform">See how it works</SecondaryCta>
              </div>
            </div>
          </Panel>

          <Footer />
        </main>
      </div>
    </>
  );
}
