import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { fail, readBody, str } from "@/lib/intake";

/**
 * The success screen's optional "Help us set you up (30 seconds)" step: biggest headache
 * and what they use today, recorded on the claim the form just made (its id and email
 * must match) and sent to eBRAiN as a spot_claim_update on that claim.
 */
export async function POST(req: Request) {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) return fail("Requests aren't being accepted right now.", 503);
  const b = await readBody(req);
  if (!b) return fail("Bad request.");
  const id = str(b, "id", 64);
  const email = str(b, "email", 200).toLowerCase();
  const submission = Number(b.submission);
  const headache = str(b, "headache", 40) || undefined;
  const usesToday = str(b, "usesToday", 40) || undefined;
  if (!id || !email || !Number.isFinite(submission) || (!headache && !usesToday)) return fail("Bad request.");
  try {
    const client = new ConvexHttpClient(url);
    const recorded = await client.mutation(api.accessRequests.setup, { id, email, submission, headache, usesToday });
    return Response.json({ ok: true, recorded });
  } catch (e) {
    console.error("claim setup failed", e);
    return fail("Something went wrong on our side. Please try again.", 502);
  }
}
