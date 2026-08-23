import GridBackground from "@/components/GridBackground";
import BlueprintAccent from "@/components/BlueprintAccent";
import RevealController from "@/components/RevealController";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import Marquee from "@/components/Marquee";
import PairedHologram from "@/components/PairedHologram";
import GuardrailShowcase from "@/components/GuardrailShowcase";
import { Eyebrow, PrimaryCta, SecondaryCta, CardMeta } from "@/components/ui";
import type { CSSProperties, ReactNode } from "react";

const stmtLg: CSSProperties = { fontFamily: "var(--font-space)", fontWeight: 600, fontSize: "clamp(24px,3.1vw,44px)", lineHeight: 1.22, letterSpacing: "-0.02em", margin: 0, color: "var(--es-ink)", textShadow: "var(--es-glow)", textWrap: "pretty" };
const h2Md: CSSProperties = { fontFamily: "var(--font-space)", fontWeight: 600, fontSize: "clamp(22px,2.6vw,36px)", lineHeight: 1.24, letterSpacing: "-0.02em", margin: 0, color: "var(--es-ink)", textShadow: "var(--es-glow)", textWrap: "pretty" };
const body: CSSProperties = { fontFamily: "var(--font-plex)", fontWeight: 300, lineHeight: 1.6, color: "var(--es-dim)", textWrap: "pretty" };
const card: CSSProperties = { border: "1px solid var(--es-edge)", borderRadius: 6, background: "var(--es-card)", boxShadow: "inset 0 1px 0 var(--es-lip)", padding: "22px 22px 0", display: "flex", flexDirection: "column", gap: 10 };
const intCell: CSSProperties = { background: "var(--es-bg)", padding: "18px 4px", fontFamily: "var(--font-space)", fontSize: 12.5, fontWeight: 500, letterSpacing: "0.06em", color: "var(--es-dim)", textAlign: "center" };
const queueRow: CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, padding: "15px 18px" };
const queueName: CSSProperties = { fontFamily: "var(--font-space)", fontSize: 13.5, fontWeight: 600, color: "var(--es-ink)" };
const queueMeta: CSSProperties = { fontFamily: "var(--font-plex)", fontWeight: 300, fontSize: 12, color: "var(--es-faint)" };
const queueBadge: CSSProperties = { flex: "none", fontFamily: "var(--font-mono)", fontSize: 9.5, fontWeight: 500, letterSpacing: "0.16em", padding: "6px 12px", borderRadius: 999, border: "1px solid var(--es-edge)", color: "var(--es-faint)", background: "transparent" };

const STEPS = [
  { n: "01", name: "Watch", desc: "Everstock tracks vendor pricing and stock levels against the thresholds you set, across every SKU you carry.", meta: ["SCAN INTERVAL", "CONTINUOUS"] },
  { n: "02", name: "Propose", desc: "When a price move or reorder point triggers, it drafts a purchase order and queues it for approval, never buys on its own.", meta: ["AUTO-EXECUTE", "DISABLED"] },
  { n: "03", name: "Execute", desc: "Once you approve, the rules engine places the order through your existing vendor accounts and logs every step.", meta: ["AUDIT TRAIL", "RETAINED"] },
];
const INTEGRATIONS = ["NetSuite", "Epicor Prophet 21", "SAP Business One", "PartsTech", "Mouser & Digi-Key", "SPS Commerce", "TrueCommerce", "Excel / Spreadsheet"];
const QUEUE = [
  { name: "Michelin Defender T+H", meta: "Qty 24 · $2,140 · auto", state: "PROPOSED", active: true },
  { name: "USB-C 65W charger, retail", meta: "Qty 500 · $6,900 · electronics", state: "APPROVED", active: false },
  { name: "Grade 8 hex bolts, 3/8 in", meta: "Qty 5,000 · $410 · industrial", state: "EXECUTED", active: false },
];

const TAGLINES = [
  "Deterministic rules, automated legwork",
  "Every order waits for your approval",
  "For parts, electronics & industrial distributors",
  "Works with your existing ERP",
  "Human in the loop by default",
  "No rip and replace",
];
const OUTCOMES = [
  "Fewer stockouts",
  "Faster vendor response",
  "Cleaner audit trail",
  "Prices you can actually compare",
  "Time back for your ops team",
  "No more spreadsheet reconciliation",
];

const taglineItem: CSSProperties = { fontFamily: "var(--font-space)", fontSize: "clamp(11px,1.05vw,13px)", fontWeight: 500, letterSpacing: "0.24em", textTransform: "uppercase", color: "var(--es-dim)", whiteSpace: "nowrap" };
const outcomeItem: CSSProperties = { fontFamily: "var(--font-space)", fontSize: "clamp(19px,2.3vw,32px)", fontWeight: 600, letterSpacing: "-0.02em", color: "var(--es-ink)", textShadow: "var(--es-glow)", whiteSpace: "nowrap" };
const taglineSep: ReactNode = <span style={{ fontFamily: "var(--font-space)", fontSize: 12, color: "var(--es-faint)" }}>·</span>;
const outcomeSep: ReactNode = <span aria-hidden="true" style={{ display: "block", width: 6, height: 6, borderRadius: "50%", flex: "none", background: "#5B9BFF", boxShadow: "0 0 7px 1px rgba(11,95,255,0.75)" }} />;

export default function Home() {
  return (
    <>
      <GridBackground />
      <BlueprintAccent />
      <RevealController />
      <div id="es-content" style={{ position: "relative", zIndex: 1, overflowX: "clip" }}>
        <Nav />
        <main>
          <Hero />

          {/* 2 — trust bar (tagline stream) */}
          <section id="partners" className="es-band vb-accent" style={{ padding: "clamp(30px,4.6vh,52px) 0" }}>
            <Marquee items={TAGLINES} itemStyle={taglineItem} separator={taglineSep} gap="clamp(26px,3vw,52px)" />
          </section>

          {/* 3 — The Leak (screw + gear hologram) */}
          <section id="problem" className="es-zrow es-reveal vb-major vb-ink">
            <div className="es-zglass">
              <Eyebrow>01 · THE LEAK</Eyebrow>
              <div style={{ display: "flex", flexDirection: "column", gap: 26, maxWidth: 660 }}>
                <h2 style={stmtLg}>You spend thousands a month restocking parts, with no clear view of what you&rsquo;re paying or whether the price still holds.</h2>
                <p style={{ ...body, fontSize: "clamp(15px,1.4vw,18px)", margin: 0, maxWidth: 600 }}>
                  In distribution, &ldquo;close enough&rdquo; doesn&rsquo;t exist. SKU, size, model, revision, finish: Everstock matches the exact spec you defined, or it stops and asks. Same discipline whether you move auto parts, electronics, or industrial supply.
                </p>
                <p style={{ ...body, color: "var(--es-faint)", fontSize: "clamp(14px,1.25vw,16px)", margin: 0, maxWidth: 600 }}>
                  Vendor quotes still land by email, phone, and PDF. No one on your team has time to check whether last week&rsquo;s price is the one you just paid.
                </p>
              </div>
            </div>
            <div className="es-zsolid">
              <PairedHologram src="/videos/screw-gear.mp4" label="Holographic screw and gear, alternating technical-spec focus" />
            </div>
          </section>

          {/* 4 — The System (Watch / Propose / Execute) — the how-it-works anchor */}
          <section id="platform" className="es-band vb-accent">
            <div className="es-band-inner es-reveal">
              <div style={{ display: "flex", flexDirection: "column", gap: "clamp(34px,5vh,56px)" }}>
                <div className="es-split">
                  <Eyebrow>02 · THE SYSTEM</Eyebrow>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 720 }}>
                    <p style={{ ...body, fontSize: "clamp(17px,1.6vw,22px)", margin: 0 }}>
                      Everstock watches vendor pricing against the limits you set, chases the quotes, and drafts the purchase order. You stay the one who approves it.
                    </p>
                    <p style={{ ...body, color: "var(--es-faint)", fontSize: "clamp(14px,1.3vw,16.5px)", margin: 0 }}>
                      It runs on top of the systems you already have, your ERP, your EDI feeds, your spreadsheets, and replaces none of them.
                    </p>
                  </div>
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
            </div>
          </section>

          {/* 5 — The Guardrail (big showcase, four beats) */}
          <section id="approvals" className="es-band es-band--solid es-band--wide vb-major vb-stage">
            <div className="es-band-inner es-reveal" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 16 }}>
              <Eyebrow>03 · THE GUARDRAIL</Eyebrow>
              <h2 style={{ ...stmtLg, fontSize: "clamp(26px,3.4vw,48px)", lineHeight: 1.18, letterSpacing: "-0.025em", maxWidth: 840 }}>Nothing moves without your sign-off.</h2>
              <p style={{ ...body, fontSize: "clamp(15px,1.45vw,19px)", margin: 0, maxWidth: 660 }}>
                Proposed, approved, executed, in that order, every time. Here&rsquo;s what happens in between.
              </p>
              <GuardrailShowcase />
            </div>
          </section>

          {/* 6 — The Contract (banner) */}
          <section id="company" className="es-band vb-major vb-deep">
            <div className="es-band-inner es-reveal">
              <div className="es-split">
                <Eyebrow>04 · THE CONTRACT</Eyebrow>
                <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
                  <p style={{ ...stmtLg, fontSize: "clamp(22px,2.6vw,36px)", lineHeight: 1.28, maxWidth: 820 }}>
                    Every proposal carries the quote, the spec, and the reason it fired. You approve with the full picture in front of you, or you don&rsquo;t.
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                    <span style={{ display: "block", width: 7, height: 7, borderRadius: "50%", background: "#0B5FFF", boxShadow: "0 0 12px rgba(11,95,255,0.8)", animation: "esPulse 2.6s ease-in-out infinite" }} />
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, fontWeight: 500, letterSpacing: "0.26em", color: "var(--es-dim)" }}>AGENT ACTIVE · 14 QUOTES IN QUEUE</span>
                  </div>
                  <div id="request" className="es-cta" style={{ paddingTop: 6 }}>
                    <PrimaryCta href="#request">Request access</PrimaryCta>
                    <span style={{ fontFamily: "var(--font-plex)", fontWeight: 300, fontSize: 14, color: "var(--es-faint)" }}>Mid-market distributors · Onboarding in 2 weeks</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 7 — Your Desk (ops reassurance) */}
          <section className="es-band vb-accent">
            <div className="es-band-inner es-reveal">
              <div className="es-split">
                <Eyebrow>05 · YOUR DESK</Eyebrow>
                <div className="es-desk">
                  <div style={{ display: "flex", flexDirection: "column", gap: 16, justifyContent: "center" }}>
                    <h2 style={h2Md}>This makes your job easier, not obsolete.</h2>
                    <p style={{ ...body, fontSize: "clamp(15px,1.4vw,18px)", margin: 0 }}>
                      Everstock handles the price-watching and reorder busywork. You still see everything, approve everything, and stay the one who knows the vendors.
                    </p>
                  </div>
                  <div className="es-surface es-z1 es-desk-card">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "13px 18px", borderBottom: "1px solid var(--es-edge)" }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 500, letterSpacing: "0.24em", color: "var(--es-dim)" }}>APPROVAL QUEUE</span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 500, letterSpacing: "0.16em", color: "var(--es-faint)" }}>3</span>
                    </div>
                    {QUEUE.map((q, i) => (
                      <div key={q.name} style={{ ...queueRow, borderBottom: i < QUEUE.length - 1 ? "1px solid var(--es-hair)" : "none" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
                          <span style={queueName}>{q.name}</span>
                          <span style={queueMeta}>{q.meta}</span>
                        </div>
                        <span className={q.active ? "vb-badge-active" : undefined} style={q.active ? { ...queueBadge, border: "1px solid rgba(11,95,255,0.5)", color: "#8FBAFF", background: "rgba(11,95,255,0.08)" } : queueBadge}>{q.state}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 8 — Your Stack (robotic arm + crane hologram, flipped) */}
          <section className="es-zrow es-zrow--flip es-reveal vb-major vb-ink">
            <div className="es-zglass">
              <Eyebrow id="integrations">06 · YOUR STACK</Eyebrow>
              <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 660 }}>
                <h2 style={h2Md}>Sits on top of the stack you already run. Nothing gets ripped out.</h2>
                <p style={{ ...body, fontSize: "clamp(15px,1.4vw,18px)", margin: 0 }}>
                  Everstock connects to the ERPs, supplier catalogs, and EDI networks distributors already run, across auto parts, electronics, and industrial supply. Still tracking prices and thresholds in a spreadsheet? It works with that too.
                </p>
              </div>
            </div>
            <div className="es-zsolid">
              <PairedHologram src="/videos/arm-crane.mp4" label="Holographic robotic arm and crane running independent idle actions" />
            </div>
            <div className="es-zglass es-zglass--b">
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(clamp(160px,(640px - 100%) * 999,100%),1fr))", gap: 1, background: "var(--es-line)", borderTop: "1px solid var(--es-line)", borderBottom: "1px solid var(--es-line)", opacity: 0.62 }}>
                  {INTEGRATIONS.map((it) => (
                    <div key={it} style={intCell}>{it}</div>
                  ))}
                </div>
                <p style={{ fontFamily: "var(--font-plex)", fontWeight: 300, fontSize: 13.5, lineHeight: 1.5, margin: 0, color: "var(--es-faint)" }}>
                  No lengthy implementation. If you can export a price file, you can get started.
                </p>
              </div>
            </div>
          </section>

          {/* 9 — Outcome stream */}
          <section className="es-band vb-accent" style={{ padding: "clamp(44px,6.4vh,78px) 0" }}>
            <Marquee items={OUTCOMES} itemStyle={outcomeItem} separator={outcomeSep} gap="clamp(22px,2.6vw,44px)" reverse />
          </section>

          {/* 10 — Final CTA */}
          <section className="es-band vb-major vb-deep">
            <div className="es-band-inner es-reveal" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 22 }}>
              <h2 style={{ fontFamily: "var(--font-space)", fontWeight: 700, fontSize: "clamp(30px,4.4vw,60px)", lineHeight: 1.1, letterSpacing: "-0.03em", margin: 0, color: "var(--es-ink)", textShadow: "var(--es-glow)", textWrap: "pretty" }}>
                Stop guessing at what you pay to restock.
              </h2>
              <p style={{ ...body, fontSize: "clamp(15px,1.5vw,19px)", margin: 0, maxWidth: 640 }}>
                You set the thresholds and the specs. Everstock watches prices, chases quotes, and drafts the paperwork, then drops a proposal in your queue for a yes or no.
              </p>
              <p style={{ ...body, color: "var(--es-faint)", fontSize: "clamp(14px,1.35vw,17px)", margin: 0, maxWidth: 560 }}>
                We&rsquo;re onboarding a small group of mid-market distributors as design partners.
              </p>
              <div className="es-cta" style={{ marginTop: 16, justifyContent: "center" }}>
                <PrimaryCta href="#request">Request access</PrimaryCta>
                <SecondaryCta href="#platform">See how it works</SecondaryCta>
              </div>
            </div>
          </section>

          <Footer />
        </main>
      </div>
    </>
  );
}
