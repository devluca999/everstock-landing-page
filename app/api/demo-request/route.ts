import { ConvexHttpClient } from "convex/browser";
import { ConvexError } from "convex/values";
import { api } from "@/convex/_generated/api";
import { EMAIL } from "@/convex/forms";
import { context, fail, isBot, readBody, str } from "@/lib/intake";

const MIN_FILL_MS = 3000;

/**
 * "Book a demo" while there is no booking link (BOOKING_URL unset): the same questions
 * as the Cal.com booking, plus best times. Same bot checks as the claim form.
 */
export async function POST(req: Request) {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) return fail("Requests aren't being accepted right now.", 503);
  const b = await readBody(req);
  if (!b) return fail("Bad request.");
  if (isBot(b, MIN_FILL_MS)) return Response.json({ ok: true });
  const email = str(b, "email", 200).toLowerCase();
  if (!EMAIL.test(email)) return fail("That work email doesn't look right.");
  try {
    const client = new ConvexHttpClient(url);
    await client.mutation(api.demos.request, {
      name: str(b, "name", 120),
      email,
      company: str(b, "company", 160),
      role: str(b, "role", 40),
      teamSize: str(b, "teamSize", 20),
      runsOn: str(b, "runsOn", 40),
      wants: str(b, "wants", 1000) || undefined,
      phone: str(b, "phone", 40) || undefined,
      website: str(b, "website", 300) || undefined,
      bestTimes: str(b, "bestTimes", 300) || undefined,
      ...context(req, b),
    });
    return Response.json({ ok: true });
  } catch (e) {
    if (e instanceof ConvexError) return fail(String(e.data));
    console.error("demo-request failed", e);
    return fail("Something went wrong on our side. Please try again.", 502);
  }
}
