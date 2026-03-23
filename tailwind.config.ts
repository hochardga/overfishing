import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        "primary-hover": "var(--color-primary-hover)",
        secondary: "var(--color-secondary)",
        accent: "var(--color-accent)",
        background: "var(--color-background)",
        surface: "var(--color-surface)",
        "surface-raised": "var(--color-surface-raised)",
        industrial: "var(--color-industrial)",
        text: "var(--color-text)",
        "text-muted": "var(--color-text-muted)",
        border: "var(--color-border)",
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        error: "var(--color-error)",
      },
      fontFamily: {
        heading: ["var(--font-heading)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      spacing: {
        1: "var(--space-4)",
        2: "var(--space-8)",
        3: "var(--space-12)",
        4: "var(--space-16)",
        6: "var(--space-24)",
        8: "var(--space-32)",
        12: "var(--space-48)",
        16: "var(--space-64)",
        24: "var(--space-96)",
      },
      borderRadius: {
        sm: "8px",
        xl: "16px",
        "2xl": "24px",
      },
      boxShadow: {
        soft: "0 20px 40px rgba(138, 80, 47, 0.06)",
      },
      maxWidth: {
        shell: "1440px",
      },
      transitionTimingFunction: {
        settled: "cubic-bezier(0.2, 0.8, 0.2, 1)",
      },
    },
  },
  plugins: [],
} satisfies Config;
