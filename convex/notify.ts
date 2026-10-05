"use node";

import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { stackLabel } from "./stacks";

/**
 * Best-effort ping when a new request lands. Two optional channels, both read from the
 * Convex deployment's environment (Dashboard → Settings → Environment Variables):
 *   SLACK_WEBHOOK_URL   an incoming-webhook URL for the channel that should hear about it
 *   NOTIFY_EMAIL_TO     an inbox, sent through Resend if RESEND_API_KEY is also set
 * With neither set this is a no-op; the row is still in the table.
 */
/* Both pings go to the same two channels. */
async function send(subject: string, lines: string[]) {
  const slack = process.env.SLACK_WEBHOOK_URL;
  if (slack) {
    await fetch(slack, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: `${subject}\n${lines.join("\n")}` }),
    }).catch(() => {});
  }

  const to = process.env.NOTIFY_EMAIL_TO;
  const key = process.env.RESEND_API_KEY;
  if (to && key) {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({
        from: process.env.NOTIFY_EMAIL_FROM ?? "Everstock <onboarding@resend.dev>",
        to: [to],
        subject,
        text: lines.join("\n"),
      }),
    }).catch(() => {});
  }
}

export const newRequest = internalAction({
  args: { id: v.id("accessRequests") },
  returns: v.null(),
  handler: async (ctx, { id }) => {
    const r = await ctx.runQuery(internal.notifyData.get, { id });
    if (!r) return null;
    const lines = [
      `${r.name} · ${r.company}`,
      r.email,
      r.workEmail ? `Work: ${r.workEmail}` : null,
      `Uses: ${stackLabel(r.stack)}`,
      r.heardFrom ? `Heard about us: ${r.heardFrom}` : null,
      r.phone ? `Phone: ${r.phone}` : null,
      r.note ? `Note: ${r.note}` : null,
      r.source ? `From: ${r.source}${r.referrer ? ` · ref ${r.referrer}` : ""}` : null,
    ].filter(Boolean) as string[];

    await send(`Access request: ${r.name} at ${r.company}`, lines);
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
    const lines = [f.message, "", f.email ? `Reply to: ${f.email}` : "No reply address", f.page ? `Page: ${f.page}` : null].filter(
      (l) => l !== null
    ) as string[];
    await send(`${kind} from the site`, lines);
    return null;
  },
});
