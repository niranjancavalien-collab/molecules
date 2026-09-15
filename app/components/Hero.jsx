import { ArrowRight, Sparkles } from "lucide-react";

import { Chip, OutlineButton, PrimaryButton, Reveal, Section } from "~/components/ui";

const METRICS = [
  { value: "10M+", label: "Candidates assessed" },
  { value: "500+", label: "Enterprise partners" },
  { value: "99.4%", label: "Proctoring accuracy" },
];

export function Hero() {
  return (
    <Section id="top" className="pb-16 pt-24 text-center">
      <Reveal>
        <Chip icon={Sparkles}>AI-powered assessment &amp; skill orchestration platform</Chip>
      </Reveal>

      <Reveal delay={0.09}>
        <h1 className="mx-auto mt-7 max-w-4xl text-4xl font-extrabold leading-[1.06] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-white">
          Discover, evaluate, and hire top tech talent at scale.
        </h1>
      </Reveal>

      <Reveal delay={0.17}>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-slate-400">
          Connecting candidates, higher-ed institutions, and enterprises through next-gen
          evaluations, AI proctoring, and industry certifications.
        </p>
      </Reveal>

      <Reveal delay={0.24}>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3.5">
          <PrimaryButton size="lg" icon={ArrowRight}>
            Explore assessments
          </PrimaryButton>
          <OutlineButton size="lg">For candidates</OutlineButton>
        </div>
      </Reveal>

      <Reveal delay={0.32}>
        <div className="surface-card mt-16 grid grid-cols-1 overflow-hidden sm:grid-cols-3">
          {METRICS.map((metric, i) => (
            <div
              key={metric.label}
              className={`px-5 py-7 ${
                i === 0 ? "" : "border-slate-200 sm:border-l dark:border-white/10"
              }`}
            >
              <div className="text-gradient text-4xl font-extrabold tracking-tight">
                {metric.value}
              </div>
              <div className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">{metric.label}</div>
            </div>
          ))}
        </div>
      </Reveal>
    </Section>
  );
}
