/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-orange': '#FF6D00',
        'accent-purple': '#AA00FF',
        'success-blue': '#00B0FF',
        'bg-dark': '#0F172A',
        'card-bg': '#1E293B',
      },
      borderRadius: {
        'xl-custom': '16px',
      }
    },
  },
  plugins: [],
}