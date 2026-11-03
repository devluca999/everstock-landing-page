"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * A native <dialog> opened by a window event (es:claim, es:demo). Arriving on one of
 * `hashes` calls `arrive` (lib/cta's openClaim / openDemo, which decide between this dialog,
 * sign-up and Cal.com). Locks the page scroll while open, closes on Escape / backdrop, gives
 * focus back.
 */
export function useDialog(event: string, hashes: string[], arrive: () => void, onOpen: (detail: { cta?: string }) => void) {
  const ref = useRef<HTMLDialogElement>(null);
  const returnTo = useRef<Element | null>(null);
  const openRef = useRef(onOpen);
  const arriveRef = useRef(arrive);
  useEffect(() => {
    openRef.current = onOpen;
    arriveRef.current = arrive;
  });

  const open = useCallback((detail: { cta?: string } = {}) => {
    const d = ref.current;
    if (!d) return;
    if (!d.open) {
      returnTo.current = document.activeElement;
      d.showModal();
      document.documentElement.style.overflow = "hidden";
      document.documentElement.setAttribute("data-modal-open", "");
    }
    openRef.current(detail);
  }, []);
  const close = useCallback(() => ref.current?.close(), []);

  useEffect(() => {
    const d = ref.current;
    const onEvent = (e: Event) => open((e as CustomEvent).detail || {});
    const onHash = () => {
      if (hashes.includes(location.hash)) arriveRef.current();
    };
    const onClose = () => {
      document.documentElement.style.overflow = "";
      document.documentElement.removeAttribute("data-modal-open");
      if (hashes.includes(location.hash)) history.replaceState(null, "", location.pathname + location.search);
      const r = returnTo.current as HTMLElement | null;
      if (r && r.focus) r.focus();
    };
    window.addEventListener(event, onEvent);
    window.addEventListener("hashchange", onHash);
    d?.addEventListener("close", onClose);
    onHash();
    return () => {
      window.removeEventListener(event, onEvent);
      window.removeEventListener("hashchange", onHash);
      d?.removeEventListener("close", onClose);
    };
    // hashes is a constant list per dialog
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, open]);

  return { ref, open, close };
}

/** UTMs from the URL, and whether the visit is already attributed (UTM or a rep's ref code). */
export function attribution() {
  const utm: Record<string, string> = {};
  new URLSearchParams(location.search).forEach((v, k) => {
    if (k.startsWith("utm_") && v) utm[k] = v;
  });
  const ref = /(?:^|;\s*)es_ref=([A-Za-z0-9-]{3,24})/.test(document.cookie);
  return { utm, attributed: Object.keys(utm).length > 0 || ref };
}

export async function post(path: string, body: unknown): Promise<Record<string, unknown>> {
  const r = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const j = (await r.json().catch(() => ({}))) as Record<string, unknown>;
  if (!r.ok) throw new Error(typeof j.error === "string" ? j.error : "Something went wrong. Please try again.");
  return j;
}
