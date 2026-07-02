import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1E40AF",
          light: "#3B82F6",
        },
        accent: { DEFAULT: "#D97706" },
        success: { DEFAULT: "#059669" },
        domain: {
          purple: "#7C3AED",
        },
      },
      fontFamily: {
        heading: ["Crimson Pro", "serif"],
        body: ["Atkinson Hyperlegible", "sans-serif"],
      },
      maxWidth: {
        content: "1400px",
      },
      borderRadius: {
        card: "12px",
        "card-lg": "20px",
      },
    },
  },
  plugins: [],
};

export default config;
