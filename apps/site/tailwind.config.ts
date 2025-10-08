import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: ["./app/**/*.{js,jsx,ts,tsx,mdx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: { extend: {} },
  plugins: [typography]
};
export default config;