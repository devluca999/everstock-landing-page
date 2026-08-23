"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { HOLO_MASK, TapBadge } from "./PairedHologram";

type Beat = {
  src: string;
  aria: string;
  capLabel: string;
  capTitle: string;
  desc: string;
};

const BEATS: Beat[] = [
  {
    src: "/videos/beat1-prefill.mp4",
    aria: "Beat one — a document peels off the stack and its fields autofill",
    capLabel: "BEAT 01 — PREFILL",
    capTitle: "Everstock fills the paperwork",
    desc: "It reads the quote and writes the vendor, price and quantity fields itself — each one annotated, so you can check its work in a single pass.",
  },
  {
    src: "/videos/beat2-source.mp4",
    aria: "Beat two — vendor storefronts evaluated one at a time around the Everstock mark",
    capLabel: "BEAT 02 — SOURCE",
    capTitle: "It works every vendor, one at a time",
    desc: "Quotes go out to the vendors you approved. Each is scored against your thresholds and marked — favorable or not — before the next.",
  },
  {
    src: "/videos/beat3-approve.mp4",
    aria: "Beat three — packages inspected, stamped and set aside on a conveyor",
    capLabel: "BEAT 03 — APPROVE",
    capTitle: "Everything stops at your queue",
    desc: "Approved lines move on. Flagged lines are set aside and stay visible — nothing is silently dropped, nothing executes on its own.",
  },
  {
    src: "/videos/beat4-reconcile.mp4",
    aria: "Beat four — scattered documents and cracked spreadsheets resolve into two organized rows",
    capLabel: "BEAT 04 — RECONCILE",
    capTitle: "The trail reconciles itself",
    desc: "Unreconciled orders and scattered spreadsheets settle into one uniform timeline — production history you can audit line by line.",
  },
];

const HOLD_MS = 2000;
const MARK_PATH =
  "M32 20C28 12 22 8 16 8C8 8 3 13 3 20C3 27 8 32 16 32C22 32 28 28 32 20C36 12 42 8 48 8C56 8 61 13 61 20C61 27 56 32 48 32C42 32 36 28 32 20Z";

const beatVideoStyle: CSSProperties = {
  display: "block",
  width: "100%",
  height: "100%",
  objectFit: "contain",
  WebkitMaskImage: HOLO_MASK,
  maskImage: HOLO_MASK,
};

const capTitleStyle: CSSProperties = {
  fontFamily: "var(--font-space)",
  fontSize: "clamp(19px,2vw,27px)",
  fontWeight: 600,
  letterSpacing: "-0.018em",
  color: "var(--es-ink)",
  textShadow: "var(--es-glow)",
};
const capLabelStyle: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 10.5,
  fontWeight: 500,
  letterSpacing: "0.26em",
  color: "var(--es-faint)",
};
const descStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "block",
  fontFamily: "var(--font-plex)",
  fontWeight: 300,
  fontSize: "clamp(14px,1.3vw,16px)",
  lineHeight: 1.55,
  color: "var(--es-dim)",
  transition: "opacity 460ms ease",
};

/**
 * The Guardrail showcase — four sequential beats on a progressive-disclosure dot rail.
 * Each beat plays exactly one cycle of its own video, holds ~2s on the settled frame,
 * then hands to the next (auto-advance driven off the video's own clock, not a fixed
 * timer). Beat 2 composites the live chrome Everstock mark into the reserved centre of
 * its generated clip: the mark unifies + beams while the clip is evaluating vendors and
 * resolves back to 12 facets at the head and tail of every loop.
 */
export default function GuardrailShowcase() {
  const [beat, setBeat] = useState(0);
  const [reduced, setReduced] = useState(false);
  const beatRef = useRef(0);
  beatRef.current = beat;

  const stageRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const markSvgRef = useRef<SVGSVGElement>(null);
  const markBeamRef = useRef<SVGGElement>(null);
  const onScreenRef = useRef(false);
  const mobileRef = useRef(false);

  const [showTap, setShowTap] = useState(false);

  // env + on-screen gating: only the visible stage decodes video
  useEffect(() => {
    mobileRef.current = window.matchMedia("(max-width:1023.98px)").matches;
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    if (mobileRef.current) setShowTap(true);

    const stage = stageRef.current;
    let io: IntersectionObserver | undefined;
    if (stage && "IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            onScreenRef.current = e.isIntersecting;
            const v = videoRefs.current[beatRef.current];
            if (!v) return;
            if (e.isIntersecting) {
              if (!mobileRef.current) v.play().catch(() => {});
            } else {
              videoRefs.current.forEach((vv) => vv?.pause());
            }
          });
        },
        { rootMargin: "15% 0px" }
      );
      io.observe(stage);
    }
    return () => io?.disconnect();
  }, []);

  // per-beat: swap active video, schedule advance on its own clock, run the mark cycle
  useEffect(() => {
    const videos = videoRefs.current;
    const active = videos[beat];
    videos.forEach((v, k) => {
      if (!v) return;
      if (k === beat) {
        if (v.getAttribute("preload") === "none") v.setAttribute("preload", "metadata");
        v.loop = false;
        try {
          v.currentTime = 0;
        } catch {}
        if (onScreenRef.current && !mobileRef.current) v.play().catch(() => {});
      } else {
        v.pause();
      }
    });

    const next = () => setBeat((b) => (b + 1) % BEATS.length);
    let holdTimer: ReturnType<typeof setTimeout>;
    let watchdog: ReturnType<typeof setTimeout>;
    let onEnded: (() => void) | undefined;
    let onMeta: (() => void) | undefined;
    if (active) {
      active.loop = false;
      // Primary driver: play one FULL cycle, then hold on the settled final frame for
      // HOLD_MS, then advance. 'ended' fires only after the whole clip has played, so a
      // beat never cuts to the next mid-loop.
      onEnded = () => {
        clearTimeout(watchdog);
        clearTimeout(holdTimer);
        holdTimer = setTimeout(next, HOLD_MS);
      };
      active.addEventListener("ended", onEnded);
      // Watchdog ONLY recovers a stalled/paused clip that will never emit 'ended'
      // (a failed decode, or a paused mobile beat). It is deliberately generous
      // (~2x the real duration) so it can never preempt a normally-playing cycle —
      // that early preemption is exactly the "half cycle then skip" symptom.
      const armWatchdog = () => {
        clearTimeout(watchdog);
        const dur = isFinite(active.duration) && active.duration ? active.duration : 8;
        watchdog = setTimeout(next, dur * 2000 + HOLD_MS + 2000);
      };
      if (active.readyState >= 1) armWatchdog();
      else {
        onMeta = armWatchdog;
        active.addEventListener("loadedmetadata", onMeta, { once: true });
      }
    } else {
      watchdog = setTimeout(next, 5100 + HOLD_MS);
    }

    // --- Beat 2 mark: sync unify/beam to the video's vendor-scanning window ---
    let raf = 0;
    const svg = markSvgRef.current;
    const beam = markBeamRef.current;
    const runMark = () => {
      if (!svg || !beam) return;
      const facets = svg.querySelectorAll<SVGPathElement>("[data-facet]");
      const cut = (v: string) => facets.forEach((p) => p.setAttribute("stroke-dasharray", v));
      const rest = () => {
        cut("6.63 1.7");
        beam.style.opacity = "0";
      };
      if (beat !== 1) {
        rest();
        return;
      }
      if (reduced) {
        cut("100 0");
        beam.style.opacity = "1";
        return;
      }
      const video = videoRefs.current[1];
      if (!video) {
        cut("100 0");
        beam.style.opacity = "1";
        return;
      }
      const HEAD = 0.45,
        TAIL = 0.35,
        VENDORS = 3;
      let unified: boolean | null = null;
      const tick = () => {
        if (beatRef.current !== 1) {
          rest();
          return;
        }
        const d = video.duration || 5.1;
        const t = video.currentTime;
        const scanning = video.readyState > 1 && t > HEAD && t < d - TAIL;
        if (scanning !== unified) {
          unified = scanning;
          cut(scanning ? "100 0" : "6.63 1.7");
        }
        if (scanning) {
          const span = Math.max(0.2, (d - TAIL - HEAD) / VENDORS);
          const local = ((t - HEAD) % span) / span;
          beam.style.opacity = local < 0.16 ? "1" : "0.86";
        } else {
          beam.style.opacity = "0";
        }
        raf = requestAnimationFrame(tick);
      };
      tick();
    };
    runMark();

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(watchdog);
      if (active && onEnded) active.removeEventListener("ended", onEnded);
      if (active && onMeta) active.removeEventListener("loadedmetadata", onMeta);
      cancelAnimationFrame(raf);
    };
  }, [beat, reduced]);

  // mobile tap-to-play on the stage
  const onStageTap = () => {
    if (!mobileRef.current) return;
    const v = videoRefs.current[beat];
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
      setShowTap(false);
    } else {
      v.pause();
      setShowTap(true);
    }
  };

  const goBeat = (i: number) => setBeat(Math.max(0, Math.min(BEATS.length - 1, i)));

  const scrubStart = (e: PointerEvent<HTMLDivElement>) => {
    const rail = e.currentTarget;
    rail.style.cursor = "grabbing";
    const pick = (clientX: number) => {
      const r = rail.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, (clientX - r.left) / Math.max(1, r.width)));
      goBeat(Math.round(p * (BEATS.length - 1)));
    };
    const move = (ev: globalThis.PointerEvent) => pick(ev.clientX);
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      rail.style.cursor = "grab";
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    pick(e.clientX);
  };

  const dotStyle = (k: number): CSSProperties => {
    const base: CSSProperties = {
      display: "block",
      width: 9,
      height: 9,
      borderRadius: "50%",
      transition: "background-color 300ms ease,box-shadow 300ms ease,transform 300ms ease",
    };
    if (k === beat)
      return {
        ...base,
        backgroundColor: "#5B9BFF",
        boxShadow: "0 0 6px 1px rgba(11,95,255,0.95),0 0 17px 4px rgba(11,95,255,0.45)",
        transform: "scale(1.18)",
        animation: reduced ? undefined : "esLed 2.8s ease-in-out infinite",
      };
    if (k < beat)
      return {
        ...base,
        backgroundColor: "#40FFA8",
        boxShadow: "0 0 5px 1px rgba(64,255,168,0.8),0 0 14px 3px rgba(64,255,168,0.3)",
      };
    return {
      ...base,
      backgroundColor: "rgba(242,241,237,0.14)",
      boxShadow: "inset 0 1px 1.5px rgba(0,0,0,0.55)",
    };
  };

  const arrowBtn: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 34,
    height: 34,
    padding: 0,
    borderRadius: 999,
    border: "1px solid var(--es-line)",
    background: "transparent",
    color: "var(--es-faint)",
    cursor: "pointer",
  };

  return (
    <>
      {/* --- stage: four cross-fading beat videos --- */}
      <div
        ref={stageRef}
        onClick={onStageTap}
        style={{
          position: "relative",
          aspectRatio: "16 / 9",
          height: "var(--vb-stage-h)",
          width: "auto",
          maxWidth: "100%",
          margin: "var(--space-2) auto 0",
        }}
      >
        {BEATS.map((b, k) => (
          <div
            key={k}
            data-holo-wrap="true"
            style={{
              position: "absolute",
              inset: 0,
              opacity: k === beat ? 1 : 0,
              pointerEvents: k === beat ? "auto" : "none",
              contentVisibility: k === beat ? "visible" : "auto",
              transition: "opacity 560ms cubic-bezier(0.22,1,0.36,1)",
            }}
          >
            <video
              ref={(el) => {
                videoRefs.current[k] = el;
              }}
              data-holo="true"
              data-beat="true"
              src={b.src}
              muted
              playsInline
              preload={k === 0 ? "metadata" : "none"}
              aria-label={b.aria}
              style={beatVideoStyle}
            />
            {/* Beat 2 — composited live chrome mark in the clip's reserved centre */}
            {k === 1 && (
              <>
                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%,-50%)",
                    display: "block",
                    width: "clamp(128px,16vw,222px)",
                    height: "clamp(104px,13vw,180px)",
                    background:
                      "radial-gradient(closest-side,rgba(16,18,22,0.97),rgba(16,18,22,0.93) 38%,rgba(16,18,22,0.55) 70%,rgba(16,18,22,0) 100%)",
                  }}
                />
                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%,-50%)",
                    display: "block",
                    width: "clamp(124px,15.5vw,214px)",
                  }}
                >
                  <MarkSvg svgRef={markSvgRef} beamRef={markBeamRef} />
                </span>
              </>
            )}
            {showTap && k === beat && <TapBadge bottom={k === 1} />}
          </div>
        ))}
      </div>

      {/* --- beat caption (label + title), fixed height so cross-fades don't reflow --- */}
      <div style={{ position: "relative", width: "100%", maxWidth: 660, height: 64 }}>
        {BEATS.map((b, k) => (
          <div
            key={k}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
              opacity: k === beat ? 1 : 0,
              transition: "opacity 460ms ease",
            }}
          >
            <span style={capLabelStyle}>{b.capLabel}</span>
            <span style={capTitleStyle}>{b.capTitle}</span>
          </div>
        ))}
      </div>

      {/* --- dot rail (reachable directly under the caption) --- */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={() => goBeat((beat + BEATS.length - 1) % BEATS.length)} aria-label="Previous beat" style={arrowBtn}>
          <svg width="7" height="11" viewBox="0 0 7 11" fill="none" aria-hidden="true">
            <path d="M6 1L1.5 5.5L6 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div
          onPointerDown={scrubStart}
          role="group"
          aria-label="Showcase beats"
          style={{ display: "flex", alignItems: "center", padding: "0 4px", cursor: "grab", touchAction: "pan-y" }}
        >
          {BEATS.map((b, k) => (
            <div key={k} style={{ display: "flex", alignItems: "center" }}>
              {k > 0 && (
                <span aria-hidden="true" style={{ display: "block", width: "clamp(26px,4vw,54px)", borderTop: "1px dashed var(--es-line)" }} />
              )}
              <button
                onClick={() => goBeat(k)}
                aria-label={`Beat ${k + 1} — ${b.capLabel.split("— ")[1]?.toLowerCase() ?? ""}`}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 30, height: 34, padding: 0, border: 0, background: "transparent", cursor: "pointer" }}
              >
                <span style={dotStyle(k)} />
              </button>
            </div>
          ))}
        </div>
        <button onClick={() => goBeat((beat + 1) % BEATS.length)} aria-label="Next beat" style={arrowBtn}>
          <svg width="7" height="11" viewBox="0 0 7 11" fill="none" aria-hidden="true">
            <path d="M1 1l4.5 4.5L1 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* --- description, fixed height --- */}
      <div style={{ position: "relative", width: "100%", maxWidth: 620, height: 76 }}>
        {BEATS.map((b, k) => (
          <span key={k} style={{ ...descStyle, opacity: k === beat ? 1 : 0 }}>
            {b.desc}
          </span>
        ))}
      </div>
    </>
  );
}

/* The locked chrome mark, ported verbatim (facets never redrawn by hand). Five material
   passes (broad chrome, matte, grain-mask, sheen, inset lip) all carry data-facet so the
   unify/resolve cut hits every layer; the beam group is a separate three-pass overlay. */
function MarkSvg({
  svgRef,
  beamRef,
}: {
  svgRef: React.RefObject<SVGSVGElement | null>;
  beamRef: React.RefObject<SVGGElement | null>;
}) {
  return (
    <svg
      ref={svgRef}
      viewBox="0 0 64 40"
      width="100%"
      fill="none"
      style={{
        display: "block",
        overflow: "visible",
        filter:
          "drop-shadow(0 24px 44px rgba(0,0,0,0.72)) drop-shadow(0 8px 18px rgba(0,0,0,0.62)) drop-shadow(0 2px 4px rgba(0,0,0,0.48))",
      }}
    >
      <defs>
        <linearGradient id="esChromeBroad" x1="0.396" y1="0.011" x2="0.604" y2="0.989">
          <stop offset="0" stopColor="#787D85" />
          <stop offset="0.10" stopColor="#A7ACB4" />
          <stop offset="0.30" stopColor="#4E5158" />
          <stop offset="0.48" stopColor="#8B9098" />
          <stop offset="0.64" stopColor="#44464C" />
          <stop offset="0.80" stopColor="#959AA2" />
          <stop offset="0.92" stopColor="#53565C" />
          <stop offset="1" stopColor="#7C818A" />
        </linearGradient>
        <linearGradient id="esChromeMatte" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.035" />
          <stop offset="0.34" stopColor="#FFFFFF" stopOpacity="0.008" />
          <stop offset="1" stopColor="#000000" stopOpacity="0.10" />
        </linearGradient>
        <linearGradient id="esChromeSheen" x1="0.235" y1="0.076" x2="0.765" y2="0.924">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.30" />
          <stop offset="0.22" stopColor="#FFFFFF" stopOpacity="0.06" />
          <stop offset="0.44" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.10" />
        </linearGradient>
        <linearGradient id="esChromeLip" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.42" />
          <stop offset="0.45" stopColor="#FFFFFF" stopOpacity="0.06" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        <pattern id="esChromeGrain" width="18" height="18" patternUnits="userSpaceOnUse">
          <image
            width="18"
            height="18"
            preserveAspectRatio="none"
            href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E"
          />
        </pattern>
        <mask id="esChromeMask" maskUnits="userSpaceOnUse" x="-6" y="-6" width="76" height="52">
          <path data-facet="true" d={MARK_PATH} fill="none" stroke="#FFFFFF" strokeWidth="5.6" strokeLinecap="butt" strokeLinejoin="miter" pathLength={100} strokeDasharray="6.63 1.7" />
        </mask>
      </defs>
      <path data-facet="true" d={MARK_PATH} fill="none" stroke="rgba(228,234,240,0.30)" strokeWidth="6.5" strokeLinecap="butt" strokeLinejoin="miter" pathLength={100} strokeDasharray="6.63 1.7" style={{ transition: "stroke-dasharray 220ms cubic-bezier(0.65,0,0.35,1)" }} />
      <path data-facet="true" d={MARK_PATH} fill="none" strokeWidth="5.6" strokeLinecap="butt" strokeLinejoin="miter" pathLength={100} strokeDasharray="6.63 1.7" stroke="url(#esChromeBroad)" style={{ transition: "stroke-dasharray 220ms cubic-bezier(0.65,0,0.35,1)" }} />
      <path data-facet="true" d={MARK_PATH} fill="none" stroke="url(#esChromeMatte)" strokeWidth="5.6" strokeLinecap="butt" strokeLinejoin="miter" pathLength={100} strokeDasharray="6.63 1.7" />
      <rect className="vb-mark-grain" x="-6" y="-6" width="76" height="52" fill="url(#esChromeGrain)" mask="url(#esChromeMask)" opacity="0.075" style={{ mixBlendMode: "overlay" }} />
      <path data-facet="true" d={MARK_PATH} fill="none" stroke="url(#esChromeSheen)" strokeWidth="5.6" strokeLinecap="butt" strokeLinejoin="miter" pathLength={100} strokeDasharray="6.63 1.7" />
      <path data-facet="true" d={MARK_PATH} fill="none" stroke="url(#esChromeLip)" strokeWidth="0.9" strokeLinecap="butt" strokeLinejoin="miter" pathLength={100} strokeDasharray="6.63 1.7" transform="translate(0,-0.34)" />
      <g ref={beamRef} opacity="0" style={{ transition: "opacity 180ms linear" }}>
        <path d={MARK_PATH} fill="none" stroke="#3E8BFF" strokeWidth="7.5" strokeLinecap="round" pathLength={100} strokeDasharray="38 62" opacity="0.16" style={{ filter: "blur(5.5px)", animation: "esMarkBeam 3s linear infinite" }} />
        <path d={MARK_PATH} fill="none" stroke="#3E8BFF" strokeWidth="11" strokeLinecap="round" pathLength={100} strokeDasharray="26 74" opacity="0.34" style={{ filter: "blur(3.6px)", animation: "esMarkBeam 3s linear infinite" }} />
        <path d={MARK_PATH} fill="none" stroke="#2E7BFF" strokeWidth="5.6" strokeLinecap="butt" strokeLinejoin="miter" pathLength={100} strokeDasharray="26 74" opacity="0.92" style={{ animation: "esMarkBeam 3s linear infinite" }} />
        <path d={MARK_PATH} fill="none" stroke="#DCEAFF" strokeWidth="1.8" strokeLinecap="butt" strokeLinejoin="miter" pathLength={100} strokeDasharray="26 74" opacity="0.95" style={{ filter: "drop-shadow(0 0 2px rgba(220,234,255,0.9))", animation: "esMarkBeam 3s linear infinite" }} />
      </g>
    </svg>
  );
}
