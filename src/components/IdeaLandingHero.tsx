import { Link } from "react-router-dom";
import { format } from "date-fns";
import EmailCapture from "@/components/EmailCapture";

type Idea = {
  name: string;
  description: string;
  links: { label: string; url: string }[];
  date: string;
  postId: string;
};

// Deterministic hash from a string -> int
const hash = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
};

// Curated bespoke palettes — each visually distinct
const PALETTES = [
  // 0 — Electric blue (brand)
  { bg: "#000000", fg: "#ffffff", accent: "#3b82f6", accent2: "#60a5fa", muted: "#a3a3a3" },
  // 1 — Acid green terminal
  { bg: "#020a05", fg: "#d6ffe0", accent: "#00ff88", accent2: "#00d27a", muted: "#5a8a6a" },
  // 2 — Crimson editorial
  { bg: "#0a0000", fg: "#fff5f0", accent: "#ff2e4d", accent2: "#ff7a90", muted: "#a07070" },
  // 3 — Amber retro
  { bg: "#0d0700", fg: "#fff4e0", accent: "#ffb000", accent2: "#ffd166", muted: "#9a8060" },
  // 4 — Magenta cyberpunk
  { bg: "#0a000a", fg: "#fff0ff", accent: "#ff00aa", accent2: "#a855f7", muted: "#9a7090" },
  // 5 — Ice cyan
  { bg: "#000a10", fg: "#e0fbff", accent: "#00e0ff", accent2: "#7dd3fc", muted: "#6a9aa8" },
  // 6 — Bone minimal (light)
  { bg: "#f5f1ea", fg: "#0a0a0a", accent: "#000000", accent2: "#444444", muted: "#777777" },
  // 7 — Sunset gradient
  { bg: "#100408", fg: "#fff0e8", accent: "#ff5e3a", accent2: "#ffb84d", muted: "#a07a70" },
  // 8 — Lime brutalist
  { bg: "#0a0a0a", fg: "#ffffff", accent: "#c6ff00", accent2: "#88ff00", muted: "#888888" },
  // 9 — Royal violet
  { bg: "#06000f", fg: "#f0e8ff", accent: "#8b5cf6", accent2: "#c084fc", muted: "#7a6a9a" },
];

// Display font choices (loaded from Google via index.html) — fallback to system serif/sans
const FONT_PAIRS = [
  { display: "'Playfair Display', serif", body: "'Inter', system-ui, sans-serif" },
  { display: "'Space Grotesk', system-ui, sans-serif", body: "'Inter', system-ui, sans-serif" },
  { display: "'JetBrains Mono', monospace", body: "'JetBrains Mono', monospace" },
  { display: "'Bebas Neue', Impact, sans-serif", body: "'Inter', system-ui, sans-serif" },
  { display: "'Archivo Black', sans-serif", body: "'Inter', system-ui, sans-serif" },
  { display: "Georgia, 'Times New Roman', serif", body: "Georgia, serif" },
];

const LAYOUTS = ["centered", "split", "asymmetric-left", "asymmetric-right", "stacked-bold"] as const;
const BG_PATTERNS = ["grid", "dots", "blob", "noise", "lines", "none"] as const;

const IdeaLandingHero = ({ idea, index }: { idea: Idea; index: number }) => {
  const seed = hash(idea.name + index);
  const palette = PALETTES[seed % PALETTES.length];
  const fonts = FONT_PAIRS[(seed >> 3) % FONT_PAIRS.length];
  const layout = LAYOUTS[(seed >> 5) % LAYOUTS.length];
  const pattern = BG_PATTERNS[(seed >> 7) % BG_PATTERNS.length];
  const isLight = palette.bg.startsWith("#f") || palette.bg.startsWith("#e");

  // Subheadline = first sentence of description
  const subheadline = idea.description.split(/(?<=[.!?])\s+/)[0] || idea.description;

  // Background pattern style
  const patternStyles: Record<string, React.CSSProperties> = {
    grid: {
      backgroundImage: `linear-gradient(${palette.accent}15 1px, transparent 1px), linear-gradient(90deg, ${palette.accent}15 1px, transparent 1px)`,
      backgroundSize: "48px 48px",
    },
    dots: {
      backgroundImage: `radial-gradient(${palette.accent}30 1.5px, transparent 1.5px)`,
      backgroundSize: "32px 32px",
    },
    lines: {
      backgroundImage: `repeating-linear-gradient(45deg, ${palette.accent}10 0, ${palette.accent}10 1px, transparent 1px, transparent 16px)`,
    },
    blob: {},
    noise: {
      backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence baseFrequency='0.9' /></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.15'/></svg>")`,
    },
    none: {},
  };

  const accentBadge = (
    <div
      className="inline-flex items-center gap-2 mb-6 px-3 py-1 text-xs tracking-[0.2em] uppercase"
      style={{
        border: `1px solid ${palette.accent}`,
        color: palette.accent,
        fontFamily: fonts.body,
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: palette.accent }} />
      Concept #{String(index + 1).padStart(2, "0")} · Pre-launch
    </div>
  );

  const headline = (
    <h2
      className="font-black leading-[0.95] tracking-tight mb-5"
      style={{
        fontFamily: fonts.display,
        color: palette.fg,
        fontSize: "clamp(2.25rem, 6vw, 4.5rem)",
      }}
    >
      {idea.name}
    </h2>
  );

  const sub = (
    <p
      className="mb-8 leading-relaxed max-w-xl"
      style={{
        fontFamily: fonts.body,
        color: palette.muted,
        fontSize: "clamp(1rem, 1.5vw, 1.2rem)",
      }}
    >
      {subheadline}
    </p>
  );

  const meta = (
    <div
      className="mt-8 pt-6 flex items-center gap-3 text-xs flex-wrap"
      style={{ borderTop: `1px solid ${palette.muted}30`, color: palette.muted, fontFamily: fonts.body }}
    >
      <span>{format(new Date(idea.date), "MMM d, yyyy")}</span>
      <span>·</span>
      <Link
        to={`/briefings/${idea.postId}`}
        className="hover:underline"
        style={{ color: palette.accent }}
      >
        Source briefing →
      </Link>
      {idea.links.slice(0, 1).map((l, i) => (
        <span key={i} className="flex items-center gap-2">
          <span>·</span>
          <a href={l.url} target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: palette.accent }}>
            {l.label}
          </a>
        </span>
      ))}
    </div>
  );

  // Custom email form styled with this idea's palette
  const SignupForm = (
    <div className="max-w-md">
      <p
        className="text-xs tracking-[0.25em] uppercase mb-3"
        style={{ color: palette.accent, fontFamily: fonts.body }}
      >
        Get notified at launch
      </p>
      <div
        style={{
          ["--idea-accent" as string]: palette.accent,
          ["--idea-fg" as string]: palette.fg,
          ["--idea-bg" as string]: palette.bg,
          ["--idea-muted" as string]: palette.muted,
        } as React.CSSProperties}
        className="idea-signup-wrapper"
      >
        <EmailCapture variant="compact" />
      </div>
      <style>{`
        .idea-signup-wrapper > div { border-top: none !important; padding-top: 0 !important; margin-top: 0 !important; }
        .idea-signup-wrapper input {
          background: ${isLight ? "#ffffff" : palette.bg} !important;
          border: 1px solid ${palette.accent}60 !important;
          color: ${palette.fg} !important;
          font-family: ${fonts.body} !important;
        }
        .idea-signup-wrapper input::placeholder { color: ${palette.muted} !important; }
        .idea-signup-wrapper input:focus { border-color: ${palette.accent} !important; outline: none; }
        .idea-signup-wrapper button {
          background: ${palette.accent} !important;
          color: ${isLight ? palette.bg : (palette.bg === "#000000" ? "#000" : palette.bg)} !important;
          font-family: ${fonts.body} !important;
        }
        .idea-signup-wrapper button:hover { background: ${palette.accent2} !important; }
        .idea-signup-wrapper p { color: ${palette.muted} !important; font-family: ${fonts.body} !important; }
        .idea-signup-wrapper p span { color: ${palette.accent} !important; }
      `}</style>
    </div>
  );

  // Decorative blob (only shown when pattern === "blob")
  const blob = pattern === "blob" && (
    <>
      <div
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          top: "-10%",
          right: "-10%",
          width: "55%",
          height: "120%",
          background: `radial-gradient(circle, ${palette.accent}, transparent 70%)`,
          filter: "blur(80px)",
          opacity: 0.4,
        }}
      />
      <div
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          bottom: "-20%",
          left: "-5%",
          width: "40%",
          height: "80%",
          background: `radial-gradient(circle, ${palette.accent2}, transparent 70%)`,
          filter: "blur(100px)",
          opacity: 0.3,
        }}
      />
    </>
  );

  // Layout variants
  let inner: React.ReactNode;
  switch (layout) {
    case "split":
      inner = (
        <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
          <div>
            {accentBadge}
            {headline}
            {sub}
            {SignupForm}
            {meta}
          </div>
          <div className="hidden md:flex items-center justify-center">
            <div
              className="aspect-square w-full max-w-sm flex items-center justify-center"
              style={{
                border: `2px solid ${palette.accent}`,
                background: `linear-gradient(135deg, ${palette.accent}10, transparent)`,
              }}
            >
              <div
                className="font-black"
                style={{
                  fontFamily: fonts.display,
                  fontSize: "8rem",
                  color: palette.accent,
                  lineHeight: 1,
                }}
              >
                {String(index + 1).padStart(2, "0")}
              </div>
            </div>
          </div>
        </div>
      );
      break;
    case "asymmetric-left":
      inner = (
        <div className="relative z-10 max-w-3xl">
          {accentBadge}
          {headline}
          {sub}
          {SignupForm}
          {meta}
        </div>
      );
      break;
    case "asymmetric-right":
      inner = (
        <div className="relative z-10 max-w-3xl ml-auto text-right">
          <div className="flex justify-end">{accentBadge}</div>
          {headline}
          <p
            className="mb-8 leading-relaxed max-w-xl ml-auto"
            style={{ fontFamily: fonts.body, color: palette.muted, fontSize: "clamp(1rem, 1.5vw, 1.2rem)" }}
          >
            {subheadline}
          </p>
          <div className="flex justify-end">{SignupForm}</div>
          <div className="flex justify-end">{meta}</div>
        </div>
      );
      break;
    case "stacked-bold":
      inner = (
        <div className="relative z-10">
          {accentBadge}
          <h2
            className="font-black leading-[0.85] tracking-tighter mb-6 uppercase"
            style={{
              fontFamily: fonts.display,
              color: palette.fg,
              fontSize: "clamp(3rem, 10vw, 8rem)",
            }}
          >
            {idea.name}
          </h2>
          <div className="grid md:grid-cols-2 gap-8 mt-10">
            <div>{sub}</div>
            <div>
              {SignupForm}
            </div>
          </div>
          {meta}
        </div>
      );
      break;
    default: // centered
      inner = (
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <div className="flex justify-center">{accentBadge}</div>
          {headline}
          <p
            className="mb-8 leading-relaxed max-w-xl mx-auto"
            style={{ fontFamily: fonts.body, color: palette.muted, fontSize: "clamp(1rem, 1.5vw, 1.2rem)" }}
          >
            {subheadline}
          </p>
          <div className="flex justify-center">{SignupForm}</div>
          <div className="flex justify-center">{meta}</div>
        </div>
      );
  }

  return (
    <section
      className="relative overflow-hidden px-6 md:px-12 py-20 md:py-28"
      style={{
        background: palette.bg,
        ...patternStyles[pattern],
        borderTop: `1px solid ${palette.accent}25`,
      }}
    >
      {blob}
      <div className="max-w-6xl mx-auto relative">{inner}</div>
    </section>
  );
};

export default IdeaLandingHero;
