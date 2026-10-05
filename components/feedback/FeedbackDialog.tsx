"use client";

/**
 * "Send feedback": a native <dialog> mounted once in the root layout, so it works on every
 * page. Any link to #feedback opens it (the footers get one as a port patch), and so
 * does arriving at /#feedback or /pricing#feedback. Styled after the access modal
 * (eggshell card, mono labels). Posts to /api/feedback → Convex `feedback`.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import "./feedback.css";

const KINDS = [
  { value: "feedback", label: "Feedback" },
  { value: "suggestion", label: "Suggestion" },
  { value: "bug", label: "Something's broken" },
] as const;

type Phase = "form" | "sending" | "sent";

export default function FeedbackDialog() {
  const ref = useRef<HTMLDialogElement>(null);
  const openedAt = useRef(0);
  const returnTo = useRef<Element | null>(null);
  const [phase, setPhase] = useState<Phase>("form");
  const [error, setError] = useState("");
  const [kind, setKind] = useState<string>("feedback");

  const open = useCallback(() => {
    const d = ref.current;
    if (!d || d.open) return;
    returnTo.current = document.activeElement;
    setPhase("form");
    setError("");
    openedAt.current = performance.now();
    d.showModal();
    document.documentElement.style.overflow = "hidden";
    document.documentElement.setAttribute("data-modal-open", "");
  }, []);

  const close = useCallback(() => ref.current?.close(), []);

  useEffect(() => {
    const d = ref.current;
    // links to #feedback open the dialog instead of jumping (capture: before the page's
    // own handlers, which only know their own anchors)
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a[href$="#feedback"]');
      if (!a) return;
      e.preventDefault();
      open();
    };
    const onHash = () => {
      if (location.hash === "#feedback") open();
    };
    const onClose = () => {
      document.documentElement.style.overflow = "";
      document.documentElement.removeAttribute("data-modal-open");
      if (location.hash === "#feedback") history.replaceState(null, "", location.pathname + location.search);
      const r = returnTo.current as HTMLElement | null;
      if (r && r.focus) r.focus();
    };
    document.addEventListener("click", onClick, true);
    window.addEventListener("hashchange", onHash);
    d?.addEventListener("close", onClose);
    onHash();
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("hashchange", onHash);
      d?.removeEventListener("close", onClose);
    };
  }, [open]);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget; // React clears currentTarget after the await
    const f = new FormData(form);
    setPhase("sending");
    setError("");
    try {
      const r = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          message: String(f.get("message") || ""),
          email: String(f.get("email") || ""),
          website: String(f.get("website") || ""),
          page: location.pathname,
          elapsed: performance.now() - openedAt.current,
        }),
      });
      const j = (await r.json().catch(() => ({}))) as { error?: string };
      if (!r.ok) throw new Error(j.error || "Something went wrong. Please try again.");
      setPhase("sent");
      form.reset();
      setKind("feedback");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setPhase("form");
    }
  };

  return (
    <dialog
      ref={ref}
      className="es-fb"
      aria-labelledby="fb-title"
      // a click on the backdrop lands on the dialog element itself
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="es-fb-card">
        <div className="es-fb-head">
          <div className="es-fb-titles">
            <span className="es-fb-label">Help us build it right</span>
            <h3 id="fb-title">Send feedback</h3>
          </div>
          <button type="button" className="es-fb-quiet" onClick={close}>
            Close
          </button>
        </div>

        {phase === "sent" ? (
          <div className="es-fb-sent" aria-live="polite">
            <p>Thanks, it&apos;s with the team now.</p>
            <div>
              <button type="button" className="es-fb-primary" onClick={close} autoFocus>
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="es-fb-form">
            <fieldset className="es-fb-kinds">
              <legend className="es-fb-label">What&apos;s this about?</legend>
              <div>
                {KINDS.map((k) => (
                  <label key={k.value} className="es-fb-chip" data-on={kind === k.value || undefined}>
                    <input
                      type="radio"
                      name="kind"
                      value={k.value}
                      checked={kind === k.value}
                      onChange={() => setKind(k.value)}
                    />
                    {k.label}
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="es-fb-field">
              <span className="es-fb-label">
                {kind === "bug" ? "What happened?" : kind === "suggestion" ? "What should we add or change?" : "What's on your mind?"}
              </span>
              <textarea name="message" required minLength={3} maxLength={4000} rows={5} autoFocus />
            </label>
            <label className="es-fb-field">
              <span className="es-fb-label">
                Email<span className="es-fb-opt"> · optional, if you&apos;d like a reply</span>
              </span>
              <input name="email" type="email" autoComplete="email" placeholder="you@example.com" />
            </label>
            <input className="es-fb-hp" name="website" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" />
            {error ? (
              <p className="es-fb-error" role="alert">
                {error}
              </p>
            ) : null}
            <button type="submit" className="es-fb-primary es-fb-submit" disabled={phase === "sending"}>
              {phase === "sending" ? "Sending…" : "Send feedback"}
            </button>
          </form>
        )}
      </div>
    </dialog>
  );
}
