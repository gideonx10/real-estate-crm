/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}", "./lib/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#0D1B3E",
        gold: "#C9A84C",
        success: "#22C55E",
        warning: "#F59E0B",
        info: "#3B82F6",
        surface: "#F1F5F9",
      },
    },
  },
};

export default config;
