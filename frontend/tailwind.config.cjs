/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 18px 45px rgba(0, 0, 0, 0.22)',
      },
    },
  },
  plugins: [],
};