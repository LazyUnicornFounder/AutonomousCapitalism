import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

type Props = { summary: string };

export const SummaryScene: React.FC<Props> = ({ summary }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Split into sentences for staggered reveal
  const sentences = summary.split(/(?<=\.)\s+/).filter(Boolean);

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "0 250px",
      }}
    >
      {/* Label */}
      <div
        style={{
          fontFamily: "sans-serif",
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: 6,
          color: "#0099ff",
          marginBottom: 35,
          opacity: interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        THE BRIEFING
      </div>

      {/* Sentences staggered */}
      {sentences.map((sentence, i) => {
        const delay = 15 + i * 30;
        const s = spring({ frame: frame - delay, fps, config: { damping: 22, stiffness: 80 } });
        const opacity = interpolate(s, [0, 1], [0, 1]);
        const x = interpolate(s, [0, 1], [60, 0]);

        return (
          <div
            key={i}
            style={{
              fontFamily: "sans-serif",
              fontSize: 32,
              fontWeight: 400,
              color: "rgba(235,235,235,0.9)",
              lineHeight: 1.6,
              maxWidth: 1200,
              opacity,
              transform: `translateX(${x}px)`,
              marginBottom: 15,
            }}
          >
            {sentence}
          </div>
        );
      })}

      {/* Left accent bar */}
      <div
        style={{
          position: "absolute",
          left: 200,
          top: "30%",
          width: 3,
          height: interpolate(
            spring({ frame: frame - 10, fps, config: { damping: 30 } }),
            [0, 1],
            [0, 400]
          ),
          backgroundColor: "#0099ff",
        }}
      />
    </AbsoluteFill>
  );
};
