"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

type Theme = "graphite" | "light";
interface ThemeCtx {
  theme: Theme;
  toggle: () => void;
}

const Ctx = createContext<ThemeCtx>({ theme: "graphite", toggle: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // graphite is the default; the no-flash script in <head> may have already set data-theme
  const [theme, setTheme] = useState<Theme>("graphite");

  useEffect(() => {
    const attr = document.documentElement.dataset.theme;
    if (attr === "light" || attr === "graphite") setTheme(attr);
  }, []);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "light" ? "graphite" : "light";
      document.documentElement.dataset.theme = next;
      try {
        localStorage.setItem("es-theme", next);
      } catch {}
      return next;
    });
  }, []);

  return <Ctx.Provider value={{ theme, toggle }}>{children}</Ctx.Provider>;
}

export const useTheme = () => useContext(Ctx);

/** Inline, render-blocking script that sets data-theme before paint to avoid a flash. */
export const themeScript = `(function(){try{var t=localStorage.getItem('es-theme');document.documentElement.dataset.theme=(t==='light'?'light':'graphite');}catch(e){document.documentElement.dataset.theme='graphite';}})();`;
