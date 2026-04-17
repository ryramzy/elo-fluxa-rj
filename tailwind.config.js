/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        elo: {
          black: '#111111',
          blue: '#5BA4F5',
          green: '#22C55E',
          yellow: '#FACC15',
          white: '#FFFFFF',
          'gray-50': '#F8F9FA',
          'gray-100': '#E5E7EB',
          'gray-200': '#D1D5DB',
          'gray-300': '#9CA3AF',
          'gray-400': '#6B7280',
          'gray-500': '#374151',
        }
      },
      fontFamily: {
        heading: ['Plus Jakarta Sans', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      fontWeight: {
        'display': '900',
      },
      letterSpacing: {
        'elo': '0.025em',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        'elo': '8px',
        'elo-lg': '12px',
        'elo-sm': '6px',
      },
    },
  },
  plugins: [],
}
