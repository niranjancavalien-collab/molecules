import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CalendarDays, GraduationCap, Trophy } from "lucide-react";
import { useState } from "react";

import { OutlineButton, Reveal, Section, SectionHeading } from "~/components/ui";

const TABS = [
  {
    id: "courses",
    label: "Courses",
    icon: GraduationCap,
    headline: "Self-paced paths that close the gap the assessment found.",
    copy: "Every score maps to a recommended module, so a weak section turns into a study plan instead of a rejection.",
    items: [
      { title: "Frontend systems path", meta: "12 modules · 18 h", tag: "Most enrolled" },
      { title: "DSA for interviews", meta: "9 modules · 24 h", tag: "New cohort" },
      { title: "Applied ML foundations", meta: "14 modules · 30 h", tag: "Certificate" },
    ],
  },
  {
    id: "hackathons",
    label: "Hackathons",
    icon: Trophy,
    headline: "Live challenges with real leaderboards and real prize pools.",
    copy: "Sponsored by hiring partners, judged on running code, and scored inside the same sandbox as assessments.",
    items: [
      { title: "BuildOps 48h", meta: "Live now · 2,140 teams", tag: "₹5,00,000 pool" },
      { title: "AgentCraft Sprint", meta: "Opens 02 Oct", tag: "₹2,50,000 pool" },
      { title: "Campus Code Cup", meta: "Registration open", tag: "Internships" },
    ],
  },
  {
    id: "events",
    label: "Events",
    icon: CalendarDays,
    headline: "Hiring drives, webinars, and campus connect summits.",
    copy: "Enterprises run a drive against a pre-assessed pool; institutions bring their cohort and see where it stands.",
    items: [
      { title: "Bengaluru hiring drive", meta: "24 Sep · 38 companies", tag: "On-site" },
      { title: "Proctoring at scale", meta: "01 Oct · webinar", tag: "Free" },
      { title: "Campus connect summit", meta: "15 Nov · Hyderabad", tag: "Institutions" },
    ],
  },
];

export function Ecosystem() {
  const [active, setActive] = useState("courses");
  const tab = TABS.find((item) => item.id === active) ?? TABS[0];

  return (
    <Section id="ecosystem">
      <Reveal>
        <SectionHeading
          align="center"
          eyebrow="Upskilling & engagement"
          title="Assessment is the start of the relationship, not the end of it."
          blurb="Courses, hackathons, and events keep candidates active on the platform between evaluations — and keep partners in front of them."
        />
      </Reveal>

      <Reveal delay={0.09}>
        <div
          role="tablist"
          aria-label="Upskilling and engagement"
          className="mx-auto mt-10 flex w-fit flex-wrap items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white/70 p-1.5 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/60"
        >
          {TABS.map((item) => {
            const selected = item.id === active;
            return (
              <button
                key={item.id}
                role="tab"
                aria-selected={selected}
                onClick={() => setActive(item.id)}
                className="relative inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition"
              >
                {selected ? (
                  <motion.span
                    layoutId="ecosystem-pill"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-deep to-violetDeep dark:from-glow dark:to-violetGlow"
                    transition={{ type: "spring", stiffness: 320, damping: 30 }}
                  />
                ) : null}
                <span
                  className={`relative flex items-center gap-2 ${
                    selected ? "text-white" : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <item.icon size={15} />
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </Reveal>

      <Reveal delay={0.15}>
        <div className="surface-card mt-7 p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 gap-8 lg:grid-cols-3"
            >
              <div>
                <h3 className="text-xl font-bold leading-snug tracking-tight text-slate-900 dark:text-white">
                  {tab.headline}
                </h3>
                <p className="mt-3.5 leading-relaxed text-slate-600 dark:text-slate-400">{tab.copy}</p>
                <div className="mt-6">
                  <OutlineButton icon={ArrowRight}>Browse {tab.label.toLowerCase()}</OutlineButton>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:col-span-2">
                {tab.items.map((item) => (
                  <div
                    key={item.title}
                    className="surface-inset flex min-h-[138px] flex-col justify-between p-5"
                  >
                    <div>
                      <div className="font-bold leading-snug text-slate-900 dark:text-white">
                        {item.title}
                      </div>
                      <div className="mt-2 text-[13px] text-slate-600 dark:text-slate-400">
                        {item.meta}
                      </div>
                    </div>
                    <span className="mt-4 self-start rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-xs font-semibold text-cyan-700 dark:text-cyan-400">
                      {item.tag}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </Reveal>
    </Section>
  );
}
