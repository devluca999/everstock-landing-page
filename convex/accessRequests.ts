import { internalQuery, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { ConvexError, v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { enqueue } from "./outbox";
import { CHANNELS, CLAIM_TEAM, EMAIL, HEADACHES, USES_TODAY, clip, isTestLead, label, pick, planFit, refCodeOf } from "./forms";

const context = {
  page: v.optional(v.string()),
  cta: v.optional(v.string()),
  referrer: v.optional(v.string()),
  utm: v.optional(v.record(v.string(), v.string())),
  refCode: v.optional(v.string()),
  userAgent: v.optional(v.string()),
};

const opt = (s: string | undefined, n: number) => (s ? clip(s, n) || undefined : undefined);

/** The spot_claim event for a claim row (eBRAiN's parseInbound reads form.sells / plan / uses_today). */
function claimEvent(r: Doc<"accessRequests">, n: number) {
  const form: Record<string, string> = {};
  const set = (k: string, val: string | undefined) => {
    if (val) form[k] = val;
  };
  const stockPlan = r.source === "stock-plan";
  set("request", stockPlan ? "Free Stock Plan" : "Founding spot");
  set("sells", r.sells);
  set("team_size", label(CLAIM_TEAM, r.teamSize));
  set("plan", stockPlan ? "Stock Plan" : r.planFit);
  set("sells_on", r.channels?.map((c) => label(CHANNELS, c)).join(", "));
  if (r.phone) set("sms_consent", r.smsConsent ? "yes" : "no");
  set("sms_consent_at", r.smsConsentAt ? new Date(r.smsConsentAt).toISOString() : undefined);
  set("heard_from", r.heardFrom);
  set("message", r.note);
  set("page", r.page);
  set("cta", r.cta);
  return {
    event_id: `claim:${r._id}:${n}`,
    type: "spot_claim" as const,
    occurred_at: r.updatedAt,
    lead: { name: r.name, email: r.email, phone: r.phone, company: r.company, url: r.website },
    form,
    ref: r.refCode,
    utm: r.utm,
    referrer: r.referrer,
  };
}

/**
 * "Claim your spot" and the free Stock Plan. Called from /api/request-access, which has
 * already done the bot checks (honeypot, minimum fill time). Validation is repeated here
 * because this is the boundary that matters. One row per email; each submission is saved,
 * then queued for eBRAiN (convex/outbox.ts).
 */
export const submit = mutation({
  args: {
    kind: v.union(v.literal("claim"), v.literal("stock-plan")),
    name: v.string(),
    email: v.string(),
    sells: v.optional(v.string()),
    teamSize: v.optional(v.string()),
    channels: v.optional(v.array(v.string())),
    website: v.optional(v.string()),
    phone: v.optional(v.string()),
    smsConsent: v.optional(v.boolean()),
    heardFrom: v.optional(v.string()),
    note: v.optional(v.string()),
    ...context,
  },
  returns: v.object({ id: v.id("accessRequests"), submission: v.number(), repeat: v.boolean(), planFit: v.optional(v.string()) }),
  handler: async (ctx, args) => {
    const claim = args.kind === "claim";
    const name = clip(args.name, 120);
    const email = clip(args.email, 200).toLowerCase();
    if (name.length < 1) throw new ConvexError("Add your first name.");
    if (!EMAIL.test(email)) throw new ConvexError("That email address doesn't look right.");
    const sells = opt(args.sells, 300);
    const teamSize = pick(CLAIM_TEAM, args.teamSize);
    if (claim && !sells) throw new ConvexError("Tell us what you sell.");
    if (claim && !teamSize) throw new ConvexError("Pick how many people handle buying and stock.");
    const channels = (args.channels ?? []).filter((c) => c in CHANNELS).slice(0, 6);
    const phone = opt(args.phone, 40);
    const now = Date.now();
    // consent only counts with a number to text, and is timestamped when given
    const smsConsent = phone ? args.smsConsent === true : undefined;
    const fields = {
      name,
      sells,
      teamSize,
      planFit: teamSize ? planFit(teamSize) : undefined,
      channels: channels.length ? channels : undefined,
      website: opt(args.website, 300),
      phone,
      smsConsent,
      smsConsentAt: smsConsent ? now : undefined,
      heardFrom: opt(args.heardFrom, 120),
      note: opt(args.note, 1000),
      source: args.kind,
      page: opt(args.page, 200),
      cta: opt(args.cta, 60),
      referrer: opt(args.referrer, 300),
      utm: args.utm && Object.keys(args.utm).length ? args.utm : undefined,
      refCode: refCodeOf(args.refCode),
      userAgent: opt(args.userAgent, 300),
    };
    const test = isTestLead(email, name) || undefined;

    const existing = await ctx.db
      .query("accessRequests")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    let id: Id<"accessRequests">;
    let n: number;
    let firstClaim = false;
    if (existing) {
      n = existing.submissions + 1;
      id = existing._id;
      // a repeat fills in what is new and never blanks what was there
      const patch: Partial<Doc<"accessRequests">> = { submissions: n, updatedAt: now, test };
      for (const [k, val] of Object.entries(fields)) if (val !== undefined) (patch as Record<string, unknown>)[k] = val;
      if (claim && !existing.claimedAt) {
        patch.claimedAt = now;
        firstClaim = true;
      }
      // a stock plan request after a claim stays a claim in the row
      if (!claim && existing.claimedAt) patch.source = existing.source;
      await ctx.db.patch(id, patch);
    } else {
      n = 1;
      firstClaim = claim;
      id = await ctx.db.insert("accessRequests", {
        ...fields,
        email,
        claimedAt: claim ? now : undefined,
        test,
        submissions: 1,
        status: "new",
        createdAt: now,
        updatedAt: now,
      });
    }

    const row = (await ctx.db.get(id))!;
    // the event carries this submission's own source, even when the row stays a claim
    await enqueue(ctx, claimEvent({ ...row, source: args.kind }, n));
    await ctx.scheduler.runAfter(0, internal.notify.claim, { id, repeat: !!existing, kind: args.kind });
    if (firstClaim && !test) await ctx.scheduler.runAfter(0, internal.notify.claimConfirmation, { id });
    return { id, submission: n, repeat: !!existing, planFit: row.planFit };
  },
});

/**
 * The success screen's optional "Help us set you up (30 seconds)" step. Patches the row
 * the claim just created (the id the route returned, checked against the email) and sends
 * a spot_claim_update that eBRAiN merges into the same claim.
 */
export const setup = mutation({
  args: {
    id: v.string(),
    submission: v.number(),
    email: v.string(),
    headache: v.optional(v.string()),
    usesToday: v.optional(v.string()),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const id = ctx.db.normalizeId("accessRequests", args.id);
    if (!id) return false;
    const row = await ctx.db.get(id);
    if (!row || row.email !== clip(args.email, 200).toLowerCase() || !row.claimedAt) return false;
    const headache = pick(HEADACHES, args.headache);
    const usesToday = pick(USES_TODAY, args.usesToday);
    if (!headache && !usesToday) return false;
    const now = Date.now();
    await ctx.db.patch(id, {
      headache: headache ?? row.headache,
      usesToday: usesToday ?? row.usesToday,
      setupAnsweredAt: now,
      updatedAt: now,
    });
    const form: Record<string, string> = {};
    if (headache) form.biggest_headache = label(HEADACHES, headache)!;
    if (usesToday) form.uses_today = label(USES_TODAY, usesToday)!;
    const n = Math.min(Math.max(1, Math.floor(args.submission)), row.submissions);
    await enqueue(ctx, {
      event_id: `claimUpdate:${id}:${n}`,
      type: "spot_claim_update",
      claim_event_id: `claim:${id}:${n}`,
      occurred_at: now,
      lead: { name: row.name, email: row.email },
      form,
    });
    return true;
  },
});

/**
 * The founding seat counter. Counts real claims only: one per email (the table is one
 * row per email), QA addresses excluded. Returns no number until there are at least
 * FOUNDING_COUNTER_MIN claims (Convex env, default 10), so the page never shows a count
 * that small or a made-up one.
 */
export const seats = query({
  args: {},
  returns: v.object({ total: v.number(), claimed: v.union(v.number(), v.null()) }),
  handler: async (ctx) => {
    const total = 100;
    const min = Number(process.env.FOUNDING_COUNTER_MIN ?? 10) || 10;
    const rows = await ctx.db
      .query("accessRequests")
      .withIndex("by_claimedAt", (q) => q.gt("claimedAt", 0))
      .take(2000);
    const claimed = rows.filter((r) => !r.test && !isTestLead(r.email, r.name)).length;
    return { total, claimed: claimed >= min ? claimed : null };
  },
});

/** Newest first. Internal: it returns every submission's contact details.
    Read it with `npx convex run accessRequests:list` (add --prod). */
export const list = internalQuery({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    return await ctx.db
      .query("accessRequests")
      .withIndex("by_createdAt")
      .order("desc")
      .take(Math.min(limit ?? 100, 500));
  },
});
