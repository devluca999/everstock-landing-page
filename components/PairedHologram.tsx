"use client";

import { useEffect, useRef, type CSSProperties } from "react";

export const HOLO_MASK =
  "radial-gradient(132% 122% at 50% 48%,#000 64%,transparent 100%)";

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
 * into the surface). It plays ONLY while on-screen: an IntersectionObserver starts it
 * when the section scrolls into view and pauses it when it leaves, on mobile and
 * desktop alike (the clip is muted + playsInline, so in-view autoplay works
 * everywhere and nothing decodes off-screen). No tap-to-play.
 */
export default function PairedHologram({ src, label }: { src: string; label: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.loop = true;
    v.playsInline = true;
    v.disablePictureInPicture = true;

    if (!("IntersectionObserver" in window)) {
      v.play().catch(() => {});
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) v.play().catch(() => {});
          else v.pause();
        });
      },
      { rootMargin: "15% 0px" }
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <div className="es-holo-surface es-holo-surface--pair">
      <div data-holo-wrap="true" style={{ position: "relative", width: "100%" }}>
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
      </div>
    </div>
  );
}
