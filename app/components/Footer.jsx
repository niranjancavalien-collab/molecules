import { Github, Linkedin, Twitter } from "lucide-react";
import { useState } from "react";

import { PrimaryButton } from "~/components/ui";

const COLUMNS = [
  { title: "Platform", links: ["Assessments", "Sandbox Pro", "AI proctoring", "Integrations"] },
  { title: "Programs", links: ["NCET", "NCET Plus", "Courses", "Hackathons"] },
  { title: "Company", links: ["About", "Careers", "Partners", "Contact"] },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const subscribe = () => {
    if (!email.includes("@")) return;
    // Wire this to your own action / newsletter endpoint.
    setSent(true);
    setEmail("");
    window.setTimeout(() => setSent(false), 2600);
  };

  return (
    <footer className="mt-10 border-t border-slate-200 bg-slate-100/80 backdrop-blur-md dark:border-white/10 dark:bg-slate-950/80">
      <div className="mx-auto w-full max-w-6xl px-6 pb-8 pt-14">
        <div className="grid grid-cols-1 gap-9 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="text-lg font-extrabold tracking-tight">
              <span className="text-gradient">MyAnatomy</span>
              <span className="font-semibold text-slate-500 dark:text-slate-400">.ai</span>
            </div>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Assessment, proctoring, and certification infrastructure for the people who hire
              engineers and the people who want to be hired.
            </p>

            <div className="mt-6 max-w-sm">
              <label
                htmlFor="newsletter-email"
                className="text-[13.5px] font-semibold text-slate-900 dark:text-white"
              >
                Monthly product notes
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  id="newsletter-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") subscribe();
                  }}
                  placeholder="you@company.com"
                  className="flex-1 rounded-full border border-slate-200 bg-white/70 px-4 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
                <PrimaryButton onClick={subscribe}>Subscribe</PrimaryButton>
              </div>
              <p
                className={`mt-2 text-xs ${
                  sent ? "text-deep dark:text-glow" : "text-slate-500 dark:text-slate-500"
                }`}
              >
                {sent
                  ? "Subscribed. The first note lands next month."
                  : "One email a month. Unsubscribe any time."}
              </p>
            </div>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title}>
              <div className="text-sm font-bold text-slate-900 dark:text-white">{column.title}</div>
              <ul className="mt-3.5 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#top"
                      className="text-sm text-slate-600 transition hover:text-deep dark:text-slate-400 dark:hover:text-glow"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-11 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-6 dark:border-white/10">
          <p className="text-[13px] text-slate-500 dark:text-slate-500">
            © {new Date().getFullYear()} MyAnatomy Innovation Pvt. Ltd. · Privacy · Terms ·
            Proctoring data policy
          </p>
          <div className="flex items-center gap-2.5">
            {[Github, Linkedin, Twitter].map((Icon, index) => (
              <a
                key={index}
                href="#top"
                aria-label="Social profile"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:text-deep dark:border-white/10 dark:text-slate-400 dark:hover:text-glow"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
