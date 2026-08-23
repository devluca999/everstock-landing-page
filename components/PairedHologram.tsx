"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

export const HOLO_MASK =
  "radial-gradient(132% 122% at 50% 48%,#000 64%,transparent 100%)";

/** Mobile-only "tap to play" affordance shown over a paused hologram. */
export function TapBadge({ bottom = false }: { bottom?: boolean }) {
  return (
    <span
      data-tap="true"
      style={{
        position: "absolute",
        left: "50%",
        top: bottom ? undefined : "50%",
        bottom: bottom ? "6%" : undefined,
        transform: bottom ? "translateX(-50%)" : "translate(-50%,-50%)",
        display: "flex",
        alignItems: "center",
        gap: 9,
        padding: "11px 18px",
        borderRadius: 999,
        border: "1px solid var(--es-line)",
        background: "var(--es-panel)",
        fontFamily: "var(--font-mono)",
        fontSize: 10,
        fontWeight: 500,
        letterSpacing: "0.24em",
        color: "var(--es-dim)",
        zIndex: 3,
        pointerEvents: "none",
      }}
    >
      <svg width="9" height="11" viewBox="0 0 9 11" fill="none" aria-hidden="true">
        <path d="M1 1l7 4.5L1 10z" fill="#5B9BFF" />
      </svg>
      TAP TO PLAY
    </span>
  );
}

const videoStyle: CSSProperties = {
  display: "block",
  width: "100%",
  aspectRatio: "1112 / 834",
  objectFit: "contain",
  background: "transparent",
  position: "relative",
  zIndex: 1,
  WebkitMaskImage: HOLO_MASK,
  maskImage: HOLO_MASK,
};

/**
 * A paired icon-hologram (screw+gear / arm+crane). The video sits directly on the
 * section field — a dark radial pool behind it (light theme, so the navy wireframe
 * reads) and a corner vignette veil above it (dark theme, so its rectangle dissolves
 * into the surface). Autoplays on desktop, gated by an IntersectionObserver so only
 * on-screen video decodes; taps to play/pause on mobile.
 */
export default function PairedHologram({ src, label }: { src: string; label: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showTap, setShowTap] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    const wrap = wrapRef.current;
    if (!v || !wrap) return;
    const mobile = window.matchMedia("(max-width:1023.98px)").matches;
    v.muted = true;
    v.loop = true;
    v.playsInline = true;
    v.disablePictureInPicture = true;
    if (mobile) setShowTap(true);
    else v.play().catch(() => {});

    let io: IntersectionObserver | undefined;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              if (!mobile) v.play().catch(() => {});
            } else {
              v.pause();
            }
          });
        },
        { rootMargin: "15% 0px" }
      );
      io.observe(v);
    }

    const onTap = () => {
      if (!mobile) return;
      if (v.paused) {
        v.play().catch(() => {});
        setShowTap(false);
      } else {
        v.pause();
        setShowTap(true);
      }
    };
    wrap.addEventListener("click", onTap);
    return () => {
      io?.disconnect();
      wrap.removeEventListener("click", onTap);
    };
  }, []);

  return (
    <div className="es-holo-surface es-holo-surface--pair">
      <div ref={wrapRef} data-holo-wrap="true" style={{ position: "relative", width: "100%" }}>
        <span className="vb-pool" aria-hidden="true" />
        <video
          ref={videoRef}
          data-holo="true"
          src={src}
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={label}
          style={videoStyle}
        />
        <span className="vb-veil" aria-hidden="true" style={{ zIndex: 2 }}>
          <span className="vb-veil-edges" />
        </span>
        {showTap && <TapBadge />}
      </div>
    </div>
  );
}
