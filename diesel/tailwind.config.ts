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
        "not-quite-black": "#09090A",
        "not-as-black": "#0F0F12",
        "kinda-black": "#111114",
        "nightly-black": "#151618",
        blurple: "#7364FF",
        "dark-blurple": "#3C43B5",
        grayple: "#99aab5",
      },
    },
  },
  plugins: [],
};
export default config;
