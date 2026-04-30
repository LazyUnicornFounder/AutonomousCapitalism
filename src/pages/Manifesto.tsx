import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import CountUp from "react-countup";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BRAND,
  COMPRESSION,
  COST_CURVE_BASE,
  FAILURES,
  HERO,
  METHODOLOGY,
  PLAYBOOK,
  STACK,
  THESIS,
  TIME_COST,
  TIMELINE,
  WEDGES,
  WHATS_DIFFERENT,
} from "@/lib/ac-data";

const BLUE = "hsl(200 100% 50%)";

// ---------- Primitives ----------

const Hairline = ({ className = "" }: { className?: string }) => (
  <div className={`h-px w-full bg-foreground/30 ${className}`} />
);

const SectionLabel = ({ n, title }: { n: string; title: string }) => (
  <div className="mb-8 flex items-baseline gap-4 border-b border-foreground/30 pb-3">
    <span className="font-mono text-xs tracking-widest text-foreground/60">{n}</span>
    <h2 className="font-display text-xl font-bold uppercase tracking-tight">{title}</h2>
  </div>
);

const Section = ({
  id,
  children,
  className = "",
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <section id={id} className={`mx-auto w-full max-w-[1320px] px-6 py-20 md:px-12 ${className}`}>
    {children}
  </section>
);

// ---------- Stat tile with count-up on scroll ----------

const StatTile = ({
  value,
  prefix,
  suffix,
  label,
}: {
  value: number;
  prefix: string;
  suffix: string;
  label: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <div ref={ref} className="border-t border-foreground/30 pt-6">
      <div className="font-display text-5xl font-black tabular-nums tracking-tight md:text-6xl">
        {inView ? (
          <CountUp end={value} prefix={prefix} suffix={suffix} duration={1.6} separator="," />
        ) : (
          <span>{prefix}0{suffix}</span>
        )}
      </div>
      <p className="mt-3 max-w-[22ch] font-body text-sm leading-snug text-foreground/70">{label}</p>
    </div>
  );
};

// ---------- Cost curve ----------

const Toggle = ({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) => (
  <div className="inline-flex border border-foreground/30">
    {options.map((opt) => (
      <button
        key={opt}
        onClick={() => onChange(opt)}
        className={`px-4 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-colors ${
          value === opt ? "bg-foreground/30 text-primary-foreground" : "bg-background text-foreground hover:bg-foreground/10"
        }`}
      >
        {opt}
      </button>
    ))}
  </div>
);

const CostCurve = () => {
  const [scenario, setScenario] = useState("Base");
  const factor = scenario === "Conservative" ? 0.7 : scenario === "Aggressive" ? 1.3 : 1;
  const data = useMemo(
    () =>
      COST_CURVE_BASE.map((d) => ({
        month: d.month,
        opex: Math.round(d.opex * factor),
        mrr: Math.round(d.mrr * factor),
      })),
    [factor],
  );
  const crossover = data.find((d, i) => i > 0 && d.mrr >= d.opex);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-widest text-foreground/60">
          OPEX vs MRR · months 0–18
        </p>
        <Toggle
          options={["Conservative", "Base", "Aggressive"]}
          value={scenario}
          onChange={setScenario}
        />
      </div>
      <div className="h-[360px] w-full border border-foreground/30 bg-background p-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
            <CartesianGrid stroke="#fff" strokeOpacity={0.1} vertical={false} />
            <XAxis
              dataKey="month"
              stroke="#fff"
              tick={{ fill: "#fff", fontSize: 11, fontFamily: "ui-monospace,monospace" }}
              tickLine={false}
              axisLine={{ stroke: "#fff" }}
              label={{ value: "MONTH", position: "insideBottom", offset: -2, fill: "#fff", fontSize: 10 }}
            />
            <YAxis
              stroke="#fff"
              tick={{ fill: "#fff", fontSize: 11, fontFamily: "ui-monospace,monospace" }}
              tickLine={false}
              axisLine={{ stroke: "#fff" }}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                background: "#000",
                border: "1px solid #fff",
                borderRadius: 0,
                fontFamily: "ui-monospace,monospace",
                fontSize: 11,
              }}
              formatter={(v: number) => `$${v.toLocaleString()}`}
              labelFormatter={(l) => `Month ${l}`}
            />
            <Line type="monotone" dataKey="opex" stroke="#fff" strokeWidth={2} dot={false} name="OPEX" />
            <Line type="monotone" dataKey="mrr" stroke={BLUE} strokeWidth={2} dot={false} name="MRR" />
            {crossover && (
              <ReferenceDot x={crossover.month} y={crossover.mrr} r={6} fill={BLUE} stroke="#fff" strokeWidth={1} />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-6 font-mono text-[10px] uppercase tracking-widest text-foreground/70">
        <span className="flex items-center gap-2">
          <span className="inline-block h-[2px] w-6 bg-foreground/30" /> OPEX
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block h-[2px] w-6" style={{ background: BLUE }} /> MRR
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: BLUE }} /> Crossover
        </span>
      </div>
      <p className="mt-4 max-w-[60ch] font-body text-sm italic text-foreground/70">
        Crossover at month 5–6 is the fastest profitability curve any business model has ever produced.
      </p>
    </div>
  );
};

// ---------- Timeline ----------

const TimelineBlock = () => (
  <div className="relative">
    {/* Horizontal axis on md+ */}
    <div className="relative hidden md:block">
      <div className="absolute left-0 right-0 top-10 h-px bg-foreground/30" />
      <div className="grid grid-cols-5 gap-6">
        {TIMELINE.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="relative pt-16"
          >
            <div
              className="absolute left-0 top-[34px] h-3 w-3"
              style={{ background: m.isToday ? BLUE : "#fff" }}
            />
            {m.isToday && (
              <div
                className="absolute -top-2 left-0 whitespace-nowrap px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-primary-foreground"
                style={{ background: BLUE }}
              >
                TODAY for most readers →
              </div>
            )}
            <p className="font-mono text-[10px] uppercase tracking-widest text-foreground/60">{m.period}</p>
            <h3 className="mt-2 font-display text-lg font-bold uppercase leading-tight">{m.title}</h3>
            <div className="mt-3 border-t border-foreground/20 pt-3">
              <p className="font-mono text-[10px] uppercase tracking-widest text-foreground/50">Cost</p>
              <p className="font-display text-base font-bold tabular-nums">{m.cost}</p>
              <p className="font-body text-[11px] text-foreground/60">{m.costNote}</p>
            </div>
            <div className="mt-3">
              <p className="font-mono text-[10px] uppercase tracking-widest text-foreground/50">Build</p>
              <p className="font-body text-sm leading-snug">{m.build}</p>
            </div>
            <div className="mt-3">
              <p className="font-mono text-[10px] uppercase tracking-widest text-foreground/50">Runs without you</p>
              <p className="font-body text-sm leading-snug">{m.runs}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>

    {/* Vertical stack on mobile */}
    <div className="space-y-8 md:hidden">
      {TIMELINE.map((m, i) => (
        <div key={i} className="relative border-l-2 border-foreground/30 pl-5">
          <div
            className="absolute -left-[7px] top-1 h-3 w-3"
            style={{ background: m.isToday ? BLUE : "#fff" }}
          />
          {m.isToday && (
            <div
              className="mb-2 inline-block px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-primary-foreground"
              style={{ background: BLUE }}
            >
              TODAY for most readers →
            </div>
          )}
          <p className="font-mono text-[10px] uppercase tracking-widest text-foreground/60">{m.period}</p>
          <h3 className="mt-1 font-display text-lg font-bold uppercase">{m.title}</h3>
          <p className="mt-2 font-display text-base font-bold tabular-nums">{m.cost}</p>
          <p className="font-body text-[11px] text-foreground/60">{m.costNote}</p>
          <p className="mt-2 font-body text-sm">{m.build}</p>
          <p className="mt-2 font-body text-sm text-foreground/70">Runs alone: {m.runs}</p>
        </div>
      ))}
    </div>
  </div>
);

// ---------- Page ----------

const Manifesto = () => {
  // Force-light scope: this page intentionally inverts the site's dark theme.
  useEffect(() => {
    const prev = document.documentElement.style.background;
    document.documentElement.style.background = "#000";
    return () => {
      document.documentElement.style.background = prev;
    };
  }, []);

  const downloadPdf = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background text-foreground antialiased [font-feature-settings:'tnum']">
      {/* Top brand bar */}
      <div className="border-b border-foreground/30">
        <div className="mx-auto flex max-w-[1320px] items-center justify-between px-6 py-3 md:px-12">
          <Link to="/" className="font-mono text-[10px] uppercase tracking-widest">
            ← Autonomous Capitalism
          </Link>
          <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/60">{BRAND}</span>
        </div>
      </div>

      {/* 1. HERO */}
      <Section className="!py-16 md:!py-24">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-9">
            <p className="mb-6 font-mono text-[10px] uppercase tracking-widest text-foreground/60">
              Manifesto · Roadmap · Pricing reality
            </p>
            <h1 className="font-display text-[44px] font-black leading-[0.95] tracking-tight md:text-[88px]">
              {HERO.headline}
            </h1>
            <p className="mt-6 max-w-[40ch] font-display text-xl font-bold leading-tight md:text-3xl">
              {HERO.subhead}
            </p>
            <p className="mt-5 max-w-[60ch] font-body text-base text-foreground/70 md:text-lg">{HERO.dek}</p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link
                to="/subscribe"
                className="inline-flex items-center px-6 py-3 font-display text-sm font-bold uppercase tracking-wider text-primary-foreground"
                style={{ background: BLUE }}
              >
                {HERO.ctaPrimary}
              </Link>
              <button
                onClick={downloadPdf}
                className="inline-flex items-center border border-foreground/30 px-6 py-3 font-display text-sm font-bold uppercase tracking-wider text-foreground hover:bg-foreground/30 hover:text-primary-foreground"
              >
                {HERO.ctaSecondary}
              </button>
            </div>
            <p className="mt-8 font-mono text-[10px] uppercase tracking-widest text-foreground/50">{HERO.meta}</p>
          </div>
          <div className="col-span-12 md:col-span-3 md:border-l md:border-foreground/30 md:pl-6">
            <p className="font-mono text-[10px] uppercase tracking-widest text-foreground/60">Issue</p>
            <p className="font-display text-2xl font-bold">№ 01</p>
            <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-foreground/60">Format</p>
            <p className="font-body text-sm">A4 manifesto · printable</p>
            <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-foreground/60">Audience</p>
            <p className="font-body text-sm">Solo founders. Indie hackers. Frustrated operators.</p>
          </div>
        </div>
      </Section>

      <Hairline />

      {/* 2. THESIS */}
      <Section>
        <SectionLabel n="01" title="The Thesis" />
        <div className="grid grid-cols-1 gap-px bg-foreground/30 md:grid-cols-3">
          {THESIS.map((t) => (
            <div key={t.n} className="bg-background p-8">
              <p className="font-mono text-xs tracking-widest text-foreground/50">{t.n}</p>
              <p className="mt-6 font-display text-2xl font-bold leading-snug">{t.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Hairline />

      {/* 3. COMPRESSION */}
      <Section>
        <SectionLabel n="02" title="The Compression" />
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-5">
          {COMPRESSION.map((s, i) => (
            <StatTile key={i} {...s} />
          ))}
        </div>
      </Section>

      <Hairline />

      {/* 4. TIMELINE */}
      <Section>
        <SectionLabel n="03" title="From Zero to Autonomous" />
        <TimelineBlock />
      </Section>

      <Hairline />

      {/* 5. STACK */}
      <Section>
        <SectionLabel n="04" title="What an Autonomous Business Actually Runs On" />
        <div className="grid grid-cols-1 gap-px bg-foreground/30 md:grid-cols-4">
          {STACK.map((col) => (
            <div key={col.col} className="bg-background p-6">
              <p className="font-mono text-[10px] uppercase tracking-widest text-foreground/50">{col.col}</p>
              <ul className="mt-4 space-y-2">
                {col.tools.map((t) => (
                  <li
                    key={t}
                    className="border-b border-foreground/10 pb-2 font-display text-base font-bold leading-tight"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-6 font-body text-sm italic text-foreground/70">
          Twelve tools. Under $1,500/mo combined. No employees.
        </p>
      </Section>

      <Hairline />

      {/* 6. COST CURVE */}
      <Section>
        <SectionLabel n="05" title="The Cost Curve" />
        <CostCurve />
      </Section>

      <Hairline />

      {/* 7. TIME COST */}
      <Section>
        <SectionLabel n="06" title="The Time Cost" />
        <div className="grid grid-cols-1 gap-px bg-foreground/30 md:grid-cols-3">
          {TIME_COST.map((t, i) => (
            <div key={i} className="bg-background p-8">
              <p className="font-display text-6xl font-black tabular-nums">
                {t.hours}
                <span className="ml-2 font-display text-base font-bold text-foreground/50">hrs/wk</span>
              </p>
              <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-foreground/60">{t.period}</p>
              <p className="mt-2 font-body text-sm text-foreground/70">{t.note}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 max-w-[70ch] font-body text-sm italic text-foreground/70">
          The whole point is to engineer yourself out of the loop. If you're working harder at month 12 than
          month 4, you built a job, not a business.
        </p>
      </Section>

      <Hairline />

      {/* 8. WEDGES */}
      <Section>
        <SectionLabel n="07" title="Five Wedges That Work in 2026" />
        <div className="grid grid-cols-1 gap-px bg-foreground/30 md:grid-cols-5">
          {WEDGES.map((w) => (
            <div key={w.n} className="bg-background p-6">
              <p className="font-mono text-xs tracking-widest text-foreground/50">{w.n}</p>
              <p className="mt-4 font-display text-base font-bold leading-snug">{w.text}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 font-body text-sm italic text-foreground/70">
          All five share one trait: nobody wants to scale the human side.
        </p>
      </Section>

      <Hairline />

      {/* 9. FAILURE MODES */}
      <Section>
        <SectionLabel n="08" title="Failure Modes" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {FAILURES.map((f) => (
            <div key={f.title} className="border-l-4 p-6" style={{ borderColor: BLUE }}>
              <p className="font-display text-lg font-bold">{f.title}</p>
              <p className="mt-3 font-body text-sm text-foreground/70">{f.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Hairline />

      {/* 10. WHAT'S DIFFERENT */}
      <Section>
        <SectionLabel n="09" title="What's Different Now" />
        <div className="grid grid-cols-1 gap-px bg-foreground/30 md:grid-cols-3">
          {WHATS_DIFFERENT.map((w) => (
            <div key={w.n} className="bg-background p-8">
              <p className="font-mono text-xs tracking-widest text-foreground/50">{w.n}</p>
              <p className="mt-4 font-display text-xl font-bold leading-snug">{w.title}</p>
              <p className="mt-3 font-body text-sm text-foreground/70">{w.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* 11. THE INVERSION — full bleed black */}
      <section className="border-y border-foreground/30 bg-foreground py-24 text-background md:py-40">
        <div className="mx-auto max-w-[1100px] px-6 md:px-12">
          <p className="mb-8 font-mono text-[10px] uppercase tracking-widest text-background/50">
            10 · The Inversion
          </p>
          <p className="font-display text-3xl font-black leading-tight md:text-5xl">
            The 20th century rewarded the person who hired the most people.
            <br />
            The 21st century rewards the person who hired the fewest.
            <br />
            <span style={{ color: BLUE }}>
              The future of capitalism is autonomous, and it lives on one laptop.
            </span>
          </p>
        </div>
      </section>

      {/* 12. PLAYBOOK */}
      <Section>
        <SectionLabel n="11" title="The Playbook — This Week" />
        <div className="grid grid-cols-1 gap-px bg-foreground/30 md:grid-cols-3">
          {PLAYBOOK.map((p) => (
            <div key={p.n} className="bg-background p-8">
              <p className="font-mono text-xs tracking-widest text-foreground/50">{p.n}</p>
              <p className="mt-4 font-display text-lg font-bold leading-snug">{p.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Hairline />

      {/* 13. CTA */}
      <Section className="text-center">
        <p className="font-mono text-[10px] uppercase tracking-widest text-foreground/50">12 · Subscribe</p>
        <h2 className="mx-auto mt-4 max-w-[20ch] font-display text-3xl font-black leading-tight md:text-5xl">
          The newsletter that documents this in real time.
        </h2>
        <p className="mx-auto mt-6 max-w-[55ch] font-body text-base text-foreground/70">
          Every week: one solo founder, one autonomous business, one stack teardown. No fluff. No frameworks.
          Just receipts.
        </p>
        <Link
          to="/subscribe"
          className="mt-10 inline-flex items-center px-10 py-4 font-display text-base font-bold uppercase tracking-wider text-primary-foreground"
          style={{ background: BLUE }}
        >
          Subscribe →
        </Link>
      </Section>

      <Hairline />

      {/* 14. METHODOLOGY */}
      <footer className="mx-auto max-w-[1320px] px-6 py-10 md:px-12">
        <p className="font-mono text-[10px] uppercase tracking-widest text-foreground/40">Methodology</p>
        <p className="mt-2 max-w-[80ch] font-body text-xs text-foreground/50">{METHODOLOGY}</p>
        <p className="mt-6 font-mono text-[10px] uppercase tracking-widest text-foreground/40">{BRAND}</p>
      </footer>

      {/* Sticky bottom-right CTA */}
      <Link
        to="/subscribe"
        className="fixed bottom-6 right-6 z-50 hidden items-center px-5 py-3 font-display text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-lg md:inline-flex print:!hidden"
        style={{ background: BLUE }}
      >
        Subscribe →
      </Link>

      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 12mm; }
          html, body { background: #000 !important; }
          section { page-break-inside: avoid; }
        }
      `}</style>
    </div>
  );
};

export default Manifesto;
