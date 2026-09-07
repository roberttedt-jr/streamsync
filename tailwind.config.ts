import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0B0F14",
        foreground: "#F3F4F6",
        surface: "#0F141C",
        surfaceBorder: "#1F2937",
        neon: {
          cyan: "#22D3EE",
          purple: "#A78BFA",
          pink: "#F472B6",
        },
        brand: {
          purple: "#9146FF",
          red: "#FF0000",
          dark: "#0B0F14",
          card: "#0F141C",
          border: "#1F2937",
          accent: "#22D3EE",
        },
      },
      boxShadow: {
        "glow-cyan": "0 0 25px -5px rgba(34, 211, 238, 0.35)",
        "glow-purple": "0 0 25px -5px rgba(167, 139, 250, 0.35)",
        "glow-pink": "0 0 25px -5px rgba(244, 114, 182, 0.35)",
      },
    },
  },
  plugins: [],
};
export default config;
