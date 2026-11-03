import { ConvexHttpClient } from "convex/browser";
import { ConvexError } from "convex/values";
import { api } from "@/convex/_generated/api";
import { CHANNELS, CLAIM_TEAM, EMAIL } from "@/convex/forms";
import { context, fail, isBot, readBody, str } from "@/lib/intake";

const MIN_FILL_MS = 2500; // a person cannot read and fill the form faster than this

/**
 * "Claim your spot" (kind "claim") and the free Stock Plan (kind "stock-plan").
 * Bot checks first (honeypot, minimum fill time: a fake success), then Convex, which
 * validates again, saves one row per email and queues the event for eBRAiN.
 * Answers { ok, claim: { id, submission }, planFit } so the success screen's optional
 * set-up step can update the same claim (/api/request-access/setup).
 */
export async function POST(req: Request) {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) return fail("Requests aren't being accepted right now.", 503);
  const b = await readBody(req);
  if (!b) return fail("Bad request.");
  if (isBot(b, MIN_FILL_MS)) return Response.json({ ok: true });

  const kind = str(b, "kind", 20) === "stock-plan" ? "stock-plan" : "claim";
  const name = str(b, "name", 120);
  const email = str(b, "email", 200).toLowerCase();
  if (!name) return fail(kind === "claim" ? "Add your first name." : "Add your name.");
  if (!EMAIL.test(email)) return fail("That email address doesn't look right.");
  const sells = str(b, "sells", 300);
  const teamSize = str(b, "teamSize", 20);
  if (kind === "claim" && !sells) return fail("Tell us what you sell.");
  if (kind === "claim" && !(teamSize in CLAIM_TEAM)) return fail("Pick how many people handle buying and stock.");
  const channels = Array.isArray(b.channels) ? (b.channels as unknown[]).filter((c): c is string => typeof c === "string" && c in CHANNELS) : [];

  try {
    const client = new ConvexHttpClient(url);
    const res = await client.mutation(api.accessRequests.submit, {
      kind,
      name,
      email,
      sells: sells || undefined,
      teamSize: teamSize || undefined,
      channels: channels.length ? channels : undefined,
      website: str(b, "website", 300) || undefined,
      phone: str(b, "phone", 40) || undefined,
      smsConsent: b.smsConsent === true,
      heardFrom: str(b, "heardFrom", 120) || undefined,
      note: str(b, "note", 1000) || undefined,
      ...context(req, b),
    });
    return Response.json({ ok: true, claim: { id: res.id, submission: res.submission }, planFit: res.planFit ?? null });
  } catch (e) {
    if (e instanceof ConvexError) return fail(String(e.data));
    console.error("request-access failed", e);
    return fail("Something went wrong on our side. Please try again.", 502);
  }
}
