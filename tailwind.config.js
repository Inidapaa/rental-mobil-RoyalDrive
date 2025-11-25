/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", "system-ui", "sans-serif"],
      },
      colors: {
        primary: {
          DEFAULT: "#a3e635",
          dark: "#84cc16",
        },
        dark: {
          DEFAULT: "#0a0a0a",
          lighter: "#1a1a1a",
          light: "#252525",
        },
      },
    },
  },
  plugins: [],
};
