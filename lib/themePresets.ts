import { Theme } from '../types';

export const themePresets: Record<string, Theme> = {
  "Minimal Dark": {
    primary: "#3B82F6",
    backgroundType: "solid",
    backgroundValue: "#0a0a0a",
    cardBg: "rgba(255, 255, 255, 0.06)",
    text: "#F8FAFC",
    muted: "rgba(248, 250, 252, 0.70)",
    border: "rgba(255, 255, 255, 0.12)",
    radius: "12px",
    shadow: "0 10px 30px rgba(0, 0, 0, 0.35)",
    buttonStyle: "glass"
  },
  "Azul Premium": {
    // Azul premium focado em contraste e leitura
    primary: "#2F6BFF",
    backgroundType: "gradient",
    backgroundValue: "#0B1220",
    backgroundValueSecondary: "#0A2A66",
    backgroundDirection: "to bottom",
    cardBg: "rgba(255, 255, 255, 0.08)",
    text: "#F8FAFC",
    muted: "rgba(248, 250, 252, 0.70)",
    border: "rgba(255, 255, 255, 0.12)",
    radius: "18px",
    shadow: "0 20px 60px rgba(0, 0, 0, 0.35)",
    buttonStyle: "glass"
  },
  "Neon Roxo": {
    primary: "#7C3AED",
    backgroundType: "solid",
    backgroundValue: "#0f011a",
    cardBg: "rgba(124, 58, 237, 0.08)",
    text: "#F8FAFC",
    muted: "rgba(216, 180, 254, 0.85)",
    border: "rgba(124, 58, 237, 0.25)",
    radius: "14px",
    shadow: "0 0 40px rgba(124, 58, 237, 0.35)",
    buttonStyle: "outline"
  },
  "Verde Moderno": {
    primary: "#10B981",
    backgroundType: "gradient",
    backgroundValue: "#064e3b",
    backgroundValueSecondary: "#022c22",
    backgroundDirection: "135deg",
    cardBg: "rgba(16, 185, 129, 0.10)",
    text: "#ECFDF5",
    muted: "rgba(236, 253, 245, 0.75)",
    border: "rgba(16, 185, 129, 0.22)",
    radius: "20px",
    shadow: "0 18px 55px rgba(0,0,0,0.30)",
    buttonStyle: "solid"
  },
  "Warm Gold": {
    primary: "#F59E0B",
    backgroundType: "solid",
    backgroundValue: "#1c1917",
    cardBg: "rgba(245, 158, 11, 0.08)",
    text: "#FFF7ED",
    muted: "rgba(255, 247, 237, 0.72)",
    border: "rgba(245, 158, 11, 0.22)",
    radius: "14px",
    shadow: "0 14px 45px rgba(0,0,0,0.30)",
    buttonStyle: "solid"
  },
  "Ocean": {
    // Outro preset azul (variação oceano) mantendo consistência
    primary: "#38BDF8",
    backgroundType: "gradient",
    backgroundValue: "#071A2B",
    backgroundValueSecondary: "#0B3A8A",
    backgroundDirection: "to top",
    cardBg: "rgba(255, 255, 255, 0.08)",
    text: "#F0F9FF",
    muted: "rgba(240, 249, 255, 0.70)",
    border: "rgba(255, 255, 255, 0.12)",
    radius: "24px",
    shadow: "0 22px 70px rgba(0, 0, 0, 0.35)",
    buttonStyle: "glass"
  }
};
