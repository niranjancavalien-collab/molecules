import { motion } from "framer-motion";
import { BadgeCheck } from "lucide-react";

import { fadeUp, viewportOnce } from "~/lib/motion";

export function Reveal({ children, delay = 0, className = "" }) {
  return (
    <motion.div
      className={className}
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

export function Section({ id, className = "", children }) {
  return (
    <section id={id} className={`mx-auto w-full max-w-6xl px-6 py-24 ${className}`}>
      {children}
    </section>
  );
}

export function Chip({ children, icon: Icon = null, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3.5 py-1.5 text-sm font-semibold text-cyan-700 dark:text-cyan-400 ${className}`}
    >
      {Icon ? <Icon size={14} /> : null}
      {children}
    </span>
  );
}

export function Badge({ children, icon: Icon = BadgeCheck }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-900/[0.04] px-2.5 py-1 text-xs font-semibold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
      <Icon size={13} className="text-deep dark:text-glow" />
      {children}
    </span>
  );
}

export function PrimaryButton({ children, icon: Icon = null, size = "md", className = "", ...rest }) {
  const sizing = size === "lg" ? "px-7 py-3.5 text-base" : "px-5 py-2.5 text-sm";
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-deep to-violetDeep font-semibold text-white shadow-lg shadow-deep/25 transition duration-200 hover:-translate-y-0.5 hover:shadow-glowLight dark:from-glow dark:to-violetGlow dark:shadow-glow/20 dark:hover:shadow-glow ${sizing} ${className}`}
    >
      {children}
      {Icon ? <Icon size={size === "lg" ? 18 : 16} /> : null}
    </button>
  );
}

export function OutlineButton({ children, icon: Icon = null, size = "md", className = "", ...rest }) {
  const sizing = size === "lg" ? "px-7 py-3.5 text-base" : "px-5 py-2.5 text-sm";
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 font-semibold text-slate-900 transition duration-200 hover:border-deep/40 hover:bg-slate-900/[0.04] dark:border-white/15 dark:text-white dark:hover:border-glow/50 dark:hover:bg-white/5 ${sizing} ${className}`}
    >
      {children}
      {Icon ? <Icon size={size === "lg" ? 18 : 16} /> : null}
    </button>
  );
}

export function GhostButton({ children, className = "", ...rest }) {
  return (
    <button
      {...rest}
      className={`rounded-full px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-900/[0.04] hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white ${className}`}
    >
      {children}
    </button>
  );
}

export function SectionHeading({ eyebrow, title, blurb, align = "left" }) {
  const alignment = align === "center" ? "mx-auto text-center" : "";
  return (
    <div className={`max-w-2xl ${alignment}`}>
      {eyebrow ? <Chip>{eyebrow}</Chip> : null}
      <h2 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl dark:text-white">
        {title}
      </h2>
      {blurb ? (
        <p className="mt-4 text-lg leading-relaxed text-slate-600 dark:text-slate-400">{blurb}</p>
      ) : null}
    </div>
  );
}
