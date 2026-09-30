import type { Metadata } from "next";
import V3Client from "@/components/v3/V3Client";
import "@/components/v3/generated/helmet.css";
import "@/components/v3/generated/pseudo.css";
import "@/components/dc/dc-host.css";

export const metadata: Metadata = {
  title: "The journey · Everstock",
  alternates: { canonical: "/journey" },
};

/* The v3 full-scroll journey (Everstock v3.dc.html), served unchanged as its own page
   so the v4 nav's "Journey" link resolves. It gets reworked later. Links between / and
   /journey are plain anchors (full page loads), so each page only ever has its own
   design CSS. */
export default function Journey() {
  return <V3Client />;
}
