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
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          purple: "#9146FF",
          red: "#FF0000",
          dark: "#0b0e14",
          card: "#141a26",
          border: "#1f2637",
          accent: "#38bdf8",
        },
      },
    },
  },
  plugins: [],
};
export default config;
