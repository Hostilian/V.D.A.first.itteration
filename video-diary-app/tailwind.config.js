/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#4285F4",
        secondary: "#03A9F4",
        danger: "#FF3B30",
      },
    },
  },
  plugins: [],
};
