import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0b1020",
        panel: "#121a2f",
        line: "#27314d",
        text: "#e6e9f5",
        muted: "#96a0c0",
        accent: "#7aa2ff",
        success: "#4ade80",
        warning: "#f59e0b",
        danger: "#ef4444"
      },
      boxShadow: {
        panel: "0 8px 30px rgba(4, 10, 28, 0.45)"
      }
    }
  },
  plugins: []
};

export default config;
