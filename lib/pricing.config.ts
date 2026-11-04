/**
 * Every plan price and billing term on the site, in one place. The home page's pricing
 * section (cards, Monthly / Yearly toggle, billing FAQ), /pricing (scenes, compare table,
 * FAQ) and llms.txt read from here. Never type a price into a component or a patch:
 * yearly totals and per-month equivalents are computed below.
 *
 * Yearly billing is "pay for 10 months, get 12": yearly = monthly × YEARLY_MONTHS_PAID.
 * Per-month equivalents are rounded to the nearest dollar; billed totals are exact.
 */

export const YEARLY_MONTHS_PAID = 10;
export const FOUNDING_SEATS = 100;

export type Billing = "monthly" | "yearly";

export type Plan = {
  id: "stockbot" | "base" | "scale" | "enterprise";
  name: string;
  /** Monthly list price in dollars; null when the price is custom. */
  monthly: number | null;
  /** "From $2,500/mo" plans: the price is a floor, not a figure. */
  from?: boolean;
  /** Offered on yearly billing at monthly × YEARLY_MONTHS_PAID (stockbot, Base). */
  yearly: boolean;
  /** Per-seat add-on, monthly dollars (Base). */
  seatMonthly?: number;
  /** Seats the plan can hold. */
  maxSeats?: number;
  /** Monthly bill ceiling, seats included (Base: $499/mo, as the site said before 2026-11-03). */
  capMonthly?: number;
  trialDays?: number;
  /** Terms lines, by billing view. Contract plans say the same in both. */
  terms: Record<Billing, string>;
  /** A promise shown with the plan (Base's onboarding promise). */
  promise?: string;
  /** Who it's for, one line (the home page's tier rows). */
  line: string;
  cta: "claim" | "demo";
};

export const FOUNDING = {
  plan: "stockbot" as const,
  monthly: 20,
  seats: FOUNDING_SEATS,
  /** DECIDE (brief): the founding price has no yearly option. */
  yearly: false,
};

export const BASE_ONBOARDING_DAYS = 90;
export const BASE_PROMISE_DAYS = 30;
/** DECIDE (brief): yearly billing is refundable within this many days. */
export const YEARLY_REFUND_DAYS = 30;

export const PLANS: Plan[] = [
  {
    id: "stockbot",
    name: "stockbot",
    monthly: 50,
    yearly: true,
    trialDays: 14,
    terms: { monthly: "No commitment, cancel anytime. 14-day free trial.", yearly: `Paid yearly up front, refundable within ${YEARLY_REFUND_DAYS} days. 14-day free trial.` },
    line: "Text it your paperwork. It catches what you'd miss.",
    cta: "claim",
  },
  {
    id: "base",
    name: "Base",
    monthly: 199,
    yearly: true,
    seatMonthly: 75,
    capMonthly: 499,
    terms: {
      monthly: `${BASE_ONBOARDING_DAYS}-day onboarding commitment, billed monthly.`,
      yearly: `Paid yearly up front, refundable within ${YEARLY_REFUND_DAYS} days.`,
    },
    promise: `Core workflows live in ${BASE_PROMISE_DAYS} days, or cancel with no further charges.`,
    line: "stockbot reads your inbox, so paperwork sorts itself.",
    cta: "claim",
  },
  {
    id: "scale",
    name: "Scale",
    monthly: 999,
    yearly: false,
    maxSeats: 50,
    terms: { monthly: "Annual contract, billed quarterly or annually.", yearly: "Annual contract, billed quarterly or annually." },
    line: "Your team and your agent, working off the same page.",
    cta: "demo",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    monthly: 2500,
    from: true,
    yearly: false,
    terms: {
      monthly: "Annual contract, billed quarterly or annually. Custom pricing.",
      yearly: "Annual contract, billed quarterly or annually. Custom pricing.",
    },
    line: "Multiple agents, your systems, your rules.",
    cta: "demo",
  },
];

export const plan = (id: Plan["id"]) => PLANS.find((p) => p.id === id)!;

/* ---------- arithmetic ---------- */

export const yearlyTotal = (monthly: number) => monthly * YEARLY_MONTHS_PAID;
export const perMonthOfYearly = (monthly: number) => Math.round(yearlyTotal(monthly) / 12);
export const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

/** What a plan card shows for a billing view. */
export function priceFor(p: Plan, billing: Billing) {
  if (p.monthly === null) return { amount: "Custom", per: "", pre: "", billed: "", seat: "" };
  const yearly = billing === "yearly" && p.yearly;
  const amount = usd(yearly ? perMonthOfYearly(p.monthly) : p.monthly);
  const billed = yearly ? `Billed ${usd(yearlyTotal(p.monthly))} yearly` : "";
  let seat = "";
  if (p.seatMonthly) {
    seat = yearly
      ? `+ ${usd(perMonthOfYearly(p.seatMonthly))}/seat/mo, billed ${usd(yearlyTotal(p.seatMonthly))} per seat yearly`
      : `+ ${usd(p.seatMonthly)} per seat`;
    if (p.capMonthly) seat += yearly ? ` · capped at ${usd(yearlyTotal(p.capMonthly))}/yr` : ` · capped at ${usd(p.capMonthly)}/mo`;
  } else if (p.maxSeats) seat = `Up to ${p.maxSeats} seats`;
  return { amount, per: "/mo", pre: p.from ? "From" : "", billed, seat };
}

export const termsFor = (p: Plan, billing: Billing) => p.terms[billing === "yearly" && p.yearly ? "yearly" : "monthly"];

/* ---------- the billing FAQ (home pricing section; /pricing reuses the cancel answer) ---------- */

export const BILLING_FAQ: { q: string; a: string }[] = [
  {
    q: "Can I cancel anytime?",
    a: `stockbot: yes, anytime. Base: after the ${BASE_ONBOARDING_DAYS}-day onboarding period, when it rolls to standard monthly billing. Scale and Enterprise: at the end of the annual contract.`,
  },
  {
    q: "What happens if I upgrade?",
    a: "Your upgrade takes effect immediately, with a one-time prorated credit for the time you haven't used.",
  },
  {
    q: "Is yearly billing refundable?",
    a: `Yes, within ${YEARLY_REFUND_DAYS} days of the charge. After that, yearly billing is non-refundable.`,
  },
  {
    q: `What is the ${BASE_ONBOARDING_DAYS}-day onboarding?`,
    a: `On Base, the first ${BASE_ONBOARDING_DAYS} days are the ramp: we load your documents and products and set up your core workflows with you. Core workflows are live within ${BASE_PROMISE_DAYS} days, or you can cancel with no further charges. After ${BASE_ONBOARDING_DAYS} days, Base rolls to standard monthly billing.`,
  },
];

/** The founding line for the stockbot card, by billing view. */
export function foundingLine(billing: Billing) {
  const s = plan("stockbot");
  return billing === "yearly"
    ? `Founding price is monthly only. Standard yearly: ${priceFor(s, "yearly").amount}/mo, ${priceFor(s, "yearly").billed.toLowerCase()}.`
    : `For the first ${FOUNDING.seats} customers, for life, billed monthly. Standard: ${usd(s.monthly!)}/mo, no commitment, cancel anytime. ${s.trialDays}-day free trial.`;
}

/* ---------- /pricing (the compare table, scenes and FAQ show the monthly figures) ---------- */

export function tierHeader(id: Plan["id"]) {
  const pr = priceFor(plan(id), "monthly");
  return { pre: pr.pre, p: pr.amount, per: pr.per };
}

export function sceneNote(id: Plan["id"]) {
  const p = plan(id);
  if (id === "enterprise") return "Built around your operation";
  return priceFor(p, "monthly").seat;
}

export function baseSeatsAnswer() {
  const b = plan("base");
  return `Base is ${usd(b.monthly!)}/mo plus ${usd(b.seatMonthly!)} for each seat, and your bill is capped at ${usd(b.capMonthly!)}/mo, so adding people past that point costs nothing extra. On yearly billing it's ${usd(yearlyTotal(b.monthly!))} a year plus ${usd(yearlyTotal(b.seatMonthly!))} per seat, capped at ${usd(yearlyTotal(b.capMonthly!))}.`;
}

export const seatsRow = () => `${usd(plan("base").seatMonthly!)} each, capped at ${usd(plan("base").capMonthly!)}/mo`;
