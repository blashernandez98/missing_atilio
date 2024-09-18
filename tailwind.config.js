
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        'football-field': "url('/field.svg')",
      }
    },
  },
  plugins: [],
}