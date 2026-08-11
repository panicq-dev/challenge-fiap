import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { darkColors, lightColors, type ThemeColors } from "../theme/colors";

export type ThemeMode = "light" | "dark";

interface ThemeContextValue {
  mode: ThemeMode;
  colors: ThemeColors;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>("light");

  const value = useMemo(
    () => ({
      mode,
      colors: mode === "dark" ? darkColors : lightColors,
      toggleTheme: () => setMode((current) => (current === "light" ? "dark" : "light")),
    }),
    [mode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
