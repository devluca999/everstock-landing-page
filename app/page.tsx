import V8Client from "@/components/v8/V8Client";
import "@/components/v8/generated/helmet.css";
import "@/components/v8/generated/pseudo.css";
import "@/components/dc/dc-host.css";

/* Everstock v8, ported from Claude Design ("Everstock site" → Everstock v8.dc.html).
   The source of truth is mockup/v8/; regenerate components/v8/generated with
   `npm run port` after the design changes. */
export default function Home() {
  return <V8Client />;
}
