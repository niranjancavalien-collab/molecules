import React, { useState, useEffect, useRef, useMemo, createContext, useContext } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ==========================================
// 1. THEME CONTEXT & PROVIDER
// ==========================================
type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={theme}>{children}</div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

// ==========================================
// 2. DYNAMIC 3D MOLECULE CANVAS (REACT THREE FIBER)
// ==========================================
function MoleculeParticles({ theme }: { theme: Theme }) {
  const pointsRef = useRef<THREE.Points>(null!);
  const materialRef = useRef<THREE.PointsMaterial>(null!);
  const count = 1600;

  // Generate 3D particle positions once
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 15;     // X
      pos[i * 3 + 1] = (Math.random() - 0.5) * 15; // Y
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10; // Z
    }
    return pos;
  }, [count]);

  // Dynamically update material properties based on theme
  useEffect(() => {
    if (materialRef.current) {
      if (theme === "dark") {
        materialRef.current.color.set("#38bdf8"); // Glowing Cyan
        materialRef.current.opacity = 0.8;
        materialRef.current.blending = THREE.AdditiveBlending;
      } else {
        materialRef.current.color.set("#0284c7"); // Deep Cyan / Indigo
        materialRef.current.opacity = 0.45;
        materialRef.current.blending = THREE.NormalBlending;
      }
      materialRef.current.needsUpdate = true;
    }
  }, [theme]);

  // Ambient rotation + cursor interaction loop
  useFrame((state, delta) => {
    if (pointsRef.current) {
      // Ambient rotation
      pointsRef.current.rotation.y += delta * 0.03;
      pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.15) * 0.08;

      // Mouse tracking tilt
      const targetX = (state.pointer.x * Math.PI) / 12;
      const targetY = (state.pointer.y * Math.PI) / 12;
      pointsRef.current.rotation.y += (targetX - pointsRef.current.rotation.y) * 0.02;
      pointsRef.current.rotation.x += (targetY - pointsRef.current.rotation.x) * 0.02;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        size={0.035}
        color={theme === "dark" ? "#38bdf8" : "#0284c7"}
        transparent
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

export function InteractiveMoleculeCanvas() {
  const { theme } = useTheme();
  const bgStyle = theme === "dark" ? "#0B0F19" : "#F8FAFC";

  return (
    <div
      className="fixed inset-0 -z-10 transition-colors duration-500"
      style={{ backgroundColor: bgStyle }}
    >
      <Canvas
        camera={{ position: [0, 0, 7], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
      >
        <MoleculeParticles theme={theme} />
      </Canvas>
    </div>
  );
}

// ==========================================
// 3. NAVBAR COMPONENT WITH THEME TOGGLE
// ==========================================
function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-slate-950/70 backdrop-blur-md border-b border-slate-200 dark:border-white/10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-cyan-500/30">
            MA
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            MyAnatomy<span className="text-cyan-500">.ai</span>
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-8 text-sm font-medium text-slate-600 dark:text-slate-300">
          <a href="#candidates" className="hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors">
            Candidates
          </a>
          <a href="#assessments" className="hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors">
            Assessments
          </a>
          <a href="#ncet" className="hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors">
            NCET & NCET+
          </a>
          <a href="#sandbox" className="hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors">
            Sandbox Pro
          </a>
          <a href="#ecosystem" className="hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors">
            Courses & Hackathons
          </a>
        </nav>

        {/* Right Actions & Theme Switcher */}
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? (
              /* Sun Icon */
              <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              /* Moon Icon */
              <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          <button className="hidden sm:inline-block px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors">
            Sign In
          </button>
          <button className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 transition-all">
            Get Started
          </button>
        </div>
      </div>
    </header>
  );
}

// ==========================================
// 4. HERO SECTION
// ==========================================
function HeroSection() {
  return (
    <section className="relative pt-20 pb-28 px-6 max-w-7xl mx-auto text-center">
      {/* Badge */}
      <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-cyan-500/10 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20 text-xs sm:text-sm font-semibold mb-8">
        <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
        <span>AI-Powered Assessment & Skill Orchestration Platform</span>
      </div>

      {/* Main Headline */}
      <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1] mb-6">
        Discover, Evaluate, and Hire <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500">
          Top Tech Talent at Scale.
        </span>
      </h1>

      {/* Subtitle */}
      <p className="max-w-3xl mx-auto text-slate-600 dark:text-slate-300 text-base sm:text-xl leading-relaxed mb-10">
        Connecting Candidates, Higher Ed Institutions, and Enterprises through Next-Gen Evaluations,
        AI Proctoring, and Industry Certifications.
      </p>

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-4 mb-16">
        <button className="px-8 py-4 rounded-xl font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-xl shadow-cyan-500/30 transition-all transform hover:-translate-y-0.5">
          Explore Assessments
        </button>
        <button className="px-8 py-4 rounded-xl font-semibold bg-white/70 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-white/10 backdrop-blur-md shadow-lg transition-all">
          For Candidates
        </button>
      </div>

      {/* Key Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto p-6 rounded-2xl bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-xl">
        <div>
          <div className="text-3xl font-extrabold text-cyan-600 dark:text-cyan-400">10M+</div>
          <div className="text-xs uppercase tracking-wider font-medium text-slate-500 dark:text-slate-400 mt-1">Candidates Assessed</div>
        </div>
        <div>
          <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">500+</div>
          <div className="text-xs uppercase tracking-wider font-medium text-slate-500 dark:text-slate-400 mt-1">Enterprise Partners</div>
        </div>
        <div>
          <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">99.4%</div>
          <div className="text-xs uppercase tracking-wider font-medium text-slate-500 dark:text-slate-400 mt-1">Proctoring Accuracy</div>
        </div>
      </div>
    </section>
  );
}

// ==========================================
// 5. CANDIDATE HUB & RESUME BUILDER
// ==========================================
function CandidateHubSection() {
  return (
    <section id="candidates" className="py-20 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-14">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
          Empowering Candidates to Stand Out
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mt-3 max-w-2xl mx-auto">
          Build industry-verified skill profiles and create recruiter-ready AI resumes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Candidate Profile Preview */}
        <div className="p-8 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-slate-200 dark:border-white/10 shadow-xl flex flex-col justify-between">
          <div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 mb-4 inline-block">
              Candidate Profile & Badges
            </span>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Verified Skill Passport
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">
              Showcase benchmark scorecards, domain ranks, and authenticated test badges directly to hiring managers across top tech firms.
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-white/5">
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Data Structures & Algorithms</span>
                <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">Top 1%</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-white/5">
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Full-Stack System Design</span>
                <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">Verified Pro</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Resume Builder */}
        <div className="p-8 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-slate-200 dark:border-white/10 shadow-xl flex flex-col justify-between">
          <div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 mb-4 inline-block">
              Smart Career Tool
            </span>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              AI Resume Builder
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">
              Generate ATS-optimized resumes auto-populated with verified NCET assessment scores, hackathon ranks, and code project metrics.
            </p>

            <div className="p-4 rounded-xl bg-slate-900 text-slate-200 text-xs font-mono border border-slate-800 space-y-2">
              <div className="text-slate-400">// AI Parser Output</div>
              <div className="text-emerald-400">✓ ATS Match Score: 96%</div>
              <div className="text-cyan-400">✓ Auto-linked NCET Verified Scorecard</div>
            </div>
          </div>
          <button className="mt-6 w-full py-3 rounded-xl font-medium bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors">
            Build My Resume
          </button>
        </div>
      </div>
    </section>
  );
}

// ==========================================
// 6. ENTERPRISE ASSESSMENTS ENGINE
// ==========================================
function AssessmentsSection() {
  const features = [
    {
      title: "AI Anti-Cheating & Proctoring",
      desc: "Multi-person detection, facial verification, audio analysis, and tab-switch browser locking.",
      icon: "🛡️",
    },
    {
      title: "Coding & Algorithm Engine",
      desc: "Real-time auto-grading across 30+ languages with custom test cases and memory benchmarks.",
      icon: "⚡",
    },
    {
      title: "Aptitude & Behavioral Profiling",
      desc: "Standardized cognitive, logical reasoning, and situational judgment battery tests.",
      icon: "🧠",
    },
    {
      title: "Custom Assessment Creation",
      desc: "Drag-and-drop question authoring, AI item generation, and company benchmark tailoring.",
      icon: "⚙️",
    },
  ];

  return (
    <section id="assessments" className="py-20 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-14">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
          Enterprise Evaluation Engine
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mt-3 max-w-2xl mx-auto">
          Comprehensive, anti-cheat assessment tools designed for high-volume hiring drives.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f, i) => (
          <div
            key={i}
            className="p-6 rounded-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-lg hover:border-cyan-500/50 transition-all"
          >
            <div className="text-3xl mb-4">{f.icon}</div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{f.title}</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ==========================================
// 7. NCET & NCET PLUS SECTION
// ==========================================
function NcetSection() {
  return (
    <section id="ncet" className="py-20 px-6 max-w-7xl mx-auto">
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 text-white border border-cyan-500/30 shadow-2xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -z-10" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="lg:col-span-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 mb-4 inline-block">
              National Standard
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-6">
              NCET & NCET Plus Certification
            </h2>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-6">
              The National Candidate Evaluation Test is the industry benchmark for entry-level and lateral tech hiring. Standardize your candidate evaluations with nationwide percentile ranking.
            </p>
            <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-300">
              <span className="flex items-center space-x-2">
                <span className="text-cyan-400">✓</span> <span>Uniform Scoring Scale</span>
              </span>
              <span className="flex items-center space-x-2">
                <span className="text-cyan-400">✓</span> <span>Direct Recruiter Visibility</span>
              </span>
              <span className="flex items-center space-x-2">
                <span className="text-cyan-400">✓</span> <span>Proctored Certification</span>
              </span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
            <div className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-2">Next NCET Slot</div>
            <div className="text-2xl font-bold text-cyan-400 mb-4">Registration Open</div>
            <button className="w-full py-3 rounded-xl font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors">
              Register for NCET
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ==========================================
// 8. SANDBOX PRO (DUAL-COLUMN IDE SECTION)
// ==========================================
function SandboxProSection() {
  const [copied, setCopied] = useState(false);

  const sampleCode = `import { type Assessment, runSuite } from '@myanatomy/sandbox';

export async function evaluateCandidate(submission: CodeSubmission) {
  const result = await runSuite(submission, {
    timeoutMs: 3000,
    memoryLimitMb: 512,
    testCases: ['unit_01', 'performance_02']
  });

  return {
    passed: result.status === 'SUCCESS',
    score: result.scorePercentage,
    executionTime: \`\${result.duration}ms\`
  };
}`;

  return (
    <section id="sandbox" className="py-20 px-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Column: Description */}
        <div className="p-8 sm:p-12 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-slate-200 dark:border-white/10 shadow-2xl">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20 mb-6 inline-block">
            Sandbox Pro
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold text-slate-900 dark:text-white leading-tight mb-6">
            Real-time Cloud IDEs <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500">
              in Plain Code.
            </span>
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed mb-8">
            Provide candidates with instant, zero-setup browser coding environments. Sandbox Pro executes real-time code evaluation, unit tests, and performance benchmark suites with integrated proctoring.
          </p>
          <div className="flex flex-wrap gap-4">
            <button className="px-6 py-3 rounded-xl font-medium bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all shadow-lg shadow-cyan-500/25">
              Launch Live Demo
            </button>
            <button className="px-6 py-3 rounded-xl font-medium bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-white border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 transition-all">
              View Documentation
            </button>
          </div>
        </div>

        {/* Right Column: IDE Code Window Mockup */}
        <div className="p-6 rounded-3xl bg-slate-900 text-slate-100 dark:bg-slate-950 dark:text-slate-200 border border-slate-700 dark:border-white/10 shadow-2xl font-mono text-sm">
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800 font-sans">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
              <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block" />
              <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
              <span className="ml-3 text-xs text-slate-400">AssessmentRunner.tsx</span>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(sampleCode);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="text-xs px-3 py-1 rounded-md bg-white/10 hover:bg-white/20 text-slate-300 transition-all"
            >
              {copied ? "Copied!" : "Copy snippet"}
            </button>
          </div>

          {/* Syntax Highlighted Code Snippet */}
          <pre className="overflow-x-auto leading-relaxed text-slate-300">
            <code>
              <span className="text-purple-400">import</span> &#123; <span className="text-cyan-300">type</span> Assessment, runSuite &#125; <span className="text-purple-400">from</span> <span className="text-emerald-400">'@myanatomy/sandbox'</span>;{"\n\n"}
              <span className="text-purple-400">export async function</span> <span className="text-blue-400">evaluateCandidate</span>(submission: <span className="text-cyan-300">CodeSubmission</span>) &#123;{"\n"}
              {"  "}<span className="text-purple-400">const</span> result = <span className="text-purple-400">await</span> <span className="text-blue-400">runSuite</span>(submission, &#123;{"\n"}
              {"    "}timeoutMs: <span className="text-orange-400">3000</span>,{"\n"}
              {"    "}memoryLimitMb: <span className="text-orange-400">512</span>,{"\n"}
              {"    "}testCases: [<span className="text-emerald-400">'unit_01'</span>, <span className="text-emerald-400">'performance_02'</span>]{"\n"}
              {"  "}&#125;);{"\n\n"}
              {"  "}<span className="text-purple-400">return</span> &#123;{"\n"}
              {"    "}passed: result.status === <span className="text-emerald-400">'SUCCESS'</span>,{"\n"}
              {"    "}score: result.scorePercentage,{"\n"}
              {"    "}executionTime: <span className="text-emerald-400 font-bold">\`&#123;result.duration&#125;ms\`</span>{"\n"}
              {"  "}&#125;;{"\n"}
              &#125;
            </code>
          </pre>
        </div>
      </div>
    </section>
  );
}

// ==========================================
// 9. UPSKILLING & ENGAGEMENT TABBED ECOSYSTEM
// ==========================================
function EcosystemSection() {
  const [activeTab, setActiveTab] = useState<"courses" | "hackathons" | "events">("courses");

  return (
    <section id="ecosystem" className="py-20 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
          Learning & Hiring Ecosystem
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mt-3 max-w-2xl mx-auto">
          Upskill, compete in live hackathons, and attend exclusive corporate hiring events.
        </p>
      </div>

      {/* Tab Selectors */}
      <div className="flex justify-center space-x-2 mb-10">
        {(["courses", "hackathons", "events"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all ${
              activeTab === tab
                ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25"
                : "bg-white/50 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10 hover:bg-white dark:hover:bg-slate-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content Display */}
      <div className="p-8 rounded-3xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-slate-200 dark:border-white/10 shadow-xl">
        {activeTab === "courses" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5">
              <h4 className="font-bold text-slate-900 dark:text-white mb-2">Full-Stack React & Node</h4>
              <p className="text-slate-600 dark:text-slate-400 text-xs">Self-paced web dev certification path with hands-on projects.</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5">
              <h4 className="font-bold text-slate-900 dark:text-white mb-2">Data Structures & AI Systems</h4>
              <p className="text-slate-600 dark:text-slate-400 text-xs">Algorithmic mastery course tailored for enterprise tech interviews.</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5">
              <h4 className="font-bold text-slate-900 dark:text-white mb-2">Cloud DevOps & Kubernetes</h4>
              <p className="text-slate-600 dark:text-slate-400 text-xs">Infrastructure engineering pathways for cloud architects.</p>
            </div>
          </div>
        )}

        {activeTab === "hackathons" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-gradient-to-tr from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
              <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400">Live Hackathon</span>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white mt-1 mb-2">National AI Innovation Challenge</h4>
              <p className="text-slate-600 dark:text-slate-300 text-xs mb-4">Build generative AI applications. Prize pool: $25,000.</p>
              <button className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-semibold text-xs">Join Challenge</button>
            </div>
            <div className="p-6 rounded-2xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5">
              <span className="text-xs font-bold text-slate-500">Upcoming</span>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white mt-1 mb-2">Full-Stack Web3 Sprint</h4>
              <p className="text-slate-600 dark:text-slate-400 text-xs mb-4">48-hour decentralized app building competition.</p>
              <button className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white font-semibold text-xs">Notify Me</button>
            </div>
          </div>
        )}

        {activeTab === "events" && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Global Tech Hiring Summit 2026</h4>
                <p className="text-xs text-slate-500">Virtual Event • Connect with 50+ enterprise recruiters</p>
              </div>
              <button className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold">RSVP</button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ==========================================
// 10. FOOTER
// ==========================================
function Footer() {
  return (
    <footer className="bg-slate-100/80 dark:bg-slate-950/80 border-t border-slate-200 dark:border-white/10 py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 dark:text-slate-400 gap-6">
        <div>
          <span className="font-bold text-slate-900 dark:text-white text-sm">MyAnatomy.ai</span>
          <p className="mt-1">© {new Date().getFullYear()} MyAnatomy Integration Pvt Ltd. All rights reserved.</p>
        </div>
        <div className="flex space-x-6">
          <a href="#" className="hover:text-cyan-500 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-cyan-500 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-cyan-500 transition-colors">Security</a>
          <a href="#" className="hover:text-cyan-500 transition-colors">Contact Support</a>
        </div>
      </div>
    </footer>
  );
}

// ==========================================
// MAIN EXPORTED LANDING PAGE APP
// ==========================================
export default function MyAnatomyLandingPage() {
  return (
    <ThemeProvider>
      <div className="min-h-screen text-slate-900 dark:text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950 transition-colors duration-500">
        {/* Interactive 3D WebGL Background */}
        <InteractiveMoleculeCanvas />

        {/* Foreground Overlay Content */}
        <div className="relative z-10">
          <Navbar />
          <HeroSection />
          <CandidateHubSection />
          <AssessmentsSection />
          <NcetSection />
          <SandboxProSection />
          <EcosystemSection />
          <Footer />
        </div>
      </div>
    </ThemeProvider>
  );
}
