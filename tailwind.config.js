/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          mark: "#5AABCC",
          teal: "#3A7C9D",
        },
        surface: {
          base: "#0c0b0a",
          DEFAULT: "#181614",
          el: "#1e1b18",
          hover: "#242424",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["SF Mono", "Fira Code", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
