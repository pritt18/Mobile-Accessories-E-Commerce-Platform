/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#edf9ff',
          100: '#d7f1ff',
          200: '#b8e6ff',
          300: '#86d7ff',
          400: '#00c6ff', // Neon Cyan accent from Mobixia logo
          500: '#0072ff', // Electric Sapphire Blue
          600: '#0057e0',
          700: '#0044b5',
          800: '#023994',
          900: '#073278',
          950: '#031c49',
        },
        dark: {
          800: '#151b29',
          850: '#0f1422',
          900: '#090d16',
          950: '#05070c',
        },
        cyber: {
          cyan: '#00f0ff',
          blue: '#0066ff',
          glow: 'rgba(0, 198, 255, 0.4)',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neon-blue': '0 0 20px -3px rgba(0, 114, 255, 0.5), 0 0 10px -2px rgba(0, 198, 255, 0.4)',
        'neon-cyan': '0 0 25px -4px rgba(0, 198, 255, 0.6)',
        'card-glow': '0 10px 30px -10px rgba(0, 114, 255, 0.25)',
      },
    },
  },
  plugins: [],
}
