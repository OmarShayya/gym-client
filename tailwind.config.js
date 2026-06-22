// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#fffef7",
          100: "#fffde6",
          200: "#fff9c4",
          300: "#fff59d",
          400: "#ffee58",
          500: "#ffd700", // Pure gold (matches the logo + @theme)
          600: "#fbc02d",
          700: "#f9a825",
          800: "#f57f17",
          900: "#f57c00",
          950: "#e65100",
          DEFAULT: "#ffd700",
        },
        dark: {
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#111827",
          950: "#0a0a0a",
          DEFAULT: "#0a0a0a",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Bebas Neue", "sans-serif"],
      },
    },
  },
};
