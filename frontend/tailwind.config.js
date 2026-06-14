/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",

  theme: {
    extend: {
      colors: {
        dark: {
          bg: "#0B0C10",
          card: "rgba(18, 20, 36, 0.65)",
          border: "rgba(255,255,255,0.08)",
          surface: "#121424",
          surfaceHover: "#1B1E32",
          text: "#F8FAFC",
          muted: "#94A3B8",
        },

        light: {
          bg: "#F8FAFC",
          card: "rgba(255,255,255,0.75)",
          border: "rgba(0,0,0,0.06)",
          surface: "#FFFFFF",
          surfaceHover: "#F1F5F9",
          text: "#0F172A",
          muted: "#64748B",
        },

        brand: {
          purple: "#A855F7",
          teal: "#06B6D4",
          blue: "#6366F1",
          rose: "#F43F5E",
          emerald: "#10B981",
        },
      },

      fontFamily: {
        title: ["Outfit", "Inter", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },

      backdropBlur: {
        xs: "2px",
      },

      boxShadow: {
        glow: "0 0 25px rgba(168,85,247,0.25)",
        "glow-teal": "0 0 25px rgba(6,182,212,0.25)",
      },
    },
  },

  plugins: [],
};