import V3Client from "@/components/v3/V3Client";
import "@/components/v3/generated/helmet.css";
import "@/components/v3/generated/pseudo.css";
import "@/components/v3/dc-host.css";

/* Everstock v3, ported from Claude Design ("Everstock site" → Everstock v3.dc.html).
   The source of truth is mockup/v3/; regenerate components/v3/generated with
   `npm run port:v3` after the design changes. */
export default function Home() {
  return <V3Client />;
}
