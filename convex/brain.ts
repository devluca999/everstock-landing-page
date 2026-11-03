import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { stackLabel } from "./stacks";

/**
 * Send every submission to eBRAiN's Pipeline as an inbound event (POST
 * /api/inbound on eBRAiN's Convex). eBRAiN owns the lead from there: status,
 * owner and every touch are edited in eBRAiN's Pipeline, not here. The
 * `status` column on accessRequests is no longer read by anyone.
 *
 * Reliable by construction:
 *  - each submission has a stable event_id (row id + submission number), and
 *    eBRAiN ignores an event_id it has already processed, so a retry never
 *    duplicates;
 *  - a network error or 5xx is retried with backoff (1, 2, 4, 8, 16 min);
 *  - a 4xx means the body is wrong; eBRAiN logs it as failed and a founder
 *    can retry it from the Inbound tab once fixed.
 *
 * Env on this Convex deployment (Dashboard > Settings):
 *   INBOUND_SECRET       required; the same value as INBOUND_SECRET on eBRAiN's
 *                        Convex. Write-only: it can post events, read nothing.
 *   EBRAIN_INBOUND_URL   optional; defaults to eBRAiN prod.
 * Without the secret this is a no-op and the row is still in the table.
 */
const DEFAULT_URL = "https://deafening-parakeet-592.convex.site/api/inbound";
const MAX_ATTEMPTS = 6;

export const syncRequest = internalAction({
  args: { id: v.id("accessRequests"), submission: v.optional(v.number()), attempt: v.optional(v.number()) },
  returns: v.null(),
  handler: async (ctx, { id, submission, attempt }) => {
    const secret = process.env.INBOUND_SECRET;
    if (!secret) return null;
    const r: Doc<"accessRequests"> | null = await ctx.runQuery(internal.notifyData.getRow, { id });
    if (!r) return null;
    const n = submission ?? r.submissions;
    const tries = attempt ?? 0;

    let status = 0;
    let detail = "";
    try {
      const res = await fetch(process.env.EBRAIN_INBOUND_URL ?? DEFAULT_URL, {
        method: "POST",
        headers: { authorization: `Bearer ${secret}`, "content-type": "application/json" },
        body: JSON.stringify(eventFor(r, n)),
      });
      status = res.status;
      detail = (await res.text()).slice(0, 300);
    } catch (e) {
      detail = e instanceof Error ? e.message : String(e);
    }

    if (status >= 200 && status < 300) {
      console.log(`eBRAiN inbound ok for ${id}:${n}`);
      return null;
    }
    if (status >= 400 && status < 500) {
      // Logged as failed on eBRAiN's side too; retrying the same body won't help.
      console.error(`eBRAiN inbound rejected ${id}:${n} (${status}): ${detail}`);
      return null;
    }
    if (tries + 1 >= MAX_ATTEMPTS) {
      console.error(`eBRAiN inbound gave up on ${id}:${n} after ${MAX_ATTEMPTS} tries: ${status || "network"} ${detail}`);
      return null;
    }
    const wait = 60_000 * 2 ** tries;
    console.warn(`eBRAiN inbound ${status || "network error"} for ${id}:${n}, retrying in ${wait / 60_000} min`);
    await ctx.scheduler.runAfter(wait, internal.brain.syncRequest, { id, submission: n, attempt: tries + 1 });
    return null;
  },
});

/** The inbound event eBRAiN expects (see eBRAiN convex/lib/leadKeys.ts parseInbound). */
export function eventFor(r: Doc<"accessRequests">, submission: number) {
  const form: Record<string, string> = { uses_today: stackLabel(r.stack) };
  if (r.note) form.message = r.note;
  if (r.foundingInterest) form.plan = "Founding pricing";
  if (r.workEmail) form.work_email = r.workEmail;
  if (r.heardFrom) form.heard_from = r.heardFrom;
  return {
    event_id: `accessRequest:${r._id}:${submission}`,
    type: r.source === "book-demo" ? "demo_booked" : "spot_claim",
    occurred_at: r.updatedAt,
    lead: { name: r.name, email: r.email, phone: r.phone, company: r.company },
    form,
    ref: r.refCode,
    utm: r.utm,
    referrer: r.referrer,
  };
}
