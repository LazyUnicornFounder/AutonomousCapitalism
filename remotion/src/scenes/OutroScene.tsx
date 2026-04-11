import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

export const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ frame: frame - 10, fps, config: { damping: 15, stiffness: 100 } });
  const taglineOpacity = interpolate(frame, [40, 60], [0, 1], { extrapolateRight: "clamp" });
  const taglineY = interpolate(frame, [40, 60], [15, 0], { extrapolateRight: "clamp" });

  // Fade out at the end
  const fadeOut = interpolate(frame, [110, 140], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: fadeOut,
      }}
    >
      {/* Logo text */}
      <div
        style={{
          fontFamily: "sans-serif",
          fontSize: 52,
          fontWeight: 900,
          letterSpacing: 2,
          transform: `scale(${interpolate(logoScale, [0, 1], [0.8, 1])})`,
          opacity: interpolate(logoScale, [0, 1], [0, 1]),
        }}
      >
        <span style={{ color: "#0099ff" }}>Autonomous</span>
        <span style={{ color: "#ebebeb" }}> Capitalism</span>
      </div>

      {/* Tagline */}
      <div
        style={{
          fontFamily: "sans-serif",
          fontSize: 18,
          letterSpacing: 4,
          color: "rgba(255,255,255,0.45)",
          marginTop: 20,
          opacity: taglineOpacity,
          transform: `translateY(${taglineY}px)`,
        }}
      >
        THE AUTONOMOUS REVOLUTION. DELIVERED DAILY.
      </div>

      {/* Subscribe CTA */}
      <div
        style={{
          marginTop: 40,
          padding: "12px 40px",
          border: "1px solid rgba(0,153,255,0.4)",
          fontFamily: "sans-serif",
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: 5,
          color: "#0099ff",
          opacity: interpolate(frame, [60, 80], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        AUTONOMOUSCAPITALISM.COM
      </div>
    </AbsoluteFill>
  );
};
