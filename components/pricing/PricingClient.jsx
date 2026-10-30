"use client";

import { useSyncExternalStore } from "react";
import DcPage from "./DcPage";

// Client-only, like the home page: the design's logic reads window/document while
// rendering. Imported statically so its chunk downloads alongside the framework.
const subscribe = () => () => {};

// `fallback` is the server-rendered text of the page (components/dc/SeoFallback.tsx), shown
// until the design mounts
/** @param {{ fallback?: import("react").ReactNode }} props */
export default function PricingClient({ fallback = null }) {
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  return mounted ? <DcPage /> : fallback;
}
