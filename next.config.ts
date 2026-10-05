import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    // the v3 Journey page was removed (2026-10-02); old links land on the home page
    return [{ source: "/journey", destination: "/", permanent: true }];
  },
  async headers() {
    return [
      {
        // the hologram clips are referenced, not re-fetched: a week in the browser/edge
        // cache, refreshed in the background after that
        source: "/videos/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }],
      },
    ];
  },
};

export default nextConfig;
