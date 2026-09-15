import { motion } from "framer-motion";
import { Cpu, FileText, Share2, ShieldCheck, Sparkles } from "lucide-react";

import { Badge, Reveal, Section, SectionHeading, Chip } from "~/components/ui";

const SKILLS = [
  { label: "Data structures & algorithms", value: 88 },
  { label: "Frontend engineering", value: 92 },
  { label: "Communication", value: 76 },
];

const RESUME_FEATURES = [
  { icon: FileText, title: "Bullet rewriting", copy: "Turns duties into measurable outcomes." },
  { icon: Cpu, title: "ATS keyword match", copy: "Scores against the job description before it is sent." },
  { icon: Share2, title: "One-click recruiter share", copy: "A live link that stays current." },
];

function SkillBar({ label, value }) {
  return (
    <div className="mt-3.5">
      <div className="flex items-center justify-between text-[13px]">
        <span className="text-slate-600 dark:text-slate-400">{label}</span>
        <span className="font-semibold text-slate-900 dark:text-white">{value}</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-900/10 dark:bg-white/10">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-deep to-violetDeep dark:from-glow dark:to-violetGlow"
          initial={{ width: 0 }}
          whileInView={{ width: `${value}%` }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}

export function CandidateHub() {
  return (
    <Section id="candidates">
      <Reveal>
        <SectionHeading
          eyebrow="Candidate hub"
          title="One profile that proves what a candidate can actually do."
          blurb="Verified skills, domain ranking, and career readiness in a single record recruiters can trust — paired with a resume that writes and tunes itself."
        />
      </Reveal>

      <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Reveal delay={0.08}>
          <div className="surface-card h-full p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[13px] text-slate-600 dark:text-slate-400">Career readiness</div>
                <div className="text-gradient text-5xl font-extrabold tracking-tight">
                  84
                  <span className="text-lg font-semibold text-slate-400"> / 100</span>
                </div>
              </div>
              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-right">
                <div className="text-xs text-slate-600 dark:text-slate-400">Domain rank</div>
                <div className="text-xl font-bold text-slate-900 dark:text-white">#312</div>
                <div className="text-[11.5px] text-cyan-700 dark:text-cyan-400">Full-stack · India</div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <Badge>React verified</Badge>
              <Badge>SQL verified</Badge>
              <Badge>System design</Badge>
              <Badge icon={ShieldCheck}>Proctored</Badge>
            </div>

            <div className="mt-6">
              {SKILLS.map((skill) => (
                <SkillBar key={skill.label} {...skill} />
              ))}
            </div>

            <div className="mt-6 border-t border-slate-200 pt-4 text-[13.5px] text-slate-600 dark:border-white/10 dark:text-slate-400">
              Last assessment: NCET Plus · cleared with distinction
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.16}>
          <div className="surface-card h-full p-8">
            <Chip icon={Sparkles}>AI resume builder</Chip>
            <h3 className="mt-5 text-2xl font-bold leading-snug tracking-tight text-slate-900 dark:text-white">
              Rewrites the resume around the role, not the template.
            </h3>
            <p className="mt-3 leading-relaxed text-slate-600 dark:text-slate-400">
              Pulls verified assessment evidence into the profile, rephrases weak bullets, and
              matches the keywords a specific job description screens for.
            </p>

            <div className="mt-6 flex flex-col gap-3">
              {RESUME_FEATURES.map((feature) => (
                <div key={feature.title} className="surface-inset flex items-start gap-3 p-4">
                  <feature.icon size={18} className="mt-0.5 shrink-0 text-deep dark:text-glow" />
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">{feature.title}</div>
                    <div className="mt-0.5 text-[13.5px] text-slate-600 dark:text-slate-400">
                      {feature.copy}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                ATS match for “Frontend Engineer II”
              </span>
              <span className="text-lg font-extrabold text-deep dark:text-glow">91%</span>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
