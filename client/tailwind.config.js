/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        warning: {
          100: '#fef9c3',
          200: '#fed7aa',
          500: '#eab308',
          600: '#ca8a04',
        },
      },
    },
  },
  plugins: [],
};
