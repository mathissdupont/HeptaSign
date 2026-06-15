import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#18212f",
        muted: "#657181",
        line: "#d7dfe7",
        brand: "#0f766e",
        brandDark: "#115e59",
        accent: "#b45309",
        panel: "#ffffff",
        canvas: "#f5f7f8"
      }
    }
  },
  plugins: []
};

export default config;
