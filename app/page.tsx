import GridBackground from "@/components/GridBackground";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import ApprovalFlow from "@/components/ApprovalFlow";
import RevealController from "@/components/RevealController";
import { Band, Tab, Eyebrow, PrimaryCta, SecondaryCta, CardMeta } from "@/components/ui";
import type { CSSProperties } from "react";

const stmtLg: CSSProperties = { fontFamily: "var(--font-space)", fontWeight: 600, fontSize: "clamp(24px,3.1vw,44px)", lineHeight: 1.22, letterSpacing: "-0.02em", margin: 0, color: "var(--es-ink)", textShadow: "var(--es-glow)", textWrap: "pretty" };
const h2Md: CSSProperties = { fontFamily: "var(--font-space)", fontWeight: 600, fontSize: "clamp(22px,2.6vw,36px)", lineHeight: 1.24, letterSpacing: "-0.02em", margin: 0, color: "var(--es-ink)", textShadow: "var(--es-glow)", textWrap: "pretty" };
const body: CSSProperties = { fontFamily: "var(--font-plex)", fontWeight: 300, lineHeight: 1.6, color: "var(--es-dim)", textWrap: "pretty" };
const logoCell: CSSProperties = { height: 34, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 3, background: "var(--es-line)" };
const intCell: CSSProperties = { background: "var(--es-bg)", padding: "18px 4px", fontFamily: "var(--font-space)", fontSize: 12.5, fontWeight: 500, letterSpacing: "0.06em", color: "var(--es-dim)" };
const card: CSSProperties = { border: "1px solid var(--es-edge)", borderRadius: 6, background: "var(--es-card)", boxShadow: "inset 0 1px 0 var(--es-lip)", padding: "22px 22px 0", display: "flex", flexDirection: "column", gap: 10 };

const STEPS = [
  { n: "01", name: "Watch", desc: "Everstock's agent tracks vendor pricing against the thresholds you set.", meta: ["SCAN INTERVAL", "CONTINUOUS"] },
  { n: "02", name: "Propose", desc: "When a price or reorder trigger fires, a purchase gets queued for approval — never executed automatically.", meta: ["AUTO-EXECUTE", "DISABLED"] },
  { n: "03", name: "Execute", desc: "Once approved, the deterministic rules engine places the order through your existing vendor relationships.", meta: ["AUDIT TRAIL", "RETAINED"] },
];
const QUEUE = [
  { name: "Michelin Defender T+H", meta: "Qty 24 · $2,140", state: "PROPOSED", active: true },
  { name: "Wix filters — bulk case", meta: "Qty 60 · $884", state: "APPROVED", active: false },
  { name: "Brake pads — front set", meta: "Qty 18 · $1,062", state: "EXECUTED", active: false },
];
const INTEGRATIONS = ["Epicor Vision", "Epicor Eclipse", "MAM / Kerridge", "Infor Distribution", "NetSuite", "ANSI X12 EDI", "AS2 / SFTP feeds", "Flat-file / CSV", "Excel / Spreadsheet"];

export default function Home() {
  return (
    <>
      <GridBackground />
      <RevealController />
      <div id="es-content" style={{ position: "relative", zIndex: 1, overflowX: "clip" }}>
        <Nav />
        <main>
          <Hero />

          {/* trust bar */}
          <Band id="partners" tint="blue" innerStyle={{ paddingTop: 0, paddingBottom: 0 }}>
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
          </Band>

          {/* 01 — the leak (left tab) */}
          <Tab id="platform" tint="green" side="left">
            <div className="es-split">
              <Eyebrow>01 — THE LEAK</Eyebrow>
              <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
                <p style={stmtLg}>You&apos;re already spending thousands a month on tires, filters, brake pads, and fluids — with no visibility into price.</p>
                <p style={{ ...body, fontSize: "clamp(15px,1.4vw,18px)", margin: 0, maxWidth: 600 }}>
                  Vendor quotes arrive by email, phone, and PDF. Nobody on your team has time to check whether last week&apos;s price still holds.
                </p>
              </div>
            </div>
          </Tab>

          {/* 02 — the system (band) */}
          <Band tint="blue">
            <div style={{ display: "flex", flexDirection: "column", gap: "clamp(34px,5vh,56px)" }}>
              <div className="es-split">
                <Eyebrow>02 — THE SYSTEM</Eyebrow>
                <p style={{ ...body, fontSize: "clamp(17px,1.6vw,22px)", margin: 0, color: "var(--es-dim)", maxWidth: 720 }}>
                  Everstock&apos;s agent watches vendor pricing inside limits you set. Nothing moves a dollar until it clears your approval queue.
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div className="es-rail" style={{ position: "relative", height: 1, background: "linear-gradient(90deg,rgba(11,95,255,0) 0%,rgba(11,95,255,0.42) 12%,rgba(11,95,255,0.42) 88%,rgba(11,95,255,0) 100%)" }}>
                  <span style={{ position: "absolute", top: "50%", width: 7, height: 7, margin: "-3.5px 0 0 -3.5px", borderRadius: "50%", background: "#5B9BFF", boxShadow: "0 0 6px 1px rgba(11,95,255,0.9),0 0 18px 3px rgba(11,95,255,0.55),0 0 40px 8px rgba(11,95,255,0.25)", animation: "esRailTravel 7.5s cubic-bezier(0.55,0,0.45,1) infinite" }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(clamp(210px,(670px - 100%) * 999,100%),1fr))", gap: 20 }}>
                  {STEPS.map((s) => (
                    <div key={s.n} style={card}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, fontWeight: 500, letterSpacing: "0.26em", color: "var(--es-faint)" }}>{s.n}</span>
                      <span style={{ fontFamily: "var(--font-space)", fontSize: 19, fontWeight: 600, letterSpacing: "-0.01em", color: "var(--es-ink)", textShadow: "var(--es-glow)" }}>{s.name}</span>
                      <span style={{ ...body, fontSize: 14.5, lineHeight: 1.55, color: "var(--es-dim)" }}>{s.desc}</span>
                      <CardMeta label={s.meta[0]} value={s.meta[1]} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Band>

          {/* 03 — the guardrail (right tab) */}
          <Tab id="approvals" tint="green" side="right">
            <div style={{ display: "flex", flexWrap: "wrap", gap: "clamp(20px,2vw,80px)", alignItems: "flex-start" }}>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 500, letterSpacing: "0.3em", color: "var(--es-ink)", textShadow: "var(--es-glow)", margin: 0, flex: "0 1 auto", whiteSpace: "nowrap" }}>03 — THE GUARDRAIL</p>
              <div style={{ flex: "1 1 330px", display: "flex", flexDirection: "column", gap: 18, minWidth: 0 }}>
                <h2 style={stmtLg}>Nothing moves without your sign-off.</h2>
                <p style={{ ...body, fontSize: "clamp(16px,1.5vw,20px)", margin: 0, color: "var(--es-dim)", maxWidth: 660 }}>
                  Every agent action surfaces in your queue before it touches a dollar — proposed, approved, executed, in that order, every time. Humans stay in the loop by default, not as an afterthought.
                </p>
                <ApprovalFlow />
              </div>
            </div>
          </Tab>

          {/* 04 — the contract (band) */}
          <Band id="company" tint="blue">
            <div className="es-split">
              <Eyebrow>04 — THE CONTRACT</Eyebrow>
              <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
                <p style={{ ...stmtLg, fontSize: "clamp(22px,2.6vw,36px)", lineHeight: 1.28, maxWidth: 820 }}>
                  Nothing is automatic by default. You&apos;re never surprised by a decision you didn&apos;t see coming.
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                  <span style={{ display: "block", width: 7, height: 7, borderRadius: "50%", background: "#0B5FFF", boxShadow: "0 0 12px rgba(11,95,255,0.8)", animation: "esPulse 2.6s ease-in-out infinite" }} />
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, fontWeight: 500, letterSpacing: "0.26em", color: "var(--es-dim)" }}>AGENT ACTIVE — 14 QUOTES IN QUEUE</span>
                </div>
                <div id="request" className="es-cta" style={{ paddingTop: 6 }}>
                  <PrimaryCta href="#request">Request access</PrimaryCta>
                  <span style={{ fontFamily: "var(--font-plex)", fontWeight: 300, fontSize: 14, color: "var(--es-faint)" }}>Mid-market distributors · Onboarding in 2 weeks</span>
                </div>
              </div>
            </div>
          </Band>

          {/* 05 — your desk (left tab) */}
          <Tab tint="green" side="left">
            <div className="es-split">
              <Eyebrow>05 — YOUR DESK</Eyebrow>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(clamp(280px,(700px - 100%) * 999,100%),1fr))", gap: "clamp(28px,4vw,56px)", alignItems: "center" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <h2 style={h2Md}>This makes your job easier, not obsolete.</h2>
                  <p style={{ ...body, fontSize: "clamp(15px,1.4vw,18px)", margin: 0, color: "var(--es-dim)" }}>
                    Everstock handles the repetitive price-watching and reorder busywork. You still see everything, approve everything, and stay the one who knows the vendors.
                  </p>
                </div>
                <div style={{ border: "1px solid var(--es-edge)", borderRadius: 6, background: "var(--es-card)", boxShadow: "inset 0 1px 0 var(--es-lip)", overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "13px 18px", borderBottom: "1px solid var(--es-edge)" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 500, letterSpacing: "0.24em", color: "var(--es-dim)" }}>APPROVAL QUEUE</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 500, letterSpacing: "0.16em", color: "var(--es-faint)" }}>3</span>
                  </div>
                  {QUEUE.map((q, i) => (
                    <div key={q.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, padding: "15px 18px", borderBottom: i < QUEUE.length - 1 ? "1px solid var(--es-hair)" : "none" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
                        <span style={{ fontFamily: "var(--font-space)", fontSize: 13.5, fontWeight: 600, color: "var(--es-ink)" }}>{q.name}</span>
                        <span style={{ fontFamily: "var(--font-plex)", fontWeight: 300, fontSize: 12, color: "var(--es-faint)" }}>{q.meta}</span>
                      </div>
                      <span style={{ flex: "none", fontFamily: "var(--font-mono)", fontSize: 9.5, fontWeight: 500, letterSpacing: "0.16em", padding: "6px 12px", borderRadius: 999, border: q.active ? "1px solid rgba(11,95,255,0.5)" : "1px solid var(--es-edge)", color: q.active ? "#8FBAFF" : "var(--es-faint)", background: q.active ? "rgba(11,95,255,0.08)" : "transparent" }}>{q.state}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Tab>

          {/* 06 — your stack (band) */}
          <Band tint="blue">
            <div className="es-split">
              <Eyebrow id="integrations">06 — YOUR STACK</Eyebrow>
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <h2 style={{ ...h2Md, maxWidth: 820 }}>Works on top of what you&apos;ve already got — no rip-and-replace.</h2>
                <p style={{ ...body, fontSize: "clamp(15px,1.4vw,18px)", margin: 0, color: "var(--es-dim)", maxWidth: 700 }}>
                  Everstock connects to the ERPs and EDI systems mid-market distributors already run, from vertical tools like Epicor Vision and MAM/Kerridge to standard EDI feeds — or, if you&apos;re tracking pricing and thresholds in a spreadsheet today, Everstock works with that too.
                </p>
                <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(clamp(160px,(640px - 100%) * 999,100%),1fr))", gap: 1, background: "var(--es-line)", borderTop: "1px solid var(--es-line)", borderBottom: "1px solid var(--es-line)", opacity: 0.62 }}>
                  {INTEGRATIONS.map((it) => (
                    <div key={it} style={intCell}>{it}</div>
                  ))}
                </div>
                <p style={{ fontFamily: "var(--font-plex)", fontWeight: 300, fontSize: 13.5, lineHeight: 1.5, margin: "8px 0 0", color: "var(--es-faint)" }}>
                  No lengthy implementation — if you can export a price file, you can get started.
                </p>
              </div>
            </div>
          </Band>

          {/* final CTA (band) */}
          <Band tint="green" innerStyle={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 22 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginBottom: "clamp(24px,4vh,42px)" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 2, fontFamily: "var(--font-space)", fontWeight: 700, fontSize: "clamp(46px,7vw,96px)", lineHeight: 1, letterSpacing: "-0.04em", fontVariantNumeric: "tabular-nums", color: "var(--es-ink)", textShadow: "var(--es-glow)" }}>
                <span style={{ color: "var(--es-faint)" }}>[</span>
                <span>X</span>
                <span style={{ color: "var(--es-faint)" }}>]</span>
                <span style={{ color: "#0B5FFF", textShadow: "0 0 30px rgba(11,95,255,0.5)" }}>%</span>
              </div>
              <span style={{ fontFamily: "var(--font-space)", fontSize: 11, fontWeight: 500, letterSpacing: "0.28em", color: "var(--es-faint)", textAlign: "center" }}>AVERAGE SAVINGS ON PARTS SPEND</span>
            </div>
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
          </Band>

          <Footer />
        </main>
      </div>
    </>
  );
}
