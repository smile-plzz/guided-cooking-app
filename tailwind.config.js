/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Warm neutral ground — everything sits on this.
        stone: {
          50: '#FBF8F5',
          100: '#F4EFE9',
          200: '#E7DFD5',
          300: '#D3C7B8',
          400: '#AFA093',
          500: '#877A6E',
          600: '#665C53',
          700: '#4A423C',
          800: '#2F2A26',
          900: '#1D1917',
          950: '#131110',
        },
        // Primary: a cooked-terracotta that reads as appetite, not alarm.
        ember: {
          50: '#FDF3EF',
          100: '#FAE2D8',
          200: '#F4C2AF',
          300: '#EC9B7E',
          400: '#E27353',
          500: '#D25334',
          600: '#B84027',
          700: '#963022',
          800: '#762A21',
          900: '#5E251E',
        },
        // Secondary accents: saffron for highlights, herb for success/veg.
        saffron: {
          100: '#FEF1D6',
          300: '#F8CE70',
          500: '#EFA92C',
          600: '#D28D12',
          700: '#A66C0D',
        },
        herb: {
          100: '#E1F0E6',
          300: '#8CC7A1',
          500: '#3F8F5F',
          600: '#2F7049',
          700: '#255839',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
        bengali: ['"Hind Siliguri"', 'Inter', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        card: '0 1px 2px rgba(29,25,23,0.04), 0 8px 24px -12px rgba(29,25,23,0.16)',
        lift: '0 2px 4px rgba(29,25,23,0.05), 0 18px 40px -16px rgba(29,25,23,0.28)',
        inset: 'inset 0 1px 0 rgba(255,255,255,0.6)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
        shimmer: 'shimmer 1.6s infinite',
      },
    },
  },
  plugins: [],
};
