import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

type Props = { date: string };

export const IntroScene: React.FC<Props> = ({ date }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // "AUTONOMOUS DISPATCH" label slides up
  const labelY = interpolate(frame, [15, 45], [40, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const labelOpacity = interpolate(frame, [15, 35], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  // Blue accent line grows
  const lineWidth = spring({ frame: frame - 25, fps, config: { damping: 20, stiffness: 100 } });

  // Date fades in
  const dateOpacity = interpolate(frame, [50, 70], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const dateY = interpolate(frame, [50, 70], [20, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  // Subtle pulse on the dot
  const dotScale = 1 + Math.sin(frame * 0.15) * 0.15;

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Pulsing dot */}
      <div
        style={{
          width: 12,
          height: 12,
          borderRadius: "50%",
          backgroundColor: "#0099ff",
          transform: `scale(${dotScale})`,
          marginBottom: 30,
          boxShadow: "0 0 20px rgba(0,153,255,0.5)",
        }}
      />

      {/* AUTONOMOUS DISPATCH label */}
      <div
        style={{
          fontFamily: "sans-serif",
          fontSize: 18,
          fontWeight: 900,
          letterSpacing: 12,
          color: "#0099ff",
          opacity: labelOpacity,
          transform: `translateY(${labelY}px)`,
          marginBottom: 20,
        }}
      >
        AUTONOMOUS DISPATCH
      </div>

      {/* Blue line */}
      <div
        style={{
          width: interpolate(lineWidth, [0, 1], [0, 200]),
          height: 2,
          backgroundColor: "#0099ff",
          marginBottom: 25,
        }}
      />

      {/* Date */}
      <div
        style={{
          fontFamily: "sans-serif",
          fontSize: 16,
          letterSpacing: 4,
          color: "rgba(255,255,255,0.5)",
          opacity: dateOpacity,
          transform: `translateY(${dateY}px)`,
        }}
      >
        {date.toUpperCase()}
      </div>
    </AbsoluteFill>
  );
};
