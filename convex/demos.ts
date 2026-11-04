import { action, internalMutation, mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { ConvexError, v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { enqueue } from "./outbox";
import { DEMO_ROLES, DEMO_TEAM, EMAIL, RUNS_ON, clip, isTestLead, label, pick, refCodeOf } from "./forms";

/**
 * "Book a demo". Two ways in:
 *  - Cal.com (BOOKING_URL set on the site): the booking happens on Cal.com; its webhook
 *    reaches /api/demo-booked, which hands the raw body and signature to `fromCal` here.
 *    The signature is checked with CAL_WEBHOOK_SECRET (this deployment's env).
 *  - The fallback form (no BOOKING_URL): `request`, from /api/demo-request.
 * Both save a demoBookings row, queue a demo_booked event for eBRAiN and ping the team.
 */

const opt = (s: unknown, n: number) => (typeof s === "string" && s.trim() ? clip(s, n) : undefined);

function demoEvent(d: Doc<"demoBookings">, suffix = "") {
  const form: Record<string, string> = {};
  const set = (k: string, val: string | undefined) => {
    if (val) form[k] = val;
  };
  set("role", label(DEMO_ROLES, d.role));
  set("team_size", label(DEMO_TEAM, d.teamSize));
  set("runs_on", label(RUNS_ON, d.runsOn));
  set("uses_today", label(RUNS_ON, d.runsOn));
  set("wants", d.wants);
  set("best_times", d.bestTimes);
  set("booked_via", d.via === "cal" ? "Cal.com" : "Form (no booking link yet)");
  set("booking_uid", d.calUid);
  set("booking_status", d.trigger === "BOOKING_CANCELLED" ? "cancelled" : d.trigger === "BOOKING_RESCHEDULED" ? "rescheduled" : undefined);
  set("time_zone", d.timeZone);
  set("page", d.page);
  set("cta", d.cta);
  return {
    event_id: d.via === "cal" ? `demo:cal:${d.calUid}${suffix}` : `demo:${d._id}`,
    type: "demo_booked" as const,
    occurred_at: d.updatedAt,
    lead: { name: d.name, email: d.email, phone: d.phone, company: d.company, title: label(DEMO_ROLES, d.role), url: d.website },
    form,
    demo: d.startAt ? { at: d.startAt } : undefined,
    ref: d.refCode,
    utm: d.utm,
    referrer: d.referrer,
  };
}

/** The fallback form (same questions as the Cal.com booking, plus best times). */
export const request = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    company: v.string(),
    role: v.string(),
    teamSize: v.string(),
    runsOn: v.string(),
    wants: v.optional(v.string()),
    phone: v.optional(v.string()),
    website: v.optional(v.string()),
    bestTimes: v.optional(v.string()),
    page: v.optional(v.string()),
    cta: v.optional(v.string()),
    referrer: v.optional(v.string()),
    utm: v.optional(v.record(v.string(), v.string())),
    refCode: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  returns: v.id("demoBookings"),
  handler: async (ctx, a) => {
    const name = clip(a.name, 120);
    const email = clip(a.email, 200).toLowerCase();
    const company = clip(a.company, 160);
    if (name.length < 2) throw new ConvexError("Add your name.");
    if (!EMAIL.test(email)) throw new ConvexError("That work email doesn't look right.");
    if (company.length < 2) throw new ConvexError("Add your company.");
    const role = pick(DEMO_ROLES, a.role);
    const teamSize = pick(DEMO_TEAM, a.teamSize);
    const runsOn = pick(RUNS_ON, a.runsOn);
    if (!role) throw new ConvexError("Pick your role.");
    if (!teamSize) throw new ConvexError("Pick how many people handle buying.");
    if (!runsOn) throw new ConvexError("Pick what you run on.");
    const now = Date.now();
    const id = await ctx.db.insert("demoBookings", {
      via: "form",
      name,
      email,
      company,
      role,
      teamSize,
      runsOn,
      wants: opt(a.wants, 1000),
      phone: opt(a.phone, 40),
      website: opt(a.website, 300),
      bestTimes: opt(a.bestTimes, 300),
      test: isTestLead(email, name) || undefined,
      page: opt(a.page, 200),
      cta: opt(a.cta, 60),
      referrer: opt(a.referrer, 300),
      utm: a.utm && Object.keys(a.utm).length ? a.utm : undefined,
      refCode: refCodeOf(a.refCode),
      userAgent: opt(a.userAgent, 300),
      createdAt: now,
      updatedAt: now,
    });
    await enqueue(ctx, demoEvent((await ctx.db.get(id))!));
    await ctx.scheduler.runAfter(0, internal.notify.demo, { id });
    return id;
  },
});

/* ---------- Cal.com ---------- */

async function hmacHex(secret: string, body: string) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(body));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * The Cal.com webhook, handed over by /api/demo-booked with the raw body and the
 * X-Cal-Signature-256 header (hex HMAC-SHA256 of the raw body with the webhook secret).
 * Returns the HTTP status the route should answer with.
 */
export const fromCal = action({
  args: { body: v.string(), signature: v.string() },
  returns: v.object({ status: v.number(), message: v.string() }),
  handler: async (ctx, { body, signature }): Promise<{ status: number; message: string }> => {
    const secret = process.env.CAL_WEBHOOK_SECRET;
    if (!secret) return { status: 503, message: "CAL_WEBHOOK_SECRET is not set" };
    const sig = signature.trim().toLowerCase();
    if (!sig || sig === "no-secret-provided" || !safeEqual(sig, await hmacHex(secret, body))) {
      return { status: 401, message: "bad signature" };
    }
    let json: { triggerEvent?: string; payload?: Record<string, unknown> };
    try {
      json = JSON.parse(body);
    } catch {
      return { status: 400, message: "body is not JSON" };
    }
    const trigger = json.triggerEvent ?? "";
    if (trigger === "PING") return { status: 200, message: "pong" };
    if (!["BOOKING_CREATED", "BOOKING_RESCHEDULED", "BOOKING_CANCELLED"].includes(trigger) || !json.payload) {
      return { status: 200, message: `ignored ${trigger || "unknown event"}` };
    }
    const r = await ctx.runMutation(internal.demos.recordCal, { trigger, payload: JSON.stringify(json.payload) });
    return { status: r.ok ? 200 : 400, message: r.message };
  },
});

/** Reads a booking question's answer: responses[id] is { label, value } (value missing when blank). */
function answer(responses: Record<string, unknown>, ...ids: string[]): string | undefined {
  for (const id of ids) {
    const r = responses[id] as { value?: unknown } | undefined;
    const val = r && typeof r === "object" ? r.value : undefined;
    if (typeof val === "string" && val.trim()) return val.trim();
    if (Array.isArray(val) && val.length) return val.map(String).join(", ");
    if (val && typeof val === "object" && "value" in (val as object)) {
      const inner = (val as { value?: unknown }).value;
      if (typeof inner === "string" && inner.trim()) return inner.trim();
    }
  }
  return undefined;
}

/** Cal.com answers arrive as the option text; map them back to our keys where they match. */
function fromLabel(list: Record<string, string>, val: string | undefined) {
  if (!val) return undefined;
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9+]/g, "");
  const hit = Object.entries(list).find(([k, l]) => norm(k) === norm(val) || norm(l) === norm(val));
  return hit ? hit[0] : clip(val, 80);
}

const time = (s: unknown) => (typeof s === "string" && !Number.isNaN(Date.parse(s)) ? Date.parse(s) : undefined);

export const recordCal = internalMutation({
  args: { trigger: v.string(), payload: v.string() },
  returns: v.object({ ok: v.boolean(), message: v.string() }),
  handler: async (ctx, { trigger, payload }) => {
    const p = JSON.parse(payload) as Record<string, unknown>;
    const uid = typeof p.uid === "string" ? p.uid : undefined;
    if (!uid) return { ok: false, message: "payload.uid is missing" };
    const responses = (p.responses && typeof p.responses === "object" ? p.responses : {}) as Record<string, unknown>;
    const attendee = (Array.isArray(p.attendees) ? p.attendees[0] : undefined) as { name?: string; email?: string; timeZone?: string } | undefined;
    const meta = (p.metadata && typeof p.metadata === "object" ? p.metadata : {}) as Record<string, unknown>;
    const metaStr = (k: string) => (typeof meta[k] === "string" ? (meta[k] as string) : undefined);
    const email = (answer(responses, "email") ?? attendee?.email ?? "").toLowerCase();
    const name = answer(responses, "name") ?? attendee?.name ?? email.split("@")[0];
    if (!EMAIL.test(email)) return { ok: false, message: "no attendee email" };

    const utm: Record<string, string> = {};
    for (const [k, val] of Object.entries(meta)) if (k.startsWith("utm_") && typeof val === "string") utm[k] = val.slice(0, 120);
    const now = Date.now();
    const fields = {
      trigger,
      name: clip(name, 120),
      email,
      company: opt(answer(responses, "company"), 160),
      role: fromLabel(DEMO_ROLES, answer(responses, "role")),
      teamSize: fromLabel(DEMO_TEAM, answer(responses, "team-size", "team_size")),
      runsOn: fromLabel(RUNS_ON, answer(responses, "runs-on", "runs_on")),
      wants: opt(answer(responses, "off-desk", "wants", "notes"), 1000),
      phone: opt(answer(responses, "attendeePhoneNumber", "phone"), 40),
      website: opt(answer(responses, "website"), 300),
      startAt: time(p.startTime),
      endAt: time(p.endTime),
      timeZone: attendee?.timeZone,
      test: isTestLead(email, name) || undefined,
      page: opt(metaStr("page"), 200),
      cta: opt(metaStr("cta"), 60),
      utm: Object.keys(utm).length ? utm : undefined,
      refCode: refCodeOf(metaStr("ref")),
      raw: payload.slice(0, 8000),
      updatedAt: now,
    };

    // a reschedule arrives with the new uid and the old one in rescheduleUid
    const prevUid = typeof p.rescheduleUid === "string" ? p.rescheduleUid : undefined;
    const byUid = async (u: string) =>
      ctx.db
        .query("demoBookings")
        .withIndex("by_calUid", (q) => q.eq("calUid", u))
        .unique();
    const existing = (await byUid(uid)) ?? (prevUid ? await byUid(prevUid) : null);
    let id;
    if (existing) {
      // keep what an earlier delivery knew if this one is thinner (a cancellation carries less)
      const patch: Record<string, unknown> = { calUid: uid };
      for (const [k, val] of Object.entries(fields)) if (val !== undefined) patch[k] = val;
      await ctx.db.patch(existing._id, patch);
      id = existing._id;
    } else {
      id = await ctx.db.insert("demoBookings", { via: "cal", calUid: uid, ...fields, createdAt: now });
    }
    const row = (await ctx.db.get(id))!;
    // a booking and a reschedule are each a demo_booked event; eBRAiN has no cancellation
    // event yet, so a cancellation is saved here and pinged to the team only
    if (trigger !== "BOOKING_CANCELLED") await enqueue(ctx, demoEvent(row, trigger === "BOOKING_CREATED" ? "" : ":rescheduled"));
    if (!existing || trigger !== "BOOKING_CREATED") await ctx.scheduler.runAfter(0, internal.notify.demo, { id });
    return { ok: true, message: existing ? "updated" : "created" };
  },
});
