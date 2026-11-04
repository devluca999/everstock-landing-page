/**
 * Render values for the home page's pricing section (scripts/port-patches/v9-plan.mjs), all
 * from lib/pricing.config.ts. `billing` is the Monthly / Yearly toggle; `anim` flips between two
 * identical keyframes so each change replays the price fade (dc-host.css, off under reduced motion).
 */
import { BILLING_FAQ, FOUNDING, PLANS, foundingLine, priceFor, termsFor, usd, type Billing } from "@/lib/pricing.config";

type Setter = (patch: Record<string, unknown>) => void;

export function pricingVals(state: { billing?: Billing; bfaq?: number; prFlip?: boolean }, set: Setter) {
  const billing: Billing = state.billing === "yearly" ? "yearly" : "monthly";
  const vals: Record<string, unknown> = {
    prIntro: `Start by text for ${usd(FOUNDING.monthly)} a month at founding pricing. Add your inbox, your team and your systems when you need them. Your history and setup come with you.`,
    prFoundingAmount: usd(FOUNDING.monthly),
    prFoundingLine: foundingLine(billing),
    prAnim: state.prFlip === undefined ? "none" : `${state.prFlip ? "es-price-a" : "es-price-b"} 280ms cubic-bezier(.2,.8,.25,1)`,
    billMonthly: billing === "monthly" ? "true" : "false",
    billYearly: billing === "yearly" ? "true" : "false",
    billMonthlyBg: billing === "monthly" ? "rgb(var(--ink))" : "transparent",
    billMonthlyFg: billing === "monthly" ? "rgb(var(--bg))" : "rgb(var(--ink))",
    billYearlyBg: billing === "yearly" ? "rgb(var(--ink))" : "transparent",
    billYearlyFg: billing === "yearly" ? "rgb(var(--bg))" : "rgb(var(--ink))",
    pickMonthly: () => billing !== "monthly" && set({ billing: "monthly", prFlip: !state.prFlip }),
    pickYearly: () => billing !== "yearly" && set({ billing: "yearly", prFlip: !state.prFlip }),
  };
  for (const p of PLANS) {
    const pr = priceFor(p, billing);
    vals[`pr_${p.id}_name`] = p.name;
    vals[`pr_${p.id}_pre`] = pr.pre;
    vals[`pr_${p.id}_amount`] = pr.amount;
    vals[`pr_${p.id}_per`] = pr.per;
    vals[`pr_${p.id}_billed`] = pr.billed;
    vals[`pr_${p.id}_seat`] = pr.seat;
    vals[`pr_${p.id}_terms`] = termsFor(p, billing);
    vals[`pr_${p.id}_promise`] = p.promise ?? "";
    vals[`pr_${p.id}_line`] = p.line;
  }
  BILLING_FAQ.forEach((f, i) => {
    const on = state.bfaq === i;
    vals[`bfaqQ${i}`] = f.q;
    vals[`bfaqA${i}`] = f.a;
    vals[`bfaqExp${i}`] = on ? "true" : "false";
    vals[`bfaqRows${i}`] = on ? "1fr" : "0fr";
    vals[`bfaqRot${i}`] = on ? "rotate(45deg)" : "none";
    vals[`bfaqT${i}`] = () => set({ bfaq: on ? -1 : i });
  });
  return vals;
}
