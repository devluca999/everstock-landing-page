import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

/**
 * The questions the forms ask after they are sent: "the waitlist too?" (Book a demo) and
 * "the founding partner program?" (both). Convex only patches a row that already exists
 * for this email, so there is nothing here for a bot to create; unknown emails are a
 * silent no-op.
 */
export async function POST(req: Request) {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) return Response.json({ error: "Requests aren't being accepted right now." }, { status: 503 });

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Bad request." }, { status: 400 });
  }
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase().slice(0, 200) : "";
  const flag = (k: string) => (typeof body[k] === "boolean" ? (body[k] as boolean) : undefined);
  const waitlist = flag("waitlist");
  const foundingInterest = flag("foundingInterest");
  if (!email || (waitlist === undefined && foundingInterest === undefined)) {
    return Response.json({ error: "Bad request." }, { status: 400 });
  }

  try {
    const client = new ConvexHttpClient(url);
    const recorded = await client.mutation(api.accessRequests.answer, { email, waitlist, foundingInterest });
    return Response.json({ ok: true, recorded });
  } catch (e) {
    console.error("request-access answer failed", e);
    return Response.json({ error: "Something went wrong on our side. Please try again." }, { status: 502 });
  }
}
