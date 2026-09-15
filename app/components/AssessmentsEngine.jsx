import { Brain, Check, Code2, ShieldCheck, SlidersHorizontal } from "lucide-react";

import { Reveal, Section, SectionHeading } from "~/components/ui";

const CAPABILITIES = [
  {
    icon: ShieldCheck,
    title: "Automated AI proctoring",
    copy: "Facial verification, ambient audio detection, and tab-switch monitoring, with every flag time-stamped for review.",
    points: ["Face match on entry", "Second-voice detection", "Tab & window events"],
  },
  {
    icon: Code2,
    title: "Coding & algorithmic benchmarks",
    copy: "Run real test suites across 30+ languages and score on correctness, complexity, and runtime — not keystrokes.",
    points: ["Hidden test cases", "Complexity scoring", "Plagiarism similarity"],
  },
  {
    icon: Brain,
    title: "Aptitude & psychometric profiling",
    copy: "Reasoning, numerical, and behavioural batteries normed against 10M+ attempts for defensible comparisons.",
    points: ["Adaptive difficulty", "Role-fit indices", "Percentile norms"],
  },
  {
    icon: SlidersHorizontal,
    title: "Custom assessment suite",
    copy: "Assemble a paper from your own question bank, set weightings and windows, and publish to a cohort in minutes.",
    points: ["Section weighting", "Question bank import", "Cohort scheduling"],
  },
];

export function AssessmentsEngine() {
  return (
    <Section id="assessments">
      <Reveal>
        <SectionHeading
          eyebrow="Enterprise assessments engine"
          title="Evaluation infrastructure that holds up under audit."
          blurb="Every attempt is proctored, scored, and traceable — so a hiring decision can be explained months later."
        />
      </Reveal>

      <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {CAPABILITIES.map((item, i) => (
          <Reveal key={item.title} delay={i * 0.07}>
            <div className="surface-card h-full p-7 transition-colors duration-200 hover:border-deep/40 dark:hover:border-glow/50">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 text-deep dark:text-glow">
                <item.icon size={22} />
              </div>
              <h3 className="mt-5 text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                {item.title}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {item.copy}
              </p>
              <ul className="mt-4 space-y-1.5">
                {item.points.map((point) => (
                  <li
                    key={point}
                    className="flex items-center gap-2 text-[13.5px] text-slate-600 dark:text-slate-400"
                  >
                    <Check size={14} className="shrink-0 text-deep dark:text-glow" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
