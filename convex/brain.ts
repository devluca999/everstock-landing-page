"use node";

import { internalAction } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { stackLabel } from "./stacks";

/**
 * Mirror every access request into eBRAiN, the company brain, as a `crm` page so it
 * shows up on the /crm board and in the founder briefs next to the hand-written
 * prospects. Runs after each submission (new or repeat); the page is upserted by slug,
 * so a repeat submission refreshes the page instead of duplicating it.
 *
 * Reads from the Convex deployment's environment (Dashboard → Settings):
 *   EVERBRAIN_BEARER_TOKEN   required; the shared bearer the brain's MCP server checks
 *   EVERBRAIN_MCP_URL        optional; defaults to the production MCP endpoint
 *   EVERBRAIN_ACTOR          optional; attribution label, defaults to "luca"
 * Without a token this is a no-op and the row is still in the table.
 */
const DEFAULT_URL = "https://everbrain-six.vercel.app/api/mcp";

export const syncRequest = internalAction({
  args: { id: v.id("accessRequests") },
  returns: v.null(),
  handler: async (ctx, { id }) => {
    const token = process.env.EVERBRAIN_BEARER_TOKEN;
    if (!token) return null;
    const r: Doc<"accessRequests"> | null = await ctx.runQuery(internal.notifyData.getRow, { id });
    if (!r) return null;
    await remember(token, pageFor(r));
    return null;
  },
});

/** Backfill: push every stored request. `npx convex run brain:syncAll --prod`. */
export const syncAll = internalAction({
  args: { limit: v.optional(v.number()) },
  returns: v.object({ synced: v.number() }),
  handler: async (ctx, { limit }): Promise<{ synced: number }> => {
    const token = process.env.EVERBRAIN_BEARER_TOKEN;
    if (!token) throw new Error("EVERBRAIN_BEARER_TOKEN is not set on this deployment");
    const rows: Doc<"accessRequests">[] = await ctx.runQuery(api.accessRequests.list, { limit: limit ?? 500 });
    for (const r of rows) await remember(token, pageFor(r));
    return { synced: rows.length };
  },
});

type Page = {
  slug: string;
  title: string;
  type: "crm";
  tags: string[];
  content: string;
  edges: { toSlug: string; edgeType: "prospect_for" }[];
};

const slugify = (s: string) =>
  s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

const when = (ms: number) => new Date(ms).toISOString().slice(0, 16).replace("T", " ") + " UTC";

/** The brain page for one request: slug keyed on person + company so a repeat upserts. */
export function pageFor(r: Doc<"accessRequests">): Page {
  const person = slugify(r.name) || "unknown";
  const org = slugify(r.company) || slugify(r.email.split("@")[1] ?? "") || "unknown";
  const utm =
    r.utm && Object.keys(r.utm).length
      ? Object.entries(r.utm)
          .map(([k, val]) => `${k}=${val}`)
          .join(", ")
      : null;

  const yesNo = (b: boolean | undefined) => (b === undefined ? null : b ? "yes" : "no");
  const facts = [
    `- Email: ${r.email}`,
    r.workEmail ? `- Work email: ${r.workEmail}` : null,
    r.phone ? `- Phone: ${r.phone}` : null,
    r.heardFrom ? `- Heard about us: ${r.heardFrom}` : null,
    yesNo(r.waitlist) ? `- Waitlist: ${yesNo(r.waitlist)}` : null,
    yesNo(r.foundingInterest) ? `- Founding partner program: ${yesNo(r.foundingInterest)}` : null,
    `- Uses today: ${stackLabel(r.stack)}`,
    `- Status: ${r.status}`,
    `- Submissions: ${r.submissions} (first ${when(r.createdAt)}, latest ${when(r.updatedAt)})`,
  ].filter(Boolean) as string[];

  const attribution = [
    r.source ? `- Trigger: ${r.source}` : null,
    r.referrer ? `- Referrer: ${r.referrer}` : null,
    utm ? `- UTM: ${utm}` : null,
  ].filter(Boolean) as string[];

  const content = [
    `*Inbound access request from tryeverstock.com, received ${when(r.createdAt)}. Synced automatically by the landing site; the status is edited in the landing site's Convex dashboard and this page mirrors the latest submission.*`,
    ``,
    `**${r.name}** at **${r.company}** ${r.source === "book-demo" ? "booked a demo" : r.source === "waitlist" ? "joined the waitlist" : "asked for founding-partner access"}.`,
    ``,
    ...facts,
    ...(r.note ? [``, `## What they want off their desk`, ``, `> ${r.note.replace(/\r?\n/g, "\n> ")}`] : []),
    ...(attribution.length ? [``, `## Attribution`, ``, ...attribution] : []),
    ``,
    `Prospect for [[companies/everstock]].`,
  ].join("\n");

  return {
    slug: `people/${person}-${org}`,
    title: `${r.name} · ${r.company}`,
    type: "crm",
    tags: [
      "inbound",
      "access-request",
      ...(r.source === "book-demo" ? ["book-demo"] : []),
      ...(r.waitlist || r.source === "waitlist" ? ["waitlist"] : []),
      // older rows came from the founding-partner form itself; newer ones answer the question
      ...(r.foundingInterest ?? (r.source !== "book-demo" && r.source !== "waitlist") ? ["founding-partner"] : []),
      r.stack,
      `status-${r.status}`,
    ],
    content,
    edges: [{ toSlug: "companies/everstock", edgeType: "prospect_for" }],
  };
}

/** One JSON-RPC `tools/call remember` against the brain's MCP endpoint (stateless, no session). */
async function remember(token: string, page: Page): Promise<void> {
  const res = await fetch(process.env.EVERBRAIN_MCP_URL ?? DEFAULT_URL, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "x-everbrain-actor": process.env.EVERBRAIN_ACTOR ?? "luca",
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
    },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "remember", arguments: page } }),
  });
  const raw = await res.text();
  if (!res.ok) throw new Error(`eBRAiN ${res.status} for ${page.slug}: ${raw.slice(0, 300)}`);
  const msg = parseRpc(raw);
  const err = msg?.error?.message ?? (msg?.result?.isError ? msg.result.content?.map((c) => c.text).join(" ") : null);
  if (err) throw new Error(`eBRAiN rejected ${page.slug}: ${err}`);
  console.log(`eBRAiN saved ${page.slug}`);
}

type Rpc = { result?: { isError?: boolean; content?: { text?: string }[] }; error?: { message?: string } };

/** The endpoint answers as JSON or as a one-message SSE stream; accept both. */
function parseRpc(raw: string): Rpc | null {
  const text = raw.trimStart().startsWith("{")
    ? raw
    : raw
        .split(/\r?\n/)
        .filter((l) => l.startsWith("data:"))
        .map((l) => l.slice(5).trim())
        .pop();
  if (!text) return null;
  try {
    return JSON.parse(text) as Rpc;
  } catch {
    return null;
  }
}
