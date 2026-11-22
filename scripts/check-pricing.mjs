#!/usr/bin/env node
/**
 * Checks lib/pricing.config.ts against the billing brief (2026-11-03) and the stockbot price
 * (eBRAiN decisions/stockbot-pricing-99-2026-11-22): every figure the cards show in both toggle
 * states, no em or en dashes in any pricing copy, and no "for life" / "locked" founding promise.
 *   node --experimental-strip-types scripts/check-pricing.mjs
 */
import assert from "node:assert/strict";
import { BILLING_FAQ, FOUNDING, PLANS, foundingLine, foundingTerms, plan, priceFor, termsFor } from "../lib/pricing.config.ts";

const p = (id, b) => priceFor(plan(id), b);
const checks = [
  [p("stockbot", "monthly").amount, "$99"],
  [p("stockbot", "yearly").amount, "$99"],
  [p("stockbot", "yearly").billed, ""],
  [plan("stockbot").trialDays, 14],
  [FOUNDING.monthly, 50],
  [FOUNDING.months, 12],
  [FOUNDING.seats, 100],
  [foundingTerms(), "For the first 100 customers: $50/mo for your first 12 months, then $99/mo. Billed monthly, no trial."],
  [p("base", "monthly").amount, "$199"],
  [p("base", "monthly").seat, "+ $75 per seat · capped at $499/mo"],
  [p("base", "yearly").amount, "$166"],
  [p("base", "yearly").billed, "Billed $1,990 yearly"],
  [p("base", "yearly").seat, "+ $75 per seat"],
  [termsFor(plan("base"), "monthly"), "90-day onboarding commitment, billed monthly."],
  [plan("base").promise, "Core workflows live in 30 days, or cancel with no further charges."],
  [p("scale", "monthly").amount, "$999"],
  [p("scale", "yearly").amount, "$999"],
  [p("scale", "yearly").billed, ""],
  [termsFor(plan("scale"), "yearly"), "Annual contract, billed quarterly or annually."],
  [p("enterprise", "monthly").pre + " " + p("enterprise", "monthly").amount + p("enterprise", "monthly").per, "From $2,500/mo"],
  [p("enterprise", "yearly").amount, "$2,500"],
  [termsFor(plan("enterprise"), "monthly"), "Annual contract, billed quarterly or annually. Custom pricing."],
];
for (const [got, want] of checks) assert.equal(got, want);

const copy = [
  ...PLANS.flatMap((x) => [x.line, x.promise ?? "", x.terms.monthly, x.terms.yearly]),
  ...BILLING_FAQ.flatMap((f) => [f.q, f.a]),
  foundingLine("monthly"),
  foundingLine("yearly"),
  foundingTerms(),
  ...PLANS.flatMap((x) => ["monthly", "yearly"].flatMap((b) => Object.values(priceFor(x, b)))),
];
for (const c of copy) assert.ok(!/[–—]/.test(c), `dash in: ${c}`);
for (const c of copy) assert.ok(!/for life|lifetime|locked|forever|grandfather/i.test(c), `retired founding promise in: ${c}`);
for (const c of copy) assert.ok(!/!/.test(c), `exclamation mark in: ${c}`);
console.log(`pricing config ok: ${checks.length} figures, ${copy.length} strings, no em or en dashes`);
