/**
 * Shared by the form routes (/api/request-access, /api/demo-request): body parsing, the
 * bot checks and the silent context. A bot (honeypot filled, or sent faster than a person
 * can fill the form) gets a fake success and never reaches the database.
 */

/** The honeypot's field name. Not "website": the claim form asks for a real website. */
export const HONEYPOT = "fax";

export type Body = Record<string, unknown>;

export async function readBody(req: Request): Promise<Body | null> {
  try {
    const b = (await req.json()) as unknown;
    return b && typeof b === "object" && !Array.isArray(b) ? (b as Body) : null;
  } catch {
    return null;
  }
}

export const str = (b: Body, k: string, max: number) => (typeof b[k] === "string" ? (b[k] as string).trim().slice(0, max) : "");

/** True when the submission is a bot's: answer with a fake success. */
export function isBot(b: Body, minFillMs: number) {
  if (str(b, HONEYPOT, 200)) return true;
  const elapsed = Number(b.elapsed);
  return !Number.isFinite(elapsed) || elapsed < minFillMs;
}

/** UTMs, referrer, page, CTA, ref code (the es_ref cookie, or the body's ref) and user agent. */
export function context(req: Request, b: Body) {
  const utmRaw = b.utm;
  const utm =
    utmRaw && typeof utmRaw === "object"
      ? Object.fromEntries(
          Object.entries(utmRaw as Record<string, unknown>)
            .filter(([k, v]) => /^utm_[a-z_]{1,20}$/.test(k) && typeof v === "string" && v)
            .map(([k, v]) => [k, (v as string).slice(0, 120)])
        )
      : {};
  const cookieRef = req.headers.get("cookie")?.match(/(?:^|;\s*)es_ref=([A-Za-z0-9-]{3,24})/)?.[1];
  const bodyRef = /^[A-Za-z0-9-]{3,24}$/.test(str(b, "ref", 24)) ? str(b, "ref", 24) : "";
  return {
    page: str(b, "page", 200) || undefined,
    cta: str(b, "cta", 60) || undefined,
    referrer: str(b, "referrer", 300) || undefined,
    utm: Object.keys(utm).length ? utm : undefined,
    refCode: cookieRef || bodyRef || undefined,
    userAgent: req.headers.get("user-agent")?.slice(0, 300) || undefined,
  };
}

export const fail = (error: string, status = 400) => Response.json({ error }, { status });
