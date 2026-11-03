"use client";

/**
 * "Claim your spot" (founding pricing). Mounted once in the root layout; every primary CTA
 * opens it through lib/cta.ts openClaim (the `es:claim` event), and so does arriving on
 * #claim (or an older #waitlist / #access / #request link).
 *
 * Posts to /api/request-access (kind "claim") → Convex accessRequests → eBRAiN spot_claim.
 * The success screen offers an optional set-up step whose answers go to
 * /api/request-access/setup → a spot_claim_update on the same claim.
 */
import { useState } from "react";
import { CHANNELS, CLAIM_TEAM, HEADACHES, USES_TODAY } from "@/convex/forms";
import { HONEYPOT } from "@/lib/intake";
import { CLAIM_HASHES, currentSeats, loadSeats, openClaim, openDemo, rememberLead, seatsLine } from "@/lib/cta";
import { attribution, post, useDialog } from "./useDialog";
import "./forms.css";

const HEARD = ["Search engine", "LinkedIn", "A colleague or friend", "An event", "An article or newsletter", "Something else"];

const FIT: Record<string, string> = {
  Stockbot: "stockbot fits a team of one: text it your paperwork and it catches what you'd miss.",
  Base: "Base fits a team of 2 to 5: Everstock reads your inbox, so paperwork sorts itself.",
  "Base or Scale": "Base or Scale fits a team of 6 to 20. We'll help you pick when your account is ready.",
  "Book a demo": "With a team your size, a 30 minute demo with the founders is the quickest way in.",
};

type Phase = "form" | "sending" | "sent";
type Claim = { id: string; submission: number; email: string; name: string; planFit: string | null };

export default function ClaimDialog() {
  const [phase, setPhase] = useState<Phase>("form");
  const [error, setError] = useState("");
  const [team, setTeam] = useState("");
  const [channels, setChannels] = useState<string[]>([]);
  const [phone, setPhone] = useState("");
  const [askHeard, setAskHeard] = useState(false);
  const [claim, setClaim] = useState<Claim | null>(null);
  const [setup, setSetup] = useState<{ headache: string; usesToday: string; state: "idle" | "sending" | "done" }>({ headache: "", usesToday: "", state: "idle" });
  const [seatText, setSeatText] = useState(() => seatsLine(currentSeats()));
  const [meta, setMeta] = useState({ cta: "other", openedAt: 0 });

  const { ref, close } = useDialog("es:claim", CLAIM_HASHES, () => openClaim("link"), ({ cta }) => {
    setMeta({ cta: cta || "other", openedAt: performance.now() });
    setAskHeard(!attribution().attributed);
    setError("");
    if (phase !== "sending") setPhase(claim ? "sent" : "form");
    loadSeats().then((s) => setSeatText(seatsLine(s)));
  });

  const toggle = (c: string) => setChannels((cs) => (cs.includes(c) ? cs.filter((x) => x !== c) : [...cs, c]));

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const val = (k: string) => String(f.get(k) || "").trim();
    if (!team) {
      setError("Pick how many people handle buying and stock.");
      return;
    }
    setPhase("sending");
    setError("");
    try {
      const j = await post("/api/request-access", {
        kind: "claim",
        name: val("name"),
        email: val("email"),
        sells: val("sells"),
        teamSize: team,
        channels,
        website: val("website"),
        phone: val("phone"),
        smsConsent: f.get("smsConsent") === "on",
        heardFrom: askHeard ? val("heardFrom") : "",
        [HONEYPOT]: val(HONEYPOT),
        page: location.pathname,
        cta: meta.cta,
        referrer: document.referrer,
        utm: attribution().utm,
        elapsed: performance.now() - meta.openedAt,
      });
      const c = j.claim as { id: string; submission: number } | undefined;
      const name = val("name");
      const email = val("email").toLowerCase();
      rememberLead({ name, email });
      setClaim({ id: c?.id ?? "", submission: c?.submission ?? 0, email, name, planFit: (j.planFit as string) ?? null });
      setPhase("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setPhase("form");
    }
  };

  const saveSetup = async () => {
    if (!claim || (!setup.headache && !setup.usesToday)) return;
    setSetup((s) => ({ ...s, state: "sending" }));
    try {
      if (claim.id) {
        await post("/api/request-access/setup", { id: claim.id, submission: claim.submission, email: claim.email, headache: setup.headache, usesToday: setup.usesToday });
      }
      setSetup((s) => ({ ...s, state: "done" }));
    } catch {
      setSetup((s) => ({ ...s, state: "idle" }));
      setError("That didn't save. Please try again.");
    }
  };

  const reset = () => {
    setClaim(null);
    setTeam("");
    setChannels([]);
    setPhone("");
    setSetup({ headache: "", usesToday: "", state: "idle" });
    setPhase("form");
  };

  return (
    <dialog ref={ref} className="es-f" aria-labelledby="claim-title" onClick={(e) => e.target === e.currentTarget && close()}>
      <div className="es-f-card">
        <div className="es-f-tape" aria-hidden="true">
          <span />
        </div>
        <div className="es-f-body">
          <div className="es-f-head">
            <div className="es-f-titles">
              <span className="es-f-label">Founding pricing · {seatText}</span>
              <h3 id="claim-title">{phase === "sent" ? "You're in." : "Claim your spot"}</h3>
            </div>
            <button type="button" className="es-f-x" onClick={close} aria-label="Close">
              <span aria-hidden="true" />
              <span aria-hidden="true" />
            </button>
          </div>

          {phase === "sent" && claim ? (
            <div className="es-f-sent" aria-live="polite">
              <div className="es-f-done">
                <p>Founding pricing is locked for you. We&apos;ll email you when your account is ready.</p>
                <span className="es-f-stamp">Claimed</span>
              </div>
              {claim.planFit && FIT[claim.planFit] ? <p className="es-f-fit">{FIT[claim.planFit]}</p> : null}
              {claim.planFit === "Book a demo" ? (
                <div>
                  <button
                    type="button"
                    className="es-f-primary"
                    onClick={() => {
                      close();
                      openDemo("claim-success");
                    }}
                  >
                    Book a demo
                  </button>
                </div>
              ) : null}

              {setup.state === "done" ? (
                <p className="es-f-note">Thanks, that helps us set you up.</p>
              ) : (
                <div className="es-f-setup">
                  <p className="es-f-setup-title">
                    Help us set you up <span>(30 seconds)</span>
                  </p>
                  <fieldset className="es-f-group">
                    <legend className="es-f-label">Biggest headache</legend>
                    <div className="es-f-chips">
                      {Object.entries(HEADACHES).map(([k, l]) => (
                        <button key={k} type="button" className="es-f-chip" aria-pressed={setup.headache === k} onClick={() => setSetup((s) => ({ ...s, headache: s.headache === k ? "" : k }))}>
                          {l}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                  <fieldset className="es-f-group">
                    <legend className="es-f-label">What you use today</legend>
                    <div className="es-f-chips">
                      {Object.entries(USES_TODAY).map(([k, l]) => (
                        <button key={k} type="button" className="es-f-chip" aria-pressed={setup.usesToday === k} onClick={() => setSetup((s) => ({ ...s, usesToday: s.usesToday === k ? "" : k }))}>
                          {l}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                  {error ? (
                    <p className="es-f-error" role="alert">
                      {error}
                    </p>
                  ) : null}
                  <div className="es-f-row">
                    <button type="button" className="es-f-primary" disabled={(!setup.headache && !setup.usesToday) || setup.state === "sending"} onClick={saveSetup}>
                      {setup.state === "sending" ? "Saving…" : "Save"}
                    </button>
                    <button type="button" className="es-f-quiet" onClick={close}>
                      Skip
                    </button>
                  </div>
                </div>
              )}
              {setup.state === "done" ? (
                <div className="es-f-row">
                  <button type="button" className="es-f-primary" onClick={close} autoFocus>
                    Done
                  </button>
                  <button type="button" className="es-f-link" onClick={reset}>
                    Claim a spot for someone else
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <form className="es-f-form" onSubmit={submit} noValidate={false}>
              <div className="es-f-line">
                <label htmlFor="cl-name">First name</label>
                <input id="cl-name" name="name" type="text" required autoComplete="given-name" autoFocus />
              </div>
              <div className="es-f-line">
                <label htmlFor="cl-email">Work email</label>
                <input id="cl-email" name="email" type="email" required autoComplete="email" placeholder="you@company.com" />
              </div>
              <div className="es-f-line">
                <label htmlFor="cl-sells">What do you sell?</label>
                <input id="cl-sells" name="sells" type="text" required maxLength={300} placeholder="Brake parts, candles, cables…" />
              </div>
              <fieldset className="es-f-group">
                <legend className="es-f-label">How many people handle buying and stock?</legend>
                <div className="es-f-chips" role="radiogroup">
                  {Object.entries(CLAIM_TEAM).map(([k, l]) => (
                    <button key={k} type="button" role="radio" aria-checked={team === k} className="es-f-chip" onClick={() => setTeam(k)}>
                      {l}
                    </button>
                  ))}
                </div>
              </fieldset>
              <fieldset className="es-f-group">
                <legend className="es-f-label">
                  Where do you sell? <span className="es-f-opt">optional</span>
                </legend>
                <div className="es-f-chips">
                  {Object.entries(CHANNELS).map(([k, l]) => (
                    <button key={k} type="button" className="es-f-chip" aria-pressed={channels.includes(k)} onClick={() => toggle(k)}>
                      {l}
                    </button>
                  ))}
                </div>
              </fieldset>
              <div className="es-f-line">
                <label htmlFor="cl-website">
                  Website <span className="es-f-opt">optional</span>
                </label>
                <input id="cl-website" name="website" type="text" inputMode="url" autoComplete="url" placeholder="yourstore.com" />
              </div>
              <div className="es-f-line">
                <label htmlFor="cl-phone">
                  Mobile <span className="es-f-opt">optional</span>
                </label>
                <input id="cl-phone" name="phone" type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              {phone.trim() ? (
                <label className="es-f-check">
                  <input type="checkbox" name="smsConsent" />
                  <span>OK to text me about my Everstock setup</span>
                </label>
              ) : null}
              {askHeard ? (
                <div className="es-f-line">
                  <label htmlFor="cl-heard">
                    How did you hear about us? <span className="es-f-opt">optional</span>
                  </label>
                  <select id="cl-heard" name="heardFrom" defaultValue="">
                    <option value="">Choose one</option>
                    {HEARD.map((h) => (
                      <option key={h}>{h}</option>
                    ))}
                  </select>
                </div>
              ) : null}
              <input className="es-f-hp" name={HONEYPOT} type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" />
              {error ? (
                <p className="es-f-error" role="alert">
                  {error}
                </p>
              ) : null}
              <div className="es-f-foot">
                <p className="es-f-small">Email only. No card needed.</p>
                <button type="submit" className="es-f-primary" disabled={phase === "sending"}>
                  {phase === "sending" ? "Claiming…" : "Claim your spot"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </dialog>
  );
}
