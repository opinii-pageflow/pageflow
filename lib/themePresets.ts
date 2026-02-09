
import { Theme } from '../types';

export const themePresets: Record<string, Theme> = {
  "Minimal Dark": {
    primary: "#ffffff",
    backgroundType: "solid",
    backgroundValue: "#0a0a0a",
    cardBg: "rgba(255, 255, 255, 0.05)",
    text: "#ffffff",
    muted: "#9ca3af",
    border: "rgba(255, 255, 255, 0.1)",
    radius: "12px",
    shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    buttonStyle: "solid"
  },
  "Azul Premium": {
    primary: "#3b82f6",
    backgroundType: "gradient",
    backgroundValue: "#1e3a8a",
    backgroundValueSecondary: "#0f172a",
    backgroundDirection: "to bottom",
    cardBg: "rgba(255, 255, 255, 0.1)",
    text: "#ffffff",
    muted: "#cbd5e1",
    border: "rgba(255, 255, 255, 0.1)",
    radius: "16px",
    shadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    buttonStyle: "glass"
  },
  "Neon Roxo": {
    primary: "#a855f7",
    backgroundType: "solid",
    backgroundValue: "#0f011a",
    cardBg: "rgba(168, 85, 247, 0.05)",
    text: "#ffffff",
    muted: "#c084fc",
    border: "rgba(168, 85, 247, 0.2)",
    radius: "8px",
    shadow: "0 0 20px rgba(168, 85, 247, 0.3)",
    buttonStyle: "outline"
  },
  "Verde Moderno": {
    primary: "#10b981",
    backgroundType: "gradient",
    backgroundValue: "#064e3b",
    backgroundValueSecondary: "#022c22",
    backgroundDirection: "135deg",
    cardBg: "rgba(16, 185, 129, 0.1)",
    text: "#ffffff",
    muted: "#6ee7b7",
    border: "rgba(16, 185, 129, 0.2)",
    radius: "20px",
    shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    buttonStyle: "solid"
  },
  "Warm Gold": {
    primary: "#fbbf24",
    backgroundType: "solid",
    backgroundValue: "#1c1917",
    cardBg: "rgba(251, 191, 36, 0.05)",
    text: "#fafaf9",
    muted: "#d6d3d1",
    border: "rgba(251, 191, 36, 0.2)",
    radius: "4px",
    shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    buttonStyle: "solid"
  },
  "Ocean": {
    primary: "#06b6d4",
    backgroundType: "gradient",
    backgroundValue: "#083344",
    backgroundValueSecondary: "#164e63",
    backgroundDirection: "to top",
    cardBg: "rgba(255, 255, 255, 0.1)",
    text: "#f0f9ff",
    muted: "#7dd3fc",
    border: "rgba(255, 255, 255, 0.05)",
    radius: "24px",
    shadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    buttonStyle: "glass"
  }
};
