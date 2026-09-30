import V4Client from "@/components/v4/V4Client";
import "@/components/v4/generated/helmet.css";
import "@/components/v4/generated/pseudo.css";
import "@/components/dc/dc-host.css";

/* Everstock v4, ported from Claude Design ("Everstock site" → Everstock v4.dc.html).
   The source of truth is mockup/v4/; regenerate components/v4/generated with
   `npm run port:v4` after the design changes. */
export default function Home() {
  return <V4Client />;
}
