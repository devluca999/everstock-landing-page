import { mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { ConvexError, v } from "convex/values";

export const KINDS = ["feedback", "suggestion", "bug"] as const;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const clip = (s: string, n: number) => s.trim().slice(0, n);

/**
 * Site feedback (the footer's "Send feedback"). Called from the Next.js route handler,
 * which has already done the bot checks; validation is repeated here because this is
 * the boundary that matters. Kept apart from accessRequests: that table is the list you
 * reach out from, this one is what visitors told you.
 */
export const submit = mutation({
  args: {
    kind: v.string(),
    message: v.string(),
    email: v.optional(v.string()),
    page: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  returns: v.id("feedback"),
  handler: async (ctx, args) => {
    const kind = KINDS.includes(args.kind as (typeof KINDS)[number]) ? args.kind : "feedback";
    const message = clip(args.message, 4000);
    if (message.length < 3) throw new ConvexError("Add a few words first.");
    const email = args.email ? clip(args.email, 200).toLowerCase() : undefined;
    if (email && !EMAIL.test(email)) throw new ConvexError("That email address doesn't look right.");
    const id = await ctx.db.insert("feedback", {
      kind,
      message,
      email,
      page: args.page ? clip(args.page, 200) : undefined,
      userAgent: args.userAgent,
      status: "new",
      createdAt: Date.now(),
    });
    // best-effort, never blocks the submission
    await ctx.scheduler.runAfter(0, internal.notify.newFeedback, { id });
    return id;
  },
});
