import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Everstock",
    short_name: "Everstock",
    description:
      "Agentic procurement infrastructure for mid-market distributors.",
    start_url: "/",
    display: "standalone",
    background_color: "#16171B",
    theme_color: "#16171B",
    icons: [
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any" },
    ],
  };
}
