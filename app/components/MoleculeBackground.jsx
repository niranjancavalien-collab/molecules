import { lazy, Suspense, useEffect, useState } from "react";

import { ClientOnly } from "~/components/ClientOnly";
import { useTheme } from "~/components/ThemeProvider";

// three.js is ~600 kB — keep it out of the initial bundle.
const ParticleCanvas = lazy(() => import("~/components/ParticleCanvas"));

const SURFACE = {
  dark: {
    color: "#0B0F19",
    wash: "radial-gradient(1100px 620px at 50% -5%, rgba(56,189,248,0.16), transparent 70%)",
  },
  light: {
    color: "#F8FAFC",
    wash: "radial-gradient(1100px 620px at 50% -5%, rgba(2,132,199,0.12), transparent 70%)",
  },
};

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return reduced;
}

export function MoleculeBackground() {
  // R3F runs its own reconciler, so React context does not cross the Canvas
  // boundary — the theme is read here and passed down as a prop.
  const { theme } = useTheme();
  const reducedMotion = usePrefersReducedMotion();
  const surface = SURFACE[theme] ?? SURFACE.dark;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 transition-colors duration-500"
      style={{ backgroundColor: surface.color }}
    >
      <ClientOnly>
        <Suspense fallback={null}>
          <ParticleCanvas theme={theme} reducedMotion={reducedMotion} />
        </Suspense>
      </ClientOnly>
      <div className="pointer-events-none absolute inset-0" style={{ background: surface.wash }} />
    </div>
  );
}
