import type { CSSProperties } from "react";

const node: CSSProperties = { height: 84, display: "flex", flexDirection: "column", justifyContent: "center", gap: 5, padding: "0 14px", borderRadius: "var(--radius-md)" };
const agent: CSSProperties = { ...node, border: "1px solid rgba(11,95,255,.75)", background: "var(--es-bg)" };
const human: CSSProperties = { ...node, background: "var(--es-ink)", color: "var(--es-bg)" };
const returned: CSSProperties = { ...node, border: "1px solid var(--es-line)", background: "var(--es-bg)" };
const title: CSSProperties = { display: "flex", alignItems: "center", gap: 7, fontFamily: "var(--font-space)", fontWeight: 600, fontSize: 14, color: "var(--es-ink)" };
const sub: CSSProperties = { fontFamily: "var(--font-plex)", fontWeight: 300, fontSize: 12, lineHeight: 1.4, color: "var(--es-faint)" };
const led: CSSProperties = { display: "block", width: 7, height: 7, borderRadius: "50%", background: "#5B9BFF", boxShadow: "0 0 7px rgba(11,95,255,.85)" };
const legend: CSSProperties = { display: "flex", alignItems: "center", gap: 8 };

/* Column geometry of the 3-col grid with a 12% column gap: each column is 25.33% wide. */
const COL = (100 - 24) / 3;
const X1 = COL, X2 = COL + 12, X3 = 2 * COL + 12, X4 = 2 * COL + 24; // column edges, in %
const MID1 = COL / 2, MID2 = 50; // column centres
const ROW = 84, GAP = 44;
const Y1 = ROW / 2, Y2 = ROW + GAP, Y3 = ROW + GAP + ROW / 2; // row-1 centre, row-2 top, row-2 centre

/* Arrowheads are real 8×8 glyphs positioned in CSS, not stretched viewBox paths, so
   they keep their shape whatever the graph's width. */
function Arrow({ dir, left, top, color }: { dir: "r" | "d" | "u"; left: string; top: number; color: string }) {
  const path = dir === "r" ? "M2 1 L6 4 L2 7" : dir === "d" ? "M1 2 L4 6 L7 2" : "M1 6 L4 2 L7 6";
  const shift = dir === "r" ? "translate(-100%,-50%)" : dir === "d" ? "translate(-50%,-100%)" : "translate(-50%,0)";
  return (
    <svg className="v2-arrow" viewBox="0 0 8 8" width="8" height="8" aria-hidden="true" style={{ left, top, transform: shift }}>
      <path d={path} fill="none" stroke={color} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * 05 · The Contract — the precise, readable version of the Guardrail: the
 * Proposed → Approved → Executed state graph with the Returned branch, orthogonal
 * right-angle routing, blue border = Everstock runs the step, solid = the human owns it.
 * Static markup (no client JS): the SVG lines stretch with the grid; arrowheads don't.
 */
export default function ContractGraph() {
  return (
    <div className="v2-graph-wrap">
      <div className="v2-graph-overlay" aria-hidden="true">
        <svg viewBox={`0 0 100 ${ROW + GAP + ROW}`} preserveAspectRatio="none" style={{ display: "block", width: "100%", height: "100%", overflow: "visible" }}>
          <path d={`M${X1} ${Y1} H${X2}`} fill="none" stroke="#5B9BFF" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <path d={`M${X3} ${Y1} H${X4}`} fill="none" stroke="var(--es-dim)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <path d={`M${MID2} ${ROW} V${Y2}`} fill="none" stroke="var(--es-dim)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <path d={`M${X2} ${Y3} H${MID1} V${ROW}`} fill="none" stroke="var(--es-line)" strokeWidth="1" strokeDasharray="3 4" vectorEffect="non-scaling-stroke" />
        </svg>
        <Arrow dir="r" left={`${X2}%`} top={Y1} color="#5B9BFF" />
        <Arrow dir="r" left={`${X4}%`} top={Y1} color="var(--es-dim)" />
        <Arrow dir="d" left={`${MID2}%`} top={Y2} color="var(--es-dim)" />
        <Arrow dir="u" left={`${MID1}%`} top={ROW} color="var(--es-faint)" />
      </div>
      <div className="v2-graph">
        <div style={agent}>
          <span style={title}><span aria-hidden="true" style={led} />Proposed</span>
          <span style={sub}>Drafted by Everstock, quote and rule attached</span>
        </div>
        <div style={human}>
          <span style={{ ...title, color: "var(--es-bg)" }}>Approved</span>
          <span style={{ ...sub, fontWeight: 500, color: "inherit", opacity: 0.78 }}>You, and only you. Never a setting</span>
        </div>
        <div style={agent}>
          <span style={title}><span aria-hidden="true" style={led} />Executed</span>
          <span style={sub}>Placed via your vendor account, fully logged</span>
        </div>
        <div aria-hidden="true" />
        <div style={returned}>
          <span style={title}>Returned</span>
          <span style={sub}>Sent back with a note. It re-proposes, never retries</span>
        </div>
        <div aria-hidden="true" />
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 24px", paddingTop: 20, fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: "0.18em", color: "var(--es-faint)" }}>
        <span style={legend}><span aria-hidden="true" style={{ display: "block", width: 14, height: 10, borderRadius: 3, border: "1px solid rgba(11,95,255,.75)" }} />EVERSTOCK RUNS IT</span>
        <span style={legend}><span aria-hidden="true" style={{ display: "block", width: 14, height: 10, borderRadius: 3, background: "var(--es-ink)" }} />YOU OWN IT</span>
      </div>
    </div>
  );
}
