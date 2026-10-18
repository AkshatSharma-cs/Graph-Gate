/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ground: "#08090A",
        surface: {
          50: "#0F1012",
          100: "#141518",
          200: "#1A1B20",
          300: "#22242B",
          400: "#2C2E38",
        },
        hairline: {
          DEFAULT: "rgba(255, 255, 255, 0.08)",
          subtle: "rgba(255, 255, 255, 0.04)",
          strong: "rgba(255, 255, 255, 0.16)",
        },
        linear: {
          DEFAULT: "#5E6AD2",
          hover: "#6F7BE2",
          subtle: "rgba(94, 106, 210, 0.12)",
        },
        signal: {
          red: "#EF4444",
          "red-subtle": "rgba(239, 68, 68, 0.12)",
          "red-glow": "rgba(239, 68, 68, 0.25)",
          amber: "#F59E0B",
          "amber-subtle": "rgba(245, 158, 11, 0.12)",
          green: "#10B981",
          "green-subtle": "rgba(16, 185, 129, 0.12)",
          blue: "#38BDF8",
          "blue-subtle": "rgba(56, 189, 248, 0.12)",
        },
        ink: {
          DEFAULT: "#F3F4F6",
          secondary: "#9CA3AF",
          muted: "#6B7280",
          faint: "#4B5563",
        }
      },
      fontFamily: {
        sans: ["'Inter Tight'", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        body: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        tighter: "-0.035em",
        tight: "-0.02em",
      },
      borderRadius: {
        xs: "4px",
        sm: "6px",
        DEFAULT: "8px",
        md: "10px",
        lg: "12px",
        xl: "14px",
      },
      boxShadow: {
        subtle: "0 1px 2px rgba(0, 0, 0, 0.4)",
        panel: "0 4px 16px -2px rgba(0, 0, 0, 0.6)",
        glow: "0 0 16px rgba(94, 106, 210, 0.18)",
        "red-glow": "0 0 20px rgba(239, 68, 68, 0.22)",
      }
    },
  },
  plugins: [],
}
