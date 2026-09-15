import { AnimatePresence, motion } from "framer-motion";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useState } from "react";

import { useTheme } from "~/components/ThemeProvider";
import { GhostButton, PrimaryButton } from "~/components/ui";

const NAV_LINKS = [
  { label: "Candidates", href: "#candidates" },
  { label: "Assessments", href: "#assessments" },
  { label: "NCET & NCET Plus", href: "#ncet" },
  { label: "Sandbox Pro", href: "#sandbox" },
  { label: "Courses", href: "#ecosystem" },
  { label: "Hackathons", href: "#ecosystem" },
  { label: "Events", href: "#ecosystem" },
];

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-deep transition hover:bg-cyan-500/10 dark:border-white/10 dark:text-glow"
    >
      <motion.span
        key={theme}
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 180, damping: 14 }}
        className="flex"
      >
        {isDark ? <Moon size={18} /> : <Sun size={18} />}
      </motion.span>
    </button>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md transition-colors dark:border-white/10 dark:bg-slate-950/70">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-5 px-6 py-3.5">
        <a href="#top" className="whitespace-nowrap text-lg font-extrabold tracking-tight">
          <span className="text-gradient">MyAnatomy</span>
          <span className="font-semibold text-slate-500 dark:text-slate-400">.ai</span>
        </a>

        <nav className="ml-3 hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-900/[0.04] hover:text-deep dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-glow"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2.5">
          <ThemeToggle />
          <div className="hidden items-center gap-2 sm:flex">
            <GhostButton>Sign in</GhostButton>
            <PrimaryButton>Get started</PrimaryButton>
          </div>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle navigation"
            aria-expanded={open}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-900 dark:border-white/10 dark:text-white lg:hidden"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-slate-200 lg:hidden dark:border-white/10"
          >
            <div className="flex flex-col gap-1 px-6 pb-5 pt-3">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="py-2.5 text-[15px] text-slate-600 dark:text-slate-400"
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-3 flex items-center gap-2 sm:hidden">
                <GhostButton>Sign in</GhostButton>
                <PrimaryButton>Get started</PrimaryButton>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
