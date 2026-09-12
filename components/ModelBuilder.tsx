"use client";

import { useState, type CSSProperties } from "react";

type Src = "invoice" | "sheet" | "po";
type Field = { label: string; value: string; src: Src[] };
type Entity = { name: string; fields: Field[] };

const DOCS: { key: Src; title: string; sub: string }[] = [
  { key: "invoice", title: "Invoice", sub: "Northline Parts · INV-88412 · 14 lines" },
  { key: "sheet", title: "Spreadsheet", sub: "pricing_v3.xlsx · 1,204 rows · last saved March" },
  { key: "po", title: "Purchase order", sub: "PO-2280 · Northline Parts · issued by you" },
];

const ENTITIES: Entity[] = [
  {
    name: "Vendor",
    fields: [
      { label: "Name", value: "Northline Parts", src: ["invoice", "po"] },
      { label: "Payment terms", value: "Net 30", src: ["invoice"] },
      { label: "Contact", value: "orders@northline…", src: ["po"] },
    ],
  },
  {
    name: "Part",
    fields: [
      { label: "Part number", value: "BR-320-VC", src: ["invoice", "sheet", "po"] },
      { label: "Spec", value: "320 mm vented, coated", src: ["sheet"] },
      { label: "Category", value: "Brakes · learning", src: ["sheet"] },
    ],
  },
  {
    name: "Price",
    fields: [
      { label: "Unit price", value: "$41.20", src: ["invoice", "sheet"] },
      { label: "Last paid", value: "12 Aug", src: ["invoice"] },
      { label: "90-day median", value: "$41.05", src: ["invoice", "sheet"] },
    ],
  },
  {
    name: "Order",
    fields: [
      { label: "PO number", value: "PO-2280", src: ["po"] },
      { label: "Quantity", value: "480", src: ["po"] },
      { label: "Delivery", value: "12 Mar", src: ["po"] },
    ],
  },
];

/* which source feeds which entity, drawn as orthogonal connectors between the two columns */
const LINKS: [Src, number][] = [
  ["invoice", 0], ["invoice", 1], ["invoice", 2],
  ["sheet", 1], ["sheet", 2],
  ["po", 0], ["po", 1], ["po", 3],
];
const SRC_INDEX: Record<Src, number> = { invoice: 0, sheet: 1, po: 2 };
const ELBOW = [28, 50, 72]; // each source turns the corner at its own x so the runs never overlap
// 108px cards on a 12px gap → a 120px pitch; the three-row source column is centred on the four-row model column
const PITCH = 120, MID = 54, DOC_OFFSET = 60;
const TOTAL_FIELDS = ENTITIES.reduce((n, e) => n + e.fields.length, 0);
const ALL: Src[] = ["invoice", "sheet", "po"];

const BLUE = "#5B9BFF";
const GLOW = "0 0 7px rgba(11,95,255,.85)";
const WELL = "inset 0 1px 1.5px rgba(0,0,0,.55)";

const mono: CSSProperties = { fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.18em" };
const cardName: CSSProperties = { fontFamily: "var(--font-space)", fontWeight: 600, fontSize: 14, letterSpacing: "-0.01em" };

/**
 * 03 · The Model — the one interactive moment on the page (ported from the v2 design).
 * Three source documents on the left; a four-entity working model on the right; the
 * connectors between them light up per source. Fields resolve only from sources that
 * have been read, and the category row keeps an honest "still learning" state rather
 * than presenting the model as instantly complete. Fields a source newly resolves fade
 * in staggered, in reading order, so the model visibly fills in.
 */
export default function ModelBuilder() {
  const [read, setRead] = useState<Record<Src, boolean>>({ invoice: false, sheet: false, po: false });
  const [delays, setDelays] = useState<Record<string, number>>({});

  const toggle = (key: Src) => {
    const next = { ...read, [key]: !read[key] };
    const d: Record<string, number> = {};
    if (next[key]) {
      let i = 0;
      ENTITIES.forEach((e) =>
        e.fields.forEach((f) => {
          const was = f.src.some((s) => read[s]);
          const now = f.src.some((s) => next[s]);
          if (now && !was) d[`${e.name}.${f.label}`] = 80 + i++ * 70;
        })
      );
    }
    setDelays(d);
    setRead(next);
  };

  let resolved = 0;
  const readCount = ALL.filter((k) => read[k]).length;
  const catOn = read.sheet;
  const catLabel = catOn ? "4 OF 10 MAPPED · STILL LEARNING" : "NOT YET READ";

  const entities = ENTITIES.map((e) => {
    let n = 0;
    const fields = e.fields.map((f) => {
      const on = f.src.some((s) => read[s]);
      if (on) { n++; resolved++; }
      return { ...f, on, delay: delays[`${e.name}.${f.label}`] ?? 0 };
    });
    return { name: e.name, fields, n, border: n === e.fields.length ? "rgba(11,95,255,.75)" : n > 0 ? "var(--es-line)" : "var(--es-edge)" };
  });

  return (
    <>
      <div className="v2-model">
        <div className="v2-model-docs">
          {DOCS.map((d) => {
            const on = read[d.key];
            return (
              <button
                key={d.key}
                type="button"
                className="v2-doc"
                aria-pressed={on}
                onClick={() => toggle(d.key)}
                style={{ "--doc-border": on ? "rgba(11,95,255,.75)" : "var(--es-edge)", background: on ? "rgba(11,95,255,.07)" : "var(--es-card)" } as CSSProperties}
              >
                <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <span style={cardName}>{d.title}</span>
                  <span style={{ ...mono, display: "flex", alignItems: "center", gap: 7, color: on ? "var(--es-ink)" : "var(--es-faint)" }}>
                    <span aria-hidden="true" style={{ display: "block", width: 7, height: 7, borderRadius: "50%", background: on ? BLUE : "rgba(242,241,237,.14)", boxShadow: on ? GLOW : WELL, transition: "background-color 320ms ease" }} />
                    {on ? "READ" : "READ THIS"}
                  </span>
                </span>
                <span style={{ fontFamily: "var(--font-plex)", fontWeight: 300, fontSize: 12.5, lineHeight: 1.45, color: "var(--es-faint)" }}>{d.sub}</span>
              </button>
            );
          })}
        </div>

        <svg className="v2-model-lines" viewBox="0 0 100 468" preserveAspectRatio="none" aria-hidden="true">
          {LINKS.map(([src, i]) => {
            const j = SRC_INDEX[src];
            const yj = DOC_OFFSET + j * PITCH + MID;
            const yi = i * PITCH + MID;
            return (
              <path
                key={`${src}-${i}`}
                d={`M0 ${yj} H${ELBOW[j]} V${yi} H100`}
                fill="none"
                stroke={read[src] ? "rgba(11,95,255,.8)" : "var(--es-hair)"}
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
                style={{ transition: "stroke 420ms ease" }}
              />
            );
          })}
        </svg>

        <div className="v2-model-ents">
          {entities.map((e) => (
            <div key={e.name} style={{ display: "flex", flexDirection: "column", gap: 8, padding: "12px 16px", borderRadius: "var(--radius-md)", border: `1px solid ${e.border}`, background: "var(--es-card)", transition: "border-color 420ms ease" }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
                <span style={{ ...cardName, color: "var(--es-ink)" }}>{e.name}</span>
                <span style={{ ...mono, letterSpacing: "0.16em", color: "var(--es-faint)" }}>{e.n} OF {e.fields.length}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {e.fields.map((f) => (
                  <div key={f.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, fontSize: 12.5, lineHeight: 1.3 }}>
                    <span style={{ fontFamily: "var(--font-plex)", fontWeight: 300, color: f.on ? "var(--es-dim)" : "var(--es-faint)", transition: "color 320ms ease", transitionDelay: `${f.delay}ms` }}>{f.label}</span>
                    {f.on ? (
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--es-ink)", whiteSpace: "nowrap", animation: "v2Resolve 480ms cubic-bezier(0.22,1,0.36,1) both", animationDelay: `${f.delay}ms` }}>{f.value}</span>
                    ) : (
                      <span className="v2-slot" role="img" aria-label="Not yet read" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <p style={{ fontFamily: "var(--font-plex)", fontWeight: 300, fontSize: 13.5, lineHeight: 1.55, color: "var(--es-faint)", margin: "22px 0 0" }}>Open a source to watch it fill in.</p>
      <div role="status" aria-live="polite" style={{ ...mono, fontSize: 10.5, display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px 22px", color: "var(--es-faint)" }}>
        <span>{readCount} OF 3 SOURCES READ · {resolved} OF {TOTAL_FIELDS} FIELDS RESOLVED</span>
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span>CATEGORIES</span>
          <span style={{ display: "flex", gap: 4 }} aria-hidden="true">
            {Array.from({ length: 10 }, (_, q) => {
              const lit = catOn && q < 4;
              return <span key={q} style={{ display: "block", width: 7, height: 7, borderRadius: "50%", background: lit ? BLUE : "rgba(242,241,237,.14)", boxShadow: lit ? GLOW : WELL, transition: "background-color 320ms ease", transitionDelay: lit ? `${q * 70}ms` : "0ms" }} />;
            })}
          </span>
          <span>{catLabel}</span>
        </span>
      </div>
    </>
  );
}
