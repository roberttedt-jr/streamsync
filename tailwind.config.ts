import type { Config } from "tailwindcss";

const tailwindConfig: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0b0e14",
        surface: "#121721",
        surfaceBorder: "#232b3b",
        brand: {
          purple: "#9146ff",
          red: "#ff0033",
          accent: "#5865f2",
        },
      },
    },
  },
  plugins: [],
};

export default tailwindConfig;
