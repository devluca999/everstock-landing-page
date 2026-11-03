/**
 * The form vocabularies and small helpers shared by the intake mutations, the outbox and
 * the notifier. No Convex imports, so the Next.js routes can use the same lists.
 */

export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const clip = (s: string, n: number) => s.trim().slice(0, n);

/** QA submissions (the same rule as eBRAiN's isTestLead): never counted, never emailed at launch. */
export function isTestLead(email: string, name?: string): boolean {
  const e = email.trim().toLowerCase();
  return e.endsWith("@everstock-test.com") || e.startsWith("qa-") || (name ?? "").trim().toLowerCase().startsWith("qa-");
}

/** "How many people handle buying and stock?" (Claim your spot). */
export const CLAIM_TEAM: Record<string, string> = {
  "just-me": "Just me",
  "2-5": "2 to 5",
  "6-20": "6 to 20",
  "20+": "20+",
};

/** The plan a team size fits. 20+ gets a demo suggested on the success screen. */
export function planFit(teamSize: string): string {
  if (teamSize === "just-me") return "Stockbot";
  if (teamSize === "2-5") return "Base";
  if (teamSize === "6-20") return "Base or Scale";
  return "Book a demo";
}

export const CHANNELS: Record<string, string> = {
  shopify: "Shopify",
  amazon: "Amazon",
  etsy: "Etsy",
  wholesale: "Wholesale / B2B",
  "own-store": "My own store",
  other: "Other",
};

/** The success screen's optional "Help us set you up" step. */
export const HEADACHES: Record<string, string> = {
  stockouts: "Running out of stock",
  suppliers: "Chasing suppliers",
  invoices: "Invoice mistakes",
  paperwork: "Paperwork everywhere",
  other: "Other",
};
export const USES_TODAY: Record<string, string> = {
  spreadsheets: "Spreadsheets",
  quickbooks: "QuickBooks",
  erp: "An ERP",
  shopify: "Just Shopify",
  other: "Other",
};

/** Book a demo (the fallback form; the Cal.com booking questions use the same choices). */
export const DEMO_ROLES: Record<string, string> = {
  owner: "Owner / CEO",
  operations: "Operations",
  purchasing: "Purchasing / procurement",
  finance: "Finance",
  other: "Other",
};
export const DEMO_TEAM: Record<string, string> = {
  "2-5": "2 to 5",
  "6-20": "6 to 20",
  "21-50": "21 to 50",
  "50+": "50+",
};
export const RUNS_ON: Record<string, string> = {
  netsuite: "NetSuite",
  epicor: "Epicor",
  dynamics: "Dynamics",
  "sap-b1": "SAP Business One",
  sage: "Sage",
  quickbooks: "QuickBooks",
  spreadsheets: "Spreadsheets",
  other: "Other",
};

/** A value from one of the lists above, or undefined. */
export const pick = (list: Record<string, string>, v: string | undefined) => (v && v in list ? v : undefined);
/** Its label, or the value itself (Cal.com answers arrive as labels). */
export const label = (list: Record<string, string>, v: string | undefined) => (v ? (list[v] ?? v) : undefined);

/** Ref codes as eDialer issues them (JACOB-7K2). */
export const refCodeOf = (v: string | undefined) => (v && /^[A-Za-z0-9-]{3,24}$/.test(v) ? v.toUpperCase() : undefined);
