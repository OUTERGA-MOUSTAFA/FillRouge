/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef2e8',
          100: '#fde5d1',
          200: '#fbcba3',
          300: '#f9b175',
          400: '#f79747',
          500: '#f57d19',
          600: '#e06b0f',
          700: '#c45a0c',
          800: '#a44a0a',
          900: '#7a3707',
        },
        secondary: {
          50: '#e8f4f8',
          100: '#d1e9f1',
          200: '#a3d3e3',
          300: '#75bdd5',
          400: '#47a7c7',
          500: '#1991b9',
          600: '#147494',
          700: '#0f576f',
          800: '#0a3a4a',
          900: '#051d25',
        },
      },
    },
  },
  plugins: [],
}