"use node";

import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

type Claimer = { id: Id<"accessRequests">; name: string; email: string; refCode?: string; planFit?: string };
type Result = { recipients: number; sent: number; failed: number; sample: string[] };

/**
 * Launch day: email every prelaunch claimer "Your account is ready, start here." Run it
 * through scripts/launch-email.mjs (explicit --env=dev|prod; a dry run unless --send).
 * Each person gets it once (launchEmailSentAt); QA addresses never do.
 * Needs SIGNUP_URL, CLAIM_EMAIL_FROM and RESEND_API_KEY on this deployment.
 */
export const emailClaimers = internalAction({
  args: { send: v.boolean(), limit: v.optional(v.number()) },
  returns: v.object({ recipients: v.number(), sent: v.number(), failed: v.number(), sample: v.array(v.string()) }),
  handler: async (ctx, { send, limit }): Promise<Result> => {
    const signup = process.env.SIGNUP_URL;
    const from = process.env.CLAIM_EMAIL_FROM;
    const key = process.env.RESEND_API_KEY;
    if (send && (!signup || !from || !key)) {
      throw new Error("Set SIGNUP_URL, CLAIM_EMAIL_FROM and RESEND_API_KEY on this deployment first.");
    }
    const all: Claimer[] = await ctx.runQuery(internal.launchData.pending, {});
    const list: Claimer[] = all.slice(0, limit ?? all.length);
    let sent = 0;
    let failed = 0;
    if (send) {
      for (const r of list) {
        const url = new URL(signup!);
        url.searchParams.set("founding", "1");
        url.searchParams.set("email", r.email);
        if (r.refCode) url.searchParams.set("ref", r.refCode);
        const text = [
          `Hi ${r.name},`,
          "",
          "Your Everstock account is ready. Start here:",
          url.toString(),
          "",
          "Your founding pricing is already applied.",
          "",
          "Questions? Reply to this email and it comes straight to the founders.",
          "",
          "Everstock",
        ].join("\n");
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
          body: JSON.stringify({
            from,
            to: [r.email],
            reply_to: process.env.CLAIM_EMAIL_REPLY_TO || undefined,
            subject: "Your account is ready, start here",
            text,
          }),
        }).catch(() => null);
        if (res && res.ok) {
          await ctx.runMutation(internal.launchData.markSent, { id: r.id });
          sent++;
        } else failed++;
        await new Promise((ok) => setTimeout(ok, 250)); // stay well under Resend's rate limit
      }
    }
    return { recipients: list.length, sent, failed, sample: list.slice(0, 5).map((r) => r.email.replace(/^(.).*(@.*)$/, "$1…$2")) };
  },
});
