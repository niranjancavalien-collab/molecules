import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  createContext,
  useContext,
} from "react";
import * as THREE from "three";
import {
  Sun,
  Moon,
  ArrowRight,
  ShieldCheck,
  Code2,
  Brain,
  SlidersHorizontal,
  Sparkles,
  FileText,
  Trophy,
  CalendarDays,
  GraduationCap,
  Copy,
  Check,
  Menu,
  X,
  Share2,
  BadgeCheck,
  Cpu,
  Github,
  Linkedin,
  Twitter,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  DESIGN TOKENS                                                      */
/* ------------------------------------------------------------------ */

const TOKENS = {
  dark: {
    name: "dark",
    surface: "#0B0F19",
    surfaceDeep: "#070A12",
    card: "rgba(15, 23, 42, 0.60)",
    cardSolid: "rgba(15, 23, 42, 0.85)",
    border: "rgba(255, 255, 255, 0.10)",
    borderStrong: "rgba(56, 189, 248, 0.50)",
    text: "#F8FAFC",
    muted: "#94A3B8",
    faint: "#64748B",
    accent: "#38BDF8",
    accent2: "#818CF8",
    chipBg: "rgba(56, 189, 248, 0.10)",
    chipText: "#7DD3FC",
    chipBorder: "rgba(56, 189, 248, 0.20)",
    navBg: "rgba(2, 6, 23, 0.70)",
    footerBg: "rgba(2, 6, 23, 0.80)",
    ideBg: "#020617",
    ideBorder: "rgba(255, 255, 255, 0.10)",
    ideText: "#E2E8F0",
    ghostHover: "rgba(255, 255, 255, 0.06)",
    glow: "0 18px 50px -12px rgba(56, 189, 248, 0.45)",
    trackBg: "rgba(148, 163, 184, 0.15)",
    particle: "#38BDF8",
    particleOpacity: 0.8,
    lineOpacity: 0.16,
    additive: true,
  },
  light: {
    name: "light",
    surface: "#F8FAFC",
    surfaceDeep: "#EEF2F7",
    card: "rgba(255, 255, 255, 0.75)",
    cardSolid: "rgba(255, 255, 255, 0.92)",
    border: "#E2E8F0",
    borderStrong: "rgba(2, 132, 199, 0.30)",
    text: "#0F172A",
    muted: "#475569",
    faint: "#64748B",
    accent: "#0284C7",
    accent2: "#4F46E5",
    chipBg: "rgba(2, 132, 199, 0.10)",
    chipText: "#0369A1",
    chipBorder: "rgba(2, 132, 199, 0.20)",
    navBg: "rgba(255, 255, 255, 0.80)",
    footerBg: "rgba(241, 245, 249, 0.80)",
    ideBg: "#0F172A",
    ideBorder: "#334155",
    ideText: "#F1F5F9",
    ghostHover: "rgba(15, 23, 42, 0.05)",
    glow: "0 18px 45px -14px rgba(2, 132, 199, 0.45)",
    trackBg: "rgba(100, 116, 139, 0.18)",
    particle: "#0284C7",
    particleOpacity: 0.45,
    lineOpacity: 0.12,
    additive: false,
  },
};

const ThemeCtx = createContext({ t: TOKENS.dark, theme: "dark", toggle: () => {} });
const useTheme = () => useContext(ThemeCtx);

const FONT_UI =
  '"Plus Jakarta Sans", "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif';
const FONT_MONO =
  '"JetBrains Mono", "Fira Code", ui-monospace, SFMono-Regular, Menlo, monospace';

/* ------------------------------------------------------------------ */
/*  MOTION HELPERS                                                     */
/* ------------------------------------------------------------------ */

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    if (mq.addEventListener) mq.addEventListener("change", update);
    else mq.addListener(update);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", update);
      else mq.removeListener(update);
    };
  }, []);
  return reduced;
}

/** Scroll-triggered fade-in-up, spring-ish easing. Stands in for Framer Motion's whileInView. */
function Reveal({ children, delay = 0, y = 26, className = "", as: Tag = "div" }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) {
      setShown(true);
      return;
    }
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShown(true);
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [reduced]);

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0px)" : `translateY(${y}px)`,
        transition: reduced
          ? "none"
          : `opacity 620ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 720ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </Tag>
  );
}

/* ------------------------------------------------------------------ */
/*  3D MOLECULAR PARTICLE FIELD (three.js, client-only)                */
/* ------------------------------------------------------------------ */

const PARTICLE_COUNT = 1800;
const SPREAD = 26;

function MoleculeField() {
  const { t } = useTheme();
  const mountRef = useRef(null);
  const reduced = usePrefersReducedMotion();

  // Mutable scene handles so theme changes don't rebuild the geometry.
  const sceneRef = useRef({});

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || typeof window === "undefined") return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      62,
      mount.clientWidth / mount.clientHeight,
      0.1,
      200
    );
    camera.position.z = 30;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch (err) {
      // No WebGL — the flat surface colour underneath is a fine fallback.
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // --- node positions -------------------------------------------------
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Clustered shells read more like molecular structure than a flat cube.
      const shell = SPREAD * (0.35 + 0.65 * Math.cbrt(Math.random()));
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = shell * Math.sin(phi) * Math.cos(theta) * 1.25;
      positions[i * 3 + 1] = shell * Math.sin(phi) * Math.sin(theta) * 0.85;
      positions[i * 3 + 2] = shell * Math.cos(phi) * 0.7;
    }

    const pointsGeo = new THREE.BufferGeometry();
    pointsGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const pointsMat = new THREE.PointsMaterial({
      size: 0.16,
      sizeAttenuation: true,
      transparent: true,
      depthWrite: false,
    });
    const points = new THREE.Points(pointsGeo, pointsMat);

    // --- bonds between near neighbours ----------------------------------
    const bonds = [];
    const maxBonds = 900;
    const threshold = 3.1;
    const sample = 620; // keep the O(n²) pass cheap
    outer: for (let i = 0; i < sample; i++) {
      for (let j = i + 1; j < sample; j++) {
        const dx = positions[i * 3] - positions[j * 3];
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
        if (dx * dx + dy * dy + dz * dz < threshold * threshold) {
          bonds.push(
            positions[i * 3],
            positions[i * 3 + 1],
            positions[i * 3 + 2],
            positions[j * 3],
            positions[j * 3 + 1],
            positions[j * 3 + 2]
          );
          if (bonds.length / 6 >= maxBonds) break outer;
        }
      }
    }
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(bonds), 3)
    );
    const lineMat = new THREE.LineBasicMaterial({
      transparent: true,
      depthWrite: false,
    });
    const lines = new THREE.LineSegments(lineGeo, lineMat);

    const group = new THREE.Group();
    group.add(points);
    group.add(lines);
    scene.add(group);

    // --- pointer tracking ------------------------------------------------
    const pointer = { x: 0, y: 0 };
    const eased = { x: 0, y: 0 };
    const onPointerMove = (e) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    const onResize = () => {
      if (!mount.clientWidth || !mount.clientHeight) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", onResize);

    let raf = 0;
    const clock = new THREE.Clock();
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // ambient drift
      group.rotation.y = elapsed * 0.045;
      group.rotation.x = Math.sin(elapsed * 0.22) * 0.06;

      // pointer tilt / shift, smoothed
      eased.x += (pointer.x - eased.x) * 0.045;
      eased.y += (pointer.y - eased.y) * 0.045;
      group.rotation.y += eased.x * 0.35;
      group.rotation.x += eased.y * 0.22;
      group.position.x = eased.x * 1.9;
      group.position.y = eased.y * 1.3;

      renderer.render(scene, camera);
    };
    animate();

    sceneRef.current = { pointsMat, lineMat, renderer };

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", onResize);
      pointsGeo.dispose();
      lineGeo.dispose();
      pointsMat.dispose();
      lineMat.dispose();
      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
      sceneRef.current = {};
    };
  }, [reduced]);

  // Theme-reactive material: colour, opacity, blending mode.
  useEffect(() => {
    const { pointsMat, lineMat } = sceneRef.current;
    if (!pointsMat || !lineMat) return;
    const blending = t.additive ? THREE.AdditiveBlending : THREE.NormalBlending;

    pointsMat.color = new THREE.Color(t.particle);
    pointsMat.opacity = t.particleOpacity;
    pointsMat.blending = blending;
    pointsMat.size = t.additive ? 0.16 : 0.13;
    pointsMat.needsUpdate = true;

    lineMat.color = new THREE.Color(t.accent2);
    lineMat.opacity = t.lineOpacity;
    lineMat.blending = blending;
    lineMat.needsUpdate = true;
  }, [t]);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        background: t.surface,
        transition: "background 400ms ease",
      }}
    >
      <div ref={mountRef} style={{ width: "100%", height: "100%" }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: t.additive
            ? "radial-gradient(1100px 620px at 50% -5%, rgba(56,189,248,0.16), transparent 70%)"
            : "radial-gradient(1100px 620px at 50% -5%, rgba(2,132,199,0.12), transparent 70%)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

/** Mounts the canvas only after hydration — the SSR-safe boundary. */
function ClientOnly({ children }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? children : null;
}

/* ------------------------------------------------------------------ */
/*  PRIMITIVES                                                         */
/* ------------------------------------------------------------------ */

function GradientText({ children, style }) {
  const { t } = useTheme();
  return (
    <span
      style={{
        backgroundImage: `linear-gradient(100deg, ${t.accent}, ${t.accent2})`,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        ...style,
      }}
    >
      {children}
    </span>
  );
}

function PrimaryButton({ children, size = "md", icon: Icon = null, ...rest }) {
  const { t } = useTheme();
  const [hover, setHover] = useState(false);
  const pad = size === "lg" ? "14px 26px" : "10px 18px";
  return (
    <button
      {...rest}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="inline-flex items-center justify-center gap-2 rounded-full font-semibold"
      style={{
        padding: pad,
        fontSize: size === "lg" ? 16 : 14,
        color: "#FFFFFF",
        border: "none",
        cursor: "pointer",
        backgroundImage: `linear-gradient(100deg, ${t.accent}, ${t.accent2})`,
        boxShadow: hover ? t.glow : "0 8px 22px -14px rgba(0,0,0,0.6)",
        transform: hover ? "translateY(-1px)" : "translateY(0)",
        transition: "box-shadow 220ms ease, transform 220ms ease",
      }}
    >
      {children}
      {Icon ? <Icon size={size === "lg" ? 18 : 16} /> : null}
    </button>
  );
}

function OutlineButton({ children, size = "md", icon: Icon = null, ...rest }) {
  const { t } = useTheme();
  const [hover, setHover] = useState(false);
  return (
    <button
      {...rest}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="inline-flex items-center justify-center gap-2 rounded-full font-semibold"
      style={{
        padding: size === "lg" ? "14px 26px" : "10px 18px",
        fontSize: size === "lg" ? 16 : 14,
        color: t.text,
        background: hover ? t.ghostHover : "transparent",
        border: `1px solid ${hover ? t.borderStrong : t.border}`,
        cursor: "pointer",
        transition: "background 200ms ease, border-color 200ms ease",
      }}
    >
      {children}
      {Icon ? <Icon size={size === "lg" ? 18 : 16} /> : null}
    </button>
  );
}

function GhostButton({ children, ...rest }) {
  const { t } = useTheme();
  const [hover, setHover] = useState(false);
  return (
    <button
      {...rest}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="rounded-full font-semibold"
      style={{
        padding: "10px 16px",
        fontSize: 14,
        color: hover ? t.text : t.muted,
        background: hover ? t.ghostHover : "transparent",
        border: "none",
        cursor: "pointer",
        transition: "color 180ms ease, background 180ms ease",
      }}
    >
      {children}
    </button>
  );
}

function Chip({ children, icon: Icon = null }) {
  const { t } = useTheme();
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full"
      style={{
        padding: "7px 14px",
        fontSize: 13,
        fontWeight: 600,
        color: t.chipText,
        background: t.chipBg,
        border: `1px solid ${t.chipBorder}`,
      }}
    >
      {Icon ? <Icon size={14} /> : null}
      {children}
    </span>
  );
}

function GlassCard({ children, className = "", style, padded = true }) {
  const { t } = useTheme();
  return (
    <div
      className={`rounded-3xl backdrop-blur-2xl shadow-xl ${padded ? "p-8" : ""} ${className}`}
      style={{
        background: t.card,
        border: `1px solid ${t.border}`,
        transition: "background 300ms ease, border-color 300ms ease",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SectionHeading({ eyebrow, title, blurb, align = "left" }) {
  const { t } = useTheme();
  return (
    <div
      style={{
        textAlign: align,
        maxWidth: align === "center" ? 720 : 640,
        margin: align === "center" ? "0 auto" : undefined,
      }}
    >
      {eyebrow ? <Chip>{eyebrow}</Chip> : null}
      <h2
        className="font-bold"
        style={{
          fontSize: "clamp(28px, 3.6vw, 42px)",
          lineHeight: 1.12,
          letterSpacing: "-0.025em",
          color: t.text,
          marginTop: eyebrow ? 20 : 0,
        }}
      >
        {title}
      </h2>
      {blurb ? (
        <p
          style={{
            marginTop: 16,
            fontSize: 17,
            lineHeight: 1.65,
            color: t.muted,
          }}
        >
          {blurb}
        </p>
      ) : null}
    </div>
  );
}

function Section({ id, children, style }) {
  return (
    <section
      id={id}
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "96px 24px",
        ...style,
      }}
    >
      {children}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  A. NAVBAR                                                          */
/* ------------------------------------------------------------------ */

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
  const { t, theme, toggle } = useTheme();
  const [hover, setHover] = useState(false);
  const isDark = theme === "dark";
  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="inline-flex items-center justify-center rounded-full"
      style={{
        width: 40,
        height: 40,
        color: t.accent,
        background: hover ? t.chipBg : "transparent",
        border: `1px solid ${t.border}`,
        cursor: "pointer",
        transition: "background 200ms ease, transform 300ms ease",
        transform: hover ? "rotate(18deg)" : "rotate(0deg)",
      }}
    >
      {isDark ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
}

function Navbar() {
  const { t } = useTheme();
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(null);

  return (
    <header
      className="backdrop-blur-md"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: t.navBg,
        borderBottom: `1px solid ${t.border}`,
        transition: "background 300ms ease, border-color 300ms ease",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          gap: 20,
        }}
      >
        <a
          href="#top"
          style={{
            fontWeight: 800,
            fontSize: 19,
            letterSpacing: "-0.02em",
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
        >
          <GradientText>MyAnatomy</GradientText>
          <span style={{ color: t.muted, fontWeight: 600 }}>.ai</span>
        </a>

        <nav className="hidden lg:flex items-center" style={{ gap: 4, marginLeft: 12 }}>
          {NAV_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onMouseEnter={() => setHovered(l.label)}
              onMouseLeave={() => setHovered(null)}
              style={{
                fontSize: 14,
                fontWeight: 500,
                padding: "8px 11px",
                borderRadius: 999,
                textDecoration: "none",
                whiteSpace: "nowrap",
                color: hovered === l.label ? t.accent : t.muted,
                background: hovered === l.label ? t.ghostHover : "transparent",
                transition: "color 180ms ease, background 180ms ease",
              }}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center" style={{ gap: 10, marginLeft: "auto" }}>
          <ThemeToggle />
          <div className="hidden sm:flex items-center" style={{ gap: 8 }}>
            <GhostButton>Sign in</GhostButton>
            <PrimaryButton>Get started</PrimaryButton>
          </div>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle navigation"
            className="lg:hidden inline-flex items-center justify-center rounded-full"
            style={{
              width: 40,
              height: 40,
              color: t.text,
              background: "transparent",
              border: `1px solid ${t.border}`,
              cursor: "pointer",
            }}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open ? (
        <div
          className="lg:hidden"
          style={{
            borderTop: `1px solid ${t.border}`,
            padding: "12px 24px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {NAV_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              style={{
                color: t.muted,
                textDecoration: "none",
                fontSize: 15,
                padding: "10px 4px",
              }}
            >
              {l.label}
            </a>
          ))}
          <div className="sm:hidden flex items-center" style={{ gap: 8, marginTop: 10 }}>
            <GhostButton>Sign in</GhostButton>
            <PrimaryButton>Get started</PrimaryButton>
          </div>
        </div>
      ) : null}
    </header>
  );
}

/* ------------------------------------------------------------------ */
/*  B. HERO                                                            */
/* ------------------------------------------------------------------ */

const METRICS = [
  { value: "10M+", label: "Candidates assessed" },
  { value: "500+", label: "Enterprise partners" },
  { value: "99.4%", label: "Proctoring accuracy" },
];

function Hero() {
  const { t } = useTheme();
  return (
    <Section id="top" style={{ paddingTop: 96, paddingBottom: 72, textAlign: "center" }}>
      <Reveal>
        <Chip icon={Sparkles}>AI-powered assessment &amp; skill orchestration platform</Chip>
      </Reveal>

      <Reveal delay={90}>
        <h1
          className="font-extrabold"
          style={{
            marginTop: 28,
            fontSize: "clamp(38px, 6vw, 68px)",
            lineHeight: 1.06,
            letterSpacing: "-0.035em",
            color: t.text,
            maxWidth: 980,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Discover, evaluate, and hire top tech talent at scale.
        </h1>
      </Reveal>

      <Reveal delay={170}>
        <p
          style={{
            marginTop: 24,
            fontSize: 18,
            lineHeight: 1.7,
            color: t.muted,
            maxWidth: 720,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Connecting candidates, higher-ed institutions, and enterprises through next-gen
          evaluations, AI proctoring, and industry certifications.
        </p>
      </Reveal>

      <Reveal delay={240}>
        <div
          className="flex flex-wrap items-center justify-center"
          style={{ gap: 14, marginTop: 36 }}
        >
          <PrimaryButton size="lg" icon={ArrowRight}>
            Explore assessments
          </PrimaryButton>
          <OutlineButton size="lg">For candidates</OutlineButton>
        </div>
      </Reveal>

      <Reveal delay={320}>
        <div
          className="grid grid-cols-1 sm:grid-cols-3 rounded-3xl backdrop-blur-2xl"
          style={{
            marginTop: 64,
            background: t.card,
            border: `1px solid ${t.border}`,
            overflow: "hidden",
          }}
        >
          {METRICS.map((m, i) => (
            <div
              key={m.label}
              style={{
                padding: "28px 20px",
                borderLeft: i === 0 ? "none" : `1px solid ${t.border}`,
              }}
            >
              <div
                className="font-extrabold"
                style={{ fontSize: 34, letterSpacing: "-0.03em", lineHeight: 1.1 }}
              >
                <GradientText>{m.value}</GradientText>
              </div>
              <div style={{ marginTop: 6, fontSize: 14, color: t.muted }}>{m.label}</div>
            </div>
          ))}
        </div>
      </Reveal>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  C. CANDIDATE HUB + AI RESUME BUILDER                               */
/* ------------------------------------------------------------------ */

function SkillBar({ label, value }) {
  const { t } = useTheme();
  const ref = useRef(null);
  const [fill, setFill] = useState(0);
  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setFill(value);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setFill(value);
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [value]);

  return (
    <div ref={ref} style={{ marginTop: 14 }}>
      <div className="flex items-center justify-between" style={{ fontSize: 13 }}>
        <span style={{ color: t.muted }}>{label}</span>
        <span style={{ color: t.text, fontWeight: 600 }}>{value}</span>
      </div>
      <div
        style={{
          height: 7,
          borderRadius: 999,
          background: t.trackBg,
          marginTop: 7,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${fill}%`,
            borderRadius: 999,
            backgroundImage: `linear-gradient(90deg, ${t.accent}, ${t.accent2})`,
            transition: "width 1100ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />
      </div>
    </div>
  );
}

function Badge({ children, icon: Icon = BadgeCheck }) {
  const { t } = useTheme();
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full"
      style={{
        padding: "5px 11px",
        fontSize: 12.5,
        fontWeight: 600,
        color: t.text,
        background: t.ghostHover,
        border: `1px solid ${t.border}`,
      }}
    >
      <Icon size={13} style={{ color: t.accent }} />
      {children}
    </span>
  );
}

function CandidateHub() {
  const { t } = useTheme();
  return (
    <Section id="candidates">
      <Reveal>
        <SectionHeading
          eyebrow="Candidate hub"
          title="One profile that proves what a candidate can actually do."
          blurb="Verified skills, domain ranking, and career readiness in a single record recruiters can trust — paired with a resume that writes and tunes itself."
        />
      </Reveal>

      <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 24, marginTop: 48 }}>
        {/* Dashboard preview */}
        <Reveal delay={80}>
          <GlassCard style={{ height: "100%" }}>
            <div className="flex items-center justify-between">
              <div>
                <div style={{ fontSize: 13, color: t.muted }}>Career readiness</div>
                <div
                  className="font-extrabold"
                  style={{ fontSize: 44, lineHeight: 1.1, letterSpacing: "-0.03em" }}
                >
                  <GradientText>84</GradientText>
                  <span style={{ fontSize: 18, color: t.faint, fontWeight: 600 }}> / 100</span>
                </div>
              </div>
              <div
                className="rounded-2xl"
                style={{
                  padding: "12px 16px",
                  background: t.chipBg,
                  border: `1px solid ${t.chipBorder}`,
                  textAlign: "right",
                }}
              >
                <div style={{ fontSize: 12, color: t.muted }}>Domain rank</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: t.text }}>#312</div>
                <div style={{ fontSize: 11.5, color: t.chipText }}>Full-stack · India</div>
              </div>
            </div>

            <div className="flex flex-wrap" style={{ gap: 8, marginTop: 22 }}>
              <Badge>React verified</Badge>
              <Badge>SQL verified</Badge>
              <Badge>System design</Badge>
              <Badge icon={ShieldCheck}>Proctored</Badge>
            </div>

            <div style={{ marginTop: 22 }}>
              <SkillBar label="Data structures &amp; algorithms" value={88} />
              <SkillBar label="Frontend engineering" value={92} />
              <SkillBar label="Communication" value={76} />
            </div>

            <div
              style={{
                marginTop: 24,
                paddingTop: 18,
                borderTop: `1px solid ${t.border}`,
                fontSize: 13.5,
                color: t.muted,
              }}
            >
              Last assessment: NCET Plus · Cleared with distinction
            </div>
          </GlassCard>
        </Reveal>

        {/* AI resume builder */}
        <Reveal delay={160}>
          <GlassCard style={{ height: "100%" }}>
            <Chip icon={Sparkles}>AI resume builder</Chip>
            <h3
              className="font-bold"
              style={{
                marginTop: 18,
                fontSize: 26,
                letterSpacing: "-0.02em",
                color: t.text,
                lineHeight: 1.2,
              }}
            >
              Rewrites the resume around the role, not the template.
            </h3>
            <p style={{ marginTop: 12, fontSize: 15.5, lineHeight: 1.65, color: t.muted }}>
              Pulls verified assessment evidence into the profile, rephrases weak bullets, and
              matches the keywords a specific job description screens for.
            </p>

            <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { icon: FileText, title: "Bullet rewriting", copy: "Turns duties into measurable outcomes." },
                { icon: Cpu, title: "ATS keyword match", copy: "Scores against the JD before it's sent." },
                { icon: Share2, title: "One-click recruiter share", copy: "A live link, always current." },
              ].map((f) => (
                <div
                  key={f.title}
                  className="rounded-2xl"
                  style={{
                    padding: "14px 16px",
                    background: t.ghostHover,
                    border: `1px solid ${t.border}`,
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-start",
                  }}
                >
                  <f.icon size={18} style={{ color: t.accent, marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 650, fontSize: 15, color: t.text }}>{f.title}</div>
                    <div style={{ fontSize: 13.5, color: t.muted, marginTop: 2 }}>{f.copy}</div>
                  </div>
                </div>
              ))}
            </div>

            <div
              className="rounded-2xl"
              style={{
                marginTop: 18,
                padding: "14px 16px",
                background: t.chipBg,
                border: `1px solid ${t.chipBorder}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <span style={{ fontSize: 14, color: t.text, fontWeight: 600 }}>
                ATS match for “Frontend Engineer II”
              </span>
              <span style={{ fontSize: 18, fontWeight: 800, color: t.accent }}>91%</span>
            </div>
          </GlassCard>
        </Reveal>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  D. ENTERPRISE ASSESSMENTS ENGINE                                   */
/* ------------------------------------------------------------------ */

const ENGINE = [
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

function EngineCard({ item, delay }) {
  const { t } = useTheme();
  const [hover, setHover] = useState(false);
  return (
    <Reveal delay={delay}>
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className="rounded-3xl backdrop-blur-2xl p-7 shadow-xl"
        style={{
          height: "100%",
          background: t.card,
          border: `1px solid ${hover ? t.borderStrong : t.border}`,
          transition: "border-color 250ms ease",
        }}
      >
        <div
          className="inline-flex items-center justify-center rounded-2xl"
          style={{
            width: 46,
            height: 46,
            background: t.chipBg,
            border: `1px solid ${t.chipBorder}`,
            color: t.accent,
          }}
        >
          <item.icon size={22} />
        </div>
        <h3
          className="font-bold"
          style={{ marginTop: 18, fontSize: 19, color: t.text, letterSpacing: "-0.015em" }}
        >
          {item.title}
        </h3>
        <p style={{ marginTop: 10, fontSize: 14.5, lineHeight: 1.6, color: t.muted }}>
          {item.copy}
        </p>
        <ul style={{ marginTop: 16, listStyle: "none", padding: 0 }}>
          {item.points.map((p) => (
            <li
              key={p}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13.5,
                color: t.muted,
                padding: "5px 0",
              }}
            >
              <Check size={14} style={{ color: t.accent, flexShrink: 0 }} />
              {p}
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
}

function AssessmentsEngine() {
  return (
    <Section id="assessments">
      <Reveal>
        <SectionHeading
          eyebrow="Enterprise assessments engine"
          title="Evaluation infrastructure that holds up under audit."
          blurb="Every attempt is proctored, scored, and traceable — so a hiring decision can be explained months later."
        />
      </Reveal>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4" style={{ gap: 20, marginTop: 48 }}>
        {ENGINE.map((item, i) => (
          <EngineCard key={item.title} item={item} delay={i * 70} />
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  E. NCET & NCET PLUS                                                */
/* ------------------------------------------------------------------ */

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

function NcetSection() {
  const { t } = useTheme();
  const ref = useRef(null);
  const [grown, setGrown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setGrown(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setGrown(true);
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.35 }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, []);

  return (
    <Section id="ncet">
      <Reveal>
        <div
          className="rounded-3xl backdrop-blur-2xl shadow-2xl"
          style={{
            background: t.card,
            border: `1px solid ${t.borderStrong}`,
            boxShadow: t.glow,
            padding: "clamp(28px, 4vw, 52px)",
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 40 }}>
            <div>
              <Chip icon={GraduationCap}>NCET &amp; NCET Plus</Chip>
              <h2
                className="font-bold"
                style={{
                  marginTop: 20,
                  fontSize: "clamp(27px, 3.4vw, 38px)",
                  lineHeight: 1.14,
                  letterSpacing: "-0.025em",
                  color: t.text,
                }}
              >
                The National Candidate Evaluation Test, and the deeper one.
              </h2>
              <p style={{ marginTop: 16, fontSize: 16, lineHeight: 1.7, color: t.muted }}>
                NCET is the standardised baseline: aptitude, reasoning, and core programming in a
                proctored two-hour window. NCET Plus adds a system-design case, a live coding round
                in Sandbox Pro, and a communication assessment for roles that need more evidence.
              </p>

              <div className="grid grid-cols-2" style={{ gap: 14, marginTop: 26 }}>
                {[
                  { k: "NCET", v: "120 min · 90 questions · 3 attempts a year" },
                  { k: "NCET Plus", v: "210 min · adds design, live code, viva" },
                ].map((x) => (
                  <div
                    key={x.k}
                    className="rounded-2xl"
                    style={{ padding: 16, background: t.ghostHover, border: `1px solid ${t.border}` }}
                  >
                    <div style={{ fontWeight: 700, color: t.text, fontSize: 15 }}>{x.k}</div>
                    <div style={{ fontSize: 13.5, color: t.muted, marginTop: 6, lineHeight: 1.5 }}>
                      {x.v}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap" style={{ gap: 8, marginTop: 24 }}>
                <Badge>142 partner institutions</Badge>
                <Badge>Score valid 24 months</Badge>
                <Badge icon={ShieldCheck}>Remote proctored</Badge>
              </div>

              <div className="flex flex-wrap" style={{ gap: 12, marginTop: 28 }}>
                <PrimaryButton icon={ArrowRight}>Register for NCET</PrimaryButton>
                <OutlineButton>Compare NCET Plus</OutlineButton>
              </div>
            </div>

            <div>
              <div
                className="rounded-2xl"
                style={{ padding: 22, background: t.ghostHover, border: `1px solid ${t.border}` }}
              >
                <div className="flex items-baseline justify-between">
                  <span style={{ fontSize: 15, fontWeight: 700, color: t.text }}>
                    Score distribution
                  </span>
                  <span style={{ fontSize: 12.5, color: t.faint }}>
                    Cycle 2026-A · 418,902 attempts
                  </span>
                </div>

                <div
                  ref={ref}
                  style={{
                    marginTop: 26,
                    display: "flex",
                    alignItems: "flex-end",
                    gap: 12,
                    height: 168,
                  }}
                >
                  {DISTRIBUTION.map((d, i) => (
                    <div key={d.band} style={{ flex: 1, textAlign: "center" }}>
                      <div style={{ fontSize: 12, color: t.muted, marginBottom: 6 }}>{d.pct}%</div>
                      <div
                        style={{
                          height: grown ? `${(d.pct / 34) * 118}px` : "0px",
                          borderRadius: "8px 8px 4px 4px",
                          backgroundImage: `linear-gradient(180deg, ${t.accent}, ${t.accent2})`,
                          opacity: 0.9,
                          transition: `height 900ms cubic-bezier(0.16, 1, 0.3, 1) ${i * 80}ms`,
                        }}
                      />
                      <div style={{ fontSize: 11.5, color: t.faint, marginTop: 8 }}>{d.band}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div
                className="rounded-2xl"
                style={{
                  marginTop: 16,
                  padding: 22,
                  background: t.ghostHover,
                  border: `1px solid ${t.border}`,
                }}
              >
                <div style={{ fontSize: 15, fontWeight: 700, color: t.text }}>Test windows</div>
                {SCHEDULE.map((s, i) => (
                  <div
                    key={s.window}
                    className="flex items-center justify-between"
                    style={{
                      padding: "12px 0",
                      borderTop: i === 0 ? "none" : `1px solid ${t.border}`,
                      marginTop: i === 0 ? 8 : 0,
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 14, color: t.text, fontWeight: 600 }}>{s.window}</div>
                      <div style={{ fontSize: 12.5, color: t.faint }}>{s.date}</div>
                    </div>
                    <span
                      className="rounded-full"
                      style={{
                        padding: "5px 11px",
                        fontSize: 12,
                        fontWeight: 600,
                        color: i === 0 ? t.chipText : t.muted,
                        background: i === 0 ? t.chipBg : "transparent",
                        border: `1px solid ${i === 0 ? t.chipBorder : t.border}`,
                      }}
                    >
                      {s.status}
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

/* ------------------------------------------------------------------ */
/*  F. SANDBOX PRO                                                     */
/* ------------------------------------------------------------------ */

const CODE_SNIPPET = `import { runSuite } from "@myanatomy/sandbox";

export async function evaluateSubmission(attempt) {
  const sandbox = await runSuite({
    language: attempt.language,
    source: attempt.source,
    memoryLimitMb: 256,
    timeoutMs: 4000,
  });

  const passed = sandbox.tests.filter((t) => t.ok);

  return {
    score: (passed.length / sandbox.tests.length) * 100,
    runtimeMs: sandbox.runtimeMs,
    similarity: await sandbox.plagiarismScan(),
    flags: attempt.proctorEvents.map((e) => e.type),
  };
}`;

/** Tiny hand-rolled highlighter — enough for a faithful IDE mock. */
function highlight(line, c) {
  const tokens = [];
  const rx =
    /(\/\/[^\n]*)|("(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`)|\b(import|from|export|async|function|await|const|return|filter|map)\b|\b(\d+)\b|([A-Za-z_$][\w$]*)(?=\()/g;
  let last = 0;
  let m;
  while ((m = rx.exec(line)) !== null) {
    if (m.index > last) tokens.push({ text: line.slice(last, m.index), color: c.base });
    if (m[1]) tokens.push({ text: m[1], color: c.comment });
    else if (m[2]) tokens.push({ text: m[2], color: c.string });
    else if (m[3]) tokens.push({ text: m[3], color: c.keyword });
    else if (m[4]) tokens.push({ text: m[4], color: c.number });
    else if (m[5]) tokens.push({ text: m[5], color: c.fn });
    last = rx.lastIndex;
  }
  if (last < line.length) tokens.push({ text: line.slice(last), color: c.base });
  return tokens;
}

function SandboxPro() {
  const { t, theme } = useTheme();
  const [copied, setCopied] = useState(false);

  const colors = useMemo(
    () => ({
      base: "#CBD5E1",
      comment: "#64748B",
      string: "#86EFAC",
      keyword: "#C4B5FD",
      number: "#FDBA74",
      fn: "#7DD3FC",
    }),
    []
  );

  const copy = useCallback(async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(CODE_SNIPPET);
      } else {
        const ta = document.createElement("textarea");
        ta.value = CODE_SNIPPET;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (e) {
      setCopied(false);
    }
  }, []);

  return (
    <Section id="sandbox">
      <Reveal>
        <div
          className="rounded-3xl backdrop-blur-2xl shadow-2xl"
          style={{
            background: t.card,
            border: `1px solid ${t.border}`,
            padding: "clamp(24px, 3.5vw, 44px)",
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 36, alignItems: "center" }}>
            <div>
              <Chip icon={Code2}>Sandbox Pro</Chip>
              <h2
                className="font-bold"
                style={{
                  marginTop: 20,
                  fontSize: "clamp(27px, 3.4vw, 38px)",
                  lineHeight: 1.14,
                  letterSpacing: "-0.025em",
                  color: t.text,
                }}
              >
                Real-time cloud IDEs in plain code.
              </h2>
              <p style={{ marginTop: 16, fontSize: 16, lineHeight: 1.7, color: t.muted }}>
                Candidates open a browser tab and start typing — no installs, no environment drift.
                Every submission runs against your unit tests inside an isolated container with a
                256 MB memory ceiling and a hard timeout, while proctoring and anti-plagiarism run
                alongside the session.
              </p>

              <div className="flex flex-wrap" style={{ gap: 8, marginTop: 22 }}>
                <Badge icon={Cpu}>Zero setup</Badge>
                <Badge icon={Check}>Automated unit tests</Badge>
                <Badge icon={ShieldCheck}>Similarity scan</Badge>
              </div>

              <div className="flex flex-wrap" style={{ gap: 12, marginTop: 28 }}>
                <PrimaryButton icon={ArrowRight}>Launch live demo</PrimaryButton>
                <OutlineButton>View documentation</OutlineButton>
              </div>
            </div>

            {/* IDE mockup */}
            <div
              className="rounded-2xl shadow-2xl"
              style={{
                background: t.ideBg,
                border: `1px solid ${t.ideBorder}`,
                overflow: "hidden",
              }}
            >
              <div
                className="flex items-center"
                style={{
                  gap: 10,
                  padding: "12px 14px",
                  borderBottom: `1px solid ${t.ideBorder}`,
                  background: "rgba(255,255,255,0.03)",
                }}
              >
                <span style={{ display: "flex", gap: 6 }}>
                  {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
                    <span
                      key={c}
                      style={{ width: 11, height: 11, borderRadius: 999, background: c, display: "block" }}
                    />
                  ))}
                </span>
                <span
                  className="rounded-md"
                  style={{
                    marginLeft: 8,
                    padding: "4px 10px",
                    fontSize: 12,
                    fontFamily: FONT_MONO,
                    color: "#E2E8F0",
                    background: "rgba(255,255,255,0.07)",
                  }}
                >
                  AssessmentRunner.tsx
                </span>
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: 11.5,
                    fontFamily: FONT_MONO,
                    color: "#64748B",
                  }}
                >
                  {theme === "dark" ? "theme: night-ops" : "theme: daylight"}
                </span>
                <button
                  onClick={copy}
                  className="inline-flex items-center gap-1.5 rounded-md"
                  style={{
                    padding: "5px 9px",
                    fontSize: 11.5,
                    fontFamily: FONT_MONO,
                    color: copied ? "#86EFAC" : "#94A3B8",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    cursor: "pointer",
                  }}
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? "Copied" : "Copy snippet"}
                </button>
              </div>

              <pre
                style={{
                  margin: 0,
                  padding: "22px 20px",
                  fontFamily: FONT_MONO,
                  fontSize: 12.5,
                  lineHeight: 1.75,
                  color: t.ideText,
                  overflowX: "auto",
                }}
              >
                {CODE_SNIPPET.split("\n").map((line, i) => (
                  <div key={i} style={{ display: "flex" }}>
                    <span
                      style={{
                        width: 28,
                        flexShrink: 0,
                        color: "#475569",
                        userSelect: "none",
                        textAlign: "right",
                        paddingRight: 14,
                      }}
                    >
                      {i + 1}
                    </span>
                    <span style={{ whiteSpace: "pre" }}>
                      {highlight(line, colors).map((tok, k) => (
                        <span key={k} style={{ color: tok.color }}>
                          {tok.text}
                        </span>
                      ))}
                    </span>
                  </div>
                ))}
              </pre>

              <div
                className="flex items-center justify-between"
                style={{
                  padding: "10px 16px",
                  borderTop: `1px solid ${t.ideBorder}`,
                  fontFamily: FONT_MONO,
                  fontSize: 11.5,
                  color: "#64748B",
                }}
              >
                <span>18 / 18 tests passed</span>
                <span>412 ms · 61 MB</span>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  G. UPSKILLING & ENGAGEMENT                                         */
/* ------------------------------------------------------------------ */

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

function Ecosystem() {
  const { t } = useTheme();
  const [active, setActive] = useState("courses");
  const tab = TABS.find((x) => x.id === active) || TABS[0];

  return (
    <Section id="ecosystem">
      <Reveal>
        <SectionHeading
          align="center"
          eyebrow="Upskilling &amp; engagement"
          title="Assessment is the start of the relationship, not the end of it."
          blurb="Courses, hackathons, and events keep candidates active on the platform between evaluations — and keep partners in front of them."
        />
      </Reveal>

      <Reveal delay={90}>
        <div
          className="flex flex-wrap items-center justify-center rounded-full"
          style={{
            gap: 6,
            padding: 6,
            marginTop: 36,
            width: "fit-content",
            marginLeft: "auto",
            marginRight: "auto",
            background: t.card,
            border: `1px solid ${t.border}`,
          }}
        >
          {TABS.map((x) => {
            const on = x.id === active;
            return (
              <button
                key={x.id}
                onClick={() => setActive(x.id)}
                className="inline-flex items-center gap-2 rounded-full font-semibold"
                style={{
                  padding: "10px 20px",
                  fontSize: 14,
                  color: on ? "#FFFFFF" : t.muted,
                  backgroundImage: on
                    ? `linear-gradient(100deg, ${t.accent}, ${t.accent2})`
                    : "none",
                  background: on ? undefined : "transparent",
                  border: "none",
                  cursor: "pointer",
                  transition: "color 200ms ease",
                }}
              >
                <x.icon size={15} />
                {x.label}
              </button>
            );
          })}
        </div>
      </Reveal>

      <Reveal delay={150}>
        <GlassCard style={{ marginTop: 28 }}>
          <div key={tab.id} style={{ animation: "maFade 420ms cubic-bezier(0.16,1,0.3,1)" }}>
            <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: 32 }}>
              <div>
                <h3
                  className="font-bold"
                  style={{ fontSize: 23, lineHeight: 1.25, letterSpacing: "-0.02em", color: t.text }}
                >
                  {tab.headline}
                </h3>
                <p style={{ marginTop: 14, fontSize: 15, lineHeight: 1.65, color: t.muted }}>
                  {tab.copy}
                </p>
                <div style={{ marginTop: 22 }}>
                  <OutlineButton icon={ArrowRight}>Browse {tab.label.toLowerCase()}</OutlineButton>
                </div>
              </div>

              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3" style={{ gap: 16 }}>
                {tab.items.map((it) => (
                  <div
                    key={it.title}
                    className="rounded-2xl"
                    style={{
                      padding: 18,
                      background: t.ghostHover,
                      border: `1px solid ${t.border}`,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      minHeight: 138,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15.5, color: t.text, lineHeight: 1.3 }}>
                        {it.title}
                      </div>
                      <div style={{ fontSize: 13, color: t.muted, marginTop: 8 }}>{it.meta}</div>
                    </div>
                    <span
                      className="rounded-full"
                      style={{
                        alignSelf: "flex-start",
                        marginTop: 16,
                        padding: "4px 10px",
                        fontSize: 12,
                        fontWeight: 600,
                        color: t.chipText,
                        background: t.chipBg,
                        border: `1px solid ${t.chipBorder}`,
                      }}
                    >
                      {it.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>
      </Reveal>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  H. FOOTER                                                          */
/* ------------------------------------------------------------------ */

const FOOTER_COLS = [
  { title: "Platform", links: ["Assessments", "Sandbox Pro", "AI proctoring", "Integrations"] },
  { title: "Programs", links: ["NCET", "NCET Plus", "Courses", "Hackathons"] },
  { title: "Company", links: ["About", "Careers", "Partners", "Contact"] },
];

function Footer() {
  const { t } = useTheme();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const subscribe = () => {
    if (!email.trim() || !email.includes("@")) return;
    setSent(true);
    setEmail("");
    setTimeout(() => setSent(false), 2600);
  };

  return (
    <footer
      className="backdrop-blur-md"
      style={{
        background: t.footerBg,
        borderTop: `1px solid ${t.border}`,
        marginTop: 40,
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "56px 24px 32px" }}>
        <div className="grid grid-cols-1 lg:grid-cols-5" style={{ gap: 36 }}>
          <div className="lg:col-span-2">
            <div style={{ fontWeight: 800, fontSize: 19, letterSpacing: "-0.02em" }}>
              <GradientText>MyAnatomy</GradientText>
              <span style={{ color: t.muted, fontWeight: 600 }}>.ai</span>
            </div>
            <p style={{ marginTop: 12, fontSize: 14.5, lineHeight: 1.65, color: t.muted, maxWidth: 360 }}>
              Assessment, proctoring, and certification infrastructure for the people who hire
              engineers and the people who want to be hired.
            </p>

            <div style={{ marginTop: 22, maxWidth: 380 }}>
              <label style={{ fontSize: 13.5, color: t.text, fontWeight: 600 }}>
                Monthly product notes
              </label>
              <div className="flex" style={{ gap: 8, marginTop: 8 }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") subscribe();
                  }}
                  placeholder="you@company.com"
                  className="rounded-full"
                  style={{
                    flex: 1,
                    padding: "11px 16px",
                    fontSize: 14,
                    color: t.text,
                    background: t.ghostHover,
                    border: `1px solid ${t.border}`,
                    outline: "none",
                  }}
                />
                <PrimaryButton onClick={subscribe}>Subscribe</PrimaryButton>
              </div>
              <div style={{ fontSize: 12.5, color: sent ? t.accent : t.faint, marginTop: 8 }}>
                {sent ? "Subscribed. First note lands next month." : "One email a month. Unsubscribe any time."}
              </div>
            </div>
          </div>

          {FOOTER_COLS.map((col) => (
            <div key={col.title}>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: t.text }}>{col.title}</div>
              <ul style={{ listStyle: "none", padding: 0, marginTop: 14 }}>
                {col.links.map((l) => (
                  <li key={l} style={{ padding: "6px 0" }}>
                    <a
                      href="#top"
                      style={{ fontSize: 14, color: t.muted, textDecoration: "none" }}
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="flex flex-wrap items-center justify-between"
          style={{
            marginTop: 44,
            paddingTop: 22,
            borderTop: `1px solid ${t.border}`,
            gap: 16,
          }}
        >
          <div style={{ fontSize: 13, color: t.faint }}>
            © 2026 MyAnatomy Innovation Pvt. Ltd. · Privacy · Terms · Proctoring data policy
          </div>
          <div className="flex items-center" style={{ gap: 10 }}>
            {[Github, Linkedin, Twitter].map((Icon, i) => (
              <a
                key={i}
                href="#top"
                aria-label="Social link"
                className="inline-flex items-center justify-center rounded-full"
                style={{
                  width: 36,
                  height: 36,
                  color: t.muted,
                  border: `1px solid ${t.border}`,
                }}
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

/* ------------------------------------------------------------------ */
/*  ROOT                                                               */
/* ------------------------------------------------------------------ */

export default function MyAnatomyPortal() {
  const [theme, setTheme] = useState("dark");
  const t = TOKENS[theme];

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(theme);
    root.style.colorScheme = theme;
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((v) => (v === "dark" ? "light" : "dark"));
  }, []);

  const ctx = useMemo(() => ({ t, theme, toggle }), [t, theme, toggle]);

  return (
    <ThemeCtx.Provider value={ctx}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        @keyframes maFade {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        ::selection { background: ${t.accent}; color: #fff; }
        a:focus-visible, button:focus-visible, input:focus-visible {
          outline: 2px solid ${t.accent};
          outline-offset: 2px;
        }
        input::placeholder { color: ${t.faint}; }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

      <ClientOnly>
        <MoleculeField />
      </ClientOnly>

      <div
        style={{
          minHeight: "100vh",
          fontFamily: FONT_UI,
          color: t.text,
          background: "transparent",
          transition: "color 300ms ease",
        }}
      >
        <Navbar />
        <main>
          <Hero />
          <CandidateHub />
          <AssessmentsEngine />
          <NcetSection />
          <SandboxPro />
          <Ecosystem />
        </main>
        <Footer />
      </div>
    </ThemeCtx.Provider>
  );
}
