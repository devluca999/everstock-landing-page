"use client";

import { useSyncExternalStore } from "react";
import DcPage from "./DcPage";

// The design's logic reads window/document while rendering (renderVals), exactly as it
// does in the dc-runtime, so the page renders on the client only. It is imported
// statically (not next/dynamic) so its chunk downloads alongside the framework instead
// of after hydration; it simply renders nothing on the server.
const subscribe = () => () => {};

export default function V5Client() {
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  return mounted ? <DcPage /> : null;
}
