"use node";

import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

/**
 * Best-effort ping when a new request lands. Two optional channels, both read from the
 * Convex deployment's environment (Dashboard → Settings → Environment Variables):
 *   SLACK_WEBHOOK_URL   an incoming-webhook URL for the channel that should hear about it
 *   NOTIFY_EMAIL_TO     an inbox, sent through Resend if RESEND_API_KEY is also set
 * With neither set this is a no-op; the row is still in the table.
 */
export const newRequest = internalAction({
  args: { id: v.id("accessRequests") },
  returns: v.null(),
  handler: async (ctx, { id }) => {
    const r = await ctx.runQuery(internal.notifyData.get, { id });
    if (!r) return null;
    const stack: Record<string, string> = { netsuite: "NetSuite", "epicor-p21": "Epicor Prophet 21", "sap-b1": "SAP Business One", spreadsheets: "Excel / spreadsheets", other: "Other" };
    const lines = [
      `${r.name} · ${r.company}`,
      r.email,
      `Runs: ${stack[r.stack] ?? r.stack}`,
      r.phone ? `Phone: ${r.phone}` : null,
      r.note ? `Note: ${r.note}` : null,
      r.source ? `From: ${r.source}${r.referrer ? ` · ref ${r.referrer}` : ""}` : null,
    ].filter(Boolean) as string[];

    const slack = process.env.SLACK_WEBHOOK_URL;
    if (slack) {
      await fetch(slack, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: `New access request\n${lines.join("\n")}` }),
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
          subject: `Access request: ${r.name} at ${r.company}`,
          text: lines.join("\n"),
        }),
      }).catch(() => {});
    }
    return null;
  },
});
