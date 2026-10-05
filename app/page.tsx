import V5Client from "@/components/v5/V5Client";
import "@/components/v5/generated/helmet.css";
import "@/components/v5/generated/pseudo.css";
import "@/components/dc/dc-host.css";

/* Everstock v5, ported from Claude Design ("Everstock site" → Everstock v5.dc.html).
   The source of truth is mockup/v5/; regenerate components/v5/generated with
   `npm run port` after the design changes. */
export default function Home() {
  return <V5Client />;
}
