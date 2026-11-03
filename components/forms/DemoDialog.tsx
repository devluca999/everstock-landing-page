"use client";

/**
 * "Book a demo" while BOOKING_URL is unset: the Cal.com booking questions as a short form,
 * plus best times. With BOOKING_URL set, lib/cta.ts openDemo opens Cal.com instead and this
 * dialog is never shown. Posts to /api/demo-request → Convex demoBookings → eBRAiN
 * demo_booked. Name and email are prefilled from a claim made earlier on this device.
 */
import { useState } from "react";
import { DEMO_ROLES, DEMO_TEAM, RUNS_ON } from "@/convex/forms";
import { HONEYPOT } from "@/lib/intake";
import { knownLead, openDemo, rememberLead } from "@/lib/cta";
import { attribution, post, useDialog } from "./useDialog";
import "./forms.css";

type Phase = "form" | "sending" | "sent";

export default function DemoDialog() {
  const [phase, setPhase] = useState<Phase>("form");
  const [error, setError] = useState("");
  const [team, setTeam] = useState("");
  const [lead, setLead] = useState<{ name?: string; email?: string }>({});
  const [meta, setMeta] = useState({ cta: "other", openedAt: 0 });
  const [first, setFirst] = useState("");

  const { ref, close } = useDialog("es:demo", ["#book-demo"], () => openDemo("link"), ({ cta }) => {
    setMeta({ cta: cta || "other", openedAt: performance.now() });
    setLead(knownLead());
    setError("");
    if (phase === "sent") setPhase("form");
  });

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const val = (k: string) => String(f.get(k) || "").trim();
    if (!team) {
      setError("Pick how many people handle buying.");
      return;
    }
    setPhase("sending");
    setError("");
    try {
      await post("/api/demo-request", {
        name: val("name"),
        email: val("email"),
        company: val("company"),
        role: val("role"),
        teamSize: team,
        runsOn: val("runsOn"),
        wants: val("wants"),
        phone: val("phone"),
        website: val("website"),
        bestTimes: val("bestTimes"),
        [HONEYPOT]: val(HONEYPOT),
        page: location.pathname,
        cta: meta.cta,
        referrer: document.referrer,
        utm: attribution().utm,
        elapsed: performance.now() - meta.openedAt,
      });
      rememberLead({ name: val("name"), email: val("email").toLowerCase() });
      setFirst(val("name").split(/\s+/)[0]);
      setTeam("");
      setPhase("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setPhase("form");
    }
  };

  return (
    <dialog ref={ref} className="es-f" aria-labelledby="demo-title" onClick={(e) => e.target === e.currentTarget && close()}>
      <div className="es-f-card">
        <div className="es-f-tape" aria-hidden="true">
          <span />
        </div>
        <div className="es-f-body">
          <div className="es-f-head">
            <div className="es-f-titles">
              <span className="es-f-label">30 minutes with the founders</span>
              <h3 id="demo-title">Book a demo</h3>
            </div>
            <button type="button" className="es-f-x" onClick={close} aria-label="Close">
              <span aria-hidden="true" />
              <span aria-hidden="true" />
            </button>
          </div>

          {phase === "sent" ? (
            <div className="es-f-sent" aria-live="polite">
              <div className="es-f-done">
                <p>Thanks{first ? `, ${first}` : ""}. Look for a calendar invite by email.</p>
                <span className="es-f-stamp">Sent</span>
              </div>
              <div className="es-f-row">
                <button type="button" className="es-f-primary" onClick={close} autoFocus>
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form className="es-f-form" onSubmit={submit} key={lead.email || "blank"}>
              <div className="es-f-line">
                <label htmlFor="dm-name">Name</label>
                <input id="dm-name" name="name" type="text" required autoComplete="name" defaultValue={lead.name} autoFocus />
              </div>
              <div className="es-f-line">
                <label htmlFor="dm-email">Work email</label>
                <input id="dm-email" name="email" type="email" required autoComplete="email" placeholder="you@company.com" defaultValue={lead.email} />
              </div>
              <div className="es-f-line">
                <label htmlFor="dm-company">Company</label>
                <input id="dm-company" name="company" type="text" required autoComplete="organization" />
              </div>
              <div className="es-f-line">
                <label htmlFor="dm-role">Role</label>
                <select id="dm-role" name="role" required defaultValue="">
                  <option value="" disabled>
                    Choose one
                  </option>
                  {Object.entries(DEMO_ROLES).map(([k, l]) => (
                    <option key={k} value={k}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
              <fieldset className="es-f-group">
                <legend className="es-f-label">How many people handle buying?</legend>
                <div className="es-f-chips" role="radiogroup">
                  {Object.entries(DEMO_TEAM).map(([k, l]) => (
                    <button key={k} type="button" role="radio" aria-checked={team === k} className="es-f-chip" onClick={() => setTeam(k)}>
                      {l}
                    </button>
                  ))}
                </div>
              </fieldset>
              <div className="es-f-line">
                <label htmlFor="dm-runs">What do you run on?</label>
                <select id="dm-runs" name="runsOn" required defaultValue="">
                  <option value="" disabled>
                    Choose one
                  </option>
                  {Object.entries(RUNS_ON).map(([k, l]) => (
                    <option key={k} value={k}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
              <div className="es-f-area">
                <label htmlFor="dm-wants">
                  What would you want off your team&apos;s desk? <span className="es-f-opt">optional</span>
                </label>
                <textarea id="dm-wants" name="wants" rows={3} maxLength={1000} placeholder="Chasing suppliers, matching invoices, reordering…" />
              </div>
              <div className="es-f-line">
                <label htmlFor="dm-times">
                  Best times <span className="es-f-opt">optional</span>
                </label>
                <input id="dm-times" name="bestTimes" type="text" maxLength={300} placeholder="Tue or Wed afternoon, Central" />
              </div>
              <div className="es-f-line">
                <label htmlFor="dm-phone">
                  Phone <span className="es-f-opt">optional</span>
                </label>
                <input id="dm-phone" name="phone" type="tel" autoComplete="tel" />
              </div>
              <div className="es-f-line">
                <label htmlFor="dm-website">
                  Website <span className="es-f-opt">optional</span>
                </label>
                <input id="dm-website" name="website" type="text" inputMode="url" autoComplete="url" placeholder="yourcompany.com" />
              </div>
              <input className="es-f-hp" name={HONEYPOT} type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" />
              {error ? (
                <p className="es-f-error" role="alert">
                  {error}
                </p>
              ) : null}
              <div className="es-f-foot">
                <p className="es-f-small">We&apos;ll email you a time.</p>
                <button type="submit" className="es-f-primary" disabled={phase === "sending"}>
                  {phase === "sending" ? "Sending…" : "Book a demo"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </dialog>
  );
}
