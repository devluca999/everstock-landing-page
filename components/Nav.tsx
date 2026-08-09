"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Logo from "./Logo";
import { useTheme } from "@/app/theme";

const LINKS = [
  { href: "#platform", label: "Platform", pill: "PLATFORM" },
  { href: "#pricing", label: "Pricing", pill: "PRICING" },
  { href: "#company", label: "Company", pill: "COMPANY" },
  { href: "#login", label: "Log in", pill: "LOG IN" },
];

const pillBase: React.CSSProperties = {
  padding: "9px 16px",
  borderRadius: 999,
  transition: "color 200ms ease,background 420ms ease,border-color 420ms ease",
};

export default function Nav() {
  const { theme, toggle } = useTheme();
  const themeLabel = theme === "light" ? "Dark" : "Light";
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.66);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close the sheet if the viewport grows past lg while it's open
  useEffect(() => {
    if (!open) return;
    const onResize = () => {
      if (window.innerWidth >= 1024) setOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [open]);

  // scroll-lock, inert background, Esc, focus-trap while the sheet is open
  useEffect(() => {
    if (!open) return;
    const sheet = sheetRef.current;
    const content = document.getElementById("es-content");
    document.body.style.overflow = "hidden";
    content?.setAttribute("inert", "");
    content?.setAttribute("aria-hidden", "true");
    const focusables = sheet ? Array.from(sheet.querySelectorAll<HTMLElement>("a[href],button")) : [];
    focusables[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); return; }
      if (e.key === "Tab" && focusables.length) {
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      content?.removeAttribute("inert");
      content?.removeAttribute("aria-hidden");
      hamburgerRef.current?.focus();
    };
  }, [open]);

  const closeAnd = useCallback((fn?: () => void) => () => { setOpen(false); fn?.(); }, []);

  return (
    <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 20, padding: "clamp(12px,1.8vh,20px) clamp(16px,3vw,40px)", pointerEvents: "none" }}>
      <div
        style={{
          maxWidth: scrolled ? "min(880px, 100%)" : 1280,
          margin: "0 auto",
          padding: scrolled ? "7px 8px 7px 14px" : "8px 10px 8px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
          borderRadius: 999,
          border: "1px solid transparent",
          borderColor: scrolled ? "var(--es-line)" : "transparent",
          background: scrolled ? "var(--es-panel)" : "transparent",
          backdropFilter: scrolled ? "blur(18px)" : "blur(0px)",
          WebkitBackdropFilter: scrolled ? "blur(18px)" : "blur(0px)",
          boxShadow: scrolled ? "0 14px 44px rgba(0,0,0,0.3)" : "0 0 0 rgba(0,0,0,0)",
          pointerEvents: "auto",
          transition:
            "max-width 560ms cubic-bezier(0.4,0,0.2,1),padding 420ms ease,background 420ms ease,border-color 420ms ease,box-shadow 420ms ease",
        }}
      >
        <a href="#top" style={{ display: "flex", alignItems: "center", gap: 15, transformOrigin: "left center", transform: scrolled ? "scale(0.8)" : "scale(1)", transition: "transform 460ms cubic-bezier(0.4,0,0.2,1)" }}>
          <Logo />
          <span style={{ fontFamily: "var(--font-space)", fontWeight: 700, fontSize: 16.5, letterSpacing: "0.2em", color: "var(--es-ink)", textShadow: "var(--es-glow)" }}>EVERSTOCK</span>
        </a>

        {/* desktop pills */}
        <nav className="hidden lg:flex" style={{ alignItems: "center", gap: "clamp(6px,0.9vw,14px)", fontFamily: "var(--font-space)", fontSize: 11.5, fontWeight: 500, letterSpacing: "0.18em", color: "var(--es-dim)" }}>
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="es-navpill" style={{ ...pillBase, background: scrolled ? "transparent" : "var(--es-pill)", border: "1px solid", borderColor: scrolled ? "transparent" : "var(--es-line)" }}>
              {l.pill}
            </a>
          ))}
          <button onClick={toggle} className="es-navpill" style={{ ...pillBase, fontFamily: "var(--font-space)", fontSize: 11.5, fontWeight: 500, letterSpacing: "0.18em", color: "var(--es-dim)", cursor: "pointer", background: scrolled ? "transparent" : "var(--es-pill)", border: "1px solid", borderColor: scrolled ? "transparent" : "var(--es-line)" }}>
            {themeLabel}
          </button>
        </nav>

        {/* mobile hamburger */}
        <button
          ref={hamburgerRef}
          className="flex lg:hidden"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
          aria-controls="es-nav-sheet"
          style={{ alignItems: "center", justifyContent: "center", width: 42, height: 42, padding: 0, borderRadius: 999, background: "var(--es-pill)", border: "1px solid var(--es-line)", color: "var(--es-ink)", cursor: "pointer" }}
        >
          <svg width="18" height="12" viewBox="0 0 18 12" fill="none" aria-hidden="true"><path d="M1 1h16M1 6h16M1 11h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
        </button>
      </div>

      {mounted &&
        createPortal(
          <div
            id="es-nav-sheet"
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
            style={{ position: "fixed", inset: 0, zIndex: 40, display: open ? "block" : "none", opacity: open ? 1 : 0, transition: "opacity 260ms ease", background: "var(--es-bg)", pointerEvents: "auto" }}
          >
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", padding: "clamp(20px,5vw,36px)" }} onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <a href="#top" onClick={closeAnd()} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Logo width={52} height={32} beam={false} />
                  <span style={{ fontFamily: "var(--font-space)", fontWeight: 700, fontSize: 15, letterSpacing: "0.2em", color: "var(--es-ink)" }}>EVERSTOCK</span>
                </a>
                <button onClick={() => setOpen(false)} aria-label="Close menu" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 42, height: 42, padding: 0, borderRadius: 999, background: "var(--es-pill)", border: "1px solid var(--es-line)", color: "var(--es-ink)", cursor: "pointer" }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>
                </button>
              </div>
              <nav style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 8 }}>
                {LINKS.map((l) => (
                  <a key={l.href} href={l.href} onClick={closeAnd()} style={{ fontFamily: "var(--font-space)", fontSize: "clamp(26px,7vw,40px)", fontWeight: 700, letterSpacing: "-0.01em", color: "var(--es-ink)", padding: "10px 0" }}>
                    {l.label}
                  </a>
                ))}
              </nav>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, borderTop: "1px solid var(--es-line)", paddingTop: 24 }}>
                <a href="#request" onClick={closeAnd()} style={{ fontFamily: "var(--font-space)", fontSize: 13, fontWeight: 500, letterSpacing: "0.08em", background: "var(--es-ink)", color: "var(--es-bg)", borderRadius: 999, padding: "14px 28px" }}>Request access</a>
                <button onClick={toggle} style={{ fontFamily: "var(--font-space)", fontSize: 11.5, fontWeight: 500, letterSpacing: "0.18em", color: "var(--es-dim)", background: "var(--es-pill)", border: "1px solid var(--es-line)", borderRadius: 999, padding: "11px 20px", cursor: "pointer" }}>{themeLabel}</button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </header>
  );
}
