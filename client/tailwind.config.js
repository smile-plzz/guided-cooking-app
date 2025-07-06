/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2E7D32', // Green
        secondary: '#F5F5F5', // Light gray
        accent1: '#FFB300', // Amber
        accent2: '#0288D1', // Blue
        background: '#FFFFFF', // White
        text: '#212121', // Dark gray
        'text-secondary': '#757575', // Medium gray
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      fontSize: {
        'h1': ['32px', { lineHeight: '1.2', fontWeight: '700' }], // H1: 32px, Bold
        'h2': ['24px', { lineHeight: '1.2', fontWeight: '700' }], // H2: 24px, Bold
        'h3': ['20px', { lineHeight: '1.2', fontWeight: '700' }], // H3: 20px, Bold
        'body': ['16px', { lineHeight: '1.5', fontWeight: '400' }], // Body: 16px, Regular
        'caption': ['14px', { lineHeight: '1.5', fontWeight: '400' }], // Captions/Labels: 14px, Regular
      },
      spacing: {
        '0': '0px',
        '1': '8px',
        '2': '16px',
        '3': '24px',
        '4': '32px',
        '5': '40px',
        '6': '48px',
        '7': '56px',
        '8': '64px',
        '9': '72px',
        '10': '80px',
      },
      letterSpacing: {
        tight: '-0.5px',
        normal: '0px',
        wide: '0.5px',
        wider: '1px',
      },
    },
  },
  plugins: [],
}