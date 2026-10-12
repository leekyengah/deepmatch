import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        dm: {
          primary: "var(--dm-primary)",
          blush: "var(--dm-blush)",
          canvas: "var(--dm-canvas)",
          deep: "var(--dm-deep)",
          raspberry: "var(--dm-raspberry)",
          champagne: "var(--dm-champagne)",
          gold: "var(--dm-gold)",
          ink: "var(--dm-ink)",
          muted: "var(--dm-muted)",
          line: "var(--dm-line)",
          panel: "var(--dm-panel)",
          surface: "var(--dm-surface)",
          good: "var(--dm-good)",
          danger: "var(--dm-danger)",
        },
      },
      borderRadius: {
        dm: "var(--dm-radius-md)",
        "dm-lg": "var(--dm-radius-lg)",
        "dm-xl": "var(--dm-radius-xl)",
      },
      boxShadow: {
        dm: "var(--dm-shadow)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        editorial: ["var(--font-editorial)", "Georgia", "serif"],
        body: ["var(--font-body)", "Be Vietnam Pro", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
