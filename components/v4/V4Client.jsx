"use client";

import dynamic from "next/dynamic";

// The design's logic reads window/document while rendering (renderVals), exactly as
// it does in the dc-runtime, so the page renders on the client only.
const DcPage = dynamic(() => import("./DcPage"), { ssr: false });

export default function V4Client() {
  return <DcPage />;
}
