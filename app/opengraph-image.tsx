import { ImageResponse } from "next/og";

export const alt = "TruOrigin — Product Authenticity & Transparency Platform";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #081b12 0%, #123a25 55%, #1a7a44 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
          }}
        >
          <div
            style={{
              width: 14,
              height: 96,
              borderRadius: 8,
              background: "#c8f542",
            }}
          />
          <div style={{ display: "flex", fontSize: 108, fontWeight: 700, color: "#ffffff", letterSpacing: -2 }}>
            TruOrigin
          </div>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 30,
            fontWeight: 500,
            color: "#c8f542",
            letterSpacing: 1,
          }}
        >
          Product Claims, Made Clear
        </div>
      </div>
    ),
    { ...size },
  );
}
