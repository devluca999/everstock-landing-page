import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { ConvexError, v } from "convex/values";
import { STACKS } from "./stacks";

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
    workEmail: v.optional(v.string()),
    heardFrom: v.optional(v.string()),
    waitlist: v.optional(v.boolean()),
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
    const workEmail = args.workEmail ? clip(args.workEmail, 200).toLowerCase() : undefined;
    if (workEmail && !EMAIL.test(workEmail)) throw new ConvexError("That work email doesn't look right.");
    const heardFrom = args.heardFrom ? clip(args.heardFrom, 120) : undefined;
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
        workEmail: workEmail ?? existing.workEmail,
        heardFrom: heardFrom ?? existing.heardFrom,
        waitlist: args.waitlist ?? existing.waitlist,
        source: args.source ?? existing.source,
        submissions: existing.submissions + 1,
        updatedAt: now,
      });
      // refresh the brain page with the latest submission
      await ctx.scheduler.runAfter(0, internal.brain.syncRequest, { id: existing._id });
      return { id: existing._id, repeat: true };
    }

    const id = await ctx.db.insert("accessRequests", {
      name,
      email,
      company,
      stack,
      phone,
      note,
      workEmail,
      heardFrom,
      waitlist: args.waitlist,
      source: args.source,
      referrer: args.referrer,
      utm: args.utm,
      userAgent: args.userAgent,
      submissions: 1,
      status: "new",
      createdAt: now,
      updatedAt: now,
    });
    // the ping and the brain mirror are best-effort and never block the submission
    await ctx.scheduler.runAfter(0, internal.notify.newRequest, { id });
    await ctx.scheduler.runAfter(0, internal.brain.syncRequest, { id });
    return { id, repeat: false };
  },
});

/**
 * The questions asked after a form is sent (Book a demo: "the waitlist too?"; both:
 * "the founding partner program?"). Only ever patches the row the form just created, so
 * an answer for an unknown email is dropped and `submissions` stays a count of forms.
 */
export const answer = mutation({
  args: {
    email: v.string(),
    waitlist: v.optional(v.boolean()),
    foundingInterest: v.optional(v.boolean()),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const email = clip(args.email, 200).toLowerCase();
    const row = await ctx.db
      .query("accessRequests")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (!row) return false;
    const patch: { waitlist?: boolean; foundingInterest?: boolean; updatedAt: number } = { updatedAt: Date.now() };
    if (args.waitlist !== undefined) patch.waitlist = args.waitlist;
    if (args.foundingInterest !== undefined) patch.foundingInterest = args.foundingInterest;
    await ctx.db.patch(row._id, patch);
    await ctx.scheduler.runAfter(0, internal.brain.syncRequest, { id: row._id });
    return true;
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
      workEmail: v.optional(v.string()),
      heardFrom: v.optional(v.string()),
      waitlist: v.optional(v.boolean()),
      foundingInterest: v.optional(v.boolean()),
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
