"use client";

import { useSyncExternalStore } from "react";
import DcPage from "./DcPage";

// Client-only, like the home page: the design's logic reads window/document while
// rendering. Imported statically so its chunk downloads alongside the framework.
const subscribe = () => () => {};

export default function PricingClient() {
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  return mounted ? <DcPage /> : null;
}
