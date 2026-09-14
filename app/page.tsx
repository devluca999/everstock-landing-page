import GridBackground from "@/components/GridBackground";
import HeroFloor from "@/components/HeroFloor";
import BlueprintAccent from "@/components/BlueprintAccent";
import RevealController from "@/components/RevealController";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import Marquee from "@/components/Marquee";
import ContractGraph from "@/components/ContractGraph";
import dynamic from "next/dynamic";

// below-the-fold client components ship as their own chunks so the hero hydrates
// first; they still server-render, only their JS arrives after the main bundle
const PairedHologram = dynamic(() => import("@/components/PairedHologram"));
const GuardrailShowcase = dynamic(() => import("@/components/GuardrailShowcase"));
const ModelBuilder = dynamic(() => import("@/components/ModelBuilder"));
import { Eyebrow, Lines, PrimaryCta, SecondaryCta, CardMeta } from "@/components/ui";
import type { CSSProperties, ReactNode } from "react";

/* Display type never uses text-wrap balance/pretty at desktop: breaks are set by hand
   (<Lines>) and each headline's column is sized in ch off its longest line. */
const stmtLg: CSSProperties = { fontFamily: "var(--font-space)", fontWeight: 600, fontSize: "clamp(24px,3.1vw,44px)", lineHeight: 1.22, letterSpacing: "-0.02em", margin: 0, color: "var(--es-ink)", textShadow: "var(--es-glow)" };
const h2Md: CSSProperties = { fontFamily: "var(--font-space)", fontWeight: 600, fontSize: "clamp(22px,2.6vw,36px)", lineHeight: 1.24, letterSpacing: "-0.02em", margin: 0, color: "var(--es-ink)", textShadow: "var(--es-glow)" };
const body: CSSProperties = { fontFamily: "var(--font-plex)", fontWeight: 300, lineHeight: 1.6, color: "var(--es-dim)", textWrap: "pretty" };
const card: CSSProperties = { border: "1px solid var(--es-edge)", borderRadius: 6, background: "var(--es-card)", boxShadow: "inset 0 1px 0 var(--es-lip)", padding: "22px 22px 0", display: "flex", flexDirection: "column", gap: 10 };
const intCell: CSSProperties = { background: "var(--es-bg)", padding: "18px 4px", fontFamily: "var(--font-space)", fontSize: 12.5, fontWeight: 500, letterSpacing: "0.06em", color: "var(--es-dim)", textAlign: "center" };
const queueRow: CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, padding: "15px 18px" };
const queueName: CSSProperties = { fontFamily: "var(--font-space)", fontSize: 13.5, fontWeight: 600, color: "var(--es-ink)" };
const queueMeta: CSSProperties = { fontFamily: "var(--font-plex)", fontWeight: 300, fontSize: 12, color: "var(--es-faint)" };
const queueBadge: CSSProperties = { flex: "none", fontFamily: "var(--font-mono)", fontSize: 9.5, fontWeight: 500, letterSpacing: "0.16em", padding: "6px 12px", borderRadius: 999, border: "1px solid var(--es-edge)", color: "var(--es-faint)", background: "transparent" };

const STEPS = [
  { n: "01", name: "Watch", desc: "Every SKU you carry, checked against the price and stock thresholds you set.", meta: ["SCAN INTERVAL", "CONTINUOUS"] },
  { n: "02", name: "Propose", desc: "When a price moves or stock hits your reorder point, a drafted purchase order lands in your queue. Nothing gets bought without you.", meta: ["AUTO-EXECUTE", "DISABLED"] },
  { n: "03", name: "Execute", desc: "You approve. The order goes out through your own vendor accounts, and every step is logged.", meta: ["AUDIT TRAIL", "RETAINED"] },
];
const INTEGRATIONS = ["NetSuite", "Epicor Prophet 21", "SAP Business One", "PartsTech", "Mouser & Digi-Key", "SPS Commerce", "TrueCommerce", "Excel / Spreadsheet"];
const QUEUE = [
  { name: "Michelin Defender T+H", meta: "Qty 24 · $2,140 · auto", state: "PROPOSED", active: true },
  { name: "USB-C 65W charger, retail", meta: "Qty 500 · $6,900 · electronics", state: "APPROVED", active: false },
  { name: "Grade 8 hex bolts, 3/8 in", meta: "Qty 5,000 · $410 · industrial", state: "EXECUTED", active: false },
];

const TAGLINES = [
  "You set the rules. We do the legwork.",
  "Every order waits for your yes",
  "For parts, electronics and industrial distributors",
  "Runs on the ERP you already have",
  "Nothing buys itself",
  "Nothing gets ripped out",
];
const OUTCOMES = [
  "Fewer stockouts",
  "Vendors answer faster",
  "An audit trail that already exists",
  "Prices you can actually compare",
  "Your ops team gets its afternoon back",
  "No more reconciling spreadsheets",
];

const taglineItem: CSSProperties = { fontFamily: "var(--font-space)", fontSize: "clamp(11px,1.05vw,13px)", fontWeight: 500, letterSpacing: "0.24em", textTransform: "uppercase", color: "var(--es-dim)", whiteSpace: "nowrap" };
const outcomeItem: CSSProperties = { fontFamily: "var(--font-space)", fontSize: "clamp(19px,2.3vw,32px)", fontWeight: 600, letterSpacing: "-0.02em", color: "var(--es-ink)", textShadow: "var(--es-glow)", whiteSpace: "nowrap" };
const taglineSep: ReactNode = <span style={{ fontFamily: "var(--font-space)", fontSize: 12, color: "var(--es-faint)" }}>·</span>;
const outcomeSep: ReactNode = <span aria-hidden="true" style={{ display: "block", width: 6, height: 6, borderRadius: "50%", flex: "none", background: "#5B9BFF", boxShadow: "0 0 7px 1px rgba(11,95,255,0.75)" }} />;

export default function Home() {
  return (
    <>
      {/* hero field, bottom to top: blurred conveyor floor → solid graphite field (left) →
          legibility scrim → transparent lattice with the beams */}
      <HeroFloor />
      <GridBackground />
      <BlueprintAccent />
      <RevealController />
      <div id="es-content" style={{ position: "relative", zIndex: 1, overflowX: "clip" }}>
        <Nav />
        <main>
          <Hero />

          {/* trust bar (tagline stream) */}
          <section id="partners" className="es-band vb-accent" style={{ padding: "clamp(30px,4.6vh,52px) 0" }}>
            <Marquee items={TAGLINES} itemStyle={taglineItem} separator={taglineSep} gap="clamp(26px,3vw,52px)" />
          </section>

          {/* 01 — The Leak (screw + gear hologram). Everstock appears nowhere here: it is the problem section. */}
          <section id="problem" className="es-zrow es-reveal vb-major vb-ink">
            <div className="es-zglass">
              <Eyebrow>01 · THE LEAK</Eyebrow>
              <div style={{ display: "flex", flexDirection: "column", gap: 26, maxWidth: 660 }}>
                <h2 className="es-hl" style={{ ...stmtLg, maxWidth: "24ch" }}>
                  <Lines lines={["The price changed.", "Your system didn’t."]} />
                </h2>
                <p style={{ ...body, fontSize: "clamp(15px,1.4vw,18px)", margin: 0, maxWidth: 600 }}>
                  A quote comes in by email. Another by phone. A third as a PDF someone photographs off a screen. Checking every new number against the last one is a full time job, and nobody has a spare one. So the old number keeps getting paid.
                </p>
                <p style={{ ...body, color: "var(--es-faint)", fontSize: "clamp(14px,1.25vw,16px)", margin: 0, maxWidth: 600 }}>
                  You already know &ldquo;close enough&rdquo; doesn&rsquo;t exist here. Wrong revision, wrong finish, wrong thread pitch, and a line goes down. The problem was never that you didn&rsquo;t care. It&rsquo;s that nothing you&rsquo;ve been given actually keeps track.
                </p>
              </div>
            </div>
            <div className="es-zsolid">
              <PairedHologram src="/videos/screw-gear.mp4" label="Holographic screw and gear, alternating technical-spec focus" />
            </div>
          </section>

          {/* 02 — The System (Watch / Propose / Execute), the how-it-works anchor */}
          <section id="platform" className="es-band vb-accent">
            <div className="es-band-inner es-reveal">
              <div style={{ display: "flex", flexDirection: "column", gap: "clamp(34px,5vh,56px)" }}>
                <div className="es-split">
                  <Eyebrow>02 · THE SYSTEM</Eyebrow>
                  <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 720 }}>
                    <h2 className="es-hl" style={{ ...h2Md, maxWidth: "26ch" }}>
                      <Lines lines={["You set the rules.", "We handle the legwork."]} />
                    </h2>
                    <p style={{ ...body, fontSize: "clamp(16px,1.5vw,20px)", margin: 0 }}>
                      You set the price limits and the reorder points. Everstock watches every SKU against them, chases the quotes, checks the spec down to the revision and the finish, and drafts the purchase order. Then it stops and waits for you.
                    </p>
                    <p style={{ ...body, color: "var(--es-faint)", fontSize: "clamp(14px,1.3vw,16.5px)", margin: 0 }}>
                      It runs on top of what you already have. Your ERP, your EDI feeds, your spreadsheets. Nothing gets replaced.
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

          {/* 03 — The Model: the section that carries the unified-data claim, and the one interactive moment */}
          <section id="model" className="es-band vb-major vb-ink">
            <div className="es-band-inner es-reveal">
              <div style={{ display: "flex", flexDirection: "column", gap: "clamp(34px,5vh,56px)" }}>
                <div className="es-split">
                  <Eyebrow>03 · THE MODEL</Eyebrow>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 720 }}>
                    <h2 className="es-hl" style={{ ...h2Md, maxWidth: "30ch" }}>
                      <Lines lines={["You already have the data.", "It just isn’t in one place."]} />
                    </h2>
                    <p style={{ ...body, fontSize: "clamp(15px,1.4vw,18px)", margin: 0 }}>
                      Point Everstock at an invoice, a pricing spreadsheet, a purchase order. It reads them and builds a working model of how your operation buys. Which vendors carry which parts, what you paid, how often, on what terms.
                    </p>
                    <p style={{ ...body, color: "var(--es-faint)", fontSize: "clamp(14px,1.3vw,16.5px)", margin: "12px 0 0" }}>
                      That model is what everything else runs on. Nothing gets sourced, priced or ordered until it exists.
                    </p>
                  </div>
                </div>
                <div>
                  <ModelBuilder />
                </div>
              </div>
            </div>
          </section>

          {/* 04 — The Guardrail (big showcase, four beats) */}
          <section id="approvals" className="es-band es-band--solid es-band--wide vb-major vb-stage">
            <div className="es-band-inner es-reveal" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 16 }}>
              <Eyebrow>04 · THE GUARDRAIL</Eyebrow>
              <h2 className="es-hl" style={{ ...stmtLg, fontSize: "clamp(26px,3.4vw,48px)", lineHeight: 1.18, letterSpacing: "-0.025em", maxWidth: 1000 }}>Nothing moves without your sign-off.</h2>
              <p className="es-hl" style={{ ...body, textWrap: undefined, fontSize: "clamp(15px,1.45vw,19px)", margin: 0, maxWidth: 780 }}>
                <Lines lines={["Proposed, then approved, then executed.", "Always in that order. Here’s what happens in between."]} />
              </p>
              <GuardrailShowcase />
            </div>
          </section>

          {/* 05 — The Contract: the statement, then the precise state graph (the readable twin of Beat 3) */}
          <section id="company" className="es-band vb-major vb-deep">
            <div className="es-band-inner es-reveal">
              <div className="es-split es-split--stmt">
                <Eyebrow>05 · THE CONTRACT</Eyebrow>
                <p className="es-hl" style={{ ...stmtLg, fontSize: "clamp(22px,2.6vw,36px)", lineHeight: 1.28, maxWidth: "41ch" }}>
                  <Lines lines={["Every proposal shows you the quote,", "the spec, and the rule that fired it.", "You approve with the whole picture", "in front of you, or you don’t."]} />
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 30, marginTop: "clamp(34px,5vh,56px)" }}>
                <ContractGraph />
                <div id="request" className="es-cta" style={{ paddingTop: 6 }}>
                  <PrimaryCta href="#request">Request access</PrimaryCta>
                  <span style={{ fontFamily: "var(--font-plex)", fontWeight: 300, fontSize: 14, color: "var(--es-faint)" }}>Mid-market distributors · Design partners only</span>
                </div>
              </div>
            </div>
          </section>

          {/* 06 — Your Desk (the operator's reassurance) */}
          <section className="es-band vb-accent">
            <div className="es-band-inner es-reveal">
              <div className="es-split">
                <Eyebrow>06 · YOUR DESK</Eyebrow>
                <div className="es-desk">
                  <div style={{ display: "flex", flexDirection: "column", gap: 16, justifyContent: "center" }}>
                    <h2 className="es-hl" style={{ ...h2Md, maxWidth: "30ch" }}>
                      <Lines lines={["Your judgment goes further.", "Your job stays yours."]} />
                    </h2>
                    <p style={{ ...body, fontSize: "clamp(15px,1.4vw,18px)", margin: 0 }}>
                      You still see every quote it gathered, approve every order, and stay the one who knows the vendors. What goes away is the part where you chase all of it by hand.
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

          {/* 07 — Your Stack (robotic arm + crane hologram, flipped) */}
          <section className="es-zrow es-zrow--flip es-reveal vb-major vb-ink">
            <div className="es-zglass">
              <Eyebrow id="integrations">07 · YOUR STACK</Eyebrow>
              <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 820 }}>
                <h2 className="es-hl" style={{ ...h2Md, maxWidth: "28ch" }}>
                  <Lines lines={["Keep the systems you have.", "Nothing gets ripped out."]} />
                </h2>
                <p style={{ ...body, fontSize: "clamp(15px,1.4vw,18px)", margin: 0 }}>
                  Everstock connects to the ERP, the supplier catalogs and the EDI feeds you already run, and keeps pricing and product data in sync across them. Still tracking prices in a spreadsheet? That works too.
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
                  If you can export a price file, you can start.
                </p>
              </div>
            </div>
          </section>

          {/* outcome stream */}
          <section className="es-band vb-accent" style={{ padding: "clamp(44px,6.4vh,78px) 0" }}>
            <Marquee items={OUTCOMES} itemStyle={outcomeItem} separator={outcomeSep} gap="clamp(22px,2.6vw,44px)" reverse />
          </section>

          {/* final CTA */}
          <section className="es-band vb-major vb-deep">
            <div className="es-band-inner es-reveal" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 22 }}>
              <h2 className="es-hl" style={{ fontFamily: "var(--font-space)", fontWeight: 700, fontSize: "clamp(30px,4.4vw,54px)", lineHeight: 1.1, letterSpacing: "-0.03em", margin: 0, color: "var(--es-ink)", textShadow: "var(--es-glow)", maxWidth: "30ch" }}>
                <Lines lines={["You shouldn’t have to guess", "what you pay to restock."]} />
              </h2>
              <p style={{ ...body, fontSize: "clamp(15px,1.5vw,19px)", margin: 0, maxWidth: 640 }}>
                You set the thresholds and the specs. Everstock watches the prices, chases the quotes, and drafts the paperwork, then puts a proposal in your queue for a yes or a no.
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
