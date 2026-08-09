"use client";

import { useEffect, useState, type CSSProperties } from "react";

const STAGES = ["PROPOSED", "APPROVED", "EXECUTED"];
const BADGE = ["AWAITING SIGN-OFF", "SIGNED OFF BY YOU", "PO-4821 SENT"];
const NOTE = [
  "Agent proposal — no action taken yet.",
  "Approved 9:41 AM — released to rules engine.",
  "Ordered through Bridgestone Direct, your existing account.",
];

export default function ApprovalFlow() {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const id = setTimeout(() => setStage((s) => (s + 1) % 4), stage === 2 ? 2600 : 2100);
    return () => clearTimeout(id);
  }, [stage]);

  const s = Math.min(stage, 2);
  const idle = stage === 3;

  const pill = (i: number): CSSProperties => {
    const active = !idle && i === s;
    return {
      display: "flex",
      alignItems: "center",
      gap: 9,
      justifyContent: "center",
      flex: "none",
      padding: "9px 16px",
      borderRadius: 999,
      whiteSpace: "nowrap",
      fontFamily: "var(--font-space)",
      fontSize: 11.5,
      fontWeight: 600,
      letterSpacing: "0.14em",
      transition: "all 520ms cubic-bezier(0.4,0,0.2,1)",
      border: active ? "1px solid rgba(11,95,255,0.85)" : "1px solid var(--es-line)",
      color: active ? "#8FBAFF" : "var(--es-faint)",
      background: active ? "rgba(11,95,255,0.1)" : "transparent",
      boxShadow: active ? "0 0 22px rgba(11,95,255,0.3)" : "none",
    };
  };
  const dot = (i: number): CSSProperties => {
    const active = !idle && i === s;
    return {
      width: 6,
      height: 6,
      borderRadius: "50%",
      transition: "all 520ms ease",
      background: active ? "#0B5FFF" : "var(--es-faint)",
      boxShadow: active ? "0 0 10px 2px rgba(11,95,255,0.75)" : "none",
    };
  };

  const fillWidth = idle ? 0 : s === 0 ? 8 : s === 1 ? 50 : 100;

  return (
    <div style={{ marginTop: "clamp(26px,4vh,44px)", display: "flex", flexDirection: "column", gap: "clamp(20px,3vh,30px)" }}>
      <div className="es-tracker" style={{ display: "flex", alignItems: "center", flexWrap: "wrap", rowGap: 12 }}>
        <div style={pill(0)}>
          <span style={dot(0)} />
          {STAGES[0]}
        </div>
        {[1, 2].map((i) => (
          <div key={STAGES[i]} className="es-step" style={{ display: "flex", alignItems: "center", flex: "1 1 auto", minWidth: 0 }}>
            <span className="es-conn" style={{ flex: "1 1 20px", minWidth: 16, height: 1, background: "var(--es-line)" }} />
            <div style={pill(i)}>
              <span style={dot(i)} />
              {STAGES[i]}
            </div>
          </div>
        ))}
      </div>

      <div style={{ position: "relative", height: 2, borderRadius: 2, background: "var(--es-line)", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, top: 0, height: "100%", background: "linear-gradient(90deg,rgba(11,95,255,0.2),rgba(11,95,255,0.85))", transition: "width 900ms cubic-bezier(0.4,0,0.2,1)", boxShadow: "0 0 14px rgba(11,95,255,0.5)", width: `${fillWidth}%` }} />
      </div>

      <div
        style={{
          border: idle ? "1px solid var(--es-edge)" : "1px solid rgba(11,95,255,0.42)",
          borderRadius: 6,
          padding: "18px 20px",
          background: "var(--es-card)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 22,
          flexWrap: "wrap",
          transition: "border-color 600ms ease,box-shadow 600ms ease,opacity 600ms ease",
          opacity: idle ? 0.35 : 1,
          boxShadow: `inset 0 1px 0 ${idle ? "var(--es-lip)" : "rgba(120,175,255,0.22)"}`,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 7, minWidth: 0, flex: "1 1 220px" }}>
          <span style={{ fontFamily: "var(--font-space)", fontSize: 16.5, fontWeight: 600, letterSpacing: "-0.01em", color: "var(--es-ink)" }}>Michelin Defender T+H</span>
          <span style={{ fontFamily: "var(--font-plex)", fontWeight: 300, fontSize: 13.5, color: "var(--es-dim)" }}>Qty 24 · $2,140 · below your $92/unit threshold</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flex: "none" }}>
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" style={{ display: "block", flex: "none", transition: "opacity 420ms ease", opacity: !idle && s >= 1 ? 1 : 0 }}>
            <path d="M3 8.4L6.4 11.8L13 5.2" stroke="#0B5FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "7px 14px",
              borderRadius: 999,
              whiteSpace: "nowrap",
              fontFamily: "var(--font-space)",
              fontSize: 10.5,
              fontWeight: 600,
              letterSpacing: "0.18em",
              minWidth: 186,
              justifyContent: "center",
              transition: "all 520ms ease",
              border: idle ? "1px solid var(--es-line)" : "1px solid rgba(11,95,255,0.5)",
              color: idle ? "var(--es-faint)" : "#8FBAFF",
              background: idle ? "transparent" : "rgba(11,95,255,0.08)",
            }}
          >
            {idle ? "QUEUED" : BADGE[s]}
          </span>
        </div>
      </div>

      <p style={{ fontFamily: "var(--font-plex)", fontWeight: 300, fontSize: 13.5, lineHeight: 1.5, margin: 0, color: "var(--es-faint)" }}>
        {idle ? "Next proposal pending." : NOTE[s]}
      </p>
    </div>
  );
}
