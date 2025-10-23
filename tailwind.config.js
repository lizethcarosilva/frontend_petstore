/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'pet-green': '#2D5016',
        'pet-light-green': '#4A7C59',
        'pet-accent': '#8FBC8F',
      },
    },
  },
  plugins: [],
}
