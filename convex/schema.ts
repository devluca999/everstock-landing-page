import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * The site's intake. Every submission is saved here first, then sent to eBRAiN's
 * Pipeline through the outbox (convex/outbox.ts), so nothing is lost while eBRAiN is down.
 */
export default defineSchema({
  /**
   * "Claim your spot" (founding pricing) and the free Stock Plan. One row per email: a
   * repeat submission updates the row and bumps `submissions`. Rows from before
   * 2026-11-03 came from the old forms (name, company, stack, source waitlist / book-demo).
   */
  accessRequests: defineTable({
    name: v.string(), // first name on the claim form
    email: v.string(), // lower-cased, trimmed
    company: v.optional(v.string()),
    stack: v.optional(v.string()), // legacy "What do you use today?" value
    phone: v.optional(v.string()),
    note: v.optional(v.string()),
    // the claim form
    sells: v.optional(v.string()), // "What do you sell?"
    teamSize: v.optional(v.string()), // just-me | 2-5 | 6-20 | 20+
    planFit: v.optional(v.string()), // derived from teamSize: Stockbot | Base | Base or Scale | Book a demo
    channels: v.optional(v.array(v.string())), // "Where do you sell?"
    website: v.optional(v.string()),
    smsConsent: v.optional(v.boolean()), // "OK to text me about my Everstock setup"; never text without it
    smsConsentAt: v.optional(v.number()),
    heardFrom: v.optional(v.string()), // asked only when there is no UTM and no ref code
    // the success screen's "Help us set you up" step
    headache: v.optional(v.string()),
    usesToday: v.optional(v.string()),
    setupAnsweredAt: v.optional(v.number()),
    // set when this email claimed a founding spot (the seat counter counts these)
    claimedAt: v.optional(v.number()),
    test: v.optional(v.boolean()), // QA address (everstock-test.com, qa-*): never counted
    confirmationSentAt: v.optional(v.number()),
    launchEmailSentAt: v.optional(v.number()),
    // legacy fields from the old forms, kept so old rows stay valid
    workEmail: v.optional(v.string()),
    waitlist: v.optional(v.boolean()),
    foundingInterest: v.optional(v.boolean()),
    // silent context, for attribution and follow-up
    source: v.optional(v.string()), // claim | stock-plan (older rows: waitlist | book-demo | …)
    page: v.optional(v.string()), // the path the form was sent from
    cta: v.optional(v.string()), // which button opened it (hero, nav, pricing-base, …)
    referrer: v.optional(v.string()),
    utm: v.optional(v.record(v.string(), v.string())),
    refCode: v.optional(v.string()), // the es_ref cookie (?ref=CODE), the rep or partner who sent them
    userAgent: v.optional(v.string()),
    submissions: v.number(),
    // Legacy: lead status lives in eBRAiN's Pipeline. Kept so old rows stay valid.
    status: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_createdAt", ["createdAt"])
    .index("by_claimedAt", ["claimedAt"]),

  /** "Book a demo": one row per Cal.com booking (by uid) or per fallback-form request. */
  demoBookings: defineTable({
    via: v.string(), // cal | form
    calUid: v.optional(v.string()),
    trigger: v.optional(v.string()), // the Cal.com triggerEvent
    name: v.string(),
    email: v.string(),
    company: v.optional(v.string()),
    role: v.optional(v.string()),
    teamSize: v.optional(v.string()), // 2-5 | 6-20 | 21-50 | 50+
    runsOn: v.optional(v.string()),
    wants: v.optional(v.string()), // "What would you want off your team's desk?"
    phone: v.optional(v.string()),
    website: v.optional(v.string()),
    bestTimes: v.optional(v.string()), // fallback form only
    startAt: v.optional(v.number()), // the booked time (Cal.com)
    endAt: v.optional(v.number()),
    timeZone: v.optional(v.string()),
    test: v.optional(v.boolean()),
    page: v.optional(v.string()),
    cta: v.optional(v.string()),
    referrer: v.optional(v.string()),
    utm: v.optional(v.record(v.string(), v.string())),
    refCode: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    raw: v.optional(v.string()), // the Cal.com payload, trimmed, for anything not mapped
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_calUid", ["calUid"])
    .index("by_email", ["email"]),

  /**
   * Every event sent to eBRAiN (spot_claim, spot_claim_update, demo_booked), saved before
   * it is sent. `sent` once eBRAiN answered 2xx; `failed` after a 4xx or after the quick
   * retries ran out. The hourly cron (convex/crons.ts) retries failed events.
   */
  outbox: defineTable({
    eventId: v.string(),
    type: v.string(),
    body: v.string(), // the JSON sent
    status: v.union(v.literal("pending"), v.literal("sent"), v.literal("failed")),
    attempts: v.number(),
    lastStatus: v.optional(v.number()), // HTTP status of the last try (0 = network)
    lastError: v.optional(v.string()),
    createdAt: v.number(),
    lastTriedAt: v.optional(v.number()),
    sentAt: v.optional(v.number()),
  })
    .index("by_eventId", ["eventId"])
    .index("by_status_and_createdAt", ["status", "createdAt"]),

  /** The footer's "Send feedback": one row per message. */
  feedback: defineTable({
    kind: v.string(), // feedback | suggestion | bug
    message: v.string(),
    email: v.optional(v.string()), // only when they want a reply
    page: v.optional(v.string()), // the path they sent it from
    userAgent: v.optional(v.string()),
    status: v.string(), // new | read | done  (edited from the dashboard)
    createdAt: v.number(),
  }).index("by_createdAt", ["createdAt"]),
});
