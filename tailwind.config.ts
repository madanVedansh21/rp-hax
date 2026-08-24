import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Brand & Accent (design.md)
        brand: {
          black: "#000000",
          nearblack: "#17171c",
          green: "#003c33",
          navy: "#071829",
          blue: "#1863dc",
          coral: "#ff7759",
          "coral-soft": "#ffad9b",
        },
        // Surface & Background
        surface: {
          canvas: "#ffffff",
          stone: "#eeece7",
          "pale-green": "#edfce9",
          "pale-blue": "#f1f5ff",
          "card-border": "#f2f2f2",
        },
        // Text & Rules
        ink: {
          DEFAULT: "#212121",
          muted: "#93939f",
          slate: "#75758a",
        },
        rule: {
          hairline: "#d9d9dd",
          light: "#e5e7eb",
        },
        // Semantic
        focus: {
          blue: "#4c6ee6",
          violet: "#9b60aa",
        },
      },
      fontFamily: {
        display: ["Space Grotesk", "Inter", "ui-sans-serif", "system-ui"],
        body: ["Inter", "Arial", "ui-sans-serif", "system-ui"],
        mono: ["JetBrains Mono", "Fira Code", "ui-monospace", "monospace"],
      },
      borderRadius: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "22px",
        xl: "30px",
        pill: "32px",
        full: "9999px",
      },
    },
  },
  plugins: [],
};
export default config;
