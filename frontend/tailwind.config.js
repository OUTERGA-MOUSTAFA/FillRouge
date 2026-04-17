/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/**/*.{js,jsx,tsx}",
    "./pages/**/**/*.{jsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f7f5',
          100: '#ccefeb',
          200: '#99dfd7',
          300: '#66cfc3',
          400: '#33bfaf',
          500: '#00BBA7',
          600: '#009966',
          700: '#00734d',
          800: '#004d33',
          900: '#00261a',
        },
        teal: {
          50: '#e6fcf8',
          100: '#ccf9f1',
          200: '#99f3e3',
          300: '#66edd5',
          400: '#33e7c7',
          500: '#4FD1C5',
          600: '#3fa79e',
          700: '#2f7d76',
          800: '#20544f',
          900: '#102a27',
        },
      },
    },
  },
  plugins: [],
}