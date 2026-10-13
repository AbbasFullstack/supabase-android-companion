/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        carbon: {
          50: '#f6f6f7',
          100: '#e1e1e4',
          200: '#c5c5cb',
          300: '#a3a3ad',
          400: '#7c7c8a',
          500: '#5c5c6b',
          600: '#3e3e4a',
          700: '#262630',
          800: '#181820',
          900: '#101016',
          950: '#0a0a0e',
        },
        supa: {
          green: '#3ecf8e',
          glow: 'rgba(62, 207, 142, 0.25)',
          dark: '#1e3a2f',
          light: '#70e5b0'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      boxShadow: {
        'glow': '0 0 25px -5px rgba(62, 207, 142, 0.25)',
        'carbon': '0 10px 30px -10px rgba(0, 0, 0, 0.7)',
      }
    },
  },
  plugins: [],
}
