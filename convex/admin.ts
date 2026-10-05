import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

/** Housekeeping from the CLI: `npx convex run admin:removeByEmail '{"email":"x@y.z"}'`. */
export const removeByEmail = internalMutation({
  args: { email: v.string() },
  returns: v.number(),
  handler: async (ctx, { email }) => {
    const rows = await ctx.db
      .query("accessRequests")
      .withIndex("by_email", (q) => q.eq("email", email.trim().toLowerCase()))
      .collect();
    for (const r of rows) await ctx.db.delete(r._id);
    return rows.length;
  },
});

/** Housekeeping for QA feedback: `npx convex run admin:removeFeedback '{"contains":"qa-"}'`
    deletes every feedback row whose message contains the text. */
export const removeFeedback = internalMutation({
  args: { contains: v.string() },
  returns: v.number(),
  handler: async (ctx, { contains }) => {
    if (contains.trim().length < 3) return 0;
    const rows = (await ctx.db.query("feedback").collect()).filter((r) => r.message.includes(contains));
    for (const r of rows) await ctx.db.delete(r._id);
    return rows.length;
  },
});
