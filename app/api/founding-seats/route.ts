import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

/**
 * The founding seat counter, from real claims only (Convex `accessRequests.seats`).
 * `claimed` is null until there are FOUNDING_COUNTER_MIN claims (Convex env, default 10);
 * the page then says "100 founding seats" with no number. Cached a minute at the edge.
 */
export async function GET() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  let seats: { total: number; claimed: number | null } = { total: 100, claimed: null };
  if (url) {
    try {
      seats = await new ConvexHttpClient(url).query(api.accessRequests.seats, {});
    } catch (e) {
      console.error("founding-seats failed", e);
    }
  }
  return Response.json(seats, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
}
