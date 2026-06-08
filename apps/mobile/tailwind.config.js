/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}', './app/**/*.{js,ts,jsx,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        clutch: {
          50: '#f0f0ff',
          100: '#e4e4ff',
          500: '#6355f5',
          600: '#5240e8',
          700: '#4530d4',
        },
      },
      fontFamily: {
        sans: ['Poppins_400Regular'],
        medium: ['Poppins_500Medium'],
        bold: ['Poppins_700Bold'],
      },
    },
  },
  plugins: [],
}
