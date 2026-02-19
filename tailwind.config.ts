import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: "#7C3AED",
          "purple-light": "#A78BFA",
          "purple-dark": "#5B21B6",
          "purple-deeper": "#4C1D95",
          black: "#0A0A0F",
          "black-2": "#111118",
          "black-3": "#18181F",
          "black-4": "#1E1E28",
          "black-5": "#252530",
          border: "#2D2D3A",
          "border-light": "#3D3D50",
          text: "#E2E2F0",
          muted: "#8888A8",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "purple-glow": "0 0 20px rgba(124, 58, 237, 0.3)",
        "purple-glow-lg": "0 0 40px rgba(124, 58, 237, 0.4)",
        card: "0 4px 24px rgba(0,0,0,0.4)",
      },
    },
  },
  plugins: [],
};

export default config;
