import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Waitlist and Book a demo intake. One row per request; a repeat submission from the same
 * email updates the existing row (and bumps `submissions`) instead of duplicating it,
 * so the list you reach out from stays one-line-per-person.
 */
export default defineSchema({
  accessRequests: defineTable({
    name: v.string(),
    email: v.string(), // lower-cased, trimmed
    company: v.string(),
    stack: v.string(), // what they run today: netsuite | epicor-p21 | sap-b1 | spreadsheets | other
    phone: v.optional(v.string()),
    note: v.optional(v.string()),
    workEmail: v.optional(v.string()), // a second, work address when `email` is a personal one
    heardFrom: v.optional(v.string()), // "How did you hear about us?" (optional)
    // the questions asked after a form is sent; unset until answered
    waitlist: v.optional(v.boolean()), // on the waitlist (the waitlist form sets it; Book a demo asks)
    foundingInterest: v.optional(v.boolean()), // interested in the founding partner program
    // silent context, for attribution and follow-up
    source: v.optional(v.string()), // which form: waitlist | book-demo (older rows: hero | nav | founding-partner | …)
    referrer: v.optional(v.string()),
    utm: v.optional(v.record(v.string(), v.string())),
    userAgent: v.optional(v.string()),
    submissions: v.number(),
    status: v.string(), // new | contacted | qualified | declined  (edited from the dashboard)
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_createdAt", ["createdAt"]),
});
