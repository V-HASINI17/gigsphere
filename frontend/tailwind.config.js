/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          light: '#fcfcfd',
          dark: '#0a0f1d',
          primary: '#6366f1',
          secondary: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444',
          cardLight: '#ffffff',
          cardDark: '#151e33',
        },
        // Extended slate shades used in dashboards
        slate: {
          750: '#283548',
          850: '#1a2332',
        },
        // Extended indigo shades used in dashboards
        indigo: {
          550: '#6d71f7',
          650: '#4f46e5',
        }
      }
    },
  },
  plugins: [],
}
