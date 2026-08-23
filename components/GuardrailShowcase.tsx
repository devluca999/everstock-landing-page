"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { HOLO_MASK } from "./PairedHologram";

type Beat = {
  src: string;
  aria: string;
  capTitle: string;
  desc: string;
};

const BEATS: Beat[] = [
  {
    src: "/videos/beat1-prefill.mp4",
    aria: "A purchase-order document peels off the stack and its vendor, price and quantity fields autofill",
    capTitle: "Everstock fills the paperwork",
    desc: "It reads the quote and writes the vendor, price and quantity fields itself, each one annotated, so you can check its work in a single pass.",
  },
  {
    src: "/videos/beat2-source.mp4",
    aria: "Vendors are evaluated one at a time around the live Everstock mark",
    capTitle: "It works every vendor, one at a time",
    desc: "Quotes go out to the vendors you approved. Each is scored against your thresholds and marked, favorable or not, before the next.",
  },
  {
    src: "/videos/beat3-approve.mp4",
    aria: "Packages are inspected, stamped and set aside on a conveyor",
    capTitle: "Everything stops at your queue",
    desc: "Approved lines move on. Flagged lines are set aside and stay visible. Nothing is silently dropped, nothing executes on its own.",
  },
  {
    src: "/videos/beat4-reconcile.mp4",
    aria: "Scattered documents and cracked spreadsheets resolve into two organized rows",
    capTitle: "The trail reconciles itself",
    desc: "Unreconciled orders and scattered spreadsheets settle into one uniform timeline. Production history you can audit line by line.",
  },
];

const HOLD_MS = 2000;

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
  const onScreenRef = useRef(false);

  // on-screen gating: the active beat plays only while the showcase is in view,
  // and every beat pauses when it scrolls away. The clips are muted + playsInline,
  // so this autoplay-in-view works on mobile and desktop, and nothing decodes
  // off-screen.
  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);

    const stage = stageRef.current;
    let io: IntersectionObserver | undefined;
    if (stage && "IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            onScreenRef.current = e.isIntersecting;
            if (e.isIntersecting) {
              videoRefs.current[beatRef.current]?.play().catch(() => {});
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
        if (onScreenRef.current) v.play().catch(() => {});
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

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(watchdog);
      if (active && onEnded) active.removeEventListener("ended", onEnded);
      if (active && onMeta) active.removeEventListener("loadedmetadata", onMeta);
    };
  }, [beat]);

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
            {/* Beat 2's Everstock mark is rendered natively inside the clip
                (segmented at rest, then a unified chrome loop with the electric-blue
                beam while it scans vendors), so no DOM composite is needed here. */}
          </div>
        ))}
      </div>

      {/* --- beat title (the "beat NN" scaffolding stays out of the finished page,
             like an act label never printed on the footage), fixed height so
             cross-fades don't reflow --- */}
      <div style={{ position: "relative", width: "100%", maxWidth: 660, height: 44 }}>
        {BEATS.map((b, k) => (
          <div
            key={k}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: k === beat ? 1 : 0,
              transition: "opacity 460ms ease",
            }}
          >
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
                aria-label={`Step ${k + 1} of ${BEATS.length}: ${b.capTitle}`}
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
