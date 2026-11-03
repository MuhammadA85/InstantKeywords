/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./views/**/*.html', './public/main.js', './src/pages.js'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      keyframes: {
        fadeUp: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'none' } },
        stripes: { to: { backgroundPosition: '1rem 0' } },
      },
      animation: {
        'fade-up': 'fadeUp .35s ease both',
        stripes: 'stripes 1s linear infinite',
      },
    },
  },
  plugins: [],
};
