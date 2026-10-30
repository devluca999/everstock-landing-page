import V9Client from "@/components/v9/V9Client";
import "@/components/v9/generated/helmet.css";
import "@/components/v9/generated/pseudo.css";
import "@/components/dc/dc-host.css";
import SeoFallback, { type SeoSection } from "@/components/dc/SeoFallback";
import seo from "@/components/v9/generated/seo.json";

/* Everstock v9, ported from Claude Design ("Everstock site" → Everstock v9.dc.html).
   The source of truth is mockup/v9/; regenerate components/v9/generated with
   `npm run port` after the design changes. */
export default function Home() {
  return <V9Client fallback={<SeoFallback sections={seo as SeoSection[]} />} />;
}
