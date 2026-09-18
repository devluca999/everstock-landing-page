import { internalQuery } from "./_generated/server";
import { v } from "convex/values";

/** Read side for the notifier (actions cannot touch the database directly). */
export const get = internalQuery({
  args: { id: v.id("accessRequests") },
  returns: v.union(
    v.null(),
    v.object({
      name: v.string(),
      email: v.string(),
      company: v.string(),
      stack: v.string(),
      phone: v.optional(v.string()),
      note: v.optional(v.string()),
      source: v.optional(v.string()),
      referrer: v.optional(v.string()),
    })
  ),
  handler: async (ctx, { id }) => {
    const r = await ctx.db.get(id);
    if (!r) return null;
    const { name, email, company, stack, phone, note, source, referrer } = r;
    return { name, email, company, stack, phone, note, source, referrer };
  },
});

/** The whole row, for the brain mirror (it records status, counts and timestamps too). */
export const getRow = internalQuery({
  args: { id: v.id("accessRequests") },
  handler: async (ctx, { id }) => ctx.db.get(id),
});
