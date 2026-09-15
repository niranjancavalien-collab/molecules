import { motion } from "framer-motion";
import { ArrowRight, GraduationCap, ShieldCheck } from "lucide-react";

import { Badge, Chip, OutlineButton, PrimaryButton, Reveal, Section } from "~/components/ui";

const DISTRIBUTION = [
  { band: "0–20", pct: 6 },
  { band: "21–40", pct: 14 },
  { band: "41–60", pct: 31 },
  { band: "61–80", pct: 34 },
  { band: "81–100", pct: 15 },
];

const SCHEDULE = [
  { window: "Attempt 1", date: "12 Oct 2026", status: "Registration open" },
  { window: "Attempt 2", date: "07 Dec 2026", status: "Opens 01 Nov" },
  { window: "Attempt 3", date: "22 Feb 2027", status: "Planned" },
];

const FORMATS = [
  { name: "NCET", detail: "120 min · 90 questions · 3 attempts a year" },
  { name: "NCET Plus", detail: "210 min · adds system design, live code, viva" },
];

export function NcetSection() {
  const peak = Math.max(...DISTRIBUTION.map((d) => d.pct));

  return (
    <Section id="ncet">
      <Reveal>
        <div className="rounded-3xl border border-cyan-500/30 bg-white/70 p-7 shadow-glowLight backdrop-blur-2xl sm:p-12 dark:border-cyan-500/50 dark:bg-slate-900/60 dark:shadow-glow">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
            <div>
              <Chip icon={GraduationCap}>NCET &amp; NCET Plus</Chip>
              <h2 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl dark:text-white">
                The National Candidate Evaluation Test, and the deeper one.
              </h2>
              <p className="mt-4 leading-relaxed text-slate-600 dark:text-slate-400">
                NCET is the standardised baseline: aptitude, reasoning, and core programming in a
                proctored two-hour window. NCET Plus adds a system-design case, a live coding round
                in Sandbox Pro, and a communication assessment for roles that need more evidence.
              </p>

              <div className="mt-7 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                {FORMATS.map((format) => (
                  <div key={format.name} className="surface-inset p-4">
                    <div className="font-bold text-slate-900 dark:text-white">{format.name}</div>
                    <div className="mt-1.5 text-[13.5px] leading-relaxed text-slate-600 dark:text-slate-400">
                      {format.detail}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <Badge>142 partner institutions</Badge>
                <Badge>Score valid 24 months</Badge>
                <Badge icon={ShieldCheck}>Remote proctored</Badge>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <PrimaryButton icon={ArrowRight}>Register for NCET</PrimaryButton>
                <OutlineButton>Compare NCET Plus</OutlineButton>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="surface-inset p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-bold text-slate-900 dark:text-white">Score distribution</span>
                  <span className="text-xs text-slate-500 dark:text-slate-500">
                    Cycle 2026-A · 418,902 attempts
                  </span>
                </div>

                <div className="mt-6 flex h-44 items-end gap-3">
                  {DISTRIBUTION.map((bar, i) => (
                    <div key={bar.band} className="flex-1 text-center">
                      <div className="mb-1.5 text-xs text-slate-600 dark:text-slate-400">{bar.pct}%</div>
                      <motion.div
                        className="rounded-t-lg bg-gradient-to-b from-deep to-violetDeep opacity-90 dark:from-glow dark:to-violetGlow"
                        initial={{ height: 0 }}
                        whileInView={{ height: `${(bar.pct / peak) * 118}px` }}
                        viewport={{ once: true, amount: 0.35 }}
                        transition={{ duration: 0.9, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                      />
                      <div className="mt-2 text-[11.5px] text-slate-500 dark:text-slate-500">
                        {bar.band}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="surface-inset p-6">
                <div className="font-bold text-slate-900 dark:text-white">Test windows</div>
                {SCHEDULE.map((slot, i) => (
                  <div
                    key={slot.window}
                    className={`flex items-center justify-between py-3 ${
                      i === 0 ? "mt-2" : "border-t border-slate-200 dark:border-white/10"
                    }`}
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">
                        {slot.window}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-500">{slot.date}</div>
                    </div>
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                        i === 0
                          ? "border-cyan-500/20 bg-cyan-500/10 text-cyan-700 dark:text-cyan-400"
                          : "border-slate-200 text-slate-500 dark:border-white/10 dark:text-slate-400"
                      }`}
                    >
                      {slot.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
