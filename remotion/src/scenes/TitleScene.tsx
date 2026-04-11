import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

type Props = { title: string };

export const TitleScene: React.FC<Props> = ({ title }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const words = title.split(" ");

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 200px",
      }}
    >
      {/* Small label */}
      <div
        style={{
          fontFamily: "sans-serif",
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: 8,
          color: "#0099ff",
          marginBottom: 40,
          opacity: interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        TODAY&apos;S DISPATCH
      </div>

      {/* Title with staggered word reveal */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "0 20px",
          lineHeight: 1.15,
        }}
      >
        {words.map((word, i) => {
          const delay = 10 + i * 6;
          const s = spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 120 } });
          const opacity = interpolate(s, [0, 1], [0, 1]);
          const y = interpolate(s, [0, 1], [50, 0]);

          // Make "autonomous" blue if present
          const isAutonomous = word.toLowerCase() === "autonomous";

          return (
            <span
              key={i}
              style={{
                fontFamily: "sans-serif",
                fontSize: 82,
                fontWeight: 900,
                color: isAutonomous ? "#0099ff" : "#ebebeb",
                textTransform: "uppercase",
                letterSpacing: 3,
                opacity,
                transform: `translateY(${y}px)`,
                display: "inline-block",
              }}
            >
              {word}
            </span>
          );
        })}
      </div>

      {/* Underline accent */}
      <div
        style={{
          width: interpolate(
            spring({ frame: frame - 40, fps, config: { damping: 25 } }),
            [0, 1],
            [0, 500]
          ),
          height: 3,
          backgroundColor: "#0099ff",
          marginTop: 35,
        }}
      />
    </AbsoluteFill>
  );
};
