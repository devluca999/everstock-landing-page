import { internalAction, internalMutation, internalQuery, type MutationCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

/**
 * The outbox to eBRAiN's Pipeline (POST /api/inbound on eBRAiN's Convex).
 *
 * Every event is saved here in the same transaction as the submission it comes from, then
 * sent. So nothing is lost while eBRAiN is down or the secret is missing:
 *  - 2xx: `sent`.
 *  - network error or 5xx: retried with backoff (1, 2, 4, 8 min); `failed` after that.
 *  - 4xx: `failed` (the body or the secret is wrong; eBRAiN logs it too).
 *  - the hourly cron (convex/crons.ts) retries every `failed` event, up to MAX_ATTEMPTS.
 * eBRAiN ignores an event_id it has already processed, so a retry never duplicates.
 *
 * Env on this Convex deployment:
 *   INBOUND_SECRET       required; the same value as INBOUND_SECRET on eBRAiN's Convex.
 *                        Write-only: it can post events, read nothing.
 *   EBRAIN_INBOUND_URL   optional; defaults to eBRAiN prod. Dev points at eBRAiN dev.
 * Without the secret, events wait as `failed` and go out once it is set.
 *
 * Inspect: `npx convex run outbox:recent` (add --prod). Retry now: `npx convex run outbox:retryFailed`.
 */
const DEFAULT_URL = "https://deafening-parakeet-592.convex.site/api/inbound";
const QUICK_RETRIES = 4; // 1 + 2 + 4 + 8 min
const MAX_ATTEMPTS = 60; // the hourly cron gives up after about two days

export type InboundEvent = { event_id: string; type: "spot_claim" | "spot_claim_update" | "demo_booked" } & Record<string, unknown>;

/** Save an event and send it right away. Call from the mutation that saved the submission. */
export async function enqueue(ctx: MutationCtx, event: InboundEvent) {
  const existing = await ctx.db
    .query("outbox")
    .withIndex("by_eventId", (q) => q.eq("eventId", event.event_id))
    .unique();
  if (existing) return existing._id;
  const id = await ctx.db.insert("outbox", {
    eventId: event.event_id,
    type: event.type,
    body: JSON.stringify(event),
    status: "pending",
    attempts: 0,
    createdAt: Date.now(),
  });
  await ctx.scheduler.runAfter(0, internal.outbox.send, { id });
  return id;
}

export const get = internalQuery({
  args: { id: v.id("outbox") },
  handler: async (ctx, { id }) => ctx.db.get(id),
});

export const record = internalMutation({
  args: {
    id: v.id("outbox"),
    status: v.union(v.literal("pending"), v.literal("sent"), v.literal("failed")),
    lastStatus: v.number(),
    lastError: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, { id, status, lastStatus, lastError }) => {
    const row = await ctx.db.get(id);
    if (!row || row.status === "sent") return null;
    const now = Date.now();
    await ctx.db.patch(id, {
      status,
      lastStatus,
      lastError,
      attempts: row.attempts + 1,
      lastTriedAt: now,
      ...(status === "sent" ? { sentAt: now } : {}),
    });
    return null;
  },
});

export const send = internalAction({
  args: { id: v.id("outbox"), quick: v.optional(v.number()) },
  returns: v.null(),
  handler: async (ctx, { id, quick }) => {
    const row = await ctx.runQuery(internal.outbox.get, { id });
    if (!row || row.status === "sent") return null;
    const secret = process.env.INBOUND_SECRET;
    if (!secret) {
      await ctx.runMutation(internal.outbox.record, { id, status: "failed", lastStatus: 0, lastError: "INBOUND_SECRET is not set on this deployment" });
      return null;
    }

    let status = 0;
    let detail = "";
    try {
      const res = await fetch(process.env.EBRAIN_INBOUND_URL ?? DEFAULT_URL, {
        method: "POST",
        headers: { authorization: `Bearer ${secret}`, "content-type": "application/json" },
        body: row.body,
      });
      status = res.status;
      detail = (await res.text()).slice(0, 300);
    } catch (e) {
      detail = e instanceof Error ? e.message : String(e);
    }

    if (status >= 200 && status < 300) {
      await ctx.runMutation(internal.outbox.record, { id, status: "sent", lastStatus: status });
      return null;
    }
    const tries = quick ?? 0;
    const retryable = status === 0 || status >= 500;
    if (retryable && tries < QUICK_RETRIES) {
      await ctx.runMutation(internal.outbox.record, { id, status: "pending", lastStatus: status, lastError: detail });
      await ctx.scheduler.runAfter(60_000 * 2 ** tries, internal.outbox.send, { id, quick: tries + 1 });
      return null;
    }
    console.error(`eBRAiN inbound ${status || "network error"} for ${row.eventId}: ${detail}`);
    await ctx.runMutation(internal.outbox.record, { id, status: "failed", lastStatus: status, lastError: detail });
    return null;
  },
});

/** The hourly cron: send every failed event again (and any stuck pending for over an hour). */
export const retryFailed = internalMutation({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const failed = await ctx.db
      .query("outbox")
      .withIndex("by_status_and_createdAt", (q) => q.eq("status", "failed"))
      .take(100);
    const stuck = (
      await ctx.db
        .query("outbox")
        .withIndex("by_status_and_createdAt", (q) => q.eq("status", "pending"))
        .take(100)
    ).filter((r) => (r.lastTriedAt ?? r.createdAt) < Date.now() - 3_600_000);
    let n = 0;
    for (const r of [...failed, ...stuck]) {
      if (r.attempts >= MAX_ATTEMPTS) continue;
      // a stuck pending event goes back to failed first, so it is not picked twice
      if (r.status === "pending") await ctx.db.patch(r._id, { status: "failed" });
      // the cron's own retry: no quick retries on top (QUICK_RETRIES means "done")
      await ctx.scheduler.runAfter(n * 500, internal.outbox.send, { id: r._id, quick: QUICK_RETRIES });
      n++;
    }
    return n;
  },
});

/** Newest first, for a look from the CLI: `npx convex run outbox:recent '{"status":"failed"}'`. */
export const recent = internalQuery({
  args: { status: v.optional(v.union(v.literal("pending"), v.literal("sent"), v.literal("failed"))), limit: v.optional(v.number()) },
  handler: async (ctx, { status, limit }) => {
    const n = Math.min(limit ?? 20, 200);
    const rows = status
      ? await ctx.db
          .query("outbox")
          .withIndex("by_status_and_createdAt", (q) => q.eq("status", status))
          .order("desc")
          .take(n)
      : await ctx.db.query("outbox").order("desc").take(n);
    return rows.map(({ body, ...r }) => ({ ...r, body: body.slice(0, 400) }));
  },
});
