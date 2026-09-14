import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { ConvexError, v } from "convex/values";

export const STACKS = ["netsuite", "epicor-p21", "sap-b1", "spreadsheets", "other"] as const;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const clip = (s: string, n: number) => s.trim().slice(0, n);

/**
 * Record a request for access. Called from the Next.js route handler, which has
 * already done the bot checks (honeypot, minimum fill time) and attached the silent
 * context. Validation is repeated here because this is the boundary that matters.
 */
export const submit = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    company: v.string(),
    stack: v.string(),
    phone: v.optional(v.string()),
    note: v.optional(v.string()),
    source: v.optional(v.string()),
    referrer: v.optional(v.string()),
    utm: v.optional(v.record(v.string(), v.string())),
    userAgent: v.optional(v.string()),
  },
  returns: v.object({ id: v.id("accessRequests"), repeat: v.boolean() }),
  handler: async (ctx, args) => {
    const name = clip(args.name, 120);
    const email = clip(args.email, 200).toLowerCase();
    const company = clip(args.company, 160);
    const stack = STACKS.includes(args.stack as (typeof STACKS)[number]) ? args.stack : "other";
    if (name.length < 2) throw new ConvexError("Please add your name.");
    if (!EMAIL.test(email)) throw new ConvexError("That email address doesn't look right.");
    if (company.length < 2) throw new ConvexError("Please add your company.");
    const phone = args.phone ? clip(args.phone, 40) : undefined;
    const note = args.note ? clip(args.note, 1000) : undefined;
    const now = Date.now();

    const existing = await ctx.db
      .query("accessRequests")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name,
        company,
        stack,
        phone: phone ?? existing.phone,
        note: note ?? existing.note,
        source: args.source ?? existing.source,
        submissions: existing.submissions + 1,
        updatedAt: now,
      });
      return { id: existing._id, repeat: true };
    }

    const id = await ctx.db.insert("accessRequests", {
      name,
      email,
      company,
      stack,
      phone,
      note,
      source: args.source,
      referrer: args.referrer,
      utm: args.utm,
      userAgent: args.userAgent,
      submissions: 1,
      status: "new",
      createdAt: now,
      updatedAt: now,
    });
    // the ping is best-effort and never blocks the submission
    await ctx.scheduler.runAfter(0, internal.notify.newRequest, { id });
    return { id, repeat: false };
  },
});

/** Newest first, for a future protected /requests page. The dashboard covers today. */
export const list = query({
  args: { limit: v.optional(v.number()) },
  returns: v.array(
    v.object({
      _id: v.id("accessRequests"),
      _creationTime: v.number(),
      name: v.string(),
      email: v.string(),
      company: v.string(),
      stack: v.string(),
      phone: v.optional(v.string()),
      note: v.optional(v.string()),
      source: v.optional(v.string()),
      referrer: v.optional(v.string()),
      utm: v.optional(v.record(v.string(), v.string())),
      userAgent: v.optional(v.string()),
      submissions: v.number(),
      status: v.string(),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
  ),
  handler: async (ctx, { limit }) => {
    return await ctx.db
      .query("accessRequests")
      .withIndex("by_createdAt")
      .order("desc")
      .take(Math.min(limit ?? 100, 500));
  },
});
