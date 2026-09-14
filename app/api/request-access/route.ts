import { ConvexHttpClient } from "convex/browser";
import { ConvexError } from "convex/values";
import { api } from "@/convex/_generated/api";

const STACKS = new Set(["netsuite", "epicor-p21", "sap-b1", "spreadsheets", "other"]);
const SOURCES = new Set(["hero", "nav", "contract", "final", "sheet", "hash", "other"]);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_FILL_MS = 2500; // a person cannot read and fill four fields faster than this

/**
 * Request-access intake. Bot checks happen here (honeypot, minimum fill time) so the
 * database never sees them; both return a fake success so a scraper learns nothing.
 * Real submissions go to Convex, which validates again and stores one row per email.
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
  const str = (k: string, max: number) => (typeof body[k] === "string" ? (body[k] as string).trim().slice(0, max) : "");

  if (str("website", 200)) return Response.json({ ok: true }); // honeypot
  const elapsed = Number(body.elapsed);
  if (!Number.isFinite(elapsed) || elapsed < MIN_FILL_MS) return Response.json({ ok: true });

  const name = str("name", 120);
  const email = str("email", 200).toLowerCase();
  const company = str("company", 160);
  const stack = STACKS.has(str("stack", 40)) ? str("stack", 40) : "other";
  if (name.length < 2) return Response.json({ error: "Please add your name." }, { status: 400 });
  if (!EMAIL.test(email)) return Response.json({ error: "That email address doesn't look right." }, { status: 400 });
  if (company.length < 2) return Response.json({ error: "Please add your company." }, { status: 400 });

  const phone = str("phone", 40) || undefined;
  const note = str("note", 1000) || undefined;
  const source = SOURCES.has(str("source", 20)) ? str("source", 20) : "other";
  const referrer = str("referrer", 300) || undefined;
  const utmRaw = body.utm;
  const utm =
    utmRaw && typeof utmRaw === "object"
      ? Object.fromEntries(
          Object.entries(utmRaw as Record<string, unknown>)
            .filter(([k, v]) => /^utm_[a-z_]{1,20}$/.test(k) && typeof v === "string")
            .map(([k, v]) => [k, (v as string).slice(0, 120)])
        )
      : undefined;
  const userAgent = req.headers.get("user-agent")?.slice(0, 300) || undefined;

  try {
    const client = new ConvexHttpClient(url);
    const res = await client.mutation(api.accessRequests.submit, {
      name,
      email,
      company,
      stack,
      phone,
      note,
      source,
      referrer,
      utm: utm && Object.keys(utm).length ? utm : undefined,
      userAgent,
    });
    return Response.json({ ok: true, repeat: res.repeat });
  } catch (e) {
    if (e instanceof ConvexError) return Response.json({ error: String(e.data) }, { status: 400 });
    console.error("request-access failed", e);
    return Response.json({ error: "Something went wrong on our side. Please try again." }, { status: 502 });
  }
}
