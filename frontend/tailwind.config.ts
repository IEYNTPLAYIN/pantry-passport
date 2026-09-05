import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "var(--color-canvas)",
        ink: "var(--color-ink)",
        mellow: "var(--color-mellow)",
        meadow: "var(--color-meadow)",
        oat: "var(--color-oat)",
        peach: "var(--color-peach)",
      },
      borderRadius: {
        card: "1.5rem",
      },
      boxShadow: {
        soft: "0 20px 60px rgba(18, 53, 36, 0.12)",
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
