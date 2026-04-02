import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "edge";

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #a855f7, #6366f1, #3b82f6)",
          borderRadius: "8px",
          color: "white",
          fontFamily: "sans-serif",
          fontSize: 22,
          fontWeight: 800,
          letterSpacing: "-0.05em",
        }}
      >
        T
      </div>
    ),
    {
      ...size,
    }
  );
}
