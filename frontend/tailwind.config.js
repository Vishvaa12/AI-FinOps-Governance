/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        azure: "#2563EB",
        graphite: "#334155",
        canvas: "#F8FAFC",
        surface: "#FFFFFF",
        surfaceMuted: "#F1F5F9",
        border: "#E2E8F0",
        borderStrong: "#CBD5E1",
        textPrimary: "#0F172A",
        textSecondary: "#475569",
        textMuted: "#64748B",
      },
      boxShadow: {
        panel: "0 1px 2px rgba(15, 23, 42, 0.04)",
        overlay: "0 24px 60px rgba(15, 23, 42, 0.18)",
      },
      fontFamily: {
        sans: ['"Segoe UI"', "Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
