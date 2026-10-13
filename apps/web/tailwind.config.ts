import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        /* DeepMatch QA aliases — keep default sm/md/lg/xl/2xl intact */
        "dm-xxs": "320px",
        "dm-xs": "360px",
        "dm-phone": "390px",
        "dm-phablet": "414px",
        "dm-tablet": "768px",
        "dm-laptop": "1024px",
        "dm-desktop": "1280px",
        "dm-wide": "1440px",
        "dm-fullhd": "1920px",
        "dm-uhd": "2560px",
      },
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
      maxWidth: {
        "dm-app": "var(--dm-frame-app)",
        "dm-wide": "var(--dm-frame-wide)",
        "dm-standard": "var(--dm-frame-standard)",
        "dm-narrow": "var(--dm-frame-narrow)",
        "dm-prose": "var(--dm-frame-prose)",
      },
      spacing: {
        "dm-gutter": "var(--dm-gutter)",
        "dm-sidebar": "var(--dm-sidebar)",
        "dm-header": "var(--dm-header-h)",
        "dm-nav": "var(--dm-mobile-nav-h)",
        "dm-touch": "var(--dm-touch)",
        "dm-safe-b": "var(--dm-safe-bottom)",
        "dm-safe-t": "var(--dm-safe-top)",
      },
      minHeight: {
        touch: "var(--dm-touch)",
      },
      minWidth: {
        touch: "var(--dm-touch)",
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
      fontSize: {
        "dm-display": "var(--dm-text-display)",
        "dm-editorial": "var(--dm-text-editorial)",
      },
      aspectRatio: {
        portrait: "3 / 4",
        "dm-landscape": "16 / 10",
        "dm-video": "16 / 9",
      },
    },
  },
  plugins: [],
} satisfies Config;
