import { useEffect, useState } from "react";

/**
 * Renders children only after hydration. Keeps WebGL (window/document access)
 * out of the server render.
 */
export function ClientOnly({ children, fallback = null }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? <>{children}</> : fallback;
}
