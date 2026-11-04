import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

/** Read side for the notifier (actions cannot touch the database directly). */
export const getRequest = internalQuery({
  args: { id: v.id("accessRequests") },
  handler: async (ctx, { id }) => ctx.db.get(id),
});

export const getDemo = internalQuery({
  args: { id: v.id("demoBookings") },
  handler: async (ctx, { id }) => ctx.db.get(id),
});

export const getFeedback = internalQuery({
  args: { id: v.id("feedback") },
  handler: async (ctx, { id }) => ctx.db.get(id),
});

export const markConfirmationSent = internalMutation({
  args: { id: v.id("accessRequests") },
  returns: v.null(),
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { confirmationSentAt: Date.now() });
    return null;
  },
});
