import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext({ theme: "dark", setTheme: () => {}, toggleTheme: () => {} });

export const STORAGE_KEY = "myanatomy-theme";

/**
 * Runs before first paint so the <html> class is correct on load — no flash,
 * no hydration mismatch on the class attribute.
 */
export const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem("${STORAGE_KEY}");
    var theme = stored === "light" || stored === "dark"
      ? stored
      : (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
    var root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    root.style.colorScheme = theme;
  } catch (e) {}
})();
`;

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState("dark");

  // Adopt whatever the blocking script already decided.
  useEffect(() => {
    const current = document.documentElement.classList.contains("light") ? "light" : "dark";
    setThemeState(current);
  }, []);

  const setTheme = useCallback((next) => {
    setThemeState(next);
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(next);
    root.style.colorScheme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch (e) {
      /* storage blocked — theme still applies for this session */
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, setTheme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
