import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { isTestLead } from "./forms";

/** Every real claimer who has not had the launch email yet. */
export const pending = internalQuery({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("accessRequests")
      .withIndex("by_claimedAt", (q) => q.gt("claimedAt", 0))
      .take(5000);
    return rows
      .filter((r) => !r.test && !isTestLead(r.email, r.name) && !r.launchEmailSentAt)
      .map((r) => ({ id: r._id, name: r.name, email: r.email, refCode: r.refCode, planFit: r.planFit }));
  },
});

export const markSent = internalMutation({
  args: { id: v.id("accessRequests") },
  returns: v.null(),
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { launchEmailSentAt: Date.now() });
    return null;
  },
});
