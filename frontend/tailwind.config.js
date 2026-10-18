/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#F5F6F4",
        surface: {
          DEFAULT: "#FFFFFF",
          subtle: "#F9FAF9",
          hover: "#F0F2F0",
          active: "#E8EBE9",
        },
        border: {
          DEFAULT: "#DFE5E1",
          subtle: "#EDF1EE",
          strong: "#C5CFC9",
        },
        ink: {
          DEFAULT: "#17211F",
          secondary: "#64716C",
          muted: "#8A9691",
          faint: "#A5B1AC",
          inverse: "#FFFFFF",
        },
        brand: {
          DEFAULT: "#286A61",
          hover: "#20554E",
          subtle: "#EAF3F1",
          border: "#B2D5CE",
        },
        risk: {
          DEFAULT: "#B42318",
          subtle: "#FEF3F2",
          border: "#FECDCA",
          text: "#912018",
        },
        warning: {
          DEFAULT: "#A15C07",
          subtle: "#FEF7EC",
          border: "#FEDF89",
          text: "#824905",
        },
        success: {
          DEFAULT: "#16794B",
          subtle: "#ECFDF3",
          border: "#A6F4C5",
          text: "#11613C",
        },
        graph: {
          neutral: "#9BA7A1",
          subtle: "#F2F5F3",
          border: "#D3DDD7",
        }
      },
      fontFamily: {
        sans: ["'Inter'", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      borderRadius: {
        xs: "4px",
        sm: "6px",
        DEFAULT: "8px",
        md: "8px",
        lg: "10px",
      },
      boxShadow: {
        subtle: "0 1px 3px rgba(23, 33, 31, 0.05)",
        panel: "0 4px 16px -2px rgba(23, 33, 31, 0.08)",
        modal: "0 12px 32px -4px rgba(23, 33, 31, 0.16)",
      }
    },
  },
  plugins: [],
}
