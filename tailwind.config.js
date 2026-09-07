/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#05070B",
        foreground: "#F8FAFC",
        surface: "#0D121D",
        surfaceBorder: "rgba(255, 255, 255, 0.08)",
        neon: {
          cyan: "#22D3EE",
          purple: "#A78BFA",
          pink: "#F472B6",
        },
        brand: {
          purple: "#9146FF",
          red: "#FF0000",
          dark: "#05070B",
          card: "#0D121D",
          border: "rgba(255, 255, 255, 0.08)",
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
