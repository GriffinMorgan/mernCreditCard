/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#070C1A',
          900: '#0B1224',
          850: '#101932',
          800: '#131E3A',
          750: '#182547',
          700: '#1E2E57',
        },
        signal: {
          indigo: '#7E8EF7',
          indigoHover: '#6B7DF2',
          coral: '#F85C70',
          coralHover: '#E9495E',
          mint: '#34D399',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 35px -5px rgba(126, 142, 247, 0.25)',
        coralGlow: '0 0 30px -5px rgba(248, 92, 112, 0.3)',
      },
    },
  },
  plugins: [],
};

