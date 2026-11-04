import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

/**
 * The Cal.com webhook (Cal.com → event type → Webhooks: subscriber URL
 * https://tryeverstock.com/api/demo-booked, triggers Booking created / rescheduled /
 * cancelled, secret = CAL_WEBHOOK_SECRET). The raw body and the X-Cal-Signature-256 header
 * go to Convex `demos.fromCal`, which checks the signature with CAL_WEBHOOK_SECRET in the
 * Convex env (the secret is only there) before anything is saved.
 */
export async function POST(req: Request) {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) return Response.json({ error: "not configured" }, { status: 503 });
  const body = await req.text();
  if (body.length > 200_000) return Response.json({ error: "body too large" }, { status: 413 });
  const signature = req.headers.get("x-cal-signature-256") ?? "";
  try {
    const client = new ConvexHttpClient(url);
    const r = await client.action(api.demos.fromCal, { body, signature });
    return Response.json({ ok: r.status < 300, message: r.message }, { status: r.status });
  } catch (e) {
    console.error("demo-booked failed", e);
    return Response.json({ error: "failed" }, { status: 500 });
  }
}
