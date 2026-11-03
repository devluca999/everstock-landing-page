"use node";

import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { CHANNELS, CLAIM_TEAM, DEMO_ROLES, DEMO_TEAM, RUNS_ON, label } from "./forms";
import { mailer } from "./mail";
import { fitLine } from "./emailTemplates";

/**
 * Best-effort pings and emails. Everything is read from this Convex deployment's
 * environment (Dashboard → Settings → Environment Variables); a channel that is not set is
 * skipped and the row is still in the table. Email goes through SendPulse (convex/mail.ts).
 *   SLACK_WEBHOOK_URL      team ping: every claim, Stock Plan request, demo booking, feedback
 *   NOTIFY_EMAIL_TO        team ping by email
 *   SENDPULSE_API_ID       SendPulse API credentials (Settings → API)
 *   SENDPULSE_API_SECRET
 *   CLAIM_EMAIL_FROM       sender for every email, e.g. "Everstock <hello@tryeverstock.com>",
 *                          an address verified in SendPulse. Unset: no email is sent.
 *   BOOKING_URL            optional; the confirmation email links to it for 20+ teams
 */

/* The team ping: Slack and/or an inbox. */
async function ping(subject: string, lines: (string | number | null | undefined | false)[]) {
  const text = lines.filter(Boolean).join("\n");
  const slack = process.env.SLACK_WEBHOOK_URL;
  if (slack) {
    await fetch(slack, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: `${subject}\n${text}` }),
    }).catch(() => {});
  }
  const to = process.env.NOTIFY_EMAIL_TO;
  if (to) {
    const m = await mailer();
    if (m) await m.send({ to, subject, text });
  }
}

const attribution = (r: { page?: string; cta?: string; refCode?: string; utm?: Record<string, string>; referrer?: string }) =>
  [
    r.refCode && `Ref code: ${r.refCode}`,
    r.utm && Object.keys(r.utm).length && `UTM: ${Object.entries(r.utm).map(([k, v]) => `${k}=${v}`).join(" ")}`,
    (r.page || r.cta) && `From: ${[r.page, r.cta].filter(Boolean).join(" · ")}`,
    r.referrer && `Referrer: ${r.referrer}`,
  ];

export const claim = internalAction({
  args: { id: v.id("accessRequests"), repeat: v.boolean(), kind: v.string() },
  returns: v.null(),
  handler: async (ctx, { id, repeat, kind }) => {
    const r = await ctx.runQuery(internal.notifyData.getRequest, { id });
    if (!r) return null;
    const what = kind === "stock-plan" ? "Stock Plan request" : "Spot claimed";
    await ping(`${what}${repeat ? " (again)" : ""}: ${r.name}${r.test ? " [QA]" : ""}`, [
      r.email,
      r.sells && `Sells: ${r.sells}`,
      r.teamSize && `Team: ${label(CLAIM_TEAM, r.teamSize)} → ${r.planFit}`,
      r.channels?.length && `Sells on: ${r.channels.map((c: string) => label(CHANNELS, c)).join(", ")}`,
      r.website && `Website: ${r.website}`,
      r.phone && `Phone: ${r.phone}${r.smsConsent ? " (OK to text)" : " (no texts)"}`,
      r.heardFrom && `Heard about us: ${r.heardFrom}`,
      r.note && `Note: ${r.note}`,
      ...attribution(r),
    ]);
    return null;
  },
});

export const demo = internalAction({
  args: { id: v.id("demoBookings") },
  returns: v.null(),
  handler: async (ctx, { id }) => {
    const d = await ctx.runQuery(internal.notifyData.getDemo, { id });
    if (!d) return null;
    const status = d.trigger === "BOOKING_CANCELLED" ? "Demo cancelled" : d.trigger === "BOOKING_RESCHEDULED" ? "Demo rescheduled" : d.via === "cal" ? "Demo booked" : "Demo requested";
    const when = d.startAt ? new Date(d.startAt).toLocaleString("en-US", { timeZone: "America/Chicago", dateStyle: "medium", timeStyle: "short" }) + " (Chicago)" : null;
    await ping(`${status}: ${d.name}${d.company ? ` at ${d.company}` : ""}${d.test ? " [QA]" : ""}`, [
      d.email,
      when && `When: ${when}`,
      d.bestTimes && `Best times: ${d.bestTimes}`,
      d.role && `Role: ${label(DEMO_ROLES, d.role)}`,
      d.teamSize && `Buying team: ${label(DEMO_TEAM, d.teamSize)}`,
      d.runsOn && `Runs on: ${label(RUNS_ON, d.runsOn)}`,
      d.wants && `Off their desk: ${d.wants}`,
      d.phone && `Phone: ${d.phone}`,
      d.website && `Website: ${d.website}`,
      ...attribution(d),
    ]);
    return null;
  },
});

/** The claimer's confirmation. Sent once per email, never to QA addresses. */
export const claimConfirmation = internalAction({
  args: { id: v.id("accessRequests") },
  returns: v.null(),
  handler: async (ctx, { id }) => {
    const r = await ctx.runQuery(internal.notifyData.getRequest, { id });
    if (!process.env.CLAIM_EMAIL_FROM || !r || r.test || r.confirmationSentAt) return null;
    const m = await mailer();
    if (!m) return null;
    const ok =
      r.planFit === "Book a demo"
        ? await m.sendEmail("claimConfirmationDemo", r.email, { first_name: r.name, demo_url: process.env.BOOKING_URL || "https://tryeverstock.com/#book-demo" })
        : await m.sendEmail("claimConfirmation", r.email, { first_name: r.name, fit_line: fitLine(r.planFit) });
    if (ok) await ctx.runMutation(internal.notifyData.markConfirmationSent, { id });
    return null;
  },
});

const KIND_LABEL: Record<string, string> = { feedback: "Feedback", suggestion: "Suggestion", bug: "Something's broken" };

export const newFeedback = internalAction({
  args: { id: v.id("feedback") },
  returns: v.null(),
  handler: async (ctx, { id }) => {
    const f = await ctx.runQuery(internal.notifyData.getFeedback, { id });
    if (!f) return null;
    const kind = KIND_LABEL[f.kind] ?? f.kind;
    await ping(`${kind} from the site`, [f.message, "", f.email ? `Reply to: ${f.email}` : "No reply address", f.page && `Page: ${f.page}`]);
    return null;
  },
});
