"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";

type Phase = "idle" | "submitting" | "done" | "error";
type Source = "hero" | "nav" | "contract" | "final" | "sheet" | "hash" | "other";

const STACKS: { value: string; label: string }[] = [
  { value: "", label: "Choose one" },
  { value: "netsuite", label: "NetSuite" },
  { value: "epicor-p21", label: "Epicor Prophet 21" },
  { value: "sap-b1", label: "SAP Business One" },
  { value: "spreadsheets", label: "Excel / spreadsheets" },
  { value: "other", label: "Something else" },
];

/** Which Request-access trigger was clicked, from where it sits in the page. */
function sourceOf(a: Element): Source {
  if (a.closest("[role=dialog]")) return "sheet";
  if (a.closest("header")) return "nav";
  if (a.closest("#top")) return "hero";
  if (a.closest("#company")) return "contract";
  return "final";
}

/**
 * The Request-access modal. Every `a[href="#request"]` on the page opens it in place
 * (the anchor still works without JS); `/#request` opens it on arrival. A real
 * <dialog>: Escape and the backdrop close it, focus is trapped and returned. While it
 * is open the hero loops pause via `data-modal-open` on <html>, so the blurred
 * backdrop is not re-composited over a moving field every frame.
 */
export default function RequestAccess() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const openedAt = useRef(0);
  const [source, setSource] = useState<Source>("other");
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [repeat, setRepeat] = useState(false);
  const [more, setMore] = useState(false);

  const open = useCallback((src: Source) => {
    const d = dialogRef.current;
    if (!d || d.open) return;
    setSource(src);
    setPhase("idle");
    setError(null);
    openedAt.current = performance.now();
    document.documentElement.dataset.modalOpen = "1";
    document.body.style.overflow = "hidden";
    d.showModal();
    requestAnimationFrame(() => firstFieldRef.current?.focus());
  }, []);

  const close = useCallback(() => {
    const d = dialogRef.current;
    if (d?.open) d.close();
  }, []);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    const onClose = () => {
      delete document.documentElement.dataset.modalOpen;
      document.body.style.overflow = "";
      if (location.hash === "#request") history.replaceState(null, "", location.pathname + location.search);
    };
    d.addEventListener("close", onClose);
    // every Request-access link opens the modal instead of jumping
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.('a[href="#request"]');
      if (!a) return;
      e.preventDefault();
      open(sourceOf(a));
    };
    document.addEventListener("click", onClick);
    const onHash = () => { if (location.hash === "#request") open("hash"); };
    onHash();
    window.addEventListener("hashchange", onHash);
    return () => {
      d.removeEventListener("close", onClose);
      document.removeEventListener("click", onClick);
      window.removeEventListener("hashchange", onHash);
    };
  }, [open]);

  const onBackdrop = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) close();
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (phase === "submitting") return;
    const form = e.currentTarget;
    const fd = new FormData(form);
    const params = new URLSearchParams(location.search);
    const utm: Record<string, string> = {};
    params.forEach((v, k) => { if (k.startsWith("utm_")) utm[k] = v; });
    setPhase("submitting");
    setError(null);
    try {
      const res = await fetch("/api/request-access", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          email: fd.get("email"),
          company: fd.get("company"),
          stack: fd.get("stack"),
          phone: fd.get("phone"),
          note: fd.get("note"),
          website: fd.get("website"),
          elapsed: Math.round(performance.now() - openedAt.current),
          source,
          referrer: document.referrer || undefined,
          utm: Object.keys(utm).length ? utm : undefined,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; repeat?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setPhase("error");
        return;
      }
      setRepeat(!!data.repeat);
      setPhase("done");
      form.reset();
      setMore(false);
    } catch {
      setError("We couldn't reach the server. Check your connection and try again.");
      setPhase("error");
    }
  };

  const busy = phase === "submitting";

  return (
    <dialog ref={dialogRef} className="es-modal" aria-labelledby="ra-title" onMouseDown={onBackdrop}>
      <div className="es-modal-panel">
        <button type="button" className="es-modal-x" onClick={close} aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
        </button>

        {phase === "done" ? (
          <div className="es-modal-done" role="status">
            <p className="es-modal-kicker">Request received</p>
            <h2 id="ra-title" className="es-modal-title">{repeat ? "You're already on the list." : "You're on the list."}</h2>
            <p className="es-modal-body">{repeat ? "We've noted the update and will be in touch." : "We're onboarding a small group of mid-market distributors as design partners. We'll be in touch."}</p>
            <button type="button" className="es-modal-submit" onClick={close}>Done</button>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate>
            <p className="es-modal-kicker">Design partner access</p>
            <h2 id="ra-title" className="es-modal-title">Request access</h2>
            <p className="es-modal-body">Tell us who you are and what you run. We&rsquo;ll reach out to set up a first conversation.</p>

            <div className="es-modal-grid">
              <label className="es-field">
                <span>Name</span>
                <input ref={firstFieldRef} name="name" type="text" autoComplete="name" required minLength={2} maxLength={120} disabled={busy} />
              </label>
              <label className="es-field">
                <span>Work email</span>
                <input name="email" type="email" autoComplete="email" inputMode="email" required maxLength={200} disabled={busy} />
              </label>
              <label className="es-field">
                <span>Company</span>
                <input name="company" type="text" autoComplete="organization" required minLength={2} maxLength={160} disabled={busy} />
              </label>
              <label className="es-field">
                <span>What you run today</span>
                <select name="stack" required defaultValue="" disabled={busy}>
                  {STACKS.map((s) => <option key={s.value} value={s.value} disabled={s.value === ""}>{s.label}</option>)}
                </select>
              </label>
            </div>

            {more ? (
              <div className="es-modal-grid">
                <label className="es-field">
                  <span>Phone <em>optional</em></span>
                  <input name="phone" type="tel" autoComplete="tel" inputMode="tel" maxLength={40} disabled={busy} />
                </label>
                <label className="es-field es-field--wide">
                  <span>What would you want it to take off your desk? <em>optional</em></span>
                  <textarea name="note" rows={3} maxLength={1000} disabled={busy} />
                </label>
              </div>
            ) : (
              <button type="button" className="es-modal-more" onClick={() => setMore(true)} disabled={busy}>Add a phone or a note</button>
            )}

            {/* honeypot: hidden from people, tempting to scripts */}
            <div className="es-modal-hp" aria-hidden="true">
              <label>Website<input name="website" type="text" tabIndex={-1} autoComplete="off" /></label>
            </div>

            {error ? <p className="es-modal-error" role="alert">{error}</p> : null}

            <div className="es-modal-actions">
              <button type="submit" className="es-modal-submit" disabled={busy} aria-busy={busy}>
                {busy ? <><span className="es-modal-dot" aria-hidden="true" />Sending</> : "Request access"}
              </button>
              <span className="es-modal-fine">We only use this to reach out about access.</span>
            </div>
          </form>
        )}
      </div>
    </dialog>
  );
}
