
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        'football-field': "url('/field.svg')",
      },
      keyframes: {
        'scale-in': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'slide-down': {
          '0%': {
            transform: 'translateY(-100%)',
            opacity: '0',
            maxHeight: '0'
          },
          '100%': {
            transform: 'translateY(0)',
            opacity: '1',
            maxHeight: '500px'
          },
        },
      },
      animation: {
        'scale-in': 'scale-in 0.3s ease-out',
        'slide-down': 'slide-down 0.4s ease-out',
      },
    },
  },
  plugins: [],
}