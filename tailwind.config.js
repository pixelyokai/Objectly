/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Open Runde"', "system-ui", "sans-serif"],
      },
      colors: {
        brand: { DEFAULT: "#0C39F3", hover: "#0A2FCC" },
      },
      boxShadow: {
        surface: "0 1px 2px rgb(0 0 0 / 0.12), 0 0 0 1px rgb(0 0 0 / 0.08)",
        "surface-dark": "0 1px 2px rgb(0 0 0 / 0.4), 0 0 0 1px rgb(255 255 255 / 0.10)",
        panel: "0 6px 6px -3px rgb(0 0 0 / 0.04), 0 12px 12px -6px rgb(0 0 0 / 0.04), 0 0 0 1px rgb(39 39 42 / 0.10)",
        "panel-dark": "0 6px 6px -3px rgb(255 255 255 / 0.04), 0 12px 12px -6px rgb(0 0 0 / 0.04), 0 0 0 1px rgb(255 255 255 / 0.10)",
      },
    },
  },
  plugins: [],
};
