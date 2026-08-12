export interface ThemeColors {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  background: string;
  cardBackground: string;
  surface: string;
  white: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  cardShadow: string;
  tabInactive: string;
  danger: string;
}

export const lightColors: ThemeColors = {
  primary: "#2563EB",
  primaryDark: "#1D4ED8",
  primaryLight: "#3B82F6",
  background: "#F8FAFC",
  cardBackground: "#FFFFFF",
  surface: "#F8FAFC",
  white: "#FFFFFF",
  text: "#0F172A",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",
  border: "#E2E8F0",
  cardShadow: "#000000",
  tabInactive: "#94A3B8",
  danger: "#DC2626",
};

export const darkColors: ThemeColors = {
  primary: "#60A5FA",
  primaryDark: "#3B82F6",
  primaryLight: "#93C5FD",
  background: "#0F172A",
  cardBackground: "#111827",
  surface: "#111827",
  white: "#FFFFFF",
  text: "#F8FAFC",
  textSecondary: "#CBD5E1",
  textMuted: "#94A3B8",
  border: "#334155",
  cardShadow: "#000000",
  tabInactive: "#94A3B8",
  danger: "#F87171",
};

export const colors = lightColors;
