/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#6D5BFF',
          hover: '#5742ff',
          muted: '#c9c2ff',
        },
        surface: {
          DEFAULT: '#0f172a',
          raised: '#1b2540',
          muted: '#202b4c',
        },
        success: '#46d6a0',
        warning: '#f7c948',
        danger: '#f56565',
      },
      boxShadow: {
        'brand-glow': '0 20px 45px rgba(109, 91, 255, 0.35)',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}

