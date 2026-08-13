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
        brand: {
          50: "#eef1fb",
          100: "#dce3f6",
          200: "#b9c7ed",
          300: "#8fa3e0",
          400: "#647ed0",
          500: "#4760bd",
          600: "#3a4da3",
          700: "#2f3d84",
          800: "#28336c",
          900: "#232c59",
          950: "#181e3f",
        },
        gold: {
          50: "#fdf7e8",
          100: "#faecc4",
          200: "#f3d783",
          300: "#e9bd4c",
          400: "#d9a52e",
          500: "#bd8a1f",
          600: "#976c19",
        },
        correct: {
          bg: "#e3f6ea",
          border: "#2f9e5c",
          text: "#1a7a45",
        },
        wrong: {
          bg: "#fbe9e7",
          border: "#d94f3d",
          text: "#b23b2c",
        },
      },
      fontFamily: {
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-body)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(35,44,89,0.06), 0 8px 24px -12px rgba(35,44,89,0.18)",
        "card-hover": "0 2px 4px rgba(35,44,89,0.08), 0 16px 32px -12px rgba(35,44,89,0.24)",
      },
    },
  },
  plugins: [],
};

export default config;
