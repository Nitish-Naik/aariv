/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Primary/Accent palette — Slate-blue
        primary: {
          50: "#f0f1f5",
          100: "#dfe1ea",
          200: "#c4c8d6",
          300: "#a8aec2",
          400: "#99a0b9",
          500: "#8b95b0",
          600: "#7b84a0",
          700: "#6b7490",
          800: "#545c73",
          900: "#3d4356",
        },
        // Neutral grays — warm-toned
        neutral: {
          50: "#f7f6f4",
          100: "#f0efed",
          200: "#e4e2df",
          300: "#d4d1cd",
          400: "#a5a19d",
          500: "#908c88",
          600: "#6a6662",
          700: "#5a5754",
          800: "#3a3836",
          900: "#1a1918",
        },
        // Semantic
        success: "#7eb88a",
        warning: "#c6a27a",
        error: "#c45c5c",
        info: "#8b95b0",
        // Dark theme surfaces
        "dark-bg": "#0c0c0e",
        "dark-surface": "#141416",
        "dark-elevated": "#1a1a1d",
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", '"Times New Roman"', "serif"],
        sans: [
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
