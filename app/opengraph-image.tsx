import { ImageResponse } from "next/og";

export const alt =
  "Everstock — Agentic procurement for mid-market distributors";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "radial-gradient(120% 120% at 50% 0%, #1E2026 0%, #16171B 60%)",
          padding: "72px 80px",
        }}
      >
        <div
          style={{
            fontSize: 22,
            letterSpacing: "0.28em",
            color: "#5B9BFF",
            textTransform: "uppercase",
          }}
        >
          Agentic procurement, deterministic trust
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div
            style={{
              fontSize: 132,
              fontWeight: 700,
              letterSpacing: "-0.03em",
              color: "#F2F5F9",
            }}
          >
            EVERSTOCK
          </div>
          <div
            style={{
              fontSize: 38,
              lineHeight: 1.3,
              color: "#A7ADB6",
              maxWidth: 900,
            }}
          >
            Supply-chain intelligence, at your command.
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 24,
            color: "#7A808A",
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 12,
              background: "#0B5FFF",
            }}
          />
          Agentic procurement infrastructure for mid-market distributors
        </div>
      </div>
    ),
    { ...size }
  );
}
