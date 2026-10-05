import { ConvexHttpClient } from "convex/browser";
import { ConvexError } from "convex/values";
import { api } from "@/convex/_generated/api";

const KINDS = new Set(["feedback", "suggestion", "bug"]);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_FILL_MS = 2000; // nobody types a message faster than this

/**
 * The footer's "Send feedback". Same bot checks as /api/request-access (honeypot,
 * minimum fill time), both answered with a fake success so a scraper learns nothing.
 */
export async function POST(req: Request) {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) return Response.json({ error: "Feedback isn't being accepted right now." }, { status: 503 });

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Bad request." }, { status: 400 });
  }
  const str = (k: string, max: number) => (typeof body[k] === "string" ? (body[k] as string).trim().slice(0, max) : "");

  if (str("website", 200)) return Response.json({ ok: true }); // honeypot
  const elapsed = Number(body.elapsed);
  if (!Number.isFinite(elapsed) || elapsed < MIN_FILL_MS) return Response.json({ ok: true });

  const kind = KINDS.has(str("kind", 20)) ? str("kind", 20) : "feedback";
  const message = str("message", 4000);
  const email = str("email", 200).toLowerCase() || undefined;
  if (message.length < 3) return Response.json({ error: "Add a few words first." }, { status: 400 });
  if (email && !EMAIL.test(email)) return Response.json({ error: "That email address doesn't look right." }, { status: 400 });

  try {
    const client = new ConvexHttpClient(url);
    await client.mutation(api.feedback.submit, {
      kind,
      message,
      email,
      page: str("page", 200) || undefined,
      userAgent: req.headers.get("user-agent")?.slice(0, 300) || undefined,
    });
    return Response.json({ ok: true });
  } catch (e) {
    if (e instanceof ConvexError) return Response.json({ error: String(e.data) }, { status: 400 });
    console.error("feedback failed", e);
    return Response.json({ error: "Something went wrong on our side. Please try again." }, { status: 502 });
  }
}
