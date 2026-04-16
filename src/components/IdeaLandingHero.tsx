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


  const meta = (
    <div
      className="mt-6 pt-5 flex flex-col gap-3 text-xs w-full"
      style={{ borderTop: `1px solid ${palette.muted}30`, color: palette.muted, fontFamily: fonts.body }}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <span>{format(new Date(idea.date), "MMM d, yyyy")}</span>
        <span>·</span>
        <Link
          to={`/briefings/${idea.postId}`}
          className="hover:underline"
          style={{ color: palette.accent }}
        >
          Source briefing →
        </Link>
      </div>
      {idea.links.length > 0 && (
        <div className="flex items-start gap-2 flex-wrap">
          <span className="uppercase tracking-wider opacity-70 mt-0.5">Tweets:</span>
          {idea.links.map((l, i) => (
            <a
              key={i}
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline px-2 py-0.5"
              style={{ color: palette.accent, border: `1px solid ${palette.accent}40` }}
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
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

  // Compact card layout (2-per-row friendly) — keep palette/font/pattern bespoke
  const inner = (
    <div className="relative z-10 flex flex-col h-full">
      {accentBadge}
      <h2
        className="font-black leading-[0.95] tracking-tight mb-4"
        style={{
          fontFamily: fonts.display,
          color: palette.fg,
          fontSize: "clamp(1.75rem, 3vw, 2.75rem)",
        }}
      >
        {idea.name}
      </h2>
      <p
        className="mb-6 leading-relaxed flex-1"
        style={{
          fontFamily: fonts.body,
          color: palette.muted,
          fontSize: "0.95rem",
        }}
      >
        {subheadline}
      </p>
      {SignupForm}
      {meta}
    </div>
  );

  return (
    <section
      className="relative overflow-hidden px-6 md:px-8 py-10 md:py-12 h-full"
      style={{
        background: palette.bg,
        ...patternStyles[pattern],
        border: `1px solid ${palette.accent}30`,
      }}
    >
      {blob}
      <div className="relative h-full">{inner}</div>
    </section>
  );
};

export default IdeaLandingHero;
